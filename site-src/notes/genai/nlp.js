// notes/genai/nlp.js — NLP Foundations
Object.assign(TOPIC_CONTENT, {
  "nlp": `<main>
  <h1>NLP Foundations</h1>
  <p class="lead">The first stop on the GenAI path. It assumes only basic Python and ML. You'll learn how text becomes numbers: from word counts to word vectors, and why that ended in contextual embeddings. That last step is what <em>02 · Transformers</em> builds on.</p>

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
      <div class="rm-item rm-done" data-target="nl-rev"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="nl-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="nl-why"><span class="num">01</span>Why Classical NLP</h2>
  <p>LLMs didn't replace these ideas; they are built on them.</p>
  <div class="flow"><span>Preprocessing &amp; counts</span><span>Static word vectors</span><span>Contextual embeddings</span><span>LLMs</span></div>
  <ul>
    <li><strong>Inside every LLM</strong>: subword tokenizers and an embedding layer, a direct descendant of Word2Vec.</li>
    <li><strong>Still in production</strong>: BM25 (a TF-IDF variant) runs first-pass search and is paired with vector search in RAG. Tiny TF-IDF or FastText classifiers run where a 7B model won't fit.</li>
    <li><strong>Senior skill</strong>: knowing when a cheap baseline is good enough, and measuring it before reaching for a transformer.</li>
  </ul>

  <h2 id="nl-prep"><span class="num">02</span>Text Preprocessing</h2>
  <p>Turning raw, messy text into a clean, consistent form before any model sees it. Every later step inherits its quality.</p>
  <div class="flow"><span>"The Cats Sat!"</span><span>lowercase</span><span>tokenize: the, cats, sat</span><span>drop stopwords: cats, sat</span><span>lemmatize: cat, sit</span></div>
  <ul>
    <li><strong>Tokenize</strong>: split text into units (words here; subwords in 02).</li>
    <li><strong>Stopwords</strong>: very common, low-information words ("the", "is").</li>
    <li><strong>Stemming / lemmatization</strong>: reduce words to a base form so "runs" and "running" count as one word.</li>
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
  <p>For modern transformers you mostly <em>skip</em> this: no stopword removal or stemming, because the model uses every word, and its own tokenizer handles case and punctuation.</p>

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
  <p>It works surprisingly well for classification: a review full of "terrible", "broke", "refund" is negative whatever the word order. Vectors are huge and <strong>sparse</strong> (mostly zeros).</p>
  <h3>N-grams</h3>
  <p>An <strong>n-gram</strong> is a run of n consecutive words treated as one feature. Bigrams turn "New York" into one clear signal and keep "not good" together.</p>
  <ul>
    <li>Cost: the vocabulary explodes and most n-grams are rare or unseen at test time (sparsity).</li>
    <li>Smoothing (adding small counts to unseen n-grams) patches this. Neural models fixed it: they generalise through word similarity.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>BoW sees "dog bites man" and "man bites dog" as identical. Bigrams help locally, but nothing count-based understands long-range order.</p>
  </div>

  <h2 id="nl-tfidf"><span class="num">04</span>TF-IDF</h2>
  <p>Raw counts reward words like "the". <strong>TF-IDF</strong> reweights each count by how rare the word is across documents.</p>
  <ul>
    <li><strong>TF</strong> (term frequency): how often the word appears in <em>this</em> document.</li>
    <li><strong>IDF</strong> (inverse document frequency): <code>log(N / docs containing the word)</code>. High for rare words, near 0 for words in every document.</li>
    <li><strong>TF × IDF</strong>: high when a word is frequent here and rare elsewhere.</li>
  </ul>
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
  <p><strong>BM25</strong> is TF-IDF with two fixes: term frequency saturates (the 10th "GPU" adds little) and long documents are penalised. It is the default keyword-search score (Elasticsearch, hybrid search in 06).</p>

  <h2 id="nl-w2v"><span class="num">05</span>Word2Vec</h2>
  <p>In BoW and TF-IDF, "cat" and "dog" are unrelated columns. <strong>Word2Vec</strong> gives each word a dense vector (e.g. 300 numbers) so that words used in similar contexts land close together.</p>
  <div class="callout anlg"><span class="label">Analogy: know a word by its company</span>
    <p>"Doctor" and "physician" both hang around "patient", "hospital", "diagnosis". Same social circle, so nearly the same vector. Meaning is never written down; it's inferred from neighbours.</p>
  </div>
  <p>How: train a tiny network on a fake task (predict nearby words), then keep its weights as the vectors.</p>
  <div class="cards">
    <div><b>Skip-gram</b><p>One word → predict its neighbours. "sat" → The, cat, on, the.</p><small>More training pairs per word: better for rare words</small></div>
    <div><b>CBOW</b><p>Neighbours → predict the centre word. The, cat, on, the → "sat".</p><small>Averages context: faster, good for frequent words</small></div>
  </div>
  <ul>
    <li>Window size 2 around "sat" in "The cat sat on the" gives pairs (sat→The), (sat→cat), (sat→on), (sat→the).</li>
    <li>Famous result: <code>king − man + woman ≈ queen</code>. Directions in the space encode relations.</li>
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
  <table class="tbl">
    <tr><th></th><th>"sat on the river bank"</th><th>"paid money into the bank"</th></tr>
    <tr><td>Static (Word2Vec, GloVe)</td><td>bank = v</td><td>bank = v (same)</td></tr>
    <tr><td>Contextual (ELMo, BERT)</td><td>bank ≈ "shore"</td><td>bank ≈ "lender"</td></tr>
  </table>
  <ul>
    <li><strong>ELMo</strong> (2018): bidirectional LSTMs (recurrent networks that read word by word). Contextual, but slow and forgetful over long text.</li>
    <li><strong>BERT</strong> (2018): a Transformer encoder. Every word looks at every other word at once. That mechanism, attention, is the subject of <em>02 · Transformers</em>.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: BERT's [CLS] as a sentence vector</span>
    <p>Raw BERT was never trained to make its [CLS] vector good for cosine similarity; it often loses to averaging token vectors. Use a model trained for sentence embeddings (Sentence-BERT and successors), covered in <em>06 · Embeddings &amp; Vector DBs</em>.</p>
  </div>

  <h2 id="nl-tasks"><span class="num">08</span>Classic NLP Tasks</h2>
  <p>Structure-extraction tasks. LLMs now do many of them zero-shot, but the vocabulary shows up in interviews.</p>
  <ul>
    <li><strong>POS tagging</strong>: label each word's grammatical role. The/DET angry/ADJ cat/NOUN ate/VERB. Lemmatizers need it ("better" → "good" only as an adjective).</li>
    <li><strong>NER</strong> (named entity recognition): find spans that are people, organisations, places, dates.</li>
    <li><strong>Dependency parsing</strong>: a grammar tree of who did what to whom. "cat" is the subject (nsubj) of "ate"; "fish" is its object (obj).</li>
  </ul>
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

  <h2 id="nl-rev"><span class="num">11</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Pipeline:</strong> lowercase → tokenize → (stopwords) → stem or lemmatize; fit on training data only.</li>
    <li><strong>Stemming</strong> chops (fast, non-words); <strong>lemmatization</strong> looks up (slower, real words).</li>
    <li><strong>Never drop "not"</strong> for sentiment: default stopword lists include it.</li>
    <li><strong>BoW</strong>: word counts, order lost, sparse; a strong cheap baseline.</li>
    <li><strong>N-grams</strong> keep local order ("not good"), at the cost of a huge sparse vocabulary.</li>
    <li><strong>TF-IDF</strong> = frequent here × rare elsewhere; <strong>BM25</strong> adds saturation and length normalisation.</li>
    <li><strong>Word2Vec</strong>: predict neighbours, keep the weights; skip-gram for rare words, CBOW for speed.</li>
    <li><strong>GloVe</strong> uses global co-occurrence; <strong>FastText</strong> uses character n-grams, so no unknown words.</li>
    <li>Static vectors give "bank" one meaning; <strong>contextual</strong> models (ELMo, BERT) give one per sentence.</li>
    <li><strong>BIO tagging</strong> turns NER into per-token classification; judge classifiers by precision, recall, F1.</li>
  </ol></div>

  <h2 id="nl-qa"><span class="num">12</span>Questions &amp; Answers</h2>
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
