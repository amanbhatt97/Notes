// notes/dl/dl_training.js — Training Well
Object.assign(TOPIC_CONTENT, {
  "dl_training": `<main>
  <h1>Training Well</h1>
  <div class="where"><span>Deep Learning</span><span>Neural Networks</span><span>Training Well</span></div>
  <p class="lead">Backpropagation tells every weight which way to move to reduce the loss. That alone does not make training work: you still have to decide how big each step is, whether it should remember earlier steps, what the weights should be before the first step, how to keep signals healthy in a deep network, and how to stop the network memorising its training data instead of learning the pattern. "Training well" is the name for all of these decisions, and they are where most of the time on a real project goes, because a correct network trained badly is useless. This page builds them up one at a time on a single running example: the late-delivery network from the earlier notes, which predicts whether a food order will arrive late from its distance and the rain, trained on 1,000 generated orders where "late" means far XOR rainy, with 5% of the labels deliberately wrong to imitate real, noisy data. Every number on the page comes from a real run (PyTorch on a CPU, fixed seeds).</p>

  <h2 id="dt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Training Well</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Taking good steps</div>
        <ul>
          <li><b>Mini-batch SGD</b>: w ← w − lr·g on 64 examples at a time</li>
          <li><b>Momentum</b> remembers direction; <b>RMSprop</b> gives each weight its own step size</li>
          <li><b>Adam</b> = both; <b>AdamW</b> = Adam + proper weight decay</li>
          <li><b>Schedules</b>: big steps early, small late (cosine, warm-up)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Learning at all</div>
        <ul>
          <li>Var(z) = fan_in · Var(w) · Var(x)</li>
          <li><b>He</b> Var(w) = 2/fan_in for ReLU; <b>Xavier</b> 2/(in + out) for tanh</li>
          <li>Equal starting weights → identical neurons forever</li>
          <li><b>BatchNorm</b>: standardise per batch, then γ, β; running stats in eval</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Not memorising</div>
        <ul>
          <li><b>Overfitting</b>: train loss ↓ while validation loss ↑</li>
          <li><b>Weight decay (L2)</b> shrinks weights; <b>L1</b> zeroes useless ones</li>
          <li><b>Dropout</b>: switch off random neurons in training only</li>
          <li><b>Early stopping</b>: keep the best-validation weights</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Diagnosis</div>
        <ul>
          <li>Starting loss should be ln 2 ≈ 0.693 for yes/no</li>
          <li>Flat at ln 2 → not learning; spikes/NaN → lr too high</li>
          <li>Gap between train and validation growing → overfitting</li>
          <li>Change one thing at a time, fixed seed</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dt-sgd"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Mini-batch SGD and the Validation Set</span><span class="rm-sub">the plain update rule, used on real-sized data</span></div></div>
      <div class="rm-item rm-done" data-target="dt-opt"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Momentum, RMSprop and Adam</span><span class="rm-sub">smarter steps from the same gradient</span></div></div>
      <div class="rm-item rm-done" data-target="dt-lr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Learning-Rate Schedules</span><span class="rm-sub">changing the step size during training</span></div></div>
      <div class="rm-item rm-done" data-target="dt-init"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Weight Initialisation</span><span class="rm-sub">starting weights that keep a deep network alive</span></div></div>
      <div class="rm-item rm-done" data-target="dt-bn"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Batch Normalisation</span><span class="rm-sub">keeping every layer's inputs well scaled</span></div></div>
      <div class="rm-item rm-done" data-target="dt-over"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Overfitting</span><span class="rm-sub">when the network memorises the noise</span></div></div>
      <div class="rm-item rm-done" data-target="dt-wd"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Weight Decay and L1</span><span class="rm-sub">making big weights cost something</span></div></div>
      <div class="rm-item rm-done" data-target="dt-drop"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Dropout</span><span class="rm-sub">switching neurons off at random</span></div></div>
      <div class="rm-item rm-done" data-target="dt-es"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Early Stopping</span><span class="rm-sub">keeping the best moment of the run</span></div></div>
      <div class="rm-item rm-done" data-target="dt-loop"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Reading Loss Curves</span><span class="rm-sub">which problem does my run have?</span></div></div>
      <div class="rm-item rm-done" data-target="dt-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">eval mode, schedulers, BatchNorm, AdamW</span></div></div>
      <div class="rm-item rm-done" data-target="dt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, tables, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dt-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the training questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="dt-sgd"><span class="num">01</span>Mini-batch SGD and the Validation Set</h2>
  <p>In <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a> we trained a tiny network on four orders, and every step used all four to compute the gradient. Real data is not four orders; it is thousands or millions. Computing the exact gradient over all of them before taking a single step would be slow, and with millions of examples the data would not even fit in memory. Yet the update rule itself, w ← w − lr·g (move each weight a little against its gradient g, scaled by the learning rate lr), is perfectly good. The question is how to feed it.</p>
  <p>The answer used almost everywhere is <strong>mini-batch stochastic gradient descent (SGD)</strong>: shuffle the training data, take a small group of examples called a <strong>mini-batch</strong> (say 64 orders), compute the gradient on just that group, take one step, and move on to the next group. The gradient from 64 orders is not exactly the gradient from all 800, but it points in nearly the same direction, and you get 13 steps per pass through 800 orders instead of one. "Stochastic" just means "with randomness", because each batch is a random sample. One full pass through the training data is called an <strong>epoch</strong>, and one batch-and-step is an <strong>iteration</strong> (or step). Think of a cook tasting soup: tasting the whole pot before every pinch of salt would be exact but absurd; a spoonful tells you almost as much, so you can adjust many times while it cooks. Each spoonful is slightly different, and that small noise is harmless, even helpful, because it nudges training out of narrow dips into wider, more reliable ones.</p>
  <p>Before we train anything, we need an honest way to judge the result. The training loss always looks better than reality, because the network has seen those exact orders. So we split the data: the first 800 orders are the <strong>training set</strong>, used to compute gradients, and the last 200 are the <strong>validation set</strong>, which the network never trains on and which we use only to measure how well it does on new orders. Every result on this page is a validation result. (A third, untouched <strong>test set</strong> is used once at the very end of a project to report final performance; see <a class="xref" data-note="ml_splits">train/validation/test splits</a>.)</p>
  <p>The code below sets up everything the rest of the page reuses: the order generator, a function <code>mlp</code> that builds the network (2 inputs → 32 → 32 → 1 output, ReLU between layers, with optional BatchNorm and dropout we will need later), an <code>evaluate</code> function that measures validation loss and accuracy, and <code>fit</code>, which runs mini-batch training and records three numbers after every epoch. The loss is binary cross-entropy on the network's single output (a <strong>logit</strong>, a raw score that a sigmoid turns into P(late)).</p>
  <div class="fx" data-lang="py">import torch, torch.nn as nn, torch.nn.functional as F, math

def make_orders(n=1000, noise=0.05, seed=0):
    g = torch.Generator().manual_seed(seed)
    km = torch.rand(n, generator=g) * 10                   # distance 0-10 km
    rain = torch.rand(n, generator=g) * 20                 # rain 0-20 mm/h
    late = ((km &gt; 5) ^ (rain &gt; 10)) ^ (torch.rand(n, generator=g) &lt; noise)   # far XOR rain, 5% flipped
    return torch.stack([km / 10, rain / 20], 1), late.float()

X, y = make_orders()
Xtr, ytr, Xva, yva = X[:800], y[:800], X[800:], y[800:]   # 800 to train on, 200 to judge with

def mlp(hidden=32, depth=2, bn=False, p=0.0, d_in=2):
    layers = []
    for _ in range(depth):
        layers += [nn.Linear(d_in, hidden)] + ([nn.BatchNorm1d(hidden)] if bn else []) + [nn.ReLU()]
        if p: layers.append(nn.Dropout(p))
        d_in = hidden
    return nn.Sequential(*layers, nn.Linear(hidden, 1))   # one logit; P(late) = sigmoid(logit)

def evaluate(net, Xv, yv):
    net.eval()
    with torch.no_grad():
        out = net(Xv).squeeze(1)
        loss = F.binary_cross_entropy_with_logits(out, yv).item()
        acc = ((out &gt; 0).float() == yv).float().mean().item()
    net.train()
    return loss, acc

def fit(net, opt, epochs, Xt=Xtr, yt=ytr, Xv=Xva, yv=yva, bs=64, sched=None, clip=None):
    hist = []
    for ep in range(epochs):
        perm = torch.randperm(len(Xt)); total = 0.0
        for i in range(0, len(Xt), bs):                    # one mini-batch at a time
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
print("val loss before training:", round(evaluate(net, Xva, yva)[0], 3), "  ln 2 =", round(math.log(2), 3))
h_sgd = fit(net, torch.optim.SGD(net.parameters(), lr=0.1), epochs=30)
print("SGD lr 0.1 |", show(h_sgd, [1, 5, 30]))</div>
  <div class="fx" data-lang="text">val loss before training: 0.694   ln 2 = 0.693
SGD lr 0.1 | ep1: tr 0.694 va 0.692 acc 0.520  ep5: tr 0.689 va 0.688 acc 0.560  ep30: tr 0.588 va 0.594 acc 0.855</div>
  <p>The first line is a sanity check worth doing on every project. An untrained yes/no model should say roughly 50/50 for every order, and the cross-entropy of a 50/50 guess is ln 2 ≈ 0.693. We got 0.694, so the labels and loss are wired correctly. Then plain SGD with lr 0.1 barely moves for five epochs (accuracy 0.56, hardly better than always guessing) and reaches only 0.855 after 30 epochs, which is 390 steps. Nothing is broken; it is just slow. The obvious fix, a bigger learning rate, turns out not to work, and understanding why leads to better optimisers.</p>

  <h2 id="dt-opt"><span class="num">02</span>Momentum, RMSprop and Adam</h2>
  <p>The loss of a neural network, seen as a landscape over all its weights, is full of long narrow valleys: steep walls in some directions and an almost flat floor in others. The gradient points mostly at the nearest steep wall, not along the floor towards the lowest point. So SGD steps across the valley, overshoots onto the opposite wall, steps back, and makes only slow progress along the floor. Raising the learning rate makes the bouncing worse rather than the progress faster, and past a certain size the steps across the valley grow each time and training blows up.</p>
  <p>The figure shows this on the simplest possible valley, f = ½(x² + 50y²), which is 50 times steeper in the y direction than in x. All three optimisers start at the same point and take 40 steps (the paths are from the real run in the code further down). The red SGD path zig-zags up and down between the steep walls and crawls to the right. Its learning rate cannot go above 2/50 = 0.04, because the steep direction would explode, and that small rate is painfully slow in the gentle x direction. The blue momentum path builds up speed, reaches the minimum quickly but overshoots and circles around it. The green Adam path moves almost straight to the minimum, because it sizes its step separately in each direction.</p>
  <figure class="viz"><svg viewBox="0 0 560 220" width="560">
    <ellipse cx="380" cy="110" rx="60" ry="17" fill="none" stroke="currentColor" opacity="0.25"/>
    <ellipse cx="380" cy="110" rx="180" ry="50" fill="none" stroke="currentColor" opacity="0.25"/>
    <ellipse cx="380" cy="110" rx="330" ry="92" fill="none" stroke="currentColor" opacity="0.25"/>
    <polyline points="56,185 67,54 78,152 89,78 99,134 109,92 118,123 128,100 136,118 145,104 153,114 161,107 169,112 176,108 183,111 190,109 197,111 203,109 209,110 215,110 221,110 227,110 232,110 237,110 242,110 247,110 252,110 256,110 261,110 265,110 269,110 273,110 276,110 280,110 284,110 287,110 290,110 293,110 296,110 299,110 302,110" fill="none" class="sr" stroke-width="1.8"/>
    <polyline points="56,185 67,54 88,34 118,149 153,184 193,86 236,40 279,121 321,175 362,110 398,51 431,101 458,161 481,125 497,66 507,90 512,147 512,134 508,81 499,84 487,132 472,137 456,94 439,84 421,121 404,135 387,104 372,86 359,112 348,132 339,112 332,91 328,106 326,127 326,117 328,96 331,102 336,121 342,119 349,101 356,101" fill="none" class="sb" stroke-width="1.6" opacity="0.8"/>
    <polyline points="56,185 75,163 95,141 114,120 133,102 152,87 171,78 190,74 208,74 226,77 244,83 261,91 278,99 294,108 310,115 325,122 339,127 352,130 364,131 376,130 386,127 395,123 404,119 411,114 417,109 423,104 427,101 430,99 432,98 433,98 434,99 434,102 433,104 431,108 429,111 426,113 423,116 419,117 416,118 412,117 408,116" fill="none" class="sg" stroke-width="2.2"/>
    <circle cx="380" cy="110" r="4" class="fg sg"/><circle cx="56" cy="185" r="4" stroke="currentColor" fill="none"/>
    <text x="40" y="205" class="tm">start</text><text x="388" y="104" class="tg">min</text>
    <text x="20" y="20" class="tr">SGD: zig-zag, crawls</text><text x="200" y="20" class="tb">Momentum: fast, overshoots</text><text x="420" y="20" class="tg">Adam: heads straight in</text>
  </svg><figcaption>First 40 steps of three optimisers from the same start on a narrow valley (grey ellipses are contour lines of equal loss). Red SGD bounces between the steep walls; blue momentum builds speed and circles the minimum; green Adam takes a sensibly sized step in each direction.</figcaption></figure>
  <p>The first fix is <strong>momentum</strong>: instead of stepping along today's gradient alone, keep a running "velocity" v that remembers recent gradients, and step along that. Each step computes v = β·v + g and then w ← w − lr·v, with β usually 0.9, meaning 90% of the old velocity is kept. Picture a heavy ball rolling down the valley rather than a person taking one cautious step at a time. When the gradient keeps flipping sign, as it does across the valley, the flips cancel out inside v. When it keeps pointing the same way, as it does along the floor, the contributions add up and the ball speeds up. By hand with β = 0.9: steady gradients 1, 1, 1 give velocities 1, then 0.9 × 1 + 1 = 1.9, then 0.9 × 1.9 + 1 = 2.71. Gradients that flip, 1, −1, 1, give 1, then 0.9 − 1 = −0.1, then −0.09 + 1 = 0.91. The code continues both patterns for six steps:</p>
  <div class="fx" data-lang="py">for name, grads in [("zig-zag", [1, -1, 1, -1, 1, -1]), ("steady", [1, 1, 1, 1, 1, 1])]:
    v, vs = 0.0, []
    for g in grads:
        v = 0.9 * v + g                # velocity: 90% of the old one plus today's gradient
        vs.append(round(v, 2))
    print(f"{name:8s} grads {grads}  velocity {vs}")</div>
  <div class="fx" data-lang="text">zig-zag  grads [1, -1, 1, -1, 1, -1]  velocity [1.0, -0.1, 0.91, -0.18, 0.84, -0.25]
steady   grads [1, 1, 1, 1, 1, 1]  velocity [1.0, 1.9, 2.71, 3.44, 4.1, 4.69]</div>
  <p>Steady gradients build up to almost five times a single gradient, while zig-zagging ones stay below 1 in size. That is the entire trick of momentum: progress along consistent directions is amplified and oscillation is damped.</p>
  <p>The second fix attacks a different problem: one learning rate for every weight. Some weights sit on steep walls and need tiny steps; others sit on flat floors and need big ones. <strong>RMSprop</strong> keeps, for each weight separately, a running average s of its <em>squared</em> gradient, and divides that weight's step by √s, the typical size of its recent gradients. A weight that keeps getting big gradients is slowed down; a weight that keeps getting small ones is sped up. In the valley this makes the steep y direction and the gentle x direction look equally steep, so the valley effectively becomes round.</p>
  <p><strong>Adam</strong> (short for adaptive moment estimation) combines the two: a momentum-style running average m of the gradients for the direction, and an RMSprop-style running average s of the squared gradients for the per-weight step size. One detail completes it. Both averages start at zero, so in the first steps they are far too small; Adam divides them by (1 − βᵗ), where t is the step number, which exactly undoes that start-up bias. This is called <strong>bias correction</strong>. The full update is below; the defaults lr = 0.001, β₁ = 0.9, β₂ = 0.999 and ε = 10⁻⁸ (a tiny number that prevents division by zero) work surprisingly often.</p>
  <table class="tbl">
    <tr><th>Optimiser</th><th>Update (g = gradient)</th><th>What it fixes</th></tr>
    <tr><td>SGD</td><td>w −= lr·g</td><td>the baseline</td></tr>
    <tr><td>Momentum</td><td>v = βv + g; w −= lr·v</td><td>zig-zags cancel, steady directions speed up</td></tr>
    <tr><td>RMSprop</td><td>s = ρs + (1−ρ)g²; w −= lr·g/(√s + ε)</td><td>a step size per weight</td></tr>
    <tr><td>Adam</td><td>m = β₁m + (1−β₁)g; s = β₂s + (1−β₂)g²; m̂ = m/(1−β₁ᵗ), ŝ = s/(1−β₂ᵗ); w −= lr·m̂/(√ŝ + ε)</td><td>both, with bias correction</td></tr>
  </table>
  <p>Adam's first step by hand makes the bias correction concrete. Take one weight with gradient g = 0.5. Then m = 0.1 × 0.5 = 0.05 and s = 0.001 × 0.25 = 0.00025, both much too small. Corrected, m̂ = 0.05/(1 − 0.9) = 0.5 and ŝ = 0.00025/(1 − 0.999) = 0.25. The step is lr × 0.5/√0.25 = lr × 1. Try any other gradient and you get the same answer: Adam's first step is always about lr in size, whatever the scale of the gradient, which is why Adam is so forgiving. The code runs all four optimisers on the valley for 100 steps, and then the first four comparisons on the delivery network with the same seed and the same batches:</p>
  <div class="fx" data-lang="py">def valley_path(make_opt, steps=100, start=(-5.0, 1.0)):      # f = 0.5 * (x^2 + 50 y^2)
    p = torch.tensor(start, requires_grad=True); opt = make_opt([p]); path = [tuple(p.tolist())]
    for _ in range(steps):
        opt.zero_grad(); (0.5 * (p[0] ** 2 + 50 * p[1] ** 2)).backward(); opt.step()
        path.append(tuple(p.tolist()))
    return path

valley = {"SGD": lambda p: torch.optim.SGD(p, lr=0.035),
          "momentum": lambda p: torch.optim.SGD(p, lr=0.035, momentum=0.9),
          "RMSprop": lambda p: torch.optim.RMSprop(p, lr=0.1),
          "Adam": lambda p: torch.optim.Adam(p, lr=0.3)}
for name, make in valley.items():
    a, b = valley_path(make)[-1]
    print(f"valley, 100 steps, {name:8s}: f = {0.5 * (a * a + 50 * b * b):.1e}")

for name, make in [("SGD lr 0.1", lambda p: torch.optim.SGD(p, lr=0.1)),
                   ("SGD+momentum 0.9", lambda p: torch.optim.SGD(p, lr=0.1, momentum=0.9)),
                   ("Adam lr 1e-2", lambda p: torch.optim.Adam(p, lr=1e-2)),
                   ("Adam lr 1e-3", lambda p: torch.optim.Adam(p, lr=1e-3))]:
    torch.manual_seed(0); net = mlp()
    h = fit(net, make(net.parameters()), epochs=30)
    print(f"{name:17s}|", show(h, [5, 30]))</div>
  <div class="fx" data-lang="text">valley, 100 steps, SGD     : f = 1.0e-02
valley, 100 steps, momentum: f = 6.9e-04
valley, 100 steps, RMSprop : f = 1.7e-12
valley, 100 steps, Adam    : f = 3.0e-04
SGD lr 0.1       | ep5: tr 0.689 va 0.688 acc 0.560  ep30: tr 0.588 va 0.594 acc 0.855
SGD+momentum 0.9 | ep5: tr 0.596 va 0.560 acc 0.790  ep30: tr 0.277 va 0.260 acc 0.940
Adam lr 1e-2     | ep5: tr 0.377 va 0.341 acc 0.945  ep30: tr 0.268 va 0.254 acc 0.940
Adam lr 1e-3     | ep5: tr 0.678 va 0.678 acc 0.660  ep30: tr 0.368 va 0.370 acc 0.945</div>
  <p>On the valley, SGD is still at f = 0.01 after 100 steps, held back by the small learning rate the steep direction forces on it; momentum and Adam finish about 15 and 30 times lower, and RMSprop, which makes the valley perfectly round, lands essentially on the minimum. On the delivery network the story is the same: by epoch 5, SGD has 0.56 accuracy, SGD with momentum 0.79, and Adam with lr 0.01 already 0.945, close to the best possible (5% of labels are wrong, so about 0.95 is the ceiling). Adam with the textbook default lr of 0.001 is slower here (0.66 at epoch 5) but catches up by epoch 30, a reminder that defaults are starting points, not answers.</p>
  <p>Adam is the usual default for fully connected networks and Transformers because it needs little tuning. It is not always best: for image CNNs, well-tuned SGD with momentum and a learning-rate schedule often ends with slightly better validation accuracy. And Adam has one subtle flaw with weight decay, fixed by a variant called <strong>AdamW</strong>, which we will meet in the weight decay section. More theory on these methods is in <a class="xref" data-note="m_optimization">Optimization</a>.</p>

  <h2 id="dt-lr"><span class="num">03</span>Learning-Rate Schedules</h2>
  <p>Every optimiser above used one learning rate for the whole run, and that creates a dilemma. A large rate makes fast progress early, when the weights are far from good, but near the end the same large steps keep jumping over the bottom of the valley, so the loss jitters instead of settling. A small rate settles precisely but takes forever to get anywhere. Think of parking a car: you drive down the road at normal speed, slow down as you approach the space, and creep the last metre. Driving the last metre at road speed means overshooting the space again and again.</p>
  <p>A <strong>learning-rate schedule</strong> is a rule that changes lr as training goes on, usually large at first and smaller later. The common shapes are <strong>step decay</strong> (multiply lr by, say, 0.1 every k epochs), <strong>cosine annealing</strong> (glide smoothly from the starting rate down to almost zero along half a cosine curve), <strong>warm-up</strong> (start tiny and rise over the first few hundred steps, because the very first gradients from random weights can be wild; this is standard for Transformers), and <strong>reduce-on-plateau</strong> (cut the rate whenever validation loss stops improving for a while). The cosine formula, for T epochs starting from lr₀, is lr(t) = ½·lr₀·(1 + cos(π·t/T)). By hand for T = 40 and lr₀ = 0.05: at t = 0, cos 0 = 1 and lr = 0.05; at t = 20, cos 90° = 0 and lr = 0.025, exactly half; at t = 30, cos 135° = −0.707, so lr = 0.025 × 0.293 = 0.0073; at t = 40 it reaches 0.</p>
  <p>The code prints the rate a PyTorch scheduler produces at a few epochs for three schedule types, and then trains the delivery network with Adam at a deliberately large rate of 0.05, once constant and once with cosine decay:</p>
  <div class="fx" data-lang="py">def lr_trace(make_sched, epochs=40, at=(0, 10, 20, 30, 39)):
    opt = torch.optim.Adam([nn.Parameter(torch.zeros(1))], lr=0.05); s = make_sched(opt); out = []
    for t in range(epochs):
        if t in at: out.append(round(opt.param_groups[0]["lr"], 4))
        opt.step(); s.step()
    return out
sch = torch.optim.lr_scheduler
print("step (x0.1 every 15):", lr_trace(lambda o: sch.StepLR(o, step_size=15, gamma=0.1)))
print("cosine over 40:      ", lr_trace(lambda o: sch.CosineAnnealingLR(o, T_max=40)))
print("linear warm-up 5:    ", lr_trace(lambda o: sch.LinearLR(o, start_factor=0.1, total_iters=5), at=(0, 1, 2, 4, 5)))

for name, make_sched in [("constant lr 0.05", None),
                         ("cosine from 0.05", lambda o: sch.CosineAnnealingLR(o, T_max=40))]:
    torch.manual_seed(0); net = mlp(); opt = torch.optim.Adam(net.parameters(), lr=0.05)
    h = fit(net, opt, epochs=40, sched=make_sched(opt) if make_sched else None)
    print(f"{name:17s}| {show(h, [40])} | val loss, last 5 epochs {[round(e[1], 3) for e in h[-5:]]}")</div>
  <div class="fx" data-lang="text">step (x0.1 every 15): [0.05, 0.05, 0.005, 0.0005, 0.0005]
cosine over 40:       [0.05, 0.0427, 0.025, 0.0073, 0.0001]
linear warm-up 5:     [0.005, 0.014, 0.023, 0.041, 0.05]
constant lr 0.05 | ep40: tr 0.262 va 0.242 acc 0.925 | val loss, last 5 epochs [0.292, 0.259, 0.24, 0.242, 0.242]
cosine from 0.05 | ep40: tr 0.245 va 0.231 acc 0.945 | val loss, last 5 epochs [0.23, 0.232, 0.231, 0.231, 0.231]</div>
  <p>The printed cosine values match the hand calculation (0.025 at epoch 20, 0.0073 at epoch 30). The step schedule drops by ten at epochs 15 and 30, and the warm-up climbs from 0.005 to 0.05 over five epochs. On the delivery network, the constant rate keeps bouncing: its last five validation losses wander between 0.24 and 0.29. With cosine decay the run makes the same fast early progress, then settles at 0.231 with 0.945 accuracy. In PyTorch the scheduler is a separate object that wraps the optimiser, and you call <code>scheduler.step()</code> once per epoch (or once per batch, if the schedule was defined in batches) after <code>optimizer.step()</code>.</p>
  <p>A schedule polishes a run that is already learning. It cannot rescue a network that does not learn at all, and the next section shows such a network.</p>

  <h2 id="dt-init"><span class="num">04</span>Weight Initialisation</h2>
  <p>Our network has two hidden layers. Make it six layers deep, keep PyTorch's default starting weights, train with SGD and momentum, and something surprising happens:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0); deep_default = mlp(depth=6)
h = fit(deep_default, torch.optim.SGD(deep_default.parameters(), lr=0.05, momentum=0.9), epochs=20)
print("6 layers, default init |", show(h, [1, 10, 20]))</div>
  <div class="fx" data-lang="text">6 layers, default init | ep1: tr 0.695 va 0.694 acc 0.480  ep10: tr 0.693 va 0.693 acc 0.520  ep20: tr 0.693 va 0.692 acc 0.520</div>
  <p>The validation loss sits at exactly ln 2 = 0.693 and accuracy at 0.52, which is what you get by answering "on time" for every order. The deeper network has learned nothing at all in 20 epochs, and no optimiser or schedule fixes it. The cause is the starting weights, before a single step is taken.</p>
  <p>To see why, follow the size of the signal through one layer. A neuron computes z = w₁x₁ + w₂x₂ + … + wₙxₙ, a sum of n terms, where n is the number of inputs to the layer, called its <strong>fan-in</strong>. If the weights and inputs are independent and centred on zero, the <strong>variance</strong> (the average squared distance from the mean, a measure of spread) of a sum is the sum of the variances, and the variance of each product w·x is Var(w)·Var(x). So Var(z) = n · Var(w) · Var(x). ReLU then zeroes the negative half of z, which halves the average squared value. Put together, each layer multiplies the signal's squared size by n·Var(w)/2, and its spread (standard deviation) by the square root of that. If that factor is a bit below 1, the signal shrinks layer after layer until it vanishes; a bit above 1, and it grows until it explodes. Think of a chain of loudspeakers down a long hall, each re-amplifying the one before: set every volume slightly low and the far end hears silence, slightly high and it screeches. Here is the factor for layers 512 neurons wide, by hand:</p>
  <table class="tbl">
    <tr><th>Starting weights</th><th>Var(w)</th><th>n·Var(w)/2</th><th>spread × per layer</th><th>after 10 layers</th></tr>
    <tr><td>normal, std 0.01</td><td>0.0001</td><td>512 × 0.0001/2 = 0.0256</td><td>0.16</td><td>0.16¹⁰ ≈ 10⁻⁸ (dies)</td></tr>
    <tr><td>normal, std 1</td><td>1</td><td>256</td><td>16</td><td>16¹⁰ ≈ 10¹² (explodes)</td></tr>
    <tr><td>Xavier</td><td>2/(512 + 512) ≈ 0.00195</td><td>0.5</td><td>0.71</td><td>0.71¹⁰ ≈ 0.03 (fades)</td></tr>
    <tr><td>He</td><td>2/512 ≈ 0.0039</td><td>1</td><td>1</td><td>1 (steady)</td></tr>
  </table>
  <p><strong>He initialisation</strong> (also called Kaiming, after Kaiming He) is simply the choice that makes the factor exactly 1: n·Var(w)/2 = 1 gives Var(w) = 2/n, so the weights are drawn with standard deviation √(2/fan_in). The 2 is there because ReLU throws away half the signal. <strong>Xavier</strong> (or Glorot) initialisation, Var(w) = 2/(fan_in + fan_out), was derived earlier for tanh and sigmoid, which keep both halves of the signal; it balances the forward pass (which wants 1/fan_in) against the backward pass (which wants 1/fan_out). The code checks the table by pushing the 1,000 orders through ten layers of 512 neurons with each kind of starting weight and measuring the spread:</p>
  <div class="fx" data-lang="py">x0 = (X - X.mean(0)) / X.std(0)                          # standardised orders, (1000, 2)
torch.manual_seed(0); W0 = torch.empty(512, 2); nn.init.kaiming_normal_(W0, nonlinearity="relu")
h0 = torch.relu(x0 @ W0.T); h0 = h0 / h0.std()           # a first layer, spread scaled to 1: (1000, 512)
for name, init in [("std=0.01", lambda w: nn.init.normal_(w, std=0.01)),
                   ("std=1.0",  lambda w: nn.init.normal_(w, std=1.0)),
                   ("Xavier",   nn.init.xavier_normal_),
                   ("He",       lambda w: nn.init.kaiming_normal_(w, nonlinearity="relu"))]:
    torch.manual_seed(0); h = h0; stds = []
    for i in range(10):                                  # 10 more layers, each 512 wide
        W = torch.empty(512, 512); init(W); h = torch.relu(h @ W.T); stds.append(h.std().item())
    print(f"{name:9s} layer1={stds[0]:.3g}  layer5={stds[4]:.3g}  layer10={stds[9]:.3g}")</div>
  <div class="fx" data-lang="text">std=0.01  layer1=0.154  layer5=9.85e-05  layer10=1.01e-08
std=1.0   layer1=15.4  layer5=9.85e+05  layer10=1.01e+12
Xavier    layer1=0.679  layer5=0.166  layer10=0.0287
He        layer1=0.96  layer5=0.939  layer10=0.919</div>
  <p>The measurements follow the hand table closely: standard deviation 0.01 shrinks the signal to 10⁻⁸ by layer 10, standard deviation 1 blows it up to 10¹², Xavier fades to 0.03 because it was not designed for ReLU, and He holds steady near 1. Gradients travel backwards through the same weights, so they vanish or explode in exactly the same way; this is the <strong>vanishing (or exploding) gradient problem</strong> you met in <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>, and good initialisation is the first defence against it.</p>
  <p>Why not avoid all this and start every weight at zero, or at the same small number? Because then every neuron in a layer computes the same output, receives the same gradient, and makes the same update, so they stay identical copies forever. This is called the <strong>symmetry problem</strong>. Here a 2 → 4 → 1 network on the four orders A–D (late = far XOR rain) starts with every weight at 0.5:</p>
  <div class="fx" data-lang="py">X4 = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]]); y4 = torch.tensor([0., 1., 1., 0.])  # orders A-D
sym = nn.Sequential(nn.Linear(2, 4), nn.Tanh(), nn.Linear(4, 1))
for prm in sym.parameters(): nn.init.constant_(prm, 0.5)      # every weight starts at 0.5
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
  <p>After 200 steps all four hidden neurons have exactly the same weights (1.4, 1.4): the layer behaves like a single neuron, and a single neuron cannot learn XOR, so orders B, C and D all get similar probabilities. Random starting values break the symmetry, and the variance argument tells us how big they should be. Now the stuck six-layer network again, with He initialisation and nothing else changed:</p>
  <div class="fx" data-lang="py">def he_init(m):
    if isinstance(m, nn.Linear):
        nn.init.kaiming_normal_(m.weight, nonlinearity="relu"); nn.init.zeros_(m.bias)
torch.manual_seed(0); deep_he = mlp(depth=6); deep_he.apply(he_init)       # .apply visits every layer
h = fit(deep_he, torch.optim.SGD(deep_he.parameters(), lr=0.05, momentum=0.9), epochs=20)
print("6 layers, He init      |", show(h, [1, 10, 20]))
print("default nn.Linear(32, 32) weight std:", round(nn.Linear(32, 32).weight.std().item(), 3),
      "  He would be:", round((2 / 32) ** 0.5, 3))</div>
  <div class="fx" data-lang="text">6 layers, He init      | ep1: tr 0.631 va 0.568 acc 0.725  ep10: tr 0.411 va 0.368 acc 0.830  ep20: tr 0.265 va 0.266 acc 0.910
default nn.Linear(32, 32) weight std: 0.102   He would be: 0.25</div>
  <p>It learns from the first epoch and reaches 0.91 accuracy by epoch 20. The last line explains the original failure. PyTorch's default for <code>nn.Linear</code> draws weights uniformly between ±1/√fan_in, a standard deviation of about 0.10 for fan-in 32, while He wants 0.25. That shortfall, compounded over six layers, shrank the signal to almost nothing. For shallow networks the default is fine; for deep stacks of plain ReLU layers you apply He initialisation yourself, as above, or add the layer described next.</p>

  <h2 id="dt-bn"><span class="num">05</span>Batch Normalisation</h2>
  <p>Good initialisation sets the right scale at step zero. But training changes the weights, so the scale of every layer's output drifts as training goes on, and each layer has to keep adapting to inputs whose size and centre keep moving. It is the same problem you meet with raw features: distance runs 0–10 km and rain 0–20 mm/h, and before feeding such columns to a model you <strong>standardise</strong> them (subtract the mean, divide by the standard deviation) so they share a common scale. Inside a deep network the problem appears at every layer, and it moves.</p>
  <p><strong>Batch normalisation</strong> (BatchNorm, or BN) standardises the values of each neuron across the current mini-batch, at every layer where you place it, and then multiplies by a learnable number γ (gamma) and adds a learnable number β (beta). The formula is ẑ = (z − μ_B)/√(σ²_B + ε), output = γ·ẑ + β, where μ_B and σ²_B are the mean and variance of that neuron over the batch, and ε is a tiny constant against division by zero. The γ and β matter: they let the network undo the standardisation if some other scale works better, so BN never removes something the network needs. Think of two exam boards, one marking out of 100 and one out of 500. Converting each mark to "how many spreads above that board's average" makes them comparable; BN does that at every layer for every batch, then lets each layer choose its preferred scale.</p>
  <p>By hand on our four orders in real units, A (1 km, 0 mm), B (1 km, 15 mm), C (9 km, 0 mm), D (9 km, 15 mm). The distance column is [1, 1, 9, 9]: its mean is 5, every value is 4 away from it, so the standard deviation is 4 and the column becomes [−1, −1, 1, 1]. The rain column [0, 15, 0, 15] has mean 7.5 and standard deviation 7.5, so it becomes [−1, 1, −1, 1]. Two very different scales, now one common one. The code runs PyTorch's <code>BatchNorm1d</code> on these four orders, inspects what it stores, and then predicts for order D alone:</p>
  <div class="fx" data-lang="py">bn = nn.BatchNorm1d(2)
xb = torch.tensor([[1., 0.], [1., 15.], [9., 0.], [9., 15.]])     # orders A-D in km and mm/h
bn.train(); print(bn(xb).detach().round(decimals=3))
print("running_mean", bn.running_mean.tolist(), " running_var", [round(v, 3) for v in bn.running_var.tolist()])
print("learnable:", [n for n, _ in bn.named_parameters()], " saved stats:", [n for n, _ in bn.named_buffers()])
bn.eval(); print("eval mode, order D alone:", [round(v, 3) for v in bn(xb[3:]).detach()[0].tolist()])
ln = nn.LayerNorm(2)
print("LayerNorm, per order:", ln(xb).detach().round(decimals=3).tolist())</div>
  <div class="fx" data-lang="text">tensor([[-1., -1.],
        [-1.,  1.],
        [ 1., -1.],
        [ 1.,  1.]])
running_mean [0.5, 0.75]  running_var [3.033, 8.4]
learnable: ['weight', 'bias']  saved stats: ['running_mean', 'running_var', 'num_batches_tracked']
eval mode, order D alone: [4.88, 4.917]
LayerNorm, per order: [[1.0, -1.0], [-1.0, 1.0], [1.0, -1.0], [-1.0, 1.0]]</div>
  <p>The output matches the hand values. The next lines answer an important question: at prediction time we may have a single order, with no batch to average over. So during training BN also keeps <strong>running averages</strong> of the means and variances it has seen, nudging them 10% of the way towards each new batch's values (from 0 to 0.1 × 5 = 0.5 for distance after one batch). In evaluation mode it uses those saved values instead of batch statistics, which makes predictions deterministic and independent of what else is in the batch. After only one batch the running averages are still far from the truth, which is why order D alone comes out as 4.88 rather than 1; after many training batches they settle. The parameter listing shows γ and β stored as <code>weight</code> and <code>bias</code>, learned by gradient descent, while the running statistics are <strong>buffers</strong>: saved with the model but not trained. This train/eval difference is why you must call <code>model.eval()</code> before validating.</p>
  <p>The last line shows the close relative, <strong>layer normalisation</strong> (LayerNorm). Instead of standardising each feature across the batch, it standardises each example across its own features, so order A's two values [1, 0] become [1, −1]. It does not depend on the batch at all, which makes it the choice for Transformers, RNNs and tiny batches, where batch statistics are unreliable. Now the six-layer network that was stuck at 0.52, with a BatchNorm after each hidden layer and the default initialisation left alone:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0); deep_bn = mlp(depth=6, bn=True)
h = fit(deep_bn, torch.optim.SGD(deep_bn.parameters(), lr=0.05, momentum=0.9), epochs=20)
print("6 layers, default init + BatchNorm |", show(h, [1, 10, 20]))</div>
  <div class="fx" data-lang="text">6 layers, default init + BatchNorm | ep1: tr 0.486 va 0.647 acc 0.645  ep10: tr 0.320 va 0.293 acc 0.895  ep20: tr 0.272 va 0.237 acc 0.930</div>
  <p>It learns from the first epoch and reaches 0.93, without touching the initialisation. BatchNorm makes networks far less sensitive to starting weights and allows larger learning rates. Exactly why it helps so much is still debated; the original explanation ("internal covariate shift") is disputed, and the better-supported view is that it makes the loss landscape smoother. It is usually placed as Linear (or Conv) → BN → ReLU, and the layer before BN can drop its own bias, since β does the same job. With very small batches, say under 8, batch statistics become noise, and LayerNorm or GroupNorm is used instead.</p>

  <h2 id="dt-over"><span class="num">06</span>Overfitting</h2>
  <p>With good steps, sensible starting weights and normalisation, the network now trains reliably. That raises the opposite problem. A network with thousands of weights and only a few hundred examples can memorise every training example, including the ones whose labels are wrong. A student who memorises last year's question paper scores 100% on that paper and fails the real exam, because they learned the answers instead of the subject. In machine learning this is <strong>overfitting</strong>: the model fits the training data, noise and all, so well that it gets worse on new data. Its opposite, <strong>underfitting</strong>, is a model too weak or too briefly trained to capture even the real pattern, so it is poor on both training and new data.</p>
  <p>Let us make overfitting happen deliberately. We take only 200 training orders, with 10% of labels flipped, and a much bigger network (2 → 128 → 128 → 1), train for 600 epochs, and validate on 1,000 fresh orders:</p>
  <div class="fx" data-lang="py">Xs, ys = make_orders(200, noise=0.1, seed=1)          # small, noisy training set
Xbig, ybig = make_orders(1000, noise=0.1, seed=2)      # fresh orders to validate on
def overfit_run(wd=0.0, p=0.0, epochs=600):
    torch.manual_seed(0); net = mlp(hidden=128, p=p)
    opt = torch.optim.AdamW(net.parameters(), lr=1e-2, weight_decay=wd)
    h = fit(net, opt, epochs, Xt=Xs, yt=ys, Xv=Xbig, yv=ybig, bs=200)
    best = min(range(epochs), key=lambda e: h[e][1])
    return net, h, best
net0, h_over, best0 = overfit_run()
print("params:", sum(q.numel() for q in net0.parameters()))
print("no regularisation |", show(h_over, [19, 100, 600]))
print(f"best val loss {h_over[best0][1]:.3f} at epoch {best0 + 1}; final train acc {evaluate(net0, Xs, ys)[1]:.3f}")</div>
  <div class="fx" data-lang="text">params: 17025
no regularisation | ep19: tr 0.369 va 0.436 acc 0.863  ep100: tr 0.291 va 0.447 acc 0.870  ep600: tr 0.180 va 0.742 acc 0.856
best val loss 0.436 at epoch 19; final train acc 0.930</div>
  <p>Read the three snapshots in order. At epoch 19 the validation loss reaches its best value, 0.436. After that the training loss keeps falling, to 0.18 by epoch 600 with 93% training accuracy, which is suspicious when 10% of the labels are wrong: the network is getting "right" answers on orders whose labels are wrong. Meanwhile the validation loss climbs back up to 0.742. The network is bending its decision boundary around individual mislabelled orders. Validation accuracy drops less than the loss does, because accuracy only counts right or wrong, while the loss also punishes the network for being confidently wrong, which is exactly what a memorising model becomes.</p>
  <p>So the signature of overfitting is a growing gap between training loss and validation loss, the <strong>generalisation gap</strong>. The family of techniques that fight it is called <strong>regularisation</strong>: anything that makes memorising harder, so that the network has to learn the general pattern instead. It usually costs a little training accuracy and gains more on new data. The best regulariser of all is more data, but when that is not available, the next three sections give the standard tools. (The theory, including the bias–variance trade-off, is in <a class="xref" data-note="ml_regularization">Regularization</a>.)</p>

  <h2 id="dt-wd"><span class="num">07</span>Weight Decay and L1</h2>
  <p>A boundary that twists around individual orders needs some very large weights, because sharp bends come from big numbers. So one way to discourage memorising is to make large weights expensive. <strong>L2 regularisation</strong> adds a penalty λ·Σw² to the loss, the sum of all squared weights times a strength λ (lambda) that you choose. The gradient of λw² is 2λw, so each update gains an extra term that pulls every weight towards zero in proportion to its size: w ← w − lr·(g + 2λw). Because this shrinks every weight by a small fraction at every step, it is usually called <strong>weight decay</strong>. Think of it as a tax on complexity: the network may still use big weights, but only where they pay for themselves in lower loss.</p>
  <p>There is a catch with Adam. If you add the penalty to the gradient, Adam's per-weight scaling then divides it by √s, so weights with large gradients are barely decayed at all, which is not what we wanted. <strong>AdamW</strong> fixes this by <em>decoupling</em> the decay: it takes the normal Adam step on the loss gradient, and separately shrinks each weight by w ← w − lr·λ·w. By hand, with lr 0.01 and λ = 1 (AdamW's <code>weight_decay</code>), a weight of 0.8 loses 0.01 × 1 × 0.8 = 0.008 per step on top of its Adam step. This is why <code>torch.optim.Adam(..., weight_decay=...)</code> and <code>torch.optim.AdamW(..., weight_decay=...)</code> behave differently, and why AdamW is the standard for Transformers. The code repeats the overfitting run with weight decay 1.0:</p>
  <div class="fx" data-lang="py">net_wd, h_wd, _ = overfit_run(wd=1.0)
print("weight decay 1.0  |", show(h_wd, [19, 100, 600]))
print("first-layer mean |w|: none", round(net0[0].weight.abs().mean().item(), 3),
      "| weight decay", round(net_wd[0].weight.abs().mean().item(), 3))</div>
  <div class="fx" data-lang="text">weight decay 1.0  | ep19: tr 0.396 va 0.442 acc 0.867  ep100: tr 0.319 va 0.424 acc 0.871  ep600: tr 0.317 va 0.414 acc 0.873
first-layer mean |w|: none 0.456 | weight decay 0.079</div>
  <p>The validation loss no longer climbs: it keeps improving slowly and ends at 0.414, its best value, instead of 0.742. The training loss stays higher (0.317 against 0.180), which is the point: the network is no longer free to chase every noisy label. The last line shows the mechanism directly: the average size of the first layer's weights is 0.456 without weight decay and 0.079 with it.</p>
  <p><strong>L1 regularisation</strong> uses the absolute values instead, adding λ·Σ|w|. Its gradient is λ times the sign of w, a pull towards zero of the <em>same</em> strength whatever the weight's size. L2's pull fades as a weight gets small, so L2 makes weights small but rarely exactly zero; L1 keeps pulling at full strength, so weights that do not help the loss are driven all the way to (or very near) zero. That makes L1 a built-in feature selector. To see it, add three junk columns of random numbers, unrelated to lateness, to the 200 orders, and compare the first layer's average weight size per input with and without an L1 penalty:</p>
  <div class="fx" data-lang="py">g = torch.Generator().manual_seed(5)
Xj = torch.cat([Xs, torch.rand(200, 3, generator=g)], 1)       # far, rain, junk1, junk2, junk3
for name, lam in [("no penalty", 0.0), ("L1 penalty", 0.01)]:
    torch.manual_seed(0); net = mlp(hidden=64, d_in=5); opt = torch.optim.Adam(net.parameters(), lr=1e-2)
    for _ in range(300):
        opt.zero_grad()
        loss = F.binary_cross_entropy_with_logits(net(Xj).squeeze(1), ys) + lam * net[0].weight.abs().sum()
        loss.backward(); opt.step()
    print(f"{name}: mean |w| per input (far, rain, junk1-3):", [round(v, 3) for v in net[0].weight.abs().mean(0).tolist()])</div>
  <div class="fx" data-lang="text">no penalty: mean |w| per input (far, rain, junk1-3): [0.355, 0.435, 0.327, 0.234, 0.216]
L1 penalty: mean |w| per input (far, rain, junk1-3): [0.034, 0.04, 0.012, 0.009, 0.008]</div>
  <p>Without a penalty the network gives the junk columns weights almost as large as the real ones (0.22–0.33 against 0.36–0.44), because with 200 noisy orders random numbers can appear to help. With L1 everything shrinks, but the junk columns shrink much more, to about a quarter of the real columns' size. (Plain gradient steps on |w| only jitter around zero; landing exactly on zero needs a special "soft-threshold" step, as Lasso solvers use. See <a class="xref" data-note="ml_ridge_lasso">Ridge &amp; Lasso</a>.)</p>

  <h2 id="dt-drop"><span class="num">08</span>Dropout</h2>
  <p>A different way to overfit is through co-dependence: a few neurons learn to rely on very specific combinations of each other that happen to fit the training noise. In a group project where one strong student always does the work, the others learn nothing, and the team collapses if that student is ill. <strong>Dropout</strong> prevents this by switching off a random fraction p of a layer's neurons at every training step, setting their outputs to zero, with a different random set each step. No neuron can rely on a particular partner being present, so the network has to learn several redundant ways to reach the answer, which generalise better. One way to see it is that each step trains a different thinned-out network, and the final network behaves like an average of all of them.</p>
  <p>Switching off neurons lowers the total signal that reaches the next layer, so the surviving outputs are multiplied by 1/(1 − p) to keep the expected total the same. At evaluation time dropout is turned off completely and every neuron takes part. Doing the rescaling during training, so that nothing at all needs to change at prediction time, is called <strong>inverted dropout</strong>, and it is what every modern library does. The code shows a dropout layer with p = 0.5 on eight 1s in each mode, then repeats the overfitting run with dropout 0.3 after each hidden layer:</p>
  <div class="fx" data-lang="py">drop = nn.Dropout(p=0.5); ones = torch.ones(8)
torch.manual_seed(0)
drop.train(); print("train:", drop(ones).tolist())
drop.eval();  print("eval: ", drop(ones).tolist())
_, h_dr, _ = overfit_run(p=0.3)
print("dropout 0.3       |", show(h_dr, [19, 100, 600]))</div>
  <div class="fx" data-lang="text">train: [0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 2.0, 2.0]
eval:  [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
dropout 0.3       | ep19: tr 0.410 va 0.450 acc 0.837  ep100: tr 0.346 va 0.427 acc 0.877  ep600: tr 0.264 va 0.501 acc 0.874</div>
  <p>In training mode five of the eight values were dropped to 0 and the three survivors became 2.0 = 1/(1 − 0.5), so the average stays about 1; in evaluation mode everything passes through unchanged. On the overfitting run, dropout slows the damage a lot: validation loss is 0.427 at epoch 100 (against 0.447 without), and 0.501 at the end instead of 0.742, with the best final accuracy of the three runs. It does not stop the slow climb entirely, which is why dropout is usually combined with the next technique. Dropout is most useful in large fully connected layers; typical rates are 0.1 to 0.5. Because it is random, forgetting to switch to evaluation mode before predicting gives a different answer every time you ask, as the Common Mistakes section shows.</p>

  <h2 id="dt-es"><span class="num">09</span>Early Stopping</h2>
  <p>Look again at the unregularised run: the network was at its best at epoch 19, and everything after that made it worse. The simplest regulariser of all is to notice that and keep the network from that moment. <strong>Early stopping</strong> means checking the validation loss after every epoch, saving a copy of the weights whenever it reaches a new best, and stopping once it has not improved for a set number of epochs called the <strong>patience</strong>; at the end you restore the saved best weights. It is like handing in an exam when your answers are at their best, before second-guessing starts to make them worse. It also saves time, because the run ends instead of continuing for hundreds of useless epochs. There is a neat connection to weight decay: weights start small and grow during training, so stopping early limits how large they can become, which has an effect similar to an L2 penalty.</p>
  <p>The code writes early stopping out in full, with a patience of 20 epochs, and runs it on the unregularised 200-order setup. It then lists the final validation results of the three full 600-epoch runs for comparison:</p>
  <div class="fx" data-lang="py">import copy
def fit_early_stop(net, opt, max_epochs, patience, **kw):
    best_loss, best_state, best_ep, waited = float("inf"), None, 0, 0
    for ep in range(1, max_epochs + 1):
        tr, va, acc = fit(net, opt, 1, **kw)[0]           # one more epoch
        if va &lt; best_loss:                                # improved: remember these weights
            best_loss, best_state, best_ep, waited = va, copy.deepcopy(net.state_dict()), ep, 0
        else:
            waited += 1
            if waited == patience: break                  # no improvement for "patience" epochs
    net.load_state_dict(best_state)                       # go back to the best moment
    return best_ep, ep

torch.manual_seed(0); net = mlp(hidden=128)
best_ep, stopped = fit_early_stop(net, torch.optim.AdamW(net.parameters(), lr=1e-2, weight_decay=0.0), 600,
                                  patience=20, Xt=Xs, yt=ys, Xv=Xbig, yv=ybig, bs=200)
print(f"stopped at epoch {stopped}, restored epoch {best_ep}:", "val loss %.3f acc %.3f" % evaluate(net, Xbig, ybig))
print(f"{'method':18s} final val loss  final acc")
for name, h in [("none", h_over), ("weight decay 1.0", h_wd), ("dropout 0.3", h_dr)]:
    print(f"{name:18s} {h[-1][1]:.3f}           {h[-1][2]:.3f}")</div>
  <div class="fx" data-lang="text">stopped at epoch 39, restored epoch 19: val loss 0.436 acc 0.863
method             final val loss  final acc
none               0.742           0.856
weight decay 1.0   0.414           0.873
dropout 0.3        0.501           0.874</div>
  <p>Training stopped at epoch 39, twenty epochs after the best one, and restored the weights from epoch 19, giving validation loss 0.436 after only 39 epochs of work instead of 600. Comparing everything on the same 200 orders: no regularisation ends at 0.742; weight decay ends at 0.414, its lowest point; dropout ends at 0.501; early stopping keeps 0.436. In practice these are combined rather than chosen between: modest weight decay, dropout in large fully connected layers, and always keeping the best-validation checkpoint. Two cautions. The patience must be long enough to ride out normal noise in the validation loss. And the validation set must be honest: if you use it to pick the stopping epoch, the learning rate and the regularisation strength, it has been used for tuning, so the final reported number should come from a separate test set.</p>

  <h2 id="dt-loop"><span class="num">10</span>Reading Loss Curves</h2>
  <p>We now have a toolbox: optimisers, schedules, initialisation, normalisation and three regularisers. On a real project nobody tells you which problem your run has; you have to read it off the run itself. The main instrument is the <strong>learning curve</strong>, or loss curve: training loss and validation loss plotted against the epoch number. Like a doctor reading a temperature chart, you learn to recognise a few shapes, each of which points to a different fix.</p>
  <p>The code below combines the whole page into one recipe for the 800/200 delivery orders: AdamW with a small weight decay, a cosine schedule, and <strong>gradient clipping</strong>, which rescales the whole gradient whenever its overall length (norm) exceeds a limit, here 1, as cheap insurance against a single bad batch producing a huge step. It uses PyTorch's default initialisation, because with only two hidden layers the variance problem does not arise. Then it runs two deliberately bad variants, a learning rate that is far too high and one far too low, and prints the overfitting run from section 06 alongside:</p>
  <div class="fx" data-lang="py">def full_run(lr=1e-2, epochs=40, wd=1e-4):
    torch.manual_seed(0); net = mlp()                                  # default init is fine at depth 2
    opt = torch.optim.AdamW(net.parameters(), lr=lr, weight_decay=wd)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)
    return net, fit(net, opt, epochs, sched=sched, clip=1.0)          # clip gradient norm at 1

net_good, h_good = full_run()
print("healthy     |", show(h_good, [1, 10, 40]))
_, h_high = full_run(lr=0.5);  print("lr too high |", show(h_high, [1, 10, 40]))
_, h_low = full_run(lr=1e-4);  print("lr too low  |", show(h_low, [1, 10, 40]))
print("overfitting |", show(h_over, [19, 100, 600]))</div>
  <div class="fx" data-lang="text">healthy     | ep1: tr 0.689 va 0.679 acc 0.545  ep10: tr 0.291 va 0.276 acc 0.950  ep40: tr 0.266 va 0.251 acc 0.950
lr too high | ep1: tr 2.251 va 0.707 acc 0.480  ep10: tr 0.697 va 0.694 acc 0.520  ep40: tr 0.693 va 0.693 acc 0.520
lr too low  | ep1: tr 0.695 va 0.694 acc 0.520  ep10: tr 0.691 va 0.690 acc 0.520  ep40: tr 0.687 va 0.687 acc 0.520
overfitting | ep19: tr 0.369 va 0.436 acc 0.863  ep100: tr 0.291 va 0.447 acc 0.870  ep600: tr 0.180 va 0.742 acc 0.856</div>
  <figure class="viz"><svg viewBox="0 0 680 175" width="680">
<rect x="10" y="30" width="150" height="110" fill="none" stroke="currentColor" opacity="0.25"/><line x1="10" y1="55" x2="160" y2="55" stroke="currentColor" stroke-dasharray="2 3" opacity="0.4"/><polyline points="10,56 14,59 18,68 22,81 25,94 29,100 33,100 37,102 41,104 45,104 48,105 52,105 56,105 60,106 64,106 68,106 72,106 75,106 79,107 83,107 87,106 91,107 95,107 98,107 102,107 106,107 110,107 114,107 118,107 122,107 125,107 129,107 133,107 137,107 141,107 145,107 148,107 152,108 156,108 160,108" fill="none" class="sb" stroke-width="1.8"/><polyline points="10,57 14,62 18,73 22,88 25,98 29,100 33,105 37,104 41,105 45,106 48,107 52,107 56,107 60,108 64,108 68,108 72,108 75,108 79,109 83,109 87,109 91,109 95,109 98,109 102,109 106,109 110,109 114,109 118,109 122,109 125,109 129,109 133,109 137,109 141,109 145,109 148,109 152,109 156,109 160,109" fill="none" class="sr" stroke-width="1.8"/><text x="85" y="158" text-anchor="middle" font-size="11.5">healthy</text><rect x="180" y="30" width="150" height="110" fill="none" stroke="currentColor" opacity="0.25"/><line x1="180" y1="55" x2="330" y2="55" stroke="currentColor" stroke-dasharray="2 3" opacity="0.4"/><polyline points="180,30 184,54 188,51 192,54 195,54 199,55 203,54 207,55 211,55 215,55 218,54 222,54 226,54 230,55 234,55 238,55 242,55 245,55 249,55 253,55 257,55 261,55 265,55 268,55 272,55 276,55 280,55 284,55 288,55 292,55 295,55 299,55 303,55 307,55 311,55 315,55 318,55 322,55 326,55 330,55" fill="none" class="sb" stroke-width="1.8"/><polyline points="180,54 184,50 188,52 192,55 195,55 199,55 203,55 207,55 211,55 215,55 218,55 222,54 226,55 230,55 234,55 238,54 242,55 245,55 249,55 253,55 257,55 261,55 265,55 268,55 272,55 276,55 280,55 284,55 288,55 292,55 295,55 299,55 303,55 307,55 311,55 315,55 318,55 322,55 326,55 330,55" fill="none" class="sr" stroke-width="1.8"/><text x="255" y="158" text-anchor="middle" font-size="11.5">lr too high (0.5)</text><rect x="350" y="30" width="150" height="110" fill="none" stroke="currentColor" opacity="0.25"/><line x1="350" y1="55" x2="500" y2="55" stroke="currentColor" stroke-dasharray="2 3" opacity="0.4"/><polyline points="350,55 354,55 358,55 362,55 365,55 369,55 373,55 377,55 381,56 385,56 388,56 392,56 396,56 400,56 404,56 408,56 412,56 415,56 419,56 423,56 427,56 431,56 435,56 438,56 442,56 446,56 450,56 454,56 458,56 462,56 465,56 469,56 473,56 477,56 481,56 485,56 488,56 492,56 496,56 500,56" fill="none" class="sb" stroke-width="1.8"/><polyline points="350,55 354,55 358,55 362,55 365,55 369,56 373,56 377,56 381,56 385,56 388,56 392,56 396,56 400,56 404,56 408,56 412,56 415,56 419,56 423,56 427,56 431,56 435,56 438,56 442,56 446,56 450,56 454,56 458,56 462,56 465,56 469,56 473,56 477,56 481,56 485,56 488,56 492,56 496,56 500,56" fill="none" class="sr" stroke-width="1.8"/><text x="425" y="158" text-anchor="middle" font-size="11.5">lr too low (1e-4)</text><rect x="520" y="30" width="150" height="110" fill="none" stroke="currentColor" opacity="0.25"/><line x1="520" y1="55" x2="670" y2="55" stroke="currentColor" stroke-dasharray="2 3" opacity="0.4"/><polyline points="520,55 520,53 521,57 521,56 521,59 521,60 522,62 522,64 522,67 522,69 523,72 523,75 523,79 523,82 524,85 524,88 524,91 524,93 525,95 525,96 525,97 525,98 526,98 526,98 526,98 526,98 527,98 527,98 527,99 527,99 528,99 528,99 528,99 528,99 529,99 529,99 529,99 529,100 530,100 530,100 530,100 530,100 531,100 531,100 531,101 531,101 532,101 532,101 532,101 532,101 533,101 533,101 533,101 533,101 534,101 534,102 534,102 534,102 535,102 535,102 535,102 535,102 536,102 536,102 536,102 536,102 537,102 537,102 537,102 537,102 538,103 538,102 538,102 538,103 539,103 539,103 539,103 539,103 540,103 540,103 540,103 540,103 541,104 541,103 541,104 541,104 542,104 542,104 542,104 542,104 543,104 543,104 543,104 543,104 544,104 544,104 544,104 544,104 545,104 545,104 545,105 545,105 546,105 546,105 546,105 546,105 547,105 547,105 547,105 547,105 548,105 548,105 548,105 548,105 549,105 549,105 549,105 549,105 550,106 550,106 550,106 550,106 551,106 551,106 551,106 551,106 552,105 552,105 552,105 552,106 553,106 553,106 553,105 553,106 554,106 554,106 554,106 554,107 555,106 555,106 555,106 555,107 556,107 556,106 556,107 556,107 557,107 557,107 557,107 557,107 558,107 558,107 558,107 558,107 559,107 559,108 559,108 559,108 560,108 560,108 560,108 560,108 561,108 561,108 561,108 561,108 562,108 562,108 562,108 562,108 563,107 563,107 563,107 563,108 564,108 564,108 564,108 564,108 565,108 565,109 565,109 565,108 566,108 566,109 566,109 566,109 567,109 567,109 567,109 567,109 568,109 568,109 568,109 568,109 569,109 569,109 569,109 569,109 570,109 570,109 570,109 570,110 571,110 571,110 571,110 571,109 572,109 572,109 572,110 572,110 573,110 573,110 573,110 573,110 574,110 574,110 574,110 574,110 575,110 575,110 575,110 575,110 576,110 576,110 576,110 576,110 577,110 577,110 577,110 577,110 578,111 578,111 578,111 578,111 579,110 579,110 579,110 579,110 580,111 580,111 580,111 580,111 581,111 581,110 581,111 581,111 582,111 582,111 582,111 582,111 583,111 583,111 583,111 583,111 584,112 584,112 584,112 584,111 585,111 585,111 585,112 585,112 586,112 586,112 586,112 586,112 587,112 587,111 587,111 587,111 588,111 588,112 588,112 588,112 589,112 589,111 589,112 589,112 590,112 590,112 590,112 590,112 591,112 591,112 591,112 591,112 592,113 592,113 592,112 592,112 593,112 593,112 593,112 593,112 594,113 594,113 594,113 594,113 595,113 595,113 595,113 595,113 596,113 596,112 596,112 596,112 597,111 597,112 597,113 597,113 598,113 598,112 598,112 598,112 599,113 599,113 599,113 599,113 600,113 600,113 600,113 600,113 601,113 601,114 601,114 601,113 602,113 602,113 602,113 602,113 603,113 603,113 603,113 603,113 604,114 604,114 604,114 604,114 605,114 605,114 605,114 605,114 606,114 606,114 606,113 606,113 607,113 607,113 607,113 607,114 608,114 608,114 608,114 608,114 609,114 609,113 609,113 609,113 610,114 610,114 610,114 610,114 611,114 611,114 611,114 611,114 612,114 612,114 612,115 612,115 613,115 613,114 613,114 613,114 614,114 614,113 614,114 614,114 615,115 615,115 615,115 615,115 616,114 616,114 616,114 616,114 617,114 617,114 617,114 617,115 618,115 618,115 618,115 618,114 619,114 619,114 619,114 619,114 620,115 620,115 620,115 620,115 621,114 621,115 621,115 621,115 622,115 622,115 622,115 622,115 623,115 623,115 623,115 623,115 624,115 624,115 624,115 624,114 625,114 625,112 625,113 625,114 626,115 626,116 626,115 626,115 627,115 627,115 627,116 627,115 628,116 628,116 628,116 628,116 629,116 629,116 629,116 629,116 630,116 630,116 630,116 630,115 631,115 631,114 631,114 631,114 632,115 632,116 632,116 632,116 633,115 633,115 633,115 633,116 634,116 634,116 634,116 634,116 635,116 635,116 635,116 635,116 636,116 636,116 636,116 636,116 637,116 637,116 637,116 637,116 638,116 638,116 638,115 638,115 639,112 639,114 639,114 639,116 640,116 640,113 640,115 640,116 641,116 641,116 641,114 641,115 642,116 642,116 642,116 642,116 643,116 643,117 643,116 643,116 644,116 644,117 644,117 644,117 645,117 645,117 645,117 645,117 646,117 646,117 646,117 646,117 647,117 647,117 647,117 647,117 648,117 648,117 648,117 648,117 649,117 649,117 649,117 649,117 650,117 650,117 650,116 650,116 651,115 651,116 651,116 651,117 652,117 652,117 652,116 652,116 653,116 653,117 653,117 653,117 654,117 654,117 654,117 654,117 655,117 655,117 655,116 655,117 656,117 656,117 656,118 656,117 657,117 657,117 657,117 657,117 658,117 658,117 658,117 658,117 659,117 659,118 659,118 659,118 660,118 660,118 660,118 660,118 661,118 661,118 661,117 661,117 662,115 662,115 662,115 662,117 663,118 663,118 663,117 663,116 664,116 664,115 664,116 664,118 665,117 665,117 665,116 665,117 666,118 666,117 666,118 666,117 667,118 667,118 667,118 667,118 668,118 668,118 668,118 668,118 669,118 669,118 669,118 669,118 670,118 670,118" fill="none" class="sb" stroke-width="1.8"/><polyline points="520,53 520,57 521,56 521,59 521,60 521,61 522,63 522,66 522,68 522,70 523,73 523,76 523,78 523,81 524,83 524,85 524,86 524,86 525,87 525,86 525,86 525,85 526,85 526,84 526,83 526,83 527,83 527,83 527,83 527,83 528,83 528,83 528,83 528,83 529,84 529,84 529,84 529,84 530,84 530,84 530,84 530,85 531,85 531,85 531,85 531,85 532,85 532,85 532,85 532,85 533,85 533,85 533,86 533,85 534,86 534,86 534,86 534,86 535,86 535,86 535,86 535,86 536,86 536,86 536,86 536,86 537,85 537,85 537,85 537,86 538,85 538,85 538,86 538,85 539,85 539,86 539,85 539,85 540,85 540,85 540,85 540,85 541,85 541,85 541,85 541,85 542,85 542,85 542,85 542,85 543,85 543,85 543,85 543,85 544,85 544,85 544,85 544,85 545,85 545,85 545,85 545,85 546,85 546,85 546,85 546,85 547,85 547,85 547,85 547,85 548,85 548,85 548,85 548,85 549,85 549,85 549,85 549,85 550,85 550,85 550,85 550,85 551,85 551,85 551,84 551,84 552,83 552,84 552,84 552,85 553,84 553,83 553,85 553,85 554,84 554,85 554,85 554,84 555,85 555,84 555,85 555,85 556,84 556,85 556,85 556,84 557,85 557,84 557,85 557,85 558,84 558,84 558,84 558,84 559,84 559,84 559,84 559,84 560,84 560,84 560,84 560,84 561,84 561,84 561,84 561,84 562,84 562,83 562,84 562,82 563,83 563,82 563,83 563,83 564,83 564,83 564,83 564,84 565,83 565,83 565,83 565,83 566,83 566,83 566,83 566,83 567,83 567,83 567,83 567,83 568,83 568,83 568,83 568,82 569,83 569,82 569,83 569,81 570,82 570,81 570,83 570,83 571,82 571,82 571,81 571,82 572,81 572,82 572,82 572,82 573,82 573,81 573,82 573,81 574,82 574,81 574,82 574,82 575,82 575,82 575,81 575,81 576,81 576,81 576,80 576,81 577,80 577,81 577,80 577,81 578,81 578,80 578,81 578,79 579,80 579,79 579,80 579,80 580,80 580,80 580,80 580,80 581,78 581,80 581,79 581,80 582,79 582,79 582,79 582,78 583,79 583,78 583,79 583,79 584,79 584,79 584,78 584,79 585,78 585,78 585,78 585,78 586,78 586,78 586,78 586,77 587,78 587,76 587,77 587,75 588,77 588,77 588,77 588,77 589,76 589,77 589,76 589,77 590,77 590,76 590,77 590,75 591,76 591,75 591,76 591,76 592,76 592,77 592,75 592,76 593,75 593,76 593,75 593,75 594,75 594,75 594,75 594,75 595,75 595,75 595,76 595,74 596,75 596,73 596,74 596,71 597,74 597,73 597,74 597,74 598,72 598,73 598,72 598,74 599,73 599,73 599,74 599,73 600,73 600,72 600,73 600,73 601,73 601,73 601,72 601,73 602,72 602,73 602,71 602,72 603,71 603,72 603,71 603,71 604,72 604,72 604,72 604,71 605,72 605,71 605,72 605,70 606,71 606,70 606,71 606,68 607,70 607,68 607,71 607,70 608,70 608,70 608,69 608,70 609,67 609,69 609,67 609,70 610,69 610,69 610,70 610,69 611,70 611,67 611,69 611,68 612,69 612,68 612,68 612,69 613,68 613,69 613,67 613,68 614,66 614,68 614,66 614,67 615,67 615,68 615,68 615,66 616,68 616,66 616,67 616,65 617,67 617,66 617,67 617,66 618,66 618,66 618,65 618,66 619,63 619,65 619,64 619,66 620,65 620,65 620,66 620,65 621,66 621,63 621,65 621,65 622,65 622,65 622,64 622,65 623,65 623,65 623,64 623,64 624,64 624,65 624,62 624,62 625,58 625,62 625,60 625,62 626,63 626,63 626,64 626,62 627,63 627,63 627,64 627,63 628,62 628,63 628,63 628,63 629,62 629,62 629,62 629,63 630,62 630,62 630,61 630,62 631,59 631,61 631,57 631,61 632,60 632,61 632,61 632,59 633,61 633,59 633,61 633,61 634,61 634,61 634,59 634,60 635,59 635,61 635,60 635,60 636,60 636,60 636,60 636,59 637,59 637,59 637,60 637,59 638,59 638,57 638,59 638,52 639,58 639,55 639,58 639,58 640,54 640,58 640,57 640,58 641,58 641,55 641,59 641,57 642,57 642,58 642,56 642,58 643,57 643,56 643,58 643,57 644,58 644,57 644,57 644,58 645,57 645,58 645,56 645,57 646,57 646,56 646,57 646,56 647,57 647,56 647,57 647,56 648,56 648,56 648,56 648,55 649,56 649,55 649,56 649,55 650,56 650,53 650,55 650,51 651,54 651,52 651,55 651,55 652,54 652,55 652,52 652,55 653,53 653,55 653,54 653,54 654,55 654,53 654,55 654,52 655,54 655,52 655,54 655,53 656,53 656,54 656,53 656,54 657,52 657,53 657,51 657,54 658,51 658,53 658,52 658,53 659,52 659,52 659,52 659,52 660,52 660,52 660,52 660,52 661,52 661,50 661,51 661,47 662,51 662,46 662,50 662,50 663,51 663,51 663,48 663,50 664,47 664,51 664,50 664,48 665,50 665,48 665,51 665,49 666,48 666,51 666,50 666,51 667,49 667,49 667,50 667,49 668,50 668,48 668,49 668,49 669,49 669,48 669,48 669,50 670,49 670,49" fill="none" class="sr" stroke-width="1.8"/><text x="595" y="158" text-anchor="middle" font-size="11.5">overfitting (200 orders)</text>
<text x="10" y="18" font-size="10.5" class="tb">blue = training loss</text><text x="140" y="18" font-size="10.5" class="tr">red = validation loss</text><text x="280" y="18" font-size="10.5" class="tm">dotted = ln 2 (knows nothing); y-axis 0 to 0.9, x-axis epochs</text>
</svg><figcaption>The four runs above as curves. Healthy: both curves fall together and flatten. Too high: the loss jumps and then sits at ln 2. Too low: both curves crawl along ln 2. Overfitting: training loss keeps falling while validation loss turns up.</figcaption></figure>
  <p>Walk through the four panels. In the healthy run both curves drop quickly and flatten together, close to each other, at about 0.95 accuracy, the ceiling set by the 5% wrong labels. With lr 0.5, the first epoch's training loss jumps to 2.25, far above ln 2, and then the network dies: from epoch 10 on it sits at exactly 0.693 and gives the same answer for every order, because the huge early steps pushed its ReLU neurons into the region where they output zero for every input and so receive no gradient (dead ReLUs). With lr 0.0001 nothing is broken; both curves are almost flat lines just under ln 2, creeping from 0.695 to 0.687 in 40 epochs. In the overfitting panel the two curves separate: blue keeps falling while red turns upwards after its minimum. The table turns these shapes into a checklist.</p>
  <table class="tbl">
    <tr><th>What you see</th><th>Diagnosis</th><th>Reach for</th></tr>
    <tr><td>Both fall together, small gap, then flatten</td><td>Healthy</td><td>done; a bigger model if both are still high</td></tr>
    <tr><td>Both stay near the starting loss (ln 2) for many epochs</td><td>Not learning: lr too low, vanishing signal, or a bug</td><td>raise lr, He init or BatchNorm, overfit one batch to test the code</td></tr>
    <tr><td>Spikes, a jump then a poor plateau, or NaN</td><td>lr too high or exploding gradients</td><td>lower lr, warm-up, gradient clipping</td></tr>
    <tr><td>Training keeps falling, validation turns up</td><td>Overfitting</td><td>early stopping, weight decay, dropout, more data</td></tr>
    <tr><td>Both high and close together, flat</td><td>Underfitting</td><td>bigger network, longer training, better features; less regularisation</td></tr>
  </table>
  <p>Two cheap checks belong before any long run. First, the loss at step zero should be what an untrained model predicts: ln 2 ≈ 0.693 for a yes/no task, ln C for C classes. Second, the model should be able to drive the loss on one small batch of, say, 64 examples almost to zero. If it cannot even memorise 64 examples, something in the code is broken, and more data or more epochs will not help (<a class="xref" data-note="dl_pytorch">PyTorch</a> shows this check). And when comparing runs, change one setting at a time with a fixed seed, or you cannot tell which change caused the difference.</p>

  <h2 id="dt-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common training mistake is forgetting to switch the model to evaluation mode before validating or predicting. Dropout then stays on, and BatchNorm keeps using the statistics of whatever batch it is given. Here a network with dropout 0.3 is asked three times about the same far, dry order:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0); net = mlp(p=0.3)
fit(net, torch.optim.Adam(net.parameters(), lr=1e-2), epochs=10)
order = torch.tensor([[0.85, 0.15]])                       # 8.5 km, 3 mm/h: far and dry
net.train()                                                # forgot net.eval()
print("train mode:", [round(torch.sigmoid(net(order)).item(), 3) for _ in range(3)])
net.eval()
print("eval mode: ", [round(torch.sigmoid(net(order)).item(), 3) for _ in range(3)])</div>
  <div class="fx" data-lang="text">train mode: [0.824, 0.924, 0.836]
eval mode:  [0.956, 0.956, 0.956]</div>
  <p>In training mode the same order gets three different probabilities, because a different set of neurons is dropped each time, and all of them are lower than the true prediction. After <code>net.eval()</code> the answer is the same every time. Call <code>model.eval()</code> before validation and prediction, and <code>model.train()</code> again before the next training epoch.</p>
  <p>A second mistake is stepping a learning-rate scheduler at the wrong frequency. A cosine schedule defined over 40 epochs but stepped after every batch runs through its whole schedule 13 times too fast:</p>
  <div class="fx" data-lang="py">opt = torch.optim.Adam([nn.Parameter(torch.zeros(1))], lr=0.05)
s = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=40)      # meant: 40 epochs
for epoch in range(3):
    for batch in range(13):                                        # 13 batches per epoch
        opt.step(); s.step()                                       # wrong: stepped per batch
    print(f"after epoch {epoch + 1}: lr = {opt.param_groups[0]['lr']:.4f}")</div>
  <div class="fx" data-lang="text">after epoch 1: lr = 0.0381
after epoch 2: lr = 0.0137
after epoch 3: lr = 0.0001</div>
  <p>After just three epochs the learning rate is already at the bottom of a schedule meant to last forty, so training effectively stops making progress. Step a per-epoch scheduler once per epoch, after <code>optimizer.step()</code>; if you want a per-batch schedule, define its length in batches.</p>
  <p>A third mistake catches people who use BatchNorm: a final training batch of size one. With a single example there is no batch variance to compute, and PyTorch refuses:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0); net = mlp(bn=True)
try:
    net(Xtr[:1])                                           # a final batch holding one order
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">ValueError: Expected more than 1 value per channel when training, got input size torch.Size([1, 32])</div>
  <p>The fix is to drop the incomplete last batch (<code>drop_last=True</code> in a DataLoader) or to use LayerNorm. Very small batches, even when they do not crash, give noisy batch statistics and hurt BatchNorm.</p>
  <p>Three more mistakes are about choices rather than code. Using <code>Adam(weight_decay=...)</code> when you meant decoupled decay weakens the regularisation for exactly the weights with large gradients; use <code>AdamW</code>. Adding regularisation to a model that is underfitting makes it worse, because it removes capacity the model needs; check the loss curves first, and regularise only when the gap is growing. And tuning learning rate, patience and regularisation on the test set makes the reported test score optimistic; tune on the validation set and look at the test set once.</p>

  <h2 id="dt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Mini-batch SGD</b>: compute the gradient on a small random batch and step w ← w − lr·g. <b>Epoch</b>: one pass over the training set. <b>Iteration</b>: one batch.</li>
    <li><b>Validation set</b>: held-out data used to judge and tune, never to compute gradients. <b>Test set</b>: touched once, for the final report.</li>
    <li><b>Momentum</b>: step along a running average of gradients. <b>RMSprop</b>: divide each weight's step by its typical gradient size. <b>Adam</b>: both plus bias correction. <b>AdamW</b>: Adam with decoupled weight decay.</li>
    <li><b>Learning-rate schedule</b>: lr changes over training (step, cosine, warm-up, reduce-on-plateau).</li>
    <li><b>Fan-in</b>: number of inputs to a neuron. <b>He init</b>: Var(w) = 2/fan_in (ReLU). <b>Xavier init</b>: Var(w) = 2/(fan_in + fan_out) (tanh, sigmoid).</li>
    <li><b>BatchNorm</b>: standardise each feature over the batch, then γ·ẑ + β; running averages in eval. <b>LayerNorm</b>: standardise each example over its features.</li>
    <li><b>Overfitting</b>: training loss falls while validation loss rises. <b>Underfitting</b>: both high. <b>Regularisation</b>: anything that discourages memorising.</li>
    <li><b>Weight decay (L2)</b>: penalty λΣw², shrinks all weights. <b>L1</b>: penalty λΣ|w|, drives useless weights to zero.</li>
    <li><b>Dropout(p)</b>: zero each unit with probability p in training, scale survivors by 1/(1 − p); off in eval. <b>Early stopping</b>: keep the best-validation weights, stop after "patience" epochs without improvement.</li>
    <li><b>Gradient clipping</b>: rescale the gradient when its norm exceeds a limit.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>Momentum</td><td>v ← βv + g; w ← w − lr·v (β ≈ 0.9)</td></tr>
    <tr><td>Adam</td><td>m ← β₁m + (1−β₁)g; s ← β₂s + (1−β₂)g²; m̂ = m/(1−β₁ᵗ); ŝ = s/(1−β₂ᵗ); w ← w − lr·m̂/(√ŝ + ε)</td></tr>
    <tr><td>Cosine schedule</td><td>lr(t) = ½·lr₀·(1 + cos(πt/T)); lr(T/2) = lr₀/2</td></tr>
    <tr><td>Signal through a layer</td><td>Var(z) = n·Var(w)·Var(x); ReLU halves it; factor n·Var(w)/2 per layer</td></tr>
    <tr><td>BatchNorm</td><td>ẑ = (z − μ_B)/√(σ²_B + ε); out = γẑ + β</td></tr>
    <tr><td>L2 / AdamW decay</td><td>loss + λΣw²; AdamW: w ← w − lr·λ·w after the Adam step</td></tr>
    <tr><td>Dropout</td><td>a ← a·mask/(1 − p) in training; a in eval</td></tr>
  </table>
  <h3>Which tool for which problem</h3>
  <table class="tbl">
    <tr><th>Problem</th><th>Symptom</th><th>Tools</th><th>On the delivery orders</th></tr>
    <tr><td>Slow, zig-zagging steps</td><td>loss falls very slowly</td><td>momentum, Adam</td><td>epoch 5: SGD 0.56, momentum 0.79, Adam 0.945</td></tr>
    <tr><td>Jitter at the end</td><td>validation loss bounces</td><td>schedule (cosine)</td><td>0.24–0.29 → 0.231</td></tr>
    <tr><td>Deep net does not learn</td><td>stuck at ln 2</td><td>He init, BatchNorm</td><td>0.52 → 0.91 (He), 0.93 (BN)</td></tr>
    <tr><td>Memorising noise</td><td>gap grows</td><td>weight decay, dropout, early stopping</td><td>final val loss 0.742 → 0.414 / 0.501 / 0.436</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)
model.apply(lambda m: nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
            if isinstance(m, nn.Linear) else None)              # He init
layers = [nn.Linear(32, 32), nn.BatchNorm1d(32), nn.ReLU(), nn.Dropout(0.3)]
for epoch in range(epochs):
    model.train()
    for x, y in train_dl:
        opt.zero_grad(); loss = loss_fn(model(x), y); loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), 1.0)   # optional clipping
        opt.step()
    sched.step()                                            # once per epoch, after opt.step()
    model.eval()                                            # validate, keep best state_dict</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Step-0 loss should be ln 2 (yes/no) or ln C (C classes); if not, check labels and loss.</li>
    <li>All-equal starting weights → identical neurons. PyTorch's <code>nn.Linear</code> default is not He.</li>
    <li>Forgetting <code>model.eval()</code>: dropout stays on, BatchNorm uses batch statistics.</li>
    <li>Scheduler: once per epoch, after <code>optimizer.step()</code>.</li>
    <li>BatchNorm needs batches larger than 1; tiny batches → LayerNorm/GroupNorm.</li>
    <li><code>Adam(weight_decay)</code> ≠ <code>AdamW</code>.</li>
    <li>Regularise only when overfitting; tune on validation, report on test once.</li>
  </ul>

  <h2 id="dt-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between batch, mini-batch and stochastic gradient descent?</summary><div class="qa-body">Batch gradient descent computes the gradient on the whole training set before each step: exact but slow and memory-hungry. Stochastic gradient descent in the strict sense uses one example per step: cheap but very noisy. Mini-batch SGD uses a small batch (typically 32–256), which gives a good estimate of the gradient, uses the GPU efficiently and makes many updates per epoch; it is what "SGD" means in practice. The mild noise also helps find wide minima that generalise well.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an epoch, and how many iterations are in one?</summary><div class="qa-body">An epoch is one full pass through the training set. The number of iterations (steps) per epoch is the number of batches: ceil(N / batch size). With 800 orders and batch size 64 that is 13, the last batch holding 32.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does momentum help gradient descent?</summary><div class="qa-body">Momentum keeps a running average of past gradients (v = βv + g) and steps along that instead of the current gradient alone. In directions where the gradient keeps flipping sign, like across a narrow valley, the contributions cancel and the oscillation is damped; in directions where it is consistent, they add up and the optimiser speeds up. With β = 0.9 a steady gradient is effectively amplified up to ten times.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Adam. Why does it need bias correction?</summary><div class="qa-body">Adam keeps two running averages per weight: m of the gradient (momentum, for direction) and s of the squared gradient (for a per-weight step size), and steps lr·m̂/(√ŝ + ε). Both averages start at zero, so early on they are biased towards zero; dividing by (1 − βᵗ) corrects this. Thanks to the correction, Adam's first step is about lr in size regardless of the gradient's scale.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between Adam with weight decay and AdamW?</summary><div class="qa-body">In Adam, weight decay is added to the gradient as an L2 term, and then Adam's per-weight scaling divides it by √s, so weights with large gradients are hardly decayed. AdamW decouples the two: it does the Adam step on the loss gradient and separately shrinks every weight by lr·λ·w. This gives the regularisation effect people actually want and is the standard for Transformers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a learning-rate schedule, and what is warm-up?</summary><div class="qa-body">A large learning rate makes fast early progress but bounces around the minimum later; a schedule lowers it over time so training settles (cosine, step decay, reduce-on-plateau). Warm-up starts with a tiny rate and increases it over the first steps, because gradients from random weights and Adam's not-yet-reliable statistics can produce destructive early steps. It is standard for Transformers and large-batch training.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if a learning rate is too high or too low?</summary><div class="qa-body">Too high: the loss spikes, oscillates or becomes NaN, or ReLU units die and the loss sits at the "know nothing" value (our lr 0.5 run jumped to 2.25 then stuck at ln 2). Too low: nothing breaks, but the loss creeps down extremely slowly (our lr 1e-4 run moved from 0.695 to 0.687 in 40 epochs). The usual approach is to try values spaced by factors of about 3–10 and watch the curves.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't we initialise all weights to zero?</summary><div class="qa-body">Every neuron in a layer would compute the same output, get the same gradient and make the same update, so they would remain identical forever and the layer would act like a single neuron. Random initialisation breaks this symmetry. (Biases can start at zero, because the random weights already make the neurons different.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive He initialisation. How does it differ from Xavier?</summary><div class="qa-body">For zero-mean independent weights and inputs, Var(z) = fan_in·Var(w)·Var(x). ReLU zeroes half the signal, so each layer multiplies the signal's second moment by fan_in·Var(w)/2; setting this to 1 gives Var(w) = 2/fan_in. Xavier, Var(w) = 2/(fan_in + fan_out), was derived for tanh/sigmoid, which keep both halves, and balances the forward and backward passes. Using Xavier with deep ReLU stacks makes the signal fade.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are vanishing and exploding gradients, and how do you fight them?</summary><div class="qa-body">In backprop the gradient for an early layer is a product of many per-layer factors; if they are mostly below 1 it shrinks towards zero (vanishing), if above 1 it blows up (exploding). Early layers then learn nothing, or training diverges. Remedies: proper initialisation (He/Xavier), ReLU-family activations instead of sigmoid, normalisation layers, residual connections, and gradient clipping for explosions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does batch normalisation do, and how does it behave differently in training and inference?</summary><div class="qa-body">It standardises each feature using the mean and variance of the current mini-batch, then applies a learnable scale γ and shift β. During training it uses batch statistics and updates running averages of them; at inference it uses the running averages, so a single example gets a deterministic output. Benefits: faster, more stable training, higher usable learning rates, less sensitivity to initialisation, plus a slight regularising effect from batch noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>BatchNorm vs LayerNorm: what is the difference and when do you use each?</summary><div class="qa-body">BatchNorm normalises each feature across the examples in a batch; LayerNorm normalises each example across its own features. BatchNorm depends on batch statistics, so it struggles with small batches and variable-length sequences and needs running averages for inference. LayerNorm behaves identically in training and inference and is independent of batch size, so it is used in Transformers and RNNs; BatchNorm is common in CNNs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you detect overfitting, and what can you do about it?</summary><div class="qa-body">Training loss keeps falling while validation loss stops improving and rises, so the gap between them grows (our run: validation best 0.436 at epoch 19, 0.742 at epoch 600). Remedies: more data or data augmentation, early stopping, weight decay, dropout, a smaller model, or simpler features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>L1 vs L2 regularisation: what effect does each have on the weights?</summary><div class="qa-body">L2 adds λΣw²; its pull towards zero is proportional to the weight, so weights become small but rarely exactly zero. L1 adds λΣ|w|; its pull has constant strength, so useless weights are driven to (or near) zero, giving sparse models and implicit feature selection. L2 is the usual choice in deep learning, applied as weight decay.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does dropout behave at training vs inference time, and why scale by 1/(1 − p)?</summary><div class="qa-body">During training each unit is zeroed with probability p and the survivors are multiplied by 1/(1 − p), so the expected input to the next layer is unchanged. At inference dropout is switched off and nothing is rescaled (inverted dropout). If you forgot the scaling, the next layer would see systematically larger inputs at inference than it was trained on.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does dropout reduce overfitting?</summary><div class="qa-body">Because any neuron may be missing on any step, neurons cannot form fragile co-dependent combinations that fit noise; each must be useful in many different combinations, which produces more redundant, robust features. It can also be seen as training a huge ensemble of thinned networks that share weights and averaging them at inference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is early stopping and how is it related to L2 regularisation?</summary><div class="qa-body">Early stopping monitors validation loss, saves the weights whenever it improves, and stops after a patience of epochs without improvement, restoring the best weights. Because weights usually start small and grow during training, stopping early limits how large they get, which has an effect similar to an L2 penalty.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is gradient clipping and when is it used?</summary><div class="qa-body">Gradient clipping rescales the gradient vector whenever its norm exceeds a threshold (clip by norm), or caps each component (clip by value), before the optimiser step. It prevents a single unusual batch or an exploding gradient from producing a huge, destructive update. It is standard in RNNs and Transformers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your loss is stuck at 0.693 on a binary task from the start. What do you check?</summary><div class="qa-body">0.693 is ln 2, the loss of a model predicting 50/50 for everything, so the model has learned nothing. Check that labels match inputs and the loss gets logits (not probabilities twice through a sigmoid), that the optimiser actually steps and gradients are non-zero, and that the learning rate is sensible. Then check for a vanishing signal (deep net without good init or normalisation) or dead ReLUs from a too-high learning rate, and try overfitting a single batch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a better optimiser rescue a deep network that is stuck because of bad initialisation?</summary><div class="qa-body">An optimiser only rescales and steers the gradient it receives. If the signal has shrunk to almost nothing by the time it passes through the layers, the gradients reaching the early layers are almost zero as well, so every optimiser gets almost no information. You have to fix the signal first, with He initialisation or normalisation (our 6-layer net went from 0.52 to 0.91 and 0.93), and then the optimiser matters.</div></details>
</main>
`
});
