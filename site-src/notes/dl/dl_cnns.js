// dl/dl_cnns.js — CNNs — Convolutional Neural Networks
Object.assign(TOPIC_CONTENT, {
  "dl_cnns": `<main>
  <h1>CNNs — Convolutional Neural Networks</h1>
  <div class="where"><span>Deep Learning</span><span>CNNs</span></div>
  <p class="lead">A CNN is a neural network made for images. It slides one small filter over the whole picture to find edges, then stacks such layers to find shapes and objects. This note builds every idea on <strong>one running example</strong>: a 5 × 5 grey photo patch of a road, and the question "is there a pothole here?". On that patch we count why a plain network is wasteful, compute a convolution by hand, trace padding and stride with the output-size formula, add more filters and channels, read the feature maps, pool them, grow the receptive field by stacking, and then follow the story to deep networks: why they stop training (ResNet), how to grow them efficiently (EfficientNet), and how to reuse a pretrained one for our pothole detector (transfer learning). All code ran here (PyTorch 2.14 CPU, single thread).</p>

  <h2 id="dc-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 200" width="660">
<defs><marker id="dc-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="41" text-anchor="middle" font-size="12">Neurons · Backprop</text><text x="85" y="58" text-anchor="middle" class="tm" font-size="10">· Training (MLPs)</text>
<rect x="10" y="120" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="141" text-anchor="middle" font-size="12">PyTorch / Keras</text><text x="85" y="158" text-anchor="middle" class="tm" font-size="10">the tools</text>
<rect x="245" y="70" width="150" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="320" y="93" text-anchor="middle" font-size="13" font-weight="700">CNNs</text><text x="320" y="112" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE · images</text>
<rect x="480" y="20" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="560" y="41" text-anchor="middle" font-size="12">RNNs</text><text x="560" y="58" text-anchor="middle" class="tm" font-size="10">sequences, not grids</text>
<rect x="480" y="120" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="560" y="141" text-anchor="middle" font-size="12">Attention → Transformers</text><text x="560" y="158" text-anchor="middle" class="tm" font-size="10">also used on images (ViT)</text>
<line x1="160" y1="45" x2="243" y2="90" stroke="currentColor" marker-end="url(#dc-a0)"/><line x1="160" y1="145" x2="243" y2="108" stroke="currentColor" marker-end="url(#dc-a0)"/>
<line x1="395" y1="90" x2="478" y2="48" stroke="currentColor" marker-end="url(#dc-a0)"/><line x1="395" y1="108" x2="478" y2="142" stroke="currentColor" marker-end="url(#dc-a0)"/>
<text x="330" y="192" text-anchor="middle" class="tm" font-size="10.5">same idea throughout: share weights where the data repeats its structure</text>
</svg><figcaption>CNNs are the first specialised architecture of the Deep Learning track: an MLP rebuilt for grids of pixels.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dl_neurons">Neurons &amp; MLPs</a>, <a class="xref" data-note="dl_backprop">Backpropagation</a>, <a class="xref" data-note="dl_training">Training Neural Networks</a></b><span>We can build a network of fully connected layers and train it with gradients, using <a class="xref" data-note="dl_pytorch">PyTorch</a>. Left open: an MLP treats every pixel as an unrelated input, so on images it needs millions of weights and has no idea that neighbouring pixels belong together.</span></li>
    <li><b>This note adds: weight sharing over space</b><span>One small filter slid over the whole image (convolution), the bookkeeping that controls sizes (padding, stride, channels, pooling), and the architecture ideas that made deep image models work (stacking, ResNet, EfficientNet, transfer learning).</span></li>
    <li><b>Leads to: <a class="xref" data-note="dl_rnns">RNNs</a> and <a class="xref" data-note="dl_attention">Attention</a></b><span>Text and time series are not grids but sequences of any length; the RNN shares weights over <em>time</em> the way a CNN shares them over <em>space</em>. Later, <a class="xref" data-note="transformers">Transformers</a> replace both with attention (Vision Transformers cut an image into patches). The same CNN is written in Keras in <a class="xref" data-note="dl_keras">TensorFlow &amp; Keras</a>.</span></li>
  </ol>

  <h2 id="dc-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Every number is from our 5 × 5 road patch.</p>
  <ol class="story">
    <li><b>MLP on pixels</b><span>Q: can the network we already know read a photo? → Flatten it and connect every pixel to every neuron: 416 weights for one 16-neuron layer on our 25-pixel patch, 150.5 million for a 224 × 224 colour photo. And a pothole moved one pixel touches completely different weights…</span></li>
    <li><b>Convolution</b><span>Q: how do we look only at neighbours and reuse what we learn everywhere? → Slide one 3 × 3 filter (10 numbers) over the patch: the edge filter gives 21 at the pothole's left edge, −21 at its right edge. But the 5 × 5 patch shrank to 3 × 3…</span></li>
    <li><b>Padding &amp; stride</b><span>Q: how do we control the output size? → out = ⌊(W − K + 2P)/S⌋ + 1: padding 1 keeps 5 × 5, stride 2 gives 3 × 3. But one filter finds only one kind of pattern…</span></li>
    <li><b>Many filters, many channels</b><span>Q: how do we look for several patterns, and in colour? → One filter per pattern; each filter spans all input channels: Conv2d(1, 2, 3) has 20 weights, on RGB Conv2d(3, 2, 3) has 56. What do the outputs mean?</span></li>
    <li><b>Feature maps</b><span>Q: what does a filter's output tell us? → A map of "where is my pattern": after ReLU, left-edge map [[14, 7, 0], [21, 13, 0], [15, 6, 0]]; it moves when the pothole moves. But the maps are as big as the image, and the exact pixel hardly matters…</span></li>
    <li><b>Pooling</b><span>Q: how do we keep "found it" but drop "exactly where"? → Max over 2 × 2 windows: the 5 × 5 map becomes [[14, 7], [21, 13]]; global max = 21 whether or not the pothole shifted. But one 3 × 3 layer only ever sees 3 × 3 pixels…</span></li>
    <li><b>Stacking &amp; receptive field</b><span>Q: how does the network see a whole pothole, then a whole road? → Stack layers: two 3 × 3 convs see 5 × 5 (our whole patch), add a pool and a conv and it is 10 × 10. Recipe: shrink space, add channels. But stack 20, 50 layers and…</span></li>
    <li><b>Deeper nets stop training → ResNet</b><span>Q: why does a deeper plain net get <em>worse</em>, even on training data? → The gradient is multiplied by a small factor per layer (10⁻¹⁴ at layer 1 of 50). Skip connections y = F(x) + x add a "+1" path (gradient 16). Now we can go deep, but how should we grow a net for more compute?</span></li>
    <li><b>Efficient designs (EfficientNet)</b><span>Q: deeper, wider or sharper images? → All three together in a fixed ratio: FLOPs ×2 per step. Great models, but we have only a few hundred labelled road photos…</span></li>
    <li><b>Transfer learning</b><span>Q: how do we train a pothole detector from 500 photos? → Reuse an ImageNet backbone that already knows edges and textures; train only a new 2-class head (1,026 weights out of 11.2 million), then gently fine-tune the top stage.</span></li>
  </ol>

  <h2 id="dc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">CNNs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why not an MLP</div>
        <ul>
          <li><b>Our 5×5 patch</b> → Linear(25, 16) = 416 weights; one 3×3 filter = 10</li>
          <li><b>224×224×3 photo</b> → 1000 units = 150.5M weights; Conv2d(3,64,3) = 1,792</li>
          <li><b>Locality</b>: neighbours matter; <b>sharing</b>: same filter everywhere</li>
          <li><b>Equivariance</b>: pothole shifts → map shifts</li>
          <li>💡 One rubber stamp pressed on every spot of the page</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Convolution</div>
        <ul>
          <li><b>out(i,j)</b> = Σ kernel · patch(i,j) + bias</li>
          <li>Edge filter [[1,0,−1]]×3 = left column − right column</li>
          <li>Pothole: [[14, 7, −14], [21, 13, −21], [15, 6, −15]]</li>
          <li>+ = bright→dark edge (left rim), − = dark→bright (right rim)</li>
          <li>⚠ DL "convolution" is cross-correlation (no flip)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Padding &amp; stride</div>
        <ul>
          <li><b>out = ⌊(W − K + 2P)/S⌋ + 1</b></li>
          <li>5, K3, P0, S1 → 3 · P1 → 5 · P1 S2 → 3</li>
          <li>Zero padding makes fake border edges (−16 at the corner)</li>
          <li>1×1 conv mixes channels only</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Filters, channels, maps</div>
        <ul>
          <li>Filter depth = input channels; 3×3 on RGB = 27 weights</li>
          <li>Params = C<sub>out</sub>·C<sub>in</sub>·k·k + C<sub>out</sub></li>
          <li>Conv2d(1,2,3) = 20 · Conv2d(3,2,3) = 56 · Conv2d(64,128,3) = 73,856</li>
          <li>ReLU keeps "pattern found"; maps shift with the input</li>
          <li>Hierarchy: edges → textures → parts → objects</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pooling</div>
        <ul>
          <li>Max 2×2: [[14, 7], [21, 13]]; avg keeps weak signals</li>
          <li>Global max/avg: whole map → 1 number per channel</li>
          <li>0 params; small shift tolerance</li>
          <li>⚠ Modern nets often use stride-2 convs instead</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stacking</div>
        <ul>
          <li><b>Receptive field</b> r += (k − 1)·jump; jump ×= stride</li>
          <li>3 → 5 → 6 → 10 (conv, conv, pool, conv), checked by gradients</li>
          <li>Recipe: [conv-BN-ReLU] → downsample; spatial ↓ channels ↑; GAP → Linear</li>
          <li>Two 3×3 = one 5×5 view, 28% fewer weights</li>
          <li>Digits: CNN 98%; 1-pixel shift CNN 63% vs MLP 45%</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ResNet &amp; EfficientNet</div>
        <ul>
          <li>Degradation: deeper plain nets → higher <em>training</em> error</li>
          <li>y = F(x) + x → ∂y/∂x = ∂F/∂x + 1</li>
          <li>50 layers: first-layer grad 1e-14 plain vs 16 with skips</li>
          <li>Compound scaling α<sup>φ</sup>, β<sup>φ</sup>, γ<sup>φ</sup>; α·β²·γ² ≈ 2</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Transfer learning</div>
        <ul>
          <li>Freeze backbone, new head Linear(512, 2) = 1,026 weights</li>
          <li>Then unfreeze layer4 at LR 1e-5, head 1e-3</li>
          <li>Same preprocessing as pretraining (resize, ImageNet mean/std)</li>
          <li>⚠ High LR on pretrained layers → catastrophic forgetting</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dc-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="dc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Not an MLP?</span><span class="rm-sub">The road patch, weights counted</span></div></div>
      <div class="rm-item rm-done" data-target="dc-conv"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Convolution Operation</span><span class="rm-sub">Edge filter on 5×5, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dc-pad"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Padding &amp; Stride</span><span class="rm-sub">The output-size formula traced</span></div></div>
      <div class="rm-item rm-done" data-target="dc-maps"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Filters &amp; Channels</span><span class="rm-sub">Many patterns, colour input</span></div></div>
      <div class="rm-item rm-done" data-target="dc-fmap"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Feature Maps</span><span class="rm-sub">ReLU, reading maps, equivariance</span></div></div>
      <div class="rm-item rm-done" data-target="dc-pool"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Pooling</span><span class="rm-sub">Max, average, global</span></div></div>
      <div class="rm-item rm-done" data-target="dc-stack"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Stacking &amp; Receptive Field</span><span class="rm-sub">From edges to objects</span></div></div>
      <div class="rm-item rm-done" data-target="dc-train"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Hands-on: Train a CNN</span><span class="rm-sub">Digits, CNN vs MLP</span></div></div>
      <div class="rm-item rm-done" data-target="dc-res"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">ResNet Skip Connections</span><span class="rm-sub">Why deep nets stopped training</span></div></div>
      <div class="rm-item rm-done" data-target="dc-eff"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">EfficientNet Scaling</span><span class="rm-sub">Depth × width × resolution</span></div></div>
      <div class="rm-item rm-done" data-target="dc-tl"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Transfer Learning</span><span class="rm-sub">A pothole detector from 500 photos</span></div></div>
      <div class="rm-item rm-done" data-target="dc-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One idea, many consequences</span></div></div>
      <div class="rm-item rm-done" data-target="dc-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Shapes, params, pretrained LR</span></div></div>
      <div class="rm-item rm-done" data-target="dc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="dc-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dc-why"><span class="num">01</span>Why Not an MLP?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>From the foundations notes we can train a fully connected network (an MLP) on any list of numbers. A photo is a grid of numbers. So why not just flatten the photo into a list and use the MLP we already have?</p>
  </div>
  <h3>The running example: is there a pothole here?</h3>
  <p>A city's road-inspection van photographs the road every few metres. We cut each photo into small square patches and want a model that answers "pothole or not?" for each patch. To be able to compute everything by hand, our patch is tiny: 5 × 5 pixels, grey, brightness 0 (black) to 8 (bright asphalt). Here is a patch with a pothole: the dark hole sits in the middle, a little lopsided, as real potholes are.</p>
<div class="fx" data-lang="py">import numpy as np, torch, torch.nn as nn, torch.nn.functional as F
patch = np.array([[8, 8, 8, 8, 8],      # row 0: smooth road
                  [8, 8, 2, 1, 8],      # row 1: hole starts
                  [8, 1, 0, 1, 8],      # row 2: deepest part (0 = black)
                  [8, 8, 1, 2, 8],      # row 3
                  [8, 8, 8, 8, 8]], dtype=float)
print(patch.shape, "pixels:", patch.size, " dark pixels (&lt;= 2):", int((patch &lt;= 2).sum()))</div>
  <div class="fx" data-lang="text">(5, 5) pixels: 25  dark pixels (&lt;= 2): 7</div>
  <p>25 pixels, 7 of them dark. A human sees the hole at once because the dark pixels are <em>next to each other</em> and surrounded by bright ones. Keep that sentence in mind: "next to each other" is exactly what an MLP cannot see.</p>
  <h3>Problem 1: too many weights (count them)</h3>
  <p>Flatten the patch into 25 numbers and connect them to a first layer of 16 neurons. Every neuron has one weight per pixel plus a bias: 25 × 16 + 16 = <strong>416</strong> weights. That sounds fine, but the count grows with the image. A normal photo of 224 × 224 pixels in 3 colours is 150,528 numbers; a first layer of 1000 neurons needs 150,528 × 1000 + 1000 = <strong>150,529,000</strong> weights, for one layer. That is slow, memory-hungry, and overfits with any normal amount of data.</p>
  <p>The alternative we are about to build: one small 3 × 3 filter, slid over the image. It has 9 weights + 1 bias = <strong>10</strong>, whatever the image size. 64 such filters on a colour photo: 64 · 3 · 3 · 3 + 64 = <strong>1,792</strong>.</p>
<div class="fx" data-lang="py">mlp_patch = nn.Linear(5 * 5, 16)                 # MLP on our flattened 5x5 patch
mlp_photo = nn.Linear(224 * 224 * 3, 1000)       # MLP on a flattened colour photo
conv1     = nn.Conv2d(1, 1, kernel_size=3)       # ONE 3x3 filter, any image size
conv64    = nn.Conv2d(3, 64, kernel_size=3)      # 64 filters on a colour photo
n = lambda m: sum(p.numel() for p in m.parameters())
for name, m in [("MLP on 5x5 patch", mlp_patch), ("MLP on 224x224x3", mlp_photo),
                ("one 3x3 filter", conv1), ("Conv2d(3,64,3)", conv64)]:
    print(f"{name:18s} {n(m):&gt;12,}")
print("conv weight shape", tuple(conv64.weight.shape))</div>
  <div class="fx" data-lang="text">MLP on 5x5 patch            416
MLP on 224x224x3    150,529,000
one 3x3 filter               10
Conv2d(3,64,3)            1,792
conv weight shape (64, 3, 3, 3)</div>
  <p>The MLP numbers are inputs × outputs + biases. The conv weight shape (64, 3, 3, 3) reads (filters out, channels in, kernel height, kernel width); that layout is used everywhere in PyTorch. The conv layer's size does not depend on the image size at all.</p>
  <h3>Problem 2: it ignores locality, so a moved pothole is a new pothole</h3>
  <p>To an MLP, pixel 7 and pixel 8 are just input number 7 and input number 8; it has no idea they are neighbours. Worse, if the van stops 1 pixel later and the same pothole appears one pixel to the right, <em>different</em> pixels are dark, so <em>different</em> weights are used. Whatever the MLP learned about potholes in the middle must be learned again for every position. Count it on our patch: shift the hole one pixel right and see how many of the 25 inputs change.</p>
<div class="fx" data-lang="py">shifted = np.roll(patch, 1, axis=1); shifted[:, 0] = 8     # same pothole, 1 pixel to the right
print(shifted.astype(int))
changed = (patch.flatten() != shifted.flatten())
print("inputs that changed:", int(changed.sum()), "of 25 -&gt;", np.flatnonzero(changed).tolist())</div>
  <div class="fx" data-lang="text">[[8 8 8 8 8]
 [8 8 8 2 1]
 [8 8 1 0 1]
 [8 8 8 1 2]
 [8 8 8 8 8]]
inputs that changed: 10 of 25 -&gt; [7, 8, 9, 11, 12, 13, 14, 17, 18, 19]</div>
  <p>10 of the 25 inputs change, so an MLP sees an almost different picture, although nothing about "is there a pothole" changed. We want a layer that reacts to the <em>pattern</em>, wherever it is.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A rubber stamp of a pothole rim. You press it on every spot of the page and note how well each spot matches. One stamp is used everywhere; you do not need a new stamp for each spot. The stamp has 9 dots of ink, no matter how big the page is.</p>
  </div>
  <table class="tbl">
    <tr><th>Problem with an MLP on images</th><th>On our patch</th><th>CNN fix</th></tr>
    <tr><td>Huge parameter count, overfits</td><td>416 weights for 25 pixels; 150.5M for a photo</td><td><strong>Parameter sharing</strong>: one 3×3 filter (10 weights) reused at every position</td></tr>
    <tr><td>Ignores which pixels are neighbours</td><td>pixel 7 and 8 are unrelated inputs</td><td><strong>Locality</strong>: each output looks at a small patch</td></tr>
    <tr><td>A moved object uses different weights</td><td>1-pixel shift changes 10 of 25 inputs</td><td><strong>Translation equivariance</strong>: the same filter fires wherever the pattern is</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>convolutional neural network (CNN)</strong> is a network whose main layers are convolutions: small filters with shared weights slid over a grid. <strong>Locality</strong>: each output depends only on a small neighbourhood. <strong>Translation equivariance</strong>: shifting the input shifts the output map by the same amount. Where you meet CNNs: road and factory defect inspection, medical scans, OCR of invoices, the vision part of self-driving, and as the image encoder in many multimodal systems.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"CNNs are translation <em>invariant</em>." The convolution itself is equivariant (the output moves with the input). Some invariance comes later, from pooling and the final global pooling (section 06). Interviewers check this word.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The convolution operation.</b> We know <em>what</em> we want (one small filter, reused everywhere), but not how the filter actually turns a patch of pixels into a number.</div>

  <h2 id="dc-conv"><span class="num">02</span>The Convolution Operation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How does one small 3 × 3 grid of weights "look at" a 5 × 5 road patch and report where the pothole's edges are?</p>
  </div>
  <p>A <strong>kernel</strong> (or <strong>filter</strong>) is a small grid of weights, here 3 × 3. Place it on the top-left 3 × 3 patch of the image. Multiply each kernel weight by the pixel under it and add the nine products. That sum is one output number. Slide the kernel one pixel right and repeat; at the end of the row, go one pixel down. The grid of sums is the output, called a <strong>feature map</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A torch beam moving over a wall, one spot at a time. At each spot you ask one question: "how much does this spot look like my pattern?" and write the answer on a grid. Big positive means "yes, strongly", near zero means "nothing here", negative means "the opposite pattern".</p>
  </div>
  <p>Our kernel has +1 in its left column, 0 in the middle and −1 in its right column. So it computes <strong>left column sum − right column sum</strong>: "is the left side of this window brighter than the right side?". That is a <strong>vertical-edge detector</strong>. On our road, bright asphalt on the left and a dark hole on the right gives a big positive number (the pothole's left rim); dark on the left and bright on the right gives a big negative number (the right rim).</p>
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
  <table class="tbl out"><caption>All nine positions, by hand (only the outer columns count because the middle column of the filter is 0)</caption>
    <tr><th>Output cell</th><th>Window (rows, cols)</th><th>Left column sum</th><th>Right column sum</th><th>Left − right</th></tr>
    <tr><td>(0, 0)</td><td>rows 0–2, cols 0–2</td><td>8 + 8 + 8 = 24</td><td>8 + 2 + 0 = 10</td><td><strong>14</strong></td></tr>
    <tr><td>(0, 1)</td><td>rows 0–2, cols 1–3</td><td>8 + 8 + 1 = 17</td><td>8 + 1 + 1 = 10</td><td><strong>7</strong></td></tr>
    <tr><td>(0, 2)</td><td>rows 0–2, cols 2–4</td><td>8 + 2 + 0 = 10</td><td>8 + 8 + 8 = 24</td><td><strong>−14</strong></td></tr>
    <tr><td>(1, 0)</td><td>rows 1–3, cols 0–2</td><td>8 + 8 + 8 = 24</td><td>2 + 0 + 1 = 3</td><td><strong>21</strong></td></tr>
    <tr><td>(1, 1)</td><td>rows 1–3, cols 1–3</td><td>8 + 1 + 8 = 17</td><td>1 + 1 + 2 = 4</td><td><strong>13</strong></td></tr>
    <tr><td>(1, 2)</td><td>rows 1–3, cols 2–4</td><td>2 + 0 + 1 = 3</td><td>8 + 8 + 8 = 24</td><td><strong>−21</strong></td></tr>
    <tr><td>(2, 0)</td><td>rows 2–4, cols 0–2</td><td>8 + 8 + 8 = 24</td><td>0 + 1 + 8 = 9</td><td><strong>15</strong></td></tr>
    <tr><td>(2, 1)</td><td>rows 2–4, cols 1–3</td><td>1 + 8 + 8 = 17</td><td>1 + 2 + 8 = 11</td><td><strong>6</strong></td></tr>
    <tr><td>(2, 2)</td><td>rows 2–4, cols 2–4</td><td>0 + 1 + 8 = 9</td><td>8 + 8 + 8 = 24</td><td><strong>−15</strong></td></tr>
  </table>
  <p>Written out in full for cell (1, 0), all nine products: 8·1 + 8·0 + 2·(−1) + 8·1 + 1·0 + 0·(−1) + 8·1 + 8·0 + 1·(−1) = 8 + 0 − 2 + 8 + 0 − 0 + 8 + 0 − 1 = 21. The biggest number, 21, sits exactly where the window's left side is road and its right side is the deepest part of the hole. Now the same in NumPy with two loops, and then with PyTorch's built-in <code>F.conv2d</code>:</p>
<div class="fx" data-lang="py">K = np.array([[1, 0, -1],
              [1, 0, -1],
              [1, 0, -1]], dtype=float)                # vertical-edge filter: left - right
out = np.zeros((3, 3))                                 # (5 - 3) + 1 = 3 positions each way
for i in range(3):
    for j in range(3):
        window = patch[i:i+3, j:j+3]                   # the 3x3 window under the filter
        out[i, j] = (window * K).sum()                 # multiply cell by cell, then add
print(out)
xt = torch.tensor(patch, dtype=torch.float32).reshape(1, 1, 5, 5)   # (N, C, H, W)
kt = torch.tensor(K, dtype=torch.float32).reshape(1, 1, 3, 3)       # (C_out, C_in, k, k)
y = F.conv2d(xt, kt)
print(xt.shape, kt.shape, "-&gt;", y.shape)
print(y[0, 0])</div>
  <div class="fx" data-lang="text">[[ 14.   7. -14.]
 [ 21.  13. -21.]
 [ 15.   6. -15.]]
torch.Size([1, 1, 5, 5]) torch.Size([1, 1, 3, 3]) -&gt; torch.Size([1, 1, 3, 3])
tensor([[ 14.,   7., -14.],
        [ 21.,  13., -21.],
        [ 15.,   6., -15.]])</div>
  <p>What happened: the loop's <code>patch[i:i+3, j:j+3]</code> is the sliding window, and <code>(window * K).sum()</code> is the multiply-and-add. All nine numbers match the hand table. For PyTorch we had to <strong>reshape</strong> the 5 × 5 grid into (1, 1, 5, 5): a batch of 1 image, 1 channel, 5 × 5 pixels. The filter became (1, 1, 3, 3): 1 output map, 1 input channel, 3 × 3. <code>F.conv2d</code> returned (1, 1, 3, 3) with the same nine numbers.</p>
  <p>Compare a patch of smooth road (every pixel 8): every window has left sum 24 and right sum 24, so the whole map is 0: "no edge anywhere". The filter answers its one question, everywhere, with 10 numbers.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>2-D convolution</strong> (as used in deep learning): out(i, j) = Σ<sub>m,n</sub> kernel(m, n) · input(i + m, j + n) + bias. A dot product between the kernel and the window under it, repeated at every position. In a CNN the kernel values are not hand-picked like ours; they are <em>learned</em> by <a class="xref" data-note="dl_backprop">backpropagation</a>, and the network often discovers edge filters very like this one.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deep-learning "convolution" is really cross-correlation: the kernel is not flipped as in the maths/signal-processing definition. Since the weights are learned, it makes no difference, but interviewers sometimes ask.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Padding &amp; stride.</b> Our 5 × 5 patch came out 3 × 3: every 3 × 3 convolution eats a border pixel on each side, and the corner pixels were used by only one window. How do we control the output size, keep it, or shrink it on purpose?</div>

  <h2 id="dc-pad"><span class="num">03</span>Padding &amp; Stride</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>5 × 5 became 3 × 3. Stack ten such layers and a small image vanishes; and the border pixels (where a pothole might start) count less than the centre ones. Can we keep the size, or shrink it deliberately to save compute?</p>
  </div>
  <p><strong>Padding</strong> adds a border of zeros around the image before sliding, so the filter can sit centred on edge pixels too. <strong>Stride</strong> is how many pixels the filter jumps each step; stride 2 skips every other position and roughly halves the output size.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Padding is the white margin around a photo in a frame: the stamp can now be pressed right up to the photo's edge. Stride is how a ticket checker walks a train: checking every seat (stride 1) or every second seat (stride 2), which is quicker but sees half as much.</p></div>
  <h3>Padding 1 on the road patch, by hand</h3>
  <p>With padding 1 the 5 × 5 patch becomes 7 × 7 with a ring of zeros. Now the 3 × 3 filter fits at 5 × 5 positions, so the output stays 5 × 5. The new top-left output uses the padded window [[0, 0, 0], [0, 8, 8], [0, 8, 8]]: left column 0, right column 0 + 8 + 8 = 16, so 0 − 16 = <strong>−16</strong>. That is a "right rim" signal at the top-left corner of smooth road. It is fake: the zeros of the padding look like a dark hole to the filter. The inner 3 × 3 of the output must equal our unpadded answer.</p>
<div class="fx" data-lang="py">X = torch.tensor(patch, dtype=torch.float32).reshape(1, 1, 5, 5)
Kt = torch.tensor(K, dtype=torch.float32).reshape(1, 1, 3, 3)
print(F.pad(X, (1, 1, 1, 1))[0, 0].int())               # (7, 7): zero border
same = F.conv2d(X, Kt, padding=1)[0, 0]
print(same.int())                                       # (5, 5): size kept
print("inner 3x3 == unpadded:", torch.equal(same[1:4, 1:4], F.conv2d(X, Kt)[0, 0]))
print(F.conv2d(X, Kt, padding=1, stride=2)[0, 0].int())  # (3, 3): stride 2</div>
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
inner 3x3 == unpadded: True
tensor([[-16,   7,   9],
        [-17,  13,   4],
        [-16,   6,  10]], dtype=torch.int32)</div>
  <p>Read it: the padded output's top-left is −16 as computed, and its inner block is exactly our earlier map. The first and last columns (−16, −17 … and 9, 10, 4 …) are the fake border edges. The stride-2 output keeps every other cell of the padded output: rows 0, 2, 4 and columns 0, 2, 4. All of this is captured by one formula.</p>
  <div class="callout def"><span class="label">Formula</span>
    <p><strong>out = ⌊(W − K + 2P) / S⌋ + 1</strong> — W input size, K kernel size, P zero-padding per side, S stride, ⌊ ⌋ round down. Traced on our patch (W = 5, K = 3): no padding (5 − 3 + 0)/1 + 1 = <strong>3</strong>; padding 1: (5 − 3 + 2)/1 + 1 = <strong>5</strong>; padding 1, stride 2: ⌊4/2⌋ + 1 = <strong>3</strong>; no padding, stride 2: ⌊2/2⌋ + 1 = <strong>2</strong>.</p>
  </div>
  <p>The same formula at photo scale: input 32, K = 5, P = 2, S = 2 → (32 − 5 + 4)/2 = 15.5 → floor 15 → +1 = <strong>16</strong>. The code checks the formula against real layers, first on our patch, then on a 32 × 32 image:</p>
<div class="fx" data-lang="py">def size(W, K, P, S): return (W - K + 2*P) // S + 1
for K_, P, S in [(3, 0, 1), (3, 1, 1), (3, 1, 2), (3, 0, 2)]:
    y = nn.Conv2d(1, 1, K_, stride=S, padding=P)(X)
    print(f"patch 5x5  K={K_} P={P} S={S}: formula {size(5, K_, P, S)}  torch {tuple(y.shape[2:])}")
x32 = torch.randn(1, 3, 32, 32)
for K_, P, S in [(5, 2, 2), (1, 0, 1)]:
    y = nn.Conv2d(3, 8, K_, stride=S, padding=P)(x32)
    print(f"image 32   K={K_} P={P} S={S}: formula {size(32, K_, P, S)}  torch {tuple(y.shape[2:])}")
print("ResNet stem 224, K=7 P=3 S=2 -&gt;", size(224, 7, 3, 2))</div>
  <div class="fx" data-lang="text">patch 5x5  K=3 P=0 S=1: formula 3  torch (3, 3)
patch 5x5  K=3 P=1 S=1: formula 5  torch (5, 5)
patch 5x5  K=3 P=1 S=2: formula 3  torch (3, 3)
patch 5x5  K=3 P=0 S=2: formula 2  torch (2, 2)
image 32   K=5 P=2 S=2: formula 16  torch (16, 16)
image 32   K=1 P=0 S=1: formula 32  torch (32, 32)
ResNet stem 224, K=7 P=3 S=2 -&gt; 112</div>
  <table class="tbl">
    <tr><th>Setting</th><th>Effect</th><th>On our 5×5 patch</th><th>Used for</th></tr>
    <tr><td>P=0 ("valid")</td><td>Shrinks by K−1</td><td>5 → 3</td><td>Old nets; border pixels under-used</td></tr>
    <tr><td>K=3, P=1, S=1 ("same")</td><td>Size kept</td><td>5 → 5</td><td>Default inside a stage</td></tr>
    <tr><td>S=2</td><td>Size roughly halved</td><td>5 → 3 (with P=1)</td><td>Learned downsampling (ResNet)</td></tr>
    <tr><td>K=1</td><td>Only channels change</td><td>5 → 5</td><td>Cheap channel mixing / bottlenecks</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>The floor in the formula. 64 × 64 with K = 3, P = 0, S = 2 gives ⌊61/2⌋ + 1 = 31, not 31.5 or 32. Off-by-one sizes then break a later <code>Linear</code> layer whose input size you hard-coded. And zero padding invents edges at the border (our −16): one reason networks sometimes "see" defects at image borders. Reflect or replicate padding (<code>padding_mode="reflect"</code>) avoids it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Filters &amp; channels.</b> We can now control the size of one map. But our one filter only finds vertical edges, and only on grey images. A pothole also has top and bottom rims, and the van's camera shoots in colour.</div>

  <h2 id="dc-maps"><span class="num">04</span>Filters &amp; Channels</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>One filter asks one question ("vertical edge here?"). How does a layer ask many questions at once, and what does a filter look like when the image has 3 colour channels instead of 1?</p>
  </div>
  <p>Two things grow. The <strong>number</strong> of filters: a layer has many, each its own pattern detector, and each produces its own output map. The <strong>depth</strong> of each filter: a filter always covers <em>all</em> input channels. On an RGB image a "3 × 3" filter is really 3 × 3 × 3 = 27 weights, one 3 × 3 slice per colour; it multiplies-and-adds over all 27 numbers under it, so it still produces one number per position. Stack the maps of all filters and you get the output, whose number of channels equals the number of filters.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A panel of road inspectors. Each inspector (filter) looks for one thing, say vertical cracks or horizontal cracks, and looks at all photos of the same spot (the channels: red, green, blue) at once, to give one mark per spot. Two inspectors give two mark-sheets (two feature maps).</p></div>
  <h3>Two filters on the road patch</h3>
  <p>Add a second filter: the vertical one turned on its side, [[1, 1, 1], [0, 0, 0], [−1, −1, −1]], which computes <strong>top row sum − bottom row sum</strong>: a horizontal-edge detector. At window (0, 1) (rows 0–2, columns 1–3): top row 8 + 8 + 8 = 24, bottom row 1 + 0 + 1 = 2, so 22: the hole's top rim. At window (2, 1): top row 1 + 0 + 1 = 2, bottom row 8 + 8 + 8 = 24, so −22: the bottom rim. A layer with both filters is <code>Conv2d(1, 2, 3)</code>: 2 filters × 1 channel × 3 × 3 + 2 biases = <strong>20</strong> weights, output (1, 2, 3, 3).</p>
<div class="fx" data-lang="py">two = nn.Conv2d(in_channels=1, out_channels=2, kernel_size=3, bias=False)
with torch.no_grad():
    two.weight[0, 0] = torch.tensor(K)          # filter 0: vertical edges  (left - right)
    two.weight[1, 0] = torch.tensor(K.T)        # filter 1: horizontal edges (top - bottom)
maps = two(X)
print("output", tuple(maps.shape), " params with bias:", 2 * 1 * 3 * 3 + 2)
print("vertical-edge map\\n", maps[0, 0].int())
print("horizontal-edge map\\n", maps[0, 1].int())</div>
  <div class="fx" data-lang="text">output (1, 2, 3, 3)  params with bias: 20
vertical-edge map
 tensor([[ 14,   7, -14],
        [ 21,  13, -21],
        [ 15,   6, -15]], dtype=torch.int32)
horizontal-edge map
 tensor([[ 15,  22,  15],
        [  1,   0,   0],
        [-15, -22, -15]], dtype=torch.int32)</div>
  <p>Two maps from one input: the vertical map lights up on the left (+) and right (−) rims, the horizontal map on the top (+) and bottom (−) rims. Together they outline the pothole on all four sides.</p>
  <h3>Colour input: the filter gets depth</h3>
  <p>Shape trace for the van's colour patch through <code>Conv2d(3, 2, kernel_size=3)</code>: input (1, 3, 5, 5); weight (2, 3, 3, 3), i.e. 2 filters each 3 × 3 × 3; bias (2,); output (1, 2, 3, 3): 2 maps, each 3 × 3 as before. Parameters: 2·3·3·3 + 2 = <strong>56</strong>. The code builds a colour version of our patch (muddy water in the hole is a little bluer) and checks one output number by hand: filter 1 times the top-left 3 × 3 × 3 block, summed, plus bias 1.</p>
<div class="fx" data-lang="py">torch.manual_seed(0)
rgb = np.stack([patch, patch, patch + (patch &lt;= 2) * 2])       # R, G, B; blue +2 in the hole
xc = torch.tensor(rgb, dtype=torch.float32).unsqueeze(0)       # (1, 3, 5, 5)
conv = nn.Conv2d(in_channels=3, out_channels=2, kernel_size=3)
print("input ", tuple(xc.shape))
print("weight", tuple(conv.weight.shape), " bias", tuple(conv.bias.shape))
yc = conv(xc)
print("output", tuple(yc.shape))
manual = (xc[0, :, 0:3, 0:3] * conv.weight[1]).sum() + conv.bias[1]   # (3,3,3) * (3,3,3)
print(round(manual.item(), 4), round(yc[0, 1, 0, 0].item(), 4))
print(n(conv), 2*3*3*3 + 2, "| Conv2d(64,128,3):", n(nn.Conv2d(64, 128, 3)))</div>
  <div class="fx" data-lang="text">input  (1, 3, 5, 5)
weight (2, 3, 3, 3)  bias (2,)
output (1, 2, 3, 3)
1.2052 1.2052
56 56 | Conv2d(64,128,3): 73856</div>
  <p>What happened: <code>xc[0, :, 0:3, 0:3]</code> picks image 0, <em>all</em> channels, rows 0–2 and columns 0–2, a (3, 3, 3) block. <code>conv.weight[1]</code> is filter number 1, also (3, 3, 3). Multiply, sum all 27 products, add the bias: the result equals output channel 1 at position (0, 0). So a multi-channel convolution is the same multiply-and-add, just summed across channels too. Parameter counts: 56 for our layer, and 128·64·3·3 + 128 = 73,856 for a typical <code>Conv2d(64, 128, 3)</code> deep in a network, where the 64 "channels" are the 64 maps of the previous layer.</p>
  <div class="flow"><span>Input: C<sub>in</sub> × H × W</span><span>Each filter: C<sub>in</sub> × k × k</span><span>One filter → one 2-D map</span><span>Output: C<sub>out</sub> × H′ × W′</span></div>
  <div class="cards">
    <div><b>Filter (kernel)</b><p>Learned weights spanning <em>all</em> input channels.</p><small>3×3 on RGB = 27 weights + 1 bias</small></div>
    <div><b>Channels in</b><p>Colours for the image; previous layer's maps deeper in.</p><small>sets the filter's depth</small></div>
    <div><b>Channels out</b><p>Number of filters = output depth.</p><small>2 filters → 2 maps</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p>Conv weight shape: (C<sub>out</sub>, C<sub>in</sub>, k, k); <strong>parameters = C<sub>out</sub>·C<sub>in</sub>·k·k + C<sub>out</sub></strong>. Output shape (N, C<sub>out</sub>, H′, W′) with H′, W′ from the size formula.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Counting params as 64·3·3 + 64 (forgetting input channels). The kernel has depth = input channels: Conv2d(3, 64, 3) is 64·<strong>3</strong>·3·3 + 64 = 1,792. This is the most common interview arithmetic slip.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Feature maps.</b> We get one output grid per filter. What exactly do these grids mean, why do we pass them through ReLU, and what happens to them when the pothole moves?</div>

  <h2 id="dc-fmap"><span class="num">05</span>Feature Maps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have produced grids of numbers like [[14, 7, −14], [21, 13, −21], [15, 6, −15]]. How should we read them, what does the next layer do with them, and did we really get the "same filter fires wherever the pattern is" promise from section 01?</p>
  </div>
  <p>A <strong>feature map</strong> is a map of "where is my pattern, and how strongly". Each cell corresponds to one window of the input. After a convolution a CNN almost always applies <strong>ReLU</strong> (max(0, value)): keep the places where the pattern was found, set everything else to 0. On the vertical-edge map that keeps the left-rim column and zeroes the right-rim column. (The right rim is not lost: a second, learned filter with the opposite sign will detect it.)</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A heat map on a delivery app showing where orders are coming from. Each cell is an area; brightness is how much activity. A feature map is a heat map of one pattern over the image.</p></div>
  <h3>Reading the map, and checking equivariance</h3>
  <p>Now move the pothole one pixel right (the shifted patch from section 01) and run the same filter. Promise: the map should move one cell right too, with the same values.</p>
<div class="fx" data-lang="py">relu_map = torch.relu(F.conv2d(X, Kt))[0, 0]
print("ReLU(left-edge map) on the patch\\n", relu_map.int())
Xs = torch.tensor(shifted, dtype=torch.float32).reshape(1, 1, 5, 5)
ms = torch.relu(F.conv2d(Xs, Kt))[0, 0]
print("same filter on the shifted patch\\n", ms.int())
print("strongest response:", relu_map.max().item(), "at", divmod(relu_map.argmax().item(), 3),
      "| shifted:", ms.max().item(), "at", divmod(ms.argmax().item(), 3))</div>
  <div class="fx" data-lang="text">ReLU(left-edge map) on the patch
 tensor([[14,  7,  0],
        [21, 13,  0],
        [15,  6,  0]], dtype=torch.int32)
same filter on the shifted patch
 tensor([[ 7, 14,  7],
        [ 7, 21, 13],
        [ 7, 15,  6]], dtype=torch.int32)
strongest response: 21.0 at (1, 0) | shifted: 21.0 at (1, 1)</div>
  <p>The strongest response 21 moved from cell (1, 0) to cell (1, 1): one step right, same value. That is <strong>translation equivariance</strong>, measured. The MLP of section 01 saw 10 of its 25 inputs change; the convolution just moved its answer. (The values at the edges differ a little because the shifted hole is now closer to the border.)</p>
  <h3>What learned feature maps look like</h3>
  <p>In a trained network, layer 1 filters turn out to be edge and colour-blob detectors, much like our hand filters. Layer 2 filters look at the layer-1 <em>maps</em> (that is what their input channels are), so they detect combinations of edges: corners, rims, textures such as cracked asphalt. Deeper layers detect parts (a pothole's shadowed rim, a manhole cover) and then whole objects. Each layer's maps are the next layer's image.</p>
  <div class="cards">
    <div><b>Layer 1</b><p>Edges, colour blobs</p><small>our vertical / horizontal filters</small></div>
    <div><b>Layer 2–3</b><p>Corners, rims, textures</p><small>combinations of edge maps</small></div>
    <div><b>Deep layers</b><p>Parts and objects</p><small>"pothole", "manhole", "car"</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Feature map</strong>: the 2-D output of one filter (usually after ReLU); high values mark where its pattern occurs. <strong>Activation</strong>: another name for the values in feature maps. <strong>Translation equivariance</strong>: conv(shift(x)) = shift(conv(x)), up to border effects.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A negative value in a raw feature map is not "nothing": it is the opposite pattern (our right rim). ReLU throws it away, so networks learn sign-flipped twin filters. If you visualise maps for debugging, look at them before and after ReLU.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Pooling.</b> Feature maps are as large as the image (5 × 5 with padding; 112 × 112 in a real network) and record the <em>exact</em> pixel of each edge. For "is there a pothole?" we only need "an edge was found around here", and carrying full-size maps through every layer is expensive.</div>

  <h2 id="dc-pool"><span class="num">06</span>Pooling</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we shrink a feature map so that it keeps "the pattern was found in this area" but forgets "exactly which pixel", which also makes the answer survive small shifts?</p>
  </div>
  <p><strong>Pooling</strong> summarises each small window of a map, usually 2 × 2 with stride 2, as one number. <strong>Max pooling</strong> keeps the biggest value ("was the feature anywhere here?"); <strong>average pooling</strong> keeps the mean. Pooling has no weights to learn, and it works on each channel separately, so the channel count does not change. The size formula still applies with K = 2, S = 2, P = 0.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Each bench of four students sends only its top mark to the teacher (max pooling). The teacher learns the best score per bench, not who sat where. Average pooling would send the bench average instead.</p>
  </div>
  <h3>Pooling our feature map, by hand</h3>
  <p>Take the padded (5 × 5) left-edge map from section 03 after ReLU: [[0, 6, 7, 0, 9], [0, 14, 7, 0, 10], [0, 21, 13, 0, 4], [0, 15, 6, 0, 11], [0, 7, 6, 0, 10]]. Size formula: ⌊(5 − 2)/2⌋ + 1 = 2, so 2 × 2 windows cover rows 0–3 and columns 0–3; the last row and column are dropped by the floor. Top-left window {0, 6, 0, 14}: max <strong>14</strong>, mean 5. Top-right {7, 0, 7, 0}: max 7, mean 3.5. Bottom-left {0, 21, 0, 15}: max <strong>21</strong>, mean 9. Bottom-right {13, 0, 6, 0}: max 13, mean 4.75.</p>
<div class="fx" data-lang="py">fm = torch.relu(F.conv2d(X, Kt, padding=1))           # (1, 1, 5, 5) padded left-edge map
print(fm[0, 0].int())
print(nn.MaxPool2d(2)(fm)[0, 0])                      # (1,1,5,5) -&gt; (1,1,2,2)
print(nn.AvgPool2d(2)(fm)[0, 0])
gm  = torch.relu(F.conv2d(X, Kt)).amax(dim=(2, 3))    # global max: whole map -&gt; 1 number
gms = torch.relu(F.conv2d(Xs, Kt)).amax(dim=(2, 3))   # same, pothole shifted 1 pixel
print("global max: patch", gm.item(), " shifted patch", gms.item())
fmap = torch.randn(8, 128, 7, 7)                      # a real end-of-network shape
print(nn.AdaptiveAvgPool2d(1)(fmap).shape, fmap.mean(dim=(2, 3)).shape)</div>
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
torch.Size([8, 128, 1, 1]) torch.Size([8, 128])</div>
  <p>What happened: max and average pooling match the hand values, and the dropped last column (9, 10, 4, 11, 10) was the fake padding edge anyway. The <strong>global max</strong> over the whole map is 21 for the original <em>and</em> the shifted patch: after pooling, the answer to "is there a left rim anywhere?" no longer depends on where the pothole sits. That is the invariance the trap in section 01 talked about: it comes from pooling, not from convolution. <strong>Global average pooling</strong> (<code>AdaptiveAvgPool2d(1)</code>) averages each whole map into one number per channel: (8, 128, 7, 7) becomes (8, 128, 1, 1), the same as <code>mean(dim=(2, 3))</code>. That turns any image size into a fixed-length vector for the final classifier.</p>
  <div class="cards">
    <div><b>Max pool</b><p>"Was the feature anywhere in this window?"</p><small>Halves H, W; 0 params</small></div>
    <div><b>Average pool</b><p>Smooth summary of the window.</p><small>Keeps weak signals</small></div>
    <div><b>Global pool</b><p>Each channel's whole map → 1 number.</p><small>Before the classifier; replaces huge FC layers</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Pooling</strong>: a fixed, parameter-free downsampling that applies max or mean over each window, per channel. (N, C, H, W) → (N, C, ⌊H/2⌋, ⌊W/2⌋) for 2 × 2, stride 2. <strong>Global average pooling (GAP)</strong>: one mean per channel over the whole map.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pooling throws away position and 3 of every 4 values. Modern nets (ResNet) mostly downsample with stride-2 convs, which learn what to keep; global average pooling stays at the end. And the floor silently drops the last row/column of odd-sized maps (our 5 × 5 → 2 × 2).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Stacking &amp; the receptive field.</b> Every tool so far works on one layer, and one 3 × 3 layer only ever sees 3 × 3 pixels: a rim, never a whole pothole, never a whole road. How do layers combine into a network that sees large objects?</div>

  <h2 id="dc-stack"><span class="num">07</span>Stacking: Receptive Field &amp; Architecture</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A single 3 × 3 filter cannot tell a pothole (a dark area with rims all round) from a single crack (one rim). Something must look at a bigger region. How does a network of small filters end up seeing a whole object?</p>
  </div>
  <p>Stack convolutions. A unit in layer 2 looks at a 3 × 3 window of layer-1 <em>maps</em>; each of those layer-1 cells looked at 3 × 3 pixels; together that is 5 × 5 pixels: our whole patch. The input region that can affect one unit is its <strong>receptive field</strong>. Each extra 3 × 3 conv adds 2 pixels; each stride-2 step (pool or strided conv) doubles how much every later layer adds.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Reading a newspaper photo of a cricket match. First you notice lines and colours, then shapes (bat, ball, stumps), then the scene ("a batsman getting bowled"). Each step looks at a bigger region in less detail, but with richer meaning.</p></div>
  <h3>The receptive field, traced</h3>
  <p>Rule: r<sub>new</sub> = r<sub>old</sub> + (k − 1)·j, and j<sub>new</sub> = j·s, where k is the layer's kernel size, s its stride, and j the "jump" (how many input pixels one step in the current map corresponds to). Start with r = 1, j = 1.</p>
  <table class="tbl out"><caption>Receptive field of one unit, layer by layer</caption>
    <tr><th>After layer</th><th>k, s</th><th>r = r + (k − 1)·j</th><th>j = j·s</th><th>Sees</th></tr>
    <tr><td>conv 3×3</td><td>3, 1</td><td>1 + 2·1 = <strong>3</strong></td><td>1</td><td>a rim</td></tr>
    <tr><td>conv 3×3</td><td>3, 1</td><td>3 + 2·1 = <strong>5</strong></td><td>1</td><td>our whole 5×5 patch</td></tr>
    <tr><td>max pool 2×2</td><td>2, 2</td><td>5 + 1·1 = <strong>6</strong></td><td>2</td><td></td></tr>
    <tr><td>conv 3×3</td><td>3, 1</td><td>6 + 2·2 = <strong>10</strong></td><td>2</td><td>several patches: a stretch of road</td></tr>
  </table>
  <p>We can check this without any formula: the receptive field is exactly the set of input pixels whose gradient on one output unit is non-zero. Build the stack, pick the centre output unit, back-propagate, and count the touched pixels.</p>
<div class="fx" data-lang="py">def receptive_field(layers, size=24):
    torch.manual_seed(0)
    x = torch.randn(1, 1, size, size, requires_grad=True)
    y = nn.Sequential(*layers)(x)
    c = y.shape[-1] // 2
    y[0, 0, c, c].backward()                          # one unit in the middle
    rows = (x.grad[0, 0].abs().sum(1) &gt; 0).nonzero()  # input rows that influence it
    return int(rows.max() - rows.min() + 1)
conv = lambda: nn.Conv2d(1, 1, 3, padding=1)
print("conv              ", receptive_field([conv()]))
print("conv conv         ", receptive_field([conv(), conv()]))
pool = lambda: nn.AvgPool2d(2)     # average pool: gradient reaches every pixel of the window
print("conv conv pool    ", receptive_field([conv(), conv(), pool()]))
print("conv conv pool conv", receptive_field([conv(), conv(), pool(), conv()]))
two_layer = nn.Sequential(nn.Conv2d(1, 1, 3), nn.Conv2d(1, 1, 3))
print("two valid 3x3 convs on our 5x5 patch -&gt;", tuple(two_layer(X).shape))</div>
  <div class="fx" data-lang="text">conv               3
conv conv          5
conv conv pool     6
conv conv pool conv 10
two valid 3x3 convs on our 5x5 patch -&gt; (1, 1, 1, 1)</div>
  <p>3, 5, 6, 10: the gradient count agrees with the hand table. (The measurement uses an average pool: a max pool sends the gradient only to the winning pixel of each window, so the count would depend on the random input, although the region that <em>can</em> influence the unit is the same.) The last line is the concrete meaning on our running example: two unpadded 3 × 3 convs turn the 5 × 5 patch into a single number (5 → 3 → 1), and that number depends on all 25 pixels. A layer-2 unit can therefore combine "left rim here" and "right rim there" into "a hole between them".</p>
  <div class="callout intu"><span class="label">Why 3×3 everywhere (VGG)</span>
    <p>Two stacked 3×3 convs see a 5×5 region, like one 5×5 conv. With 64 channels: 2·9·64·64 = 73,728 weights vs 25·64·64 = 102,400 for one 5×5 — 28% fewer, plus an extra ReLU between them.</p>
  </div>
  <h3>The classic recipe: shrink space, add channels</h3>
  <p>We now have all the bricks: conv (find patterns), ReLU (keep positives), pooling or stride (shrink and widen the receptive field), and a final linear layer (decide the class). How do you stack them? The answer has been stable for 30 years: repeat a block that <strong>shrinks the picture and adds more filters</strong>, then pool everything and classify.</p>
  <p>Why shrink and widen at the same time? Early layers see small patches and only need a few filters (there are few kinds of edges). Later layers combine edges into many kinds of textures and parts, so they need more channels, but they no longer need fine pixel positions. Halving height and width while doubling channels keeps the compute per layer roughly balanced.</p>
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
  <div class="callout def"><span class="label">Definition</span><p><strong>Receptive field</strong>: the region of the input image that can affect one output unit; r grows by (k − 1)·j per layer, and the jump j multiplies by every stride. That is how deep layers can "see" whole objects. <strong>Stage</strong>: a group of layers working at one spatial size, ending in a downsampling step.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The theoretical receptive field is an upper bound. In practice the centre pixels of it have much more influence than the edges (the "effective" receptive field is smaller), so a net that must see large objects needs more depth or downsampling than the formula alone suggests.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Train a CNN.</b> All of this is shapes and hand-set filters. Does a CNN actually learn useful filters from labelled images, and does it really beat an MLP when objects move?</div>

  <h2 id="dc-train"><span class="num">08</span>Hands-on: Train a CNN</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We hand-picked our edge filters. Does training find good filters by itself, and does the CNN's sliding-and-pooling really protect it when the object shifts, as our pothole demo suggested?</p>
  </div>
  <p>Our 5 × 5 road patch is too small to train on, so here is <em>the same idea at scale</em>: scikit-learn's handwritten digits, 1,797 grey images of 8 × 8 pixels (just bigger patches), labels 0–9. We train a small CNN and a plain MLP with a similar number of weights. Then we shift every test image one pixel to the right, exactly what happened when the van stopped a pixel later, and see which model copes.</p>
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
  <div class="callout trap"><span class="label">Trap</span><p>The CNN still dropped from 98% to 63%: convolution is not magic shift-invariance, especially with only two pooling steps on a tiny image. In practice you also train with <strong>data augmentation</strong> (random shifts, crops, flips), so the model sees moved objects during training. For road photos: random crops, flips, brightness changes for sun and shade.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: ResNet.</b> Two conv layers were enough for 8 × 8 digits. Real road photos need dozens of layers for a large receptive field. Does simply stacking more layers keep working?</div>

  <h2 id="dc-res"><span class="num">09</span>ResNet Skip Connections</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 07 says depth gives a bigger receptive field and richer features. So why did researchers find that a 56-layer plain CNN does <em>worse</em> than a 20-layer one, even on its own training data?</p>
  </div>
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
  <p>Why does this happen at all? It is the chain rule from <a class="xref" data-note="dl_backprop">Backpropagation</a>: the gradient reaching layer 1 is a product of one factor per layer above it, and the <a class="xref" data-note="dl_training">Training</a> note's vanishing-gradient problem says such products shrink exponentially when the factors are below 1. The skip connection does not make the factors bigger; it adds a second path whose factor is exactly 1. The same "+x" idea reappears as the LSTM cell state in <a class="xref" data-note="dl_rnns">RNNs</a> and as the residual connections in every <a class="xref" data-note="transformers">Transformer</a> layer.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: EfficientNet.</b> Skips let us train 50 or 150 layers. But depth is only one knob. Given more compute, should the net be deeper, wider, or see sharper images?</div>

  <h2 id="dc-eff"><span class="num">10</span>EfficientNet Scaling</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can now build very deep nets. With a fixed budget (a phone in the inspection van, a cloud bill), how should a network grow to get the most accuracy per unit of compute?</p>
  </div>
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
  <p>On our running example the three knobs mean: <em>resolution</em>, cut 10 × 10 patches instead of 5 × 5 so small cracks are visible; <em>depth</em>, more layers so the receptive field still covers the larger patch (section 07: two 3 × 3 convs cover 5 pixels, a 10-pixel patch needs a pool and another conv); <em>width</em>, more filters to describe the finer textures. Turning only one knob wastes the others.</p>
  <div class="bridge"><b>What this still can't tell us → next: Transfer learning.</b> We know how to design and grow strong CNNs, but every one of them needs a huge labelled dataset to train from scratch. The road-inspection team has labelled only a few hundred photos.</div>

  <h2 id="dc-tl"><span class="num">11</span>Transfer Learning with Pretrained CNNs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A ResNet has 11 million weights; we have 500 labelled road photos (pothole / no pothole). Trained from scratch it would memorise them. How do we get a good pothole detector anyway?</p>
  </div>
  <p>Notice what the early layers of any image CNN learn: edge and texture filters like the ones we wrote by hand in sections 02–04. Those are the same for road photos, X-rays and cat pictures. A ResNet trained on ImageNet (1.2 million photos, 1000 classes) already has them, plus filters for rims, shadows and surfaces. <strong>Transfer learning</strong> reuses that network and retrains only what is task-specific.</p>
  <p>In plain words: keep the pretrained <strong>backbone</strong> (all conv stages), throw away its final layer (which outputs 1000 ImageNet classes), add a new final layer for our 2 classes, and train. First train only the new layer; later, optionally, gently adjust the top stage.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket fielding coach moving to a hockey team. Fitness and footwork training carry over (frozen backbone). Only the hockey-specific skills need teaching (the new head). Later, small adjustments to the rest (fine-tuning at a tiny learning rate).</p>
  </div>
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
  <p>First, know the backbone's shapes, because the head must fit them. Trace one 224 × 224 road photo through ResNet-18: the stem conv (K7, S2) gives 112 (the size formula: ⌊(224 − 7 + 6)/2⌋ + 1 = 112), max-pool 56, then four stages at 56, 28, 14, 7 with 64, 128, 256, 512 channels (the "spatial ↓, channels ↑" recipe of section 07), global average pool to (1, 512), and the original <code>fc</code> to 1000 classes. So the new head is <code>Linear(512, 2)</code>: 512·2 + 2 = <strong>1,026</strong> weights.</p>
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
m.fc = nn.Linear(m.fc.in_features, 2)           # new head: pothole / no pothole (trainable)
cnt = lambda ps: sum(p.numel() for p in ps)
print(f"total {cnt(m.parameters()):,}  trainable {cnt(p for p in m.parameters() if p.requires_grad):,}")
for p in m.layer4.parameters():
    p.requires_grad = True                      # stage 2: unfreeze the last stage
opt = torch.optim.AdamW([
    {"params": m.layer4.parameters(), "lr": 1e-5},   # pretrained: tiny LR
    {"params": m.fc.parameters(),     "lr": 1e-3}])  # new head: normal LR
print(f"trainable after unfreezing layer4 {cnt(p for p in m.parameters() if p.requires_grad):,}")
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
total 11,177,538  trainable 1,026
trainable after unfreezing layer4 8,394,754
(2, 2)</div>
  <p>What happened: setting <code>requires_grad = False</code> on every parameter froze the backbone; the new <code>fc</code> is created after, so it is trainable: 1,026 of 11.2M weights. 500 photos are plenty to fit 1,026 weights. Unfreezing <code>layer4</code> adds 8.4M trainable weights, and the two <strong>parameter groups</strong> give them a 100× smaller learning rate than the head. The final output is (2, 2): two photos, two class scores (pothole, no pothole). <em>This ran with random weights (the sandbox cannot download ImageNet weights); shapes and counts are identical with pretrained weights.</em></p>
  <table class="tbl">
    <tr><th>Your data</th><th>Similar to ImageNet (road photos)</th><th>Very different (X-ray, satellite, thermal)</th></tr>
    <tr><td>Small (&lt; 1K)</td><td>Freeze all, train head</td><td>Freeze early stages, fine-tune top + head</td></tr>
    <tr><td>Large (10K+)</td><td>Fine-tune top stages + head</td><td>Fine-tune everything, still init from pretrained</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Backbone</strong>: the pretrained feature extractor. <strong>Head</strong>: the task-specific final layer(s). <strong>Feature extraction</strong>: frozen backbone + trained head. <strong>Fine-tuning</strong>: also update pretrained weights with a small learning rate.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fine-tuning pretrained layers at LR 1e-3 wipes out what they learned within a few epochs (catastrophic forgetting); the model then does worse than frozen features. Use parameter groups with 10–100× lower LR, and the same resize + ImageNet mean/std normalisation the model was trained with.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have a working pothole detector and a dozen ideas behind it. How do they hang together as one story?</div>

  <h2 id="dc-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Convolution, padding, stride, channels, feature maps, pooling, receptive field, ResNet, EfficientNet, transfer learning: ten separate facts, or one idea with consequences?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="dc-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="170" height="44" rx="7" class="fr sr"/><text x="95" y="29" text-anchor="middle" font-size="11.5" font-weight="700">MLP on pixels</text><text x="95" y="45" text-anchor="middle" class="tm" font-size="10">416 / 150.5M weights</text>
<line x1="180" y1="32" x2="218" y2="32" stroke="currentColor" marker-end="url(#dc-a9)"/>
<rect x="220" y="10" width="200" height="44" rx="7" class="fb sb"/><text x="320" y="29" text-anchor="middle" font-size="11.5" font-weight="700">convolution = shared 3×3 filter</text><text x="320" y="45" text-anchor="middle" class="tm" font-size="10">10 weights; rim → 21 / −21</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dc-a9)"/>
<rect x="460" y="10" width="210" height="44" rx="7" class="fb sb"/><text x="565" y="29" text-anchor="middle" font-size="11.5" font-weight="700">padding &amp; stride</text><text x="565" y="45" text-anchor="middle" class="tm" font-size="10">⌊(W − K + 2P)/S⌋ + 1: 3, 5, 3</text>
<line x1="320" y1="54" x2="320" y2="84" stroke="currentColor" marker-end="url(#dc-a9)"/>
<rect x="200" y="86" width="240" height="44" rx="7" class="fb sb"/><text x="320" y="105" text-anchor="middle" font-size="11.5" font-weight="700">many filters × all channels</text><text x="320" y="121" text-anchor="middle" class="tm" font-size="10">C_out·C_in·k·k + C_out: 20, 56</text>
<line x1="320" y1="130" x2="320" y2="160" stroke="currentColor" marker-end="url(#dc-a9)"/>
<rect x="200" y="162" width="240" height="44" rx="7" class="ft st"/><text x="320" y="181" text-anchor="middle" font-size="11.5" font-weight="700">feature maps (+ ReLU)</text><text x="320" y="197" text-anchor="middle" class="tm" font-size="10">equivariant: 21 moves with the hole</text>
<line x1="200" y1="184" x2="168" y2="184" stroke="currentColor" marker-end="url(#dc-a9)"/>
<rect x="10" y="162" width="156" height="44" rx="7" class="ft st"/><text x="88" y="181" text-anchor="middle" font-size="11.5" font-weight="700">pooling</text><text x="88" y="197" text-anchor="middle" class="tm" font-size="10">global max 21 either way</text>
<line x1="440" y1="184" x2="472" y2="184" stroke="currentColor" marker-end="url(#dc-a9)"/>
<rect x="474" y="162" width="196" height="44" rx="7" class="ft st"/><text x="572" y="181" text-anchor="middle" font-size="11.5" font-weight="700">stacking → receptive field</text><text x="572" y="197" text-anchor="middle" class="tm" font-size="10">3 → 5 → 6 → 10</text>
<line x1="572" y1="206" x2="572" y2="236" stroke="currentColor" marker-end="url(#dc-a9)"/>
<rect x="474" y="238" width="196" height="40" rx="7" class="fr sr"/><text x="572" y="256" text-anchor="middle" font-size="11.5" font-weight="700">deep plain nets stall</text><text x="572" y="271" text-anchor="middle" class="tm" font-size="10">grad 1e-14 at layer 1</text>
<line x1="474" y1="258" x2="442" y2="258" stroke="currentColor" marker-end="url(#dc-a9)"/>
<rect x="290" y="238" width="150" height="40" rx="7" class="fg sg"/><text x="365" y="256" text-anchor="middle" font-size="11.5" font-weight="700">ResNet: F(x) + x</text><text x="365" y="271" text-anchor="middle" class="tm" font-size="10">grad 16</text>
<line x1="290" y1="258" x2="258" y2="258" stroke="currentColor" marker-end="url(#dc-a9)"/>
<rect x="106" y="238" width="150" height="40" rx="7" class="fg sg"/><text x="181" y="256" text-anchor="middle" font-size="11.5" font-weight="700">EfficientNet</text><text x="181" y="271" text-anchor="middle" class="tm" font-size="10">d·w²·r² ≈ 2 per step</text>
<line x1="181" y1="278" x2="181" y2="296" stroke="currentColor" marker-end="url(#dc-a9)"/>
<rect x="60" y="298" width="300" height="28" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="210" y="317" text-anchor="middle" font-size="11">transfer learning: reuse backbone, new 2-class head (1,026)</text>
</svg><figcaption>Everything grows out of one idea: share a small filter across all positions. Sharing creates the size bookkeeping (padding, stride, channels), the outputs (feature maps), the need to summarise them (pooling) and to stack them (receptive field); deep stacks need skips (ResNet), growth needs balance (EfficientNet), and the learned early filters are reusable (transfer learning).</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same 5×5 road patch</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our patch</th><th>When to use</th></tr>
    <tr><td>MLP on pixels</td><td>flatten + Linear</td><td>can our old network read images?</td><td>416 weights; shift changes 10/25 inputs</td><td>tiny fixed-position inputs only</td></tr>
    <tr><td>Convolution</td><td>dot product of filter and window, slid</td><td>where is my pattern?</td><td>[[14, 7, −14], [21, 13, −21], [15, 6, −15]]</td><td>any grid data (images, spectrograms)</td></tr>
    <tr><td>Padding</td><td>zeros around the input</td><td>keep the size?</td><td>5 → 5; corner −16 (fake edge)</td><td>"same" convs inside a stage</td></tr>
    <tr><td>Stride</td><td>skip positions</td><td>shrink on purpose?</td><td>5 → 3 (P1, S2)</td><td>learned downsampling</td></tr>
    <tr><td>Size formula</td><td>W, K, P, S</td><td>what shape comes out?</td><td>⌊(5 − 3 + 2)/2⌋ + 1 = 3</td><td>before writing any Linear layer</td></tr>
    <tr><td>Filters &amp; channels</td><td>one filter per pattern, depth = C<sub>in</sub></td><td>several patterns, colour?</td><td>Conv2d(1,2,3) = 20; Conv2d(3,2,3) = 56</td><td>every layer</td></tr>
    <tr><td>Feature map + ReLU</td><td>conv output, negatives cut</td><td>what did the filter find, where?</td><td>[[14, 7, 0], [21, 13, 0], [15, 6, 0]]; peak moves with the hole</td><td>debugging, visualisation</td></tr>
    <tr><td>Pooling</td><td>max/mean per window</td><td>found it "around here"?</td><td>[[14, 7], [21, 13]]; global max 21 either way</td><td>downsampling; GAP before the head</td></tr>
    <tr><td>Receptive field</td><td>stacked k and strides</td><td>how much does one unit see?</td><td>3 → 5 (whole patch) → 6 → 10</td><td>choosing depth for object size</td></tr>
    <tr><td>ResNet skip</td><td>output + input</td><td>why do deep nets stop training?</td><td>layer-1 grad 1e-14 → 16</td><td>any net deeper than ~20 layers</td></tr>
    <tr><td>EfficientNet</td><td>depth, width, resolution together</td><td>how to grow with compute?</td><td>10×10 patches need more depth and filters</td><td>picking a backbone size</td></tr>
    <tr><td>Transfer learning</td><td>pretrained backbone + new head</td><td>little labelled data?</td><td>1,026 trainable of 11.2M</td><td>almost every real image task</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a CNN shares one small filter across every position, and stacks such layers so that small patterns combine into big ones.</strong> Sharing gives few weights and equivariance; stacking gives a growing receptive field; and the problems of stacking deep (vanishing gradients, cost, data hunger) are what ResNet, EfficientNet and transfer learning solve.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The ideas are connected; now the traps that catch people in code and interviews.</div>

  <h2 id="dc-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which errors do people actually make when they build and train CNNs, and how do you spot each one quickly?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong layout</span>
    <p>PyTorch wants (N, C, H, W). An image loaded with PIL/NumPy is (H, W, C): use <code>permute(2, 0, 1)</code> and add a batch dim with <code>unsqueeze(0)</code>. Our single grey patch needed (1, 1, 5, 5).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting input channels in param counts</span>
    <p>Params = C<sub>out</sub>·C<sub>in</sub>·k·k + C<sub>out</sub>. Conv2d(3, 64, 3) is 1,792, not 640.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: hard-coded Linear input size</span>
    <p>Change the image size or a stride and <code>Linear(32*2*2, 10)</code> breaks with "mat1 and mat2 shapes cannot be multiplied". Print shapes with a dummy batch, or end the conv part with <code>AdaptiveAvgPool2d(1)</code> so the size is always C.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the floor in the size formula</span>
    <p>⌊(W − K + 2P)/S⌋ + 1. Odd sizes with stride 2 lose a pixel (64 → 31 with K3, P0, S2; our 5 × 5 map → 2 × 2 after pooling), and then a residual addition no longer matches.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "CNNs are shift-invariant"</span>
    <p>Convolution is equivariant (our peak moved from (1, 0) to (1, 1)); invariance comes from pooling (global max 21 both times) and data augmentation. Our digits CNN still fell from 98% to 63% on a 1-pixel shift.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: skip connections and overfitting</span>
    <p>ResNet skips fix optimisation (vanishing gradients, degradation), not overfitting. Shapes must match; use a 1×1 projection when they do not.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: pretrained model, wrong preprocessing or LR</span>
    <p>Feed the resize and ImageNet mean/std the backbone expects; fine-tune pretrained layers at 1e-5–1e-4, not 1e-3.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="dl_rnns">RNNs</a>, where the data is a sequence of any length instead of a fixed grid.</div>

  <h2 id="dc-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: a 5 × 5 grey road patch (0 = black, 8 = asphalt) with a pothole: rows [8 8 8 8 8], [8 8 2 1 8], [8 1 0 1 8], [8 8 1 2 8], [8 8 8 8 8]. Question: pothole or not?</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our patch</th><th>Weakness → next</th></tr>
    <tr><td>MLP on pixels</td><td>can a plain net read images?</td><td>416 weights; shift changes 10/25 inputs</td><td>too many weights, no locality</td></tr>
    <tr><td>Convolution</td><td>find a pattern anywhere with few weights?</td><td>edge map peak 21 (left rim), −21 (right rim)</td><td>output shrinks 5 → 3</td></tr>
    <tr><td>Padding &amp; stride</td><td>control the output size?</td><td>P1 → 5×5; P1 S2 → 3×3</td><td>one filter = one pattern</td></tr>
    <tr><td>Filters &amp; channels</td><td>many patterns, colour input?</td><td>Conv2d(1,2,3) = 20; (3,2,3) = 56</td><td>what do outputs mean?</td></tr>
    <tr><td>Feature maps</td><td>where was each pattern found?</td><td>ReLU map; peak (1,0) → (1,1) after shift</td><td>big, too exact</td></tr>
    <tr><td>Pooling</td><td>keep "found", drop "exactly where"?</td><td>[[14, 7], [21, 13]]; global max 21 both</td><td>one layer sees only 3×3</td></tr>
    <tr><td>Stacking</td><td>see whole objects?</td><td>RF 3 → 5 → 6 → 10</td><td>deep plain nets stall</td></tr>
    <tr><td>ResNet</td><td>why does depth hurt training?</td><td>grad 1e-14 → 16 with skips</td><td>how to grow?</td></tr>
    <tr><td>EfficientNet</td><td>deeper, wider or sharper?</td><td>all three, α·β²·γ² ≈ 2</td><td>needs lots of data</td></tr>
    <tr><td>Transfer learning</td><td>little labelled data?</td><td>Linear(512, 2): 1,026 trainable</td><td>—</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Convolution</td><td>out(i, j) = Σ<sub>m,n</sub> K(m, n)·X(i + m, j + n) + b</td><td>K kernel, X input, b bias; summed over channels too</td></tr>
    <tr><td>Output size</td><td>⌊(W − K + 2P)/S⌋ + 1</td><td>W input size, K kernel, P padding per side, S stride</td></tr>
    <tr><td>Conv params</td><td>C<sub>out</sub>·C<sub>in</sub>·k·k + C<sub>out</sub></td><td>filters out, channels in, kernel side</td></tr>
    <tr><td>Linear params</td><td>n<sub>in</sub>·n<sub>out</sub> + n<sub>out</sub></td><td>25·16 + 16 = 416</td></tr>
    <tr><td>Receptive field</td><td>r ← r + (k − 1)·j; j ← j·s</td><td>start r = 1, j = 1; k kernel, s stride, j jump</td></tr>
    <tr><td>Residual block</td><td>y = F(x) + x; ∂y/∂x = ∂F/∂x + 1</td><td>F the block's layers; 1×1 conv on the skip if shapes differ</td></tr>
    <tr><td>Compound scaling</td><td>depth α<sup>φ</sup>, width β<sup>φ</sup>, resolution γ<sup>φ</sup>; α·β²·γ² ≈ 2</td><td>φ = how much bigger; α 1.2, β 1.1, γ 1.15</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use a CNN</b><p>Images, video frames, spectrograms, any grid where nearby values belong together and patterns repeat anywhere.</p><small>Start from a pretrained backbone</small></div>
    <div><b>Avoid / reconsider</b><p>Tabular data (no spatial neighbours), very long-range relations across the whole image with lots of data (Vision Transformers), sequences of variable length (RNNs, attention).</p><small>Trees for tables</small></div>
    <div><b>Pooling vs stride-2 conv</b><p>Pooling is free and fixed; strided conv learns what to keep. GAP at the end either way.</p><small>Modern default: strided conv + GAP</small></div>
    <div><b>Little data</b><p>Freeze backbone, train head; unfreeze top stage at 10–100× lower LR; augment.</p><small>Same preprocessing as pretraining</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>(N, C, H, W) layout; forgetting C<sub>in</sub> in param counts; the floor in the size formula; zero padding inventing border edges; "invariant" vs "equivariant"; hard-coded Linear sizes; ResNet fixes optimisation not overfitting; projection shortcut when shapes change; high LR on pretrained layers.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Window [[8, 8, 2], [8, 8, 0], [8, 8, 1]] with the left-minus-right edge filter?</td><td>24 − 3 = 21</td></tr>
    <tr><td>Input 5, K = 3, P = 1, S = 2: output size?</td><td>⌊(5 − 3 + 2)/2⌋ + 1 = 3</td></tr>
    <tr><td>Params of Conv2d(3, 2, 3)?</td><td>2·3·3·3 + 2 = 56</td></tr>
    <tr><td>Receptive field of conv3 → conv3 → pool2 → conv3?</td><td>3, 5, 6, 10</td></tr>
    <tr><td>Why does y = F(x) + x help a 50-layer net?</td><td>∂y/∂x = ∂F/∂x + 1: the gradient keeps a path with factor 1 (1e-14 → 16 in our demo)</td></tr>
  </table>

  <h2 id="dc-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why CNNs instead of MLPs for images?</summary><div class="qa-body">(1) Parameters: an MLP's first layer on 224×224×3 with 1000 units has 150.5M weights; a 64-filter 3×3 conv has 1,792. (2) Locality: nearby pixels matter most, and convs only look at local patches. (3) Sharing gives translation equivariance: an edge detector fires anywhere without separate weights per position (our 1-pixel shift changed 10 of 25 MLP inputs but only moved the conv map's peak).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute by hand: input [[1,2,0],[0,1,3],[2,1,0]] with kernel [[1,0],[0,1]], no padding, stride 1.</summary><div class="qa-body">Output is 2×2 ((3 − 2) + 1 = 2). Each cell = top-left + bottom-right of the 2×2 window. (0,0): 1 + 1 = 2. (0,1): 2 + 3 = 5. (1,0): 0 + 1 = 1. (1,1): 1 + 0 = 1. Result [[2, 5], [1, 1]].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>On our road patch the edge map has 21 in one place and −21 in another. What do the signs mean?</summary><div class="qa-body">The filter is left column minus right column. +21: bright road on the left, dark hole on the right (the pothole's left rim). −21: dark on the left, bright on the right (the right rim). ReLU keeps only the +21 side, so a network learns a sign-flipped twin filter for the other rim.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters in Conv2d(64, 128, kernel_size=3)?</summary><div class="qa-body">128 · 64 · 3 · 3 + 128 = 73,728 + 128 = <strong>73,856</strong>. Each of 128 filters spans all 64 input channels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Input (16, 3, 64, 64) goes through Conv2d(3, 32, 3, stride=2, padding=0). Output shape?</summary><div class="qa-body">⌊(64 − 3 + 0) / 2⌋ + 1 = ⌊30.5⌋ + 1 = 31, so <strong>(16, 32, 31, 31)</strong>. Batch unchanged, channels = number of filters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a 1×1 convolution do?</summary><div class="qa-body">Mixes channels at each pixel without looking at neighbours: a per-pixel linear layer. Used to shrink or grow channel count cheaply (ResNet bottlenecks, Inception) and as the projection shortcut in ResNet.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Max pooling vs strided convolution for downsampling?</summary><div class="qa-body">Max pooling is fixed and parameter-free: it keeps the max and discards position and the other values. Strided conv learns what to keep. Modern nets mostly use strided convs, keeping global average pooling at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does global average pooling do to a (N, 512, 7, 7) tensor, and why use it?</summary><div class="qa-body">Averages each 7×7 map to one number → (N, 512, 1, 1), flattened to (N, 512). It has no parameters, works for any input size, and replaces a huge flatten + FC layer (512·49·1000 = 25M weights) with a small Linear(512, classes).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem do ResNet skip connections solve, and how?</summary><div class="qa-body">Degradation: plain nets got worse <em>training</em> error as depth grew (an optimisation problem, not overfitting). y = F(x) + x means a block can do identity by pushing F → 0, and ∂y/∂x = ∂F/∂x + 1 gives gradients a direct path. In our 50-layer demo the first layer's gradient was 1e-14 without skips and ~16 with them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is EfficientNet's key idea?</summary><div class="qa-body">Compound scaling: scale depth, width and resolution together (α<sup>φ</sup>, β<sup>φ</sup>, γ<sup>φ</sup> with α·β²·γ² ≈ 2, so FLOPs ≈ 2<sup>φ</sup>) instead of one dimension. Higher resolution needs more depth (receptive field) and width (finer features) to use it. B0 matches ResNet-50 accuracy with ~5× fewer params.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You have 500 labelled road photos. How do you build a pothole classifier?</summary><div class="qa-body">Do not train from scratch. Load an ImageNet-pretrained ResNet/EfficientNet, freeze the backbone, replace the head with Linear(512, 2), train the head at LR ~1e-3 with augmentation (flips, crops, brightness). If it plateaus, unfreeze the last stage at LR ~1e-5. Use the same resize and ImageNet normalisation, and stratified validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does pooling need convolution to come first, and what breaks if you pool raw pixels?</summary><div class="qa-body">Pooling summarises "how strongly was a pattern found in this window". On raw pixels there is no pattern yet, only brightness: max-pooling our patch would keep the bright asphalt (8) in every window and erase the dark hole entirely. Convolution first turns pixels into pattern scores (rim = 21), and then the max keeps the evidence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a deeper network need both the receptive field idea and skip connections?</summary><div class="qa-body">Depth is how the receptive field grows (3 → 5 → 6 → 10), so seeing large objects requires many layers. But each layer multiplies the backward gradient by a factor, so many layers make early-layer gradients vanish (1e-14). Skips keep a factor-1 path. Without skips you cannot train the depth the receptive field asks for.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does transfer learning work so well for CNNs specifically?</summary><div class="qa-body">Because of the feature hierarchy: early layers learn generic edges and textures (like our hand edge filters), useful for any images; only the last layers are task-specific. Sharing makes those filters position-independent, so they transfer across datasets. You retrain the small task-specific head (1,026 weights) instead of 11.2M.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What breaks if you skip padding in a 20-layer network of 3×3 convs on 32×32 images?</summary><div class="qa-body">Each valid conv removes 2 pixels: 32 − 2·20 &lt; 0, so the map disappears after 15 layers, and border pixels are used by fewer windows than central ones. "Same" padding (P = 1) keeps the size, and you downsample deliberately with stride or pooling.</div></details>

</main>`
});
