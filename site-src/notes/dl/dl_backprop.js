// notes/dl/dl_backprop.js — Loss & Backpropagation
Object.assign(TOPIC_CONTENT, {
  "dl_backprop": `<main>
  <h1>Loss &amp; Backpropagation</h1>
  <div class="where"><span>Deep Learning</span><span>Neural Networks</span><span>Loss &amp; Backpropagation</span></div>
  <p class="lead">A network with random starting weights makes bad guesses. To improve, it needs two things: one number that says how wrong it is (the <strong>loss</strong>), and, for every weight, which way to move to reduce that number (the <strong>gradient</strong>). <strong>Backpropagation</strong> computes all those gradients in one backward sweep. This note does it completely by hand on a 2-2-1 network for the late-delivery orders, every number shown, then checks the hand numbers against a numeric gradient and against PyTorch's autograd, and ends with what goes wrong in deep networks (vanishing and exploding gradients). All outputs are from real runs (PyTorch 2.14, CPU, single thread).</p>

  <h2 id="db-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 150" width="680">
<defs><marker id="db-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="41" text-anchor="middle" font-size="12">NN: the map</text><text x="70" y="58" text-anchor="middle" class="tm" font-size="10">the need chain</text>
<line x1="130" y1="45" x2="148" y2="45" stroke="currentColor" marker-end="url(#db-a0)"/>
<rect x="150" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="210" y="41" text-anchor="middle" font-size="12">Neurons</text><text x="210" y="58" text-anchor="middle" class="tm" font-size="10">build the network</text>
<line x1="270" y1="45" x2="288" y2="45" stroke="currentColor" marker-end="url(#db-a0)"/>
<rect x="290" y="20" width="120" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="350" y="41" text-anchor="middle" font-size="12" font-weight="700">Loss &amp; Backprop</text><text x="350" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="410" y1="45" x2="428" y2="45" stroke="currentColor" marker-end="url(#db-a0)"/>
<rect x="430" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="485" y="41" text-anchor="middle" font-size="12">Training Well</text><text x="485" y="58" text-anchor="middle" class="tm" font-size="10">use the gradient well</text>
<line x1="540" y1="45" x2="558" y2="45" stroke="currentColor" marker-end="url(#db-a0)"/>
<rect x="560" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="615" y="41" text-anchor="middle" font-size="12">PyTorch</text><text x="615" y="58" text-anchor="middle" class="tm" font-size="10">autograd does this</text>
<text x="340" y="110" text-anchor="middle" class="tm" font-size="10.5">same four orders A, B, C, D (late = far XOR rain) and the same 2-2-1 network shape</text>
<text x="340" y="126" text-anchor="middle" class="tm" font-size="10.5">as the hand-built XOR net, now with starting weights it must correct itself</text>
</svg><figcaption>The Neural Networks track. The previous note built the network; this one makes it learn.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dl_neurons">Neurons, Layers &amp; Activations</a></b><span>We built a 2-2-1 network and solved XOR with weights chosen by hand. On 1,000 real orders those hand weights reach only 72.5%: the network must find its own weights from data.</span></li>
    <li><b>This note adds: how wrong, and who is to blame</b><span>Loss functions (MSE, cross-entropy) measure wrongness as one number. The gradient gives each weight its share of the blame. The computational graph and backpropagation compute every gradient in one backward pass; gradient checking verifies it; vanishing/exploding gradients are what breaks it in deep networks. Maths background: <a class="xref" data-note="m_calculus">Calculus</a> (chain rule) and <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dl_training">Training Well</a></b><span>Backprop says which way each weight should move. How far, with what memory of past steps, from which starting values, and how to stop the network from memorising are the job of optimizers, initialisation and regularisation.</span></li>
  </ol>

  <h2 id="db-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Running example: orders A (far 0, rain 0, on time), B (0, 1, late), C (1, 0, late), D (1, 1, on time), and a 2-2-1 network (2 inputs, 2 ReLU hidden neurons, 1 sigmoid output) with fixed starting weights.</p>
  <ol class="story">
    <li><b>Starting network</b><span>Q: what does an untrained network say? → P(late) = 0.545, 0.594, 0.641, 0.646 for A–D: it rates D, an on-time order, as the most likely to be late. But "bad" is not a number we can minimise…</span></li>
    <li><b>Loss (MSE, cross-entropy)</b><span>Q: how wrong is it, as one number? → Cross-entropy on D: −ln(1 − 0.6457) = 1.0375; mean over A–D 0.6976 ≈ ln 2, i.e. "knows nothing". But the loss does not say which of the 9 weights to change…</span></li>
    <li><b>Gradient (numeric)</b><span>Q: which way should each weight move? → Nudge one weight, re-measure the loss: ∂L/∂v₁ ≈ 0.6457 on order D. Works, but costs two forward passes per weight; a million weights = two million passes per step…</span></li>
    <li><b>Computational graph</b><span>Q: can the work be shared? → Break the forward pass into small boxes (multiply, add, ReLU, sigmoid, log), each with a simple local slope. Now how do we combine them?</span></li>
    <li><b>Backpropagation</b><span>Q: how do we get every gradient at once? → Walk the graph backwards multiplying local slopes (chain rule), reusing each result: on D, δ = p − y = 0.6457, ∂L/∂v = (0.6457, 0.3228), ∂L/∂W¹ rows (0.5165, 0.5165), (−0.3874, −0.3874). One step: D's loss 1.0375 → 0.3302. But is our hand-derived formula right?</span></li>
    <li><b>Gradient checking</b><span>Q: can I trust the gradient? → Hand formulas, numeric differences and autograd agree to about 1e-10 (float64). But in deep networks, the chain of multiplied slopes itself causes trouble…</span></li>
    <li><b>Vanishing &amp; exploding gradients</b><span>Q: what happens to blame after 20 layers? → Sigmoid: layer 1's gradient is 1e-14, about 10¹¹ times smaller than layer 20's (frozen); too-large weights: gradient norm ~1e8 (one step ruins everything). Fixes: ReLU, good init, normalisation, clipping. Next: using the gradient well → <a class="xref" data-note="dl_training">Training Well</a>.</span></li>
  </ol>

  <h2 id="db-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Loss &amp; Backpropagation</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Loss</div>
        <ul>
          <li><b>MSE</b> mean (ŷ − y)²: numbers (minutes late)</li>
          <li><b>Binary CE</b> −[y ln p + (1−y) ln(1−p)]: yes/no</li>
          <li><b>CE</b> −ln p(true class): one of C</li>
          <li>D: p = 0.6457, y = 0 → CE 1.0375, MSE 0.417</li>
          <li>Untrained check: loss ≈ ln C (ln 2 = 0.693)</li>
          <li>⚠ PyTorch losses want logits, not probabilities</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradient</div>
        <ul>
          <li>∂L/∂w: how fast the loss changes as w moves</li>
          <li>Sign → direction; size → strength</li>
          <li>Numeric: (L(w+h) − L(w−h))/2h; 2 passes per weight</li>
          <li>💡 each weight's share of the blame</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Graph &amp; chain rule</div>
        <ul>
          <li>Forward = chain of simple boxes</li>
          <li>Local slopes: ×w → w; +b → 1; ReLU → 0/1; σ → p(1−p)</li>
          <li>Chain rule: multiply slopes along the path</li>
          <li>Sigmoid + CE: ∂L/∂z = p − y</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Backprop</div>
        <ul>
          <li>grad in = grad out × local slope</li>
          <li>δ = p − y; ∂L/∂v = δh; ∂L/∂h = δv</li>
          <li>∂L/∂z¹ = ∂L/∂h ⊙ ReLU′; ∂L/∂W¹ = (∂L/∂z¹)xᵀ</li>
          <li>Cost ≈ 1 extra forward pass; memory: store activations</li>
          <li>D step lr 0.5: loss 1.0375 → 0.3302</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradient check</div>
        <ul>
          <li>Central difference, float64, h ≈ 1e-6</li>
          <li>Relative error &lt; 1e-7 OK; &gt; 1e-2 bug</li>
          <li>Hand = numeric = autograd</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Vanishing / exploding</div>
        <ul>
          <li>Gradient at layer 1 = product of ~20 factors</li>
          <li>Sigmoid: 1e-14 at layer 1; ReLU + He: 0.015</li>
          <li>Too-big init: norm 1e8 → clip_grad_norm_</li>
          <li>Dead ReLU: z &lt; 0 for all inputs → zero blame forever</li>
          <li>💡 photocopy of a photocopy</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="db-start"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Starting Network</span><span class="rm-sub">Random-ish weights, bad guesses</span></div></div>
      <div class="rm-item rm-done" data-target="db-loss"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Loss Functions</span><span class="rm-sub">MSE and cross-entropy</span></div></div>
      <div class="rm-item rm-done" data-target="db-grad"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Gradient</span><span class="rm-sub">Blame by nudging</span></div></div>
      <div class="rm-item rm-done" data-target="db-graph"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Computational Graph</span><span class="rm-sub">Boxes with local slopes</span></div></div>
      <div class="rm-item rm-done" data-target="db-bp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Backprop by Hand</span><span class="rm-sub">Every number on a 2-2-1 net</span></div></div>
      <div class="rm-item rm-done" data-target="db-check"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Checking Gradients</span><span class="rm-sub">Hand vs numeric vs autograd</span></div></div>
      <div class="rm-item rm-done" data-target="db-vg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Vanishing &amp; Exploding</span><span class="rm-sub">When blame dies or blows up</span></div></div>
      <div class="rm-item rm-done" data-target="db-connect"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table, one picture</span></div></div>
      <div class="rm-item rm-done" data-target="db-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="db-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="db-start"><span class="num">01</span>The Starting Network</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In the previous note we set the XOR weights by hand. A real network starts from arbitrary weights and has to correct itself. What does such a network say about our four orders before any learning?</p>
  </div>
  <p>Same shape as the hand-built XOR network: 2 inputs (far, rain), 2 hidden ReLU neurons, 1 output neuron with a sigmoid giving P(late). But now the weights are arbitrary starting values (in practice they are random; here they are fixed round numbers so you can follow every step by hand):</p>
  <table class="tbl"><caption>Starting weights (9 parameters)</caption>
    <tr><th>Part</th><th>Weights</th><th>Bias</th><th>Meaning</th></tr>
    <tr><td>Hidden neuron 1</td><td>W¹ row 1 = (0.5, 0.4)</td><td>b¹₁ = 0.1</td><td>z₁ = 0.5·far + 0.4·rain + 0.1</td></tr>
    <tr><td>Hidden neuron 2</td><td>W¹ row 2 = (0.3, 0.6)</td><td>b¹₂ = −0.4</td><td>z₂ = 0.3·far + 0.6·rain − 0.4</td></tr>
    <tr><td>Output neuron</td><td>v = (0.8, −0.6)</td><td>c = 0.1</td><td>z = 0.8·h₁ − 0.6·h₂ + 0.1; p = σ(z)</td></tr>
  </table>
  <p>Forward pass for order D (far 1, rain 1) by hand: z₁ = 0.5 + 0.4 + 0.1 = <strong>1.0</strong>, h₁ = ReLU(1.0) = 1.0. z₂ = 0.3 + 0.6 − 0.4 = <strong>0.5</strong>, h₂ = 0.5. Output z = 0.8·1.0 − 0.6·0.5 + 0.1 = 0.8 − 0.3 + 0.1 = <strong>0.6</strong>. p = σ(0.6) = 1/(1 + e⁻⁰·⁶) = 1/1.5488 = <strong>0.6457</strong>. The network says D is 64.6% likely to be late. D was on time.</p>
<div class="fx" data-lang="py">import torch, torch.nn.functional as F
X4 = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])   # orders A, B, C, D
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
    print(f"{name}: z1,z2={[round(t, 2) for t in Z1[i].tolist()]} h={[round(t, 2) for t in H[i].tolist()]}"
          f" z={z[i].item():.2f} P(late)={p[i].item():.4f} truth={int(y4[i])}")</div>
  <div class="fx" data-lang="text">A: z1,z2=[0.1, -0.4] h=[0.1, 0.0] z=0.18 P(late)=0.5449 truth=0
B: z1,z2=[0.5, 0.2] h=[0.5, 0.2] z=0.38 P(late)=0.5939 truth=1
C: z1,z2=[0.6, -0.1] h=[0.6, 0.0] z=0.58 P(late)=0.6411 truth=1
D: z1,z2=[1.0, 0.5] h=[1.0, 0.5] z=0.60 P(late)=0.6457 truth=0</div>
  <p>Order D matches the hand calculation. Look at the column of probabilities: 0.545, 0.594, 0.641, 0.646. The network rates every order as "probably late", and rates D, an on-time order, the highest of all. It is useless as it stands. Notice also order A: z₂ = −0.4, so ReLU switches hidden neuron 2 off for A (h₂ = 0).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A new dispatcher on day one, guessing from gut feeling. The guesses are not random noise; they follow a rule (the weights). It is just the wrong rule. Training will correct the rule, not memorise the four answers.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>parameters</strong> θ of a network are all its weights and biases (here 9). A <strong>prediction</strong> ŷ (here p) is the output of the forward pass for given parameters. Training means changing θ so predictions match the labels.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Reading 0.6457 as "the network is fairly unsure". Probabilities from an untrained network mean nothing. Only after training (and ideally calibration, see <a class="xref" data-note="ml_classification">Logistic Regression</a>) can P(late) be read as a probability.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the loss.</b> We can see the network is bad, but "bad" is a feeling. To improve it automatically we need one number that says exactly how wrong it is, which goes down as it gets better.</div>

  <h2 id="db-loss"><span class="num">02</span>Loss Functions: How Wrong, as One Number</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The network said 0.6457 for an order whose truth is 0. How do we turn "prediction vs truth" into one number that is 0 when perfect and bigger when worse, for four orders at once?</p>
  </div>
  <p>A <strong>loss function</strong> takes the prediction and the truth and returns one number. Averaged over the examples it becomes the <strong>cost</strong> (people often say "loss" for both). The gradient (next section) is the slope of this number, so the choice matters: it decides what "better" means. The general theory is in <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>; here are the three that cover nearly all networks.</p>
  <div class="cards">
    <div><b>A number</b><p>Minutes late, delivery time, price. <strong>MSE</strong>: mean of (ŷ − y)². Big misses cost the most.</p><small>nn.MSELoss (outliers: nn.L1Loss, nn.HuberLoss)</small></div>
    <div><b>Yes/no</b><p>Late or not. <strong>Binary cross-entropy</strong>: −[y ln p + (1 − y) ln(1 − p)].</p><small>nn.BCEWithLogitsLoss (takes the logit z)</small></div>
    <div><b>One of C classes</b><p>On time / a bit late / very late. <strong>Cross-entropy</strong>: −ln(probability given to the true class).</p><small>nn.CrossEntropyLoss (takes logits + class index)</small></div>
  </div>
  <h3>By hand on order D</h3>
  <p>Truth y = 0, prediction p = 0.6457.</p>
  <ul>
    <li><strong>Binary cross-entropy</strong>: y = 0 so only the second term remains: −ln(1 − 0.6457) = −ln(0.3543) = <strong>1.0375</strong>. If the truth were 1 it would be −ln(0.6457) = 0.4375.</li>
    <li><strong>MSE</strong> (treating p as a number): (0.6457 − 0)² = <strong>0.4169</strong>.</li>
  </ul>
  <p>Over all four orders, cross-entropy averages −ln(1 − 0.545), −ln(0.594), −ln(0.641), −ln(1 − 0.646): 0.788 + 0.521 + 0.445 + 1.0375, divided by 4 ≈ <strong>0.698</strong>. Compare with ln 2 = 0.693: the loss of a model that says 50/50 for everything. Our network is exactly as good as knowing nothing, which is the right starting point.</p>
<div class="fx" data-lang="py">Lper = F.binary_cross_entropy(p, y4, reduction="none")
print("per-order CE:", [round(t, 4) for t in Lper.tolist()], " mean:", round(Lper.mean().item(), 4))
print("same from logits:", round(F.binary_cross_entropy_with_logits(z, y4).item(), 4), " ln 2 =", round(0.6931471805599453, 4))
print("MSE on probabilities:", round(F.mse_loss(p, y4).item(), 4), "  MSE for D alone:", round(((p[3] - 0) ** 2).item(), 4))
for q in [0.9, 0.5, 0.1, 0.01]:
    print(f"P(true answer)={q}: CE = {-torch.log(torch.tensor(q)).item():.3f}")
logits3 = torch.tensor([[2.0, 1.0, 0.1]])        # on time, a bit late, very late
print("3-class CE, truth 'on time':", round(F.cross_entropy(logits3, torch.tensor([0])).item(), 4),
      " truth 'very late':", round(F.cross_entropy(logits3, torch.tensor([2])).item(), 4))</div>
  <div class="fx" data-lang="text">per-order CE: [0.7872, 0.5211, 0.4446, 1.0375]  mean: 0.6976
same from logits: 0.6976  ln 2 = 0.6931
MSE on probabilities: 0.2519   MSE for D alone: 0.4169
P(true answer)=0.9: CE = 0.105
P(true answer)=0.5: CE = 0.693
P(true answer)=0.1: CE = 2.303
P(true answer)=0.01: CE = 4.605
3-class CE, truth 'on time': 0.417  truth 'very late': 2.317</div>
  <p>The per-order values match the hand numbers; D is the worst. <code>binary_cross_entropy_with_logits</code> takes the raw z and gives the same 0.6976 more safely (it never computes log(0)). The four "P(true answer)" lines are the whole character of cross-entropy: 90% on the truth costs 0.105, 1% costs 4.6, about 44 times more. For three classes (softmax from <a class="xref" data-note="dl_neurons">Neurons</a>: 0.659, 0.242, 0.099), the loss is −ln 0.659 = 0.417 if the truth is "on time" and −ln 0.099 = 2.317 if "very late".</p>
  <h3>Why cross-entropy and not MSE for yes/no?</h3>
  <p>Both losses go down as p moves toward the truth. The difference is the <em>slope</em> they hand back to the network, because that slope is the learning signal. Derive it for cross-entropy through the sigmoid (chain rule, see <a class="xref" data-note="m_calculus">Calculus</a>): ∂L/∂p = −y/p + (1 − y)/(1 − p), and ∂p/∂z = p(1 − p). Multiply: ∂L/∂z = −y(1 − p) + (1 − y)p = <strong>p − y</strong>. For MSE: ∂L/∂z = 2(p − y)·p(1 − p), the same error multiplied by the sigmoid's slope, which is tiny when p is near 0 or 1.</p>
  <table class="tbl"><caption>Learning signal ∂L/∂z (truth y = 0)</caption>
    <tr><th>Prediction p</th><th>Cross-entropy: p − y</th><th>MSE: 2(p − y)p(1 − p)</th></tr>
    <tr><td>0.6457 (our D)</td><td>0.6457</td><td>2 × 0.6457 × 0.6457 × 0.3543 = 0.2954</td></tr>
    <tr><td>0.99 (confidently wrong)</td><td>0.99</td><td>2 × 0.99 × 0.99 × 0.01 = 0.0196</td></tr>
  </table>
  <p>When the network is confidently wrong, cross-entropy pushes hard (0.99) while MSE barely whispers (0.0196), so an MSE-trained classifier can stay stuck being confidently wrong. Cross-entropy is also what you get from maximum likelihood for a yes/no outcome (derived in <a class="xref" data-note="ml_classification">Logistic Regression</a>).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Cross-entropy is negative marking in an entrance exam. A confident wrong answer costs much more than "not sure". So the model learns to be sure only when it has reason to be.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>MSE</strong> = (1/n)Σ(ŷᵢ − yᵢ)². <strong>Binary cross-entropy</strong> = −(1/n)Σ[yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)]. <strong>Categorical cross-entropy</strong> = −(1/n)Σ ln pᵢ,true. With sigmoid or softmax in front, the gradient of cross-entropy with respect to the logits is p − y (prediction minus one-hot truth).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>nn.CrossEntropyLoss</code> and <code>nn.BCEWithLogitsLoss</code> apply log-softmax / log-sigmoid themselves: give them raw logits. Adding softmax or sigmoid in the model first squashes twice and training goes badly. <code>CrossEntropyLoss</code> wants integer class labels (0, 1, 2), not one-hot vectors; <code>BCEWithLogitsLoss</code> wants float labels of the same shape as the logits.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the gradient.</b> The loss is 0.6976 and order D contributes the most. But there are 9 weights. Which ones should change, in which direction, and how strongly?</div>

  <h2 id="db-grad"><span class="num">03</span>The Gradient: Blame by Nudging</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know how wrong the network is. For each of its 9 weights: if we move this weight a little, does the loss go up or down, and by how much?</p>
  </div>
  <p>The most direct answer: try it. Take one weight, say v₁ (from hidden neuron 1 to the output, now 0.8). Nudge it up by a tiny h = 0.001 and down by 0.001, recompute the loss each time, and divide the change by the total nudge 0.002. That ratio is the <strong>slope of the loss along v₁</strong>, written ∂L/∂v₁ (the "partial derivative": how L changes when only v₁ moves; background in <a class="xref" data-note="m_calculus">Calculus</a>).</p>
  <p>By hand on order D: with v₁ = 0.801, z = 0.801 − 0.3 + 0.1 = 0.601, p = 0.64589, L = −ln(0.35411) = 1.03813. With v₁ = 0.799, z = 0.599, p = 0.64543, L = 1.03684. Slope ≈ (1.03813 − 1.03684)/0.002 ≈ <strong>0.646</strong>. Positive: raising v₁ raises the loss, so v₁ should go <em>down</em>. Doing this for every weight gives the <strong>gradient</strong>, the list of all 9 slopes:</p>
<div class="fx" data-lang="py">def loss_D(params):
    W1, b1, v, c = params
    return F.binary_cross_entropy_with_logits(forward(X4[3:], W1, b1, v, c)[2], y4[3:])

def numeric_grad(loss_fn, params, h=1e-3):
    grads = []
    for t in params:
        g = torch.zeros_like(t)
        for idx in range(t.numel()):
            orig = t.view(-1)[idx].item()
            t.view(-1)[idx] = orig + h; up = loss_fn(params).item()
            t.view(-1)[idx] = orig - h; down = loss_fn(params).item()
            t.view(-1)[idx] = orig
            g.view(-1)[idx] = (up - down) / (2 * h)
        grads.append(g)
    return grads

params = list(start_weights())
for name, g in zip(["dL/dW1", "dL/db1", "dL/dv", "dL/dc"], numeric_grad(loss_D, params)):
    print(name, [round(t, 4) for t in g.view(-1).tolist()])</div>
  <div class="fx" data-lang="text">dL/dW1 [0.5165, 0.5165, -0.3874, -0.3874]
dL/db1 [0.5165, -0.3874]
dL/dv [0.6456, 0.3228]
dL/dc [0.6457]</div>
  <p>∂L/∂v₁ = 0.6456 matches our hand nudge (the last digit wobbles because h = 0.001 is not infinitely small). Every number has a sign (which way to move: opposite to the sign) and a size (how much this weight matters right now). The bottom row of W¹ and b¹₂ are negative: hidden neuron 2's weights should go <em>up</em>. Why? Because v₂ = −0.6 is negative, so making h₂ bigger lowers the output, which is what D needs.</p>
  <p>This method works for any network. The problem is cost: each weight needs two full forward passes. Our 9 weights took 18 passes. A modest image network has 10 million weights: 20 million forward passes for one training step. Training would take years.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A team loses a cricket match by 20 runs. To find who is to blame, you could replay the whole match once per player, each time changing only that player's performance slightly. It works, but for a squad of millions it is hopeless. You need a way to trace blame from the result back through the game once.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>gradient</strong> ∇L is the vector of partial derivatives ∂L/∂θᵢ for every parameter θᵢ. It points in the direction in which the loss rises fastest; gradient descent steps the other way: θ ← θ − lr·∇L. The <strong>central difference</strong> (L(θ + h) − L(θ − h))/2h approximates one partial derivative.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Stepping <em>along</em> the gradient instead of against it. ∂L/∂v₁ = +0.6457 means "increasing v₁ increases the loss", so v₁ must decrease. Sign errors here make the loss climb steadily.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the computational graph.</b> Nudging gives the right numbers but needs two forward passes per weight. Most of each pass is repeated work. Can we break the forward pass into pieces so the work is shared?</div>

  <h2 id="db-graph"><span class="num">04</span>The Computational Graph</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The whole network is one big formula. Its slope with respect to a deep weight looks impossible to write down. Is there a way to get it from small pieces we already understand?</p>
  </div>
  <p>Any forward pass is a chain of tiny operations: multiply, add, ReLU, sigmoid, log. Draw each as a box with arrows for the values flowing through. That drawing is the <strong>computational graph</strong>. The key fact: every box has a <em>local slope</em> that is easy to know, no matter how big the network is.</p>
  <table class="tbl"><caption>The only local slopes our network needs</caption>
    <tr><th>Box</th><th>Output</th><th>Local slope</th><th>On order D</th></tr>
    <tr><td>Multiply by a weight</td><td>w·a</td><td>w.r.t. a: w; w.r.t. w: a</td><td>v₁h₁: slope to h₁ is 0.8, to v₁ is h₁ = 1.0</td></tr>
    <tr><td>Add (bias, sum)</td><td>a + b</td><td>1 to each input</td><td>z = … + c: slope to c is 1</td></tr>
    <tr><td>ReLU</td><td>max(0, z)</td><td>1 if z &gt; 0, else 0</td><td>z₁ = 1.0, z₂ = 0.5: both 1</td></tr>
    <tr><td>Sigmoid</td><td>p = σ(z)</td><td>p(1 − p)</td><td>0.6457 × 0.3543 = 0.2288</td></tr>
    <tr><td>Binary CE</td><td>−[y ln p + (1−y) ln(1−p)]</td><td>−y/p + (1−y)/(1−p)</td><td>1/0.3543 = 2.8221</td></tr>
  </table>
  <p>The <strong>chain rule</strong> says the slope of the end with respect to anything is the <em>product</em> of local slopes along the path between them. Check on the last two boxes: ∂L/∂z = (∂L/∂p)(∂p/∂z) = 2.8221 × 0.2288 = 0.6457 = p − y. The shortcut from section 02 is just the chain rule over two boxes.</p>
  <figure class="viz"><svg viewBox="0 0 700 230" width="700">
<defs><marker id="db-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
<marker id="db-a1r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
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
</svg><figcaption>The 2-2-1 network on order D as a computational graph. Black: values computed going forward. Red: gradients computed going backward, each from the one to its right times a local slope.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bill that lists every item, quantity and tax line. From the total you can trace exactly how much each item added. The computational graph is that itemised bill for the loss; PyTorch writes it automatically while computing the forward pass.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>computational graph</strong> is a directed graph whose nodes are elementary operations and whose edges carry intermediate values. The <strong>chain rule</strong>: if L depends on a only through b, then ∂L/∂a = (∂L/∂b)(∂b/∂a). If a feeds several boxes, the contributions are added.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting to <em>add</em> contributions when a value is used twice. The input x feeds both hidden neurons; its gradient (needed when there are layers before it) is the sum of what comes back along both paths.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: backpropagation by hand.</b> We have the boxes and the rule. Now walk the whole graph backwards for order D, write down every intermediate gradient, and see how one walk gives all 9 slopes at once.</div>

  <h2 id="db-bp"><span class="num">05</span>Backpropagation by Hand on the 2-2-1 Network</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we turn local slopes into all 9 gradients in one pass, and what happens to the loss when we use them?</p>
  </div>
  <p><strong>Backpropagation</strong> is the chain rule run from the loss back towards the inputs. Start with "1" at the loss (∂L/∂L = 1). At each box: <em>gradient arriving × local slope = gradient passed on</em>. Each gradient is computed once and reused by everything to its left. That reuse is the whole trick.</p>
  <h3>Every number, order D (x = (1, 1), y = 0)</h3>
  <table class="tbl"><caption>Backward pass, right to left</caption>
    <tr><th>Step</th><th>Quantity</th><th>Rule</th><th>Number</th></tr>
    <tr><td>1</td><td>∂L/∂z (output logit)</td><td>p − y</td><td>0.6457 − 0 = <strong>0.6457</strong> (call it δ)</td></tr>
    <tr><td>2</td><td>∂L/∂v₁, ∂L/∂v₂</td><td>δ × h</td><td>0.6457 × 1.0 = <strong>0.6457</strong>; 0.6457 × 0.5 = <strong>0.3228</strong></td></tr>
    <tr><td>3</td><td>∂L/∂c</td><td>δ × 1</td><td><strong>0.6457</strong></td></tr>
    <tr><td>4</td><td>∂L/∂h₁, ∂L/∂h₂</td><td>δ × v</td><td>0.6457 × 0.8 = 0.5165; 0.6457 × (−0.6) = −0.3874</td></tr>
    <tr><td>5</td><td>∂L/∂z₁, ∂L/∂z₂</td><td>× ReLU′ (z₁ = 1.0 &gt; 0, z₂ = 0.5 &gt; 0)</td><td>0.5165 × 1 = <strong>0.5165</strong>; −0.3874 × 1 = <strong>−0.3874</strong></td></tr>
    <tr><td>6</td><td>∂L/∂W¹ row 1</td><td>∂L/∂z₁ × x</td><td>0.5165 × (1, 1) = <strong>(0.5165, 0.5165)</strong></td></tr>
    <tr><td>7</td><td>∂L/∂W¹ row 2</td><td>∂L/∂z₂ × x</td><td>−0.3874 × (1, 1) = <strong>(−0.3874, −0.3874)</strong></td></tr>
    <tr><td>8</td><td>∂L/∂b¹</td><td>∂L/∂z × 1</td><td><strong>(0.5165, −0.3874)</strong></td></tr>
  </table>
  <p>Read the story in the numbers. δ = 0.6457 &gt; 0: the output is too high. v₁ and v₂ both get positive gradients, so both shrink (less weight on the hidden signals that pushed z up). Hidden neuron 1 (whose output weight v₁ is positive) is told to fire <em>less</em> for D: its weights get positive gradients. Hidden neuron 2 (whose v₂ is negative, so it pulls the output down) is told to fire <em>more</em>: negative gradients. These are exactly the numeric-nudge values of section 03, from one backward walk instead of 18 forward passes.</p>
  <h3>The same for all four orders at once (matrix form)</h3>
  <p>For a batch, every line of the table becomes a matrix operation, and the loss is the mean over the n = 4 orders, so δ gets a 1/n. With X (4, 2), Z¹ and H (4, 2), z and p (4,):</p>
  <div class="flow"><span>δ = (p − y)/n</span><span>∂v = Hᵀδ, ∂c = Σδ</span><span>∂H = δ vᵀ</span><span>∂Z¹ = ∂H ⊙ [Z¹ &gt; 0]</span><span>∂W¹ = ∂Z¹ᵀX, ∂b¹ = Σ rows</span></div>
  <p>⊙ means element-by-element multiply; [Z¹ &gt; 0] is 1 where the ReLU was on, 0 where off. The code does order D alone first (to match the table), then the batch, entirely by hand with no autograd:</p>
<div class="fx" data-lang="py">def backward(X, y, W1, b1, v, c):
    Z1, H, z, p = forward(X, W1, b1, v, c)
    n = len(y)
    delta = (p - y) / n                     # dL/dz for each order          (n,)
    dv = H.T @ delta                        # dL/dv                         (2,)
    dc = delta.sum()                        # dL/dc                         ()
    dH = delta[:, None] * v[None, :]        # dL/dH                         (n, 2)
    dZ1 = dH * (Z1 &gt; 0).float()             # through ReLU: blocked where off
    dW1 = dZ1.T @ X                         # dL/dW1                        (2, 2)
    db1 = dZ1.sum(0)                        # dL/db1                        (2,)
    return dW1, db1, dv, dc

r = lambda t: [round(x, 4) for x in t.reshape(-1).tolist()]
W1, b1, v, c = start_weights()
g = backward(X4[3:], y4[3:], W1, b1, v, c)
print("order D: dW1", r(g[0]), "db1", r(g[1]), "dv", r(g[2]), "dc", r(g[3]))
g4 = backward(X4, y4, W1, b1, v, c)
print("batch  : dW1", r(g4[0]), "db1", r(g4[1]), "dv", r(g4[2]), "dc", r(g4[3]))</div>
  <div class="fx" data-lang="text">order D: dW1 [0.5165, 0.5165, -0.3874, -0.3874] db1 [0.5165, -0.3874] dv [0.6457, 0.3228] dc [0.6457]
batch  : dW1 [0.0573, 0.0479, -0.0968, -0.0359] db1 [0.0851, -0.0359] dv [0.0704, 0.0604] dc [0.1064]</div>
  <p>Order D reproduces the table. The batch gradient is the average of the four orders' gradients: B and C (late, predicted below 1) push the other way from A and D, so most numbers are smaller. One detail is worth a look: for orders A and C, z₂ is negative (−0.4 and −0.1), so the ReLU blocked all blame to hidden neuron 2; those two orders contribute nothing to that neuron's gradients. That is why ∂L/∂b¹₂ equals ∂L/∂W¹₂₂ (−0.0359): only B and D reach neuron 2, and both have rain = 1.</p>
  <h3>One step, then many</h3>
  <p>Use the gradient: θ ← θ − lr × ∂L/∂θ with learning rate lr = 0.5. On order D alone, by hand for v₁: 0.8 − 0.5 × 0.6457 = 0.4772. Then repeat the whole cycle (forward, backward, step) on all four orders:</p>
<div class="fx" data-lang="py">def step(params, X, y, lr):
    grads = backward(X, y, *params)
    return [t - lr * g for t, g in zip(params, grads)]

params = list(start_weights())
loss = lambda prm, X, y: F.binary_cross_entropy_with_logits(forward(X, *prm)[2], y).item()
print("order D loss before:", round(loss(params, X4[3:], y4[3:]), 4))
after = step(params, X4[3:], y4[3:], lr=0.5)
print("v after one step:", r(after[2]), " order D loss after:", round(loss(after, X4[3:], y4[3:]), 4))

params = list(start_weights())
for t in range(1, 3001):
    params = step(params, X4, y4, lr=0.5)
    if t in (1, 100, 500, 3000):
        p_now = forward(X4, *params)[3]
        print(f"step {t:4d}: mean loss {loss(params, X4, y4):.4f}  P(late) A-D {r(p_now)}")</div>
  <div class="fx" data-lang="text">order D loss before: 1.0375
v after one step: [0.4772, -0.7614]  order D loss after: 0.3302
step    1: mean loss 0.6782  P(late) A-D [0.5227, 0.5572, 0.6109, 0.5916]
step  100: mean loss 0.1649  P(late) A-D [0.2932, 0.8827, 0.8859, 0.0646]
step  500: mean loss 0.0115  P(late) A-D [0.0291, 0.9939, 0.9939, 0.004]
step 3000: mean loss 0.0013  P(late) A-D [0.0036, 0.9994, 0.9994, 0.0004]</div>
  <p>One step on D cut D's loss from 1.0375 to 0.3302 (v₁ moved to 0.4772 as computed by hand; v₂ moved from −0.6 to −0.7614, so hidden neuron 2 now pulls the output down harder). Training on all four orders with nothing but our hand-written backward pass: the loss falls from about ln 2 to 0.0013 and the probabilities become 0.004, 0.999, 0.999, 0.0004. The network discovered an XOR solution on its own, starting from weights that rated D the most likely to be late.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>After the lost match, the captain does not replay it per player. Blame flows back once: result → bowlers → overs → balls, each level splitting what it received according to how much each part contributed. A weight's gradient is its share of that blame.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Backpropagation</strong> computes ∂L/∂θ for all parameters by applying the chain rule from the loss backwards through the computational graph, reusing each intermediate gradient. Its cost is about one extra forward pass (2–3× total), independent of the number of parameters. Its price is memory: every intermediate value (Z¹, H, z, p) must be stored from the forward pass until the backward pass uses it.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Blaming backprop for a non-learning network. Backprop is exact; if the network does not learn, the cause is elsewhere: a learning rate too high (section 07 shows lr 2.0 killing a neuron), saturated activations, or a wrong loss. Also: the memory for stored activations is why training needs much more RAM than prediction.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: checking gradients.</b> We derived the backward formulas by hand. One slip (a missing 1/n, a wrong transpose) would still produce numbers, and the network might still sort of learn. How do we prove the gradient code is correct?</div>

  <h2 id="db-check"><span class="num">06</span>Checking Gradients: Hand vs Numeric vs Autograd</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our hand-written backward pass gave numbers that matched one nudge. Is it right for every weight, on the whole batch, and does it agree with what PyTorch computes?</p>
  </div>
  <p>A <strong>gradient check</strong> compares the analytic gradient (from formulas) with the numeric one (from nudging, section 03) for every parameter, and reports the <strong>relative error</strong> ‖a − b‖ / (‖a‖ + ‖b‖). Use float64 so rounding does not hide anything. Then compare both with PyTorch's <strong>autograd</strong>, which builds the computational graph automatically and runs backprop when you call <code>.backward()</code> (details in <a class="xref" data-note="dl_pytorch">PyTorch</a>).</p>
<div class="fx" data-lang="py">torch.set_default_dtype(torch.float64)
X64, y64 = X4.double(), y4.double()
P64 = [t.double() for t in start_weights()]

hand = backward(X64, y64, *P64)
num = numeric_grad(lambda prm: F.binary_cross_entropy_with_logits(forward(X64, *prm)[2], y64), P64, h=1e-6)
leaves = [t.clone().requires_grad_(True) for t in P64]
F.binary_cross_entropy_with_logits(forward(X64, *leaves)[2], y64).backward()
auto = [t.grad for t in leaves]

flat = lambda gs: torch.cat([g.reshape(-1) for g in gs])
rel = lambda a, b: ((a - b).norm() / (a.norm() + b.norm())).item()
print("hand    :", [round(x, 6) for x in flat(hand).tolist()])
print("autograd:", [round(x, 6) for x in flat(auto).tolist()])
print(f"rel. error hand vs numeric : {rel(flat(hand), flat(num)):.1e}")
print(f"rel. error hand vs autograd: {rel(flat(hand), flat(auto)):.1e}")
buggy = backward(X64, y64, *P64)[2] * 4          # a classic bug: forgot to divide by n
print(f"rel. error if 1/n forgotten in dv: {rel(buggy, num[2]):.2f}")
torch.set_default_dtype(torch.float32)</div>
  <div class="fx" data-lang="text">hand    : [0.057345, 0.047906, -0.096848, -0.035929, 0.085095, -0.035929, 0.07043, 0.060401, 0.106369]
autograd: [0.057345, 0.047906, -0.096848, -0.035929, 0.085095, -0.035929, 0.07043, 0.060401, 0.106369]
rel. error hand vs numeric : 1.9e-10
rel. error hand vs autograd: 0.0e+00
rel. error if 1/n forgotten in dv: 0.60</div>
  <p>All three agree: hand vs numeric to about 2e-10, hand vs autograd exactly (0.0: they performed the very same arithmetic). That is the proof that the table in section 05 is right, and that autograd is doing exactly the walk we did by hand. The last line shows what a bug looks like: forgetting the 1/n makes the relative error 0.6, which is unmistakable. Rule of thumb: below 1e-7 correct, above 1e-2 a bug, in between check more carefully.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Checking a long multiplication by estimating it roughly another way. The rough method is too slow to use every time, but it catches a slip immediately.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Gradient checking</strong>: compare the analytic gradient with central differences (L(θ + h) − L(θ − h))/2h for each parameter, in float64, h ≈ 1e-6, with randomness (dropout) off. <strong>Autograd</strong> (automatic differentiation, reverse mode) is backprop performed by the library on the graph it recorded during the forward pass.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Gradient-checking in float32 with a tiny h: rounding error dominates and correct code looks wrong. Also avoid points exactly at a ReLU kink (z = 0): the numeric slope there is 0.5, the analytic one 0 or 1. And never train with numeric gradients: they are the referee, not the player.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: vanishing and exploding gradients.</b> Backprop is correct. But it multiplies one local slope per layer. In a 20-layer network that is 20 multiplications. What happens to the blame by the time it reaches layer 1?</div>

  <h2 id="db-vg"><span class="num">07</span>Vanishing &amp; Exploding Gradients</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our network has one hidden layer, so blame passes through one ReLU and one weight matrix. Real networks have dozens of layers. Does the blame arrive intact?</p>
  </div>
  <p>In section 05, the gradient for W¹ was δ × v × ReLU′ × x: a product of factors, one per layer crossed. In a 20-layer network the gradient reaching layer 1 is a product of about 20 such factors (a weight and an activation slope each). Multiply 20 numbers a bit below 1 and you get almost nothing: 0.25²⁰ ≈ 1e-12. Multiply 20 numbers a bit above 1 and you get an enormous number. The first is the <strong>vanishing gradient</strong>: early layers get no learning signal and stay frozen. The second is the <strong>exploding gradient</strong>: weights jump wildly and the loss becomes NaN (not a number).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A photocopy of a photocopy of a photocopy: after 20 copies the page is nearly blank (vanishing). A microphone near its own speaker: a small sound feeds back and grows into a screech (exploding).</p></div>
  <p>Experiment: push a batch of 128 generated delivery orders through 20 hidden layers of 64 neurons each, then measure the gradient size at layer 1 and layer 20 for three activation/initialisation pairs, and once with deliberately too-large starting weights:</p>
<div class="fx" data-lang="py">import torch.nn as nn

def make_orders(n=1000, noise=0.05, seed=0):
    g = torch.Generator().manual_seed(seed)
    km = torch.rand(n, generator=g) * 10; rain = torch.rand(n, generator=g) * 20
    late = ((km &gt; 5) ^ (rain &gt; 10)) ^ (torch.rand(n, generator=g) &lt; noise)
    return torch.stack([km / 10, rain / 20], 1), late.float()

def deep(act, init, depth=20, width=64):
    layers, d_in = [], 2
    for _ in range(depth):
        lin = nn.Linear(d_in, width); init(lin.weight); nn.init.zeros_(lin.bias)
        layers += [lin, act()]; d_in = width
    return nn.Sequential(*layers, nn.Linear(width, 1))

X, y = make_orders()
xb, yb = X[:128], y[:128]
for name, act, init in [("sigmoid+Xavier", nn.Sigmoid, nn.init.xavier_normal_),
                        ("tanh+Xavier", nn.Tanh, nn.init.xavier_normal_),
                        ("relu+He", nn.ReLU, lambda w: nn.init.kaiming_normal_(w, nonlinearity="relu"))]:
    torch.manual_seed(0); net = deep(act, init)
    F.binary_cross_entropy_with_logits(net(xb).squeeze(1), yb).backward()
    print(f"{name:15s} layer1 grad={net[0].weight.grad.norm():.1e}  layer20 grad={net[-3].weight.grad.norm():.1e}")

torch.manual_seed(0); net = deep(nn.ReLU, lambda w: nn.init.normal_(w, std=0.5))   # too-large weights
F.binary_cross_entropy_with_logits(net(xb).squeeze(1), yb).backward()
total = nn.utils.clip_grad_norm_(net.parameters(), max_norm=1.0)
print(f"ReLU, std=0.5 init: gradient norm {total:.1e}")
print(f"after clip_grad_norm_(max_norm=1): {torch.sqrt(sum(p.grad.norm() ** 2 for p in net.parameters())):.3f}")</div>
  <div class="fx" data-lang="text">sigmoid+Xavier  layer1 grad=1.3e-14  layer20 grad=3.9e-03
tanh+Xavier     layer1 grad=3.8e-02  layer20 grad=1.9e-02
relu+He         layer1 grad=1.5e-02  layer20 grad=6.9e-02
ReLU, std=0.5 init: gradient norm 1.6e+08
after clip_grad_norm_(max_norm=1): 1.000</div>
  <p>Read the rows. With sigmoid, layer 1's gradient (1.3e-14) is about 10¹¹ times smaller than layer 20's: layer 1 will never learn. Tanh with Xavier and ReLU with He initialisation keep both ends within a factor of a few (how those initialisations are chosen is in <a class="xref" data-note="dl_training">Training Well</a>). With weights that are too large, the total gradient is astronomically big: one step would throw every weight to nonsense. <strong>Gradient clipping</strong> rescales the whole gradient so its length is at most a limit (here 1.0), keeping the direction.</p>
  <h3>A third way blame stops: the dead ReLU</h3>
  <p>Back to our 2-2-1 network. Train it exactly as in section 05, but with learning rate 2.0 instead of 0.5:</p>
<div class="fx" data-lang="py">params = list(start_weights())
for t in range(3000):
    params = step(params, X4, y4, lr=2.0)
Z1_end, H_end, _, p_end = forward(X4, *params)
print("P(late) A-D:", r(p_end), " loss:", round(loss(params, X4, y4), 4))
print("hidden neuron 2's z for A-D:", r(Z1_end[:, 1]), "-&gt; gradient to its weights:", r(backward(X4, y4, *params)[0][1]))</div>
  <div class="fx" data-lang="text">P(late) A-D: [0.6667, 0.6667, 0.6667, 0.0]  loss: 0.4774
hidden neuron 2's z for A-D: [-5.0477, -3.1797, -3.1726, -1.3046] -&gt; gradient to its weights: [0.0, 0.0]</div>
  <p>The loss is stuck at 0.4774 and A, B, C all get the same 0.667. Hidden neuron 2's score is negative for all four orders, so its ReLU outputs 0 and its slope is 0 for every order: step 5 of the backward table multiplies its blame by 0, and its weights receive exactly zero gradient forever. One big early step pushed it into the dead zone. The fix is not in backprop but in training: smaller learning rate, sensible initialisation, Leaky ReLU (<a class="xref" data-note="dl_training">Training Well</a>).</p>
  <table class="tbl">
    <tr><th>Symptom</th><th>Problem</th><th>Fixes (where)</th></tr>
    <tr><td>Loss flat early; first layers' weights barely change</td><td>Vanishing</td><td>ReLU family (<a class="xref" data-note="dl_neurons">Neurons</a>), He/Xavier init and BatchNorm (<a class="xref" data-note="dl_training">Training Well</a>), residual connections (<a class="xref" data-note="dl_cnns">CNNs</a>), LSTM gates (<a class="xref" data-note="dl_rnns">RNNs</a>)</td></tr>
    <tr><td>Loss jumps to inf/NaN</td><td>Exploding</td><td><code>clip_grad_norm_</code>, lower learning rate, proper init</td></tr>
    <tr><td>Loss stuck, some units always 0</td><td>Dead ReLU</td><td>Lower learning rate, Leaky ReLU/GELU, He init</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Vanishing gradients</strong>: gradients shrink exponentially with depth because backprop multiplies many factors smaller than 1. <strong>Exploding gradients</strong>: they grow exponentially from factors larger than 1. <strong>Gradient clipping by norm</strong>: if ‖g‖ &gt; max, replace g by g × max/‖g‖.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Clipping goes <em>after</em> <code>loss.backward()</code> (gradients must exist) and <em>before</em> <code>optimizer.step()</code>. Clipping hides exploding gradients but does not cure vanishing ones; for those you change the architecture (activation, init, normalisation, skip connections).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects, then <a class="xref" data-note="dl_training">Training Well</a>.</b> Backprop tells every weight which way to move. It does not say how big a step to take, whether to remember previous steps, what starting weights avoid dead or vanishing layers, or how to stop the network from memorising noise in 1,000 orders.</div>

  <h2 id="db-connect"><span class="num">08</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Loss, gradient, graph, chain rule, backprop, gradient check, vanishing gradients: how do they fit into one learning step?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 250" width="700">
<defs><marker id="db-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="7" class="fb sb"/><text x="70" y="40" text-anchor="middle" font-size="11.5" font-weight="700">forward pass</text><text x="70" y="58" text-anchor="middle" class="tm" font-size="10">D: p = 0.6457</text>
<line x1="130" y1="45" x2="158" y2="45" stroke="currentColor" marker-end="url(#db-a9)"/>
<rect x="160" y="20" width="120" height="50" rx="7" class="fv sb"/><text x="220" y="40" text-anchor="middle" font-size="11.5" font-weight="700">loss</text><text x="220" y="58" text-anchor="middle" class="tm" font-size="10">CE 1.0375; mean 0.698</text>
<line x1="280" y1="45" x2="308" y2="45" stroke="currentColor" marker-end="url(#db-a9)"/>
<rect x="310" y="20" width="140" height="50" rx="7" class="fr sr"/><text x="380" y="40" text-anchor="middle" font-size="11.5" font-weight="700">backprop</text><text x="380" y="58" text-anchor="middle" class="tm" font-size="10">δ = p − y = 0.6457</text>
<line x1="450" y1="45" x2="478" y2="45" stroke="currentColor" marker-end="url(#db-a9)"/>
<rect x="480" y="20" width="100" height="50" rx="7" class="fg sg"/><text x="530" y="40" text-anchor="middle" font-size="11.5" font-weight="700">gradient</text><text x="530" y="58" text-anchor="middle" class="tm" font-size="10">9 numbers</text>
<line x1="580" y1="45" x2="608" y2="45" stroke="currentColor" marker-end="url(#db-a9)"/>
<rect x="610" y="20" width="80" height="50" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="650" y="40" text-anchor="middle" font-size="11">step</text><text x="650" y="58" text-anchor="middle" class="tm" font-size="10">θ − lr·∇L</text>
<path d="M650,70 L650,100 L70,100 L70,72" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#db-a9)"/><text x="300" y="95" class="tm" font-size="10">repeat: 3,000 steps → P(late) 0.004, 0.999, 0.999, 0.000</text>
<rect x="310" y="130" width="140" height="46" rx="7" class="ft st"/><text x="380" y="149" text-anchor="middle" font-size="11.5" font-weight="700">computational graph</text><text x="380" y="166" text-anchor="middle" class="tm" font-size="10">local slopes + chain rule</text>
<line x1="380" y1="130" x2="380" y2="72" stroke="currentColor" marker-end="url(#db-a9)"/>
<rect x="480" y="130" width="140" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="550" y="149" text-anchor="middle" font-size="11.5" font-weight="700">gradient check</text><text x="550" y="166" text-anchor="middle" class="tm" font-size="10">numeric = hand = autograd</text>
<line x1="530" y1="130" x2="530" y2="72" stroke="currentColor" stroke-dasharray="4 3"/>
<rect x="160" y="190" width="290" height="46" rx="7" class="fr sr"/><text x="305" y="209" text-anchor="middle" font-size="11.5" font-weight="700">many layers → product of many slopes</text><text x="305" y="226" text-anchor="middle" class="tm" font-size="10">vanish (sigmoid 1e-14) · explode (1e8) · dead ReLU (0)</text>
<line x1="380" y1="176" x2="380" y2="188" stroke="currentColor"/>
</svg><figcaption>One learning step: forward → loss → backprop (built on the graph and chain rule) → gradient → step. The numeric gradient referees the backward code; depth turns the chain rule's product into the vanishing/exploding problem.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the running example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>Forward pass</td><td>layers + activations (<a class="xref" data-note="dl_neurons">Neurons</a>)</td><td>what does the net say?</td><td>P(late) 0.545, 0.594, 0.641, 0.646</td><td>every prediction</td></tr>
    <tr><td>Cross-entropy loss</td><td>−ln p(true)</td><td>how wrong, one number?</td><td>D 1.0375; mean 0.698 ≈ ln 2</td><td>classification</td></tr>
    <tr><td>MSE loss</td><td>mean (ŷ − y)²</td><td>how wrong, for numbers?</td><td>D 0.4169; weak signal 0.2954</td><td>regression outputs</td></tr>
    <tr><td>Gradient (numeric)</td><td>nudge ± h, re-measure</td><td>which way per weight?</td><td>∂L/∂v₁ ≈ 0.646 (18 passes for 9 weights)</td><td>checking only</td></tr>
    <tr><td>Computational graph</td><td>elementary boxes</td><td>can work be shared?</td><td>σ′ = 0.2288, ∂L/∂p = 2.8221</td><td>always (autograd builds it)</td></tr>
    <tr><td>Backprop</td><td>chain rule, right to left</td><td>all gradients at once?</td><td>δ 0.6457; ∂v (0.6457, 0.3228); ∂W¹ rows ±(0.5165 / 0.3874)</td><td>every training step</td></tr>
    <tr><td>Gradient check</td><td>numeric vs analytic</td><td>is my backward right?</td><td>rel. error 2e-10; bug → 0.6</td><td>new layers / losses</td></tr>
    <tr><td>Vanishing/exploding</td><td>product of per-layer slopes</td><td>does blame survive depth?</td><td>sigmoid 1e-14 at layer 1; dead ReLU at lr 2.0</td><td>diagnosing deep nets</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>the loss turns "wrong" into a number, and backprop turns that number into a blame for every weight by multiplying simple local slopes backwards, once.</strong> Everything else (checks, clipping, choice of activation) is about keeping that product honest and of a useful size.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="db-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: orders A (0, 0) on time, B (0, 1) late, C (1, 0) late, D (1, 1) on time; inputs (far, rain). Network 2-2-1: W¹ = [[0.5, 0.4], [0.3, 0.6]], b¹ = (0.1, −0.4), ReLU, v = (0.8, −0.6), c = 0.1, sigmoid output.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our orders</th><th>Weakness → next</th></tr>
    <tr><td>Starting network</td><td>what does it say untrained?</td><td>0.545, 0.594, 0.641, 0.646</td><td>"bad" is not a number → loss</td></tr>
    <tr><td>Loss</td><td>how wrong?</td><td>D: CE 1.0375; mean 0.698 ≈ ln 2</td><td>doesn't say which weight → gradient</td></tr>
    <tr><td>Numeric gradient</td><td>which way per weight?</td><td>∂L/∂v₁ ≈ 0.646</td><td>2 passes per weight → graph</td></tr>
    <tr><td>Computational graph</td><td>share the work?</td><td>local slopes: σ′ 0.2288, CE′ 2.8221</td><td>how to combine → backprop</td></tr>
    <tr><td>Backprop</td><td>all gradients in one pass?</td><td>δ = 0.6457 → ∂v (0.6457, 0.3228), ∂W¹ (0.5165 ×2), (−0.3874 ×2); one step: 1.0375 → 0.3302</td><td>is it right? → check</td></tr>
    <tr><td>Gradient check</td><td>can I trust it?</td><td>hand = numeric (2e-10) = autograd (0)</td><td>deep chains → vanishing</td></tr>
    <tr><td>Vanishing/exploding</td><td>does blame survive depth?</td><td>sigmoid layer-1 1e-14; std 0.5 init → 1.6e8; lr 2.0 → dead ReLU, loss stuck 0.4774</td><td>→ <a class="xref" data-note="dl_training">Training Well</a></td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>MSE</td><td>(1/n)Σ(ŷᵢ − yᵢ)²</td><td>ŷ prediction, y truth, n examples</td></tr>
    <tr><td>Binary cross-entropy</td><td>−(1/n)Σ[yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)]</td><td>p = σ(z) predicted P(y = 1)</td></tr>
    <tr><td>Cross-entropy (C classes)</td><td>−(1/n)Σ ln pᵢ,true; p = softmax(z)</td><td>untrained ≈ ln C</td></tr>
    <tr><td>Sigmoid + CE slope</td><td>∂L/∂z = p − y</td><td>MSE instead: 2(p − y)p(1 − p)</td></tr>
    <tr><td>Chain rule</td><td>∂L/∂a = (∂L/∂b)(∂b/∂a); add over paths</td><td>local slope × incoming gradient</td></tr>
    <tr><td>Backprop, 2-layer (batch)</td><td>δ = (p − y)/n; ∂v = Hᵀδ; ∂c = Σδ; ∂H = δvᵀ; ∂Z¹ = ∂H ⊙ [Z¹ &gt; 0]; ∂W¹ = ∂Z¹ᵀX; ∂b¹ = Σ∂Z¹</td><td>⊙ element-wise; [·] 1 if true</td></tr>
    <tr><td>Update</td><td>θ ← θ − lr·∂L/∂θ</td><td>lr learning rate</td></tr>
    <tr><td>Numeric gradient, check</td><td>(L(θ+h) − L(θ−h))/2h; ‖a − b‖/(‖a‖ + ‖b‖)</td><td>float64, h ≈ 1e-6; &lt; 1e-7 OK, &gt; 1e-2 bug</td></tr>
    <tr><td>Clip by norm</td><td>g ← g·max/‖g‖ if ‖g‖ &gt; max</td><td>between backward and step</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Cross-entropy</b><p>Any classification (yes/no, one of C). Strong signal when confidently wrong.</p><small>Pass logits to the PyTorch loss</small></div>
    <div><b>MSE</b><p>Numeric outputs (minutes late). Penalises big misses.</p><small>Avoid on sigmoid outputs for classification</small></div>
    <div><b>Autograd / backprop</b><p>Every training step: exact, ~1 extra pass.</p><small>Needs memory for stored activations</small></div>
    <div><b>Numeric gradient</b><p>Testing a new layer or loss, once, in float64.</p><small>Never for training: 2 passes per weight</small></div>
    <div><b>Gradient clipping</b><p>RNNs, Transformers, any run with loss spikes or NaN.</p><small>Does not fix vanishing gradients</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Softmax/sigmoid before a PyTorch loss that applies it (double squashing); one-hot labels to CrossEntropyLoss; stepping along +gradient; forgetting 1/n or a transpose (catch with a gradient check); gradient-checking in float32 or at a ReLU kink; blaming backprop when the learning rate killed the ReLUs; sigmoid in deep hidden stacks (vanishing); clipping before backward or after step.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Untrained 3-class classifier: what loss do you expect at step 0?</td><td>ln 3 ≈ 1.10</td></tr>
    <tr><td>Sigmoid output p = 0.8, truth y = 1. ∂L/∂z for cross-entropy?</td><td>p − y = −0.2 (raise z)</td></tr>
    <tr><td>Order B (x = (0, 1)) has ∂L/∂z₁ = −0.3. What is ∂L/∂W¹ row 1?</td><td>−0.3 × (0, 1) = (0, −0.3): the "far" weight gets no blame since far = 0</td></tr>
    <tr><td>A hidden ReLU has z = −0.4. What gradient reaches its incoming weights from this example?</td><td>0: ReLU′(−0.4) = 0 blocks it</td></tr>
    <tr><td>Gradient check relative error 3e-11. Verdict?</td><td>Correct (well below 1e-7)</td></tr>
  </table>

  <h2 id="db-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you compute a loss and a backward pass on the four orders by hand, and explain why each piece exists?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one line each: what are a loss, a gradient and a learning rate?</summary><div class="qa-body">Loss: one number saying how wrong the predictions are (0 = perfect). Gradient: for each weight, the slope of the loss: which way and how strongly to move it. Learning rate: the multiplier that sets the step size.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive ∂L/∂z for sigmoid followed by binary cross-entropy.</summary><div class="qa-body">∂L/∂p = −y/p + (1 − y)/(1 − p); ∂p/∂z = p(1 − p). Product: −y(1 − p) + (1 − y)p = p − y. On order D: 0.6457 − 0 = 0.6457.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why cross-entropy rather than MSE for classification?</summary><div class="qa-body">With a sigmoid/softmax in front, CE's logit gradient is p − y: large when badly wrong. MSE's is multiplied by σ′ = p(1 − p), tiny near 0 or 1: at p = 0.99, y = 0, CE gives 0.99 but MSE 0.0196. CE is also the maximum-likelihood loss for class outputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is backpropagation and why is it efficient?</summary><div class="qa-body">The chain rule applied from the loss back through the computational graph. Each box multiplies the incoming gradient by its local slope and passes it on, so shared parts are computed once. All gradients cost about one extra forward pass instead of two passes per weight. Price: storing forward activations.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>On order D, compute ∂L/∂v₂ and ∂L/∂W¹₂₁ (hidden neuron 2, input "far").</summary><div class="qa-body">δ = 0.6457. ∂L/∂v₂ = δ·h₂ = 0.6457 × 0.5 = 0.3228. ∂L/∂h₂ = δ·v₂ = −0.3874; ReLU on (z₂ = 0.5) so ∂L/∂z₂ = −0.3874; times far = 1 → −0.3874.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you gradient-check a custom layer?</summary><div class="qa-body">Compare the analytic gradient with central differences (L(θ+h) − L(θ−h))/2h for each parameter, in float64, h ≈ 1e-6, small batch, dropout off, away from ReLU kinks. Relative error &lt; 1e-7 passes; &gt; 1e-2 is a bug (forgetting 1/n gave 0.6).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do deep sigmoid networks suffer from vanishing gradients?</summary><div class="qa-body">Backprop multiplies one σ′ (≤ 0.25) per layer; 20 layers can shrink the signal by 10¹¹ or more (our run: 1.3e-14 at layer 1). ReLU (slope 1), He init, normalisation and residual connections fix it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your loss suddenly becomes NaN. What do you check?</summary><div class="qa-body">Exploding gradients (log the gradient norm, add <code>clip_grad_norm_</code>), learning rate too high, bad init, log(0) in a hand-written loss (use the WithLogits losses), NaNs in input data, fp16 overflow.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a dead ReLU and how did one appear in our network?</summary><div class="qa-body">A ReLU whose input is negative for every example: it outputs 0 and passes zero gradient, so its weights never change again. With lr 2.0, an early large step pushed hidden neuron 2's z below 0 for all four orders; the loss froze at 0.4774. Fixes: smaller lr, Leaky ReLU, He init.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does backprop need the loss to be a single number?</summary><div class="qa-body">Backprop starts from ∂L/∂L = 1 and gives each weight one slope of that one number. With several outputs and no single score, "which way is better" is undefined; you combine them into one loss first (e.g. the mean over orders, or a weighted sum of tasks).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if the network has no activation functions, from backprop's point of view?</summary><div class="qa-body">Backprop still runs and gradients are correct, but the model is one linear layer in disguise (<a class="xref" data-note="dl_neurons">Neurons</a>), so the best it can do on our orders is P(late) = 0.5 for all and loss ln 2. Correct gradients of a model that cannot represent the answer cannot help.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is the numeric gradient both useless and essential?</summary><div class="qa-body">Useless for training: 2 forward passes per weight (20 million per step for 10 million weights) and only approximate. Essential for testing: it needs no formulas, so it independently referees hand-written or new backward code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: backprop gave the gradient. Why is training still not "solved"?</summary><div class="qa-body">The gradient is local: it says which way is down here, not how far to step (lr 2.0 killed a neuron; lr 0.5 worked), nor how to handle noisy mini-batches, narrow valleys, bad starting weights, or memorising noise. Those are optimizers, schedules, init and regularisation in <a class="xref" data-note="dl_training">Training Well</a>.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="dl_training">Training Well</a>.</b> We can compute every gradient exactly. Now: smarter steps (momentum, Adam), learning-rate schedules, starting weights that keep signals alive, normalisation, and stopping the network from memorising the 5% noisy labels in 1,000 orders.</div>
</main>`
});
