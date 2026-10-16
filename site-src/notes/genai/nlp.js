// notes/genai/nlp.js — NLP Foundations
Object.assign(TOPIC_CONTENT, {
  "nlp": `<main>
  <h1>NLP Foundations</h1>
  <p class="lead">The first stop on the GenAI path. It assumes only basic Python and a little ML. A computer cannot read a sentence; it can only do maths on numbers. This note shows how text is turned into numbers, step by step: first by counting words, then by giving each word a position in space, and finally by letting the meaning of a word change with its sentence. That last idea is what <em><a class="xref" data-note="transformers">Transformers</a></em> builds on.</p>

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
  <p>You run a small online shop. Every day 500 customers write reviews. You want a program that tells you which reviews are angry, so you can reply to those first. The problem: a program only understands numbers. "The battery died in a day" is just letters to it.</p>
  <p><strong>NLP</strong> (Natural Language Processing) is the set of tricks for turning human text into numbers a program can work with, and then doing something useful with those numbers: sort reviews, search documents, translate, chat.</p>
  <p>This note walks the same road the field walked. Each step fixes a problem the last step had.</p>
  <div class="flow"><span>Preprocessing &amp; counts</span><span>Static word vectors</span><span>Contextual embeddings</span><span>LLMs</span></div>
  <p>Read the flow left to right: first we only count words, then we give each word a fixed set of numbers, then we let those numbers change with the sentence, and that last trick is the heart of every LLM.</p>
  <div class="callout intu"><span class="label">Why learn the old tricks at all</span>
    <p>LLMs did not replace these ideas. They are built on them, and the cheap tricks still run in real products.</p>
  </div>
  <div class="cards">
    <div><b>Inside every LLM</b><p>A tokenizer that splits text into pieces, and an embedding table that gives each piece its numbers. That table is a direct descendant of Word2Vec (section 05).</p></div>
    <div><b>Still in production</b><p>BM25, a cousin of TF-IDF (section 04), runs the first pass of search in most RAG systems. Tiny word-count classifiers run on phones where a big model will not fit.</p></div>
    <div><b>Senior skill</b><p>Before paying for a big model, measure what a one-second word-count model already gets right. Often it is 90% of the way there.</p></div>
  </div>

  <h2 id="nl-prep"><span class="num">02</span>Text Preprocessing</h2>
  <p>Real text is messy. "Battery", "battery" and "BATTERY!" are the same word to a human, but three different strings to a program. "Running", "runs" and "ran" are one idea. If you count them separately, every count is split three ways and your numbers become weak.</p>
  <p><strong>Preprocessing</strong> is the cleaning you do before counting anything: make the text consistent, so the same idea always looks the same.</p>
  <div class="flow"><span>"The Cats Sat!"</span><span>lowercase</span><span>tokenize: the, cats, sat</span><span>drop stopwords: cats, sat</span><span>lemmatize: cat, sit</span></div>
  <p>Follow the flow left to right. Each box is one small step, and each step throws away one kind of noise.</p>
  <ul>
    <li><strong>Lowercase</strong>: "Cats" and "cats" become one word.</li>
    <li><strong>Tokenize</strong>: cut the string into units, called <strong>tokens</strong>. Here a token is a word. In <a class="xref" data-note="transformers">Transformers</a> a token is a piece of a word.</li>
    <li><strong>Stopwords</strong>: very common words that carry little meaning on their own ("the", "is", "of"). Dropping them makes the counts focus on content words.</li>
    <li><strong>Stem / lemmatize</strong>: reduce a word to its base form, so "runs" and "running" count as one word.</li>
  </ul>
  <p>The first two steps in plain Python (real output):</p>
  <div class="fx" data-lang="py">import re
text = "The Cats Sat!"
lower = text.lower()
tokens = re.findall(r"[a-z]+", lower)   # grab runs of letters, drop punctuation
print(lower)
print(tokens)</div>
  <div class="fx" data-lang="text">the cats sat!
['the', 'cats', 'sat']</div>
  <h3>Stemming vs lemmatization</h3>
  <p>Two ways to get the base form of a word. One is fast and rough, the other slow and correct.</p>
  <table class="tbl">
    <tr><th></th><th>Stemming</th><th>Lemmatization</th></tr>
    <tr><td>How</td><td>Chops endings with rules ("-ing", "-s", "-es")</td><td>Looks the word up in a dictionary, using its part of speech (noun, verb…)</td></tr>
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
  <p>Check it yourself (real output):</p>
  <div class="fx" data-lang="py">from sklearn.feature_extraction.text import CountVectorizer, ENGLISH_STOP_WORDS
print("not" in ENGLISH_STOP_WORDS, "no" in ENGLISH_STOP_WORDS)
cv = CountVectorizer(stop_words="english").fit(["this phone is not good"])
print(list(cv.get_feature_names_out()))</div>
  <div class="fx" data-lang="text">True True
['good', 'phone']</div>
  <div class="callout trap"><span class="label">Trap: leakage</span>
    <p><strong>Leakage</strong> means letting test data influence training. The vocabulary (which words exist) and IDF weights (section 04) are learned from data. Learn them from the training set only. If you fit them on the full dataset, the model has already peeked at the test set.</p>
  </div>
  <p>Modern transformers mostly <em>skip</em> this cleaning: they use every word, and their tokenizer handles case and punctuation on its own.</p>

  <h2 id="nl-bow"><span class="num">03</span>Bag-of-Words &amp; N-grams</h2>
  <p>After cleaning, you still have words, not numbers. The simplest possible idea: make a list of every word in your whole collection, and for each document write down how many times each word appears. That list of counts is a vector, and now you have numbers.</p>
  <p>This is called <strong>Bag-of-Words (BoW)</strong>. A document becomes one row of counts, one column per vocabulary word. Word order is thrown away completely.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tear every word out of a book, throw them in a bag, and count. You lose the story but know which words appeared and how often.</p>
  </div>
  <p>Three tiny documents. Watch how each sentence becomes one row of numbers:</p>
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
  <p>Read row 1 against the sentence "the cat sat on the mat": <code>cat</code> 1, <code>mat</code> 1, <code>the</code> 2, and 0 for words that are not in it ("dog", "log"). Eight columns because the three sentences use eight different words.</p>
  <p>This simple table is still a strong classifier. A review containing "terrible, broke, refund" is negative in any order. Two things to notice about the shape: with a real vocabulary of 50,000 words each row has 50,000 columns, and almost all are zero. Such a vector is called <strong>sparse</strong> (mostly zeros).</p>
  <h3>N-grams</h3>
  <p>The bag loses order, and sometimes order is the whole meaning. "not good" means bad, but as two separate words the bag sees "not" (meaningless) and "good" (positive).</p>
  <p>Fix: count pairs of neighbouring words as one feature too. A pair is a <strong>bigram</strong>; in general <strong>n consecutive words as one feature</strong> is an <strong>n-gram</strong>.</p>
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
  <p>Top row: single words, where "not" and "good" are separate and the sentence reads positive. Bottom row: the pair "not good" is one feature, which can learn a negative weight.</p>
  <p>Cost: the vocabulary explodes (every pair of words is a new column) and most pairs are rare or never seen at test time. Old systems patched this with <strong>smoothing</strong> (giving unseen n-grams a small non-zero count). Neural models fixed it properly, by letting similar words share what they learned.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>BoW sees "dog bites man" and "man bites dog" as identical. Bigrams help locally, but nothing count-based understands long-range order.</p>
  </div>

  <h2 id="nl-tfidf"><span class="num">04</span>TF-IDF</h2>
  <p>Raw counts have a problem. In any English document the biggest counts belong to "the", "of", "and". Those words say nothing about what the document is about, yet they dominate the vector.</p>
  <p>The fix is a weighting. Keep words that are frequent in <em>this</em> document, but shrink words that are frequent in <em>every</em> document. This is called <strong>TF-IDF</strong>.</p>
  <div class="flow"><span>TF: count in <em>this</em> doc</span><span>× IDF: log(N / docs containing it)</span><span>high = frequent here, rare elsewhere</span></div>
  <ul>
    <li><strong>TF</strong> (term frequency): how many times the word appears in this document.</li>
    <li><strong>IDF</strong> (inverse document frequency): <code>log(N / df)</code>, where <code>N</code> is the total number of documents and <code>df</code> is how many of them contain the word. A word in every document gives log(1) = 0. A rare word gives a big number.</li>
    <li>Multiply the two. A word scores high only when it is common here and rare elsewhere.</li>
  </ul>
  <div class="callout intu"><span class="label">Example</span>
    <p>10,000 medical documents. "patient" is in nearly all of them, so IDF ≈ 0: it tells you nothing about one document. "GPU" in 80 of 10,000 docs gets IDF = ln(125) ≈ 4.8: a strong signal.</p>
  </div>
  <p>Same three cat-and-dog sentences, now with TF-IDF weights instead of counts:</p>
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
    <p>scikit-learn uses a smoothed IDF, <code>ln((1+N)/(1+df)) + 1</code>, so a word in every document still gets weight 1, and "the" appears twice here. "mat" (only in doc 1) still beats "cat" and "sat". Rows are also L2-normalised (scaled so each row's squared values sum to 1). In practice, add <code>stop_words</code> or <code>max_df</code> to drop such words.</p>
  </div>
  <p>The IDF values scikit-learn actually learned for these three sentences (real output). Words in all three docs get 1.0; words in only one doc get the highest value:</p>
  <div class="fx" data-lang="py">for w, v in zip(tf.get_feature_names_out(), tf.idf_.round(2)):
    print(w, v)</div>
  <div class="fx" data-lang="text">cat 1.29
chased 1.69
dog 1.29
log 1.69
mat 1.69
on 1.29
sat 1.29
the 1.0</div>
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
  <p>Bars are doc 1's weights from the table above. Notice "mat" (green, only in this doc) beats "cat" (in two docs), and "the" still wins only because it appears twice and sklearn never gives IDF 0.</p>
  <p><strong>BM25</strong> = TF-IDF + two fixes: term frequency saturates (the 10th "GPU" adds little) and long documents are penalised. It is the default keyword score in search engines (Elasticsearch, and hybrid search in <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>).</p>

  <h2 id="nl-w2v"><span class="num">05</span>Word2Vec</h2>
  <p>In a bag-of-words table, "cat" and "dog" are two unrelated columns. The model has no idea they are both animals. A review that says "superb" teaches it nothing about "excellent". Every word is an island.</p>
  <p>The fix: instead of one column per word, give each word a short list of numbers (about 300) chosen so that words with similar meaning get similar numbers. Such a list is a <strong>dense vector</strong> (no zeros, every number means something), and the whole idea is called a <strong>word embedding</strong>. <strong>Word2Vec</strong> (2013) was the method that made this work at scale.</p>
  <p>Hand-made toy vectors with 3 numbers each, to show what "similar numbers" buys you. <strong>Cosine similarity</strong> measures how much two vectors point the same way: 1 = same direction, 0 = unrelated.</p>
  <div class="fx" data-lang="py">import numpy as np
cat   = np.array([0.9, 0.8, 0.1])
dog   = np.array([0.8, 0.9, 0.2])
pizza = np.array([0.1, 0.2, 0.9])
def cosine(a, b):
    return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
print("cat-dog  ", round(cosine(cat, dog), 2))
print("cat-pizza", round(cosine(cat, pizza), 2))</div>
  <div class="fx" data-lang="text">cat-dog   0.99
cat-pizza 0.3</div>
  <p>Now a model that learnt something about "cat" can reuse it for "dog". Word2Vec's job is to find such numbers automatically, for every word, from plain text.</p>
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
  <p>Left: words with similar meaning land near each other (animals in the blue blob, food in the green). Right: the step from "man" to "woman" is the same arrow as from "king" to "queen". Relations become directions.</p>
  <div class="callout anlg"><span class="label">Analogy: know a word by its company</span>
    <p>"Doctor" and "physician" both hang around "patient", "hospital", "diagnosis". Same social circle, so nearly the same vector. Meaning is never written down; it's inferred from neighbours.</p>
  </div>
  <p>How does it learn? A trick: train a tiny network on a fake task, "given a word, predict the words next to it". Nobody cares about the predictions. The useful part is the network's internal weights, one row per word, which become the vectors. Two versions of the fake task:</p>
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
  <p>The arrows show skip-gram with a window of 2: the centre word "sat" makes four training pairs, one with each neighbour. Slide the window along the sentence and every word takes its turn as the centre.</p>
  <ul>
    <li><strong>Negative sampling</strong>: predicting "which of 100,000 words comes next" is slow, because the softmax must score every word. Instead, show the network one real pair ("sat", "cat") and a few random fake pairs ("sat", "banana") and ask it to tell real from fake. This made training cheap.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: one word, one vector</span>
    <p>"river bank" and "bank account" get the <em>same</em> "bank" vector, a blend of both senses. This limit is exactly what contextual models fix (section 07).</p>
  </div>

  <h2 id="nl-glove"><span class="num">06</span>GloVe &amp; FastText</h2>
  <p>Two later methods give the same kind of word vectors, each fixing one weakness of Word2Vec.</p>
  <table class="tbl">
    <tr><th></th><th>Word2Vec</th><th>GloVe</th><th>FastText</th></tr>
    <tr><td>Learns from</td><td>Local context windows</td><td>Global co-occurrence counts for the whole corpus</td><td>Word2Vec on character n-grams</td></tr>
    <tr><td>Unseen word</td><td>No vector</td><td>No vector</td><td>Built from its pieces</td></tr>
    <tr><td>Best for</td><td>General use</td><td>Pretrained general vectors</td><td>Typos, rare words, rich morphology</td></tr>
  </table>
  <ul>
    <li><strong>GloVe</strong> first counts, for the whole collection, how often every pair of words appears together, then fits vectors to those counts. Same output as Word2Vec, a different route.</li>
    <li><strong>FastText</strong> splits each word into character pieces ("where" → "wh", "whe", "her", "ere", "re") and learns a vector per piece. A word's vector is the sum of its pieces' vectors.</li>
  </ul>
  <div class="callout intu"><span class="label">FastText on an unseen word</span>
    <p>"neuromorphic" was never seen whole. FastText sums vectors of pieces like "neu", "uro", "mor", "phi" that it learned from "neural" and "morphology", so it still gets a sensible vector. Word2Vec and GloVe would return nothing (an "unknown" token).</p>
  </div>
  <p>All three are <strong>static</strong>: one fixed vector per word, regardless of the sentence it sits in.</p>

  <h2 id="nl-ctx"><span class="num">07</span>Contextual Embeddings</h2>
  <p>Read these two: "I sat on the river bank" and "I paid the cheque into the bank". A static vector gives "bank" one set of numbers, so it must be a muddy average of water and money. Neither sentence is served well.</p>
  <p>The fix: compute the word's vector <em>after</em> reading the whole sentence, so "bank" near "river" gets water-like numbers and "bank" near "cheque" gets money-like numbers. A vector computed this way is a <strong>contextual embedding</strong>.</p>
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
  <p>Left: the single red "bank" point sits between the river words and the money words, close to neither. Right: each use of "bank" gets its own point, next to the words that match its meaning.</p>
  <p>Two models made this practical, both in 2018:</p>
  <ul>
    <li><strong>ELMo</strong>: bidirectional LSTMs (recurrent networks that read a sentence word by word, once forwards and once backwards). Contextual, but slow, and the memory fades over long text.</li>
    <li><strong>BERT</strong>: a Transformer encoder. Every word looks at every other word at the same time. That mechanism, called attention, is the subject of <em><a class="xref" data-note="transformers">Transformers</a></em>.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: BERT's [CLS] as a sentence vector</span>
    <p>BERT adds a special [CLS] token at the start of every input. People often take its vector as "the sentence's vector". Raw BERT was never trained to make that vector good for cosine similarity; it often loses to simply averaging all token vectors. Use a model trained for sentence embeddings (Sentence-BERT and successors), covered in <em><a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a></em>.</p>
  </div>

  <h2 id="nl-tasks"><span class="num">08</span>Classic NLP Tasks</h2>
  <p>Before LLMs, each of these needed its own trained model. LLMs now do them from a plain instruction, but the names come up in interviews and in the tools you will use.</p>
  <table class="tbl">
    <tr><th>Task</th><th>Output</th><th>Example</th></tr>
    <tr><td><strong>POS tagging</strong></td><td>Grammatical role per word (part of speech)</td><td>The/DET angry/ADJ cat/NOUN ate/VERB (lemmatizers need it)</td></tr>
    <tr><td><strong>NER</strong> (named entity recognition)</td><td>Spans: people, orgs, places, dates</td><td>[Elon Musk]PER founded [SpaceX]ORG</td></tr>
    <tr><td><strong>Dependency parsing</strong></td><td>Who did what to whom</td><td>cat = subject (nsubj) of ate; fish = object (obj)</td></tr>
  </table>
  <h3>BIO tagging for NER</h3>
  <p>NER's problem is that an entity can be several words long ("Elon Musk"). A model that labels one token at a time cannot say "these two words are one name". BIO solves it by giving each token one of three kinds of label: <strong>B</strong>-type begins an entity, <strong>I</strong>-type continues it, <strong>O</strong> means outside any entity.</p>
  <table class="tbl">
    <tr><th>Elon</th><th>Musk</th><th>founded</th><th>SpaceX</th><th>in</th><th>Hawthorne</th></tr>
    <tr><td>B-PER</td><td>I-PER</td><td>O</td><td>B-ORG</td><td>O</td><td>B-LOC</td></tr>
  </table>
  <p>Read it as: "Elon" starts a person, "Musk" continues the same person, "founded" is nothing, "SpaceX" starts an organisation. Two B-PER tags in a row would mean two different people, which is why "B" exists at all.</p>

  <h2 id="nl-eval"><span class="num">09</span>Evaluating a Classifier</h2>
  <p>You built a spam filter. It says "99% accurate". Is that good? Not necessarily. If only 1 email in 100 is spam, a filter that marks <em>everything</em> as "not spam" is also 99% accurate, and catches zero spam.</p>
  <p>So for "find the rare thing" tasks, accuracy is the wrong question. Ask two better ones. First the vocabulary: a <strong>true positive (TP)</strong> is spam you caught, a <strong>false positive (FP)</strong> is a good email you wrongly flagged, a <strong>false negative (FN)</strong> is spam you missed.</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Question it answers</th></tr>
    <tr><td>Precision</td><td>TP / (TP + FP)</td><td>Of what I flagged, how much was right? (few false alarms)</td></tr>
    <tr><td>Recall</td><td>TP / (TP + FN)</td><td>Of the real positives, how many did I catch? (few misses)</td></tr>
    <tr><td>F1</td><td>2PR / (P + R)</td><td>Harmonic mean of precision P and recall R: low if either is low</td></tr>
  </table>
  <p>A worked example with real numbers. 100 emails, 20 are spam. The filter flags 10 emails: 8 are real spam, 2 are good mail.</p>
  <ul>
    <li>TP = 8, FP = 2, FN = 20 − 8 = 12.</li>
    <li>Precision = 8 / (8 + 2) = 0.8: when it shouts "spam", it is right 80% of the time.</li>
    <li>Recall = 8 / (8 + 12) = 0.4: it catches only 40% of the spam.</li>
    <li>F1 = 2 × 0.8 × 0.4 / (0.8 + 0.4) = 0.53. The weak recall drags it down.</li>
  </ul>
  <div class="fx" data-lang="py">from sklearn.metrics import precision_score, recall_score, f1_score
y_true = [1]*20 + [0]*80                        # 20 spam, 80 good
y_pred = [1]*8 + [0]*12 + [1]*2 + [0]*78        # caught 8 spam, missed 12, 2 false alarms
print(precision_score(y_true, y_pred), recall_score(y_true, y_pred), round(f1_score(y_true, y_pred), 3))</div>
  <div class="fx" data-lang="text">0.8 0.4 0.533</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With 1% spam, "never spam" scores 99% accuracy and 0 recall. On imbalanced text data, report precision, recall and F1 per class. For NER, score whole entity spans, not tokens.</p>
  </div>

  <h2 id="nl-build"><span class="num">10</span>Build It: a TF-IDF Sentiment Classifier</h2>
  <p>Back to the shop reviews from section 01. Ten labelled reviews, TF-IDF with bigrams, and a logistic regression (a simple model that gives each feature one weight and adds them up). No stopword removal, so "not good" survives. Runs in under a second with <code>pip install scikit-learn</code>.</p>
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
