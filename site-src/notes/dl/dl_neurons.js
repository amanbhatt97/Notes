// notes/dl/dl_neurons.js — Neurons, Layers & Activations
Object.assign(TOPIC_CONTENT, {
  "dl_neurons": `<main>
  <h1>Neurons, Layers &amp; Activations</h1>
  <div class="where"><span>Deep Learning</span><span>Neural Networks</span><span>Neurons, Layers &amp; Activations</span></div>
  <p class="lead">Every neural network, from a two-input toy to a large language model, is built from one small part repeated many times: the <strong>neuron</strong>, which adds up its inputs with different importances and then bends the result. This page builds that part from nothing, shows exactly where a single neuron fails, and then fixes the failure by stacking neurons into layers with a bend between them. Along the way it explains how a layer is computed as one matrix multiplication, why the bend (the activation function) is essential, and how the last layer turns raw scores into probabilities. One running example is used throughout: a food shop that wants to predict <strong>whether a delivery will be late</strong> from two facts about the order, how far it is and whether it is raining. All code runs in PyTorch, and every output shown is from a real run.</p>

  <h2 id="dn-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Neurons, Layers &amp; Activations</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The neuron</div>
        <ul>
          <li>z = w·x + b, then an activation a = σ(z)</li>
          <li>Weights = importance of each input; bias = shifts the pass mark</li>
          <li>One neuron = one straight boundary (z = 0)</li>
          <li>One neuron + sigmoid = logistic regression</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Why layers</div>
        <ul>
          <li>Late = far XOR rain: no straight line separates it</li>
          <li>Hidden neurons build new features ("at least one", "both")</li>
          <li>In the new features one line works</li>
          <li>Universal approximation: wide enough → any smooth shape</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Forward pass</div>
        <ul>
          <li>Per layer: Z = A·Wᵀ + b, then A = σ(Z)</li>
          <li><code>nn.Linear(in, out).weight</code> is (out, in)</li>
          <li>Parameters per layer: in·out + out</li>
          <li>No activation → all layers collapse into one</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Activations and outputs</div>
        <ul>
          <li>ReLU max(0, z): default inside; slope 1 or 0</li>
          <li>Sigmoid / tanh flatten at the ends (slope ≤ 0.25 / ≤ 1)</li>
          <li>Output: sigmoid for yes/no, softmax for one of C</li>
          <li>PyTorch losses take raw logits</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dn-data"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Late-Delivery Problem</span><span class="rm-sub">four orders and a rule that bends</span></div></div>
      <div class="rm-item rm-done" data-target="dn-perc"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Neuron</span><span class="rm-sub">a weighted vote with a pass mark, and how it learns</span></div></div>
      <div class="rm-item rm-done" data-target="dn-xor"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Why One Neuron Fails</span><span class="rm-sub">the XOR problem, traced and proved</span></div></div>
      <div class="rm-item rm-done" data-target="dn-mlp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Hidden Layers</span><span class="rm-sub">solving the problem by hand with three neurons</span></div></div>
      <div class="rm-item rm-done" data-target="dn-fwd"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Forward Pass</span><span class="rm-sub">a layer as one matrix multiplication</span></div></div>
      <div class="rm-item rm-done" data-target="dn-act"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Activation Functions</span><span class="rm-sub">why the bend matters, and why ReLU</span></div></div>
      <div class="rm-item rm-done" data-target="dn-out"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Output Layer: Sigmoid and Softmax</span><span class="rm-sub">turning scores into probabilities</span></div></div>
      <div class="rm-item rm-done" data-target="dn-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">shapes, double squashing, missing bends</span></div></div>
      <div class="rm-item rm-done" data-target="dn-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, activations table, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dn-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about neurons and activations</span></div></div>
    </div>
  </div>

  <h2 id="dn-data"><span class="num">01</span>The Late-Delivery Problem</h2>
  <p>A small food shop delivers around a city, and its owner has noticed a pattern. In dry weather every order goes by bike, so orders that are <strong>far</strong> away arrive late and near ones arrive on time. When it <strong>rains</strong>, the owner sends far orders by van along the highway, which is fast, but near orders still go by bike through flooded lanes, which is slow. So an order is late when it is far <em>or</em> it is raining, but <em>not both</em>. Four orders tell the whole story, with 1 meaning yes and 0 meaning no:</p>
  <table class="tbl">
    <tr><th>Order</th><th>far (x₁)</th><th>rain (x₂)</th><th>late (y)</th><th>Why</th></tr>
    <tr><td>A</td><td>0</td><td>0</td><td>0</td><td>near and dry: a quick bike ride</td></tr>
    <tr><td>B</td><td>0</td><td>1</td><td>1</td><td>near and raining: bike through flooded lanes</td></tr>
    <tr><td>C</td><td>1</td><td>0</td><td>1</td><td>far and dry: a long bike ride</td></tr>
    <tr><td>D</td><td>1</td><td>1</td><td>0</td><td>far and raining: van on the highway</td></tr>
  </table>
  <p>Some vocabulary first. Each input number describing an example (here "far" and "rain") is called a <strong>feature</strong>, and the answer we want to predict ("late") is called the <strong>label</strong>. In logic, the rule "one or the other but not both" is called <strong>XOR</strong>, short for "exclusive or". Think of a staircase light with a switch at the top and another at the bottom: flip either one and the light changes, flip both and it is back where it started. The light is on when exactly one switch is up, and our "late" rule behaves exactly like that light.</p>
  <p>It helps to draw the orders as points on a square, with distance across and rain going up. The two late orders (red) sit on one diagonal and the two on-time orders (green) on the other:</p>
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
</svg><figcaption>The four orders. Whatever straight line you draw, at least one order ends up on the wrong side.</figcaption></figure>
  <p>Try it with a pencil: any straight line you draw leaves at least one order on the wrong side. Data that <em>can</em> be split into its classes by one straight line (or, with more features, one flat plane) is called <strong>linearly separable</strong>. Our data is not, and that single fact is the reason neural networks exist. The rest of this page is about building a model that can cope with it.</p>
  <p>The four orders are tiny on purpose, so that every number on this page can be checked by hand. Real data has exact distances in kilometres and rain in millimetres per hour, so we also generate 1,000 realistic orders with the same hidden rule: an order is late if (distance &gt; 5 km) XOR (rain &gt; 10 mm/h), and 5% of the labels are flipped at random because real life is noisy. Both inputs are divided by their maximum so they lie between 0 and 1, which networks handle best.</p>
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
print("tiny:    ", X4.shape, y4.tolist())
print("at scale:", X.shape, "first 3 rows", [[round(v, 2) for v in row] for row in X[:3].tolist()])
print("share late:", round(y.mean().item(), 3))</div>
  <div class="fx" data-lang="text">tiny:     torch.Size([4, 2]) [0.0, 1.0, 1.0, 0.0]
at scale: torch.Size([1000, 2]) first 3 rows [[0.5, 0.46], [0.77, 0.11], [0.09, 0.5]]
share late: 0.489</div>
  <p>The four orders form a table, or <strong>tensor</strong>, of shape (4, 2): four rows, one per order, and two columns, one per feature. The 1,000 generated orders have shape (1000, 2); the first row, [0.5, 0.46], is an order 5 km away in 9.2 mm/h of rain. Almost exactly half the orders (48.9%) are late. Keep that number in mind: a "model" that always answers "on time" would already be right about 51% of the time, so any real model has to beat that.</p>

  <h2 id="dn-perc"><span class="num">02</span>The Neuron</h2>
  <p>Before tackling "late", start with an easier question about the same orders: <strong>does this order need the van?</strong> The owner uses the van only when the order is far <em>and</em> it is raining. A simple scoring rule captures that. Give 1 point for "far", 1 point for "rain", subtract a pass mark of 1.5, and say "van" if the total is at least 0. Order D scores 1 + 1 − 1.5 = 0.5, which passes, so it gets the van. Order B scores 0 + 1 − 1.5 = −0.5, which fails, so it does not.</p>
  <p>That scoring rule is an artificial <strong>neuron</strong>: a unit that multiplies each input by a number saying how important it is, adds the results together with one extra fixed number, and passes the total through a simple function that makes the decision. The importance numbers are called <strong>weights</strong> (written w), the extra number is called the <strong>bias</strong> (written b, and it plays the role of the pass mark), and the deciding function is called the <strong>activation</strong>. Written as a formula, the neuron computes a score z = w₁x₁ + w₂x₂ + b, then an output a = σ(z), where σ stands for whichever activation is used. The original 1958 version, the <strong>perceptron</strong>, used the simplest possible activation: output 1 if z ≥ 0, otherwise 0.</p>
  <figure class="viz"><svg viewBox="0 0 520 170" width="520">
<defs><marker id="dn-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<circle cx="40" cy="40" r="18" style="fill:var(--bg)"/><circle cx="40" cy="40" r="18" class="fb sb"/><text x="40" y="45" text-anchor="middle" font-size="11">far</text>
<circle cx="40" cy="125" r="18" style="fill:var(--bg)"/><circle cx="40" cy="125" r="18" class="fb sb"/><text x="40" y="130" text-anchor="middle" font-size="11">rain</text>
<line x1="58" y1="45" x2="148" y2="78" stroke="currentColor" marker-end="url(#dn-a1)"/><text x="90" y="52" class="tm">w₁ = 1</text>
<line x1="58" y1="120" x2="148" y2="92" stroke="currentColor" marker-end="url(#dn-a1)"/><text x="90" y="128" class="tm">w₂ = 1</text>
<circle cx="178" cy="85" r="28" style="fill:var(--bg)"/><circle cx="178" cy="85" r="28" class="ft st"/><text x="178" y="82" text-anchor="middle">Σ + b</text><text x="178" y="98" text-anchor="middle" class="tm" font-size="10">b = −1.5</text>
<line x1="206" y1="85" x2="246" y2="85" stroke="currentColor" marker-end="url(#dn-a1)"/>
<rect x="248" y="65" width="70" height="40" rx="6" class="fv sb"/><text x="283" y="90" text-anchor="middle">z ≥ 0 ?</text>
<line x1="318" y1="85" x2="350" y2="85" stroke="currentColor" marker-end="url(#dn-a1)"/><text x="356" y="90">output 0 or 1</text>
<text x="356" y="130" class="tm" font-size="11">D: 1 + 1 − 1.5 = 0.5 → 1 (van)</text>
<text x="356" y="148" class="tm" font-size="11">B: 0 + 1 − 1.5 = −0.5 → 0</text>
</svg><figcaption>A neuron for "needs the van": each input times its weight, summed with the bias, then a yes/no step.</figcaption></figure>
  <p>Follow the picture from left to right. The two inputs flow along arrows, each multiplied by its weight; the circle adds them up together with the bias; the box applies the step and produces the answer. Think of a committee voting on a motion: each member's vote counts according to how much the committee trusts them (the weights), the chairperson has a standing lean for or against (the bias), and the motion passes if the total clears zero.</p>
  <p>The bias matters more than it looks. The points where z is exactly 0 form the neuron's <strong>decision boundary</strong>, the line separating "yes" from "no". Without a bias that line would be forced to pass through the corner where every input is 0 (order A), which rules out most useful lines. The bias lets the boundary sit anywhere.</p>
  <p>So far we chose the weights ourselves. The whole point of a neuron is that it can find them from examples, and the perceptron does this with a very simple correction rule. Start with every weight and the bias at 0. Show the neuron one order at a time. If its answer was right, change nothing. If it was wrong, nudge each weight in the direction that would have helped: <code>w ← w + α(y − ŷ)x</code> and <code>b ← b + α(y − ŷ)</code>, where y is the true answer, ŷ (said "y-hat") is the neuron's guess, and α is the <strong>learning rate</strong>, the size of each nudge (here 1). When the guess is right, y − ŷ is 0 and nothing moves. When the neuron said 0 but the truth was 1, y − ŷ is +1, so the weights of the inputs that were switched on grow and the bias rises, making a "yes" more likely next time.</p>
  <p>Trace the very first step on the van question. Weights and bias start at 0. Order A has inputs (0, 0), so z = 0, which counts as "≥ 0", so the neuron guesses 1 (van); the truth is 0. The error y − ŷ is −1, so the weights change by −1 × (0, 0), which is nothing, and the bias becomes −1. The neuron has learned to be more cautious. The code runs this rule for ten passes over the four orders, first for "needs the van" and then for "late":</p>
  <div class="fx" data-lang="py">def train_perceptron(X, y, epochs=10, lr=1.0):
    w = torch.zeros(2); b = 0.0
    for _ in range(epochs):
        for xi, yi in zip(X, y):
            pred = 1.0 if (w @ xi + b) &gt;= 0 else 0.0
            w += lr * (yi - pred) * xi          # moves only when the guess was wrong
            b += lr * (yi - pred)
    preds = [1 if (w @ xi + b) &gt;= 0 else 0 for xi in X]
    return w.tolist(), float(b), preds

van = torch.tensor([0., 0., 0., 1.])           # needs the van = far AND rain
print("van  (AND):", train_perceptron(X4, van))
print("late (XOR):", train_perceptron(X4, y4, epochs=100))</div>
  <div class="fx" data-lang="text">van  (AND): ([2.0, 1.0], -3.0, [0, 0, 0, 1])
late (XOR): ([-1.0, 0.0], 0.0, [1, 1, 0, 0])</div>
  <p>For the van question the neuron gets every order right, [0, 0, 0, 1], with weights (2, 1) and bias −3. That is a different line from the one we chose by hand, but it splits the orders the same way: only D reaches a score of at least 0 (2 + 1 − 3 = 0). For the late question, even after 100 passes, the predictions [1, 1, 0, 0] get orders A and C wrong. The next section shows this is not bad luck or too little training.</p>
  <p>One more connection is worth making now. If you replace the hard yes/no step with the smooth <strong>sigmoid</strong> function σ(z) = 1/(1 + e⁻ᶻ), which turns any score into a number between 0 and 1, the neuron becomes exactly <a class="xref" data-note="ml_classification">logistic regression</a>. So logistic regression, which you may already know, is a one-neuron network.</p>

  <h2 id="dn-xor"><span class="num">03</span>Why One Neuron Fails</h2>
  <p>The perceptron learned "van" quickly but never learned "late". Would more passes help? Would a smarter learning method help? To answer that, watch the perceptron rule order by order on the late question. Each line shows the score z, the guess, the truth, and the weights and bias after the update:</p>
  <div class="fx" data-lang="py">w = torch.zeros(2); b = 0.0
for rnd in range(1, 4):
    errors = 0
    for name, xi, yi in zip("ABCD", X4, y4):
        z = (w @ xi + b).item(); pred = 1.0 if z &gt;= 0 else 0.0
        w += (yi - pred) * xi; b += (yi - pred).item()
        errors += int(pred != yi)
        print(f"round {rnd} {name}: z={z:+.0f} guess={pred:.0f} truth={yi:.0f} -&gt; w={w.tolist()} b={b:+.0f}")
    print("  errors this round:", errors)</div>
  <div class="fx" data-lang="text">round 1 A: z=+0 guess=1 truth=0 -&gt; w=[0.0, 0.0] b=-1
round 1 B: z=-1 guess=0 truth=1 -&gt; w=[0.0, 1.0] b=+0
round 1 C: z=+0 guess=1 truth=1 -&gt; w=[0.0, 1.0] b=+0
round 1 D: z=+1 guess=1 truth=0 -&gt; w=[-1.0, 0.0] b=-1
  errors this round: 3
round 2 A: z=-1 guess=0 truth=0 -&gt; w=[-1.0, 0.0] b=-1
round 2 B: z=-1 guess=0 truth=1 -&gt; w=[-1.0, 1.0] b=+0
round 2 C: z=-1 guess=0 truth=1 -&gt; w=[0.0, 1.0] b=+1
round 2 D: z=+2 guess=1 truth=0 -&gt; w=[-1.0, 0.0] b=+0
  errors this round: 3
round 3 A: z=+0 guess=1 truth=0 -&gt; w=[-1.0, 0.0] b=-1
round 3 B: z=-1 guess=0 truth=1 -&gt; w=[-1.0, 1.0] b=+0
round 3 C: z=-1 guess=0 truth=1 -&gt; w=[0.0, 1.0] b=+1
round 3 D: z=+2 guess=1 truth=0 -&gt; w=[-1.0, 0.0] b=+0
  errors this round: 4</div>
  <p>Look at where round 2 starts and where round 3 is after its first order: both are w = [−1, 0], b = −1. From that point the same four updates repeat for ever. Fixing B breaks C, fixing C breaks D, fixing D breaks A, and the errors never reach zero. The rule is not slow; it is chasing a target that does not exist.</p>
  <p>We can prove that no weights work, using only the four orders. Suppose some w₁, w₂ and b did separate them. Each order then gives one condition on its score z = w₁·far + w₂·rain + b:</p>
  <table class="tbl">
    <tr><th>Order</th><th>Needs</th><th>Condition on the weights</th></tr>
    <tr><td>A (0, 0), on time</td><td>z &lt; 0</td><td>b &lt; 0</td></tr>
    <tr><td>B (0, 1), late</td><td>z ≥ 0</td><td>w₂ + b ≥ 0</td></tr>
    <tr><td>C (1, 0), late</td><td>z ≥ 0</td><td>w₁ + b ≥ 0</td></tr>
    <tr><td>D (1, 1), on time</td><td>z &lt; 0</td><td>w₁ + w₂ + b &lt; 0</td></tr>
  </table>
  <p>Add the conditions for B and C together: w₁ + w₂ + 2b ≥ 0, which rearranges to w₁ + w₂ + b ≥ −b. From A we know b is negative, so −b is positive, and therefore w₁ + w₂ + b is positive. But D needs it to be negative. The four conditions contradict each other, so no weights can satisfy them, and no amount of training will find any. This is the famous <strong>XOR problem</strong>; when Minsky and Papert pointed it out in 1969, it helped stall neural-network research for over a decade.</p>
  <p>A cleverer learning method does not rescue a single neuron either. Below, one neuron with a sigmoid (that is, logistic regression) is trained properly with gradient descent, the method the next note explains:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
neuron = nn.Linear(2, 1)                     # one neuron: w1*far + w2*rain + b
opt = torch.optim.SGD(neuron.parameters(), lr=1.0)
for step in range(5000):                     # gradient descent (explained in the next note)
    opt.zero_grad()
    loss = F.binary_cross_entropy_with_logits(neuron(X4).squeeze(1), y4)
    loss.backward(); opt.step()
print("weights", [round(v, 3) + 0.0 for v in neuron.weight.view(-1).tolist()], "bias", round(neuron.bias.item(), 3) + 0.0)
print("P(late) for A, B, C, D:", [round(v, 3) for v in torch.sigmoid(neuron(X4)).view(-1).tolist()])</div>
  <div class="fx" data-lang="text">weights [0.0, 0.0] bias 0.0
P(late) for A, B, C, D: [0.5, 0.5, 0.5, 0.5]</div>
  <p>The best the neuron can do is give up: both weights shrink to 0, so every order gets a probability of 0.5. Any tilt of the line would help two orders and hurt the other two by the same amount, so "no line at all" is the least bad choice. Think of separating salt from sugar laid out in a chessboard pattern with one straight cut of a knife: however you angle the knife, each side still has both. You need either a bent knife or a way to rearrange the board first. Notice also that the cure is not "more data": the 1,000 generated orders have exactly the same shape problem, only blurred by noise. The cure is a different kind of model.</p>
  <p>The general fact behind this is that a single neuron is a <strong>linear classifier</strong>: its decision boundary is always one straight line (or flat plane). The <strong>perceptron convergence theorem</strong> guarantees that the perceptron rule finds a separating line in a finite number of steps whenever one exists, which is why "van" worked; when none exists, as with XOR, it cycles for ever.</p>

  <h2 id="dn-mlp"><span class="num">04</span>Hidden Layers</h2>
  <p>We only have parts that draw straight lines. The trick is not to ask one neuron to answer "late?" directly. Instead, let two neurons answer easier questions that <em>are</em> straight-line questions, and then let a third neuron combine their answers. The first helper neuron asks "is <strong>at least one</strong> of far and rain true?", computed as h₁ = ReLU(far + rain). The second asks "are <strong>both</strong> true?", computed as h₂ = ReLU(far + rain − 1). Here <strong>ReLU</strong> (rectified linear unit) is a very simple activation: ReLU(z) = max(0, z), which keeps positive numbers as they are and turns negative numbers into 0. The final neuron then computes "at least one, but not both" as the score h₁ − 2h₂, and we call the order late if the score is above 0.5. Work it through by hand:</p>
  <table class="tbl">
    <tr><th>Order</th><th>far, rain</th><th>h₁ = ReLU(far + rain)</th><th>h₂ = ReLU(far + rain − 1)</th><th>score = h₁ − 2h₂</th><th>late?</th></tr>
    <tr><td>A</td><td>0, 0</td><td>ReLU(0) = 0</td><td>ReLU(−1) = 0</td><td>0 − 0 = 0</td><td>0 ✓</td></tr>
    <tr><td>B</td><td>0, 1</td><td>ReLU(1) = 1</td><td>ReLU(0) = 0</td><td>1 − 0 = 1</td><td>1 ✓</td></tr>
    <tr><td>C</td><td>1, 0</td><td>ReLU(1) = 1</td><td>ReLU(0) = 0</td><td>1 − 0 = 1</td><td>1 ✓</td></tr>
    <tr><td>D</td><td>1, 1</td><td>ReLU(2) = 2</td><td>ReLU(1) = 1</td><td>2 − 2 = 0</td><td>0 ✓</td></tr>
  </table>
  <p>All four are correct. To see <em>why</em> it works, move each order to a new position given by its two helper values (h₁, h₂) instead of (far, rain). A lands at (0, 0), B and C both land on (1, 0), and D lands at (2, 1). In this new space the two late orders are no longer on opposite corners; they sit on the very same spot, and one straight line (the output neuron) separates them from the rest:</p>
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
  <p>The two helper neurons form a <strong>hidden layer</strong>: a layer of neurons between the inputs and the output, called "hidden" because its values are not given in the data; the network invents them. A network with at least one hidden layer is called a <strong>multi-layer perceptron (MLP)</strong>, also a "fully connected" or "dense" network, because every neuron is connected to every neuron in the layer before it. Picture a manager who cannot read the raw data and asks two assistants simple questions: "is at least one problem present?" and "are both present?". From their two reports the manager's decision becomes one easy rule. The hidden neurons are the assistants and the output neuron is the manager.</p>
  <p>This is the central idea of deep learning: <strong>hidden layers create new features in which the problem becomes easy</strong>. Here we designed the features ourselves. A real network discovers its own. The code below first checks our hand-made network, then gives PyTorch a 2-4-1 network (2 inputs, 4 hidden neurons, 1 output) with random starting weights and no hints, and lets it learn (how it learns is the subject of <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>):</p>
  <div class="fx" data-lang="py">h1 = torch.relu(X4[:, 0] + X4[:, 1])          # "at least one"
h2 = torch.relu(X4[:, 0] + X4[:, 1] - 1)      # "both"
print("hand net: h1", h1.tolist(), "h2", h2.tolist(), "score", (h1 - 2 * h2).tolist())

torch.manual_seed(0)
net = nn.Sequential(nn.Linear(2, 4), nn.Tanh(), nn.Linear(4, 1))   # 2 inputs, 4 hidden, 1 output
opt = torch.optim.Adam(net.parameters(), lr=0.1)
for step in range(300):
    opt.zero_grad()
    loss = F.binary_cross_entropy_with_logits(net(X4).squeeze(1), y4)
    loss.backward(); opt.step()
print("learned net predicts", (net(X4).squeeze(1) &gt; 0).int().tolist(), " loss", round(loss.item(), 4))</div>
  <div class="fx" data-lang="text">hand net: h1 [0.0, 1.0, 1.0, 2.0] h2 [0.0, 0.0, 0.0, 1.0] score [0.0, 1.0, 1.0, 0.0]
learned net predicts [0, 1, 1, 0]  loss 0.0003</div>
  <p>The hand network's scores are [0, 1, 1, 0], exactly the "late" column. The learned network, starting from random weights, also predicts [0, 1, 1, 0], and its loss (a measure of wrongness, defined in the next note) is close to zero. It found its own helper features, probably not the same ones as ours, that make the problem separable.</p>
  <p>How far can this go? The <strong>universal approximation theorem</strong> says that one hidden layer with enough neurons and a non-linear activation can approximate any continuous function on a bounded range as closely as you like. It is a statement about what is possible, not a recipe: it does not say how many neurons you need, nor that training will find the right weights. In practice, several narrower layers stacked on top of each other (a <em>deep</em> network) need far fewer neurons than one enormous layer, because each layer can build on the features of the one before. That stacking is what the word "deep" in deep learning refers to.</p>

  <h2 id="dn-fwd"><span class="num">05</span>The Forward Pass</h2>
  <p>Working neuron by neuron and order by order is fine for four orders and three neurons. A real network pushes thousands of examples through layers of hundreds of neurons, so we need a compact way to compute a whole layer for a whole batch of examples at once. Computing the network's output from its input, layer by layer from left to right, is called the <strong>forward pass</strong> (or forward propagation). Each layer does the same three things: multiply by its weights, add its biases, apply its activation. The output of one layer becomes the input of the next. Think of a dosa stall: batter, spread on the tawa, add filling, fold. Each station changes the item and passes it on. A matrix multiplication is a station that handles a whole tray at once instead of one dosa at a time.</p>
  <p>To write our hand network with matrices, stack each neuron's weights as one row of a weight matrix and collect the biases in a vector:</p>
  <table class="tbl">
    <tr><th>Layer</th><th>Weights (one row per neuron)</th><th>Biases</th><th>Shape of W</th></tr>
    <tr><td>Hidden</td><td>W¹ = [[1, 1], [1, 1]]</td><td>b¹ = [0, −1]</td><td>(2 neurons × 2 inputs)</td></tr>
    <tr><td>Output</td><td>W² = [[1, −2]]</td><td>b² = [0]</td><td>(1 neuron × 2 inputs)</td></tr>
  </table>
  <p>The four orders form a matrix X of shape (4, 2), one row per order. The hidden layer computes Z¹ = X W¹ᵀ + b¹ (the ᵀ means "transpose": flip rows and columns), giving shape (4, 2) @ (2, 2) → (4, 2), and then H = ReLU(Z¹). Do row D by hand: [1, 1] times the transposed weights gives [2, 2]; adding [0, −1] gives [2, 1]; ReLU leaves [2, 1]. The output layer then gives [2, 1] · [1, −2] = 2 − 2 = 0, the same as the table in the previous section. The code does all four orders in two multiplications, then builds the same thing from PyTorch's <code>nn.Linear</code> layers:</p>
  <div class="fx" data-lang="py">W1 = torch.tensor([[1., 1.], [1., 1.]]); b1 = torch.tensor([0., -1.])
W2 = torch.tensor([[1., -2.]]);          b2 = torch.tensor([0.])
Z1 = X4 @ W1.T + b1          # (4, 2) @ (2, 2) -&gt; (4, 2)
H = torch.relu(Z1)           # same shape, negatives -&gt; 0
out = H @ W2.T + b2          # (4, 2) @ (2, 1) -&gt; (4, 1)
print("Z1 ", Z1.tolist()); print("H  ", H.tolist()); print("out", out.squeeze(1).tolist())

lin1, lin2 = nn.Linear(2, 2), nn.Linear(2, 1)          # the same layers, PyTorch style
with torch.no_grad():
    lin1.weight.copy_(W1); lin1.bias.copy_(b1); lin2.weight.copy_(W2); lin2.bias.copy_(b2)
print("nn.Linear version", lin2(torch.relu(lin1(X4))).squeeze(1).tolist())
print("weight shapes", tuple(lin1.weight.shape), tuple(lin2.weight.shape),
      " parameters", sum(p.numel() for p in [*lin1.parameters(), *lin2.parameters()]))</div>
  <div class="fx" data-lang="text">Z1  [[0.0, -1.0], [1.0, 0.0], [1.0, 0.0], [2.0, 1.0]]
H   [[0.0, 0.0], [1.0, 0.0], [1.0, 0.0], [2.0, 1.0]]
out [0.0, 1.0, 1.0, 0.0]
nn.Linear version [0.0, 1.0, 1.0, 0.0]
weight shapes (2, 2) (1, 2)  parameters 9</div>
  <p>Row A of Z1 is [0, −1], and ReLU turns the −1 into 0, exactly as in the hand table. <code>nn.Linear(in_features, out_features)</code> is PyTorch's ready-made layer: it stores W with shape (out, in), one row per neuron, and computes X @ W.T + b, which is why our code writes <code>W1.T</code>. Counting the numbers the network can adjust, its <strong>parameters</strong>: the hidden layer has 2 × 2 weights plus 2 biases = 6, the output layer has 2 × 1 + 1 = 3, total 9. In general a dense layer has in × out + out parameters.</p>
  <p>Written generally, for layer l with input A (where the first A is the data X): <strong>Z = A Wᵀ + b</strong> and then <strong>A_next = σ(Z)</strong>, applying the activation σ to every entry. With a batch of B examples, every intermediate matrix has B rows, one per example, so the whole batch flows through together. The same forward pass therefore works unchanged on the 1,000 generated orders:</p>
  <div class="fx" data-lang="py">score = (torch.relu(X @ W1.T + b1) @ W2.T + b2).squeeze(1)   # X is (1000, 2)
acc = ((score &gt; 0.5).float() == y).float().mean().item()
print(score.shape, " accuracy of the hand-set weights on 1,000 orders:", round(acc, 3))</div>
  <div class="fx" data-lang="text">torch.Size([1000])  accuracy of the hand-set weights on 1,000 orders: 0.725</div>
  <p>The forward pass handles 1,000 orders in one go, but the hand-set weights reach only 72.5% accuracy. They were designed for inputs that are exactly 0 or 1, while real orders sit anywhere in between, so "far + rain" is a poor helper feature for an order 4.9 km away in 9.9 mm/h of rain. A network that <em>learns</em> its weights from the 1,000 orders does much better (about 93–95%, see <a class="xref" data-note="dl_foundations">Neural Networks: The Big Picture</a>). Choosing weights from data is the job of the loss and backpropagation, covered in the next note.</p>

  <h2 id="dn-act"><span class="num">06</span>Activation Functions</h2>
  <p>We used ReLU between the layers because it made the hand network work. Is that bend really necessary? Try removing it. A layer without an activation computes A Wᵀ + b, which is a <strong>linear</strong> function: it can only stretch, rotate and shift its input, never bend it. Two such layers in a row give (X W₁ᵀ + b₁) W₂ᵀ + b₂, and multiplying out the brackets gives X (W₂W₁)ᵀ + (b₁W₂ᵀ + b₂), which is again a single linear layer with weight matrix W₂W₁. However many linear layers you stack, the result collapses into one, and one layer is one straight line. On our orders:</p>
  <div class="fx" data-lang="py">no_bend = (X4 @ W1.T + b1) @ W2.T + b2        # same two layers, ReLU removed
W_merged = W2 @ W1; b_merged = b1 @ W2.T + b2
print("two layers, no ReLU:", no_bend.squeeze(1).tolist())
print("one merged layer:   ", (X4 @ W_merged.T + b_merged).squeeze(1).tolist(),
      " W =", W_merged.tolist(), " b =", b_merged.tolist())</div>
  <div class="fx" data-lang="text">two layers, no ReLU: [2.0, 1.0, 1.0, 0.0]
one merged layer:    [2.0, 1.0, 1.0, 0.0]  W = [[-1.0, -1.0]]  b = [2.0]</div>
  <p>Without ReLU the two layers produce scores 2, 1, 1, 0 for A, B, C, D, exactly the same as one merged layer with W = [−1, −1] and b = 2, which is the straight-line rule "2 − (far + rain)". No threshold separates B and C from A and D in those scores (A scores highest, D lowest). So the activation is what lets extra layers add power. An <strong>activation function</strong> is a fixed, non-linear function applied to every neuron's score after the multiply-and-add, and it is the "bend" that turns a stack of straight lines into a curve.</p>
  <p>Which bend should we use? Three properties matter: the range of its output, its slope, and whether that slope is ever close to zero. The slope matters because, as the next note explains, learning sends error signals backwards through the network by <em>multiplying</em> them by each activation's slope, layer after layer. A slope near zero shrinks the signal to nothing, and the layers before it stop learning. The picture shows the three classic activations (solid) and their slopes (dashed):</p>
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
  </svg><figcaption>Solid blue: each activation's output for z from −4 to 4. Dashed red: its slope. Sigmoid and tanh flatten at both ends; ReLU's slope is exactly 1 for positive inputs and 0 for negative ones.</figcaption></figure>
  <p>The sigmoid squashes any score into the range 0 to 1 and the <strong>tanh</strong> (hyperbolic tangent) squashes it into −1 to 1; both have an S shape that goes flat at both ends. ReLU is just a hinge: flat at zero for negative inputs, a straight 45° line for positive ones. To see actual numbers, the code feeds six scores through each activation, including the scores −1, 0, 1 and 2 that our orders produced in the previous section, and asks PyTorch for the slope at each point. It also includes two modern variants: <strong>Leaky ReLU</strong>, which keeps a small slope of 0.01 for negative inputs, and <strong>GELU</strong>, a smooth version of ReLU:</p>
  <div class="fx" data-lang="py">z = torch.tensor([-3., -1., 0., 1., 2., 3.], requires_grad=True)
for name, f in [("sigmoid", torch.sigmoid), ("tanh", torch.tanh), ("relu", torch.relu),
                ("leaky", lambda t: F.leaky_relu(t, 0.01)), ("gelu", F.gelu)]:
    out = f(z)
    slope, = torch.autograd.grad(out.sum(), z)     # the slope of f at each z
    print(f"{name:8s} out   {[round(v, 3) for v in out.tolist()]}")
    print(f"{'':8s} slope {[round(v, 3) for v in slope.tolist()]}")</div>
  <div class="fx" data-lang="text">sigmoid  out   [0.047, 0.269, 0.5, 0.731, 0.881, 0.953]
         slope [0.045, 0.197, 0.25, 0.197, 0.105, 0.045]
tanh     out   [-0.995, -0.762, 0.0, 0.762, 0.964, 0.995]
         slope [0.01, 0.42, 1.0, 0.42, 0.071, 0.01]
relu     out   [0.0, 0.0, 0.0, 1.0, 2.0, 3.0]
         slope [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]
leaky    out   [-0.03, -0.01, 0.0, 1.0, 2.0, 3.0]
         slope [0.01, 0.01, 0.01, 1.0, 1.0, 1.0]
gelu     out   [-0.004, -0.159, 0.0, 0.841, 1.954, 2.996]
         slope [-0.012, -0.083, 0.5, 1.083, 1.085, 1.012]</div>
  <p>Read the slope rows. The sigmoid's slope is at most 0.25 (at z = 0) and only 0.045 at z = ±3: any signal passing backwards through it is cut to a quarter or less. Tanh is better, with a maximum slope of 1, but it too falls to 0.01 at the ends. ReLU's slope is exactly 1 for every positive score, so signals pass backwards through it without shrinking, and it costs only one comparison to compute. That is why ReLU became the default activation for hidden layers and made very deep networks trainable. Think of ReLU as a one-way valve: pushed forward, water passes at full strength; pushed back, nothing passes. The sigmoid is more like a dimmer switch that gets stuck near fully on or fully off; once stuck, turning the knob changes almost nothing.</p>
  <p>ReLU's weakness is the flat zero for negative scores. If a neuron's score is negative for every example, its output is always 0 and its slope is always 0, so it receives no learning signal and can never recover; this is called a <strong>dead ReLU</strong> (the next note shows one dying). Leaky ReLU avoids this with its small negative slope (0.01 in the output). GELU (and the similar SiLU) are smooth curves close to ReLU, used in Transformers and many modern networks. The table sums up the choices:</p>
  <table class="tbl">
    <tr><th>Activation</th><th>Formula</th><th>Output range</th><th>Typical use</th><th>Watch out for</th></tr>
    <tr><td>ReLU</td><td>max(0, z)</td><td>0 to ∞</td><td>default for hidden layers (MLPs, CNNs)</td><td>dead units when z stays negative</td></tr>
    <tr><td>Leaky ReLU</td><td>max(0.01z, z)</td><td>−∞ to ∞</td><td>when many ReLUs die</td><td>one more setting (the leak)</td></tr>
    <tr><td>GELU / SiLU</td><td>z·Φ(z) / z·σ(z)</td><td>about −0.17 to ∞</td><td>Transformers, modern CNNs</td><td>slightly slower to compute</td></tr>
    <tr><td>Sigmoid</td><td>1/(1 + e⁻ᶻ)</td><td>0 to 1</td><td>yes/no output layer, gates in LSTMs</td><td>flat ends, slope ≤ 0.25, not centred on 0</td></tr>
    <tr><td>Tanh</td><td>(eᶻ − e⁻ᶻ)/(eᶻ + e⁻ᶻ)</td><td>−1 to 1</td><td>hidden state of RNNs and LSTMs</td><td>flat ends</td></tr>
    <tr><td>Softmax</td><td>eᶻⁱ / Σⱼ eᶻʲ</td><td>0 to 1, sums to 1</td><td>multi-class output layer only</td><td>never in hidden layers</td></tr>
  </table>
  <p>One more reason sigmoid fell out of favour for hidden layers: its outputs are always positive (centred on 0.5, not 0), which makes all the weight updates of the next layer share the same sign and slows learning down. Tanh is centred on 0, which is one reason it survives inside recurrent networks (<a class="xref" data-note="dl_rnns">RNNs</a>).</p>

  <h2 id="dn-out"><span class="num">07</span>The Output Layer: Sigmoid and Softmax</h2>
  <p>The hidden layers can now bend, but the last layer still produces a raw score such as 0.6 or −1.8. The shop owner wants something more useful: "how likely is this order to be late?". That is a probability, a number between 0 and 1. The raw score coming out of the last layer is called a <strong>logit</strong>, and the output layer's job is to turn logits into probabilities.</p>
  <p>For a single yes/no question such as "late or not", the last layer has one neuron, and its logit z goes through the <strong>sigmoid</strong>, σ(z) = 1/(1 + e⁻ᶻ). A logit of 0 becomes 0.5, large positive logits approach 1 and large negative logits approach 0. By hand for z = 0.6 (the score our order D gets from the untrained network in the next note): e⁻⁰·⁶ = 0.5488, so σ = 1/1.5488 = 0.6457, meaning "a 64.6% chance this order is late".</p>
  <p>Now suppose the shop wants three possible answers: on time, a bit late (under 15 minutes), or very late. The last layer then has three neurons, giving three logits, say (2.0, 1.0, 0.1), and we need three probabilities that are all positive and add up to 1. <strong>Softmax</strong> does exactly that: raise e to the power of each logit (which makes every number positive), then divide each by the total (which makes them add up to 1). In symbols, pᵢ = eᶻⁱ / Σⱼ eᶻʲ. By hand: e² = 7.389, e¹ = 2.718, e⁰·¹ = 1.105, total 11.212, so the probabilities are 7.389/11.212 = 0.659, 2.718/11.212 = 0.242 and 1.105/11.212 = 0.099. Think of splitting a prize pot among contestants according to their scores, but exponentially: a contestant one point ahead gets e ≈ 2.7 times the share. Everyone gets something, and the shares always add up to the whole pot.</p>
  <div class="fx" data-lang="py">print("sigmoid(0.6) =", round(torch.sigmoid(torch.tensor(0.6)).item(), 4))
logits = torch.tensor([2.0, 1.0, 0.1])            # on time, a bit late, very late
p = torch.softmax(logits, 0)
print("softmax:", [round(v, 3) for v in p.tolist()], " sum =", round(p.sum().item(), 6))
print("softmax(logits + 100):", [round(v, 3) for v in torch.softmax(logits + 100, 0).tolist()])
two = torch.tensor([0.0, 0.6])                    # two-class softmax over [on time, late]
print("2-class softmax:", [round(v, 4) for v in torch.softmax(two, 0).tolist()])</div>
  <div class="fx" data-lang="text">sigmoid(0.6) = 0.6457
softmax: [0.659, 0.242, 0.099]  sum = 1.0
softmax(logits + 100): [0.659, 0.242, 0.099]
2-class softmax: [0.3543, 0.6457]</div>
  <p>The code confirms the hand calculations: σ(0.6) = 0.6457 and softmax gives 0.659, 0.242, 0.099, summing to 1. The third line shows something useful: adding 100 to every logit changes nothing, because only the <em>differences</em> between logits matter (the extra e¹⁰⁰ appears on the top and bottom of every fraction and cancels). Libraries use this to subtract the largest logit before exponentiating, so e never overflows. The last line shows that softmax over two classes with logits 0 and 0.6 gives P(late) = 0.6457, the same as the sigmoid of the gap 0.6 − 0. So "one sigmoid output" and "two softmax outputs" are two ways of writing the same yes/no model.</p>
  <p>The rule of thumb is therefore: use a sigmoid output when there is one yes/no answer, or several independent yes/no answers (an order could be both "fragile" and "heavy"; this is called <strong>multi-label</strong>); use softmax when exactly one of several classes is true (<strong>multi-class</strong>). Softmax belongs only in the output layer: inside the network it would force the neurons of a layer to compete and add up to 1, throwing information away. Each output pairs with its own loss function, binary or categorical cross-entropy, explained in <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>.</p>

  <h2 id="dn-traps"><span class="num">08</span>Common Mistakes</h2>
  <p>The most frequent error in a first network is getting the weight shape backwards. <code>nn.Linear(in, out)</code> stores its weights as (out, in), one row per neuron, so multiplying the data by the weight matrix without transposing it fails:</p>
  <div class="fx" data-lang="py">layer = nn.Linear(2, 3)
print("weight shape:", tuple(layer.weight.shape))     # (out, in), not (in, out)
try:
    X4 @ layer.weight                                 # wrong: forgot the transpose
except RuntimeError as e:
    print("RuntimeError:", e)
print("correct:", tuple((X4 @ layer.weight.T + layer.bias).shape), tuple(layer(X4).shape))</div>
  <div class="fx" data-lang="text">weight shape: (3, 2)
RuntimeError: mm: mat1 and mat2 shapes cannot be multiplied (4x2 and 3x2)
correct: (4, 3) (4, 3)</div>
  <p>"Shapes cannot be multiplied (4x2 and 3x2)" means the inner sizes (2 and 3) do not match. The fix is <code>X @ W.T</code>, or simply calling the layer, <code>layer(X)</code>, which does it for you. Writing the expected shape as a comment next to each line, as the code in this note does, catches most of these errors before they happen.</p>
  <p>The second mistake is squashing twice. PyTorch's <code>nn.BCEWithLogitsLoss</code> and <code>nn.CrossEntropyLoss</code> apply the sigmoid or softmax themselves, in a numerically safe way, so the model must hand them raw logits. If the model already applied a sigmoid, the loss applies another one on top:</p>
  <div class="fx" data-lang="py">logit = torch.tensor([5.0]); truth = torch.tensor([1.0])     # confident and correct
right = F.binary_cross_entropy_with_logits(logit, truth)
twice = F.binary_cross_entropy_with_logits(torch.sigmoid(logit), truth)   # sigmoid applied in the model too
best = F.binary_cross_entropy_with_logits(torch.tensor([1.0]), truth)     # best possible after squashing
print(f"loss from the logit: {right.item():.4f}")
print(f"loss after squashing twice: {twice.item():.4f}  (can never go below {best.item():.4f})")</div>
  <div class="fx" data-lang="text">loss from the logit: 0.0067
loss after squashing twice: 0.3151  (can never go below 0.3133)</div>
  <p>For a confident, correct prediction (logit 5, truth 1) the proper loss is almost zero, 0.0067. After squashing twice it is 0.3151, and it can never fall below 0.3133, because a sigmoid output is at most 1 and the second sigmoid turns that into at most 0.73. The network keeps being punished for answers that are already right, and training goes badly without any error message.</p>
  <p>Three more mistakes come straight from the ideas on this page. Stacking <code>nn.Linear</code> layers with no activation between them gives a model that is secretly one linear layer, however deep it looks. Leaving out the bias (<code>bias=False</code>) forces every boundary through the origin; only do it when a following normalisation layer adds its own shift. And using sigmoid or tanh in every hidden layer of a deep network shrinks the learning signal by up to four times per layer; use ReLU or one of its relatives inside and keep the sigmoid for the output.</p>

  <h2 id="dn-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <ul>
    <li>Orders A (far 0, rain 0) on time, B (0, 1) late, C (1, 0) late, D (1, 1) on time: late = far XOR rain.</li>
    <li>Not linearly separable: no single straight line splits late from on time.</li>
    <li>At scale: 1,000 generated orders (0–10 km, 0–20 mm/h, scaled to 0–1, 5% noisy labels); 48.9% late.</li>
  </ul>
  <h3>Definitions</h3>
  <ul>
    <li><b>Neuron</b>: z = w·x + b, then a = σ(z). <b>Weights</b> w: importance of each input. <b>Bias</b> b: shifts the boundary. <b>Activation</b> σ: the bend.</li>
    <li><b>Perceptron</b>: neuron with a 0/1 step; rule w ← w + α(y − ŷ)x, b ← b + α(y − ŷ); moves only when wrong.</li>
    <li><b>Decision boundary</b>: the points where z = 0; one straight line (hyperplane) for one neuron.</li>
    <li><b>Hidden layer</b>: neurons between input and output that build new features. <b>MLP</b>: stack of fully connected layers.</li>
    <li><b>Forward pass</b>: Z = A Wᵀ + b, A_next = σ(Z), layer by layer, starting from A = X.</li>
    <li><b>Logit</b>: raw output score before sigmoid/softmax.</li>
    <li><b>Universal approximation</b>: one wide hidden layer can approximate any continuous function; says nothing about size or training.</li>
  </ul>
  <h3>Activations and outputs</h3>
  <table class="tbl">
    <tr><th>Function</th><th>Formula</th><th>Range</th><th>Max slope</th><th>Use</th></tr>
    <tr><td>ReLU</td><td>max(0, z)</td><td>[0, ∞)</td><td>1 (0 if z &lt; 0)</td><td>hidden default</td></tr>
    <tr><td>Leaky ReLU</td><td>max(0.01z, z)</td><td>(−∞, ∞)</td><td>1 (0.01 if z &lt; 0)</td><td>avoid dead units</td></tr>
    <tr><td>GELU</td><td>z·Φ(z)</td><td>≈ (−0.17, ∞)</td><td>≈ 1.1</td><td>Transformers</td></tr>
    <tr><td>Sigmoid</td><td>1/(1 + e⁻ᶻ)</td><td>(0, 1)</td><td>0.25</td><td>yes/no or multi-label output</td></tr>
    <tr><td>Tanh</td><td>(eᶻ − e⁻ᶻ)/(eᶻ + e⁻ᶻ)</td><td>(−1, 1)</td><td>1</td><td>RNN states</td></tr>
    <tr><td>Softmax</td><td>eᶻⁱ / Σⱼ eᶻʲ</td><td>(0, 1), sums to 1</td><td>n/a</td><td>one-of-C output only</td></tr>
  </table>
  <h3>Key numbers</h3>
  <ul>
    <li>Hand XOR net: h₁ = ReLU(far + rain), h₂ = ReLU(far + rain − 1), score h₁ − 2h₂ → 0, 1, 1, 0. Hidden space: A (0, 0), B = C (1, 0), D (2, 1).</li>
    <li>2-2-1 net: 6 + 3 = 9 parameters. Hand weights on 1,000 orders: 72.5%.</li>
    <li>Without ReLU: merged W = [−1, −1], b = 2 → scores 2, 1, 1, 0 (fails).</li>
    <li>One neuron (logistic regression) on XOR: weights 0, P(late) = 0.5 for every order.</li>
    <li>σ(0.6) = 0.6457; softmax(2, 1, 0.1) = (0.659, 0.242, 0.099).</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import torch, torch.nn as nn
layer = nn.Linear(2, 32)                 # weight (32, 2), bias (32,): 96 parameters
net = nn.Sequential(nn.Linear(2, 32), nn.ReLU(),
                    nn.Linear(32, 1))     # outputs a logit
logit = net(X)                           # forward pass: (N, 2) -&gt; (N, 1)
p = torch.sigmoid(logit)                 # probability, for reading only
probs = torch.softmax(logits, dim=1)     # multi-class: rows sum to 1
loss = nn.BCEWithLogitsLoss()(logit.squeeze(1), y)   # pass logits, not p</div>
  <h3>Gotchas</h3>
  <ul>
    <li>More training cannot fix a linear model on XOR-like data; change the model.</li>
    <li>No activation between layers → they collapse into one linear layer.</li>
    <li><code>nn.Linear(in, out).weight</code> is (out, in); compute X @ W.T + b.</li>
    <li>Sigmoid/tanh in deep hidden stacks shrink the learning signal; ReLU inside.</li>
    <li>Softmax only at the output; PyTorch losses want logits (no double squashing).</li>
    <li>Judge accuracy against the majority-class baseline (about 51% here).</li>
  </ul>

  <h2 id="dn-qa"><span class="num">09</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does a single artificial neuron compute?</summary><div class="qa-body">It multiplies each input by a weight, adds the results and a bias, z = w·x + b, and passes z through an activation function, a = σ(z). The weights say how much each input matters and the bias shifts the decision threshold. Its decision boundary, where z = 0, is a straight line or flat plane.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the role of the bias term?</summary><div class="qa-body">The bias shifts the neuron's output independently of the inputs, which moves the decision boundary away from the origin. Without it, the boundary w·x = 0 would always pass through the point where all inputs are zero, which rules out most useful boundaries. It is the "pass mark" of the weighted vote.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a perceptron and logistic regression?</summary><div class="qa-body">Both compute a weighted sum plus bias. The perceptron applies a hard 0/1 step and learns with the perceptron rule, which only moves when a prediction is wrong. Logistic regression applies a sigmoid to get a probability and is trained by gradient descent on cross-entropy. Both draw a single straight boundary.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a single neuron learn XOR?</summary><div class="qa-body">XOR's positive examples sit on opposite corners of the square, so no straight line separates them from the negatives. Algebraically: (0,0) needs b &lt; 0, (0,1) and (1,0) need w₂ + b ≥ 0 and w₁ + b ≥ 0, and (1,1) needs w₁ + w₂ + b &lt; 0; adding the middle two gives w₁ + w₂ + b ≥ −b &gt; 0, a contradiction.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a hidden layer solve XOR?</summary><div class="qa-body">Hidden neurons compute new features in which the data becomes separable. With h₁ = ReLU(x₁ + x₂) ("at least one") and h₂ = ReLU(x₁ + x₂ − 1) ("both"), the two positive points both map to (1, 0), and the output h₁ − 2h₂ gives 0, 1, 1, 0. The output neuron is still a straight line, but in the new feature space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do neural networks need non-linear activation functions?</summary><div class="qa-body">Without them every layer is linear, and a composition of linear maps is itself linear: W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂). So a 100-layer network without activations is equivalent to one layer and can only draw straight boundaries. The non-linearity is what lets depth add expressive power.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is ReLU preferred over sigmoid in hidden layers?</summary><div class="qa-body">ReLU's slope is exactly 1 for positive inputs, so error signals pass backwards without shrinking, while the sigmoid's slope is at most 0.25 and nearly 0 at both ends, which causes vanishing gradients in deep networks. ReLU is also cheap (one comparison) and produces sparse activations. Its downside is dead units whose input is always negative.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the dying ReLU problem and how do you fix it?</summary><div class="qa-body">A ReLU neuron whose pre-activation is negative for every input always outputs 0 and has slope 0, so no gradient reaches its weights and it never recovers. It is usually caused by a too-high learning rate or bad initialisation. Fixes: lower learning rate, He initialisation, or Leaky ReLU, ELU or GELU, which keep a non-zero slope for negative inputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare sigmoid and tanh. Why is tanh often better as a hidden activation?</summary><div class="qa-body">Sigmoid outputs (0, 1) with maximum slope 0.25; tanh outputs (−1, 1) with maximum slope 1. Tanh is zero-centred, so the next layer's inputs have mixed signs and its weight updates are not all forced in the same direction, and its larger slope passes more signal back. Both still saturate at the ends.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is GELU and where is it used?</summary><div class="qa-body">GELU (Gaussian Error Linear Unit) is z·Φ(z), where Φ is the standard normal cumulative distribution. It behaves like a smooth ReLU: near 0 for very negative inputs, near z for positive ones, with a small negative dip. It is the standard activation in Transformers such as BERT and GPT.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does softmax do, and why does adding a constant to all logits not change it?</summary><div class="qa-body">Softmax turns C logits into C positive probabilities that sum to 1: pᵢ = eᶻⁱ / Σⱼ eᶻʲ. Adding a constant c multiplies every eᶻ by eᶜ, which cancels between numerator and denominator, so only the differences between logits matter. Libraries exploit this by subtracting the maximum logit to avoid overflow.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you use a sigmoid output and when softmax?</summary><div class="qa-body">Sigmoid for a single yes/no prediction, or for multi-label problems where several independent yes/no answers can all be true. Softmax for multi-class problems where exactly one of C classes is correct. A two-class softmax is mathematically the same as a sigmoid of the difference between the two logits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the shape of <code>nn.Linear(10, 3).weight</code> and how many parameters does the layer have?</summary><div class="qa-body">The weight is (3, 10), that is (out, in), one row per output neuron. The layer has 10 × 3 weights plus 3 biases = 33 parameters. It computes x @ W.T + b, mapping a batch of shape (N, 10) to (N, 3).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters does an MLP with layers 784 → 128 → 64 → 10 have?</summary><div class="qa-body">Each dense layer has in × out + out. So 784 × 128 + 128 = 100,480; 128 × 64 + 64 = 8,256; 64 × 10 + 10 = 650. Total 109,386. Almost all of them are in the first layer, which is typical when the input is large.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the universal approximation theorem say, and what doesn't it say?</summary><div class="qa-body">A network with one hidden layer, enough neurons and a non-linear activation can approximate any continuous function on a bounded domain arbitrarily well. It does not say how many neurons are needed, that gradient descent will find the weights, or that the result will generalise to new data. In practice deeper, narrower networks are far more efficient.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why go deep rather than just very wide?</summary><div class="qa-body">Each layer can build features out of the previous layer's features, so a deep network represents complex functions with far fewer neurons than a single wide layer (some functions need exponentially many neurons in one layer but few in several). Images show this clearly: edges, then shapes, then object parts, then objects. Depth brings training difficulties, which normalisation, good initialisation and residual connections address.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should a PyTorch model output raw logits when using <code>BCEWithLogitsLoss</code> or <code>CrossEntropyLoss</code>?</summary><div class="qa-body">These losses apply the sigmoid or log-softmax internally using a numerically stable formula. If the model also applies it, the outputs are squashed twice: in our example a confident correct prediction's loss rose from 0.0067 to 0.3151 and could never fall below 0.3133, so training is slow or wrong. Apply sigmoid/softmax only when you want to read probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a "dense" or "fully connected" layer, and what are its limits?</summary><div class="qa-body">A layer in which every output neuron is connected to every input, computing XWᵀ + b followed by an activation. It treats inputs as an unordered list, so it ignores structure such as neighbouring pixels in an image or the order of words, and it needs a huge number of parameters for large inputs. CNNs, RNNs and attention build that structure in.</div></details>
</main>
`
});
