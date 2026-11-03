// notes/dl/dl_pytorch.js — PyTorch
Object.assign(TOPIC_CONTENT, {
  "dl_pytorch": `<main>
  <h1>PyTorch</h1>
  <div class="where"><span>Deep Learning</span><span>Neural Networks</span><span>PyTorch</span></div>
  <p class="lead">PyTorch is a Python library for building and training neural networks, and it is what most deep-learning research, most large language model code and the Hugging Face ecosystem are written in. It gives you three things that plain Python and NumPy do not: arrays that can run on a graphics card, automatic calculation of gradients so you never write backpropagation by hand, and ready-made building blocks for layers, data loading, optimisers and saving models. This page teaches it by doing one job end to end: training the late-delivery network from the rest of this track, which predicts whether a food order will be late from its distance and the rain (late = far XOR rainy). We start with the four hand-made orders A–D, then move to 1,000 generated orders, and each PyTorch tool is introduced at the moment the job needs it. Every output shown comes from a real run on a CPU (this machine has no GPU; the GPU section says what changes when you have one).</p>

  <h2 id="dp2-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">PyTorch</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Tensors</div>
        <ul>
          <li>Grid of numbers with a <b>shape</b>, a <b>dtype</b> and a <b>device</b></li>
          <li>Models use float32; NumPy gives float64</li>
          <li>Broadcasting: align shapes from the right, size 1 stretches</li>
          <li>(N, 1) − (N,) silently becomes (N, N)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Autograd and nn.Module</div>
        <ul>
          <li><code>requires_grad=True</code> records the graph; <code>backward()</code> fills <code>.grad</code></li>
          <li>Gradients add up: zero them every step</li>
          <li>Module: layers in <code>__init__</code>, maths in <code>forward</code></li>
          <li>Layers in a plain list are invisible → <code>nn.ModuleList</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Training</div>
        <ul>
          <li>Dataset (<code>__len__</code>, <code>__getitem__</code>) + DataLoader (shuffle, batch)</li>
          <li>zero_grad → forward → loss → backward → step</li>
          <li><code>eval()</code> changes layers; <code>no_grad()</code> stops recording</li>
          <li>Log <code>loss.item()</code>, never the tensor</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Around the loop</div>
        <ul>
          <li>Save <code>state_dict()</code>; rebuild, load, <code>eval()</code></li>
          <li>One <code>device</code>; model once, every batch every time</li>
          <li>Mixed precision: <code>autocast</code> (+ GradScaler for fp16)</li>
          <li>Transfer: freeze body, new head, small lr to fine-tune</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dp2-ten"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Tensors</span><span class="rm-sub">PyTorch's array: shape, dtype, device</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-shape"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Shapes and Broadcasting</span><span class="rm-sub">how sizes combine, and the silent bugs</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-ag"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Autograd</span><span class="rm-sub">backpropagation done for you</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-mod"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">nn.Module</span><span class="rm-sub">packaging a model and its weights</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-data"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Dataset and DataLoader</span><span class="rm-sub">feeding shuffled batches</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-loop"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Training Loop</span><span class="rm-sub">the five calls per batch</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-eval"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">eval() and no_grad()</span><span class="rm-sub">two different switches for predicting</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-ckpt"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Saving and Loading</span><span class="rm-sub">state_dict checkpoints</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-dev"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">GPUs and Mixed Precision</span><span class="rm-sub">devices, .to(), autocast</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-tl"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Transfer Learning</span><span class="rm-sub">reusing a trained body for a new task</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-debug"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Debugging a Training Run</span><span class="rm-sub">what each mistake looks like in the numbers</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">double sigmoid, loss tensors, label dtypes</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">the code to know by heart</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the PyTorch questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="dp2-ten"><span class="num">01</span>Tensors</h2>
  <p>Our four orders are a small table of numbers, and NumPy could hold them. So why does deep learning need a new kind of array? NumPy has two gaps. It runs only on the CPU, while training means billions of multiplications that a GPU (graphics card) does 10 to 100 times faster. And NumPy cannot tell you how a result depends on its inputs, which is exactly what training needs: the gradient of the loss with respect to every weight. PyTorch fills both gaps with one object, the <strong>tensor</strong>: a grid of numbers, like a NumPy array, that can live on a GPU and can remember how it was computed.</p>
  <p>A single number, a list, a table and a stack of tables are all tensors; they differ only in how many directions, or <strong>dimensions</strong>, the grid has. Every tensor is described by three attributes, and most PyTorch errors are a mismatch in one of them. Its <strong>shape</strong> is the size of each dimension: our four orders, with two features each (far and rain), form a table of shape (4, 2). Its <strong>dtype</strong> (data type) is the kind of number stored, such as float32 (32-bit decimals, what models use) or int64 (whole numbers). Its <strong>device</strong> is where the memory lives: <code>cpu</code> or <code>cuda</code> (an NVIDIA GPU). Think of a dabbawala's lunch-box cart, whose label says how many trays and boxes it carries (shape), what kind of food is inside (dtype), and which station it is at (device).</p>
  <div class="fx" data-lang="py">import torch, numpy as np
X4 = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])     # orders A-D: far?, rain?
y4 = torch.tensor([0., 1., 1., 0.])                              # late? (far XOR rain)
print(X4.shape, X4.dtype, X4.device)
print(X4.ndim, X4.numel())
print(X4[3], X4[:, 1], X4[1, 1].item())
print(torch.tensor([1, 2]).dtype, torch.zeros(2, 3).dtype, torch.tensor(np.array([1.5])).dtype)</div>
  <div class="fx" data-lang="text">torch.Size([4, 2]) torch.float32 cpu
2 8
tensor([1., 1.]) tensor([0., 1., 0., 1.]) 1.0
torch.int64 torch.float32 torch.float64</div>
  <p><code>torch.tensor(...)</code> copied the Python list into a tensor of shape (4, 2), 2 dimensions, 8 numbers, on the CPU. Indexing works as in NumPy: <code>X4[3]</code> is row 3, order D, which is [1, 1] (far and rainy); <code>X4[:, 1]</code> is column 1, the rain flags of all four orders. <code>.item()</code> turns a one-number tensor into a plain Python number, which is what you want for printing and logging. The last line shows the default dtypes, which matter more than they look: Python decimals become float32, Python integers become int64, but a NumPy array keeps NumPy's default float64. That difference causes one of the first errors everyone meets, when data loaded with pandas or NumPy is fed into a layer whose weights are float32:</p>
  <div class="fx" data-lang="py">lin = torch.nn.Linear(2, 1)                          # a layer: its weights are float32
orders_np = np.array([[0.8, 0.3]])                   # NumPy default: float64 (an 8 km, 6 mm/h order)
try:
    lin(torch.from_numpy(orders_np))
except RuntimeError as e:
    print("RuntimeError:", e)
print(lin(torch.tensor(orders_np, dtype=torch.float32)).shape)</div>
  <div class="fx" data-lang="text">RuntimeError: mat1 and mat2 must have the same dtype, but got Double and Float
torch.Size([1, 1])</div>
  <p>"Double" is PyTorch's name for float64 and "Float" for float32; a matrix multiplication needs both sides to have the same dtype. Converting once with <code>dtype=torch.float32</code> fixes it. Labels have dtype rules too, which depend on the loss function, as we will see in the training loop.</p>

  <h2 id="dp2-shape"><span class="num">02</span>Shapes and Broadcasting</h2>
  <p>Most deep-learning bugs are shape bugs. A layer expects a batch of examples, shape (batch, features), and is given one example of shape (features,); an image layer expects colour channels first and gets them last. The error often appears several lines away from the real mistake, or worse, does not appear at all. The cure is a habit: know the shape of every tensor on every line.</p>
  <p>The key idea is that the numbers in a tensor sit in memory as one long row, and the shape is only a way of reading them. <code>reshape</code> reads the same numbers as a different grid; <code>permute</code> swaps the order of the dimensions; <code>unsqueeze</code> adds a dimension of size 1 and <code>squeeze</code> removes one. Think of a box of 24 sweets: you can lay them out 4 × 6, 6 × 4 or 2 × 12 (reshape), turn the tray sideways (permute), or put the tray into a bag that holds exactly one tray, which adds a "bag" dimension of size 1 without changing any sweet (unsqueeze). Image data shows all of these. A batch of images has shape (N, C, H, W): N images, C colour channels, H × W pixels. The code traces a batch of 32 colour images of 28 × 28 pixels, and then the same "batch of one" trick on a single order:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
imgs = torch.randn(32, 3, 28, 28)            # (N, C, H, W): 32 colour images, 28x28
print(imgs.reshape(32, -1).shape)            # flatten each image
print(imgs.permute(0, 2, 3, 1).shape)        # channels last
one = imgs[0]
print(one.shape, one.unsqueeze(0).shape, one.unsqueeze(0).squeeze(0).shape)
print("one order as a batch:", X4[3].shape, "-&gt;", X4[3].unsqueeze(0).shape)</div>
  <div class="fx" data-lang="text">torch.Size([32, 2352])
torch.Size([32, 28, 28, 3])
torch.Size([3, 28, 28]) torch.Size([1, 3, 28, 28]) torch.Size([3, 28, 28])
one order as a batch: torch.Size([2]) -&gt; torch.Size([1, 2])</div>
  <p><code>reshape(32, -1)</code> flattens each image into one row; the −1 means "work this size out", here 3 × 28 × 28 = 2352. <code>permute(0, 2, 3, 1)</code> moves the channels to the end, the layout NumPy and plotting libraries use. Taking <code>imgs[0]</code> drops the batch dimension, and <code>unsqueeze(0)</code> puts it back as size 1, because models always expect a batch, even of one. The same applies to one order: shape (2,) becomes (1, 2).</p>
  <p>When two tensors of different shapes are combined, PyTorch uses <strong>broadcasting</strong>: line the shapes up from the right; each pair of sizes must be equal, or one of them must be 1 (or missing), and a size-1 dimension is stretched to match without copying data. Centring the orders is an example: X4 has shape (4, 2), the column means have shape (2,), and the mean row is subtracted from every row. <strong>Matrix multiplication</strong>, written <code>@</code>, follows a different rule: the inner sizes must match, (4, 2) @ (2, 3) gives (4, 3). And <strong>reductions</strong> such as <code>sum</code> or <code>mean</code> collapse a chosen dimension: <code>dim=0</code> collapses down the rows, leaving one number per column.</p>
  <div class="fx" data-lang="py">mean = X4.mean(dim=0)                         # (2,)  column means: [0.5, 0.5]
print(X4 - mean)                              # (4, 2) - (2,)  -&gt; (4, 2)
W = torch.tensor([[1., 1.], [1., 1.], [1., -1.]])        # 3 neurons x 2 inputs
print((X4 @ W.T).shape, (X4 @ W.T).tolist())             # (4, 2) @ (2, 3) -&gt; (4, 3)
print(X4.sum(dim=0), X4.sum(dim=1), X4.mean(dim=1, keepdim=True).shape)
try:
    torch.randn(4, 2) @ torch.randn(4, 2)     # inner sizes 2 and 4 do not match
except RuntimeError as e:
    print("RuntimeError:", e)</div>
  <div class="fx" data-lang="text">tensor([[-0.5000, -0.5000],
        [-0.5000,  0.5000],
        [ 0.5000, -0.5000],
        [ 0.5000,  0.5000]])
torch.Size([4, 3]) [[0.0, 0.0, 0.0], [1.0, 1.0, -1.0], [1.0, 1.0, 1.0], [2.0, 2.0, 0.0]]
tensor([2., 2.]) tensor([0., 1., 1., 2.]) torch.Size([4, 1])
RuntimeError: mm: mat1 and mat2 shapes cannot be multiplied (4x2 and 4x2)</div>
  <p>Check one cell of the matrix product by hand: order D is (1, 1), and the third neuron's weights are (1, −1), so 1 − 1 = 0, the last number in the last row. <code>keepdim=True</code> keeps the collapsed dimension as size 1, giving (4, 1) instead of (4,), so the result still broadcasts correctly against X4. When sizes do not fit, the error prints both shapes, which tells you exactly what to fix.</p>
  <p>The dangerous case is when broadcasting <em>does</em> fit, but not the way you meant. A model outputs one logit per order with shape (4, 1), while the labels have shape (4,). Lined up from the right, (4, 1) and (4,) broadcast to (4, 4): sixteen numbers, every prediction compared with every label. Some loss functions catch this and some do not:</p>
  <div class="fx" data-lang="py">import torch.nn.functional as F
logits = torch.zeros(4, 1)                    # model output: (N, 1)
print("(4,1) - (4,) -&gt;", tuple((logits - y4).shape))
print("MSE with mismatched shapes:", F.mse_loss(torch.sigmoid(logits), y4).item())
try:
    F.binary_cross_entropy_with_logits(logits, y4)
except ValueError as e:
    print("ValueError:", e)
print("fixed:", F.binary_cross_entropy_with_logits(logits.squeeze(1), y4).item())</div>
  <div class="fx" data-lang="text">(4,1) - (4,) -&gt; (4, 4)
MSE with mismatched shapes: 0.25
ValueError: Target size (torch.Size([4])) must be the same as input size (torch.Size([4, 1]))
fixed: 0.6931471824645996</div>
  <p>The subtraction produced a 4 × 4 grid. Mean squared error happily averaged it into a meaningless 0.25 (in real code with only a warning). <code>binary_cross_entropy_with_logits</code> refuses mismatched shapes. After <code>squeeze(1)</code> the logits have shape (4,), and the loss is 0.693 = ln 2, the correct value for a model that says 50/50 for every order. The rule: make prediction and target shapes identical before any loss.</p>
  <p>One last shape detail comes up in interviews. Some operations, such as transposing with <code>.T</code>, move no numbers at all; they only change the order in which memory is read, so the tensor is no longer <strong>contiguous</strong> (stored in the order its shape reads it). <code>view</code> also reinterprets memory without copying, so it refuses to work on such a tensor, while <code>reshape</code> copies when it has to. Similarly, <code>torch.from_numpy</code> shares memory with the NumPy array, while <code>torch.tensor</code> makes its own copy:</p>
  <div class="fx" data-lang="py">t = X4.T                                  # transpose: (2, 4), same memory read in another order
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
  <p><code>view(-1)</code> failed on the transposed tensor and <code>reshape(-1)</code> worked. Changing <code>arr[0]</code> to 99 also changed <code>shared</code>, because they are the same memory; the later change to <code>arr[1]</code> did not affect <code>copy</code>. Use <code>reshape</code> unless you need the no-copy guarantee, and remember that <code>from_numpy</code> links the two arrays.</p>

  <h2 id="dp2-ag"><span class="num">03</span>Autograd</h2>
  <p>In <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a> we worked out the gradients of a 2-2-1 network by hand, step by step through the chain rule. That was fine for nine weights; for a real network with millions it is impossible, and every new architecture would need new derivations. PyTorch's <strong>autograd</strong> (automatic differentiation) does it for you. When a tensor is created with <code>requires_grad=True</code>, PyTorch records every operation performed with it, building a <strong>computation graph</strong> that links each result to the inputs it came from. Calling <code>.backward()</code> on the final number, the loss, walks that graph from the end back to the start, applying the chain rule at each step exactly as we did by hand, and stores each gradient in the <code>.grad</code> attribute of the tensors you created. Think of a detailed shop bill that lists every item, quantity and tax line: from the total you can trace exactly how much each item contributed. Autograd keeps such a bill for every number it computes, and <code>backward()</code> reads it from the bottom up.</p>
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
  <p>The figure shows the graph for order D going through the 2-2-1 network. The blue boxes are the tensors we created, called <strong>leaves</strong>; their <code>.grad</code> will be filled in. The violet boxes are recorded operations, each stored as a <code>grad_fn</code> that knows how to pass gradients backwards. The test of autograd is simple: rebuild that network with the same starting weights as the backprop note, run order D forward, call <code>backward()</code>, and compare with the hand-computed table, where ∂L/∂v was (0.6457, 0.3228) and the rows of ∂L/∂W¹ were (0.5165, 0.5165) and (−0.3874, −0.3874):</p>
  <div class="fx" data-lang="py">W1 = torch.tensor([[0.5, 0.4], [0.3, 0.6]], requires_grad=True); b1 = torch.tensor([0.1, -0.4], requires_grad=True)
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
  <p>Every number matches the hand table. The loss tensor remembers how it was made (its <code>grad_fn</code> is the backward function of binary cross-entropy), and one call to <code>backward()</code> did all eight steps we did by hand. It would do the same for a network with a billion weights. The graph is <strong>dynamic</strong>: it is rebuilt on every forward pass and thrown away after <code>backward()</code>, so ordinary Python <code>if</code> statements and loops inside a model simply work. Three behaviours need to be known before training with autograd:</p>
  <div class="fx" data-lang="py">z = torch.relu(xD @ W1.T + b1) @ v + c
F.binary_cross_entropy_with_logits(z, yD).backward()     # a second backward, without zeroing
print("dL/dc after two backward calls:", round(c.grad.item(), 4))
c.grad.zero_(); print("after zero_():", c.grad.item())
a = torch.tensor([1., 2.], requires_grad=True)
print((a * 2).requires_grad, (a * 2).detach().requires_grad)   # detach: cut out of the graph
with torch.no_grad():
    d = a * 2
print(d.requires_grad, d.grad_fn)                        # nothing recorded</div>
  <div class="fx" data-lang="text">dL/dc after two backward calls: 1.2913
after zero_(): 0.0
True False
False None</div>
  <p>Running the forward and backward pass a second time gave 1.2913, not 0.6457: <code>backward()</code> <em>adds</em> into <code>.grad</code> rather than replacing it, so gradients accumulate until you reset them with <code>zero_()</code>. This is deliberate, because it lets you add up gradients over several small batches before one update, but in normal training you must zero gradients every step. <code>detach()</code> returns a copy of a tensor cut out of the graph, and inside a <code>torch.no_grad()</code> block nothing is recorded at all, which is what you want for updates and for prediction.</p>
  <p>That is already enough to train. The code trains the 2-2-1 network on all four orders with autograd computing the gradients and a hand-written gradient-descent update (lr 0.5, as in the backprop note):</p>
  <div class="fx" data-lang="py">params = [torch.tensor([[0.5, 0.4], [0.3, 0.6]]), torch.tensor([0.1, -0.4]), torch.tensor([0.8, -0.6]), torch.tensor(0.1)]
for p_ in params: p_.requires_grad_(True)
W1, b1, v, c = params
for step in range(1, 3001):
    z = torch.relu(X4 @ W1.T + b1) @ v + c                # (4,) logits for orders A-D
    loss = F.binary_cross_entropy_with_logits(z, y4)
    loss.backward()                                       # autograd fills every .grad
    with torch.no_grad():                                 # the update itself must not be recorded
        for p_ in params:
            p_ -= 0.5 * p_.grad                           # gradient descent, lr 0.5
            p_.grad.zero_()                               # or they add up
    if step in (1, 3000):
        print(f"step {step}: loss {loss.item():.4f}  P(late) {[round(t, 4) for t in torch.sigmoid(z).tolist()]}")</div>
  <div class="fx" data-lang="text">step 1: loss 0.6976  P(late) [0.5449, 0.5939, 0.6411, 0.6457]
step 3000: loss 0.0013  P(late) [0.0036, 0.9994, 0.9994, 0.0004]</div>
  <p>The loss falls from 0.698 to 0.0013 and the probabilities for orders A–D become 0.004, 0.999, 0.999 and 0.0004: XOR learned, the same result as the hand-written backward pass. Notice the two details inside the update: it runs under <code>no_grad()</code>, because the update itself must not become part of the graph, and each gradient is zeroed after use. A training loop is just this. The next sections replace the four loose tensors with a model class, the hand-written update with an optimiser, and the four orders with a data loader.</p>

  <h2 id="dp2-mod"><span class="num">04</span>nn.Module</h2>
  <p>Four loose tensors were manageable. A real network has dozens, and each one needs <code>requires_grad</code>, zeroing, updating, moving to a GPU and saving. Doing that by hand for every tensor is error-prone. <strong><code>nn.Module</code></strong> is PyTorch's base class for every layer and every model, and it does this bookkeeping for you. You write a class that inherits from it (see <a class="xref" data-note="py_oop">OOP</a> if inheritance is new): in <code>__init__</code> you create the layers and store them as attributes on <code>self</code>; in a method called <code>forward(x)</code> you describe how data flows through them. Any layer stored on <code>self</code> is then automatically found by <code>.parameters()</code>, moved by <code>.to(device)</code>, saved by <code>.state_dict()</code> and switched by <code>.train()</code> and <code>.eval()</code>. A learnable tensor registered this way is called a <strong>parameter</strong>. Think of a restaurant: <code>__init__</code> hires the cooks and buys the vessels, <code>forward</code> is the recipe card that says in which order food passes from cook to cook, and the manager (nn.Module) keeps an inventory of every vessel, so moving the whole kitchen or taking stock is one command.</p>
  <p>Here is the delivery network used for the rest of the page: 2 inputs → 32 → 32 → 1 output, ReLU activations and a little dropout. It is split into a <code>body</code>, which turns raw inputs into useful features, and a <code>head</code>, which turns those features into the answer; the transfer-learning section reuses that split. <code>nn.Linear(in, out)</code> computes x @ W.T + b and has in·out + out parameters, so by hand the count is 2·32 + 32 = 96, then 32·32 + 32 = 1,056, then 32·1 + 1 = 33, a total of 1,185. <code>nn.Sequential</code> simply runs the layers it holds in order.</p>
  <div class="fx" data-lang="py">import torch.nn as nn
class DeliveryNet(nn.Module):
    def __init__(self, d_in=2, hidden=32, n_out=1, p=0.1):
        super().__init__()                    # must come first
        self.body = nn.Sequential(nn.Linear(d_in, hidden), nn.ReLU(), nn.Dropout(p),
                                  nn.Linear(hidden, hidden), nn.ReLU())
        self.head = nn.Linear(hidden, n_out)
    def forward(self, x):                     # x: (N, 2)
        return self.head(self.body(x))       # (N, 1) logits; P(late) = sigmoid(logit)

torch.manual_seed(0)
model = DeliveryNet()
print(model)
print("params:", sum(p.numel() for p in model.parameters()))
for name, p in model.named_parameters():
    print(f"{name:14s} {tuple(p.shape)}")
print(model(X4).shape)                        # the four orders: (4, 2) -&gt; (4, 1)</div>
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
torch.Size([4, 1])</div>
  <p>Printing the model lists its layers under the attribute names we chose. The parameter count matches the hand count, and each weight's shape is (out, in), which is why the layer multiplies by W.T. ReLU and Dropout have no parameters. Calling <code>model(X4)</code> runs <code>forward</code>: the batch dimension of 4 passes through untouched while the feature dimension goes 2 → 32 → 32 → 1, and the final (4, 1) values are <strong>logits</strong>, raw scores that a sigmoid turns into P(late). Always call the model as <code>model(x)</code>, not <code>model.forward(x)</code>, because the call also runs PyTorch's internal hooks. One registration rule causes a classic bug: only modules assigned directly to <code>self</code>, or held in PyTorch's own containers, are registered. Layers inside a plain Python list are invisible:</p>
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
  <p>The broken model reports 0 parameters, so the optimiser would never update its layers, <code>.to("cuda")</code> would not move them and they would not be saved, all without any error. <code>nn.ModuleList</code> (and <code>nn.ModuleDict</code> for dictionaries) registers them, giving the expected 2·4 + 4 + 4·1 + 1 = 17. Stateless operations such as <code>torch.relu</code> or <code>F.relu</code> have no weights, so they can be used directly inside <code>forward</code>.</p>

  <h2 id="dp2-data"><span class="num">05</span>Dataset and DataLoader</h2>
  <p>The model takes any batch of shape (N, 2). Our real data is 1,000 orders that must be split into training and validation sets, shuffled every epoch and served 64 at a time, and real datasets are often too large to load into memory at once. Writing that index bookkeeping by hand in every project is fiddly, so PyTorch splits the job into two classes. A <strong>Dataset</strong> answers two questions: "how many examples are there?" (<code>__len__</code>) and "give me example number i" (<code>__getitem__</code>). A <strong>DataLoader</strong> wraps a Dataset: it chooses which indices to fetch (shuffled if asked), fetches those examples, and stacks them into batch tensors. Think of a warehouse: the Dataset is the shelf, where asking for item 417 gets you item 417, and the DataLoader is the team of loaders who pick random items, pack them into boxes of 64, and keep boxes coming to the truck so it never waits.</p>
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
  <p>In the figure, the sampler decides the order of indices for this epoch, the Dataset fetches one order per index, and the collate step stacks 64 of them into one tensor. Each order is an input of shape (2,) and a label of shape () (a single number), so a stacked batch is x of shape (64, 2) and y of shape (64,). With 800 training orders, 800 ÷ 64 = 12.5, so there are 13 batches per epoch and the last one holds 800 − 12 × 64 = 32. The <code>make_orders</code> generator below is the one used across the track; <code>random_split</code> divides a Dataset into non-overlapping parts.</p>
  <div class="fx" data-lang="py">import math, os
from torch.utils.data import Dataset, DataLoader, random_split

def make_orders(n=1000, noise=0.05, seed=0):          # the generator used across the track
    g = torch.Generator().manual_seed(seed)
    km = torch.rand(n, generator=g) * 10; rain = torch.rand(n, generator=g) * 20
    late = ((km &gt; 5) ^ (rain &gt; 10)) ^ (torch.rand(n, generator=g) &lt; noise)
    return torch.stack([km / 10, rain / 20], 1), late.float()

class OrdersDataset(Dataset):
    def __init__(self, n=1000):
        self.X, self.y = make_orders(n)       # X (1000, 2) float32, y (1000,) float32
    def __len__(self):
        return len(self.X)
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]       # one (input, label) pair: shapes (2,) and ()

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
  <p><code>ds[0]</code> calls <code>__getitem__(0)</code> and returns one pair: an order at 4.96 km with 9.2 mm/h of rain (scaled to 0.4963 and 0.4575), near and fairly dry, so on time (label 0). The first batch from the training loader has exactly the shapes we predicted, with labels in shuffled order, and the last line confirms 13 batches, the final one short. The validation loader uses one batch of 200 and no shuffling, because order does not matter for measuring. A few DataLoader arguments matter in real projects: <code>num_workers</code> loads upcoming batches in parallel background processes so the GPU is not kept waiting; <code>pin_memory=True</code> speeds up copies to a GPU; and <code>drop_last=True</code> discards a final incomplete batch, which matters for BatchNorm (see <a class="xref" data-note="dl_training">Training Well</a>). Heavy work, such as reading an image file from disk, belongs in <code>__getitem__</code> so the workers can do it in parallel, not in <code>__init__</code>, which would load everything into memory at once.</p>

  <h2 id="dp2-loop"><span class="num">06</span>The Training Loop</h2>
  <p>Keras has a <code>fit()</code> method that trains for you (see <a class="xref" data-note="dl_keras">TensorFlow &amp; Keras</a>). PyTorch deliberately does not: you write the training loop yourself. It takes more lines, but nothing is hidden, so when training misbehaves you can print or change any step, and interviewers often ask you to write it from memory. Two ready-made objects replace the manual parts of section 03. A <strong>loss function</strong> object, here <code>nn.BCEWithLogitsLoss</code>, takes logits of shape (N,) and float labels of shape (N,) and returns one number; it applies the sigmoid itself, in a numerically safe way. An <strong>optimiser</strong>, here Adam (explained in <a class="xref" data-note="dl_training">Training Well</a>), is given the model's parameters and owns the update rule; <code>opt.step()</code> updates every parameter from its <code>.grad</code>, and <code>opt.zero_grad()</code> clears all the gradients.</p>
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
  <p>Every batch goes through the same five calls in the same order, like practising sums on a slate: wipe the slate (<code>zero_grad</code>), attempt the sum (forward pass, <code>model(x)</code>), check against the answer key (<code>loss_fn</code>), work out where you went wrong (<code>backward</code>), and adjust your method (<code>step</code>). One step traced with shapes: x (64, 2) → <code>model(x)</code> → logits (64, 1) → <code>.squeeze(1)</code> → (64,) → loss against y (64,) → a single number → <code>loss.backward()</code> fills all six <code>.grad</code> tensors, each the shape of its parameter → <code>opt.step()</code> changes the weights. Before training, the same sanity check as always: an untrained yes/no model should be near ln 2 ≈ 0.693. The code then trains for 20 epochs, validating after each one and saving the best version, which section 08 will load.</p>
  <div class="fx" data-lang="py">device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
loss_fn = nn.BCEWithLogitsLoss()
with torch.no_grad():
    print("step-0 loss:", round(loss_fn(model(xb).squeeze(1), yb).item(), 4), " ln 2 =", round(math.log(2), 4))
opt = torch.optim.Adam(model.parameters(), lr=1e-2)

def train_epoch():
    model.train(); total = 0
    for x, y in train_dl:
        x, y = x.to(device), y.to(device)
        opt.zero_grad()                           # 1 clear old gradients
        loss = loss_fn(model(x).squeeze(1), y)    # 2 forward + 3 loss
        loss.backward()                           # 4 backprop
        opt.step()                                # 5 update
        total += loss.item() * len(x)             # .item(): a plain float, no graph
    return total / len(train_dl.dataset)

@torch.no_grad()
def evaluate():
    model.eval(); total, correct = 0, 0
    for x, y in val_dl:
        x, y = x.to(device), y.to(device)
        logits = model(x).squeeze(1)
        total += loss_fn(logits, y).item() * len(x)
        correct += ((logits &gt; 0).float() == y).sum().item()   # logit &gt; 0  &lt;=&gt;  P(late) &gt; 0.5
    return total / len(val_dl.dataset), correct / len(val_dl.dataset)

best = float("inf")
for epoch in range(1, 21):
    tr = train_epoch(); va, acc = evaluate()
    if va &lt; best:                                 # keep the best checkpoint
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
  <p>The step-0 loss of 0.67 is close to ln 2, so labels and loss are wired correctly. <code>train_epoch</code> runs the five calls on every batch; multiplying <code>loss.item()</code> by the batch size makes the short last batch count fairly in the epoch average. <code>evaluate</code> switches the model to evaluation mode and turns off graph recording (the decorator <code>@torch.no_grad()</code> applies it to the whole function), then counts correct predictions: a logit above 0 means P(late) above 0.5. Validation accuracy climbs to 0.935 by epoch 10 and then wobbles between 0.90 and 0.935; the ceiling is about 0.95 because 5% of the labels are wrong, and a learning-rate schedule would steady the end. The <code>device</code> line at the top and the <code>.to(device)</code> calls make the same loop run on a GPU when there is one; section 09 explains them.</p>

  <h2 id="dp2-eval"><span class="num">07</span>eval() and no_grad()</h2>
  <p><code>evaluate()</code> used two different switches, and confusing them is one of the most common PyTorch mistakes. Some layers behave differently while learning and while predicting: dropout switches off random neurons during training only, and BatchNorm uses the current batch's statistics in training but saved running averages when predicting (both explained in <a class="xref" data-note="dl_training">Training Well</a>). <code>model.eval()</code> tells every layer "we are predicting now", and <code>model.train()</code> switches back. Separately, predicting needs no gradients, so recording a computation graph wastes memory and time; <code>torch.no_grad()</code> tells autograd not to record. Neither switch does the other's job. Think of exam day: <code>eval()</code> means no more surprise practice drills, and <code>no_grad()</code> means not writing rough work in the margin because nobody will check it. On exam day you want both. The experiment asks the trained model about one far, dry order (8.5 km, 3 mm/h, so it should be late) three times in each mode:</p>
  <div class="fx" data-lang="py">x0 = torch.tensor([0.85, 0.15]).unsqueeze(0)      # 8.5 km, 3 mm/h: (2,) -&gt; (1, 2)
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
  <p>In training mode the three answers differ even under <code>no_grad()</code>, because dropout picks different neurons each time. In evaluation mode they are identical. The last two lines show the other switch: without <code>no_grad()</code> the output still requires gradients, meaning a graph is being kept in memory; with it, nothing is recorded. So <code>no_grad()</code> alone did not remove the randomness, and <code>eval()</code> alone did not save memory. Validation and prediction need both, and the next training epoch needs <code>model.train()</code> again, which is why <code>train_epoch</code> calls it at the start of every epoch. For serving a model in production, <code>torch.inference_mode()</code> is a stricter and slightly faster version of <code>no_grad()</code>.</p>
  <table class="tbl">
    <tr><th></th><th><code>model.eval()</code></th><th><code>torch.no_grad()</code></th></tr>
    <tr><td>What it changes</td><td>layer behaviour: dropout off, BatchNorm uses running statistics</td><td>autograd: no graph is recorded</td></tr>
    <tr><td>Saves memory?</td><td>no</td><td>yes</td></tr>
    <tr><td>Undo with</td><td><code>model.train()</code></td><td>leaving the <code>with</code> block</td></tr>
  </table>

  <h2 id="dp2-ckpt"><span class="num">08</span>Saving and Loading</h2>
  <p>Training can take hours, machines restart, and the model you deploy should be the best epoch, not simply the last one. So we need to save a trained model and restore it later in a different program. Every module provides a <strong><code>state_dict()</code></strong>: an ordinary dictionary from each parameter's name to its tensor (plus <strong>buffers</strong>, saved non-trainable values such as BatchNorm's running averages). You save that dictionary with <code>torch.save</code>. To load, you build the same class again, which gives fresh random weights, and pour the saved tensors in with <code>load_state_dict</code>. A saved snapshot taken during training is called a <strong>checkpoint</strong>. Think of a save point in a video game: the save file stores your progress and inventory (the weights and optimiser state), not the game program itself (the class), so to continue you start the game and then load the save. Our training loop saved a checkpoint whenever validation loss improved:</p>
  <div class="fx" data-lang="py">print(list(model.state_dict().keys()))
ck = torch.load("ckpt.pt", map_location=device)        # weights_only=True by default
fresh = DeliveryNet().to(device)                         # rebuild the architecture (random weights)
fresh.load_state_dict(ck["model"]); fresh.eval()         # pour in the saved weights
model.load_state_dict(ck["model"]); model.eval()
print("best epoch", ck["epoch"], "val loss", round(ck["val_loss"], 4),
      "file size KB", round(os.path.getsize("ckpt.pt") / 1024, 1))
with torch.no_grad():
    print(torch.equal(model(x0), fresh(x0)), "P(late) =", round(torch.sigmoid(fresh(x0)).item(), 3))</div>
  <div class="fx" data-lang="text">['body.0.weight', 'body.0.bias', 'body.3.weight', 'body.3.bias', 'head.weight', 'head.bias']
best epoch 20 val loss 0.3243 file size KB 20.5
True P(late) = 0.997</div>
  <p>The keys are the attribute paths from section 04: <code>body.0</code> is the first Linear layer inside <code>body</code>, and ReLU and Dropout have no keys because they have no weights. The best validation loss happened at epoch 20 (0.3243, a hair below epoch 10's 0.3246); in longer runs the best epoch is usually not the last, which is why the loop saves the best. <code>map_location=device</code> lets a checkpoint saved on a GPU be loaded on a CPU-only machine. The freshly built model, after loading, gives exactly the same output as the original (<code>torch.equal</code> is <code>True</code>), and the far, dry order is confidently late. Remember to call <code>.eval()</code> after loading a model for prediction.</p>
  <p>What you save depends on what you need. For prediction or sharing, the model's <code>state_dict</code> alone is enough. To resume training exactly where it stopped, save a full checkpoint as our loop did: model and optimiser state dicts, the epoch number, the best metric, and the learning-rate scheduler's state if you use one; without the optimiser state, Adam forgets its running averages and the loss jumps after resuming. Avoid <code>torch.save(model)</code>, which pickles the whole object including a reference to your class's file path, so it breaks when the code is renamed or moved. Since PyTorch 2.6, <code>torch.load</code> uses <code>weights_only=True</code> by default, refusing to unpickle arbitrary objects, which is safer when loading files from the internet.</p>

  <h2 id="dp2-dev"><span class="num">09</span>GPUs and Mixed Precision</h2>
  <p>Our 1,185-weight network trains in seconds on a CPU, but an image or language model with millions of weights would take weeks. A GPU runs thousands of multiplications in parallel and makes big models train 10 to 100 times faster. The catch is that a GPU has its own memory, separate from the computer's main memory. Every tensor lives on one <strong>device</strong>, and all tensors in one calculation must be on the same device, or PyTorch raises "Expected all tensors to be on the same device". It is like a cook and ingredients: they must be in the same kitchen, so the vessels (the model) are moved there once, and each day's vegetables (each batch) are brought in as they arrive.</p>
  <p>The pattern that results is short. Choose the device once with <code>device = torch.device("cuda" if torch.cuda.is_available() else "cpu")</code>; move the model there once with <code>model.to(device)</code>; move every batch there as it arrives with <code>x.to(device)</code>; and bring results back with <code>.cpu()</code> before turning them into NumPy arrays or plotting. Never hard-code <code>.cuda()</code>, because the code then crashes on machines without a GPU, such as this one: the same code below asks for a GPU, finds none, and runs on the CPU unchanged. Tensors created inside <code>forward</code> also need care: <code>torch.zeros(n)</code> lands on the CPU, so write <code>torch.zeros(n, device=x.device)</code>.</p>
  <p>The second speed tool is <strong>mixed precision</strong>: doing most of the arithmetic in 16-bit numbers instead of 32-bit, while keeping the master copy of the weights in 32-bit. This roughly halves the memory used by activations and is much faster on modern GPUs, whose special matrix units (Tensor Cores) are built for 16-bit maths. In PyTorch it is one context manager, <code>torch.autocast</code>, which picks the precision for each operation automatically:</p>
  <div class="fx" data-lang="py">print("CUDA available:", torch.cuda.is_available(), "| device:", device)
print("model lives on:", next(model.parameters()).device)
xb_dev = xb.to(device)                                   # (64, 2) batch to the model's device
with torch.autocast(device_type=device.type, dtype=torch.bfloat16):
    out = model(xb_dev)
print(out.dtype, model.head.weight.dtype)                # activations bf16, weights stay fp32
try:
    out.detach().cpu().numpy()
except TypeError as e:
    print("TypeError:", e)
print(out.detach().float().cpu().numpy().shape)</div>
  <div class="fx" data-lang="text">CUDA available: False | device: cpu
model lives on: cpu
torch.bfloat16 torch.float32
TypeError: Got unsupported ScalarType BFloat16
(64, 1)</div>
  <p>The device is the CPU here, and the model lives there. Inside <code>autocast</code> the output came out in <strong>bfloat16</strong>, a 16-bit format with the same range as float32 but fewer digits, while the weights stayed float32. NumPy has no bfloat16, so converting needs <code>.float()</code> first; <code>.detach()</code> is also needed because NumPy cannot hold a computation graph. There are two 16-bit formats. float16 has a small range, so tiny gradients can round to zero; a <strong>GradScaler</strong> fixes this by multiplying the loss by a large number before <code>backward()</code> and dividing the gradients back before the step. bfloat16 has float32's range and needs no scaler. The full mixed-precision training step, written to work on either device (float16 with a scaler on a GPU, bfloat16 without one on a CPU), ran here for one epoch:</p>
  <div class="fx" data-lang="py">use_cuda = device.type == "cuda"
amp_dtype = torch.float16 if use_cuda else torch.bfloat16
scaler = torch.amp.GradScaler(device.type, enabled=use_cuda)     # only needed for float16
model.train()
for x, y in train_dl:
    x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
    opt.zero_grad()
    with torch.autocast(device_type=device.type, dtype=amp_dtype):
        loss = loss_fn(model(x).squeeze(1).float(), y)
    scaler.scale(loss).backward()             # scale up so fp16 gradients don't round to 0
    scaler.unscale_(opt)                      # back to the true scale before clipping
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    scaler.step(opt); scaler.update()
print("one mixed-precision epoch done on", device, "| last batch loss", round(loss.item(), 4))</div>
  <div class="fx" data-lang="text">one mixed-precision epoch done on cpu | last batch loss 0.1621</div>
  <p>The extra lines compared with the plain loop are the <code>autocast</code> block around the forward pass and loss, and the scaler wrapping <code>backward</code> and <code>step</code>; <code>unscale_</code> restores the true gradient size before gradient clipping. If a GPU runs out of memory, the usual remedies in order are: halve the batch size, use mixed precision, make sure validation runs under <code>no_grad()</code> and logging uses <code>loss.item()</code>, then gradient checkpointing (recompute activations during backward instead of storing them) or gradient accumulation (several small batches per optimiser step).</p>

  <h2 id="dp2-tl"><span class="num">10</span>Transfer Learning</h2>
  <p>Every model so far started from random weights and needed all 800 training orders. Training a large image model from scratch needs millions of labelled photos and days of GPU time, which a small company with 2,000 photos of damaged parcels does not have. But a model already trained on a huge dataset such as ImageNet has learned general features, like edges, textures and shapes, that are useful for parcels too. <strong>Transfer learning</strong> means reusing such a trained model for a new task: keep its body, which turns raw input into useful features, replace its head, which was specific to the old task, with a new one for your classes, and train mostly the new head. Training only the head on top of a <strong>frozen</strong> body (one whose weights are not updated) is called <strong>feature extraction</strong>; later also adjusting some of the body's weights with a small learning rate is called <strong>fine-tuning</strong>. Think of a cook trained in one cuisine joining a restaurant of another: knife skills and heat control carry over unchanged, only the recipes are new, and after a few weeks the cook carefully adapts some habits too.</p>
  <p>Our version of this: the shop now wants three answers instead of two, 0 = on time, 1 = late, 2 = very late (late in heavy rain above 15 mm/h), and has only 200 labelled orders for the new task. We reuse the trained delivery body and give it a new 3-class head. By hand: the body has 96 + 1,056 = 1,152 parameters, the new head 32·3 + 3 = 99, a total of 1,251; with the body frozen only 99 are trainable, and unfreezing the top body layer (1,056) makes it 1,155. Three classes means <code>nn.CrossEntropyLoss</code>, which expects class indices as int64. In PyTorch, freezing is just setting <code>requires_grad = False</code> on a parameter, so autograd skips it, and <strong>parameter groups</strong> let one optimiser use different learning rates for different parts of the model.</p>
  <div class="fx" data-lang="py">torch.save(model.state_dict(), "delivery_body.pt")
new = DeliveryNet(n_out=3)                                    # same body, new 3-class head
body_only = {k: v for k, v in torch.load("delivery_body.pt").items() if k.startswith("body")}
print(new.load_state_dict(body_only, strict=False))
for p in new.body.parameters():
    p.requires_grad = False                                   # phase 1: freeze the body
print("trainable:", sum(p.numel() for p in new.parameters() if p.requires_grad),
      "/", sum(p.numel() for p in new.parameters()))

X_all, y_late = ds.X, ds.y
severity = y_late.long() + ((y_late == 1) &amp; (X_all[:, 1] &gt; 0.75)).long()   # 0 on time, 1 late, 2 very late
print("class counts:", torch.bincount(severity).tolist())
Xs_tr, s_tr, Xs_va, s_va = X_all[:200], severity[:200], X_all[800:], severity[800:]   # only 200 labelled
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
print("trainable now:", sum(p.numel() for p in new.parameters() if p.requires_grad))
print(f"val accuracy: frozen body + new head {acc1:.3f} | + fine-tune top layer {acc2:.3f} | from scratch {acc0:.3f}")</div>
  <div class="fx" data-lang="text">_IncompatibleKeys(missing_keys=['head.weight', 'head.bias'], unexpected_keys=[])
trainable: 99 / 1251
class counts: [511, 373, 116]
trainable now: 1155
val accuracy: frozen body + new head 0.900 | + fine-tune top layer 0.925 | from scratch 0.905</div>
  <p>We filtered the saved dictionary to the keys starting with <code>body</code> and loaded it with <code>strict=False</code>, which reports what did not match instead of crashing: only the new head's weights are missing, as intended, because they start random. The trainable count confirms the frozen body. In phase 2 the top body layer is unfrozen with a learning rate 100 times smaller than the head's, so the pretrained knowledge is adjusted gently rather than overwritten; overwriting it with a high learning rate is called <strong>catastrophic forgetting</strong>. The accuracy line compares three routes on only 200 labelled orders: frozen body with a new head 0.900, fine-tuning the top layer 0.925, and training all 1,251 weights from scratch 0.905. On this tiny problem the gain is small, because 200 orders are almost enough to relearn "far XOR rain"; with images and millions of weights the gap is enormous.</p>
  <p>The same recipe applies unchanged to a real pretrained image model from the <code>torchvision</code> library: load it with <code>models.resnet18(weights=models.ResNet18_Weights.DEFAULT)</code>, set <code>requires_grad = False</code> on all its parameters, and replace its final layer with <code>resnet.fc = nn.Linear(resnet.fc.in_features, 3)</code>, which is trainable because it is new. (It is not run here because the pretrained weights are a download.) Two cautions: feed inputs normalised the way the pretrained model expects (for ImageNet models, its specific channel means and standard deviations), and remember that frozen BatchNorm layers still update their running statistics in training mode, so put them in <code>eval()</code> if the body should stay exactly fixed. CNN bodies are covered in <a class="xref" data-note="dl_cnns">CNNs</a>.</p>

  <h2 id="dp2-debug"><span class="num">11</span>Debugging a Training Run</h2>
  <p>A training loop that is slightly wrong usually does not crash; it just trains badly, and the numbers are your only clue. The fastest way to recognise a bug is to have caused it on purpose once and seen what it looks like. The code repeats the same delivery run (fresh model, same seed, 20 epochs) four times, changing exactly one thing each time:</p>
  <div class="fx" data-lang="py">def run(lr=1e-2, zero_grad=True, epochs=20):
    torch.manual_seed(0); m = DeliveryNet(); o = torch.optim.Adam(m.parameters(), lr=lr); out = {}
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
  <p>Without <code>opt.zero_grad()</code>, each step uses the sum of every gradient so far, so steps grow huge and point in out-of-date directions. Accuracy still reaches 0.77 at epoch 5, which is why this bug hides well, and then collapses to 0.465 by epoch 20, the score of giving the same answer for every order. With lr 1.0, every step overshoots: the first epoch's training loss is 26, almost 40 times ln 2, and the network ends dead at 0.465. With lr 0.0001 nothing is broken, it is just extremely slow: the loss is still at ln 2 after one epoch and accuracy has not moved by epoch 20. How to read these patterns from loss curves is covered in <a class="xref" data-note="dl_training">Training Well</a>.</p>
  <p>One check is worth running before every long training job: <strong>overfit a single batch</strong>. Take 64 orders, turn dropout off, and train on only them for a few hundred steps. A correct model, loss and loop must be able to memorise 64 examples, driving the loss close to zero. If it cannot, something in the plumbing is broken (labels misaligned, a missing <code>step()</code>, a detached graph, a wrong loss), and more data or more epochs will not help.</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
xo, yo = ds.X[:64], ds.y[:64]                        # one batch: (64, 2), (64,)
m = DeliveryNet(p=0.0, hidden=64); o = torch.optim.Adam(m.parameters(), lr=1e-2)
for step in range(1, 1001):
    o.zero_grad(); loss = loss_fn(m(xo).squeeze(1), yo); loss.backward(); o.step()
    if step in (1, 100, 500, 1000): print(f"overfit step {step}: loss {loss.item():.4f}")</div>
  <div class="fx" data-lang="text">overfit step 1: loss 0.6933
overfit step 100: loss 0.0133
overfit step 500: loss 0.0003
overfit step 1000: loss 0.0001</div>
  <p>The loss falls from ln 2 to 0.0001; the pipeline can learn, and even the few mislabelled orders in this batch get memorised. If you shuffle the labels before running this check, the batch can still be memorised, but validation accuracy would fall to chance, which is a useful reminder that memorising is not learning. And when comparing runs, change one thing at a time with a fixed seed, or you cannot tell which change caused the difference.</p>

  <h2 id="dp2-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>Several mistakes have already appeared where they belong: float64 data into a float32 model (section 01), (N, 1) predictions against (N,) labels (section 02), forgetting to zero gradients (sections 03 and 11), layers in a plain list (section 04), and confusing <code>eval()</code> with <code>no_grad()</code> (section 07). Three more catch nearly everyone.</p>
  <p>The first is applying a sigmoid in the model and then using <code>BCEWithLogitsLoss</code>, which applies a sigmoid itself. The model still trains, just badly, because the loss now sees numbers squashed twice. Here a perfect model's logits for orders A–D are fed to the loss, once correctly and once after a sigmoid:</p>
  <div class="fx" data-lang="py">perfect = torch.tensor([-20., 20., 20., -20.])       # a perfect model's logits for orders A-D
print("correct:         ", round(loss_fn(perfect, y4).item(), 4))
print("sigmoid applied: ", round(loss_fn(torch.sigmoid(perfect), y4).item(), 4))</div>
  <div class="fx" data-lang="text">correct:          0.0
sigmoid applied:  0.5032</div>
  <p>With raw logits the perfect model scores a loss of 0. After an extra sigmoid, the loss receives values between 0 and 1 and treats them as logits, so even perfect answers cost 0.503 and the gradients are tiny. Return raw logits from <code>forward</code> and let the loss apply the sigmoid; the same applies to softmax with <code>CrossEntropyLoss</code>. Apply <code>torch.sigmoid</code> or <code>softmax</code> only when you want probabilities for display.</p>
  <p>The second is accumulating the loss tensor itself for logging, <code>total += loss</code>, instead of the number <code>loss.item()</code>:</p>
  <div class="fx" data-lang="py">total = 0
for x, y in list(train_dl)[:3]:
    total += loss_fn(model(x).squeeze(1), y)          # a tensor, not a number
print(type(total).__name__, total.requires_grad, total.grad_fn.name())</div>
  <div class="fx" data-lang="text">Tensor True AddBackward0</div>
  <p><code>total</code> is still a tensor attached to a graph (its <code>grad_fn</code> is an addition), and through it every batch's computation graph stays alive. Over an epoch, memory grows with every step until the GPU runs out. Use <code>loss.item()</code>, or <code>.detach()</code> when you need to keep a tensor.</p>
  <p>The third is the wrong label type for the loss. <code>BCEWithLogitsLoss</code>, for one yes/no answer, wants float labels with the same shape as the logits. <code>CrossEntropyLoss</code>, for one of C classes, wants logits of shape (N, C) and labels that are class indices of shape (N,) with dtype int64 (not one-hot vectors):</p>
  <div class="fx" data-lang="py">try:
    ce(new(Xs_tr[:4]), s_tr[:4].float())                # class labels as floats
except RuntimeError as e:
    print("RuntimeError:", e)
print(round(ce(new(Xs_tr[:4]), s_tr[:4]).item(), 4))   # int64 class indices</div>
  <div class="fx" data-lang="text">RuntimeError: expected target dtype to be Long or Byte, but got Float
0.1834</div>
  <p>The float labels were rejected; the int64 class indices work. Convert labels to the right dtype once, when building the Dataset, rather than in the loop. Finally, two mistakes that cannot be shown on a CPU-only machine but are just as common: a model on the GPU with a batch, or a tensor created inside <code>forward</code>, still on the CPU, which raises "Expected all tensors to be on the same device"; and saving with <code>torch.save(model)</code>, which breaks as soon as the code is refactored.</p>

  <h2 id="dp2-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Tensor</b>: n-dimensional array with a <b>shape</b>, a <b>dtype</b> (float32, int64…) and a <b>device</b> (cpu, cuda).</li>
    <li><b>Broadcasting</b>: align shapes from the right; sizes must match or be 1; size-1 dimensions stretch.</li>
    <li><b>Contiguous</b>: memory order matches the shape's reading order; <code>view</code> needs it, <code>reshape</code> copies if needed.</li>
    <li><b>Autograd</b>: records operations on <code>requires_grad=True</code> tensors; <code>backward()</code> fills <code>.grad</code> of the leaves. The graph is dynamic (rebuilt every forward).</li>
    <li><b>nn.Module</b>: base class for layers and models; layers on <code>self</code> are registered. <b>Parameter</b>: a registered learnable tensor. <b>Logits</b>: raw scores before sigmoid/softmax.</li>
    <li><b>Dataset</b>: <code>__len__</code> + <code>__getitem__</code>. <b>DataLoader</b>: shuffles, batches, stacks, loads in parallel.</li>
    <li><b>state_dict</b>: name → tensor dictionary of parameters and buffers. <b>Checkpoint</b>: saved model + optimiser + epoch.</li>
    <li><b>Mixed precision</b>: compute in 16-bit, keep weights in 32-bit; float16 needs a GradScaler, bfloat16 does not.</li>
    <li><b>Feature extraction</b>: frozen body + new head. <b>Fine-tuning</b>: also update body weights with a small learning rate.</li>
  </ul>
  <h3>eval() vs no_grad(), and losses</h3>
  <table class="tbl">
    <tr><th></th><th>What it does</th><th>When</th></tr>
    <tr><td><code>model.eval()</code> / <code>model.train()</code></td><td>dropout off/on; BatchNorm running/batch statistics</td><td>before validation / before training</td></tr>
    <tr><td><code>torch.no_grad()</code></td><td>stops graph recording, saves memory</td><td>validation, prediction, manual updates</td></tr>
    <tr><td><code>BCEWithLogitsLoss</code></td><td>yes/no; logits (N,), float labels (N,)</td><td>no sigmoid in the model</td></tr>
    <tr><td><code>CrossEntropyLoss</code></td><td>one of C classes; logits (N, C), int64 labels (N,)</td><td>no softmax in the model</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.body = nn.Sequential(nn.Linear(2, 32), nn.ReLU(), nn.Linear(32, 32), nn.ReLU())
        self.head = nn.Linear(32, 1)
    def forward(self, x):                          # (N, 2) -> (N, 1) logits
        return self.head(self.body(x))

model = Net().to(device)
loss_fn = nn.BCEWithLogitsLoss()
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
train_dl = DataLoader(train_ds, batch_size=64, shuffle=True)

for epoch in range(epochs):
    model.train()
    for x, y in train_dl:
        x, y = x.to(device), y.to(device)
        opt.zero_grad()
        loss = loss_fn(model(x).squeeze(1), y)
        loss.backward()
        opt.step()
    model.eval()
    with torch.no_grad():
        ...                                        # validate; log loss.item()

torch.save(model.state_dict(), "model.pt")
m = Net(); m.load_state_dict(torch.load("model.pt", map_location=device)); m.eval()
for p in m.body.parameters(): p.requires_grad = False          # freeze
opt = torch.optim.Adam([{"params": m.body.parameters(), "lr": 1e-4},
                        {"params": m.head.parameters(), "lr": 1e-2}])</div>
  <h3>Shapes to remember</h3>
  <ul>
    <li><code>nn.Linear(in, out)</code>: weight (out, in), in·out + out parameters; (N, in) → (N, out).</li>
    <li>Images (N, C, H, W); <code>reshape(N, -1)</code> flattens; <code>unsqueeze(0)</code> makes a batch of one.</li>
    <li>Batches per epoch = ceil(N / batch size); 800 / 64 → 13, last 32.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>NumPy float64 into a float32 model → "same dtype" error.</li>
    <li>(N, 1) vs (N,) broadcasts to (N, N): squeeze before the loss.</li>
    <li>Gradients accumulate: <code>zero_grad()</code> every step.</li>
    <li>Layers in a plain list are not registered: <code>nn.ModuleList</code>.</li>
    <li>No sigmoid/softmax before <code>BCEWithLogitsLoss</code>/<code>CrossEntropyLoss</code>.</li>
    <li>Validation needs <code>eval()</code> and <code>no_grad()</code>; then <code>train()</code> again.</li>
    <li><code>total += loss</code> leaks memory: use <code>loss.item()</code>.</li>
    <li>Never hard-code <code>.cuda()</code>; new tensors in <code>forward</code> use <code>device=x.device</code>.</li>
    <li>Save <code>state_dict()</code>, not the whole model; <code>eval()</code> after loading.</li>
  </ul>

  <h2 id="dp2-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a tensor, and how does it differ from a NumPy array?</summary><div class="qa-body">A tensor is PyTorch's n-dimensional array, described by its shape, dtype and device. Unlike a NumPy array it can live on a GPU, and with <code>requires_grad=True</code> it records the operations applied to it so gradients can be computed automatically. The two convert easily: <code>torch.from_numpy</code> (shares memory) and <code>tensor.numpy()</code> (CPU tensors only).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the five lines inside a training step, in order.</summary><div class="qa-body"><code>opt.zero_grad()</code>, <code>out = model(x)</code>, <code>loss = loss_fn(out, y)</code>, <code>loss.backward()</code>, <code>opt.step()</code>. Gradient clipping goes between <code>backward()</code> and <code>step()</code>, and a learning-rate scheduler steps after <code>opt.step()</code> (per epoch or per batch, depending on how it was defined).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we call <code>optimizer.zero_grad()</code>? When would you skip it on purpose?</summary><div class="qa-body"><code>backward()</code> adds into <code>.grad</code> instead of overwriting it, so without zeroing each step would use the sum of all past gradients. You skip it on purpose for gradient accumulation: run backward on k small batches (dividing each loss by k), then step once, to simulate a larger batch that does not fit in memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>x = torch.tensor(3., requires_grad=True); (x**2).backward(); (x**2).backward(); print(x.grad)</code></summary><div class="qa-body"><code>tensor(12.)</code>. The derivative of x² is 2x = 6, and the second <code>backward()</code> adds another 6 because gradients accumulate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does autograd work?</summary><div class="qa-body">During the forward pass PyTorch records each operation on tensors that require gradients, building a graph where each result stores a <code>grad_fn</code> that knows its local derivative. <code>backward()</code> traverses this graph in reverse from the scalar loss, applying the chain rule (reverse-mode automatic differentiation), and accumulates the gradients into the <code>.grad</code> of the leaf tensors. The graph is rebuilt on every forward pass (dynamic, "define-by-run") and freed after backward.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>model.eval()</code> and <code>torch.no_grad()</code>?</summary><div class="qa-body"><code>eval()</code> changes the behaviour of layers: dropout is turned off and BatchNorm uses its running statistics. <code>no_grad()</code> stops autograd from recording a graph, saving memory and time. They are independent: in our test the model under <code>no_grad()</code> but in training mode still gave three different answers. Validation and inference need both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>detach()</code> do, and when would you use it?</summary><div class="qa-body">It returns a tensor that shares the same data but is cut out of the computation graph, so no gradient flows back through it. Use it when logging or storing outputs (to avoid keeping graphs alive), when converting to NumPy, or when you deliberately want to stop gradients, for example treating a target network's output as a constant.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you write a custom model in PyTorch, and what does <code>super().__init__()</code> do?</summary><div class="qa-body">Subclass <code>nn.Module</code>, create layers as attributes in <code>__init__</code>, and define the computation in <code>forward(x)</code>; call the model as <code>model(x)</code>. <code>super().__init__()</code> runs nn.Module's own setup, which creates the internal registries for parameters, buffers and sub-modules; without it, assigning a layer to <code>self</code> raises an error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters does <code>nn.Linear(32, 10)</code> have, and what is the weight's shape?</summary><div class="qa-body">32·10 + 10 = 330. The weight has shape (10, 32), that is (out, in), and the layer computes x @ W.T + b, mapping (N, 32) to (N, 10).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the role of Dataset and DataLoader?</summary><div class="qa-body">A Dataset defines how many examples there are and how to fetch example i (<code>__len__</code>, <code>__getitem__</code>), often loading from disk lazily. A DataLoader wraps it to produce batches: it shuffles indices, fetches examples (optionally in parallel worker processes), and stacks them into batch tensors with a collate function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your batch tensor has shape (16, 3, 64, 64). What does each number mean, and what is the shape after <code>reshape(16, -1)</code>?</summary><div class="qa-body">16 images, 3 colour channels, 64 × 64 pixels: PyTorch's (N, C, H, W) layout. Flattened, it is (16, 12288), since 3 × 64 × 64 = 12,288.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model outputs shape (N, 1) and labels are (N,). What can go wrong?</summary><div class="qa-body">Broadcasting turns any elementwise operation between them into an (N, N) grid, comparing every prediction with every label. Some losses raise an error, but others (such as MSE, with only a warning) silently return a wrong number. Squeeze the output to (N,) or unsqueeze the labels so the shapes are identical.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why save the <code>state_dict</code> rather than the whole model? What goes into a checkpoint for resuming?</summary><div class="qa-body"><code>torch.save(model)</code> pickles the object with a reference to its class's module path, so it breaks when code is moved or renamed, and unpickling untrusted files is unsafe. A state_dict is just names and tensors and is portable. For resuming training, save the model and optimiser state dicts, the scheduler state, the epoch, the best metric and, with fp16 AMP, the GradScaler state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you write device-agnostic code, and what causes "Expected all tensors to be on the same device"?</summary><div class="qa-body">Choose <code>device = torch.device("cuda" if torch.cuda.is_available() else "cpu")</code> once, call <code>model.to(device)</code> once and <code>x.to(device)</code> for every batch. The error means one tensor in an operation is on a different device: usually a batch not moved, or a tensor created inside <code>forward</code> without <code>device=x.device</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is mixed-precision training, and why does float16 need a GradScaler?</summary><div class="qa-body">Most operations run in 16-bit floats while master weights stay in 32-bit, saving memory and using fast Tensor Core hardware. float16 has a small range, so small gradients can underflow to zero; the GradScaler multiplies the loss by a large factor before backward and divides the gradients back before the step, skipping steps that overflow. bfloat16 has float32's range, so it needs no scaler.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>GPU memory grows every iteration until it runs out. What are the likely causes?</summary><div class="qa-body">Accumulating <code>loss</code> instead of <code>loss.item()</code>, or storing outputs that still carry their graphs, keeps every iteration's graph alive. Validation without <code>no_grad()</code> also stores activations. After fixing those, reduce memory with a smaller batch, mixed precision, gradient checkpointing or gradient accumulation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you freeze a pretrained backbone and train only a new head? How do you then fine-tune?</summary><div class="qa-body">Set <code>requires_grad = False</code> on the backbone's parameters, replace the final layer with a new one (new layers are trainable by default), and give the optimiser only the trainable parameters. To fine-tune, unfreeze the top blocks and use parameter groups with a small learning rate for them (around 1e-5 to 1e-4) and a larger one for the head, to avoid catastrophic forgetting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model cannot overfit a single batch. What does that tell you?</summary><div class="qa-body">The pipeline is broken, not the data size: a healthy model, loss and loop can always memorise one small batch. Look for labels misaligned with inputs, a missing <code>optimizer.step()</code> or <code>zero_grad()</code>, a graph broken by <code>detach()</code> or <code>.item()</code>, frozen parameters, a sigmoid applied twice, or a learning rate far off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you skip <code>model.eval()</code> but keep <code>no_grad()</code> during validation for a model with BatchNorm and dropout?</summary><div class="qa-body">Dropout stays on, so predictions are random and worse; BatchNorm normalises with the validation batch's own statistics and also updates its running averages with validation data. Metrics become noisy and depend on batch composition, and the model you save afterwards has been subtly changed by validation data.</div></details>
</main>
`
});
