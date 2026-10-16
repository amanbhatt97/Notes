// notes/genai/transformers.js — Transformers
Object.assign(TOPIC_CONTENT, {
  "transformers": `<main>
  <h1>Transformers</h1>
  <p class="lead">The architecture under every modern LLM. You need <em>01 · NLP Foundations</em> (word vectors, and why context matters). Here you take one Transformer apart: tokens, embeddings, attention, the block, and the three model families. <em>03 · How LLMs Work</em> then shows how these models are trained and generate text.</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="tf-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Transformers</span><span class="rm-sub">Three problems with RNNs</span></div></div>
      <div class="rm-item rm-done" data-target="tf-tok"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Tokenization</span><span class="rm-sub">Subwords and BPE</span></div></div>
      <div class="rm-item rm-done" data-target="tf-emb"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Embeddings &amp; Position</span><span class="rm-sub">Meaning plus word order</span></div></div>
      <div class="rm-item rm-done" data-target="tf-attn"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Self-Attention</span><span class="rm-sub">Q, K, V: the engine</span></div></div>
      <div class="rm-item rm-done" data-target="tf-mha"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Multi-Head Attention</span><span class="rm-sub">Many views, same cost</span></div></div>
      <div class="rm-item rm-done" data-target="tf-block"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Transformer Block</span><span class="rm-sub">FFN, residuals, LayerNorm</span></div></div>
      <div class="rm-item rm-done" data-target="tf-arch"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Encoder, Decoder, Both</span><span class="rm-sub">Masks and cross-attention</span></div></div>
      <div class="rm-item rm-done" data-target="tf-bert"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">BERT vs GPT</span><span class="rm-sub">Reader vs writer</span></div></div>
      <div class="rm-item rm-done" data-target="tf-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">Attention in numpy</span></div></div>
      <div class="rm-item rm-done" data-target="tf-rev"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="tf-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="tf-why"><span class="num">01</span>Why Transformers</h2>
  <p>Before 2017, language models were <strong>RNNs</strong> (recurrent networks: read one word, update a memory vector, repeat). They had three problems that could only be replaced, not fixed.</p>
  <table class="tbl">
    <tr><th>RNN problem</th><th>What goes wrong</th><th>Transformer fix</th></tr>
    <tr><td><strong>Sequential</strong></td><td>Word 50 waits for word 49, so thousands of GPU cores sit idle</td><td>All positions processed in parallel</td></tr>
    <tr><td><strong>Forgetful</strong></td><td>The memory is overwritten at every step; word 1 has faded by word 50</td><td>Any word reaches any other in one step</td></tr>
    <tr><td><strong>Bottleneck</strong></td><td>Translation squeezed a whole sentence into one fixed vector</td><td>The output can look at every input position</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An RNN reads a book one word at a time with its eyes closed between words, summarising on a Post-it note. A Transformer lays the whole page on the table and lets every word look at every other word at once.</p>
  </div>
  <p>The 2017 paper <em>Attention Is All You Need</em> dropped recurrence entirely. Its core operation, <strong>attention</strong>, is section 04.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Every word looks at every word" costs O(n²) in sequence length n. That is why context length is expensive (more in 03).</p>
  </div>

  <h2 id="tf-tok"><span class="num">02</span>Tokenization</h2>
  <p>A model reads numbers, not text. A <strong>tokenizer</strong> splits text into <strong>tokens</strong> and maps each to an ID from a fixed <strong>vocabulary</strong> (often 30k–200k entries).</p>
  <table class="tbl">
    <tr><th>Level</th><th>Problem</th></tr>
    <tr><td>Whole words</td><td>Huge vocabulary; any unseen word becomes &lt;UNK&gt; (unknown)</td></tr>
    <tr><td>Characters</td><td>Tiny vocabulary, but very long sequences and little meaning per token</td></tr>
    <tr><td><strong>Subwords</strong></td><td>The middle: common words stay whole, rare words split into pieces</td></tr>
  </table>
  <p>"unhappiness" might become <code>un</code> + <code>happi</code> + <code>ness</code>. A typo like "trnasformer" still splits into known pieces. Bytes or characters are always in the vocabulary, so nothing is ever unknown.</p>
  <h3>BPE (byte-pair encoding)</h3>
  <p>Start from characters; repeatedly merge the most frequent adjacent pair into a new token. GPT-style models use byte-level BPE; BERT uses the similar WordPiece.</p>
  <div class="fx" data-lang="py">from collections import Counter

words = {"low": 5, "lower": 2, "newest": 6, "widest": 3}     # word: frequency
corpus = {tuple(w): f for w, f in words.items()}              # start from characters

for step in range(4):
    pairs = Counter()
    for symbols, f in corpus.items():
        for a, b in zip(symbols, symbols[1:]):
            pairs[a, b] += f
    (a, b), n = pairs.most_common(1)[0]
    print(f"merge {step+1}: {a!r} + {b!r} (seen {n}x)")
    new = {}
    for symbols, f in corpus.items():
        out, i = [], 0
        while i &lt; len(symbols):
            if symbols[i:i+2] == (a, b):
                out.append(a + b); i += 2
            else:
                out.append(symbols[i]); i += 1
        new[tuple(out)] = f
    corpus = new
print(list(corpus))</div>
  <div class="fx" data-lang="text">merge 1: 'e' + 's' (seen 9x)
merge 2: 'es' + 't' (seen 9x)
merge 3: 'l' + 'o' (seen 7x)
merge 4: 'lo' + 'w' (seen 7x)
[('low',), ('low', 'e', 'r'), ('n', 'e', 'w', 'est'), ('w', 'i', 'd', 'est')]</div>
  <p>Four merges learned "est" and "low". "lower" is now <code>low + e + r</code>. Real tokenizers run tens of thousands of merges.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tokens are not words. Numbers, code, and non-English text often split into many tokens. That's why LLMs miscount letters in "strawberry": they never see individual letters.</p>
  </div>

  <h2 id="tf-emb"><span class="num">03</span>Embeddings &amp; Position</h2>
  <p>The <strong>embedding layer</strong> is a learned table: one row per token ID, <code>d_model</code> numbers per row (768 in BERT-base). Looking up a token = picking its row.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A token ID is a stadium seat number: it identifies, but means nothing. The embedding is a spreadsheet row whose unlabelled columns the model invents during training (maybe "is alive", "is past tense"). Similar tokens get similar rows, like Word2Vec in 01.</p>
  </div>
  <h3>Positional encoding</h3>
  <p>Attention treats its input as a <strong>set</strong>: "dog bites man" and "man bites dog" look identical. Position must be injected.</p>
  <div class="flow"><span>token embedding (d_model)</span><span>+ position vector (d_model)</span><span>input to block 1</span></div>
  <ul>
    <li><strong>Same size as the embedding</strong>, because the two are added element by element.</li>
    <li><strong>Why not add the raw number 5?</strong> Embedding values are small (around ±1). A 5 would drown the meaning. The original sinusoidal encoding keeps values in [−1, 1].</li>
    <li><strong>Variants</strong>: sinusoidal (original), learned per position (BERT, GPT-2), and <strong>RoPE</strong> (rotary: rotates Q and K by position angle, used by most modern LLMs like Llama).</li>
  </ul>

  <h2 id="tf-attn"><span class="num">04</span>Self-Attention</h2>
  <p><strong>Self-attention</strong> rebuilds each token's vector as a weighted mix of all tokens' vectors, with weights based on relevance.</p>
  <div class="callout intu"><span class="label">The problem it solves</span>
    <p>"The animal didn't cross the street because <strong>it</strong> was too tired." You know "it" = animal because you paid attention to "animal" and "tired", not "street". Attention lets the model do this for every word at once.</p>
  </div>
  <p>Comparing raw vectors is noisy: "animal" encodes everything about animals. So each token projects itself (multiplies by a learned matrix) into three roles:</p>
  <ul>
    <li><strong>Q, query</strong> = <code>x·W_Q</code>: what am I looking for?</li>
    <li><strong>K, key</strong> = <code>x·W_K</code>: what do I offer, as a label to match against?</li>
    <li><strong>V, value</strong> = <code>x·W_V</code>: what content I hand over if chosen.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy: the library</span>
    <p>Your question is the Query. Each spine title is a Key. You read the best-matching books (Values), and your understanding is a blend weighted by how well each title matched.</p>
  </div>
  <div class="fx" data-lang="text">Attention(Q, K, V) = softmax( Q·Kᵀ / √d_k ) · V</div>
  <div class="flow"><span>Q·Kᵀ: score every pair</span><span>÷ √d_k</span><span>softmax: rows sum to 1</span><span>× V: weighted mix</span></div>
  <p>For 3 tokens: three Q, K, V vectors, a 3×3 score matrix, and three new vectors. All matrix multiplies, all in parallel.</p>
  <h3>Why divide by √d_k</h3>
  <p>A dot product sums d_k products, so its spread grows like √d_k. Big scores push softmax to ~100% on one token: <strong>saturation</strong>. Gradients vanish and the model stops learning nuance. Dividing by √d_k restores unit-scale scores. Run on random vectors:</p>
  <table class="tbl out"><caption>Result (5 random keys, see Build It)</caption>
    <tr><th>d_k</th><th>std of raw scores</th><th>max softmax weight, raw</th><th>max weight, scaled</th></tr>
    <tr><td>4</td><td>0.7</td><td>0.43</td><td>0.31</td></tr>
    <tr><td>64</td><td>7.8</td><td>1.00</td><td>0.51</td></tr>
    <tr><td>512</td><td>20.9</td><td>1.00</td><td>0.51</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Attention weights are not a reliable explanation of <em>why</em> a model answered something. Many heads, layers and residual paths mix the signal.</p>
  </div>

  <h2 id="tf-mha"><span class="num">05</span>Multi-Head Attention</h2>
  <p>One attention pattern can capture one kind of relationship well. "it" needs several: which noun it refers to, what state it's in, what it didn't do.</p>
  <div class="flow"><span>Q, K, V (512)</span><span>split into 8 heads × 64</span><span>attention per head, in parallel</span><span>concat → 512</span><span>× W_O</span></div>
  <ul>
    <li>Each <strong>head</strong> has its own slice and learns its own pattern (coreference, syntax, nearby words…).</li>
    <li><strong>Same cost as one big head</strong>: 8 heads on 64 dims ≈ 1 head on 512 dims. More perspectives, no extra FLOPs.</li>
    <li><code>W_O</code> mixes the heads' outputs back together.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Eight specialists each read the sentence looking for one thing, then pool their notes. One generalist doing all eight jobs does each one worse.</p>
  </div>

  <h2 id="tf-block"><span class="num">06</span>The Transformer Block</h2>
  <div class="flow"><span>x</span><span>x + Attention(Norm(x))</span><span>x + FFN(Norm(x))</span><span>next block</span></div>
  <h3>Feed-forward network (FFN)</h3>
  <p>A small 2-layer network applied to <strong>each token separately</strong>: expand to ~4×d_model, apply a nonlinearity (GELU, SwiGLU in modern LLMs), project back. Attention moves information <em>between</em> tokens; the FFN processes it <em>within</em> each token. It holds most of the parameters, and research suggests much factual recall happens there.</p>
  <h3>Residual connections</h3>
  <p><code>output = x + Layer(x)</code>. Each layer adds a correction; it never replaces the input.</p>
  <ul>
    <li><strong>Gradient highway</strong>: without it, the training signal multiplies through every layer. At 0.9 per layer, 0.9⁹⁶ ≈ 0.00004 reaches layer 1.</li>
    <li><strong>No information loss</strong>: position and token meaning from the start survive dozens of layers.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy: editors</span>
    <p>Without residuals, 96 editors each rewrite the document from scratch; by editor 20 the original is gone. With residuals, each editor only writes margin notes, and the original stays underneath.</p>
  </div>
  <h3>LayerNorm</h3>
  <p>Rescales each token vector to zero mean and unit variance (plus a learned scale and shift). It stops values drifting to huge or tiny scales across many layers, which keeps training stable. The original paper normalised after each sublayer (post-norm); modern LLMs normalise before it (<strong>pre-norm</strong>, shown above), which trains more stably when deep. Many use RMSNorm, a cheaper variant.</p>
  <div class="callout intu"><span class="label">Why stack many blocks</span>
    <p>Like re-reading a hard paragraph: early layers resolve words and grammar, middle layers link ideas, later layers capture task-level meaning. Each layer refines the last one's output. Every block keeps the shape (n tokens × d_model), so they stack freely.</p>
  </div>

  <h2 id="tf-arch"><span class="num">07</span>Encoder, Decoder, Both</h2>
  <div class="cards">
    <div><b>Encoder-only</b><p>Bidirectional: every token sees every token. Outputs a contextual vector per token.</p><small>BERT, RoBERTa: classification, NER, embeddings for search</small></div>
    <div><b>Decoder-only</b><p>Causal: each token sees only itself and earlier tokens. Generates one token at a time.</p><small>GPT, Llama, Claude: chat, code, completion</small></div>
    <div><b>Encoder-decoder</b><p>Encoder reads the source; decoder writes the target, consulting the encoder via cross-attention.</p><small>T5, BART, original Transformer: translation, summarisation</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Encoder = a judge reading the whole case file before forming a view. Decoder = an author writing left to right, unable to see the sentence not yet written. Encoder-decoder = a translator who reads the source fully, then writes while glancing back at it.</p>
  </div>
  <h3>Causal mask</h3>
  <p>A decoder learns to predict the next token. If token 3 could see token 4, training would be cheating. The mask sets scores for future positions to −∞ before softmax, so their weight becomes 0.</p>
  <table class="tbl">
    <tr><th>query ↓ / key →</th><th>The</th><th>cat</th><th>sat</th><th>on</th></tr>
    <tr><td>The</td><td>✓</td><td>✗</td><td>✗</td><td>✗</td></tr>
    <tr><td>cat</td><td>✓</td><td>✓</td><td>✗</td><td>✗</td></tr>
    <tr><td>sat</td><td>✓</td><td>✓</td><td>✓</td><td>✗</td></tr>
    <tr><td>on</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
  </table>
  <p>Bonus: one forward pass trains on every position at once, since each row is a separate "predict the next token" example.</p>
  <h3>Cross-attention</h3>
  <p>In self-attention, Q, K and V all come from the same sequence. In <strong>cross-attention</strong>, Q comes from the decoder ("what do I need now?") and K, V come from the encoder output ("what did the source say?"). A decoder block in an encoder-decoder therefore has three sublayers: masked self-attention, cross-attention, FFN.</p>

  <h2 id="tf-bert"><span class="num">08</span>BERT vs GPT</h2>
  <table class="tbl">
    <tr><th></th><th>BERT</th><th>GPT</th></tr>
    <tr><td>Architecture</td><td>Encoder-only</td><td>Decoder-only</td></tr>
    <tr><td>Attention</td><td>Bidirectional</td><td>Causal (left to right)</td></tr>
    <tr><td>Training task</td><td><strong>Masked language modelling</strong>: hide ~15% of tokens, predict them from both sides</td><td>Next-token prediction (details in 03)</td></tr>
    <tr><td>Output</td><td>A vector per token; add a small head for a task</td><td>Text, generated token by token</td></tr>
    <tr><td>Best at</td><td>Understanding: classify, tag, embed</td><td>Generation, and (at scale) nearly everything via prompting</td></tr>
  </table>
  <div class="callout intu"><span class="label">Why MLM for BERT</span>
    <p>An encoder sees every token, so "predict the next word" would be trivial: it's right there. Masking forces it to use context from both sides: "The [MASK] sat on the mat" → "cat".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"BERT is obsolete" is wrong. Small encoders still power embeddings, rerankers and classifiers in production (06, 07), at a fraction of an LLM's cost.</p>
  </div>
  <p>Decoder-only won for general-purpose LLMs: one simple objective, scales well, and any task can be phrased as text continuation. How that training and generation work is <em>03 · How LLMs Work</em>.</p>

  <h2 id="tf-build"><span class="num">09</span>Build It: Attention in numpy</h2>
  <p>Scaled dot-product attention on 3 tokens with <code>d_model = 4</code>. The embeddings are hand-made and the weight matrices random; in a real model both are learned.</p>
  <div class="fx" data-lang="py">import numpy as np
np.set_printoptions(precision=2, suppress=True)

def softmax(x):
    e = np.exp(x - x.max(axis=-1, keepdims=True))   # subtract max for stability
    return e / e.sum(axis=-1, keepdims=True)

def attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)                  # (n, n) relevance
    if mask is not None:
        scores = np.where(mask, scores, -np.inf)     # blocked -&gt; weight 0
    weights = softmax(scores)                        # each row sums to 1
    return weights @ V, weights

tokens = ["the", "cat", "sat"]
X = np.array([[1.0, 0.0, 1.0, 0.0],    # "the"  (embedding + position, d_model = 4)
              [0.0, 2.0, 0.0, 2.0],    # "cat"
              [1.0, 1.0, 1.0, 1.0]])   # "sat"

rng = np.random.default_rng(0)
W_q, W_k, W_v = (rng.normal(size=(4, 4)) for _ in range(3))   # learned in a real model
Q, K, V = X @ W_q, X @ W_k, X @ W_v

out, w = attention(Q, K, V)
print("weights (row = query token):")
print(w)
print("output shape:", out.shape)

causal = np.tril(np.ones((3, 3), dtype=bool))   # token i sees tokens 0..i
_, wc = attention(Q, K, V, mask=causal)
print("causal weights:")
print(wc)</div>
  <div class="fx" data-lang="text">weights (row = query token):
[[0.65 0.09 0.25]
 [0.01 0.94 0.05]
 [0.29 0.43 0.28]]
output shape: (3, 4)
causal weights:
[[1.   0.   0.  ]
 [0.01 0.99 0.  ]
 [0.29 0.43 0.28]]</div>
  <ul>
    <li>Each row sums to 1 (up to rounding): it is how one token splits its attention. Row "sat" is 29% the, 43% cat, 28% sat.</li>
    <li>The output keeps the input's shape (3 × 4), so it can be added back as a residual.</li>
    <li>With the causal mask, "the" can only attend to itself (1.0), and the last row is unchanged because it already sees everything.</li>
  </ul>
  <h3>Extend it: two heads</h3>
  <p>Continuing the same script. (PyTorch's <code>nn.MultiheadAttention</code> does this for you; it wasn't installed here, so this stays in numpy.)</p>
  <div class="fx" data-lang="py">def multi_head(X, n_heads, W_q, W_k, W_v, W_o):
    d_head = X.shape[1] // n_heads
    Q, K, V = X @ W_q, X @ W_k, X @ W_v
    heads = []
    for h in range(n_heads):                           # each head gets its own slice
        s = slice(h * d_head, (h + 1) * d_head)
        out, _ = attention(Q[:, s], K[:, s], V[:, s])
        heads.append(out)
    return np.concatenate(heads, axis=1) @ W_o         # concat, then mix heads

W = [rng.normal(size=(4, 4)) for _ in range(4)]
Y = multi_head(X, 2, *W)
print(Y.shape)            # same shape as X: ready for residual X + Y</div>
  <div class="fx" data-lang="text">(3, 4)</div>
  <h3>Check the √d_k claim yourself</h3>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
def softmax1(x):
    e = np.exp(x - x.max()); return e / e.sum()
for d_k in [4, 64, 512]:
    q, K = rng.normal(size=d_k), rng.normal(size=(5, d_k))
    raw = K @ q
    print(d_k, "std of scores %.1f" % raw.std(),
          "max weight raw %.2f" % softmax1(raw).max(),
          "scaled %.2f" % softmax1(raw / np.sqrt(d_k)).max())</div>
  <p>Output is the table in section 04: unscaled softmax hits 1.00 (saturated) from d_k = 64.</p>

  <h2 id="tf-rev"><span class="num">10</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Why:</strong> RNNs were sequential, forgetful and bottlenecked; attention links all tokens in parallel.</li>
    <li><strong>Tokens</strong> are subwords (BPE: merge frequent pairs); nothing is unknown, but tokens ≠ words.</li>
    <li><strong>Embedding</strong> = learned lookup table, one d_model vector per token ID.</li>
    <li><strong>Position</strong> is added (same size as embedding): sinusoidal, learned, or RoPE.</li>
    <li><strong>Attention</strong> = softmax(QKᵀ/√d_k)·V; Q asks, K advertises, V delivers.</li>
    <li><strong>√d_k</strong> stops dot products growing with dimension and saturating softmax.</li>
    <li><strong>Multi-head</strong>: split d_model into h heads, attend in parallel, concat, × W_O; same cost.</li>
    <li><strong>Block</strong>: x + Attn(Norm(x)), then x + FFN(Norm(x)); residuals keep gradients and information alive.</li>
    <li><strong>Encoder</strong> (BERT, bidirectional, MLM) reads; <strong>decoder</strong> (GPT, causal mask) writes; <strong>enc-dec</strong> (T5) adds cross-attention.</li>
    <li>Attention is <strong>O(n²)</strong> in sequence length; generation, sampling and KV cache are in 03.</li>
  </ol></div>

  <h2 id="tf-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why did Transformers replace RNNs?</summary><div class="qa-body">(1) RNNs process tokens sequentially, wasting GPU parallelism; Transformers process all positions at once. (2) RNN memory fades over long sequences; attention connects any two tokens in one step. (3) Seq2seq RNNs squeezed the input into one vector; attention lets the output look at every input position.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a token, and why subwords?</summary><div class="qa-body">The unit the model reads, mapped to an ID. Word vocabularies explode and produce &lt;UNK&gt;; characters make sequences long and meaning-poor. Subwords (BPE, WordPiece) keep common words whole and split rare ones, falling back to bytes, so nothing is unknown.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Q, K and V in plain English.</summary><div class="qa-body">Each token projects itself three ways. Query: what I'm looking for. Key: what I offer to be matched on. Value: the content I pass on. Q·K gives relevance scores, softmax turns them into weights, and the output is the weighted sum of Values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why divide attention scores by √d_k?</summary><div class="qa-body">A dot product of d_k unit-variance terms has variance d_k. Large scores saturate softmax (one weight ≈ 1, rest ≈ 0) and gradients vanish. Dividing by √d_k keeps scores near unit variance. In the demo, raw scores at d_k = 64 gave a max weight of 1.00; scaled gave 0.51.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is multi-head attention, and why is it no more expensive than one head?</summary><div class="qa-body">Split d_model into h slices, run attention on each in parallel, concatenate, project with W_O. Each head can learn a different relationship. h heads of size d_model/h cost about the same as one head of size d_model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must positional encoding be the same size as the embedding, and why not just add the index?</summary><div class="qa-body">They are added element-wise, so the shapes must match. A raw index like 5 is far larger than embedding values (around ±1) and would swamp the meaning; sinusoidal encodings stay in [−1, 1]. Without position, attention can't tell "dog bites man" from "man bites dog".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do Transformers need residual connections and LayerNorm?</summary><div class="qa-body">Residuals (x + Layer(x)) give gradients a direct path back through many layers and preserve the original information; each layer only learns a correction. LayerNorm keeps activations at a stable scale so deep stacks train reliably. Modern LLMs apply it before each sublayer (pre-norm).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the FFN do that attention doesn't?</summary><div class="qa-body">Attention mixes information across tokens; it is mostly a weighted average. The FFN applies a nonlinear transform to each token independently (expand ~4×, activate, project back). It holds most parameters and is where much stored knowledge seems to live.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? A causal mask is applied to 3 tokens. What is the first row of attention weights?</summary><div class="qa-body">[1, 0, 0]. The first token can only attend to itself, so softmax over one allowed score gives 1. In the build, the masked row 1 printed <code>[1. 0. 0.]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Encoder vs decoder vs encoder-decoder: when do you use each?</summary><div class="qa-body">Encoder (BERT): bidirectional, for understanding: classification, NER, embeddings. Decoder (GPT, Claude): causal, for generation; at scale it handles most tasks via prompting. Encoder-decoder (T5, BART): map one sequence to another (translation, summarisation) using cross-attention.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is cross-attention?</summary><div class="qa-body">Attention where queries come from the decoder and keys/values from the encoder output. At each step the decoder asks the source sequence what's relevant. It is the extra sublayer in encoder-decoder models.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why was BERT trained with masked language modelling instead of next-token prediction?</summary><div class="qa-body">BERT's attention is bidirectional, so it can see the next token; predicting it would be trivial. Masking ~15% of tokens and predicting them forces the model to use context from both sides.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the time and memory cost of self-attention in sequence length n?</summary><div class="qa-body">O(n²): the score matrix is n × n per head per layer. Doubling context roughly quadruples attention cost. This drives long-context engineering (efficient attention kernels, caching), covered from 03 on.</div></details>
</main>`
});
