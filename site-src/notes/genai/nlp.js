// notes/genai/nlp.js — NLP Foundations
Object.assign(TOPIC_CONTENT, {
  "nlp": `<main>
  <h1>NLP Foundations</h1>
  <p class="lead">The first stop on the GenAI path. It assumes only basic Python and ML. You'll learn how text becomes numbers: from word counts to word vectors, and why that ended in contextual embeddings. That last step is what <em><a class="xref" data-note="transformers">Transformers</a></em> builds on.</p>

  <h2 id="nl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
  <div class="mm-center">NLP Foundations: text → numbers</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Why it still matters</div>
      <ul>
        <li><b>Path</b> — counts → static vectors → contextual vectors → LLMs</li>
        <li><b>Inside LLMs</b> — subword tokenizer + embedding layer (Word2Vec's descendant)</li>
        <li><b>In production</b> — BM25 first-pass search, tiny TF-IDF/FastText classifiers</li>
        <li><b>Senior skill</b> — measure a cheap baseline before reaching for a transformer</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Preprocessing</div>
      <ul>
        <li><b>Pipeline</b> — lowercase → tokenize → (stopwords) → stem / lemmatize</li>
        <li><b>Stemming</b> — rule chop, fast, non-words: studies → studi</li>
        <li><b>Lemmatization</b> — dictionary + POS, real words: better → good</li>
        <li>⚠ <b>"not" is a stopword</b> — "not good" → "good"; keep negations for sentiment</li>
        <li>⚠ <b>Leakage</b> — fit vocabulary / IDF on train only</li>
        <li><b>Transformers</b> — skip it; their tokenizer handles case and punctuation</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Bag-of-Words &amp; n-grams</div>
      <ul>
        <li><b>BoW</b> — doc = vector of word counts; order thrown away</li>
        <li><b>Shape</b> — huge, sparse (mostly zeros); one column per vocab word</li>
        <li><b>N-gram</b> — n consecutive words as one feature: "new york", "not good"</li>
        <li><b>Cost</b> — vocab explodes, rare/unseen n-grams; smoothing patches it</li>
        <li>⚠ <b>Order-blind</b> — "dog bites man" = "man bites dog"</li>
        <li>💡 tear out every word, throw in a bag, count</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">TF-IDF &amp; BM25</div>
      <ul>
        <li><b>TF</b> — count in this doc; <b>IDF</b> — <code>log(N / df)</code>, rarity across docs</li>
        <li><b>TF × IDF</b> — high when frequent here, rare elsewhere</li>
        <li><b>Example</b> — "GPU" in 80 of 10k docs: IDF = ln 125 ≈ 4.8</li>
        <li>⚠ <b>sklearn IDF</b> — <code>ln((1+N)/(1+df)) + 1</code>: "the" still ≠ 0; use <code>max_df</code>/stopwords</li>
        <li><b>Rows L2-normalised</b> in sklearn</li>
        <li><b>BM25</b> — TF-IDF + TF saturation + length penalty; default keyword score</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Word2Vec</div>
      <ul>
        <li><b>Idea</b> — dense vector (~300 d); similar contexts → close vectors</li>
        <li><b>How</b> — train a fake "predict neighbours" task, keep the weights</li>
        <li><b>Skip-gram</b> — word → neighbours; better for rare words</li>
        <li><b>CBOW</b> — neighbours → word; faster, frequent words</li>
        <li><b>Negative sampling</b> — real pair vs few random pairs, no full softmax</li>
        <li><b>Analogy</b> — king − man + woman ≈ queen (relations = directions)</li>
        <li>⚠ <b>One vector per word</b> — "bank" blends river + money</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">GloVe &amp; FastText</div>
      <ul>
        <li><b>GloVe</b> — learns from global co-occurrence counts</li>
        <li><b>FastText</b> — Word2Vec on character n-grams</li>
        <li><b>OOV</b> — FastText builds unseen words/typos from pieces; others can't</li>
        <li><b>All static</b> — same vector in every sentence</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Contextual embeddings</div>
      <ul>
        <li><b>Definition</b> — word vector computed from the whole sentence</li>
        <li><b>ELMo</b> (2018) — bi-LSTMs: contextual but slow, forgetful</li>
        <li><b>BERT</b> (2018) — Transformer encoder, attention → <a class="xref" data-note="transformers">Transformers</a></li>
        <li>⚠ <b>[CLS] as sentence vector</b> — weak; use Sentence-BERT-style models (06)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Classic tasks &amp; metrics</div>
      <ul>
        <li><b>POS</b> — grammatical role per word; <b>NER</b> — people/orgs/places spans</li>
        <li><b>Dependency parse</b> — who did what to whom (nsubj, obj)</li>
        <li><b>BIO</b> — B-begin, I-inside, O-outside: span finding → token labels</li>
        <li><b>Precision</b> TP/(TP+FP), <b>recall</b> TP/(TP+FN), <b>F1</b> harmonic mean</li>
        <li>⚠ <b>99% accuracy</b> on 1% spam can mean 0 recall</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Build: TF-IDF baseline</div>
      <ul>
        <li><b>Recipe</b> — TfidfVectorizer(1–2 grams) + LogisticRegression</li>
        <li><b>Keeps "not good"</b> — no stopword removal + bigrams</li>
        <li><b>Interpretable</b> — one weight per feature</li>
        <li><b>Weak at</b> — sarcasm, "not bad", unseen synonyms → transformers</li>
      </ul>
    </div>
  </div>
</div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="nl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Classical NLP</span><span class="rm-sub">The floor under LLMs</span></div></div>
      <div class="rm-item rm-done" data-target="nl-prep"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Text Preprocessing</span><span class="rm-sub">Clean, split, normalise</span></div></div>
      <div class="rm-item rm-done" data-target="nl-bow"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Bag-of-Words &amp; N-grams</span><span class="rm-sub">Count words, keep a little order</span></div></div>
      <div class="rm-item rm-done" data-target="nl-tfidf"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">TF-IDF</span><span class="rm-sub">Counts that mean something</span></div></div>
      <div class="rm-item rm-done" data-target="nl-w2v"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Word2Vec</span><span class="rm-sub">Words as points in space</span></div></div>
      <div class="rm-item rm-done" data-target="nl-glove"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">GloVe &amp; FastText</span><span class="rm-sub">Global stats, word pieces</span></div></div>
      <div class="rm-item rm-done" data-target="nl-ctx"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Contextual Embeddings</span><span class="rm-sub">Same word, different vector</span></div></div>
      <div class="rm-item rm-done" data-target="nl-tasks"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Classic NLP Tasks</span><span class="rm-sub">POS, NER, parsing</span></div></div>
      <div class="rm-item rm-done" data-target="nl-eval"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Evaluating a Classifier</span><span class="rm-sub">Precision, recall, F1</span></div></div>
      <div class="rm-item rm-done" data-target="nl-build"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">TF-IDF sentiment classifier</span></div></div>
      <div class="rm-item rm-done" data-target="nl-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="nl-why"><span class="num">01</span>Why Classical NLP</h2>
  <p>LLMs didn't replace these ideas; they are built on them.</p>
  <div class="flow"><span>Preprocessing &amp; counts</span><span>Static word vectors</span><span>Contextual embeddings</span><span>LLMs</span></div>
  <div class="cards">
    <div><b>Inside every LLM</b><p>Subword tokenizer + embedding layer, a direct descendant of Word2Vec.</p></div>
    <div><b>Still in production</b><p>BM25 (a TF-IDF variant) runs first-pass search beside vector search in RAG; tiny classifiers run where a 7B model won't fit.</p></div>
    <div><b>Senior skill</b><p>Measure the cheap baseline before reaching for a transformer.</p></div>
  </div>

  <h2 id="nl-prep"><span class="num">02</span>Text Preprocessing</h2>
  <p>Raw, messy text → a clean, consistent form. Every later step inherits its quality.</p>
  <div class="flow"><span>"The Cats Sat!"</span><span>lowercase</span><span>tokenize: the, cats, sat</span><span>drop stopwords: cats, sat</span><span>lemmatize: cat, sit</span></div>
  <ul>
    <li><strong>Tokenize</strong>: split into units (words here; subwords in <a class="xref" data-note="transformers">Transformers</a>). <strong>Stopwords</strong>: common, low-information words ("the", "is").</li>
    <li><strong>Stem / lemmatize</strong>: reduce to a base form so "runs" and "running" count as one word.</li>
  </ul>
  <h3>Stemming vs lemmatization</h3>
  <table class="tbl">
    <tr><th></th><th>Stemming</th><th>Lemmatization</th></tr>
    <tr><td>How</td><td>Chops endings with rules</td><td>Dictionary + part of speech</td></tr>
    <tr><td>running</td><td>run</td><td>run</td></tr>
    <tr><td>studies</td><td>studi (not a word)</td><td>study</td></tr>
    <tr><td>better</td><td>better (misses root)</td><td>good (if tagged as adjective)</td></tr>
    <tr><td>Use for</td><td>Speed: search, topic models</td><td>Accuracy: NER, parsing</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Stemming is blunt scissors: fast, ugly cuts. Lemmatization is a librarian with a dictionary: slower, but always returns a real word.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "not" is a stopword</span>
    <p>Most stopword lists include "not", "no", "never". scikit-learn's English list turns <code>"this phone is not good"</code> into <code>['good', 'phone']</code>, which reads as positive. Never drop negations for sentiment or any meaning-sensitive task.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: leakage</span>
    <p>Fit vocabularies and IDF weights on training data only. Fitting on the full dataset leaks test information.</p>
  </div>
  <p>Modern transformers mostly <em>skip</em> this: they use every word, and their tokenizer handles case and punctuation.</p>

  <h2 id="nl-bow"><span class="num">03</span>Bag-of-Words &amp; N-grams</h2>
  <p><strong>Bag-of-Words (BoW)</strong>: a document becomes a vector of word counts, one slot per vocabulary word. Order is thrown away.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tear every word out of a book, throw them in a bag, and count. You lose the story but know which words appeared and how often.</p>
  </div>
  <div class="fx" data-lang="py">from sklearn.feature_extraction.text import CountVectorizer
docs = ["the cat sat on the mat", "the dog sat on the log", "the cat chased the dog"]
bow = CountVectorizer()
X = bow.fit_transform(docs)
print(bow.get_feature_names_out())
print(X.toarray())</div>
  <table class="tbl out"><caption>Result</caption>
    <tr><th>doc</th><th>cat</th><th>chased</th><th>dog</th><th>log</th><th>mat</th><th>on</th><th>sat</th><th>the</th></tr>
    <tr><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td><td>2</td></tr>
    <tr><td>2</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td><td>1</td><td>2</td></tr>
    <tr><td>3</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>2</td></tr>
  </table>
  <p>Still a strong classifier: "terrible, broke, refund" is negative in any order. Vectors are huge and <strong>sparse</strong> (mostly zeros).</p>
  <h3>N-grams</h3>
  <figure class="viz"><svg viewBox="0 0 560 120" width="560">
    <text x="10" y="22" class="tm">unigrams</text>
    <rect x="90" y="8" width="60" height="22" rx="4" class="fs"/><text x="120" y="23" text-anchor="middle">this</text>
    <rect x="160" y="8" width="60" height="22" rx="4" class="fs"/><text x="190" y="23" text-anchor="middle">is</text>
    <rect x="230" y="8" width="60" height="22" rx="4" class="fr sr"/><text x="260" y="23" text-anchor="middle">not</text>
    <rect x="300" y="8" width="60" height="22" rx="4" class="fg sg"/><text x="330" y="23" text-anchor="middle">good</text>
    <text x="380" y="23" class="tm">reads as positive</text>
    <text x="10" y="66" class="tm">bigrams</text>
    <rect x="90" y="52" width="130" height="22" rx="4" class="fs"/><text x="155" y="67" text-anchor="middle">this is</text>
    <rect x="160" y="80" width="130" height="22" rx="4" class="fs"/><text x="225" y="95" text-anchor="middle">is not</text>
    <rect x="230" y="52" width="130" height="22" rx="4" class="fr sr"/><text x="295" y="67" text-anchor="middle">not good</text>
    <text x="380" y="67" class="tr">one negative feature</text>
  </svg><figcaption>A bigram keeps "not good" together as one feature. Price: many more, rarer columns.</figcaption></figure>
  <p>An <strong>n-gram</strong> = n consecutive words as one feature. Cost: the vocabulary explodes and most n-grams are rare or unseen at test time. Smoothing patches this; neural models fixed it by generalising through word similarity.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>BoW sees "dog bites man" and "man bites dog" as identical. Bigrams help locally, but nothing count-based understands long-range order.</p>
  </div>

  <h2 id="nl-tfidf"><span class="num">04</span>TF-IDF</h2>
  <p>Raw counts reward words like "the". <strong>TF-IDF</strong> reweights each count by how rare the word is across documents.</p>
  <div class="flow"><span>TF: count in <em>this</em> doc</span><span>× IDF: log(N / docs containing it)</span><span>high = frequent here, rare elsewhere</span></div>
  <div class="callout intu"><span class="label">Example</span>
    <p>10,000 medical documents. "patient" is in nearly all of them, so IDF ≈ 0: it tells you nothing about one document. "GPU" in 80 of 10,000 docs gets IDF = ln(125) ≈ 4.8: a strong signal.</p>
  </div>
  <div class="fx" data-lang="py">from sklearn.feature_extraction.text import TfidfVectorizer
tf = TfidfVectorizer()
T = tf.fit_transform(docs)          # same 3 docs as above
for w, v in zip(tf.get_feature_names_out(), T.toarray()[0].round(2)):
    print(w, v)</div>
  <table class="tbl out"><caption>Result (doc 1: "the cat sat on the mat")</caption>
    <tr><th>cat</th><th>chased</th><th>dog</th><th>log</th><th>mat</th><th>on</th><th>sat</th><th>the</th></tr>
    <tr><td>0.37</td><td>0.0</td><td>0.0</td><td>0.0</td><td>0.49</td><td>0.37</td><td>0.37</td><td>0.58</td></tr>
  </table>
  <div class="callout pred"><span class="label">Predict first</span>
    <p>"the" appears in every document. Why is its score the <em>highest</em>, not 0?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: library IDF ≠ textbook IDF</span>
    <p>scikit-learn uses a smoothed IDF, <code>ln((1+N)/(1+df)) + 1</code>, so a word in every document still gets weight 1, and "the" appears twice here. "mat" (only in doc 1) still beats "cat" and "sat". Rows are also L2-normalised. In practice, add <code>stop_words</code> or <code>max_df</code> to drop such words.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <line x1="80" y1="10" x2="80" y2="180" stroke="currentColor" opacity="0.4"/>
    <text x="70" y="27" text-anchor="end">the</text><rect x="80" y="14" width="290" height="18" class="fr sr"/><text x="378" y="27">0.58</text><text x="420" y="27" class="tr">in all docs, twice here</text>
    <text x="70" y="51" text-anchor="end">mat</text><rect x="80" y="38" width="245" height="18" class="fg sg"/><text x="333" y="51">0.49</text><text x="420" y="51" class="tg">only in doc 1</text>
    <text x="70" y="75" text-anchor="end">cat</text><rect x="80" y="62" width="185" height="18" class="fb sb"/><text x="273" y="75">0.37</text>
    <text x="70" y="99" text-anchor="end">on</text><rect x="80" y="86" width="185" height="18" class="fb sb"/><text x="273" y="99">0.37</text>
    <text x="70" y="123" text-anchor="end">sat</text><rect x="80" y="110" width="185" height="18" class="fb sb"/><text x="273" y="123">0.37</text><text x="320" y="99" class="tm">each in 2 of 3 docs</text>
    <text x="70" y="147" text-anchor="end" class="tm">chased</text><text x="70" y="163" text-anchor="end" class="tm">dog</text><text x="70" y="179" text-anchor="end" class="tm">log</text>
    <text x="90" y="163" class="tm">0 — not in doc 1</text>
  </svg><figcaption>Doc 1's real TF-IDF weights. Rare "mat" beats "cat"; "the" still wins because sklearn's IDF never hits 0.</figcaption></figure>
  <p><strong>BM25</strong> = TF-IDF + two fixes: term frequency saturates (the 10th "GPU" adds little) and long documents are penalised. The default keyword score (Elasticsearch, hybrid search in <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>).</p>

  <h2 id="nl-w2v"><span class="num">05</span>Word2Vec</h2>
  <p>In BoW, "cat" and "dog" are unrelated columns. <strong>Word2Vec</strong> gives each word a dense vector (~300 numbers); words used in similar contexts land close together.</p>
  <figure class="viz"><svg viewBox="0 0 580 230" width="580">
    <defs><marker id="nl-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs>
    <rect x="20" y="20" width="200" height="90" rx="40" class="fb"/>
    <circle cx="60" cy="50" r="4" class="tb"/><text x="68" y="54">cat</text>
    <circle cx="80" cy="80" r="4" class="tb"/><text x="88" y="84">kitten</text>
    <circle cx="140" cy="45" r="4" class="tb"/><text x="148" y="49">dog</text>
    <circle cx="150" cy="78" r="4" class="tb"/><text x="158" y="82">puppy</text>
    <rect x="30" y="140" width="180" height="70" rx="35" class="fg"/>
    <circle cx="70" cy="170" r="4" class="tg"/><text x="78" y="174">bread</text>
    <circle cx="140" cy="185" r="4" class="tg"/><text x="148" y="189">pizza</text>
    <circle cx="330" cy="190" r="4" class="tb"/><text x="300" y="210">man</text>
    <circle cx="330" cy="70" r="4" class="tb"/><text x="290" y="60">woman</text>
    <circle cx="480" cy="190" r="4" class="tb"/><text x="470" y="210">king</text>
    <circle cx="480" cy="70" r="4" class="tr"/><text x="470" y="60" class="tr">queen</text>
    <line x1="330" y1="186" x2="330" y2="78" class="sb" stroke-width="2" marker-end="url(#nl-ah)"/>
    <line x1="480" y1="186" x2="480" y2="78" class="sb" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#nl-ah)"/>
    <text x="340" y="134" class="tm">gender</text><text x="490" y="134" class="tm">same</text><text x="490" y="148" class="tm">direction</text>
    <text x="300" y="25">king − man + woman ≈ queen</text>
  </svg><figcaption>Similar words cluster; consistent relations become parallel directions (2-D sketch of 300-D space).</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy: know a word by its company</span>
    <p>"Doctor" and "physician" both hang around "patient", "hospital", "diagnosis". Same social circle, so nearly the same vector. Meaning is never written down; it's inferred from neighbours.</p>
  </div>
  <p>How: train a tiny network on a fake task (predict nearby words), then keep its weights as the vectors.</p>
  <div class="cards">
    <div><b>Skip-gram</b><p>One word → predict its neighbours. "sat" → The, cat, on, the.</p><small>More training pairs per word: better for rare words</small></div>
    <div><b>CBOW</b><p>Neighbours → predict the centre word. The, cat, on, the → "sat".</p><small>Averages context: faster, good for frequent words</small></div>
  </div>
  <figure class="viz"><svg viewBox="0 0 500 100" width="500">
    <defs><marker id="nl-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs>
    <rect x="20" y="62" width="70" height="28" rx="4" class="fs"/><text x="55" y="81" text-anchor="middle">The</text>
    <rect x="110" y="62" width="70" height="28" rx="4" class="fs"/><text x="145" y="81" text-anchor="middle">cat</text>
    <rect x="200" y="62" width="70" height="28" rx="4" class="ft st"/><text x="235" y="81" text-anchor="middle">sat</text>
    <rect x="290" y="62" width="70" height="28" rx="4" class="fs"/><text x="325" y="81" text-anchor="middle">on</text>
    <rect x="380" y="62" width="70" height="28" rx="4" class="fs"/><text x="415" y="81" text-anchor="middle">the</text>
    <path d="M225,60 Q140,0 60,58" fill="none" class="sb" marker-end="url(#nl-ah2)"/>
    <path d="M230,60 Q188,28 150,58" fill="none" class="sb" marker-end="url(#nl-ah2)"/>
    <path d="M240,60 Q282,28 320,58" fill="none" class="sb" marker-end="url(#nl-ah2)"/>
    <path d="M245,60 Q330,0 410,58" fill="none" class="sb" marker-end="url(#nl-ah2)"/>
    <text x="470" y="30" text-anchor="end" class="tm">window = 2</text>
  </svg><figcaption>Skip-gram turns one sentence into 4 training pairs for "sat". CBOW reverses the arrows.</figcaption></figure>
  <ul>
    <li><strong>Negative sampling</strong>: instead of a softmax over the whole vocabulary, train "real pair vs a few random pairs". This made training cheap.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: one word, one vector</span>
    <p>"river bank" and "bank account" get the <em>same</em> "bank" vector, a blend of both senses. This limit is exactly what contextual models fix (section 07).</p>
  </div>

  <h2 id="nl-glove"><span class="num">06</span>GloVe &amp; FastText</h2>
  <table class="tbl">
    <tr><th></th><th>Word2Vec</th><th>GloVe</th><th>FastText</th></tr>
    <tr><td>Learns from</td><td>Local context windows</td><td>Global co-occurrence counts for the whole corpus</td><td>Word2Vec on character n-grams</td></tr>
    <tr><td>Unseen word</td><td>No vector</td><td>No vector</td><td>Built from its pieces</td></tr>
    <tr><td>Best for</td><td>General use</td><td>Pretrained general vectors</td><td>Typos, rare words, rich morphology</td></tr>
  </table>
  <div class="callout intu"><span class="label">FastText on an unseen word</span>
    <p>"neuromorphic" was never seen whole. FastText sums vectors of pieces like "neu", "uro", "mor", "phi" that it learned from "neural" and "morphology", so it still gets a sensible vector.</p>
  </div>
  <p>All three are <strong>static</strong>: one vector per word, regardless of sentence.</p>

  <h2 id="nl-ctx"><span class="num">07</span>Contextual Embeddings</h2>
  <p>A <strong>contextual embedding</strong> is a word vector computed from the whole sentence, so the same word gets different vectors in different contexts.</p>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
    <text x="20" y="20">Static: one "bank"</text><text x="300" y="20">Contextual: one per sentence</text>
    <line x1="280" y1="10" x2="280" y2="180" stroke="currentColor" opacity="0.25"/>
    <circle cx="50" cy="55" r="4" class="tg"/><text x="58" y="59" class="tm">river</text>
    <circle cx="70" cy="85" r="4" class="tg"/><text x="78" y="89" class="tm">shore</text>
    <circle cx="200" cy="140" r="4" class="tb"/><text x="208" y="144" class="tm">money</text>
    <circle cx="180" cy="165" r="4" class="tb"/><text x="188" y="169" class="tm">loan</text>
    <circle cx="130" cy="112" r="6" class="fr sr"/><text x="140" y="108" class="tr">bank (blend)</text>
    <circle cx="320" cy="55" r="4" class="tg"/><text x="328" y="59" class="tm">river</text>
    <circle cx="340" cy="85" r="4" class="tg"/><text x="348" y="89" class="tm">shore</text>
    <circle cx="395" cy="75" r="6" class="fg sg"/><text x="406" y="79">bank₁ "river bank"</text>
    <circle cx="470" cy="140" r="4" class="tb"/><text x="478" y="144" class="tm">money</text>
    <circle cx="450" cy="165" r="4" class="tb"/><text x="458" y="169" class="tm">loan</text>
    <circle cx="420" cy="150" r="6" class="fb sb"/><text x="300" y="128">bank₂ "paid into the bank"</text>
  </svg><figcaption>Static models give "bank" one averaged point; contextual models place each use next to its real meaning.</figcaption></figure>
  <ul>
    <li><strong>ELMo</strong> (2018): bidirectional LSTMs (recurrent networks that read word by word). Contextual, but slow and forgetful over long text.</li>
    <li><strong>BERT</strong> (2018): a Transformer encoder. Every word looks at every other word at once. That mechanism, attention, is the subject of <em><a class="xref" data-note="transformers">Transformers</a></em>.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: BERT's [CLS] as a sentence vector</span>
    <p>Raw BERT was never trained to make its [CLS] vector good for cosine similarity; it often loses to averaging token vectors. Use a model trained for sentence embeddings (Sentence-BERT and successors), covered in <em><a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a></em>.</p>
  </div>

  <h2 id="nl-tasks"><span class="num">08</span>Classic NLP Tasks</h2>
  <p>LLMs now do these zero-shot, but the vocabulary shows up in interviews.</p>
  <table class="tbl">
    <tr><th>Task</th><th>Output</th><th>Example</th></tr>
    <tr><td><strong>POS tagging</strong></td><td>Grammatical role per word</td><td>The/DET angry/ADJ cat/NOUN ate/VERB (lemmatizers need it)</td></tr>
    <tr><td><strong>NER</strong></td><td>Spans: people, orgs, places, dates</td><td>[Elon Musk]PER founded [SpaceX]ORG</td></tr>
    <tr><td><strong>Dependency parsing</strong></td><td>Who did what to whom</td><td>cat = subject (nsubj) of ate; fish = object (obj)</td></tr>
  </table>
  <h3>BIO tagging for NER</h3>
  <p>Turns "find spans" into "label each token": <strong>B</strong>-type begins an entity, <strong>I</strong>-type continues it, <strong>O</strong> is outside.</p>
  <table class="tbl">
    <tr><th>Elon</th><th>Musk</th><th>founded</th><th>SpaceX</th><th>in</th><th>Hawthorne</th></tr>
    <tr><td>B-PER</td><td>I-PER</td><td>O</td><td>B-ORG</td><td>O</td><td>B-LOC</td></tr>
  </table>
  <p>Two B-PER tags in a row mean two different people, which is why "B" exists at all.</p>

  <h2 id="nl-eval"><span class="num">09</span>Evaluating a Classifier</h2>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Question it answers</th></tr>
    <tr><td>Precision</td><td>TP / (TP + FP)</td><td>Of what I flagged, how much was right? (few false alarms)</td></tr>
    <tr><td>Recall</td><td>TP / (TP + FN)</td><td>Of the real positives, how many did I catch? (few misses)</td></tr>
    <tr><td>F1</td><td>2PR / (P + R)</td><td>Harmonic mean: low if either is low</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With 1% spam, "never spam" scores 99% accuracy and 0 recall. On imbalanced text data, report precision, recall and F1 per class. For NER, score whole entity spans, not tokens.</p>
  </div>

  <h2 id="nl-build"><span class="num">10</span>Build It: a TF-IDF Sentiment Classifier</h2>
  <p>Ten labelled reviews, TF-IDF with bigrams, logistic regression. No stopword removal, so "not good" survives. Runs in under a second with <code>pip install scikit-learn</code>.</p>
  <div class="fx" data-lang="py">from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

train_texts = [
    "loved it, great battery and fast delivery",
    "excellent screen, really happy with this phone",
    "works great, would buy again",
    "good value and good quality",
    "amazing sound, very happy",
    "terrible battery, died in a day",
    "broke after a week, want a refund",
    "not good, very disappointed",
    "awful quality and slow delivery",
    "not worth the money, poor screen",
]
train_labels = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]   # 1 = positive, 0 = negative

model = make_pipeline(
    TfidfVectorizer(ngram_range=(1, 2)),   # unigrams + bigrams, no stopword removal
    LogisticRegression(C=10),  # weaker regularisation: tiny dataset
)
model.fit(train_texts, train_labels)

tests = ["great phone, happy with it", "battery died, want a refund",
         "not good at all", "good"]
for text, p in zip(tests, model.predict_proba(tests)[:, 1]):
    print(f"{p:.2f}  {'POS' if p &gt; 0.5 else 'NEG'}  {text}")

vec, clf = model.named_steps["tfidfvectorizer"], model.named_steps["logisticregression"]
words, w = vec.get_feature_names_out(), clf.coef_[0]
order = w.argsort()
print("most negative:", list(words[order[:5]]))
print("most positive:", list(words[order[-5:]]))</div>
  <table class="tbl out"><caption>Result</caption>
    <tr><th>P(positive)</th><th>label</th><th>text</th></tr>
    <tr><td>0.81</td><td>POS</td><td>great phone, happy with it</td></tr>
    <tr><td>0.23</td><td>NEG</td><td>battery died, want a refund</td></tr>
    <tr><td>0.30</td><td>NEG</td><td>not good at all</td></tr>
    <tr><td>0.61</td><td>POS</td><td>good</td></tr>
  </table>
  <div class="fx" data-lang="text">most negative: ['not', 'good very', 'not good', 'disappointed', 'very disappointed']
most positive: ['sound very', 'sound', 'very happy', 'great', 'happy']</div>
  <ul>
    <li>"not good at all" is correctly negative: "not" and the bigram "not good" carry the most negative weights.</li>
    <li>The model is fully <strong>interpretable</strong>: each feature has one weight you can read.</li>
    <li>Weak spots: "sound very" is a top positive feature, an artefact of 10 examples. Real use needs thousands of reviews, a held-out test set and per-class F1 (section 09).</li>
  </ul>
  <div class="callout intu"><span class="label">Where this goes next</span>
    <p>This baseline can't handle "not bad", sarcasm or unseen synonyms ("superb"). Transformers (02) give context-aware vectors; later notes classify the same reviews with a prompt (04) and compare cost and accuracy.</p>
  </div>

  <h2 id="nl-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Stemming vs lemmatization: when do you use each?</summary><div class="qa-body">Stemming chops endings by rule: fast, but gives non-words ("studies" → "studi") and misses irregular forms ("better"). Lemmatization uses a dictionary and part of speech: slower, returns real words ("better" → "good"). Stem for search and topic modelling; lemmatize when word identity matters (NER, parsing).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your sentiment model calls "this is not good" positive. What's the likely bug?</summary><div class="qa-body">Stopword removal deleted "not", leaving "good". Keep negations (custom stopword list or none), and add bigrams so "not good" is its own feature.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does TF-IDF solve over raw counts?</summary><div class="qa-body">Raw counts favour words that are everywhere ("the"). TF-IDF multiplies in-document frequency by log of rarity across documents, so ubiquitous words go to ~0 and distinctive words ("GPU", "appendectomy") rise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>TfidfVectorizer()</code> on 3 docs that all contain "the": is the weight of "the" zero?</summary><div class="qa-body">No. scikit-learn's smoothed IDF is <code>ln((1+N)/(1+df)) + 1</code>, which is 1 for a word in every doc. In "the cat sat on the mat" it scored 0.58, the highest, because it appears twice. Use <code>max_df</code> or stopwords to suppress it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Skip-gram vs CBOW: what differs and when does each win?</summary><div class="qa-body">Skip-gram predicts context words from the centre word; CBOW predicts the centre word from averaged context. Skip-gram makes more training pairs per word, so rare words get more updates. CBOW is faster and smoother, good for frequent words.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does king − man + woman ≈ queen work?</summary><div class="qa-body">Word2Vec places words by the contexts they share, so consistent relations (like gender) become consistent directions. Subtracting "man" and adding "woman" moves along that direction from "king", landing nearest "queen".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Word2Vec's fundamental limitation, and what fixed it?</summary><div class="qa-body">One vector per word regardless of context, so "bank" blends river and money senses. Contextual models (ELMo, then Transformer-based BERT) compute each word's vector from its sentence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does FastText handle a word it never saw?</summary><div class="qa-body">It represents words as sums of character n-gram vectors. An unseen word or a typo still shares n-grams with known words, so it gets a meaningful vector instead of UNK.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is BIO tagging and why is it used for NER?</summary><div class="qa-body">Each token gets B-type (begins entity), I-type (inside) or O (outside). It converts span finding into per-token classification. "Elon Musk founded SpaceX" → B-PER I-PER O B-ORG. B separates adjacent entities of the same type.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use BERT's [CLS] vector as a sentence embedding?</summary><div class="qa-body">Pre-training (masked words) never made [CLS] good for cosine similarity; it often loses to mean pooling. Use a model fine-tuned for sentence similarity (Sentence-BERT family), see 06.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A spam classifier has 99% accuracy. Is it good?</summary><div class="qa-body">Unknown. If 1% is spam, predicting "not spam" always also scores 99%. Check precision and recall on the spam class, and F1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>No labelled data. How do you build a text classifier?</summary><div class="qa-body">Cheapest first: (1) zero-shot prompt an LLM with class definitions; (2) zero-shot NLI model scoring "this text is about {label}"; (3) hand-label ~50–100, pseudo-label more with the LLM, then train a TF-IDF or small BERT classifier. Measure each on a small labelled set before adding complexity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you still pick TF-IDF + logistic regression over a transformer?</summary><div class="qa-body">Tiny compute budget or on-device; need for millisecond latency; need for interpretable weights; plenty of labelled data where keywords carry the signal. Always build it as the baseline the transformer must beat.</div></details>
</main>`
});
