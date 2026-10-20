// notes/genai/vectordb.js — Embeddings & Vector DBs
Object.assign(TOPIC_CONTENT, {
  "vectordb": `<main>
  <h1>Embeddings &amp; Vector DBs</h1>
  <div class="where"><span>Generative AI</span><span>Embeddings &amp; Vector DBs</span></div>
  <p class="lead">How a computer searches by <em>meaning</em> instead of by exact words: turn each text into a vector, then find the closest vectors, fast, at millions of items, with filters. <strong>Running example throughout:</strong> Biteful's menu search. A customer types "fiery paneer wrap"; the menu says "spicy paneer roll". The 12 dishes below, embedded with the Word2Vec model trained on the same synthetic Biteful reviews as <a class="xref" data-note="nlp">NLP Foundations</a>, carry every hand trace; a synthetic set of 100,000 vectors shows the same ideas at scale. No pretrained sentence-embedding model could be downloaded in this environment (huggingface.co is blocked), so the note says exactly what stands in for one. This is the search engine inside <a class="xref" data-note="rag">RAG</a>. Every code block ran here (NumPy, scikit-learn, gensim 4.4, FAISS 1.15 CPU, PostgreSQL 16 + pgvector 0.6; single thread).</p>

  <h2 id="vd-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 200" width="680">
<defs><marker id="vd-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="31" text-anchor="middle" font-size="12">NLP Foundations</text><text x="90" y="48" text-anchor="middle" class="tm" font-size="10">vectors, cosine, TF-IDF</text>
<rect x="10" y="75" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="96" text-anchor="middle" font-size="12">Transformers</text><text x="90" y="113" text-anchor="middle" class="tm" font-size="10">contextual encoders</text>
<rect x="10" y="140" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="161" text-anchor="middle" font-size="12">k-means · kNN</text><text x="90" y="178" text-anchor="middle" class="tm" font-size="10">clusters, neighbours</text>
<rect x="250" y="72" width="170" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="335" y="95" text-anchor="middle" font-size="13" font-weight="700">Vector DBs</text><text x="335" y="114" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="500" y="40" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="585" y="61" text-anchor="middle" font-size="12">RAG</text><text x="585" y="78" text-anchor="middle" class="tm" font-size="10">retrieve, then generate</text>
<rect x="500" y="115" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="585" y="136" text-anchor="middle" font-size="12">Recommenders</text><text x="585" y="153" text-anchor="middle" class="tm" font-size="10">"similar items" at scale</text>
<line x1="170" y1="35" x2="248" y2="88" stroke="currentColor" marker-end="url(#vd-a0)"/><line x1="170" y1="100" x2="248" y2="100" stroke="currentColor" marker-end="url(#vd-a0)"/><line x1="170" y1="165" x2="248" y2="112" stroke="currentColor" marker-end="url(#vd-a0)"/>
<line x1="420" y1="92" x2="498" y2="68" stroke="currentColor" marker-end="url(#vd-a0)"/><line x1="420" y1="108" x2="498" y2="138" stroke="currentColor" marker-end="url(#vd-a0)"/>
</svg><figcaption>Vector search takes the vectors of NLP and Transformers and the clustering/neighbour ideas of classic ML, and serves RAG and recommenders.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="nlp">NLP Foundations</a> and <a class="xref" data-note="transformers">Transformers</a></b><span>NLP showed that TF-IDF scores "great" and "good" as unrelated (0) while averaged word embeddings score R1 and R2 at 0.969, and defined cosine similarity. Transformers showed how an encoder produces context-aware vectors. Nearest-neighbour thinking is the same as user/item similarity in <a class="xref" data-note="ml_cf">Collaborative Filtering</a> and content-based <a class="xref" data-note="ml_recsys">Recommender Systems</a>.</span></li>
    <li><b>This note adds: search by meaning, at scale</b><span>One vector per text (sentence embeddings), exact search and what it costs, approximate indexes (IVF, HNSW, product quantisation), the recall–speed trade-off measured, metadata filters, hybrid keyword + vector search, and an honest tour of the tools.</span></li>
    <li><b>Leads to: <a class="xref" data-note="rag">Retrieval-Augmented Generation</a></b><span>RAG = this note's search over chunks of your documents, then an LLM (<a class="xref" data-note="llm_basics">How LLMs Work</a>) writes the answer from what was retrieved.</span></li>
  </ol>

  <h2 id="vd-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers are from Biteful's 12-dish menu, and from 100,000 synthetic vectors where scale matters.</p>
  <ol class="story">
    <li><b>The search problem</b><span>Q: why can't the menu search find "spicy paneer roll" for "fiery paneer wrap"? → Keyword search (TF-IDF) ranks "mild chicken wrap" first: it shares the word "wrap", and the meaning is the opposite. We need to compare meanings…</span></li>
    <li><b>Sentence embeddings</b><span>Q: how does a whole dish name become one vector? → Pool word/token vectors into one unit vector (real systems: a Transformer trained on matching pairs; here: averaged Word2Vec, stated as a stand-in). Now "spicy paneer roll" is first (0.999). But "closest" by which measure?</span></li>
    <li><b>Similarity metrics</b><span>Q: cosine, dot or Euclidean? → Normalise once; then all three give the same ranking and the dot product is cheapest. Now search = "highest dot product". How expensive is that?</span></li>
    <li><b>Brute-force search</b><span>Q: what does exact search cost? → One dot product per item: 12 for the menu, but time grows linearly with N (measured at 10k, 100k, 1M); 10M × 1,536 is 15 billion multiply-adds per query. Can we skip most items?</span></li>
    <li><b>The ANN idea</b><span>Q: what if we accept "almost always the true nearest"? → Approximate nearest neighbour indexes trade a little recall for big speed-ups. Recall@k measures the loss. How do we skip items?</span></li>
    <li><b>IVF</b><span>Q: can we search only the right neighbourhood? → k-means the items into clusters, probe the nprobe closest. "something hot" sits between the hot-drink and food clusters: nprobe = 1 finds 1 of its true top 3, nprobe = 2 finds all. Clusters have edges; is there a structure without edges?</span></li>
    <li><b>HNSW</b><span>Q: can we walk towards the answer? → A layered neighbour graph: big jumps on top, small steps at the bottom, a candidate list of size ef so one bad turn doesn't end the search. Fast and accurate, but every full vector sits in RAM…</span></li>
    <li><b>Product quantisation</b><span>Q: how do we fit billions of vectors in memory? → Cut each vector into pieces, store each piece as a 1-byte codebook ID: 256 bytes → 16 bytes per vector here (16×). Distances become approximate; re-rank the top candidates. Which index should we pick?</span></li>
    <li><b>Recall vs speed, measured</b><span>Q: what does each choice buy? → One table on the same 100k vectors: recall@10, ms per query, bytes per vector for flat, IVF, HNSW, PQ, IVF-PQ + re-rank. But real queries also say "veg only"…</span></li>
    <li><b>Metadata filtering</b><span>Q: how do we combine meaning with "veg only" or "this restaurant"? → Filtering after the search can return nothing (the menu: 0 of 3 results survive); filter during or before the search. Embeddings still blur exact words like dish codes…</span></li>
    <li><b>Hybrid search</b><span>Q: how do we get both meaning and exact keywords? → Run dense and keyword search, fuse ranks with RRF (Σ 1/(60 + rank)). Which product does all this?</span></li>
    <li><b>Tools</b><span>Q: FAISS, Chroma, pgvector, Pinecone, Weaviate, Milvus? → A library vs embedded vs extension vs managed vs distributed; choose by scale, filters and who operates it. Then build the menu search in Postgres, the retrieval half of RAG.</span></li>
  </ol>

  <h2 id="vd-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
  <div class="mm-center">Embeddings &amp; Vector DBs</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Why vector search</div>
      <ul>
        <li><b>Gap</b> — keyword match ≠ meaning: "fiery paneer wrap" → "mild chicken wrap"</li>
        <li><b>Pipeline</b> — items → embed → store; query → same model → k nearest</li>
        <li>⚠ <b>Doesn't replace SQL</b> — filters (veg, restaurant, user) still needed</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Sentence embeddings</div>
      <ul>
        <li><b>What</b> — one fixed-length unit vector per text</li>
        <li><b>Real</b> — Transformer + pooling + contrastive training; bi-encoder</li>
        <li><b>Here</b> — averaged Word2Vec (16-d), a stated stand-in</li>
        <li>⚠ <b>Models don't mix</b> — new model = re-embed everything</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Metrics &amp; exact search</div>
      <ul>
        <li><b>Cosine</b> = dot on unit vectors; ‖a − b‖² = 2 − 2 cos</li>
        <li><b>Brute force</b> — N dot products per query, linear in N</li>
        <li><b>10M × 1,536</b> ≈ 15 billion multiply-adds per query</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">ANN indexes</div>
      <ul>
        <li><b>Recall@k</b> — share of the true top k returned</li>
        <li><b>IVF</b> — k-means cells, probe nprobe; ⚠ boundary misses</li>
        <li><b>HNSW</b> — layered graph, greedy + ef beam; ⚠ RAM</li>
        <li><b>PQ</b> — m sub-vectors × 1-byte codes; ⚠ approximate, re-rank</li>
        <li><b>Triangle</b> — recall vs latency vs memory</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Filters &amp; hybrid</div>
      <ul>
        <li>⚠ <b>Post-filter</b> — top k, then filter → often empty</li>
        <li><b>Pre / in-filter</b> — restrict candidates during search</li>
        <li><b>RRF</b> — Σ 1/(60 + rank) over dense and BM25 lists</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Tools</div>
      <ul>
        <li><b>FAISS</b> library · <b>Chroma</b> embedded · <b>pgvector</b> in Postgres</li>
        <li><b>Pinecone</b> managed · <b>Weaviate</b> / <b>Qdrant</b> / <b>Milvus</b> servers</li>
        <li><b>pgvector</b> — <code>&lt;=&gt;</code> cosine distance; ascending = closest</li>
      </ul>
    </div>
  </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="vd-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="vd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Meaning, Not Same Words</span><span class="rm-sub">Why keyword search fails</span></div></div>
      <div class="rm-item rm-done" data-target="vd-emb"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Sentence Embeddings</span><span class="rm-sub">One vector per dish</span></div></div>
      <div class="rm-item rm-done" data-target="vd-sim"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Similarity Metrics</span><span class="rm-sub">Cosine, dot, Euclidean</span></div></div>
      <div class="rm-item rm-done" data-target="vd-brute"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Brute-Force Search</span><span class="rm-sub">Exact, and its cost measured</span></div></div>
      <div class="rm-item rm-done" data-target="vd-ann"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The ANN Idea</span><span class="rm-sub">Recall for speed</span></div></div>
      <div class="rm-item rm-done" data-target="vd-ivf"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">IVF</span><span class="rm-sub">Clusters, nprobe traced</span></div></div>
      <div class="rm-item rm-done" data-target="vd-hnsw"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">HNSW</span><span class="rm-sub">Greedy search on a tiny graph</span></div></div>
      <div class="rm-item rm-done" data-target="vd-pq"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Product Quantisation</span><span class="rm-sub">Compression computed</span></div></div>
      <div class="rm-item rm-done" data-target="vd-tradeoff"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Recall vs Speed, Measured</span><span class="rm-sub">One table, every index</span></div></div>
      <div class="rm-item rm-done" data-target="vd-filter"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Metadata Filtering</span><span class="rm-sub">The post-filter trap</span></div></div>
      <div class="rm-item rm-done" data-target="vd-hybrid"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Hybrid Search</span><span class="rm-sub">Dense + keyword via RRF</span></div></div>
      <div class="rm-item rm-done" data-target="vd-tools"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Tools Compared</span><span class="rm-sub">FAISS to Milvus, honestly</span></div></div>
      <div class="rm-item rm-done" data-target="vd-build"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Build It in pgvector</span><span class="rm-sub">Semantic menu search in SQL</span></div></div>
      <div class="rm-item rm-done" data-target="vd-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">From meaning to RAG</span></div></div>
      <div class="rm-item rm-done" data-target="vd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="vd-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="vd-why"><span class="num">01</span>Find Similar Meaning, Not Same Words</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A Biteful customer types "fiery paneer wrap". The menu has no dish with those words; the closest in meaning is "spicy paneer roll". What does ordinary keyword search return, and why?</p>
  </div>
  <p>The menu we use for the whole note: 12 dishes from four (fictional) restaurants, with the details a real filter needs.</p>
<div class="fx" data-lang="py">import numpy as np, re, time
np.set_printoptions(precision=3, suppress=True)
menu = [  # (dish, veg?, restaurant, price in rupees)
    ("spicy paneer roll", True, "Tandoor Tales", 149),       ("mild chicken wrap", False, "Wrap Republic", 169),
    ("fiery chicken kathi", False, "Tandoor Tales", 179),     ("mild veg kathi", True, "Wrap Republic", 129),
    ("spicy chicken biryani", False, "Biryani Bros", 249),    ("mild paneer tikka masala", True, "Biryani Bros", 229),
    ("hot masala chai", True, "Steam House", 49),             ("cold coffee", True, "Steam House", 99),
    ("steaming filter coffee", True, "Steam House", 79),      ("warm tomato soup", True, "Steam House", 109),
    ("egg roll", False, "Wrap Republic", 99),                 ("mild veg curry", True, "Biryani Bros", 189),
]
names = [m[0] for m in menu]

from sklearn.feature_extraction.text import TfidfVectorizer
tfidf = TfidfVectorizer().fit(names)
def keyword_search(query, k=3):
    s = (tfidf.transform(names) @ tfidf.transform([query]).T).toarray().ravel()   # cosine of TF-IDF rows
    top = np.argsort(-s)[:k]
    return [(names[i], round(float(s[i]), 3)) for i in top]
for q in ["fiery paneer wrap", "something hot to drink"]:
    print(f"{q!r:26} -&gt;", keyword_search(q))</div>
  <div class="fx" data-lang="text">'fiery paneer wrap'        -&gt; [('mild chicken wrap', 0.423), ('fiery chicken kathi', 0.397), ('spicy paneer roll', 0.3)]
'something hot to drink'   -&gt; [('hot masala chai', 0.604), ('spicy paneer roll', 0.0), ('fiery chicken kathi', 0.0)]</div>
  <p>TF-IDF (from <a class="xref" data-note="nlp">NLP Foundations</a>) turns each dish name into a weighted word-count vector; scikit-learn's rows have length 1, so a matrix product gives cosine similarities. For "fiery paneer wrap" the top result is "mild chicken wrap": it shares the rare word "wrap", and it is the opposite of what the customer wants. "spicy paneer roll" only scores through "paneer". For "something hot to drink", only "hot masala chai" shares a word; coffee and soup score 0, so they are simply missing.</p>
  <p>The fix, in one sentence: <strong>turn every text into a point in space so that texts with similar meaning land close together</strong>, then "find similar dishes" becomes "find the nearest points". A text turned into such a point is an <strong>embedding</strong>, and a system built to store these points and find the nearest ones fast is a <strong>vector database</strong>.</p>
  <div class="flow"><span>dishes</span><span>embedding model</span><span>vectors + metadata stored</span><span>query → same model</span><span>k nearest</span><span>dish names back</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding a restaurant by its exact name is keyword search. Asking a delivery app for "all restaurants within 2 km" compares your location with every restaurant's location. A vector database does the same, except a "location" has hundreds of coordinates and "close" means "similar meaning".</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>SQL / keyword</th><th>Vector search</th></tr>
    <tr><td>Query</td><td><code>WHERE name LIKE '%wrap%'</code></td><td>nearest to embed("fiery paneer wrap")</td></tr>
    <tr><td>Index</td><td>B-tree / inverted index, exact</td><td>ANN index, approximate (section 05)</td></tr>
    <tr><td>Finds</td><td>exact words, ranges, IDs</td><td>same meaning, different words</td></tr>
    <tr><td>Fails at</td><td>synonyms, paraphrase</td><td>exact codes and filters on their own</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Semantic search</strong>: retrieving items by similarity of meaning, implemented as nearest-neighbour search over embeddings. <strong>Vector database</strong>: a store of vectors plus metadata with an index for fast k-nearest-neighbour queries, usually combined with filters.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A vector DB does not replace SQL. "Veg dishes under ₹150 from Tandoor Tales" is a filter question; "dishes like this one" is a vector question. Real queries mix both, and section 10 shows how badly that can go if done in the wrong order.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Sentence embeddings.</b> We need one vector per dish name such that "fiery paneer wrap" lands next to "spicy paneer roll". Where does such a vector come from?</div>

  <h2 id="vd-emb"><span class="num">02</span>Sentence Embeddings</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Word2Vec gave one vector per <em>word</em>. A query or a dish name is several words. How do we get one vector for the whole text, and how do the models used in production do it?</p>
  </div>
  <h3>How real sentence-embedding models work</h3>
  <p>A <strong>sentence embedding model</strong> is usually a Transformer encoder (<a class="xref" data-note="transformers">Transformers</a>): it produces one contextual vector per token, then <strong>pools</strong> them into one vector (average, or a special token's vector), then normalises to length 1. Raw BERT pooled this way is a poor similarity model, so these models get extra <strong>contrastive training</strong> on pairs: a question and its correct answer, or two paraphrases, are pulled together; random pairs are pushed apart. After millions of pairs, "fiery paneer wrap" and "spicy paneer roll" end up close.</p>
  <div class="flow"><span>text</span><span>Transformer: a vector per token</span><span>pool → one vector</span><span>normalise to length 1</span></div>
  <p>Such a model is a <strong>bi-encoder</strong>: query and documents are embedded <em>separately</em> by the same model. That is what lets Biteful embed all dishes once, tonight, and only embed the query at search time. (A <strong>cross-encoder</strong> reads query and document together; more accurate, but must run once per pair, so it is used to re-rank a short list, see <a class="xref" data-note="rag">RAG</a>.)</p>
  <table class="tbl">
    <tr><th>Model</th><th>Dims</th><th>Max input</th><th>Note</th></tr>
    <tr><td>OpenAI text-embedding-3-small</td><td>1,536</td><td>8,191 tokens</td><td>Cheap API default; can shorten dims</td></tr>
    <tr><td>OpenAI text-embedding-3-large</td><td>3,072</td><td>8,191 tokens</td><td>Higher accuracy, higher cost</td></tr>
    <tr><td>BAAI bge-m3 (open)</td><td>1,024</td><td>8,192 tokens</td><td>Multilingual; dense + sparse in one</td></tr>
    <tr><td>all-MiniLM-L6-v2 (open)</td><td>384</td><td>256 word pieces</td><td>Tiny, CPU-friendly; lower accuracy</td></tr>
  </table>
  <p>Rankings change every few months: check the MTEB leaderboard, then test the top two or three on <em>your</em> queries. Some models expect prefixes such as <code>query:</code> and <code>passage:</code>; skipping them quietly hurts results.</p>
  <h3>Our stand-in, stated plainly</h3>
  <p>In this environment the usual one-liner (<code>SentenceTransformer("all-MiniLM-L6-v2").encode(texts, normalize_embeddings=True)</code>) cannot download its weights. So we use the simplest sentence embedding there is: <strong>average the Word2Vec vectors of the words, then normalise</strong>, with Word2Vec trained on the same 4,000 synthetic Biteful reviews as the NLP note. It has the same interface (text in, unit vector out) and is enough to show every indexing idea; it is much weaker than a real model (no word order, no context, unknown words dropped).</p>
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
<div class="fx" data-lang="py">from gensim.models import Word2Vec
w2v = Word2Vec(reviews, vector_size=16, window=2, min_count=1, sg=1, negative=5,
               epochs=20, workers=1, seed=1)                     # same settings as the NLP note

def embed(text):
    words = [w for w in text.lower().split() if w in w2v.wv]     # unknown words are dropped
    v = np.mean([w2v.wv[w] for w in words], axis=0)
    return (v / np.linalg.norm(v)).astype("float32")             # unit length

X = np.stack([embed(n) for n in names])                          # the "index": 12 x 16
print("menu matrix:", X.shape, " row lengths:", np.linalg.norm(X, axis=1).round(3)[:3], "...")
print("dropped (not in vocabulary):", sorted({w for n in names for w in n.split() if w not in w2v.wv}))

def semantic_search(query, k=3):
    s = X @ embed(query)                                         # cosine with every dish
    top = np.argsort(-s)[:k]
    return [(names[i], round(float(s[i]), 3)) for i in top]
for q in ["fiery paneer wrap", "something hot to drink", "gentle curry"]:
    print(f"{q!r:26} -&gt;", semantic_search(q))</div>
  <div class="fx" data-lang="text">menu matrix: (12, 16)  row lengths: [1. 1. 1.] ...
dropped (not in vocabulary): ['filter', 'tomato']
'fiery paneer wrap'        -&gt; [('spicy paneer roll', 0.999), ('fiery chicken kathi', 0.998), ('spicy chicken biryani', 0.967)]
'something hot to drink'   -&gt; [('warm tomato soup', 0.778), ('steaming filter coffee', 0.764), ('hot masala chai', 0.669)]
'gentle curry'             -&gt; [('mild chicken wrap', 0.974), ('mild veg kathi', 0.973), ('mild veg curry', 0.957)]</div>
  <p><code>embed</code> looks up each known word, averages, and scales to length 1. <code>X</code> stacks the 12 dish vectors: that matrix <em>is</em> our index. <code>X @ embed(query)</code> computes the cosine with every dish at once (section 03 explains why a dot product is a cosine here). Now "fiery paneer wrap" finds "spicy paneer roll" first, with no shared word except "paneer", because fiery ≈ spicy and wrap ≈ roll in the review-trained space. "something hot to drink" finds hot and steaming drinks, and "gentle curry" finds mild dishes. Two words, "filter" and "tomato", never occur in the reviews and are silently dropped: a weakness a subword model (FastText, or a Transformer's BPE) would not have.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>sentence embedding</strong> is one fixed-length vector (typically 384–3,072 numbers; 16 in our toy) standing for a whole text, usually normalised to length 1, such that similar meanings point in similar directions.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A dish's flavour profile on a spice-level/sweetness/temperature chart: two dishes with different names but the same profile sit at the same spot. The model invents its own hundreds of chart axes and never tells you what they mean.</p></div>
  <div class="callout trap"><span class="label">Trap: models don't mix</span>
    <p>Each model draws its own map: dimension 7 of model A has nothing to do with dimension 7 of model B. Embed the menu with one model and queries with another and you get confident nonsense with no error. Changing models means re-embedding everything; store the model name and version with the index.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Similarity metrics.</b> We ranked by "X @ query" and called it cosine. Vector databases offer cosine, dot product and Euclidean distance. Do they disagree, and which should we use?</div>

  <h2 id="vd-sim"><span class="num">03</span>Similarity Metrics</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Nearest" needs a definition. Cosine ignores length, the dot product rewards it, Euclidean distance measures the gap between tips. On our menu vectors, do the three ever rank dishes differently?</p>
  </div>
  <p>Take a vector and a second one pointing the same way but twice as long, by hand: a = [3, 4], b = [6, 8]. Cosine = 50 / (5 × 10) = 1 (same direction). Dot = 50 (grows with length). Euclidean = √(9 + 16) = 5 (tips 5 apart). After scaling both to length 1 they are the same point: cosine 1, dot 1, distance 0.</p>
<div class="fx" data-lang="py">a, b = np.array([3.0, 4.0]), np.array([6.0, 8.0])
print("cosine", a @ b / (np.linalg.norm(a) * np.linalg.norm(b)), " dot", a @ b, " L2", np.linalg.norm(a - b))
q = embed("fiery paneer wrap")
cos_r = np.argsort(-(X @ q)); l2_r = np.argsort(np.linalg.norm(X - q, axis=1))
print("unit vectors: cosine ranking == L2 ranking:", np.array_equal(cos_r, l2_r))
i = cos_r[0]
print(f"top dish: cos = {X[i] @ q:.4f},  2 - 2*cos = {2 - 2 * X[i] @ q:.4f},  |x - q|^2 = {np.sum((X[i] - q) ** 2):.4f}")
Xraw = X * np.linspace(1, 3, 12)[:, None]                       # same directions, unequal lengths
print("unequal lengths: dot ranking == cosine ranking:", np.array_equal(np.argsort(-(Xraw @ q)), cos_r))</div>
  <div class="fx" data-lang="text">cosine 1.0  dot 50.0  L2 5.0
unit vectors: cosine ranking == L2 ranking: True
top dish: cos = 0.9990,  2 - 2*cos = 0.0020,  |x - q|^2 = 0.0020
unequal lengths: dot ranking == cosine ranking: False</div>
  <p>On unit vectors the three metrics agree: ranking by cosine and by Euclidean distance is identical, and the identity ‖x − q‖² = 2 − 2 cos(x, q) holds to four decimals. The last line stretches the dish vectors to different lengths (same directions): now the raw dot product ranks differently from cosine, because longer vectors win. That is why the practical rule is to <strong>normalise once when storing</strong> and then use the cheap dot product.</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Measures</th><th>pgvector operator</th></tr>
    <tr><td><strong>Cosine</strong></td><td>a·b / (‖a‖ ‖b‖)</td><td>angle only; −1 … 1</td><td><code>&lt;=&gt;</code> (1 − cosine)</td></tr>
    <tr><td><strong>Dot product</strong></td><td>Σ a<sub>i</sub>b<sub>i</sub></td><td>angle and length</td><td><code>&lt;#&gt;</code> (negative dot)</td></tr>
    <tr><td><strong>Euclidean (L2)</strong></td><td>√Σ(a<sub>i</sub> − b<sub>i</sub>)²</td><td>gap between tips</td><td><code>&lt;-&gt;</code></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two customers order the same thali, one plate and ten plates. Cosine says "same taste"; the dot product says the bigger order is "more similar" to everything; normalising is serving everyone one plate before comparing.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>For unit vectors, cosine = dot product and ‖a − b‖² = 2 − 2 cos, so all three metrics produce the same ranking. Use the metric the embedding model was trained with (its card says).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The wrong metric never crashes; it just ranks slightly wrong forever. Typical case: vectors from a model that does not normalise its outputs, stored in an index configured for inner product.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Brute-force search.</b> Search is now "compute q · x for every item and keep the top k". For 12 dishes that is trivial. What does it cost for a city-wide catalogue, and does the cost grow the way we expect?</div>

  <h2 id="vd-brute"><span class="num">04</span>Brute-Force Search, Cost Measured</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Exact search compares the query with every stored vector. Biteful's menu has 12 dishes; across all cities it might have millions, and a RAG system over documents has tens of millions of chunks. How does the cost grow, in real milliseconds?</p>
  </div>
  <p>The menu search above did 12 dot products of 16 numbers: 192 multiply-adds. To see scale we need many more vectors than our 49-word Word2Vec can produce, so from here on, scale experiments use <strong>synthetic vectors</strong>: 64 dimensions, drawn around 500 random "topic" centres with noise and normalised, roughly how real embeddings cluster by topic. They stand in for "100,000 dishes and reviews"; the exact numbers depend on the data and the machine.</p>
<div class="fx" data-lang="py">rng = np.random.default_rng(0)
d, n_topics = 64, 500
centres = rng.normal(size=(n_topics, d))
def sample(n):
    v = centres[rng.integers(0, n_topics, n)] + 1.2 * rng.normal(size=(n, d))
    return (v / np.linalg.norm(v, axis=1, keepdims=True)).astype("float32")
big = sample(1_000_000)                                  # 1M unit vectors (256 MB)
Q = sample(200)                                          # 200 test queries

def brute_force(Xs, q, k=10):
    s = Xs @ q                                           # N dot products
    top = np.argpartition(-s, k)[:k]                     # top k without a full sort
    return top[np.argsort(-s[top])]

for N in (10_000, 100_000, 1_000_000):
    Xs = big[:N]
    t = time.perf_counter()
    for q in Q[:50]:
        brute_force(Xs, q)
    ms = (time.perf_counter() - t) / 50 * 1000
    print(f"N = {N:&gt;9,}: {ms:7.2f} ms per query   ({N * d / 1e6:5.1f} M multiply-adds)")
n, dims = 10_000_000, 1536
print(f"10M x 1,536: {n * dims / 1e9:.1f} billion multiply-adds per query, {n * dims * 4 / 1e9:.1f} GB of float32")</div>
  <div class="fx" data-lang="text">N =    10,000:    0.18 ms per query   (  0.6 M multiply-adds)
N =   100,000:    1.35 ms per query   (  6.4 M multiply-adds)
N = 1,000,000:   29.75 ms per query   ( 64.0 M multiply-adds)
10M x 1,536: 15.4 billion multiply-adds per query, 61.4 GB of float32</div>
  <p><code>sample</code> makes unit vectors around random centres. <code>brute_force</code> is exact search: N dot products, then <code>argpartition</code> finds the top k in linear time without sorting everything. The timing loop runs 50 queries for each size on one CPU thread. Read the printout: 10× more vectors costs about 10× more time, and the jump to 1M costs even more because 256 MB of vectors no longer fit in the CPU cache. Brute force is <strong>at least linear in N</strong>. Extrapolate to a realistic RAG index, 10 million chunks of 1,536 numbers, and each query needs 15 billion multiply-adds over 61 GB of floats: far too slow at a hundred queries per second.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Finding the book most like the one you loved by reading the back cover of every book in the library. Perfect answer, and fine for a shelf; hopeless for a national library.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Exact k-nearest-neighbour (kNN) / brute-force / flat search</strong>: compute the similarity of the query with all N vectors and return the k best. Cost O(N·d) per query; always 100% correct.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Don't skip brute force too early: below roughly 100,000 vectors a flat index (FAISS <code>IndexFlatIP</code>, or plain NumPy) is often fast enough, needs no tuning and has perfect recall. It is also the ground truth you measure every approximate index against.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The ANN idea.</b> Exact search must touch every vector. Could we organise the vectors in advance so a query looks at only a small part of them, if we accept occasionally missing the true nearest one?</div>

  <h2 id="vd-ann"><span class="num">05</span>The ANN Idea</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If a query only needs "almost certainly the best dishes", can we skip 95–99% of the comparisons? And if we do, how do we measure how much we lost?</p>
  </div>
  <p><strong>Approximate nearest neighbour (ANN)</strong> search pre-organises vectors into an index so a query compares with only a small, promising part of them. "Approximate" is the price: sometimes a true neighbour is missed. The loss is measured with <strong>recall@k</strong>: of the true k nearest (from brute force), what fraction did the index return? By hand: the true top 3 for a query are {A, B, C}; the index returns {A, C, D}: recall@3 = 2/3 = 0.67.</p>
<div class="fx" data-lang="py">def recall_at_k(found, truth):
    return len(set(found) &amp; set(truth)) / len(truth)
print(recall_at_k(["A", "C", "D"], ["A", "B", "C"]))
Xb = big[:100_000]                                       # the 100k set used for every index below
truth = np.stack([brute_force(Xb, q) for q in Q])        # exact top-10 per query: the ground truth
print("ground truth:", truth.shape)</div>
  <div class="fx" data-lang="text">0.6666666666666666
ground truth: (200, 10)</div>
  <p><code>recall_at_k</code> is the hand formula. <code>truth</code> holds the exact top 10 for each of the 200 queries over 100,000 vectors; every index in sections 06–09 is scored against it.</p>
  <div class="cards">
    <div><b>Clusters (IVF)</b><p>Group vectors; search only nearby groups.</p><small>Less RAM; misses at cluster edges</small></div>
    <div><b>Graph (HNSW)</b><p>Link similar vectors; walk the graph towards the query.</p><small>Best recall and speed; all in RAM</small></div>
    <div><b>Compression (PQ)</b><p>Shrink each vector ~16–64×.</p><small>Billion scale; approximate distances</small></div>
  </div>
  <p>Every index lives on a <strong>triangle</strong> of recall (quality), latency (time per query) and memory: improving one costs another. Decide which you cannot compromise on, then pick the index and its knobs.</p>
  <div class="callout anlg"><span class="label">Analogy: a library</span><p>Brute force reads every back cover. IVF walks to the right subject shelf and scans only that shelf. HNSW follows the "if you liked this, try…" notes inside each book and arrives in a few hops. PQ keeps a one-line summary of each book instead of the book.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>ANN search</strong>: returns k vectors that are probably among the true k nearest, using a pre-built index to avoid comparing with every vector. <strong>Recall@k</strong> = |returned ∩ true top-k| / k.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Recall measures agreement with brute force on <em>your embedding</em>, not answer quality. If the embedding model is poor, a recall-1.0 index faithfully returns poor results. Tune the model first, then the index.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: IVF.</b> "Look only at a promising part" needs a way to know which part is promising before comparing. The simplest: group similar vectors in advance. How, and where does it fail?</div>

  <h2 id="vd-ivf"><span class="num">06</span>IVF: Search Only the Nearest Clusters</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If the menu were sorted into "food", "hot drinks" and "cold drinks", a query for a drink could skip all the food. How do we build such groups automatically, and what happens to a query that sits between two groups?</p>
  </div>
  <p><strong>IVF (inverted file index)</strong>: at build time run k-means (the clustering algorithm that finds K centres called <strong>centroids</strong>) and store each vector in the list of its nearest centroid. At query time compare the query with the K centroids only, pick the <strong>nprobe</strong> closest, and search exhaustively inside those lists.</p>
  <div class="flow"><span>build: k-means → K centroids</span><span>each vector → its centroid's list</span><span>query: rank centroids</span><span>search the nprobe closest lists</span></div>
<div class="fx" data-lang="py">from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
centroids, cell = km.cluster_centers_, km.labels_
for c in range(3):
    print(f"cell {c}:", [names[i] for i in np.where(cell == c)[0]])

def ivf_search(query, nprobe, k=3):
    q = embed(query)
    order = np.argsort(np.linalg.norm(centroids - q, axis=1))      # closest centroids first
    cand = np.where(np.isin(cell, order[:nprobe]))[0]               # items in the probed cells
    top = cand[np.argsort(-(X[cand] @ q))][:k]
    return order, cand, top

q_text = "something hot"
true3 = np.argsort(-(X @ embed(q_text)))[:3]
print(f"\\n{q_text!r}: true top 3 =", [names[i] for i in true3])
print("distance to centroids 0, 1, 2:", np.linalg.norm(centroids - embed(q_text), axis=1).round(3))
for nprobe in (1, 2):
    order, cand, top = ivf_search(q_text, nprobe)
    print(f"nprobe={nprobe}: probe cells {[int(c) for c in order[:nprobe]]}, compared {len(cand)} of 12 -&gt;",
          [names[i] for i in top], f" recall@3 = {recall_at_k(top, true3):.2f}")</div>
  <div class="fx" data-lang="text">cell 0: ['spicy paneer roll', 'mild chicken wrap', 'fiery chicken kathi', 'mild veg kathi', 'spicy chicken biryani', 'mild paneer tikka masala', 'egg roll', 'mild veg curry']
cell 1: ['hot masala chai', 'steaming filter coffee', 'warm tomato soup']
cell 2: ['cold coffee']

'something hot': true top 3 = ['hot masala chai', 'spicy paneer roll', 'fiery chicken kathi']
distance to centroids 0, 1, 2: [1.058 0.928 1.212]
nprobe=1: probe cells [1], compared 3 of 12 -&gt; ['hot masala chai', 'steaming filter coffee', 'warm tomato soup']  recall@3 = 0.33
nprobe=2: probe cells [1, 0], compared 11 of 12 -&gt; ['hot masala chai', 'spicy paneer roll', 'fiery chicken kathi']  recall@3 = 1.00</div>
  <p>k-means splits the menu into food, hot drinks and the lone cold coffee. Now trace the query "something hot". By meaning it is ambiguous, exactly the "hot" problem of the NLP and Transformers notes: its true top 3 are one hot drink and two spicy dishes. Its distances to the three centroids are close for food and hot drinks. With <strong>nprobe = 1</strong> only the nearest cell (hot drinks) is searched: 3 comparisons instead of 12, but only 1 of the true top 3 is found (recall 0.33). With <strong>nprobe = 2</strong> the food cell is searched too, and recall is 1.0. That is the <strong>boundary problem</strong>, and nprobe is the knob that fixes it.</p>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
    <line x1="230" y1="10" x2="270" y2="210" stroke="currentColor" opacity="0.5"/><line x1="440" y1="10" x2="420" y2="210" stroke="currentColor" opacity="0.5"/>
    <circle cx="60" cy="50" r="4" class="tr"/><text x="68" y="54" font-size="10">spicy paneer roll</text>
    <circle cx="90" cy="110" r="4" class="tr"/><text x="98" y="114" font-size="10">fiery chicken kathi</text>
    <circle cx="70" cy="170" r="4" class="tr"/><text x="78" y="174" font-size="10">mild veg curry …</text>
    <circle cx="300" cy="60" r="4" class="tb"/><text x="308" y="64" font-size="10">hot masala chai</text>
    <circle cx="330" cy="140" r="4" class="tb"/><text x="338" y="144" font-size="10">steaming coffee</text>
    <circle cx="300" cy="190" r="4" class="tb"/><text x="308" y="194" font-size="10">warm soup</text>
    <circle cx="510" cy="110" r="4" class="tm"/><text x="518" y="114" font-size="10">cold coffee</text>
    <path d="M131,91 l8,8 M139,91 l-8,8" stroke="currentColor" stroke-width="2.5"/>
    <path d="M321,101 l8,8 M329,101 l-8,8" stroke="currentColor" stroke-width="2.5"/>
    <path d="M506,131 l8,8 M514,131 l-8,8" stroke="currentColor" stroke-width="2.5"/>
    <circle cx="245" cy="95" r="7" class="fr sr"/><text x="160" y="28" class="tr">query "something hot"</text>
    <text x="40" y="210" class="tm">× = centroid · cells split by the lines</text><text x="440" y="210" class="tm">nprobe=1 searches only blue</text>
    </svg><figcaption>A sketch of the three cells. The query sits at the border of the food cell (red) and the hot-drink cell (blue); two of its true top 3 are across the border, so nprobe = 1 misses them.</figcaption></figure>
  <h3>The same idea at scale</h3>
<div class="fx" data-lang="py">import faiss
faiss.omp_set_num_threads(1)
results = {}                                             # (index, setting) -&gt; (recall@10, ms/query, bytes/vector)
def bench(index, label, bytes_per_vec):
    t = time.perf_counter()
    _, I = index.search(Q, 10)
    ms = (time.perf_counter() - t) / len(Q) * 1000
    rec = np.mean([recall_at_k(I[i], truth[i]) for i in range(len(Q))])
    results[label] = (rec, ms, bytes_per_vec)
    print(f"{label:22s} recall@10 {rec:.3f}   {ms:6.3f} ms/query")

flat = faiss.IndexFlatIP(d); flat.add(Xb)                # exact, inner product = cosine here
bench(flat, "Flat (exact)", d * 4)
ivf = faiss.IndexIVFFlat(faiss.IndexFlatIP(d), d, 316, faiss.METRIC_INNER_PRODUCT)
ivf.train(Xb); ivf.add(Xb)                               # k-means with 316 cells (about sqrt N)
for p in (1, 4, 16, 64):
    ivf.nprobe = p
    bench(ivf, f"IVF nprobe={p}", d * 4 + 8)</div>
  <div class="fx" data-lang="text">Flat (exact)           recall@10 1.000    0.999 ms/query
IVF nprobe=1           recall@10 0.826    0.010 ms/query
IVF nprobe=4           recall@10 0.882    0.024 ms/query
IVF nprobe=16          recall@10 0.935    0.067 ms/query
IVF nprobe=64          recall@10 0.983    0.238 ms/query</div>
  <p>FAISS (Meta's vector search library) does the same on the 100,000 synthetic vectors: <code>IndexFlatIP</code> is exact search with inner product; <code>IndexIVFFlat</code> trains k-means with 316 cells (about √N, a common starting point) and stores full vectors in the cell lists (plus an 8-byte ID each). With nprobe = 1 a query scans about 1/316 of the data and is far faster than flat, but misses some neighbours at cell borders; raising nprobe buys recall back with time. All four rows are kept in <code>results</code> for the comparison table in section 09.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Receipts filed in monthly folders. Looking for a receipt from the 31st of March? Open March only, and you may miss it if it was filed under April. Opening two folders (nprobe = 2) fixes most such misses.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>IVF</strong>: vectors partitioned into K Voronoi cells by k-means centroids; a query scans the lists of its nprobe nearest centroids. Cost ≈ K + nprobe · N/K comparisons. Typical K ≈ √N to 16√N; nprobe 1–64.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The centroids are learned once from the data at build time. If the data drifts (a new cuisine, a new document type), cells become unbalanced and recall drops silently: retrain IVF periodically, and always train on a representative sample.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: HNSW.</b> Clusters have hard borders that cost recall. Is there a structure where a query can simply walk from any starting item towards better and better neighbours, with no borders at all?</div>

  <h2 id="vd-hnsw"><span class="num">07</span>HNSW: Walk a Layered Graph</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Link every dish to its most similar dishes. Then from any starting dish you can keep stepping to the neighbour closest to the query. How do we make those walks short at millions of items, and what stops a walk from getting stuck?</p>
  </div>
  <p>Two ideas make <strong>HNSW (Hierarchical Navigable Small World)</strong>. First, a <strong>neighbour graph</strong>: each item is linked to a few of its nearest items; search greedily moves to whichever neighbour is closer to the query, and stops when none is. Second, <strong>layers</strong>: each item gets a random top level (most only level 0, few reach level 1, very few level 2: level = ⌊−ln(U) · m<sub>L</sub>⌋ with U uniform and m<sub>L</sub> = 1/ln M). Upper layers hold few items with long links for big jumps; layer 0 holds everyone with short links. Search starts at the top, descends a layer when stuck, and at layer 0 keeps a candidate list of size <strong>ef</strong> instead of a single current item.</p>
  <h3>Greedy search traced on the menu</h3>
  <p>Our tiny version: levels drawn with the HNSW rule (M = 3, seed 36); each node linked to its 3 nearest nodes on layer 0 and its 2 nearest on upper layers (real HNSW builds links by inserting items one at a time; for 12 items brute-force neighbour lists give the same flavour). Distance = 1 − cosine.</p>
<div class="fx" data-lang="py">import math, heapq
dist = lambda a, b: 1.0 - float(a @ b)
rng_h = np.random.default_rng(36); M = 3
levels = [int(-math.log(1 - rng_h.random()) / math.log(M)) for _ in names]
print("levels:", {names[i]: l for i, l in enumerate(levels) if l &gt; 0}, "(all others 0)")
graph = {}
for L in range(max(levels) + 1):
    nodes = [i for i in range(12) if levels[i] &gt;= L]
    g = {i: set() for i in nodes}
    for i in nodes:
        for j in sorted((j for j in nodes if j != i), key=lambda j: dist(X[i], X[j]))[:3 if L == 0 else 2]:
            g[i].add(j); g[j].add(i)                                     # links go both ways
    graph[L] = g
entry = levels.index(max(levels))

def greedy_layer(q, cur, L):
    path = [cur]
    while graph[L][cur]:
        best = min(graph[L][cur], key=lambda j: dist(q, X[j]))
        if dist(q, X[best]) &gt;= dist(q, X[cur]):
            break                                                        # no neighbour is closer: stop
        cur = best; path.append(cur)
    return cur, path

def hnsw_trace(text):
    q = embed(text); cur = entry
    for L in range(max(levels), -1, -1):
        cur, path = greedy_layer(q, cur, L)
        print(f"  layer {L}:", " -&gt; ".join(f"{names[i]} ({dist(q, X[i]):.3f})" for i in path))
    best = int(np.argmax(X @ q))
    print(f"  greedy answer: {names[cur]}   true nearest: {names[best]} ({dist(q, X[best]):.3f})")
for text in ["fiery paneer wrap", "cold chai", "something hot"]:
    print(repr(text)); hnsw_trace(text)</div>
  <div class="fx" data-lang="text">levels: {'fiery chicken kathi': 2, 'spicy chicken biryani': 1, 'cold coffee': 1} (all others 0)
'fiery paneer wrap'
  layer 2: fiery chicken kathi (0.002)
  layer 1: fiery chicken kathi (0.002)
  layer 0: fiery chicken kathi (0.002) -&gt; spicy paneer roll (0.001)
  greedy answer: spicy paneer roll   true nearest: spicy paneer roll (0.001)
'cold chai'
  layer 2: fiery chicken kathi (0.682)
  layer 1: fiery chicken kathi (0.682) -&gt; cold coffee (0.002)
  layer 0: cold coffee (0.002)
  greedy answer: cold coffee   true nearest: cold coffee (0.002)
'something hot'
  layer 2: fiery chicken kathi (0.484)
  layer 1: fiery chicken kathi (0.484)
  layer 0: fiery chicken kathi (0.484) -&gt; spicy paneer roll (0.481)
  greedy answer: spicy paneer roll   true nearest: hot masala chai (0.414)</div>
  <p><code>levels</code> applies the HNSW level rule: here one dish reaches layer 2 (the entry point) and two reach layer 1. <code>graph[L]</code> holds the neighbour links per layer. <code>greedy_layer</code> is the walk: look at the current node's neighbours, move to the closest if it beats the current node, else stop. Read the traces: each line is one layer, each arrow one hop with the distance to the query in brackets. "fiery paneer wrap" and "cold chai" reach their true nearest dish in a handful of hops instead of 12 comparisons. "something hot" ends at a spicy dish while the true nearest is the hot drink: a <strong>local minimum</strong>, where no neighbour of the current node is closer even though a better node exists elsewhere.</p>
<div class="fx" data-lang="py">def layer0_beam(q, start, ef):
    visited = {start}
    cand = [(dist(q, X[start]), start)]                 # min-heap: closest candidate first
    best = [(-dist(q, X[start]), start)]                # max-heap of the ef best found so far
    while cand:
        dc, c = heapq.heappop(cand)
        if len(best) &gt;= ef and dc &gt; -best[0][0]:
            break                                       # nearest candidate is worse than the worst kept
        for j in graph[0][c]:
            if j not in visited:
                visited.add(j); dj = dist(q, X[j])
                if len(best) &lt; ef or dj &lt; -best[0][0]:
                    heapq.heappush(cand, (dj, j)); heapq.heappush(best, (-dj, j))
                    if len(best) &gt; ef:
                        heapq.heappop(best)
    return sorted((-d_, i) for d_, i in best), len(visited)

q = embed("something hot"); start = entry
for L in range(max(levels), 0, -1):
    start, _ = greedy_layer(q, start, L)                # descend the upper layers greedily
for ef in (1, 3):
    found, seen = layer0_beam(q, start, ef)
    print(f"ef={ef}: best = {names[found[0][1]]} ({found[0][0]:.3f}), distances computed = {seen}")</div>
  <div class="fx" data-lang="text">ef=1: best = spicy paneer roll (0.481), distances computed = 6
ef=3: best = hot masala chai (0.414), distances computed = 11</div>
  <p><code>layer0_beam</code> is the real layer-0 search: keep a heap of the <code>ef</code> best nodes found, keep expanding the closest unexpanded candidate, stop when the closest candidate is worse than the worst of the ef best. With ef = 1 it is the greedy walk and gets stuck. With ef = 3 it keeps two extra candidates alive, explores past the local minimum and finds the hot drink, at the cost of computing more distances. That is exactly the <code>ef_search</code> knob of every HNSW implementation.</p>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600">
    <defs><marker id="vd-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <rect x="50" y="20" width="540" height="40" rx="6" class="fs"/><text x="10" y="44" class="tm">2</text>
    <circle cx="140" cy="40" r="6" class="fb sb"/><text x="152" y="44" font-size="10">entry</text>
    <rect x="50" y="95" width="540" height="40" rx="6" class="fs"/><text x="10" y="119" class="tm">1</text>
    <line x1="140" y1="115" x2="300" y2="115" stroke="currentColor" opacity="0.45"/><line x1="300" y1="115" x2="480" y2="115" stroke="currentColor" opacity="0.45"/>
    <circle cx="140" cy="115" r="6" class="fb sb"/><circle cx="300" cy="115" r="6" class="fb sb"/><circle cx="480" cy="115" r="6" class="fb sb"/>
    <rect x="50" y="170" width="540" height="40" rx="6" class="fs"/><text x="10" y="194" class="tm">0</text>
    <line x1="80" y1="190" x2="540" y2="190" stroke="currentColor" opacity="0.45"/>
    <circle cx="80" cy="190" r="6" class="fb sb"/><circle cx="120" cy="190" r="6" class="fb sb"/><circle cx="140" cy="190" r="6" class="fb sb"/><circle cx="180" cy="190" r="6" class="fb sb"/><circle cx="220" cy="190" r="6" class="fb sb"/><circle cx="260" cy="190" r="6" class="fb sb"/><circle cx="300" cy="190" r="6" class="fb sb"/><circle cx="340" cy="190" r="6" class="fb sb"/><circle cx="390" cy="190" r="6" class="fb sb"/><circle cx="440" cy="190" r="6" class="fb sb"/><circle cx="480" cy="190" r="6" class="fb sb"/><circle cx="540" cy="190" r="6" class="fb sb"/>
    <polyline points="140,40 140,115 300,115 300,190 340,190" fill="none" class="sr" stroke-width="2.5" marker-end="url(#vd-ah2)"/>
    <circle cx="340" cy="190" r="9" fill="none" class="sr" stroke-width="2"/><text x="320" y="232" class="tr">query's nearest</text>
    <text x="250" y="28" class="tm">1 node: the entry point</text><text x="360" y="108" class="tm">few nodes, long links</text><text x="60" y="232" class="tm">every item, short links</text>
    </svg><figcaption>Search enters at the top, takes a long hop on layer 1, drops to layer 0 near the target and finishes with short steps (and an ef-sized candidate list).</figcaption></figure>
  <h3>The same idea at scale</h3>
<div class="fx" data-lang="py">t = time.perf_counter()
hnsw = faiss.IndexHNSWFlat(d, 16, faiss.METRIC_INNER_PRODUCT)   # M = 16 links per node
hnsw.hnsw.efConstruction = 100
hnsw.add(Xb)
print(f"HNSW build: {time.perf_counter() - t:.1f} s for {len(Xb):,} vectors")
for ef in (16, 64, 256):
    hnsw.hnsw.efSearch = ef
    bench(hnsw, f"HNSW ef={ef}", d * 4 + 16 * 2 * 4)</div>
  <div class="fx" data-lang="text">HNSW build: 13.0 s for 100,000 vectors
HNSW ef=16             recall@10 0.888    0.023 ms/query
HNSW ef=64             recall@10 0.978    0.060 ms/query
HNSW ef=256            recall@10 0.998    0.242 ms/query</div>
  <p><code>IndexHNSWFlat(d, 16)</code> builds the real algorithm with M = 16 links per node (32 on layer 0), inserting the 100,000 vectors one by one; <code>efConstruction</code> is the candidate-list size while building (better graph, slower build). Building is the expensive part (seconds here, hours at hundreds of millions). At query time, <code>efSearch</code> trades speed for recall exactly like ef in our trace: small ef is fastest and misses some neighbours; ef = 64 and above is near-exact while still much faster than brute force. The bytes column adds the link lists (about 2·M four-byte IDs per vector) to the raw vector.</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Meaning</th><th>Typical</th></tr>
    <tr><td><code>M</code></td><td>links per node; more → better recall, more RAM, slower build</td><td>16–64</td></tr>
    <tr><td><code>ef_construction</code></td><td>candidate list while building; higher → better graph</td><td>100–400</td></tr>
    <tr><td><code>ef_search</code></td><td>candidate list per query: the runtime recall/latency knob</td><td>40–200</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Driving from Delhi to one lane in Mumbai: national highway, then city ring road, then the local road, then the lane. You switch to finer roads only once you are in the right area; ef is asking two or three locals for directions instead of trusting the first one.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>HNSW</strong>: a stack of proximity graphs; layer 0 contains every vector, each higher layer a geometrically shrinking random subset. Search: greedy descent through upper layers, then best-first search with a candidate list of size ef on layer 0. About log N hops; supports inserts without a rebuild.</p></div>
  <div class="callout trap"><span class="label">Trap: HNSW lives in RAM</span><p>Every full vector plus its links must be in memory: 10M × 1,536 × 4 bytes ≈ 61 GB plus links. Deletes are also awkward (nodes are usually only marked deleted). At hundreds of millions of vectors, use compression (next section) or a disk-based graph (DiskANN).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Product quantisation.</b> IVF and HNSW decide <em>which</em> vectors to compare, but each stored vector is still d × 4 bytes. At a billion vectors that is terabytes. Can we store each vector in a few bytes and still estimate distances?</div>

  <h2 id="vd-pq"><span class="num">08</span>Product Quantisation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A billion 1,536-number vectors are 6 TB of floats. We need each vector in a few bytes, and a way to compare a query with compressed vectors without unpacking them. How?</p>
  </div>
  <p><strong>Product quantisation (PQ)</strong> in three steps:</p>
  <ol>
    <li>Cut every d-number vector into m sub-vectors (here 16 → 4 pieces of 4 numbers).</li>
    <li>For each piece position, run k-means over all items' pieces to get a <strong>codebook</strong> of K typical pieces (K = 256 in practice, so an ID fits in 1 byte; K = 4 in our hand trace, 2 bits).</li>
    <li>Store each vector as m IDs: the nearest codebook entry for each piece.</li>
  </ol>
  <p>To compare a query with compressed vectors, compute once per query a small table: the dot product of each query piece with each codebook entry (m × K numbers). The approximate score of any stored vector is then the sum of m table lookups, with no multiplication at all. This is <strong>asymmetric distance computation</strong> (the query stays exact, the items are compressed).</p>
<div class="fx" data-lang="py">m, K, sub = 4, 4, 16 // 4
codebooks, codes = [], np.zeros((12, m), dtype=int)
for j in range(m):
    piece = X[:, j * sub:(j + 1) * sub]                         # piece j of all 12 dishes
    kmj = KMeans(n_clusters=K, n_init=10, random_state=0).fit(piece)
    codebooks.append(kmj.cluster_centers_); codes[:, j] = kmj.labels_
print("codes (one row per dish, one ID per piece):")
for i in (0, 1, 6):
    print(f"  {names[i]:22s} {codes[i]}")
recon = np.hstack([codebooks[j][codes[:, j]] for j in range(m)])   # decode: look the pieces back up

q = embed("fiery paneer wrap")
table = np.array([[q[j * sub:(j + 1) * sub] @ codebooks[j][c] for c in range(K)] for j in range(m)])
print("lookup table (4 pieces x 4 codebook entries):\\n", table.round(3))
approx = np.array([sum(table[j, codes[i, j]] for j in range(m)) for i in range(12)])
print("spicy paneer roll: exact", round(float(X[0] @ q), 3), " approx", round(float(approx[0]), 3),
      "=", " + ".join(f"{table[j, codes[0, j]]:.3f}" for j in range(m)))
print("top 3 exact :", [names[i] for i in np.argsort(-(X @ q))[:3]])
print("top 3 by PQ :", [names[i] for i in np.argsort(-approx)[:3]])
print(f"storage: {16 * 4} bytes as float32 -&gt; {m} codes x 2 bits = {m * 2 / 8:.0f} byte")</div>
  <div class="fx" data-lang="text">codes (one row per dish, one ID per piece):
  spicy paneer roll      [0 0 1 0]
  mild chicken wrap      [0 0 2 3]
  hot masala chai        [1 3 3 2]
lookup table (4 pieces x 4 codebook entries):
 [[ 0.099  0.109  0.133  0.08 ]
 [ 0.594  0.298  0.236  0.549]
 [-0.13   0.119  0.125 -0.02 ]
 [ 0.143 -0.005  0.072  0.137]]
spicy paneer roll: exact 0.999  approx 0.955 = 0.099 + 0.594 + 0.119 + 0.143
top 3 exact : ['spicy paneer roll', 'fiery chicken kathi', 'spicy chicken biryani']
top 3 by PQ : ['mild veg curry', 'spicy paneer roll', 'spicy chicken biryani']
storage: 64 bytes as float32 -&gt; 4 codes x 2 bits = 1 byte</div>
  <p>For each of the 4 piece positions, <code>KMeans</code> learns 4 typical pieces; <code>codes</code> stores which one each dish uses (spicy paneer roll and mild chicken wrap share some IDs because their pieces look alike). <code>table</code> is the per-query lookup table; the approximate score of "spicy paneer roll" is the sum of four table entries, printed term by term, and it lands close to the exact cosine. The PQ top 3 keeps two of the exact top 3 but promotes "mild veg curry": with only 4 codebook entries per piece, quite different dishes share codes. That accuracy loss is what re-ranking with full vectors repairs (below). Storage per dish drops from 64 bytes to one byte; with real settings (K = 256, 1 byte per piece) it is m bytes.</p>
<div class="fx" data-lang="py">for m_ in (96, 192):
    print(f"1,536-d float32 = {1536 * 4} bytes -&gt; PQ with m={m_}: {m_} bytes ({1536 * 4 // m_}x smaller)")
pq = faiss.IndexPQ(d, 16, 8, faiss.METRIC_INNER_PRODUCT)          # 16 pieces x 8 bits = 16 bytes
pq.train(Xb); pq.add(Xb)
bench(pq, "PQ m=16 (flat scan)", 16)
ivfpq = faiss.IndexIVFPQ(faiss.IndexFlatIP(d), d, 316, 16, 8, faiss.METRIC_INNER_PRODUCT)
ivfpq.train(Xb); ivfpq.nprobe = 16
base = faiss.clone_index(ivfpq)                                    # trained but still empty copy
ivfpq.add(Xb)
bench(ivfpq, "IVF-PQ nprobe=16", 16 + 8)
refine = faiss.IndexRefineFlat(base)                               # PQ index + a copy of the full vectors
refine.add(Xb)
refine.k_factor = 10                                               # fetch 100 by PQ, re-score exactly
bench(refine, "IVF-PQ + re-rank", 16 + 8 + d * 4)</div>
  <div class="fx" data-lang="text">1,536-d float32 = 6144 bytes -&gt; PQ with m=96: 96 bytes (64x smaller)
1,536-d float32 = 6144 bytes -&gt; PQ with m=192: 192 bytes (32x smaller)
PQ m=16 (flat scan)    recall@10 0.559    0.536 ms/query
IVF-PQ nprobe=16       recall@10 0.592    0.048 ms/query
IVF-PQ + re-rank       recall@10 0.934    0.075 ms/query</div>
  <p>A realistic 1,536-dimension embedding is 6,144 bytes; PQ with 96 or 192 one-byte codes shrinks it 64× or 32×. On our 100k set, <code>IndexPQ</code> stores 16 bytes per vector instead of 256 (16×), but approximate distances cost a lot of recall@10 on this hard synthetic data. <code>IndexIVFPQ</code> adds IVF so only 16 cells are scanned, which is much faster. <code>IndexRefineFlat</code> is the standard fix for PQ's lost accuracy: fetch 10 × k candidates using the compressed codes, then re-score just those with the full vectors. Recall comes back, but only if you can afford to keep full vectors somewhere (often on disk or in a cheaper store).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Saving a photo with a 256-colour palette: each pixel stores a palette number instead of its full colour. Slightly off, clearly the same picture, a fraction of the size. PQ uses a separate palette for each slice of the vector.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Product quantisation</strong>: split a vector into m sub-vectors and replace each by the index of its nearest centroid in a per-position codebook of size K; storage m·log₂K bits per vector. Query–item scores are approximated by summing m precomputed table entries (ADC).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>PQ is compression, not search: a flat PQ scan still visits every vector (just cheaply). Pair it with IVF (IVF-PQ) or a graph, and re-rank the top candidates with exact vectors when recall matters. Also, PQ codebooks are trained on the data and need the same retraining care as IVF centroids.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Recall vs speed, measured.</b> We have three families and many knobs, each measured separately. Side by side on the same data, what does each choice actually buy in recall, milliseconds and bytes?</div>

  <h2 id="vd-tradeoff"><span class="num">09</span>Recall vs Speed, Measured</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"HNSW is fast", "PQ saves memory", "IVF needs nprobe": which index should Biteful actually choose, and at what setting? We need every option in one table, on the same vectors and queries.</p>
  </div>
<div class="fx" data-lang="py">print(f"{'index / setting':22s} {'recall@10':&gt;9s} {'ms/query':&gt;9s} {'bytes/vec':&gt;9s}")
for label, (rec, ms, by) in results.items():
    print(f"{label:22s} {rec:9.3f} {ms:9.3f} {by:9d}")</div>
  <div class="fx" data-lang="text">index / setting        recall@10  ms/query bytes/vec
Flat (exact)               1.000     0.999       256
IVF nprobe=1               0.826     0.010       264
IVF nprobe=4               0.882     0.024       264
IVF nprobe=16              0.935     0.067       264
IVF nprobe=64              0.983     0.238       264
HNSW ef=16                 0.888     0.023       384
HNSW ef=64                 0.978     0.060       384
HNSW ef=256                0.998     0.242       384
PQ m=16 (flat scan)        0.559     0.536        16
IVF-PQ nprobe=16           0.592     0.048        24
IVF-PQ + re-rank           0.934     0.075       280</div>
  <p>Every row was measured above on the same 100,000 synthetic 64-d vectors and 200 queries, one CPU thread (milliseconds vary between runs and machines; recall does not). Reading it as the triangle:</p>
  <ul>
    <li><strong>Flat</strong> is the reference: recall 1.0, slowest, 256 bytes per vector.</li>
    <li><strong>IVF</strong> moves along the recall–latency edge with nprobe: tiny nprobe is the fastest option in the table with clearly lower recall; nprobe 64 approaches exact at a fraction of flat's time.</li>
    <li><strong>HNSW</strong> reaches high recall at low latency (best recall per millisecond here), paying in memory for the links and in build time.</li>
    <li><strong>PQ</strong> rows cut memory to 16–24 bytes per vector and lose recall; the re-rank row buys recall back but needs the full vectors stored somewhere.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
    <polygon points="280,20 80,180 480,180" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
    <text x="280" y="14" text-anchor="middle" font-weight="700">recall</text><text x="70" y="196" text-anchor="middle" font-weight="700">low latency</text><text x="490" y="196" text-anchor="middle" font-weight="700">low memory</text>
    <circle cx="250" cy="70" r="6" class="fg sg"/><text x="262" y="74" class="tg">HNSW (high ef)</text>
    <circle cx="310" cy="45" r="6" class="fs" stroke="currentColor"/><text x="322" y="49">Flat (exact)</text>
    <circle cx="160" cy="140" r="6" class="fb sb"/><text x="172" y="144" class="tb">IVF small nprobe</text>
    <circle cx="410" cy="150" r="6" class="fr sr"/><text x="300" y="168" class="tr">IVF-PQ (+ re-rank)</text>
  </svg><figcaption>Each index sits somewhere on the triangle; knobs slide it along an edge. Pick the corner you cannot give up first.</figcaption></figure>
  <table class="tbl">
    <tr><th>Knob</th><th>Recall</th><th>Latency</th><th>Memory</th></tr>
    <tr><td>IVF: raise <code>nprobe</code></td><td>↑</td><td>↑</td><td>same</td></tr>
    <tr><td>HNSW: raise <code>ef_search</code></td><td>↑</td><td>↑</td><td>same</td></tr>
    <tr><td>HNSW: raise <code>M</code></td><td>↑</td><td>↑ slightly</td><td>↑</td></tr>
    <tr><td>Add PQ compression</td><td>↓</td><td>↓</td><td>↓↓</td></tr>
    <tr><td>Re-rank PQ candidates with full vectors</td><td>↑</td><td>↑ a little</td><td>needs full vectors</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Fast, cheap, good: pick two. A food-delivery kitchen can be fast and cheap (frozen), cheap and good (slow-cooked), or fast and good (expensive staff), never all three at once.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Recall–latency–memory trade-off</strong>: for a fixed dataset and hardware, an ANN index configuration is a point in this 3-way space; benchmark recall@k and p95 latency on your own data and queries before choosing.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Benchmarks on random or synthetic vectors (like ours) only show trends. Real embeddings are more clustered, so absolute recalls differ. Measure on a sample of your real vectors with real queries, and look at p95 latency, not the average.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Metadata filtering.</b> Every query so far was pure meaning. Real Biteful queries add conditions: "veg only", "from Wrap Republic", "under ₹150". Where in the search does the filter go?</div>

  <h2 id="vd-filter"><span class="num">10</span>Metadata Filtering: Pre vs Post</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A customer on the Wrap Republic page searches "fiery paneer wrap". We want the best matches <em>from that restaurant only</em>. Do we search first and filter after, or filter first and search inside, and does it matter?</p>
  </div>
  <p>Two orders. <strong>Post-filtering</strong>: run the vector search for the top k, then drop results that fail the filter. <strong>Pre-filtering</strong> (or in-filtering): restrict the search to items that pass the filter, then take the top k among them.</p>
<div class="fx" data-lang="py">def post_filter(query, keep, k=3):
    top = np.argsort(-(X @ embed(query)))[:k]                  # search everything, keep top k ...
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
pre-filter : ['mild chicken wrap', 'mild veg kathi', 'egg roll']
veg under 150, pre-filter: ['spicy paneer roll', 'mild veg kathi', 'hot masala chai']</div>
  <p>The overall top 3 for "fiery paneer wrap" are all from other restaurants, so post-filtering returns <strong>an empty list</strong>: the customer sees "no results" although Wrap Republic sells three wraps. Pre-filtering searches only Wrap Republic's three dishes and ranks them. The last line shows a combined condition (veg and under ₹150) handled the same way.</p>
  <h3>The same trap at scale</h3>
<div class="fx" data-lang="py">restaurant = np.random.default_rng(1).integers(0, 100, len(Xb))  # 100 restaurants, ~1% of items each
sel_ids = np.where(restaurant == 7)[0].astype("int64")
print(f"restaurant 7 owns {len(sel_ids)} of {len(Xb):,} items ({len(sel_ids) / len(Xb):.1%})")
hnsw.hnsw.efSearch = 64
exact = [sel_ids[np.argsort(-(Xb[sel_ids] @ q))[:10]] for q in Q[:100]]   # true top 10 inside restaurant 7
post = [int(np.sum(restaurant[hnsw.search(q[None], 10)[1][0]] == 7)) for q in Q[:100]]
print(f"post-filter (HNSW top 10, then filter): {np.mean(post):.2f} results on average, "
      f"{np.mean(np.array(post) == 0):.0%} of queries get none")
for ef in (64, 1000):
    params = faiss.SearchParametersHNSW(sel=faiss.IDSelectorBatch(sel_ids), efSearch=ef)
    t = time.perf_counter()
    rec = np.mean([recall_at_k(hnsw.search(q[None], 10, params=params)[1][0], exact[i]) for i, q in enumerate(Q[:100])])
    print(f"filter during HNSW search, ef={ef:4d}: recall@10 {rec:.3f}  ({(time.perf_counter() - t) * 10:.2f} ms/query)")
t = time.perf_counter()
for q in Q[:100]:
    sub = sel_ids[np.argsort(-(Xb[sel_ids] @ q))[:10]]                # pre-filter, then exact search
print(f"pre-filter + brute force over {len(sel_ids)} items: recall 1.000  ({(time.perf_counter() - t) * 10:.2f} ms/query)")</div>
  <div class="fx" data-lang="text">restaurant 7 owns 979 of 100,000 items (1.0%)
post-filter (HNSW top 10, then filter): 0.09 results on average, 91% of queries get none
filter during HNSW search, ef=  64: recall@10 0.323  (0.10 ms/query)
filter during HNSW search, ef=1000: recall@10 0.900  (1.59 ms/query)
pre-filter + brute force over 979 items: recall 1.000  (0.04 ms/query)</div>
  <p>Each synthetic vector gets one of 100 restaurant IDs, so restaurant 7 owns about 1% of items. <strong>Post-filtering</strong> HNSW's top 10 leaves on average about 10 × 1% = 0.1 results, and nearly every query returns nothing. <code>faiss.IDSelectorBatch</code> inside <code>SearchParametersHNSW</code> filters <em>during</em> the graph walk (non-matching nodes are traversed but never returned), so it always returns 10 results, but look at the recall: with 99% of nodes excluded, the walk at ef = 64 finds only part of the true filtered top 10; raising ef to 1,000 recovers most of it at a higher cost. For a filter this selective the simplest answer wins: <strong>pre-filter, then brute force</strong> over the ~1,000 matching items is exact and still fast. That is why good vector databases switch strategy by filter selectivity (Qdrant, Weaviate and pgvector's planner all do some version of this).</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>How</th><th>Good when</th><th>Risk</th></tr>
    <tr><td>Post-filter</td><td>top k, then filter</td><td>filter keeps most items</td><td>empty or short results with selective filters</td></tr>
    <tr><td>Over-fetch + post-filter</td><td>top 10k, then filter</td><td>moderately selective filters</td><td>slower; still fails for 0.1% filters</td></tr>
    <tr><td>Pre-filter + brute force</td><td>filter in SQL, exact search on the rest</td><td>filter leaves few items (thousands)</td><td>slow if many items pass</td></tr>
    <tr><td>Filter during ANN search</td><td>index skips non-matching items</td><td>general case (Qdrant, Weaviate, Milvus, FAISS selectors, pgvector 0.8+ iterative scans)</td><td>very selective filters can degrade graph search</td></tr>
    <tr><td>Partition per tenant</td><td>one index per restaurant / customer</td><td>hard multi-tenant boundaries</td><td>many small indexes to manage</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Asking a waiter for "the 3 best dishes in the food court" and then saying "only from this stall" leaves you with whatever of those 3 happens to be from that stall, usually nothing. Ask for "the 3 best dishes at this stall" instead.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Metadata filtering</strong>: restricting vector search results by structured attributes (category, tenant, date, price). <strong>Post-filtering</strong> applies the filter after the top-k search; <strong>pre-/in-filtering</strong> applies it before or during the search.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Post-filtering fails silently and only for selective filters, so it passes demos (where the filter keeps most data) and breaks in production for small tenants. Test with your most selective realistic filter.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Hybrid search.</b> Filters handle structured conditions. But some queries contain exact tokens that embeddings blur, like a dish code "K12" or a brand name. How do we get meaning and exact keyword matching at once?</div>

  <h2 id="vd-hybrid"><span class="num">11</span>Hybrid Search</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Embeddings match meaning but blur exact strings ("K12", "v2.3.1", a rare dish name); keyword search matches strings but misses paraphrase ("fiery" vs "spicy"). The two fail in different places. How do we combine their rankings when their scores are on different scales?</p>
  </div>
  <table class="tbl">
    <tr><th>Retriever</th><th>Misses</th><th>Example</th></tr>
    <tr><td><strong>Dense</strong> (embeddings)</td><td>exact rare tokens</td><td>codes, SKUs, error numbers, new names</td></tr>
    <tr><td><strong>Keyword</strong> (TF-IDF / BM25)</td><td>paraphrase</td><td>"fiery paneer wrap" vs "spicy paneer roll"</td></tr>
  </table>
  <p>A cosine of 0.98 and a BM25 score of 12.7 cannot be added. <strong>Reciprocal Rank Fusion (RRF)</strong> ignores scores and uses positions: score(doc) = Σ over retrievers of 1 / (k + rank), with k = 60 and rank 1 = first. By hand for "fiery paneer wrap": dense ranks spicy paneer roll 1st, fiery chicken kathi 2nd; keyword ranks mild chicken wrap 1st, fiery chicken kathi 2nd, spicy paneer roll 3rd. spicy paneer roll = 1/61 + 1/63 = 0.03227; fiery chicken kathi = 1/62 + 1/62 = 0.03226; mild chicken wrap (keyword only) = 1/61 = 0.01639.</p>
<div class="fx" data-lang="py">def rrf(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, doc in enumerate(ranking, start=1):
            scores[doc] = scores.get(doc, 0) + 1 / (k + rank)
    return sorted(scores.items(), key=lambda kv: -kv[1])
q_text = "fiery paneer wrap"
dense = [n for n, _ in semantic_search(q_text)]
keyword = [n for n, s in keyword_search(q_text) if s &gt; 0]
print("dense  :", dense); print("keyword:", keyword)
for doc, s in rrf([dense, keyword]):
    print(f"  {s:.5f}  {doc}")</div>
  <div class="fx" data-lang="text">dense  : ['spicy paneer roll', 'fiery chicken kathi', 'spicy chicken biryani']
keyword: ['mild chicken wrap', 'fiery chicken kathi', 'spicy paneer roll']
  0.03227  spicy paneer roll
  0.03226  fiery chicken kathi
  0.01639  mild chicken wrap
  0.01587  spicy chicken biryani</div>
  <p><code>rrf</code> adds 1/(60 + rank) for every list a document appears in. Documents found by both retrievers collect two terms and rise above documents found by one; the constant 60 keeps a single first place from dominating. The fused list puts the right dish first, keeps the keyword-only "mild chicken wrap" but lower, and never needed the two score scales to agree. In RAG, hybrid retrieval is the wide first net (say 50 candidates for recall), and a cross-encoder <strong>reranker</strong> narrows them to the best 5 (<a class="xref" data-note="rag">RAG</a>).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two waiters: one remembers what customers <em>meant</em> ("something fiery with paneer"), the other remembers exact order codes ("K12"). A dish both of them suggest is almost certainly right.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Hybrid search</strong>: combining sparse (keyword) and dense (embedding) retrieval. <strong>RRF</strong>: score(d) = Σ<sub>r</sub> 1 / (k + rank<sub>r</sub>(d)), k ≈ 60; rank-based, so no score normalisation is needed.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Weighted score fusion (α · cosine + (1 − α) · BM25) needs both scores normalised, and the right α changes with every query type; it is easy to tune on a demo and wrong in production. RRF is the robust default.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Tools.</b> We have hand-built every piece: embeddings, flat, IVF, HNSW, PQ, filters, hybrid. Which product gives Biteful these pieces, and what does each one actually do well?</div>

  <h2 id="vd-tools"><span class="num">12</span>Tools Compared, Honestly</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>FAISS, Chroma, pgvector, Pinecone, Weaviate, Milvus (and Qdrant): vendors all claim speed and scale. What kind of thing is each one, and which questions decide between them?</p>
  </div>
  <p>The biggest difference is not the index (most use HNSW, many also IVF and PQ) but <strong>what kind of software</strong> each is: a library you call, a database inside your process, an extension of a database you already run, a server you operate, or a service you rent.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>What it is</th><th>Indexes</th><th>Filtering</th><th>Good fit</th><th>Watch out for</th></tr>
    <tr><td><strong>FAISS</strong></td><td>C++/Python <em>library</em> (Meta)</td><td>flat, IVF, HNSW, PQ, GPU</td><td>ID selectors only; no metadata store</td><td>research, batch jobs, building your own service</td><td>no persistence, auth, replication or updates-friendly API: not a database</td></tr>
    <tr><td><strong>Chroma</strong></td><td>embedded (in-process) or client–server DB</td><td>HNSW</td><td>metadata <code>where</code> filters</td><td>prototypes, notebooks, small apps</td><td>scaling and operations story is younger than the others</td></tr>
    <tr><td><strong>pgvector</strong></td><td>Postgres <em>extension</em></td><td>exact, IVFFlat, HNSW</td><td>full SQL <code>WHERE</code>, JOINs; iterative scans from 0.8</td><td>you already run Postgres; up to tens of millions of vectors</td><td>tuning shares a box with your OLTP workload; very large scale needs care</td></tr>
    <tr><td><strong>Pinecone</strong></td><td>fully managed service</td><td>proprietary (serverless)</td><td>metadata filters during search</td><td>no infra team; fast start to production</td><td>cost at high volume, vendor lock-in, data leaves your network</td></tr>
    <tr><td><strong>Weaviate</strong></td><td>open-source server (+ cloud)</td><td>HNSW, flat, PQ/BQ compression</td><td>filters during HNSW search; built-in hybrid (BM25 + vector)</td><td>hybrid search and schema-rich apps</td><td>another stateful system to operate</td></tr>
    <tr><td><strong>Milvus</strong></td><td>distributed open-source server (+ Zilliz cloud)</td><td>HNSW, IVF-PQ, DiskANN, GPU</td><td>scalar filtering</td><td>hundreds of millions to billions of vectors</td><td>many components (Kubernetes); heavy for small apps</td></tr>
    <tr><td><strong>Qdrant</strong></td><td>open-source server in Rust (+ cloud)</td><td>HNSW, quantisation</td><td>payload filters during traversal</td><td>production with heavy, selective filters</td><td>another stateful system to operate</td></tr>
  </table>
  <p>Three questions decide most cases:</p>
  <ol>
    <li><strong>How many vectors?</strong> Fits in one machine's RAM (most apps up to tens of millions) → almost anything works, including pgvector. Billions → distributed and compressed (Milvus, or FAISS-based custom services).</li>
    <li><strong>How selective are the filters?</strong> Per-customer or per-restaurant filters that keep 1% of data need filtering during search (section 10).</li>
    <li><strong>Who operates it?</strong> No ops team → managed (Pinecone, or the cloud versions of the open-source ones). Already running Postgres → pgvector keeps one system and lets you JOIN vectors with business data.</li>
  </ol>
  <div class="callout anlg"><span class="label">Analogy</span><p>FAISS is a professional stove: the best part of a kitchen, but not a restaurant. pgvector is adding a tandoor to the kitchen you already run. Pinecone is ordering from a cloud kitchen. Milvus is building a central kitchen for a whole city.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Vector library</strong> (FAISS, hnswlib, ScaNN): index algorithms in-process, no storage or serving. <strong>Vector database</strong>: persistence, metadata, filtering, updates, replication and an API around such indexes.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Vendor benchmarks use their best settings on their chosen data. Feature lists change monthly. Run your own recall and p95 latency test with your embeddings and your filters before committing; switching later means re-indexing everything.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Build it in pgvector.</b> Enough comparison. What does the complete menu search, with an HNSW index and a restaurant filter, look like in a real database?</div>

  <h2 id="vd-build"><span class="num">13</span>Build It: Semantic Menu Search in pgvector</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful already stores its menu in Postgres. Can the same table hold the 16-number embeddings, use an HNSW index, and answer "fiery paneer wrap, veg only" in one SQL query?</p>
  </div>
  <p>Run here on PostgreSQL 16 with pgvector 0.6. First a table with a <code>vector(16)</code> column next to the ordinary columns:</p>
<div class="fx" data-lang="sql">DROP TABLE IF EXISTS menu, queries;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE menu (
  id         serial PRIMARY KEY,
  name       text,
  veg        boolean,
  restaurant text,
  price      int,
  embedding  vector(16)        -- real models: vector(384), vector(1536) ...
);
CREATE TABLE queries (text text PRIMARY KEY, embedding vector(16));
\\d menu</div>
  <div class="fx" data-lang="text">                                Table "public.menu"
   Column   |    Type    | Collation | Nullable |             Default              
------------+------------+-----------+----------+----------------------------------
 id         | integer    |           | not null | nextval('menu_id_seq'::regclass)
 name       | text       |           |          | 
 veg        | boolean    |           |          | 
 restaurant | text       |           |          | 
 price      | integer    |           |          | 
 embedding  | vector(16) |           |          | 
Indexes:
    "menu_pkey" PRIMARY KEY, btree (id)</div>
  <p>Then Python writes the INSERT statements, formatting each embedding as pgvector's text form <code>'[x1,x2,…]'</code>:</p>
<div class="fx" data-lang="py">vec_sql = lambda v: "'[" + ",".join(f"{x:.5f}" for x in v) + "]'"
rows = [f"('{n}', {str(veg).lower()}, '{rest}', {price}, {vec_sql(X[i])})"
        for i, (n, veg, rest, price) in enumerate(menu)]
insert_sql = "INSERT INTO menu (name, veg, restaurant, price, embedding) VALUES\\n" + ",\\n".join(rows) + ";\\n"
qs = ["fiery paneer wrap", "something hot to drink"]
insert_sql += "INSERT INTO queries VALUES\\n" + ",\\n".join(f"('{t}', {vec_sql(embed(t))})" for t in qs) + ";"
print(insert_sql.splitlines()[1][:95], "...")
print(len(insert_sql.splitlines()), "lines of SQL")</div>
  <div class="fx" data-lang="text">('spicy paneer roll', true, 'Tandoor Tales', 149, '[-0.07967,0.01887,0.31341,0.07586,0.19102,-0 ...
16 lines of SQL</div>

  <p>(The statements are then sent to <code>psql</code>; with a driver such as psycopg you would pass the vectors as query parameters instead of building strings.) Now the index and the searches:</p>
<div class="fx" data-lang="sql">CREATE INDEX ON menu USING hnsw (embedding vector_cosine_ops);
SELECT count(*) AS dishes FROM menu;

SELECT m.name, m.restaurant,
       round((1 - (m.embedding &lt;=&gt; q.embedding))::numeric, 3) AS cosine
FROM menu m, queries q
WHERE q.text = 'fiery paneer wrap'
ORDER BY m.embedding &lt;=&gt; q.embedding
LIMIT 3;</div>
  <div class="fx" data-lang="text"> dishes 
--------
     12
(1 row)

         name          |  restaurant   | cosine 
-----------------------+---------------+--------
 spicy paneer roll     | Tandoor Tales |  0.999
 fiery chicken kathi   | Tandoor Tales |  0.998
 spicy chicken biryani | Biryani Bros  |  0.967
(3 rows)</div>
  <p>Line by line: <code>USING hnsw (embedding vector_cosine_ops)</code> builds the HNSW graph of section 07 for cosine distance. <code>&lt;=&gt;</code> is the cosine <em>distance</em> operator (1 − cosine), so <code>ORDER BY … LIMIT 3</code> in the default ascending order means "3 nearest", and <code>1 − distance</code> displays the similarity. The ranking matches the NumPy search of section 02 (with 12 rows the planner may simply scan the table; the index matters at thousands of rows and more).</p>
<div class="fx" data-lang="sql">SELECT m.name, m.price,
       round((1 - (m.embedding &lt;=&gt; q.embedding))::numeric, 3) AS cosine
FROM menu m, queries q
WHERE q.text = 'fiery paneer wrap' AND m.veg AND m.price &lt; 200
ORDER BY m.embedding &lt;=&gt; q.embedding
LIMIT 3;

SELECT m.name, round((1 - (m.embedding &lt;=&gt; q.embedding))::numeric, 3) AS cosine
FROM menu m, queries q
WHERE q.text = 'something hot to drink' AND m.restaurant = 'Steam House'
ORDER BY m.embedding &lt;=&gt; q.embedding
LIMIT 3;</div>
  <div class="fx" data-lang="text">       name        | price | cosine 
-------------------+-------+--------
 spicy paneer roll |   149 |  0.999
 mild veg kathi    |   129 |  0.945
 mild veg curry    |   189 |  0.923
(3 rows)

          name          | cosine 
------------------------+--------
 warm tomato soup       |  0.778
 steaming filter coffee |  0.764
 hot masala chai        |  0.669
(3 rows)</div>
  <p>Meaning plus ordinary SQL in one statement: veg dishes under ₹200 nearest to "fiery paneer wrap", then Steam House drinks nearest to "something hot to drink". This is pgvector's main selling point: filters, JOINs and transactions are just Postgres. With an HNSW index, pgvector 0.6 applies the <code>WHERE</code> after the index scan returns <code>hnsw.ef_search</code> candidates (default 40), which is the post-filter trap of section 10 for very selective filters; raise <code>SET hnsw.ef_search</code>, or use pgvector 0.8+ iterative index scans or partial indexes per restaurant.</p>
  <ul>
    <li>Operators: <code>&lt;=&gt;</code> cosine distance, <code>&lt;-&gt;</code> L2 distance, <code>&lt;#&gt;</code> <em>negative</em> inner product. All are "smaller = closer", so all sort ascending.</li>
    <li>The index operator class must match the operator: <code>vector_cosine_ops</code> serves <code>&lt;=&gt;</code> only; ordering by <code>&lt;-&gt;</code> silently ignores it.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>pgvector</strong>: a Postgres extension adding the <code>vector(n)</code> type, distance operators (<code>&lt;-&gt;</code>, <code>&lt;=&gt;</code>, <code>&lt;#&gt;</code>) and IVFFlat / HNSW indexes, so vector search composes with SQL.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>ORDER BY embedding &lt;=&gt; q DESC</code> returns the <em>least</em> similar rows: it is a distance. Keep the default ascending order and show <code>1 − distance</code> if you want a similarity.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects,</b> then <a class="xref" data-note="rag">RAG</a>: replace the 12 dish names with thousands of chunks of Biteful's help-centre articles, retrieve the top few for a customer's question, and hand them to an LLM to write the answer.</div>

  <h2 id="vd-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Embeddings, metrics, brute force, IVF, HNSW, PQ, filters, hybrid, tools: separate topics, or one pipeline in which each piece fixes a limit of the previous one?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="vd-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="170" height="44" rx="7" class="fr sr"/><text x="95" y="29" text-anchor="middle" font-size="11.5" font-weight="700">keyword search</text><text x="95" y="45" text-anchor="middle" class="tm" font-size="10">"wrap" → mild chicken wrap</text>
<line x1="180" y1="32" x2="208" y2="32" stroke="currentColor" marker-end="url(#vd-a9)"/>
<rect x="210" y="10" width="220" height="44" rx="7" class="fb sb"/><text x="320" y="29" text-anchor="middle" font-size="11.5" font-weight="700">sentence embeddings + cosine</text><text x="320" y="45" text-anchor="middle" class="tm" font-size="10">fiery paneer wrap → spicy paneer roll</text>
<line x1="430" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#vd-a9)"/>
<rect x="460" y="10" width="210" height="44" rx="7" class="fb sb"/><text x="565" y="29" text-anchor="middle" font-size="11.5" font-weight="700">brute force (exact)</text><text x="565" y="45" text-anchor="middle" class="tm" font-size="10">linear in N; 15 B ops at 10M×1,536</text>
<line x1="565" y1="54" x2="565" y2="84" stroke="currentColor" marker-end="url(#vd-a9)"/>
<rect x="460" y="86" width="210" height="44" rx="7" class="ft st"/><text x="565" y="105" text-anchor="middle" font-size="11.5" font-weight="700">ANN: recall@k</text><text x="565" y="121" text-anchor="middle" class="tm" font-size="10">skip most items, measure loss</text>
<line x1="460" y1="108" x2="432" y2="108" stroke="currentColor" marker-end="url(#vd-a9)"/>
<rect x="250" y="86" width="180" height="44" rx="7" class="ft st"/><text x="340" y="105" text-anchor="middle" font-size="11.5" font-weight="700">IVF (clusters)</text><text x="340" y="121" text-anchor="middle" class="tm" font-size="10">nprobe 1 → 0.33, 2 → 1.0</text>
<line x1="250" y1="108" x2="222" y2="108" stroke="currentColor" marker-end="url(#vd-a9)"/>
<rect x="10" y="86" width="210" height="44" rx="7" class="ft st"/><text x="115" y="105" text-anchor="middle" font-size="11.5" font-weight="700">HNSW (graph)</text><text x="115" y="121" text-anchor="middle" class="tm" font-size="10">ef 1 stuck → ef 3 finds chai</text>
<line x1="115" y1="130" x2="115" y2="160" stroke="currentColor" marker-end="url(#vd-a9)"/>
<rect x="10" y="162" width="210" height="44" rx="7" class="ft st"/><text x="115" y="181" text-anchor="middle" font-size="11.5" font-weight="700">PQ (compression)</text><text x="115" y="197" text-anchor="middle" class="tm" font-size="10">256 B → 16 B; re-rank</text>
<line x1="220" y1="184" x2="248" y2="184" stroke="currentColor" marker-end="url(#vd-a9)"/>
<rect x="250" y="162" width="180" height="44" rx="7" class="fg sg"/><text x="340" y="181" text-anchor="middle" font-size="11.5" font-weight="700">trade-off table</text><text x="340" y="197" text-anchor="middle" class="tm" font-size="10">recall · ms · bytes</text>
<line x1="430" y1="184" x2="458" y2="184" stroke="currentColor" marker-end="url(#vd-a9)"/>
<rect x="460" y="162" width="210" height="44" rx="7" class="fb sb"/><text x="565" y="181" text-anchor="middle" font-size="11.5" font-weight="700">filters (pre / in, not post)</text><text x="565" y="197" text-anchor="middle" class="tm" font-size="10">post-filter: 0 of 3 dishes left</text>
<line x1="565" y1="206" x2="565" y2="236" stroke="currentColor" marker-end="url(#vd-a9)"/>
<rect x="460" y="238" width="210" height="40" rx="7" class="fb sb"/><text x="565" y="256" text-anchor="middle" font-size="11.5" font-weight="700">hybrid (RRF)</text><text x="565" y="271" text-anchor="middle" class="tm" font-size="10">meaning + exact tokens</text>
<line x1="460" y1="258" x2="432" y2="258" stroke="currentColor" marker-end="url(#vd-a9)"/>
<rect x="250" y="238" width="180" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="340" y="256" text-anchor="middle" font-size="11.5" font-weight="700">tool: pgvector, …</text><text x="340" y="271" text-anchor="middle" class="tm" font-size="10">HNSW + WHERE in SQL</text>
<line x1="250" y1="258" x2="222" y2="258" stroke="currentColor" marker-end="url(#vd-a9)"/>
<rect x="10" y="238" width="210" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="115" y="256" text-anchor="middle" font-size="11.5" font-weight="700">RAG</text><text x="115" y="271" text-anchor="middle" class="tm" font-size="10">retrieve chunks → LLM answers</text>
<text x="340" y="312" text-anchor="middle" class="tm" font-size="10.5">meaning (embeddings) → speed (indexes) → memory (PQ) → real queries (filters, hybrid) → product → RAG</text>
</svg><figcaption>Each box removes the limit of the one before: keyword search can't see meaning, exact search can't scale, indexes trade recall, PQ trades accuracy for memory, filters and hybrid make it usable for real queries.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's menu (and the 100k synthetic set where marked)</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our example</th><th>When to use</th></tr>
    <tr><td>Keyword search</td><td>TF-IDF / BM25</td><td>which items share words?</td><td>"fiery paneer wrap" → mild chicken wrap first</td><td>exact tokens; hybrid half</td></tr>
    <tr><td>Sentence embedding</td><td>pooled token/word vectors, normalised</td><td>one vector per text?</td><td>→ spicy paneer roll first (stand-in: averaged Word2Vec)</td><td>always, with a real model</td></tr>
    <tr><td>Cosine / dot / L2</td><td>vector arithmetic</td><td>what is "nearest"?</td><td>unit vectors: identical rankings; ‖x − q‖² = 2 − 2cos</td><td>normalise, then dot</td></tr>
    <tr><td>Brute force</td><td>N dot products</td><td>exact answer, at what cost?</td><td>linear in N (10k → 1M measured)</td><td>&lt; ~100k vectors; ground truth</td></tr>
    <tr><td>Recall@k</td><td>ANN ∩ exact</td><td>how much did we lose?</td><td>{A, C, D} vs {A, B, C} = 0.67</td><td>every benchmark</td></tr>
    <tr><td>IVF</td><td>k-means cells + nprobe</td><td>search only a neighbourhood?</td><td>"something hot": nprobe 1 → 0.33, 2 → 1.0</td><td>large sets, less RAM</td></tr>
    <tr><td>HNSW</td><td>layered neighbour graph + ef</td><td>walk to the answer?</td><td>ef = 1 stuck on a spicy dish, ef = 3 finds hot masala chai</td><td>default for RAM-sized sets</td></tr>
    <tr><td>PQ</td><td>per-piece codebooks</td><td>fit billions in memory?</td><td>64 B → 1 B (toy); 256 B → 16 B (100k)</td><td>huge sets, with re-ranking</td></tr>
    <tr><td>Filtering</td><td>metadata + search order</td><td>meaning + conditions?</td><td>post-filter → 0 Wrap Republic dishes; pre-filter → 3</td><td>pre/in-filter for selective filters</td></tr>
    <tr><td>Hybrid (RRF)</td><td>two rankings, Σ 1/(60 + rank)</td><td>meaning + exact words?</td><td>spicy paneer roll 0.03227 first</td><td>RAG first-stage retrieval</td></tr>
    <tr><td>Tools</td><td>all of the above, packaged</td><td>what do I deploy?</td><td>pgvector: HNSW + WHERE veg AND price &lt; 200</td><td>by scale, filters, ops</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>vector search is "embed, then find the nearest vectors", and everything else exists to make that nearest-neighbour step fast (IVF, HNSW), small (PQ) and usable on real queries (filters, hybrid), at a measured cost in recall</strong>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="rag">RAG</a>, which chunks documents, retrieves with exactly this machinery, reranks and generates.</div>

  <h2 id="vd-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful's 12-dish menu (spicy paneer roll, mild chicken wrap, fiery chicken kathi, …, hot masala chai, cold coffee) with restaurant, veg and price; queries "fiery paneer wrap" and "something hot". Embeddings: averaged 16-d Word2Vec trained on 4,000 synthetic reviews, a stated stand-in for a real sentence-embedding model (downloads were blocked). Scale experiments: 100,000 synthetic 64-d unit vectors, 200 queries, one thread.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our example</th><th>Weakness → next</th></tr>
    <tr><td>Keyword search</td><td>find by words?</td><td>mild chicken wrap first for "fiery paneer wrap"</td><td>no meaning → embeddings</td></tr>
    <tr><td>Sentence embeddings</td><td>one vector per text?</td><td>spicy paneer roll first</td><td>which "nearest"? → metrics</td></tr>
    <tr><td>Similarity metrics</td><td>cosine, dot or L2?</td><td>unit vectors: same ranking</td><td>cost? → brute force</td></tr>
    <tr><td>Brute force</td><td>exact search cost?</td><td>linear in N</td><td>too slow → ANN</td></tr>
    <tr><td>ANN + recall@k</td><td>skip work, measure loss?</td><td>{A,C,D} vs {A,B,C} = 0.67</td><td>how to skip → IVF</td></tr>
    <tr><td>IVF</td><td>search a neighbourhood?</td><td>nprobe 1 → 0.33; 2 → 1.0</td><td>borders → HNSW</td></tr>
    <tr><td>HNSW</td><td>walk to the answer?</td><td>ef 1 stuck; ef 3 finds chai</td><td>RAM → PQ</td></tr>
    <tr><td>PQ</td><td>compress vectors?</td><td>16× (100k), 32–64× (1,536-d)</td><td>which to pick → table</td></tr>
    <tr><td>Trade-off table</td><td>what does each buy?</td><td>recall · ms · bytes per index</td><td>conditions → filters</td></tr>
    <tr><td>Filtering</td><td>meaning + conditions?</td><td>post-filter: empty</td><td>exact tokens → hybrid</td></tr>
    <tr><td>Hybrid (RRF)</td><td>meaning + keywords?</td><td>0.03227 vs 0.03226 vs 0.01639</td><td>which product → tools</td></tr>
    <tr><td>Tools / pgvector</td><td>what to deploy?</td><td>HNSW index + SQL WHERE</td><td>→ RAG</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Cosine</td><td>cos(a, b) = a·b / (‖a‖‖b‖)</td><td>‖a‖ = √Σa<sub>i</sub>²</td></tr>
    <tr><td>Unit-vector identity</td><td>‖a − b‖² = 2 − 2 cos(a, b)</td><td>so L2, dot and cosine rank alike</td></tr>
    <tr><td>Sentence embedding (stand-in)</td><td>e(t) = mean(w2v(words)) / ‖·‖</td><td>real models: pooled Transformer outputs</td></tr>
    <tr><td>Brute-force cost</td><td>N · d multiply-adds per query</td><td>10M × 1,536 = 15.4 billion</td></tr>
    <tr><td>Recall@k</td><td>|returned ∩ true top-k| / k</td><td>true top-k from brute force</td></tr>
    <tr><td>IVF cost</td><td>K + nprobe · N / K comparisons</td><td>K cells (≈ √N), nprobe probed</td></tr>
    <tr><td>HNSW level</td><td>ℓ = ⌊−ln U · m<sub>L</sub>⌋, m<sub>L</sub> = 1/ln M</td><td>U uniform(0, 1); M links</td></tr>
    <tr><td>PQ storage</td><td>m · log₂K bits per vector</td><td>m pieces, K codebook entries (256 → 1 byte)</td></tr>
    <tr><td>PQ score (ADC)</td><td>q·x ≈ Σ<sub>j</sub> T[j, code<sub>j</sub>(x)]</td><td>T[j, c] = q<sub>j</sub> · centroid<sub>j,c</sub></td></tr>
    <tr><td>RRF</td><td>Σ<sub>r</sub> 1 / (60 + rank<sub>r</sub>(d))</td><td>rank 1 = first; sum over retrievers</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Flat (exact)</b><p>Under ~100k vectors, ground truth, batch jobs.</p><small>Not for millions at high QPS</small></div>
    <div><b>HNSW</b><p>Default for anything that fits in RAM; good recall/latency; live inserts.</p><small>Not when RAM is the constraint</small></div>
    <div><b>IVF / IVF-PQ</b><p>Very large sets, lower memory, GPU batch search.</p><small>Needs training; boundary misses; retrain on drift</small></div>
    <div><b>Hybrid + filters</b><p>Real product search and RAG: codes, names, tenants.</p><small>Avoid post-filtering with selective filters</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Mixing embedding models; wrong metric (unnormalised vectors with inner product); judging indexes without a brute-force ground truth; IVF boundary misses and stale centroids; HNSW RAM and deletes; PQ without re-ranking; post-filtering selective filters; weighted score fusion instead of RRF; pgvector <code>DESC</code> on a distance and operator/opclass mismatch; synthetic benchmarks treated as real.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Two unit vectors with cosine 0.9: squared L2 distance?</td><td>2 − 2 × 0.9 = 0.2</td></tr>
    <tr><td>True top 3 {A, B, C}, index returns {B, C, E}: recall@3?</td><td>2/3 = 0.67</td></tr>
    <tr><td>1M vectors, IVF with K = 1,000 and nprobe = 10: about how many comparisons?</td><td>1,000 centroids + 10 × 1,000 = 11,000</td></tr>
    <tr><td>768-d float32 vector, PQ with m = 96, 8 bits: bytes before and after?</td><td>3,072 → 96 (32×)</td></tr>
    <tr><td>Dense ranks [A, B], BM25 ranks [B, C]: RRF order (k = 60)?</td><td>B (1/62 + 1/61), A (1/61), C (1/62)</td></tr>
  </table>

  <h2 id="vd-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't plain SQL or keyword search find semantically similar items?</summary><div class="qa-body">They match exact values or words. "fiery paneer wrap" shares only "paneer" with "spicy paneer roll", and TF-IDF ranked "mild chicken wrap" first because of "wrap". Embeddings encode meaning as geometry, and a vector index finds nearby points. Real systems use both: vectors for meaning, SQL filters for conditions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a sentence-embedding model produce one vector per text?</summary><div class="qa-body">A Transformer encoder outputs a vector per token; pooling (mean or a special token) gives one vector; it is normalised to length 1. Contrastive training on matching pairs (query–answer, paraphrases) makes similar meanings point the same way. It is a bi-encoder: queries and documents are embedded separately, so documents can be embedded ahead of time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is the dot product the same as cosine, and why prefer it?</summary><div class="qa-body">When vectors have length 1: a·b = cos θ, and ‖a − b‖² = 2 − 2cos, so L2 ranks the same too. Normalise once at index time and use the dot product at query time: same ranking, no norms per comparison.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does IVF work and what is its main failure mode?</summary><div class="qa-body">k-means partitions vectors into K cells; a query compares with the K centroids and scans only the nprobe nearest cells. Failure: the boundary problem. "something hot" sat between the food and hot-drink cells; nprobe = 1 found 1 of its true top 3, nprobe = 2 found all. Raise nprobe; retrain centroids when data drifts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain how HNSW gets fast queries over millions of vectors.</summary><div class="qa-body">Each vector gets a random level (most 0, few high). Upper layers are sparse with long links, layer 0 has everyone with short links. Search greedily descends from the top entry point, then runs a best-first search with a candidate list of size ef on layer 0. Hops grow about log N. ef avoids local minima (ef = 1 got stuck on our menu; ef = 3 found the hot drink). Cost: everything in RAM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does PQ compress a 768-d float32 vector 32×?</summary><div class="qa-body">Split into 96 sub-vectors of 8 numbers; learn 256 centroids per position; store each piece as a 1-byte centroid ID. 768 × 4 = 3,072 bytes → 96 bytes. Query scores are sums of 96 lookups in a per-query table. Distances become approximate, so re-score the top candidates with full vectors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>HNSW or IVF-PQ for 20M chunks? For 2B?</summary><div class="qa-body">20M × 768 × 4 B ≈ 61 GB plus links: HNSW if a machine with that RAM is acceptable (best recall/latency, easy inserts). 2B: IVF-PQ or DiskANN, because raw vectors alone are terabytes; accept some recall loss, re-rank, and retrain periodically.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Dense ranks [A, B, C]; BM25 ranks [C, A, D]. RRF order with k = 60?</summary><div class="qa-body">A = 1/61 + 1/62 ≈ 0.03252; C = 1/63 + 1/61 ≈ 0.03227; B = 1/62 ≈ 0.01613; D = 1/63 ≈ 0.01587. Order A, C, B, D: documents found by both beat documents found by one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your multi-tenant app filters by tenant and results come back nearly empty. Why?</summary><div class="qa-body">Post-filtering: the index returns its top k overall, then the tenant filter drops almost all of them. With a 1% tenant, top-10 leaves about 0.1 results on average (measured on 100k vectors). Filter during the search (FAISS ID selectors, Qdrant/Weaviate filters, pgvector 0.8+ iterative scans), pre-filter and brute-force small tenants, or partition per tenant.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You upgraded the embedding model and retrieval got worse, with no errors. What happened?</summary><div class="qa-body">Queries use the new model, the index holds old-model vectors: two different coordinate systems, so similarity is meaningless. Re-embed the corpus (usually into a new index, then switch over) and store the model name and version with the index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this return? <code>SELECT name FROM menu ORDER BY embedding &lt;=&gt; q DESC LIMIT 1;</code></summary><div class="qa-body">The <em>least</em> similar dish. <code>&lt;=&gt;</code> is cosine distance (1 − cosine), so smaller is closer. Drop <code>DESC</code>; display <code>1 - (embedding &lt;=&gt; q)</code> for similarity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>FAISS or a vector database?</summary><div class="qa-body">FAISS is a library: excellent indexes, but no persistence, metadata, filtering by attributes, auth or replication. Use it inside your own service or for batch work. If you need a store with filters and updates, use a vector database (or pgvector if you already run Postgres).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does vector search need sentence embeddings rather than the TF-IDF vectors of the NLP note?</summary><div class="qa-body">TF-IDF vectors make every word its own axis, so synonyms are orthogonal: "fiery paneer wrap" matched "mild chicken wrap" through the shared word and missed "spicy paneer roll". Nearest-neighbour search is only as good as the space it searches; embeddings put similar meanings close, so the nearest vectors are the most similar meanings.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do IVF and PQ both need k-means, and what breaks if the data drifts?</summary><div class="qa-body">IVF uses k-means centroids to define cells; PQ uses k-means per sub-vector position to define codebooks. Both are learned from the data at build time. When new kinds of items arrive, cells become unbalanced (IVF recall drops) and codebooks no longer fit (PQ distance errors grow), silently. Retrain on a fresh representative sample.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is a brute-force index still needed when you run HNSW in production?</summary><div class="qa-body">Recall can only be measured against the exact answer. A flat index over a sample (or all) of the vectors gives the true top-k for test queries; without it you cannot tell whether ef_search, nprobe or PQ settings are losing results.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in RAG if the retriever's filter is applied after the ANN search?</summary><div class="qa-body">For a user whose documents are a small share of the index, the top-k chunks mostly belong to other users and are removed by the filter. The LLM then receives few or no relevant chunks and either says "I don't know" or hallucinates. Filter during retrieval (or partition per user) so the k chunks come from the allowed set.</div></details>
</main>`
});
