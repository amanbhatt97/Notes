// notes/dl/dl_backprop.js — Loss & Backpropagation
Object.assign(TOPIC_CONTENT, {
  "dl_backprop": `<main>
  <h1>Loss &amp; Backpropagation</h1>
  <div class="where"><span>Deep Learning</span><span>Neural Networks</span><span>Loss &amp; Backpropagation</span></div>
  <p class="lead">A neural network starts with arbitrary weights and therefore makes bad predictions. To get better on its own it needs two things: a single number that says how wrong it is, called the <strong>loss</strong>, and, for every weight, the direction in which moving that weight would reduce the loss, called the <strong>gradient</strong>. <strong>Backpropagation</strong> is the method that computes all those gradients in one sweep backwards through the network, and it is what makes training networks with millions of weights possible. This page works through all of it by hand on the same small example used in <a class="xref" data-note="dl_neurons">Neurons, Layers &amp; Activations</a>: four delivery orders, where an order is late when it is far or raining but not both, and a tiny network with two inputs, two hidden ReLU neurons and one sigmoid output. Every number in the tables is checked by code, and every output shown is from a real run.</p>

  <h2 id="db-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Loss &amp; Backpropagation</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Loss</div>
        <ul>
          <li>One number for "how wrong"; 0 = perfect</li>
          <li>MSE for numbers; cross-entropy for classes</li>
          <li>Untrained classifier ≈ ln C (ln 2 = 0.693)</li>
          <li>Sigmoid/softmax + CE: ∂L/∂z = p − y</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradient</div>
        <ul>
          <li>∂L/∂w: how the loss changes when w moves</li>
          <li>Sign = direction, size = strength</li>
          <li>Numeric: nudge ± h, 2 passes per weight (too slow)</li>
          <li>Update: w ← w − lr · ∂L/∂w</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Backprop</div>
        <ul>
          <li>Forward pass = chain of simple boxes (graph)</li>
          <li>Chain rule: multiply local slopes, right to left</li>
          <li>Gradient out = gradient in × local slope; add over paths</li>
          <li>Cost ≈ one extra forward pass; must store activations</li>
          <li>Autograd = backprop done by the library</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When it breaks</div>
        <ul>
          <li>Vanishing: many slopes &lt; 1 multiply to ~0</li>
          <li>Exploding: many factors &gt; 1 → NaN; clip the norm</li>
          <li>Dead ReLU: slope 0 for every input → no learning</li>
          <li>Fixes: ReLU, good init, normalisation, residuals</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="db-start"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Starting Network</span><span class="rm-sub">what an untrained network predicts</span></div></div>
      <div class="rm-item rm-done" data-target="db-loss"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Loss Functions</span><span class="rm-sub">MSE and cross-entropy, and why CE for classes</span></div></div>
      <div class="rm-item rm-done" data-target="db-grad"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Gradient</span><span class="rm-sub">finding each weight's blame by nudging it</span></div></div>
      <div class="rm-item rm-done" data-target="db-graph"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Computational Graph and the Chain Rule</span><span class="rm-sub">big formulas as small boxes</span></div></div>
      <div class="rm-item rm-done" data-target="db-bp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Backpropagation</span><span class="rm-sub">every gradient in one backward walk, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="db-gd"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Learning with the Gradient</span><span class="rm-sub">one step, then three thousand</span></div></div>
      <div class="rm-item rm-done" data-target="db-check"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Gradient Checking and Autograd</span><span class="rm-sub">proving the gradients are right</span></div></div>
      <div class="rm-item rm-done" data-target="db-vg"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Vanishing and Exploding Gradients</span><span class="rm-sub">what happens to blame in deep networks</span></div></div>
      <div class="rm-item rm-done" data-target="db-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">wrong sign, piled-up gradients, wrong loss input</span></div></div>
      <div class="rm-item rm-done" data-target="db-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, backward table, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="db-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about loss and backprop</span></div></div>
    </div>
  </div>

  <h2 id="db-start"><span class="num">01</span>The Starting Network</h2>
  <p>In the previous note we solved the late-delivery problem by choosing the weights ourselves. A real network has to find them, and it starts from weights that are essentially arbitrary (in practice small random numbers). Let us see what such a network says before it has learned anything. It has the same shape as the hand-built one, two inputs (far, rain), two hidden neurons with ReLU, and one output neuron whose sigmoid gives P(late). To make every step checkable by hand, the starting weights here are fixed round numbers rather than random ones:</p>
  <table class="tbl">
    <tr><th>Part</th><th>Weights</th><th>Bias</th><th>What it computes</th></tr>
    <tr><td>Hidden neuron 1</td><td>W¹ row 1 = (0.5, 0.4)</td><td>b¹₁ = 0.1</td><td>z₁ = 0.5·far + 0.4·rain + 0.1, h₁ = ReLU(z₁)</td></tr>
    <tr><td>Hidden neuron 2</td><td>W¹ row 2 = (0.3, 0.6)</td><td>b¹₂ = −0.4</td><td>z₂ = 0.3·far + 0.6·rain − 0.4, h₂ = ReLU(z₂)</td></tr>
    <tr><td>Output neuron</td><td>v = (0.8, −0.6)</td><td>c = 0.1</td><td>z = 0.8·h₁ − 0.6·h₂ + 0.1, p = σ(z)</td></tr>
  </table>
  <p>All the adjustable numbers of a network, its weights and biases together, are called its <strong>parameters</strong>; this network has nine. Run the forward pass for order D (far 1, rain 1) by hand. z₁ = 0.5 + 0.4 + 0.1 = 1.0, so h₁ = 1.0. z₂ = 0.3 + 0.6 − 0.4 = 0.5, so h₂ = 0.5. The output score is z = 0.8 × 1.0 − 0.6 × 0.5 + 0.1 = 0.6, and the sigmoid gives p = 1/(1 + e⁻⁰·⁶) = 0.6457. The network thinks order D is 64.6% likely to be late, but D was on time. The code does the same for all four orders:</p>
  <div class="fx" data-lang="py">import torch, torch.nn.functional as F
X4 = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])   # orders A, B, C, D: (far, rain)
y4 = torch.tensor([0., 1., 1., 0.])                          # late?

def start_weights():
    W1 = torch.tensor([[0.5, 0.4], [0.3, 0.6]]); b1 = torch.tensor([0.1, -0.4])
    v = torch.tensor([0.8, -0.6]);               c = torch.tensor(0.1)
    return W1, b1, v, c

def forward(X, W1, b1, v, c):
    Z1 = X @ W1.T + b1          # (4, 2) hidden scores
    H = torch.relu(Z1)          # (4, 2) hidden outputs
    z = H @ v + c               # (4,)   output logits
    return Z1, H, z, torch.sigmoid(z)

W1, b1, v, c = start_weights()
Z1, H, z, p = forward(X4, W1, b1, v, c)
for i, name in enumerate("ABCD"):
    print(f"{name}: z1,z2={[round(t, 2) for t in Z1[i].tolist()]}  h={[round(t, 2) for t in H[i].tolist()]}"
          f"  z={z[i].item():.2f}  P(late)={p[i].item():.4f}  truth={int(y4[i])}")</div>
  <div class="fx" data-lang="text">A: z1,z2=[0.1, -0.4]  h=[0.1, 0.0]  z=0.18  P(late)=0.5449  truth=0
B: z1,z2=[0.5, 0.2]  h=[0.5, 0.2]  z=0.38  P(late)=0.5939  truth=1
C: z1,z2=[0.6, -0.1]  h=[0.6, 0.0]  z=0.58  P(late)=0.6411  truth=1
D: z1,z2=[1.0, 0.5]  h=[1.0, 0.5]  z=0.60  P(late)=0.6457  truth=0</div>
  <p>Order D matches the hand calculation. Now read the column of probabilities: 0.545, 0.594, 0.641, 0.646. The network calls every order "probably late", and it rates D, an on-time order, as the most likely of all to be late. It is no use as it stands. Notice also order A: its z₂ is −0.4, so ReLU switches hidden neuron 2 off for that order (h₂ = 0). That detail will matter later, because a neuron that is switched off passes no learning signal.</p>
  <p>Think of a new dispatcher on their first day, guessing from gut feeling. The guesses are not random noise; they follow a rule, just the wrong one. Training will correct the rule, rather than memorise four answers. And do not read 0.6457 as "the network is fairly unsure": the probabilities of an untrained network mean nothing at all.</p>

  <h2 id="db-loss"><span class="num">02</span>Loss Functions</h2>
  <p>We can see the network is bad, but "bad" is a feeling, and a computer cannot improve a feeling. It needs a single number that is 0 when every prediction is perfect and grows as predictions get worse. A <strong>loss function</strong> provides it: it takes a prediction and the true answer and returns one number. Averaged over many examples it is sometimes called the <strong>cost</strong>, though most people say "loss" for both. The choice of loss matters because it defines what "better" means, and, as we will see, it decides how strong a learning signal the network receives. The general theory is in <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>; three losses cover nearly every network.</p>
  <p>When the network predicts a number, such as how many minutes late an order will be, the usual choice is the <strong>mean squared error (MSE)</strong>: square each error and average, MSE = (1/n) Σ (ŷ − y)², where ŷ is the prediction, y the truth and n the number of examples. Squaring makes every error positive and punishes big misses much more than small ones.</p>
  <p>When the network predicts yes or no, such as late or on time, the usual choice is <strong>binary cross-entropy</strong>. In plain words it asks: what probability did the network give to the answer that actually happened? If that probability is high, the loss is small; if it is low, the loss is large. The formula takes the negative logarithm of that probability: −ln p when the truth is 1, and −ln(1 − p) when the truth is 0, which is written in one line as L = −[y ln p + (1 − y) ln(1 − p)]. For order D the truth is 0, so the loss is −ln(1 − 0.6457) = −ln(0.3543) = 1.0375. For several classes (on time, a bit late, very late) the same idea is called <strong>categorical cross-entropy</strong>: L = −ln(probability given to the true class), with the probabilities coming from softmax.</p>
  <p>Averaging cross-entropy over the four orders gives (0.787 + 0.521 + 0.445 + 1.0375)/4 ≈ 0.698. Compare that with ln 2 = 0.693, which is exactly the loss of a model that answers 50/50 for everything. So our starting network knows nothing, which is precisely what an untrained network should look like. This gives a useful sanity check in practice: an untrained classifier with C classes should start with a loss of about ln C.</p>
  <div class="fx" data-lang="py">per_order = F.binary_cross_entropy(p, y4, reduction="none")
print("per-order CE:", [round(t, 4) for t in per_order.tolist()], " mean:", round(per_order.mean().item(), 4))
print("same from logits:", round(F.binary_cross_entropy_with_logits(z, y4).item(), 4), "  ln 2 =", 0.6931)
print("MSE on the probabilities:", round(F.mse_loss(p, y4).item(), 4))
for q in [0.9, 0.5, 0.1, 0.01]:
    print(f"P(true answer) = {q}: CE = {-torch.log(torch.tensor(q)).item():.3f}")
logits3 = torch.tensor([[2.0, 1.0, 0.1]])        # on time, a bit late, very late
print("3-class CE, truth 'on time':", round(F.cross_entropy(logits3, torch.tensor([0])).item(), 4),
      "  truth 'very late':", round(F.cross_entropy(logits3, torch.tensor([2])).item(), 4))</div>
  <div class="fx" data-lang="text">per-order CE: [0.7872, 0.5211, 0.4446, 1.0375]  mean: 0.6976
same from logits: 0.6976   ln 2 = 0.6931
MSE on the probabilities: 0.2519
P(true answer) = 0.9: CE = 0.105
P(true answer) = 0.5: CE = 0.693
P(true answer) = 0.1: CE = 2.303
P(true answer) = 0.01: CE = 4.605
3-class CE, truth 'on time': 0.417   truth 'very late': 2.317</div>
  <p>The per-order losses match the hand numbers, and D is the worst. <code>binary_cross_entropy_with_logits</code> takes the raw score z instead of p and gives the same 0.6976; it is the version to use in practice because it never has to compute the logarithm of 0. The four "P(true answer)" lines show the character of cross-entropy: putting 90% on the truth costs 0.105, but putting only 1% on it costs 4.605, about 44 times more. Cross-entropy works like negative marking in an exam: a confident wrong answer costs far more than an honest "not sure", so the network learns to be confident only when it has reason to be. The last line applies categorical cross-entropy to the three logits from the previous note (softmax 0.659, 0.242, 0.099): −ln 0.659 = 0.417 if the truth is "on time", −ln 0.099 = 2.317 if it is "very late".</p>
  <p>Why not use MSE for yes/no answers too? Both losses fall as p moves towards the truth. The difference lies in the learning signal they produce, which is the slope of the loss with respect to the output score z (the next sections explain why this slope is what drives learning). For a sigmoid followed by cross-entropy, a short calculation with the chain rule (shown in section 04) gives a strikingly simple slope: ∂L/∂z = <strong>p − y</strong>, the prediction minus the truth. For MSE the slope is 2(p − y) · p(1 − p): the same error multiplied by the sigmoid's own slope p(1 − p), which is tiny when p is close to 0 or 1.</p>
  <table class="tbl">
    <tr><th>Prediction p (truth y = 0)</th><th>Cross-entropy signal: p − y</th><th>MSE signal: 2(p − y)·p(1 − p)</th></tr>
    <tr><td>0.6457 (our order D)</td><td>0.6457</td><td>2 × 0.6457 × 0.6457 × 0.3543 = 0.2954</td></tr>
    <tr><td>0.99 (confidently wrong)</td><td>0.99</td><td>2 × 0.99 × 0.99 × 0.01 = 0.0196</td></tr>
  </table>
  <p>When the network is confidently wrong, cross-entropy pushes hard (0.99) while MSE barely whispers (0.0196), so a classifier trained with MSE can stay stuck being confidently wrong. Cross-entropy is also what statistics recommends: minimising it is the same as choosing the weights that make the observed labels most probable (maximum likelihood, derived in <a class="xref" data-note="ml_classification">Logistic Regression</a>).</p>

  <h2 id="db-grad"><span class="num">03</span>The Gradient</h2>
  <p>The loss tells us how wrong the network is, but not what to do about it. There are nine parameters. For each one we want to know: if I move this number a little, does the loss go up or down, and by how much? The most direct way to find out is simply to try. Take one weight, say v₁ (the weight from hidden neuron 1 to the output, currently 0.8). Nudge it up by a tiny amount h = 0.001 and recompute the loss, then nudge it down by 0.001 and recompute again, and divide the change in loss by the total nudge of 0.002. That ratio is the slope of the loss along v₁, written <strong>∂L/∂v₁</strong> and read "the partial derivative of L with respect to v₁": how fast L changes when only v₁ moves and everything else stays fixed (background in <a class="xref" data-note="m_calculus">Calculus</a>).</p>
  <p>Do it by hand on order D. With v₁ = 0.801 the output score is 0.601, p = 0.64589 and the loss is 1.03813. With v₁ = 0.799 the score is 0.599, p = 0.64543 and the loss is 1.03684. The slope is (1.03813 − 1.03684)/0.002 ≈ 0.646. It is positive, which means raising v₁ raises the loss, so v₁ should go <em>down</em>. Collect this slope for every parameter and you have the <strong>gradient</strong>: a list with one slope per parameter, pointing in the direction in which the loss rises fastest. Training moves every parameter a small step the opposite way, w ← w − lr × ∂L/∂w, where lr is the learning rate. This is <strong>gradient descent</strong>. The code nudges each of the nine parameters in turn:</p>
  <div class="fx" data-lang="py">def loss_D(params):                                # the loss on order D alone
    W1, b1, v, c = params
    return F.binary_cross_entropy_with_logits(forward(X4[3:], W1, b1, v, c)[2], y4[3:])

def numeric_grad(loss_fn, params, h=1e-3):
    grads = []
    for t in params:
        g = torch.zeros_like(t)
        for i in range(t.numel()):                 # nudge each number in turn
            orig = t.view(-1)[i].item()
            t.view(-1)[i] = orig + h; up = loss_fn(params).item()
            t.view(-1)[i] = orig - h; down = loss_fn(params).item()
            t.view(-1)[i] = orig                   # put it back
            g.view(-1)[i] = (up - down) / (2 * h)
        grads.append(g)
    return grads

for name, g in zip(["dL/dW1", "dL/db1", "dL/dv ", "dL/dc "], numeric_grad(loss_D, list(start_weights()))):
    print(name, [round(t, 4) for t in g.view(-1).tolist()])</div>
  <div class="fx" data-lang="text">dL/dW1 [0.5165, 0.5165, -0.3874, -0.3874]
dL/db1 [0.5165, -0.3874]
dL/dv  [0.6456, 0.3228]
dL/dc  [0.6457]</div>
  <p>∂L/∂v₁ comes out as 0.6456, matching our hand nudge (the last digit wobbles because h = 0.001 is not infinitely small). Every number has a sign, telling the parameter which way to move (always opposite to the sign), and a size, telling how much it matters right now. Both entries in the second row of W¹ and the second bias are negative, so hidden neuron 2's weights should go <em>up</em>. That makes sense once you look at the network: neuron 2's output weight v₂ = −0.6 is negative, so making h₂ larger pulls the output down, which is exactly what order D needs.</p>
  <p>This nudging method, called the <strong>numerical gradient</strong>, works for any network, but it is hopelessly slow. Each parameter needs two full forward passes, so our nine parameters took 18 passes. A modest image network has 10 million parameters, which would mean 20 million forward passes for a single training step. Imagine a cricket team that lost by 20 runs and wants to know who was to blame: you could replay the whole match once per player, changing only that player's performance a little each time. It works for eleven players. It is hopeless for millions. What we need is a way to trace blame from the result back through the game just once.</p>

  <h2 id="db-graph"><span class="num">04</span>The Computational Graph and the Chain Rule</h2>
  <p>The network as a whole is one big formula, and writing down its slope with respect to a deep weight directly looks daunting. The way out is to stop looking at the whole formula and break it into small steps. Any forward pass is a chain of tiny operations: multiply, add, ReLU, sigmoid, logarithm. Draw each operation as a box, with arrows carrying values from one box to the next, and you have the <strong>computational graph</strong>. Think of an itemised restaurant bill: from the total you can trace exactly how much each dish, each quantity and each tax line contributed. The graph is an itemised bill for the loss.</p>
  <p>The key fact is that each box, on its own, has a slope that is easy to know, however big the network is. This is called the box's <strong>local slope</strong>: how much its output changes when one of its inputs changes. Our network needs only five kinds of box:</p>
  <table class="tbl">
    <tr><th>Box</th><th>Output</th><th>Local slope</th><th>Value on order D</th></tr>
    <tr><td>Multiply by a weight</td><td>w·a</td><td>w with respect to a; a with respect to w</td><td>v₁h₁: slope to h₁ is 0.8, to v₁ is h₁ = 1.0</td></tr>
    <tr><td>Add</td><td>a + b</td><td>1 with respect to each input</td><td>z = … + c: slope to c is 1</td></tr>
    <tr><td>ReLU</td><td>max(0, z)</td><td>1 if z &gt; 0, else 0</td><td>z₁ = 1.0 and z₂ = 0.5: both 1</td></tr>
    <tr><td>Sigmoid</td><td>p = σ(z)</td><td>p(1 − p)</td><td>0.6457 × 0.3543 = 0.2288</td></tr>
    <tr><td>Binary cross-entropy</td><td>−[y ln p + (1 − y) ln(1 − p)]</td><td>−y/p + (1 − y)/(1 − p)</td><td>1/0.3543 = 2.8221</td></tr>
  </table>
  <p>How do we combine local slopes into the slope of the loss with respect to something far away? The <strong>chain rule</strong> from calculus answers this: if L depends on a only through some middle quantity b, then ∂L/∂a = (∂L/∂b) × (∂b/∂a). In plain words, slopes along a path multiply. If a gear turns 3 times for each turn of the handle, and the wheel turns 2 times for each turn of the gear, the wheel turns 6 times for each turn of the handle. Check it on the last two boxes for order D: ∂L/∂z = ∂L/∂p × ∂p/∂z = 2.8221 × 0.2288 = 0.6457. That is exactly p − y = 0.6457 − 0. The neat "p − y" from the loss section is nothing more than the chain rule applied across the sigmoid and the loss: multiplying −y/p + (1 − y)/(1 − p) by p(1 − p) gives −y(1 − p) + (1 − y)p = p − y.</p>
  <p>One more rule completes the picture. If a value feeds into several boxes, as the input x feeds both hidden neurons, its total slope is the <em>sum</em> of the contributions coming back along each path, because a change in it affects the loss through all of them at once. The figure shows the whole graph for order D: values computed going forward in black, and the gradients we will compute going backward in red.</p>
  <figure class="viz"><svg viewBox="0 0 700 230" width="700">
<defs><marker id="db-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="10" y="80" width="62" height="44" rx="6" class="fb sb"/><text x="41" y="99" text-anchor="middle" font-size="11">x = (1, 1)</text><text x="41" y="115" text-anchor="middle" class="tm" font-size="10">order D</text>
<rect x="110" y="40" width="92" height="40" rx="6" class="fb sb"/><text x="156" y="58" text-anchor="middle" font-size="11">W¹x + b¹</text><text x="156" y="73" text-anchor="middle" class="tm" font-size="10">z₁ = 1.0</text>
<rect x="110" y="124" width="92" height="40" rx="6" class="fb sb"/><text x="156" y="142" text-anchor="middle" font-size="11">W¹x + b¹</text><text x="156" y="157" text-anchor="middle" class="tm" font-size="10">z₂ = 0.5</text>
<rect x="232" y="40" width="70" height="40" rx="6" class="ft st"/><text x="267" y="58" text-anchor="middle" font-size="11">ReLU</text><text x="267" y="73" text-anchor="middle" class="tm" font-size="10">h₁ = 1.0</text>
<rect x="232" y="124" width="70" height="40" rx="6" class="ft st"/><text x="267" y="142" text-anchor="middle" font-size="11">ReLU</text><text x="267" y="157" text-anchor="middle" class="tm" font-size="10">h₂ = 0.5</text>
<rect x="340" y="80" width="100" height="44" rx="6" class="fb sb"/><text x="390" y="99" text-anchor="middle" font-size="11">v·h + c</text><text x="390" y="115" text-anchor="middle" class="tm" font-size="10">z = 0.6</text>
<rect x="470" y="80" width="80" height="44" rx="6" class="ft st"/><text x="510" y="99" text-anchor="middle" font-size="11">sigmoid</text><text x="510" y="115" text-anchor="middle" class="tm" font-size="10">p = 0.6457</text>
<rect x="580" y="80" width="110" height="44" rx="6" class="fv sb"/><text x="635" y="99" text-anchor="middle" font-size="11">CE(p, y = 0)</text><text x="635" y="115" text-anchor="middle" class="tm" font-size="10">L = 1.0375</text>
<g stroke="currentColor"><line x1="72" y1="95" x2="108" y2="62" marker-end="url(#db-a1)"/><line x1="72" y1="110" x2="108" y2="142" marker-end="url(#db-a1)"/>
<line x1="202" y1="60" x2="230" y2="60" marker-end="url(#db-a1)"/><line x1="202" y1="144" x2="230" y2="144" marker-end="url(#db-a1)"/>
<line x1="302" y1="60" x2="338" y2="92" marker-end="url(#db-a1)"/><line x1="302" y1="144" x2="338" y2="112" marker-end="url(#db-a1)"/>
<line x1="440" y1="102" x2="468" y2="102" marker-end="url(#db-a1)"/><line x1="550" y1="102" x2="578" y2="102" marker-end="url(#db-a1)"/></g>
<text x="590" y="145" class="tr" font-size="10.5">∂L/∂p = 2.8221</text>
<text x="465" y="160" class="tr" font-size="10.5">∂L/∂z = 0.6457</text>
<text x="330" y="190" class="tr" font-size="10.5">∂L/∂v = (0.6457, 0.3228), ∂L/∂c = 0.6457</text>
<text x="210" y="28" class="tr" font-size="10.5">∂L/∂h₁ = 0.5165</text>
<text x="210" y="185" class="tr" font-size="10.5">∂L/∂h₂ = −0.3874</text>
<text x="10" y="215" class="tr" font-size="10.5">∂L/∂W¹ = [[0.5165, 0.5165], [−0.3874, −0.3874]], ∂L/∂b¹ = (0.5165, −0.3874)</text>
<text x="10" y="20" class="tm" font-size="10.5">forward → (black values)</text><text x="560" y="20" class="tr" font-size="10.5">← backward (red)</text>
</svg><figcaption>The 2-2-1 network on order D as a computational graph. Black: values computed going forward. Red: gradients computed going backward, each one the gradient to its right times a local slope.</figcaption></figure>
  <p>Read the red labels from right to left. The loss box hands back 2.8221; the sigmoid multiplies it by its local slope 0.2288 to give 0.6457 at z; from there the gradient splits towards the output weights, the bias and the two hidden neurons, and continues left until it reaches W¹. The next section walks through every one of those numbers.</p>

  <h2 id="db-bp"><span class="num">05</span>Backpropagation</h2>
  <p><strong>Backpropagation</strong> (short for "backward propagation of errors") is the chain rule run from the loss back towards the inputs, through the computational graph. Start at the loss with a gradient of 1 (the loss changes one-for-one with itself). At each box, multiply the gradient arriving from the right by that box's local slope, and pass the result to the left: <em>gradient passed on = gradient arriving × local slope</em>. Because each gradient is computed once and then reused by everything to its left, one backward walk produces the gradient for every parameter. That reuse is the whole trick. Going back to the lost cricket match: instead of replaying the match per player, the captain traces blame backwards once, from the result to the innings, to each over, to each ball, with each level splitting what it received according to how much each part contributed.</p>
  <p>Here is every step for order D (x = (1, 1), truth y = 0), right to left. We call the gradient at the output score δ ("delta"), because it is used again and again:</p>
  <table class="tbl">
    <tr><th>Step</th><th>Gradient</th><th>Rule</th><th>Number</th></tr>
    <tr><td>1</td><td>∂L/∂z (output score)</td><td>p − y</td><td>0.6457 − 0 = <strong>0.6457</strong> = δ</td></tr>
    <tr><td>2</td><td>∂L/∂v₁, ∂L/∂v₂</td><td>δ × h (multiply box: slope to w is the input)</td><td>0.6457 × 1.0 = <strong>0.6457</strong>; 0.6457 × 0.5 = <strong>0.3228</strong></td></tr>
    <tr><td>3</td><td>∂L/∂c</td><td>δ × 1 (add box)</td><td><strong>0.6457</strong></td></tr>
    <tr><td>4</td><td>∂L/∂h₁, ∂L/∂h₂</td><td>δ × v (multiply box: slope to the input is w)</td><td>0.6457 × 0.8 = 0.5165; 0.6457 × (−0.6) = −0.3874</td></tr>
    <tr><td>5</td><td>∂L/∂z₁, ∂L/∂z₂</td><td>× ReLU slope (z₁ = 1.0 and z₂ = 0.5 are both positive, so 1)</td><td>0.5165; −0.3874</td></tr>
    <tr><td>6</td><td>∂L/∂W¹ row 1, ∂L/∂b¹₁</td><td>∂L/∂z₁ × x, and × 1</td><td>0.5165 × (1, 1) = <strong>(0.5165, 0.5165)</strong>; <strong>0.5165</strong></td></tr>
    <tr><td>7</td><td>∂L/∂W¹ row 2, ∂L/∂b¹₂</td><td>∂L/∂z₂ × x, and × 1</td><td>−0.3874 × (1, 1) = <strong>(−0.3874, −0.3874)</strong>; <strong>−0.3874</strong></td></tr>
  </table>
  <p>The numbers tell a story. δ = 0.6457 is positive: the output score is too high for an on-time order. Both output weights get positive gradients, so both will shrink, putting less weight on the hidden signals that pushed the score up. Hidden neuron 1, which pushes the output up (v₁ is positive), is told to fire <em>less</em> for D, so its weights get positive gradients. Hidden neuron 2, which pulls the output down (v₂ is negative), is told to fire <em>more</em>, so its weights get negative gradients. These are exactly the nine values the numerical method found by nudging in section 03, but from one backward walk instead of 18 forward passes.</p>
  <p>For a batch of examples, every row of the table becomes one matrix operation, and because the loss is the <em>mean</em> over n examples, each example's δ is divided by n. With X of shape (n, 2), hidden scores Z¹ and outputs H of shape (n, 2), and output scores z and probabilities p of length n, the backward pass is:</p>
  <table class="tbl">
    <tr><th>Gradient</th><th>Formula</th><th>Shape</th></tr>
    <tr><td>output scores</td><td>δ = (p − y)/n</td><td>(n,)</td></tr>
    <tr><td>output weights and bias</td><td>∂v = Hᵀδ, ∂c = Σδ</td><td>(2,), scalar</td></tr>
    <tr><td>hidden outputs</td><td>∂H = δ vᵀ</td><td>(n, 2)</td></tr>
    <tr><td>hidden scores</td><td>∂Z¹ = ∂H ⊙ [Z¹ &gt; 0]</td><td>(n, 2)</td></tr>
    <tr><td>hidden weights and biases</td><td>∂W¹ = (∂Z¹)ᵀX, ∂b¹ = column sums of ∂Z¹</td><td>(2, 2), (2,)</td></tr>
  </table>
  <p>Here ⊙ means multiplying element by element, and [Z¹ &gt; 0] is 1 where the ReLU was switched on and 0 where it was off. The code implements exactly these lines by hand, with no automatic help from PyTorch, and runs them on order D alone and then on all four orders:</p>
  <div class="fx" data-lang="py">def backward(X, y, W1, b1, v, c):
    Z1, H, z, p = forward(X, W1, b1, v, c)
    n = len(y)
    delta = (p - y) / n                     # dL/dz for each order          (n,)
    dv = H.T @ delta                        # dL/dv                         (2,)
    dc = delta.sum()                        # dL/dc                         ()
    dH = delta[:, None] * v[None, :]        # dL/dH                         (n, 2)
    dZ1 = dH * (Z1 &gt; 0).float()             # through ReLU: blocked where it was off
    dW1 = dZ1.T @ X                         # dL/dW1                        (2, 2)
    db1 = dZ1.sum(0)                        # dL/db1                        (2,)
    return dW1, db1, dv, dc

r = lambda t: [round(x, 4) for x in t.reshape(-1).tolist()]
g = backward(X4[3:], y4[3:], *start_weights())          # order D alone
print("order D: dW1", r(g[0]), " db1", r(g[1]), " dv", r(g[2]), " dc", r(g[3]))
g4 = backward(X4, y4, *start_weights())                 # all four orders
print("batch:   dW1", r(g4[0]), " db1", r(g4[1]), " dv", r(g4[2]), " dc", r(g4[3]))</div>
  <div class="fx" data-lang="text">order D: dW1 [0.5165, 0.5165, -0.3874, -0.3874]  db1 [0.5165, -0.3874]  dv [0.6457, 0.3228]  dc [0.6457]
batch:   dW1 [0.0573, 0.0479, -0.0968, -0.0359]  db1 [0.0851, -0.0359]  dv [0.0704, 0.0604]  dc [0.1064]</div>
  <p>Order D reproduces the table exactly. The batch gradient is the average over the four orders, and it is smaller because the orders pull in different directions: B and C are late and want the score to go up, A and D are on time and want it down. One detail is worth checking by hand. For orders A and C, hidden neuron 2's score z₂ is negative (−0.4 and −0.1), so its ReLU was off and step 5 multiplied their blame by 0: those two orders contribute nothing to neuron 2's gradients. Only B and D reach neuron 2, and both have rain = 1, which is why the gradient of neuron 2's rain weight equals that of its bias (both −0.0359).</p>
  <p>How expensive is backpropagation? Each box does a small, fixed amount of work on the way back, roughly as much as on the way forward, so computing <em>all</em> the gradients costs about one extra forward pass (a full training step is typically two to three times the cost of a forward pass), whatever the number of parameters. The price is memory: the backward pass needs the values the forward pass computed (Z¹, H, p in our code), so every intermediate result must be stored until it is used. This is why training a network needs far more memory than just using it to predict.</p>

  <h2 id="db-gd"><span class="num">06</span>Learning with the Gradient</h2>
  <p>We now have what we came for: one number for how wrong the network is, and a direction for every parameter. Learning is simply using them. Each parameter takes a step against its gradient, θ ← θ − lr × ∂L/∂θ, where θ ("theta") stands for any parameter and lr is the learning rate. With lr = 0.5, order D's first output weight becomes 0.8 − 0.5 × 0.6457 = 0.4772. One <strong>training step</strong> is the whole cycle: forward pass, loss, backward pass, update. Training means repeating it. The code takes one step on order D alone, then runs 3,000 steps on all four orders, using nothing but our hand-written backward function:</p>
  <div class="fx" data-lang="py">def step(params, X, y, lr):
    grads = backward(X, y, *params)
    return [t - lr * g for t, g in zip(params, grads)]     # move against the gradient

loss = lambda prm, X, y: F.binary_cross_entropy_with_logits(forward(X, *prm)[2], y).item()

params = list(start_weights())
print("order D loss before:", round(loss(params, X4[3:], y4[3:]), 4))
after = step(params, X4[3:], y4[3:], lr=0.5)
print("v after one step:", r(after[2]), "  order D loss after:", round(loss(after, X4[3:], y4[3:]), 4))

params = list(start_weights())
for t in range(1, 3001):
    params = step(params, X4, y4, lr=0.5)
    if t in (1, 100, 500, 3000):
        print(f"step {t:4d}: mean loss {loss(params, X4, y4):.4f}   P(late) A-D {r(forward(X4, *params)[3])}")</div>
  <div class="fx" data-lang="text">order D loss before: 1.0375
v after one step: [0.4772, -0.7614]   order D loss after: 0.3302
step    1: mean loss 0.6782   P(late) A-D [0.5227, 0.5572, 0.6109, 0.5916]
step  100: mean loss 0.1649   P(late) A-D [0.2932, 0.8827, 0.8859, 0.0646]
step  500: mean loss 0.0115   P(late) A-D [0.0291, 0.9939, 0.9939, 0.004]
step 3000: mean loss 0.0013   P(late) A-D [0.0036, 0.9994, 0.9994, 0.0004]</div>
  <p>A single step on order D cut its loss from 1.0375 to 0.3302. The first output weight moved to 0.4772, as computed by hand, and v₂ moved from −0.6 to −0.7614, so hidden neuron 2 now pulls the output down harder for D. Training on all four orders, the mean loss falls from about ln 2 to 0.0013, and the probabilities end at 0.004, 0.999, 0.999 and 0.0004: the network has found a solution to the XOR problem by itself, starting from weights that rated D the most likely to be late. Nobody told it about "at least one" or "both"; the gradient led it there.</p>
  <p>This loop is all that training a network ever is, whether it has nine parameters or nine billion. What changes in practice is <em>how</em> the step is taken (momentum, Adam, learning-rate schedules), how the weights start, and how to stop the network from memorising noise. Those are the subject of <a class="xref" data-note="dl_training">Training Well</a>. The gradient only says which way is downhill from where you stand; how far to step is a separate question, and section 08 shows a learning rate that is too large breaking this very network.</p>

  <h2 id="db-check"><span class="num">07</span>Gradient Checking and Autograd</h2>
  <p>We derived the backward formulas by hand. A single slip, such as a missing 1/n or a wrong transpose, would still produce numbers, and the network might even still learn a little, so a bug can hide for a long time. How do we prove the gradient code is right? By comparing it with the slow but simple numerical gradient from section 03, which needs no formulas at all and so cannot share our mistakes. This is called a <strong>gradient check</strong>. It compares the two lists of slopes using the <strong>relative error</strong>, the size of their difference divided by the sizes of the two lists, ‖a − b‖ / (‖a‖ + ‖b‖). It is done in float64 (high precision) so that rounding cannot hide anything. It is like checking a long multiplication by estimating it roughly another way: too slow to do every time, but it catches a slip immediately.</p>
  <p>We also compare both with PyTorch's <strong>autograd</strong> (automatic differentiation). When you compute with tensors marked <code>requires_grad=True</code>, PyTorch quietly records the computational graph as the forward pass runs; calling <code>.backward()</code> on the loss then runs backpropagation over that graph and stores each parameter's gradient in its <code>.grad</code>. It is exactly the walk we did by hand, done for us (more in <a class="xref" data-note="dl_pytorch">PyTorch</a>).</p>
  <div class="fx" data-lang="py">torch.set_default_dtype(torch.float64)                   # high precision for checking
X64, y64 = X4.double(), y4.double()
P64 = [t.double() for t in start_weights()]

hand = backward(X64, y64, *P64)
num = numeric_grad(lambda prm: F.binary_cross_entropy_with_logits(forward(X64, *prm)[2], y64), P64, h=1e-6)
leaves = [t.clone().requires_grad_(True) for t in P64]   # let PyTorch track these
F.binary_cross_entropy_with_logits(forward(X64, *leaves)[2], y64).backward()
auto = [t.grad for t in leaves]

flat = lambda gs: torch.cat([g.reshape(-1) for g in gs])
rel = lambda a, b: ((a - b).norm() / (a.norm() + b.norm())).item()
print("hand    :", [round(x, 6) for x in flat(hand).tolist()])
print("autograd:", [round(x, 6) for x in flat(auto).tolist()])
print(f"relative error, hand vs numeric : {rel(flat(hand), flat(num)):.1e}")
print(f"relative error, hand vs autograd: {rel(flat(hand), flat(auto)):.1e}")
buggy = hand[2] * 4                                      # a classic bug: forgot to divide by n
print(f"relative error if 1/n is forgotten in dv: {rel(buggy, num[2]):.2f}")</div>
  <div class="fx" data-lang="text">hand    : [0.057345, 0.047906, -0.096848, -0.035929, 0.085095, -0.035929, 0.07043, 0.060401, 0.106369]
autograd: [0.057345, 0.047906, -0.096848, -0.035929, 0.085095, -0.035929, 0.07043, 0.060401, 0.106369]
relative error, hand vs numeric : 1.9e-10
relative error, hand vs autograd: 0.0e+00
relative error if 1/n is forgotten in dv: 0.60</div>
  <p>All three agree. The hand formulas and the numerical gradient match to a relative error of about 2 × 10⁻¹⁰, and hand versus autograd gives exactly 0, because they performed the same arithmetic in the same order. That proves the backward table of section 05 is right, and that autograd is doing precisely the walk we did. The last line shows what a bug looks like: forgetting to divide by n makes the relative error 0.6, which is unmistakable. A common rule of thumb is that below 10⁻⁷ is correct, above 10⁻² is a bug, and anything in between deserves a closer look.</p>
  <p>Two practical cautions. In float32 with a very small h, rounding errors swamp the slope and correct code looks wrong, so always check in float64. And avoid points exactly at a ReLU's kink (z = 0), where the numerical slope comes out as 0.5 while the analytic one is 0 or 1. Finally, the numerical gradient is the referee, never the player: it is far too slow and too approximate to train with.</p>

  <h2 id="db-vg"><span class="num">08</span>Vanishing and Exploding Gradients</h2>
  <p>Our network has one hidden layer, so the blame passes through only one ReLU and one weight matrix on its way back. Look at what the gradient for W¹ actually was: δ × v × ReLU slope × x, a product of factors, one for each layer it crossed. In a network with 20 layers, the gradient reaching layer 1 is a product of about 20 such factors (a weight and an activation slope for each layer). Multiply 20 numbers that are a bit below 1 and you get almost nothing: 0.25²⁰ is about 10⁻¹². Multiply 20 numbers a bit above 1 and you get something enormous. The first is the <strong>vanishing gradient</strong> problem: the early layers receive almost no learning signal and stay frozen at their starting weights. The second is the <strong>exploding gradient</strong> problem: the weights jump wildly and the loss turns into NaN ("not a number"). Think of a photocopy of a photocopy: after 20 generations the page is nearly blank. Or a microphone held near its own speaker: a small sound feeds back on itself and grows into a screech.</p>
  <p>To see it happen, the code builds networks with 20 hidden layers of 64 neurons each and pushes 128 of the generated delivery orders through them. It then measures the size of the gradient at layer 1 and at layer 20 for three combinations of activation and starting weights, and once more with starting weights that are deliberately too large. (Xavier and He are standard rules for choosing the size of the random starting weights, explained in <a class="xref" data-note="dl_training">Training Well</a>.)</p>
  <div class="fx" data-lang="py">import torch.nn as nn

def deep(act, init, depth=20, width=64):                 # 20 hidden layers of 64 neurons
    layers, d_in = [], 2
    for _ in range(depth):
        lin = nn.Linear(d_in, width); init(lin.weight); nn.init.zeros_(lin.bias)
        layers += [lin, act()]; d_in = width
    return nn.Sequential(*layers, nn.Linear(width, 1))

X, y = make_orders()                                     # the 1,000 generated orders
xb, yb = X[:128], y[:128]
for name, act, init in [("sigmoid+Xavier", nn.Sigmoid, nn.init.xavier_normal_),
                        ("tanh+Xavier", nn.Tanh, nn.init.xavier_normal_),
                        ("relu+He", nn.ReLU, lambda w: nn.init.kaiming_normal_(w, nonlinearity="relu"))]:
    torch.manual_seed(0); net = deep(act, init)
    F.binary_cross_entropy_with_logits(net(xb).squeeze(1), yb).backward()
    print(f"{name:15s} layer 1 grad {net[0].weight.grad.norm():.1e}   layer 20 grad {net[-3].weight.grad.norm():.1e}")

torch.manual_seed(0); net = deep(nn.ReLU, lambda w: nn.init.normal_(w, std=0.5))   # weights too large
F.binary_cross_entropy_with_logits(net(xb).squeeze(1), yb).backward()
total = nn.utils.clip_grad_norm_(net.parameters(), max_norm=1.0)
print(f"ReLU, std=0.5 start: gradient norm {total:.1e}")
print(f"after clip_grad_norm_(max_norm=1.0): {torch.sqrt(sum(p.grad.norm() ** 2 for p in net.parameters())):.3f}")</div>
  <div class="fx" data-lang="text">sigmoid+Xavier  layer 1 grad 1.3e-14   layer 20 grad 3.9e-03
tanh+Xavier     layer 1 grad 3.8e-02   layer 20 grad 1.9e-02
relu+He         layer 1 grad 1.5e-02   layer 20 grad 6.9e-02
ReLU, std=0.5 start: gradient norm 1.6e+08
after clip_grad_norm_(max_norm=1.0): 1.000</div>
  <p>With sigmoid activations the gradient at layer 1 is 1.3 × 10⁻¹⁴, about a hundred billion times smaller than at layer 20 (3.9 × 10⁻³): layer 1 will never learn. Tanh with Xavier starting weights and ReLU with He starting weights keep the two ends within a factor of a few of each other, which is why ReLU and careful initialisation made deep networks trainable. With weights that are too large, the total gradient is 1.6 × 10⁸: a single step would throw every weight to nonsense. The standard emergency brake is <strong>gradient clipping</strong>: if the length (norm) of the whole gradient is above a limit, scale it down to that limit while keeping its direction, g ← g × max / ‖g‖. After <code>clip_grad_norm_</code> the norm is exactly 1.0. Clipping is applied after the backward pass and before the update, and it is routine for RNNs and Transformers. Note that clipping tames exploding gradients but does nothing for vanishing ones.</p>
  <p>There is a third way for blame to stop flowing, and our small network can show it. Train it exactly as in section 06, but with a learning rate of 2.0 instead of 0.5:</p>
  <div class="fx" data-lang="py">params = list(start_weights())
for t in range(3000):
    params = step(params, X4, y4, lr=2.0)                # same training, 4x the learning rate
Z1_end, _, _, p_end = forward(X4, *params)
print("P(late) A-D:", r(p_end), "  loss:", round(loss(params, X4, y4), 4))
print("hidden neuron 2's z for A-D:", r(Z1_end[:, 1]))
print("gradient reaching its weights:", r(backward(X4, y4, *params)[0][1]))</div>
  <div class="fx" data-lang="text">P(late) A-D: [0.6667, 0.6667, 0.6667, 0.0]   loss: 0.4774
hidden neuron 2's z for A-D: [-5.0477, -3.1797, -3.1726, -1.3046]
gradient reaching its weights: [0.0, 0.0]</div>
  <p>The loss is stuck at 0.4774, and orders A, B and C all get the same 0.667. Hidden neuron 2's score is negative for all four orders, so its ReLU outputs 0 for every order, and step 5 of the backward table multiplies its blame by a slope of 0 every time: its weights receive exactly zero gradient and can never change again. One large early step pushed it into the flat region, and it died. This is the <strong>dead ReLU</strong> problem from the previous note, caught in the act. Backprop is still computing the gradients correctly; the fault lies in the training settings. The cures are a smaller learning rate, sensible starting weights, or an activation that never goes completely flat such as Leaky ReLU.</p>
  <table class="tbl">
    <tr><th>Symptom</th><th>Problem</th><th>Usual fixes</th></tr>
    <tr><td>Loss barely moves; early layers' weights hardly change</td><td>Vanishing gradients</td><td>ReLU-family activations (<a class="xref" data-note="dl_neurons">Neurons</a>), He/Xavier initialisation and batch normalisation (<a class="xref" data-note="dl_training">Training Well</a>), residual connections (<a class="xref" data-note="dl_cnns">CNNs</a>), LSTM gates (<a class="xref" data-note="dl_rnns">RNNs</a>)</td></tr>
    <tr><td>Loss suddenly jumps to inf or NaN</td><td>Exploding gradients</td><td>gradient clipping, lower learning rate, proper initialisation</td></tr>
    <tr><td>Loss stuck; some neurons output 0 for every input</td><td>Dead ReLUs</td><td>lower learning rate, Leaky ReLU or GELU, He initialisation</td></tr>
  </table>

  <h2 id="db-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>The most basic mistake is stepping <em>with</em> the gradient instead of against it. The gradient points uphill, towards a larger loss, so adding it makes things worse every step:</p>
  <div class="fx" data-lang="py">params = list(start_weights())
for t in range(1, 4):
    grads = backward(X4, y4, *params)
    params = [w + 0.5 * g for w, g in zip(params, grads)]   # bug: + instead of -
    print(f"step {t}: loss {loss(params, X4, y4):.4f}")</div>
  <div class="fx" data-lang="text">step 1: loss 0.7229
step 2: loss 0.7648
step 3: loss 0.8390</div>
  <p>With the sign flipped, the loss climbs from 0.6976 to 0.7229, 0.7648, 0.8390 and keeps going. A steadily rising training loss from the very first steps is almost always a sign error or a learning rate that is far too large.</p>
  <p>The second mistake is specific to PyTorch: forgetting to reset gradients. Every call to <code>.backward()</code> <em>adds</em> the new gradient to whatever is already stored in <code>.grad</code>. This is deliberate, because it lets you accumulate gradients over several small batches, but it means you must clear them before each step:</p>
  <div class="fx" data-lang="py">w = torch.tensor(0.8, requires_grad=True)
for t in range(3):
    loss_t = (w * 1.0 - 0.0) ** 2          # same loss each time: gradient 2w = 1.6
    loss_t.backward()
    print("w.grad after backward", t + 1, "=", round(w.grad.item(), 2))
w.grad.zero_()                             # what optimizer.zero_grad() does
print("after zero_():", w.grad.item())</div>
  <div class="fx" data-lang="text">w.grad after backward 1 = 1.6
w.grad after backward 2 = 3.2
w.grad after backward 3 = 4.8
after zero_(): 0.0</div>
  <p>The same loss, whose true gradient is 1.6, produces 1.6, then 3.2, then 4.8 because each backward pass piles on top of the last. In a training loop this makes every step act on the sum of all previous gradients, and training goes haywire. That is why every PyTorch loop calls <code>optimizer.zero_grad()</code> (which runs <code>zero_()</code> on every parameter's gradient) once per step.</p>
  <p>The third family of mistakes is giving a loss the wrong kind of input. <code>nn.BCEWithLogitsLoss</code> and <code>nn.CrossEntropyLoss</code> expect raw logits and apply the sigmoid or softmax themselves, so a model that already applies one squashes twice (shown in <a class="xref" data-note="dl_neurons">Neurons, Layers &amp; Activations</a>). <code>CrossEntropyLoss</code> also expects the true class as an integer index (0, 1, 2), not as a one-hot vector, while <code>BCEWithLogitsLoss</code> wants float labels of the same shape as the logits. Finally, when a network will not learn, do not blame backpropagation: it computes exact gradients. Look instead at the learning rate, the activations, the starting weights or the loss.</p>

  <h2 id="db-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <ul>
    <li>Orders A (0, 0) on time, B (0, 1) late, C (1, 0) late, D (1, 1) on time; inputs (far, rain).</li>
    <li>2-2-1 network: W¹ = [[0.5, 0.4], [0.3, 0.6]], b¹ = (0.1, −0.4), ReLU, v = (0.8, −0.6), c = 0.1, sigmoid output.</li>
    <li>Untrained P(late) = 0.545, 0.594, 0.641, 0.646; mean CE 0.698 ≈ ln 2.</li>
  </ul>
  <h3>Definitions</h3>
  <ul>
    <li><b>Loss</b>: one number for how wrong the predictions are. <b>Parameters</b> θ: all weights and biases.</li>
    <li><b>Gradient</b>: ∂L/∂θ for every parameter; points uphill. <b>Gradient descent</b>: θ ← θ − lr·∂L/∂θ.</li>
    <li><b>Computational graph</b>: the forward pass as boxes of simple operations. <b>Local slope</b>: one box's derivative.</li>
    <li><b>Chain rule</b>: slopes multiply along a path; contributions add where paths meet.</li>
    <li><b>Backpropagation</b>: chain rule from the loss backwards, reusing every intermediate gradient; cost ≈ one extra forward pass.</li>
    <li><b>Autograd</b>: the library records the graph during the forward pass and runs backprop on <code>.backward()</code>.</li>
    <li><b>Gradient check</b>: compare analytic and numerical gradients (float64, h ≈ 10⁻⁶); &lt; 10⁻⁷ fine, &gt; 10⁻² bug.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Note</th></tr>
    <tr><td>MSE</td><td>(1/n) Σ (ŷ − y)²</td><td>numbers</td></tr>
    <tr><td>Binary cross-entropy</td><td>−(1/n) Σ [y ln p + (1 − y) ln(1 − p)]</td><td>yes/no; untrained ≈ ln 2</td></tr>
    <tr><td>Categorical cross-entropy</td><td>−(1/n) Σ ln p_true, p = softmax(z)</td><td>untrained ≈ ln C</td></tr>
    <tr><td>Sigmoid/softmax + CE</td><td>∂L/∂z = p − y</td><td>MSE instead: 2(p − y)p(1 − p)</td></tr>
    <tr><td>Local slopes</td><td>×w → w; + → 1; ReLU → 0/1; σ → p(1 − p)</td><td>multiply along the path</td></tr>
    <tr><td>Backprop, 2-layer batch</td><td>δ = (p − y)/n; ∂v = Hᵀδ; ∂c = Σδ; ∂H = δvᵀ; ∂Z¹ = ∂H ⊙ [Z¹ &gt; 0]; ∂W¹ = ∂Z¹ᵀX; ∂b¹ = Σ∂Z¹</td><td>⊙ = element-wise</td></tr>
    <tr><td>Numerical gradient</td><td>(L(θ + h) − L(θ − h)) / 2h</td><td>2 passes per parameter</td></tr>
    <tr><td>Clip by norm</td><td>g ← g · max/‖g‖ if ‖g‖ &gt; max</td><td>after backward, before step</td></tr>
  </table>
  <h3>Key numbers (order D)</h3>
  <ul>
    <li>p = 0.6457, CE = 1.0375; ∂L/∂p = 2.8221, σ′ = 0.2288, δ = 0.6457.</li>
    <li>∂v = (0.6457, 0.3228); ∂h = (0.5165, −0.3874); ∂W¹ = [[0.5165, 0.5165], [−0.3874, −0.3874]].</li>
    <li>One step lr 0.5: loss 1.0375 → 0.3302. 3,000 steps on A–D: loss 0.0013.</li>
    <li>20 sigmoid layers: layer-1 gradient 1.3e-14; too-large init: norm 1.6e8; lr 2.0: dead ReLU, loss stuck at 0.4774.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">loss_fn = nn.BCEWithLogitsLoss()          # yes/no, takes logits; nn.CrossEntropyLoss for C classes
for xb, yb in loader:
    optimizer.zero_grad()                  # clear old gradients
    loss = loss_fn(model(xb).squeeze(1), yb)
    loss.backward()                        # backprop: fills p.grad for every parameter
    nn.utils.clip_grad_norm_(model.parameters(), 1.0)   # optional
    optimizer.step()                       # p -= lr * p.grad (plain SGD)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Step against the gradient (minus sign); rising loss from step 1 = sign error or huge lr.</li>
    <li><code>.backward()</code> accumulates; call <code>zero_grad()</code> every step.</li>
    <li>Pass logits to the WithLogits / CrossEntropy losses; class indices, not one-hot, to CrossEntropyLoss.</li>
    <li>Don't use MSE on sigmoid outputs for classification: weak signal when confidently wrong.</li>
    <li>Gradient-check in float64, away from ReLU kinks; never train with numerical gradients.</li>
    <li>Clipping fixes exploding gradients, not vanishing ones.</li>
  </ul>

  <h2 id="db-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a loss function and why does a network need one?</summary><div class="qa-body">A loss function turns the network's predictions and the true labels into a single number that is 0 when everything is right and larger the worse it gets. Training needs it because gradient descent can only minimise one number: backprop computes the slope of that number with respect to every parameter. The choice of loss also defines what "better" means for the task.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you use MSE and when cross-entropy?</summary><div class="qa-body">MSE for predicting numbers (regression), where squared errors punish big misses. Cross-entropy for classification, binary or multi-class, where the output is a probability. Cross-entropy gives a strong gradient when the model is confidently wrong and corresponds to maximum likelihood for categorical outcomes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is MSE a poor loss for a sigmoid classifier?</summary><div class="qa-body">With MSE, the gradient at the logit is 2(p − y)·p(1 − p), which includes the sigmoid's slope; when p is near 0 or 1 that slope is tiny, so a confidently wrong prediction gets almost no correction (p = 0.99, y = 0 gives 0.0196). With cross-entropy the sigmoid's slope cancels and the gradient is simply p − y = 0.99. MSE with a sigmoid is also non-convex in the weights.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the gradient of binary cross-entropy with respect to the logit.</summary><div class="qa-body">L = −[y ln p + (1 − y) ln(1 − p)] with p = σ(z). Then ∂L/∂p = −y/p + (1 − y)/(1 − p) and ∂p/∂z = p(1 − p). Multiplying gives −y(1 − p) + (1 − y)p = p − y. The same result, p − y with a one-hot y, holds for softmax with categorical cross-entropy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What loss should an untrained 10-class classifier show, and why is that useful?</summary><div class="qa-body">About ln 10 ≈ 2.30, because an untrained network spreads probability roughly evenly, giving the true class about 1/10, and −ln(1/10) = ln 10. If the first loss is far from this, something is wrong: bad initialisation, labels in the wrong format, or softmax applied twice.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a gradient, intuitively?</summary><div class="qa-body">For each parameter, it is the slope of the loss: how much the loss would change per unit change of that parameter, with everything else fixed. The sign says which way increases the loss and the size says how sensitive the loss is to that parameter right now. Gradient descent moves every parameter a small step opposite to its slope.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is backpropagation?</summary><div class="qa-body">An algorithm that computes the gradient of the loss with respect to every parameter by applying the chain rule from the loss backwards through the computational graph. Each operation multiplies the incoming gradient by its local derivative and passes the result on, and gradients from several paths are added. Intermediate results are reused, so all gradients come from one backward pass.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is backpropagation so much faster than computing gradients numerically?</summary><div class="qa-body">Numerical gradients need two forward passes per parameter, so a model with 10 million parameters needs 20 million passes per step. Backprop gets all gradients for about the cost of one extra forward pass, because it shares every intermediate gradient (reverse-mode differentiation). It is also exact rather than approximate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the memory cost of backpropagation, and how can you reduce it?</summary><div class="qa-body">The backward pass needs the activations computed in the forward pass, so they must all be kept in memory until it runs; memory grows with depth and batch size. That is why training uses far more memory than inference. It can be reduced with smaller batches, mixed precision, or gradient checkpointing, which stores only some activations and recomputes the rest during the backward pass.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does gradient flow through a ReLU, and what happens at a dead ReLU?</summary><div class="qa-body">The ReLU passes the incoming gradient unchanged where its input was positive and blocks it (multiplies by 0) where its input was negative. A dead ReLU has a negative input for every example, so it blocks all gradient and its incoming weights never update again. Our 2-2-1 network trained with lr 2.0 produced one and its loss froze at 0.4774.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is gradient checking and how do you do it?</summary><div class="qa-body">It verifies a hand-written backward pass by comparing it with central differences, (L(θ + h) − L(θ − h))/2h for each parameter. Use float64, h around 10⁻⁶, a small batch, randomness such as dropout turned off, and avoid ReLU kinks. A relative error below about 10⁻⁷ means correct; above 10⁻² means a bug.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is autograd in PyTorch?</summary><div class="qa-body">PyTorch's automatic differentiation engine. When tensors have <code>requires_grad=True</code>, it records each operation into a graph during the forward pass; <code>loss.backward()</code> then runs reverse-mode differentiation (backprop) over that graph and accumulates the gradients in each tensor's <code>.grad</code>. The graph is rebuilt on every forward pass, which is why Python control flow works naturally.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must you call <code>optimizer.zero_grad()</code> in every training step?</summary><div class="qa-body">Because <code>.backward()</code> adds new gradients to those already stored in <code>.grad</code> instead of replacing them. Without clearing, each step uses the sum of all previous gradients and training diverges. The accumulation is useful on purpose when you want an effective batch larger than fits in memory: run backward on several small batches, then step once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What causes vanishing gradients?</summary><div class="qa-body">Backprop multiplies one factor per layer (a weight and an activation slope). If those factors are mostly below 1, as with sigmoid (slope at most 0.25) or small weights, the product shrinks exponentially with depth, so early layers barely learn. In our 20-layer sigmoid network the gradient at layer 1 was 1.3 × 10⁻¹⁴. Fixes: ReLU-family activations, He/Xavier initialisation, batch normalisation, residual connections, and in RNNs, LSTM or GRU gates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What causes exploding gradients and how do you handle them?</summary><div class="qa-body">The same product of per-layer factors growing exponentially when the factors are above 1, typically from large weights or long recurrent chains; the loss jumps to inf or NaN. Handle it with gradient clipping by norm (rescale g to max/‖g‖ when ‖g‖ exceeds max), a lower learning rate and proper initialisation. Clipping goes between <code>backward()</code> and <code>optimizer.step()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your training loss becomes NaN after a few hundred steps. What do you check?</summary><div class="qa-body">Log the gradient norm to look for explosion and add clipping; lower the learning rate; check for log(0) or division by zero in a hand-written loss (use the WithLogits losses); check the input data for NaN or infinite values; and with half precision, check for overflow and use loss scaling. Also confirm initialisation is sensible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Backprop gives exact gradients. Why can a network still fail to learn?</summary><div class="qa-body">The gradient is only the local downhill direction. A learning rate that is too large overshoots or kills ReLUs, one that is too small barely moves, bad initialisation can make gradients vanish or explode, a mismatched loss or double softmax can weaken the signal, and a model without non-linearities cannot represent the answer at all. These are fixed with optimizers, schedules, initialisation, normalisation and architecture choices, not by changing backprop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do residual (skip) connections help gradients?</summary><div class="qa-body">A residual block computes x + f(x), so its local slope with respect to x is 1 plus the slope of f. During backprop the gradient can therefore flow straight through the identity path without being multiplied by many small factors, which keeps early layers learning even in networks with hundreds of layers. This is the key idea behind ResNets and every Transformer.</div></details>
</main>
`
});
