// dl/dl_rnns.js — RNNs & Sequential Models
Object.assign(TOPIC_CONTENT, {
  "dl_rnns": `<main>
  <h1>RNNs &amp; Sequential Models</h1>
  <div class="where"><span>Deep Learning</span><span>RNNs &amp; Sequential</span></div>
  <p class="lead">A recurrent neural network (RNN) reads data in order, one piece at a time, and keeps a small memory of what it has read so far. This note follows <strong>one running example</strong> all the way through: a three-word review on a food-delivery app, <strong>"chai not good"</strong>. On it we see why ordinary networks lose word order, push the review through an RNN cell by hand for three steps, train it with backpropagation through time, watch the gradient vanish, compute one LSTM step and one GRU step by hand, translate the review with an encoder–decoder and measure that design's bottleneck (which motivates attention), read it in both directions, and finally batch reviews of different lengths. All code ran here (NumPy, PyTorch 2.14 CPU, single thread).</p>

  <h2 id="dr-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 190" width="660">
<defs><marker id="dr-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="41" text-anchor="middle" font-size="12">Neurons · Backprop</text><text x="85" y="58" text-anchor="middle" class="tm" font-size="10">· Training</text>
<rect x="10" y="115" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="136" text-anchor="middle" font-size="12">CNNs</text><text x="85" y="153" text-anchor="middle" class="tm" font-size="10">sharing over space</text>
<rect x="245" y="65" width="160" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="325" y="88" text-anchor="middle" font-size="13" font-weight="700">RNNs</text><text x="325" y="107" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE · sharing over time</text>
<rect x="490" y="20" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="570" y="41" text-anchor="middle" font-size="12">Attention</text><text x="570" y="58" text-anchor="middle" class="tm" font-size="10">fixes the bottleneck</text>
<rect x="490" y="115" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="570" y="136" text-anchor="middle" font-size="12">Transformers</text><text x="570" y="153" text-anchor="middle" class="tm" font-size="10">attention only, no recurrence</text>
<line x1="160" y1="45" x2="243" y2="85" stroke="currentColor" marker-end="url(#dr-a0)"/><line x1="160" y1="140" x2="243" y2="103" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dr-a0)"/>
<line x1="405" y1="85" x2="488" y2="48" stroke="currentColor" marker-end="url(#dr-a0)"/><line x1="570" y1="70" x2="570" y2="113" stroke="currentColor" marker-end="url(#dr-a0)"/>
<text x="330" y="182" text-anchor="middle" class="tm" font-size="10.5">time series (hourly orders) and text (reviews) both enter here</text>
</svg><figcaption>RNNs bring the Deep Learning track from fixed-size grids to sequences of any length; their weakest point (the bottleneck) is the reason attention exists.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dl_neurons">Neurons &amp; MLPs</a>, <a class="xref" data-note="dl_backprop">Backpropagation</a>, <a class="xref" data-note="dl_training">Training</a>, <a class="xref" data-note="dl_cnns">CNNs</a></b><span>We can train networks on fixed-size inputs, and the CNN taught us to share one set of weights across positions in space. Left open: text, speech and time series (<a class="xref" data-note="ml_timeseries">Time Series Basics</a>) arrive in order and with any length, which neither an MLP nor a CNN handles naturally.</span></li>
    <li><b>This note adds: weight sharing over time</b><span>A hidden state carried from step to step (the RNN), how to train it (BPTT), why it forgets (vanishing gradients), the gated cells that remember (LSTM, GRU), and how to turn one sequence into another (seq2seq), in both directions, in batches.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dl_attention">Attention Mechanisms</a></b><span>Seq2seq squeezes the whole input into one fixed vector, and accuracy collapses on long inputs. Attention lets the decoder look back at every input step; dropping recurrence altogether gives <a class="xref" data-note="transformers">Transformers</a>. Word vectors like ours come from <a class="xref" data-note="nlp">NLP Foundations</a>.</span></li>
  </ol>

  <h2 id="dr-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers are from our review "chai not good".</p>
  <ol class="story">
    <li><b>Sequences</b><span>Q: why can't the networks we have read a review? → Order is meaning ("good, not bad" vs "bad, not good" have the same word counts) and length varies (3 words, then 300). We need a model that reads in order with weights that don't depend on length…</span></li>
    <li><b>The RNN cell</b><span>Q: how can one set of weights read any length, in order? → Carry a memory h, update it word by word: h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t−1</sub> + b). "chai not good" gives h₃ = [0.057, 0.938]; reversed words give a different h₃. But how do weights used at every step learn?</span></li>
    <li><b>Backprop through time</b><span>Q: how do shared weights get a gradient? → Unroll the loop and add up one gradient piece per step: 0.478 + 0.129 + 0 = 0.6065, exactly autograd's answer. But each step back multiplies the gradient by w·(1 − h²): 0.338, then 0.085…</span></li>
    <li><b>Vanishing &amp; exploding gradients</b><span>Q: what happens to that product over 60 words? → It vanishes (step 1's influence 3×10⁻¹⁷) or explodes (2.6×10¹¹, fixed by clipping). Vanishing has no clip; the memory itself must change…</span></li>
    <li><b>LSTM</b><span>Q: how can memory survive many steps? → A separate cell state edited by gates: c<sub>t</sub> = f·c<sub>t−1</sub> + i·c̃. On "chai": f = 0.769, i = 0.646, c̃ = 0.716 → c₁ = 0.462, h₁ = 0.227. Works, but 4 weight blocks and 2 states are heavy…</span></li>
    <li><b>GRU</b><span>Q: can we keep the gating with less machinery? → One state, two gates, h = (1 − z)·h + z·h̃: h₁ = 0.358; 25% fewer weights. Now we can read a review well, but how do we produce a whole new sequence, e.g. translate it?</span></li>
    <li><b>Seq2seq encoder–decoder</b><span>Q: how do we map "chai not good" to "chai achhi nahi hai" (different length, different word order)? → Encoder RNN → one context vector → decoder RNN writes word by word, trained with teacher forcing. But everything passes through that one vector…</span></li>
    <li><b>The bottleneck</b><span>Q: does one fixed vector hold a long input? → No: on a reversal task accuracy falls from 1.00 (5 tokens) to 0.54 (30 tokens). This is what attention fixes (next note). One more weakness first: the encoder reads only left to right…</span></li>
    <li><b>Bidirectional RNNs</b><span>Q: when the encoder reads "not", how can it know what is negated? → A second RNN reads right to left; concatenate: "chai" now carries [0.46, 0.38, −0.05, 0.74]. Only when the whole sequence is available. And real batches mix reviews of different lengths…</span></li>
    <li><b>Padding &amp; packing</b><span>Q: how do we batch 3-, 2- and 1-word reviews? → Pad to a rectangle, then pack so the RNN stops at each true length (padded h = [−0.119, …] wrong; packed = alone = [−0.25, 0.033, −0.179]).</span></li>
  </ol>

  <h2 id="dr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">RNNs &amp; Sequential</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why sequence models</div>
        <ul>
          <li><b>Sequence</b> — text, audio, reviews, hourly orders, sensor data: order matters, length varies</li>
          <li><b>MLP</b> — fixed input size; bag-of-words makes "good, not bad" = "bad, not good"</li>
          <li><b>CNN</b> — sees only a local window</li>
          <li><b>Need</b> — read step by step and carry a memory</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Vanilla RNN</div>
        <ul>
          <li><b>h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t−1</sub> + b)</b>; y<sub>t</sub> = W<sub>hy</sub>h<sub>t</sub></li>
          <li><b>h<sub>0</sub></b> = zeros; hidden state = running summary</li>
          <li><b>Weight sharing</b> — same W at every step → any length, fixed params</li>
          <li>"chai not good": h₁=[.46,.38] → h₂=[−.24,.76] → h₃=[.06,.94]</li>
          <li><b>Shapes</b> — many→one (last h), many→many (every h), seq2seq</li>
          <li>💡 A scorer updating one scoreboard ball by ball</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">BPTT</div>
        <ul>
          <li><b>Unroll</b> into T copies, backprop like a T-layer net</li>
          <li><b>Grad of W</b> = sum of one contribution per step</li>
          <li>∂h<sub>t</sub>/∂h<sub>t−1</sub> = W<sub>hh</sub>ᵀ·diag(1−h<sub>t</sub>²) (scalar: w·(1−h²))</li>
          <li><b>Truncated BPTT</b> — backprop only k steps; <code>h.detach()</code> between chunks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Vanishing / exploding</div>
        <ul>
          <li>Gradient = product of T factors: 0.5⁶⁰ ≈ 1e-18, 1.5⁶⁰ ≈ 4e10</li>
          <li><b>Vanish</b> (factors &lt; 1) → early steps learn nothing</li>
          <li><b>Explode</b> (&gt; 1) → NaN; fix: <b>clip_grad_norm_</b></li>
          <li>Clipping can't fix vanishing → change the architecture</li>
          <li>Demo, 60 steps: RNN influence of step 1 = 3e-17</li>
          <li>💡 A whisper passed down a 60-person train coach</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LSTM</div>
        <ul>
          <li><b>Cell state c<sub>t</sub></b> — conveyor belt, updated by + not matmul</li>
          <li><b>Forget</b> f = σ(·), <b>input</b> i = σ(·), <b>candidate</b> c̃ = tanh(·), <b>output</b> o = σ(·)</li>
          <li><b>c<sub>t</sub> = f⊙c<sub>t−1</sub> + i⊙c̃</b>; <b>h<sub>t</sub> = o⊙tanh(c<sub>t</sub>)</b></li>
          <li><b>∂c<sub>t</sub>/∂c<sub>t−1</sub> = f</b> → gradient survives when f ≈ 1 (0.99⁵⁰ = 0.61)</li>
          <li>⚠ Default init still decays; <b>forget bias 1–3</b> keeps step 1 at 1e-1</li>
          <li>PyTorch gate order: i, f, g, o · params 4·(h(x+h)+2h)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GRU</div>
        <ul>
          <li><b>No cell state</b>; 2 gates: <b>update z</b>, <b>reset r</b></li>
          <li><b>h<sub>t</sub> = (1−z)⊙h<sub>t−1</sub> + z⊙h̃</b> — blend old and new</li>
          <li>3 blocks vs LSTM's 4 → 25% fewer params, faster</li>
          <li>⚠ PyTorch writes it with z and 1−z swapped</li>
          <li><b>Choose</b> — GRU first; LSTM for very long sequences</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bidirectional</div>
        <ul>
          <li><b>Two RNNs</b> — left→right and right→left; concat [h→, h←]</li>
          <li>Every position sees past and future</li>
          <li><b>Use</b> — NER, tagging, classification, encoders</li>
          <li>⚠ Not for streaming or generation · output size doubles</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Seq2seq &amp; bottleneck</div>
        <ul>
          <li><b>Encoder</b> → final h = context vector → <b>Decoder</b> writes output</li>
          <li><b>Teacher forcing</b> — feed the true previous token in training</li>
          <li><b>Bottleneck</b> — whole input squeezed into one vector</li>
          <li>Toy reverse task: 1.00 at length 5 → 0.54 at length 30</li>
          <li><b>Fix</b> → attention: look at <em>all</em> encoder states</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Practice &amp; today</div>
        <ul>
          <li><b>Shapes</b> — (batch, seq, feat) with <code>batch_first=True</code></li>
          <li><b>Padding</b> — pack_padded_sequence, else h_n reads the pads</li>
          <li><b>Transformers win</b> — parallel training, direct token links</li>
          <li><b>RNNs fit</b> — streaming O(1)/step, edge devices, small time series; state-space models (Mamba) revive the idea</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dr-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="dr-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Sequence Models</span><span class="rm-sub">Order and variable length</span></div></div>
      <div class="rm-item rm-done" data-target="dr-rnn"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The RNN, Step by Hand</span><span class="rm-sub">"chai not good" through one cell</span></div></div>
      <div class="rm-item rm-done" data-target="dr-bptt"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Backprop Through Time</span><span class="rm-sub">How the shared weights learn</span></div></div>
      <div class="rm-item rm-done" data-target="dr-vg"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Vanishing &amp; Exploding</span><span class="rm-sub">Why RNNs forget, in numbers</span></div></div>
      <div class="rm-item rm-done" data-target="dr-lstm"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">LSTM Gates</span><span class="rm-sub">Forget, input, output, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dr-gru"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">GRU vs LSTM</span><span class="rm-sub">Two gates instead of three</span></div></div>
      <div class="rm-item rm-done" data-target="dr-s2s"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Seq2seq &amp; the Bottleneck</span><span class="rm-sub">Why attention was needed</span></div></div>
      <div class="rm-item rm-done" data-target="dr-bi"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Bidirectional RNNs</span><span class="rm-sub">Past and future context</span></div></div>
      <div class="rm-item rm-done" data-target="dr-practice"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Padding &amp; RNNs Today</span><span class="rm-sub">Batches, packing, vs Transformers</span></div></div>
      <div class="rm-item rm-done" data-target="dr-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One memory, many fixes</span></div></div>
      <div class="rm-item rm-done" data-target="dr-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Shapes, pads, clipping, gate order</span></div></div>
      <div class="rm-item rm-done" data-target="dr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="dr-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dr-why"><span class="num">01</span>Why Sequence Models</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An MLP takes a fixed list of numbers; a CNN takes a fixed-size grid. A customer review is neither: it is words in a particular order, and the next review may be ten times longer. What goes wrong if we force a review into the networks we already have?</p>
  </div>
  <h3>The running example</h3>
  <p>A food-delivery app collects short reviews and wants to flag unhappy customers. Our review is three words: <strong>"chai not good"</strong>. The model must notice that "not" flips "good". Two facts about such data shape this whole note. First, <strong>order matters</strong>: "good, not bad" and "bad, not good" use exactly the same words and mean opposite things. Second, <strong>length varies</strong>: the next review is "chai was cold and the delivery took one hour", and the one after that is a paragraph. (The same is true of the app's hourly order counts, a time series: the order of the hours is the information, and the history keeps growing.)</p>
  <p>A normal neural network (an MLP) wants a fixed number of input numbers, always in the same slots. The common trick for text is a <strong>bag of words</strong>: count how many times each word appears. That gives a fixed-size vector, but it throws the order away. Watch:</p>
<div class="fx" data-lang="py">import numpy as np
vocab = ["good", "not", "bad"]
def bag(review):
    words = review.replace(",", "").split()
    return np.array([words.count(w) for w in vocab])   # one count per vocab word
print(bag("good, not bad"), bag("bad, not good"))
print("same input to an MLP?", np.array_equal(bag("good, not bad"), bag("bad, not good")))</div>
  <div class="fx" data-lang="text">[1 1 1] [1 1 1]
same input to an MLP? True</div>
  <p>The function <code>bag</code> turns each review into three counts. Both reviews give <code>[1 1 1]</code>, so any model that only sees these counts must give the same answer to a happy customer and an unhappy one. The order was the meaning, and it is gone.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Listening to cricket commentary on the radio. You never hear the whole match at once. Each ball updates the picture in your head: score, wickets, who is on strike. "Four!" means something very different at 20 for 5 than at 180 for 1. You understand the ball only because you carried the memory of the balls before it.</p>
  </div>
  <p>So we want a model that reads one item at a time, in order, and carries a memory forward. That is exactly what a recurrent network does. Compare the options:</p>
  <table class="tbl">
    <tr><th>Model</th><th>Variable length?</th><th>Uses order?</th><th>Long-range context?</th></tr>
    <tr><td>MLP on bag of words</td><td>Yes, but by losing order</td><td>No</td><td>No</td></tr>
    <tr><td>MLP on a fixed window</td><td>No (fixed slots)</td><td>Yes, inside the window</td><td>No</td></tr>
    <tr><td>1-D CNN</td><td>Yes</td><td>Locally</td><td>Only within its window</td></tr>
    <tr><td>RNN</td><td>Yes</td><td>Yes</td><td>In theory; in practice limited (see 04)</td></tr>
  </table>
  <p>"The bank by the river" vs "the bank where I deposit money": the meaning of "bank" depends on a word that may be far away. In a long review, "the chai, which my friend had praised so much last week, was not good" puts "not" eight words away from "chai". A window of 2 words cannot see it. A memory that runs along the whole sentence can.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>sequence</strong> is an ordered list x<sub>1</sub>, x<sub>2</sub>, …, x<sub>T</sub>. Each position is a <strong>time step</strong> (even for words, which are not about clock time). T is the sequence length. A <strong>sequence model</strong> is any model that reads the items in order and lets earlier items affect how later ones are understood.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Just make the MLP input bigger" does not solve it. A 500-slot MLP has separate weights for "word in slot 3" and "word in slot 300", so a pattern learned at the start of a sentence does not transfer to the end, and a 501-word review does not fit at all.</p>
  </div>
  <p>Where this matters: sentiment and intent detection, speech recognition, next-word keyboards, fraud detection on a stream of card swipes, demand forecasting (hourly orders), sensor monitoring. Interviews ask "why not an MLP for text?" to check you know about order and variable length.</p>
  <div class="bridge"><b>What this still can't tell us → next: The RNN cell.</b> We know what we need (read in order, carry a memory, same weights at every step), but not the actual formula, or what "memory" looks like as numbers.</div>

  <h2 id="dr-rnn"><span class="num">02</span>The RNN, Step by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How can one fixed set of weights read "chai not good" (3 words) and a 300-word review alike, and end up with a summary that depends on the order of the words?</p>
  </div>
  <p>The need: one model that can read 3 words or 300 words with the same set of weights. The idea in plain words: keep a small vector called the <strong>hidden state</strong> h, the model's memory. Start with h = all zeros. For each new word, mix the word with the old memory, squash the result, and that becomes the new memory. Then move to the next word. The same small formula, with the same weights, is applied at every step.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The scorer at a gully cricket match has one small scoreboard, not a notebook of every ball. After each ball she looks at the old scoreboard and the new ball, and writes the new scoreboard. She uses the same rules for ball 1 and ball 100. The scoreboard is h; the rules are the weights.</p>
  </div>
  <p>The formula: <strong>h<sub>t</sub> = tanh(W<sub>xh</sub>·x<sub>t</sub> + W<sub>hh</sub>·h<sub>t−1</sub> + b)</strong>. W<sub>xh</sub> says how the new input feeds the memory. W<sub>hh</sub> says how the old memory feeds the new memory. <strong>tanh</strong> squashes every number into −1…1, so the memory can't grow without limit.</p>
  <h3>Worked example: "chai not good"</h3>
  <p>To keep it small, each word is a vector of 2 numbers (in a real model these come from an embedding layer and have 100+ numbers), and the hidden state also has 2 numbers. We pick the weights by hand:</p>
  <table class="tbl">
    <tr><th>Piece</th><th>Value</th></tr>
    <tr><td>Word vectors</td><td>chai = [1, 0], not = [0, 1], good = [1, 1]</td></tr>
    <tr><td>W<sub>xh</sub> (input → hidden)</td><td>[[0.5, −0.5], [0.3, 0.8]]</td></tr>
    <tr><td>W<sub>hh</sub> (hidden → hidden)</td><td>[[0.4, 0.2], [−0.3, 0.6]]</td></tr>
    <tr><td>b</td><td>[0, 0.1] · h<sub>0</sub> = [0, 0]</td></tr>
  </table>
  <table class="tbl out"><caption>Trace: one row per word (a = W<sub>xh</sub>x + W<sub>hh</sub>h<sub>t−1</sub> + b, then h = tanh(a))</caption>
    <tr><th>t</th><th>word x</th><th>W<sub>xh</sub>·x</th><th>W<sub>hh</sub>·h<sub>t−1</sub></th><th>a</th><th>h<sub>t</sub> = tanh(a)</th></tr>
    <tr><td>1</td><td>chai [1, 0]</td><td>[0.5, 0.3]</td><td>[0, 0] (empty memory)</td><td>[0.5, 0.4]</td><td>[0.462, 0.380]</td></tr>
    <tr><td>2</td><td>not [0, 1]</td><td>[−0.5, 0.8]</td><td>[0.4·0.462 + 0.2·0.380, −0.3·0.462 + 0.6·0.380] = [0.261, 0.089]</td><td>[−0.239, 0.989]</td><td>[−0.235, 0.757]</td></tr>
    <tr><td>3</td><td>good [1, 1]</td><td>[0, 1.1]</td><td>[0.058, 0.525]</td><td>[0.058, 1.725]</td><td>[0.057, 0.938]</td></tr>
  </table>
  <p>Read row 2 slowly. The new memory depends on "not" (first column) <em>and</em> on what was remembered about "chai" (second column). By step 3, h<sub>3</sub> carries a trace of all three words: [0.057, 0.938] is the RNN's whole summary of the review. A classifier on top of it would decide "unhappy customer or not".</p>
  <figure class="viz"><svg viewBox="0 0 600 225" width="600">
<defs><marker id="dr-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<g text-anchor="middle">
<text x="45" y="112">h₀=[0,0]</text>
<rect x="110" y="85" width="100" height="44" rx="6" class="fb sb"/><text x="160" y="112">RNN cell</text>
<rect x="270" y="85" width="100" height="44" rx="6" class="fb sb"/><text x="320" y="112">RNN cell</text>
<rect x="430" y="85" width="100" height="44" rx="6" class="fb sb"/><text x="480" y="112">RNN cell</text>
<text x="160" y="190">"chai" [1, 0]</text><text x="320" y="190">"not" [0, 1]</text><text x="480" y="190">"good" [1, 1]</text>
<text x="160" y="210" class="tm">x₁</text><text x="320" y="210" class="tm">x₂</text><text x="480" y="210" class="tm">x₃</text>
<text x="160" y="35" class="tb">h₁ = [0.46, 0.38]</text><text x="320" y="35" class="tb">h₂ = [−0.24, 0.76]</text><text x="480" y="35" class="tb">h₃ = [0.06, 0.94]</text>
<text x="575" y="112" class="tm">h₃</text>
</g>
<g stroke="currentColor" marker-end="url(#dr-ar1)">
<line x1="80" y1="107" x2="108" y2="107"/><line x1="210" y1="107" x2="268" y2="107"/><line x1="370" y1="107" x2="428" y2="107"/><line x1="530" y1="107" x2="562" y2="107"/>
<line x1="160" y1="175" x2="160" y2="131"/><line x1="320" y1="175" x2="320" y2="131"/><line x1="480" y1="175" x2="480" y2="131"/>
<line x1="160" y1="83" x2="160" y2="44"/><line x1="320" y1="83" x2="320" y2="44"/><line x1="480" y1="83" x2="480" y2="44"/>
</g>
</svg><figcaption>The same cell (same W<sub>xh</sub>, W<sub>hh</sub>, b) drawn three times: this is "unrolling" the RNN over time. The hidden state carries memory left to right. Numbers from the trace above.</figcaption></figure>
  <p>Now the same thing in numpy. The loop below does exactly the table: for each word, compute the input part, the memory part, add them, apply tanh.</p>
  <div class="fx" data-lang="py">import numpy as np
emb = {"chai":    np.array([1.0, 0.0]),     # toy 2-number word vectors
       "not": np.array([0.0, 1.0]),
       "good": np.array([1.0, 1.0])}
Wxh = np.array([[0.5, -0.5],             # input  -&gt; hidden  (2x2)
                [0.3,  0.8]])
Whh = np.array([[0.4,  0.2],             # hidden -&gt; hidden  (2x2)
                [-0.3, 0.6]])
b   = np.array([0.0, 0.1])

h = np.zeros(2)                          # h0: empty memory
for t, word in enumerate(["chai", "not", "good"], start=1):
    x = emb[word]
    from_input  = Wxh @ x
    from_memory = Whh @ h
    a = from_input + from_memory + b     # pre-activation
    h = np.tanh(a)                       # new memory
    print(f"t={t} {word:5s} Wxh@x={from_input.round(3)}  Whh@h={from_memory.round(3)}  a={a.round(3)}  h={h.round(3)}")</div>
  <div class="fx" data-lang="text">t=1 chai  Wxh@x=[0.5 0.3]  Whh@h=[0. 0.]  a=[0.5 0.4]  h=[0.462 0.38 ]
t=2 not   Wxh@x=[-0.5  0.8]  Whh@h=[0.261 0.089]  a=[-0.239  0.989]  h=[-0.235  0.757]
t=3 good  Wxh@x=[0.  1.1]  Whh@h=[0.058 0.525]  a=[0.058 1.725]  h=[0.057 0.938]</div>
  <p>The output matches the hand trace digit for digit. The key line is <code>h = np.tanh(a)</code>: the variable <code>h</code> is overwritten every step, and the next step reads it through <code>Whh @ h</code>. That reuse of <code>h</code> is the "recurrent" in RNN. Notice also that <code>Wxh</code> and <code>Whh</code> never change inside the loop: that is <strong>weight sharing over time</strong>.</p>
  <p>Does order now matter? Feed the same three words in another order. A bag of words could not tell the difference; the RNN can:</p>
<div class="fx" data-lang="py">def summary(words):
    h = np.zeros(2)
    for w in words:
        h = np.tanh(Wxh @ emb[w] + Whh @ h + b)
    return h
print("chai not good -&gt;", summary(["chai", "not", "good"]).round(3))
print("good not chai -&gt;", summary(["good", "not", "chai"]).round(3))
print("not good chai -&gt;", summary(["not", "good", "chai"]).round(3))</div>
  <div class="fx" data-lang="text">chai not good -&gt; [0.057 0.938]
good not chai -&gt; [0.499 0.773]
not good chai -&gt; [0.586 0.752]</div>
  <p>Three orders, three different final memories, from the same three word vectors and the same weights. The function <code>summary</code> is the whole RNN: a loop that overwrites <code>h</code>. It would run unchanged on a 300-word review.</p>
  <p>PyTorch's <code>nn.RNN</code> runs this same loop in fast C++ code. Copy our weights into it and it must give the same numbers:</p>
  <div class="fx" data-lang="py">import torch, torch.nn as nn
rnn = nn.RNN(input_size=2, hidden_size=2, batch_first=True)
with torch.no_grad():                         # copy our hand-made weights in
    rnn.weight_ih_l0.copy_(torch.tensor(Wxh))
    rnn.weight_hh_l0.copy_(torch.tensor(Whh))
    rnn.bias_ih_l0.copy_(torch.tensor(b))
    rnn.bias_hh_l0.zero_()                    # PyTorch has two biases; we use one

x = torch.tensor([[[1.0, 0.0],                # chai
                   [0.0, 1.0],                # not
                   [1.0, 1.0]]])              # good   shape (batch=1, seq=3, features=2)
out, h_n = rnn(x)
print("out shape", tuple(out.shape), " h_n shape", tuple(h_n.shape))
print(out[0].detach().numpy().round(3))
print("last step == h_n:", torch.allclose(out[:, -1], h_n[0]))</div>
  <div class="fx" data-lang="text">out shape (1, 3, 2)  h_n shape (1, 1, 2)
[[ 0.462  0.38 ]
 [-0.235  0.757]
 [ 0.057  0.938]]
last step == h_n: True</div>
  <p>Two return values, and beginners mix them up. <code>out</code> holds h at <em>every</em> step (shape: batch, steps, hidden), here our three rows. <code>h_n</code> holds only the <em>last</em> h (shape: layers, batch, hidden). <code>weight_ih_l0</code> is our W<sub>xh</sub> and <code>weight_hh_l0</code> is W<sub>hh</sub>; "l0" means layer 0.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Recurrence</strong>: h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t−1</sub> + b), with h<sub>0</sub> = 0. <strong>Hidden state</strong> h<sub>t</sub>: the running summary of x<sub>1</sub>…x<sub>t</sub>. <strong>Output</strong> (when needed): y<sub>t</sub> = W<sub>hy</sub>h<sub>t</sub>, a normal linear layer on top. <strong>Unrolling</strong>: drawing the loop as T copies of the cell that share weights.</p>
  </div>
  <p>What you do with the hidden states depends on the task:</p>
  <div class="cards">
    <div><b>Many → one</b><p>Sentiment of a review: put a linear layer on the last h only.</p><small>Classification</small></div>
    <div><b>Many → many (aligned)</b><p>A tag per word: a linear layer on every h<sub>t</sub>.</p><small>NER, POS tagging</small></div>
    <div><b>Many → many (seq2seq)</b><p>Translate: an encoder RNN, then a decoder RNN.</p><small>Section 07</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>nn.RNN</code>, <code>nn.LSTM</code> and <code>nn.GRU</code> expect (seq, batch, features) by default. If your tensor is (batch, seq, features), pass <code>batch_first=True</code>. Forgetting it gives no error when batch and seq sizes happen to be compatible: the model silently reads across the batch instead of along the sentence.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Backprop through time.</b> We picked W<sub>xh</sub> and W<sub>hh</sub> by hand. In a real model they must be learned, but each weight was used at step 1, step 2 and step 3. Which step does its gradient come from?</div>

  <h2 id="dr-bptt"><span class="num">03</span>Training: Backprop Through Time</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Backpropagation (<a class="xref" data-note="dl_backprop">Backpropagation</a>) gives every weight its own gradient, layer by layer. In an RNN the same W<sub>hh</sub> is reused at every step of "chai not good". How do we compute its gradient?</p>
  </div>
  <p>The need: we know how backprop trains a feed-forward network layer by layer. But in an RNN the same W<sub>hh</sub> is used at step 1, step 2 and step 3. Which step does its gradient come from? The answer is simple once the RNN is unrolled: the unrolled picture is just a deep network with T layers that happen to share weights. Run normal backprop on it. Every place a weight was used gives one piece of gradient, and the pieces are <strong>added up</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana shop's month-end cash is ₹500 short. The owner walks back through the daily register, day 30, day 29, …, asking "how much did this day's entry push the final total off?". The same cashier (the shared weight) worked every day, so his total blame is the sum of his blame on each day.</p>
  </div>
  <h3>Worked example with one number</h3>
  <p>To keep every number checkable, squeeze each word of our review into a single number (chai = 1, not = 0.5, good = −1; any three numbers would do) and the memory into a single number too.</p>
  <p>Shrink the RNN to one hidden number: h<sub>t</sub> = tanh(w·h<sub>t−1</sub> + u·x<sub>t</sub>), with w = 0.5, u = 1, inputs x = 1, 0.5, −1. Let the "loss" simply be h<sub>3</sub>. Forward pass: h<sub>1</sub> = tanh(1) = 0.762, h<sub>2</sub> = tanh(0.381 + 0.5) = 0.707, h<sub>3</sub> = tanh(0.354 − 1) = −0.569.</p>
  <p>Backward. The derivative of tanh is 1 − h², so one step back multiplies by <strong>w·(1 − h<sub>t</sub>²)</strong>:</p>
  <ol>
    <li>∂h<sub>3</sub>/∂h<sub>2</sub> = w·(1 − h<sub>3</sub>²) = 0.5 × (1 − 0.324) = <strong>0.338</strong></li>
    <li>∂h<sub>2</sub>/∂h<sub>1</sub> = w·(1 − h<sub>2</sub>²) = 0.5 × (1 − 0.5) = 0.25</li>
    <li>∂h<sub>3</sub>/∂h<sub>1</sub> = 0.338 × 0.25 = <strong>0.085</strong> (chain rule: multiply along the path)</li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
<defs><marker id="dr-ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
<marker id="dr-ar5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr" fill="currentColor"/></marker></defs>
<g text-anchor="middle">
<circle cx="75" cy="55" r="26" class="fb sb"/><text x="75" y="52">h₀</text><text x="75" y="67" class="tm">0</text>
<circle cx="225" cy="55" r="26" class="fb sb"/><text x="225" y="52">h₁</text><text x="225" y="67" class="tm">0.762</text>
<circle cx="375" cy="55" r="26" class="fb sb"/><text x="375" y="52">h₂</text><text x="375" y="67" class="tm">0.707</text>
<circle cx="525" cy="55" r="26" class="fr sr"/><text x="525" y="52">h₃</text><text x="525" y="67" class="tm">−0.569</text>
<text x="150" y="40" class="tm">forward</text>
<text x="450" y="128" class="tr">× 0.338</text><text x="300" y="128" class="tr">× 0.25</text>
<text x="300" y="160" class="tr">∂h₃/∂h₁ = 0.338 × 0.25 = 0.085: already small after 2 steps</text>
</g>
<g stroke="currentColor" marker-end="url(#dr-ar4)"><line x1="101" y1="55" x2="197" y2="55"/><line x1="251" y1="55" x2="347" y2="55"/><line x1="401" y1="55" x2="497" y2="55"/></g>
<g fill="none" class="sr" stroke-width="1.6" marker-end="url(#dr-ar5)"><path d="M520,82 Q450,120 382,84"/><path d="M370,82 Q300,120 232,84"/></g>
</svg><figcaption>Forward (black): memory flows right. Backward (red): the gradient flows left and is multiplied by w·(1 − h²) at every step.</figcaption></figure>
  <p>The code below does the backward pass by hand, then checks it with PyTorch's autograd (automatic differentiation). For ∂h<sub>3</sub>/∂w it walks back from step 3 to step 1, records how much w contributed at each step, and adds the pieces.</p>
  <div class="fx" data-lang="py">import numpy as np, torch
w, u = 0.5, 1.0
xs = [1.0, 0.5, -1.0]
hs = [0.0]                                  # forward, keeping every h (BPTT needs them)
for x in xs:
    hs.append(np.tanh(w * hs[-1] + u * x))
print("h:", np.round(hs, 3))

d = [1 - h**2 for h in hs]                  # tanh'(a_t) = 1 - h_t^2
dh3_dh2 = d[3] * w
dh3_dh1 = d[3] * w * d[2] * w
print(f"dh3/dh2 = {dh3_dh2:.3f}   dh3/dh1 = {dh3_dh1:.3f}")

contrib, carry = [], 1.0                    # carry = dh3/dh_t, walking backwards
for t in (3, 2, 1):
    carry_a = carry * d[t]                  # dh3/da_t
    contrib.append(carry_a * hs[t - 1])     # a_t uses w * h_{t-1}
    carry = carry_a * w                     # pass back to h_{t-1}
print("per-step parts (t=3,2,1):", np.round(contrib, 3), " sum =", round(sum(contrib), 4))

wt = torch.tensor(w, requires_grad=True)    # the same with autograd
h = torch.tensor(0.0)
for x in xs:
    h = torch.tanh(wt * h + u * x)
h.backward()
print("autograd dh3/dw =", round(wt.grad.item(), 4))</div>
  <div class="fx" data-lang="text">h: [ 0.     0.762  0.707 -0.569]
dh3/dh2 = 0.338   dh3/dh1 = 0.085
per-step parts (t=3,2,1): [0.478 0.129 0.   ]  sum = 0.6065
autograd dh3/dw = 0.6065</div>
  <p>Three things to see. The list <code>hs</code> keeps every hidden state, because the backward pass needs them: that is why RNN training memory grows with sequence length. The loop variable <code>carry</code> is multiplied by <code>w * (1 - h²)</code> at every step back, which is the shrinking you will meet in section 04. And the three <code>contrib</code> parts add up to exactly what autograd computes: the gradient of a shared weight is the sum over time steps. (The t = 1 part is 0 only because h<sub>0</sub> = 0.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>BPTT (backpropagation through time)</strong>: unroll the RNN over the sequence, run ordinary backprop on the unrolled graph, and sum each shared weight's gradient over all steps. <strong>Truncated BPTT</strong>: for very long streams, cut the sequence into chunks of k steps and backprop only inside a chunk, while still passing the hidden state forward.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With truncated BPTT you carry h from one chunk to the next. If you don't call <code>h = h.detach()</code> between chunks, PyTorch keeps the whole history in the graph, memory grows every batch, and the second <code>backward()</code> raises "Trying to backward through the graph a second time".</p>
  </div>
  <p>Interviews ask "how is an RNN trained?" The expected answer: unroll, backprop, gradients summed over time, plus truncated BPTT for long streams.</p>
  <div class="bridge"><b>What this still can't tell us → next: Vanishing &amp; exploding gradients.</b> Going back just two steps multiplied the signal by 0.338 and then 0.25, leaving 0.085. A real review has 60 words, not 3. What happens to a product of 59 such factors?</div>

  <h2 id="dr-vg"><span class="num">04</span>Vanishing &amp; Exploding Gradients</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In a 60-word review where the important word ("not") is at the start, can a loss computed at the end still teach the network anything about word 1?</p>
  </div>
  <p>In section 03, after only two steps back, the signal was already 0.085 of its size. That came from multiplying by a factor below 1 twice. Now imagine 60 steps. The gradient that tells step 1 "change like this" has to pass through 59 multiplications. If the factors are below 1, it shrinks towards zero (<strong>vanishing</strong>). If they are above 1, it blows up (<strong>exploding</strong>). Either way, early steps can't learn properly.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A message whispered from person to person down a 60-seat train coach: by the last seat, the first person's words are gone (vanishing). The opposite is a rumour that every person exaggerates a little: "a small fight" becomes "a riot" by seat 60 (exploding).</p>
  </div>
  <p>The plain arithmetic of repeated multiplication shows how fast this goes:</p>
  <div class="fx" data-lang="py">for factor in (0.5, 0.9, 1.0, 1.1, 1.5):
    print(f"factor {factor}:  after 10 steps {factor**10:9.3g}   after 60 steps {factor**60:9.3g}")</div>
  <div class="fx" data-lang="text">factor 0.5:  after 10 steps  0.000977   after 60 steps  8.67e-19
factor 0.9:  after 10 steps     0.349   after 60 steps    0.0018
factor 1.0:  after 10 steps         1   after 60 steps         1
factor 1.1:  after 10 steps      2.59   after 60 steps       304
factor 1.5:  after 10 steps      57.7   after 60 steps  3.68e+10</div>
  <p>Only a factor of exactly 1 survives. Even 0.9, which looks harmless, leaves 0.2% after 60 steps. In a real RNN the factor is a matrix, W<sub>hh</sub>ᵀ times the tanh slopes (1 − h²), and the tanh slope is at most 1, which pushes things further toward vanishing.</p>
  <p>Now a real measurement. We build a vanilla RNN and two LSTMs (section 05) over 60 steps, put a loss on the <em>last</em> output only, and ask: how big is the gradient with respect to each input step? A big number means "this step can still influence the loss and learn".</p>
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
</svg><figcaption>Size of |∂loss/∂x<sub>t</sub>| (log scale): how much step t can still influence a loss at step 60. Data from the run above.</figcaption></figure>
  <p>Read the RNN row from right to left: 2 at the last step, 0.002 ten steps back, and 3×10⁻¹⁷ at step 1. That is effectively zero: whatever happened at step 1 cannot be learned from a loss at step 60. The line <code>out[0, -1].sum().backward()</code> makes the loss depend only on the last step, and <code>x.grad[0].norm(dim=1)</code> measures each step's share. Keep the green line in mind; section 05 explains it.</p>
  <h3>Exploding: clip the gradient</h3>
  <p>Exploding is the easier half. If the gradient norm (its overall length) is huge, scale the whole gradient down to a maximum length before the optimizer step. Direction is kept; only the size is capped.</p>
  <div class="fx" data-lang="py">torch.manual_seed(1)
big = nn.RNN(8, H, batch_first=True)
with torch.no_grad():
    big.weight_hh_l0.mul_(8.0)                     # make W_hh far too large
x = torch.randn(4, T, 8)
out, _ = big(x)
(out ** 2).sum().backward()                        # any loss
before = nn.utils.clip_grad_norm_(big.parameters(), max_norm=1.0)
after = torch.sqrt(sum((p.grad ** 2).sum() for p in big.parameters()))
print(f"grad norm before clip {before:.2e}  after clip {after:.2f}")</div>
  <div class="fx" data-lang="text">grad norm before clip 2.59e+11  after clip 1.00</div>
  <p><code>clip_grad_norm_</code> returns the norm it found (2.6×10¹¹, which would wreck the weights in one step) and rescales the gradients in place so the new norm is 1.0. In a training loop it goes between <code>loss.backward()</code> and <code>optimizer.step()</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Vanishing gradient</strong>: ∂h<sub>T</sub>/∂h<sub>1</sub> = product of T−1 Jacobians W<sub>hh</sub>ᵀ·diag(1 − h<sub>t</sub>²) shrinks exponentially when their size (spectral radius, the biggest stretch factor of W<sub>hh</sub>) is below 1. <strong>Exploding gradient</strong>: the same product grows exponentially when it is above 1. <strong>Gradient clipping</strong>: rescale the gradient so its norm is at most a threshold.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Clipping fixes exploding, not vanishing. You can cap a huge number; you can't recover a signal that has shrunk to 10⁻¹⁷. Vanishing needs a different design: gates (LSTM/GRU) or attention.</p>
  </div>
  <p>Why it matters: this is the reason plain RNNs are rarely used, and "explain vanishing gradients in RNNs" is one of the most common deep-learning interview questions.</p>
  <p>The same problem appears in deep feed-forward networks (see <a class="xref" data-note="dl_training">Training</a> and the ResNet section of <a class="xref" data-note="dl_cnns">CNNs</a>); an RNN unrolled over 60 words simply <em>is</em> a 60-layer network that reuses one weight matrix, which makes it worse.</p>
  <div class="bridge"><b>What this still can't tell us → next: LSTM gates.</b> Clipping caps the explosions, but nothing can rescue a signal of 10⁻¹⁷. The memory must be redesigned so that information (and its gradient) can pass many steps without being squashed every time.</div>

  <h2 id="dr-lstm"><span class="num">05</span>LSTM Gates</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The plain RNN rewrites its whole memory through a matrix and a tanh at every word, so "not" at word 1 is forgotten by word 60. How can a cell keep something for many steps, and still decide when to forget it?</p>
  </div>
  <p>The need: the plain RNN rewrites its whole memory at every step through a matrix multiply and a tanh, so old information (and its gradient) fades. The LSTM (long short-term memory) idea in plain words: keep a <strong>second</strong> memory line, the <strong>cell state</strong> c, that is changed only by gentle edits: erase a little, add a little. Three <strong>gates</strong> decide the edits. A gate is just a number between 0 and 1 (a sigmoid output) that is multiplied in: 0 means "block", 1 means "let everything through".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper's credit register (khata). Each evening she decides three things: which old entries to strike off (forget gate), which new entries to write (input gate), and which entries to read out when a customer asks (output gate). Most entries are simply left alone from day to day. A plain RNN would copy the entire register onto a new page every evening, with small copying errors each time.</p>
  </div>
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
</svg><figcaption>Gates (σ, 0 to 1) are valves on the green cell-state belt: f erases, i·c̃ writes, o chooses what to expose as h. All four boxes read the same inputs: h(t−1) and x(t).</figcaption></figure>
  <table class="tbl">
    <tr><th>Piece</th><th>Equation (all read h<sub>t−1</sub> and x<sub>t</sub>)</th><th>Plain words</th></tr>
    <tr><td>Forget gate</td><td>f = σ(W<sub>f</sub>[h, x] + b<sub>f</sub>)</td><td>How much old memory to keep (1 = all)</td></tr>
    <tr><td>Input gate</td><td>i = σ(W<sub>i</sub>[h, x] + b<sub>i</sub>)</td><td>How much new info to write</td></tr>
    <tr><td>Candidate</td><td>c̃ = tanh(W<sub>c</sub>[h, x] + b<sub>c</sub>)</td><td>What the new info is (−1 to 1)</td></tr>
    <tr><td>Cell update</td><td><strong>c<sub>t</sub> = f ⊙ c<sub>t−1</sub> + i ⊙ c̃</strong></td><td>Erase a little, add a little</td></tr>
    <tr><td>Output gate</td><td>o = σ(W<sub>o</sub>[h, x] + b<sub>o</sub>); <strong>h<sub>t</sub> = o ⊙ tanh(c<sub>t</sub>)</strong></td><td>What to reveal now</td></tr>
  </table>
  <p>σ is the sigmoid, 1/(1 + e<sup>−z</sup>), which maps any number to 0…1. ⊙ means element-by-element multiply.</p>
  <h3>Worked example: one LSTM step by hand</h3>
  <p>Same sentence "chai not good", same word vectors, but now a single hidden number so every gate is one number. Each gate has a weight on h, two weights on x, and a bias. Forget gate: 0.5, [0.2, −0.4], bias 1. Input: 0.3, [0.6, 0.4], 0. Candidate: −0.2, [0.9, −0.7], 0. Output: 0.4, [0.1, 0.5], 0. Start h = 0, c = 0. Step 1, x = "chai" = [1, 0]:</p>
  <table class="tbl out"><caption>Step 1 traced</caption>
    <tr><th>Piece</th><th>Inside (w<sub>h</sub>·h + w<sub>x</sub>·x + b)</th><th>After squash</th></tr>
    <tr><td>f</td><td>0 + 0.2 + 1 = 1.2</td><td>σ(1.2) = 0.769</td></tr>
    <tr><td>i</td><td>0 + 0.6 + 0 = 0.6</td><td>σ(0.6) = 0.646</td></tr>
    <tr><td>c̃</td><td>0 + 0.9 + 0 = 0.9</td><td>tanh(0.9) = 0.716</td></tr>
    <tr><td>o</td><td>0 + 0.1 + 0 = 0.1</td><td>σ(0.1) = 0.525</td></tr>
    <tr><td>c<sub>1</sub></td><td colspan="2">f·c<sub>0</sub> + i·c̃ = 0.769·0 + 0.646·0.716 = <strong>0.462</strong></td></tr>
    <tr><td>h<sub>1</sub></td><td colspan="2">o·tanh(c<sub>1</sub>) = 0.525 · 0.432 = <strong>0.227</strong></td></tr>
  </table>
  <p>The code runs all three words with exactly these weights, then copies them into PyTorch's <code>nn.LSTM</code> to confirm:</p>
  <div class="fx" data-lang="py">import numpy as np
def sigmoid(z): return 1 / (1 + np.exp(-z))
emb = {"chai": np.array([1.0, 0.0]), "not": np.array([0.0, 1.0]), "good": np.array([1.0, 1.0])}
# each gate: weight on h_prev, weights on x (2 numbers), bias
W = {"f": (0.5,  np.array([0.2, -0.4]), 1.0),    # forget gate (bias 1 -&gt; starts "keep")
     "i": (0.3,  np.array([0.6,  0.4]), 0.0),    # input gate
     "g": (-0.2, np.array([0.9, -0.7]), 0.0),    # candidate c~
     "o": (0.4,  np.array([0.1,  0.5]), 0.0)}    # output gate
def pre(k, h, x):
    wh, wx, b = W[k]
    return wh * h + wx @ x + b

h, c = 0.0, 0.0
for t, word in enumerate(["chai", "not", "good"], 1):
    x = emb[word]
    f = sigmoid(pre("f", h, x)); i = sigmoid(pre("i", h, x))
    g = np.tanh(pre("g", h, x)); o = sigmoid(pre("o", h, x))
    c = f * c + i * g                  # erase a little, write a little
    h = o * np.tanh(c)                 # expose part of the memory
    print(f"t={t} {word:5s} f={f:.3f} i={i:.3f} c~={g:+.3f} o={o:.3f} -&gt; c={c:+.3f} h={h:+.3f}")

import torch, torch.nn as nn
lstm = nn.LSTM(2, 1, batch_first=True)
order = ["i", "f", "g", "o"]           # PyTorch's gate order
with torch.no_grad():
    lstm.weight_ih_l0.copy_(torch.tensor(np.stack([W[k][1] for k in order])))
    lstm.weight_hh_l0.copy_(torch.tensor([[W[k][0]] for k in order]))
    lstm.bias_ih_l0.copy_(torch.tensor([W[k][2] for k in order]))
    lstm.bias_hh_l0.zero_()
out, (h_n, c_n) = lstm(torch.tensor([[[1., 0.], [0., 1.], [1., 1.]]]))
print("PyTorch h:", out[0, :, 0].detach().numpy().round(3), " c_n:", round(c_n.item(), 3))</div>
  <div class="fx" data-lang="text">t=1 chai  f=0.769 i=0.646 c~=+0.716 o=0.525 -&gt; c=+0.462 h=+0.227
t=2 not   f=0.671 i=0.615 c~=-0.632 o=0.644 -&gt; c=-0.078 h=-0.050
t=3 good  f=0.685 i=0.728 c~=+0.207 o=0.641 -&gt; c=+0.097 h=+0.062
PyTorch h: [ 0.227 -0.05   0.062]  c_n: 0.097</div>
  <p>Row 1 is the hand trace. At step 2, "not" brings a negative candidate (−0.632); the forget gate keeps 67% of the old +0.462 and the input gate writes 61.5% of the new −0.632, giving c = −0.078. The two lines that matter are <code>c = f * c + i * g</code> and <code>h = o * np.tanh(c)</code>. PyTorch prints the same h, which proves its LSTM is this formula. Note the list <code>order</code>: PyTorch stacks the gates as input, forget, cell (g), output.</p>
  <h3>Why this fixes vanishing</h3>
  <p>Look at the cell update again: c<sub>t</sub> = f ⊙ c<sub>t−1</sub> + i ⊙ c̃. Going back one step, the gradient along the belt is multiplied by f, a plain number per dimension that the network learns, not by a matrix and a tanh slope. If the network learns f ≈ 1 for something worth remembering, the signal passes almost unchanged:</p>
  <div class="fx" data-lang="py">h_rnn, c_lstm = 1.0, 1.0
for step in range(50):
    h_rnn = np.tanh(0.9 * h_rnn)       # plain RNN: squash and multiply every step
    c_lstm = 0.99 * c_lstm + 0.0       # LSTM: forget gate 0.99, input gate 0
print(f"after 50 steps  RNN memory {h_rnn:.4f}   LSTM cell {c_lstm:.4f}")</div>
  <div class="fx" data-lang="text">after 50 steps  RNN memory 0.0026   LSTM cell 0.6050</div>
  <p>The same value stored for 50 steps: the RNN keeps 0.26% of it, the LSTM cell keeps 60%. This is also the green line in section 04: with the forget bias set to 3, f starts near σ(3) = 0.95, and step 1 keeps an influence of 0.1 instead of 10⁻¹².</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LSTM</strong> (Hochreiter &amp; Schmidhuber, 1997): an RNN cell with a cell state c updated additively, c<sub>t</sub> = f⊙c<sub>t−1</sub> + i⊙c̃, and output h<sub>t</sub> = o⊙tanh(c<sub>t</sub>). Since ∂c<sub>t</sub>/∂c<sub>t−1</sub> = f (element-wise), the cell state is a gradient highway, the same idea as the "+x" skip connection in ResNet.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>An LSTM is not automatically long-memory. With default init, f starts around 0.5, and in our run step 1's influence was still 10⁻¹². Initialise the forget-gate bias to 1 (common) or higher so memory is "on" at the start of training.</p>
  </div>
  <p>How big are these layers? The next code counts parameters and shows output shapes for a real-sized input: a batch of 32 sequences, 50 steps each, 128 features per step, hidden size 256.</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
x = torch.randn(32, 50, 128)                     # (batch, seq_len, features)
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
  <p>One RNN block is 256·128 (W<sub>xh</sub>) + 256·256 (W<sub>hh</sub>) + 2·256 (two biases) = 98,816. A GRU has 3 such blocks and an LSTM 4 (one per gate plus the candidate): 4 × 98,816 = 395,264. All three return <code>out</code> of shape (32, 50, 256), one h per step, and <code>h_n</code> of shape (layers × directions, batch, hidden). The <code>isinstance</code> line is needed because only the LSTM returns a pair (h_n, c_n).</p>
  <div class="bridge"><b>What this still can't tell us → next: GRU.</b> The LSTM remembers, but it carries two state vectors and four weight blocks (395,264 weights in our 128 → 256 layer). Can the same gating idea be done more cheaply?</div>

  <h2 id="dr-gru"><span class="num">06</span>GRU vs LSTM</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Is the LSTM's machinery (separate cell, three gates, four weight blocks) all necessary, or can a simpler gated cell remember "not" just as well?</p>
  </div>
  <p>The need: the LSTM works, but it carries two state vectors and four weight blocks, which is slow on long sequences and heavy for small datasets. The GRU (gated recurrent unit, 2014) asks: can we keep the "gentle edit" idea with less machinery? Its plain idea: one state h only, and one dial z that decides "how much of the old memory do I replace with the new candidate?". Keep (1 − z) of the old, take z of the new. A second dial r (reset) decides how much of the old memory the candidate may look at when it is built.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Updating your phone's contact for a friend who moved city. The update dial z says how much of the old entry to overwrite (z = 0: keep it all, z = 1: replace it all). The reset dial r says whether to even look at the old entry while writing the new one: for a brand-new topic you ignore it (r ≈ 0).</p>
  </div>
  <div class="callout def"><span class="label">GRU equations</span>
    <p>z = σ(W<sub>z</sub>[h<sub>t−1</sub>, x<sub>t</sub>]) update · r = σ(W<sub>r</sub>[h<sub>t−1</sub>, x<sub>t</sub>]) reset · h̃ = tanh(W[r ⊙ h<sub>t−1</sub>, x<sub>t</sub>]) candidate · <strong>h<sub>t</sub> = (1 − z) ⊙ h<sub>t−1</sub> + z ⊙ h̃</strong></p>
  </div>
  <p>Same sentence, one hidden number, hand-picked weights (z: 0.4, [0.5, 0.3], bias −0.5; r: −0.3, [0.2, 0.7], 0; candidate: 0.8, [0.9, −0.6], 0). Step 1 by hand with h<sub>0</sub> = 0 and x = [1, 0]: z = σ(0.5 − 0.5) = σ(0) = 0.5. r = σ(0.2) = 0.550. h̃ = tanh(0.8·(0.55·0) + 0.9) = tanh(0.9) = 0.716. Then h<sub>1</sub> = (1 − 0.5)·0 + 0.5·0.716 = <strong>0.358</strong>: half old (nothing), half new.</p>
  <div class="fx" data-lang="py">W = {"z": (0.4,  np.array([0.5,  0.3]), -0.5),   # update gate
     "r": (-0.3, np.array([0.2,  0.7]),  0.0),   # reset gate
     "n": (0.8,  np.array([0.9, -0.6]),  0.0)}   # candidate h~
h = 0.0
for t, word in enumerate(["chai", "not", "good"], 1):
    x = emb[word]
    z = sigmoid(W["z"][0] * h + W["z"][1] @ x + W["z"][2])
    r = sigmoid(W["r"][0] * h + W["r"][1] @ x + W["r"][2])
    h_new = np.tanh(W["n"][0] * (r * h) + W["n"][1] @ x + W["n"][2])   # reset scales the old h
    h = (1 - z) * h + z * h_new                                      # blend old and new
    print(f"t={t} {word:5s} z={z:.3f} r={r:.3f} h~={h_new:+.3f} -&gt; h={h:+.3f}")</div>
  <div class="fx" data-lang="text">t=1 chai  z=0.500 r=0.550 h~=+0.716 -&gt; h=+0.358
t=2 not   z=0.486 r=0.644 h~=-0.393 -&gt; h=-0.007
t=3 good  z=0.574 r=0.711 h~=+0.288 -&gt; h=+0.162</div>
  <p>Step 1 matches the hand calculation. At step 2 the candidate for "not" is −0.393 and z ≈ 0.49, so the new h is roughly the average of +0.358 and −0.393, which is about 0. The line <code>h = (1 - z) * h + z * h_new</code> is the whole GRU: a blend, so when z is near 0 the old memory passes through untouched, just like an LSTM forget gate near 1.</p>
  <table class="tbl">
    <tr><th></th><th>LSTM</th><th>GRU</th></tr>
    <tr><td>State</td><td>h and separate cell c</td><td>h only</td></tr>
    <tr><td>Gates</td><td>3 (forget, input, output)</td><td>2 (update, reset)</td></tr>
    <tr><td>Weight blocks</td><td>4</td><td>3</td></tr>
    <tr><td>Params (128 → 256)</td><td>395,264</td><td>296,448 (−25%)</td></tr>
    <tr><td>Speed</td><td>Slower</td><td>Faster</td></tr>
    <tr><td>Pick when</td><td>Very long sequences, need fine memory control</td><td>Smaller data, tight budget; try first</td></tr>
  </table>
  <p>In benchmarks neither wins consistently. A practical rule: start with a GRU because it trains faster, and try an LSTM if the task needs very long memory.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Papers and libraries write the GRU two ways. PyTorch's docs use h<sub>t</sub> = (1 − z)⊙n + z⊙h<sub>t−1</sub>, so its z means "keep old", the opposite of the formula above. PyTorch also applies r after the matrix multiply on h. The model is equally powerful either way; just don't copy weights between conventions without flipping.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Seq2seq.</b> With an RNN, LSTM or GRU we can read a review and classify it. But the app also wants to show reviews in Hindi: the output is a <em>new sequence</em>, of a different length and in a different word order. One label per review is not enough.</div>

  <h2 id="dr-s2s"><span class="num">07</span>Seq2seq Encoder-Decoder &amp; Its Bottleneck</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we turn "chai not good" (3 words) into "chai achhi nahi hai" (4 words, with the negation moved to the end)? A tag per input word cannot do it: the output has its own length and order.</p>
  </div>
  <p>The idea (sequence-to-sequence, 2014): use two RNNs. The <strong>encoder</strong> reads the whole input; its final hidden state is a single vector c, the "context vector". For our review, c is h₃: in the toy RNN of section 02, [0.057, 0.938]. The <strong>decoder</strong> starts from c and writes the output one token at a time, feeding each token it wrote back in as the next input, until it writes an end token.</p>
  <figure class="viz"><svg viewBox="0 0 620 200" width="620">
<defs><marker id="dr-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="105" y="22" text-anchor="middle">Encoder</text><text x="450" y="22" text-anchor="middle">Decoder</text>
<g text-anchor="middle">
<rect x="15" y="70" width="58" height="36" rx="5" class="fb sb"/><rect x="88" y="70" width="58" height="36" rx="5" class="fb sb"/><rect x="161" y="70" width="58" height="36" rx="5" class="fb sb"/>
<text x="44" y="150">chai</text><text x="117" y="150">not</text><text x="190" y="150">good</text>
<rect x="245" y="66" width="40" height="44" rx="5" class="fr sr" stroke-width="2"/><text x="265" y="93">c</text>
<text x="265" y="135" class="tr">one fixed</text><text x="265" y="150" class="tr">vector</text>
<rect x="310" y="70" width="65" height="36" rx="5" class="ft st"/><rect x="390" y="70" width="65" height="36" rx="5" class="ft st"/><rect x="470" y="70" width="65" height="36" rx="5" class="ft st"/><rect x="550" y="70" width="65" height="36" rx="5" class="ft st"/>
<text x="342" y="150" class="tm">&lt;s&gt;</text><text x="422" y="150" class="tm">chai</text><text x="502" y="150" class="tm">achhi</text><text x="582" y="150" class="tm">nahi</text>
<text x="342" y="50">chai</text><text x="422" y="50">achhi</text><text x="502" y="50">nahi</text><text x="582" y="50">hai</text>
</g>
<g stroke="currentColor" marker-end="url(#dr-ar3)">
<line x1="73" y1="88" x2="86" y2="88"/><line x1="146" y1="88" x2="159" y2="88"/><line x1="219" y1="88" x2="243" y2="88"/><line x1="285" y1="88" x2="308" y2="88"/><line x1="375" y1="88" x2="388" y2="88"/><line x1="455" y1="88" x2="468" y2="88"/><line x1="535" y1="88" x2="548" y2="88"/>
<line x1="44" y1="138" x2="44" y2="108"/><line x1="117" y1="138" x2="117" y2="108"/><line x1="190" y1="138" x2="190" y2="108"/>
<line x1="342" y1="138" x2="342" y2="108"/><line x1="422" y1="138" x2="422" y2="108"/><line x1="502" y1="138" x2="502" y2="108"/><line x1="582" y1="138" x2="582" y2="108"/>
<line x1="342" y1="68" x2="342" y2="56"/><line x1="422" y1="68" x2="422" y2="56"/><line x1="502" y1="68" x2="502" y2="56"/><line x1="582" y1="68" x2="582" y2="56"/>
</g>
<text x="310" y="190" text-anchor="middle" class="tm">decoder input = previous target word (teacher forcing in training); "nahi" (not) must come from c alone</text>
</svg><figcaption>The whole review must squeeze through the single red vector c. To write "nahi" at step 3 the decoder must still find "not" inside c. Long inputs don't fit.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A translator at a government office who must listen to a whole paragraph once, close the file, and then translate from memory without looking back. A short phrase is fine. A long paragraph comes out with pieces missing. That "close the file" rule is the bottleneck.</p>
  </div>
  <p>During training, what does the decoder get as input at each step? Its own guesses would be garbage early on, and one bad guess would derail every later step. So we feed it the <strong>true</strong> previous token. This is <strong>teacher forcing</strong>. Our toy task is "reverse a list of digits"; the helper below builds one training example and shows the three tensors involved:</p>
  <div class="fx" data-lang="py">import torch
torch.manual_seed(0)
V, BOS = 12, 1                                  # tokens 2..11 are "digits", 1 = start symbol
def batch(n, L):
    src = torch.randint(2, V, (n, L)); tgt = src.flip(1)          # task: reverse the sequence
    return src, torch.cat([torch.full((n, 1), BOS), tgt[:, :-1]], 1), tgt
src, tgt_in, tgt = batch(1, 5)
print("source        ", src[0].tolist())
print("target        ", tgt[0].tolist())
print("decoder input ", tgt_in[0].tolist(), " &lt;- BOS, then the true previous token")</div>
  <div class="fx" data-lang="text">source         [6, 11, 5, 2, 5]
target         [5, 2, 5, 11, 6]
decoder input  [1, 5, 2, 5, 11]  &lt;- BOS, then the true previous token</div>
  <p>The decoder input is the target shifted right by one, with a start symbol (BOS, "beginning of sequence") in front. At step 2 the decoder sees 5 (the true first answer) and must predict 2. The line <code>tgt[:, :-1]</code> drops the last target token, because nothing comes after it.</p>
  <h3>Measuring the bottleneck</h3>
  <p>Experiment: a GRU encoder-decoder (hidden size 64) learns to reverse random digit lists, trained on lengths 4–30 for 3,000 Adam steps. Then it is tested on fresh lists of fixed lengths. The full code is in the <a class="xref" data-note="dl_attention">Attention</a> note, where the same model is rerun with attention added.</p>
  <table class="tbl out"><caption>Per-token accuracy, seq2seq without attention (real run; chance = 0.10)</caption>
    <tr><th>Length</th><th>5</th><th>10</th><th>20</th><th>30</th></tr>
    <tr><td>Accuracy</td><td>1.00</td><td>0.93</td><td>0.69</td><td>0.54</td></tr>
  </table>
  <p>Same model, same training lengths. Five digits fit easily into 64 numbers; thirty digits don't, and accuracy falls towards half. The fix is to let the decoder look back at <em>every</em> encoder state, not just the last one, and choose which to read at each step. That is <strong>attention</strong>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Seq2seq</strong> (Sutskever et al., 2014): encoder RNN → context vector c = final hidden state → decoder RNN that generates tokens autoregressively (each output is fed back as the next input). <strong>Teacher forcing</strong>: during training feed the ground-truth previous token. <strong>Exposure bias</strong>: at test time the model sees its own, possibly wrong, outputs, which it never practised on.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading the training loss alone hides the bottleneck, because training mixes short and long examples. Always evaluate by length bucket, as in the table, to see where a sequence model breaks.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Bidirectional RNNs.</b> The real fix for the bottleneck is attention (<a class="xref" data-note="dl_attention">next note</a>): let the decoder look back at every encoder state. Before that, one more weakness of the encoder itself: it reads left to right, so when it reaches "not" it has no idea what is being negated.</div>

  <h2 id="dr-bi"><span class="num">08</span>Bidirectional RNNs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A left-to-right RNN at word t has read only words 1…t. At "not" it does not yet know whether "good", "bad" or "cold" follows. How can every position know about the words after it too?</p>
  </div>
  <p>The idea: run <strong>two</strong> RNNs. One reads left to right, one reads right to left. At each position, glue (concatenate) their two hidden states. Now every position has a summary of what came before and what comes after. In "Bank of England announced…" the word "England" tells you "Bank" is the central bank, but it arrives after "Bank"; in our review, "good" arrives after "not".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Filling in a blank in an exam question: "The ____ was so spicy I drank three glasses of water." You read the whole sentence, including the part after the blank, before you write "biryani". A bidirectional RNN reads both sides before deciding.</p>
  </div>
  <p>Worked example with our toy RNN. The forward pass is the one from section 02. The backward pass uses its own weights and reads "good, not, chai"; its states are then flipped back so they line up with the words.</p>
  <div class="fx" data-lang="py">def run_rnn(words, Wxh, Whh, b):
    h, states = np.zeros(2), []
    for w in words:
        h = np.tanh(Wxh @ emb[w] + Whh @ h + b)
        states.append(h)
    return states

fwd_W = (np.array([[0.5, -0.5], [0.3, 0.8]]), np.array([[0.4, 0.2], [-0.3, 0.6]]), np.array([0.0, 0.1]))
bwd_W = (np.array([[-0.2, 0.7], [0.6, 0.1]]), np.array([[0.3, -0.1], [0.2, 0.5]]), np.zeros(2))

words = ["chai", "not", "good"]
fwd = run_rnn(words, *fwd_W)                    # reads chai -&gt; not -&gt; good
bwd = run_rnn(words[::-1], *bwd_W)[::-1]        # reads good -&gt; not -&gt; chai, then re-align
for w, f, b in zip(words, fwd, bwd):
    print(f"{w:5s} fwd={f.round(2)}  bwd={b.round(2)}  concat={np.concatenate([f, b]).round(2)}")</div>
  <div class="fx" data-lang="text">chai  fwd=[0.46 0.38]  bwd=[-0.05  0.74]  concat=[ 0.46  0.38 -0.05  0.74]
not   fwd=[-0.23  0.76]  bwd=[0.65 0.46]  concat=[-0.23  0.76  0.65  0.46]
good  fwd=[0.06 0.94]  bwd=[0.46 0.6 ]  concat=[0.06 0.94 0.46 0.6 ]</div>
  <p>Look at the "chai" row. Its forward state has seen only "chai". Its backward state was computed last in the right-to-left pass, so it has read "good" and "not" too. The concatenated vector has 4 numbers: hidden size doubles. The key line is <code>words[::-1]</code> to read backwards and the second <code>[::-1]</code> to line the states up with the words again. This is what Bahdanau's attention model used as its encoder: every encoder state describes its word <em>in the context of the whole review</em>.</p>
  <p>In PyTorch it is one flag. Here a 2-layer bidirectional LSTM on the same (32, 50, 128) batch:</p>
  <div class="fx" data-lang="py">x = torch.randn(32, 50, 128)                     # (batch, seq_len, features) as in section 05
bi = nn.LSTM(128, 128, num_layers=2, batch_first=True, bidirectional=True)
out, (hn, cn) = bi(x)
print("BiLSTM output", tuple(out.shape), " h_n", tuple(hn.shape))
last = torch.cat([hn[-2], hn[-1]], dim=1)        # final fwd + final bwd of top layer
print("classifier input", tuple(last.shape))</div>
  <div class="fx" data-lang="text">BiLSTM output (32, 50, 256)  h_n (4, 32, 128)
classifier input (32, 256)</div>
  <p><code>out</code> has 256 features per step: 128 forward + 128 backward. <code>h_n</code> has 4 rows: 2 layers × 2 directions, ordered layer 0 forward, layer 0 backward, layer 1 forward, layer 1 backward. So <code>hn[-2]</code> and <code>hn[-1]</code> are the top layer's final forward and backward states, the usual input to a sentence classifier.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Bidirectional RNN</strong>: two independent RNNs over the same sequence in opposite directions; the representation at step t is [h→<sub>t</sub>; h←<sub>t</sub>]. Used in NER, part-of-speech tagging, sentence classification, and as the encoder in Bahdanau's attention model and in ELMo.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Bidirectional needs the whole sequence up front. Fine for tagging, classification and seq2seq encoders; impossible for live speech-to-text or text generation, where the future doesn't exist yet. Using one there is a classic "data leakage" mistake: great validation score, broken in production.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Padding &amp; packing.</b> All our examples were one review at a time. Training uses batches, and the reviews in a batch have different lengths (3 words, 2 words, 1 word). How do we put them in one tensor without corrupting the memory?</div>

  <h2 id="dr-practice"><span class="num">09</span>Padding, Packing &amp; RNNs Today</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>GPUs need rectangular batches. Our reviews have 3, 2 and 1 words. If we fill the short ones with filler, does the RNN's final memory still mean what we think it means?</p>
  </div>
  <p>The need: GPUs want rectangular batches, but sentences have different lengths. The usual fix is <strong>padding</strong>: add a filler token (id 0, "&lt;pad&gt;") to the short sentences until all have the same length. The problem: a plain RNN does not know the pads are fake. It keeps reading them and updating h, so the "last hidden state" of a short sentence is really "the state after reading some pads".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Three students' answer sheets stapled into equal-size bundles with blank pages added. If the examiner keeps "reading" the blank pages and lets them change the marks, the short answers get unfair scores. Packing tells the examiner exactly where each answer ends.</p>
  </div>
  <p>Worked example: three reviews of length 3, 2 and 1: "chai not good", "very cold", "late". Each word becomes an id from a small vocabulary. We run review 3 alone (the correct answer), then inside a padded batch the naive way, then the packed way.</p>
<div class="fx" data-lang="py">from torch.nn.utils.rnn import pad_sequence, pack_padded_sequence
torch.manual_seed(0)
emb = nn.Embedding(10, 4, padding_idx=0)       # id 0 = &lt;pad&gt;
rnn = nn.GRU(4, 3, batch_first=True)
ids_of = {"&lt;pad&gt;": 0, "not": 2, "very": 4, "chai": 5, "good": 7, "late": 8, "cold": 9}
reviews = ["chai not good", "very cold", "late"]
sents = [torch.tensor([ids_of[w] for w in r.split()]) for r in reviews]   # 3, 2, 1 words
lengths = torch.tensor([len(s) for s in sents])
ids = pad_sequence(sents, batch_first=True, padding_value=0)
print(ids)

out, h_pad = rnn(emb(ids))                       # naive: RNN also reads the pads
packed = pack_padded_sequence(emb(ids), lengths, batch_first=True, enforce_sorted=False)
_, h_packed = rnn(packed)                        # packed: stops at each real length

alone, _ = rnn(emb(sents[2][None]))              # review 3 ("late") run on its own
print("review 3 alone :", alone[0, -1].detach().numpy().round(3))
print("padded  h_n    :", h_pad[0, 2].detach().numpy().round(3))
print("packed  h_n    :", h_packed[0, 2].detach().numpy().round(3))</div>
  <div class="fx" data-lang="text">tensor([[5, 2, 7],
        [4, 9, 0],
        [8, 0, 0]])
review 3 alone : [-0.25   0.033 -0.179]
padded  h_n    : [-0.119 -0.117 -0.252]
packed  h_n    : [-0.25   0.033 -0.179]</div>
  <p><code>pad_sequence</code> builds the rectangle: the one-word review "late" becomes <code>[8, 0, 0]</code>. The naive run gives a different final state for it, because the GRU read two pad vectors after "late". <code>pack_padded_sequence</code> takes the true <code>lengths</code>, so the RNN stops each review at its real end, and the packed result matches the "alone" result exactly. <code>enforce_sorted=False</code> lets you pass reviews in any order.</p>
  <h3>RNN or Transformer?</h3>
  <table class="tbl">
    <tr><th></th><th>RNN / LSTM / GRU</th><th>Transformer (attention)</th></tr>
    <tr><td>Training</td><td>Sequential: step t waits for step t−1</td><td>All positions in parallel</td></tr>
    <tr><td>Path between token 1 and token n</td><td>n − 1 steps (gradient fades)</td><td>1 step (direct link)</td></tr>
    <tr><td>Cost of a new token at inference</td><td>O(1): update h</td><td>Grows with context length</td></tr>
    <tr><td>Memory for long context</td><td>Fixed size h</td><td>O(n²) scores, KV cache grows</td></tr>
    <tr><td>Best at</td><td>Streaming, tiny devices, small time-series data</td><td>Language, large data, long-range links</td></tr>
  </table>
  <p>Today almost every language model is a Transformer. RNNs still appear in on-device keyword spotting ("Hey Google"), sensor and IoT streams, some forecasting models, and the newer linear-time recurrent models (state-space models such as Mamba, and RWKV) bring the "fixed-size memory, O(1) per step" idea back at scale.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using <code>out[:, -1]</code> as "the last hidden state" in a padded batch gives the state at the last <em>padded</em> position. Use <code>h_n</code> from a packed sequence, or index <code>out</code> at <code>lengths - 1</code> for each row.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have met ten ideas. How do they hang together, and which weakness led to which fix?</div>

  <h2 id="dr-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>RNN, BPTT, vanishing gradients, clipping, LSTM, GRU, seq2seq, bottleneck, bidirectional, packing: a list of tricks, or one idea and its consequences?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 320" width="680">
<defs><marker id="dr-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="170" height="44" rx="7" class="fr sr"/><text x="95" y="29" text-anchor="middle" font-size="11.5" font-weight="700">bag of words / MLP</text><text x="95" y="45" text-anchor="middle" class="tm" font-size="10">order lost: [1 1 1] = [1 1 1]</text>
<line x1="180" y1="32" x2="218" y2="32" stroke="currentColor" marker-end="url(#dr-a9)"/>
<rect x="220" y="10" width="220" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">RNN: h_t = tanh(Wx_t + Uh_t−1)</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">h₃ = [0.057, 0.938]</text>
<line x1="440" y1="32" x2="478" y2="32" stroke="currentColor" marker-end="url(#dr-a9)"/>
<rect x="480" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="575" y="29" text-anchor="middle" font-size="11.5" font-weight="700">BPTT</text><text x="575" y="45" text-anchor="middle" class="tm" font-size="10">sum over steps: 0.6065</text>
<line x1="575" y1="54" x2="575" y2="84" stroke="currentColor" marker-end="url(#dr-a9)"/>
<rect x="450" y="86" width="220" height="44" rx="7" class="fr sr"/><text x="560" y="105" text-anchor="middle" font-size="11.5" font-weight="700">product of factors per step</text><text x="560" y="121" text-anchor="middle" class="tm" font-size="10">vanish 3e-17 · explode 2.6e11</text>
<line x1="450" y1="108" x2="398" y2="108" stroke="currentColor" marker-end="url(#dr-a9)"/>
<rect x="250" y="86" width="146" height="44" rx="7" class="ft st"/><text x="323" y="105" text-anchor="middle" font-size="11.5" font-weight="700">clip (exploding)</text><text x="323" y="121" text-anchor="middle" class="tm" font-size="10">norm → 1.0</text>
<line x1="560" y1="130" x2="560" y2="160" stroke="currentColor" marker-end="url(#dr-a9)"/>
<rect x="450" y="162" width="220" height="44" rx="7" class="fg sg"/><text x="560" y="181" text-anchor="middle" font-size="11.5" font-weight="700">gates: LSTM / GRU</text><text x="560" y="197" text-anchor="middle" class="tm" font-size="10">c = f·c + i·c̃ : 0.462 · h = 0.358</text>
<line x1="450" y1="184" x2="398" y2="184" stroke="currentColor" marker-end="url(#dr-a9)"/>
<rect x="190" y="162" width="206" height="44" rx="7" class="fb sb"/><text x="293" y="181" text-anchor="middle" font-size="11.5" font-weight="700">seq2seq encoder → c → decoder</text><text x="293" y="197" text-anchor="middle" class="tm" font-size="10">chai not good → chai achhi nahi hai</text>
<line x1="190" y1="184" x2="158" y2="184" stroke="currentColor" marker-end="url(#dr-a9)"/>
<rect x="10" y="162" width="146" height="44" rx="7" class="fr sr"/><text x="83" y="181" text-anchor="middle" font-size="11.5" font-weight="700">bottleneck</text><text x="83" y="197" text-anchor="middle" class="tm" font-size="10">1.00 → 0.54 at length 30</text>
<line x1="83" y1="206" x2="83" y2="240" stroke="currentColor" marker-end="url(#dr-a9)"/>
<rect x="10" y="242" width="180" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="100" y="267" text-anchor="middle" font-size="11">→ attention (next note)</text>
<line x1="293" y1="206" x2="293" y2="240" stroke="currentColor" marker-end="url(#dr-a9)"/>
<rect x="210" y="242" width="170" height="40" rx="7" class="ft st"/><text x="295" y="260" text-anchor="middle" font-size="11.5" font-weight="700">bidirectional encoder</text><text x="295" y="275" text-anchor="middle" class="tm" font-size="10">"chai" sees "not good"</text>
<rect x="400" y="242" width="270" height="40" rx="7" class="ft st"/><text x="535" y="260" text-anchor="middle" font-size="11.5" font-weight="700">padding + packing for batches</text><text x="535" y="275" text-anchor="middle" class="tm" font-size="10">packed h = alone h</text>
<text x="340" y="308" text-anchor="middle" class="tm" font-size="10.5">one idea: a memory updated with the same weights at every step</text>
</svg><figcaption>Everything follows from carrying one memory forward with shared weights: training it means summing over steps (BPTT), which multiplies factors (vanishing/exploding), which forces gated memories (LSTM, GRU); using that memory as the only link between two sequences creates the bottleneck that attention removes.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same review, "chai not good"</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our review</th><th>When to use</th></tr>
    <tr><td>Bag of words</td><td>word counts</td><td>fixed-size input for text?</td><td>"good, not bad" = "bad, not good" = [1 1 1]</td><td>quick baselines where order matters little</td></tr>
    <tr><td>RNN cell</td><td>W<sub>xh</sub>x + W<sub>hh</sub>h + b, tanh</td><td>read in order, any length?</td><td>h₁ [0.462, 0.380], h₂ [−0.235, 0.757], h₃ [0.057, 0.938]</td><td>short sequences, teaching, streaming</td></tr>
    <tr><td>BPTT</td><td>backprop on the unrolled loop</td><td>how do shared weights learn?</td><td>∂h₃/∂w = 0.478 + 0.129 + 0 = 0.6065</td><td>always (truncated for long streams)</td></tr>
    <tr><td>Vanishing / exploding</td><td>product of w·(1 − h²) factors</td><td>why do RNNs forget?</td><td>0.338 → 0.085 after 2 steps; 3e-17 after 60</td><td>diagnosing long-range failures</td></tr>
    <tr><td>Clipping</td><td>rescale gradient norm</td><td>stop explosions?</td><td>2.6e11 → 1.0</td><td>every RNN training loop</td></tr>
    <tr><td>LSTM</td><td>cell state + 3 gates</td><td>keep memory for many steps?</td><td>step 1: c 0.462, h 0.227</td><td>long sequences, precise memory</td></tr>
    <tr><td>GRU</td><td>one state + 2 gates</td><td>same, cheaper?</td><td>step 1: h 0.358; 25% fewer weights</td><td>first try, smaller data</td></tr>
    <tr><td>Seq2seq</td><td>encoder RNN + decoder RNN</td><td>sequence in, new sequence out?</td><td>c = h₃ → "chai achhi nahi hai"</td><td>translation, summarisation (pre-attention)</td></tr>
    <tr><td>Bottleneck</td><td>one fixed vector c</td><td>does c hold a long input?</td><td>accuracy 1.00 (5) → 0.54 (30)</td><td>the reason for attention</td></tr>
    <tr><td>Bidirectional</td><td>two RNNs, concatenated</td><td>context from both sides?</td><td>"chai" = [0.46, 0.38, −0.05, 0.74]</td><td>tagging, classification, encoders; never streaming</td></tr>
    <tr><td>Padding + packing</td><td>pad ids + true lengths</td><td>batches of mixed lengths?</td><td>"late": packed h = alone h</td><td>every batched RNN</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>an RNN is one memory vector updated by the same weights at every step.</strong> Sharing makes it work for any length; the repeated update makes gradients a long product (vanishing/exploding); gates replace "rewrite" by "edit" so memory survives; and because the memory is a single fixed vector, using it as the only bridge between two sequences creates the bottleneck that attention removes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The ideas are connected; now the traps that catch people in code and interviews.</div>

  <h2 id="dr-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which RNN bugs are silent (the code runs, the numbers are wrong), and how do you catch each one?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting batch_first</span>
    <p>PyTorch RNN layers default to (seq, batch, features). Feeding (batch, seq, features) without <code>batch_first=True</code> reads across examples instead of along time. Check <code>out.shape</code> once on a toy batch.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: mixing up out and h_n</span>
    <p><code>out</code> is the top layer's h at every step: (batch, seq, hidden × directions). <code>h_n</code> is the last step of every layer and direction: (layers × directions, batch, hidden). For classification use the top layer's <code>h_n</code> (both directions if bidirectional).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: letting the RNN read padding</span>
    <p>Pads change h. Use <code>pack_padded_sequence</code>, or gather the output at each true length. Also set <code>padding_idx</code> in the embedding so the pad vector stays zero.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no gradient clipping</span>
    <p>RNN training without <code>clip_grad_norm_</code> can spike to NaN after hours. Clip to around 1.0 (common range 0.5–5) between <code>backward()</code> and <code>step()</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: not detaching the carried hidden state</span>
    <p>In truncated BPTT (language models over a long text), call <code>h = h.detach()</code> before each new chunk, or memory grows and backward fails.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: bidirectional where the future is unknown</span>
    <p>Live forecasting or generation with a bi-RNN leaks the future in training and can't run in production.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong gate order when loading weights</span>
    <p>PyTorch stacks the LSTM gates as input, forget, cell, output. Hand-written code or other libraries may use another order, and GRU conventions flip z. To set the forget bias in PyTorch, fill slice <code>[H:2H]</code>, not <code>[0:H]</code> (that is the input gate).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="dl_attention">Attention Mechanisms</a>, which removes the bottleneck by letting the decoder look at every word of the review.</div>

  <h2 id="dr-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: the review "chai not good"; toy word vectors chai = [1, 0], not = [0, 1], good = [1, 1]; toy RNN W<sub>xh</sub> = [[0.5, −0.5], [0.3, 0.8]], W<sub>hh</sub> = [[0.4, 0.2], [−0.3, 0.6]], b = [0, 0.1], h₀ = [0, 0].</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our review</th><th>Weakness → next</th></tr>
    <tr><td>Sequence data</td><td>why not an MLP?</td><td>bag-of-words can't tell "good, not bad" from "bad, not good"</td><td>need ordered reading</td></tr>
    <tr><td>RNN</td><td>read any length in order?</td><td>h₃ = [0.057, 0.938]; other orders → other h₃</td><td>how to train shared weights?</td></tr>
    <tr><td>BPTT</td><td>gradient of a shared weight?</td><td>0.478 + 0.129 + 0 = 0.6065</td><td>factors multiply</td></tr>
    <tr><td>Vanishing / exploding</td><td>long-range learning?</td><td>0.085 after 2 steps; 3e-17 after 60</td><td>memory must change</td></tr>
    <tr><td>LSTM</td><td>memory that survives?</td><td>c₁ = 0.462, h₁ = 0.227</td><td>heavy</td></tr>
    <tr><td>GRU</td><td>cheaper gating?</td><td>h₁ = 0.358</td><td>only reads, can't write a sequence</td></tr>
    <tr><td>Seq2seq</td><td>sequence → sequence?</td><td>chai not good → chai achhi nahi hai</td><td>one vector c</td></tr>
    <tr><td>Bottleneck</td><td>does c hold long inputs?</td><td>1.00 → 0.54 (length 5 → 30)</td><td>→ attention</td></tr>
    <tr><td>Bidirectional</td><td>context from the right?</td><td>"chai" sees "not good"</td><td>needs the whole sequence</td></tr>
    <tr><td>Padding / packing</td><td>mixed-length batches?</td><td>packed h of "late" = alone</td><td>—</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>RNN</td><td>h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t−1</sub> + b); y<sub>t</sub> = W<sub>hy</sub>h<sub>t</sub></td><td>x<sub>t</sub> word vector, h<sub>t</sub> memory, h<sub>0</sub> = 0</td></tr>
    <tr><td>One step back</td><td>∂h<sub>t</sub>/∂h<sub>t−1</sub> = W<sub>hh</sub>ᵀ·diag(1 − h<sub>t</sub>²) (scalar: w·(1 − h²))</td><td>tanh′ = 1 − h²</td></tr>
    <tr><td>BPTT</td><td>∂L/∂W = Σ<sub>t</sub> (piece of the gradient from step t)</td><td>shared weight → sum over steps</td></tr>
    <tr><td>Clipping</td><td>g ← g · min(1, max_norm / ‖g‖)</td><td>‖g‖ global gradient norm</td></tr>
    <tr><td>LSTM</td><td>f, i, o = σ(W[h<sub>t−1</sub>, x<sub>t</sub>] + b); c̃ = tanh(…); c<sub>t</sub> = f⊙c<sub>t−1</sub> + i⊙c̃; h<sub>t</sub> = o⊙tanh(c<sub>t</sub>)</td><td>σ sigmoid (0–1), ⊙ element-wise product</td></tr>
    <tr><td>GRU</td><td>z, r = σ(…); h̃ = tanh(W[r⊙h<sub>t−1</sub>, x<sub>t</sub>]); h<sub>t</sub> = (1 − z)⊙h<sub>t−1</sub> + z⊙h̃</td><td>z update, r reset</td></tr>
    <tr><td>Params</td><td>RNN: h(x + h) + 2h; GRU ×3; LSTM ×4</td><td>x input size, h hidden size (two bias vectors in PyTorch)</td></tr>
    <tr><td>Bidirectional</td><td>h<sub>t</sub> = [h→<sub>t</sub>; h←<sub>t</sub>]</td><td>size doubles</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use an RNN / GRU / LSTM</b><p>Streaming data (one step at a time, O(1) memory), small time-series datasets, on-device models, short sequences.</p><small>GRU first; LSTM for long memory</small></div>
    <div><b>Prefer attention / Transformers</b><p>Language with long-range links, large data, when training must be parallel.</p><small>See the Attention note</small></div>
    <div><b>Bidirectional</b><p>Whenever the whole sequence is known at prediction time: tagging, classification, encoders.</p><small>Never for live forecasting or generation</small></div>
    <div><b>Always</b><p>Clip gradients; pack padded batches; initialise the LSTM forget bias to 1 or more.</p><small>batch_first=True</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Forgetting <code>batch_first</code>; mixing up <code>out</code> and <code>h_n</code>; letting the RNN read pads; no clipping; not detaching the carried state in truncated BPTT; bidirectional when the future is unknown; wrong gate order (PyTorch: i, f, g, o); thinking clipping fixes vanishing.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>h₀ = [0, 0], x = "chai" = [1, 0]: what is h₁ of the toy RNN?</td><td>tanh([0.5, 0.3] + [0, 0.1]) = tanh([0.5, 0.4]) = [0.462, 0.380]</td></tr>
    <tr><td>Factors 0.338 and 0.25 on the way back: ∂h₃/∂h₁?</td><td>0.338 × 0.25 = 0.085</td></tr>
    <tr><td>Does gradient clipping fix vanishing gradients?</td><td>No, only exploding; vanishing needs gates or attention</td></tr>
    <tr><td>LSTM with f = 0.769, c₀ = 0, i = 0.646, c̃ = 0.716: c₁?</td><td>0.769·0 + 0.646·0.716 = 0.462</td></tr>
    <tr><td>Params of nn.LSTM(10, 20)?</td><td>4 × (20·10 + 20·20 + 20 + 20) = 2,560</td></tr>
  </table>

  <h2 id="dr-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use an MLP on a bag of words for text?</summary><div class="qa-body">A bag of words throws away order ("good, not bad" = "bad, not good"), and an MLP needs a fixed input size, so it can't take variable-length text with order intact. An RNN reads in order with shared weights and handles any length.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the vanilla RNN update and explain weight sharing.</summary><div class="qa-body">h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t−1</sub> + b), h<sub>0</sub> = 0. The same W<sub>xh</sub>, W<sub>hh</sub> are used at every step, so the model handles any length with a fixed number of parameters, and a pattern learned at one position works at every position.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>With W<sub>xh</sub> = I (identity), W<sub>hh</sub> = 0, b = 0, what is h<sub>t</sub>?</summary><div class="qa-body">h<sub>t</sub> = tanh(x<sub>t</sub>): no memory at all, each step only sees its own input. W<sub>hh</sub> is what makes the network recurrent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is BPTT?</summary><div class="qa-body">Backpropagation through time: unroll the RNN over the sequence, run ordinary backprop on the unrolled graph, and sum each shared weight's gradient over all time steps. Truncated BPTT limits the backward pass to chunks of k steps for long streams.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does vanishing gradient hit RNNs harder than feed-forward nets?</summary><div class="qa-body">A length-500 sequence unrolls into a 500-layer graph, and the <em>same</em> W<sub>hh</sub> is multiplied in at every step, so ∂h<sub>T</sub>/∂h<sub>1</sub> is a product of ~500 similar Jacobians: it shrinks (or grows) exponentially. Feed-forward nets are shallower and use skips/normalisation; a vanilla RNN has neither.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Exploding vs vanishing: how do you fix each?</summary><div class="qa-body">Exploding: gradient clipping (clip the global norm, e.g. to 1.0). Vanishing: no clipping equivalent; use gated cells (LSTM/GRU), good init (forget bias, orthogonal W<sub>hh</sub>), shorter BPTT windows, or attention/Transformers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain LSTM's cell state and why it enables long memory.</summary><div class="qa-body">c<sub>t</sub> = f ⊙ c<sub>t−1</sub> + i ⊙ c̃ is an additive update. Its gradient ∂c<sub>t</sub>/∂c<sub>t−1</sub> = f is element-wise and learned. With f ≈ 1 the gradient passes nearly unchanged across many steps (0.99⁵⁰ ≈ 0.61): a gradient highway, like ResNet's skip.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does each LSTM gate do? Why sigmoid for gates, tanh for the candidate?</summary><div class="qa-body">Forget: keep how much old memory. Input: how much new info to write. Output: how much of tanh(c) to expose as h. Sigmoid gives 0–1, a soft valve. tanh gives −1 to 1, so the candidate can add or subtract from memory and stays bounded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters in nn.LSTM(input_size=10, hidden_size=20)?</summary><div class="qa-body">4 blocks × (20·10 + 20·20 + 20 + 20) = 4 × 640 = <strong>2,560</strong> (PyTorch keeps two bias vectors). A GRU is 3 × 640 = 1,920, a vanilla RNN 640.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>GRU or LSTM: which would you pick?</summary><div class="qa-body">Start with GRU: 25% fewer params, faster, usually as good on small/medium data. Try LSTM for very long sequences or if GRU underperforms. Neither dominates; tune both if it matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When can't you use a bidirectional RNN?</summary><div class="qa-body">When future inputs aren't available at prediction time: streaming speech recognition, real-time forecasting, autoregressive text generation. It's fine for classification, tagging and encoders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the seq2seq bottleneck and what fixed it?</summary><div class="qa-body">The encoder compresses the whole input into one fixed-size vector, so long inputs lose information (our toy: 1.00 accuracy at length 5, 0.54 at length 30). Attention (Bahdanau 2014) lets the decoder build a fresh weighted mix of all encoder states at each step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is teacher forcing and its downside?</summary><div class="qa-body">In training, feed the ground-truth previous token to the decoder instead of its own prediction. Faster and stabler, but at inference the model sees its own (possibly wrong) outputs, a mismatch called exposure bias. Mitigation: scheduled sampling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you batch sentences of different lengths for an RNN?</summary><div class="qa-body">Pad to the longest with a pad id (and <code>padding_idx</code> in the embedding), then <code>pack_padded_sequence</code> with the true lengths so the RNN stops at each sentence's real end. Otherwise the final hidden state is polluted by pads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you still use an RNN over a Transformer?</summary><div class="qa-body">Streaming/online prediction (O(1) work and memory per new step), very long streams where O(n²) attention is too costly, tiny edge devices, and small time-series datasets. Otherwise Transformers win: parallel training and direct links between any two positions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does sharing weights over time create the vanishing-gradient problem?</summary><div class="qa-body">Because the same W<sub>hh</sub> is applied at every step, the gradient from step T back to step 1 is a product of T − 1 factors of the same kind (W<sub>hh</sub>ᵀ·diag(1 − h²)). Products of many similar numbers below 1 vanish exponentially (0.338 × 0.25 = 0.085 after two steps of our review; 3×10⁻¹⁷ after 60). A feed-forward net has different weights per layer and is usually shallower.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the LSTM need an additive cell update, and what would break with c<sub>t</sub> = tanh(W·c<sub>t−1</sub>)?</summary><div class="qa-body">With an additive update c<sub>t</sub> = f·c<sub>t−1</sub> + i·c̃, the backward factor is just f, which the network can hold near 1 (0.99⁵⁰ = 0.61 survives). With c<sub>t</sub> = tanh(W·c<sub>t−1</sub>) we are back to a plain RNN: every step multiplies by W and a tanh slope, so memory and gradient fade (0.26% left after 50 steps in our demo).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does seq2seq lead directly to attention, and what does attention keep that seq2seq throws away?</summary><div class="qa-body">Seq2seq keeps only the encoder's final state c and discards h₁ … h<sub>T−1</sub>, so every input word must survive inside one fixed vector (accuracy 0.54 at length 30). Attention keeps every encoder state and lets each decoder step take a fresh weighted average of them: to write "nahi" it can look straight at "not".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip packing but use a bidirectional RNN?</summary><div class="qa-body">Worse than the one-direction case: the backward RNN starts reading at the end of the padded row, so for a short review it reads all the pads <em>first</em> and every backward state of the real words is polluted. Packing makes the backward pass start at each review's true last word.</div></details>

</main>`
});
