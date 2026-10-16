// notes/genai/transformers.js — Transformers
Object.assign(TOPIC_CONTENT, {
  "transformers": `<main>
  <h1>Transformers</h1>
  <p class="lead">The architecture under every modern LLM, from ChatGPT to Claude. You need <em><a class="xref" data-note="nlp">NLP Foundations</a></em> (word vectors, and why a word's meaning should depend on its sentence). Here you take one Transformer apart piece by piece: how text becomes tokens, how tokens become vectors, how attention lets every word look at every other word, how the pieces stack into a block, and the three model families built from those blocks. <em><a class="xref" data-note="llm_basics">How LLMs Work</a></em> then shows how these models are trained and generate text.</p>

<div class="mindmap">
  <div class="mm-center">Transformers</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Why (vs RNNs)</div>
      <ul>
        <li><b>Sequential</b> — RNN word 50 waits for 49 → Transformer: all positions in parallel</li>
        <li><b>Forgetful</b> — memory fades → attention links any two tokens in 1 step</li>
        <li><b>Bottleneck</b> — one fixed vector → output looks at every input</li>
        <li><b>Paper</b> — "Attention Is All You Need" (2017): no recurrence</li>
        <li>⚠ <b>Cost</b> — attention is O(n²) in sequence length</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Tokenization</div>
      <ul>
        <li><b>Token</b> — unit mapped to an ID in a fixed vocab (30k–200k)</li>
        <li><b>Subwords</b> — common words whole, rare split: un + happi + ness</li>
        <li><b>BPE</b> — start from chars/bytes, repeatedly merge the most frequent pair</li>
        <li><b>WordPiece</b> — BERT's similar scheme; GPT uses byte-level BPE</li>
        <li><b>No UNK</b> — bytes always in vocab</li>
        <li>⚠ <b>Tokens ≠ words</b> — why "strawberry" letter counts fail</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Embeddings &amp; position</div>
      <ul>
        <li><b>Embedding layer</b> — learned table, one d_model row per token ID (768 in BERT-base)</li>
        <li><b>Why position</b> — attention sees a set: "dog bites man" = "man bites dog"</li>
        <li><b>Added</b> element-wise → same size as embedding</li>
        <li>⚠ <b>Raw index 5</b> would swamp ±1 values; sinusoids stay in [−1, 1]</li>
        <li><b>Variants</b>
          <ul><li>sinusoidal (original)</li><li>learned (BERT, GPT-2)</li><li>RoPE: rotate Q, K by angle (Llama, most LLMs)</li></ul>
        </li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Self-attention</div>
      <ul>
        <li><b>Idea</b> — each token = weighted mix of all tokens, weights = relevance</li>
        <li><b>Q</b> what I seek · <b>K</b> what I offer · <b>V</b> what I hand over (x·W_Q, x·W_K, x·W_V)</li>
        <li><b>Formula</b> — <code>softmax(Q·Kᵀ / √d_k) · V</code></li>
        <li><b>√d_k</b> — dot-product spread grows with √d_k → softmax saturates, gradients vanish</li>
        <li><b>Demo</b> — d_k = 64: max weight 1.00 raw vs 0.51 scaled</li>
        <li>💡 library: query vs spine titles (keys), read the books (values)</li>
        <li>⚠ <b>Weights ≠ explanation</b> of why the model answered</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Multi-head</div>
      <ul>
        <li><b>How</b> — split 512 into 8 heads × 64, attend in parallel, concat, × W_O</li>
        <li><b>Why</b> — each head learns one relation (coreference, syntax, nearby)</li>
        <li><b>Cost</b> — same FLOPs as one 512-d head</li>
        <li>💡 8 specialists pooling notes</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">The block</div>
      <ul>
        <li><b>Pre-norm</b> — <code>x + Attn(Norm(x))</code>, then <code>x + FFN(Norm(x))</code></li>
        <li><b>FFN</b> — per token: expand ~4×, GELU/SwiGLU, project back; most params, stored facts</li>
        <li><b>Residual</b> — gradient highway (0.9⁹⁶ ≈ 0.00004 without it), keeps original info</li>
        <li><b>LayerNorm</b> — zero mean, unit variance per token; RMSNorm = cheaper variant</li>
        <li><b>Stacking</b> — shape n × d_model in = out; early layers grammar, later meaning</li>
        <li>💡 editors writing margin notes, not rewriting</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Encoder / decoder / both</div>
      <ul>
        <li><b>Encoder-only</b> — bidirectional; BERT: classify, NER, embeddings</li>
        <li><b>Decoder-only</b> — causal; GPT, Llama, Claude: generation</li>
        <li><b>Enc-dec</b> — T5, BART: translation, summarisation</li>
        <li><b>Causal mask</b> — future scores = −∞ → weight 0; first row = [1, 0, 0]</li>
        <li><b>Bonus</b> — one pass trains every position at once</li>
        <li><b>Cross-attention</b> — Q from decoder, K/V from encoder output</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">BERT vs GPT</div>
      <ul>
        <li><b>BERT</b> — MLM: mask ~15%, predict from both sides</li>
        <li><b>GPT</b> — next-token prediction, left to right</li>
        <li><b>Why MLM</b> — bidirectional model would see the next token: trivial</li>
        <li><b>Decoder-only won</b> — one objective, scales, any task = continuation</li>
        <li>⚠ <b>"BERT is obsolete"</b> — no: embeddings, rerankers, classifiers</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Build: attention in numpy</div>
      <ul>
        <li><b>Steps</b> — Q,K,V = X·W → scores/√d_k → mask → softmax → @V</li>
        <li><b>Stable softmax</b> — subtract the row max</li>
        <li><b>Mask</b> — <code>np.tril</code> + <code>np.where(mask, s, -inf)</code></li>
        <li><b>Multi-head</b> — slice columns per head, concat, @W_O; shape (3, 4) kept</li>
      </ul>
    </div>
  </div>
</div>

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
      <div class="rm-item rm-done" data-target="tf-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="tf-why"><span class="num">01</span>Why Transformers</h2>
  <p>Read this sentence: "The animal didn't cross the street because it was too tired." You know "it" means the animal, not the street. You know it because you can look back at any earlier word instantly. A model needs the same ability.</p>
  <p>Before 2017, language models were <strong>RNNs</strong> (recurrent neural networks). An RNN reads one word at a time, updates a single memory vector, and moves on. By the time it reaches "it", the memory of "animal" has been overwritten eight times. Three problems followed from that design, and the Transformer fixed all three.</p>
<figure class="viz"><svg viewBox="0 0 620 150" width="620">
    <defs><marker id="tf-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="20" y="22">RNN: one step at a time</text><text x="350" y="22">Transformer: all pairs at once</text>
    <line x1="320" y1="10" x2="320" y2="140" stroke="currentColor" opacity="0.25"/>
    <rect x="20" y="70" width="40" height="28" rx="4" class="fs"/><text x="40" y="89" text-anchor="middle">w1</text>
    <line x1="60" y1="84" x2="77" y2="84" stroke="currentColor" marker-end="url(#tf-ah)"/>
    <rect x="78" y="70" width="40" height="28" rx="4" class="fs"/><text x="98" y="89" text-anchor="middle">w2</text>
    <line x1="118" y1="84" x2="135" y2="84" stroke="currentColor" marker-end="url(#tf-ah)"/>
    <rect x="136" y="70" width="40" height="28" rx="4" class="fs"/><text x="156" y="89" text-anchor="middle">w3</text>
    <line x1="176" y1="84" x2="193" y2="84" stroke="currentColor" marker-end="url(#tf-ah)"/>
    <rect x="194" y="70" width="40" height="28" rx="4" class="fs"/><text x="214" y="89" text-anchor="middle">w4</text>
    <line x1="234" y1="84" x2="251" y2="84" stroke="currentColor" marker-end="url(#tf-ah)"/>
    <rect x="252" y="70" width="40" height="28" rx="4" class="fs"/><text x="272" y="89" text-anchor="middle">w5</text>
    <text x="20" y="128" class="tm">w5 waits for w4; w1 has faded</text>
    <path d="M360,88 Q387,36 415,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M360,88 Q415,8 470,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M360,88 Q442,-20 525,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M360,88 Q470,-48 580,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M415,88 Q442,36 470,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M415,88 Q470,8 525,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M415,88 Q497,-20 580,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M470,88 Q497,36 525,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M470,88 Q525,8 580,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M525,88 Q552,36 580,88" fill="none" class="sb" opacity="0.6"/>
    <circle cx="360" cy="96" r="13" class="fb sb"/><text x="360" y="100" text-anchor="middle">w1</text>
    <circle cx="415" cy="96" r="13" class="fb sb"/><text x="415" y="100" text-anchor="middle">w2</text>
    <circle cx="470" cy="96" r="13" class="fb sb"/><text x="470" y="100" text-anchor="middle">w3</text>
    <circle cx="525" cy="96" r="13" class="fb sb"/><text x="525" y="100" text-anchor="middle">w4</text>
    <circle cx="580" cy="96" r="13" class="fb sb"/><text x="580" y="100" text-anchor="middle">w5</text>
    <text x="350" y="134" class="tm">any word reaches any word in 1 step</text>
    </svg><figcaption>RNNs pass one memory vector along a chain; attention links every pair directly and in parallel (cost: n² pairs).</figcaption></figure>
  <p>Left: the RNN chain, where each word waits for the previous one and old words fade. Right: in a Transformer every word is connected to every other word directly; the blue arcs are those connections.</p>
  <table class="tbl">
    <tr><th>RNN problem</th><th>What goes wrong</th><th>Transformer fix</th></tr>
    <tr><td><strong>Sequential</strong></td><td>Word 50 waits for word 49, so thousands of GPU cores sit idle</td><td>All positions processed in parallel</td></tr>
    <tr><td><strong>Forgetful</strong></td><td>The memory is overwritten at every step; word 1 has faded by word 50</td><td>Any word reaches any other in one step</td></tr>
    <tr><td><strong>Bottleneck</strong></td><td>Translation squeezed a whole sentence into one fixed vector</td><td>The output can look at every input position</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An RNN reads a book one word at a time with its eyes closed between words, summarising on a Post-it note. A Transformer lays the whole page on the table and lets every word look at every other word at once.</p>
  </div>
  <p>The paper that introduced it was called "Attention Is All You Need" (2017), because the one mechanism that does the looking, <strong>attention</strong>, replaced recurrence completely. Section 04 opens it up.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Every word looks at every word" costs O(n²) in sequence length n: 10 words = 100 pairs, 1,000 words = 1,000,000 pairs. Double the text, four times the work. That is why context length is expensive (more in <a class="xref" data-note="llm_basics">How LLMs Work</a>).</p>
  </div>

  <h2 id="tf-tok"><span class="num">02</span>Tokenization</h2>
  <p>A model reads numbers, not text. So the first job is to cut text into units and give each unit an ID number. The cutting program is the <strong>tokenizer</strong>, each unit is a <strong>token</strong>, and the fixed list of all known units is the <strong>vocabulary</strong> (often 30k–200k entries).</p>
  <p>How big should a unit be? Each obvious choice has a problem:</p>
  <table class="tbl">
    <tr><th>Level</th><th>Problem</th></tr>
    <tr><td>Whole words</td><td>Huge vocabulary; any unseen word ("neuromorphic", a typo) becomes &lt;UNK&gt; (unknown)</td></tr>
    <tr><td>Characters</td><td>Tiny vocabulary, but very long sequences and little meaning per token</td></tr>
    <tr><td><strong>Subwords</strong></td><td>The middle: common words stay whole, rare words split into pieces</td></tr>
  </table>
  <p>With subwords, "unhappiness" might become <code>un</code> + <code>happi</code> + <code>ness</code>. A typo like "trnasformer" still splits into known pieces. Single bytes or characters are always in the vocabulary, so nothing is ever unknown.</p>
  <h3>BPE (byte-pair encoding)</h3>
  <p>How does the tokenizer decide which pieces exist? <strong>BPE</strong> learns them from data with one simple rule: start with single characters, find the pair of neighbouring symbols that appears most often, glue them into one new symbol, repeat. GPT-style models use byte-level BPE; BERT uses the similar WordPiece.</p>
  <p>A toy corpus of four words with their frequencies. Watch the merges happen:</p>
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
  <p>Step by step: "e" followed by "s" appears 9 times (in "newest" 6 and "widest" 3), so it is merged first into "es". Then "es" + "t" → "est". Then "l" + "o" and "lo" + "w" build "low". After four merges, "lower" is <code>low + e + r</code>: the common piece "low" is one token, the rare ending is spelled out. Real tokenizers run tens of thousands of merges on terabytes of text.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tokens are not words. Numbers, code, and non-English text often split into many tokens. That's why LLMs miscount letters in "strawberry": they never see individual letters, only pieces like "str" + "aw" + "berry".</p>
  </div>

  <h2 id="tf-emb"><span class="num">03</span>Embeddings &amp; Position</h2>
  <p>After tokenization, "the cat sat" is just <code>[0, 1, 2]</code>. Those IDs are labels, not meaning: ID 2 is not "twice as much" as ID 1. The model needs each token as a vector of numbers it can do maths with.</p>
  <p>The <strong>embedding layer</strong> is a learned table: one row per token ID, with <code>d_model</code> numbers per row (768 in BERT-base, several thousand in big LLMs). Looking up a token = picking its row. Nothing else.</p>
  <div class="fx" data-lang="py">import numpy as np
np.set_printoptions(precision=2, suppress=True)
vocab = {"the": 0, "cat": 1, "sat": 2}
rng = np.random.default_rng(0)
E = rng.normal(size=(3, 4)).round(2)       # the table: 3 tokens x d_model = 4 (learned in a real model)
ids = [vocab[w] for w in "the cat sat".split()]
print(ids)
print(E[ids])                               # one row per token: the input to the Transformer</div>
  <div class="fx" data-lang="text">[0, 1, 2]
[[ 0.13 -0.13  0.64  0.1 ]
 [-0.54  0.36  1.3   0.95]
 [-0.7  -1.27 -0.62  0.04]]</div>
  <p>Three tokens in, a 3 × 4 matrix out. During training, the numbers in the table move until tokens with similar meaning have similar rows.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A token ID is a stadium seat number: it identifies, but means nothing. The embedding is a spreadsheet row whose unlabelled columns the model invents during training (maybe "is alive", "is past tense"). Similar tokens get similar rows, like Word2Vec in <a class="xref" data-note="nlp">NLP Foundations</a>.</p>
  </div>
  <h3>Positional encoding</h3>
  <p>Here is a surprise. Attention (next section) treats its input as a <strong>set</strong>, a bag of vectors with no order. "dog bites man" and "man bites dog" would look identical. So the position of each token must be written into its vector before anything else happens.</p>
  <div class="flow"><span>token embedding (d_model)</span><span>+ position vector (d_model)</span><span>input to block 1</span></div>
  <ul>
    <li><strong>Same size as the embedding</strong>, because the two are added element by element: number 1 of the word vector plus number 1 of the position vector, and so on.</li>
    <li><strong>Why not add the raw number 5?</strong> Embedding values are small (around ±1, as in the table above). Adding a 5 would drown the meaning. The original <strong>sinusoidal</strong> encoding uses sine and cosine waves of different speeds, so every value stays in [−1, 1] and every position still gets a unique pattern.</li>
  </ul>
  <div class="fx" data-lang="py">def pos_enc(pos, d=4):                      # sinusoidal, d_model = 4
    return np.array([np.sin(pos / 10000 ** (i / d)) if i % 2 == 0
                     else np.cos(pos / 10000 ** ((i - 1) / d)) for i in range(d)])
for p in range(3):
    print(p, pos_enc(p).round(2))</div>
  <div class="fx" data-lang="text">0 [0. 1. 0. 1.]
1 [0.84 0.54 0.01 1.  ]
2 [ 0.91 -0.42  0.02  1.  ]</div>
  <p>Each position gets its own small pattern, all values between −1 and 1, safe to add to the embedding row.</p>
  <ul>
    <li><strong>Variants</strong>: sinusoidal (original), learned per position (BERT, GPT-2: the position vectors are just another trained table), and <strong>RoPE</strong> (rotary: rotates the Q and K vectors of section 04 by an angle that depends on position, used by most modern LLMs like Llama).</li>
  </ul>

  <h2 id="tf-attn"><span class="num">04</span>Self-Attention</h2>
  <p>Back to "it was too tired". The vector for "it" that came out of the embedding table is the same in every sentence. To know that "it" means the animal, the model must mix some of "animal" into the vector for "it". How much of each other word to mix in? That is exactly what attention computes.</p>
  <p><strong>Self-attention</strong> rebuilds each token's vector as a weighted mix of all tokens' vectors, with weights based on relevance. Every token asks: "which other tokens matter for understanding me?"</p>
<figure class="viz"><svg viewBox="0 0 531 130" width="531">
    <path d="M383,88 Q205,4 26,88" fill="none" class="sb" stroke-width="1.2" opacity="0.37"/>
    <path d="M383,88 Q228,12 73,88" fill="none" class="sr" stroke-width="5.8" opacity="0.83"/>
    <path d="M383,88 Q257,23 131,88" fill="none" class="sb" stroke-width="1.4" opacity="0.39"/>
    <path d="M383,88 Q284,32 185,88" fill="none" class="sb" stroke-width="1.4" opacity="0.39"/>
    <path d="M383,88 Q306,40 228,88" fill="none" class="sb" stroke-width="1.2" opacity="0.37"/>
    <path d="M383,88 Q329,49 275,88" fill="none" class="sb" stroke-width="1.6" opacity="0.41"/>
    <path d="M383,88 Q360,60 336,88" fill="none" class="sb" stroke-width="1.2" opacity="0.37"/>
    <path d="M383,88 Q399,62 415,88" fill="none" class="sb" stroke-width="1.1" opacity="0.36"/>
    <path d="M383,88 Q417,56 451,88" fill="none" class="sb" stroke-width="1.1" opacity="0.36"/>
    <path d="M383,88 Q439,48 494,88" fill="none" class="sr" stroke-width="3.2" opacity="0.57"/>
    <text x="26" y="108" text-anchor="middle">The</text>
    <text x="73" y="108" text-anchor="middle" class="tr">animal</text>
    <text x="131" y="108" text-anchor="middle">didn't</text>
    <text x="185" y="108" text-anchor="middle">cross</text>
    <text x="228" y="108" text-anchor="middle">the</text>
    <text x="275" y="108" text-anchor="middle">street</text>
    <text x="336" y="108" text-anchor="middle">because</text>
    <text x="383" y="108" text-anchor="middle" class="tb">it</text>
    <text x="415" y="108" text-anchor="middle">was</text>
    <text x="451" y="108" text-anchor="middle">too</text>
    <text x="494" y="108" text-anchor="middle" class="tr">tired</text>
    <text x="383" y="126" text-anchor="middle" class="tm">query</text>
    </svg><figcaption>Where "it" looks (illustrative weights): thick lines to "animal" and "tired", almost nothing to "street".</figcaption></figure>
  <p>The thick red lines are big weights: "it" pulls mostly from "animal" and "tired". The thin blue lines are small weights: "street" and "the" barely count. (These weights are illustrative; real ones come from the Build It.)</p>
  <h3>Three roles: Q, K, V</h3>
  <p>Comparing raw embeddings directly works badly, so each token first makes three different versions of itself by multiplying with three learned matrices:</p>
  <ul>
    <li><strong>Q, query</strong> = <code>x·W_Q</code>: what am I looking for?</li>
    <li><strong>K, key</strong> = <code>x·W_K</code>: what do I offer, as a label to match against?</li>
    <li><strong>V, value</strong> = <code>x·W_V</code>: what content I hand over if chosen.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy: the library</span>
    <p>Your question is the Query. Each spine title is a Key. You read the best-matching books (Values), and your understanding is a blend weighted by how well each title matched.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="tf-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="50" width="110" height="36" rx="5" class="fb sb"/><text x="65" y="73" text-anchor="middle">Q of "it"</text>
    <text x="65" y="108" text-anchor="middle" class="tm">"what am I?"</text>
    <rect x="210" y="10" width="110" height="30" rx="5" class="fs"/><text x="265" y="30" text-anchor="middle">K "animal"</text>
    <rect x="210" y="60" width="110" height="30" rx="5" class="fs"/><text x="265" y="80" text-anchor="middle">K "street"</text>
    <rect x="210" y="110" width="110" height="30" rx="5" class="fs"/><text x="265" y="130" text-anchor="middle">K "tired"</text>
    <line x1="122" y1="60" x2="206" y2="27" class="sr" stroke-width="4" marker-end="url(#tf-ah3)"/>
    <line x1="122" y1="70" x2="206" y2="75" class="sb" stroke-width="1" opacity="0.5" marker-end="url(#tf-ah3)"/>
    <line x1="122" y1="80" x2="206" y2="122" class="sr" stroke-width="2.5" marker-end="url(#tf-ah3)"/>
    <text x="340" y="30" class="tr">score 5.1 → weight 0.66</text>
    <text x="340" y="80" class="tm">score 0.3 → weight 0.01</text>
    <text x="340" y="130" class="tr">score 4.4 → weight 0.33</text>
    <text x="340" y="55" class="tm" font-size="11">Q·K = how well they match</text>
    <text x="340" y="105" class="tm" font-size="11">softmax: weights sum to 1</text>
    </svg><figcaption>One query matched against every key. Dot product gives a score; softmax turns scores into weights that sum to 1; the output is the values mixed by those weights.</figcaption></figure>
  <p>Read it as a matching step: the query of "it" is compared with the key of every token (including itself). High match → big weight. Then the output for "it" is the sum of all value vectors, each multiplied by its weight.</p>
  <h3>The formula</h3>
<div class="fx" data-lang="text">Attention(Q, K, V) = softmax( Q·Kᵀ / √d_k ) · V</div>
  <p>Every symbol in words: <code>Q·Kᵀ</code> is every query dotted with every key, giving an n × n table of match scores for n tokens. <code>√d_k</code> is the square root of the vector length, a scaling explained below. <code>softmax</code> turns each row of scores into weights that are positive and sum to 1. <code>· V</code> mixes the value vectors by those weights.</p>
  <p>Softmax on one row of three scores, by hand: take e to the power of each score, then divide by the total.</p>
  <div class="fx" data-lang="py">scores = np.array([2.0, 1.0, 0.0])
e = np.exp(scores)
print(e.round(2), (e / e.sum()).round(2))</div>
  <div class="fx" data-lang="text">[7.39 2.72 1.  ] [0.67 0.24 0.09]</div>
  <p>The biggest score gets most of the weight, but nothing gets zero. The three weights add up to 1.</p>
<figure class="viz"><svg viewBox="0 0 640 150" width="640">
    <rect x="20" y="20" width="36" height="90" class="fb sb"/><text x="38" y="69" text-anchor="middle">Q</text><text x="38" y="130" text-anchor="middle" class="tm">n×d</text>
    <text x="72" y="64" text-anchor="middle">·</text>
    <rect x="88" y="47" width="90" height="36" class="fb sb"/><text x="133" y="69" text-anchor="middle">Kᵀ</text><text x="133" y="130" text-anchor="middle" class="tm">d×n</text>
    <text x="196" y="64" text-anchor="middle">=</text>
    <rect x="214" y="20" width="90" height="90" class="ft st"/><text x="259" y="69" text-anchor="middle">scores</text><text x="259" y="130" text-anchor="middle" class="tm">n×n</text>
    <text x="350" y="56" text-anchor="middle" class="tm">÷√d_k</text><text x="350" y="74" text-anchor="middle" class="tm">softmax</text><text x="350" y="90" text-anchor="middle">→</text>
    <rect x="396" y="20" width="90" height="90" class="fg sg"/><text x="441" y="69" text-anchor="middle">weights</text><text x="441" y="130" text-anchor="middle" class="tm">rows sum 1</text>
    <text x="502" y="64" text-anchor="middle">×</text>
    <rect x="518" y="20" width="36" height="90" class="fv"/><text x="536" y="69" text-anchor="middle">V</text><text x="536" y="130" text-anchor="middle" class="tm">n×d</text>
    <text x="570" y="64" text-anchor="middle">=</text>
    <rect x="586" y="20" width="36" height="90" class="fr sr"/><text x="604" y="69" text-anchor="middle">out</text><text x="604" y="130" text-anchor="middle" class="tm">n×d</text>
    </svg><figcaption>Shapes for n tokens: one n×n score matrix (the O(n²) part), and the output keeps the input's n×d shape.</figcaption></figure>
  <p>Follow the shapes left to right. n tokens of width d go in; the score table in the middle is n × n (this is the O(n²) part); the output on the right has the same n × d shape as the input, which is what lets blocks stack.</p>
  <h3>Why divide by √d_k</h3>
  <p>A dot product adds up d_k separate products. The more terms you add, the wider the results spread: the spread grows like √d_k. Very big scores push softmax to put ~100% on one token (<strong>saturation</strong>), and then the training signal (gradient) through softmax vanishes. Dividing by √d_k brings the spread back to about 1:</p>
<table class="tbl out"><caption>Result (5 random keys, see Build It)</caption>
    <tr><th>d_k</th><th>std of raw scores</th><th>max softmax weight, raw</th><th>max weight, scaled</th></tr>
    <tr><td>4</td><td>0.7</td><td>0.43</td><td>0.31</td></tr>
    <tr><td>64</td><td>7.8</td><td>1.00</td><td>0.51</td></tr>
    <tr><td>512</td><td>20.9</td><td>1.00</td><td>0.51</td></tr>
  </table>
  <p>Read the d_k = 64 row: without scaling, the biggest weight is already 1.00 (one token takes everything). With scaling it is 0.51, a real mix.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Attention weights are not a reliable explanation of <em>why</em> a model answered something. Many heads, layers and residual paths mix the signal.</p>
  </div>

  <h2 id="tf-mha"><span class="num">05</span>Multi-Head Attention</h2>
  <p>One attention pattern can capture one kind of relationship. But "it" needs several at once: which noun it refers to, what state it is in, what it did not do. One set of weights cannot do all three.</p>
  <p>Fix: run several attention operations side by side, each with its own small W_Q, W_K, W_V, and let each learn its own pattern. Each one is a <strong>head</strong>.</p>
  <div class="flow"><span>Q, K, V (512)</span><span>split into 8 heads × 64</span><span>attention per head, in parallel</span><span>concat → 512</span><span>× W_O</span></div>
  <ul>
    <li>Each <strong>head</strong> gets its own 64-number slice of the 512 and learns its own pattern (coreference, syntax, nearby words…).</li>
    <li><strong>Same cost as one big head</strong>: 8 heads on 64 dims ≈ 1 head on 512 dims. More perspectives, no extra FLOPs (floating-point operations, the unit of GPU work).</li>
    <li><code>W_O</code> is one more learned matrix that mixes the heads' outputs back together.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Eight specialists each read the sentence looking for one thing, then pool their notes. One generalist doing all eight jobs does each one worse.</p>
  </div>

  <h2 id="tf-block"><span class="num">06</span>The Transformer Block</h2>
  <p>Attention is one part. A Transformer is many copies of a <strong>block</strong> stacked on top of each other (12 in BERT-base, ~100 in large LLMs). Each block has two sub-steps, attention and a small neural network, plus two helpers that make deep stacks trainable: residual connections and normalisation.</p>
<figure class="viz"><svg viewBox="0 0 640 140" width="640">
    <defs><marker id="tf-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="35" y="99" text-anchor="middle">x</text>
    <rect x="70" y="80" width="50" height="30" rx="5" class="fs"/><text x="95" y="99" text-anchor="middle">Norm</text>
    <rect x="140" y="80" width="90" height="30" rx="5" class="fb sb"/><text x="185" y="99" text-anchor="middle">Attention</text>
    <circle cx="255" cy="95" r="12" fill="none" stroke="currentColor"/><text x="255" y="99" text-anchor="middle">+</text>
    <rect x="300" y="80" width="50" height="30" rx="5" class="fs"/><text x="325" y="99" text-anchor="middle">Norm</text>
    <rect x="370" y="80" width="70" height="30" rx="5" class="fg sg"/><text x="405" y="99" text-anchor="middle">FFN</text>
    <circle cx="465" cy="95" r="12" fill="none" stroke="currentColor"/><text x="465" y="99" text-anchor="middle">+</text>
    <text x="540" y="99" text-anchor="middle">out</text>
    <line x1="52" y1="95" x2="68" y2="95" stroke="currentColor" marker-end="url(#tf-ah2)"/>
    <line x1="122" y1="95" x2="138" y2="95" stroke="currentColor" marker-end="url(#tf-ah2)"/>
    <line x1="232" y1="95" x2="241" y2="95" stroke="currentColor" marker-end="url(#tf-ah2)"/>
    <line x1="269" y1="95" x2="298" y2="95" stroke="currentColor" marker-end="url(#tf-ah2)"/>
    <line x1="352" y1="95" x2="368" y2="95" stroke="currentColor" marker-end="url(#tf-ah2)"/>
    <line x1="442" y1="95" x2="451" y2="95" stroke="currentColor" marker-end="url(#tf-ah2)"/>
    <line x1="479" y1="95" x2="518" y2="95" stroke="currentColor" marker-end="url(#tf-ah2)"/>
    <path d="M45,87 L45,40 L255,40 L255,82" fill="none" class="st" stroke-width="2" marker-end="url(#tf-ah2)"/>
    <path d="M278,95 L278,40 L465,40 L465,82" fill="none" class="st" stroke-width="2" marker-end="url(#tf-ah2)"/>
    <text x="60" y="32" class="tm">residual: copy x around</text><text x="300" y="32" class="tm">residual again</text>
    <text x="185" y="132" class="tm">mixes tokens</text><text x="365" y="132" class="tm">per token, 4× wide</text>
    </svg><figcaption>Pre-norm block: each sublayer only adds a correction to x. Shape in = shape out, so blocks stack.</figcaption></figure>
  <p>Read left to right: x goes in, gets normalised, goes through attention, and the result is <em>added</em> to the original x (the teal arrow over the top). Same again with the FFN. The output has the same shape as x, so the next block can take it.</p>
  <h3>Feed-forward network (FFN)</h3>
  <div class="flow"><span>token (d_model)</span><span>expand ~4×</span><span>GELU / SwiGLU</span><span>project back</span></div>
  <p>Attention moves information <em>between</em> tokens. The FFN then works on each token on its own: a small two-layer network that widens the vector about 4×, applies a non-linear function (GELU or SwiGLU, cousins of ReLU), and shrinks it back. It holds most of the model's parameters, and much of the factual recall ("Paris is the capital of France") seems to live there.</p>
  <h3>Residual connections</h3>
  <p>Each sub-step computes <code>output = x + Layer(x)</code>: it adds a correction to the input instead of replacing it. Two reasons:</p>
  <ul>
    <li><strong>Gradient highway</strong>: training works by sending an error signal backwards through every layer. Without the "+ x" shortcut, the signal gets multiplied at every layer and shrinks. At 0.9 per layer across 96 layers, 0.9⁹⁶ ≈ 0.00004 reaches layer 1: nothing learns. The shortcut lets the signal pass straight through.</li>
    <li><strong>No information loss</strong>: position and token meaning from the start survive dozens of layers.</li>
  </ul>
  <div class="fx" data-lang="py">print(0.9 ** 96)</div>
  <div class="fx" data-lang="text">4.0483766022843375e-05</div>
  <div class="callout anlg"><span class="label">Analogy: editors</span>
    <p>Without residuals, 96 editors each rewrite the document from scratch; by editor 20 the original is gone. With residuals, each editor only writes margin notes, and the original stays underneath.</p>
  </div>
  <h3>LayerNorm</h3>
  <p>After many additions, the numbers in a vector can drift very large or very small, which makes training unstable. <strong>LayerNorm</strong> rescales each token's vector so its numbers have mean 0 and spread 1 (then applies a learned scale and shift). One vector, before and after:</p>
  <div class="fx" data-lang="py">x = np.array([2.0, 4.0, 6.0, 8.0])
print(((x - x.mean()) / x.std()).round(2))</div>
  <div class="fx" data-lang="text">[-1.34 -0.45  0.45  1.34]</div>
  <table class="tbl">
    <tr><th>What</th><th>Why</th><th>Where</th></tr>
    <tr><td>Rescale each token vector to mean 0, variance 1 (+ learned scale, shift)</td><td>Stops values drifting huge or tiny over many layers: stable training</td><td>Original: after sublayer (post-norm). Modern LLMs: before it (<strong>pre-norm</strong>, above). RMSNorm = cheaper variant that skips the mean</td></tr>
  </table>
  <div class="callout intu"><span class="label">Why stack many blocks</span>
    <p>Like re-reading a hard paragraph: early layers resolve words and grammar, middle layers link ideas, later layers capture task-level meaning. Each layer refines the last one's output. Every block keeps the shape (n tokens × d_model), so they stack freely.</p>
  </div>

  <h2 id="tf-arch"><span class="num">07</span>Encoder, Decoder, Both</h2>
  <p>The same block can be wired in three ways, depending on one question: may a token look at the tokens that come <em>after</em> it?</p>
  <div class="cards">
    <div><b>Encoder-only</b><p>Bidirectional: every token sees every token, both sides. Outputs a contextual vector per token.</p><small>BERT, RoBERTa: classification, NER, embeddings for search</small></div>
    <div><b>Decoder-only</b><p>Causal: each token sees only itself and earlier tokens. Generates one token at a time.</p><small>GPT, Llama, Claude: chat, code, completion</small></div>
    <div><b>Encoder-decoder</b><p>Encoder reads the source; decoder writes the target, consulting the encoder via cross-attention.</p><small>T5, BART, original Transformer: translation, summarisation</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Encoder = a judge reading the whole case file before forming a view. Decoder = an author writing left to right, unable to see the sentence not yet written. Encoder-decoder = a translator who reads the source fully, then writes while glancing back at it.</p>
  </div>
  <h3>Causal mask</h3>
  <p>A decoder is trained to predict the next token. If token 3 could peek at token 4 while being trained to predict it, the task would be cheating. So before softmax, every score pointing to a future token is set to −∞. e to the power of −∞ is 0, so the future gets weight 0.</p>
  <table class="tbl">
    <tr><th>query ↓ / key →</th><th>The</th><th>cat</th><th>sat</th><th>on</th></tr>
    <tr><td>The</td><td>✓</td><td>✗</td><td>✗</td><td>✗</td></tr>
    <tr><td>cat</td><td>✓</td><td>✓</td><td>✗</td><td>✗</td></tr>
    <tr><td>sat</td><td>✓</td><td>✓</td><td>✓</td><td>✗</td></tr>
    <tr><td>on</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
  </table>
  <p>Each row is one token asking; ✓ means it may look there. "cat" may look at "The" and itself, never at "sat".</p>
  <p>Bonus: one forward pass trains on every position at once, since each row is a separate "predict the next token" example.</p>
  <h3>Cross-attention</h3>
  <div class="flow"><span>decoder: Q "what do I need now?"</span><span>encoder output: K, V "what did the source say?"</span><span>attention</span></div>
  <p>Self-attention takes Q, K, V from one sequence. <strong>Cross-attention</strong> splits them: the query comes from the sentence being written, the keys and values from the sentence being read. So an enc-dec decoder block has three sublayers: masked self-attention, cross-attention, FFN.</p>

  <h2 id="tf-bert"><span class="num">08</span>BERT vs GPT</h2>
  <p>The two famous 2018 models are the encoder-only and decoder-only designs, each with the training task that suits it.</p>
  <table class="tbl">
    <tr><th></th><th>BERT</th><th>GPT</th></tr>
    <tr><td>Architecture</td><td>Encoder-only</td><td>Decoder-only</td></tr>
    <tr><td>Attention</td><td>Bidirectional</td><td>Causal (left to right)</td></tr>
    <tr><td>Training task</td><td><strong>Masked language modelling</strong>: hide ~15% of tokens, predict them from both sides</td><td>Next-token prediction (details in <a class="xref" data-note="llm_basics">How LLMs Work</a>)</td></tr>
    <tr><td>Output</td><td>A vector per token; add a small head for a task</td><td>Text, generated token by token</td></tr>
    <tr><td>Best at</td><td>Understanding: classify, tag, embed</td><td>Generation, and (at scale) nearly everything via prompting</td></tr>
  </table>
  <div class="callout intu"><span class="label">Why MLM for BERT</span>
    <p>An encoder sees every token, so "predict the next word" would be trivial: it's right there. Masking forces it to use context from both sides: "The [MASK] sat on the mat" → "cat".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"BERT is obsolete" is wrong. Small encoders still power embeddings, rerankers and classifiers in production (06, 07), at a fraction of an LLM's cost.</p>
  </div>
  <p>Decoder-only won for general-purpose LLMs: one simple objective, scales well, and any task can be phrased as text continuation. How that training and generation work is <em><a class="xref" data-note="llm_basics">How LLMs Work</a></em>.</p>

  <h2 id="tf-build"><span class="num">09</span>Build It: Attention in numpy</h2>
  <p>Scaled dot-product attention on 3 tokens with <code>d_model = 4</code>, about 20 lines. The embeddings are hand-made and the weight matrices random; in a real model both are learned. Read the comments: each line is one step of the formula from section 04.</p>
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

  <h2 id="tf-qa"><span class="num">10</span>Questions &amp; Answers</h2>
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
