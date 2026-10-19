// notes/dl/dl_pytorch.js — PyTorch
Object.assign(TOPIC_CONTENT, {
  "dl_pytorch": `<main>
  <h1>PyTorch</h1>
  <p class="lead">PyTorch is the Python library most deep-learning research, LLM and Hugging Face code is written in. This page builds one small classifier end to end: tensors → shapes → autograd → Dataset → nn.Module → training loop → GPU → eval → checkpoint → transfer learning. Every tensor's shape is traced at every step, and every output is from a real run (PyTorch 2.14, CPU). The maths behind each step is in <a class="xref" data-note="dl_foundations">NN Foundations</a>.</p>

  <h2 id="dp2-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">PyTorch</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Tensors</div>
        <ul>
          <li><b>Tensor</b> — n-d array of numbers + <b>shape</b>, <b>dtype</b>, <b>device</b></li>
          <li>💡 A NumPy array that can sit on a GPU and remember how it was made</li>
          <li><b>Defaults</b> — Python floats → float32, ints → int64, NumPy floats → float64</li>
          <li><b>.item()</b> — one-element tensor → plain Python number</li>
          <li>⚠ float64 data into a float32 model → "must have the same dtype"</li>
          <li>⚠ CrossEntropyLoss labels must be int64 (<code>torch.long</code>)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shapes</div>
        <ul>
          <li><b>Image batch</b> — (N, C, H, W), e.g. (32, 3, 28, 28)</li>
          <li><b>reshape(32, -1)</b> → (32, 2352); −1 = "work it out"</li>
          <li><b>permute(0,2,3,1)</b> → (32, 28, 28, 3) (channels last)</li>
          <li><b>unsqueeze(0)</b> adds a size-1 dim; <b>squeeze</b> removes it</li>
          <li><b>Broadcasting</b> — (2,3) + (3,) → (2,3); size-1 dims stretch</li>
          <li><b>Matmul</b> — (a,b) @ (b,c) → (a,c); inner sizes must match</li>
          <li>⚠ <code>view</code> needs contiguous memory (fails after <code>.T</code>); <code>reshape</code> always works</li>
          <li>⚠ <code>torch.from_numpy</code> shares memory; <code>torch.tensor</code> copies</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Autograd</div>
        <ul>
          <li><b>requires_grad=True</b> — record every operation (<code>grad_fn</code>)</li>
          <li><b>backward()</b> — chain rule backwards, fills <code>.grad</code> of leaves</li>
          <li><b>Dynamic graph</b> — rebuilt every forward; Python if/for just work</li>
          <li>⚠ <b>Grads add up</b> — 8 then 16; zero them every step</li>
          <li><b>detach()</b> cuts one tensor out; <b>no_grad()</b> records nothing</li>
          <li>Manual GD on y = 2x + 1: w 0 → 2.005, b 0 → 0.986</li>
          <li>💡 A bill that lists every item, so the total can be traced back</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data</div>
        <ul>
          <li><b>Dataset</b> — <code>__len__</code> + <code>__getitem__(i)</code> → one (x, y)</li>
          <li><b>DataLoader</b> — shuffle, batch, stack: x (64, 2), y (64,)</li>
          <li>800 rows / 64 → 13 batches, the last has 32</li>
          <li><b>random_split</b> — train/val split of a Dataset</li>
          <li>⚠ <code>num_workers&gt;0</code> in notebooks/Windows → needs <code>if __name__ == "__main__"</code></li>
          <li>💡 Dataset = godown shelf; DataLoader = loaders packing boxes of 64</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">nn.Module</div>
        <ul>
          <li><b>__init__</b> — <code>super().__init__()</code> first, then layers as attributes</li>
          <li><b>forward(x)</b> — the maths; call <code>model(x)</code>, not <code>model.forward(x)</code></li>
          <li><b>Free</b> — <code>.parameters()</code>, <code>.to(device)</code>, <code>.train()/.eval()</code>, <code>state_dict()</code></li>
          <li><b>Linear(in, out)</b> weight shape is (out, in); params = in·out + out</li>
          <li>(64,2) → (64,32) → (64,32) → (64,2) logits; 1,218 params</li>
          <li>⚠ Layers in a plain list are invisible (0 params) → <code>nn.ModuleList</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Training loop</div>
        <ul>
          <li><b>Order</b> — zero_grad → forward → loss → backward → (clip) → step</li>
          <li><b>Step-0 check</b> — loss ≈ ln(classes) (0.73 vs ln 2 = 0.69)</li>
          <li><b>Log</b> <code>loss.item()</code>, never <code>loss</code> (keeps graphs alive)</li>
          <li><b>Overfit one batch</b> first: 0.72 → 0.0002 in 500 steps</li>
          <li>No zero_grad → acc 0.985 → 0.890; lr 1.0 → epoch-1 loss 40</li>
          <li>💡 Slate: wipe, attempt, check, find mistake, correct</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Device &amp; eval</div>
        <ul>
          <li><b>device</b> = <code>"cuda" if torch.cuda.is_available() else "cpu"</code></li>
          <li>Move the model once; move every batch every time</li>
          <li>⚠ "Expected all tensors to be on the same device"</li>
          <li><b>AMP</b> — <code>torch.autocast</code> fp16/bf16 + <code>GradScaler</code> (fp16 only)</li>
          <li><b>model.eval()</b> — dropout off, BatchNorm uses running stats</li>
          <li><b>torch.no_grad()</b> — no graph, less memory</li>
          <li>⚠ Separate switches; validation needs both</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Checkpoints &amp; transfer</div>
        <ul>
          <li><b>state_dict</b> — dict of name → tensor; save that, not the pickled model</li>
          <li><b>Resume</b> — model + optimizer + epoch (+ scheduler, scaler)</li>
          <li><b>Load</b> — build model → <code>load_state_dict(torch.load(p, map_location=device))</code> → <code>eval()</code></li>
          <li><b>Transfer</b> — reuse a trained body, new head; freeze with <code>requires_grad=False</code></li>
          <li><b>Fine-tune</b> — unfreeze top layers, lr 1e-5–1e-4 vs head 1e-3–1e-2</li>
          <li>⚠ High lr on pretrained layers → catastrophic forgetting</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dp2-ten"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Tensors</span><span class="rm-sub">Shape, dtype, device</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-shape"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Shapes &amp; Broadcasting</span><span class="rm-sub">reshape, permute, matmul</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-ag"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Autograd</span><span class="rm-sub">Gradients for free</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-data"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Dataset &amp; DataLoader</span><span class="rm-sub">Feeding batches</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-mod"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">nn.Module</span><span class="rm-sub">Custom models, shape by shape</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-loop"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Training Loop</span><span class="rm-sub">A complete real run</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-dev"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">GPU &amp; Devices</span><span class="rm-sub">.to(device), mixed precision</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-eval"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">eval() &amp; no_grad()</span><span class="rm-sub">Two different switches</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-ckpt"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Checkpointing</span><span class="rm-sub">state_dict save / load</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-tl"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Transfer Learning</span><span class="rm-sub">Freeze, replace head, unfreeze</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-lab"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Hands-on: Break the Loop</span><span class="rm-sub">What each mistake does</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">dtype, device, grads, modes</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dp2-ten"><span class="num">01</span>Tensors</h2>
  <p>You already know NumPy arrays. They are great for data, but they have two gaps for deep learning. First, they only run on the CPU, and training a network means billions of multiplications, which a GPU (graphics card) does 10–100× faster. Second, NumPy cannot tell you how a result depends on its inputs, and training needs exactly that (the gradient). PyTorch fills both gaps with one object: the <strong>tensor</strong>.</p>
  <p>In plain words: a tensor is a grid of numbers. A single number, a list, a table and a stack of tables are all tensors; they only differ in how many directions ("dimensions") the grid has. Inputs, weights, outputs and gradients in PyTorch are all tensors.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A steel <em>dabba</em> (tiffin box). One dabba has a few compartments (a vector). A row of dabbas on a delivery tray is a table (a matrix). A stack of trays on the dabbawala's cart is a 3-D tensor. The label on the cart says three things: how many trays and dabbas (<strong>shape</strong>), what kind of food (<strong>dtype</strong>), and which station it is at (<strong>device</strong>).</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <rect x="20" y="60" width="26" height="26" class="fb sb"/><text x="14" y="115">scalar</text><text x="18" y="132" class="tm">()</text>
    <g class="fb sb"><rect x="90" y="30" width="26" height="26"/><rect x="90" y="56" width="26" height="26"/><rect x="90" y="82" width="26" height="26"/></g><text x="80" y="128">vector</text><text x="88" y="144" class="tm">(3,)</text>
    <g class="ft st"><rect x="160" y="40" width="26" height="26"/><rect x="186" y="40" width="26" height="26"/><rect x="212" y="40" width="26" height="26"/><rect x="160" y="66" width="26" height="26"/><rect x="186" y="66" width="26" height="26"/><rect x="212" y="66" width="26" height="26"/></g><text x="170" y="115">matrix</text><text x="174" y="132" class="tm">(2, 3)</text>
    <g class="fg sg"><rect x="300" y="24" width="60" height="60"/><rect x="310" y="34" width="60" height="60"/><rect x="320" y="44" width="60" height="60"/></g>
    <text x="300" y="128">image batch</text><text x="290" y="144" class="tm">(N, C, H, W)</text>
    <text x="410" y="40">shape</text><text x="470" y="40" class="tm">sizes</text>
    <text x="410" y="70">dtype</text><text x="470" y="70" class="tm">float32…</text>
    <text x="410" y="100">device</text><text x="470" y="100" class="tm">cpu / cuda</text>
  </svg><figcaption>Everything (inputs, weights, gradients) is a tensor. Three attributes describe it, and most PyTorch errors are a mismatch in one of them.</figcaption></figure>
  <p>Worked example: the table <code>[[1, 2, 3], [4, 5, 6]]</code> has 2 rows and 3 columns, so its shape is (2, 3). It has 2 dimensions (<code>ndim</code>) and 2 × 3 = 6 numbers (<code>numel</code>). Row 0 is <code>[1, 2, 3]</code>; column 1 is <code>[2, 5]</code>; the item at row 1, column 2 is 6. The code below checks each of those, then shows which number type PyTorch picks by default.</p>
  <div class="fx" data-lang="py">import torch, numpy as np
x = torch.tensor([[1., 2., 3.], [4., 5., 6.]])
print(x.shape, x.dtype, x.device)
print(x.ndim, x.numel())
print(torch.tensor([1, 2]).dtype, torch.zeros(2, 3).dtype, torch.tensor(np.array([1.5])).dtype)
print(x[0], x[:, 1], x[1, 2].item())</div>
  <div class="fx" data-lang="text">torch.Size([2, 3]) torch.float32 cpu
2 6
torch.int64 torch.float32 torch.float64
tensor([1., 2., 3.]) tensor([2., 5.]) 6.0</div>
  <p>What happened: <code>torch.tensor(...)</code> copied the Python list into a tensor. Python floats became <strong>float32</strong> (32-bit decimals, what models use), Python ints became <strong>int64</strong>, but a NumPy array keeps NumPy's <strong>float64</strong>. Indexing works like NumPy: <code>x[0]</code> is a row, <code>x[:, 1]</code> a column. <code>.item()</code> turns a one-number tensor into a plain Python float, which is what you print or log.</p>
  <p>Now the dtype trap in action. A model layer has float32 weights; feeding it float64 NumPy data fails:</p>
  <div class="fx" data-lang="py">lin = torch.nn.Linear(3, 1)                 # weights are float32
arr = np.array([[1., 2., 3.]])              # NumPy default: float64
try:
    lin(torch.from_numpy(arr))
except RuntimeError as e:
    print("RuntimeError:", e)
print(lin(torch.tensor(arr, dtype=torch.float32)).shape)</div>
  <div class="fx" data-lang="text">RuntimeError: mat1 and mat2 must have the same dtype, but got Double and Float
torch.Size([1, 1])</div>
  <p>"Double" is float64 and "Float" is float32. Passing <code>dtype=torch.float32</code> fixes it. You will see this error the first time you load a pandas DataFrame into a model.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>tensor</strong> is an n-dimensional array with a <strong>shape</strong> (size of each dimension), a <strong>dtype</strong> (number type: float32, int64, bool…) and a <strong>device</strong> (cpu or cuda). With <code>requires_grad=True</code> it also records the operations applied to it (section 03).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Labels for <code>CrossEntropyLoss</code> must be int64 (<code>torch.long</code>) class indices, while inputs must be float32. Convert once, when building the Dataset, not inside the loop.</p></div>

  <h2 id="dp2-shape"><span class="num">02</span>Shapes &amp; Broadcasting</h2>
  <p>In deep learning, most bugs are shape bugs. A layer expects (batch, features) and gets (features,); an image layer expects channels first and gets channels last. The error appears ten lines away from the real mistake. The cure is a habit: <strong>write the shape next to every line</strong>, as comments, until it is automatic.</p>
  <p>The idea in plain words: the numbers in a tensor sit in memory as one long row. The shape is only a way of reading that row. <code>reshape</code> changes the reading (same numbers, new grid), <code>permute</code> swaps the order of the dimensions, and <code>unsqueeze</code>/<code>squeeze</code> add or remove a dimension of size 1.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A box of 24 laddoos. You can arrange them 4 × 6 or 6 × 4 or 2 × 12: same laddoos, different trays (reshape). Turning the tray sideways is permute. Putting the tray into a carry-bag that holds exactly one tray is unsqueeze: the laddoos did not change, but now there is a "bag" dimension of size 1.</p></div>
  <p>Trace one batch of 32 colour images, 28 × 28 pixels each:</p>
  <table class="tbl out"><caption>Shape trace</caption>
    <tr><th>Operation</th><th>Shape after</th><th>Why</th></tr>
    <tr><td><code>imgs</code></td><td>(32, 3, 28, 28)</td><td>N = 32 images, C = 3 colours, H = W = 28</td></tr>
    <tr><td><code>imgs.reshape(32, -1)</code></td><td>(32, 2352)</td><td>−1 means "work it out": 3·28·28 = 2352</td></tr>
    <tr><td><code>imgs.permute(0, 2, 3, 1)</code></td><td>(32, 28, 28, 3)</td><td>dims reordered: channels last (NumPy / matplotlib layout)</td></tr>
    <tr><td><code>imgs[0]</code></td><td>(3, 28, 28)</td><td>one image, batch dim gone</td></tr>
    <tr><td><code>imgs[0].unsqueeze(0)</code></td><td>(1, 3, 28, 28)</td><td>a "batch of one", what models expect</td></tr>
  </table>
  <div class="fx" data-lang="py">torch.manual_seed(0)
imgs = torch.randn(32, 3, 28, 28)            # (N, C, H, W)
print(imgs.shape)
print(imgs.reshape(32, -1).shape)            # flatten each image
print(imgs.permute(0, 2, 3, 1).shape)        # channels last
one = imgs[0]
print(one.shape, one.unsqueeze(0).shape, one.unsqueeze(0).squeeze(0).shape)</div>
  <div class="fx" data-lang="text">torch.Size([32, 3, 28, 28])
torch.Size([32, 2352])
torch.Size([32, 28, 28, 3])
torch.Size([3, 28, 28]) torch.Size([1, 3, 28, 28]) torch.Size([3, 28, 28])</div>
  <p>Every line matches the table. <code>torch.randn</code> fills a tensor of that shape with random numbers; the values do not matter here, only the shapes.</p>
  <h3>Broadcasting, matmul and reductions</h3>
  <p><strong>Broadcasting</strong> lets you add a small tensor to a big one without copying it by hand. Line the shapes up from the right; a dimension of size 1 (or a missing one) is stretched to match. (2, 3) + (3,) → the row of 3 is added to both rows. (2, 3) + (2, 1) → the column of 2 is added to all 3 columns. Matrix multiply <code>@</code> needs the inner sizes to match: (2, 3) @ (3, 2) → (2, 2). <code>sum(dim=0)</code> collapses dimension 0 (down the rows); <code>dim=1</code> collapses across columns.</p>
  <div class="fx" data-lang="py">x = torch.tensor([[1., 2., 3.], [4., 5., 6.]])   # (2, 3)
print(x + torch.tensor([10., 20., 30.]))           # (2,3) + (3,)   -&gt; (2,3)
print(x + torch.tensor([[100.], [200.]]))          # (2,3) + (2,1)  -&gt; (2,3)
print((x @ x.T).shape, x @ x.T)                    # (2,3) @ (3,2)  -&gt; (2,2)
print(x.sum(dim=0), x.sum(dim=1), x.mean(dim=1, keepdim=True).shape)
try:
    torch.randn(4, 3) @ torch.randn(4, 3)          # inner sizes 3 vs 4
except RuntimeError as e:
    print("RuntimeError:", e)</div>
  <div class="fx" data-lang="text">tensor([[11., 22., 33.],
        [14., 25., 36.]])
tensor([[101., 102., 103.],
        [204., 205., 206.]])
torch.Size([2, 2]) tensor([[14., 32.],
        [32., 77.]])
tensor([5., 7., 9.]) tensor([ 6., 15.]) torch.Size([2, 1])
RuntimeError: mat1 and mat2 shapes cannot be multiplied (4x3 and 4x3)</div>
  <p>Check one cell of the matmul by hand: row 0 · row 0 = 1·1 + 2·2 + 3·3 = 14. Row 0 · row 1 = 4 + 10 + 18 = 32. <code>keepdim=True</code> keeps the collapsed dimension as size 1, so (2, 3) → (2, 1), which broadcasts back against x (handy for "subtract the row mean"). The last error message prints both shapes; read it, it tells you exactly what to fix.</p>
  <h3>view vs reshape, and shared memory</h3>
  <div class="fx" data-lang="py">t = x.T                                   # transpose: (3, 2), same memory, read in another order
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
tensor([1., 4., 2., 5., 3., 6.])
tensor([99.,  2.,  3.], dtype=torch.float64)
tensor([99.,  2.,  3.], dtype=torch.float64)</div>
  <p><code>x.T</code> does not move any numbers; it only changes the reading order, so the memory is no longer "in order" (<strong>contiguous</strong>). <code>view</code> refuses to work on that because it never copies; <code>reshape</code> copies when it must. <code>torch.from_numpy</code> shares memory with the array, so changing <code>arr[0]</code> changed the tensor; <code>torch.tensor</code> made its own copy, so <code>arr[1] = -1</code> did not reach it.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Broadcasting</strong>: align shapes from the right; each pair of sizes must be equal, or one of them 1 (or missing), and size-1 dims are stretched. <strong>Contiguous</strong>: the elements sit in memory in the same order as the shape reads them.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Broadcasting never complains when it "works" by accident. Predictions of shape (64, 1) minus targets of shape (64,) broadcast to (64, 64): a 4,096-number loss that is silently wrong. Before a loss, make both shapes identical (<code>pred.squeeze(1)</code>). Interviewers love this one.</p></div>

  <h2 id="dp2-ag"><span class="num">03</span>Autograd</h2>
  <p>To train a network you need the <strong>gradient</strong>: for each weight, "if I nudge this weight up a little, how much does the loss go up or down?" For a network with a million weights, deriving those formulas by hand is impossible, and a single mistake ruins training. <strong>Autograd</strong> (automatic differentiation) does it for you.</p>
  <p>The idea in plain words: when a tensor has <code>requires_grad=True</code>, PyTorch quietly writes down every operation done with it, building a small graph. When you call <code>.backward()</code> on the final number, PyTorch walks that graph backwards and applies the chain rule at each step, writing the answer into <code>.grad</code> of each starting tensor.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana shop bill that lists every item, the quantity and the tax line. From the final total you can trace back exactly how much each item added. Autograd keeps that bill for every number it computes, and <code>backward()</code> reads it from the bottom up.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
    <defs><marker id="dp2-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="30" width="90" height="36" rx="6" class="fb sb"/><text x="32" y="53">w = 2.0</text>
    <rect x="20" y="120" width="90" height="36" rx="6" class="fb sb"/><text x="32" y="143">x = 3.0</text>
    <rect x="190" y="30" width="110" height="36" rx="18" class="fv sb"/><text x="200" y="53">MulBackward0</text>
    <rect x="190" y="120" width="110" height="36" rx="18" class="fv sb"/><text x="200" y="143">PowBackward0</text>
    <rect x="370" y="75" width="110" height="36" rx="18" class="fv sb"/><text x="380" y="98">AddBackward0</text>
    <rect x="500" y="75" width="50" height="36" rx="6" class="ft st"/><text x="507" y="98">y=15</text>
    <line x1="110" y1="48" x2="188" y2="48" stroke="currentColor" marker-end="url(#dp2-ah1)"/>
    <line x1="110" y1="132" x2="188" y2="60" stroke="currentColor" marker-end="url(#dp2-ah1)"/>
    <line x1="110" y1="138" x2="188" y2="138" stroke="currentColor" marker-end="url(#dp2-ah1)"/>
    <line x1="300" y1="48" x2="368" y2="86" stroke="currentColor" marker-end="url(#dp2-ah1)"/>
    <line x1="300" y1="138" x2="368" y2="100" stroke="currentColor" marker-end="url(#dp2-ah1)"/>
    <line x1="480" y1="93" x2="498" y2="93" stroke="currentColor" marker-end="url(#dp2-ah1)"/>
    <text x="20" y="20" class="tr">w.grad = x = 3</text><text x="20" y="180" class="tr">x.grad = w + 2x = 8</text>
    <text x="225" y="180" class="tm">blue: leaves (.grad) · violet: ops (grad_fn)</text>
  </svg><figcaption>Running y = w·x + x² records this graph. <code>y.backward()</code> walks it right to left with the chain rule.</figcaption></figure>
  <p>Worked example by hand, with w = 2 and x = 3. Forward: w·x = 6, x² = 9, y = 15. Backward: y changes by x = 3 for each unit of w, so dy/dw = 3. For x, both branches contribute: w (from w·x) plus 2x (from x²) = 2 + 6 = 8. Now let PyTorch do it:</p>
  <div class="fx" data-lang="py">x = torch.tensor(3.0, requires_grad=True)
w = torch.tensor(2.0, requires_grad=True)
y = w * x + x ** 2
print(y, y.grad_fn.name(), [f[0].name() for f in y.grad_fn.next_functions])
y.backward()
print(x.grad, w.grad)       # dy/dx = w + 2x = 8, dy/dw = x = 3
y = w * x + x ** 2
y.backward()
print(x.grad)               # accumulated: 8 + 8
x.grad.zero_()
print(x.grad)
a = torch.tensor([1., 2.], requires_grad=True)
b = (a * 2).detach()
print(b.requires_grad)
with torch.no_grad():
    c = a * 2
print(c.requires_grad, c.grad_fn)</div>
  <div class="fx" data-lang="text">tensor(15., grad_fn=&lt;AddBackward0&gt;) AddBackward0 ['MulBackward0', 'PowBackward0']
tensor(8.) tensor(3.)
tensor(16.)
tensor(0.)
False
False None</div>
  <p>Line by line: <code>y</code> carries <code>grad_fn=AddBackward0</code>, the last recorded operation, which points back to the multiply and the power, exactly the graph in the picture. After <code>backward()</code>, the gradients 8 and 3 match our hand calculation. Running forward and backward a second time gave <strong>16</strong>, not 8: gradients <em>add up</em> in <code>.grad</code>. <code>zero_()</code> resets it. <code>detach()</code> returns a copy cut out of the graph, and inside <code>torch.no_grad()</code> nothing is recorded at all (<code>grad_fn</code> is None).</p>
  <h3>Training with nothing but autograd</h3>
  <p>To see that a "training loop" is just this, fit the line y = 2x + 1 from four points, starting at w = b = 0. Loss = mean squared error. Each step: compute loss, <code>backward()</code>, move each weight a little against its gradient, zero the gradients.</p>
  <div class="fx" data-lang="py">xs = torch.tensor([1., 2., 3., 4.])
ys = 2 * xs + 1                       # true rule: y = 2x + 1 -&gt; [3, 5, 7, 9]
w = torch.tensor(0.0, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)
for step in range(1, 201):
    pred = w * xs + b
    loss = ((pred - ys) ** 2).mean()
    loss.backward()
    if step in (1, 2, 3, 50, 200):
        print(f"step {step:3d}  w={w.item():.3f} b={b.item():.3f}  loss={loss.item():.4f}  dw={w.grad.item():.2f} db={b.grad.item():.2f}")
    with torch.no_grad():             # the update itself must not be recorded
        w -= 0.05 * w.grad
        b -= 0.05 * b.grad
    w.grad.zero_(); b.grad.zero_()</div>
  <div class="fx" data-lang="text">step   1  w=0.000 b=0.000  loss=41.0000  dw=-35.00 db=-12.00
step   2  w=1.750 b=0.600  loss=1.1288  dw=-5.75 db=-2.05
step   3  w=2.037 b=0.703  loss=0.0433  dw=-0.93 db=-0.41
step  50  w=2.047 b=0.863  loss=0.0031  dw=0.01 db=-0.04
step 200  w=2.005 b=0.986  loss=0.0000  dw=0.00 db=-0.00</div>
  <p>Check step 1 by hand: predictions are all 0, errors are −3, −5, −7, −9, so loss = (9 + 25 + 49 + 81)/4 = 41. dw = mean(2·error·x) = 2·(−3 − 10 − 21 − 36)/4 = −35. The update w −= 0.05 × (−35) gives 1.75, exactly the step-2 value. After 200 steps w ≈ 2 and b ≈ 1: the rule was learned. Section 06 does the same thing with <code>nn.Module</code> and an optimizer doing the update lines for you.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Autograd</strong> is reverse-mode automatic differentiation. Tensors created by you with <code>requires_grad=True</code> are <strong>leaves</strong>; their <code>.grad</code> is filled by <code>backward()</code>. The graph is <strong>dynamic</strong> ("define-by-run"): rebuilt on every forward pass and freed after <code>backward()</code>, so Python <code>if</code>/<code>for</code> inside a model just work.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Gradients add up on purpose (it allows gradient accumulation: several small batches, one update). In normal training you must zero them every step, or each update uses the sum of all old gradients. Calling <code>backward()</code> twice through the same graph errors unless <code>retain_graph=True</code>.</p></div>

  <h2 id="dp2-data"><span class="num">04</span>Dataset &amp; DataLoader</h2>
  <p>Real data does not fit in GPU memory all at once, and training works best on small, shuffled groups of examples called <strong>batches</strong> (usually 32–256). Writing that by hand (shuffle indices, slice, stack, repeat every epoch, load the next batch while the GPU is busy) is fiddly and slow. PyTorch splits the job in two.</p>
  <p>A <strong>Dataset</strong> answers two questions: "how many examples are there?" and "give me example number i". A <strong>DataLoader</strong> wraps it and does the rest: picks indices (shuffled if you ask), fetches those examples, and stacks them into batch tensors.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The Dataset is a godown shelf: ask for item 417 and you get item 417. The DataLoader is the team of loaders: they pick random items, pack boxes of 64, and keep boxes coming to the truck (the GPU) so it never stands idle.</p></div>
  <figure class="viz"><svg viewBox="0 0 560 140" width="560">
    <defs><marker id="dp2-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="130" height="80" rx="6" class="fb sb"/><text x="22" y="52">Dataset</text><text x="22" y="72" class="tm">__len__ → 800</text><text x="22" y="90" class="tm">[i] → (x, y)</text>
    <line x1="140" y1="70" x2="180" y2="70" stroke="currentColor" marker-end="url(#dp2-ah2)"/>
    <rect x="182" y="40" width="110" height="60" rx="6" class="fv sb"/><text x="192" y="62">sampler</text><text x="192" y="82" class="tm">shuffle idx</text>
    <line x1="292" y1="70" x2="330" y2="70" stroke="currentColor" marker-end="url(#dp2-ah2)"/>
    <rect x="332" y="40" width="90" height="60" rx="6" class="ft st"/><text x="342" y="62">collate</text><text x="342" y="82" class="tm">stack 64</text>
    <line x1="422" y1="70" x2="455" y2="70" stroke="currentColor" marker-end="url(#dp2-ah2)"/>
    <g class="fg sg"><rect x="458" y="30" width="80" height="18"/><rect x="458" y="54" width="80" height="18"/><rect x="458" y="78" width="80" height="18"/></g>
    <text x="462" y="44" font-size="11">x (64, 2)</text><text x="462" y="68" font-size="11">y (64,)</text><text x="470" y="92" font-size="11">…13</text>
    <text x="182" y="130" class="tm">DataLoader (workers load in parallel)</text>
  </svg><figcaption>A Dataset fetches one example; the DataLoader shuffles the order, fetches, and stacks them into batch tensors.</figcaption></figure>
  <p>The example used for the rest of this page: 1000 points in two curved "moons" that hook into each other. Each point has 2 numbers (x, y coordinates) and a label 0 or 1. No straight line separates them, so a model needs hidden layers. Shape trace for one batch: each example is x of shape (2,) and y of shape () (a single number). Stacking 64 of them gives x (64, 2) and y (64,). 800 training rows ÷ 64 = 12.5, so there are 13 batches and the last one holds 800 − 12·64 = 32 rows.</p>
  <div class="fx" data-lang="py">import math, os, torch.nn as nn
from torch.utils.data import Dataset, DataLoader, random_split
torch.manual_seed(42)

def make_moons(n=1000, noise=0.2):
    t = torch.rand(n) * math.pi
    lab = torch.randint(0, 2, (n,))
    x = torch.where(lab == 0, torch.cos(t), 1 - torch.cos(t))
    y = torch.where(lab == 0, torch.sin(t), 0.5 - torch.sin(t))
    return torch.stack([x, y], 1) + noise * torch.randn(n, 2), lab

class MoonsDataset(Dataset):
    def __init__(self, n=1000):
        self.X, self.y = make_moons(n)        # load / preprocess once: X (1000, 2), y (1000,)
    def __len__(self):
        return len(self.X)
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]       # one (input, label) pair: (2,), ()

ds = MoonsDataset()
train_ds, val_ds = random_split(ds, [800, 200])
train_dl = DataLoader(train_ds, batch_size=64, shuffle=True)
val_dl = DataLoader(val_ds, batch_size=256)
print(len(ds), ds[0])
xb, yb = next(iter(train_dl))
print(xb.shape, yb.shape, yb[:8])
print(len(train_dl), [len(x) for x, _ in train_dl][-2:])</div>
  <div class="fx" data-lang="text">1000 (tensor([1.7338, 0.0874]), tensor(1))
torch.Size([64, 2]) torch.Size([64]) tensor([0, 1, 1, 0, 1, 0, 0, 1])
13 [64, 32]</div>
  <p>What happened: <code>make_moons</code> builds all 1000 points once. <code>__getitem__</code> returns one pair, so <code>ds[0]</code> is a point and its label 1. <code>random_split</code> makes two non-overlapping views of 800 and 200 rows. <code>next(iter(train_dl))</code> pulls the first batch: x (64, 2), y (64,), labels shuffled. The last line confirms 13 batches with a final short batch of 32.</p>
  <table class="tbl">
    <tr><th>DataLoader arg</th><th>Typical</th><th>Why</th></tr>
    <tr><td><code>shuffle</code></td><td>True train, False val</td><td>Model must not learn the file order; val order does not matter</td></tr>
    <tr><td><code>num_workers</code></td><td>4–8 (Linux), 0 in notebooks</td><td>Load next batches in parallel processes so the GPU never waits</td></tr>
    <tr><td><code>pin_memory</code></td><td>True with CUDA</td><td>Faster CPU → GPU copies</td></tr>
    <tr><td><code>drop_last</code></td><td>True with BatchNorm</td><td>A last batch of 1 breaks BatchNorm statistics</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Dataset</strong>: any object with <code>__len__</code> and <code>__getitem__(i)</code>. <strong>DataLoader</strong>: iterates over a Dataset in batches, handling shuffling (sampler), stacking (collate), and parallel loading (workers). One full pass over the data is an <strong>epoch</strong>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Heavy work (reading an image file, augmentation) belongs in <code>__getitem__</code>, so workers run it in parallel. Doing it all in <code>__init__</code> fills RAM. And with <code>num_workers&gt;0</code> on Windows/macOS scripts, the loop must sit under <code>if __name__ == "__main__":</code> or workers re-run your script and hang.</p></div>

  <h2 id="dp2-mod"><span class="num">05</span>nn.Module: Custom Models</h2>
  <p>In section 03 we managed two weights by hand: created them, zeroed their grads, updated them. A real network has dozens of weight tensors. Keeping a list of them, moving each to the GPU, saving each to disk, and switching dropout on and off would be a mess. <strong>nn.Module</strong> is the container that does all this bookkeeping.</p>
  <p>In plain words: you write a class. In <code>__init__</code> you create the layers and store them on <code>self</code>. In <code>forward(x)</code> you say how data flows through them. Everything you stored on <code>self</code> is automatically found by <code>.parameters()</code>, moved by <code>.to(device)</code>, saved by <code>state_dict()</code>, and switched by <code>.train()</code>/<code>.eval()</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A tiffin service. <code>__init__</code> is hiring the cooks and buying the vessels (the layers). <code>forward</code> is the recipe card that says in which order food passes from cook to cook. The manager (nn.Module) keeps the inventory of every vessel, so moving the kitchen to a new building (<code>.to("cuda")</code>) or taking stock (<code>state_dict()</code>) is one command.</p></div>
  <p>Our model: 2 inputs → 32 hidden → 32 hidden → 2 outputs. A <code>nn.Linear(in, out)</code> layer computes x @ W.T + b with W of shape (out, in), so it has in·out + out parameters. Count by hand: 2·32 + 32 = 96, 32·32 + 32 = 1056, 32·2 + 2 = 66; total <strong>1,218</strong>.</p>
  <div class="fx" data-lang="py">class MLP(nn.Module):
    def __init__(self, d_in=2, hidden=32, n_classes=2, p=0.1):
        super().__init__()                    # must come first
        self.body = nn.Sequential(nn.Linear(d_in, hidden), nn.ReLU(), nn.Dropout(p),
                                  nn.Linear(hidden, hidden), nn.ReLU())
        self.head = nn.Linear(hidden, n_classes)
    def forward(self, x):                     # x: (N, 2)
        return self.head(self.body(x))       # (N, 2) raw scores = logits

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = MLP().to(device)
print(model)
print("params:", sum(p.numel() for p in model.parameters()))
for name, p in model.named_parameters():
    print(f"{name:14s} {tuple(p.shape)}")
h = xb                                        # the (64, 2) batch from section 04
for layer in list(model.body) + [model.head]:
    h = layer(h)
    print(f"{layer.__class__.__name__:8s} -&gt; {tuple(h.shape)}")</div>
  <div class="fx" data-lang="text">MLP(
  (body): Sequential(
    (0): Linear(in_features=2, out_features=32, bias=True)
    (1): ReLU()
    (2): Dropout(p=0.1, inplace=False)
    (3): Linear(in_features=32, out_features=32, bias=True)
    (4): ReLU()
  )
  (head): Linear(in_features=32, out_features=2, bias=True)
)
params: 1218
body.0.weight  (32, 2)
body.0.bias    (32,)
body.3.weight  (32, 32)
body.3.bias    (32,)
head.weight    (2, 32)
head.bias      (2,)
Linear   -&gt; (64, 32)
ReLU     -&gt; (64, 32)
Dropout  -&gt; (64, 32)
Linear   -&gt; (64, 32)
ReLU     -&gt; (64, 32)
Linear   -&gt; (64, 2)</div>
  <p>Reading the output: the printout lists layers by the attribute names we chose (<code>body</code>, <code>head</code>). The parameter count matches the hand count. Each weight's shape is (out, in). The shape trace shows the batch dimension 64 passing through untouched; only the feature dimension changes 2 → 32 → 32 → 2. ReLU and Dropout never change shapes. The final (64, 2) are <strong>logits</strong>: one raw score per class per example, not yet probabilities.</p>
  <p>Now the most common nn.Module bug, shown with a real count:</p>
  <div class="fx" data-lang="py">class Broken(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = [nn.Linear(2, 4), nn.Linear(4, 2)]                # plain Python list
class Fixed(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.ModuleList([nn.Linear(2, 4), nn.Linear(4, 2)])
print(sum(p.numel() for p in Broken().parameters()), sum(p.numel() for p in Fixed().parameters()))</div>
  <div class="fx" data-lang="text">0 22</div>
  <p>The Broken model reports <strong>0</strong> parameters: the optimizer would never update those layers, <code>.to("cuda")</code> would not move them, and they would not be saved. <code>nn.ModuleList</code> registers them (2·4 + 4 + 4·2 + 2 = 22).</p>
  <div class="cards">
    <div><b>Registered automatically</b><p>Any <code>nn.Module</code> or <code>nn.Parameter</code> assigned to <code>self</code>.</p><small>tracked by .parameters(), .to(), state_dict</small></div>
    <div><b>Not registered</b><p>Layers in a plain list/dict, plain tensors.</p><small>use nn.ModuleList / ModuleDict / register_buffer</small></div>
    <div><b>nn.functional</b><p>Stateless ops (<code>F.relu</code>) inside forward.</p><small>no weights to track</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>nn.Module</strong>: base class for every layer and model. <strong>Parameter</strong>: a tensor registered as learnable (<code>requires_grad=True</code>). <strong>Logits</strong>: the raw, unnormalised scores a classifier outputs before softmax.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Call <code>model(x)</code>, not <code>model.forward(x)</code>: <code>__call__</code> also runs hooks. Do not add softmax at the end when using <code>CrossEntropyLoss</code>; it applies log-softmax itself, and a double softmax trains badly.</p></div>

  <h2 id="dp2-loop"><span class="num">06</span>The Training Loop</h2>
  <p>Keras has <code>fit()</code> (see <a class="xref" data-note="dl_keras">TensorFlow &amp; Keras</a>). PyTorch does not: you write the loop yourself. It is more lines, but nothing is hidden, so when training misbehaves you can print or change any step. Interviewers often ask you to write these lines from memory.</p>
  <p>The loop is the manual-GD example of section 03, with two helpers: a <strong>loss function</strong> object (here <code>CrossEntropyLoss</code>, which turns logits (N, C) and labels (N,) into one number) and an <strong>optimizer</strong> (here Adam), which owns the "w −= lr · grad" update and the zeroing.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Practising maths on a slate. Wipe the slate (zero_grad), attempt a sum (forward), check the answer key (loss), find where you went wrong (backward), adjust your method (step). Then the next sum. One pass through the whole workbook is an epoch.</p>
  </div>
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
  <p>One step traced with shapes: x (64, 2) → <code>model(x)</code> → logits (64, 2) → <code>loss_fn(logits, y)</code> with y (64,) → loss, shape () (one number) → <code>loss.backward()</code> fills all six <code>.grad</code> tensors, each the same shape as its weight → <code>opt.step()</code> changes the weights. First a sanity check: an untrained 2-class model should guess about 50/50, and cross-entropy of a 50/50 guess is ln 2 ≈ 0.693.</p>
  <div class="fx" data-lang="py">loss_fn = nn.CrossEntropyLoss()
with torch.no_grad():
    print("step-0 loss:", round(loss_fn(model(xb), yb).item(), 4), " ln 2 =", round(math.log(2), 4))
opt = torch.optim.Adam(model.parameters(), lr=1e-2)

def train_epoch():
    model.train(); total = 0
    for x, y in train_dl:
        x, y = x.to(device), y.to(device)
        opt.zero_grad()                       # 1 clear old grads
        loss = loss_fn(model(x), y)           # 2 forward + 3 loss
        loss.backward()                       # 4 backprop
        opt.step()                            # 5 update
        total += loss.item() * len(x)         # .item(): plain float, no graph
    return total / len(train_dl.dataset)

@torch.no_grad()
def evaluate():
    model.eval(); total, correct = 0, 0
    for x, y in val_dl:
        x, y = x.to(device), y.to(device)
        logits = model(x)                     # (200, 2)
        total += loss_fn(logits, y).item() * len(x)
        correct += (logits.argmax(1) == y).sum().item()   # argmax(1): (200,) predicted class
    return total / len(val_dl.dataset), correct / len(val_dl.dataset)

best = float("inf")
for epoch in range(1, 21):
    tr = train_epoch(); va, acc = evaluate()
    if va &lt; best:                            # keep the best checkpoint
        best = va
        torch.save({"epoch": epoch, "model": model.state_dict(),
                    "opt": opt.state_dict(), "val_loss": va}, "ckpt.pt")
    if epoch in (1, 2, 5, 10, 15, 20):
        print(f"epoch {epoch:2d}  train {tr:.4f}  val {va:.4f}  acc {acc:.3f}")</div>
  <div class="fx" data-lang="text">step-0 loss: 0.7283  ln 2 = 0.6931
epoch  1  train 0.4652  val 0.2812  acc 0.870
epoch  2  train 0.3189  val 0.2235  acc 0.890
epoch  5  train 0.1686  val 0.1184  acc 0.960
epoch 10  train 0.1022  val 0.0467  acc 0.990
epoch 15  train 0.0836  val 0.0432  acc 0.980
epoch 20  train 0.0943  val 0.0479  acc 0.980</div>
  <p>What happened: the step-0 loss 0.73 is close to ln 2, so labels and loss are wired correctly. <code>train_epoch</code> runs the five calls per batch; <code>loss.item() * len(x)</code> sums the loss per example so the last short batch is weighted fairly. <code>evaluate</code> turns off dropout (<code>model.eval()</code>) and graph recording (<code>@torch.no_grad()</code>), then counts correct predictions with <code>argmax(1)</code>, which picks the higher of the two logits per row. Accuracy climbs from 0.87 to 0.99 by epoch 10. Every time val loss improves, the full state is saved; that file is used in section 09.</p>
  <p>Why is val loss <em>lower</em> than train loss? Train loss is averaged across the epoch while the weights are still improving, and dropout is on during training only. Both make train loss look worse. This is normal, not a bug.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Optimizer</strong>: object that updates parameters from their <code>.grad</code> (SGD, Adam, AdamW). <strong>Learning rate (lr)</strong>: the step size. <strong>Epoch</strong>: one pass over the training set; <strong>iteration/step</strong>: one batch.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>total += loss</code> (without <code>.item()</code>) keeps every batch's graph alive: memory grows each step until out-of-memory. Same for appending output tensors to a list for logging; use <code>.item()</code> or <code>.detach()</code>.</p></div>

  <h2 id="dp2-dev"><span class="num">07</span>GPU &amp; Device Handling</h2>
  <p>On a CPU our tiny model trains in seconds. A real image or language model would take weeks on a CPU and hours on a GPU, because a GPU runs thousands of multiplications in parallel. The catch: a GPU has its own memory, separate from the computer's RAM. A tensor lives in one place, and every tensor in one calculation must live in the same place.</p>
  <p>In plain words: pick the device once, move the model there once, and move every batch there as it arrives. Results you want to print, plot or turn into NumPy come back with <code>.cpu()</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The cook (GPU) and the ingredients must be in the same kitchen. If the onions are still at home (CPU), cooking stops with an error. Moving the vessels (the model) is done once; each day's vegetables (batches) are brought in daily.</p>
  </div>
  <div class="flow"><span>pick device once</span><span>model.to(device)</span><span>each batch .to(device)</span><span>results .cpu() for NumPy</span></div>
  <div class="fx" data-lang="py">device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(device, torch.cuda.is_available())
lin = nn.Linear(4, 2).to(device)
print(next(lin.parameters()).device)
x = torch.randn(3, 4)                         # created on CPU: (3, 4)
print(lin(x.to(device)).shape)                # (3, 4) -&gt; (3, 2)
with torch.autocast(device_type="cpu", dtype=torch.bfloat16):
    out = lin(x)
print(out.dtype, lin.weight.dtype)            # activations bf16, weights stay fp32
try:
    out.detach().cpu().numpy()
except TypeError as e:
    print("TypeError:", e)
print(out.detach().float().cpu().numpy().shape)</div>
  <div class="fx" data-lang="text">cpu False
cpu
torch.Size([3, 2])
torch.bfloat16 torch.float32
TypeError: Got unsupported ScalarType BFloat16
(3, 2)</div>
  <p>What happened: this machine has no GPU, so <code>device</code> fell back to cpu and the same code still ran; that is why you never hard-code <code>.cuda()</code>. Inside <code>torch.autocast</code> the layer computed in <strong>bfloat16</strong> (a 16-bit float) while its weights stayed float32. That is <strong>mixed precision</strong>: half the memory and much faster maths on modern GPUs. NumPy has no bfloat16, so converting needs <code>.float()</code> first; <code>.detach()</code> is needed because NumPy cannot hold a graph.</p>
  <p>The full mixed-precision training step on a GPU (correct current API; <strong>not run here</strong>, no GPU). With float16, small gradients can round to zero ("underflow"), so a <code>GradScaler</code> multiplies the loss up before backward and divides back before the step:</p>
  <div class="fx" data-lang="py">scaler = torch.amp.GradScaler("cuda")         # only needed for float16, not bf16
for x, y in train_dl:
    x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
    opt.zero_grad()
    with torch.autocast(device_type="cuda", dtype=torch.float16):
        loss = loss_fn(model(x), y)
    scaler.scale(loss).backward()             # scale up so fp16 grads don't underflow
    scaler.unscale_(opt)                      # back to true scale before clipping
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    scaler.step(opt); scaler.update()</div>
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
  <div class="callout trap"><span class="label">Trap</span><p>Model on GPU, batch on CPU → "Expected all tensors to be on the same device". Also watch tensors created <em>inside</em> <code>forward</code> (<code>torch.zeros(n)</code> lands on CPU): write <code>torch.zeros(n, device=x.device)</code>. <code>.numpy()</code> needs a CPU tensor with no grad (and not bf16).</p></div>

  <h2 id="dp2-eval"><span class="num">08</span>eval() and no_grad()</h2>
  <p>Some layers behave differently while learning and while predicting. Dropout randomly zeroes 10% of activations during training (to stop the model relying on any one neuron), but at prediction time you want the same answer every time. BatchNorm uses the current batch's mean during training but stored averages at prediction time. Separately, during prediction you do not need gradients, so recording a graph only wastes memory. PyTorch has two different switches for these two different needs, and people mix them up.</p>
  <p>In plain words: <code>model.eval()</code> tells layers "we are predicting now". <code>torch.no_grad()</code> tells autograd "do not record anything". Neither does the other's job.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p><code>eval()</code> = exam day: no more surprise practice drills (dropout off). <code>no_grad()</code> = not writing rough work in the margin, since nobody will check it. On exam day you want both.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th><code>model.eval()</code></th><th><code>torch.no_grad()</code></th></tr>
    <tr><td>Changes</td><td>Layer behaviour: dropout off, BatchNorm uses running stats</td><td>Autograd: no graph recorded</td></tr>
    <tr><td>Saves memory?</td><td>No</td><td>Yes (no saved activations)</td></tr>
    <tr><td>Undo with</td><td><code>model.train()</code></td><td>leaving the <code>with</code> block</td></tr>
  </table>
  <p>Experiment: one validation point, three forward passes in each mode. Shape trace: <code>val_ds[0][0]</code> is (2,); <code>unsqueeze(0)</code> makes it (1, 2), a batch of one, because layers expect a batch dimension.</p>
  <div class="fx" data-lang="py">x0 = val_ds[0][0].unsqueeze(0)               # (2,) -&gt; (1, 2)
model.train()
with torch.no_grad():
    print("train mode:", [round(model(x0)[0, 1].item(), 3) for _ in range(3)])
model.eval()
with torch.no_grad():
    print("eval mode: ", [round(model(x0)[0, 1].item(), 3) for _ in range(3)])
print(model(x0).requires_grad)
with torch.no_grad():
    print(model(x0).requires_grad)</div>
  <div class="fx" data-lang="text">train mode: [-8.208, -5.945, -8.192]
eval mode:  [-7.339, -7.339, -7.339]
True
False</div>
  <p>Reading it: in train mode, even under <code>no_grad</code>, the three answers differ, because dropout picks different neurons each time. In eval mode they are identical. The last two lines show the other switch: without <code>no_grad</code> the output is still attached to a graph (<code>requires_grad=True</code>, memory held); with it, nothing is recorded. So <code>no_grad</code> alone did not stop the randomness, and <code>eval()</code> alone did not save memory. Validation needs both. <code>torch.inference_mode()</code> is a stricter, slightly faster <code>no_grad</code> for serving.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Training mode</strong> (<code>model.training == True</code>): dropout active, BatchNorm updates and uses batch statistics. <strong>Evaluation mode</strong>: dropout is identity, BatchNorm uses running mean/variance. Set recursively on every sub-module.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting <code>model.train()</code> after validation: the next epoch trains with dropout off and frozen BatchNorm stats. That is why our <code>train_epoch</code> calls <code>model.train()</code> at its start, every epoch.</p></div>

  <h2 id="dp2-ckpt"><span class="num">09</span>Checkpointing</h2>
  <p>Training can take hours, and cloud machines get pre-empted. Also, the model you serve next week must be the best one from training, not whatever the last epoch left behind. So you save the weights to disk as you go. A saved snapshot is a <strong>checkpoint</strong>.</p>
  <p>In plain words: every module can give you a <code>state_dict()</code>, a plain dictionary from parameter name to tensor. You save that dictionary. To load, you build the same class again (fresh random weights) and pour the saved tensors into it with <code>load_state_dict</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A save point in a video game. The save file stores your stats and inventory (weights and optimizer state), not the game program itself (the class). To continue, you start the game (build the model) and then load the save.</p></div>
  <p>The loop in section 06 saved a dict with four keys whenever val loss improved. Let us load it into a brand-new model and check that both models now give exactly the same output.</p>
  <div class="fx" data-lang="py">print(list(model.state_dict().keys()))
ck = torch.load("ckpt.pt", map_location=device)        # weights_only=True by default
fresh = MLP().to(device)                                 # rebuild the architecture
fresh.load_state_dict(ck["model"]); fresh.eval()
model.load_state_dict(ck["model"]); model.eval()
print("best epoch", ck["epoch"], "val", round(ck["val_loss"], 4),
      "size KB", round(os.path.getsize("ckpt.pt") / 1024, 1))
with torch.no_grad():
    print(torch.equal(model(x0), fresh(x0)), fresh(x0).softmax(1).round(decimals=3))</div>
  <div class="fx" data-lang="text">['body.0.weight', 'body.0.bias', 'body.3.weight', 'body.3.bias', 'head.weight', 'head.bias']
best epoch 16 val 0.0364 size KB 20.9
True tensor([[1., 0.]])</div>
  <p>What happened: the keys are the attribute paths from section 05 (<code>body.0</code> is the first Linear; ReLU and Dropout have no weights, so they have no keys). The best val loss was at epoch 16, not 20, which is exactly why we saved the best rather than the last. <code>map_location=device</code> lets a checkpoint saved on a GPU load on a CPU machine. Both models give identical outputs; <code>softmax(1)</code> turns the (1, 2) logits into probabilities: class 0 with ~100% confidence.</p>
  <div class="cards">
    <div><b>Weights only</b><p><code>torch.save(model.state_dict(), p)</code></p><small>for inference / sharing</small></div>
    <div><b>Full checkpoint</b><p>model + optimizer + scheduler state + epoch (+ scaler, RNG)</p><small>to resume training exactly</small></div>
    <div><b>Whole model</b><p><code>torch.save(model, p)</code> pickles the class path</p><small>breaks on refactor; avoid</small></div>
  </div>
  <p>To resume: load all states, then <code>start_epoch = ck["epoch"] + 1</code>. Without the optimizer state, Adam forgets its running averages and the loss jumps after resuming.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>state_dict</strong>: an ordered dict of name → tensor holding a module's parameters and buffers (e.g. BatchNorm running stats). Optimizers have their own <code>state_dict()</code>. Since PyTorch 2.6, <code>torch.load</code> defaults to <code>weights_only=True</code>, which refuses arbitrary pickled objects (safer).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A model saved from <code>nn.DataParallel</code>/DDP has keys starting with <code>module.</code>; strip them or save <code>model.module.state_dict()</code>. And always call <code>.eval()</code> after loading for inference.</p></div>

  <h2 id="dp2-tl"><span class="num">10</span>Transfer Learning</h2>
  <p>Training an image model from scratch needs a million labelled photos and days of GPU time. A startup with 2,000 photos of damaged parcels cannot do that. But a model already trained on ImageNet has learned edges, textures and shapes that are useful for parcels too. <strong>Transfer learning</strong> means starting from such a trained model and adapting it.</p>
  <p>In plain words: keep the trained "body" that turns raw input into useful features, throw away its last layer (the "head", which was specific to the old task), attach a new head for your classes, and train mostly the new head. Optionally, later, gently adjust the top of the body too.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cook trained in North Indian food joins a Chinese restaurant. Knife skills and heat control carry over (frozen backbone); only the recipes are new (new head). After a few weeks the cook adapts some habits too, carefully (fine-tuning at a low learning rate).</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <defs><marker id="dp2-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="300" height="56" rx="8" class="fs" stroke="currentColor" stroke-dasharray="5 3"/>
    <text x="22" y="64">pretrained body (backbone)</text><text x="22" y="84" class="tm">requires_grad = False · lr 0</text>
    <line x1="310" y1="68" x2="350" y2="68" stroke="currentColor" marker-end="url(#dp2-ah4)"/>
    <rect x="352" y="40" width="190" height="56" rx="8" class="fg sg"/><text x="364" y="64">new head (3 classes)</text><text x="364" y="84" class="tm">trainable · lr 1e-2</text>
    <text x="10" y="125" class="tm">phase 2: unfreeze the top block with a tiny lr (1e-4) → fine-tuning</text>
  </svg><figcaption>Reuse features learned on a big dataset; only the small head for your task starts from scratch.</figcaption></figure>
  <p>Worked example with our own model: treat the trained moons <code>body</code> as the "pretrained backbone" for a new 3-class task. Parameter count of the new model: body 96 + 1056 = 1152 (unchanged), new head 32·3 + 3 = 99, total 1251. After freezing the body, only 99 are trainable. Unfreezing <code>body[3]</code> (1056) gives 1155.</p>
  <div class="fx" data-lang="py">torch.save(model.state_dict(), "moons_body.pt")
new = MLP(n_classes=3)
body_only = {k: v for k, v in torch.load("moons_body.pt").items() if k.startswith("body")}
print(new.load_state_dict(body_only, strict=False))
for p in new.body.parameters():
    p.requires_grad = False                                   # phase 1: freeze
print("trainable:", sum(p.numel() for p in new.parameters() if p.requires_grad),
      "/", sum(p.numel() for p in new.parameters()))
opt2 = torch.optim.Adam([p for p in new.parameters() if p.requires_grad], lr=1e-2)
for p in new.body[3].parameters():
    p.requires_grad = True                                    # phase 2: unfreeze top layer
opt3 = torch.optim.Adam([{"params": new.body[3].parameters(), "lr": 1e-4},
                         {"params": new.head.parameters(),    "lr": 1e-2}])
print([g["lr"] for g in opt3.param_groups],
      "trainable now:", sum(p.numel() for p in new.parameters() if p.requires_grad))
print(new(torch.randn(5, 2)).shape)                           # (5, 2) -&gt; (5, 3)</div>
  <div class="fx" data-lang="text">_IncompatibleKeys(missing_keys=['head.weight', 'head.bias'], unexpected_keys=[])
trainable: 99 / 1251
[0.0001, 0.01] trainable now: 1155
torch.Size([5, 3])</div>
  <p>What happened: we filtered the saved dict to keys starting with <code>body</code> and loaded with <code>strict=False</code>, which reports what did not match instead of crashing: only the head is missing, as intended. Setting <code>requires_grad=False</code> freezes a tensor: autograd will not compute its gradient, so it never changes. The optimizer receives only trainable parameters. In phase 2, <strong>parameter groups</strong> give the pretrained layer a 100× smaller learning rate than the new head. The output is now (5, 3): three classes.</p>
  <p>The same recipe on a real ImageNet model (needs a weights download, <strong>not run here</strong>):</p>
  <div class="fx" data-lang="py">from torchvision import models
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
for p in model.parameters():
    p.requires_grad = False
model.fc = nn.Linear(model.fc.in_features, num_classes)      # new head (2048 -&gt; num_classes), trainable
optimizer = torch.optim.AdamW(model.fc.parameters(), lr=1e-3)</div>
  <table class="tbl">
    <tr><th>Your data</th><th>Strategy</th></tr>
    <tr><td>Small, similar to pretraining</td><td>Freeze all, train head (feature extraction)</td></tr>
    <tr><td>Medium, or somewhat different</td><td>Train head, then unfreeze top blocks with low lr</td></tr>
    <tr><td>Large and different</td><td>Fine-tune everything, low lr, warm-up</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Feature extraction</strong>: frozen pretrained backbone + new trainable head. <strong>Fine-tuning</strong>: also update (some of) the pretrained weights, with a small learning rate. <strong>Catastrophic forgetting</strong>: a high learning rate overwrites what the pretrained layers knew. More on CNN backbones in <a class="xref" data-note="dl_cnns">CNNs</a>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Frozen BatchNorm layers still update their running stats in <code>train()</code> mode; put them in <code>eval()</code> if the backbone should stay fixed. And feed the input normalisation the pretrained model expects (e.g. ImageNet mean/std), or its features are garbage.</p></div>

  <h2 id="dp2-lab"><span class="num">11</span>Hands-on: Break the Loop</h2>
  <p>The fastest way to recognise a training bug in real life is to have caused it on purpose once. Below, the same moons run (seed 42, 20 epochs, fresh model each time) is repeated, changing exactly one thing. Train loss at epoch 1 and validation accuracy at epochs 5 and 20 are recorded. All numbers are from real runs.</p>
  <table class="tbl out"><caption>Result of each change</caption>
    <tr><th>Change</th><th>Train loss ep1</th><th>Val acc ep5</th><th>Val acc ep20</th></tr>
    <tr><td>Baseline (Adam lr 1e-2)</td><td>0.444</td><td>0.985</td><td>0.985</td></tr>
    <tr><td>Remove <code>opt.zero_grad()</code></td><td>0.468</td><td>0.505</td><td>0.890</td></tr>
    <tr><td>lr = 1.0</td><td>40.356</td><td>0.825</td><td>0.710</td></tr>
    <tr><td>lr = 1e-4</td><td>0.681</td><td>0.810</td><td>0.850</td></tr>
  </table>
  <ul>
    <li><strong>No zero_grad:</strong> each step uses the sum of every gradient so far. Steps become huge and point in out-of-date directions. Accuracy collapsed to 0.505 (a coin flip) at epoch 5 before partly recovering. The loss does not explode, so this bug hides well.</li>
    <li><strong>lr too high (1.0):</strong> each step overshoots the valley; epoch-1 loss is 40, about 60× the starting 0.69, and accuracy ends worse than it was at epoch 5.</li>
    <li><strong>lr too low (1e-4):</strong> nothing is broken, it is just slow: loss barely moved from ln 2 in epoch 1 and the model is still learning at epoch 20.</li>
  </ul>
  <p>A check every practitioner runs before a long job: <strong>overfit one batch</strong>. Take 64 examples, turn dropout off, and train on only them. A correct model, loss and loop must drive the loss to almost zero. If it cannot, there is a bug in the plumbing, and more data or epochs will not help.</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
ds = MoonsDataset(); xb, yb = ds.X[:64], ds.y[:64]      # (64, 2), (64,)
m = MLP(p=0.0); opt = torch.optim.Adam(m.parameters(), lr=1e-2); lf = nn.CrossEntropyLoss()
for step in range(1, 501):
    opt.zero_grad(); loss = lf(m(xb), yb); loss.backward(); opt.step()
    if step in (1, 100, 300, 500): print(f"overfit step {step}: loss {loss.item():.4f}")</div>
  <div class="fx" data-lang="text">overfit step 1: loss 0.7207
overfit step 100: loss 0.0044
overfit step 300: loss 0.0004
overfit step 500: loss 0.0002</div>
  <p>Loss went from ln 2 to almost zero, so the pipeline can learn. <strong>Try next yourself:</strong> remove <code>model.eval()</code> from <code>evaluate()</code> and watch val accuracy jitter between runs; shuffle the labels (<code>yb[torch.randperm(64)]</code>) and see that one batch can still be memorised, but validation drops to 50%.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Comparing runs that differ in two things at once. Change one setting per run and fix the seed, or you will not know which change caused the result.</p></div>

  <h2 id="dp2-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: wrong dtype</span>
    <p>NumPy/pandas data is float64; models are float32 → "must have the same dtype, but got Double and Float". Labels for <code>CrossEntropyLoss</code> must be int64. Convert once in the Dataset.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: silent broadcasting</span>
    <p>(64, 1) − (64,) becomes (64, 64). Make prediction and target shapes identical before any loss. Print shapes when in doubt.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting zero_grad</span>
    <p>Gradients add up across steps. Our run fell to 0.505 accuracy. Call <code>opt.zero_grad()</code> every step unless you are accumulating on purpose.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: softmax before CrossEntropyLoss</span>
    <p>The loss already applies log-softmax. Return raw logits from <code>forward</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: layers in a plain list</span>
    <p>They are invisible: 0 parameters, not trained, not moved, not saved. Use <code>nn.ModuleList</code> / <code>nn.ModuleDict</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: device mismatch</span>
    <p>Model on GPU, batch or a tensor made inside <code>forward</code> on CPU. Use one <code>device</code> variable, <code>.to(device)</code> every batch, and <code>device=x.device</code> for new tensors.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: eval() without no_grad(), or the reverse</span>
    <p><code>eval()</code> fixes dropout/BatchNorm; <code>no_grad()</code> saves memory. Validation needs both, and training needs <code>model.train()</code> again afterwards.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: logging loss tensors</span>
    <p><code>total += loss</code> keeps each graph alive → memory grows to OOM. Use <code>loss.item()</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: saving the whole model</span>
    <p><code>torch.save(model)</code> pickles class paths and breaks after a refactor. Save <code>state_dict()</code> and rebuild the class to load.</p>
  </div>

  <h2 id="dp2-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Write the five lines inside a training step, in order.</summary><div class="qa-body"><code>opt.zero_grad()</code> → <code>out = model(x)</code> → <code>loss = loss_fn(out, y)</code> → <code>loss.backward()</code> → <code>opt.step()</code>. Clip between backward and step; <code>scheduler.step()</code> after (per epoch or per step, depending on the scheduler).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why call <code>optimizer.zero_grad()</code>? When would you skip it on purpose?</summary><div class="qa-body"><code>backward()</code> adds into <code>.grad</code>. Without zeroing, each step uses the sum of all past gradients (our run: val accuracy fell to 0.505 at epoch 5). Skip it on purpose for gradient accumulation: k small batches, then one step, to act like a k× bigger batch (divide the loss by k).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Difference between <code>model.eval()</code> and <code>torch.no_grad()</code>?</summary><div class="qa-body"><code>eval()</code> changes layer behaviour (dropout off, BatchNorm uses running stats). <code>no_grad()</code> stops graph recording (saves memory and time). They are separate: our model under <code>no_grad</code> in train mode still gave 3 different outputs. Use both for validation and inference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>x = torch.tensor(3., requires_grad=True); y = x**2; y.backward(); y = x**2; y.backward(); print(x.grad)</code></summary><div class="qa-body"><code>tensor(12.)</code>: dy/dx = 2x = 6 each time, and gradients accumulate, 6 + 6.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A batch of 16 RGB images of 64×64. What is the tensor shape in PyTorch, and after <code>reshape(16, -1)</code>?</summary><div class="qa-body">(16, 3, 64, 64) in NCHW order. Flattened: (16, 3·64·64) = (16, 12288).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What shape does (4, 1) + (3,) produce, and why?</summary><div class="qa-body">(4, 3). Align from the right: 1 vs 3 → stretch to 3; 4 vs missing → 4. Every row gets the 3-vector added, every column gets the 4-vector added.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters in <code>nn.Linear(32, 10)</code>, and what is the weight's shape?</summary><div class="qa-body">32·10 + 10 = 330. Weight shape is (10, 32): (out, in). The layer computes x @ W.T + b, so (N, 32) → (N, 10).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why save the <code>state_dict</code> instead of the whole model?</summary><div class="qa-body"><code>torch.save(model)</code> pickles a pointer to the class and file path; renaming or moving code breaks loading, and unpickling unknown objects is unsafe. A state_dict is just name → tensor: portable, loadable with <code>weights_only=True</code>. Rebuild the class, then <code>load_state_dict</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What goes into a checkpoint for resuming training?</summary><div class="qa-body">Model state_dict, optimizer state_dict (Adam's running averages), scheduler state, epoch/step, best metric, GradScaler state if using AMP, ideally random-number states. Without the optimizer state, the loss jumps after resuming.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"Expected all tensors to be on the same device". Fix?</summary><div class="qa-body">Some tensor (batch, label, or a tensor created inside <code>forward</code>) is on CPU while the model is on GPU. Move batches with <code>.to(device)</code>; create new tensors with <code>device=x.device</code>; register constants as buffers so <code>model.to()</code> moves them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Memory grows every iteration until CUDA OOM. Likely causes?</summary><div class="qa-body">Adding up <code>loss</code> instead of <code>loss.item()</code>; storing outputs with graphs for logging; validation without <code>no_grad()</code>. After fixing those: smaller batch, mixed precision, gradient checkpointing, accumulation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you freeze a pretrained backbone and train only a new head?</summary><div class="qa-body">Set <code>requires_grad=False</code> on backbone params, replace the final layer (new layers are trainable by default), and give the optimizer only trainable params. Later unfreeze top blocks with parameter groups: low lr (1e-5–1e-4) for the backbone, higher for the head.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>view</code> vs <code>reshape</code>?</summary><div class="qa-body"><code>view</code> never copies and needs contiguous memory; it errors after <code>.T</code>/<code>permute</code>. <code>reshape</code> gives a view when it can and copies otherwise. Use <code>reshape</code> unless you need the no-copy guarantee.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a Dataset need, and what does the DataLoader add?</summary><div class="qa-body">Dataset: <code>__len__</code> and <code>__getitem__(i)</code> returning one example. DataLoader: batching (collate), shuffling, parallel workers, pinned memory, <code>drop_last</code>. 800 rows with batch 64 gives 13 batches, the last of 32.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a fresh 2-class model start near loss 0.69, and why is that useful?</summary><div class="qa-body">Random logits ≈ equal probabilities → CE = ln 2 ≈ 0.693 (ln C for C classes). If step-0 loss is far off, the labels, the loss function or the init are wrong; catch it before a long run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model cannot overfit a single batch of 64. What does that tell you?</summary><div class="qa-body">The plumbing is broken, not the data: wrong labels, a detached graph, a missing <code>optimizer.step()</code>, a frozen model, a wrong loss/activation pair, or a learning rate far off. A healthy setup drives one batch to near-zero loss (ours: 0.72 → 0.0002).</div></details>
</main>`
});
