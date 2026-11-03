// notes/ml/ml_naivebayes.js — Naive Bayes
Object.assign(TOPIC_CONTENT, {
  "ml_naivebayes": `<main>
  <h1>Naive Bayes</h1>
  <div class="where"><span>Machine Learning</span><span>Classification</span><span>Naive Bayes</span></div>
  <p class="lead">Naive Bayes is a classifier that works by counting. It learns how often each clue (a word, the type of sender, the length of a message) turns up in each class, and then uses Bayes' theorem to turn those counts into the probability that a new example belongs to each class. It trains in a single pass over the data, needs very few examples, copes with tens of thousands of features, and for decades it was the standard spam filter, which is why interviewers still ask about it. In this note we build one small spam filter from scratch: an inbox of eight labelled SMS messages, four spam and four normal ("ham"), and one new message, "free lunch monday", that we want to classify. Every idea is computed by hand on those same eight messages first and then checked with scikit-learn, so each new step adds to numbers you have already seen.</p>

  <h2 id="nb-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Naive Bayes</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li><b>Bayes' theorem</b>: P(c | x) = P(x | c)·P(c) / P(x)</li>
          <li>Prior × likelihood, then normalise</li>
          <li><b>Naive</b>: clues independent <em>given the class</em>, so P(x | c) = Π P(xⱼ | c)</li>
          <li>Generative: models how each class produces its data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Variants</div>
        <ul>
          <li><b>Multinomial</b>: word counts, (count + α)/(N_c + αV)</li>
          <li><b>Bernoulli</b>: present/absent; absent words count too</li>
          <li><b>Gaussian</b>: a bell curve per feature per class</li>
          <li><b>Categorical</b>, <b>Complement</b> (imbalanced text)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Making it work</div>
        <ul>
          <li><b>Laplace smoothing</b> α stops an unseen word zeroing a class</li>
          <li>Sum <b>logs</b>, normalise with <b>log-sum-exp</b></li>
          <li>Log-odds = bias + Σ count × weight: a <b>linear</b> model</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In practice</div>
        <ul>
          <li>Wins with little data; logistic regression wins with lots</li>
          <li>Probabilities too extreme: calibrate before using them</li>
          <li>One-pass, streaming (<code>partial_fit</code>), great text baseline</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="nb-bayes"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Bayes' Theorem</span><span class="rm-sub">turning "spam has unknown senders" into "unknown senders are spam"</span></div></div>
      <div class="rm-item rm-done" data-target="nb-naive"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Naive Assumption</span><span class="rm-sub">combining many clues from very little data</span></div></div>
      <div class="rm-item rm-done" data-target="nb-multi"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Multinomial Naive Bayes</span><span class="rm-sub">words as clues: the spam filter by hand</span></div></div>
      <div class="rm-item rm-done" data-target="nb-smooth"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Laplace Smoothing</span><span class="rm-sub">stopping one unseen word from vetoing a class</span></div></div>
      <div class="rm-item rm-done" data-target="nb-log"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Working in Log Space</span><span class="rm-sub">why products of probabilities break, and the fix</span></div></div>
      <div class="rm-item rm-done" data-target="nb-bern"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Bernoulli Naive Bayes</span><span class="rm-sub">present or absent, and missing words as evidence</span></div></div>
      <div class="rm-item rm-done" data-target="nb-gauss"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Gaussian Naive Bayes</span><span class="rm-sub">numbers instead of counts: means and variances</span></div></div>
      <div class="rm-item rm-done" data-target="nb-mix"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Mixing Feature Types</span><span class="rm-sub">categories, words and numbers in one model</span></div></div>
      <div class="rm-item rm-done" data-target="nb-linear"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Naive Bayes vs Logistic Regression</span><span class="rm-sub">the hidden linear model, and who wins when</span></div></div>
      <div class="rm-item rm-done" data-target="nb-calib"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Calibration</span><span class="rm-sub">why its probabilities are over-confident</span></div></div>
      <div class="rm-item rm-done" data-target="nb-practice"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Naive Bayes in Practice</span><span class="rm-sub">sklearn classes, tuning, streaming, from scratch, when to use</span></div></div>
      <div class="rm-item rm-done" data-target="nb-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">smoothing, logs, scaled inputs, wrong priors</span></div></div>
      <div class="rm-item rm-done" data-target="nb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, variants table, the inbox numbers</span></div></div>
      <div class="rm-item rm-done" data-target="nb-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on Naive Bayes</span></div></div>
    </div>
  </div>

  <h2 id="nb-bayes"><span class="num">01</span>Bayes' Theorem</h2>
  <p>Here is the whole inbox we will work with. Each message has its text, a label (1 = spam, 0 = ham), whether the sender is in the phone's contacts, whether it arrived at night, how old the sender's account is, and its length in characters. Every section of this note uses these same eight rows.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
inbox = pd.DataFrame({
    "text": ["win a free prize now", "free cash offer win", "claim your free prize", "cheap offer buy now",
             "meeting moved to monday", "see you at lunch", "project update attached", "can we meet monday"],
    "spam": [1, 1, 1, 1, 0, 0, 0, 0],
    "sender": ["unknown", "unknown", "unknown", "known", "known", "known", "unknown", "known"],
    "night": ["yes", "yes", "yes", "no", "no", "no", "no", "yes"],   # sent between 10 pm and 6 am
    "age_days": [2, 5, 1, 30, 400, 900, 15, 650]})                  # age of the sender's account
inbox["length"] = inbox.text.str.len()                              # characters
print(inbox.to_string())</div>
  <div class="fx" data-lang="text">                      text  spam   sender night  age_days  length
0     win a free prize now     1  unknown   yes         2      20
1      free cash offer win     1  unknown   yes         5      19
2    claim your free prize     1  unknown   yes         1      21
3      cheap offer buy now     1    known    no        30      19
4  meeting moved to monday     0    known    no       400      23
5         see you at lunch     0    known    no       900      16
6  project update attached     0  unknown    no        15      23
7       can we meet monday     0    known   yes       650      18</div>
  <p>Start with a single clue: the sender. From past messages it is easy to count "how often does spam come from an unknown sender?". Three of the four spam messages did, so that number is 3/4. But that is not the question a spam filter needs answered. A filter sees a new message from an unknown sender and must decide "how likely is <em>this</em> to be spam?". These are two different questions. The first is the probability of the clue given the class, written P(unknown | spam); the second is the probability of the class given the clue, P(spam | unknown). The vertical bar is read "given". Training data naturally gives us the first kind; prediction needs the second. We need a way to flip one into the other.</p>
  <p>Before any formula, we can flip it simply by counting. Picture the eight messages split first by class and then by sender:</p>
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
  <p>Follow the tree from the top. Four messages are spam and four are ham. Among the spam, 3 came from unknown senders; among the ham, 1 did. So 4 messages in total came from unknown senders (the two thick-bordered boxes), and 3 of those 4 are spam. That is the answer: P(spam | unknown) = 3/4 = 0.75. All we did was keep the boxes that match the clue and ask what share of them belongs to each class.</p>
  <p>Writing the same reasoning with probabilities gives <strong>Bayes' theorem</strong>, a rule for turning P(clue | class) into P(class | clue). The share of all messages that are "spam and unknown" is P(unknown | spam) × P(spam) = 0.75 × 0.5 = 0.375. The share that are "unknown" at all is the sum over both classes, 0.75 × 0.5 + 0.25 × 0.5 = 0.5 (adding up over every way something can happen like this is called the <strong>law of total probability</strong>). Dividing the first by the second gives the answer:</p>
  <p style="text-align:center"><strong>P(spam | unknown) = P(unknown | spam) · P(spam) / P(unknown) = 0.375 / 0.5 = 0.75</strong></p>
  <p>Each piece has a name you will hear in every interview. P(spam) is the <strong>prior</strong>: what we believed before looking at the clue (half the inbox is spam). P(unknown | spam) is the <strong>likelihood</strong>: how typical the clue is of that class. P(unknown) is the <strong>evidence</strong>: how common the clue is overall; it is the same for every class, so it only rescales the answers so they add up to 1. And P(spam | unknown) is the <strong>posterior</strong>: the updated belief after seeing the clue. In words: posterior = prior × likelihood, divided by the evidence.</p>
  <p>Think of a detective with a hunch. Before any evidence, they think half of all anonymous tips are fake (the prior). Then a clue arrives: the caller hid their number. How far the hunch should move depends on how much more typical that clue is of fake tips than of genuine ones. If hidden numbers are three times as common among fake tips (0.75 against 0.25), the detective's odds of "fake" are multiplied by three, from 1:1 to 3:1, which is a probability of 0.75. A clue that is equally common in both groups would not move the hunch at all. This "multiply the odds by the likelihood ratio" view is a useful second way to think about Bayes' theorem, and it will become important when we combine many clues.</p>
  <p>Here is the same calculation in code, computed from the DataFrame rather than by eye:</p>
  <div class="fx" data-lang="py">p_spam = inbox.spam.mean()                                          # prior P(spam)
p_u_spam = (inbox[inbox.spam == 1].sender == "unknown").mean()      # likelihood P(unknown | spam)
p_u_ham = (inbox[inbox.spam == 0].sender == "unknown").mean()       # P(unknown | ham)
evidence = p_u_spam * p_spam + p_u_ham * (1 - p_spam)               # P(unknown), both classes added
print(f"P(spam)={p_spam}  P(unknown|spam)={p_u_spam}  P(unknown|ham)={p_u_ham}")
print(f"P(unknown) = {evidence}")
print(f"P(spam | unknown) = {p_u_spam * p_spam} / {evidence} = {p_u_spam * p_spam / evidence}")</div>
  <div class="fx" data-lang="text">P(spam)=0.5  P(unknown|spam)=0.75  P(unknown|ham)=0.25
P(unknown) = 0.5
P(spam | unknown) = 0.375 / 0.5 = 0.75</div>
  <p>The code reproduces the hand numbers: a prior of 0.5, likelihoods of 0.75 and 0.25, evidence 0.5, and a posterior of 0.75. One warning before we go on. In this inbox P(unknown | spam) and P(spam | unknown) happen to both be 0.75, but only because the classes are 50/50. If just 1% of real messages were spam, the same clue would give 0.75 × 0.01 / (0.75 × 0.01 + 0.25 × 0.99) ≈ 0.03: an unknown sender would barely raise suspicion, because there is so much more ham to come from unknown senders. Mixing up the two directions is the most common probability mistake there is (in courtrooms it is called the "prosecutor's fallacy"), and the prior is what separates them. (The probability background is in <a class="xref" data-note="st_probability">Probability</a>.)</p>

  <h2 id="nb-naive"><span class="num">02</span>The Naive Assumption</h2>
  <p>A real message brings many clues at once: the sender, the time, the account age, the length, and a dozen words. To classify it we apply Bayes' theorem to all of them together, x = (x₁, x₂, …, x_d), and pick the class with the largest posterior. Because the evidence P(x) is the same for every class, it cannot change which class wins, so for choosing a class we only need to compare P(class) × P(x | class). Picking the class this way is called the <strong>maximum a posteriori</strong> or <strong>MAP</strong> rule ("a posteriori" just means "after seeing the evidence"):</p>
  <p style="text-align:center"><strong>predicted class = the c with the largest P(c) · P(x₁, x₂, …, x_d | c)</strong></p>
  <p>If we knew the true P(x | c), this would be the best classifier possible; its error is the lowest any model can achieve on that problem and is called the <strong>Bayes error</strong>. The difficulty is estimating P(x | c) when x has many parts. To estimate P(x | spam) directly we would have to count how often each <em>complete combination</em> of clues appears among spam messages. Even with only the 24 different words in our inbox, each either present or absent, there are 2²⁴ = 16,777,216 possible combinations per class, and we have four spam messages. Almost every combination, including the one we want to classify, has a count of zero. This is the problem the "naive" part of Naive Bayes exists to solve.</p>
  <p>The solution is an assumption: <strong>once you know the class, the clues tell you nothing about each other</strong>. Among spam messages, knowing that the sender is unknown does not change the chance that the message was sent at night. This is called <strong>conditional independence</strong> (independence <em>given the class</em>), and it lets us replace the impossible joint probability with a product of one small probability per clue:</p>
  <p style="text-align:center"><strong>P(x₁, x₂, …, x_d | c) = P(x₁ | c) · P(x₂ | c) · … · P(x_d | c)</strong></p>
  <p>Instead of sixteen million counts per class we now need d small ones, each of which can be estimated from every message in the class. A <strong>Naive Bayes classifier</strong> is exactly this: the MAP rule with the product plugged in, score(c) = P(c) × Π P(xⱼ | c), where Π means "multiply over all clues j". It is called naive because the assumption is almost never literally true.</p>
  <p>A good picture is a selection committee in which each member reads only one document about a candidate (one reads the CV, one the marks sheet, one the interview notes) and nobody talks to anyone else. Each gives an independent opinion, and the opinions are multiplied together. If the documents really are about different things, this works very well. If two members happen to read near-identical documents, that view is counted twice. Keep that weakness in mind; we will see it in a moment.</p>
  <p>Let us use two clues, an unknown sender and a night-time message. For spam, the prior is 4/8, P(unknown | spam) = 3/4 and P(night | spam) = 3/4, so the score is 0.5 × 0.75 × 0.75 = 0.2812. For ham the same pieces are 4/8, 1/4 and 1/4, giving 0.5 × 0.25 × 0.25 = 0.0312. Normalising, P(spam | unknown, night) = 0.2812 / (0.2812 + 0.0312) = 0.90. In odds: the first clue multiplied the odds of spam by 3 (from 1:1 to 3:1), the second by 3 again (to 9:1), and 9:1 is a probability of 0.9.</p>
  <div class="fx" data-lang="py">def naive(df, clues):
    """prior x one likelihood per clue, for each class; returns P(spam | clues)"""
    score = {}
    for c in [1, 0]:
        part = df[df.spam == c]
        s = len(part) / len(df)                                     # prior
        for col, val in clues.items():
            s *= (part[col] == val).mean()                          # multiply in each clue separately
        score[c] = s
    return score[1], score[0], score[1] / (score[1] + score[0])

s1, s0, post = naive(inbox, {"sender": "unknown", "night": "yes"})
print(f"spam score {s1:.4f}  ham score {s0:.4f}  P(spam | unknown, night) = {post:.3f}")
both = inbox[(inbox.sender == "unknown") &amp; (inbox.night == "yes")]
print(f"exact count: {len(both)} messages have both clues, {both.spam.sum()} of them spam")</div>
  <div class="fx" data-lang="text">spam score 0.2812  ham score 0.0312  P(spam | unknown, night) = 0.900
exact count: 3 messages have both clues, 3 of them spam</div>
  <p>The first line matches the hand calculation. The second line is the honest count from the data: three messages have both clues and all three are spam, so on this data the "true" answer would be 1.0. The naive product says 0.90. It is not exactly right, but it points firmly in the right direction, and it got there by multiplying two numbers that were each estimated from four messages.</p>
  <p>Now the weakness. What if the same clue enters the model more than once, for example because the dataset has two columns that really say the same thing? Below we copy the sender column one and two extra times:</p>
  <div class="fx" data-lang="py">for k in [1, 2, 3]:                                                 # feed the SAME clue in k times
    df = inbox.copy()
    for j in range(1, k):
        df[f"sender{j}"] = df.sender
    clues = {"sender": "unknown", **{f"sender{j}": "unknown" for j in range(1, k)}}
    print(f"'unknown sender' counted {k}x -&gt; P(spam) = {naive(df, clues)[2]:.3f}")</div>
  <div class="fx" data-lang="text">'unknown sender' counted 1x -&gt; P(spam) = 0.750
'unknown sender' counted 2x -&gt; P(spam) = 0.900
'unknown sender' counted 3x -&gt; P(spam) = 0.964</div>
  <p>Nothing new was learnt, yet the probability climbs from 0.75 to 0.90 to 0.964. Naive Bayes believes each copy is independent evidence, so it multiplies the same likelihood ratio of 3 in again and again. This is the price of the naive assumption: correlated features are double-counted, and the model becomes over-confident. We will measure how much this matters in section 10.</p>
  <p>So why does a model built on a false assumption work so well in practice? There are three reasons. First, classification only needs the right <em>winner</em>, not the right probability: errors from dependent clues often push both classes' scores in the same direction, so the larger one usually stays larger. Domingos and Pazzani (1997) showed that Naive Bayes is optimal for plain right/wrong accuracy in many cases where independence is badly violated. Second, every small probability is estimated from all the rows of its class, so the estimates are stable even with tiny data: the model trades a little bias (a wrong assumption) for a large reduction in variance (estimates that do not jump around), the trade-off explained in <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>. Third, dependencies in one class are often mirrored in the other and partly cancel out.</p>
  <p>Two points about vocabulary are worth getting exactly right, because interviewers listen for them. Naive Bayes is a <strong>generative</strong> model: it learns how each class <em>generates</em> its data, P(x | c), and then uses Bayes' theorem. Logistic regression is <strong>discriminative</strong>: it learns P(c | x) directly and never models how the data was produced. And the assumption is not "the features are independent". Unknown senders and night-time messages are clearly related across the whole inbox, since both mark spam. The assumption is only that they are unrelated <em>within</em> the spam messages and <em>within</em> the ham messages.</p>

  <h2 id="nb-multi"><span class="num">03</span>Multinomial Naive Bayes</h2>
  <p>So far our clues were tidy yes/no columns. The most important clue in a message, though, is its text. To use text we first need to decide what the "clues" in a piece of text are. The standard answer is the <strong>bag of words</strong>: forget word order and grammar, and describe each message only by how many times each word appears (more in <a class="xref" data-note="nlp">NLP Foundations</a>). "free lunch monday" becomes free = 1, lunch = 1, monday = 1, and zero for every other word.</p>
  <p>Now imagine that each class has its own big bag of word tokens. A spam message is written by reaching into the spam bag and pulling out words one at a time; a ham message by pulling from the ham bag. Under that picture, P(word | spam) is simply the share of all spam word tokens that are that word. A model of drawing items from a bag, with counts of how often each kind came out, is called a <strong>multinomial</strong> distribution, so this version is <strong>Multinomial Naive Bayes</strong>. It is the version used for text.</p>
  <p>Let us compute it by hand. scikit-learn's <code>CountVectorizer</code>, which builds the word counts, lower-cases the text, splits on spaces and drops one-letter words such as "a". After that, the four spam messages contain 16 word tokens in total, the four ham messages contain 15, and there are V = 24 different words (V is the size of the <strong>vocabulary</strong>). The words of our new message appear like this:</p>
  <table class="tbl">
    <tr><th>word</th><th>count in spam (of 16)</th><th>count in ham (of 15)</th><th>P(w | spam) = (count + 1)/(16 + 24)</th><th>P(w | ham) = (count + 1)/(15 + 24)</th></tr>
    <tr><td>free</td><td>3</td><td>0</td><td>4/40 = 0.100</td><td>1/39 = 0.0256</td></tr>
    <tr><td>lunch</td><td>0</td><td>1</td><td>1/40 = 0.025</td><td>2/39 = 0.0513</td></tr>
    <tr><td>monday</td><td>0</td><td>2</td><td>1/40 = 0.025</td><td>3/39 = 0.0769</td></tr>
  </table>
  <p>The raw shares would be 3/16 for "free" in spam and 0/16 for "lunch" in spam, and that zero is a problem: one zero in a product makes the whole spam score zero, and "free" never appeared in ham, so the ham score would be zero too. The last two columns therefore add 1 to every count and V to every total. That adjustment is called smoothing; the next section explains it properly. With it, the scores are:</p>
  <p style="text-align:center">spam: 0.5 × 0.100 × 0.025 × 0.025 = 3.13 × 10⁻⁵ &nbsp;&nbsp;&nbsp; ham: 0.5 × 0.0256 × 0.0513 × 0.0769 = 5.06 × 10⁻⁵</p>
  <p>and P(spam | "free lunch monday") = 3.13 / (3.13 + 5.06) = <strong>0.382</strong>. The message is classified as ham. "free" pulls toward spam (it is four times more likely there), but "lunch" (twice as likely in ham) and "monday" (three times as likely in ham) together pull harder. Now let scikit-learn do it:</p>
  <div class="fx" data-lang="py">from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
y = inbox.spam.values
vec = CountVectorizer()                           # lower-cases, splits words, drops 1-letter words like "a"
X = vec.fit_transform(inbox.text)                 # 8 x V table of word counts
vocab = vec.get_feature_names_out()
mnb = MultinomialNB(alpha=1.0).fit(X, y)
msg = vec.transform(["free lunch monday"])
print("V =", len(vocab), " words per class (ham, spam):", mnb.feature_count_.sum(axis=1))
print("P(free|spam) =", np.exp(mnb.feature_log_prob_[1, vec.vocabulary_["free"]]).round(4))
print("P(spam | 'free lunch monday') =", mnb.predict_proba(msg)[0, 1].round(3))
for m in ["free free free lunch monday", "claim your cash prize", "lunch meeting monday"]:
    print(f"  {m:28s} P(spam) = {mnb.predict_proba(vec.transform([m]))[0, 1]:.3f}")</div>
  <div class="fx" data-lang="text">V = 24  words per class (ham, spam): [15. 16.]
P(free|spam) = 0.1
P(spam | 'free lunch monday') = 0.382
  free free free lunch monday  P(spam) = 0.904
  claim your cash prize        P(spam) = 0.956
  lunch meeting monday         P(spam) = 0.072</div>
  <p>The first line confirms the hand counts (15 ham words, 16 spam words; the array is ordered by class label, so ham comes first). P(free | spam) is 0.1 and the posterior is 0.382, exactly as computed. The last three lines show the model's character. Repeating "free" three times multiplies its spam-to-ham ratio in three times and flips the verdict to 0.904 spam, because a multinomial model counts every occurrence. "claim your cash prize" is 0.956 spam. "lunch meeting monday" is 0.072. Notice too that the model knows nothing about meaning: "meet" and "meeting" are simply two different words, and any word that never appeared in training is silently ignored at prediction time.</p>
  <p>Written generally, Multinomial NB estimates, for each class c and each word j, θ_cj = P(word j | c) = (N_cj + α) / (N_c + αV), where N_cj is how often word j appears in class c, N_c is the total number of words in class c and α is the smoothing amount (1 above). A document with word counts x₁ … x_V then gets the score P(c) × Π θ_cj^xⱼ: each word's probability is multiplied in once per occurrence. Note that the denominator is the number of <em>words</em> in the class (16), not the number of <em>messages</em> (4); confusing the two is a common slip in hand calculations.</p>

  <h2 id="nb-smooth"><span class="num">04</span>Laplace Smoothing</h2>
  <p>Look again at "lunch". It never appeared in our four spam messages. Without the +1, P(lunch | spam) = 0/16 = 0, and because the spam score is a product, any message containing "lunch" would get a spam probability of exactly zero, however spammy the rest of it was. "Win a free cash prize, see you at lunch" would be declared certainly ham. This is called the <strong>zero-frequency problem</strong>. With only 16 spam words, most words have never appeared in spam simply by chance. "Not seen in 16 words" is weak evidence that a word is rare in spam; it is not proof that the word is impossible.</p>
  <p><strong>Laplace smoothing</strong> fixes this by pretending that, before seeing any data, we had already seen every word once in every class. More generally we add a small number α (alpha) to every count: P(w | c) = (count + α) / (N_c + αV). Adding αV to the denominator keeps each class's probabilities summing to 1. With α = 1 this is called Laplace smoothing; with α between 0 and 1 it is sometimes called Lidstone smoothing. For an everyday picture, think of a new restaurant with no reviews. Rating sites do not show it as "zero stars"; many quietly add a few imaginary average reviews to every restaurant, so that one early review cannot make a place look perfect or terrible. α is the number of imaginary reviews.</p>
  <p>How much to add matters. By hand for "lunch" in spam (count 0, N_spam = 16, V = 24): with α = 0.1 the probability is 0.1 / (16 + 2.4) = 0.0054; with α = 1 it is 1/40 = 0.025; with α = 10 it is 10/256 = 0.039, already close to the "every word equally likely" value of 1/24 = 0.042. Here is the effect on the whole prediction:</p>
  <div class="fx" data-lang="py">print("alpha    P(lunch|spam)   P(spam | 'free lunch monday')")
for a in [1e-10, 0.1, 1.0, 10.0, 100.0]:
    m = MultinomialNB(alpha=a).fit(X, y)
    p_lunch = np.exp(m.feature_log_prob_[1, vec.vocabulary_["lunch"]])
    print(f"{a:&lt;8g} {p_lunch:.2e}        {m.predict_proba(msg)[0, 1]:.3f}")</div>
  <div class="fx" data-lang="text">alpha    P(lunch|spam)   P(spam | 'free lunch monday')
1e-10    6.25e-12        0.000
0.1      5.43e-03        0.102
1        2.50e-02        0.382
10       3.91e-02        0.493
100      4.14e-02        0.500</div>
  <p>With α almost zero, the single unseen word "lunch" makes the verdict "certainly ham" (0.000), which is the zero-frequency problem in action. As α grows, every word's probability is pulled toward the uniform 1/V, so the actual counts matter less and less. At α = 100 the words carry almost no information and the answer is just the prior, 0.500. So α is a knob between two failure modes: a small α trusts a handful of counts too much (high variance), a large α ignores the data (high bias). The default α = 1 is a sensible start, and you tune it by cross-validation like any other hyperparameter (section 11 does this).</p>
  <p>For the mathematically inclined, adding α to every count is the same as placing a symmetric Dirichlet prior on the word probabilities, a "prior belief" that every word has some chance in every class. One practical point follows from the formula: α interacts with the vocabulary size. With V = 100,000 words, α = 1 adds 100,000 imaginary words to each class, which can drown a small class's real counts, so large vocabularies often work better with α between 0.01 and 0.1.</p>

  <h2 id="nb-log"><span class="num">05</span>Working in Log Space</h2>
  <p>Our three-word message already had scores around 3 × 10⁻⁵. Every extra word multiplies in another factor between about 0.001 and 0.1, so the scores shrink very fast. A computer stores ordinary decimal numbers (64-bit "doubles") only down to about 10⁻³⁰⁸. A 400-word e-mail whose words each have probability 0.001 has a product of 10⁻¹²⁰⁰, which the computer rounds to exactly 0.0. Then both classes score 0, and 0/0 has no answer. Rounding a tiny number down to zero like this is called <strong>underflow</strong>, and a Naive Bayes written with plain multiplication works in a demo and silently breaks on real e-mails.</p>
  <p>The fix is to work with logarithms. The log turns a product into a sum, ln(a × b) = ln a + ln b, and since ln is an increasing function, the class with the bigger score also has the bigger log-score. So instead of multiplying probabilities we add their logs:</p>
  <p style="text-align:center"><strong>log-score(c) = ln P(c) + Σⱼ xⱼ · ln P(wⱼ | c)</strong></p>
  <p>For "free lunch monday": log-score(spam) = ln 0.5 + ln 0.100 + ln 0.025 + ln 0.025 = −0.693 − 2.303 − 3.689 − 3.689 = −10.374, and log-score(ham) = −0.693 − 3.664 − 2.970 − 2.565 = −9.892. Ham is larger (less negative), the same decision as before, and the numbers are perfectly ordinary.</p>
  <p>There is one more step. To report a probability we must undo the logs: P(spam) = e^(−10.374) / (e^(−10.374) + e^(−9.892)). For a long message the log-scores are around −2,771, and e^(−2771) underflows to 0.0 again. The standard trick, called <strong>log-sum-exp</strong>, is to subtract the largest log-score from all of them before exponentiating. That multiplies the top and bottom of the fraction by the same constant, so the answer does not change, but now the largest term is e⁰ = 1 and nothing can underflow to all-zeros. By hand for the short message: subtract −9.892, giving e^(−0.482) = 0.618 for spam and e⁰ = 1 for ham, so P(spam) = 0.618 / 1.618 = 0.382, as before.</p>
  <div class="fx" data-lang="py">p_words = np.full(400, 0.001)                     # a 400-word e-mail, each word has P = 0.001
print("direct product:", np.prod(p_words), "   sum of logs:", np.log(p_words).sum().round(1))
log_spam, log_ham = -2771.2, -2774.5              # log-scores of a long message
print("exp of the log-scores:", np.exp(log_spam), np.exp(log_ham))
m = max(log_spam, log_ham)                        # log-sum-exp: subtract the max first
p = np.exp(log_spam - m) / (np.exp(log_spam - m) + np.exp(log_ham - m))
print(f"P(spam) after subtracting the max = {p:.4f}")
long_msg = " ".join(["free"] * 300 + ["monday"] * 363)
print("sklearn on a 663-word message:", mnb.predict_proba(vec.transform([long_msg])).round(3))</div>
  <div class="fx" data-lang="text">direct product: 0.0    sum of logs: -2763.1
exp of the log-scores: 0.0 0.0
P(spam) after subtracting the max = 0.9644
sklearn on a 663-word message: [[0.424 0.576]]</div>
  <p>Read the output line by line. The direct product of 400 probabilities is 0.0, while the sum of their logs, −2,763, is an ordinary number. Exponentiating two log-scores near −2,771 gives 0.0 and 0.0, which is useless. Subtracting the maximum first gives 0.9644, the correct answer (the two scores differ by 3.3, and 1 / (1 + e^(−3.3)) = 0.964). Finally, scikit-learn handles a 663-word message without any trouble, because it works in logs internally (its <code>predict_log_proba</code> method returns the log-probabilities directly). There is also a second reason smoothing is required: the log of zero is minus infinity, so a single unsmoothed zero would break the sum as well.</p>

  <h2 id="nb-bern"><span class="num">06</span>Bernoulli Naive Bayes</h2>
  <p>Multinomial NB has two habits that are not always what we want. It counts repeats, so "free free free" is three times the evidence of "free". And it completely ignores every word that is <em>not</em> in the message. For short texts, though, absence can be informative: a message with no "win", no "prize" and no "offer" is, for that reason alone, a little less likely to be spam.</p>
  <p><strong>Bernoulli Naive Bayes</strong> describes each message by V yes/no flags, one per vocabulary word: is the word present or not? (A single yes/no outcome is called a Bernoulli trial, hence the name.) For each class and word it estimates the share of <em>messages</em> in that class that contain the word, smoothed: P(w present | c) = (number of class-c messages containing w + α) / (number of class-c messages + 2α). The 2α appears because each flag has two possible outcomes. Then, for a new message, it multiplies over <strong>all</strong> V words: P(w | c) for each word that is present and 1 − P(w | c) for each word that is absent.</p>
  <p>By hand for "free lunch monday" with α = 1 and 4 messages per class: "free" is in 3 of the 4 spam messages, so P(free | spam) = (3 + 1)/(4 + 2) = 0.667, and in none of the ham, so P(free | ham) = 1/6 = 0.167. Likewise P(lunch | spam) = 1/6, P(lunch | ham) = 2/6, P(monday | spam) = 1/6 and P(monday | ham) = 3/6. The present words give 0.667 × 0.167 × 0.167 = 0.0185 for spam and 0.167 × 0.333 × 0.5 = 0.0278 for ham. The other 21 words are absent, and each contributes 1 − P(w | c). Words that are typical of spam ("prize", "offer", "win") have high P(w | spam), so their absence costs spam a lot: the absent-word products come to about 0.00092 for spam and 0.00149 for ham. Multiplying everything with the prior 0.5 gives scores of 8.55 × 10⁻⁶ and 2.08 × 10⁻⁵, so P(spam) = 0.292.</p>
  <div class="fx" data-lang="py">from sklearn.naive_bayes import BernoulliNB
bnb = BernoulliNB(alpha=1.0).fit(X, y)            # binarises counts: word present (1) or absent (0)
p_present = np.exp(bnb.feature_log_prob_)         # P(word present | class), rows = ham, spam
show = ["free", "prize", "offer", "monday", "lunch"]
print(pd.DataFrame(p_present[:, [vec.vocabulary_[w] for w in show]].T,
                   index=show, columns=["P(w|ham)", "P(w|spam)"]).round(3))
for m in ["free lunch monday", "free free free lunch monday"]:
    print(f"BernoulliNB   {m:28s} P(spam) = {bnb.predict_proba(vec.transform([m]))[0, 1]:.3f}")</div>
  <div class="fx" data-lang="text">        P(w|ham)  P(w|spam)
free       0.167      0.667
prize      0.167      0.500
offer      0.167      0.500
monday     0.500      0.167
lunch      0.333      0.167
BernoulliNB   free lunch monday            P(spam) = 0.292
BernoulliNB   free free free lunch monday  P(spam) = 0.292</div>
  <p>The table shows a few of the per-class probabilities: "free", "prize" and "offer" are much more common in spam messages, "monday" and "lunch" in ham. scikit-learn agrees with the hand result, 0.292. The second prediction is the interesting one: repeating "free" three times changes nothing, still 0.292, because only presence counts. Compare that with Multinomial NB, which went from 0.382 to 0.904 for the same two messages. Bernoulli NB is also a bit more confident that this message is ham (0.292 against 0.382), and the reason is the absent words: the message lacks the vocabulary that spam usually has.</p>
  <table class="tbl">
    <tr><th></th><th>Multinomial NB</th><th>Bernoulli NB</th></tr>
    <tr><td>Feature</td><td>word counts</td><td>word present (1) or absent (0)</td></tr>
    <tr><td>P(w | c) estimated from</td><td>share of word <em>tokens</em> in class c</td><td>share of <em>messages</em> in class c containing w</td></tr>
    <tr><td>Absent words</td><td>ignored</td><td>multiply in 1 − P(w | c)</td></tr>
    <tr><td>Repeated words</td><td>counted again</td><td>ignored</td></tr>
    <tr><td>Best for</td><td>longer documents</td><td>short texts and binary flags</td></tr>
  </table>
  <p>In scikit-learn, <code>BernoulliNB</code> turns any input into 0/1 using its <code>binarize</code> threshold (default 0.0, so any positive count becomes 1). On long documents with big vocabularies, the long product of absent-word factors tends to dominate, and Multinomial NB usually wins.</p>

  <h2 id="nb-gauss"><span class="num">07</span>Gaussian Naive Bayes</h2>
  <p>Our inbox also has two numeric columns: the age of the sender's account in days and the length of the message. A new message arrives from an account that is 40 days old and is 20 characters long. We cannot count how often "age = 40" happened in spam, because no training message has exactly that value, and with real-valued measurements almost no two values are ever equal. Counting gives zero for everything. We need a different way to get P(xⱼ | c) for numbers.</p>
  <p><strong>Gaussian Naive Bayes</strong> assumes that, within each class, each numeric feature follows a bell-shaped curve, the normal or <strong>Gaussian distribution</strong>. A bell curve is completely described by two numbers: its centre, the <strong>mean</strong> μ, and its spread, the <strong>variance</strong> σ² (the average squared distance from the mean). So "training" is just computing a mean and a variance for every feature in every class. To score a new value, we read off the height of the class's curve at that value, which is called the probability <strong>density</strong>:</p>
  <p style="text-align:center"><strong>f(x | c) = 1/√(2πσ²_c) · exp(−(x − μ_c)² / (2σ²_c))</strong></p>
  <p>The exponential part shrinks quickly as x moves away from the mean, measured in units of the spread; the fraction in front makes narrow curves taller, so that every curve has the same total area. Let us do it by hand. For spam, the ages are 2, 5, 1 and 30, so the mean is 38/4 = 9.5 and the variance is ((2 − 9.5)² + (5 − 9.5)² + (1 − 9.5)² + (30 − 9.5)²)/4 = 142.25. For ham, the ages 400, 900, 15 and 650 give a mean of 491.25 and a huge variance of about 106,855. The lengths are 20, 19, 21, 19 for spam (mean 19.75, variance 0.6875) and 23, 16, 23, 18 for ham (mean 20, variance 9.5).</p>
  <p>At age 40, the spam curve has height 0.00127 (40 is 30.5 days from the spam mean, quite far relative to a spread of √142 ≈ 12, but the curve is tall) and the ham curve has height 0.00047 (the ham curve is so wide that it is low everywhere). At length 20 the spam curve is 0.460 high and the ham curve 0.129. Multiplying with the priors: spam 0.5 × 0.00127 × 0.460 = 2.92 × 10⁻⁴, ham 0.5 × 0.00047 × 0.129 = 3.05 × 10⁻⁵, so P(spam) = 2.92 / (2.92 + 0.305) = <strong>0.906</strong>. A 40-day-old account looks far more like the young spam accounts than the mostly old ham accounts.</p>
  <div class="fx" data-lang="py">from sklearn.naive_bayes import GaussianNB
num = ["age_days", "length"]
gnb = GaussianNB().fit(inbox[num], y)
print("means   (rows ham, spam):", gnb.theta_.round(3).tolist())
print("variances              :", gnb.var_.round(3).tolist())
new_msg = pd.DataFrame([{"age_days": 40, "length": 20}])
print("P(spam | age 40, length 20) =", gnb.predict_proba(new_msg)[0, 1].round(4))
print("P(spam | age 40, length 17) =",
      gnb.predict_proba(pd.DataFrame([{"age_days": 40, "length": 17}]))[0, 1].round(4))</div>
  <div class="fx" data-lang="text">means   (rows ham, spam): [[491.25, 20.0], [9.5, 19.75]]
variances              : [[106854.688, 9.5], [142.25, 0.688]]
P(spam | age 40, length 20) = 0.9056
P(spam | age 40, length 17) = 0.0619</div>
  <p>scikit-learn stores the means in <code>theta_</code> and the variances in <code>var_</code>; both match the hand values (it uses the population variance, dividing by n rather than n − 1). The posterior is 0.9056. But the last line is a warning: shorten the message from 20 characters to 17 and P(spam) collapses to 0.062. The figure shows why.</p>
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
  <p>The four spam lengths happen to be almost identical (19 to 21), so their variance is tiny, 0.69, and the spam curve is a tall, narrow spike. Ham's lengths are spread out, so its curve is low and wide. At 20 characters the spike is far higher than the ham curve; at 17, which is about 3.3 standard deviations from the spam mean, the spike has fallen to almost nothing and the ham curve is 40 times higher. Four rows are simply not enough to estimate a spread reliably. scikit-learn guards against the worst case, a variance of exactly zero, by adding <code>var_smoothing</code> × (the largest variance of any feature) to every variance. Two other practical points: Gaussian NB fits skewed features such as ages and incomes poorly, so a log transform often helps (<a class="xref" data-note="ml_features">Feature Engineering</a>); and, unlike KNN or SVM, it does not need feature scaling, because each feature's mean and spread are estimated in that feature's own units.</p>

  <h2 id="nb-mix"><span class="num">08</span>Mixing Feature Types</h2>
  <p>We now have three kinds of clue in the same inbox: categories (sender known or unknown, sent at night or not), words, and numbers (age, length). Each needs its own way of computing P(xⱼ | c). For categories there is <strong>Categorical Naive Bayes</strong>, which simply counts: P(value | c) = (class-c rows with that value + α) / (class-c rows + α × number of categories). That is what we did by hand in section 02, now with smoothing. With α = 1, P(unknown | spam) = (3 + 1)/(4 + 2) = 0.667 and P(unknown | ham) = (1 + 1)/6 = 0.333, and the same for night, so the two clues give 0.5 × 0.667² = 0.222 against 0.5 × 0.333² = 0.056, a posterior of 0.80 (smoothing has pulled the earlier 0.90 a little toward 0.5).</p>
  <p>How do we combine all three kinds of clue into one answer? Because Naive Bayes multiplies one independent factor per feature, separate Naive Bayes models built on separate groups of features can be combined by multiplying their results, which in log space means <strong>adding their log-probabilities</strong>. The one subtlety is the prior: each model's posterior already contains P(c) once, so if we add three models we must subtract two extra copies of the log-prior.</p>
  <div class="fx" data-lang="py">from sklearn.naive_bayes import CategoricalNB
from sklearn.preprocessing import OrdinalEncoder
enc = OrdinalEncoder().fit(inbox[["sender", "night"]])           # categories -&gt; integer codes
cat = CategoricalNB(alpha=1.0).fit(enc.transform(inbox[["sender", "night"]]), y)
q = enc.transform(pd.DataFrame([{"sender": "unknown", "night": "yes"}]))
lp_text = mnb.predict_log_proba(vec.transform(["free lunch monday"]))[0]
lp_cat = cat.predict_log_proba(q)[0]
lp_num = gnb.predict_log_proba(new_msg)[0]
print("text alone", np.exp(lp_text[1]).round(3), "| sender+night alone", np.exp(lp_cat[1]).round(3),
      "| age+length alone", np.exp(lp_num[1]).round(3))
joint = lp_text + lp_cat + lp_num - 2 * np.log([0.5, 0.5])        # add evidence, keep ONE copy of the prior
print("all clues together: P(spam) =", np.exp(joint[1] - np.logaddexp(*joint)).round(3))</div>
  <div class="fx" data-lang="text">text alone 0.382 | sender+night alone 0.8 | age+length alone 0.906
all clues together: P(spam) = 0.96</div>
  <p>Each group of clues on its own tells a different story: the words alone say ham (0.382), the sender and time say spam (0.8), the account age and length say strongly spam (0.906). Combined, P(spam) = 0.96. You can check it by hand using log-odds, the log of P(spam)/P(ham). The text gives ln(0.382/0.618) = −0.481, the categories ln(0.8/0.2) = +1.386 and the numbers ln(0.906/0.094) = +2.265. The prior log-odds are 0 because the classes are 50/50, so the combined log-odds are simply the sum, +3.17, and 1/(1 + e^(−3.17)) = 0.96. Naive Bayes just adds up the evidence from every source.</p>
  <p>Two cautions. <code>CategoricalNB</code> expects each category as an integer code 0, 1, 2, … (that is what <code>OrdinalEncoder</code> produced above), not one-hot columns. And if you one-hot encode a category and feed the columns to Multinomial or Bernoulli NB, the "unknown" column and the "known" column are perfectly dependent (one is 1 exactly when the other is 0), so the same evidence is counted twice, exactly the problem from section 02.</p>
  <p>One more variant belongs here because it is the usual upgrade for text. <strong>Complement Naive Bayes</strong> (Rennie et al., 2003) estimates, for each class, the word distribution of all the <em>other</em> classes (its complement) and picks the class whose complement fits the document worst. When one class is small, its complement contains much more data, so the estimates are more stable. It corrects Multinomial NB's tendency to favour large classes on imbalanced text and often beats it.</p>

  <h2 id="nb-linear"><span class="num">09</span>Naive Bayes vs Logistic Regression</h2>
  <p>In the last section we kept adding log-probabilities, one per clue. A sum of one number per feature should remind you of something: a linear model. Take Multinomial NB with two classes and look at the log of the ratio of the two scores, the log-odds:</p>
  <p style="text-align:center"><strong>ln [P(spam | x) / P(ham | x)] = ln [P(spam)/P(ham)] + Σⱼ xⱼ · ln [P(wⱼ | spam) / P(wⱼ | ham)]</strong></p>
  <p>This is a constant (the prior log-odds, which plays the role of the bias b) plus a weighted sum of the word counts xⱼ, with one weight per word, wⱼ = ln(P(wⱼ | spam)/P(wⱼ | ham)). Turning log-odds back into a probability uses the sigmoid function. That is exactly the form of <a class="xref" data-note="ml_classification">logistic regression</a>: z = b + w·x, then sigmoid. Naive Bayes is a <strong>linear classifier</strong> in disguise. By hand for our message: b = ln(0.5/0.5) = 0, w_free = ln(0.100/0.0256) = +1.361, w_lunch = ln(0.025/0.0513) = −0.718, w_monday = ln(0.025/0.0769) = −1.124. The sum is −0.481, and sigmoid(−0.481) = 0.382, the same answer for the fourth time.</p>
  <div class="fx" data-lang="py">w = mnb.feature_log_prob_[1] - mnb.feature_log_prob_[0]          # weight of each word: ln P(w|spam)/P(w|ham)
b = mnb.class_log_prior_[1] - mnb.class_log_prior_[0]            # bias: prior log-odds
wt = pd.Series(w, index=vocab).sort_values()
print("most ham-like :", wt.head(3).round(3).to_dict())
print("most spam-like:", wt.tail(3).round(3).to_dict())
x = msg.toarray()[0]
z = b + x @ w                                                    # log-odds = bias + sum(count * weight)
print(f"log-odds for 'free lunch monday' = {z:.3f}  -&gt;  sigmoid = {1 / (1 + np.exp(-z)):.3f}")</div>
  <div class="fx" data-lang="text">most ham-like : {'monday': -1.124, 'at': -0.718, 'can': -0.718}
most spam-like: {'prize': 1.073, 'win': 1.073, 'free': 1.361}
log-odds for 'free lunch monday' = -0.481  -&gt;  sigmoid = 0.382</div>
  <p>The weights form a ready-made spam dictionary: "free" (+1.361), "win" and "prize" (+1.073) push toward spam, while "monday" (−1.124) and "at", "can" (−0.718) push toward ham. (Bernoulli NB is linear in the same way; Gaussian NB is linear only if each feature has the same variance in both classes, and otherwise draws a curved, quadratic boundary.)</p>
  <p>So Naive Bayes and logistic regression produce the same kind of model. The difference is how they choose the weights. Naive Bayes sets each weight from counts, one feature at a time, as if the other features did not exist. Logistic regression chooses all the weights together to make P(y | x) as accurate as possible on the training data, so when two words always appear together it can split the credit between them instead of counting it twice. Together they are called a <strong>generative–discriminative pair</strong>. Ng and Jordan (2002) showed what this means in practice: Naive Bayes reaches its best accuracy with far less data, but that best is a little worse; logistic regression needs more data but ends higher when the naive assumption is wrong.</p>
  <p>Eight messages are too few to see this, so we simulate a bigger inbox in the same spirit: 300 word types, 30% spam, messages of 5 to 19 words, and a deliberate violation of the naive assumption, where 20 of the words always appear as 4-word phrases. For each training size we train both models on 10 random samples and test on a fixed set of 2,000 messages.</p>
  <div class="fx" data-lang="py">V = 300                                          # simulated inbox: 300 word types, 30% spam
_rng = np.random.default_rng(0)
_base = _rng.dirichlet(np.ones(V) * 0.3)
SPAM_W = _base * np.exp(_rng.normal(0, 0.8, V)); SPAM_W /= SPAM_W.sum()   # word shares in spam
HAM_W = _base * np.exp(_rng.normal(0, 0.8, V)); HAM_W /= HAM_W.sum()      # word shares in ham

def make_inbox(n, seed):
    rng = np.random.default_rng(seed)
    yy = (rng.random(n) &lt; 0.3).astype(int)
    XX = np.array([rng.multinomial(rng.integers(5, 20), SPAM_W if t else HAM_W) for t in yy])
    for k in (20, 40, 60):                       # phrases: word j always comes with j+20, j+40, j+60
        XX[:, k:k + 20] += XX[:, 0:20]           # (this breaks the naive assumption on purpose)
    return XX, yy

from sklearn.linear_model import LogisticRegression
Xbig, ybig = make_inbox(3000, seed=1)            # pool of training messages
Xtest, ytest = make_inbox(2000, seed=2)          # fixed test inbox
rng = np.random.default_rng(3)
print("train size   NB acc   LR acc   (mean of 10 random training sets)")
for n in [10, 30, 100, 300, 1000, 3000]:
    nb_acc, lr_acc = [], []
    for r in range(10 if n &lt; 3000 else 1):
        idx = rng.choice(len(ybig), n, replace=False)
        if ybig[idx].min() == ybig[idx].max():
            continue                             # need both classes
        nb_acc.append(MultinomialNB().fit(Xbig[idx], ybig[idx]).score(Xtest, ytest))
        lr_acc.append(LogisticRegression(max_iter=2000).fit(Xbig[idx], ybig[idx]).score(Xtest, ytest))
    print(f"{n:9d}   {np.mean(nb_acc):.3f}    {np.mean(lr_acc):.3f}")</div>
  <div class="fx" data-lang="text">train size   NB acc   LR acc   (mean of 10 random training sets)
       10   0.728    0.709
       30   0.813    0.801
      100   0.870    0.867
      300   0.900    0.903
     1000   0.919    0.921
     3000   0.925    0.932</div>
  <p>With 10 to 100 training messages, Naive Bayes is ahead (0.728 against 0.709 at 10 messages). From about 300 messages logistic regression catches up, and with 3,000 it wins, 0.932 against 0.925, because it learns to down-weight the duplicated phrase words that Naive Bayes counts four times. This is the practical rule: with little labelled data or very many features, start with Naive Bayes; with plenty of data and correlated features, logistic regression usually wins. In practice, try both.</p>

  <h2 id="nb-calib"><span class="num">10</span>Calibration</h2>
  <p>Accuracy only checks whether the predicted class is right. Many systems use the probability itself: "block the message if P(spam) &gt; 0.99", or "show the 100 riskiest transactions to a human". For that, the probabilities must be honest. A model is <strong>calibrated</strong> if, among all the messages it scores at about 0.9, about 90% really are spam. Think of a weather forecaster: if it rains on only half of the days she announces "90% chance of rain", her forecasts are not calibrated, even if she gets "rain or no rain" mostly right.</p>
  <p>We already know why Naive Bayes is not calibrated. Correlated clues are counted as independent evidence, and every extra copy multiplies the odds again, pushing probabilities toward 0 or 1 (section 02 showed 0.75 becoming 0.964). The decision is often still right, but the confidence is exaggerated. On the simulated inbox, where phrases repeat four words at a time, we can measure it. <strong>Log-loss</strong> is the standard score for probabilities: it is small when the model gives high probability to what actually happened, and it punishes confident mistakes very heavily. We also count how often each model says "below 1%" or "above 99%", and how many of those extreme predictions are wrong. The repair tool is scikit-learn's <code>CalibratedClassifierCV</code>, which learns a mapping from the model's raw probabilities to honest ones on held-out folds, either with a sigmoid curve (<strong>Platt scaling</strong>, method="sigmoid") or a free-form increasing step function (<strong>isotonic regression</strong>).</p>
  <div class="fx" data-lang="py">from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import log_loss
models = {"MultinomialNB": MultinomialNB(),
          "NB + sigmoid": CalibratedClassifierCV(MultinomialNB(), method="sigmoid", cv=5),
          "NB + isotonic": CalibratedClassifierCV(MultinomialNB(), method="isotonic", cv=5),
          "LogisticRegression": LogisticRegression(max_iter=2000)}
print(f"{'model':19s} acc    log-loss  share of p&lt;0.01 or &gt;0.99   wrong among those")
for name, mdl in models.items():
    p = mdl.fit(Xbig, ybig).predict_proba(Xtest)[:, 1]
    extreme = (p &lt; 0.01) | (p &gt; 0.99)
    wrong = extreme &amp; ((p &gt; 0.5) != ytest)
    print(f"{name:19s} {np.mean((p &gt; 0.5) == ytest):.3f}  {log_loss(ytest, p):.3f}     {extreme.mean():.3f}"
          f"                    {wrong.sum()}")</div>
  <div class="fx" data-lang="text">model               acc    log-loss  share of p&lt;0.01 or &gt;0.99   wrong among those
MultinomialNB       0.925  0.196     0.628                    11
NB + sigmoid        0.924  0.206     0.000                    0
NB + isotonic       0.924  0.197     0.529                    3
LogisticRegression  0.932  0.162     0.526                    0</div>
  <p>Naive Bayes puts 62.8% of messages below 0.01 or above 0.99, and 11 of those extreme predictions are wrong: it said "less than 1% spam" for a spam message, or "more than 99%" for a ham one. Logistic regression makes extreme predictions less often (52.6%) and is never wrong when it does. Those few confident mistakes are expensive: Naive Bayes' log-loss is 0.196 against 0.162 for logistic regression, at almost the same accuracy. Sigmoid calibration removes the extreme predictions entirely and isotonic cuts the confident mistakes from 11 to 3, while accuracy barely moves, because calibration changes how confident the model is, not which side of 0.5 it lands on. Here neither calibrated version beats logistic regression's log-loss, because the double counting has also slightly damaged Naive Bayes' ranking of messages. The rule: use Naive Bayes' ranking freely, but calibrate before treating its numbers as probabilities, and always calibrate on data the model was not trained on (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a> covers this fully).</p>

  <h2 id="nb-practice"><span class="num">11</span>Naive Bayes in Practice</h2>
  <p>scikit-learn has one class per variant, and the right one follows from the type of feature: <code>MultinomialNB</code> for counts (and, in practice, TF-IDF), <code>ComplementNB</code> for counts with imbalanced classes, <code>BernoulliNB</code> for binary flags, <code>GaussianNB</code> for continuous measurements and <code>CategoricalNB</code> for integer-coded categories. They share a small set of settings. <code>alpha</code> (default 1.0) is the smoothing. <code>fit_prior</code> (default True) learns P(c) from the class frequencies in the training data; <code>class_prior</code> lets you supply your own. <code>GaussianNB</code> has <code>var_smoothing</code> instead of <code>alpha</code> and <code>priors</code> instead of <code>class_prior</code>. After fitting, <code>class_count_</code>, <code>class_log_prior_</code>, <code>feature_count_</code> and <code>feature_log_prob_</code> hold the counts and log-probabilities we computed by hand (<code>theta_</code> and <code>var_</code> for the Gaussian version).</p>
  <p>For text, the vectoriser and the model go together in a pipeline so that the vocabulary is learnt only from the training folds during cross-validation (otherwise words from the test set leak into training; see <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). Below we tune α on the simulated inbox, scoring by log-loss, and then compare the three discrete variants:</p>
  <div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.model_selection import GridSearchCV
from sklearn.naive_bayes import ComplementNB
to_text = lambda XX: [" ".join(f"w{j}" for j in np.repeat(np.arange(XX.shape[1]), row)) for row in XX]
texts_tr, texts_te = to_text(Xbig), to_text(Xtest)
pipe = make_pipeline(CountVectorizer(token_pattern=r"\\S+"), MultinomialNB())
grid = GridSearchCV(pipe, {"multinomialnb__alpha": [0.01, 0.1, 0.3, 1.0, 3.0]},
                    cv=5, scoring="neg_log_loss").fit(texts_tr, ybig)
for a, s in zip(grid.param_grid["multinomialnb__alpha"], grid.cv_results_["mean_test_score"]):
    print(f"alpha={a:&lt;5} CV log-loss {-s:.3f}")
print("best alpha:", grid.best_params_["multinomialnb__alpha"], " test acc:", round(grid.best_estimator_.score(texts_te, ytest), 3))
for M in (MultinomialNB, ComplementNB, BernoulliNB):
    print(f"{M.__name__:14s} test acc {M().fit(Xbig, ybig).score(Xtest, ytest):.3f}")</div>
  <div class="fx" data-lang="text">alpha=0.01  CV log-loss 0.190
alpha=0.1   CV log-loss 0.184
alpha=0.3   CV log-loss 0.183
alpha=1.0   CV log-loss 0.181
alpha=3.0   CV log-loss 0.180
best alpha: 3.0  test acc: 0.926
MultinomialNB  test acc 0.925
ComplementNB   test acc 0.926
BernoulliNB    test acc 0.917</div>
  <p>The cross-validated log-loss improves slightly as α grows from 0.01 to 3, and the test accuracy of the tuned pipeline is 0.926. The differences are small, which is typical: α matters most when data is tiny or the vocabulary is huge. Multinomial and Complement NB are essentially tied here (the classes are only mildly imbalanced), and Bernoulli is a little behind on these longer messages, as section 06 predicted.</p>
  <p>Naive Bayes has one property few models share. Its "training" is nothing but adding up counts, so it can learn from new data without starting over. scikit-learn exposes this as <code>partial_fit</code>, which a nightly job can call with each new batch of labelled messages:</p>
  <div class="fx" data-lang="py">stream = MultinomialNB()
for k, (a, z) in enumerate([(0, 1000), (1000, 2000), (2000, 3000)]):
    stream.partial_fit(Xbig[a:z], ybig[a:z], classes=[0, 1])      # just adds the new counts
    print(f"after batch {k + 1}: messages seen {int(stream.class_count_.sum())}, test acc {stream.score(Xtest, ytest):.3f}")
full = MultinomialNB().fit(Xbig, ybig)
print("identical to one fit on all 3000:", np.allclose(stream.feature_log_prob_, full.feature_log_prob_))</div>
  <div class="fx" data-lang="text">after batch 1: messages seen 1000, test acc 0.919
after batch 2: messages seen 2000, test acc 0.923
after batch 3: messages seen 3000, test acc 0.925
identical to one fit on all 3000: True</div>
  <p>After three batches of 1,000 messages the model is <em>identical</em> to one trained on all 3,000 at once, not just similar. Memory stays constant however many messages arrive, which is why Naive Bayes suits streaming filters. (Pass <code>classes=</code> on the first call, because the first batch might not contain every class.)</p>
  <p>Finally, to be sure nothing is hidden inside the library, here is Multinomial NB from scratch. Fitting is "add α to the counts per class and normalise each row" (sections 03 and 04); predicting is "log prior plus counts times log-probabilities, normalised with log-sum-exp" (section 05):</p>
  <div class="fx" data-lang="py">from scipy.special import logsumexp

class ScratchMultinomialNB:
    def __init__(self, alpha=1.0):
        self.alpha = alpha
    def fit(self, X, y):
        X = np.asarray(X.todense()) if hasattr(X, "todense") else np.asarray(X)
        self.classes_ = np.unique(y)
        counts = np.array([X[y == c].sum(axis=0) for c in self.classes_]) + self.alpha  # smoothed counts
        self.log_theta_ = np.log(counts / counts.sum(axis=1, keepdims=True))            # log P(word | class)
        self.log_prior_ = np.log([np.mean(y == c) for c in self.classes_])               # log P(class)
        return self
    def predict_proba(self, X):
        X = np.asarray(X.todense()) if hasattr(X, "todense") else np.asarray(X)
        joint = self.log_prior_ + X @ self.log_theta_.T          # log P(c) + sum(count * log P(w|c))
        return np.exp(joint - logsumexp(joint, axis=1, keepdims=True))

print("8 messages:", ScratchMultinomialNB().fit(X, y).predict_proba(msg)[0, 1].round(3), " sklearn:", mnb.predict_proba(msg)[0, 1].round(3))
diff = np.abs(ScratchMultinomialNB().fit(Xbig, ybig).predict_proba(Xtest) - full.predict_proba(Xtest)).max()
print(f"simulated inbox: largest probability difference from sklearn = {diff:.1e}")</div>
  <div class="fx" data-lang="text">8 messages: 0.382  sklearn: 0.382
simulated inbox: largest probability difference from sklearn = 1.4e-14</div>
  <p>It gives 0.382 on our eight messages, and on the 2,000 simulated test messages its probabilities differ from scikit-learn's by at most 10⁻¹⁴, which is just floating-point rounding. Notice the key line, <code>joint = self.log_prior_ + X @ self.log_theta_.T</code>: a matrix product of word counts with log-probabilities, which is exactly the linear model of section 09.</p>
  <p>When should you reach for Naive Bayes? Its strengths are speed (one pass, no iterations), tiny data requirements, effortless handling of 100,000+ sparse features, streaming updates, and readable weights. It also handles missing features gracefully: under the independence assumption you can simply leave a missing feature's factor out of the product. Its weaknesses are the ones we have measured: correlated features are double-counted, probabilities are over-confident, it cannot learn interactions (for example "'free' is spammy unless the sender is a known contact"), Gaussian NB assumes bell-shaped features, and with plenty of data logistic regression or boosting usually beat it. That makes it the classic first baseline for text (spam, sentiment, topic tagging, language detection) and a good choice whenever labels are scarce or training must be very fast.</p>
  <table class="tbl">
    <tr><th></th><th>Naive Bayes</th><th><a class="xref" data-note="ml_classification">Logistic regression</a></th><th><a class="xref" data-note="ml_knn">KNN</a></th><th><a class="xref" data-note="ml_svm">SVM</a></th><th><a class="xref" data-note="ml_dtree">Trees</a> / <a class="xref" data-note="ml_gbm">boosting</a></th></tr>
    <tr><td>How it learns</td><td>counting (generative)</td><td>optimisation (discriminative)</td><td>stores the data</td><td>maximum margin</td><td>recursive splits</td></tr>
    <tr><td>Small data</td><td>very good</td><td>good with regularisation</td><td>OK</td><td>good</td><td>unstable</td></tr>
    <tr><td>Correlated features</td><td>double-counts</td><td>handles</td><td>distorts distances</td><td>handles</td><td>handles</td></tr>
    <tr><td>Interactions</td><td>no</td><td>only if engineered</td><td>yes</td><td>with kernels</td><td>yes</td></tr>
    <tr><td>Probabilities</td><td>too extreme</td><td>good</td><td>coarse</td><td>need calibration</td><td>decent (boosting)</td></tr>
    <tr><td>Needs scaling</td><td>no</td><td>yes</td><td>yes</td><td>yes</td><td>no</td></tr>
  </table>

  <h2 id="nb-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most damaging mistake is forgetting to smooth. With α at zero, any word never seen in a class sets that class's probability to exactly zero, so one unusual word vetoes everything else in the message; section 04 showed "free lunch monday" become 0.000 spam for that reason. Close behind is computing the score as a plain product of probabilities: it works on three-word examples and underflows to 0.0 on real e-mails. Always smooth, and always sum logs and normalise with log-sum-exp (or simply use the library, which does both).</p>
  <p>A second family of mistakes comes from giving a variant the wrong kind of input. <code>MultinomialNB</code> models counts, so it refuses negative numbers, and a common way to produce them is to put a <code>StandardScaler</code> in front of it out of habit:</p>
  <div class="fx" data-lang="py">from sklearn.preprocessing import StandardScaler
try:
    make_pipeline(StandardScaler(with_mean=True), MultinomialNB()).fit(X.toarray(), y)
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">ValueError: Negative values in data passed to MultinomialNB (input X).</div>
  <p>Scaling is pointless for Naive Bayes anyway (each feature's probabilities are estimated in its own units), so the fix is to remove the scaler. Similarly, feed integer codes rather than one-hot columns to <code>CategoricalNB</code>, use <code>GaussianNB</code> for continuous measurements rather than binarising them into Bernoulli features, and remove duplicated or near-duplicate columns, which are double-counted.</p>
  <p>A subtler mistake is learning the prior from a training set whose class balance differs from reality. Teams often build a balanced training set, say 50% spam, when the real inbox is 5% spam. The model then learns P(spam) = 0.5 and over-predicts spam in production. The prior can be set directly:</p>
  <div class="fx" data-lang="py">true_rate = 0.05                                     # in the real inbox only 5% of messages are spam
m_fix = MultinomialNB(class_prior=[1 - true_rate, true_rate]).fit(X, y)
probe = vec.transform(["free cash prize"])
print("prior learnt from 50/50 training data:", mnb.predict_proba(probe)[0, 1].round(3))
print("prior set to the real 5% spam rate   :", m_fix.predict_proba(probe)[0, 1].round(3))</div>
  <div class="fx" data-lang="text">prior learnt from 50/50 training data: 0.957
prior set to the real 5% spam rate   : 0.539</div>
  <p>The same message drops from 0.957 to 0.539 once the model is told that spam is rare, which is the Bayes' theorem lesson of section 01 again: the prior matters. Finally, two conceptual slips come up in interviews: saying "Naive Bayes assumes the features are independent" (it assumes independence <em>given the class</em>), and treating its probabilities as trustworthy (they are over-confident; calibrate them first).</p>

  <h2 id="nb-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Bayes' theorem</b>: P(c | x) = P(x | c)·P(c) / P(x), with P(x) = Σₖ P(x | k)P(k).</li>
    <li><b>Prior</b> P(c), <b>likelihood</b> P(x | c), <b>evidence</b> P(x), <b>posterior</b> P(c | x).</li>
    <li><b>MAP rule</b>: predict the class with the largest P(c)·P(x | c).</li>
    <li><b>Naive (conditional independence) assumption</b>: P(x₁…x_d | c) = Π P(xⱼ | c).</li>
    <li><b>Generative</b> (models P(x | c), e.g. NB) vs <b>discriminative</b> (models P(c | x), e.g. logistic regression).</li>
    <li><b>Laplace smoothing</b>: add α to every count; α = 1 is Laplace.</li>
    <li><b>Log-sum-exp</b>: ln Σ e^aₖ = m + ln Σ e^(aₖ − m), m = max aₖ.</li>
    <li><b>Calibrated</b>: among predictions of about p, a share p are positive.</li>
  </ul>
  <h3>The variants</h3>
  <table class="tbl">
    <tr><th>Class</th><th>Features</th><th>P(xⱼ | c)</th><th>Typical use</th></tr>
    <tr><td><code>MultinomialNB</code></td><td>counts</td><td>(N_cj + α)/(N_c + αV), multiplied once per occurrence</td><td>text</td></tr>
    <tr><td><code>ComplementNB</code></td><td>counts</td><td>estimated from the other classes</td><td>imbalanced text</td></tr>
    <tr><td><code>BernoulliNB</code></td><td>0/1</td><td>p = (n_cj + α)/(n_c + 2α); absent words give 1 − p</td><td>short texts, flags</td></tr>
    <tr><td><code>GaussianNB</code></td><td>continuous</td><td>normal density with class mean and variance</td><td>measurements</td></tr>
    <tr><td><code>CategoricalNB</code></td><td>integer codes</td><td>(count + α)/(n_c + α·K)</td><td>categories</td></tr>
  </table>
  <h3>The inbox numbers</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value</th></tr>
    <tr><td>P(spam | unknown sender)</td><td>0.75 × 0.5 / 0.5 = 0.75</td></tr>
    <tr><td>Unknown + night (naive)</td><td>0.2812 vs 0.0312 → 0.90; same clue 3× → 0.964</td></tr>
    <tr><td>Multinomial, "free lunch monday"</td><td>0.100·0.025·0.025 vs 0.0256·0.0513·0.0769 → 0.382</td></tr>
    <tr><td>Log-scores</td><td>−10.374 vs −9.892 → 0.382</td></tr>
    <tr><td>Bernoulli</td><td>0.292 (repeats ignored)</td></tr>
    <tr><td>Gaussian, age 40, length 20</td><td>0.906 (length 17 → 0.062)</td></tr>
    <tr><td>All clues combined</td><td>log-odds −0.481 + 1.386 + 2.265 → 0.96</td></tr>
    <tr><td>Linear weights</td><td>free +1.361, lunch −0.718, monday −1.124</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB, BernoulliNB, GaussianNB, ComplementNB, CategoricalNB
from sklearn.calibration import CalibratedClassifierCV

model = make_pipeline(CountVectorizer(), MultinomialNB(alpha=1.0))  # text
model.fit(texts, y); model.predict_proba(new_texts)
GaussianNB(var_smoothing=1e-9)                     # numeric columns
MultinomialNB(class_prior=[0.95, 0.05])            # set the real-world prior
nb.partial_fit(X_batch, y_batch, classes=[0, 1])   # streaming updates
CalibratedClassifierCV(MultinomialNB(), method="sigmoid", cv=5)  # honest probabilities</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Independence is assumed <em>given the class</em>, and is almost always false; NB still ranks well.</li>
    <li>Always smooth, always compute in logs.</li>
    <li>Duplicated or correlated features are double-counted → over-confident probabilities.</li>
    <li>No negative inputs to MultinomialNB; no scaling needed for any NB.</li>
    <li>A prior learnt from a re-balanced training set is wrong for deployment.</li>
    <li>Little data → NB; lots of data → logistic regression usually wins.</li>
  </ul>

  <h2 id="nb-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>State Bayes' theorem and name each term.</summary><div class="qa-body">P(c | x) = P(x | c)·P(c) / P(x). P(c) is the prior, the belief before seeing the evidence; P(x | c) the likelihood, how typical the evidence is of class c; P(x) the evidence, a normalising constant equal to Σₖ P(x | k)P(k); P(c | x) the posterior. In our inbox, P(spam | unknown sender) = 0.75 × 0.5 / 0.5 = 0.75.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is "naive" about Naive Bayes?</summary><div class="qa-body">It assumes the features are conditionally independent given the class, so P(x₁, …, x_d | c) = Π P(xⱼ | c). This replaces an impossible joint table (2²⁴ cells for 24 binary words) with d small ones that can each be estimated from all the rows of a class. It is naive because real features, such as words in phrases, are dependent even within a class.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Naive Bayes work well even though its assumption is false?</summary><div class="qa-body">Classification only needs the correct winner, not correct probabilities, and dependence errors often shift both classes' scores in the same direction. Estimating each P(xⱼ | c) separately has very low variance, which matters most with small data. The cost shows up in the probabilities, which become over-confident.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Naive Bayes generative or discriminative? What is the difference?</summary><div class="qa-body">Generative: it models how each class produces its features, P(x | c), plus the prior P(c), and gets P(c | x) through Bayes' theorem. A discriminative model such as logistic regression models P(c | x) directly. Generative models need less data and can generate examples; discriminative models usually reach higher accuracy with plenty of data because they make fewer assumptions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Laplace smoothing and why is it needed?</summary><div class="qa-body">Adding α (1 for Laplace) to every count: P(w | c) = (count + α)/(N_c + αV). Without it, a word never seen in a class gets probability 0, and a single such word sets the whole class score to 0 regardless of the other evidence. Larger α pulls every probability toward uniform (more bias); α is tuned by cross-validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do implementations work with log-probabilities?</summary><div class="qa-body">Multiplying hundreds of probabilities below 1 underflows to 0.0 in floating point. Logs turn the product into a sum and preserve which class is largest. To convert back to probabilities, log-sum-exp subtracts the largest log-score before exponentiating so nothing underflows; the ratio is unchanged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Multinomial vs Bernoulli vs Gaussian Naive Bayes: when do you use each?</summary><div class="qa-body">Multinomial for count features such as word counts; it counts repeats and ignores absent words. Bernoulli for binary presence features; absent words contribute (1 − p) and repeats do not matter, which suits short texts. Gaussian for continuous features, fitting a normal curve per class per feature. Categorical for integer-coded categories, Complement NB for imbalanced text.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For "free free free", does Bernoulli NB's answer change compared with "free"? Does Multinomial NB's?</summary><div class="qa-body">Bernoulli does not change, because it only records whether the word is present. Multinomial does: it multiplies P(free | c) in once per occurrence, so the spam evidence is cubed. In our inbox "free lunch monday" goes from 0.382 to 0.904 spam under Multinomial NB when "free" is repeated, and stays at 0.292 under Bernoulli NB.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Gaussian NB estimate P(x | c), and what can go wrong?</summary><div class="qa-body">For each class and feature it computes the mean and variance and uses the normal density at the new value. It goes wrong when features are far from bell-shaped (skewed ages or incomes) and when a class has a tiny variance from few or near-identical values, which makes the curve a spike: in our inbox a length of 17 instead of 20 dropped P(spam) from 0.906 to 0.062. sklearn adds var_smoothing to every variance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Show that Multinomial Naive Bayes is a linear classifier.</summary><div class="qa-body">The log-odds are ln(P(1)/P(0)) + Σⱼ xⱼ ln(θ₁ⱼ/θ₀ⱼ): a bias plus a weighted sum of the counts, followed by a sigmoid for the probability. That is the same form as logistic regression. For "free lunch monday": 0 + 1.361 − 0.718 − 1.124 = −0.481, and sigmoid(−0.481) = 0.382.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Naive Bayes or logistic regression: which would you choose, and when?</summary><div class="qa-body">They share the same linear form but fit it differently. NB sets each weight from per-feature counts, so it is fast and reaches its best accuracy with little data. Logistic regression optimises all weights jointly, handles correlated features and gives better-calibrated probabilities, so it usually wins with plenty of data. In our simulation NB led up to about 100 training messages and logistic regression led from about 300.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are Naive Bayes probabilities well calibrated? How would you fix them?</summary><div class="qa-body">Usually not: correlated features are counted as independent evidence, which pushes probabilities toward 0 and 1. On our simulated inbox NB made 11 wrong predictions beyond 0.01/0.99, logistic regression none. Fix with CalibratedClassifierCV (sigmoid/Platt or isotonic) fitted on held-out folds, or use logistic regression when probabilities matter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you include the same feature twice?</summary><div class="qa-body">NB treats the copies as independent evidence and multiplies the same likelihood ratio in twice, so the posterior becomes more extreme without any new information: P(spam | unknown sender) went from 0.75 to 0.90 to 0.964 with one, two and three copies. Accuracy may survive; calibration does not. Remove duplicates or use a discriminative model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Naive Bayes handle missing values and data that arrives over time?</summary><div class="qa-body">A missing feature can simply be left out of the product, which is principled under the independence assumption. For new data, training is just adding counts, so partial_fit on successive batches gives exactly the same model as one fit on all the data, in constant memory. That makes NB a natural fit for streaming spam filters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your training set is 50% spam but production traffic is 5% spam. What do you do?</summary><div class="qa-body">The learnt prior P(spam) = 0.5 is wrong for production and will over-predict spam. Set class_prior to the real rates (in our example a message dropped from 0.957 to 0.539 spam), or keep the model and move the decision threshold. This is Bayes' theorem in action: the same likelihoods with a different prior give a different posterior.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the training and prediction costs of Naive Bayes?</summary><div class="qa-body">Training is one pass of counting, O(n·d), and only non-zero entries matter for sparse text. Prediction is O(non-zero features × classes). Memory is O(classes × features). There are no iterations and almost no hyperparameters beyond α or var_smoothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should you not put a StandardScaler before MultinomialNB?</summary><div class="qa-body">MultinomialNB models counts and rejects negative values, which standardising produces. Scaling also has no benefit for any Naive Bayes variant, since each feature's probabilities are estimated in its own units; Gaussian NB's predictions do not change when a feature is rescaled.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name a situation where Naive Bayes is a poor choice.</summary><div class="qa-body">When features interact (a word is spammy only from unknown senders), because NB cannot represent interactions; when features are strongly correlated, because they are double-counted; when calibrated probabilities are required; and when there is plenty of labelled data, where logistic regression or gradient boosting usually win.</div></details>
</main>
`
});
