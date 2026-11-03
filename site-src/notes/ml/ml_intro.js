// notes/ml/ml_intro.js — What is Machine Learning
Object.assign(TOPIC_CONTENT, {
  "ml_intro": `<main>
  <h1>What is Machine Learning</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>What is Machine Learning</span></div>
  <p class="lead">Machine learning, or ML, is a way of building software in which you do not write the rule yourself. Instead you show the computer many past examples together with the right answers, and it searches for the rule that makes the fewest mistakes on them. This matters because many rules that businesses need, such as "what will this flat sell for" or "is this email spam", are too messy for any person to write down, yet the past records contain the answer. To see what "learning" means in practice we will follow one small, concrete problem through the whole page: a property portal in Pune that has records of <strong>ten flats</strong> it sold, and wants software that suggests a price for the next flat. We start with a rule a person writes, let the data choose a better one, and then build up the vocabulary, the kinds of learning, and the steps of a real project, all on the same ten flats. The same flats come back in every Foundations note of this track, so the numbers will stay familiar.</p>

  <h2 id="mi-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">What is Machine Learning</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>Ordinary code: a person writes the rule</li>
          <li>ML: examples + answers go in, the rule comes out</li>
          <li>Learning = search: try rules, score each, keep the best</li>
          <li>Ten flats: broker's 8 × area misses by 9.2; learned 7 × area by 3.1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Vocabulary</div>
        <ul>
          <li><b>Sample</b> = row, <b>feature</b> = input column (X), <b>label</b> = answer (y)</li>
          <li><b>Parameters</b> are learned (w = 6, b = 10); <b>hyperparameters</b> are chosen by you (k in kNN)</li>
          <li><b>Training</b> = <code>fit</code>; <b>inference</b> = <code>predict</code></li>
          <li><b>Loss</b> (MSE) scores how wrong a rule is</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Kinds of learning</div>
        <ul>
          <li><b>Supervised</b>: answers given; regression (number) or classification (class)</li>
          <li><b>Unsupervised</b>: no answers; clustering, fewer columns, anomalies</li>
          <li><b>Reinforcement</b>: actions and rewards</li>
          <li><b>Semi-</b> and <b>self-supervised</b>: few labels, or labels made from the data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">A real project</div>
        <ul>
          <li>Frame → data → features → split → baseline → train → evaluate → deploy → monitor</li>
          <li>Always beat a <b>baseline</b> first</li>
          <li>Judge only on rows the model never saw (generalisation)</li>
          <li>Watch for <b>drift</b> after launch (PSI)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mi-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Rules vs Learning</span><span class="rm-sub">a rule a person writes, and a rule the data picks</span></div></div>
      <div class="rm-item rm-done" data-target="mi-vocab"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Samples, Features and Labels</span><span class="rm-sub">the words for rows, inputs and answers</span></div></div>
      <div class="rm-item rm-done" data-target="mi-params"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Parameters and Hyperparameters</span><span class="rm-sub">what training learns vs what you choose</span></div></div>
      <div class="rm-item rm-done" data-target="mi-learn"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">How a Model Learns</span><span class="rm-sub">loss, a smarter search, and generalisation</span></div></div>
      <div class="rm-item rm-done" data-target="mi-types"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Supervised and Unsupervised Learning</span><span class="rm-sub">learning with answers and without them</span></div></div>
      <div class="rm-item rm-done" data-target="mi-other"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Reinforcement, Semi- and Self-Supervised Learning</span><span class="rm-sub">rewards, few labels, labels made from data</span></div></div>
      <div class="rm-item rm-done" data-target="mi-flow"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The ML Workflow</span><span class="rm-sub">everything that happens around fit</span></div></div>
      <div class="rm-item rm-done" data-target="mi-drift"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Monitoring and Drift</span><span class="rm-sub">when the world changes after launch</span></div></div>
      <div class="rm-item rm-done" data-target="mi-first"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">A First Model, End to End</span><span class="rm-sub">ten flats, then 569 tumours</span></div></div>
      <div class="rm-item rm-done" data-target="mi-track"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Where ML Fits</span><span class="rm-sub">AI, statistics, deep learning, and this track</span></div></div>
      <div class="rm-item rm-done" data-target="mi-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">training scores, no baseline, future features</span></div></div>
      <div class="rm-item rm-done" data-target="mi-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, tables</span></div></div>
      <div class="rm-item rm-done" data-target="mi-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on ML basics</span></div></div>
    </div>
  </div>

  <h2 id="mi-what"><span class="num">01</span>Rules vs Learning</h2>
  <p>When a seller lists a flat on the portal, the portal must suggest an asking price. If the suggestion is too high the flat sits unsold for months; if it is too low the seller loses lakhs of rupees. The portal has records of past sales, and here are ten of them. Area is written in hundreds of square feet, so 5 means 500 sq ft, and price is in lakh rupees (one lakh is 100,000).</p>
  <table class="tbl"><caption>The running example: ten flats sold in Pune</caption>
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
  <p>Bigger flats clearly cost more, but not exactly in proportion: flat E sold for a bit more than its size suggests and flat G for a bit less. Real data always has some variation that one column cannot explain. There are two very different ways to build the "suggest a price" feature, and comparing them is the quickest way to understand what machine learning is.</p>
  <p>The traditional way is for a person to write the rule. A senior broker says, from experience, "flats go for about ₹8 lakh per 100 sq ft", so the program computes price = 8 × area. That is ordinary programming: the knowledge comes from a human head and is typed in. Nobody checked the 8 against the records, though. If we apply it to the ten past sales, it says 40 for flat A (actual 38), 88 for flat G (actual 73), 104 for flat I (actual 87). Ignoring the sign, the ten misses add up to 92, so the rule is off by 92 / 10 = 9.2 lakh on average, and almost always too high. The broker's number probably came from a few expensive flats he remembers well.</p>
  <p>The machine learning way keeps the same <em>shape</em> of rule, "price = k × area", but lets the past sales choose the number k. The computer simply tries several values of k, measures how far each one is from the real prices on the ten flats, and keeps the one that misses least. Nobody types in the answer; the data picks it.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

#                  A   B   C   D   E   F   G   H   I   J
area  = np.array([ 5,  6,  7,  8,  9, 10, 11, 12, 13, 14])   # x: area in 100 sq ft
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])   # y: sale price, ₹ lakh

# A person writes the rule
print("broker rule 8 x area, average miss:", np.abs(price - 8.0 * area).mean())

# The computer searches: try each candidate rate, keep the one with the smallest average miss
rates = [6.0, 6.5, 7.0, 7.5, 8.0]
for k in rates:
    print(f"rate {k:.1f} -&gt; average miss {np.abs(price - k * area).mean():5.2f}")
best = min(rates, key=lambda k: np.abs(price - k * area).mean())
print("learned rule: price =", best, "x area;  a 950 sq ft flat -&gt;", best * 9.5)

# A library doing a finer search of the same family (no intercept: price = k x area)
lib = LinearRegression(fit_intercept=False).fit(area.reshape(-1, 1), price)
print("sklearn's best rate:", lib.coef_.round(3))</div>
  <div class="fx" data-lang="text">broker rule 8 x area, average miss: 9.2
rate 6.0 -&gt; average miss 10.00
rate 6.5 -&gt; average miss  5.25
rate 7.0 -&gt; average miss  3.10
rate 7.5 -&gt; average miss  5.25
rate 8.0 -&gt; average miss  9.20
learned rule: price = 7.0 x area;  a 950 sq ft flat -&gt; 66.5
sklearn's best rate: [6.964]</div>
  <p>The broker's 8 misses by 9.2 lakh on average. Among the five candidates, k = 7.0 misses by only 3.1, three times better, so the learned rule is price = 7 × area, and for a new 950 sq ft flat it suggests ₹66.5 lakh. The last line shows a library doing the same search more finely: scikit-learn's <code>LinearRegression</code>, told not to add a starting price, tries every real number rather than five and lands on 6.964. (It is slightly different from 7.0 because it measures misses by their squares rather than their plain size; section 04 explains why.) That table of five tries <em>is</em> machine learning in its simplest form: choose a family of possible rules, score each one on past examples, keep the best.</p>
  <p>Think of a new estate agent. On her first day her boss tells her "ask ₹8 lakh per 100 sq ft". After a year she has a notebook of what every flat she handled actually sold for, and she notices that ₹7 lakh is much closer. She did not get the better rule from a book or a senior; she got it from her notebook. In ML terms the notebook is the training data and her improved habit is the <strong>model</strong>, the rule produced by learning.</p>
  <p>The same idea works for yes/no questions. The portal also wants to warn sellers whose flats will be slow to sell, and the last column of the table says whether each flat sold within 30 days. The branch manager's rule is "flats 15 years or older sell fast, because they are cheap per square foot". That marks D and G as fast, but A (12 years) and F (10 years) also sold fast, so the rule makes 2 mistakes. To let the data decide, use the rule "sells fast if age ≥ t" and try different cut-offs t. Any t between two neighbouring ages makes exactly the same decisions, so it is enough to try one value in each gap between the sorted ages:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier

age  = np.array([12, 3, 8, 15, 5, 10, 20, 2, 7, 4])     # flats A..J, years old
sold = np.array([ 1, 0, 0,  1, 0,  1,  1, 0, 0, 0])     # 1 = sold within 30 days

print("manager's rule 'age &gt;= 15', mistakes:", int(((age &gt;= 15) != sold).sum()))
s = np.sort(age)
cuts = np.r_[s[0] - 1, (s[:-1] + s[1:]) / 2, s[-1] + 1]  # one cut-off per gap between ages
print("cut-offs:", cuts)
print("mistakes:", [int(((age &gt;= t) != sold).sum()) for t in cuts])

stump = DecisionTreeClassifier(max_depth=1).fit(age.reshape(-1, 1), sold)
print("sklearn's cut-off:", stump.tree_.threshold[0], "  flats aged 6 and 18 -&gt;", stump.predict([[6], [18]]))</div>
  <div class="fx" data-lang="text">manager's rule 'age &gt;= 15', mistakes: 2
cut-offs: [ 1.   2.5  3.5  4.5  6.   7.5  9.  11.  13.5 17.5 21. ]
mistakes: [6, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4]
sklearn's cut-off: 9.0   flats aged 6 and 18 -&gt; [0 1]</div>
  <p>The cut-off 9 makes no mistakes at all on these ten flats, while the manager's 15 made two. The last line uses a <strong>decision stump</strong>, a decision tree allowed to ask only one question, and it finds the same cut-off by itself; for new flats aged 6 and 18 it predicts "slow" (0) and "fast" (1). Notice the pair of words: <code>fit</code> was the search, and <code>predict</code> applies what the search found to new flats. Whether "age ≥ 9 means fast" also holds for <em>next month's</em> flats is a separate question, and it turns out to be the most important question in the whole subject.</p>
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
  <p>The figure summarises the difference. In ordinary programming, rules and data go into a program and answers come out. In machine learning, data and the known answers go into training, and a <em>rule</em> comes out, which is then used just like a program. A widely quoted definition by Tom Mitchell says the same thing more formally: a program <strong>learns</strong> from experience E with respect to a task T and a performance measure P if its performance at T, measured by P, improves with E. For our portal, the task T is "suggest a sale price", the experience E is the ten past sales, and the measure P is the average miss, which fell from 9.2 lakh to 3.1 lakh once the experience was used.</p>
  <p>Every learning algorithm in this track, from a straight line to a large neural network, has three ingredients that you can already see here. There is a <strong>family of candidate rules</strong> (all rates k, or all cut-offs t; in a neural network, all settings of millions of numbers). There is a <strong>score</strong> for how wrong a candidate is on the examples (the average miss, or the number of mistakes). And there is a <strong>search method</strong> that finds a good candidate (here we just tried a list; real algorithms search much more cleverly). Notice also what learning <em>cannot</em> do: it only finds the best rule inside the family you allowed. "Price = k × area" can never use locality or age, however much data it sees. Choosing the family, which we call choosing the model type, stays your job.</p>
  <p>ML is not always the right tool. It is worth using when the rule is unknown or too complicated to write (spam, fraud, flat prices across a whole city), when there are many past examples with known answers, when the pattern drifts and the system must keep adapting, and when an occasional mistake is acceptable. When a clear, stable rule already exists ("stamp duty is 6% of the price", "reject applicants under 18"), when there is no data or no way to tell a right answer from a wrong one, or when every decision must be exactly explainable by law, a hand-written rule is cheaper and safer. In practice the two live side by side: a spam filter is a learned model, plus a few hand rules like "always block this sender".</p>

  <h2 id="mi-vocab"><span class="num">02</span>Samples, Features and Labels</h2>
  <p>We have been using words like "row", "input" and "answer" loosely. Every later note, every library and every interviewer uses a precise vocabulary for these, so it is worth fixing it now on the table you already know.</p>
  <p>Each row of the flats table is one thing we have observed, one past sale. In ML a row is called a <strong>sample</strong> (you will also hear example, instance, observation or record). Each column that describes the flat and is known <em>before</em> we need the answer, such as area, bedrooms, locality or age, is called a <strong>feature</strong> (also input, predictor, attribute or independent variable). The column we want to predict, the price or "sold within 30 days?", is called the <strong>label</strong> or <strong>target</strong> (also output or dependent variable). The whole table is the <strong>dataset</strong>. The learned rule is the <strong>model</strong>, and the model's answer for one row is its <strong>prediction</strong>, usually written ŷ and read "y-hat", to tell it apart from the true answer y.</p>
  <p>A useful way to picture this is an exam answer key. The questions are the features, the correct answers are the labels, and each question-answer pair is one sample. A student who studies a pile of solved papers is "training"; sitting a new paper is "predicting". The phrase "known before the answer" matters a lot: a column like "number of days the flat stayed on the market" is only known <em>after</em> it sells, so it cannot be a feature for predicting whether it will sell quickly. Using such a column is a classic mistake called leakage, covered in <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>.</p>
  <p>Libraries expect the features as a table of numbers called <strong>X</strong>, with one row per sample and one column per feature, so its shape is <code>(n_samples, n_features)</code>. It is written with a capital letter because it is a matrix, a two-dimensional table. The labels go in <strong>y</strong>, written lowercase because it is a vector, a one-dimensional list, with shape <code>(n_samples,)</code>. Row i of X belongs with entry i of y. With area as the only feature, our ten flats give an X of 10 rows and 1 column, and a y of 10 prices.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[5], [6], [7], [8], [9], [10], [11], [12], [13], [14]])  # 10 samples x 1 feature (area)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])                 # one label (price) per sample
print("X shape:", X.shape, "  y shape:", y.shape)

model = LinearRegression().fit(X, y)          # training: learn from (X, y)
print("prediction for 950 sq ft:", model.predict([[9.5]]))   # inference: answer a new row

try:
    LinearRegression().fit(np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]), y)  # 1-D by mistake
except ValueError as e:
    print("ValueError:", str(e).splitlines()[0])</div>
  <div class="fx" data-lang="text">X shape: (10, 1)   y shape: (10,)
prediction for 950 sq ft: [67.]
ValueError: Expected 2D array, got 1D array instead:</div>
  <p>The shapes print as <code>(10, 1)</code> and <code>(10,)</code>. Notice how X is written: <code>[[5], [6], …]</code>, a list of rows each containing one number, rather than <code>[5, 6, …]</code>. Even with a single feature, scikit-learn insists that X is two-dimensional, because it cannot tell whether a flat list means "ten samples of one feature" or "one sample of ten features". The last part of the code passes a flat list by mistake and gets exactly that complaint, "Expected 2D array, got 1D array instead". In between, the model was trained with <code>fit(X, y)</code> and then asked for a new 950 sq ft flat with <code>predict([[9.5]])</code>, answering ₹67 lakh. Text columns like locality must be turned into numbers before they can go into X; that is the subject of <a class="xref" data-note="ml_features">Feature Engineering</a>.</p>
  <p>Those two calls also name the two phases of every model's life. <strong>Training</strong> (also called fitting or learning) is the step where the model studies labelled rows and settles its rule; it usually happens once, or on a schedule, and can be slow. <strong>Inference</strong> (prediction, scoring, serving) is the step where the finished model answers new rows; it happens many times and must be fast. The portal might retrain its price model every Sunday night on all recent sales, and then answer every new listing during the week in a few milliseconds.</p>

  <h2 id="mi-params"><span class="num">03</span>Parameters and Hyperparameters</h2>
  <p>In section 01 the number 7 in "price = 7 × area" and the cut-off 9 in "age ≥ 9" were not typed by anyone; the search produced them. But some choices <em>were</em> ours: we decided the rule would have the shape "k × area", and we told the decision tree to ask only one question. These two kinds of number have different names, and mixing them up is one of the most common beginner mistakes and interview questions.</p>
  <p>A <strong>parameter</strong> is a number inside the model that training learns from the data. A <strong>hyperparameter</strong> is a setting you choose before training starts, which controls what kind of model is built or how training behaves. A good analogy is cooking. The recipe says "bake at 180°C for 30 minutes": those are hyperparameters, decided before you start. How brown the cake actually turns, and how it rises, is what happens during baking: that is what the process "learns". If the cake comes out badly, you do not edit the cake; you change the oven setting and bake again.</p>
  <p>In scikit-learn the difference is visible in the code. Hyperparameters are the arguments you pass when you create the model. Parameters only exist after <code>fit</code>, and they are stored in attributes whose names end with an underscore, like <code>coef_</code> (coefficients) and <code>intercept_</code>. The next example fits a straight line with a starting price, price = w × area + b, and a <strong>k-nearest-neighbours</strong> model (kNN), which predicts by averaging the prices of the k most similar past flats.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor

X = np.array([[5], [6], [7], [8], [9], [10], [11], [12], [13], [14]])
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])

lin = LinearRegression(fit_intercept=True)     # a hyperparameter, chosen by us
print("before fit, hyperparameters:", lin.get_params())
lin.fit(X, y)
print("after fit, parameters: coef_ =", lin.coef_.round(6), " intercept_ =", round(lin.intercept_, 6))

for k in [1, 2]:                               # k is a hyperparameter of kNN
    knn = KNeighborsRegressor(n_neighbors=k).fit(X, y)
    train_mae = np.abs(y - knn.predict(X)).mean()
    print(f"kNN k={k}: 950 sq ft -&gt; {knn.predict([[9.5]])[0]:.1f}   error on its own training flats {train_mae:.2f}")</div>
  <div class="fx" data-lang="text">before fit, hyperparameters: {'copy_X': True, 'fit_intercept': True, 'n_jobs': None, 'positive': False, 'tol': 1e-06}
after fit, parameters: coef_ = [6.]  intercept_ = 10.0
kNN k=1: 950 sq ft -&gt; 67.0   error on its own training flats 0.00
kNN k=2: 950 sq ft -&gt; 67.5   error on its own training flats 3.45</div>
  <p>Before <code>fit</code>, <code>get_params()</code> lists the line's hyperparameters, for example <code>fit_intercept=True</code>, which means "allow a starting price". After <code>fit</code>, two parameters appear: the slope <code>coef_</code> = 6 and the intercept <code>intercept_</code> = 10, so the learned line is price = 6 × area + 10. (Section 04 derives these two numbers by hand.) For kNN the number of neighbours k is a hyperparameter. With k = 2, a 950 sq ft flat is closest to E (900 sq ft, ₹67 lakh) and F (1,000 sq ft, ₹68 lakh), and their average is 67.5, which is exactly what the code prints.</p>
  <p>The last two lines show why hyperparameters must not be chosen by looking at the training data. With k = 1, each training flat's nearest neighbour is itself, so the model "predicts" every training flat perfectly and its error on its own flats is 0.00; with k = 2 it is 3.45. If we picked k by training error, we would always pick k = 1, a model that has simply memorised the ten rows. Hyperparameters have to be chosen by trying several values and comparing them on data the model did not train on, which is exactly what the next note, <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>, sets up.</p>
  <p>kNN also shows a related distinction. A <strong>parametric</strong> model has a fixed number of parameters however much data it sees: our line always has two, whether it is trained on ten flats or ten lakh. A <strong>non-parametric</strong> model grows with the data: kNN has no learned numbers at all and simply keeps every training row (its "training" is just storing them), and a decision tree can keep adding branches as rows are added. Parametric models are small and fast but assume a shape in advance; non-parametric ones assume less but need more data and memory.</p>

  <h2 id="mi-learn"><span class="num">04</span>How a Model Learns</h2>
  <p>Our first search tried five values of one number. The line price = w × area + b has two numbers, each of which could be any real value, so there are infinitely many lines and we cannot try them all. To search properly we need two things: a precise score for "how wrong" a candidate is, and a smarter way to find the candidate with the best score.</p>
  <p>The score is called the <strong>loss</strong>, a single number that says how badly a rule fits the examples; training means making it as small as possible. For predicting numbers, the most common loss is the <strong>mean squared error</strong>, or MSE. For each flat take the miss (actual price minus predicted price), square it, and average the squares over all flats: MSE = (1/n) Σ (yᵢ − ŷᵢ)². Squaring does two jobs. It makes a miss of −3 count the same as +3, so misses in opposite directions cannot cancel out, and it makes big misses count far more than small ones: a miss of 10 costs 100, ten times as much as a miss of about 3. Here are three candidate lines scored by hand.</p>
  <table class="tbl"><caption>Three candidate lines scored by MSE on the ten flats</caption>
    <tr><th>Line</th><th>Misses y − ŷ for A … J</th><th>Sum of squared misses</th><th>MSE</th></tr>
    <tr><td>A: 8 × area (broker)</td><td>−2, 1, −3, −8, −5, −12, −15, −13, −17, −16</td><td>1186</td><td>118.6</td></tr>
    <tr><td>B: 7 × area</td><td>3, 7, 4, 0, 4, −2, −4, −1, −4, −2</td><td>131</td><td>13.1</td></tr>
    <tr><td>C: 6.5 × area + 5</td><td>0.5, 5, 2.5, −1, 3.5, −2, −3.5, 0, −2.5, 0</td><td>67.25</td><td>6.725</td></tr>
  </table>
  <p>Allowing a starting price already helped: line C beats the best line that has none. But is C the best of all lines? For a straight line scored by squared error, calculus gives the answer directly, a method called <strong>least squares</strong> (it is derived in <a class="xref" data-note="ml_regression">Linear Regression</a>). The best slope is w = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)², where x̄ and ȳ are the average area and average price, and the best intercept is b = ȳ − w·x̄. In words, the slope is "how much area and price move together" divided by "how much area moves on its own". On our flats x̄ = 95 / 10 = 9.5 and ȳ = 670 / 10 = 67.</p>
  <table class="tbl"><caption>Least squares by hand</caption>
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
  <p>So w = 495 / 82.5 = 6, meaning every extra 100 sq ft adds ₹6 lakh, and b = 67 − 6 × 9.5 = 10, a "starting price" of ₹10 lakh that every flat carries (its share of land and approvals). The best line is <strong>price = 6 × area + 10</strong>. Its misses are −2, 3, 1, −2, 3, −2, −3, 1, −1, 2, whose squares sum to 46, so its MSE is 4.6, and no other straight line does better on these ten flats. The code checks every number:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])

for name, b, w in [("A", 0, 8.0), ("B", 0, 7.0), ("C", 5, 6.5)]:     # three candidate lines
    pred = b + w * area
    print(f"line {name}: price = {w} x area + {b}   MSE = {np.mean((price - pred) ** 2):.3f}")

w = np.sum((area - area.mean()) * (price - price.mean())) / np.sum((area - area.mean()) ** 2)
b = price.mean() - w * area.mean()
print("least squares: w =", w, " b =", b, "  MSE =", np.mean((price - (b + w * area)) ** 2).round(3))

model = LinearRegression().fit(area.reshape(-1, 1), price)
print("sklearn:       w =", model.coef_[0].round(6), " b =", model.intercept_.round(6))</div>
  <div class="fx" data-lang="text">line A: price = 8.0 x area + 0   MSE = 118.600
line B: price = 7.0 x area + 0   MSE = 13.100
line C: price = 6.5 x area + 5   MSE = 6.725
least squares: w = 6.0  b = 10.0   MSE = 4.6
sklearn:       w = 6.0  b = 10.0</div>
  <p>The three hand-scored MSEs, the formula and scikit-learn all agree: w = 6, b = 10, MSE 4.6. Most models have no neat formula like this one, so they search step by step instead, with a method called <strong>gradient descent</strong>: start from some guess, work out in which direction the loss goes down, take a small step that way, and repeat. Think of walking down a hill in fog: you cannot see the bottom, but you can always feel which way the ground slopes under your feet. <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a> walks down to the same 6 and 10 on the same flats.</p>
  <p>There is one more step, and it is the one that matters most. A low loss on the ten recorded sales is not actually what the portal wants; those flats are already sold. It wants good prices for flats listed tomorrow. The ability of a model to do well on new rows it has never seen is called <strong>generalisation</strong>, and it is the real goal of machine learning. A low training loss does not guarantee it. A curve flexible enough to pass exactly through all ten points would have MSE 0, better than our line's 4.6, but it would have bent itself to follow flat E's lucky extra ₹3 lakh and flat G's unlucky sale, as if these were laws, and it would price the next flat badly. The kNN with k = 1 from section 03 is the same story: zero error on its own flats, and no real understanding. Measuring generalisation honestly is the job of <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>, and understanding why flexible models fail to generalise is the job of <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>.</p>
  <p>Putting the section together, learning has four parts: choose a family of rules (the model type), define a loss, search for the rule with the lowest training loss (<code>fit</code>), and check it on rows it has not seen. Every algorithm you will meet is these four parts with different choices. Linear regression is lines, squared loss and a formula. Logistic regression is S-shaped curves, a loss called log-loss and gradient descent. A decision tree is a set of yes/no questions, an "impurity" loss and a greedy search. Once you can name the four parts, a new algorithm is just four new answers.</p>

  <h2 id="mi-types"><span class="num">05</span>Supervised and Unsupervised Learning</h2>
  <p>Everything so far had the answer for every flat: we knew each sale price and whether each flat sold quickly. Many real problems are not like that. Sometimes there are no answers at all, sometimes only a few, and sometimes only a reward that arrives after you act. What the data gives you decides which <strong>type of learning</strong> you are doing. Think of the ways a child learns: from a teacher who marks every answer, by sorting a heap of toys into groups with nobody telling them how, and by trial and error, like learning to ride a bicycle. ML has the same three main types, plus two in-between types that matter a lot today. This section covers the two most common.</p>
  <p>In <strong>supervised learning</strong> every training row comes with the right answer, and the model learns the mapping from features X to label y. The name comes from the idea of a supervisor checking each answer. Both questions we asked of the flats were supervised, but they differ in the kind of answer. When the label is a number on a scale, such as a price, a delivery time or tomorrow's demand, the task is called <strong>regression</strong>. When the label is one of a fixed set of categories, such as "sold fast or not", "spam or not" or "which digit 0–9", it is called <strong>classification</strong>. Classification with two classes is <em>binary</em>; with more it is <em>multiclass</em>; and when one row can have several labels at once (a news article tagged both "sport" and "business") it is <em>multilabel</em>.</p>
  <p>A simple test tells regression and classification apart: does "halfway between two answers" make sense? ₹67.5 lakh, halfway between 67 and 68, is a perfectly sensible price, so price is regression. "Halfway between sold fast and sold slowly" means nothing, so that is classification. The test also handles tricky cases. A star rating from 1 to 5 is stored as a whole number, but predicting 4 when the truth is 5 is clearly less wrong than predicting 1, so it is usually treated as regression. A PIN code is stored as a number, but PIN 411045 is not "a bit more" than 411038; it is a category. The type follows the meaning of the answer, not how it is stored. Most classifiers actually output a probability ("0.83 chance this flat sells fast"), and a cut-off turns it into a class; choosing that cut-off is covered in <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</p>
  <p>In <strong>unsupervised learning</strong> there is no label at all, only X, and the model looks for structure in it. It might find groups of similar rows (<strong>clustering</strong>), squeeze many columns into a few that keep most of the information (<strong>dimensionality reduction</strong>), or find rows that do not fit the usual pattern (<strong>anomaly detection</strong>, used for fraud). Suppose we forget prices are an answer and ask only "which flats are alike?", using area and price as two descriptions of each flat. By eye the flats split into small, cheaper ones {A, B, C, D} and larger ones {E, …, J}. The centre of each group is the average of its members: ((5 + 6 + 7 + 8) / 4, (38 + 49 + 53 + 56) / 4) = (6.5, 49) for the first, and (11.5, 79) for the second. The standard clustering algorithm, <a class="xref" data-note="ml_kmeans">k-means</a>, finds the same thing without being told:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.cluster import KMeans

# the ten flats as (area, price) and NO answer column
X = np.array([[5, 38], [6, 49], [7, 53], [8, 56], [9, 67],
              [10, 68], [11, 73], [12, 83], [13, 87], [14, 96]])
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
print("group of each flat A..J:", km.labels_)
print("group centres:\\n", km.cluster_centers_.round(2))</div>
  <div class="fx" data-lang="text">group of each flat A..J: [1 1 1 1 0 0 0 0 0 0]
group centres:
 [[11.5 79. ]
 [ 6.5 49. ]]</div>
  <p>K-means put A–D in one group and E–J in the other, with exactly the centres we computed. The group numbers 0 and 1 are arbitrary labels it made up. The portal could now name the groups "starter homes" and "family homes" and show each group different listings, but nobody told the algorithm those names, and there is no right answer to compare its grouping against. That is the price of unsupervised learning: judging whether the groups are good needs its own tools (<a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>) and, in the end, business sense.</p>

  <h2 id="mi-other"><span class="num">06</span>Reinforcement, Semi- and Self-Supervised Learning</h2>
  <p>The third main type, <strong>reinforcement learning</strong> (RL), has no table of answers at all. Instead an <strong>agent</strong> (the learner) takes an <strong>action</strong> in an <strong>environment</strong>, receives a <strong>reward</strong>, and gradually learns a <strong>policy</strong>, a rule for which action to take in which situation, that earns the most reward over time. It is how you learn to ride a bicycle: nobody hands you the correct angle for each moment; you try, wobble, fall, and slowly learn what works.</p>
    <figure class="viz"><svg viewBox="0 0 420 120" width="420">
<defs><marker id="mi-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="40" width="100" height="40" rx="6" class="fb sb"/><text x="70" y="65" text-anchor="middle">Agent</text>
<rect x="300" y="40" width="110" height="40" rx="6" class="ft st"/><text x="355" y="65" text-anchor="middle">Environment</text>
<path d="M120 50 C 180 15, 240 15, 298 50" fill="none" stroke="currentColor" marker-end="url(#mi-ah2)"/><text x="210" y="22" text-anchor="middle">action (pick photo)</text>
<path d="M300 72 C 240 108, 180 108, 122 72" fill="none" stroke="currentColor" marker-end="url(#mi-ah2)"/><text x="210" y="114" text-anchor="middle" class="tg">reward (views) + new state</text>
</svg><figcaption>The reinforcement learning loop: no answer key, only rewards for the actions actually taken.</figcaption></figure>
  <p>The figure shows the loop: the agent acts, the environment responds with a reward and a new situation, and the agent acts again. Here is a tiny version at the portal. An agent chooses between two cover photos for listings, a room photo and a balcony photo, and the reward is the number of page views that day. It keeps a running average of the reward for each photo.</p>
  <table class="tbl"><caption>An agent learning which cover photo earns more views</caption>
    <tr><th>Day</th><th>Why this action</th><th>Photo</th><th>Views</th><th>Average for room</th><th>Average for balcony</th></tr>
    <tr><td>1</td><td>explore</td><td>room</td><td>500</td><td>500</td><td>–</td></tr>
    <tr><td>2</td><td>explore</td><td>balcony</td><td>450</td><td>500</td><td>450</td></tr>
    <tr><td>3</td><td>exploit (500 &gt; 450)</td><td>room</td><td>560</td><td>530</td><td>450</td></tr>
    <tr><td>4</td><td>explore again</td><td>balcony</td><td>630</td><td>530</td><td>540</td></tr>
    <tr><td>5</td><td>exploit (540 &gt; 530)</td><td>balcony</td><td>600</td><td>530</td><td>560</td></tr>
  </table>
  <p>On day 3 the agent <em>exploits</em>: it picks the photo that has done best so far. On day 4 it <em>explores</em> again, trying the photo that looked worse, and discovers the balcony photo was only unlucky on day 2. Had it never explored again, it would have used the room photo forever on the evidence of one bad day. This tension, between using what has worked and trying something that might work better, is called the <strong>explore–exploit dilemma</strong>, and it is the heart of RL. Real RL adds situations (the best photo may depend on the kind of flat) and delayed rewards (a chess move may only pay off thirty moves later). It powers game-playing programs, robots, ad bidding, and RLHF, the step that tunes large language models using human preferences. It is outside the scope of this track.</p>
  <p>The two in-between types exist because labels cost money. To label a medical scan a doctor must read it; to label a contract a lawyer must review it. Often you have a few labelled rows and a mountain of unlabelled ones. <strong>Semi-supervised learning</strong> uses both. The simplest method, <strong>self-training</strong>, works like a student who is given a few worked examples: train on the labelled rows, predict the unlabelled ones, take the predictions the model is very confident about and treat them as if they were real labels (these are called <strong>pseudo-labels</strong>), retrain, and repeat. The example below uses scikit-learn's bundled dataset of small handwritten-digit images and pretends only 50 of 1,347 training images were labelled.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.semi_supervised import SelfTrainingClassifier
from sklearn.model_selection import train_test_split

X, y = load_digits(return_X_y=True)                       # 1,797 small images of digits 0-9
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

rng = np.random.default_rng(0)
keep = rng.choice(len(y_tr), 50, replace=False)           # pretend only 50 images were labelled
y_partial = np.full_like(y_tr, -1)                         # -1 means "no label"
y_partial[keep] = y_tr[keep]

only_50 = LogisticRegression(C=0.1, max_iter=2000).fit(X_tr[keep], y_tr[keep])
self_tr = SelfTrainingClassifier(LogisticRegression(C=0.1, max_iter=2000),
                                 threshold=0.7).fit(X_tr, y_partial)
print("labelled training images:", (y_partial != -1).sum(), "of", len(y_tr))
print("trained on the 50 labels only     test accuracy:", round(only_50.score(X_te, y_te), 3))
print("self-training, 50 + unlabelled    test accuracy:", round(self_tr.score(X_te, y_te), 3))
print("images that received a pseudo-label:", int((self_tr.labeled_iter_ &gt; 0).sum()))</div>
  <div class="fx" data-lang="text">labelled training images: 50 of 1347
trained on the 50 labels only     test accuracy: 0.844
self-training, 50 + unlabelled    test accuracy: 0.884
images that received a pseudo-label: 1279</div>
  <p>A model trained on just the 50 labelled images is right on 84.4% of the test images. Self-training with a confidence threshold of 0.7 gave pseudo-labels to 1,279 of the unlabelled images and reached 88.4%: four points gained from images nobody labelled. The risk is that a confident <em>wrong</em> pseudo-label becomes training data and pulls the model further the wrong way, so you should always compare against the labelled-only model on properly labelled test data, as done here.</p>
  <p><strong>Self-supervised learning</strong> goes one step further: the labels are made automatically from the data itself, so no human labels anything. Take a listing description, "spacious 2BHK flat near the metro". Hide one word and ask the model to fill the gap: the input is "spacious ___ flat near the metro" and the label is "2BHK". Or cut the sentence and ask for the next word: input "spacious 2BHK flat near the", label "metro". One sentence gives several training pairs for free, and the internet gives billions. This is how large language models are first trained, before being fine-tuned with a small labelled set (see <a class="xref" data-note="nlp">NLP</a> and <a class="xref" data-note="dl_attention">Attention</a>). Technically it is supervised learning; what makes it special is that the supervision costs nothing.</p>
  <p>You will also hear ML split along a few other lines. <strong>Batch</strong> (offline) learning trains on the full dataset and redeploys periodically, while <strong>online</strong> learning updates the model row by row as data streams in. <strong>Instance-based</strong> models compare new rows to stored examples (kNN), while <strong>model-based</strong> ones compress the data into parameters (a line). And <strong>discriminative</strong> models learn P(y | x), the chance of each answer given the inputs, directly (logistic regression), while <strong>generative</strong> models learn how the inputs arise for each class (Naive Bayes).</p>

  <h2 id="mi-flow"><span class="num">07</span>The ML Workflow</h2>
  <p>Fitting "price = 6 × area + 10" took one line of code. In a real project that line is perhaps a tenth of the work. Before it, someone must decide exactly what to predict and gather the right data; after it, someone must check the model properly, put it into use, and watch it. Running a tiffin service is a good comparison: you decide what to cook and for whom, buy and check the vegetables, prepare, cook, taste, deliver, and keep listening to customers because tastes change. An ML project has the same shape, and it never quite ends.</p>
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
  <p>The first step, <strong>problem framing</strong>, is where many projects quietly fail. Before touching data you should be able to write down what decision the model will change, what exactly is being predicted, for which unit (flat, customer, day), how far ahead, and what each kind of mistake costs. Here is a worked example. The portal earns commission only when a flat sells, and some listings are overpriced and go stale. The framing: "Every Monday, for each active listing, predict the probability p that it will <em>not</em> sell in the next 60 days; a pricing advisor calls sellers above some cut-off." A call costs ₹200 of advisor time, persuades the seller to re-price half the time, and a sale that would otherwise not have happened earns ₹3,000. So for a listing with probability p, the expected gain of calling is p × 0.5 × 3000 − 200.</p>
  <div class="fx" data-lang="py">call_cost, commission, success = 200, 3000, 0.5     # ₹ per call, ₹ per sale, share of calls that work
for p in [0.05, 0.10, 0.20, 0.50]:                   # model's probability that the listing won't sell
    gain = p * success * commission - call_cost
    print(f"p = {p:.2f}   expected gain of calling = ₹{gain:7.1f}")
print("break-even p =", round(call_cost / (success * commission), 4))</div>
  <div class="fx" data-lang="text">p = 0.05   expected gain of calling = ₹ -125.0
p = 0.10   expected gain of calling = ₹  -50.0
p = 0.20   expected gain of calling = ₹  100.0
p = 0.50   expected gain of calling = ₹  550.0
break-even p = 0.1333</div>
  <p>Calling about a listing with a 5% or 10% risk loses money on average, while a 20% risk already gains ₹100. Calling pays exactly when 1500·p − 200 &gt; 0, that is p &gt; 200 / 1500 = 0.133. Two useful facts fall out of this small calculation before any model exists: the model does not need to be very sure (13% is enough to act), and it must output <em>probabilities</em>, not just yes or no. This number will later set the model's decision cut-off (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</p>
  <p>The second step is <strong>data collection and exploratory data analysis</strong> (EDA), which simply means looking hard at the data before modelling: how many rows, missing values, impossible values (an age of −3), duplicates, how rare the positive class is, and whether every column will really be available at the moment of prediction. The third step is <strong>feature engineering</strong>: turning raw data into model inputs, for example converting locality into numbers, filling gaps, or building "price per sq ft" or "enquiries in the last 7 days". Good features usually help more than a fancier algorithm (<a class="xref" data-note="ml_features">Feature Engineering</a>).</p>
  <p>The fourth step is to <strong>split, build a baseline, train and tune</strong>. First lock some data away for the final test (the next note explains how). Then build a <strong>baseline</strong>: the simplest possible predictor, such as "always predict the average price" or "always predict the most common class". A baseline is the bar every real model must clear, and without it a score means nothing. On our flats, "always say ₹67 lakh" has MSE 301.6, so the line's 4.6 is 65 times smaller and has clearly learned something. For a yes/no target, if 95 of 100 listings sell, "always say it sells" is 95% accurate, and a model with 94% accuracy is worse than doing nothing; you only notice if you computed the baseline. Then try real models from simple to complex and tune their hyperparameters on validation data.</p>
  <p>The fifth step is to <strong>evaluate</strong> the chosen model once on the locked-away test data, using measures that match the costs from step 1 (<a class="xref" data-note="ml_evaluation">Classification Metrics</a>, <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>), and to check it on slices: is it equally good in every locality, for new and old flats? The sixth step is to <strong>deploy</strong> it where decisions happen. That can be a nightly <em>batch</em> job that scores every listing and writes the advisor's call list, an <em>online</em> service that answers each request in milliseconds (a suggested price the moment a seller types the area), or a model running on the phone itself. The preprocessing and the model are saved together as one versioned file, so that training and serving compute features identically, and the rollout is careful: first "shadow mode" (predict but do not act), then a small share of traffic, ideally as an <a class="xref" data-note="st_abtesting">A/B test</a>. The seventh step, monitoring, is important enough for its own section.</p>

  <h2 id="mi-drift"><span class="num">08</span>Monitoring and Drift</h2>
  <p>A model is trained on the past and used in the future, and the future does not stand still. The price model was trained on last year's sales. This year a new metro line opens near Hadapsar, so the same 800 sq ft flat there now sells for more; builders start listing bigger flats; the market slows and fewer flats sell within a month. Each of these slowly makes the model wrong, and nothing crashes or shows an error. A change between the data a model was trained on and the data it now sees is called <strong>drift</strong> (or distribution shift), and watching for it is the seventh step of the workflow, <strong>monitoring</strong>.</p>
  <p>It helps to name three kinds of drift, using P(·) to mean "how something is spread out". <strong>Covariate drift</strong> (data drift) is a change in P(X), the inputs: more large flats are listed, but the rule linking area to price is the same. <strong>Label shift</strong> (prior shift) is a change in P(y), how common each answer is: in a slow market the share of flats that sell fast drops. <strong>Concept drift</strong> is a change in P(y | X), the rule itself: after the metro opens, the same area in the same locality means a higher price. Think of a shopkeeper. Covariate drift is new kinds of customers walking in; concept drift is the same customers suddenly wanting different things.</p>
  <p>Input drift is easy to watch, because inputs arrive immediately. The standard one-number check is the <strong>Population Stability Index</strong> (PSI). Cut a feature into bins using the training data, record each bin's share at training time (e, for expected) and now (a, for actual), and add up (a − e) × ln(a / e) over the bins. When a share grows, both factors are positive; when it shrinks, both are negative; so every term is zero or positive, and bins that changed a lot dominate the total.</p>
  <table class="tbl"><caption>PSI by hand for the area of newly listed flats</caption>
    <tr><th>Area bin</th><th>Training share e</th><th>This month a</th><th>a − e</th><th>ln(a / e)</th><th>Term</th></tr>
    <tr><td>under 700 sq ft</td><td>0.40</td><td>0.25</td><td>−0.15</td><td>−0.470</td><td>0.0705</td></tr>
    <tr><td>700–1,000</td><td>0.30</td><td>0.30</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>1,000–1,300</td><td>0.20</td><td>0.25</td><td>0.05</td><td>0.223</td><td>0.0112</td></tr>
    <tr><td>1,300+</td><td>0.10</td><td>0.20</td><td>0.10</td><td>0.693</td><td>0.0693</td></tr>
    <tr><td colspan="5"><strong>PSI</strong></td><td><strong>0.151</strong></td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np

expected = np.array([0.40, 0.30, 0.20, 0.10])   # share of listings per area bin when the model was trained
actual   = np.array([0.25, 0.30, 0.25, 0.20])   # share per bin this month
terms = (actual - expected) * np.log(actual / expected)
print("PSI terms:", terms.round(4), "  PSI =", round(terms.sum(), 4))</div>
  <div class="fx" data-lang="text">PSI terms: [0.0705 0.     0.0112 0.0693]   PSI = 0.151</div>
  <p>The code reproduces the four terms and the total of 0.151. A common rule of thumb reads PSI below 0.1 as stable, 0.1 to 0.25 as a moderate shift worth investigating, and above 0.25 as a major shift that probably needs retraining. Here 0.151 says bigger flats are being listed than the model was trained on: investigate. (Libraries add a tiny number to every share, because an empty bin would mean dividing by zero.)</p>
  <p>Concept drift is the dangerous kind, because the inputs can look perfectly normal while the answers have changed, so PSI stays green as accuracy falls. The only way to catch it is to track the model's real performance on real outcomes, even if those outcomes arrive weeks late, over a rolling window with an alert. When drift is found, the workflow loops back: retrain on recent data, or, if the world has changed more deeply, go back to framing. This loop, the dashed arrow in the workflow figure, is what separates a real project from a course exercise.</p>

  <h2 id="mi-first"><span class="num">09</span>A First Model, End to End</h2>
  <p>Sections 07 and 08 described the workflow in words. Now we run its core for real: lock some data away, build a baseline, train a model, and score both once on the locked-away rows. First on the ten flats, small enough to check by hand, and then on a real medical dataset.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])

X_tr, X_te, y_tr, y_te = train_test_split(area, price, test_size=0.2, random_state=0)  # lock 2 flats away
print("locked-away flats (area):", X_te.ravel(), "  prices:", y_te)

base = DummyRegressor(strategy="mean").fit(X_tr, y_tr)   # baseline: always the average price
line = LinearRegression().fit(X_tr, y_tr)                 # the real model
print("line learned on 8 flats: price = %.3f x area + %.3f" % (line.coef_[0], line.intercept_))
for name, m in [("baseline", base), ("line", line)]:
    print(f"{name:8s} predictions {m.predict(X_te).round(2)}   test MAE {mean_absolute_error(y_te, m.predict(X_te)):.2f}")</div>
  <div class="fx" data-lang="text">locked-away flats (area): [ 7 13]   prices: [53 87]
line learned on 8 flats: price = 6.094 x area + 9.119
baseline predictions [66.25 66.25]   test MAE 17.00
line     predictions [51.78 88.34]   test MAE 1.28</div>
  <p><code>train_test_split</code> locked away two flats, C (700 sq ft, ₹53 lakh) and I (1,300 sq ft, ₹87 lakh); <code>random_state=0</code> fixes which two, so the result is the same every run. The baseline, <code>DummyRegressor(strategy="mean")</code>, predicts the average of the other eight prices for everything: they sum to 670 − 53 − 87 = 530, so it always says 530 / 8 = 66.25 and misses C by 13.25 and I by 20.75. Its <strong>MAE</strong> (mean absolute error, the average size of the miss) is 17.0 lakh. The line, refitted on eight flats, comes out as price = 6.094 × area + 9.119, close to the 6 and 10 from all ten; it predicts 51.78 for C and 88.34 for I, misses of 1.22 and 1.34, an MAE of 1.28. The line beats the baseline by a mile, and this time the score comes from flats it never saw. But it is a score from just <em>two</em> flats, and a different pair could tell a different story; that is exactly where the next note begins.</p>
  <p>The same steps at a realistic scale use scikit-learn's bundled breast-cancer dataset: 569 tumours, each described by 30 measurements from a scan, labelled malignant (cancer) or benign. Missing a cancer is the worst possible mistake, so besides <strong>accuracy</strong> (the share of all answers that were right) we track <strong>recall</strong>: of all the real cancers, the share the model caught. A few new tools appear, each in one line. <code>StratifiedKFold</code> with <code>cross_val_score</code> scores a model on five different train/validation cuts of the training data, which the next note explains as cross-validation. <code>DummyClassifier</code> is the classification baseline. <code>make_pipeline(StandardScaler(), LogisticRegression())</code> chains "rescale every column to mean 0 and spread 1" with a <a class="xref" data-note="ml_classification">logistic regression</a> classifier so they always run together. <code>RandomForestClassifier</code> averages 200 decision trees (<a class="xref" data-note="ml_rf">Random Forest</a>). <code>joblib</code> saves a fitted model to a file.</p>
  <div class="fx" data-lang="py">import numpy as np, joblib
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.dummy import DummyClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, recall_score, confusion_matrix

# 1. look at the data
X, y = load_breast_cancer(return_X_y=True, as_frame=True)
y = 1 - y                                         # make 1 = malignant, the case we must catch
print(X.shape, " malignant share:", round(y.mean(), 3), " missing values:", int(X.isna().sum().sum()))

# 2. lock the test set away first
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# 3. compare a baseline and two candidates with 5-fold CV on the training part only
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
models = {"baseline": DummyClassifier(strategy="most_frequent"),
          "logreg":   make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
          "forest":   RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=1)}
for name, m in models.items():
    acc = cross_val_score(m, X_tr, y_tr, cv=cv, scoring="accuracy")
    rec = cross_val_score(m, X_tr, y_tr, cv=cv, scoring="recall")
    print(f"{name:9s} CV accuracy {acc.mean():.3f}   CV recall {rec.mean():.3f}")

# 4. refit the winner on all training rows, then use the test set once
best = models["logreg"].fit(X_tr, y_tr)
pred = best.predict(X_te)
print("TEST accuracy", round(accuracy_score(y_te, pred), 3), "  recall", round(recall_score(y_te, pred), 3))
print("confusion matrix [[TN FP] [FN TP]]:\\n", confusion_matrix(y_te, pred))
print("P(malignant) for the first 3 test tumours:", best.predict_proba(X_te.iloc[:3])[:, 1].round(3))

# 5. save, reload, predict (deployment in miniature)
joblib.dump(best, "tumour_model.joblib")
print("reloaded model, first test tumour:", joblib.load("tumour_model.joblib").predict(X_te.iloc[[0]]))</div>
  <div class="fx" data-lang="text">(569, 30)  malignant share: 0.373  missing values: 0
baseline  CV accuracy 0.626   CV recall 0.000
logreg    CV accuracy 0.978   CV recall 0.959
forest    CV accuracy 0.958   CV recall 0.935
TEST accuracy 0.965   recall 0.929
confusion matrix [[TN FP] [FN TP]]:
 [[71  1]
 [ 3 39]]
P(malignant) for the first 3 test tumours: [0.    1.    0.043]
reloaded model, first test tumour: [0]</div>
  <p>Read the output in the order the work was done. The data has 569 rows, 30 features, 37.3% malignant and no missing values. The test set (20%, 114 tumours) was locked away before anything else; <code>stratify=y</code> keeps 37% malignant in both parts. The baseline, which always says "benign", is right 62.6% of the time and catches zero cancers (recall 0.000), so any useful model must beat 0.626 accuracy and, more importantly, a recall of zero. Logistic regression scores 0.978 accuracy and 0.959 recall in cross-validation, the forest 0.958 and 0.935, so logistic regression is chosen <em>before</em> the test set is touched.</p>
  <p>Refitted on all 455 training rows and scored once, it gets 0.965 accuracy, which is (71 + 39) / 114 from the confusion matrix, and 0.929 recall, which is 39 / (39 + 3): one false alarm and three missed cancers. That is a little below the cross-validation estimate, which is normal for a fresh sample of 114 rows, where one tumour is worth almost a full percentage point. <code>predict_proba</code> gives a probability per tumour (0.043 means a 4.3% chance of malignancy); for screening you might flag anything above 0.1, catching more cancers at the cost of more false alarms, a decision taken from the costs, not from the model. Finally the saved and reloaded file gives the same answer, because the scaler's means and spreads travel inside it. The order of these steps is the real lesson: look, lock the test set away, baseline, compare candidates on cross-validation, choose, refit, test once, save. Every later note adds detail to one of these steps without changing their order.</p>

  <h2 id="mi-track"><span class="num">10</span>Where ML Fits</h2>
  <p>Machine learning is often confused with its neighbours, and interviewers like to ask where the borders are. <strong>Artificial intelligence</strong> (AI) is the widest idea: any machine behaviour that looks intelligent, including hand-written rules and search, like a chess engine that checks millions of moves. <strong>Machine learning</strong> is the part of AI in which behaviour is learned from data rather than written by hand. <strong>Deep learning</strong> is the part of ML that uses neural networks with many layers, which can learn their own features from raw pixels, text or sound (<a class="xref" data-note="dl_foundations">Deep Learning</a>). <strong>Data science</strong> overlaps all of these and adds analysis, statistics and communication.</p>
  <p>The border with <strong>statistics</strong> is the subtlest, because the same tool often belongs to both. Linear regression is a statistical method and an ML model. The difference is mostly the question asked. A statistician usually asks "why?": does locality really affect price, and how sure are we? The answer is a coefficient with a confidence interval and a p-value. An ML engineer usually asks "what next?": what price should this new flat get? The answer is a prediction, judged by its error on data the model has not seen.</p>
  <table class="tbl">
    <tr><th></th><th>Rules-based software</th><th>Classical statistics</th><th>Machine learning</th><th>Deep learning</th></tr>
    <tr><td>Main goal</td><td>execute known logic</td><td>understand and test relationships</td><td>predict well on new data</td><td>predict from raw signals</td></tr>
    <tr><td>Who makes the rule</td><td>a person</td><td>a person picks the form; data fits it</td><td>data, within a family you choose</td><td>data, including the features</td></tr>
    <tr><td>Judged by</td><td>matching the specification</td><td>valid assumptions, significance</td><td>error on held-out data</td><td>error on held-out data</td></tr>
    <tr><td>Example</td><td>tax calculator</td><td>"does the drug lower blood pressure?"</td><td>churn score per customer</td><td>speech to text</td></tr>
  </table>
  <p>This note is the first of the <strong>Foundations</strong> group of the ML track, and each Foundations note solves the problem the previous one leaves open. Our MAE of 1.28 came from two flats, so <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a> shows how to measure honestly. That reveals models that look good in training and fail on new data, which <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a> explains. <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a> shows how models find their numbers, <a class="xref" data-note="ml_regularization">Regularization</a> stops them overfitting, <a class="xref" data-note="ml_features">Feature Engineering</a> improves their inputs, and <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a> keeps the whole process honest. The rest of the track then covers families of models and kinds of problem:</p>
  <table class="tbl">
    <tr><th>Group</th><th>Question it answers</th><th>Starts with</th></tr>
    <tr><td>1 Foundations</td><td>how does learning work, and how do we do it honestly?</td><td>this note</td></tr>
    <tr><td>2 Regression</td><td>predict a number and explain each input's effect</td><td><a class="xref" data-note="ml_regression">Linear Regression</a></td></tr>
    <tr><td>3 Classification</td><td>predict a class and its probability</td><td><a class="xref" data-note="ml_classification">Logistic Regression</a></td></tr>
    <tr><td>4 Tree-based models</td><td>the strongest models for tables of data</td><td><a class="xref" data-note="ml_trees">The Tree Family</a></td></tr>
    <tr><td>5 Model evaluation</td><td>is the model good enough, and where to set the cut-off?</td><td><a class="xref" data-note="ml_evaluation">Classification Metrics</a></td></tr>
    <tr><td>6 Clustering</td><td>which rows belong together, without labels?</td><td><a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a></td></tr>
    <tr><td>7 Dimensionality reduction</td><td>how to shrink many columns and visualise data</td><td><a class="xref" data-note="ml_dimred">Curse of Dimensionality</a></td></tr>
    <tr><td>8 Time series</td><td>forecast values that depend on time</td><td><a class="xref" data-note="ml_timeseries">Time Series Basics</a></td></tr>
    <tr><td>9 Recommender systems</td><td>which item to show which user</td><td><a class="xref" data-note="ml_recsys">Basics &amp; Content-Based</a></td></tr>
  </table>

  <h2 id="mi-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common mistake of all is judging a model by its score on the rows it learned from. A training score always flatters, and the more flexible the model, the more it flatters. The kNN from section 03 shows it in two lines:</p>
  <div class="fx" data-lang="py">knn1 = KNeighborsRegressor(n_neighbors=1).fit(X, y)
print(np.abs(y - knn1.predict(X)).mean())     # each flat is its own nearest neighbour</div>
  <div class="fx" data-lang="text">0.0</div>
  <p>A perfect score, and it means nothing: the model looked each flat up in its own memory. The fix is to quote only scores measured on rows the model never saw, and the next note is entirely about doing that well. The same mistake in a different form is choosing a hyperparameter by training score, which always picks the most flexible option (k = 1 here).</p>
  <p>The second mistake is reporting a score with no baseline. "95% accuracy" sounds impressive until you learn that 95% of listings sell anyway, and "MSE 4.6" means little until you see that always predicting the average gives 301.6. Compute the dummy score first, every time; it also catches bugs, because a model that cannot beat it has either learned nothing or been wired up wrongly.</p>
  <p>The third mistake is using a feature that will not exist at prediction time. Using "days on market" to predict whether a flat sells quickly, or "reason for cancelling" to predict which customers will cancel, produces a model that looks brilliant in testing and is useless live, because at the moment of prediction those columns are empty. Ask of every column: "will I know this when I need the answer?"</p>
  <p>Three more are about framing and the long run. Choosing the learning type from how the answer is stored (a PIN code is not a number to regress on; a star rating usually is) leads to the wrong model; decide by what a near miss means. Treating deployment as the finish line means drift is discovered by angry users; plan monitoring and retraining before launch. And forgetting that learning only searches inside the family you allowed: "price = k × area" cannot use locality or age and has no starting price, and no amount of data fixes a wrong family. That kind of built-in limitation is what the next notes call bias.</p>

  <h2 id="mi-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Ten flats, area x in 100 sq ft and price y in ₹ lakh: A (5, 38), B (6, 49), C (7, 53), D (8, 56), E (9, 67), F (10, 68), G (11, 73), H (12, 83), I (13, 87), J (14, 96). Ages 12, 3, 8, 15, 5, 10, 20, 2, 7, 4; sold within 30 days: A, D, F, G.</p>
  <h3>Definitions</h3>
  <ul>
    <li><b>Machine learning</b>: building a rule from examples with answers, by searching a family of rules for the one with the lowest loss. Mitchell: performance at task T, measured by P, improves with experience E.</li>
    <li><b>Sample / feature / label</b>: a row / an input column known before the answer / the answer to predict.</li>
    <li><b>X, y</b>: X is 2-D, shape (n_samples, n_features); y is 1-D, shape (n_samples,).</li>
    <li><b>Model, prediction ŷ</b>: the learned rule; its answer for a row.</li>
    <li><b>Parameter</b>: learned by <code>fit</code> (w = 6, b = 10, cut-off 9; sklearn names end in <code>_</code>). <b>Hyperparameter</b>: set by you before fit (k, max_depth, fit_intercept), chosen on held-out data.</li>
    <li><b>Training / inference</b>: <code>fit</code> learns from labelled rows / <code>predict</code> answers new rows.</li>
    <li><b>Parametric / non-parametric</b>: fixed number of parameters (line: 2) / grows with data (kNN stores every row).</li>
    <li><b>Loss</b>: one number for how wrong a rule is; training minimises it. <b>Generalisation</b>: doing well on new rows; the real goal.</li>
    <li><b>Baseline</b>: the simplest predictor (mean, majority class); every model must beat it.</li>
    <li><b>Drift</b>: covariate P(X), label P(y), concept P(y | X).</li>
  </ul>
  <h3>Learning types</h3>
  <table class="tbl">
    <tr><th>Type</th><th>Data given</th><th>Learns</th><th>Example</th></tr>
    <tr><td>Supervised: regression</td><td>X and numeric y</td><td>X → number</td><td>flat price</td></tr>
    <tr><td>Supervised: classification</td><td>X and class y</td><td>X → class (+ probability)</td><td>sold within 30 days?</td></tr>
    <tr><td>Unsupervised</td><td>X only</td><td>structure: groups, fewer columns, anomalies</td><td>k-means {A–D}, {E–J}</td></tr>
    <tr><td>Reinforcement</td><td>actions and rewards</td><td>a policy</td><td>which cover photo</td></tr>
    <tr><td>Semi-supervised</td><td>few labels + many unlabelled</td><td>X → y</td><td>digits: 0.844 → 0.884</td></tr>
    <tr><td>Self-supervised</td><td>labels made from the data</td><td>representations</td><td>next / masked word</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>On the flats</th></tr>
    <tr><td>MAE</td><td>(1/n) Σ |yᵢ − ŷᵢ|</td><td>7 × area: 31 / 10 = 3.1</td></tr>
    <tr><td>MSE</td><td>(1/n) Σ (yᵢ − ŷᵢ)²</td><td>6 × area + 10: 46 / 10 = 4.6</td></tr>
    <tr><td>Least-squares slope</td><td>w = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²</td><td>495 / 82.5 = 6</td></tr>
    <tr><td>Intercept</td><td>b = ȳ − w·x̄</td><td>67 − 6 × 9.5 = 10</td></tr>
    <tr><td>Act if</td><td>p · s · V − c &gt; 0, i.e. p &gt; c / (s · V)</td><td>200 / (0.5 × 3000) = 0.133</td></tr>
    <tr><td>PSI</td><td>Σ (a − e) · ln(a / e)</td><td>0.151 (&lt;0.1 stable, 0.1–0.25 investigate, &gt;0.25 major)</td></tr>
  </table>
  <h3>Workflow</h3>
  <div class="fx" data-lang="py">X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)  # lock test away
DummyClassifier(strategy="most_frequent")                 # baseline first
cross_val_score(model, X_tr, y_tr, cv=5)                  # compare candidates on training data only
best = model.fit(X_tr, y_tr)                              # refit the winner
best.score(X_te, y_te)                                    # test ONCE
joblib.dump(best, "model.joblib")                         # save preprocessing + model together</div>
  <h3>Gotchas</h3>
  <ul>
    <li>A training score is not a result; kNN with k = 1 scores perfectly on its own rows.</li>
    <li>No baseline, no meaning: MSE 4.6 vs 301.6 for "always the mean".</li>
    <li>Features must exist at prediction time ("days on market" does not).</li>
    <li>Type follows meaning: PIN codes are categories, star ratings usually regression.</li>
    <li>Learning only searches inside the family you allowed.</li>
    <li>Concept drift is invisible to input checks like PSI; track real outcomes.</li>
  </ul>

  <h2 id="mi-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is machine learning, and how is it different from ordinary programming?</summary><div class="qa-body">In ordinary programming a person writes the rule and the computer applies it to data. In machine learning a person supplies examples with answers and a family of possible rules, and the computer searches for the rule that makes the fewest mistakes; that learned rule (the model) is then used like a program. It is useful when the rule is too complex to write but past examples exist.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>State Mitchell's definition of learning and apply it to an example.</summary><div class="qa-body">A program learns from experience E with respect to task T and performance measure P if its performance at T, measured by P, improves with E. For flat pricing: T is suggesting a price, E is past sales, P is the average miss. Using ten past sales, the average miss fell from 9.2 lakh (a broker's rule) to 3.1 lakh (the learned rate).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are features, labels and samples? What shapes do X and y have?</summary><div class="qa-body">A sample is one row (one flat), a feature is an input column known before the answer (area, locality), and the label is the answer to predict (price). X is a 2-D table of shape (n_samples, n_features) and y a 1-D vector of shape (n_samples,). Even one feature must be 2-D in scikit-learn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a parameter and a hyperparameter? Give examples.</summary><div class="qa-body">Parameters are learned from the data during training: the slope and intercept of a line, the split thresholds of a tree, the weights of a network. Hyperparameters are set before training and control the model or the training process: k in kNN, a tree's max_depth, a regularisation strength, a learning rate. Parameters minimise the training loss; hyperparameters are chosen by comparing models on validation data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you choose hyperparameters using training accuracy?</summary><div class="qa-body">Because the training score always rewards the most flexible setting. kNN with k = 1 predicts every training row perfectly, since each row is its own nearest neighbour, and a fully grown tree does the same. Only data the model did not train on reveals that these settings generalise worse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Supervised vs unsupervised vs reinforcement learning?</summary><div class="qa-body">Supervised learning has an answer for every training row and learns X → y (price prediction, spam detection). Unsupervised learning has only X and finds structure such as clusters or fewer dimensions (customer segments). Reinforcement learning has no answer key; an agent takes actions, receives rewards, and learns a policy that maximises long-run reward (games, robots).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you decide whether a problem is regression or classification?</summary><div class="qa-body">By the meaning of the answer, not how it is stored. If "halfway between two answers" makes sense and a near miss is less wrong than a far one, it is regression (price, star rating usually). If the answers are categories with no order between them, it is classification (spam or not, PIN code, digit). Classification is binary, multiclass or multilabel depending on how many classes and how many per row.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is semi-supervised learning, and how does self-training work?</summary><div class="qa-body">It uses a few labelled rows plus many unlabelled ones, for when labels are expensive. Self-training trains on the labelled rows, predicts the unlabelled ones, adds the most confident predictions as pseudo-labels, and retrains. On digits with only 50 labels it raised test accuracy from 0.844 to 0.884; the risk is that confident mistakes reinforce themselves.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is self-supervised learning, and why does it matter?</summary><div class="qa-body">It creates labels automatically from the data itself, for example hiding a word and asking the model to predict it, or predicting the next word. No human labelling is needed, so it can use billions of examples. It is how large language models and many image models are pre-trained before fine-tuning on small labelled sets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a loss function, and why is squared error popular?</summary><div class="qa-body">A loss is a single number measuring how wrong a model is on the examples; training searches for the parameters that minimise it. Squared error makes misses in both directions count, punishes large misses heavily, and is smooth, so calculus gives a closed-form answer for linear regression (least squares) and gradients for other models. Its downside is sensitivity to outliers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is generalisation, and why is a low training error not enough?</summary><div class="qa-body">Generalisation is performing well on new data from the same source, which is the real goal. Training error is measured on rows the model was fitted to, so a flexible enough model can drive it to zero by memorising, including the noise, and still predict new rows badly. Only held-out data or cross-validation measures generalisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a baseline model and why build one first?</summary><div class="qa-body">The simplest possible predictor: the mean for regression, the most common class for classification. It gives every score its meaning (a 94%-accurate model is useless if 95% of rows are one class) and catches bugs, since a model that cannot beat it has learned nothing or is wired up wrongly. On the tumour data the majority baseline had 62.6% accuracy and recall 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through the stages of an ML project. Where do projects usually fail?</summary><div class="qa-body">Frame the problem, collect and explore data, build features, split and build a baseline, train and tune, evaluate once on the test set, deploy, and monitor, looping back when things drift. Most failures happen at the ends: a target nobody can act on or that leaks the answer, training data unlike live data, or no monitoring after launch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A call costs ₹200, succeeds half the time, and a saved sale is worth ₹3,000. Above what predicted probability should you call?</summary><div class="qa-body">Expected gain = p × 0.5 × 3000 − 200 = 1500p − 200, which is positive when p &gt; 0.133. The model only needs to be 13% sure for action to pay, which shows why framing in money matters and why the model must output calibrated probabilities rather than just yes/no.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are covariate shift, label shift and concept drift? Which is hardest to detect?</summary><div class="qa-body">Covariate shift: the inputs P(X) change but the rule is the same (bigger flats listed). Label shift: how common each answer is, P(y), changes (fewer fast sales in a slow market). Concept drift: the rule P(y | X) itself changes (same flat, higher price after a metro opens). Concept drift is hardest, because inputs can look normal; only tracking real outcomes reveals it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you compute PSI, and how do you read it?</summary><div class="qa-body">Bin a feature using training data, take each bin's share at training time e and now a, and sum (a − e) · ln(a / e). Below 0.1 is usually stable, 0.1–0.25 a moderate shift to investigate, above 0.25 a major shift. Example: shares (0.5, 0.5) becoming (0.3, 0.7) give 0.102 + 0.067 = 0.169, a moderate shift.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are AI, ML, deep learning and statistics related?</summary><div class="qa-body">AI is any machine behaviour that looks intelligent, including hand-written rules. ML is the part of AI that learns from data. Deep learning is the part of ML that uses many-layered neural networks and learns its own features from raw data. Statistics shares many tools with ML (linear regression is both) but usually asks "why, and how sure are we?", while ML asks "how well can we predict new cases?".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you not use machine learning?</summary><div class="qa-body">When a clear, stable rule already exists (tax slabs, age limits), when there is no data or no way to tell right from wrong answers, when every decision must be exactly explainable or is legally fixed, or when any mistake is unacceptable. A hand-written rule is then cheaper, safer and easier to maintain.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did the logistic model need a StandardScaler but the random forest did not?</summary><div class="qa-body">Logistic regression adds up weight × value and penalises large weights, so columns on very different scales (area in the hundreds, smoothness around 0.1) are treated unequally and the solver converges slowly. Trees only ask "is this column above a threshold?", and rescaling a column does not change which rows fall on each side.</div></details>
</main>
`
});
