// dl/dl_cnns.js — CNNs
Object.assign(TOPIC_CONTENT, {
  "dl_cnns": `<main>
  <h1>CNNs — Convolutional Neural Networks</h1>
  <p class="lead">A CNN is a neural network made for images. It slides small filters over the picture to find edges, then shapes, then objects. This page covers convolution, padding, stride, pooling, how to stack layers, ResNet, EfficientNet and transfer learning. It builds on neural-network basics and PyTorch. All code ran here (PyTorch 2.14 CPU, numpy).</p>

  <h2 id="dc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">CNNs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why convolutions</div>
        <ul>
          <li><b>MLP on 224×224×3</b> — 150K inputs × 1000 units = 150.5M params in layer 1</li>
          <li><b>Conv2d(3,64,3)</b> — 64·3·3·3 + 64 = <b>1,792</b> params</li>
          <li><b>Locality</b> — each output sees only a small patch (receptive field)</li>
          <li><b>Parameter sharing</b> — same filter at every position</li>
          <li><b>Translation equivariance</b> — shift input → feature map shifts too</li>
          <li>💡 One rubber stamp pressed on every spot of the page</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Convolution op</div>
        <ul>
          <li><b>Output(i,j)</b> — Σ kernel · patch(i,j) + bias (dot product)</li>
          <li><b>Kernel depth</b> = input channels; 3×3 on RGB is really 3×3×3</li>
          <li><b>One kernel → one feature map</b>; 64 kernels → 64 channels</li>
          <li><b>Weight shape</b> — (out_ch, in_ch, k, k)</li>
          <li>Sobel on a dark|bright edge → 36 at the edge, 0 on flat areas</li>
          <li>⚠ DL "convolution" is cross-correlation (kernel not flipped) — learned, so no matter</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Padding &amp; stride</div>
        <ul>
          <li><b>Formula</b> — out = ⌊(W − K + 2P) / S⌋ + 1</li>
          <li><b>Same padding</b> — K=3, P=1, S=1 keeps size</li>
          <li><b>Stride 2</b> — halves size (learned downsampling)</li>
          <li><b>1×1 conv</b> — mixes channels, no spatial change; cheap bottleneck</li>
          <li>Ex: 32, K=5, P=2, S=2 → ⌊31/2⌋+1 = 16; ResNet stem 224 → 112</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pooling</div>
        <ul>
          <li><b>Max pool 2×2</b> — keep the strongest response; halves H and W</li>
          <li><b>Avg pool</b> — mean of window; smoother</li>
          <li><b>Global avg pool</b> — H×W → 1 per channel, replaces big FC layers</li>
          <li>No learnable params; small local shift-invariance</li>
          <li>⚠ Modern nets often use stride-2 conv instead (learned)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Architecture design</div>
        <ul>
          <li><b>Recipe</b> — [conv-BN-ReLU] ×n → downsample, repeat; GAP → linear</li>
          <li><b>Shape trend</b> — spatial ↓, channels ↑ (32→64→128)</li>
          <li><b>Hierarchy</b> — edges → textures → parts → objects</li>
          <li><b>VGG idea</b> — two 3×3 = one 5×5 view, 28% fewer params, extra ReLU</li>
          <li>LeNet → AlexNet (ReLU, GPU) → VGG (depth) → ResNet (skips) → EfficientNet (scaling)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ResNet</div>
        <ul>
          <li><b>Degradation</b> — deeper plain nets got worse <em>training</em> error</li>
          <li><b>Residual block</b> — y = F(x) + x; layers learn the change</li>
          <li><b>Identity is easy</b> — just push F → 0</li>
          <li><b>Gradient</b> — ∂y/∂x = ∂F/∂x + 1 → highway to early layers</li>
          <li>50-layer demo: first-layer grad 1e-14 plain vs 16 with skips</li>
          <li><b>1×1 projection</b> on the skip when shapes change</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">EfficientNet</div>
        <ul>
          <li><b>Compound scaling</b> — grow depth, width, resolution together</li>
          <li>depth α<sup>φ</sup>, width β<sup>φ</sup>, res γ<sup>φ</sup>; α=1.2, β=1.1, γ=1.15</li>
          <li><b>α·β²·γ² ≈ 2</b> → FLOPs ≈ 2<sup>φ</sup></li>
          <li>B0 (5.3M) ≈ ResNet-50 (25.6M) accuracy</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Transfer learning</div>
        <ul>
          <li><b>Freeze backbone</b>, new head → train head (small data)</li>
          <li><b>Then unfreeze top stages</b>, LR 1e-5 vs head 1e-3 (param groups)</li>
          <li><b>Big data / far domain</b> — fine-tune all, still from pretrained</li>
          <li>⚠ High LR on pretrained layers → catastrophic forgetting</li>
          <li>Always: same preprocessing (resize, ImageNet mean/std) + augmentation</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Convolutions</span><span class="rm-sub">150M params vs 1,792</span></div></div>
      <div class="rm-item rm-done" data-target="dc-conv"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Convolution Operation</span><span class="rm-sub">Slide, multiply, sum</span></div></div>
      <div class="rm-item rm-done" data-target="dc-maps"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Filters &amp; Feature Maps</span><span class="rm-sub">Channels in, channels out</span></div></div>
      <div class="rm-item rm-done" data-target="dc-pad"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Padding &amp; Stride</span><span class="rm-sub">The output-size formula</span></div></div>
      <div class="rm-item rm-done" data-target="dc-pool"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Pooling</span><span class="rm-sub">Max, average, global</span></div></div>
      <div class="rm-item rm-done" data-target="dc-arch"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Architecture Design</span><span class="rm-sub">Conv-ReLU-pool stacks</span></div></div>
      <div class="rm-item rm-done" data-target="dc-res"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">ResNet Skip Connections</span><span class="rm-sub">The gradient highway</span></div></div>
      <div class="rm-item rm-done" data-target="dc-eff"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">EfficientNet Scaling</span><span class="rm-sub">Depth × width × resolution</span></div></div>
      <div class="rm-item rm-done" data-target="dc-tl"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Transfer Learning</span><span class="rm-sub">Freeze, replace head, unfreeze</span></div></div>
      <div class="rm-item rm-done" data-target="dc-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dc-why"><span class="num">01</span>Why Convolutions</h2>
  <p>A convolution layer looks at an image through a small window and reuses the same weights everywhere. A plain fully connected layer (MLP) links every pixel to every neuron. For a phone photo that means far too many weights.</p>
  <div class="fx" data-lang="py">import torch.nn as nn
mlp  = nn.Linear(224*224*3, 1000)          # fully connected on a flattened image
conv = nn.Conv2d(3, 64, kernel_size=3)     # 64 small filters
n = lambda m: sum(p.numel() for p in m.parameters())
print(f"MLP first layer : {n(mlp):,}")
print(f"Conv2d(3,64,3)  : {n(conv):,}   weight shape {tuple(conv.weight.shape)}")</div>
  <div class="fx" data-lang="text">MLP first layer : 150,529,000
Conv2d(3,64,3)  : 1,792   weight shape (64, 3, 3, 3)</div>
  <table class="tbl">
    <tr><th>Problem with an MLP on images</th><th>CNN fix</th></tr>
    <tr><td>Huge parameter count, overfits</td><td><strong>Parameter sharing</strong>: one 3×3 filter reused at every position</td></tr>
    <tr><td>Ignores which pixels are neighbours</td><td><strong>Locality</strong>: each output looks at a small patch</td></tr>
    <tr><td>A cat at top-left and bottom-right need separate weights</td><td><strong>Translation equivariance</strong>: the same filter fires wherever the pattern is</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A rubber stamp of an edge. You press it on every spot of the page and note how well it matches. One stamp is used everywhere. You don't need a new stamp for each spot.</p>
  </div>

  <h2 id="dc-conv"><span class="num">02</span>The Convolution Operation</h2>
  <p>A <strong>kernel</strong> (filter) is a small grid of weights, like 3×3. It sits on one patch of the image, multiplies cell by cell, and adds everything up. That gives one output number. Then it moves one step and repeats.</p>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600">
<defs><marker id="dc-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="95" y="25" text-anchor="middle">Input 5×5</text>
<g stroke="currentColor" fill="none" stroke-opacity="0.35">
<rect x="20" y="40" width="150" height="150"/>
<path d="M50,40 V190 M80,40 V190 M110,40 V190 M140,40 V190 M20,70 H170 M20,100 H170 M20,130 H170 M20,160 H170"/>
</g>
<rect x="50" y="40" width="90" height="90" class="fb sb" fill-opacity="0.8" stroke-width="2"/>
<g text-anchor="middle">
<text x="35" y="60">0</text><text x="65" y="60">0</text><text x="95" y="60">0</text><text x="125" y="60">9</text><text x="155" y="60">9</text>
<text x="35" y="90">0</text><text x="65" y="90">0</text><text x="95" y="90">0</text><text x="125" y="90">9</text><text x="155" y="90">9</text>
<text x="35" y="120">0</text><text x="65" y="120">0</text><text x="95" y="120">0</text><text x="125" y="120">9</text><text x="155" y="120">9</text>
<text x="35" y="150">0</text><text x="65" y="150">0</text><text x="95" y="150">0</text><text x="125" y="150">9</text><text x="155" y="150">9</text>
<text x="35" y="180">0</text><text x="65" y="180">0</text><text x="95" y="180">0</text><text x="125" y="180">9</text><text x="155" y="180">9</text>
</g>
<line x1="175" y1="100" x2="225" y2="100" stroke="currentColor" marker-end="url(#dc-ar1)"/>
<text x="200" y="90" text-anchor="middle">⊙</text>
<text x="275" y="55" text-anchor="middle">Kernel 3×3</text>
<rect x="230" y="70" width="90" height="90" class="fv" stroke="currentColor" stroke-opacity="0.5"/>
<g stroke="currentColor" stroke-opacity="0.35"><path d="M260,70 V160 M290,70 V160 M230,100 H320 M230,130 H320"/></g>
<g text-anchor="middle">
<text x="245" y="90">-1</text><text x="275" y="90">0</text><text x="305" y="90">1</text>
<text x="245" y="120">-2</text><text x="275" y="120">0</text><text x="305" y="120">2</text>
<text x="245" y="150">-1</text><text x="275" y="150">0</text><text x="305" y="150">1</text>
</g>
<text x="275" y="180" text-anchor="middle" class="tm">Sobel: dark→bright?</text>
<line x1="330" y1="100" x2="425" y2="100" stroke="currentColor" marker-end="url(#dc-ar1)"/>
<text x="378" y="90" text-anchor="middle">Σ = 36</text>
<text x="485" y="55" text-anchor="middle">Feature map 3×3</text>
<rect x="440" y="70" width="90" height="90" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<rect x="470" y="70" width="30" height="30" class="ft st" stroke-width="2"/>
<g stroke="currentColor" stroke-opacity="0.35"><path d="M470,70 V160 M500,70 V160 M440,100 H530 M440,130 H530"/></g>
<g text-anchor="middle">
<text x="455" y="90">0</text><text x="485" y="90">36</text><text x="515" y="90">36</text>
<text x="455" y="120">0</text><text x="485" y="120">36</text><text x="515" y="120">36</text>
<text x="455" y="150">0</text><text x="485" y="150">36</text><text x="515" y="150">36</text>
</g>
<text x="300" y="215" text-anchor="middle" class="tm">patch(0,1) · kernel = 9·1 + 9·2 + 9·1 = 36 → slide one step right, repeat</text>
</svg><figcaption>The blue 3×3 patch times the kernel, summed, gives one output cell (teal). Slide and repeat.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>out(i, j) = Σ<sub>m,n</sub> kernel(m, n) · input(i+m, j+n) + bias. A dot product between the kernel and the patch under it.</p>
  </div>
  <div class="fx" data-lang="py">import numpy as np
img = np.array([[0,0,0,9,9]] * 5, float)    # dark left, bright right
K = np.array([[-1,0,1],
              [-2,0,2],
              [-1,0,1]], float)              # vertical-edge (Sobel) kernel
out = np.zeros((3, 3))
for i in range(3):
    for j in range(3):
        out[i, j] = (img[i:i+3, j:j+3] * K).sum()
print(out)</div>
  <div class="fx" data-lang="text">[[ 0. 36. 36.]
 [ 0. 36. 36.]
 [ 0. 36. 36.]]</div>
  <p>Flat region → 0. Patch straddling the edge → 36. <code>F.conv2d</code> on the same input gives the identical tensor.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A torch moving over a dark wall, one spot at a time. At each spot you ask one question: "does this look like my pattern?" Write each answer on a grid. That grid is the feature map.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deep-learning "convolution" is really cross-correlation: the kernel isn't flipped. Since weights are learned, it makes no difference.</p>
  </div>

  <h2 id="dc-maps"><span class="num">03</span>Filters &amp; Feature Maps</h2>
  <p>One filter finds one pattern. A layer has many filters, so it finds many patterns at once. Each filter gives one output grid, called a <strong>feature map</strong>.</p>
  <div class="flow"><span>Input: C<sub>in</sub> × H × W</span><span>Each filter: C<sub>in</sub> × k × k</span><span>One filter → one 2-D map</span><span>Output: C<sub>out</sub> × H′ × W′</span></div>
  <div class="cards">
    <div><b>Filter (kernel)</b><p>Learned weights spanning <em>all</em> input channels.</p><small>3×3 on RGB = 27 weights + 1 bias</small></div>
    <div><b>Feature map</b><p>The filter's response at every position.</p><small>Bright = pattern present</small></div>
    <div><b>Channels</b><p>Number of filters = output depth.</p><small>64 filters → 64 maps</small></div>
  </div>
  <p>Learned filters in layer 1 look like edge and colour-blob detectors; deeper filters combine those maps into textures, parts, then objects.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Counting params as 64·3·3 + 64. The kernel has depth = input channels: 64·<strong>3</strong>·3·3 + 64 = 1,792. Next layer Conv2d(64,128,3) = 128·64·9 + 128 = 73,856.</p>
  </div>

  <h2 id="dc-pad"><span class="num">04</span>Padding &amp; Stride</h2>
  <p><strong>Padding</strong> adds a border of zeros around the image, so the output doesn't shrink and edge pixels still count. <strong>Stride</strong> is how many pixels the filter jumps each step; stride 2 halves the size.</p>
  <div class="callout def"><span class="label">Formula</span>
    <p><strong>out = ⌊(W − K + 2P) / S⌋ + 1</strong> — W input size, K kernel, P zero-padding per side, S stride (step).</p>
  </div>
  <div class="callout pred"><span class="label">Worked example</span>
    <p>Input 32×32, K=5, P=2, S=2 → (32 − 5 + 4) / 2 = 15.5 → floor 15 → +1 = <strong>16</strong>.</p>
  </div>
  <div class="fx" data-lang="py">x = torch.randn(1, 3, 32, 32)
def size(W, K, P, S): return (W - K + 2*P) // S + 1
for K, P, S in [(3,0,1), (3,1,1), (5,2,2), (3,1,2), (1,0,1)]:
    y = nn.Conv2d(3, 8, K, stride=S, padding=P)(x)
    print(f"K={K} P={P} S={S}: formula {size(32,K,P,S):&gt;2}  torch {tuple(y.shape)}")
print("ResNet stem 224, K=7 P=3 S=2 -&gt;", size(224,7,3,2))</div>
  <div class="fx" data-lang="text">K=3 P=0 S=1: formula 30  torch (1, 8, 30, 30)
K=3 P=1 S=1: formula 32  torch (1, 8, 32, 32)
K=5 P=2 S=2: formula 16  torch (1, 8, 16, 16)
K=3 P=1 S=2: formula 16  torch (1, 8, 16, 16)
K=1 P=0 S=1: formula 32  torch (1, 8, 32, 32)
ResNet stem 224, K=7 P=3 S=2 -&gt; 112</div>
  <table class="tbl">
    <tr><th>Setting</th><th>Effect</th><th>Used for</th></tr>
    <tr><td>P=0 ("valid")</td><td>Shrinks by K−1</td><td>Old nets; border pixels under-used</td></tr>
    <tr><td>K=3, P=1, S=1 ("same")</td><td>Size kept</td><td>Default inside a stage</td></tr>
    <tr><td>S=2</td><td>Size halved</td><td>Learned downsampling (ResNet)</td></tr>
    <tr><td>K=1</td><td>Only channels change</td><td>Cheap channel mixing / bottlenecks</td></tr>
  </table>

  <h2 id="dc-pool"><span class="num">05</span>Pooling</h2>
  <p>Pooling shrinks a feature map by summarising each small window (say 2×2) as one number. It has no weights. It makes later layers cheaper and a little less sensitive to small shifts.</p>
  <div class="fx" data-lang="py">fm = np.array([[1,3,2,0],
               [5,6,1,2],
               [0,2,9,4],
               [1,1,3,8]], float)
blocks = fm.reshape(2,2,2,2).swapaxes(1,2)   # 2×2 grid of 2×2 windows
print("max pool:\\n", blocks.max(axis=(2,3)))
print("avg pool:\\n", blocks.mean(axis=(2,3)))</div>
  <div class="fx" data-lang="text">max pool:
 [[6. 2.]
 [2. 9.]]
avg pool:
 [[3.75 1.25]
 [1.   6.  ]]</div>
  <div class="cards">
    <div><b>Max pool</b><p>"Was the feature anywhere in this window?"</p><small>Halves H, W; 0 params</small></div>
    <div><b>Average pool</b><p>Smooth summary of the window.</p><small>Keeps weak signals</small></div>
    <div><b>Global average pool</b><p>Each channel's whole map → 1 number.</p><small>Before the classifier; replaces huge FC layers</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Max pooling is like each bench in a class sending only its top marks to the teacher. The teacher knows the best score per bench, not who sat where.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pooling throws away position and the other 3 values. Modern nets (ResNet) mostly downsample with stride-2 convs, which learn what to keep; global average pooling stays at the end.</p>
  </div>

  <h2 id="dc-arch"><span class="num">06</span>Architecture Design</h2>
  <p>A CNN is built by repeating one block: conv, then ReLU, then shrink. Each round makes the image smaller and adds more filters. At the end, one linear layer gives the class scores.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
<defs><marker id="dc-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="15" y="40" width="80" height="80" class="fs" stroke="currentColor"/>
<text x="55" y="85" text-anchor="middle">3×32×32</text>
<rect x="125" y="40" width="80" height="80" class="fb sb"/>
<rect x="133" y="48" width="80" height="80" class="fb sb"/>
<text x="173" y="93" text-anchor="middle">32×16×16</text>
<rect x="250" y="55" width="55" height="55" class="ft st"/>
<rect x="258" y="63" width="55" height="55" class="ft st"/>
<rect x="266" y="71" width="55" height="55" class="ft st"/>
<text x="293" y="145" text-anchor="middle">64×8×8</text>
<rect x="355" y="65" width="40" height="40" class="fv" stroke="currentColor"/>
<rect x="361" y="71" width="40" height="40" class="fv" stroke="currentColor"/>
<rect x="367" y="77" width="40" height="40" class="fv" stroke="currentColor"/>
<rect x="373" y="83" width="40" height="40" class="fv" stroke="currentColor"/>
<text x="385" y="145" text-anchor="middle">128×8×8</text>
<rect x="448" y="40" width="22" height="90" class="fg sg"/>
<text x="459" y="145" text-anchor="middle">128</text>
<rect x="520" y="62" width="22" height="45" class="fr sr"/>
<text x="531" y="145" text-anchor="middle">10</text>
<g stroke="currentColor" marker-end="url(#dc-ar2)">
<line x1="97" y1="80" x2="122" y2="80"/><line x1="216" y1="88" x2="246" y2="88"/><line x1="324" y1="95" x2="351" y2="95"/><line x1="416" y1="95" x2="444" y2="95"/><line x1="472" y1="85" x2="516" y2="85"/>
</g>
<g class="tm" text-anchor="middle">
<text x="165" y="25">conv-ReLU-pool</text><text x="290" y="40">conv-ReLU-pool</text><text x="390" y="55">conv-ReLU</text><text x="459" y="25">GAP</text><text x="531" y="50">Linear</text>
</g>
<text x="300" y="178" text-anchor="middle" class="tm">spatial size ↓ · channels ↑ · edges → textures → parts → class</text>
</svg><figcaption>The classic recipe: each stage halves the image and doubles the filters, then global-average-pool and a linear head.</figcaption></figure>
  <div class="fx" data-lang="py">net = nn.Sequential(
    nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),   # block 1
    nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),  # block 2
    nn.Conv2d(64, 128, 3, padding=1), nn.ReLU(),                  # block 3
    nn.AdaptiveAvgPool2d(1), nn.Flatten(),                        # global average pool
    nn.Linear(128, 10))                                           # classifier head
x = torch.randn(8, 3, 32, 32)
for layer in net:
    x = layer(x)
    if not isinstance(layer, nn.ReLU):
        print(f"{layer.__class__.__name__:18s} {tuple(x.shape)}")
print("params:", sum(p.numel() for p in net.parameters()))</div>
  <div class="fx" data-lang="text">Conv2d             (8, 32, 32, 32)
MaxPool2d          (8, 32, 16, 16)
Conv2d             (8, 64, 16, 16)
MaxPool2d          (8, 64, 8, 8)
Conv2d             (8, 128, 8, 8)
AdaptiveAvgPool2d  (8, 128, 1, 1)
Flatten            (8, 128)
Linear             (8, 10)
params: 94538</div>
  <p>In practice add <code>BatchNorm2d</code> after each conv (conv-BN-ReLU). Each layer's receptive field grows, so deep layers "see" large regions.</p>
  <table class="tbl">
    <tr><th>Net</th><th>Year</th><th>What it fixed</th><th>Top-5 (ImageNet)</th><th>Params</th></tr>
    <tr><td>LeNet-5</td><td>1998</td><td>Proved CNNs on digits</td><td>—</td><td>60K</td></tr>
    <tr><td>AlexNet</td><td>2012</td><td>Depth on GPUs; ReLU, dropout</td><td>84.7%</td><td>60M</td></tr>
    <tr><td>VGG-16</td><td>2014</td><td>Depth via stacked 3×3 convs</td><td>92.7%</td><td>138M</td></tr>
    <tr><td>ResNet-50</td><td>2015</td><td>Skip connections; trains 150+ layers</td><td>~93%</td><td>25.6M</td></tr>
    <tr><td>EfficientNet-B4</td><td>2019</td><td>Compound scaling</td><td>96.4%</td><td>19M</td></tr>
  </table>
  <div class="callout intu"><span class="label">Why 3×3 everywhere (VGG)</span>
    <p>Two stacked 3×3 convs see a 5×5 region. With 64 channels: 2·9·64·64 = 73,728 weights vs 25·64·64 = 102,400 for one 5×5 — 28% fewer, plus an extra ReLU.</p>
  </div>

  <h2 id="dc-res"><span class="num">07</span>ResNet Skip Connections</h2>
  <p>A <strong>skip connection</strong> adds a block's input straight to its output: y = F(x) + x. It lets very deep networks (50–150 layers) train.</p>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600">
<defs><marker id="dc-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="130" y="20" text-anchor="middle">Plain block</text>
<text x="130" y="45" text-anchor="middle">x</text>
<rect x="60" y="60" width="140" height="34" rx="6" class="fs" stroke="currentColor"/>
<text x="130" y="82" text-anchor="middle">conv-BN-ReLU</text>
<rect x="60" y="118" width="140" height="34" rx="6" class="fs" stroke="currentColor"/>
<text x="130" y="140" text-anchor="middle">conv-BN</text>
<text x="130" y="195" text-anchor="middle">y = H(x)</text>
<g stroke="currentColor" marker-end="url(#dc-ar3)"><line x1="130" y1="50" x2="130" y2="58"/><line x1="130" y1="94" x2="130" y2="116"/><line x1="130" y1="152" x2="130" y2="180"/></g>
<text x="130" y="225" text-anchor="middle" class="tr">must learn the whole H(x)</text>
<text x="420" y="20" text-anchor="middle">Residual block</text>
<text x="400" y="45" text-anchor="middle">x</text>
<rect x="330" y="60" width="140" height="34" rx="6" class="fb sb"/>
<text x="400" y="82" text-anchor="middle">conv-BN-ReLU</text>
<rect x="330" y="118" width="140" height="34" rx="6" class="fb sb"/>
<text x="400" y="140" text-anchor="middle">conv-BN → F(x)</text>
<circle cx="400" cy="178" r="12" class="fg sg"/>
<text x="400" y="183" text-anchor="middle">+</text>
<g stroke="currentColor" marker-end="url(#dc-ar3)"><line x1="400" y1="50" x2="400" y2="58"/><line x1="400" y1="94" x2="400" y2="116"/><line x1="400" y1="152" x2="400" y2="164"/><line x1="400" y1="190" x2="400" y2="203"/></g>
<path d="M408,40 H530 V178 H414" fill="none" class="sg" stroke-width="2.5" marker-end="url(#dc-ar3)"/>
<text x="538" y="110" class="tg">identity</text>
<text x="400" y="220" text-anchor="middle">y = F(x) + x</text>
<text x="400" y="242" text-anchor="middle" class="tg">∂y/∂x = ∂F/∂x + 1</text>
</svg><figcaption>The green shortcut adds x back, so the layers only learn the change F(x), and gradients get a "+1" path straight back.</figcaption></figure>
  <ul>
    <li><strong>Problem:</strong> past ~20 layers, plain nets had <em>higher training error</em> (degradation) — an optimisation failure, not overfitting.</li>
    <li><strong>Fix:</strong> if the best block is identity, a residual block just drives F(x) → 0, which is easy.</li>
    <li><strong>Gradient:</strong> the "+1" carries signal to early layers even when ∂F/∂x is tiny.</li>
  </ul>
  <div class="fx" data-lang="py">class Block(nn.Module):
    def __init__(self, d, skip):
        super().__init__(); self.f = nn.Sequential(nn.Linear(d, d), nn.Tanh()); self.skip = skip
    def forward(self, x):
        return x + self.f(x) if self.skip else self.f(x)      # F(x) + x   vs   F(x)
for skip in (False, True):
    torch.manual_seed(0)
    net = nn.Sequential(*[Block(64, skip) for _ in range(50)])   # 50 layers deep
    net(torch.randn(32, 64)).pow(2).mean().backward()
    print(f"skip={skip!s:5}  grad first layer {net[0].f[0].weight.grad.norm():.2e}"
          f"   last layer {net[-1].f[0].weight.grad.norm():.2e}")</div>
  <div class="fx" data-lang="text">skip=False  grad first layer 1.31e-14   last layer 1.45e-02
skip=True   grad first layer 1.63e+01   last layer 5.71e+00</div>
  <p>Without skips the first layer gets essentially zero gradient. (Real ResNets add BatchNorm, which keeps the residual path's scale in check.)</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Correcting a homework answer instead of writing it again from scratch. Each block only adds small corrections to x. If nothing needs fixing, it leaves the answer as it is.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>When a block changes shape (stride 2, more channels), x can't be added directly. The shortcut then uses a 1×1 conv with stride 2 (projection shortcut).</p>
  </div>

  <h2 id="dc-eff"><span class="num">08</span>EfficientNet Scaling</h2>
  <p>To make a CNN more accurate you can make it deeper, wider, or feed it bigger images. EfficientNet's idea: grow all three together, in a fixed ratio. That gives more accuracy for the same compute than growing just one.</p>
  <div class="cards">
    <div><b>Deeper</b><p>More layers: bigger receptive field, harder to train.</p><small>ResNet-18 → 152</small></div>
    <div><b>Wider</b><p>More channels: finer features, saturates fast.</p><small>Wide ResNet</small></div>
    <div><b>Higher resolution</b><p>More pixels: small details, costs ∝ r².</p><small>224 → 380</small></div>
    <div><b>Compound</b><p>Grow all three in a fixed ratio.</p><small>EfficientNet B0 → B7</small></div>
  </div>
  <div class="fx" data-lang="py">a, b, g = 1.2, 1.1, 1.15                 # grid-searched once on B0
print("a*b^2*g^2 =", round(a*b*b*g*g, 3))  # FLOPs grow ~ d * w^2 * r^2
for phi in [0, 1, 2, 3]:
    print(phi, "depth x%.2f width x%.2f res %d  FLOPs x%.1f"
          % (a**phi, b**phi, round(224*g**phi), (a*b*b*g*g)**phi))</div>
  <div class="fx" data-lang="text">a*b^2*g^2 = 1.92
0 depth x1.00 width x1.00 res 224  FLOPs x1.0
1 depth x1.20 width x1.10 res 258  FLOPs x1.9
2 depth x1.44 width x1.21 res 296  FLOPs x3.7
3 depth x1.73 width x1.33 res 341  FLOPs x7.1</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cooking for more guests. You increase rice, dal and water together. Doubling only the rice gives a bad meal.</p>
  </div>
  <p>A bigger image needs more layers (to see it all) and more channels (to capture its finer patterns). B0 (5.3M params, MBConv blocks found by architecture search) matches ResNet-50 (25.6M). (The released B1–B7 use rounded resolutions such as 240, 260, 300.)</p>

  <h2 id="dc-tl"><span class="num">09</span>Transfer Learning with Pretrained CNNs</h2>
  <p>Transfer learning means starting from a CNN already trained on a big dataset (ImageNet, 1.2M photos) and adapting it to your task. You need far less data, because edges and shapes are already learned.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
<g text-anchor="middle">
<rect x="10" y="30" width="105" height="44" rx="5" class="fs" stroke="currentColor"/><text x="62" y="50">stem +</text><text x="62" y="66">layer1</text>
<rect x="125" y="30" width="105" height="44" rx="5" class="fs" stroke="currentColor"/><text x="177" y="57">layer2</text>
<rect x="240" y="30" width="105" height="44" rx="5" class="fs" stroke="currentColor"/><text x="292" y="57">layer3</text>
<rect x="355" y="30" width="105" height="44" rx="5" class="fb sb"/><text x="407" y="57">layer4</text>
<rect x="470" y="30" width="115" height="44" rx="5" class="fg sg"/><text x="527" y="50">new head</text><text x="527" y="66">Linear(512,3)</text>
<text x="177" y="20" class="tm">edges · textures (generic)</text>
<text x="407" y="20" class="tm">object parts</text>
<text x="177" y="96">frozen</text><text x="177" y="112" class="tm">(or LR 1e-5)</text>
<text x="407" y="96" class="tb">unfreeze 2nd</text><text x="407" y="112" class="tb">LR 1e-5</text>
<text x="527" y="96" class="tg">train 1st</text><text x="527" y="112" class="tg">LR 1e-3</text>
<text x="300" y="140" class="tm">small data: head only · more: unfreeze top-down · lots: all</text>
</g>
</svg><figcaption>Early layers are generic and stay frozen; the head trains first; top stages are unfrozen later with a tiny learning rate.</figcaption></figure>
  <div class="fx" data-lang="py">import torchvision
m = torchvision.models.resnet18(weights=None)   # real use: weights=ResNet18_Weights.DEFAULT
for p in m.parameters():
    p.requires_grad = False                     # freeze the backbone
m.fc = nn.Linear(m.fc.in_features, 3)           # new head: 3 classes (trainable)
n = lambda ps: sum(p.numel() for p in ps)
print(f"total {n(m.parameters()):,}  trainable {n(p for p in m.parameters() if p.requires_grad):,}")
for p in m.layer4.parameters():
    p.requires_grad = True                      # stage 2: unfreeze the last stage
opt = torch.optim.AdamW([
    {"params": m.layer4.parameters(), "lr": 1e-5},   # pretrained: tiny LR
    {"params": m.fc.parameters(),     "lr": 1e-3}])  # new head: normal LR
print(f"trainable after unfreezing layer4 {n(p for p in m.parameters() if p.requires_grad):,}")</div>
  <div class="fx" data-lang="text">total 11,178,051  trainable 1,539
trainable after unfreezing layer4 8,395,267</div>
  <p><em>Ran with random weights (the sandbox can't download ImageNet weights); the counts are identical with pretrained weights.</em></p>
  <table class="tbl">
    <tr><th>Your data</th><th>Similar to ImageNet</th><th>Very different (X-ray, satellite)</th></tr>
    <tr><td>Small (&lt; 1K)</td><td>Freeze all, train head</td><td>Freeze early stages, fine-tune top + head</td></tr>
    <tr><td>Large (10K+)</td><td>Fine-tune top stages + head</td><td>Fine-tune everything, still init from pretrained</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket fielding coach moving to a hockey team. Fitness and footwork training carry over. Only the hockey-specific skills need teaching (the new head). Later, small adjustments to the rest.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fine-tuning pretrained layers at LR 1e-3 wipes out what they learned within a few epochs (catastrophic forgetting); it then does worse than frozen features. Use parameter groups with 10–100× lower LR, and the same resize + ImageNet mean/std normalisation the model was trained with.</p>
  </div>

  <h2 id="dc-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why CNNs instead of MLPs for images?</summary><div class="qa-body">(1) Parameters: an MLP's first layer on 224×224×3 with 1000 units has 150.5M weights; a 64-filter 3×3 conv has 1,792. (2) Locality: nearby pixels matter most, and convs only look at local patches. (3) Sharing gives translation equivariance: an edge detector fires anywhere without separate weights per position.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters in Conv2d(64, 128, kernel_size=3)?</summary><div class="qa-body">128 · 64 · 3 · 3 + 128 = 73,728 + 128 = <strong>73,856</strong>. Each of 128 filters spans all 64 input channels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Input 64×64, Conv K=3, P=0, S=2. Output size?</summary><div class="qa-body">⌊(64 − 3 + 0) / 2⌋ + 1 = ⌊30.5⌋ + 1 = <strong>31</strong>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a 1×1 convolution do?</summary><div class="qa-body">Mixes channels at each pixel without looking at neighbours: a per-pixel linear layer. Used to shrink or grow channel count cheaply (ResNet bottlenecks, Inception) and to add non-linearity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Max pooling vs strided convolution for downsampling?</summary><div class="qa-body">Max pooling is fixed and parameter-free: it keeps the max and discards position and other values. Strided conv learns what to keep. Modern nets mostly use strided convs, keeping global average pooling at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem do ResNet skip connections solve, and how?</summary><div class="qa-body">Degradation: plain nets got worse <em>training</em> error as depth grew (an optimisation problem, not overfitting). y = F(x) + x means a block can do identity by pushing F → 0, and ∂y/∂x = ∂F/∂x + 1 gives gradients a direct path. In our 50-layer demo the first layer's gradient was 1e-14 without skips and ~16 with them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why stack two 3×3 convs instead of one 5×5?</summary><div class="qa-body">Same 5×5 receptive field, fewer weights (18C² vs 25C², 28% fewer) and an extra non-linearity between them, so more expressive per parameter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is EfficientNet's key idea?</summary><div class="qa-body">Compound scaling: scale depth, width and resolution together (α<sup>φ</sup>, β<sup>φ</sup>, γ<sup>φ</sup> with α·β²·γ² ≈ 2, so FLOPs ≈ 2<sup>φ</sup>) instead of one dimension. Higher resolution needs more depth and width to use it. B0 matches ResNet-50 accuracy with ~5× fewer params.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You have 500 labelled medical scans. How do you build a classifier?</summary><div class="qa-body">Don't train from scratch. Load an ImageNet-pretrained ResNet/EfficientNet, freeze the backbone, replace the head (dropout + Linear to num_classes), train the head at LR ~1e-3. Heavy augmentation (flips, ±15° rotation, crops, colour jitter). If it plateaus, unfreeze the last stage at LR ~1e-5. Use stratified CV given the small set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fine-tuned model is worse than frozen features. Why?</summary><div class="qa-body">Catastrophic forgetting: too high an LR on pretrained layers overwrote good features, often while overfitting the small dataset. Fix with differential LRs (parameter groups), gradual unfreezing, and early stopping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the receptive field and why does it grow?</summary><div class="qa-body">The input region that affects one output unit. Each 3×3 conv adds 2 pixels; pooling/stride multiplies the growth. That's why deep layers can recognise whole objects while layer 1 sees only 3×3 edges.</div></details>
</main>`
});
