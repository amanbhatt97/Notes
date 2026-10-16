// ml/ml_intro.js — ML Basics
Object.assign(TOPIC_CONTENT, {
  "ml_intro": `<main>
  <h1>ML Basics</h1>
  <p class="lead">Machine learning (ML) is a way to make a computer find a rule from examples, instead of a person writing the rule. Companies use it to guess prices, catch fraud, filter spam and recommend videos. Almost every data-science interview starts here: what ML is, its types, how a project runs, why we keep a test set aside, and how a model "learns". This page explains each of these from zero, then builds a first real model in scikit-learn (the standard Python ML library). Every later ML page uses these ideas.</p>

  <h2 id="mi-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ML Basics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What ML is</div>
        <ul>
          <li><b>ML</b> — the computer learns the rule f(X) → y from examples; you don't write it</li>
          <li><b>X</b> = input columns (features) · <b>y</b> = the answer (target / label) · <b>model</b> = the learned rule</li>
          <li><b>Training</b> = learning f from (X, y). <b>Inference</b> = using f on new X</li>
          <li><b>Goal = generalise</b> — do well on new rows, not just remember old ones</li>
          <li><b>Use ML when</b> rules are too many or unknown, and you have data + a clear target</li>
          <li><b>Skip ML when</b> a simple rule works, mistakes are not allowed, or there is no data</li>
          <li>💡 Rulebook doctor vs doctor who has seen 10,000 patients</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Types of learning</div>
        <ul>
          <li><b>Supervised</b> — answers given (X, y). <b>Regression</b> = predict a number; <b>classification</b> = predict a class</li>
          <li><b>Unsupervised</b> — only X. Find groups, compress features, spot odd rows</li>
          <li><b>Reinforcement</b> — agent tries actions, gets rewards, learns what to do (games, robots)</li>
          <li><b>Semi-supervised</b> — few labelled rows + many unlabelled rows</li>
          <li><b>Self-supervised</b> — labels come from the data itself: next word (GPT), hidden word (BERT)</li>
          <li>💡 Answer key / sorting photos with no names / learning to cycle</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Workflow</div>
        <ul>
          <li><b>Loop</b> — problem → data → features → split → baseline → train → evaluate → deploy → monitor → retrain</li>
          <li><b>Problem first</b> — which decision? Which mistake costs more, false alarm (FP) or miss (FN)?</li>
          <li><b>Baseline first</b> — simplest guess (majority / mean) → linear/logistic → boosting</li>
          <li>⚠ Most projects fail at the start (wrong problem) or the end (no monitoring)</li>
          <li>Good features beat fancy algorithms</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Train / val / test</div>
        <ul>
          <li><b>Train ~70%</b> learns weights · <b>val ~15%</b> picks the model · <b>test ~15%</b> used once</li>
          <li><code>stratify=y</code> — same class ratio in every split</li>
          <li><b>Time series</b> — split by date, never shuffle; test = latest dates</li>
          <li>⚠ Choosing models by test score → test becomes a 2nd val set → score too rosy</li>
          <li>💡 Textbook exercises / mock exam / board exam</li>
          <li>Small data → cross-validation instead of one val split</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How a model learns</div>
        <ul>
          <li><b>Loss</b> — one number for "how wrong". Training makes it small</li>
          <li><b>MSE</b> (best constant = mean, outliers shout) · <b>MAE</b> (= median, calm) · <b>Huber</b> (mix) · <b>cross-entropy</b> (classes) · <b>hinge</b> (SVM)</li>
          <li><b>Gradient descent</b> — <code>w ← w − α·∇L(w)</code>; step against the slope; α = learning rate = step size</li>
          <li>⚠ α too big → jumps away (diverges); too small → very slow</li>
          <li><b>Batch / SGD / mini-batch</b> — all rows / 1 row / 32–512 rows per step</li>
          <li><b>Momentum</b> — keeps speed in a steady direction · <b>Adam</b> — momentum + own step size per weight · <b>AdamW</b> — Adam + proper weight decay</li>
          <li>💡 Walking down a foggy hill, feeling the slope</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Linear &amp; logistic baselines</div>
        <ul>
          <li><b>OLS</b> — fit a line that makes ‖y − Xw‖² smallest; <code>w = (XᵀX)⁻¹Xᵀy</code>, cost O(nd² + d³)</li>
          <li>Small d → exact formula (use lstsq); huge d or streaming → gradient descent</li>
          <li><b>LINE assumptions</b> — Linear, Independent errors, Normal errors, Equal spread</li>
          <li><b>Logistic</b> — P(y=1) = σ(wᵀx + b); σ squeezes any score into 0–1; straight line on the log-odds scale</li>
          <li><b>Odds</b> = p/(1−p). <b>Coefficient w</b> — +1 unit of x multiplies the odds by e^w</li>
          <li>⚠ Logistic is a classifier: judge it by log loss / AUC, never R²</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Generalisation &amp; drift</div>
        <ul>
          <li><b>Overfit</b> — learned the noise · <b>spurious</b> — learned a shortcut · <b>shift</b> — the world changed</li>
          <li><b>Covariate shift</b> — inputs P(X) change, the rule P(y|X) stays</li>
          <li><b>Label shift</b> — share of each class P(y) changes (fraud rate doubles)</li>
          <li><b>Concept drift</b> — the rule P(y|X) itself changes (COVID spending). Most dangerous</li>
          <li><b>Catch it</b> — PSI on inputs + rolling metric on fresh labels. <b>Fix</b> — retrain on recent data</li>
          <li>💡 Swiggy model trained in winter, used in monsoon</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">First model recipe</div>
        <ul>
          <li>Split (stratified) → Dummy baseline → Pipeline(scaler, model) → compare on val → refit on train+val → test once</li>
          <li>Breast cancer: baseline acc 0.628 but recall 0 → logreg val 0.977, test 0.988</li>
          <li>Keep <code>predict_proba</code>; pick the threshold later</li>
          <li>⚠ Leakage — scaling on all data or using future info (see Core Concepts)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mi-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What ML Is</span><span class="rm-sub">Learned rules vs written rules</span></div></div>
      <div class="rm-item rm-done" data-target="mi-types"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Types of Learning</span><span class="rm-sub">Supervised, unsupervised, RL</span></div></div>
      <div class="rm-item rm-done" data-target="mi-flow"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The ML Workflow</span><span class="rm-sub">A loop, not a line</span></div></div>
      <div class="rm-item rm-done" data-target="mi-split"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Train / Val / Test</span><span class="rm-sub">Why the test set is touched once</span></div></div>
      <div class="rm-item rm-done" data-target="mi-learn"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">How a Model Learns</span><span class="rm-sub">Loss + gradient descent</span></div></div>
      <div class="rm-item rm-done" data-target="mi-lin"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Linear &amp; Logistic Baselines</span><span class="rm-sub">OLS, log-odds, assumptions</span></div></div>
      <div class="rm-item rm-done" data-target="mi-gen"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Generalisation &amp; Drift</span><span class="rm-sub">Why prod ≠ notebook</span></div></div>
      <div class="rm-item rm-done" data-target="mi-first"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">First sklearn Model</span><span class="rm-sub">End to end, real output</span></div></div>
      <div class="rm-item rm-done" data-target="mi-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mi-what"><span class="num">01</span>What ML Is</h2>
  <p>A tea stall owner near your college notices a pattern. On hot days he sells fewer cups. On cold days he sells more. Nobody gave him a formula. He just watched many days and learnt the rule in his head. Now, if you tell him tomorrow's temperature, he can guess his sales.</p>
  <p>Normal programming does not work like this. A programmer must write every rule by hand: "if temperature &lt; 25, make 140 cups". That is fine for simple rules. It breaks when the rules are too many, or nobody knows them. Nobody can write down every rule for "is this email spam?" or "is this photo a cat?".</p>
  <p><strong>Machine learning</strong> is the tea-stall way: give the computer many examples with the answers, and let it find the rule itself.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <defs><marker id="mi-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="18">Rules-based program</text>
    <rect x="10" y="32" width="70" height="28" rx="5" class="fs" stroke="currentColor"/><text x="45" y="51" text-anchor="middle">Rules</text>
    <rect x="10" y="82" width="70" height="28" rx="5" class="fs" stroke="currentColor"/><text x="45" y="101" text-anchor="middle">Data</text>
    <rect x="115" y="56" width="74" height="30" rx="5" class="fb sb"/><text x="152" y="76" text-anchor="middle">Program</text>
    <rect x="210" y="56" width="66" height="30" rx="5" class="fg sg"/><text x="243" y="76" text-anchor="middle">Answers</text>
    <line x1="80" y1="46" x2="113" y2="64" stroke="currentColor" marker-end="url(#mi-ah)"/><line x1="80" y1="96" x2="113" y2="78" stroke="currentColor" marker-end="url(#mi-ah)"/>
    <line x1="189" y1="71" x2="208" y2="71" stroke="currentColor" marker-end="url(#mi-ah)"/>
    <text x="10" y="138" class="tm">you write the rules</text>
    <line x1="290" y1="10" x2="290" y2="140" stroke="currentColor" opacity="0.2"/>
    <text x="305" y="18">Machine learning</text>
    <rect x="305" y="32" width="70" height="28" rx="5" class="fs" stroke="currentColor"/><text x="340" y="51" text-anchor="middle">Data</text>
    <rect x="305" y="82" width="70" height="28" rx="5" class="fs" stroke="currentColor"/><text x="340" y="101" text-anchor="middle">Answers</text>
    <rect x="405" y="56" width="66" height="30" rx="5" class="ft st"/><text x="438" y="76" text-anchor="middle">Train</text>
    <rect x="490" y="56" width="62" height="30" rx="5" class="fv" stroke="currentColor"/><text x="521" y="76" text-anchor="middle">Model</text>
    <line x1="375" y1="46" x2="403" y2="64" stroke="currentColor" marker-end="url(#mi-ah)"/><line x1="375" y1="96" x2="403" y2="78" stroke="currentColor" marker-end="url(#mi-ah)"/>
    <line x1="471" y1="71" x2="488" y2="71" stroke="currentColor" marker-end="url(#mi-ah)"/>
    <text x="305" y="138" class="tm">the rules are learned from examples</text>
  </svg><figcaption>Classic code turns rules + data into answers. ML turns data + answers into the rules (the model).</figcaption></figure>
  <p>Look at the arrows. On the left, you supply the rules. On the right, you supply past answers, and the rules come out at the end. That learned rule is called the <strong>model</strong>.</p>
  <h3>The words you will hear every day</h3>
  <table class="tbl">
    <tr><th>Word</th><th>Plain meaning</th><th>Tea stall example</th></tr>
    <tr><td><strong>Features</strong> (X)</td><td>The input columns: what you know before the answer</td><td>Temperature</td></tr>
    <tr><td><strong>Target / label</strong> (y)</td><td>The answer you want to predict</td><td>Cups sold</td></tr>
    <tr><td><strong>Row / example</strong></td><td>One case, with its X and y</td><td>One day</td></tr>
    <tr><td><strong>Model</strong></td><td>The rule the computer found</td><td>"Each degree colder → 5 more cups"</td></tr>
    <tr><td><strong>Training</strong></td><td>Finding the rule from past rows</td><td>Watching last month's sales</td></tr>
    <tr><td><strong>Inference / prediction</strong></td><td>Using the rule on a new row</td><td>Guessing tomorrow's sales</td></tr>
    <tr><td><strong>Generalisation</strong></td><td>Doing well on rows never seen before</td><td>Good guesses next month too</td></tr>
  </table>
  <p>Here is the tea stall in five lines of Python. Five past days go in; the rule comes out; then the rule guesses a new day.</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
temp = [[40], [35], [30], [25], [20]]       # X: temperature in °C
cups = [60, 85, 110, 135, 160]              # y: cups of tea sold that day
model = LinearRegression().fit(temp, cups)  # training: find the rule
print(f"learned rule: cups = {model.intercept_:.0f} + ({model.coef_[0]:.0f}) x temp")
print("guess for a 28 °C day:", model.predict([[28]]))   # inference: use the rule</div>
  <div class="fx" data-lang="text">learned rule: cups = 260 + (-5) x temp
guess for a 28 °C day: [120.]</div>
  <p>Nobody typed "−5 per degree". The model found it from the examples. <code>fit</code> is training. <code>predict</code> is inference.</p>
  <figure class="viz"><svg viewBox="0 0 470 210" width="470">
    <line x1="50" y1="185" x2="450" y2="185" stroke="currentColor" opacity="0.6"/><line x1="50" y1="185" x2="50" y2="15" stroke="currentColor" opacity="0.6"/>
    <text x="250" y="205" text-anchor="middle" class="tm">temperature (°C) →</text><text x="14" y="110" class="tm" transform="rotate(-90 14 110)">cups sold</text>
    <g class="tm" text-anchor="middle" font-size="11"><text x="92" y="198">20</text><text x="172" y="198">25</text><text x="252" y="198">30</text><text x="332" y="198">35</text><text x="412" y="198">40</text></g>
    <line x1="60" y1="36" x2="444" y2="180" class="sb" stroke-width="2"/>
    <g class="ft st"><circle cx="92" cy="48" r="5"/><circle cx="172" cy="78" r="5"/><circle cx="252" cy="108" r="5"/><circle cx="332" cy="138" r="5"/><circle cx="412" cy="168" r="5"/></g>
    <line x1="220" y1="185" x2="220" y2="96" class="sr" stroke-dasharray="4 3"/><line x1="50" y1="96" x2="220" y2="96" class="sr" stroke-dasharray="4 3"/>
    <circle cx="220" cy="96" r="6" class="fr sr"/>
    <text x="228" y="90" class="tr">new day: 28 °C → 120 cups</text>
    <text x="300" y="40" class="tb">learned rule (the model)</text>
    <text x="110" y="40" class="tg">past days</text>
  </svg><figcaption>Teal dots are the past days (training data). The blue line is the rule the model learned. The red dot is a new day, answered by reading off the line.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A rulebook doctor ("fever &gt; 38.5 and WBC &gt; 11,000 → infection") has no answer for a new mix of symptoms. A doctor who has seen 10,000 patients can still make a good guess. Where it breaks: if those 10,000 patients were not typical, the doctor's gut feeling is wrong, and it is hard to notice.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Machine learning</strong> means the computer finds a rule f so that f(X) ≈ y, using examples. Read it as: "f, applied to the inputs X, gives roughly the answer y". <strong>Training</strong> = finding f. <strong>Inference</strong> = using f on new X. What matters is <strong>generalisation</strong>: doing well on rows the model has never seen.</p>
  </div>
  <table class="tbl">
    <tr><th>Use ML when…</th><th>Prefer rules when…</th></tr>
    <tr><td>Patterns are too many or unknown (spam, fraud, images)</td><td>A clear rule exists ("age &lt; 18 → reject")</td></tr>
    <tr><td>You have labelled history and a measurable target</td><td>No data, or no way to measure success</td></tr>
    <tr><td>Patterns change and the system must adapt</td><td>Every decision must be fully explainable / zero error</td></tr>
  </table>
  <div class="callout pred"><span class="label">Example</span>
    <p>Spam filter. Writing rules ("contains FREE → spam") breaks the day spammers write "FR33". Show the model 50,000 emails marked spam / not spam and it learns many weak signals together.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>ML is not always the answer. If one clear rule does the job ("age &lt; 18 → reject"), the rule is cheaper, exact and easy to explain. A model always makes some mistakes.</p>
  </div>

  <h2 id="mi-types"><span class="num">02</span>Types of Learning</h2>
  <p>Think of three ways you learnt things as a child. With a teacher who checked your answers. By sorting a pile of things into groups on your own. And by trying, falling and trying again, like learning to ride a cycle. ML has the same three main types.</p>
  <ul>
    <li><strong>Supervised</strong> — every training row has the right answer (the label). The model learns X → y. If y is a number (price, demand), it is called <strong>regression</strong>. If y is a group (spam / not spam), it is called <strong>classification</strong>.</li>
    <li><strong>Unsupervised</strong> — there are no answers, only X. The model looks for structure: groups of similar rows, a smaller summary of many columns, or rows that look odd.</li>
    <li><strong>Reinforcement</strong> — no answers at all. An <em>agent</em> (the learner) takes actions, gets a reward or a penalty, and slowly learns which actions pay off.</li>
  </ul>
  <div class="cards">
    <div><b>Supervised</b><p>Labelled (X, y). Learn X → y.<br><em>Regression</em>: a number. <em>Classification</em>: a class.</p><small>House price, demand, spam, fraud, churn</small></div>
    <div><b>Unsupervised</b><p>X only. Find structure: groups, compressed features, outliers.</p><small>Customer segments, PCA, anomaly detection</small></div>
    <div><b>Reinforcement</b><p>An agent acts, gets rewards, learns a policy that maximises total reward.</p><small>Game AI, robotics, ad bidding, RLHF for LLMs</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Supervised = a student with the answer key. Unsupervised = sorting a pile of photos into groups with no names given. Reinforcement = learning cycling: no one gives the right move, you just fall or don't.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 420 120" width="420">
    <defs><marker id="mi-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="40" width="100" height="40" rx="6" class="fb sb"/><text x="70" y="65" text-anchor="middle">Agent</text>
    <rect x="300" y="40" width="110" height="40" rx="6" class="ft st"/><text x="355" y="65" text-anchor="middle">Environment</text>
    <path d="M120 50 C 180 15, 240 15, 298 50" fill="none" stroke="currentColor" marker-end="url(#mi-ah2)"/>
    <text x="210" y="22" text-anchor="middle">action</text>
    <path d="M300 72 C 240 108, 180 108, 122 72" fill="none" stroke="currentColor" marker-end="url(#mi-ah2)"/>
    <text x="210" y="112" text-anchor="middle" class="tg">reward + new state</text>
  </svg><figcaption>Reinforcement learning: no labels, only delayed rewards. Trial and error replaces the answer key.</figcaption></figure>
  <p>Follow the loop: the agent acts on the world (the <em>environment</em>), the world answers with a reward and a new situation, and the agent acts again. A <em>policy</em> is simply the agent's habit: "in this situation, do this".</p>
  <p>Two in-between types are common in interviews. Labels cost money (a doctor must read each scan), so people find ways to need fewer of them.</p>
  <table class="tbl">
    <tr><th>In-between kind</th><th>Labels</th><th>Example</th></tr>
    <tr><td><strong>Semi-supervised</strong></td><td>Few labelled + many unlabelled</td><td>100 labelled tickets + 100K unlabelled ones</td></tr>
    <tr><td><strong>Self-supervised</strong></td><td>Made from the data itself</td><td>GPT: predict next word. BERT: fill a masked word. SimCLR: match two crops of one image</td></tr>
  </table>
  <div class="callout pred"><span class="label">Example</span>
    <p>Self-supervised, by hand. Take the sentence "I drink chai every morning". Hide the last word: input "I drink chai every", answer "morning". Nobody had to label anything; the sentence labelled itself.</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Self-supervision is why LLMs got so big. The internet gives billions of free "labels" (the next word), so no human has to label anything.</p>
  </div>

  <h2 id="mi-flow"><span class="num">03</span>The ML Workflow</h2>
  <p>Training a model is only one step of a real project. Think of running a tiffin service. You first decide what to cook and for whom. You buy and check vegetables, cook, taste, then deliver. And you keep listening to customers, because tastes change. An ML project has the same shape, and it never really ends.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <defs><marker id="mi-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g text-anchor="middle">
      <rect x="20" y="20" width="100" height="34" rx="5" class="fv" stroke="currentColor"/><text x="70" y="42">Problem</text>
      <rect x="160" y="20" width="100" height="34" rx="5" class="fs" stroke="currentColor"/><text x="210" y="42">Data / EDA</text>
      <rect x="300" y="20" width="100" height="34" rx="5" class="fs" stroke="currentColor"/><text x="350" y="42">Features</text>
      <rect x="440" y="20" width="100" height="34" rx="5" class="fs" stroke="currentColor"/><text x="490" y="42">Split</text>
      <rect x="440" y="100" width="100" height="34" rx="5" class="fb sb"/><text x="490" y="117">Baseline →</text><text x="490" y="129">train/tune</text>
      <rect x="300" y="100" width="100" height="34" rx="5" class="fb sb"/><text x="350" y="122">Evaluate</text>
      <rect x="160" y="100" width="100" height="34" rx="5" class="fg sg"/><text x="210" y="122">Deploy</text>
      <rect x="20" y="100" width="100" height="34" rx="5" class="fr sr"/><text x="70" y="122">Monitor</text>
    </g>
    <g stroke="currentColor" marker-end="url(#mi-ah3)">
      <line x1="120" y1="37" x2="158" y2="37"/><line x1="260" y1="37" x2="298" y2="37"/><line x1="400" y1="37" x2="438" y2="37"/>
      <line x1="490" y1="54" x2="490" y2="98"/>
      <line x1="440" y1="117" x2="402" y2="117"/><line x1="300" y1="117" x2="262" y2="117"/><line x1="160" y1="117" x2="122" y2="117"/>
      <line x1="70" y1="100" x2="70" y2="56" stroke-dasharray="4 3"/>
    </g>
    <text x="80" y="82" class="tr">drift → retrain</text>
  </svg><figcaption>It is a loop. Monitoring sends you back to retrain when the world changes.</figcaption></figure>
  <p>Read the boxes clockwise from "Problem". The dashed arrow on the left is the important one: after launch, you keep watching, and go back to the start when things change.</p>
  <table class="tbl">
    <tr><th>Stage</th><th>Plain meaning</th><th>What really matters</th></tr>
    <tr><td><strong>Problem</strong></td><td>What decision will the model help with?</td><td>Which mistake costs more: a false alarm or a miss? Which business number should move?</td></tr>
    <tr><td><strong>Data / EDA</strong></td><td>EDA = exploratory data analysis: looking at the data before modelling</td><td>Does it look like live data? Check missing values, outliers, class balance, time patterns.</td></tr>
    <tr><td><strong>Features</strong></td><td>Choosing and building the input columns</td><td>Biggest win: good features help every model.</td></tr>
    <tr><td><strong>Split</strong></td><td>Keep some rows aside for honest checking</td><td>Lock away the test set before anything else (next section).</td></tr>
    <tr><td><strong>Baseline</strong></td><td>The simplest possible guess, e.g. "always predict the average"</td><td>Mean / majority → linear or logistic → gradient boosting. Know the score you must beat.</td></tr>
    <tr><td><strong>Train / tune</strong></td><td>Fit models; adjust their settings (hyperparameters)</td><td>Compare with cross-validation; tune the winner.</td></tr>
    <tr><td><strong>Deploy</strong></td><td>Put the model where real users or systems call it</td><td>API or batch job, versioned model, handle missing features, watch speed.</td></tr>
    <tr><td><strong>Monitor</strong></td><td>Keep checking it after launch</td><td>Input drift, label drift, broken pipelines. Without it, users tell you first.</td></tr>
  </table>
  <div class="callout pred"><span class="label">Example</span>
    <p>Baseline in numbers. In a loan dataset, 95 of 100 people repay. A "model" that always says "will repay" is right 95% of the time. So a real model with 94% accuracy is worse than doing nothing. Always know the baseline score first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Courses spend 90% of time on train/tune. Real projects fail at the two ends. A weaker model that is watched beats a stronger one that quietly gets worse.</p>
  </div>

  <h2 id="mi-split"><span class="num">04</span>Train / Validation / Test</h2>
  <p>Your teacher gives you 100 practice questions. You solve them again and again, until you score 100/100. Does that prove you know the subject? No. You may have just remembered those exact questions. The only fair check is a paper you have never seen.</p>
  <p>Models have the same problem. A flexible model can memorise its training rows. If you check it on those same rows, it looks perfect, and tells you nothing about new rows. So before training, you cut the data into three parts, each with one job:</p>
  <ul>
    <li><strong>Training set</strong> — the model learns from these rows.</li>
    <li><strong>Validation set</strong> ("val") — you use these to compare models and pick settings.</li>
    <li><strong>Test set</strong> — locked away. Used once, at the very end, to get an honest score.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Train = textbook exercises. Validation = mock exams. Test = the board exam. If you see the board paper early, your marks no longer show what you know.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 160" width="560">
    <rect x="20" y="30" width="364" height="36" class="fb sb"/><text x="202" y="53" text-anchor="middle">Train 70% · 397 rows</text>
    <rect x="384" y="30" width="78" height="36" class="ft st"/><text x="423" y="53" text-anchor="middle">Val 86</text>
    <rect x="462" y="30" width="78" height="36" class="fr sr"/><text x="501" y="53" text-anchor="middle">Test 86</text>
    <text x="202" y="84" text-anchor="middle" class="tm">fit the weights</text>
    <text x="423" y="84" text-anchor="middle" class="tm">tune, pick</text>
    <text x="501" y="84" text-anchor="middle" class="tm">use once</text>
    <text x="20" y="18" class="tm">Random (stratified) split — rows don't depend on order</text>
    <text x="20" y="114" class="tm">Time series — split by time, test = most recent</text>
    <rect x="20" y="122" width="364" height="22" class="fb sb"/><rect x="384" y="122" width="78" height="22" class="ft st"/><rect x="462" y="122" width="78" height="22" class="fr sr"/>
    <text x="30" y="137">Jan … Sep</text><text x="392" y="137">Oct–Nov</text><text x="472" y="137">Dec</text>
  </svg><figcaption>Three jobs, three sets. The test set plays the role of live data, so no choice may depend on it.</figcaption></figure>
  <p>Top bar: for normal data, rows are shuffled and split at random. Bottom bar: for data that changes over time (daily sales), you must cut by date. The model trains on the past and is tested on the latest months, exactly like real life.</p>
  <p>One more word: <strong>stratify</strong> means "keep the same share of each class in every part". If 63% of patients are healthy overall, each split should also be about 63% healthy. Without it, an unlucky split could put almost all sick patients in one part.</p>
  <p>Below, a real medical dataset with 569 patients is split 70 / 15 / 15. The last line shows that the share of class 1 is the same (about 0.63) in all three parts.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
X, y = load_breast_cancer(return_X_y=True, as_frame=True)
print(X.shape, y.value_counts().to_dict())
X_trval, X_test, y_trval, y_test = train_test_split(
    X, y, test_size=0.15, stratify=y, random_state=42)          # lock test first
X_tr, X_val, y_tr, y_val = train_test_split(
    X_trval, y_trval, test_size=0.15/0.85, stratify=y_trval, random_state=42)
print(len(X_tr), len(X_val), len(X_test))
print(round(y_tr.mean(),3), round(y_val.mean(),3), round(y_test.mean(),3))  # same class ratio</div>
  <div class="fx" data-lang="text">(569, 30) {1: 357, 0: 212}
397 86 86
0.627 0.628 0.628</div>
  <ul>
    <li><code>(569, 30)</code> = 569 rows, 30 feature columns.</li>
    <li>The test set is cut first and never touched again. The rest is then cut into train and val. <code>0.15/0.85</code> makes val 15% of the <em>original</em> data.</li>
    <li><code>random_state=42</code> fixes the shuffle so you get the same split every run.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Check test, tweak, check test again → test is now a second validation set and the score is too rosy. For time series, shuffling lets the future leak in: cut by date (<code>X.iloc[:train_end]</code> …). With little data, one small val set is noisy; use cross-validation instead (Core Concepts).</p>
  </div>

  <h2 id="mi-learn"><span class="num">05</span>How a Model Learns</h2>
  <h3>Loss: one number for "how wrong"</h3>
  <p>Play a guessing game with a friend. They think of a number; you guess; they say "too high" or "too low, by a lot". Each answer helps you make a better guess. A model learns the same way. But it needs one clear number that says how wrong it is right now. That number is called the <strong>loss</strong>.</p>
  <p>Training is just this: keep changing the model's numbers (its <strong>weights</strong>) so that the loss gets smaller. Without a loss, the model has no way to know if a change helped.</p>
  <p>A tiny example. The real answers are 10, 20, 30. The model guesses 12, 18, 36. In ML, the guess is written ŷ ("y-hat") and the real answer is y.</p>
  <div class="fx" data-lang="py">import numpy as np
y    = np.array([10, 20, 30])     # real answers
yhat = np.array([12, 18, 36])     # model's guesses
err = y - yhat
print("errors:", err)
print("MSE =", round((err**2).mean(), 2), "  MAE =", round(np.abs(err).mean(), 2))</div>
  <div class="fx" data-lang="text">errors: [-2  2 -6]
MSE = 14.67   MAE = 3.33</div>
  <p>By hand: the errors are −2, 2, −6. <strong>MAE</strong> (mean absolute error) drops the minus signs and averages: (2 + 2 + 6) / 3 = 3.33. <strong>MSE</strong> (mean squared error) squares each error first: (4 + 4 + 36) / 3 = 14.67. Notice how the one big miss (6 → 36) takes over MSE. Squaring punishes big misses much more.</p>
  <table class="tbl">
    <tr><th>Loss</th><th>Formula</th><th>In words</th><th>Outliers</th><th>Use when</th></tr>
    <tr><td><strong>MSE</strong></td><td>mean((y − ŷ)²)</td><td>Average of squared misses</td><td>Shout loudest (squared)</td><td>Big errors are much worse than small ones</td></tr>
    <tr><td><strong>MAE</strong></td><td>mean(|y − ŷ|)</td><td>Average size of the miss</td><td>Calm</td><td>Outliers are just noise</td></tr>
    <tr><td><strong>Huber</strong></td><td>MSE if |e| ≤ δ, else linear</td><td>Squared for small misses, plain for big ones; δ is the switch point</td><td>You choose via δ</td><td>MSE for small errors, MAE-like for big ones</td></tr>
    <tr><td><strong>Cross-entropy</strong></td><td>−Σ y·log ŷ</td><td>For probabilities: big fine when you were sure and wrong</td><td>Sure-but-wrong = huge</td><td>Any classification with probabilities</td></tr>
    <tr><td><strong>Hinge</strong></td><td>max(0, 1 − y·ŷ)</td><td>Zero if right by a safe gap, else a fine</td><td>Moderate</td><td>SVMs (margin-based)</td></tr>
  </table>
  <p>The choice of loss decides what "best" means. Try predicting <code>[1, 2, 3, 4, 100]</code> with one single number. Which number is best?</p>
  <div class="fx" data-lang="py">import numpy as np
y = np.array([1, 2, 3, 4, 100])                 # one outlier
c = np.linspace(0, 100, 100001)                 # try every constant prediction
mse = ((y[:, None] - c) ** 2).mean(0)
mae = np.abs(y[:, None] - c).mean(0)
print("best constant under MSE:", c[mse.argmin()], "= mean", y.mean())
print("best constant under MAE:", c[mae.argmin()], "= median", np.median(y))</div>
  <div class="fx" data-lang="text">best constant under MSE: 22.0 = mean 22.0
best constant under MAE: 3.0 = median 3.0</div>
  <p>Under MSE, the best single guess is the mean, 22, pulled up by the 100. Under MAE, it is the median, 3, which ignores the outlier. Same data, different loss, different "best".</p>

  <h3>Gradient descent</h3>
  <p>A model can have thousands or millions of weights. Trying every combination is impossible. We need a way to improve the weights step by step.</p>
  <p>The idea: at the current weights, find which direction makes the loss go down, and take a small step that way. Repeat. This is called <strong>gradient descent</strong>. The <strong>gradient</strong> is the slope of the loss: it says which way is uphill and how steep it is. You step the opposite way.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Walking down a hill in thick fog. You can't see the bottom, so you feel the slope under your feet, step downhill, repeat. The learning rate is the length of your step.</p>
  </div>
  <p>A tiny worked example with one weight. Say the loss is (w − 3)². It is smallest at w = 3, but the model doesn't know that. Start at w = 0, with step size 0.1.</p>
  <div class="fx" data-lang="py">w = 0.0                     # start with a guess
lr = 0.1                    # learning rate = step size
for step in range(1, 6):
    loss = (w - 3) ** 2     # loss is smallest at w = 3
    grad = 2 * (w - 3)      # slope of the loss at w
    w = w - lr * grad       # move a little downhill
    print(f"step {step}: loss before={loss:.2f}  slope={grad:+.2f}  new w={w:.3f}")</div>
  <div class="fx" data-lang="text">step 1: loss before=9.00  slope=-6.00  new w=0.600
step 2: loss before=5.76  slope=-4.80  new w=1.080
step 3: loss before=3.69  slope=-3.84  new w=1.464
step 4: loss before=2.36  slope=-3.07  new w=1.771
step 5: loss before=1.51  slope=-2.46  new w=2.017</div>
  <p>Step 1 by hand: the slope at w = 0 is 2 × (0 − 3) = −6. A negative slope means "downhill is to the right", so w grows: 0 − 0.1 × (−6) = 0.6. Each step, w moves closer to 3 and the loss shrinks. The steps also get shorter, because the slope flattens near the bottom.</p>
  <figure class="viz"><svg viewBox="0 0 560 180" width="560">
    <defs><marker id="mi-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <path d="M30 30 Q 140 270 250 30" fill="none" stroke="currentColor" opacity="0.6"/>
    <path d="M320 30 Q 430 270 540 30" fill="none" stroke="currentColor" opacity="0.6"/>
    <g class="tg" stroke="currentColor"><polyline points="45,60 80,114 110,141 130,149 138,150" fill="none" class="sg" marker-end="url(#mi-ah4)"/></g>
    <g fill="currentColor"><circle cx="45" cy="60" r="4" class="fg sg"/><circle cx="80" cy="114" r="4" class="fg sg"/><circle cx="110" cy="141" r="4" class="fg sg"/><circle cx="130" cy="149" r="4" class="fg sg"/></g>
    <polyline points="400,141 470,134 375,120 500,102 340,70" fill="none" class="sr" stroke-width="1.5" marker-end="url(#mi-ah4)"/>
    <circle cx="400" cy="141" r="4" class="fr sr"/><circle cx="470" cy="134" r="4" class="fr sr"/><circle cx="375" cy="120" r="4" class="fr sr"/><circle cx="500" cy="102" r="4" class="fr sr"/>
    <text x="140" y="174" text-anchor="middle" class="tg">α = 0.1: steps shrink → minimum</text>
    <text x="430" y="174" text-anchor="middle" class="tr">α = 1.2: overshoots → diverges</text>
    <text x="20" y="20" class="tm">loss</text><text x="250" y="160" class="tm">w</text>
  </svg><figcaption>Each step moves downhill by α × slope. Too big a step jumps over the valley and lands higher on the other side.</figcaption></figure>
  <p>Left: a sensible step size walks into the valley. Right: a step that is too long jumps across the valley each time, landing higher and higher. That is called <strong>diverging</strong>.</p>
  <p>Now the same idea on real data: 100 points made from the line y = 3x + 2 plus some noise. Gradient descent should find a slope near 3 and an intercept (the "b", or bias) near 2. The "normal eq" line is the exact answer from a formula, for comparison.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
x = rng.uniform(0, 2, 100)
y = 3 * x + 2 + rng.normal(0, 0.3, 100)       # truth: b=2, w=3
Xb = np.c_[np.ones(100), x]                     # add bias column

print("normal eq:", np.linalg.lstsq(Xb, y, rcond=None)[0].round(3))

def gd(lr, steps):
    w = np.zeros(2)
    for t in range(steps):
        grad = 2 / len(y) * Xb.T @ (Xb @ w - y)   # gradient of MSE
        w -= lr * grad
    return w, np.mean((Xb @ w - y) ** 2)

for lr, steps in [(0.1, 1), (0.1, 50), (0.1, 500), (1.2, 5)]:
    w, mse = gd(lr, steps)
    print(f"lr={lr} steps={steps:3d} w={w.round(3)} mse={mse:.4g}")</div>
  <div class="fx" data-lang="text">normal eq: [1.998 2.98 ]
lr=0.1 steps=  1 w=[1.053 1.374] mse=8.356
lr=0.1 steps= 50 w=[2.039 2.949] mse=0.08501
lr=0.1 steps=500 w=[1.998 2.98 ] mse=0.0846
lr=1.2 steps=  5 w=[5600.535 7242.419] mse=2.025e+08</div>
  <p>With lr = 0.1, after 500 steps it matches the exact answer [2, 3]. With lr = 1.2, five steps throw the weights into the thousands: it diverged.</p>
  <div class="callout def"><span class="label">Formula</span>
    <p><code>w ← w − α·∇L(w)</code>. In words: new weights = old weights − (step size × slope). <strong>w</strong> = the weights. <strong>α</strong> (alpha) = the learning rate, the step size. <strong>∇L(w)</strong> ("grad L") = the gradient, the slope of the loss in every weight's direction. The minus sign means "go downhill".</p>
  </div>
  <p>There are a few flavours. They differ in how many rows are used to measure the slope at each step (the <strong>batch</strong>), and in how the step is taken.</p>
  <table class="tbl">
    <tr><th>Variant</th><th>Batch</th><th>Idea</th><th>When</th></tr>
    <tr><td>Batch GD</td><td>All rows</td><td>Exact gradient, slow per step</td><td>Small, convex problems (one single valley)</td></tr>
    <tr><td>SGD</td><td>1 row</td><td>Stochastic = random. Noisy but cheap</td><td>Online / streaming data</td></tr>
    <tr><td>Mini-batch</td><td>32–512</td><td>GPU-friendly middle ground</td><td>Default for neural nets</td></tr>
    <tr><td>Momentum</td><td>Mini-batch</td><td><code>v ← βv + (1−β)g; w ← w − αv</code> (β≈0.9): like a rolling ball, keeps speed in a steady direction, less zig-zag. v = running average of slopes g</td><td>Deep nets when generalisation matters</td></tr>
    <tr><td>Adam</td><td>Mini-batch</td><td>Momentum m + average of g² (v); <code>w ← w − α·m̂/(√v̂+ε)</code>. Each weight gets its own step size: big where slopes are small and steady, small where they jump around</td><td>Default; β₁=0.9, β₂=0.999, α=1e-3</td></tr>
    <tr><td>AdamW</td><td>Mini-batch</td><td>Adam + weight decay (a pull of every weight towards 0) applied straight to w, not mixed into the gradient</td><td>Standard for transformers</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Adam gets down fast but may stop in a narrow pit. SGD+momentum is noisier and often lands in a wide valley, which works better on new data. Boosted trees (XGBoost, LightGBM) don't use these optimisers at all.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If the loss shoots up or becomes <code>nan</code>, the learning rate is usually too big. If the loss falls painfully slowly, it is too small. Try a few values 10× apart (0.1, 0.01, 0.001) before anything else.</p>
  </div>

  <h2 id="mi-lin"><span class="num">06</span>Linear &amp; Logistic Baselines</h2>
  <p>Before trying anything fancy, every DS team fits the two simplest models. One predicts numbers, one predicts yes/no. They are fast, easy to explain, and set the score to beat.</p>
  <h3>Linear regression: a straight-line rule</h3>
  <p>The tea stall model in section 01 was linear regression: "cups = 260 − 5 × temp". With more columns, it becomes "price = w₁ × area + w₂ × rooms + … + b". Each weight says how much the answer changes for one more unit of that column. The usual way to fit it is <strong>OLS</strong> (ordinary least squares): pick the weights that make the sum of squared misses smallest.</p>
  <h3>Logistic regression: the same line, turned into a chance</h3>
  <p>Now the question is yes/no: "will this customer repay the loan?" A straight line can output −0.3 or 1.4, which are not valid chances. So logistic regression first computes a straight-line score z, then squeezes it into the range 0 to 1 with the <strong>sigmoid</strong> function σ. A big positive z becomes close to 1. A big negative z becomes close to 0. z = 0 becomes exactly 0.5.</p>
  <p>Two more words. <strong>Odds</strong> = chance it happens ÷ chance it doesn't. A 0.8 chance gives odds 0.8 / 0.2 = 4, "4 to 1". <strong>Log-odds</strong> is just the log of that. Logistic regression's score z <em>is</em> the log-odds.</p>
  <div class="fx" data-lang="py">import numpy as np
sigmoid = lambda z: 1 / (1 + np.exp(-z))
for z in [-4, -2, 0, 2, 4]:
    p = sigmoid(z)
    print(f"score z={z:+d} -> probability {p:.2f}  odds {p/(1-p):.2f}")</div>
  <div class="fx" data-lang="text">score z=-4 -> probability 0.02  odds 0.02
score z=-2 -> probability 0.12  odds 0.14
score z=+0 -> probability 0.50  odds 1.00
score z=+2 -> probability 0.88  odds 7.39
score z=+4 -> probability 0.98  odds 54.60</div>
  <p>Every +2 in score multiplies the odds by the same amount (e² ≈ 7.39). But the probability moves a lot in the middle (0.50 → 0.88) and very little at the ends (0.88 → 0.98).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Linear regression = a tea stall owner guessing daily sales from temperature with one straight rule ("each degree colder → 5 more cups"). Logistic regression = the same straight rule, then squeezed through σ into a 0–1 chance ("70% chance it rains").</p>
  </div>
  <p>The two models side by side. Symbols: X = the table of inputs, w = weights, b = intercept (the value when every input is 0), σ = sigmoid, e ≈ 2.718.</p>
  <table class="tbl">
    <tr><th></th><th>Linear regression (OLS)</th><th>Logistic regression</th></tr>
    <tr><td>Predicts</td><td>ŷ = Xw (a number)</td><td>P(y=1|x) = σ(wᵀx + b) = 1/(1+e^−z)</td></tr>
    <tr><td>Loss</td><td>MSE = ‖y − Xw‖²</td><td>Log loss (binary cross-entropy) = negative log-likelihood</td></tr>
    <tr><td>Solved by</td><td>Closed form <code>w = (XᵀX)⁻¹Xᵀy</code> or GD</td><td>No closed form: lbfgs / liblinear / saga</td></tr>
    <tr><td>Linear in</td><td>The target</td><td>The log-odds: log(p/(1−p)) = wᵀx + b</td></tr>
    <tr><td>Coefficient</td><td>+1 unit of x → ŷ changes by w</td><td>+1 unit of x → odds × e^w (odds ratio)</td></tr>
    <tr><td>Boundary</td><td>—</td><td>wᵀx + b = 0: a straight hyperplane</td></tr>
  </table>
  <p>Reading the table: "P(y=1|x)" means "the chance that y is 1, given this x". "wᵀx" is just w₁x₁ + w₂x₂ + … added up. A "closed form" is a formula that gives the answer in one go, with no stepping. "Hyperplane" is the name for a flat cut: a line in 2-D, a flat sheet in 3-D.</p>
  <ul>
    <li><strong>Normal equation</strong>: the closed form for OLS. Set the slope of the loss to zero and solve. Cost O(nd² + d³) (n = rows, d = columns), fine for d up to ~10K. Use GD when d is huge or data streams in. It fails if two features are perfect copies (XᵀX can't be inverted); Ridge adds λI to fix it. Use <code>lstsq</code> (SVD), not an explicit inverse.</li>
    <li><strong>Geometry</strong>: ŷ is the shadow (projection) of y on the space of the features. So the leftover errors are at right angles to every feature: <code>Xᵀ(y − ŷ) = 0</code>.</li>
  </ul>
  <p>OLS also comes with four classic conditions, remembered as <strong>LINE</strong>. When they hold, the weights and their error bars can be trusted. The "residual" below means the leftover error, y − ŷ, for each row.</p>
  <table class="tbl">
    <tr><th>OLS assumption (LINE)</th><th>Plain meaning</th><th>If violated</th><th>Check / fix</th></tr>
    <tr><td><strong>L</strong>inearity</td><td>The true pattern is a straight line</td><td>Biased coefficients (serious)</td><td>Residual-vs-fitted plot; add polynomial terms or use a non-linear model</td></tr>
    <tr><td><strong>I</strong>ndependent errors</td><td>One row's miss doesn't predict the next</td><td>Standard errors too small (time series)</td><td>Durbin-Watson; lag features, Newey-West SEs</td></tr>
    <tr><td><strong>N</strong>ormal errors</td><td>Misses follow a bell curve</td><td>Only small-sample t-tests / CIs</td><td>Q-Q plot; matters least (CLT)</td></tr>
    <tr><td><strong>E</strong>qual variance</td><td>Misses are the same size everywhere</td><td>Inefficient estimates, wrong SEs</td><td>Residuals should be a flat band; log the target or use WLS</td></tr>
  </table>
  <p>(SE = standard error, the "± error bar" on a weight. CI = confidence interval. CLT = central limit theorem: averages of many rows become bell-shaped anyway.) The Regression page shows each of these with real plots.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Logistic regression" is a classifier, despite the name. Judge it with log loss, ROC-AUC or PR-AUC, never R². It can only draw a straight boundary unless you add curved features (like x²).</p>
  </div>

  <h2 id="mi-gen"><span class="num">07</span>Generalisation &amp; Drift</h2>
  <p>Swiggy builds a model in winter that predicts how long a delivery will take. It works well. Then the monsoon arrives. Roads flood, and the same 3 km now takes 40 minutes, not 15. The model has not changed, but the world has. Its guesses quietly get worse.</p>
  <p>A model is only good if it <strong>generalises</strong>: works on new data, not just the data it trained on. There are three common reasons it stops working:</p>
  <div class="cards">
    <div><b>Overfitting</b><p>Learned the noise by heart.</p><small>Big train–val gap → see Core Concepts</small></div>
    <div><b>Spurious pattern</b><p>A shortcut that is true only in the training data.</p><small>Row ID or a hospital's logo on X-rays predicts the label</small></div>
    <div><b>Distribution shift</b><p>Live data no longer looks like training data.</p><small>The most common failure in production</small></div>
  </div>
  <p>"Distribution" just means "how the values are spread out": how many orders come from near vs far, what share are fraud, and so on. Shift comes in three kinds. The short forms are: P(X) = how the inputs are spread; P(y) = how common each answer is; P(y|X) = the rule itself, "the answer, given the input".</p>
  <table class="tbl">
    <tr><th>Shift</th><th>What changes</th><th>Plain words</th><th>Example</th></tr>
    <tr><td><strong>Covariate shift</strong></td><td>P(X) changes, P(y|X) same</td><td>Different kinds of inputs, same rule</td><td>More mobile users; behaviour per device unchanged</td></tr>
    <tr><td><strong>Label shift</strong></td><td>P(y) changes</td><td>An answer becomes more or less common</td><td>Fraud rate doubles during a holiday</td></tr>
    <tr><td><strong>Concept drift</strong></td><td>P(y|X) changes</td><td>Same inputs now mean a different answer</td><td>COVID: same transaction features, different fraud meaning</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 520 130" width="520">
    <text x="10" y="16">Covariate shift: inputs move, rule same</text>
    <line x1="10" y1="100" x2="240" y2="100" stroke="currentColor"/>
    <path d="M20 100 Q 70 30 120 100" class="fb sb" fill-opacity="0.35"/>
    <path d="M100 100 Q 150 30 200 100" class="fr sr" fill-opacity="0.35"/>
    <text x="70" y="118" text-anchor="middle" class="tb">train X</text><text x="150" y="118" text-anchor="middle" class="tr">live X</text>
    <text x="280" y="16">Concept drift: same X, new answer</text>
    <line x1="280" y1="100" x2="510" y2="100" stroke="currentColor"/>
    <line x1="290" y1="95" x2="500" y2="35" class="sb" stroke-width="2"/>
    <line x1="290" y1="45" x2="500" y2="95" class="sr" stroke-width="2" stroke-dasharray="5 3"/>
    <text x="300" y="118" class="tb">old rule y|X</text><text x="420" y="118" class="tr">new rule y|X</text>
  </svg><figcaption>Left: input monitoring catches it. Right: inputs look normal, only fresh labels reveal the problem.</figcaption></figure>
  <p>Left picture: the hump of live inputs (red) has moved away from the training inputs (blue). You can see this just by watching the inputs. Right picture: the inputs look the same, but the line connecting input to answer has flipped. Only checking real outcomes shows it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The same Swiggy model. In monsoon, more orders come from far areas (covariate shift). Then roads flood and the same 3 km now takes 40 minutes, not 15 (concept drift).</p>
  </div>
  <p>How teams catch it. <strong>PSI</strong> (population stability index) is one number that says how much a column's spread has changed since training. Next to it, you track the model's real score on fresh labelled data, over a moving window of recent weeks.</p>
  <div class="flow"><span>Monitor PSI on inputs</span><span>Rolling AUC / precision on fresh labels</span><span>Alert on drop</span><span>Retrain on recent window</span></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Concept drift is the worst. Inputs look normal, so input checks stay green while accuracy falls. You need the real labels (even if late) to catch it.</p>
  </div>

  <h2 id="mi-first"><span class="num">08</span>First sklearn Model, End to End</h2>
  <p>Now everything comes together on the breast cancer data from section 04. The task: given 30 measurements of a lump, say whether it is malignant (cancer) or benign (harmless). Missing a cancer is the worst mistake, so we track <strong>recall</strong> too: out of all real cancers, how many did the model catch? (Model Evaluation covers this properly.)</p>
  <p>The plan, step by step:</p>
  <div class="flow"><span>Split (stratified)</span><span>Dummy baseline</span><span>Pipeline candidates</span><span>Pick on val</span><span>Refit train+val</span><span>Test once</span></div>
  <ul>
    <li><strong>DummyClassifier</strong> — a fake model that always guesses the most common class. It is the baseline.</li>
    <li><strong>Pipeline</strong> (<code>make_pipeline</code>) — chains steps so they always run in the same order. Here: first scale the columns to a similar range (<code>StandardScaler</code>), then the model.</li>
    <li><strong>RandomForest</strong> — a stronger model made of many decision trees (Trees page).</li>
    <li><strong>accuracy</strong> = share of all answers that were right.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, recall_score
y = 1 - y        # flip so 1 = malignant, the case we must catch (re-split as above)

models = {
  "baseline": DummyClassifier(strategy="most_frequent"),
  "logreg":   make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
  "forest":   RandomForestClassifier(n_estimators=200, random_state=42),
}
for name, m in models.items():
    m.fit(X_tr, y_tr)
    p = m.predict(X_val)
    print(f"{name:9s} val acc={accuracy_score(y_val, p):.3f} recall={recall_score(y_val, p):.3f}")

best = models["logreg"].fit(X_trval, y_trval)      # refit on train+val
p = best.predict(X_test)                             # test touched ONCE
print("TEST acc", round(accuracy_score(y_test, p),3), "recall", round(recall_score(y_test, p),3))
print("P(malignant) first 3 test rows:", best.predict_proba(X_test.iloc[:3])[:, 1].round(3))
coef = pd.Series(best[-1].coef_[0], index=X.columns)
top = coef.abs().sort_values(ascending=False).index[:3]
print(pd.DataFrame({"coef": coef[top].round(2), "odds_x": np.exp(coef[top]).round(2)}))</div>
  <div class="fx" data-lang="text">baseline  val acc=0.628 recall=0.000
logreg    val acc=0.977 recall=0.969
forest    val acc=0.953 recall=0.906
TEST acc 0.988 recall 0.969
P(malignant) first 3 test rows: [0.006 0.    0.002]
                coef  odds_x
radius error    1.22    3.40
worst texture   1.20    3.33
worst symmetry  1.01    2.75</div>
  <ul>
    <li><strong>Baseline</strong>: 62.8% accuracy but it catches zero cancers. Accuracy alone would fool you.</li>
    <li><strong>Pick on val</strong>: logistic regression wins on validation (0.977), so it is the one we keep. Only then is the test set used, once: 0.988.</li>
    <li><strong>Refit on train+val</strong>: once the choice is made, the winner is trained again on more data before the final test.</li>
    <li><strong>Pipeline</strong>: the scaler learns its mean/std only from the data given to <code>fit</code>, so nothing from the test set leaks in.</li>
    <li><strong>predict_proba</strong> gives a chance (0.006 = 0.6% malignant) instead of a hard yes/no.</li>
    <li><strong>Odds ratio</strong>: on scaled features, +1 standard deviation of "radius error" multiplies the odds of malignant by 3.4.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Don't stop at <code>predict</code>. Keep <code>predict_proba</code>: the 0.5 cut-off is just a default, not a business choice (see Model Evaluation).</p>
  </div>

  <h2 id="mi-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In the tea stall example, what are X, y, the model, training and inference?</summary><div class="qa-body">X = temperature (the input). y = cups sold (the answer). The model = the learned rule "cups = 260 − 5 × temp". Training = <code>fit</code> on the five past days. Inference = <code>predict</code> for a new 28 °C day (120 cups).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predicting tomorrow's rainfall in mm vs predicting "will it rain: yes/no". Which is regression, which is classification?</summary><div class="qa-body">Rainfall in mm is a number → regression. Yes/no is a group → classification. Both are supervised, because past days come with the right answer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Supervised vs unsupervised vs self-supervised vs reinforcement learning?</summary><div class="qa-body">Supervised: answers given (X, y); learn X → y (regression or classification). Unsupervised: only X; find groups, compress, find odd rows. Self-supervised: labels made from the data itself (next word, hidden word), so LLMs can train on billions of examples with no human labelling. Reinforcement: an agent acts, gets rewards, and learns which actions pay off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the test set touched only once?</summary><div class="qa-body">It stands in for unseen live data. Each time a test score changes a decision, the test set becomes part of training choices and the score gets too rosy. Tune on validation or CV; check test once, at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why build a baseline first?</summary><div class="qa-body">It tells you what "good" means. Always guessing the majority class scored 62.8% on breast cancer; on a 99/1 fraud set it would score 99%. If a fancy model barely beats it, fix the data or features, not the algorithm.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You fit y = [1, 2, 3, 4, 100] with a single constant. What does MSE choose, what does MAE choose?</summary><div class="qa-body">MSE → the mean, 22. MAE → the median, 3. Squaring makes the outlier shout loudest. So use MAE (or Huber) when outliers are just noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Loss = (w − 3)², w = 0, learning rate 0.1. What is w after one step?</summary><div class="qa-body">Slope = 2 × (0 − 3) = −6. New w = 0 − 0.1 × (−6) = 0.6. It moved towards 3, the bottom of the loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if the learning rate is too high or too low?</summary><div class="qa-body">Too high: steps jump past the minimum and the loss grows (lr = 1.2 gave MSE 2e8 after 5 steps). Too low: training takes forever or gets stuck on flat parts. Use a schedule (warm-up, then decay) or an adaptive optimiser like Adam.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Adam vs SGD with momentum?</summary><div class="qa-body">Both keep a running average of gradients (momentum). Adam also tracks the average squared gradient and divides by its root, so each weight gets its own step size. Adam trains fast with little tuning; SGD+momentum sometimes does better on new data for big nets. AdamW applies weight decay separately and is the transformer default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Normal equation or gradient descent for linear regression?</summary><div class="qa-body">Normal equation <code>w = (XᵀX)⁻¹Xᵀy</code>: exact answer, no learning rate, cost O(d³); fine up to ~10K features with data in memory. Gradient descent: huge d, data that doesn't fit in memory, or losses with no formula answer (Lasso, logistic). In practice use <code>lstsq</code>/SVD, not an explicit inverse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a logistic regression coefficient of 0.5 mean?</summary><div class="qa-body">One more unit of that feature adds 0.5 to the log-odds, so the odds get multiplied by e^0.5 ≈ 1.65 (+65%). The change in probability depends on where you are on the S-curve: big near p = 0.5, tiny near p = 0.01.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which OLS assumptions matter most?</summary><div class="qa-body">Linearity (if broken, coefficients are wrong) and independence (linked errors make standard errors too small, so everything looks significant). Equal spread affects standard errors. Normal errors matter least: with large n the CLT makes estimates roughly normal anyway.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is concept drift and how do you handle it?</summary><div class="qa-body">P(y|X) changes: the same inputs now mean something else (fraud patterns during COVID). Input checks can miss it, so track model metrics on fresh labels over a rolling window (AUC, precision). Fix: regular retraining on recent data for slow drift, retrain on alert for sudden drops, and give old data less weight.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the minimal correct sklearn workflow for a new tabular classification task.</summary><div class="qa-body">Stratified split to lock a test set → <code>DummyClassifier</code> baseline → <code>make_pipeline(preprocessing, model)</code> candidates compared on validation or CV → refit the winner on train+val → check test once → keep <code>predict_proba</code> and set the threshold by business cost.</div></details>
</main>`
});
