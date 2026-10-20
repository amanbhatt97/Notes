// notes/dl/dl_foundations.js — Neural Networks: the Map
Object.assign(TOPIC_CONTENT, {
  "dl_foundations": `<main>
  <h1>Neural Networks: the Map</h1>
  <div class="where"><span>Deep Learning</span><span>Neural Networks</span><span>The Map</span></div>
  <p class="lead">A neural network is a machine that guesses, measures how wrong it was, works out which of its numbers caused the error, and nudges them, millions of times. This short note is the map of the Neural Networks track: <em>why</em> each piece exists, in the order each one becomes necessary, and which note teaches it. One running example goes through every note: <strong>will this delivery be late?</strong>, decided from two facts (distance and rain) by a rule that no straight line can capture. All outputs are from real runs (PyTorch 2.14, CPU, single thread).</p>

  <h2 id="df-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 700 200" width="700">
<defs><marker id="df-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="130" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="75" y="41" text-anchor="middle" font-size="11.5">Logistic Regression</text><text x="75" y="58" text-anchor="middle" class="tm" font-size="10">one neuron, one line</text>
<line x1="140" y1="45" x2="163" y2="45" stroke="currentColor" marker-end="url(#df-a0)"/>
<rect x="165" y="20" width="110" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="220" y="41" text-anchor="middle" font-size="12" font-weight="700">NN: the map</text><text x="220" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="275" y1="45" x2="298" y2="45" stroke="currentColor" marker-end="url(#df-a0)"/>
<rect x="300" y="20" width="90" height="50" rx="8" class="fb sb"/><text x="345" y="41" text-anchor="middle" font-size="11.5">Neurons</text><text x="345" y="58" text-anchor="middle" class="tm" font-size="10">build it</text>
<line x1="390" y1="45" x2="408" y2="45" stroke="currentColor" marker-end="url(#df-a0)"/>
<rect x="410" y="20" width="90" height="50" rx="8" class="fb sb"/><text x="455" y="41" text-anchor="middle" font-size="11.5">Backprop</text><text x="455" y="58" text-anchor="middle" class="tm" font-size="10">blame it</text>
<line x1="500" y1="45" x2="518" y2="45" stroke="currentColor" marker-end="url(#df-a0)"/>
<rect x="520" y="20" width="80" height="50" rx="8" class="fb sb"/><text x="560" y="41" text-anchor="middle" font-size="11.5">Training</text><text x="560" y="58" text-anchor="middle" class="tm" font-size="10">tune it</text>
<line x1="600" y1="45" x2="618" y2="45" stroke="currentColor" marker-end="url(#df-a0)"/>
<rect x="620" y="20" width="70" height="50" rx="8" class="fb sb"/><text x="655" y="41" text-anchor="middle" font-size="11.5">PyTorch</text><text x="655" y="58" text-anchor="middle" class="tm" font-size="10">code it</text>
<line x1="655" y1="70" x2="655" y2="100" stroke="currentColor" marker-end="url(#df-a0)"/>
<rect x="250" y="102" width="105" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="302" y="126" text-anchor="middle" font-size="11">CNNs (images)</text>
<rect x="365" y="102" width="105" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="417" y="126" text-anchor="middle" font-size="11">RNNs (sequences)</text>
<rect x="480" y="102" width="100" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="530" y="126" text-anchor="middle" font-size="11">Attention</text>
<rect x="590" y="102" width="100" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="640" y="126" text-anchor="middle" font-size="11">Keras</text>
<text x="10" y="120" class="tm" font-size="10.5">maths underneath:</text><text x="10" y="137" class="tm" font-size="10.5">calculus · optimization · linear algebra</text>
<text x="350" y="178" text-anchor="middle" class="tm" font-size="10.5">reading order: this map → Neurons → Loss &amp; Backprop → Training Well → PyTorch → CNNs / RNNs / Attention / Keras</text>
</svg><figcaption>The Deep Learning track. The four notes after this map build one network for the late-delivery problem; the later notes reuse every piece for images, sequences and text.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_classification">Logistic Regression</a> and <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a></b><span>You can already fit a model by minimising a loss with gradient descent. Logistic regression is one neuron: a weighted sum and a sigmoid. Its boundary is a straight line, and some problems need a boundary that bends.</span></li>
    <li><b>This note adds: the map</b><span>Why each part of a neural network exists, as a chain of needs, with the running example, and which note teaches each link. Read it first, and come back to it whenever you lose track of why a concept matters.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dl_neurons">Neurons, Layers &amp; Activations</a></b><span>Then <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>, <a class="xref" data-note="dl_training">Training Well</a> and <a class="xref" data-note="dl_pytorch">PyTorch</a>; after them <a class="xref" data-note="dl_cnns">CNNs</a>, <a class="xref" data-note="dl_rnns">RNNs</a>, <a class="xref" data-note="dl_attention">Attention</a> and <a class="xref" data-note="dl_keras">Keras</a>. Maths underneath: <a class="xref" data-note="m_calculus">Calculus</a>, <a class="xref" data-note="m_optimization">Optimization</a>, <a class="xref" data-note="m_linalg">Linear Algebra</a>.</span></li>
  </ol>

  <h2 id="df-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole track as one chain of needs. Each concept answers the question above it, and its weakness raises the next question. Running example: four orders A (near, dry, on time), B (near, rain, late), C (far, dry, late), D (far, rain, on time), plus 1,000 generated orders for "the same idea at scale".</p>
  <ol class="story">
    <li><b>Linear model (one neuron)</b><span>Q: can a weighted sum of distance and rain predict lateness? → It draws one straight line. Late orders B and C sit on opposite corners, so the best line gives every order P(late) = 0.5; on 1,000 orders it is barely better than guessing. We need a boundary that bends… (<a class="xref" data-note="dl_neurons">Neurons</a>)</span></li>
    <li><b>Hidden layer + non-linear activation</b><span>Q: how do straight-line parts make a bend? → Stack neurons with a bend (ReLU) between them: h₁ = "at least one", h₂ = "both", output h₁ − 2h₂ gives 0, 1, 1, 0. Without the bend, layers collapse back into one line. But we set those weights by hand… (<a class="xref" data-note="dl_neurons">Neurons</a>)</span></li>
    <li><b>Forward pass</b><span>Q: how does a network turn inputs into a prediction? → Layer by layer: multiply by weights, add bias, apply the activation; one matrix multiply per layer. A network with arbitrary starting weights says D (on time) is 64.6% likely to be late. How wrong is that? (<a class="xref" data-note="dl_neurons">Neurons</a>)</span></li>
    <li><b>Loss</b><span>Q: how do we measure wrongness as one number? → Cross-entropy: −ln(1 − 0.6457) = 1.04 for D; mean over the four orders 0.698 ≈ ln 2, i.e. "knows nothing". But which of the weights caused it? (<a class="xref" data-note="dl_backprop">Loss &amp; Backprop</a>)</span></li>
    <li><b>Backpropagation</b><span>Q: how much is each weight to blame? → The chain rule run backwards through the network, reusing every intermediate result: all gradients for about the cost of one extra forward pass. On D the output gets blame p − y = 0.6457. Now, how do we use the blame? (<a class="xref" data-note="dl_backprop">Loss &amp; Backprop</a>)</span></li>
    <li><b>Optimizer</b><span>Q: how far and in what way should each weight move? → Step against the gradient (SGD), with momentum and a per-weight step size (Adam), and a schedule that shrinks the step over time. On 1,000 orders: SGD 0.56, Adam 0.945 accuracy after 5 epochs. But training is fragile… (<a class="xref" data-note="dl_training">Training Well</a>)</span></li>
    <li><b>Initialisation, normalisation, regularisation</b><span>Q: why does a deep version not learn at all, and why does a big one memorise noise? → Good starting weights (He) and batch norm keep signals alive (a 6-layer net goes from 0.52 to 0.91–0.93); weight decay, dropout and early stopping stop memorising (validation loss 0.742 → 0.41–0.50). Now do it all in a real tool… (<a class="xref" data-note="dl_training">Training Well</a>)</span></li>
    <li><b>PyTorch</b><span>Q: how is all this written in practice? → Tensors, autograd (backprop for free), nn.Module, DataLoader, the five-line training step, eval mode, checkpoints, GPU, transfer learning, on the same delivery network. Then specialised layers: <a class="xref" data-note="dl_cnns">CNNs</a>, <a class="xref" data-note="dl_rnns">RNNs</a>, <a class="xref" data-note="dl_attention">Attention</a>. (<a class="xref" data-note="dl_pytorch">PyTorch</a>)</span></li>
  </ol>

  <h2 id="df-mapmm" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Neural Networks</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Build (Neurons)</div>
        <ul>
          <li><b>Neuron</b> z = w·x + b, then an activation</li>
          <li><b>One neuron</b> = one straight line; fails on XOR</li>
          <li><b>Hidden layer + ReLU</b> = bent boundary</li>
          <li><b>Forward pass</b> Z = XWᵀ + b per layer</li>
          <li><b>Output</b> sigmoid (yes/no), softmax (one of C)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Blame (Backprop)</div>
        <ul>
          <li><b>Loss</b> MSE (numbers), cross-entropy (classes)</li>
          <li><b>Gradient</b> slope of the loss per weight</li>
          <li><b>Backprop</b> chain rule backwards, reuse results</li>
          <li><b>Check</b> numeric gradient = autograd</li>
          <li>⚠ Vanishing/exploding in deep stacks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tune (Training Well)</div>
        <ul>
          <li><b>Optimizers</b> SGD → momentum → Adam(W)</li>
          <li><b>Schedules</b> big steps early, small late</li>
          <li><b>Init</b> He 2/fan_in, Xavier 2/(in + out)</li>
          <li><b>BatchNorm</b> re-standardise each layer</li>
          <li><b>Regularise</b> weight decay, dropout, early stopping</li>
          <li><b>Diagnose</b> train vs validation loss curves</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Code (PyTorch)</div>
        <ul>
          <li>Tensors, autograd, nn.Module</li>
          <li>Dataset/DataLoader, five-line step</li>
          <li>eval() + no_grad(), state_dict</li>
          <li>GPU device, transfer learning</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The loop</div>
        <ul>
          <li>guess (forward) → how wrong (loss) → who's to blame (backprop) → nudge (optimizer) → repeat</li>
          <li>💡 learning to bowl at a stump: adjust a little after every ball</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="df-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">A Line Can't Bend</span><span class="rm-sub">Why we need networks at all</span></div></div>
      <div class="rm-item rm-done" data-target="df-loop"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Learning Loop</span><span class="rm-sub">Guess, measure, blame, nudge</span></div></div>
      <div class="rm-item rm-done" data-target="df-chain"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Need Chain</span><span class="rm-sub">Which note answers what</span></div></div>
      <div class="rm-item rm-done" data-target="df-connect"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table for the track</span></div></div>
      <div class="rm-item rm-done" data-target="df-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The track on one page</span></div></div>
      <div class="rm-item rm-done" data-target="df-qa"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Connection questions</span></div></div>
    </div>
  </div>

  <h2 id="df-why"><span class="num">01</span>A Straight Line Can't Bend</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We already have models that learn from data (linear and logistic regression). Why do we need neural networks at all?</p>
  </div>
  <p>A food shop delivers by bike in dry weather, so far orders are late and near ones on time. In the rain it sends far orders by van on the fast highway (on time), but near orders still go by bike through flooded lanes (late). So an order is late when it is <strong>far or raining, but not both</strong>. Four orders tell the whole story:</p>
  <table class="tbl"><caption>The running example used in every note of the track</caption>
    <tr><th>Order</th><th>far</th><th>rain</th><th>late</th></tr>
    <tr><td>A</td><td>0</td><td>0</td><td>0 (on time)</td></tr>
    <tr><td>B</td><td>0</td><td>1</td><td>1 (late)</td></tr>
    <tr><td>C</td><td>1</td><td>0</td><td>1 (late)</td></tr>
    <tr><td>D</td><td>1</td><td>1</td><td>0 (on time)</td></tr>
  </table>
  <p>Draw the four orders on a square (distance across, rain up): the late ones are on one diagonal, the on-time ones on the other. A linear model, such as <a class="xref" data-note="ml_classification">logistic regression</a>, splits the square with one straight line, and no line puts B and C on one side and A and D on the other. This pattern has a name, <strong>XOR</strong>, and it is everywhere in real data whenever two factors <em>interact</em> (the effect of rain depends on the distance).</p>
  <p>The same pattern at scale: 1,000 generated orders with real distances (0–10 km) and rain (0–20 mm/h), late if (distance &gt; 5 km) XOR (rain &gt; 10 mm/h), with 5% of labels flipped as real-life noise. Train on 800, test on the other 200. First a linear model, then the smallest neural network that can bend:</p>
<div class="fx" data-lang="py">import torch, torch.nn as nn, torch.nn.functional as F
from sklearn.linear_model import LogisticRegression

def make_orders(n=1000, noise=0.05, seed=0):
    g = torch.Generator().manual_seed(seed)
    km = torch.rand(n, generator=g) * 10; rain = torch.rand(n, generator=g) * 20
    late = ((km &gt; 5) ^ (rain &gt; 10)) ^ (torch.rand(n, generator=g) &lt; noise)   # ^ = XOR
    return torch.stack([km / 10, rain / 20], 1), late.float()                 # inputs scaled to 0..1

X, y = make_orders()
Xtr, ytr, Xte, yte = X[:800], y[:800], X[800:], y[800:]

linear = LogisticRegression().fit(Xtr.numpy(), ytr.numpy())
print("logistic regression test accuracy:", round(linear.score(Xte.numpy(), yte.numpy()), 3))

torch.manual_seed(0)
net = nn.Sequential(nn.Linear(2, 32), nn.ReLU(), nn.Linear(32, 32), nn.ReLU(), nn.Linear(32, 1))
opt = torch.optim.Adam(net.parameters(), lr=1e-2)
for step in range(500):                                   # guess -&gt; loss -&gt; blame -&gt; nudge, 500 times
    opt.zero_grad()
    loss = F.binary_cross_entropy_with_logits(net(Xtr).squeeze(1), ytr)
    loss.backward(); opt.step()
acc = ((net(Xte).squeeze(1) &gt; 0).float() == yte).float().mean().item()
print("neural network test accuracy:     ", round(acc, 3))</div>
  <div class="fx" data-lang="text">logistic regression test accuracy: 0.5
neural network test accuracy:      0.935</div>
  <p>The linear model is right about half the time, no better than always guessing "on time". The neural network, with two small hidden layers, gets 93.5%, close to the ceiling of about 95% (5% of the labels are random noise that no model can predict). Every line of that network code is explained in the next four notes. This note explains <em>why</em> each line has to be there.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A light on a staircase with a switch at the top and one at the bottom: flip either and the light changes, flip both and it is back. "Light on" is XOR of the two switches. No rule of the form "on if 2 × top + 3 × bottom is big enough" can describe it; you need a rule that combines the switches.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>neural network</strong> is a function built from layers of simple units (neurons), each computing a weighted sum of its inputs plus a bias followed by a fixed non-linear activation. Its weights are learned from data by minimising a loss with gradient-based optimisation. <strong>Deep learning</strong> is the use of networks with many such layers.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Reaching for a neural network first. When a straight line (or a tree ensemble on tabular data) already works, it is cheaper, faster and easier to explain. Networks earn their keep when the pattern bends in ways you cannot hand-engineer: interactions, images, sound, text.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the learning loop.</b> The network found a bending rule on its own in 500 steps. What exactly happens in one of those steps?</div>

  <h2 id="df-loop"><span class="num">02</span>The Learning Loop in Miniature</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Train for 500 steps" hides everything. What does one step do, in a case small enough to follow every number?</p>
  </div>
  <p>Shrink the problem to one weight. The shop notices that rain adds delay in proportion to distance: orders 1, 2 and 3 km away arrived 2, 4 and 6 minutes late in the rain. The rule is "extra minutes = w × km" and the right w is 2, but the computer does not know that. It starts with a guess w = 0.5 and repeats four moves:</p>
  <div class="flow"><span>guess: ŷ = w × km</span><span>measure: loss = mean (ŷ − y)²</span><span>blame: gradient dL/dw</span><span>nudge: w −= 0.05 × gradient</span></div>
  <p>Step 0 by hand: guesses 0.5, 1.0, 1.5 minutes; errors −1.5, −3, −4.5; loss = (2.25 + 9 + 20.25)/3 = <strong>10.5</strong>. The gradient (how the loss changes as w grows) is the mean of 2 × error × km = 2 × (−1.5 − 6 − 13.5)/3 = <strong>−14</strong>. Negative means "the loss goes down if w goes up", so w moves up: 0.5 − 0.05 × (−14) = <strong>1.2</strong>.</p>
<div class="fx" data-lang="py">km = torch.tensor([1., 2., 3.]); late_min = torch.tensor([2., 4., 6.])     # hidden rule: 2 min per km
w = torch.tensor(0.5, requires_grad=True)                                  # first guess
for step in range(6):
    loss = ((w * km - late_min) ** 2).mean()   # measure: how wrong?
    loss.backward()                            # blame: dL/dw (backprop does this for us)
    print(f"step {step}: w {w.item():.3f}  loss {loss.item():.3f}  gradient {w.grad.item():.3f}")
    with torch.no_grad():
        w -= 0.05 * w.grad                     # nudge against the gradient
        w.grad.zero_()</div>
  <div class="fx" data-lang="text">step 0: w 0.500  loss 10.500  gradient -14.000
step 1: w 1.200  loss 2.987  gradient -7.467
step 2: w 1.573  loss 0.850  gradient -3.982
step 3: w 1.772  loss 0.242  gradient -2.124
step 4: w 1.879  loss 0.069  gradient -1.133
step 5: w 1.935  loss 0.020  gradient -0.604</div>
  <p>Step 0 matches the hand calculation, and w climbs 0.5 → 1.2 → 1.57 → … toward 2 while the loss falls from 10.5 to 0.02. Nobody told the program the answer. A real network runs exactly this loop with thousands of weights instead of one and a forward pass through several layers instead of one multiplication. Each move of the loop needs its own idea to work at that scale, and that is the track:</p>
  <table class="tbl">
    <tr><th>Move</th><th>One weight</th><th>Real network needs</th><th>Taught in</th></tr>
    <tr><td>Guess</td><td>w × km</td><td>neurons, layers, activations, forward pass</td><td><a class="xref" data-note="dl_neurons">Neurons</a></td></tr>
    <tr><td>Measure</td><td>mean squared error</td><td>a loss suited to the output (cross-entropy for late/on time)</td><td><a class="xref" data-note="dl_backprop">Loss &amp; Backprop</a></td></tr>
    <tr><td>Blame</td><td>one derivative</td><td>backpropagation: every weight's gradient in one backward pass</td><td><a class="xref" data-note="dl_backprop">Loss &amp; Backprop</a></td></tr>
    <tr><td>Nudge</td><td>w −= 0.05 × g</td><td>optimizers, schedules, init, normalisation, regularisation</td><td><a class="xref" data-note="dl_training">Training Well</a></td></tr>
    <tr><td>All four, in code</td><td>8 lines</td><td>tensors, autograd, nn.Module, DataLoader, training loop</td><td><a class="xref" data-note="dl_pytorch">PyTorch</a></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Learning to bowl at a single stump. First ball: way off to the left. You do not start over; you adjust your arm a little to the right. Next ball: closer. Your arm angle is the weight, the distance from the stump is the loss, "a little to the right" is the gradient step.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Weight</strong>: a number the model adjusts. <strong>Loss</strong>: one number for how wrong the current guesses are. <strong>Gradient</strong>: the slope of the loss with respect to each weight (which way and how strongly to move). <strong>Learning rate</strong>: the multiplier that sets the step size (0.05 here). <strong>Training</strong>: repeating guess → loss → gradient → update.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Stepping <em>with</em> the gradient instead of against it, or forgetting to reset it: PyTorch adds new gradients to old ones, which is why the loop calls <code>w.grad.zero_()</code>. Both mistakes are covered again in <a class="xref" data-note="dl_pytorch">PyTorch</a>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the need chain.</b> We have the loop. Which concept fixes which weakness, in what order, and where is each taught?</div>

  <h2 id="df-chain"><span class="num">03</span>The Need Chain and Reading Order</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Perceptron, activation, softmax, loss, backprop, Adam, He init, batch norm, dropout… How are these related, and why is each one needed?</p>
  </div>
  <p>Each concept exists because the one before it left a specific problem. Follow the arrows: every box is the fix for the weakness written on the arrow into it.</p>
  <figure class="viz"><svg viewBox="0 0 700 330" width="700">
<defs><marker id="df-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="150" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="85" y="40" text-anchor="middle" font-size="11.5" font-weight="700">linear model</text><text x="85" y="57" text-anchor="middle" class="tm" font-size="10">P(late) 0.5 for all</text>
<line x1="160" y1="43" x2="218" y2="43" stroke="currentColor" marker-end="url(#df-a1)"/><text x="165" y="35" class="tr" font-size="9.5">can't bend</text>
<rect x="220" y="20" width="200" height="46" rx="7" class="fb sb"/><text x="320" y="40" text-anchor="middle" font-size="11.5" font-weight="700">neurons + nonlinearity</text><text x="320" y="57" text-anchor="middle" class="tm" font-size="10">hidden layer: 0, 1, 1, 0</text>
<line x1="420" y1="43" x2="478" y2="43" stroke="currentColor" marker-end="url(#df-a1)"/><text x="424" y="35" class="tr" font-size="9.5">weights?</text>
<rect x="480" y="20" width="210" height="46" rx="7" class="fb sb"/><text x="585" y="40" text-anchor="middle" font-size="11.5" font-weight="700">forward pass</text><text x="585" y="57" text-anchor="middle" class="tm" font-size="10">start weights: D gets 0.646</text>
<line x1="585" y1="66" x2="585" y2="108" stroke="currentColor" marker-end="url(#df-a1)"/><text x="592" y="92" class="tr" font-size="9.5">how wrong?</text>
<rect x="480" y="110" width="210" height="46" rx="7" class="fv sb"/><text x="585" y="130" text-anchor="middle" font-size="11.5" font-weight="700">loss</text><text x="585" y="147" text-anchor="middle" class="tm" font-size="10">CE 0.698 ≈ ln 2</text>
<line x1="480" y1="133" x2="422" y2="133" stroke="currentColor" marker-end="url(#df-a1)"/><text x="428" y="125" class="tr" font-size="9.5">who's to blame?</text>
<rect x="220" y="110" width="200" height="46" rx="7" class="fr sr"/><text x="320" y="130" text-anchor="middle" font-size="11.5" font-weight="700">backpropagation</text><text x="320" y="147" text-anchor="middle" class="tm" font-size="10">every gradient, one pass</text>
<line x1="220" y1="133" x2="162" y2="133" stroke="currentColor" marker-end="url(#df-a1)"/><text x="166" y="125" class="tr" font-size="9.5">how to step?</text>
<rect x="10" y="110" width="150" height="46" rx="7" class="fg sg"/><text x="85" y="130" text-anchor="middle" font-size="11.5" font-weight="700">optimizer</text><text x="85" y="147" text-anchor="middle" class="tm" font-size="10">SGD → Adam, schedule</text>
<line x1="85" y1="156" x2="85" y2="198" stroke="currentColor" marker-end="url(#df-a1)"/><text x="92" y="182" class="tr" font-size="9.5">deep: won't learn; big: memorises</text>
<rect x="10" y="200" width="410" height="46" rx="7" class="ft st"/><text x="215" y="220" text-anchor="middle" font-size="11.5" font-weight="700">initialisation · normalisation · regularisation</text><text x="215" y="237" text-anchor="middle" class="tm" font-size="10">He init, batch norm, weight decay, dropout, early stopping</text>
<line x1="420" y1="223" x2="478" y2="223" stroke="currentColor" marker-end="url(#df-a1)"/><text x="424" y="215" class="tr" font-size="9.5">in code?</text>
<rect x="480" y="200" width="210" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="585" y="220" text-anchor="middle" font-size="11.5" font-weight="700">PyTorch</text><text x="585" y="237" text-anchor="middle" class="tm" font-size="10">same net, real tool</text>
<line x1="585" y1="246" x2="585" y2="278" stroke="currentColor" marker-end="url(#df-a1)"/>
<rect x="250" y="280" width="440" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="470" y="304" text-anchor="middle" font-size="11">images → CNNs · sequences → RNNs · long-range context → Attention · high-level API → Keras</text>
</svg><figcaption>The need chain of the track. Red labels on the arrows are the weakness that forces the next concept.</figcaption></figure>
  <table class="tbl"><caption>Problem → concept → note</caption>
    <tr><th>Problem left by the previous step</th><th>Concept that fixes it</th><th>Note</th></tr>
    <tr><td>A straight line cannot separate late from on-time orders</td><td>Neurons in layers with a non-linear activation (ReLU)</td><td><a class="xref" data-note="dl_neurons">Neurons, Layers &amp; Activations</a></td></tr>
    <tr><td>Need probabilities, not raw scores</td><td>Sigmoid / softmax output</td><td><a class="xref" data-note="dl_neurons">Neurons, Layers &amp; Activations</a></td></tr>
    <tr><td>"Bad" is not a number</td><td>Loss: MSE, cross-entropy</td><td><a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a></td></tr>
    <tr><td>Which weight to change, by how much?</td><td>Gradient via backpropagation (chain rule)</td><td><a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a></td></tr>
    <tr><td>Blame fades or explodes through many layers</td><td>ReLU, good init, normalisation, clipping</td><td><a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>, <a class="xref" data-note="dl_training">Training Well</a></td></tr>
    <tr><td>Plain gradient steps are slow and zig-zag</td><td>Momentum, Adam, learning-rate schedules</td><td><a class="xref" data-note="dl_training">Training Well</a></td></tr>
    <tr><td>A big network memorises noise</td><td>Weight decay, dropout, early stopping</td><td><a class="xref" data-note="dl_training">Training Well</a></td></tr>
    <tr><td>Writing all of it by hand is slow and error-prone</td><td>Tensors, autograd, nn.Module, DataLoader</td><td><a class="xref" data-note="dl_pytorch">PyTorch</a></td></tr>
    <tr><td>Images, sequences, long texts have structure an MLP ignores</td><td>Convolutions, recurrence, attention</td><td><a class="xref" data-note="dl_cnns">CNNs</a>, <a class="xref" data-note="dl_rnns">RNNs</a>, <a class="xref" data-note="dl_attention">Attention</a></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Building a house. Bricks (neurons) and mortar (activations) make walls (layers); a plumb line (loss) tells you how crooked a wall is; tracing which brick is off (backprop) tells you where to tap; how hard and how often to tap is technique (optimizers and the rest); power tools (PyTorch) do the same faster. Skip a step and the next one has nothing to stand on.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Reading order</strong> for the track: this map → <a class="xref" data-note="dl_neurons">Neurons, Layers &amp; Activations</a> → <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a> → <a class="xref" data-note="dl_training">Training Well</a> → <a class="xref" data-note="dl_pytorch">PyTorch</a> → <a class="xref" data-note="dl_cnns">CNNs</a> / <a class="xref" data-note="dl_rnns">RNNs</a> → <a class="xref" data-note="dl_attention">Attention</a>; <a class="xref" data-note="dl_keras">Keras</a> any time after PyTorch. Maths refreshers when needed: <a class="xref" data-note="m_linalg">Linear Algebra</a> (matrix multiply, shapes), <a class="xref" data-note="m_calculus">Calculus</a> (chain rule), <a class="xref" data-note="m_optimization">Optimization</a> (gradient descent, Adam).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Learning the pieces as a list ("activations, losses, optimizers, regularisers…") without their reasons. In interviews and in debugging, the question is always "why is this here, and what breaks without it?". Every note in the track ends with connection questions of exactly that kind.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We know the order. One table can show every concept, what it is built from, and its number on the running example.</div>

  <h2 id="df-connect"><span class="num">04</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can the whole track be seen at once: what each concept is built from, which question it answers, and what it does to the late-delivery orders?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 140" width="700">
<defs><marker id="df-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="40" width="120" height="50" rx="7" class="fb sb"/><text x="70" y="60" text-anchor="middle" font-size="11.5" font-weight="700">forward</text><text x="70" y="78" text-anchor="middle" class="tm" font-size="10">neurons, layers</text>
<line x1="130" y1="65" x2="168" y2="65" stroke="currentColor" marker-end="url(#df-a9)"/>
<rect x="170" y="40" width="120" height="50" rx="7" class="fv sb"/><text x="230" y="60" text-anchor="middle" font-size="11.5" font-weight="700">loss</text><text x="230" y="78" text-anchor="middle" class="tm" font-size="10">how wrong</text>
<line x1="290" y1="65" x2="328" y2="65" stroke="currentColor" marker-end="url(#df-a9)"/>
<rect x="330" y="40" width="120" height="50" rx="7" class="fr sr"/><text x="390" y="60" text-anchor="middle" font-size="11.5" font-weight="700">backprop</text><text x="390" y="78" text-anchor="middle" class="tm" font-size="10">who's to blame</text>
<line x1="450" y1="65" x2="488" y2="65" stroke="currentColor" marker-end="url(#df-a9)"/>
<rect x="490" y="40" width="120" height="50" rx="7" class="fg sg"/><text x="550" y="60" text-anchor="middle" font-size="11.5" font-weight="700">optimizer step</text><text x="550" y="78" text-anchor="middle" class="tm" font-size="10">nudge</text>
<path d="M550,90 L550,120 L70,120 L70,92" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#df-a9)"/><text x="250" y="114" class="tm" font-size="10">repeat (thousands of times)</text>
<text x="620" y="58" font-size="10" class="tm">init, norm,</text><text x="620" y="72" font-size="10" class="tm">regularisation</text><text x="620" y="86" font-size="10" class="tm">keep it healthy</text>
<text x="10" y="25" font-size="10.5" class="tm">PyTorch = this loop as code (autograd does the backprop box)</text>
</svg><figcaption>The loop every note builds on. Each box is a note; the dashed arrow is training.</figcaption></figure>
  <table class="tbl"><caption>The track on the running example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>Note</th></tr>
    <tr><td>Linear model</td><td>weighted sum + sigmoid</td><td>can a line predict lateness?</td><td>no: 0.5 for every order; 50% on 1,000</td><td><a class="xref" data-note="ml_classification">Logistic Regression</a></td></tr>
    <tr><td>Hidden layer + ReLU</td><td>several neurons + bend</td><td>how to bend?</td><td>h₁ − 2h₂ → 0, 1, 1, 0</td><td><a class="xref" data-note="dl_neurons">Neurons</a></td></tr>
    <tr><td>Forward pass</td><td>Z = XWᵀ + b, activation, per layer</td><td>what does the net predict?</td><td>start weights: 0.545, 0.594, 0.641, 0.646</td><td><a class="xref" data-note="dl_neurons">Neurons</a></td></tr>
    <tr><td>Loss</td><td>−ln p(true)</td><td>how wrong?</td><td>D: 1.04; mean 0.698 ≈ ln 2</td><td><a class="xref" data-note="dl_backprop">Backprop</a></td></tr>
    <tr><td>Backprop</td><td>chain rule, right to left</td><td>who is to blame?</td><td>output blame for D: p − y = 0.6457</td><td><a class="xref" data-note="dl_backprop">Backprop</a></td></tr>
    <tr><td>Optimizer + schedule</td><td>gradient + memory + step size</td><td>how to move?</td><td>epoch 5: SGD 0.56, Adam 0.945</td><td><a class="xref" data-note="dl_training">Training Well</a></td></tr>
    <tr><td>Init, batch norm</td><td>variance bookkeeping</td><td>can a deep net learn at all?</td><td>6 layers: 0.52 → 0.91 (He), 0.93 (BN)</td><td><a class="xref" data-note="dl_training">Training Well</a></td></tr>
    <tr><td>Regularisation</td><td>penalties, noise, monitoring</td><td>pattern or noise?</td><td>val loss 0.742 → 0.41–0.50</td><td><a class="xref" data-note="dl_training">Training Well</a></td></tr>
    <tr><td>PyTorch</td><td>tensors + autograd + modules</td><td>how in practice?</td><td>same network, about 93% validation accuracy</td><td><a class="xref" data-note="dl_pytorch">PyTorch</a></td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the track: <strong>a network guesses (forward), measures (loss), assigns blame (backprop) and nudges (optimizer), and every other concept either lets it represent a bent rule or keeps that loop healthy.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> The track on one page.</div>

  <h2 id="df-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole track on one sheet. Running example: orders A (far 0, rain 0, on time), B (0, 1, late), C (1, 0, late), D (1, 1, on time): late = far XOR rain. At scale: 1,000 generated orders (distance 0–10 km, rain 0–20 mm/h, 5% noisy labels).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our orders</th><th>Weakness → next</th></tr>
    <tr><td>Linear model</td><td>can a line predict lateness?</td><td>0.5 for all; 50% on 1,000 (network: 93.5%)</td><td>can't bend → hidden layer</td></tr>
    <tr><td>Hidden layer + activation</td><td>how to bend?</td><td>0, 1, 1, 0 by hand</td><td>hand weights → forward pass with learned weights</td></tr>
    <tr><td>Forward pass</td><td>what does it predict?</td><td>D: 0.646 with start weights</td><td>how wrong? → loss</td></tr>
    <tr><td>Loss</td><td>how wrong?</td><td>mean CE 0.698 ≈ ln 2</td><td>who's to blame? → backprop</td></tr>
    <tr><td>Backprop</td><td>gradient for every weight?</td><td>output blame 0.6457 on D</td><td>how to step? → optimizer</td></tr>
    <tr><td>Optimizer</td><td>how far, how?</td><td>Adam 0.945 vs SGD 0.56 at epoch 5</td><td>deep fails / big memorises → init, norm, reg</td></tr>
    <tr><td>Init, norm, regularisation</td><td>learn at all; learn the pattern?</td><td>deep 0.52 → 0.93; val loss 0.742 → 0.41</td><td>→ PyTorch</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Neuron</td><td>a = σ(w·x + b)</td><td>w weights, b bias, σ activation</td></tr>
    <tr><td>Layer</td><td>Z = XWᵀ + b; A = σ(Z)</td><td>X (batch × in), W (out × in)</td></tr>
    <tr><td>ReLU, sigmoid, softmax</td><td>max(0, z); 1/(1 + e⁻ᶻ); eᶻⁱ/Σeᶻʲ</td><td>hidden; yes/no output; one-of-C output</td></tr>
    <tr><td>Cross-entropy</td><td>−[y ln p + (1 − y) ln(1 − p)]</td><td>p predicted P(late), y truth</td></tr>
    <tr><td>Chain rule (backprop)</td><td>∂L/∂a = ∂L/∂b · ∂b/∂a</td><td>sigmoid + CE: ∂L/∂z = p − y</td></tr>
    <tr><td>Gradient step</td><td>w ← w − lr · ∂L/∂w</td><td>lr learning rate</td></tr>
    <tr><td>One-weight example</td><td>L = mean (w·km − y)²; dL/dw = mean 2(w·km − y)·km</td><td>w = 0.5: L = 10.5, dL/dw = −14 → w = 1.2</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Linear / logistic model</b><p>Use when the effect of each input does not depend on the others.</p><small>Fails on interactions (XOR)</small></div>
    <div><b>MLP</b><p>Use for bent boundaries on tabular or feature data.</p><small>Tree ensembles are often as good on tables</small></div>
    <div><b>CNN / RNN / attention</b><p>Use for images, sequences, text.</p><small>An MLP ignores their structure</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Expecting a linear model to learn interactions; stacking layers with no activation (they collapse into one); probabilities from an untrained net mean nothing; stepping with the gradient instead of against it; not resetting gradients; judging by training loss instead of validation; learning concepts without their "why".</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Why can't logistic regression learn "late = far XOR rain"?</td><td>Its boundary is one straight line; the late orders are on opposite corners</td></tr>
    <tr><td>The four moves of one training step?</td><td>Forward (guess), loss (measure), backprop (blame), optimizer step (nudge)</td></tr>
    <tr><td>One-weight example, w = 1.2: loss and gradient?</td><td>Errors −0.8, −1.6, −2.4: loss 2.987; gradient 2·(−0.8 − 3.2 − 7.2)/3 = −7.467</td></tr>
    <tr><td>What is an untrained yes/no network's loss?</td><td>About ln 2 = 0.693</td></tr>
    <tr><td>Which note fixes "deep network doesn't learn at all"?</td><td>Training Well (initialisation, batch norm)</td></tr>
  </table>

  <h2 id="df-qa"><span class="num">05</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you say, for each concept in the track, why it is needed and what breaks without it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one line each: what are a weight, a loss, a gradient and a learning rate?</summary><div class="qa-body">Weight: a number the network adjusts. Loss: one number for how wrong the current guesses are. Gradient: the slope of the loss per weight (which way, how strongly). Learning rate: the multiplier on the step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a neural network and logistic regression?</summary><div class="qa-body">Logistic regression is one neuron: a weighted sum and a sigmoid, so one straight boundary. A network stacks layers of neurons with non-linear activations, so its boundary can bend. On the 1,000 orders: 50% vs 93.5%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a network need an activation function between layers?</summary><div class="qa-body">Without it, layers are linear maps and any stack of them equals one linear map: back to logistic regression's single line. The bend is what lets depth add power.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does backprop need a loss?</summary><div class="qa-body">Backprop computes how one number changes with each weight. Without a single number for "how wrong", there is nothing to differentiate. The loss also defines what "better" means (cross-entropy for late/on time).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: backprop gives exact gradients. Why do we still need optimizers, init, normalisation and regularisation?</summary><div class="qa-body">The gradient is only local direction. How far to step (and with what memory) is the optimizer; whether a deep network passes any signal at all is init and normalisation; whether it learns the pattern instead of the noise is regularisation. Each fixes a failure we measured on the delivery orders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip straight to PyTorch without the earlier notes?</summary><div class="qa-body">You can run the code, but you cannot debug it: loss stuck at 0.693, NaN, validation worse than training, a deep model that will not learn. Each symptom maps to a concept (activation, lr, init, regularisation) from the earlier notes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use a neural network?</summary><div class="qa-body">When a simpler model already captures the pattern, data is small, or explanations are required; on tabular data gradient-boosted trees are often as good or better. Networks shine on interactions you can't hand-engineer and on images, audio and text.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="dl_neurons">Neurons, Layers &amp; Activations</a>.</b> Start building: one neuron, why it fails on the four orders, and the hidden layer that fixes it, by hand.</div>
</main>`
});
