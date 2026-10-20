// notes/dl/dl_training.js — Training Well
Object.assign(TOPIC_CONTENT, {
  "dl_training": `<main>
  <h1>Training Well</h1>
  <div class="where"><span>Deep Learning</span><span>Neural Networks</span><span>Training Well</span></div>
  <p class="lead">Backpropagation tells every weight which way to move. Training well is everything around that: how big a step to take and with what memory of past steps (optimizers), how the step size should change over time (schedules), which starting weights keep signals alive (initialisation), how to keep each layer's inputs well-scaled (batch norm), how to stop the network memorising noise (weight decay, dropout, early stopping), and how to read loss curves to know which of these is your problem. One running example: the late-delivery network on 1,000 generated orders (late = far XOR rain, with noisy labels). All outputs are from real runs (PyTorch 2.14, CPU, single thread).</p>

  <h2 id="dt-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 150" width="680">
<defs><marker id="dt-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="41" text-anchor="middle" font-size="12">NN: the map</text><text x="70" y="58" text-anchor="middle" class="tm" font-size="10">the need chain</text>
<line x1="130" y1="45" x2="148" y2="45" stroke="currentColor" marker-end="url(#dt-a0)"/>
<rect x="150" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="210" y="41" text-anchor="middle" font-size="12">Neurons</text><text x="210" y="58" text-anchor="middle" class="tm" font-size="10">build the network</text>
<line x1="270" y1="45" x2="288" y2="45" stroke="currentColor" marker-end="url(#dt-a0)"/>
<rect x="290" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="350" y="41" text-anchor="middle" font-size="12">Loss &amp; Backprop</text><text x="350" y="58" text-anchor="middle" class="tm" font-size="10">gradient per weight</text>
<line x1="410" y1="45" x2="428" y2="45" stroke="currentColor" marker-end="url(#dt-a0)"/>
<rect x="430" y="20" width="110" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="485" y="41" text-anchor="middle" font-size="12" font-weight="700">Training Well</text><text x="485" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="540" y1="45" x2="558" y2="45" stroke="currentColor" marker-end="url(#dt-a0)"/>
<rect x="560" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="615" y="41" text-anchor="middle" font-size="12">PyTorch</text><text x="615" y="58" text-anchor="middle" class="tm" font-size="10">the same, in the tool</text>
<text x="340" y="110" text-anchor="middle" class="tm" font-size="10.5">running example: 1,000 generated orders (800 train / 200 validation), late = far XOR rain, 5% noisy labels;</text>
<text x="340" y="126" text-anchor="middle" class="tm" font-size="10.5">for overfitting: only 200 training orders with 10% noisy labels</text>
</svg><figcaption>The Neural Networks track. Backprop gave the gradient; this note turns it into reliable training.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a></b><span>We computed exact gradients and trained the 2-2-1 network on four orders. But lr 0.5 worked and lr 2.0 killed a neuron, and four orders are not real data. The gradient alone does not make training reliable.</span></li>
    <li><b>This note adds: the craft of training</b><span>Mini-batch SGD, momentum and Adam (theory in <a class="xref" data-note="m_optimization">Optimization</a>), learning-rate schedules, weight initialisation (with the variance traced), batch normalisation, overfitting and its cures (weight decay, dropout, early stopping; theory in <a class="xref" data-note="ml_regularization">Regularization</a>), and diagnosis from loss curves.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dl_pytorch">PyTorch</a></b><span>Everything here is a few lines of PyTorch. The next note trains the same delivery network with the real tool: tensors, autograd, nn.Module, DataLoader, the training loop, evaluation mode, saving, GPU and transfer learning.</span></li>
  </ol>

  <h2 id="dt-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. Running example: the delivery network (2 inputs → 32 → 32 → 1, ReLU) on 800 training and 200 validation orders.</p>
  <ol class="story">
    <li><b>Mini-batch SGD</b><span>Q: how do we use gradients on 800 orders efficiently? → One step per batch of 64 orders: w ← w − lr·g. Works, but crawls: validation accuracy only 0.855 after 30 epochs. Why so slow?</span></li>
    <li><b>Momentum, RMSprop, Adam</b><span>Q: how do we step smarter? → Remember past gradients (momentum) and give each weight its own step size (RMSprop); Adam does both: 0.945 accuracy by epoch 5. But with one fixed learning rate, the loss keeps jittering at the end…</span></li>
    <li><b>Learning-rate schedules</b><span>Q: should the step size change over time? → Big steps early, small late: with Adam at lr 0.05, cosine decay settles at val loss 0.231 vs a jittering 0.24–0.29 with a constant rate. But make the network 6 layers deep and it does not learn at all (stuck at 0.52)…</span></li>
    <li><b>Weight initialisation</b><span>Q: which starting weights keep the signal alive through many layers? → Var(w) = 2/fan_in (He) keeps the spread constant (spread 0.96 → 0.92 over 10 layers); the deep net now reaches 0.91. But as weights change during training, layers' input scales drift…</span></li>
    <li><b>Batch normalisation</b><span>Q: can each layer's inputs be kept at a steady scale throughout training? → Standardise per batch, then learn γ, β: the 6-layer net reaches 0.93. Now it learns well. Too well, with little data…</span></li>
    <li><b>Overfitting: weight decay, dropout, early stopping</b><span>Q: how do we stop the network memorising noise? → With 200 noisy orders, validation loss bottoms at 0.436 (epoch 19) then climbs to 0.742 while training loss falls. Weight decay, dropout and early stopping hold it near the bottom. But how do you know which problem you have?</span></li>
    <li><b>Diagnosis with loss curves</b><span>Q: what is going wrong in <em>my</em> run? → Read train vs validation curves: both flat = too slow; spiky = lr too high; gap growing = overfitting; both falling and close = healthy. Next: the same recipe in the real tool → <a class="xref" data-note="dl_pytorch">PyTorch</a>.</span></li>
  </ol>

  <h2 id="dt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Training Well</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">SGD</div>
        <ul>
          <li>Step per mini-batch: w ← w − lr·g</li>
          <li>Epoch = one pass; 800/64 → 13 steps</li>
          <li>Noisy but cheap; noise helps generalise</li>
          <li>Delivery: 0.855 acc after 30 epochs (slow)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Momentum &amp; Adam</div>
        <ul>
          <li><b>Momentum</b> v = βv + g; zig-zags cancel, steady pushes add</li>
          <li><b>RMSprop</b> divide by √(avg g²): own step per weight</li>
          <li><b>Adam</b> both + bias correction; lr 1e-3 default</li>
          <li><b>AdamW</b> decoupled weight decay</li>
          <li>Delivery epoch 5: SGD 0.56, momentum 0.79, Adam 0.945</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LR schedules</div>
        <ul>
          <li>Step decay, cosine, warm-up, reduce-on-plateau</li>
          <li>Big steps early, small late</li>
          <li>lr 0.05: constant val 0.24–0.29; cosine 0.231</li>
          <li>⚠ scheduler.step() after optimizer.step()</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Initialisation</div>
        <ul>
          <li>Var(z) = fan_in · Var(w) · Var(x)</li>
          <li><b>Xavier</b> 2/(in + out): tanh/sigmoid</li>
          <li><b>He</b> 2/in: ReLU (halves the signal)</li>
          <li>⚠ Constant init: all units identical forever</li>
          <li>Deep delivery net: 0.52 → 0.91 with He</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">BatchNorm</div>
        <ul>
          <li>(z − μ_B)/√(σ²_B + ε), then γẑ + β</li>
          <li>Train: batch stats; eval: running averages</li>
          <li>km [1, 1, 9, 9] → [−1, −1, 1, 1]</li>
          <li>LayerNorm: per example; Transformers</li>
          <li>Deep delivery net: 0.52 → 0.93</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regularisation</div>
        <ul>
          <li>Overfit: train ↓, val ↑ (0.436 → 0.742)</li>
          <li><b>Weight decay</b> (L2): w ← w − lr·λ·w</li>
          <li><b>L1</b>: pushes useless weights to ~0</li>
          <li><b>Dropout p</b>: zero random units, scale 1/(1−p); off in eval</li>
          <li><b>Early stopping</b>: keep the best-val checkpoint</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Diagnosis</div>
        <ul>
          <li>Step-0 loss ≈ ln 2 = 0.693</li>
          <li>Both flat high → lr too low / dead net</li>
          <li>Spikes, NaN → lr too high; clip</li>
          <li>Gap grows → overfitting → regularise</li>
          <li>Overfit one batch first</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dt-sgd"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Mini-batch SGD</span><span class="rm-sub">The baseline, at scale</span></div></div>
      <div class="rm-item rm-done" data-target="dt-opt"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Momentum &amp; Adam</span><span class="rm-sub">Smarter steps</span></div></div>
      <div class="rm-item rm-done" data-target="dt-lr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Learning-Rate Schedules</span><span class="rm-sub">Big early, small late</span></div></div>
      <div class="rm-item rm-done" data-target="dt-init"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Weight Initialisation</span><span class="rm-sub">Variance traced; Xavier, He</span></div></div>
      <div class="rm-item rm-done" data-target="dt-bn"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Batch Normalisation</span><span class="rm-sub">Re-centre every layer</span></div></div>
      <div class="rm-item rm-done" data-target="dt-reg"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Overfitting &amp; Regularisation</span><span class="rm-sub">Weight decay, dropout, early stopping</span></div></div>
      <div class="rm-item rm-done" data-target="dt-loop"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">A Full Loop, Diagnosed</span><span class="rm-sub">Reading loss curves</span></div></div>
      <div class="rm-item rm-done" data-target="dt-connect"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table, one picture</span></div></div>
      <div class="rm-item rm-done" data-target="dt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dt-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dt-sgd"><span class="num">01</span>Mini-batch SGD: the Baseline at Scale</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In the backprop note we trained on four orders, computing the gradient on all of them every step. With 800 orders (or 8 million), how do we use gradients efficiently, and how well does the plain update rule do?</p>
  </div>
  <p>Computing the gradient on all training examples before every step is exact but slow, and with millions of examples it does not even fit in memory. <strong>Stochastic gradient descent (SGD)</strong> instead takes a small random <strong>mini-batch</strong> (say 64 orders), computes the gradient on just those, and steps. The batch gradient is a noisy estimate of the full one, but you get 13 steps per pass over 800 orders instead of 1. One full pass over the training data is an <strong>epoch</strong>. The update is the one from backprop: w ← w − lr·g. (Theory: <a class="xref" data-note="m_optimization">Optimization</a>, <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>.)</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A chef tasting a soup. Tasting the whole pot before each adjustment is exact but absurd; a spoonful (mini-batch) tells you nearly as much, so you can adjust many times while the soup cooks. Each spoon is a little different, which is fine.</p></div>
  <p>The setup used for the whole note: the 1,000 generated orders, first 800 for training, last 200 for validation (never trained on, used to judge the model), and a network 2 → 32 → 32 → 1 with ReLU. A helper <code>fit</code> runs the epochs and records the average training loss, validation loss and validation accuracy after each epoch:</p>
<div class="fx" data-lang="py">import torch, torch.nn as nn, torch.nn.functional as F, math

def make_orders(n=1000, noise=0.05, seed=0):
    g = torch.Generator().manual_seed(seed)
    km = torch.rand(n, generator=g) * 10; rain = torch.rand(n, generator=g) * 20
    late = ((km &gt; 5) ^ (rain &gt; 10)) ^ (torch.rand(n, generator=g) &lt; noise)
    return torch.stack([km / 10, rain / 20], 1), late.float()

X, y = make_orders()
Xtr, ytr, Xva, yva = X[:800], y[:800], X[800:], y[800:]

def mlp(hidden=32, depth=2, bn=False, p=0.0, d_in=2):
    layers = []
    for _ in range(depth):
        layers += [nn.Linear(d_in, hidden)] + ([nn.BatchNorm1d(hidden)] if bn else []) + [nn.ReLU()]
        if p: layers.append(nn.Dropout(p))
        d_in = hidden
    return nn.Sequential(*layers, nn.Linear(hidden, 1))     # one logit: P(late) = sigmoid(logit)

def evaluate(net, Xv=None, yv=None):
    Xv = Xva if Xv is None else Xv; yv = yva if yv is None else yv
    net.eval()
    with torch.no_grad():
        out = net(Xv).squeeze(1)
        loss = F.binary_cross_entropy_with_logits(out, yv).item()
        acc = ((out &gt; 0).float() == yv).float().mean().item()
    net.train()
    return loss, acc

def fit(net, opt, epochs, Xt=Xtr, yt=ytr, bs=64, sched=None, clip=None, Xv=None, yv=None):
    hist = []
    for ep in range(epochs):
        perm = torch.randperm(len(Xt)); total = 0.0
        for i in range(0, len(Xt), bs):
            idx = perm[i:i + bs]
            opt.zero_grad()
            loss = F.binary_cross_entropy_with_logits(net(Xt[idx]).squeeze(1), yt[idx])
            loss.backward()
            if clip: nn.utils.clip_grad_norm_(net.parameters(), clip)
            opt.step(); total += loss.item() * len(idx)
        if sched: sched.step()
        hist.append((total / len(Xt),) + evaluate(net, Xv, yv))   # (train loss, val loss, val acc)
    return hist

show = lambda h, eps: "  ".join(f"ep{e}: tr {h[e-1][0]:.3f} va {h[e-1][1]:.3f} acc {h[e-1][2]:.3f}" for e in eps)
torch.manual_seed(0); net = mlp()
print("step-0 val loss:", round(evaluate(net)[0], 3), " ln 2 =", round(math.log(2), 3))
h_sgd = fit(net, torch.optim.SGD(net.parameters(), lr=0.1), epochs=30)
print("SGD lr 0.1 |", show(h_sgd, [1, 5, 30]))</div>
  <div class="fx" data-lang="text">step-0 val loss: 0.694  ln 2 = 0.693
SGD lr 0.1 | ep1: tr 0.694 va 0.692 acc 0.520  ep5: tr 0.689 va 0.688 acc 0.560  ep30: tr 0.588 va 0.594 acc 0.855</div>
  <p>The step-0 loss is ln 2, as an untrained yes/no model should be. Plain SGD with lr 0.1 then barely moves for 10 epochs and reaches only 0.855 validation accuracy after 30 epochs (130 × 30 = 390 steps). Nothing is broken; it is just slow. Raising the learning rate is the obvious idea, but as the next section shows, that makes some directions blow up while others still crawl.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Mini-batch SGD</strong>: for each batch B, g = ∇ of the mean loss over B; θ ← θ − lr·g. <strong>Epoch</strong>: one pass over the training set. <strong>Iteration/step</strong>: one batch. <strong>Validation set</strong>: held-out data used to judge and tune the model, never to compute gradients.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Judging training by the training loss alone. It always looks better than reality. Every result in this note is reported on the 200 validation orders the network never trained on.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: momentum and Adam.</b> SGD uses only today's gradient and one step size for every weight. Is there a smarter way to step, one that remembers where previous steps were heading and adapts the step to each weight?</div>

  <h2 id="dt-opt"><span class="num">02</span>Momentum, RMSprop &amp; Adam</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Why does plain SGD crawl, and what can an optimizer do with the gradient beyond "step against it"?</p>
  </div>
  <p>Loss surfaces of networks are full of long, narrow valleys: steep walls in some directions, a gentle floor in others. The gradient mostly points at the steep walls, so SGD bounces from wall to wall and drifts slowly along the floor. A bigger learning rate makes it bounce harder, not move faster. The cleanest such valley is f = ½(x² + 50y²): 50 times steeper in y than in x. Same start, 100 steps of each optimizer:</p>

  <figure class="viz"><svg viewBox="0 0 560 220" width="560">
    <ellipse cx="380" cy="110" rx="60" ry="17" fill="none" stroke="currentColor" opacity="0.25"/>
    <ellipse cx="380" cy="110" rx="180" ry="50" fill="none" stroke="currentColor" opacity="0.25"/>
    <ellipse cx="380" cy="110" rx="330" ry="92" fill="none" stroke="currentColor" opacity="0.25"/>
    <polyline points="56,185 67,54 78,152 89,78 99,134 109,92 118,123 128,100 136,118 145,104 153,114 161,107 169,112 176,108 183,111 190,109 197,111 203,109 209,110 215,110 221,110 227,110 232,110 237,110 242,110 247,110 252,110 256,110 261,110 265,110 269,110 273,110 276,110 280,110 284,110 287,110 290,110 293,110 296,110 299,110" fill="none" class="sr" stroke-width="1.8"/><polyline points="56,185 67,54 88,34 118,149 153,184 193,86 236,40 279,121 321,175 362,110 398,51 431,101 458,161 481,125 497,66 507,90 512,147 512,134 508,81 499,84 487,132 472,137 456,94 439,84 421,121 404,135 387,104 372,86 359,112 348,132 339,112 332,91 328,106 326,127 326,117 328,96 331,102 336,121 342,119 349,101" fill="none" class="sb" stroke-width="1.6" opacity="0.8"/><polyline points="56,185 67,163 78,141 88,120 99,102 110,87 120,78 131,74 142,74 152,77 162,83 173,91 183,99 193,108 203,115 213,122 222,127 232,130 241,131 250,130 259,127 268,123 276,119 284,114 292,109 300,104 308,101 315,99 322,98 328,98 335,99 341,102 346,104 352,108 357,111 362,113 366,116 370,117 374,118 378,117" fill="none" class="sg" stroke-width="2.2"/>
    <circle cx="380" cy="110" r="4" class="fg sg"/><circle cx="56" cy="185" r="4" stroke="currentColor" fill="none"/>
    <text x="40" y="205" class="tm">start</text><text x="388" y="104" class="tg">min</text>
    <text x="20" y="20" class="tr">SGD: zig-zag, crawls</text><text x="200" y="20" class="tb">Momentum: fast, overshoots</text><text x="420" y="20" class="tg">Adam: glides in</text>
  </svg><figcaption>First 40 steps of three optimizers from the same start on a narrow valley (real run; grey ellipses are contour lines). Red SGD bounces between the steep walls and crawls along the floor. Blue momentum builds speed and overshoots. Green Adam takes a sensible step in each direction.</figcaption></figure>
  <h3>Momentum: remember the direction</h3>
  <p>Keep a running "velocity" v: each step v = β·v + g, then w ← w − lr·v, with β = 0.9. When gradients flip sign every step (wall to wall), they cancel inside v. When they keep pointing the same way (along the floor), they add up. By hand with β = 0.9: steady gradients 1, 1, 1 give v = 1, 1.9, 2.71; flipping gradients 1, −1, 1 give v = 1, −0.1, 0.91.</p>
<div class="fx" data-lang="py">for name, grads in [("zig-zag", [1, -1, 1, -1, 1, -1]), ("steady", [1, 1, 1, 1, 1, 1])]:
    v, vs = 0.0, []
    for g in grads:
        v = 0.9 * v + g
        vs.append(round(v, 2))
    print(f"{name:8s} grads {grads}  velocity {vs}")</div>
  <div class="fx" data-lang="text">zig-zag  grads [1, -1, 1, -1, 1, -1]  velocity [1.0, -0.1, 0.91, -0.18, 0.84, -0.25]
steady   grads [1, 1, 1, 1, 1, 1]  velocity [1.0, 1.9, 2.71, 3.44, 4.1, 4.69]</div>
  <p>Steady gradients build up to almost 5× a single gradient; zig-zagging ones stay small. That is the whole trick.</p>
  <h3>RMSprop and Adam: a step size per weight</h3>
  <p><strong>RMSprop</strong> keeps, for each weight, a running average s of its <em>squared</em> gradient and divides the step by √s. A weight with consistently huge gradients (the steep wall) gets small steps; one with tiny gradients (the flat floor) gets bigger ones. <strong>Adam</strong> = momentum (for the direction) + RMSprop (for the per-weight size) + a <strong>bias correction</strong>: both averages start at 0, so early on they are too small; Adam divides them by (1 − βᵗ) to fix that.</p>
  <table class="tbl">
    <tr><th>Optimizer</th><th>Update (g = gradient)</th><th>Fixes</th></tr>
    <tr><td><strong>SGD</strong></td><td>w −= lr·g</td><td>Baseline; batch noise helps find wide minima</td></tr>
    <tr><td><strong>Momentum</strong></td><td>v = βv + g; w −= lr·v (β = 0.9)</td><td>Zig-zag cancels; steady direction speeds up</td></tr>
    <tr><td><strong>RMSprop</strong></td><td>s = ρs + (1−ρ)g²; w −= lr·g/(√s + ε)</td><td>Own step size per weight</td></tr>
    <tr><td><strong>Adam</strong></td><td>m = β₁m + (1−β₁)g; s = β₂s + (1−β₂)g²; m̂ = m/(1−β₁ᵗ), ŝ = s/(1−β₂ᵗ); w −= lr·m̂/(√ŝ + ε)</td><td>Both; defaults lr 1e-3, β₁ 0.9, β₂ 0.999, ε 1e-8</td></tr>
    <tr><td><strong>AdamW</strong></td><td>Adam, then w −= lr·λ·w separately</td><td>Weight decay that works with Adam (section 06)</td></tr>
  </table>
  <p>Adam's first step by hand, one weight with g = 0.5: m = 0.1 × 0.5 = 0.05, s = 0.001 × 0.25 = 0.00025; corrected m̂ = 0.05/0.1 = 0.5, ŝ = 0.00025/0.001 = 0.25; step = lr × 0.5/√0.25 = lr × 1. Adam's first step is always about lr in size, whatever the gradient's scale. Now the same comparison on the delivery network (same seed, same batches):</p>
<div class="fx" data-lang="py">for name, make in [("SGD lr 0.1", lambda p: torch.optim.SGD(p, lr=0.1)),
                   ("SGD+momentum 0.9", lambda p: torch.optim.SGD(p, lr=0.1, momentum=0.9)),
                   ("Adam lr 1e-2", lambda p: torch.optim.Adam(p, lr=1e-2)),
                   ("Adam lr 1e-3", lambda p: torch.optim.Adam(p, lr=1e-3))]:
    torch.manual_seed(0); net = mlp()
    h = fit(net, make(net.parameters()), epochs=30)
    print(f"{name:17s}|", show(h, [5, 30]))
for name, make in [("SGD", lambda p: torch.optim.SGD(p, lr=0.035)), ("momentum", lambda p: torch.optim.SGD(p, lr=0.035, momentum=0.9)),
                   ("RMSprop", lambda p: torch.optim.RMSprop(p, lr=0.1)), ("Adam", lambda p: torch.optim.Adam(p, lr=0.3))]:
    a, b = valley_path(make)[-1]
    print(f"valley after 100 steps, {name:8s}: f = {0.5 * (a * a + 50 * b * b):.6f}")</div>
  <div class="fx" data-lang="text">SGD lr 0.1       | ep5: tr 0.689 va 0.688 acc 0.560  ep30: tr 0.588 va 0.594 acc 0.855
SGD+momentum 0.9 | ep5: tr 0.596 va 0.560 acc 0.790  ep30: tr 0.277 va 0.260 acc 0.940
Adam lr 1e-2     | ep5: tr 0.377 va 0.341 acc 0.945  ep30: tr 0.268 va 0.254 acc 0.940
Adam lr 1e-3     | ep5: tr 0.678 va 0.678 acc 0.660  ep30: tr 0.368 va 0.370 acc 0.945
valley after 100 steps, SGD     : f = 0.032577
valley after 100 steps, momentum: f = 0.001259
valley after 100 steps, RMSprop : f = 0.000984
valley after 100 steps, Adam    : f = 0.001751</div>
  <p>On the delivery network, by epoch 5: SGD 0.56, momentum 0.79, Adam (lr 1e-2) 0.945. Adam with the textbook default 1e-3 is slower here (0.66 at epoch 5) but catches up by epoch 30: defaults are starting points, not answers. On the valley, SGD's learning rate cannot exceed 2/50 = 0.04 or the steep direction explodes, so it is stuck crawling along x (f = 0.033 after 100 steps); the others finish about 20 to 30 times lower.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Walking downhill in fog. SGD: feel the slope, take one step, repeat. Momentum: a rolling ball that keeps its speed over small bumps. RMSprop: you remember which directions were steep and step carefully there, boldly elsewhere. Adam: both.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>optimizer</strong> maps gradients to parameter updates. <strong>Momentum</strong> uses an exponential moving average of gradients; <strong>adaptive</strong> methods (RMSprop, Adam) scale each parameter's step by a moving average of its squared gradients. More in <a class="xref" data-note="m_optimization">Optimization</a>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Adam is always best." On image CNNs, well-tuned SGD + momentum with a schedule often generalises better; Transformers use AdamW. And <code>Adam(weight_decay=…)</code> mixes the decay into the adaptive scaling and weakens it; use <code>AdamW</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: learning-rate schedules.</b> Every optimizer above uses one learning rate for the whole run. Early on we want big steps to make progress; near the end, big steps bounce around the minimum. Should the step size change during training?</div>

  <h2 id="dt-lr"><span class="num">03</span>Learning-Rate Schedules</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A learning rate big enough to make fast progress is too big to settle precisely at the end. A small one settles but takes forever. Can we have both?</p>
  </div>
  <p>A <strong>learning-rate schedule</strong> changes lr as training goes on: large at first, smaller later. Common shapes: <strong>step decay</strong> (multiply by 0.1 every k epochs), <strong>cosine</strong> (glide from lr₀ down to 0 along half a cosine wave), <strong>warm-up</strong> (start tiny and rise for the first few hundred steps, so early random-weight gradients do not wreck the model; standard for Transformers), and <strong>reduce-on-plateau</strong> (cut lr when validation loss stops improving).</p>
  <p>Cosine by hand for 40 epochs from lr₀ = 0.05: lr(t) = ½·lr₀·(1 + cos(π·t/40)). At t = 0: 0.05. At t = 20: ½·0.05·(1 + cos 90°) = 0.025. At t = 30: ½·0.05·(1 + cos 135°) = 0.025 × 0.293 = 0.0073. At t = 40: 0.</p>
<div class="fx" data-lang="py">def lr_trace(make_sched, epochs=40, at=(0, 10, 20, 30, 39)):
    opt = torch.optim.Adam([nn.Parameter(torch.zeros(1))], lr=0.05); s = make_sched(opt); out = []
    for t in range(epochs):
        if t in at: out.append(round(opt.param_groups[0]["lr"], 4))
        opt.step(); s.step()
    return out
print("step (x0.1 every 15):", lr_trace(lambda o: torch.optim.lr_scheduler.StepLR(o, step_size=15, gamma=0.1)))
print("cosine over 40:      ", lr_trace(lambda o: torch.optim.lr_scheduler.CosineAnnealingLR(o, T_max=40)))
print("linear warm-up 5:    ", lr_trace(lambda o: torch.optim.lr_scheduler.LinearLR(o, start_factor=0.1, total_iters=5), at=(0, 1, 2, 4, 5)))

for name, make_sched in [("constant lr 0.05", None),
                         ("cosine from 0.05", lambda o: torch.optim.lr_scheduler.CosineAnnealingLR(o, T_max=40))]:
    torch.manual_seed(0); net = mlp(); opt = torch.optim.Adam(net.parameters(), lr=0.05)
    h = fit(net, opt, epochs=40, sched=make_sched(opt) if make_sched else None)
    print(f"{name:17s}| {show(h, [10, 40])} | val loss last 5 epochs {[round(e[1], 3) for e in h[-5:]]}")</div>
  <div class="fx" data-lang="text">step (x0.1 every 15): [0.05, 0.05, 0.005, 0.0005, 0.0005]
cosine over 40:       [0.05, 0.0427, 0.025, 0.0073, 0.0001]
linear warm-up 5:     [0.005, 0.014, 0.023, 0.041, 0.05]
constant lr 0.05 | ep10: tr 0.285 va 0.259 acc 0.920  ep40: tr 0.262 va 0.242 acc 0.925 | val loss last 5 epochs [0.292, 0.259, 0.24, 0.242, 0.242]
cosine from 0.05 | ep10: tr 0.278 va 0.253 acc 0.935  ep40: tr 0.245 va 0.231 acc 0.945 | val loss last 5 epochs [0.23, 0.232, 0.231, 0.231, 0.231]</div>
  <p>The printed learning rates match the hand values (0.025 at epoch 20, 0.0073 at epoch 30). On the delivery network with a deliberately large Adam lr of 0.05, the constant rate keeps jumping around: the last five validation losses wander between 0.24 and 0.29. With cosine decay the same start makes the same fast early progress, then settles: 0.231 for the last five epochs and 0.945 accuracy versus 0.925.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Parking a car. You drive fast down the road, slow down as you near the spot, and creep the last metre. Driving the last metre at road speed means overshooting the spot again and again.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Cosine annealing</strong>: lr(t) = lr_min + ½(lr₀ − lr_min)(1 + cos(πt/T)). <strong>Step decay</strong>: lr = lr₀·γ^⌊t/k⌋. <strong>Warm-up</strong>: lr rises linearly from a small value over the first steps. The scheduler is stepped once per epoch or once per batch, depending on how T was defined.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Calling <code>scheduler.step()</code> before <code>optimizer.step()</code> (PyTorch warns; the first lr is skipped), or stepping a per-epoch scheduler once per batch, which decays the rate 13 times too fast here. Also: a schedule cannot rescue a network that does not learn at all; first make it learn.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: weight initialisation.</b> Our network has 2 hidden layers. Make it 6 layers deep and train with SGD + momentum, and it does not learn at all: validation accuracy sits at 0.52 for 20 epochs. No optimizer or schedule fixes a network whose signal dies before training starts. Why does depth kill it?</div>

  <h2 id="dt-init"><span class="num">04</span>Weight Initialisation: Variance Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Why does a deeper version of the same network fail to learn, and what starting weights prevent it?</p>
  </div>
  <p>First the failure itself: the delivery network with 6 hidden layers, PyTorch's default starting weights, SGD with momentum:</p>
<div class="fx" data-lang="py">torch.manual_seed(0); deep_default = mlp(depth=6)
h = fit(deep_default, torch.optim.SGD(deep_default.parameters(), lr=0.05, momentum=0.9), epochs=20)
print("6 layers, default init |", show(h, [1, 10, 20]))</div>
  <div class="fx" data-lang="text">6 layers, default init | ep1: tr 0.695 va 0.694 acc 0.480  ep10: tr 0.693 va 0.693 acc 0.520  ep20: tr 0.693 va 0.692 acc 0.520</div>
  <p>Validation loss stays at ln 2 = 0.693 and accuracy at 0.52 (always "on time"). The network outputs the same thing for every order. The cause is in the starting weights.</p>
  <h3>The variance, traced</h3>
  <p>One neuron computes z = w₁x₁ + … + wₙxₙ, a sum of n = fan_in terms. If weights and inputs are independent with mean 0, the variance (spread squared) of a sum is the sum of variances, and Var(w·x) = Var(w)·Var(x). So:</p>
  <div class="flow"><span>Var(z) = n · Var(w) · Var(x)</span><span>ReLU keeps half: E[a²] = Var(z)/2</span><span>per layer the signal is multiplied by n·Var(w)/2</span></div>
  <p>Trace it for layers 512 neurons wide (n = 512), input with Var(x) = 1. Each layer multiplies the signal's second moment by the factor n·Var(w)/2, so its spread (std) by the square root of that:</p>
  <table class="tbl"><caption>Per-layer factor, by hand</caption>
    <tr><th>Init</th><th>Var(w)</th><th>n·Var(w)/2</th><th>std factor per layer</th><th>after 10 layers</th></tr>
    <tr><td>std 0.01</td><td>0.0001</td><td>512 × 0.0001/2 = 0.0256</td><td>0.16</td><td>0.16¹⁰ ≈ 1e-8 (dies)</td></tr>
    <tr><td>std 1.0</td><td>1</td><td>256</td><td>16</td><td>16¹⁰ ≈ 1e12 (explodes)</td></tr>
    <tr><td>Xavier</td><td>2/(512 + 512) = 0.00195</td><td>0.5</td><td>0.71</td><td>0.71¹⁰ ≈ 0.03 (fades)</td></tr>
    <tr><td>He</td><td>2/512 = 0.0039</td><td>1</td><td>1</td><td>1 (steady)</td></tr>
  </table>
  <p>He initialisation is exactly "choose Var(w) so the factor is 1": n·Var(w)/2 = 1 → Var(w) = 2/n. The 2 is there because ReLU zeroes half of its inputs. Xavier (Glorot) was derived for tanh, which keeps both halves: it balances the forward pass (wants 1/fan_in) and the backward pass (wants 1/fan_out) with 2/(fan_in + fan_out). Measure it: feed the 1,000 delivery orders through a first layer, then 10 more layers 512 wide, and record the spread after each:</p>
<div class="fx" data-lang="py">x0 = (X - X.mean(0)) / X.std(0)                        # standardised orders, (1000, 2)
torch.manual_seed(0); W0 = torch.empty(512, 2); nn.init.kaiming_normal_(W0, nonlinearity="relu")
h0 = torch.relu(x0 @ W0.T); h0 = h0 / h0.std()          # first layer, spread scaled to 1: (1000, 512)
for name, init in [("std=0.01", lambda w: nn.init.normal_(w, std=0.01)),
                   ("std=1.0",  lambda w: nn.init.normal_(w, std=1.0)),
                   ("Xavier",   nn.init.xavier_normal_),
                   ("He",       lambda w: nn.init.kaiming_normal_(w, nonlinearity="relu"))]:
    torch.manual_seed(0); h = h0; stds = []
    for i in range(10):
        W = torch.empty(512, 512); init(W); h = torch.relu(h @ W.T); stds.append(h.std().item())
    print(f"{name:9s} layer1={stds[0]:.3g} layer5={stds[4]:.3g} layer10={stds[9]:.3g}")</div>
  <div class="fx" data-lang="text">std=0.01  layer1=0.154 layer5=9.85e-05 layer10=1.01e-08
std=1.0   layer1=15.4 layer5=9.85e+05 layer10=1.01e+12
Xavier    layer1=0.679 layer5=0.166 layer10=0.0287
He        layer1=0.96 layer5=0.939 layer10=0.919</div>
  <p>The measured spreads follow the hand table: std 0.01 dies, std 1.0 explodes, Xavier fades under ReLU, He holds steady. Gradients flow back through the same weights, so they vanish or explode in the same way (the vanishing-gradient experiment in <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>).</p>
  <h3>Why not all zeros (or all the same)?</h3>
  <p>If every weight in a layer starts equal, every neuron in it computes the same output, gets the same gradient, and makes the same update: they stay identical copies forever. Train a 2 → 4 → 1 delivery network on the four orders from all-0.5 weights:</p>
<div class="fx" data-lang="py">X4 = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]]); y4 = torch.tensor([0., 1., 1., 0.])
sym = nn.Sequential(nn.Linear(2, 4), nn.Tanh(), nn.Linear(4, 1))
for prm in sym.parameters(): nn.init.constant_(prm, 0.5)
opt = torch.optim.SGD(sym.parameters(), lr=0.5)
for _ in range(200):
    opt.zero_grad(); F.binary_cross_entropy_with_logits(sym(X4).squeeze(1), y4).backward(); opt.step()
print(sym[0].weight.data.round(decimals=3))
print("P(late) A-D:", [round(v, 3) for v in torch.sigmoid(sym(X4)).squeeze(1).tolist()])</div>
  <div class="fx" data-lang="text">tensor([[1.4000, 1.4000],
        [1.4000, 1.4000],
        [1.4000, 1.4000],
        [1.4000, 1.4000]])
P(late) A-D: [0.155, 0.615, 0.615, 0.671]</div>
  <p>Four hidden neurons, four identical rows after 200 steps: the layer is effectively one neuron, so it cannot learn XOR (it needs at least two different hidden features). Random starting values break this symmetry. Now apply He initialisation to the deep network that was stuck:</p>
<div class="fx" data-lang="py">def he_init(m):
    if isinstance(m, nn.Linear):
        nn.init.kaiming_normal_(m.weight, nonlinearity="relu"); nn.init.zeros_(m.bias)
torch.manual_seed(0); deep_he = mlp(depth=6); deep_he.apply(he_init)      # .apply visits every layer
h = fit(deep_he, torch.optim.SGD(deep_he.parameters(), lr=0.05, momentum=0.9), epochs=20)
print("6 layers, He init      |", show(h, [1, 10, 20]))
print("default nn.Linear(32,32) weight std:", round(nn.Linear(32, 32).weight.std().item(), 3),
      " He would be:", round((2 / 32) ** 0.5, 3))</div>
  <div class="fx" data-lang="text">6 layers, He init      | ep1: tr 0.631 va 0.568 acc 0.725  ep10: tr 0.411 va 0.368 acc 0.830  ep20: tr 0.265 va 0.266 acc 0.910
default nn.Linear(32,32) weight std: 0.102  He would be: 0.25</div>
  <p>Same network, same optimizer, only the starting weights changed: it now learns, reaching 0.91 by epoch 20. The last line explains the original failure: <code>nn.Linear</code>'s default draws from U(±1/√fan_in), a standard deviation of about 1/√(3·fan_in) = 0.10 for fan_in 32, versus He's 0.25. That factor of about 2.5 per layer, compounded over 6 layers, shrank the signal to almost nothing.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A chain of PA speakers down a long hall, each re-amplifying the previous one. Set each volume a bit too low and the far end hears silence; a bit too high and it screeches. Initialisation sets every speaker to "pass it on at the same volume".</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Xavier/Glorot</strong>: Var(w) = 2/(fan_in + fan_out), for tanh/sigmoid. <strong>He/Kaiming</strong>: Var(w) = 2/fan_in, for ReLU-family. Biases usually start at 0. Both keep the variance of activations (and gradients) roughly constant across layers at the start of training.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Assuming PyTorch's default is He. It is not (it is a uniform with variance 1/(3·fan_in)). It is fine for shallow nets; for deep plain ReLU stacks apply <code>kaiming_normal_</code> yourself with <code>model.apply(init_fn)</code>, or add normalisation layers.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: batch normalisation.</b> Good initialisation fixes the scale at step 0. But training changes the weights, so each layer's inputs drift in scale and centre as the layers before it learn. Can we keep every layer's inputs well-scaled throughout training, not just at the start?</div>

  <h2 id="dt-bn"><span class="num">05</span>Batch Normalisation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Initialisation sets a good scale once. How do we keep each layer's inputs centred and well-scaled while all the layers before it keep changing?</p>
  </div>
  <p>Look at the raw delivery features: distance in km (0–10) and rain in mm/h (0–20). Two columns on different scales. Before comparing them you would <strong>standardise</strong>: subtract the mean, divide by the standard deviation. Inside a deep network the same problem appears at every layer, and it moves: layer 5 receives layer 4's outputs, whose scale shifts as layer 4 learns. <strong>Batch normalisation (BN)</strong> standardises each neuron's values over the current mini-batch, then multiplies by a learnable γ and adds a learnable β so the network can still choose any scale it needs.</p>
  <div class="flow"><span>z (batch)</span><span>− μ_B</span><span>÷ √(σ²_B + ε)</span><span>× γ + β</span><span>activation</span></div>
  <p>By hand on our four orders in real units: A (1 km, 0 mm), B (1 km, 15 mm), C (9 km, 0 mm), D (9 km, 15 mm). Distance column [1, 1, 9, 9]: mean 5, each value is 4 away, so std 4 and the column becomes [−1, −1, 1, 1]. Rain column [0, 15, 0, 15]: mean 7.5, std 7.5 → [−1, 1, −1, 1]. Two very different scales, one common one.</p>
<div class="fx" data-lang="py">bn = nn.BatchNorm1d(2)
xb = torch.tensor([[1., 0.], [1., 15.], [9., 0.], [9., 15.]])     # orders A-D in km and mm/h
bn.train(); out = bn(xb)
print(out.detach().round(decimals=3))
print("running_mean", bn.running_mean.tolist(), " running_var", [round(v, 3) for v in bn.running_var.tolist()])
print("learnable:", [n for n, _ in bn.named_parameters()], " saved stats:", [n for n, _ in bn.named_buffers()])
bn.eval(); print("eval mode, order D alone:", [round(v, 3) for v in bn(xb[3:]).detach()[0].tolist()])</div>
  <div class="fx" data-lang="text">tensor([[-1., -1.],
        [-1.,  1.],
        [ 1., -1.],
        [ 1.,  1.]])
running_mean [0.5, 0.75]  running_var [3.033, 8.4]
learnable: ['weight', 'bias']  saved stats: ['running_mean', 'running_var', 'num_batches_tracked']
eval mode, order D alone: [4.88, 4.917]</div>
  <p>The output matches the hand values (to 3 decimals; ε = 1e-5 shaves a hair off). The <code>running_mean</code> line answers a key question: at prediction time there may be one order at a time, with no batch to average over. So BN keeps running averages of the means and variances it saw during training (each batch moves them 10% of the way: 0 → 0.1 × 5 = 0.5 for distance). The running variances, by hand: distance values sit ±4 from the mean, so the unbiased variance is 4·16/3 = 21.33, and 0.9 × 1 + 0.1 × 21.33 = 3.033. In <code>eval()</code> mode those saved values are used, so order D alone becomes (9 − 0.5)/√3.033 = 4.88 for distance: after only one batch the running averages are still far from the true ones, which is why BN needs many training batches before its eval mode is trustworthy. <code>weight</code> and <code>bias</code> are γ and β.</p>
  <p>Now the 6-layer network that was stuck at 0.52 with default init, with a BatchNorm after each hidden Linear and nothing else changed:</p>
<div class="fx" data-lang="py">torch.manual_seed(0); deep_bn = mlp(depth=6, bn=True)
h = fit(deep_bn, torch.optim.SGD(deep_bn.parameters(), lr=0.05, momentum=0.9), epochs=20)
print("6 layers, default init + BatchNorm |", show(h, [1, 10, 20]))</div>
  <div class="fx" data-lang="text">6 layers, default init + BatchNorm | ep1: tr 0.486 va 0.647 acc 0.645  ep10: tr 0.320 va 0.293 acc 0.895  ep20: tr 0.272 va 0.237 acc 0.930</div>
  <p>It learns from the first epoch and reaches 0.93, without touching the initialisation. BN makes the network much less sensitive to starting weights and allows higher learning rates. Why it helps so much is still debated (the original "internal covariate shift" story is disputed; a smoother loss surface is the better-supported explanation), but the effect is reliable.</p>
  <ul>
    <li><strong>Placement:</strong> Linear/Conv → BN → ReLU. The layer before BN can drop its bias, since β replaces it.</li>
    <li><strong>LayerNorm</strong> standardises across the features of one example instead of across the batch. It does not depend on batch size: the choice for Transformers, RNNs and tiny batches.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two school boards, one marking out of 100 and one out of 500. Converting every score to "how far above the board's average, in units of spread" makes them comparable. BN does that at every layer, every batch, and then lets the layer pick its own preferred scale (γ, β).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>BatchNorm</strong>: ẑ = (z − μ_B)/√(σ²_B + ε), output γẑ + β, per feature, with μ_B and σ²_B from the current batch in training and from running averages (momentum 0.1) in evaluation. γ, β are learned.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting <code>model.eval()</code> before validation: BN then uses the validation batch's own statistics and results depend on what else is in the batch. With batches of 1–4, batch statistics are noise: use LayerNorm/GroupNorm. A final training batch of size 1 makes BN fail outright (use <code>drop_last=True</code>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: overfitting and regularisation.</b> The network now trains reliably. With 800 orders it generalises well. But data is often scarce and noisy. With only 200 orders, 10% of them mislabelled, a big network will happily learn the mistakes too. How do we see that, and stop it?</div>

  <h2 id="dt-reg"><span class="num">06</span>Overfitting &amp; Regularisation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A network with tens of thousands of weights and 200 training orders can memorise every one, including the 20 with wrong labels. How do we detect that, and how do we make it learn the pattern instead?</p>
  </div>
  <p>A student who memorises last year's question paper scores 100 on that paper and fails the real exam. That is <strong>overfitting</strong>: the training loss keeps falling while the loss on new data rises. <strong>Regularisation</strong> is any technique that makes memorising harder so the model must learn the general pattern; it usually costs a little training accuracy and gains more on new data (theory in <a class="xref" data-note="ml_regularization">Regularization</a>).</p>
  <p>Make it happen: 200 training orders with 10% flipped labels, a big network (2 → 128 → 128 → 1, about 17,000 weights), full-batch AdamW for 600 epochs, validated on 1,000 fresh orders:</p>
<div class="fx" data-lang="py">Xs, ys = make_orders(200, noise=0.1, seed=1)          # small, noisy training set
Xbig, ybig = make_orders(1000, noise=0.1, seed=2)      # fresh orders to validate on
def overfit_run(wd=0.0, p=0.0, epochs=600):
    torch.manual_seed(0); net = mlp(hidden=128, p=p)
    opt = torch.optim.AdamW(net.parameters(), lr=1e-2, weight_decay=wd)
    h = fit(net, opt, epochs, Xt=Xs, yt=ys, bs=200, Xv=Xbig, yv=ybig)
    best = min(range(epochs), key=lambda e: h[e][1])
    return net, h, best
net0, h_over, best0 = overfit_run()
print("params:", sum(q.numel() for q in net0.parameters()))
print("no regularisation |", show(h_over, [19, 100, 600]))
print(f"best val loss {h_over[best0][1]:.3f} at epoch {best0 + 1}; final train acc {evaluate(net0, Xs, ys)[1]:.3f}")</div>
  <div class="fx" data-lang="text">params: 17025
no regularisation | ep19: tr 0.369 va 0.436 acc 0.863  ep100: tr 0.291 va 0.447 acc 0.870  ep600: tr 0.180 va 0.742 acc 0.856
best val loss 0.436 at epoch 19; final train acc 0.930</div>
  <p>Read the three columns. At epoch 19 the validation loss is at its best (0.436; training 0.37). Then training loss keeps falling (0.18 by epoch 600, with 93% training accuracy on labels of which 10% are wrong) while validation loss climbs to 0.742: the network is bending its boundary around the mislabelled training orders. Validation accuracy drops less (it only counts right/wrong), but the model has become confidently wrong on many orders, which is exactly what the loss punishes.</p>
  <h3>Weight decay (L2)</h3>
  <p>Add a penalty λ·Σw² to the loss: big weights now cost something, and sharp, twisted boundaries need big weights. In the update this becomes "shrink every weight a little each step": w ← w − lr·(g + 2λw), or with AdamW's decoupled form, w ← w − lr·λ·w after the Adam step. By hand: lr 0.01, λ = 1 (AdamW's weight_decay), a weight 0.8 loses 0.01 × 1 × 0.8 = 0.008 per step before the gradient step.</p>
  <h3>L1</h3>
  <p>A penalty λ·Σ|w| pulls every weight toward 0 with the same force regardless of size, so weights that do not help end up at (or near) exactly 0: a built-in feature selector (geometry in <a class="xref" data-note="ml_regularization">Regularization</a>). Add three junk columns (random numbers unrelated to lateness) to the 200 orders and compare the first layer's average |weight| per input column:</p>
<div class="fx" data-lang="py">g = torch.Generator().manual_seed(5)
Xj = torch.cat([Xs, torch.rand(200, 3, generator=g)], 1)       # far, rain, junk1, junk2, junk3
for name, lam in [("no penalty", 0.0), ("L1 penalty", 0.01)]:
    torch.manual_seed(0); net = mlp(hidden=64, d_in=5); opt = torch.optim.AdamW(net.parameters(), lr=1e-2, weight_decay=0.0)
    for _ in range(300):
        opt.zero_grad()
        loss = F.binary_cross_entropy_with_logits(net(Xj).squeeze(1), ys) + lam * net[0].weight.abs().sum()
        loss.backward(); opt.step()
    print(f"{name}: mean |w| per input (far, rain, junk1-3):", [round(v, 3) for v in net[0].weight.abs().mean(0).tolist()])</div>
  <div class="fx" data-lang="text">no penalty: mean |w| per input (far, rain, junk1-3): [0.355, 0.435, 0.327, 0.234, 0.216]
L1 penalty: mean |w| per input (far, rain, junk1-3): [0.034, 0.04, 0.012, 0.009, 0.008]</div>
  <p>Without a penalty the junk columns get weights almost as large as the real ones (0.22–0.33 vs 0.36–0.44). With L1, everything shrinks, but the junk columns shrink much more: about a quarter of the real columns' size. (Plain gradient steps on |w| only jitter around 0; exact zeros need a soft-threshold step, as Lasso solvers do.)</p>
  <h3>Dropout</h3>
  <p>In a group project, if one strong student always does the work, the rest learn nothing. <strong>Dropout</strong> switches off a random fraction p of a layer's neurons at every training step (a different set each time), so no neuron can rely on a particular partner; the network learns several redundant ways to reach the answer. The survivors are scaled by 1/(1 − p) so the next layer receives the same total on average; at evaluation time dropout is switched off.</p>
<div class="fx" data-lang="py">drop = nn.Dropout(p=0.5); ones = torch.ones(8)
torch.manual_seed(0)
drop.train(); print("train:", drop(ones).tolist())
drop.eval();  print("eval: ", drop(ones).tolist())</div>
  <div class="fx" data-lang="text">train: [0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 2.0, 2.0]
eval:  [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]</div>
  <p>Eight values of 1.0 in; in training mode some came out 0 (dropped) and the rest 2.0 = 1/(1 − 0.5); in eval mode everything passes unchanged. This is <strong>inverted dropout</strong>: the scaling happens in training, so prediction needs no adjustment.</p>
  <h3>Early stopping, and all of them compared</h3>
  <p><strong>Early stopping</strong> is the simplest regulariser: watch validation loss every epoch, keep a copy of the weights at its best, and stop when it has not improved for a while (the patience). Here it means keeping the epoch-19 model. All four on the same 200 orders:</p>
<div class="fx" data-lang="py">print(f"{'method':22s} final val loss   final acc   best val loss (epoch)")
for name, kw in [("none", {}), ("weight decay 1.0", {"wd": 1.0}), ("dropout 0.3", {"p": 0.3})]:
    _, h, b = overfit_run(**kw)
    print(f"{name:22s} {h[-1][1]:.3f}            {h[-1][2]:.3f}       {h[b][1]:.3f} ({b + 1})")
print(f"{'early stopping':22s} {h_over[best0][1]:.3f}            {h_over[best0][2]:.3f}       (keeps epoch {best0 + 1} of the 'none' run)")</div>
  <div class="fx" data-lang="text">method                 final val loss   final acc   best val loss (epoch)
none                   0.742            0.856       0.436 (19)
weight decay 1.0       0.414            0.873       0.414 (429)
dropout 0.3            0.501            0.874       0.426 (65)
early stopping         0.436            0.863       (keeps epoch 19 of the 'none' run)</div>
  <p>Without regularisation the final model is the worst (val loss 0.742). Weight decay keeps it near its best for the whole run (0.414 at the end, its best); dropout removes most of the damage (0.501 at the end, best 0.426); early stopping simply keeps the best moment of the unregularised run (0.436). In practice they are combined: modest weight decay, dropout in fully connected layers, and always keep the best-validation checkpoint. More data, when available, beats all of them.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Weight decay is a tax on complexity. Dropout is an office where random people are on leave each day, so everyone learns to cover. Early stopping is handing in the exam when your answers are best, before second-guessing makes them worse.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Overfitting</strong>: training loss falls while validation loss rises. <strong>L2 / weight decay</strong>: loss + λΣw² (or decoupled shrink w ← w − lr·λ·w). <strong>L1</strong>: loss + λΣ|w|. <strong>Dropout(p)</strong>: in training, zero each unit with probability p and scale survivors by 1/(1 − p); identity in eval. <strong>Early stopping</strong>: return the parameters with the best validation loss.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting <code>model.eval()</code> at prediction: dropout stays on and the same order gets a different P(late) each call. And tuning the regularisation strength on the test set: tune on validation, report the test set once.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: diagnosing a run from its loss curves.</b> We now have a toolbox: optimizer, schedule, init, BN, three regularisers. In a real project nobody tells you which problem you have. How do you read it off your own training run?</div>

  <h2 id="dt-loop"><span class="num">07</span>A Full Training Loop, Diagnosed</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given one training run, how do you tell whether it is healthy, too slow, unstable or overfitting, and which tool from this note to reach for?</p>
  </div>
  <p>The recipe that puts the whole note together on the 800/200 delivery orders: AdamW (lr 1e-2, small weight decay), cosine schedule, gradient clipping at norm 1 (cheap insurance against spikes), and early stopping by keeping the best validation checkpoint. No He init: this network is only 2 hidden layers deep, and on it PyTorch's default init works better (we measured He at 0.895 validation accuracy after 40 epochs vs 0.95 with the default). Initialisation tricks are for the problem they solve, deep stacks. Then three deliberately bad variants for comparison:</p>
<div class="fx" data-lang="py">import copy
def full_run(lr=1e-2, epochs=40, wd=1e-4, Xt=Xtr, yt=ytr, hidden=32, bs=64, Xv=None, yv=None):
    torch.manual_seed(0); net = mlp(hidden=hidden)                     # default init is fine at depth 2
    opt = torch.optim.AdamW(net.parameters(), lr=lr, weight_decay=wd)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)
    h = fit(net, opt, epochs, Xt=Xt, yt=yt, bs=bs, sched=sched, clip=1.0, Xv=Xv, yv=yv)
    return net, h

net_good, h_good = full_run()
best = min(range(len(h_good)), key=lambda e: h_good[e][1])
print("healthy    |", show(h_good, [1, 10, 40]), f"| best epoch {best + 1}: val {h_good[best][1]:.3f} acc {h_good[best][2]:.3f}")
_, h_high = full_run(lr=0.5);  print("lr too high|", show(h_high, [1, 10, 40]))
_, h_low = full_run(lr=1e-4);  print("lr too low |", show(h_low, [1, 10, 40]))
print("overfitting|", show(h_over, [19, 100, 600]), "(200-order run, section 06)")</div>
  <div class="fx" data-lang="text">healthy    | ep1: tr 0.689 va 0.679 acc 0.545  ep10: tr 0.291 va 0.276 acc 0.950  ep40: tr 0.266 va 0.251 acc 0.950 | best epoch 27: val 0.250 acc 0.945
lr too high| ep1: tr 2.251 va 0.707 acc 0.480  ep10: tr 0.697 va 0.694 acc 0.520  ep40: tr 0.693 va 0.693 acc 0.520
lr too low | ep1: tr 0.695 va 0.694 acc 0.520  ep10: tr 0.691 va 0.690 acc 0.520  ep40: tr 0.687 va 0.687 acc 0.520
overfitting| ep19: tr 0.369 va 0.436 acc 0.863  ep100: tr 0.291 va 0.447 acc 0.870  ep600: tr 0.180 va 0.742 acc 0.856 (200-order run, section 06)</div>

  <figure class="viz"><svg viewBox="0 0 680 175" width="680">
<rect x="10" y="30" width="150" height="110" fill="none" stroke="currentColor" opacity="0.25"/><line x1="10" y1="55" x2="160" y2="55" stroke="currentColor" stroke-dasharray="2 3" opacity="0.4"/><polyline points="10,56 14,59 18,68 22,81 25,94 29,100 33,100 37,102 41,104 45,104 48,105 52,105 56,105 60,106 64,106 68,106 72,106 75,106 79,107 83,107 87,106 91,107 95,107 98,107 102,107 106,107 110,107 114,107 118,107 122,107 125,107 129,107 133,107 137,107 141,107 145,107 148,107 152,108 156,108 160,108" fill="none" class="sb" stroke-width="1.8"/><polyline points="10,57 14,62 18,73 22,88 25,98 29,100 33,105 37,104 41,105 45,106 48,107 52,107 56,107 60,108 64,108 68,108 72,108 75,108 79,109 83,109 87,109 91,109 95,109 98,109 102,109 106,109 110,109 114,109 118,109 122,109 125,109 129,109 133,109 137,109 141,109 145,109 148,109 152,109 156,109 160,109" fill="none" class="sr" stroke-width="1.8"/><text x="85" y="158" text-anchor="middle" font-size="11.5">healthy</text><rect x="180" y="30" width="150" height="110" fill="none" stroke="currentColor" opacity="0.25"/><line x1="180" y1="55" x2="330" y2="55" stroke="currentColor" stroke-dasharray="2 3" opacity="0.4"/><polyline points="180,30 184,54 188,51 192,54 195,54 199,55 203,54 207,55 211,55 215,55 218,54 222,54 226,54 230,55 234,55 238,55 242,55 245,55 249,55 253,55 257,55 261,55 265,55 268,55 272,55 276,55 280,55 284,55 288,55 292,55 295,55 299,55 303,55 307,55 311,55 315,55 318,55 322,55 326,55 330,55" fill="none" class="sb" stroke-width="1.8"/><polyline points="180,54 184,50 188,52 192,55 195,55 199,55 203,55 207,55 211,55 215,55 218,55 222,54 226,55 230,55 234,55 238,54 242,55 245,55 249,55 253,55 257,55 261,55 265,55 268,55 272,55 276,55 280,55 284,55 288,55 292,55 295,55 299,55 303,55 307,55 311,55 315,55 318,55 322,55 326,55 330,55" fill="none" class="sr" stroke-width="1.8"/><text x="255" y="158" text-anchor="middle" font-size="11.5">lr too high (0.5)</text><rect x="350" y="30" width="150" height="110" fill="none" stroke="currentColor" opacity="0.25"/><line x1="350" y1="55" x2="500" y2="55" stroke="currentColor" stroke-dasharray="2 3" opacity="0.4"/><polyline points="350,55 354,55 358,55 362,55 365,55 369,55 373,55 377,55 381,56 385,56 388,56 392,56 396,56 400,56 404,56 408,56 412,56 415,56 419,56 423,56 427,56 431,56 435,56 438,56 442,56 446,56 450,56 454,56 458,56 462,56 465,56 469,56 473,56 477,56 481,56 485,56 488,56 492,56 496,56 500,56" fill="none" class="sb" stroke-width="1.8"/><polyline points="350,55 354,55 358,55 362,55 365,55 369,56 373,56 377,56 381,56 385,56 388,56 392,56 396,56 400,56 404,56 408,56 412,56 415,56 419,56 423,56 427,56 431,56 435,56 438,56 442,56 446,56 450,56 454,56 458,56 462,56 465,56 469,56 473,56 477,56 481,56 485,56 488,56 492,56 496,56 500,56" fill="none" class="sr" stroke-width="1.8"/><text x="425" y="158" text-anchor="middle" font-size="11.5">lr too low (1e-4)</text><rect x="520" y="30" width="150" height="110" fill="none" stroke="currentColor" opacity="0.25"/><line x1="520" y1="55" x2="670" y2="55" stroke="currentColor" stroke-dasharray="2 3" opacity="0.4"/><polyline points="520,55 520,53 521,57 521,56 521,59 521,60 522,62 522,64 522,67 522,69 523,72 523,75 523,79 523,82 524,85 524,88 524,91 524,93 525,95 525,96 525,97 525,98 526,98 526,98 526,98 526,98 527,98 527,98 527,99 527,99 528,99 528,99 528,99 528,99 529,99 529,99 529,99 529,100 530,100 530,100 530,100 530,100 531,100 531,100 531,101 531,101 532,101 532,101 532,101 532,101 533,101 533,101 533,101 533,101 534,101 534,102 534,102 534,102 535,102 535,102 535,102 535,102 536,102 536,102 536,102 536,102 537,102 537,102 537,102 537,102 538,103 538,102 538,102 538,103 539,103 539,103 539,103 539,103 540,103 540,103 540,103 540,103 541,104 541,103 541,104 541,104 542,104 542,104 542,104 542,104 543,104 543,104 543,104 543,104 544,104 544,104 544,104 544,104 545,104 545,104 545,105 545,105 546,105 546,105 546,105 546,105 547,105 547,105 547,105 547,105 548,105 548,105 548,105 548,105 549,105 549,105 549,105 549,105 550,106 550,106 550,106 550,106 551,106 551,106 551,106 551,106 552,105 552,105 552,105 552,106 553,106 553,106 553,105 553,106 554,106 554,106 554,106 554,107 555,106 555,106 555,106 555,107 556,107 556,106 556,107 556,107 557,107 557,107 557,107 557,107 558,107 558,107 558,107 558,107 559,107 559,108 559,108 559,108 560,108 560,108 560,108 560,108 561,108 561,108 561,108 561,108 562,108 562,108 562,108 562,108 563,107 563,107 563,107 563,108 564,108 564,108 564,108 564,108 565,108 565,109 565,109 565,108 566,108 566,109 566,109 566,109 567,109 567,109 567,109 567,109 568,109 568,109 568,109 568,109 569,109 569,109 569,109 569,109 570,109 570,109 570,109 570,110 571,110 571,110 571,110 571,109 572,109 572,109 572,110 572,110 573,110 573,110 573,110 573,110 574,110 574,110 574,110 574,110 575,110 575,110 575,110 575,110 576,110 576,110 576,110 576,110 577,110 577,110 577,110 577,110 578,111 578,111 578,111 578,111 579,110 579,110 579,110 579,110 580,111 580,111 580,111 580,111 581,111 581,110 581,111 581,111 582,111 582,111 582,111 582,111 583,111 583,111 583,111 583,111 584,112 584,112 584,112 584,111 585,111 585,111 585,112 585,112 586,112 586,112 586,112 586,112 587,112 587,111 587,111 587,111 588,111 588,112 588,112 588,112 589,112 589,111 589,112 589,112 590,112 590,112 590,112 590,112 591,112 591,112 591,112 591,112 592,113 592,113 592,112 592,112 593,112 593,112 593,112 593,112 594,113 594,113 594,113 594,113 595,113 595,113 595,113 595,113 596,113 596,112 596,112 596,112 597,111 597,112 597,113 597,113 598,113 598,112 598,112 598,112 599,113 599,113 599,113 599,113 600,113 600,113 600,113 600,113 601,113 601,114 601,114 601,113 602,113 602,113 602,113 602,113 603,113 603,113 603,113 603,113 604,114 604,114 604,114 604,114 605,114 605,114 605,114 605,114 606,114 606,114 606,113 606,113 607,113 607,113 607,113 607,114 608,114 608,114 608,114 608,114 609,114 609,113 609,113 609,113 610,114 610,114 610,114 610,114 611,114 611,114 611,114 611,114 612,114 612,114 612,115 612,115 613,115 613,114 613,114 613,114 614,114 614,113 614,114 614,114 615,115 615,115 615,115 615,115 616,114 616,114 616,114 616,114 617,114 617,114 617,114 617,115 618,115 618,115 618,115 618,114 619,114 619,114 619,114 619,114 620,115 620,115 620,115 620,115 621,114 621,115 621,115 621,115 622,115 622,115 622,115 622,115 623,115 623,115 623,115 623,115 624,115 624,115 624,115 624,114 625,114 625,112 625,113 625,114 626,115 626,116 626,115 626,115 627,115 627,115 627,116 627,115 628,116 628,116 628,116 628,116 629,116 629,116 629,116 629,116 630,116 630,116 630,116 630,115 631,115 631,114 631,114 631,114 632,115 632,116 632,116 632,116 633,115 633,115 633,115 633,116 634,116 634,116 634,116 634,116 635,116 635,116 635,116 635,116 636,116 636,116 636,116 636,116 637,116 637,116 637,116 637,116 638,116 638,116 638,115 638,115 639,112 639,114 639,114 639,116 640,116 640,113 640,115 640,116 641,116 641,116 641,114 641,115 642,116 642,116 642,116 642,116 643,116 643,117 643,116 643,116 644,116 644,117 644,117 644,117 645,117 645,117 645,117 645,117 646,117 646,117 646,117 646,117 647,117 647,117 647,117 647,117 648,117 648,117 648,117 648,117 649,117 649,117 649,117 649,117 650,117 650,117 650,116 650,116 651,115 651,116 651,116 651,117 652,117 652,117 652,116 652,116 653,116 653,117 653,117 653,117 654,117 654,117 654,117 654,117 655,117 655,117 655,116 655,117 656,117 656,117 656,118 656,117 657,117 657,117 657,117 657,117 658,117 658,117 658,117 658,117 659,117 659,118 659,118 659,118 660,118 660,118 660,118 660,118 661,118 661,118 661,117 661,117 662,115 662,115 662,115 662,117 663,118 663,118 663,117 663,116 664,116 664,115 664,116 664,118 665,117 665,117 665,116 665,117 666,118 666,117 666,118 666,117 667,118 667,118 667,118 667,118 668,118 668,118 668,118 668,118 669,118 669,118 669,118 669,118 670,118 670,118" fill="none" class="sb" stroke-width="1.8"/><polyline points="520,53 520,57 521,56 521,59 521,60 521,61 522,63 522,66 522,68 522,70 523,73 523,76 523,78 523,81 524,83 524,85 524,86 524,86 525,87 525,86 525,86 525,85 526,85 526,84 526,83 526,83 527,83 527,83 527,83 527,83 528,83 528,83 528,83 528,83 529,84 529,84 529,84 529,84 530,84 530,84 530,84 530,85 531,85 531,85 531,85 531,85 532,85 532,85 532,85 532,85 533,85 533,85 533,86 533,85 534,86 534,86 534,86 534,86 535,86 535,86 535,86 535,86 536,86 536,86 536,86 536,86 537,85 537,85 537,85 537,86 538,85 538,85 538,86 538,85 539,85 539,86 539,85 539,85 540,85 540,85 540,85 540,85 541,85 541,85 541,85 541,85 542,85 542,85 542,85 542,85 543,85 543,85 543,85 543,85 544,85 544,85 544,85 544,85 545,85 545,85 545,85 545,85 546,85 546,85 546,85 546,85 547,85 547,85 547,85 547,85 548,85 548,85 548,85 548,85 549,85 549,85 549,85 549,85 550,85 550,85 550,85 550,85 551,85 551,85 551,84 551,84 552,83 552,84 552,84 552,85 553,84 553,83 553,85 553,85 554,84 554,85 554,85 554,84 555,85 555,84 555,85 555,85 556,84 556,85 556,85 556,84 557,85 557,84 557,85 557,85 558,84 558,84 558,84 558,84 559,84 559,84 559,84 559,84 560,84 560,84 560,84 560,84 561,84 561,84 561,84 561,84 562,84 562,83 562,84 562,82 563,83 563,82 563,83 563,83 564,83 564,83 564,83 564,84 565,83 565,83 565,83 565,83 566,83 566,83 566,83 566,83 567,83 567,83 567,83 567,83 568,83 568,83 568,83 568,82 569,83 569,82 569,83 569,81 570,82 570,81 570,83 570,83 571,82 571,82 571,81 571,82 572,81 572,82 572,82 572,82 573,82 573,81 573,82 573,81 574,82 574,81 574,82 574,82 575,82 575,82 575,81 575,81 576,81 576,81 576,80 576,81 577,80 577,81 577,80 577,81 578,81 578,80 578,81 578,79 579,80 579,79 579,80 579,80 580,80 580,80 580,80 580,80 581,78 581,80 581,79 581,80 582,79 582,79 582,79 582,78 583,79 583,78 583,79 583,79 584,79 584,79 584,78 584,79 585,78 585,78 585,78 585,78 586,78 586,78 586,78 586,77 587,78 587,76 587,77 587,75 588,77 588,77 588,77 588,77 589,76 589,77 589,76 589,77 590,77 590,76 590,77 590,75 591,76 591,75 591,76 591,76 592,76 592,77 592,75 592,76 593,75 593,76 593,75 593,75 594,75 594,75 594,75 594,75 595,75 595,75 595,76 595,74 596,75 596,73 596,74 596,71 597,74 597,73 597,74 597,74 598,72 598,73 598,72 598,74 599,73 599,73 599,74 599,73 600,73 600,72 600,73 600,73 601,73 601,73 601,72 601,73 602,72 602,73 602,71 602,72 603,71 603,72 603,71 603,71 604,72 604,72 604,72 604,71 605,72 605,71 605,72 605,70 606,71 606,70 606,71 606,68 607,70 607,68 607,71 607,70 608,70 608,70 608,69 608,70 609,67 609,69 609,67 609,70 610,69 610,69 610,70 610,69 611,70 611,67 611,69 611,68 612,69 612,68 612,68 612,69 613,68 613,69 613,67 613,68 614,66 614,68 614,66 614,67 615,67 615,68 615,68 615,66 616,68 616,66 616,67 616,65 617,67 617,66 617,67 617,66 618,66 618,66 618,65 618,66 619,63 619,65 619,64 619,66 620,65 620,65 620,66 620,65 621,66 621,63 621,65 621,65 622,65 622,65 622,64 622,65 623,65 623,65 623,64 623,64 624,64 624,65 624,62 624,62 625,58 625,62 625,60 625,62 626,63 626,63 626,64 626,62 627,63 627,63 627,64 627,63 628,62 628,63 628,63 628,63 629,62 629,62 629,62 629,63 630,62 630,62 630,61 630,62 631,59 631,61 631,57 631,61 632,60 632,61 632,61 632,59 633,61 633,59 633,61 633,61 634,61 634,61 634,59 634,60 635,59 635,61 635,60 635,60 636,60 636,60 636,60 636,59 637,59 637,59 637,60 637,59 638,59 638,57 638,59 638,52 639,58 639,55 639,58 639,58 640,54 640,58 640,57 640,58 641,58 641,55 641,59 641,57 642,57 642,58 642,56 642,58 643,57 643,56 643,58 643,57 644,58 644,57 644,57 644,58 645,57 645,58 645,56 645,57 646,57 646,56 646,57 646,56 647,57 647,56 647,57 647,56 648,56 648,56 648,56 648,55 649,56 649,55 649,56 649,55 650,56 650,53 650,55 650,51 651,54 651,52 651,55 651,55 652,54 652,55 652,52 652,55 653,53 653,55 653,54 653,54 654,55 654,53 654,55 654,52 655,54 655,52 655,54 655,53 656,53 656,54 656,53 656,54 657,52 657,53 657,51 657,54 658,51 658,53 658,52 658,53 659,52 659,52 659,52 659,52 660,52 660,52 660,52 660,52 661,52 661,50 661,51 661,47 662,51 662,46 662,50 662,50 663,51 663,51 663,48 663,50 664,47 664,51 664,50 664,48 665,50 665,48 665,51 665,49 666,48 666,51 666,50 666,51 667,49 667,49 667,50 667,49 668,50 668,48 668,49 668,49 669,49 669,48 669,48 669,50 670,49 670,49" fill="none" class="sr" stroke-width="1.8"/><text x="595" y="158" text-anchor="middle" font-size="11.5">overfitting (200 orders)</text>
<text x="10" y="18" font-size="10.5" class="tb">blue = training loss</text><text x="140" y="18" font-size="10.5" class="tr">red = validation loss</text><text x="280" y="18" font-size="10.5" class="tm">dotted = ln 2 (knows nothing); y-axis 0 to 0.9, x-axis epochs</text>
</svg><figcaption>Four real runs, four shapes. Healthy: both curves fall together and flatten. Too high: the loss jumps and stays poor. Too low: both curves crawl down from ln 2. Overfitting: training loss keeps falling while validation loss turns up.</figcaption></figure>
  <table class="tbl"><caption>Reading loss curves</caption>
    <tr><th>What you see</th><th>Diagnosis</th><th>Reach for</th></tr>
    <tr><td>Both curves fall together, small gap, flatten</td><td>Healthy</td><td>Done; maybe a bigger model if both are high</td></tr>
    <tr><td>Both stay near ln 2 (0.693) for many epochs</td><td>Not learning: lr too low, dead/vanishing network, label bug</td><td>Raise lr, He init, BatchNorm, overfit one batch to test plumbing</td></tr>
    <tr><td>Spikes, plateau at a poor value, or NaN</td><td>lr too high / exploding gradients</td><td>Lower lr, warm-up, gradient clipping</td></tr>
    <tr><td>Training falls, validation turns up (gap grows)</td><td>Overfitting</td><td>Early stopping, weight decay, dropout, more data</td></tr>
    <tr><td>Both high and close, flat</td><td>Underfitting</td><td>Bigger network, longer training, better features</td></tr>
  </table>
  <p>The numbers behind the shapes: with lr 0.5 the first epoch's training loss jumps to 2.25, then the network dies and sits at exactly ln 2 (0.693, the same answer for every order): too-big steps pushed its ReLUs into the dead zone, as in <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>. With lr 1e-4 nothing is broken; it simply crawls (0.695 → 0.687 in 40 epochs). The overfitting run is the one from section 06.</p>
  <p>The healthy run reaches about 0.95 validation accuracy, which is the ceiling here: 5% of labels were flipped at random, so no model can be right about those. Before any long run, also do the two cheap checks from this track: the step-0 loss should be about ln 2 (here 0.69), and the model should be able to drive the loss on a single small batch to near zero (if it cannot, there is a bug in the plumbing; see <a class="xref" data-note="dl_pytorch">PyTorch</a>).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A doctor reading a patient's temperature chart. The same thermometer readings mean different illnesses depending on the shape over time: steady fever, sudden spikes, slow recovery. Loss curves are the network's chart.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>learning curve</strong> (loss curve) plots training and validation loss against epochs. The <strong>generalisation gap</strong> is validation loss minus training loss. <strong>Underfitting</strong>: both high; <strong>overfitting</strong>: gap growing.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Changing several things between runs. Change one setting at a time with a fixed seed, or you cannot tell which change caused the effect. And compare runs on validation loss, not on the last epoch's training loss.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects, then <a class="xref" data-note="dl_pytorch">PyTorch</a>.</b> We have a reliable training recipe. Every line of it was PyTorch, used quickly. The next note explains the tool itself properly (tensors, autograd, nn.Module, DataLoader, evaluation mode, saving, GPU, transfer learning) by training this same delivery network.</div>

  <h2 id="dt-connect"><span class="num">08</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Optimizers, schedules, init, BatchNorm, weight decay, dropout, early stopping, loss curves: a bag of tricks, or one chain?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 260" width="700">
<defs><marker id="dt-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="130" height="50" rx="7" class="fb sb"/><text x="75" y="40" text-anchor="middle" font-size="11.5" font-weight="700">gradient (backprop)</text><text x="75" y="58" text-anchor="middle" class="tm" font-size="10">which way per weight</text>
<line x1="140" y1="45" x2="168" y2="45" stroke="currentColor" marker-end="url(#dt-a9)"/>
<rect x="170" y="20" width="150" height="50" rx="7" class="fg sg"/><text x="245" y="40" text-anchor="middle" font-size="11.5" font-weight="700">optimizer</text><text x="245" y="58" text-anchor="middle" class="tm" font-size="10">SGD → momentum → Adam</text>
<line x1="320" y1="45" x2="348" y2="45" stroke="currentColor" marker-end="url(#dt-a9)"/>
<rect x="350" y="20" width="140" height="50" rx="7" class="fg sg"/><text x="420" y="40" text-anchor="middle" font-size="11.5" font-weight="700">lr schedule</text><text x="420" y="58" text-anchor="middle" class="tm" font-size="10">how big, over time</text>
<line x1="490" y1="45" x2="518" y2="45" stroke="currentColor" marker-end="url(#dt-a9)"/>
<rect x="520" y="20" width="170" height="50" rx="7" class="fv sb"/><text x="605" y="40" text-anchor="middle" font-size="11.5" font-weight="700">loss curves</text><text x="605" y="58" text-anchor="middle" class="tm" font-size="10">diagnose → pick a tool</text>
<rect x="170" y="110" width="150" height="50" rx="7" class="ft st"/><text x="245" y="130" text-anchor="middle" font-size="11.5" font-weight="700">initialisation</text><text x="245" y="148" text-anchor="middle" class="tm" font-size="10">signal alive at step 0</text>
<line x1="320" y1="135" x2="348" y2="135" stroke="currentColor" marker-end="url(#dt-a9)"/>
<rect x="350" y="110" width="140" height="50" rx="7" class="ft st"/><text x="420" y="130" text-anchor="middle" font-size="11.5" font-weight="700">batch norm</text><text x="420" y="148" text-anchor="middle" class="tm" font-size="10">alive during training</text>
<text x="40" y="140" class="tm" font-size="10.5">can it learn at all?</text>
<rect x="170" y="200" width="320" height="50" rx="7" class="fr sr"/><text x="330" y="220" text-anchor="middle" font-size="11.5" font-weight="700">regularisation: weight decay · L1 · dropout · early stopping</text><text x="330" y="238" text-anchor="middle" class="tm" font-size="10">learns the pattern, not the noise</text>
<text x="40" y="230" class="tm" font-size="10.5">does it generalise?</text><text x="40" y="50" class="tm" font-size="10.5"></text>
<line x1="605" y1="70" x2="495" y2="130" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dt-a9)"/>
<line x1="605" y1="70" x2="495" y2="215" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dt-a9)"/>
<text x="560" y="150" class="tm" font-size="10">flat at ln 2?</text><text x="560" y="200" class="tm" font-size="10">gap growing?</text>
</svg><figcaption>Three questions in order: can it take good steps (optimizer, schedule)? can it learn at all when deep (init, batch norm)? does it learn the pattern rather than the noise (regularisation)? Loss curves tell you which question is failing.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the delivery orders</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>Mini-batch SGD</td><td>backprop gradient on 64 orders</td><td>how to use gradients at scale?</td><td>0.855 acc after 30 epochs</td><td>baseline; with momentum for CNNs</td></tr>
    <tr><td>Momentum</td><td>running average of gradients</td><td>how to stop zig-zagging?</td><td>0.79 at epoch 5 (SGD 0.56)</td><td>almost always with SGD</td></tr>
    <tr><td>Adam / AdamW</td><td>momentum + per-weight scale</td><td>how to step well in every direction?</td><td>0.945 at epoch 5</td><td>default for MLPs, Transformers</td></tr>
    <tr><td>LR schedule</td><td>lr as a function of time</td><td>how to settle at the end?</td><td>cosine 0.231 vs constant 0.24–0.29</td><td>every serious run</td></tr>
    <tr><td>He / Xavier init</td><td>Var(z) = n·Var(w)·Var(x)</td><td>does the signal survive depth at step 0?</td><td>deep net 0.52 → 0.91</td><td>deep ReLU / tanh stacks</td></tr>
    <tr><td>BatchNorm</td><td>standardise per batch + γ, β</td><td>does it stay well-scaled while training?</td><td>km [1, 1, 9, 9] → [−1, −1, 1, 1]; deep net 0.52 → 0.93</td><td>CNNs, deep MLPs (LayerNorm for Transformers)</td></tr>
    <tr><td>Weight decay / L1</td><td>penalty on weight size</td><td>how to prefer simple boundaries?</td><td>final val 0.742 → 0.414; junk weights shrink most</td><td>almost always (small λ)</td></tr>
    <tr><td>Dropout</td><td>random unit removal</td><td>how to stop co-dependence?</td><td>0.742 → 0.501</td><td>fully connected layers</td></tr>
    <tr><td>Early stopping</td><td>validation monitoring</td><td>when to stop?</td><td>keep epoch 19: 0.436</td><td>always</td></tr>
    <tr><td>Loss curves</td><td>train vs val per epoch</td><td>which problem do I have?</td><td>4 shapes: healthy, high lr, low lr, overfit</td><td>every run</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>training well is answering three questions in order: can the network take good steps, can it learn at all, and does it learn the pattern rather than the noise?</strong> Optimizers and schedules answer the first, initialisation and normalisation the second, regularisation the third, and loss curves tell you which one is failing.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="dt-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: 1,000 generated orders (distance 0–10 km, rain 0–20 mm/h, scaled 0–1; late = far XOR rain; 5% labels flipped), 800 train / 200 validation; network 2 → 32 → 32 → 1 ReLU, BCE-with-logits loss. Overfitting set: 200 orders with 10% flipped, network 2 → 128 → 128 → 1.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our orders</th><th>Weakness → next</th></tr>
    <tr><td>Mini-batch SGD</td><td>use gradients at scale?</td><td>0.855 after 30 epochs</td><td>slow, zig-zags → momentum/Adam</td></tr>
    <tr><td>Momentum, Adam</td><td>step smarter?</td><td>epoch 5: 0.56 / 0.79 / 0.945</td><td>fixed lr jitters at the end → schedules</td></tr>
    <tr><td>Schedules</td><td>change lr over time?</td><td>cosine settles at 0.231</td><td>deep net still stuck (0.52) → init</td></tr>
    <tr><td>Initialisation</td><td>signal alive through depth?</td><td>He: 0.52 → 0.91; std factor 1 per layer</td><td>scales drift in training → BN</td></tr>
    <tr><td>BatchNorm</td><td>keep layers well-scaled?</td><td>0.52 → 0.93</td><td>now it can memorise → regularisation</td></tr>
    <tr><td>Regularisation</td><td>learn pattern, not noise?</td><td>val 0.742 → WD 0.414, dropout 0.501, early stop 0.436</td><td>which problem do I have? → curves</td></tr>
    <tr><td>Loss curves</td><td>diagnose a run?</td><td>healthy ≈ 0.95 acc (noise ceiling)</td><td>→ <a class="xref" data-note="dl_pytorch">PyTorch</a></td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>SGD</td><td>θ ← θ − lr·g</td><td>g = gradient of the mini-batch mean loss</td></tr>
    <tr><td>Momentum</td><td>v ← βv + g; θ ← θ − lr·v</td><td>β ≈ 0.9 (memory)</td></tr>
    <tr><td>RMSprop</td><td>s ← ρs + (1−ρ)g²; θ ← θ − lr·g/(√s + ε)</td><td>s per-weight average of g²</td></tr>
    <tr><td>Adam</td><td>m ← β₁m + (1−β₁)g; s ← β₂s + (1−β₂)g²; m̂ = m/(1−β₁ᵗ), ŝ = s/(1−β₂ᵗ); θ ← θ − lr·m̂/(√ŝ + ε)</td><td>β₁ 0.9, β₂ 0.999, ε 1e-8; t step count</td></tr>
    <tr><td>Cosine schedule</td><td>lr(t) = ½·lr₀·(1 + cos(πt/T))</td><td>T total epochs; lr(T/2) = lr₀/2</td></tr>
    <tr><td>Variance through a layer</td><td>Var(z) = n·Var(w)·Var(x); ReLU halves the second moment</td><td>n = fan_in</td></tr>
    <tr><td>Xavier / He</td><td>Var(w) = 2/(fan_in + fan_out) / Var(w) = 2/fan_in</td><td>tanh-sigmoid / ReLU</td></tr>
    <tr><td>BatchNorm</td><td>ẑ = (z − μ_B)/√(σ²_B + ε); out = γẑ + β</td><td>batch stats in train, running stats in eval</td></tr>
    <tr><td>Weight decay, L1</td><td>loss + λΣw²; loss + λΣ|w|; AdamW: θ ← θ − lr·λ·θ</td><td>λ strength</td></tr>
    <tr><td>Dropout</td><td>a ← a·m/(1 − p), m ~ Bernoulli(1 − p); identity in eval</td><td>p drop probability</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Adam / AdamW</b><p>Default for MLPs and Transformers; fast with little tuning.</p><small>Try SGD + momentum + schedule for CNNs</small></div>
    <div><b>Cosine / warm-up</b><p>Any run longer than a few epochs; warm-up for Transformers or large lr.</p><small>Step the scheduler at the right frequency</small></div>
    <div><b>He init</b><p>Deep ReLU networks without normalisation.</p><small>Xavier for tanh/sigmoid</small></div>
    <div><b>BatchNorm</b><p>CNNs, deep MLPs with batches ≥ 16.</p><small>LayerNorm for Transformers, RNNs, tiny batches</small></div>
    <div><b>Weight decay, dropout</b><p>When the gap between train and validation grows.</p><small>Not when underfitting</small></div>
    <div><b>Early stopping</b><p>Always: keep the best-validation checkpoint.</p><small>Needs an honest validation set</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Reporting training loss as performance; Adam(weight_decay) instead of AdamW; scheduler stepped before the optimizer or per batch instead of per epoch; constant init (symmetric neurons); assuming nn.Linear's default is He; forgetting model.eval() (BatchNorm batch stats, dropout on); BatchNorm with tiny batches; regularising an underfitting model; tuning on the test set; changing several settings at once.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Momentum β = 0.9, gradients 2, 2, 2. Velocity after each?</td><td>2, 3.8, 5.42</td></tr>
    <tr><td>Cosine from lr₀ = 0.1 over T = 100 epochs. lr at epoch 50?</td><td>0.05</td></tr>
    <tr><td>He init std for a ReLU layer with fan_in 128?</td><td>√(2/128) = 0.125</td></tr>
    <tr><td>Training loss 0.05, validation loss 0.9 and rising. Diagnosis and first fix?</td><td>Overfitting; early stopping / weight decay / dropout / more data</td></tr>
    <tr><td>Both losses sit at 0.693 for 20 epochs on a yes/no task. Diagnosis?</td><td>Not learning at all (lr too low, dead/vanishing network, or a label/plumbing bug)</td></tr>
  </table>

  <h2 id="dt-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain, on the delivery orders, why each tool exists and what breaks without it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why mini-batches instead of the full dataset per step?</summary><div class="qa-body">A batch gradient is a cheap, slightly noisy estimate of the full gradient, so you get many updates per pass over the data (13 per epoch for 800 orders with batch 64), and the data does not need to fit in memory. The noise also helps find wide minima that generalise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Adam in two lines.</summary><div class="qa-body">It keeps a running average of gradients (momentum, for direction) and of squared gradients (for a per-weight step size), corrects both for their zero start, and steps lr·m̂/(√ŝ + ε). Its first step is about lr in size regardless of gradient scale.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a learning-rate schedule buy you?</summary><div class="qa-body">Large steps early for fast progress, small steps late to settle. On our orders, Adam at lr 0.05 with a constant rate jittered between val loss 0.24 and 0.29; cosine decay settled at 0.231.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive He initialisation.</summary><div class="qa-body">Var(z) = fan_in·Var(w)·Var(x) for zero-mean independent terms. ReLU keeps half the second moment, so the signal is multiplied by fan_in·Var(w)/2 per layer. Setting that to 1 gives Var(w) = 2/fan_in.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not initialise all weights to the same value?</summary><div class="qa-body">All neurons in a layer compute the same output, get the same gradient and stay identical: our 2-4-1 net ended with four identical rows, effectively one neuron, unable to learn XOR. Random init breaks the symmetry.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does BatchNorm do in training vs evaluation?</summary><div class="qa-body">Training: standardise each feature with the current batch's mean and variance, then γẑ + β, and update running averages. Evaluation: use the running averages, so a single example gets a deterministic output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>L1 vs L2: effect on weights?</summary><div class="qa-body">L2 shrinks every weight in proportion to its size, rarely to exactly zero. L1 pulls with constant force, driving useless weights to (near) zero: in our run the junk columns' weights shrank to about a quarter of the real columns'.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does dropout behave at train vs inference time, and why scale by 1/(1 − p)?</summary><div class="qa-body">Training: each unit zeroed with probability p, survivors multiplied by 1/(1 − p) so the expected input to the next layer is unchanged. Inference: off, nothing to rescale.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you recognise overfitting on a loss curve, and what do you do?</summary><div class="qa-body">Training loss keeps falling while validation loss turns up (ours: 0.436 at epoch 19, 0.742 at 600). Keep the best checkpoint (early stopping), add weight decay/dropout, get more data, or shrink the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why can't a better optimizer rescue the 6-layer network with default init?</summary><div class="qa-body">The optimizer only scales and steers the gradient it receives. With default init the signal (and so the gradient) has almost died by the early layers, so every optimizer gets near-zero information; the output stayed at P ≈ const, loss ln 2. Fix the signal first (He init or BatchNorm: 0.91 / 0.93), then the optimizer matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does BatchNorm make the network less sensitive to initialisation?</summary><div class="qa-body">Init sets the scale of each layer's outputs once; BN re-standardises them every batch, whatever the weights' scale. A shrinking signal is rescaled back to spread 1 at every layer, which is why the default-init 6-layer net learned once BN was added.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you regularise a network that is underfitting?</summary><div class="qa-body">It gets worse. Regularisation removes capacity to fight memorisation; an underfitting model (both losses high and close) needs more capacity, more training or better features instead. The loss curve tells you which situation you are in.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do weight decay and early stopping relate?</summary><div class="qa-body">Both keep weights from growing to fit noise. Starting from small weights, gradient descent grows them over time; stopping early caps how far they get, similar in effect to an L2 penalty. On our 200 orders they reached similar validation losses (0.436 best-epoch vs 0.414 with weight decay).</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="dl_pytorch">PyTorch</a>.</b> We used PyTorch as a calculator. The next note teaches the tool properly, from tensors and autograd to nn.Module, DataLoader, the training loop, evaluation mode, saving, GPU and transfer learning, training this same delivery network.</div>
</main>`
});
