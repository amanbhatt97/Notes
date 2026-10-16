// notes/genai/vectordb.js — Embeddings & Vector DBs
Object.assign(TOPIC_CONTENT, {
  "vectordb": `<main>
  <h1>Embeddings &amp; Vector DBs</h1>
  <p class="lead">How to search by <em>meaning</em>: turn text into vectors, then find the nearest ones fast. Builds on contextual embeddings from 01–02 and the API basics from 05. Everything here is the retrieval engine behind 07 · RAG.</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="vd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Vector Search</span><span class="rm-sub">The gap SQL can't fill</span></div></div>
      <div class="rm-item rm-done" data-target="vd-emb"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Sentence Embeddings</span><span class="rm-sub">Meaning as a list of numbers</span></div></div>
      <div class="rm-item rm-done" data-target="vd-sim"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Similarity Metrics</span><span class="rm-sub">Cosine, dot, Euclidean</span></div></div>
      <div class="rm-item rm-done" data-target="vd-ann"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">ANN &amp; the Trade-off Triangle</span><span class="rm-sub">Why brute force dies</span></div></div>
      <div class="rm-item rm-done" data-target="vd-hnsw"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">HNSW</span><span class="rm-sub">Highways down to local streets</span></div></div>
      <div class="rm-item rm-done" data-target="vd-ivf"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">IVF + Product Quantization</span><span class="rm-sub">Clusters and 32× compression</span></div></div>
      <div class="rm-item rm-done" data-target="vd-hyb"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Hybrid Search</span><span class="rm-sub">Dense + BM25 via RRF</span></div></div>
      <div class="rm-item rm-done" data-target="vd-choose"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing a Vector DB</span><span class="rm-sub">Chroma, pgvector, Qdrant…</span></div></div>
      <div class="rm-item rm-done" data-target="vd-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">numpy search, then pgvector</span></div></div>
      <div class="rm-item rm-done" data-target="vd-rev"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 9 lines</span></div></div>
      <div class="rm-item rm-done" data-target="vd-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="vd-why"><span class="num">01</span>Why Vector Search</h2>
  <p>SQL finds exact values: <code>WHERE category = 'AI'</code>. No SQL operator means "find text that <em>means</em> the same as this, even with zero shared words".</p>
  <p>A <strong>vector database</strong> stores embeddings and returns the <em>k</em> vectors closest to a query vector (k-nearest-neighbour search).</p>
  <div class="flow"><span>Docs</span><span>Embedding model</span><span>Vectors + text stored</span><span>Query → same model</span><span>k nearest</span><span>Original text</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Looking up a restaurant by exact name is SQL. "All restaurants within 2 km of me" is vector search: points close to your coordinates. A vector DB does this in 1,536 dimensions, where "close" means "similar meaning".</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>SQL</th><th>Vector DB</th></tr>
    <tr><td>Query</td><td><code>WHERE user_id = 42</code></td><td>nearest to <code>embed("heart attack")</code></td></tr>
    <tr><td>Index</td><td>B-tree, exact</td><td>ANN, approximate</td></tr>
    <tr><td>Finds</td><td>Exact matches and ranges</td><td>"myocardial infarction" docs</td></tr>
    <tr><td>Fails at</td><td>Meaning</td><td>Exact IDs, codes, filters alone</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A vector DB doesn't replace SQL. "Orders by user 42" is SQL. "Tickets similar to this one" is vectors. Production RAG usually needs both: vectors for meaning, metadata filters for user, date and status.</p>
  </div>

  <h2 id="vd-emb"><span class="num">02</span>Sentence Embeddings</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>sentence embedding</strong> is one fixed-length vector (e.g. 384–3,072 floats) for a whole text. Similar meaning → vectors pointing in nearly the same direction.</p>
  </div>
  <p>Word vectors (01) and token vectors (02) aren't enough: you need <em>one</em> vector per chunk to compare. Sentence-embedding models get it by pooling a transformer's token outputs, then training on (query, relevant passage) pairs so matches land close and non-matches far apart (contrastive learning).</p>
  <ul>
    <li>"Heart attack" and "myocardial infarction" → tiny angle. "Heart attack" and "pizza recipe" → large angle.</li>
    <li>You don't design the numbers. You call the model and trust the geometry.</li>
    <li>These are <strong>bi-encoders</strong>: query and document are embedded separately, so documents can be embedded once, ahead of time.</li>
  </ul>
  <table class="tbl">
    <tr><th>Model</th><th>Dims</th><th>Max input</th><th>Note</th></tr>
    <tr><td>OpenAI text-embedding-3-small</td><td>1,536</td><td>8,191 tokens</td><td>Cheap default; can shorten dims</td></tr>
    <tr><td>OpenAI text-embedding-3-large</td><td>3,072</td><td>8,191 tokens</td><td>Higher accuracy, higher cost</td></tr>
    <tr><td>BAAI bge-m3 (open)</td><td>1,024</td><td>8,192 tokens</td><td>Multilingual; dense + sparse in one</td></tr>
    <tr><td>all-MiniLM-L6-v2 (open)</td><td>384</td><td>256 word pieces</td><td>Tiny, fast, CPU-friendly; lower accuracy</td></tr>
  </table>
  <p>Rankings change often: check the MTEB leaderboard and test on <em>your</em> data. Some models expect prefixes like <code>query:</code> / <code>passage:</code>; skipping them quietly hurts recall.</p>
  <div class="callout trap"><span class="label">Trap: models don't mix</span>
    <p>Vectors from two models live in different spaces. Index with model A and query with model B, and you get confident nonsense with no error. Changing models means re-embedding the whole corpus, so store the model name and version with the index.</p>
  </div>

  <h2 id="vd-sim"><span class="num">03</span>Similarity Metrics</h2>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Measures</th></tr>
    <tr><td><strong>Cosine</strong></td><td>A·B / (‖A‖ ‖B‖)</td><td>Angle only. Range −1 to 1.</td></tr>
    <tr><td><strong>Dot product</strong></td><td>Σ AᵢBᵢ</td><td>Angle <em>and</em> length</td></tr>
    <tr><td><strong>Euclidean (L2)</strong></td><td>√Σ(Aᵢ−Bᵢ)²</td><td>Distance between endpoints</td></tr>
  </table>
  <ul>
    <li>For text, <strong>direction = meaning</strong>; length often reflects text length or word frequency. So cosine is the usual default.</li>
    <li>On <strong>unit-length</strong> (L2-normalised) vectors all three agree on ranking: dot = cosine, and ‖A−B‖² = 2 − 2·cos.</li>
    <li>That's why many systems normalise once at index time, then use the cheaper dot product.</li>
  </ul>
  <div class="callout intu"><span class="label">Intuition</span>
    <p>Two arrows pointing the same way, one short and one long: cosine says "identical topic"; Euclidean says "far apart". For text you usually want the first answer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Use the metric the model was trained for (its docs say). The wrong one doesn't crash. It just ranks slightly wrong, which is worse because nobody notices.</p>
  </div>

  <h2 id="vd-ann"><span class="num">04</span>ANN &amp; the Trade-off Triangle</h2>
  <p><strong>Brute force</strong> (exact kNN) compares the query with every vector. 10M vectors × 1,536 dims ≈ 15 billion multiply-adds per query: hundreds of ms on CPU, too slow at real traffic.</p>
  <p><strong>ANN</strong> (approximate nearest neighbour) indexes pre-organise vectors so a query skips 95–99% of comparisons. You give up a little recall (occasionally missing a true neighbour) for ~100× speed.</p>
  <div class="cards">
    <div><b>Graph (HNSW)</b><p>Link similar vectors; walk the graph.</p><small>Best recall + latency. Whole graph in RAM.</small></div>
    <div><b>Clusters (IVF)</b><p>Group vectors; search only nearby groups.</p><small>Less RAM. Misses at cluster edges.</small></div>
    <div><b>Compression (PQ)</b><p>Shrink each vector ~32×.</p><small>Billion scale. Not a search method alone.</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy: a library</span>
    <p>Brute force: read the back of every book. IVF: walk to the right subject shelf and scan only that. HNSW: every book lists 10–20 similar books; follow the recommendations and you arrive in a few hops.</p>
  </div>
  <h3>The recall–latency–memory triangle</h3>
  <p>Every index picks two corners; the third suffers. Choose your hard constraint first, then the index.</p>
  <table class="tbl">
    <tr><th>Knob</th><th>Recall</th><th>Latency</th><th>Memory</th></tr>
    <tr><td>HNSW: raise <code>M</code></td><td>↑</td><td>↑ slightly</td><td>↑</td></tr>
    <tr><td>HNSW: raise <code>ef_search</code></td><td>↑</td><td>↑</td><td>same</td></tr>
    <tr><td>IVF: raise <code>nprobe</code></td><td>↑</td><td>↑</td><td>same</td></tr>
    <tr><td>Add PQ compression</td><td>↓ a little</td><td>↓</td><td>↓↓</td></tr>
    <tr><td>DiskANN (graph on SSD)</td><td>≈ HNSW</td><td>↑ (disk I/O)</td><td>↓</td></tr>
  </table>

  <h2 id="vd-hnsw"><span class="num">05</span>HNSW</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hierarchical Navigable Small World</strong>: a stack of graphs. Layer 0 holds every vector, linked to its nearest neighbours. Each higher layer keeps a small random subset with longer-range links.</p>
  </div>
  <p>Problem it solves: in one flat graph, greedy search takes many tiny hops. Upper layers give long jumps first.</p>
  <div class="flow"><span>Enter top layer</span><span>Greedy hop to closest neighbour</span><span>Stuck? Drop a layer</span><span>Layer 0: wider local search</span><span>Top-k</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Delhi to a street in Mumbai: national highway → city ring road → suburb road → your street. You only switch to finer roads once you're in the right area. HNSW builds these road networks from your data.</p>
  </div>
  <table class="tbl">
    <tr><th>Parameter</th><th>Meaning</th><th>Typical</th></tr>
    <tr><td><code>M</code></td><td>Links per node. More → better recall, more RAM, slower build.</td><td>16–64</td></tr>
    <tr><td><code>ef_construction</code></td><td>Candidate list size while building. Higher → better graph, slower build.</td><td>100–200</td></tr>
    <tr><td><code>ef_search</code></td><td>Candidate list size per query. Your runtime recall/latency knob.</td><td>40–200</td></tr>
  </table>
  <p>Hops grow roughly with log n, so tens of millions of vectors still answer in about a millisecond. New vectors can be inserted without a rebuild.</p>
  <div class="callout trap"><span class="label">Trap: HNSW lives in RAM</span>
    <p>10M × 1,536 dims × 4 bytes ≈ 61 GB of raw floats, plus the graph links. At 100M+ vectors that's impractical: use DiskANN, or IVF-PQ.</p>
  </div>

  <h2 id="vd-ivf"><span class="num">06</span>IVF + Product Quantization</h2>
  <h3>IVF (inverted file index)</h3>
  <ul>
    <li><strong>Build:</strong> k-means splits all vectors into K clusters. Each vector is filed under its nearest centroid.</li>
    <li><strong>Query:</strong> compare with the K centroids (cheap), then search only the <code>nprobe</code> nearest clusters.</li>
    <li>10M vectors, K = 1,000, nprobe = 10 → search 100K vectors instead of 10M: 100× less work.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tax papers in 12 monthly folders. Need March? Open March only. IVF sorts vectors into folders at build time and opens only the relevant ones.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the boundary problem</span>
    <p>A query near a cluster edge may have its true neighbours in the next cluster. With nprobe = 1 you miss them. Raise nprobe (10–20 recovers most). Large data changes also shift clusters, so IVF needs periodic retraining.</p>
  </div>
  <h3>Product Quantization (PQ)</h3>
  <p>At a billion vectors even the raw floats don't fit (1B × 1,536 × 4 B ≈ 6 TB). PQ compresses the vectors themselves.</p>
  <ol>
    <li>Split each 768-d vector into 96 sub-vectors of 8 dims.</li>
    <li>For each position, learn a codebook of 256 centroids (fits in 1 byte).</li>
    <li>Store each sub-vector as its centroid's 1-byte ID.</li>
  </ol>
  <p>3,072 bytes → 96 bytes: <strong>32× smaller</strong>. 100M vectors: 307 GB → ~9.6 GB. Cost: distances become approximate, losing a few % recall; re-scoring the top candidates with full vectors recovers most of it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Compressing a photo to a 256-colour palette: each pixel stores a palette index instead of full RGB. Slightly off, still clearly the same picture.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>PQ is compression, not search. It's paired with IVF (IVF-PQ, e.g. in FAISS) to decide <em>which</em> vectors to compare.</p>
  </div>

  <h2 id="vd-hyb"><span class="num">07</span>Hybrid Search</h2>
  <p>Dense and keyword search fail in <em>different</em> ways, so combining them catches what each misses.</p>
  <ul>
    <li><strong>Dense</strong> misses exact rare terms: error codes, versions like "v2.3.1", product SKUs.</li>
    <li><strong>BM25</strong> (classic keyword scoring: term frequency × rarity, adjusted for doc length) misses paraphrase: "heart attack" vs "myocardial infarction" scores 0.</li>
  </ul>
  <div class="callout def"><span class="label">Reciprocal Rank Fusion (RRF)</span>
    <p>score(doc) = Σ 1 / (k + rank) across retrievers, with k ≈ 60. Uses ranks only, so no need to normalise BM25 and cosine scores onto one scale.</p>
  </div>
  <div class="fx" data-lang="py">def rrf(ranked_lists, k=60):
    scores = {}
    for ranking in ranked_lists:
        for rank, doc in enumerate(ranking, start=1):
            scores[doc] = scores.get(doc, 0) + 1 / (k + rank)
    return sorted(scores.items(), key=lambda x: -x[1])

dense = ["doc_A", "doc_B", "doc_C"]
bm25  = ["doc_C", "doc_A", "doc_D"]
print(rrf([dense, bm25]))</div>
  <table class="tbl out"><caption>Result (rounded)</caption><tr><th>doc</th><th>RRF score</th></tr><tr><td>doc_A</td><td>0.03252</td></tr><tr><td>doc_C</td><td>0.03227</td></tr><tr><td>doc_B</td><td>0.01613</td></tr><tr><td>doc_D</td><td>0.01587</td></tr></table>
  <p>Docs found by both retrievers jump ahead of docs found by only one.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two detectives. One recognises that "fled by car" and "drove off" are the same event. The other finds case file #2024-0847 when you quote the number. Suspects both rank highly are almost certainly right.</p>
  </div>
  <p>Hybrid retrieval feeds a reranker in RAG: retrieve ~50 for recall, rerank to ~5 for precision (07 · RAG).</p>

  <h2 id="vd-choose"><span class="num">08</span>Choosing a Vector DB</h2>
  <div class="cards">
    <div><b>Chroma</b><p>Runs inside your Python process; zero setup.</p><small>Prototypes, under ~1M vectors</small></div>
    <div><b>pgvector</b><p>A vector column and indexes inside Postgres.</p><small>Already on Postgres; want JOINs</small></div>
    <div><b>Qdrant</b><p>Rust, open source; filters applied during HNSW traversal.</p><small>Production with heavy filtering</small></div>
    <div><b>Pinecone</b><p>Fully managed; serverless or dedicated.</p><small>No infra team</small></div>
    <div><b>Milvus</b><p>Distributed on Kubernetes; HNSW, IVF-PQ, DiskANN.</p><small>Hundreds of millions to billions</small></div>
  </div>
  <p>Ask three questions:</p>
  <ol>
    <li><strong>How many vectors?</strong> Fits in one machine's RAM → anything works. Billions → distributed + compression.</li>
    <li><strong>How selective are filters?</strong> If "tenant = X" keeps 1% of data, you need filtering during the search.</li>
    <li><strong>Who runs it?</strong> No ops → managed. Cost-sensitive with ops skills → self-host.</li>
  </ol>
  <div class="callout trap"><span class="label">Trap: post-filtering</span>
    <p>If the DB runs ANN first and filters after, a 1%-selective filter can throw away almost everything: ask for 50, get 1 back. Fixes: filter-aware traversal (Qdrant, Weaviate), iterative index scans (pgvector 0.8+), or a per-tenant partition.</p>
  </div>
  <p>These sizes are rules of thumb. Benchmark recall and p95 latency on your own data before committing.</p>

  <h2 id="vd-build"><span class="num">09</span>Build It</h2>
  <p>Goal: semantic search over six sentences, first in numpy, then in Postgres. The embedding is a deterministic toy: each known word adds to four meaning axes. Swap in a real model and the code stays the same.</p>
  <div class="fx" data-lang="py">import numpy as np

# Toy embedding model: each known word adds to 4 "meaning" axes.
#           animal rest  money  food
LEX = {
    "cat":     [1.0, 0.2, 0.0, 0.0], "kitten":   [1.0, 0.3, 0.0, 0.0],
    "dog":     [1.0, 0.0, 0.0, 0.0], "puppy":    [1.0, 0.3, 0.0, 0.0],
    "sleeping":[0.0, 1.0, 0.0, 0.0], "napping":  [0.1, 1.0, 0.0, 0.0],
    "sat":     [0.0, 0.5, 0.0, 0.0], "chased":   [0.2, 0.0, 0.0, 0.0],
    "stocks":  [0.0, 0.0, 1.0, 0.0], "market":   [0.0, 0.0, 1.0, 0.1],
    "prices":  [0.0, 0.0, 0.8, 0.2], "fell":     [0.0, 0.1, 0.3, 0.0],
    "bread":   [0.0, 0.0, 0.0, 1.0], "recipe":   [0.0, 0.0, 0.0, 1.0],
    "treats":  [0.4, 0.0, 0.1, 0.8],
}

def embed(text):
    v = sum(np.array(LEX.get(w.strip(".,?!"), [0.0]*4)) for w in text.lower().split())
    return v / np.linalg.norm(v)            # unit length, so dot product == cosine

docs = [
    "The cat sat on the mat",
    "A kitten sleeping in the sun",
    "The dog chased the ball",
    "Stocks fell sharply on Monday",
    "Easy bread recipe for beginners",
    "Homemade dog treats recipe",
]
X = np.stack([embed(d) for d in docs])      # shape (6, 4): one row per doc

def search(query, k=3):
    q = embed(query)
    scores = X @ q                          # cosine with every doc at once
    top = np.argsort(-scores)[:k]           # brute-force exact top-k
    return [(float(scores[i]), docs[i]) for i in top]

for q in ["puppy napping", "market prices"]:
    print(q)
    for s, d in search(q):
        print(f"  {s:.3f}  {d}")</div>
  <table class="tbl out"><caption>Result</caption>
    <tr><th>query</th><th>score</th><th>doc</th></tr>
    <tr><td>puppy napping</td><td>0.999</td><td>A kitten sleeping in the sun</td></tr>
    <tr><td></td><td>0.967</td><td>The cat sat on the mat</td></tr>
    <tr><td></td><td>0.646</td><td>The dog chased the ball</td></tr>
    <tr><td>market prices</td><td>0.983</td><td>Stocks fell sharply on Monday</td></tr>
    <tr><td></td><td>0.173</td><td>Homemade dog treats recipe</td></tr>
    <tr><td></td><td>0.164</td><td>Easy bread recipe for beginners</td></tr>
  </table>
  <div class="callout intu"><span class="label">Notice</span>
    <p>"puppy napping" shares <em>no words</em> with "A kitten sleeping in the sun", yet it ranks first. Keyword search would score it 0. That's the whole point of embeddings.</p>
  </div>
  <p>With a real model, only <code>embed</code> changes (sentence-transformers shown; it downloads the model on first use):</p>
  <div class="fx" data-lang="py">from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")
X = model.encode(docs, normalize_embeddings=True)    # (6, 384)
q = model.encode("puppy napping", normalize_embeddings=True)
scores = X @ q</div>

  <h3>Same search in Postgres with pgvector</h3>
  <p>Store each vector beside its row, then sort by distance. Run here on PostgreSQL 16 + pgvector 0.6, using the toy vectors from above (rounded).</p>
  <div class="fx" data-lang="sql">CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE docs (
  id        serial PRIMARY KEY,
  body      text,
  topic     text,
  embedding vector(4)          -- real models: vector(384), vector(1536)...
);
INSERT INTO docs (body, topic, embedding) VALUES
  ('The cat sat on the mat',          'pets',    '[0.819,0.573,0,0]'),
  ('A kitten sleeping in the sun',    'pets',    '[0.61,0.793,0,0]'),
  ('The dog chased the ball',         'pets',    '[1,0,0,0]'),
  ('Stocks fell sharply on Monday',   'finance', '[0,0.077,0.997,0]'),
  ('Easy bread recipe for beginners', 'cooking', '[0,0,0,1]'),
  ('Homemade dog treats recipe',      'cooking', '[0.613,0,0.044,0.789]');
CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops);

-- query vector = embed('puppy napping')
SELECT body, round((1 - (embedding &lt;=&gt; '[0.646,0.763,0,0]'))::numeric, 3) AS cosine
FROM docs
ORDER BY embedding &lt;=&gt; '[0.646,0.763,0,0]'
LIMIT 3;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>body</th><th>cosine</th></tr><tr><td>A kitten sleeping in the sun</td><td>0.999</td></tr><tr><td>The cat sat on the mat</td><td>0.967</td></tr><tr><td>The dog chased the ball</td><td>0.646</td></tr></table>
  <p>Same ranking as numpy. Now mix meaning with an ordinary filter, the thing pgvector is best at:</p>
  <div class="fx" data-lang="sql">SELECT body, round((embedding &lt;=&gt; '[0.646,0.763,0,0]')::numeric, 3) AS distance
FROM docs
WHERE topic = 'cooking'
ORDER BY embedding &lt;=&gt; '[0.646,0.763,0,0]'
LIMIT 2;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>body</th><th>distance</th></tr><tr><td>Homemade dog treats recipe</td><td>0.604</td></tr><tr><td>Easy bread recipe for beginners</td><td>1.000</td></tr></table>
  <ul>
    <li>Operators: <code>&lt;=&gt;</code> cosine <em>distance</em> (1 − cosine), <code>&lt;-&gt;</code> L2 distance, <code>&lt;#&gt;</code> <em>negative</em> inner product. All sort ascending.</li>
    <li>The index opclass must match the operator: <code>vector_cosine_ops</code> serves <code>&lt;=&gt;</code> only.</li>
    <li>Recall knob at query time: <code>SET hnsw.ef_search = 100;</code> (default 40).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>ORDER BY embedding &lt;=&gt; q DESC</code> returns the <em>least</em> similar rows. It's a distance: smaller is closer.</p>
  </div>

  <h2 id="vd-rev"><span class="num">10</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Vector DB:</strong> stores embeddings, returns the k nearest to a query vector. Complements SQL; doesn't replace it.</li>
    <li><strong>Sentence embedding:</strong> one vector per text from a contrastively trained bi-encoder; similar meaning → small angle.</li>
    <li><strong>Same model everywhere:</strong> index and query with one model; changing it means re-embedding everything.</li>
    <li><strong>Metrics:</strong> cosine = angle; on normalised vectors cosine, dot and L2 give the same ranking.</li>
    <li><strong>ANN:</strong> skip 95–99% of comparisons for a small recall loss. Brute force dies around millions of vectors.</li>
    <li><strong>HNSW:</strong> layered graph, long jumps then local search, ~log n hops; best recall/latency, RAM-hungry. Knobs M, ef_search.</li>
    <li><strong>IVF-PQ:</strong> k-means clusters + nprobe; PQ compresses 32×. For data bigger than RAM. Watch cluster boundaries.</li>
    <li><strong>Hybrid:</strong> dense + BM25 fused by RRF Σ1/(60+rank); catches both paraphrase and exact codes.</li>
    <li><strong>Choosing:</strong> scale, filter selectivity, ops capacity. Post-filtering with selective filters destroys recall.</li>
  </ol></div>

  <h2 id="vd-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't plain SQL find semantically similar documents?</summary><div class="qa-body">SQL indexes (B-trees) support exact matches and ranges. There's no column for "meaning" and no operator for "close in 1,536-d space". Embeddings encode meaning as geometry and a vector index finds nearby points. Real systems use both: vectors for meaning, SQL-style filters for user, date, status.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is dot product the same as cosine, and why would you prefer it?</summary><div class="qa-body">When vectors are L2-normalised: then ‖A‖ = ‖B‖ = 1 and A·B = cos θ. Normalise once at index time and use dot product at query time: same ranking, cheaper (no norms or square roots per comparison).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain how HNSW gets ~1 ms queries over millions of vectors.</summary><div class="qa-body">It stacks graphs: layer 0 has every vector; each higher layer keeps a small random subset with long-range links. A query enters at the top, greedily hops toward the target, drops a layer when stuck, and does a wider local search (size ef_search) at the bottom. Hops scale ~log n. Cost: the whole graph must sit in RAM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is IVF's main failure mode and how do you fix it?</summary><div class="qa-body">The cluster-boundary problem: a query near the edge of a cluster may have true neighbours in the next one. If that cluster isn't among the nprobe searched, they're missed. Raise nprobe (more recall, more latency); 10–20 recovers most misses.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does PQ get 32× compression on a 768-d float32 vector?</summary><div class="qa-body">Split into 96 sub-vectors of 8 dims. Learn 256 centroids per position, so each sub-vector becomes a 1-byte centroid ID. 768 × 4 = 3,072 bytes → 96 bytes. Distances are then approximate, costing a few % recall; re-scoring the top candidates with full vectors recovers most of it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>HNSW or IVF-PQ for 20M chunks? For 2B?</summary><div class="qa-body">20M: HNSW if it fits in RAM (20M × 768 × 4 B ≈ 61 GB plus graph); best recall and latency, easy inserts. 2B: IVF-PQ (or DiskANN), because raw vectors alone would be terabytes. Accept some recall loss and periodic re-training of clusters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Dense ranks [A, B, C]; BM25 ranks [C, A, D]. What's the RRF order with k = 60?</summary><div class="qa-body">A = 1/61 + 1/62 ≈ 0.03252; C = 1/63 + 1/61 ≈ 0.03227; B = 1/62 ≈ 0.01613; D = 1/63 ≈ 0.01587. Order: <strong>A, C, B, D</strong>. Docs found by both retrievers beat docs found by one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is hybrid search usually better than dense-only?</summary><div class="qa-body">The two fail on different queries. Dense misses rare exact tokens (codes, versions, names) whose embeddings are weak. BM25 misses paraphrase with no word overlap. RRF fuses their rank lists, so each covers the other's blind spot. The extra cost is one keyword search and a merge.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your multi-tenant app filters by tenant_id and results come back nearly empty. Why?</summary><div class="qa-body">Post-filtering: the index returns the top ~40–50 overall, then the filter drops everything not in this tenant. With a 1%-selective filter almost nothing survives. Fix with filter-aware traversal (Qdrant/Weaviate), pgvector's iterative scans (0.8+), raising ef_search, or partitioning per tenant.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>pgvector, Qdrant or Pinecone for a production RAG app?</summary><div class="qa-body">Already on Postgres at modest scale → pgvector: no new system, JOINs with business data. Heavy, selective metadata filters and self-hosting → Qdrant. No one to run infrastructure → Pinecone (managed), accepting higher cost at high QPS. Benchmark on your own data either way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You upgraded the embedding model and retrieval got worse, with no errors. What happened?</summary><div class="qa-body">Queries are embedded with the new model but the index holds old-model vectors. The spaces don't align, so similarity is meaningless. Re-embed the whole corpus (often as a new index, then switch over) and store model name/version with the index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this return? <code>SELECT body FROM docs ORDER BY embedding &lt;=&gt; q DESC LIMIT 1;</code></summary><div class="qa-body">The <em>least</em> similar document. <code>&lt;=&gt;</code> is cosine distance (1 − cosine), so smaller means closer. Drop <code>DESC</code>. To display similarity, select <code>1 - (embedding &lt;=&gt; q)</code>.</div></details>
</main>`
});
