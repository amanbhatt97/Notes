// dl/dl_attention.js — Attention Mechanisms
Object.assign(TOPIC_CONTENT, {
  "dl_attention": `<main>
  <h1>Attention Mechanisms</h1>
  <p class="lead">Attention lets a model look back at every input and pick what matters for the current step. It started as a fix for the seq2seq "one vector" bottleneck and became the core of the Transformer. This note computes scores, softmax and the weighted sum by hand with tiny vectors before any framework code, then covers query/key/value, Bahdanau vs Luong, self- and cross-attention, scaled dot-product, multi-head, masking and positional encoding. It builds on <a class="xref" data-note="dl_rnns">RNNs &amp; Sequential Models</a>. The full Transformer block lives in <a class="xref" data-note="transformers">Transformers</a>. Every code block ran here (numpy, PyTorch 2.14 CPU).</p>

  <h2 id="da2-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Attention</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why: the bottleneck</div>
        <ul>
          <li><b>Seq2seq</b> squeezes the whole input into one fixed vector</li>
          <li>Toy reverse task: 0.53 at length 30 without attention</li>
          <li><b>Attention</b> — at each output step, look back at <em>all</em> encoder states</li>
          <li>Same toy with attention: 0.94 at length 30</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The 3 steps</div>
        <ul>
          <li><b>1. Score</b> — dot(query, each key): [0.6, 0.3, 3.06]</li>
          <li><b>2. Softmax</b> — exp, divide by total → weights sum to 1: [.07, .06, .87]</li>
          <li><b>3. Weighted sum</b> — context = Σ α<sub>j</sub>·v<sub>j</sub>, fresh every step</li>
          <li>💡 Soft dictionary lookup: a blend of all values, weighted by key match</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Query · Key · Value</div>
        <ul>
          <li><b>Q</b> — what I am looking for · <b>K</b> — what I can be found by · <b>V</b> — what I hand over</li>
          <li>Hard lookup (dict) = one exact key; soft = weighted blend</li>
          <li>Transformer: Q = XW<sub>Q</sub>, K = XW<sub>K</sub>, V = XW<sub>V</sub> (learned)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bahdanau vs Luong</div>
        <ul>
          <li><b>Bahdanau (additive, 2014)</b> — vᵀtanh(W₁s<sub>t−1</sub> + W₂h<sub>j</sub>); previous decoder state</li>
          <li><b>Luong (multiplicative, 2015)</b> — dot sᵀh, general sᵀWh; current decoder state</li>
          <li>Dot = one matmul → fast; won on GPUs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Self vs cross</div>
        <ul>
          <li><b>Self</b> — Q, K, V from the same sequence; "bank" picks up "river" or "money"</li>
          <li><b>Cross</b> — Q from decoder, K &amp; V from encoder output</li>
          <li>Path between any 2 tokens = 1 (RNN: n)</li>
          <li>⚠ Cost O(n²) time and memory in sequence length</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scaled dot-product</div>
        <ul>
          <li><b>softmax(QKᵀ / √d<sub>k</sub>) V</b></li>
          <li>Shapes: Q n×d<sub>k</sub>, K m×d<sub>k</sub>, V m×d<sub>v</sub> → scores n×m → out n×d<sub>v</sub></li>
          <li><b>Why √d<sub>k</sub></b> — q·k has std √d<sub>k</sub>; unscaled softmax saturates → tiny grads</li>
          <li>Demo d=512: avg top weight 0.95 raw vs 0.32 scaled</li>
          <li><code>F.scaled_dot_product_attention</code> = fused (Flash) version</li>
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
          <li><b>Padding</b> — pad keys = −∞</li>
          <li>Apply <b>before softmax</b>; after → rows sum &lt; 1</li>
          <li>Bool mask: True = blocked (nn.MultiheadAttention), True = allowed (F.sdpa)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Position &amp; Transformer</div>
        <ul>
          <li><b>Attention is order-blind</b> — shuffle tokens → outputs just shuffle</li>
          <li><b>Sinusoidal</b>, <b>learned</b> (BERT), <b>RoPE</b>, <b>ALiBi</b> (modern LLMs)</li>
          <li><b>Transformer</b> — attention + FFN + residual + LayerNorm, no recurrence</li>
          <li>Encoder-only (BERT), decoder-only (GPT), enc-dec (T5)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="da2-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Bottleneck → Weighted Lookup</span><span class="rm-sub">Scores, softmax, sum by hand</span></div></div>
      <div class="rm-item rm-done" data-target="da2-qkv"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Query, Key, Value</span><span class="rm-sub">A soft dictionary</span></div></div>
      <div class="rm-item rm-done" data-target="da2-bl"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Bahdanau vs Luong</span><span class="rm-sub">Additive vs multiplicative</span></div></div>
      <div class="rm-item rm-done" data-target="da2-self"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Self &amp; Cross Attention</span><span class="rm-sub">Where Q, K, V come from</span></div></div>
      <div class="rm-item rm-done" data-target="da2-sdp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Scaled Dot-Product</span><span class="rm-sub">Why divide by √dₖ</span></div></div>
      <div class="rm-item rm-done" data-target="da2-mh"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Multi-Head Attention</span><span class="rm-sub">Several views in parallel</span></div></div>
      <div class="rm-item rm-done" data-target="da2-mask"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Masking</span><span class="rm-sub">Causal and padding</span></div></div>
      <div class="rm-item rm-done" data-target="da2-pos"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Positional Encoding</span><span class="rm-sub">Giving order back</span></div></div>
      <div class="rm-item rm-done" data-target="da2-tf"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Transformer Overview</span><span class="rm-sub">Where it all lands</span></div></div>
      <div class="rm-item rm-done" data-target="da2-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Scale, masks, shapes</span></div></div>
      <div class="rm-item rm-done" data-target="da2-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="da2-why"><span class="num">01</span>The Bottleneck → Attention as Weighted Lookup</h2>
  <p>Start from the problem left open in the RNN note. A seq2seq translator reads the whole French sentence with an encoder RNN and keeps only the <em>final</em> hidden state: one vector of, say, 64 numbers. The decoder must write the entire English sentence from that one vector. For 5 words it works. For 30 it doesn't: on our toy "reverse the digits" task, accuracy fell from 1.00 at length 5 to 0.53 at length 30.</p>
  <p>The fix in plain words: the encoder already computed a hidden state for <em>every</em> input word. Keep all of them. Each time the decoder is about to write a word, it asks "which input words matter right now?", gives each one a weight, and reads a weighted average of their states. While writing "student", it should mostly read "étudiant". That fresh, per-step average is called the <strong>context vector</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A translator who keeps the original page open on the desk. For each English word she writes, her eyes go back to the part of the French page that matters, mostly one word, a little of its neighbours. The old seq2seq translator had to close the page after one reading.</p>
  </div>
  <h3>Worked example: the three steps by hand</h3>
  <p>Three encoder states (3 numbers each, made up so the arithmetic is easy) and one decoder state s, the decoder's current "what am I looking for":</p>
  <table class="tbl">
    <tr><th>Encoder state</th><th>Vector</th></tr>
    <tr><td>h₁ (je)</td><td>[1.0, 0.0, 0.2]</td></tr>
    <tr><td>h₂ (suis)</td><td>[0.1, 1.0, 0.0]</td></tr>
    <tr><td>h₃ (étudiant)</td><td>[0.0, 0.2, 1.0]</td></tr>
    <tr><td>s (decoder, about to write "student")</td><td>[0.0, 0.3, 3.0]</td></tr>
  </table>
  <ol>
    <li><strong>Score</strong>: how well does each h<sub>j</sub> match s? Use the dot product (multiply matching positions, add). je: 1·0 + 0·0.3 + 0.2·3 = <strong>0.6</strong>. suis: 0.1·0 + 1·0.3 + 0·3 = <strong>0.3</strong>. étudiant: 0·0 + 0.2·0.3 + 1·3 = <strong>3.06</strong>.</li>
    <li><strong>Softmax</strong>: turn scores into weights that are positive and add to 1. Take e<sup>score</sup>: e<sup>0.6</sup> = 1.82, e<sup>0.3</sup> = 1.35, e<sup>3.06</sup> = 21.33. Total = 24.5. Divide each by the total: <strong>0.074, 0.055, 0.871</strong>.</li>
    <li><strong>Weighted sum</strong>: context = 0.074·h₁ + 0.055·h₂ + 0.871·h₃. First number: 0.074·1 + 0.055·0.1 + 0.871·0 = 0.08. Second: 0 + 0.055 + 0.174 = 0.23. Third: 0.015 + 0 + 0.871 = 0.89. Context = <strong>[0.08, 0.23, 0.89]</strong>, almost h₃.</li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 600 245" width="600">
<rect x="230" y="20" width="140" height="40" rx="6" class="ft st"/>
<text x="300" y="38" text-anchor="middle">decoder state s</text>
<text x="300" y="53" text-anchor="middle" class="tm">emitting "student"</text>
<g text-anchor="middle">
<rect x="60" y="150" width="110" height="36" rx="6" class="fb sb"/><text x="115" y="173">je</text>
<rect x="245" y="150" width="110" height="36" rx="6" class="fb sb"/><text x="300" y="173">suis</text>
<rect x="430" y="150" width="110" height="36" rx="6" class="fb sb"/><text x="485" y="173">étudiant</text>
<text x="115" y="206" class="tm">h₁</text><text x="300" y="206" class="tm">h₂</text><text x="485" y="206" class="tm">h₃</text>
</g>
<line x1="270" y1="60" x2="115" y2="150" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.5"/>
<line x1="300" y1="60" x2="300" y2="150" stroke="currentColor" stroke-width="1.1" stroke-opacity="0.5"/>
<line x1="330" y1="60" x2="485" y2="150" class="sg" stroke-width="9"/>
<g text-anchor="middle">
<text x="160" y="95">α = 0.07</text><text x="335" y="110">0.06</text><text x="455" y="95" class="tg">0.87</text>
</g>
<text x="300" y="234" text-anchor="middle" class="tg">context c = 0.07·h₁ + 0.06·h₂ + 0.87·h₃</text>
</svg><figcaption>While emitting "student", the decoder's state matches "étudiant" best, so the context vector is mostly h₃. Line thickness = attention weight.</figcaption></figure>
  <p>The same three steps in numpy. Each numbered comment is one step of the hand calculation:</p>
  <div class="fx" data-lang="py">import numpy as np
enc = np.array([[1.0, 0.0, 0.2],     # h1  je
                [0.1, 1.0, 0.0],     # h2  suis
                [0.0, 0.2, 1.0]])    # h3  étudiant
s = np.array([0.0, 0.3, 3.0])        # decoder state while emitting "student"

scores = enc @ s                     # 1. one dot product per encoder state
e = np.exp(scores)                   # 2a. make every score positive
w = e / e.sum()                      # 2b. divide by the total -&gt; weights sum to 1
ctx = w @ enc                        # 3. weighted sum of the encoder states
print("scores ", scores.round(2))
print("exp    ", e.round(2), " total", e.sum().round(2))
print("weights", w.round(3), " sum", w.sum())
print("context", ctx.round(2))</div>
  <div class="fx" data-lang="text">scores  [0.6  0.3  3.06]
exp     [ 1.82  1.35 21.33]  total 24.5
weights [0.074 0.055 0.871]  sum 1.0
context [0.08 0.23 0.89]</div>
  <p>Every number matches the hand work. <code>enc @ s</code> does all three dot products at once (a matrix times a vector). <code>w @ enc</code> is the weighted sum: it multiplies each row of <code>enc</code> by its weight and adds the rows. Notice what softmax did: a score gap of about 2.5 became a weight ratio of about 12 to 1, so the best match dominates without the others being zeroed out completely.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Attention</strong>: given a query s and items h<sub>1</sub>…h<sub>n</sub>, compute scores e<sub>j</sub> = score(s, h<sub>j</sub>), weights α<sub>j</sub> = softmax(e)<sub>j</sub> = e<sup>e<sub>j</sub></sup> / Σ<sub>k</sub> e<sup>e<sub>k</sub></sup>, and output c = Σ<sub>j</sub> α<sub>j</sub>h<sub>j</sub>. The weights α are also called the <strong>alignment</strong>: which input each output step "looks at".</p>
  </div>
  <h3>Does it really fix the bottleneck?</h3>
  <p>The experiment: a GRU encoder-decoder (hidden 64) learns to reverse random digit lists of length 4–30. The only difference between the two runs is the <code>if self.attn:</code> branch, which adds the three steps above using the decoder's current state as the query and all encoder states as the items.</p>
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
  <div class="fx" data-lang="text">no-attn {5: 1.0, 10: 0.95, 20: 0.69, 30: 0.53}
attn {5: 1.0, 10: 1.0, 20: 0.98, 30: 0.94}</div>
  <table class="tbl out"><caption>Per-token accuracy on fresh sequences (chance = 0.10). Each run takes about 3 minutes on a CPU; the second decimal can shift by ±0.02 with a different CPU thread count.</caption>
    <tr><th>Length</th><th>5</th><th>10</th><th>20</th><th>30</th></tr>
    <tr><td>No attention</td><td>1.00</td><td>0.95</td><td>0.69</td><td>0.53</td></tr>
    <tr><td><strong>With attention</strong></td><td>1.00</td><td>1.00</td><td>0.98</td><td>0.94</td></tr>
  </table>
  <p>Same model size, same training. At length 30 accuracy goes from 0.53 to 0.94. In the code, <code>enc_out</code> (all encoder states) is what the attention branch reads; the no-attention branch only ever sees <code>h</code>. The <code>einsum</code> strings are batch versions of our numpy lines: <code>'bh,bsh-&gt;bs'</code> is "dot the query with every encoder state", <code>'bs,bsh-&gt;bh'</code> is "weighted sum".</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Softmax is taken over the <em>input positions</em> (the axis of the encoder states), not over the hidden features. In the code that is <code>dim=1</code> of a (batch, source_len) tensor. Softmax over the wrong axis still runs and still gives numbers that sum to 1, just meaningless ones.</p>
  </div>

  <h2 id="da2-qkv"><span class="num">02</span>Query, Key, Value: a Soft Dictionary</h2>
  <p>You already know a lookup: a Python dict. <code>menu["chai"]</code> finds the one key that matches exactly and returns its value. That is a <strong>hard lookup</strong>: one exact match or a KeyError. Neural networks can't learn through "exact match or crash", because it has no gradient. Attention is the <strong>soft</strong> version: compare the query with every key, turn the match scores into weights, and return a weighted blend of all the values.</p>
  <p>This splits each item into two roles. The <strong>key</strong> is what an item is found by (like a dictionary key). The <strong>value</strong> is what it hands over when found. The <strong>query</strong> is what the current step is looking for. In section 01, keys and values were the same vectors (the encoder states). They don't have to be.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>At a tea stall you say "something hot". The stall owner doesn't need an exact menu name. He mentally matches "hot" against each item's description (keys) and leans toward chai and coffee. If he could serve a blend, you would get mostly chai and coffee and a little lassi, priced accordingly (values).</p>
  </div>
  <p>Worked example: keys are 2-number descriptions (hot, cold-sweet), values are prices. Query "something hot" = [2, 0]. Scores = key·query: chai 2, coffee 1.6, lassi 0. Softmax gives about 0.55, 0.37, 0.08. Blended price ≈ 0.55·15 + 0.37·30 + 0.08·40 ≈ ₹22.</p>
  <div class="fx" data-lang="py">def softmax(z):
    e = np.exp(z - z.max(-1, keepdims=True))     # subtract max: same answer, no overflow
    return e / e.sum(-1, keepdims=True)

menu = {"chai": 15, "coffee": 30, "lassi": 40}   # hard lookup: Python dict
print("hard:", menu["chai"])

keys = np.array([[1.0, 0.0],    # chai   : (hot, cold-sweet)
                 [0.8, 0.1],    # coffee
                 [0.0, 1.0]])   # lassi
values = np.array([15.0, 30.0, 40.0])
query = np.array([2.0, 0.0])    # "something hot"
w = softmax(keys @ query)
print("weights", w.round(3), "-&gt; blended value", (w @ values).round(2))
query = np.array([0.0, 2.0])    # "something cold"
w = softmax(keys @ query)
print("weights", w.round(3), "-&gt; blended value", (w @ values).round(2))</div>
  <div class="fx" data-lang="text">hard: 15
weights [0.554 0.371 0.075] -&gt; blended value 22.44
weights [0.104 0.127 0.769] -&gt; blended value 36.13</div>
  <p>The "hot" query puts 55% on chai and 37% on coffee, so the answer is near their prices. Change the query to "cold" and lassi takes 77% of the weight. Nothing else changed: the query alone steered the lookup. The <code>softmax</code> function here subtracts the max first; e<sup>1000</sup> would overflow, but softmax gives the same result for z and z − c, so this is safe. We reuse this function for the rest of the note.</p>
  <p>Where do Q, K, V come from in a real model? From the token vectors themselves, through three learned matrices: Q = XW<sub>Q</sub>, K = XW<sub>K</sub>, V = XW<sub>V</sub>. Training adjusts these matrices so that useful queries match useful keys. Section 05 shows the full formula.</p>
  <div class="callout def"><span class="label">Query · Key · Value</span>
    <p><strong>Query</strong> q: what the current position is looking for. <strong>Key</strong> k<sub>j</sub>: what item j is matched on. <strong>Value</strong> v<sub>j</sub>: what item j contributes when matched. Output = Σ<sub>j</sub> softmax(q·k)<sub>j</sub> v<sub>j</sub>. In classic seq2seq attention keys = values = encoder states; in Transformers they are separate learned projections.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Attention never returns "nothing found". Softmax weights always add to 1, so even if no key matches well, the output is still some blend of values. Models learn workarounds (attending to a start token as a "no-op"); keep this in mind when reading attention maps.</p>
  </div>
  <p>Interview angle: "explain Q, K, V" is asked in almost every NLP or LLM interview. The dictionary analogy plus "why separate K and V" (a token can be easy to find by one feature but hand over different content) is the expected answer.</p>

  <h2 id="da2-bl"><span class="num">03</span>Bahdanau vs Luong Attention</h2>
  <p>Step 1 of attention needs a <strong>score function</strong>: a number saying how well the decoder state s matches encoder state h<sub>j</sub>. The two classic RNN-era papers differ mainly here. Bahdanau et al. (2014) used a small neural network, called <strong>additive</strong> attention. Luong et al. (2015) used a dot product, called <strong>multiplicative</strong> attention, plus a "general" version with a learned matrix in the middle.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Matching a job applicant to a role. Luong's dot product is a checklist: multiply "skill needed" by "skill had" item by item and add. Bahdanau's additive score is a small interview panel: it combines both profiles, thinks about them through a nonlinearity (tanh), and gives one score. The panel is more flexible; the checklist is much faster.</p>
  </div>
  <p>Worked example with 2-number vectors. Encoder states h₁ = [1, 0], h₂ = [0, 1], h₃ = [1, 1]; decoder state s = [0.5, 1].</p>
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
    <p>Plain dot-product scores grow with vector width (section 05). Additive attention doesn't have this problem because tanh bounds it, which is why early comparisons found additive better at large sizes. The fix is the √d<sub>k</sub> scale, not abandoning the dot product.</p>
  </div>

  <h2 id="da2-self"><span class="num">04</span>Self-Attention &amp; Cross-Attention</h2>
  <p>So far a decoder looked at an encoder. Now turn attention inward. In <strong>self-attention</strong> every word in a sentence is a query, and the keys and values are the words of the <em>same</em> sentence. Each word builds a new version of itself as a blend of the words around it. Why? A word's meaning depends on its neighbours. In "the river bank" and "the money bank", the word "bank" starts with the same vector; after self-attention it should lean toward "water" in one and "finance" in the other.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A WhatsApp family group. Each message ("bring it tonight") only makes sense once you look at the other messages in the same group ("Mummy's birthday cake"). Self-attention is every message reading every other message in its own group. Cross-attention is reading a different group to answer a question in yours.</p>
  </div>
  <p>Worked example with 2-number word vectors, where the first number means "water" and the second "finance". the = [0.1, 0.1], river = [1, 0], money = [0, 1], bank = [0.6, 0.6] (half and half: ambiguous). To keep it by-hand, Q = K = V = the word vectors (no learned projections yet). For "bank" in "the river bank": scores = bank·the = 0.12, bank·river = 0.6, bank·bank = 0.72. Softmax → 0.23, 0.36, 0.41. New bank = 0.23·[0.1, 0.1] + 0.36·[1, 0] + 0.41·[0.6, 0.6] = <strong>[0.63, 0.27]</strong>: now more "water" than "finance".</p>
  <div class="fx" data-lang="py">vec = {"the":   np.array([0.1, 0.1]),
       "river": np.array([1.0, 0.0]),     # dim 0 ~ "water"
       "money": np.array([0.0, 1.0]),     # dim 1 ~ "finance"
       "bank":  np.array([0.6, 0.6])}     # ambiguous: half and half

def self_attend(words):
    X = np.stack([vec[w] for w in words])  # (3, 2)
    A = softmax(X @ X.T)                   # Q = K = V = X (no projections yet)
    return A, A @ X

for sent in (["the", "river", "bank"], ["the", "money", "bank"]):
    A, out = self_attend(sent)
    print(" ".join(sent), "| bank attends", A[2].round(2), "| new bank =", out[2].round(2))

rng = np.random.default_rng(0)             # cross-attention: 2 decoder positions ask 3 encoder positions
enc_out = rng.normal(size=(3, 4))          # source length 3, d = 4
dec_states = rng.normal(size=(2, 4))       # target length 2
A = softmax(dec_states @ enc_out.T / np.sqrt(4))
print("cross weights shape", A.shape, " output shape", (A @ enc_out).shape)</div>
  <div class="fx" data-lang="text">the river bank | bank attends [0.23 0.36 0.41] | new bank = [0.63 0.27]
the money bank | bank attends [0.23 0.36 0.41] | new bank = [0.27 0.63]
cross weights shape (2, 3)  output shape (2, 4)</div>
  <p>The same "bank" vector comes out as [0.63, 0.27] next to "river" and [0.27, 0.63] next to "money". This is the core idea behind <strong>contextual embeddings</strong> in BERT and GPT: a word's vector depends on its sentence. <code>X @ X.T</code> computes every word-vs-word score at once (a 3×3 table), and <code>A @ X</code> does every weighted sum at once. In the cross-attention part the queries come from 2 decoder positions and keys/values from 3 encoder positions, so the weight table is 2×3: one row per query, one column per source word.</p>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600">
<defs><marker id="da2-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="140" y="20" text-anchor="middle">Self-attention</text>
<g text-anchor="middle">
<rect x="20" y="150" width="70" height="30" rx="5" class="fb sb"/><text x="55" y="170">the</text>
<rect x="105" y="150" width="70" height="30" rx="5" class="fb sb"/><text x="140" y="170">river</text>
<rect x="190" y="150" width="70" height="30" rx="5" class="fb sb"/><text x="225" y="170">bank</text>
</g>
<g fill="none" stroke="currentColor" stroke-opacity="0.6">
<path d="M225,150 C225,90 140,90 140,148" class="sg" stroke-width="3" stroke-opacity="1"/>
<path d="M225,150 C225,60 55,60 55,148"/>
<path d="M140,150 C140,110 55,110 55,148"/>
</g>
<text x="140" y="45" text-anchor="middle" class="tm">Q, K, V all from one sequence</text>
<text x="140" y="200" text-anchor="middle" class="tg">"bank" attends to "river"</text>
<line x1="300" y1="15" x2="300" y2="200" stroke="currentColor" stroke-opacity="0.25"/>
<text x="460" y="20" text-anchor="middle">Cross-attention</text>
<g text-anchor="middle">
<rect x="330" y="60" width="100" height="90" rx="6" class="fb sb"/><text x="380" y="98">encoder</text><text x="380" y="114">output</text>
<rect x="490" y="60" width="100" height="90" rx="6" class="ft st"/><text x="540" y="98">decoder</text><text x="540" y="114">states</text>
<text x="380" y="175" class="tb">K, V</text><text x="540" y="175">Q</text>
</g>
<line x1="488" y1="105" x2="434" y2="105" stroke="currentColor" marker-end="url(#da2-ar1)"/>
<text x="460" y="96" text-anchor="middle" class="tm">ask</text>
<text x="460" y="200" text-anchor="middle" class="tm">each target token queries the source</text>
</svg><figcaption>Self-attention links tokens within one sequence; cross-attention lets the decoder query the encoder (the Transformer version of Bahdanau/Luong).</figcaption></figure>
  <div class="cards">
    <div><b>Self-attention</b><p>Q = XW<sub>Q</sub>, K = XW<sub>K</sub>, V = XW<sub>V</sub>, same X.</p><small>Encoder layers; BERT</small></div>
    <div><b>Masked self-attention</b><p>Same, but each token sees only the past (section 07).</p><small>Decoder layers; GPT</small></div>
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

  <h2 id="da2-sdp"><span class="num">05</span>Scaled Dot-Product Attention</h2>
  <p>Now put everything into the one formula used inside every Transformer. With many queries at once, we stack them as rows of a matrix Q, keys as rows of K, values as rows of V. Then the three steps become three matrix operations: QKᵀ gives every query-key score in one table; softmax each row; multiply by V for the weighted sums. One extra step: divide the scores by √d<sub>k</sub> (d<sub>k</sub> = length of each key vector) before the softmax. We'll see why right after the worked example.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A class of 3 students (queries) each choosing study partners from 3 tutors (keys). The score table is a 3×3 grid: row = student, column = tutor. Each student splits her hour (weights summing to 1) across tutors and leaves with a mix of their notes (values).</p>
  </div>
  <p>Worked example, d<sub>k</sub> = 2. Q = [[1, 0], [0, 2], [1, 1]], K = [[2, 0], [0, 1], [1, 1]], V = [[10, 0], [0, 10], [5, 5]].</p>
  <ol>
    <li><strong>Scores QKᵀ</strong>: row 1 (q = [1, 0]) against the three keys: 2, 0, 1. Row 2 (q = [0, 2]): 0, 2, 2. Row 3 (q = [1, 1]): 2, 1, 2.</li>
    <li><strong>Scale</strong> by √2 ≈ 1.414: row 1 becomes 1.41, 0, 0.71.</li>
    <li><strong>Softmax row 1</strong>: e<sup>1.41</sup> = 4.11, e<sup>0</sup> = 1, e<sup>0.71</sup> = 2.03, total 7.14 → 0.58, 0.14, 0.28.</li>
    <li><strong>Output row 1</strong>: 0.58·[10, 0] + 0.14·[0, 10] + 0.28·[5, 5] = [5.8 + 1.4, 1.4 + 1.4] ≈ <strong>[7.18, 2.82]</strong>.</li>
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
  <p>Row 1 of every matrix matches the hand steps. Row 2 is a nice check: query [0, 2] scores keys 2 and 3 equally (2 and 2), so they get equal weight 0.45. The function <code>attention</code> packs the formula into four lines; <code>K.swapaxes(-1, -2)</code> is Kᵀ that also works with extra batch or head dimensions, and the <code>mask</code> argument is used in section 07.</p>
  <h3>Why divide by √d<sub>k</sub></h3>
  <p>A dot product adds up d<sub>k</sub> products. If each product is random with spread 1, the sum has a spread (standard deviation) of √d<sub>k</sub>. With d<sub>k</sub> = 512 scores look like ±22 instead of ±1. Softmax of big numbers puts almost all weight on one item (nearly one-hot), and a nearly one-hot softmax has nearly zero gradient: learning stalls. The experiment below measures the average largest weight over 2,000 random trials with 10 keys:</p>
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

  <h2 id="da2-mh"><span class="num">06</span>Multi-Head Attention</h2>
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
  <p>Our hand-built version equals PyTorch's, so multi-head attention really is just "split, attend, concat, project". The key lines are <code>split</code> (reshape + transpose, no new weights) and <code>concat</code> (the reverse). PyTorch stores W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> stacked in one <code>in_proj_weight</code> of shape (12, 4); we sliced it into three. Our <code>attention</code> function from section 05 worked unchanged on the extra head axis.</p>
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

  <h2 id="da2-mask"><span class="num">07</span>Masking</h2>
  <p>The need, two cases. First, a text generator (GPT) is trained to predict the next word at every position at once. If position 3 could attend to position 4, it would just copy the answer: cheating. Second, batches are padded with filler tokens, and real words should not attend to filler. The idea: before softmax, set the forbidden scores to −∞. Since e<sup>−∞</sup> = 0, those positions get weight exactly 0, and softmax spreads the full 1 over the allowed positions.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket commentator can talk about balls already bowled, never the next ball. The causal mask enforces exactly that. A padding mask is like ignoring the blank overs at the end of a rain-shortened scorecard.</p>
  </div>
  <p>Worked example: 4 tokens, "I love masala chai", with some given scores. The causal mask blocks everything above the diagonal. Row 2 ("love") may see only "I" and "love": its scores 0.5 and 1.0 survive, the rest become −∞. Softmax of [0.5, 1.0]: e<sup>0.5</sup> = 1.65, e<sup>1</sup> = 2.72, total 4.37 → <strong>0.38, 0.62</strong>, then zeros.</p>
  <div class="fx" data-lang="py">S = np.array([[1.0, 2.0, 0.0, 3.0],          # scores for 4 tokens: "I love masala chai"
              [0.5, 1.0, 2.0, 0.0],
              [1.0, 0.0, 1.0, 2.0],
              [0.0, 1.0, 1.0, 1.0]])
causal = np.triu(np.ones((4, 4), dtype=bool), k=1)   # True above the diagonal = future
print(causal.astype(int))
masked = np.where(causal, -np.inf, S)
A = softmax(masked)
print(A.round(2), "row sums", A.sum(1))

wrong = softmax(S) * ~causal                  # zero AFTER softmax: rows no longer sum to 1
print("mask after softmax, row sums:", wrong.sum(1).round(2))</div>
  <div class="fx" data-lang="text">[[0 1 1 1]
 [0 0 1 1]
 [0 0 0 1]
 [0 0 0 0]]
[[1.   0.   0.   0.  ]
 [0.38 0.62 0.   0.  ]
 [0.42 0.16 0.42 0.  ]
 [0.11 0.3  0.3  0.3 ]] row sums [1. 1. 1. 1.]
mask after softmax, row sums: [0.09 0.34 0.47 1.  ]</div>
  <p><code>np.triu(..., k=1)</code> marks the strict upper triangle (the future). <code>np.where(causal, -np.inf, S)</code> replaces those scores. Row 1 can only see itself, so it puts weight 1 on "I". Row 2 is our hand result. The last line shows the classic bug: zeroing after softmax leaves rows that sum to 0.09, 0.34, 0.47, so the outputs shrink in a position-dependent way.</p>
  <p>In PyTorch, the same causal mask on the 8-head layer from section 06:</p>
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

  <h2 id="da2-pos"><span class="num">08</span>Positional Encoding</h2>
  <p>The need: an RNN knows order because it reads step by step. Attention doesn't read in order at all: it compares every token with every token in one shot. Look at the formula: nothing in softmax(QKᵀ/√d)V mentions positions. So "dog bites man" and "man bites dog" contain the same tokens and produce the same outputs, just in a different order. Let's prove it by shuffling the tokens:</p>
  <div class="fx" data-lang="py">perm = torch.tensor([4, 2, 0, 3, 1])
o1, _ = mha(x, x, x); o2, _ = mha(x[:, perm], x[:, perm], x[:, perm])
print("order-blind:", torch.allclose(o1[:, perm], o2, atol=1e-6))</div>
  <div class="fx" data-lang="text">order-blind: True</div>
  <p>Shuffling the input just shuffles the output the same way (<code>o1[:, perm]</code> equals <code>o2</code>). Attention alone treats a sentence as a bag of words. The fix in plain words: add a "where am I" vector to each word vector before attention, different for each position. Now the same word at position 2 and position 7 looks different, and the model can learn to use that.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Seat numbers on an IRCTC ticket. The passengers are the same people, but the seat number tells where each one sits. Positional encoding stamps a seat number onto every word.</p>
  </div>
  <p>The original Transformer uses fixed sine and cosine waves of different speeds. Position p, dimension pair i gets sin(p / 10000<sup>2i/d</sup>) and cos(p / 10000<sup>2i/d</sup>). Worked example for d = 8 at position 1: the first pair uses speed 1, giving sin(1) = 0.84, cos(1) = 0.54; the second pair uses speed 1/10 (since 10000<sup>2/8</sup> = 10), giving sin(0.1) = 0.10, cos(0.1) = 1.00; the later pairs move even slower.</p>
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
  <p>Row 1 (position 1) matches the hand values. Early dimensions change fast from row to row, later ones slowly, like the seconds, minutes and hours hands of a clock: together they give every position a unique reading. Nearby positions get similar vectors (dot 3.54 for 10 vs 11) and far ones less similar (1.97 for 10 vs 30). In a model, <code>pe</code> is simply added to the token embeddings: <code>X = token_emb + pe[:n]</code>.</p>
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

  <h2 id="da2-tf"><span class="num">09</span>Transformer Overview</h2>
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

  <h2 id="da2-traps"><span class="num">10</span>Common Mistakes</h2>
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

  <h2 id="da2-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problem did attention solve in seq2seq?</summary><div class="qa-body">The fixed-size context vector: the encoder had to compress the whole input into one vector, so long inputs lost information. Attention builds a fresh context per output step as a weighted sum of <em>all</em> encoder states. Our toy: at length 30, accuracy went from 0.53 to 0.94.</div></details>
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
</main>`
});
