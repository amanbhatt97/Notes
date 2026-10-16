// notes/genai/vectordb.js — Embeddings & Vector DBs
Object.assign(TOPIC_CONTENT, {
  "vectordb": `<main>
  <h1>Embeddings &amp; Vector DBs</h1>
  <p class="lead">How a computer searches by <em>meaning</em> instead of by exact words: turn each text into a list of numbers, then find the lists that are closest. Builds on contextual embeddings from 01–02 and the API basics from 05. This is the search engine inside <a class="xref" data-note="rag">Retrieval-Augmented Generation</a>, and interviewers ask about it for any "chat with your documents" role.</p>

  <h2 id="vd-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
  <div class="mm-center">Embeddings &amp; Vector DBs</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Why vector search</div>
      <ul>
        <li><b>Gap</b> — SQL matches exact values; no operator for "same meaning"</li>
        <li><b>Vector DB</b> — stores embeddings, returns k nearest to a query vector</li>
        <li><b>Pipeline</b> — docs → embed → store vector + text; query → same model → k nearest</li>
        <li>💡 "restaurants within 2 km", in 1,536 dimensions</li>
        <li>⚠ <b>Doesn't replace SQL</b> — need metadata filters (user, date, status) too</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Sentence embeddings</div>
      <ul>
        <li><b>What</b> — one fixed-length vector per text (384–3,072 floats)</li>
        <li><b>How</b> — pool transformer token outputs + contrastive training on (query, passage) pairs</li>
        <li><b>Bi-encoder</b> — query and docs embedded separately → docs pre-computed</li>
        <li><b>Models</b> — text-embedding-3-small 1,536 · bge-m3 1,024 · MiniLM 384</li>
        <li><b>Choose</b> — MTEB leaderboard, then test on your data; mind query:/passage: prefixes</li>
        <li>⚠ <b>Models don't mix</b> — new model = re-embed everything; store model + version</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Similarity metrics</div>
      <ul>
        <li><b>Cosine</b> — A·B / (‖A‖‖B‖): angle only, −1..1; text default</li>
        <li><b>Dot</b> — angle and length; <b>L2</b> — endpoint distance</li>
        <li><b>Unit vectors</b> — all three rank the same; ‖A−B‖² = 2 − 2cos</li>
        <li><b>Trick</b> — normalise at index time, use cheap dot product</li>
        <li>⚠ <b>Wrong metric</b> ranks slightly wrong, silently</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">ANN &amp; trade-offs</div>
      <ul>
        <li><b>Brute force</b> — 10M × 1,536 ≈ 15B mult-adds/query: too slow</li>
        <li><b>ANN</b> — skip 95–99% of comparisons, lose a little recall, ~100× faster</li>
        <li><b>Families</b> — graph (HNSW), clusters (IVF), compression (PQ)</li>
        <li><b>Triangle</b> — recall vs latency vs memory: pick the hard constraint first</li>
        <li>💡 library: read every book / go to the shelf / follow "similar books"</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">HNSW</div>
      <ul>
        <li><b>Structure</b> — layered graphs: layer 0 = all vectors, upper = sparse long links</li>
        <li><b>Search</b> — greedy hops at top, drop a layer when stuck, wide local search at 0</li>
        <li><b>Speed</b> — ~log n hops, ~1 ms at tens of millions; inserts without rebuild</li>
        <li><b>Knobs</b> — <code>M</code> 16–64 links · <code>ef_construction</code> 100–200 · <code>ef_search</code> 40–200</li>
        <li>⚠ <b>RAM-hungry</b> — 10M × 1,536 × 4 B ≈ 61 GB + links</li>
        <li>💡 highway → ring road → your street</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">IVF + PQ</div>
      <ul>
        <li><b>IVF</b> — k-means into K clusters; query searches <code>nprobe</code> nearest clusters</li>
        <li><b>Example</b> — 10M, K = 1,000, nprobe = 10 → 100K compared</li>
        <li>⚠ <b>Boundary problem</b> — neighbour in next cluster; raise nprobe (10–20); retrain on drift</li>
        <li><b>PQ</b> — 768-d → 96 sub-vectors × 1-byte code: 3,072 B → 96 B (32×)</li>
        <li><b>PQ cost</b> — approximate distances; re-score top candidates</li>
        <li>⚠ <b>PQ is compression, not search</b> → IVF-PQ (FAISS)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Hybrid search</div>
      <ul>
        <li><b>Dense misses</b> exact codes, versions, SKUs; <b>BM25 misses</b> paraphrase</li>
        <li><b>RRF</b> — <code>Σ 1 / (60 + rank)</code>, ranks only, no score normalising</li>
        <li><b>Example</b> — dense [A,B,C] + BM25 [C,A,D] → A, C, B, D</li>
        <li><b>RAG</b> — retrieve ~50 (recall) → rerank to ~5 (precision) in <a class="xref" data-note="rag">Retrieval-Augmented Generation</a></li>
        <li>💡 two detectives: one for meaning, one for case numbers</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Choosing a vector DB</div>
      <ul>
        <li><b>Chroma</b> prototype · <b>pgvector</b> already on Postgres · <b>Qdrant</b> heavy filters · <b>Pinecone</b> managed · <b>Milvus</b> billions</li>
        <li><b>Ask</b> — how many vectors? how selective are filters? who runs it?</li>
        <li>⚠ <b>Post-filtering</b> — 1% filter after ANN: ask 50, get 1; use filter-aware search / iterative scans / partitions</li>
        <li><b>Benchmark</b> recall + p95 on your data</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">pgvector essentials</div>
      <ul>
        <li><b>Column</b> — <code>embedding vector(384)</code></li>
        <li><b>Operators</b> — <code>&lt;=&gt;</code> cosine distance · <code>&lt;-&gt;</code> L2 · <code>&lt;#&gt;</code> negative inner product</li>
        <li><b>Index</b> — <code>USING hnsw (embedding vector_cosine_ops)</code>; opclass must match operator</li>
        <li><b>Recall knob</b> — <code>SET hnsw.ef_search = 100</code> (default 40)</li>
        <li>⚠ <b>ORDER BY ... DESC</b> returns the least similar: it's a distance</li>
      </ul>
    </div>
  </div>
</div>

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
      <div class="rm-item rm-done" data-target="vd-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="vd-why"><span class="num">01</span>Why Vector Search</h2>
  <p>You run a customer-support desk. A new ticket says "my payment went through twice". You want to find old tickets about the same problem. You search your database for "payment went through twice". It returns nothing. The old tickets said "charged double" and "amount deducted two times". Same problem, zero shared words.</p>
  <p>That is the gap. A normal database (SQL) can only check "is this value exactly equal?" or "is it in this range?". There is no operator for "means the same thing". For "charged double" to match "payment went through twice", the computer needs a way to measure <em>meaning</em>.</p>
  <p>The idea in one sentence: <strong>turn every text into a point in space, so that texts with similar meaning land close together.</strong> Then "find similar tickets" becomes "find the nearest points". A text turned into such a point is called an <strong>embedding</strong>, and a database built to store these points and find the nearest ones fast is called a <strong>vector database</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600">
    <circle cx="120" cy="100" r="62" fill="none" class="st" stroke-dasharray="5 4"/>
    <circle cx="110" cy="70" r="5" class="tb"/><text x="119" y="74">kitten sleeping</text>
    <circle cx="150" cy="110" r="5" class="tb"/><text x="159" y="114">cat sat on mat</text>
    <circle cx="80" cy="140" r="5" class="tb"/><text x="89" y="144">dog chased ball</text>
    <circle cx="450" cy="60" r="5" class="tg"/><text x="459" y="64">stocks fell</text>
    <circle cx="450" cy="150" r="5" class="tr"/><text x="459" y="154">bread recipe</text>
    <circle cx="330" cy="190" r="5" class="tr"/><text x="339" y="194">dog treats recipe</text>
    <path d="M120,100 l4,9 l10,1 l-8,6 l3,10 l-9,-6 l-9,6 l3,-10 l-8,-6 l10,-1 z" class="fr sr" transform="translate(0,-12)"/>
    <text x="40" y="200" class="tr">★ query "puppy napping"</text>
    <text x="200" y="40" class="tm">k = 3 nearest</text>
    </svg><figcaption>Each sentence is a dot. Animal sentences sit together on the left, food on the right. The red star is the question "puppy napping": it lands near the animal dots, so the three nearest dots (inside the dashed circle) are the answer, even though "puppy napping" shares no word with "kitten sleeping".</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding a restaurant by its exact name is SQL. Asking Zomato for "all restaurants within 2 km of me" is vector search: it compares your location to every restaurant's location and returns the closest ones. A vector DB does the same thing, but a "location" has 1,536 coordinates instead of 2, and "close" means "similar meaning".</p>
  </div>
  <p>The whole flow, which you will meet again in every RAG system:</p>
  <div class="flow"><span>Docs</span><span>Embedding model</span><span>Vectors + text stored</span><span>Query → same model</span><span>k nearest</span><span>Original text</span></div>
  <p>Read it left to right. Once: every document goes through an embedding model and its vector is stored next to its text. Per question: the question goes through the <em>same</em> model, the database finds the <em>k</em> nearest stored vectors (k is just "how many results you want", say 3 or 5), and gives you their original text back.</p>
  <table class="tbl">
    <tr><th></th><th>SQL</th><th>Vector DB</th></tr>
    <tr><td>Query</td><td><code>WHERE user_id = 42</code></td><td>nearest to <code>embed("heart attack")</code></td></tr>
    <tr><td>Index</td><td>B-tree, exact</td><td>ANN, approximate</td></tr>
    <tr><td>Finds</td><td>Exact matches and ranges</td><td>"myocardial infarction" docs</td></tr>
    <tr><td>Fails at</td><td>Meaning</td><td>Exact IDs, codes, filters alone</td></tr>
  </table>
  <p>(The index row uses two words explained later: a B-tree is SQL's usual lookup structure, and ANN is "approximate nearest neighbour", section 04.)</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A vector DB does not replace SQL. "Orders by user 42" is a SQL question. "Tickets similar to this one" is a vector question. Real systems need both at once: vectors for meaning, plus ordinary filters for user, date and status. Section 08 shows how badly that combination can go if the database does it in the wrong order.</p>
  </div>

  <h2 id="vd-emb"><span class="num">02</span>Sentence Embeddings</h2>
  <p>How does a sentence become a point? Start with a toy version you can hold in your head. Describe each text with just two numbers: how much it is about animals, and how much it is about food.</p>
  <div class="fx" data-lang="py">import numpy as np

# Three tiny 2-number "embeddings": [animal-ness, food-ness]
cat   = np.array([0.9, 0.1])
puppy = np.array([0.8, 0.2])
pizza = np.array([0.1, 0.9])

def cosine(a, b):
    return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))

print("cat vs puppy:", round(cosine(cat, puppy), 3))
print("cat vs pizza:", round(cosine(cat, pizza), 3))</div>
  <table class="tbl out"><caption>Result</caption><tr><th>pair</th><th>similarity</th></tr><tr><td>cat vs puppy</td><td>0.991</td></tr><tr><td>cat vs pizza</td><td>0.22</td></tr></table>
  <p>"cat" and "puppy" both score high on animal and low on food, so their two numbers look alike and the similarity is near 1. "pizza" is the opposite, so the similarity is low. (<code>cosine</code> is the similarity formula; section 03 explains it. For now: 1 means same direction, 0 means unrelated.)</p>
  <p>A real embedding model does exactly this, but nobody hand-picks the axes. The model learns hundreds or thousands of axes on its own, and you never find out what each one "means". You only trust that similar texts get similar numbers.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>sentence embedding</strong> is one fixed-length list of numbers (a <strong>vector</strong>, typically 384 to 3,072 numbers) that stands for a whole text. Each number is one <strong>dimension</strong>. Similar meaning → vectors pointing in nearly the same direction.</p>
  </div>
  <p>Where do the numbers come from? A transformer (02) gives one vector per token. The model then averages or picks ("pools") those into a single vector. During training it is shown pairs: a question and its correct answer passage are pushed closer, a question and a random passage are pushed apart. This is called <strong>contrastive training</strong>. After millions of such pairs, "heart attack" and "myocardial infarction" end up close.</p>
  <div class="flow"><span>text</span><span>transformer: a vector per token</span><span>pool → one vector</span><span>contrastive training: matches close, non-matches far</span></div>
  <p>One more word you will hear: <strong>bi-encoder</strong>. It just means the question and the documents are embedded <em>separately</em>, by the same model, at different times. That is what lets you embed a million documents once, tonight, and only embed the question at search time.</p>
  <h3>Which model?</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Dims</th><th>Max input</th><th>Note</th></tr>
    <tr><td>OpenAI text-embedding-3-small</td><td>1,536</td><td>8,191 tokens</td><td>Cheap default; can shorten dims</td></tr>
    <tr><td>OpenAI text-embedding-3-large</td><td>3,072</td><td>8,191 tokens</td><td>Higher accuracy, higher cost</td></tr>
    <tr><td>BAAI bge-m3 (open)</td><td>1,024</td><td>8,192 tokens</td><td>Multilingual; dense + sparse in one</td></tr>
    <tr><td>all-MiniLM-L6-v2 (open)</td><td>384</td><td>256 word pieces</td><td>Tiny, fast, CPU-friendly; lower accuracy</td></tr>
  </table>
  <p>"Dims" is how many numbers per vector. More dims usually means a bit more accuracy and more memory. Rankings change every few months, so check the MTEB leaderboard (a public scoreboard of embedding models), then test the top two or three on <em>your</em> data. Some models expect a prefix such as <code>query:</code> before questions and <code>passage:</code> before documents; skipping it quietly hurts results.</p>
  <div class="callout trap"><span class="label">Trap: models don't mix</span>
    <p>Each model draws its own map. Axis 7 means something in model A and something unrelated in model B. If you embed your documents with model A and your question with model B, the numbers are compared on two different maps. You get confident nonsense, and no error message. Changing models means re-embedding every document, so store the model name and version together with the index.</p>
  </div>

  <h2 id="vd-sim"><span class="num">03</span>Similarity Metrics</h2>
  <p>"Find the closest vectors" needs a definition of close. There are three common ones. To see how they differ, take a vector and a second one that points the same way but is twice as long:</p>
  <div class="fx" data-lang="py">import numpy as np
a = np.array([3.0, 4.0])
b = np.array([6.0, 8.0])          # same direction, twice as long
print("cosine:", a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
print("dot:   ", a @ b)
print("L2:    ", np.linalg.norm(a - b))
au, bu = a / np.linalg.norm(a), b / np.linalg.norm(b)
print("after normalising -> dot:", au @ bu, " L2:", np.linalg.norm(au - bu))</div>
  <table class="tbl out"><caption>Result</caption><tr><th>metric</th><th>a vs b</th></tr><tr><td>cosine</td><td>1.0</td></tr><tr><td>dot</td><td>50.0</td></tr><tr><td>L2</td><td>5.0</td></tr><tr><td>after normalising → dot</td><td>1.0</td></tr><tr><td>after normalising → L2</td><td>0.0</td></tr></table>
  <ul>
    <li><strong>Cosine</strong> says 1.0: "same direction, so identical". It ignores length completely.</li>
    <li><strong>Dot product</strong> says 50: it grows with the angle <em>and</em> with the lengths.</li>
    <li><strong>L2 (Euclidean) distance</strong> says 5: the straight-line gap between the two arrow tips. Smaller is closer.</li>
    <li>After <strong>normalising</strong> (shrinking every vector to length 1), all three agree. The last line shows dot = 1 and L2 = 0.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
    <defs><marker id="vd-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker><marker id="vd-ahb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs>
    <line x1="40" y1="170" x2="144" y2="110" class="sb" stroke-width="2" marker-end="url(#vd-ahb)"/>
    <line x1="40" y1="170" x2="300" y2="20" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#vd-ah)"/>
    <line x1="40" y1="170" x2="120" y2="55" stroke="currentColor" stroke-width="1.5" marker-end="url(#vd-ah)"/>
    <text x="149" y="126" class="tb">A short</text><text x="130" y="12">A long (same direction)</text><text x="126" y="55">B</text>
    <path d="M92,140 A60,60 0 0,0 74,121" fill="none" class="st" stroke-width="2"/>
    <text x="108" y="118" class="tm">θ</text>
    <line x1="144" y1="110" x2="300" y2="20" class="sr" stroke-dasharray="2 3"/>
    <text x="320" y="150" class="tm">cosine(A short, A long) = 1</text><text x="320" y="168" class="tr">L2 distance: large</text>
    </svg><figcaption>Two arrows from the same corner. "A short" and "A long" point the same way, so cosine calls them identical (angle θ = 0). L2 measures the gap between their tips (the red dotted line), which is large. B points elsewhere, so cosine gives it a smaller score.</figcaption></figure>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Measures</th></tr>
    <tr><td><strong>Cosine</strong></td><td>A·B / (‖A‖ ‖B‖)</td><td>Angle only. Range −1 to 1.</td></tr>
    <tr><td><strong>Dot product</strong></td><td>Σ AᵢBᵢ</td><td>Angle <em>and</em> length</td></tr>
    <tr><td><strong>Euclidean (L2)</strong></td><td>√Σ(Aᵢ−Bᵢ)²</td><td>Distance between endpoints</td></tr>
  </table>
  <p>Reading the symbols: A·B (the dot product) means multiply the vectors number by number and add up: Σ AᵢBᵢ. ‖A‖ is the length of A (√ of the sum of its squares; for [3, 4] that is 5). Dividing by both lengths removes length from the answer, leaving only the angle.</p>
  <p>Why cosine is the default for text: the <em>direction</em> of a text's vector carries its meaning, while its <em>length</em> often just tracks how long the text was. You do not want a long document to look "more similar" only because it is long.</p>
  <div class="callout intu"><span class="label">The practical trick</span>
    <p>Normalise every vector to length 1 once, when you store it. Then the cheap dot product gives exactly the cosine ranking, and L2 ranks the same way too (‖A−B‖² = 2 − 2·cos when both have length 1). The Build It code does this in one line.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Use the metric the model was trained with (its documentation says which). The wrong one does not crash. It just ranks slightly wrong, every time, and nobody notices for months.</p>
  </div>

  <h2 id="vd-ann"><span class="num">04</span>ANN &amp; the Trade-off Triangle</h2>
  <p>With six documents, searching is easy: compare the question with all six and sort. With ten million documents it is not. Count the work:</p>
  <div class="fx" data-lang="py">n, dims = 10_000_000, 1536
print(f"{n * dims:,} multiply-adds for ONE query")
print(f"{n * dims * 4 / 1e9:.1f} GB of raw float32 vectors")</div>
  <div class="fx" data-lang="text">15,360,000,000 multiply-adds for ONE query
61.4 GB of raw float32 vectors</div>
  <p>Fifteen billion operations per question is hundreds of milliseconds on a CPU. With a hundred users asking at once, that is too slow. Comparing with everything is called <strong>brute force</strong> or <strong>exact kNN</strong> (k nearest neighbours).</p>
  <p>The way out: organise the vectors in advance so a query can skip most of them. You might miss the true closest vector now and then, but you answer 100× faster. This is <strong>ANN, approximate nearest neighbour</strong> search. "Approximate" is the price; "nearest neighbour" is the goal.</p>
  <div class="cards">
    <div><b>Brute force (exact kNN)</b><p>Compare with every vector. 10M × 1,536 dims ≈ 15 billion multiply-adds per query.</p><small>Hundreds of ms on CPU: too slow at real traffic</small></div>
    <div><b>ANN (approximate)</b><p>Pre-organised index skips 95–99% of comparisons.</p><small>~100× faster; occasionally misses a true neighbour</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy: a library</span>
    <p>You want books similar to one you liked. Brute force: read the back cover of every book in the building. IVF: walk to the right subject shelf and scan only that shelf. HNSW: every book lists 10–20 "similar books" inside its cover; follow the recommendations and you arrive in a few hops. The next two sections are those two methods.</p>
  </div>
  <div class="cards">
    <div><b>Graph (HNSW)</b><p>Link similar vectors; walk the graph.</p><small>Best recall + latency. Whole graph in RAM.</small></div>
    <div><b>Clusters (IVF)</b><p>Group vectors; search only nearby groups.</p><small>Less RAM. Misses at cluster edges.</small></div>
    <div><b>Compression (PQ)</b><p>Shrink each vector ~32×.</p><small>Billion scale. Not a search method alone.</small></div>
  </div>
  <h3>The recall–latency–memory triangle</h3>
  <p>Three words you need. <strong>Recall</strong>: of the true 10 nearest vectors, how many did the index actually return? 9 out of 10 is recall 0.9. <strong>Latency</strong>: how long one query takes. <strong>Memory</strong>: how much RAM the index needs. Every index can be good at two of these, and the third suffers. Decide which one you cannot compromise on, then pick the index and its knobs.</p>
  <table class="tbl">
    <tr><th>Knob</th><th>Recall</th><th>Latency</th><th>Memory</th></tr>
    <tr><td>HNSW: raise <code>M</code></td><td>↑</td><td>↑ slightly</td><td>↑</td></tr>
    <tr><td>HNSW: raise <code>ef_search</code></td><td>↑</td><td>↑</td><td>same</td></tr>
    <tr><td>IVF: raise <code>nprobe</code></td><td>↑</td><td>↑</td><td>same</td></tr>
    <tr><td>Add PQ compression</td><td>↓ a little</td><td>↓</td><td>↓↓</td></tr>
    <tr><td>DiskANN (graph on SSD)</td><td>≈ HNSW</td><td>↑ (disk I/O)</td><td>↓</td></tr>
  </table>
  <p>The knobs (<code>M</code>, <code>ef_search</code>, <code>nprobe</code>) are explained where their index is. Notice the pattern: anything that raises recall costs time or memory.</p>

  <h2 id="vd-hnsw"><span class="num">05</span>HNSW</h2>
  <p>The most used ANN index. The idea: connect every vector to its closest neighbours, like friends in a WhatsApp network. To find vectors near your query, start anywhere and keep moving to whichever neighbour is closer to the query. Stop when no neighbour is closer.</p>
  <p>One problem: if every link is short, you take thousands of tiny steps to cross the map. The fix is <em>layers</em>. The top layer has only a few vectors with long-range links, for big jumps. Each lower layer has more vectors and shorter links. You start at the top, jump as far as you can, then drop down a layer to get finer.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>HNSW (Hierarchical Navigable Small World)</strong>: a stack of graphs. Layer 0 holds every vector, linked to its nearest neighbours. Each higher layer keeps a small random subset with longer-range links. "Hierarchical" = layered; "navigable small world" = a network where any point is a few hops from any other.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600">
    <defs><marker id="vd-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <rect x="50" y="20" width="540" height="40" rx="6" class="fs"/><text x="10" y="44" class="tm">2</text>
    <line x1="100" y1="40" x2="480" y2="40" stroke="currentColor" opacity="0.45"/>
    <circle cx="100" cy="40" r="6" class="fb sb"/>
    <circle cx="480" cy="40" r="6" class="fb sb"/>
    <rect x="50" y="95" width="540" height="40" rx="6" class="fs"/><text x="10" y="119" class="tm">1</text>
    <line x1="100" y1="115" x2="230" y2="115" stroke="currentColor" opacity="0.45"/>
    <line x1="230" y1="115" x2="380" y2="115" stroke="currentColor" opacity="0.45"/>
    <line x1="380" y1="115" x2="480" y2="115" stroke="currentColor" opacity="0.45"/>
    <circle cx="100" cy="115" r="6" class="fb sb"/>
    <circle cx="230" cy="115" r="6" class="fb sb"/>
    <circle cx="380" cy="115" r="6" class="fb sb"/>
    <circle cx="480" cy="115" r="6" class="fb sb"/>
    <rect x="50" y="170" width="540" height="40" rx="6" class="fs"/><text x="10" y="194" class="tm">0</text>
    <line x1="70" y1="190" x2="100" y2="190" stroke="currentColor" opacity="0.45"/>
    <line x1="100" y1="190" x2="140" y2="190" stroke="currentColor" opacity="0.45"/>
    <line x1="140" y1="190" x2="190" y2="190" stroke="currentColor" opacity="0.45"/>
    <line x1="190" y1="190" x2="230" y2="190" stroke="currentColor" opacity="0.45"/>
    <line x1="230" y1="190" x2="270" y2="190" stroke="currentColor" opacity="0.45"/>
    <line x1="270" y1="190" x2="320" y2="190" stroke="currentColor" opacity="0.45"/>
    <line x1="320" y1="190" x2="380" y2="190" stroke="currentColor" opacity="0.45"/>
    <line x1="380" y1="190" x2="420" y2="190" stroke="currentColor" opacity="0.45"/>
    <line x1="420" y1="190" x2="450" y2="190" stroke="currentColor" opacity="0.45"/>
    <line x1="450" y1="190" x2="480" y2="190" stroke="currentColor" opacity="0.45"/>
    <line x1="480" y1="190" x2="530" y2="190" stroke="currentColor" opacity="0.45"/>
    <circle cx="70" cy="190" r="6" class="fb sb"/>
    <circle cx="100" cy="190" r="6" class="fb sb"/>
    <circle cx="140" cy="190" r="6" class="fb sb"/>
    <circle cx="190" cy="190" r="6" class="fb sb"/>
    <circle cx="230" cy="190" r="6" class="fb sb"/>
    <circle cx="270" cy="190" r="6" class="fb sb"/>
    <circle cx="320" cy="190" r="6" class="fb sb"/>
    <circle cx="380" cy="190" r="6" class="fb sb"/>
    <circle cx="420" cy="190" r="6" class="fb sb"/>
    <circle cx="450" cy="190" r="6" class="fb sb"/>
    <circle cx="480" cy="190" r="6" class="fb sb"/>
    <circle cx="530" cy="190" r="6" class="fb sb"/>
    <text x="10" y="18" class="tm">layer</text>
    <polyline points="100,40 480,40 480,115 380,115 380,190 420,190" fill="none" class="sr" stroke-width="2.5" marker-end="url(#vd-ah2)"/>
    <circle cx="420" cy="190" r="8" class="fr sr"/><text x="400" y="230" class="tr">target</text><text x="70" y="70" class="tm">enter at top</text>
    <text x="250" y="28" class="tm">few nodes, long links</text><text x="190" y="230" class="tm">every vector, short links</text>
    </svg><figcaption>Follow the red path. Layer 2 has two nodes, so one jump covers most of the map. Drop to layer 1, step back one node. Drop to layer 0, where every vector lives, and take the last small step to the target. Five hops instead of twelve.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Driving from Delhi to one street in Mumbai: national highway → city ring road → suburb road → your street. You only switch to finer roads once you are in the right area. HNSW builds that road network from your data.</p>
  </div>
  <p>The search in words: enter at the top layer, hop greedily toward the query, drop a layer when no neighbour is closer, and at layer 0 keep a short list of the best candidates found (its size is <code>ef_search</code>) so one bad hop does not end the search. The number of hops grows roughly with log n, which is why tens of millions of vectors still answer in about a millisecond. New vectors can be inserted without rebuilding the whole index.</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Meaning</th><th>Typical</th></tr>
    <tr><td><code>M</code></td><td>Links per node. More → better recall, more RAM, slower build.</td><td>16–64</td></tr>
    <tr><td><code>ef_construction</code></td><td>Candidate list size while building. Higher → better graph, slower build.</td><td>100–200</td></tr>
    <tr><td><code>ef_search</code></td><td>Candidate list size per query. Your runtime recall/latency knob.</td><td>40–200</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap: HNSW lives in RAM</span>
    <p>The whole graph must sit in memory. 10M vectors × 1,536 dims × 4 bytes ≈ 61 GB of raw floats, plus the links. At 100M+ vectors that is impractical on one machine: use DiskANN (a graph index that lives on SSD), or IVF-PQ from the next section.</p>
  </div>

  <h2 id="vd-ivf"><span class="num">06</span>IVF + Product Quantization</h2>
  <h3>IVF (inverted file index)</h3>
  <p>A different way to skip work: sort the vectors into groups first. At build time, run k-means (a clustering algorithm that finds K group centres, called <strong>centroids</strong>) and assign each vector to its nearest centroid. At query time, compare the query only with the K centroids, pick the closest few, and search only inside those groups.</p>
  <div class="flow"><span>Build: k-means → K clusters</span><span>Query: compare with K centroids</span><span>Search only the nprobe nearest clusters</span></div>
  <p>Small numbers: 10M vectors, K = 1,000 clusters, so about 10,000 vectors per cluster. A query compares with 1,000 centroids, then searches the <code>nprobe</code> = 10 nearest clusters: 10 × 10,000 = 100,000 vectors compared instead of 10,000,000. One hundred times less work.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tax papers in 12 monthly folders. Need a March receipt? Open the March folder only. IVF sorts vectors into folders at build time and opens only the relevant ones.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
    <line x1="200" y1="10" x2="240" y2="210" stroke="currentColor" opacity="0.5"/><line x1="400" y1="10" x2="370" y2="210" stroke="currentColor" opacity="0.5"/>
    <circle cx="60" cy="50" r="4" class="tb"/>
    <circle cx="90" cy="120" r="4" class="tb"/>
    <circle cx="140" cy="80" r="4" class="tb"/>
    <circle cx="110" cy="170" r="4" class="tb"/>
    <circle cx="160" cy="150" r="4" class="tb"/>
    <circle cx="150" cy="40" r="4" class="tb"/>
    <circle cx="260" cy="60" r="4" class="tg"/>
    <circle cx="300" cy="150" r="4" class="tg"/>
    <circle cx="330" cy="90" r="4" class="tg"/>
    <circle cx="280" cy="190" r="4" class="tg"/>
    <circle cx="350" cy="170" r="4" class="tg"/>
    <circle cx="230" cy="115" r="4" class="tg"/>
    <circle cx="450" cy="60" r="4" class="tm"/>
    <circle cx="500" cy="140" r="4" class="tm"/>
    <circle cx="540" cy="80" r="4" class="tm"/>
    <circle cx="430" cy="180" r="4" class="tm"/>
    <circle cx="480" cy="100" r="4" class="tm"/>
    <path d="M116,106 l8,8 M124,106 l-8,8" stroke="currentColor" stroke-width="2.5"/>
    <path d="M291,121 l8,8 M299,121 l-8,8" stroke="currentColor" stroke-width="2.5"/>
    <path d="M481,106 l8,8 M489,106 l-8,8" stroke="currentColor" stroke-width="2.5"/>
    <circle cx="195" cy="118" r="7" class="fr sr"/><text x="40" y="205" class="tr">query near an edge</text>
    <circle cx="230" cy="115" r="10" fill="none" class="sg" stroke-width="2"/><text x="250" y="30" class="tg">true nearest is here</text>
    <text x="40" y="25" class="tm">× = centroid</text><text x="440" y="210" class="tm">nprobe=1 misses it</text>
    </svg><figcaption>Three clusters, each with its centroid (×). The red query sits in the blue cluster, right next to the border. Its true nearest neighbour (green ring) is just across the line in the green cluster. With nprobe = 1 only the blue cluster is searched, so the best answer is never seen.</figcaption></figure>
  <div class="callout trap"><span class="label">Trap: the boundary problem</span>
    <p>A query near a cluster edge may have its true neighbours in the next cluster, like a house at the end of a lane whose nearest shop is in the next colony. With nprobe = 1 you miss them. Raise nprobe (10–20 recovers most). Also, if your data changes a lot, the old centroids no longer fit it, so IVF needs periodic retraining.</p>
  </div>
  <h3>Product Quantization (PQ)</h3>
  <p>At a billion vectors even the raw numbers do not fit anywhere (1B × 1,536 × 4 bytes ≈ 6 TB). IVF only reduces how many vectors you <em>compare</em>; PQ reduces how big each vector <em>is</em>.</p>
  <ol>
    <li>Cut each 768-number vector into 96 pieces of 8 numbers each.</li>
    <li>For each piece position, find 256 "typical" 8-number patterns (again with k-means). This list is the <strong>codebook</strong>.</li>
    <li>Store each piece as the ID of its most similar pattern. An ID from 0 to 255 fits in 1 byte.</li>
  </ol>
  <div class="fx" data-lang="py">print(f"{768 * 4} bytes per 768-d vector -> {768 // 8} bytes with PQ")</div>
  <div class="fx" data-lang="text">3072 bytes per 768-d vector -> 96 bytes with PQ</div>
  <p><strong>32× smaller.</strong> 100M vectors: 307 GB → ~9.6 GB. The cost: you no longer have the exact numbers, so distances are approximate and you lose a few percent of recall. The usual fix is to use PQ to find, say, the top 100 candidates, then re-score those 100 with their full vectors.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Saving a photo with a 256-colour palette. Each pixel stores a palette number instead of its full colour. Slightly off, still clearly the same picture, and a fraction of the size.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>PQ is compression, not search. On its own it still compares with every vector, just cheaper. It is paired with IVF (IVF-PQ, for example in the FAISS library) so that IVF decides <em>which</em> vectors to look at and PQ makes each look cheap.</p>
  </div>

  <h2 id="vd-hyb"><span class="num">07</span>Hybrid Search</h2>
  <p>Embeddings are great at meaning and weak at exact strings. Ask "what does error E-4471 mean?" and the embedding of "E-4471" is a vague blur; a document about "E-4472" lands just as close. Old-fashioned keyword search has the opposite problem: it finds "E-4471" perfectly but scores "heart attack" vs "myocardial infarction" as zero.</p>
  <table class="tbl">
    <tr><th>Retriever</th><th>Misses</th><th>Example</th></tr>
    <tr><td><strong>Dense</strong> (embeddings)</td><td>Exact rare terms</td><td>error codes, "v2.3.1", SKUs</td></tr>
    <tr><td><strong>BM25</strong> (TF-IDF-style keyword score, 01)</td><td>Paraphrase</td><td>"heart attack" vs "myocardial infarction" = 0</td></tr>
  </table>
  <p>Since the two fail in different places, run both and merge. This is <strong>hybrid search</strong>. The merge has a catch: a cosine score like 0.83 and a BM25 score like 12.7 are on different scales, so you cannot just add them. The fix is to ignore the scores and use only the <em>positions</em> in each list.</p>
  <div class="callout def"><span class="label">Reciprocal Rank Fusion (RRF)</span>
    <p>score(doc) = Σ 1 / (k + rank) across retrievers, with k ≈ 60. "rank" is the doc's position in that retriever's list (1 = first). A doc that is first in one list gets 1/61; one that is third gets 1/63. Docs that appear in both lists collect two terms and rise to the top. The constant k just stops the first position from dominating.</p>
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
  <p>Work one out by hand: doc_A is 1st in dense (1/61) and 2nd in BM25 (1/62), total 0.0325. doc_B is 2nd in dense only (1/62 = 0.0161). So A beats B, and both docs found by both lists (A, C) beat both docs found by one (B, D).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two detectives. One recognises that "fled by car" and "drove off" describe the same event. The other finds case file #2024-0847 the moment you quote the number. A suspect both of them rank highly is almost certainly the right one.</p>
  </div>
  <p>In RAG, hybrid retrieval is the first, wide net: fetch ~50 candidates for recall, then a reranker narrows them to ~5 for precision (<a class="xref" data-note="rag">Retrieval-Augmented Generation</a>).</p>

  <h2 id="vd-choose"><span class="num">08</span>Choosing a Vector DB</h2>
  <p>Many products do the storing-and-nearest-search job. They differ in scale, filtering and who runs them.</p>
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
    <li><strong>How selective are filters?</strong> If "tenant = X" keeps 1% of data, you need filtering <em>during</em> the search, not after.</li>
    <li><strong>Who runs it?</strong> No ops team → managed service. Cost-sensitive with ops skills → self-host.</li>
  </ol>
  <h3>The post-filtering problem</h3>
  <p>Remember the trap from section 01: real queries mix meaning with a filter, such as "tickets similar to this one, <em>for customer 42 only</em>". There are two orders to do that in. <strong>Pre/in-filtering</strong>: only look at customer 42's vectors while searching. <strong>Post-filtering</strong>: find the 50 nearest vectors from everyone, then throw away the ones that are not customer 42's.</p>
  <p>Small numbers show why the second order fails. 1,000 customers, so customer 42 owns about 0.1% of all vectors. The ANN index returns the 50 nearest overall. Expected number of those 50 belonging to customer 42: 50 × 0.001 = 0.05. You asked for 50 results and typically get zero.</p>
  <div class="callout trap"><span class="label">Trap: post-filtering</span>
    <p>If the DB runs ANN first and filters after, a selective filter can throw away almost everything: ask for 50, get 1 or 0 back. Fixes: filter-aware traversal (Qdrant, Weaviate), iterative index scans that keep searching until enough rows pass (pgvector 0.8+), or a separate partition per tenant.</p>
  </div>
  <p>These sizes are rules of thumb. Benchmark recall and p95 latency (the time the slowest 5% of queries take) on your own data before committing.</p>

  <h2 id="vd-build"><span class="num">09</span>Build It</h2>
  <p>Goal: semantic search over six sentences, first in numpy, then in Postgres. The embedding is a toy you can read: each known word adds to four meaning axes (animal, rest, money, food), like the 2-axis toy in section 02. Swap in a real model and the search code stays the same.</p>
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
  <p>What each part does: <code>embed</code> adds up the word vectors and shrinks the result to length 1 (the normalising trick from section 03). <code>X</code> is the "index": one row per document. <code>X @ q</code> multiplies the query with every row at once, giving six cosine scores. <code>argsort(-scores)</code> sorts highest first; <code>[:k]</code> keeps the top k.</p>
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
    <p>"puppy napping" shares <em>no words</em> with "A kitten sleeping in the sun", yet it ranks first. Keyword search would score it 0. That is the whole point of embeddings.</p>
  </div>
  <p>With a real model, only <code>embed</code> changes (sentence-transformers shown; it downloads the model on first use):</p>
  <div class="fx" data-lang="py">from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")
X = model.encode(docs, normalize_embeddings=True)    # (6, 384)
q = model.encode("puppy napping", normalize_embeddings=True)
scores = X @ q</div>

  <h3>Same search in Postgres with pgvector</h3>
  <p>pgvector adds a <code>vector</code> column type and distance operators to ordinary Postgres. Store each vector beside its row, then sort by distance. Run here on PostgreSQL 16 + pgvector 0.6, using the toy vectors from above (rounded).</p>
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
  <p>Line by line: <code>vector(4)</code> says each row holds 4 numbers. <code>CREATE INDEX ... USING hnsw</code> builds the HNSW graph from section 05. <code>&lt;=&gt;</code> is the cosine <em>distance</em> operator (1 − cosine, so 0 means identical). <code>ORDER BY ... LIMIT 3</code> is "the 3 nearest". Same ranking as numpy.</p>
  <p>Now mix meaning with an ordinary filter, the thing pgvector is best at:</p>
  <div class="fx" data-lang="sql">SELECT body, round((embedding &lt;=&gt; '[0.646,0.763,0,0]')::numeric, 3) AS distance
FROM docs
WHERE topic = 'cooking'
ORDER BY embedding &lt;=&gt; '[0.646,0.763,0,0]'
LIMIT 2;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>body</th><th>distance</th></tr><tr><td>Homemade dog treats recipe</td><td>0.604</td></tr><tr><td>Easy bread recipe for beginners</td><td>1.000</td></tr></table>
  <p>Only cooking rows are considered, then they are sorted by distance to "puppy napping". The dog-treats recipe is closer because "dog" shares the animal axis.</p>
  <ul>
    <li>Operators: <code>&lt;=&gt;</code> cosine <em>distance</em> (1 − cosine), <code>&lt;-&gt;</code> L2 distance, <code>&lt;#&gt;</code> <em>negative</em> inner product. All three are "smaller = closer", so all sort ascending.</li>
    <li>The index opclass must match the operator: <code>vector_cosine_ops</code> serves <code>&lt;=&gt;</code> only. Use <code>&lt;-&gt;</code> with a cosine index and Postgres silently ignores the index.</li>
    <li>Recall knob at query time: <code>SET hnsw.ef_search = 100;</code> (default 40). That is the <code>ef_search</code> from section 05.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>ORDER BY embedding &lt;=&gt; q DESC</code> returns the <em>least</em> similar rows. It is a distance: smaller is closer, so you want the default ascending order.</p>
  </div>

  <h2 id="vd-qa"><span class="num">10</span>Questions &amp; Answers</h2>
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
