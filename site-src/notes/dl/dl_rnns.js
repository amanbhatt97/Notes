// dl/dl_rnns.js — RNNs & Sequential Models
Object.assign(TOPIC_CONTENT, {
  "dl_rnns": `<main>
  <h1>RNNs &amp; Sequential Models</h1>
  <div class="where"><span>Deep Learning</span><span>RNNs &amp; Sequential</span></div>
  <p class="lead">A recurrent neural network, or RNN, is a network that reads its input in order, one piece at a time, and carries a small memory from each step to the next. That makes it the natural tool for data where order is the meaning: sentences, speech, sensor readings, a shop's hourly sales. Recurrent networks were the standard models for language before Transformers, the ideas behind them (shared weights over time, gating, encoder and decoder) still run through modern models, and "explain vanishing gradients and the LSTM" remains one of the most common deep-learning interview questions. The whole page follows one example: a food-delivery app wants to flag unhappy customers from short reviews, and our review is three words, <strong>"chai not good"</strong>. We will push it through an RNN by hand, train it, watch the gradient vanish, fix that with LSTM and GRU gates, translate it, batch it, and finally train a small PyTorch LSTM that learns what "not" does.</p>

  <h2 id="dr-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">RNNs &amp; Sequential</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The RNN</div>
        <ul>
          <li>Order matters and length varies: bag of words loses both</li>
          <li><b>h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t−1</sub> + b)</b>, h<sub>0</sub> = 0</li>
          <li>Same weights at every step: any length, fixed parameter count</li>
          <li>Trained by <b>BPTT</b>: unroll, backprop, sum gradients over steps</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Why it forgets</div>
        <ul>
          <li>Gradient to step 1 = product of many per-step factors</li>
          <li>Factors &lt; 1 → <b>vanishing</b>; &gt; 1 → <b>exploding</b></li>
          <li>Exploding: clip the gradient norm</li>
          <li>Vanishing: change the cell (gates)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gated cells</div>
        <ul>
          <li><b>LSTM</b>: cell state c, gates forget, input, output</li>
          <li>c<sub>t</sub> = f⊙c<sub>t−1</sub> + i⊙c̃: edit, don't rewrite</li>
          <li><b>GRU</b>: one state, update and reset gates, 25% fewer weights</li>
          <li>Set the LSTM forget-gate bias to 1 or more</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Using RNNs</div>
        <ul>
          <li>Many→one, many→many, seq2seq (encoder → context → decoder)</li>
          <li>Seq2seq bottleneck: one vector for the whole input → attention</li>
          <li>Bidirectional: past and future, never for streaming</li>
          <li>Batches: pad, then pack; <code>batch_first=True</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dr-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Sequences Need Memory</span><span class="rm-sub">what goes wrong when order is thrown away</span></div></div>
      <div class="rm-item rm-done" data-target="dr-rnn"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The RNN Cell, Step by Step</span><span class="rm-sub">"chai not good" through one cell, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dr-bptt"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Backpropagation Through Time</span><span class="rm-sub">how weights used at every step learn</span></div></div>
      <div class="rm-item rm-done" data-target="dr-vg"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Vanishing and Exploding Gradients</span><span class="rm-sub">why a plain RNN forgets, in numbers</span></div></div>
      <div class="rm-item rm-done" data-target="dr-lstm"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">LSTM: A Memory With Gates</span><span class="rm-sub">forget, input and output gates by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dr-gru"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">GRU: The Lighter Gated Cell</span><span class="rm-sub">two gates, one state, and how it compares</span></div></div>
      <div class="rm-item rm-done" data-target="dr-tasks"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Sequence Tasks and Bidirectional RNNs</span><span class="rm-sub">one label, a label per word, both directions</span></div></div>
      <div class="rm-item rm-done" data-target="dr-s2s"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Seq2seq and Its Bottleneck</span><span class="rm-sub">translating a review, and why attention came next</span></div></div>
      <div class="rm-item rm-done" data-target="dr-pack"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Padding and Packing</span><span class="rm-sub">batching reviews of different lengths</span></div></div>
      <div class="rm-item rm-done" data-target="dr-train"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Training an LSTM in PyTorch</span><span class="rm-sub">a model that learns what "not" does</span></div></div>
      <div class="rm-item rm-done" data-target="dr-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">shapes, pads, detach, gate order</span></div></div>
      <div class="rm-item rm-done" data-target="dr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, comparisons, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dr-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the RNN questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="dr-why"><span class="num">01</span>Why Sequences Need Memory</h2>
  <p>The networks from the earlier notes, the multilayer perceptron (MLP) of <a class="xref" data-note="dl_neurons">Neurons, Layers &amp; Activations</a> and the CNN of <a class="xref" data-note="dl_cnns">CNNs</a>, both expect an input of a fixed size: a fixed list of numbers, or a fixed grid of pixels. A customer review is neither. It is a list of words in a particular order, and the next review may be ten times longer. Two facts about this kind of data shape the whole page. First, <strong>order carries meaning</strong>: "good, not bad" and "bad, not good" use exactly the same words and mean opposite things. Second, <strong>length varies</strong>: our review has three words, the next one might have thirty.</p>
  <p>The usual trick for squeezing text into a fixed-size input is a <strong>bag of words</strong>: count how many times each vocabulary word appears, and use the counts as the input. That gives the same number of inputs for every review, whatever its length. Let us see what it does to word order:</p>
  <div class="fx" data-lang="py">import numpy as np
vocab = ["good", "not", "bad"]
def bag(review):                                   # count each vocabulary word
    words = review.replace(",", "").split()
    return np.array([words.count(w) for w in vocab])

print(bag("good, not bad"), bag("bad, not good"))
print("identical input?", np.array_equal(bag("good, not bad"), bag("bad, not good")))</div>
  <div class="fx" data-lang="text">[1 1 1] [1 1 1]
identical input? True</div>
  <p>Both reviews become <code>[1 1 1]</code>, one "good", one "not", one "bad". Any model that only sees these counts must give a happy customer and an unhappy customer exactly the same answer. The order was the meaning, and the bag of words threw it away. Making the MLP input bigger, with one slot per word position, does not help much either: a 500-slot MLP has separate weights for "word in slot 3" and "word in slot 300", so a pattern learned at the start of a sentence does not carry over to the end, and a 501-word review does not fit at all. A 1-D CNN slides the same small filter along the sentence, which keeps order inside its window, but it only sees a few neighbouring words at a time, so in "the chai, which my friend had praised so much last week, was not good" the word "not" is too far from "chai" for a small window.</p>
  <p>Think about how you follow cricket commentary on the radio. You never hear the whole match at once. Each ball updates the picture in your head: the score, the wickets, who is batting. "Four!" means something quite different at 20 for 5 than at 180 for 1, and you know which situation you are in only because you carried a memory of the earlier balls. You also use the same understanding of cricket for ball 1 as for ball 300.</p>
  <p>That is exactly what we want from a model. A <strong>sequence</strong> is an ordered list of items x<sub>1</sub>, x<sub>2</sub>, …, x<sub>T</sub>, where each position is called a <strong>time step</strong> (even for words, which have nothing to do with clock time) and T is the length. A <strong>sequence model</strong> is a model that reads the items in order and lets earlier items change how later ones are understood. The simplest way to build one is to read one item at a time, keep a running memory, and use the same weights at every step. That is the recurrent neural network.</p>
  <table class="tbl">
    <tr><th>Model</th><th>Any length?</th><th>Uses order?</th><th>Links far-apart words?</th></tr>
    <tr><td>MLP on a bag of words</td><td>yes, by dropping order</td><td>no</td><td>no</td></tr>
    <tr><td>MLP on fixed word slots</td><td>no</td><td>yes</td><td>only within its slots</td></tr>
    <tr><td>1-D CNN</td><td>yes</td><td>inside its window</td><td>only within the window</td></tr>
    <tr><td>RNN</td><td>yes</td><td>yes</td><td>in principle (section 04 shows the catch)</td></tr>
  </table>

  <h2 id="dr-rnn"><span class="num">02</span>The RNN Cell, Step by Step</h2>
  <p>We need one model that can read 3 words or 300 words with the same set of weights and that ends up with a summary that depends on the order of the words. The RNN does this with a vector called the <strong>hidden state</strong>, written h, which is the model's memory. It starts as all zeros. For each new word, the network mixes the word with the old memory, squashes the result into a fixed range, and that becomes the new memory. Then it moves to the next word and does exactly the same thing again with exactly the same weights. The piece of the network that performs one such update is called the <strong>RNN cell</strong>.</p>
  <p>Picture the scorer at a local cricket match. She does not keep a notebook of every ball; she has one small scoreboard. After each ball she looks at the old scoreboard and at what just happened, and writes the new scoreboard. She uses the same rules for ball 1 and ball 100. The scoreboard is the hidden state, and her rules are the weights.</p>
  <p>As a formula, the update at step t is <strong>h<sub>t</sub> = tanh(W<sub>xh</sub>·x<sub>t</sub> + W<sub>hh</sub>·h<sub>t−1</sub> + b)</strong>. Here x<sub>t</sub> is the vector for the word at step t, W<sub>xh</sub> is a weight matrix that says how the new input feeds into the memory, W<sub>hh</sub> is a weight matrix that says how the old memory feeds into the new memory, and b is a bias. <strong>tanh</strong> (hyperbolic tangent) squashes every number into the range −1 to 1, so the memory cannot grow without limit however long the review is. The word "recurrent" refers to the fact that h<sub>t−1</sub>, the cell's own previous output, comes back in as an input.</p>
  <p>To make every number checkable, we keep things tiny. Each word is a vector of 2 numbers (in a real model these come from an embedding layer and have a hundred or more numbers), the hidden state also has 2 numbers, and we pick the weights by hand: chai = [1, 0], not = [0, 1], good = [1, 1]; W<sub>xh</sub> = [[0.5, −0.5], [0.3, 0.8]]; W<sub>hh</sub> = [[0.4, 0.2], [−0.3, 0.6]]; b = [0, 0.1]; h<sub>0</sub> = [0, 0]. The table follows the review through the cell, one row per word.</p>
  <table class="tbl">
    <tr><th>t</th><th>word x<sub>t</sub></th><th>W<sub>xh</sub>·x<sub>t</sub></th><th>W<sub>hh</sub>·h<sub>t−1</sub></th><th>sum + b</th><th>h<sub>t</sub> = tanh(sum)</th></tr>
    <tr><td>1</td><td>chai [1, 0]</td><td>[0.5, 0.3]</td><td>[0, 0] (empty memory)</td><td>[0.5, 0.4]</td><td>[0.462, 0.380]</td></tr>
    <tr><td>2</td><td>not [0, 1]</td><td>[−0.5, 0.8]</td><td>[0.261, 0.089]</td><td>[−0.239, 0.989]</td><td>[−0.235, 0.757]</td></tr>
    <tr><td>3</td><td>good [1, 1]</td><td>[0, 1.1]</td><td>[0.058, 0.525]</td><td>[0.058, 1.725]</td><td>[0.057, 0.938]</td></tr>
  </table>
  <p>Read row 2 slowly. The new memory depends on "not" (the third column) <em>and</em> on what was remembered about "chai" (the fourth column, 0.4·0.462 + 0.2·0.380 = 0.261 for the first number). By step 3 the hidden state carries a trace of all three words, so h<sub>3</sub> = [0.057, 0.938] is the RNN's whole summary of the review. A small classifier on top of it would decide "unhappy customer or not". Drawing the same cell once per word, as below, is called <strong>unrolling</strong> the RNN: it is still one cell with one set of weights, shown at three moments in time.</p>
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
</svg><figcaption>The RNN unrolled over "chai not good". Each box is the same cell with the same W<sub>xh</sub>, W<sub>hh</sub> and b. The horizontal arrows carry the memory from one word to the next; the vertical arrows show each step's hidden state.</figcaption></figure>
  <p>The same calculation in NumPy is a short loop. For each word it computes the input part and the memory part, adds them with the bias, and applies tanh:</p>
  <div class="fx" data-lang="py">import numpy as np
emb = {"chai": np.array([1.0, 0.0]),     # toy 2-number word vectors
       "not":  np.array([0.0, 1.0]),
       "good": np.array([1.0, 1.0])}
Wxh = np.array([[0.5, -0.5],             # input  -&gt; hidden
                [0.3,  0.8]])
Whh = np.array([[0.4,  0.2],             # hidden -&gt; hidden
                [-0.3, 0.6]])
b   = np.array([0.0, 0.1])

h = np.zeros(2)                          # h0: empty memory
for t, word in enumerate(["chai", "not", "good"], start=1):
    from_input  = Wxh @ emb[word]
    from_memory = Whh @ h
    h = np.tanh(from_input + from_memory + b)      # the new memory replaces the old
    print(f"t={t} {word:5s} Wxh@x={from_input.round(3)}  Whh@h={from_memory.round(3)}  h={h.round(3)}")</div>
  <div class="fx" data-lang="text">t=1 chai  Wxh@x=[0.5 0.3]  Whh@h=[0. 0.]  h=[0.462 0.38 ]
t=2 not   Wxh@x=[-0.5  0.8]  Whh@h=[0.261 0.089]  h=[-0.235  0.757]
t=3 good  Wxh@x=[0.  1.1]  Whh@h=[0.058 0.525]  h=[0.057 0.938]</div>
  <p>The output matches the hand table digit for digit. Two lines carry the whole idea. <code>h = np.tanh(...)</code> overwrites the memory at every step, and the next step reads it back through <code>Whh @ h</code>; that reuse is the "recurrent" part. And <code>Wxh</code> and <code>Whh</code> never change inside the loop: the same weights serve every position, which is called <strong>weight sharing over time</strong>. It is the same idea as a CNN sharing one filter across every position of an image, applied along time instead of space, and it is why the loop would run unchanged on a 300-word review.</p>
  <p>Does the RNN now notice word order, which the bag of words could not? Feed it the same three words in different orders:</p>
  <div class="fx" data-lang="py">def summary(words):                      # the whole RNN: a loop that overwrites h
    h = np.zeros(2)
    for w in words:
        h = np.tanh(Wxh @ emb[w] + Whh @ h + b)
    return h

for order in (["chai", "not", "good"], ["good", "not", "chai"], ["not", "good", "chai"]):
    print(" ".join(order).ljust(14), "-&gt;", summary(order).round(3))</div>
  <div class="fx" data-lang="text">chai not good  -&gt; [0.057 0.938]
good not chai  -&gt; [0.499 0.773]
not good chai  -&gt; [0.586 0.752]</div>
  <p>Three orders give three different final memories, from the same word vectors and the same weights. The function <code>summary</code> is the whole RNN, a loop that overwrites <code>h</code>, and order now matters because each word is mixed into a memory that already contains the words before it.</p>
  <p>In practice you do not write this loop yourself. PyTorch's <code>nn.RNN</code> runs the same recurrence in optimised C++ code. If we copy our hand-picked weights into it, it must produce our numbers:</p>
  <div class="fx" data-lang="py">rnn = nn.RNN(input_size=2, hidden_size=2, batch_first=True)
with torch.no_grad():                          # copy our hand-picked weights in
    rnn.weight_ih_l0.copy_(torch.tensor(Wxh))
    rnn.weight_hh_l0.copy_(torch.tensor(Whh))
    rnn.bias_ih_l0.copy_(torch.tensor(b))
    rnn.bias_hh_l0.zero_()                     # PyTorch keeps two biases; we use one

x = torch.tensor([[[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]]])   # chai, not, good: (batch=1, seq=3, features=2)
out, h_n = rnn(x)
print("out", tuple(out.shape), " h_n", tuple(h_n.shape))
print(out[0].detach().numpy().round(3))
print("last row of out == h_n:", torch.allclose(out[:, -1], h_n[0]))</div>
  <div class="fx" data-lang="text">out (1, 3, 2)  h_n (1, 1, 2)
[[ 0.462  0.38 ]
 [-0.235  0.757]
 [ 0.057  0.938]]
last row of out == h_n: True</div>
  <p>The three rows are our h<sub>1</sub>, h<sub>2</sub> and h<sub>3</sub>. An RNN layer returns two things, and beginners often mix them up. <code>out</code> holds the hidden state at <em>every</em> step, with shape (batch, steps, hidden) when <code>batch_first=True</code>. <code>h_n</code> holds only the <em>last</em> hidden state, with shape (layers, batch, hidden); the last line confirms it equals the last row of <code>out</code>. PyTorch calls W<sub>xh</sub> <code>weight_ih_l0</code> (input to hidden, layer 0) and W<sub>hh</sub> <code>weight_hh_l0</code>, and it keeps two bias vectors where the formula has one, which is why we zeroed the second. The flag <code>batch_first=True</code> says our tensor is laid out as (batch, sequence, features); without it PyTorch assumes (sequence, batch, features), a trap we return to in Common Mistakes.</p>
  <p>When a prediction is needed at each step, for example a tag for every word, a normal linear layer is placed on top of each hidden state: y<sub>t</sub> = W<sub>hy</sub>·h<sub>t</sub>. For a single prediction about the whole review, the linear layer goes on the last hidden state only. Section 07 looks at these task shapes.</p>

  <h2 id="dr-bptt"><span class="num">03</span>Backpropagation Through Time</h2>
  <p>We picked W<sub>xh</sub> and W<sub>hh</sub> by hand, but a real RNN must learn them with gradient descent, which needs the gradient of the loss with respect to each weight. <a class="xref" data-note="dl_backprop">Loss &amp; Backpropagation</a> showed how to get gradients in a feed-forward network, layer by layer. The new difficulty is that an RNN uses the same W<sub>hh</sub> at step 1, step 2 and step 3. Which step does its gradient come from?</p>
  <p>The answer becomes simple once you look at the unrolled picture. Unrolled over three words, the RNN is just a three-layer feed-forward network whose layers happen to share their weights. So we run ordinary backpropagation on the unrolled network. Every place where a shared weight was used produces one piece of gradient, and because the weight is the same at each place, the pieces are <strong>added up</strong>. This is called <strong>backpropagation through time</strong>, or <strong>BPTT</strong>: unroll the RNN over the sequence, backpropagate through the unrolled graph, and sum each shared weight's gradient over all time steps.</p>
  <p>Think of a shop whose cash is ₹500 short at the end of the month. The owner walks back through the daily register, day 30, day 29, and so on, asking how much each day's entries pushed the final total off. The same cashier worked every day, so his total share of the blame is the sum of his share on each day. The cashier is the shared weight.</p>
  <p>To follow every number, shrink the RNN to a single hidden number: h<sub>t</sub> = tanh(w·h<sub>t−1</sub> + u·x<sub>t</sub>), with w = 0.5 and u = 1. Squeeze each word of the review into one number too: chai = 1, not = 0.5, good = −1. To keep the arithmetic short, let the "loss" simply be h<sub>3</sub>. The forward pass gives h<sub>1</sub> = tanh(1) = 0.762, h<sub>2</sub> = tanh(0.5·0.762 + 0.5) = 0.707 and h<sub>3</sub> = tanh(0.5·0.707 − 1) = −0.569. Going backward, the chain rule says that to pass the gradient from h<sub>t</sub> back to h<sub>t−1</sub> we multiply by the derivative of tanh, which is 1 − h<sub>t</sub>², and by w. So every step back multiplies the gradient by <strong>w·(1 − h<sub>t</sub>²)</strong>. From h<sub>3</sub> to h<sub>2</sub> that is 0.5 × (1 − 0.324) = 0.338. From h<sub>2</sub> to h<sub>1</sub> it is 0.5 × (1 − 0.5) = 0.25, so the gradient reaching h<sub>1</sub> is 0.338 × 0.25 = 0.085.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
<defs><marker id="dr-ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
<marker id="dr-ar5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr" fill="currentColor"/></marker></defs>
<g text-anchor="middle">
<circle cx="75" cy="55" r="26" style="fill:var(--bg)"/><circle cx="75" cy="55" r="26" class="fb sb"/><text x="75" y="52">h₀</text><text x="75" y="67" class="tm">0</text>
<circle cx="225" cy="55" r="26" style="fill:var(--bg)"/><circle cx="225" cy="55" r="26" class="fb sb"/><text x="225" y="52">h₁</text><text x="225" y="67" class="tm">0.762</text>
<circle cx="375" cy="55" r="26" style="fill:var(--bg)"/><circle cx="375" cy="55" r="26" class="fb sb"/><text x="375" y="52">h₂</text><text x="375" y="67" class="tm">0.707</text>
<circle cx="525" cy="55" r="26" style="fill:var(--bg)"/><circle cx="525" cy="55" r="26" class="fr sr"/><text x="525" y="52">h₃</text><text x="525" y="67" class="tm">−0.569</text>
<text x="150" y="40" class="tm">forward</text>
<text x="450" y="128" class="tr">× 0.338</text><text x="300" y="128" class="tr">× 0.25</text>
<text x="300" y="160" class="tr">gradient reaching h₁ = 0.338 × 0.25 = 0.085</text>
</g>
<g stroke="currentColor" marker-end="url(#dr-ar4)"><line x1="101" y1="55" x2="197" y2="55"/><line x1="251" y1="55" x2="347" y2="55"/><line x1="401" y1="55" x2="497" y2="55"/></g>
<g fill="none" class="sr" stroke-width="1.6" marker-end="url(#dr-ar5)"><path d="M520,82 Q450,120 382,84"/><path d="M370,82 Q300,120 232,84"/></g>
</svg><figcaption>Forward (black), the memory flows right. Backward (red), the gradient flows left and is multiplied by w·(1 − h²) at every step, so it is already down to 0.085 after two steps.</figcaption></figure>
  <p>The code does the backward pass by hand, walking from step 3 back to step 1. At each step it records how much w contributed there (the gradient arriving at that step, times the h<sub>t−1</sub> that w multiplied), and then checks the sum against PyTorch's autograd:</p>
  <div class="fx" data-lang="py">import numpy as np, torch
w, u = 0.5, 1.0
xs = [1.0, 0.5, -1.0]                       # chai, not, good squeezed to one number each
hs = [0.0]                                  # forward pass, keeping every h (BPTT needs them)
for x in xs:
    hs.append(np.tanh(w * hs[-1] + u * x))
print("h:", np.round(hs, 3))

parts, carry = [], 1.0                      # carry = dh3/dh_t while walking backwards
for t in (3, 2, 1):
    carry_a = carry * (1 - hs[t] ** 2)      # through tanh: slope 1 - h^2
    parts.append(carry_a * hs[t - 1])       # w was used here, multiplied by h_(t-1)
    carry = carry_a * w                     # one step further back
    print(f"t={t}: gradient reaching h_{t-1} = {carry:.3f}")
print("parts of dh3/dw (t=3,2,1):", np.round(parts, 3), " sum =", round(sum(parts), 4))

wt = torch.tensor(w, requires_grad=True)    # the same thing with autograd
h = torch.tensor(0.0)
for x in xs:
    h = torch.tanh(wt * h + u * x)
h.backward()
print("autograd dh3/dw =", round(wt.grad.item(), 4))</div>
  <div class="fx" data-lang="text">h: [ 0.     0.762  0.707 -0.569]
t=3: gradient reaching h_2 = 0.338
t=2: gradient reaching h_1 = 0.085
t=1: gradient reaching h_0 = 0.018
parts of dh3/dw (t=3,2,1): [0.478 0.129 0.   ]  sum = 0.6065
autograd dh3/dw = 0.6065</div>
  <p>The lines "gradient reaching h_2 = 0.338" and "h_1 = 0.085" are the two factors from the hand calculation. The three pieces of ∂h<sub>3</sub>/∂w, one per step, are 0.478, 0.129 and 0, and their sum, 0.6065, is exactly what autograd computes: the gradient of a shared weight is the sum over time steps. (The step-1 piece is 0 only because h<sub>0</sub> = 0, so w had nothing to multiply there.) Notice also that the forward loop keeps every hidden state in the list <code>hs</code>, because the backward pass needs them. That is why training an RNN uses memory proportional to the sequence length.</p>
  <p>For a very long stream, such as a whole book or months of sensor data, unrolling everything is too expensive. <strong>Truncated BPTT</strong> cuts the stream into chunks of, say, 50 steps. The hidden state is still carried forward from chunk to chunk so the memory continues, but backpropagation stops at the chunk boundary. In PyTorch this is done by calling <code>h = h.detach()</code> before each chunk, which keeps the numbers in h but cuts the link to the earlier computation. Section 11 shows what happens if you forget it.</p>

  <h2 id="dr-vg"><span class="num">04</span>Vanishing and Exploding Gradients</h2>
  <p>In the last section, after only two steps back the gradient was 0.085 of its original size, because we multiplied by a factor below 1 twice. Now imagine a review of 60 words where the important word is near the start. The gradient that tells step 1 how to change must pass back through 59 such multiplications. If the factors are mostly below 1, the product shrinks towards zero; this is the <strong>vanishing gradient</strong> problem. If they are mostly above 1, the product blows up; this is the <strong>exploding gradient</strong> problem. Either way, the early steps of a long sequence cannot learn properly.</p>
  <p>It is like a message whispered from person to person down a 60-seat train coach: by the last seat, the first person's words have faded to nothing. The opposite is a rumour that every person exaggerates a little, so "a small argument" becomes "a riot" by seat 60. The plain arithmetic of repeated multiplication shows how fast both happen:</p>
  <div class="fx" data-lang="py">for factor in (0.5, 0.9, 1.0, 1.1, 1.5):
    print(f"factor {factor}:  after 10 steps {factor**10:9.3g}   after 60 steps {factor**60:9.3g}")</div>
  <div class="fx" data-lang="text">factor 0.5:  after 10 steps  0.000977   after 60 steps  8.67e-19
factor 0.9:  after 10 steps     0.349   after 60 steps    0.0018
factor 1.0:  after 10 steps         1   after 60 steps         1
factor 1.1:  after 10 steps      2.59   after 60 steps       304
factor 1.5:  after 10 steps      57.7   after 60 steps  3.68e+10</div>
  <p>Only a factor of exactly 1 survives 60 steps. Even 0.9, which looks harmless, leaves 0.2% after 60 steps, and 1.1 grows 300-fold. In a real RNN the per-step factor is a matrix, W<sub>hh</sub>ᵀ multiplied by the tanh slopes (1 − h²), rather than one number. The tanh slope is never more than 1, which pushes the product further towards vanishing. When W<sub>hh</sub> stretches vectors by more than 1 (its largest stretch factor, the spectral radius, is above 1) the product can explode instead.</p>
  <p>Here is the effect measured on a real PyTorch RNN with 32 hidden units. We feed it a random 60-step sequence, make the loss depend only on the <em>last</em> output, and ask how large the gradient of that loss is with respect to each input step. A large number means that step can still influence the loss, and so can still learn from it:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
T, H = 60, 32
rnn = nn.RNN(8, H, batch_first=True)
x = torch.randn(1, T, 8, requires_grad=True)      # one random 60-step sequence
out, _ = rnn(x)
out[0, -1].sum().backward()                       # a loss that depends on the LAST step only
g = x.grad[0].norm(dim=1)                         # how much each input step affects that loss
for t in (60, 50, 40, 20, 1):
    print(f"step {t:2d}: {g[t - 1]:.0e}")</div>
  <div class="fx" data-lang="text">step 60: 2e+00
step 50: 4e-03
step 40: 7e-06
step 20: 2e-11
step  1: 6e-17</div>
  <p>Read the numbers from the end backwards. The last step has a gradient of about 2, ten steps earlier it is 0.004, and at step 1 it is 6×10⁻¹⁷, which for training purposes is zero. Whatever happened at step 1 cannot be learned from a loss at step 60. The line <code>out[0, -1].sum().backward()</code> makes the loss depend on the last step only, and <code>x.grad[0].norm(dim=1)</code> measures each input step's share of the gradient. This is the real reason plain RNNs struggle with long-range dependencies such as "not" at word 2 deciding the meaning of word 50.</p>
  <p>Exploding gradients are the easier half to fix. If the gradient's overall length (its norm) is huge, we scale the whole gradient down to a chosen maximum length before the optimizer step. The direction stays the same; only the size is capped. This is called <strong>gradient clipping</strong>:</p>
  <div class="fx" data-lang="py">torch.manual_seed(1)
big = nn.RNN(8, 32, batch_first=True)
with torch.no_grad():
    big.weight_hh_l0.mul_(8.0)                     # make W_hh far too large
out, _ = big(torch.randn(4, 60, 8))
(out ** 2).sum().backward()                        # any loss
before = nn.utils.clip_grad_norm_(big.parameters(), max_norm=1.0)
after = torch.sqrt(sum((p.grad ** 2).sum() for p in big.parameters()))
print(f"gradient norm before clipping {before:.2e}   after {after:.2f}")</div>
  <div class="fx" data-lang="text">gradient norm before clipping 2.59e+11   after 1.00</div>
  <p>We deliberately made W<sub>hh</sub> eight times too large, and the gradient norm came out at 2.6×10¹¹, big enough to wreck every weight in one update. <code>clip_grad_norm_</code> returns the norm it found and rescales the gradients in place so the new norm is exactly 1.0. In a training loop it goes between <code>loss.backward()</code> and <code>optimizer.step()</code>, and almost every RNN training script uses it.</p>
  <p>Vanishing gradients have no such fix. You can cap a huge number, but you cannot recover a signal that has already shrunk to 10⁻¹⁷. The same problem appears in very deep feed-forward networks (see <a class="xref" data-note="dl_training">Training Well</a>); an RNN unrolled over 60 words simply <em>is</em> a 60-layer network that reuses one weight matrix, which makes it worse. The cure has to be a different design for the memory itself, one where information and its gradient can pass many steps without being squashed at each one. That design is the LSTM.</p>

  <h2 id="dr-lstm"><span class="num">05</span>LSTM: A Memory With Gates</h2>
  <p>The plain RNN rewrites its entire memory at every step by pushing it through a matrix multiply and a tanh, and that repeated rewriting is what makes old information, and its gradient, fade. The <strong>LSTM</strong>, short for long short-term memory (Hochreiter and Schmidhuber, 1997), adds a second memory line called the <strong>cell state</strong>, written c, which is changed only by gentle edits: erase a little, add a little. What to erase, what to add and what to show are decided by three <strong>gates</strong>. A gate is simply a number between 0 and 1, produced by a sigmoid function, that is multiplied into a signal: 0 means "block everything" and 1 means "let everything through".</p>
  <p>Think of a shopkeeper's credit register, the book where she notes what each regular customer owes. Each evening she makes three decisions: which old entries to strike off (the forget gate), which new entries to write in (the input gate), and which entries to read out when a customer asks (the output gate). Most entries are simply left alone from day to day. A plain RNN, by contrast, would copy the whole register onto a fresh page every evening, making small copying errors each time, until after a few weeks the oldest entries are unreadable.</p>
  <figure class="viz"><svg viewBox="0 0 600 270" width="600">
<defs><marker id="dr-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="70" y="25" width="450" height="200" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="20" y1="50" x2="575" y2="50" class="sg" stroke-width="3" marker-end="url(#dr-ar2)"/>
<text x="20" y="40" class="tg">c(t−1)</text><text x="545" y="40" class="tg">c(t)</text>
<text x="300" y="40" text-anchor="middle" class="tm">cell state: the conveyor belt</text>
<circle cx="170" cy="50" r="12" style="fill:var(--bg)"/><circle cx="170" cy="50" r="12" class="fs" stroke="currentColor"/><text x="170" y="55" text-anchor="middle">×</text>
<circle cx="300" cy="50" r="12" style="fill:var(--bg)"/><circle cx="300" cy="50" r="12" class="fs" stroke="currentColor"/><text x="300" y="55" text-anchor="middle">+</text>
<circle cx="300" cy="110" r="12" style="fill:var(--bg)"/><circle cx="300" cy="110" r="12" class="fs" stroke="currentColor"/><text x="300" y="115" text-anchor="middle">×</text>
<rect x="440" y="95" width="50" height="26" rx="5" class="ft st"/><text x="465" y="113" text-anchor="middle">tanh</text>
<circle cx="465" cy="160" r="12" style="fill:var(--bg)"/><circle cx="465" cy="160" r="12" class="fs" stroke="currentColor"/><text x="465" y="165" text-anchor="middle">×</text>
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
</svg><figcaption>One LSTM step. The green line along the top is the cell state. The forget gate f multiplies it (erase), the input gate i times the candidate c̃ is added to it (write), and the output gate o decides how much of tanh(c) leaves as the hidden state h. All four boxes read the same two inputs, h(t−1) and x(t).</figcaption></figure>
  <p>Walk through the figure from left to right. All four boxes at the bottom look at the same two things, the previous hidden state h<sub>t−1</sub> and the current input x<sub>t</sub>, each through its own weights. Three of them use a sigmoid σ, which maps any number into 0…1, so they are gates. The fourth uses tanh, which maps into −1…1, and produces the <strong>candidate</strong> c̃, the new information that might be written. On the belt, the old cell state is first multiplied by the forget gate, then the input gate times the candidate is added. Finally the output gate decides how much of the (squashed) cell state to expose as the new hidden state. The symbol ⊙ below means element-by-element multiplication.</p>
  <table class="tbl">
    <tr><th>Piece</th><th>Equation</th><th>In plain words</th></tr>
    <tr><td>Forget gate</td><td>f = σ(W<sub>f</sub>[h<sub>t−1</sub>, x<sub>t</sub>] + b<sub>f</sub>)</td><td>how much old memory to keep (1 = all of it)</td></tr>
    <tr><td>Input gate</td><td>i = σ(W<sub>i</sub>[h<sub>t−1</sub>, x<sub>t</sub>] + b<sub>i</sub>)</td><td>how much of the new information to write</td></tr>
    <tr><td>Candidate</td><td>c̃ = tanh(W<sub>c</sub>[h<sub>t−1</sub>, x<sub>t</sub>] + b<sub>c</sub>)</td><td>what the new information is</td></tr>
    <tr><td>Cell update</td><td><strong>c<sub>t</sub> = f ⊙ c<sub>t−1</sub> + i ⊙ c̃</strong></td><td>erase a little, add a little</td></tr>
    <tr><td>Output</td><td>o = σ(W<sub>o</sub>[h<sub>t−1</sub>, x<sub>t</sub>] + b<sub>o</sub>); <strong>h<sub>t</sub> = o ⊙ tanh(c<sub>t</sub>)</strong></td><td>what to reveal at this step</td></tr>
  </table>
  <p>Let us push "chai" through one LSTM step by hand. To keep each gate a single number, the hidden state and cell state have size 1, so each gate has one weight on h, two weights on x (because our word vectors have two numbers) and a bias. The forget gate has weights 0.5 and [0.2, −0.4] and bias 1; the input gate 0.3, [0.6, 0.4], bias 0; the candidate −0.2, [0.9, −0.7], bias 0; the output gate 0.4, [0.1, 0.5], bias 0. We start with h = 0 and c = 0, and x = chai = [1, 0]. The forget gate's inside is 0 + 0.2 + 1 = 1.2, so f = σ(1.2) = 0.769. The input gate gives σ(0.6) = 0.646, the candidate tanh(0.9) = 0.716, and the output gate σ(0.1) = 0.525. The new cell state is c<sub>1</sub> = 0.769·0 + 0.646·0.716 = 0.462, and the new hidden state is h<sub>1</sub> = 0.525·tanh(0.462) = 0.525·0.432 = 0.227. The code repeats this for all three words and then loads the same weights into PyTorch's <code>nn.LSTM</code>:</p>
  <div class="fx" data-lang="py"># each gate: (weight on h_prev, weights on x, bias)
W = {"f": (0.5,  np.array([0.2, -0.4]), 1.0),    # forget gate (bias 1: starts by keeping)
     "i": (0.3,  np.array([0.6,  0.4]), 0.0),    # input gate
     "g": (-0.2, np.array([0.9, -0.7]), 0.0),    # candidate c~
     "o": (0.4,  np.array([0.1,  0.5]), 0.0)}    # output gate
def pre(k, h, x):
    wh, wx, bias = W[k]
    return wh * h + wx @ x + bias

h, c = 0.0, 0.0
for t, word in enumerate(["chai", "not", "good"], 1):
    x = emb[word]
    f, i = sigmoid(pre("f", h, x)), sigmoid(pre("i", h, x))
    g, o = np.tanh(pre("g", h, x)), sigmoid(pre("o", h, x))
    c = f * c + i * g                  # erase a little, write a little
    h = o * np.tanh(c)                 # show part of the memory
    print(f"t={t} {word:5s} f={f:.3f} i={i:.3f} c~={g:+.3f} o={o:.3f} -&gt; c={c:+.3f} h={h:+.3f}")

lstm = nn.LSTM(2, 1, batch_first=True)           # PyTorch with the same weights
order = ["i", "f", "g", "o"]                     # PyTorch's gate order
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
  <p>Row 1 is our hand calculation. At step 2, "not" produces a negative candidate, −0.632. The forget gate keeps 67% of the old +0.462 and the input gate writes 61.5% of the new −0.632, so the cell state swings to −0.078: the memory has registered the negation. The two lines that define an LSTM are <code>c = f * c + i * g</code> and <code>h = o * np.tanh(c)</code>, and PyTorch prints the same hidden states, so its LSTM is exactly this formula. Note the list <code>order</code>: PyTorch stores the four weight blocks stacked in the order input, forget, cell candidate (which it calls g), output. That matters whenever you load or initialise weights by hand.</p>
  <p>Why does this cure vanishing gradients? Look again at the cell update, c<sub>t</sub> = f ⊙ c<sub>t−1</sub> + i ⊙ c̃. Going back one step along the belt, the gradient is multiplied by f, a plain number per dimension that the network itself controls, instead of by a weight matrix and a tanh slope. If the network learns f ≈ 1 for something worth remembering, the value and its gradient pass almost unchanged. Compare storing one value for 50 steps in each kind of memory:</p>
  <div class="fx" data-lang="py">import numpy as np
h_rnn, c_lstm = 1.0, 1.0                 # store the value 1.0 and carry it for 50 steps
for step in range(50):
    h_rnn = np.tanh(0.9 * h_rnn)         # plain RNN: multiply and squash every step
    c_lstm = 0.99 * c_lstm + 0.0         # LSTM cell: forget gate 0.99, input gate 0
print(f"after 50 steps  RNN memory {h_rnn:.4f}   LSTM cell {c_lstm:.4f}")</div>
  <div class="fx" data-lang="text">after 50 steps  RNN memory 0.0026   LSTM cell 0.6050</div>
  <p>The plain RNN keeps 0.26% of the value; the LSTM cell with a forget gate of 0.99 keeps 60%. The additive update turns the cell state into a "gradient highway", the same idea as the "+x" skip connection in ResNet (see <a class="xref" data-note="dl_cnns">CNNs</a>), which lets gradients flow through very deep networks.</p>
  <p>There is a catch, and it is worth knowing for interviews. An LSTM is not long-memory automatically. With PyTorch's default initialisation the forget gate starts around 0.5, which still halves the signal at every step. The fix is to start the forget-gate bias at a positive value, commonly 1 and sometimes up to 3, so that at the start of training the gate is "open" and memory is kept by default. The experiment from section 04, repeated with an LSTM and with an LSTM whose forget bias is 3:</p>
  <div class="fx" data-lang="py">T, H = 60, 32
def influence(make, forget_bias=None):
    torch.manual_seed(0)
    cell = make(8, H, batch_first=True)
    if forget_bias is not None:
        with torch.no_grad():                    # PyTorch gate order: input, forget, cell, output
            cell.bias_ih_l0[H:2*H].fill_(forget_bias)
    x = torch.randn(1, T, 8, requires_grad=True)
    out, _ = cell(x)
    out[0, -1].sum().backward()
    g = x.grad[0].norm(dim=1)
    return "  ".join(f"t={t}: {g[t - 1]:.0e}" for t in (60, 50, 40, 20, 1))

print("RNN            ", influence(nn.RNN))
print("LSTM           ", influence(nn.LSTM))
print("LSTM f-bias = 3", influence(nn.LSTM, forget_bias=3.0))</div>
  <div class="fx" data-lang="text">RNN             t=60: 2e+00  t=50: 4e-03  t=40: 7e-06  t=20: 2e-11  t=1: 6e-17
LSTM            t=60: 4e-01  t=50: 9e-04  t=40: 7e-06  t=20: 2e-09  t=1: 4e-13
LSTM f-bias = 3 t=60: 2e-01  t=50: 7e-02  t=40: 7e-02  t=20: 4e-02  t=1: 5e-02</div>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600">
<g stroke="currentColor" stroke-opacity="0.25"><line x1="60" y1="29" x2="560" y2="29"/><line x1="60" y1="67" x2="560" y2="67"/><line x1="60" y1="105" x2="560" y2="105"/><line x1="60" y1="143" x2="560" y2="143"/><line x1="60" y1="181" x2="560" y2="181"/></g>
<line x1="60" y1="190" x2="560" y2="190" stroke="currentColor"/>
<g class="tm" text-anchor="end"><text x="54" y="33">1</text><text x="54" y="71">1e-4</text><text x="54" y="109">1e-8</text><text x="54" y="147">1e-12</text><text x="54" y="185">1e-16</text></g>
<g class="tm" text-anchor="middle"><text x="60" y="206">t=1</text><text x="221" y="206">20</text><text x="391" y="206">40</text><text x="475" y="206">50</text><text x="560" y="206">60</text></g>
<text x="310" y="228" text-anchor="middle" class="tm">input step t (the loss is computed at step 60)</text>
<polyline points="60,183 221,131 391,78 475,52 560,26" fill="none" class="sr" stroke-width="2.5"/>
<polyline points="60,147 221,112 391,78 475,58 560,33" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-width="2"/>
<polyline points="60,41 221,42 391,40 475,40 560,36" fill="none" class="sg" stroke-width="2.5"/>
<text x="230" y="160" class="tr">plain RNN</text>
<text x="80" y="125">LSTM, default init</text>
<text x="120" y="62" class="tg">LSTM, forget bias = 3</text>
</svg><figcaption>Size of the gradient reaching each input step (log scale), from the run above. The plain RNN (red) and the default LSTM (dashed) both fall off steeply; the LSTM with a forget bias of 3 (green) stays almost flat, so step 1 can still learn.</figcaption></figure>
  <p>The default LSTM is a little better than the plain RNN but still down to 4×10⁻¹³ at step 1. With the forget bias at 3 the gate starts near σ(3) = 0.95, and step 1 keeps a gradient of 0.05, eleven orders of magnitude more. During training the network can then learn to close the gate wherever forgetting is useful.</p>
  <p>Gates cost parameters. Each gate and the candidate has its own full weight block, so an LSTM layer has four times the weights of a plain RNN layer of the same size. Here are the three layer types at a realistic size, 128 input features and 256 hidden units, on a batch of 32 sequences of 50 steps:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
x = torch.randn(32, 50, 128)                     # (batch, seq_len, features)
count = lambda m: sum(p.numel() for p in m.parameters())
for name, layer in [("RNN", nn.RNN(128, 256, batch_first=True)),
                    ("GRU", nn.GRU(128, 256, batch_first=True)),
                    ("LSTM", nn.LSTM(128, 256, batch_first=True))]:
    out, state = layer(x)
    h_n = state[0] if name == "LSTM" else state   # the LSTM returns a pair (h_n, c_n)
    print(f"{name:4s} params {count(layer):&gt;7,}  out {tuple(out.shape)}  h_n {tuple(h_n.shape)}")</div>
  <div class="fx" data-lang="text">RNN  params  98,816  out (32, 50, 256)  h_n (1, 32, 256)
GRU  params 296,448  out (32, 50, 256)  h_n (1, 32, 256)
LSTM params 395,264  out (32, 50, 256)  h_n (1, 32, 256)</div>
  <p>One plain RNN block has 256·128 (W<sub>xh</sub>) + 256·256 (W<sub>hh</sub>) + 2·256 (PyTorch's two biases) = 98,816 weights. The LSTM has four such blocks, 395,264, and the GRU of the next section has three. All three return <code>out</code> of shape (32, 50, 256), one hidden state per step, and <code>h_n</code> of shape (layers × directions, batch, hidden). Only the LSTM returns a pair, <code>(h_n, c_n)</code>, because it carries the cell state as well.</p>

  <h2 id="dr-gru"><span class="num">06</span>GRU: The Lighter Gated Cell</h2>
  <p>The LSTM remembers well, but it carries two state vectors and four weight blocks, which makes it slower and more data-hungry. The <strong>GRU</strong>, or gated recurrent unit (Cho et al., 2014), keeps the "edit, don't rewrite" idea with less machinery. It has only one state, h, and two gates. The <strong>update gate</strong> z decides how much of the old memory to replace with new content: keep (1 − z) of the old, take z of the new. The <strong>reset gate</strong> r decides how much of the old memory the new content is allowed to look at when it is being built.</p>
  <p>Think of updating a friend's entry in your phone's contacts after they move city. The update dial says how much of the old entry to overwrite: z = 0 keeps it all, z = 1 replaces it all. The reset dial says whether to look at the old entry at all while writing the new one; for a completely new topic you would ignore it (r near 0).</p>
  <p>In equations: z = σ(W<sub>z</sub>[h<sub>t−1</sub>, x<sub>t</sub>]), r = σ(W<sub>r</sub>[h<sub>t−1</sub>, x<sub>t</sub>]), the candidate h̃ = tanh(W[r ⊙ h<sub>t−1</sub>, x<sub>t</sub>]), and the new state <strong>h<sub>t</sub> = (1 − z) ⊙ h<sub>t−1</sub> + z ⊙ h̃</strong>. With the hand-picked weights in the code (update gate: weight 0.4 on h, [0.5, 0.3] on x, bias −0.5; reset gate: −0.3, [0.2, 0.7], bias 0; candidate: 0.8, [0.9, −0.6], bias 0) step 1 works out as follows. With h<sub>0</sub> = 0 and x = chai = [1, 0], z = σ(0.5 − 0.5) = σ(0) = 0.5 and r = σ(0.2) = 0.550. The candidate is tanh(0.8·(0.55·0) + 0.9) = tanh(0.9) = 0.716. So h<sub>1</sub> = (1 − 0.5)·0 + 0.5·0.716 = 0.358, half old memory (which was empty) and half new.</p>
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
  <p>Step 1 matches the hand calculation. At step 2 the candidate for "not" is −0.393 and z is about 0.49, so the new state is roughly the average of +0.358 and −0.393, which is close to 0. The line <code>h = (1 - z) * h + z * h_new</code> is the whole GRU: a blend between old and new. When z is near 0 the old memory passes through untouched, which plays the same role as an LSTM forget gate near 1, so the GRU gets the same gradient-highway benefit.</p>
  <table class="tbl">
    <tr><th></th><th>LSTM</th><th>GRU</th></tr>
    <tr><td>State</td><td>hidden state h and a separate cell state c</td><td>hidden state h only</td></tr>
    <tr><td>Gates</td><td>3 (forget, input, output)</td><td>2 (update, reset)</td></tr>
    <tr><td>Weight blocks</td><td>4</td><td>3</td></tr>
    <tr><td>Parameters, 128 → 256</td><td>395,264</td><td>296,448 (25% fewer)</td></tr>
    <tr><td>Speed</td><td>slower</td><td>faster</td></tr>
    <tr><td>Good first choice when</td><td>sequences are very long, memory must be controlled finely</td><td>data is small or compute is tight</td></tr>
  </table>
  <p>In published comparisons neither cell wins consistently. A practical rule is to start with a GRU because it trains faster, and try an LSTM if the task needs very long memory. One detail trips people up: papers and libraries write the GRU two ways. PyTorch's documentation uses h<sub>t</sub> = (1 − z) ⊙ n + z ⊙ h<sub>t−1</sub>, so its z means "keep the old", the opposite of the formula above, and it applies r after the matrix multiply on h. Both versions are equally powerful; just do not copy weights between conventions without flipping.</p>

  <h2 id="dr-tasks"><span class="num">07</span>Sequence Tasks and Bidirectional RNNs</h2>
  <p>An RNN gives you a hidden state at every step. What you do with those states depends on the shape of the task, and interviewers like to ask about the three common shapes. In a <strong>many-to-one</strong> task the whole sequence gets one label, such as "is this review unhappy?"; you put a classifier on the last hidden state (or on an average of all of them). In a <strong>many-to-many aligned</strong> task every input step gets its own label, such as tagging each word as a dish name or not (named-entity recognition) or as a noun or verb (part-of-speech tagging); you put the same classifier on every hidden state. In a <strong>sequence-to-sequence</strong> task the output is a new sequence with its own length and order, such as a translation; that needs two RNNs and gets its own section next.</p>
  <p>For aligned tasks a one-direction RNN has a blind spot. At step t it has read only words 1 to t. When it reaches "not" it has no idea whether "good", "bad" or "cold" follows, and when it reads "chai" it does not know the review is about to turn negative. In "Bank of England announced…", the word that tells you "Bank" is the central bank arrives after it. A <strong>bidirectional RNN</strong> fixes this by running two separate RNNs over the same sequence, one left to right and one right to left, and joining (concatenating) their two hidden states at each position. Every position then has a summary of what came before it and of what comes after it.</p>
  <p>It is how you fill in a blank in an exam question: "The ____ was so spicy I drank three glasses of water." You read the whole sentence, including the part after the blank, before writing "biryani". Here is our review through a bidirectional RNN. The forward direction is our RNN from section 02; the backward direction has its own weights and reads "good, not, chai", and its states are then flipped back so they line up with the words:</p>
  <div class="fx" data-lang="py">def run_rnn(words, Wxh, Whh, b):
    h, states = np.zeros(2), []
    for w in words:
        h = np.tanh(Wxh @ emb[w] + Whh @ h + b)
        states.append(h)
    return states

fwd_W = (Wxh, Whh, b)                                         # the RNN from before
bwd_W = (np.array([[-0.2, 0.7], [0.6, 0.1]]), np.array([[0.3, -0.1], [0.2, 0.5]]), np.zeros(2))
words = ["chai", "not", "good"]
fwd = run_rnn(words, *fwd_W)                    # reads chai, not, good
bwd = run_rnn(words[::-1], *bwd_W)[::-1]        # reads good, not, chai; then re-aligned
for w, f, bk in zip(words, fwd, bwd):
    print(f"{w:5s} fwd={f.round(2)}  bwd={bk.round(2)}  joined={np.concatenate([f, bk]).round(2)}")</div>
  <div class="fx" data-lang="text">chai  fwd=[0.46 0.38]  bwd=[-0.05  0.74]  joined=[ 0.46  0.38 -0.05  0.74]
not   fwd=[-0.23  0.76]  bwd=[0.65 0.46]  joined=[-0.23  0.76  0.65  0.46]
good  fwd=[0.06 0.94]  bwd=[0.46 0.6 ]  joined=[0.06 0.94 0.46 0.6 ]</div>
  <p>Look at the "chai" row. Its forward state has seen only "chai" (it is h<sub>1</sub> from section 02). Its backward state was the last one computed in the right-to-left pass, so it has already read "good" and "not". The joined vector has 4 numbers: a bidirectional layer doubles the size of its output. The two <code>[::-1]</code> slices do the work: the first reverses the words for the backward RNN, the second reverses its states so that row 1 belongs to "chai" again.</p>
  <p>In PyTorch it is a single flag. Here is a 2-layer bidirectional LSTM on a batch of 32 sequences of 50 steps with 128 features each:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
x = torch.randn(32, 50, 128)                     # (batch, seq_len, features)
bi = nn.LSTM(128, 128, num_layers=2, batch_first=True, bidirectional=True)
out, (h_n, c_n) = bi(x)
print("out", tuple(out.shape), "  h_n", tuple(h_n.shape))
sentence_vec = torch.cat([h_n[-2], h_n[-1]], dim=1)   # top layer: last forward + last backward
print("classifier input", tuple(sentence_vec.shape))</div>
  <div class="fx" data-lang="text">out (32, 50, 256)   h_n (4, 32, 128)
classifier input (32, 256)</div>
  <p><code>out</code> has 256 features per step, 128 from the forward direction and 128 from the backward one. <code>h_n</code> has 4 rows, one for each (layer, direction) pair, ordered layer 0 forward, layer 0 backward, layer 1 forward, layer 1 backward. So <code>h_n[-2]</code> and <code>h_n[-1]</code> are the top layer's final forward and backward states, and joining them gives the usual sentence vector for a classifier.</p>
  <p>The limit of a bidirectional RNN follows directly from how it works: it needs the whole sequence before it can produce anything. That is fine for classifying a finished review, tagging a sentence or encoding a sentence for translation. It is impossible for live speech recognition, real-time forecasting or generating text, where the future does not exist yet. Using one there anyway is a form of data leakage: the model trains and validates beautifully because it peeks at the future, then cannot run in production.</p>

  <h2 id="dr-s2s"><span class="num">08</span>Seq2seq and Its Bottleneck</h2>
  <p>The app also wants to show reviews in Hindi: "chai not good" should become "chai achhi nahi hai". The output has a different length (four words instead of three) and a different word order (the negation "nahi" moves near the end), so a label per input word cannot do it. The <strong>sequence-to-sequence</strong> model, or <strong>seq2seq</strong> (Sutskever et al., 2014), solves this with two RNNs. The <strong>encoder</strong> reads the whole input, and its final hidden state becomes a single vector called the <strong>context vector</strong>. The <strong>decoder</strong> starts from that vector and writes the output one token at a time, feeding each token it has written back in as its next input, until it writes a special end token. Generating one token at a time from your own previous outputs like this is called <strong>autoregressive</strong> generation.</p>
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
<text x="310" y="190" text-anchor="middle" class="tm">each decoder input is the previous target word; to write "nahi" the decoder must still find "not" inside c</text>
</svg><figcaption>Seq2seq: the encoder (blue) reads the review, everything it learned passes through the single red context vector c, and the decoder (teal) writes the Hindi words one at a time, starting from a start symbol &lt;s&gt;.</figcaption></figure>
  <p>Follow the figure from left to right. The encoder reads "chai", "not", "good" and hands over only its last hidden state c (with the toy RNN of section 02 that would be h<sub>3</sub> = [0.057, 0.938]). The decoder starts from c, reads a start symbol and writes "chai", reads "chai" and writes "achhi", and so on. By the time it must write "nahi", the only place "not" can still exist is somewhere inside c.</p>
  <p>During training, what should the decoder receive as its input at each step? Early in training its own guesses are rubbish, and a single wrong word would derail every later step. So we feed it the <strong>true</strong> previous word from the target instead of its own guess. This is called <strong>teacher forcing</strong>. The page uses a toy task that is easy to generate and score: "reverse a list of digits". The helper builds one training example and shows the three tensors involved:</p>
  <div class="fx" data-lang="py">import torch
torch.manual_seed(0)
V, BOS = 12, 1                                  # tokens 2..11 are digits, 1 = start symbol
def batch(n, L):
    src = torch.randint(2, V, (n, L))
    tgt = src.flip(1)                           # the task: reverse the sequence
    dec_in = torch.cat([torch.full((n, 1), BOS), tgt[:, :-1]], 1)   # BOS + target shifted right
    return src, dec_in, tgt

src, dec_in, tgt = batch(1, 5)
print("source       ", src[0].tolist())
print("target       ", tgt[0].tolist())
print("decoder input", dec_in[0].tolist())</div>
  <div class="fx" data-lang="text">source        [6, 11, 5, 2, 5]
target        [5, 2, 5, 11, 6]
decoder input [1, 5, 2, 5, 11]</div>
  <p>The decoder input is the target shifted right by one place, with the start symbol (1, often called BOS for "beginning of sequence") in front. At decoder step 2 it sees 5, the true first answer, and must predict 2. The slice <code>tgt[:, :-1]</code> drops the last target token because nothing is predicted after it. Teacher forcing makes training fast and stable, but it creates a mismatch called <strong>exposure bias</strong>: at test time the decoder sees its own, possibly wrong, previous outputs, a situation it never practised. Scheduled sampling, which gradually mixes the model's own guesses into training, is one remedy.</p>
  <p>Seq2seq has a deeper weakness, visible in the red box of the figure. However long the input is, everything the decoder will ever know about it must fit into one fixed-size vector. This is the <strong>bottleneck</strong>. Think of a translator who must listen to a whole paragraph once, close the file, and then translate entirely from memory: a short phrase comes out fine, a long paragraph comes out with pieces missing. We can measure it. A GRU encoder-decoder with a 64-number hidden state is trained to reverse random digit lists of length 4 to 20 for 800 steps, then tested on fresh lists of fixed lengths. The full code is in the <a class="xref" data-note="dl_attention">Attention Mechanisms</a> note, where the same model is rerun with attention added.</p>
  <table class="tbl">
    <tr><th>Input length</th><th>5</th><th>10</th><th>15</th><th>20</th></tr>
    <tr><td>Per-token accuracy, seq2seq without attention</td><td>0.98</td><td>0.80</td><td>0.63</td><td>0.53</td></tr>
  </table>
  <p>Same model, same training. Five digits fit easily into 64 numbers; twenty do not, and accuracy falls to about half (guessing would give 0.10). The information was available, because the encoder computed a hidden state for every input step, but seq2seq threw all of them away except the last. The fix is to let the decoder look back at every encoder state and choose which ones to read at each output step. That is <strong>attention</strong>, the subject of <a class="xref" data-note="dl_attention">Attention Mechanisms</a>, and dropping the RNN entirely in favour of attention gives the <a class="xref" data-note="transformers">Transformers</a> behind today's language models.</p>

  <h2 id="dr-pack"><span class="num">09</span>Padding and Packing</h2>
  <p>So far we have fed one review at a time. Training uses batches, because a GPU is fastest when it processes many examples together as one rectangular tensor. But reviews have different lengths. The usual fix is <strong>padding</strong>: add a filler token, by convention id 0 and written &lt;pad&gt;, to the end of the shorter reviews until all have the same length. The problem is that a plain RNN does not know the pads are fake. It keeps reading them and updating its memory, so the "final hidden state" of a short review is really "the state after reading the review and then some filler".</p>
  <p>Imagine three students' answer sheets stapled into equal-size bundles, with blank pages added to the short ones. If the examiner keeps "reading" the blank pages and lets them change the marks, the short answers are scored unfairly. <strong>Packing</strong> tells the examiner exactly where each answer ends. In PyTorch, <code>pack_padded_sequence</code> takes the padded batch together with each review's true length and produces a packed object that the RNN processes so that each sequence stops at its real last step. Here are three reviews of length 3, 2 and 1, run three ways: the one-word review "late" on its own (the correct answer), then inside a padded batch without packing, then packed:</p>
  <div class="fx" data-lang="py">from torch.nn.utils.rnn import pad_sequence, pack_padded_sequence
torch.manual_seed(0)
ids_of = {"&lt;pad&gt;": 0, "not": 2, "very": 4, "chai": 5, "good": 7, "late": 8, "cold": 9}
embed = nn.Embedding(10, 4, padding_idx=0)      # id 0 is the padding token
gru = nn.GRU(4, 3, batch_first=True)

reviews = ["chai not good", "very cold", "late"]
seqs = [torch.tensor([ids_of[w] for w in r.split()]) for r in reviews]
lengths = torch.tensor([len(s) for s in seqs])
ids = pad_sequence(seqs, batch_first=True, padding_value=0)
print(ids)

_, h_padded = gru(embed(ids))                                      # also reads the pads
packed = pack_padded_sequence(embed(ids), lengths, batch_first=True, enforce_sorted=False)
_, h_packed = gru(packed)                                          # stops at each true length
_, h_alone = gru(embed(seqs[2][None]))                             # "late" on its own

print("late alone :", h_alone[0, 0].detach().numpy().round(3))
print("padded     :", h_padded[0, 2].detach().numpy().round(3))
print("packed     :", h_packed[0, 2].detach().numpy().round(3))</div>
  <div class="fx" data-lang="text">tensor([[5, 2, 7],
        [4, 9, 0],
        [8, 0, 0]])
late alone : [-0.25   0.033 -0.179]
padded     : [-0.119 -0.117 -0.252]
packed     : [-0.25   0.033 -0.179]</div>
  <p><code>pad_sequence</code> builds the rectangle: "late" becomes <code>[8, 0, 0]</code>. Without packing, the GRU reads two pad vectors after "late" and its final state for that review comes out as [−0.119, −0.117, −0.252], which is simply wrong. With packing, the result matches running "late" alone exactly. <code>enforce_sorted=False</code> lets you pass reviews in any order (older code had to sort them by length), and <code>padding_idx=0</code> in the embedding keeps the pad vector fixed at zeros so it never gets trained. If you use <code>out</code> rather than <code>h_n</code>, remember that in a padded batch <code>out[:, -1]</code> is the state at the last <em>padded</em> position; for the real last state, use <code>h_n</code> from a packed run or pick <code>out</code> at position <code>length − 1</code> for each review.</p>

  <h2 id="dr-train"><span class="num">10</span>Training an LSTM in PyTorch</h2>
  <p>Time to put the pieces together and train a real model end to end. We go back to the problem from section 01: can a model learn that "not" flips the meaning of the word after it, something a bag of words cannot represent? We generate synthetic reviews, which keeps the run fast and the answer known. Each review has a few filler words, plus either one opinion word, possibly negated ("not good"), or the pattern "good not bad", where the word after "not" is flipped so the review is happy overall. Every "good not bad" has a matching "bad not good" with the opposite label and exactly the same words, so word counts alone cannot separate them.</p>
  <div class="fx" data-lang="py">import random, torch
random.seed(0)
FILL = ["chai", "samosa", "dosa", "was", "the", "very", "today", "really"]
POS, NEG = ["good", "tasty", "great"], ["bad", "cold", "awful"]
vocab = ["&lt;pad&gt;", "not"] + FILL + POS + NEG
idx = {w: i for i, w in enumerate(vocab)}

def make_review():
    a, b = random.sample([random.choice(POS), random.choice(NEG)], 2)   # one good word, one bad word
    if random.random() &lt; 0.5:                      # one opinion, maybe negated: "not good"
        negated = random.random() &lt; 0.5
        core, happy = (["not", a] if negated else [a]), (a in POS) != negated
    else:                                          # "good not bad": the word after "not" is flipped
        core, happy = [a, "not", b], a in POS
    words = random.choices(FILL, k=random.randint(1, 4)) + core + random.choices(FILL, k=random.randint(0, 3))
    return words, int(happy)
# --- examples
for _ in range(4):
    words, happy = make_review()
    print(happy, " ".join(words))</div>
  <div class="fx" data-lang="text">1 was today dosa was tasty not cold the
1 dosa very tasty not bad was chai
1 today tasty
0 samosa dosa today awful not good really</div>
  <p>The label is 1 for a happy customer and 0 for an unhappy one. "tasty not cold" is happy, while "awful not good" is unhappy, even though both contain one positive word, one negative word and "not". Now the model. It follows the many-to-one shape from section 07: an embedding layer turns word ids into 16-number vectors, an LSTM with 32 hidden units reads them (packed, as in section 09), and a linear layer on the last hidden state outputs two scores, unhappy and happy. As a baseline, the same training loop is run on a bag-of-words model that sums the word vectors, which ignores order, and then passes the sum through a small MLP. Both train for 300 steps of 64 reviews with the Adam optimizer and gradient clipping, and both are tested on 2,000 fresh reviews. The whole run takes a few seconds on a CPU.</p>
  <div class="fx" data-lang="py">import torch.nn as nn
from torch.nn.utils.rnn import pad_sequence, pack_padded_sequence

def encode(batch):                                 # list of (words, label) -&gt; padded tensors
    seqs = [torch.tensor([idx[w] for w in ws]) for ws, _ in batch]
    lengths = torch.tensor([len(s) for s in seqs])
    return pad_sequence(seqs, batch_first=True), lengths, torch.tensor([y for _, y in batch])

class ReviewLSTM(nn.Module):
    def __init__(self):
        super().__init__()
        self.emb = nn.Embedding(len(vocab), 16, padding_idx=0)
        self.lstm = nn.LSTM(16, 32, batch_first=True)
        self.head = nn.Linear(32, 2)               # unhappy / happy
    def forward(self, ids, lengths):
        packed = pack_padded_sequence(self.emb(ids), lengths, batch_first=True, enforce_sorted=False)
        _, (h_n, _) = self.lstm(packed)
        return self.head(h_n[-1])                  # many-to-one: last real hidden state

class BagOfWords(nn.Module):                       # baseline: sums word vectors, ignores order
    def __init__(self):
        super().__init__()
        self.emb = nn.EmbeddingBag(len(vocab), 16, mode="sum", padding_idx=0)
        self.mlp = nn.Sequential(nn.Linear(16, 32), nn.ReLU(), nn.Linear(32, 2))
    def forward(self, ids, lengths):
        return self.mlp(self.emb(ids))

test = encode([make_review() for _ in range(2000)])
for Model in (BagOfWords, ReviewLSTM):
    torch.manual_seed(0)
    model = Model()
    opt = torch.optim.Adam(model.parameters(), lr=0.01)
    for step in range(1, 301):
        ids, lengths, y = encode([make_review() for _ in range(64)])
        loss = nn.functional.cross_entropy(model(ids, lengths), y)
        opt.zero_grad(); loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        opt.step()
    with torch.no_grad():
        acc = (model(test[0], test[1]).argmax(1) == test[2]).float().mean().item()
        probe = encode([(r.split(), 0) for r in ["chai not good", "good not bad", "bad not good"]])
        p_happy = model(probe[0], probe[1]).softmax(1)[:, 1]
    print(f"{Model.__name__:10s} test accuracy {acc:.3f}   P(happy): chai not good {p_happy[0]:.2f}, "
          f"good not bad {p_happy[1]:.2f}, bad not good {p_happy[2]:.2f}")</div>
  <div class="fx" data-lang="text">BagOfWords test accuracy 0.746   P(happy): chai not good 0.03, good not bad 0.58, bad not good 0.58
ReviewLSTM test accuracy 1.000   P(happy): chai not good 0.00, good not bad 1.00, bad not good 0.00</div>
  <p>The bag-of-words model reaches about 75%: it gets the one-opinion reviews right (it can learn that "not" plus a positive word means unhappy) but is reduced to a coin toss on the two-opinion reviews, giving "good not bad" and "bad not good" the identical probability 0.58, because for it they are the same input. The LSTM reaches 100% on the test set and assigns "good not bad" a happy probability of 1.00 and "bad not good" 0.00: it has learned, purely from examples, that what matters is which word comes after "not". The important lines are <code>pack_padded_sequence</code> (so pads never touch the memory), <code>h_n[-1]</code> (the last real hidden state of the top layer, used as the review's summary) and <code>clip_grad_norm_</code> (the standard guard against exploding gradients from section 04). The training loop itself is the ordinary PyTorch loop from <a class="xref" data-note="dl_pytorch">PyTorch</a>; nothing about it is special to RNNs.</p>
  <p>Where do RNNs stand today? For language, Transformers have replaced them almost everywhere, because attention connects any two words in one step instead of through a long chain, and because a Transformer processes all positions of a training sentence in parallel while an RNN must wait for step t−1 before computing step t. RNNs still have one strong advantage: to process a new step they only update a fixed-size hidden state, so the cost per step is constant however long the stream has run. That keeps them useful for streaming data, on-device models such as wake-word detection, sensor and IoT streams, and small time-series datasets (see <a class="xref" data-note="ml_timeseries">Time Series Forecasting</a>), and recent "linear-time" sequence models such as state-space models (Mamba) and RWKV bring this fixed-memory idea back at large scale.</p>

  <h2 id="dr-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most dangerous RNN bug is silent. PyTorch's recurrent layers assume the input is laid out as (sequence, batch, features) unless you pass <code>batch_first=True</code>. If your tensor is (batch, sequence, features) and the two sizes happen to match, nothing crashes:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
x = torch.randn(4, 4, 8)                         # 4 reviews, 4 steps each: (batch, seq, features)
wrong = nn.GRU(8, 16)                            # forgot batch_first=True
right = nn.GRU(8, 16, batch_first=True)
right.load_state_dict(wrong.state_dict())        # identical weights
out_w, _ = wrong(x); out_r, _ = right(x)
print("shapes:", tuple(out_w.shape), tuple(out_r.shape))
print("same numbers?", torch.allclose(out_w, out_r))</div>
  <div class="fx" data-lang="text">shapes: (4, 4, 16) (4, 4, 16)
same numbers? False</div>
  <p>Both layers have identical weights and both outputs have the same shape, yet the numbers differ, because the layer without <code>batch_first</code> treated the four reviews as four time steps and read <em>across</em> the batch instead of along each review. The model will still train, just badly. Always print <code>out.shape</code> once on a toy batch whose batch size differs from its sequence length.</p>
  <p>A second classic error appears with truncated BPTT on a long stream. If the hidden state carried from one chunk to the next is not detached, PyTorch tries to backpropagate into a chunk whose graph has already been freed:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
rnn, head = nn.RNN(1, 8, batch_first=True), nn.Linear(8, 1)
stream = torch.randn(1, 30, 1)                   # one long series, trained in chunks of 10 steps
for fix in (False, True):
    h = torch.zeros(1, 1, 8)
    try:
        for start in range(0, 30, 10):
            if fix:
                h = h.detach()                   # keep the values, cut the history
            out, h = rnn(stream[:, start:start + 10], h)
            head(out).pow(2).mean().backward()
        print("with detach: all chunks trained")
    except RuntimeError as e:
        print("without detach:", str(e).split(".")[0])</div>
  <div class="fx" data-lang="text">without detach: Trying to backward through the graph a second time (or directly access saved tensors after they have already been freed)
with detach: all chunks trained</div>
  <p>The fix is one line, <code>h = h.detach()</code> at the start of every chunk: the numbers in h are kept, so the memory continues, but the gradient path back into the previous chunk is cut.</p>
  <p>Several more mistakes are worth knowing by name. Mixing up <code>out</code> and <code>h_n</code>: <code>out</code> is the top layer's state at every step, shape (batch, seq, hidden × directions); <code>h_n</code> is the last step of every layer and direction, shape (layers × directions, batch, hidden). Letting the RNN read padding, which section 09 showed silently changes the final state of short sequences. Training without gradient clipping, which can run fine for hours and then spike to NaN; clip to a norm of around 1 (typical range 0.5 to 5). Setting the LSTM forget bias in the wrong slice: PyTorch's gate order is input, forget, cell, output, so the forget bias is <code>bias[H:2*H]</code>, not <code>bias[:H]</code>, which is the input gate. Expecting gradient clipping to fix vanishing gradients, which it cannot. And using a bidirectional RNN for streaming or generation, where it trains on a future that will not exist in production.</p>

  <h2 id="dr-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Sequence</b>: ordered items x<sub>1</sub> … x<sub>T</sub>; each position is a <b>time step</b>.</li>
    <li><b>Hidden state</b> h<sub>t</sub>: the RNN's running summary of x<sub>1</sub> … x<sub>t</sub>; h<sub>0</sub> = 0.</li>
    <li><b>Weight sharing over time</b>: the same W<sub>xh</sub>, W<sub>hh</sub>, b at every step, so any length works with a fixed parameter count.</li>
    <li><b>Unrolling</b>: drawing the loop as one copy of the cell per step.</li>
    <li><b>BPTT</b>: backprop through the unrolled graph; shared-weight gradients are summed over steps. <b>Truncated BPTT</b>: backprop only within chunks, <code>h.detach()</code> between them.</li>
    <li><b>Vanishing / exploding gradient</b>: the gradient to early steps is a product of per-step factors W<sub>hh</sub>ᵀ·diag(1 − h²), which shrinks or grows exponentially.</li>
    <li><b>Gradient clipping</b>: rescale the gradient so its norm is at most a threshold; fixes exploding only.</li>
    <li><b>Gate</b>: a sigmoid output (0 to 1) multiplied into a signal.</li>
    <li><b>Seq2seq</b>: encoder RNN → context vector → decoder RNN; <b>teacher forcing</b> feeds the true previous token in training; <b>exposure bias</b> is the train/test mismatch it causes.</li>
    <li><b>Bidirectional RNN</b>: forward and backward RNNs, states concatenated.</li>
    <li><b>Packing</b>: tells the RNN each sequence's true length so it ignores padding.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>RNN</td><td>h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t−1</sub> + b); y<sub>t</sub> = W<sub>hy</sub>h<sub>t</sub></td></tr>
    <tr><td>One step back</td><td>∂h<sub>t</sub>/∂h<sub>t−1</sub> = W<sub>hh</sub>ᵀ·diag(1 − h<sub>t</sub>²); scalar: w·(1 − h²)</td></tr>
    <tr><td>Clipping</td><td>g ← g · min(1, max_norm / ‖g‖)</td></tr>
    <tr><td>LSTM</td><td>f, i, o = σ(W[h<sub>t−1</sub>, x<sub>t</sub>] + b); c̃ = tanh(…); c<sub>t</sub> = f⊙c<sub>t−1</sub> + i⊙c̃; h<sub>t</sub> = o⊙tanh(c<sub>t</sub>)</td></tr>
    <tr><td>GRU</td><td>z, r = σ(…); h̃ = tanh(W[r⊙h<sub>t−1</sub>, x<sub>t</sub>]); h<sub>t</sub> = (1 − z)⊙h<sub>t−1</sub> + z⊙h̃</td></tr>
    <tr><td>Parameters (PyTorch)</td><td>RNN block = h·(x + h) + 2h; GRU = 3 blocks; LSTM = 4 blocks</td></tr>
  </table>
  <h3>Comparisons</h3>
  <table class="tbl">
    <tr><th></th><th>RNN</th><th>LSTM</th><th>GRU</th><th>Transformer</th></tr>
    <tr><td>Memory</td><td>h, rewritten each step</td><td>h + cell c, edited by gates</td><td>h, blended by gates</td><td>attention over all positions</td></tr>
    <tr><td>Long-range learning</td><td>poor (vanishing)</td><td>good</td><td>good</td><td>direct, one step</td></tr>
    <tr><td>Weights (vs RNN)</td><td>1×</td><td>4×</td><td>3×</td><td>n/a</td></tr>
    <tr><td>Training</td><td>sequential</td><td>sequential</td><td>sequential</td><td>parallel over positions</td></tr>
    <tr><td>Cost per new step</td><td>constant</td><td>constant</td><td>constant</td><td>grows with context</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">lstm = nn.LSTM(input_size, hidden, num_layers=1, batch_first=True, bidirectional=False)
out, (h_n, c_n) = lstm(x)            # x: (batch, seq, feat); out: (batch, seq, hidden*dirs)
                                     # h_n, c_n: (layers*dirs, batch, hidden); GRU/RNN return just h_n
packed = pack_padded_sequence(emb(ids), lengths, batch_first=True, enforce_sorted=False)
_, (h_n, _) = lstm(packed)           # stops at each true length
nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)   # between backward() and step()
with torch.no_grad():
    lstm.bias_ih_l0[H:2*H].fill_(1.0)  # forget-gate bias (gate order: i, f, g, o)
h = h.detach()                       # truncated BPTT: between chunks</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Default layout is (seq, batch, feat); pass <code>batch_first=True</code> or the model silently reads across the batch.</li>
    <li>Pads change the hidden state: pack, and set <code>padding_idx</code>.</li>
    <li>Clipping fixes exploding gradients, not vanishing ones.</li>
    <li>A default-initialised LSTM still forgets: set the forget bias to 1 or more.</li>
    <li>Bidirectional only when the whole sequence is known at prediction time.</li>
    <li>PyTorch's GRU writes z as "keep old", the reverse of many papers.</li>
  </ul>

  <h2 id="dr-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use an MLP on a bag of words for text?</summary><div class="qa-body">A bag of words throws away order, so "good, not bad" and "bad, not good" become the same input, and an MLP needs a fixed input size, so it cannot take variable-length text with order intact. An RNN reads the words in order with the same weights at every step, so it handles any length and its summary depends on order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the vanilla RNN update. What does weight sharing give you?</summary><div class="qa-body">h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t−1</sub> + b), with h<sub>0</sub> = 0. Because the same weights are used at every step, the model works on any length with a fixed number of parameters, and a pattern learned at one position applies at every position.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If W<sub>hh</sub> = 0, what kind of model is the RNN?</summary><div class="qa-body">h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + b): each step sees only its own input, so there is no memory at all. It becomes an MLP applied to each word separately. W<sub>hh</sub> is what makes the network recurrent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is backpropagation through time?</summary><div class="qa-body">Unroll the RNN over the sequence so it looks like a deep feed-forward network with shared weights, run ordinary backpropagation on it, and add up each shared weight's gradient over all time steps. Truncated BPTT backpropagates only within fixed-length chunks of a long stream while still carrying the hidden state forward.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the vanishing gradient problem in RNNs.</summary><div class="qa-body">The gradient from a loss at step T back to step 1 is a product of T − 1 per-step factors, each W<sub>hh</sub>ᵀ times the tanh slopes (at most 1). When these factors are smaller than 1, the product shrinks exponentially, so early steps receive almost no gradient and long-range dependencies cannot be learned. In our 60-step test, step 1 got a gradient of about 10⁻¹⁷.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do RNNs suffer from vanishing gradients more than typical feed-forward networks?</summary><div class="qa-body">An RNN unrolled over 500 steps is effectively a 500-layer network, and it multiplies by the same W<sub>hh</sub> at every layer, so the factors do not vary and the product decays (or grows) exponentially. Feed-forward networks are usually much shallower and use tools such as residual connections and normalisation that a plain RNN lacks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle exploding and vanishing gradients?</summary><div class="qa-body">Exploding: gradient clipping by global norm (for example to 1.0), plus a sensible initialisation. Vanishing: clipping cannot help; use gated cells (LSTM, GRU) with a positive forget-gate bias, orthogonal or identity-like initialisation of W<sub>hh</sub>, shorter dependencies, or attention.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does each LSTM gate do?</summary><div class="qa-body">The forget gate decides how much of the old cell state to keep, the input gate decides how much of the new candidate to write, and the output gate decides how much of tanh(c) to expose as the hidden state. The cell update is c<sub>t</sub> = f⊙c<sub>t−1</sub> + i⊙c̃ and the output is h<sub>t</sub> = o⊙tanh(c<sub>t</sub>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does the LSTM's cell state help with vanishing gradients?</summary><div class="qa-body">The cell state is updated additively, so the gradient from c<sub>t</sub> to c<sub>t−1</sub> is just the forget gate f, element by element, rather than a weight matrix times a tanh slope. If the network keeps f near 1, information and gradient pass through many steps almost unchanged, like a skip connection in ResNet. With f = 0.99, 60% of a value survives 50 steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do LSTM gates use sigmoid while the candidate uses tanh?</summary><div class="qa-body">A gate must act as a valve between "closed" and "open", and sigmoid gives exactly 0 to 1. The candidate is content to add to memory, which may need to push values up or down, and tanh gives −1 to 1, centred on zero and bounded so the cell does not blow up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why initialise the LSTM forget-gate bias to 1 or more?</summary><div class="qa-body">With a zero bias the forget gate starts near σ(0) = 0.5, which halves the memory every step, so early in training the LSTM forgets almost as fast as a plain RNN. A bias of 1 to 3 starts the gate near 0.73 to 0.95, so memory is kept by default and gradients reach early steps; in our test step 1's gradient rose from about 10⁻¹³ to 0.05.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters does nn.LSTM(input_size=10, hidden_size=20) have?</summary><div class="qa-body">One block is 20·10 (input weights) + 20·20 (hidden weights) + 20 + 20 (PyTorch's two biases) = 640. An LSTM has four blocks, so 2,560. A GRU of the same size has 1,920 and a plain RNN 640.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>GRU vs LSTM: what is the difference and which would you choose?</summary><div class="qa-body">The GRU merges the cell and hidden state into one, and uses two gates (update and reset) instead of three, so it has three weight blocks instead of four: about 25% fewer parameters and faster training. Accuracy is usually similar; start with a GRU and try an LSTM for very long sequences or if the GRU underperforms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between out and h_n in PyTorch's RNN layers?</summary><div class="qa-body"><code>out</code> contains the top layer's hidden state at every time step, shape (batch, seq, hidden × directions) with batch_first. <code>h_n</code> contains only the final step's hidden state for every layer and direction, shape (layers × directions, batch, hidden). Use <code>out</code> for per-step tasks such as tagging and <code>h_n</code> for whole-sequence tasks such as classification.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When can you not use a bidirectional RNN?</summary><div class="qa-body">Whenever future inputs are not available at prediction time: streaming speech recognition, real-time forecasting and autoregressive text generation. It is fine for classification, tagging and seq2seq encoders, where the whole input is known.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is teacher forcing, and what problem does it cause?</summary><div class="qa-body">During training the decoder is fed the true previous target token instead of its own prediction, which makes training faster and more stable. At inference it must consume its own, possibly wrong, outputs, a situation it never practised; this mismatch is called exposure bias and can be reduced with scheduled sampling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the seq2seq bottleneck and how was it solved?</summary><div class="qa-body">The encoder compresses the entire input into one fixed-size context vector, so long inputs lose information; in our toy test accuracy fell from 0.98 at length 5 to 0.53 at length 20. Attention (Bahdanau et al., 2014) solved it by letting the decoder compute a fresh weighted combination of all encoder states at every output step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you batch sequences of different lengths for an RNN?</summary><div class="qa-body">Pad them to the longest length with a pad id (and set <code>padding_idx</code> in the embedding), then call <code>pack_padded_sequence</code> with the true lengths so the RNN stops at each sequence's real end. Without packing, the final hidden state of short sequences includes the effect of the pads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did Transformers replace RNNs, and when would you still use an RNN?</summary><div class="qa-body">Transformers connect any two positions in one step (no gradient decay through time) and train in parallel over all positions, so they scale far better with data and hardware. RNNs still make sense for streaming or on-device models, because each new step costs a constant amount of compute and memory, and for small time-series datasets.</div></details>
</main>
`
});
