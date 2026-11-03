// notes/genai/vectordb.js — Embeddings & Vector DBs
Object.assign(TOPIC_CONTENT, {
  "vectordb": `<main>
  <h1>Embeddings &amp; Vector DBs</h1>
  <div class="where"><span>Generative AI</span><span>Embeddings &amp; Vector DBs</span></div>
  <p class="lead">A vector database lets a computer search by <em>meaning</em> instead of by exact words. Every piece of text is turned into a list of numbers, called an embedding, chosen so that texts with similar meaning get similar numbers; searching then means finding the stored lists that are closest to the query's list, quickly, among millions, and usually with filters such as "veg only". This is the search engine inside every RAG system (<a class="xref" data-note="rag">Retrieval-Augmented Generation</a>), and behind "similar items" features in shops and apps. Our running example is Biteful's menu search: a customer types "fiery paneer wrap", but the menu calls the dish "spicy paneer roll", and we want the search to find it anyway. We will start with a 12-dish menu small enough to check by hand, then move to 100,000 synthetic vectors wherever an idea only matters at scale. It builds on the word vectors and cosine similarity of <a class="xref" data-note="nlp">NLP Foundations</a>.</p>

  <h2 id="vd-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Embeddings &amp; Vector DBs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Meaning as geometry</div>
        <ul>
          <li>Keyword search matches words, not meaning</li>
          <li><b>Embedding</b>: one unit vector per text; similar meaning = nearby</li>
          <li>Same model for documents and queries, always</li>
          <li>Unit vectors: cosine = dot product, and L2 ranks the same</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Making search fast</div>
        <ul>
          <li><b>Flat</b>: compare with every vector; exact; cost grows with N</li>
          <li><b>IVF</b>: k-means cells, search the nprobe nearest</li>
          <li><b>HNSW</b>: layered neighbour graph, walk towards the query</li>
          <li><b>PQ</b>: compress each vector to a few bytes, re-rank</li>
          <li>Quality is measured as <b>recall@k</b> against flat search</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Real queries</div>
        <ul>
          <li>Post-filtering selective filters returns nothing</li>
          <li>Pre-filter or filter during the search</li>
          <li><b>Hybrid</b>: dense + keyword, fused with RRF</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tools</div>
        <ul>
          <li>FAISS is a library; Chroma, Qdrant, Weaviate, Milvus are databases</li>
          <li>pgvector adds vectors to Postgres; <code>&lt;=&gt;</code> is cosine distance</li>
          <li>Choose by scale, filters and who runs it</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="vd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Keyword Search Is Not Enough</span><span class="rm-sub">the menu search that finds the wrong wrap</span></div></div>
      <div class="rm-item rm-done" data-target="vd-emb"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Embeddings</span><span class="rm-sub">turning text into points in space</span></div></div>
      <div class="rm-item rm-done" data-target="vd-sim"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Similarity Metrics</span><span class="rm-sub">cosine, dot product and distance</span></div></div>
      <div class="rm-item rm-done" data-target="vd-brute"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Exact Search and Its Cost</span><span class="rm-sub">why comparing with everything breaks</span></div></div>
      <div class="rm-item rm-done" data-target="vd-ann"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Approximate Search and Recall</span><span class="rm-sub">giving up a little accuracy for speed</span></div></div>
      <div class="rm-item rm-done" data-target="vd-ivf"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">IVF</span><span class="rm-sub">search only the nearest clusters</span></div></div>
      <div class="rm-item rm-done" data-target="vd-hnsw"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">HNSW</span><span class="rm-sub">walk a layered graph to the answer</span></div></div>
      <div class="rm-item rm-done" data-target="vd-pq"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Product Quantisation</span><span class="rm-sub">squeezing vectors into a few bytes</span></div></div>
      <div class="rm-item rm-done" data-target="vd-choose"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Choosing an Index</span><span class="rm-sub">recall, speed and memory side by side</span></div></div>
      <div class="rm-item rm-done" data-target="vd-filter"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Metadata Filtering</span><span class="rm-sub">meaning plus "veg only"</span></div></div>
      <div class="rm-item rm-done" data-target="vd-hybrid"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Hybrid Search</span><span class="rm-sub">meaning and exact words together</span></div></div>
      <div class="rm-item rm-done" data-target="vd-tools"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Vector Databases in Practice</span><span class="rm-sub">the tools, and the menu in pgvector</span></div></div>
      <div class="rm-item rm-done" data-target="vd-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">mixed models, wrong metric, post-filtering</span></div></div>
      <div class="rm-item rm-done" data-target="vd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, index table</span></div></div>
      <div class="rm-item rm-done" data-target="vd-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about vector search</span></div></div>
    </div>
  </div>

  <h2 id="vd-why"><span class="num">01</span>Why Keyword Search Is Not Enough</h2>
  <p>Biteful's menu has 12 dishes from four restaurants, and each dish has the details a real search needs: whether it is vegetarian, which restaurant sells it, and its price. A customer types "fiery paneer wrap". No dish has exactly those words, but anyone reading the menu can see that "spicy paneer roll" is what they want. Let us see what an ordinary keyword search does with it.</p>
  <p>The standard keyword method is <strong>TF-IDF</strong> (term frequency, inverse document frequency), which you met in <a class="xref" data-note="nlp">NLP Foundations</a>. Every distinct word on the menu becomes one axis, each dish becomes a vector that counts its words, and rare words are given more weight than common ones because they say more about a dish. Two texts score highly if they share words, especially rare ones.</p>
  <div class="fx" data-lang="py">import numpy as np, re, math, time
menu = [  # (dish, veg?, restaurant, price in rupees)
    ("spicy paneer roll", True, "Tandoor Tales", 149),    ("mild chicken wrap", False, "Wrap Republic", 169),
    ("fiery chicken kathi", False, "Tandoor Tales", 179),  ("mild veg kathi", True, "Wrap Republic", 129),
    ("spicy chicken biryani", False, "Biryani Bros", 249), ("mild paneer tikka masala", True, "Biryani Bros", 229),
    ("hot masala chai", True, "Steam House", 49),          ("cold coffee", True, "Steam House", 99),
    ("steaming filter coffee", True, "Steam House", 79),   ("warm tomato soup", True, "Steam House", 109),
    ("egg roll", False, "Wrap Republic", 99),              ("mild veg curry", True, "Biryani Bros", 189),
]
names = [m[0] for m in menu]

# TF-IDF keyword search: one axis per word, rare words weigh more
words = sorted({w for n in names for w in n.split()})
idf = {w: math.log(len(names) / sum(w in n.split() for n in names)) + 1 for w in words}
def tfidf(text):
    v = np.array([text.split().count(w) * idf[w] for w in words])
    return v / (np.linalg.norm(v) or 1)
T = np.stack([tfidf(n) for n in names])

def keyword_search(query, k=3):
    s = T @ tfidf(query)
    top = np.argsort(-s, kind="stable")[:k]
    return [(names[i], round(float(s[i]), 3)) for i in top]

for q in ["fiery paneer wrap", "something hot to drink"]:
    print(f"{q!r:25} -&gt;", keyword_search(q))</div>
  <div class="fx" data-lang="text">'fiery paneer wrap'       -&gt; [('mild chicken wrap', 0.455), ('fiery chicken kathi', 0.423), ('spicy paneer roll', 0.285)]
'something hot to drink'  -&gt; [('hot masala chai', 0.615), ('spicy paneer roll', 0.0), ('mild chicken wrap', 0.0)]</div>
  <p>For "fiery paneer wrap" the top result is "mild chicken wrap", which is the opposite of what the customer asked for. It wins because it shares the word "wrap", which appears only twice on the menu and so carries a lot of weight. The dish the customer actually wants, "spicy paneer roll", comes third, matched only through "paneer". The second query is worse: for "something hot to drink" only "hot masala chai" shares a word, and the coffee and soup score exactly 0, so they can never be found.</p>
  <p>The cause is built into the method. In TF-IDF every word is its own axis, at right angles to every other word, so "fiery" and "spicy" are as unrelated as "fiery" and "coffee", and "wrap" and "roll" have nothing in common. Keyword search compares spelling, not meaning. Humans know that fiery means spicy because they have seen both words used in the same situations; the search engine has never been told.</p>
  <p>Think of a delivery app that finds restaurants "near you". It does not compare restaurant names with your address; it gives every restaurant a location on a map and finds the closest points. The idea behind vector search is the same: give every text a location in a space, arranged so that texts with similar meanings land near each other, and then "find dishes like this" becomes "find the nearest points". A text turned into such a location is called an <strong>embedding</strong>, searching by closeness of embeddings is called <strong>semantic search</strong>, and a system built to store embeddings and find the nearest ones quickly is a <strong>vector database</strong>. None of this replaces ordinary SQL: "veg dishes under ₹150" is still a filter question, and real searches mix both kinds, as section 10 shows.</p>

  <h2 id="vd-emb"><span class="num">02</span>Embeddings</h2>
  <p>An <strong>embedding</strong> is a fixed-length list of numbers, a vector, that stands for a piece of text, built so that texts with similar meanings point in similar directions. Real embedding vectors have between a few hundred and a few thousand numbers. None of the individual numbers has a name; together they act like coordinates on a map of meaning that the model drew for itself. A useful picture is a flavour chart with axes for spiciness, temperature and "is it a drink": two dishes with different names but the same profile sit at the same spot. An embedding model invents hundreds of such axes on its own and never tells you what they mean.</p>
  <p>Where do the numbers come from? The key idea, older than neural networks, is that <em>a word is known by the company it keeps</em>. "Fiery" and "spicy" are used in the same places ("the curry was ___ and tasty"), so a method that describes each word by its neighbours will give them similar descriptions. We can see this happen on a small scale. Biteful has 4,000 customer reviews (synthetic ones generated from templates, standing in for real reviews), and we will build word vectors from them in three steps: count which words appear near each other, keep only the pairs that appear together more often than chance (a measure called <strong>PPMI</strong>, positive pointwise mutual information), and compress each word's row of counts to 16 numbers with SVD, the matrix technique behind dimensionality reduction.</p>

  <div class="fx" data-lang="py">print(len(reviews), "reviews, for example:")
for s in reviews[:3]:
    print("  ", " ".join(s))

# 1. count how often each pair of words appears within 2 positions of each other
vocab = sorted({w for s in reviews for w in s})
idx = {w: i for i, w in enumerate(vocab)}
C = np.zeros((len(vocab), len(vocab)))
for s in reviews:
    for i, w in enumerate(s):
        for j in range(max(0, i - 2), min(len(s), i + 3)):
            if j != i:
                C[idx[w], idx[s[j]]] += 1

# 2. PPMI: how much MORE often than chance do two words appear together?
expected = C.sum(1, keepdims=True) @ C.sum(0, keepdims=True) / C.sum()
with np.errstate(divide="ignore"):
    ppmi = np.maximum(np.log(C / expected), 0)

# 3. SVD squeezes each word's 49-number row into 16 numbers; scale to length 1
U, S, _ = np.linalg.svd(ppmi)
W = U[:, :16] * np.sqrt(S[:16])
W /= np.linalg.norm(W, axis=1, keepdims=True)

print("vocabulary:", len(vocab), "words -&gt; word vectors", W.shape)
for a, b in [("spicy", "fiery"), ("roll", "wrap"), ("chai", "coffee"), ("spicy", "mild")]:
    print(f"  {a:6} vs {b:7} {W[idx[a]] @ W[idx[b]]:.3f}")</div>
  <div class="fx" data-lang="text">4000 reviews, for example:
   soup arrived cold , terrible
   delicious soup , will order again
   the soup was warm and amazing
vocabulary: 49 words -&gt; word vectors (49, 16)
  spicy  vs fiery   0.997
  roll   vs wrap    0.998
  chai   vs coffee  0.988
  spicy  vs mild    0.188</div>
  <p>The reviews are short template sentences such as "the soup was warm and amazing". After counting, weighting and compressing, each of the 49 words has a 16-number vector of length 1. The printout shows the method has learned meaning purely from where words appear: "spicy" and "fiery" have a similarity of 0.997, "roll" and "wrap" 0.998, and "chai" and "coffee" 0.988, while "spicy" and "mild" are only 0.188 apart in direction. Nobody told the program that these words are related; they simply occur in the same kinds of sentences.</p>
  <p>A search needs one vector per <em>dish name or query</em>, not per word. The simplest way to get one is to average the vectors of the words in the text and scale the result back to length 1. Turning many vectors into one like this is called <strong>pooling</strong>.</p>
  <div class="fx" data-lang="py">def embed(text):
    known = [w for w in text.lower().split() if w in idx]        # unknown words are dropped
    v = np.mean([W[idx[w]] for w in known], axis=0)
    return v / np.linalg.norm(v)                                 # one unit vector per text

X = np.stack([embed(n) for n in names])                          # the whole "index": 12 x 16
print("menu matrix:", X.shape)
print("not in vocabulary:", sorted({w for n in names for w in n.split() if w not in idx}))

def semantic_search(query, k=3):
    s = X @ embed(query)                                         # similarity with every dish at once
    top = np.argsort(-s)[:k]
    return [(names[i], round(float(s[i]), 3)) for i in top]

for q in ["fiery paneer wrap", "something hot to drink", "gentle curry"]:
    print(f"{q!r:25} -&gt;", semantic_search(q))</div>
  <div class="fx" data-lang="text">menu matrix: (12, 16)
not in vocabulary: ['filter', 'tomato']
'fiery paneer wrap'       -&gt; [('spicy paneer roll', 0.998), ('fiery chicken kathi', 0.996), ('spicy chicken biryani', 0.824)]
'something hot to drink'  -&gt; [('steaming filter coffee', 0.545), ('warm tomato soup', 0.497), ('hot masala chai', 0.483)]
'gentle curry'            -&gt; [('mild paneer tikka masala', 0.892), ('mild veg curry', 0.875), ('mild chicken wrap', 0.678)]</div>
  <p><code>embed</code> looks up each known word, averages the vectors and scales the result to length 1. Stacking the 12 dish vectors gives a 12 × 16 matrix <code>X</code>, and that matrix is our entire index. <code>X @ embed(query)</code> multiplies every dish vector by the query vector in one step, giving a similarity score for each dish (section 03 explains why this product is a similarity). Compare the results with section 01: "fiery paneer wrap" now finds "spicy paneer roll" first with 0.998, even though the only shared word is "paneer". "Something hot to drink" finds the coffee, soup and chai, and "gentle curry" finds the mild curries. Two words, "filter" and "tomato", never appear in the reviews, so <code>embed</code> silently drops them; real models avoid this by splitting unknown words into smaller pieces.</p>
  <p>Production systems use far stronger models, but they follow the same shape: text in, one unit vector out. A <strong>sentence embedding model</strong> is usually a Transformer encoder (<a class="xref" data-note="transformers">Transformers</a>) that produces one context-aware vector per token, pools them into one vector, and normalises it. It is then trained further on millions of pairs of texts that should match, such as a question and its answer or two paraphrases, pulling matching pairs together and pushing random pairs apart; this is called <strong>contrastive training</strong>. Because the query and each document are embedded <em>separately</em> by the same model, the model is called a <strong>bi-encoder</strong>. That separation is what makes vector search possible: Biteful can embed every dish once, overnight, and at search time only the short query needs embedding. A <strong>cross-encoder</strong>, which reads the query and a document together, is more accurate but has to run once per pair, so it is used only to re-rank a short list (see <a class="xref" data-note="rag">RAG</a>).</p>
  <table class="tbl">
    <tr><th>Model</th><th>Dimensions</th><th>Max input</th><th>Notes</th></tr>
    <tr><td>OpenAI text-embedding-3-small</td><td>1,536</td><td>8,191 tokens</td><td>cheap API default; can be shortened</td></tr>
    <tr><td>OpenAI text-embedding-3-large</td><td>3,072</td><td>8,191 tokens</td><td>more accurate, more expensive</td></tr>
    <tr><td>BAAI bge-m3 (open)</td><td>1,024</td><td>8,192 tokens</td><td>multilingual; dense and sparse outputs</td></tr>
    <tr><td>all-MiniLM-L6-v2 (open)</td><td>384</td><td>256 word pieces</td><td>tiny and CPU-friendly; less accurate</td></tr>
  </table>
  <p>Rankings of models change every few months, so the practical approach is to check a public leaderboard such as MTEB and then test the top two or three on your own queries. One rule never changes: <strong>documents and queries must be embedded by the same model and version</strong>. Each model draws its own map, so dimension 7 of one model has nothing to do with dimension 7 of another. If the menu was embedded with one model and queries with another, every search returns confident nonsense and no error is raised. Store the model name with the index, and re-embed everything when you change models.</p>

  <h2 id="vd-sim"><span class="num">03</span>Similarity Metrics</h2>
  <p>"Find the nearest vectors" needs a definition of near, and vector databases offer three. <strong>Cosine similarity</strong> measures only the angle between two vectors: 1 means the same direction, 0 means unrelated, −1 opposite. The <strong>dot product</strong> multiplies matching numbers and adds them up, so it grows both with the angle and with the vectors' lengths. <strong>Euclidean distance</strong> (also called L2) is the straight-line distance between the tips of the two arrows. Do they ever disagree?</p>
  <p>Take a = [3, 4] and b = [6, 8], which point the same way but b is twice as long. Their cosine is 50 ÷ (5 × 10) = 1, because the directions match exactly. Their dot product is 3·6 + 4·8 = 50, a number that depends on length. Their Euclidean distance is √(3² + 4²) = 5, because the tips are 5 apart. Now scale both to length 1: they become the same point, with cosine 1, dot product 1 and distance 0.</p>
  <div class="fx" data-lang="py">a, b = np.array([3.0, 4.0]), np.array([6.0, 8.0])
print("cosine", a @ b / (np.linalg.norm(a) * np.linalg.norm(b)), "  dot", a @ b, "  L2", np.linalg.norm(a - b))

q = embed("fiery paneer wrap")
by_cos = np.argsort(-(X @ q))
by_l2 = np.argsort(np.linalg.norm(X - q, axis=1))
print("unit vectors: cosine ranking == L2 ranking:", np.array_equal(by_cos, by_l2))
i = by_cos[0]
print(f"top dish: cos = {X[i] @ q:.4f}, 2 - 2*cos = {2 - 2 * X[i] @ q:.4f}, |x - q|^2 = {np.sum((X[i] - q) ** 2):.4f}")

stretched = X * np.linspace(1, 3, 12)[:, None]                   # same directions, unequal lengths
print("unequal lengths: dot ranking == cosine ranking:", np.array_equal(np.argsort(-(stretched @ q)), by_cos))</div>
  <div class="fx" data-lang="text">cosine 1.0   dot 50.0   L2 5.0
unit vectors: cosine ranking == L2 ranking: True
top dish: cos = 0.9983, 2 - 2*cos = 0.0034, |x - q|^2 = 0.0034
unequal lengths: dot ranking == cosine ranking: False</div>
  <p>The first line repeats the hand calculation. The second shows that on our unit-length menu vectors, ranking dishes by cosine and ranking them by Euclidean distance give exactly the same order. The third line shows why: for vectors of length 1, the squared distance always equals 2 − 2 × cosine, here 0.0034 both ways, so a higher cosine always means a smaller distance. The last line stretches the dish vectors to different lengths without changing their directions; now the dot product ranks differently from cosine, because longer vectors win just for being long.</p>
  <p>Picture two customers who order the same thali, one plate and ten plates. By taste they are identical (cosine), but a measure that counts plates (the dot product) says the bigger order is "more similar" to everything. Normalising is serving everyone one plate before comparing. That gives the practical rule: <strong>normalise every vector to length 1 when you store it</strong>; then cosine, dot product and distance all agree, and the database can use the dot product, which is the cheapest to compute. Use the metric the embedding model was trained for (its documentation says), and be aware that a wrong choice never crashes, it just ranks slightly wrong forever.</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Measures</th><th>pgvector operator</th></tr>
    <tr><td>Cosine</td><td>a·b ÷ (‖a‖ ‖b‖)</td><td>angle only, −1 to 1</td><td><code>&lt;=&gt;</code> (gives 1 − cosine)</td></tr>
    <tr><td>Dot product</td><td>Σ a<sub>i</sub>b<sub>i</sub></td><td>angle and length</td><td><code>&lt;#&gt;</code> (gives the negative)</td></tr>
    <tr><td>Euclidean (L2)</td><td>√Σ(a<sub>i</sub> − b<sub>i</sub>)²</td><td>gap between the tips</td><td><code>&lt;-&gt;</code></td></tr>
  </table>

  <h2 id="vd-brute"><span class="num">04</span>Exact Search and Its Cost</h2>
  <p>So far a search has meant "compute the similarity of the query with every stored vector and keep the best k". This is called <strong>exact</strong>, <strong>brute-force</strong> or <strong>flat</strong> search, and it always returns the true nearest vectors. For 12 dishes of 16 numbers it is 192 multiplications. The question is how the cost grows when Biteful indexes every dish in every city, or when a RAG system indexes tens of millions of document chunks.</p>
  <p>Our 49-word vocabulary cannot produce millions of different vectors, so for experiments at scale we switch to <strong>synthetic vectors</strong>: 64 numbers each, scattered around 500 random "topic" centres and normalised, which imitates the way real embeddings cluster by topic. They stand in for "a million dishes and reviews". The timings below are from one CPU thread and are approximate; they change from run to run and machine to machine.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
d, n_topics = 64, 500
centres = rng.normal(size=(n_topics, d))
def sample(n):                                           # unit vectors clustered around topics
    v = centres[rng.integers(0, n_topics, n)] + 1.2 * rng.normal(size=(n, d))
    return (v / np.linalg.norm(v, axis=1, keepdims=True)).astype("float32")
big = sample(1_000_000)                                  # 1M vectors, 256 MB
Q = sample(200)                                          # 200 test queries

def brute_force(Xs, q, k=10):
    s = Xs @ q                                           # N dot products
    top = np.argpartition(-s, k)[:k]                     # best k without sorting everything
    return top[np.argsort(-s[top])]

for N in (10_000, 100_000, 1_000_000):
    t = time.perf_counter()
    for q in Q[:50]:
        brute_force(big[:N], q)
    ms = (time.perf_counter() - t) / 50 * 1000
    print(f"N = {N:&gt;9,}: {ms:6.2f} ms per query  ({N * d / 1e6:5.1f} M multiply-adds)")
n, dims = 10_000_000, 1536
print(f"10M x 1,536: {n * dims / 1e9:.1f} billion multiply-adds per query over {n * dims * 4 / 1e9:.1f} GB")</div>
  <div class="fx" data-lang="text">N =    10,000:   0.15 ms per query  (  0.6 M multiply-adds)
N =   100,000:   1.34 ms per query  (  6.4 M multiply-adds)
N = 1,000,000:  29.92 ms per query  ( 64.0 M multiply-adds)
10M x 1,536: 15.4 billion multiply-adds per query over 61.4 GB</div>
  <p><code>sample</code> creates unit vectors around random centres. <code>brute_force</code> is the whole of exact search: one matrix product gives N similarities, and <code>argpartition</code> finds the best k without sorting all of them. Read the timings: ten times more vectors costs roughly ten times more time, and the jump to a million costs even more because 256 MB of vectors no longer fit in the processor's fast cache memory. The cost of exact search grows at least in proportion to the number of vectors. Extrapolate to a realistic RAG index of 10 million chunks with 1,536-number embeddings and every single query needs 15 billion multiply-adds over 61 GB of numbers, which is far too slow for a hundred queries a second.</p>
  <p>This is like finding the book most similar to one you loved by reading the back cover of every book in the library. You are guaranteed the best answer, and for one shelf it is perfectly sensible; for a national library it is hopeless. Exact search still has two important jobs, though. Below roughly 100,000 vectors it is often fast enough and needs no tuning at all, and it is the <strong>ground truth</strong> that every faster method is measured against, as the next section shows.</p>

  <h2 id="vd-ann"><span class="num">05</span>Approximate Search and Recall</h2>
  <p>A customer searching the menu does not need a mathematical guarantee that they saw the single best match; they need good matches, fast. <strong>Approximate nearest neighbour</strong> (ANN) search makes exactly that trade. It organises the vectors in advance into an <strong>index</strong>, a data structure that lets a query compare itself with only a small, promising fraction of the vectors. The price is that occasionally a true neighbour is missed.</p>
  <p>Because the loss is real, it has to be measured, and the measure is <strong>recall@k</strong>: of the true k nearest vectors (found by exact search), what fraction did the index return? If the true top 3 for a query are {A, B, C} and the index returns {A, C, D}, recall@3 is 2 ÷ 3 = 0.67. Averaged over many test queries, recall tells you how much quality a faster index gives up.</p>
  <div class="fx" data-lang="py">def recall_at_k(found, truth):
    return len(set(found) &amp; set(truth)) / len(truth)
print(recall_at_k(["A", "C", "D"], ["A", "B", "C"]))

Xb = big[:100_000]                                       # the 100k set used for every index below
truth = np.stack([brute_force(Xb, q) for q in Q])        # exact top 10 per query = ground truth
print("ground truth:", truth.shape)</div>
  <div class="fx" data-lang="text">0.6666666666666666
ground truth: (200, 10)</div>
  <p><code>recall_at_k</code> is the hand formula, giving 0.67 for the example. <code>truth</code> holds the exact top 10 for each of 200 test queries over 100,000 synthetic vectors; every index in the next sections is scored against it.</p>
  <p>There are three main families of index, and a library is a good way to picture them. IVF walks to the right subject shelf and scans only that shelf. HNSW follows the "if you liked this, try…" notes inside each book and reaches the right one in a few hops. Product quantisation keeps a one-line summary of each book instead of the whole book, so far more fit in the room. Every index sits somewhere on a triangle of <strong>recall</strong> (quality), <strong>latency</strong> (time per query) and <strong>memory</strong>; improving one corner usually costs another, so the first design question is always which corner you cannot give up. Remember too that recall only measures agreement with exact search on <em>your embeddings</em>: if the embedding model is poor, a perfect index faithfully returns poor results. Fix the model first, then tune the index.</p>

  <h2 id="vd-ivf"><span class="num">06</span>IVF</h2>
  <p>If the menu were sorted into "food", "hot drinks" and "cold drinks", a query about drinks could skip all the food. An <strong>IVF index</strong> (inverted file index) builds such groups automatically. At build time it runs <strong>k-means</strong> clustering (<a class="xref" data-note="ml_kmeans">K-Means</a>), which finds K centre points called <strong>centroids</strong> and assigns every vector to its nearest one; the vectors belonging to each centroid are stored together in a list, called a cell. At query time it compares the query with the K centroids only, picks the <strong>nprobe</strong> closest cells, and runs exact search inside those cells alone. Think of receipts filed in monthly folders: to find one from March you open only the March folder.</p>
  <p>Here is k-means written out in NumPy, applied to the menu with K = 3, followed by an IVF search for the query "hot and spicy".</p>
  <div class="fx" data-lang="py">def kmeans(P, K, iters=20, seed=0):
    r = np.random.default_rng(seed)
    cent = P[r.choice(len(P), K, replace=False)].copy()            # start from K random points
    for _ in range(iters):
        d2 = (P ** 2).sum(1)[:, None] - 2 * P @ cent.T + (cent ** 2).sum(1)
        label = d2.argmin(1)                                       # each point -&gt; nearest centre
        for c in range(K):
            if np.any(label == c):
                cent[c] = P[label == c].mean(0)                    # each centre -&gt; mean of its points
    return cent, label

centroids, cell = kmeans(X, 3)
for c in range(3):
    print(f"cell {c}:", [names[i] for i in np.where(cell == c)[0]])

def ivf_search(query, nprobe, k=3):
    q = embed(query)
    order = np.argsort(np.linalg.norm(centroids - q, axis=1))      # nearest centroids first
    cand = np.where(np.isin(cell, order[:nprobe]))[0]               # only dishes in probed cells
    top = cand[np.argsort(-(X[cand] @ q))][:k]
    return order, cand, top

q_text = "hot and spicy"
print(f"\\n{q_text!r}: true top 3 =", [names[i] for i in np.argsort(-(X @ embed(q_text)))[:3]])
print("distance to centroids:", np.linalg.norm(centroids - embed(q_text), axis=1).round(3))
true3 = np.argsort(-(X @ embed(q_text)))[:3]
for nprobe in (1, 2):
    order, cand, top = ivf_search(q_text, nprobe)
    print(f"nprobe={nprobe}: cells {order[:nprobe].tolist()}, compared {len(cand)} of 12 -&gt;",
          [names[i] for i in top], f"recall@3 = {recall_at_k(top, true3):.2f}")</div>
  <div class="fx" data-lang="text">cell 0: ['cold coffee']
cell 1: ['spicy paneer roll', 'mild chicken wrap', 'fiery chicken kathi', 'mild veg kathi', 'spicy chicken biryani', 'mild paneer tikka masala', 'egg roll', 'mild veg curry']
cell 2: ['hot masala chai', 'steaming filter coffee', 'warm tomato soup']

'hot and spicy': true top 3 = ['hot masala chai', 'spicy chicken biryani', 'fiery chicken kathi']
distance to centroids: [1.213 1.001 0.825]
nprobe=1: cells [2], compared 3 of 12 -&gt; ['hot masala chai', 'warm tomato soup', 'steaming filter coffee'] recall@3 = 0.33
nprobe=2: cells [2, 1], compared 11 of 12 -&gt; ['hot masala chai', 'spicy chicken biryani', 'fiery chicken kathi'] recall@3 = 1.00</div>
  <p>k-means repeats two steps: assign each point to its nearest centre, then move each centre to the average of its points. On the menu it finds three sensible cells: the lone cold coffee, the eight food dishes, and the three hot drinks. Now follow the query. "Hot and spicy" is ambiguous, because "hot" can mean temperature or spice, and its true top 3 are one hot drink and two spicy dishes. Its nearest centroid is the hot-drinks cell (distance 0.825), with the food cell not far behind (1.001). With <strong>nprobe = 1</strong> only the hot-drinks cell is searched: 3 comparisons instead of 12, but only 1 of the 3 true neighbours is found, a recall of 0.33. With <strong>nprobe = 2</strong> the food cell is searched too and recall is 1.0. This is IVF's characteristic weakness, the <strong>boundary problem</strong>: a query near the edge of a cell has true neighbours on the other side of the border, just as a receipt from the 31st of March may have been filed under April. Raising nprobe opens more folders and fixes most misses, at the cost of more comparisons.</p>
  <p>The same index on the 100,000 synthetic vectors shows the trade-off as numbers. We use K = 316 cells (about √N, a common starting point) and try several values of nprobe.</p>
  <div class="fx" data-lang="py">results = {}                                    # label -&gt; (recall@10, ms per query, bytes per vector)
def bench(search, label, bytes_per_vec):
    t = time.perf_counter()
    found = [search(q) for q in Q]
    ms = (time.perf_counter() - t) / len(Q) * 1000
    rec = np.mean([recall_at_k(f, t_) for f, t_ in zip(found, truth)])
    results[label] = (rec, ms, bytes_per_vec)
    print(f"{label:20s} recall@10 {rec:.3f}   {ms:6.3f} ms/query")

bench(lambda q: brute_force(Xb, q), "Flat (exact)", d * 4)

K = 316                                         # about sqrt(N) cells
cent, label = kmeans(Xb, K, iters=10)
lists = [np.where(label == c)[0] for c in range(K)]        # the "inverted lists"
def ivf(q, nprobe, k=10):
    probe = np.argsort(-(cent @ q))[:nprobe]               # nearest centroids
    cand = np.concatenate([lists[c] for c in probe])
    return cand[brute_force(Xb[cand], q, k)]               # exact search inside them only
for p in (1, 4, 16, 64):
    bench(lambda q: ivf(q, p), f"IVF nprobe={p}", d * 4 + 8)</div>
  <div class="fx" data-lang="text">Flat (exact)         recall@10 1.000    1.406 ms/query
IVF nprobe=1         recall@10 0.759    0.043 ms/query
IVF nprobe=4         recall@10 0.872    0.123 ms/query
IVF nprobe=16        recall@10 0.931    0.444 ms/query
IVF nprobe=64        recall@10 0.980    1.327 ms/query</div>
  <p>With nprobe = 1 a query scans about 1/316 of the data, and recall drops to 0.759 because many true neighbours sit in other cells. Each step up in nprobe buys recall back with more work: 0.872, 0.931, and 0.980 at nprobe = 64. (These timings come from plain NumPy, where gathering scattered rows is slow compared with one big matrix product, so at high nprobe it is no faster than flat search; compiled libraries such as FAISS make IVF many times faster than flat. Read the recall column, which does not depend on the machine.) The cost of an IVF query is roughly K + nprobe × N ÷ K comparisons. One more caution: the centroids are learned once from the data. If the data drifts, for example a new cuisine arrives, cells become unbalanced and recall drops silently, so IVF indexes need retraining on a fresh sample from time to time.</p>

  <h2 id="vd-hnsw"><span class="num">07</span>HNSW</h2>
  <p>IVF's cells have hard borders, and borders cost recall. A different idea avoids borders entirely: link every dish to its most similar dishes, so the collection becomes a <strong>neighbour graph</strong>. To search, start at any dish and repeatedly move to whichever neighbour is closer to the query, stopping when no neighbour is closer. This greedy walk is fast, but on a big graph it can take many small steps to cross from one region to another.</p>
  <p><strong>HNSW</strong> (Hierarchical Navigable Small World), the most widely used vector index today, fixes that with layers. Every item gets a random top level: most items live only on layer 0, a few also on layer 1, very few on layer 2, using the rule level = ⌊−ln(U) ÷ ln M⌋ with U a random number between 0 and 1 and M the number of links per node. Upper layers therefore contain few items with long links, good for big jumps, and layer 0 contains every item with short links. A search starts at the single item on the top layer, walks greedily, drops down a layer when it gets stuck, and finishes on layer 0. It is like driving to a lane in another city: national highway first, then the ring road, then local streets, switching to finer roads only once you are in the right area.</p>
  <p>Here is a tiny version on the menu. Each dish is linked to its 3 nearest dishes on layer 0 and 2 nearest on the upper layers (real HNSW builds links by inserting items one at a time, but for 12 items the effect is the same). Distance is 1 − cosine.</p>
  <div class="fx" data-lang="py">dist = lambda a, b: 1.0 - float(a @ b)                     # cosine distance
rng_h = np.random.default_rng(33); M = 3
levels = [int(-math.log(1 - rng_h.random()) / math.log(M)) for _ in names]   # HNSW level rule
print("levels above 0:", {names[i]: l for i, l in enumerate(levels) if l &gt; 0})
graph = {}
for L in range(max(levels) + 1):
    nodes = [i for i in range(12) if levels[i] &gt;= L]
    graph[L] = {i: set() for i in nodes}
    for i in nodes:                                        # link to nearest 3 (layer 0) or 2 (upper)
        for j in sorted((j for j in nodes if j != i), key=lambda j: dist(X[i], X[j]))[:3 if L == 0 else 2]:
            graph[L][i].add(j); graph[L][j].add(i)
entry = levels.index(max(levels))

def greedy_layer(q, cur, L):
    path = [cur]
    while graph[L][cur]:
        best = min(graph[L][cur], key=lambda j: dist(q, X[j]))
        if dist(q, X[best]) &gt;= dist(q, X[cur]):
            break                                          # no neighbour is closer: stop
        cur = best; path.append(cur)
    return cur, path

def hnsw_trace(text):
    q, cur = embed(text), entry
    for L in range(max(levels), -1, -1):
        cur, path = greedy_layer(q, cur, L)
        print(f"  layer {L}:", " -&gt; ".join(f"{names[i]} ({dist(q, X[i]):.3f})" for i in path))
    best = int(np.argmax(X @ q))
    print(f"  greedy answer: {names[cur]}   true nearest: {names[best]} ({dist(q, X[best]):.3f})")

for text in ["fiery paneer wrap", "cold chai", "light curry"]:
    print(repr(text)); hnsw_trace(text)</div>
  <div class="fx" data-lang="text">levels above 0: {'fiery chicken kathi': 2, 'hot masala chai': 1}
'fiery paneer wrap'
  layer 2: fiery chicken kathi (0.004)
  layer 1: fiery chicken kathi (0.004)
  layer 0: fiery chicken kathi (0.004) -&gt; spicy paneer roll (0.002)
  greedy answer: spicy paneer roll   true nearest: spicy paneer roll (0.002)
'cold chai'
  layer 2: fiery chicken kathi (0.781)
  layer 1: fiery chicken kathi (0.781) -&gt; hot masala chai (0.491)
  layer 0: hot masala chai (0.491) -&gt; cold coffee (0.006)
  greedy answer: cold coffee   true nearest: cold coffee (0.006)
'light curry'
  layer 2: fiery chicken kathi (0.552)
  layer 1: fiery chicken kathi (0.552) -&gt; hot masala chai (0.337)
  layer 0: hot masala chai (0.337)
  greedy answer: hot masala chai   true nearest: mild paneer tikka masala (0.095)</div>
  <p>One dish, "fiery chicken kathi", reached layer 2 and is the entry point; "hot masala chai" also reached layer 1. Each printed line is one layer and each arrow is one hop, with the distance to the query in brackets. "Fiery paneer wrap" starts close and finishes at its true nearest dish in one hop. "Cold chai" uses the long layer-1 link to jump from the spicy kathi to the hot chai, then a short layer-0 hop to "cold coffee", its true nearest dish. "Light curry" goes wrong: the walk reaches "hot masala chai" at distance 0.337, and none of the chai's neighbours is closer, so it stops, while the true nearest dish, "mild paneer tikka masala" at 0.095, is elsewhere in the graph. This is a <strong>local minimum</strong>: no single step improves, even though a better answer exists.</p>
  <p>Real HNSW avoids getting stuck by keeping a list of several candidates on layer 0 instead of only one. The list size is called <strong>ef</strong>. The search keeps expanding the closest unexplored candidate and stops only when even the closest candidate is worse than the worst of the ef best found so far.</p>
  <div class="fx" data-lang="py">def layer0_beam(q, start, ef):
    visited = {start}
    cand = [(dist(q, X[start]), start)]               # min-heap: closest unexplored candidate first
    best = [(-dist(q, X[start]), start)]              # max-heap: the ef best found so far
    while cand:
        dc, c = heapq.heappop(cand)
        if len(best) &gt;= ef and dc &gt; -best[0][0]:
            break                                     # closest candidate is worse than the worst kept
        for j in graph[0][c]:
            if j not in visited:
                visited.add(j); dj = dist(q, X[j])
                if len(best) &lt; ef or dj &lt; -best[0][0]:
                    heapq.heappush(cand, (dj, j)); heapq.heappush(best, (-dj, j))
                    if len(best) &gt; ef:
                        heapq.heappop(best)
    return sorted((-d_, i) for d_, i in best), len(visited)

q, start = embed("light curry"), entry
for L in range(max(levels), 0, -1):
    start, _ = greedy_layer(q, start, L)              # descend the upper layers greedily
for ef in (1, 3):
    found, seen = layer0_beam(q, start, ef)
    print(f"ef={ef}: best = {names[found[0][1]]} ({found[0][0]:.3f}), distances computed = {seen}")</div>
  <div class="fx" data-lang="text">ef=1: best = hot masala chai (0.337), distances computed = 5
ef=3: best = mild paneer tikka masala (0.095), distances computed = 12</div>
  <p>With ef = 1 the search is the plain greedy walk and stops at the chai after computing 5 distances. With ef = 3 it keeps two extra candidates alive, explores past the chai, and finds the mild tikka masala, at the cost of computing 12 distances. This is exactly the <code>ef_search</code> setting in every HNSW implementation: raise it for better recall, lower it for speed.</p>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600">
    <defs><marker id="vd-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <rect x="50" y="20" width="540" height="40" rx="6" class="fs"/><text x="10" y="44" class="tm">2</text>
    <circle cx="140" cy="40" r="6" class="fb sb"/><text x="152" y="44" font-size="10">entry</text>
    <rect x="50" y="95" width="540" height="40" rx="6" class="fs"/><text x="10" y="119" class="tm">1</text>
    <line x1="140" y1="115" x2="300" y2="115" stroke="currentColor" opacity="0.45"/><line x1="300" y1="115" x2="480" y2="115" stroke="currentColor" opacity="0.45"/>
    <circle cx="140" cy="115" r="6" class="fb sb"/><circle cx="300" cy="115" r="6" class="fb sb"/><circle cx="480" cy="115" r="6" class="fb sb"/>
    <rect x="50" y="170" width="540" height="40" rx="6" class="fs"/><text x="10" y="194" class="tm">0</text>
    <line x1="80" y1="190" x2="540" y2="190" stroke="currentColor" opacity="0.45"/>
    <circle cx="80" cy="190" r="6" class="fb sb"/><circle cx="120" cy="190" r="6" class="fb sb"/><circle cx="140" cy="190" r="6" class="fb sb"/><circle cx="180" cy="190" r="6" class="fb sb"/><circle cx="220" cy="190" r="6" class="fb sb"/><circle cx="260" cy="190" r="6" class="fb sb"/><circle cx="300" cy="190" r="6" class="fb sb"/><circle cx="340" cy="190" r="6" class="fb sb"/><circle cx="390" cy="190" r="6" class="fb sb"/><circle cx="440" cy="190" r="6" class="fb sb"/><circle cx="480" cy="190" r="6" class="fb sb"/><circle cx="540" cy="190" r="6" class="fb sb"/>
    <polyline points="140,40 140,115 300,115 300,190 340,190" fill="none" class="sr" stroke-width="2.5" marker-end="url(#vd-ah)"/>
    <circle cx="340" cy="190" r="9" fill="none" class="sr" stroke-width="2"/><text x="320" y="232" class="tr">query's nearest</text>
    <text x="250" y="28" class="tm">1 node: the entry point</text><text x="360" y="108" class="tm">few nodes, long links</text><text x="60" y="232" class="tm">every item, short links</text>
  </svg><figcaption>The search enters at the top, takes a long hop on layer 1, drops to layer 0 close to the target and finishes with short steps, keeping ef candidates as it goes.</figcaption></figure>
  <p>The figure shows why the layers make search fast at scale: each layer down narrows the region, so the number of hops grows roughly with the logarithm of N rather than with N. Three settings control a real HNSW index: <code>M</code>, the links per node (typically 16–64; more links give better recall but use more memory), <code>ef_construction</code>, the candidate list used while building (100–400; a better graph but a slower build), and <code>ef_search</code>, the candidate list per query (40–200), which is the knob you turn at run time. HNSW gives the best recall per millisecond of the common indexes and accepts new items without a rebuild. Its cost is memory: every full vector plus its links must sit in RAM, so 10 million vectors of 1,536 numbers need about 61 GB before the links. Deleting items is also awkward, since nodes are usually only marked as deleted. At hundreds of millions of vectors, teams add compression (next section) or use disk-based graphs such as DiskANN.</p>

  <h2 id="vd-pq"><span class="num">08</span>Product Quantisation</h2>
  <p>IVF and HNSW decide <em>which</em> vectors to compare, but each stored vector still takes 4 bytes per number: 6 KB for a 1,536-number embedding, and terabytes for a billion of them. <strong>Product quantisation</strong> (PQ) compresses each vector to a few bytes while still allowing approximate similarity scores.</p>
  <p>It works in three steps. First, cut every vector into m equal pieces (here, 16 numbers become 4 pieces of 4). Second, for each piece position, run k-means over that piece of every stored vector to get a <strong>codebook</strong> of K typical pieces; real systems use K = 256 so that a piece's ID fits in one byte. Third, store each vector as m IDs, one per piece, naming the nearest codebook entry. To score a query against compressed vectors, compute once per query a small table holding the similarity of each query piece with each codebook entry; the approximate score of any stored vector is then just the sum of m table lookups, with no multiplication at all. Think of saving a photo with a 256-colour palette: each pixel stores a palette number instead of its full colour, and the picture is slightly off but clearly the same. PQ uses a separate palette for each slice of the vector.</p>
  <p>On the menu, with 4 codebook entries per piece so that the numbers stay readable:</p>
  <div class="fx" data-lang="py">m, K, sub = 4, 4, 16 // 4                       # 4 pieces of 4 numbers, 4 codebook entries each
codebooks, codes = [], np.zeros((12, m), dtype=int)
for j in range(m):
    piece = X[:, j * sub:(j + 1) * sub]                         # piece j of all 12 dishes
    cb, lab = kmeans(piece, K)
    codebooks.append(cb); codes[:, j] = lab
print("codes (one ID per piece):")
for i in (0, 1, 6):
    print(f"  {names[i]:20s} {codes[i]}")

q = embed("fiery paneer wrap")
table = np.array([[q[j * sub:(j + 1) * sub] @ codebooks[j][c] for c in range(K)] for j in range(m)])
print("lookup table (4 pieces x 4 entries):\\n", table.round(3))
approx = np.array([sum(table[j, codes[i, j]] for j in range(m)) for i in range(12)])
print("spicy paneer roll: exact", round(float(X[0] @ q), 3), " approx", round(float(approx[0]), 3),
      "=", " + ".join(f"{table[j, codes[0, j]]:.3f}" for j in range(m)))
print("top 3 exact:", [names[i] for i in np.argsort(-(X @ q))[:3]])
print("top 3 by PQ:", [names[i] for i in np.argsort(-approx)[:3]])
print(f"storage per dish: {16 * 4} bytes as float32 -&gt; {m} codes x 2 bits = {m * 2 // 8} byte")</div>
  <div class="fx" data-lang="text">codes (one ID per piece):
  spicy paneer roll    [2 0 3 3]
  mild chicken wrap    [0 0 0 0]
  hot masala chai      [3 3 3 0]
lookup table (4 pieces x 4 entries):
 [[ 0.502  0.554  0.432  0.328]
 [ 0.348  0.128 -0.143  0.057]
 [ 0.022  0.029 -0.092  0.022]
 [ 0.001 -0.014 -0.023  0.079]]
spicy paneer roll: exact 0.998  approx 0.882 = 0.432 + 0.348 + 0.022 + 0.079
top 3 exact: ['spicy paneer roll', 'fiery chicken kathi', 'spicy chicken biryani']
top 3 by PQ: ['spicy paneer roll', 'fiery chicken kathi', 'mild chicken wrap']
storage per dish: 64 bytes as float32 -&gt; 4 codes x 2 bits = 1 byte</div>
  <p>Each dish is now four small IDs; "spicy paneer roll" is stored as [2, 0, 3, 3]. The lookup table has one row per piece and one column per codebook entry, and the approximate score of "spicy paneer roll" is the sum of four entries, printed term by term: 0.882, against an exact cosine of 0.998. The PQ ranking keeps the first two dishes but promotes "mild chicken wrap" to third, because with only 4 typical pieces per position, quite different dishes end up sharing codes. Storage per dish fell from 64 bytes to 1 byte.</p>
  <p>At scale we use the real setting, 256 entries per piece, on the 100,000 synthetic vectors, so each 256-byte vector becomes 16 bytes. Because PQ distances are approximate, the standard fix is to <strong>re-rank</strong>: fetch a longer shortlist using the compressed codes, then re-score just that shortlist with the full vectors.</p>
  <div class="fx" data-lang="py">for m_ in (96, 192):
    print(f"1,536-d float32 = {1536 * 4} bytes -&gt; PQ with m={m_}: {m_} bytes ({1536 * 4 // m_}x smaller)")

m, sub = 16, d // 16                                   # 16 pieces of 4 numbers, 256 entries (1 byte) each
books = [kmeans(Xb[:20_000, j * sub:(j + 1) * sub], 256, iters=10)[0] for j in range(m)]   # train on a sample
def encode(P):
    return np.stack([((P[:, j*sub:(j+1)*sub, None] - books[j].T[None]) ** 2).sum(1).argmin(1)
                     for j in range(m)], 1).astype(np.uint8)
codes_b = encode(Xb)                                   # 100,000 x 16 bytes
def pq_scores(q, ids):
    table = np.stack([books[j] @ q[j*sub:(j+1)*sub] for j in range(m)])   # 16 x 256, once per query
    return table[np.arange(m), codes_b[ids]].sum(1)                        # 16 lookups per vector
all_ids = np.arange(len(Xb))
def pq_flat(q, k=10):
    s = pq_scores(q, all_ids); top = np.argpartition(-s, k)[:k]; return top[np.argsort(-s[top])]
def ivf_pq(q, nprobe=16, k=10, rerank=0):
    probe = np.argsort(-(cent @ q))[:nprobe]
    cand = np.concatenate([lists[c] for c in probe])
    s = pq_scores(q, cand)
    n = rerank or k
    top = cand[np.argpartition(-s, n)[:n]]
    if rerank:                                          # re-score the shortlist with full vectors
        top = top[brute_force(Xb[top], q, k)]
    return top
bench(pq_flat, "PQ m=16 (flat scan)", 16)
bench(ivf_pq, "IVF-PQ nprobe=16", 16 + 8)
bench(lambda q: ivf_pq(q, rerank=100), "IVF-PQ + re-rank", 16 + 8 + d * 4)</div>
  <div class="fx" data-lang="text">1,536-d float32 = 6144 bytes -&gt; PQ with m=96: 96 bytes (64x smaller)
1,536-d float32 = 6144 bytes -&gt; PQ with m=192: 192 bytes (32x smaller)
PQ m=16 (flat scan)  recall@10 0.534    9.513 ms/query
IVF-PQ nprobe=16     recall@10 0.521    0.708 ms/query
IVF-PQ + re-rank     recall@10 0.927    0.623 ms/query</div>
  <p>A realistic 1,536-number embedding shrinks from 6,144 bytes to 96 or 192 bytes, 64 or 32 times smaller. On our set, PQ alone reaches only about 0.53 recall@10: the compression costs a lot of accuracy on this deliberately hard synthetic data. Combining PQ with IVF (<strong>IVF-PQ</strong>) scans only 16 cells, which is much faster, with similar recall. Re-ranking the best 100 PQ candidates with full vectors brings recall back to 0.927, but only because the full vectors are still kept somewhere, often on disk or in a cheaper store. (Again, the times are from NumPy, where looking up table entries is slow; in FAISS a PQ scan is very fast. Compare recall and bytes.) The lesson is that PQ is compression, not search: a flat PQ scan still visits every vector, just cheaply, so it is paired with IVF or a graph, followed by re-ranking when recall matters. Its codebooks are learned from the data and need the same retraining care as IVF centroids.</p>

  <h2 id="vd-choose"><span class="num">09</span>Choosing an Index</h2>
  <p>We now have several index families and several knobs, each measured on its own. Putting the results side by side, on the same 100,000 vectors and 200 queries, shows what each choice buys.</p>
  <div class="fx" data-lang="py">print(f"{'index / setting':20s} {'recall@10':&gt;9s} {'ms/query':&gt;9s} {'bytes/vec':&gt;9s}")
for label, (rec, ms, by) in results.items():
    print(f"{label:20s} {rec:9.3f} {ms:9.3f} {by:9d}")</div>
  <div class="fx" data-lang="text">index / setting      recall@10  ms/query bytes/vec
Flat (exact)             1.000     1.406       256
IVF nprobe=1             0.759     0.043       264
IVF nprobe=4             0.872     0.123       264
IVF nprobe=16            0.931     0.444       264
IVF nprobe=64            0.980     1.327       264
PQ m=16 (flat scan)      0.534     9.513        16
IVF-PQ nprobe=16         0.521     0.708        24
IVF-PQ + re-rank         0.927     0.623       280</div>
  <p>Read the table as the recall–latency–memory triangle from section 05. Flat search is the reference: recall 1.0 at 256 bytes per vector. (Ignore the PQ rows' times, which reflect slow NumPy lookups rather than the method.) IVF slides along the recall–speed edge with nprobe while using the same memory. The PQ rows cut memory to 16–24 bytes per vector and lose recall, and re-ranking buys most of it back at the price of keeping the full vectors. HNSW does not appear because building it in pure Python is too slow to be useful here; in libraries it usually gives the best recall per millisecond, at the cost of extra memory for its links (about 2 × M four-byte IDs per vector) and a long build.</p>
  <table class="tbl">
    <tr><th>Knob</th><th>Recall</th><th>Latency</th><th>Memory</th></tr>
    <tr><td>IVF: raise <code>nprobe</code></td><td>up</td><td>up</td><td>same</td></tr>
    <tr><td>HNSW: raise <code>ef_search</code></td><td>up</td><td>up</td><td>same</td></tr>
    <tr><td>HNSW: raise <code>M</code></td><td>up</td><td>up slightly</td><td>up</td></tr>
    <tr><td>Add PQ compression</td><td>down</td><td>down</td><td>far down</td></tr>
    <tr><td>Re-rank PQ candidates</td><td>up</td><td>up a little</td><td>needs full vectors</td></tr>
  </table>
  <p>In practice the decision usually goes like this. Under about 100,000 vectors, use flat search: it is exact and needs no tuning. If everything fits in memory, which covers most applications up to tens of millions of vectors, HNSW is the default. When memory is the constraint, at hundreds of millions or billions of vectors, use IVF-PQ or a disk-based graph, with re-ranking. Whatever you choose, measure recall@k and the slowest 5% of query times (the p95 latency) on a sample of your real vectors and real queries. Synthetic benchmarks like ours, and vendors' published numbers, only show trends.</p>

  <h2 id="vd-filter"><span class="num">10</span>Metadata Filtering</h2>
  <p>Every query so far was pure meaning. Real queries add conditions: a customer on the Wrap Republic page wants matches from that restaurant only, or someone wants veg dishes under ₹150. These conditions use <strong>metadata</strong>, the ordinary structured fields stored next to each vector. The question is where in the search the filter goes. <strong>Post-filtering</strong> runs the vector search for the top k first and then removes results that fail the filter. <strong>Pre-filtering</strong> restricts the candidates to items that pass the filter first and searches only among them.</p>
  <div class="fx" data-lang="py">def post_filter(query, keep, k=3):
    top = np.argsort(-(X @ embed(query)))[:k]                   # search everything, keep top k ...
    return [names[i] for i in top if keep(menu[i])]             # ... then filter
def pre_filter(query, keep, k=3):
    ok = np.array([i for i in range(12) if keep(menu[i])])      # filter first ...
    top = ok[np.argsort(-(X[ok] @ embed(query)))][:k]           # ... then search inside
    return [names[i] for i in top]

from_wrap_republic = lambda item: item[2] == "Wrap Republic"
print("post-filter:", post_filter("fiery paneer wrap", from_wrap_republic))
print("pre-filter :", pre_filter("fiery paneer wrap", from_wrap_republic))
veg_under_150 = lambda item: item[1] and item[3] &lt; 150
print("veg under 150, pre-filter:", pre_filter("fiery paneer wrap", veg_under_150))</div>
  <div class="fx" data-lang="text">post-filter: []
pre-filter : ['egg roll', 'mild chicken wrap', 'mild veg kathi']
veg under 150, pre-filter: ['spicy paneer roll', 'mild veg kathi', 'hot masala chai']</div>
  <p>The overall top 3 for "fiery paneer wrap" all come from other restaurants, so post-filtering returns an empty list, and the customer sees "no results" even though Wrap Republic sells three wraps. Pre-filtering searches only Wrap Republic's dishes and ranks them. The last line shows a combined condition, veg and under ₹150, handled the same way. It is like asking a waiter for the three best dishes in the whole food court and then saying "only from this stall": you get whichever of those three happen to be from that stall, usually none.</p>
  <p>The same problem at scale is worse, because a single restaurant is a tiny share of the index. Below, each of the 100,000 synthetic vectors is given one of 100 restaurant IDs, so restaurant 7 owns about 1% of them, and we compare three strategies against the exact filtered answer.</p>
  <div class="fx" data-lang="py">restaurant = np.random.default_rng(1).integers(0, 100, len(Xb))   # 100 restaurants, ~1% of items each
mine = restaurant == 7
sel = np.where(mine)[0]
print(f"restaurant 7 owns {len(sel)} of {len(Xb):,} items ({len(sel) / len(Xb):.1%})")
exact = [sel[brute_force(Xb[sel], q)] for q in Q]                  # true top 10 inside restaurant 7

post = [int(mine[ivf(q, 16)].sum()) for q in Q]                    # IVF top 10, then filter
print(f"post-filter: {np.mean(post):.2f} results on average, {np.mean(np.array(post) == 0):.0%} of queries get none")

def ivf_filtered(q, nprobe, k=10):                                 # filter DURING the scan
    probe = np.argsort(-(cent @ q))[:nprobe]
    cand = np.concatenate([lists[c] for c in probe])
    cand = cand[mine[cand]]                                        # skip non-matching items
    return cand[brute_force(Xb[cand], q, min(k, len(cand) - 1))] if len(cand) &gt; k else cand
for p in (16, 128):
    rec = np.mean([recall_at_k(ivf_filtered(q, p), e) for q, e in zip(Q, exact)])
    print(f"filter during IVF scan, nprobe={p:3d}: recall@10 {rec:.3f}")
t = time.perf_counter()
for q in Q:
    sel[brute_force(Xb[sel], q)]                                   # pre-filter, then exact search
print(f"pre-filter + brute force over {len(sel)} items: recall 1.000, "
      f"{(time.perf_counter() - t) / len(Q) * 1000:.2f} ms/query")</div>
  <div class="fx" data-lang="text">restaurant 7 owns 979 of 100,000 items (1.0%)
post-filter: 0.09 results on average, 91% of queries get none
filter during IVF scan, nprobe= 16: recall@10 0.477
filter during IVF scan, nprobe=128: recall@10 0.921
pre-filter + brute force over 979 items: recall 1.000, 0.02 ms/query</div>
  <p>Post-filtering IVF's top 10 leaves on average 10 × 1% ≈ 0.1 results, and 91% of queries get nothing at all. Filtering <em>during</em> the IVF scan, skipping non-matching items inside the probed cells, always returns results, but with nprobe = 16 it finds fewer than half of the true filtered top 10, because the matching items are spread thinly across all cells; it needs nprobe = 128 to reach 0.921. For a filter this selective the simplest strategy wins: pre-filter to the 979 matching items and run exact search over them, which is perfectly accurate and still fast. Good vector databases therefore switch strategy depending on how selective the filter is, and the classic production failure is post-filtering that works in demos, where filters keep most of the data, and breaks for small tenants in production.</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>How</th><th>Good when</th><th>Risk</th></tr>
    <tr><td>Post-filter</td><td>top k, then filter</td><td>filter keeps most items</td><td>empty results with selective filters</td></tr>
    <tr><td>Pre-filter + exact search</td><td>filter first, flat search on the rest</td><td>few items pass (thousands)</td><td>slow if many items pass</td></tr>
    <tr><td>Filter during ANN search</td><td>index skips non-matching items</td><td>the general case (Qdrant, Weaviate, Milvus, pgvector 0.8+)</td><td>very selective filters degrade recall</td></tr>
    <tr><td>Partition per tenant</td><td>one index per restaurant or customer</td><td>strict multi-tenant separation</td><td>many small indexes to manage</td></tr>
  </table>

  <h2 id="vd-hybrid"><span class="num">11</span>Hybrid Search</h2>
  <p>Embeddings match meaning but blur exact strings. A dish code like "K12", an order number, a version number or a brand-new dish name may barely affect the embedding, while keyword search matches it perfectly. Keyword search, in turn, misses paraphrase, as section 01 showed. The two methods fail in different places, which suggests running both. <strong>Hybrid search</strong> does exactly that: it runs a dense (embedding) search and a keyword search, then merges the two ranked lists.</p>
  <p>The difficulty is merging. A cosine of 0.998 and a keyword score of 0.455 are on different scales and cannot simply be added. <strong>Reciprocal Rank Fusion</strong> (RRF) ignores the scores and uses only positions: each list gives a document 1 ÷ (60 + rank) points, where rank 1 is first, and the points are summed. The constant 60 keeps a single first place from dominating. By hand for "fiery paneer wrap": the dense list ranks spicy paneer roll 1st and fiery chicken kathi 2nd; the keyword list ranks mild chicken wrap 1st, fiery chicken kathi 2nd and spicy paneer roll 3rd. So spicy paneer roll gets 1/61 + 1/63 = 0.03227, fiery chicken kathi gets 1/62 + 1/62 = 0.03226, and mild chicken wrap, found only by keywords, gets 1/61 = 0.01639.</p>
  <div class="fx" data-lang="py">def rrf(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, doc in enumerate(ranking, start=1):
            scores[doc] = scores.get(doc, 0) + 1 / (k + rank)
    return sorted(scores.items(), key=lambda kv: -kv[1])

q_text = "fiery paneer wrap"
dense = [n for n, _ in semantic_search(q_text)]
keyword = [n for n, s in keyword_search(q_text) if s &gt; 0]
print("dense  :", dense)
print("keyword:", keyword)
for doc, s in rrf([dense, keyword]):
    print(f"  {s:.5f}  {doc}")</div>
  <div class="fx" data-lang="text">dense  : ['spicy paneer roll', 'fiery chicken kathi', 'spicy chicken biryani']
keyword: ['mild chicken wrap', 'fiery chicken kathi', 'spicy paneer roll']
  0.03227  spicy paneer roll
  0.03226  fiery chicken kathi
  0.01639  mild chicken wrap
  0.01587  spicy chicken biryani</div>
  <p>The code reproduces the hand calculation. Documents found by both searches collect two terms and rise above documents found by one, so the right dish is first, and the keyword-only "mild chicken wrap" is kept but ranked lower. The two score scales never had to agree. Think of two waiters, one who remembers what customers <em>meant</em> ("something fiery with paneer") and one who remembers exact order codes ("K12"); a dish both of them suggest is almost certainly right. Weighted score fusion, such as 0.7 × cosine + 0.3 × keyword score, is the alternative, but it needs both scores normalised and the right weight changes with every type of query, which makes RRF the robust default. In RAG, hybrid search is the wide first net, and a cross-encoder reranker then narrows the candidates to the best few (<a class="xref" data-note="rag">RAG</a>).</p>

  <h2 id="vd-tools"><span class="num">12</span>Vector Databases in Practice</h2>
  <p>We have built every piece by hand: embeddings, flat search, IVF, HNSW, PQ, filters and hybrid search. In production you pick a product that packages them. The most important difference between products is not the index (most offer HNSW, many also IVF and PQ) but what kind of software each one is: a <strong>library</strong> you call from your code, a database embedded in your process, an <strong>extension</strong> to a database you already run, a server you operate, or a service you rent. A vector library such as FAISS provides only the index algorithms; a vector database adds storage, metadata, filtering, updates, replication and an API around them.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>What it is</th><th>Filtering</th><th>Good fit</th><th>Watch out for</th></tr>
    <tr><td><strong>FAISS</strong></td><td>C++/Python library (Meta): flat, IVF, HNSW, PQ, GPU</td><td>ID selectors only</td><td>research, batch jobs, building your own service</td><td>no persistence, metadata or replication: not a database</td></tr>
    <tr><td><strong>Chroma</strong></td><td>embedded or client–server database</td><td>metadata <code>where</code> filters</td><td>prototypes, notebooks, small apps</td><td>younger story for scaling and operations</td></tr>
    <tr><td><strong>pgvector</strong></td><td>Postgres extension: exact, IVFFlat, HNSW</td><td>full SQL <code>WHERE</code> and JOINs</td><td>you already run Postgres; up to tens of millions of vectors</td><td>shares the machine with your main workload</td></tr>
    <tr><td><strong>Pinecone</strong></td><td>fully managed service</td><td>metadata filters during search</td><td>no infrastructure team</td><td>cost at volume, lock-in, data leaves your network</td></tr>
    <tr><td><strong>Weaviate</strong>, <strong>Qdrant</strong></td><td>open-source servers (with cloud versions)</td><td>filters during HNSW search; built-in hybrid</td><td>production apps with heavy, selective filters</td><td>another stateful system to run</td></tr>
    <tr><td><strong>Milvus</strong></td><td>distributed open-source server</td><td>scalar filtering</td><td>hundreds of millions to billions of vectors</td><td>many components; heavy for small apps</td></tr>
  </table>
  <p>Three questions decide most cases. How many vectors? If they fit in one machine's memory, almost anything works, including pgvector; billions call for a distributed, compressed system. How selective are the filters? Per-customer filters that keep 1% of the data need filtering during the search. Who will operate it? With no operations team, a managed service is simplest; if you already run Postgres, pgvector keeps everything in one system and lets you JOIN vectors with ordinary business data. A rough picture: FAISS is a professional stove, the best part of a kitchen but not a restaurant; pgvector is adding a tandoor to the kitchen you already run; Pinecone is ordering from a cloud kitchen.</p>
  <p>Biteful already keeps its menu in Postgres, so here is the menu search in pgvector. The SQL below needs a Postgres server with the extension installed, so it was not run for this note. The table gets a <code>vector(16)</code> column next to the ordinary columns (a real model would use <code>vector(384)</code> or <code>vector(1536)</code>):</p>
  <div class="fx" data-lang="sql">CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE menu (
  id         serial PRIMARY KEY,
  name       text,
  veg        boolean,
  restaurant text,
  price      int,
  embedding  vector(16)
);</div>
  <p>Python writes the rows, formatting each embedding in pgvector's text form <code>'[x1,x2,…]'</code> (with a database driver such as psycopg you would pass vectors as query parameters instead of building strings):</p>
  <div class="fx" data-lang="py">vec_sql = lambda v: "'[" + ",".join(f"{x:.4f}" for x in v) + "]'"     # pgvector's text form
rows = [f"('{n}', {str(veg).lower()}, '{rest}', {price}, {vec_sql(X[i])})"
        for i, (n, veg, rest, price) in enumerate(menu)]
insert_sql = "INSERT INTO menu (name, veg, restaurant, price, embedding) VALUES\\n" + ",\\n".join(rows) + ";"
print(insert_sql.splitlines()[1][:88], "...")</div>
  <div class="fx" data-lang="text">('spicy paneer roll', true, 'Tandoor Tales', 149, '[-0.5637,-0.1860,0.0857,-0.2314,-0.17 ...</div>
  <p>Then an HNSW index and the searches. <code>&lt;=&gt;</code> is pgvector's cosine <em>distance</em> operator, 1 − cosine, so smaller means closer, and <code>ORDER BY … LIMIT 3</code> in the default ascending order returns the three nearest dishes:</p>
  <div class="fx" data-lang="sql">CREATE INDEX ON menu USING hnsw (embedding vector_cosine_ops);

-- :q is the query's embedding, passed in by the application
SELECT name, restaurant, 1 - (embedding &lt;=&gt; :q) AS cosine
FROM menu
ORDER BY embedding &lt;=&gt; :q
LIMIT 3;

-- meaning plus ordinary SQL in one statement
SELECT name, price, 1 - (embedding &lt;=&gt; :q) AS cosine
FROM menu
WHERE veg AND price &lt; 200
ORDER BY embedding &lt;=&gt; :q
LIMIT 3;</div>
  <p>With the same vectors, the first query returns the same ranking as the NumPy search in section 02, and the second returns the nearest veg dishes under ₹200, with filters, JOINs and transactions working exactly as in any other Postgres query. That is pgvector's main selling point. Two details cause most mistakes. The index's operator class must match the operator: <code>vector_cosine_ops</code> serves <code>&lt;=&gt;</code> only, so ordering by <code>&lt;-&gt;</code> silently ignores the index. And because all three operators are distances, <code>ORDER BY … DESC</code> returns the <em>least</em> similar rows. Finally, with an HNSW index, older pgvector versions apply the <code>WHERE</code> clause after the index returns its candidates, which is the post-filter trap of section 10; raise <code>hnsw.ef_search</code>, use the iterative index scans of pgvector 0.8 and later, or use partial indexes per restaurant. The next note, <a class="xref" data-note="rag">Retrieval-Augmented Generation</a>, replaces the 12 dish names with chunks of Biteful's help-centre documents and hands the retrieved chunks to an LLM to write an answer.</p>

  <h2 id="vd-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most damaging mistake is mixing embedding models. If the index was built with one model and queries are embedded with another, or with a new version of the same model, similarity scores become meaningless while everything still runs. We can imitate this by "embedding" queries with a scrambled copy of our word vectors, which is what a different model looks like from the index's point of view:</p>
  <div class="fx" data-lang="py">W_other = W[:, np.random.default_rng(5).permutation(16)]      # "another model": same words, other axes
def embed_other(text):
    v = np.mean([W_other[idx[w]] for w in text.split() if w in idx], axis=0)
    return v / np.linalg.norm(v)
q = "fiery paneer wrap"
print("same model     :", [names[i] for i in np.argsort(-(X @ embed(q)))[:3]])
print("different model:", [names[i] for i in np.argsort(-(X @ embed_other(q)))[:3]])</div>
  <div class="fx" data-lang="text">same model     : ['spicy paneer roll', 'fiery chicken kathi', 'spicy chicken biryani']
different model: ['egg roll', 'mild paneer tikka masala', 'spicy chicken biryani']</div>
  <p>With the right model, "spicy paneer roll" is first; with the mismatched one, the ranking is essentially random and nothing warns you. Store the model name and version with every index, and re-embed the whole collection, usually into a new index that you switch to, whenever the model changes.</p>
  <p>The second mistake is storing vectors that are not normalised in an index configured for the dot product. Section 03 showed that on unequal-length vectors the dot-product ranking differs from cosine; long texts then win just for being long. Normalise once when storing, or use the metric the model was trained for.</p>
  <p>The third is post-filtering selective filters. It passes every demo, because demo filters keep most of the data, and returns empty results for small restaurants or customers in production, as section 10 measured (91% of queries empty). Filter before or during the search, and test with your most selective realistic filter.</p>
  <p>Beyond these, a few mistakes come up repeatedly. Judging an index without an exact-search ground truth means you cannot tell whether nprobe, ef or PQ settings are losing results. Forgetting that IVF centroids and PQ codebooks are learned from the data lets recall decay silently as the data drifts. Sorting a pgvector distance in descending order returns the worst matches. And trusting synthetic or vendor benchmarks instead of measuring recall and p95 latency on your own vectors and queries leads to choices that look good on paper only.</p>

  <h2 id="vd-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Embedding</b>: a fixed-length vector standing for a text; similar meanings point in similar directions. Usually normalised to length 1.</li>
    <li><b>Sentence embedding model</b>: Transformer encoder + pooling + normalisation, trained contrastively on matching pairs. A <b>bi-encoder</b> embeds query and document separately; a <b>cross-encoder</b> reads them together (re-ranking only).</li>
    <li><b>Semantic search</b>: nearest-neighbour search over embeddings. <b>Vector database</b>: vectors + metadata + an index for fast k-nearest-neighbour queries, with filters, updates and persistence.</li>
    <li><b>Flat (exact) search</b>: compare with all N vectors; cost N·d per query; recall 1.0; the ground truth.</li>
    <li><b>ANN index</b>: returns probably-nearest vectors while comparing with only a fraction. <b>Recall@k</b> = |returned ∩ true top k| ÷ k.</li>
    <li><b>IVF</b>: k-means cells; search the nprobe nearest cells. <b>HNSW</b>: layered neighbour graph; greedy descent, then a candidate list of size ef on layer 0. <b>PQ</b>: vector split into m pieces, each stored as a codebook ID.</li>
    <li><b>Post-filtering</b>: filter after the top-k search. <b>Pre-/in-filtering</b>: filter before or during it.</li>
    <li><b>Hybrid search</b>: dense + keyword retrieval merged. <b>RRF</b>: score = Σ 1 ÷ (60 + rank).</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>Cosine</td><td>a·b ÷ (‖a‖ ‖b‖)</td></tr>
    <tr><td>Unit-vector identity</td><td>‖a − b‖² = 2 − 2 cos(a, b), so L2, dot and cosine rank alike</td></tr>
    <tr><td>Flat search cost</td><td>N × d multiply-adds per query (10M × 1,536 = 15.4 billion)</td></tr>
    <tr><td>IVF cost</td><td>K + nprobe × N ÷ K comparisons; K ≈ √N to start</td></tr>
    <tr><td>HNSW level</td><td>⌊−ln U ÷ ln M⌋, U uniform in (0, 1)</td></tr>
    <tr><td>PQ storage</td><td>m × log₂K bits per vector (K = 256 → m bytes)</td></tr>
    <tr><td>PQ score</td><td>q·x ≈ Σ<sub>j</sub> table[j, code<sub>j</sub>(x)]</td></tr>
    <tr><td>RRF</td><td>Σ over lists of 1 ÷ (60 + rank)</td></tr>
  </table>
  <h3>Index comparison</h3>
  <table class="tbl">
    <tr><th>Index</th><th>Idea</th><th>Strength</th><th>Weakness</th><th>Use when</th></tr>
    <tr><td>Flat</td><td>compare with all</td><td>exact, no tuning</td><td>cost grows with N</td><td>&lt; ~100k vectors; ground truth</td></tr>
    <tr><td>IVF</td><td>k-means cells, nprobe</td><td>less memory than HNSW</td><td>boundary misses; retrain on drift</td><td>large sets; GPU batch search</td></tr>
    <tr><td>HNSW</td><td>layered graph, ef</td><td>best recall per ms; live inserts</td><td>all in RAM; slow build; deletes</td><td>default when it fits in memory</td></tr>
    <tr><td>IVF-PQ</td><td>cells + compressed codes</td><td>16–64× less memory</td><td>approximate scores</td><td>hundreds of millions+; re-rank</td></tr>
  </table>
  <h3>pgvector</h3>
  <div class="fx" data-lang="sql">embedding vector(384)                                         -- column type
CREATE INDEX ON t USING hnsw (embedding vector_cosine_ops);   -- opclass must match operator
SELECT * FROM t ORDER BY embedding &lt;=&gt; :q LIMIT 5;          -- &lt;=&gt; cosine distance, ascending
-- &lt;-&gt; L2 distance, &lt;#&gt; negative inner product</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Same embedding model and version for documents and queries; re-embed on change.</li>
    <li>Normalise vectors; then use the dot product.</li>
    <li>Measure ANN recall against flat search on your own data.</li>
    <li>IVF: raise nprobe for boundary misses. HNSW: raise ef_search for local minima.</li>
    <li>PQ needs re-ranking with full vectors when recall matters.</li>
    <li>Never post-filter a selective filter.</li>
    <li>Fuse dense and keyword results with RRF, not raw score sums.</li>
    <li>pgvector operators are distances: sort ascending.</li>
  </ul>

  <h2 id="vd-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is an embedding?</summary><div class="qa-body">A fixed-length vector that represents a piece of text (or an image, or a product) so that similar meanings point in similar directions. It is produced by a trained model, usually normalised to length 1, and compared with cosine similarity. Its individual numbers have no names; only distances and angles between embeddings matter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't keyword search find semantically similar items?</summary><div class="qa-body">Keyword methods such as TF-IDF or BM25 give every word its own axis, so synonyms are unrelated. "Fiery paneer wrap" matched "mild chicken wrap" through the shared word "wrap" and ranked "spicy paneer roll" lower. Embeddings place related words and phrases close together, so nearest-neighbour search finds similar meanings.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a vector database, and how is it different from FAISS?</summary><div class="qa-body">A vector database stores vectors with metadata and provides fast nearest-neighbour search plus filtering, updates, persistence, access control and replication. FAISS is a library of index algorithms only: excellent for research, batch jobs or building your own service, but with no storage, metadata filtering or serving layer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a sentence embedding model produce one vector per text?</summary><div class="qa-body">A Transformer encoder outputs a vector per token; pooling (usually the mean, or a special token's vector) turns them into one vector, which is normalised to length 1. The model is trained contrastively on matching pairs so that related texts end up close. It is a bi-encoder: queries and documents are embedded separately, so documents can be embedded ahead of time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bi-encoder vs cross-encoder?</summary><div class="qa-body">A bi-encoder embeds the query and each document separately, so document vectors can be precomputed and searched among millions; it is fast but less precise. A cross-encoder reads the query and one document together and outputs a relevance score; it is more accurate but needs one model run per pair. Use a bi-encoder to retrieve a shortlist and a cross-encoder to re-rank it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When are cosine, dot product and Euclidean distance equivalent?</summary><div class="qa-body">When all vectors have length 1. Then cosine equals the dot product, and the squared Euclidean distance equals 2 − 2 × cosine, so all three produce the same ranking. Normalise once when storing and use the dot product, which is cheapest. On unnormalised vectors the dot product favours longer vectors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does recall@k measure, and what does it not measure?</summary><div class="qa-body">Recall@k is the fraction of the true k nearest neighbours (from exact search) that an approximate index returns. It measures how much the index loses compared with exact search. It does not measure whether the results are actually relevant to the user; that depends on the embedding model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>True top 3 is {A, B, C}; the index returns {B, C, E}. What is recall@3?</summary><div class="qa-body">Two of the three true neighbours were returned, so recall@3 = 2 ÷ 3 ≈ 0.67.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does IVF work, and what is its main failure mode?</summary><div class="qa-body">k-means splits the vectors into K cells around centroids. A query compares itself with the K centroids and runs exact search only inside the nprobe nearest cells. Its weakness is the boundary problem: a query near a cell's edge has true neighbours in other cells. On our menu, "hot and spicy" found 1 of its true top 3 with nprobe = 1 and all 3 with nprobe = 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>1M vectors, IVF with K = 1,000 and nprobe = 10: roughly how many comparisons per query?</summary><div class="qa-body">1,000 comparisons with the centroids, plus 10 cells of about 1,000 vectors each, so about 11,000, compared with 1,000,000 for exact search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain how HNSW achieves fast search.</summary><div class="qa-body">Each vector gets a random top level, so upper layers hold few vectors with long links and layer 0 holds all vectors with short links. A search starts at the top entry point, moves greedily towards the query, drops a layer when stuck, and on layer 0 keeps a candidate list of size ef to avoid local minima. The number of hops grows roughly with log N. The cost is that every vector and its links must be held in memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does ef_search do in HNSW?</summary><div class="qa-body">It is the size of the candidate list kept during the layer-0 search. A larger value explores more of the graph, escaping local minima and raising recall, at the cost of more distance computations. On our menu, ef = 1 got stuck at "hot masala chai" for "light curry", while ef = 3 found "mild paneer tikka masala".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does product quantisation compress a 768-number float32 vector 32 times?</summary><div class="qa-body">Split it into 96 pieces of 8 numbers, learn a codebook of 256 typical pieces for each position with k-means, and store each piece as the 1-byte ID of its nearest codebook entry. 768 × 4 = 3,072 bytes becomes 96 bytes. Scores are approximated by summing 96 lookups in a per-query table, so the top candidates are usually re-ranked with full vectors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>HNSW or IVF-PQ for 20 million chunks? For 2 billion?</summary><div class="qa-body">20 million 768-number vectors are about 61 GB plus links, so HNSW on a machine with that much memory is reasonable and gives the best recall and latency. At 2 billion, the raw vectors alone are terabytes, so use IVF-PQ or a disk-based graph such as DiskANN, accept some recall loss, re-rank the shortlist, and retrain codebooks periodically.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your multi-tenant app filters by tenant and results come back nearly empty. Why?</summary><div class="qa-body">Post-filtering: the index returns the global top k and the tenant filter then removes almost all of them. With a tenant owning 1% of the data, a top-10 search leaves about 0.1 results on average. Filter during the search, pre-filter and use exact search for small tenants, or partition the index per tenant.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Dense ranks [A, B, C] and BM25 ranks [C, A, D]. What is the RRF order with k = 60?</summary><div class="qa-body">A = 1/61 + 1/62 ≈ 0.03252; C = 1/63 + 1/61 ≈ 0.03227; B = 1/62 ≈ 0.01613; D = 1/63 ≈ 0.01587. The order is A, C, B, D: documents found by both lists beat documents found by one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You upgraded the embedding model and retrieval got worse with no errors. What happened?</summary><div class="qa-body">The queries are embedded with the new model while the index still holds vectors from the old one. The two models use unrelated coordinate systems, so similarities are meaningless. Re-embed the whole collection with the new model, ideally into a new index that you switch to, and record the model version with the index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>SELECT name FROM menu ORDER BY embedding &lt;=&gt; :q DESC LIMIT 1</code> return?</summary><div class="qa-body">The least similar dish. <code>&lt;=&gt;</code> is cosine distance (1 − cosine), so smaller means closer. Remove <code>DESC</code> to get the nearest dish, and display <code>1 - (embedding &lt;=&gt; :q)</code> if you want a similarity score.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why keep an exact (flat) index if production uses HNSW?</summary><div class="qa-body">Recall can only be measured against the exact answer. Running flat search over a sample of vectors for a set of test queries gives the true top k, which tells you whether ef_search, nprobe or compression settings are losing results. Without it you are tuning blind.</div></details>
</main>
`
});
