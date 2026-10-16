// dl/dl_attention.js — Attention Mechanisms
Object.assign(TOPIC_CONTENT, {
  "dl_attention": `<main>
  <h1>Attention Mechanisms</h1>
  <p class="lead">Attention lets a model look back at every input and pick what matters for the current step. It started as a fix for seq2seq's one-vector problem and became the core of the Transformer. This page covers weighted lookup, Bahdanau vs Luong, self- and cross-attention, scaled dot-product, multi-head, masking and positional encoding. It builds on RNNs and seq2seq. The full Transformer block is covered in <strong>Generative AI → Transformers</strong>; this note follows the attention mechanism itself. All code ran here (PyTorch 2.14 CPU, numpy).</p>

  <h2 id="da2-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Attention</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why: the bottleneck</div>
        <ul>
          <li><b>Seq2seq</b> squeezes the whole input into one fixed vector</li>
          <li>Long inputs lose information; toy reverse task drops to 0.53 at length 30</li>
          <li><b>Attention</b> — at each output step, look back at <em>all</em> encoder states</li>
          <li>Same toy with attention: 0.94 at length 30</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Weighted lookup</div>
        <ul>
          <li><b>Score</b> each encoder state h<sub>j</sub> against decoder state s</li>
          <li><b>softmax</b> → weights α (sum to 1) = alignment</li>
          <li><b>Context</b> c = Σ α<sub>j</sub>h<sub>j</sub>, fresh at every step</li>
          <li><b>Q/K/V</b> — query = what I want, key = what I match on, value = what I hand over</li>
          <li>💡 Soft dictionary lookup: blend of all values, weighted by key match</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bahdanau vs Luong</div>
        <ul>
          <li><b>Bahdanau (additive, 2014)</b> — vᵀtanh(W₁s<sub>t−1</sub> + W₂h<sub>j</sub>); prev. decoder state; bi-RNN encoder</li>
          <li><b>Luong (multiplicative, 2015)</b> — dot sᵀh, general sᵀWh; current decoder state</li>
          <li>Dot = one matmul → fast; additive better for unscaled large d</li>
          <li>Luong also: global vs local (window) attention</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Self vs cross</div>
        <ul>
          <li><b>Self</b> — Q, K, V from the same sequence; every token sees every token</li>
          <li><b>Cross (enc-dec)</b> — Q from decoder, K &amp; V from encoder output</li>
          <li><b>Masked self</b> — decoder self-attention with causal mask</li>
          <li>Path length between any 2 tokens = 1 (RNN: n)</li>
          <li>⚠ Cost O(n²) time and memory in sequence length</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scaled dot-product</div>
        <ul>
          <li><b>softmax(QKᵀ / √d<sub>k</sub>) V</b></li>
          <li>Shapes: Q n×d<sub>k</sub>, K m×d<sub>k</sub>, V m×d<sub>v</sub> → scores n×m → out n×d<sub>v</sub></li>
          <li><b>Why √d<sub>k</sub></b> — q·k has variance d<sub>k</sub>; unscaled softmax saturates → tiny grads</li>
          <li>Demo d=512: avg top weight 0.95 raw vs 0.32 scaled</li>
          <li><code>F.scaled_dot_product_attention</code> = fused (Flash) version</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multi-head</div>
        <ul>
          <li><b>h heads</b>, each d<sub>model</sub>/h wide, own W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub></li>
          <li>Concat → W<sub>O</sub>; same params as 1 head (16,640 both at d=64)</li>
          <li>Heads specialise: syntax, coreference, nearby tokens</li>
          <li>⚠ d<sub>model</sub> must divide by num_heads</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Masking</div>
        <ul>
          <li><b>Padding mask</b> — ignore pad tokens (keys)</li>
          <li><b>Causal mask</b> — token t can't see t+1…; upper triangle = −∞</li>
          <li>Apply <b>before softmax</b> → e<sup>−∞</sup> = 0, rows still sum to 1</li>
          <li>PyTorch bool mask: <b>True = blocked</b> (nn.MultiheadAttention)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Position &amp; Transformer</div>
        <ul>
          <li><b>Attention is order-blind</b> — shuffle tokens → outputs just shuffle</li>
          <li><b>Sinusoidal</b> — sin/cos at many frequencies, added to embeddings</li>
          <li><b>Learned</b> (BERT, GPT-2); <b>RoPE</b>, <b>ALiBi</b> (relative; modern LLMs)</li>
          <li><b>Transformer (2017)</b> — attention only, no recurrence; + FFN, residual, LayerNorm</li>
          <li>Encoder-only (BERT), decoder-only (GPT), enc-dec (T5) → GenAI 02</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="da2-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Bottleneck → Weighted Lookup</span><span class="rm-sub">Look back at every input</span></div></div>
      <div class="rm-item rm-done" data-target="da2-bl"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Bahdanau vs Luong</span><span class="rm-sub">Additive vs multiplicative</span></div></div>
      <div class="rm-item rm-done" data-target="da2-self"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Self &amp; Cross Attention</span><span class="rm-sub">Where Q, K, V come from</span></div></div>
      <div class="rm-item rm-done" data-target="da2-sdp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Scaled Dot-Product</span><span class="rm-sub">Why divide by √dₖ</span></div></div>
      <div class="rm-item rm-done" data-target="da2-mh"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Multi-Head Attention</span><span class="rm-sub">Several views in parallel</span></div></div>
      <div class="rm-item rm-done" data-target="da2-mask"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Masking</span><span class="rm-sub">Padding and causal</span></div></div>
      <div class="rm-item rm-done" data-target="da2-pos"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Positional Encoding</span><span class="rm-sub">Giving order back</span></div></div>
      <div class="rm-item rm-done" data-target="da2-tf"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Transformer Overview</span><span class="rm-sub">Where it all lands</span></div></div>
      <div class="rm-item rm-done" data-target="da2-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="da2-why"><span class="num">01</span>The Bottleneck → Attention as Weighted Lookup</h2>
  <p>Attention gives each output step its own summary of the input. It scores every input word against what the decoder needs now, turns the scores into weights that add up to 1, and takes the weighted average.</p>
  <div class="flow"><span>Seq2seq: input → one vector c</span><span>Long input doesn't fit</span><span>Attention: new c<sub>t</sub> per output step</span><span>Built from <em>all</em> encoder states</span></div>
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
</svg><figcaption>While emitting "student", the decoder's query matches "étudiant" best, so the context vector is mostly h₃. Weights from the run below.</figcaption></figure>
  <div class="fx" data-lang="py">import numpy as np
def softmax(z): e = np.exp(z - z.max(-1, keepdims=True)); return e / e.sum(-1, keepdims=True)
enc = np.array([[1.0, 0.0, 0.2],     # je         (toy encoder states h_j)
                [0.1, 1.0, 0.0],     # suis
                [0.0, 0.2, 1.0]])    # étudiant
s = np.array([0.0, 0.3, 3.0])        # decoder state while emitting "student"
scores = enc @ s                     # Luong dot score
w = softmax(scores)                  # alignment weights
ctx = w @ enc                        # context = weighted sum of encoder states
print("scores ", scores.round(2)); print("weights", w.round(2)); print("context", ctx.round(2))</div>
  <div class="fx" data-lang="text">scores  [0.6  0.3  3.06]
weights [0.07 0.06 0.87]
context [0.08 0.23 0.89]</div>
  <div class="callout def"><span class="label">Query · Key · Value</span>
    <p><strong>Query</strong>: what the current step is looking for (decoder state). <strong>Key</strong>: what each item is matched on. <strong>Value</strong>: what each item hands over. In classic seq2seq attention, keys = values = encoder states.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A soft search engine. Your query is compared with every document title (keys); instead of returning the top hit, it returns a blend of all document contents (values), weighted by how well each title matched.</p>
  </div>
  <p>Same toy as the RNN note (GRU seq2seq, hidden 64, reverse random digits, trained on lengths 4–30, 3,000 steps). Adding the 3 lines of dot attention above:</p>
  <table class="tbl out"><caption>Per-token accuracy on fresh sequences (real runs; chance = 0.10)</caption>
    <tr><th>Length</th><th>5</th><th>10</th><th>20</th><th>30</th></tr>
    <tr><td>No attention</td><td>1.00</td><td>0.95</td><td>0.69</td><td>0.53</td></tr>
    <tr><td><strong>With attention</strong></td><td>1.00</td><td>1.00</td><td>0.98</td><td>0.94</td></tr>
  </table>
  <h3>The experiment code</h3>
  <div class="fx" data-lang="py">V, H, BOS = 12, 64, 1
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
                w = F.softmax(torch.einsum('bh,bsh-&gt;bs', h, enc_out), dim=1)
                ctx = torch.einsum('bs,bsh-&gt;bh', w, enc_out)
                logits.append(self.out(torch.cat([h, ctx], 1)))
            else:
                logits.append(self.out(h))        # only the squeezed final state
        return torch.stack(logits, 1)
def batch(n, L):
    src = torch.randint(2, V, (n, L)); tgt = src.flip(1)          # task: reverse the sequence
    return src, torch.cat([torch.full((n,1), BOS), tgt[:, :-1]], 1), tgt
# train: 3000 Adam steps (lr 3e-3), batch 64, random length 4-30, grad clip 1.0
# eval:  500 fresh sequences per length, argmax per position vs target</div>

  <h2 id="da2-bl"><span class="num">02</span>Bahdanau vs Luong Attention</h2>
  <p>Both are attention for RNN seq2seq. They differ in how they compute the match score: Bahdanau uses a small neural network (<strong>additive</strong>); Luong uses a dot product (<strong>multiplicative</strong>).</p>
  <table class="tbl">
    <tr><th></th><th>Bahdanau (2014)</th><th>Luong (2015)</th></tr>
    <tr><td>Score</td><td><strong>Additive</strong>: vᵀ tanh(W₁s<sub>t−1</sub> + W₂h<sub>j</sub>)</td><td><strong>Multiplicative</strong>: dot s<sub>t</sub>ᵀh<sub>j</sub>, general s<sub>t</sub>ᵀWh<sub>j</sub> (also concat)</td></tr>
    <tr><td>Query state</td><td>Previous decoder state s<sub>t−1</sub></td><td>Current decoder state s<sub>t</sub></td></tr>
    <tr><td>Context used</td><td>Fed <em>into</em> the decoder RNN step</td><td>Combined <em>after</em> the RNN step: tanh(W<sub>c</sub>[c<sub>t</sub>; s<sub>t</sub>])</td></tr>
    <tr><td>Encoder</td><td>Bidirectional RNN</td><td>Stacked unidirectional</td></tr>
    <tr><td>Extras</td><td>Learned soft alignment (first)</td><td>Global vs local (windowed) attention</td></tr>
    <tr><td>Cost</td><td>Small MLP per pair</td><td>One matrix multiply → faster</td></tr>
  </table>
  <div class="flow"><span>2014 seq2seq (bottleneck)</span><span>2014 Bahdanau additive</span><span>2015 Luong dot / general</span><span>2016–17 self-attention</span><span>2017 Transformer: attention only</span></div>
  <p>Dot-product won because it's a single matmul on GPUs. The Transformer keeps it, adds the 1/√d<sub>k</sub> scale, and separates keys from values with learned projections.</p>

  <h2 id="da2-self"><span class="num">03</span>Self-Attention &amp; Encoder-Decoder (Cross) Attention</h2>
  <p>In <strong>self-attention</strong> every word in a sentence looks at every other word in the same sentence. In <strong>cross-attention</strong> words of the output look at words of the input. Why: in "river bank", "bank" needs "river" to get its meaning, wherever "river" sits.</p>
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
    <div><b>Masked self-attention</b><p>Same, but each token sees only the past.</p><small>Decoder layers; GPT</small></div>
    <div><b>Cross-attention</b><p>Q from decoder; K, V from encoder output.</p><small>Translation (T5), image captioning, Stable Diffusion text conditioning</small></div>
  </div>
  <table class="tbl">
    <tr><th></th><th>RNN</th><th>Self-attention</th></tr>
    <tr><td>Steps between token 1 and token n</td><td>n − 1 (gradient through each)</td><td><strong>1</strong> (direct link)</td></tr>
    <tr><td>Parallel over positions in training</td><td>No (sequential)</td><td>Yes</td></tr>
    <tr><td>Cost per layer</td><td>O(n·d²)</td><td>O(n²·d)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>O(n²) is memory too: n = 1,000 tokens × 12 heads × 4 bytes = 48 MB of scores per layer per example; ×32 batch ×12 layers ≈ 18 GB. FlashAttention avoids storing the n×n matrix (tiles it), so memory becomes O(n) though compute stays O(n²).</p>
  </div>

  <h2 id="da2-sdp"><span class="num">04</span>Scaled Dot-Product Attention</h2>
  <p>This is the exact attention formula used in Transformers. Dot product = match score; divide by √d<sub>k</sub> to keep scores in a sane range; softmax turns scores into weights; weights mix the values.</p>
  <div class="callout def"><span class="label">Formula</span>
    <p><strong>Attention(Q, K, V) = softmax(QKᵀ / √d<sub>k</sub>) · V</strong>. Q: n×d<sub>k</sub>, K: m×d<sub>k</sub>, V: m×d<sub>v</sub> → scores n×m → output n×d<sub>v</sub>.</p>
  </div>
  <div class="flow"><span>Q · Kᵀ (all pair scores)</span><span>÷ √d<sub>k</sub></span><span>+ mask (−∞)</span><span>softmax per row</span><span>· V (weighted mix)</span></div>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
X = rng.normal(size=(3, 4))                       # 3 tokens, d_model = 4
Wq, Wk, Wv = (rng.normal(size=(4, 4)) for _ in range(3))
Q, K, V = X @ Wq, X @ Wk, X @ Wv                  # self-attention: all from X
S = Q @ K.T / np.sqrt(K.shape[1])                 # (3,3) scores
A = softmax(S)                                    # each row sums to 1
out = A @ V                                       # (3,4)
print("weights A:&#92;n", A); print("row sums", A.sum(1)); print("output shape", out.shape)</div>
  <div class="fx" data-lang="text">weights A:
 [[0.38 0.3  0.32]
 [0.32 0.21 0.47]
 [0.05 0.01 0.94]]
row sums [1. 1. 1.]
output shape (3, 4)</div>
  <p>Row i = how token i spreads its attention. Token 3 attends almost only to itself (0.94).</p>
  <h3>Why divide by √d<sub>k</sub></h3>
  <div class="fx" data-lang="py">for d in (4, 64, 512):
    q = rng.normal(size=(2000, 1, d)); K = rng.normal(size=(2000, 10, d))   # 2000 trials, 10 keys
    s = (K @ q.transpose(0, 2, 1))[..., 0]                                   # (2000, 10) scores
    raw, scaled = softmax(s).max(1).mean(), softmax(s / np.sqrt(d)).max(1).mean()
    print(f"d={d:3d}  std(q.k)={s.std():5.1f}  avg top weight: raw {raw:.2f}  scaled {scaled:.2f}")</div>
  <div class="fx" data-lang="text">d=  4  std(q.k)=  2.0  avg top weight: raw 0.50  scaled 0.30
d= 64  std(q.k)=  7.9  avg top weight: raw 0.87  scaled 0.32
d=512  std(q.k)= 22.5  avg top weight: raw 0.95  scaled 0.32</div>
  <p>q·k sums d<sub>k</sub> products of unit-variance terms, so its std is √d<sub>k</sub> (22.6 for 512). Unscaled, softmax becomes nearly one-hot, and a saturated softmax has near-zero gradient. Dividing by √d<sub>k</sub> keeps the spread constant at any width.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Marks out of 500 and marks out of 50 can't be compared directly. You rescale first. The √d<sub>k</sub> divide is that rescaling, so wide vectors don't give huge scores.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Divide by d<sub>k</sub>" is wrong: it over-shrinks and flattens attention. The std grows as √d<sub>k</sub>, so that's the scale.</p>
  </div>

  <h2 id="da2-mh"><span class="num">05</span>Multi-Head Attention</h2>
  <p>Multi-head attention runs several small attentions side by side, each with its own weights. One attention gives one view of which words relate; several heads give several views at once.</p>
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
<text x="300" y="185" text-anchor="middle" class="tm">each head: own W_Q, W_K, W_V → its own attention pattern</text>
</svg><figcaption>8 heads of width 8 run in parallel on the same input, then are concatenated and mixed by W_O.</figcaption></figure>
  <div class="fx" data-lang="py">import torch, torch.nn as nn, torch.nn.functional as F
torch.manual_seed(0)
x = torch.randn(2, 5, 64)                                    # (batch, seq, d_model)
mha = nn.MultiheadAttention(64, num_heads=8, batch_first=True)
one = nn.MultiheadAttention(64, num_heads=1, batch_first=True)
n = lambda m: sum(p.numel() for p in m.parameters())
out, w = mha(x, x, x)                                        # self-attention: q = k = v = x
print("8 heads params", n(mha), "| 1 head params", n(one))
print("output", tuple(out.shape), "weights (avg over heads)", tuple(w.shape))</div>
  <div class="fx" data-lang="text">8 heads params 16640 | 1 head params 16640
output (2, 5, 64) weights (avg over heads) (2, 5, 5)</div>
  <p>Same parameter count: heads split d<sub>model</sub> into subspaces rather than adding width. 4·64·64 + 4·64 = 16,640 (W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>, W<sub>O</sub> + biases).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A panel of readers each highlighting a sentence for one thing: one marks grammar links, one marks who "he" refers to, one marks nearby words. One reader asked to do all three would mix them up and do each badly.</p>
  </div>

  <h2 id="da2-mask"><span class="num">06</span>Masking</h2>
  <p>A mask blocks some positions from being looked at. Why: a text generator must not see future words while learning to predict them, and padding (filler tokens) should be ignored. How: set those scores to −∞ before softmax, so their weight becomes 0.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket commentator can talk about balls already bowled, never the next ball. The causal mask enforces exactly that.</p>
  </div>
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
</svg><figcaption>Causal attention weights from the 8-head layer above (head average). Query t only sees keys 1…t.</figcaption></figure>
  <div class="fx" data-lang="py">causal = torch.triu(torch.ones(5, 5, dtype=torch.bool), 1)   # True = not allowed
_, w = mha(x, x, x, attn_mask=causal)
print(w[0].round(decimals=2))</div>
  <div class="fx" data-lang="text">tensor([[1.0000, 0.0000, 0.0000, 0.0000, 0.0000],
        [0.4400, 0.5600, 0.0000, 0.0000, 0.0000],
        [0.3500, 0.3200, 0.3300, 0.0000, 0.0000],
        [0.2400, 0.2800, 0.2600, 0.2100, 0.0000],
        [0.1700, 0.2600, 0.2200, 0.1700, 0.1800]], grad_fn=&lt;RoundBackward1&gt;)</div>
  <div class="cards">
    <div><b>Causal (look-ahead) mask</b><p>Upper triangle = −∞. Training predicts every next token in parallel without cheating.</p><small>Decoders / GPT; <code>is_causal=True</code></small></div>
    <div><b>Padding mask</b><p>Pad positions as keys = −∞, so real tokens ignore filler.</p><small><code>key_padding_mask</code> (True = pad)</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mask <em>before</em> softmax. Zeroing weights after softmax leaves rows that no longer sum to 1. Also watch mask conventions: in <code>nn.MultiheadAttention</code> a bool True means "block"; in <code>F.scaled_dot_product_attention</code> a bool True means "allowed". A row with every key masked gives NaN.</p>
  </div>

  <h2 id="da2-pos"><span class="num">07</span>Positional Encoding</h2>
  <p>Positional encoding adds "where am I in the sentence" information to each word vector. Without it, attention sees the words as a bag with no order.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Seat numbers on an IRCTC ticket. The passengers are the same, but the seat number tells where each one sits.</p>
  </div>
  <div class="fx" data-lang="py">perm = torch.tensor([4, 2, 0, 3, 1])
o1, _ = mha(x, x, x); o2, _ = mha(x[:, perm], x[:, perm], x[:, perm])
print("order-blind:", torch.allclose(o1[:, perm], o2, atol=1e-6))</div>
  <div class="fx" data-lang="text">order-blind: True</div>
  <p>Shuffle the tokens and the outputs just shuffle the same way: attention alone can't tell "dog bites man" from "man bites dog". Position must be injected.</p>
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
  <p>Early dims oscillate fast, later dims slowly, like the seconds and hours hands of a clock. Nearby positions get similar vectors (3.54 vs 1.97).</p>
  <table class="tbl">
    <tr><th>Scheme</th><th>How</th><th>Used in</th></tr>
    <tr><td>Sinusoidal</td><td>Fixed sin/cos added to embeddings</td><td>Original Transformer</td></tr>
    <tr><td>Learned absolute</td><td>An embedding per position index; no extrapolation past max length</td><td>BERT, GPT-2</td></tr>
    <tr><td>RoPE</td><td>Rotate Q and K by position angle → score depends on relative offset</td><td>Llama, Mistral, most modern LLMs</td></tr>
    <tr><td>ALiBi</td><td>Add a distance penalty to scores</td><td>BLOOM, MPT</td></tr>
  </table>

  <h2 id="da2-tf"><span class="num">08</span>Transformer Overview</h2>
  <p>A Transformer is a model built only from attention plus small feed-forward layers, with no RNN. Why: attention links any two words in one step and trains on all positions in parallel.</p>
  <div class="flow"><span>Embeddings + position</span><span>Multi-head self-attention</span><span>Add &amp; LayerNorm</span><span>Feed-forward</span><span>Add &amp; LayerNorm</span><span>× N layers</span></div>
  <p>"Attention Is All You Need" (2017) dropped recurrence entirely. The decoder block adds masked self-attention and cross-attention to the encoder. Residuals (as in ResNet) and LayerNorm let it stack deep.</p>
  <div class="cards">
    <div><b>Encoder-only</b><p>Bidirectional self-attention.</p><small>BERT: classification, embeddings</small></div>
    <div><b>Decoder-only</b><p>Causal self-attention.</p><small>GPT, Llama: generation</small></div>
    <div><b>Encoder-decoder</b><p>Self + cross attention.</p><small>T5, original translation model</small></div>
  </div>
  <div class="fx" data-lang="py">q = k = v = torch.randn(1, 8, 5, 8)                          # (batch, heads, seq, d_head)
manual = torch.softmax(q @ k.transpose(-2, -1) / 8**0.5, -1) @ v
print("SDPA matches manual:", torch.allclose(F.scaled_dot_product_attention(q, k, v), manual, atol=1e-6))</div>
  <div class="fx" data-lang="text">SDPA matches manual: True</div>
  <p>Full block, LayerNorm vs BatchNorm, FFN, BERT vs GPT and a numpy build: see <strong>Generative AI → Transformers</strong>.</p>

  <h2 id="da2-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problem did attention solve in seq2seq?</summary><div class="qa-body">The fixed-size context vector: the encoder had to compress the whole input into one vector, so long inputs lost information. Attention builds a fresh context per output step as a weighted sum of <em>all</em> encoder states. Our toy: at length 30, accuracy went from 0.53 to 0.94.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Q, K, V. Why separate K and V?</summary><div class="qa-body">Query: what this position wants. Key: what each position is matched on. Value: what it contributes when matched. Separating K from V lets a token be easy to find (key) yet hand over different, rich content (value); with K = V one vector must serve both jobs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bahdanau vs Luong attention?</summary><div class="qa-body">Bahdanau: additive score vᵀtanh(W₁s<sub>t−1</sub> + W₂h<sub>j</sub>) using the previous decoder state; context fed into the RNN step. Luong: multiplicative (dot / general sᵀWh) using the current decoder state; context combined after the step; also local attention. Dot is a single matmul, so it's faster.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why scale by √d<sub>k</sub>?</summary><div class="qa-body">For unit-variance q, k, the dot product has variance d<sub>k</sub> (std √d<sub>k</sub>). Large scores saturate softmax to one-hot, where gradients vanish. Dividing by √d<sub>k</sub> restores unit variance. Demo at d = 512: average top weight 0.95 unscaled vs 0.32 scaled.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Self-attention vs cross-attention?</summary><div class="qa-body">Self: Q, K, V all projected from the same sequence (tokens attend to each other). Cross: Q from the decoder, K and V from the encoder output (the target attends to the source). Cross-attention is the Transformer's version of Bahdanau/Luong attention.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why multi-head instead of one big head?</summary><div class="qa-body">One head produces one weighting per token, averaging all relationship types. h heads with separate projections can each specialise (syntax, coreference, position). Same parameters and similar compute, since each head is d<sub>model</sub>/h wide.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shapes: Q is (2, 10, 64), K and V are (2, 7, 64). Shape of scores and output?</summary><div class="qa-body">Scores QKᵀ: (2, 10, 7) — 10 queries × 7 keys. Output: (2, 10, 64) — one vector per query. (Typical of cross-attention: target length 10, source length 7.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a causal mask work, and why not mask after softmax?</summary><div class="qa-body">Set scores above the diagonal to −∞ before softmax; e<sup>−∞</sup> = 0, so future tokens get zero weight and each row still sums to 1. Zeroing after softmax breaks the normalisation (rows sum &lt; 1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does attention need positional encoding?</summary><div class="qa-body">Attention is permutation-equivariant: shuffling inputs shuffles outputs identically (verified above), so order is invisible. Adding (sinusoidal / learned) or applying (RoPE) position information breaks the symmetry.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the complexity of self-attention and how is it reduced?</summary><div class="qa-body">O(n²·d) time and O(n²) memory for the score matrix. FlashAttention keeps time but makes memory O(n) by tiling; sliding-window / sparse attention cut time; KV caching avoids recomputation during generation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did Transformers replace RNNs?</summary><div class="qa-body">Any two tokens are one step apart (no vanishing through time), training is parallel over positions (RNNs are sequential), and they scale well with data and compute. Cost: O(n²) in sequence length.</div></details>
</main>`
});
