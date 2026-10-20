// notes/dl/dl_neurons.js — Neurons, Layers & Activations
Object.assign(TOPIC_CONTENT, {
  "dl_neurons": `<main>
  <h1>Neurons, Layers &amp; Activations</h1>
  <div class="where"><span>Deep Learning</span><span>Neural Networks</span><span>Neurons, Layers &amp; Activations</span></div>
  <p class="lead">A neural network is built from one tiny part repeated thousands of times: the <strong>neuron</strong>, a weighted vote followed by a bend. This note builds that part, shows exactly where one neuron fails (a problem a straight line cannot solve), fixes it with a hidden layer you can compute by hand, then explains the bends (activation functions) and the output layer (sigmoid and softmax). One running example throughout: <strong>will this delivery be late?</strong> from two facts, distance and rain. Every output below is from a real run (PyTorch 2.14, CPU, single thread).</p>

  <h2 id="dn-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 150" width="680">
<defs><marker id="dn-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="41" text-anchor="middle" font-size="12">NN: the map</text><text x="70" y="58" text-anchor="middle" class="tm" font-size="10">the need chain</text>
<line x1="130" y1="45" x2="148" y2="45" stroke="currentColor" marker-end="url(#dn-a0)"/>
<rect x="150" y="20" width="120" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="210" y="41" text-anchor="middle" font-size="12" font-weight="700">Neurons</text><text x="210" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="270" y1="45" x2="288" y2="45" stroke="currentColor" marker-end="url(#dn-a0)"/>
<rect x="290" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="350" y="41" text-anchor="middle" font-size="12">Loss &amp; Backprop</text><text x="350" y="58" text-anchor="middle" class="tm" font-size="10">who gets the blame</text>
<line x1="410" y1="45" x2="428" y2="45" stroke="currentColor" marker-end="url(#dn-a0)"/>
<rect x="430" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="485" y="41" text-anchor="middle" font-size="12">Training Well</text><text x="485" y="58" text-anchor="middle" class="tm" font-size="10">optimizers, init, reg.</text>
<line x1="540" y1="45" x2="558" y2="45" stroke="currentColor" marker-end="url(#dn-a0)"/>
<rect x="560" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="615" y="41" text-anchor="middle" font-size="12">PyTorch</text><text x="615" y="58" text-anchor="middle" class="tm" font-size="10">same model, real tool</text>
<text x="340" y="110" text-anchor="middle" class="tm" font-size="10.5">running example in every note: 4 orders (near/far × dry/rain) → late or on time,</text>
<text x="340" y="126" text-anchor="middle" class="tm" font-size="10.5">plus 1,000 generated orders for "the same idea at scale"</text>
</svg><figcaption>The Neural Networks track. This note builds the network; the next one measures how wrong it is and assigns blame to each weight.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dl_foundations">Neural Networks: the map</a> and <a class="xref" data-note="ml_classification">Logistic Regression</a></b><span>Logistic regression is already one neuron: a weighted sum, then a sigmoid. It draws one straight boundary. Our late-delivery data needs a boundary that bends, so a straight line is stuck at 50% accuracy.</span></li>
    <li><b>This note adds: the parts a network is made of</b><span>The neuron, why one neuron fails (traced), the hidden layer that fixes it (worked by hand), the forward pass in matrix form, activation functions and why ReLU, and the output layer (sigmoid, softmax).</span></li>
    <li><b>Leads to: <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a></b><span>Here we set the weights of the XOR network by hand. A real network has thousands of weights; it must find them itself. That needs a score for "how wrong" (loss) and a way to tell every weight which way to move (backprop).</span></li>
  </ol>

  <h2 id="dn-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. Running example: four orders A (near, dry, on time), B (near, rain, late), C (far, dry, late), D (far, rain, on time). Late = exactly one of "far" and "rain".</p>
  <ol class="story">
    <li><b>Neuron (perceptron)</b><span>Q: how can a machine turn "distance and rain" into a yes/no? → A weighted vote: z = w₁·far + w₂·rain + b, say "late" if z ≥ 0. With w = (1, 1), b = −1.5 it learns "needs a van" (far AND rain) perfectly. But can it learn "late"?</span></li>
    <li><b>The XOR failure</b><span>Q: why can't one neuron learn our late rule? → Its rule is one straight line, and the late orders B and C sit on opposite corners. Traced: the weights cycle forever (3, 3, 4 errors per round); logistic regression gives 0.5 to every order. We need a boundary that bends…</span></li>
    <li><b>Hidden layer (MLP)</b><span>Q: how do we get a bent boundary out of straight-line parts? → Two neurons first make new features (h₁ = "at least one", h₂ = "both"), then a third combines them: h₁ − 2h₂ gives 0, 1, 1, 0. Correct on all four. But how is this computed for thousands of orders and neurons at once?</span></li>
    <li><b>Forward pass (matrix form)</b><span>Q: how does data flow through layers efficiently? → One matrix multiply per layer: H = ReLU(XWᵀ + b), shapes (4, 2) → (4, 2) → (4, 1). But we used ReLU. Why that bend, and does the bend matter?</span></li>
    <li><b>Activation functions</b><span>Q: what is the bend for, and which one? → Without it, layers collapse into one straight line (the XOR net without ReLU scores 2 − (far + rain): wrong). ReLU keeps slope 1 for positive inputs, sigmoid's slope is at most 0.25. But the final output should be a probability…</span></li>
    <li><b>Output layer: sigmoid and softmax</b><span>Q: how do raw scores become probabilities? → Sigmoid for one yes/no (score 0.6 → 64.6% late), softmax for several classes (on time / a bit late / very late: 2.0, 1.0, 0.1 → 0.659, 0.242, 0.099). Next: how wrong is 64.6%, and how do the weights learn? → <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>.</span></li>
  </ol>

  <h2 id="dn-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Neurons, Layers &amp; Activations</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Neuron</div>
        <ul>
          <li><b>z = w·x + b</b>, then an activation; 💡 a weighted vote with a pass mark</li>
          <li><b>Perceptron rule</b> w ← w + α(y − ŷ)x; moves only when wrong</li>
          <li>Learns AND ("needs a van" = far AND rain) with w = (1, 1), b = −1.5 style lines</li>
          <li>Logistic regression = one neuron + sigmoid</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">XOR failure</div>
        <ul>
          <li>Late = far XOR rain; B, C on opposite corners</li>
          <li>Proof: b &lt; 0, w₂ + b ≥ 0, w₁ + b ≥ 0, w₁ + w₂ + b &lt; 0 can't all hold</li>
          <li>Perceptron cycles: 3, 3, 4 errors…; logistic regression: 0.5 for all</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Hidden layer</div>
        <ul>
          <li>h₁ = ReLU(far + rain), h₂ = ReLU(far + rain − 1)</li>
          <li>out = h₁ − 2h₂ → A 0, B 1, C 1, D 0</li>
          <li>Hidden layer = new features in which a line works</li>
          <li>Universal approximation: wide enough → any smooth shape</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Forward pass</div>
        <ul>
          <li>Zˡ = Aˡ⁻¹Wˡᵀ + bˡ, Aˡ = σ(Zˡ); A⁰ = X</li>
          <li>W is (out × in); batch (B × in) → (B × out)</li>
          <li>Parameters per layer: in·out + out</li>
          <li>⚠ No activation → W₂W₁ = one matrix</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Activations</div>
        <ul>
          <li><b>ReLU</b> max(0, z): slope 1 or 0; default hidden</li>
          <li><b>Sigmoid</b> (0, 1), slope ≤ 0.25; outputs only</li>
          <li><b>Tanh</b> (−1, 1), slope ≤ 1; RNN states</li>
          <li><b>Leaky ReLU, GELU</b>: no dead zone / smooth</li>
          <li>⚠ Dying ReLU: z &lt; 0 always → slope 0 forever</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Output layer</div>
        <ul>
          <li><b>Sigmoid</b> one yes/no: σ(0.6) = 0.646</li>
          <li><b>Softmax</b> pᵢ = eᶻⁱ/Σeᶻʲ; (2, 1, 0.1) → (0.659, 0.242, 0.099)</li>
          <li>Adding a constant to all scores changes nothing</li>
          <li>⚠ Softmax never in hidden layers</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dn-data"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Late-Delivery Problem</span><span class="rm-sub">Four orders, one bent rule</span></div></div>
      <div class="rm-item rm-done" data-target="dn-perc"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Neuron</span><span class="rm-sub">A weighted vote with a pass mark</span></div></div>
      <div class="rm-item rm-done" data-target="dn-xor"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Why One Neuron Fails</span><span class="rm-sub">XOR traced and proved</span></div></div>
      <div class="rm-item rm-done" data-target="dn-mlp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Hidden Layers</span><span class="rm-sub">Solving XOR by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dn-fwd"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Forward Pass</span><span class="rm-sub">Layers as matrix multiplies</span></div></div>
      <div class="rm-item rm-done" data-target="dn-act"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Activation Functions</span><span class="rm-sub">Why the bend, why ReLU</span></div></div>
      <div class="rm-item rm-done" data-target="dn-soft"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Sigmoid &amp; Softmax Outputs</span><span class="rm-sub">Scores into probabilities</span></div></div>
      <div class="rm-item rm-done" data-target="dn-connect"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table, one picture</span></div></div>
      <div class="rm-item rm-done" data-target="dn-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dn-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dn-data"><span class="num">01</span>The Late-Delivery Problem</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want a machine that predicts "late or on time" from facts about an order. Before building anything: what exactly does the data look like, and why is it hard for the models we already know?</p>
  </div>
  <p>A small food shop delivers in a city. Its owner noticed a strange pattern. In dry weather every order goes by bike, so <strong>far</strong> orders are late and near ones are on time. When it <strong>rains</strong>, the owner sends far orders by van on the highway, which is fast, but near orders still go by bike through flooded lanes, which is slow. So an order is late when it is far <em>or</em> raining, but <em>not both</em>. Four orders tell the whole story:</p>
  <table class="tbl"><caption>The running example: four orders (1 = yes, 0 = no)</caption>
    <tr><th>Order</th><th>far (x₁)</th><th>rain (x₂)</th><th>late (y)</th><th>Why</th></tr>
    <tr><td>A</td><td>0</td><td>0</td><td>0</td><td>near, dry: bike, quick</td></tr>
    <tr><td>B</td><td>0</td><td>1</td><td>1</td><td>near, rain: bike in flooded lanes</td></tr>
    <tr><td>C</td><td>1</td><td>0</td><td>1</td><td>far, dry: long bike ride</td></tr>
    <tr><td>D</td><td>1</td><td>1</td><td>0</td><td>far, rain: van on the highway</td></tr>
  </table>
  <p>In logic this pattern is called <strong>XOR</strong> ("exclusive or": one or the other, not both). Plot the four orders on a square, distance across, rain up. The late ones (red) sit on one diagonal, the on-time ones (green) on the other:</p>
  <figure class="viz"><svg viewBox="0 0 560 210" width="560">
<line x1="60" y1="170" x2="250" y2="170" stroke="currentColor" opacity="0.4"/><line x1="60" y1="170" x2="60" y2="10" stroke="currentColor" opacity="0.4"/>
<text x="120" y="200" class="tm" font-size="11">far (distance) →</text><text x="10" y="90" class="tm" font-size="11">rain ↑</text>
<circle cx="80" cy="150" r="9" class="fg sg"/><text x="94" y="155" font-size="12">A</text>
<circle cx="80" cy="40" r="9" class="fr sr"/><text x="94" y="45" font-size="12">B</text>
<circle cx="220" cy="150" r="9" class="fr sr"/><text x="234" y="155" font-size="12">C</text>
<circle cx="220" cy="40" r="9" class="fg sg"/><text x="234" y="45" font-size="12">D</text>
<line x1="40" y1="20" x2="260" y2="180" class="sb" stroke-dasharray="5 3"/><text x="150" y="20" class="tb" font-size="10.5">any straight line…</text>
<text x="300" y="40" font-size="12">red = late, green = on time</text>
<text x="300" y="70" font-size="11.5" class="tm">A straight line splits the plane into two halves.</text>
<text x="300" y="90" font-size="11.5" class="tm">B and C must be in the same half (late),</text>
<text x="300" y="110" font-size="11.5" class="tm">A and D in the other. But B and C are on</text>
<text x="300" y="130" font-size="11.5" class="tm">opposite corners, and so are A and D.</text>
<text x="300" y="160" font-size="11.5" class="tr">No single line can do it.</text>
</svg><figcaption>The four orders. Whatever line you draw, at least one order ends up on the wrong side. Section 03 proves it.</figcaption></figure>
  <p>The four orders are tiny on purpose: every number in this note can be checked by hand on them. Real data has many orders with exact distances (in km) and rain (in mm per hour). The same pattern at scale, generated with a fixed seed: 1,000 orders, distance 0–10 km, rain 0–20 mm/h, late if (distance &gt; 5) XOR (rain &gt; 10), and 5% of labels flipped at random because real life is noisy. Both inputs are divided by their maximum so they lie between 0 and 1.</p>
<div class="fx" data-lang="py">import torch

def make_orders(n=1000, noise=0.05, seed=0):
    g = torch.Generator().manual_seed(seed)
    km = torch.rand(n, generator=g) * 10          # distance 0-10 km
    rain = torch.rand(n, generator=g) * 20        # rain 0-20 mm/h
    late = (km &gt; 5) ^ (rain &gt; 10)                 # ^ is XOR: one or the other, not both
    flip = torch.rand(n, generator=g) &lt; noise     # 5% of labels flipped (real-life noise)
    late = late ^ flip
    X = torch.stack([km / 10, rain / 20], 1)      # scaled to 0..1, shape (n, 2)
    return X, late.float()

X4 = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])   # orders A, B, C, D
y4 = torch.tensor([0., 1., 1., 0.])
X, y = make_orders()
print("tiny:", X4.shape, y4.tolist())
print("at scale:", X.shape, "first 3 rows", [[round(v, 2) for v in row] for row in X[:3].tolist()], "labels", y[:3].tolist())
print("share late:", round(y.mean().item(), 3))</div>
  <div class="fx" data-lang="text">tiny: torch.Size([4, 2]) [0.0, 1.0, 1.0, 0.0]
at scale: torch.Size([1000, 2]) first 3 rows [[0.5, 0.46], [0.77, 0.11], [0.09, 0.5]] labels [0.0, 1.0, 0.0]
share late: 0.489</div>
  <p>What happened: <code>make_orders</code> draws random distances and rain amounts, applies the XOR rule with <code>^</code>, then flips 5% of the answers. The scaled inputs (0.75 means 7.5 km) form a tensor of shape (1000, 2): 1,000 rows, 2 features. About half the orders are late, so a model that always says "on time" would be right only about 51% of the time.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A light controlled by two switches at the two ends of a staircase. Flip either switch and the light changes; flip both and it is back to how it was. The light is "on" when exactly one switch is up. That is XOR, and our late rule is that staircase light.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>feature</strong> is one input number per example (far, rain). A <strong>label</strong> is the answer we want to predict (late). <strong>Linearly separable</strong> data can be split into its classes by one straight line (in 2-D) or one flat plane (in more dimensions). Our data is <em>not</em> linearly separable.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not judge a model only on "it got most orders right". On the four orders, always saying "late" or always saying "on time" already scores 50%. The bar to beat is the majority-class rate (here about 51% at scale).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the neuron.</b> We have the data and know a straight line will fail. But what is the basic unit that draws such a line, and how does it learn its line from examples?</div>

  <h2 id="dn-perc"><span class="num">02</span>The Neuron (Perceptron)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How can a machine turn two facts (far, rain) into a yes/no decision, and change its own rule when it gets an order wrong?</p>
  </div>
  <p>Start with an easier question about the same orders: <strong>does this order need the van?</strong> The owner uses the van only when the order is far <em>and</em> it is raining. A simple scoring rule does it: give 1 point for far, 1 point for rain, subtract a pass mark of 1.5, and say "van" if the total is at least 0. Order D: 1 + 1 − 1.5 = 0.5 ≥ 0 → van. Order B: 0 + 1 − 1.5 = −0.5 → no van.</p>
  <p>That rule is a <strong>perceptron</strong>, the first artificial neuron. In plain words: multiply each input by its importance (its <strong>weight</strong> w), add them up, add a fixed shift (the <strong>bias</strong> b, which moves the pass mark), and pass the total z through a yes/no step (the <strong>activation</strong>).</p>
  <figure class="viz"><svg viewBox="0 0 520 170" width="520">
<defs><marker id="dn-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<circle cx="40" cy="40" r="18" class="fb sb"/><text x="40" y="45" text-anchor="middle" font-size="11">far</text>
<circle cx="40" cy="125" r="18" class="fb sb"/><text x="40" y="130" text-anchor="middle" font-size="11">rain</text>
<line x1="58" y1="45" x2="148" y2="78" stroke="currentColor" marker-end="url(#dn-a1)"/><text x="90" y="52" class="tm">w₁ = 1</text>
<line x1="58" y1="120" x2="148" y2="92" stroke="currentColor" marker-end="url(#dn-a1)"/><text x="90" y="128" class="tm">w₂ = 1</text>
<circle cx="178" cy="85" r="28" class="ft st"/><text x="178" y="82" text-anchor="middle">Σ + b</text><text x="178" y="98" text-anchor="middle" class="tm" font-size="10">b = −1.5</text>
<line x1="206" y1="85" x2="246" y2="85" stroke="currentColor" marker-end="url(#dn-a1)"/>
<rect x="248" y="65" width="70" height="40" rx="6" class="fv sb"/><text x="283" y="90" text-anchor="middle">z ≥ 0 ?</text>
<line x1="318" y1="85" x2="350" y2="85" stroke="currentColor" marker-end="url(#dn-a1)"/><text x="356" y="90">ŷ ∈ {0, 1}</text>
<text x="356" y="130" class="tm" font-size="11">D: 1 + 1 − 1.5 = 0.5 → 1 (van)</text>
<text x="356" y="148" class="tm" font-size="11">B: 0 + 1 − 1.5 = −0.5 → 0</text>
</svg><figcaption>A neuron: inputs times weights, summed with the bias, then a yes/no step.</figcaption></figure>
  <h3>How it learns: the perceptron rule</h3>
  <p>Nobody gives the neuron its weights; it starts at zero and corrects itself. After each order: if the answer was wrong, move each weight a little toward what would have been right, <code>w ← w + α(y − ŷ)x</code>, and the bias by <code>α(y − ŷ)</code>. Here y is the true answer, ŷ the guess, α the learning rate (step size, here 1). If the guess was right, y − ŷ = 0 and nothing moves. If it said 0 but the truth was 1, the inputs that were "on" get more weight.</p>
  <p>Trace the first mistake by hand. Start w = (0, 0), b = 0. Order A: z = 0 ≥ 0 → says 1, truth 0. Error y − ŷ = −1, so w += −1·(0, 0) = (0, 0) and b += −1 → b = −1. The neuron learned "be more cautious". The code runs this rule on the van question and, for later, on the late question:</p>
<div class="fx" data-lang="py">def train_perceptron(X, y, epochs=10, lr=1.0):
    w = torch.zeros(2); b = 0.0
    for _ in range(epochs):
        for xi, yi in zip(X, y):
            pred = 1.0 if (w @ xi + b) &gt;= 0 else 0.0
            w += lr * (yi - pred) * xi          # move only when wrong
            b += lr * (yi - pred)
    preds = [1 if (w @ xi + b) &gt;= 0 else 0 for xi in X]
    return w.tolist(), float(b), preds

van = torch.tensor([0., 0., 0., 1.])           # needs the van = far AND rain
print("van  (AND):", train_perceptron(X4, van))
print("late (XOR):", train_perceptron(X4, y4, epochs=100))</div>
  <div class="fx" data-lang="text">van  (AND): ([2.0, 1.0], -3.0, [0, 0, 0, 1])
late (XOR): ([-1.0, 0.0], 0.0, [1, 1, 0, 0])</div>
  <p>The van rule is learned perfectly: predictions [0, 0, 0, 1] with weights (2, 1) and bias −3 (a different line from our hand-made one, but it splits the orders the same way: only D scores ≥ 0). The late rule is wrong even after 100 rounds: [1, 1, 0, 0] gets C and A wrong. Section 03 shows this is not bad luck.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A committee vote. Each input casts a vote of size "its weight", the bias is the chairperson's own leaning, and the step decides if the motion passes. The perceptron rule is the committee changing how much it trusts each member after every wrong decision.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>neuron</strong> computes z = w·x + b = w₁x₁ + … + wₙxₙ + b, then an activation a = σ(z). With a step activation it is a <strong>perceptron</strong>. With a sigmoid activation σ(z) = 1/(1 + e⁻ᶻ) it is exactly <a class="xref" data-note="ml_classification">logistic regression</a>. The set of points where z = 0 is a straight line (a hyperplane in more dimensions): the <strong>decision boundary</strong>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting the bias. Without b, the boundary w·x = 0 must pass through the origin (order A's corner), which rules out most useful lines. Every layer in a network has a bias for this reason.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: why the late rule fails.</b> One neuron learned "needs the van" but not "late". Is that a training problem we could fix with more rounds or a better rule, or is one neuron fundamentally unable to do it?</div>

  <h2 id="dn-xor"><span class="num">03</span>Why One Neuron Fails: XOR Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The perceptron failed on the late rule after 100 rounds. Would 1,000 rounds help? Would a smarter learning rule (logistic regression) help? Or is the problem the neuron itself?</p>
  </div>
  <p>Watch the perceptron rule round by round on orders A–D, starting from zero. Each line is one order: the score z, the guess, the truth, and the weights after the update.</p>
<div class="fx" data-lang="py">w = torch.zeros(2); b = 0.0
for ep in range(1, 4):
    errors = 0
    for name, xi, yi in zip("ABCD", X4, y4):
        z = (w @ xi + b).item(); pred = 1.0 if z &gt;= 0 else 0.0
        w += (yi - pred) * xi; b += (yi - pred).item()
        errors += int(pred != yi)
        print(f"round {ep} {name} z={z:+.0f} guess={pred:.0f} truth={yi:.0f} -&gt; w={w.tolist()} b={b:+.0f}")
    print("  errors this round:", errors)</div>
  <div class="fx" data-lang="text">round 1 A z=+0 guess=1 truth=0 -&gt; w=[0.0, 0.0] b=-1
round 1 B z=-1 guess=0 truth=1 -&gt; w=[0.0, 1.0] b=+0
round 1 C z=+0 guess=1 truth=1 -&gt; w=[0.0, 1.0] b=+0
round 1 D z=+1 guess=1 truth=0 -&gt; w=[-1.0, 0.0] b=-1
  errors this round: 3
round 2 A z=-1 guess=0 truth=0 -&gt; w=[-1.0, 0.0] b=-1
round 2 B z=-1 guess=0 truth=1 -&gt; w=[-1.0, 1.0] b=+0
round 2 C z=-1 guess=0 truth=1 -&gt; w=[0.0, 1.0] b=+1
round 2 D z=+2 guess=1 truth=0 -&gt; w=[-1.0, 0.0] b=+0
  errors this round: 3
round 3 A z=+0 guess=1 truth=0 -&gt; w=[-1.0, 0.0] b=-1
round 3 B z=-1 guess=0 truth=1 -&gt; w=[-1.0, 1.0] b=+0
round 3 C z=-1 guess=0 truth=1 -&gt; w=[0.0, 1.0] b=+1
round 3 D z=+2 guess=1 truth=0 -&gt; w=[-1.0, 0.0] b=+0
  errors this round: 4</div>
  <p>Read round 2 and round 3. Round 3 starts at w = (−1, 0), b = 0; after order A it is w = (−1, 0), b = −1, which is exactly where round 2 started. From there the same four updates repeat forever: fixing B breaks C, fixing C breaks D, fixing D breaks A. The rule never settles because there is nothing to settle on.</p>
  <h3>The proof in four lines</h3>
  <p>Suppose some weights w₁, w₂ and bias b did work. Each order gives one condition on the score z = w₁·far + w₂·rain + b:</p>
  <table class="tbl">
    <tr><th>Order</th><th>Needs</th><th>Condition</th></tr>
    <tr><td>A (0, 0), on time</td><td>z &lt; 0</td><td>b &lt; 0</td></tr>
    <tr><td>B (0, 1), late</td><td>z ≥ 0</td><td>w₂ + b ≥ 0</td></tr>
    <tr><td>C (1, 0), late</td><td>z ≥ 0</td><td>w₁ + b ≥ 0</td></tr>
    <tr><td>D (1, 1), on time</td><td>z &lt; 0</td><td>w₁ + w₂ + b &lt; 0</td></tr>
  </table>
  <p>Add the B and C conditions: w₁ + w₂ + 2b ≥ 0, so w₁ + w₂ + b ≥ −b. From A, b &lt; 0, so −b &gt; 0, which means w₁ + w₂ + b &gt; 0. That contradicts D. No weights exist. More rounds cannot help.</p>
  <p>A smarter learning rule does not help either. Logistic regression (one neuron with a sigmoid, trained properly by gradient descent, see <a class="xref" data-note="ml_classification">Logistic Regression</a>) gives up in the most honest way possible:</p>
<div class="fx" data-lang="py">from sklearn.linear_model import LogisticRegression
lr_model = LogisticRegression().fit(X4.numpy(), y4.numpy())
print("weights", lr_model.coef_.round(3), "bias", lr_model.intercept_.round(3))
print("P(late) for A, B, C, D:", lr_model.predict_proba(X4.numpy())[:, 1].round(3))
print("accuracy:", lr_model.score(X4.numpy(), y4.numpy()))</div>
  <div class="fx" data-lang="text">weights [[0. 0.]] bias [0.]
P(late) for A, B, C, D: [0.5 0.5 0.5 0.5]
accuracy: 0.5</div>
  <p>The best straight line it can find is "no line at all": both weights 0, so every order gets probability 0.5 of being late. Any tilt would help two orders and hurt the other two by the same amount.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Trying to separate salt from sugar on a chessboard pattern with one straight cut of a knife. However you angle the knife, each side still has both. You need either a bent knife or to rearrange the board first. A hidden layer does the rearranging.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A single neuron (perceptron or logistic regression) is a <strong>linear classifier</strong>: its decision boundary is one hyperplane. The <strong>perceptron convergence theorem</strong> says the perceptron rule finds a separating line in finitely many steps <em>if one exists</em>; for non-separable data like XOR it cycles forever.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Thinking the cure is "more data" or "train longer". The 1,000 generated orders have exactly the same shape problem, only blurred. The cure is a different model: one that can bend its boundary.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: hidden layers.</b> One neuron draws one line, and one line is not enough. Can we combine several neurons, each drawing its own line, into something that bends?</div>

  <h2 id="dn-mlp"><span class="num">04</span>Hidden Layers: Solving XOR by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We only have straight-line parts. How do we get a decision that says "late for B and C, on time for A and D"?</p>
  </div>
  <p>The trick: do not ask one neuron to answer "late?" directly. First let two neurons answer easier questions that <em>are</em> straight-line questions, then let a third neuron combine their answers.</p>
  <ul>
    <li>Neuron h₁ asks "<strong>is at least one</strong> of far/rain true?": h₁ = ReLU(far + rain). (ReLU(z) = max(0, z) just keeps positives and turns negatives into 0.)</li>
    <li>Neuron h₂ asks "<strong>are both</strong> true?": h₂ = ReLU(far + rain − 1).</li>
    <li>Output: "at least one, but not both" = h₁ − 2·h₂. Call the order late if this score is above 0.5.</li>
  </ul>
  <p>Work it by hand on all four orders:</p>
  <table class="tbl"><caption>The 2-2-1 network with hand-chosen weights</caption>
    <tr><th>Order</th><th>far, rain</th><th>h₁ = ReLU(far + rain)</th><th>h₂ = ReLU(far + rain − 1)</th><th>score = h₁ − 2h₂</th><th>late?</th><th>truth</th></tr>
    <tr><td>A</td><td>0, 0</td><td>ReLU(0) = 0</td><td>ReLU(−1) = 0</td><td>0 − 0 = 0</td><td>0</td><td>0 ✓</td></tr>
    <tr><td>B</td><td>0, 1</td><td>ReLU(1) = 1</td><td>ReLU(0) = 0</td><td>1 − 0 = 1</td><td>1</td><td>1 ✓</td></tr>
    <tr><td>C</td><td>1, 0</td><td>ReLU(1) = 1</td><td>ReLU(0) = 0</td><td>1 − 0 = 1</td><td>1</td><td>1 ✓</td></tr>
    <tr><td>D</td><td>1, 1</td><td>ReLU(2) = 2</td><td>ReLU(1) = 1</td><td>2 − 2 = 0</td><td>0</td><td>0 ✓</td></tr>
  </table>
  <p>All four correct. Why it works becomes clear if you plot each order at its new position (h₁, h₂) instead of (far, rain). A goes to (0, 0), B and C both land on (1, 0), D goes to (2, 1). In this new space the late orders are no longer on opposite corners; they sit together, and one straight line (the output neuron) separates them:</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
<defs><marker id="dn-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="20" y="18" font-size="11.5" class="tm">input space (far, rain)</text>
<line x1="30" y1="160" x2="190" y2="160" stroke="currentColor" opacity="0.4"/><line x1="30" y1="160" x2="30" y2="30" stroke="currentColor" opacity="0.4"/>
<circle cx="50" cy="145" r="8" class="fg sg"/><text x="62" y="150" font-size="11">A</text>
<circle cx="50" cy="50" r="8" class="fr sr"/><text x="62" y="55" font-size="11">B</text>
<circle cx="170" cy="145" r="8" class="fr sr"/><text x="182" y="150" font-size="11">C</text>
<circle cx="170" cy="50" r="8" class="fg sg"/><text x="182" y="55" font-size="11">D</text>
<line x1="210" y1="100" x2="290" y2="100" stroke="currentColor" marker-end="url(#dn-a2)"/><text x="215" y="90" font-size="11">hidden layer</text>
<text x="320" y="18" font-size="11.5" class="tm">hidden space (h₁, h₂)</text>
<line x1="330" y1="160" x2="580" y2="160" stroke="currentColor" opacity="0.4"/><line x1="330" y1="160" x2="330" y2="30" stroke="currentColor" opacity="0.4"/>
<text x="345" y="178" class="tm" font-size="10">0</text><text x="445" y="178" class="tm" font-size="10">1</text><text x="545" y="178" class="tm" font-size="10">2</text>
<circle cx="350" cy="145" r="8" class="fg sg"/><text x="362" y="140" font-size="11">A</text>
<circle cx="450" cy="145" r="8" class="fr sr"/><circle cx="450" cy="145" r="4" class="fr sr"/><text x="440" y="132" font-size="11">B, C</text>
<circle cx="550" cy="65" r="8" class="fg sg"/><text x="562" y="70" font-size="11">D</text>
<line x1="380" y1="175" x2="560" y2="35" class="sb" stroke-dasharray="5 3"/><text x="372" y="60" class="tb" font-size="10.5">h₁ − 2h₂ = 0.5</text>
</svg><figcaption>Left: in the original space no line works. Right: after the hidden layer, B and C land on the same spot, and the output neuron's line h₁ − 2h₂ = 0.5 separates them from A and D.</figcaption></figure>
  <p>That is the central idea of deep learning: <strong>hidden layers learn new features in which the problem becomes easy</strong>. Here we chose the features ("at least one", "both") by hand. A real network finds its own. The code below checks the hand network, then lets PyTorch learn a 2-4-1 network from random weights with no hints (how it learns is the subject of <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>):</p>
<div class="fx" data-lang="py">import torch.nn as nn, torch.nn.functional as F
h1 = torch.relu(X4[:, 0] + X4[:, 1])
h2 = torch.relu(X4[:, 0] + X4[:, 1] - 1)
score = h1 - 2 * h2
print("hand net  h1", h1.tolist(), "h2", h2.tolist(), "score", score.tolist())

torch.manual_seed(0)
net = nn.Sequential(nn.Linear(2, 4), nn.Tanh(), nn.Linear(4, 1))
opt = torch.optim.Adam(net.parameters(), lr=0.1)
for step in range(300):
    opt.zero_grad()
    loss = F.binary_cross_entropy_with_logits(net(X4).squeeze(1), y4)
    loss.backward(); opt.step()
print("learned net predicts", (net(X4).squeeze(1) &gt; 0).int().tolist(), "loss", round(loss.item(), 4))</div>
  <div class="fx" data-lang="text">hand net  h1 [0.0, 1.0, 1.0, 2.0] h2 [0.0, 0.0, 0.0, 1.0] score [0.0, 1.0, 1.0, 0.0]
learned net predicts [0, 1, 1, 0] loss 0.0003</div>
  <p>The hand network's scores are [0, 1, 1, 0], exactly the late column. The learned network, starting from random weights, also predicts [0, 1, 1, 0], with a loss near zero. A network with at least one hidden layer is called a <strong>multi-layer perceptron (MLP)</strong>.</p>
  <p>How far does this go? The <strong>universal approximation theorem</strong> says one hidden layer with enough neurons and a non-linear activation can approximate any continuous function on a bounded region as closely as you like. It does not say how many neurons, nor that training will find them; in practice deeper, narrower networks need far fewer neurons than one huge layer.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A manager who cannot read the raw data asks two assistants simple questions: "is at least one problem present?" and "are both present?". From their two yes/no reports the manager's decision is one easy rule. Hidden neurons are those assistants; the output neuron is the manager.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>hidden layer</strong> is a layer of neurons between input and output whose values are not given in the data. An <strong>MLP</strong> (also "fully connected" or "dense" network) is a stack of such layers, each neuron connected to every neuron in the previous layer.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The hidden layer only helps because of the ReLU bend. Remove it and h₁ − 2h₂ = (far + rain) − 2(far + rain − 1) = 2 − (far + rain), a plain straight-line score that gives A 2, B 1, C 1, D 0: wrong. Section 06 shows this in general.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the forward pass in matrix form.</b> We computed four orders through three neurons by hand. A real network pushes thousands of orders through hundreds of neurons per layer. How is that written and computed efficiently, and what shapes are involved?</div>

  <h2 id="dn-fwd"><span class="num">05</span>Forward Pass: Layers as Matrix Multiplies</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Neuron by neuron, order by order is fine for 4 × 3. How do we compute a whole layer for a whole batch at once, and how do we keep track of the sizes?</p>
  </div>
  <p><strong>Forward propagation</strong> (the forward pass) means: put the inputs in at the left and let them flow through the layers until a prediction comes out. Each layer does the same three things: multiply by its weights, add its biases, apply the activation. The output of one layer is the input of the next. Nothing flows backwards (yet).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A dosa stall: batter → spread on the tawa → add filling → fold. Each station changes the item and passes it on. A matrix multiply is the station handling a whole tray of dosas at once instead of one at a time.</p></div>
  <p>Write our hand network as matrices. Stack the two hidden neurons' weights as rows of W¹ and their biases in b¹; the output neuron has one row W² and bias b²:</p>
  <table class="tbl">
    <tr><th>Layer</th><th>Weights (rows = neurons)</th><th>Bias</th><th>Shape</th></tr>
    <tr><td>Hidden</td><td>W¹ = [[1, 1], [1, 1]]</td><td>b¹ = [0, −1]</td><td>(2 out × 2 in)</td></tr>
    <tr><td>Output</td><td>W² = [[1, −2]]</td><td>b² = [0]</td><td>(1 out × 2 in)</td></tr>
  </table>
  <p>For the batch of four orders, X has shape (4, 2): one row per order. The hidden layer computes Z¹ = X W¹ᵀ + b¹, shape (4, 2) @ (2, 2) → (4, 2), then H = ReLU(Z¹). Row D by hand: [1, 1] @ [[1, 1], [1, 1]] = [2, 2]; add [0, −1] → [2, 1]; ReLU → [2, 1]. Output: [2, 1] @ [1, −2]ᵀ = 2 − 2 = 0. Same as the table in section 04, now as two multiplies:</p>
<div class="fx" data-lang="py">W1 = torch.tensor([[1., 1.], [1., 1.]]); b1 = torch.tensor([0., -1.])
W2 = torch.tensor([[1., -2.]]);          b2 = torch.tensor([0.])
Z1 = X4 @ W1.T + b1          # (4, 2) @ (2, 2) -&gt; (4, 2)
H = torch.relu(Z1)           # same shape, negatives -&gt; 0
out = H @ W2.T + b2          # (4, 2) @ (2, 1) -&gt; (4, 1)
print("Z1", Z1.tolist()); print("H ", H.tolist()); print("out", out.squeeze(1).tolist())

lin1 = nn.Linear(2, 2); lin2 = nn.Linear(2, 1)        # the same thing with PyTorch layers
with torch.no_grad():
    lin1.weight.copy_(W1); lin1.bias.copy_(b1); lin2.weight.copy_(W2); lin2.bias.copy_(b2)
print("nn.Linear version", lin2(torch.relu(lin1(X4))).squeeze(1).tolist())
print("weight shapes", tuple(lin1.weight.shape), tuple(lin2.weight.shape),
      " params", sum(p.numel() for p in [*lin1.parameters(), *lin2.parameters()]))</div>
  <div class="fx" data-lang="text">Z1 [[0.0, -1.0], [1.0, 0.0], [1.0, 0.0], [2.0, 1.0]]
H  [[0.0, 0.0], [1.0, 0.0], [1.0, 0.0], [2.0, 1.0]]
out [0.0, 1.0, 1.0, 0.0]
nn.Linear version [0.0, 1.0, 1.0, 0.0]
weight shapes (2, 2) (1, 2)  params 9</div>
  <p>Z1 row A is [0, −1]: the second neuron's −1 is switched off to 0 by ReLU, exactly the hand table. <code>nn.Linear(in, out)</code> does the same multiply-and-add, storing W with shape (out, in), which is why we write W.T. Parameter count: hidden 2·2 + 2 = 6, output 2·1 + 1 = 3, total 9.</p>
  <p>The same forward pass at scale: the 1,000 generated orders go through in one call, shape (1000, 2) → (1000, 2) → (1000, 1). The hand weights were designed for exact 0/1 inputs, so on real distances they are only a rough fit:</p>
<div class="fx" data-lang="py">score_big = lin2(torch.relu(lin1(X))).squeeze(1)       # X is (1000, 2)
acc = ((score_big &gt; 0.5).float() == y).float().mean().item()
print(score_big.shape, "accuracy of the hand net on 1,000 orders:", round(acc, 3))</div>
  <div class="fx" data-lang="text">torch.Size([1000]) accuracy of the hand net on 1,000 orders: 0.725</div>
  <p>72.5% instead of 100%: the hand features "far + rain" assumed yes/no inputs, while real orders sit anywhere between. A network that <em>learns</em> its weights from the 1,000 orders does much better (about 95% in <a class="xref" data-note="dl_training">Training Well</a>). Learning is the next note.</p>
  <div class="callout def"><span class="label">Definition</span><p>For layer l: <strong>Zˡ = Aˡ⁻¹ Wˡᵀ + bˡ</strong> and <strong>Aˡ = σ(Zˡ)</strong>, with A⁰ = X. Wˡ has shape (neurons out × inputs in), bˡ has one entry per neuron, σ is the activation applied to every entry. With a batch of B examples, Aˡ has shape (B × neurons in layer l). A layer has in·out + out parameters.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Mixing up (out, in) and (in, out). <code>nn.Linear(2, 32).weight</code> has shape (32, 2), not (2, 32). Most shape errors in a first network are this. Write the shape next to each line until it is automatic.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: activation functions.</b> We used ReLU between the layers because it made the hand network work. Is the bend really necessary, and if so, why ReLU rather than sigmoid or tanh?</div>

  <h2 id="dn-act"><span class="num">06</span>Activation Functions: Why the Bend, Why ReLU</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What happens if we leave out the activation, and when we keep it, which one should we use?</p>
  </div>
  <h3>Without a bend, layers collapse</h3>
  <p>A layer without activation computes XWᵀ + b, a straight-line (linear) function. Two of them in a row: (XW₁ᵀ + b₁)W₂ᵀ + b₂ = X(W₂W₁)ᵀ + (b₁W₂ᵀ + b₂). That is again one linear layer with weight W₂W₁. Ten layers, a hundred layers: still one. On our orders, the hand network without ReLU gives exactly the straight-line score from the trap in section 04:</p>
<div class="fx" data-lang="py">no_bend = (X4 @ W1.T + b1) @ W2.T + b2        # ReLU removed
W_merged = W2 @ W1; b_merged = b1 @ W2.T + b2
print("two layers, no ReLU:", no_bend.squeeze(1).tolist())
print("one merged layer:   ", (X4 @ W_merged.T + b_merged).squeeze(1).tolist(), " W =", W_merged.tolist())</div>
  <div class="fx" data-lang="text">two layers, no ReLU: [2.0, 1.0, 1.0, 0.0]
one merged layer:    [2.0, 1.0, 1.0, 0.0]  W = [[-1.0, -1.0]]</div>
  <p>Scores 2, 1, 1, 0 for A, B, C, D: B and C are no longer separated from A and D by any threshold (A scores highest, D lowest). And the two layers really are the single layer with W = [−1, −1], b = 2. The bend (activation) is what lets depth add power.</p>
  <h3>Comparing the bends</h3>
  <p>An <strong>activation</strong> is a fixed function applied to every neuron's z. Three things matter about it: the range of its output, its slope, and whether the slope is ever (near) zero. The slope matters because learning sends signals backwards by <em>multiplying slopes</em> layer by layer (<a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>); a slope near 0 kills the signal.</p>
  <figure class="viz"><svg viewBox="0 0 580 175" width="580">
    <g><line x1="10" y1="95" x2="170" y2="95" stroke="currentColor" opacity="0.3"/><line x1="90" y1="5" x2="90" y2="140" stroke="currentColor" opacity="0.3"/>
      <path d="M10,94 18,94 26,93 34,93 42,92 50,90 58,88 66,86 74,83 82,79 90,75 98,71 106,67 114,64 122,62 130,60 138,58 146,57 154,57 162,56 170,56" fill="none" class="sb" stroke-width="2.5"/>
      <path d="M10,94 26,93 42,92 50,91 58,89 66,88 74,86 82,85 90,85 98,85 106,86 114,88 122,89 130,91 138,92 154,93 170,94" fill="none" class="sr" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="40" y="165">sigmoid</text><text x="100" y="80" class="tr" font-size="11">slope ≤ 0.25</text></g>
    <g transform="translate(195,0)"><line x1="10" y1="95" x2="170" y2="95" stroke="currentColor" opacity="0.3"/><line x1="90" y1="5" x2="90" y2="140" stroke="currentColor" opacity="0.3"/>
      <path d="M10,135 26,135 38,135 46,134 54,133 62,130 70,125 78,116 86,103 90,95 94,87 102,74 110,65 118,60 126,57 134,56 150,55 170,55" fill="none" class="sb" stroke-width="2.5"/>
      <path d="M10,95 30,95 46,93 54,91 62,86 70,78 78,67 86,57 90,55 94,57 102,67 110,78 118,86 126,91 134,93 150,95 170,95" fill="none" class="sr" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="55" y="165">tanh</text><text x="104" y="48" class="tr" font-size="11">slope ≤ 1</text></g>
    <g transform="translate(390,0)"><line x1="10" y1="95" x2="170" y2="95" stroke="currentColor" opacity="0.3"/><line x1="90" y1="5" x2="90" y2="140" stroke="currentColor" opacity="0.3"/>
      <path d="M10,95 90,95 134,7" fill="none" class="sb" stroke-width="2.5"/>
      <path d="M10,96 90,96 M90,55 170,55" fill="none" class="sr" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="55" y="165">ReLU</text><text x="128" y="70" class="tr" font-size="11">slope 1</text><text x="20" y="112" class="tr" font-size="11">slope 0</text></g>
  </svg><figcaption>Solid blue = the activation's output for z from −4 to 4; dashed red = its slope. Sigmoid and tanh go flat at both ends. ReLU's slope is exactly 1 for every positive input and 0 for negatives.</figcaption></figure>
  <p>Feed the hidden scores our orders actually produce, plus two extreme ones, through each activation and ask PyTorch for the slope at each point. The values −1, 0, 1, 2 are the Z¹ entries from section 05; −3 and 3 show the ends:</p>
<div class="fx" data-lang="py">z = torch.tensor([-3., -1., 0., 1., 2., 3.], requires_grad=True)
for name, f in [("sigmoid", torch.sigmoid), ("tanh", torch.tanh), ("relu", torch.relu),
                ("leaky", lambda t: F.leaky_relu(t, 0.01)), ("gelu", F.gelu)]:
    out = f(z); g, = torch.autograd.grad(out.sum(), z)
    print(f"{name:8s} out {[round(v, 3) for v in out.tolist()]}")
    print(f"{'':8s} slope {[round(v, 3) for v in g.tolist()]}")</div>
  <div class="fx" data-lang="text">sigmoid  out [0.047, 0.269, 0.5, 0.731, 0.881, 0.953]
         slope [0.045, 0.197, 0.25, 0.197, 0.105, 0.045]
tanh     out [-0.995, -0.762, 0.0, 0.762, 0.964, 0.995]
         slope [0.01, 0.42, 1.0, 0.42, 0.071, 0.01]
relu     out [0.0, 0.0, 0.0, 1.0, 2.0, 3.0]
         slope [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]
leaky    out [-0.03, -0.01, 0.0, 1.0, 2.0, 3.0]
         slope [0.01, 0.01, 0.01, 1.0, 1.0, 1.0]
gelu     out [-0.004, -0.159, 0.0, 0.841, 1.954, 2.996]
         slope [-0.012, -0.083, 0.5, 1.083, 1.085, 1.012]</div>
  <p>What to notice: sigmoid's slope is at most 0.25 (at z = 0) and only 0.045 at z = ±3. Tanh is better (max 1) but also flattens (0.01 at ±3). ReLU's slope is exactly 1 for every positive z, so signals pass backwards through it undiminished, and it costs one comparison to compute. Its weakness is the flat 0 for negative z: a neuron whose z is negative for every order gets no learning signal ever again (a "dead" ReLU). Leaky ReLU keeps a small slope 0.01 there; GELU is a smooth ReLU used in Transformers.</p>
  <table class="tbl">
    <tr><th>Activation</th><th>Formula</th><th>Range</th><th>Use it for</th><th>Watch out</th></tr>
    <tr><td><strong>ReLU</strong></td><td>max(0, z)</td><td>[0, ∞)</td><td>Default hidden layer (MLPs, CNNs)</td><td>Dying ReLU: z &lt; 0 always → slope 0 forever</td></tr>
    <tr><td><strong>Leaky ReLU / ELU</strong></td><td>max(0.01z, z)</td><td>(−∞, ∞)</td><td>When many units die</td><td>One more setting</td></tr>
    <tr><td><strong>GELU / SiLU</strong></td><td>z·Φ(z) / z·σ(z)</td><td>≈ (−0.17, ∞)</td><td>Transformers, modern CNNs</td><td>Slightly slower</td></tr>
    <tr><td><strong>Sigmoid</strong></td><td>1/(1 + e⁻ᶻ)</td><td>(0, 1)</td><td>Yes/no output (P(late)), gates</td><td>Flat ends; slope ≤ 0.25; not centred on 0</td></tr>
    <tr><td><strong>Tanh</strong></td><td>(eᶻ − e⁻ᶻ)/(eᶻ + e⁻ᶻ)</td><td>(−1, 1)</td><td>RNN/LSTM states</td><td>Flat ends</td></tr>
    <tr><td><strong>Softmax</strong></td><td>eᶻⁱ/Σeᶻʲ</td><td>(0, 1), sums to 1</td><td>Multi-class output only</td><td>Never in hidden layers</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>ReLU is a one-way valve: pushed forward, water passes at full strength; pushed back, nothing passes. Sigmoid is a dimmer switch that gets stuck near fully on or fully off: once stuck, turning the knob changes almost nothing, so the network cannot tell which way to turn it.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>activation function</strong> σ is a fixed non-linear function applied element-wise after each layer's multiply-and-add. It is what makes a stack of layers more expressive than one layer. Its derivative σ′ (slope) is multiplied into every gradient that passes backwards through it.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Using sigmoid in every hidden layer of a deep network "because the output is a probability". Each layer multiplies the backward signal by at most 0.25, so after 10 layers it is at most 0.25¹⁰ ≈ 1e-6 (the vanishing gradient, measured in <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>). Use ReLU-family inside, sigmoid only at the output.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the output layer.</b> Hidden layers now bend. But the last layer gives a raw score like 0.6 or −1.8. The shop owner wants "how likely is this order to be late?", a probability. How do scores become probabilities, for one yes/no and for several classes?</div>

  <h2 id="dn-soft"><span class="num">07</span>Output Layer: Sigmoid and Softmax</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The network's last neuron outputs any real number. How do we turn it into a probability between 0 and 1, and what if there are more than two possible answers?</p>
  </div>
  <h3>One yes/no: sigmoid</h3>
  <p>For "late or not" the last layer has one neuron whose raw score z is called a <strong>logit</strong>. The <strong>sigmoid</strong> σ(z) = 1/(1 + e⁻ᶻ) squashes any z into (0, 1): z = 0 → 0.5, large positive → near 1, large negative → near 0. By hand for z = 0.6 (the score our order D gets from the starting weights in the next note): e⁻⁰·⁶ = 0.5488, 1 + 0.5488 = 1.5488, 1/1.5488 = <strong>0.6457</strong>. "64.6% chance this order is late."</p>
  <h3>Several classes: softmax</h3>
  <p>Suppose the shop wants three answers: on time, a bit late (under 15 min), very late. The last layer now has three neurons, giving three logits, say (2.0, 1.0, 0.1). <strong>Softmax</strong> turns them into three probabilities that are all positive and add up to 1: raise e to each score, divide by the total. By hand: e² = 7.389, e¹ = 2.718, e⁰·¹ = 1.105; total 11.212; probabilities 7.389/11.212 = 0.659, 2.718/11.212 = 0.242, 1.105/11.212 = 0.099.</p>
<div class="fx" data-lang="py">print("sigmoid(0.6) =", round(torch.sigmoid(torch.tensor(0.6)).item(), 4))
logits = torch.tensor([2.0, 1.0, 0.1])            # on time, a bit late, very late
p = torch.softmax(logits, 0)
print("softmax:", [round(v, 3) for v in p.tolist()], " sum =", round(p.sum().item(), 6))
print("softmax(logits + 100):", [round(v, 3) for v in torch.softmax(logits + 100, 0).tolist()])
two = torch.tensor([0.0, 0.6])                    # softmax over [on time, late] logits
print("2-class softmax:", [round(v, 4) for v in torch.softmax(two, 0).tolist()], "-&gt; P(late) = sigmoid(0.6 - 0)")</div>
  <div class="fx" data-lang="text">sigmoid(0.6) = 0.6457
softmax: [0.659, 0.242, 0.099]  sum = 1.0
softmax(logits + 100): [0.659, 0.242, 0.099]
2-class softmax: [0.3543, 0.6457] -&gt; P(late) = sigmoid(0.6 - 0)</div>
  <p>Three lessons in the output. The hand numbers match. Adding 100 to every score changes nothing: only the <em>gaps</em> between scores matter (libraries use this to subtract the largest score first so e never overflows). And softmax over two classes is the same as a sigmoid of the gap between their scores, so "one sigmoid output" and "two softmax outputs" are two ways to write the same yes/no model.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Softmax is splitting a prize pot among contestants by their scores, but exponentially: a contestant 1 point ahead gets e ≈ 2.7 times the share. Everyone gets something, the shares always add to the whole pot, and adding the same bonus to everyone changes nobody's share.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Logits</strong> are the raw output scores. <strong>Sigmoid</strong>: p = σ(z) = 1/(1 + e⁻ᶻ), for one yes/no or for several independent yes/no labels. <strong>Softmax</strong>: pᵢ = eᶻⁱ / Σⱼ eᶻʲ, for exactly one class out of C. Both are output-layer functions; the loss that pairs with each (binary or categorical cross-entropy) is in <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Softmax inside the network forces each layer's neurons to compete and sum to 1, throwing information away; keep it at the output. And in PyTorch, <code>nn.CrossEntropyLoss</code> and <code>nn.BCEWithLogitsLoss</code> apply softmax/sigmoid themselves: the model should output raw logits, or the squashing happens twice.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects, then <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>.</b> We can now compute a probability for any order. But we chose every weight by hand, and the starting network says 64.6% late for order D, which is actually on time. How wrong is that, as one number, and which of the nine weights should change, by how much?</div>

  <h2 id="dn-connect"><span class="num">08</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Neuron, hidden layer, forward pass, activation, sigmoid, softmax: separate topics, or one machine seen piece by piece?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 250" width="700">
<defs><marker id="dn-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="7" class="fb sb"/><text x="70" y="40" text-anchor="middle" font-size="11.5" font-weight="700">input X</text><text x="70" y="58" text-anchor="middle" class="tm" font-size="10">(4, 2) far, rain</text>
<line x1="130" y1="45" x2="158" y2="45" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="160" y="20" width="130" height="50" rx="7" class="fb sb"/><text x="225" y="40" text-anchor="middle" font-size="11.5" font-weight="700">neuron: w·x + b</text><text x="225" y="58" text-anchor="middle" class="tm" font-size="10">one straight line</text>
<line x1="290" y1="45" x2="318" y2="45" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="320" y="20" width="120" height="50" rx="7" class="ft st"/><text x="380" y="40" text-anchor="middle" font-size="11.5" font-weight="700">activation</text><text x="380" y="58" text-anchor="middle" class="tm" font-size="10">ReLU: the bend</text>
<line x1="440" y1="45" x2="468" y2="45" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="470" y="20" width="110" height="50" rx="7" class="fg sg"/><text x="525" y="40" text-anchor="middle" font-size="11.5" font-weight="700">hidden layer</text><text x="525" y="58" text-anchor="middle" class="tm" font-size="10">h₁, h₂ features</text>
<line x1="580" y1="45" x2="608" y2="45" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="610" y="20" width="80" height="50" rx="7" class="fv sb"/><text x="650" y="40" text-anchor="middle" font-size="11.5" font-weight="700">output</text><text x="650" y="58" text-anchor="middle" class="tm" font-size="10">sigmoid</text>
<rect x="160" y="110" width="280" height="50" rx="7" class="fr sr"/><text x="300" y="130" text-anchor="middle" font-size="11.5" font-weight="700">one neuron alone fails on XOR</text><text x="300" y="148" text-anchor="middle" class="tm" font-size="10">cycles 3, 3, 4 errors; LR gives 0.5 to all</text>
<line x1="225" y1="70" x2="225" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dn-a9)"/>
<line x1="440" y1="135" x2="520" y2="72" stroke="currentColor" marker-end="url(#dn-a9)"/><text x="470" y="115" font-size="10" class="tm">fix</text>
<rect x="470" y="180" width="220" height="50" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="580" y="200" text-anchor="middle" font-size="11.5" font-weight="700">forward pass = matrix form</text><text x="580" y="218" text-anchor="middle" class="tm" font-size="10">H = ReLU(XW¹ᵀ + b¹), out = HW²ᵀ + b²</text>
<line x1="525" y1="70" x2="560" y2="178" stroke="currentColor" stroke-dasharray="4 3"/>
<rect x="160" y="180" width="280" height="50" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="300" y="200" text-anchor="middle" font-size="11.5" font-weight="700">no activation → layers collapse</text><text x="300" y="218" text-anchor="middle" class="tm" font-size="10">W₂W₁ = [−1, −1], scores 2, 1, 1, 0</text>
<line x1="380" y1="70" x2="330" y2="178" stroke="currentColor" stroke-dasharray="4 3"/>
</svg><figcaption>A network is neurons (straight lines) + activations (bends), stacked into layers and computed as matrix multiplies. Remove the bend and the stack collapses back to one neuron, which fails on our orders.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the four orders</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>Neuron / perceptron</td><td>weighted sum + bias + step</td><td>yes/no from inputs?</td><td>"van" (far AND rain) learned: [0, 0, 0, 1]</td><td>linearly separable data</td></tr>
    <tr><td>XOR failure</td><td>4 inequalities</td><td>can one line do "late"?</td><td>no: cycles; logistic regression 0.5, 0.5, 0.5, 0.5</td><td>diagnosing "linear model stuck at chance"</td></tr>
    <tr><td>Hidden layer</td><td>several neurons + bend</td><td>how to bend the boundary?</td><td>h₁ − 2h₂ = 0, 1, 1, 0 ✓</td><td>any non-linear pattern</td></tr>
    <tr><td>Forward pass</td><td>Z = AWᵀ + b, A = σ(Z) per layer</td><td>compute a batch efficiently?</td><td>(4, 2) → (4, 2) → (4, 1); 9 params</td><td>always: every prediction</td></tr>
    <tr><td>Activation (ReLU)</td><td>max(0, z)</td><td>why bend; which bend?</td><td>without it: 2, 1, 1, 0 (fails)</td><td>hidden layers</td></tr>
    <tr><td>Sigmoid</td><td>1/(1 + e⁻ᶻ)</td><td>score → probability (yes/no)?</td><td>σ(0.6) = 0.6457</td><td>binary / multi-label output</td></tr>
    <tr><td>Softmax</td><td>eᶻⁱ/Σeᶻʲ</td><td>scores → class probabilities?</td><td>(2, 1, 0.1) → (0.659, 0.242, 0.099)</td><td>one-of-C output</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a neuron draws a straight line, an activation bends it, and a hidden layer of bent lines creates new features in which the final straight line works.</strong> Everything a deep network does on images or text is this, repeated and learned instead of hand-set.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="dn-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: orders A (far 0, rain 0, on time), B (0, 1, late), C (1, 0, late), D (1, 1, on time). Late = far XOR rain. At scale: 1,000 generated orders (distance 0–10 km, rain 0–20 mm/h, scaled to 0–1, 5% noisy labels).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our orders</th><th>Weakness → next</th></tr>
    <tr><td>Neuron</td><td>yes/no from weighted inputs?</td><td>learns "van" = AND</td><td>one straight line → XOR?</td></tr>
    <tr><td>XOR failure</td><td>can one line learn "late"?</td><td>impossible (proof); weights cycle; LR 0.5 for all</td><td>need a bent boundary → hidden layer</td></tr>
    <tr><td>Hidden layer</td><td>how to bend?</td><td>h₁ = ReLU(far + rain), h₂ = ReLU(far + rain − 1), out h₁ − 2h₂ → 0, 1, 1, 0</td><td>how to compute at scale → forward pass</td></tr>
    <tr><td>Forward pass</td><td>batch computation?</td><td>X (4, 2) → H (4, 2) → out (4, 1); 9 params; 72.5% on 1,000 orders with hand weights</td><td>why the bend → activations</td></tr>
    <tr><td>Activations</td><td>why/which bend?</td><td>no ReLU → 2, 1, 1, 0 (fails); ReLU slope 1, sigmoid ≤ 0.25</td><td>output must be a probability</td></tr>
    <tr><td>Sigmoid / softmax</td><td>scores → probabilities?</td><td>σ(0.6) = 0.646; softmax(2, 1, 0.1) = 0.659, 0.242, 0.099</td><td>how wrong, who learns → <a class="xref" data-note="dl_backprop">backprop</a></td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Neuron</td><td>z = w·x + b = Σᵢ wᵢxᵢ + b; a = σ(z)</td><td>x inputs, w weights, b bias, σ activation</td></tr>
    <tr><td>Perceptron rule</td><td>w ← w + α(y − ŷ)x; b ← b + α(y − ŷ)</td><td>y truth, ŷ guess (0/1), α learning rate</td></tr>
    <tr><td>Layer (batch)</td><td>Zˡ = Aˡ⁻¹Wˡᵀ + bˡ; Aˡ = σ(Zˡ); A⁰ = X</td><td>W (out × in); A (batch × neurons)</td></tr>
    <tr><td>Parameters</td><td>in·out + out per dense layer</td><td>2-2-1 net: 6 + 3 = 9</td></tr>
    <tr><td>ReLU, leaky ReLU</td><td>max(0, z); max(0.01z, z)</td><td>slope 1 (z &gt; 0), 0 or 0.01 (z &lt; 0)</td></tr>
    <tr><td>Sigmoid</td><td>σ(z) = 1/(1 + e⁻ᶻ); σ′ = σ(1 − σ) ≤ 0.25</td><td>output in (0, 1)</td></tr>
    <tr><td>Tanh</td><td>(eᶻ − e⁻ᶻ)/(eᶻ + e⁻ᶻ); slope ≤ 1</td><td>output in (−1, 1)</td></tr>
    <tr><td>Softmax</td><td>pᵢ = eᶻⁱ / Σⱼ eᶻʲ</td><td>C logits → C probabilities summing to 1</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Single neuron / linear model</b><p>Use when one line or plane separates the classes; fast and interpretable.</p><small>Fails on XOR-like interactions</small></div>
    <div><b>MLP (hidden layers)</b><p>Use when the boundary must bend: interactions like "far XOR rain".</p><small>Needs training (next note); more data than a linear model</small></div>
    <div><b>ReLU</b><p>Default in hidden layers: slope 1, cheap.</p><small>Dead units: try Leaky ReLU / GELU</small></div>
    <div><b>Sigmoid</b><p>Output for one yes/no or several independent yes/no labels.</p><small>Not in deep hidden stacks</small></div>
    <div><b>Softmax</b><p>Output for exactly one of C classes.</p><small>Never in hidden layers</small></div>
    <div><b>Tanh</b><p>RNN/LSTM state, small nets wanting centred outputs.</p><small>Flattens at the ends too</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Expecting more training to fix a linear model on XOR; forgetting the bias; stacking layers with no activation (they collapse into one); W shape is (out, in); sigmoid in deep hidden layers (vanishing signal); softmax in hidden layers; applying softmax/sigmoid before a PyTorch loss that already does it; judging accuracy without the majority-class baseline.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Neuron w = (2, 1), b = −3. Which of A, B, C, D does it call 1?</td><td>Only D (2 + 1 − 3 = 0 ≥ 0); A −3, B −2, C −1</td></tr>
    <tr><td>Hand XOR net on a new order far = 1, rain = 0.5?</td><td>h₁ = 1.5, h₂ = 0.5, score 0.5: right on the boundary</td></tr>
    <tr><td>Parameters in nn.Linear(2, 32) → nn.Linear(32, 1)?</td><td>(64 + 32) + (32 + 1) = 129</td></tr>
    <tr><td>Two linear layers W₁ = [[1, 1], [1, 1]], W₂ = [[1, −2]], no activation. Merged W?</td><td>W₂W₁ = [[−1, −1]]</td></tr>
    <tr><td>softmax(5, 5)?</td><td>(0.5, 0.5): equal scores, equal shares</td></tr>
  </table>

  <h2 id="dn-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain each piece on the four orders, out loud, and say why the next piece is needed?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does a single neuron compute?</summary><div class="qa-body">A weighted sum of its inputs plus a bias, z = w·x + b, passed through an activation. Its decision boundary (z = 0) is one straight line or hyperplane.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't one neuron learn "late = far XOR rain"? Prove it.</summary><div class="qa-body">A needs b &lt; 0; B needs w₂ + b ≥ 0; C needs w₁ + b ≥ 0; D needs w₁ + w₂ + b &lt; 0. Adding B and C: w₁ + w₂ + b ≥ −b &gt; 0, contradicting D. No line separates the late orders (opposite corners) from the on-time ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the perceptron rule do on XOR data?</summary><div class="qa-body">It never converges: each correction breaks another order and the weights cycle (in our trace, round 3 returns to round 2's state). On separable data, by contrast, it is guaranteed to stop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give hidden-layer weights that solve XOR and explain them.</summary><div class="qa-body">h₁ = ReLU(x₁ + x₂) ("at least one"), h₂ = ReLU(x₁ + x₂ − 1) ("both"), output h₁ − 2h₂ → 0, 1, 1, 0. In (h₁, h₂) space B and C coincide at (1, 0), so one line separates them from A (0, 0) and D (2, 1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the shape of <code>nn.Linear(10, 3).weight</code>, and how many parameters does the layer have?</summary><div class="qa-body">(3, 10), i.e. (out, in). Parameters 10·3 + 3 = 33. It computes x @ W.T + b, so (N, 10) → (N, 3).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why ReLU in hidden layers instead of sigmoid?</summary><div class="qa-body">Its slope is 1 for positive inputs, so backward signals are not shrunk layer after layer; sigmoid's slope is at most 0.25 and near 0 at both ends. ReLU is also cheap. Downside: dead units when z stays negative (use Leaky ReLU/GELU, sensible init and learning rate).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does softmax do, and why does adding a constant to all logits change nothing?</summary><div class="qa-body">It maps C scores to C positive probabilities summing to 1: pᵢ = eᶻⁱ/Σeᶻʲ. Adding c multiplies every eᶻ by eᶜ, which cancels between top and bottom. Only gaps between scores matter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Sigmoid vs softmax at the output: when each?</summary><div class="qa-body">Sigmoid for one yes/no (P(late)) or several independent yes/no labels (multi-label). Softmax when exactly one of C classes is true. Two-class softmax equals a sigmoid of the score gap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the universal approximation theorem promise, and what doesn't it?</summary><div class="qa-body">One hidden layer with enough neurons and a non-linear activation can approximate any continuous function on a bounded region. It doesn't say how many neurons, that training will find the weights, or that the result generalises.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a hidden layer need an activation function to help with XOR?</summary><div class="qa-body">Without it, two linear layers merge into one: our hand net becomes 2 − (far + rain), scores 2, 1, 1, 0, which no threshold can turn into 0, 1, 1, 0. The bend (ReLU cutting h₂ to 0 for A, B, C) is what moves B and C together in hidden space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: logistic regression is "one neuron with a sigmoid". What breaks if you use it on the late-delivery data, and what is the smallest fix?</summary><div class="qa-body">It can only draw one line, so it settles on weights 0 and P(late) = 0.5 for every order (50% accuracy). The smallest fix is one hidden layer with 2 ReLU (or tanh) neurons; alternatively hand-craft the interaction feature far·rain, which is what a hidden layer learns automatically.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: our hand-set XOR net is 100% on the four orders but 72.5% on 1,000 real orders. What does that tell you, and what is needed next?</summary><div class="qa-body">Hand-set weights encode our guess of the pattern (exact 0/1 inputs), not the real data. We need the network to choose its own weights from data: a loss that scores how wrong it is and a way to compute, for each weight, which way to move. That is loss + backpropagation, the next note.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why should the model output raw logits when you use <code>nn.BCEWithLogitsLoss</code> or <code>nn.CrossEntropyLoss</code>?</summary><div class="qa-body">Those losses apply sigmoid/log-softmax internally in a numerically safe way. Squashing in the model too means squashing twice: probabilities are pushed toward the middle, gradients shrink, and training is slow or wrong.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>.</b> We built the network and set its weights by hand. To learn weights from 1,000 orders, the network needs one number for "how wrong" (a loss) and, for every weight, its share of the blame (the gradient), computed efficiently by backpropagation.</div>
</main>`
});
