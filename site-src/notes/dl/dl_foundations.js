// notes/dl/dl_foundations.js — Neural Networks: The Big Picture
Object.assign(TOPIC_CONTENT, {
  "dl_foundations": `<main>
  <h1>Neural Networks: The Big Picture</h1>
  <div class="where"><span>Deep Learning</span><span>Neural Networks</span><span>Neural Networks: The Big Picture</span></div>
  <p class="lead">A neural network is a model that learns a rule from examples by repeating four moves: it makes a guess, measures how wrong the guess was, works out how much each of its internal numbers contributed to the error, and nudges each number to do a little better. Repeated thousands of times, this simple loop produces the image recognisers, speech systems and language models used everywhere today. This page explains why such models are needed at all, what a network is made of, and how the learning loop works, shown end to end on an example small enough to follow with a calculator. It then shows how everything else in deep learning, from training tricks to frameworks to specialised networks for images, sequences and text, builds on that one loop. The running example is a food shop that wants to predict <strong>whether a delivery will be late</strong> from two facts, the distance and the rain, following a rule that no straight line can capture.</p>

  <h2 id="df-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Neural Networks</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why</div>
        <ul>
          <li>Linear models draw one straight boundary</li>
          <li>Interactions ("far XOR rain") need a bent one</li>
          <li>Linear: 49.5%; small network: 93.5% on test orders</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">What</div>
        <ul>
          <li>Neuron: weighted sum + bias, then an activation</li>
          <li>Layers of neurons; hidden layers build new features</li>
          <li>Non-linear activation (ReLU) is essential</li>
          <li>Deep = many layers</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How it learns</div>
        <ul>
          <li>Forward pass → loss → gradients (backprop) → update</li>
          <li>w ← w − lr · ∂L/∂w, repeated many times</li>
          <li>Learning rate too small: slow; too big: diverges</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Built on top</div>
        <ul>
          <li>Training well: optimizers, init, normalisation, regularisation</li>
          <li>Frameworks: PyTorch, Keras (autograd)</li>
          <li>CNNs (images), RNNs (sequences), attention (text)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="df-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why a Straight Line Can't Bend</span><span class="rm-sub">the problem linear models cannot solve</span></div></div>
      <div class="rm-item rm-done" data-target="df-what"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">What a Neural Network Is</span><span class="rm-sub">neurons, layers and the bend between them</span></div></div>
      <div class="rm-item rm-done" data-target="df-loop"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Learning Loop</span><span class="rm-sub">guess, measure, blame, nudge, with every number</span></div></div>
      <div class="rm-item rm-done" data-target="df-real"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Loop on a Real Network</span><span class="rm-sub">the same four moves on 1,000 orders</span></div></div>
      <div class="rm-item rm-done" data-target="df-train"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Training Well</span><span class="rm-sub">step size, optimizers, starting weights, overfitting</span></div></div>
      <div class="rm-item rm-done" data-target="df-fw"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Frameworks: PyTorch and Keras</span><span class="rm-sub">letting the library do the calculus</span></div></div>
      <div class="rm-item rm-done" data-target="df-arch"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">CNNs, RNNs and Attention</span><span class="rm-sub">networks shaped for images, sequences and text</span></div></div>
      <div class="rm-item rm-done" data-target="df-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">piled-up gradients, missing bends, wrong tool</span></div></div>
      <div class="rm-item rm-done" data-target="df-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">the loop, key terms, architectures</span></div></div>
      <div class="rm-item rm-done" data-target="df-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the big-picture questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="df-why"><span class="num">01</span>Why a Straight Line Can't Bend</h2>
  <p>Machine learning already has models that learn from data, such as linear regression and <a class="xref" data-note="ml_classification">logistic regression</a>. To see why we need something more, consider a small food shop with a peculiar delivery pattern. In dry weather every order goes by bike, so far orders are late and near ones are on time. When it rains, the owner sends far orders by van on the fast highway, so they arrive on time, but near orders still go by bike through flooded lanes and arrive late. An order is late when it is far <em>or</em> it is raining, but not both. Four orders capture the whole pattern (1 means yes, 0 means no):</p>
  <table class="tbl">
    <tr><th>Order</th><th>far</th><th>rain</th><th>late</th></tr>
    <tr><td>A</td><td>0</td><td>0</td><td>0 (on time)</td></tr>
    <tr><td>B</td><td>0</td><td>1</td><td>1 (late)</td></tr>
    <tr><td>C</td><td>1</td><td>0</td><td>1 (late)</td></tr>
    <tr><td>D</td><td>1</td><td>1</td><td>0 (on time)</td></tr>
  </table>
  <p>Now picture the orders as four corners of a square, with distance along the bottom and rain going up. The two late orders, B and C, sit on one diagonal; the two on-time orders, A and D, sit on the other. A <strong>linear model</strong> is one that adds up its inputs, each multiplied by a learned weight, and compares the total with a threshold; whatever weights it learns, the boundary between its "yes" and "no" answers is a single straight line. And no straight line can put B and C on one side and A and D on the other. Try it with a pencil: there is always at least one corner on the wrong side.</p>
  <p>This pattern is called <strong>XOR</strong> ("exclusive or"). It looks like a toy, but it is the simplest case of something that is everywhere in real data: an <strong>interaction</strong>, where the effect of one input depends on the value of another. Here, rain makes far orders faster but near orders slower. Think of a staircase light with a switch at each end: flip either switch and the light changes, flip both and it is back where it started. No rule of the form "light on if 2 × top + 3 × bottom is big enough" describes that light; you need a rule that combines the switches.</p>
  <p>Real orders do not come as neat zeros and ones, so we also generate 1,000 orders with real distances (0–10 km) and rain (0–20 mm/h), late when (distance &gt; 5 km) XOR (rain &gt; 10 mm/h), with 5% of the labels flipped at random as real-life noise. The model learns from 800 of them and is tested on the other 200, which it has never seen. Here is the best a linear model can do:</p>
  <div class="fx" data-lang="py">import torch, torch.nn as nn, torch.nn.functional as F

def make_orders(n=1000, noise=0.05, seed=0):
    g = torch.Generator().manual_seed(seed)
    km = torch.rand(n, generator=g) * 10; rain = torch.rand(n, generator=g) * 20
    late = ((km &gt; 5) ^ (rain &gt; 10)) ^ (torch.rand(n, generator=g) &lt; noise)   # ^ = XOR
    return torch.stack([km / 10, rain / 20], 1), late.float()                 # inputs scaled to 0..1

X, y = make_orders()
Xtr, ytr, Xte, yte = X[:800], y[:800], X[800:], y[800:]     # learn on 800, test on 200

def train(model, steps=500, lr=1e-2):
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    for step in range(steps):
        opt.zero_grad()
        loss = F.binary_cross_entropy_with_logits(model(Xtr).squeeze(1), ytr)
        loss.backward(); opt.step()
    return model

def accuracy(model):
    return ((model(Xte).squeeze(1) &gt; 0).float() == yte).float().mean().item()

linear = train(nn.Linear(2, 1))          # one weighted sum: logistic regression
print("linear model test accuracy:", round(accuracy(linear), 3))
print("always say 'on time':      ", round((yte == 0).float().mean().item(), 3))</div>
  <div class="fx" data-lang="text">linear model test accuracy: 0.495
always say 'on time':       0.52</div>
  <p>The linear model gets 49.5% of the test orders right, which is no better than always answering "on time" (52%). It is not under-trained or short of data; it simply cannot represent a boundary that bends. This is the gap that neural networks fill. (One caution before going further: when a straight line, or a tree-based model on a table of data, already does the job, it is cheaper, faster and easier to explain. Networks earn their keep when the pattern bends in ways that are hard to engineer by hand, and above all on images, sound and text.)</p>

  <h2 id="df-what"><span class="num">02</span>What a Neural Network Is</h2>
  <p>The building block of every network is the artificial <strong>neuron</strong>: a small unit that multiplies each input by a <strong>weight</strong> (how much that input matters), adds them up together with a <strong>bias</strong> (a fixed shift, like a pass mark), and passes the total through an <strong>activation function</strong>. In symbols, a neuron computes z = w₁x₁ + w₂x₂ + b, then outputs a = σ(z), where σ is the activation. Think of a committee vote: each member's vote is weighted by how much the committee trusts them, the chair has a standing lean (the bias), and the activation decides what the total means. A single neuron with a sigmoid activation is exactly logistic regression, so on its own it can only draw one straight line, which is why it failed above.</p>
  <p>The power comes from connecting many neurons. Neurons are arranged in <strong>layers</strong>: the input layer is just the data, the output layer gives the prediction, and the layers in between are called <strong>hidden layers</strong>, because their values are not in the data; the network invents them. Every neuron in a layer receives every output of the layer before, so each hidden neuron computes its own new feature from the inputs, and the next layer combines those features. For our orders, one hidden neuron could learn "is at least one of far and rain true?" and another "are both true?"; the output neuron then only has to compute "at least one, but not both", which <em>is</em> a straight-line question in terms of those two new features. Hidden layers turn a hard problem into an easy one by re-describing the data. A manager who cannot read raw data asks assistants simple questions and combines their answers; the hidden neurons are the assistants. (This exact solution is worked by hand in <a class="xref" data-note="dl_neurons">Neurons, Layers &amp; Activations</a>.)</p>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
<g stroke="currentColor" stroke-opacity="0.35">
<line x1="78" y1="70" x2="222" y2="45"/><line x1="78" y1="70" x2="222" y2="110"/><line x1="78" y1="70" x2="222" y2="175"/>
<line x1="78" y1="150" x2="222" y2="45"/><line x1="78" y1="150" x2="222" y2="110"/><line x1="78" y1="150" x2="222" y2="175"/>
<line x1="258" y1="45" x2="402" y2="110"/><line x1="258" y1="110" x2="402" y2="110"/><line x1="258" y1="175" x2="402" y2="110"/>
</g>
<circle cx="60" cy="70" r="18" style="fill:var(--bg)"/><circle cx="60" cy="70" r="18" class="fb sb"/><text x="60" y="74" text-anchor="middle" font-size="11">far</text>
<circle cx="60" cy="150" r="18" style="fill:var(--bg)"/><circle cx="60" cy="150" r="18" class="fb sb"/><text x="60" y="154" text-anchor="middle" font-size="11">rain</text>
<circle cx="240" cy="45" r="18" style="fill:var(--bg)"/><circle cx="240" cy="45" r="18" class="ft st"/><text x="240" y="49" text-anchor="middle" font-size="11">h₁</text>
<circle cx="240" cy="110" r="18" style="fill:var(--bg)"/><circle cx="240" cy="110" r="18" class="ft st"/><text x="240" y="114" text-anchor="middle" font-size="11">h₂</text>
<circle cx="240" cy="175" r="18" style="fill:var(--bg)"/><circle cx="240" cy="175" r="18" class="ft st"/><text x="240" y="179" text-anchor="middle" font-size="11">h₃</text>
<circle cx="420" cy="110" r="18" style="fill:var(--bg)"/><circle cx="420" cy="110" r="18" class="fv sb"/><text x="420" y="114" text-anchor="middle" font-size="11">out</text>
<line x1="438" y1="110" x2="470" y2="110" stroke="currentColor"/><text x="476" y="106" font-size="11">P(late)</text><text x="476" y="122" class="tm" font-size="10">sigmoid</text>
<text x="60" y="210" text-anchor="middle" class="tm" font-size="10.5">input layer</text>
<text x="240" y="210" text-anchor="middle" class="tm" font-size="10.5">hidden layer</text>
<text x="420" y="210" text-anchor="middle" class="tm" font-size="10.5">output layer</text>
<text x="268" y="30" class="tm" font-size="10">each: w·x + b, then ReLU</text>
<text x="120" y="20" class="tm" font-size="10">every line carries a weight</text>
</svg><figcaption>A small network for the delivery problem. Each line is one weight; each hidden neuron computes a weighted sum plus bias and bends it with ReLU; the output neuron combines the hidden features into P(late).</figcaption></figure>
  <p>Follow the picture from left to right. Each input sends its value along a line to every hidden neuron, and each line multiplies the value by its own weight. Each hidden neuron adds what arrives, adds its bias, and applies its activation. The output neuron does the same with the hidden values and finally squashes its score into a probability with a sigmoid. Computing a prediction this way, layer by layer from left to right, is called the <strong>forward pass</strong>.</p>
  <p>One ingredient is easy to overlook but essential: the activation between layers must be <strong>non-linear</strong>, that is, it must bend. Without it, each layer just multiplies by weights and adds a bias, and two such steps in a row can always be rewritten as a single step, so a network with a hundred linear layers is no more capable than one straight line. The most common bend is <strong>ReLU</strong>, ReLU(z) = max(0, z), which keeps positive numbers and turns negative ones into 0. It is a crude hinge, but stacking many hinged pieces lets a network approximate almost any shape; the <strong>universal approximation theorem</strong> makes this precise. A network with many layers is called a <strong>deep</strong> network, and deep learning is simply the practice of building and training such networks, where each layer builds more abstract features out of the ones below.</p>
  <p>In PyTorch, a network like the one in the picture (but wider, with two hidden layers of 32 neurons) is written in three lines. Before any learning, its weights are small random numbers:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
net = nn.Sequential(nn.Linear(2, 32), nn.ReLU(),      # hidden layer 1: 32 neurons
                    nn.Linear(32, 32), nn.ReLU(),     # hidden layer 2: 32 neurons
                    nn.Linear(32, 1))                 # output: one score (logit)
print("parameters:", sum(p.numel() for p in net.parameters()))
X4 = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])      # orders A, B, C, D
print("untrained P(late) for A-D:", [round(v, 3) for v in torch.sigmoid(net(X4)).squeeze(1).tolist()])</div>
  <div class="fx" data-lang="text">parameters: 1185
untrained P(late) for A-D: [0.47, 0.472, 0.455, 0.462]</div>
  <p>This network has 1,185 adjustable numbers, its <strong>parameters</strong>: 2 × 32 + 32 for the first layer, 32 × 32 + 32 for the second and 32 + 1 for the output. Before training it says roughly 0.46 for every order, which is the network's way of saying "I don't know". The rest of the page is about how those 1,185 numbers get set.</p>

  <h2 id="df-loop"><span class="num">03</span>The Learning Loop</h2>
  <p>Nobody sets the weights by hand. The network finds them with a loop that repeats four moves: the <strong>forward pass</strong> (make a guess with the current weights), the <strong>loss</strong> (measure how wrong the guess is as one number), the <strong>gradients</strong> (work out, for every weight, which way to move it to reduce the loss and how strongly), and the <strong>update</strong> (move every weight a small step in that direction). Think of learning to bowl at a single stump. Your first ball goes wide to the left. You do not start from scratch; you adjust your arm a little to the right. The next ball is closer. Your arm angle is the weight, the distance from the stump is the loss, and "a little to the right" is the gradient step.</p>
  <p>To see every number, shrink the problem to a single weight. On rainy days the shop notices that orders 1, 2 and 3 km away arrived 2, 4 and 6 minutes late. The rule is "minutes late = w × km", and the right answer is w = 2, but the computer does not know that. It starts with the guess w = 0.5.</p>
  <p>The loss here is the <strong>mean squared error</strong>: square each error and average them, L = mean of (w × km − minutes)². The <strong>gradient</strong> is the slope of that loss with respect to w, written dL/dw: how much the loss changes for a small change in w. Calculus gives it directly: dL/dw = mean of 2 × (w × km − minutes) × km. A negative slope means "the loss goes down if w goes up". The update moves w a small step against the slope, w ← w − lr × dL/dw, where the <strong>learning rate</strong> lr (here 0.05) sets the step size. Here is step 0 worked by hand:</p>
  <table class="tbl">
    <tr><th>Move</th><th>Calculation</th><th>Result</th></tr>
    <tr><td>1. Forward pass</td><td>0.5 × (1, 2, 3)</td><td>guesses 0.5, 1.0, 1.5 minutes</td></tr>
    <tr><td>2. Loss</td><td>errors −1.5, −3, −4.5; (2.25 + 9 + 20.25)/3</td><td>L = 10.5</td></tr>
    <tr><td>3. Gradient</td><td>2 × (−1.5×1 − 3×2 − 4.5×3)/3 = 2 × (−21)/3</td><td>dL/dw = −14</td></tr>
    <tr><td>4. Update</td><td>0.5 − 0.05 × (−14)</td><td>w = 1.2</td></tr>
  </table>
  <p>The gradient is negative, so w goes up, from 0.5 to 1.2. The code repeats exactly these four moves, written in plain Python so nothing is hidden:</p>
  <div class="fx" data-lang="py">km = [1.0, 2.0, 3.0]                 # distance of three rainy-day orders
late_min = [2.0, 4.0, 6.0]           # how late they were (hidden rule: 2 min per km)
w = 0.5                              # first guess
lr = 0.05                            # learning rate: size of each step
for step in range(6):
    guess = [w * k for k in km]                                              # 1. forward pass
    loss = sum((g - t) ** 2 for g, t in zip(guess, late_min)) / 3            # 2. loss
    grad = sum(2 * (g - t) * k for g, t, k in zip(guess, late_min, km)) / 3  # 3. gradient dL/dw
    print(f"step {step}: w {w:.3f}  loss {loss:.3f}  gradient {grad:.3f}")
    w = w - lr * grad                                                        # 4. update</div>
  <div class="fx" data-lang="text">step 0: w 0.500  loss 10.500  gradient -14.000
step 1: w 1.200  loss 2.987  gradient -7.467
step 2: w 1.573  loss 0.850  gradient -3.982
step 3: w 1.772  loss 0.242  gradient -2.124
step 4: w 1.879  loss 0.069  gradient -1.133
step 5: w 1.935  loss 0.020  gradient -0.604</div>
  <p>Step 0 matches the hand calculation. After that, w climbs 0.5 → 1.2 → 1.57 → 1.77 → 1.88 → 1.94 towards the true value 2, while the loss falls from 10.5 to 0.02. Notice that the gradient shrinks as w approaches 2 (from −14 to −0.6), so the steps get smaller automatically as the answer gets closer. Nobody told the program the answer; it found it by following the slope downhill. This procedure is called <strong>gradient descent</strong> (more in <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a> and <a class="xref" data-note="m_optimization">Optimization</a>).</p>
  <p>A real network runs exactly this loop. The only differences are scale: the forward pass goes through several layers instead of one multiplication, and there are thousands or millions of weights, each needing its own gradient. Computing all those gradients efficiently is the job of <strong>backpropagation</strong>, which applies the chain rule of calculus backwards through the network, from the loss towards the inputs, so that one backward sweep gives every weight its gradient for roughly the cost of one extra forward pass. It is worked through by hand, number by number, in <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>, which also explains why classifiers use a different loss, <strong>cross-entropy</strong>, instead of squared error.</p>

  <h2 id="df-real"><span class="num">04</span>The Loop on a Real Network</h2>
  <p>Now return to the 1,000 delivery orders, where the linear model managed only 49.5%. The network from section 02 is trained with the same four moves, repeated 500 times. Each line of the loop below is one of the moves; the only new pieces are that PyTorch computes the gradients for us with <code>loss.backward()</code>, and an <strong>optimizer</strong> object performs the update for all 1,185 weights at once:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
net = nn.Sequential(nn.Linear(2, 32), nn.ReLU(), nn.Linear(32, 32), nn.ReLU(), nn.Linear(32, 1))
opt = torch.optim.Adam(net.parameters(), lr=1e-2)
for step in range(500):
    logits = net(Xtr).squeeze(1)                                   # 1. forward pass
    loss = F.binary_cross_entropy_with_logits(logits, ytr)         # 2. loss
    opt.zero_grad(); loss.backward()                               # 3. gradients (backprop)
    opt.step()                                                     # 4. update every weight
    if step in (0, 100, 499):
        print(f"step {step:3d}: training loss {loss.item():.3f}")
print("neural network test accuracy:", round(accuracy(net), 3))</div>
  <div class="fx" data-lang="text">step   0: training loss 0.695
step 100: training loss 0.267
step 499: training loss 0.196
neural network test accuracy: 0.935</div>
  <p>The training loss starts at 0.695, which is about ln 2 = 0.693, the loss of a model that answers 50/50 for everything (with cross-entropy, that is the natural starting point). It falls to 0.267 by step 100 and 0.196 by step 500. On the 200 test orders the network has never seen, it is right 93.5% of the time, compared with 49.5% for the linear model. The ceiling is about 95%, because 5% of the labels were flipped at random and no model can predict noise. The network discovered a bent boundary on its own: its hidden neurons learned features of distance and rain that make "late" separable, without anyone telling it about thresholds at 5 km or 10 mm/h.</p>
  <p>Notice what stayed the same as the one-weight example. The four moves are identical: forward pass, loss, gradients, update. Only the size changed. This is the whole of neural-network training, whatever the model: everything else in deep learning either changes the shape of the network (so it can represent the right kind of rule) or helps this loop run faster and more reliably.</p>

  <h2 id="df-train"><span class="num">05</span>Training Well</h2>
  <p>The loop is simple, but running it well takes care, and the first thing that matters is the size of each step. Run the one-weight example for ten steps with three different learning rates:</p>
  <div class="fx" data-lang="py">for lr in [0.01, 0.05, 0.25]:
    w = 0.5
    for step in range(10):
        grad = sum(2 * (w * k - t) * k for k, t in zip([1., 2., 3.], [2., 4., 6.])) / 3
        w = w - lr * grad
    print(f"lr {lr}: w after 10 steps = {w:.3f}")</div>
  <div class="fx" data-lang="text">lr 0.01: w after 10 steps = 1.437
lr 0.05: w after 10 steps = 1.997
lr 0.25: w after 10 steps = -24.637</div>
  <p>With lr = 0.01 the steps are too timid, and after ten steps w has only reached 1.437. With lr = 0.05 it lands on 1.997, almost exactly 2. With lr = 0.25 every step overshoots the answer by more than it corrects, so w swings back and forth with growing size and ends at −24.6: training has <strong>diverged</strong>. In a real network the symptom is a loss that shoots up to infinity or NaN ("not a number"). The learning rate is the single most important setting in training.</p>
  <p>Real training adds several refinements on top of plain gradient descent, each fixing a specific problem, and they are the subject of <a class="xref" data-note="dl_training">Training Well</a>. <strong>Optimizers</strong> such as momentum and Adam take smarter steps: momentum remembers the direction of recent steps to roll through small bumps, and Adam gives every weight its own step size; <strong>learning-rate schedules</strong> take big steps early and small steps late. <strong>Mini-batches</strong> compute each step from a small random sample of the data rather than all of it, which makes steps cheap and slightly noisy. <strong>Initialisation</strong> chooses the size of the random starting weights so that signals neither fade away nor blow up as they pass through many layers, and <strong>normalisation</strong> layers (batch norm, layer norm) re-scale values inside the network to keep them in a healthy range. Finally, a big network can memorise its training examples, noise included, instead of learning the general rule; this is <strong>overfitting</strong>, spotted when the loss on held-out data starts rising while the training loss keeps falling, and fought with <strong>regularisation</strong>: weight decay, dropout and early stopping.</p>

  <h2 id="df-fw"><span class="num">06</span>Frameworks: PyTorch and Keras</h2>
  <p>In the one-weight example we derived the gradient formula by hand. For a network with many layers that would be tedious and error-prone, and it would have to be redone every time the architecture changed. Deep-learning frameworks remove that burden with <strong>automatic differentiation</strong> (autograd): as your code runs the forward pass, the framework records every operation, and when you ask for gradients it runs backpropagation over that record for you. Here is the one-weight example again, with PyTorch computing the gradient:</p>
  <div class="fx" data-lang="py">import torch
km = torch.tensor([1., 2., 3.]); late_min = torch.tensor([2., 4., 6.])
w = torch.tensor(0.5, requires_grad=True)        # ask PyTorch to track w
loss = ((w * km - late_min) ** 2).mean()         # forward pass and loss, as before
loss.backward()                                  # backpropagation, done for us
print("loss", round(loss.item(), 3), " dL/dw", round(w.grad.item(), 3))</div>
  <div class="fx" data-lang="text">loss 10.5  dL/dw -14.0</div>
  <p>PyTorch reports a loss of 10.5 and a gradient of −14, exactly the numbers from our hand calculation, without our ever writing the derivative. The same call works unchanged for a network with a billion weights. Frameworks also provide <strong>tensors</strong> (multi-dimensional arrays that can live on a GPU, which does the many multiplications of a forward pass in parallel), ready-made layers, loss functions and optimizers, and tools for loading data in batches. (The matrix maths behind layers is in <a class="xref" data-note="m_linalg">Linear Algebra</a>; the chain rule behind autograd is in <a class="xref" data-note="m_calculus">Calculus</a>.)</p>
  <p>The two main frameworks differ mostly in style. <a class="xref" data-note="dl_pytorch">PyTorch</a> lets you write the training loop yourself, as in section 04, which makes every step visible and easy to customise; it dominates research and is widespread in industry. <a class="xref" data-note="dl_keras">TensorFlow and Keras</a> offer a higher-level interface in which you describe the model and call <code>model.fit()</code>, and Keras runs the loop for you; it is quick for standard models and has strong deployment tools. The ideas underneath, the forward pass, loss, backprop and update, are identical in both.</p>

  <h2 id="df-arch"><span class="num">07</span>CNNs, RNNs and Attention</h2>
  <p>The network we trained is a <strong>multi-layer perceptron (MLP)</strong>: every neuron is connected to every input. That works for a few numbers about a delivery, but it ignores structure that many kinds of data have. A photo is not a shuffled list of pixels: neighbouring pixels belong together, and a cat is a cat wherever it appears in the frame. A sentence is not a bag of words: order matters, and a word's meaning depends on words far away. The specialised architectures keep the same learning loop and change only how the layers are wired, so that this structure is built in.</p>
  <p><a class="xref" data-note="dl_cnns">Convolutional neural networks (CNNs)</a> are designed for images. Instead of connecting every pixel to every neuron, a CNN slides a small grid of weights (a filter, say 3 × 3) across the image, using the same weights at every position. One filter might learn to detect a vertical edge, wherever it is. Sharing weights this way needs far fewer parameters than an MLP and naturally handles objects that move around the frame; stacking layers builds edges into textures, textures into parts and parts into objects.</p>
  <p><a class="xref" data-note="dl_rnns">Recurrent neural networks (RNNs)</a> are designed for sequences such as daily sales, sensor readings or text. An RNN reads one step at a time and carries a <strong>hidden state</strong>, a running summary of everything seen so far, from each step to the next, again reusing the same weights at every step. Plain RNNs struggle to remember things from many steps back, because the learning signal fades as it travels back through time; LSTM and GRU cells add gates that decide what to keep and what to forget.</p>
  <p><a class="xref" data-note="dl_attention">Attention</a> takes a different route for sequences: instead of passing information step by step, it lets every position look directly at every other position and decide how much each one matters to it, computing a weighted average of their information. The word "it" in a sentence can attend straight to the noun it refers to, however far back. Attention is also easy to run in parallel on GPUs, and the <strong>Transformer</strong>, a network built almost entirely from attention layers, is the basis of modern language models.</p>
  <table class="tbl">
    <tr><th>Architecture</th><th>Data it suits</th><th>Built-in idea</th><th>Example task</th></tr>
    <tr><td>MLP</td><td>a fixed list of features</td><td>every input connects to every neuron</td><td>late delivery from distance and rain</td></tr>
    <tr><td>CNN</td><td>images, grids</td><td>small filters shared across positions</td><td>is this parcel photo damaged?</td></tr>
    <tr><td>RNN / LSTM</td><td>sequences, time series</td><td>a hidden state carried step to step</td><td>tomorrow's order volume from past days</td></tr>
    <tr><td>Attention / Transformer</td><td>text, long sequences</td><td>every position looks at every other</td><td>classifying customer complaints</td></tr>
  </table>

  <h2 id="df-traps"><span class="num">08</span>Common Mistakes</h2>
  <p>A frequent bug when writing the loop by hand in PyTorch is forgetting to clear the gradient between steps. PyTorch <em>adds</em> each new gradient to the one already stored, so without a reset every update uses the sum of all previous gradients:</p>
  <div class="fx" data-lang="py">import torch
km = torch.tensor([1., 2., 3.]); late_min = torch.tensor([2., 4., 6.])
w = torch.tensor(0.5, requires_grad=True)
for step in range(5):
    loss = ((w * km - late_min) ** 2).mean()
    loss.backward()                              # forgot w.grad.zero_(): gradients pile up
    with torch.no_grad():
        w -= 0.05 * w.grad
    print(f"step {step}: w {w.item():.3f}  stored gradient {w.grad.item():.3f}")</div>
  <div class="fx" data-lang="text">step 0: w 1.200  stored gradient -14.000
step 1: w 2.273  stored gradient -21.467
step 2: w 3.219  stored gradient -18.916
step 3: w 3.596  stored gradient -7.537
step 4: w 3.228  stored gradient 7.359</div>
  <p>The first step is correct (w = 1.2, gradient −14). After that, the stored gradient is the running total rather than the current slope, so w shoots past 2 to 3.6 and starts swinging back. With the reset (<code>w.grad.zero_()</code>, or <code>optimizer.zero_grad()</code> in a real loop) the same code converges smoothly, as in section 03.</p>
  <p>A second mistake is stacking layers without activations between them, expecting depth alone to add power:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
no_bend = nn.Sequential(nn.Linear(2, 32), nn.Linear(32, 32), nn.Linear(32, 1))   # ReLUs left out
print("three layers, no activation, test accuracy:", round(accuracy(train(no_bend)), 3))</div>
  <div class="fx" data-lang="text">three layers, no activation, test accuracy: 0.495</div>
  <p>Three linear layers, with no ReLU between them, score 49.5%, exactly like the single linear model, because stacked linear layers collapse into one. The non-linear activation is what makes a network more than a straight line.</p>
  <p>Two more mistakes are about judgement rather than code. Stepping <em>with</em> the gradient instead of against it makes the loss climb from the very first step; a steadily rising loss is almost always a sign error or a learning rate that is far too large. And reaching for a neural network first is often the wrong call: on a table of business data, gradient-boosted trees are frequently as accurate, train in seconds and are easier to explain. Use a network when the pattern bends in ways you cannot engineer by hand, or when the data is images, audio or text.</p>

  <h2 id="df-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why neural networks</h3>
  <ul>
    <li>A linear model (weighted sum + threshold) draws one straight boundary.</li>
    <li>Interactions such as late = far XOR rain need a bent boundary: linear 49.5%, small network 93.5% on test orders (ceiling about 95% with 5% noisy labels).</li>
  </ul>
  <h3>Key terms</h3>
  <ul>
    <li><b>Neuron</b>: z = w·x + b, then activation a = σ(z). <b>Weight</b>: importance of an input. <b>Bias</b>: shift.</li>
    <li><b>Layer</b>: a group of neurons; <b>hidden layer</b>: between input and output, builds new features.</li>
    <li><b>Activation</b>: non-linear bend (ReLU = max(0, z)); without it layers collapse into one.</li>
    <li><b>Parameters</b>: all weights and biases (the 2-32-32-1 network has 1,185).</li>
    <li><b>Forward pass</b>: compute the prediction layer by layer. <b>Loss</b>: one number for how wrong.</li>
    <li><b>Gradient</b>: slope of the loss for each parameter. <b>Backpropagation</b>: chain rule backwards to get all gradients in one sweep.</li>
    <li><b>Learning rate</b>: step size. <b>Gradient descent</b>: w ← w − lr · ∂L/∂w, repeated.</li>
    <li><b>Deep learning</b>: training networks with many layers.</li>
  </ul>
  <h3>The learning loop, one weight</h3>
  <table class="tbl">
    <tr><th>Move</th><th>Formula</th><th>Step 0 (w = 0.5, km 1, 2, 3, minutes 2, 4, 6)</th></tr>
    <tr><td>Forward</td><td>ŷ = w × km</td><td>0.5, 1.0, 1.5</td></tr>
    <tr><td>Loss</td><td>L = mean (ŷ − y)²</td><td>10.5</td></tr>
    <tr><td>Gradient</td><td>dL/dw = mean 2(ŷ − y)·km</td><td>−14</td></tr>
    <tr><td>Update</td><td>w ← w − lr · dL/dw</td><td>0.5 + 0.05 × 14 = 1.2</td></tr>
  </table>
  <p>Learning rate after 10 steps: 0.01 → w = 1.437 (slow); 0.05 → 1.997 (good); 0.25 → −24.6 (diverged).</p>
  <h3>Architectures</h3>
  <table class="tbl">
    <tr><th>Model</th><th>For</th><th>Key idea</th></tr>
    <tr><td>MLP</td><td>feature vectors</td><td>fully connected layers</td></tr>
    <tr><td>CNN</td><td>images</td><td>shared sliding filters</td></tr>
    <tr><td>RNN / LSTM</td><td>sequences</td><td>hidden state carried through time</td></tr>
    <tr><td>Attention / Transformer</td><td>text, long sequences</td><td>every position weighs every other</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">net = nn.Sequential(nn.Linear(2, 32), nn.ReLU(), nn.Linear(32, 32), nn.ReLU(), nn.Linear(32, 1))
opt = torch.optim.Adam(net.parameters(), lr=1e-2)
for step in range(500):
    loss = F.binary_cross_entropy_with_logits(net(X).squeeze(1), y)   # forward + loss
    opt.zero_grad(); loss.backward()                                   # gradients
    opt.step()                                                         # update</div>
  <h3>Gotchas</h3>
  <ul>
    <li>No activation between layers → the network is one straight line.</li>
    <li>Reset gradients every step (<code>zero_grad()</code>); PyTorch accumulates them.</li>
    <li>Step against the gradient; rising loss = sign error or lr too big.</li>
    <li>An untrained yes/no network's loss is about ln 2 = 0.693.</li>
    <li>Tabular data: try gradient-boosted trees before a network.</li>
  </ul>

  <h2 id="df-qa"><span class="num">09</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a neural network?</summary><div class="qa-body">A function built from layers of simple units called neurons. Each neuron computes a weighted sum of its inputs plus a bias and applies a non-linear activation; layers feed into one another. The weights are learned from data by minimising a loss with gradient descent, using backpropagation to compute the gradients.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a neural network and logistic regression?</summary><div class="qa-body">Logistic regression is a single neuron: a weighted sum followed by a sigmoid, so its decision boundary is one straight line. A neural network stacks layers of neurons with non-linear activations, so its boundary can bend. On our XOR-style delivery data, logistic regression scored 49.5% and a small network 93.5%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the XOR problem and why does it matter?</summary><div class="qa-body">XOR is true when exactly one of two inputs is true. Its positive cases sit on opposite corners of a square, so no single straight line separates them, and therefore no single neuron or linear model can learn it. It matters because it is the simplest example of an interaction, and it showed that hidden layers are needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do neural networks need non-linear activation functions?</summary><div class="qa-body">Without them every layer is a linear map, and a composition of linear maps is still linear, so any number of layers collapses into a single layer that can only draw straight boundaries. Non-linear activations such as ReLU let each layer bend its input, so stacking layers builds more complex functions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do hidden layers do?</summary><div class="qa-body">They compute new features from the inputs, learned rather than hand-designed, in which the problem becomes easier. For XOR, hidden neurons can learn "at least one is true" and "both are true", and the output only needs a straight line in terms of those. Deeper layers build increasingly abstract features from simpler ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe the training loop of a neural network.</summary><div class="qa-body">Repeat: run a forward pass on a batch to get predictions; compute the loss against the labels; run backpropagation to get the gradient of the loss with respect to every parameter; update each parameter a small step against its gradient using an optimizer. Clear the gradients before the next step. Repeat over many batches and epochs while monitoring validation loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are a weight, a bias, a loss, a gradient and a learning rate?</summary><div class="qa-body">A weight is a learned number saying how much an input matters; a bias is a learned shift added to the weighted sum. The loss is one number measuring how wrong the predictions are. The gradient is the slope of the loss with respect to each parameter, saying which way and how strongly to move it. The learning rate is the multiplier that sets the size of each update step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if the learning rate is too high or too low?</summary><div class="qa-body">Too low and training crawls: in our one-weight example lr 0.01 only reached w = 1.437 of the target 2 after ten steps. Too high and each step overshoots, so the parameters oscillate with growing size and the loss diverges to infinity or NaN (lr 0.25 sent w to −24.6). A well-chosen rate, often with a schedule that lowers it over time, converges quickly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is backpropagation, in one or two sentences?</summary><div class="qa-body">It is the chain rule of calculus applied backwards through the network, from the loss to the inputs, reusing intermediate results so that the gradients of all parameters are computed in one backward pass. Its cost is roughly that of one extra forward pass, which is what makes training large networks feasible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between an epoch, a batch and an iteration?</summary><div class="qa-body">A batch (mini-batch) is the small group of examples used to compute one gradient step. An iteration is one such step: forward, loss, backward, update. An epoch is one full pass over the training set, so it contains (dataset size / batch size) iterations.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the universal approximation theorem say?</summary><div class="qa-body">A network with a single hidden layer, enough neurons and a non-linear activation can approximate any continuous function on a bounded domain as closely as desired. It guarantees that a suitable network exists, not that training will find it, how many neurons it needs, or that it will generalise; in practice deeper networks are far more efficient.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is overfitting in a neural network and how do you detect and reduce it?</summary><div class="qa-body">Overfitting is when the network memorises the training data, including its noise, instead of the general rule, so it does well on training data and worse on new data. You detect it when validation loss starts rising while training loss keeps falling. Reduce it with more data or augmentation, weight decay, dropout, early stopping, or a smaller model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is autograd and why do frameworks provide it?</summary><div class="qa-body">Automatic differentiation records the operations of the forward pass and then applies backpropagation to that record to compute exact gradients for every parameter. It means you only write the forward computation; the framework derives the backward pass. In PyTorch, <code>loss.backward()</code> fills each parameter's <code>.grad</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>PyTorch or Keras: what is the practical difference?</summary><div class="qa-body">PyTorch is define-by-run and you usually write the training loop yourself, which makes it explicit and flexible; it dominates research. Keras offers a high-level API where you compile a model and call <code>fit()</code>, which is fast for standard setups, and TensorFlow has mature deployment tooling. Both implement the same forward, loss, backprop and update steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a CNN instead of an MLP for images?</summary><div class="qa-body">An MLP connects every pixel to every neuron, which needs a huge number of parameters and ignores that neighbouring pixels are related and that objects can appear anywhere. A CNN slides small shared filters over the image, so it needs far fewer parameters, detects a pattern wherever it occurs, and builds features hierarchically from edges to objects.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do RNNs and attention-based models differ in handling sequences?</summary><div class="qa-body">An RNN processes one step at a time and carries a hidden state forward, so information from far back must survive many steps and the computation cannot be parallelised across time. Attention lets every position look directly at every other position and weigh them, so long-range links are one step away and all positions are computed in parallel. Transformers, built on attention, have largely replaced RNNs for text.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use a neural network?</summary><div class="qa-body">When the data is small, a simpler model already captures the pattern, the predictions must be easy to explain, or compute is limited. On tabular business data, gradient-boosted trees are often as accurate or better with far less tuning. Networks shine on images, audio, text and other high-dimensional data with complex interactions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What loss should an untrained binary classifier start at, and why is it a useful check?</summary><div class="qa-body">About ln 2 ≈ 0.693 with cross-entropy, because an untrained network gives roughly 0.5 to both answers and −ln 0.5 = ln 2 (our network started at 0.695). For C classes, about ln C. A very different starting loss points to a bug such as wrongly formatted labels, a double sigmoid or bad initialisation.</div></details>
</main>
`
});
