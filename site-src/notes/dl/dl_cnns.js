// dl/dl_cnns.js — CNNs
Object.assign(TOPIC_CONTENT, {
  "dl_cnns": `<main>
  <h1>CNNs — Convolutional Neural Networks</h1>
  <p class="lead">A CNN is a neural network made for images. It slides small filters over the picture to find edges, then shapes, then objects. This page computes a convolution by hand on a 4×4 input, then builds up channels, padding, stride, pooling, a full CNN (trained on real digit images), ResNet, EfficientNet and transfer learning, tracing the tensor shape at every step. It builds on <a class="xref" data-note="dl_foundations">NN Foundations</a> and <a class="xref" data-note="dl_pytorch">PyTorch</a>. All code ran here (PyTorch 2.14 CPU, NumPy).</p>

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
          <li><b>out(i,j)</b> — Σ kernel · patch(i,j) + bias (a dot product)</li>
          <li><b>4×4 input, 3×3 kernel</b> → 2×2 output; by hand [[−3, 4], [−5, 2]]</li>
          <li><b>ReLU after</b> → [[0, 4], [0, 2]]</li>
          <li><b>PyTorch layout</b> — input (N, C, H, W), weight (C_out, C_in, k, k)</li>
          <li>Sobel on dark|bright edge → 36 at the edge, 0 on flat areas</li>
          <li>⚠ DL "convolution" is cross-correlation (no kernel flip); learned, so no matter</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Channels</div>
        <ul>
          <li><b>Kernel depth</b> = input channels; 3×3 on RGB is really 3×3×3</li>
          <li><b>One filter → one feature map</b>; 64 filters → 64 channels</li>
          <li><b>Params</b> = C_out·C_in·k·k + C_out</li>
          <li>Conv2d(3,2,3) on (1,3,4,4) → (1,2,2,2); 56 params</li>
          <li>Conv2d(64,128,3) = 73,856 params</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Padding &amp; stride</div>
        <ul>
          <li><b>Formula</b> — out = ⌊(W − K + 2P) / S⌋ + 1</li>
          <li><b>Same padding</b> — K=3, P=1, S=1 keeps size (4×4 → 4×4)</li>
          <li><b>Stride 2</b> — halves size (learned downsampling)</li>
          <li><b>1×1 conv</b> — mixes channels only; cheap bottleneck</li>
          <li>Ex: 32, K=5, P=2, S=2 → 16; ResNet stem 224 → 112</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pooling</div>
        <ul>
          <li><b>Max pool 2×2</b> — keep the strongest response; halves H and W</li>
          <li><b>Avg pool</b> — mean of window; smoother</li>
          <li><b>Global avg pool</b> — (N, C, H, W) → (N, C); replaces big FC layers</li>
          <li>No learnable params; small local shift-tolerance</li>
          <li>⚠ Modern nets often use stride-2 conv instead (learned)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Architecture</div>
        <ul>
          <li><b>Recipe</b> — [conv-BN-ReLU] ×n → downsample, repeat; GAP → linear</li>
          <li><b>Shape trend</b> — spatial ↓, channels ↑ (3→32→64→128)</li>
          <li><b>Hierarchy</b> — edges → textures → parts → objects</li>
          <li><b>VGG idea</b> — two 3×3 = one 5×5 view, 28% fewer params, extra ReLU</li>
          <li><b>Digits demo</b> — CNN 98% test; 1-pixel shift: CNN holds up better than MLP</li>
          <li>LeNet → AlexNet → VGG → ResNet → EfficientNet</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ResNet</div>
        <ul>
          <li><b>Degradation</b> — deeper plain nets got worse <em>training</em> error</li>
          <li><b>Residual block</b> — y = F(x) + x; layers learn the change</li>
          <li><b>Gradient</b> — ∂y/∂x = ∂F/∂x + 1 → highway to early layers</li>
          <li>50-layer demo: first-layer grad 1e-14 plain vs 16 with skips</li>
          <li><b>1×1 projection</b> on the skip when shapes change (64→128, stride 2)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">EfficientNet &amp; transfer</div>
        <ul>
          <li><b>Compound scaling</b> — depth α<sup>φ</sup>, width β<sup>φ</sup>, res γ<sup>φ</sup>; α·β²·γ² ≈ 2</li>
          <li>B0 (5.3M) ≈ ResNet-50 (25.6M) accuracy</li>
          <li><b>ResNet-18 shapes</b> — 224 → 112 → 56 → 28 → 14 → 7 → GAP → 512 → fc</li>
          <li><b>Freeze backbone</b>, new head → train head; then unfreeze top stage at LR 1e-5</li>
          <li>⚠ High LR on pretrained layers → catastrophic forgetting</li>
          <li>Always: same preprocessing (resize, ImageNet mean/std)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Convolutions</span><span class="rm-sub">150M params vs 1,792</span></div></div>
      <div class="rm-item rm-done" data-target="dc-conv"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Convolution Operation</span><span class="rm-sub">A 4×4 input, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dc-maps"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Filters &amp; Feature Maps</span><span class="rm-sub">Channels in, channels out</span></div></div>
      <div class="rm-item rm-done" data-target="dc-pad"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Padding &amp; Stride</span><span class="rm-sub">The output-size formula</span></div></div>
      <div class="rm-item rm-done" data-target="dc-pool"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Pooling</span><span class="rm-sub">Max, average, global</span></div></div>
      <div class="rm-item rm-done" data-target="dc-arch"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Architecture Design</span><span class="rm-sub">Conv-ReLU-pool stacks</span></div></div>
      <div class="rm-item rm-done" data-target="dc-train"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Hands-on: Train a CNN</span><span class="rm-sub">Digits, CNN vs MLP</span></div></div>
      <div class="rm-item rm-done" data-target="dc-res"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">ResNet Skip Connections</span><span class="rm-sub">The gradient highway</span></div></div>
      <div class="rm-item rm-done" data-target="dc-eff"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">EfficientNet Scaling</span><span class="rm-sub">Depth × width × resolution</span></div></div>
      <div class="rm-item rm-done" data-target="dc-tl"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Transfer Learning</span><span class="rm-sub">Freeze, replace head, unfreeze</span></div></div>
      <div class="rm-item rm-done" data-target="dc-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Shapes, params, pretrained LR</span></div></div>
      <div class="rm-item rm-done" data-target="dc-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dc-why"><span class="num">01</span>Why Convolutions</h2>
  <p>Start from what you know: a plain neural network (an <strong>MLP</strong>, multi-layer perceptron) takes a list of numbers and connects every input to every neuron of the next layer. To feed it a photo, you flatten the picture into one long list of pixel values. That works for tiny images, but breaks for real ones, in three ways.</p>
  <p>First, size. A normal phone-sized input of 224 × 224 pixels with 3 colours is 150,528 numbers. A first layer of 1000 neurons needs 150,528 × 1000 weights: 150 million, for one layer. That is slow, memory-hungry, and overfits with any normal amount of data. Second, flattening throws away which pixels are neighbours; the network must rediscover that pixel 5 is next to pixel 6. Third, a cat in the top-left corner and a cat in the bottom-right touch completely different weights, so the network must learn "cat" separately for every position.</p>
  <p>A <strong>convolution layer</strong> fixes all three with one idea: look at the image through a small window (say 3 × 3 pixels), and reuse the same small set of weights at every position.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A rubber stamp of an edge. You press it on every spot of the page and note how well each spot matches. One stamp is used everywhere; you do not need a new stamp for each spot. The stamp has 9 dots of ink, no matter how big the page is.</p>
  </div>
  <p>Count it: 64 such stamps (filters), each 3 × 3 and spanning the 3 colours, plus one bias each, is 64 · 3 · 3 · 3 + 64 = 1,792 weights. The code compares both layers directly.</p>
  <div class="fx" data-lang="py">import torch, torch.nn as nn
mlp  = nn.Linear(224*224*3, 1000)          # fully connected on a flattened image
conv = nn.Conv2d(3, 64, kernel_size=3)     # 64 small filters
n = lambda m: sum(p.numel() for p in m.parameters())
print(f"MLP first layer : {n(mlp):,}")
print(f"Conv2d(3,64,3)  : {n(conv):,}   weight shape {tuple(conv.weight.shape)}")</div>
  <div class="fx" data-lang="text">MLP first layer : 150,529,000
Conv2d(3,64,3)  : 1,792   weight shape (64, 3, 3, 3)</div>
  <p>The MLP number is 150,528 × 1000 weights + 1000 biases. The conv weight shape (64, 3, 3, 3) reads as (filters out, channels in, kernel height, kernel width); that layout is used everywhere in PyTorch. The conv layer's size does not depend on the image size at all.</p>
  <table class="tbl">
    <tr><th>Problem with an MLP on images</th><th>CNN fix</th></tr>
    <tr><td>Huge parameter count, overfits</td><td><strong>Parameter sharing</strong>: one 3×3 filter reused at every position</td></tr>
    <tr><td>Ignores which pixels are neighbours</td><td><strong>Locality</strong>: each output looks at a small patch</td></tr>
    <tr><td>A cat at top-left and bottom-right need separate weights</td><td><strong>Translation equivariance</strong>: the same filter fires wherever the pattern is</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>convolutional neural network (CNN)</strong> is a network whose main layers are convolutions. <strong>Translation equivariance</strong>: shifting the input shifts the output map by the same amount. Where you meet CNNs: image classification, medical scans, defect detection on factory lines, OCR of invoices, the vision part of self-driving, and as the image encoder in many multimodal systems.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"CNNs are translation <em>invariant</em>." The convolution itself is equivariant (output moves with input). Some invariance comes later, from pooling and the final global pooling. Interviewers check this word.</p></div>

  <h2 id="dc-conv"><span class="num">02</span>The Convolution Operation</h2>
  <p>The operation is easier to do than to describe, so we do it by hand on a tiny image first. A <strong>kernel</strong> (or <strong>filter</strong>) is a small grid of weights, here 3 × 3. Place it on the top-left 3 × 3 patch of the image. Multiply each kernel weight by the pixel under it, and add the nine products. That sum is one output number. Slide the kernel one pixel right and repeat; at the end of the row, go one pixel down. The grid of sums is the output, called a <strong>feature map</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A torch beam moving over a wall, one spot at a time. At each spot you ask one question: "how much does this patch look like my pattern?" and write the answer on a grid. That grid is the feature map. A big positive number means "yes, strongly", near zero means "nothing here", negative means "the opposite pattern".</p>
  </div>
  <p>Our 4 × 4 input and our kernel. The kernel has +1 in its left column and −1 in its right column, so it asks: "is the left side of this patch brighter than the right side?" (a vertical-edge detector).</p>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600">
<defs><marker id="dc-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="80" y="25" text-anchor="middle">Input 4×4</text>
<rect x="20" y="40" width="90" height="90" class="fb sb" stroke-width="2"/>
<g stroke="currentColor" fill="none" stroke-opacity="0.4">
<rect x="20" y="40" width="120" height="120"/>
<path d="M50,40 V160 M80,40 V160 M110,40 V160 M20,70 H140 M20,100 H140 M20,130 H140"/>
</g>
<g text-anchor="middle">
<text x="35" y="60">3</text><text x="65" y="60">1</text><text x="95" y="60">0</text><text x="125" y="60">2</text>
<text x="35" y="90">1</text><text x="65" y="90">4</text><text x="95" y="90">2</text><text x="125" y="90">0</text>
<text x="35" y="120">0</text><text x="65" y="120">2</text><text x="95" y="120">5</text><text x="125" y="120">1</text>
<text x="35" y="150">2</text><text x="65" y="150">0</text><text x="95" y="150">1</text><text x="125" y="150">3</text>
</g>
<text x="170" y="105" text-anchor="middle">⊙</text>
<text x="245" y="25" text-anchor="middle">Kernel 3×3</text>
<rect x="200" y="55" width="90" height="90" class="fv sb"/>
<g stroke="currentColor" stroke-opacity="0.4"><path d="M230,55 V145 M260,55 V145 M200,85 H290 M200,115 H290"/></g>
<g text-anchor="middle">
<text x="215" y="75">1</text><text x="245" y="75">0</text><text x="275" y="75">-1</text>
<text x="215" y="105">1</text><text x="245" y="105">0</text><text x="275" y="105">-1</text>
<text x="215" y="135">1</text><text x="245" y="135">0</text><text x="275" y="135">-1</text>
</g>
<text x="245" y="165" text-anchor="middle" class="tm">left minus right</text>
<line x1="300" y1="100" x2="410" y2="100" stroke="currentColor" marker-end="url(#dc-ar1)"/>
<text x="355" y="90" text-anchor="middle">Σ = −3</text>
<text x="480" y="25" text-anchor="middle">Output 2×2</text>
<rect x="420" y="55" width="120" height="90" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<rect x="420" y="55" width="60" height="45" class="ft st" stroke-width="2"/>
<g stroke="currentColor" stroke-opacity="0.4"><path d="M480,55 V145 M420,100 H540"/></g>
<g text-anchor="middle">
<text x="450" y="83">−3</text><text x="510" y="83">4</text>
<text x="450" y="128">−5</text><text x="510" y="128">2</text>
</g>
<text x="300" y="200" text-anchor="middle" class="tm">blue patch ⊙ kernel = (3+1+0) − (0+2+5) = 4 − 7 = −3</text>
<text x="300" y="225" text-anchor="middle" class="tm">slide right 1 → 4 · down 1 → −5 · down-right → 2</text>
</svg><figcaption>The blue 3×3 patch times the kernel, summed, gives the teal output cell. A 3×3 kernel fits in a 4×4 image at 2 positions across and 2 down, so the output is 2×2.</figcaption></figure>
  <table class="tbl out"><caption>All four positions, by hand</caption>
    <tr><th>Output cell</th><th>Patch (rows, cols)</th><th>Left column sum</th><th>Right column sum</th><th>Left − right</th></tr>
    <tr><td>(0, 0)</td><td>rows 0–2, cols 0–2</td><td>3 + 1 + 0 = 4</td><td>0 + 2 + 5 = 7</td><td><strong>−3</strong></td></tr>
    <tr><td>(0, 1)</td><td>rows 0–2, cols 1–3</td><td>1 + 4 + 2 = 7</td><td>2 + 0 + 1 = 3</td><td><strong>4</strong></td></tr>
    <tr><td>(1, 0)</td><td>rows 1–3, cols 0–2</td><td>1 + 0 + 2 = 3</td><td>2 + 5 + 1 = 8</td><td><strong>−5</strong></td></tr>
    <tr><td>(1, 1)</td><td>rows 1–3, cols 1–3</td><td>4 + 2 + 0 = 6</td><td>0 + 1 + 3 = 4</td><td><strong>2</strong></td></tr>
  </table>
  <p>Written out in full for cell (0, 0), all nine products: 3·1 + 1·0 + 0·(−1) + 1·1 + 4·0 + 2·(−1) + 0·1 + 2·0 + 5·(−1) = 3 + 0 + 0 + 1 + 0 − 2 + 0 + 0 − 5 = −3. The middle column of the kernel is 0, so those pixels do not count, which is why the table only needs the two outer columns. Now the same in NumPy with two loops, and then with PyTorch's built-in <code>F.conv2d</code>:</p>
  <div class="fx" data-lang="py">import numpy as np, torch.nn.functional as F
X = np.array([[3, 1, 0, 2],
              [1, 4, 2, 0],
              [0, 2, 5, 1],
              [2, 0, 1, 3]], float)
K = np.array([[1, 0, -1],
              [1, 0, -1],
              [1, 0, -1]], float)
out = np.zeros((2, 2))                         # (4 - 3) + 1 = 2 positions each way
for i in range(2):
    for j in range(2):
        patch = X[i:i+3, j:j+3]                # the 3x3 window under the kernel
        out[i, j] = (patch * K).sum()          # multiply cell by cell, then add
        print(f"out[{i},{j}] = {out[i, j]:.0f}")
print(out)
print(np.maximum(out, 0))                      # ReLU: negatives become 0
xt = torch.tensor(X, dtype=torch.float32).reshape(1, 1, 4, 4)   # (N, C, H, W)
kt = torch.tensor(K, dtype=torch.float32).reshape(1, 1, 3, 3)   # (C_out, C_in, k, k)
print(xt.shape, kt.shape)
y = F.conv2d(xt, kt)
print(y.shape)
print(y)</div>
  <div class="fx" data-lang="text">out[0,0] = -3
out[0,1] = 4
out[1,0] = -5
out[1,1] = 2
[[-3.  4.]
 [-5.  2.]]
[[0. 4.]
 [0. 2.]]
torch.Size([1, 1, 4, 4]) torch.Size([1, 1, 3, 3])
torch.Size([1, 1, 2, 2])
tensor([[[[-3.,  4.],
          [-5.,  2.]]]])</div>
  <p>What happened: the loop's <code>X[i:i+3, j:j+3]</code> is the sliding window, and <code>(patch * K).sum()</code> is the multiply-and-add. All four numbers match the hand table. <code>np.maximum(out, 0)</code> is ReLU, which a CNN applies after almost every convolution: "keep only the places where the pattern was found". For PyTorch we had to <strong>reshape</strong> the 4 × 4 grid into (1, 1, 4, 4): batch of 1 image, 1 channel, 4 × 4 pixels. The kernel became (1, 1, 3, 3): 1 output map, 1 input channel, 3 × 3. <code>F.conv2d</code> returned (1, 1, 2, 2) with the same four numbers.</p>
  <p>On a cleaner picture the meaning jumps out. A 5 × 5 image that is dark on the left (0) and bright on the right (9), with the Sobel kernel [[−1, 0, 1], [−2, 0, 2], [−1, 0, 1]] (right minus left, centre row weighted twice), gives <code>[[0, 36, 36], [0, 36, 36], [0, 36, 36]]</code>: 0 where the patch is flat, 36 where it covers the edge (9·1 + 9·2 + 9·1 = 36).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>out(i, j) = Σ<sub>m,n</sub> kernel(m, n) · input(i+m, j+n) + bias. A dot product between the kernel and the patch under it. In a CNN the kernel values are not hand-picked like ours; they are <em>learned</em> by backpropagation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deep-learning "convolution" is really cross-correlation: the kernel is not flipped as in the maths/signal-processing definition. Since the weights are learned, it makes no difference, but interviewers sometimes ask.</p>
  </div>

  <h2 id="dc-maps"><span class="num">03</span>Filters &amp; Feature Maps</h2>
  <p>Our hand example had one grey channel and one filter. Real images have 3 channels (red, green, blue), and one filter can only detect one pattern. A layer that only finds vertical edges is not much use; we also want horizontal edges, corners, green blobs, and so on. So two things grow: the <strong>depth</strong> of each filter and the <strong>number</strong> of filters.</p>
  <p>In plain words: a filter always covers <em>all</em> input channels. On an RGB image a "3 × 3" filter is really 3 × 3 × 3 = 27 weights: one 3 × 3 slice per colour. It multiplies-and-adds over all 27 numbers under it, so it still produces one number per position, one 2-D map. A layer has many filters, and each produces its own map. Stack the maps and you get the output, whose number of channels equals the number of filters.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A panel of examiners checking an answer sheet. Each examiner (filter) looks for one thing, say handwriting or diagrams, and reads all pages (channels) of the sheet at once to give one mark per question (position). Ten examiners give ten mark-sheets (ten feature maps).</p></div>
  <div class="flow"><span>Input: C<sub>in</sub> × H × W</span><span>Each filter: C<sub>in</sub> × k × k</span><span>One filter → one 2-D map</span><span>Output: C<sub>out</sub> × H′ × W′</span></div>
  <p>Shape trace for a 3-channel 4 × 4 image through <code>Conv2d(3, 2, kernel_size=3)</code>: input (1, 3, 4, 4); weight (2, 3, 3, 3), i.e. 2 filters each 3 × 3 × 3; bias (2,); output (1, 2, 2, 2): 2 maps, each 2 × 2 as before. Parameters: 2·3·3·3 + 2 = 56. The code checks one output number by hand: filter 1 times the top-left 3 × 3 × 3 block, summed, plus bias 1.</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
x = torch.randint(0, 3, (1, 3, 4, 4)).float()      # 1 image, 3 channels, 4x4
conv = nn.Conv2d(in_channels=3, out_channels=2, kernel_size=3)
print("input ", tuple(x.shape))
print("weight", tuple(conv.weight.shape), " bias", tuple(conv.bias.shape))
y = conv(x)
print("output", tuple(y.shape))
manual = (x[0, :, 0:3, 0:3] * conv.weight[1]).sum() + conv.bias[1]   # (3,3,3) * (3,3,3)
print(round(manual.item(), 4), round(y[0, 1, 0, 0].item(), 4))
print(sum(p.numel() for p in conv.parameters()), 2*3*3*3 + 2)
print(sum(p.numel() for p in nn.Conv2d(64, 128, 3).parameters()))</div>
  <div class="fx" data-lang="text">input  (1, 3, 4, 4)
weight (2, 3, 3, 3)  bias (2,)
output (1, 2, 2, 2)
-0.4606 -0.4606
56 56
73856</div>
  <p>What happened: <code>x[0, :, 0:3, 0:3]</code> picks image 0, <em>all</em> channels, rows 0–2 and columns 0–2, a (3, 3, 3) block. <code>conv.weight[1]</code> is filter number 1, also (3, 3, 3). Multiply, sum all 27 products, add the bias: the result equals output channel 1 at position (0, 0). So a multi-channel convolution is the same multiply-and-add, just summed across channels too. Parameter counts: 56 for our layer, and 128·64·3·3 + 128 = 73,856 for a typical <code>Conv2d(64, 128, 3)</code>.</p>
  <div class="cards">
    <div><b>Filter (kernel)</b><p>Learned weights spanning <em>all</em> input channels.</p><small>3×3 on RGB = 27 weights + 1 bias</small></div>
    <div><b>Feature map</b><p>The filter's response at every position.</p><small>Bright = pattern present</small></div>
    <div><b>Channels</b><p>Number of filters = output depth.</p><small>64 filters → 64 maps</small></div>
  </div>
  <p>What do learned filters look like? In layer 1 of a trained network they are edge and colour-blob detectors, much like our hand kernel. Layer 2 filters look at layer-1 <em>maps</em>, so they detect combinations: corners, textures. Deeper layers detect parts (eyes, wheels) and then whole objects.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Feature map</strong>: the 2-D output of one filter. <strong>Channels</strong>: the stacked maps (for the input image, the colours). Conv weight shape: (C<sub>out</sub>, C<sub>in</sub>, k, k); parameters = C<sub>out</sub>·C<sub>in</sub>·k·k + C<sub>out</sub>.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Counting params as 64·3·3 + 64 (forgetting input channels). The kernel has depth = input channels: 64·<strong>3</strong>·3·3 + 64 = 1,792. This is the most common interview arithmetic slip.</p>
  </div>

  <h2 id="dc-pad"><span class="num">04</span>Padding &amp; Stride</h2>
  <p>Two problems showed up in our hand example. First, the 4 × 4 image became 2 × 2: every 3 × 3 conv shrinks the image by 2 pixels. Stack 20 layers and a 32 × 32 image disappears. Second, corner pixels were used by only one window while centre pixels were used by four, so information at the border counts less. Separately, we sometimes <em>want</em> to shrink on purpose, to make later layers cheaper.</p>
  <p><strong>Padding</strong> adds a border of zeros around the image before sliding, so the kernel can sit centred on edge pixels too. <strong>Stride</strong> is how many pixels the kernel jumps each step; stride 2 skips every other position and halves the output size.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Padding is the white margin around a photo in a frame: the stamp can now be pressed right up to the photo's edge. Stride is how a ticket checker walks a train: checking every seat (stride 1) or every second seat (stride 2), which is quicker but sees half as much.</p></div>
  <p>Worked example on our 4 × 4 image with padding 1: it becomes 6 × 6 with a ring of zeros. Now the 3 × 3 kernel fits at 4 × 4 positions, so the output stays 4 × 4. The new top-left output is the padded patch [[0, 0, 0], [0, 3, 1], [0, 1, 4]]: left column 0, right column 0 + 1 + 4 = 5, so 0 − 5 = −5. The inner 2 × 2 of the output must equal our earlier answer. With stride 2 as well, only positions 0 and 2 are used in each direction: a 2 × 2 output.</p>
  <div class="fx" data-lang="py">X = torch.tensor([[3, 1, 0, 2],
                  [1, 4, 2, 0],
                  [0, 2, 5, 1],
                  [2, 0, 1, 3]], dtype=torch.float32).reshape(1, 1, 4, 4)
K = torch.tensor([[1, 0, -1]] * 3, dtype=torch.float32).reshape(1, 1, 3, 3)
print(F.pad(X, (1, 1, 1, 1))[0, 0])                 # (6, 6): zero border
print(F.conv2d(X, K, padding=1)[0, 0])              # (4, 4): size kept
print(F.conv2d(X, K, padding=1, stride=2)[0, 0])    # (2, 2): size halved</div>
  <div class="fx" data-lang="text">tensor([[0., 0., 0., 0., 0., 0.],
        [0., 3., 1., 0., 2., 0.],
        [0., 1., 4., 2., 0., 0.],
        [0., 0., 2., 5., 1., 0.],
        [0., 2., 0., 1., 3., 0.],
        [0., 0., 0., 0., 0., 0.]])
tensor([[-5.,  2.,  3.,  2.],
        [-7., -3.,  4.,  7.],
        [-6., -5.,  2.,  8.],
        [-2., -4., -2.,  6.]])
tensor([[-5.,  3.],
        [-6.,  2.]])</div>
  <p>Read it: the first print is the padded 6 × 6 grid. In the padded output, the top-left is −5 as computed by hand, and the inner block [[−3, 4], [−5, 2]] is exactly our unpadded result. The stride-2 output keeps every other cell of the padded output (rows 0 and 2, columns 0 and 2). All of this is captured by one formula.</p>
  <div class="callout def"><span class="label">Formula</span>
    <p><strong>out = ⌊(W − K + 2P) / S⌋ + 1</strong> — W input size, K kernel, P zero-padding per side, S stride. Our cases: (4 − 3 + 0)/1 + 1 = 2; (4 − 3 + 2)/1 + 1 = 4; ⌊3/2⌋ + 1 = 2.</p>
  </div>
  <p>Another example: input 32, K = 5, P = 2, S = 2 → (32 − 5 + 4)/2 = 15.5 → floor 15 → +1 = <strong>16</strong>. The code checks the formula against real layers on a 32 × 32 input:</p>
  <div class="fx" data-lang="py">x = torch.randn(1, 3, 32, 32)
def size(W, K, P, S): return (W - K + 2*P) // S + 1
for K_, P, S in [(3,0,1), (3,1,1), (5,2,2), (3,1,2), (1,0,1)]:
    y = nn.Conv2d(3, 8, K_, stride=S, padding=P)(x)
    print(f"K={K_} P={P} S={S}: formula {size(32,K_,P,S):&gt;2}  torch {tuple(y.shape)}")
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
  <div class="callout trap"><span class="label">Trap</span><p>The floor in the formula. 64 × 64 with K = 3, P = 0, S = 2 gives ⌊61/2⌋ + 1 = 31, not 31.5 or 32. Off-by-one sizes then break a later <code>Linear</code> layer whose input size you hard-coded. Use <code>nn.AdaptiveAvgPool2d</code> or print shapes once with a dummy batch.</p></div>

  <h2 id="dc-pool"><span class="num">05</span>Pooling</h2>
  <p>After a few conv layers, the feature maps are big (say 64 channels × 112 × 112), and the exact pixel where an edge was found matters less than the fact that it was found nearby. Carrying full-size maps to every later layer is expensive. <strong>Pooling</strong> shrinks a map by summarising each small window, usually 2 × 2, as one number.</p>
  <p>In plain words: <strong>max pooling</strong> keeps the biggest value in each window ("was the feature anywhere here?"); <strong>average pooling</strong> keeps the mean. A 2 × 2 window with stride 2 halves height and width. Pooling has no weights to learn, and it works on each channel separately, so the channel count does not change.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Each bench of four students sends only its top mark to the teacher (max pooling). The teacher learns the best score per bench, not who sat where. Average pooling would send the bench average instead.</p>
  </div>
  <p>Worked example on a 4 × 4 map split into four 2 × 2 windows. Top-left window {1, 3, 5, 6}: max 6, mean 15/4 = 3.75. Top-right {2, 0, 1, 2}: max 2, mean 1.25. Bottom-left {0, 2, 1, 1}: max 2, mean 1. Bottom-right {9, 4, 3, 8}: max 9, mean 6.</p>
  <div class="fx" data-lang="py">fm = torch.tensor([[1., 3, 2, 0],
                   [5, 6, 1, 2],
                   [0, 2, 9, 4],
                   [1, 1, 3, 8]]).reshape(1, 1, 4, 4)
print(nn.MaxPool2d(2)(fm)[0, 0])                       # (1,1,4,4) -&gt; (1,1,2,2)
print(nn.AvgPool2d(2)(fm)[0, 0])
print(nn.AdaptiveAvgPool2d(1)(fm).flatten(), fm.mean()) # global: whole map -&gt; 1 number
fmap = torch.randn(8, 128, 7, 7)                        # a real end-of-network shape
print(nn.AdaptiveAvgPool2d(1)(fmap).shape, fmap.mean(dim=(2, 3)).shape)
s = torch.zeros(1,1,4,4); s[0,0,0,0] = 9                # a spike at (0,0)
s2 = torch.zeros(1,1,4,4); s2[0,0,1,1] = 9              # same spike moved to (1,1)
print(nn.MaxPool2d(2)(s)[0,0].tolist(), nn.MaxPool2d(2)(s2)[0,0].tolist())</div>
  <div class="fx" data-lang="text">tensor([[6., 2.],
        [2., 9.]])
tensor([[3.7500, 1.2500],
        [1.0000, 6.0000]])
tensor([3.]) tensor(3.)
torch.Size([8, 128, 1, 1]) torch.Size([8, 128])
[[9.0, 0.0], [0.0, 0.0]] [[9.0, 0.0], [0.0, 0.0]]</div>
  <p>What happened: max and average pooling match the hand values. <strong>Global average pooling</strong> (<code>AdaptiveAvgPool2d(1)</code>) averages the whole map into one number per channel: for a (8, 128, 7, 7) batch it gives (8, 128, 1, 1), the same as <code>mean(dim=(2, 3))</code>. That turns any image size into a fixed-length vector for the final classifier. The last line shows the small shift-tolerance: a spike moved by one pixel inside the same window gives the identical pooled output.</p>
  <div class="cards">
    <div><b>Max pool</b><p>"Was the feature anywhere in this window?"</p><small>Halves H, W; 0 params</small></div>
    <div><b>Average pool</b><p>Smooth summary of the window.</p><small>Keeps weak signals</small></div>
    <div><b>Global average pool</b><p>Each channel's whole map → 1 number.</p><small>Before the classifier; replaces huge FC layers</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Pooling</strong>: a fixed, parameter-free downsampling that applies max or mean over each window, per channel. (N, C, H, W) → (N, C, H/2, W/2) for 2 × 2, stride 2.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pooling throws away position and the other 3 values. Modern nets (ResNet) mostly downsample with stride-2 convs, which learn what to keep; global average pooling stays at the end.</p>
  </div>

  <h2 id="dc-arch"><span class="num">06</span>Architecture Design</h2>
  <p>We now have all the bricks: conv (find patterns), ReLU (keep positives), pooling or stride (shrink), and a final linear layer (decide the class). How do you stack them? The answer has been stable for 30 years: repeat a block that <strong>shrinks the picture and adds more filters</strong>, then pool everything and classify.</p>
  <p>Why shrink and widen at the same time? Early layers see small patches and only need a few filters (there are few kinds of edges). Later layers combine edges into many kinds of textures and parts, so they need more channels, but they no longer need fine pixel positions. Halving height and width while doubling channels keeps the compute per layer roughly balanced.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Reading a newspaper photo of a cricket match. First you notice lines and colours, then shapes (bat, ball, stumps), then the scene ("a batsman getting bowled"). Each step looks at a bigger region in less detail, but with richer meaning.</p></div>
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
  <p>Before running it, predict every shape with the formula. A batch of 8 images (8, 3, 32, 32). Conv(3→32, K3, P1) keeps 32 × 32: (8, 32, 32, 32), params 32·3·9 + 32 = 896. MaxPool → (8, 32, 16, 16). Conv(32→64) → (8, 64, 16, 16), params 64·32·9 + 64 = 18,496. MaxPool → (8, 64, 8, 8). Conv(64→128) → (8, 128, 8, 8), 73,856 params. Global pool → (8, 128, 1, 1), flatten → (8, 128), Linear(128→10) → (8, 10), 1,290 params.</p>
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
        p = sum(q.numel() for q in layer.parameters())
        print(f"{layer.__class__.__name__:18s} {str(tuple(x.shape)):18s} params {p:,}")
print("params:", sum(p.numel() for p in net.parameters()))</div>
  <div class="fx" data-lang="text">Conv2d             (8, 32, 32, 32)    params 896
MaxPool2d          (8, 32, 16, 16)    params 0
Conv2d             (8, 64, 16, 16)    params 18,496
MaxPool2d          (8, 64, 8, 8)      params 0
Conv2d             (8, 128, 8, 8)     params 73,856
AdaptiveAvgPool2d  (8, 128, 1, 1)     params 0
Flatten            (8, 128)           params 0
Linear             (8, 10)            params 1,290
params: 94538</div>
  <p>Every line matches the prediction. Loop over an <code>nn.Sequential</code> and print shapes like this whenever you build a new model; it is the quickest way to find a shape bug. Notice where the parameters are: the deepest conv holds 78% of them, pooling and flatten hold none. In practice add <code>BatchNorm2d</code> after each conv (conv-BN-ReLU), which makes training faster and more stable.</p>
  <table class="tbl">
    <tr><th>Net</th><th>Year</th><th>What it fixed</th><th>Top-5 (ImageNet)</th><th>Params</th></tr>
    <tr><td>LeNet-5</td><td>1998</td><td>Proved CNNs on digits</td><td>—</td><td>60K</td></tr>
    <tr><td>AlexNet</td><td>2012</td><td>Depth on GPUs; ReLU, dropout</td><td>84.7%</td><td>60M</td></tr>
    <tr><td>VGG-16</td><td>2014</td><td>Depth via stacked 3×3 convs</td><td>92.7%</td><td>138M</td></tr>
    <tr><td>ResNet-50</td><td>2015</td><td>Skip connections; trains 150+ layers</td><td>~93%</td><td>25.6M</td></tr>
    <tr><td>EfficientNet-B4</td><td>2019</td><td>Compound scaling</td><td>96.4%</td><td>19M</td></tr>
  </table>
  <div class="callout intu"><span class="label">Why 3×3 everywhere (VGG)</span>
    <p>Two stacked 3×3 convs see a 5×5 region. With 64 channels: 2·9·64·64 = 73,728 weights vs 25·64·64 = 102,400 for one 5×5 — 28% fewer, plus an extra ReLU between them.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Receptive field</strong>: the region of the input image that can affect one output unit. Each 3×3 conv adds 2 pixels to it; each stride-2 step or pooling doubles how fast it grows. That is how deep layers can "see" whole objects.</p></div>

  <h2 id="dc-train"><span class="num">07</span>Hands-on: Train a CNN</h2>
  <p>Shapes and parameter counts are not the point; recognising images is. So we train a small CNN on real images: scikit-learn's handwritten digits, 1,797 grey images of 8 × 8 pixels, labels 0–9. We also train a plain MLP with a similar number of weights, to compare. Finally we shift every test image one pixel to the right, something a real camera does all the time, and see which model copes.</p>
  <p>Shape trace for one image through our CNN: (1, 1, 8, 8) → Conv(1→16, P1) (1, 16, 8, 8) → MaxPool (1, 16, 4, 4) → Conv(16→32, P1) (1, 32, 4, 4) → MaxPool (1, 32, 2, 2) → Flatten (1, 128) → Linear (1, 10). The Linear layer's input size 128 is 32 channels × 2 × 2, which is why you must know the shapes before writing it.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
X, y = load_digits(return_X_y=True)                  # (1797, 64), values 0..16
print(X.shape, y.shape, X.min(), X.max())
X = torch.tensor(X / 16.0, dtype=torch.float32).reshape(-1, 1, 8, 8)   # (N, 1, 8, 8)
y = torch.tensor(y)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
print(Xtr.shape, Xte.shape)

def train(model, epochs=15):
    opt = torch.optim.Adam(model.parameters(), lr=1e-2); lf = nn.CrossEntropyLoss()
    for ep in range(1, epochs + 1):
        model.train()
        perm = torch.randperm(len(Xtr))
        for i in range(0, len(Xtr), 64):                 # mini-batches of 64
            idx = perm[i:i+64]
            opt.zero_grad(); lf(model(Xtr[idx]), ytr[idx]).backward(); opt.step()
        model.eval()
        with torch.no_grad():
            acc = (model(Xte).argmax(1) == yte).float().mean().item()
        if ep in (1, 5, 15): print(f"  epoch {ep:2d}  test acc {acc:.3f}")

torch.manual_seed(0)
cnn = nn.Sequential(
    nn.Conv2d(1, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),    # (N,16,4,4)
    nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),   # (N,32,2,2)
    nn.Flatten(),                                                 # (N,128)
    nn.Linear(32 * 2 * 2, 10))                                    # (N,10)
print("CNN params", sum(p.numel() for p in cnn.parameters())); train(cnn)
torch.manual_seed(0)
mlp = nn.Sequential(nn.Flatten(), nn.Linear(64, 64), nn.ReLU(), nn.Linear(64, 10))
print("MLP params", sum(p.numel() for p in mlp.parameters())); train(mlp)

shifted = torch.roll(Xte, shifts=1, dims=3); shifted[..., 0] = 0     # move 1 pixel right
with torch.no_grad():
    print("shifted: CNN", round((cnn(shifted).argmax(1) == yte).float().mean().item(), 3),
          " MLP", round((mlp(shifted).argmax(1) == yte).float().mean().item(), 3))</div>
  <div class="fx" data-lang="text">(1797, 64) (1797,) 0.0 16.0
torch.Size([1347, 1, 8, 8]) torch.Size([450, 1, 8, 8])
CNN params 6090
  epoch  1  test acc 0.820
  epoch  5  test acc 0.951
  epoch 15  test acc 0.982
MLP params 4810
  epoch  1  test acc 0.796
  epoch  5  test acc 0.947
  epoch 15  test acc 0.976
shifted: CNN 0.627  MLP 0.447</div>
  <p>What happened: the 64 pixel values per row were scaled to 0–1 and reshaped to (N, 1, 8, 8), the layout convolutions need. <code>train</code> is the standard PyTorch loop (see <a class="xref" data-note="dl_pytorch">PyTorch</a>). On normal test images both models do well (98.2% vs 97.6%); 8 × 8 digits are an easy, centred dataset. The difference shows on shifted images: <code>torch.roll</code> moves every image one pixel right. The MLP falls to 44.7%, because each of its weights is tied to one exact pixel position. The CNN keeps 62.7%, because its filters slide and pooling tolerates small moves. On real photos, where objects can be anywhere, this gap is why CNNs won.</p>
  <div class="callout trap"><span class="label">Trap</span><p>The CNN still dropped from 98% to 63%: convolution is not magic shift-invariance, especially with only two pooling steps on a tiny image. In practice you also train with <strong>data augmentation</strong> (random shifts, crops, flips), so the model sees moved objects during training.</p></div>

  <h2 id="dc-res"><span class="num">08</span>ResNet Skip Connections</h2>
  <p>If 8 layers are good, are 56 layers better? Around 2015, researchers found the opposite: plain CNNs deeper than ~20 layers got <em>higher training error</em>. Not overfitting (that would be low training error, high test error) but failing to learn at all. The reason: during backpropagation the gradient is multiplied by each layer's derivative on its way back. Fifty small factors multiplied together give almost zero, so the early layers barely learn (the "vanishing gradient").</p>
  <p>The fix, from the ResNet paper, is one line: add each block's input to its output. Instead of learning the full transformation H(x), the block learns only the change F(x), and outputs F(x) + x. The added x is the <strong>skip connection</strong> (or shortcut).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Correcting a homework answer instead of rewriting it from scratch. Each block only writes small corrections on top of what it received. If nothing needs fixing, it writes nothing, and the answer passes through unchanged. And the teacher's feedback (the gradient) reaches the first student directly through the original answer, not only through every correction.</p>
  </div>
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
  <p>Why "+1" matters, in numbers: the derivative of y = F(x) + x is ∂F/∂x + 1. Even if ∂F/∂x is tiny, say 0.01, the factor is 1.01, not 0.01. Fifty factors of 0.01 multiply to 10<sup>−100</sup>; fifty factors near 1 stay near 1. The experiment below builds a 50-layer network with and without skips and measures the gradient that reaches the first and last layers.</p>
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
  <p>Without skips the first layer gets a gradient of 10<sup>−14</sup>: effectively zero, it will never learn. With skips it gets 16. (Real ResNets add BatchNorm, which keeps the residual path's scale in check.) Now a real convolutional residual block, with shapes traced. When the block keeps the shape, the shortcut is just x. When it halves the size and doubles channels (stride 2, 64 → 128), x has the wrong shape to add, so the shortcut uses a 1×1 conv with stride 2 (a <strong>projection shortcut</strong>).</p>
  <div class="fx" data-lang="py">class ResBlock(nn.Module):
    def __init__(self, c_in, c_out, stride=1):
        super().__init__()
        self.f = nn.Sequential(
            nn.Conv2d(c_in, c_out, 3, stride=stride, padding=1, bias=False), nn.BatchNorm2d(c_out), nn.ReLU(),
            nn.Conv2d(c_out, c_out, 3, padding=1, bias=False), nn.BatchNorm2d(c_out))
        self.shortcut = nn.Identity()
        if stride != 1 or c_in != c_out:            # shapes differ -&gt; 1x1 projection
            self.shortcut = nn.Sequential(nn.Conv2d(c_in, c_out, 1, stride=stride, bias=False), nn.BatchNorm2d(c_out))
    def forward(self, x):
        return torch.relu(self.f(x) + self.shortcut(x))
x = torch.randn(4, 64, 56, 56)
same = ResBlock(64, 64); down = ResBlock(64, 128, stride=2)
print(tuple(same(x).shape), tuple(down(x).shape))
print(tuple(down.f(x).shape), tuple(down.shortcut(x).shape))
print(type(same.shortcut).__name__, type(down.shortcut).__name__)</div>
  <div class="fx" data-lang="text">(4, 64, 56, 56) (4, 128, 28, 28)
(4, 128, 28, 28) (4, 128, 28, 28)
Identity Sequential</div>
  <p>The same-shape block returns (4, 64, 56, 56), unchanged. In the downsampling block both branches produce (4, 128, 28, 28) (56 → 28 by stride 2, formula ⌊(56 − 3 + 2)/2⌋ + 1 = 28), so they can be added. <code>bias=False</code> because BatchNorm right after has its own shift.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Residual block</strong>: y = F(x) + shortcut(x). <strong>Degradation problem</strong>: deeper plain networks reach higher training error, an optimisation failure. <strong>Projection shortcut</strong>: 1×1 conv (with stride) on the skip path to match shapes.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Saying skip connections fix <em>overfitting</em>. They fix optimisation (training error). Also: shapes must match exactly for the addition; a forgotten projection gives "The size of tensor a (28) must match the size of tensor b (56)".</p>
  </div>

  <h2 id="dc-eff"><span class="num">09</span>EfficientNet Scaling</h2>
  <p>You have a working CNN and a bigger compute budget. Where should the extra compute go? Three knobs: make it <strong>deeper</strong> (more layers), <strong>wider</strong> (more channels per layer), or feed <strong>higher-resolution</strong> images. Before 2019 people turned one knob, usually depth (ResNet-18 → 152). Each knob alone gives quickly shrinking gains.</p>
  <p>EfficientNet's idea in plain words: a bigger image has more detail, which needs more layers to cover it (bigger receptive field) and more channels to capture its finer patterns. So turn all three knobs together, in a fixed ratio found once by a small search.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cooking for more wedding guests. You increase rice, dal and water together, in proportion. Doubling only the rice gives a bad meal, however much rice there is.</p>
  </div>
  <div class="cards">
    <div><b>Deeper</b><p>More layers: bigger receptive field, harder to train.</p><small>ResNet-18 → 152</small></div>
    <div><b>Wider</b><p>More channels: finer features, saturates fast.</p><small>Wide ResNet</small></div>
    <div><b>Higher resolution</b><p>More pixels: small details, costs ∝ r².</p><small>224 → 380</small></div>
    <div><b>Compound</b><p>Grow all three in a fixed ratio.</p><small>EfficientNet B0 → B7</small></div>
  </div>
  <p>The rule: depth × α<sup>φ</sup>, width × β<sup>φ</sup>, resolution × γ<sup>φ</sup>, where φ is "how much bigger" you want. Compute (FLOPs) grows roughly with depth × width² × resolution² (width and resolution both appear twice: channels in × channels out, height × width). The paper picked α = 1.2, β = 1.1, γ = 1.15 so that α·β²·γ² ≈ 2: each step of φ about doubles compute. The code works out the first few steps.</p>
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
  <p>Read a row: at φ = 2 the network is 44% deeper, 21% wider, takes 296-pixel images, and costs 3.7× the compute of B0. B0 itself (5.3M params, built from "MBConv" blocks found by automated architecture search) matches ResNet-50 (25.6M) in accuracy. The released B1–B7 use rounded resolutions such as 240, 260, 300.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Compound scaling</strong>: scale depth, width and resolution together with a single coefficient φ under the constraint α·β²·γ² ≈ 2. <strong>FLOPs</strong>: floating-point operations, a hardware-independent measure of compute per image.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Fewer parameters does not always mean faster. EfficientNets use depthwise convolutions that are memory-bound on GPUs, so a ResNet-50 can be faster in practice despite more parameters. Measure latency on your target hardware.</p></div>

  <h2 id="dc-tl"><span class="num">10</span>Transfer Learning with Pretrained CNNs</h2>
  <p>Our digits model trained in seconds on 1,347 images. A real task, like classifying 3 types of crop disease from leaf photos, may have only 500 labelled photos, far too few to train a ResNet from scratch: it would memorise them. But a ResNet trained on ImageNet (1.2 million photos, 1000 classes) already has filters for edges, textures, leaf-like shapes. <strong>Transfer learning</strong> reuses that network and retrains only what is task-specific.</p>
  <p>In plain words: keep the pretrained <strong>backbone</strong> (all conv stages), throw away its final layer (which outputs 1000 ImageNet classes), add a new final layer for your 3 classes, and train. First train only the new layer; later, optionally, gently adjust the top stage.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket fielding coach moving to a hockey team. Fitness and footwork training carry over (frozen backbone). Only the hockey-specific skills need teaching (the new head). Later, small adjustments to the rest (fine-tuning at a tiny learning rate).</p>
  </div>
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
  <p>First, know the backbone's shapes, because the head must fit them. Trace one 224 × 224 image through ResNet-18: the stem conv (K7, S2) gives 112, max-pool 56, then four stages at 56, 28, 14, 7 with 64, 128, 256, 512 channels, global pool to (1, 512), and the original <code>fc</code> to 1000 classes. So the new head is <code>Linear(512, 3)</code>: 512·3 + 3 = 1,539 weights.</p>
  <div class="fx" data-lang="py">import torchvision
m = torchvision.models.resnet18(weights=None)   # real use: weights=ResNet18_Weights.DEFAULT
x = torch.randn(1, 3, 224, 224)
for name in ["conv1", "bn1", "relu", "maxpool", "layer1", "layer2", "layer3", "layer4", "avgpool"]:
    x = getattr(m, name)(x)
    if name not in ("bn1", "relu"):
        print(f"{name:8s} {tuple(x.shape)}")
x = torch.flatten(x, 1); print(f"{'flatten':8s} {tuple(x.shape)}")
print(f"{'fc':8s} {tuple(m.fc(x).shape)}")
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
print(f"trainable after unfreezing layer4 {n(p for p in m.parameters() if p.requires_grad):,}")
print(tuple(m(torch.randn(2, 3, 224, 224)).shape))</div>
  <div class="fx" data-lang="text">conv1    (1, 64, 112, 112)
maxpool  (1, 64, 56, 56)
layer1   (1, 64, 56, 56)
layer2   (1, 128, 28, 28)
layer3   (1, 256, 14, 14)
layer4   (1, 512, 7, 7)
avgpool  (1, 512, 1, 1)
flatten  (1, 512)
fc       (1, 1000)
total 11,178,051  trainable 1,539
trainable after unfreezing layer4 8,395,267
(2, 3)</div>
  <p>What happened: the shape trace is the "spatial ↓, channels ↑" recipe from section 06 on a real network. Setting <code>requires_grad = False</code> on every parameter froze the backbone; the new <code>fc</code> is created after, so it is trainable: 1,539 of 11.2M weights. Unfreezing <code>layer4</code> adds 8.4M trainable weights, and the two <strong>parameter groups</strong> give them a 100× smaller learning rate than the head. The final output is (2, 3): two images, three class scores. <em>This ran with random weights (the sandbox cannot download ImageNet weights); shapes and counts are identical with pretrained weights.</em></p>
  <table class="tbl">
    <tr><th>Your data</th><th>Similar to ImageNet</th><th>Very different (X-ray, satellite)</th></tr>
    <tr><td>Small (&lt; 1K)</td><td>Freeze all, train head</td><td>Freeze early stages, fine-tune top + head</td></tr>
    <tr><td>Large (10K+)</td><td>Fine-tune top stages + head</td><td>Fine-tune everything, still init from pretrained</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Backbone</strong>: the pretrained feature extractor. <strong>Head</strong>: the task-specific final layer(s). <strong>Feature extraction</strong>: frozen backbone + trained head. <strong>Fine-tuning</strong>: also update pretrained weights with a small learning rate.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fine-tuning pretrained layers at LR 1e-3 wipes out what they learned within a few epochs (catastrophic forgetting); the model then does worse than frozen features. Use parameter groups with 10–100× lower LR, and the same resize + ImageNet mean/std normalisation the model was trained with.</p>
  </div>

  <h2 id="dc-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: wrong layout</span>
    <p>PyTorch wants (N, C, H, W). An image loaded with PIL/NumPy is (H, W, C): use <code>permute(2, 0, 1)</code> and add a batch dim with <code>unsqueeze(0)</code>. A single grey image needs both the channel and the batch dim: (1, 1, H, W).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting input channels in param counts</span>
    <p>Params = C<sub>out</sub>·C<sub>in</sub>·k·k + C<sub>out</sub>. Conv2d(3, 64, 3) is 1,792, not 640.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: hard-coded Linear input size</span>
    <p>Change the image size or a stride and <code>Linear(32*2*2, 10)</code> breaks with "mat1 and mat2 shapes cannot be multiplied". Print shapes with a dummy batch, or end the conv part with <code>AdaptiveAvgPool2d(1)</code> so the size is always C.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the floor in the size formula</span>
    <p>⌊(W − K + 2P)/S⌋ + 1. Odd sizes with stride 2 lose a pixel (64 → 31 with K3, P0, S2), and then a residual addition no longer matches.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "CNNs are shift-invariant"</span>
    <p>Our digits CNN fell from 98% to 63% on a 1-pixel shift. Convolution is equivariant; robustness comes from pooling plus data augmentation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: skip connections and overfitting</span>
    <p>ResNet skips fix optimisation (vanishing gradients, degradation), not overfitting. Shapes must match; use a 1×1 projection when they do not.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: pretrained model, wrong preprocessing or LR</span>
    <p>Feed the resize and ImageNet mean/std the backbone expects; fine-tune pretrained layers at 1e-5–1e-4, not 1e-3.</p>
  </div>

  <h2 id="dc-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why CNNs instead of MLPs for images?</summary><div class="qa-body">(1) Parameters: an MLP's first layer on 224×224×3 with 1000 units has 150.5M weights; a 64-filter 3×3 conv has 1,792. (2) Locality: nearby pixels matter most, and convs only look at local patches. (3) Sharing gives translation equivariance: an edge detector fires anywhere without separate weights per position.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute by hand: input [[1,2,0],[0,1,3],[2,1,0]] with kernel [[1,0],[0,1]], no padding, stride 1.</summary><div class="qa-body">Output is 2×2 ((3 − 2) + 1 = 2). Each cell = top-left + bottom-right of the 2×2 patch. (0,0): 1 + 1 = 2. (0,1): 2 + 3 = 5. (1,0): 0 + 1 = 1. (1,1): 1 + 0 = 1. Result [[2, 5], [1, 1]].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters in Conv2d(64, 128, kernel_size=3)?</summary><div class="qa-body">128 · 64 · 3 · 3 + 128 = 73,728 + 128 = <strong>73,856</strong>. Each of 128 filters spans all 64 input channels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Input (16, 3, 64, 64) goes through Conv2d(3, 32, 3, stride=2, padding=0). Output shape?</summary><div class="qa-body">⌊(64 − 3 + 0) / 2⌋ + 1 = ⌊30.5⌋ + 1 = 31, so <strong>(16, 32, 31, 31)</strong>. Batch unchanged, channels = number of filters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a 1×1 convolution do?</summary><div class="qa-body">Mixes channels at each pixel without looking at neighbours: a per-pixel linear layer. Used to shrink or grow channel count cheaply (ResNet bottlenecks, Inception) and to add non-linearity. Also used as the projection shortcut in ResNet.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Max pooling vs strided convolution for downsampling?</summary><div class="qa-body">Max pooling is fixed and parameter-free: it keeps the max and discards position and the other values. Strided conv learns what to keep. Modern nets mostly use strided convs, keeping global average pooling at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does global average pooling do to a (N, 512, 7, 7) tensor, and why use it?</summary><div class="qa-body">Averages each 7×7 map to one number → (N, 512, 1, 1), flattened to (N, 512). It has no parameters, works for any input size, and replaces a huge flatten + FC layer (512·49·1000 = 25M weights) with a small Linear(512, classes).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem do ResNet skip connections solve, and how?</summary><div class="qa-body">Degradation: plain nets got worse <em>training</em> error as depth grew (an optimisation problem, not overfitting). y = F(x) + x means a block can do identity by pushing F → 0, and ∂y/∂x = ∂F/∂x + 1 gives gradients a direct path. In our 50-layer demo the first layer's gradient was 1e-14 without skips and ~16 with them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why stack two 3×3 convs instead of one 5×5?</summary><div class="qa-body">Same 5×5 receptive field, fewer weights (18C² vs 25C², 28% fewer) and an extra non-linearity between them, so more expressive per parameter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is EfficientNet's key idea?</summary><div class="qa-body">Compound scaling: scale depth, width and resolution together (α<sup>φ</sup>, β<sup>φ</sup>, γ<sup>φ</sup> with α·β²·γ² ≈ 2, so FLOPs ≈ 2<sup>φ</sup>) instead of one dimension. Higher resolution needs more depth and width to use it. B0 matches ResNet-50 accuracy with ~5× fewer params.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You have 500 labelled medical scans. How do you build a classifier?</summary><div class="qa-body">Do not train from scratch. Load an ImageNet-pretrained ResNet/EfficientNet, freeze the backbone, replace the head (dropout + Linear to num_classes), train the head at LR ~1e-3. Heavy augmentation (flips, ±15° rotation, crops, colour jitter). If it plateaus, unfreeze the last stage at LR ~1e-5. Use stratified CV given the small set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fine-tuned model is worse than frozen features. Why?</summary><div class="qa-body">Catastrophic forgetting: too high an LR on pretrained layers overwrote good features, often while overfitting the small dataset. Fix with differential LRs (parameter groups), gradual unfreezing, and early stopping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the receptive field and why does it grow?</summary><div class="qa-body">The input region that affects one output unit. Each 3×3 conv adds 2 pixels; pooling/stride multiplies the growth. That is why deep layers can recognise whole objects while layer 1 sees only 3×3 edges.</div></details>
</main>`
});
