// notes/genai/rag.js — Retrieval-Augmented Generation
Object.assign(TOPIC_CONTENT, {
  "rag": `<main>
  <h1>Retrieval-Augmented Generation</h1>
  <p class="lead">RAG lets an LLM answer from <em>your</em> documents: fetch the relevant pieces, put them in the prompt, ask for a cited answer. Needs prompting (04), the Messages API (05) and vector search (06). Unlocks agentic RAG in 08–11 and RAG evals in 13.</p>

  <h2 id="rg-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Retrieval-Augmented Generation</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why RAG</div>
        <ul>
          <li><b>RAG</b> — retrieve relevant text per query, put it in the prompt, answer from it</li>
          <li><b>Fixes</b>
            <ul><li>knowledge cutoff (stale facts)</li><li>no private data (wiki, PDFs, tickets)</li><li>hallucination → grounded, cited answers</li></ul>
          </li>
          <li>💡 <b>Open-book exam</b> — smart student, but you must hand over the right pages</li>
          <li><b>RAG vs fine-tuning</b> — RAG changes what it <em>knows</em>; FT changes how it <em>behaves</em></li>
          <li><b>Docs change weekly?</b> RAG: re-index, no retraining, built-in citations. Often both.</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The pipeline</div>
        <ul>
          <li><b>Offline (indexing)</b> — load → chunk → metadata → embed → vector DB</li>
          <li><b>Online (per query)</b> — embed query → retrieve ~50 → rerank ~5 → prompt + sources → LLM → answer + citations</li>
          <li><b>Metadata</b> — source, page, position, date → citations, filters, debugging</li>
          <li>⚠ <b>Same embedding model</b> for query and chunks; mismatch fails silently (random results)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Chunking</div>
        <ul>
          <li><b>Why</b> — embedding input limits; don't send 100 pages for 2 paragraphs</li>
          <li><b>Start</b> — ~256–512 tokens, ~10–15% overlap; tune on your data</li>
          <li><b>Too small</b> — answers split, no context. <b>Too big</b> — topics blur one embedding</li>
          <li><b>Strategies</b>
            <ul><li>fixed + overlap (default)</li><li>recursive / structural (headings → paragraphs → sentences)</li><li>semantic (split where similarity drops)</li><li>parent–child: match small, send big parent</li><li>contextual headers: prefix doc/section title</li></ul>
          </li>
          <li>💡 <b>Index cards</b> — each card must be findable <em>and</em> make sense alone</li>
          <li>⚠ Bad chunks beat a great LLM: nothing downstream recovers a missed chunk</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Retrieval &amp; reranking</div>
        <ul>
          <li><b>Dense</b> = paraphrase; <b>BM25</b> = exact codes/names; <b>hybrid + RRF</b> = safe default</li>
          <li><b>Metadata filters</b> — tenant, date, product, access rights</li>
          <li><b>Multi-query</b> — LLM writes 3–5 rephrasings, merge results</li>
          <li><b>Bi-encoder</b> — embeds separately, fast, top ~50 (recall)</li>
          <li><b>Cross-encoder</b> — reads query+doc together, slow, accurate, top ~5 (precision)</li>
          <li>💡 <b>Hiring</b> — recruiter skims 5,000 CVs → 50; manager interviews 50 → 5</li>
          <li>⚠ <b>k ≠ n</b> — retrieve 20–100, rerank to 3–10; retrieve 5 and rank-8 best is lost</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Prompting with context</div>
        <ul>
          <li><b>Numbered, tagged sources</b> — <code>&lt;source id="1" ref="..."&gt;</code> → checkable [1] citations</li>
          <li><b>Rules</b> — use ONLY sources; cite every claim; say "I don't know"; flag conflicts</li>
          <li><b>Native citations</b> — some APIs (Anthropic) point to exact passages</li>
          <li>⚠ <b>Lost in the middle</b> — fewer chunks, best first</li>
          <li>⚠ <b>Retrieved text is untrusted</b> — data, not instructions (indirect injection, 14)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Advanced RAG</div>
        <ul>
          <li><b>Query rewriting</b> — chatty follow-up → standalone query</li>
          <li><b>HyDE</b> — embed a fake answer; it lands near real docs (statement vs question)</li>
          <li><b>Multi-hop</b> — retrieve, read, re-query ("manager of team that owns X")</li>
          <li><b>Corrective RAG</b> — grade chunks, drop weak, fall back to web</li>
          <li><b>FLARE</b> — re-retrieve mid-generation when confidence drops</li>
          <li><b>GraphRAG</b> — entity graph + communities; themes, relationships</li>
          <li><b>Agentic RAG</b> — retrieval as a tool; model decides when/what/again; cap steps</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Failures &amp; metrics</div>
        <ul>
          <li><b>#1 cause</b> — right chunk not retrieved → hybrid, chunking, multi-query, k + rerank</li>
          <li><b>Others</b> — ignores grounding, model mismatch, stale index, vocabulary mismatch</li>
          <li><b>Retrieval</b> — Recall@k, MRR (check first)</li>
          <li><b>Generation</b> — faithfulness, answer relevance</li>
          <li><b>Context</b> — precision (useful share), recall (everything needed?)</li>
          <li>⚠ Measure the halves <b>separately</b> or you can't tell which broke (deep evals: 13)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Build it (plain Python)</div>
        <ul>
          <li><b>Chunker</b> — 20-word windows, 5-word overlap → 7 chunks</li>
          <li><b>Embed</b> — hashed bag of words (offline stand-in), cosine via <code>index @ q</code></li>
          <li><b>Retrieve</b> — top-k with <code>min_score</code>; empty → "couldn't find", no LLM call</li>
          <li><b>Prompt</b> — numbered <code>&lt;source&gt;</code> tags + strict system prompt → Claude</li>
          <li>⚠ "meal"/"trips" ≠ "Meals"/"trip" → bag-of-words misses; real embeddings fix it</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rg-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why RAG</span><span class="rm-sub">Cutoff, private data, hallucination</span></div></div>
      <div class="rm-item rm-done" data-target="rg-pipe"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Pipeline</span><span class="rm-sub">Index offline, answer online</span></div></div>
      <div class="rm-item rm-done" data-target="rg-chunk"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Chunking</span><span class="rm-sub">The most underrated decision</span></div></div>
      <div class="rm-item rm-done" data-target="rg-ret"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Retrieval &amp; Reranking</span><span class="rm-sub">Recall first, precision second</span></div></div>
      <div class="rm-item rm-done" data-target="rg-prompt"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Prompting with Context</span><span class="rm-sub">Grounding and citations</span></div></div>
      <div class="rm-item rm-done" data-target="rg-adv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Advanced RAG</span><span class="rm-sub">HyDE, multi-hop, agentic, graphs</span></div></div>
      <div class="rm-item rm-done" data-target="rg-fail"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Failure Modes &amp; What to Measure</span><span class="rm-sub">Blame retrieval first</span></div></div>
      <div class="rm-item rm-done" data-target="rg-build"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">End-to-end RAG in plain Python</span></div></div>
      <div class="rm-item rm-done" data-target="rg-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="rg-why"><span class="num">01</span>Why RAG</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>RAG</strong>: retrieve relevant text from a knowledge base at question time, add it to the prompt, and have the LLM answer from it. The model becomes a reasoning engine over documents, not a memory of facts.</p>
  </div>
  <div class="cards">
    <div><b>Knowledge cutoff</b><p>Training stopped at a date; "today's policy" is stale or invented.</p><small>Fix: retrieve current data per query</small></div>
    <div><b>No private data</b><p>The model never saw your wiki, PDFs or tickets.</p><small>Fix: index your docs</small></div>
    <div><b>Hallucination</b><p>When it doesn't know, it answers confidently anyway.</p><small>Fix: ground answers in sources, cite them</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An open-book exam. The student (LLM) is smart but can't memorise the company handbook. RAG hands them the right pages before each question. If you hand over the wrong pages, even a brilliant student fails.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>RAG</th><th>Fine-tuning</th></tr>
    <tr><td>Changes</td><td>What the model <em>knows</em> right now</td><td>How the model <em>behaves</em>: style, format, process</td></tr>
    <tr><td>Data changes often?</td><td>Yes: re-index, no retraining</td><td>Poor fit: retrain each time</td></tr>
    <tr><td>Citations / auditing</td><td>Built in</td><td>Not possible</td></tr>
  </table>
  <p>Often both: fine-tune for style, RAG for facts. The full decision is in 15 · Fine-Tuning.</p>

  <h2 id="rg-pipe"><span class="num">02</span>The Pipeline</h2>
<figure class="viz"><svg viewBox="0 0 600 196" width="600"><defs><marker id="rg-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="20" y="16" class="tm" font-size="11">OFFLINE · indexing — once, then on a schedule</text><rect x="20" y="26" width="92" height="44" rx="7" class="ft st"/><text x="66" y="46" text-anchor="middle" font-weight="bold">Load</text><text x="66" y="60" text-anchor="middle" font-size="10" class="tm">PDF · web · DB</text><rect x="132" y="26" width="92" height="44" rx="7" class="ft st"/><text x="178" y="46" text-anchor="middle" font-weight="bold">Chunk</text><text x="178" y="60" text-anchor="middle" font-size="10" class="tm">256–512 tok</text><line x1="112" y1="48" x2="130" y2="48" stroke="currentColor" marker-end="url(#rg-a1)"/><rect x="244" y="26" width="92" height="44" rx="7" class="ft st"/><text x="290" y="46" text-anchor="middle" font-weight="bold">Metadata</text><text x="290" y="60" text-anchor="middle" font-size="10" class="tm">src·page·date</text><line x1="224" y1="48" x2="242" y2="48" stroke="currentColor" marker-end="url(#rg-a1)"/><rect x="356" y="26" width="92" height="44" rx="7" class="ft st"/><text x="402" y="46" text-anchor="middle" font-weight="bold">Embed</text><text x="402" y="60" text-anchor="middle" font-size="10" class="tm">model v1</text><line x1="336" y1="48" x2="354" y2="48" stroke="currentColor" marker-end="url(#rg-a1)"/><rect x="468" y="26" width="112" height="44" rx="7" class="fv"/><text x="524" y="46" text-anchor="middle" font-weight="bold">Vector DB</text><text x="524" y="60" text-anchor="middle" font-size="10" class="tm">HNSW index</text><line x1="448" y1="48" x2="466" y2="48" stroke="currentColor" marker-end="url(#rg-a1)"/><text x="20" y="128" class="tm" font-size="11">ONLINE · every query</text><rect x="12" y="138" width="80" height="44" rx="7" class="fb sb"/><text x="52" y="164" text-anchor="middle" font-weight="bold">Query</text><rect x="108" y="138" width="80" height="44" rx="7" class="fb sb"/><text x="148" y="158" text-anchor="middle" font-weight="bold">Embed</text><text x="148" y="172" text-anchor="middle" font-size="10" class="tr">same model!</text><line x1="92" y1="160" x2="106" y2="160" stroke="currentColor" marker-end="url(#rg-a1)"/><rect x="204" y="138" width="80" height="44" rx="7" class="fb sb"/><text x="244" y="158" text-anchor="middle" font-weight="bold">Top ~50</text><text x="244" y="172" text-anchor="middle" font-size="10" class="tm">hybrid</text><line x1="188" y1="160" x2="202" y2="160" stroke="currentColor" marker-end="url(#rg-a1)"/><rect x="300" y="138" width="80" height="44" rx="7" class="fb sb"/><text x="340" y="158" text-anchor="middle" font-weight="bold">Rerank 5</text><text x="340" y="172" text-anchor="middle" font-size="10" class="tm">cross-enc</text><line x1="284" y1="160" x2="298" y2="160" stroke="currentColor" marker-end="url(#rg-a1)"/><rect x="396" y="138" width="80" height="44" rx="7" class="fb sb"/><text x="436" y="158" text-anchor="middle" font-weight="bold">Prompt</text><text x="436" y="172" text-anchor="middle" font-size="10" class="tm">+ sources</text><line x1="380" y1="160" x2="394" y2="160" stroke="currentColor" marker-end="url(#rg-a1)"/><rect x="492" y="138" width="96" height="44" rx="7" class="fg sg"/><text x="540" y="158" text-anchor="middle" font-weight="bold">LLM</text><text x="540" y="172" text-anchor="middle" font-size="10" class="tm">answer + [1]</text><line x1="476" y1="160" x2="490" y2="160" stroke="currentColor" marker-end="url(#rg-a1)"/><path d="M524,70 V100 H244 V136" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#rg-a1)"/><text x="384" y="94" text-anchor="middle" font-size="10" class="tm">nearest-neighbour search</text></svg><figcaption>Top half runs offline and fills the vector DB; bottom half runs per question and reads from it. The query must use the same embedding model.</figcaption></figure>
  <ul>
    <li><strong>Metadata</strong> on every chunk (source, page, position, date) powers citations, filters ("only 2024 docs") and debugging.</li>
    <li>Embeddings, similarity, indexes and hybrid search: 06 · Embeddings &amp; Vector DBs.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The query must be embedded with the <em>same</em> model as the chunks. A mismatch fails silently: results look random, no error is raised.</p>
  </div>

  <h2 id="rg-chunk"><span class="num">03</span>Chunking</h2>
  <p><strong>Chunking</strong> splits documents before embedding: embedders have input limits, and you need two paragraphs, not 100 pages.</p>
<figure class="viz"><svg viewBox="0 0 600 222" width="600"><defs><marker id="rg-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="20" y="14" font-size="11" class="tm">document, word by word →</text><rect x="20" y="22" width="560" height="14" rx="3" class="fs"/><rect x="200" y="44" width="60" height="44" class="fg"/><rect x="380" y="68" width="60" height="44" class="fg"/><rect x="20" y="46" width="240" height="18" rx="4" fill="none" class="sb" stroke-width="1.5"/><rect x="200" y="70" width="240" height="18" rx="4" fill="none" class="sb" stroke-width="1.5"/><rect x="380" y="94" width="200" height="18" rx="4" fill="none" class="sb" stroke-width="1.5"/><text x="28" y="59" font-size="11">chunk 0 · 20 words</text><text x="268" y="83" font-size="11">chunk 1</text><text x="448" y="107" font-size="11">chunk 2</text><text x="230" y="130" text-anchor="middle" font-size="10" class="tg">overlap = "a maximum of 10 days"</text><text x="410" y="130" text-anchor="middle" font-size="10" class="tg">overlap</text><text x="20" y="158" font-size="11" class="tm">parent–child: match small, send big</text><rect x="20" y="166" width="262" height="48" rx="7" class="fv"/><text x="28" y="179" font-size="10" class="tm">parent (section)</text><rect x="28" y="185" width="78" height="22" rx="4" class="fs"/><text x="67" y="200" text-anchor="middle" font-size="10">child</text><rect x="112" y="185" width="78" height="22" rx="4" class="fg sg"/><text x="151" y="200" text-anchor="middle" font-size="10">child ✓ match</text><rect x="196" y="185" width="78" height="22" rx="4" class="fs"/><text x="235" y="200" text-anchor="middle" font-size="10">child</text><line x1="290" y1="190" x2="368" y2="190" stroke="currentColor" marker-end="url(#rg-a2)"/><text x="329" y="182" text-anchor="middle" font-size="10" class="tm">send</text><rect x="372" y="170" width="208" height="40" rx="7" class="fb sb"/><text x="476" y="187" text-anchor="middle">LLM gets whole parent</text><text x="476" y="202" text-anchor="middle" font-size="10" class="tm">precise match + full context</text></svg><figcaption>Overlap (green) keeps a fact on a boundary whole in at least one chunk. Parent–child searches small pieces but sends the big one.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy: index cards</span>
    <p>A card saying just "Napoleon" is useless. A card saying "Napoleon's 1812 retreat from Moscow failed due to supply lines and winter" is retrievable <em>and</em> understandable alone. Chunking decides the card size.</p>
  </div>
  <table class="tbl">
    <tr><th>Size</th><th>What goes wrong</th></tr>
    <tr><td>Too small (&lt;128 tokens)</td><td>Answers split across chunks; no surrounding context</td></tr>
    <tr><td>Sweet spot (~256–512, ~10–15% overlap)</td><td>One topic per chunk; start here, then tune on your data</td></tr>
    <tr><td>Too large (&gt;1,024)</td><td>Several topics blur one embedding; noisy, costly context</td></tr>
  </table>
  <table class="tbl">
    <tr><th>Strategy</th><th>How</th><th>Best for</th></tr>
    <tr><td>Fixed-size + overlap</td><td>Every N tokens, overlap M</td><td>Default starting point</td></tr>
    <tr><td>Recursive / structural</td><td>Split on headings, then paragraphs, then sentences</td><td>Docs, wikis, Markdown, HTML</td></tr>
    <tr><td>Semantic</td><td>Split where similarity between adjacent sentences drops</td><td>Long docs that drift across topics</td></tr>
    <tr><td>Parent–child</td><td>Search small child chunks; send the larger parent to the LLM</td><td>Precise retrieval + rich context</td></tr>
    <tr><td>Contextual headers</td><td>Prefix each chunk with doc title/section (or an LLM-written one-line summary)</td><td>Chunks that say "it" or "this policy"</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Parent–child resolves the core tension: small chunks retrieve precisely but carry little context; large chunks carry context but retrieve poorly. Match on the small one, hand over the big one.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A great LLM with badly chunked docs loses to a mediocre LLM with good chunks. If the answer is split or buried, retrieval misses it and nothing downstream recovers.</p>
  </div>

  <h2 id="rg-ret"><span class="num">04</span>Retrieval &amp; Reranking</h2>
  <ul>
    <li><strong>Dense</strong> catches paraphrase; <strong>BM25</strong> catches exact codes and names. <strong>Hybrid</strong> (fused with RRF) is the safe default (details in 06).</li>
    <li><strong>Metadata filters</strong> narrow the search: tenant, product, date, access rights.</li>
    <li><strong>Multi-query</strong>: an LLM writes 3–5 rephrasings; retrieve for each and merge. Helps vague or oddly worded questions.</li>
  </ul>
  <h3>Reranking: shortlist, then interview</h3>
<figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="rg-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="20" y="10" width="360" height="32" rx="6" class="fs"/><text x="200" y="30" text-anchor="middle" font-weight="bold">~1M chunks</text><text x="400" y="24" font-size="11">index, pre-embedded offline</text><rect x="110" y="60" width="180" height="32" rx="6" class="fb sb"/><text x="200" y="80" text-anchor="middle" font-weight="bold">top ~50</text><text x="400" y="74" font-size="11">bi-encoder / hybrid</text><text x="400" y="88" font-size="10" class="tm">fast · high recall</text><line x1="200" y1="43" x2="200" y2="58" stroke="currentColor" marker-end="url(#rg-a3)"/><rect x="155" y="110" width="90" height="32" rx="6" class="fg sg"/><text x="200" y="130" text-anchor="middle" font-weight="bold">top 5</text><text x="400" y="124" font-size="11">cross-encoder rerank</text><text x="400" y="138" font-size="10" class="tm">slow · high precision</text><line x1="200" y1="93" x2="200" y2="108" stroke="currentColor" marker-end="url(#rg-a3)"/><rect x="170" y="160" width="60" height="32" rx="6" class="fv"/><text x="200" y="180" text-anchor="middle" font-weight="bold">LLM</text><text x="400" y="174" font-size="11">best chunk first</text><text x="400" y="188" font-size="10" class="tm">fewer = less lost-in-middle</text><line x1="200" y1="143" x2="200" y2="158" stroke="currentColor" marker-end="url(#rg-a3)"/></svg><figcaption>Cheap, wide retrieval for recall; expensive, narrow reranking for precision. Only a handful of chunks reach the prompt.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Bi-encoder (retrieval)</th><th>Cross-encoder (reranker)</th></tr>
    <tr><td>Input</td><td>Query and doc embedded <em>separately</em></td><td>Query + doc fed <em>together</em></td></tr>
    <tr><td>Speed</td><td>Docs pre-embedded; millions/s</td><td>One model pass per pair; slow</td></tr>
    <tr><td>Accuracy</td><td>Good</td><td>Much better: sees word-level interaction</td></tr>
    <tr><td>Use for</td><td>Top ~50 from millions</td><td>Top ~5 from those 50</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hiring from 5,000 CVs. A recruiter skims and shortlists 50 (fast, rough). The manager interviews those 50 properly and picks 5 (slow, accurate). Nobody interviews 5,000 people.</p>
  </div>
  <div class="fx" data-lang="py">from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
ranked = reranker.rank(query, candidate_texts, top_k=5)   # [{"corpus_id": i, "score": s}, ...]
top5 = [candidate_texts[r["corpus_id"]] for r in ranked]</div>
  <p>Managed alternatives (e.g. Cohere Rerank) do the same over an API.</p>
  <div class="callout trap"><span class="label">Trap: retrieve k ≠ final n</span>
    <p>Retrieving only 5 means the reranker never sees the chunk ranked 8th that was actually best. Retrieve 20–100 for recall, rerank down to 3–10 for precision.</p>
  </div>

  <h2 id="rg-prompt"><span class="num">05</span>Prompting with Context</h2>
  <p>The prompt decides whether the model <em>uses</em> the sources or its own memory. Prompting basics (system prompts, XML tags) are in 04.</p>
  <div class="fx" data-lang="py">SYSTEM = """Answer using ONLY the sources provided.
- Cite every claim with its source number, like [1].
- If the sources don't contain the answer, say you don't know.
- If sources disagree, say so and cite both."""

user_msg = """&lt;sources&gt;
&lt;source id="1" ref="leave_policy.md#0"&gt;Employees get 24 days of paid leave...&lt;/source&gt;
&lt;source id="2" ref="leave_policy.md#1"&gt;...&lt;/source&gt;
&lt;/sources&gt;

Question: How many leave days carry over?"""</div>
  <ul>
    <li><strong>Numbered, tagged sources</strong> make citations checkable: map <code>[1]</code> back to <code>ref</code> and show the user the link.</li>
    <li><strong>An explicit "I don't know" path</strong> turns retrieval misses into honest refusals instead of hallucinations.</li>
    <li>Some APIs, Anthropic's included, also offer native citations that point to exact passages of documents you pass in.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: lost in the middle</span>
    <p>LLMs use the start and end of long context better than the middle. Ten mediocre chunks can bury the one good one. Send fewer, reranked chunks with the best one first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: retrieved text is untrusted</span>
    <p>A document can contain "ignore previous instructions". Keep sources inside tags, tell the model they are data, not instructions. Defence in depth is in 14.</p>
  </div>

  <h2 id="rg-adv"><span class="num">06</span>Advanced RAG</h2>
  <table class="tbl">
    <tr><th>Technique</th><th>Idea</th><th>Fixes</th></tr>
    <tr><td><strong>Query rewriting</strong></td><td>LLM turns a chatty follow-up ("and for interns?") into a standalone search query</td><td>Conversational queries that miss alone</td></tr>
    <tr><td><strong>HyDE</strong></td><td>LLM writes a hypothetical answer; embed <em>that</em> and search</td><td>Question phrasing vs statement phrasing mismatch</td></tr>
    <tr><td><strong>Multi-hop</strong></td><td>Retrieve, read, form the next query, retrieve again</td><td>"Who manages the team that owns X?"</td></tr>
    <tr><td><strong>Corrective RAG</strong></td><td>Grade each retrieved chunk; drop weak ones or fall back to web search</td><td>Irrelevant chunks causing confident wrong answers</td></tr>
    <tr><td><strong>FLARE</strong></td><td>While generating, retrieve again when the model's confidence drops</td><td>Long answers needing facts mid-way</td></tr>
    <tr><td><strong>GraphRAG</strong></td><td>Extract entities and relations into a graph; retrieve over communities and links</td><td>"Summarise themes across the corpus", relationship questions</td></tr>
  </table>
<figure class="viz"><svg viewBox="0 0 600 180" width="600"><rect x="10" y="10" width="580" height="160" rx="8" fill="none" stroke="currentColor" stroke-opacity=".25"/><text x="20" y="28" font-size="10" class="tm">embedding space</text><circle cx="90" cy="60" r="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><circle cx="130" cy="140" r="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><circle cx="250" cy="120" r="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><circle cx="300" cy="40" r="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><circle cx="470" cy="145" r="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><circle cx="555" cy="125" r="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><circle cx="200" cy="70" r="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><circle cx="360" cy="70" r="7" class="fg sg"/><text x="374" y="66" font-size="11">doc: "Paris is the capital…"</text><circle cx="335" cy="94" r="6" class="fv" stroke="currentColor"/><text x="348" y="112" font-size="11">HyDE draft answer</text><circle cx="90" cy="110" r="6" class="fr sr"/><text x="40" y="96" font-size="11">question: "What is the capital…?"</text><line x1="97" y1="110" x2="352" y2="72" stroke="currentColor" stroke-dasharray="3 4" stroke-opacity=".5"/><text x="220" y="104" text-anchor="middle" font-size="10" class="tr">far</text><line x1="339" y1="89" x2="354" y2="75" class="sg" stroke-width="2"/><text x="334" y="68" text-anchor="end" font-size="10" class="tg">near</text></svg><figcaption>A question and its answer-bearing doc are phrased differently; a drafted answer is phrased like the doc, so it lands next to it.</figcaption></figure>
  <div class="callout intu"><span class="label">Why HyDE works</span>
    <p>"What is the capital of France?" is a question; the doc says "Paris is the capital of France…". A fake answer looks like the real doc, so its embedding lands next to it, even if the fake's details are wrong.</p>
  </div>
  <h3>Agentic RAG</h3>
  <p>Plain RAG retrieves once, always. <strong>Agentic RAG</strong> makes retrieval a <em>tool</em>: the model decides whether, what and where to search, and when it has enough.</p>
  <div class="flow"><span>Question</span><span>Model: search?</span><span>search_docs(query)</span><span>Read results</span><span>Enough? else search again</span><span>Answer</span></div>
  <p>Better for multi-step questions; costs more calls and latency, and needs a step limit. The tool loop is in 05, agents in 08–09, and the LangGraph version (retrieve → grade → rewrite) in 11.</p>

  <h2 id="rg-fail"><span class="num">07</span>Failure Modes &amp; What to Measure</h2>
  <table class="tbl">
    <tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
    <tr><td>Wrong or incomplete answer</td><td><strong>Right chunk not retrieved</strong> (most common)</td><td>Hybrid search, better chunking, multi-query, larger k + rerank</td></tr>
    <tr><td>Confident claim not in sources</td><td>Model ignores grounding</td><td>Stricter prompt, "I don't know" path, check citations</td></tr>
    <tr><td>Results look random</td><td>Embedding model mismatch</td><td>Version the model with the index; rebuild on change</td></tr>
    <tr><td>Answer existed but wasn't found</td><td>Stale index</td><td>Scheduled re-indexing; track doc modified dates</td></tr>
    <tr><td>Right chunk retrieved, not used</td><td>Lost in the middle, too much context</td><td>Fewer chunks, best first</td></tr>
    <tr><td>Questions and docs use different words</td><td>Vocabulary mismatch</td><td>HyDE, multi-query, hybrid</td></tr>
  </table>
  <p>Measure the two halves <strong>separately</strong>, or you can't tell which one broke:</p>
  <div class="cards">
    <div><b>Retrieval</b><p>Recall@k: correct chunk in top k? MRR: how high is the first correct one?</p><small>Check first: no LLM fixes missing context</small></div>
    <div><b>Generation</b><p>Faithfulness: claims supported by sources? Answer relevance: answers the question?</p><small>Hallucination lives here</small></div>
    <div><b>Context</b><p>Precision: how much retrieved text was useful? Recall: did it contain everything needed?</p><small>Tune k and chunking</small></div>
  </div>
  <p>Golden datasets, LLM-as-judge, RAGAS and CI regression tests are in 13 · Evaluation &amp; Observability.</p>

  <h2 id="rg-build"><span class="num">08</span>Build It</h2>
  <p>Goal: a complete RAG in ~80 lines of plain Python. Chunker → embed + index → retrieve top-k → grounded prompt with citations → Claude. The embedding is a hashed bag of words so it runs offline; replace <code>embed()</code> with a real model (06) for meaning-based search.</p>
  <div class="fx" data-lang="py">import re, zlib
import numpy as np

# ---- 1. Documents (a toy company handbook) ----
DOCS = {
    "leave_policy.md": (
        "Employees get 24 days of paid leave per year. Unused leave carries over, "
        "up to a maximum of 10 days. Leave requests need manager approval at least "
        "two weeks in advance. Sick leave is separate and does not need advance notice."
    ),
    "expenses.md": (
        "Travel must be booked through the company portal. Meals are reimbursed up to "
        "50 dollars per day. Submit receipts within 30 days of the trip. Late claims "
        "are reviewed by finance and may be rejected."
    ),
    "remote_work.md": (
        "Staff may work remotely up to three days per week. Core hours are 11am to 3pm "
        "in your local time zone. A home office stipend of 300 dollars is paid once."
    ),
}

# ---- 2. Chunker: fixed-size word windows with overlap ----
def chunk(text, size=20, overlap=5):
    words = text.split()
    step = size - overlap
    return [" ".join(words[i:i + size]) for i in range(0, max(len(words) - overlap, 1), step)]

chunks = []                      # each chunk keeps its source for citations
for src, text in DOCS.items():
    for j, c in enumerate(chunk(text)):
        chunks.append({"id": f"{src}#{j}", "text": c})

# ---- 3. Embed + index (stand-in embedding: hashed bag of words) ----
STOP = {"the", "a", "of", "to", "is", "are", "and", "in", "per", "your", "up", "by", "at",
        "be", "may", "does", "not", "through", "how", "many", "do", "i", "can", "what"}
DIM = 4096

def embed(text):
    v = np.zeros(DIM)
    for w in re.findall(r"[a-z0-9]+", text.lower()):
        if w not in STOP:
            v[zlib.crc32(w.encode()) % DIM] += 1.0   # stable hash, unlike hash()
    n = np.linalg.norm(v)
    return v / n if n else v

index = np.stack([embed(c["text"]) for c in chunks])   # (n_chunks, DIM)

# ---- 4. Retrieve top-k by cosine ----
def retrieve(query, k=3, min_score=0.1):
    scores = index @ embed(query)
    top = np.argsort(-scores)[:k]
    return [(float(scores[i]), chunks[i]) for i in top if scores[i] &gt;= min_score]

# ---- 5. Build a grounded prompt with numbered sources ----
SYSTEM = (
    "Answer using ONLY the sources provided. Cite every claim like [1] or [2]. "
    "If the sources do not contain the answer, say you don't know."
)

def build_prompt(query, hits):
    sources = "\\n".join(
        f'&lt;source id="{n}" ref="{c["id"]}"&gt;{c["text"]}&lt;/source&gt;'
        for n, (_, c) in enumerate(hits, 1)
    )
    return f"&lt;sources&gt;\\n{sources}\\n&lt;/sources&gt;\\n\\nQuestion: {query}"

# ---- 6. Generate with Claude ----
def answer(query, k=3):
    import anthropic
    hits = retrieve(query, k)
    if not hits:                            # nothing relevant: don't call the LLM
        return "I couldn't find this in the handbook.", []
    client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY from the env
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=1024,
        system=SYSTEM,
        messages=[{"role": "user", "content": build_prompt(query, hits)}],
    )
    text = "".join(b.text for b in response.content if b.type == "text")
    return text, [c["id"] for _, c in hits]</div>
  <p>Run the offline steps (real output):</p>
  <div class="fx" data-lang="py">q = "How many leave days carry over to next year?"
for s, c in retrieve(q):
    print(f"{s:.3f}  {c['id']}")
print(len(chunks), "chunks")</div>
  <table class="tbl out"><caption>Result (7 chunks indexed)</caption><tr><th>score</th><th>chunk</th></tr><tr><td>0.577</td><td>leave_policy.md#0</td></tr><tr><td>0.297</td><td>leave_policy.md#1</td></tr><tr><td>0.136</td><td>leave_policy.md#2</td></tr></table>
  <p><code>build_prompt(q, hits)</code> produces exactly:</p>
  <div class="fx" data-lang="text">&lt;sources&gt;
&lt;source id="1" ref="leave_policy.md#0"&gt;Employees get 24 days of paid leave per year. Unused leave carries over, up to a maximum of 10 days.&lt;/source&gt;
&lt;source id="2" ref="leave_policy.md#1"&gt;a maximum of 10 days. Leave requests need manager approval at least two weeks in advance. Sick leave is separate&lt;/source&gt;
&lt;source id="3" ref="leave_policy.md#2"&gt;advance. Sick leave is separate and does not need advance notice.&lt;/source&gt;
&lt;/sources&gt;

Question: How many leave days carry over to next year?</div>
  <p>Notice the 5-word overlap: "a maximum of 10 days" appears at the end of chunk 0 and the start of chunk 1, so a fact on the boundary survives in one piece.</p>
  <div class="fx" data-lang="py">text, cited = answer("How many leave days carry over to next year?")
print(text, cited)</div>
  <div class="callout intu"><span class="label">Example output (will vary)</span>
    <p>Up to 10 unused leave days carry over to the next year [1]. ['leave_policy.md#0', 'leave_policy.md#1', 'leave_policy.md#2']</p>
  </div>
  <div class="callout pred"><span class="label">Predict</span>
    <p><code>retrieve("How much is the meal allowance on business trips?")</code> returns what? <strong>An empty list</strong> (real run). The doc says "Meals" and "trip"; the query says "meal" and "trips". A bag-of-words embedding sees no shared token, so <code>answer()</code> replies "I couldn't find this" without calling the LLM. A real embedding model (or hybrid search with stemming) fixes this: exactly why 06 exists.</p>
  </div>
  <p>Next steps to grow it: real embeddings in pgvector (06), a reranker (section 04), and a small Recall@k test set (13).</p>

  <h2 id="rg-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Walk me through a RAG pipeline end to end.</summary><div class="qa-body">Offline: load docs, chunk (~512 tokens, overlap), attach metadata (source, page, date), embed, store in a vector DB with an HNSW index. Online: embed the question with the same model, hybrid-retrieve ~50, rerank to ~5 with a cross-encoder, format numbered sources into the prompt, ask the LLM to answer only from them with citations, return answer + links.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bi-encoder vs cross-encoder?</summary><div class="qa-body">Bi-encoder embeds query and doc separately; docs are pre-computed, so it scales to millions but never compares them directly. Cross-encoder reads query and doc together and outputs one relevance score; far more accurate but one forward pass per pair. Use bi-encoder to shortlist ~50, cross-encoder to pick ~5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RAG or fine-tuning for an internal policy assistant whose docs change weekly?</summary><div class="qa-body">RAG. Changes need only re-indexing, answers can cite the policy, and you can inspect what the model saw. Fine-tuning suits stable behaviour (tone, format), not fast-changing facts. Combine them if you also need a house style.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why retrieve 50 and rerank to 5, instead of retrieving 5?</summary><div class="qa-body">Retrieval is tuned for recall and is approximate; the best chunk may sit at rank 8. If you retrieve 5, the reranker can never promote it. Retrieve wide (20–100) so it's somewhere in the set, then let the accurate reranker pick the top 3–10.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the chunk-size trade-off, and how does parent–child help?</summary><div class="qa-body">Small chunks retrieve precisely but lack context, and answers get split. Large chunks have context but mix topics, blurring the embedding and adding noise. Parent–child embeds small child chunks for matching and returns their larger parent to the LLM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is HyDE and when does it help?</summary><div class="qa-body">Hypothetical Document Embeddings: have an LLM draft an answer, embed the draft, search with it. Docs are written as statements, so a draft answer lands nearer to them than the question does. Helps with vocabulary mismatch and technical domains. Costs an extra LLM call per query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The right chunk is retrieved but the answer ignores it. Why, and what do you do?</summary><div class="qa-body">Lost in the middle or too much noise: models use the start and end of context best. Rerank so the best chunk is first, send fewer chunks (3–5), compress or trim irrelevant sentences, and check faithfulness to confirm the answer uses the sources.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Answers are wrong. How do you tell retrieval failure from generation failure?</summary><div class="qa-body">Check retrieval alone first: for a labelled set of questions, is a correct chunk in the top k (Recall@k)? If not, fix chunking, embeddings, hybrid search. If yes but answers are still wrong, it's generation: measure faithfulness and answer relevance, tighten the prompt. Full method in 13.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Low faithfulness vs low context recall: what does each tell you?</summary><div class="qa-body">Low faithfulness: the answer makes claims the sources don't support (hallucination) → stricter grounding prompt, "I don't know" path, citation checks. Low context recall: the needed facts weren't retrieved → larger k, better chunking, better embeddings, hybrid search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the Build It code, why does "meal allowance on business trips" return nothing?</summary><div class="qa-body">The stand-in embedding hashes exact words. The doc has "Meals"/"trip", the query "meal"/"trips": no shared tokens, cosine 0, below <code>min_score</code>. A semantic embedding model (or BM25 with stemming in a hybrid) would match it. The empty result correctly triggers "I couldn't find this" instead of a guess.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is agentic RAG and when is it worth it?</summary><div class="qa-body">The model gets retrieval as a tool and decides when and what to search, possibly several times, before answering. Worth it for multi-hop or ambiguous questions and multiple sources. Costs more latency and tokens, so cap the steps. Simple FAQ-style questions are better served by one-shot RAG.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you stop a retrieved document from hijacking the model?</summary><div class="qa-body">Treat retrieved text as data: wrap it in tags, tell the model instructions inside sources must be ignored, limit what tools the model can call afterwards, and filter outputs. This is indirect prompt injection; defence in depth is in 14.</div></details>
</main>`
});
