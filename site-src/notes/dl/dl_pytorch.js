// notes/dl/dl_pytorch.js — PyTorch
Object.assign(TOPIC_CONTENT, {
  "dl_pytorch": `<main>
  <h1>PyTorch</h1>
  <p class="lead">The framework most DL research, LLM and Hugging Face work runs on. This page builds one small classifier end to end (tensors → autograd → Dataset → nn.Module → training loop → eval → checkpoint → transfer learning) with real output from PyTorch 2.14 on CPU. Theory behind each step: NN Foundations.</p>

  <h2 id="dp2-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">PyTorch</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Tensors</div>
        <ul>
          <li><b>Tensor</b> — n-d array + <b>shape</b>, <b>dtype</b>, <b>device</b>; 💡 NumPy array that can live on a GPU and remember its history</li>
          <li><b>Defaults</b> — floats → float32, ints → int64</li>
          <li><b>Image batch</b> — (N, C, H, W), e.g. (32, 3, 28, 28)</li>
          <li><b>reshape</b> always works; <b>view</b> needs contiguous memory (fails after <code>.T</code>)</li>
          <li><b>unsqueeze/squeeze</b> add/remove size-1 dims; broadcasting like NumPy</li>
          <li>⚠ <code>torch.from_numpy</code> shares memory; <code>torch.tensor</code> copies</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Autograd</div>
        <ul>
          <li><b>requires_grad=True</b> — record every op into a graph (<code>grad_fn</code>)</li>
          <li><b>Dynamic graph</b> — rebuilt each forward; plain Python if/for work</li>
          <li><b>backward()</b> — fills <code>.grad</code> of leaf tensors</li>
          <li>⚠ <b>Grads accumulate</b> — 8 then 16; zero them every step</li>
          <li><b>detach()</b> cuts one tensor out; <b>no_grad()</b> records nothing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data</div>
        <ul>
          <li><b>Dataset</b> — <code>__len__</code> + <code>__getitem__(i)</code> → one (x, y)</li>
          <li><b>DataLoader</b> — batching, <code>shuffle=True</code> (train), <code>num_workers</code>, <code>pin_memory</code></li>
          <li><b>random_split</b> — train/val split of a Dataset</li>
          <li>⚠ <code>num_workers&gt;0</code> in notebooks/Windows → needs <code>if __name__ == "__main__"</code> or hangs</li>
          <li>💡 Dataset = warehouse shelf; DataLoader = forklift bringing pallets</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">nn.Module</div>
        <ul>
          <li><b>__init__</b> — <code>super().__init__()</code> first, then assign layers as attributes</li>
          <li><b>forward(x)</b> — the computation; call <code>model(x)</code>, not <code>model.forward(x)</code></li>
          <li><b>Free stuff</b> — <code>.parameters()</code>, <code>.to(device)</code>, <code>.train()/.eval()</code>, <code>state_dict()</code></li>
          <li>⚠ Layers in a Python list are invisible → <code>nn.ModuleList</code></li>
          <li><b>Return logits</b>; loss applies softmax</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Training loop</div>
        <ul>
          <li><b>Order</b> — zero_grad → forward → loss → backward → (clip) → step → (scheduler)</li>
          <li><b>Log</b> <code>loss.item()</code>, never <code>loss</code> (keeps graph alive)</li>
          <li><b>No zero_grad</b> — acc 0.995 → 0.855 in our run</li>
          <li><b>lr 1.0</b> — epoch-1 loss 32; <b>lr 1e-4</b> — 0.85 acc after 20 epochs</li>
          <li><b>Sanity</b> — step-0 loss ≈ ln(classes); overfit one batch first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Device &amp; eval</div>
        <ul>
          <li><b>device</b> = <code>"cuda" if torch.cuda.is_available() else "cpu"</code>; move model once, every batch</li>
          <li>⚠ Mismatch → "Expected all tensors to be on the same device"</li>
          <li><b>AMP</b> — <code>torch.autocast</code> fp16/bf16 + <code>GradScaler</code> (fp16 only)</li>
          <li><b>model.eval()</b> — dropout off, BN uses running stats</li>
          <li><b>torch.no_grad()</b> / <code>inference_mode()</code> — no graph, less memory</li>
          <li>⚠ They are independent; validation needs both</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Checkpoints</div>
        <ul>
          <li><b>Save state_dict</b> — dict name → tensor; not the pickled model</li>
          <li><b>Resume</b> — also save optimizer, scheduler, epoch</li>
          <li><b>Load</b> — build model → <code>load_state_dict(torch.load(p, map_location=device))</code> → <code>eval()</code></li>
          <li><b>weights_only=True</b> default since 2.6 → safe unpickling</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Transfer learning</div>
        <ul>
          <li><b>Feature extraction</b> — freeze backbone, train new head (small/similar data)</li>
          <li><b>Fine-tune</b> — unfreeze top blocks; low lr (1e-5–1e-4) for backbone, high for head</li>
          <li><b>Freeze</b> — <code>p.requires_grad = False</code>; pass only trainable params to optimizer</li>
          <li><b>strict=False</b> loading → reports missing/unexpected keys</li>
          <li>⚠ Too high lr on pretrained layers = catastrophic forgetting</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dp2-ten"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Tensors</span><span class="rm-sub">Shape, dtype, device</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-ag"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Autograd</span><span class="rm-sub">The computation graph</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-data"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Dataset &amp; DataLoader</span><span class="rm-sub">Feeding batches</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-mod"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">nn.Module</span><span class="rm-sub">Custom models</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-loop"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Training Loop</span><span class="rm-sub">A complete real run</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-dev"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">GPU &amp; Devices</span><span class="rm-sub">.to(device), mixed precision</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-eval"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">eval() &amp; no_grad()</span><span class="rm-sub">Two different switches</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-ckpt"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Checkpointing</span><span class="rm-sub">state_dict save / load</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-tl"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Transfer Learning</span><span class="rm-sub">Freeze, replace head, unfreeze</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-lab"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Hands-on: Break the Loop</span><span class="rm-sub">What each mistake does</span></div></div>
      <div class="rm-item rm-done" data-target="dp2-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dp2-ten"><span class="num">01</span>Tensors</h2>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <rect x="20" y="60" width="26" height="26" class="fb sb"/><text x="14" y="115">scalar</text><text x="18" y="132" class="tm">()</text>
    <g class="fb sb"><rect x="90" y="30" width="26" height="26"/><rect x="90" y="56" width="26" height="26"/><rect x="90" y="82" width="26" height="26"/></g><text x="80" y="128">vector</text><text x="88" y="144" class="tm">(3,)</text>
    <g class="ft st"><rect x="160" y="40" width="26" height="26"/><rect x="186" y="40" width="26" height="26"/><rect x="212" y="40" width="26" height="26"/><rect x="160" y="66" width="26" height="26"/><rect x="186" y="66" width="26" height="26"/><rect x="212" y="66" width="26" height="26"/></g><text x="170" y="115">matrix</text><text x="174" y="132" class="tm">(2, 3)</text>
    <g class="fg sg"><rect x="300" y="24" width="60" height="60"/><rect x="310" y="34" width="60" height="60"/><rect x="320" y="44" width="60" height="60"/></g>
    <text x="300" y="128">image batch</text><text x="290" y="144" class="tm">(N, C, H, W)</text>
    <text x="410" y="40">shape</text><text x="470" y="40" class="tm">sizes</text>
    <text x="410" y="70">dtype</text><text x="470" y="70" class="tm">float32…</text>
    <text x="410" y="100">device</text><text x="470" y="100" class="tm">cpu / cuda</text>
  </svg><figcaption>Everything (inputs, weights, gradients) is a tensor. Three attributes define it; most bugs are a mismatch in one of them.</figcaption></figure>
  <div class="fx" data-lang="py">import torch, numpy as np
torch.manual_seed(0)
x = torch.tensor([[1., 2., 3.], [4., 5., 6.]])
print(x.shape, x.dtype, x.device)
print(torch.tensor([1, 2]).dtype, torch.zeros(2, 3).dtype)
imgs = torch.randn(32, 3, 28, 28)            # batch, channels, H, W
flat = imgs.reshape(32, -1)
print(flat.shape, imgs.permute(0, 2, 3, 1).shape)
print(x.unsqueeze(0).shape, x.unsqueeze(0).squeeze(0).shape)
print(x + torch.tensor([10., 20., 30.]))     # broadcasting
print(x @ x.T)                               # matmul
print(x.sum(dim=0), x.mean(dim=1))</div>
  <div class="fx" data-lang="text">torch.Size([2, 3]) torch.float32 cpu
torch.int64 torch.float32
torch.Size([32, 2352]) torch.Size([32, 28, 28, 3])
torch.Size([1, 2, 3]) torch.Size([2, 3])
tensor([[11., 22., 33.],
        [14., 25., 36.]])
tensor([[14., 32.],
        [32., 77.]])
tensor([5., 7., 9.]) tensor([2., 5.])</div>
  <p>Two classic gotchas, <code>view</code> vs <code>reshape</code> and NumPy memory sharing:</p>
  <div class="fx" data-lang="py">t = x.T
print(t.is_contiguous())
try:
    t.view(-1)
except RuntimeError as e:
    print("view error:", str(e)[:60])
print(t.reshape(-1))
arr = np.array([1., 2., 3.])
shared = torch.from_numpy(arr); arr[0] = 99
print(shared)                                # sees the change
copy = torch.tensor(arr); arr[1] = -1
print(copy)                                  # independent copy</div>
  <div class="fx" data-lang="text">False
view error: view size is not compatible with input tensor's size and str
tensor([1., 4., 2., 5., 3., 6.])
tensor([99.,  2.,  3.], dtype=torch.float64)
tensor([99.,  2.,  3.], dtype=torch.float64)</div>
  <div class="callout trap"><span class="label">Trap</span><p>NumPy arrays are float64; models are float32. Mixing them gives "expected scalar type Float but found Double". Convert with <code>torch.tensor(arr, dtype=torch.float32)</code>. Labels for <code>CrossEntropyLoss</code> must be int64 (<code>torch.long</code>).</p></div>

  <h2 id="dp2-ag"><span class="num">02</span>Autograd</h2>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
    <defs><marker id="dp2-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
    <marker id="dp2-ah1r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
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
  </svg><figcaption>The forward pass of y = w·x + x² records this graph. <code>y.backward()</code> walks it right to left with the chain rule.</figcaption></figure>
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
  <ul>
    <li><strong>Dynamic ("define-by-run"):</strong> the graph is rebuilt every forward pass, so Python <code>if</code>/<code>for</code> and variable shapes just work.</li>
    <li><strong>Accumulation is deliberate:</strong> it enables gradient accumulation (several small batches, one step). For normal training, zero every step.</li>
    <li><strong>Graph freed after backward:</strong> a second <code>backward()</code> through the same graph errors unless <code>retain_graph=True</code>.</li>
  </ul>

  <h2 id="dp2-data"><span class="num">03</span>Dataset &amp; DataLoader</h2>
  <figure class="viz"><svg viewBox="0 0 560 140" width="560">
    <defs><marker id="dp2-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="130" height="80" rx="6" class="fb sb"/><text x="22" y="52">Dataset</text><text x="22" y="72" class="tm">__len__ → 1000</text><text x="22" y="90" class="tm">[i] → (x, y)</text>
    <line x1="140" y1="70" x2="180" y2="70" stroke="currentColor" marker-end="url(#dp2-ah2)"/>
    <rect x="182" y="40" width="110" height="60" rx="6" class="fv sb"/><text x="192" y="62">sampler</text><text x="192" y="82" class="tm">shuffle idx</text>
    <line x1="292" y1="70" x2="330" y2="70" stroke="currentColor" marker-end="url(#dp2-ah2)"/>
    <rect x="332" y="40" width="90" height="60" rx="6" class="ft st"/><text x="342" y="62">collate</text><text x="342" y="82" class="tm">stack 64</text>
    <line x1="422" y1="70" x2="455" y2="70" stroke="currentColor" marker-end="url(#dp2-ah2)"/>
    <g class="fg sg"><rect x="458" y="30" width="80" height="18"/><rect x="458" y="54" width="80" height="18"/><rect x="458" y="78" width="80" height="18"/></g>
    <text x="462" y="44" font-size="11">x (64, 2)</text><text x="462" y="68" font-size="11">y (64,)</text><text x="470" y="92" font-size="11">…13</text>
    <text x="182" y="130" class="tm">DataLoader (workers load in parallel)</text>
  </svg><figcaption>A Dataset knows how to fetch one example; the DataLoader shuffles indices, fetches, and stacks them into batch tensors.</figcaption></figure>
  <p>Our running example: 1000 points in two interleaving "moons", a non-linear 2-class problem.</p>
  <div class="fx" data-lang="py">import math, os, torch.nn as nn, torch.nn.functional as F
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
        self.X, self.y = make_moons(n)        # load / preprocess once
    def __len__(self):
        return len(self.X)
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]       # one (input, label) pair

ds = MoonsDataset()
train_ds, val_ds = random_split(ds, [800, 200])
train_dl = DataLoader(train_ds, batch_size=64, shuffle=True)
val_dl = DataLoader(val_ds, batch_size=256)
xb, yb = next(iter(train_dl))
print(len(ds), ds[0], xb.shape, yb.shape, len(train_dl))</div>
  <div class="fx" data-lang="text">1000 (tensor([1.7338, 0.0874]), tensor(1)) torch.Size([64, 2]) torch.Size([64]) 13</div>
  <table class="tbl">
    <tr><th>DataLoader arg</th><th>Typical</th><th>Why</th></tr>
    <tr><td><code>shuffle</code></td><td>True train, False val</td><td>Avoid order effects; val order irrelevant</td></tr>
    <tr><td><code>num_workers</code></td><td>4–8 (Linux), 0 in notebooks</td><td>Load next batches in parallel so the GPU never waits</td></tr>
    <tr><td><code>pin_memory</code></td><td>True with CUDA</td><td>Faster host → GPU copies</td></tr>
    <tr><td><code>drop_last</code></td><td>True if BatchNorm</td><td>A last batch of 1 breaks BN statistics</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>The Dataset is a warehouse shelf (fetch item i); the DataLoader is the forklift crew that grabs random items, packs pallets of 64 and keeps them coming while the GPU works.</p></div>

  <h2 id="dp2-mod"><span class="num">04</span>nn.Module: Custom Models</h2>
  <div class="fx" data-lang="py">class MLP(nn.Module):
    def __init__(self, d_in=2, hidden=32, n_classes=2, p=0.1):
        super().__init__()                    # must come first
        self.body = nn.Sequential(nn.Linear(d_in, hidden), nn.ReLU(), nn.Dropout(p),
                                  nn.Linear(hidden, hidden), nn.ReLU())
        self.head = nn.Linear(hidden, n_classes)
    def forward(self, x):
        return self.head(self.body(x))       # raw logits

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = MLP().to(device)
print(model)
print("params:", sum(p.numel() for p in model.parameters()))</div>
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
params: 1218</div>
  <p>Params: 2·32+32 + 32·32+32 + 32·2+2 = 96 + 1056 + 66 = 1218. Splitting into <code>body</code> and <code>head</code> pays off later for transfer learning.</p>
  <div class="cards">
    <div><b>Registered automatically</b><p>Any <code>nn.Module</code> or <code>nn.Parameter</code> assigned to <code>self</code>.</p><small>tracked by .parameters(), .to(), state_dict</small></div>
    <div><b>Not registered</b><p>Layers in a plain list/dict, plain tensors.</p><small>use nn.ModuleList / register_buffer</small></div>
    <div><b>nn.functional</b><p>Stateless ops (<code>F.relu</code>) inside forward.</p><small>no weights to track</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Call <code>model(x)</code>, not <code>model.forward(x)</code>: <code>__call__</code> runs hooks too. And don't add softmax at the end when using <code>CrossEntropyLoss</code>; return logits.</p></div>

  <h2 id="dp2-loop"><span class="num">05</span>The Training Loop</h2>
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
  </svg><figcaption>Five calls per batch, always in this order. Gradient clipping slots between backward and step.</figcaption></figure>
  <div class="fx" data-lang="py">loss_fn = nn.CrossEntropyLoss()
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
        logits = model(x)
        total += loss_fn(logits, y).item() * len(x)
        correct += (logits.argmax(1) == y).sum().item()
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
  <div class="fx" data-lang="text">epoch  1  train 0.5032  val 0.2945  acc 0.870
epoch  2  train 0.3096  val 0.2438  acc 0.895
epoch  5  train 0.1869  val 0.1092  acc 0.965
epoch 10  train 0.1193  val 0.0454  acc 0.995
epoch 15  train 0.0959  val 0.0355  acc 0.985
epoch 20  train 0.0917  val 0.0343  acc 0.995</div>
  <p>Val loss below train loss is normal here: train loss is averaged over the epoch while weights improve, and dropout is on during training only.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>total += loss</code> (without <code>.item()</code>) keeps every batch's graph alive: memory grows each step until OOM. Same for appending tensors to a list for logging; detach or <code>.item()</code> them.</p></div>

  <h2 id="dp2-dev"><span class="num">06</span>GPU &amp; Device Handling</h2>
  <div class="flow"><span>pick device once</span><span>model.to(device)</span><span>each batch .to(device)</span><span>results .cpu() for NumPy</span></div>
  <div class="fx" data-lang="py">device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(device, torch.cuda.is_available())
lin = nn.Linear(4, 2).to(device)
print(next(lin.parameters()).device)
x = torch.randn(3, 4)                         # created on CPU
print(lin(x.to(device)).shape)
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
  <p>This machine has no GPU, so the CUDA path below was <strong>not run here</strong>. Mixed precision on GPU (current API, <code>torch.cuda.amp</code> is deprecated):</p>
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
    <tr><th>CUDA OOM? Try in order</th><th>Effect</th></tr>
    <tr><td>Halve <code>batch_size</code></td><td>Biggest lever on activation memory</td></tr>
    <tr><td>Mixed precision (bf16/fp16)</td><td>~½ activation memory, faster on Tensor Cores</td></tr>
    <tr><td><code>torch.no_grad()</code> in validation</td><td>No graph stored</td></tr>
    <tr><td><code>loss.item()</code> when logging</td><td>No graphs kept alive</td></tr>
    <tr><td>Gradient checkpointing (<code>torch.utils.checkpoint</code>)</td><td>Recompute activations in backward: less memory, more compute</td></tr>
    <tr><td>Gradient accumulation</td><td>Small batches, step every k → same effective batch</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Model on GPU, batch on CPU → "Expected all tensors to be on the same device". Never hard-code <code>.cuda()</code>; use the <code>device</code> variable so code runs anywhere. <code>.numpy()</code> needs a CPU tensor without grad (and not bf16).</p></div>

  <h2 id="dp2-eval"><span class="num">07</span>eval() and no_grad()</h2>
  <table class="tbl">
    <tr><th></th><th><code>model.eval()</code></th><th><code>torch.no_grad()</code></th></tr>
    <tr><td>Changes</td><td>Layer behaviour: dropout off, BatchNorm uses running stats</td><td>Autograd: no graph recorded</td></tr>
    <tr><td>Saves memory?</td><td>No</td><td>Yes (no saved activations)</td></tr>
    <tr><td>Undo with</td><td><code>model.train()</code></td><td>leaving the <code>with</code> block</td></tr>
  </table>
  <p>Same input, three forward passes, one model with dropout:</p>
  <div class="fx" data-lang="py">x0 = val_ds[0][0].unsqueeze(0)               # one sample → batch of 1
model.train()
with torch.no_grad():
    print("train mode:", [round(model(x0)[0, 1].item(), 3) for _ in range(3)])
model.eval()
with torch.no_grad():
    print("eval mode: ", [round(model(x0)[0, 1].item(), 3) for _ in range(3)])</div>
  <div class="fx" data-lang="text">train mode: [-8.736, -8.442, -9.247]
eval mode:  [-8.327, -8.327, -8.327]</div>
  <p><code>no_grad</code> alone did not stop the randomness: only <code>eval()</code> turns dropout off. Validation needs both. <code>torch.inference_mode()</code> is a stricter, slightly faster <code>no_grad</code> for pure serving.</p>

  <h2 id="dp2-ckpt"><span class="num">08</span>Checkpointing</h2>
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
best epoch 20 val 0.0343 size KB 20.9
True tensor([[1., 0.]])</div>
  <div class="cards">
    <div><b>Weights only</b><p><code>torch.save(model.state_dict(), p)</code></p><small>for inference / sharing</small></div>
    <div><b>Full checkpoint</b><p>model + optimizer + scheduler state + epoch (+ scaler, RNG)</p><small>to resume training exactly</small></div>
    <div><b>Whole model</b><p><code>torch.save(model, p)</code> pickles the class path</p><small>breaks on refactor; avoid</small></div>
  </div>
  <p>Resume: load all states, then <code>start_epoch = ck["epoch"] + 1</code>. Without the optimizer state, Adam restarts its moment estimates and training jolts.</p>
  <div class="callout trap"><span class="label">Trap</span><p>A model saved from <code>nn.DataParallel</code>/DDP has keys prefixed <code>module.</code>; strip them or save <code>model.module.state_dict()</code>. Loading GPU tensors on a CPU box needs <code>map_location</code>.</p></div>

  <h2 id="dp2-tl"><span class="num">09</span>Transfer Learning</h2>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <defs><marker id="dp2-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="300" height="56" rx="8" class="fs" stroke="currentColor" stroke-dasharray="5 3"/>
    <text x="22" y="64">pretrained body (backbone)</text><text x="22" y="84" class="tm">requires_grad = False · lr 0</text>
    <line x1="310" y1="68" x2="350" y2="68" stroke="currentColor" marker-end="url(#dp2-ah4)"/>
    <rect x="352" y="40" width="190" height="56" rx="8" class="fg sg"/><text x="364" y="64">new head (3 classes)</text><text x="364" y="84" class="tm">trainable · lr 1e-2</text>
    <text x="10" y="125" class="tm">phase 2: unfreeze the top block with a tiny lr (1e-4) → fine-tuning</text>
  </svg><figcaption>Reuse features learned on a big dataset; only the small task-specific head starts from scratch.</figcaption></figure>
  <p>Here our trained moons body plays the "pretrained backbone" for a new 3-class task:</p>
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
      "trainable now:", sum(p.numel() for p in new.parameters() if p.requires_grad))</div>
  <div class="fx" data-lang="text">_IncompatibleKeys(missing_keys=['head.weight', 'head.bias'], unexpected_keys=[])
trainable: 99 / 1251
[0.0001, 0.01] trainable now: 1155</div>
  <p>The same recipe on a real ImageNet model (needs torchvision + a weights download, <strong>not run here</strong>):</p>
  <div class="fx" data-lang="py">from torchvision import models
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
for p in model.parameters():
    p.requires_grad = False
model.fc = nn.Linear(model.fc.in_features, num_classes)      # new head, trainable
optimizer = torch.optim.AdamW(model.fc.parameters(), lr=1e-3)</div>
  <table class="tbl">
    <tr><th>Your data</th><th>Strategy</th></tr>
    <tr><td>Small, similar to pretraining</td><td>Freeze all, train head (feature extraction)</td></tr>
    <tr><td>Medium, or somewhat different</td><td>Train head, then unfreeze top blocks with low lr</td></tr>
    <tr><td>Large and different</td><td>Fine-tune everything, low lr, warm-up</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Frozen BatchNorm layers still update running stats in <code>train()</code> mode; put them in <code>eval()</code> if the backbone should stay fixed. Use the pretrained model's own input normalization (e.g. ImageNet mean/std).</p></div>

  <h2 id="dp2-lab"><span class="num">10</span>Hands-on: Break the Loop</h2>
  <p>Same moons run (seed 42, 20 epochs), changing one thing at a time. Real results:</p>
  <table class="tbl out"><caption>Result (epoch 1 → epoch 20)</caption>
    <tr><th>Change</th><th>Train loss ep1</th><th>Val acc ep5</th><th>Val acc ep20</th></tr>
    <tr><td>Baseline (Adam lr 1e-2)</td><td>0.503</td><td>0.965</td><td>0.995</td></tr>
    <tr><td>Remove <code>opt.zero_grad()</code></td><td>0.508</td><td>0.465</td><td>0.855</td></tr>
    <tr><td>lr = 1.0</td><td>32.457</td><td>0.870</td><td>0.900</td></tr>
    <tr><td>lr = 1e-4</td><td>0.713</td><td>0.640</td><td>0.850</td></tr>
  </table>
  <ul>
    <li><strong>No zero_grad:</strong> gradients pile up, steps grow huge and stale; training thrashes (acc fell to 0.465 mid-run).</li>
    <li><strong>lr too high:</strong> first-epoch loss explodes; it recovers only partly. <strong>Too low:</strong> still learning after 20 epochs.</li>
    <li><strong>Try next:</strong> forget <code>model.eval()</code> in <code>evaluate()</code> and watch val acc jitter; overfit one batch of 64 to ~0 loss as a sanity check before any long run.</li>
  </ul>

  <h2 id="dp2-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Write the five lines inside a training step, in order.</summary><div class="qa-body"><code>opt.zero_grad()</code> → <code>out = model(x)</code> → <code>loss = loss_fn(out, y)</code> → <code>loss.backward()</code> → <code>opt.step()</code>. Clip between backward and step; <code>scheduler.step()</code> after (per epoch or per step depending on scheduler).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why call <code>optimizer.zero_grad()</code>? When would you skip it on purpose?</summary><div class="qa-body"><code>backward()</code> adds into <code>.grad</code>. Without zeroing, each step uses the sum of all past gradients (our run: acc 0.995 → 0.855). Skip deliberately for gradient accumulation: k small batches, then one step, to emulate a k× larger batch (divide loss by k).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Difference between <code>model.eval()</code> and <code>torch.no_grad()</code>?</summary><div class="qa-body"><code>eval()</code> changes layer behaviour (dropout off, BatchNorm running stats). <code>no_grad()</code> stops graph recording (memory/speed). Independent: our model under <code>no_grad</code> in train mode still gave 3 different outputs. Use both for validation/inference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>x = torch.tensor(3., requires_grad=True); y = x**2; y.backward(); y = x**2; y.backward(); print(x.grad)</code></summary><div class="qa-body"><code>tensor(12.)</code>: 6 + 6, gradients accumulate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why save the <code>state_dict</code> instead of the whole model?</summary><div class="qa-body"><code>torch.save(model)</code> pickles a reference to the class and module path; renaming or refactoring breaks loading, and unpickling arbitrary objects is unsafe. A state_dict is just name → tensor: portable, loadable with <code>weights_only=True</code>. Rebuild the class, then <code>load_state_dict</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What goes into a checkpoint for resuming training?</summary><div class="qa-body">Model state_dict, optimizer state_dict (Adam moments), scheduler state, epoch/step, best metric, GradScaler state if AMP, ideally RNG states. Missing optimizer state makes training jump after resume.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model is on the GPU and you get "Expected all tensors to be on the same device". Fix?</summary><div class="qa-body">Some tensor (batch, label, or a tensor created inside <code>forward</code>) is on CPU. Move batches with <code>.to(device)</code>; create new tensors with <code>device=x.device</code>; register constants as buffers so <code>model.to()</code> moves them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Memory grows every iteration until CUDA OOM. Likely causes?</summary><div class="qa-body">Accumulating <code>loss</code> instead of <code>loss.item()</code>; storing outputs with graphs for logging; validation without <code>no_grad()</code>. Then: smaller batch, mixed precision, gradient checkpointing, accumulation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you freeze a pretrained backbone and train only a new head?</summary><div class="qa-body">Set <code>requires_grad=False</code> on backbone params, replace the final layer (new layers are trainable by default), give the optimizer only trainable params. Later unfreeze top blocks with param groups: low lr (1e-5–1e-4) for backbone, higher for head.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>view</code> vs <code>reshape</code>?</summary><div class="qa-body"><code>view</code> never copies and needs a compatible (contiguous) memory layout; it errors after <code>.T</code>/<code>permute</code>. <code>reshape</code> returns a view when it can and copies otherwise. Use <code>reshape</code> unless you need the no-copy guarantee.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a Dataset need, and what does the DataLoader add?</summary><div class="qa-body">Dataset: <code>__len__</code> and <code>__getitem__(i)</code> returning one example. DataLoader: batching (collate), shuffling, parallel workers, pinned memory, <code>drop_last</code>. Heavy per-item work belongs in <code>__getitem__</code> so workers parallelize it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a fresh 2-class model start near loss 0.69, and why is that useful?</summary><div class="qa-body">Random logits ≈ uniform probabilities → CE = ln 2 ≈ 0.693 (ln C for C classes). If step-0 loss is far off, labels, the loss function or init are wrong; catch it before a long run.</div></details>
</main>`
});
