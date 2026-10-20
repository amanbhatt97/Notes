// notes/dl/dl_pytorch.js — PyTorch
Object.assign(TOPIC_CONTENT, {
  "dl_pytorch": `<main>
  <h1>PyTorch</h1>
  <div class="where"><span>Deep Learning</span><span>Neural Networks</span><span>PyTorch</span></div>
  <p class="lead">PyTorch is the Python library most deep-learning research, LLM and Hugging Face code is written in. This note trains <strong>the same late-delivery network</strong> as the rest of the track, end to end, each tool introduced at the moment you need it: tensors → shapes → autograd → nn.Module → Dataset/DataLoader → training loop → evaluation mode → saving/loading → GPU → transfer learning. Every tensor's shape is traced, and every output is from a real run (PyTorch 2.14, CPU only: this machine has no GPU, and the note says so wherever it matters). The maths behind each step is in <a class="xref" data-note="dl_neurons">Neurons</a>, <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a> and <a class="xref" data-note="dl_training">Training Well</a>.</p>

  <h2 id="dp2-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 150" width="680">
<defs><marker id="dp2-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="41" text-anchor="middle" font-size="12">Neurons</text><text x="70" y="58" text-anchor="middle" class="tm" font-size="10">build it</text>
<line x1="130" y1="45" x2="148" y2="45" stroke="currentColor" marker-end="url(#dp2-a0)"/>
<rect x="150" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="210" y="41" text-anchor="middle" font-size="12">Loss &amp; Backprop</text><text x="210" y="58" text-anchor="middle" class="tm" font-size="10">blame it</text>
<line x1="270" y1="45" x2="288" y2="45" stroke="currentColor" marker-end="url(#dp2-a0)"/>
<rect x="290" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="350" y="41" text-anchor="middle" font-size="12">Training Well</text><text x="350" y="58" text-anchor="middle" class="tm" font-size="10">tune it</text>
<line x1="410" y1="45" x2="428" y2="45" stroke="currentColor" marker-end="url(#dp2-a0)"/>
<rect x="430" y="20" width="110" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="485" y="41" text-anchor="middle" font-size="12" font-weight="700">PyTorch</text><text x="485" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="540" y1="45" x2="558" y2="45" stroke="currentColor" marker-end="url(#dp2-a0)"/>
<rect x="560" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="615" y="41" text-anchor="middle" font-size="12">CNNs · RNNs</text><text x="615" y="58" text-anchor="middle" class="tm" font-size="10">Attention · Keras</text>
<text x="340" y="110" text-anchor="middle" class="tm" font-size="10.5">running example: four orders A–D (late = far XOR rain) and 1,000 generated orders;</text>
<text x="340" y="126" text-anchor="middle" class="tm" font-size="10.5">model: 2 → 32 → 32 → 1 logit = P(late) after a sigmoid</text>
</svg><figcaption>The Neural Networks track. Everything learned so far, now written with the real tool.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dl_training">Training Well</a></b><span>We know how to build, blame and tune a network, and we used PyTorch quickly along the way. Now the tool itself: why each piece exists and what goes wrong when it is misused.</span></li>
    <li><b>This note adds: the PyTorch workflow</b><span>Tensors (shape, dtype, device), autograd (backprop for free), nn.Module (the model container), Dataset/DataLoader (batches), the five-line training step, eval mode, checkpoints, devices/GPU and transfer learning.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dl_cnns">CNNs</a>, <a class="xref" data-note="dl_rnns">RNNs</a>, <a class="xref" data-note="dl_attention">Attention</a></b><span>The same loop with new layer types for images, sequences and text. <a class="xref" data-note="dl_keras">TensorFlow &amp; Keras</a> shows the other big framework and its <code>fit()</code>.</span></li>
  </ol>

  <h2 id="dp2-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each tool answers the question above it, and its limit raises the next question. Running example: the delivery network on four orders, then on 1,000.</p>
  <ol class="story">
    <li><b>Tensor</b><span>Q: how do we store the orders so a GPU can crunch them and gradients can be tracked? → A grid of numbers with shape, dtype, device: the four orders are a (4, 2) float32 tensor. But most bugs are about shape…</span></li>
    <li><b>Shapes &amp; broadcasting</b><span>Q: how do sizes combine? → Align from the right, size-1 stretches; (64, 1) − (64,) silently becomes (64, 64). Now we can compute; how do we get gradients?</span></li>
    <li><b>Autograd</b><span>Q: who does backprop? → <code>requires_grad=True</code> records the graph; <code>.backward()</code> fills <code>.grad</code>: the hand-computed 0.6457 for order D, for free. But managing nine loose weight tensors by hand does not scale…</span></li>
    <li><b>nn.Module</b><span>Q: how do we package layers and weights? → A class with layers in <code>__init__</code> and maths in <code>forward</code>; it finds all 1,185 parameters itself. Now: feeding it 1,000 orders in shuffled batches…</span></li>
    <li><b>Dataset &amp; DataLoader</b><span>Q: how do we feed batches? → Dataset answers "how many / give me #i"; DataLoader shuffles and stacks: 800 orders → 13 batches of (64, 2), the last of 32. Now put it together…</span></li>
    <li><b>Training loop</b><span>Q: what are the exact steps? → zero_grad → forward → loss → backward → step; step-0 loss ≈ ln 2, then about 93% validation accuracy. But validation numbers jitter run to run…</span></li>
    <li><b>eval() and no_grad()</b><span>Q: how do we predict properly? → <code>eval()</code> switches dropout/BatchNorm to prediction behaviour, <code>no_grad()</code> stops recording; validation needs both. Now keep the best model…</span></li>
    <li><b>Saving &amp; loading</b><span>Q: how do we keep and restore it? → Save the <code>state_dict</code>; rebuild the class, load, <code>eval()</code>: identical outputs. Training was quick on a CPU; real models need more speed…</span></li>
    <li><b>Devices &amp; GPU</b><span>Q: how do we use a GPU? → One <code>device</code> variable; model once, every batch every time; mixed precision. (No GPU here: the same code falls back to CPU.) Finally: reuse a trained model for a new task…</span></li>
    <li><b>Transfer learning</b><span>Q: can a trained body help a new task with little data? → Keep the body, new head for 3 classes (on time / late / very late), freeze, then fine-tune with a small lr. Next: specialised bodies, <a class="xref" data-note="dl_cnns">CNNs</a>.</span></li>
  </ol>

  <h2 id="dp2-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">PyTorch</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Tensors</div>
        <ul>
          <li><b>Tensor</b> — n-d array + <b>shape</b>, <b>dtype</b>, <b>device</b></li>
          <li>💡 A NumPy array that can sit on a GPU and remember how it was made</li>
          <li><b>Defaults</b> — Python floats → float32, ints → int64, NumPy floats → float64</li>
          <li><b>.item()</b> — one-element tensor → plain Python number</li>
          <li>⚠ float64 data into a float32 model → "must have the same dtype"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shapes</div>
        <ul>
          <li><b>Orders</b> (4, 2); <b>image batch</b> (N, C, H, W)</li>
          <li><b>reshape(32, -1)</b>, <b>permute</b>, <b>unsqueeze/squeeze</b></li>
          <li><b>Broadcasting</b> — align right; size-1 stretches</li>
          <li><b>Matmul</b> — (a, b) @ (b, c) → (a, c)</li>
          <li>⚠ (64, 1) − (64,) → (64, 64) silently</li>
          <li>⚠ <code>view</code> needs contiguous; <code>from_numpy</code> shares memory</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Autograd</div>
        <ul>
          <li><b>requires_grad=True</b> — record every op (<code>grad_fn</code>)</li>
          <li><b>backward()</b> — fills <code>.grad</code>: order D's ∂L/∂v₁ = 0.6457</li>
          <li><b>Dynamic graph</b> — rebuilt every forward</li>
          <li>⚠ <b>Grads add up</b> — zero them every step</li>
          <li><b>detach()</b>, <b>no_grad()</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">nn.Module</div>
        <ul>
          <li><b>__init__</b> — <code>super().__init__()</code>, layers as attributes</li>
          <li><b>forward(x)</b> — call <code>model(x)</code></li>
          <li>Free: <code>.parameters()</code>, <code>.to()</code>, <code>.train()/.eval()</code>, <code>state_dict()</code></li>
          <li>DeliveryNet: (N, 2) → (N, 32) → (N, 32) → (N, 1); 1,185 params</li>
          <li>⚠ Plain list of layers → 0 params → <code>nn.ModuleList</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data</div>
        <ul>
          <li><b>Dataset</b> — <code>__len__</code> + <code>__getitem__</code></li>
          <li><b>DataLoader</b> — shuffle, batch, stack: (64, 2), (64,)</li>
          <li>800 / 64 → 13 batches, last 32</li>
          <li>💡 godown shelf + loaders packing boxes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Training loop</div>
        <ul>
          <li>zero_grad → forward → loss → backward → (clip) → step</li>
          <li>Step-0 loss ≈ ln 2 = 0.693</li>
          <li>Log <code>loss.item()</code>, never <code>loss</code></li>
          <li>Overfit one batch first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">eval, save, device</div>
        <ul>
          <li><b>eval()</b> layer behaviour; <b>no_grad()</b> no graph; need both</li>
          <li>Save <code>state_dict</code>; rebuild → load → eval</li>
          <li><b>device</b> = cuda if available else cpu</li>
          <li>AMP: autocast + GradScaler (fp16)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Transfer learning</div>
        <ul>
          <li>Keep body, new head; freeze with <code>requires_grad=False</code></li>
          <li>Fine-tune: body lr 1e-4, head 1e-2 (param groups)</li>
          <li>⚠ High lr on pretrained layers → forgetting</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dp2-ten"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Tensors</span><span class="rm-sub">Shape, dtype, device</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-shape"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Shapes &amp; Broadcasting</span><span class="rm-sub">reshape, permute, matmul</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-ag"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Autograd</span><span class="rm-sub">Backprop for free</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-mod"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">nn.Module</span><span class="rm-sub">The model container</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-data"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Dataset &amp; DataLoader</span><span class="rm-sub">Feeding batches</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-loop"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Training Loop</span><span class="rm-sub">A complete real run</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-eval"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">eval() &amp; no_grad()</span><span class="rm-sub">Two different switches</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-ckpt"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Saving &amp; Loading</span><span class="rm-sub">state_dict checkpoints</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-dev"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">GPU &amp; Devices</span><span class="rm-sub">.to(device), mixed precision</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-tl"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Transfer Learning</span><span class="rm-sub">Freeze, new head, fine-tune</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-lab"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Hands-on: Break the Loop</span><span class="rm-sub">What each mistake does</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">dtype, device, grads, modes</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table, one picture</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dp2-ten"><span class="num">01</span>Tensors</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have four orders as a small table of numbers. NumPy could hold them. Why does deep learning need a new kind of array?</p>
  </div>
  <p>NumPy arrays have two gaps for deep learning. They only run on the CPU, and training means billions of multiplications that a GPU (graphics card) does 10–100× faster. And NumPy cannot tell you how a result depends on its inputs, which is exactly what training needs (the gradient). PyTorch fills both gaps with one object: the <strong>tensor</strong>.</p>
  <p>In plain words: a tensor is a grid of numbers. A single number, a list, a table and a stack of tables are all tensors; they differ only in how many directions ("dimensions") the grid has. Inputs, weights, outputs and gradients in PyTorch are all tensors.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A steel <em>dabba</em> (tiffin box). One dabba has a few compartments (a vector). A row of dabbas on a delivery tray is a table (a matrix). A stack of trays on the dabbawala's cart is a 3-D tensor. The label on the cart says three things: how many trays and dabbas (<strong>shape</strong>), what kind of food (<strong>dtype</strong>), and which station it is at (<strong>device</strong>).</p></div>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <rect x="20" y="60" width="26" height="26" class="fb sb"/><text x="14" y="115">scalar</text><text x="18" y="132" class="tm">()</text>
    <g class="fb sb"><rect x="90" y="30" width="26" height="26"/><rect x="90" y="56" width="26" height="26"/></g><text x="80" y="108">vector</text><text x="88" y="124" class="tm">(2,)</text>
    <g class="ft st"><rect x="160" y="20" width="26" height="22"/><rect x="186" y="20" width="26" height="22"/><rect x="160" y="42" width="26" height="22"/><rect x="186" y="42" width="26" height="22"/><rect x="160" y="64" width="26" height="22"/><rect x="186" y="64" width="26" height="22"/><rect x="160" y="86" width="26" height="22"/><rect x="186" y="86" width="26" height="22"/></g><text x="150" y="128">orders A–D</text><text x="165" y="144" class="tm">(4, 2)</text>
    <g class="fg sg"><rect x="290" y="24" width="60" height="60"/><rect x="300" y="34" width="60" height="60"/><rect x="310" y="44" width="60" height="60"/></g>
    <text x="290" y="128">image batch</text><text x="280" y="144" class="tm">(N, C, H, W)</text>
    <text x="410" y="40">shape</text><text x="470" y="40" class="tm">sizes</text>
    <text x="410" y="70">dtype</text><text x="470" y="70" class="tm">float32…</text>
    <text x="410" y="100">device</text><text x="470" y="100" class="tm">cpu / cuda</text>
  </svg><figcaption>Everything (inputs, weights, gradients) is a tensor. Three attributes describe it, and most PyTorch errors are a mismatch in one of them.</figcaption></figure>
  <p>Worked example: the four orders as a table. Rows are orders A, B, C, D; columns are far and rain. Shape (4, 2), 2 dimensions, 8 numbers. Row 3 (order D) is [1, 1]; column 1 (rain) is [0, 1, 0, 1]; the item at row 1, column 1 (order B's rain) is 1.</p>
<div class="fx" data-lang="py">import torch, numpy as np
X4 = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])     # orders A-D: far, rain
y4 = torch.tensor([0., 1., 1., 0.])                              # late?
print(X4.shape, X4.dtype, X4.device)
print(X4.ndim, X4.numel())
print(X4[3], X4[:, 1], X4[1, 1].item())
print(torch.tensor([1, 2]).dtype, torch.zeros(2, 3).dtype, torch.tensor(np.array([1.5])).dtype)</div>
  <div class="fx" data-lang="text">torch.Size([4, 2]) torch.float32 cpu
2 8
tensor([1., 1.]) tensor([0., 1., 0., 1.]) 1.0
torch.int64 torch.float32 torch.float64</div>
  <p>What happened: <code>torch.tensor(...)</code> copied the Python list into a tensor. Python floats became <strong>float32</strong> (32-bit decimals, what models use), Python ints become <strong>int64</strong>, but a NumPy array keeps NumPy's <strong>float64</strong>. Indexing works like NumPy: <code>X4[3]</code> is a row, <code>X4[:, 1]</code> a column. <code>.item()</code> turns a one-number tensor into a plain Python number for printing or logging.</p>
  <p>The dtype trap in action. Order data usually arrives from pandas/NumPy as float64, while a layer's weights are float32:</p>
<div class="fx" data-lang="py">lin = torch.nn.Linear(2, 1)                          # weights are float32
orders_np = np.array([[0.8, 0.3]])                   # NumPy default: float64 (an 8 km, 6 mm/h order)
try:
    lin(torch.from_numpy(orders_np))
except RuntimeError as e:
    print("RuntimeError:", e)
print(lin(torch.tensor(orders_np, dtype=torch.float32)).shape)</div>
  <div class="fx" data-lang="text">RuntimeError: mat1 and mat2 must have the same dtype, but got Double and Float
torch.Size([1, 1])</div>
  <p>"Double" is float64 and "Float" is float32. Passing <code>dtype=torch.float32</code> fixes it. You will see this error the first time you load a DataFrame into a model.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>tensor</strong> is an n-dimensional array with a <strong>shape</strong> (size of each dimension), a <strong>dtype</strong> (number type: float32, int64, bool…) and a <strong>device</strong> (cpu, cuda). With <code>requires_grad=True</code> it also records the operations applied to it (section 03).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Label dtypes depend on the loss. <code>BCEWithLogitsLoss</code> (our yes/no "late") wants float labels with the same shape as the logits; <code>CrossEntropyLoss</code> (one of C classes) wants int64 (<code>torch.long</code>) class indices. Convert once, when building the Dataset.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: shapes and broadcasting.</b> We can store the orders. But a network multiplies (4, 2) inputs by (32, 2) weights and adds (32,) biases. How do sizes combine, and how do the silent shape bugs happen?</div>

  <h2 id="dp2-shape"><span class="num">02</span>Shapes &amp; Broadcasting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which sizes can be combined, what comes out, and why does a shape mistake sometimes give a wrong answer instead of an error?</p>
  </div>
  <p>In deep learning, most bugs are shape bugs. A layer expects (batch, features) and gets (features,); an image layer expects channels first and gets channels last. The error appears ten lines from the real mistake. The cure is a habit: <strong>write the shape next to every line</strong> until it is automatic.</p>
  <p>The idea: the numbers in a tensor sit in memory as one long row; the shape is only a way of reading it. <code>reshape</code> changes the reading (same numbers, new grid), <code>permute</code> swaps the order of dimensions, <code>unsqueeze</code>/<code>squeeze</code> add or remove a dimension of size 1.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A box of 24 laddoos. You can arrange them 4 × 6 or 6 × 4 or 2 × 12: same laddoos, different trays (reshape). Turning the tray sideways is permute. Putting the tray into a bag that holds exactly one tray is unsqueeze: the laddoos did not change, but now there is a "bag" dimension of size 1.</p></div>
  <p>You will meet image batches in <a class="xref" data-note="dl_cnns">CNNs</a>; trace one batch of 32 colour images, 28 × 28 pixels:</p>
  <table class="tbl out"><caption>Shape trace</caption>
    <tr><th>Operation</th><th>Shape after</th><th>Why</th></tr>
    <tr><td><code>imgs</code></td><td>(32, 3, 28, 28)</td><td>N = 32 images, C = 3 colours, H = W = 28</td></tr>
    <tr><td><code>imgs.reshape(32, -1)</code></td><td>(32, 2352)</td><td>−1 means "work it out": 3·28·28 = 2352</td></tr>
    <tr><td><code>imgs.permute(0, 2, 3, 1)</code></td><td>(32, 28, 28, 3)</td><td>channels last (NumPy / matplotlib layout)</td></tr>
    <tr><td><code>imgs[0]</code></td><td>(3, 28, 28)</td><td>one image, batch dim gone</td></tr>
    <tr><td><code>imgs[0].unsqueeze(0)</code></td><td>(1, 3, 28, 28)</td><td>a "batch of one", what models expect</td></tr>
  </table>
<div class="fx" data-lang="py">torch.manual_seed(0)
imgs = torch.randn(32, 3, 28, 28)            # (N, C, H, W)
print(imgs.shape)
print(imgs.reshape(32, -1).shape)            # flatten each image
print(imgs.permute(0, 2, 3, 1).shape)        # channels last
one = imgs[0]
print(one.shape, one.unsqueeze(0).shape, one.unsqueeze(0).squeeze(0).shape)
print("one order as a batch:", X4[3].shape, "-&gt;", X4[3].unsqueeze(0).shape)</div>
  <div class="fx" data-lang="text">torch.Size([32, 3, 28, 28])
torch.Size([32, 2352])
torch.Size([32, 28, 28, 3])
torch.Size([3, 28, 28]) torch.Size([1, 3, 28, 28]) torch.Size([3, 28, 28])
one order as a batch: torch.Size([2]) -&gt; torch.Size([1, 2])</div>
  <p>Every line matches the table, and the last line is the same trick for one delivery order: (2,) → (1, 2), a batch of one.</p>
  <h3>Broadcasting, matmul and reductions on the orders</h3>
  <p><strong>Broadcasting</strong> lets you combine a small tensor with a big one without copying it. Line the shapes up from the right; a dimension of size 1 (or a missing one) is stretched. Centring the orders: X4 (4, 2) − mean (2,) → the mean row is subtracted from every row. Matrix multiply <code>@</code> needs the inner sizes to match: (4, 2) @ (2, 3) → (4, 3). <code>sum(dim=0)</code> collapses down the rows (one number per column).</p>
<div class="fx" data-lang="py">mean = X4.mean(dim=0)                         # (2,)  column means: [0.5, 0.5]
print(X4 - mean)                              # (4,2) - (2,)  -&gt; (4,2)
W = torch.tensor([[1., 1.], [1., 1.], [1., -1.]])        # 3 neurons x 2 inputs
print((X4 @ W.T).shape, (X4 @ W.T).tolist())             # (4,2) @ (2,3) -&gt; (4,3)
print(X4.sum(dim=0), X4.sum(dim=1), X4.mean(dim=1, keepdim=True).shape)
try:
    torch.randn(4, 2) @ torch.randn(4, 2)     # inner sizes 2 vs 4
except RuntimeError as e:
    print("RuntimeError:", e)</div>
  <div class="fx" data-lang="text">tensor([[-0.5000, -0.5000],
        [-0.5000,  0.5000],
        [ 0.5000, -0.5000],
        [ 0.5000,  0.5000]])
torch.Size([4, 3]) [[0.0, 0.0, 0.0], [1.0, 1.0, -1.0], [1.0, 1.0, 1.0], [2.0, 2.0, 0.0]]
tensor([2., 2.]) tensor([0., 1., 1., 2.]) torch.Size([4, 1])
RuntimeError: mat1 and mat2 shapes cannot be multiplied (4x2 and 4x2)</div>
  <p>Check one cell by hand: order D (1, 1) times neuron 3's weights (1, −1) = 1 − 1 = 0, the last number. <code>keepdim=True</code> keeps the collapsed dimension as size 1, (4, 2) → (4, 1), so it broadcasts back against X4. The error message prints both shapes: read it, it tells you exactly what to fix.</p>
  <h3>The silent shape bug</h3>
  <p>A model outputs one logit per order with shape (4, 1); the labels have shape (4,). Subtracting them broadcasts to (4, 4): sixteen numbers, a loss that is quietly wrong. Some losses catch it, some do not:</p>
<div class="fx" data-lang="py">logits = torch.zeros(4, 1)                    # model output: (N, 1)
print("(4,1) - (4,) -&gt;", tuple((logits - y4).shape))
print("MSE with mismatched shapes:", torch.nn.functional.mse_loss(torch.sigmoid(logits), y4).item())
try:
    torch.nn.functional.binary_cross_entropy_with_logits(logits, y4)
except ValueError as e:
    print("ValueError:", e)
print("fixed:", torch.nn.functional.binary_cross_entropy_with_logits(logits.squeeze(1), y4).item())</div>
  <div class="fx" data-lang="text">(4,1) - (4,) -&gt; (4, 4)
MSE with mismatched shapes: 0.25
ValueError: Target size (torch.Size([4])) must be the same as input size (torch.Size([4, 1]))
fixed: 0.6931471824645996</div>
  <p>The MSE call "worked" (with a warning in real code) on a (4, 4) grid, giving a meaningless number; <code>BCEWithLogitsLoss</code> refuses mismatched shapes. <code>squeeze(1)</code> makes the logits (4,), and the loss is ln 2 = 0.693, the right answer for a model that says 50/50.</p>
  <h3>view vs reshape, and shared memory</h3>
<div class="fx" data-lang="py">t = X4.T                                  # transpose: (2, 4), same memory, read in another order
print(t.is_contiguous())
try:
    t.view(-1)
except RuntimeError as e:
    print("view error:", str(e)[:60])
print(t.reshape(-1))
arr = np.array([1., 2., 3.])
shared = torch.from_numpy(arr); arr[0] = 99
print(shared)                             # sees the change
copy = torch.tensor(arr); arr[1] = -1
print(copy)                               # independent copy</div>
  <div class="fx" data-lang="text">False
view error: view size is not compatible with input tensor's size and str
tensor([0., 0., 1., 1., 0., 1., 0., 1.])
tensor([99.,  2.,  3.], dtype=torch.float64)
tensor([99.,  2.,  3.], dtype=torch.float64)</div>
  <p><code>.T</code> moves no numbers; it changes the reading order, so memory is no longer "in order" (<strong>contiguous</strong>). <code>view</code> refuses because it never copies; <code>reshape</code> copies when it must. <code>torch.from_numpy</code> shares memory with the array, so changing <code>arr[0]</code> changed the tensor; <code>torch.tensor</code> made its own copy.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Broadcasting</strong>: align shapes from the right; each pair of sizes must be equal, or one of them 1 (or missing), and size-1 dims are stretched. <strong>Contiguous</strong>: elements sit in memory in the order the shape reads them.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Broadcasting never complains when it "works" by accident. Before any loss, make prediction and target shapes identical (<code>pred.squeeze(1)</code>). Interviewers love this one.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: autograd.</b> We can compute a forward pass. In the backprop note we wrote the backward pass by hand, eight steps for nine weights. For a real network that is impossible. Can PyTorch do it for us?</div>

  <h2 id="dp2-ag"><span class="num">03</span>Autograd: Backprop for Free</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Writing the backward pass by hand worked for a 2-2-1 network. How do we get gradients for any network without deriving a single formula?</p>
  </div>
  <p><strong>Autograd</strong> (automatic differentiation): when a tensor has <code>requires_grad=True</code>, PyTorch writes down every operation done with it, building the computational graph. When you call <code>.backward()</code> on the final number, PyTorch walks that graph backwards applying the chain rule, exactly as we did by hand in <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a>, and stores each gradient in <code>.grad</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A kirana shop bill that lists every item, quantity and tax line. From the total you can trace exactly how much each item added. Autograd keeps that bill for every number it computes, and <code>backward()</code> reads it from the bottom up.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="dp2-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="90" height="34" rx="6" class="fb sb"/><text x="22" y="42">W1, b1</text>
    <rect x="10" y="110" width="90" height="34" rx="6" class="fb sb"/><text x="22" y="132">v, c</text>
    <rect x="130" y="20" width="110" height="34" rx="17" class="fv sb"/><text x="140" y="42">AddmmBackward</text>
    <rect x="260" y="20" width="100" height="34" rx="17" class="fv sb"/><text x="270" y="42">ReluBackward</text>
    <rect x="380" y="64" width="100" height="34" rx="17" class="fv sb"/><text x="390" y="86">AddBackward</text>
    <rect x="500" y="64" width="90" height="34" rx="6" class="ft st"/><text x="508" y="86">L = 1.0375</text>
    <g stroke="currentColor"><line x1="100" y1="37" x2="128" y2="37" marker-end="url(#dp2-ah1)"/><line x1="240" y1="37" x2="258" y2="37" marker-end="url(#dp2-ah1)"/><line x1="360" y1="40" x2="378" y2="72" marker-end="url(#dp2-ah1)"/><line x1="100" y1="127" x2="378" y2="90" marker-end="url(#dp2-ah1)"/><line x1="480" y1="81" x2="498" y2="81" marker-end="url(#dp2-ah1)"/></g>
    <text x="10" y="165" class="tm">blue: leaves (their .grad gets filled) · violet: recorded operations (grad_fn) · order D through the 2-2-1 net</text>
  </svg><figcaption>Running the forward pass records this graph (simplified). <code>L.backward()</code> walks it right to left with the chain rule.</figcaption></figure>
  <p>The test: rebuild the 2-2-1 network from the backprop note with the same starting weights, run order D forward, call <code>backward()</code>, and compare with the hand table (δ = 0.6457, ∂L/∂v = (0.6457, 0.3228), ∂L/∂W¹ rows (0.5165, 0.5165) and (−0.3874, −0.3874)):</p>
<div class="fx" data-lang="py">import torch.nn.functional as F
W1 = torch.tensor([[0.5, 0.4], [0.3, 0.6]], requires_grad=True); b1 = torch.tensor([0.1, -0.4], requires_grad=True)
v = torch.tensor([0.8, -0.6], requires_grad=True);               c = torch.tensor(0.1, requires_grad=True)
xD, yD = X4[3:], y4[3:]                                  # order D: (1, 2), (1,)
z = torch.relu(xD @ W1.T + b1) @ v + c                   # (1,) logit
L = F.binary_cross_entropy_with_logits(z, yD)
print("L =", round(L.item(), 4), " grad_fn:", L.grad_fn.name())
L.backward()
print("dL/dv  ", [round(t, 4) for t in v.grad.tolist()], " dL/dc", round(c.grad.item(), 4))
print("dL/dW1 ", [[round(t, 4) for t in row] for row in W1.grad.tolist()], " dL/db1", [round(t, 4) for t in b1.grad.tolist()])</div>
  <div class="fx" data-lang="text">L = 1.0375  grad_fn: BinaryCrossEntropyWithLogitsBackward0
dL/dv   [0.6457, 0.3228]  dL/dc 0.6457
dL/dW1  [[0.5165, 0.5165], [-0.3874, -0.3874]]  dL/db1 [0.5165, -0.3874]</div>
  <p>Every number matches the hand-computed backward table. Autograd did the eight steps we did by hand, and it would do the same for a network with a billion weights. Three behaviours to know before training with it:</p>
<div class="fx" data-lang="py">z = torch.relu(xD @ W1.T + b1) @ v + c
F.binary_cross_entropy_with_logits(z, yD).backward()     # second backward, no zeroing
print("dL/dc after two backward calls:", round(c.grad.item(), 4))   # 0.6457 + 0.6457
c.grad.zero_(); print("after zero_():", c.grad.item())
a = torch.tensor([1., 2.], requires_grad=True)
print((a * 2).detach().requires_grad)                    # cut out of the graph
with torch.no_grad():
    d = a * 2
print(d.requires_grad, d.grad_fn)                        # nothing recorded</div>
  <div class="fx" data-lang="text">dL/dc after two backward calls: 1.2913
after zero_(): 0.0
False
False None</div>
  <p>Running forward and backward a second time gave <strong>1.2913</strong>, not 0.6457: gradients <em>add up</em> in <code>.grad</code>. <code>zero_()</code> resets them. <code>detach()</code> returns a copy cut out of the graph; inside <code>torch.no_grad()</code> nothing is recorded at all.</p>
  <h3>Training with nothing but autograd</h3>
  <p>Now train the 2-2-1 network on all four orders, autograd computing the gradients and us doing the update by hand (lr 0.5, as in the backprop note, which reached P(late) 0.004, 0.999, 0.999, 0.0004 with the hand-written backward):</p>
<div class="fx" data-lang="py">params = [torch.tensor([[0.5, 0.4], [0.3, 0.6]]), torch.tensor([0.1, -0.4]), torch.tensor([0.8, -0.6]), torch.tensor(0.1)]
for p_ in params: p_.requires_grad_(True)
W1, b1, v, c = params
for step in range(1, 3001):
    z = torch.relu(X4 @ W1.T + b1) @ v + c                # (4,)
    loss = F.binary_cross_entropy_with_logits(z, y4)
    loss.backward()                                       # autograd fills every .grad
    with torch.no_grad():                                 # the update itself must not be recorded
        for p_ in params:
            p_ -= 0.5 * p_.grad
            p_.grad.zero_()                               # or they add up
    if step in (1, 3000):
        print(f"step {step}: loss {loss.item():.4f}  P(late) {[round(t, 4) for t in torch.sigmoid(z).tolist()]}")</div>
  <div class="fx" data-lang="text">step 1: loss 0.6976  P(late) [0.5449, 0.5939, 0.6411, 0.6457]
step 3000: loss 0.0013  P(late) [0.0036, 0.9994, 0.9994, 0.0004]</div>
  <p>Same result as the hand-written backward pass (the step-3000 line shows the probabilities just before the last update). A "training loop" is just this; sections 04–06 replace the loose tensors with <code>nn.Module</code>, the manual update with an optimizer, and the four orders with a DataLoader.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Autograd</strong> is reverse-mode automatic differentiation. Tensors you create with <code>requires_grad=True</code> are <strong>leaves</strong>; <code>backward()</code> fills their <code>.grad</code>. The graph is <strong>dynamic</strong> ("define-by-run"): rebuilt on every forward pass and freed after <code>backward()</code>, so Python <code>if</code>/<code>for</code> inside a model just work.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Gradients add up on purpose (gradient accumulation: several small batches, one update). In normal training zero them every step. Calling <code>backward()</code> twice through the same graph errors unless <code>retain_graph=True</code>; we avoided that by recomputing the forward pass.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: nn.Module.</b> Four loose tensors, each needing <code>requires_grad</code>, zeroing, updating, moving to a GPU and saving. A real network has dozens. How do we package layers and their weights so all that bookkeeping is automatic?</div>

  <h2 id="dp2-mod"><span class="num">04</span>nn.Module: the Model Container</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we define a network once and get "list all weights", "move to GPU", "save", "switch dropout off" for free?</p>
  </div>
  <p><strong>nn.Module</strong> is the base class for every layer and model. You write a class: in <code>__init__</code> you create the layers and store them on <code>self</code>; in <code>forward(x)</code> you say how data flows. Everything stored on <code>self</code> is found by <code>.parameters()</code>, moved by <code>.to(device)</code>, saved by <code>state_dict()</code> and switched by <code>.train()</code>/<code>.eval()</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A tiffin service. <code>__init__</code> is hiring the cooks and buying the vessels (the layers). <code>forward</code> is the recipe card saying in which order food passes from cook to cook. The manager (nn.Module) keeps the inventory of every vessel, so moving the kitchen (<code>.to("cuda")</code>) or taking stock (<code>state_dict()</code>) is one command.</p></div>
  <p>The delivery network used for the rest of the note: 2 inputs → 32 → 32 → 1 logit, ReLU, with a little dropout. Split into a <code>body</code> (turns raw inputs into useful features) and a <code>head</code> (turns features into the answer); section 10 reuses that split. <code>nn.Linear(in, out)</code> has in·out + out parameters. By hand: 2·32 + 32 = 96, 32·32 + 32 = 1,056, 32·1 + 1 = 33; total <strong>1,185</strong>.</p>
<div class="fx" data-lang="py">import torch.nn as nn
class DeliveryNet(nn.Module):
    def __init__(self, d_in=2, hidden=32, n_out=1, p=0.1):
        super().__init__()                    # must come first
        self.body = nn.Sequential(nn.Linear(d_in, hidden), nn.ReLU(), nn.Dropout(p),
                                  nn.Linear(hidden, hidden), nn.ReLU())
        self.head = nn.Linear(hidden, n_out)
    def forward(self, x):                     # x: (N, 2)
        return self.head(self.body(x))       # (N, 1) logits; P(late) = sigmoid(logit)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
torch.manual_seed(0)
model = DeliveryNet().to(device)
print(model)
print("params:", sum(p.numel() for p in model.parameters()))
for name, p in model.named_parameters():
    print(f"{name:14s} {tuple(p.shape)}")
h = X4                                        # the four orders, (4, 2)
for layer in list(model.body) + [model.head]:
    h = layer(h)
    print(f"{layer.__class__.__name__:8s} -&gt; {tuple(h.shape)}")</div>
  <div class="fx" data-lang="text">DeliveryNet(
  (body): Sequential(
    (0): Linear(in_features=2, out_features=32, bias=True)
    (1): ReLU()
    (2): Dropout(p=0.1, inplace=False)
    (3): Linear(in_features=32, out_features=32, bias=True)
    (4): ReLU()
  )
  (head): Linear(in_features=32, out_features=1, bias=True)
)
params: 1185
body.0.weight  (32, 2)
body.0.bias    (32,)
body.3.weight  (32, 32)
body.3.bias    (32,)
head.weight    (1, 32)
head.bias      (1,)
Linear   -&gt; (4, 32)
ReLU     -&gt; (4, 32)
Dropout  -&gt; (4, 32)
Linear   -&gt; (4, 32)
ReLU     -&gt; (4, 32)
Linear   -&gt; (4, 1)</div>
  <p>The printout lists layers by the attribute names we chose. The parameter count matches the hand count. Each weight's shape is (out, in). The shape trace shows the batch dimension 4 passing through untouched; only the feature dimension changes 2 → 32 → 32 → 1. ReLU and Dropout never change shapes. The final (4, 1) are <strong>logits</strong>, raw scores; a sigmoid turns them into P(late).</p>
  <p>The most common nn.Module bug, shown with a real count:</p>
<div class="fx" data-lang="py">class Broken(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = [nn.Linear(2, 4), nn.Linear(4, 1)]                # plain Python list
class Fixed(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.ModuleList([nn.Linear(2, 4), nn.Linear(4, 1)])
print(sum(p.numel() for p in Broken().parameters()), sum(p.numel() for p in Fixed().parameters()))</div>
  <div class="fx" data-lang="text">0 17</div>
  <p>The Broken model reports <strong>0</strong> parameters: the optimizer would never update those layers, <code>.to("cuda")</code> would not move them, and they would not be saved. <code>nn.ModuleList</code> registers them (2·4 + 4 + 4·1 + 1 = 17).</p>
  <div class="cards">
    <div><b>Registered automatically</b><p>Any <code>nn.Module</code> or <code>nn.Parameter</code> assigned to <code>self</code>.</p><small>tracked by .parameters(), .to(), state_dict</small></div>
    <div><b>Not registered</b><p>Layers in a plain list/dict, plain tensors.</p><small>use nn.ModuleList / ModuleDict / register_buffer</small></div>
    <div><b>nn.functional</b><p>Stateless ops (<code>F.relu</code>) inside forward.</p><small>no weights to track</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>nn.Module</strong>: base class for layers and models. <strong>Parameter</strong>: a tensor registered as learnable. <strong>Logits</strong>: raw output scores before sigmoid/softmax.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Call <code>model(x)</code>, not <code>model.forward(x)</code>: <code>__call__</code> also runs hooks. Do not end the model with a sigmoid when using <code>BCEWithLogitsLoss</code> (or softmax with <code>CrossEntropyLoss</code>): the loss applies it, and doing it twice trains badly.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Dataset and DataLoader.</b> The model takes any batch of shape (N, 2). Our real data is 1,000 orders that should be split into training and validation, shuffled every epoch and served 64 at a time. Who does that?</div>

  <h2 id="dp2-data"><span class="num">05</span>Dataset &amp; DataLoader</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we turn 1,000 orders into shuffled batches of 64, epoch after epoch, without writing fiddly index code?</p>
  </div>
  <p>Training works best on small shuffled groups of examples (batches, usually 32–256), and real data often does not fit in memory at once. PyTorch splits the job in two. A <strong>Dataset</strong> answers "how many examples?" and "give me example i". A <strong>DataLoader</strong> wraps it: picks indices (shuffled if asked), fetches those examples and stacks them into batch tensors.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The Dataset is a godown shelf: ask for item 417 and you get item 417. The DataLoader is the team of loaders: they pick random items, pack boxes of 64, and keep boxes coming to the truck (the GPU) so it never stands idle.</p></div>
  <figure class="viz"><svg viewBox="0 0 560 140" width="560">
    <defs><marker id="dp2-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="130" height="80" rx="6" class="fb sb"/><text x="22" y="52">OrdersDataset</text><text x="22" y="72" class="tm">__len__ → 1000</text><text x="22" y="90" class="tm">[i] → (x, y)</text>
    <line x1="140" y1="70" x2="180" y2="70" stroke="currentColor" marker-end="url(#dp2-ah2)"/>
    <rect x="182" y="40" width="110" height="60" rx="6" class="fv sb"/><text x="192" y="62">sampler</text><text x="192" y="82" class="tm">shuffle idx</text>
    <line x1="292" y1="70" x2="330" y2="70" stroke="currentColor" marker-end="url(#dp2-ah2)"/>
    <rect x="332" y="40" width="90" height="60" rx="6" class="ft st"/><text x="342" y="62">collate</text><text x="342" y="82" class="tm">stack 64</text>
    <line x1="422" y1="70" x2="455" y2="70" stroke="currentColor" marker-end="url(#dp2-ah2)"/>
    <g class="fg sg"><rect x="458" y="30" width="80" height="18"/><rect x="458" y="54" width="80" height="18"/><rect x="458" y="78" width="80" height="18"/></g>
    <text x="462" y="44" font-size="11">x (64, 2)</text><text x="462" y="68" font-size="11">y (64,)</text><text x="470" y="92" font-size="11">…13</text>
    <text x="182" y="130" class="tm">DataLoader (workers load in parallel)</text>
  </svg><figcaption>A Dataset fetches one order; the DataLoader shuffles the order of fetching and stacks orders into batch tensors.</figcaption></figure>
  <p>Shape trace for one batch: each order is x of shape (2,) and a label y of shape () (one number). Stacking 64 gives x (64, 2) and y (64,). 800 training orders ÷ 64 = 12.5, so there are 13 batches and the last holds 800 − 12·64 = 32.</p>
<div class="fx" data-lang="py">import math, os
from torch.utils.data import Dataset, DataLoader, random_split

def make_orders(n=1000, noise=0.05, seed=0):          # the generator used across the track
    g = torch.Generator().manual_seed(seed)
    km = torch.rand(n, generator=g) * 10; rain = torch.rand(n, generator=g) * 20
    late = ((km &gt; 5) ^ (rain &gt; 10)) ^ (torch.rand(n, generator=g) &lt; noise)
    return torch.stack([km / 10, rain / 20], 1), late.float()

class OrdersDataset(Dataset):
    def __init__(self, n=1000):
        self.X, self.y = make_orders(n)       # build once: X (1000, 2) float32, y (1000,) float32
    def __len__(self):
        return len(self.X)
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]       # one (input, label) pair: (2,), ()

ds = OrdersDataset()
train_ds, val_ds = random_split(ds, [800, 200], generator=torch.Generator().manual_seed(42))
train_dl = DataLoader(train_ds, batch_size=64, shuffle=True)
val_dl = DataLoader(val_ds, batch_size=256)
print(len(ds), ds[0])
torch.manual_seed(0)
xb, yb = next(iter(train_dl))
print(xb.shape, yb.shape, yb[:8])
print(len(train_dl), [len(x) for x, _ in train_dl][-2:])</div>
  <div class="fx" data-lang="text">1000 (tensor([0.4963, 0.4575]), tensor(0.))
torch.Size([64, 2]) torch.Size([64]) tensor([0., 0., 0., 0., 1., 1., 1., 0.])
13 [64, 32]</div>
  <p>What happened: <code>make_orders</code> builds all 1,000 orders once. <code>__getitem__</code> returns one pair, so <code>ds[0]</code> is an order at 4.96 km with 9.2 mm/h of rain (scaled 0.4963, 0.4575): near and dry, on time (label 0). <code>random_split</code> makes two non-overlapping views of 800 and 200 orders. <code>next(iter(train_dl))</code> pulls the first batch: x (64, 2), y (64,), labels shuffled. The last line confirms 13 batches with a final short one of 32.</p>
  <table class="tbl">
    <tr><th>DataLoader arg</th><th>Typical</th><th>Why</th></tr>
    <tr><td><code>shuffle</code></td><td>True train, False val</td><td>Model must not learn the file order</td></tr>
    <tr><td><code>num_workers</code></td><td>4–8 (Linux), 0 in notebooks</td><td>Load next batches in parallel processes</td></tr>
    <tr><td><code>pin_memory</code></td><td>True with CUDA</td><td>Faster CPU → GPU copies</td></tr>
    <tr><td><code>drop_last</code></td><td>True with BatchNorm</td><td>A last batch of 1 breaks BatchNorm statistics</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Dataset</strong>: any object with <code>__len__</code> and <code>__getitem__(i)</code>. <strong>DataLoader</strong>: iterates over a Dataset in batches, handling shuffling (sampler), stacking (collate) and parallel loading (workers). One full pass is an <strong>epoch</strong>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Heavy work (reading an image file, augmentation) belongs in <code>__getitem__</code>, so workers run it in parallel; doing it all in <code>__init__</code> fills RAM. With <code>num_workers&gt;0</code> in Windows/macOS scripts, the loop must sit under <code>if __name__ == "__main__":</code> or workers re-run your script and hang.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the training loop.</b> We have a model and batches. What exactly happens per batch, in what order, and how do we know the run is healthy?</div>

  <h2 id="dp2-loop"><span class="num">06</span>The Training Loop</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know the four moves (guess, measure, blame, nudge). What are the exact PyTorch calls, in which order, and what should the numbers look like?</p>
  </div>
  <p>Keras has <code>fit()</code> (see <a class="xref" data-note="dl_keras">TensorFlow &amp; Keras</a>). PyTorch does not: you write the loop yourself. It is more lines, but nothing is hidden, so when training misbehaves you can print or change any step. Interviewers often ask for these lines from memory. Two helpers replace the manual parts of section 03: a <strong>loss function</strong> object (<code>BCEWithLogitsLoss</code>: logits (N,) and float labels (N,) → one number) and an <strong>optimizer</strong> (Adam, see <a class="xref" data-note="dl_training">Training Well</a>), which owns the update and the zeroing.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Practising maths on a slate. Wipe the slate (zero_grad), attempt a sum (forward), check the answer key (loss), find where you went wrong (backward), adjust your method (step). Then the next sum. One pass through the workbook is an epoch.</p></div>
  <figure class="viz"><svg viewBox="0 0 560 155" width="560">
    <defs><marker id="dp2-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="50" width="96" height="40" rx="8" class="fs" stroke="currentColor"/><text x="20" y="75">zero_grad</text>
    <rect x="122" y="50" width="96" height="40" rx="8" class="fb sb"/><text x="132" y="75">forward</text>
    <rect x="234" y="50" width="96" height="40" rx="8" class="fv sb"/><text x="244" y="75">loss</text>
    <rect x="346" y="50" width="96" height="40" rx="8" class="fr sr"/><text x="356" y="75">backward</text>
    <rect x="458" y="50" width="90" height="40" rx="8" class="fg sg"/><text x="470" y="75">step</text>
    <g stroke="currentColor"><line x1="106" y1="70" x2="120" y2="70" marker-end="url(#dp2-ah3)"/><line x1="218" y1="70" x2="232" y2="70" marker-end="url(#dp2-ah3)"/><line x1="330" y1="70" x2="344" y2="70" marker-end="url(#dp2-ah3)"/><line x1="442" y1="70" x2="456" y2="70" marker-end="url(#dp2-ah3)"/></g>
    <path d="M503,90 L503,125 L58,125 L58,92" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dp2-ah3)"/>
    <text x="210" y="145" class="tm">next batch</text>
    <text x="14" y="40" class="tm" font-size="11">clear .grad</text><text x="126" y="40" class="tm" font-size="11">model(x)</text><text x="238" y="40" class="tm" font-size="11">loss_fn(out, y)</text><text x="350" y="40" class="tm" font-size="11">fill .grad</text><text x="462" y="40" class="tm" font-size="11">w −= lr·grad</text>
  </svg><figcaption>Five calls per batch, always in this order. Gradient clipping goes between backward and step.</figcaption></figure>
  <p>One step traced with shapes: x (64, 2) → <code>model(x)</code> → logits (64, 1) → <code>.squeeze(1)</code> → (64,) → <code>loss_fn(logits, y)</code> with y (64,) → loss, shape () → <code>loss.backward()</code> fills all six <code>.grad</code> tensors, each the shape of its weight → <code>opt.step()</code> changes the weights. First the sanity check: an untrained yes/no model should say about 50/50, and cross-entropy of 50/50 is ln 2 ≈ 0.693.</p>
<div class="fx" data-lang="py">loss_fn = nn.BCEWithLogitsLoss()
with torch.no_grad():
    print("step-0 loss:", round(loss_fn(model(xb).squeeze(1), yb).item(), 4), " ln 2 =", round(math.log(2), 4))
opt = torch.optim.Adam(model.parameters(), lr=1e-2)

def train_epoch():
    model.train(); total = 0
    for x, y in train_dl:
        x, y = x.to(device), y.to(device)
        opt.zero_grad()                           # 1 clear old grads
        loss = loss_fn(model(x).squeeze(1), y)    # 2 forward + 3 loss
        loss.backward()                           # 4 backprop
        opt.step()                                # 5 update
        total += loss.item() * len(x)             # .item(): plain float, no graph
    return total / len(train_dl.dataset)

@torch.no_grad()
def evaluate():
    model.eval(); total, correct = 0, 0
    for x, y in val_dl:
        x, y = x.to(device), y.to(device)
        logits = model(x).squeeze(1)              # (200,)
        total += loss_fn(logits, y).item() * len(x)
        correct += ((logits &gt; 0).float() == y).sum().item()   # logit &gt; 0  &lt;=&gt;  P(late) &gt; 0.5
    return total / len(val_dl.dataset), correct / len(val_dl.dataset)

best = float("inf")
for epoch in range(1, 21):
    tr = train_epoch(); va, acc = evaluate()
    if va &lt; best:                                 # keep the best checkpoint (early stopping)
        best = va
        torch.save({"epoch": epoch, "model": model.state_dict(),
                    "opt": opt.state_dict(), "val_loss": va}, "ckpt.pt")
    if epoch in (1, 2, 5, 10, 15, 20):
        print(f"epoch {epoch:2d}  train {tr:.4f}  val {va:.4f}  acc {acc:.3f}")</div>
  <div class="fx" data-lang="text">step-0 loss: 0.6704  ln 2 = 0.6931
epoch  1  train 0.6835  val 0.6649  acc 0.650
epoch  2  train 0.6332  val 0.5973  acc 0.775
epoch  5  train 0.3569  val 0.3578  acc 0.885
epoch 10  train 0.3056  val 0.3246  acc 0.935
epoch 15  train 0.2861  val 0.3459  acc 0.900
epoch 20  train 0.2810  val 0.3243  acc 0.925</div>
  <p>What happened: the step-0 loss is close to ln 2, so labels and loss are wired correctly. <code>train_epoch</code> runs the five calls per batch; <code>loss.item() * len(x)</code> weights the short last batch fairly. <code>evaluate</code> turns off dropout (<code>model.eval()</code>) and graph recording (<code>@torch.no_grad()</code>), then counts correct predictions: a logit above 0 means P(late) above 0.5. Validation accuracy climbs to 0.93 by epoch 10 and wobbles between 0.90 and 0.935 after that; the ceiling is about 0.95, set by the 5% noisy labels, and a learning-rate schedule would steady the end (<a class="xref" data-note="dl_training">Training Well</a>). Whenever validation loss improves, the full state is saved; section 08 uses that file.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Optimizer</strong>: object that updates parameters from their <code>.grad</code> (SGD, Adam, AdamW). <strong>Learning rate</strong>: the step size. <strong>Epoch</strong>: one pass over the training set; <strong>iteration/step</strong>: one batch.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>total += loss</code> (without <code>.item()</code>) keeps every batch's graph alive: memory grows each step until out-of-memory. Same for appending output tensors to a list for logging; use <code>.item()</code> or <code>.detach()</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: eval() and no_grad().</b> <code>evaluate()</code> called two different switches. Why two, what does each do, and what goes wrong with only one?</div>

  <h2 id="dp2-eval"><span class="num">07</span>eval() and no_grad()</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our model has dropout, which randomly zeroes neurons during training. When we predict for a real order, we want the same answer every time, and we do not need gradients. Which switch does what?</p>
  </div>
  <p>Some layers behave differently while learning and while predicting: dropout zeroes random activations during training only; BatchNorm uses batch statistics in training and saved averages when predicting (<a class="xref" data-note="dl_training">Training Well</a>). Separately, predicting needs no gradients, so recording a graph wastes memory. PyTorch has two switches for these two needs: <code>model.eval()</code> tells layers "we are predicting"; <code>torch.no_grad()</code> tells autograd "do not record". Neither does the other's job.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>eval()</code> = exam day: no more surprise practice drills (dropout off). <code>no_grad()</code> = not writing rough work in the margin, since nobody will check it. On exam day you want both.</p></div>
  <table class="tbl">
    <tr><th></th><th><code>model.eval()</code></th><th><code>torch.no_grad()</code></th></tr>
    <tr><td>Changes</td><td>Layer behaviour: dropout off, BatchNorm uses running stats</td><td>Autograd: no graph recorded</td></tr>
    <tr><td>Saves memory?</td><td>No</td><td>Yes (no saved activations)</td></tr>
    <tr><td>Undo with</td><td><code>model.train()</code></td><td>leaving the <code>with</code> block</td></tr>
  </table>
  <p>Experiment: one order (8.5 km, 3 mm/h: far and dry, so late), three forward passes in each mode. Shape: (2,) → <code>unsqueeze(0)</code> → (1, 2), a batch of one.</p>
<div class="fx" data-lang="py">x0 = torch.tensor([0.85, 0.15]).unsqueeze(0)      # (2,) -&gt; (1, 2)
model.train()
with torch.no_grad():
    print("train mode:", [round(torch.sigmoid(model(x0)).item(), 3) for _ in range(3)])
model.eval()
with torch.no_grad():
    print("eval mode: ", [round(torch.sigmoid(model(x0)).item(), 3) for _ in range(3)])
print(model(x0).requires_grad)
with torch.no_grad():
    print(model(x0).requires_grad)</div>
  <div class="fx" data-lang="text">train mode: [0.984, 0.934, 0.998]
eval mode:  [0.997, 0.997, 0.997]
True
False</div>
  <p>In train mode, even under <code>no_grad</code>, the three answers differ: dropout picks different neurons each time. In eval mode they are identical. The last two lines show the other switch: without <code>no_grad</code> the output is still attached to a graph (memory held); with it, nothing is recorded. So <code>no_grad</code> alone did not stop the randomness and <code>eval()</code> alone did not save memory. Validation needs both. <code>torch.inference_mode()</code> is a stricter, slightly faster <code>no_grad</code> for serving.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Training mode</strong> (<code>model.training == True</code>): dropout active, BatchNorm uses and updates batch statistics. <strong>Evaluation mode</strong>: dropout is identity, BatchNorm uses running averages. Set recursively on every sub-module.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting <code>model.train()</code> after validation: the next epoch trains with dropout off and frozen BatchNorm stats. That is why <code>train_epoch</code> calls <code>model.train()</code> at its start, every epoch.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: saving and loading.</b> We predict correctly now. But the model lives in memory; the best epoch was saved to <code>ckpt.pt</code>. How do we load it into a fresh program and be sure it is the same model?</div>

  <h2 id="dp2-ckpt"><span class="num">08</span>Saving &amp; Loading (Checkpoints)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Training can take hours and machines get pre-empted; the model you serve must be the best epoch, not the last. What exactly do we save, and how do we restore it?</p>
  </div>
  <p>Every module gives a <code>state_dict()</code>: a plain dictionary from parameter name to tensor. Save that dictionary. To load, build the same class again (fresh random weights) and pour the saved tensors in with <code>load_state_dict</code>. A saved snapshot is a <strong>checkpoint</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A save point in a video game. The save file stores your stats and inventory (weights and optimizer state), not the game program itself (the class). To continue, you start the game (build the model) and then load the save.</p></div>
<div class="fx" data-lang="py">print(list(model.state_dict().keys()))
ck = torch.load("ckpt.pt", map_location=device)        # weights_only=True by default
fresh = DeliveryNet().to(device)                         # rebuild the architecture
fresh.load_state_dict(ck["model"]); fresh.eval()
model.load_state_dict(ck["model"]); model.eval()
print("best epoch", ck["epoch"], "val loss", round(ck["val_loss"], 4),
      "file size KB", round(os.path.getsize("ckpt.pt") / 1024, 1))
with torch.no_grad():
    print(torch.equal(model(x0), fresh(x0)), "P(late) =", round(torch.sigmoid(fresh(x0)).item(), 3))</div>
  <div class="fx" data-lang="text">['body.0.weight', 'body.0.bias', 'body.3.weight', 'body.3.bias', 'head.weight', 'head.bias']
best epoch 20 val loss 0.3243 file size KB 20.5
True P(late) = 0.997</div>
  <p>The keys are the attribute paths from section 04 (<code>body.0</code> is the first Linear; ReLU and Dropout have no weights, so no keys). Here the best validation loss happened to be the last epoch (20: 0.3243, a hair below epoch 10's 0.3246); in longer runs it usually is not (epoch 15 was worse), which is why the loop saves the best rather than the last. <code>map_location=device</code> lets a checkpoint saved on a GPU load on a CPU machine. Both models give identical outputs; the far-and-dry order is confidently late.</p>
  <div class="cards">
    <div><b>Weights only</b><p><code>torch.save(model.state_dict(), p)</code></p><small>for inference / sharing</small></div>
    <div><b>Full checkpoint</b><p>model + optimizer + scheduler + epoch (+ scaler, RNG)</p><small>to resume training exactly</small></div>
    <div><b>Whole model</b><p><code>torch.save(model, p)</code> pickles the class path</p><small>breaks on refactor; avoid</small></div>
  </div>
  <p>To resume training: load all states, then continue from <code>ck["epoch"] + 1</code>. Without the optimizer state, Adam forgets its running averages and the loss jumps after resuming.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>state_dict</strong>: an ordered dict name → tensor holding a module's parameters and buffers (e.g. BatchNorm running stats). Optimizers have their own <code>state_dict()</code>. Since PyTorch 2.6, <code>torch.load</code> defaults to <code>weights_only=True</code>, which refuses arbitrary pickled objects (safer).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A model saved from <code>nn.DataParallel</code>/DDP has keys starting with <code>module.</code>; strip them or save <code>model.module.state_dict()</code>. And always call <code>.eval()</code> after loading for inference.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: GPUs and devices.</b> Our 1,185-weight network trains in seconds on a CPU. An image or language model with millions of weights would take weeks. How do we use a GPU, and what changes in the code?</div>

  <h2 id="dp2-dev"><span class="num">09</span>GPU &amp; Device Handling</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we run the same training on a GPU, and how do we write code that works on machines with and without one?</p>
  </div>
  <p>A GPU runs thousands of multiplications in parallel, so big models train 10–100× faster. The catch: a GPU has its own memory, separate from the computer's RAM. A tensor lives in one place, and every tensor in one calculation must live in the same place. The rule: pick the device once, move the model there once, move every batch there as it arrives, and bring results back with <code>.cpu()</code> for NumPy or plotting.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The cook (GPU) and the ingredients must be in the same kitchen. If the onions are still at home (CPU), cooking stops with an error. The vessels (the model) are moved once; each day's vegetables (batches) are brought in daily.</p></div>
  <div class="flow"><span>pick device once</span><span>model.to(device)</span><span>each batch .to(device)</span><span>results .cpu() for NumPy</span></div>
  <p>Honest note: <strong>this machine has no GPU</strong> (PyTorch is installed with CUDA support, but no card is present). That is exactly the case the device pattern is for: the code below asks, falls back to CPU, and runs unchanged.</p>
<div class="fx" data-lang="py">print("CUDA available:", torch.cuda.is_available(), "| device:", device, "| CUDA build:", torch.version.cuda)
print("model lives on:", next(model.parameters()).device)
xb_dev = xb.to(device)                                   # (64, 2) batch to the model's device
print(model(xb_dev).shape)
with torch.autocast(device_type=device.type, dtype=torch.bfloat16):
    out = model(xb_dev)
print(out.dtype, model.head.weight.dtype)                # activations bf16, weights stay fp32
try:
    out.detach().cpu().numpy()
except TypeError as e:
    print("TypeError:", e)
print(out.detach().float().cpu().numpy().shape)</div>
  <div class="fx" data-lang="text">CUDA available: False | device: cpu | CUDA build: 13.0
model lives on: cpu
torch.Size([64, 1])
torch.bfloat16 torch.float32
TypeError: Got unsupported ScalarType BFloat16
(64, 1)</div>
  <p>Inside <code>torch.autocast</code> the model computed in <strong>bfloat16</strong> (a 16-bit float) while its weights stayed float32. That is <strong>mixed precision</strong>: about half the activation memory and much faster maths on modern GPUs (it works on CPU too, as here). NumPy has no bfloat16, so converting needs <code>.float()</code> first; <code>.detach()</code> is needed because NumPy cannot hold a graph.</p>
  <p>The full mixed-precision training step, written to work on either device. On a GPU it uses float16 with a <code>GradScaler</code> (small fp16 gradients can round to zero, so the loss is scaled up before backward and the gradients scaled back before the step). On this CPU-only machine the scaler is disabled and autocast uses bfloat16, so the very same code ran here for one epoch:</p>
<div class="fx" data-lang="py">use_cuda = device.type == "cuda"
amp_dtype = torch.float16 if use_cuda else torch.bfloat16
scaler = torch.amp.GradScaler(device.type, enabled=use_cuda)     # only needed for float16
model.train()
for x, y in train_dl:
    x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
    opt.zero_grad()
    with torch.autocast(device_type=device.type, dtype=amp_dtype):
        loss = loss_fn(model(x).squeeze(1).float(), y)
    scaler.scale(loss).backward()             # scale up so fp16 grads don't underflow (no-op here)
    scaler.unscale_(opt)                      # back to true scale before clipping
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    scaler.step(opt); scaler.update()
print("one mixed-precision epoch done on", device, "| last batch loss", round(loss.item(), 4))</div>
  <div class="fx" data-lang="text">one mixed-precision epoch done on cpu | last batch loss 0.1621</div>
  <table class="tbl">
    <tr><th>CUDA out of memory? Try in order</th><th>Effect</th></tr>
    <tr><td>Halve <code>batch_size</code></td><td>Biggest saving on activation memory</td></tr>
    <tr><td>Mixed precision (bf16/fp16)</td><td>~½ activation memory, faster on Tensor Cores</td></tr>
    <tr><td><code>torch.no_grad()</code> in validation</td><td>No graph stored</td></tr>
    <tr><td><code>loss.item()</code> when logging</td><td>No graphs kept alive</td></tr>
    <tr><td>Gradient checkpointing (<code>torch.utils.checkpoint</code>)</td><td>Recompute activations in backward: less memory, more compute</td></tr>
    <tr><td>Gradient accumulation</td><td>Small batches, step every k → same effective batch</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Device</strong>: where a tensor's memory lives (<code>cpu</code>, <code>cuda:0</code>, <code>mps</code> on Apple). <strong>Mixed precision (AMP)</strong>: run most operations in 16-bit, keep master weights in 32-bit.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Model on GPU, batch on CPU → "Expected all tensors to be on the same device". Watch tensors created <em>inside</em> <code>forward</code> (<code>torch.zeros(n)</code> lands on CPU): write <code>torch.zeros(n, device=x.device)</code>. Never hard-code <code>.cuda()</code>: the code then crashes on machines like this one.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: transfer learning.</b> We can train fast and save the result. But every model so far started from random weights and needed all 800 orders. What if a new task has little data? Can a trained network's body be reused?</div>

  <h2 id="dp2-tl"><span class="num">10</span>Transfer Learning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The shop now wants three answers: on time, late, very late. Must we train a new network from scratch, or can the body that already learned "far XOR rain" be reused?</p>
  </div>
  <p>Training an image model from scratch needs a million labelled photos and days of GPU time. A startup with 2,000 photos of damaged parcels cannot do that. But a model already trained on ImageNet has learned edges, textures and shapes that help with parcels too. <strong>Transfer learning</strong>: keep the trained body that turns raw input into useful features, replace the head (specific to the old task) with a new one for your classes, and train mostly the new head; later, optionally, gently adjust the top of the body too.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cook trained in North Indian food joins a Chinese restaurant. Knife skills and heat control carry over (frozen body); only the recipes are new (new head). After a few weeks the cook adapts some habits too, carefully (fine-tuning at a low learning rate).</p></div>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <defs><marker id="dp2-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="300" height="56" rx="8" class="fs" stroke="currentColor" stroke-dasharray="5 3"/>
    <text x="22" y="64">trained delivery body (2 → 32 → 32)</text><text x="22" y="84" class="tm">requires_grad = False · lr 0</text>
    <line x1="310" y1="68" x2="350" y2="68" stroke="currentColor" marker-end="url(#dp2-ah4)"/>
    <rect x="352" y="40" width="190" height="56" rx="8" class="fg sg"/><text x="364" y="64">new head (3 classes)</text><text x="364" y="84" class="tm">trainable · lr 1e-2</text>
    <text x="10" y="125" class="tm">phase 2: unfreeze the top body layer with a tiny lr (1e-4) → fine-tuning</text>
  </svg><figcaption>Reuse features learned on the first task; only the small head for the new task starts from scratch.</figcaption></figure>
  <p>The new task on the same orders: 0 = on time, 1 = late, 2 = very late (late in heavy rain above 15 mm/h). Parameter count of the new model: body 96 + 1,056 = 1,152 (unchanged), new head 32·3 + 3 = 99, total 1,251. After freezing the body only 99 are trainable; unfreezing <code>body[3]</code> (1,056) gives 1,155. Three classes means softmax output and <code>CrossEntropyLoss</code> with int64 labels (section 01's trap).</p>
<div class="fx" data-lang="py">torch.save(model.state_dict(), "delivery_body.pt")
new = DeliveryNet(n_out=3)
body_only = {k: v for k, v in torch.load("delivery_body.pt").items() if k.startswith("body")}
print(new.load_state_dict(body_only, strict=False))
for p in new.body.parameters():
    p.requires_grad = False                                   # phase 1: freeze the body
print("trainable:", sum(p.numel() for p in new.parameters() if p.requires_grad),
      "/", sum(p.numel() for p in new.parameters()))

X_all, y_late = ds.X, ds.y
severity = y_late.long() + ((y_late == 1) &amp; (X_all[:, 1] &gt; 0.75)).long()   # 0 on time, 1 late, 2 very late (int64)
print("class counts:", torch.bincount(severity).tolist())
Xs_tr, s_tr, Xs_va, s_va = X_all[:200], severity[:200], X_all[800:], severity[800:]   # only 200 labelled orders
ce = nn.CrossEntropyLoss()
def train_head(net, opt, steps=300):
    net.train()
    for _ in range(steps):
        opt.zero_grad(); ce(net(Xs_tr), s_tr).backward(); opt.step()
    net.eval()
    with torch.no_grad():
        return (net(Xs_va).argmax(1) == s_va).float().mean().item()

torch.manual_seed(0)
acc1 = train_head(new, torch.optim.Adam([p for p in new.parameters() if p.requires_grad], lr=1e-2))
for p in new.body[3].parameters():
    p.requires_grad = True                                    # phase 2: unfreeze the top body layer
opt3 = torch.optim.Adam([{"params": new.body[3].parameters(), "lr": 1e-4},
                         {"params": new.head.parameters(),    "lr": 1e-2}])
acc2 = train_head(new, opt3)
torch.manual_seed(0); scratch = DeliveryNet(n_out=3)
acc0 = train_head(scratch, torch.optim.Adam(scratch.parameters(), lr=1e-2))
print([g["lr"] for g in opt3.param_groups], "trainable now:", sum(p.numel() for p in new.parameters() if p.requires_grad))
print(f"val accuracy: frozen body + new head {acc1:.3f} | + fine-tune top layer {acc2:.3f} | from scratch on 200 orders {acc0:.3f}")
print(new(torch.randn(5, 2)).shape)                          # (5, 2) -&gt; (5, 3)</div>
  <div class="fx" data-lang="text">_IncompatibleKeys(missing_keys=['head.weight', 'head.bias'], unexpected_keys=[])
trainable: 99 / 1251
class counts: [511, 373, 116]
[0.0001, 0.01] trainable now: 1155
val accuracy: frozen body + new head 0.900 | + fine-tune top layer 0.925 | from scratch on 200 orders 0.905
torch.Size([5, 3])</div>
  <p>What happened: we filtered the saved dict to keys starting with <code>body</code> and loaded with <code>strict=False</code>, which reports what did not match instead of crashing: only the head is missing, as intended. <code>requires_grad=False</code> freezes a tensor: autograd skips it, so it never changes; the optimizer receives only trainable parameters. In phase 2, <strong>parameter groups</strong> give the pretrained layer a 100× smaller learning rate than the new head. The accuracy line compares the three routes on only 200 labelled orders: the frozen body with a 99-weight head reaches 0.900, fine-tuning the top layer 0.925, and training all 1,251 weights from scratch 0.905. On this tiny problem the gain is small, because the body already "knows" far XOR rain but 200 orders are almost enough to relearn it; with images and millions of weights the gap is enormous. The output is now (5, 3): three class scores.</p>
  <p>The same recipe on a real image model. Here <code>weights=None</code> builds the architecture without downloading (this machine does not fetch the 45 MB pretrained file); with <code>weights=models.ResNet18_Weights.DEFAULT</code> the code is identical and the body arrives pretrained on ImageNet:</p>
<div class="fx" data-lang="py">from torchvision import models
resnet = models.resnet18(weights=None)                       # pretrained: weights=models.ResNet18_Weights.DEFAULT
for p in resnet.parameters():
    p.requires_grad = False
resnet.fc = nn.Linear(resnet.fc.in_features, 3)              # new head 512 -&gt; 3, trainable by default
print("trainable:", sum(p.numel() for p in resnet.parameters() if p.requires_grad),
      "/", sum(p.numel() for p in resnet.parameters()))
print(resnet(torch.randn(2, 3, 224, 224)).shape)             # (2 images, 3 colours, 224, 224) -&gt; (2, 3)</div>
  <div class="fx" data-lang="text">trainable: 1539 / 11178051
torch.Size([2, 3])</div>
  <table class="tbl">
    <tr><th>Your data</th><th>Strategy</th></tr>
    <tr><td>Small, similar to pretraining</td><td>Freeze all, train head (feature extraction)</td></tr>
    <tr><td>Medium, or somewhat different</td><td>Train head, then unfreeze top blocks with low lr</td></tr>
    <tr><td>Large and different</td><td>Fine-tune everything, low lr, warm-up</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Feature extraction</strong>: frozen pretrained body + new trainable head. <strong>Fine-tuning</strong>: also update (some of) the pretrained weights, with a small learning rate. <strong>Catastrophic forgetting</strong>: a high learning rate overwrites what the pretrained layers knew. CNN backbones: <a class="xref" data-note="dl_cnns">CNNs</a>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Frozen BatchNorm layers still update their running stats in <code>train()</code> mode; put them in <code>eval()</code> if the backbone should stay fixed. Feed the input normalisation the pretrained model expects (e.g. ImageNet mean/std), or its features are garbage.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: breaking the loop on purpose.</b> We have the whole workflow. In real projects the loop is usually written slightly wrong. What does each common mistake look like in the numbers?</div>

  <h2 id="dp2-lab"><span class="num">11</span>Hands-on: Break the Loop</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When a run goes badly, how do you recognise which line of the loop is wrong?</p>
  </div>
  <p>The fastest way to recognise a training bug is to have caused it on purpose once. The same delivery run (fresh model, same seed, 20 epochs) is repeated, changing exactly one thing:</p>
<div class="fx" data-lang="py">def run(lr=1e-2, zero_grad=True, epochs=20):
    torch.manual_seed(0); m = DeliveryNet().to(device); o = torch.optim.Adam(m.parameters(), lr=lr); out = {}
    for ep in range(1, epochs + 1):
        m.train(); tot = 0
        for x, y in train_dl:
            if zero_grad: o.zero_grad()
            loss = loss_fn(m(x).squeeze(1), y); loss.backward(); o.step(); tot += loss.item() * len(x)
        m.eval()
        with torch.no_grad():
            acc = sum(((m(x).squeeze(1) &gt; 0).float() == y).sum().item() for x, y in val_dl) / 200
        if ep in (1, 5, 20): out[ep] = (round(tot / 800, 3), round(acc, 3))
    return out
for name, kw in [("baseline (Adam lr 1e-2)", {}), ("no opt.zero_grad()", {"zero_grad": False}),
                 ("lr = 1.0", {"lr": 1.0}), ("lr = 1e-4", {"lr": 1e-4})]:
    r = run(**kw)
    print(f"{name:24s} train loss ep1 {r[1][0]:7.3f} | val acc ep5 {r[5][1]:.3f} | val acc ep20 {r[20][1]:.3f}")</div>
  <div class="fx" data-lang="text">baseline (Adam lr 1e-2)  train loss ep1   0.686 | val acc ep5 0.885 | val acc ep20 0.930
no opt.zero_grad()       train loss ep1   0.693 | val acc ep5 0.770 | val acc ep20 0.465
lr = 1.0                 train loss ep1  26.177 | val acc ep5 0.535 | val acc ep20 0.465
lr = 1e-4                train loss ep1   0.693 | val acc ep5 0.465 | val acc ep20 0.465</div>
  <ul>
    <li><strong>No zero_grad:</strong> each step uses the sum of every gradient so far: steps become huge and point in out-of-date directions. Accuracy still reaches 0.77 at epoch 5, then collapses to 0.465 (the same answer for every order) by epoch 20. The first epochs look fine, so this bug hides well.</li>
    <li><strong>lr too high (1.0):</strong> each step overshoots: epoch-1 training loss 26, almost 40× ln 2, and the network ends dead at 0.465 accuracy.</li>
    <li><strong>lr too low (1e-4):</strong> nothing is broken, it is just slow: the loss stays at ln 2 for the first epoch and accuracy is still 0.465 at epoch 20 (it says "late" for every order).</li>
  </ul>
  <p>A check every practitioner runs before a long job: <strong>overfit one batch</strong>. Take 64 orders, turn dropout off, and train on only them. A correct model, loss and loop must drive the loss to almost zero. If it cannot, there is a bug in the plumbing, and more data or epochs will not help.</p>
<div class="fx" data-lang="py">torch.manual_seed(0)
xo, yo = ds.X[:64], ds.y[:64]                        # (64, 2), (64,)
m = DeliveryNet(p=0.0, hidden=64); o = torch.optim.Adam(m.parameters(), lr=1e-2)
for step in range(1, 1001):
    o.zero_grad(); loss = loss_fn(m(xo).squeeze(1), yo); loss.backward(); o.step()
    if step in (1, 100, 500, 1000): print(f"overfit step {step}: loss {loss.item():.4f}")</div>
  <div class="fx" data-lang="text">overfit step 1: loss 0.6933
overfit step 100: loss 0.0133
overfit step 500: loss 0.0003
overfit step 1000: loss 0.0001</div>
  <p>The loss falls from ln 2 toward zero: the pipeline can learn, even the 3 or so noisy labels in this batch get memorised. <strong>Try next yourself:</strong> remove <code>model.eval()</code> from <code>evaluate()</code> and watch validation accuracy jitter; shuffle the labels (<code>yo[torch.randperm(64)]</code>) and see that one batch can still be memorised but validation drops to about 50%.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Comparing runs that differ in two things at once. Change one setting per run and fix the seed, or you will not know which change caused the result.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the common mistakes, in one list.</b> We have seen each failure in context. For revision and code review, here they are together.</div>

  <h2 id="dp2-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which PyTorch mistakes cause most broken runs, and what is the one-line fix for each?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong dtype</span><p>NumPy/pandas data is float64; models are float32 → "must have the same dtype, but got Double and Float". <code>BCEWithLogitsLoss</code> labels: float, same shape as logits; <code>CrossEntropyLoss</code> labels: int64. Convert once in the Dataset.</p></div>
  <div class="callout trap"><span class="label">Trap: silent broadcasting</span><p>(N, 1) − (N,) becomes (N, N). Make prediction and target shapes identical before any loss (<code>.squeeze(1)</code>).</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting zero_grad</span><p>Gradients add up across steps. Call <code>opt.zero_grad()</code> every step unless you are accumulating on purpose.</p></div>
  <div class="callout trap"><span class="label">Trap: sigmoid/softmax before the loss</span><p><code>BCEWithLogitsLoss</code>/<code>CrossEntropyLoss</code> already apply it. Return raw logits from <code>forward</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: layers in a plain list</span><p>Invisible: 0 parameters, not trained, not moved, not saved. Use <code>nn.ModuleList</code> / <code>nn.ModuleDict</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: device mismatch</span><p>Model on GPU, batch or a tensor made inside <code>forward</code> on CPU. One <code>device</code> variable, <code>.to(device)</code> every batch, <code>device=x.device</code> for new tensors; never hard-code <code>.cuda()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: eval() without no_grad(), or the reverse</span><p><code>eval()</code> fixes dropout/BatchNorm; <code>no_grad()</code> saves memory. Validation needs both, and training needs <code>model.train()</code> again afterwards.</p></div>
  <div class="callout trap"><span class="label">Trap: logging loss tensors</span><p><code>total += loss</code> keeps each graph alive → memory grows to OOM. Use <code>loss.item()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: saving the whole model</span><p><code>torch.save(model)</code> pickles class paths and breaks after a refactor. Save <code>state_dict()</code> and rebuild the class to load.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> Each tool solves one need. One picture and one table show how they fit into the single loop we started the track with.</div>

  <h2 id="dp2-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Tensor, autograd, Module, DataLoader, optimizer, eval, state_dict, device: how do they map onto guess → measure → blame → nudge?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 230" width="700">
<defs><marker id="dp2-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="130" height="50" rx="7" class="fb sb"/><text x="75" y="40" text-anchor="middle" font-size="11.5" font-weight="700">Dataset/DataLoader</text><text x="75" y="58" text-anchor="middle" class="tm" font-size="10">tensors (64, 2), (64,)</text>
<line x1="140" y1="45" x2="163" y2="45" stroke="currentColor" marker-end="url(#dp2-a9)"/>
<rect x="165" y="20" width="110" height="50" rx="7" class="fb sb"/><text x="220" y="40" text-anchor="middle" font-size="11.5" font-weight="700">nn.Module</text><text x="220" y="58" text-anchor="middle" class="tm" font-size="10">guess: model(x)</text>
<line x1="275" y1="45" x2="298" y2="45" stroke="currentColor" marker-end="url(#dp2-a9)"/>
<rect x="300" y="20" width="110" height="50" rx="7" class="fv sb"/><text x="355" y="40" text-anchor="middle" font-size="11.5" font-weight="700">loss_fn</text><text x="355" y="58" text-anchor="middle" class="tm" font-size="10">measure</text>
<line x1="410" y1="45" x2="433" y2="45" stroke="currentColor" marker-end="url(#dp2-a9)"/>
<rect x="435" y="20" width="110" height="50" rx="7" class="fr sr"/><text x="490" y="40" text-anchor="middle" font-size="11.5" font-weight="700">autograd</text><text x="490" y="58" text-anchor="middle" class="tm" font-size="10">blame: backward()</text>
<line x1="545" y1="45" x2="568" y2="45" stroke="currentColor" marker-end="url(#dp2-a9)"/>
<rect x="570" y="20" width="120" height="50" rx="7" class="fg sg"/><text x="630" y="40" text-anchor="middle" font-size="11.5" font-weight="700">optimizer</text><text x="630" y="58" text-anchor="middle" class="tm" font-size="10">nudge: step()</text>
<path d="M630,70 L630,95 L220,95 L220,72" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dp2-a9)"/><text x="360" y="90" class="tm" font-size="10">zero_grad, next batch</text>
<rect x="10" y="130" width="160" height="46" rx="7" class="ft st"/><text x="90" y="150" text-anchor="middle" font-size="11.5" font-weight="700">eval() + no_grad()</text><text x="90" y="167" text-anchor="middle" class="tm" font-size="10">predict properly</text>
<rect x="190" y="130" width="150" height="46" rx="7" class="ft st"/><text x="265" y="150" text-anchor="middle" font-size="11.5" font-weight="700">state_dict</text><text x="265" y="167" text-anchor="middle" class="tm" font-size="10">keep the best</text>
<rect x="360" y="130" width="150" height="46" rx="7" class="ft st"/><text x="435" y="150" text-anchor="middle" font-size="11.5" font-weight="700">device / AMP</text><text x="435" y="167" text-anchor="middle" class="tm" font-size="10">run it fast</text>
<rect x="530" y="130" width="160" height="46" rx="7" class="ft st"/><text x="610" y="150" text-anchor="middle" font-size="11.5" font-weight="700">transfer learning</text><text x="610" y="167" text-anchor="middle" class="tm" font-size="10">reuse the body</text>
<text x="350" y="210" text-anchor="middle" class="tm" font-size="10.5">everything is a tensor with a shape, a dtype and a device</text>
</svg><figcaption>The top row is the learning loop from <a class="xref" data-note="dl_foundations">the map</a>, one PyTorch tool per move; the bottom row is what you do around the loop.</figcaption></figure>
  <table class="tbl"><caption>Every tool on the delivery network</caption>
    <tr><th>Tool</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>Tensor</td><td>array + shape, dtype, device</td><td>how to hold numbers for GPU + gradients?</td><td>orders A–D: (4, 2) float32</td><td>always</td></tr>
    <tr><td>Broadcasting</td><td>align-right rule</td><td>how do sizes combine?</td><td>(4, 1) − (4,) → (4, 4) bug</td><td>every operation</td></tr>
    <tr><td>Autograd</td><td>recorded graph + chain rule</td><td>who computes gradients?</td><td>order D: ∂L/∂v = (0.6457, 0.3228)</td><td>every backward()</td></tr>
    <tr><td>nn.Module</td><td>layers as attributes + forward</td><td>how to package a model?</td><td>DeliveryNet: 1,185 params</td><td>every model</td></tr>
    <tr><td>Dataset/DataLoader</td><td>__len__/__getitem__ + sampler</td><td>how to feed batches?</td><td>800 → 13 batches, last 32</td><td>any real data</td></tr>
    <tr><td>Loss + optimizer</td><td>loss fn + Adam</td><td>how to measure and nudge?</td><td>step-0 ≈ ln 2; ~0.93 val acc</td><td>every training step</td></tr>
    <tr><td>eval() / no_grad()</td><td>layer mode / autograd off</td><td>how to predict properly?</td><td>3 different vs 3 identical outputs</td><td>validation, serving</td></tr>
    <tr><td>state_dict</td><td>name → tensor dict</td><td>how to keep the best model?</td><td>reloaded model gives identical outputs</td><td>every run</td></tr>
    <tr><td>device / AMP</td><td>.to(device), autocast</td><td>how to run fast?</td><td>CPU here (no GPU); bf16 autocast works</td><td>big models</td></tr>
    <tr><td>Transfer learning</td><td>frozen body + new head</td><td>how to reuse a trained model?</td><td>3-class head on 200 orders</td><td>little labelled data</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>PyTorch is the learning loop as code: a DataLoader serves tensors, a Module guesses, a loss measures, autograd assigns blame, an optimizer nudges; eval mode, state_dicts and devices are how you use the result.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="dp2-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: orders A–D (far, rain; late = far XOR rain) as a (4, 2) tensor, and 1,000 generated orders (800 train, 200 validation) for DeliveryNet: body 2 → 32 → 32 (ReLU, dropout 0.1), head 32 → 1 logit; BCEWithLogitsLoss; Adam lr 1e-2.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Question</th><th>On our orders</th><th>Limit → next</th></tr>
    <tr><td>Tensor</td><td>hold numbers for GPU + grads?</td><td>(4, 2) float32; NumPy gives float64</td><td>shape bugs → broadcasting</td></tr>
    <tr><td>Shapes</td><td>how do sizes combine?</td><td>(4, 2) − (2,) OK; (4, 1) − (4,) → (4, 4)</td><td>gradients? → autograd</td></tr>
    <tr><td>Autograd</td><td>who does backprop?</td><td>matches the hand table for order D</td><td>loose tensors → Module</td></tr>
    <tr><td>nn.Module</td><td>package a model?</td><td>1,185 params; (N, 2) → (N, 1)</td><td>feeding data → DataLoader</td></tr>
    <tr><td>DataLoader</td><td>batches?</td><td>13 batches of 64 (last 32)</td><td>the steps → loop</td></tr>
    <tr><td>Training loop</td><td>exact order?</td><td>step-0 0.67 ≈ ln 2; ~0.93 val acc</td><td>predicting → eval/no_grad</td></tr>
    <tr><td>eval / no_grad</td><td>predict properly?</td><td>dropout: 3 different vs identical</td><td>keep it → state_dict</td></tr>
    <tr><td>state_dict</td><td>save/restore?</td><td>reloaded = identical outputs</td><td>speed → device</td></tr>
    <tr><td>Device / AMP</td><td>use a GPU?</td><td>no GPU here; same code on CPU</td><td>reuse → transfer</td></tr>
    <tr><td>Transfer learning</td><td>reuse a body?</td><td>new 3-class head, 99 trainable</td><td>→ <a class="xref" data-note="dl_cnns">CNNs</a></td></tr>
  </table>
  <h3>The code you must know by heart</h3>
  <table class="tbl">
    <tr><th>Purpose</th><th>Code</th></tr>
    <tr><td>Device</td><td><code>device = torch.device("cuda" if torch.cuda.is_available() else "cpu")</code></td></tr>
    <tr><td>Model skeleton</td><td><code>class Net(nn.Module): __init__: super().__init__(); layers on self · forward(x): return …</code></td></tr>
    <tr><td>Training step</td><td><code>opt.zero_grad(); loss = loss_fn(model(x), y); loss.backward(); opt.step()</code></td></tr>
    <tr><td>Validation</td><td><code>model.eval()</code> + <code>with torch.no_grad():</code> … then <code>model.train()</code></td></tr>
    <tr><td>Save / load</td><td><code>torch.save(model.state_dict(), p)</code>; <code>m = Net(); m.load_state_dict(torch.load(p, map_location=device)); m.eval()</code></td></tr>
    <tr><td>Freeze / groups</td><td><code>p.requires_grad = False</code>; <code>Adam([{"params": body, "lr": 1e-4}, {"params": head, "lr": 1e-2}])</code></td></tr>
    <tr><td>Shapes</td><td>Linear(in, out).weight is (out, in); params in·out + out; images (N, C, H, W)</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>BCEWithLogitsLoss</b><p>One yes/no (late) or multi-label; float labels, same shape as logits.</p><small>No sigmoid in the model</small></div>
    <div><b>CrossEntropyLoss</b><p>One of C classes; int64 labels.</p><small>No softmax in the model; no one-hot</small></div>
    <div><b>torch.no_grad / inference_mode</b><p>Validation and serving.</p><small>Never around the training step</small></div>
    <div><b>Mixed precision</b><p>GPUs with Tensor Cores; big models.</p><small>fp16 needs GradScaler; bf16 does not</small></div>
    <div><b>Freeze + new head</b><p>Little labelled data, similar task.</p><small>Fine-tune with low lr when data grows</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>float64 data into float32 model; wrong label dtype/shape for the loss; (N, 1) vs (N,) broadcasting; no zero_grad; sigmoid/softmax before the loss; layers in a plain list; device mismatch and hard-coded .cuda(); eval() without no_grad() or forgetting train() after; total += loss; torch.save(model); high lr on pretrained layers.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Parameters in DeliveryNet (2 → 32 → 32 → 1)?</td><td>96 + 1,056 + 33 = 1,185</td></tr>
    <tr><td>Shape of (8, 1) + (3,)?</td><td>(8, 3)</td></tr>
    <tr><td><code>x = torch.tensor(3., requires_grad=True); (x**2).backward(); (x**2).backward(); x.grad</code>?</td><td>12 (6 + 6, gradients accumulate)</td></tr>
    <tr><td>900 training orders, batch 64: batches per epoch and last batch size?</td><td>15 batches; last has 900 − 14·64 = 4</td></tr>
    <tr><td>What does <code>model.eval()</code> NOT do?</td><td>It does not stop gradient recording; that is <code>torch.no_grad()</code></td></tr>
  </table>

  <h2 id="dp2-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you write the delivery training loop from memory and explain why each line is there?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Write the five lines inside a training step, in order.</summary><div class="qa-body"><code>opt.zero_grad()</code> → <code>out = model(x)</code> → <code>loss = loss_fn(out, y)</code> → <code>loss.backward()</code> → <code>opt.step()</code>. Clip between backward and step; <code>scheduler.step()</code> after (per epoch or per step, depending on the scheduler).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why call <code>optimizer.zero_grad()</code>? When would you skip it on purpose?</summary><div class="qa-body"><code>backward()</code> adds into <code>.grad</code>. Without zeroing, each step uses the sum of all past gradients. Skip it on purpose for gradient accumulation: k small batches, then one step (divide the loss by k).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Difference between <code>model.eval()</code> and <code>torch.no_grad()</code>?</summary><div class="qa-body"><code>eval()</code> changes layer behaviour (dropout off, BatchNorm running stats). <code>no_grad()</code> stops graph recording (saves memory and time). Our model under <code>no_grad</code> in train mode still gave 3 different outputs. Use both for validation and inference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>x = torch.tensor(3., requires_grad=True); y = x**2; y.backward(); y = x**2; y.backward(); print(x.grad)</code></summary><div class="qa-body"><code>tensor(12.)</code>: dy/dx = 2x = 6 each time, and gradients accumulate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A batch of 16 RGB images of 64×64. Shape in PyTorch, and after <code>reshape(16, -1)</code>?</summary><div class="qa-body">(16, 3, 64, 64) in NCHW order. Flattened: (16, 12288).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters in <code>nn.Linear(32, 10)</code>, and what is the weight's shape?</summary><div class="qa-body">32·10 + 10 = 330. Weight (10, 32): (out, in). It computes x @ W.T + b, so (N, 32) → (N, 10).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why save the <code>state_dict</code> instead of the whole model?</summary><div class="qa-body"><code>torch.save(model)</code> pickles a pointer to the class and file path; renaming or moving code breaks loading, and unpickling unknown objects is unsafe. A state_dict is just name → tensor: portable, loadable with <code>weights_only=True</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What goes into a checkpoint for resuming training?</summary><div class="qa-body">Model and optimizer state_dicts, scheduler state, epoch/step, best metric, GradScaler state with AMP, ideally RNG states. Without the optimizer state, Adam's averages restart and the loss jumps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"Expected all tensors to be on the same device". Fix?</summary><div class="qa-body">Some tensor (batch, label, or one created inside <code>forward</code>) is on CPU while the model is on GPU. Move batches with <code>.to(device)</code>; create new tensors with <code>device=x.device</code>; register constants as buffers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Memory grows every iteration until CUDA OOM. Likely causes?</summary><div class="qa-body">Summing <code>loss</code> instead of <code>loss.item()</code>; storing outputs with graphs; validation without <code>no_grad()</code>. Then: smaller batch, mixed precision, gradient checkpointing, accumulation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you freeze a pretrained backbone and train only a new head?</summary><div class="qa-body"><code>requires_grad=False</code> on backbone params, replace the final layer (new layers are trainable), give the optimizer only trainable params. Later unfreeze top blocks with parameter groups: low lr (1e-5–1e-4) for the backbone, higher for the head.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model cannot overfit a single batch of 64. What does that tell you?</summary><div class="qa-body">The plumbing is broken: wrong labels, a detached graph, a missing <code>optimizer.step()</code>, a frozen model, a wrong loss/activation pair, or an lr far off. A healthy setup drives one batch to near-zero loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what does autograd do that we did by hand in the backprop note, and what does it still need from you?</summary><div class="qa-body">It records the graph and runs the chain rule backwards, giving exactly our hand numbers for order D. It still needs a correct forward pass, a single scalar loss, zeroed gradients each step, and the update (the optimizer).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the Module/state_dict design make transfer learning a few lines?</summary><div class="qa-body">Because parameters are named by attribute path (<code>body.0.weight</code>…), you can filter a saved state_dict to the body, load it with <code>strict=False</code> into a model with a different head, and freeze by attribute (<code>model.body.parameters()</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip <code>model.eval()</code> but keep <code>no_grad()</code> in validation, for a model with BatchNorm?</summary><div class="qa-body">BatchNorm uses the validation batch's own statistics (and updates the running averages with validation data), and dropout stays on: metrics become noisy and depend on batch composition, and the model you later save has been nudged by validation data.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="dl_cnns">CNNs</a>.</b> An MLP treats every input number independently of its position. Images have structure (neighbouring pixels belong together), and so do sequences and text. The next notes keep this exact loop and change the body: convolutions for images, recurrence for sequences (<a class="xref" data-note="dl_rnns">RNNs</a>), attention for long-range context (<a class="xref" data-note="dl_attention">Attention</a>).</div>
</main>`
});
