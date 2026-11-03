// notes/ml/ml_dtree.js — Decision Trees
Object.assign(TOPIC_CONTENT, {
  "ml_dtree": `<main>
  <h1>Decision Trees</h1>
  <div class="where"><span>Machine Learning</span><span>Tree-Based Models</span><span>Decision Trees</span></div>
  <p class="lead">A decision tree is a model that learns a flowchart of yes/no questions from past examples and answers a new example by walking down that flowchart, one question at a time. It matters in real work for two reasons: a small tree is one of the few models whose reasoning you can read aloud to a manager or a regulator, and every random forest and every gradient-boosting model (XGBoost, LightGBM, CatBoost) is built out of these trees, so understanding them is understanding the strongest models for table data. Our running example is a small diary kept by a college cricket captain: for 14 evenings he wrote down the weather and whether the match was played. We will build a tree for this diary completely by hand, learn how the computer chooses each question, see why a tree left alone memorises its data, and learn how to stop it. When a question needs realistic amounts of data, we switch to a larger table of 20,000 customers, but the diary stays the place where every idea is worked out first.</p>

  <h2 id="dt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Decision Trees</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What a tree is</div>
        <ul>
          <li>Root, internal nodes (questions), branches (answers), leaves (predictions)</li>
          <li>Each root-to-leaf path is one IF ... AND ... THEN rule</li>
          <li>Leaf predicts the majority class (classification) or the mean (regression)</li>
          <li>Prediction costs one comparison per level: O(depth)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing a question</div>
        <ul>
          <li><b>Entropy</b> −Σ p log₂ p · <b>Gini</b> 1 − Σ p² · regression: <b>variance</b></li>
          <li><b>Gain</b> = parent impurity − size-weighted child impurity</li>
          <li>Greedy, top-down, recursive: best question now, never look back</li>
          <li>Gain ratio fixes IG's love of many-valued columns; error is too flat to grow with</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Kinds of split</div>
        <ul>
          <li>Numbers: sort, try midpoints, keep the best "x ≤ t"</li>
          <li>Categories: 2^(k−1) − 1 groupings; sort by rate for 2 classes</li>
          <li>ID3 multiway · C4.5 gain ratio · CART binary (sklearn)</li>
          <li>Missing: fractional rows · surrogates · learned NaN side</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Overfitting and pruning</div>
        <ul>
          <li>Unlimited tree: train 1.000, validation 0.773 (memorised)</li>
          <li>High variance: drop one diary day and the root changes</li>
          <li>Pre-pruning: max_depth, min_samples_leaf, ...</li>
          <li>Post-pruning: R(T) + α|T|, weakest link, α by cross-validation</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Practical facts</div>
        <ul>
          <li>No scaling needed; only the order of values matters</li>
          <li>Axis-aligned boxes; diagonals need staircases</li>
          <li>Cannot extrapolate beyond its leaf values</li>
          <li>MDI importance is biased to many-valued columns</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dt-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">A Tree of Questions</span><span class="rm-sub">the diary, the parts of a tree, how it predicts</span></div></div>
      <div class="rm-item rm-done" data-target="dt-entropy"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Impurity and Entropy</span><span class="rm-sub">a number for "how mixed is this group"</span></div></div>
      <div class="rm-item rm-done" data-target="dt-ig"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Information Gain</span><span class="rm-sub">building the whole tree by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dt-gini"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Gain Ratio, Gini and Error</span><span class="rm-sub">other ways to score a question</span></div></div>
      <div class="rm-item rm-done" data-target="dt-split"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Numeric and Categorical Splits</span><span class="rm-sub">thresholds, groupings, ID3 vs C4.5 vs CART</span></div></div>
      <div class="rm-item rm-done" data-target="dt-reg"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Regression Trees</span><span class="rm-sub">predicting a number with leaf averages</span></div></div>
      <div class="rm-item rm-done" data-target="dt-overfit"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Overfitting and Instability</span><span class="rm-sub">why a full tree memorises and wobbles</span></div></div>
      <div class="rm-item rm-done" data-target="dt-prune"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Pruning</span><span class="rm-sub">stopping early and cutting back</span></div></div>
      <div class="rm-item rm-done" data-target="dt-missing"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Missing Values</span><span class="rm-sub">what to do when a reading is blank</span></div></div>
      <div class="rm-item rm-done" data-target="dt-geom"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Decision Boundaries and Cost</span><span class="rm-sub">boxes, staircases, and how fast it runs</span></div></div>
      <div class="rm-item rm-done" data-target="dt-mdi"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Feature Importance (MDI)</span><span class="rm-sub">which columns the tree relied on</span></div></div>
      <div class="rm-item rm-done" data-target="dt-practice"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Decision Trees in Practice</span><span class="rm-sub">sklearn, a tree from scratch, when to use one</span></div></div>
      <div class="rm-item rm-done" data-target="dt-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">weights, scaling, probabilities, IDs</span></div></div>
      <div class="rm-item rm-done" data-target="dt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, tables and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dt-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about trees</span></div></div>
    </div>
  </div>

  <h2 id="dt-idea"><span class="num">01</span>A Tree of Questions</h2>
  <p>A college cricket team plays only on some evenings. For 14 days the captain kept a diary: the outlook (sunny, overcast or rain), the temperature (hot, mild or cool), the humidity (high or normal), the wind (weak or strong), and whether the match was played. He also noted three numbers: the humidity reading in %, the temperature in °C, and the turnout, meaning how many club members came to the ground. This is the famous "PlayTennis" table from Ross Quinlan's 1986 paper that introduced decision trees to machine learning, with cricket in place of tennis.</p>
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
  <p>Tomorrow's forecast is "sunny, mild, normal humidity, strong wind". Will they play? The models you met earlier, <a class="xref" data-note="ml_classification">logistic regression</a> for instance, would multiply each column by a weight, add everything up and compare the total with a cut-off. That is one straight boundary through the data. But the captain does not reason by adding things up. He asks a chain of questions: "Is it overcast? Then we play. Is it sunny? Then it depends on the humidity. Is it raining? Then it depends on the wind." Humidity only matters on sunny days, and wind only matters on rainy days. When the effect of one column depends on the value of another like this, it is called an <strong>interaction</strong>, and a weighted sum cannot express it unless you build special columns by hand. A chain of questions expresses it naturally.</p>
  <p>A <strong>decision tree</strong> is exactly such a chain of questions, learnt from data: a model that splits the examples into smaller and smaller groups by asking about one column at a time, and gives one answer for each final group. Think of a doctor's checklist in a busy clinic. The first question ("fever above 101?") rules out the most possibilities, the next question depends on the answer, and after three or four questions the doctor knows what to do. A decision tree is that checklist, except the machine writes it by studying past cases. Here is the tree that the rest of this page will build for the diary:</p>
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
  <p>Trees in machine learning are drawn upside down. The first question at the top is the <strong>root node</strong>; every training row starts there. A question further down is an <strong>internal node</strong> (or decision node), and it only sees the rows that were sent to it. Each line leaving a question is a <strong>branch</strong>, one possible answer. A box with no more questions is a <strong>leaf</strong>, and it holds the answer. The act of dividing a node's rows by a question is a <strong>split</strong>. The <strong>depth</strong> of a node is how many questions were asked to reach it (the root has depth 0), and the depth of the tree is the depth of its deepest leaf, so this tree has depth 2. A tree with just one question is called a <strong>decision stump</strong>.</p>
  <p>Look at the small counts in each box, because they tell the whole story of how trees learn. The root holds all 14 days, mixed: 9 played, 5 not. After one question the Overcast box is perfectly clean (4 played, 0 not), while the Sunny and Rain boxes are still mixed. After a second question every box is clean. Learning a tree means choosing questions that make the boxes clean as quickly as possible. The next two sections turn "clean" into a number so a computer can do the choosing.</p>
  <p>Every path from the root to a leaf is one rule, with its questions joined by AND: "IF Outlook = Sunny AND Humidity = High THEN No". The tree is therefore just nested <code>if/else</code> code, and writing it out makes the idea concrete. <code>play.py</code> holds the diary as a pandas DataFrame named <code>df</code>, indexed D1 to D14; every diary example on this page imports it:</p>
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
  <p>Now the tree as a Python function, checked against all 14 days and then asked about tomorrow:</p>
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
  <p>The function agrees with the diary on all 14 days (the first six are printed), and for tomorrow it walks Outlook → Sunny → Humidity → Normal and answers <strong>Yes</strong>. Notice that the temperature is never asked. The tree decided it was not needed, so a tree does its own <strong>feature selection</strong>: columns that never help are simply never used.</p>
  <p>Prediction always works the same way: start at the root, read the row's value for that node's column, follow the matching branch, and repeat until you reach a leaf. What the leaf returns depends on the task. For classification, the leaf remembers the class counts of the training rows that ended there, say 4 No and 1 Yes; it predicts the majority class ("No"), and if you ask for probabilities it returns the shares (0.8 and 0.2). For regression, where the target is a number, the leaf predicts the mean of its training targets. Only the columns on the row's path are read, so a prediction costs one comparison per level. Written as a formula, a tree divides the space of possible rows into non-overlapping regions R₁ … R_J, one per leaf, and predicts a constant c_j in each: f(x) = Σⱼ c_j · 𝟙[x ∈ R_j], where 𝟙[...] is 1 when the condition is true and 0 otherwise.</p>
  <p>We drew this tree by looking at the answers. A machine needs a rule for choosing each question, and that rule is the subject of the next three sections.</p>

  <h2 id="dt-entropy"><span class="num">02</span>Impurity and Entropy</h2>
  <p>Look at two possible first questions for the diary. "Outlook?" produces three boxes: Sunny with 2 played and 3 not, Overcast with 4 and 0, Rain with 3 and 2. "Wind?" produces two boxes: Weak with 6 and 2, Strong with 3 and 3. Your eye says Outlook is better, because one of its boxes is completely clean. But a computer facing thousands of rows and hundreds of columns cannot use its eye. It needs a score for each box that is 0 when the box holds only one class and largest when the classes are evenly mixed. Such a score is called <strong>impurity</strong>. Think of a box of sweets: a box holding only laddoos is "pure", because you know what you will pull out; a box that is half laddoos and half barfis is as impure as it gets, because you cannot guess.</p>
  <p>Any sensible impurity function should be 0 for a pure box, largest at a 50/50 mix, and symmetric (it should not matter which class we call "Yes"). One more property turns out to matter a lot: the curve should be a smooth dome rather than a tent made of straight lines (mathematicians call this <strong>strictly concave</strong>). Section 04 shows what goes wrong without it. The most famous function with all these properties is entropy.</p>
  <p><strong>Entropy</strong>, borrowed from Claude Shannon's information theory of 1948, measures the average surprise you feel when you pull one row out of a box and look at its class. To define it we first need the surprise of a single outcome. If something has probability p, a certain event (p = 1) should give zero surprise and a rare event a lot. Also, if two independent things happen together, their surprises should add: two heads in a row should be twice as surprising as one. Probabilities of independent events multiply (½ × ½ = ¼), and the only function that turns multiplying into adding is the logarithm. So the surprise of an outcome with probability p is −log₂ p, measured in <strong>bits</strong>. With base 2, surprise counts yes/no questions: an outcome with probability ¼ is one of four equally likely options, and log₂ 4 = 2 questions are enough to identify it. Using the natural log instead would multiply every value by about 0.693 and change nothing about which split wins.</p>
  <p>Entropy is the average of these surprises, weighted by how often each class appears. For a box whose classes have shares p₁, p₂, ..., p_k:</p>
  <p style="text-align:center"><strong>H(S) = −Σᵢ pᵢ log₂ pᵢ</strong></p>
  <p>with the agreement that a class with share 0 adds nothing (0 · log 0 is taken as 0). Let us compute it for the whole diary, 9 Yes and 5 No:</p>
  <table class="tbl">
    <tr><th>Class</th><th>share p</th><th>log₂ p</th><th>−p · log₂ p</th></tr>
    <tr><td>Yes</td><td>9/14 = 0.643</td><td>−0.637</td><td>0.410</td></tr>
    <tr><td>No</td><td>5/14 = 0.357</td><td>−1.485</td><td>0.530</td></tr>
    <tr><td colspan="3"><strong>H = sum</strong></td><td><strong>0.940 bits</strong></td></tr>
  </table>
  <p>(On a calculator, log₂ x = ln x ÷ ln 2; for example ln 0.643 = −0.442, and −0.442 ÷ 0.693 = −0.637.) A cleaner box of 8 and 2 gives 0.8 × 0.322 + 0.2 × 2.322 = 0.722; an even box of 5 and 5 gives the maximum for two classes, exactly 1 bit; a pure box gives 0. With more classes entropy can exceed 1: a box with shares 0.5, 0.25, 0.25 has H = 0.5 × 1 + 0.25 × 2 + 0.25 × 2 = 1.5 bits, and the maximum for k classes is log₂ k. The code below checks these numbers:</p>
  <div class="fx" data-lang="py">import numpy as np
def entropy(counts):
    p = np.array(counts) / sum(counts)       # counts -&gt; shares
    p = p[p &gt; 0]                             # 0 * log 0 is taken as 0
    return float(-(p * np.log2(p)).sum()) + 0.0   # +0.0 turns -0.0 into 0.0

for c in [[5, 5], [8, 2], [9, 5], [10, 0], [6, 3, 3], [4, 4, 4, 4]]:
    print(c, round(entropy(c), 3))
for p in [0.01, 0.1, 0.5, 0.9]:
    print(f"p={p:&lt;4}  surprise(yes)={-np.log2(p):.2f} bits   H={entropy([p, 1-p]):.3f}")</div>
  <div class="fx" data-lang="text">[5, 5] 1.0
[8, 2] 0.722
[9, 5] 0.94
[10, 0] 0.0
[6, 3, 3] 1.5
[4, 4, 4, 4] 2.0
p=0.01  surprise(yes)=6.64 bits   H=0.081
p=0.1   surprise(yes)=3.32 bits   H=0.469
p=0.5   surprise(yes)=1.00 bits   H=1.000
p=0.9   surprise(yes)=0.15 bits   H=0.469</div>
  <p>Every value matches the hand calculations. The last four lines show why entropy measures mixing. When p = 0.01, a "Yes" is very surprising (6.64 bits), but it almost never happens, so the average surprise H is only 0.081. Entropy is high only when surprising outcomes are also common, which is exactly what "mixed" means. Notice also that p = 0.1 and p = 0.9 give the same 0.469: entropy is symmetric. A useful way to remember it: entropy is the average number of yes/no questions you would need to guess the class of a random row from the box. A tree's whole job is to ask questions about the features so that, at the leaves, zero more questions about the class are needed.</p>

  <h2 id="dt-ig"><span class="num">03</span>Information Gain: Building the Tree by Hand</h2>
  <p>Entropy scores one box. To choose a question we need to score a split, which turns one box (the parent) into several smaller boxes (the children). The natural score is how much the impurity drops: the parent's impurity minus the average impurity of the children. That average must be weighted by size, because a pure child holding 1 row is worth far less than a pure child holding 100. This drop is called the <strong>gain</strong> of the split:</p>
  <p style="text-align:center"><strong>gain = i(parent) − Σₖ (nₖ / n) · i(childₖ)</strong></p>
  <p>where i is any impurity function, n is the number of rows in the parent and nₖ the number in child k. When i is entropy, the gain is called <strong>information gain</strong> (IG): the uncertainty about the class that the question removed. (In information theory the same quantity is called mutual information.) Think of the party game "guess the film". A good player first asks "Is it a Hindi film?", which splits the possibilities roughly in half, rather than "Is it Sholay?", which almost always gets "no" and teaches nothing. Information gain picks the question whose answer teaches the most on average.</p>
  <p>The tree-growing algorithm built on this score is short. At a node, if the rows are all one class (or some limit is reached), make a leaf. Otherwise, compute the gain of every possible question, split on the best one, and repeat the same procedure on each child. This is <strong>greedy</strong> (it takes the best question now and never reconsiders), <strong>top-down</strong> (root first) and <strong>recursive</strong> (each child is a smaller copy of the same problem), and it is often called <strong>recursive partitioning</strong>. Greedy is a deliberate compromise: finding the truly smallest tree that fits the data is NP-complete (Hyafil and Rivest proved this in 1976), meaning no known method does it fast, so every practical algorithm settles for "best next question". This is the algorithm of <strong>ID3</strong>, Quinlan's original tree learner.</p>
  <p>Let us run it on the diary. At the root, H = 0.940. For Outlook, the Sunny box (2 Yes, 3 No) has entropy 0.4 × 1.322 + 0.6 × 0.737 = 0.971, the Overcast box is pure (0), and the Rain box (3, 2) also has 0.971. Weighted by size:</p>
  <table class="tbl">
    <tr><th>Outlook value</th><th>Days</th><th>Yes / No</th><th>H</th><th>weight</th><th>weight × H</th></tr>
    <tr><td>Sunny</td><td>D1 D2 D8 D9 D11</td><td>2 / 3</td><td>0.971</td><td>5/14</td><td>0.347</td></tr>
    <tr><td>Overcast</td><td>D3 D7 D12 D13</td><td>4 / 0</td><td>0</td><td>4/14</td><td>0</td></tr>
    <tr><td>Rain</td><td>D4 D5 D6 D10 D14</td><td>3 / 2</td><td>0.971</td><td>5/14</td><td>0.347</td></tr>
    <tr><td colspan="5"><strong>IG(Outlook) = 0.940 − 0.694</strong></td><td><strong>0.247</strong></td></tr>
  </table>
  <p>The same calculation for the other columns gives Humidity: High (3, 4) has H = 0.985 and Normal (6, 1) has H = 0.592, weighted 0.788, so IG = 0.152. Wind: Weak (6, 2) has 0.811, Strong (3, 3) has 1.000, weighted 0.892, IG = 0.048. Temp: Hot (2, 2), Mild (4, 2) and Cool (3, 1) give 1.000, 0.918 and 0.811, weighted 0.911, IG = 0.029. Outlook has the largest gain, so it becomes the root. Its Overcast child is pure, so it becomes a "Yes" leaf. Sunny and Rain are still mixed, so we recurse: inside each, we repeat the search using only that branch's 5 days and only the columns not yet used on this path. The code does all of it:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
def entropy(labels):
    p = labels.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0

def info_gain(data, attr, target="Play"):
    weighted = 0.0
    for value, part in data.groupby(attr):
        weighted += len(part) / len(data) * entropy(part[target])   # size-weighted child entropy
    return entropy(data[target]) - weighted

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
  <p>The root numbers match the hand calculation. Inside the Sunny branch, Humidity has IG 0.971, which equals the branch's entire entropy: it removes all remaining uncertainty, because the three humid sunny days were all "No" and the two normal ones were "Yes". Inside the Rain branch, Wind does the same. Every leaf is now pure, so the recursion stops, and the finished tree is exactly the one drawn in section 01. We built it with nothing but counting and logarithms.</p>
  <p>Greedy search has one famous blind spot. Suppose y is 1 when exactly one of two columns x₁, x₂ is 1 (the XOR pattern). Looked at alone, neither column changes the class mix at all, so both have zero gain at the root, and a tree that stops on zero gain never discovers that a depth-2 tree would be perfect. sklearn does not stop on zero gain by default, and adding an engineered column such as "x₁ XOR x₂" removes the problem.</p>

  <h2 id="dt-gini"><span class="num">04</span>Gain Ratio, Gini and Misclassification Error</h2>
  <p>Information gain has a blind spot of its own. Add a column called Day to the diary, holding D1, D2, ..., D14. Splitting on it makes 14 branches of one day each; every branch is pure, the weighted child entropy is 0, and IG(Day) = 0.940, the largest gain possible. ID3 would put Day at the root and build a tree that is perfect on the 14 training days and useless on day 15, which matches no branch. The same thing happens more quietly with any column that has many distinct values, such as customer IDs, pin codes or exact timestamps: more branches mean smaller groups, and small groups look pure by chance. Think of a teacher who "predicts" marks by roll number because roll number 17 scored 82 last term: perfect memory of the past, no insight about a new student.</p>
  <p>Quinlan's <strong>C4.5</strong> algorithm (1993) fixed this with the <strong>gain ratio</strong>: divide the information gain by the entropy of the branch sizes themselves (ignoring the class), a quantity called <strong>split information</strong>. A split into m equal branches has split information log₂ m, so a split that shatters the data into many small pieces is divided by a large number. For Day it is log₂ 14 = 3.807; for Outlook, with branches of 5, 4 and 5 days, it is 1.577:</p>
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
    print(f"{a:9s} {ig:6.3f} {si:9.3f} {ig/si:9.3f}")</div>
  <div class="fx" data-lang="text">attribute     IG SplitInfo GainRatio
Day        0.940     3.807     0.247
Outlook    0.247     1.577     0.156
Temp       0.029     1.557     0.019
Humidity   0.152     1.000     0.152
Wind       0.048     0.985     0.049</div>
  <p>Read this honestly, because the result is surprising. The gain ratio cuts Day from 0.940 to 0.247, a heavy penalty, yet Day still beats Outlook (0.156). Among the real columns, Outlook now beats Humidity by only 0.156 to 0.152, where information gain had 0.247 to 0.152. So the gain ratio shrinks the advantage of many-valued columns but cannot make an ID column harmless. (C4.5 also first discards columns whose IG is below average, because a split where nearly all rows go one way has tiny split information and an inflated ratio.) The real fix is human: drop identifiers and raw timestamps before training, or turn them into meaningful columns such as day of the week.</p>
  <p>The second alternative score is about speed. Entropy needs a logarithm for every class at every candidate split, and a large tree tries millions of candidates. The <strong>CART</strong> algorithm (Breiman and colleagues, 1984), which is what scikit-learn implements, uses <strong>Gini impurity</strong> instead: the chance that two rows drawn at random (with replacement) from the box belong to different classes. Two draws are both class i with probability pᵢ², so they match with probability Σ pᵢ² and differ with probability</p>
  <p style="text-align:center"><strong>Gini(S) = 1 − Σᵢ pᵢ²</strong></p>
  <p>For the diary root, 1 − (9/14)² − (5/14)² = 1 − 106/196 = 0.459. Its maximum is 0.5 for two classes. (This has nothing to do with the "Gini coefficient" of economics.) CART also makes only <strong>binary</strong> splits, so for Outlook's three values it compares the three ways of dividing them into two groups. "Overcast vs the rest" gives a pure [4, 0] box and an even [5, 5] box with Gini 0.5, so the weighted child Gini is (10/14) × 0.5 = 0.357 and the gain is 0.459 − 0.357 = 0.102:</p>
  <div class="fx" data-lang="py">from play import df
def gini(labels):
    p = labels.value_counts(normalize=True).values
    return 1 - (p ** 2).sum()
def gini_gain(data, groups, target="Play"):
    return gini(data[target]) - sum(len(g) / len(data) * gini(g[target]) for g in groups)

print(f"Gini(S) = {gini(df.Play):.3f}")
for a in ["Outlook", "Temp", "Humidity", "Wind"]:            # one branch per value, like ID3
    print(f"multiway Gini gain {a:8s} {gini_gain(df, [g for _, g in df.groupby(a)]):.3f}")
for left in [["Overcast"], ["Sunny"], ["Rain"]]:             # CART: two-way groupings of Outlook
    m = df.Outlook.isin(left)
    print(f"binary  {str(left):12s} vs rest: Gini gain {gini_gain(df, [df[m], df[~m]]):.3f}")</div>
  <div class="fx" data-lang="text">Gini(S) = 0.459
multiway Gini gain Outlook  0.116
multiway Gini gain Temp     0.019
multiway Gini gain Humidity 0.092
multiway Gini gain Wind     0.031
binary  ['Overcast'] vs rest: Gini gain 0.102
binary  ['Sunny']    vs rest: Gini gain 0.066
binary  ['Rain']     vs rest: Gini gain 0.002</div>
  <p>The ranking of columns is the same as with information gain (Outlook, then Humidity, Wind, Temp). As a binary split, "Overcast vs rest" (0.102) beats Humidity (0.092), so a CART tree also starts with Outlook but peels off only the Overcast days first; you will see exactly that root when we fit sklearn in section 12. The figure below shows why entropy and Gini almost always agree. Gini doubled (dashed) nearly lies on top of entropy. This is no accident: near a pure box, ln p ≈ p − 1, and substituting this into entropy turns it into Σ p(1 − p), which is Gini, so Gini is a polynomial stand-in for entropy.</p>
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
  <p>Does the choice matter in practice? Here a depth-10 tree is fitted with each criterion on the 20,000-customer table that section 07 introduces properly (the times are approximate and depend on the machine):</p>
  <div class="fx" data-lang="py">from common import *
res = {}
for crit in ["gini", "entropy"]:
    t0 = time.perf_counter()
    t = DecisionTreeClassifier(criterion=crit, max_depth=10, random_state=0).fit(Xtr, ytr)
    ms = (time.perf_counter() - t0) * 1000
    res[crit] = t.predict(Xva)
    print(f"{crit:8s} fit {ms:4.0f} ms  root '{Xtr.columns[t.tree_.feature[0]]} &lt;= {t.tree_.threshold[0]:.2f}'"
          f"  leaves {t.get_n_leaves()}  val {t.score(Xva, yva):.3f}")
print(f"same validation prediction on {np.mean(res['gini'] == res['entropy']):.1%} of rows")</div>
  <div class="fx" data-lang="text">gini     fit  168 ms  root 'f5 &lt;= 0.31'  leaves 399  val 0.807
entropy  fit  210 ms  root 'f5 &lt;= 0.31'  leaves 399  val 0.806
same validation prediction on 90.3% of rows</div>
  <p>Same root question, same number of leaves, validation accuracy 0.807 against 0.806. Lower down the trees differ a little, so about one row in ten gets a different answer, but neither is better, and entropy is slightly slower because of the logarithms. Tune the depth and pruning, not the criterion.</p>
  <p>The third candidate looks the most natural of all: <strong>misclassification error</strong>, 1 − max pᵢ, the share of a box that disagrees with its majority class. It is exactly what we care about at the end, so why not grow with it? Look at its curve in the figure: a tent of two straight lines. Inside each half the function is linear, and a linear function of an average equals the average of the function. So whenever both children keep the parent's majority class, the weighted child error equals the parent error and the gain is exactly zero, however useful the split is:</p>
  <div class="fx" data-lang="py">import numpy as np
def shares(c): return np.array(c) / sum(c)
def error(c):   return 1 - shares(c).max()
def gini(c):    return 1 - (shares(c) ** 2).sum()
def entropy(c):
    p = shares(c); p = p[p &gt; 0]
    return float(-(p * np.log2(p)).sum()) + 0.0
def gain(f, parent, kids):
    n = sum(parent)
    return f(parent) - sum(sum(k) / n * f(k) for k in kids)

cases = {"A: [300,100] | [100,300]": ([400, 400], [[300, 100], [100, 300]]),
         "B: [200,400] | [200,0]  ": ([400, 400], [[200, 400], [200, 0]]),
         "diary: Overcast vs rest ": ([9, 5],     [[4, 0], [5, 5]])}
for name, (parent, kids) in cases.items():
    print(name, " ".join(f"{f.__name__} {round(gain(f, parent, kids), 3) + 0.0:.3f}" for f in (error, gini, entropy)))</div>
  <div class="fx" data-lang="text">A: [300,100] | [100,300] error 0.250 gini 0.125 entropy 0.189
B: [200,400] | [200,0]   error 0.250 gini 0.167 entropy 0.311
diary: Overcast vs rest  error 0.000 gini 0.102 entropy 0.226</div>
  <p>Splits A and B both leave 200 of 800 rows on the wrong side, so error scores them equally (0.250), but B creates a pure child of 200 rows that needs no more work, and Gini and entropy both prefer it. The diary line is the striking one. "Overcast vs rest" turns [9, 5] into [4, 0] and [5, 5]. Before the split, predicting "Yes" gets 5 days wrong; after it, the pure box gets none wrong and the [5, 5] box gets 5 wrong, still 5. Error gain 0. Yet this is the split sklearn puts at the root, because it isolates 4 certain days and leaves an even box that the next question (Humidity) cleans up. Growing a tree is a search that needs a sensitive signal, one that rewards "purer than before" even when the majority vote has not changed yet. The smooth dome of entropy and Gini gives that signal; the flat pieces of the error tent do not. Error is still the right thing to measure after growing, which is why classic pruning methods use it.</p>

  <h2 id="dt-split"><span class="num">05</span>Numeric and Categorical Splits</h2>
  <p>So far every column was a category. The captain's humidity reading is a number between 65 and 96, and a number cannot get one branch per value: 86% would get its own branch, which is the ID-column problem again. Instead, C4.5 and CART ask a two-way question, <strong>"x ≤ t?"</strong>, and the only job is to choose the <strong>threshold</strong> t. Between two neighbouring values in the sorted data, every t gives the same split: if two neighbouring readings are 80 and 85, then t = 81, 82.5 and 84.9 all send the same days left. So with m distinct values there are only m − 1 different splits, and by convention the tree uses the <strong>midpoint</strong> between neighbours, which puts the boundary halfway between the two closest training rows.</p>
  <p>The procedure is: sort the rows by x once, try each midpoint, score its weighted impurity, keep the best. The diary has 14 readings but only 10 distinct values, so 9 candidates. Two by hand with Gini (parent 0.459). At t = 82.5 the left side holds the 7 days at or below 80, [6 Yes, 1 No], Gini 1 − (6/7)² − (1/7)² = 0.245; the right side holds the 7 days from 85 up, [3, 4], Gini 0.490; weighted 0.5 × 0.245 + 0.5 × 0.490 = 0.367. At t = 88 the left side holds 9 days [7, 2] with Gini 0.346 and the right 5 days [2, 3] with Gini 0.480; weighted (9/14)(0.346) + (5/14)(0.480) = 0.394. Lower is better, so 82.5 wins. The code scores all nine:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier
from play import df
x = df.HumPct.values                                 # humidity reading, %
y = (df.Play == "Yes").astype(int).values            # 1 = played
def gini(v):
    p = v.mean()
    return 1 - p ** 2 - (1 - p) ** 2

order = np.argsort(x, kind="stable")                 # step 1: sort once
xs, ys = x[order], y[order]
print("sorted x:", xs.tolist())
print("played:  ", ys.tolist())
vals = np.unique(xs)
for t in (vals[:-1] + vals[1:]) / 2:                 # step 2: midpoints between distinct values
    L, R = ys[xs &lt;= t], ys[xs &gt; t]
    wg = len(L) / 14 * gini(L) + len(R) / 14 * gini(R)
    print(f"x &lt;= {t:4.1f}: left [{L.sum()} Y, {len(L) - L.sum()} N] right [{R.sum()} Y, {len(R) - R.sum()} N]"
          f"  weighted Gini {wg:.3f}  gain {gini(ys) - wg:.3f}")
t = DecisionTreeClassifier(max_depth=1).fit(df[["HumPct"]], df.Play)
print("sklearn root threshold:", t.tree_.threshold[0])</div>
  <div class="fx" data-lang="text">sorted x: [65, 70, 70, 70, 75, 80, 80, 85, 86, 90, 90, 91, 95, 96]
played:   [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1]
x &lt;= 67.5: left [1 Y, 0 N] right [8 Y, 5 N]  weighted Gini 0.440  gain 0.020
x &lt;= 72.5: left [3 Y, 1 N] right [6 Y, 4 N]  weighted Gini 0.450  gain 0.009
x &lt;= 77.5: left [4 Y, 1 N] right [5 Y, 4 N]  weighted Gini 0.432  gain 0.027
x &lt;= 82.5: left [6 Y, 1 N] right [3 Y, 4 N]  weighted Gini 0.367  gain 0.092
x &lt;= 85.5: left [6 Y, 2 N] right [3 Y, 3 N]  weighted Gini 0.429  gain 0.031
x &lt;= 88.0: left [7 Y, 2 N] right [2 Y, 3 N]  weighted Gini 0.394  gain 0.066
x &lt;= 90.5: left [8 Y, 3 N] right [1 Y, 2 N]  weighted Gini 0.407  gain 0.052
x &lt;= 93.0: left [8 Y, 4 N] right [1 Y, 1 N]  weighted Gini 0.452  gain 0.007
x &lt;= 95.5: left [8 Y, 5 N] right [1 Y, 0 N]  weighted Gini 0.440  gain 0.020
sklearn root threshold: 82.5</div>
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
  <p>The scan agrees: 82.5 has the lowest weighted Gini (0.367) and sklearn's one-question tree uses exactly 82.5, the midpoint of 80 and 85. That cut separates the "Normal" humidity days from the "High" ones perfectly, so the numeric column rediscovered the category by itself. Two efficiency points matter at scale. First, once the rows are sorted, moving the cut one step right moves just one row from the right group to the left, so the class counts can be updated instead of recounted, and one column at one node costs a sort plus a single pass. Second, only cuts where the class changes can ever win: 77.5 sits between days that were all played and 93 between days that were all not played, and neither can be best (Fayyad and Irani proved this in 1992). Fast libraries such as <a class="xref" data-note="ml_lightgbm">LightGBM</a> go further and try only a few hundred histogram bin edges instead of every midpoint.</p>
  <p>Because a tree only asks "x ≤ t", it cares about the <em>order</em> of the values, never their scale. Standardising, taking logs or any other change that keeps the order leaves the splits and predictions unchanged (only the printed thresholds change), so scaling features for a tree is wasted effort.</p>
  <p>A category such as Outlook has no order, so "x ≤ t" makes no sense. A binary tree must instead choose which values go left and which go right. With k values there are 2^(k−1) − 1 different groupings: each value can go left or right (2^k ways), swapping the two sides gives the same split (divide by 2), and "everything on one side" is useless (subtract 1). Outlook has 3 groupings, which section 04 already scored; 10 values give 511 groupings; 30 values give over 500 million. For a two-class target there is a shortcut proved in the CART book: <strong>sort the values by their share of class 1, and the best grouping is always one of the k − 1 cuts of that sorted list</strong>. The category becomes an ordered number, and it is the numeric case again. On the diary, the play-rates are Sunny 0.4, Rain 0.6, Overcast 1.0; the two cuts of that order are {Sunny} | {Rain, Overcast} and {Sunny, Rain} | {Overcast}, and the second is the 0.102 winner found by trying all three. With four cities the saving is easier to see:</p>
  <div class="fx" data-lang="py">from itertools import combinations
counts = {"Delhi": (8, 2), "Mumbai": (2, 8), "Pune": (5, 5), "Chennai": (1, 9)}   # (churn, stay)
def gini(c, s):
    n = c + s
    return 1 - (c / n) ** 2 - (s / n) ** 2
def split_gain(left):
    L = [sum(counts[k][i] for k in left) for i in (0, 1)]
    R = [sum(counts[k][i] for k in counts if k not in left) for i in (0, 1)]
    return gini(16, 24) - sum(L) / 40 * gini(*L) - sum(R) / 40 * gini(*R)

cities = list(counts)
tried = [left for r in (1, 2) for left in combinations(cities, r)
         if r == 1 or "Delhi" in left]                    # {A,B}|{C,D} = {C,D}|{A,B}: count once
for left in tried:
    print(f"{'{' + ', '.join(left) + '}':18s} vs rest  gain {split_gain(left):.4f}")
print("groupings tried:", len(tried), "= 2^(k-1) - 1")
order = sorted(cities, key=lambda c: counts[c][0] / sum(counts[c]))   # sort by churn rate
print("sorted by churn rate:", order)
for i in range(1, len(order)):
    print(f"prefix split {order[:i]} | {order[i:]}  gain {split_gain(tuple(order[:i])):.4f}")</div>
  <div class="fx" data-lang="text">{Delhi}            vs rest  gain 0.1067
{Mumbai}           vs rest  gain 0.0267
{Pune}             vs rest  gain 0.0067
{Chennai}          vs rest  gain 0.0600
{Delhi, Mumbai}    vs rest  gain 0.0200
{Delhi, Pune}      vs rest  gain 0.1250
{Delhi, Chennai}   vs rest  gain 0.0050
groupings tried: 7 = 2^(k-1) - 1
sorted by churn rate: ['Chennai', 'Mumbai', 'Pune', 'Delhi']
prefix split ['Chennai'] | ['Mumbai', 'Pune', 'Delhi']  gain 0.0600
prefix split ['Chennai', 'Mumbai'] | ['Pune', 'Delhi']  gain 0.1250
prefix split ['Chennai', 'Mumbai', 'Pune'] | ['Delhi']  gain 0.1067</div>
  <p>Brute force over all 7 groupings finds {Delhi, Pune} vs the rest (gain 0.125). Sorting the cities by churn rate (Chennai 0.1, Mumbai 0.2, Pune 0.5, Delhi 0.8) and trying only the 3 cuts finds the same grouping with the same gain. For 30 cities that is 29 tries instead of 536,870,911. (For three or more classes no exact shortcut exists, and libraries use heuristics.)</p>
  <p>scikit-learn's trees accept only numbers, so you must encode categories yourself, and the encoding changes what the tree can do in a few splits. <strong>One-hot encoding</strong> (one 0/1 column per value) lets each split peel off only one value. <strong>Arbitrary integer codes</strong> (Delhi = 0, Mumbai = 1, ...) impose a fake order. <strong>Ordering by target rate</strong> (replacing each city by its churn rate on the training rows, called target encoding) is the CART shortcut done by hand. Here 20 cities, 8 of them risky, are tried all three ways, with and without a depth limit of 2:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
rng = np.random.default_rng(0)
city = rng.integers(0, 20, 4000)                     # 20 cities, coded 0..19 in random order
risky = np.isin(city, [1, 4, 6, 9, 12, 13, 17, 19])  # 8 "risky" cities churn more
y = (rng.random(4000) &lt; np.where(risky, 0.7, 0.2)).astype(int)
df = pd.DataFrame({"city": city.astype(str), "y": y})
tr, te = train_test_split(df, test_size=0.5, random_state=0)

def fit(Xtr, Xte, name):
    for d in [None, 2]:
        t = DecisionTreeClassifier(max_depth=d, min_samples_leaf=20, random_state=0).fit(Xtr, tr.y)
        print(f"{name:22s} max_depth={str(d):4s} depth {t.get_depth():2d}  test acc {t.score(Xte, te.y):.3f}")

oh_tr = pd.get_dummies(tr.city); oh_te = pd.get_dummies(te.city).reindex(columns=oh_tr.columns, fill_value=0)
fit(oh_tr, oh_te, "one-hot")
fit(tr[["city"]].astype(int), te[["city"]].astype(int), "arbitrary codes")
rate = tr.groupby("city").y.mean()                    # churn rate per city, TRAIN rows only
fit(tr.city.map(rate).to_frame(), te.city.map(rate).to_frame(), "ordered by churn rate")</div>
  <div class="fx" data-lang="text">one-hot                max_depth=None depth 19  test acc 0.758
one-hot                max_depth=2    depth  2  test acc 0.626
arbitrary codes        max_depth=None depth 11  test acc 0.758
arbitrary codes        max_depth=2    depth  2  test acc 0.621
ordered by churn rate  max_depth=None depth  6  test acc 0.758
ordered by churn rate  max_depth=2    depth  2  test acc 0.758</div>
  <p>With no depth limit all three reach 0.758, but one-hot needs a depth-19 tree and arbitrary codes 11, while the ordered encoding needs 6. With depth limited to 2, one-hot and arbitrary codes collapse to 0.626 and 0.621 because they can collect only a couple of risky cities, while the ordered encoding still separates risky from safe. Real trees are always limited in depth, so the encoding matters. One warning: target rates computed on the same rows the tree trains on leak the answer, worst for rare categories (a city with one customer gets a rate of exactly 0 or 1). Compute them on training folds only, or use a library built for this, such as <a class="xref" data-note="ml_catboost">CatBoost</a>.</p>
  <p>We can now place the three classic algorithms that interviewers ask about. All three grow greedily and top-down with the loop of section 03; they differ in the score, the shape of the splits and the extras:</p>
  <table class="tbl">
    <tr><th></th><th>ID3 (Quinlan 1986)</th><th>C4.5 (Quinlan 1993)</th><th>CART (Breiman et al. 1984)</th><th>scikit-learn</th></tr>
    <tr><td>Split score</td><td>information gain</td><td>gain ratio</td><td>Gini (classes), squared error (numbers)</td><td>gini, entropy; squared_error, absolute_error, poisson</td></tr>
    <tr><td>Split shape</td><td>one branch per value</td><td>per value for categories, binary for numbers</td><td>always binary</td><td>always binary</td></tr>
    <tr><td>Numeric columns</td><td>no (bin them first)</td><td>yes, x ≤ t</td><td>yes, x ≤ t</td><td>yes (numbers only)</td></tr>
    <tr><td>Categorical columns</td><td>yes</td><td>yes</td><td>yes, best grouping into two sets</td><td>no, you must encode</td></tr>
    <tr><td>Regression</td><td>no</td><td>no</td><td>yes</td><td>yes</td></tr>
    <tr><td>Missing values</td><td>no</td><td>fractional rows</td><td>surrogate splits</td><td>learns a side for NaN</td></tr>
    <tr><td>Pruning</td><td>none</td><td>pessimistic error pruning</td><td>cost-complexity, α by cross-validation</td><td>stopping rules + <code>ccp_alpha</code></td></tr>
  </table>
  <p>Binary splits won in every modern library (scikit-learn, XGBoost, LightGBM, CatBoost) because a two-way split on a 50-value column cannot shatter the data into 50 tiny groups in one step, any multiway split can be built from a few binary ones, and numbers give binary questions naturally. Note that setting <code>criterion="entropy"</code> in scikit-learn does not make it C4.5: it is still CART, with only the impurity function changed. Missing values and pruning appear in sections 08 and 09.</p>

  <h2 id="dt-reg"><span class="num">06</span>Regression Trees</h2>
  <p>So far the target was a class, and impurity counted classes. The captain's turnout (how many members came, between 20 and 48) is a number, so there are no classes to count. For a numeric target, a "pure" box is one where all the numbers are close together, and the natural measure of spread is the <strong>variance</strong>: the average squared distance from the mean, which is also the mean squared error (MSE) you get by predicting the mean. A <strong>regression tree</strong> chooses the split that most reduces the size-weighted variance of the children, and each leaf predicts the mean of its training rows, because the mean is the single number that minimises squared error. Think of an estate agent pricing a flat by asking "which locality? how many bedrooms?" until the remaining flats are similar, then quoting their average price.</p>
  <p>By hand, with humidity as the only question. The 14 turnouts sum to 476, so the mean is 34; the squared deviations from 34 add up to 1280, so the parent MSE is 1280 / 14 = 91.43. Split at 82.5: the seven normal-humidity days (44, 22, 42, 40, 46, 38, 48) have mean 40 and squared deviations 16 + 324 + 4 + 0 + 36 + 4 + 64 = 448, MSE 64; the seven humid days (24, 20, 36, 32, 26, 38, 20) have mean 28 and squared deviations 328, MSE 46.86. Weighted: 0.5 × 64 + 0.5 × 46.86 = 55.43, a reduction of 91.43 − 55.43 = 36.0. The code tries every threshold:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor, export_text
from play import df
x = df.HumPct.values                                 # humidity, %
y = df.Turnout.values.astype(float)                  # members who came to the ground
def mse(v): return ((v - v.mean()) ** 2).mean()
print(f"parent: mean {y.mean():.2f}  MSE {mse(y):.2f}")
vals = np.unique(x)
for t in (vals[:-1] + vals[1:]) / 2:
    L, R = y[x &lt;= t], y[x &gt; t]
    w = len(L) / len(y) * mse(L) + len(R) / len(y) * mse(R)
    print(f"x &lt;= {t:4.1f}: left mean {L.mean():5.2f} | right mean {R.mean():5.2f} | weighted MSE {w:5.2f}"
          f"  reduction {mse(y) - w:5.2f}")
t = DecisionTreeRegressor(max_depth=1).fit(df[["HumPct"]], y)
print(export_text(t, feature_names=["HumPct"]))
print("predict humidity 50, 85 and 100:", t.predict(np.array([[50], [85], [100]])))</div>
  <div class="fx" data-lang="text">parent: mean 34.00  MSE 91.43
x &lt;= 67.5: left mean 42.00 | right mean 33.38 | weighted MSE 86.51  reduction  4.92
x &lt;= 72.5: left mean 35.50 | right mean 33.40 | weighted MSE 90.53  reduction  0.90
x &lt;= 77.5: left mean 38.00 | right mean 31.78 | weighted MSE 82.54  reduction  8.89
x &lt;= 82.5: left mean 40.00 | right mean 28.00 | weighted MSE 55.43  reduction 36.00
x &lt;= 85.5: left mean 38.00 | right mean 28.67 | weighted MSE 70.10  reduction 21.33
x &lt;= 88.0: left mean 37.78 | right mean 27.20 | weighted MSE 65.74  reduction 25.69
x &lt;= 90.5: left mean 36.18 | right mean 26.00 | weighted MSE 73.97  reduction 17.45
x &lt;= 93.0: left mean 34.83 | right mean 29.00 | weighted MSE 87.26  reduction  4.17
x &lt;= 95.5: left mean 34.15 | right mean 32.00 | weighted MSE 91.12  reduction  0.31
|--- HumPct &lt;= 82.50
|   |--- value: [40.00]
|--- HumPct &gt;  82.50
|   |--- value: [28.00]

predict humidity 50, 85 and 100: [40. 28. 28.]</div>
  <p>82.5 wins again, with a reduction of 36.0, and sklearn's one-question regression tree uses the same cut with leaf values 40 and 28, the two means. Humidity drives both whether they play and how many come. The last line shows the most important limit of regression trees: a humidity of 100% is outside anything in the diary, yet the prediction is 28, the same as for 85%, and 50% gets 40, the same as 65%. The output is always one of the leaf means, so a regression tree is a flat step function that <strong>cannot extrapolate</strong>: it will never predict above its largest leaf mean or below its smallest. Using a tree alone to forecast something that keeps growing, like monthly sales, flattens the forecast at the last level it saw.</p>
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
  <p>Squared error is not the only choice. With <code>criterion="absolute_error"</code> the tree minimises the sum of |y − c|, and the best constant in a leaf is the <strong>median</strong> instead of the mean, which makes leaves robust to outliers. The normal-humidity leaf has one: D6, a cold, windy, rainy evening when only 22 members came.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from play import df
leaf = df[df.HumPct &lt;= 82.5].Turnout.values.astype(float)   # the normal-humidity leaf
print("turnouts in the leaf:", leaf.tolist())
X = np.zeros((len(leaf), 1))                                # one leaf: no split possible
for crit in ["squared_error", "absolute_error"]:
    t = DecisionTreeRegressor(criterion=crit).fit(X, leaf)
    print(f"{crit:15s} leaf value = {t.predict([[0]])[0]}")
for c in [40, 42]:
    print(f"constant {c}: total |error| {np.abs(leaf - c).sum():5.1f}   total squared error {((leaf - c)**2).sum():6.1f}")</div>
  <div class="fx" data-lang="text">turnouts in the leaf: [44.0, 22.0, 42.0, 40.0, 46.0, 38.0, 48.0]
squared_error   leaf value = 40.0
absolute_error  leaf value = 42.0
constant 40: total |error|  40.0   total squared error  448.0
constant 42: total |error|  38.0   total squared error  476.0</div>
  <p>Squared error picks the mean 40, pulled down by D6 alone; absolute error picks the median 42, which does not care how far below the others D6 sits. The last two lines confirm each is optimal for its own loss: 42 has the smaller total absolute error, 40 the smaller total squared error. sklearn also offers <code>poisson</code> for counts such as claims or visits, and <code>friedman_mse</code>, used inside gradient boosting. Remember regression trees even if you only care about classification: <a class="xref" data-note="ml_gbm">gradient boosting</a> builds every model, classifiers included, out of small regression trees.</p>

  <h2 id="dt-overfit"><span class="num">07</span>Overfitting and Instability</h2>
  <p>The growing loop never stops by itself until every leaf is pure. On the 14 diary days that looked harmless: five clean rules. To see what happens on realistic, noisy data we need more rows, so from here on we also use a shared customer-churn table that all the tree notes use, which keeps their numbers comparable. It is synthetic: 20,000 customers with 12 columns made by sklearn's <code>make_classification</code> (6 carry real signal, 2 are mixtures of those, 4 are useless), plus two pure-noise columns, <code>row_noise</code> (20,000 different random values) and <code>coin_noise</code> (random 0 or 1). 5% of the labels are flipped at random, so no model can pass about 0.95. It is split into 12,000 training rows, 3,000 validation rows for choosing settings, and 5,000 test rows. The file <code>common.py</code> builds it:</p>
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
  <p>Now grow trees of increasing depth and score each on the rows it learnt from (train) and on rows it never saw (validation):</p>
  <div class="fx" data-lang="py">from common import *
for d in [1, 3, 6, 10, 15, None]:
    t = DecisionTreeClassifier(max_depth=d, random_state=0).fit(Xtr, ytr)
    print(f"max_depth={str(d):5s} depth={t.get_depth():2d} leaves={t.get_n_leaves():5d}"
          f"  train {t.score(Xtr, ytr):.3f}  val {t.score(Xva, yva):.3f}")
full = DecisionTreeClassifier(random_state=0).fit(Xtr, ytr)
sizes = np.bincount(full.apply(Xtr))                    # training rows that land in each leaf
print(f"full tree: {np.mean(sizes[sizes &gt; 0] &lt;= 2):.0%} of its leaves hold 1 or 2 training rows")</div>
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
  <p>A tree of depth 1 is too simple and <strong>underfits</strong>: 0.60 on both sets. Depth 10 is the sweet spot at 0.807 on validation. Beyond it, training accuracy keeps climbing to a perfect 1.000 while validation falls back to 0.773. The unlimited tree is 31 levels deep with 1,413 leaves, and more than half of those leaves hold only one or two customers. A leaf with one customer is a rule like "bill between 41.3 and 41.5, tenure 17, age 33 → churn": it describes one person, not a pattern, and it faithfully memorised the 5% of flipped labels too. That is <strong>overfitting</strong>. Think of preparing for an exam with last year's paper: learning the chapters is the depth-10 tree; memorising "question 7, answer (c)" is the 1,413-leaf tree, perfect on last year's paper and useless on this year's.</p>
  <p>Overfitting has a twin, which is easiest to see on the diary. Remove one day at a time and choose the root again:</p>
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
  <p>Removing D3 (an overcast, humid day when they played) leaves Outlook with 0.214 and Humidity with 0.219, so Humidity becomes the root and every question below it changes. Removing D6 or D12 does the same. Thirteen of the fourteen days are identical, yet the model is different. This is <strong>instability</strong>, and it comes from two splits with nearly equal gain at the top of a greedy search: a few rows more or less flip the winner, and because the search is hierarchical, the change at the top propagates to every node below. The same happens at scale. Five analysts each take a different random 80% of the same 12,000 customers and grow a full tree:</p>
  <div class="fx" data-lang="py">from common import *
rng = np.random.default_rng(1)
preds = []
for k in range(5):
    idx = rng.choice(len(Xtr), size=len(Xtr) * 8 // 10, replace=False)   # a different 80% of the rows
    t = DecisionTreeClassifier(random_state=0).fit(Xtr.iloc[idx], ytr[idx])
    s = t.tree_; L = s.children_left[0]                    # node 0 = first question, L = its "yes" child
    q = lambda i: f"{Xtr.columns[s.feature[i]]} &lt;= {s.threshold[i]:.2f}"
    p = t.predict(Xva); preds.append(p)
    print(f"tree {k+1}: 1st q '{q(0)}'  2nd q '{q(L)}'  val {np.mean(p == yva):.3f}")
P = np.array(preds)
print(f"validation rows where the 5 trees do not all agree: {np.mean(P.min(0) != P.max(0)):.1%}")</div>
  <div class="fx" data-lang="text">tree 1: 1st q 'f5 &lt;= 0.31'  2nd q 'f3 &lt;= -0.63'  val 0.779
tree 2: 1st q 'f5 &lt;= 0.31'  2nd q 'f6 &lt;= -1.03'  val 0.774
tree 3: 1st q 'f5 &lt;= 0.30'  2nd q 'f3 &lt;= -0.53'  val 0.776
tree 4: 1st q 'f5 &lt;= 0.05'  2nd q 'f6 &lt;= -1.13'  val 0.791
tree 5: 1st q 'f5 &lt;= -0.09'  2nd q 'f6 &lt;= -1.13'  val 0.779
validation rows where the 5 trees do not all agree: 50.0%</div>
  <p>All five ask about <code>f5</code> first, but the cut-off moves from 0.31 to −0.09. A different first cut sends different rows to the second question, which therefore changes (<code>f3</code> in some trees, <code>f6</code> in others), and everything below changes after that. Each tree scores about 0.78, yet the five disagree on half of the validation customers.</p>
  <p>Statisticians describe this with two words from <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>. The <strong>variance</strong> of a learning method is how much its predictions change when it is trained on a different sample from the same population; the <strong>bias</strong> is the error that remains even when averaged over many training samples. A deep tree has <strong>low bias and high variance</strong>; a stump has <strong>high bias and low variance</strong>. Expected squared error is bias² + variance + irreducible noise. High variance is bad for one tree, but it is also what makes trees good team players: their mistakes are partly random, and random mistakes cancel when many trees vote. That observation is the starting point of <a class="xref" data-note="ml_ensembles">Ensemble Learning</a> and <a class="xref" data-note="ml_rf">Random Forest</a>. Within a single tree, the tool against overfitting is pruning.</p>

  <h2 id="dt-prune"><span class="num">08</span>Pruning</h2>
  <p>There are two ways to stop a tree from memorising: refuse to grow branches that look unpromising (<strong>pre-pruning</strong>, also called early stopping), or grow the full tree and then cut back the branches that do not earn their place (<strong>post-pruning</strong>). Think of a gardener: pre-pruning is deciding in spring which shoots may grow; post-pruning is cutting back in autumn, when you can see which branches actually bore fruit.</p>
  <p>Pre-pruning in scikit-learn is a set of limits, and a node becomes a leaf as soon as any limit says so, even if it is not pure. <code>max_depth</code> caps the number of questions on any path. <code>min_samples_split</code> refuses to split a node with fewer rows than this. <code>min_samples_leaf</code> refuses any split that would leave a child with fewer rows than this, so every leaf is backed by enough data. <code>min_impurity_decrease</code> refuses splits whose weighted impurity drop, (n_node / N) × gain, is below a threshold. <code>max_leaf_nodes</code> caps the number of leaves and switches growth to best-first, spending each new leaf where the gain is largest anywhere in the tree. On the diary, <code>max_depth=1</code> keeps only the Outlook question (Sunny → No, Overcast → Yes, Rain → Yes) and is right on 10 of the 14 days, and <code>min_samples_leaf=3</code> would forbid the two-day leaves under Sunny and Rain. On the churn data, one setting at a time:</p>
  <div class="fx" data-lang="py">from common import *
def show(**kw):
    t = DecisionTreeClassifier(random_state=0, **kw).fit(Xtr, ytr)
    k, v = list(kw.items())[0]
    print(f"{k}={str(v):6s} depth {t.get_depth():2d} leaves {t.get_n_leaves():5d}"
          f"  train {t.score(Xtr, ytr):.3f}  val {t.score(Xva, yva):.3f}")
for v in [1, 5, 20, 200]:              show(min_samples_leaf=v)
for v in [20, 100]:                    show(min_samples_split=v)
for v in [0.0005, 0.005]:              show(min_impurity_decrease=v)
for v in [32, 128]:                    show(max_leaf_nodes=v)
show(max_features="sqrt")</div>
  <div class="fx" data-lang="text">min_samples_leaf=1      depth 31 leaves  1413  train 1.000  val 0.773
min_samples_leaf=5      depth 28 leaves   889  train 0.926  val 0.806
min_samples_leaf=20     depth 22 leaves   371  train 0.854  val 0.799
min_samples_leaf=200    depth 13 leaves    46  train 0.748  val 0.742
min_samples_split=20     depth 28 leaves   788  train 0.921  val 0.788
min_samples_split=100    depth 27 leaves   271  train 0.837  val 0.803
min_impurity_decrease=0.0005 depth 14 leaves   112  train 0.835  val 0.803
min_impurity_decrease=0.005  depth  5 leaves    13  train 0.724  val 0.727
max_leaf_nodes=32     depth  9 leaves    32  train 0.779  val 0.772
max_leaf_nodes=128    depth 14 leaves   128  train 0.847  val 0.809
max_features=sqrt   depth 29 leaves  1988  train 1.000  val 0.752</div>
  <p><code>min_samples_leaf=5</code> alone lifts validation from 0.773 to 0.806 and cuts the leaves from 1,413 to 889: forbidding tiny leaves removes most of the memorising, which makes it the best general-purpose knob. Push it to 200 and the tree underfits (0.742). <code>min_samples_split</code> is weaker, because a node of 100 rows may still produce a 1-row leaf. <code>min_impurity_decrease=0.0005</code> gives a compact 112-leaf tree at 0.803, and <code>max_leaf_nodes=128</code> gives the best line, 0.809, because best-first growth spends its leaves where they help most. The last line is a warning: <code>max_features="sqrt"</code> does not prune at all. Each split looks at only 3 random columns, makes worse choices and grows a bigger tree (0.752). Inside a <a class="xref" data-note="ml_rf">random forest</a> that randomness is useful; in a single tree it hurts.</p>
  <p>Pre-pruning has one weakness, called the <strong>horizon effect</strong>: a split that looks useless now may enable a great split below it (the XOR case of section 03, or "Overcast vs rest" in section 04, which has zero error gain but sets up a perfect next question). A strict limit stops right there and never sees the good split. Post-pruning avoids this by growing first and judging afterwards.</p>
  <p>The simplest post-pruning is <strong>reduced-error pruning</strong> (Quinlan, 1987): keep a validation set aside and, from the bottom of the tree upwards, replace any subtree by a single leaf if that does not increase the validation errors. It is easy to explain but spends data on the validation set. The method used by CART and scikit-learn is <strong>cost-complexity pruning</strong>, also called weakest-link pruning. Its idea is that a tree should pay a price for every leaf it keeps. For any subtree T of the full tree, define</p>
  <p style="text-align:center"><strong>R_α(T) = R(T) + α · |T|</strong></p>
  <p>where R(T) is the tree's training error (in scikit-learn, the total impurity of the leaves, each weighted by its share of rows), |T| is the number of leaves, and α ≥ 0 is the price per leaf. With α = 0 the full tree wins; with a huge α only the root survives. In between, which branch should go first? Compare an internal node t kept with its branch T_t, costing R(T_t) + α|T_t|, against t turned into a single leaf, costing R(t) + α. They cost the same when</p>
  <p style="text-align:center"><strong>g(t) = (R(t) − R(T_t)) / (|T_t| − 1)</strong></p>
  <p>which is the error the branch saves per extra leaf it uses. The branch with the smallest g is the <strong>weakest link</strong>: it buys the least improvement for its leaves. Pruning cuts it, that g becomes the next α, the g values are recomputed, and the process repeats until only the root is left. The result is a nested sequence of ever-smaller trees, one for each range of α, and cross-validation picks among them.</p>
  <p>Work it on the diary tree from section 03, counting training errors out of 14. The full tree makes 0 errors with 5 leaves. The Sunny node, turned into a leaf, would predict "No" and get 2 days wrong, so g = (2/14 − 0)/(2 − 1) = 0.143; the Rain node is the same, 0.143. The root, turned into a leaf predicting "Yes", gets 5 days wrong, and its branch has 5 leaves, so g = (5/14 − 0)/(5 − 1) = 0.089. Surprisingly, the weakest link is the root itself: the whole tree spends 4 extra leaves to save 5 errors, only 0.089 per leaf, while each second-level branch saves 0.143 for its one extra leaf. So for α below 0.089 the full tree is best, and from 0.089 on the best tree is the bare root, "always say Yes". Check at α = 0.1: the full tree costs 0 + 5 × 0.1 = 0.5, the root 5/14 + 0.1 = 0.457, so the root wins. sklearn does the same with Gini on its own binary version of the diary tree:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int); y = df.Play
clf = DecisionTreeClassifier(random_state=0).fit(X, y)              # full CART tree, Gini
s = clf.tree_
R = s.impurity * s.weighted_n_node_samples / s.weighted_n_node_samples[0]   # R(t) = (n_t / N) * Gini(t)
def leaves(i):
    l, r = s.children_left[i], s.children_right[i]
    return [i] if l == -1 else leaves(l) + leaves(r)
for i in range(s.node_count):
    if s.children_left[i] != -1:                                     # internal nodes only
        L = leaves(i)
        print(f"node {i} {X.columns[s.feature[i]]:16s} R(t)={R[i]:.4f}  leaves {len(L)}"
              f"  g(t)={(R[i] - R[L].sum()) / (len(L) - 1):.4f}")
print("sklearn path alphas:", np.round(clf.cost_complexity_pruning_path(X, y).ccp_alphas, 4))</div>
  <div class="fx" data-lang="text">node 0 Outlook_Overcast R(t)=0.4592  leaves 7  g(t)=0.0765
node 1 Humidity_Normal  R(t)=0.3571  leaves 6  g(t)=0.0714
node 2 Outlook_Rain     R(t)=0.1143  leaves 3  g(t)=0.0571
node 4 Wind_Strong      R(t)=0.0714  leaves 2  g(t)=0.0714
node 7 Wind_Weak        R(t)=0.1143  leaves 3  g(t)=0.0571
node 8 Temp_Cool        R(t)=0.0714  leaves 2  g(t)=0.0714
sklearn path alphas: [0.     0.0571 0.0571 0.1153]</div>
  <p>Nodes 2 and 7 tie for the smallest g, 0.0571 (each has 3 pure leaves under a node with weighted Gini 0.1143, so 0.1143 / 2 per extra leaf), so both are pruned at α = 0.0571, which is why sklearn lists that value twice. After that, the root's branch has only 3 leaves left, with total R = 0.2286, so the root's g becomes (0.4592 − 0.2286)/2 = 0.1153, smaller than node 1's new value; the root goes next, at α = 0.1153, sklearn's last value. A parent can become the weakest link before its own child, which is why g must be recomputed after every cut. On the churn data, cross-validation chooses α:</p>
  <div class="fx" data-lang="py">from common import *
from sklearn.model_selection import cross_val_score
path = DecisionTreeClassifier(random_state=0).cost_complexity_pruning_path(Xtr, ytr)
print(f"{len(path.ccp_alphas)} trees on the path, alpha from 0 to {path.ccp_alphas[-1]:.4f}")
cands = np.unique(np.quantile(path.ccp_alphas, np.linspace(0.5, 0.995, 8)))   # 8 candidate alphas
cv = [cross_val_score(DecisionTreeClassifier(ccp_alpha=a, random_state=0), Xtr, ytr, cv=5).mean()
      for a in cands]
for a, s in zip(cands, cv):
    print(f"alpha {a:.6f}  5-fold CV acc {s:.3f}")
best = cands[int(np.argmax(cv))]
t = DecisionTreeClassifier(ccp_alpha=best, random_state=0).fit(Xtr, ytr)
print(f"chosen alpha {best:.6f}: leaves {t.get_n_leaves()}  val {t.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">784 trees on the path, alpha from 0 to 0.0213
alpha 0.000165  5-fold CV acc 0.780
alpha 0.000207  5-fold CV acc 0.790
alpha 0.000234  5-fold CV acc 0.793
alpha 0.000269  5-fold CV acc 0.795
alpha 0.000333  5-fold CV acc 0.797
alpha 0.000451  5-fold CV acc 0.799
alpha 0.000859  5-fold CV acc 0.782
alpha 0.007361  5-fold CV acc 0.692
chosen alpha 0.000451: leaves 153  val 0.808</div>
  <p>The full tree has a path of 784 nested subtrees. Over 8 candidate α values, 5-fold cross-validated accuracy rises from 0.780 to a peak of 0.799 near α = 0.00045, then falls as the tree becomes too small (0.692 at α = 0.0074). The chosen tree has 153 leaves instead of 1,413 and scores 0.808 on validation. Breiman also suggested the <strong>1-SE rule</strong>: take the largest α whose cross-validated score is within one standard error of the best, because a simpler tree with statistically the same accuracy is preferable. Pre-pruning and cost-complexity pruning end up at similar accuracy here (0.80 to 0.81); cost-complexity gives a principled sequence instead of a grid of guesses. Always choose α on training folds, never on the test set, and generate candidates with <code>cost_complexity_pruning_path</code> on your own data, because α is on the impurity scale and 0.001 means very different things on different datasets. Pruning lowers variance only by making the one tree simpler, which adds bias, so a single pruned tree tops out around 0.81 here; reaching about 0.88 needs many trees, which is the subject of the ensemble notes.</p>

  <h2 id="dt-missing"><span class="num">09</span>Missing Values</h2>
  <p>Real tables have holes: the captain forgot to note the outlook, the hygrometer failed, a customer left the income field blank. A missing value causes two problems. During training, how do you compute the gain of "Outlook?" when some days have no outlook? During prediction, which branch does a row take when the node asks about its missing column? The three classic algorithms answer very differently.</p>
  <p><strong>C4.5 uses fractional rows.</strong> Suppose D12's outlook (Overcast, played) is erased. C4.5 computes the gain on the 13 days where the outlook is known (8 Yes, 5 No, entropy 0.961; weighted child entropy 0.747; gain 0.214) and then multiplies by the fraction of known rows, 13/14, giving 0.199: a column that is often missing is trusted less. D12 is then sent down every branch as a piece of a row, weighted by how common each branch is among known rows: 5/13 of it to Sunny, 3/13 to Overcast, 5/13 to Rain. At prediction time a row with an unknown outlook also goes down all branches, and the answers are combined by the same weights. For a new day with unknown outlook, high humidity and weak wind, the Sunny path gives "No" with weight 5/14, the Overcast path "Yes" with weight 4/14 and the Rain path "Yes" with weight 5/14, so P(Yes) = 0.643 and the prediction is Yes. These are the numbers in Quinlan's own book.</p>
  <p><strong>CART uses surrogate splits.</strong> At each node, besides the best split (the primary), it stores a ranked list of backup splits on other columns that send rows the same way as the primary as often as possible. A row missing the primary column uses the first surrogate it has a value for. Think of a substitute teacher who follows the regular teacher's seating plan as closely as possible. On the diary, if the primary split is "HumPct ≤ 82.5", which other question best imitates it?</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
primary = (df.HumPct &lt;= 82.5).values                  # the split the tree chose: True = left
cands = {}
for col in ["Outlook", "Temp", "Humidity", "Wind"]:  # category = value  vs  the rest
    for v in sorted(df[col].unique())[: 1 if df[col].nunique() == 2 else None]:
        cands[f"{col} = {v}"] = (df[col] == v).values     # (2 values: one test covers both)
vals = np.unique(df.TempC)
for t in (vals[:-1] + vals[1:]) / 2:                  # numeric: TempC &lt;= t
    cands[f"TempC &lt;= {t}"] = (df.TempC &lt;= t).values
agree = {k: max(np.mean(g == primary), np.mean(~g == primary)) for k, g in cands.items()}
for k in sorted(agree, key=agree.get, reverse=True)[:3]:
    print(f"surrogate '{k}' sends {agree[k]:.0%} of days the same way as HumPct &lt;= 82.5")</div>
  <div class="fx" data-lang="text">surrogate 'Humidity = High' sends 100% of days the same way as HumPct &lt;= 82.5
surrogate 'Temp = Cool' sends 79% of days the same way as HumPct &lt;= 82.5
surrogate 'TempC &lt;= 20.5' sends 71% of days the same way as HumPct &lt;= 82.5</div>
  <p>The categorical Humidity column agrees on all 14 days, because the captain's two humidity columns carry the same information, so it is a perfect surrogate. Next come Temp = Cool (79%) and TempC ≤ 20.5 (71%). A surrogate is kept only if it beats simply sending everyone to the larger side. R's <code>rpart</code> implements surrogates; scikit-learn does not.</p>
  <p><strong>scikit-learn (since version 1.3) learns a side for missing values.</strong> At each split it tries the threshold twice, once with all NaN rows sent left and once sent right, and keeps the better. If no NaN reached that node during training, NaN rows at prediction time follow the child that had more training rows. <a class="xref" data-note="ml_xgboost">XGBoost</a> and <a class="xref" data-note="ml_lightgbm">LightGBM</a> use the same idea, called the default direction. Here the hygrometer fails on two stormy evenings when no match was played:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from play import df
X = df[["HumPct"]].astype(float).copy()
X.loc[["D6", "D14"], "HumPct"] = np.nan               # the hygrometer failed on two stormy evenings
t = DecisionTreeClassifier(max_depth=1, random_state=0).fit(X, df.Play)
print(export_text(t, feature_names=["HumPct"], show_weights=True))
print("NaN goes left?", bool(t.tree_.missing_go_to_left[0]))
print("predict NaN, 70, 90:", t.predict(pd.DataFrame({"HumPct": [np.nan, 70, 90]})))</div>
  <div class="fx" data-lang="text">|--- HumPct &lt;= 82.50
|   |--- weights: [0.00, 6.00] class: Yes
|--- HumPct &gt;  82.50
|   |--- weights: [5.00, 3.00] class: No

NaN goes left? False
predict NaN, 70, 90: ['No' 'Yes' 'No']</div>
  <p>The tree still finds the cut 82.5 among the 12 known readings, and it learns that NaN should go right, together with the humid days: the right leaf holds the 6 known humid days (3 No, 3 Yes) plus D6 and D14, giving 5 No and 3 Yes. A new evening with a missing reading is therefore predicted "No": the fact that the reading is missing has itself become a signal. That is the lesson for any method: missingness often carries information ("refused to give income" can predict loan default), so keep it visible, through native NaN support, an extra "is missing" column, or a separate category, rather than silently filling in the average. If you do fill in values, compute them on the training rows only.</p>

  <h2 id="dt-geom"><span class="num">10</span>Decision Boundaries and Cost</h2>
  <p>Every split is "one column ≤ one number". In a plot of two features, that is a straight cut parallel to one of the axes. A later split inside one side adds another axis-parallel cut on that side only. Repeated cuts chop the plane into <strong>axis-aligned rectangles</strong> (boxes, in more dimensions), and each leaf owns one box. In the left panel below, three splits produce four boxes. This shape is perfect for rules like "income above 40 and age below 60" and poor for <strong>diagonal</strong> rules like "approve if income is greater than the loan instalment", whose boundary is the line x₁ = x₂. The tree must approximate the diagonal with a staircase of small boxes, as in the right panel, and every step costs splits and data.</p>
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
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier
rng = np.random.default_rng(0)
X = rng.random((2000, 2)) * 100                    # x1 = monthly income, x2 = monthly EMI, say
y = (X[:, 0] &gt; X[:, 1]).astype(int)                # the true rule is a diagonal line
Xte = rng.random((2000, 2)) * 100; yte = (Xte[:, 0] &gt; Xte[:, 1]).astype(int)
for d in [2, 4, None]:
    t = DecisionTreeClassifier(max_depth=d, random_state=0).fit(X, y)
    print(f"raw x1, x2    max_depth={str(d):4s} leaves {t.get_n_leaves():3d}  test acc {t.score(Xte, yte):.3f}")
diff = lambda A: np.c_[A, A[:, 0] - A[:, 1]]       # add one engineered column: x1 - x2
t = DecisionTreeClassifier(random_state=0).fit(diff(X), y)
print(f"with x1 - x2  leaves {t.get_n_leaves():3d}  test acc {t.score(diff(Xte), yte):.3f}")</div>
  <div class="fx" data-lang="text">raw x1, x2    max_depth=2    leaves   4  test acc 0.884
raw x1, x2    max_depth=4    leaves  16  test acc 0.963
raw x1, x2    max_depth=None leaves  43  test acc 0.984
with x1 - x2  leaves   2  test acc 1.000</div>
  <p>On the raw columns a depth-2 tree gets 0.884; an unlimited tree with 43 leaves reaches only 0.984, its staircase still wrong near the line. Add one engineered column, x₁ − x₂, and a single split "x₁ − x₂ ≤ 0" is perfect with 2 leaves. A logistic regression would have found this diagonal immediately, which is the main way linear models beat trees. So trees are unaffected by any order-keeping change to a single column, but they are affected by rotations of the feature space, and feature engineering (differences, ratios, sums) rotates the problem into the tree's favour. Outside the training data the boxes simply extend for ever with a constant prediction, which is the extrapolation limit of section 06 again.</p>
  <p>Now the cost. With n rows and d columns, one column at one node of m rows costs a sort, O(m log m), plus one pass. All d columns cost d times that. The nodes on one level of the tree hold different rows, at most n in total, so a whole level costs about O(d · n log n), and a reasonably balanced tree has about log n levels. If the columns are sorted once at the start and the order reused, each level costs only O(d · n), and the total is the <strong>O(n · d · log n)</strong> quoted in most books. A very lopsided tree, where each split peels off one row, can be n levels deep and much slower, which is one more reason to limit depth and leaf size. Prediction is one comparison per level, <strong>O(depth)</strong>, about O(log n) for a balanced tree, and it does not depend on d at all. Memory is the number of nodes: a binary tree with L leaves has 2L − 1 nodes. Measured (times are approximate and machine-dependent):</p>
  <div class="fx" data-lang="py">import numpy as np, time
from sklearn.datasets import make_classification
from sklearn.tree import DecisionTreeClassifier
Xb, yb = make_classification(n_samples=160000, n_features=14, n_informative=6, random_state=7)
def fit_seconds(n):
    t0 = time.perf_counter()
    DecisionTreeClassifier(max_depth=12, random_state=0).fit(Xb[:n], yb[:n])
    return time.perf_counter() - t0
prev = None
for n in [20000, 40000, 80000, 160000]:
    s = min(fit_seconds(n) for _ in range(3))           # best of 3 runs
    print(f"n = {n:6d}  fit {s*1000:5.0f} ms" + (f"   x{s/prev:.2f} vs half the rows" if prev else ""))
    prev = s
t = DecisionTreeClassifier(max_depth=12, random_state=0).fit(Xb, yb)
t0 = time.perf_counter(); t.predict(Xb); s = time.perf_counter() - t0
print(f"predict 160000 rows: {s*1000:.0f} ms = {s/160000*1e6:.2f} microseconds per row (depth {t.get_depth()})")</div>
  <div class="fx" data-lang="text">n =  20000  fit   239 ms
n =  40000  fit   648 ms   x2.72 vs half the rows
n =  80000  fit  1288 ms   x1.99 vs half the rows
n = 160000  fit  3699 ms   x2.87 vs half the rows
predict 160000 rows: 20 ms = 0.13 microseconds per row (depth 12)</div>
  <p>Doubling the rows roughly doubles the fit time (the ratios wobble between 2 and 3 because of timing noise), the signature of n log n; an n² algorithm would multiply by 4 each time. Prediction takes a fraction of a microsecond per row, because each row needs only 12 comparisons. Be careful with "prediction is O(log n)": it assumes a balanced tree, and our unpruned churn tree is 31 levels deep where log₂ 12,000 is about 13.6. For a forest, multiply everything by the number of trees.</p>

  <h2 id="dt-mdi"><span class="num">11</span>Feature Importance (MDI)</h2>
  <p>A manager asks which weather columns matter most for whether the team plays. A tempting answer is "the root question", but that is wrong, as we are about to see. Every split removed some impurity, and it did so using one column. Add up, for each column, all the impurity it removed, with each split weighted by the share of rows that reached its node, and normalise the totals so they sum to 1. This is <strong>Mean Decrease in Impurity</strong> (MDI), also called Gini importance, and it is what <code>feature_importances_</code> returns in scikit-learn.</p>
  <p>By hand on the entropy tree of section 03. The root split on Outlook sees all 14 days and removes 0.247, so it contributes 1 × 0.247 = 0.247. The Humidity split under Sunny sees 5 of 14 days and removes 0.971, contributing 0.357 × 0.971 = 0.347. The Wind split under Rain contributes the same 0.347. The total is 0.940, the root's entire entropy, because all the leaves are pure. Normalised: Outlook 0.247 / 0.940 = 0.26, Humidity 0.37, Wind 0.37, Temp 0. The root column is the <em>least</em> important of the three it uses: the root split removed less uncertainty than the two second-level splits together. Position in the tree is not importance. The code checks the formula against sklearn's own numbers, on its depth-2 entropy tree for the diary:</p>
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
nz = raw &gt; 0
print("ours:   ", {c: round(float(v), 3) for c, v in zip(X.columns[nz], (raw / raw.sum())[nz])})
print("sklearn:", {c: round(float(v), 3) for c, v in zip(X.columns[nz], clf.feature_importances_[nz])})</div>
  <div class="fx" data-lang="text">node 0: Outlook_Overcast n=14  weighted impurity drop 0.226
node 1: Humidity_Normal  n=10  weighted impurity drop 0.199
ours:    {'Outlook_Overcast': 0.532, 'Humidity_Normal': 0.468}
sklearn: {'Outlook_Overcast': 0.532, 'Humidity_Normal': 0.468}</div>
  <p>The root split (Overcast vs the rest, 14 rows) drops entropy from 0.940 to 0.714, a weighted drop of 0.226; the Humidity split below it sees 10 rows, drops its entropy from 1 to 0.722, and contributes 10/14 × 0.278 = 0.199. Normalised, 0.532 and 0.468, identical to <code>feature_importances_</code>. MDI is free, since it falls out of training, but it has a serious bias, shown here with the two pure-noise columns of the churn table:</p>
  <div class="fx" data-lang="py">from common import *
for d in [6, None]:
    t = DecisionTreeClassifier(max_depth=d, random_state=0).fit(Xtr, ytr)
    imp = pd.Series(t.feature_importances_, index=Xtr.columns)
    print(f"max_depth={str(d):4s}  row_noise {imp['row_noise']:.3f}   coin_noise {imp['coin_noise']:.3f}"
          f"   (a real feature, f5: {imp['f5']:.3f})")</div>
  <div class="fx" data-lang="text">max_depth=6     row_noise 0.001   coin_noise 0.000   (a real feature, f5: 0.198)
max_depth=None  row_noise 0.030   coin_noise 0.005   (a real feature, f5: 0.130)</div>
  <p>In the depth-6 tree, both noise columns get almost nothing. In the fully grown tree, <code>row_noise</code>, pure noise with 20,000 distinct values, collects 0.030 importance, six times more than <code>coin_noise</code>, pure noise with only 2 values. A column with many values offers many thresholds, so deep in the tree, among a handful of rows, some threshold always "helps" by chance, and since MDI is computed on training data it rewards this memorising. Two correlated columns also split the importance between them, so each can look unimportant. For decisions, use permutation importance on validation data or SHAP values, after pruning or on an ensemble; <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a> covers these.</p>

  <h2 id="dt-practice"><span class="num">12</span>Decision Trees in Practice</h2>
  <p>Everything so far maps onto scikit-learn's <code>DecisionTreeClassifier</code> and <code>DecisionTreeRegressor</code>. The parameters you will actually touch are these:</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>What it does</th></tr>
    <tr><td><code>criterion</code></td><td>"gini" / "squared_error"</td><td>impurity: gini, entropy (same as log_loss); squared_error, absolute_error, friedman_mse, poisson (section 04, 06)</td></tr>
    <tr><td><code>max_depth</code></td><td>None</td><td>maximum number of questions on a path (section 08)</td></tr>
    <tr><td><code>min_samples_split</code>, <code>min_samples_leaf</code></td><td>2, 1</td><td>minimum rows to split a node / in each child; an integer or a fraction of n</td></tr>
    <tr><td><code>min_impurity_decrease</code>, <code>max_leaf_nodes</code></td><td>0, None</td><td>minimum weighted gain; cap on leaves with best-first growth</td></tr>
    <tr><td><code>ccp_alpha</code></td><td>0</td><td>cost-complexity pruning strength (section 08)</td></tr>
    <tr><td><code>max_features</code></td><td>None</td><td>columns tried per split; for forests</td></tr>
    <tr><td><code>splitter</code></td><td>"best"</td><td>"random" draws a random threshold per column, the <a class="xref" data-note="ml_extratrees">Extra Trees</a> idea</td></tr>
    <tr><td><code>class_weight</code></td><td>None</td><td>"balanced" up-weights rare classes inside the impurity counts</td></tr>
    <tr><td><code>monotonic_cst</code></td><td>None</td><td>force a column's effect to be increasing (+1) or decreasing (−1)</td></tr>
    <tr><td><code>random_state</code></td><td>None</td><td>columns are shuffled at each split, so ties between equally good splits are broken randomly; set it for reproducible trees</td></tr>
  </table>
  <p>After fitting, you can print and inspect the tree. Here a depth-2 entropy tree is fitted on the diary, with the categories one-hot encoded because sklearn needs numbers. <code>export_text</code> prints the rules, <code>show_weights=True</code> adds the class counts in each leaf (in the order No, Yes), <code>apply</code> returns the leaf each row lands in, and <code>decision_path</code> lists the nodes a row visits. (<code>plot_tree</code> draws the same tree as a picture with matplotlib.)</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int)   # one 0/1 column per category
y = df["Play"]
clf = DecisionTreeClassifier(criterion="entropy", max_depth=2, random_state=0).fit(X, y)
print(export_text(clf, feature_names=list(X.columns), show_weights=True))
days = X.loc[["D1", "D3", "D10"]]
print("predict:      ", clf.predict(days))
print("predict_proba:", clf.predict_proba(days).round(2).tolist())
print("leaf id (apply):", clf.apply(days))
print("nodes visited by D1:", clf.decision_path(days).toarray()[0].nonzero()[0])</div>
  <div class="fx" data-lang="text">|--- Outlook_Overcast &lt;= 0.50
|   |--- Humidity_Normal &lt;= 0.50
|   |   |--- weights: [4.00, 1.00] class: No
|   |--- Humidity_Normal &gt;  0.50
|   |   |--- weights: [1.00, 4.00] class: Yes
|--- Outlook_Overcast &gt;  0.50
|   |--- weights: [0.00, 4.00] class: Yes

predict:       ['No' 'Yes' 'Yes']
predict_proba: [[0.8, 0.2], [0.0, 1.0], [0.2, 0.8]]
leaf id (apply): [2 4 3]
nodes visited by D1: [0 1 2]</div>
  <p>The root is "Outlook_Overcast ≤ 0.5", the binary "Overcast vs the rest" that section 04 predicted CART would pick, and the second question is Humidity_Normal. With only depth 2, the left-left leaf is not pure: it holds 4 No and 1 Yes. So D1 (sunny, humid) gets probabilities [0.8, 0.2], simply that leaf's class shares, and D10 (rain, normal humidity) lands in the [1, 4] leaf and gets [0.2, 0.8]. Leaf ids are node numbers in depth-first order (0 is the root, 1 its left child, 2 the left-left leaf, and so on), so <code>decision_path</code> shows D1 visiting nodes 0, 1, 2. This also explains a practical warning: a deep tree's leaves are almost all pure, so its probabilities are almost all exactly 0 or 1, which is useless for ranking customers by risk. Section 13 shows it and the fix.</p>
  <p>Interviewers often ask candidates to write the core of a tree learner. The function that matters is <code>best_split</code>: for every column, sort the rows, compute the class counts to the left of every cut with a running (cumulative) sum, score the weighted Gini of every cut at once, and keep the best midpoint. <code>build</code> calls it recursively until a node is pure or the depth limit is reached. To check our understanding, we compare against sklearn on 3,000 churn rows:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier
from common import Xtr, ytr, Xte, yte

def gini_from_counts(c):                             # c = [count class 0, count class 1] per row
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
    if f is None:                                     # pure, or depth limit reached: a leaf
        return int(np.bincount(y, minlength=2).argmax())
    m = X[:, f] &lt;= thr
    return (f, thr, build(X[m], y[m], depth + 1, max_depth), build(X[~m], y[~m], depth + 1, max_depth))

def predict_one(node, x):
    while isinstance(node, tuple):                    # internal node = (feature, thr, left, right)
        f, thr, left, right = node
        node = left if x[f] &lt;= thr else right
    return node

A = Xtr.to_numpy(np.float32)[:3000]; b = ytr[:3000]   # sklearn works in float32 too
At = Xte.to_numpy(np.float32)
ours = build(A, b, 0, max_depth=5)
sk = DecisionTreeClassifier(max_depth=5, random_state=0).fit(A, b)
p_ours = np.array([predict_one(ours, x) for x in At])
print(f"root: ours f{ours[0]} &lt;= {ours[1]:.4f} | sklearn f{sk.tree_.feature[0]} &lt;= {sk.tree_.threshold[0]:.4f}")
print(f"identical predictions on {np.mean(p_ours == sk.predict(At)):.1%} of {len(yte)} test rows")</div>
  <div class="fx" data-lang="text">root: ours f5 &lt;= 0.2556 | sklearn f5 &lt;= 0.2556
identical predictions on 100.0% of 5000 test rows</div>
  <p>Our 40-line tree picks the same root question as sklearn and makes the same prediction on all 5,000 test rows. Two details were needed: the data is converted to 32-bit floats, because sklearn stores features that way and the midpoints must be computed from the same rounded values; and no cut is allowed between two equal values. Everything sklearn adds on top is engineering: compiled speed, sample weights, missing values, best-first growth and pruning. The algorithm itself, "try every column and every midpoint, keep the largest impurity drop, recurse", fits on one screen.</p>
  <p>So when is a single tree the right model? Its strengths are real: a small tree is a set of rules you can show to a regulator or code into SQL; it needs no scaling and is unaffected by outliers in the inputs, since only order matters; it finds interactions and bends on its own; it predicts in microseconds; and it is the building block of the strongest table models. Its weaknesses are just as real: high variance (on the churn data a pruned tree reaches about 0.81 while a forest of trees reaches about 0.88), axis-aligned staircases for diagonal patterns, no extrapolation, and coarse probabilities. Use one tree when the rules themselves are the product (credit policy, a triage protocol), for exploring which segments behave differently, or on a tiny device; otherwise use an ensemble of trees.</p>
  <table class="tbl">
    <tr><th></th><th>Decision tree</th><th>Logistic / linear regression</th><th>k-nearest neighbours</th><th>Random forest / boosting</th></tr>
    <tr><td>Boundary shape</td><td>axis-aligned boxes</td><td>one straight line or plane</td><td>any shape, follows the data</td><td>many boxes averaged or added: smoother</td></tr>
    <tr><td>Interactions</td><td>automatic</td><td>must be built by hand</td><td>automatic</td><td>automatic</td></tr>
    <tr><td>Feature scaling</td><td>not needed</td><td>needed with regularisation</td><td>essential</td><td>not needed</td></tr>
    <tr><td>Extrapolation</td><td>none (flat)</td><td>yes (the line continues)</td><td>none</td><td>none</td></tr>
    <tr><td>Bias / variance</td><td>low bias, high variance (deep)</td><td>high bias, low variance</td><td>depends on k</td><td>forest cuts variance, boosting cuts bias</td></tr>
    <tr><td>Readability</td><td>read the rules (small trees)</td><td>coefficients</td><td>"similar to these rows"</td><td>needs importance or SHAP</td></tr>
  </table>
  <p><a class="xref" data-note="ml_trees">Tree Models: Overview &amp; How to Choose</a> shows how each member of the tree family improves on the single tree, and <a class="xref" data-note="ml_ensembles">Ensemble Learning</a> explains why combining shaky trees works.</p>

  <h2 id="dt-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most damaging slip when computing gain by hand, or in your own code, is averaging the children's impurities without weighting them by size. A one-row child is always pure, so an unweighted average rewards splits that peel off a single row. On the diary, the cut "HumPct ≤ 67.5" separates just D7 from the other 13 days:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
def H(y):
    p = y.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0
splits = {"HumPct &lt;= 67.5": [df[df.HumPct &lt;= 67.5], df[df.HumPct &gt; 67.5]],   # peels off ONE day
          "Outlook": [g for _, g in df.groupby("Outlook")]}
for name, kids in splits.items():
    unweighted = H(df.Play) - np.mean([H(k.Play) for k in kids])                 # WRONG
    weighted = H(df.Play) - sum(len(k) / 14 * H(k.Play) for k in kids)           # right
    print(f"{name:15s} sizes {[len(k) for k in kids]}  unweighted 'gain' {unweighted:.3f}  real IG {weighted:.3f}")</div>
  <div class="fx" data-lang="text">HumPct &lt;= 67.5  sizes [1, 13]  unweighted 'gain' 0.460  real IG 0.048
Outlook         sizes [4, 5, 5]  unweighted 'gain' 0.293  real IG 0.247</div>
  <p>Unweighted, the useless one-day split scores 0.460 and beats Outlook's 0.293. Weighted correctly, it scores 0.048 and Outlook's real information gain, 0.247, wins easily. Always multiply each child's impurity by nₖ / n.</p>
  <p>A second common mistake is scaling features before fitting a tree, out of habit from linear models and k-nearest neighbours. It is harmless but pointless, because a tree only uses the order of each column:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier
from play import df
raw = df[["HumPct", "TempC"]].astype(float)
scaled = (raw - raw.mean()) / raw.std()                       # standardised copy
logged = np.log(raw)                                          # any order-keeping change
preds = [DecisionTreeClassifier(random_state=0).fit(X, df.Play).predict(X) for X in (raw, scaled, logged)]
print("raw vs standardised: same predictions?", (preds[0] == preds[1]).all())
print("raw vs log:          same predictions?", (preds[0] == preds[2]).all())</div>
  <div class="fx" data-lang="text">raw vs standardised: same predictions? True
raw vs log:          same predictions? True</div>
  <p>Standardised or logged, the tree makes exactly the same predictions. Spend that effort on features that change what the tree can express, such as the difference x₁ − x₂ of section 10.</p>
  <p>A third mistake is trusting the probabilities of a deep tree. Its leaves are nearly all pure, so <code>predict_proba</code> returns 0 or 1 for almost every row:</p>
  <div class="fx" data-lang="py">from common import *
for leaf in [1, 50]:
    t = DecisionTreeClassifier(min_samples_leaf=leaf, random_state=0).fit(Xtr, ytr)
    p = t.predict_proba(Xva)[:, 1]
    print(f"min_samples_leaf={leaf:2d}: {len(np.unique(p)):3d} different probabilities, "
          f"share that are exactly 0 or 1: {np.isin(p, [0, 1]).mean():.0%}")</div>
  <div class="fx" data-lang="text">min_samples_leaf= 1:   2 different probabilities, share that are exactly 0 or 1: 100%
min_samples_leaf=50: 142 different probabilities, share that are exactly 0 or 1: 15%</div>
  <p>The unlimited tree produces only two distinct probabilities on 3,000 validation customers. With at least 50 customers per leaf, it produces 142 distinct values and only 15% are exactly 0 or 1. If you need risk scores, ROC curves or threshold tuning (see <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>), use larger leaves, calibrate, or use an ensemble whose averaged probabilities are smoother.</p>
  <p>Four more mistakes need no code. Judging a tree by its training accuracy is meaningless, since a full tree scores 100% almost by construction; compare train with validation, and tune depth, leaf size or α with cross-validation, never on the test set. Leaving ID columns, phone numbers or exact timestamps in the data lets them top both the split list and the MDI chart (sections 04 and 11). Calling the root column "the most important driver" is wrong twice: MDI can rank it last, and one changed day can replace it. And arbitrary integer codes for categories impose a fake order that wastes splits under a depth limit (0.621 vs 0.758 in section 05).</p>

  <h2 id="dt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Decision tree</b>: a model that splits rows by one-column questions into regions (leaves) and predicts a constant per leaf: majority class / class shares, or the mean.</li>
    <li><b>Root / internal node / branch / leaf</b>: first question / later question / one answer / final box with the prediction. <b>Depth</b>: questions from root to the deepest leaf. <b>Stump</b>: depth 1.</li>
    <li><b>Impurity</b>: how mixed a box is; 0 when pure. <b>Gain</b>: parent impurity − size-weighted child impurity.</li>
    <li><b>Greedy recursive partitioning</b>: pick the best split now, recurse on each child, never look back.</li>
    <li><b>Overfitting</b>: memorising training rows; <b>instability / high variance</b>: small data change → different tree.</li>
    <li><b>Pre-pruning</b>: limits during growth. <b>Post-pruning</b>: grow fully, then cut back (reduced-error, cost-complexity).</li>
    <li><b>Surrogate split</b>: backup question that mimics the primary split for rows missing its column.</li>
    <li><b>MDI</b>: sum of weighted impurity drops per column, normalised; biased to many-valued columns.</li>
  </ul>
  <h3>Formulas (diary values)</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Diary value</th></tr>
    <tr><td>Entropy</td><td>H = −Σ pᵢ log₂ pᵢ (max log₂ k)</td><td>[9, 5] → 0.940</td></tr>
    <tr><td>Gini</td><td>G = 1 − Σ pᵢ² (max 1 − 1/k)</td><td>0.459</td></tr>
    <tr><td>Misclassification</td><td>E = 1 − max pᵢ</td><td>5/14 = 0.357</td></tr>
    <tr><td>Information gain</td><td>H(S) − Σ (|Sᵥ|/|S|) H(Sᵥ)</td><td>Outlook 0.247, Humidity 0.152, Wind 0.048, Temp 0.029</td></tr>
    <tr><td>Gain ratio</td><td>IG / SplitInfo, SplitInfo = −Σ (|Sᵥ|/|S|) log₂(|Sᵥ|/|S|)</td><td>Outlook 0.247 / 1.577 = 0.156; Day 0.940 / 3.807 = 0.247</td></tr>
    <tr><td>Thresholds</td><td>midpoints of sorted distinct values; m values → m − 1 cuts</td><td>HumPct ≤ 82.5, weighted Gini 0.367</td></tr>
    <tr><td>Category groupings</td><td>2^(k−1) − 1; k − 1 after sorting by class-1 rate</td><td>Outlook: 3 (or 2)</td></tr>
    <tr><td>Regression</td><td>MSE = mean (y − ȳ)²; leaf = mean (MAE → median)</td><td>turnout 91.43 → 55.43; leaves 40 and 28</td></tr>
    <tr><td>Cost-complexity</td><td>R_α(T) = R(T) + α|T|</td><td></td></tr>
    <tr><td>Weakest link</td><td>g(t) = (R(t) − R(T_t)) / (|T_t| − 1)</td><td>root: (5/14) / 4 = 0.089</td></tr>
    <tr><td>Cost</td><td>train ≈ O(n · d · log n); predict O(depth)</td><td></td></tr>
  </table>
  <h3>ID3 vs C4.5 vs CART</h3>
  <table class="tbl">
    <tr><th></th><th>ID3</th><th>C4.5</th><th>CART / sklearn</th></tr>
    <tr><td>Score</td><td>information gain</td><td>gain ratio</td><td>Gini / MSE</td></tr>
    <tr><td>Splits</td><td>multiway</td><td>multiway + numeric thresholds</td><td>binary</td></tr>
    <tr><td>Missing</td><td>no</td><td>fractional rows</td><td>surrogates (sklearn: learned NaN side)</td></tr>
    <tr><td>Pruning</td><td>none</td><td>pessimistic</td><td>cost-complexity</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.tree import DecisionTreeClassifier, export_text
clf = DecisionTreeClassifier(criterion="gini", max_depth=None, min_samples_leaf=5,
                             ccp_alpha=0.0, random_state=0).fit(X, y)
clf.predict(X_new); clf.predict_proba(X_new)        # leaf majority / leaf class shares
clf.get_depth(); clf.get_n_leaves(); clf.feature_importances_
print(export_text(clf, feature_names=list(X.columns)))
path = clf.cost_complexity_pruning_path(X, y)       # path.ccp_alphas -&gt; try with cross-validation</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Weight child impurities by size; unweighted averages reward one-row children.</li>
    <li>Information gain and MDI love many-valued columns; drop IDs and raw timestamps.</li>
    <li>Error (1 − max p) cannot grow trees: useful splits score 0.</li>
    <li>No scaling needed; only order matters. Diagonals need engineered features.</li>
    <li>No extrapolation: predictions are leaf values.</li>
    <li>Deep-tree probabilities are 0/1; use bigger leaves or calibration.</li>
    <li>Entropy above 1 is fine for 3+ classes (max log₂ k).</li>
    <li>The root column is not "the most important feature".</li>
  </ul>

  <h2 id="dt-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a decision tree, and how does it make a prediction?</summary><div class="qa-body">A decision tree is a model that splits the data by a sequence of one-column questions until the remaining groups (leaves) are as pure as possible. To predict, a row starts at the root, follows the branch matching its value at each question, and receives its leaf's answer: the majority class (or class shares as probabilities) for classification, the mean target for regression. Prediction costs one comparison per level, O(depth).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define entropy and compute it for a node with 9 positives and 5 negatives.</summary><div class="qa-body">Entropy H = −Σ pᵢ log₂ pᵢ is the average surprise, in bits, of a randomly drawn row's class. With shares 9/14 and 5/14: 0.643 × 0.637 + 0.357 × 1.485 = 0.410 + 0.530 = 0.940 bits. It is 0 for a pure node, 1 for a 50/50 two-class node, and at most log₂ k for k classes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is information gain?</summary><div class="qa-body">The drop in entropy produced by a split: H(parent) minus the size-weighted average entropy of the children. It equals the mutual information between the column and the class, H(Y) − H(Y | A). ID3 splits on the column with the largest information gain at every node.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Gini vs entropy: what is the difference, and which should you use?</summary><div class="qa-body">Gini = 1 − Σ p² is the chance two random rows from the node disagree; entropy is the average surprise. Scaled to the same peak their curves almost coincide (Gini is a first-order approximation of entropy), so they choose the same split almost always. Gini avoids logarithms, is slightly faster and is sklearn's default; accuracy is practically the same (0.807 vs 0.806 on our churn data), so tune depth and pruning instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does information gain favour columns with many values, and how do you deal with it?</summary><div class="qa-body">More values mean smaller branches, and small groups look pure by chance; an ID column gives one pure row per branch and the maximum gain. C4.5 divides by split information (the entropy of the branch sizes) to get the gain ratio, and binary splits (CART) also soften the bias. Neither makes an identifier harmless, so drop IDs and raw timestamps or turn them into meaningful features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why don't trees grow using misclassification error?</summary><div class="qa-body">Error, 1 − max p, is made of straight lines, so when both children keep the parent's majority class the weighted child error equals the parent's and the gain is zero, even for a split that creates a pure child. On the diary, "Overcast vs rest" has error gain 0 but Gini gain 0.102, and it is the root sklearn chooses. Entropy and Gini are strictly concave, so they reward any increase in purity. Error is still used when pruning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a tree choose the threshold for a numeric feature, and what does that cost?</summary><div class="qa-body">Sort the values, consider the midpoint between each pair of neighbouring distinct values, and scan left to right, updating class counts as each row crosses the cut and scoring the weighted impurity. One column at one node costs O(m log m) for the sort plus O(m) for the scan. Only cuts where the class changes can win, and histogram-based libraries try just a few hundred bin edges.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does CART split a categorical feature with k values?</summary><div class="qa-body">It looks for the best way to divide the values into two groups; there are 2^(k−1) − 1 groupings. For two classes (or regression) it sorts the values by their class-1 rate (or mean target), and the best grouping is one of the k − 1 cuts of that order, so it is as cheap as a numeric split. sklearn does not do this; you must encode categories, and the encoding affects how many splits are needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare ID3, C4.5 and CART.</summary><div class="qa-body">ID3: information gain, one branch per value, categorical only, no pruning or missing handling. C4.5: gain ratio, numeric thresholds, fractional rows for missing values, pessimistic pruning. CART: Gini or squared error, always binary splits, surrogate splits for missing values, cost-complexity pruning with cross-validation, and regression support. scikit-learn implements an optimised CART without surrogates or categorical splits, but with a learned direction for NaN.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a regression tree work, and what changes with absolute error?</summary><div class="qa-body">It chooses the split that most reduces the size-weighted variance (MSE) of the children, and each leaf predicts the mean of its rows, the constant that minimises squared error. With absolute error the leaf predicts the median, which is robust to outliers (42 vs 40 for the diary leaf containing the low turnout of D6). Either way predictions form a step function that cannot extrapolate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a decision tree called a high-variance model?</summary><div class="qa-body">Small changes in the training data change the top split when two candidates have nearly equal gain, and because the search is greedy and hierarchical, the change propagates to every node below. Removing one of 14 diary days changes the root from Outlook to Humidity; five trees on different 80% samples of the churn data disagree on half the validation rows. A deep tree therefore has low bias but high variance, which is why ensembles average many trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pre-pruning vs post-pruning: what are the trade-offs?</summary><div class="qa-body">Pre-pruning (max_depth, min_samples_leaf, min_impurity_decrease, max_leaf_nodes) is cheap and simple but suffers from the horizon effect: a weak split that would enable a strong one below is never made. Post-pruning grows the full tree and then cuts back branches that do not pay for themselves, so it can see those combinations, at the cost of more training time and, for reduced-error pruning, a held-out validation set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain cost-complexity pruning.</summary><div class="qa-body">Minimise R(T) + α|T|, the training error plus a price α per leaf. For each internal node, g(t) = (R(t) − R(T_t)) / (|T_t| − 1) is the error its branch saves per extra leaf; cut the node with the smallest g (the weakest link), set α to that value, recompute and repeat. This gives a nested sequence of subtrees, one per range of α, and cross-validation (optionally with the 1-SE rule) picks α. In sklearn: <code>cost_complexity_pruning_path</code>, then <code>ccp_alpha</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do decision trees handle missing values?</summary><div class="qa-body">C4.5 computes the gain on known rows, scales it by the known fraction, and sends rows with unknown values down every branch with fractional weights. CART stores surrogate splits on other columns that mimic the primary split. sklearn (1.3+), XGBoost and LightGBM learn at each split which side NaNs should go. Otherwise impute and add a missing-indicator column, because missingness itself can be predictive.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Do you need to scale features for a decision tree? Why or why not?</summary><div class="qa-body">No. A split only asks whether a value is above or below a threshold, so any change that keeps the order of a column (standardising, log) gives the same splits and predictions. Trees are, however, sensitive to rotations: a diagonal boundary such as x₁ &gt; x₂ needs a staircase of many splits, while an engineered column x₁ − x₂ solves it in one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the training and prediction complexities of a decision tree?</summary><div class="qa-body">Training is about O(n · d · log n) for a balanced tree with presorted columns (sorting at every node adds another log factor, and a very lopsided tree is worse). Prediction is O(depth), about O(log n) when balanced, and independent of the number of columns. Memory is the number of nodes, 2L − 1 for L leaves.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is feature importance computed in a tree, and what is wrong with it?</summary><div class="qa-body">MDI sums, for each column, the impurity decreases of all splits on it, weighted by the share of rows reaching each node, then normalises. It is computed on training data, so it favours columns with many distinct values that let a deep tree carve tiny leaves by chance (pure noise with 20,000 values got 6× the importance of noise with 2 values), and correlated columns share importance. Prefer permutation importance on validation data or SHAP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do decision-tree probabilities tend to be poor, and how do you fix them?</summary><div class="qa-body">A leaf's probability is the class share of its training rows, and a deep tree's leaves are nearly all pure, so it outputs almost only 0 and 1 (100% of validation rows in our unlimited tree). Fixes: larger leaves (min_samples_leaf of 20 to 50 or more), probability calibration, or an ensemble whose averaged probabilities are smoother.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does gradient boosting use regression trees even for classification?</summary><div class="qa-body">Each boosting round fits a tree to the negative gradient of the loss, which for log loss is y − p, a real number per row rather than a class. So every tree is a regression tree with variance-reduction splits and numeric leaf values that are added to the running log-odds. Understanding regression trees is the prerequisite for gradient boosting, XGBoost and LightGBM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose a single decision tree over a random forest or gradient boosting?</summary><div class="qa-body">When the rules themselves are the product and must be read, audited or coded by hand (credit policy, clinical triage), when exploring which segments behave differently, or when the deployment target is tiny. When accuracy, stable predictions or good probabilities matter more, an ensemble wins: on our churn data a pruned tree reaches about 0.81 against about 0.88 for a forest.</div></details>
</main>
`
});
