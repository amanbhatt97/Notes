// notes/ml/ml_intro.js — What is Machine Learning
Object.assign(TOPIC_CONTENT, {
  "ml_intro": `<main>
  <h1>What is Machine Learning</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>What is Machine Learning</span></div>
  <p class="lead">Machine learning is a way of building software where you do not write the rule yourself: you show the computer many past examples with their answers, and it searches for the rule that makes the fewest mistakes. This note opens the whole Machine Learning track. It shows, with numbers you can check by hand, how a learned rule differs from a hand-written one, defines every word you will meet in later notes (feature, label, sample, parameter, hyperparameter, training, inference), walks through the three kinds of learning and the full life of a real project from problem framing to monitoring, builds a first complete model in scikit-learn, and ends with the map of all nine groups of the track and the order to read them in. One running example carries the whole note: <strong>ten flats in Pune</strong> (area, bedrooms, locality, age, sale price). The same ten flats come back in every Foundations note, so each new idea is built on numbers you have already met.</p>

  <h2 id="mi-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: Statistics and Mathematics</b><span>You have met averages and spread in <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>, chance in <a class="xref" data-note="st_probability">Probability</a>, slopes in <a class="xref" data-note="m_calculus">Calculus</a> and vectors in <a class="xref" data-note="m_linalg">Linear Algebra</a>. Those tools describe data you already have. What they leave open is the practical question every company asks: "given what we saw in the past, what will happen for this <em>new</em> customer, email or day?"</span></li>
    <li><b>This note adds: the idea of learning from examples</b><span>What "learning" means in code (search for the rule with the lowest error on past examples: on our ten flats the data picks "₹7 lakh per 100 sq ft" over the broker's "₹8 lakh", then the line price = 6 × area + 10), the vocabulary, the three learning types, the end-to-end workflow, a first working model, and the map of the whole track.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a></b><span>Our line misses the ten flats by only 4.6 (squared lakh) on average, but those are the flats it learned from. A model that scores well on the rows it learned from has proved nothing. The very next note holds some flats back and measures honestly, which every later note depends on.</span></li>
  </ol>
  <p>This is also the first note of the <strong>Foundations</strong> group. The seven Foundations notes are the toolkit that every model in the track uses. Read them in this order; each one solves a problem the previous one leaves open. All seven use the same ten flats as their running example, so you can follow one set of numbers from "what is a model" to "a leak-proof pipeline".</p>
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

  <h2 id="mi-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Every number is computed on the same ten flats (section 01).</p>
  <ol class="story">
    <li><b>Hand-written rule</b><span>Q: how do we price a flat? → A broker's rule of thumb: ₹8 lakh per 100 sq ft. On our ten flats it misses by 9.2 lakh on average. But nobody checked the "8" against the records…</span></li>
    <li><b>Learning = search</b><span>Q: can the past sales choose the rule for us? → Try every candidate rate, score each on the ten flats, keep the best: rate 7.0, average miss 3.1 lakh. Nobody typed "7". But what exactly are the "inputs", the "answer" and the "7"?</span></li>
    <li><b>Vocabulary</b><span>Q: what do we call the pieces? → Samples (flats), feature (area, a column of X, 10 × 1), label (price, y), model, parameters (learned: w = 6, b = 10), hyperparameters (chosen by you: k = 2 neighbours), training (fit) and inference (predict). But a line has two numbers that can take any value: we cannot try them all…</span></li>
    <li><b>Loss (MSE)</b><span>Q: how wrong is a candidate rule, as one number we can minimise? → Mean squared error: 118.6 for "8 × area", 13.1 for "7 × area", 6.725 for "6.5 × area + 5". But there are infinitely many lines to score…</span></li>
    <li><b>Optimisation (least squares)</b><span>Q: how do we find the best line without trying them all? → Calculus gives it directly: w = 495 / 82.5 = 6, b = 67 − 6 × 9.5 = 10, MSE 4.6, the lowest possible. But a low error on the ten flats we learned from is not the goal…</span></li>
    <li><b>Generalisation</b><span>Q: what is the real goal? → Doing well on <em>new</em> flats. A curve through all ten points has error 0 and may still price the next flat badly. But so far every flat came with its price; what if answers are missing?</span></li>
    <li><b>Types of learning</b><span>Q: what if we have answers, no answers, few answers or only rewards? → Supervised (price: regression; "sold within 30 days": classification), unsupervised (k-means splits the flats into {A–D} and {E–J}), semi-supervised, self-supervised, reinforcement. But fitting a model is a small part of a real project…</span></li>
    <li><b>The workflow</b><span>Q: what happens before and after <code>fit</code>? → Frame (call a seller when p &gt; 0.133), data, features, split, baseline, train, evaluate, deploy, monitor (PSI 0.151 = moderate drift). But that is a description, not a run…</span></li>
    <li><b>A first model end to end</b><span>Q: what does the whole loop look like in code? → On the flats: baseline test MAE 17.0 lakh, line 1.28; at scale on 569 tumours: test accuracy 0.965. But this is one model; which families exist and in what order should we learn them?</span></li>
    <li><b>The map of the track</b><span>Q: what comes next, and why in that order? → Nine groups, Foundations first. The first open question: how do we know a score like "MAE 1.28" is honest? → <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>.</span></li>
  </ol>

  <h2 id="mi-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">What is Machine Learning</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Rules vs learning</div>
        <ul>
          <li><b>Rules-based</b> — rules + data → program → answers; a person writes every rule</li>
          <li><b>ML</b> — data + answers → training → the rule (the <b>model</b>)</li>
          <li>Ten flats: broker's "₹8 lakh per 100 sq ft" misses by 9.2 lakh on average; learned rate 7.0 misses by 3.1</li>
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
          <li>Flats: 8 × area MSE 118.6, 7 × area 13.1, 6.5 × area + 5 6.725</li>
          <li><b>Least squares</b> w = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)² = 495/82.5 = 6, b = 67 − 6 × 9.5 = 10 (MSE 4.6)</li>
          <li><b>Optimisation</b> — formula or gradient descent finds the minimum</li>
          <li><b>Goal = generalisation</b>, not a low training loss</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Types of learning</div>
        <ul>
          <li><b>Supervised</b> (X, y): <b>regression</b> (price), <b>classification</b> (sold within 30 days?)</li>
          <li><b>Unsupervised</b> (X only): clustering (flats {A–D} vs {E–J}), dimensionality reduction, anomalies</li>
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
          <li>Framing in money: call a seller if p(no sale) &gt; 200 / (0.5 × 3000) = 0.133</li>
          <li><b>Baseline first</b>: flats: mean-price MAE 17.0 vs line 1.28; tumours: majority class 62.6%, recall 0</li>
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
      <div class="rm-item rm-done" data-target="mi-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="mi-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Rules vs Learning</span><span class="rm-sub">Ten flats: a rule written vs learned</span></div></div>
      <div class="rm-item rm-done" data-target="mi-vocab"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Key Vocabulary</span><span class="rm-sub">Features, labels, parameters, hyperparameters</span></div></div>
      <div class="rm-item rm-done" data-target="mi-learn"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">How a Model Learns</span><span class="rm-sub">Loss, least squares by hand, generalisation</span></div></div>
      <div class="rm-item rm-done" data-target="mi-types"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Types of Learning</span><span class="rm-sub">Supervised, unsupervised, RL, semi/self</span></div></div>
      <div class="rm-item rm-done" data-target="mi-flow"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Workflow</span><span class="rm-sub">Framing to monitoring, PSI by hand</span></div></div>
      <div class="rm-item rm-done" data-target="mi-first"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">First Model End to End</span><span class="rm-sub">Ten flats, then 569 tumours</span></div></div>
      <div class="rm-item rm-done" data-target="mi-track"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The ML Track Map</span><span class="rm-sub">All nine groups and the reading order</span></div></div>
      <div class="rm-item rm-done" data-target="mi-connect"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="mi-compare"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">ML vs rules, statistics, AI, deep learning</span></div></div>
      <div class="rm-item rm-done" data-target="mi-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps beginners and interviews hit</span></div></div>
      <div class="rm-item rm-done" data-target="mi-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="mi-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="mi-what"><span class="num">01</span>Rules vs Learning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Statistics taught us to describe data we already have: an average price, a spread. It did not tell us how to turn past records into a rule that answers a <em>new</em> case: "what will this flat sell for?" Who writes that rule, a person or the data?</p>
  </div>
  <h3>The need, and the running example</h3>
  <p>A property portal in Pune helps people sell flats. When a seller lists a flat, the portal must suggest a price. Suggest too high and the flat sits unsold; too low and the seller loses lakhs. The portal has a record of past sales. Here are ten of them. <strong>These ten flats are the running example of this note and of the whole Foundations group</strong>; every concept below is computed on them.</p>
  <table class="tbl out"><caption>The running example: ten flats sold in Pune (area x in hundreds of sq ft, so 5 = 500 sq ft; price in ₹ lakh)</caption>
    <tr><th>Flat</th><th>Area x</th><th>Bedrooms</th><th>Locality</th><th>Age (years)</th><th>Listed</th><th>Price y</th><th>Sold within 30 days?</th></tr>
    <tr><td>A</td><td>5</td><td>1</td><td>Hadapsar</td><td>12</td><td>Mar</td><td>38</td><td>1</td></tr>
    <tr><td>B</td><td>6</td><td>1</td><td>Baner</td><td>3</td><td>Jan</td><td>49</td><td>0</td></tr>
    <tr><td>C</td><td>7</td><td>2</td><td>Kothrud</td><td>8</td><td>May</td><td>53</td><td>0</td></tr>
    <tr><td>D</td><td>8</td><td>2</td><td>Hadapsar</td><td>15</td><td>Feb</td><td>56</td><td>1</td></tr>
    <tr><td>E</td><td>9</td><td>2</td><td>Baner</td><td>5</td><td>Aug</td><td>67</td><td>0</td></tr>
    <tr><td>F</td><td>10</td><td>3</td><td>Kothrud</td><td>10</td><td>Apr</td><td>68</td><td>1</td></tr>
    <tr><td>G</td><td>11</td><td>3</td><td>Hadapsar</td><td>20</td><td>Jun</td><td>73</td><td>1</td></tr>
    <tr><td>H</td><td>12</td><td>3</td><td>Baner</td><td>2</td><td>Sep</td><td>83</td><td>0</td></tr>
    <tr><td>I</td><td>13</td><td>3</td><td>Kothrud</td><td>7</td><td>Jul</td><td>87</td><td>0</td></tr>
    <tr><td>J</td><td>14</td><td>4</td><td>Baner</td><td>4</td><td>Oct</td><td>96</td><td>0</td></tr>
  </table>
  <p>Bigger flats cost more, but not exactly in proportion: flat E (900 sq ft, Baner, 5 years old) sold for more than its size alone suggests, flat G (1,100 sq ft, Hadapsar, 20 years old) for less. Real data always has variation that one column cannot explain. There are two ways to build the "suggest a price" software: a person can <strong>write the rule</strong>, or the computer can <strong>learn the rule</strong> from these records. This section does both.</p>

  <h3>Way 1: a person writes the rule</h3>
  <p>A senior broker, from experience, says: "flats go for about ₹8 lakh per 100 sq ft". So the rule is price = 8 × x. Check it on the ten past sales. The <em>miss</em> is actual − predicted.</p>
  <table class="tbl out"><caption>Broker's rule: price = 8 × area</caption>
    <tr><th>Flat</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th><th>I</th><th>J</th></tr>
    <tr><td>Rule says</td><td>40</td><td>48</td><td>56</td><td>64</td><td>72</td><td>80</td><td>88</td><td>96</td><td>104</td><td>112</td></tr>
    <tr><td>Actual</td><td>38</td><td>49</td><td>53</td><td>56</td><td>67</td><td>68</td><td>73</td><td>83</td><td>87</td><td>96</td></tr>
    <tr><td>Miss</td><td>−2</td><td>1</td><td>−3</td><td>−8</td><td>−5</td><td>−12</td><td>−15</td><td>−13</td><td>−17</td><td>−16</td></tr>
  </table>
  <p>Ignoring the sign, the misses add up to 2 + 1 + 3 + 8 + 5 + 12 + 15 + 13 + 17 + 16 = 92, an <strong>average miss of 9.2 lakh</strong>. Worse, almost every miss is negative: the rule overprices big flats badly (flat I by ₹17 lakh). The broker's "8" came from a gut feeling, perhaps from a few expensive Baner sales, not from these records.</p>

  <h3>Way 2: the computer learns the rule, by hand</h3>
  <p>Keep the same <em>shape</em> of rule ("price = k × area") but let the data choose k. We cannot try every real number, so try a grid of sensible rates and score each one by its average miss on the ten flats.</p>
  <table class="tbl out"><caption>Every candidate rate and its average miss (₹ lakh)</caption>
    <tr><th>Rate k</th><th>Misses y − k·x for A … J</th><th>Average |miss|</th></tr>
    <tr><td>6.0</td><td>8, 13, 11, 8, 13, 8, 7, 11, 9, 12</td><td>100 / 10 = 10.00</td></tr>
    <tr><td>6.5</td><td>5.5, 10, 7.5, 4, 8.5, 3, 1.5, 5, 2.5, 5</td><td>52.5 / 10 = 5.25</td></tr>
    <tr><td><strong>7.0</strong></td><td><strong>3, 7, 4, 0, 4, −2, −4, −1, −4, −2</strong></td><td><strong>31 / 10 = 3.10</strong></td></tr>
    <tr><td>7.5</td><td>0.5, 4, 0.5, −4, −0.5, −7, −9.5, −7, −10.5, −9</td><td>52.5 / 10 = 5.25</td></tr>
    <tr><td>8.0 (broker)</td><td>−2, 1, −3, −8, −5, −12, −15, −13, −17, −16</td><td>92 / 10 = 9.20</td></tr>
  </table>
  <p>The winner is k = 7.0: price = 7 × area, with an average miss of 3.1 lakh, three times better than the broker. For a new 950 sq ft flat it suggests 7 × 9.5 = ₹66.5 lakh. That is the whole idea of machine learning in one table: <strong>choose a family of possible rules, score each one on past examples, keep the best</strong>. Nobody typed "7". The data chose it.</p>

  <h3>The same idea for a yes/no answer</h3>
  <p>The portal also wants to warn sellers whose flat will be slow to sell. The last column of the table says whether each flat sold within 30 days (1 = yes). The branch manager's rule: "flats 15 years or older sell fast, because they are cheaper per sq ft". That marks D and G as fast, but A (12 years) and F (10 years) also sold fast: <strong>2 mistakes</strong>.</p>
  <p>Learn the cut-off instead: rule "sells fast if age ≥ t". Only the gaps between neighbouring ages matter (any t between 8 and 10 makes the same decisions), so try the midpoint of each gap plus one value below and one above everyone. Sorted ages: 2 (H), 3 (B), 4 (J), 5 (E), 7 (I), 8 (C), 10 (F), 12 (A), 15 (D), 20 (G); the last four sold fast.</p>
  <table class="tbl out"><caption>Every cut-off and its number of mistakes</caption>
    <tr><th>Cut-off t</th><td>1</td><td>2.5</td><td>3.5</td><td>4.5</td><td>6</td><td>7.5</td><td><strong>9</strong></td><td>11</td><td>13.5</td><td>17.5</td><td>21</td></tr>
    <tr><th>Mistakes</th><td>6</td><td>5</td><td>4</td><td>3</td><td>2</td><td>1</td><td><strong>0</strong></td><td>1</td><td>2</td><td>3</td><td>4</td></tr>
  </table>
  <p>t = 9 makes no mistakes on these ten flats. Whether "age ≥ 9 years → sells fast" also holds for <em>next month's</em> flats is a different question, and the most important one in machine learning (section 03, and the whole of the next note).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new estate agent is told by her boss "ask ₹8 lakh per 100 sq ft" (a written rule). After a year she has her own notebook of what each flat really sold for, and she notices that ₹7 lakh is closer, and that old flats go quickly. She did not get a better rule from a book; she got it from her notebook. The notebook is the training data, and her updated habit is the model.</p>
  </div>

  <h3>The same searches in code</h3>
  <p>The code below scores the broker's rule, repeats the hand search over rates, asks scikit-learn's <code>LinearRegression</code> (with no intercept, so the family is exactly "price = k × area") to search more finely, and then repeats the yes/no search, including with a depth-1 decision tree (a "stump", one question only). How a stump scores cut-offs is covered in <a class="xref" data-note="ml_dtree">Decision Trees</a>.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeClassifier

#                  A   B   C   D   E   F   G   H   I   J
area  = np.array([ 5,  6,  7,  8,  9, 10, 11, 12, 13, 14])   # x: area in 100 sq ft
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])   # y: sale price, ₹ lakh

# 1) Rules-based: the broker's rule of thumb, ₹8 lakh per 100 sq ft
def broker_rule(x):
    return 8.0 * x
print("broker rule  average miss:", np.abs(price - broker_rule(area)).mean(), "lakh")

# 2) Machine learning: try every candidate rate k, keep the one with the smallest average miss
for k in [6.0, 6.5, 7.0, 7.5, 8.0]:
    miss = np.abs(price - k * area).mean()
    print(f"rate k = {k:.1f} -&gt; average miss {miss:5.2f} lakh")
best = min([6.0, 6.5, 7.0, 7.5, 8.0], key=lambda k: np.abs(price - k * area).mean())
print("learned rule: price =", best, "x area   -&gt; 950 sq ft flat:", best * 9.5, "lakh")

# 3) A library model doing a (finer) search of the same family: price = k x area
lib = LinearRegression(fit_intercept=False).fit(area.reshape(-1, 1), price)
print("sklearn best rate (squared-error search):", lib.coef_.round(3))

# 4) The same idea for a yes/no answer: did the flat sell within 30 days?
age  = np.array([12, 3, 8, 15, 5, 10, 20, 2, 7, 4])          # years
sold = np.array([ 1, 0, 0,  1, 0,  1,  1, 0, 0, 0])          # 1 = sold within 30 days
print("manager rule 'age &gt;= 15' errors:", int(((age &gt;= 15).astype(int) != sold).sum()))
s = np.sort(age)
cuts = np.r_[s[0] - 1, (s[:-1] + s[1:]) / 2, s[-1] + 1]      # one cut-off per gap
print("cut-offs tried:", cuts)
print("errors        :", [int(((age &gt;= t).astype(int) != sold).sum()) for t in cuts])
stump = DecisionTreeClassifier(max_depth=1).fit(age.reshape(-1, 1), sold)
print("sklearn stump threshold:", stump.tree_.threshold[0], "  new flats aged 6, 18 -&gt;", stump.predict([[6], [18]]))</div>
  <div class="fx" data-lang="text">broker rule  average miss: 9.2 lakh
rate k = 6.0 -&gt; average miss 10.00 lakh
rate k = 6.5 -&gt; average miss  5.25 lakh
rate k = 7.0 -&gt; average miss  3.10 lakh
rate k = 7.5 -&gt; average miss  5.25 lakh
rate k = 8.0 -&gt; average miss  9.20 lakh
learned rule: price = 7.0 x area   -&gt; 950 sq ft flat: 66.5 lakh
sklearn best rate (squared-error search): [6.964]
manager rule 'age &gt;= 15' errors: 2
cut-offs tried: [ 1.   2.5  3.5  4.5  6.   7.5  9.  11.  13.5 17.5 21. ]
errors        : [6, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4]
sklearn stump threshold: 9.0   new flats aged 6, 18 -&gt; [0 1]</div>
  <p>The hand tables are reproduced line for line. sklearn's finer search lands on k = 6.964, not exactly 7.0, because it scores rules by <em>squared</em> miss rather than plain miss, and searches all real numbers rather than a grid (section 03 explains both). The stump finds the same cut-off, 9.0, and answers new flats: a 6-year-old flat is predicted slow (0), an 18-year-old flat fast (1). <code>fit</code> was the search; <code>predict</code> applies the result.</p>
  <figure class="viz"><svg viewBox="0 0 620 160" width="620">
<defs><marker id="mi-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="10" y="18" font-weight="700">Rules-based program</text>
<rect x="10" y="32" width="80" height="30" rx="5" class="fs" stroke="currentColor"/><text x="50" y="52" text-anchor="middle">Rules</text>
<rect x="10" y="84" width="80" height="30" rx="5" class="fs" stroke="currentColor"/><text x="50" y="104" text-anchor="middle">Data</text>
<rect x="125" y="58" width="80" height="30" rx="5" class="fb sb"/><text x="165" y="78" text-anchor="middle">Program</text>
<rect x="225" y="58" width="75" height="30" rx="5" class="fg sg"/><text x="262" y="78" text-anchor="middle">Answers</text>
<line x1="90" y1="47" x2="123" y2="66" stroke="currentColor" marker-end="url(#mi-ah)"/><line x1="90" y1="99" x2="123" y2="80" stroke="currentColor" marker-end="url(#mi-ah)"/>
<line x1="205" y1="73" x2="223" y2="73" stroke="currentColor" marker-end="url(#mi-ah)"/>
<text x="10" y="145" class="tm">a person writes "price = 8 × area"</text>
<line x1="315" y1="10" x2="315" y2="150" stroke="currentColor" opacity="0.2"/>
<text x="330" y="18" font-weight="700">Machine learning</text>
<rect x="330" y="32" width="80" height="30" rx="5" class="fs" stroke="currentColor"/><text x="370" y="52" text-anchor="middle">Data</text>
<rect x="330" y="84" width="80" height="30" rx="5" class="fs" stroke="currentColor"/><text x="370" y="104" text-anchor="middle">Answers</text>
<rect x="440" y="58" width="70" height="30" rx="5" class="ft st"/><text x="475" y="78" text-anchor="middle">Train</text>
<rect x="535" y="58" width="75" height="30" rx="5" class="fv" stroke="currentColor"/><text x="572" y="78" text-anchor="middle">Model</text>
<line x1="410" y1="47" x2="438" y2="66" stroke="currentColor" marker-end="url(#mi-ah)"/><line x1="410" y1="99" x2="438" y2="80" stroke="currentColor" marker-end="url(#mi-ah)"/>
<line x1="510" y1="73" x2="533" y2="73" stroke="currentColor" marker-end="url(#mi-ah)"/>
<text x="330" y="145" class="tm">the ten sales pick "price = 7 × area"</text>
</svg><figcaption>Classic code turns rules + data into answers. Machine learning turns data + past answers into the rule (the model), which is then used like a program.</figcaption></figure>

  <h3>The formal definition</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Machine learning</strong> (Tom Mitchell, 1997): a program <em>learns</em> from experience E with respect to a task T and a performance measure P if its performance at T, measured by P, improves with E. For our flats: T = suggest a sale price, E = the ten past sales, P = average miss in ₹ lakh (it fell from 9.2 for the broker's rule to 3.1 for the learned rate). In symbols: find a function f so that f(x) ≈ y for new pairs (x, y) drawn from the same source as the examples.</p>
  </div>
  <p>Three things are always present, even in the largest models: a <strong>family of candidate rules</strong> (here: all rates k, or all age cut-offs t; in a neural network: all settings of millions of weights), a <strong>score</strong> for how wrong a candidate is on the examples (here: average miss, or number of mistakes), and a <strong>search method</strong> (here: try a grid; usually something smarter, like the formula of section 03 or the gradient descent of <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>).</p>

  <h3>When to use ML and when to write rules</h3>
  <table class="tbl">
    <tr><th>Use ML when…</th><th>Write rules when…</th></tr>
    <tr><td>The rule is unknown or too complex to write (spam, fraud, faces, speech, flat prices across a city)</td><td>A clear rule exists and is stable ("age &lt; 18 → reject", stamp-duty slabs)</td></tr>
    <tr><td>You have many past examples with the correct answer, or a way to get them</td><td>There is no data, or no way to tell a right answer from a wrong one</td></tr>
    <tr><td>The pattern drifts and the system must keep adapting (prices change every quarter, new fraud tricks)</td><td>Every decision must be exactly explainable or legally fixed</td></tr>
    <tr><td>Some mistakes are acceptable and cheaper than a human checking every case</td><td>A single mistake is unacceptable (safety interlocks)</td></tr>
  </table>
  <div class="callout pred"><span class="label">Example</span>
    <p>Spam filter. A rule "contains FREE → spam" breaks the day spammers write "FR33" and also blocks the HR email "free lunch on Friday". A model trained on 50,000 labelled emails weighs hundreds of weak signals (words, links, sender history) at once and is retrained as tricks change. Hand rules still sit alongside it for hard policy ("block this sender").</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"ML is always better than rules." It is not. If flat prices really were set by a fixed government rate, the learned rule could only match it, and would cost data, monitoring and explanation work. Also notice: learning picked the best rule <em>of the shape we allowed</em>. "price = k × area" cannot use locality or age, and cannot have a starting price for a tiny flat; no amount of searching over k fixes that. The choice of rule family (the model type) is your decision, and later groups of the track are mostly about which family to choose.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Key Vocabulary.</b> We used words like "feature", "label", "rule" and "the 7" loosely. Every later note uses them precisely, and interviewers check that you know the difference between a parameter (the 7) and a hyperparameter.</div>

  <h2 id="mi-vocab"><span class="num">02</span>Key Vocabulary</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 01 learned "price = 7 × area" and "sells fast if age ≥ 9". What exactly is the input, what is the answer, which number did training produce and which did we choose? Without precise names we cannot even describe a model, let alone compare two.</p>
  </div>
  <h3>Samples, features, labels</h3>
  <p>Look again at the ten-flat table. Each <strong>row</strong> is one thing you have seen: one past sale. Each <strong>column</strong> is one fact about it. One special column is the answer you want to predict next time.</p>
  <table class="tbl">
    <tr><th>Word (and synonyms)</th><th>Plain meaning</th><th>In our ten flats</th></tr>
    <tr><td><strong>Sample</strong> (row, example, instance, observation, record)</td><td>One case</td><td>One past sale, e.g. flat E</td></tr>
    <tr><td><strong>Feature</strong> (input, predictor, attribute, independent variable, column of X)</td><td>A fact known <em>before</em> the answer</td><td>Area, bedrooms, locality, age, month listed</td></tr>
    <tr><td><strong>Label</strong> (target, output, response, dependent variable, y)</td><td>The answer to predict</td><td>Price (a number), or "sold within 30 days?" (yes/no)</td></tr>
    <tr><td><strong>Dataset</strong></td><td>All rows together</td><td>The ten flats</td></tr>
    <tr><td><strong>Model</strong> (hypothesis, estimator in sklearn)</td><td>The learned rule f</td><td>"price = 6 × area + 10" (section 03)</td></tr>
    <tr><td><strong>Prediction</strong> (ŷ, "y-hat")</td><td>The model's answer for a row</td><td>₹67 lakh for a 950 sq ft flat</td></tr>
  </table>
  <h3>The feature matrix X and the label vector y</h3>
  <p>Libraries want the inputs as a table of numbers called <strong>X</strong> with shape <code>(n_samples, n_features)</code>: one row per sample, one column per feature. Capital X because it is a matrix (2-D). The answers go in <strong>y</strong>, lowercase because it is a vector (1-D), with shape <code>(n_samples,)</code>. Row i of X goes with entry i of y. With area as the only feature, our ten flats give X of shape 10 × 1 and y with 10 entries. Even a single feature must be 2-D, which is why the code writes <code>[[5], [6], …]</code> and not <code>[5, 6, …]</code>. Text columns like locality must first be turned into numbers (<a class="xref" data-note="ml_features">Feature Engineering</a>).</p>
  <h3>Parameters vs hyperparameters</h3>
  <p>This pair is the most-asked vocabulary question. Both are "settings" of a model; the difference is <strong>who sets them and when</strong>.</p>
  <table class="tbl">
    <tr><th></th><th>Parameter</th><th>Hyperparameter</th></tr>
    <tr><td>Set by</td><td>The training algorithm, from the data</td><td>You, before training starts</td></tr>
    <tr><td>Age stump (section 01)</td><td>The cut-off 9</td><td>"use only one question" (max_depth = 1)</td></tr>
    <tr><td>Price line</td><td>Slope w = 6, intercept b = 10</td><td>Whether to fit an intercept at all</td></tr>
    <tr><td>k-nearest neighbours</td><td>None in the usual sense: the stored rows are the model</td><td>k, the number of neighbours</td></tr>
    <tr><td>Neural network</td><td>Millions of weights</td><td>Layers, learning rate, epochs</td></tr>
    <tr><td>Chosen how</td><td><code>fit</code> minimises a loss on the training rows</td><td>Try several values, compare on <em>validation</em> data (<a class="xref" data-note="ml_splits">next note</a>)</td></tr>
    <tr><td>In sklearn</td><td>Attributes ending in <code>_</code> after fit: <code>coef_</code>, <code>intercept_</code>, <code>tree_</code></td><td>Constructor arguments: <code>KNeighborsRegressor(n_neighbors=2)</code>; read with <code>get_params()</code></td></tr>
  </table>
  <p>Check one prediction by hand before running code. kNN with k = 2 for a new 950 sq ft flat (x = 9.5): the two closest past flats are E (900 sq ft, ₹67 lakh) and F (1,000 sq ft, ₹68 lakh), both 0.5 away. Their average is (67 + 68) / 2 = ₹67.5 lakh.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor

X = np.array([[5], [6], [7], [8], [9], [10], [11], [12], [13], [14]])   # feature matrix: 10 samples x 1 feature (area)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])                  # label vector: one price per flat
print("X shape:", X.shape, " y shape:", y.shape)

lin = LinearRegression(fit_intercept=True)     # hyperparameter: chosen by YOU, before training
print("hyperparameters:", lin.get_params())
lin.fit(X, y)                                  # training learns the parameters
print("parameters learned:", "coef_ =", lin.coef_.round(6), " intercept_ =", round(lin.intercept_, 6))

knn = KNeighborsRegressor(n_neighbors=2)       # hyperparameter k = 2
knn.fit(X, y)                                  # "training" = remember the rows
print("kNN stored", knn.n_samples_fit_, "rows; 950 sq ft -&gt;", knn.predict([[9.5]]))</div>
  <div class="fx" data-lang="text">X shape: (10, 1)  y shape: (10,)
hyperparameters: {'copy_X': True, 'fit_intercept': True, 'n_jobs': None, 'positive': False, 'tol': 1e-06}
parameters learned: coef_ = [6.]  intercept_ = 10.0
kNN stored 10 rows; 950 sq ft -&gt; [67.5]</div>
  <p>Read the output top to bottom. X is 10 rows × 1 column, y has 10 entries. <code>get_params()</code> lists the hyperparameters, all of which existed before any data was seen. After <code>fit</code>, the learned parameters appear as <code>coef_ = 6</code> and <code>intercept_ = 10</code>: price = 6 × area + 10 (section 03 derives this by hand). The kNN model learned no numbers at all: it stored the 10 rows and answers 67.5, exactly the hand result.</p>
  <h3>Training and inference</h3>
  <p><strong>Training</strong> (fitting, learning) is the one-off, expensive step: search for the parameters using labelled rows. <strong>Inference</strong> (prediction, scoring, serving) is applying the fixed model to new rows, usually many times and fast. In production they often run on different machines and schedules: the portal retrains its price model weekly on all recent sales, then answers every new listing in milliseconds.</p>
  <h3>Parametric vs non-parametric</h3>
  <p>A <strong>parametric</strong> model has a fixed number of parameters no matter how much data you give it: our line has 2 (w and b), whether trained on 10 flats or 10 lakh. A <strong>non-parametric</strong> model grows with the data: kNN stores every flat, a decision tree can add more leaves. Parametric models are small and fast but assume a shape; non-parametric models assume less but need more data and memory.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Parameters</strong> θ are the numbers inside f that training estimates from data. <strong>Hyperparameters</strong> are the choices that define the family of f and the training procedure; they are fixed during a single fit and selected by comparing fits on held-out data. <strong>Training</strong> = computing θ from (X, y). <strong>Inference</strong> = computing ŷ = f(x; θ) for a new x.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tuning a hyperparameter on the training score. A kNN with k = 1 always scores perfectly on its own training rows (each flat's nearest neighbour is itself, so it "predicts" E at exactly 67), so the training score would always pick k = 1. Hyperparameters must be chosen on data the model did not fit.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How a Model Learns.</b> "Search for the rule with the lowest error" worked for five rates. A line has two parameters that can take any value, so we cannot try them all. We need a precise "how wrong" score (a loss) and a smarter search.</div>

  <h2 id="mi-learn"><span class="num">03</span>How a Model Learns</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can name the pieces: features X, label y, parameters w and b. But the price line has two parameters that can take any real value. A grid of five rates worked for one number; for two numbers there are infinitely many lines. How does training find the best one?</p>
  </div>
  <h3>Step 1: a score for "how wrong" (the loss)</h3>
  <p>Section 01 scored rules by the average miss. The usual "how wrong" score for numbers is the <strong>mean squared error</strong>: for each flat take the miss (actual − predicted), square it so misses in both directions count and big misses count more, then average. MSE = (1/n) Σ (yᵢ − ŷᵢ)². Score three candidate lines on the ten flats by hand:</p>
  <table class="tbl out"><caption>Three candidate lines, scored by hand on the ten flats</caption>
    <tr><th>Line</th><th>Misses y − ŷ for A … J</th><th>Squared misses</th><th>MSE</th></tr>
    <tr><td>A: 8 × area (broker)</td><td>−2, 1, −3, −8, −5, −12, −15, −13, −17, −16</td><td>4, 1, 9, 64, 25, 144, 225, 169, 289, 256</td><td>1186 / 10 = 118.6</td></tr>
    <tr><td>B: 7 × area (section 01)</td><td>3, 7, 4, 0, 4, −2, −4, −1, −4, −2</td><td>9, 49, 16, 0, 16, 4, 16, 1, 16, 4</td><td>131 / 10 = 13.1</td></tr>
    <tr><td>C: 6.5 × area + 5</td><td>0.5, 5, 2.5, −1, 3.5, −2, −3.5, 0, −2.5, 0</td><td>0.25, 25, 6.25, 1, 12.25, 4, 12.25, 0, 6.25, 0</td><td>67.25 / 10 = 6.725</td></tr>
  </table>
  <p>Allowing a starting price (an intercept) already helped: line C beats the best rate-only line. But is C the <em>best</em> line? There are infinitely many lines, so we cannot score them all.</p>
  <h3>Step 2: search smartly (least squares by hand)</h3>
  <p>For a straight line and squared error, calculus gives the best line directly (derived in <a class="xref" data-note="ml_regression">Linear Regression</a>): slope w = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)², intercept b = ȳ − w·x̄. In words: the slope is "how area and price move together" divided by "how much area moves on its own".</p>
  <table class="tbl out"><caption>Least squares by hand (x̄ = 95/10 = 9.5, ȳ = 670/10 = 67)</caption>
    <tr><th>Flat</th><th>x</th><th>y</th><th>x − x̄</th><th>y − ȳ</th><th>(x − x̄)(y − ȳ)</th><th>(x − x̄)²</th></tr>
    <tr><td>A</td><td>5</td><td>38</td><td>−4.5</td><td>−29</td><td>130.5</td><td>20.25</td></tr>
    <tr><td>B</td><td>6</td><td>49</td><td>−3.5</td><td>−18</td><td>63</td><td>12.25</td></tr>
    <tr><td>C</td><td>7</td><td>53</td><td>−2.5</td><td>−14</td><td>35</td><td>6.25</td></tr>
    <tr><td>D</td><td>8</td><td>56</td><td>−1.5</td><td>−11</td><td>16.5</td><td>2.25</td></tr>
    <tr><td>E</td><td>9</td><td>67</td><td>−0.5</td><td>0</td><td>0</td><td>0.25</td></tr>
    <tr><td>F</td><td>10</td><td>68</td><td>0.5</td><td>1</td><td>0.5</td><td>0.25</td></tr>
    <tr><td>G</td><td>11</td><td>73</td><td>1.5</td><td>6</td><td>9</td><td>2.25</td></tr>
    <tr><td>H</td><td>12</td><td>83</td><td>2.5</td><td>16</td><td>40</td><td>6.25</td></tr>
    <tr><td>I</td><td>13</td><td>87</td><td>3.5</td><td>20</td><td>70</td><td>12.25</td></tr>
    <tr><td>J</td><td>14</td><td>96</td><td>4.5</td><td>29</td><td>130.5</td><td>20.25</td></tr>
    <tr><td colspan="5"><strong>Sum</strong></td><td><strong>495</strong></td><td><strong>82.5</strong></td></tr>
  </table>
  <p>w = 495 / 82.5 = 6: each extra 100 sq ft adds ₹6 lakh. b = 67 − 6 × 9.5 = 10: a "starting price" of ₹10 lakh (land share, approvals). So the best line is <strong>price = 6 × area + 10</strong>. Its misses are −2, 3, 1, −2, 3, −2, −3, 1, −1, 2 (squares 4, 9, 1, 4, 9, 4, 9, 1, 1, 4, sum 46), so <strong>MSE = 4.6</strong>, and no other line has a lower MSE on these ten flats. For a 950 sq ft flat it suggests 6 × 9.5 + 10 = ₹67 lakh.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14])        # X: area, 100 sq ft
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])    # y: price, ₹ lakh

# three candidate lines, scored by mean squared error (MSE)
for name, b, w in [("A", 0, 8.0), ("B", 0, 7.0), ("C", 5, 6.5)]:
    pred = b + w * area
    print(f"line {name}: price = {b} + {w}*area   MSE = {np.mean((price - pred)**2):.3f}")

# least squares by formula
w = np.sum((area - area.mean()) * (price - price.mean())) / np.sum((area - area.mean())**2)
b = price.mean() - w * area.mean()
print("formula:  w =", w, " b =", b, "  MSE =", np.mean((price - (b + w * area))**2).round(3))

model = LinearRegression().fit(area.reshape(-1, 1), price)    # training
print("sklearn:  w =", model.coef_[0].round(6), " b =", model.intercept_.round(6))
print("950 sq ft -&gt;", model.predict([[9.5]]).round(1))        # inference</div>
  <div class="fx" data-lang="text">line A: price = 0 + 8.0*area   MSE = 118.600
line B: price = 0 + 7.0*area   MSE = 13.100
line C: price = 5 + 6.5*area   MSE = 6.725
formula:  w = 6.0  b = 10.0   MSE = 4.6
sklearn:  w = 6.0  b = 10.0
950 sq ft -&gt; [67.]</div>
  <p>The three hand MSEs, the formula and sklearn all agree: w = 6, b = 10, MSE 4.6, and ₹67 lakh at 950 sq ft. Most models have no neat formula, so they search with <strong>gradient descent</strong>: start somewhere, check which way the loss goes down, take a small step, repeat. That is the subject of <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>, which reaches the same 6 and 10 on the same flats step by step.</p>
  <h3>Step 3: the real goal is new data (generalisation)</h3>
  <p>A low loss on the ten recorded sales is not the point. The portal cares about the flat listed tomorrow. A rule that does well on rows it has never seen is said to <strong>generalise</strong>. A flexible enough model can drive the training loss to zero by memorising: a wiggly curve through all ten points exactly has MSE 0, beating our line's 4.6, and may still price the next flat badly because it has learned the ₹3 lakh "luck" of flat E as if it were a law. Measuring generalisation honestly is the job of <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>; understanding why models fail to generalise is <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>.</p>
  <div class="flow"><span>Choose a family of rules (model type)</span><span>Define a loss (how wrong)</span><span>Search for the lowest training loss (fit)</span><span>Check on unseen data (generalisation)</span></div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Every algorithm in this track is these four boxes with different choices. Linear regression: lines + squared loss + a formula. Logistic regression: S-curves + log-loss + gradient descent. Decision trees: boxes + impurity + greedy splitting. k-means: k centres + within-cluster distance + alternating updates. Once you see the boxes, a new algorithm is just new answers to four questions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Equating "the model fit the data well" with "the model is good". Fit is measured on the rows used for training, so it is always optimistic. MSE 4.6 on the ten flats is a training score. Quote a score only from rows the model never saw.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Types of Learning.</b> Every flat came with its price, so the learner always had the answer. Many real problems have no answers at all, only a few, or only a reward that arrives later. That gives the different types of learning.</div>

  <h2 id="mi-types"><span class="num">04</span>Types of Learning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sections 01–03 always had the answer for every flat: its sale price, whether it sold fast. What if the records have no answers at all, only a few of them, or only a reward that shows up after we act? Is that still learning, and which tools apply?</p>
  </div>
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
  <p>Every training row comes with the right answer. The model learns the mapping X → y. Both questions we asked of the ten flats were supervised.</p>
  <ul>
    <li><strong>Regression</strong>: y is a number on a scale. Flat price (₹67 lakh), delivery time, tomorrow's demand. Group 2 of the track.</li>
    <li><strong>Classification</strong>: y is one of a fixed set of classes. Sold within 30 days or not, spam or not, which of 10 digits. Two classes is <em>binary</em>; more is <em>multiclass</em>; several yes/no answers per row (a movie can be both "comedy" and "romance") is <em>multilabel</em>. Group 3 of the track.</li>
  </ul>
  <p>A quick test: could the answer be "halfway between" two answers? ₹67.5 lakh makes sense (regression); "halfway between sold fast and sold slowly" does not (classification). Note that classifiers usually output a <em>probability</em> (0.83 chance the flat sells fast) and a cut-off turns it into a class, covered in <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</p>

  <h3>Unsupervised learning: structure without answers</h3>
  <p>Only X, no y. The model looks for structure: groups of similar rows (<strong>clustering</strong>), a smaller set of columns that keeps most of the information (<strong>dimensionality reduction</strong>), or rows that do not fit the usual pattern (<strong>anomaly detection</strong>).</p>
  <p>By hand on our flats: forget the "sold fast" column and ask only "which flats are alike?" using (area, price). Splitting them into two groups, small-and-affordable {A, B, C, D} and larger {E, F, G, H, I, J}, the centre of each group is the average of its members: group 1 = ((5+6+7+8)/4, (38+49+53+56)/4) = (6.5, 49), group 2 = ((9+10+11+12+13+14)/6, (67+68+73+83+87+96)/6) = (11.5, 79). The portal can now name them, say "starter homes" and "family homes", and show each group different listings. Nobody told the algorithm these names; there was no answer column.</p>
  <p>The code below runs k-means (the standard clustering algorithm, <a class="xref" data-note="ml_kmeans">K-Means</a>) on the ten flats, then shows semi-supervised learning at scale on handwritten digits, explained after the output.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.semi_supervised import SelfTrainingClassifier
from sklearn.model_selection import train_test_split

# Unsupervised: the 10 flats as (area in 100 sq ft, price in ₹ lakh). No labels used.
X = np.array([[5, 38], [6, 49], [7, 53], [8, 56], [9, 67],
              [10, 68], [11, 73], [12, 83], [13, 87], [14, 96]])
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
print("cluster of each flat A-J:", km.labels_)
print("cluster centres:\\n", km.cluster_centers_.round(2))

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
  <div class="fx" data-lang="text">cluster of each flat A-J: [1 1 1 1 0 0 0 0 0 0]
cluster centres:
 [[11.5 79. ]
 [ 6.5 49. ]]
labelled rows: 50 of 1347
supervised, 50 labels only   test acc: 0.844
self-training, 50 + unlabelled test acc: 0.884
rows given a pseudo-label: 1279</div>
  <p>K-means put flats A–D in one cluster and E–J in the other, with the same centres we computed by hand, (6.5, 49) and (11.5, 79). The cluster numbers 0 and 1 are arbitrary names; there is no "right answer" to compare with, which is why judging clusters needs its own tools (<a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>).</p>

  <h3>Reinforcement learning (brief)</h3>
  <p>No labelled answers at all. An <strong>agent</strong> takes an <strong>action</strong> in an <strong>environment</strong>, receives a <strong>reward</strong>, and learns a <strong>policy</strong> (which action to take in which situation) that maximises total reward over time. The hard part is the <strong>explore-exploit</strong> dilemma: keep doing what has paid best so far, or try something else that might be better?</p>
  <table class="tbl out"><caption>By hand: the portal's agent trying two cover photos for flat listings, keeping the running average reward (page views per day) of each</caption>
    <tr><th>Day</th><th>Why this action</th><th>Photo</th><th>Views (reward)</th><th>Average for "room"</th><th>Average for "balcony"</th></tr>
    <tr><td>1</td><td>explore</td><td>room</td><td>500</td><td>500</td><td>–</td></tr>
    <tr><td>2</td><td>explore</td><td>balcony</td><td>450</td><td>500</td><td>450</td></tr>
    <tr><td>3</td><td>exploit (500 &gt; 450)</td><td>room</td><td>560</td><td>(500+560)/2 = 530</td><td>450</td></tr>
    <tr><td>4</td><td>explore again</td><td>balcony</td><td>630</td><td>530</td><td>(450+630)/2 = 540</td></tr>
    <tr><td>5</td><td>exploit (540 &gt; 530)</td><td>balcony</td><td>600</td><td>530</td><td>(450+630+600)/3 = 560</td></tr>
  </table>
  <p>Had the agent never explored again after day 3, it would have stuck with the room photo forever on the evidence of one unlucky day. Full RL adds states (the best photo may depend on whether the flat is a starter or family home) and delayed rewards (a move in chess pays off 30 moves later). It powers game-playing agents, robotics, ad bidding, and RLHF, the step that tunes large language models from human preferences. It is outside this track's scope.</p>
  <figure class="viz"><svg viewBox="0 0 420 120" width="420">
<defs><marker id="mi-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="40" width="100" height="40" rx="6" class="fb sb"/><text x="70" y="65" text-anchor="middle">Agent</text>
<rect x="300" y="40" width="110" height="40" rx="6" class="ft st"/><text x="355" y="65" text-anchor="middle">Environment</text>
<path d="M120 50 C 180 15, 240 15, 298 50" fill="none" stroke="currentColor" marker-end="url(#mi-ah2)"/><text x="210" y="22" text-anchor="middle">action (pick photo)</text>
<path d="M300 72 C 240 108, 180 108, 122 72" fill="none" stroke="currentColor" marker-end="url(#mi-ah2)"/><text x="210" y="114" text-anchor="middle" class="tg">reward (views) + new state</text>
</svg><figcaption>The reinforcement learning loop: no answer key, only rewards for the actions actually taken.</figcaption></figure>

  <h3>Semi-supervised learning</h3>
  <p>Labels cost money: a doctor must read each scan, a lawyer each contract. Often you have a few labelled rows and a mountain of unlabelled ones. <strong>Semi-supervised</strong> methods use both. The simplest is <strong>self-training</strong>: train on the labelled rows, predict the unlabelled ones, add the predictions the model is very sure about (probability above a threshold) as if they were labels ("pseudo-labels"), retrain, repeat.</p>
  <p>In the code above, the handwritten-digits data has 1,347 training images but we kept only 50 labels. A logistic regression trained on the 50 scores 0.844 on the test images. Self-training with a 0.7 confidence threshold pseudo-labelled 1,279 of the unlabelled images and reached 0.884: four points gained from data nobody labelled.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Self-training can also confirm its own mistakes: a confident wrong pseudo-label becomes training data and pulls the model further the wrong way. Always compare against the labelled-only model on a labelled test set, as done here.</p>
  </div>

  <h3>Self-supervised learning</h3>
  <p>The labels are made from the data itself, so no human labels anything. Take a listing description, "spacious 2BHK flat near the metro". Hide a word and ask the model to fill it in: input "spacious ___ flat near the metro", answer "2BHK" (BERT-style masked word). Or cut it and ask for the next word: input "spacious 2BHK flat near the", answer "metro" (GPT-style). One sentence gives several training pairs for free; the internet gives billions. Images work the same way: two random crops of one photo should get similar codes (contrastive learning). The model learned this way is then <em>fine-tuned</em> with a small labelled set. This is why large language models became possible (see <a class="xref" data-note="nlp">NLP</a> and <a class="xref" data-note="dl_attention">Attention</a>).</p>

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
  <div class="bridge"><b>What this still can't tell us → next: The ML Workflow.</b> We have the ideas but not the job. Fitting the model is maybe a tenth of a real project. What happens before and after <code>fit</code>?</div>

  <h2 id="mi-flow"><span class="num">05</span>The ML Workflow End to End</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know what a model is, how it learns and which type of learning fits which data. But fitting "price = 6 × area + 10" took one line of code. What does the portal have to do before that line (which question, which data?) and after it (how to ship it, and how to notice when it goes stale)?</p>
  </div>
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
  <p>Before any data, answer in writing: <strong>what decision</strong> will the model change, <strong>what exactly</strong> is predicted (the target definition), <strong>for which unit</strong> (flat, customer, order, day), <strong>how far ahead</strong> (horizon), <strong>what counts as success</strong> in money or time, and <strong>what a mistake of each kind costs</strong>. Many projects fail here: the model is accurate but predicts something nobody can act on.</p>
  <p>Worked example. Our portal earns a commission only when a listed flat sells. Some listings are overpriced and go stale. Framing: "Every Monday, for each active listing, predict the probability p that it will <em>not</em> sell in the next 60 days; a pricing advisor calls the sellers above a cut-off." Suppose a call costs ₹200 of advisor time, convinces the seller to re-price half the time, and a sale that would otherwise not happen earns ₹3,000 commission. For a listing with probability p:</p>
  <p style="text-align:center">expected gain of calling = p × 0.5 × 3000 − 200 = 1500·p − 200</p>
  <p>It pays to call when 1500·p − 200 &gt; 0, that is p &gt; 200 / 1500 = 0.133. So the model does not need to be sure; a 20% risk of a stale listing is already worth a call. This number will set the decision threshold later (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>) and tells you that <em>probabilities</em>, not just yes/no answers, are needed.</p>
  <h3>2. Data collection and exploratory analysis (EDA)</h3>
  <p>Gather the rows, then look before modelling: how many rows and columns, missing values, impossible values (age −3), duplicates, how rare the positive class is, how values change over time, and whether the data you will have <em>at prediction time</em> matches the training columns. A feature that is filled in only after the outcome (say "final negotiated price" or "days on market" when predicting whether a flat sells) must not be used: that is leakage (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  <h3>3. Features</h3>
  <p>Turn raw data into model inputs: scale numbers, encode categories, fill gaps, build ratios and counts ("price per sq ft", "enquiries in the last 7 days"); turn locality into numbers. Good features usually help more than a fancier algorithm. See <a class="xref" data-note="ml_features">Feature Engineering</a>.</p>
  <h3>4. Split, baseline, train and tune</h3>
  <p>Lock away a test set first (<a class="xref" data-note="ml_splits">next note</a>). Build a <strong>baseline</strong>: the simplest possible predictor, such as "always predict the most common class" or "always predict the average". Then try real models in order of complexity (linear/logistic, then trees and boosting), compare them with cross-validation, and tune hyperparameters on validation folds.</p>
  <div class="callout pred"><span class="label">Example</span>
    <p>Baseline in numbers, on our flats. "Always predict the average price, ₹67 lakh" has MSE = mean of (y − 67)² = 301.6 on the ten flats; the line's 4.6 is 65 times smaller, so the line has clearly learned something. For a yes/no target the baseline is "always predict the common answer": if 95 of 100 listings sell, "always says sells" is 95% accurate, and a model with 94% is worse than doing nothing. You only know that if you computed the baseline.</p>
  </div>
  <h3>5. Evaluate</h3>
  <p>Score the chosen model once on the locked test set, with metrics that match the costs from step 1 (recall if misses are expensive, precision if false alarms are). See <a class="xref" data-note="ml_evaluation">Classification Metrics</a> and <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>. Also check slices: is it equally good for each locality, for new and old flats?</p>
  <h3>6. Deploy</h3>
  <p>Put the model where decisions happen. <strong>Batch</strong>: score all active listings every night and write results to a table (the advisor's call list). <strong>Online</strong>: an API answers each request in milliseconds (suggested price the moment a seller types in the area). <strong>Edge</strong>: the model runs on the phone (keyboard suggestions). Save the full pipeline (preprocessing + model) as one versioned file so training and serving compute features identically, and roll out carefully: shadow mode (predict but do not act), then a small share of traffic, ideally as an A/B test (<a class="xref" data-note="st_abtesting">A/B Testing</a>).</p>
  <h3>7. Monitor</h3>
  <p>The world changes after launch. Our price model was trained on last year's sales. This year a new metro line opens near Hadapsar: the same 800 sq ft flat now sells for more, and builders start listing bigger flats. Three kinds of change, using P(·) to mean "how something is spread out":</p>
  <table class="tbl">
    <tr><th>Shift</th><th>What changes</th><th>Plain words</th><th>Example</th><th>How you notice</th></tr>
    <tr><td><strong>Covariate (data) drift</strong></td><td>P(X)</td><td>Different inputs, same rule</td><td>More large flats being listed</td><td>Input statistics (PSI)</td></tr>
    <tr><td><strong>Label (prior) shift</strong></td><td>P(y)</td><td>An answer becomes more or less common</td><td>Share of flats that sell fast drops in a slow market</td><td>Prediction averages, late labels</td></tr>
    <tr><td><strong>Concept drift</strong></td><td>P(y | X)</td><td>Same inputs now mean a different answer</td><td>Metro line: same area, higher price</td><td>Only fresh labels show it</td></tr>
  </table>
  <p>The <strong>Population Stability Index</strong> (PSI) is the standard one-number check for input drift. Cut a feature into bins using the training data, record each bin's share at training time (e) and now (a), and add up (a − e) × ln(a / e). Both factors have the same sign, so every term is ≥ 0, and bins that changed a lot dominate.</p>
  <table class="tbl out"><caption>PSI by hand for the "area" of newly listed flats, 4 bins</caption>
    <tr><th>Bin</th><th>Training share e</th><th>This week a</th><th>a − e</th><th>ln(a/e)</th><th>Term</th></tr>
    <tr><td>under 700 sq ft</td><td>0.40</td><td>0.25</td><td>−0.15</td><td>ln 0.625 = −0.470</td><td>0.0705</td></tr>
    <tr><td>700–1,000 sq ft</td><td>0.30</td><td>0.30</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>1,000–1,300 sq ft</td><td>0.20</td><td>0.25</td><td>0.05</td><td>ln 1.25 = 0.223</td><td>0.0112</td></tr>
    <tr><td>1,300+ sq ft</td><td>0.10</td><td>0.20</td><td>0.10</td><td>ln 2 = 0.693</td><td>0.0693</td></tr>
    <tr><td colspan="5"><strong>PSI</strong></td><td><strong>0.151</strong></td></tr>
  </table>
  <p>Common rule of thumb: PSI &lt; 0.1 stable, 0.1–0.25 moderate shift (investigate), &gt; 0.25 major shift (likely retrain). 0.151 says bigger flats are being listed than the model was trained on: investigate. The code checks both hand calculations from this section.</p>
  <div class="fx" data-lang="py">import numpy as np

# Problem framing: is it worth calling the seller of a listing with "won't sell" probability p?
call_cost, commission, success = 200, 3000, 0.5
for p in [0.05, 0.10, 0.20, 0.50]:
    gain = p * success * commission - call_cost
    print(f"p={p:.3f}  expected gain of calling = ₹{gain:7.1f}")
print("break-even p =", round(call_cost / (success * commission), 4))

# Monitoring: Population Stability Index of the "area" input
expected = np.array([0.40, 0.30, 0.20, 0.10])   # share of listings per area bin at training time
actual   = np.array([0.25, 0.30, 0.25, 0.20])   # share per bin this month
terms = (actual - expected) * np.log(actual / expected)
print("PSI terms:", terms.round(4), " PSI =", round(terms.sum(), 4))</div>
  <div class="fx" data-lang="text">p=0.050  expected gain of calling = ₹ -125.0
p=0.100  expected gain of calling = ₹  -50.0
p=0.200  expected gain of calling = ₹  100.0
p=0.500  expected gain of calling = ₹  550.0
break-even p = 0.1333
PSI terms: [0.0705 0.     0.0112 0.0693]  PSI = 0.151</div>
  <p>Calling about a listing with 5% or 10% risk loses money on average; a 20% risk listing gains ₹100. The break-even is 0.1333, as derived. The PSI terms match the table: 0.0705 + 0 + 0.0112 + 0.0693 = 0.151.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Concept drift is the dangerous one: inputs look normal, so PSI stays green while accuracy falls. You need real outcomes (even if they arrive weeks late) tracked over a rolling window, and an alert on that metric. Also, PSI with an empty bin divides by zero; libraries add a tiny number to every share.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Spending 90% of the effort on step 4. Real projects fail at the ends: a badly framed target (step 1), training data that does not look like live data (step 2), or a silent decline nobody watches (step 7). A simple model that is well framed and monitored beats a clever one that is not.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: A First Model, End to End.</b> Enough description. Let us run the loop for real: first on our ten flats, small enough to check by hand, then the same steps on a 569-row medical dataset.</div>

  <h2 id="mi-first"><span class="num">06</span>A First Model, End to End</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 05 described the workflow in words. What does "lock a test set, beat a baseline, test once" look like in actual code, and what do the numbers that come out mean?</p>
  </div>
  <h3>On the ten flats, small enough to check by hand</h3>
  <p>Lock two flats away as a pretend "next month", train on the other eight, and compare the line with the baseline "always predict the average training price".</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])

# 1. lock 2 of the 10 flats away as a test set
X_tr, X_te, y_tr, y_te = train_test_split(area, price, test_size=0.2, random_state=0)
print("test flats (area):", X_te.ravel(), " prices:", y_te)

# 2. baseline: always predict the average training price
base = DummyRegressor(strategy="mean").fit(X_tr, y_tr)
# 3. the real model: a straight line
line = LinearRegression().fit(X_tr, y_tr)
print("baseline predicts", base.predict(X_te[:1]).round(2), " line: price = %.3f x area + %.3f" % (line.coef_[0], line.intercept_))
# 4. test once
for name, m in [("baseline", base), ("line", line)]:
    print(f"{name:8s} test predictions {m.predict(X_te).round(2)}  MAE {mean_absolute_error(y_te, m.predict(X_te)):.2f}")</div>
  <div class="fx" data-lang="text">test flats (area): [ 7 13]  prices: [53 87]
baseline predicts [66.25]  line: price = 6.094 x area + 9.119
baseline test predictions [66.25 66.25]  MAE 17.00
line     test predictions [51.78 88.34]  MAE 1.28</div>
  <p>Check by hand. The test flats are C (700 sq ft, ₹53 lakh) and I (1,300 sq ft, ₹87 lakh). The other eight prices sum to 670 − 53 − 87 = 530, so the baseline always says 530 / 8 = ₹66.25 lakh and misses by 13.25 and 20.75: MAE (13.25 + 20.75) / 2 = 17.0. The line refitted on eight flats is price = 6.094 × area + 9.119 (close to the 6 and 10 from all ten); it predicts 51.78 for C and 88.34 for I, misses of 1.22 and 1.34, MAE 1.28. The line beats the baseline by a mile, and this time the score comes from flats it never saw. But it is a score from just <em>two</em> flats; a different pair could tell a different story, which is exactly where the next note starts.</p>
  <h3>The same steps at scale: 569 tumours</h3>
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
print("confusion matrix [[TN FP] [FN TP]]:\\n", confusion_matrix(y_test, pred))
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
  <div class="bridge"><b>What this still can't tell us → next: The Map of the ML Track.</b> You have seen one model family (a line, a logistic model, a forest) and one workflow. The track covers many model families and problem types. Where does each one fit, and in what order should you read them?</div>

  <h2 id="mi-track"><span class="num">07</span>The Map of the ML Track</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have built one line on ten flats and one classifier on 569 tumours. Which other families of models exist, which problem does each solve, and in what order should they be learned so that every note builds on the last?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have met a dozen ideas in this note: rule, search, features, parameters, loss, least squares, generalisation, learning types, workflow, baseline. How are they built from each other, and which one answers which question?</div>

  <h2 id="mi-connect"><span class="num">08</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Rule, search, feature, label, parameter, hyperparameter, loss, least squares, generalisation, learning type, workflow, baseline, drift: separate words to memorise, or one machine whose parts feed each other?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="mi-c9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="29" text-anchor="middle" font-size="11.5" font-weight="700">examples (X, y)</text><text x="85" y="46" text-anchor="middle" class="tm" font-size="10">10 flats: area → price</text>
<rect x="190" y="10" width="150" height="46" rx="7" class="fb sb"/><text x="265" y="29" text-anchor="middle" font-size="11.5" font-weight="700">family of rules</text><text x="265" y="46" text-anchor="middle" class="tm" font-size="10">k × area · w × area + b</text>
<rect x="370" y="10" width="140" height="46" rx="7" class="fb sb"/><text x="440" y="29" text-anchor="middle" font-size="11.5" font-weight="700">loss</text><text x="440" y="46" text-anchor="middle" class="tm" font-size="10">MSE 118.6 → 13.1 → 4.6</text>
<rect x="540" y="10" width="130" height="46" rx="7" class="fb sb"/><text x="605" y="29" text-anchor="middle" font-size="11.5" font-weight="700">search (fit)</text><text x="605" y="46" text-anchor="middle" class="tm" font-size="10">grid · least squares</text>
<line x1="160" y1="33" x2="188" y2="33" stroke="currentColor" marker-end="url(#mi-c9)"/><line x1="340" y1="33" x2="368" y2="33" stroke="currentColor" marker-end="url(#mi-c9)"/><line x1="510" y1="33" x2="538" y2="33" stroke="currentColor" marker-end="url(#mi-c9)"/>
<line x1="605" y1="56" x2="605" y2="88" stroke="currentColor" marker-end="url(#mi-c9)"/>
<rect x="520" y="90" width="150" height="46" rx="7" class="ft st"/><text x="595" y="109" text-anchor="middle" font-size="11.5" font-weight="700">parameters</text><text x="595" y="126" text-anchor="middle" class="tm" font-size="10">w = 6, b = 10 (coef_)</text>
<line x1="520" y1="113" x2="452" y2="113" stroke="currentColor" marker-end="url(#mi-c9)"/>
<rect x="300" y="90" width="150" height="46" rx="7" class="ft st"/><text x="375" y="109" text-anchor="middle" font-size="11.5" font-weight="700">inference (predict)</text><text x="375" y="126" text-anchor="middle" class="tm" font-size="10">950 sq ft → ₹67 lakh</text>
<line x1="300" y1="113" x2="232" y2="113" stroke="currentColor" marker-end="url(#mi-c9)"/>
<rect x="60" y="90" width="170" height="46" rx="7" class="fg sg"/><text x="145" y="109" text-anchor="middle" font-size="11.5" font-weight="700">generalisation check</text><text x="145" y="126" text-anchor="middle" class="tm" font-size="10">test MAE 1.28 vs baseline 17.0</text>
<rect x="190" y="166" width="150" height="46" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="265" y="185" text-anchor="middle" font-size="11.5" font-weight="700">hyperparameters</text><text x="265" y="202" text-anchor="middle" class="tm" font-size="10">family, intercept?, k = 2</text>
<line x1="265" y1="166" x2="265" y2="58" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#mi-c9)"/>
<path d="M145,136 Q150,190 188,190" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#mi-c9)"/><text x="80" y="170" class="tm" font-size="10">picked on held-out data</text>
<rect x="380" y="166" width="290" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="525" y="185" text-anchor="middle" font-size="11.5" font-weight="700">type of learning = what the data gives</text><text x="525" y="202" text-anchor="middle" class="tm" font-size="10">y given · no y (k-means {A–D},{E–J}) · rewards</text>
<rect x="10" y="240" width="660" height="80" rx="9" class="fr sr" fill-opacity="0.35"/>
<text x="340" y="262" text-anchor="middle" font-size="12" font-weight="700">the workflow wraps the whole machine</text>
<text x="340" y="283" text-anchor="middle" font-size="11">frame (call if p &gt; 0.133) → data/EDA → features → split → baseline (MSE 301.6) → fit → evaluate → deploy → monitor (PSI 0.151)</text>
<text x="340" y="305" text-anchor="middle" class="tm" font-size="10.5">drift sends you back to "frame" or "fit"</text>
</svg><figcaption>One machine. Examples and a family of rules go in; a loss scores each rule; a search keeps the best, which leaves parameters; the parameters make predictions; predictions on unseen rows are the only honest score, and that score chooses the hyperparameters. The workflow is the box around everything.</figcaption></figure>
  <table class="tbl"><caption>Every concept of the note, on the same ten flats</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our flats</th><th>When to use / watch</th></tr>
    <tr><td>Hand-written rule</td><td>a person's experience</td><td>what is the answer, without data?</td><td>8 × area: average miss 9.2 lakh</td><td>clear, stable policies; as a baseline to beat</td></tr>
    <tr><td>Learning as search</td><td>family + score + search</td><td>can the data choose the rule?</td><td>rate 7.0, miss 3.1; age cut-off 9, 0 mistakes</td><td>whenever examples with answers exist</td></tr>
    <tr><td>Features X, label y</td><td>the table's columns</td><td>what goes in, what comes out?</td><td>X 10 × 1 (area), y = price</td><td>features must be known at prediction time</td></tr>
    <tr><td>Parameters</td><td>fit on (X, y)</td><td>what did training produce?</td><td>w = 6, b = 10</td><td>read from <code>coef_</code>, <code>intercept_</code></td></tr>
    <tr><td>Hyperparameters</td><td>your choice before fit</td><td>which family / setting?</td><td>intercept yes/no; kNN k = 2 → 67.5</td><td>choose on held-out data, never on training score</td></tr>
    <tr><td>Loss (MSE)</td><td>squared misses, averaged</td><td>how wrong is a candidate?</td><td>118.6 / 13.1 / 6.725 / 4.6</td><td>punishes big misses; other losses in <a class="xref" data-note="ml_loss_gd">Loss &amp; GD</a></td></tr>
    <tr><td>Least squares</td><td>loss + calculus</td><td>which line is best?</td><td>495 / 82.5 = 6; 67 − 57 = 10</td><td>lines only; otherwise gradient descent</td></tr>
    <tr><td>Generalisation</td><td>loss on unseen rows</td><td>will it work on new flats?</td><td>test MAE 1.28 (2 flats)</td><td>the only score worth quoting</td></tr>
    <tr><td>Baseline</td><td>the simplest predictor</td><td>has the model learned anything?</td><td>mean price: MSE 301.6, test MAE 17.0</td><td>compute it first, every time</td></tr>
    <tr><td>Learning type</td><td>what the data provides</td><td>answers, no answers, rewards?</td><td>price, sold-fast, clusters (6.5, 49) / (11.5, 79)</td><td>decided by the data, not the algorithm</td></tr>
    <tr><td>Workflow</td><td>all of the above in order</td><td>what happens around <code>fit</code>?</td><td>call threshold 0.133; PSI 0.151</td><td>every real project; monitoring never stops</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>machine learning chooses, from a family of rules you allow, the one with the lowest loss on past examples, and is judged only by how it does on examples it has not seen.</strong> Everything else is vocabulary for the parts (features, parameters, hyperparameters), a faster search (least squares, gradient descent), or the work around it (the workflow).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> How does this machine differ from its neighbours: rules-based software, classical statistics, AI, deep learning? And how do the learning types line up side by side?</div>

  <h2 id="mi-compare"><span class="num">09</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know what ML is from the inside. From the outside, people mix it up with statistics, AI, deep learning and data science, and with each other's learning types. Where exactly are the borders?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Knowing the definitions is not the same as avoiding the traps. Which mistakes do beginners (and interview candidates) make with these ideas?</div>

  <h2 id="mi-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every idea in this note can be misused in a way that makes a useless model look good. Which misuses are most common, and what does each look like on our flats?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: scoring on the training rows</span>
    <p>A model evaluated on the rows it learned from looks better than it is; a kNN with k = 1 or a deep tree scores 100%, and a wiggly curve through our ten flats has MSE 0. Always quote held-out scores (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no baseline</span>
    <p>"95% accuracy" means nothing until you know the majority class is 95%; "MSE 4.6" means little until you know the mean-price baseline is 301.6. Compute the dummy score first, every time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: features that will not exist at prediction time</span>
    <p>Using "days on market" to predict whether a flat sells fast, "reason for leaving" to predict churn, or tomorrow's sales to predict today's. The model looks brilliant offline and fails live. Ask of every column: "will I know this at the moment I need the prediction?"</p>
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
    <p>Learning only finds the best rule <em>inside the family you allowed</em>. "price = k × area" can never use locality or age, and has no starting price. If the family is wrong, no amount of data fixes it; this is underfitting, the "bias" in <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>.</p>
  </div>

  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet, then <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>.</b> Every trap above has the same cure at its heart: judge the model on rows it did not learn from. But how many rows to hold back, which ones, and how to avoid fooling ourselves with a lucky split? That is the next note.</div>

  <h2 id="mi-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: ten flats sold in Pune, area x in hundreds of sq ft and price y in ₹ lakh: A (5, 38), B (6, 49), C (7, 53), D (8, 56), E (9, 67), F (10, 68), G (11, 73), H (12, 83), I (13, 87), J (14, 96). Ages 12, 3, 8, 15, 5, 10, 20, 2, 7, 4; sold within 30 days: A, D, F, G.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on our flats</th><th>Weakness → next</th></tr>
    <tr><td>Hand-written rule</td><td>how do we price a flat?</td><td>broker: 8 × area, miss 9.2 lakh</td><td>nobody checked the 8</td></tr>
    <tr><td>Learning = search</td><td>can the data choose the rule?</td><td>rate 7.0, miss 3.1; age ≥ 9 → fast, 0 mistakes</td><td>need precise words</td></tr>
    <tr><td>Vocabulary</td><td>what are the pieces called?</td><td>X 10 × 1, y price, w and b parameters, k hyperparameter</td><td>two parameters: can't try all</td></tr>
    <tr><td>Loss (MSE)</td><td>how wrong is a rule, as one number?</td><td>118.6, 13.1, 6.725</td><td>infinitely many lines</td></tr>
    <tr><td>Least squares</td><td>which line is best?</td><td>w = 6, b = 10, MSE 4.6</td><td>training score only</td></tr>
    <tr><td>Generalisation</td><td>what is the real goal?</td><td>do well on new flats</td><td>what if there are no answers?</td></tr>
    <tr><td>Learning types</td><td>answers, none, few, rewards?</td><td>price / sold-fast / clusters {A–D}, {E–J}</td><td>fit is a small part of a project</td></tr>
    <tr><td>Workflow</td><td>what happens around fit?</td><td>call if p &gt; 0.133; baseline MSE 301.6; PSI 0.151</td><td>only described</td></tr>
    <tr><td>First model</td><td>what does it look like in code?</td><td>test MAE 1.28 vs baseline 17.0; tumours 0.965</td><td>which families exist?</td></tr>
    <tr><td>Track map</td><td>what to learn next?</td><td>9 groups, Foundations first</td><td>is a score honest? → splits</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Machine learning</td><td>A program learns from experience E for task T and measure P if its performance on T, measured by P, improves with E (Mitchell). Practically: pick the rule with the lowest loss from a family you allow.</td></tr>
    <tr><td>Sample / feature / label</td><td>A row (one flat) / an input column known before the answer (area) / the answer to predict (price).</td></tr>
    <tr><td>X and y</td><td>X is the 2-D feature matrix, shape (n_samples, n_features); y is the 1-D label vector, shape (n_samples,).</td></tr>
    <tr><td>Parameter vs hyperparameter</td><td>Parameters are learned by fit (w = 6, b = 10, the cut-off 9). Hyperparameters are set by you before fit (k in kNN, max_depth, intercept on/off) and chosen on held-out data.</td></tr>
    <tr><td>Training vs inference</td><td>Training (fit) searches for the parameters using labelled rows; inference (predict) applies the fixed model to new rows.</td></tr>
    <tr><td>Parametric vs non-parametric</td><td>A fixed number of parameters (a line has 2) vs a model that grows with the data (kNN stores every row).</td></tr>
    <tr><td>Loss</td><td>One number for how wrong a rule is on the examples; training minimises it.</td></tr>
    <tr><td>Generalisation</td><td>Doing well on new rows from the same source; the only real goal.</td></tr>
    <tr><td>Supervised / unsupervised / reinforcement</td><td>Learn X → y from labelled pairs (regression for numbers, classification for classes) / find structure in X alone / learn a policy from rewards for actions.</td></tr>
    <tr><td>Semi- / self-supervised</td><td>Few labels plus many unlabelled rows (self-training: 0.844 → 0.884 on digits) / labels made from the data itself (masked or next word).</td></tr>
    <tr><td>Baseline</td><td>The simplest predictor (mean or majority class); every model must beat it.</td></tr>
    <tr><td>Covariate / label / concept drift</td><td>P(X) changes / P(y) changes / P(y | X) changes (same flat, new price after a metro line). Only real outcomes reveal concept drift.</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols and our numbers</th></tr>
    <tr><td>Average miss (MAE)</td><td>(1/n) Σ |yᵢ − ŷᵢ|</td><td>n rows, y actual, ŷ predicted; 7 × area → 31/10 = 3.1</td></tr>
    <tr><td>Mean squared error</td><td>MSE = (1/n) Σ (yᵢ − ŷᵢ)²</td><td>6 × area + 10 → 46/10 = 4.6</td></tr>
    <tr><td>Least-squares slope</td><td>w = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²</td><td>x̄ = 9.5, ȳ = 67: 495 / 82.5 = 6</td></tr>
    <tr><td>Least-squares intercept</td><td>b = ȳ − w·x̄</td><td>67 − 6 × 9.5 = 10</td></tr>
    <tr><td>kNN regression</td><td>ŷ = mean of the k nearest rows' y</td><td>950 sq ft, k = 2: (67 + 68)/2 = 67.5</td></tr>
    <tr><td>Expected gain of acting</td><td>p · s · V − c; act if p &gt; c / (s · V)</td><td>p probability, s success rate 0.5, V value ₹3,000, c cost ₹200 → 0.133</td></tr>
    <tr><td>PSI</td><td>Σ (aᵢ − eᵢ) · ln(aᵢ / eᵢ)</td><td>e training share, a current share per bin; 0.151 (&lt; 0.1 stable, 0.1–0.25 investigate, &gt; 0.25 major)</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use ML</b><p>The rule is unknown or too complex to write, there are many past examples with answers, the pattern drifts, and some mistakes are acceptable.</p><small>Flat prices across a city, spam, fraud</small></div>
    <div><b>Write rules</b><p>A clear, stable rule exists, there is no data or no measurable right answer, or every decision must be exactly explainable.</p><small>Stamp-duty slabs, age limits, interlocks</small></div>
    <div><b>Supervised vs unsupervised</b><p>If every row has the answer you want, use supervised learning; if not, unsupervised methods find groups and structure, semi-supervised uses the few labels you have.</p><small>Price vs "which flats are alike?"</small></div>
    <div><b>Regression vs classification</b><p>Decide by what a near miss means: ₹67.5 lakh is meaningful (regression); "halfway between sold and unsold" is not (classification).</p><small>Star ratings are usually regression</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Quoting a training score (MSE 4.6 is not a promise about new flats); no baseline; features that will not exist at prediction time (days on market); tuning hyperparameters on the training score (always picks k = 1); choosing the learning type from the data type (zip codes, ratings); stopping at deployment with no monitoring; forgetting that learning only searches inside the family you allowed.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Broker's rule 8 × area on flats C (7, 53) and G (11, 73): misses?</td><td>53 − 56 = −3 and 73 − 88 = −15</td></tr>
    <tr><td>Least squares with Σ(x − x̄)(y − ȳ) = 495, Σ(x − x̄)² = 82.5, x̄ = 9.5, ȳ = 67?</td><td>w = 6, b = 10</td></tr>
    <tr><td>Is the cut-off 9 in "sells fast if age ≥ 9" a parameter or a hyperparameter?</td><td>A parameter: fit chose it. max_depth = 1 is the hyperparameter.</td></tr>
    <tr><td>Clustering flats by (area, price) with no labels: which learning type?</td><td>Unsupervised</td></tr>
    <tr><td>Training shares (0.5, 0.5), now (0.3, 0.7): PSI and verdict?</td><td>0.102 + 0.067 = 0.169: moderate shift, investigate</td></tr>
  </table>

  <h2 id="mi-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one sentence, how is machine learning different from ordinary programming?</summary><div class="qa-body">In ordinary programming a person writes the rule and the computer applies it; in ML the person supplies examples with answers and a family of possible rules, and the computer searches for the rule with the lowest error, which is then applied like a program.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>State Mitchell's definition and apply it to the flat-price example.</summary><div class="qa-body">A program learns from experience E for task T and measure P if its performance at T, measured by P, improves with E. T = suggest a sale price, E = the ten past sales, P = average miss; it went from 9.2 lakh (broker's 8 × area) to 3.1 lakh (learned 7 × area).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are only midpoints between sorted ages tried as cut-offs in "sells fast if age ≥ t"?</summary><div class="qa-body">Any cut-off between two neighbouring ages (say between 8 and 10) splits the flats the same way, so it makes the same mistakes. One value per gap (the midpoint) plus one below and one above all values covers every distinct rule. Decision trees use exactly this trick for numeric features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Parameter vs hyperparameter: define both and give two examples of each.</summary><div class="qa-body">Parameters are learned by fit from the data: linear-regression coefficients, tree split thresholds. Hyperparameters are set before fit and define the model family or training: k in kNN, max_depth of a tree, regularisation strength alpha, learning rate. Parameters minimise training loss; hyperparameters are chosen on validation data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the least-squares line for the ten flats (x = 5 … 14, y = 38, 49, 53, 56, 67, 68, 73, 83, 87, 96).</summary><div class="qa-body">x̄ = 9.5, ȳ = 67. Σ(x−x̄)(y−ȳ) = 130.5 + 63 + 35 + 16.5 + 0 + 0.5 + 9 + 40 + 70 + 130.5 = 495; Σ(x−x̄)² = 82.5. w = 6, b = 67 − 57 = 10. Misses −2, 3, 1, −2, 3, −2, −3, 1, −1, 2 give MSE 46/10 = 4.6.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Classify each as regression, binary, multiclass or multilabel: house price; fraud yes/no; digit 0–9; tags on a news article.</summary><div class="qa-body">Regression; binary classification; multiclass classification; multilabel classification (an article can have several tags at once).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Supervised vs unsupervised vs semi-supervised vs self-supervised vs reinforcement?</summary><div class="qa-body">Supervised: labelled pairs, learn X → y. Unsupervised: X only, find structure. Semi-supervised: few labels plus many unlabelled rows (self-training gave 0.844 → 0.884 on digits with 50 labels). Self-supervised: labels built from the data itself (next or masked word). Reinforcement: an agent learns a policy from rewards of its own actions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the stages of an ML project. Where do projects most often fail?</summary><div class="qa-body">Frame → data/EDA → features → split, baseline, train/tune → evaluate → deploy → monitor, looping back. Most failures are at the ends: a target nobody can act on or that leaks the answer, training data unlike live data, and no monitoring after launch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A call to a seller costs ₹200, gets the flat re-priced half the time, and a rescued sale earns ₹3,000. Above which "won't sell" probability should the portal call?</summary><div class="qa-body">Expected gain = p × 0.5 × 3000 − 200 = 1500p − 200 &gt; 0 → p &gt; 0.133. This links framing to the decision threshold in <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>, and is why calibrated probabilities matter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Covariate shift, label shift, concept drift: define each and say which input monitoring cannot catch.</summary><div class="qa-body">Covariate: P(X) changes, rule same. Label: P(y) changes. Concept: P(y|X) changes, the same inputs mean a different answer. Concept drift can leave inputs unchanged, so only tracking real outcomes catches it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute PSI for training shares (0.5, 0.5) and current shares (0.3, 0.7). Is it a problem?</summary><div class="qa-body">(0.3−0.5)·ln(0.6) = (−0.2)(−0.511) = 0.102; (0.7−0.5)·ln(1.4) = (0.2)(0.336) = 0.067. PSI = 0.169: moderate shift, investigate (between 0.1 and 0.25).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The majority-class baseline scored 0.626 accuracy and recall 0 on the tumour data. What does that tell you?</summary><div class="qa-body">Any model must beat 0.626 accuracy to be useful at all, and accuracy alone hides that the baseline finds no cancers. It is why the note tracks recall and why <a class="xref" data-note="ml_evaluation">Classification Metrics</a> covers more than accuracy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why was the model chosen on cross-validation and not on the test set? (connection: next note)</summary><div class="qa-body">The test set must stand in for unseen future data. Any choice made by looking at it makes its score optimistic. CV on the training part compares candidates; the test set is touched once at the end. <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a> shows how big the optimism can get.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did the logistic model need a StandardScaler but the random forest did not? (connection: features)</summary><div class="qa-body">Logistic regression adds up weight × value and penalises large weights; with columns on wildly different scales (area ~650 vs smoothness ~0.1) the penalty treats them unequally and the solver converges slowly. Trees only ask "is this column ≤ t?", which does not change if a column is rescaled. More in <a class="xref" data-note="ml_features">Feature Engineering</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four ingredients common to every learning algorithm? Name them for k-means.</summary><div class="qa-body">A family of candidate rules, a loss, a search method, and an honest check on unseen data. k-means: k centres; total squared distance of points to their centre; alternate assign-points / move-centres; and (with no labels) internal cluster scores and business checks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does learning need a loss function at all? What breaks without one?</summary><div class="qa-body">The search in section 01 had to compare candidate rules; without a single number for "how wrong" there is no way to say 7.0 beats 8.0, and nothing for least squares or gradient descent to minimise. The loss also decides <em>which</em> mistakes matter: average miss picked 7.0 on the grid, squared miss picked 6.964, because squaring punishes the big misses on large flats more.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is the least-squares formula related to the grid search over rates?</summary><div class="qa-body">Both minimise a loss over a family of rules. The grid tried five values of one number and kept the best; least squares sets the derivative of MSE to zero and solves for both numbers exactly (w = 6, b = 10), so it finds the true minimum over infinitely many lines. Gradient descent (<a class="xref" data-note="ml_loss_gd">next notes</a>) is the general version when no formula exists.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do parameters come from training rows but hyperparameters need held-out rows?</summary><div class="qa-body">Parameters are chosen to minimise the training loss, which is exactly what fit does. A hyperparameter changes how flexible the family is; judged on the training rows, the most flexible choice always wins (k = 1 in kNN reproduces every flat exactly). Only rows the model did not see can reveal that the flexible choice generalises worse, which is why the next note (<a class="xref" data-note="ml_splits">Train/Val/Test</a>) exists.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the baseline?</summary><div class="qa-body">You cannot tell whether a score means anything. MSE 4.6 sounds abstract until you see the mean-price baseline at 301.6; a 94% accurate classifier is worse than useless if "always yes" scores 95%. The baseline also catches bugs: a model that does not beat it has learned nothing or has a pipeline error.</div></details>
</main>
`
});
