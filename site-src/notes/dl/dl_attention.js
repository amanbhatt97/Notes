// dl/dl_attention.js — Attention Mechanisms
Object.assign(TOPIC_CONTENT, {
  "dl_attention": `<main>
  <h1>Attention Mechanisms</h1>
  <div class="where"><span>Deep Learning</span><span>Attention Mechanisms</span></div>
  <p class="lead">Attention lets a model look back at every input and pick what matters for the current step. It started as the fix for the seq2seq "one vector" bottleneck and became the core of the Transformer. This note keeps <strong>the running example of the RNN note</strong>, the delivery-app review <strong>"chai not good"</strong> and its Hindi translation "chai achhi nahi hai", and builds every idea on those three words: the soft lookup (scores, softmax, weighted sum by hand), query/key/value, Bahdanau vs Luong scores, why we divide by √d, self-attention, multi-head attention, the causal mask, positional encoding, and the Transformer block they add up to. The full Transformer lives in <a class="xref" data-note="transformers">Transformers</a>. Every code block ran here (NumPy, PyTorch 2.14 CPU, single thread).</p>

  <h2 id="da2-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 180" width="660">
<defs><marker id="da2-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="60" width="150" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="83" text-anchor="middle" font-size="12">RNNs &amp; seq2seq</text><text x="85" y="101" text-anchor="middle" class="tm" font-size="10">one-vector bottleneck</text>
<rect x="250" y="60" width="160" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="330" y="83" text-anchor="middle" font-size="13" font-weight="700">Attention</text><text x="330" y="102" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="500" y="10" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="31" text-anchor="middle" font-size="12">Transformers</text><text x="575" y="48" text-anchor="middle" class="tm" font-size="10">the full block, BERT, GPT</text>
<rect x="500" y="115" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="136" text-anchor="middle" font-size="12">NLP Foundations</text><text x="575" y="153" text-anchor="middle" class="tm" font-size="10">tokens, embeddings</text>
<line x1="160" y1="88" x2="248" y2="88" stroke="currentColor" marker-end="url(#da2-a0)"/>
<line x1="410" y1="80" x2="498" y2="40" stroke="currentColor" marker-end="url(#da2-a0)"/><line x1="498" y1="140" x2="412" y2="100" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#da2-a0)"/>
</svg><figcaption>Attention sits between the RNN era and the Transformer era: it was added to RNNs first, then kept alone.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dl_rnns">RNNs &amp; Sequential Models</a></b><span>A seq2seq encoder reads "chai not good" and keeps only its final hidden state; the decoder must write the whole translation from that one vector. On a reversal task accuracy fell from 1.00 at length 5 to 0.54 at length 30. Left open: how can the decoder use <em>all</em> the encoder's states?</span></li>
    <li><b>This note adds: the soft lookup</b><span>Score every input against what the current step is looking for, softmax the scores into weights, take the weighted sum. Then everything that makes it work at scale: Q/K/V, the √d scale, self-attention, many heads, masks and positions.</span></li>
    <li><b>Leads to: <a class="xref" data-note="transformers">Transformers</a></b><span>Drop the RNN entirely and stack attention + feed-forward layers with residuals (the "+x" of ResNet in <a class="xref" data-note="dl_cnns">CNNs</a>) and LayerNorm. Token vectors come from <a class="xref" data-note="nlp">NLP Foundations</a>; building it in code uses <a class="xref" data-note="dl_pytorch">PyTorch</a>.</span></li>
  </ol>

  <h2 id="da2-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers are from our review "chai not good".</p>
  <ol class="story">
    <li><b>The bottleneck</b><span>Q: why does seq2seq fail on long inputs? → All of "chai not good" (or a 30-word review) must fit in one fixed vector: 0.54 accuracy at length 30. But the encoder computed a state for every word — why throw them away?</span></li>
    <li><b>Attention as a soft lookup</b><span>Q: how does the decoder pick the right input word? → Score each encoder state against the decoder's query (0, 2, 0.6), softmax (0.098, 0.724, 0.178), weighted sum: while writing "nahi" it reads mostly "not". Accuracy at length 30: 0.95. But the dot-product score has a hidden problem…</span></li>
    <li><b>Query, key, value &amp; score functions</b><span>Q: what is matched and what is handed over? → Query (what I want), key (what I'm found by), value (what I give). Dot, general or additive scores; dot wins because it is one matrix multiply. But dot products grow with vector size…</span></li>
    <li><b>Scaling by √d</b><span>Q: why divide by √d? → q·k has spread √d; big scores make softmax one-hot and its gradient vanishes (top weight 0.95 at d = 512; 0.32 scaled). softmax(QKᵀ/√d)V. So far the decoder looked at the encoder; can words look at each other?</span></li>
    <li><b>Self-attention</b><span>Q: how does "good" learn it is negated? → Q, K, V from the same sentence: "good" attends to "not" and becomes [0.27, 0.63] instead of [0.63, 0.27] next to "very". One attention = one pattern of weights, though…</span></li>
    <li><b>Multi-head attention</b><span>Q: how can a word attend in several ways at once? → Split d into h heads, attend in each, concatenate, mix with W<sub>O</sub>: same 16,640 weights for 8 heads as for 1. But in a text generator, word 2 could peek at word 3…</span></li>
    <li><b>Masking</b><span>Q: how do we forbid looking ahead (or at padding)? → Add −∞ before softmax: "not" sees only "chai, not": weights 0.289, 0.711, 0. But attention treats "chai not good" and "good not chai" the same…</span></li>
    <li><b>Positional encoding</b><span>Q: how does attention know word order? → Add a position vector (sin/cos waves): position 1 = [0.841, 0.540, 0.010, 1.000] at d = 4. Now order changes the output. What do all these parts make together?</span></li>
    <li><b>The Transformer block</b><span>Q: what replaces the RNN? → Multi-head self-attention + feed-forward, each with a residual and LayerNorm, stacked N times. Full details: the Transformers note.</span></li>
  </ol>

  <h2 id="da2-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Attention</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why: the bottleneck</div>
        <ul>
          <li><b>Seq2seq</b> squeezes "chai not good" into one fixed vector</li>
          <li>Toy reverse task: 0.54 at length 30 without attention</li>
          <li><b>Attention</b> — at each output step, look back at <em>all</em> encoder states</li>
          <li>Same toy with attention: 0.95 at length 30</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The 3 steps (writing "nahi")</div>
        <ul>
          <li><b>1. Score</b> — dot(query, each key): chai 0, not 2, good 0.6</li>
          <li><b>2. Softmax</b> — exp, divide by total: [0.098, 0.724, 0.178]</li>
          <li><b>3. Weighted sum</b> — context = Σ α<sub>j</sub>·v<sub>j</sub> = [0.134, 0.777, 0.270]</li>
          <li>💡 Soft dictionary lookup: a blend of all values, weighted by key match</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Query · Key · Value</div>
        <ul>
          <li><b>Q</b> — what I am looking for · <b>K</b> — what I can be found by · <b>V</b> — what I hand over</li>
          <li>Hard lookup (dict) = one exact key; soft = weighted blend</li>
          <li>Transformer: Q = XW<sub>Q</sub>, K = XW<sub>K</sub>, V = XW<sub>V</sub> (learned)</li>
          <li><b>Scores</b>: Bahdanau additive vᵀtanh(W₁s + W₂h); Luong dot sᵀh / general sᵀWh</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scaled dot-product</div>
        <ul>
          <li><b>softmax(QKᵀ / √d<sub>k</sub>) V</b></li>
          <li>Shapes: Q n×d<sub>k</sub>, K m×d<sub>k</sub>, V m×d<sub>v</sub> → scores n×m → out n×d<sub>v</sub></li>
          <li><b>Why √d<sub>k</sub></b> — q·k has std √d<sub>k</sub>; unscaled softmax saturates → tiny grads</li>
          <li>Demo d=512: avg top weight 0.95 raw vs 0.32 scaled</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Self vs cross</div>
        <ul>
          <li><b>Self</b> — Q, K, V from one sentence; "good" next to "not" → [0.27, 0.63]</li>
          <li><b>Cross</b> — Q from decoder, K &amp; V from encoder (the "nahi" lookup)</li>
          <li>Path between any 2 tokens = 1 (RNN: n)</li>
          <li>⚠ Cost O(n²) time and memory in sequence length</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multi-head</div>
        <ul>
          <li><b>h heads</b>, each d<sub>model</sub>/h wide, own slice of W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub></li>
          <li>Split → attend per head → concat → W<sub>O</sub></li>
          <li>Same params as 1 head (16,640 both at d=64)</li>
          <li>⚠ d<sub>model</sub> must divide by num_heads</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Masking</div>
        <ul>
          <li><b>Causal</b> — token t can't see t+1…; upper triangle = −∞</li>
          <li>"chai not good": rows [1, 0, 0], [.289, .711, 0], [.225, .364, .411]</li>
          <li><b>Padding</b> — pad keys = −∞; apply <b>before softmax</b></li>
          <li>Bool mask: True = blocked (nn.MultiheadAttention), True = allowed (F.sdpa)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Position &amp; Transformer</div>
        <ul>
          <li><b>Attention is order-blind</b> — "good not chai" gives the same rows, shuffled</li>
          <li><b>Sinusoidal</b> PE(p, 2i) = sin(p/10000<sup>2i/d</sup>), cos for 2i+1</li>
          <li>Learned (BERT), RoPE, ALiBi (modern LLMs)</li>
          <li><b>Transformer</b> — attention + FFN + residual + LayerNorm, × N</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="da2-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="da2-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Bottleneck</span><span class="rm-sub">Why one vector is not enough</span></div></div>
      <div class="rm-item rm-done" data-target="da2-qkv"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Attention as a Soft Lookup</span><span class="rm-sub">Scores, softmax, sum by hand; Q, K, V</span></div></div>
      <div class="rm-item rm-done" data-target="da2-sdp"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Scaling by √d</span><span class="rm-sub">Scaled dot-product attention</span></div></div>
      <div class="rm-item rm-done" data-target="da2-self"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Self-Attention</span><span class="rm-sub">Words looking at words</span></div></div>
      <div class="rm-item rm-done" data-target="da2-mh"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Multi-Head Attention</span><span class="rm-sub">Several views in parallel</span></div></div>
      <div class="rm-item rm-done" data-target="da2-mask"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Masking</span><span class="rm-sub">Causal mask traced, padding</span></div></div>
      <div class="rm-item rm-done" data-target="da2-pos"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Positional Encoding</span><span class="rm-sub">Giving order back</span></div></div>
      <div class="rm-item rm-done" data-target="da2-tf"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">The Transformer Block</span><span class="rm-sub">Where it all lands</span></div></div>
      <div class="rm-item rm-done" data-target="da2-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One lookup, many upgrades</span></div></div>
      <div class="rm-item rm-done" data-target="da2-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Scale, masks, shapes</span></div></div>
      <div class="rm-item rm-done" data-target="da2-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="da2-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="da2-why"><span class="num">01</span>The Bottleneck</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The RNN note ended with a seq2seq translator whose accuracy collapsed on long inputs. What exactly is being lost, and what information was available but thrown away?</p>
  </div>
  <p>Start from the problem left open in the <a class="xref" data-note="dl_rnns">RNN note</a>. The delivery app translates the review <strong>"chai not good"</strong> into Hindi, <strong>"chai achhi nahi hai"</strong>. A seq2seq encoder RNN reads the three English words and computes a hidden state after each: h<sub>chai</sub>, h<sub>not</sub>, h<sub>good</sub>. Then it throws the first two away and passes only the last one, a single vector of, say, 64 numbers, to the decoder. The decoder must write all four Hindi words from that one vector. Notice the word order: "not" is the second English word but "nahi" is the third Hindi word, so the decoder needs "not" at a moment when the encoder read it long ago.</p>
  <p>For 3 words this works. For 30 it doesn't: on the RNN note's toy task (reverse a list of digits), accuracy fell from 1.00 at length 5 to 0.54 at length 30. Five numbers fit into 64; thirty don't, and the first ones are overwritten by the later ones.</p>
  <p>The fix in plain words: the encoder already computed a state for <em>every</em> input word. Keep all of them. Each time the decoder is about to write a word, it asks "which input words matter right now?", gives each one a weight, and reads a weighted average of their states. While writing "nahi" it should mostly read "not". That fresh, per-step average is called the <strong>context vector</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A translator who keeps the original page open on the desk. For each Hindi word she writes, her eyes go back to the part of the English page that matters, mostly one word, a little of its neighbours. The old seq2seq translator had to close the page after one reading.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Seq2seq (RNN note)</th><th>Seq2seq + attention (this note)</th></tr>
    <tr><td>What the decoder can see</td><td>h<sub>good</sub> only</td><td>h<sub>chai</sub>, h<sub>not</sub>, h<sub>good</sub>, every step</td></tr>
    <tr><td>Context vector</td><td>one, fixed for all output words</td><td>a new one for each output word</td></tr>
    <tr><td>Long inputs</td><td>early words overwritten</td><td>every word stays reachable</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Information bottleneck</strong> (in seq2seq): the encoder must compress an input of any length into one fixed-size vector, so capacity does not grow with the input. <strong>Context vector</strong>: the information the decoder receives about the input at one output step.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Just make the hidden state bigger" only delays the problem: a 512-number vector still has a fixed size while reviews can be any length, and the RNN still overwrites early words step by step. The fix must let the decoder reach the early states directly.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Attention as a soft lookup.</b> "Look at the important input words" is the goal. But how does the decoder compute <em>which</em> words matter, as numbers, in a way that gradient descent can learn?</div>

  <h2 id="da2-qkv"><span class="num">02</span>Attention as a Soft Lookup</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The decoder is about to write "nahi". It has three encoder states (for chai, not, good). How does it turn "what I need now" into a weight for each state, and those weights into one context vector?</p>
  </div>
  <h3>The three steps, by hand</h3>
  <p>Three encoder states (3 numbers each, made up so the arithmetic is easy; think of the dimensions loosely as "is food", "is negation", "is opinion") and the decoder's current state s, which acts as the <strong>query</strong>: "what am I looking for?". About to write "nahi", the decoder is looking for a negation: s = [0, 2, 0].</p>
  <table class="tbl">
    <tr><th>Encoder state</th><th>Vector</th></tr>
    <tr><td>h₁ (chai)</td><td>[1.0, 0.0, 0.2]</td></tr>
    <tr><td>h₂ (not)</td><td>[0.0, 1.0, 0.1]</td></tr>
    <tr><td>h₃ (good)</td><td>[0.2, 0.3, 1.0]</td></tr>
    <tr><td>s (decoder query, about to write "nahi")</td><td>[0.0, 2.0, 0.0]</td></tr>
  </table>
  <ol>
    <li><strong>Score</strong>: how well does each h<sub>j</sub> match s? Use the dot product (multiply matching positions, add). chai: 1·0 + 0·2 + 0.2·0 = <strong>0</strong>. not: 0·0 + 1·2 + 0.1·0 = <strong>2</strong>. good: 0.2·0 + 0.3·2 + 1·0 = <strong>0.6</strong>.</li>
    <li><strong>Softmax</strong>: turn scores into weights that are positive and add to 1. Take e<sup>score</sup>: e<sup>0</sup> = 1, e<sup>2</sup> = 7.389, e<sup>0.6</sup> = 1.822. Total = 10.211. Divide each by the total: <strong>0.098, 0.724, 0.178</strong>.</li>
    <li><strong>Weighted sum</strong>: context = 0.098·h₁ + 0.724·h₂ + 0.178·h₃. First number: 0.098·1 + 0.724·0 + 0.178·0.2 = 0.134. Second: 0 + 0.724 + 0.053 = 0.777. Third: 0.020 + 0.072 + 0.178 = 0.270. Context = <strong>[0.134, 0.777, 0.270]</strong>, mostly h₂ ("not").</li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 600 245" width="600">
<rect x="230" y="20" width="140" height="40" rx="6" class="ft st"/>
<text x="300" y="38" text-anchor="middle">decoder query s</text>
<text x="300" y="53" text-anchor="middle" class="tm">about to write "nahi"</text>
<g text-anchor="middle">
<rect x="60" y="150" width="110" height="36" rx="6" class="fb sb"/><text x="115" y="173">chai</text>
<rect x="245" y="150" width="110" height="36" rx="6" class="fb sb"/><text x="300" y="173">not</text>
<rect x="430" y="150" width="110" height="36" rx="6" class="fb sb"/><text x="485" y="173">good</text>
<text x="115" y="206" class="tm">h₁</text><text x="300" y="206" class="tm">h₂</text><text x="485" y="206" class="tm">h₃</text>
</g>
<line x1="270" y1="60" x2="115" y2="150" stroke="currentColor" stroke-width="1.3" stroke-opacity="0.5"/>
<line x1="300" y1="60" x2="300" y2="150" class="sg" stroke-width="8"/>
<line x1="330" y1="60" x2="485" y2="150" stroke="currentColor" stroke-width="2" stroke-opacity="0.5"/>
<g text-anchor="middle">
<text x="165" y="100">α = 0.10</text><text x="335" y="110" class="tg">0.72</text><text x="450" y="100">0.18</text>
</g>
<text x="300" y="234" text-anchor="middle" class="tg">context c = 0.10·h₁ + 0.72·h₂ + 0.18·h₃ = [0.134, 0.777, 0.270]</text>
</svg><figcaption>While writing "nahi", the decoder's query matches "not" best, so the context vector is mostly h₂. Line thickness = attention weight.</figcaption></figure>
  <p>The same three steps in NumPy. Each numbered comment is one step of the hand calculation:</p>
<div class="fx" data-lang="py">import numpy as np
enc = np.array([[1.0, 0.0, 0.2],     # h1  chai
                [0.0, 1.0, 0.1],     # h2  not
                [0.2, 0.3, 1.0]])    # h3  good
s = np.array([0.0, 2.0, 0.0])        # decoder query while writing "nahi"

scores = enc @ s                     # 1. one dot product per encoder state
e = np.exp(scores)                   # 2a. make every score positive
w = e / e.sum()                      # 2b. divide by the total -&gt; weights sum to 1
ctx = w @ enc                        # 3. weighted sum of the encoder states
print("scores ", scores.round(2))
print("exp    ", e.round(3), " total", e.sum().round(3))
print("weights", w.round(3), " sum", w.sum())
print("context", ctx.round(3))</div>
  <div class="fx" data-lang="text">scores  [0.  2.  0.6]
exp     [1.    7.389 1.822]  total 10.211
weights [0.098 0.724 0.178]  sum 0.9999999999999999
context [0.134 0.777 0.27 ]</div>
  <p>Every number matches the hand work. <code>enc @ s</code> does all three dot products at once (a matrix times a vector). <code>w @ enc</code> is the weighted sum: it multiplies each row of <code>enc</code> by its weight and adds the rows. Notice what softmax did: a score gap of 2 became a weight ratio of 7.4 to 1, so the best match dominates without the others being zeroed out completely. When the decoder moves on to write "achhi" (good), its query changes, and the same three steps put most weight on h₃ instead: one fresh context per output word.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Attention</strong>: given a query s and items h<sub>1</sub>…h<sub>n</sub>, compute scores e<sub>j</sub> = score(s, h<sub>j</sub>), weights α<sub>j</sub> = softmax(e)<sub>j</sub> = e<sup>e<sub>j</sub></sup> / Σ<sub>k</sub> e<sup>e<sub>k</sub></sup>, and output c = Σ<sub>j</sub> α<sub>j</sub>h<sub>j</sub>. The weights α are also called the <strong>alignment</strong>: which input each output step "looks at".</p>
  </div>
  <h3>Query, key, value: a soft dictionary</h3>
  <p>You already know a lookup: a Python dict. <code>menu["chai"]</code> finds the one key that matches exactly and returns its value. That is a <strong>hard lookup</strong>: one exact match or a KeyError. Neural networks can't learn through "exact match or crash", because it has no gradient. Attention is the <strong>soft</strong> version: compare the query with every key, turn the match scores into weights, and return a weighted blend of all the values.</p>
  <p>This splits each item into two roles. The <strong>key</strong> is what an item is found by (like a dictionary key). The <strong>value</strong> is what it hands over when found. The <strong>query</strong> is what the current step is looking for. In the three steps above, keys and values were the same vectors (the encoder states). They don't have to be.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>At a tea stall you say "something hot". The stall owner doesn't need an exact menu name. He mentally matches "hot" against each item's description (keys) and leans toward chai and coffee. If he could serve a blend, you would get mostly chai and coffee and a little lassi, priced accordingly (values).</p>
  </div>
  <p>Worked example on our review. Give each word a <strong>key</strong> describing its role, [is-negation, is-opinion]: chai [0, 0], not [1, 0], good [0, 1]. Give each a <strong>value</strong>, what it contributes, [mentions-chai, polarity]: chai [1, 0], not [0, −1] (it flips), good [0, +1]. Query "what is the opinion?" = [0, 2]: scores 0, 0, 2 → weights 0.107, 0.107, 0.787 → output ≈ [0.107, 0.680]: mostly good's value. Query "is something negated?" = [2, 0]: now "not" wins and the output's polarity turns negative.</p>
<div class="fx" data-lang="py">def softmax(z):
    e = np.exp(z - z.max(-1, keepdims=True))     # subtract max: same answer, no overflow
    return e / e.sum(-1, keepdims=True)

menu = {"chai": 15, "coffee": 30, "lassi": 40}  # hard lookup: Python dict, exact key or KeyError
print("hard:", menu["chai"])

words  = ["chai", "not", "good"]
keys   = np.array([[0.0, 0.0],     # chai : (is-negation, is-opinion)
                   [1.0, 0.0],     # not
                   [0.0, 1.0]])    # good
values = np.array([[1.0,  0.0],    # chai : (mentions-chai, polarity)
                   [0.0, -1.0],    # not  : flips polarity
                   [0.0,  1.0]])   # good : positive polarity
for name, q in [("what is the opinion?", [0.0, 2.0]), ("is something negated?", [2.0, 0.0])]:
    w = softmax(keys @ np.array(q))
    print(f"{name:22s} weights {w.round(3)} -&gt; output {(w @ values).round(3)}")</div>
  <div class="fx" data-lang="text">hard: 15
what is the opinion?   weights [0.107 0.107 0.787] -&gt; output [0.107 0.68 ]
is something negated?  weights [0.107 0.787 0.107] -&gt; output [ 0.107 -0.68 ]</div>
  <p>The "opinion" query puts 79% of its weight on "good", so the output's polarity is +0.68. The "negated?" query puts 79% on "not", and the polarity becomes −0.68. Nothing else changed: the query alone steered the lookup. Keys and values are different vectors here: "not" is <em>found</em> by its negation feature but <em>hands over</em> a polarity flip. The <code>softmax</code> function subtracts the max first; e<sup>1000</sup> would overflow, but softmax gives the same result for z and z − c, so this is safe. We reuse it for the rest of the note.</p>
  <p>Where do Q, K, V come from in a real model? From the token vectors themselves, through three learned matrices: Q = XW<sub>Q</sub>, K = XW<sub>K</sub>, V = XW<sub>V</sub>. Training adjusts these matrices so that useful queries match useful keys. Section 03 shows the full formula.</p>
  <div class="callout def"><span class="label">Query · Key · Value</span>
    <p><strong>Query</strong> q: what the current position is looking for. <strong>Key</strong> k<sub>j</sub>: what item j is matched on. <strong>Value</strong> v<sub>j</sub>: what item j contributes when matched. Output = Σ<sub>j</sub> softmax(q·k)<sub>j</sub> v<sub>j</sub>. In classic seq2seq attention keys = values = encoder states; in Transformers they are separate learned projections.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Attention never returns "nothing found". Softmax weights always add to 1, so even if no key matches well, the output is still some blend of values. Models learn workarounds (attending to a start token as a "no-op"); keep this in mind when reading attention maps.</p>
  </div>
  <h3>Choosing the score function: Bahdanau vs Luong</h3>
  <p>Step 1 of attention needs a <strong>score function</strong>: a number saying how well the decoder state s matches encoder state h<sub>j</sub>. The two classic RNN-era papers differ mainly here. Bahdanau et al. (2014) used a small neural network, called <strong>additive</strong> attention. Luong et al. (2015) used a dot product, called <strong>multiplicative</strong> attention, plus a "general" version with a learned matrix in the middle.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Matching a job applicant to a role. Luong's dot product is a checklist: multiply "skill needed" by "skill had" item by item and add. Bahdanau's additive score is a small interview panel: it combines both profiles, thinks about them through a nonlinearity (tanh), and gives one score. The panel is more flexible; the checklist is much faster.</p>
  </div>
  <p>Worked example with 2-number encoder states for our three words: h₁ (chai) = [1, 0], h₂ (not) = [0, 1], h₃ (good) = [1, 1]; decoder state s = [0.5, 1].</p>
  <ul>
    <li><strong>Dot</strong>: s·h₁ = 0.5, s·h₂ = 1, s·h₃ = 1.5.</li>
    <li><strong>General</strong> sᵀWh with W = [[1, 0], [0, −1]]: W flips the sign of the second feature, so h₁ → 0.5, h₂ → −1, h₃ → −0.5. Same vectors, completely different preference: the learned W decides what "match" means.</li>
    <li><strong>Additive</strong> vᵀtanh(W₁s + W₂h) with W₁ = 0.5·I, W₂ = [[1, −1], [0, 1]], v = [1, 2]. For h₁: W₁s = [0.25, 0.5]; W₂h₁ = [1, 0]; sum [1.25, 0.5]; tanh → [0.848, 0.462]; v· → 0.848 + 2·0.462 = <strong>1.773</strong>.</li>
  </ul>
  <div class="fx" data-lang="py">H = np.array([[1.0, 0.0],      # h1
              [0.0, 1.0],      # h2
              [1.0, 1.0]])     # h3   encoder states
s = np.array([0.5, 1.0])       # decoder state (the query)

dot = H @ s                                  # Luong dot: s . h_j
Wg = np.array([[1.0, 0.0], [0.0, -1.0]])
general = H @ Wg.T @ s                       # Luong general: s^T W h_j
W1 = np.array([[0.5, 0.0], [0.0, 0.5]])      # Bahdanau additive: v^T tanh(W1 s + W2 h_j)
W2 = np.array([[1.0, -1.0], [0.0, 1.0]])
v  = np.array([1.0, 2.0])
inside = np.tanh(W1 @ s + H @ W2.T)          # one row per h_j
additive = inside @ v
for name, sc in [("dot", dot), ("general", general), ("additive", additive)]:
    print(f"{name:8s} scores {sc.round(3)}  weights {softmax(sc).round(3)}")
print("additive, h1 step by step: W1 s =", W1 @ s, " W2 h1 =", W2 @ H[0], " tanh =", inside[0].round(3))</div>
  <div class="fx" data-lang="text">dot      scores [0.5 1.  1.5]  weights [0.186 0.307 0.506]
general  scores [ 0.5 -1.  -0.5]  weights [0.629 0.14  0.231]
additive scores [1.773 1.175 2.055]  weights [0.348 0.191 0.461]
additive, h1 step by step: W1 s = [0.25 0.5 ]  W2 h1 = [1. 0.]  tanh = [0.848 0.462]</div>
  <p>The last line repeats the hand calculation for h₁. Look at the costs: <code>dot</code> is one matrix-vector product; <code>additive</code> needs two products, a tanh, and another product for every pair of positions. With learned weights all three can work well, but the dot product runs as a single fast matmul on a GPU, which is why it won.</p>
  <table class="tbl">
    <tr><th></th><th>Bahdanau (2014)</th><th>Luong (2015)</th></tr>
    <tr><td>Score</td><td><strong>Additive</strong>: vᵀ tanh(W₁s<sub>t−1</sub> + W₂h<sub>j</sub>)</td><td><strong>Multiplicative</strong>: dot s<sub>t</sub>ᵀh<sub>j</sub>, general s<sub>t</sub>ᵀWh<sub>j</sub> (also concat)</td></tr>
    <tr><td>Query state</td><td>Previous decoder state s<sub>t−1</sub></td><td>Current decoder state s<sub>t</sub></td></tr>
    <tr><td>Context used</td><td>Fed <em>into</em> the decoder RNN step</td><td>Combined <em>after</em> the RNN step: tanh(W<sub>c</sub>[c<sub>t</sub>; s<sub>t</sub>])</td></tr>
    <tr><td>Encoder</td><td>Bidirectional RNN</td><td>Stacked unidirectional</td></tr>
    <tr><td>Extras</td><td>First learned soft alignment</td><td>Global vs local (windowed) attention</td></tr>
    <tr><td>Cost</td><td>Small MLP per pair</td><td>One matrix multiply → faster</td></tr>
  </table>
  <div class="flow"><span>2014 seq2seq (bottleneck)</span><span>2014 Bahdanau additive</span><span>2015 Luong dot / general</span><span>2016–17 self-attention</span><span>2017 Transformer: attention only</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Additive attention</strong>: score(s, h) = vᵀtanh(W₁s + W₂h). <strong>Multiplicative attention</strong>: score(s, h) = sᵀh (dot) or sᵀWh (general). The Transformer keeps the dot product, adds the 1/√d<sub>k</sub> scale, and separates keys from values with learned projections.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Plain dot-product scores grow with vector width (section 03). Additive attention doesn't have this problem because tanh bounds it, which is why early comparisons found additive better at large sizes. The fix is the √d<sub>k</sub> scale, not abandoning the dot product.</p>
  </div>
  <h3>Does it really fix the bottleneck?</h3>
  <p>The experiment: a GRU encoder-decoder (hidden 64) learns to reverse random digit lists of length 4–30 (the RNN note's toy task; reversal makes the first input word matter for the last output word, like "not" → "nahi" but harder). The only difference between the two runs is the <code>if self.attn:</code> branch, which adds the three steps above using the decoder's current state as the query and all encoder states as keys and values (Luong dot attention).</p>
<div class="fx" data-lang="py">import torch, torch.nn as nn, torch.nn.functional as F
V, H, BOS = 12, 64, 1                             # tokens 2..11 = digits, 1 = start
class Seq2Seq(nn.Module):
    def __init__(self, attn):
        super().__init__(); self.attn = attn
        self.emb = nn.Embedding(V, H)
        self.enc = nn.GRU(H, H, batch_first=True)
        self.dec = nn.GRUCell(H, H)
        self.out = nn.Linear(2*H if attn else H, V)
    def forward(self, src, tgt_in):
        enc_out, h = self.enc(self.emb(src))     # enc_out: all states, h: final state only
        h = h[0]; logits = []
        for t in range(tgt_in.size(1)):
            h = self.dec(self.emb(tgt_in[:, t]), h)
            if self.attn:                         # Luong dot attention over ALL encoder states
                w = F.softmax(torch.einsum('bh,bsh-&gt;bs', h, enc_out), dim=1)   # steps 1+2
                ctx = torch.einsum('bs,bsh-&gt;bh', w, enc_out)                   # step 3
                logits.append(self.out(torch.cat([h, ctx], 1)))
            else:
                logits.append(self.out(h))        # only the squeezed final state
        return torch.stack(logits, 1)

def batch(n, L):
    src = torch.randint(2, V, (n, L)); tgt = src.flip(1)          # task: reverse the sequence
    return src, torch.cat([torch.full((n,1), BOS), tgt[:, :-1]], 1), tgt

def run(attn):
    torch.manual_seed(0)
    m = Seq2Seq(attn); opt = torch.optim.Adam(m.parameters(), lr=3e-3)
    for step in range(3000):
        L = int(torch.randint(4, 31, (1,)))
        src, tin, tgt = batch(64, L)
        loss = F.cross_entropy(m(src, tin).reshape(-1, V), tgt.reshape(-1))
        opt.zero_grad(); loss.backward()
        nn.utils.clip_grad_norm_(m.parameters(), 1.0); opt.step()
    m.eval(); res = {}
    with torch.no_grad():
        for L in (5, 10, 20, 30):
            src, tin, tgt = batch(500, L)
            res[L] = (m(src, tin).argmax(-1) == tgt).float().mean().item()
    return res

for attn in (False, True):
    print("attn" if attn else "no-attn", {k: round(v, 2) for k, v in run(attn).items()})</div>
  <div class="fx" data-lang="text">no-attn {5: 1.0, 10: 0.93, 20: 0.69, 30: 0.54}
attn {5: 1.0, 10: 0.99, 20: 0.98, 30: 0.95}</div>
  <table class="tbl out"><caption>Per-token accuracy on fresh sequences (chance = 0.10). Each run takes about 3 minutes on one CPU thread; the second decimal can shift by ±0.02 with a different thread count.</caption>
    <tr><th>Length</th><th>5</th><th>10</th><th>20</th><th>30</th></tr>
    <tr><td>No attention</td><td>1.00</td><td>0.93</td><td>0.69</td><td>0.54</td></tr>
    <tr><td><strong>With attention</strong></td><td>1.00</td><td>0.99</td><td>0.98</td><td>0.95</td></tr>
  </table>
  <p>Same model size, same training. At length 30 accuracy goes from 0.54 to 0.95. In the code, <code>enc_out</code> (all encoder states) is what the attention branch reads; the no-attention branch only ever sees <code>h</code>. The <code>einsum</code> strings are batch versions of our NumPy lines: <code>'bh,bsh-&gt;bs'</code> is "dot the query with every encoder state", <code>'bs,bsh-&gt;bh'</code> is "weighted sum".</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Softmax is taken over the <em>input positions</em> (the axis of the encoder states), not over the hidden features. In the code that is <code>dim=1</code> of a (batch, source_len) tensor. Softmax over the wrong axis still runs and still gives numbers that sum to 1, just meaningless ones.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Scaling by √d.</b> The dot product won because it is fast. But a dot product adds up d products, so with real vector sizes (64, 512) the scores get large. What does that do to softmax, and to learning?</div>

  <h2 id="da2-sdp"><span class="num">03</span>Scaling by √d: Scaled Dot-Product Attention</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our scores were 0, 2 and 0.6 with 3-number vectors. With 512-number vectors the same kind of dot product gives scores like ±22. Does softmax still produce useful weights then, and can the model still learn?</p>
  </div>
  <p>First the matrix form. The decoder writes several words, each with its own query; stack the queries as rows of a matrix Q, the keys as rows of K, the values as rows of V. The three steps become three matrix operations: QKᵀ gives every query-key score in one table; softmax each row; multiply by V for the weighted sums. One extra step, explained right after: divide the scores by √d<sub>k</sub> (d<sub>k</sub> = length of each key vector) before the softmax.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A class of 3 students (queries) each choosing study partners from 3 tutors (keys). The score table is a 3×3 grid: row = student, column = tutor. Each student splits her hour (weights summing to 1) across tutors and leaves with a mix of their notes (values).</p>
  </div>
  <p>Worked example, d<sub>k</sub> = 2. Keys and values belong to the source words chai, not, good; the three queries are the decoder steps writing "chai", "achhi" and "nahi". Q = [[1, 0], [0, 2], [1, 1]], K = [[2, 0], [0, 1], [1, 1]], V = [[10, 0], [0, 10], [5, 5]].</p>
  <ol>
    <li><strong>Scores QKᵀ</strong>: row 1 (q = [1, 0]) against the three keys: 2, 0, 1. Row 2 (q = [0, 2]): 0, 2, 2. Row 3 (q = [1, 1]): 2, 1, 2.</li>
    <li><strong>Scale</strong> by √2 ≈ 1.414: row 1 becomes 1.41, 0, 0.71.</li>
    <li><strong>Softmax row 1</strong>: e<sup>1.41</sup> = 4.11, e<sup>0</sup> = 1, e<sup>0.71</sup> = 2.03, total 7.14 → 0.58, 0.14, 0.28: writing "chai" looks mostly at "chai".</li>
    <li><strong>Output row 1</strong>: 0.58·[10, 0] + 0.14·[0, 10] + 0.28·[5, 5] ≈ <strong>[7.18, 2.82]</strong>.</li>
  </ol>
  <div class="fx" data-lang="py">Q = np.array([[1.0, 0.0], [0.0, 2.0], [1.0, 1.0]])     # 3 queries, d_k = 2
K = np.array([[2.0, 0.0], [0.0, 1.0], [1.0, 1.0]])     # 3 keys
V = np.array([[10.0, 0.0], [0.0, 10.0], [5.0, 5.0]])   # 3 values
S = Q @ K.T                       # all 9 query-key dot products
S_scaled = S / np.sqrt(2)         # divide by sqrt(d_k)
A = softmax(S_scaled)             # softmax along each row
out = A @ V
print("S =\\n", S); print("S / sqrt(2) =\\n", S_scaled.round(2))
print("A =\\n", A.round(2)); print("out =\\n", out.round(2))

def attention(Q, K, V, mask=None):
    S = Q @ K.swapaxes(-1, -2) / np.sqrt(Q.shape[-1])
    if mask is not None:
        S = np.where(mask, -np.inf, S)            # True = blocked
    A = softmax(S)
    return A @ V, A
o2, _ = attention(Q, K, V)
print("function gives same:", np.allclose(o2, out))</div>
  <div class="fx" data-lang="text">S =
 [[2. 0. 1.]
 [0. 2. 2.]
 [2. 1. 2.]]
S / sqrt(2) =
 [[1.41 0.   0.71]
 [0.   1.41 1.41]
 [1.41 0.71 1.41]]
A =
 [[0.58 0.14 0.28]
 [0.11 0.45 0.45]
 [0.4  0.2  0.4 ]]
out =
 [[7.18 2.82]
 [3.31 6.69]
 [6.02 3.98]]
function gives same: True</div>
  <p>Row 1 of every matrix matches the hand steps. Row 2 is a nice check: query [0, 2] scores "not" and "good" equally (2 and 2), so they get equal weight 0.45, sensible for writing "achhi" (good), which needs both words to know the polarity. The function <code>attention</code> packs the formula into four lines; <code>K.swapaxes(-1, -2)</code> is Kᵀ that also works with extra batch or head dimensions, and the <code>mask</code> argument is used in section 06.</p>
  <h3>Why divide by √d<sub>k</sub>: shown on our scores</h3>
  <p>Take row 1's raw scores [2, 0, 1] and imagine the vectors were longer, so the same pattern of scores came out 4 or 16 times bigger. Softmax of bigger numbers puts almost all weight on one item, and a nearly one-hot softmax has a nearly zero gradient: the model can no longer learn to shift its attention. The gradient of softmax is the matrix diag(p) − ppᵀ; its largest entry measures how much a score change can still move the weights.</p>
<div class="fx" data-lang="py">row = np.array([2.0, 0.0, 1.0])                       # row 1 scores of our example
for k in (1, 4, 16):
    p = softmax(k * row)
    J = np.diag(p) - np.outer(p, p)                   # d softmax / d scores
    print(f"scores x{k:&lt;2d} weights {p.round(3)}  largest gradient entry {np.abs(J).max():.1e}")</div>
  <div class="fx" data-lang="text">scores x1  weights [0.665 0.09  0.245]  largest gradient entry 2.2e-01
scores x4  weights [0.982 0.    0.018]  largest gradient entry 1.8e-02
scores x16 weights [1. 0. 0.]  largest gradient entry 1.1e-07</div>
  <p>At ×1 the weights are a blend (0.665, 0.090, 0.245) and the gradient entry is 0.22. At ×16 the weights are one-hot (1, 0, 0) and the gradient entry is about 10⁻⁷: whatever the loss says, the attention pattern cannot change. How big do scores get in practice? A dot product adds up d<sub>k</sub> products; if each product is random with spread 1, the sum has a spread (standard deviation) of √d<sub>k</sub>. The experiment below measures it with 10 keys over 2,000 random trials:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
for d in (4, 64, 512):
    q = rng.normal(size=(2000, 1, d)); Kr = rng.normal(size=(2000, 10, d))   # 2000 trials, 10 keys
    s = (Kr @ q.transpose(0, 2, 1))[..., 0]                                   # (2000, 10) scores
    raw, scaled = softmax(s).max(1).mean(), softmax(s / np.sqrt(d)).max(1).mean()
    print(f"d={d:3d}  std(q.k)={s.std():5.1f}  avg top weight: raw {raw:.2f}  scaled {scaled:.2f}")</div>
  <div class="fx" data-lang="text">d=  4  std(q.k)=  2.0  avg top weight: raw 0.50  scaled 0.30
d= 64  std(q.k)=  7.9  avg top weight: raw 0.87  scaled 0.32
d=512  std(q.k)= 22.5  avg top weight: raw 0.95  scaled 0.32</div>
  <p>The measured std is 2.0, 7.9, 22.5: that is √4, √64, √512. Unscaled, the top weight climbs to 0.95 (almost one-hot). Scaled, it stays near 0.32 at every width. The scale makes attention behave the same whether the model is small or large.</p>
  <p>PyTorch has this formula built in, and it gives our numbers:</p>
  <div class="fx" data-lang="py">import torch, torch.nn.functional as F
t = lambda a: torch.tensor(a, dtype=torch.float32)
print("PyTorch SDPA matches numpy:", np.allclose(F.scaled_dot_product_attention(t(Q), t(K), t(V)).numpy(), out, atol=1e-5))</div>
  <div class="fx" data-lang="text">PyTorch SDPA matches numpy: True</div>
  <p><code>F.scaled_dot_product_attention</code> picks a fused kernel (FlashAttention or memory-efficient attention) when it can, so in real code prefer it over writing the softmax yourself.</p>
  <div class="callout def"><span class="label">Formula</span>
    <p><strong>Attention(Q, K, V) = softmax(QKᵀ / √d<sub>k</sub>) · V</strong>. Q: n×d<sub>k</sub>, K: m×d<sub>k</sub>, V: m×d<sub>v</sub> → scores n×m → output n×d<sub>v</sub>. Softmax runs along each row (over the m keys).</p>
  </div>
  <div class="flow"><span>Q · Kᵀ (all pair scores)</span><span>÷ √d<sub>k</sub></span><span>+ mask (−∞)</span><span>softmax per row</span><span>· V (weighted mix)</span></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Divide by d<sub>k</sub>" is wrong: it over-shrinks and flattens attention. The spread grows as √d<sub>k</sub>, so that is the scale. Also note it is d<sub>k</sub> of one <em>head</em>, not d<sub>model</sub>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Self-attention.</b> So far a decoder looked at an encoder. But inside the review itself, "good" means something different because "not" stands before it. Can the words of one sentence attend to each other?</div>

  <h2 id="da2-self"><span class="num">04</span>Self-Attention &amp; Cross-Attention</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An encoder word vector for "good" is the same in "chai not good" and "chai very good". How can a word's vector absorb the meaning of its neighbours, without an RNN reading left to right?</p>
  </div>
  <p>Turn attention inward. In <strong>self-attention</strong> every word in a sentence is a query, and the keys and values are the words of the <em>same</em> sentence. Each word builds a new version of itself as a blend of the words around it. In "chai not good", the word "good" should lean toward negative; in "chai very good" toward strong praise. The lookup of section 02, where the decoder queried the encoder, is called <strong>cross-attention</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A WhatsApp family group. Each message ("bring it tonight") only makes sense once you look at the other messages in the same group ("Mummy's birthday cake"). Self-attention is every message reading every other message in its own group. Cross-attention is reading a different group to answer a question in yours.</p>
  </div>
  <p>Worked example with 2-number word vectors, where the first number means "praise" and the second "negation". chai = [0.1, 0.1] (neutral), very = [1, 0], not = [0, 1], good = [0.6, 0.6] (on its own, half and half: it needs context). To keep it by hand, Q = K = V = the word vectors (no learned projections yet). For "good" in "chai very good": scores = good·chai = 0.12, good·very = 0.6, good·good = 0.72. Softmax → 0.23, 0.36, 0.41. New good = 0.23·[0.1, 0.1] + 0.36·[1, 0] + 0.41·[0.6, 0.6] = <strong>[0.63, 0.27]</strong>: mostly praise. In "chai not good" the same arithmetic with not = [0, 1] gives <strong>[0.27, 0.63]</strong>: mostly negation.</p>
<div class="fx" data-lang="py">vec = {"chai": np.array([0.1, 0.1]),     # neutral
       "very": np.array([1.0, 0.0]),     # dim 0 ~ "praise"
       "not":  np.array([0.0, 1.0]),     # dim 1 ~ "negation"
       "good": np.array([0.6, 0.6])}     # needs context: half and half

def self_attend(words):
    X = np.stack([vec[w] for w in words])  # (3, 2)
    A = softmax(X @ X.T)                   # Q = K = V = X (no projections yet)
    return A, A @ X

for sent in (["chai", "very", "good"], ["chai", "not", "good"]):
    A, out = self_attend(sent)
    print(" ".join(sent), "| good attends", A[2].round(2), "| new good =", out[2].round(2))

rng = np.random.default_rng(0)             # cross-attention: 4 Hindi positions ask 3 English positions
enc_out = rng.normal(size=(3, 4))          # source "chai not good", d = 4
dec_states = rng.normal(size=(4, 4))       # target "chai achhi nahi hai"
A = softmax(dec_states @ enc_out.T / np.sqrt(4))
print("cross weights shape", A.shape, " output shape", (A @ enc_out).shape)</div>
  <div class="fx" data-lang="text">chai very good | good attends [0.23 0.36 0.41] | new good = [0.63 0.27]
chai not good | good attends [0.23 0.36 0.41] | new good = [0.27 0.63]
cross weights shape (4, 3)  output shape (4, 4)</div>
  <p>The same "good" vector comes out as [0.63, 0.27] next to "very" and [0.27, 0.63] next to "not". This is the core idea behind <strong>contextual embeddings</strong> in BERT and GPT: a word's vector depends on its sentence. <code>X @ X.T</code> computes every word-vs-word score at once (a 3×3 table), and <code>A @ X</code> does every weighted sum at once. In the cross-attention part the queries come from the 4 Hindi positions and keys/values from the 3 English positions, so the weight table is 4×3: one row per query, one column per source word.</p>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600">
<defs><marker id="da2-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="140" y="20" text-anchor="middle">Self-attention</text>
<g text-anchor="middle">
<rect x="20" y="150" width="70" height="30" rx="5" class="fb sb"/><text x="55" y="170">chai</text>
<rect x="105" y="150" width="70" height="30" rx="5" class="fb sb"/><text x="140" y="170">not</text>
<rect x="190" y="150" width="70" height="30" rx="5" class="fb sb"/><text x="225" y="170">good</text>
</g>
<g fill="none" stroke="currentColor" stroke-opacity="0.6">
<path d="M225,150 C225,90 140,90 140,148" class="sg" stroke-width="3" stroke-opacity="1"/>
<path d="M225,150 C225,60 55,60 55,148"/>
<path d="M140,150 C140,110 55,110 55,148"/>
</g>
<text x="140" y="45" text-anchor="middle" class="tm">Q, K, V all from one sequence</text>
<text x="140" y="200" text-anchor="middle" class="tg">"good" attends to "not"</text>
<line x1="300" y1="15" x2="300" y2="200" stroke="currentColor" stroke-opacity="0.25"/>
<text x="460" y="20" text-anchor="middle">Cross-attention</text>
<g text-anchor="middle">
<rect x="330" y="60" width="100" height="90" rx="6" class="fb sb"/><text x="380" y="98">encoder</text><text x="380" y="114">chai not good</text>
<rect x="490" y="60" width="100" height="90" rx="6" class="ft st"/><text x="540" y="98">decoder</text><text x="540" y="114">… nahi</text>
<text x="380" y="175" class="tb">K, V</text><text x="540" y="175">Q</text>
</g>
<line x1="488" y1="105" x2="434" y2="105" stroke="currentColor" marker-end="url(#da2-ar1)"/>
<text x="460" y="96" text-anchor="middle" class="tm">ask</text>
<text x="460" y="200" text-anchor="middle" class="tm">each Hindi word queries the English words</text>
</svg><figcaption>Self-attention links words within one sentence; cross-attention lets the decoder query the encoder (the Transformer version of Bahdanau/Luong).</figcaption></figure>
  <div class="cards">
    <div><b>Self-attention</b><p>Q = XW<sub>Q</sub>, K = XW<sub>K</sub>, V = XW<sub>V</sub>, same X.</p><small>Encoder layers; BERT</small></div>
    <div><b>Masked self-attention</b><p>Same, but each token sees only the past (section 06).</p><small>Decoder layers; GPT</small></div>
    <div><b>Cross-attention</b><p>Q from decoder; K, V from encoder output.</p><small>Translation (T5), image captioning, Stable Diffusion text conditioning</small></div>
  </div>
  <table class="tbl">
    <tr><th></th><th>RNN</th><th>Self-attention</th></tr>
    <tr><td>Steps between token 1 and token n</td><td>n − 1 (gradient through each)</td><td><strong>1</strong> (direct link)</td></tr>
    <tr><td>Parallel over positions in training</td><td>No (sequential)</td><td>Yes</td></tr>
    <tr><td>Cost per layer</td><td>O(n·d²)</td><td>O(n²·d)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Self-attention</strong>: Q, K, V are all projections of the same sequence X; output position i is a weighted blend of all positions of X. <strong>Cross-attention</strong> (encoder-decoder attention): Q comes from one sequence (the decoder), K and V from another (the encoder output).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>O(n²) is memory too, not just time. n = 1,000 tokens × 12 heads × 4 bytes = 48 MB of scores per layer per example; ×32 batch ×12 layers ≈ 18 GB. FlashAttention avoids storing the n×n matrix (it works in tiles), so memory becomes O(n), though compute stays O(n²).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Multi-head attention.</b> Each word gets one set of weights: "good" can lean on "not" <em>or</em> on "chai", in one blend. But a word relates to its neighbours in several ways at once (grammar, negation, topic). One pattern averages them all.</div>

  <h2 id="da2-mh"><span class="num">05</span>Multi-Head Attention</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"good" needs to look at "not" (for polarity) and at "chai" (for what is being judged) at the same time. With one softmax its 1.0 of attention must be split between them. Can a layer keep several attention patterns side by side?</p>
  </div>
  <p>The need: one attention gives each word one set of weights, one opinion about which words matter. But a word relates to others in several ways at once: grammar (which verb goes with this subject), reference (who "she" is), nearby words. With one head, these get averaged into a single blurry pattern. The idea: split the vector into several smaller pieces and run a separate attention on each piece, each with its own Q, K, V projections. Then glue the results back together and mix them with one more matrix W<sub>O</sub>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A panel of readers each highlighting the same paragraph for one thing: one marks grammar links, one marks who "he" refers to, one marks nearby words. Their notes are stapled together at the end. One reader asked to do all three would mix them up.</p>
  </div>
  <p>Worked example of the shapes, d<sub>model</sub> = 4, 2 heads, 3 tokens:</p>
  <ol>
    <li>Project: Q = XW<sub>Q</sub> + b, shape (3, 4). Same for K and V.</li>
    <li>Split the 4 columns into 2 heads of 2: reshape to (3, 2, 2) and move the head axis first → (2 heads, 3 tokens, 2).</li>
    <li>Run scaled dot-product attention separately in each head (d<sub>k</sub> = 2 per head) → (2, 3, 2).</li>
    <li>Concatenate heads back → (3, 4). Multiply by W<sub>O</sub> → (3, 4).</li>
  </ol>
  <p>The code does these four steps by hand in numpy, using the weights from a PyTorch <code>nn.MultiheadAttention</code>, and checks that PyTorch gets the same output:</p>
  <div class="fx" data-lang="py">import torch.nn as nn
torch.manual_seed(0)
d_model, n_heads, n = 4, 2, 3
d_head = d_model // n_heads                         # 2
mha = nn.MultiheadAttention(d_model, n_heads, batch_first=True)
x = torch.randn(1, n, d_model)
ref, _ = mha(x, x, x)                               # PyTorch's answer

X = x[0].numpy()                                    # the same thing by hand, with PyTorch's weights
W = mha.in_proj_weight.detach().numpy(); bias = mha.in_proj_bias.detach().numpy()
Wq, Wk, Wv = W[:4], W[4:8], W[8:]                   # stacked as [Q; K; V]
bq, bk, bv = bias[:4], bias[4:8], bias[8:]
Q, K, V = X @ Wq.T + bq, X @ Wk.T + bk, X @ Wv.T + bv          # each (3, 4)
split = lambda M: M.reshape(n, n_heads, d_head).transpose(1, 0, 2)   # (heads, 3, 2)
heads, _ = attention(split(Q), split(K), split(V))               # (2, 3, 2): one result per head
concat = heads.transpose(1, 0, 2).reshape(n, d_model)            # (3, 4)
out = concat @ mha.out_proj.weight.detach().numpy().T + mha.out_proj.bias.detach().numpy()
print("Q", Q.shape, "-&gt; per head", split(Q).shape, "-&gt; heads out", heads.shape, "-&gt; concat", concat.shape)
print("matches nn.MultiheadAttention:", np.allclose(out, ref[0].detach().numpy(), atol=1e-6))</div>
  <div class="fx" data-lang="text">Q (3, 4) -&gt; per head (2, 3, 2) -&gt; heads out (2, 3, 2) -&gt; concat (3, 4)
matches nn.MultiheadAttention: True</div>
  <p>Our hand-built version equals PyTorch's, so multi-head attention really is just "split, attend, concat, project". The key lines are <code>split</code> (reshape + transpose, no new weights) and <code>concat</code> (the reverse). PyTorch stores W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> stacked in one <code>in_proj_weight</code> of shape (12, 4); we sliced it into three. Our <code>attention</code> function from section 03 worked unchanged on the extra head axis.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
<defs><marker id="da2-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<g text-anchor="middle">
<rect x="15" y="70" width="80" height="40" rx="6" class="fs" stroke="currentColor"/><text x="55" y="88">X</text><text x="55" y="103" class="tm">n×64</text>
<rect x="160" y="15" width="150" height="34" rx="5" class="fb sb"/><text x="235" y="37">head 1 (d=8)</text>
<rect x="160" y="58" width="150" height="34" rx="5" class="ft st"/><text x="235" y="80">head 2 (d=8)</text>
<text x="235" y="115">⋮</text>
<rect x="160" y="132" width="150" height="34" rx="5" class="fv" stroke="currentColor"/><text x="235" y="154">head 8 (d=8)</text>
<rect x="370" y="70" width="90" height="40" rx="6" class="fs" stroke="currentColor"/><text x="415" y="88">concat</text><text x="415" y="103" class="tm">n×64</text>
<rect x="505" y="70" width="80" height="40" rx="6" class="fg sg"/><text x="545" y="95">· W_O</text>
</g>
<g stroke="currentColor" fill="none" marker-end="url(#da2-ar2)">
<path d="M95,90 L158,32"/><path d="M95,90 L158,75"/><path d="M95,90 L158,149"/>
<path d="M310,32 L368,85"/><path d="M310,75 L368,88"/><path d="M310,149 L368,95"/>
<line x1="460" y1="90" x2="503" y2="90"/>
</g>
<text x="300" y="185" text-anchor="middle" class="tm">each head: own W_Q, W_K, W_V slice → its own attention pattern</text>
</svg><figcaption>8 heads of width 8 run in parallel on the same input, then are concatenated and mixed by W_O.</figcaption></figure>
  <p>Does splitting into heads cost extra parameters? Compare 8 heads with 1 head at d<sub>model</sub> = 64:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
x = torch.randn(2, 5, 64)                                    # (batch, seq, d_model)
mha = nn.MultiheadAttention(64, num_heads=8, batch_first=True)
one = nn.MultiheadAttention(64, num_heads=1, batch_first=True)
n = lambda m: sum(p.numel() for p in m.parameters())
out, w = mha(x, x, x)                                        # self-attention: q = k = v = x
print("8 heads params", n(mha), "| 1 head params", n(one))
print("output", tuple(out.shape), "weights (avg over heads)", tuple(w.shape))</div>
  <div class="fx" data-lang="text">8 heads params 16640 | 1 head params 16640
output (2, 5, 64) weights (avg over heads) (2, 5, 5)</div>
  <p>Identical: 4 matrices of 64×64 (W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>, W<sub>O</sub>) plus 4 biases of 64 = 16,640. Heads split d<sub>model</sub> into subspaces instead of adding width. The returned weights are averaged over heads by default (pass <code>average_attn_weights=False</code> to see each head).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Multi-head attention</strong>: MultiHead(Q, K, V) = Concat(head<sub>1</sub>, …, head<sub>h</sub>)W<sub>O</sub>, where head<sub>i</sub> = Attention(QW<sub>Q</sub><sup>i</sup>, KW<sub>K</sub><sup>i</sup>, VW<sub>V</sub><sup>i</sup>) and each head has width d<sub>model</sub>/h.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>d<sub>model</sub> must be divisible by the number of heads (64 / 8 = 8 works, 64 / 6 fails with an assertion error). And "more heads" is not free accuracy: each head gets narrower, and some heads end up redundant; pruning studies remove many heads with little loss.</p>
  </div>
  <p>On our review the split means: with d<sub>model</sub> = 4 and 2 heads, "good" can spend one head's attention mostly on "not" and the other head's mostly on "chai", instead of a single compromise. The <code>x</code> in the first code block above stands for the three token vectors of "chai not good" (random here, learned in a real model); the second block is the same at a realistic width, a batch of 2 reviews of 5 tokens each.</p>
  <div class="bridge"><b>What this still can't tell us → next: Masking.</b> Self-attention lets every word see every other word. For a model that <em>generates</em> text one word at a time, that is cheating: while learning to predict "good" after "chai not", it could simply look at "good".</div>

  <h2 id="da2-mask"><span class="num">06</span>Masking</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A text generator is trained on "chai not good" to predict each next word from the words before it, all positions at once. How do we stop position 2 ("not") from attending to position 3 ("good"), and real words from attending to padding?</p>
  </div>
  <p>The need, two cases. First, a text generator (GPT) is trained to predict the next word at every position in parallel; if a position could attend to later positions, it would just copy the answer. Second, batches are padded with filler tokens, and real words should not attend to filler. The idea: before softmax, set the forbidden scores to −∞. Since e<sup>−∞</sup> = 0, those positions get weight exactly 0, and softmax spreads the full 1 over the allowed positions.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket commentator can talk about balls already bowled, never the next ball. The causal mask enforces exactly that. A padding mask is like ignoring the blank overs at the end of a rain-shortened scorecard.</p>
  </div>
  <h3>The causal mask, traced on "chai not good"</h3>
  <p>Take the self-attention scores of section 04 for "chai not good" (Q = K = X): every pair's dot product. chai·chai = 0.02, chai·not = 0.1, chai·good = 0.12, not·not = 1, not·good = 0.6, good·good = 0.72. The causal mask blocks everything above the diagonal (the future).</p>
  <table class="tbl out"><caption>Row by row (each row is one query)</caption>
    <tr><th>Query</th><th>Allowed keys</th><th>Scores kept</th><th>Softmax</th></tr>
    <tr><td>chai (pos 1)</td><td>chai</td><td>[0.02, −∞, −∞]</td><td>[1, 0, 0]</td></tr>
    <tr><td>not (pos 2)</td><td>chai, not</td><td>[0.1, 1, −∞]</td><td>e<sup>0.1</sup> = 1.105, e<sup>1</sup> = 2.718, total 3.823 → [0.289, 0.711, 0]</td></tr>
    <tr><td>good (pos 3)</td><td>chai, not, good</td><td>[0.12, 0.6, 0.72]</td><td>1.127, 1.822, 2.054, total 5.004 → [0.225, 0.364, 0.411]</td></tr>
  </table>
<div class="fx" data-lang="py">X = np.stack([vec[w] for w in ["chai", "not", "good"]])
S = X @ X.T                                         # self-attention scores (3 x 3)
print(S.round(2))
causal = np.triu(np.ones((3, 3), dtype=bool), k=1)  # True above the diagonal = future
print(causal.astype(int))
A = softmax(np.where(causal, -np.inf, S))           # mask BEFORE softmax
print(A.round(3), "row sums", A.sum(1))
wrong = softmax(S) * ~causal                        # zero AFTER softmax: rows no longer sum to 1
print("mask after softmax, row sums:", wrong.sum(1).round(3))</div>
  <div class="fx" data-lang="text">[[0.02 0.1  0.12]
 [0.1  1.   0.6 ]
 [0.12 0.6  0.72]]
[[0 1 1]
 [0 0 1]
 [0 0 0]]
[[1.    0.    0.   ]
 [0.289 0.711 0.   ]
 [0.225 0.364 0.411]] row sums [1. 1. 1.]
mask after softmax, row sums: [0.314 0.677 1.   ]</div>
  <p><code>np.triu(..., k=1)</code> marks the strict upper triangle (the future). <code>np.where(causal, -np.inf, S)</code> replaces those scores. Row 1 can only see itself, so it puts weight 1 on "chai". Row 2 is our hand result; row 3 sees everything, so it equals the unmasked self-attention weights of section 04. The last line shows the classic bug: zeroing after softmax leaves rows that sum to 0.31 and 0.68, so the outputs shrink in a position-dependent way.</p>
  <p>In PyTorch, the same causal mask on the 8-head layer from section 05:</p>
  <div class="fx" data-lang="py">causal = torch.triu(torch.ones(5, 5, dtype=torch.bool), 1)   # True = not allowed
print(causal.int())
_, w = mha(x, x, x, attn_mask=causal)
print(w[0].round(decimals=2))

pad = torch.tensor([[False, False, False, True, True],       # example 1: last 2 are padding
                    [False, False, False, False, False]])
_, w = mha(x, x, x, key_padding_mask=pad)
print(w[0, 0].round(decimals=2))</div>
  <div class="fx" data-lang="text">tensor([[0, 1, 1, 1, 1],
        [0, 0, 1, 1, 1],
        [0, 0, 0, 1, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0]], dtype=torch.int32)
tensor([[1.0000, 0.0000, 0.0000, 0.0000, 0.0000],
        [0.4400, 0.5600, 0.0000, 0.0000, 0.0000],
        [0.3500, 0.3200, 0.3300, 0.0000, 0.0000],
        [0.2400, 0.2800, 0.2600, 0.2100, 0.0000],
        [0.1700, 0.2600, 0.2200, 0.1700, 0.1800]], grad_fn=&lt;RoundBackward1&gt;)
tensor([0.4600, 0.2700, 0.2700, 0.0000, 0.0000], grad_fn=&lt;RoundBackward1&gt;)</div>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600">
<g text-anchor="middle" class="tm"><text x="185" y="30">k1</text><text x="235" y="30">k2</text><text x="285" y="30">k3</text><text x="335" y="30">k4</text><text x="385" y="30">k5</text>
<text x="145" y="64">q1</text><text x="145" y="104">q2</text><text x="145" y="144">q3</text><text x="145" y="184">q4</text><text x="145" y="224">q5</text></g>
<g stroke="currentColor" stroke-opacity="0.3">
<rect x="160" y="40" width="50" height="40" class="fb" fill-opacity="1"/><rect x="210" y="40" width="50" height="40" class="fr"/><rect x="260" y="40" width="50" height="40" class="fr"/><rect x="310" y="40" width="50" height="40" class="fr"/><rect x="360" y="40" width="50" height="40" class="fr"/>
<rect x="160" y="80" width="50" height="40" class="fb"/><rect x="210" y="80" width="50" height="40" class="fb"/><rect x="260" y="80" width="50" height="40" class="fr"/><rect x="310" y="80" width="50" height="40" class="fr"/><rect x="360" y="80" width="50" height="40" class="fr"/>
<rect x="160" y="120" width="50" height="40" class="fb"/><rect x="210" y="120" width="50" height="40" class="fb"/><rect x="260" y="120" width="50" height="40" class="fb"/><rect x="310" y="120" width="50" height="40" class="fr"/><rect x="360" y="120" width="50" height="40" class="fr"/>
<rect x="160" y="160" width="50" height="40" class="fb"/><rect x="210" y="160" width="50" height="40" class="fb"/><rect x="260" y="160" width="50" height="40" class="fb"/><rect x="310" y="160" width="50" height="40" class="fb"/><rect x="360" y="160" width="50" height="40" class="fr"/>
<rect x="160" y="200" width="50" height="40" class="fb"/><rect x="210" y="200" width="50" height="40" class="fb"/><rect x="260" y="200" width="50" height="40" class="fb"/><rect x="310" y="200" width="50" height="40" class="fb"/><rect x="360" y="200" width="50" height="40" class="fb"/>
</g>
<g text-anchor="middle">
<text x="185" y="65">1.00</text><text x="235" y="65" class="tm">0</text><text x="285" y="65" class="tm">0</text><text x="335" y="65" class="tm">0</text><text x="385" y="65" class="tm">0</text>
<text x="185" y="105">.44</text><text x="235" y="105">.56</text><text x="285" y="105" class="tm">0</text><text x="335" y="105" class="tm">0</text><text x="385" y="105" class="tm">0</text>
<text x="185" y="145">.35</text><text x="235" y="145">.32</text><text x="285" y="145">.33</text><text x="335" y="145" class="tm">0</text><text x="385" y="145" class="tm">0</text>
<text x="185" y="185">.24</text><text x="235" y="185">.28</text><text x="285" y="185">.26</text><text x="335" y="185">.21</text><text x="385" y="185" class="tm">0</text>
<text x="185" y="225">.17</text><text x="235" y="225">.26</text><text x="285" y="225">.22</text><text x="335" y="225">.17</text><text x="385" y="225">.18</text>
</g>
<rect x="440" y="80" width="18" height="18" class="fb" stroke="currentColor" stroke-opacity="0.3"/><text x="466" y="94">allowed (past)</text>
<rect x="440" y="110" width="18" height="18" class="fr" stroke="currentColor" stroke-opacity="0.3"/><text x="466" y="124">−∞ → weight 0</text>
<text x="440" y="160" class="tm">each row still</text><text x="440" y="176" class="tm">sums to 1</text>
</svg><figcaption>Causal attention weights from the run above (head average). Query t only sees keys 1…t.</figcaption></figure>
  <p><code>attn_mask=causal</code> gives the lower-triangular pattern in the picture. <code>key_padding_mask=pad</code> marks keys 4 and 5 of example 1 as padding, so query 1 spreads its weight over keys 1–3 only (0.46, 0.27, 0.27) and the pads get 0. In <code>nn.MultiheadAttention</code>, True means "blocked".</p>
  <div class="cards">
    <div><b>Causal (look-ahead) mask</b><p>Upper triangle = −∞. Training predicts every next token in parallel without cheating.</p><small>Decoders / GPT; <code>is_causal=True</code></small></div>
    <div><b>Padding mask</b><p>Pad positions as keys = −∞, so real tokens ignore filler.</p><small><code>key_padding_mask</code> (True = pad)</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Attention mask</strong>: an additive term M with M<sub>ij</sub> = 0 (allowed) or −∞ (blocked), applied as softmax(QKᵀ/√d<sub>k</sub> + M). <strong>Causal mask</strong>: M<sub>ij</sub> = −∞ for j &gt; i. <strong>Padding mask</strong>: M<sub>ij</sub> = −∞ when key j is a pad.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mask <em>before</em> softmax. Also watch the conventions: in <code>nn.MultiheadAttention</code> a bool True means "block"; in <code>F.scaled_dot_product_attention</code> a bool True means "allowed". Getting it backwards attends <em>only</em> to the future or the pads. A row with every key masked gives NaN (0/0).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Positional encoding.</b> Masks decide <em>which</em> words may be seen, but nothing so far tells attention <em>where</em> a word is. Does "chai not good" look any different to attention from "good not chai"?</div>

  <h2 id="da2-pos"><span class="num">07</span>Positional Encoding</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The RNN knew order because it read word by word. Attention compares every word with every word in one shot. If we shuffle the words of the review, does anything in softmax(QKᵀ/√d)V even notice?</p>
  </div>
  <p>Nothing in the formula mentions positions. Check it on our review with the self-attention of section 04: run "chai not good" and the shuffled "good not chai".</p>
<div class="fx" data-lang="py">_, out1 = self_attend(["chai", "not", "good"])
_, out2 = self_attend(["good", "not", "chai"])
print("chai not good -&gt;", out1.round(3).tolist())
print("good not chai -&gt;", out2.round(3).tolist())
print("same rows, reordered:", np.allclose(out1[[2, 1, 0]], out2))</div>
  <div class="fx" data-lang="text">chai not good -&gt; [[0.239, 0.579], [0.213, 0.695], [0.269, 0.633]]
good not chai -&gt; [[0.269, 0.633], [0.213, 0.695], [0.239, 0.579]]
same rows, reordered: True</div>
  <p>Each word gets exactly the same new vector in both orders; only the rows are listed in a different order. A model built only from attention reads a sentence as a bag of words, the very problem the RNN note started with. The same holds for PyTorch's layer with learned projections:</p>
  <div class="fx" data-lang="py">perm = torch.tensor([4, 2, 0, 3, 1])
o1, _ = mha(x, x, x); o2, _ = mha(x[:, perm], x[:, perm], x[:, perm])
print("order-blind:", torch.allclose(o1[:, perm], o2, atol=1e-6))</div>
  <div class="fx" data-lang="text">order-blind: True</div>
  <p>Shuffling the input just shuffles the output the same way (<code>o1[:, perm]</code> equals <code>o2</code>). Attention alone treats a sentence as a bag of words. The fix in plain words: add a "where am I" vector to each word vector before attention, different for each position. Now the same word at position 2 and position 7 looks different, and the model can learn to use that.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Seat numbers on an IRCTC ticket. The passengers are the same people, but the seat number tells where each one sits. Positional encoding stamps a seat number onto every word.</p>
  </div>
  <h3>Sinusoidal encoding, computed</h3>
  <p>The original Transformer uses fixed sine and cosine waves of different speeds: PE(p, 2i) = sin(p / 10000<sup>2i/d</sup>) and PE(p, 2i + 1) = cos(p / 10000<sup>2i/d</sup>), where p is the position (0, 1, 2 …), i the dimension pair and d the vector size. Worked example at d = 4 for our three positions. Pair 0 has speed 1; pair 1 has speed 1/10000<sup>2/4</sup> = 1/100.</p>
  <table class="tbl out"><caption>PE for "chai not good" at d = 4</caption>
    <tr><th>Position p (word)</th><th>sin(p)</th><th>cos(p)</th><th>sin(p/100)</th><th>cos(p/100)</th></tr>
    <tr><td>0 (chai)</td><td>0</td><td>1</td><td>0</td><td>1</td></tr>
    <tr><td>1 (not)</td><td>0.841</td><td>0.540</td><td>0.010</td><td>1.000</td></tr>
    <tr><td>2 (good)</td><td>0.909</td><td>−0.416</td><td>0.020</td><td>1.000</td></tr>
  </table>
  <div class="fx" data-lang="py">def sinusoidal(n_pos, d):
    pos = np.arange(n_pos)[:, None]; i = np.arange(0, d, 2)[None]
    pe = np.zeros((n_pos, d))
    pe[:, 0::2] = np.sin(pos / 10000 ** (i / d))     # even dims: sin
    pe[:, 1::2] = np.cos(pos / 10000 ** (i / d))     # odd dims: cos
    return pe
pe = sinusoidal(50, 8)
print(pe[:4].round(2))
print("dot(p10,p11)=%.2f  dot(p10,p30)=%.2f" % (pe[10] @ pe[11], pe[10] @ pe[30]))</div>
  <div class="fx" data-lang="text">[[ 0.    1.    0.    1.    0.    1.    0.    1.  ]
 [ 0.84  0.54  0.1   1.    0.01  1.    0.    1.  ]
 [ 0.91 -0.42  0.2   0.98  0.02  1.    0.    1.  ]
 [ 0.14 -0.99  0.3   0.96  0.03  1.    0.    1.  ]]
dot(p10,p11)=3.54  dot(p10,p30)=1.97</div>
  <p>The first block's rows 0–3 extend our table to d = 8 (the second pair now has speed 1/10, so position 1 gets sin(0.1) = 0.10). Early dimensions change fast from row to row, later ones slowly, like the seconds, minutes and hours hands of a clock: together they give every position a unique reading. Nearby positions get similar vectors (dot 3.54 for 10 vs 11) and far ones less similar (1.97 for 10 vs 30). Now add the position vectors to our 2-number word vectors (d = 2: PE(p) = [sin p, cos p]) and repeat the shuffle test:</p>
<div class="fx" data-lang="py">print(sinusoidal(3, 4).round(3))                    # our hand table
def self_attend_pos(words):
    X = np.stack([vec[w] for w in words]) + sinusoidal(len(words), 2)   # word + position
    A = softmax(X @ X.T)
    return A @ X
o1, o2 = self_attend_pos(["chai", "not", "good"]), self_attend_pos(["good", "not", "chai"])
print("'good' in chai not good:", o1[2].round(3), "  in good not chai:", o2[0].round(3))
print("still just reordered?", np.allclose(o1[[2, 1, 0]], o2))</div>
  <div class="fx" data-lang="text">[[ 0.     1.     0.     1.   ]
 [ 0.841  0.54   0.01   1.   ]
 [ 0.909 -0.416  0.02   1.   ]]
'good' in chai not good: [1.191 0.659]   in good not chai: [0.732 1.516]
still just reordered? False</div>
  <p>With positions added, "good" at the end of "chai not good" and "good" at the start of "good not chai" get different vectors, and the outputs are no longer a reshuffle of each other: order now changes the computation, and training can learn to use it. In a real model the same addition happens once at the input: <code>X = token_emb + pe[:n]</code>.</p>
  <table class="tbl">
    <tr><th>Scheme</th><th>How</th><th>Used in</th></tr>
    <tr><td>Sinusoidal</td><td>Fixed sin/cos added to embeddings</td><td>Original Transformer</td></tr>
    <tr><td>Learned absolute</td><td>An embedding per position index; no extrapolation past max length</td><td>BERT, GPT-2</td></tr>
    <tr><td>RoPE</td><td>Rotate Q and K by a position angle → score depends on relative offset</td><td>Llama, Mistral, most modern LLMs</td></tr>
    <tr><td>ALiBi</td><td>Add a distance penalty to scores</td><td>BLOOM, MPT</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Permutation equivariance</strong>: f(shuffled input) = shuffled f(input). Self-attention without position information has this property. <strong>Positional encoding</strong>: any added or applied position signal (absolute vectors, rotations, or score biases) that breaks it so order can be learned.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Learned absolute positions only exist up to the maximum length seen in training (512 for BERT). Feeding a longer input crashes or degrades. Relative schemes like RoPE and ALiBi extend better, which is one reason modern LLMs use them.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Transformer block.</b> We now have every part: attention as lookup, the √d scale, self- and cross-attention, heads, masks, positions. How are they assembled into the architecture that replaced RNNs?</div>

  <h2 id="da2-tf"><span class="num">08</span>The Transformer Block</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our seq2seq still has a GRU reading "chai not good" one word at a time; attention is only bolted on. If self-attention can relate every word to every word, do we need the RNN at all?</p>
  </div>
  <p>The need: RNN + attention still reads one step at a time, so training can't use the GPU's parallelism, and the recurrent path still exists. "Attention Is All You Need" (2017) asked: what if we drop the RNN entirely? A <strong>Transformer</strong> layer is just: multi-head self-attention (tokens exchange information), then a small feed-forward network applied to each token separately (tokens think on their own), each wrapped with a residual connection ("+x", as in ResNet) and LayerNorm. Stack N of these. Position comes from positional encoding. Every piece in this note slots into that block.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A group project meeting repeated N times. In each round, everyone first listens to everyone (attention), then goes to their own desk to think (feed-forward). Their notes from before are kept and only edited (residual). After a few rounds, each person's notes reflect the whole group.</p>
  </div>
  <div class="flow"><span>Embeddings + position</span><span>Multi-head self-attention</span><span>Add &amp; LayerNorm</span><span>Feed-forward</span><span>Add &amp; LayerNorm</span><span>× N layers</span></div>
  <p>The decoder block adds masked self-attention and cross-attention to the encoder. Three families came out of this design:</p>
  <div class="cards">
    <div><b>Encoder-only</b><p>Bidirectional self-attention.</p><small>BERT: classification, embeddings</small></div>
    <div><b>Decoder-only</b><p>Causal self-attention.</p><small>GPT, Llama: generation</small></div>
    <div><b>Encoder-decoder</b><p>Self + cross attention.</p><small>T5, original translation model</small></div>
  </div>
  <p>In practice you call the fused kernel with the shape (batch, heads, seq, d_head). A last check that it is the same formula we computed by hand:</p>
  <div class="fx" data-lang="py">q = k = v = torch.randn(1, 8, 5, 8)                          # (batch, heads, seq, d_head)
manual = torch.softmax(q @ k.transpose(-2, -1) / 8**0.5, -1) @ v
print("SDPA matches manual:", torch.allclose(F.scaled_dot_product_attention(q, k, v), manual, atol=1e-6))</div>
  <div class="fx" data-lang="text">SDPA matches manual: True</div>
  <p><code>manual</code> is softmax(QKᵀ/√8)V written out: <code>k.transpose(-2, -1)</code> is Kᵀ for the last two axes and <code>8**0.5</code> is √d<sub>k</sub> per head. The full block, LayerNorm vs BatchNorm, the FFN, BERT vs GPT and a numpy build are in <a class="xref" data-note="transformers">Transformers</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Transformer</strong>: a stack of layers, each = x + MultiHeadAttention(LN(x)) then x + FFN(LN(x)) (pre-norm form; the 2017 paper used post-norm). No recurrence or convolution; order comes only from positional encoding.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Transformers have no sequential bottleneck at all" is only true for training. Generating text is still one token at a time; the KV cache (stored keys and values of past tokens) makes each new token cheap, but it grows with context and dominates LLM serving memory.</p>
  </div>
  <p>Every section of this note is one part of that block: section 02's lookup with section 03's scale is the attention formula; section 04's self- and cross-attention are its two uses; section 05 runs several in parallel; section 06's masks make the decoder causal and ignore padding; section 07's positions replace the order the RNN used to provide. The residual "+x" is the skip connection of ResNet (<a class="xref" data-note="dl_cnns">CNNs</a>), there for the same reason: gradients through many stacked layers.</p>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects,</b> and then the full block, LayerNorm, the feed-forward network, BERT vs GPT and training at scale in <a class="xref" data-note="transformers">Transformers</a>.</div>

  <h2 id="da2-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Score, softmax, weighted sum, Q/K/V, √d, self-attention, heads, masks, positions: separate tricks, or one lookup and its upgrades?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 320" width="680">
<defs><marker id="da2-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="170" height="44" rx="7" class="fr sr"/><text x="95" y="29" text-anchor="middle" font-size="11.5" font-weight="700">seq2seq bottleneck</text><text x="95" y="45" text-anchor="middle" class="tm" font-size="10">0.54 at length 30</text>
<line x1="180" y1="32" x2="218" y2="32" stroke="currentColor" marker-end="url(#da2-a9)"/>
<rect x="220" y="10" width="230" height="44" rx="7" class="fb sb"/><text x="335" y="29" text-anchor="middle" font-size="11.5" font-weight="700">score → softmax → weighted sum</text><text x="335" y="45" text-anchor="middle" class="tm" font-size="10">"nahi" reads "not": 0.724 · 0.95 at 30</text>
<line x1="450" y1="32" x2="488" y2="32" stroke="currentColor" marker-end="url(#da2-a9)"/>
<rect x="490" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="580" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Q · K · V roles</text><text x="580" y="45" text-anchor="middle" class="tm" font-size="10">found by K, hands over V</text>
<line x1="580" y1="54" x2="580" y2="84" stroke="currentColor" marker-end="url(#da2-a9)"/>
<rect x="470" y="86" width="200" height="44" rx="7" class="fb sb"/><text x="570" y="105" text-anchor="middle" font-size="11.5" font-weight="700">dot score wins (fast)</text><text x="570" y="121" text-anchor="middle" class="tm" font-size="10">but grows like √d</text>
<line x1="470" y1="108" x2="438" y2="108" stroke="currentColor" marker-end="url(#da2-a9)"/>
<rect x="230" y="86" width="206" height="44" rx="7" class="ft st"/><text x="333" y="105" text-anchor="middle" font-size="11.5" font-weight="700">÷ √d: softmax(QKᵀ/√d)V</text><text x="333" y="121" text-anchor="middle" class="tm" font-size="10">top weight 0.95 → 0.32</text>
<line x1="333" y1="130" x2="333" y2="160" stroke="currentColor" marker-end="url(#da2-a9)"/>
<rect x="230" y="162" width="206" height="44" rx="7" class="ft st"/><text x="333" y="181" text-anchor="middle" font-size="11.5" font-weight="700">self-attention (Q,K,V = X)</text><text x="333" y="197" text-anchor="middle" class="tm" font-size="10">good → [0.27, 0.63] next to not</text>
<line x1="436" y1="184" x2="468" y2="184" stroke="currentColor" marker-end="url(#da2-a9)"/>
<rect x="470" y="162" width="200" height="44" rx="7" class="ft st"/><text x="570" y="181" text-anchor="middle" font-size="11.5" font-weight="700">multi-head</text><text x="570" y="197" text-anchor="middle" class="tm" font-size="10">split · attend · concat · W_O</text>
<line x1="230" y1="184" x2="198" y2="184" stroke="currentColor" marker-end="url(#da2-a9)"/>
<rect x="10" y="162" width="186" height="44" rx="7" class="fr sr"/><text x="103" y="181" text-anchor="middle" font-size="11.5" font-weight="700">sees the future; order-blind</text><text x="103" y="197" text-anchor="middle" class="tm" font-size="10">two holes to fill</text>
<line x1="60" y1="206" x2="60" y2="240" stroke="currentColor" marker-end="url(#da2-a9)"/><line x1="150" y1="206" x2="230" y2="240" stroke="currentColor" marker-end="url(#da2-a9)"/>
<rect x="10" y="242" width="140" height="40" rx="7" class="fg sg"/><text x="80" y="260" text-anchor="middle" font-size="11.5" font-weight="700">mask (−∞)</text><text x="80" y="275" text-anchor="middle" class="tm" font-size="10">[.289, .711, 0]</text>
<rect x="160" y="242" width="170" height="40" rx="7" class="fg sg"/><text x="245" y="260" text-anchor="middle" font-size="11.5" font-weight="700">positional encoding</text><text x="245" y="275" text-anchor="middle" class="tm" font-size="10">sin/cos added to X</text>
<line x1="330" y1="262" x2="388" y2="262" stroke="currentColor" marker-end="url(#da2-a9)"/><line x1="570" y1="206" x2="530" y2="240" stroke="currentColor" marker-end="url(#da2-a9)"/>
<rect x="390" y="242" width="280" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="530" y="260" text-anchor="middle" font-size="11.5" font-weight="700">Transformer block</text><text x="530" y="275" text-anchor="middle" class="tm" font-size="10">x + MHA(LN x); x + FFN(LN x); × N</text>
<text x="340" y="308" text-anchor="middle" class="tm" font-size="10.5">one operation: a weighted average whose weights come from query–key similarity</text>
</svg><figcaption>Everything is one operation, the soft lookup, plus the fixes its weaknesses demanded: a scale so it trains at large d, self-attention so words see words, heads for several patterns, masks and positions for the two holes self-attention leaves.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same review, "chai not good"</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our review</th><th>When to use</th></tr>
    <tr><td>Bottleneck</td><td>seq2seq's single vector c</td><td>why do long inputs fail?</td><td>1.00 → 0.54 (length 5 → 30)</td><td>the reason attention exists</td></tr>
    <tr><td>Scores</td><td>dot(query, key)</td><td>how well does each word match?</td><td>chai 0, not 2, good 0.6</td><td>every attention</td></tr>
    <tr><td>Softmax weights</td><td>exp, normalise</td><td>how much of each word?</td><td>0.098, 0.724, 0.178</td><td>every attention</td></tr>
    <tr><td>Context vector</td><td>weighted sum of values</td><td>what does the decoder read?</td><td>[0.134, 0.777, 0.270]</td><td>every attention</td></tr>
    <tr><td>Q / K / V</td><td>three roles (learned projections)</td><td>what is matched vs handed over?</td><td>"negated?" → polarity −0.68</td><td>Transformers: separate W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub></td></tr>
    <tr><td>Score function</td><td>dot / general / additive</td><td>how to measure a match?</td><td>dot [0.5, 1, 1.5]; additive [1.77, 1.18, 2.06]</td><td>dot (scaled) today</td></tr>
    <tr><td>√d scale</td><td>std of q·k = √d</td><td>why doesn't learning stall at large d?</td><td>×16 scores → gradient ≈ 1e-7</td><td>always with dot scores</td></tr>
    <tr><td>Self-attention</td><td>Q, K, V from one sequence</td><td>how do words use their context?</td><td>good → [0.63, 0.27] (very) / [0.27, 0.63] (not)</td><td>encoders, decoders</td></tr>
    <tr><td>Cross-attention</td><td>Q from decoder, K/V from encoder</td><td>how does the output read the input?</td><td>4×3 weight table (Hindi × English)</td><td>translation, captioning</td></tr>
    <tr><td>Multi-head</td><td>h smaller attentions + W<sub>O</sub></td><td>several relations at once?</td><td>2 heads × 2 dims; 16,640 weights for 8 or 1 heads</td><td>always (8–96 heads)</td></tr>
    <tr><td>Causal mask</td><td>−∞ above the diagonal</td><td>no peeking at the future?</td><td>not: [0.289, 0.711, 0]</td><td>generators (GPT)</td></tr>
    <tr><td>Positional encoding</td><td>sin/cos (or learned, RoPE)</td><td>does order matter?</td><td>pos 1 = [0.841, 0.540, 0.010, 1.000]</td><td>every Transformer</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>attention is a differentiable lookup, a weighted average of values whose weights come from how well a query matches each key.</strong> Using it from decoder to encoder removes the bottleneck; scaling keeps it trainable; using it inside one sentence gives contextual meaning; heads, masks and positions fill the gaps; stacking it with residuals is the Transformer.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The ideas are connected; now the silent bugs that catch people in code and interviews.</div>

  <h2 id="da2-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Attention code almost never crashes when it is wrong: softmax always returns numbers that sum to 1. Which mistakes hide behind that, and how do you test for them?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: softmax on the wrong axis</span>
    <p>Weights must sum to 1 over the <em>keys</em> (last axis of QKᵀ). Softmax over queries or features still runs and still sums to 1, so the bug is silent. Check <code>A.sum(-1)</code> is all ones on a toy input.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting or mis-sizing the scale</span>
    <p>No scale → near one-hot attention and stalled training at large d. Dividing by d<sub>k</sub> instead of √d<sub>k</sub> → over-flat attention. Use the per-head d<sub>k</sub>, not d<sub>model</sub>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: masking after softmax</span>
    <p>Zeroing weights after softmax leaves rows that don't sum to 1. Add −∞ (or a large negative number) to scores before softmax.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: flipped bool mask convention</span>
    <p><code>nn.MultiheadAttention</code>: True = blocked. <code>F.scaled_dot_product_attention</code>: True = allowed. Test with a 3×3 causal mask and print the weights before trusting it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fully masked rows</span>
    <p>If every key in a row is masked (e.g. an all-padding example), softmax computes 0/0 = NaN, and NaN spreads through the batch. Make sure each query has at least one allowed key.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no positional information</span>
    <p>A self-attention model without positional encoding can't tell word order. If a custom model "ignores order", check that positions are actually added.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: batch_first and head shapes</span>
    <p><code>nn.MultiheadAttention</code> defaults to (seq, batch, d) unless <code>batch_first=True</code>; <code>F.scaled_dot_product_attention</code> expects (batch, heads, seq, d_head). Most shape bugs are a missing transpose between these.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading attention maps as explanations</span>
    <p>High weight means "this value was mixed in", not "this caused the prediction". Heads, residuals and later layers all change the picture. Treat attention plots as hints, not proof.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="transformers">Transformers</a> for the full architecture.</div>

  <h2 id="da2-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: the review "chai not good", translated to "chai achhi nahi hai". Encoder states h(chai) = [1, 0, 0.2], h(not) = [0, 1, 0.1], h(good) = [0.2, 0.3, 1]; decoder query while writing "nahi" s = [0, 2, 0]. For self-attention: chai = [0.1, 0.1], not = [0, 1], very = [1, 0], good = [0.6, 0.6] (dims: praise, negation).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our review</th><th>Weakness → next</th></tr>
    <tr><td>Bottleneck</td><td>why does seq2seq fail on long inputs?</td><td>0.54 at length 30</td><td>throws away all but one state</td></tr>
    <tr><td>Soft lookup</td><td>which input word matters now?</td><td>weights 0.098, 0.724, 0.178 → context [0.134, 0.777, 0.270]</td><td>which score function?</td></tr>
    <tr><td>Q, K, V + score functions</td><td>what is matched and handed over?</td><td>"negated?" → polarity −0.68; dot wins</td><td>dot grows with d</td></tr>
    <tr><td>√d scale</td><td>why doesn't softmax saturate?</td><td>scores ×16 → one-hot, gradient ≈ 0</td><td>only decoder → encoder so far</td></tr>
    <tr><td>Self-attention</td><td>how do words use context?</td><td>good → [0.27, 0.63] next to "not"</td><td>one pattern per word</td></tr>
    <tr><td>Multi-head</td><td>several patterns at once?</td><td>split, attend, concat, W<sub>O</sub></td><td>can see the future</td></tr>
    <tr><td>Masking</td><td>forbid future / padding?</td><td>not: [0.289, 0.711, 0]</td><td>order-blind</td></tr>
    <tr><td>Positional encoding</td><td>how does order get in?</td><td>pos 1 = [0.841, 0.540, 0.010, 1.000]</td><td>assemble the parts</td></tr>
    <tr><td>Transformer block</td><td>what replaces the RNN?</td><td>x + MHA(LN x); x + FFN(LN x)</td><td>→ Transformers note</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Attention (one query)</td><td>e<sub>j</sub> = score(q, k<sub>j</sub>); α = softmax(e); c = Σ<sub>j</sub> α<sub>j</sub> v<sub>j</sub></td><td>q query, k<sub>j</sub> keys, v<sub>j</sub> values, α weights summing to 1</td></tr>
    <tr><td>Softmax</td><td>α<sub>j</sub> = e<sup>e<sub>j</sub></sup> / Σ<sub>k</sub> e<sup>e<sub>k</sub></sup></td><td>subtract the max first for stability</td></tr>
    <tr><td>Scores</td><td>dot qᵀk · general qᵀWk · additive vᵀtanh(W₁q + W₂k)</td><td>Luong · Luong · Bahdanau</td></tr>
    <tr><td>Scaled dot-product</td><td>Attention(Q, K, V) = softmax(QKᵀ/√d<sub>k</sub> + M) V</td><td>Q n×d<sub>k</sub>, K m×d<sub>k</sub>, V m×d<sub>v</sub>; M mask (0 or −∞)</td></tr>
    <tr><td>Why √d<sub>k</sub></td><td>Var(q·k) = d<sub>k</sub> for unit-variance entries</td><td>std √4, √64, √512 = 2, 8, 22.6</td></tr>
    <tr><td>Projections</td><td>Q = XW<sub>Q</sub>, K = XW<sub>K</sub>, V = XW<sub>V</sub></td><td>X token vectors (self) or decoder / encoder states (cross)</td></tr>
    <tr><td>Multi-head</td><td>Concat(head<sub>1</sub> … head<sub>h</sub>) W<sub>O</sub>, head width d<sub>model</sub>/h</td><td>params 4·d²+4·d whatever h</td></tr>
    <tr><td>Causal mask</td><td>M<sub>ij</sub> = −∞ if j &gt; i</td><td>i query position, j key position</td></tr>
    <tr><td>Sinusoidal PE</td><td>PE(p, 2i) = sin(p/10000<sup>2i/d</sup>), PE(p, 2i+1) = cos(…)</td><td>p position, i pair index, d width</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Self-attention</b><p>Any sequence where distant elements interact: text, code, long time series, image patches.</p><small>Cost O(n²): long inputs need FlashAttention / windows</small></div>
    <div><b>Cross-attention</b><p>One sequence reading another: translation, captioning, retrieval-augmented models, text-to-image conditioning.</p><small>Q from target, K/V from source</small></div>
    <div><b>Causal mask</b><p>Generators predicting the next token; streaming outputs.</p><small>Not for encoders that see the whole input</small></div>
    <div><b>Prefer an RNN instead</b><p>Strict streaming with O(1) memory per step, tiny devices, very small datasets.</p><small>See the RNN note</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Softmax over the wrong axis; no scale or dividing by d instead of √d; masking after softmax; flipped bool-mask conventions; fully masked rows giving NaN; forgetting positions; batch_first and head shapes; reading attention maps as explanations; d<sub>model</sub> not divisible by heads.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Scores [0, 2, 0.6]: softmax weights?</td><td>1, 7.389, 1.822 / 10.211 = [0.098, 0.724, 0.178]</td></tr>
    <tr><td>Weights [0.25, 0.25, 0.5], values [10, 20, 30]: output?</td><td>2.5 + 5 + 15 = 22.5</td></tr>
    <tr><td>Why √d<sub>k</sub> and not d<sub>k</sub>?</td><td>The spread of q·k grows as √d<sub>k</sub>; dividing by d<sub>k</sub> over-flattens</td></tr>
    <tr><td>Causal mask, scores for "not" = [0.1, 1, 0.6]: weights?</td><td>[0.289, 0.711, 0]</td></tr>
    <tr><td>PE at p = 1, d = 4?</td><td>[sin 1, cos 1, sin 0.01, cos 0.01] = [0.841, 0.540, 0.010, 1.000]</td></tr>
  </table>

  <h2 id="da2-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problem did attention solve in seq2seq?</summary><div class="qa-body">The fixed-size context vector: the encoder had to compress the whole input into one vector, so long inputs lost information. Attention builds a fresh context per output step as a weighted sum of <em>all</em> encoder states. Our toy: at length 30, accuracy went from 0.54 to 0.95.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>By hand: scores are [0, 0, ln 2]. What are the softmax weights?</summary><div class="qa-body">e<sup>0</sup> = 1, 1, e<sup>ln 2</sup> = 2. Total 4. Weights = [0.25, 0.25, 0.5].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Values are [10, 20, 30] with weights [0.25, 0.25, 0.5]. What is the output?</summary><div class="qa-body">0.25·10 + 0.25·20 + 0.5·30 = 2.5 + 5 + 15 = 22.5. Attention's output is always a weighted average of the values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Q, K, V. Why separate K and V?</summary><div class="qa-body">Query: what this position wants. Key: what each position is matched on. Value: what it contributes when matched. Separating K from V lets a token be easy to find by one feature (key) yet hand over different, richer content (value); with K = V one vector must serve both jobs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bahdanau vs Luong attention?</summary><div class="qa-body">Bahdanau: additive score vᵀtanh(W₁s<sub>t−1</sub> + W₂h<sub>j</sub>) using the previous decoder state; context fed into the RNN step. Luong: multiplicative (dot sᵀh or general sᵀWh) using the current decoder state; context combined after the step; also local attention. Dot is a single matmul, so it's faster.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why scale by √d<sub>k</sub>?</summary><div class="qa-body">For unit-variance q, k, the dot product has variance d<sub>k</sub> (std √d<sub>k</sub>). Large scores saturate softmax to one-hot, where gradients vanish. Dividing by √d<sub>k</sub> restores unit variance. Demo at d = 512: average top weight 0.95 unscaled vs 0.32 scaled.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Self-attention vs cross-attention?</summary><div class="qa-body">Self: Q, K, V all projected from the same sequence (tokens attend to each other). Cross: Q from the decoder, K and V from the encoder output (the target attends to the source). Cross-attention is the Transformer's version of Bahdanau/Luong attention.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why multi-head instead of one big head?</summary><div class="qa-body">One head produces one weighting per token, averaging all relationship types. h heads with separate projections can each specialise (syntax, coreference, position). Same parameters and similar compute, since each head is d<sub>model</sub>/h wide.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shapes: Q is (2, 10, 64), K and V are (2, 7, 64). Shape of scores and output?</summary><div class="qa-body">Scores QKᵀ: (2, 10, 7), 10 queries × 7 keys. Output: (2, 10, 64), one vector per query. (Typical of cross-attention: target length 10, source length 7.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a causal mask work, and why not mask after softmax?</summary><div class="qa-body">Set scores above the diagonal to −∞ before softmax; e<sup>−∞</sup> = 0, so future tokens get zero weight and each row still sums to 1. Zeroing after softmax breaks the normalisation (our demo: rows summed to 0.09, 0.34, 0.47, 1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does attention need positional encoding?</summary><div class="qa-body">Attention is permutation-equivariant: shuffling inputs shuffles outputs identically (verified above), so order is invisible. Adding (sinusoidal / learned) or applying (RoPE) position information breaks the symmetry.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the complexity of self-attention and how is it reduced?</summary><div class="qa-body">O(n²·d) time and O(n²) memory for the score matrix. FlashAttention keeps time but makes memory O(n) by tiling; sliding-window / sparse attention cut time; KV caching avoids recomputation during generation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did Transformers replace RNNs?</summary><div class="qa-body">Any two tokens are one step apart (no vanishing through time), training is parallel over positions (RNNs are sequential), and they scale well with data and compute. Cost: O(n²) in sequence length and a growing KV cache at inference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does attention need softmax, and what breaks if you use raw scores as weights?</summary><div class="qa-body">The output must be a weighted <em>average</em>: weights positive and summing to 1, so its size does not depend on how many inputs there are. Raw scores can be negative (chai·s could be −3) and their sum grows with sentence length, so the "context" would grow with the number of words. Softmax gives positive weights summing to 1 and stays differentiable, unlike picking the max.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does self-attention need positional encoding when the RNN did not?</summary><div class="qa-body">The RNN reads word by word, so position is built into the computation: "chai not good" and "good not chai" give different h₃. Self-attention compares all pairs at once with no notion of order: shuffling the words just shuffles the outputs (verified on our review). Adding position vectors makes the same word at different positions look different.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did dot-product attention need the √d scale, while Bahdanau's additive attention did not?</summary><div class="qa-body">Additive scores pass through tanh, so they stay bounded whatever the width. Dot products add up d terms, so their spread grows as √d and softmax saturates (top weight 0.95 at d = 512; gradient ≈ 0). Dividing by √d keeps the spread near 1, so the fast dot product keeps working at large widths.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in a GPT-style model if you remove the causal mask during training but keep it at generation time?</summary><div class="qa-body">During training every position could see the next word, so the model learns to copy it and the loss looks excellent. At generation time the future does not exist, so the copying shortcut is gone and the model produces nonsense: a train/serve mismatch, like using a bidirectional RNN for live forecasting.</div></details>

</main>`
});
