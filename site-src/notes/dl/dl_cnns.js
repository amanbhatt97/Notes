// dl/dl_cnns.js — CNNs — Convolutional Neural Networks
Object.assign(TOPIC_CONTENT, {
  "dl_cnns": `<main>
<h1>CNNs — Convolutional Neural Networks</h1>
  <div class="where"><span>Deep Learning</span><span>CNNs</span></div>
  <p class="lead">A convolutional neural network, or CNN, is a neural network designed for images and other grid-shaped data. Instead of connecting every pixel to every neuron, it slides one small filter over the whole picture to find simple patterns such as edges, and then stacks such layers so that edges combine into shapes and shapes into objects. CNNs are behind road and factory defect inspection, medical scans, reading invoices, the vision part of self-driving cars, and the image side of many multimodal AI systems, and they are a favourite interview topic because so much of them can be calculated by hand. Our running example is a road-inspection van that photographs the road and asks of each small patch: <strong>is there a pothole here?</strong> We start with a tiny 5 × 5 grey patch so that every number can be computed by hand, then train a real CNN in PyTorch on thousands of generated road patches, and finally follow the same problem through the famous architectures and transfer learning. All code on this page was run for real (PyTorch 2.15, CPU).</p>

  <h2 id="dc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">CNNs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why convolution</div>
        <ul>
          <li>MLP on pixels: huge weight counts, no idea of neighbours</li>
          <li>One small filter, <b>shared</b> at every position</li>
          <li><b>Equivariance</b>: shift the input, the map shifts too</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">One layer</div>
        <ul>
          <li>out(i, j) = Σ filter × window + bias</li>
          <li>Size: ⌊(W − K + 2P)/S⌋ + 1</li>
          <li>Params: C<sub>out</sub>·C<sub>in</sub>·k·k + C<sub>out</sub></li>
          <li>ReLU, then pooling (max / average / global)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stacking</div>
        <ul>
          <li>Receptive field grows: 3 → 5 → 6 → 10</li>
          <li>Recipe: shrink space, add channels, global pool, Linear</li>
          <li>Edges → textures → parts → objects</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Architectures</div>
        <ul>
          <li>LeNet → AlexNet → VGG (stacked 3×3)</li>
          <li><b>ResNet</b>: y = F(x) + x keeps gradients alive</li>
          <li>MobileNet / EfficientNet: depthwise convs, compound scaling</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Transfer learning</div>
        <ul>
          <li>Reuse a trained backbone, train a new head</li>
          <li>ResNet-18 → Linear(512, 2): 1,026 trainable</li>
          <li>Unfreeze top stage later with a tiny learning rate</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Not an MLP?</span><span class="rm-sub">what goes wrong when a plain network reads pixels</span></div></div>
      <div class="rm-item rm-done" data-target="dc-conv"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Convolution Operation</span><span class="rm-sub">sliding a filter over the road patch, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dc-pad"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Padding and Stride</span><span class="rm-sub">controlling the output size</span></div></div>
      <div class="rm-item rm-done" data-target="dc-maps"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Filters and Channels</span><span class="rm-sub">many patterns, colour input, counting parameters</span></div></div>
      <div class="rm-item rm-done" data-target="dc-fmap"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Feature Maps and Equivariance</span><span class="rm-sub">what a filter's output means</span></div></div>
      <div class="rm-item rm-done" data-target="dc-pool"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Pooling</span><span class="rm-sub">keeping "found it", dropping "exactly where"</span></div></div>
      <div class="rm-item rm-done" data-target="dc-stack"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Receptive Field and the CNN Recipe</span><span class="rm-sub">how stacked layers see whole objects</span></div></div>
      <div class="rm-item rm-done" data-target="dc-train"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Training a CNN</span><span class="rm-sub">a pothole detector in PyTorch, CNN vs MLP</span></div></div>
      <div class="rm-item rm-done" data-target="dc-arch"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Classic Architectures</span><span class="rm-sub">LeNet, AlexNet, VGG, Inception</span></div></div>
      <div class="rm-item rm-done" data-target="dc-res"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">ResNet and Skip Connections</span><span class="rm-sub">why very deep networks stopped training</span></div></div>
      <div class="rm-item rm-done" data-target="dc-eff"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Efficient CNNs</span><span class="rm-sub">depthwise convolutions and EfficientNet scaling</span></div></div>
      <div class="rm-item rm-done" data-target="dc-tl"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Transfer Learning</span><span class="rm-sub">a good detector from very few labels</span></div></div>
      <div class="rm-item rm-done" data-target="dc-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">layouts, hard-coded sizes, parameter counts</span></div></div>
      <div class="rm-item rm-done" data-target="dc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, tables, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dc-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about CNNs</span></div></div>
    </div>
  </div>

  <h2 id="dc-why"><span class="num">01</span>Why Not an MLP?</h2>
  <p>A city's road-inspection van photographs the road every few metres, and the photos are cut into small square patches. We want a model that answers "pothole or not?" for each patch. From the foundations notes we already know one kind of network, the multi-layer perceptron or <strong>MLP</strong>, in which every input is connected to every neuron of the next layer (a <a class="xref" data-note="dl_neurons">fully connected layer</a>). A photo is just a grid of numbers, so the obvious first idea is to flatten the grid into one long list and feed it to an MLP. Let us see why that works badly.</p>
  <p>To be able to compute everything by hand, our first patch is tiny: 5 × 5 pixels, grey, with brightness from 0 (black) to 8 (bright asphalt). It contains a pothole: a dark hole in the middle, a little lopsided, as real potholes are.</p>
    <div class="fx" data-lang="py">import numpy as np, torch, torch.nn as nn, torch.nn.functional as F
patch = np.array([[8, 8, 8, 8, 8],      # row 0: smooth road
                  [8, 8, 2, 1, 8],      # row 1: the hole starts
                  [8, 1, 0, 1, 8],      # row 2: deepest part (0 = black)
                  [8, 8, 1, 2, 8],      # row 3
                  [8, 8, 8, 8, 8]], dtype=float)
print(patch.shape, "pixels:", patch.size, " dark pixels (&lt;= 2):", int((patch &lt;= 2).sum()))</div>
  <div class="fx" data-lang="text">(5, 5) pixels: 25  dark pixels (&lt;= 2): 7</div>
  <p>The patch has 25 pixels, 7 of them dark. You see the hole at once because the dark pixels are <em>next to each other</em> and surrounded by bright ones. Keep that phrase in mind, because "next to each other" is exactly what an MLP cannot see.</p>
  <p>The first problem is the number of weights. If we flatten the patch into 25 numbers and connect them to a layer of 16 neurons, each neuron needs one weight per pixel plus a bias, so the layer has 25 × 16 + 16 = 416 weights. That sounds harmless, but the count grows with the image. A normal photo of 224 × 224 pixels in 3 colours is 150,528 numbers, and a first layer of 1,000 neurons on it needs over 150 million weights, for one layer. Such a model is slow, needs a lot of memory, and with a normal amount of training data it overfits badly. Compare the alternative we are about to build, one small 3 × 3 filter slid over the image, which has 9 weights and 1 bias whatever the size of the image:</p>
    <div class="fx" data-lang="py">count = lambda m: sum(p.numel() for p in m.parameters())
layers_to_count = [
    ("MLP layer on the 5x5 patch",   nn.Linear(5 * 5, 16)),
    ("MLP layer on a 224x224x3 photo", nn.Linear(224 * 224 * 3, 1000)),
    ("one 3x3 filter",               nn.Conv2d(1, 1, kernel_size=3)),
    ("64 3x3 filters on colour",     nn.Conv2d(3, 64, kernel_size=3)),
]
for name, layer in layers_to_count:
    print(f"{name:32s} {count(layer):&gt;12,}")</div>
  <div class="fx" data-lang="text">MLP layer on the 5x5 patch                416
MLP layer on a 224x224x3 photo    150,529,000
one 3x3 filter                             10
64 3x3 filters on colour                1,792</div>
  <p>The MLP counts are inputs × outputs + biases. Even 64 different 3 × 3 filters on a colour photo need only 1,792 weights (we will derive that number in section 04), and the count does not depend on the image size at all.</p>
  <p>The second problem is worse. To an MLP, pixel 7 and pixel 8 are just input number 7 and input number 8; it has no idea that they are neighbours. And if the van stops one pixel later, so that the same pothole appears one pixel to the right, different pixels are dark and therefore different weights are used. Whatever the MLP learned about potholes in one position has to be learned again for every other position. We can count how different the shifted picture looks to an MLP:</p>
    <div class="fx" data-lang="py">shifted = np.roll(patch, 1, axis=1); shifted[:, 0] = 8     # same pothole, 1 pixel to the right
print(shifted.astype(int))
changed = patch.flatten() != shifted.flatten()
print("MLP inputs that changed:", int(changed.sum()), "of 25")</div>
  <div class="fx" data-lang="text">[[8 8 8 8 8]
 [8 8 8 2 1]
 [8 8 1 0 1]
 [8 8 8 1 2]
 [8 8 8 8 8]]
MLP inputs that changed: 10 of 25</div>
  <p>10 of the 25 inputs changed, so the MLP sees an almost different picture, although nothing about "is there a pothole?" has changed.</p>
  <p>Both problems point to the same fix. Think of a rubber stamp carved with the shape of a pothole's rim. You press it on every spot of the page in turn and note how well each spot matches. One stamp is used everywhere, so you never need a separate stamp for each position, and the stamp has 9 dots of ink no matter how big the page is. A <strong>convolutional neural network (CNN)</strong> is a network whose main layers work exactly like this: small filters, slid over the grid, with the same weights used at every position. That design gives three properties that the MLP lacked. <strong>Locality</strong>: each output looks only at a small neighbourhood of pixels. <strong>Parameter sharing</strong>: one filter, and therefore one set of weights, is reused at every position. And <strong>translation equivariance</strong>: if the pattern moves in the input, the filter's response moves by the same amount. The rest of this page builds that layer step by step.</p>

  <h2 id="dc-conv"><span class="num">02</span>The Convolution Operation</h2>
  <p>A <strong>kernel</strong>, also called a <strong>filter</strong>, is a small grid of weights, here 3 × 3. The <strong>convolution</strong> of an image with a kernel is computed like this: place the kernel over the top-left 3 × 3 window of the image, multiply each kernel weight by the pixel under it, and add up the nine products. That sum is one output number. Then slide the kernel one pixel to the right and repeat; at the end of a row, move one pixel down and start again from the left. The grid of all these sums is the output, called a <strong>feature map</strong>. Think of shining a torch on a wall one spot at a time and asking at each spot "how much does this look like my pattern?": a big positive number means "very much", zero means "nothing here", and a negative number means "the opposite pattern".</p>
  <p>Our kernel has +1 in its left column, 0 in the middle column and −1 in its right column. Multiplying and adding therefore computes <strong>(sum of the window's left column) − (sum of its right column)</strong>. In words, it asks "is the left side of this window brighter than the right side?". That is a <strong>vertical-edge detector</strong>. Where bright asphalt is on the left and the dark hole on the right, the answer is a large positive number: that is the pothole's left rim. Where the hole is on the left and asphalt on the right, the answer is a large negative number: the right rim.</p>
  <figure class="viz"><svg viewBox="0 0 640 260" width="640">
<defs><marker id="dc-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="95" y="22" text-anchor="middle">Road patch 5×5</text>
<rect x="20" y="70" width="90" height="90" class="fb sb" stroke-width="2"/>
<g stroke="currentColor" fill="none" stroke-opacity="0.4"><rect x="20" y="40" width="150" height="150"/><path d="M50,40 V190 M80,40 V190 M110,40 V190 M140,40 V190 M20,70 H170 M20,100 H170 M20,130 H170 M20,160 H170"/></g>
<g text-anchor="middle">
<text x="35" y="60">8</text><text x="65" y="60">8</text><text x="95" y="60">8</text><text x="125" y="60">8</text><text x="155" y="60">8</text>
<text x="35" y="90">8</text><text x="65" y="90">8</text><text x="95" y="90" class="tr">2</text><text x="125" y="90" class="tr">1</text><text x="155" y="90">8</text>
<text x="35" y="120">8</text><text x="65" y="120" class="tr">1</text><text x="95" y="120" class="tr">0</text><text x="125" y="120" class="tr">1</text><text x="155" y="120">8</text>
<text x="35" y="150">8</text><text x="65" y="150">8</text><text x="95" y="150" class="tr">1</text><text x="125" y="150" class="tr">2</text><text x="155" y="150">8</text>
<text x="35" y="180">8</text><text x="65" y="180">8</text><text x="95" y="180">8</text><text x="125" y="180">8</text><text x="155" y="180">8</text>
</g>
<text x="195" y="120" text-anchor="middle">⊙</text>
<text x="265" y="45" text-anchor="middle">Edge filter 3×3</text>
<rect x="220" y="75" width="90" height="90" class="fv sb"/>
<g stroke="currentColor" stroke-opacity="0.4"><path d="M250,75 V165 M280,75 V165 M220,105 H310 M220,135 H310"/></g>
<g text-anchor="middle"><text x="235" y="95">1</text><text x="265" y="95">0</text><text x="295" y="95">−1</text><text x="235" y="125">1</text><text x="265" y="125">0</text><text x="295" y="125">−1</text><text x="235" y="155">1</text><text x="265" y="155">0</text><text x="295" y="155">−1</text></g>
<text x="265" y="185" text-anchor="middle" class="tm">left − right</text>
<line x1="320" y1="120" x2="420" y2="120" stroke="currentColor" marker-end="url(#dc-ar1)"/>
<text x="370" y="110" text-anchor="middle">Σ = 21</text>
<text x="515" y="45" text-anchor="middle">Feature map 3×3</text>
<rect x="430" y="60" width="180" height="120" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<rect x="430" y="100" width="60" height="40" class="ft st" stroke-width="2"/>
<g stroke="currentColor" stroke-opacity="0.4"><path d="M490,60 V180 M550,60 V180 M430,100 H610 M430,140 H610"/></g>
<g text-anchor="middle"><text x="460" y="86">14</text><text x="520" y="86">7</text><text x="580" y="86">−14</text><text x="460" y="126">21</text><text x="520" y="126">13</text><text x="580" y="126">−21</text><text x="460" y="166">15</text><text x="520" y="166">6</text><text x="580" y="166">−15</text></g>
<text x="320" y="225" text-anchor="middle" class="tm">blue window (rows 1–3, cols 0–2): left column 8+8+8 = 24, right column 2+0+1 = 3 → 24 − 3 = 21</text>
<text x="320" y="248" text-anchor="middle" class="tm">positive column = left rim of the hole · negative column = right rim</text>
</svg><figcaption>The blue 3×3 window times the filter, summed, gives the teal output cell. A 3×3 filter fits in a 5×5 patch at 3 positions across and 3 down, so the output is 3×3.</figcaption></figure>
  <p>The figure shows one position. The blue window covers rows 1–3 and columns 0–2 of the patch. Its left column is 8 + 8 + 8 = 24 and its right column is 2 + 0 + 1 = 3, so the output is 24 − 3 = 21, written in the teal cell of the output. A 3 × 3 kernel fits into a 5 × 5 patch at 3 positions across and 3 positions down, so the output is 3 × 3. Here are all nine positions; only the outer columns matter, because the middle column of the kernel is 0:</p>
  <table class="tbl">
    <tr><th>Output cell</th><th>Window (rows, cols)</th><th>Left column</th><th>Right column</th><th>Left − right</th></tr>
    <tr><td>(0, 0)</td><td>0–2, 0–2</td><td>8 + 8 + 8 = 24</td><td>8 + 2 + 0 = 10</td><td><strong>14</strong></td></tr>
    <tr><td>(0, 1)</td><td>0–2, 1–3</td><td>8 + 8 + 1 = 17</td><td>8 + 1 + 1 = 10</td><td><strong>7</strong></td></tr>
    <tr><td>(0, 2)</td><td>0–2, 2–4</td><td>8 + 2 + 0 = 10</td><td>8 + 8 + 8 = 24</td><td><strong>−14</strong></td></tr>
    <tr><td>(1, 0)</td><td>1–3, 0–2</td><td>8 + 8 + 8 = 24</td><td>2 + 0 + 1 = 3</td><td><strong>21</strong></td></tr>
    <tr><td>(1, 1)</td><td>1–3, 1–3</td><td>8 + 1 + 8 = 17</td><td>1 + 1 + 2 = 4</td><td><strong>13</strong></td></tr>
    <tr><td>(1, 2)</td><td>1–3, 2–4</td><td>2 + 0 + 1 = 3</td><td>8 + 8 + 8 = 24</td><td><strong>−21</strong></td></tr>
    <tr><td>(2, 0)</td><td>2–4, 0–2</td><td>8 + 8 + 8 = 24</td><td>0 + 1 + 8 = 9</td><td><strong>15</strong></td></tr>
    <tr><td>(2, 1)</td><td>2–4, 1–3</td><td>1 + 8 + 8 = 17</td><td>1 + 2 + 8 = 11</td><td><strong>6</strong></td></tr>
    <tr><td>(2, 2)</td><td>2–4, 2–4</td><td>0 + 1 + 8 = 9</td><td>8 + 8 + 8 = 24</td><td><strong>−15</strong></td></tr>
  </table>
  <p>The biggest value, 21, sits exactly where the window's left side is road and its right side is the deepest part of the hole, and −21 marks the matching right rim. Now the same calculation in NumPy, written with two plain loops so that every step is visible:</p>
    <div class="fx" data-lang="py">K = np.array([[1, 0, -1],
              [1, 0, -1],
              [1, 0, -1]], dtype=float)          # vertical-edge filter: left column - right column
out = np.zeros((3, 3))                           # a 3x3 filter fits 3 times across and 3 times down
for i in range(3):
    for j in range(3):
        window = patch[i:i+3, j:j+3]             # the 3x3 window under the filter
        out[i, j] = (window * K).sum()           # multiply cell by cell, then add up
print(out)
print("smooth road:", (np.full((3, 3), 8.0) * K).sum())</div>
  <div class="fx" data-lang="text">[[ 14.   7. -14.]
 [ 21.  13. -21.]
 [ 15.   6. -15.]]
smooth road: 0.0</div>
  <p><code>patch[i:i+3, j:j+3]</code> is the sliding window at position (i, j), and <code>(window * K).sum()</code> is the multiply-and-add. All nine numbers match the table. The last line checks a patch of smooth road: every window has a left column of 24 and a right column of 24, so the answer is 0, "no edge here". The filter answers its single question at every position using just these 9 weights.</p>
  <p>In symbols, the output at row i and column j is out(i, j) = Σ<sub>m,n</sub> K(m, n) · X(i + m, j + n) + b, where K is the kernel, X the input, m and n run over the kernel's rows and columns, and b is a single bias added to every output. In other words, a dot product between the kernel and the window under it, repeated at every position. PyTorch provides it as <code>F.conv2d</code>. It expects a batch of images shaped (N, C, H, W): the number of images N, the number of channels C (1 for grey), the height H and the width W. The kernel must be shaped (C<sub>out</sub>, C<sub>in</sub>, k, k): the number of output maps, the number of input channels, and the kernel's height and width. So we reshape our grid and kernel before calling it:</p>
    <div class="fx" data-lang="py">X  = torch.tensor(patch, dtype=torch.float32).reshape(1, 1, 5, 5)   # (N, C, H, W)
Kt = torch.tensor(K, dtype=torch.float32).reshape(1, 1, 3, 3)       # (C_out, C_in, k, k)
y = F.conv2d(X, Kt)
print(tuple(X.shape), tuple(Kt.shape), "-&gt;", tuple(y.shape))
print(y[0, 0])</div>
  <div class="fx" data-lang="text">(1, 1, 5, 5) (1, 1, 3, 3) -&gt; (1, 1, 3, 3)
tensor([[ 14.,   7., -14.],
        [ 21.,  13., -21.],
        [ 15.,   6., -15.]])</div>
  <p>The 5 × 5 patch became (1, 1, 5, 5), one image with one channel, and the kernel (1, 1, 3, 3). PyTorch returned (1, 1, 3, 3) holding exactly our nine numbers. Two remarks complete the picture. First, in a real CNN nobody chooses the kernel values by hand as we did; they start random and are <em>learned</em> by <a class="xref" data-note="dl_backprop">backpropagation</a>, and trained networks very often end up with edge detectors much like this one in their first layer. Second, mathematicians would call this operation <strong>cross-correlation</strong>: the textbook definition of convolution flips the kernel first. Since the weights are learned anyway, flipping makes no difference, and deep-learning libraries skip it, but interviewers occasionally ask.</p>

  <h2 id="dc-pad"><span class="num">03</span>Padding and Stride</h2>
  <p>Our 5 × 5 patch came out as a 3 × 3 map. Each 3 × 3 convolution loses one pixel on every side, so after ten such layers a small image would vanish completely. Pixels at the border are also under-used: the corner pixel was covered by only one window, while the centre pixel was covered by nine, so a pothole that starts at the edge of a patch gets less attention. Two settings control this. <strong>Padding</strong> adds a border of extra pixels, usually zeros, around the image before sliding, so the kernel can also be centred on the edge pixels. <strong>Stride</strong> is how many pixels the kernel jumps between positions; with stride 2 it visits every second position, which roughly halves the output size. Padding is like the white margin around a photo in a frame, which lets the stamp be pressed right up to the photo's edge. Stride is like a ticket checker who checks every second seat: quicker, but seeing half as much.</p>
  <p>With padding 1 the patch becomes 7 × 7 with a ring of zeros, the 3 × 3 kernel now fits at 5 × 5 positions, and the output stays 5 × 5. Let us predict one new value by hand. The new top-left window is [[0, 0, 0], [0, 8, 8], [0, 8, 8]]: left column 0, right column 0 + 8 + 8 = 16, so the output is 0 − 16 = −16. That is a "right rim" signal at the corner of smooth road, which is false: to the filter, the zeros of the padding look like a dark hole. The inner 3 × 3 of the padded output should equal our unpadded answer.</p>
    <div class="fx" data-lang="py">print(F.pad(X, (1, 1, 1, 1))[0, 0].int())               # zero border: 5x5 -&gt; 7x7
same = F.conv2d(X, Kt, padding=1)[0, 0]
print(same.int())                                       # output stays 5x5
print("inner 3x3 equals the unpadded map:", torch.equal(same[1:4, 1:4], F.conv2d(X, Kt)[0, 0]))
print(F.conv2d(X, Kt, padding=1, stride=2)[0, 0].int())  # stride 2: every other position</div>
  <div class="fx" data-lang="text">tensor([[0, 0, 0, 0, 0, 0, 0],
        [0, 8, 8, 8, 8, 8, 0],
        [0, 8, 8, 2, 1, 8, 0],
        [0, 8, 1, 0, 1, 8, 0],
        [0, 8, 8, 1, 2, 8, 0],
        [0, 8, 8, 8, 8, 8, 0],
        [0, 0, 0, 0, 0, 0, 0]], dtype=torch.int32)
tensor([[-16,   6,   7,  -6,   9],
        [-17,  14,   7, -14,  10],
        [-17,  21,  13, -21,   4],
        [-17,  15,   6, -15,  11],
        [-16,   7,   6,  -7,  10]], dtype=torch.int32)
inner 3x3 equals the unpadded map: True
tensor([[-16,   7,   9],
        [-17,  13,   4],
        [-16,   6,  10]], dtype=torch.int32)</div>
  <p>The padded output's top-left value is −16 as predicted, and its inner 3 × 3 block is exactly the earlier map. The first and last columns (−16, −17, … and 9, 10, 4, …) are invented edges caused by the zero border. That is a real effect: networks sometimes "see" defects at image borders because of zero padding, and reflect or replicate padding (<code>padding_mode="reflect"</code>) avoids it. The stride-2 output keeps every second cell of the padded output: rows 0, 2, 4 and columns 0, 2, 4, giving 3 × 3.</p>
  <p>All of these sizes follow from one formula that is worth memorising, because you need it every time you design a network:</p>
  <p style="text-align:center"><strong>output size = ⌊(W − K + 2P) / S⌋ + 1</strong></p>
  <p>Here W is the input size, K the kernel size, P the padding on each side, S the stride, and ⌊ ⌋ means round down. The reasoning is simple: after padding the input is W + 2P wide; the kernel's first position uses K of those pixels, which leaves W + 2P − K pixels to slide over; jumping S at a time gives ⌊(W + 2P − K)/S⌋ further positions, plus the first one. On our patch (W = 5, K = 3): no padding gives (5 − 3)/1 + 1 = 3; padding 1 gives (5 − 3 + 2)/1 + 1 = 5; padding 1 with stride 2 gives ⌊4/2⌋ + 1 = 3; no padding with stride 2 gives ⌊2/2⌋ + 1 = 2. The code checks the formula against real PyTorch layers, including a 32-pixel image and the first layer of ResNet on a 224-pixel photo:</p>
    <div class="fx" data-lang="py">def out_size(W, K, P, S):
    return (W - K + 2 * P) // S + 1
for W, K_, P, S in [(5, 3, 0, 1), (5, 3, 1, 1), (5, 3, 1, 2), (5, 3, 0, 2), (32, 5, 2, 2), (224, 7, 3, 2)]:
    real = nn.Conv2d(1, 1, K_, stride=S, padding=P)(torch.zeros(1, 1, W, W)).shape[-1]
    print(f"W={W:3d} K={K_} P={P} S={S}:  formula {out_size(W, K_, P, S):3d}   PyTorch {real}")</div>
  <div class="fx" data-lang="text">W=  5 K=3 P=0 S=1:  formula   3   PyTorch 3
W=  5 K=3 P=1 S=1:  formula   5   PyTorch 5
W=  5 K=3 P=1 S=2:  formula   3   PyTorch 3
W=  5 K=3 P=0 S=2:  formula   2   PyTorch 2
W= 32 K=5 P=2 S=2:  formula  16   PyTorch 16
W=224 K=7 P=3 S=2:  formula 112   PyTorch 112</div>
  <p>Every prediction matches. Notice the rounding down: an input of 64 with K = 3, P = 0 and S = 2 gives ⌊61/2⌋ + 1 = 31, not 31.5 or 32, and such off-by-one sizes are a common source of shape errors later in a network. In practice two settings dominate. Kernel 3 with padding 1 and stride 1 keeps the size unchanged; this is called <strong>"same" padding</strong> and is the default inside a network. Stride 2 halves the size and is used when the network deliberately wants to shrink the image. No padding at all is called <strong>"valid"</strong> padding and shrinks the image by K − 1.</p>

  <h2 id="dc-maps"><span class="num">04</span>Filters and Channels</h2>
  <p>Our filter asks a single question: "is there a vertical edge here?". A pothole also has a top rim and a bottom rim, and the van's camera shoots in colour. So a real layer grows in two directions. First, it has <strong>many filters</strong>, each its own pattern detector, and each filter produces its own output map. Second, each filter has <strong>depth</strong>: it always covers <em>all</em> the channels of its input. Think of a panel of road inspectors. Each inspector looks for one thing, say vertical cracks or horizontal cracks, and each one looks at all three colour photos of the same spot at once before writing down a single mark for that spot. Two inspectors produce two mark-sheets.</p>
  <p>Let us add a second filter: the vertical one turned on its side, [[1, 1, 1], [0, 0, 0], [−1, −1, −1]], which computes <strong>top row − bottom row</strong>, a horizontal-edge detector. At the window covering rows 0–2 and columns 1–3, the top row is 8 + 8 + 8 = 24 and the bottom row 1 + 0 + 1 = 2, giving 22: the top rim of the hole. At rows 2–4, columns 1–3, the top row is 1 + 0 + 1 = 2 and the bottom row 24, giving −22: the bottom rim. A layer holding both filters is <code>nn.Conv2d(1, 2, 3)</code>, meaning 1 input channel, 2 output channels (one per filter), kernel size 3.</p>
    <div class="fx" data-lang="py">two = nn.Conv2d(in_channels=1, out_channels=2, kernel_size=3, bias=False)
with torch.no_grad():
    two.weight[0, 0] = torch.tensor(K)          # filter 0: vertical edges   (left - right)
    two.weight[1, 0] = torch.tensor(K.T)        # filter 1: horizontal edges (top - bottom)
maps = two(X)
print("output shape", tuple(maps.shape))
print("vertical-edge map\\n", maps[0, 0].int())
print("horizontal-edge map\\n", maps[0, 1].int())</div>
  <div class="fx" data-lang="text">output shape (1, 2, 3, 3)
vertical-edge map
 tensor([[ 14,   7, -14],
        [ 21,  13, -21],
        [ 15,   6, -15]], dtype=torch.int32)
horizontal-edge map
 tensor([[ 15,  22,  15],
        [  1,   0,   0],
        [-15, -22, -15]], dtype=torch.int32)</div>
  <p>One input produced two maps, stacked along the channel axis, so the output shape is (1, 2, 3, 3). The vertical map lights up on the left (+) and right (−) rims; the horizontal map on the top (+) and bottom (−) rims. Together they outline the pothole on all four sides.</p>
  <p>Now colour. A colour image has 3 channels (red, green, blue), so its shape is (1, 3, 5, 5). A "3 × 3" filter on it is really 3 × 3 × 3 = 27 weights, one 3 × 3 slice for each colour. At each position it multiplies all 27 numbers under it by its 27 weights and adds them up, plus one bias, so it still produces one number per position. With 2 such filters, the layer's weight tensor has shape (2, 3, 3, 3) and the output is again 2 maps. This gives the general rule for counting a convolution's parameters, a classic interview question:</p>
  <p style="text-align:center"><strong>parameters = C<sub>out</sub> × C<sub>in</sub> × k × k + C<sub>out</sub></strong></p>
  <p>Each of the C<sub>out</sub> filters has C<sub>in</sub> × k × k weights and one bias. For our colour layer that is 2 × 3 × 3 × 3 + 2 = 56. The code builds a colour version of the patch (muddy water in the hole makes it a little bluer), checks one output number by hand, and verifies the formula on some typical layers:</p>
    <div class="fx" data-lang="py">torch.manual_seed(0)
rgb = np.stack([patch, patch, patch + (patch &lt;= 2) * 2])       # R, G, B: muddy water is bluer
xc = torch.tensor(rgb, dtype=torch.float32).unsqueeze(0)       # (1, 3, 5, 5)
conv = nn.Conv2d(in_channels=3, out_channels=2, kernel_size=3)
print("input ", tuple(xc.shape), " weight", tuple(conv.weight.shape), " bias", tuple(conv.bias.shape))
yc = conv(xc)
print("output", tuple(yc.shape))
by_hand = (xc[0, :, 0:3, 0:3] * conv.weight[1]).sum() + conv.bias[1]   # 27 products + bias
print(round(by_hand.item(), 4), round(yc[0, 1, 0, 0].item(), 4))
for c_in, c_out, k in [(3, 2, 3), (3, 64, 3), (64, 128, 3), (256, 64, 1)]:
    print(f"Conv2d({c_in}, {c_out}, {k}): formula {c_out*c_in*k*k + c_out:&gt;7,}  PyTorch {count(nn.Conv2d(c_in, c_out, k)):&gt;7,}")</div>
  <div class="fx" data-lang="text">input  (1, 3, 5, 5)  weight (2, 3, 3, 3)  bias (2,)
output (1, 2, 3, 3)
1.2052 1.2052
Conv2d(3, 2, 3): formula      56  PyTorch      56
Conv2d(3, 64, 3): formula   1,792  PyTorch   1,792
Conv2d(64, 128, 3): formula  73,856  PyTorch  73,856
Conv2d(256, 64, 1): formula  16,448  PyTorch  16,448</div>
  <p><code>xc[0, :, 0:3, 0:3]</code> takes image 0, <em>all</em> channels, rows 0–2 and columns 0–2: a 3 × 3 × 3 block. <code>conv.weight[1]</code> is filter number 1, also 3 × 3 × 3. Multiplying them, summing all 27 products and adding the bias gives exactly PyTorch's output for channel 1 at position (0, 0). So a multi-channel convolution is the same multiply-and-add as before, just summed across channels as well. The formula matches PyTorch on every layer. Look at the third one: deep inside a network, a <code>Conv2d(64, 128, 3)</code> has 73,856 parameters, and its 64 "input channels" are no longer colours but the 64 feature maps produced by the previous layer. The most common slip in interviews is to forget the C<sub>in</sub> factor: <code>Conv2d(3, 64, 3)</code> has 64 × 3 × 3 × 3 + 64 = 1,792 parameters, not 64 × 3 × 3 + 64 = 640.</p>
  <p>The last layer in the list has a kernel of size 1. A <strong>1 × 1 convolution</strong> looks at a single pixel position, so it never mixes neighbouring pixels; what it does is mix the channels at each position, like a small fully connected layer applied separately to every pixel. Here it turns 256 channels into 64 with 16,448 parameters while keeping the height and width. Networks use 1 × 1 convolutions as a cheap way to reduce or increase the number of channels, and we will meet them again in Inception, ResNet and MobileNet.</p>

  <h2 id="dc-fmap"><span class="num">05</span>Feature Maps and Equivariance</h2>
  <p>We now get one output grid per filter, and it is worth being precise about what these grids mean. A <strong>feature map</strong> is the output of one filter: a map of where the filter's pattern occurs in the input and how strongly. Each cell corresponds to one window of the input. The values in feature maps are also called <strong>activations</strong>. You can think of a feature map as a heat map on a food-delivery app showing where orders come from: each cell is an area, and brightness shows how much activity there is. A feature map is a heat map of one pattern over the image.</p>
  <p>After a convolution, a CNN almost always applies <strong>ReLU</strong>, which replaces every negative value by 0 and keeps positive values unchanged. On our vertical-edge map this keeps the left-rim column and zeroes the right-rim column. The right rim is not lost for good: a network simply learns a second filter with the opposite signs, whose positive output marks the right rim. It is therefore wrong to read a negative value in a raw map as "nothing"; it means "the opposite pattern".</p>
  <p>Now we can test the promise from section 01. Move the pothole one pixel to the right (the shifted patch we built there) and apply the same filter. If the convolution is translation equivariant, the map should move one cell to the right as well, with the same values:</p>
    <div class="fx" data-lang="py">relu_map = torch.relu(F.conv2d(X, Kt))[0, 0]
print("ReLU(edge map), original patch\\n", relu_map.int())
Xs = torch.tensor(shifted, dtype=torch.float32).reshape(1, 1, 5, 5)
ms = torch.relu(F.conv2d(Xs, Kt))[0, 0]
print("same filter, shifted patch\\n", ms.int())
print("strongest:", relu_map.max().item(), "at", divmod(relu_map.argmax().item(), 3),
      "| shifted:", ms.max().item(), "at", divmod(ms.argmax().item(), 3))</div>
  <div class="fx" data-lang="text">ReLU(edge map), original patch
 tensor([[14,  7,  0],
        [21, 13,  0],
        [15,  6,  0]], dtype=torch.int32)
same filter, shifted patch
 tensor([[ 7, 14,  7],
        [ 7, 21, 13],
        [ 7, 15,  6]], dtype=torch.int32)
strongest: 21.0 at (1, 0) | shifted: 21.0 at (1, 1)</div>
  <p>The strongest response, 21, moved from cell (1, 0) to cell (1, 1): one step right, with the same value. That is <strong>translation equivariance</strong>, measured: shifting the input shifts the output map by the same amount (apart from small differences at the border, here the 7s that appear on the left). Compare the MLP, which saw 10 of its 25 inputs change. The convolution simply moved its answer.</p>
  <p>In a trained network, feature maps form a hierarchy. First-layer filters become edge and colour-blob detectors, much like ours. Second-layer filters take the first layer's maps as their input channels, so they detect combinations of edges: corners, rims, and textures such as cracked asphalt. Deeper layers detect parts, such as the shadowed rim of a pothole or the outline of a manhole cover, and the deepest layers respond to whole objects. Each layer's feature maps are, in effect, the next layer's image.</p>

  <h2 id="dc-pool"><span class="num">06</span>Pooling</h2>
  <p>Feature maps are as large as the image (5 × 5 with padding here, 112 × 112 in a real network), and they record the exact pixel of every edge. To answer "is there a pothole?" we do not need the exact pixel; "an edge was found around here" is enough. Carrying full-size maps through every layer is also expensive. <strong>Pooling</strong> solves both: it summarises each small window of a map, usually 2 × 2 with stride 2, by a single number. <strong>Max pooling</strong> keeps the largest value in the window, answering "was the pattern anywhere in this window?". <strong>Average pooling</strong> keeps the mean. Pooling has no weights to learn, and it works on each channel separately, so the number of channels does not change. Picture a classroom where each bench of four students sends only its top mark to the teacher: the teacher learns the best score per bench but no longer knows who sat where. That is max pooling; sending the bench average would be average pooling.</p>
  <p>Take the padded 5 × 5 edge map from section 03 after ReLU. The size formula with K = 2, S = 2, P = 0 gives ⌊(5 − 2)/2⌋ + 1 = 2, so 2 × 2 windows cover rows 0–3 and columns 0–3, and the last row and column are dropped by the rounding. The four windows are {0, 6, 0, 14}, {7, 0, 7, 0}, {0, 21, 0, 15} and {13, 0, 6, 0}; their maxima are 14, 7, 21 and 13, and their means 5, 3.5, 9 and 4.75.</p>
    <div class="fx" data-lang="py">fm = torch.relu(F.conv2d(X, Kt, padding=1))           # (1, 1, 5, 5) padded edge map after ReLU
print(fm[0, 0].int())
print(nn.MaxPool2d(2)(fm)[0, 0])                      # 2x2 windows, stride 2 -&gt; (2, 2)
print(nn.AvgPool2d(2)(fm)[0, 0])
gm  = torch.relu(F.conv2d(X,  Kt)).amax(dim=(2, 3))   # global max: whole map -&gt; 1 number
gms = torch.relu(F.conv2d(Xs, Kt)).amax(dim=(2, 3))
print("global max: patch", gm.item(), " shifted patch", gms.item())
fmap = torch.randn(8, 128, 7, 7)                      # a typical end-of-network shape
print(tuple(nn.AdaptiveAvgPool2d(1)(fmap).shape))</div>
  <div class="fx" data-lang="text">tensor([[ 0,  6,  7,  0,  9],
        [ 0, 14,  7,  0, 10],
        [ 0, 21, 13,  0,  4],
        [ 0, 15,  6,  0, 11],
        [ 0,  7,  6,  0, 10]], dtype=torch.int32)
tensor([[14.,  7.],
        [21., 13.]])
tensor([[5.0000, 3.5000],
        [9.0000, 4.7500]])
global max: patch 21.0  shifted patch 21.0
(8, 128, 1, 1)</div>
  <p>Both pooled maps match the hand calculation, and the dropped last column (9, 10, 4, 11, 10) was the fake padding edge anyway. Then we pool over the <em>whole</em> map, called <strong>global max pooling</strong>: the answer is 21 for the original patch and also 21 for the shifted patch. After global pooling, "is there a left rim anywhere?" no longer depends on where the pothole sits. This is the difference between equivariance and <strong>invariance</strong>: the convolution is equivariant (its output moves with the input), while pooling, and especially global pooling, makes the final answer invariant (unchanged when the input moves). People often say "CNNs are translation invariant", but the invariance comes from pooling, not from the convolution itself.</p>
  <p>The last line shows <strong>global average pooling</strong> (GAP), written <code>nn.AdaptiveAvgPool2d(1)</code> in PyTorch, on a typical end-of-network tensor of 8 images with 128 maps of 7 × 7: each map is averaged into one number, giving (8, 128, 1, 1). Whatever the input size, GAP turns the maps into a fixed-length vector of one number per channel, which is what the final classifier needs. Modern networks often shrink maps inside the network with stride-2 convolutions instead of max pooling, because a strided convolution learns what to keep while pooling throws away three of every four values by a fixed rule, but almost all of them still end with global average pooling.</p>

  <h2 id="dc-stack"><span class="num">07</span>Receptive Field and the CNN Recipe</h2>
  <p>Every tool so far works within one layer, and a single 3 × 3 layer only ever looks at 3 × 3 pixels. That is enough to see a rim, but not to tell a pothole (a dark area with rims all round) from a single crack (one rim), and certainly not enough to see a whole stretch of road. The answer is to stack layers. A unit in layer 2 looks at a 3 × 3 window of layer-1 maps; each of those layer-1 cells looked at 3 × 3 pixels; together that covers 5 × 5 pixels, our whole patch. The region of the input image that can influence one unit is called its <strong>receptive field</strong>. It is like looking at a cricket photo: first you notice lines and colours, then shapes such as a bat and stumps, then the scene, "a batsman being bowled". Each step looks at a bigger region with richer meaning.</p>
  <p>The receptive field r can be tracked layer by layer with a rule that also tracks the <strong>jump</strong> j, the number of input pixels that one step in the current map corresponds to. Start with r = 1 and j = 1. For each layer with kernel size k and stride s: r becomes r + (k − 1) × j, and then j becomes j × s. In words, each layer widens the view by (k − 1) steps of the current map, and every stride makes later steps bigger.</p>
  <table class="tbl">
    <tr><th>After layer</th><th>k, s</th><th>r = r + (k − 1)·j</th><th>j = j·s</th><th>Sees</th></tr>
    <tr><td>conv 3×3</td><td>3, 1</td><td>1 + 2·1 = <strong>3</strong></td><td>1</td><td>a rim</td></tr>
    <tr><td>conv 3×3</td><td>3, 1</td><td>3 + 2·1 = <strong>5</strong></td><td>1</td><td>our whole 5×5 patch</td></tr>
    <tr><td>pool 2×2</td><td>2, 2</td><td>5 + 1·1 = <strong>6</strong></td><td>2</td><td></td></tr>
    <tr><td>conv 3×3</td><td>3, 1</td><td>6 + 2·2 = <strong>10</strong></td><td>2</td><td>a stretch of road</td></tr>
  </table>
  <p>We can check the table without the formula. The receptive field is exactly the set of input pixels whose gradient on one output unit is not zero, so we build the stack, pick the unit in the middle of the output, back-propagate from it, and measure how many input rows received a gradient:</p>
    <div class="fx" data-lang="py">def receptive_field(layers, size=24):
    torch.manual_seed(0)
    x = torch.randn(1, 1, size, size, requires_grad=True)
    y = nn.Sequential(*layers)(x)
    c = y.shape[-1] // 2
    y[0, 0, c, c].backward()                          # one output unit in the middle
    rows = (x.grad[0, 0].abs().sum(1) &gt; 0).nonzero()  # input rows that influenced it
    return int(rows.max() - rows.min() + 1)
conv3 = lambda: nn.Conv2d(1, 1, 3, padding=1)
pool2 = lambda: nn.AvgPool2d(2)
print("conv                ", receptive_field([conv3()]))
print("conv conv           ", receptive_field([conv3(), conv3()]))
print("conv conv pool      ", receptive_field([conv3(), conv3(), pool2()]))
print("conv conv pool conv ", receptive_field([conv3(), conv3(), pool2(), conv3()]))
two_valid = nn.Sequential(nn.Conv2d(1, 1, 3), nn.Conv2d(1, 1, 3))
print("two unpadded 3x3 convs on the 5x5 patch -&gt;", tuple(two_valid(X).shape))</div>
  <div class="fx" data-lang="text">conv                 3
conv conv            5
conv conv pool       6
conv conv pool conv  10
two unpadded 3x3 convs on the 5x5 patch -&gt; (1, 1, 1, 1)</div>
  <p>The measured sizes are 3, 5, 6 and 10, the same as the table. (The check uses average pooling, because max pooling passes the gradient only to the winning pixel of each window, which would make the count depend on the random input.) The last line shows what this means for our running example: two unpadded 3 × 3 convolutions turn the 5 × 5 patch into a single number, which depends on all 25 pixels, so a layer-2 unit can combine "left rim here" and "right rim there" into "a hole between them".</p>
  <p>Stacking small kernels is also cheaper than using one big one. Two 3 × 3 layers see a 5 × 5 region, just like one 5 × 5 layer, but with 64 channels they need 2 × 9 × 64 × 64 = 73,728 weights instead of 25 × 64 × 64 = 102,400, about 28% fewer, and they put an extra ReLU in between, which makes the function more flexible. This is why almost every modern CNN uses 3 × 3 kernels. One caution: the receptive field computed this way is an upper bound. In practice pixels near its centre influence a unit far more than pixels near its edge, so a network that must recognise large objects needs more depth or more downsampling than the formula alone suggests.</p>
  <p>Now we have all the bricks: convolutions find patterns, ReLU keeps the positive evidence, pooling or stride shrinks the maps and widens the receptive field, and a final linear layer makes the decision. The way to arrange them has been stable for decades: repeat a stage that <strong>shrinks the picture and adds more filters</strong>, then pool everything globally and classify. Early layers look at small regions and need only a few filters, because there are few kinds of edges. Later layers combine edges into many kinds of textures and parts, so they need more channels, but they no longer need precise pixel positions. Halving height and width while doubling channels keeps the amount of computation per layer roughly balanced.</p>
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
  <p>Before running the network in the figure, predict every shape with the size formula. A batch of 8 colour images is (8, 3, 32, 32). Conv(3 → 32, kernel 3, padding 1) keeps 32 × 32: (8, 32, 32, 32), with 32 × 3 × 9 + 32 = 896 parameters. Max pooling halves it: (8, 32, 16, 16). Conv(32 → 64): (8, 64, 16, 16), 64 × 32 × 9 + 64 = 18,496 parameters. Pooling: (8, 64, 8, 8). Conv(64 → 128): (8, 128, 8, 8), 73,856 parameters. Global average pooling: (8, 128, 1, 1), flattened to (8, 128). Linear(128 → 10): (8, 10), 128 × 10 + 10 = 1,290 parameters.</p>
    <div class="fx" data-lang="py">net = nn.Sequential(
    nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),   # stage 1
    nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),  # stage 2
    nn.Conv2d(64, 128, 3, padding=1), nn.ReLU(),                  # stage 3
    nn.AdaptiveAvgPool2d(1), nn.Flatten(),                        # global average pool
    nn.Linear(128, 10))                                           # classifier head
x = torch.randn(8, 3, 32, 32)
for layer in net:
    x = layer(x)
    if not isinstance(layer, nn.ReLU):
        print(f"{layer.__class__.__name__:18s} {str(tuple(x.shape)):18s} params {count(layer):,}")
print("total params:", f"{count(net):,}")</div>
  <div class="fx" data-lang="text">Conv2d             (8, 32, 32, 32)    params 896
MaxPool2d          (8, 32, 16, 16)    params 0
Conv2d             (8, 64, 16, 16)    params 18,496
MaxPool2d          (8, 64, 8, 8)      params 0
Conv2d             (8, 128, 8, 8)     params 73,856
AdaptiveAvgPool2d  (8, 128, 1, 1)     params 0
Flatten            (8, 128)           params 0
Linear             (8, 10)            params 1,290
total params: 94,538</div>
  <p>Every line matches. Looping over an <code>nn.Sequential</code> and printing each layer's output shape like this is the quickest way to find a shape bug in a new model. Notice also where the parameters are: the deepest convolution holds about 78% of them, while pooling and flattening hold none. In practice a <strong>BatchNorm</strong> layer is usually placed after each convolution (the "conv–BN–ReLU" block), which normalises each channel's activations over the batch and makes training faster and more stable; it is covered in <a class="xref" data-note="dl_training">Training Neural Networks</a>.</p>

  <h2 id="dc-train"><span class="num">08</span>Training a CNN</h2>
  <p>So far we have chosen the filters by hand. The real question is whether a CNN can <em>learn</em> useful filters from labelled examples, and whether weight sharing really helps when potholes appear in new places. A 5 × 5 patch is too small to train on, so we now generate realistic-looking road patches of 16 × 16 pixels with brightness from 0 to 1. Each patch is asphalt with a random overall brightness (sun or shade) and some grain. Half of the patches get a pothole, a dark oval of random size. To make the task honest, half of <em>all</em> patches, with or without a pothole, also get a thin dark crack, so a model cannot just count dark pixels; it must recognise the shape of a hole.</p>
  <p>We also set a deliberate trap. In the training data, potholes appear only in the <em>left</em> part of the patch (centre column between 2.5 and 6.5). We then test on two sets: new patches with potholes in the same left part, and patches with potholes only on the <em>right</em> (centre column between 9.5 and 13.5). This imitates a common real situation: the training photos happen to show objects in some places, and the model must still work when they appear elsewhere.</p>
    <div class="fx" data-lang="py">S = 16                                            # patches are 16 x 16 pixels, brightness 0..1
yy, xx = np.mgrid[0:S, 0:S]

def road_patch(rng, pothole, cols=(2.5, 13.5)):
    img = np.clip(rng.uniform(0.6, 0.9) + rng.normal(0, 0.06, (S, S)), 0, 1)   # asphalt + grain
    if pothole:                                   # a dark oval, centre column drawn from &#96;cols&#96;
        cy, cx = rng.uniform(4, 11.5), rng.uniform(*cols)
        ry, rx = rng.uniform(1.6, 2.8), rng.uniform(1.6, 2.8)
        hole = ((yy - cy) / ry) ** 2 + ((xx - cx) / rx) ** 2 &lt;= 1
        img[hole] = rng.uniform(0.05, 0.25) + rng.normal(0, 0.04, hole.sum())
    if rng.random() &lt; 0.5:                        # half of all patches get a thin dark crack
        a, cy, cx = rng.uniform(0, np.pi), rng.uniform(4, 12), rng.uniform(4, 12)
        for t in np.linspace(-4, 4, 40):
            y, x = int(round(cy + t * np.sin(a))), int(round(cx + t * np.cos(a)))
            if 0 &lt;= y &lt; S and 0 &lt;= x &lt; S: img[y, x] = rng.uniform(0.05, 0.25)
    return img

def make_set(n, cols, seed):
    rng = np.random.default_rng(seed)
    labels = np.arange(n) % 2                     # half potholes, half not
    imgs = np.stack([road_patch(rng, lab, cols) for lab in labels])[:, None]   # (n, 1, 16, 16)
    return torch.tensor(imgs, dtype=torch.float32), torch.tensor(labels)

X_train, y_train = make_set(2000, cols=(2.5, 6.5), seed=1)     # potholes only in the LEFT part
X_left,  y_left  = make_set(1000, cols=(2.5, 6.5), seed=2)     # test: same positions
X_right, y_right = make_set(1000, cols=(9.5, 13.5), seed=3)    # test: potholes on the RIGHT
print(X_train.shape, y_train[:6].tolist())
print((X_train[1, 0] * 9).int())                               # patch 1 (a pothole), scaled to 0..9</div>
  <div class="fx" data-lang="text">torch.Size([2000, 1, 16, 16]) [0, 1, 0, 1, 0, 1]
tensor([[6, 5, 6, 5, 5, 6, 5, 6, 6, 6, 5, 5, 6, 4, 7, 5],
        [5, 6, 6, 5, 6, 6, 6, 6, 6, 5, 6, 6, 5, 5, 6, 5],
        [6, 6, 6, 6, 6, 5, 6, 7, 6, 5, 6, 5, 5, 6, 6, 7],
        [6, 6, 6, 6, 1, 1, 5, 6, 6, 5, 6, 5, 7, 6, 5, 5],
        [6, 6, 5, 0, 2, 2, 1, 6, 6, 6, 5, 6, 6, 6, 7, 5],
        [6, 5, 6, 1, 2, 0, 0, 6, 5, 5, 6, 6, 5, 6, 6, 6],
        [6, 6, 5, 1, 1, 1, 1, 5, 6, 6, 6, 6, 5, 6, 6, 7],
        [5, 5, 6, 5, 1, 1, 6, 5, 6, 6, 7, 6, 6, 5, 6, 6],
        [6, 6, 5, 6, 6, 6, 6, 6, 5, 6, 6, 5, 6, 5, 5, 5],
        [7, 5, 6, 6, 6, 6, 5, 5, 6, 5, 6, 5, 6, 6, 5, 6],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 7, 5, 7, 6, 6],
        [5, 6, 6, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 7, 6],
        [6, 6, 5, 5, 6, 6, 7, 6, 6, 7, 6, 7, 6, 6, 6, 6],
        [6, 6, 6, 6, 5, 6, 5, 6, 6, 6, 6, 6, 5, 6, 6, 6],
        [6, 7, 6, 6, 6, 6, 5, 5, 6, 6, 6, 6, 6, 6, 5, 6],
        [6, 5, 7, 5, 5, 5, 6, 5, 6, 6, 6, 5, 5, 7, 5, 5]], dtype=torch.int32)</div>
  <p>The training set holds 2,000 patches, shaped (2000, 1, 16, 16), with labels alternating 0 and 1. Printing patch 1 scaled to 0–9 shows what the network sees: asphalt around 5 to 7, and a dark oval of 0s, 1s and 2s in rows 3 to 7 on the left side.</p>
  <p>Now two models. The CNN follows the recipe from section 07: a convolution with 8 filters, ReLU and max pooling (16 × 16 becomes 8 × 8), a convolution with 16 filters and ReLU, then <strong>global max pooling</strong>, which keeps for each of the 16 maps only its strongest response anywhere in the patch, and a Linear layer that turns those 16 numbers into two class scores. The MLP flattens the 256 pixels and uses one hidden layer of 32 neurons. The training loop is the standard PyTorch loop from the <a class="xref" data-note="dl_pytorch">PyTorch</a> note: shuffle, cut into mini-batches of 64, and for each batch clear gradients, compute the cross-entropy loss, back-propagate and step. Both models train for 10 epochs.</p>
    <div class="fx" data-lang="py">def train(model, X, y, epochs=10, lr=3e-3):
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    loss_fn = nn.CrossEntropyLoss()
    for ep in range(epochs):
        perm = torch.randperm(len(X))
        for i in range(0, len(X), 64):                         # mini-batches of 64
            idx = perm[i:i + 64]
            opt.zero_grad(); loss_fn(model(X[idx]), y[idx]).backward(); opt.step()

def accuracy(model, X, y):
    with torch.no_grad():
        return round((model(X).argmax(1) == y).float().mean().item(), 3)

torch.manual_seed(0)
cnn = nn.Sequential(
    nn.Conv2d(1, 8, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),    # (N, 8, 8, 8)
    nn.Conv2d(8, 16, 3, padding=1), nn.ReLU(),                    # (N, 16, 8, 8)
    nn.AdaptiveMaxPool2d(1), nn.Flatten(),                        # (N, 16): global max pool
    nn.Linear(16, 2))                                             # (N, 2): pothole / no pothole
torch.manual_seed(0)
mlp = nn.Sequential(nn.Flatten(), nn.Linear(256, 32), nn.ReLU(), nn.Linear(32, 2))

for name, model in [("CNN", cnn), ("MLP", mlp)]:
    train(model, X_train, y_train)
    print(f"{name}  params {count(model):5,}   test, left side {accuracy(model, X_left, y_left)}"
          f"   test, right side {accuracy(model, X_right, y_right)}")</div>
  <div class="fx" data-lang="text">CNN  params 1,282   test, left side 1.0   test, right side 0.992
MLP  params 8,290   test, left side 0.895   test, right side 0.468</div>
  <p>The results show the whole point of convolution. On potholes in familiar positions both models do reasonably well, the CNN perfectly. On potholes in the new, right-hand positions, the MLP collapses to 0.468, no better than tossing a coin, because each of its weights is tied to one exact pixel and the weights for the right side never learned anything about potholes. The CNN still scores 0.992, because the same filters slide over the right side, and global max pooling reports "found one" wherever the strongest response is. It does this with 1,282 parameters against the MLP's 8,290.</p>
  <p>Real projects still help the model further with <strong>data augmentation</strong>: during training each image is randomly shifted, cropped, flipped or brightened, so the model sees objects in many positions and lighting conditions. For road photos that means random crops, horizontal flips, and brightness changes for sun and shade. Convolution gives equivariance for free, but augmentation also covers changes that convolution does not handle, such as rotation, scale and lighting.</p>

  <h2 id="dc-arch"><span class="num">09</span>Classic Architectures</h2>
  <p>An <strong>architecture</strong> is a particular arrangement of layers: how many, how wide, and in what order. A handful of famous CNN architectures marked the steps in which the field learned how to build good image models, and interviewers expect you to know what each one contributed. Most of them were measured on <strong>ImageNet</strong>, a dataset of about 1.2 million photos in 1,000 classes, where the usual score is "top-5 accuracy", the share of photos whose correct class is among the model's five highest guesses.</p>
  <p><strong>LeNet-5</strong> (1998) read handwritten digits on bank cheques. It already had the full recipe: convolutions, pooling (then called subsampling), and fully connected layers at the end, with about 60,000 parameters. <strong>AlexNet</strong> (2012) won the ImageNet competition by a huge margin and started the deep-learning boom. It was LeNet's idea made much bigger, about 60 million parameters, and it made three choices that became standard: ReLU instead of sigmoid or tanh (ReLU does not saturate, so gradients stay healthy), dropout against overfitting, and training on GPUs. Its first layer used large 11 × 11 kernels with stride 4, which the size formula turns from 224 pixels into 55.</p>
  <p><strong>VGG-16</strong> (2014) asked a simple question: what if we use only 3 × 3 convolutions and just go deeper? It stacked 13 convolution layers in five stages, each stage ending with max pooling and doubling the channels (64, 128, 256, 512, 512), followed by three fully connected layers. Its regular design makes it the easiest classic network to remember, and its parameter count teaches an important lesson. We can build it on PyTorch's "meta" device, which records shapes without allocating any memory, and count:</p>
    <div class="fx" data-lang="py">def vgg16():
    cfg = [64, 64, "M", 128, 128, "M", 256, 256, 256, "M", 512, 512, 512, "M", 512, 512, 512, "M"]
    layers, c = [], 3
    for v in cfg:
        if v == "M": layers.append(nn.MaxPool2d(2))
        else: layers += [nn.Conv2d(c, v, 3, padding=1), nn.ReLU()]; c = v
    return nn.Sequential(*layers, nn.Flatten(),
                         nn.Linear(512 * 7 * 7, 4096), nn.ReLU(), nn.Linear(4096, 4096), nn.ReLU(),
                         nn.Linear(4096, 1000))
with torch.device("meta"):                    # shapes only: no memory, no weights
    vgg = vgg16()
convs = sum(count(m) for m in vgg if isinstance(m, nn.Conv2d))
print(f"VGG-16 total {count(vgg):,}   all 13 convs {convs:,}   first Linear {count(vgg[-5]):,}")
print("two 3x3 convs, 64 ch:", 2 * 3 * 3 * 64 * 64, "  one 5x5 conv, 64 ch:", 5 * 5 * 64 * 64)
print("AlexNet first conv, 224 in, K=11 P=2 S=4 -&gt;", out_size(224, 11, 2, 4))</div>
  <div class="fx" data-lang="text">VGG-16 total 138,357,544   all 13 convs 14,714,688   first Linear 102,764,544
two 3x3 convs, 64 ch: 73728   one 5x5 conv, 64 ch: 102400
AlexNet first conv, 224 in, K=11 P=2 S=4 -&gt; 55</div>
  <p>VGG-16 has 138 million parameters, but only 14.7 million of them are in the 13 convolution layers. The first fully connected layer alone, which connects the flattened 512 × 7 × 7 = 25,088 values to 4,096 neurons, holds 102.8 million, three quarters of the whole network. That is the MLP problem from section 01 again, at the end of the network. Later architectures replaced this flatten-and-connect step with global average pooling followed by one small Linear layer, which removed most of those weights with no loss of accuracy. The second line repeats the 3 × 3 argument from section 07: two stacked 3 × 3 layers cost 73,728 weights where one 5 × 5 layer costs 102,400.</p>
  <p><strong>GoogLeNet</strong>, also called <strong>Inception</strong> (2014), took a different path. Each "Inception module" runs 1 × 1, 3 × 3 and 5 × 5 convolutions and a pooling branch side by side on the same input and concatenates their outputs, so the network can look at several scales at once. To keep this affordable it first shrinks the channels with 1 × 1 convolutions (a "bottleneck"), and it ends with global average pooling. It reached better accuracy than VGG with about 7 million parameters.</p>
  <table class="tbl">
    <tr><th>Network</th><th>Year</th><th>Main idea</th><th>Params</th><th>ImageNet top-5</th></tr>
    <tr><td>LeNet-5</td><td>1998</td><td>conv + pool + FC on digits</td><td>60K</td><td>—</td></tr>
    <tr><td>AlexNet</td><td>2012</td><td>big CNN on GPUs; ReLU, dropout</td><td>60M</td><td>≈ 84.7%</td></tr>
    <tr><td>VGG-16</td><td>2014</td><td>only 3×3 convs, deeper</td><td>138M</td><td>≈ 92.7%</td></tr>
    <tr><td>GoogLeNet</td><td>2014</td><td>parallel branches, 1×1 bottlenecks, GAP</td><td>≈ 7M</td><td>≈ 93.3%</td></tr>
    <tr><td>ResNet-50</td><td>2015</td><td>skip connections, 50+ layers</td><td>25.6M</td><td>≈ 93%</td></tr>
    <tr><td>EfficientNet-B0</td><td>2019</td><td>searched blocks, compound scaling</td><td>5.3M</td><td>≈ 93%</td></tr>
  </table>
  <p>The trend in the table is that depth helped: each winner was deeper than the last. But researchers trying to go beyond about 20 layers ran into a wall, which is the subject of the next section.</p>

  <h2 id="dc-res"><span class="num">10</span>ResNet and Skip Connections</h2>
  <p>If depth gives a larger receptive field and richer features, a 56-layer network should beat a 20-layer one. In 2015, researchers found the opposite: plain CNNs deeper than about 20 layers had <em>higher</em> error, and not only on test data but on their own <em>training</em> data. That rules out overfitting, which would show low training error and high test error. The deeper networks were simply failing to learn, a puzzle called the <strong>degradation problem</strong>. The main reason is the one described in <a class="xref" data-note="dl_backprop">Backpropagation</a>: the gradient that reaches an early layer is a product of one factor per layer above it, and when those factors are below 1, fifty of them multiplied together give almost zero. The early layers then receive almost no learning signal. This is the <strong>vanishing gradient</strong> problem from <a class="xref" data-note="dl_training">Training Neural Networks</a>.</p>
  <p>The fix in the ResNet paper is a single line: add each block's input to its output. Instead of asking a group of layers to learn a whole transformation H(x), the block learns only the change F(x) and outputs <strong>y = F(x) + x</strong>. The added x is the <strong>skip connection</strong>, also called a shortcut, and a block built this way is a <strong>residual block</strong> (the "residual" is the change F). Think of correcting a student's homework instead of rewriting it from scratch. Each block only writes small corrections on top of what it received; if nothing needs fixing, it writes nothing and the answer passes through unchanged. And the teacher's feedback reaches the first student directly through the original answer, not only through every correction.</p>
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
  <p>On the left of the figure, a plain block must learn the whole output H(x). On the right, the green path carries x around the two convolution layers and adds it to their output F(x). Now look at the gradient. The derivative of y = F(x) + x with respect to x is ∂F/∂x + 1. Even if the layers' own factor ∂F/∂x is tiny, say 0.01, the block's factor is 1.01, not 0.01. Fifty factors of 0.01 multiply to 10<sup>−100</sup>, while fifty factors near 1 stay near 1. The experiment below builds a 50-layer network of small blocks, once without and once with skip connections, back-propagates once, and measures the size of the gradient that reaches the first and the last layer:</p>
    <div class="fx" data-lang="py">class Block(nn.Module):
    def __init__(self, d, skip):
        super().__init__(); self.f = nn.Sequential(nn.Linear(d, d), nn.Tanh()); self.skip = skip
    def forward(self, x):
        return x + self.f(x) if self.skip else self.f(x)        # F(x) + x   vs   F(x)

for skip in (False, True):
    torch.manual_seed(0)
    deep = nn.Sequential(*[Block(64, skip) for _ in range(50)])   # 50 layers
    deep(torch.randn(32, 64)).pow(2).mean().backward()
    print(f"skip={skip!s:5}  gradient at first layer {deep[0].f[0].weight.grad.norm():.2e}"
          f"   at last layer {deep[-1].f[0].weight.grad.norm():.2e}")</div>
  <div class="fx" data-lang="text">skip=False  gradient at first layer 1.31e-14   at last layer 1.45e-02
skip=True   gradient at first layer 1.63e+01   at last layer 5.71e+00</div>
  <p>Without skips, the first layer receives a gradient of about 10<sup>−14</sup>, effectively zero, so it would never learn, while the last layer gets a normal gradient. With skips, the first layer receives about 16. The skip connection does not make the layers' own factors bigger; it adds a second path whose factor is exactly 1, so the gradient always has a way back. The same "+ x" idea reappears as the cell state in <a class="xref" data-note="dl_rnns">LSTMs</a> and as the residual connections around every layer of a <a class="xref" data-note="transformers">Transformer</a>.</p>
  <p>A real convolutional residual block has two conv–BN layers in F. When the block keeps the shape, the shortcut is just x. When it halves the size and doubles the channels, for example from 64 channels at 56 × 56 to 128 channels at 28 × 28, x has the wrong shape to be added, so the shortcut becomes a 1 × 1 convolution with stride 2, called a <strong>projection shortcut</strong>, which produces the matching shape. The convolutions use <code>bias=False</code> because the BatchNorm right after each one has its own shift, which would make a bias redundant.</p>
    <div class="fx" data-lang="py">class ResBlock(nn.Module):
    def __init__(self, c_in, c_out, stride=1):
        super().__init__()
        self.f = nn.Sequential(
            nn.Conv2d(c_in, c_out, 3, stride=stride, padding=1, bias=False), nn.BatchNorm2d(c_out), nn.ReLU(),
            nn.Conv2d(c_out, c_out, 3, padding=1, bias=False), nn.BatchNorm2d(c_out))
        self.shortcut = nn.Identity()
        if stride != 1 or c_in != c_out:              # shapes differ: 1x1 conv "projection"
            self.shortcut = nn.Sequential(nn.Conv2d(c_in, c_out, 1, stride=stride, bias=False),
                                          nn.BatchNorm2d(c_out))
    def forward(self, x):
        return torch.relu(self.f(x) + self.shortcut(x))

x = torch.randn(4, 64, 56, 56)
same, down = ResBlock(64, 64), ResBlock(64, 128, stride=2)
print("same-shape block :", tuple(same(x).shape), type(same.shortcut).__name__)
print("downsample block :", tuple(down.f(x).shape), "+", tuple(down.shortcut(x).shape), "-&gt;", tuple(down(x).shape))</div>
  <div class="fx" data-lang="text">same-shape block : (4, 64, 56, 56) Identity
downsample block : (4, 128, 28, 28) + (4, 128, 28, 28) -&gt; (4, 128, 28, 28)</div>
  <p>The same-shape block returns (4, 64, 56, 56) unchanged, and its shortcut is the identity. In the downsampling block, the main path gives (4, 128, 28, 28) (the size formula: ⌊(56 − 3 + 2)/2⌋ + 1 = 28) and the projection shortcut also gives (4, 128, 28, 28), so the two can be added. Forget the projection and PyTorch stops with an error such as "The size of tensor a (28) must match the size of tensor b (56)". With residual blocks, networks of 50, 101 and 152 layers trained without trouble, and ResNet-50 became the standard backbone for years. Remember what skip connections fix: optimisation (training error), not overfitting.</p>

  <h2 id="dc-eff"><span class="num">11</span>Efficient CNNs</h2>
  <p>With residual blocks we can train very deep networks, but a road-inspection van might run its model on a small onboard computer or a phone, where memory and battery are limited. Two ideas made CNNs much cheaper without losing much accuracy.</p>
  <p>The first is the <strong>depthwise separable convolution</strong>, introduced by MobileNet. A normal convolution does two jobs at once: it looks at neighbouring pixels (the k × k part) and it mixes channels (the C<sub>in</sub> part), and its cost is the product of both. A depthwise separable convolution splits these jobs. First a <strong>depthwise</strong> convolution gives each input channel its own single 3 × 3 filter, looking at neighbours but not mixing channels (in PyTorch, <code>groups=C_in</code>). Then a <strong>pointwise</strong> 1 × 1 convolution mixes the channels. For 64 channels in and 128 out, the normal layer has 128 × 64 × 9 + 128 = 73,856 parameters; the depthwise part has 64 × 9 + 64 = 640 and the pointwise part 128 × 64 + 128 = 8,320, together 8,960.</p>
  <p>The second idea is how to make a network bigger when you do have more compute. There are three knobs: make it <strong>deeper</strong> (more layers, a larger receptive field), <strong>wider</strong> (more channels, finer features), or feed it <strong>higher-resolution</strong> images (more detail). Before 2019 people mostly turned one knob, usually depth, and each knob alone gives quickly shrinking returns. <strong>EfficientNet</strong>'s insight was that the knobs depend on each other: a sharper image has more detail, which needs more layers to cover it and more channels to describe it. So it turns all three together in a fixed ratio, called <strong>compound scaling</strong>, much as you scale rice, dal and water together when cooking for more wedding guests. With a single number φ saying "how much bigger", depth is multiplied by α<sup>φ</sup>, width by β<sup>φ</sup> and resolution by γ<sup>φ</sup>. Compute grows roughly with depth × width² × resolution², because width appears twice (channels in × channels out) and resolution twice (height × width). The paper chose α = 1.2, β = 1.1 and γ = 1.15 so that α · β² · γ² ≈ 2, meaning each step of φ roughly doubles the compute.</p>
    <div class="fx" data-lang="py">normal    = nn.Conv2d(64, 128, 3, padding=1)
depthwise = nn.Conv2d(64, 64, 3, padding=1, groups=64)    # one 3x3 filter per channel
pointwise = nn.Conv2d(64, 128, 1)                         # 1x1: mix channels
x = torch.randn(1, 64, 28, 28)
print("normal conv        ", tuple(normal(x).shape), f"{count(normal):,}")
print("depthwise+pointwise", tuple(pointwise(depthwise(x)).shape), f"{count(depthwise) + count(pointwise):,}")

a, b, g = 1.2, 1.1, 1.15                                  # depth, width, resolution multipliers
print("a * b^2 * g^2 =", round(a * b**2 * g**2, 2))
for phi in range(4):
    print(f"phi={phi}: depth x{a**phi:.2f}  width x{b**phi:.2f}  resolution {224 * g**phi:.0f}"
          f"  compute x{(a * b**2 * g**2)**phi:.1f}")</div>
  <div class="fx" data-lang="text">normal conv         (1, 128, 28, 28) 73,856
depthwise+pointwise (1, 128, 28, 28) 8,960
a * b^2 * g^2 = 1.92
phi=0: depth x1.00  width x1.00  resolution 224  compute x1.0
phi=1: depth x1.20  width x1.10  resolution 258  compute x1.9
phi=2: depth x1.44  width x1.21  resolution 296  compute x3.7
phi=3: depth x1.73  width x1.33  resolution 341  compute x7.1</div>
  <p>The first two lines confirm that the depthwise separable version produces the same output shape, (1, 128, 28, 28), with 8,960 parameters instead of 73,856, about 8 times fewer. The rest works out compound scaling: at φ = 2 the network is 44% deeper and 21% wider, takes 296-pixel images, and costs 3.7 times the compute of the base model (the released B1–B7 models use rounded resolutions). The base model, EfficientNet-B0, built from depthwise-separable blocks found by an automated architecture search, matches ResNet-50's accuracy with about a fifth of the parameters. One practical warning: fewer parameters does not always mean faster. Depthwise convolutions do little arithmetic per byte of memory moved, so on a GPU a ResNet-50 can run faster than a "smaller" EfficientNet. Always measure speed on the hardware you will actually use.</p>

  <h2 id="dc-tl"><span class="num">12</span>Transfer Learning</h2>
  <p>Every architecture above needs a large labelled dataset to train from scratch: ImageNet has over a million labelled photos. A real road team might have a few hundred labelled patches, and when they install a new kind of camera, perhaps only a handful. Training a large network from scratch on so little data would simply memorise it. Notice, though, what the early layers of any image CNN learn: edge and texture detectors like the ones we wrote by hand, which are useful for road photos, X-rays and cat pictures alike. <strong>Transfer learning</strong> means taking a network already trained on a large dataset and reusing it for a new task, retraining only the part that is specific to the new task.</p>
  <p>The vocabulary is simple. The <strong>backbone</strong> is the pretrained feature extractor, all the convolution stages. The <strong>head</strong> is the final layer or layers that turn features into the answer for a specific task. In the simplest form, called <strong>feature extraction</strong>, you <strong>freeze</strong> the backbone (its weights are not updated) and train only a new head. In <strong>fine-tuning</strong> you also let some pretrained layers change, but with a much smaller learning rate. It is like a cricket fielding coach who moves to a hockey team: fitness and footwork carry over unchanged, only the hockey-specific skills need to be taught, and later a few small adjustments are made to the rest.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
<g text-anchor="middle">
<rect x="10" y="30" width="105" height="44" rx="5" class="fs" stroke="currentColor"/><text x="62" y="50">stem +</text><text x="62" y="66">layer1</text>
<rect x="125" y="30" width="105" height="44" rx="5" class="fs" stroke="currentColor"/><text x="177" y="57">layer2</text>
<rect x="240" y="30" width="105" height="44" rx="5" class="fs" stroke="currentColor"/><text x="292" y="57">layer3</text>
<rect x="355" y="30" width="105" height="44" rx="5" class="fb sb"/><text x="407" y="57">layer4</text>
<rect x="470" y="30" width="115" height="44" rx="5" class="fg sg"/><text x="527" y="50">new head</text><text x="527" y="66">Linear(512,2)</text>
<text x="177" y="20" class="tm">edges · textures (generic)</text>
<text x="407" y="20" class="tm">object parts</text>
<text x="177" y="96">frozen</text><text x="177" y="112" class="tm">(or LR 1e-5)</text>
<text x="407" y="96" class="tb">unfreeze 2nd</text><text x="407" y="112" class="tb">LR 1e-5</text>
<text x="527" y="96" class="tg">train 1st</text><text x="527" y="112" class="tg">LR 1e-3</text>
<text x="300" y="140" class="tm">small data: head only · more: unfreeze top-down · lots: all</text>
</g>
</svg><figcaption>Early layers are generic and stay frozen; the pothole head trains first; top stages are unfrozen later with a tiny learning rate.</figcaption></figure>
  <p>The figure shows the usual plan for a ResNet. The stem and the early stages hold generic edge and texture filters and stay frozen. The last stage holds more task-specific parts and may be unfrozen later with a tiny learning rate. The new head trains first, with a normal learning rate.</p>
  <p>We cannot download real pretrained weights here, so we demonstrate the idea on our own road data, where it works for exactly the same reason. Suppose the city has 3,000 labelled <em>daytime</em> patches. Now a new <em>night</em> camera is installed, whose images are dark, low in contrast and grainy, and only 16 night patches have been labelled. First we train a model on the daytime data and try it, unchanged, on night images:</p>
    <div class="fx" data-lang="py">def make_night(n, seed):                          # the new camera: dark, low contrast, grainy
    rng = np.random.default_rng(seed)
    labels = np.arange(n) % 2
    imgs = np.stack([road_patch(rng, lab) * 0.35 + rng.normal(0, 0.06, (S, S)) for lab in labels])[:, None]
    return torch.tensor(imgs, dtype=torch.float32), torch.tensor(labels)

def backbone():                                   # conv layers only: the feature extractor
    return nn.Sequential(
        nn.Conv2d(1, 16, 3, padding=1), nn.ReLU(), nn.Conv2d(16, 16, 3, padding=1), nn.ReLU(),
        nn.MaxPool2d(2), nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(),
        nn.AdaptiveMaxPool2d(1), nn.Flatten())    # -&gt; (N, 32)

X_day, y_day = make_set(3000, cols=(2.5, 13.5), seed=20)    # big labelled daytime dataset
X_night_test, y_night_test = make_night(1000, 22)
torch.manual_seed(0)
day_model = nn.Sequential(backbone(), nn.Linear(32, 2))
train(day_model, X_day, y_day, epochs=6)
print("day model: day test", accuracy(day_model, *make_set(1000, (2.5, 13.5), 21)),
      "  night test", accuracy(day_model, X_night_test, y_night_test))</div>
  <div class="fx" data-lang="text">day model: day test 0.999   night test 0.53</div>
  <p>The day model is nearly perfect on day patches (0.999) but scores 0.53 at night, close to guessing, because its final decision was tuned to daytime brightness levels. The question is whether its convolution layers, which learned to detect dark oval shapes, are still useful. So we keep the trained backbone, freeze it, attach a fresh Linear head, and train only that head on the 16 night patches. For comparison, the same network starting from random weights is trained on the same 16 patches:</p>
    <div class="fx" data-lang="py">X_night, y_night = make_night(16, 100)            # only 16 labelled night patches
import copy
features = copy.deepcopy(day_model[0])            # reuse the trained conv layers
for p in features.parameters():
    p.requires_grad = False                       # freeze them
torch.manual_seed(0)
transfer = nn.Sequential(features, nn.Linear(32, 2))          # new head, trainable
torch.manual_seed(0)
scratch = nn.Sequential(backbone(), nn.Linear(32, 2))         # same network, random start
trainable = lambda m: sum(p.numel() for p in m.parameters() if p.requires_grad)
for name, model in [("transfer (frozen backbone)", transfer), ("from scratch", scratch)]:
    train(model, X_night, y_night, epochs=80, lr=1e-2)
    print(f"{name:27s} trainable {trainable(model):5,}   night test {accuracy(model, X_night_test, y_night_test)}")</div>
  <div class="fx" data-lang="text">transfer (frozen backbone)  trainable    66   night test 0.981
from scratch                trainable 7,186   night test 0.856</div>
  <p>With the frozen backbone only 66 numbers are trained (a Linear layer from 32 features to 2 classes: 32 × 2 + 2), and 16 examples are plenty to fit them. It scores 0.981 on 1,000 night test patches. The network trained from scratch must fit all 7,186 parameters from the same 16 examples, and it reaches only 0.856. The pretrained features turned a tiny labelled set into a good detector. That is the whole idea of transfer learning; with ImageNet the "day data" is a million general photos instead of 3,000 road patches.</p>
  <p>In practice you would load a standard network such as ResNet-18 with ImageNet weights (in torchvision, <code>resnet18(weights=ResNet18_Weights.DEFAULT)</code>). Its structure is exactly the pieces of this page, so we can build it ourselves from the <code>ResBlock</code> of section 10, with random weights, and follow the shapes. The stem is a 7 × 7 convolution with stride 2 (224 → 112, by the size formula) and a max pool (112 → 56); then four stages of two residual blocks at 56, 28, 14 and 7 pixels with 64, 128, 256 and 512 channels, the "shrink space, add channels" recipe; then global average pooling to 512 numbers; and the original head, a Linear layer to ImageNet's 1,000 classes. For potholes we replace that head with <code>Linear(512, 2)</code>, which has 512 × 2 + 2 = 1,026 parameters.</p>
    <div class="fx" data-lang="py">resnet18 = nn.Sequential()
resnet18.add_module("stem", nn.Sequential(nn.Conv2d(3, 64, 7, stride=2, padding=3, bias=False),
                                          nn.BatchNorm2d(64), nn.ReLU(), nn.MaxPool2d(3, 2, 1)))
c = 64
for i, width in enumerate([64, 128, 256, 512], start=1):         # four stages of two blocks
    stride = 1 if i == 1 else 2
    resnet18.add_module(f"layer{i}", nn.Sequential(ResBlock(c, width, stride), ResBlock(width, width)))
    c = width
resnet18.add_module("pool", nn.Sequential(nn.AdaptiveAvgPool2d(1), nn.Flatten()))
resnet18.add_module("fc", nn.Linear(512, 1000))                  # ImageNet's 1000 classes

x = torch.randn(1, 3, 224, 224)
for name, part in resnet18.named_children():
    x = part(x); print(f"{name:7s} {tuple(x.shape)}")
print(f"ResNet-18 params: {count(resnet18):,}")

for p in resnet18.parameters():
    p.requires_grad = False                                      # freeze everything
resnet18.fc = nn.Linear(512, 2)                                  # new head: pothole / no pothole
print(f"after swapping the head: total {count(resnet18):,}  trainable {trainable(resnet18):,}")
for p in resnet18.layer4.parameters():
    p.requires_grad = True                                       # later: unfreeze the last stage
opt = torch.optim.AdamW([{"params": resnet18.layer4.parameters(), "lr": 1e-5},   # pretrained: tiny LR
                         {"params": resnet18.fc.parameters(),     "lr": 1e-3}])  # new head: normal LR
print(f"after unfreezing layer4: trainable {trainable(resnet18):,}")</div>
  <div class="fx" data-lang="text">stem    (1, 64, 56, 56)
layer1  (1, 64, 56, 56)
layer2  (1, 128, 28, 28)
layer3  (1, 256, 14, 14)
layer4  (1, 512, 7, 7)
pool    (1, 512)
fc      (1, 1000)
ResNet-18 params: 11,689,512
after swapping the head: total 11,177,538  trainable 1,026
after unfreezing layer4: trainable 8,394,754</div>
  <p>The shapes follow the recipe exactly, and our hand-built network has 11,689,512 parameters, the published size of ResNet-18. Setting <code>requires_grad = False</code> on every parameter freezes the backbone; the new head is created afterwards, so it is trainable: 1,026 out of 11.2 million. If the frozen model plateaus, the next step is to unfreeze the last stage, <code>layer4</code>, which adds about 8.4 million trainable weights. The optimizer then gets two <strong>parameter groups</strong>: the pretrained stage learns with a learning rate 100 times smaller than the new head, so it adapts gently instead of being overwritten. Training pretrained layers with a large learning rate destroys what they learned within a few epochs, a failure called <strong>catastrophic forgetting</strong>. One more rule is easy to miss: feed the network images prepared exactly as during pretraining, the same resize and the same normalisation with the ImageNet mean and standard deviation per channel.</p>
  <p>How much to unfreeze depends on how much data you have and how different it is from the pretraining data:</p>
  <table class="tbl">
    <tr><th>Your data</th><th>Similar to the pretraining images (road photos vs ImageNet)</th><th>Very different (X-ray, satellite, thermal)</th></tr>
    <tr><td>Small (under about 1,000)</td><td>freeze the backbone, train the head</td><td>freeze early stages, fine-tune the top stages and head</td></tr>
    <tr><td>Large (10,000+)</td><td>fine-tune the top stages and head</td><td>fine-tune everything, still starting from pretrained weights</td></tr>
  </table>

  <h2 id="dc-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most common error is the wrong tensor layout. PyTorch convolutions expect (N, C, H, W), but image libraries such as PIL and NumPy store a picture as (H, W, C). Feeding such an image directly makes PyTorch read the height as the number of channels:</p>
    <div class="fx" data-lang="py">img_hwc = np.zeros((16, 16, 3), dtype=np.float32)          # how image libraries store a photo
conv_rgb = nn.Conv2d(3, 8, 3, padding=1)
try:
    conv_rgb(torch.tensor(img_hwc).unsqueeze(0))            # (1, 16, 16, 3): wrong layout
except RuntimeError as e:
    print("RuntimeError:", e)
fixed = torch.tensor(img_hwc).permute(2, 0, 1).unsqueeze(0) # (1, 3, 16, 16)
print(tuple(conv_rgb(fixed).shape))</div>
  <div class="fx" data-lang="text">RuntimeError: Given groups=1, weight of size [8, 3, 3, 3], expected input[1, 16, 16, 3] to have 3 channels, but got 16 channels instead
(1, 8, 16, 16)</div>
  <p>The layer was built for 3 channels but found 16, the image height, in the channel position. <code>permute(2, 0, 1)</code> moves the channel axis to the front and <code>unsqueeze(0)</code> adds the batch axis. Our single grey road patch needed the same treatment, which is why we reshaped it to (1, 1, 5, 5). Keras uses the other layout, (N, H, W, C), so porting code between the two needs care (see <a class="xref" data-note="dl_keras">TensorFlow &amp; Keras</a>).</p>
  <p>The second classic is a Linear layer whose input size was hard-coded from one image size. It works until someone feeds a different size:</p>
    <div class="fx" data-lang="py">fixed_head = nn.Sequential(nn.Conv2d(1, 8, 3, padding=1), nn.MaxPool2d(2), nn.Flatten(),
                           nn.Linear(8 * 8 * 8, 2))         # written for 16x16 inputs
print(tuple(fixed_head(torch.zeros(1, 1, 16, 16)).shape))
try:
    fixed_head(torch.zeros(1, 1, 20, 20))                    # a slightly bigger patch
except RuntimeError as e:
    print("RuntimeError:", e)
print(tuple(cnn(torch.zeros(1, 1, 20, 20)).shape))          # global pooling: any size works</div>
  <div class="fx" data-lang="text">(1, 2)
RuntimeError: addmm: mat1 and mat2 shapes cannot be multiplied (1x800 and 512x2)
(1, 2)</div>
  <p>The network was written for 16 × 16 patches, so after one pooling step it expects 8 × 8 × 8 = 512 values; a 20 × 20 patch produces 8 × 10 × 10 = 800, and the matrix multiplication fails. The last line shows the fix we already used: our pothole CNN ends with global pooling, so its Linear layer always receives exactly one number per channel, whatever the image size. When you do need a fixed size, print the shapes with a dummy batch, as in section 07, instead of calculating them in your head.</p>
  <p>A few more mistakes come up in interviews rather than error messages. Forgetting the input channels when counting parameters: <code>Conv2d(3, 64, 3)</code> has 1,792, not 640. Ignoring the rounding down in the size formula: odd sizes with stride 2 lose a pixel, and then a residual addition no longer lines up. Saying "CNNs are shift-invariant": the convolution is equivariant, and invariance comes from pooling and augmentation. Saying "ResNet fixes overfitting": skip connections fix optimisation. And fine-tuning a pretrained backbone at a learning rate like 1e-3, or with different preprocessing from pretraining, which quietly throws away the benefit of transfer learning.</p>

  <h2 id="dc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>CNN</b>: network whose main layers are convolutions: small filters with shared weights slid over a grid.</li>
    <li><b>Kernel / filter</b>: small grid of learned weights spanning all input channels.</li>
    <li><b>Feature map</b>: one filter's output; where its pattern occurs and how strongly.</li>
    <li><b>Locality</b>, <b>parameter sharing</b>, <b>translation equivariance</b>: the three properties convolution gives.</li>
    <li><b>Invariance</b>: output unchanged when the input shifts; comes from pooling (especially global) and augmentation.</li>
    <li><b>Padding</b>: border added around the input ("same" keeps size, "valid" = none). <b>Stride</b>: step between positions.</li>
    <li><b>Pooling</b>: parameter-free max or mean per window, per channel. <b>GAP</b>: one mean per channel over the whole map.</li>
    <li><b>Receptive field</b>: input region that can affect one unit.</li>
    <li><b>1×1 conv</b>: mixes channels per pixel; cheap channel reduction or projection.</li>
    <li><b>Residual block</b>: y = F(x) + shortcut(x); <b>projection shortcut</b> = 1×1 conv when shapes differ.</li>
    <li><b>Depthwise separable conv</b>: per-channel k×k conv, then 1×1 conv.</li>
    <li><b>Compound scaling</b>: grow depth, width and resolution together.</li>
    <li><b>Backbone</b> / <b>head</b>; <b>feature extraction</b> (frozen backbone) vs <b>fine-tuning</b> (small LR on pretrained layers).</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>What</th><th>Formula</th><th>Example</th></tr>
    <tr><td>Convolution</td><td>out(i, j) = Σ K(m, n)·X(i + m, j + n) + b</td><td>edge filter on our window: 24 − 3 = 21</td></tr>
    <tr><td>Output size</td><td>⌊(W − K + 2P)/S⌋ + 1</td><td>5, K3, P1, S2 → 3; 224, K7, P3, S2 → 112</td></tr>
    <tr><td>Conv params</td><td>C<sub>out</sub>·C<sub>in</sub>·k·k + C<sub>out</sub></td><td>Conv2d(3, 64, 3) = 1,792; (64, 128, 3) = 73,856</td></tr>
    <tr><td>Linear params</td><td>n<sub>in</sub>·n<sub>out</sub> + n<sub>out</sub></td><td>Linear(512, 2) = 1,026</td></tr>
    <tr><td>Receptive field</td><td>r ← r + (k − 1)·j, then j ← j·s (start r = j = 1)</td><td>conv, conv, pool, conv: 3, 5, 6, 10</td></tr>
    <tr><td>Residual</td><td>y = F(x) + x; ∂y/∂x = ∂F/∂x + 1</td><td>50 layers: first-layer gradient 1e-14 → 16</td></tr>
    <tr><td>Depthwise separable</td><td>C<sub>in</sub>·k·k + C<sub>in</sub> + C<sub>out</sub>·C<sub>in</sub> + C<sub>out</sub></td><td>64 → 128: 8,960 vs 73,856</td></tr>
    <tr><td>Compound scaling</td><td>depth α<sup>φ</sup>, width β<sup>φ</sup>, resolution γ<sup>φ</sup>; α·β²·γ² ≈ 2</td><td>φ = 2: compute ×3.7</td></tr>
  </table>
  <h3>Architectures</h3>
  <table class="tbl">
    <tr><th>Network</th><th>Remember it for</th></tr>
    <tr><td>LeNet-5 (1998)</td><td>first conv + pool + FC recipe, digits</td></tr>
    <tr><td>AlexNet (2012)</td><td>GPUs, ReLU, dropout; started the boom</td></tr>
    <tr><td>VGG-16 (2014)</td><td>only 3×3 convs; 138M params, 102.8M in the first FC layer</td></tr>
    <tr><td>GoogLeNet (2014)</td><td>parallel 1×1/3×3/5×5 branches, 1×1 bottlenecks, GAP</td></tr>
    <tr><td>ResNet (2015)</td><td>skip connections; 50–152 layers train; ResNet-18 = 11.7M</td></tr>
    <tr><td>MobileNet / EfficientNet</td><td>depthwise separable convs; compound scaling</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import torch, torch.nn as nn

x = torch.randn(8, 3, 32, 32)                       # (N, C, H, W)
net = nn.Sequential(
    nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(), nn.MaxPool2d(2),
    nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
    nn.AdaptiveAvgPool2d(1), nn.Flatten(),          # global average pooling
    nn.Linear(64, 2))
print(net(x).shape)                                 # torch.Size([8, 2])

# transfer learning
for p in backbone.parameters():
    p.requires_grad = False                         # freeze
model.fc = nn.Linear(512, 2)                        # new head
opt = torch.optim.AdamW([{"params": model.layer4.parameters(), "lr": 1e-5},
                         {"params": model.fc.parameters(),     "lr": 1e-3}])</div>
  <h3>Gotchas</h3>
  <ul>
    <li>PyTorch is (N, C, H, W); images load as (H, W, C): <code>permute(2, 0, 1).unsqueeze(0)</code>.</li>
    <li>Count C<sub>in</sub> in conv parameters.</li>
    <li>Round down in the size formula; odd sizes lose a pixel with stride 2.</li>
    <li>Zero padding invents edges at the border.</li>
    <li>Convolution is equivariant; invariance comes from pooling and augmentation.</li>
    <li>Hard-coded Linear input sizes break when the image size changes; end with global pooling.</li>
    <li>Skip connections fix optimisation, not overfitting; use a projection when shapes differ.</li>
    <li>Pretrained models: same preprocessing as pretraining, small LR on pretrained layers.</li>
  </ul>

  <h2 id="dc-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a CNN instead of an MLP for images?</summary><div class="qa-body">An MLP connects every pixel to every neuron, so on a 224×224×3 photo one layer of 1,000 units needs over 150 million weights, and it treats neighbouring pixels as unrelated inputs. A CNN uses small filters that look only at local neighbourhoods and shares the same weights at every position, so it needs far fewer parameters and recognises a pattern wherever it appears. In our pothole experiment an MLP trained on left-side potholes scored 0.47 on right-side ones; the CNN scored 0.99.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute by hand: input [[1, 2, 0], [0, 1, 3], [2, 1, 0]] with kernel [[1, 0], [0, 1]], no padding, stride 1.</summary><div class="qa-body">The output is 2×2, since (3 − 2)/1 + 1 = 2. Each cell is the window's top-left plus bottom-right value. (0,0): 1 + 1 = 2; (0,1): 2 + 3 = 5; (1,0): 0 + 1 = 1; (1,1): 1 + 0 = 1. Result: [[2, 5], [1, 1]].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the output size formula for a convolution? Apply it to input 64, kernel 3, padding 0, stride 2.</summary><div class="qa-body">Output = ⌊(W − K + 2P)/S⌋ + 1. Here ⌊(64 − 3 + 0)/2⌋ + 1 = ⌊30.5⌋ + 1 = 31. The batch size is unchanged and the number of output channels equals the number of filters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters does <code>Conv2d(64, 128, kernel_size=3)</code> have?</summary><div class="qa-body">128 × 64 × 3 × 3 + 128 = 73,728 + 128 = 73,856. Each of the 128 filters spans all 64 input channels with a 3×3 kernel and has one bias. Forgetting the input-channel factor is the most common mistake.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a 1×1 convolution do, and why is it useful?</summary><div class="qa-body">It looks at one pixel position at a time and mixes the channels there, like a small fully connected layer applied to every pixel. It changes the number of channels cheaply without changing height and width, so it is used for bottlenecks (Inception, ResNet-50), for ResNet's projection shortcuts, and as the pointwise half of depthwise separable convolutions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are padding and stride, and what does "same" padding mean?</summary><div class="qa-body">Padding adds a border (usually zeros) around the input so the kernel can be centred on edge pixels; stride is how far the kernel moves between positions. "Same" padding keeps the output size equal to the input size at stride 1, which for a 3×3 kernel means padding 1. Stride 2 roughly halves the size and is used for downsampling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are CNNs translation invariant or translation equivariant?</summary><div class="qa-body">The convolution itself is equivariant: if the input shifts, the feature map shifts by the same amount (our pothole's peak of 21 moved from cell (1, 0) to (1, 1)). Invariance, an output that does not change, comes from pooling, especially global pooling at the end, and from data augmentation. Even so, CNNs are not perfectly invariant, because strides and pooling grids depend on exact positions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Max pooling vs average pooling vs strided convolution?</summary><div class="qa-body">Max pooling keeps the strongest response in each window ("was the feature here?"); average pooling keeps the mean and preserves weak, spread-out signals. Both are fixed and have no parameters. A strided convolution also downsamples but learns what to keep, so modern networks mostly use it inside the network and keep global average pooling at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does global average pooling do to a (N, 512, 7, 7) tensor, and why use it?</summary><div class="qa-body">It averages each 7×7 map into one number, giving (N, 512, 1, 1), flattened to (N, 512). It has no parameters, works for any input size, and replaces a huge flatten-plus-FC layer: in VGG-16 the first FC layer alone had 102.8 million of the 138 million weights.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the receptive field, and how does it grow?</summary><div class="qa-body">The receptive field of a unit is the region of the input image that can influence it. Each layer adds (k − 1) × jump, where the jump is the product of all earlier strides: conv 3, conv 3, pool 2, conv 3 gives 3, 5, 6, 10. Stacking layers and downsampling is how deep units come to "see" whole objects.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do modern CNNs use stacks of 3×3 kernels instead of larger kernels?</summary><div class="qa-body">Two stacked 3×3 layers cover the same 5×5 region as one 5×5 layer but with fewer weights (with C channels, 18C² instead of 25C², about 28% fewer) and with an extra nonlinearity in between. Three 3×3 layers cover 7×7 with 27C² instead of 49C². This was VGG's key observation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem do ResNet skip connections solve, and how?</summary><div class="qa-body">They solve the degradation problem: plain networks beyond about 20 layers had higher <em>training</em> error, an optimisation failure caused largely by vanishing gradients, not overfitting. A residual block outputs y = F(x) + x, so ∂y/∂x = ∂F/∂x + 1 and the gradient always has a path with factor 1; a block can also learn the identity simply by pushing F towards zero. In our 50-layer test the first layer's gradient was 1e-14 without skips and about 16 with them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a projection shortcut?</summary><div class="qa-body">When a residual block changes the shape, for example halving height and width and doubling channels, x cannot be added to F(x) directly. The shortcut then applies a 1×1 convolution with the same stride (usually followed by BatchNorm) so that both branches have the same shape before the addition.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a depthwise separable convolution, and how many parameters does it save?</summary><div class="qa-body">It splits a convolution into a depthwise step (one k×k filter per input channel, no channel mixing) and a pointwise 1×1 step that mixes channels. For 64 → 128 channels with 3×3 kernels, a normal conv has 73,856 parameters and the separable version 8,960, roughly k² times fewer. MobileNet and EfficientNet are built on it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is EfficientNet's key idea?</summary><div class="qa-body">Compound scaling: grow depth, width and input resolution together with one coefficient φ (depth α<sup>φ</sup>, width β<sup>φ</sup>, resolution γ<sup>φ</sup>, with α·β²·γ² ≈ 2 so compute roughly doubles per step), instead of scaling only one dimension. Higher resolution needs more depth for a larger receptive field and more width for finer features. The base model B0 matches ResNet-50 accuracy with about a fifth of the parameters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You have 500 labelled road photos. How do you build a pothole classifier?</summary><div class="qa-body">Do not train from scratch. Load an ImageNet-pretrained backbone such as ResNet or EfficientNet, freeze it, replace the head with a 2-class Linear layer, and train the head with data augmentation (flips, crops, brightness). If accuracy plateaus, unfreeze the last stage with a learning rate 10–100× smaller than the head's. Use the same resize and ImageNet normalisation as in pretraining, and a stratified validation set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does transfer learning work so well for CNNs?</summary><div class="qa-body">Because of the feature hierarchy: early layers learn generic edges and textures that are useful for almost any images, and only the last layers are task-specific. Reusing those layers means only a small head must be learned from the new data, so a few examples can be enough (in our demo, 16 night patches gave 0.98 with a frozen backbone versus 0.86 from scratch).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is catastrophic forgetting in fine-tuning, and how do you avoid it?</summary><div class="qa-body">Updating pretrained layers with a large learning rate quickly overwrites the useful features they learned, so the model ends up worse than with frozen features. Avoid it by training the new head first, then unfreezing only the top stages, and using parameter groups with a much smaller learning rate (for example 1e-5) for pretrained layers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What breaks if you use no padding in a 20-layer stack of 3×3 convolutions on 32×32 images?</summary><div class="qa-body">Each unpadded 3×3 layer removes 2 pixels, so 32 − 2 × 20 is negative: the maps disappear after 15 layers, and border pixels are used by fewer windows than central ones. "Same" padding keeps the size, and the network downsamples deliberately with stride or pooling instead.</div></details>
</main>`
});
