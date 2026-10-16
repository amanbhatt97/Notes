// dl/dl_rnns.js — RNNs & Sequential Models
Object.assign(TOPIC_CONTENT, {
  "dl_rnns": `<main>
  <h1>RNNs &amp; Sequential Models</h1>
  <p class="lead">An RNN reads data in order, one step at a time, and keeps a small memory of what it has seen. This page covers the basic RNN, why it forgets long-ago steps, how LSTM and GRU fix that, bidirectional RNNs, and the encoder-decoder model whose weakness led to attention. It builds on backprop and PyTorch. All code ran here (PyTorch 2.14 CPU, numpy).</p>

  <h2 id="dr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">RNNs &amp; Sequential</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why sequence models</div>
        <ul>
          <li><b>Sequences</b> — text, audio, time series: variable length, order matters</li>
          <li><b>MLP</b> — fixed input size, no order, no sharing across positions</li>
          <li><b>CNN</b> — local windows only; misses long-range context</li>
          <li><b>Need</b> — read step by step, carry a memory</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Vanilla RNN</div>
        <ul>
          <li><b>h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t−1</sub> + b)</b>; y<sub>t</sub> = W<sub>hy</sub>h<sub>t</sub></li>
          <li><b>h<sub>0</sub></b> = zeros; hidden state = running summary</li>
          <li><b>Weight sharing over time</b> — same W at every step (like CNN over space)</li>
          <li><b>Unroll</b> — T copies of the cell; train with <b>BPTT</b>, grads summed over steps</li>
          <li>💡 Reading a sentence and updating your understanding word by word</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Vanishing / exploding</div>
        <ul>
          <li><b>∂h<sub>T</sub>/∂h<sub>1</sub></b> = product of T Jacobians W<sub>hh</sub>ᵀ·diag(1−h²)</li>
          <li><b>Spectral radius &lt; 1</b> → shrinks exponentially (vanish)</li>
          <li><b>&gt; 1</b> → explodes → NaN; fix: <b>gradient clipping</b></li>
          <li>No clipping-style fix for vanishing → change the architecture</li>
          <li>Demo, 60 steps: RNN influence of step 1 = 3e-17</li>
          <li>💡 A message passed down 60 people in a train coach: lost by the end</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LSTM</div>
        <ul>
          <li><b>Cell state c<sub>t</sub></b> — conveyor belt, updated by + not matmul</li>
          <li><b>Forget</b> f = σ(·): keep how much of c<sub>t−1</sub></li>
          <li><b>Input</b> i = σ(·), <b>candidate</b> c̃ = tanh(·): write what</li>
          <li><b>c<sub>t</sub> = f⊙c<sub>t−1</sub> + i⊙c̃</b>; <b>h<sub>t</sub> = o⊙tanh(c<sub>t</sub>)</b></li>
          <li><b>∂c<sub>t</sub>/∂c<sub>t−1</sub> = f</b> → gradient survives when f ≈ 1</li>
          <li>⚠ Random-init LSTM still decays; <b>forget bias ≈ 1–3</b> keeps step 1 at 1e-1</li>
          <li>Params = 4·(h·(x+h) + 2h) in PyTorch; 4× a vanilla RNN</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GRU</div>
        <ul>
          <li><b>No cell state</b>; 2 gates: <b>update z</b>, <b>reset r</b></li>
          <li><b>h<sub>t</sub> = (1−z)⊙h<sub>t−1</sub> + z⊙h̃</b> — interpolate old vs new</li>
          <li>3 weight blocks vs LSTM's 4 → 25% fewer params, faster</li>
          <li><b>Choose</b> — GRU first on small data; LSTM for very long sequences</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bidirectional</div>
        <ul>
          <li><b>Two RNNs</b> — left→right and right→left; concat [h→, h←]</li>
          <li>Every position sees past and future context</li>
          <li><b>Use</b> — NER, POS tagging, classification, encoders</li>
          <li>⚠ Not for streaming or generation: the future isn't available</li>
          <li>Output size doubles: hidden 128 → 256</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Seq2seq &amp; bottleneck</div>
        <ul>
          <li><b>Encoder</b> reads input → final h = context vector</li>
          <li><b>Decoder</b> generates output from that one vector; teacher forcing in training</li>
          <li><b>Bottleneck</b> — whole input squeezed into one fixed vector</li>
          <li>Toy reverse task: accuracy 1.00 at length 5 → 0.53 at length 30</li>
          <li><b>Fix</b> → attention: decoder looks at <em>all</em> encoder states</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">RNN vs Transformer</div>
        <ul>
          <li><b>Transformers win</b> — parallel training, direct links between any 2 tokens</li>
          <li><b>RNNs still fit</b> — streaming with O(1) per step, edge devices, small time-series data</li>
          <li>Modern linear-time recurrent models (state-space models such as Mamba) revive the idea</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dr-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Sequence Models</span><span class="rm-sub">Order and variable length</span></div></div>
      <div class="rm-item rm-done" data-target="dr-rnn"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The RNN, Unrolled</span><span class="rm-sub">One cell, reused every step</span></div></div>
      <div class="rm-item rm-done" data-target="dr-vg"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Vanishing Gradients Through Time</span><span class="rm-sub">Why RNNs forget</span></div></div>
      <div class="rm-item rm-done" data-target="dr-lstm"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">LSTM Gates</span><span class="rm-sub">Forget, input, output</span></div></div>
      <div class="rm-item rm-done" data-target="dr-gru"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">GRU vs LSTM</span><span class="rm-sub">Two gates instead of three</span></div></div>
      <div class="rm-item rm-done" data-target="dr-bi"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Bidirectional RNNs</span><span class="rm-sub">Past and future context</span></div></div>
      <div class="rm-item rm-done" data-target="dr-s2s"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Seq2seq &amp; the Bottleneck</span><span class="rm-sub">Why attention was needed</span></div></div>
      <div class="rm-item rm-done" data-target="dr-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dr-why"><span class="num">01</span>Why Sequence Models</h2>
  <p>A sequence is data where order matters: words in a sentence, daily UPI spends, ball-by-ball cricket scores. Lengths differ, and early items change the meaning of later ones.</p>
  <table class="tbl">
    <tr><th>Model</th><th>Variable length?</th><th>Uses order?</th><th>Long-range context?</th></tr>
    <tr><td>MLP</td><td>No (fixed input)</td><td>No</td><td>No</td></tr>
    <tr><td>1-D CNN</td><td>Yes</td><td>Locally</td><td>Only within its window</td></tr>
    <tr><td>RNN</td><td>Yes</td><td>Yes</td><td>In theory; in practice limited (see 03)</td></tr>
  </table>
  <p>"The bank by the river" vs "the bank where I deposit money": the meaning of "bank" depends on words outside any small window. We need a model that reads in order and carries a memory.</p>

  <h2 id="dr-rnn"><span class="num">02</span>The RNN, Unrolled</h2>
  <p>An RNN is one small network used again and again, once per step. At each step it takes the new input and its old memory (the <strong>hidden state</strong> h), and makes a new memory.</p>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600">
<defs><marker id="dr-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="40" y="104" text-anchor="middle">h₀=0</text>
<g text-anchor="middle">
<rect x="90" y="80" width="80" height="40" rx="6" class="fb sb"/><text x="130" y="104">RNN</text>
<rect x="215" y="80" width="80" height="40" rx="6" class="fb sb"/><text x="255" y="104">RNN</text>
<rect x="340" y="80" width="80" height="40" rx="6" class="fb sb"/><text x="380" y="104">RNN</text>
<rect x="465" y="80" width="80" height="40" rx="6" class="fb sb"/><text x="505" y="104">RNN</text>
<text x="130" y="185">"The"</text><text x="255" y="185">"cat"</text><text x="380" y="185">"sat"</text><text x="505" y="185">"on"</text>
<text x="130" y="200" class="tm">x₁</text><text x="255" y="200" class="tm">x₂</text><text x="380" y="200" class="tm">x₃</text><text x="505" y="200" class="tm">x₄</text>
<text x="130" y="25">y₁</text><text x="255" y="25">y₂</text><text x="380" y="25">y₃</text><text x="505" y="25">y₄</text>
<text x="192" y="92" class="tb">h₁</text><text x="317" y="92" class="tb">h₂</text><text x="442" y="92" class="tb">h₃</text><text x="575" y="92" class="tb">h₄</text>
</g>
<g stroke="currentColor" marker-end="url(#dr-ar1)">
<line x1="62" y1="100" x2="88" y2="100"/><line x1="170" y1="100" x2="213" y2="100"/><line x1="295" y1="100" x2="338" y2="100"/><line x1="420" y1="100" x2="463" y2="100"/><line x1="545" y1="100" x2="585" y2="100"/>
<line x1="130" y1="168" x2="130" y2="122"/><line x1="255" y1="168" x2="255" y2="122"/><line x1="380" y1="168" x2="380" y2="122"/><line x1="505" y1="168" x2="505" y2="122"/>
<line x1="130" y1="78" x2="130" y2="34"/><line x1="255" y1="78" x2="255" y2="34"/><line x1="380" y1="78" x2="380" y2="34"/><line x1="505" y1="78" x2="505" y2="34"/>
</g>
</svg><figcaption>One cell copied across time: the same W<sub>xh</sub>, W<sub>hh</sub> at every step. The hidden state h carries memory forward.</figcaption></figure>
  <div class="callout def"><span class="label">Recurrence</span>
    <p><strong>h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t−1</sub> + b)</strong>, output y<sub>t</sub> = W<sub>hy</sub>h<sub>t</sub>. Training backpropagates through the unrolled graph: <strong>BPTT</strong> (backprop through time); each weight's gradient is summed over all steps.</p>
  </div>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
d_in, d_h = 3, 4
Wxh = rng.normal(0, 0.5, (d_h, d_in)); Whh = rng.normal(0, 0.5, (d_h, d_h)); b = np.zeros(d_h)
xs = rng.normal(size=(5, d_in))              # 5 time steps
h = np.zeros(d_h)                            # h0 = zeros
for t, x in enumerate(xs, 1):
    h = np.tanh(Wxh @ x + Whh @ h + b)       # same weights every step
    print(f"h{t} = {h.round(2)}")</div>
  <div class="fx" data-lang="text">h1 = [-0.35 -0.26  0.16  0.2 ]
h2 = [ 0.41  0.38 -0.52 -0.13]
h3 = [-0.35 -0.5   0.73  0.19]
h4 = [ 0.34  0.44 -0.64 -0.59]
h5 = [ 0.4  -0.68 -0.18  0.78]</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Reading word by word. After "The" you expect a noun; after "cat" you know the subject; each word updates your understanding instead of restarting it. h<sub>t</sub> is that running understanding.</p>
  </div>
  <div class="cards">
    <div><b>Many → one</b><p>Sentiment of a review: use the last h.</p><small>Classification</small></div>
    <div><b>Many → many (aligned)</b><p>A tag per word: use every h<sub>t</sub>.</p><small>NER, POS tagging</small></div>
    <div><b>Many → many (seq2seq)</b><p>Translate: encoder then decoder.</p><small>Section 07</small></div>
  </div>

  <h2 id="dr-vg"><span class="num">03</span>Vanishing Gradients Through Time</h2>
  <p>To learn, the error signal (gradient) must travel back from the last step to the first. In an RNN it gets multiplied by a small number at every step, so it fades to almost zero. Early steps then learn nothing.</p>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600">
<g stroke="currentColor" stroke-opacity="0.25"><line x1="60" y1="29" x2="560" y2="29"/><line x1="60" y1="67" x2="560" y2="67"/><line x1="60" y1="105" x2="560" y2="105"/><line x1="60" y1="143" x2="560" y2="143"/><line x1="60" y1="181" x2="560" y2="181"/></g>
<line x1="60" y1="190" x2="560" y2="190" stroke="currentColor"/>
<g class="tm" text-anchor="end"><text x="54" y="33">1</text><text x="54" y="71">1e-4</text><text x="54" y="109">1e-8</text><text x="54" y="147">1e-12</text><text x="54" y="185">1e-16</text></g>
<g class="tm" text-anchor="middle"><text x="60" y="206">t=1</text><text x="221" y="206">20</text><text x="391" y="206">40</text><text x="475" y="206">50</text><text x="560" y="206">60</text></g>
<text x="310" y="228" text-anchor="middle" class="tm">input step t (loss is computed at step 60)</text>
<polyline points="60,185 221,137 391,82 475,55 560,27" fill="none" class="sr" stroke-width="2.5"/>
<polyline points="60,143 221,105 391,71 475,53 560,33" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-width="2"/>
<polyline points="60,39 221,43 391,39 475,39 560,33" fill="none" class="sg" stroke-width="2.5"/>
<text x="120" y="176" class="tr">vanilla RNN</text>
<text x="90" y="95">LSTM, default init</text>
<text x="120" y="56" class="tg">LSTM, forget bias = 3</text>
</svg><figcaption>Size of |∂loss/∂x<sub>t</sub>| (log scale): how much step t can still influence a loss at step 60. Data from the run below.</figcaption></figure>
  <div class="fx" data-lang="py">import torch, torch.nn as nn
torch.manual_seed(0)
T, H = 60, 32
rnn, lstm, lstm_f = nn.RNN(8, H, batch_first=True), nn.LSTM(8, H, batch_first=True), nn.LSTM(8, H, batch_first=True)
with torch.no_grad():                       # gate order in PyTorch: input, forget, cell, output
    lstm_f.bias_ih_l0[H:2*H].fill_(3.0)     # forget gate starts near sigmoid(3) = 0.95
for name, cell in [("RNN", rnn), ("LSTM", lstm), ("LSTM f-bias=3", lstm_f)]:
    x = torch.randn(1, T, 8, requires_grad=True)
    out, _ = cell(x)
    out[0, -1].sum().backward()                    # loss depends on the LAST step only
    g = x.grad[0].norm(dim=1)                      # influence of each input step on it
    print(f"{name:13s} t=60 {g[-1]:.0e}  t=50 {g[-11]:.0e}  t=40 {g[-21]:.0e}  t=20 {g[-41]:.0e}  t=1 {g[0]:.0e}")</div>
  <div class="fx" data-lang="text">RNN           t=60 2e+00  t=50 2e-03  t=40 3e-06  t=20 4e-12  t=1 3e-17
LSTM          t=60 4e-01  t=50 3e-03  t=40 4e-05  t=20 9e-09  t=1 1e-12
LSTM f-bias=3 t=60 4e-01  t=50 1e-01  t=40 1e-01  t=20 4e-02  t=1 1e-01</div>
  <ul>
    <li><strong>Why:</strong> ∂h<sub>T</sub>/∂h<sub>1</sub> is a product of T−1 Jacobians W<sub>hh</sub>ᵀ·diag(1 − h<sub>t</sub>²). Each factor is usually &lt; 1, so the product shrinks exponentially.</li>
    <li><strong>Vanishing</strong> (spectral radius of W<sub>hh</sub> &lt; 1, plus tanh′ ≤ 1): early steps get no learning signal.</li>
    <li><strong>Exploding</strong> (&gt; 1): gradients blow up to NaN. Fix: <code>clip_grad_norm_(params, 1.0)</code>.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A message whispered from person to person down a train coach of 60 people. By the last person, the first person's words are gone. Here the "message" is the gradient that tells step 1 how to change.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Clipping fixes exploding, not vanishing. You can cap a huge number; you can't recover a signal that has shrunk to 1e-17. Vanishing needs a different architecture: gates (LSTM/GRU) or attention.</p>
  </div>

  <h2 id="dr-lstm"><span class="num">04</span>LSTM Gates</h2>
  <p>An LSTM is an RNN with a separate long-term memory line (the <strong>cell state</strong> c) and three <strong>gates</strong>. A gate is a number from 0 to 1 that decides how much passes through. Memory is changed by adding, not by repeated multiplying, so it lasts longer.</p>
  <figure class="viz"><svg viewBox="0 0 600 270" width="600">
<defs><marker id="dr-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="70" y="25" width="450" height="200" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="20" y1="50" x2="575" y2="50" class="sg" stroke-width="3" marker-end="url(#dr-ar2)"/>
<text x="20" y="40" class="tg">c(t−1)</text><text x="545" y="40" class="tg">c(t)</text>
<text x="300" y="40" text-anchor="middle" class="tm">cell state: the conveyor belt</text>
<circle cx="170" cy="50" r="12" class="fs" stroke="currentColor"/><text x="170" y="55" text-anchor="middle">×</text>
<circle cx="300" cy="50" r="12" class="fs" stroke="currentColor"/><text x="300" y="55" text-anchor="middle">+</text>
<circle cx="300" cy="110" r="12" class="fs" stroke="currentColor"/><text x="300" y="115" text-anchor="middle">×</text>
<rect x="440" y="95" width="50" height="26" rx="5" class="ft st"/><text x="465" y="113" text-anchor="middle">tanh</text>
<circle cx="465" cy="160" r="12" class="fs" stroke="currentColor"/><text x="465" y="165" text-anchor="middle">×</text>
<g text-anchor="middle">
<rect x="148" y="160" width="44" height="28" rx="5" class="fr sr"/><text x="170" y="179">σ</text>
<rect x="238" y="160" width="44" height="28" rx="5" class="fb sb"/><text x="260" y="179">σ</text>
<rect x="318" y="160" width="44" height="28" rx="5" class="ft st"/><text x="340" y="179">tanh</text>
<rect x="398" y="160" width="44" height="28" rx="5" class="fv" stroke="currentColor"/><text x="420" y="179">σ</text>
<text x="170" y="150" class="tr">f forget</text><text x="245" y="150" class="tb">i input</text><text x="336" y="150">c̃ new</text><text x="428" y="150">o output</text>
</g>
<g stroke="currentColor" fill="none">
<line x1="170" y1="160" x2="170" y2="64" marker-end="url(#dr-ar2)"/>
<path d="M260,160 V110 H286" marker-end="url(#dr-ar2)"/>
<path d="M340,160 V110 H314" marker-end="url(#dr-ar2)"/>
<line x1="300" y1="98" x2="300" y2="64" marker-end="url(#dr-ar2)"/>
<path d="M465,50 V93" marker-end="url(#dr-ar2)"/>
<line x1="465" y1="121" x2="465" y2="146" marker-end="url(#dr-ar2)"/>
<path d="M442,174 H453" marker-end="url(#dr-ar2)"/>
<path d="M477,160 H575" marker-end="url(#dr-ar2)"/>
<path d="M20,210 H420 V190"/>
<path d="M170,210 V190 M260,210 V190 M340,210 V190"/>
<line x1="120" y1="258" x2="120" y2="212" marker-end="url(#dr-ar2)"/>
</g>
<text x="20" y="204">h(t−1)</text><text x="128" y="256">x(t)</text><text x="545" y="152">h(t)</text>
</svg><figcaption>Gates (σ, 0 to 1) are valves on the green cell-state belt: f erases, i·c̃ writes, o chooses what to expose as h.</figcaption></figure>
  <table class="tbl">
    <tr><th>Piece</th><th>Equation (all use [h<sub>t−1</sub>, x<sub>t</sub>])</th><th>Plain words</th></tr>
    <tr><td>Forget gate</td><td>f = σ(W<sub>f</sub>[h, x] + b<sub>f</sub>)</td><td>How much old memory to keep (1 = all)</td></tr>
    <tr><td>Input gate</td><td>i = σ(W<sub>i</sub>[h, x] + b<sub>i</sub>)</td><td>How much new info to write</td></tr>
    <tr><td>Candidate</td><td>c̃ = tanh(W<sub>c</sub>[h, x] + b<sub>c</sub>)</td><td>What the new info is</td></tr>
    <tr><td>Cell update</td><td><strong>c<sub>t</sub> = f ⊙ c<sub>t−1</sub> + i ⊙ c̃</strong></td><td>Erase a little, add a little</td></tr>
    <tr><td>Output gate</td><td>o = σ(W<sub>o</sub>[h, x] + b<sub>o</sub>); <strong>h<sub>t</sub> = o ⊙ tanh(c<sub>t</sub>)</strong></td><td>What to reveal now</td></tr>
  </table>
  <div class="callout intu"><span class="label">Why it fixes vanishing</span>
    <p>∂c<sub>t</sub>/∂c<sub>t−1</sub> = f: an element-wise gate, not a matrix product with W<sub>hh</sub>. When the network needs to remember, it learns f ≈ 1, and the gradient flows back nearly unchanged (green line in section 03). Same idea as ResNet's "+x".</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper's register with three rules: which old entries to strike off (forget), which new entries to write (input), and which entries to read out to a customer now (output). A plain RNN rewrites the whole register every day.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>An LSTM isn't automatically long-memory: with default init (f ≈ 0.5) step 1's influence was still 1e-12. Initialise the forget bias to 1 (common) or higher so memory is "on" at the start.</p>
  </div>
  <div class="fx" data-lang="py">x = torch.randn(32, 50, 128)                     # (batch, seq_len, features)
n = lambda m: sum(p.numel() for p in m.parameters())
for name, m in [("RNN", nn.RNN(128, 256, batch_first=True)),
                ("GRU", nn.GRU(128, 256, batch_first=True)),
                ("LSTM", nn.LSTM(128, 256, batch_first=True))]:
    out, state = m(x)
    hn = state[0] if isinstance(state, tuple) else state     # LSTM returns (h_n, c_n)
    print(f"{name:4s} params {n(m):&gt;7,}  output {tuple(out.shape)}  h_n {tuple(hn.shape)}")</div>
  <div class="fx" data-lang="text">RNN  params  98,816  output (32, 50, 256)  h_n (1, 32, 256)
GRU  params 296,448  output (32, 50, 256)  h_n (1, 32, 256)
LSTM params 395,264  output (32, 50, 256)  h_n (1, 32, 256)</div>
  <p><code>output</code> = top layer's h at every step; <code>h_n</code> = last step of every layer (shape: layers × directions, batch, hidden). LSTM = 4 blocks of 256·(128+256) + 2·256 biases = 395,264.</p>

  <h2 id="dr-gru"><span class="num">05</span>GRU vs LSTM</h2>
  <p>A GRU is a lighter LSTM. It drops the separate cell state and uses two gates instead of three. It is faster and usually just as accurate.</p>
  <div class="callout def"><span class="label">GRU equations</span>
    <p>z = σ(W<sub>z</sub>[h, x]) update · r = σ(W<sub>r</sub>[h, x]) reset · h̃ = tanh(W[r ⊙ h<sub>t−1</sub>, x]) · <strong>h<sub>t</sub> = (1 − z) ⊙ h<sub>t−1</sub> + z ⊙ h̃</strong></p>
  </div>
  <table class="tbl">
    <tr><th></th><th>LSTM</th><th>GRU</th></tr>
    <tr><td>State</td><td>h and separate cell c</td><td>h only</td></tr>
    <tr><td>Gates</td><td>3 (forget, input, output)</td><td>2 (update, reset)</td></tr>
    <tr><td>Params (128 → 256)</td><td>395,264</td><td>296,448 (−25%)</td></tr>
    <tr><td>Speed</td><td>Slower</td><td>Faster</td></tr>
    <tr><td>Pick when</td><td>Very long sequences, need fine memory control</td><td>Smaller data, tight budget; try first</td></tr>
  </table>
  <p>The update gate z does both "forget" and "input" at once: keep (1 − z) of the old state, take z of the new. Reset r ≈ 0 lets the candidate ignore the past (a fresh topic). In benchmarks neither wins consistently.</p>

  <h2 id="dr-bi"><span class="num">06</span>Bidirectional RNNs</h2>
  <p>A bidirectional RNN runs two RNNs: one reads left to right, one reads right to left. Each word then knows what came before <em>and</em> after it.</p>
  <div class="flow"><span>Forward RNN reads x₁ → x<sub>T</sub></span><span>Backward RNN reads x<sub>T</sub> → x₁</span><span>Concat [h→<sub>t</sub>, h←<sub>t</sub>] at each step</span></div>
  <div class="fx" data-lang="py">bi = nn.LSTM(128, 128, num_layers=2, batch_first=True, bidirectional=True)
out, (hn, cn) = bi(x)
print("BiLSTM output", tuple(out.shape), " h_n", tuple(hn.shape))
last = torch.cat([hn[-2], hn[-1]], dim=1)        # final fwd + final bwd of top layer
print("classifier input", tuple(last.shape))</div>
  <div class="fx" data-lang="text">BiLSTM output (32, 50, 256)  h_n (4, 32, 128)
classifier input (32, 256)</div>
  <p>"Bank of England": "England" (to the right) tells you what "Bank" means. A bi-RNN sees it; a left-to-right RNN at "Bank" doesn't.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Bidirectional needs the whole sequence up front. Fine for tagging, classification and seq2seq encoders; impossible for streaming speech or text generation, where the future doesn't exist yet.</p>
  </div>

  <h2 id="dr-s2s"><span class="num">07</span>Seq2seq Encoder-Decoder &amp; Its Bottleneck</h2>
  <p>Seq2seq turns one sequence into another, like Hindi to English. One RNN (encoder) reads the input; another RNN (decoder) writes the output. The only link between them is one fixed-size vector.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
<defs><marker id="dr-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="135" y="25" text-anchor="middle">Encoder</text><text x="470" y="25" text-anchor="middle">Decoder</text>
<g text-anchor="middle">
<rect x="20" y="70" width="60" height="36" rx="5" class="fb sb"/><rect x="105" y="70" width="60" height="36" rx="5" class="fb sb"/><rect x="190" y="70" width="60" height="36" rx="5" class="fb sb"/>
<text x="50" y="150">je</text><text x="135" y="150">suis</text><text x="220" y="150">étudiant</text>
<rect x="282" y="66" width="40" height="44" rx="5" class="fr sr" stroke-width="2"/><text x="302" y="93">c</text>
<text x="302" y="135" class="tr">one fixed</text><text x="302" y="150" class="tr">vector</text>
<rect x="355" y="70" width="60" height="36" rx="5" class="ft st"/><rect x="440" y="70" width="60" height="36" rx="5" class="ft st"/><rect x="525" y="70" width="60" height="36" rx="5" class="ft st"/>
<text x="385" y="150" class="tm">&lt;s&gt;</text><text x="470" y="150" class="tm">I</text><text x="555" y="150" class="tm">am</text>
<text x="385" y="50">I</text><text x="470" y="50">am</text><text x="555" y="50">a student</text>
</g>
<g stroke="currentColor" marker-end="url(#dr-ar3)">
<line x1="80" y1="88" x2="103" y2="88"/><line x1="165" y1="88" x2="188" y2="88"/><line x1="250" y1="88" x2="280" y2="88"/><line x1="322" y1="88" x2="353" y2="88"/><line x1="415" y1="88" x2="438" y2="88"/><line x1="500" y1="88" x2="523" y2="88"/>
<line x1="50" y1="138" x2="50" y2="108"/><line x1="135" y1="138" x2="135" y2="108"/><line x1="220" y1="138" x2="220" y2="108"/>
<line x1="385" y1="138" x2="385" y2="108"/><line x1="470" y1="138" x2="470" y2="108"/><line x1="555" y1="138" x2="555" y2="108"/>
<line x1="385" y1="68" x2="385" y2="56"/><line x1="470" y1="68" x2="470" y2="56"/><line x1="555" y1="68" x2="555" y2="56"/>
</g>
<text x="300" y="180" text-anchor="middle" class="tm">decoder input = previous target word (teacher forcing in training)</text>
</svg><figcaption>The whole source sentence must squeeze through the single red vector c. Long inputs don't fit.</figcaption></figure>
  <ul>
    <li><strong>Encoder:</strong> RNN reads the source; its final hidden state is the context vector c.</li>
    <li><strong>Decoder:</strong> RNN starts from c and emits one token at a time, feeding back the previous token.</li>
    <li><strong>Teacher forcing:</strong> in training, feed the true previous token, not the model's guess (faster, stabler; causes train/test mismatch called exposure bias).</li>
  </ul>
  <p>Toy experiment: GRU encoder-decoder (hidden 64) learns to <em>reverse</em> random digit sequences, trained on lengths 4–30 (3,000 steps). Per-token accuracy on fresh sequences:</p>
  <table class="tbl out"><caption>Seq2seq without attention (real run; chance = 0.10)</caption>
    <tr><th>Length</th><th>5</th><th>10</th><th>20</th><th>30</th></tr>
    <tr><td>Accuracy</td><td>1.00</td><td>0.95</td><td>0.69</td><td>0.53</td></tr>
  </table>
  <p>Same model, same training lengths: short sequences fit in 64 numbers; long ones don't. That is the bottleneck. The fix — let the decoder look back at <em>every</em> encoder state — is <strong>attention</strong> (next note, which reruns this experiment with attention added).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Translating a paragraph after reading it once, from memory, without looking back. Fine for a short phrase; hopeless for a long paragraph. Attention lets the translator glance back at the source.</p>
  </div>

  <h2 id="dr-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Write the vanilla RNN update and explain weight sharing.</summary><div class="qa-body">h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t−1</sub> + b). The same W<sub>xh</sub>, W<sub>hh</sub> are used at every step, so the model handles any length with a fixed number of parameters, and gradients for each weight are summed over steps in BPTT.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does vanishing gradient hit RNNs harder than feedforward nets?</summary><div class="qa-body">A length-500 sequence unrolls into a 500-layer graph, and the <em>same</em> W<sub>hh</sub> is multiplied in at every step, so ∂h<sub>T</sub>/∂h<sub>1</sub> is a product of ~500 similar Jacobians: it shrinks (or grows) exponentially. Feedforward nets are shallower and have skips/BatchNorm; a vanilla RNN has neither.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Exploding vs vanishing: how do you fix each?</summary><div class="qa-body">Exploding: gradient clipping (clip the global norm, e.g. to 1.0) — easy. Vanishing: no clipping equivalent; use gated cells (LSTM/GRU), good init (forget bias, orthogonal W<sub>hh</sub>), shorter BPTT windows, or attention/Transformers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain LSTM's cell state and why it enables long memory.</summary><div class="qa-body">c<sub>t</sub> = f ⊙ c<sub>t−1</sub> + i ⊙ c̃ is an additive update. Its gradient ∂c<sub>t</sub>/∂c<sub>t−1</sub> = f is element-wise, learned per dimension. With f ≈ 1 the gradient passes nearly unchanged across hundreds of steps: a gradient highway, like ResNet's skip.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does each LSTM gate do? Why sigmoid for gates, tanh for the candidate?</summary><div class="qa-body">Forget: keep how much old memory. Input: how much new info to write. Output: how much of tanh(c) to expose as h. Sigmoid gives 0–1, a soft valve. tanh gives −1 to 1, so the candidate can add or subtract from memory and stays bounded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters in nn.LSTM(input_size=10, hidden_size=20)?</summary><div class="qa-body">4 gates × (20·10 + 20·20 + 20 + 20) = 4 × 640 = <strong>2,560</strong> (PyTorch keeps two bias vectors). A GRU would be 3 × 640 = 1,920.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>GRU or LSTM — which would you pick?</summary><div class="qa-body">Start with GRU: 25% fewer params, faster, usually as good on small/medium data. Try LSTM for very long sequences or if GRU underperforms. Empirically neither dominates; tune both if it matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When can't you use a bidirectional RNN?</summary><div class="qa-body">When future inputs aren't available at prediction time: streaming speech recognition, real-time forecasting, autoregressive text generation (the decoder side). It's fine for classification, tagging and encoders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the seq2seq bottleneck and what fixed it?</summary><div class="qa-body">The encoder compresses the whole input into one fixed-size vector, so long inputs lose information (our toy: 1.00 accuracy at length 5, 0.53 at length 30). Attention (Bahdanau 2014) lets the decoder build a fresh weighted mix of all encoder states at each step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is teacher forcing and its downside?</summary><div class="qa-body">In training, feed the ground-truth previous token to the decoder instead of its own prediction. Faster and stabler, but at inference the model sees its own (possibly wrong) outputs, a mismatch called exposure bias. Mitigation: scheduled sampling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you still use an RNN over a Transformer?</summary><div class="qa-body">Streaming/online prediction (O(1) work and memory per new step), very long streams where O(n²) attention is too costly, tiny edge devices, and small time-series datasets where the sequential inductive bias helps. Otherwise Transformers win: parallel training and direct links between any two positions.</div></details>
</main>`
});
