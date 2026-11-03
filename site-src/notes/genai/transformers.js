// notes/genai/transformers.js — Transformers
Object.assign(TOPIC_CONTENT, {
  "transformers": `<main>
  <h1>Transformers</h1>
  <div class="where"><span>Generative AI</span><span>Transformers</span></div>
  <p class="lead">The Transformer is the neural-network architecture inside every modern large language model, from GPT and Llama to Claude, and inside the encoders that power semantic search. <a class="xref" data-note="nlp">NLP Foundations</a> ended at a wall: every word vector it built gives "hot" one fixed vector, whether a Biteful customer wrote "curry was too hot" (too spicy) or "chai was too hot" (too hot to drink). This note builds, one part at a time, the machine that gives those two "hot"s different vectors, and each part is added because the previous one leaves a specific gap. The running example is those two four-word reviews, R3 and R4, with hand-made four-number word vectors so that every attention weight can be checked on paper. By the end you will know exactly what happens inside one Transformer block, how blocks are wired into BERT, GPT and T5, and how next-word prediction turns the whole thing into an LLM. Attention itself is derived from first principles in <a class="xref" data-note="dl_attention">Attention Mechanisms</a>; here it is recapped and then assembled into the full architecture.</p>

  <h2 id="tf-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Transformers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Attention</div>
        <ul>
          <li>Each token's new vector = weighted average of all tokens</li>
          <li><b>Q</b> what I look for, <b>K</b> what I'm found by, <b>V</b> what I hand over</li>
          <li>softmax(QKᵀ/√d<sub>k</sub>)V; √d<sub>k</sub> stops softmax saturating</li>
          <li><b>Multi-head</b>: several relations at once, same parameter count</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Making it work</div>
        <ul>
          <li>Attention is order-blind → <b>positional encoding</b> (sinusoidal, learned, RoPE)</li>
          <li><b>Residual</b> x + f(x) keeps gradients alive</li>
          <li><b>LayerNorm</b> keeps activations a sensible size</li>
          <li><b>FFN</b> d → 4d → d per token; two-thirds of the weights</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Wiring</div>
        <ul>
          <li><b>Encoder</b> (BERT): sees both sides; classify, embed</li>
          <li><b>Decoder</b> (GPT, Claude): causal mask; generate</li>
          <li><b>Encoder–decoder</b> (T5): cross-attention; translate</li>
          <li>Cost: n² attention scores per head per layer</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Training and scale</div>
        <ul>
          <li><b>Next-token</b> prediction (GPT) vs <b>masked LM</b> (BERT)</li>
          <li>Cross-entropy: −ln p(correct token)</li>
          <li>Generation: predict, sample, append, repeat</li>
          <li>LLM = big decoder + huge text + instruction and preference tuning</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="tf-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Context Problem</span><span class="rm-sub">two "hot"s, one vector; why not RNNs</span></div></div>
      <div class="rm-item rm-done" data-target="tf-attn"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Self-Attention</span><span class="rm-sub">a word rebuilt from its sentence</span></div></div>
      <div class="rm-item rm-done" data-target="tf-qkv"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Queries, Keys and Values</span><span class="rm-sub">learning what to look for; the √d scale</span></div></div>
      <div class="rm-item rm-done" data-target="tf-mha"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Multi-Head Attention</span><span class="rm-sub">several relations at once</span></div></div>
      <div class="rm-item rm-done" data-target="tf-pos"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Positional Encodings</span><span class="rm-sub">sinusoidal, learned, RoPE</span></div></div>
      <div class="rm-item rm-done" data-target="tf-norm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Residual Connections and LayerNorm</span><span class="rm-sub">why deep stacks train</span></div></div>
      <div class="rm-item rm-done" data-target="tf-ffn"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Feed-Forward Network</span><span class="rm-sub">per-token processing</span></div></div>
      <div class="rm-item rm-done" data-target="tf-block"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">The Transformer Block</span><span class="rm-sub">every step traced with shapes</span></div></div>
      <div class="rm-item rm-done" data-target="tf-arch"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Encoders, Decoders and the Causal Mask</span><span class="rm-sub">BERT, GPT, T5</span></div></div>
      <div class="rm-item rm-done" data-target="tf-cross"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Cross-Attention</span><span class="rm-sub">reading another sentence</span></div></div>
      <div class="rm-item rm-done" data-target="tf-pretrain"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Pretraining Objectives</span><span class="rm-sub">next-token prediction and masked LM</span></div></div>
      <div class="rm-item rm-done" data-target="tf-llm"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">From Transformer to LLM</span><span class="rm-sub">generation, scale, KV cache</span></div></div>
      <div class="rm-item rm-done" data-target="tf-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">masks, scaling, shapes</span></div></div>
      <div class="rm-item rm-done" data-target="tf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, shapes, families</span></div></div>
      <div class="rm-item rm-done" data-target="tf-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the Transformer questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="tf-why"><span class="num">01</span>The Context Problem</h2>
  <p>Biteful has two complaints that every method in NLP Foundations scored as nearly identical: R3 "curry was too hot" should go to the kitchen (less chilli) and R4 "chai was too hot" should go to packaging (let drinks cool). The reason they look the same is that a word vector, whether from Word2Vec, GloVe or the first layer of a Transformer, is a row looked up in a table by the word's ID. The table does not know which sentence the word came from, so "hot" gets the same row in both reviews.</p>
  <p>To make every number in this note checkable by hand, we use tiny four-number word vectors whose positions mean something: <strong>[food, drink, heat, filler]</strong>. "curry" is [1, 0, 0, 0], a food. "chai" is [0, 1, 0, 0], a drink. "was" is pure filler, [0, 0, 0, 1]. "too" is filler with a hint of intensity, [0, 0, 0.5, 1]. "hot" is [0, 0, 1, 0]: heat, with no food or drink side. Two reference points tell us which way a vector leans: "spicy" = [1, 0, 1, 0] is heat plus food, and "warm" = [0, 1, 1, 0] is heat plus drink. Stacking a review's word vectors as rows gives the matrix a Transformer layer receives, one row per token:</p>
  <div class="fx" data-lang="py">import numpy as np
np.set_printoptions(precision=3, suppress=True)
E = {"curry": [1, 0, 0, 0], "chai": [0, 1, 0, 0], "was": [0, 0, 0, 1],
     "too": [0, 0, 0.5, 1], "hot": [0, 0, 1, 0]}                  # dims: food, drink, heat, filler
E = {w: np.array(v, dtype=float) for w, v in E.items()}
spicy, warm = np.array([1.0, 0, 1, 0]), np.array([0, 1.0, 1, 0])  # reference points
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
  <p>X3 has shape (4, 4): four tokens, four numbers each. Row 4 of X3 and row 4 of X4 are identical, and the static "hot" is exactly halfway between spicy and warm (cosine 0.707 to both). What we need is a <strong>contextual representation</strong>: a vector for each <em>occurrence</em> of a word, computed from the whole sentence, so that the "hot" in R3 leans towards spicy and the "hot" in R4 towards warm.</p>
  <p>Before Transformers, the standard tool for reading in context was the recurrent neural network (<a class="xref" data-note="dl_rnns">RNNs</a>), which carries a memory vector from word to word. It has three problems. It is <strong>sequential</strong>: word 50 must wait for word 49, so the thousands of cores in a GPU sit idle. It is <strong>forgetful</strong>: the memory is overwritten at every step, so by word 50 little of word 1 remains. And in translation it was a <strong>bottleneck</strong>: the whole input sentence had to be squeezed into one final memory vector.</p>
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
  </svg><figcaption>An RNN passes one memory vector along the chain; a Transformer links every pair of tokens directly and in parallel.</figcaption></figure>
  <p>The figure shows the difference. On the left, information from "curry" reaches "hot" only after passing through "was" and "too", fading at each step. On the right, every token is linked directly to every other token, so "hot" can read "curry" in a single step (the red arc), and all the links can be computed at the same time. Think of an RNN as a clerk who reads an order slip one word at a time, eyes closed in between, keeping a sticky-note summary; a Transformer lays the whole slip on the counter and lets every word look at every other word at once. That design is the <strong>Transformer</strong>, introduced in the 2017 paper "Attention Is All You Need": a network built only from attention and small per-token networks, with no recurrence. The price is that n tokens make n² pairs: 4 tokens give 16, but 1,000 tokens give a million per layer, which is why long inputs are expensive (<a class="xref" data-note="llm_basics">How LLMs Work</a>).</p>

  <h2 id="tf-attn"><span class="num">02</span>Self-Attention</h2>
  <p>We want "hot" to pull information from "curry" in R3 and from "chai" in R4. The simplest operation that lets a word read its sentence is a weighted average: rebuild each token's vector from all the tokens, giving more weight to the ones that matter. The recipe has three steps. First <strong>score</strong> every token against the one being updated with a dot product, which measures how much two vectors agree. Then divide the scores by √d (here √4 = 2, for reasons explained in the next section) and apply <strong>softmax</strong>, which turns any list of scores into positive weights that add up to 1. Finally take the <strong>weighted sum</strong> of all the token vectors. Doing this for every token at once is <strong>self-attention</strong>: the sentence attends to itself.</p>
  <p>By hand, for "hot" in R3 using the raw word vectors: the dot products of [0, 0, 1, 0] with curry, was, too and hot are 0, 0, 0.5 and 1, since only "too" and "hot" have a heat number. Halved, they are 0, 0, 0.25, 0.5. Their exponentials are 1, 1, 1.284, 1.649, which add to 4.933, so the weights are 0.203, 0.203, 0.260 and 0.334. The new "hot" is 0.203·curry + 0.203·was + 0.260·too + 0.334·hot.</p>
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
  <p><code>X @ X.T</code> computes all 16 scores at once: row i, column j is token i dotted with token j, and row 4 holds the scores for "hot". <code>softmax</code> works along each row, and <code>A @ X</code> takes the weighted sums. The new "hot" already differs between R3 and R4, and in R3 it leans towards spicy (0.687 against 0.478). Context is starting to work.</p>
  <p>But look at the weights. "hot" gives the most attention to <em>itself</em> (0.334) and to the filler word "too" (0.260), and only 0.203 to "curry", the one word that decides its meaning. Raw dot products measure <em>similarity</em>, and "hot" is most similar to itself. What we need is <em>relevance</em>: "hot" is not similar to "curry", it needs it. It is like asking a crowded kitchen "who is like me?" when what you really want to know is "who is holding the order slip that says which dish this was?". The next section lets each word ask a different question from the one it is found by.</p>

  <h2 id="tf-qkv"><span class="num">03</span>Queries, Keys and Values</h2>
  <p>With raw vectors, one vector plays three roles at once: what a word is looking for, what it can be found by, and what it hands over when found. The fix is to give each token three different versions of itself, produced by multiplying its vector by three learned matrices. The <strong>query</strong> q = x W<sub>Q</sub> says what this token is looking for. The <strong>key</strong> k = x W<sub>K</sub> says what this token can be found by. The <strong>value</strong> v = x W<sub>V</sub> is what this token hands over if chosen. Scores now compare queries with keys, and the weighted sum is taken over values:</p>
  <div class="fx" data-lang="text">Attention(Q, K, V) = softmax( Q Kᵀ / √d_k ) V        Q = X W_Q,  K = X W_K,  V = X W_V</div>
  <p>Think of a library. Your question is the query; the title on each book's spine is its key; the contents are its value. You read the books whose titles best match your question, and your understanding is a blend of their contents weighted by how well each title matched. Because titles and contents are separate, a book can be easy to find by one thing and hand over something richer.</p>
  <p>In a real model the three matrices are learned by gradient descent. Here we set them by hand to show what training could find. W<sub>Q</sub> turns the heat number into the question "is there a food or a drink near me?": its heat row is [4, 4, 0, 0] and every other row is zero, so the query of "hot" is [4, 4, 0, 0]. W<sub>K</sub> exposes only the food and drink numbers, so the key of "curry" is [1, 0, 0, 0] and the keys of was, too and hot are all zero. W<sub>V</sub> is the identity, so values are the word vectors themselves. The scores of "hot" are therefore 4, 0, 0, 0; scaled by 2 they become 2, 0, 0, 0, and softmax gives 7.389 / 10.389 = 0.711 for "curry" and 0.096 for each of the others.</p>
  <div class="fx" data-lang="py">W_Q = np.zeros((4, 4)); W_Q[2] = [4, 4, 0, 0]       # heat -&gt; "looking for food or drink"
W_K = np.diag([1.0, 1, 0, 0])                         # keys expose food / drink only
W_V = np.eye(4)                                       # values = the embeddings themselves

def attention(Q, K, V, mask=None):
    S = Q @ K.T / np.sqrt(K.shape[-1])
    if mask is not None:
        S = np.where(mask, S, -np.inf)                # blocked positions -&gt; weight 0 (section 09)
    A = softmax(S)
    return A @ V, A

for name, X in [("R3 curry", X3), ("R4 chai ", X4)]:
    out, A = attention(X @ W_Q, X @ W_K, X @ W_V)
    new_hot = X[3] + out[3]                            # keep the original, add context (section 06)
    print(f"{name}: weights {A[3]}  new hot {new_hot}  "
          f"cos spicy {cos(new_hot, spicy):.3f}  cos warm {cos(new_hot, warm):.3f}")</div>
  <div class="fx" data-lang="text">R3 curry: weights [0.711 0.096 0.096 0.096]  new hot [0.711 0.    1.144 0.193]  cos spicy 0.964  cos warm 0.595
R4 chai : weights [0.711 0.096 0.096 0.096]  new hot [0.    0.711 1.144 0.193]  cos spicy 0.595  cos warm 0.964</div>
  <p>The <code>attention</code> function is the formula line for line; its <code>mask</code> argument is used in section 09. The loop runs both reviews with the <em>same</em> three matrices. In R3, "hot" now puts 0.711 of its attention on "curry"; in R4 the same weights land on "chai". The new "hot" adds that context to the original vector (this "add, don't replace" step is the residual connection of section 06), and the result is 0.964 similar to spicy in R3 and 0.964 similar to warm in R4. One set of weights, two meanings: for this toy the context problem is solved. A trained model finds such matrices itself, in hundreds of dimensions and for thousands of patterns at once.</p>
  <p>Why divide by √d<sub>k</sub>, the width of the keys? A dot product adds up d<sub>k</sub> products, so for random vectors its spread grows like √d<sub>k</sub>. Large scores push softmax to put nearly all the weight on one token, a state called <strong>saturation</strong>, where its gradient is almost zero and attention stops learning. Dividing by √d<sub>k</sub> brings the spread back to about 1:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
for d_k in [4, 64, 512]:
    q, K = rng.normal(size=d_k), rng.normal(size=(5, d_k))
    raw = K @ q
    print(f"d_k={d_k:3d}  std of scores {raw.std():5.1f}   max softmax weight: raw {softmax(raw).max():.2f}"
          f"  scaled {softmax(raw / np.sqrt(d_k)).max():.2f}")</div>
  <div class="fx" data-lang="text">d_k=  4  std of scores   0.7   max softmax weight: raw 0.43  scaled 0.31
d_k= 64  std of scores   7.8   max softmax weight: raw 1.00  scaled 0.51
d_k=512  std of scores  20.9   max softmax weight: raw 1.00  scaled 0.51</div>
  <p>Each line scores one random query against five random keys. At d<sub>k</sub> = 64 the scores have a spread of about 8, and unscaled softmax gives one key essentially all the weight (1.00); scaled, the largest weight is about a half, a real mix. Note that it is √d<sub>k</sub> of one head, not of the whole model width; dividing by d<sub>k</sub> itself would flatten attention too much.</p>

  <h2 id="tf-mha"><span class="num">04</span>Multi-Head Attention</h2>
  <p>Our W<sub>Q</sub> asks a single question, "which food or drink is near me?". But "hot" also wants to know how strong the heat is ("too hot" against just "hot"), and a real word needs many relations at once: its subject, its object, the word it modifies. One softmax produces one set of weights per word, so asking several questions in one attention would blur them together. <strong>Multi-head attention</strong> runs several smaller attentions side by side instead. The d<sub>model</sub> columns of Q, K and V are split into h slices; each slice is a <strong>head</strong> that does its own attention; the h outputs are glued back together and mixed by one more learned matrix, W<sub>O</sub>. It is like having eight people check an order slip, each looking for one thing (dish, size, spice level, address) and then pooling their notes, rather than one person checking all eight things.</p>
  <p>With d<sub>model</sub> = 4 and two heads, each head is two columns wide. Head 1 (columns 0–1) is the dish-finder from section 03. Head 2 (columns 2–3) is a modifier-finder: the heat number queries the filler dimension, so "hot" looks at "was" and "too".</p>
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
print("shapes: X", X3.shape, "-&gt; per head", (2, 4, 2), "-&gt; output", Y.shape)</div>
  <div class="fx" data-lang="text">head 1, 'hot' attends (curry, was, too, hot): [0.735 0.088 0.088 0.088]
head 2, 'hot' attends (curry, was, too, hot): [0.054 0.446 0.446 0.054]
shapes: X (4, 4) -&gt; per head (2, 4, 2) -&gt; output (4, 4)</div>
  <p><code>split</code> reshapes each (4, 4) matrix into (2 heads, 4 tokens, 2 columns), each head runs the same <code>attention</code> function on its own slice, and the outputs are glued back to (4, 4) and multiplied by W<sub>O</sub>. Head 1 sends most of "hot"'s weight to "curry" (0.735); head 2 splits it between "was" and "too" (0.446 each) and ignores "curry". Two relations in one layer.</p>
  <p>Multi-head attention costs no more than a single head. W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> and W<sub>O</sub> are each d × d however you slice them, so the layer has 4d² + 4d parameters (with biases) for any number of heads; at d = 512 that is 1,050,624 for one head or for eight. The model width must be divisible by the number of heads, and real heads rarely learn roles as tidy as ours: many learn overlapping or purely positional patterns.</p>

  <h2 id="tf-pos"><span class="num">05</span>Positional Encodings</h2>
  <p>"curry was too hot" and "hot too was curry" contain the same words, and so do "not too spicy" and "too spicy, not good". Attention compares every pair of tokens, but nothing in Q, K or V says <em>where</em> a token is. Does attention notice the order at all? The first line of the next block reverses R3 and checks:</p>
  <div class="fx" data-lang="py">perm = [3, 2, 1, 0]                                    # "hot too was curry"
out_a, _ = attention(X3 @ W_Q, X3 @ W_K, X3 @ W_V)
out_b, _ = attention(X3[perm] @ W_Q, X3[perm] @ W_K, X3[perm] @ W_V)
print("no positions: reversed output == original output reversed:", np.allclose(out_b, out_a[perm]))

def pos_enc(n, d):
    P = np.zeros((n, d)); p = np.arange(n)[:, None]
    freq = 1 / 10000 ** (np.arange(0, d, 2) / d)       # one speed per sin/cos pair
    P[:, 0::2], P[:, 1::2] = np.sin(p * freq), np.cos(p * freq)
    return P

PE = pos_enc(4, 4)
print(PE)
Xp, Xr = X3 + PE, X3[perm] + PE                        # positions 0..3 added in reading order
o_p, _ = attention(Xp @ W_Q, Xp @ W_K, Xp @ W_V)
o_r, _ = attention(Xr @ W_Q, Xr @ W_K, Xr @ W_V)
print("with positions: 'hot' output same in both orders:", np.allclose(o_p[3], o_r[0]))</div>
  <div class="fx" data-lang="text">no positions: reversed output == original output reversed: True
[[ 0.     1.     0.     1.   ]
 [ 0.841  0.54   0.01   1.   ]
 [ 0.909 -0.416  0.02   1.   ]
 [ 0.141 -0.99   0.03   1.   ]]
with positions: 'hot' output same in both orders: False</div>
  <p>Without positions, reversing the input simply reverses the output rows. Attention is <strong>permutation-equivariant</strong>: it treats the sentence as a bag of tokens. Order has to be written into the vectors before attention sees them. The original Transformer adds to each token's vector a <strong>positional encoding</strong> of the same width, built from sine and cosine waves of different speeds: PE(p, 2i) = sin(p / 10000<sup>2i/d</sup>) and PE(p, 2i+1) = cos(p / 10000<sup>2i/d</sup>). Row p of the printed matrix is the vector added at position p. The values stay between −1 and 1 so they do not swamp the word's meaning, and every position gets its own pattern; the first pair of numbers changes quickly and the second slowly, like the second and hour hands of a clock. Once positions are added, "hot" gets a different output depending on where it sits, as the last line shows.</p>
  <p>Two other schemes are common. BERT and GPT-2 use <strong>learned</strong> positions: a second embedding table with one trainable row per position, up to a maximum length (512 for BERT); simple, but it cannot handle sequences longer than that. Most modern LLMs, including Llama, use <strong>RoPE</strong> (rotary position embedding). Instead of adding a vector, RoPE rotates each pair of numbers in the query and key by an angle proportional to the position. A rotation by mθ dotted with a rotation by nθ depends only on (m − n)θ, so attention scores depend on the <em>distance</em> between tokens rather than their absolute positions:</p>
  <div class="fx" data-lang="py">import numpy as np
def rope(x, pos, theta=0.5):                     # rotate one 2-number pair by pos * theta
    c, s = np.cos(pos * theta), np.sin(pos * theta)
    return np.array([x[0] * c - x[1] * s, x[0] * s + x[1] * c])

q, k = np.array([1.0, 2.0]), np.array([0.5, -1.0])
for m, n in [(1, 3), (5, 7), (10, 12), (1, 4)]:
    print(f"query at {m:2d}, key at {n:2d} (distance {n - m}): score {rope(q, m) @ rope(k, n):.4f}")</div>
  <div class="fx" data-lang="text">query at  1, key at  3 (distance 2): score 0.8725
query at  5, key at  7 (distance 2): score 0.8725
query at 10, key at 12 (distance 2): score 0.8725
query at  1, key at  4 (distance 3): score 1.8889</div>
  <p>The same query and key placed at positions (1, 3), (5, 7) and (10, 12) give exactly the same score, 0.8725, because the distance is 2 each time; at distance 3 the score changes. Sinusoidal and learned encodings stamp each word with its seat number; RoPE turns each word by an angle depending on its seat, so two words compare by how far apart they sit. That is why RoPE models handle relative patterns ("the word two before me") naturally, and why tricks that extend a model's context length work by adjusting θ.</p>

  <h2 id="tf-norm"><span class="num">06</span>Residual Connections and LayerNorm</h2>
  <p>One attention layer works on our toy, but real models stack many: 12 in BERT-base, around 100 in large LLMs, so that later layers can refine what earlier ones built. Training a deep stack runs into two problems. Going backwards, the error signal (the gradient) passes through every layer and can shrink to nothing. Going forwards, activations pass through every layer and can grow without limit. Two small additions fix them, and section 03 already used the first.</p>
  <p>A <strong>residual connection</strong> adds a sub-layer's output to its input instead of replacing it: y = x + f(x). The next block stacks small tanh layers of width 16, with and without the "+ x", and measures the size of the gradient that reaches the input, with the backward pass written out by hand:</p>
  <div class="fx" data-lang="py">import numpy as np
def input_grad(depth, residual, d=16):
    rng = np.random.default_rng(0)
    Ws = [rng.uniform(-1, 1, (d, d)) / np.sqrt(d) for _ in range(depth)]   # PyTorch-style init
    h = rng.normal(size=(4, d)); acts = []
    for W in Ws:                                       # forward: h -&gt; h + tanh(hW) or tanh(hW)
        f = np.tanh(h @ W); acts.append(f)
        h = h + f if residual else f
    g = np.ones_like(h)                                # backward: gradient of sum(output)
    for W, f in zip(reversed(Ws), reversed(acts)):
        g_f = (g * (1 - f ** 2)) @ W.T                 # through tanh and the matrix
        g = g + g_f if residual else g_f               # the residual adds a direct path
    return np.linalg.norm(g)

print("depth   plain     residual")
for depth in (6, 24, 48):
    print(f"{depth:5d}   {input_grad(depth, False):.1e}   {input_grad(depth, True):.1e}")</div>
  <div class="fx" data-lang="text">depth   plain     residual
    6   3.1e-01   1.3e+01
   24   5.8e-06   3.3e+01
   48   2.1e-12   6.3e+01</div>
  <p>Without residuals the gradient at the input shrinks from about 0.3 at 6 layers to about 10<sup>−6</sup> at 24 and 10<sup>−12</sup> at 48: each layer multiplies the signal by a factor below 1, so the first layers would never learn. With the residual, the backward line <code>g = g + g_f</code> shows why it survives: the derivative of x + f(x) is 1 + f'(x), so there is always a direct path that carries the gradient through unchanged. These are the same skip connections that made very deep ResNets trainable. Think of 48 editors working on a menu: without residuals each one rewrites it from scratch and by the twentieth the original is gone; with residuals each one only adds margin notes and the original stays underneath.</p>
  <p>Residuals create the forward problem, though. Every sub-layer adds to the same running vector, called the <strong>residual stream</strong>, and if each addition grows with its input the stream explodes. <strong>Layer normalisation</strong> (LayerNorm) fixes this by rescaling each token's vector to mean 0 and variance 1 before it enters a sub-layer, then applying a learned scale γ and shift β. By hand on the new "hot" from section 03, x = [0.711, 0, 1.144, 0.193]: the mean is 0.512, the deviations are 0.199, −0.512, 0.632 and −0.319, the variance (mean of their squares) is 0.201, and dividing the deviations by √0.201 = 0.448 gives [0.444, −1.143, 1.411, −0.712].</p>
  <div class="fx" data-lang="py">import numpy as np
def layer_norm(x, eps=1e-5):
    mu, var = x.mean(-1, keepdims=True), x.var(-1, keepdims=True)
    return (x - mu) / np.sqrt(var + eps)

def stream_std(depth, norm, d=16):
    rng = np.random.default_rng(0); h = rng.normal(size=(4, d)); out = []
    for _ in range(depth):
        W = rng.uniform(-1, 1, (d, d)) / np.sqrt(d)
        inp = layer_norm(h) if norm else h
        h = h + 2 * inp @ W                            # a sub-layer whose output grows with its input
        out.append(h.std())
    return [float(f"{out[i]:.3g}") for i in (0, 5, 11, 23, 47)]
print("spread after layers 1, 6, 12, 24, 48, no norm :", stream_std(48, False))
print("spread after layers 1, 6, 12, 24, 48, pre-norm:", stream_std(48, True))
x = np.array([0.711, 0.0, 1.144, 0.193])               # the new "hot" from section 03
print("LayerNorm of new hot:", layer_norm(x).round(3), " mean %.3f var %.3f" % (x.mean(), x.var()))</div>
  <div class="fx" data-lang="text">spread after layers 1, 6, 12, 24, 48, no norm : [1.53, 15.4, 159.0, 20800.0, 378000000.0]
spread after layers 1, 6, 12, 24, 48, pre-norm: [1.64, 3.51, 4.71, 6.13, 8.9]
LayerNorm of new hot: [ 0.444 -1.143  1.411 -0.712]  mean 0.512 var 0.201</div>
  <p>The first two lines watch the spread of the residual stream through 48 layers whose output grows with their input. Without normalisation it reaches about 4 × 10<sup>8</sup>; with LayerNorm in front of each sub-layer it grows only slowly, to about 9. Large, unstable activations are exactly what made early deep Transformers diverge. The last line reproduces the hand calculation. LayerNorm works across the numbers of <em>one</em> token, so it behaves the same for any batch size or sentence length, unlike BatchNorm, which averages over the batch. In the editors analogy, LayerNorm is the rule that every margin note is written at the same font size, so no editor can shout over the rest.</p>
  <p>Where the normalisation goes matters. The 2017 Transformer normalised after each sub-layer, LN(x + f(x)), called <strong>post-norm</strong>. Modern LLMs normalise before it, x + f(LN(x)), called <strong>pre-norm</strong>, which keeps a clean residual path from output to input and trains deep stacks more stably. Many also use <strong>RMSNorm</strong>, which skips subtracting the mean and is slightly cheaper.</p>

  <h2 id="tf-ffn"><span class="num">07</span>The Feed-Forward Network</h2>
  <p>Attention only <em>averages</em> value vectors; the output is a weighted mix of what was already there. After attention, "hot" in R3 holds a blend of heat and curry, but turning that blend into a new feature ("this is a chilli complaint") needs a non-linear function of the token's own numbers. That is the job of the <strong>feed-forward network</strong> (FFN), a small two-layer network applied to every token separately with the same weights: widen from d to 4d numbers, apply a non-linearity (GELU, a smooth version of ReLU; Llama-style models use a variant called SwiGLU), and shrink back to d. If attention is the kitchen meeting where everyone shares information, the FFN is each cook returning to their own station to work with what they heard.</p>
  <div class="fx" data-lang="py">from math import erf
gelu = np.vectorize(lambda z: 0.5 * z * (1 + erf(z / np.sqrt(2))))
rng = np.random.default_rng(0); d = 4
W1, b1 = rng.normal(0, 0.5, (d, 4 * d)), np.zeros(4 * d)    # widen d -&gt; 4d
W2, b2 = rng.normal(0, 0.5, (4 * d, d)), np.zeros(d)        # shrink 4d -&gt; d
ffn = lambda H: gelu(H @ W1 + b1) @ W2 + b2                  # applied to every row (token) separately

H = X3 + PE
H2 = H.copy(); H2[0] = 0                                    # change token 1 only
print("FFN output shape:", ffn(H).shape)
print("token 4 unchanged when token 1 changes:", np.allclose(ffn(H)[3], ffn(H2)[3]))
d = 768
print("BERT-base layer: attention", 4 * d * d + 4 * d, " FFN", 2 * d * 4 * d + 4 * d + d)</div>
  <div class="fx" data-lang="text">FFN output shape: (4, 4)
token 4 unchanged when token 1 changes: True
BERT-base layer: attention 2362368  FFN 4722432</div>
  <p>The FFN keeps the shape (4, 4), and changing token 1 leaves token 4's output identical: the FFN never mixes tokens, which is attention's job. The last line counts parameters for one layer at BERT-base width (d = 768): 2.36 million in attention against 4.72 million in the FFN, so about two-thirds of a Transformer's weights live in its FFNs. Studies that probe trained models find that much factual association ("paneer is vegetarian") is stored there. This is also why "attention is all you need" is not literally true: stacks of attention without FFNs lose most of their parameters and their non-linearity, and token vectors collapse towards a uniform average.</p>

  <h2 id="tf-block"><span class="num">08</span>The Transformer Block</h2>
  <p>We now have every part: attention with heads, positions, residuals, LayerNorm and the FFN. A <strong>Transformer block</strong> puts them in a fixed order. In the pre-norm layout used by modern models it is two lines: x ← x + MHA(LN(x)), then x ← x + FFN(LN(x)).</p>
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
  </svg><figcaption>A pre-norm block: each sub-layer reads a normalised copy of x and adds its result back. The shape going in equals the shape coming out, so blocks stack.</figcaption></figure>
  <p>Follow the figure from left to right. The input x is copied around each sub-layer along the top path (the residual). Along the bottom, a normalised copy goes through multi-head attention, which mixes information between tokens, and the result is added back; then a normalised copy of that goes through the FFN, which processes each token on its own, and that result is added back too. The next block runs R4 (with positions added) through one complete block with random weights, two heads and an FFN width of 16, printing the shape after every step:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(1); d, h, ff = 4, 2, 16
P = {name: rng.normal(0, 0.5, shape) for name, shape in
     [("W_Q", (d, d)), ("W_K", (d, d)), ("W_V", (d, d)), ("W_O", (d, d)), ("W1", (d, ff)), ("W2", (ff, d))]}

def block(x, P, mask=None, trace=False):
    show = print if trace else (lambda *a: None)
    show("x            ", x.shape)
    a = layer_norm(x);                                   show("LN1          ", a.shape)
    Q, K, V = a @ P["W_Q"], a @ P["W_K"], a @ P["W_V"];  show("Q, K, V      ", Q.shape)
    heads = []
    for i in range(h):                                   # 2 heads, 2 columns each
        s = slice(2 * i, 2 * i + 2)
        o, A = attention(Q[:, s], K[:, s], V[:, s], mask)
        heads.append(o);                                 show(f"head {i+1}: scores", A.shape, "-&gt; out", o.shape)
    x = x + np.concatenate(heads, 1) @ P["W_O"];         show("x + MHA      ", x.shape)
    f = gelu(layer_norm(x) @ P["W1"]);                   show("FFN hidden   ", f.shape)
    x = x + f @ P["W2"];                                 show("x + FFN (out)", x.shape)
    return x

y = block(X4 + PE, P, trace=True)
print("output row for 'hot':", y[3].round(3))</div>
  <div class="fx" data-lang="text">x             (4, 4)
LN1           (4, 4)
Q, K, V       (4, 4)
head 1: scores (4, 4) -&gt; out (4, 2)
head 2: scores (4, 4) -&gt; out (4, 2)
x + MHA       (4, 4)
FFN hidden    (4, 16)
x + FFN (out) (4, 4)
output row for 'hot': [-2.275 -1.326  0.999  2.617]</div>
  <p>Read the printout as a shape trace. LayerNorm keeps (4, 4). The projections give Q, K and V of (4, 4). Each head sees two columns and builds a 4 × 4 table of scores, the n² part, and outputs (4, 2). Concatenating the heads and multiplying by W<sub>O</sub> returns to (4, 4), and adding x keeps it. The FFN widens to (4, 16) and comes back. The output is (4, 4), the same as the input, which is what lets blocks be stacked any number of times. This is the computation that PyTorch's <code>nn.TransformerEncoderLayer</code> performs with <code>norm_first=True</code> (it adds bias terms and stores the three projection matrices stacked in one tensor). With random weights the output for "hot" means nothing yet; training gives it meaning (section 11).</p>
  <p>A whole Transformer is an embedding layer (plus positions), N identical blocks, and a small output layer for the task. Counting BERT-base this way shows where its famous "110 million parameters" come from:</p>
  <div class="fx" data-lang="py">d, L, ff, vocab, max_pos = 768, 12, 3072, 30522, 512
per_layer = (4 * d * d + 4 * d) + (d * ff + ff + ff * d + d) + 2 * (2 * d)   # MHA + FFN + 2 LayerNorms
emb = vocab * d + max_pos * d + 2 * d + 2 * d                                  # tokens, positions, segments, LN
print(f"per layer {per_layer:,}  x {L} = {L * per_layer:,}  + embeddings {emb:,}  = {L * per_layer + emb:,}")</div>
  <div class="fx" data-lang="text">per layer 7,087,872  x 12 = 85,054,464  + embeddings 23,837,184  = 108,891,648</div>
  <p>Twelve blocks of about 7.09 million weights each give 85 million, and the embedding tables (30,522 tokens, 512 positions, 2 segment types) add 23.8 million, for 108.9 million; BERT's small final "pooler" layer (about 0.6 million) brings it to the 110 million usually quoted. Early layers tend to capture local and grammatical patterns, later ones more task-level meaning.</p>

  <h2 id="tf-arch"><span class="num">09</span>Encoders, Decoders and the Causal Mask</h2>
  <p>Biteful has three jobs: route a complaint (read R4 and label it), write a reply to the customer (generate text), and translate R4 into Hindi for a local kitchen. All three use the same block; what differs is how blocks are wired, and that comes down to one question: <strong>may a token look at the tokens after it?</strong></p>
  <table class="tbl">
    <tr><th></th><th>Encoder-only</th><th>Decoder-only</th><th>Encoder–decoder</th></tr>
    <tr><td>Examples</td><td>BERT, RoBERTa</td><td>GPT, Llama, Claude</td><td>T5, BART, the 2017 original</td></tr>
    <tr><td>Attention</td><td>bidirectional: every token sees every token</td><td>causal: each token sees itself and earlier tokens</td><td>encoder bidirectional; decoder causal plus cross-attention</td></tr>
    <tr><td>Output</td><td>a contextual vector per input token</td><td>probabilities for the next token</td><td>a target sequence</td></tr>
    <tr><td>Biteful job</td><td>route R4, tag dish names, embeddings for search</td><td>write the reply; most tasks via prompting</td><td>translate R4, summarise reviews</td></tr>
  </table>
  <p>An encoder is like a manager who reads the whole complaint before deciding who should handle it. A decoder is a writer composing a reply left to right, unable to see words not yet written. An encoder–decoder is a translator who reads the source fully, then writes while glancing back at it. Encoders are far from obsolete: small encoders still power the embeddings, rerankers and classifiers behind <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a> at a fraction of an LLM's cost.</p>
  <p>What makes a decoder causal? A decoder learns to write by predicting each next word of "chai was too hot". If, while learning to predict "hot", position 3 ("too") could attend to position 4 ("hot"), it would simply copy the answer. The <strong>causal mask</strong> forbids this: before softmax, every score that points to a later position is set to −∞. Since e<sup>−∞</sup> = 0, those positions get weight exactly 0 and softmax spreads the whole weight over the allowed positions, which form the lower triangle of the score table. By hand with the weights from section 03: "chai" may see only itself, so its row is [1, 0, 0, 0]; "was" has a zero query, so its two allowed scores are equal and its row is [0.5, 0.5, 0, 0]; "hot" may see everything, so its row is unchanged.</p>
  <div class="fx" data-lang="py">causal = np.tril(np.ones((4, 4), dtype=bool))             # True = allowed (lower triangle)
_, A_causal = attention(X4 @ W_Q, X4 @ W_K, X4 @ W_V, mask=causal)
print("causal weights (rows: chai, was, too, hot):\\n", A_causal)
_, A_full = attention(X4 @ W_Q, X4 @ W_K, X4 @ W_V)
print("mask AFTER softmax, row sums:", (A_full * causal).sum(1).round(3))    # the classic bug</div>
  <div class="fx" data-lang="text">causal weights (rows: chai, was, too, hot):
 [[1.    0.    0.    0.   ]
 [0.5   0.5   0.    0.   ]
 [0.576 0.212 0.212 0.   ]
 [0.711 0.096 0.096 0.096]]
mask AFTER softmax, row sums: [0.25  0.5   0.825 1.   ]</div>
  <p><code>np.tril</code> builds the lower-triangular "allowed" matrix, and the <code>np.where(mask, S, -np.inf)</code> line inside <code>attention</code> blocks the rest before softmax. The rows match the hand values and each still sums to 1. The last line shows a classic bug: zeroing weights <em>after</em> softmax leaves rows that no longer sum to 1 (0.25 for "chai"), so early positions get shrunken outputs. A cricket commentator may talk about every ball already bowled but never the next one; the mask enforces that during training, so the model learns exactly the job it will do when generating.</p>
  <p>The mask also makes decoder training efficient. One forward pass over "chai was too hot" trains several predictions at once (after "chai" comes "was", after "chai was" comes "too", and so on), each row seeing only its own past. Training is parallel even though generation is sequential. A related <strong>padding mask</strong> works the same way to hide the filler tokens added to make sentences in a batch the same length.</p>

  <h2 id="tf-cross"><span class="num">10</span>Cross-Attention</h2>
  <p>A decoder can now write left to right using its own past. But a translator writing the Hindi "chai bahut garam thi" ("chai was very hot") must also read the English "chai was too hot", a different sequence. While writing "garam", the decoder needs the English word that means it, and its own past ("chai bahut") does not contain it. <strong>Cross-attention</strong> solves this by splitting the roles across two sequences: the queries come from the decoder (the sentence being written), while the keys and values come from the encoder's output (the sentence being read). It is the same formula with different sources; in fact it is the original attention mechanism from translation models, in Transformer form.</p>
  <p>In the next block the encoder's output for R4 is stood in for by the R4 word vectors, and the decoder's four queries are written by hand to say what each Hindi word needs: "chai" looks for the drink, "bahut" (very) for the intensifier, "garam" (hot) for heat, "thi" (was) for filler.</p>
  <div class="fx" data-lang="py">enc_out = X4                                          # stand-in for the encoder's output on R4
Q_dec = np.array([[0, 2.0, 0, 0],                     # chai  -&gt; looks for the drink
                  [0, 0, 1.0, 2.0],                   # bahut ("very") -&gt; looks for the intensifier
                  [0, 0, 3.0, 0],                     # garam ("hot") -&gt; looks for heat
                  [0, 0, 0, 2.0]])                    # thi ("was") -&gt; looks for filler / verb
out, A_cross = attention(Q_dec, enc_out, enc_out)     # Q from decoder; K, V from encoder
print("rows = chai, bahut, garam, thi; columns = chai, was, too, hot\\n", A_cross)</div>
  <div class="fx" data-lang="text">rows = chai, bahut, garam, thi; columns = chai, was, too, hot
 [[0.475 0.175 0.175 0.175]
 [0.113 0.307 0.394 0.186]
 [0.116 0.116 0.246 0.521]
 [0.134 0.366 0.366 0.134]]</div>
  <p>Each row is a Hindi word and each column an English word. "garam" puts its largest weight, 0.521, on "hot"; "bahut" puts its largest on "too"; "chai" on "chai"; and "thi" splits evenly between "was" and "too" because our toy's single filler number cannot tell them apart. With sentences of different lengths the weight table would be target length × source length. Cross-attention is not causally masked, since the whole source sentence is known. The translator writing in her notebook keeps glancing at the original complaint: what she glances <em>for</em> comes from what she is writing now (the query), and what she finds comes from the original (keys and values). In a real encoder–decoder, each decoder block therefore has three sub-layers: masked self-attention over the Hindi written so far, cross-attention over the English, and the FFN. Decoder-only LLMs have no cross-attention at all; they "translate" by putting the source text into the prompt, so ordinary causal self-attention reads it.</p>

  <h2 id="tf-pretrain"><span class="num">11</span>Pretraining Objectives</h2>
  <p>The architecture is complete, but every weight so far was hand-set or random. Where do good weights come from, given that nobody labels billions of sentences? Like Word2Vec in NLP Foundations, a Transformer invents its own task from raw text, which is called <strong>self-supervised</strong> training. There are two main tasks, matched to the two wirings.</p>
  <p><strong>Next-token prediction</strong>, used by decoders such as GPT, asks the model at every position to predict the token that comes next. The targets are just the input shifted by one position, so every review provides a training example at every position. The question the model must answer is what makes it powerful, and you can see it by counting what follows different contexts in Biteful's synthetic reviews:</p>
  <div class="fx" data-lang="py">from biteful_tf import make_reviews
from collections import Counter
import numpy as np
reviews = make_reviews(4000)                         # same synthetic Biteful reviews as NLP Foundations

seq = ["&lt;bos&gt;"] + "chai was too hot".split() + ["&lt;eos&gt;"]
x, y = seq[:-1], seq[1:]                             # target = input shifted by one position
print(list(zip(x, y)))

def next_word_dist(context, k=3):                         # what follows this exact context, by counting
    c = Counter(s[i + len(context)] for s in reviews for i in range(len(s) - len(context))
                if s[i:i + len(context)] == context)
    total = sum(c.values())
    return [(w, round(n / total, 2)) for w, n in c.most_common(k)]
print("after 'too'           :", next_word_dist(["too"], k=5))
print("after 'curry was too' :", next_word_dist("curry was too".split()))
print("after 'chai was too'  :", next_word_dist("chai was too".split()))
print("loss if p(correct) = 0.6, 0.9, 0.05:", [round(float(-np.log(p)), 3) for p in (0.6, 0.9, 0.05)])</div>
  <div class="fx" data-lang="text">[('&lt;bos&gt;', 'chai'), ('chai', 'was'), ('was', 'too'), ('too', 'hot'), ('hot', '&lt;eos&gt;')]
after 'too'           : [('hot', 0.35), ('spicy', 0.23), ('fiery', 0.21), ('steaming', 0.11), ('warm', 0.1)]
after 'curry was too' : [('spicy', 0.43), ('hot', 0.31), ('fiery', 0.26)]
after 'chai was too'  : [('hot', 0.39), ('warm', 0.32), ('steaming', 0.3)]
loss if p(correct) = 0.6, 0.9, 0.05: [0.511, 0.105, 2.996]</div>
  <p>The first line shows the shift: from "chai was too hot" with start and end markers, the pairs are (⟨bos⟩, chai), (chai, was), (was, too), (too, hot) and (hot, ⟨eos⟩). The next three lines show why context matters. Knowing only the previous word "too", the next word could be a chilli word or a temperature word. Knowing the whole prefix, the answer splits cleanly: after "curry was too" come spicy, hot and fiery; after "chai was too" come hot, warm and steaming. To predict well, a model must use the word three positions back, which is exactly what attention lets "too" (and later "hot") do. Training measures success with <strong>cross-entropy loss</strong>, −ln of the probability the model gave the correct token: 0.511 if it gave "hot" a probability of 0.6, 0.105 for 0.9, and almost 3 for 0.05. Lowering this loss over billions of positions is the whole of pretraining.</p>
  <p><strong>Masked language modelling</strong> (MLM), used by encoders such as BERT, hides about 15% of the tokens and asks the model to predict them from <em>both</em> sides. An encoder cannot use next-token prediction, because it sees the whole sentence: predicting "hot" when "hot" is visible would be trivial. Of the chosen tokens, 80% are replaced with [MASK], 10% with a random word and 10% are left unchanged, so the model cannot rely on [MASK] always marking the spot (it never appears in real use):</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(3)
toks = "the curry was too spicy for me and the chai arrived cold , terrible".split()
pick = rng.random(len(toks)) &lt; 0.15                  # choose about 15% of positions
r = rng.random(len(toks))
inp = [("[MASK]" if r[i] &lt; 0.8 else rng.choice(toks) if r[i] &lt; 0.9 else t) if pick[i] else t
       for i, t in enumerate(toks)]                  # 80% [MASK], 10% random word, 10% unchanged
print("input :", " ".join(inp))
print("targets:", [(i, t) for i, t in enumerate(toks) if pick[i]])</div>
  <div class="fx" data-lang="text">input : [MASK] curry was too [MASK] for me and the [MASK] arrived cold , terrible
targets: [(0, 'the'), (4, 'spicy'), (9, 'chai')]</div>
  <p>Three positions were chosen and all three happened to become [MASK]; the model must recover "the", "spicy" and "chai" from the surrounding words, and "chai" in particular needs words on its right ("arrived cold"). MLM gives better <em>understanding</em> vectors because it reads both sides, which is why encoders are used for classification and embeddings; next-token prediction gives a model that can <em>generate</em>, and it learns from every position rather than 15% of them. MLM is a fill-in-the-blanks worksheet with the whole sentence visible; next-token prediction is dictation.</p>
  <p>Does training a real Transformer on next-token prediction actually separate the two "hot"s? The code below is a tiny GPT in PyTorch (not run on this page): two pre-norm blocks of width 32 with a causal mask, learned positions, and a training loop whose key line is the shift <code>x, y = b[:, :-1], b[:, 1:]</code>. Trained for 800 steps on the 4,000 synthetic reviews, it has about 29,000 parameters and takes seconds on a CPU.</p>
  <div class="fx" data-lang="py">import torch, torch.nn as nn, torch.nn.functional as F

class TinyGPT(nn.Module):
    def __init__(self, V, d=32, heads=2, layers=2, max_len=16):
        super().__init__()
        self.tok, self.pos = nn.Embedding(V, d), nn.Embedding(max_len, d)   # learned positions
        block = nn.TransformerEncoderLayer(d, heads, 4 * d, dropout=0.0, batch_first=True,
                                           norm_first=True, activation="gelu")
        self.blocks = nn.TransformerEncoder(block, layers)
        self.norm, self.head = nn.LayerNorm(d), nn.Linear(d, V)

    def forward(self, x, hidden=False):
        n = x.shape[1]
        h = self.tok(x) + self.pos(torch.arange(n))
        mask = nn.Transformer.generate_square_subsequent_mask(n)          # causal mask
        h = self.norm(self.blocks(h, mask=mask, is_causal=True))
        return h if hidden else self.head(h)                               # logits over the vocabulary

def train(model, data, steps=800):
    """data: (num_reviews, max_len) token IDs, -1 = padding."""
    opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
    for step in range(steps):
        b = data[torch.randint(0, len(data), (64,))]
        x, y = b[:, :-1].clamp(min=0), b[:, 1:]                            # shift by one
        loss = F.cross_entropy(model(x).reshape(-1, model.head.out_features),
                               y.reshape(-1), ignore_index=-1)
        opt.zero_grad(); loss.backward(); opt.step()
    return loss.item()

def contextual_vector(model, ids, position):           # final hidden vector of one token
    with torch.no_grad():
        return model(ids, hidden=True)[0, position]</div>
  <p>After training, you can ask for the next-word probabilities after a prefix, and use <code>contextual_vector</code> to read the model's final hidden vector at the position of "hot" in R3 and in R4, then compare each with the vector of "spicy" or "warm" in the same slot. A typical run looks like this:</p>
  <div class="fx" data-lang="text">step 799  next-token loss 0.953
'curry was too' -&gt; [('spicy', 0.39), ('hot', 0.35), ('fiery', 0.25)]
'chai was too'  -&gt; [('steaming', 0.37), ('warm', 0.34), ('hot', 0.28)]
contextual hot: R3 vs R4 cosine 0.235
hot in R3 ~ spicy 0.960 | ~ warm 0.184
hot in R4 ~ spicy 0.090 | ~ warm 0.901</div>
  <p>The loss settles a little below 1 rather than 0, because the templates leave genuine uncertainty (which filling, which praise word). The model has learned that what follows "too" depends on the dish three words back. And the payoff of this note and the previous one: the input embedding of "hot" is a single row, identical in both reviews, but after two blocks the two contextual "hot"s have a cosine of only about 0.24 with each other. The "hot" in R3 sits next to "spicy" and the "hot" in R4 next to "warm". The context problem from NLP Foundations is solved by next-word prediction alone.</p>

  <h2 id="tf-llm"><span class="num">12</span>From Transformer to LLM</h2>
  <p>A model that outputs one probability distribution over the next token is not yet a chatbot. Writing a whole reply is a loop: run the model on the text so far, pick a token from its distribution, append it, and repeat until an end token appears. Each generated token is fed back as input, which is called <strong>autoregressive</strong> generation. Picking the most likely token every time is <strong>greedy decoding</strong>; drawing at random according to the probabilities is <strong>sampling</strong>, with settings such as temperature and top-p controlling how adventurous it is. The next block shows the loop with a deliberately weak stand-in for the decoder: a table of which word followed each pair of words in the synthetic reviews.</p>
  <div class="fx" data-lang="py">import random
def next_token_probs(ids):                          # stand-in for a trained decoder: counts of what
    ctx = ids[-2:]                                  # followed the last two words in the corpus
    c = Counter(s[i + 2] for s in padded for i in range(len(s) - 2) if s[i:i + 2] == ctx)
    total = sum(c.values())
    return {w: n / total for w, n in c.items()}

padded = [["&lt;bos&gt;", "&lt;bos&gt;"] + s + ["&lt;eos&gt;"] for s in reviews]

def generate(prompt, seed, max_new=10):
    rng = random.Random(seed)
    ids = ["&lt;bos&gt;", "&lt;bos&gt;"] + prompt.split()
    for _ in range(max_new):
        probs = next_token_probs(ids)                       # 1. run the model on the text so far
        nxt = rng.choices(list(probs), weights=list(probs.values()))[0]   # 2. sample one token
        if nxt == "&lt;eos&gt;":
            break
        ids.append(nxt)                                     # 3. append it and repeat
    return " ".join(ids[2:])

for seed in range(3):
    print(generate("the chai", seed))
print(generate("paneer kathi", 0))</div>
  <div class="fx" data-lang="text">the chai was steaming and great
the chai was warm and great
the chai was warm and amazing
paneer kathi , not too hot to drink</div>
  <p>Each line is the same loop with a different random seed, so the sampled words differ. The first three read like real reviews. The last one, "paneer kathi , not too hot to drink", shows what the stand-in lacks: it sees only the last two words, so after "too hot" it happily continues a drink template even though the review is about a kathi. A Transformer decoder plugged into the same loop reads the entire prefix through attention, which is precisely what keeps long outputs coherent. An LLM is this loop with a far better model.</p>
  <table class="tbl">
    <tr><th>Model</th><th>Blocks × width</th><th>Parameters</th><th>Training text</th></tr>
    <tr><td>Tiny GPT above</td><td>2 × 32</td><td>~29 thousand</td><td>4,000 template reviews</td></tr>
    <tr><td>BERT-base (2018, encoder)</td><td>12 × 768</td><td>110 million</td><td>~3.3 billion words</td></tr>
    <tr><td>GPT-2 (2019)</td><td>12–48 × 768–1,600</td><td>124 million – 1.5 billion</td><td>~40 GB of web text</td></tr>
    <tr><td>GPT-3 (2020)</td><td>96 × 12,288</td><td>175 billion</td><td>~300 billion tokens</td></tr>
    <tr><td>Llama 3 8B (2024)</td><td>32 × 4,096</td><td>8 billion</td><td>~15 trillion tokens</td></tr>
  </table>
  <p>Three ingredients turn the toy into an assistant, all covered in <a class="xref" data-note="llm_basics">How LLMs Work</a>. <strong>Scale</strong>: more blocks, wider vectors and vastly more varied text, with abilities such as following a format or doing arithmetic appearing only at scale. <strong>Instruction tuning</strong>: further training on prompt and good-answer pairs, so the model answers a question instead of merely continuing the text. <strong>Preference tuning</strong>: training on which of two answers people prefer (RLHF and related methods). A <strong>large language model</strong> is therefore a decoder-only Transformer pretrained with next-token prediction on huge amounts of text, then instruction- and preference-tuned, and used autoregressively. Decoder-only won for general-purpose models because one simple objective scales well and almost any task can be phrased as continuing a text.</p>
  <p>Serving adds one important optimisation, the <strong>KV cache</strong>. Because of the causal mask, the keys and values of earlier tokens never change as new tokens are added, so they are stored and reused, and each new token costs one new row of attention instead of recomputing the whole sequence. The cache grows with the length of the conversation, which is one reason long contexts use a lot of memory.</p>

  <h2 id="tf-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>Mask mistakes are the most common and the most silent. Masking after softmax instead of before leaves rows that do not sum to 1, as section 09 showed. Mask conventions also differ between libraries: in PyTorch's <code>nn.MultiheadAttention</code> a boolean True means <em>blocked</em>, while in <code>F.scaled_dot_product_attention</code> True means <em>allowed</em> (the NumPy function in this note uses "allowed"). Neither mistake crashes. Print the weights for a four-token example and check that the first row is [1, 0, 0, 0] before trusting a mask. Training a decoder without the causal mask is worse still: each position learns to copy the next token, the training loss looks excellent, and generation produces nonsense because the shortcut disappears.</p>
  <p>Scaling mistakes are the next family. Forgetting to divide by √d<sub>k</sub> saturates softmax; dividing by d<sub>k</sub> instead over-flattens it; and the d<sub>k</sub> in question is the width of one head, not the model width. Again nothing crashes; the model just learns badly.</p>
  <p>Shape mistakes appear when writing a block by hand. A residual needs the sub-layer's output to have the same shape as its input, which is why W<sub>O</sub> and the FFN's second matrix map back to d<sub>model</sub>, and the model width must be divisible by the number of heads. PyTorch's <code>nn.TransformerEncoderLayer</code> also has two surprising defaults: <code>norm_first=False</code> (post-norm, the 2017 layout) and <code>batch_first=False</code> (inputs shaped as sequence, batch, width).</p>
  <p>Finally, two misreadings. Attention weights are not an explanation of a model's decision: later layers, other heads and the residual path change the picture, so treat them as hints. And forgetting positional information entirely gives a model that cannot tell "dog bites man" from "man bites dog".</p>

  <h2 id="tf-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Contextual representation</b>: a vector per token occurrence, computed from the whole input.</li>
    <li><b>Self-attention</b>: each output row is a weighted average of all value rows; weights = softmax of query–key scores.</li>
    <li><b>Query / key / value</b>: what a token looks for / is found by / hands over; learned projections of its vector.</li>
    <li><b>Multi-head attention</b>: h attentions on slices of width d/h, concatenated, mixed by W<sub>O</sub>.</li>
    <li><b>Positional encoding</b>: injects order; sinusoidal, learned table, or RoPE (rotation, relative distance).</li>
    <li><b>Residual connection</b>: y = x + f(x); a direct gradient path. <b>Residual stream</b>: the running vector.</li>
    <li><b>LayerNorm</b>: per-token rescale to mean 0, variance 1, then γ, β. Pre-norm: x + f(LN(x)).</li>
    <li><b>FFN</b>: per-token d → 4d → d with GELU; about two-thirds of the parameters.</li>
    <li><b>Causal mask</b>: −∞ above the diagonal before softmax. <b>Cross-attention</b>: Q from decoder, K and V from encoder.</li>
    <li><b>Next-token prediction</b> (decoders) vs <b>masked LM</b> (encoders; 15%, 80/10/10).</li>
    <li><b>KV cache</b>: stored keys and values of past tokens, reused during generation.</li>
  </ul>
  <h3>Formulas and shapes</h3>
  <div class="fx" data-lang="text">Q = X W_Q,  K = X W_K,  V = X W_V              X: n × d
Attention   = softmax(Q Kᵀ / √d_k + M) V          scores n × n;  M = 0 or −∞ (mask)
MultiHead   = Concat(head_1..head_h) W_O          params 4d² + 4d for any h
PE(p, 2i)   = sin(p / 10000^(2i/d)),  PE(p, 2i+1) = cos(...)
LayerNorm   = γ (x − μ) / √(σ² + ε) + β           over the d numbers of one token
FFN(x)      = W₂ GELU(W₁ x + b₁) + b₂              d → 4d → d
Block       x ← x + MHA(LN x);  x ← x + FFN(LN x)  shape n × d kept
Loss        = −Σ ln p(correct token)               cross-entropy</div>
  <h3>The three families</h3>
  <table class="tbl">
    <tr><th>Family</th><th>Attention</th><th>Pretraining</th><th>Use for</th></tr>
    <tr><td>Encoder (BERT)</td><td>bidirectional</td><td>masked LM</td><td>classification, tagging, embeddings, reranking</td></tr>
    <tr><td>Decoder (GPT, Llama, Claude)</td><td>causal</td><td>next token</td><td>generation, chat, most tasks via prompting</td></tr>
    <tr><td>Encoder–decoder (T5, BART)</td><td>bidirectional + causal + cross</td><td>span corruption</td><td>translation, summarisation</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Attention costs O(n²) in sequence length.</li>
    <li>Scale by √d<sub>k</sub> of one head; mask before softmax; check the True = blocked/allowed convention.</li>
    <li>d<sub>model</sub> must divide by the number of heads.</li>
    <li>Attention is order-blind without positions.</li>
    <li>Decoder-only models have no cross-attention.</li>
    <li>Training is parallel; generation is token by token.</li>
  </ul>

  <h2 id="tf-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why did Transformers replace RNNs?</summary><div class="qa-body">RNNs process tokens one after another, so they cannot use GPU parallelism, and their single memory vector fades over long text. Transformers process all positions at once and connect any two tokens in one step through attention. The cost is O(n²) attention in sequence length.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain queries, keys and values in plain English.</summary><div class="qa-body">Each token makes three versions of itself with learned matrices. The query says what it is looking for, the key says what it can be found by, and the value is what it passes on if chosen. Query–key dot products give relevance scores, softmax turns them into weights, and the output is the weighted sum of values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use the raw token vectors as queries, keys and values?</summary><div class="qa-body">Then every token's query equals its key, so it attends most to itself and to similar tokens; similarity is not relevance. Separate learned projections let a token ask a different question from the one it answers, for example "hot" asking "which food or drink is near me?".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why divide attention scores by √d<sub>k</sub>?</summary><div class="qa-body">A dot product of d<sub>k</sub> random terms has a spread that grows like √d<sub>k</sub>. Large scores saturate softmax so one weight is nearly 1 and the gradient almost vanishes. Dividing by √d<sub>k</sub> keeps scores near unit spread so attention stays a trainable mix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is multi-head attention, and why does it cost no more than one head?</summary><div class="qa-body">The model width is split into h slices, attention runs on each slice separately, and the results are concatenated and mixed by W<sub>O</sub>. Each head can learn a different relation. The four d × d matrices have the same size however they are sliced, so parameters stay at 4d² + 4d.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a Transformer need positional encodings? Compare the main kinds.</summary><div class="qa-body">Attention is permutation-equivariant: shuffling the input just shuffles the output, so order must be injected. Sinusoidal encodings add fixed sine and cosine waves; learned encodings add a trainable vector per position up to a maximum length; RoPE rotates queries and keys so scores depend on relative distance, which most modern LLMs use.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do residual connections and LayerNorm each do?</summary><div class="qa-body">Residuals compute x + f(x), giving the gradient a direct path through every layer so deep stacks do not suffer vanishing gradients. LayerNorm rescales each token's vector to mean 0 and variance 1 before a sub-layer, keeping the growing residual stream from exploding. Each needs the other in a deep model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pre-norm vs post-norm?</summary><div class="qa-body">Post-norm, from the 2017 paper, is LN(x + f(x)). Pre-norm, used by modern LLMs, is x + f(LN(x)). Pre-norm keeps an unnormalised residual path from output to input, so very deep stacks train more stably with less careful warm-up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the feed-forward network do that attention cannot?</summary><div class="qa-body">Attention mixes information between tokens as a weighted average, which is linear in the values. The FFN applies a non-linear transformation to each token independently (d → 4d → GELU → d). It holds about two-thirds of the parameters and much of the stored knowledge.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through one pre-norm Transformer block with shapes.</summary><div class="qa-body">Input n × d. LayerNorm, then project to Q, K, V (n × d each), split into h heads of width d/h, compute n × n scores per head, softmax, multiply by V, concatenate back to n × d, multiply by W<sub>O</sub> and add the input. Then LayerNorm, FFN to n × 4d and back to n × d, and add again. Output n × d.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Encoder vs decoder vs encoder–decoder: when do you use each?</summary><div class="qa-body">Encoders (BERT) see the whole input in both directions and are used for classification, tagging and embeddings. Decoders (GPT, Claude) see only the past and are used for generation and general prompting. Encoder–decoders (T5, BART) read one sequence and write another through cross-attention, for translation and summarisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the causal mask work, and what are the weights for four tokens whose queries are all zero?</summary><div class="qa-body">Scores pointing to later positions are set to −∞ before softmax, so they get weight 0 and each row spreads its weight over the allowed past positions. With zero queries all allowed scores are equal, giving [1, 0, 0, 0], [½, ½, 0, 0], [⅓, ⅓, ⅓, 0] and [¼, ¼, ¼, ¼].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is cross-attention?</summary><div class="qa-body">Attention whose queries come from the decoder and whose keys and values come from the encoder's output, so the sentence being written can read the sentence being translated. Its weight table is target length × source length and it is not causally masked. Decoder-only LLMs do not have it; they read the source from the prompt.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why was BERT trained with masked language modelling instead of next-token prediction?</summary><div class="qa-body">BERT's attention is bidirectional, so the next token is visible and predicting it would be trivial. Masking about 15% of tokens (80% [MASK], 10% random, 10% unchanged) forces it to use context from both sides, which produces strong representations for understanding tasks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time and memory cost of self-attention?</summary><div class="qa-body">O(n²·d) time and O(n²) memory for the score table, per head per layer, for n tokens. Doubling the context roughly quadruples the attention work. FlashAttention reduces memory traffic by computing in tiles, and the KV cache avoids recomputation during generation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the KV cache?</summary><div class="qa-body">During generation, the keys and values of earlier tokens never change because of the causal mask, so they are stored and reused. Each new token then needs only its own query, key and value and one row of attention. It speeds generation greatly but uses memory that grows with the context length.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a pretrained decoder become an assistant like Claude?</summary><div class="qa-body">The same architecture is scaled up and pretrained with next-token prediction on huge amounts of text, then instruction-tuned on prompt and answer pairs so it answers rather than continues, then preference-tuned (RLHF or similar) on which answers people prefer. It generates autoregressively, sampling one token at a time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What breaks if a GPT is trained without the causal mask?</summary><div class="qa-body">Each position can see the token it is supposed to predict and learns to copy it, so the training loss looks excellent. At generation time the future does not exist, the shortcut disappears, and the output is nonsense: a mismatch between training and use.</div></details>
</main>
`
});
