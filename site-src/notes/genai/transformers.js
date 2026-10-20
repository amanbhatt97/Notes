// notes/genai/transformers.js — Transformers
Object.assign(TOPIC_CONTENT, {
  "transformers": `<main>
  <h1>Transformers</h1>
  <div class="where"><span>Generative AI</span><span>Transformers</span></div>
  <p class="lead">The architecture under every modern LLM. <a class="xref" data-note="nlp">NLP Foundations</a> ended at a wall: every word vector it built gives "hot" one fixed vector, whether the Biteful customer wrote <strong>"curry was too hot"</strong> (too spicy) or <strong>"chai was too hot"</strong> (too hot to drink). This note builds, piece by piece, the machine that gives the two "hot"s different vectors, and every piece is added because the previous one leaves a specific gap. <strong>Running example throughout:</strong> those two 4-token reviews, with hand-made 4-number embeddings so every attention weight can be checked on paper, then a tiny model trained on the same synthetic Biteful review corpus as the NLP note. Attention itself is derived from scratch in <a class="xref" data-note="dl_attention">Attention Mechanisms</a>; here it is recapped and assembled into the full Transformer. Every code block ran here (NumPy, PyTorch 2.14 CPU, one thread).</p>

  <h2 id="tf-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 200" width="680">
<defs><marker id="tf-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="31" text-anchor="middle" font-size="12">NLP Foundations</text><text x="90" y="48" text-anchor="middle" class="tm" font-size="10">tokens, static vectors</text>
<rect x="10" y="75" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="96" text-anchor="middle" font-size="12">RNNs</text><text x="90" y="113" text-anchor="middle" class="tm" font-size="10">sequential, forgetful</text>
<rect x="10" y="140" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="161" text-anchor="middle" font-size="12">Attention</text><text x="90" y="178" text-anchor="middle" class="tm" font-size="10">soft lookup, Q/K/V</text>
<rect x="250" y="72" width="170" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="335" y="95" text-anchor="middle" font-size="13" font-weight="700">Transformers</text><text x="335" y="114" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="500" y="20" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="585" y="41" text-anchor="middle" font-size="12">How LLMs Work</text><text x="585" y="58" text-anchor="middle" class="tm" font-size="10">scale, tuning, decoding</text>
<rect x="500" y="125" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="585" y="146" text-anchor="middle" font-size="12">Vector DBs</text><text x="585" y="163" text-anchor="middle" class="tm" font-size="10">sentence embeddings</text>
<line x1="170" y1="35" x2="248" y2="88" stroke="currentColor" marker-end="url(#tf-a0)"/><line x1="170" y1="100" x2="248" y2="100" stroke="currentColor" marker-end="url(#tf-a0)"/><line x1="170" y1="165" x2="248" y2="112" stroke="currentColor" marker-end="url(#tf-a0)"/>
<line x1="420" y1="92" x2="498" y2="48" stroke="currentColor" marker-end="url(#tf-a0)"/><line x1="420" y1="108" x2="498" y2="148" stroke="currentColor" marker-end="url(#tf-a0)"/>
</svg><figcaption>The Transformer combines NLP's tokens and embeddings with attention, and replaces the RNN. Everything after it in the track is built on it.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="nlp">NLP Foundations</a>, <a class="xref" data-note="dl_rnns">RNNs</a>, <a class="xref" data-note="dl_attention">Attention</a></b><span>NLP gave us tokens and static word vectors, and the context problem: cos(hot, spicy) = 0.86 and cos(hot, warm) = 0.77, one blended vector. RNNs read in context but one word at a time and forget. Attention showed how one position can read all others with a weighted average.</span></li>
    <li><b>This note adds: the Transformer</b><span>Self-attention with learned Q/K/V projections, several heads, positions, residual connections, LayerNorm and a feed-forward network, assembled into one block and traced with shapes; the three ways to wire blocks (BERT, GPT, T5), causal masks, cross-attention, and the two pretraining objectives.</span></li>
    <li><b>Leads to: <a class="xref" data-note="llm_basics">How LLMs Work</a> and <a class="xref" data-note="vectordb">Vector DBs</a></b><span>A decoder-only Transformer trained on next-token prediction at scale is an LLM. An encoder trained for similarity gives the sentence embeddings that vector databases search, and that <a class="xref" data-note="rag">RAG</a> retrieves with.</span></li>
  </ol>

  <h2 id="tf-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers are from R3 "curry was too hot" and R4 "chai was too hot".</p>
  <ol class="story">
    <li><b>The context problem</b><span>Q: why can't a word vector tell the two "hot"s apart? → It is looked up from a table, identical in every sentence. RNNs add context but sequentially and forgetfully. We need every word to read every other word directly…</span></li>
    <li><b>Self-attention (recap)</b><span>Q: how can "hot" read "curry"? → Score every word against "hot", softmax, take the weighted average. With raw vectors "hot" gives itself 0.334 and "curry" only 0.203: similarity is not relevance…</span></li>
    <li><b>Q/K/V projections</b><span>Q: how does "hot" learn what to look for? → Learned matrices make a query ("which food or drink?"), keys and values: "curry" now gets 0.711, and hot's new vector is 0.964 similar to spicy in R3 but 0.964 similar to warm in R4. But one set of weights captures one kind of relation…</span></li>
    <li><b>Multi-head attention</b><span>Q: what if a word needs several relations at once? → Split into heads that attend separately, concatenate, mix with W<sub>O</sub>; same parameter count. But shuffle the words and nothing changes…</span></li>
    <li><b>Positional encodings</b><span>Q: how does attention know order? → Add a position vector (sinusoidal or learned) or rotate Q and K (RoPE). Now we can stack layers, but deep stacks don't train…</span></li>
    <li><b>Residual connections &amp; LayerNorm</b><span>Q: why do deep stacks fail? → Without "+ x" the gradient at the input falls from 0.12 (6 layers) to 6 × 10⁻¹³ (48 layers); without normalisation activations explode to 3 × 10⁸. Attention only averages, though; who transforms each token?</span></li>
    <li><b>Feed-forward network</b><span>Q: where is the non-linear per-token processing? → Expand 4×, GELU, project back, per token; two-thirds of each block's weights. Now assemble…</span></li>
    <li><b>The full block, traced</b><span>Q: what exactly happens to a (4 × d) input? → LN → MHA → +x → LN → FFN → +x; shape (4, 4) in and out, and our NumPy version matches PyTorch's layer. How do we wire many blocks for a task?</span></li>
    <li><b>Encoder vs decoder vs encoder–decoder</b><span>Q: read, write, or translate? → BERT (sees both sides), GPT (sees only the past), T5 (reads, then writes). What enforces "only the past"?</span></li>
    <li><b>Masked (causal) attention</b><span>Q: how do we stop a generator from peeking? → −∞ above the diagonal before softmax: "chai" sees only itself, "hot" sees all four. How does a decoder read a separate input sentence?</span></li>
    <li><b>Cross-attention</b><span>Q: how does the Hindi "garam" find the English "hot"? → Queries from the decoder, keys and values from the encoder. The architecture is complete; how does it learn language at all?</span></li>
    <li><b>Pretraining objectives</b><span>Q: what task teaches it? → Masked LM (fill the blank, both sides) or next-token prediction. Our tiny GPT predicts spicy/hot/fiery after "curry was too" and steaming/warm/hot after "chai was too", and its contextual "hot" is 0.96 similar to "spicy" in R3 but 0.90 similar to "warm" in R4. The context problem is solved…</span></li>
    <li><b>How this becomes an LLM</b><span>Q: what turns this into ChatGPT or Claude? → The same decoder, scaled to billions of parameters and trillions of tokens, plus instruction tuning: <a class="xref" data-note="llm_basics">How LLMs Work</a>.</span></li>
  </ol>

  <h2 id="tf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Transformers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why (the gap)</div>
        <ul>
          <li><b>Static vectors</b> — one "hot" for curry and chai</li>
          <li><b>RNNs</b> — sequential, forgetful, one-vector bottleneck</li>
          <li><b>Attention</b> — any word reads any word in one step, all in parallel</li>
          <li>⚠ <b>Cost</b> — n² pairs per layer</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Self-attention + Q/K/V</div>
        <ul>
          <li><b>Formula</b> — softmax(QKᵀ/√d<sub>k</sub>)V</li>
          <li><b>Q = XW<sub>Q</sub></b> what I seek · <b>K = XW<sub>K</sub></b> what I offer · <b>V = XW<sub>V</sub></b> what I hand over</li>
          <li><b>Raw (no W)</b> — "hot" → curry 0.203; <b>projected</b> → 0.711</li>
          <li><b>√d<sub>k</sub></b> — keeps softmax from saturating</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multi-head &amp; position</div>
        <ul>
          <li><b>Heads</b> — split d into h slices, attend, concat, × W<sub>O</sub></li>
          <li><b>Params</b> — 4d² + 4d whatever h</li>
          <li><b>Order-blind</b> — shuffled input → shuffled output</li>
          <li><b>Sinusoidal</b> · <b>learned</b> (BERT, GPT-2) · <b>RoPE</b> (Llama): q·k depends on distance</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Making it deep</div>
        <ul>
          <li><b>Residual</b> x + f(x) — gradient highway</li>
          <li><b>LayerNorm</b> — mean 0, var 1 per token; pre-norm today</li>
          <li><b>FFN</b> — d → 4d → d, GELU; ⅔ of block weights</li>
          <li><b>Block</b> — x + MHA(LN x); x + FFN(LN x); shape kept</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Three families</div>
        <ul>
          <li><b>Encoder</b> (BERT) — bidirectional; classify, embed</li>
          <li><b>Decoder</b> (GPT, Llama, Claude) — causal; generate</li>
          <li><b>Encoder–decoder</b> (T5, BART) — cross-attention; translate</li>
          <li><b>Causal mask</b> — −∞ above diagonal; first row [1, 0, 0, 0]</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pretraining</div>
        <ul>
          <li><b>MLM</b> — mask 15% (80/10/10), predict from both sides</li>
          <li><b>Next-token</b> — predict token t+1 from 1…t, every position at once</li>
          <li><b>Loss</b> — cross-entropy −ln p(correct)</li>
          <li><b>LLM</b> = big decoder + next-token + data + tuning</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="tf-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="tf-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Context Problem</span><span class="rm-sub">Two "hot"s, one vector</span></div></div>
      <div class="rm-item rm-done" data-target="tf-attn"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Self-Attention Recap</span><span class="rm-sub">Raw vectors, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="tf-qkv"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Q, K, V Projections</span><span class="rm-sub">Learning what to look for; √d</span></div></div>
      <div class="rm-item rm-done" data-target="tf-mha"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Multi-Head Attention</span><span class="rm-sub">Several relations at once</span></div></div>
      <div class="rm-item rm-done" data-target="tf-pos"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Positional Encodings</span><span class="rm-sub">Sinusoidal, learned, RoPE</span></div></div>
      <div class="rm-item rm-done" data-target="tf-norm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Residuals &amp; LayerNorm</span><span class="rm-sub">Why deep stacks train, shown</span></div></div>
      <div class="rm-item rm-done" data-target="tf-ffn"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Feed-Forward Network</span><span class="rm-sub">Per-token processing</span></div></div>
      <div class="rm-item rm-done" data-target="tf-block"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">The Full Block, Traced</span><span class="rm-sub">Shapes on 4 tokens; vs PyTorch</span></div></div>
      <div class="rm-item rm-done" data-target="tf-arch"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Encoder, Decoder, Both</span><span class="rm-sub">BERT, GPT, T5</span></div></div>
      <div class="rm-item rm-done" data-target="tf-mask"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Masked (Causal) Attention</span><span class="rm-sub">No peeking at the future</span></div></div>
      <div class="rm-item rm-done" data-target="tf-cross"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Cross-Attention</span><span class="rm-sub">Reading another sentence</span></div></div>
      <div class="rm-item rm-done" data-target="tf-pretrain"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Pretraining Objectives</span><span class="rm-sub">MLM vs next-token, trained</span></div></div>
      <div class="rm-item rm-done" data-target="tf-llm"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How This Becomes an LLM</span><span class="rm-sub">Generation and scale</span></div></div>
      <div class="rm-item rm-done" data-target="tf-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One block, many fixes</span></div></div>
      <div class="rm-item rm-done" data-target="tf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="tf-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="tf-why"><span class="num">01</span>The Context Problem</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>NLP Foundations left Biteful with two complaints that every method scored as nearly identical: R3 "curry was too hot" (send to the kitchen: less chilli) and R4 "chai was too hot" (send to packaging: let drinks cool). Why does every word vector fail here, and what kind of model could succeed?</p>
  </div>
  <p>A word vector from Word2Vec, GloVe or a Transformer's own input layer is a row looked up in a table by token ID. The table does not know what sentence the word came from, so "hot" gets the same row in R3 and R4. To see the arithmetic clearly, this note uses hand-made 4-number embeddings whose dimensions mean something: <strong>[food, drink, heat, filler]</strong>.</p>
  <table class="tbl">
    <tr><th>token</th><th>embedding</th><th>reading</th></tr>
    <tr><td>curry</td><td>[1, 0, 0, 0]</td><td>a food</td></tr>
    <tr><td>chai</td><td>[0, 1, 0, 0]</td><td>a drink</td></tr>
    <tr><td>was</td><td>[0, 0, 0, 1]</td><td>filler</td></tr>
    <tr><td>too</td><td>[0, 0, 0.5, 1]</td><td>filler that hints at intensity</td></tr>
    <tr><td>hot</td><td>[0, 0, 1, 0]</td><td>heat, with no food-or-drink side</td></tr>
    <tr><td>spicy / warm (reference points)</td><td>[1, 0, 1, 0] / [0, 1, 1, 0]</td><td>heat of food / heat of a drink</td></tr>
  </table>
<div class="fx" data-lang="py">import numpy as np
np.set_printoptions(precision=3, suppress=True)
E = {"curry": [1, 0, 0, 0], "chai": [0, 1, 0, 0], "was": [0, 0, 0, 1],
     "too": [0, 0, 0.5, 1], "hot": [0, 0, 1, 0]}
E = {w: np.array(v, dtype=float) for w, v in E.items()}
spicy, warm = np.array([1.0, 0, 1, 0]), np.array([0, 1.0, 1, 0])
cos = lambda a, b: float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
R3, R4 = "curry was too hot".split(), "chai was too hot".split()
X3 = np.stack([E[w] for w in R3]); X4 = np.stack([E[w] for w in R4])
print("X3 (R3, one row per token):\\n", X3)
print("hot in R3 == hot in R4:", np.array_equal(X3[3], X4[3]))
print("cos(hot, spicy) =", round(cos(E["hot"], spicy), 3), " cos(hot, warm) =", round(cos(E["hot"], warm), 3))</div>
  <div class="fx" data-lang="text">X3 (R3, one row per token):
 [[1.  0.  0.  0. ]
 [0.  0.  0.  1. ]
 [0.  0.  0.5 1. ]
 [0.  0.  1.  0. ]]
hot in R3 == hot in R4: True
cos(hot, spicy) = 0.707  cos(hot, warm) = 0.707</div>
  <p>Stacking the four rows gives the input matrix X, one row per token, shape (4, 4): this is what a Transformer layer receives. Row 4 of X3 and row 4 of X4 are identical, and the static "hot" is exactly halfway between spicy and warm (0.707 to both). Same conclusion as the NLP note, now in numbers we can follow through every step.</p>
  <h3>Why not an RNN?</h3>
  <p>A recurrent network (<a class="xref" data-note="dl_rnns">RNNs</a>) does read in context: it carries a memory vector from word to word. Three problems made it lose to the Transformer.</p>
<figure class="viz"><svg viewBox="0 0 620 150" width="620">
    <defs><marker id="tf-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="20" y="22">RNN: one step at a time</text><text x="350" y="22">Transformer: all pairs at once</text>
    <line x1="320" y1="10" x2="320" y2="140" stroke="currentColor" opacity="0.25"/>
    <rect x="20" y="70" width="52" height="28" rx="4" class="fs"/><text x="46" y="89" text-anchor="middle">curry</text>
    <line x1="72" y1="84" x2="89" y2="84" stroke="currentColor" marker-end="url(#tf-ah)"/>
    <rect x="90" y="70" width="52" height="28" rx="4" class="fs"/><text x="116" y="89" text-anchor="middle">was</text>
    <line x1="142" y1="84" x2="159" y2="84" stroke="currentColor" marker-end="url(#tf-ah)"/>
    <rect x="160" y="70" width="52" height="28" rx="4" class="fs"/><text x="186" y="89" text-anchor="middle">too</text>
    <line x1="212" y1="84" x2="229" y2="84" stroke="currentColor" marker-end="url(#tf-ah)"/>
    <rect x="230" y="70" width="52" height="28" rx="4" class="fs"/><text x="256" y="89" text-anchor="middle">hot</text>
    <text x="20" y="128" class="tm">hot waits for too; curry has faded</text>
    <path d="M370,88 Q420,30 470,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M370,88 Q445,0 520,88" fill="none" class="sr" stroke-width="3" opacity="0.8"/>
    <path d="M370,88 Q395,50 420,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M420,88 Q445,50 470,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M420,88 Q470,30 520,88" fill="none" class="sb" opacity="0.6"/>
    <path d="M470,88 Q495,50 520,88" fill="none" class="sb" opacity="0.6"/>
    <circle cx="370" cy="96" r="15" class="fb sb"/><text x="370" y="100" text-anchor="middle" font-size="10">curry</text>
    <circle cx="420" cy="96" r="15" class="fb sb"/><text x="420" y="100" text-anchor="middle" font-size="10">was</text>
    <circle cx="470" cy="96" r="15" class="fb sb"/><text x="470" y="100" text-anchor="middle" font-size="10">too</text>
    <circle cx="520" cy="96" r="15" class="fb sb"/><text x="520" y="100" text-anchor="middle" font-size="10">hot</text>
    <text x="350" y="134" class="tm">"hot" reaches "curry" in 1 step (red)</text>
    </svg><figcaption>An RNN passes one memory vector along the chain; attention links every pair directly and in parallel (cost: n² pairs).</figcaption></figure>
  <table class="tbl">
    <tr><th>RNN problem</th><th>What goes wrong</th><th>Transformer fix</th></tr>
    <tr><td><strong>Sequential</strong></td><td>Word 50 waits for word 49, so GPU cores sit idle</td><td>All positions processed in parallel</td></tr>
    <tr><td><strong>Forgetful</strong></td><td>The memory is overwritten every step; word 1 fades by word 50</td><td>Any word reaches any other in one step</td></tr>
    <tr><td><strong>Bottleneck</strong></td><td>Seq2seq squeezed a sentence into one vector</td><td>The output can look at every input position</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An RNN reads the order slip one word at a time with its eyes closed in between, keeping a Post-it summary. A Transformer lays the whole slip on the counter and lets every word look at every other word at once.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Contextual representation</strong>: a vector for a token <em>occurrence</em>, computed from the whole input, so the same token in different sentences gets different vectors. <strong>Transformer</strong> (Vaswani et al., 2017, "Attention Is All You Need"): a network built only from attention and per-token feed-forward layers, with no recurrence.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Every word looks at every word" costs O(n²) in sequence length n: 4 tokens = 16 pairs, 1,000 tokens = 1,000,000 pairs per head per layer. Double the text, four times the attention work. That is why long context is expensive (<a class="xref" data-note="llm_basics">How LLMs Work</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Self-attention.</b> We want "hot" to pull information from "curry" in R3 and from "chai" in R4. What is the simplest operation that lets a word read the other words of its sentence?</div>

  <h2 id="tf-attn"><span class="num">02</span>Self-Attention Recap</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"hot" needs to know whether its sentence is about food or a drink. How can one row of X be rebuilt from all four rows, giving more weight to the rows that matter?</p>
  </div>
  <p>The <a class="xref" data-note="dl_attention">Attention note</a> derives this in detail; here is the recipe. To update "hot": (1) <strong>score</strong> every token by the dot product with "hot" (how much they agree); (2) <strong>scale</strong> by √d = √4 = 2 and <strong>softmax</strong> the scores into weights that are positive and sum to 1; (3) the new "hot" is the <strong>weighted sum</strong> of all rows. Doing that for every token at once is <strong>self-attention</strong>: the sentence attends to itself.</p>
  <p>By hand, first with the raw embeddings (no learned matrices yet) on R3. Scores of "hot" = [0, 0, 1, 0] against curry, was, too, hot: <strong>0, 0, 0.5, 1</strong> (only "too" and "hot" have a heat number). Divide by 2: 0, 0, 0.25, 0.5. Exponentials: 1, 1, 1.284, 1.649; total 4.933. Weights: <strong>0.203, 0.203, 0.260, 0.334</strong>. New "hot" = 0.203·curry + 0.203·was + 0.260·too + 0.334·hot = [0.203, 0, 0.130 + 0.334, 0.203 + 0.260] = <strong>[0.203, 0, 0.464, 0.463]</strong>.</p>
<div class="fx" data-lang="py">def softmax(z):
    e = np.exp(z - z.max(axis=-1, keepdims=True))     # subtract max: same result, no overflow
    return e / e.sum(axis=-1, keepdims=True)

def self_attention_raw(X):
    A = softmax(X @ X.T / np.sqrt(X.shape[1]))          # every token vs every token
    return A @ X, A

out3, A3 = self_attention_raw(X3)
out4, _ = self_attention_raw(X4)
print("weights of 'hot' (curry, was, too, hot):", A3[3])
print("new hot in R3:", out3[3], " in R4:", out4[3])
print("R3: cos(new hot, spicy) = %.3f  cos(new hot, warm) = %.3f" % (cos(out3[3], spicy), cos(out3[3], warm)))</div>
  <div class="fx" data-lang="text">weights of 'hot' (curry, was, too, hot): [0.203 0.203 0.26  0.334]
new hot in R3: [0.203 0.    0.464 0.463]  in R4: [0.    0.203 0.464 0.463]
R3: cos(new hot, spicy) = 0.687  cos(new hot, warm) = 0.478</div>
  <p><code>X @ X.T</code> computes all 16 scores at once (row i, column j = token i dotted with token j); row 4 is "hot"'s scores. <code>softmax</code> runs along each row (<code>axis=-1</code>), and <code>A @ X</code> takes the weighted sums. The new "hot" already differs between R3 and R4 and leans towards spicy in R3 (0.687 vs 0.478): context works. But look at the weights: "hot" gives the most attention to <em>itself</em> (0.334) and to the filler "too" (0.260), and only 0.203 to "curry", the one word that decides its meaning. Raw dot products measure <em>similarity</em>; what we need is <em>relevance</em>, and "hot" is not similar to "curry", it needs it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking a crowded kitchen "who knows about heat?" gets answers from the people most like you (the other chilli lovers), not from the one person holding the order slip that says what dish it was. You need to ask a different question than "who is like me?".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Self-attention</strong>: each output row is a weighted average of all input rows, with weights softmax(scores / √d), where scores compare each token with every token of the same sequence. Output shape = input shape (n × d).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Attention weights are not an explanation of the model's decision. They show what was mixed in, and later layers, other heads and residual paths change the picture. Read them as hints.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Q, K, V projections.</b> With raw vectors, "what I look for", "what I am found by" and "what I hand over" are all the same vector, so a word attends mostly to words like itself. How can "hot" ask "which food or drink is near me?" instead?</div>

  <h2 id="tf-qkv"><span class="num">03</span>Q, K, V Projections</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"hot" should look for a food-or-drink word; "curry" and "chai" should be easy to find by exactly that; what they hand over should be their identity. How do we give one token three different roles, and let training decide them?</p>
  </div>
  <p>Each token makes three versions of itself by multiplying with three learned matrices:</p>
  <ul>
    <li><strong>Query</strong> q = x W<sub>Q</sub>: what am I looking for?</li>
    <li><strong>Key</strong> k = x W<sub>K</sub>: what can I be found by?</li>
    <li><strong>Value</strong> v = x W<sub>V</sub>: what do I hand over if chosen?</li>
  </ul>
  <p>Then attention is the same recipe, using queries against keys for the scores and values for the sum:</p>
  <div class="fx" data-lang="text">Attention(Q, K, V) = softmax( Q Kᵀ / √d_k ) V        Q = X W_Q,  K = X W_K,  V = X W_V</div>
  <p>In a real model W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> are learned. We set them by hand to show what training could find. W<sub>Q</sub> turns the heat dimension into the question "food or drink?": its heat row is [4, 4, 0, 0], every other row 0. W<sub>K</sub> exposes only the food and drink dimensions (diag(1, 1, 0, 0)). W<sub>V</sub> is the identity: values are the embeddings.</p>
  <ol>
    <li><strong>Query of "hot"</strong> = [0, 0, 1, 0] W<sub>Q</sub> = heat row = <strong>[4, 4, 0, 0]</strong>.</li>
    <li><strong>Keys</strong>: curry [1, 0, 0, 0], was [0, 0, 0, 0], too [0, 0, 0, 0], hot [0, 0, 0, 0].</li>
    <li><strong>Scores</strong> q · k: curry 4, was 0, too 0, hot 0. Scale by √4 = 2: [2, 0, 0, 0].</li>
    <li><strong>Softmax</strong>: e² = 7.389, three times e⁰ = 1, total 10.389 → <strong>[0.711, 0.096, 0.096, 0.096]</strong>. "curry" now gets most of the attention.</li>
    <li><strong>Output</strong> = 0.711·curry + 0.096·(was + too + hot) = [0.711, 0, 0.096 × 1.5, 0.096 × 2] = <strong>[0.711, 0, 0.144, 0.193]</strong>.</li>
    <li><strong>Residual</strong> (section 06 explains why): new hot = old hot + output = <strong>[0.711, 0, 1.144, 0.193]</strong>. Its cosine with spicy [1, 0, 1, 0] is 1.855 / (1.414 × 1.361) = <strong>0.964</strong>; with warm, 0.595.</li>
  </ol>
<div class="fx" data-lang="py">W_Q = np.zeros((4, 4)); W_Q[2] = [4, 4, 0, 0]       # heat -&gt; "looking for food or drink"
W_K = np.diag([1.0, 1, 0, 0])                         # keys expose food / drink only
W_V = np.eye(4)                                       # values = the embeddings themselves

def attention(Q, K, V, mask=None):
    S = Q @ K.T / np.sqrt(K.shape[-1])
    if mask is not None:
        S = np.where(mask, S, -np.inf)                # blocked positions -&gt; weight 0 (section 10)
    A = softmax(S)
    return A @ V, A

for name, X in [("R3 curry", X3), ("R4 chai ", X4)]:
    out, A = attention(X @ W_Q, X @ W_K, X @ W_V)
    new_hot = X[3] + out[3]                            # residual: keep the original, add context
    print(f"{name}: weights {A[3]}  new hot {new_hot}  "
          f"cos spicy {cos(new_hot, spicy):.3f}  cos warm {cos(new_hot, warm):.3f}")</div>
  <div class="fx" data-lang="text">R3 curry: weights [0.711 0.096 0.096 0.096]  new hot [0.711 0.    1.144 0.193]  cos spicy 0.964  cos warm 0.595
R4 chai : weights [0.711 0.096 0.096 0.096]  new hot [0.    0.711 1.144 0.193]  cos spicy 0.595  cos warm 0.964</div>
  <p>The function <code>attention</code> is the formula, line for line; its <code>mask</code> argument is used in section 10. The loop runs both reviews with the <em>same</em> weights. In R3 "hot" puts 0.711 on "curry" and ends up 0.964 similar to spicy; in R4 it puts 0.711 on "chai" and ends up 0.964 similar to warm. One set of weights, two meanings: that is the context problem solved for this toy. A trained model finds such matrices by gradient descent, in hundreds of dimensions, for thousands of patterns at once.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="tf-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="50" width="120" height="36" rx="5" class="fb sb"/><text x="70" y="73" text-anchor="middle">Q of "hot"</text>
    <text x="70" y="108" text-anchor="middle" class="tm">"food or drink?"</text>
    <rect x="210" y="10" width="110" height="30" rx="5" class="fs"/><text x="265" y="30" text-anchor="middle">K "curry"</text>
    <rect x="210" y="60" width="110" height="30" rx="5" class="fs"/><text x="265" y="80" text-anchor="middle">K "was"</text>
    <rect x="210" y="110" width="110" height="30" rx="5" class="fs"/><text x="265" y="130" text-anchor="middle">K "too"</text>
    <line x1="132" y1="60" x2="206" y2="27" class="sr" stroke-width="4" marker-end="url(#tf-ah3)"/>
    <line x1="132" y1="70" x2="206" y2="75" class="sb" stroke-width="1" opacity="0.5" marker-end="url(#tf-ah3)"/>
    <line x1="132" y1="80" x2="206" y2="122" class="sb" stroke-width="1" opacity="0.5" marker-end="url(#tf-ah3)"/>
    <text x="340" y="30" class="tr">score 4 → weight 0.711</text>
    <text x="340" y="80" class="tm">score 0 → weight 0.096</text>
    <text x="340" y="130" class="tm">score 0 → weight 0.096</text>
    </svg><figcaption>The query of "hot" is matched against every key (its own key, also 0, is not drawn). Learned projections make "curry" easy to find for exactly the question "hot" asks.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy: the library</span>
    <p>Your question is the query. Each spine title is a key. You read the best-matching books (values), and your understanding is a blend weighted by how well each title matched. Separate titles and contents let a book be easy to find by one thing and hand over something richer.</p>
  </div>
  <h3>Why divide by √d<sub>k</sub></h3>
  <p>A dot product adds up d<sub>k</sub> products, so with random vectors its spread grows like √d<sub>k</sub>. Large scores push softmax to put almost all weight on one token (<strong>saturation</strong>), where its gradient is nearly zero and attention stops learning. Dividing by √d<sub>k</sub> brings the spread back to about 1:</p>
<div class="fx" data-lang="py">rng = np.random.default_rng(0)
for d_k in [4, 64, 512]:
    q, K = rng.normal(size=d_k), rng.normal(size=(5, d_k))
    raw = K @ q
    print(f"d_k={d_k:3d}  std of scores {raw.std():5.1f}   max softmax weight: raw {softmax(raw).max():.2f}"
          f"  scaled {softmax(raw / np.sqrt(d_k)).max():.2f}")</div>
  <div class="fx" data-lang="text">d_k=  4  std of scores   0.7   max softmax weight: raw 0.43  scaled 0.31
d_k= 64  std of scores   7.8   max softmax weight: raw 1.00  scaled 0.51
d_k=512  std of scores  20.9   max softmax weight: raw 1.00  scaled 0.51</div>
  <p>One query against five random keys per width. At d<sub>k</sub> = 64 the unscaled softmax already gives one key essentially all the weight; scaled, the largest weight is about a half, a real mix. Our toy used d<sub>k</sub> = 4, where the scale is just ÷ 2.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Scaled dot-product attention</strong>: softmax(QKᵀ/√d<sub>k</sub>)V with Q = XW<sub>Q</sub>, K = XW<sub>K</sub>, V = XW<sub>V</sub>. Shapes for n tokens: Q, K n × d<sub>k</sub>; V n × d<sub>v</sub>; scores n × n; output n × d<sub>v</sub>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Scale by √d<sub>k</sub> of one head, not d<sub>model</sub> and not d<sub>k</sub> itself. Dividing by d<sub>k</sub> over-flattens attention; forgetting the scale saturates it. Neither crashes.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Multi-head attention.</b> Our W<sub>Q</sub> asks one question: "which food or drink?". "hot" also wants to know how strong ("too hot" vs "hot"), and a real word needs many relations at once. One softmax gives one weighting per word. How do we ask several questions in parallel?</div>

  <h2 id="tf-mha"><span class="num">04</span>Multi-Head Attention</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>One attention pattern averages all relations into one set of weights. "hot" should find the dish <em>and</em> the intensifier "too" at the same time, without one question drowning the other. Can we run several smaller attentions side by side for the same cost?</p>
  </div>
  <p>Split the d<sub>model</sub> columns of Q, K, V into h slices; each slice is a <strong>head</strong> with its own attention; concatenate the h outputs and mix them with one more learned matrix W<sub>O</sub>. With d<sub>model</sub> = 4 and h = 2, each head is 2 wide and scales by √2.</p>
  <div class="flow"><span>Q, K, V (4 × 4)</span><span>split → 2 heads × (4 × 2)</span><span>attention per head</span><span>concat → (4 × 4)</span><span>× W<sub>O</sub></span></div>
  <p>Our two hand-made heads. Head 1 (columns 0–1) is the dish-finder from section 03, with query row [3, 3] for heat and keys from the food and drink dimensions. Head 2 (columns 2–3) is a modifier-finder: the heat dimension queries [0, 3] and keys come from the filler dimension, so "hot" looks at "was" and "too".</p>
<div class="fx" data-lang="py">W_Q2 = np.zeros((4, 4)); W_Q2[2] = [3, 3, 0, 3]         # heat asks two questions
W_K2 = np.zeros((4, 4)); W_K2[0, 0] = W_K2[1, 1] = 1      # head 1 keys: food, drink
W_K2[3, 3] = 1                                             # head 2 keys: filler words
W_V2, W_O = np.eye(4), np.eye(4)

def multi_head(X, W_Q, W_K, W_V, W_O, h):
    n, d = X.shape; dh = d // h
    Q, K, V = X @ W_Q, X @ W_K, X @ W_V
    split = lambda M: M.reshape(n, h, dh).transpose(1, 0, 2)    # (n, d) -&gt; (h, n, dh)
    Qh, Kh, Vh = split(Q), split(K), split(V)
    outs, weights = zip(*[attention(Qh[i], Kh[i], Vh[i]) for i in range(h)])
    concat = np.stack(outs).transpose(1, 0, 2).reshape(n, d)    # (h, n, dh) -&gt; (n, d)
    return concat @ W_O, weights

Y, Ws = multi_head(X3, W_Q2, W_K2, W_V2, W_O, h=2)
print("head 1, 'hot' attends (curry, was, too, hot):", Ws[0][3])
print("head 2, 'hot' attends (curry, was, too, hot):", Ws[1][3])
print("shapes: X", X3.shape, "-&gt; per head", (2, 4, 2), "-&gt; output", Y.shape)
d = 512
print("params, d=512: 1 head", 4 * d * d + 4 * d, "| 8 heads", 4 * d * d + 4 * d)</div>
  <div class="fx" data-lang="text">head 1, 'hot' attends (curry, was, too, hot): [0.735 0.088 0.088 0.088]
head 2, 'hot' attends (curry, was, too, hot): [0.054 0.446 0.446 0.054]
shapes: X (4, 4) -&gt; per head (2, 4, 2) -&gt; output (4, 4)
params, d=512: 1 head 1050624 | 8 heads 1050624</div>
  <p><code>split</code> reshapes the (4, 4) matrices into (2 heads, 4 tokens, 2 columns); each head runs the same <code>attention</code> function on its slice; the outputs are glued back to (4, 4) and multiplied by W<sub>O</sub>. Head 1 still sends most of "hot"'s weight to "curry"; head 2 splits it between "was" and "too", ignoring "curry". Two relations, one layer. The parameter count is the same for 1 or 8 heads: W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>, W<sub>O</sub> are each d × d (plus biases) however you slice them, and the work is about the same too.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Eight people check an order slip, each looking for one thing (dish, size, spice level, address), then pool their notes. One person checking all eight things does each one worse.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Multi-head attention</strong>: MHA(X) = Concat(head<sub>1</sub>, …, head<sub>h</sub>) W<sub>O</sub>, head<sub>i</sub> = Attention(XW<sub>Q</sub><sup>(i)</sup>, XW<sub>K</sub><sup>(i)</sup>, XW<sub>V</sub><sup>(i)</sup>), each head d<sub>model</sub>/h wide. Parameters 4d² + 4d for any h.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>d<sub>model</sub> must be divisible by the number of heads (PyTorch raises an error otherwise), and heads are not guaranteed to learn tidy, human-readable roles like ours; many learn overlapping or positional patterns.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Positional encodings.</b> Swap the words of R3 into "hot too was curry". Nothing in Q, K, V or the heads knows where a word is, so does the output even change?</div>

  <h2 id="tf-pos"><span class="num">05</span>Positional Encodings</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"curry was too hot" and "hot too was curry" (or "not too spicy" and "too spicy, not good") use the same words in a different order. Attention compares every pair regardless of position. Can it tell them apart at all?</p>
  </div>
<div class="fx" data-lang="py">perm = [3, 2, 1, 0]                                   # "hot too was curry"
out_a, _ = attention(X3 @ W_Q, X3 @ W_K, X3 @ W_V)
out_b, _ = attention(X3[perm] @ W_Q, X3[perm] @ W_K, X3[perm] @ W_V)
print("shuffled output == shuffled original output:", np.allclose(out_b, out_a[perm]))</div>
  <div class="fx" data-lang="text">shuffled output == shuffled original output: True</div>
  <p>Reverse the rows, run attention, and the output rows are exactly the original output rows, reversed. Attention is <strong>permutation-equivariant</strong>: it treats the sentence as a set. Order must be written into the vectors before attention sees them.</p>
  <h3>Sinusoidal encoding (the original)</h3>
  <p>Add to each token's embedding a position vector of the same width, made of sine and cosine waves of different speeds: PE(p, 2i) = sin(p / 10000<sup>2i/d</sup>), PE(p, 2i+1) = cos(p / 10000<sup>2i/d</sup>). By hand for d = 4 at position 1: sin(1) = 0.841, cos(1) = 0.540, sin(1/100) = 0.010, cos(1/100) = 1.000.</p>
<div class="fx" data-lang="py">def pos_enc(n, d):
    P = np.zeros((n, d)); p = np.arange(n)[:, None]
    freq = 1 / 10000 ** (np.arange(0, d, 2) / d)       # one speed per sin/cos pair
    P[:, 0::2], P[:, 1::2] = np.sin(p * freq), np.cos(p * freq)
    return P

PE = pos_enc(4, 4)
print(PE)
Xp = X3 + PE                                           # words in order, positions added
Xr = X3[perm] + PE                                     # words reversed, positions still 0, 1, 2, 3
hot_in_order, _ = attention(Xp @ W_Q, Xp @ W_K, Xp @ W_V)
hot_reversed, _ = attention(Xr @ W_Q, Xr @ W_K, Xr @ W_V)
print("no PE:   'hot' output same in both orders:", np.allclose(out_a[3], out_b[0]))
print("with PE: 'hot' output same in both orders:", np.allclose(hot_in_order[3], hot_reversed[0]))</div>
  <div class="fx" data-lang="text">[[ 0.     1.     0.     1.   ]
 [ 0.841  0.54   0.01   1.   ]
 [ 0.909 -0.416  0.02   1.   ]
 [ 0.141 -0.99   0.03   1.   ]]
no PE:   'hot' output same in both orders: True
with PE: 'hot' output same in both orders: False</div>
  <p>Row p of <code>PE</code> is the vector added at position p: values stay between −1 and 1, and every position has its own pattern (the first pair changes fast, the second slowly, like the seconds and hours hands of a clock). <code>Xr</code> is the reversed sentence with position vectors added in reading order, so "hot" now sits at position 0 and carries position 0's vector. Without positions, "hot" gets exactly the same output in both orders; with positions it does not: order matters again.</p>
  <h3>Learned positions and RoPE</h3>
  <ul>
    <li><strong>Learned</strong> (BERT, GPT-2): a second embedding table, one trainable row per position up to a maximum length (512 for BERT). Simple; cannot go beyond the trained length.</li>
    <li><strong>RoPE</strong> (rotary, used by Llama and most modern LLMs): instead of adding a vector, rotate each 2-number pair of q and k by an angle proportional to the position. A rotation by angle mθ dotted with a rotation by nθ depends only on (m − n)θ, so attention scores depend on <em>relative</em> distance.</li>
  </ul>
<div class="fx" data-lang="py">def rope(x, pos, theta=0.5):                     # rotate one 2-number pair by pos * theta
    c, s = np.cos(pos * theta), np.sin(pos * theta)
    return np.array([x[0] * c - x[1] * s, x[0] * s + x[1] * c])

q, k = np.array([1.0, 2.0]), np.array([0.5, -1.0])
for m, n in [(1, 3), (5, 7), (10, 12), (1, 4)]:
    print(f"query at {m:2d}, key at {n:2d} (distance {n - m}): score {rope(q, m) @ rope(k, n):.4f}")</div>
  <div class="fx" data-lang="text">query at  1, key at  3 (distance 2): score 0.8725
query at  5, key at  7 (distance 2): score 0.8725
query at 10, key at 12 (distance 2): score 0.8725
query at  1, key at  4 (distance 3): score 1.8889</div>
  <p>The same query and key placed at positions (1, 3), (5, 7) and (10, 12) give the same score, because only the distance (2) matters; at distance 3 the score changes. That is why RoPE models handle relative patterns ("the word two before me") naturally, and why context-extension tricks work by adjusting θ.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Sinusoidal and learned encodings stamp each word with its seat number. RoPE turns each word by an angle that depends on its seat, so two words compare by how far apart they sit, like two hands on a clock that keep the same angle between them as the clock runs.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Positional encoding</strong>: information about token position injected into the model, by adding a position vector to the embedding (sinusoidal, learned) or by rotating queries and keys (RoPE). Needed because attention is permutation-equivariant.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Why not just add the number 5 at position 5? Embedding values are around ±1; a raw 5 (or 500) would swamp the meaning. Sinusoids stay in [−1, 1], so the position vector must also be the same width as the embedding to be added element by element.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Residual connections and LayerNorm.</b> One attention layer plus positions works on our toy. Real models stack 12 to 100+ layers so later layers can refine earlier ones. What goes wrong when you stack many layers, and how is it fixed?</div>

  <h2 id="tf-norm"><span class="num">06</span>Residual Connections &amp; LayerNorm</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>BERT-base stacks 12 layers, large LLMs around 100. Training sends an error signal backwards through every layer, and activations pass forwards through every layer. What happens to both over 48 layers, and what two small additions keep them healthy?</p>
  </div>
  <p>Two fixes, already used in section 03 without explanation:</p>
  <ul>
    <li><strong>Residual connection</strong>: a sub-layer's output is <em>added</em> to its input, x + f(x), instead of replacing it. The new "hot" was old hot + attention output.</li>
    <li><strong>Layer normalisation</strong>: before each sub-layer, rescale every token vector to mean 0 and spread 1 (then a learned scale γ and shift β).</li>
  </ul>
  <p>Why, shown. A stack of small tanh layers (width 16), with and without the residual "+ x", and with LayerNorm in front of each layer ("pre-norm", as in modern LLMs). We measure the size of the gradient that reaches the input:</p>
<div class="fx" data-lang="py">import torch, torch.nn as nn
torch.set_num_threads(1)

def input_grad(depth, residual, norm=False, d=16):
    torch.manual_seed(0)
    layers = [nn.Linear(d, d) for _ in range(depth)]
    lns = [nn.LayerNorm(d) for _ in range(depth)]
    x = torch.randn(4, d, requires_grad=True); h = x
    for lin, ln in zip(layers, lns):
        f = torch.tanh(lin(ln(h) if norm else h))
        h = h + f if residual else f                   # the "+ x" or not
    h.sum().backward()
    return x.grad.norm().item()

print("depth  plain      residual   residual+LN")
for depth in (6, 24, 48):
    print(f"{depth:5d}  {input_grad(depth, False):.1e}   {input_grad(depth, True):.1e}    {input_grad(depth, True, True):.1e}")</div>
  <div class="fx" data-lang="text">depth  plain      residual   residual+LN
    6  1.2e-01   1.1e+01    1.1e+01
   24  4.0e-06   4.9e+01    2.7e+01
   48  6.0e-13   1.4e+02    4.9e+01</div>
  <p>Without residuals the gradient at the input shrinks from about 0.1 at 6 layers to about 10⁻⁶ at 24 and 10⁻¹³ at 48: each layer multiplies the signal by a factor below 1, and the first layers would never learn. With "+ x" the derivative of x + f(x) is 1 + f'(x), so there is always a direct path of 1 for the signal: it no longer vanishes. Residuals are the same skip connections that made very deep ResNets trainable.</p>
<div class="fx" data-lang="py">def stream_std(depth, norm, d=16):
    torch.manual_seed(0); h = torch.randn(4, d); out = []
    for i in range(depth):
        lin = nn.Linear(d, d)
        with torch.no_grad():
            inp = nn.functional.layer_norm(h, (d,)) if norm else h
            h = h + 2 * lin(inp)                      # a sub-layer whose output scales with its input
        out.append(h.std().item())
    return [round(out[i], 1) for i in (0, 5, 11, 23, 47)]
print("std after layers 1, 6, 12, 24, 48 - no norm :", stream_std(48, False))
print("std after layers 1, 6, 12, 24, 48 - pre-norm:", stream_std(48, True))</div>
  <div class="fx" data-lang="text">std after layers 1, 6, 12, 24, 48 - no norm : [1.6, 14.9, 128.3, 13917.5, 335071584.0]
std after layers 1, 6, 12, 24, 48 - pre-norm: [1.6, 3.3, 4.6, 6.5, 7.8]</div>
  <p>The second experiment watches the forward pass. Residuals keep adding to the same running vector (the <strong>residual stream</strong>). If each sub-layer's output grows with its input, the stream explodes: a spread of about 3 × 10⁸ after 48 layers. Normalising the input of each sub-layer caps what it can add, and the stream grows only slowly. Large, unstable activations are exactly what made early deep Transformers diverge.</p>
  <h3>LayerNorm by hand on the new "hot"</h3>
  <p>Take the new "hot" from section 03, x = [0.711, 0, 1.144, 0.193]. Mean = 2.048 / 4 = 0.512. Deviations: 0.199, −0.512, 0.632, −0.319. Variance = mean of squares = (0.040 + 0.262 + 0.400 + 0.102) / 4 = 0.201; standard deviation 0.448. Normalised: <strong>[0.44, −1.14, 1.41, −0.71]</strong> (with γ = 1, β = 0).</p>
<div class="fx" data-lang="py">x = np.array([0.711, 0.0, 1.144, 0.193])
mu, var = x.mean(), x.var()
print("mean %.3f  var %.3f" % (mu, var), "-&gt;", (x - mu) / np.sqrt(var + 1e-5))
print("torch LayerNorm:", nn.LayerNorm(4)(torch.tensor(x, dtype=torch.float32)).detach().numpy().round(2))</div>
  <div class="fx" data-lang="text">mean 0.512  var 0.201 -&gt; [ 0.444 -1.143  1.411 -0.712]
torch LayerNorm: [ 0.44 -1.14  1.41 -0.71]</div>
  <p>NumPy and PyTorch agree (PyTorch adds ε = 10⁻⁵ inside the square root for safety and starts with γ = 1, β = 0). LayerNorm normalises across the features of <em>one</em> token, so it works the same for any batch size or sentence length, unlike BatchNorm, which averages over the batch.</p>
  <table class="tbl">
    <tr><th>What</th><th>Why</th><th>Where</th></tr>
    <tr><td>Rescale each token vector to mean 0, variance 1, then γ·x + β</td><td>Stops activations drifting huge or tiny over many layers</td><td>Original 2017: after each sub-layer (post-norm). Modern LLMs: before it (<strong>pre-norm</strong>). RMSNorm skips the mean, cheaper</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy: editors</span>
    <p>Without residuals, 48 editors each rewrite the menu from scratch; by editor 20 the original is gone. With residuals, each editor only adds margin notes, and the original stays underneath. LayerNorm is the rule that every note is written at the same font size, so no editor can shout over the rest.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Residual connection</strong>: y = x + f(x). <strong>LayerNorm</strong>: LN(x) = γ ⊙ (x − μ)/√(σ² + ε) + β, with μ, σ² the mean and variance over the d features of one token. <strong>Pre-norm block</strong>: x + f(LN(x)).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Residuals require the sub-layer output to have the same shape as its input (n × d<sub>model</sub>), which is why attention's output projection W<sub>O</sub> and the FFN's second matrix map back to d<sub>model</sub>. A shape mismatch here is the most common error when writing a block by hand.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The feed-forward network.</b> Attention only <em>averages</em> value vectors; mixing is linear in the values. Where does each token get transformed non-linearly, for example to turn "heat + food" into a cleaner "spicy" feature?</div>

  <h2 id="tf-ffn"><span class="num">07</span>Feed-Forward Network</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>After attention, "hot" in R3 holds a mix of heat and curry. Turning that mix into a new feature ("this is a chilli complaint") needs a non-linear function of the token's own numbers. Attention can't do that; what can?</p>
  </div>
  <p>Each block has a small two-layer network applied to every token separately, with the same weights for every position: widen d → 4d, apply a non-linearity (GELU, a smooth ReLU; SwiGLU in Llama-style models), shrink 4d → d.</p>
  <div class="flow"><span>token (d)</span><span>× W₁ + b₁ → 4d</span><span>GELU</span><span>× W₂ + b₂ → d</span></div>
<div class="fx" data-lang="py">torch.manual_seed(0)
ffn = nn.Sequential(nn.Linear(4, 16), nn.GELU(), nn.Linear(16, 4))
H = torch.tensor(X3 + PE, dtype=torch.float32)                 # 4 tokens x 4
out_all = ffn(H)
H2 = H.clone(); H2[0] = 0                                       # change token 1 only
print("FFN output shape:", tuple(out_all.shape))
print("token 4 unchanged when token 1 changes:", torch.allclose(ffn(H2)[3], out_all[3]))
print("params: FFN", sum(p.numel() for p in ffn.parameters()),
      "| attention (4d^2+4d)", 4 * 4 * 4 + 4 * 4)
d = 768
print("BERT-base layer: attention", 4 * d * d + 4 * d, " FFN", 2 * d * 4 * d + 4 * d + d)</div>
  <div class="fx" data-lang="text">FFN output shape: (4, 4)
token 4 unchanged when token 1 changes: True
params: FFN 148 | attention (4d^2+4d) 80
BERT-base layer: attention 2362368  FFN 4722432</div>
  <p><code>nn.Sequential</code> chains the three steps. Changing token 1 leaves token 4's FFN output identical: the FFN never mixes tokens (attention does that). For our toy (d = 4) the FFN has 148 weights against attention's 80; at BERT-base width (d = 768) one layer has 2.36 million attention weights and 4.72 million FFN weights, so about two-thirds of a Transformer's parameters are FFN. Probing studies find that much factual association ("paneer is vegetarian") is stored there.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Attention is the kitchen meeting where everyone shares information; the FFN is each cook going back to their own station and doing their own processing with what they heard.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Position-wise feed-forward network</strong>: FFN(x) = W₂ · GELU(W₁x + b₁) + b₂, applied identically and independently to each token, inner width usually 4 · d<sub>model</sub>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Attention is all you need" is not literally true: removing the FFN removes most parameters and the non-linearity; stacks of attention alone collapse towards uniform, averaged token vectors.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The full block.</b> We now have every part: attention with heads, positions, residuals, LayerNorm, FFN. In what order do they go, what shape is everything at each step, and does our hand-built version match a real library?</div>

  <h2 id="tf-block"><span class="num">08</span>The Full Block, Traced with Shapes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Feed R4 "chai was too hot" (4 tokens, d<sub>model</sub> = 4, 2 heads, FFN width 16) through one complete Transformer block. What is the shape after every operation, and can we reproduce PyTorch's own layer exactly with NumPy?</p>
  </div>
<figure class="viz"><svg viewBox="0 0 640 140" width="640">
    <defs><marker id="tf-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="35" y="99" text-anchor="middle">x</text>
    <rect x="70" y="80" width="50" height="30" rx="5" class="fs"/><text x="95" y="99" text-anchor="middle">LN</text>
    <rect x="140" y="80" width="90" height="30" rx="5" class="fb sb"/><text x="185" y="99" text-anchor="middle">MHA</text>
    <circle cx="255" cy="95" r="12" fill="none" stroke="currentColor"/><text x="255" y="99" text-anchor="middle">+</text>
    <rect x="300" y="80" width="50" height="30" rx="5" class="fs"/><text x="325" y="99" text-anchor="middle">LN</text>
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
    </svg><figcaption>Pre-norm block: each sub-layer adds a correction to x. Shape in (4 × 4) = shape out, so blocks stack.</figcaption></figure>
  <p>The input is the embeddings plus sinusoidal positions. PyTorch's <code>nn.TransformerEncoderLayer</code> with <code>norm_first=True</code> is exactly this pre-norm block; we initialise it randomly (seed 0), copy its weights into NumPy and redo every step by hand:</p>
<div class="fx" data-lang="py">torch.manual_seed(0)
layer = nn.TransformerEncoderLayer(d_model=4, nhead=2, dim_feedforward=16, dropout=0.0,
                                   activation="gelu", batch_first=True, norm_first=True).eval()
P = {k: v.detach().numpy().astype(np.float64) for k, v in layer.state_dict().items()}
from math import erf, sqrt
gelu = np.vectorize(lambda z: 0.5 * z * (1 + erf(z / sqrt(2))))

def layer_norm(x, g, b):
    mu = x.mean(-1, keepdims=True); var = x.var(-1, keepdims=True)
    return (x - mu) / np.sqrt(var + 1e-5) * g + b

x = X4 + PE                                                          # (4, 4) embeddings + positions
print("x            ", x.shape)
h = layer_norm(x, P["norm1.weight"], P["norm1.bias"]);              print("LN1          ", h.shape)
qkv = h @ P["self_attn.in_proj_weight"].T + P["self_attn.in_proj_bias"]; print("Q|K|V packed ", qkv.shape)
Q, K, V = np.split(qkv, 3, axis=1);                                  print("Q, K, V      ", Q.shape)
heads = []
for i in range(2):                                                   # 2 heads, 2 columns each
    s = slice(2 * i, 2 * i + 2)
    o, A = attention(Q[:, s], K[:, s], V[:, s])
    heads.append(o); print(f"head {i+1} scores", A.shape, "-&gt; out", o.shape)
mha = np.concatenate(heads, 1) @ P["self_attn.out_proj.weight"].T + P["self_attn.out_proj.bias"]
x1 = x + mha;                                                        print("x + MHA      ", x1.shape)
f = gelu(layer_norm(x1, P["norm2.weight"], P["norm2.bias"]) @ P["linear1.weight"].T + P["linear1.bias"])
print("FFN hidden   ", f.shape)
y = x1 + f @ P["linear2.weight"].T + P["linear2.bias"];             print("x + FFN (out)", y.shape)
y_torch = layer(torch.tensor(x, dtype=torch.float32)[None])[0].detach().numpy()
print("matches PyTorch:", np.allclose(y, y_torch, atol=1e-5))
print("output for 'hot':", y[3].round(3))</div>
  <div class="fx" data-lang="text">x             (4, 4)
LN1           (4, 4)
Q|K|V packed  (4, 12)
Q, K, V       (4, 4)
head 1 scores (4, 4) -&gt; out (4, 2)
head 2 scores (4, 4) -&gt; out (4, 2)
x + MHA       (4, 4)
FFN hidden    (4, 16)
x + FFN (out) (4, 4)
matches PyTorch: True
output for 'hot': [-0.079 -1.101  1.101  1.279]</div>
  <p>Read the printout as the shape trace: (4, 4) after LayerNorm; the packed projection gives (4, 12), split into Q, K, V of (4, 4); each head sees 2 columns and makes a 4 × 4 score table (the n² part); concatenating the heads and applying W<sub>O</sub> returns to (4, 4); adding x keeps it; the FFN goes up to (4, 16) and back; the output is (4, 4). PyTorch stores the three projection matrices stacked as <code>in_proj_weight</code> (12 × 4) and multiplies by its transpose, hence <code>.T</code>. The final check, <code>matches PyTorch: True</code>, means our NumPy formulas are the real layer, not an approximation.</p>
  <h3>Stacking blocks: counting BERT-base</h3>
<div class="fx" data-lang="py">d, L, ff, vocab, max_pos = 768, 12, 3072, 30522, 512
per_layer = (4 * d * d + 4 * d) + (d * ff + ff + ff * d + d) + 2 * (2 * d)   # MHA + FFN + 2 LayerNorms
emb = vocab * d + max_pos * d + 2 * d + 2 * d                                  # tokens, positions, segments, LN
print(f"per layer {per_layer:,}  x {L} = {L * per_layer:,}  + embeddings {emb:,}  = {L * per_layer + emb:,}")</div>
  <div class="fx" data-lang="text">per layer 7,087,872  x 12 = 85,054,464  + embeddings 23,837,184  = 108,891,648</div>
  <p>Twelve identical blocks of 7.09 million weights plus about 23.8 million in the embedding tables give 108.9 million; BERT's small pooler layer (768 × 768 + 768 ≈ 0.6 million) brings it to the 109.5 million usually rounded to "110M". Every block keeps the n × d shape, which is what lets them stack freely; early layers tend to capture local and grammatical patterns, later ones more task-level meaning.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Transformer block (pre-norm)</strong>: x ← x + MHA(LN(x)); x ← x + FFN(LN(x)). A Transformer is N such blocks between an input embedding (+ positions) and a task-specific output layer.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>nn.TransformerEncoderLayer</code> defaults to <code>norm_first=False</code> (post-norm, the 2017 layout) and <code>batch_first=False</code> (input shape (seq, batch, d)). Forgetting either gives silently different behaviour or transposed shapes.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Encoder, decoder, both.</b> One block mixes all tokens with all tokens. Classifying R4 needs exactly that; but a model that <em>writes</em> a review word by word must not use words it has not written yet, and a translator must read one sentence and write another. How are blocks wired for each job?</div>

  <h2 id="tf-arch"><span class="num">09</span>Encoder, Decoder, Encoder–Decoder</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful has three jobs: route a complaint (read R4 and label it), write a reply (generate text), and translate R4 into Hindi for a local kitchen. Do these need different machines, or the same block wired differently?</p>
  </div>
  <p>The same block, wired by one question: <strong>may a token look at tokens after it?</strong></p>
  <div class="cards">
    <div><b>Encoder-only</b><p>Bidirectional: every token sees every token. Outputs a contextual vector per token; add a small head for the task.</p><small>BERT, RoBERTa: route R4, tag dish names, sentence embeddings for search</small></div>
    <div><b>Decoder-only</b><p>Causal: each token sees only itself and earlier tokens. Generates one token at a time.</p><small>GPT, Llama, Claude: write the reply, and nearly any task via prompting</small></div>
    <div><b>Encoder–decoder</b><p>The encoder reads the source; the decoder writes the target, consulting the encoder through cross-attention.</p><small>T5, BART, the 2017 original: translate R4, summarise reviews</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Encoder = a manager reading the whole complaint before deciding who handles it. Decoder = a writer composing the reply left to right, unable to see words not yet written. Encoder–decoder = a translator who reads the source fully, then writes while glancing back at it.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Encoder (BERT)</th><th>Decoder (GPT)</th><th>Encoder–decoder (T5)</th></tr>
    <tr><td>Attention</td><td>self, bidirectional</td><td>self, causal (section 10)</td><td>encoder: bidirectional; decoder: causal + cross (section 11)</td></tr>
    <tr><td>Sub-layers per block</td><td>MHA, FFN</td><td>masked MHA, FFN</td><td>decoder: masked MHA, cross-attention, FFN</td></tr>
    <tr><td>Pretraining (section 12)</td><td>masked LM</td><td>next token</td><td>span corruption (fill masked spans)</td></tr>
    <tr><td>Output</td><td>a vector per input token</td><td>next-token probabilities</td><td>a target sequence</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Encoder</strong>: stack of blocks with unmasked self-attention. <strong>Decoder</strong>: blocks with causally masked self-attention (plus cross-attention when paired with an encoder). <strong>Encoder–decoder (seq2seq)</strong>: encoder output feeds every decoder block's cross-attention.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"BERT is obsolete" is wrong. Small encoders still power embeddings, rerankers and classifiers in production at a fraction of an LLM's cost; the vector search in <a class="xref" data-note="vectordb">Vector DBs</a> runs on them.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Masked (causal) attention.</b> "A decoder sees only earlier tokens" is a rule. Self-attention as written lets every token see every token. What exactly changes in the computation?</div>

  <h2 id="tf-mask"><span class="num">10</span>Masked (Causal) Attention</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A decoder learns to write reviews by predicting each next word of "chai was too hot". If position 3 ("too") could attend to position 4 ("hot") while learning to predict "hot", it would just copy it. How do we forbid looking ahead without changing the rest of attention?</p>
  </div>
  <p>Before softmax, set every score that points to a later position to −∞. Since e<sup>−∞</sup> = 0, those positions get weight exactly 0 and softmax spreads the whole 1 over the allowed ones. The allowed pattern is the lower triangle:</p>
  <table class="tbl">
    <tr><th>query ↓ / key →</th><th>chai</th><th>was</th><th>too</th><th>hot</th></tr>
    <tr><td>chai</td><td>✓</td><td>✗</td><td>✗</td><td>✗</td></tr>
    <tr><td>was</td><td>✓</td><td>✓</td><td>✗</td><td>✗</td></tr>
    <tr><td>too</td><td>✓</td><td>✓</td><td>✓</td><td>✗</td></tr>
    <tr><td>hot</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
  </table>
  <p>By hand with our section-03 weights on R4. Only "hot" (and "too", half as strongly) has a non-zero query; "chai" and "was" have query 0, so all their allowed scores are 0 and they spread weight evenly over what they may see. Row "chai": only itself allowed → <strong>[1, 0, 0, 0]</strong>. Row "was": two allowed scores of 0 → <strong>[0.5, 0.5, 0, 0]</strong>. Row "hot": nothing is blocked, so it is unchanged, [0.711, 0.096, 0.096, 0.096].</p>
<div class="fx" data-lang="py">causal = np.tril(np.ones((4, 4), dtype=bool))             # True = allowed (lower triangle)
_, A_causal = attention(X4 @ W_Q, X4 @ W_K, X4 @ W_V, mask=causal)
_, A_full = attention(X4 @ W_Q, X4 @ W_K, X4 @ W_V)
print("causal weights (rows: chai, was, too, hot):\\n", A_causal)
print("rows sum to 1:", A_causal.sum(1))
zeroed = A_full * causal                                   # WRONG: mask after softmax
print("mask-after-softmax row sums:", zeroed.sum(1).round(3))</div>
  <div class="fx" data-lang="text">causal weights (rows: chai, was, too, hot):
 [[1.    0.    0.    0.   ]
 [0.5   0.5   0.    0.   ]
 [0.576 0.212 0.212 0.   ]
 [0.711 0.096 0.096 0.096]]
rows sum to 1: [1. 1. 1. 1.]
mask-after-softmax row sums: [0.25  0.5   0.825 1.   ]</div>
  <p><code>np.tril</code> builds the lower-triangular "allowed" matrix and <code>attention</code>'s <code>np.where(mask, S, -np.inf)</code> blocks the rest before softmax. The rows match the hand values and still sum to 1. The last line shows the classic bug: zeroing weights <em>after</em> softmax leaves rows that no longer sum to 1, so the outputs shrink for early positions.</p>
  <p>The mask also buys efficiency: one forward pass over "chai was too hot" trains four predictions at once (chai → was, chai was → too, chai was too → hot, and the next one), each row seeing only its own past. That is what makes decoder training parallel even though generation is sequential.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cricket commentator can talk about balls already bowled, never the next ball. The causal mask enforces exactly that during training, so the model learns the job it will actually do at generation time.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Causal (look-ahead) mask</strong>: M<sub>ij</sub> = −∞ if j &gt; i, else 0, added to the scores before softmax: softmax(QKᵀ/√d<sub>k</sub> + M)V. A <strong>padding mask</strong> does the same for filler tokens in a batch.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Mask conventions differ: in <code>nn.MultiheadAttention</code> a boolean True means <em>blocked</em>; in <code>F.scaled_dot_product_attention</code> True means <em>allowed</em> (our NumPy function uses "allowed" too). Print the weights on a 4-token example before trusting a mask.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Cross-attention.</b> A decoder can now write left to right using its own past. But a translator writing "chai bahut garam thi" must also read the English "chai was too hot", a different sequence. How does a decoder attend to another sentence?</div>

  <h2 id="tf-cross"><span class="num">11</span>Cross-Attention</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's Pune kitchen wants complaints in Hindi: R4 → "chai bahut garam thi" (chai was very hot). While writing "garam", the decoder must find the English word that means it. Its own past ("chai bahut") doesn't contain it. Where do the keys and values come from?</p>
  </div>
  <p><strong>Cross-attention</strong> splits the roles across two sequences: queries come from the decoder (the sentence being written), keys and values from the encoder's output (the sentence being read). Same formula, different sources; this is the original seq2seq attention of the <a class="xref" data-note="dl_attention">Attention note</a> in Transformer form.</p>
  <div class="flow"><span>decoder state of "garam": Q</span><span>encoder outputs of chai, was, too, hot: K, V</span><span>softmax(QKᵀ/√d)V</span></div>
<div class="fx" data-lang="py">enc_out = X4                                          # stand-in for the encoder's output on R4 (4 x 4)
dec_tokens = ["chai", "bahut", "garam", "thi"]
Q_dec = np.array([[0, 2.0, 0, 0],                     # chai  -&gt; looks for the drink
                  [0, 0, 1.0, 2.0],                   # bahut ("very") -&gt; looks for the intensifier
                  [0, 0, 3.0, 0],                     # garam ("hot") -&gt; looks for heat
                  [0, 0, 0, 2.0]])                    # thi ("was") -&gt; looks for filler / verb
out, A_cross = attention(Q_dec, enc_out, enc_out)
print("cross-attention weights, rows = Hindi, columns = chai, was, too, hot:\\n", A_cross)
print("shapes: Q", Q_dec.shape, "K, V", enc_out.shape, "-&gt; weights", A_cross.shape, "-&gt; out", out.shape)</div>
  <div class="fx" data-lang="text">cross-attention weights, rows = Hindi, columns = chai, was, too, hot:
 [[0.475 0.175 0.175 0.175]
 [0.113 0.307 0.394 0.186]
 [0.116 0.116 0.246 0.521]
 [0.134 0.366 0.366 0.134]]
shapes: Q (4, 4) K, V (4, 4) -&gt; weights (4, 4) -&gt; out (4, 4)</div>
  <p>The decoder's queries are hand-written to say what each Hindi word needs; keys and values are the English vectors. "garam" puts its largest weight on "hot" (key [0, 0, 1, 0] matches its heat query), "bahut" on "too", "chai" on "chai"; "thi" splits evenly between "was" and "too" because our toy's single filler dimension cannot tell them apart. The weight table is 4 Hindi rows × 4 English columns; with different lengths it would be target length × source length. In a real model the decoder block has three sub-layers: masked self-attention over the Hindi written so far, cross-attention over the English, and the FFN.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The translator writing in her notebook (decoder) keeps glancing at the original complaint (encoder output). What she glances <em>for</em> comes from what she is writing now (query); what she finds comes from the original (keys and values).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Cross-attention</strong>: Attention(Q = H<sub>dec</sub>W<sub>Q</sub>, K = H<sub>enc</sub>W<sub>K</sub>, V = H<sub>enc</sub>W<sub>V</sub>); weight shape target_len × source_len. Not causally masked: the whole source is known.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Decoder-only LLMs have no cross-attention: they "translate" by putting the source text in the prompt, so the same causal self-attention reads it. Cross-attention survives in encoder–decoder models and in multimodal models (text attending to image features).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Pretraining objectives.</b> The architecture is complete, but every weight so far was hand-set or random. Where do good W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> and FFN weights come from, with no labelled data at all?</div>

  <h2 id="tf-pretrain"><span class="num">12</span>Pretraining Objectives: MLM vs Next-Token</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Nobody labels billions of sentences. Like Word2Vec in the NLP note, a Transformer must invent its own task from raw text. Which task, and does training on it really give "hot" a different vector in R3 and R4?</p>
  </div>
  <p>Two tasks, matched to the two wirings:</p>
  <ul>
    <li><strong>Next-token prediction</strong> (decoders, GPT): at every position, predict the next token. From R4 with a start token: ⟨bos⟩ → chai, ⟨bos⟩ chai → was, … , chai was too → hot, chai was too hot → ⟨eos⟩. Five examples from one review, all in one masked forward pass.</li>
    <li><strong>Masked language modelling</strong> (encoders, BERT): hide about 15% of tokens and predict them from <em>both</em> sides: "chai was too [MASK]" → hot. Of the chosen tokens, 80% become [MASK], 10% a random token, 10% stay unchanged, so the model can't rely on seeing [MASK] at test time.</li>
  </ul>
  <p>Both use <strong>cross-entropy loss</strong>: −ln of the probability the model gave the correct token. If the model says p(hot) = 0.6 after "chai was too", the loss is −ln 0.6 = 0.511; p = 0.9 gives 0.105; p = 0.05 gives 3.0. Why can't an encoder use next-token prediction? Because it sees the whole sentence: predicting "hot" when "hot" is visible is trivial.</p>
  <h3>Train a tiny GPT on Biteful reviews</h3>
  <p>The same 4,000 synthetic template reviews as the NLP note (no pretrained model could be downloaded here), a 2-block decoder with d<sub>model</sub> = 32 and 2 heads, built from the block of section 08 with a causal mask, trained for 800 steps on one CPU thread.</p>
<div class="fx" data-lang="py">import random

def make_reviews(n=4000, seed=0):
    """Synthetic Biteful reviews built from templates (a stand-in for real customer reviews)."""
    r = random.Random(seed)
    pick = r.choice
    filling = ["paneer", "chicken", "veg", "egg"]
    wrap    = ["roll", "wrap", "kathi"]              # three words, one kind of dish
    curry   = ["curry", "biryani", "tikka", "masala"]
    drink   = ["chai", "coffee", "tea", "soup"]
    spicy   = ["spicy", "fiery", "hot"]              # "hot" = spicy here ...
    warm    = ["hot", "warm", "steaming"]            # ... and = temperature here
    mild    = ["mild", "light", "gentle"]
    cold    = ["cold", "lukewarm"]
    pos     = ["great", "good", "tasty", "delicious", "amazing"]
    neg     = ["bad", "awful", "terrible", "disappointing"]
    food = lambda: pick([f"{pick(filling)} {pick(wrap)}", pick(curry)])
    templates = [
        lambda: f"the {food()} was {pick(spicy)} and {pick(pos)}",
        lambda: f"{food()} was too {pick(spicy)} for me",
        lambda: f"the {food()} was {pick(mild)} and {pick(pos)}",
        lambda: f"{pick(pos)} {food()} , not too {pick(spicy)}",
        lambda: f"the {pick(drink)} was {pick(warm)} and {pick(pos)}",
        lambda: f"{pick(drink)} was too {pick(warm)} to drink",
        lambda: f"{pick(drink)} arrived {pick(cold)} , {pick(neg)}",
        lambda: f"{food()} arrived {pick(cold)} and {pick(neg)}",
        lambda: f"{pick(pos)} {pick(drink)} , will order again",
        lambda: f"{pick(neg)} {food()} , never again",
    ]
    return [pick(templates)().split() for _ in range(n)]

reviews = make_reviews()
print(len(reviews), "reviews, e.g.")
for s in reviews[:4]:
    print("  ", " ".join(s))</div>
  <div class="fx" data-lang="text">4000 reviews, e.g.
   soup arrived cold , terrible
   delicious soup , will order again
   the soup was warm and amazing
   amazing chicken wrap , not too hot</div>
<div class="fx" data-lang="py">import torch.nn.functional as F
torch.manual_seed(0)
vocab = ["&lt;bos&gt;", "&lt;eos&gt;", "&lt;mask&gt;"] + sorted({w for s in reviews for w in s})
stoi = {w: i for i, w in enumerate(vocab)}; V = len(vocab)
seqs = [[0] + [stoi[w] for w in s] + [1] for s in reviews]
L = max(map(len, seqs))
data = torch.full((len(seqs), L), -1, dtype=torch.long)            # -1 = padding
for i, s in enumerate(seqs):
    data[i, :len(s)] = torch.tensor(s)

class TinyTransformer(nn.Module):
    def __init__(self, V, causal, d=32, heads=2, layers=2, L=16):
        super().__init__()
        self.causal = causal
        self.tok, self.pos = nn.Embedding(V, d), nn.Embedding(L, d)   # learned positions
        block = nn.TransformerEncoderLayer(d, heads, 4 * d, dropout=0.0, batch_first=True,
                                           norm_first=True, activation="gelu")
        self.blocks = nn.TransformerEncoder(block, layers, enable_nested_tensor=False)
        self.norm, self.head = nn.LayerNorm(d), nn.Linear(d, V)
    def forward(self, x, hidden=False):
        n = x.shape[1]
        h = self.tok(x) + self.pos(torch.arange(n))
        mask = nn.Transformer.generate_square_subsequent_mask(n) if self.causal else None
        h = self.norm(self.blocks(h, mask=mask, is_causal=self.causal))
        return h if hidden else self.head(h)

gpt = TinyTransformer(V, causal=True)
opt = torch.optim.AdamW(gpt.parameters(), lr=3e-3)
for step in range(800):
    b = data[torch.randint(0, len(data), (64,))]
    x, y = b[:, :-1].clamp(min=0), b[:, 1:]                           # input = all but last, target = shifted by 1
    loss = F.cross_entropy(gpt(x).reshape(-1, V), y.reshape(-1), ignore_index=-1)
    opt.zero_grad(); loss.backward(); opt.step()
    if step % 200 == 0 or step == 799:
        print(f"step {step:3d}  next-token loss {loss.item():.3f}")
print("parameters:", sum(p.numel() for p in gpt.parameters()))</div>
  <div class="fx" data-lang="text">step   0  next-token loss 4.196
step 200  next-token loss 0.949
step 400  next-token loss 0.958
step 600  next-token loss 0.925
step 799  next-token loss 0.953
parameters: 29364</div>
  <p>The key line is <code>x, y = b[:, :-1], b[:, 1:]</code>: the target at every position is the input shifted by one, so every position is a training example. <code>ignore_index=-1</code> skips padding. The loss starts at 4.2, near ln 52 ≈ 3.95 (a uniform guess over the 52-token vocabulary), and settles a little below 1: the templates leave real uncertainty (which filling, which praise word), so it cannot reach 0.</p>
<div class="fx" data-lang="py">gpt.eval()
def next_word(model, text, k=3):
    ids = torch.tensor([[0] + [stoi[w] for w in text.split()]])
    with torch.no_grad():
        p = F.softmax(model(ids)[0, -1], -1)
    top = p.topk(k)
    return [(vocab[i], round(v.item(), 2)) for v, i in zip(top.values, top.indices)]
for prefix in ["curry was too", "chai was too", "paneer roll was too"]:
    print(f"{prefix!r:24} -&gt;", next_word(gpt, prefix))

def vec(model, text, word):                                     # contextual vector of \`word\` in \`text\`
    ids = torch.tensor([[0] + [stoi[w] for w in text.split()]])
    with torch.no_grad():
        return model(ids, hidden=True)[0, text.split().index(word) + 1]
csim = lambda a, b: F.cosine_similarity(a, b, dim=0).item()
hot3, hot4 = vec(gpt, "curry was too hot", "hot"), vec(gpt, "chai was too hot", "hot")
spicy3, warm4 = vec(gpt, "curry was too spicy", "spicy"), vec(gpt, "chai was too warm", "warm")
print("input embedding of 'hot' is one row:", tuple(gpt.tok.weight[stoi["hot"]].shape))
print(f"contextual hot: R3 vs R4 {csim(hot3, hot4):.3f}")
print(f"hot in R3 ~ spicy {csim(hot3, spicy3):.3f} | ~ warm {csim(hot3, warm4):.3f}")
print(f"hot in R4 ~ spicy {csim(hot4, spicy3):.3f} | ~ warm {csim(hot4, warm4):.3f}")</div>
  <div class="fx" data-lang="text">'curry was too'          -&gt; [('spicy', 0.39), ('hot', 0.35), ('fiery', 0.25)]
'chai was too'           -&gt; [('steaming', 0.37), ('warm', 0.34), ('hot', 0.28)]
'paneer roll was too'    -&gt; [('spicy', 0.4), ('fiery', 0.35), ('hot', 0.24)]
input embedding of 'hot' is one row: (32,)
contextual hot: R3 vs R4 0.235
hot in R3 ~ spicy 0.960 | ~ warm 0.184
hot in R4 ~ spicy 0.090 | ~ warm 0.901</div>
  <p>After "curry was too" the model expects spicy / hot / fiery; after "chai was too" it expects steaming / warm / hot. It learned that what "too ___" means depends on the dish, from nothing but next-word prediction. Now the payoff of the whole track: <code>vec</code> reads the model's final hidden vector at the position of a word. The input embedding of "hot" is a single row, identical in both reviews, but the two contextual "hot"s have cosine only 0.235 with each other: the contextual "hot" in R3 is close to "spicy" in the same slot and far from "warm", and in R4 the reverse. <strong>The context problem from the NLP note, solved by a model with 30 thousand parameters trained in seconds.</strong></p>
<div class="fx" data-lang="py">torch.manual_seed(0)
mlm = TinyTransformer(V, causal=False)
opt = torch.optim.AdamW(mlm.parameters(), lr=3e-3)
for step in range(800):
    b = data[torch.randint(0, len(data), (64,))].clamp(min=0)
    real = b &gt; 2                                                   # maskable: real word tokens
    pick = (torch.rand(b.shape) &lt; 0.15) &amp; real                     # choose ~15% of tokens
    r = torch.rand(b.shape)
    x = b.clone()
    x[pick &amp; (r &lt; 0.8)] = stoi["&lt;mask&gt;"]                           # 80% -&gt; [MASK]
    rnd = pick &amp; (r &gt;= 0.8) &amp; (r &lt; 0.9)                            # 10% -&gt; random token
    x[rnd] = torch.randint(3, V, (int(rnd.sum()),))                # remaining 10% unchanged
    y = torch.where(pick, b, torch.full_like(b, -1))               # loss only on picked tokens
    loss = F.cross_entropy(mlm(x).reshape(-1, V), y.reshape(-1), ignore_index=-1)
    opt.zero_grad(); loss.backward(); opt.step()
mlm.eval()
def fill(text, k=3):
    toks = text.split(); i = toks.index("&lt;mask&gt;")
    ids = torch.tensor([[0] + [stoi[w] for w in toks] + [1]])      # complete sentence, as in training
    with torch.no_grad():
        p = F.softmax(mlm(ids)[0, i + 1], -1)
    top = p.topk(k)
    return [(vocab[j], round(v.item(), 2)) for v, j in zip(top.values, top.indices)]
print("MLM final loss %.3f" % loss.item())
print("&lt;mask&gt; was too hot to drink -&gt;", fill("&lt;mask&gt; was too hot to drink"))
print("curry was too &lt;mask&gt; for me -&gt;", fill("curry was too &lt;mask&gt; for me"))
print("GPT after just &lt;bos&gt;          -&gt;", next_word(gpt, ""))</div>
  <div class="fx" data-lang="text">MLM final loss 0.632
&lt;mask&gt; was too hot to drink -&gt; [('coffee', 0.29), ('tea', 0.28), ('chai', 0.28)]
curry was too &lt;mask&gt; for me -&gt; [('spicy', 0.38), ('hot', 0.28), ('fiery', 0.28)]
GPT after just &lt;bos&gt;          -&gt; [('the', 0.3), ('tea', 0.06), ('chai', 0.05)]</div>
  <p>Same network, no causal mask, trained to fill blanks with the 15% / 80-10-10 recipe; the loss counts only the picked positions (<code>y</code> is −1 elsewhere). Filling "&lt;mask&gt; was too hot to drink" needs the words on the <em>right</em> ("to drink"), and the MLM model answers with drinks; "curry was too &lt;mask&gt; for me" gets chilli words. The GPT, asked about the same first position, can only use ⟨bos⟩ and spreads its bets over how reviews start. That is the trade: MLM gives better <em>understanding</em> vectors (both sides), next-token prediction gives a model that can <em>generate</em>. One practical detail bit us while writing this: <code>fill</code> must pass a complete sentence ending in ⟨eos⟩, exactly as in training; without the end marker this small model guessed badly, a reminder that train and inference inputs must have the same format.</p>
  <table class="tbl">
    <tr><th></th><th>Masked LM (BERT)</th><th>Next-token (GPT)</th></tr>
    <tr><td>Sees</td><td>both sides of the blank</td><td>only the past</td></tr>
    <tr><td>Training signal per sequence</td><td>~15% of positions</td><td>every position</td></tr>
    <tr><td>Can generate text</td><td>not naturally</td><td>yes, token by token</td></tr>
    <tr><td>Best at</td><td>classification, tagging, embeddings</td><td>generation, and any task phrased as continuation</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>MLM is a fill-in-the-blanks worksheet with the whole sentence visible. Next-token prediction is dictation: write the next word given only what has been said so far, which is exactly what a chatbot has to do.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Self-supervised pretraining</strong>: training on labels made from the raw text itself. <strong>Causal language modelling</strong>: maximise Σ<sub>t</sub> ln p(x<sub>t+1</sub> | x<sub>1…t</sub>). <strong>Masked language modelling</strong>: maximise Σ<sub>masked t</sub> ln p(x<sub>t</sub> | unmasked tokens).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A low pretraining loss on templates or memorised text is not understanding. Our corpus has 10 templates, so the tiny model's knowledge stops there: ask it about "biryani delivery time" and it has nothing. Real models need vast, varied text, which is the scale story of the next section.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How this becomes an LLM.</b> Our tiny GPT predicts one next word. How does next-word prediction become a model that writes whole replies and follows instructions, and what changes between 30 thousand and 100 billion parameters?</div>

  <h2 id="tf-llm"><span class="num">13</span>How This Becomes an LLM</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A model that outputs one probability distribution over the next token is not yet a chatbot. How does it produce a full sentence, and what separates our 30-thousand-parameter toy from ChatGPT or Claude?</p>
  </div>
  <p>Generation is a loop: run the decoder on the text so far, pick a token from the next-token distribution, append it, repeat until ⟨eos⟩. Picking the most likely token every time is <strong>greedy decoding</strong>; drawing at random from the distribution is <strong>sampling</strong> (temperature and top-p control how adventurous).</p>
<div class="fx" data-lang="py">def generate(model, prompt, steps=8, seed=0):
    g = torch.Generator().manual_seed(seed)
    ids = [0] + [stoi[w] for w in prompt.split()]
    for _ in range(steps):
        with torch.no_grad():
            p = F.softmax(model(torch.tensor([ids]))[0, -1], -1)
        nxt = torch.multinomial(p, 1, generator=g).item()       # sample the next token
        if nxt == 1:                                            # &lt;eos&gt;
            break
        ids.append(nxt)
    return " ".join(vocab[i] for i in ids[1:])
for seed in range(3):
    print(generate(gpt, "the chai", seed=seed))
print(generate(gpt, "paneer kathi", seed=0))</div>
  <div class="fx" data-lang="text">the chai was warm and good
the chai was hot and amazing
the chai was warm and tasty
paneer kathi arrived lukewarm and bad</div>
  <p>Each line is the loop above with a different random seed. The model writes plausible Biteful reviews, and every "hot"/"warm"/"steaming" it picks for chai comes from the same contextual mechanism measured in section 12. Nothing else is needed to generate; an LLM is this loop with a much better model.</p>
  <table class="tbl">
    <tr><th>Model</th><th>Blocks × d<sub>model</sub></th><th>Parameters</th><th>Training text</th></tr>
    <tr><td>Our tiny GPT</td><td>2 × 32</td><td>~30 thousand</td><td>4,000 template reviews</td></tr>
    <tr><td>BERT-base (2018, encoder)</td><td>12 × 768</td><td>110 million</td><td>~3.3 billion words</td></tr>
    <tr><td>GPT-2 (2019)</td><td>12–48 × 768–1,600</td><td>124 million – 1.5 billion</td><td>~40 GB of web text</td></tr>
    <tr><td>GPT-3 (2020)</td><td>96 × 12,288</td><td>175 billion</td><td>~300 billion tokens</td></tr>
    <tr><td>Llama-3 8B (2024)</td><td>32 × 4,096</td><td>8 billion</td><td>~15 trillion tokens</td></tr>
  </table>
  <p>Three ingredients turn the toy into an assistant, all covered in <a class="xref" data-note="llm_basics">How LLMs Work</a>: <strong>scale</strong> (more blocks, wider d, far more and more varied text: abilities like following a format or doing arithmetic appear only at scale), <strong>instruction tuning</strong> (fine-tune on prompt → good answer pairs so it answers instead of merely continuing), and <strong>preference tuning</strong> (RLHF-style training on which answers people prefer). Serving adds a <strong>KV cache</strong>: keys and values of past tokens are stored so each new token costs one row of attention instead of recomputing everything.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Large language model (LLM)</strong>: a decoder-only Transformer, pretrained with next-token prediction on very large text corpora, usually followed by instruction and preference tuning, used autoregressively (each generated token is fed back as input).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Decoder-only won for general-purpose models because one objective scales well and any task can be phrased as continuation, not because encoders stopped being useful. Also, generation is still sequential: training is parallel thanks to the causal mask, inference is token by token.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects,</b> then <a class="xref" data-note="llm_basics">How LLMs Work</a> for scaling and tuning, and <a class="xref" data-note="vectordb">Vector DBs</a>, which turns encoder outputs into searchable sentence vectors for Biteful's menu.</div>

  <h2 id="tf-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Attention, projections, heads, positions, residuals, LayerNorm, FFN, masks, cross-attention, objectives: a parts list, or one design where each part plugs a hole left by another?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 340" width="680">
<defs><marker id="tf-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="170" height="44" rx="7" class="fr sr"/><text x="95" y="29" text-anchor="middle" font-size="11.5" font-weight="700">static "hot"</text><text x="95" y="45" text-anchor="middle" class="tm" font-size="10">0.707 to spicy and warm</text>
<line x1="180" y1="32" x2="208" y2="32" stroke="currentColor" marker-end="url(#tf-a9)"/>
<rect x="210" y="10" width="210" height="44" rx="7" class="fb sb"/><text x="315" y="29" text-anchor="middle" font-size="11.5" font-weight="700">self-attention (raw)</text><text x="315" y="45" text-anchor="middle" class="tm" font-size="10">curry gets only 0.203</text>
<line x1="420" y1="32" x2="448" y2="32" stroke="currentColor" marker-end="url(#tf-a9)"/>
<rect x="450" y="10" width="220" height="44" rx="7" class="fb sb"/><text x="560" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Q/K/V projections, ÷√d</text><text x="560" y="45" text-anchor="middle" class="tm" font-size="10">curry 0.711 → hot ≈ spicy 0.964</text>
<line x1="560" y1="54" x2="560" y2="84" stroke="currentColor" marker-end="url(#tf-a9)"/>
<rect x="450" y="86" width="220" height="44" rx="7" class="ft st"/><text x="560" y="105" text-anchor="middle" font-size="11.5" font-weight="700">multi-head</text><text x="560" y="121" text-anchor="middle" class="tm" font-size="10">dish head + modifier head</text>
<line x1="450" y1="108" x2="422" y2="108" stroke="currentColor" marker-end="url(#tf-a9)"/>
<rect x="210" y="86" width="210" height="44" rx="7" class="ft st"/><text x="315" y="105" text-anchor="middle" font-size="11.5" font-weight="700">positional encoding</text><text x="315" y="121" text-anchor="middle" class="tm" font-size="10">order-blind → order-aware</text>
<line x1="210" y1="108" x2="182" y2="108" stroke="currentColor" marker-end="url(#tf-a9)"/>
<rect x="10" y="86" width="170" height="44" rx="7" class="ft st"/><text x="95" y="105" text-anchor="middle" font-size="11.5" font-weight="700">residual + LayerNorm</text><text x="95" y="121" text-anchor="middle" class="tm" font-size="10">grad 6e-13 → 49 at depth 48</text>
<line x1="95" y1="130" x2="95" y2="160" stroke="currentColor" marker-end="url(#tf-a9)"/>
<rect x="10" y="162" width="170" height="44" rx="7" class="ft st"/><text x="95" y="181" text-anchor="middle" font-size="11.5" font-weight="700">FFN</text><text x="95" y="197" text-anchor="middle" class="tm" font-size="10">per token, ⅔ of weights</text>
<line x1="180" y1="184" x2="208" y2="184" stroke="currentColor" marker-end="url(#tf-a9)"/>
<rect x="210" y="162" width="250" height="44" rx="7" class="fg sg"/><text x="335" y="181" text-anchor="middle" font-size="11.5" font-weight="700">block: x+MHA(LN x); x+FFN(LN x)</text><text x="335" y="197" text-anchor="middle" class="tm" font-size="10">(4,4) in = (4,4) out; = PyTorch</text>
<line x1="460" y1="184" x2="488" y2="184" stroke="currentColor" marker-end="url(#tf-a9)"/>
<rect x="490" y="162" width="180" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="580" y="181" text-anchor="middle" font-size="11.5" font-weight="700">wiring</text><text x="580" y="197" text-anchor="middle" class="tm" font-size="10">encoder / decoder / both</text>
<line x1="540" y1="206" x2="470" y2="238" stroke="currentColor" marker-end="url(#tf-a9)"/><line x1="620" y1="206" x2="620" y2="238" stroke="currentColor" marker-end="url(#tf-a9)"/>
<rect x="300" y="240" width="170" height="40" rx="7" class="fb sb"/><text x="385" y="258" text-anchor="middle" font-size="11.5" font-weight="700">causal mask</text><text x="385" y="273" text-anchor="middle" class="tm" font-size="10">chai row [1, 0, 0, 0]</text>
<rect x="490" y="240" width="180" height="40" rx="7" class="fb sb"/><text x="580" y="258" text-anchor="middle" font-size="11.5" font-weight="700">cross-attention</text><text x="580" y="273" text-anchor="middle" class="tm" font-size="10">garam → hot</text>
<line x1="300" y1="260" x2="272" y2="260" stroke="currentColor" marker-end="url(#tf-a9)"/>
<rect x="10" y="240" width="260" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="140" y="258" text-anchor="middle" font-size="11.5" font-weight="700">pretraining: next-token / MLM</text><text x="140" y="273" text-anchor="middle" class="tm" font-size="10">hot(R3) ≈ spicy 0.96 · hot(R4) ≈ warm 0.90</text>
<text x="340" y="318" text-anchor="middle" class="tm" font-size="10.5">→ scale + tuning = LLM (How LLMs Work) · encoder + similarity training = sentence embeddings (Vector DBs)</text>
</svg><figcaption>Each part answers the weakness of the one before; the block is their sum, the wiring and the objective decide what it becomes.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same two reviews, R3 "curry was too hot" and R4 "chai was too hot"</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our example</th><th>When to use</th></tr>
    <tr><td>Static embedding</td><td>lookup table</td><td>what does a token start as?</td><td>hot = [0, 0, 1, 0]; 0.707 to spicy and warm</td><td>input layer of every model</td></tr>
    <tr><td>Self-attention (raw)</td><td>dot products, softmax, weighted sum</td><td>can a word read its sentence?</td><td>hot → curry 0.203, itself 0.334</td><td>only as a concept</td></tr>
    <tr><td>Q/K/V + √d</td><td>three learned matrices</td><td>what to look for / be found by / hand over?</td><td>curry 0.711; hot ≈ spicy 0.964 (R3), ≈ warm 0.964 (R4)</td><td>every attention layer</td></tr>
    <tr><td>Multi-head</td><td>h slices + W<sub>O</sub></td><td>several relations at once?</td><td>head 1 → curry; head 2 → was, too</td><td>always (8–128 heads)</td></tr>
    <tr><td>Positional encoding</td><td>sin/cos, learned table, or rotation</td><td>does order matter?</td><td>pos 1 = [0.841, 0.540, 0.010, 1.000]; RoPE score depends on distance</td><td>every Transformer</td></tr>
    <tr><td>Residual + LayerNorm</td><td>x + f(LN x)</td><td>why do deep stacks train?</td><td>input grad 6 × 10⁻¹³ → ~49 at depth 48</td><td>every block</td></tr>
    <tr><td>FFN</td><td>d → 4d → d, GELU</td><td>per-token non-linear processing?</td><td>148 vs 80 weights (toy); 4.72M vs 2.36M (BERT layer)</td><td>every block</td></tr>
    <tr><td>Block</td><td>all of the above</td><td>what is one layer, exactly?</td><td>(4, 4) → (4, 4); NumPy = PyTorch</td><td>stack N times</td></tr>
    <tr><td>Causal mask</td><td>−∞ above diagonal</td><td>no peeking?</td><td>chai [1, 0, 0, 0]; was [0.5, 0.5, 0, 0]</td><td>decoders</td></tr>
    <tr><td>Cross-attention</td><td>Q from decoder, K/V from encoder</td><td>read another sequence?</td><td>garam → hot</td><td>translation, summarising, multimodal</td></tr>
    <tr><td>Next-token / MLM</td><td>labels made from raw text</td><td>how does it learn?</td><td>"curry was too" → spicy 0.39 … ; hot(R3) ≈ spicy 0.96</td><td>GPT-style / BERT-style</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a Transformer turns each token's static vector into a contextual one by repeatedly (1) letting it gather information from other tokens with learned attention and (2) processing what it gathered with a per-token network, with residuals and normalisation keeping a deep stack trainable</strong>. Masks and cross-attention decide who may read whom; the pretraining objective decides what it learns.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="llm_basics">How LLMs Work</a> and <a class="xref" data-note="vectordb">Vector DBs</a>.</div>

  <h2 id="tf-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: R3 "curry was too hot" (spicy) and R4 "chai was too hot" (temperature). Hand embeddings, dims [food, drink, heat, filler]: curry [1,0,0,0], chai [0,1,0,0], was [0,0,0,1], too [0,0,0.5,1], hot [0,0,1,0]; references spicy [1,0,1,0], warm [0,1,1,0]. Hand projections: W<sub>Q</sub> heat row [4,4,0,0], W<sub>K</sub> = diag(1,1,0,0), W<sub>V</sub> = I.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our reviews</th><th>Weakness → next</th></tr>
    <tr><td>Context problem</td><td>why can't a word vector tell the "hot"s apart?</td><td>same row; 0.707 to both</td><td>need words to read words</td></tr>
    <tr><td>Self-attention (raw)</td><td>how does a word read its sentence?</td><td>hot → curry 0.203</td><td>similarity ≠ relevance</td></tr>
    <tr><td>Q/K/V projections</td><td>what to seek, how to be found, what to give?</td><td>curry 0.711; hot ≈ spicy 0.964</td><td>one relation per layer</td></tr>
    <tr><td>Multi-head</td><td>several relations?</td><td>dish head, modifier head</td><td>order-blind</td></tr>
    <tr><td>Positional encoding</td><td>where is each word?</td><td>PE(1) = [0.841, 0.540, 0.010, 1]</td><td>deep stacks fail</td></tr>
    <tr><td>Residual + LayerNorm</td><td>why does depth train?</td><td>grad 6e-13 vs 49; std 3e8 vs 7.8</td><td>attention only averages</td></tr>
    <tr><td>FFN</td><td>per-token non-linearity?</td><td>d → 4d → d</td><td>assemble</td></tr>
    <tr><td>Block</td><td>exact computation and shapes?</td><td>(4,4) → (4,12) → heads (4,2) → (4,16) → (4,4)</td><td>how to wire for a task</td></tr>
    <tr><td>Encoder / decoder / enc–dec</td><td>read, write, translate?</td><td>route R4, reply, translate</td><td>enforce "past only"</td></tr>
    <tr><td>Causal mask</td><td>no peeking?</td><td>chai [1,0,0,0]</td><td>read another sentence</td></tr>
    <tr><td>Cross-attention</td><td>decoder reads encoder?</td><td>garam → hot</td><td>where do weights come from</td></tr>
    <tr><td>Pretraining</td><td>what task teaches it?</td><td>"chai was too" → steaming/warm/hot; hot(R4) ≈ warm 0.90</td><td>scale it up</td></tr>
    <tr><td>LLM</td><td>how does it become an assistant?</td><td>generation loop; scale + tuning</td><td>→ How LLMs Work</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Projections</td><td>Q = XW<sub>Q</sub>, K = XW<sub>K</sub>, V = XW<sub>V</sub></td><td>X n × d token vectors; W learned d × d<sub>k</sub></td></tr>
    <tr><td>Attention</td><td>softmax(QKᵀ/√d<sub>k</sub> + M) V</td><td>M mask (0 or −∞); softmax along each row</td></tr>
    <tr><td>Softmax</td><td>α<sub>j</sub> = e<sup>s<sub>j</sub></sup> / Σ<sub>k</sub> e<sup>s<sub>k</sub></sup></td><td>s scores; weights positive, sum 1</td></tr>
    <tr><td>Multi-head</td><td>Concat(head<sub>1…h</sub>) W<sub>O</sub></td><td>head width d/h; params 4d² + 4d</td></tr>
    <tr><td>Sinusoidal PE</td><td>PE(p, 2i) = sin(p/10000<sup>2i/d</sup>), PE(p, 2i+1) = cos(…)</td><td>p position, i pair index</td></tr>
    <tr><td>RoPE</td><td>rotate each (q, k) pair by pθ; score depends on (m − n)θ</td><td>m, n positions of query and key</td></tr>
    <tr><td>LayerNorm</td><td>γ ⊙ (x − μ)/√(σ² + ε) + β</td><td>μ, σ² over the d features of one token</td></tr>
    <tr><td>FFN</td><td>W₂ GELU(W₁x + b₁) + b₂</td><td>W₁: d → 4d, W₂: 4d → d</td></tr>
    <tr><td>Block (pre-norm)</td><td>x ← x + MHA(LN x); x ← x + FFN(LN x)</td><td>shape n × d kept</td></tr>
    <tr><td>Next-token loss</td><td>−Σ<sub>t</sub> ln p(x<sub>t+1</sub> | x<sub>≤t</sub>)</td><td>cross-entropy, all positions in one pass</td></tr>
    <tr><td>MLM loss</td><td>−Σ<sub>masked t</sub> ln p(x<sub>t</sub> | rest)</td><td>15% chosen; 80% [MASK], 10% random, 10% kept</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Encoder (BERT-style)</b><p>Classification, tagging, sentence embeddings, reranking; cheap and fast.</p><small>Not for open-ended generation</small></div>
    <div><b>Decoder (GPT-style)</b><p>Generation, chat, code; nearly any task via prompting.</p><small>Costly; sequential at inference</small></div>
    <div><b>Encoder–decoder (T5)</b><p>Fixed input → output mapping: translation, summarisation.</p><small>Less common for general assistants</small></div>
    <div><b>Not a Transformer</b><p>Tiny data, strict O(1)-memory streaming, very long sequences on tiny devices.</p><small>RNNs / state-space models, or TF-IDF baselines</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>O(n²) attention cost; scale by √d<sub>k</sub> of a head; mask before softmax, and check the True = blocked/allowed convention; d<sub>model</sub> divisible by heads; post-norm and (seq, batch, d) defaults in <code>nn.TransformerEncoderLayer</code>; positions must be added (attention is order-blind); attention weights are not explanations; decoder-only models have no cross-attention; "BERT is obsolete" is false.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Scores [2, 0, 0, 0] (already scaled): softmax?</td><td>7.389 / 10.389 = 0.711, others 1 / 10.389 = 0.096</td></tr>
    <tr><td>Shape of the score matrix for 4 tokens, per head?</td><td>4 × 4, whatever d</td></tr>
    <tr><td>Causal mask, 3 tokens, all queries 0: weights?</td><td>[1, 0, 0], [0.5, 0.5, 0], [⅓, ⅓, ⅓]</td></tr>
    <tr><td>Params of MHA at d = 512 with 8 heads?</td><td>4 · 512² + 4 · 512 = 1,050,624, same as 1 head</td></tr>
    <tr><td>p(correct next token) = 0.6: cross-entropy?</td><td>−ln 0.6 = 0.511</td></tr>
  </table>

  <h2 id="tf-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why did Transformers replace RNNs?</summary><div class="qa-body">(1) RNNs process tokens sequentially, wasting GPU parallelism; Transformers process all positions at once. (2) RNN memory fades; attention connects any two tokens in one step. (3) Seq2seq RNNs squeezed the input into one vector; attention lets the output look at every input position. Cost: O(n²) attention.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Q, K and V in plain English.</summary><div class="qa-body">Each token projects itself three ways. Query: what I'm looking for ("hot": which food or drink?). Key: what I can be found by ("curry": I am a food). Value: what I pass on if chosen. Q·K gives relevance scores, softmax turns them into weights, and the output is the weighted sum of values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why divide attention scores by √d<sub>k</sub>?</summary><div class="qa-body">A dot product of d<sub>k</sub> unit-variance terms has variance d<sub>k</sub>. Large scores saturate softmax (one weight ≈ 1) and its gradient vanishes. Dividing by √d<sub>k</sub> keeps scores near unit variance. In our demo at d<sub>k</sub> = 64 the raw max weight was essentially 1, scaled about a half.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is multi-head attention, and why does it cost no more than one head?</summary><div class="qa-body">Split d<sub>model</sub> into h slices, run attention on each in parallel, concatenate, project with W<sub>O</sub>. Each head can learn a different relation (dish-finder, modifier-finder). The four d × d matrices are the same size however they are sliced: 4d² + 4d parameters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does attention need positional encoding?</summary><div class="qa-body">Attention is permutation-equivariant: reversing "curry was too hot" just reverses the output rows (verified). Adding position vectors (sinusoidal or learned) or rotating Q and K (RoPE) makes the same word at different positions look different.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the FFN do that attention doesn't?</summary><div class="qa-body">Attention mixes information across tokens as a weighted average. The FFN applies a non-linear transform to each token independently (d → 4d → GELU → d). It holds about two-thirds of the parameters and much stored knowledge.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? A causal mask over 4 tokens whose queries are all zero.</summary><div class="qa-body">Each row spreads weight evenly over the allowed (past and current) keys: [1, 0, 0, 0], [0.5, 0.5, 0, 0], [⅓, ⅓, ⅓, 0], [¼, ¼, ¼, ¼].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Encoder vs decoder vs encoder–decoder: when do you use each?</summary><div class="qa-body">Encoder (BERT): bidirectional, for understanding: classify, tag, embed. Decoder (GPT, Claude): causal, for generation and general prompting. Encoder–decoder (T5, BART): map one sequence to another with cross-attention (translation, summarisation).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is cross-attention?</summary><div class="qa-body">Attention whose queries come from the decoder and keys/values from the encoder output; weight shape target_len × source_len. While writing "garam", the decoder's query matches the encoder's "hot". It is the extra sub-layer in encoder–decoder blocks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why was BERT trained with MLM instead of next-token prediction?</summary><div class="qa-body">Its attention is bidirectional, so the next token is visible; predicting it would be trivial. Masking ~15% (80% [MASK], 10% random, 10% unchanged) forces it to use context from both sides.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pre-norm vs post-norm?</summary><div class="qa-body">Post-norm (2017): LN(x + f(x)). Pre-norm (modern LLMs): x + f(LN(x)). Pre-norm keeps a clean residual path from output to input, so very deep stacks train stably without careful warm-up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time and memory cost of self-attention in sequence length n?</summary><div class="qa-body">O(n²·d) time and O(n²) memory for the score matrix, per head per layer. Doubling context roughly quadruples attention cost. FlashAttention cuts memory by tiling; KV caching avoids recomputation at generation time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do Q/K/V projections need the raw self-attention step before them, and what breaks if you use X directly as Q, K and V?</summary><div class="qa-body">The projections only change <em>what</em> is compared; the score-softmax-sum machinery is the same. Using X directly makes every token's query equal its key, so it attends most to itself and to similar tokens: "hot" gave itself 0.334 and "curry" 0.203. Projections let "hot" ask a different question (food or drink?) and gave "curry" 0.711.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the residual connection need LayerNorm, and LayerNorm need the residual?</summary><div class="qa-body">Residuals keep gradients alive (input gradient ~49 instead of 6 × 10⁻¹³ at depth 48) but keep adding to one running vector, which can explode (std 3 × 10⁸ without normalisation). LayerNorm in front of each sub-layer caps what is added (std 7.8). Without the residual, LayerNorm alone cannot stop gradients vanishing through 48 multiplications.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if a GPT is trained without the causal mask but generates with it?</summary><div class="qa-body">During training each position can see the next token and learns to copy it, so the loss looks excellent. At generation the future does not exist, the shortcut is gone, and the output is nonsense: a train/serve mismatch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does this note solve the problem the NLP note ended with?</summary><div class="qa-body">The NLP note's static vectors gave "hot" one point between spicy (0.86) and warm (0.77). Here the input embedding of "hot" is still one row, but after attention and FFN layers trained on next-token prediction, the contextual "hot" in "curry was too hot" is 0.96 similar to "spicy" and in "chai was too hot" 0.90 similar to "warm". The tokenizer and embedding table from the NLP note are still the first layer.</div></details>
</main>`
});
