// notes/ml/ml_naivebayes.js — Naive Bayes
Object.assign(TOPIC_CONTENT, {
  "ml_naivebayes": `<main>
  <h1>Naive Bayes</h1>
  <div class="where"><span>Machine Learning</span><span>Classification</span><span>Naive Bayes</span></div>
  <p class="lead">Naive Bayes classifies by counting. It learns how often each clue (a word, a sender type, a length) appears in each class, then flips those counts into P(class | clues) with Bayes' theorem, treating the clues as independent. This note builds a tiny SMS spam filter completely by hand on eight messages: Bayes' theorem, the naive assumption and why it still works, Multinomial NB with Laplace smoothing, log-probabilities against underflow, Bernoulli NB, Gaussian NB with means and variances, mixing feature types, the hidden linear model inside NB, its (often poor) calibration, every sklearn class, and a from-scratch version that matches sklearn exactly.</p>

  <h2 id="nb-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_classification">Logistic Regression</a> and <a class="xref" data-note="st_probability">Probability</a></b><span>Logistic regression opened the Classification group: it outputs P(class | x) by fitting weights with gradient descent on log-loss. That needs enough data to estimate every weight, and an optimiser. Probability gave us conditional probability and Bayes' theorem. The open question: can we get P(class | x) with no optimisation at all, from simple counts, and from very few examples?</span></li>
    <li><b>This note adds: the generative route to P(class | x)</b><span>Model how each class <em>produces</em> its clues, P(x | class), assume the clues are independent within a class, and combine with Bayes' theorem. Training is a single pass of counting; prediction is a sum of logs.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_knn">K-Nearest Neighbors</a> and beyond</b><span>NB and logistic regression both draw (mostly) straight boundaries. <a class="xref" data-note="ml_knn">KNN</a> drops all modelling and asks the nearest neighbours, so boundaries can take any shape; <a class="xref" data-note="ml_svm">SVM</a> chases the widest margin. NB's over-confident probabilities are the classic motivation for <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>, and its word counts reappear in text work (<a class="xref" data-note="nlp">NLP Foundations</a>: bag of words, TF-IDF).</span></li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 680 210" width="680">
<defs><marker id="nb-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="10" width="640" height="190" rx="12" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.5"/>
<text x="34" y="28" class="tm" font-size="11.5">CLASSIFICATION GROUP</text>
<rect x="250" y="22" width="180" height="46" rx="8" class="ft st"/>
<text x="340" y="41" text-anchor="middle" font-size="12.5">Logistic Regression</text><text x="340" y="58" text-anchor="middle" class="tm" font-size="11">fit P(y|x) directly</text>
<line x1="300" y1="68" x2="130" y2="118" stroke="currentColor" marker-end="url(#nb-fa)"/>
<line x1="340" y1="68" x2="340" y2="118" stroke="currentColor" marker-end="url(#nb-fa)"/>
<line x1="380" y1="68" x2="550" y2="118" stroke="currentColor" marker-end="url(#nb-fa)"/>
<rect x="40" y="120" width="180" height="54" rx="8" class="fb sb" stroke-width="3"/>
<text x="130" y="141" text-anchor="middle" font-size="14" font-weight="700">Naive Bayes</text><text x="130" y="160" text-anchor="middle" class="tb" font-size="11">YOU ARE HERE · count P(x|y)</text>
<rect x="250" y="120" width="180" height="54" rx="8" class="ft st"/>
<text x="340" y="141" text-anchor="middle" font-size="12.5">K-Nearest Neighbors</text><text x="340" y="160" text-anchor="middle" class="tm" font-size="11">ask the neighbours</text>
<rect x="460" y="120" width="180" height="54" rx="8" class="ft st"/>
<text x="550" y="141" text-anchor="middle" font-size="12.5">Support Vector Machines</text><text x="550" y="160" text-anchor="middle" class="tm" font-size="11">widest margin</text>
<line x1="220" y1="147" x2="248" y2="147" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#nb-fa)"/>
<text x="130" y="192" text-anchor="middle" class="tm" font-size="10.5">generative twin of logistic regression</text>
</svg><figcaption>Naive Bayes sits beside logistic regression: both output P(class | x) with near-linear boundaries, but NB models how each class generates the data (generative), while logistic regression models the class given the data (discriminative). Read next: KNN.</figcaption></figure>

  <h2 id="nb-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>One running example carries the whole note: <strong>a tiny SMS inbox of eight labelled messages</strong>, four spam and four ham (normal), each with its text, whether the sender is known, whether it was sent at night, the age of the sender's account and its length. The new message to classify is <strong>"free lunch monday"</strong>. Each concept answers the question the previous one left open.</p>
  <ol class="story">
    <li><b>Bayes' theorem</b><span>Q: we know how often spam comes from unknown senders; how likely is a message from an unknown sender to be spam? → flip the conditional: P(spam | unknown) = 0.75. But a real message has many clues at once.</span></li>
    <li><b>Bayes classifier</b><span>Q: how do we use all clues together? → pick the class with the largest P(class)·P(all clues | class). But P(all clues | class) needs a table with millions of cells and we have eight messages.</span></li>
    <li><b>Naive (conditional independence) assumption</b><span>Q: how can we estimate P(all clues | class) from so little data? → multiply one small probability per clue: unknown + night gives 0.90. But what are the "clues" when the input is free text?</span></li>
    <li><b>Multinomial NB</b><span>Q: how do we turn words into probabilities? → count each word per class: P(spam | "free lunch monday") = 0.382. But a word never seen in spam gets probability 0 and vetoes everything.</span></li>
    <li><b>Laplace smoothing</b><span>Q: how do we stop one unseen word from zeroing a class? → add α to every count. But multiplying hundreds of small numbers underflows to 0.</span></li>
    <li><b>Log-probabilities</b><span>Q: how do we compute with numbers like 10⁻¹²⁰⁰? → add logs, normalise with log-sum-exp. But Multinomial NB ignores which words are <em>absent</em>.</span></li>
    <li><b>Bernoulli NB</b><span>Q: what if presence/absence matters more than counts? → model each word as present or absent: 0.292. But age and length are numbers, not counts.</span></li>
    <li><b>Gaussian NB</b><span>Q: how do we handle continuous clues? → a bell curve per feature per class (means and variances): 0.906. But real data mixes words, categories and numbers.</span></li>
    <li><b>Categorical NB and mixing types</b><span>Q: how do we combine all clue types? → add their log-probabilities: 0.96. But what kind of model have we actually built?</span></li>
    <li><b>NB as a linear model</b><span>Q: how does NB relate to logistic regression? → its log-odds are a weighted sum of counts, the same form; NB wins with little data, LR with lots. But are NB's probabilities trustworthy?</span></li>
    <li><b>Calibration</b><span>Q: does "p = 0.999" really mean 99.9%? → no: double-counted clues push probabilities to the extremes (11 confident mistakes vs 0). Calibrate if you need probabilities. But how do we run all this in practice?</span></li>
    <li><b>sklearn, from scratch, when to use</b><span>Q: which class, which settings, can we rebuild it, when is it the right model? → sections 12–16, then the Revision Sheet.</span></li>
  </ol>

  <h2 id="nb-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Naive Bayes</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Bayes' theorem</div>
        <ul>
          <li><b>P(c | x) = P(x | c)·P(c) / P(x)</b>: posterior = likelihood × prior / evidence</li>
          <li>P(x) = Σ_c P(x | c)P(c) (total probability)</li>
          <li>Inbox: P(spam | unknown sender) = 0.375 / 0.5 = 0.75</li>
          <li>💡 Detective: start with a hunch (prior), update with each clue</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The naive assumption</div>
        <ul>
          <li>Clues independent <b>given the class</b>: P(x₁…x_d | c) = Π P(xⱼ | c)</li>
          <li>d counts instead of a 2^d table (2²⁴ = 16.8 M cells for 24 words)</li>
          <li>Unknown + night: 0.281 vs 0.031 → 0.90</li>
          <li>Works for <b>ranking</b> (argmax) even when probabilities are wrong</li>
          <li>⚠ Duplicate clue counted 3× → 0.75 → 0.964</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multinomial &amp; smoothing</div>
        <ul>
          <li>P(w | c) = (count(w, c) + α) / (total words in c + αV)</li>
          <li>V = 24; spam 16 words, ham 15; P(free | spam) = 4/40 = 0.10</li>
          <li>"free lunch monday": 3.13e−5 vs 5.06e−5 → <b>0.382</b></li>
          <li>α → 0: unseen word zeroes the class; α → ∞: prior only (0.5)</li>
          <li>Repeated words count again ("free" ×3 → 0.904)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bernoulli &amp; Gaussian</div>
        <ul>
          <li><b>Bernoulli</b>: P(present | c) = (docs + α)/(n_c + 2α); absent words multiply (1 − p) → 0.292</li>
          <li><b>Gaussian</b>: per class, per feature mean μ and variance σ² (ddof = 0)</li>
          <li>Age 40 days, length 20 → 0.906</li>
          <li>⚠ Tiny variance (spam lengths 0.69) → length 17 drops it to 0.062</li>
          <li>Categorical NB: counts per category; mix types by adding log-probs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Computing safely</div>
        <ul>
          <li>Products underflow (0.001⁴⁰⁰ = 0.0); sum logs instead</li>
          <li>Normalise with <b>log-sum-exp</b>: subtract the max before exp</li>
          <li>Log-odds = log prior ratio + Σ count·ln(P(w|spam)/P(w|ham))</li>
          <li>free +1.361, lunch −0.718, monday −1.124 → −0.481 → 0.382</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Practice</div>
        <ul>
          <li>Linear classifier, <b>generative</b>; LR is its discriminative twin</li>
          <li>NB better at 10–100 messages; LR better at 300+</li>
          <li>Probabilities too extreme: 11 wrong at p &lt; 0.01 or &gt; 0.99 (LR 0)</li>
          <li>sklearn: MultinomialNB, ComplementNB, BernoulliNB, GaussianNB, CategoricalNB; alpha, var_smoothing, partial_fit</li>
          <li>Fast, tiny, streaming; great baseline for text</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="nb-ladder"><span class="rm-num">★</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The whole story in one chain</span></div></div>
      <div class="rm-item rm-done" data-target="nb-bayes"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Bayes' Theorem</span><span class="rm-sub">Flipping a conditional by hand</span></div></div>
      <div class="rm-item rm-done" data-target="nb-classifier"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Bayes Classifier</span><span class="rm-sub">MAP rule, generative models</span></div></div>
      <div class="rm-item rm-done" data-target="nb-naive"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Naive Assumption</span><span class="rm-sub">And why it still works</span></div></div>
      <div class="rm-item rm-done" data-target="nb-multi"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Multinomial NB</span><span class="rm-sub">Spam filter by hand</span></div></div>
      <div class="rm-item rm-done" data-target="nb-smooth"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Laplace Smoothing</span><span class="rm-sub">The zero-count problem</span></div></div>
      <div class="rm-item rm-done" data-target="nb-log"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Log-Probabilities</span><span class="rm-sub">Underflow, log-sum-exp</span></div></div>
      <div class="rm-item rm-done" data-target="nb-bern"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Bernoulli NB</span><span class="rm-sub">Present or absent</span></div></div>
      <div class="rm-item rm-done" data-target="nb-gauss"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Gaussian NB</span><span class="rm-sub">Means and variances by hand</span></div></div>
      <div class="rm-item rm-done" data-target="nb-variants"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Categorical &amp; Mixed</span><span class="rm-sub">Combining clue types</span></div></div>
      <div class="rm-item rm-done" data-target="nb-linear"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">NB Is Linear</span><span class="rm-sub">vs logistic regression</span></div></div>
      <div class="rm-item rm-done" data-target="nb-calib"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Calibration</span><span class="rm-sub">Over-confident probabilities</span></div></div>
      <div class="rm-item rm-done" data-target="nb-sklearn"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">sklearn in Practice</span><span class="rm-sub">Classes, pipelines, partial_fit</span></div></div>
      <div class="rm-item rm-done" data-target="nb-scratch"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">Matched to sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="nb-when"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">When to Use &amp; Comparisons</span><span class="rm-sub">vs LR, KNN, SVM, trees</span></div></div>
      <div class="rm-item rm-done" data-target="nb-connect"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Each concept built from the last</span></div></div>
      <div class="rm-item rm-done" data-target="nb-traps"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Interview and code traps</span></div></div>
      <div class="rm-item rm-done" data-target="nb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="nb-qa"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="nb-bayes"><span class="num">01</span>Bayes' Theorem by Hand</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> From past messages we can easily count "how often does spam come from an unknown sender?". But the question we need answered runs the other way: "this message came from an unknown sender; how likely is it to be spam?". How do we flip one conditional probability into the other?</p>
  <h3>The running example</h3>
  <p>Our whole inbox: eight labelled messages. Every section of this note uses these same eight rows.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
inbox = pd.DataFrame({
    "text": ["win a free prize now", "free cash offer win", "claim your free prize", "cheap offer buy now",
             "meeting moved to monday", "see you at lunch", "project update attached", "can we meet monday"],
    "spam": [1, 1, 1, 1, 0, 0, 0, 0],
    "sender": ["unknown", "unknown", "unknown", "known", "known", "known", "unknown", "known"],
    "night": ["yes", "yes", "yes", "no", "no", "no", "no", "yes"],          # sent between 10 pm and 6 am
    "age_days": [2, 5, 1, 30, 400, 900, 15, 650]})                         # age of the sender's account
inbox["length"] = inbox.text.str.len()                                     # characters
print(inbox.to_string())
# Bayes' theorem with one clue: the sender is unknown
p_spam = inbox.spam.mean()
p_u_spam = (inbox[inbox.spam == 1].sender == "unknown").mean()
p_u_ham = (inbox[inbox.spam == 0].sender == "unknown").mean()
evidence = p_u_spam * p_spam + p_u_ham * (1 - p_spam)
print(f"\\nP(spam)={p_spam}  P(unknown|spam)={p_u_spam}  P(unknown|ham)={p_u_ham}")
print(f"P(unknown) = {p_u_spam}*{p_spam} + {p_u_ham}*{1 - p_spam} = {evidence}")
print(f"P(spam | unknown) = {p_u_spam * p_spam} / {evidence} = {p_u_spam * p_spam / evidence}")</div>
  <div class="fx" data-lang="text">                      text  spam   sender night  age_days  length
0     win a free prize now     1  unknown   yes         2      20
1      free cash offer win     1  unknown   yes         5      19
2    claim your free prize     1  unknown   yes         1      21
3      cheap offer buy now     1    known    no        30      19
4  meeting moved to monday     0    known    no       400      23
5         see you at lunch     0    known    no       900      16
6  project update attached     0  unknown    no        15      23
7       can we meet monday     0    known   yes       650      18

P(spam)=0.5  P(unknown|spam)=0.75  P(unknown|ham)=0.25
P(unknown) = 0.75*0.5 + 0.25*0.5 = 0.5
P(spam | unknown) = 0.375 / 0.5 = 0.75</div>
  <h3>Flipping the conditional, by counting</h3>
  <p>Before any formula, just count. Of the 8 messages, 4 are spam. Of the 4 spam, 3 came from unknown senders; of the 4 ham, 1 did. So 4 messages came from unknown senders, and 3 of those 4 are spam: <strong>P(spam | unknown) = 3/4 = 0.75</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<rect x="250" y="10" width="140" height="40" rx="8" class="fs" stroke="currentColor"/><text x="320" y="35" text-anchor="middle" font-size="13">8 messages</text>
<line x1="290" y1="50" x2="170" y2="88" stroke="currentColor"/><line x1="350" y1="50" x2="470" y2="88" stroke="currentColor"/>
<text x="200" y="70" class="tm" font-size="11">P(spam) = 4/8</text><text x="400" y="70" class="tm" font-size="11">P(ham) = 4/8</text>
<rect x="110" y="88" width="120" height="36" rx="8" class="fr sr"/><text x="170" y="111" text-anchor="middle" font-size="12.5">4 spam</text>
<rect x="410" y="88" width="120" height="36" rx="8" class="fb sb"/><text x="470" y="111" text-anchor="middle" font-size="12.5">4 ham</text>
<line x1="150" y1="124" x2="90" y2="164" stroke="currentColor"/><line x1="190" y1="124" x2="240" y2="164" stroke="currentColor"/>
<line x1="450" y1="124" x2="400" y2="164" stroke="currentColor"/><line x1="490" y1="124" x2="550" y2="164" stroke="currentColor"/>
<text x="40" y="148" class="tm" font-size="10.5">P(unknown|spam) = 3/4</text><text x="430" y="148" class="tm" font-size="10.5">P(unknown|ham) = 1/4</text>
<rect x="40" y="164" width="100" height="36" rx="8" class="fr sr" stroke-width="3"/><text x="90" y="187" text-anchor="middle" font-size="12">3 unknown</text>
<rect x="190" y="164" width="100" height="36" rx="8" class="fs" stroke="currentColor"/><text x="240" y="187" text-anchor="middle" font-size="12">1 known</text>
<rect x="350" y="164" width="100" height="36" rx="8" class="fb sb" stroke-width="3"/><text x="400" y="187" text-anchor="middle" font-size="12">1 unknown</text>
<rect x="500" y="164" width="100" height="36" rx="8" class="fs" stroke="currentColor"/><text x="550" y="187" text-anchor="middle" font-size="12">3 known</text>
<text x="320" y="222" text-anchor="middle" font-size="12">unknown senders: 3 spam + 1 ham → P(spam | unknown) = 3 / (3 + 1) = 0.75</text>
</svg><figcaption>The eight messages split first by class, then by sender. Bayes' theorem is just "keep the thick-bordered boxes and see what share of them is spam".</figcaption></figure>
  <h3>The same thing as a formula</h3>
  <p>Write the count reasoning with probabilities. The share of all messages that are "spam and unknown" is P(unknown | spam)·P(spam) = 0.75 × 0.5 = 0.375. The share that is "unknown" at all is the sum over both classes (the <strong>law of total probability</strong>): 0.75 × 0.5 + 0.25 × 0.5 = 0.5. Divide:</p>
  <p style="text-align:center"><strong>P(spam | unknown) = P(unknown | spam) · P(spam) / P(unknown) = 0.375 / 0.5 = 0.75</strong></p>
  <table class="tbl">
    <tr><th>Name</th><th>Symbol</th><th>Meaning</th><th>Inbox value</th></tr>
    <tr><td>Prior</td><td>P(c)</td><td>Belief in the class before seeing the clue</td><td>P(spam) = 0.5</td></tr>
    <tr><td>Likelihood</td><td>P(x | c)</td><td>How typical the clue is for that class</td><td>P(unknown | spam) = 0.75</td></tr>
    <tr><td>Evidence</td><td>P(x)</td><td>How common the clue is overall; the same for every class</td><td>P(unknown) = 0.5</td></tr>
    <tr><td>Posterior</td><td>P(c | x)</td><td>Updated belief after the clue</td><td>P(spam | unknown) = 0.75</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A detective starts with a hunch (prior: "half of all tips are fake"), then sees a clue ("anonymous caller"). How much the hunch moves depends on how much more typical the clue is of fakes than of genuine tips (likelihood 0.75 vs 0.25: three times). A clue equally typical of both would not move the hunch at all.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Bayes' theorem</strong>: P(c | x) = P(x | c)·P(c) / P(x), with P(x) = Σ_k P(x | k)·P(k). It follows from writing the joint probability two ways: P(c, x) = P(c | x)P(x) = P(x | c)P(c). In odds form: posterior odds = prior odds × likelihood ratio, here 1 × (0.75/0.25) = 3, i.e. p = 3/4. (Background: <a class="xref" data-note="st_probability">Probability</a>.)</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>P(unknown | spam) = 0.75 and P(spam | unknown) = 0.75 are equal here only because the priors are 50/50. With 1% spam the same clue gives P(spam | unknown) = 0.75 × 0.01 / (0.75 × 0.01 + 0.25 × 0.99) ≈ 0.03. Confusing the two directions (the "prosecutor's fallacy") is the most common probability mistake in interviews.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Bayes Classifier.</b> We used one clue. A real message has a sender, a time, an account age, a length and a dozen words. How do we turn Bayes' theorem into a classifier that uses all of them?</div>

  <h2 id="nb-classifier"><span class="num">02</span>From Bayes' Theorem to a Classifier</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Bayes' theorem gave P(spam | one clue). A message brings many clues at once, x = (x₁, …, x_d). What is the rule for choosing a class, and what do we need to estimate for it?</p>
  <h3>The MAP rule</h3>
  <p>Apply Bayes' theorem to the whole clue vector x and compare classes. The evidence P(x) is the same for every class, so for <em>choosing</em> a class we can drop it:</p>
  <p style="text-align:center"><strong>ŷ = argmax_c P(c | x) = argmax_c P(c) · P(x | c)</strong></p>
  <p>This is the <strong>maximum a posteriori (MAP)</strong> rule. If we did know the true P(x | c), it would be the best possible classifier (the <strong>Bayes optimal classifier</strong>, whose error is the lowest achievable, the "Bayes error"). To report a probability, divide each class's score by the sum of the scores; that sum <em>is</em> P(x).</p>
  <h3>The problem: P(x | c) for many clues</h3>
  <p>To estimate P(x | spam) directly we would count how often each <em>full combination</em> of clues appears among spam messages. With just the 24 words of our inbox, each present or absent, there are 2²⁴ = 16,777,216 combinations per class. We have four spam messages. Almost every combination has count 0, including the one we want to classify. Direct estimation is hopeless; this is the curse of dimensionality in its plainest form (<a class="xref" data-note="ml_dimred">Curse of Dimensionality</a>).</p>
  <h3>Generative vs discriminative</h3>
  <table class="tbl">
    <tr><th></th><th>Generative (Naive Bayes)</th><th>Discriminative (<a class="xref" data-note="ml_classification">Logistic Regression</a>)</th></tr>
    <tr><td>Models</td><td>P(x | c) and P(c): how each class produces its data</td><td>P(c | x) directly</td></tr>
    <tr><td>Training</td><td>Counting, closed form, one pass</td><td>Optimisation (gradient descent)</td></tr>
    <tr><td>Can generate fake examples?</td><td>Yes (sample words from P(w | spam))</td><td>No</td></tr>
    <tr><td>Strength</td><td>Little data, many features, missing features easy to skip</td><td>More accurate with lots of data; fewer assumptions</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>Bayes classifier</strong> predicts ŷ(x) = argmax_c P(c)P(x | c). A <strong>generative classifier</strong> estimates P(c) and P(x | c) from data and plugs them into this rule; Naive Bayes is the generative classifier with the extra assumption of section 03.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Naive Bayes is Bayesian" is not quite right. It uses Bayes' <em>theorem</em>, but the probabilities are point estimates from counts (maximum likelihood, or with a smoothing prior). A fully Bayesian model would keep whole distributions over its parameters.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Naive Assumption.</b> The MAP rule needs P(all clues | class), which would take millions of counts. We need a way to build it from one small count per clue.</div>

  <h2 id="nb-naive"><span class="num">03</span>The Naive Assumption</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We cannot estimate P(unknown sender AND night AND …| spam) as one big table from eight messages. Can we build it from pieces we <em>can</em> count, one clue at a time?</p>
  <h3>Plain words</h3>
  <p>Assume that <strong>once you know the class</strong>, the clues tell you nothing about each other. Among spam messages, knowing the sender is unknown does not change the chance it was sent at night. Then the joint probability is a product:</p>
  <p style="text-align:center"><strong>P(x₁, x₂, …, x_d | c) = P(x₁ | c) · P(x₂ | c) · … · P(x_d | c)</strong></p>
  <p>and the classifier becomes <strong>score(c) = P(c) · Πⱼ P(xⱼ | c)</strong>. Instead of 16.8 million cells per class we need d small tables.</p>
  <h3>By hand: unknown sender, sent at night</h3>
  <table class="tbl">
    <tr><th>class</th><th>prior</th><th>P(unknown | c)</th><th>P(night | c)</th><th>score</th></tr>
    <tr><td>spam</td><td>4/8</td><td>3/4</td><td>3/4</td><td>0.5 × 0.75 × 0.75 = 0.2812</td></tr>
    <tr><td>ham</td><td>4/8</td><td>1/4</td><td>1/4</td><td>0.5 × 0.25 × 0.25 = 0.0312</td></tr>
  </table>
  <p>P(spam | unknown, night) = 0.2812 / (0.2812 + 0.0312) = <strong>0.90</strong>. The first clue moved us from 0.5 to 0.75; the second, treated as independent evidence, moved us to 0.90 (odds 1 → 3 → 9: each clue multiplies the odds by its likelihood ratio 3).</p>
  <div class="fx" data-lang="py"># two clues: unknown sender AND sent at night
def naive(df, clues):
    out = {}
    for c in [1, 0]:
        part = df[df.spam == c]
        s = len(part) / len(df)                              # prior
        for col, val in clues.items():
            s *= (part[col] == val).mean()                   # one likelihood per clue, multiplied
        out[c] = s
    return out[1], out[0], out[1] / (out[1] + out[0])
s1, s0, post = naive(inbox, {"sender": "unknown", "night": "yes"})
print(f"naive: spam score {s1:.4f}  ham score {s0:.4f}  P(spam) = {post:.3f}")
both = inbox[(inbox.sender == "unknown") &amp; (inbox.night == "yes")]
print(f"exact count: messages with both clues = {len(both)}, of which spam = {both.spam.sum()}")
print("full joint table for 24 words present/absent needs", f"{2 ** 24:,}", "cells per class; we have 8 messages")
# double counting: give the model the same clue three times
for k in [1, 2, 3]:
    df = inbox.copy()
    for j in range(1, k):
        df[f"sender{j}"] = df.sender
    clues = {"sender": "unknown", **{f"sender{j}": "unknown" for j in range(1, k)}}
    print(f"'unknown sender' counted {k}x -&gt; P(spam) = {naive(df, clues)[2]:.3f}")</div>
  <div class="fx" data-lang="text">naive: spam score 0.2812  ham score 0.0312  P(spam) = 0.900
exact count: messages with both clues = 3, of which spam = 3
full joint table for 24 words present/absent needs 16,777,216 cells per class; we have 8 messages
'unknown sender' counted 1x -&gt; P(spam) = 0.750
'unknown sender' counted 2x -&gt; P(spam) = 0.900
'unknown sender' counted 3x -&gt; P(spam) = 0.964</div>
  <p>Line 2 is the honest count: 3 messages have both clues and all 3 are spam, so the "true" answer on this data is 1.0; the naive product says 0.90. Not equal, but it points the same way. Line 3 is why we accept the approximation. The last three lines show the danger: if the same clue enters the model twice (two columns that say the same thing), NB treats it as two independent pieces of evidence and the probability inflates from 0.75 to 0.90 to 0.964, though nothing new was learnt.</p>
  <h3>Why it still works</h3>
  <ul>
    <li><strong>Classification only needs the winner.</strong> Errors in the probabilities often push both classes' scores the same way; as long as the right class still has the larger score, the decision is correct. Domingos and Pazzani (1997) showed NB is optimal for 0/1 loss in many cases where independence is badly violated.</li>
    <li><strong>Low variance.</strong> Each P(xⱼ | c) is estimated from all rows of class c, so the estimates are stable even with tiny data. A small bias in exchange for a big variance reduction (<a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>).</li>
    <li><strong>Dependencies often cancel.</strong> Positive dependencies in one class and similar ones in the other partly cancel in the ratio.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A selection committee where each member votes from one document only (one reads the CV, one the marks sheet, one the interview notes) and nobody talks to anyone. If two members read near-identical documents, that view gets two votes: that is double counting. Still, the final ranking of candidates is usually right.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Conditional independence</strong>: x_i ⫫ x_j | c means P(x_i, x_j | c) = P(x_i | c)P(x_j | c). <strong>Naive Bayes</strong>: ŷ = argmax_c P(c) Πⱼ P(xⱼ | c), with each factor estimated separately. Note it is independence <em>given the class</em>; the clues may be strongly related overall (spam has both unknown senders and night messages).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"NB assumes the features are independent" is the common, slightly wrong statement. It assumes they are independent <em>within each class</em>. Unknown sender and night are clearly correlated across the whole inbox (both mark spam); the assumption is only that they are unrelated among spam messages and among ham messages.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Multinomial NB.</b> Our clues so far were neat yes/no columns. The most important clue in a message is its text. What are the "features" of free text, and how do we turn them into P(xⱼ | c)?</div>

  <h2 id="nb-multi"><span class="num">04</span>Multinomial NB: the Spam Filter by Hand</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> The new message is the text "free lunch monday". What are its clues, and how likely is each one in spam and in ham?</p>
  <h3>Words as clues</h3>
  <p>Treat a message as a <strong>bag of words</strong>: forget word order, keep how many times each word appears (<a class="xref" data-note="nlp">NLP Foundations</a>). Imagine each class has a bag of word tokens; a spam message is made by drawing its words one at a time from the spam bag. Then P(word | spam) is simply the share of all spam word tokens that are that word.</p>
  <h3>Step 1: count words per class</h3>
  <p>sklearn's <code>CountVectorizer</code> lower-cases, splits on spaces and drops one-letter words ("a"). The four spam messages contain 16 word tokens; the four ham messages contain 15; there are V = 24 different words.</p>
  <table class="tbl"><caption>Counts for the words in "free lunch monday"</caption>
    <tr><th>word</th><th>count in spam</th><th>count in ham</th><th>raw P(w | spam)</th><th>raw P(w | ham)</th></tr>
    <tr><td>free</td><td>3</td><td>0</td><td>3/16 = 0.188</td><td>0/15 = 0</td></tr>
    <tr><td>lunch</td><td>0</td><td>1</td><td>0/16 = 0</td><td>1/15 = 0.067</td></tr>
    <tr><td>monday</td><td>0</td><td>2</td><td>0/16 = 0</td><td>2/15 = 0.133</td></tr>
  </table>
  <p>Raw counts give a zero in each class: "lunch" never appeared in spam, "free" never in ham. Both scores would be exactly 0, and we could not decide. The fix (section 05 explains it fully) is to add 1 to every count: P(w | c) = (count + 1) / (total words in c + V).</p>
  <h3>Step 2: smoothed probabilities and scores</h3>
  <table class="tbl">
    <tr><th>word</th><th>P(w | spam) = (count + 1)/(16 + 24)</th><th>P(w | ham) = (count + 1)/(15 + 24)</th></tr>
    <tr><td>free</td><td>4/40 = 0.100</td><td>1/39 = 0.0256</td></tr>
    <tr><td>lunch</td><td>1/40 = 0.025</td><td>2/39 = 0.0513</td></tr>
    <tr><td>monday</td><td>1/40 = 0.025</td><td>3/39 = 0.0769</td></tr>
  </table>
  <ul>
    <li>Spam score = P(spam) × 0.100 × 0.025 × 0.025 = 0.5 × 6.25 × 10⁻⁵ = <strong>3.13 × 10⁻⁵</strong></li>
    <li>Ham score = 0.5 × 0.0256 × 0.0513 × 0.0769 = <strong>5.06 × 10⁻⁵</strong></li>
    <li>P(spam | "free lunch monday") = 3.13 / (3.13 + 5.06) = <strong>0.382</strong>: ham. "free" pulls toward spam (4 times likelier there), but "lunch" (2×) and "monday" (3×) pull harder toward ham.</li>
  </ul>
  <div class="fx" data-lang="py">from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
y = inbox.spam.values
vec = CountVectorizer()                                   # splits words, drops 1-letter words like "a"
X = vec.fit_transform(inbox.text)                         # 8 x V table of word counts
vocab = vec.get_feature_names_out()
counts = pd.DataFrame({"spam": X[y == 1].sum(0).A1, "ham": X[y == 0].sum(0).A1}, index=vocab)
V = len(vocab); n_spam, n_ham = counts.spam.sum(), counts.ham.sum()
print(f"V = {V} words; total words: spam {n_spam}, ham {n_ham}")
msg = ["free", "lunch", "monday"]
tab = counts.loc[msg].copy()
tab["P(w|spam)"] = (tab.spam + 1) / (n_spam + V)
tab["P(w|ham)"] = (tab.ham + 1) / (n_ham + V)
print(tab.round(4))
s_spam = 0.5 * tab["P(w|spam)"].prod(); s_ham = 0.5 * tab["P(w|ham)"].prod()
print(f"spam score {s_spam:.3e}  ham score {s_ham:.3e}  P(spam | msg) = {s_spam / (s_spam + s_ham):.3f}")
mnb = MultinomialNB(alpha=1.0).fit(X, y)
print("sklearn P(spam):", round(mnb.predict_proba(vec.transform(["free lunch monday"]))[0, 1], 3))
print("sklearn P(free|spam):", round(np.exp(mnb.feature_log_prob_[1, vec.vocabulary_["free"]]), 4))
for m in ["free free free lunch monday", "claim your cash prize", "lunch meeting monday"]:
    print(f"  {m:28s} P(spam) = {mnb.predict_proba(vec.transform([m]))[0, 1]:.3f}")</div>
  <div class="fx" data-lang="text">V = 24 words; total words: spam 16, ham 15
        spam  ham  P(w|spam)  P(w|ham)
free       3    0      0.100    0.0256
lunch      0    1      0.025    0.0513
monday     0    2      0.025    0.0769
spam score 3.125e-05  ham score 5.057e-05  P(spam | msg) = 0.382
sklearn P(spam): 0.382
sklearn P(free|spam): 0.1
  free free free lunch monday  P(spam) = 0.904
  claim your cash prize        P(spam) = 0.956
  lunch meeting monday         P(spam) = 0.072</div>
  <p>The hand table, the scores and sklearn agree (0.382; P(free | spam) = 0.1). Three more messages: repeating "free" three times multiplies 0.100/0.0256 in three times and flips the verdict to 0.904 spam; "claim your cash prize" is 0.956 spam; "lunch meeting monday" is 0.072. Note "meeting" is in the vocabulary but "meet" is a different word; NB knows nothing about meaning.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Multinomial NB</strong>: a document with word counts x = (x₁, …, x_V) has P(x | c) ∝ Πⱼ θ_{cj}^{xⱼ}, where θ_{cj} = P(word j | c) = (N_{cj} + α)/(N_c + αV), N_{cj} = count of word j in class c, N_c = total words in class c. Prediction: argmax_c [ln P(c) + Σⱼ xⱼ ln θ_{cj}].</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The denominator is total <em>words</em> in the class (16), not the number of <em>messages</em> (4). Using messages gives Bernoulli-style numbers in a multinomial formula. And words outside the training vocabulary are silently ignored at prediction time.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Laplace Smoothing.</b> We added 1 to every count to escape the zeros, but did not justify the 1, nor ask what other values would do.</div>

  <h2 id="nb-smooth"><span class="num">05</span>Laplace Smoothing</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Without smoothing, one word never seen in spam ("lunch") made P(spam) exactly 0 for any message containing it, however spammy the rest. Why is adding 1 the fix, and how much should we add?</p>
  <h3>The zero-frequency problem</h3>
  <p>A product is zero if any factor is zero. With four spam messages, most words have never appeared in spam, simply by chance. "Never seen in 16 words" is weak evidence that a word is impossible in spam; it should make the word unlikely, not forbidden.</p>
  <h3>The fix as pseudo-counts</h3>
  <p>Pretend that before seeing any data we saw every word α times in every class. Then P(w | c) = (count + α)/(N_c + αV). With α = 1 (Laplace) this is the +1 rule; with 0 &lt; α &lt; 1 it is called Lidstone smoothing. Each class's probabilities still add to 1, because we added αV to the denominator.</p>
  <table class="tbl"><caption>P(lunch | spam) for different α (count 0, N_spam = 16, V = 24)</caption>
    <tr><th>α</th><th>(0 + α)/(16 + 24α)</th><th>meaning</th></tr>
    <tr><td>0</td><td>0</td><td>"impossible": vetoes spam</td></tr>
    <tr><td>0.1</td><td>0.1/18.4 = 0.0054</td><td>rare</td></tr>
    <tr><td>1</td><td>1/40 = 0.025</td><td>Laplace</td></tr>
    <tr><td>10</td><td>10/256 = 0.039</td><td>close to uniform 1/24 = 0.042</td></tr>
  </table>
  <div class="fx" data-lang="py">x_new = vec.transform(["free lunch monday"])
print("alpha   P(lunch|spam)  P(spam | 'free lunch monday')")
for a in [1e-10, 0.1, 1.0, 10.0, 100.0]:
    m = MultinomialNB(alpha=a).fit(X, y)
    print(f"{a:&lt;7g} {np.exp(m.feature_log_prob_[1, vec.vocabulary_['lunch']]):.2e}       {m.predict_proba(x_new)[0, 1]:.3f}")</div>
  <div class="fx" data-lang="text">alpha   P(lunch|spam)  P(spam | 'free lunch monday')
1e-10   6.25e-12       0.000
0.1     5.43e-03       0.102
1       2.50e-02       0.382
10      3.91e-02       0.493
100     4.14e-02       0.500</div>
  <p>With α ≈ 0 the verdict is "certainly ham" (0.000) because of a single unseen word. As α grows, every word's probability is pulled toward the uniform 1/V and the data matters less; at α = 100 the words carry almost no information and the answer is just the prior, 0.500. α is a bias-variance knob: small α trusts the few counts (high variance), large α ignores them (high bias). Tune it by cross-validation, as section 12 does.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new restaurant with zero reviews is not "zero stars". Rating sites add a few imaginary average reviews to every restaurant so that one early review cannot make it look perfect or terrible. α is the number of imaginary reviews.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Additive (Lidstone) smoothing</strong>: θ̂_{cj} = (N_{cj} + α)/(N_c + αV), α &gt; 0; α = 1 is <strong>Laplace smoothing</strong>. It equals the posterior mean of θ_c under a symmetric Dirichlet(α) prior (equivalently the MAP estimate under Dirichlet(α + 1)): α imaginary occurrences of every word in every class. In sklearn: <code>alpha</code> (default 1.0; <code>force_alpha=True</code> keeps tiny values instead of clipping them).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Smoothing must be applied to every class and every word in the vocabulary, including words that appear only in the other class. And α interacts with vocabulary size: with V = 100,000 words, α = 1 adds 100,000 imaginary words to each class, which can swamp a small class; smaller α (0.01–0.1) is often better for big vocabularies.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Log-Probabilities.</b> Our message had three words and the scores were already around 10⁻⁵. A 400-word e-mail would multiply 400 such numbers. Can a computer even hold the result?</div>

  <h2 id="nb-log"><span class="num">06</span>Log-Probabilities and Underflow</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Three words gave scores of 3 × 10⁻⁵. Each extra word multiplies in another factor of about 0.01–0.1. What happens to a long message, and how do we compute P(spam) safely?</p>
  <h3>Underflow</h3>
  <p>A computer's double-precision numbers cannot go below about 10⁻³⁰⁸. A 400-word e-mail whose words each have probability 0.001 has a product of 10⁻¹²⁰⁰, which the computer stores as exactly 0.0. Both classes become 0, and 0/0 is undefined.</p>
  <h3>Work with logs</h3>
  <p>The log turns a product into a sum, and since ln is increasing the class with the bigger score also has the bigger log-score:</p>
  <p style="text-align:center"><strong>ln score(c) = ln P(c) + Σⱼ xⱼ · ln P(wⱼ | c)</strong></p>
  <p>For "free lunch monday": ln score(spam) = ln 0.5 + ln 0.100 + ln 0.025 + ln 0.025 = −0.693 − 2.303 − 3.689 − 3.689 = <strong>−10.374</strong>; ln score(ham) = −0.693 − 3.664 − 2.970 − 2.565 = <strong>−9.892</strong>. Ham is larger (less negative): same decision as before.</p>
  <h3>Turning log-scores back into probabilities: log-sum-exp</h3>
  <p>To get P(spam) we need e^(−10.374) / (e^(−10.374) + e^(−9.892)). For a long message the log-scores are around −2,771, and e^(−2771) is again 0.0. The trick: subtract the largest log-score from all of them before exponentiating (this multiplies top and bottom by the same constant, so the ratio is unchanged). By hand for the short message: subtract −9.892 → e^(−0.482) = 0.618 and e^0 = 1, so P(spam) = 0.618 / 1.618 = <strong>0.382</strong>.</p>
  <div class="fx" data-lang="py">p_words = np.full(400, 0.001)                             # a 400-word e-mail, each word has P = 0.001
print("direct product:", np.prod(p_words), "   sum of logs:", round(np.log(p_words).sum(), 1))
log_spam, log_ham = -2771.2, -2774.5                      # two log-scores of a long message
print("exp of log scores:", np.exp(log_spam), np.exp(log_ham))
m = max(log_spam, log_ham)                                # log-sum-exp trick: subtract the max first
p_spam = np.exp(log_spam - m) / (np.exp(log_spam - m) + np.exp(log_ham - m))
print(f"P(spam) via log-sum-exp = {p_spam:.4f}")
from scipy.special import logsumexp
print(f"scipy: {np.exp(log_spam - logsumexp([log_spam, log_ham])):.4f}")
long_msg = " ".join(["free"] * 300 + ["monday"] * 363)
print("sklearn on a 663-word message:", mnb.predict_log_proba(vec.transform([long_msg])).round(1),
      mnb.predict_proba(vec.transform([long_msg])).round(4))</div>
  <div class="fx" data-lang="text">direct product: 0.0    sum of logs: -2763.1
exp of log scores: 0.0 0.0
P(spam) via log-sum-exp = 0.9644
scipy: 0.9644
sklearn on a 663-word message: [[-0.9 -0.6]] [[0.424 0.576]]</div>
  <p>Line 1: the direct product is 0.0, but the sum of logs (−2,763) is a perfectly ordinary number. Line 2: exponentiating log-scores of −2,771 gives 0.0 again. Line 3: subtract the max first and the answer is 0.9644 (the scores differ by 3.3, and 1/(1 + e^(−3.3)) = 0.964). scipy's <code>logsumexp</code> does the same. Last line: sklearn handles a 663-word message without trouble, because it works in logs internally (<code>predict_log_proba</code>); 300 × "free" (+1.361 each) against 363 × "monday" (−1.124 each) nearly cancel, giving 0.576 spam.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Log-sum-exp</strong>: ln Σ_k e^(a_k) = m + ln Σ_k e^(a_k − m) with m = max_k a_k. Posterior: P(c | x) = exp(a_c − logsumexp(a)), where a_c = ln P(c) + Σⱼ ln P(xⱼ | c). Every term e^(a_k − m) ≤ 1 and at least one equals 1, so nothing overflows or underflows to all-zero.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Implementing NB with plain products works in a demo with 3-word messages and silently breaks on real e-mails. Always sum logs. Also, "log of 0" is −∞, another reason smoothing is required.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Bernoulli NB.</b> Multinomial NB only looks at the words that are present, and counts repeats. For short messages, the words that are <em>missing</em> ("no 'meeting', no 'project'") may be evidence too.</div>

  <h2 id="nb-bern"><span class="num">07</span>Bernoulli NB: Present or Absent</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Multinomial NB treats "free free free" as three times the evidence and ignores every word that is not in the message. Is there a version that asks only "is the word there or not?" and also learns from absent words?</p>
  <h3>The model</h3>
  <p>Describe each message by V yes/no flags, one per vocabulary word. For each class and word, estimate the share of <em>messages</em> (not word tokens) that contain the word, smoothed: P(w present | c) = (messages in c containing w + α)/(messages in c + 2α). The "2α" is because each flag has two outcomes. Then multiply over <strong>all</strong> V words: P(w | c) for those present, 1 − P(w | c) for those absent.</p>
  <h3>By hand for "free lunch monday"</h3>
  <table class="tbl">
    <tr><th>word</th><th>spam messages with it (of 4)</th><th>P(present | spam) = (k + 1)/6</th><th>ham messages with it</th><th>P(present | ham)</th></tr>
    <tr><td>free</td><td>3</td><td>4/6 = 0.667</td><td>0</td><td>1/6 = 0.167</td></tr>
    <tr><td>lunch</td><td>0</td><td>1/6 = 0.167</td><td>1</td><td>2/6 = 0.333</td></tr>
    <tr><td>monday</td><td>0</td><td>1/6 = 0.167</td><td>2</td><td>3/6 = 0.500</td></tr>
  </table>
  <ul>
    <li>Present-word factor: spam 0.667 × 0.167 × 0.167 = 0.01852; ham 0.167 × 0.333 × 0.5 = 0.02778.</li>
    <li>The other 21 words are absent. Each contributes 1 − P(w | c). Spam's own words (prize, offer, win, …) have high P(w | spam), so their absence costs spam a lot: product 0.00092 for spam vs 0.00149 for ham.</li>
    <li>Scores: 0.5 × 0.01852 × 0.00092 = 8.55 × 10⁻⁶ and 0.5 × 0.02778 × 0.00149 = 2.08 × 10⁻⁵ → P(spam) = <strong>0.292</strong>.</li>
  </ul>
  <div class="fx" data-lang="py">from sklearn.naive_bayes import BernoulliNB
present = (X &gt; 0).astype(int)                             # 1 if the word occurs in the message at all
df = pd.DataFrame({"spam docs": present[y == 1].sum(0).A1, "ham docs": present[y == 0].sum(0).A1}, index=vocab)
df["P(w|spam)"] = (df["spam docs"] + 1) / (4 + 2)         # 4 spam messages, +1 / +2 smoothing
df["P(w|ham)"] = (df["ham docs"] + 1) / (4 + 2)
x = pd.Series(0, index=vocab); x[msg] = 1                 # 'free lunch monday' as present / absent
fac = {}
for c, col in [("spam", "P(w|spam)"), ("ham", "P(w|ham)")]:
    pres = df.loc[x == 1, col].prod()                     # words that are there: P(w|c)
    absn = (1 - df.loc[x == 0, col]).prod()               # words that are NOT there: 1 - P(w|c)
    fac[c] = 0.5 * pres * absn
    print(f"{c:4s}: present-words {pres:.5f} x absent-words {absn:.5f} x prior 0.5 = {fac[c]:.3e}")
print(f"P(spam) = {fac['spam'] / (fac['spam'] + fac['ham']):.3f}")
bnb = BernoulliNB(alpha=1.0).fit(X, y)
for m in ["free lunch monday", "free free free lunch monday"]:
    print(f"BernoulliNB  {m:28s} P(spam) = {bnb.predict_proba(vec.transform([m]))[0, 1]:.3f}")
print(df.loc[["free", "prize", "offer", "monday", "lunch"]].round(3))</div>
  <div class="fx" data-lang="text">spam: present-words 0.01852 x absent-words 0.00092 x prior 0.5 = 8.547e-06
ham : present-words 0.02778 x absent-words 0.00149 x prior 0.5 = 2.075e-05
P(spam) = 0.292
BernoulliNB  free lunch monday            P(spam) = 0.292
BernoulliNB  free free free lunch monday  P(spam) = 0.292
        spam docs  ham docs  P(w|spam)  P(w|ham)
free            3         0      0.667     0.167
prize           2         0      0.500     0.167
offer           2         0      0.500     0.167
monday          0         2      0.167     0.500
lunch           0         1      0.167     0.333</div>
  <p>The code reproduces each factor and sklearn's <code>BernoulliNB</code> agrees (0.292). Repeating "free" three times changes nothing (still 0.292): only presence counts. Compare Multinomial's 0.382 → 0.904 for the same two messages. The absent words made Bernoulli more confident that this is ham (0.292 vs 0.382): the message lacks "prize", "win", "offer", which spam usually has.</p>
  <table class="tbl">
    <tr><th></th><th>Multinomial NB</th><th>Bernoulli NB</th></tr>
    <tr><td>Feature</td><td>word counts</td><td>word present (1) / absent (0)</td></tr>
    <tr><td>P(w | c) from</td><td>share of word <em>tokens</em> in c</td><td>share of <em>messages</em> in c containing w</td></tr>
    <tr><td>Absent words</td><td>ignored</td><td>multiply 1 − P(w | c)</td></tr>
    <tr><td>Repeats</td><td>count again</td><td>ignored</td></tr>
    <tr><td>Best for</td><td>longer documents, counts / TF-IDF</td><td>short texts, binary flags; <code>binarize=</code> threshold for numeric input</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Bernoulli NB</strong>: P(x | c) = Πⱼ p_{cj}^{xⱼ}(1 − p_{cj})^{1 − xⱼ}, xⱼ ∈ {0, 1}, with p_{cj} = (n_{cj} + α)/(n_c + 2α), n_{cj} = number of class-c documents containing word j, n_c = number of class-c documents.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Feeding counts into <code>BernoulliNB</code> is fine (it binarises at <code>binarize=0.0</code>), but feeding already-scaled data with negative values silently turns most of it into 0s. And with a large vocabulary, the long product of absent-word factors dominates; Bernoulli tends to lose to Multinomial on long documents.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Gaussian NB.</b> Words are counts or flags. Our inbox also has the account age (2 to 900 days) and the message length: real numbers that never repeat exactly, so we cannot count them.</div>

  <h2 id="nb-gauss"><span class="num">08</span>Gaussian NB: Continuous Clues</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> A new message comes from an account that is 40 days old and is 20 characters long. No training message has exactly these values, so counting gives 0. How do we get P(age = 40 | spam)?</p>
  <h3>The idea</h3>
  <p>Assume each continuous feature, within each class, follows a bell curve (normal distribution). A bell curve is fully described by its mean μ and variance σ², which we can compute from the class's rows. Then P(xⱼ | c) is replaced by the curve's height (density) at the new value:</p>
  <p style="text-align:center"><strong>f(x | c) = 1/√(2πσ²_c) · exp(−(x − μ_c)² / (2σ²_c))</strong></p>
  <h3>Step 1: means and variances by hand</h3>
  <table class="tbl">
    <tr><th>class</th><th>age_days</th><th>mean μ</th><th>variance σ² = mean of (x − μ)²</th><th>length</th><th>mean</th><th>variance</th></tr>
    <tr><td>spam</td><td>2, 5, 1, 30</td><td>38/4 = 9.5</td><td>(56.25 + 20.25 + 72.25 + 420.25)/4 = 142.25</td><td>20, 19, 21, 19</td><td>19.75</td><td>(0.0625 + 0.5625 + 1.5625 + 0.5625)/4 = 0.6875</td></tr>
    <tr><td>ham</td><td>400, 900, 15, 650</td><td>491.25</td><td>106,854.7</td><td>23, 16, 23, 18</td><td>20.0</td><td>(9 + 16 + 9 + 4)/4 = 9.5</td></tr>
  </table>
  <h3>Step 2: densities at the new message (age 40, length 20)</h3>
  <table class="tbl">
    <tr><th></th><th>(x − μ)²/(2σ²)</th><th>exp(−…)</th><th>1/√(2πσ²)</th><th>density</th></tr>
    <tr><td>age | spam</td><td>30.5²/284.5 = 3.270</td><td>0.0380</td><td>1/29.90 = 0.0334</td><td>0.00127</td></tr>
    <tr><td>age | ham</td><td>451.25²/213,709 = 0.953</td><td>0.386</td><td>1/819.4 = 0.00122</td><td>0.00047</td></tr>
    <tr><td>length | spam</td><td>0.25²/1.375 = 0.045</td><td>0.956</td><td>1/2.078 = 0.481</td><td>0.460</td></tr>
    <tr><td>length | ham</td><td>0</td><td>1</td><td>1/7.726 = 0.129</td><td>0.129</td></tr>
  </table>
  <p>Scores: spam 0.5 × 0.00127 × 0.460 = 2.92 × 10⁻⁴; ham 0.5 × 0.00047 × 0.129 = 3.05 × 10⁻⁵. <strong>P(spam) = 2.92 / (2.92 + 0.305) = 0.906.</strong> A 40-day-old account is far more typical of spam (mean 9.5 days) than of ham (mean 491 days, but very spread out).</p>
  <div class="fx" data-lang="py">from sklearn.naive_bayes import GaussianNB
num = ["age_days", "length"]
stats = inbox.groupby("spam")[num].agg(["mean", lambda s: s.var(ddof=0)])   # population variance, like sklearn
stats.columns = ["age_mean", "age_var", "len_mean", "len_var"]
print(stats.round(3))
def gauss(x, mu, var):
    return np.exp(-(x - mu) ** 2 / (2 * var)) / np.sqrt(2 * np.pi * var)
new_msg = {"age_days": 40, "length": 20}                                    # a 20-character message from a 40-day-old account
score = {}
for c, r in stats.iterrows():
    fa = gauss(40, r.age_mean, r.age_var); fl = gauss(20, r.len_mean, r.len_var)
    score[c] = 0.5 * fa * fl
    print(f"class {c}: f(age=40) = {fa:.3e}  f(length=20) = {fl:.4f}  score = {score[c]:.3e}")
print("P(spam | age, length) =", round(score[1] / (score[0] + score[1]), 4))
gnb = GaussianNB().fit(inbox[num], y)
print("sklearn theta_:", gnb.theta_.round(3).tolist(), " var_:", gnb.var_.round(3).tolist())
print("sklearn P(spam):", round(gnb.predict_proba(pd.DataFrame([new_msg]))[0, 1], 4),
      " epsilon added to variances:", f"{gnb.epsilon_:.2e}")
print("same account, 17 characters:", round(gnb.predict_proba(pd.DataFrame([{"age_days": 40, "length": 17}]))[0, 1], 4))</div>
  <div class="fx" data-lang="text">      age_mean     age_var  len_mean  len_var
spam                                         
0       491.25  106854.688     20.00    9.500
1         9.50     142.250     19.75    0.688
class 0: f(age=40) = 4.707e-04  f(length=20) = 0.1294  score = 3.046e-05
class 1: f(age=40) = 1.272e-03  f(length=20) = 0.4598  score = 2.923e-04
P(spam | age, length) = 0.9056
sklearn theta_: [[491.25, 20.0], [9.5, 19.75]]  var_: [[106854.688, 9.5], [142.25, 0.688]]
sklearn P(spam): 0.9056  epsilon added to variances: 1.12e-04
same account, 17 characters: 0.0619</div>
  <p>Every hand number appears in the output, and sklearn stores the same means (<code>theta_</code>) and variances (<code>var_</code>, population variance, dividing by n). The last line is a warning: change the length from 20 to 17 characters and P(spam) collapses to 0.062. The four spam lengths (19–21) happen to be almost identical, so their variance is tiny (0.69) and the spam bell curve is a narrow spike; 17 is 3.3 standard deviations away. Four rows are not enough to trust a variance.</p>
  <figure class="viz"><svg viewBox="0 0 640 300" width="640">
<line x1="70" y1="250" x2="590" y2="250" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="70" y1="250" x2="70" y2="50" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="70.0" y1="250" x2="70.0" y2="254" stroke="currentColor"/><text x="70.0" y="266" text-anchor="middle" class="tm" font-size="11">12</text>
<line x1="135.0" y1="250" x2="135.0" y2="254" stroke="currentColor"/><text x="135.0" y="266" text-anchor="middle" class="tm" font-size="11">14</text>
<line x1="200.0" y1="250" x2="200.0" y2="254" stroke="currentColor"/><text x="200.0" y="266" text-anchor="middle" class="tm" font-size="11">16</text>
<line x1="265.0" y1="250" x2="265.0" y2="254" stroke="currentColor"/><text x="265.0" y="266" text-anchor="middle" class="tm" font-size="11">18</text>
<line x1="330.0" y1="250" x2="330.0" y2="254" stroke="currentColor"/><text x="330.0" y="266" text-anchor="middle" class="tm" font-size="11">20</text>
<line x1="395.0" y1="250" x2="395.0" y2="254" stroke="currentColor"/><text x="395.0" y="266" text-anchor="middle" class="tm" font-size="11">22</text>
<line x1="460.0" y1="250" x2="460.0" y2="254" stroke="currentColor"/><text x="460.0" y="266" text-anchor="middle" class="tm" font-size="11">24</text>
<line x1="525.0" y1="250" x2="525.0" y2="254" stroke="currentColor"/><text x="525.0" y="266" text-anchor="middle" class="tm" font-size="11">26</text>
<line x1="590.0" y1="250" x2="590.0" y2="254" stroke="currentColor"/><text x="590.0" y="266" text-anchor="middle" class="tm" font-size="11">28</text>
<line x1="66" y1="250.0" x2="70" y2="250.0" stroke="currentColor"/><text x="63" y="254.0" text-anchor="end" class="tm" font-size="11">0</text>
<line x1="66" y1="210.0" x2="70" y2="210.0" stroke="currentColor"/><text x="63" y="214.0" text-anchor="end" class="tm" font-size="11">0.1</text>
<line x1="66" y1="170.0" x2="70" y2="170.0" stroke="currentColor"/><text x="63" y="174.0" text-anchor="end" class="tm" font-size="11">0.2</text>
<line x1="66" y1="130.0" x2="70" y2="130.0" stroke="currentColor"/><text x="63" y="134.0" text-anchor="end" class="tm" font-size="11">0.3</text>
<line x1="66" y1="90.0" x2="70" y2="90.0" stroke="currentColor"/><text x="63" y="94.0" text-anchor="end" class="tm" font-size="11">0.4</text>
<line x1="66" y1="50.0" x2="70" y2="50.0" stroke="currentColor"/><text x="63" y="54.0" text-anchor="end" class="tm" font-size="11">0.5</text>
<text x="330.0" y="282" text-anchor="middle" font-size="12">message length (characters)</text>
<text x="30" y="150.0" text-anchor="middle" font-size="12" transform="rotate(-90 30 150.0)">density f(length | class)</text>
<path d="M70.0 250.0 L71.6 250.0 L73.2 250.0 L74.9 250.0 L76.5 250.0 L78.1 250.0 L79.8 250.0 L81.4 250.0 L83.0 250.0 L84.6 250.0 L86.2 250.0 L87.9 250.0 L89.5 250.0 L91.1 250.0 L92.7 250.0 L94.4 250.0 L96.0 250.0 L97.6 250.0 L99.3 250.0 L100.9 250.0 L102.5 250.0 L104.1 250.0 L105.7 250.0 L107.4 250.0 L109.0 250.0 L110.6 250.0 L112.3 250.0 L113.9 250.0 L115.5 250.0 L117.1 250.0 L118.8 250.0 L120.4 250.0 L122.0 250.0 L123.6 250.0 L125.2 250.0 L126.9 250.0 L128.5 250.0 L130.1 250.0 L131.8 250.0 L133.4 250.0 L135.0 250.0 L136.6 250.0 L138.2 250.0 L139.9 250.0 L141.5 250.0 L143.1 250.0 L144.8 250.0 L146.4 250.0 L148.0 250.0 L149.6 250.0 L151.2 250.0 L152.9 250.0 L154.5 250.0 L156.1 250.0 L157.7 250.0 L159.4 250.0 L161.0 250.0 L162.6 250.0 L164.2 250.0 L165.9 250.0 L167.5 250.0 L169.1 250.0 L170.8 250.0 L172.4 250.0 L174.0 250.0 L175.6 250.0 L177.3 250.0 L178.9 250.0 L180.5 250.0 L182.1 250.0 L183.8 250.0 L185.4 250.0 L187.0 250.0 L188.6 250.0 L190.2 250.0 L191.9 250.0 L193.5 250.0 L195.1 250.0 L196.8 250.0 L198.4 250.0 L200.0 250.0 L201.6 250.0 L203.3 250.0 L204.9 250.0 L206.5 250.0 L208.1 250.0 L209.8 250.0 L211.4 250.0 L213.0 249.9 L214.6 249.9 L216.2 249.9 L217.9 249.9 L219.5 249.9 L221.1 249.8 L222.7 249.8 L224.4 249.7 L226.0 249.7 L227.6 249.6 L229.2 249.5 L230.9 249.4 L232.5 249.2 L234.1 249.0 L235.8 248.8 L237.4 248.6 L239.0 248.3 L240.6 248.0 L242.3 247.6 L243.9 247.1 L245.5 246.5 L247.1 245.9 L248.8 245.2 L250.4 244.3 L252.0 243.3 L253.6 242.2 L255.2 240.9 L256.9 239.5 L258.5 237.9 L260.1 236.1 L261.7 234.0 L263.4 231.8 L265.0 229.2 L266.6 226.5 L268.3 223.4 L269.9 220.1 L271.5 216.5 L273.1 212.5 L274.8 208.3 L276.4 203.7 L278.0 198.9 L279.6 193.7 L281.2 188.2 L282.9 182.5 L284.5 176.4 L286.1 170.2 L287.8 163.7 L289.4 157.0 L291.0 150.2 L292.6 143.2 L294.2 136.2 L295.9 129.2 L297.5 122.2 L299.1 115.2 L300.8 108.5 L302.4 101.9 L304.0 95.5 L305.6 89.5 L307.2 83.9 L308.9 78.7 L310.5 73.9 L312.1 69.7 L313.8 66.1 L315.4 63.1 L317.0 60.7 L318.6 58.9 L320.2 57.9 L321.9 57.5 L323.5 57.9 L325.1 58.9 L326.7 60.7 L328.4 63.1 L330.0 66.1 L331.6 69.7 L333.3 73.9 L334.9 78.7 L336.5 83.9 L338.1 89.5 L339.8 95.5 L341.4 101.9 L343.0 108.5 L344.6 115.2 L346.2 122.2 L347.9 129.2 L349.5 136.2 L351.1 143.2 L352.8 150.2 L354.4 157.0 L356.0 163.7 L357.6 170.2 L359.2 176.4 L360.9 182.5 L362.5 188.2 L364.1 193.7 L365.8 198.9 L367.4 203.7 L369.0 208.3 L370.6 212.5 L372.2 216.5 L373.9 220.1 L375.5 223.4 L377.1 226.5 L378.8 229.2 L380.4 231.8 L382.0 234.0 L383.6 236.1 L385.3 237.9 L386.9 239.5 L388.5 240.9 L390.1 242.2 L391.7 243.3 L393.4 244.3 L395.0 245.2 L396.6 245.9 L398.3 246.5 L399.9 247.1 L401.5 247.6 L403.1 248.0 L404.8 248.3 L406.4 248.6 L408.0 248.8 L409.6 249.0 L411.2 249.2 L412.9 249.4 L414.5 249.5 L416.1 249.6 L417.8 249.7 L419.4 249.7 L421.0 249.8 L422.6 249.8 L424.2 249.9 L425.9 249.9 L427.5 249.9 L429.1 249.9 L430.8 249.9 L432.4 250.0 L434.0 250.0 L435.6 250.0 L437.2 250.0 L438.9 250.0 L440.5 250.0 L442.1 250.0 L443.8 250.0 L445.4 250.0 L447.0 250.0 L448.6 250.0 L450.3 250.0 L451.9 250.0 L453.5 250.0 L455.1 250.0 L456.7 250.0 L458.4 250.0 L460.0 250.0 L461.6 250.0 L463.3 250.0 L464.9 250.0 L466.5 250.0 L468.1 250.0 L469.8 250.0 L471.4 250.0 L473.0 250.0 L474.6 250.0 L476.2 250.0 L477.9 250.0 L479.5 250.0 L481.1 250.0 L482.8 250.0 L484.4 250.0 L486.0 250.0 L487.6 250.0 L489.2 250.0 L490.9 250.0 L492.5 250.0 L494.1 250.0 L495.8 250.0 L497.4 250.0 L499.0 250.0 L500.6 250.0 L502.2 250.0 L503.9 250.0 L505.5 250.0 L507.1 250.0 L508.8 250.0 L510.4 250.0 L512.0 250.0 L513.6 250.0 L515.3 250.0 L516.9 250.0 L518.5 250.0 L520.1 250.0 L521.8 250.0 L523.4 250.0 L525.0 250.0 L526.6 250.0 L528.2 250.0 L529.9 250.0 L531.5 250.0 L533.1 250.0 L534.8 250.0 L536.4 250.0 L538.0 250.0 L539.6 250.0 L541.2 250.0 L542.9 250.0 L544.5 250.0 L546.1 250.0 L547.8 250.0 L549.4 250.0 L551.0 250.0 L552.6 250.0 L554.2 250.0 L555.9 250.0 L557.5 250.0 L559.1 250.0 L560.8 250.0 L562.4 250.0 L564.0 250.0 L565.6 250.0 L567.2 250.0 L568.9 250.0 L570.5 250.0 L572.1 250.0 L573.8 250.0 L575.4 250.0 L577.0 250.0 L578.6 250.0 L580.3 250.0 L581.9 250.0 L583.5 250.0 L585.1 250.0 L586.8 250.0 L588.4 250.0 L590.0 250.0" fill="none" class="sr" stroke-width="2.4"/>
<path d="M70.0 248.2 L71.6 248.1 L73.2 248.1 L74.9 248.0 L76.5 247.9 L78.1 247.8 L79.8 247.7 L81.4 247.6 L83.0 247.5 L84.6 247.4 L86.2 247.3 L87.9 247.2 L89.5 247.1 L91.1 247.0 L92.7 246.9 L94.4 246.7 L96.0 246.6 L97.6 246.5 L99.3 246.4 L100.9 246.2 L102.5 246.1 L104.1 245.9 L105.7 245.8 L107.4 245.6 L109.0 245.5 L110.6 245.3 L112.3 245.1 L113.9 245.0 L115.5 244.8 L117.1 244.6 L118.8 244.4 L120.4 244.2 L122.0 244.0 L123.6 243.8 L125.2 243.6 L126.9 243.4 L128.5 243.2 L130.1 242.9 L131.8 242.7 L133.4 242.5 L135.0 242.2 L136.6 242.0 L138.2 241.7 L139.9 241.5 L141.5 241.2 L143.1 240.9 L144.8 240.6 L146.4 240.4 L148.0 240.1 L149.6 239.8 L151.2 239.5 L152.9 239.2 L154.5 238.8 L156.1 238.5 L157.7 238.2 L159.4 237.9 L161.0 237.5 L162.6 237.2 L164.2 236.8 L165.9 236.5 L167.5 236.1 L169.1 235.7 L170.8 235.4 L172.4 235.0 L174.0 234.6 L175.6 234.2 L177.3 233.8 L178.9 233.4 L180.5 233.0 L182.1 232.6 L183.8 232.2 L185.4 231.7 L187.0 231.3 L188.6 230.9 L190.2 230.4 L191.9 230.0 L193.5 229.5 L195.1 229.1 L196.8 228.6 L198.4 228.2 L200.0 227.7 L201.6 227.2 L203.3 226.7 L204.9 226.3 L206.5 225.8 L208.1 225.3 L209.8 224.8 L211.4 224.3 L213.0 223.8 L214.6 223.3 L216.2 222.8 L217.9 222.3 L219.5 221.8 L221.1 221.3 L222.7 220.8 L224.4 220.3 L226.0 219.8 L227.6 219.3 L229.2 218.8 L230.9 218.3 L232.5 217.8 L234.1 217.3 L235.8 216.7 L237.4 216.2 L239.0 215.7 L240.6 215.2 L242.3 214.7 L243.9 214.2 L245.5 213.7 L247.1 213.2 L248.8 212.7 L250.4 212.3 L252.0 211.8 L253.6 211.3 L255.2 210.8 L256.9 210.3 L258.5 209.9 L260.1 209.4 L261.7 209.0 L263.4 208.5 L265.0 208.1 L266.6 207.6 L268.3 207.2 L269.9 206.8 L271.5 206.3 L273.1 205.9 L274.8 205.5 L276.4 205.1 L278.0 204.8 L279.6 204.4 L281.2 204.0 L282.9 203.6 L284.5 203.3 L286.1 203.0 L287.8 202.6 L289.4 202.3 L291.0 202.0 L292.6 201.7 L294.2 201.4 L295.9 201.1 L297.5 200.9 L299.1 200.6 L300.8 200.4 L302.4 200.2 L304.0 199.9 L305.6 199.7 L307.2 199.5 L308.9 199.4 L310.5 199.2 L312.1 199.0 L313.8 198.9 L315.4 198.8 L317.0 198.7 L318.6 198.6 L320.2 198.5 L321.9 198.4 L323.5 198.3 L325.1 198.3 L326.7 198.3 L328.4 198.2 L330.0 198.2 L331.6 198.2 L333.3 198.3 L334.9 198.3 L336.5 198.3 L338.1 198.4 L339.8 198.5 L341.4 198.6 L343.0 198.7 L344.6 198.8 L346.2 198.9 L347.9 199.0 L349.5 199.2 L351.1 199.4 L352.8 199.5 L354.4 199.7 L356.0 199.9 L357.6 200.2 L359.2 200.4 L360.9 200.6 L362.5 200.9 L364.1 201.1 L365.8 201.4 L367.4 201.7 L369.0 202.0 L370.6 202.3 L372.2 202.6 L373.9 203.0 L375.5 203.3 L377.1 203.6 L378.8 204.0 L380.4 204.4 L382.0 204.8 L383.6 205.1 L385.3 205.5 L386.9 205.9 L388.5 206.3 L390.1 206.8 L391.7 207.2 L393.4 207.6 L395.0 208.1 L396.6 208.5 L398.3 209.0 L399.9 209.4 L401.5 209.9 L403.1 210.3 L404.8 210.8 L406.4 211.3 L408.0 211.8 L409.6 212.3 L411.2 212.7 L412.9 213.2 L414.5 213.7 L416.1 214.2 L417.8 214.7 L419.4 215.2 L421.0 215.7 L422.6 216.2 L424.2 216.7 L425.9 217.3 L427.5 217.8 L429.1 218.3 L430.8 218.8 L432.4 219.3 L434.0 219.8 L435.6 220.3 L437.2 220.8 L438.9 221.3 L440.5 221.8 L442.1 222.3 L443.8 222.8 L445.4 223.3 L447.0 223.8 L448.6 224.3 L450.3 224.8 L451.9 225.3 L453.5 225.8 L455.1 226.3 L456.7 226.7 L458.4 227.2 L460.0 227.7 L461.6 228.2 L463.3 228.6 L464.9 229.1 L466.5 229.5 L468.1 230.0 L469.8 230.4 L471.4 230.9 L473.0 231.3 L474.6 231.7 L476.2 232.2 L477.9 232.6 L479.5 233.0 L481.1 233.4 L482.8 233.8 L484.4 234.2 L486.0 234.6 L487.6 235.0 L489.2 235.4 L490.9 235.7 L492.5 236.1 L494.1 236.5 L495.8 236.8 L497.4 237.2 L499.0 237.5 L500.6 237.9 L502.2 238.2 L503.9 238.5 L505.5 238.8 L507.1 239.2 L508.8 239.5 L510.4 239.8 L512.0 240.1 L513.6 240.4 L515.3 240.6 L516.9 240.9 L518.5 241.2 L520.1 241.5 L521.8 241.7 L523.4 242.0 L525.0 242.2 L526.6 242.5 L528.2 242.7 L529.9 242.9 L531.5 243.2 L533.1 243.4 L534.8 243.6 L536.4 243.8 L538.0 244.0 L539.6 244.2 L541.2 244.4 L542.9 244.6 L544.5 244.8 L546.1 245.0 L547.8 245.1 L549.4 245.3 L551.0 245.5 L552.6 245.6 L554.2 245.8 L555.9 245.9 L557.5 246.1 L559.1 246.2 L560.8 246.4 L562.4 246.5 L564.0 246.6 L565.6 246.7 L567.2 246.9 L568.9 247.0 L570.5 247.1 L572.1 247.2 L573.8 247.3 L575.4 247.4 L577.0 247.5 L578.6 247.6 L580.3 247.7 L581.9 247.8 L583.5 247.9 L585.1 248.0 L586.8 248.1 L588.4 248.1 L590.0 248.2" fill="none" class="sb" stroke-width="2.4"/>
<circle cx="330.0" cy="244" r="4" class="fr sr"/>
<circle cx="297.5" cy="244" r="4" class="fr sr"/>
<circle cx="362.5" cy="244" r="4" class="fr sr"/>
<circle cx="297.5" cy="244" r="4" class="fr sr"/>
<circle cx="427.5" cy="234" r="4" class="fb sb"/>
<circle cx="200.0" cy="234" r="4" class="fb sb"/>
<circle cx="427.5" cy="234" r="4" class="fb sb"/>
<circle cx="265.0" cy="234" r="4" class="fb sb"/>
<line x1="330.0" y1="250" x2="330.0" y2="50" stroke="currentColor" stroke-dasharray="3 3" stroke-opacity="0.6"/><text x="334.0" y="62" font-size="11" class="tm">new: 20</text>
<line x1="232.5" y1="250" x2="232.5" y2="50" stroke="currentColor" stroke-dasharray="3 3" stroke-opacity="0.6"/><text x="236.5" y="62" font-size="11" class="tm">17</text>
<text x="359.2" y="90.0" class="tr" font-size="12">spam: mean 19.75, var 0.69</text>
<text x="437.2" y="190.0" class="tb" font-size="12">ham: mean 20, var 9.5</text>
<text x="79.8" y="130.0" class="tm" font-size="11">at 17: spam 0.0020, ham 0.081</text>
</svg><figcaption>The two length curves. Spam's four lengths (red dots) are bunched, so its curve is a tall spike; ham's (blue dots) are spread, so its curve is low and wide. At length 20 spam's curve is higher; at 17 ham's is 40 times higher. Tiny training sets give over-narrow spikes.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gaussian NB</strong>: P(xⱼ | c) = N(xⱼ; μ_{cj}, σ²_{cj}) with μ_{cj}, σ²_{cj} the class-c mean and (population) variance of feature j. sklearn adds <code>var_smoothing</code> × (largest variance of any feature) to every variance (<code>epsilon_</code>, here 1.1 × 10⁻⁴) so that a constant feature never gives σ² = 0.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Gaussian NB assumes a bell shape per class. Skewed features (ages, incomes, counts) fit badly; a log transform often helps (<a class="xref" data-note="ml_features">Feature Engineering</a>). Scaling does not change Gaussian NB's predictions (μ and σ scale together), so unlike KNN or SVM it does not need standardisation.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Categorical NB and Mixed Types.</b> We now have separate models for words, for yes/no columns and for numbers. A real message has all three kinds of clue at once.</div>

  <h2 id="nb-variants"><span class="num">09</span>Categorical NB, Complement NB and Mixing Types</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> The sender (known/unknown) and night (yes/no) columns are categories; the text is word counts; age and length are numbers. Each needs a different P(xⱼ | c). How do we combine them into one answer?</p>
  <h3>Categorical NB</h3>
  <p>For a column with categories, P(value | c) = (rows of class c with that value + α)/(rows of class c + α·(number of categories)). This is what we did by hand in section 03, now with smoothing. With α = 1: P(unknown | spam) = (3 + 1)/(4 + 2) = 0.667, P(night | spam) = 0.667, P(unknown | ham) = P(night | ham) = (1 + 1)/6 = 0.333. Scores 0.5 × 0.444 = 0.222 and 0.5 × 0.111 = 0.056 → 0.80 (smoothing pulled the unsmoothed 0.90 toward 0.5).</p>
  <h3>Mixing feature types</h3>
  <p>Because NB multiplies one factor per feature, separate NB models over disjoint feature groups can be combined by <strong>adding their log-probabilities</strong> and removing the extra copies of the prior (each model's posterior already includes ln P(c) once). In log-odds form: combined log-odds = Σ (each model's log-odds) − (models − 1) × prior log-odds.</p>
  <div class="fx" data-lang="py">from sklearn.naive_bayes import CategoricalNB
from sklearn.preprocessing import OrdinalEncoder
enc = OrdinalEncoder().fit(inbox[["sender", "night"]])
cat = CategoricalNB(alpha=1e-10).fit(enc.transform(inbox[["sender", "night"]]), y)
q = pd.DataFrame([{"sender": "unknown", "night": "yes"}])
print("CategoricalNB (alpha~0) P(spam | unknown, night):", round(cat.predict_proba(enc.transform(q))[0, 1], 3))
cat1 = CategoricalNB(alpha=1.0).fit(enc.transform(inbox[["sender", "night"]]), y)
print("CategoricalNB (alpha=1)  P(spam | unknown, night):", round(cat1.predict_proba(enc.transform(q))[0, 1], 3))
# mixing feature types: add the log-probabilities of separate NB models, subtract the extra log-prior
lp_text = mnb.predict_log_proba(vec.transform(["free lunch monday"]))[0]
lp_cat = cat1.predict_log_proba(enc.transform(q))[0]
lp_num = gnb.predict_log_proba(pd.DataFrame([new_msg]))[0]
log_prior = np.log([0.5, 0.5])
joint = lp_text + lp_cat + lp_num - 2 * log_prior
print("text alone", np.exp(lp_text[1]).round(3), "| sender+night alone", np.exp(lp_cat[1]).round(3),
      "| age+length alone", np.exp(lp_num[1]).round(3))
print("all clues combined: P(spam) =", round(float(np.exp(joint[1] - np.logaddexp(joint[0], joint[1]))), 3))</div>
  <div class="fx" data-lang="text">CategoricalNB (alpha~0) P(spam | unknown, night): 0.9
CategoricalNB (alpha=1)  P(spam | unknown, night): 0.8
text alone 0.382 | sender+night alone 0.8 | age+length alone 0.906
all clues combined: P(spam) = 0.96</div>
  <p>Line 1 matches section 03's unsmoothed 0.90, line 2 the smoothed 0.80. By hand in log-odds (priors are 50/50, so the prior term is 0): text ln(0.382/0.618) = −0.481, sender+night ln(0.8/0.2) = +1.386, age+length ln(0.906/0.094) = +2.265. Sum = +3.17 → P(spam) = 1/(1 + e^(−3.17)) = <strong>0.96</strong>. The words alone said ham; the metadata says spam strongly; NB simply adds the evidence.</p>
  <table class="tbl">
    <tr><th>sklearn class</th><th>Feature type</th><th>P(xⱼ | c)</th><th>Typical use</th></tr>
    <tr><td><code>MultinomialNB</code></td><td>counts (also TF-IDF)</td><td>(N_cj + α)/(N_c + αV)</td><td>text classification</td></tr>
    <tr><td><code>ComplementNB</code></td><td>counts</td><td>estimated from all <em>other</em> classes, then inverted</td><td>imbalanced text; often beats Multinomial</td></tr>
    <tr><td><code>BernoulliNB</code></td><td>binary</td><td>p^x(1 − p)^(1 − x)</td><td>short texts, flags</td></tr>
    <tr><td><code>GaussianNB</code></td><td>continuous</td><td>normal density</td><td>sensors, measurements</td></tr>
    <tr><td><code>CategoricalNB</code></td><td>categories (integer-encoded)</td><td>(count + α)/(n_c + α·K_j)</td><td>survey answers, codes</td></tr>
  </table>
  <p><strong>Complement NB</strong> (Rennie et al., 2003) estimates, for each class, the word distribution of all the <em>other</em> classes (much more data when a class is small) and picks the class whose complement fits the document <em>worst</em>. It corrects Multinomial NB's bias toward large classes on imbalanced text.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For disjoint feature groups G₁…G_m under the NB assumption: ln P(c | x) = ln P(c) + Σ_g Σ_{j∈G_g} ln P(xⱼ | c) − ln Z = Σ_g ln P_g(c | x_{G_g}) − (m − 1) ln P(c) − ln Z′. Each group may use its own distribution (multinomial, Gaussian, categorical).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>CategoricalNB</code> needs integer codes 0…K−1 (use <code>OrdinalEncoder</code>), not one-hot columns. One-hot columns fed to Multinomial or Bernoulli NB double-count: the "unknown" column and the "known" column are perfectly dependent.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: NB Is a Linear Model.</b> We have been adding log-probabilities, one per clue. That smells like a weighted sum. What kind of model is NB really, and how does it compare with logistic regression?</div>

  <h2 id="nb-linear"><span class="num">10</span>Naive Bayes Is a Linear Classifier</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> NB and logistic regression both output P(spam | x). Are they related, and when should we prefer one over the other?</p>
  <h3>The log-odds are a weighted sum</h3>
  <p>For two classes and Multinomial NB, take the log of the ratio of the two scores:</p>
  <p style="text-align:center"><strong>ln [P(spam | x)/P(ham | x)] = ln [P(spam)/P(ham)] + Σⱼ xⱼ · ln [P(wⱼ | spam)/P(wⱼ | ham)]</strong></p>
  <p>That is b + Σ wⱼxⱼ with bias b = prior log-odds and weight wⱼ = ln(P(wⱼ | spam)/P(wⱼ | ham)) for each word: exactly the form of <a class="xref" data-note="ml_classification">logistic regression</a>, z = b + w·x, followed by the sigmoid. By hand for "free lunch monday": b = ln(0.5/0.5) = 0; w_free = ln(0.100/0.0256) = +1.361; w_lunch = ln(0.025/0.0513) = −0.718; w_monday = ln(0.025/0.0769) = −1.124. z = −0.481 and σ(−0.481) = <strong>0.382</strong>.</p>
  <div class="fx" data-lang="py"># Multinomial NB as a linear model: log-odds = bias + sum_j count_j * weight_j
w_words = mnb.feature_log_prob_[1] - mnb.feature_log_prob_[0]          # log(P(w|spam) / P(w|ham))
bias = mnb.class_log_prior_[1] - mnb.class_log_prior_[0]
wt = pd.Series(w_words, index=vocab).sort_values()
print("most ham-like:", wt.head(3).round(3).to_dict())
print("most spam-like:", wt.tail(3).round(3).to_dict())
xq = vec.transform(["free lunch monday"]).toarray()[0]
lin = bias + xq @ w_words
lp = mnb.predict_log_proba(vec.transform(["free lunch monday"]))[0]
print(f"bias {bias:.3f} + free {w_words[vec.vocabulary_['free']]:.3f} + lunch {w_words[vec.vocabulary_['lunch']]:.3f}"
      f" + monday {w_words[vec.vocabulary_['monday']]:.3f} = {lin:.3f}")
print(f"sklearn log-odds = {lp[1] - lp[0]:.3f}  -&gt; sigmoid = {1 / (1 + np.exp(-lin)):.3f}")</div>
  <div class="fx" data-lang="text">most ham-like: {'monday': -1.124, 'at': -0.718, 'can': -0.718}
most spam-like: {'prize': 1.073, 'win': 1.073, 'free': 1.361}
bias 0.000 + free 1.361 + lunch -0.718 + monday -1.124 = -0.481
sklearn log-odds = -0.481  -&gt; sigmoid = 0.382</div>
  <p>The weights are a ready-made "spam dictionary": "free" (+1.361), "win" and "prize" (+1.073) push toward spam; "monday" (−1.124) toward ham. Bernoulli NB and Gaussian NB with equal variances per feature across classes are also linear; Gaussian NB with different variances gives a quadratic boundary.</p>
  <h3>Same form, different way of choosing the weights</h3>
  <p>NB sets each weight from counts, one feature at a time, as if the others did not exist. Logistic regression sets all weights jointly to maximise P(y | x), so it can correct for correlated features. Ng and Jordan (2002) showed the consequence: NB reaches its (higher) best error with far less data; logistic regression needs more data but ends lower when the naive assumption is wrong. To see this, we scale our inbox up to a simulated one: 300 word types, 30% spam, where some words always come as 4-word phrases (so independence is broken).</p>
  <p>The simulator, saved as <code>inbox_sim.py</code> next to the notebook (the next blocks import it):</p>
  <div class="fx" data-lang="py">"""A simulated SMS inbox: 300 word types w0..w299, 30% spam, 5-19 words per message.
Words w0..w19 always come as 4-word phrases (copied into w20-39, w40-59, w60-79),
which breaks the naive assumption."""
import numpy as np
V = 300
_rng = np.random.default_rng(0)
_base = _rng.dirichlet(np.ones(V) * 0.3)
SPAM_W = _base * np.exp(_rng.normal(0, 0.8, V)); SPAM_W /= SPAM_W.sum()
HAM_W = _base * np.exp(_rng.normal(0, 0.8, V)); HAM_W /= HAM_W.sum()

def make_inbox(n, seed):
    rng = np.random.default_rng(seed)
    y = (rng.random(n) &lt; 0.3).astype(int)
    X = np.zeros((n, V), dtype=int)
    for i in range(n):
        X[i] = rng.multinomial(rng.integers(5, 20), SPAM_W if y[i] else HAM_W)
    for k in (20, 40, 60):                            # phrases: w0 is always followed by w20, w40, w60
        X[:, k:k + 20] += X[:, 0:20]
    return X, y

def to_text(X):
    return [" ".join(f"w{j}" for j in np.repeat(np.arange(V), row)) for row in X]</div>
  <div class="fx" data-lang="py">from inbox_sim import make_inbox, to_text
from sklearn.linear_model import LogisticRegression
Xbig, ybig = make_inbox(3000, seed=1)                     # pool of training messages
Xtest, ytest = make_inbox(2000, seed=2)                   # fixed test inbox
print("spam share:", ybig.mean().round(3), " example message:", to_text(Xbig[:1])[0])
rng = np.random.default_rng(3)
print("train size   NB acc   LR acc   (mean of 10 random training sets)")
for n in [10, 30, 100, 300, 1000, 3000]:
    nb_acc, lr_acc = [], []
    for r in range(10 if n &lt; 3000 else 1):
        idx = rng.choice(len(ybig), n, replace=False)
        if ybig[idx].min() == ybig[idx].max():
            continue                                      # need both classes
        nb_acc.append(MultinomialNB().fit(Xbig[idx], ybig[idx]).score(Xtest, ytest))
        lr_acc.append(LogisticRegression(max_iter=2000).fit(Xbig[idx], ybig[idx]).score(Xtest, ytest))
    print(f"{n:9d}   {np.mean(nb_acc):.3f}    {np.mean(lr_acc):.3f}")</div>
  <div class="fx" data-lang="text">spam share: 0.306  example message: w3 w23 w42 w43 w63 w64 w64 w66 w78 w109 w120 w149 w228 w231 w231 w231 w231
train size   NB acc   LR acc   (mean of 10 random training sets)
       10   0.728    0.709
       30   0.813    0.801
      100   0.870    0.867
      300   0.900    0.903
     1000   0.919    0.921
     3000   0.925    0.932</div>
  <figure class="viz"><svg viewBox="0 0 640 290" width="640">
<line x1="70" y1="240" x2="590" y2="240" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="70" y1="240" x2="70" y2="50" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="70.0" y1="240" x2="70.0" y2="244" stroke="currentColor"/><text x="70.0" y="256" text-anchor="middle" class="tm" font-size="11">10</text>
<line x1="170.2" y1="240" x2="170.2" y2="244" stroke="currentColor"/><text x="170.2" y="256" text-anchor="middle" class="tm" font-size="11">30</text>
<line x1="279.9" y1="240" x2="279.9" y2="244" stroke="currentColor"/><text x="279.9" y="256" text-anchor="middle" class="tm" font-size="11">100</text>
<line x1="380.1" y1="240" x2="380.1" y2="244" stroke="currentColor"/><text x="380.1" y="256" text-anchor="middle" class="tm" font-size="11">300</text>
<line x1="489.8" y1="240" x2="489.8" y2="244" stroke="currentColor"/><text x="489.8" y="256" text-anchor="middle" class="tm" font-size="11">1000</text>
<line x1="590.0" y1="240" x2="590.0" y2="244" stroke="currentColor"/><text x="590.0" y="256" text-anchor="middle" class="tm" font-size="11">3000</text>
<line x1="66" y1="240.0" x2="70" y2="240.0" stroke="currentColor"/><text x="63" y="244.0" text-anchor="end" class="tm" font-size="11">0.7</text>
<line x1="66" y1="202.0" x2="70" y2="202.0" stroke="currentColor"/><text x="63" y="206.0" text-anchor="end" class="tm" font-size="11">0.75</text>
<line x1="66" y1="164.0" x2="70" y2="164.0" stroke="currentColor"/><text x="63" y="168.0" text-anchor="end" class="tm" font-size="11">0.8</text>
<line x1="66" y1="126.0" x2="70" y2="126.0" stroke="currentColor"/><text x="63" y="130.0" text-anchor="end" class="tm" font-size="11">0.85</text>
<line x1="66" y1="88.0" x2="70" y2="88.0" stroke="currentColor"/><text x="63" y="92.0" text-anchor="end" class="tm" font-size="11">0.9</text>
<line x1="66" y1="50.0" x2="70" y2="50.0" stroke="currentColor"/><text x="63" y="54.0" text-anchor="end" class="tm" font-size="11">0.95</text>
<text x="330.0" y="272" text-anchor="middle" font-size="12">training messages (log scale)</text>
<text x="30" y="145.0" text-anchor="middle" font-size="12" transform="rotate(-90 30 145.0)">test accuracy</text>
<path d="M70.0 218.7 L170.2 154.1 L279.9 110.8 L380.1 88.0 L489.8 73.6 L590.0 69.0" fill="none" class="sr" stroke-width="2.4"/>
<circle cx="70.0" cy="218.7" r="4" class="fr sr"/>
<circle cx="170.2" cy="154.1" r="4" class="fr sr"/>
<circle cx="279.9" cy="110.8" r="4" class="fr sr"/>
<circle cx="380.1" cy="88.0" r="4" class="fr sr"/>
<circle cx="489.8" cy="73.6" r="4" class="fr sr"/>
<circle cx="590.0" cy="69.0" r="4" class="fr sr"/>
<path d="M70.0 233.2 L170.2 163.2 L279.9 113.1 L380.1 85.7 L489.8 72.0 L590.0 63.7" fill="none" class="sb" stroke-width="2.4"/>
<circle cx="70.0" cy="233.2" r="4" class="fb sb"/>
<circle cx="170.2" cy="163.2" r="4" class="fb sb"/>
<circle cx="279.9" cy="113.1" r="4" class="fb sb"/>
<circle cx="380.1" cy="85.7" r="4" class="fb sb"/>
<circle cx="489.8" cy="72.0" r="4" class="fb sb"/>
<circle cx="590.0" cy="63.7" r="4" class="fb sb"/>
<text x="107.0" y="230.9" class="tr" font-size="12">Naive Bayes: ahead with little data</text>
<text x="288.6" y="53.8" class="tb" font-size="12">Logistic regression: ahead with lots</text>
</svg><figcaption>Test accuracy against the number of training messages (mean of 10 random draws). NB is ahead at 10–100 messages; logistic regression overtakes from about 300 and ends higher (0.932 vs 0.925) because it can down-weight the duplicated phrase words.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>Multinomial and Bernoulli NB are <strong>linear classifiers</strong> in their features: log-odds = b + wᵀx with wⱼ = ln(θ_{1j}/θ_{0j}) (multinomial). NB and logistic regression form a <strong>generative–discriminative pair</strong>: same hypothesis family, parameters estimated by maximising the joint likelihood P(x, y) (NB) vs the conditional likelihood P(y | x) (LR).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"NB is always worse than logistic regression" is false: with little data or very many features (short texts, few labels), NB often wins, and it trains in one pass. With lots of data and correlated features, LR usually wins. Try both.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Calibration.</b> Accuracy compares decisions. If a bank, a doctor or a ranking system uses the <em>probability</em> itself, we must ask whether NB's 0.999 really means 99.9%.</div>

  <h2 id="nb-calib"><span class="num">11</span>Calibration: Can We Trust NB's Probabilities?</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> In section 03 a duplicated clue pushed P(spam) from 0.75 to 0.964 with no new information. On a real inbox, where many words come in phrases, how far off are NB's probabilities, and can we repair them?</p>
  <h3>What "calibrated" means</h3>
  <p>A model is <strong>calibrated</strong> if, among all messages it scores at about 0.9, about 90% really are spam. Calibration is checked by grouping predictions into bins and comparing the average prediction with the actual rate (a reliability table), and summarised by log-loss and the Brier score (mean squared difference between p and the 0/1 outcome). Full treatment: <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</p>
  <h3>Why NB is over-confident</h3>
  <p>Correlated clues are counted as independent evidence. A 4-word phrase that always appears together contributes its log-likelihood ratio four times. Each extra copy multiplies the odds again, pushing p toward 0 or 1. The decision (which side of 0.5) is often still right, but the size of the probability is exaggerated.</p>
  <div class="fx" data-lang="py">from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss, log_loss
models = {"MultinomialNB": MultinomialNB(),
          "NB + isotonic": CalibratedClassifierCV(MultinomialNB(), method="isotonic", cv=5),
          "NB + sigmoid": CalibratedClassifierCV(MultinomialNB(), method="sigmoid", cv=5),
          "LogisticRegression": LogisticRegression(max_iter=2000)}
probs = {}
print(f"{'model':20s} acc    log-loss  Brier   share p&lt;0.01 or p&gt;0.99   wrong among those")
for name, mdl in models.items():
    p = mdl.fit(Xbig, ybig).predict_proba(Xtest)[:, 1]
    probs[name] = p
    print(f"{name:20s} {np.mean((p &gt; 0.5) == ytest):.3f}  {log_loss(ytest, p):.3f}     {brier_score_loss(ytest, p):.3f}   "
          f"{np.mean((p &lt; 0.01) | (p &gt; 0.99)):.3f}                   "
          f"{np.sum(((p &lt; 0.01) &amp; (ytest == 1)) | ((p &gt; 0.99) &amp; (ytest == 0)))}")
print("\\nreliability: predicted bin -&gt; actual spam rate (count)")
bins = [0, 0.01, 0.1, 0.5, 0.9, 0.99, 1.0]
for name in ["MultinomialNB", "NB + isotonic"]:
    cut = pd.cut(probs[name], bins, include_lowest=True)
    t = pd.DataFrame({"bin": cut, "y": ytest}).groupby("bin", observed=False).y.agg(["mean", "size"])
    print(name, "  ".join(f"{str(i)}: {m:.2f} ({s})" for i, (m, s) in t.iterrows()))</div>
  <div class="fx" data-lang="text">model                acc    log-loss  Brier   share p&lt;0.01 or p&gt;0.99   wrong among those
MultinomialNB        0.925  0.196     0.055   0.628                   11
NB + isotonic        0.924  0.197     0.055   0.529                   3
NB + sigmoid         0.924  0.206     0.058   0.000                   0
LogisticRegression   0.932  0.162     0.050   0.526                   0

reliability: predicted bin -&gt; actual spam rate (count)
MultinomialNB (-0.001, 0.01]: 0.00 (931.0)  (0.01, 0.1]: 0.07 (274.0)  (0.1, 0.5]: 0.33 (192.0)  (0.5, 0.9]: 0.71 (147.0)  (0.9, 0.99]: 0.91 (130.0)  (0.99, 1.0]: 0.98 (326.0)
NB + isotonic (-0.001, 0.01]: 0.00 (893.0)  (0.01, 0.1]: 0.05 (261.0)  (0.1, 0.5]: 0.29 (238.0)  (0.5, 0.9]: 0.73 (201.0)  (0.9, 0.99]: 0.95 (242.0)  (0.99, 1.0]: 1.00 (165.0)</div>
  <ul>
    <li><strong>Extremes</strong>: NB puts 62.8% of messages below 0.01 or above 0.99; logistic regression 52.6%.</li>
    <li><strong>Confident mistakes</strong>: among those extreme predictions NB is wrong 11 times (saying "&lt; 1% spam" for spam or "&gt; 99%" for ham); logistic regression 0 times. These few mistakes cost a lot of log-loss: NB 0.196 vs LR 0.162 at almost the same accuracy.</li>
    <li><strong>Calibrating NB</strong> with <code>CalibratedClassifierCV</code> (5-fold): isotonic regression cuts the confident mistakes to 3 and moves the top bin's accuracy from 0.98 to 1.00; sigmoid (Platt) scaling removes all extreme predictions. Neither changes accuracy much: calibration fixes probabilities, not rankings. Here neither beats LR's log-loss, because NB's ranking itself is hurt by the double counting.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>A classifier is <strong>calibrated</strong> if P(y = 1 | p̂(x) = q) = q for all q. NB violates this systematically when features are positively dependent within a class, producing probabilities too close to 0 and 1. <strong>Platt scaling</strong> fits σ(a·score + b) on held-out data; <strong>isotonic regression</strong> fits a free increasing step function.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not threshold NB probabilities at business-meaningful values ("block above 0.99") without calibrating first, and never calibrate on the training data (use <code>CalibratedClassifierCV</code>'s cross-validation or a separate validation set).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: sklearn in Practice.</b> We know what every NB variant computes and where it fails. We have not yet built a proper text pipeline, chosen α by cross-validation, or learnt from a stream of messages.</div>

  <h2 id="nb-sklearn"><span class="num">12</span>scikit-learn in Practice</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Which vectoriser, which NB class and which α should our spam filter use, and how do we keep it learning as new messages arrive without retraining from scratch?</p>
  <h3>Parameters and attributes</h3>
  <table class="tbl">
    <tr><th>Parameter</th><th>Classes</th><th>Meaning</th></tr>
    <tr><td><code>alpha</code> (1.0)</td><td>Multinomial, Complement, Bernoulli, Categorical</td><td>Additive smoothing; tune on a log grid</td></tr>
    <tr><td><code>force_alpha</code> (True)</td><td>same</td><td>Keep very small α as given (else clipped to 1e-10)</td></tr>
    <tr><td><code>fit_prior</code> (True) / <code>class_prior</code></td><td>discrete NBs</td><td>Learn P(c) from data, use uniform (False), or give your own</td></tr>
    <tr><td><code>priors</code></td><td>GaussianNB</td><td>Fixed class priors</td></tr>
    <tr><td><code>var_smoothing</code> (1e-9)</td><td>GaussianNB</td><td>Fraction of the largest variance added to all variances</td></tr>
    <tr><td><code>binarize</code> (0.0)</td><td>BernoulliNB</td><td>Threshold that turns inputs into 0/1 (None = already binary)</td></tr>
    <tr><td><code>norm</code> (False)</td><td>ComplementNB</td><td>Second weight normalisation from the paper</td></tr>
    <tr><td><code>min_categories</code></td><td>CategoricalNB</td><td>Number of categories per feature (for unseen codes)</td></tr>
  </table>
  <p>Fitted attributes: <code>class_count_</code>, <code>class_log_prior_</code>, <code>feature_count_</code> and <code>feature_log_prob_</code> (discrete NBs: log P(w | c), shape (classes, features)), <code>theta_</code>, <code>var_</code>, <code>epsilon_</code> (Gaussian). All NB classes support <code>partial_fit</code>.</p>
  <div class="fx" data-lang="py">from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
texts_tr, texts_te = to_text(Xbig), to_text(Xtest)
pipe = Pipeline([("vec", CountVectorizer(token_pattern=r"\\S+")), ("nb", MultinomialNB())])
grid = GridSearchCV(pipe, {"vec": [CountVectorizer(token_pattern=r"\\S+"), TfidfVectorizer(token_pattern=r"\\S+")],
                           "nb": [MultinomialNB(), ComplementNB(), BernoulliNB()],
                           "nb__alpha": [0.01, 0.1, 1.0]}, cv=5, scoring="neg_log_loss", n_jobs=1)
grid.fit(texts_tr, ybig)
res = pd.DataFrame(grid.cv_results_)
res["vec"] = res.param_vec.map(lambda v: type(v).__name__); res["nb"] = res.param_nb.map(lambda v: type(v).__name__)
print(res.pivot_table(index=["nb", "vec"], columns="param_nb__alpha", values="mean_test_score").round(3))
best = grid.best_estimator_
print("best:", type(best["vec"]).__name__, type(best["nb"]).__name__, "alpha", best["nb"].alpha,
      f"| test acc {best.score(texts_te, ytest):.3f}")
# streaming: learn from three batches with partial_fit
stream = MultinomialNB()
for k, (a, b) in enumerate([(0, 1000), (1000, 2000), (2000, 3000)]):
    stream.partial_fit(Xbig[a:b], ybig[a:b], classes=[0, 1])
    print(f"after batch {k + 1}: messages seen {int(stream.class_count_.sum())}, test acc {stream.score(Xtest, ytest):.3f}")
full = MultinomialNB().fit(Xbig, ybig)
print("same as one fit on all 3000:", np.allclose(stream.feature_log_prob_, full.feature_log_prob_))
print("attributes:", "class_count_", full.class_count_, " feature_count_ shape", full.feature_count_.shape,
      " class_log_prior_", full.class_log_prior_.round(3))</div>
  <div class="fx" data-lang="text">param_nb__alpha                 0.01   0.10   1.00
nb            vec                                 
BernoulliNB   CountVectorizer -0.213 -0.206 -0.202
              TfidfVectorizer -0.213 -0.206 -0.202
ComplementNB  CountVectorizer -0.198 -0.192 -0.188
              TfidfVectorizer -0.291 -0.290 -0.300
MultinomialNB CountVectorizer -0.190 -0.184 -0.181
              TfidfVectorizer -0.273 -0.270 -0.279
best: CountVectorizer MultinomialNB alpha 1.0 | test acc 0.925
after batch 1: messages seen 1000, test acc 0.919
after batch 2: messages seen 2000, test acc 0.923
after batch 3: messages seen 3000, test acc 0.925
same as one fit on all 3000: True
attributes: class_count_ [2081.  919.]  feature_count_ shape (2, 300)  class_log_prior_ [-0.366 -1.183]</div>
  <ul>
    <li><strong>Grid search</strong> (5-fold CV, scored by log-loss, higher = better): raw counts beat TF-IDF for Multinomial and Complement NB here (TF-IDF breaks the "word counts" model the probabilities assume; it often helps accuracy on real text, so test both). Bernoulli is unaffected by the vectoriser, since it only sees presence. The winner is CountVectorizer + MultinomialNB with α = 1, test accuracy 0.925.</li>
    <li><strong>partial_fit</strong>: NB's "training" is just adding counts, so learning from three batches of 1,000 gives <em>exactly</em> the same model as one fit on 3,000 (<code>True</code>). The filter can update every night with new labelled messages, in constant memory. Pass <code>classes=</code> on the first call.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>Typical text pipeline: <code>Pipeline([("vec", CountVectorizer()), ("nb", MultinomialNB(alpha=...))])</code>, tuned with <code>GridSearchCV</code> over <code>vec__ngram_range</code>, <code>vec__min_df</code> and <code>nb__alpha</code>. Training cost O(n · d) (one pass of counting), prediction O(non-zero words × classes), memory O(classes × V).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fit the vectoriser inside the pipeline: fitting it on all data before splitting leaks test vocabulary into training (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). And <code>MultinomialNB</code> rejects negative inputs, so do not put a <code>StandardScaler</code> in front of it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From Scratch.</b> We trust sklearn's numbers, but can we write the whole thing ourselves in a few lines and get identical results?</div>

  <h2 id="nb-scratch"><span class="num">13</span>From Scratch, Matched to sklearn</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Every number so far came from a hand table or a library. Can we turn the hand tables of sections 04, 06 and 08 into code that reproduces sklearn exactly?</p>
  <p>Two short classes. <code>ScratchMultinomialNB</code>: add α to the word counts per class, normalise each row to get log P(w | c), add log P(c), and normalise with log-sum-exp (sections 04–06). <code>ScratchGaussianNB</code>: per-class means and population variances plus sklearn's epsilon, then the log of the normal density summed over features (section 08).</p>
  <div class="fx" data-lang="py">from scipy.special import logsumexp

class ScratchMultinomialNB:
    def __init__(self, alpha=1.0):
        self.alpha = alpha
    def fit(self, X, y):
        X = np.asarray(X.todense()) if hasattr(X, "todense") else np.asarray(X)
        self.classes_ = np.unique(y)
        counts = np.array([X[y == c].sum(axis=0) for c in self.classes_]) + self.alpha    # smoothed word counts
        self.log_theta_ = np.log(counts / counts.sum(axis=1, keepdims=True))            # log P(word | class)
        self.log_prior_ = np.log(np.array([np.mean(y == c) for c in self.classes_]))     # log P(class)
        return self
    def predict_log_proba(self, X):
        X = np.asarray(X.todense()) if hasattr(X, "todense") else np.asarray(X)
        joint = self.log_prior_ + X @ self.log_theta_.T                                 # log P(c) + sum count*log P(w|c)
        return joint - logsumexp(joint, axis=1, keepdims=True)                          # normalise in log space
    def predict_proba(self, X):
        return np.exp(self.predict_log_proba(X))
    def predict(self, X):
        return self.classes_[self.predict_log_proba(X).argmax(axis=1)]

class ScratchGaussianNB:
    def __init__(self, var_smoothing=1e-9):
        self.var_smoothing = var_smoothing
    def fit(self, X, y):
        X = np.asarray(X, dtype=float)
        self.classes_ = np.unique(y)
        eps = self.var_smoothing * X.var(axis=0).max()                                   # sklearn's epsilon_
        self.mu_ = np.array([X[y == c].mean(axis=0) for c in self.classes_])
        self.var_ = np.array([X[y == c].var(axis=0) for c in self.classes_]) + eps
        self.log_prior_ = np.log(np.array([np.mean(y == c) for c in self.classes_]))
        return self
    def predict_proba(self, X):
        X = np.asarray(X, dtype=float)
        ll = -0.5 * (np.log(2 * np.pi * self.var_)[None] + (X[:, None, :] - self.mu_[None]) ** 2 / self.var_[None]).sum(axis=2)
        joint = self.log_prior_ + ll
        return np.exp(joint - logsumexp(joint, axis=1, keepdims=True))

sm = ScratchMultinomialNB().fit(X, y)
print("8 messages, 'free lunch monday': scratch", sm.predict_proba(vec.transform(["free lunch monday"]))[0, 1].round(3),
      " sklearn", mnb.predict_proba(vec.transform(["free lunch monday"]))[0, 1].round(3))
sm_big = ScratchMultinomialNB().fit(Xbig, ybig)
print("big inbox: max |proba diff| vs sklearn =", f"{np.abs(sm_big.predict_proba(Xtest) - full.predict_proba(Xtest)).max():.1e}",
      " same labels:", np.array_equal(sm_big.predict(Xtest), full.predict(Xtest)))
sg = ScratchGaussianNB().fit(inbox[num], y)
print("Gaussian, new message: scratch", sg.predict_proba(pd.DataFrame([new_msg]))[0, 1].round(4),
      " sklearn", gnb.predict_proba(pd.DataFrame([new_msg]))[0, 1].round(4),
      f" max |var diff| {np.abs(sg.var_ - gnb.var_).max():.1e}")</div>
  <div class="fx" data-lang="text">8 messages, 'free lunch monday': scratch 0.382  sklearn 0.382
big inbox: max |proba diff| vs sklearn = 1.4e-14  same labels: True
Gaussian, new message: scratch 0.9056  sklearn 0.9056  max |var diff| 0.0e+00</div>
  <p>On the eight messages the scratch class gives 0.382 like sklearn; on the 2,000-message simulated test inbox the probabilities agree to 10⁻¹⁴ (floating-point noise) with identical labels; the Gaussian version gives 0.9056 with identical variances. The key line is <code>joint = self.log_prior_ + X @ self.log_theta_.T</code>: a matrix product of counts with log-probabilities is exactly the linear model of section 10.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Common bugs in hand-written NB: sample variance (ddof = 1) instead of population variance; forgetting to smooth words that occur only in the other class; normalising with a plain sum of exponentials (underflow); using document counts in Multinomial NB.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: When to Use It.</b> We can build and run NB. When is it the right choice compared with its siblings and with trees?</div>

  <h2 id="nb-when"><span class="num">14</span>When to Use Naive Bayes, and Comparisons</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Given a new classification problem, should we start with NB, logistic regression, KNN, SVM or a tree model?</p>
  <div class="cards">
    <div><b>Strengths</b><p>Trains in one pass of counting, no iterations; works with tiny datasets; handles 100,000+ features (words) easily; streaming updates via partial_fit; missing features can simply be skipped (leave out their factor); each weight is readable.</p><small>A classic first baseline for text and spam</small></div>
    <div><b>Weaknesses</b><p>Independence assumption double-counts correlated features; probabilities over-confident; cannot learn interactions ("free" is spammy unless the sender is known); Gaussian NB assumes bell-shaped features; usually beaten by logistic regression or boosting with lots of data.</p><small>Calibrate before using probabilities</small></div>
    <div><b>Use it when</b><p>Short texts or documents, many sparse features, few labels, need for speed (real-time filters, very large corpora), or as a fast baseline and a feature for other models (NB log-count ratios are strong features for linear models: "NB-SVM").</p><small>Spam, sentiment, topic tagging, language detection</small></div>
  </div>
  <table class="tbl">
    <tr><th></th><th>Naive Bayes</th><th><a class="xref" data-note="ml_classification">Logistic regression</a></th><th><a class="xref" data-note="ml_knn">KNN</a></th><th><a class="xref" data-note="ml_svm">SVM</a></th><th><a class="xref" data-note="ml_dtree">Trees</a> / <a class="xref" data-note="ml_gbm">boosting</a></th></tr>
    <tr><td>Approach</td><td>Generative, counting</td><td>Discriminative, optimisation</td><td>Instance-based</td><td>Max margin</td><td>Recursive splits</td></tr>
    <tr><td>Training</td><td>One pass, O(n·d)</td><td>Iterative</td><td>None (stores data)</td><td>O(n²)–O(n³) with kernels</td><td>Iterative, heavier</td></tr>
    <tr><td>Small data</td><td>Best</td><td>Good with regularization</td><td>OK</td><td>Good</td><td>Unstable / overfits</td></tr>
    <tr><td>Correlated features</td><td>Double counts</td><td>Handles (shares weight)</td><td>Distances distorted</td><td>Handles</td><td>Handles</td></tr>
    <tr><td>Interactions</td><td>No</td><td>Only if engineered</td><td>Yes</td><td>With kernels</td><td>Yes</td></tr>
    <tr><td>Probabilities</td><td>Too extreme</td><td>Good</td><td>Coarse</td><td>Need calibration</td><td>Decent (boosting)</td></tr>
    <tr><td>Scaling needed</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td><td>No</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing NB "because the features are independent" is backwards: features are almost never independent. Choose it because it is fast, needs little data, and ranks well; verify by cross-validation against logistic regression.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have met each concept on its own. Next we lay them side by side and see how each is built from the previous ones.</div>

  <h2 id="nb-connect"><span class="num">15</span>How It All Connects</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Bayes' theorem, the MAP rule, the naive product, smoothing, logs, the three likelihood models, the linear form and calibration: how does each one come out of the one before, and which question does each answer?</p>
  <figure class="viz"><svg viewBox="0 0 700 360" width="700">
<defs><marker id="nb-ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="14" width="150" height="54" rx="8" class="fs" stroke="currentColor"/><text x="85" y="36" text-anchor="middle" font-size="12.5">counts per class</text><text x="85" y="54" text-anchor="middle" class="tm" font-size="11">3 of 4 spam unknown</text>
<line x1="160" y1="41" x2="188" y2="41" stroke="currentColor" marker-end="url(#nb-ca)"/>
<rect x="190" y="14" width="150" height="54" rx="8" class="fb sb"/><text x="265" y="36" text-anchor="middle" font-size="12.5">Bayes' theorem</text><text x="265" y="54" text-anchor="middle" class="tm" font-size="11">P(spam|unknown) = 0.75</text>
<line x1="340" y1="41" x2="368" y2="41" stroke="currentColor" marker-end="url(#nb-ca)"/>
<rect x="370" y="14" width="150" height="54" rx="8" class="fb sb"/><text x="445" y="36" text-anchor="middle" font-size="12.5">MAP rule</text><text x="445" y="54" text-anchor="middle" class="tm" font-size="11">argmax P(c)·P(x|c)</text>
<line x1="520" y1="41" x2="548" y2="41" stroke="currentColor" marker-end="url(#nb-ca)"/>
<rect x="550" y="14" width="140" height="54" rx="8" class="fb sb"/><text x="620" y="36" text-anchor="middle" font-size="12.5">naive product</text><text x="620" y="54" text-anchor="middle" class="tm" font-size="11">Π P(xⱼ|c): 0.90</text>
<line x1="620" y1="68" x2="620" y2="98" stroke="currentColor"/>
<line x1="110" y1="98" x2="620" y2="98" stroke="currentColor"/>
<line x1="110" y1="98" x2="110" y2="118" stroke="currentColor" marker-end="url(#nb-ca)"/><line x1="345" y1="98" x2="345" y2="118" stroke="currentColor" marker-end="url(#nb-ca)"/><line x1="580" y1="98" x2="580" y2="118" stroke="currentColor" marker-end="url(#nb-ca)"/>
<rect x="20" y="120" width="180" height="54" rx="8" class="ft st"/><text x="110" y="141" text-anchor="middle" font-size="12.5">Multinomial / Bernoulli</text><text x="110" y="159" text-anchor="middle" class="tm" font-size="11">word counts: 0.382 / 0.292</text>
<rect x="255" y="120" width="180" height="54" rx="8" class="ft st"/><text x="345" y="141" text-anchor="middle" font-size="12.5">Categorical</text><text x="345" y="159" text-anchor="middle" class="tm" font-size="11">sender, night: 0.80</text>
<rect x="490" y="120" width="180" height="54" rx="8" class="ft st"/><text x="580" y="141" text-anchor="middle" font-size="12.5">Gaussian</text><text x="580" y="159" text-anchor="middle" class="tm" font-size="11">μ, σ²: age, length 0.906</text>
<line x1="110" y1="174" x2="110" y2="208" stroke="currentColor" marker-end="url(#nb-ca)"/><text x="118" y="196" class="tm" font-size="10.5">zero counts → + α smoothing</text>
<rect x="20" y="210" width="180" height="40" rx="8" class="fv" stroke="currentColor"/><text x="110" y="235" text-anchor="middle" font-size="12">(count + α)/(N + αV)</text>
<line x1="110" y1="250" x2="300" y2="284" stroke="currentColor" marker-end="url(#nb-ca)"/><line x1="345" y1="174" x2="345" y2="282" stroke="currentColor" marker-end="url(#nb-ca)"/><line x1="580" y1="174" x2="390" y2="284" stroke="currentColor" marker-end="url(#nb-ca)"/>
<rect x="230" y="286" width="230" height="54" rx="8" class="fg sg"/><text x="345" y="306" text-anchor="middle" font-size="12.5">sum of logs + log-sum-exp</text><text x="345" y="324" text-anchor="middle" class="tm" font-size="11">all clues: P(spam) = 0.96</text>
<line x1="460" y1="313" x2="498" y2="313" stroke="currentColor" marker-end="url(#nb-ca)"/>
<rect x="500" y="286" width="190" height="54" rx="8" class="fg sg"/><text x="595" y="306" text-anchor="middle" font-size="12.5">= linear log-odds</text><text x="595" y="324" text-anchor="middle" class="tm" font-size="11">b + Σ wⱼxⱼ · twin of LR</text>
<line x1="230" y1="313" x2="190" y2="313" stroke="currentColor" marker-end="url(#nb-ca)"/>
<rect x="20" y="286" width="170" height="54" rx="8" class="fr sr"/><text x="105" y="306" text-anchor="middle" font-size="12.5">calibration check</text><text x="105" y="324" text-anchor="middle" class="tm" font-size="11">double counting → extremes</text>
</svg><figcaption>Counts feed Bayes' theorem; Bayes' theorem with many clues becomes the MAP rule; the naive product makes it estimable; each feature type gets its own P(xⱼ | c); smoothing fixes zero counts; logs make the product computable and reveal the linear form; double counting makes calibration necessary.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the eight-message inbox</caption>
    <tr><th>Concept</th><th>Built from</th><th>Formula</th><th>Question it answers</th><th>Inbox value</th><th>Robust / sensitive · use when</th></tr>
    <tr><td>Prior</td><td>class counts</td><td>P(c) = n_c/n</td><td>how common is spam?</td><td>0.5</td><td>Wrong if training mix ≠ real mix; set <code>class_prior</code></td></tr>
    <tr><td>Likelihood</td><td>counts within a class</td><td>P(x | c)</td><td>how typical is the clue of the class?</td><td>P(unknown | spam) = 0.75</td><td>Noisy with few rows</td></tr>
    <tr><td>Bayes' theorem</td><td>prior, likelihood, total probability</td><td>P(x | c)P(c)/Σ_k P(x | k)P(k)</td><td>flip the conditional</td><td>P(spam | unknown) = 0.75</td><td>Exact; always valid</td></tr>
    <tr><td>MAP rule</td><td>Bayes' theorem, drop P(x)</td><td>argmax_c P(c)P(x | c)</td><td>which class to predict?</td><td>–</td><td>Optimal if P(x | c) were known</td></tr>
    <tr><td>Naive product</td><td>MAP + conditional independence</td><td>P(c)Πⱼ P(xⱼ | c)</td><td>estimate P(x | c) from little data</td><td>unknown + night: 0.90 (true 3/3)</td><td>Double counts dependent clues</td></tr>
    <tr><td>Multinomial NB</td><td>naive product on word counts</td><td>θ_cj = (N_cj + α)/(N_c + αV)</td><td>text as clues</td><td>"free lunch monday": 0.382</td><td>Counts repeats; long documents</td></tr>
    <tr><td>Laplace smoothing</td><td>pseudo-counts</td><td>+α to every count</td><td>avoid zero vetoes</td><td>P(lunch | spam) 0 → 0.025</td><td>Tune α; large α → prior only</td></tr>
    <tr><td>Logs / log-sum-exp</td><td>naive product</td><td>Σ ln, subtract max</td><td>avoid underflow</td><td>−10.374 vs −9.892 → 0.382</td><td>Always use</td></tr>
    <tr><td>Bernoulli NB</td><td>naive product on presence</td><td>p^x(1 − p)^(1 − x)</td><td>absence as evidence</td><td>0.292</td><td>Short texts</td></tr>
    <tr><td>Gaussian NB</td><td>naive product on numbers</td><td>N(x; μ_c, σ²_c)</td><td>continuous clues</td><td>age 40, length 20: 0.906</td><td>Sensitive to tiny variances, skew</td></tr>
    <tr><td>Combining types</td><td>adding log-probabilities</td><td>Σ log-odds − (m − 1)·prior log-odds</td><td>use every clue</td><td>−0.481 + 1.386 + 2.265 → 0.96</td><td>Same independence caveat</td></tr>
    <tr><td>Linear form</td><td>log of the score ratio</td><td>b + Σ xⱼ ln(θ_1j/θ_0j)</td><td>what model is NB?</td><td>free +1.361, monday −1.124</td><td>Twin of logistic regression</td></tr>
    <tr><td>Calibration</td><td>reliability, log-loss</td><td>P(y | p̂ = q) = q?</td><td>are probabilities honest?</td><td>(simulated) 11 confident mistakes</td><td>Calibrate before using p</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The chain shows how the pieces fit when used correctly; next, the ways people most often misuse them.</div>

  <h2 id="nb-traps"><span class="num">16</span>Common Mistakes</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We know how NB works. Where do practitioners, and interview answers, most often go wrong?</p>
  <div class="callout trap"><span class="label">Trap: "assumes features are independent"</span>
    <p>It assumes conditional independence given the class, not overall independence.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no smoothing</span>
    <p>One unseen word gives probability 0 and vetoes a class (α ≈ 0 gave P(spam) = 0.000 for "free lunch monday").</p>
  </div>
  <div class="callout trap"><span class="label">Trap: multiplying probabilities</span>
    <p>Products underflow to 0 on long documents; sum logs and normalise with log-sum-exp.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting the probabilities</span>
    <p>Double-counted evidence makes NB over-confident (11 confident mistakes vs 0 for LR). Use the ranking freely; calibrate before using the number.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong variant for the data</span>
    <p>Counts → Multinomial/Complement; binary → Bernoulli; continuous → Gaussian; categories as integer codes → Categorical. TF-IDF into MultinomialNB works in practice but is no longer a count model; negative (scaled) values are rejected.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: duplicated or highly correlated features</span>
    <p>Duplicates multiply the same evidence (0.75 → 0.964 with three copies). Remove duplicates, or use logistic regression.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: priors from a skewed training set</span>
    <p>If you down-sampled ham for training, the learnt prior is wrong for the real inbox; set <code>class_prior</code> to the true rate or correct the threshold.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: Gaussian NB on tiny or skewed samples</span>
    <p>Four spam lengths gave variance 0.69 and made length 17 "impossible" for spam (0.906 → 0.062). Use more data, larger <code>var_smoothing</code>, or transform skewed features.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything is covered; next comes the whole note condensed for revision.</div>

  <h2 id="nb-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Naive Bayes is a generative classifier: it estimates how often each clue appears in each class, assumes the clues are independent within a class, and combines them with Bayes' theorem into P(class | clues). Training is counting; prediction is a sum of logs. Running example: eight SMS messages (4 spam, 4 ham); new message "free lunch monday".</p>
  <h3>The story in one line per step</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Question</th><th>Answer</th><th>Weakness that forces the next step</th></tr>
    <tr><td>Bayes' theorem</td><td>Flip P(clue | spam) into P(spam | clue)?</td><td>P(x|c)P(c)/P(x): 0.75</td><td>Only one clue</td></tr>
    <tr><td>MAP rule</td><td>Use many clues?</td><td>argmax P(c)P(x|c)</td><td>P(x|c) needs 2^d cells</td></tr>
    <tr><td>Naive product</td><td>Estimate P(x|c) from little data?</td><td>Π P(xⱼ|c): 0.90</td><td>What are text clues?</td></tr>
    <tr><td>Multinomial NB</td><td>Words as clues?</td><td>word-count shares: 0.382</td><td>Unseen word = 0</td></tr>
    <tr><td>Smoothing</td><td>Avoid zero vetoes?</td><td>+α pseudo-counts</td><td>Products underflow</td></tr>
    <tr><td>Logs</td><td>Compute safely?</td><td>sum logs, log-sum-exp</td><td>Absent words ignored</td></tr>
    <tr><td>Bernoulli NB</td><td>Presence/absence?</td><td>p^x(1 − p)^(1 − x): 0.292</td><td>Numbers can't be counted</td></tr>
    <tr><td>Gaussian NB</td><td>Continuous clues?</td><td>normal density per class: 0.906</td><td>Mixed feature types</td></tr>
    <tr><td>Mixing types</td><td>All clues together?</td><td>add log-odds: 0.96</td><td>What model is this?</td></tr>
    <tr><td>Linear form</td><td>Relation to LR?</td><td>log-odds = b + Σwⱼxⱼ; NB wins small n</td><td>Probabilities?</td></tr>
    <tr><td>Calibration</td><td>Is p honest?</td><td>too extreme; calibrate</td><td>–</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <div class="cards">
    <div><b>Bayes' theorem</b><p>P(c | x) = P(x | c)P(c)/P(x); P(x) = Σ_k P(x | k)P(k). Prior P(c), likelihood P(x | c), evidence P(x), posterior P(c | x). Odds form: posterior odds = prior odds × likelihood ratio.</p><small>Unknown sender: 0.75 × 0.5 / 0.5 = 0.75</small></div>
    <div><b>Naive Bayes rule</b><p>ŷ = argmax_c [ln P(c) + Σⱼ ln P(xⱼ | c)], assuming xⱼ independent given c. Probabilities by normalising the scores (log-sum-exp).</p><small>Generative; one pass of counting</small></div>
    <div><b>Multinomial</b><p>θ_cj = (N_cj + α)/(N_c + αV): N_cj = count of word j in class c, N_c = all words in c, V = vocabulary size, α = smoothing. Score multiplies θ_cj once per occurrence.</p><small>P(free | spam) = 4/40</small></div>
    <div><b>Bernoulli</b><p>p_cj = (n_cj + α)/(n_c + 2α): n_cj = class-c documents containing j, n_c = class-c documents. Present words give p, absent words 1 − p.</p><small>Repeats ignored</small></div>
    <div><b>Gaussian</b><p>N(x; μ_cj, σ²_cj) = exp(−(x − μ)²/(2σ²))/√(2πσ²) with class mean μ and population variance σ² (+ var_smoothing × max variance).</p><small>Spam age μ 9.5, σ² 142.25</small></div>
    <div><b>Linear form</b><p>ln(P(1|x)/P(0|x)) = ln(P(1)/P(0)) + Σⱼ xⱼ ln(θ_1j/θ_0j): a logistic-regression-shaped model whose weights come from counts, not optimisation.</p><small>free +1.361, lunch −0.718, monday −1.124</small></div>
  </div>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Spam</th><th>Ham</th><th>Result</th></tr>
    <tr><td>Messages / prior</td><td>4 / 0.5</td><td>4 / 0.5</td><td>–</td></tr>
    <tr><td>Unknown sender; night</td><td>3/4; 3/4</td><td>1/4; 1/4</td><td>P(spam | unknown) 0.75; both clues 0.90 (α = 1: 0.80)</td></tr>
    <tr><td>Words (total, V = 24)</td><td>16</td><td>15</td><td>–</td></tr>
    <tr><td>P(free), P(lunch), P(monday) | c (α = 1)</td><td>0.100, 0.025, 0.025</td><td>0.0256, 0.0513, 0.0769</td><td>scores 3.13e−5 vs 5.06e−5 → 0.382</td></tr>
    <tr><td>Log-scores</td><td>−10.374</td><td>−9.892</td><td>0.382</td></tr>
    <tr><td>Bernoulli present / absent factors</td><td>0.01852 / 0.00092</td><td>0.02778 / 0.00149</td><td>0.292</td></tr>
    <tr><td>Age μ, σ²; length μ, σ²</td><td>9.5, 142.25; 19.75, 0.6875</td><td>491.25, 106,855; 20, 9.5</td><td>age 40, length 20 → 0.906 (length 17 → 0.062)</td></tr>
    <tr><td>All clue types combined</td><td colspan="2">log-odds −0.481 + 1.386 + 2.265 = 3.17</td><td>0.96</td></tr>
  </table>
  <h3>When to use it, when not</h3>
  <table class="tbl">
    <tr><th>Use</th><th>Avoid or calibrate</th></tr>
    <tr><td>Text and other sparse high-dimensional data; very little labelled data; need for one-pass or streaming training; quick baseline.</td><td>When you need honest probabilities (calibrate first); strongly correlated or duplicated features; interactions matter; plenty of data (logistic regression or boosting usually win).</td></tr>
  </table>
  <h3>Key traps</h3>
  <ul>
    <li>Independence is assumed <em>given the class</em>, and it is almost always false; NB still ranks well.</li>
    <li>Always smooth (α) and always compute in logs.</li>
    <li>Probabilities are over-confident because correlated clues are double counted.</li>
    <li>Match the variant to the feature type; CategoricalNB needs integer codes; no negative inputs to MultinomialNB.</li>
    <li>Priors learnt from a re-sampled training set are wrong for deployment.</li>
  </ul>
  <h3>Rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Prior 1% spam, P(clue | spam) = 0.75, P(clue | ham) = 0.25: P(spam | clue)?</td><td>0.0075 / (0.0075 + 0.2475) ≈ 0.03.</td></tr>
    <tr><td>Word seen 0 times in a class of 16 words, V = 24, α = 1: P(word | class)?</td><td>1/40 = 0.025.</td></tr>
    <tr><td>Why subtract the max log-score before exponentiating?</td><td>So the largest term becomes e⁰ = 1 and nothing underflows; the ratio is unchanged.</td></tr>
    <tr><td>Message "free free free": does Bernoulli NB change its answer vs "free"?</td><td>No, only presence matters; Multinomial counts all three.</td></tr>
    <tr><td>NB or logistic regression with 20 labelled examples and 5,000 words?</td><td>Start with NB: it reaches its best accuracy with far less data.</td></tr>
  </table>

  <h2 id="nb-qa"><span class="num">17</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>State Bayes' theorem and name each term.</summary><div class="qa-body">P(c | x) = P(x | c)P(c)/P(x). P(c) is the prior (belief before the evidence), P(x | c) the likelihood (how typical the evidence is of class c), P(x) = Σ_k P(x | k)P(k) the evidence (a normaliser), P(c | x) the posterior. In our inbox, P(spam | unknown sender) = 0.75 × 0.5 / 0.5 = 0.75.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly is "naive" about Naive Bayes?</summary><div class="qa-body">It assumes the features are conditionally independent given the class: P(x₁, …, x_d | c) = Πⱼ P(xⱼ | c). This replaces an impossible joint table (2²⁴ cells for 24 binary words) with d small ones. It is "naive" because real features (words in phrases) are dependent even within a class.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does NB work well even though the assumption is false?</summary><div class="qa-body">Classification needs only the right argmax, not accurate probabilities; dependence errors often affect both classes' scores similarly. Estimating each P(xⱼ | c) separately has very low variance, which wins with small data. The cost is in the probabilities: they become over-confident.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute P(spam | "free lunch monday") for our 8 messages with Multinomial NB.</summary><div class="qa-body">Spam has 16 words, ham 15, V = 24. With α = 1: P(free|spam) = 4/40, P(lunch|spam) = 1/40, P(monday|spam) = 1/40; P(free|ham) = 1/39, P(lunch|ham) = 2/39, P(monday|ham) = 3/39. Scores 0.5 × 0.1 × 0.025² = 3.13e−5 and 0.5 × 0.0256 × 0.0513 × 0.0769 = 5.06e−5, so P(spam) = 0.382.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Laplace smoothing and why is it needed?</summary><div class="qa-body">Adding α (1 for Laplace) to every count: P(w | c) = (count + α)/(N_c + αV). Without it, a word never seen in a class gives probability 0 and vetoes that class for any message containing it (α ≈ 0 gave P(spam) = 0.000). It equals adding α imaginary occurrences of every word (a Dirichlet prior). Larger α pulls everything toward uniform; tune α by CV.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why compute in log space, and what is log-sum-exp?</summary><div class="qa-body">Multiplying hundreds of probabilities below 1 underflows to 0.0. Logs turn the product into a sum and keep the argmax. To normalise, compute ln Σ e^(a_k) as m + ln Σ e^(a_k − m) with m = max a_k, so no exponent underflows; P(c | x) = e^(a_c − logsumexp).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Multinomial vs Bernoulli vs Gaussian NB: when do you use each?</summary><div class="qa-body">Multinomial for counts (word counts, TF-IDF in practice); it counts repeats and ignores absent words. Bernoulli for binary presence features; absent words count as evidence (1 − p) and repeats do not (0.292 vs 0.382 on our message). Gaussian for continuous features, one normal curve per class per feature. Categorical for integer-coded categories; Complement NB for imbalanced text.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Gaussian NB estimate P(x | c)? What can go wrong?</summary><div class="qa-body">It computes per class and feature the mean and population variance and uses the normal density. Problems: non-normal (skewed) features, and tiny variances from few or identical values, which make the curve a spike (spam lengths var 0.69 turned length 17 into P(spam) = 0.062). sklearn adds var_smoothing × max variance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Show that Multinomial NB is a linear classifier.</summary><div class="qa-body">ln(P(1 | x)/P(0 | x)) = ln(P(1)/P(0)) + Σⱼ xⱼ ln(θ_1j/θ_0j), a bias plus a weighted sum of counts, followed by a sigmoid for the probability. For "free lunch monday": 0 + 1.361 − 0.718 − 1.124 = −0.481 → σ = 0.382. Same form as logistic regression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) Naive Bayes vs logistic regression: which and when?</summary><div class="qa-body">They are a generative/discriminative pair with the same linear form. NB estimates weights from per-feature counts (fast, low variance, converges with little data); LR optimises all weights jointly for P(y | x) (handles correlated features, lower asymptotic error, better calibrated). In our simulation NB won at 10–100 messages, LR from 300 on (0.932 vs 0.925 at 3,000).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are NB probabilities well calibrated? How would you fix them?</summary><div class="qa-body">Usually not: correlated features are double counted, pushing p toward 0 and 1 (11 wrong predictions beyond 0.01/0.99 vs 0 for LR on our simulated inbox). Fix with CalibratedClassifierCV (sigmoid/Platt or isotonic) on held-out folds, or use LR if probabilities matter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does NB handle missing features and new data arriving over time?</summary><div class="qa-body">A missing feature can simply be left out of the product (its factor is skipped), which is principled under the independence assumption. New data: training is just adding counts, so partial_fit on batches gives exactly the same model as one fit on everything; ideal for streaming spam filters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you include the same feature twice?</summary><div class="qa-body">NB treats it as two independent pieces of evidence and multiplies its likelihood ratio in twice, so the probability becomes more extreme without any new information (P(spam | unknown) 0.75 → 0.90 → 0.964 for 1, 2, 3 copies). Accuracy may survive, calibration does not. Remove duplicates or one-hot "complement" columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the training and prediction costs of NB?</summary><div class="qa-body">Training is one pass of counting, O(n · d) (only non-zero entries for sparse text); prediction is O(non-zero features × classes); memory O(classes × d). No iterations, no hyperparameters except α (or var_smoothing).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) Where does Bayes' rule with independent evidence appear elsewhere?</summary><div class="qa-body">Sequential diagnostic testing (each independent positive test multiplies the odds by its likelihood ratio, exactly like each clue here), Bayesian A/B testing updates (<a class="xref" data-note="st_abtesting">A/B Testing</a>), and the class-conditional view returns in <a class="xref" data-note="ml_gmm">Gaussian Mixture Models</a>, which are Gaussian class-conditional models without labels.</div></details>
</main>
`
});
