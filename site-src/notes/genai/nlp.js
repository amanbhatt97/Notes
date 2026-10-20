// notes/genai/nlp.js — NLP Foundations
Object.assign(TOPIC_CONTENT, {
  "nlp": `<main>
  <h1>NLP Foundations</h1>
  <div class="where"><span>Generative AI</span><span>NLP Foundations</span></div>
  <p class="lead">The first stop on the GenAI path. A computer can only do maths on numbers, and a review is a string of characters. This note turns text into numbers step by step, and every step exists because the one before it fails at something: cut text into tokens, clean them, count them, weight the counts, give each word a learned vector, compare vectors, and finally hit the wall that <a class="xref" data-note="transformers">Transformers</a> knocks down. <strong>One running example throughout:</strong> customer reviews from <strong>Biteful</strong>, a food-delivery app ("Spicy paneer roll was GREAT!!", "Curry was too hot!", "Chai was too hot..."). The same reviews are fed through attention in the Transformers note and searched by meaning in <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>. Every code block ran here (Python 3.13, scikit-learn, gensim 4.4, NLTK; single thread). No pretrained word vectors could be downloaded in this environment, so every embedding below is trained locally on a small synthetic review corpus, and the note says so wherever it matters.</p>

  <h2 id="nl-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 200" width="680">
<defs><marker id="nl-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="41" text-anchor="middle" font-size="12">Linear algebra</text><text x="90" y="58" text-anchor="middle" class="tm" font-size="10">vectors, dot product</text>
<rect x="10" y="120" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="141" text-anchor="middle" font-size="12">Probability</text><text x="90" y="158" text-anchor="middle" class="tm" font-size="10">sigmoid, softmax, logs</text>
<rect x="250" y="70" width="170" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="335" y="93" text-anchor="middle" font-size="13" font-weight="700">NLP Foundations</text><text x="335" y="112" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="500" y="10" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="585" y="31" text-anchor="middle" font-size="12">Transformers</text><text x="585" y="48" text-anchor="middle" class="tm" font-size="10">context-aware vectors</text>
<rect x="500" y="75" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="585" y="96" text-anchor="middle" font-size="12">Vector DBs</text><text x="585" y="113" text-anchor="middle" class="tm" font-size="10">search by meaning</text>
<rect x="500" y="140" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="585" y="161" text-anchor="middle" font-size="12">RAG &amp; LLMs</text><text x="585" y="178" text-anchor="middle" class="tm" font-size="10">tokens + embeddings inside</text>
<line x1="170" y1="45" x2="248" y2="88" stroke="currentColor" marker-end="url(#nl-a0)"/><line x1="170" y1="145" x2="248" y2="108" stroke="currentColor" marker-end="url(#nl-a0)"/>
<line x1="420" y1="88" x2="498" y2="38" stroke="currentColor" marker-end="url(#nl-a0)"/><line x1="420" y1="98" x2="498" y2="100" stroke="currentColor" marker-end="url(#nl-a0)"/><line x1="420" y1="108" x2="498" y2="160" stroke="currentColor" marker-end="url(#nl-a0)"/>
</svg><figcaption>NLP Foundations turns text into vectors; everything in the GenAI track consumes those vectors.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="m_linalg">Linear Algebra</a> and <a class="xref" data-note="st_probability">Probability</a></b><span>A vector is a list of numbers; the dot product measures how much two vectors agree; a sigmoid turns a score into a probability. Those three tools are all the maths this note needs. If you met TF-IDF item profiles in <a class="xref" data-note="ml_recsys">Recommender Systems</a>, section 05 is the same idea, explained from scratch.</span></li>
    <li><b>This note adds: text → numbers</b><span>Tokens, cleaning, counts (bag of words), weighted counts (TF-IDF), learned word vectors (Word2Vec, GloVe, FastText) and cosine similarity, all computed on the same four Biteful reviews, plus a review classifier, its evaluation and the classic word-level tasks.</span></li>
    <li><b>Leads to: <a class="xref" data-note="transformers">Transformers</a></b><span>Every method here gives "hot" one vector, whether the curry was hot (spicy) or the chai was hot (temperature). Transformers compute a fresh vector for each word from its sentence. Then <a class="xref" data-note="vectordb">Vector DBs</a> searches those vectors and <a class="xref" data-note="rag">RAG</a> feeds the results to an LLM (<a class="xref" data-note="llm_basics">How LLMs Work</a>).</span></li>
  </ol>

  <h2 id="nl-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. All numbers are from the four Biteful reviews: R1 "Spicy paneer roll was GREAT!!", R2 "Mild chicken wrap was good.", R3 "Curry was too hot!", R4 "Chai was too hot...".</p>
  <ol class="story">
    <li><b>Text is not numbers</b><span>Q: what can a computer do with "Curry was too hot!"? → Only character codes: h-o-t is 104, 111, 116 and "hit" is 104, 105, 116. Codes say nothing about meaning. We need units that carry meaning…</span></li>
    <li><b>Tokenization</b><span>Q: what are the units? → Split into tokens. Words: R1 gives ['Spicy', 'paneer', 'roll', 'was', 'GREAT']. But "rolls" or a typo has no ID. Subwords (BPE) learn pieces by merging frequent pairs: "rolls" = roll + s. But "GREAT", "Great" and "great" are still three different tokens…</span></li>
    <li><b>Normalisation</b><span>Q: how do we make the same word look the same? → Lowercase, maybe drop stopwords, stem or lemmatize. Trap: the stopword list deletes "not" and "too", so "not too spicy" becomes "spicy". We now have clean tokens; still not numbers…</span></li>
    <li><b>Bag of words</b><span>Q: how does a review become a vector? → Count each vocabulary word: 13 columns, R3 = curry 1, was 1, too 1, hot 1. But "was" is in every review and inflates every comparison…</span></li>
    <li><b>TF-IDF</b><span>Q: which words actually matter? → Multiply counts by rarity log(N/df): "was" gets ln(4/4) = 0, "curry" gets ln 4 = 1.386. But R1 "…great" and R2 "…good" now share nothing: TF-IDF similarity 0, though both say "tasty wrap"…</span></li>
    <li><b>Word2Vec</b><span>Q: how can "great" and "good" be close? → Learn a short dense vector per word by predicting neighbours; words used the same way get similar vectors: cos(great, good) = 0.985 on our review corpus. Do other methods learn the same thing?</span></li>
    <li><b>GloVe</b><span>Q: can we learn vectors from global co-occurrence counts instead of a sliding window? → Yes: fit vectors so w·c ≈ log(count). Same kind of result. But both give no vector to a word they never saw ("spicyyy")…</span></li>
    <li><b>FastText</b><span>Q: what about typos and unseen words? → Build a word from its character n-grams: "spicyyy" lands next to "spicy". Now we have good vectors; how do we compare them properly?</span></li>
    <li><b>Cosine similarity</b><span>Q: how close are two vectors, regardless of length? → cos = a·b / (‖a‖‖b‖). R1 vs R2: BoW 0.2, TF-IDF 0, averaged Word2Vec 0.969. But every method gives "hot" ONE vector…</span></li>
    <li><b>The context problem</b><span>Q: is the curry's "hot" the chai's "hot"? → No, but a static vector must blend them: cos(hot, spicy) = 0.86, cos(hot, warm) = 0.77. The fix, a vector computed from the sentence, is the Transformer. Before leaving, we put the toolkit to work…</span></li>
    <li><b>Build: a review classifier</b><span>Q: can these vectors sort happy from angry reviews? → TF-IDF + logistic regression works on seen words; averaged Word2Vec also handles unseen synonyms ("delicious kathi, amazing": 0.49 vs 0.93). How good is "good", though?</span></li>
    <li><b>Evaluating a classifier</b><span>Q: is 99% accuracy good? → Not when only 1% are complaints. Precision, recall, F1. But all of this labels whole reviews; what about labelling single words?</span></li>
    <li><b>Classic word-level tasks</b><span>Q: which words are dish names, restaurants, places? → POS, NER with BIO tags, parsing. They need each word's meaning in context, which is again the Transformer's job.</span></li>
  </ol>

  <h2 id="nl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">NLP Foundations: text → numbers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Tokens</div>
        <ul>
          <li><b>Need</b> — characters carry no meaning; models need units with IDs</li>
          <li><b>Words</b> — huge vocab, unseen word = UNK</li>
          <li><b>Characters</b> — no UNK, but long and meaning-poor</li>
          <li><b>BPE</b> — merge the most frequent pair, repeat: r+o, ro+l, rol+l → "roll"</li>
          <li>⚠ Tokens ≠ words ("strawberry" letter counting)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Normalisation</div>
        <ul>
          <li><b>Lowercase</b> — GREAT = great</li>
          <li><b>Stem</b> (rules, fast): spicy → spici · <b>Lemma</b> (dictionary): spiciest → spicy</li>
          <li>⚠ <b>Stopwords</b> delete "not", "too": "not too spicy" → "spicy"</li>
          <li><b>Transformers skip most of it</b> — subword tokenizer handles case and forms</li>
          <li>⚠ <b>Leakage</b> — fit vocabulary / IDF on train only</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Counts</div>
        <ul>
          <li><b>BoW</b> — one column per word, order lost; R3 · R4 share 3 words</li>
          <li><b>N-grams</b> — "not too spicy" as one feature; vocab explodes</li>
          <li><b>TF-IDF</b> — tf × ln(N/df): "was" → 0, "curry" → 1.386</li>
          <li><b>BM25</b> — TF-IDF with saturation + length penalty: keyword search today</li>
          <li>⚠ <b>Orthogonal synonyms</b> — great vs good: similarity 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Word vectors</div>
        <ul>
          <li><b>Word2Vec</b> — predict neighbours; skip-gram (word → context), CBOW (context → word)</li>
          <li><b>Negative sampling</b> — real pair vs random pairs, sigmoid loss</li>
          <li><b>GloVe</b> — fit w·c + b ≈ log(co-occurrence count)</li>
          <li><b>FastText</b> — sum of character n-grams: typos get vectors</li>
          <li>⚠ <b>Antonyms close</b> — spicy vs mild 0.71 (same contexts)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Comparing</div>
        <ul>
          <li><b>Cosine</b> — a·b / (‖a‖‖b‖), angle only, −1…1</li>
          <li><b>Why not raw dot</b> — long reviews would win just for being long</li>
          <li><b>R1 vs R2</b> — BoW 0.2 · TF-IDF 0 · Word2Vec avg 0.969</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The wall</div>
        <ul>
          <li><b>Static</b> — one vector per word in every sentence</li>
          <li><b>"hot"</b> — between spicy (0.86) and warm (0.77): a blend</li>
          <li><b>Contextual</b> — ELMo (bi-LSTM), BERT (attention) → Transformers</li>
          <li>⚠ BERT's [CLS] is a weak sentence vector</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Using it</div>
        <ul>
          <li><b>Classifier</b> — TF-IDF (1–2 grams) + logistic regression</li>
          <li><b>Metrics</b> — precision TP/(TP+FP), recall TP/(TP+FN), F1</li>
          <li><b>Tasks</b> — POS, NER (BIO tags), dependency parsing</li>
          <li>⚠ 99% accuracy on 1% complaints can mean 0 recall</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="nl-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="nl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Text Is Not Numbers</span><span class="rm-sub">The Biteful reviews</span></div></div>
      <div class="rm-item rm-done" data-target="nl-tok"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Tokenization</span><span class="rm-sub">Words, characters, BPE by hand</span></div></div>
      <div class="rm-item rm-done" data-target="nl-prep"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Normalisation</span><span class="rm-sub">Case, stopwords, stems, lemmas</span></div></div>
      <div class="rm-item rm-done" data-target="nl-bow"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Bag of Words</span><span class="rm-sub">Counts traced, n-grams</span></div></div>
      <div class="rm-item rm-done" data-target="nl-tfidf"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">TF-IDF</span><span class="rm-sub">Weighting by rarity, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="nl-w2v"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Word2Vec</span><span class="rm-sub">Pairs traced, one SGD step</span></div></div>
      <div class="rm-item rm-done" data-target="nl-glove"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">GloVe</span><span class="rm-sub">Vectors from co-occurrence counts</span></div></div>
      <div class="rm-item rm-done" data-target="nl-fasttext"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">FastText</span><span class="rm-sub">Subwords for unseen words</span></div></div>
      <div class="rm-item rm-done" data-target="nl-cos"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Cosine Similarity</span><span class="rm-sub">Comparing every representation</span></div></div>
      <div class="rm-item rm-done" data-target="nl-ctx"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">The Context Problem</span><span class="rm-sub">Which "hot"?</span></div></div>
      <div class="rm-item rm-done" data-target="nl-build"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Build: Review Classifier</span><span class="rm-sub">TF-IDF vs Word2Vec features</span></div></div>
      <div class="rm-item rm-done" data-target="nl-eval"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Evaluating a Classifier</span><span class="rm-sub">Precision, recall, F1</span></div></div>
      <div class="rm-item rm-done" data-target="nl-tasks"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Classic Word-Level Tasks</span><span class="rm-sub">POS, NER, BIO, parsing</span></div></div>
      <div class="rm-item rm-done" data-target="nl-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One chain of fixes</span></div></div>
      <div class="rm-item rm-done" data-target="nl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="nl-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="nl-why"><span class="num">01</span>Text Is Not Numbers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful receives thousands of reviews a day and wants a program that finds the angry ones, groups similar complaints and searches dishes by meaning. Every such program does maths. What maths can it do on "Curry was too hot!"?</p>
  </div>
  <p>Meet the four reviews this note uses everywhere. They are short on purpose: every number in the note can be checked by hand on them.</p>
  <table class="tbl">
    <tr><th>ID</th><th>Review (as typed)</th><th>What the customer means</th></tr>
    <tr><td>R1</td><td>Spicy paneer roll was GREAT!!</td><td>loved a spicy wrap</td></tr>
    <tr><td>R2</td><td>Mild chicken wrap was good.</td><td>liked a mild wrap</td></tr>
    <tr><td>R3</td><td>Curry was too hot!</td><td>too <em>spicy</em> (a chilli complaint)</td></tr>
    <tr><td>R4</td><td>Chai was too hot...</td><td>too <em>hot to drink</em> (a temperature complaint)</td></tr>
  </table>
  <p>A human sees at once that R1 and R2 are both happy wrap reviews, and that R3 and R4 are different complaints that happen to use the same words. Keep those two facts in mind: every method in this note is judged by whether it can see them too.</p>
  <p>Inside a computer, text is already stored as numbers: each character has a code. So why not do maths on those codes?</p>
<div class="fx" data-lang="py">review = "Curry was too hot!"
print([ord(c) for c in "hot"], [ord(c) for c in "hit"], [ord(c) for c in "spicy"])
print(len(review), "characters:", [ord(c) for c in review[:9]], "...")</div>
  <div class="fx" data-lang="text">[104, 111, 116] [104, 105, 116] [115, 112, 105, 99, 121]
18 characters: [67, 117, 114, 114, 121, 32, 119, 97, 115] ...</div>
  <p><code>ord(c)</code> gives the character code. "hot" and "hit" differ by one code (111 vs 105) yet mean unrelated things, while "hot" and "spicy" (in R3's sense) share no code at all. Character codes identify letters; they say nothing about meaning. The whole field of <strong>NLP</strong> (Natural Language Processing) is about building better numbers.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Phone numbers are numbers too, but the average of two phone numbers means nothing and two close phone numbers are not "similar" people. Character codes are phone numbers for letters. We want numbers more like map coordinates, where close means similar.</p>
  </div>
  <p>The road this note walks, each step fixing the last one's problem:</p>
  <div class="flow"><span>tokens</span><span>clean tokens</span><span>counts (BoW)</span><span>weighted counts (TF-IDF)</span><span>learned word vectors</span><span>contextual vectors (Transformers)</span></div>
  <div class="cards">
    <div><b>Inside every LLM</b><p>A subword tokenizer (section 02) and an embedding table that gives each token a vector, a direct descendant of Word2Vec (section 06).</p></div>
    <div><b>Still in production</b><p>BM25, TF-IDF's cousin (section 05), runs the keyword half of most search and RAG systems. Tiny TF-IDF or FastText classifiers run where a big model will not fit.</p></div>
    <div><b>Senior skill</b><p>Before paying for a big model, measure what a one-second word-count model already gets right (section 11).</p></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>NLP</strong>: methods that turn human language into numbers a program can compute with, and use those numbers for tasks such as classification, search, translation and generation. A <strong>representation</strong> is the list of numbers chosen to stand for a piece of text.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Just feed the raw characters to a model" is not wrong in principle (character models exist), but each character carries almost no meaning, so the model must learn spelling, words and grammar from scratch with very long inputs. Every practical system first groups characters into bigger units.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Tokenization.</b> Characters are too small to mean anything. What units should we cut "Spicy paneer roll was GREAT!!" into, and how does each unit get an ID?</div>

  <h2 id="nl-tok"><span class="num">02</span>Tokenization</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We need units bigger than characters that a model can look up. Should R1 be cut into words, characters, or something in between, and what happens when a customer types a word we have never seen, like "rolls" or "spicyyy"?</p>
  </div>
  <p>Cutting text into units is <strong>tokenization</strong>; each unit is a <strong>token</strong>; the fixed list of known tokens is the <strong>vocabulary</strong>, and each token's position in it is its <strong>ID</strong>. The simplest choice: a token is a run of letters.</p>
<div class="fx" data-lang="py">import re
reviews = ["Spicy paneer roll was GREAT!!", "Mild chicken wrap was good.",
           "Curry was too hot!", "Chai was too hot..."]
for r in reviews:
    print(re.findall(r"[A-Za-z]+", r))      # runs of letters; punctuation dropped

vocab = sorted({t for r in reviews for t in re.findall(r"[A-Za-z]+", r)})
ids = {t: i for i, t in enumerate(vocab)}
print(len(vocab), "tokens in the vocabulary")
print("R3 as IDs:", [ids[t] for t in re.findall(r"[A-Za-z]+", reviews[2])])
print("'rolls' in vocabulary?", "rolls" in ids)</div>
  <div class="fx" data-lang="text">['Spicy', 'paneer', 'roll', 'was', 'GREAT']
['Mild', 'chicken', 'wrap', 'was', 'good']
['Curry', 'was', 'too', 'hot']
['Chai', 'was', 'too', 'hot']
13 tokens in the vocabulary
R3 as IDs: [1, 11, 10, 7]
'rolls' in vocabulary? False</div>
  <p>The regular expression <code>[A-Za-z]+</code> means "one or more letters in a row", so spaces and "!!" disappear. Each distinct token gets an ID by its alphabetical position, and R3 becomes a list of four IDs. Two problems are already visible. First, "Spicy", "Chai", "Curry", "GREAT" keep their capitals, so "GREAT" and "great" would get different IDs (section 03 fixes that). Second, a new review saying "rolls" has no ID at all: a word-level tokenizer must map it to a catch-all <code>&lt;UNK&gt;</code> (unknown) token and its meaning is lost. Real vocabularies of whole words reach hundreds of thousands of entries and still miss typos, new dishes and names.</p>
  <table class="tbl">
    <tr><th>Unit</th><th>Vocabulary size</th><th>Unseen word "rolls"</th><th>Length of R1</th><th>Meaning per token</th></tr>
    <tr><td>Words</td><td>huge (every form of every word)</td><td>&lt;UNK&gt;</td><td>5</td><td>high</td></tr>
    <tr><td>Characters</td><td>tiny (~100)</td><td>fine: r, o, l, l, s</td><td>25 letters</td><td>almost none</td></tr>
    <tr><td><strong>Subwords</strong></td><td>chosen (30k–200k)</td><td>roll + s</td><td>a little over 5</td><td>high for common words</td></tr>
  </table>
  <h3>Subwords: Byte-Pair Encoding traced by hand</h3>
  <p>Subword tokenizers keep frequent words whole and split rare words into frequent pieces. <strong>BPE (byte-pair encoding)</strong> learns the pieces from data with one rule: start from single characters; count every pair of neighbouring symbols, weighted by word frequency; glue the most frequent pair into a new symbol; repeat. Here is a tiny corpus of menu words from Biteful's reviews, with how often each word appeared.</p>
  <table class="tbl">
    <tr><th>Word</th><th>roll</th><th>rolls</th><th>spicy</th><th>spice</th><th>paneer</th></tr>
    <tr><td>Frequency</td><td>6</td><td>3</td><td>4</td><td>2</td><td>3</td></tr>
  </table>
  <ol>
    <li><strong>Count pairs.</strong> "r o" appears in roll (6) and rolls (3): 9 times. "o l" and "l l" also 9. "s p", "p i", "i c" appear in spicy (4) and spice (2): 6 each. "c y" 4, "c e" 2, and each pair inside paneer 3.</li>
    <li><strong>Merge 1.</strong> Top count 9 is a three-way tie; the code breaks ties by taking the pair it met first, "r"+"o" → "ro". Now roll is "ro l l".</li>
    <li><strong>Merges 2 and 3.</strong> "ro"+"l" (9) → "rol", then "rol"+"l" (9) → "roll". Both roll and rolls now start with the single symbol "roll".</li>
    <li><strong>Merges 4 to 6.</strong> Next best is 6: "s"+"p" → "sp", "sp"+"i" → "spi", "spi"+"c" → "spic". Now spicy = "spic y" and spice = "spic e": the shared stem became one token.</li>
    <li>"paneer" (3 per pair) never wins in six merges, so it stays as six characters. Rare words are spelled out; frequent ones are compressed.</li>
  </ol>
<div class="fx" data-lang="py">from collections import Counter

def learn_bpe(word_freq, n_merges):
    corpus = {tuple(w): f for w, f in word_freq.items()}       # start from characters
    merges = []
    for step in range(n_merges):
        pairs = Counter()
        for symbols, f in corpus.items():                       # count neighbouring pairs
            for a, b in zip(symbols, symbols[1:]):
                pairs[a, b] += f
        (a, b), n = pairs.most_common(1)[0]                     # ties: first pair seen wins
        merges.append((a, b))
        new = {}
        for symbols, f in corpus.items():                       # glue that pair everywhere
            out, i = [], 0
            while i &lt; len(symbols):
                if symbols[i:i+2] == (a, b):
                    out.append(a + b); i += 2
                else:
                    out.append(symbols[i]); i += 1
            new[tuple(out)] = f
        corpus = new
        print(f"merge {step+1}: {a!r} + {b!r} (seen {n}x) -&gt;", [" ".join(s) for s in corpus])
    return merges

merges = learn_bpe({"roll": 6, "rolls": 3, "spicy": 4, "spice": 2, "paneer": 3}, 6)</div>
  <div class="fx" data-lang="text">merge 1: 'r' + 'o' (seen 9x) -&gt; ['ro l l', 'ro l l s', 's p i c y', 's p i c e', 'p a n e e r']
merge 2: 'ro' + 'l' (seen 9x) -&gt; ['rol l', 'rol l s', 's p i c y', 's p i c e', 'p a n e e r']
merge 3: 'rol' + 'l' (seen 9x) -&gt; ['roll', 'roll s', 's p i c y', 's p i c e', 'p a n e e r']
merge 4: 's' + 'p' (seen 6x) -&gt; ['roll', 'roll s', 'sp i c y', 'sp i c e', 'p a n e e r']
merge 5: 'sp' + 'i' (seen 6x) -&gt; ['roll', 'roll s', 'spi c y', 'spi c e', 'p a n e e r']
merge 6: 'spi' + 'c' (seen 6x) -&gt; ['roll', 'roll s', 'spic y', 'spic e', 'p a n e e r']</div>
  <p>The printout is our hand trace: after each merge, the five words are shown with spaces between their current symbols. <code>pairs.most_common(1)</code> returns the single most frequent pair; Python's <code>Counter</code> keeps first-seen order among ties, which is why "r"+"o" beat "o"+"l". A trained tokenizer is nothing more than this ordered list of merges. To tokenize a <em>new</em> word, start from its characters and replay the merges in the same order:</p>
<div class="fx" data-lang="py">def apply_bpe(word, merges):
    symbols = list(word)
    for a, b in merges:                       # replay merges in training order
        i, out = 0, []
        while i &lt; len(symbols):
            if symbols[i:i+2] == [a, b]:
                out.append(a + b); i += 2
            else:
                out.append(symbols[i]); i += 1
        symbols = out
    return symbols

for w in ["rolls", "spicier", "rolled", "spicyyy", "naan"]:
    print(f"{w:8s} -&gt; {apply_bpe(w, merges)}")</div>
  <div class="fx" data-lang="text">rolls    -&gt; ['roll', 's']
spicier  -&gt; ['spic', 'i', 'e', 'r']
rolled   -&gt; ['roll', 'e', 'd']
spicyyy  -&gt; ['spic', 'y', 'y', 'y']
naan     -&gt; ['n', 'a', 'a', 'n']</div>
  <p>None of "spicier", "rolled", "spicyyy" or "naan" was in the training words, yet each gets a token sequence: the known pieces "roll" and "spic" are reused, and anything else falls back to single characters. Nothing is ever <code>&lt;UNK&gt;</code>, because single characters (in GPT-style tokenizers, single <em>bytes</em>, so even emoji work) are always in the vocabulary. Real tokenizers run 30,000 to 200,000 merges on terabytes of text, so whole common words such as "the" or "chicken" become one token.</p>
  <div class="cards">
    <div><b>BPE</b><p>Merge the most frequent pair. Byte-level BPE in GPT-2/3/4, Llama, Claude-style tokenizers.</p><small>"rolls" → roll + s</small></div>
    <div><b>WordPiece</b><p>BERT's variant: merges the pair that most increases the likelihood of the corpus; continuation pieces are marked "##".</p><small>"rolls" → roll, ##s</small></div>
    <div><b>Unigram / SentencePiece</b><p>Start with a big vocabulary and prune pieces that matter least; treats the space as a symbol.</p><small>T5, many multilingual models</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Indian food menus written by many cooks: "paneer tikka", "paneer roll", "paneer butter masala". A busy cashier learns shorthand for the pieces that come up all the time ("PNR", "TKK") and writes rare dishes out in full. BPE learns the same shorthand from counts.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Token</strong>: the unit a model reads, identified by an integer ID in a fixed <strong>vocabulary</strong>. <strong>Subword tokenization</strong>: a vocabulary of whole words and word pieces, learned from data (BPE, WordPiece, Unigram), with single characters or bytes as a fallback so no input is unknown.</p></div>
  <div class="callout trap"><span class="label">Trap: tokens are not words</span>
    <p>Token counts, not word counts, set LLM prices and context limits; Hindi, code and numbers often split into many more tokens per word than English. And a model that sees "straw" + "berry" never sees individual letters, which is why LLMs miscount the r's in "strawberry".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Normalisation.</b> We have units, but "GREAT" and "great" are still different tokens, and so are "spicy" and "spiciest". Should we make them the same before counting, and what do we lose if we do?</div>

  <h2 id="nl-prep"><span class="num">03</span>Normalisation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>R1 says "GREAT", another review says "great", a third says "Great". To a counter they are three different words, so each count is split three ways. How do we make the same idea look the same, and which cleaning steps quietly destroy meaning?</p>
  </div>
  <p><strong>Normalisation</strong> is the cleaning done before counting, so that one idea always looks like one token. The classic pipeline:</p>
  <div class="flow"><span>"Spicy paneer roll was GREAT!!"</span><span>lowercase</span><span>tokenize</span><span>drop stopwords?</span><span>stem or lemmatize?</span></div>
  <ul>
    <li><strong>Lowercase</strong>: "GREAT" → "great". Almost always safe for counting models.</li>
    <li><strong>Stopwords</strong>: very common words with little meaning on their own ("the", "was", "is"). Dropping them shrinks the vocabulary.</li>
    <li><strong>Stemming</strong>: chop endings with fixed rules (the Porter stemmer): fast, sometimes produces non-words.</li>
    <li><strong>Lemmatization</strong>: look the word up in a dictionary (WordNet) with its part of speech and return the real base form: slower, correct.</li>
  </ul>
<div class="fx" data-lang="py">from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
clean = [re.findall(r"[a-z]+", r.lower()) for r in reviews]      # lowercase, then tokenize
for toks in clean:
    print(toks)
print("stopwords among them:", sorted({t for toks in clean for t in toks} &amp; ENGLISH_STOP_WORDS))
for text in ["curry was too hot", "the roll was not too spicy"]:
    print(f"{text!r:30} -&gt;", [t for t in text.split() if t not in ENGLISH_STOP_WORDS])</div>
  <div class="fx" data-lang="text">['spicy', 'paneer', 'roll', 'was', 'great']
['mild', 'chicken', 'wrap', 'was', 'good']
['curry', 'was', 'too', 'hot']
['chai', 'was', 'too', 'hot']
stopwords among them: ['too', 'was']
'curry was too hot'            -&gt; ['curry', 'hot']
'the roll was not too spicy'   -&gt; ['roll', 'spicy']</div>
  <p>Lowercasing first means the regex only needs <code>[a-z]</code>. The four cleaned reviews are the version used for the rest of the note. scikit-learn's built-in English stopword list contains "was" and "too", and also "not". Look at the last line: the complaint "the roll was <em>not too</em> spicy" becomes just "roll spicy", which reads as the opposite. That is the most common silent bug in sentiment work.</p>
<div class="fx" data-lang="py">from nltk.stem import PorterStemmer, WordNetLemmatizer      # WordNet data via nltk.download("wordnet")
stem, lemma = PorterStemmer(), WordNetLemmatizer()
for w, pos in [("spicy", "a"), ("spiciest", "a"), ("rolls", "n"), ("ordered", "v"),
               ("deliveries", "n"), ("better", "a"), ("was", "v")]:
    print(f"{w:11s} stem: {stem.stem(w):10s} lemma: {lemma.lemmatize(w, pos)}")</div>
  <div class="fx" data-lang="text">spicy       stem: spici      lemma: spicy
spiciest    stem: spiciest   lemma: spicy
rolls       stem: roll       lemma: roll
ordered     stem: order      lemma: order
deliveries  stem: deliveri   lemma: delivery
better      stem: better     lemma: good
was         stem: wa         lemma: be</div>
  <p>The second argument to <code>lemmatize</code> is the part of speech ("a" adjective, "n" noun, "v" verb); the lemmatizer needs it to know that "better" is the adjective whose base is "good" and "was" is a form of "be". The stemmer knows no dictionary: it turns "spicy" into the non-word "spici" and "deliveries" into "deliveri", leaves "spiciest" alone, and cannot connect "better" to "good". Its output is still useful for counting, because "spici" is consistent.</p>
  <table class="tbl">
    <tr><th></th><th>Stemming</th><th>Lemmatization</th></tr>
    <tr><td>How</td><td>Rule-based suffix chopping</td><td>Dictionary lookup + part of speech</td></tr>
    <tr><td>spiciest</td><td>spiciest (missed)</td><td>spicy</td></tr>
    <tr><td>deliveries</td><td>deliveri (non-word)</td><td>delivery</td></tr>
    <tr><td>Speed</td><td>Very fast</td><td>Slower; needs POS tags</td></tr>
    <tr><td>Use for</td><td>Search indexes, topic counts</td><td>When the base word must be real (NER, parsing)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Stemming is a vegetable chopper with one blade: fast, sometimes cuts in the wrong place. Lemmatization is a chef who checks the recipe book before cutting.</p>
  </div>
  <h3>Why modern models skip most of this</h3>
  <p>A Transformer's subword tokenizer already maps "spicy", "spicier" and "spiciest" to pieces sharing "spic", and the model learns from billions of sentences how case, endings and small words change meaning. Removing "not" or "too" would throw away exactly the signal it needs. So for Transformers you pass raw text (at most fixing encoding problems); classic normalisation is for counting models like the ones in the next two sections.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Normalisation</strong>: transformations that map different surface forms of the same word to one token. <strong>Stopwords</strong>: very frequent function words often removed before counting. <strong>Stem</strong>: rule-chopped base (may not be a word). <strong>Lemma</strong>: dictionary base form.</p></div>
  <div class="callout trap"><span class="label">Trap: leakage</span>
    <p>The vocabulary and, in section 05, the IDF weights are learned from data. Learn them from the training reviews only. Fitting them on all reviews lets the test set influence the model before it is tested.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Bag of words.</b> We now have clean, consistent tokens: R3 is [curry, was, too, hot]. But a model still needs one vector of numbers per review. How do four tokens become a fixed-length vector?</div>

  <h2 id="nl-bow"><span class="num">04</span>Bag of Words</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>R3 has 4 tokens and R1 has 5. A model needs every review as a vector of the <em>same</em> length. What is the simplest way to turn a list of tokens into such a vector?</p>
  </div>
  <p>Make one column for every word in the vocabulary, and for each review write how many times each word appears. This table is the <strong>bag of words (BoW)</strong>: order is thrown away, only counts remain. Our four cleaned reviews use 13 different words, so every review becomes 13 numbers. By hand, R3 "curry was too hot" has a 1 under curry, was, too and hot and 0 everywhere else.</p>
<div class="fx" data-lang="py">from sklearn.feature_extraction.text import CountVectorizer
docs = [" ".join(t) for t in clean]          # "spicy paneer roll was great", ...
bow = CountVectorizer()
X = bow.fit_transform(docs)
print(list(bow.get_feature_names_out()))
print(X.toarray())</div>
  <div class="fx" data-lang="text">['chai', 'chicken', 'curry', 'good', 'great', 'hot', 'mild', 'paneer', 'roll', 'spicy', 'too', 'was', 'wrap']
[[0 0 0 0 1 0 0 1 1 1 0 1 0]
 [0 1 0 1 0 0 1 0 0 0 0 1 1]
 [0 0 1 0 0 1 0 0 0 0 1 1 0]
 [1 0 0 0 0 1 0 0 0 0 1 1 0]]</div>
  <p><code>fit_transform</code> does two things: <em>fit</em> learns the vocabulary (13 words, sorted alphabetically: chai is column 0, wrap is column 12), <em>transform</em> counts. The result is a 4 × 13 matrix; R3 is row 3: ones under curry, hot, too and was. Check it against the hand version.</p>
  <table class="tbl">
    <tr><th>review</th><th>chai</th><th>chicken</th><th>curry</th><th>good</th><th>great</th><th>hot</th><th>mild</th><th>paneer</th><th>roll</th><th>spicy</th><th>too</th><th>was</th><th>wrap</th></tr>
    <tr><td>R1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td><td>0</td><td>1</td><td>0</td></tr>
    <tr><td>R2</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td></tr>
    <tr><td>R3</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td></tr>
    <tr><td>R4</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tip every word of a review into a bag and count what is inside. You lose the sentence but know which words appeared and how often, like judging a dish by its ingredient list.</p>
  </div>
  <p>Now we can compare reviews with arithmetic. The <strong>dot product</strong> of two count rows (multiply column by column, add up) counts shared words. By hand: R1 · R2 = 1 (they share only "was"), R3 · R4 = 3 (was, too, hot). So by counts, the two different complaints R3 and R4 look three times more alike than the two happy wrap reviews R1 and R2.</p>
<div class="fx" data-lang="py">C = X.toarray()
print("shared-word counts (dot products):")
print(C @ C.T)
print("column totals:", {w: int(n) for w, n in zip(bow.get_feature_names_out(), C.sum(axis=0))})</div>
  <div class="fx" data-lang="text">shared-word counts (dot products):
[[5 1 1 1]
 [1 5 1 1]
 [1 1 4 3]
 [1 1 3 4]]
column totals: {'chai': 1, 'chicken': 1, 'curry': 1, 'good': 1, 'great': 1, 'hot': 2, 'mild': 1, 'paneer': 1, 'roll': 1, 'spicy': 1, 'too': 2, 'was': 4, 'wrap': 1}</div>
  <p><code>C @ C.T</code> is every review dotted with every review: entry (i, j) is the number of shared words, and the diagonal is each review's own length. The column totals show the real problem: <strong>"was" is in all four reviews</strong>. It adds 1 to every single comparison while saying nothing about any dish. With real reviews, "the", "was", "and" dominate every count vector.</p>
  <h3>N-grams: keeping a little order</h3>
  <p>The bag also throws away order. "not too spicy" (a compliment for a mild dish) and "too spicy, not good" (a complaint) contain the same three words. The fix is to count neighbouring pairs as extra features: a pair is a <strong>bigram</strong>, and n consecutive words is an <strong>n-gram</strong>.</p>
<figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <text x="10" y="22" class="tm">unigrams</text>
    <rect x="90" y="8" width="60" height="22" rx="4" class="fs"/><text x="120" y="23" text-anchor="middle">was</text>
    <rect x="160" y="8" width="60" height="22" rx="4" class="fr sr"/><text x="190" y="23" text-anchor="middle">not</text>
    <rect x="230" y="8" width="60" height="22" rx="4" class="fs"/><text x="260" y="23" text-anchor="middle">too</text>
    <rect x="300" y="8" width="60" height="22" rx="4" class="fr sr"/><text x="330" y="23" text-anchor="middle">spicy</text>
    <text x="380" y="23" class="tm">"spicy" pulls towards complaint</text>
    <text x="10" y="66" class="tm">bigrams</text>
    <rect x="90" y="52" width="120" height="22" rx="4" class="fs"/><text x="150" y="67" text-anchor="middle">was not</text>
    <rect x="160" y="80" width="120" height="22" rx="4" class="fs"/><text x="220" y="95" text-anchor="middle">not too</text>
    <rect x="230" y="52" width="130" height="22" rx="4" class="fg sg"/><text x="295" y="67" text-anchor="middle">too spicy</text>
    <text x="380" y="67" class="tm">pairs carry local order</text>
  </svg><figcaption>"the roll was not too spicy": unigrams lose the "not too"; bigrams keep "not too" as its own feature.</figcaption></figure>
<div class="fx" data-lang="py">bi = CountVectorizer(ngram_range=(1, 2)).fit(docs + ["roll was not too spicy"])
print(len(bi.get_feature_names_out()), "features with bigrams vs", len(bow.get_feature_names_out()), "without")
print([f for f in bi.get_feature_names_out() if " " in f][:8])</div>
  <div class="fx" data-lang="text">29 features with bigrams vs 13 without
['chai was', 'chicken wrap', 'curry was', 'mild chicken', 'not too', 'paneer roll', 'roll was', 'spicy paneer']</div>
  <p><code>ngram_range=(1, 2)</code> means "single words and pairs". With one extra review the feature count more than doubles. That is the cost: the vocabulary explodes, most n-grams are rare, and a test review's bigrams are often never seen in training. Old systems patched this with <strong>smoothing</strong> (giving unseen n-grams a small count); neural models fixed it properly by letting similar words share what they learn (section 06).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Bag of words</strong>: a document represented by the count of each vocabulary word, ignoring order. The matrix is <strong>sparse</strong>: with a real 50,000-word vocabulary, a 10-word review has 49,990 zeros. <strong>N-gram</strong>: n consecutive tokens used as one feature.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>BoW sees "dog bites man" and "man bites dog", or "roll late, chai fine" and "chai late, roll fine", as identical. Bigrams help only locally. And the counts reward frequent filler words, as "was" just showed.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: TF-IDF.</b> Counts treat every word as equally important, so "was", present in every review, inflates every comparison. How do we weight a word by how much it tells us about <em>this</em> review?</div>

  <h2 id="nl-tfidf"><span class="num">05</span>TF-IDF</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"was" appears in all four reviews and "curry" in only one. Intuitively "curry" tells you much more about R3. How do we turn "rare across reviews = informative" into a number?</p>
  </div>
  <p>Weight each count by how rare the word is across the whole collection:</p>
  <ul>
    <li><strong>TF</strong> (term frequency): how many times the word appears in this review (the BoW count).</li>
    <li><strong>IDF</strong> (inverse document frequency): <code>ln(N / df)</code>, where N is the number of reviews and df is how many contain the word. A word in every review gets ln 1 = 0; a word in one review out of four gets ln 4.</li>
    <li><strong>TF-IDF = TF × IDF</strong>: high only when the word is frequent here and rare elsewhere.</li>
  </ul>
  <h3>By hand on the four reviews</h3>
  <p>N = 4. "was" is in 4 reviews: IDF = ln(4/4) = <strong>0</strong>. "too" and "hot" are in 2: IDF = ln(4/2) = ln 2 = <strong>0.693</strong>. Every other word is in 1: IDF = ln 4 = <strong>1.386</strong>. Each word appears once per review, so TF-IDF = IDF:</p>
  <table class="tbl">
    <tr><th>review</th><th>vector (non-zero entries)</th><th>length √(Σ x²)</th></tr>
    <tr><td>R1</td><td>spicy 1.386, paneer 1.386, roll 1.386, great 1.386, was 0</td><td>√(4 × 1.921) = 2.773</td></tr>
    <tr><td>R2</td><td>mild 1.386, chicken 1.386, wrap 1.386, good 1.386, was 0</td><td>2.773</td></tr>
    <tr><td>R3</td><td>curry 1.386, too 0.693, hot 0.693, was 0</td><td>√(1.921 + 0.480 + 0.480) = 1.698</td></tr>
    <tr><td>R4</td><td>chai 1.386, too 0.693, hot 0.693, was 0</td><td>1.698</td></tr>
  </table>
  <p>Now the dot products. R3 · R4 = too (0.693 × 0.693) + hot (0.693 × 0.693) = 0.480 + 0.480 = <strong>0.961</strong>; "was" adds 0 × 0. Divide by both lengths (1.698 × 1.698 = 2.882) to get a score that ignores review length (this is cosine similarity, section 09): 0.961 / 2.882 = <strong>0.333</strong>, down from 0.75 with raw counts. And R1 · R2: the only shared word is "was", whose weight is 0, so R1 · R2 = <strong>0</strong>.</p>
<div class="fx" data-lang="py">import numpy as np
N = len(clean)
vocab13 = list(bow.get_feature_names_out())
df = C.astype(bool).sum(axis=0)                  # in how many reviews does each word appear?
idf = np.log(N / df)                             # textbook IDF, natural log
for w, d, i in zip(vocab13, df, idf):
    print(f"{w:8s} df={d}  idf={i:.3f}")
T = C * idf                                      # TF x IDF, every review at once
unit = T / np.linalg.norm(T, axis=1, keepdims=True)
print("cosine matrix:\\n", (unit @ unit.T).round(3))</div>
  <div class="fx" data-lang="text">chai     df=1  idf=1.386
chicken  df=1  idf=1.386
curry    df=1  idf=1.386
good     df=1  idf=1.386
great    df=1  idf=1.386
hot      df=2  idf=0.693
mild     df=1  idf=1.386
paneer   df=1  idf=1.386
roll     df=1  idf=1.386
spicy    df=1  idf=1.386
too      df=2  idf=0.693
was      df=4  idf=0.000
wrap     df=1  idf=1.386
cosine matrix:
 [[1.    0.    0.    0.   ]
 [0.    1.    0.    0.   ]
 [0.    0.    1.    0.333]
 [0.    0.    0.333 1.   ]]</div>
  <p><code>C.astype(bool).sum(axis=0)</code> turns counts into "present / absent" and adds down each column: that is df. <code>C * idf</code> multiplies each column by its IDF (NumPy broadcasts the 13 IDF values across the 4 rows). Dividing each row by its length and multiplying the matrix by its transpose gives all pairwise cosines. Row 3, column 4 is 0.333 and row 1, column 2 is 0, exactly the hand values.</p>
  <h3>The library version is different on purpose</h3>
<div class="fx" data-lang="py">from sklearn.feature_extraction.text import TfidfVectorizer
tf = TfidfVectorizer()                           # defaults: smooth_idf=True, norm="l2"
Tsk = tf.fit_transform(docs)
print({w: float(v) for w, v in zip(tf.get_feature_names_out(), tf.idf_.round(3))})
print("R3:", {w: float(round(v, 3)) for w, v in zip(tf.get_feature_names_out(), Tsk.toarray()[2]) if v})
print("cos(R3, R4) =", round((Tsk[2] @ Tsk[3].T).toarray()[0, 0], 3),
      " cos(R1, R2) =", round((Tsk[0] @ Tsk[1].T).toarray()[0, 0], 3))</div>
  <div class="fx" data-lang="text">{'chai': 1.916, 'chicken': 1.916, 'curry': 1.916, 'good': 1.916, 'great': 1.916, 'hot': 1.511, 'mild': 1.916, 'paneer': 1.916, 'roll': 1.916, 'spicy': 1.916, 'too': 1.511, 'was': 1.0, 'wrap': 1.916}
R3: {'curry': 0.631, 'hot': 0.497, 'too': 0.497, 'was': 0.329}
cos(R3, R4) = 0.602  cos(R1, R2) = 0.064</div>
  <p>scikit-learn uses a <em>smoothed</em> IDF, <code>ln((1 + N) / (1 + df)) + 1</code>, as if one extra review contained every word, then adds 1. So "was" gets 1.0 instead of 0, words in one review get ln(5/2) + 1 = 1.916, "too" and "hot" ln(5/3) + 1 = 1.511. Rows are then scaled to length 1 (<code>norm="l2"</code>), so R3's entries are its weights divided by its length. Because "was" no longer counts as zero, cos(R1, R2) is 0.064 rather than 0, and cos(R3, R4) rises to 0.602. To silence filler words in practice, add <code>stop_words</code> (minding the "not" trap) or <code>max_df=0.9</code> (drop words in more than 90% of reviews).</p>
  <div class="callout pred"><span class="label">Predict first</span>
    <p>A fifth review "great chai" is added. What happens to the IDF of "great", and to cos(R1, R2)?</p>
    <p>"great" now has df = 2, so its textbook IDF falls from ln 4 to ln(5/2) = 0.916. cos(R1, R2) stays 0: R2 still has no word in common with R1 except "was".</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <line x1="90" y1="10" x2="90" y2="160" stroke="currentColor" opacity="0.4"/>
    <text x="80" y="27" text-anchor="end">curry</text><rect x="90" y="14" width="277" height="18" class="fg sg"/><text x="375" y="27">1.386</text><text x="430" y="27" class="tg">only in R3</text>
    <text x="80" y="57" text-anchor="end">too</text><rect x="90" y="44" width="139" height="18" class="fb sb"/><text x="237" y="57">0.693</text>
    <text x="80" y="87" text-anchor="end">hot</text><rect x="90" y="74" width="139" height="18" class="fb sb"/><text x="237" y="87">0.693</text><text x="290" y="72" class="tm">in R3 and R4</text>
    <text x="80" y="117" text-anchor="end">was</text><rect x="90" y="104" width="2" height="18" class="fr sr"/><text x="100" y="117">0</text><text x="140" y="117" class="tr">in every review: ln(4/4) = 0</text>
    <text x="90" y="150" class="tm">R3 "curry was too hot", textbook TF-IDF weights</text>
  </svg><figcaption>TF-IDF on R3 by hand: the dish word dominates, the shared complaint words count half, filler counts nothing.</figcaption></figure>
  <p><strong>BM25</strong> is TF-IDF with two practical fixes: the 10th repeat of a word adds much less than the 1st (TF saturates), and long documents are penalised. It is still the default keyword score in search engines and the keyword half of hybrid search in <a class="xref" data-note="vectordb">Vector DBs</a>. Content-based recommenders build item profiles the same way (<a class="xref" data-note="ml_recsys">Recommender Systems</a>).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>TF-IDF</strong>(w, d) = tf(w, d) × ln(N / df(w)): the count of word w in document d, times the log of (number of documents / number containing w). High for words frequent in d and rare in the collection.</p></div>
  <div class="callout trap"><span class="label">Trap: synonyms are strangers</span>
    <p>Every word is its own axis, at right angles to every other. "great" and "good" are as unrelated as "great" and "chai". That is why R1 and R2, two happy wrap reviews, score exactly 0, and why a customer searching "fiery kathi" finds nothing labelled "spicy roll".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Word2Vec.</b> TF-IDF knows which words are <em>important</em> but nothing about which words are <em>similar</em>: great ⟂ good, spicy ⟂ fiery, roll ⟂ wrap. How can a program learn that two different words mean nearly the same thing?</div>

  <h2 id="nl-w2v"><span class="num">06</span>Word Embeddings: Word2Vec</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Nobody will hand-label that "great" ≈ "good" ≈ "tasty" for every word in every language. Can a program discover from raw reviews alone that two words mean similar things, and store that as numbers?</p>
  </div>
  <p>The key idea is old linguistics: <strong>a word is known by the company it keeps</strong>. In Biteful reviews "great" and "good" appear in the same slots ("the roll was ___ and …", "___ chai, will order again"). If we give every word a short list of numbers and train those numbers to predict the words around it, words used in the same slots are forced towards similar numbers. Such a learned list is a <strong>word embedding</strong>: dense (every number used, typically 50–300 of them) instead of sparse (13 or 50,000 columns, nearly all zero). <strong>Word2Vec</strong> (2013) made this fast enough for billions of words.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You can guess what "kathi" means without a dictionary if you keep reading "the paneer kathi was spicy", "chicken kathi arrived cold", "egg kathi, never again": it sits exactly where "roll" and "wrap" sit. Word2Vec is that guessing, done with arithmetic.</p>
  </div>
  <h3>Step 1: training pairs, traced on R3</h3>
  <p>Word2Vec never sees labels. It manufactures its own training examples from a sliding window. With window = 1 (one word either side) on R3 "curry was too hot":</p>
  <table class="tbl">
    <tr><th>Centre word</th><th>Skip-gram pairs (centre → each neighbour)</th><th>CBOW example (neighbours → centre)</th></tr>
    <tr><td>curry</td><td>(curry, was)</td><td>[was] → curry</td></tr>
    <tr><td>was</td><td>(was, curry), (was, too)</td><td>[curry, too] → was</td></tr>
    <tr><td>too</td><td>(too, was), (too, hot)</td><td>[was, hot] → too</td></tr>
    <tr><td>hot</td><td>(hot, too)</td><td>[too] → hot</td></tr>
  </table>
<div class="fx" data-lang="py">def skipgram_pairs(tokens, window=1):
    return [(c, tokens[j]) for i, c in enumerate(tokens)
            for j in range(max(0, i - window), min(len(tokens), i + window + 1)) if j != i]

def cbow_examples(tokens, window=1):
    return [([tokens[j] for j in range(max(0, i - window), min(len(tokens), i + window + 1)) if j != i], c)
            for i, c in enumerate(tokens)]

print(skipgram_pairs(clean[2]))
print(cbow_examples(clean[2]))</div>
  <div class="fx" data-lang="text">[('curry', 'was'), ('was', 'curry'), ('was', 'too'), ('too', 'was'), ('too', 'hot'), ('hot', 'too')]
[(['was'], 'curry'), (['curry', 'too'], 'was'), (['was', 'hot'], 'too'), (['too'], 'hot')]</div>
  <p>The two list comprehensions are the table: for each position i, take every j within <code>window</code> of i except i itself. <strong>Skip-gram</strong> turns each (centre, neighbour) into one example "given centre, predict neighbour"; <strong>CBOW</strong> (continuous bag of words) averages the neighbours' vectors and predicts the centre. Skip-gram makes more examples per word, which helps rare words; CBOW is faster and smooths frequent words.</p>
  <h3>Step 2: one SGD step with negative sampling, by hand</h3>
  <p>The obvious model, "score every vocabulary word and softmax", must touch all 50,000+ words for every pair. <strong>Negative sampling</strong> replaces it with yes/no questions: is (hot, too) a real pair? (yes) Is (hot, great), with "great" drawn at random, a real pair? (probably not). Each word has two vectors: an input vector v (used when it is the centre) and an output vector u (used when it is the neighbour). The model's belief that a pair is real is σ(v · u), where σ(x) = 1 / (1 + e<sup>−x</sup>) squashes any score into a probability (<a class="xref" data-note="st_probability">Probability</a>).</p>
  <p>Tiny 2-number vectors so it fits on paper: v<sub>hot</sub> = [0.5, 0.5], u<sub>too</sub> = [0.2, −0.2] (real neighbour), u<sub>great</sub> = [0.4, 0.0] (random negative), learning rate η = 1.</p>
  <ol>
    <li><strong>Scores.</strong> v<sub>hot</sub> · u<sub>too</sub> = 0.1 − 0.1 = 0, so σ = <strong>0.5</strong>: the model is unsure the real pair is real. v<sub>hot</sub> · u<sub>great</sub> = 0.2 + 0 = 0.2, so σ(0.2) = <strong>0.550</strong>: it leans towards calling the fake pair real.</li>
    <li><strong>Loss</strong> = −ln σ(real score) − ln(1 − σ(fake score)) = −ln 0.5 − ln 0.450 = 0.693 + 0.798 = <strong>1.491</strong>.</li>
    <li><strong>Gradients</strong> (from the sigmoid's derivative). For the real pair the "error" is σ − 1 = −0.5; for the fake pair it is σ − 0 = 0.550. ∂L/∂u<sub>too</sub> = −0.5 × v<sub>hot</sub> = [−0.25, −0.25]. ∂L/∂u<sub>great</sub> = 0.550 × v<sub>hot</sub> = [0.275, 0.275]. ∂L/∂v<sub>hot</sub> = −0.5 × u<sub>too</sub> + 0.550 × u<sub>great</sub> = [−0.1 + 0.220, 0.1 + 0] = [0.120, 0.100].</li>
    <li><strong>Update</strong> (subtract η × gradient). v<sub>hot</sub> = [0.380, 0.400]; u<sub>too</sub> = [0.45, 0.05]; u<sub>great</sub> = [0.125, −0.275].</li>
    <li><strong>Check.</strong> New real score 0.380 × 0.45 + 0.400 × 0.05 = 0.191 (σ = 0.548, up); new fake score 0.0475 − 0.110 = −0.0625 (σ = 0.484, down). Loss falls to about 1.26. "hot" moved towards "too" and away from "great".</li>
  </ol>
<div class="fx" data-lang="py">sig = lambda x: 1 / (1 + np.exp(-x))
v_hot = np.array([0.5, 0.5]); u_too = np.array([0.2, -0.2]); u_great = np.array([0.4, 0.0]); lr = 1.0

def loss(v, up, un):
    return -np.log(sig(v @ up)) - np.log(1 - sig(v @ un))

print("before: p(real)=%.3f p(fake)=%.3f loss=%.3f" % (sig(v_hot @ u_too), sig(v_hot @ u_great), loss(v_hot, u_too, u_great)))
e_pos, e_neg = sig(v_hot @ u_too) - 1, sig(v_hot @ u_great)        # the two "errors"
g_v = e_pos * u_too + e_neg * u_great
g_up, g_un = e_pos * v_hot, e_neg * v_hot
v_hot, u_too, u_great = v_hot - lr * g_v, u_too - lr * g_up, u_great - lr * g_un
print("grad v_hot", g_v.round(3), "-&gt; v_hot", v_hot.round(3))
print("after:  p(real)=%.3f p(fake)=%.3f loss=%.3f" % (sig(v_hot @ u_too), sig(v_hot @ u_great), loss(v_hot, u_too, u_great)))</div>
  <div class="fx" data-lang="text">before: p(real)=0.500 p(fake)=0.550 loss=1.491
grad v_hot [0.12 0.1 ] -&gt; v_hot [0.38 0.4 ]
after:  p(real)=0.548 p(fake)=0.484 loss=1.265</div>
  <p>The code is the five hand steps. <code>e_pos</code> and <code>e_neg</code> are the errors; each gradient is error × the other vector; the update moves all three vectors at once. Training is this step repeated millions of times over every pair, with a handful of random negatives per pair (drawn more often for frequent words). After training we keep the input vectors v as the word embeddings and usually discard u.</p>
  <h3>Step 3: train it on Biteful reviews</h3>
  <p>Four reviews are far too few to learn anything, and no pretrained vectors could be downloaded here. So we generate 4,000 synthetic reviews from templates that mimic how customers write (dish, filling, taste and temperature words, praise and complaints). The generator deliberately uses "hot" in two senses: as a taste word next to spicy/fiery, and as a temperature word next to warm/steaming. This corpus is reused by the Transformers and Vector DB notes.</p>
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
               epochs=20, workers=1, seed=1)
print("vocabulary:", len(w2v.wv), "words, vectors of", w2v.wv.vector_size, "numbers")
print("great -&gt;", np.round(w2v.wv["great"][:6], 2), "...")
for w in ["great", "spicy", "roll", "chai"]:
    print(f"{w:6s} nearest:", [(n, round(s, 2)) for n, s in w2v.wv.most_similar(w, topn=3)])</div>
  <div class="fx" data-lang="text">vocabulary: 49 words, vectors of 16 numbers
great -&gt; [ 0.18 -0.24 -0.45  1.38  0.51  0.3 ] ...
great  nearest: [('tasty', 1.0), ('delicious', 0.99), ('amazing', 0.99)]
spicy  nearest: [('fiery', 1.0), ('hot', 0.86), ('light', 0.72)]
roll   nearest: [('wrap', 1.0), ('kathi', 0.99), ('biryani', 0.79)]
chai   nearest: [('tea', 1.0), ('soup', 1.0), ('coffee', 1.0)]</div>
  <p>Arguments: <code>vector_size=16</code> numbers per word (tiny vocabulary, so 16 is plenty; real models use 100–300), <code>window=2</code> neighbours each side, <code>sg=1</code> skip-gram, <code>negative=5</code> random negatives per real pair, <code>epochs=20</code> passes over the data, <code>workers=1</code> and <code>seed=1</code> for a repeatable result. The 16 numbers for "great" have no individual meaning; only their relation to other vectors does. And the relations are right: "great" sits next to tasty, delicious, amazing; "roll" next to wrap and kathi; "chai" next to tea and coffee. Nobody told the model any of this. Each word only ever appeared in similar slots.</p>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
    <ellipse cx="130" cy="70" rx="105" ry="48" class="fg"/>
    <circle cx="80" cy="55" r="4" class="tg"/><text x="88" y="59">great</text>
    <circle cx="150" cy="50" r="4" class="tg"/><text x="158" y="54">good</text>
    <circle cx="100" cy="90" r="4" class="tg"/><text x="108" y="94">tasty</text>
    <circle cx="165" cy="85" r="4" class="tg"/><text x="173" y="89">delicious</text>
    <ellipse cx="430" cy="70" rx="100" ry="45" class="fb"/>
    <circle cx="390" cy="55" r="4" class="tb"/><text x="398" y="59">roll</text>
    <circle cx="460" cy="50" r="4" class="tb"/><text x="468" y="54">wrap</text>
    <circle cx="420" cy="90" r="4" class="tb"/><text x="428" y="94">kathi</text>
    <ellipse cx="160" cy="170" rx="110" ry="40" class="fr"/>
    <circle cx="110" cy="160" r="4" class="tr"/><text x="118" y="164">spicy</text>
    <circle cx="180" cy="155" r="4" class="tr"/><text x="188" y="159">fiery</text>
    <ellipse cx="440" cy="170" rx="100" ry="40" class="fs"/>
    <circle cx="410" cy="160" r="4" class="tm"/><text x="418" y="164">warm</text>
    <circle cx="470" cy="185" r="4" class="tm"/><text x="478" y="189">steaming</text>
    <circle cx="300" cy="165" r="6" class="fv" stroke="currentColor"/><text x="300" y="150" text-anchor="middle" font-weight="700">hot</text>
    <text x="300" y="205" text-anchor="middle" class="tm">pulled between two meanings</text>
  </svg><figcaption>A 2-D sketch of the 16-D space: praise words, wrap words, chilli words and temperature words form groups. "hot" is used both ways, so it lands in between.</figcaption></figure>
  <p>Famous property of large Word2Vec models: relations become directions, so king − man + woman lands near queen. With our 49-word corpus the space is too small for reliable analogies, so we do not claim one here.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Word embedding</strong>: a dense vector per word, learned so that words appearing in similar contexts get similar vectors. <strong>Word2Vec</strong>: a shallow network trained on skip-gram (centre → neighbour) or CBOW (neighbours → centre) examples, usually with negative sampling: maximise σ(v<sub>w</sub>·u<sub>c</sub>) for real pairs and 1 − σ(v<sub>w</sub>·u<sub>n</sub>) for random ones.</p></div>
  <div class="callout trap"><span class="label">Trap: similar contexts ≠ same meaning</span>
    <p>Opposites are used in the same slots: "the roll was spicy and great", "the roll was mild and great". So Word2Vec puts spicy and mild close together (cosine 0.71 here, shown in section 09). Embedding similarity means "used alike", which for antonyms is not "means alike". Sentiment and search systems must handle this.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: GloVe.</b> Word2Vec learns from one small window at a time and never looks at corpus-wide statistics directly. Could we instead count every co-occurrence once and fit vectors to those counts?</div>

  <h2 id="nl-glove"><span class="num">07</span>GloVe: Vectors from Global Counts</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Word2Vec walks the corpus window by window, millions of times. All it really needs is how often words appear near each other. Can we count that once, for the whole corpus, and fit vectors directly to the counts?</p>
  </div>
  <p><strong>GloVe</strong> (Global Vectors, 2014) does exactly that. First build a <strong>co-occurrence matrix</strong> X: X<sub>ij</sub> = how often word j appears within the window of word i (closer neighbours count more: 1/distance). Then find vectors w<sub>i</sub> (word) and c<sub>j</sub> (context) and biases so that</p>
  <div class="fx" data-lang="text">w_i · c_j + b_i + b'_j  ≈  log X_ij      for every pair with X_ij &gt; 0</div>
  <p>minimising Σ f(X<sub>ij</sub>) (w<sub>i</sub>·c<sub>j</sub> + b<sub>i</sub> + b'<sub>j</sub> − log X<sub>ij</sub>)², where the weight f(x) = min(1, (x / x<sub>max</sub>)<sup>0.75</sup>) stops very frequent pairs ("the", "was") from dominating. Why logs? Because GloVe's insight is that <em>ratios</em> of co-occurrence carry meaning: P(spicy | curry) / P(spicy | chai) is large, P(warm | curry) / P(warm | chai) is small, and a log turns ratios into differences, which dot products can represent.</p>
  <h3>Counts by hand on R3 and R4</h3>
  <p>Window = 1 on "curry was too hot" and "chai was too hot": pairs (curry, was), (was, too), (too, hot) from R3 and (chai, was), (was, too), (too, hot) from R4. So X<sub>too,hot</sub> = 2, X<sub>was,too</sub> = 2, X<sub>curry,was</sub> = 1, X<sub>chai,was</sub> = 1 (and the same counts in the reverse direction). "curry" and "chai" never co-occur with each other, but both co-occur with "was": the shared context is what will pull their vectors together.</p>
<div class="fx" data-lang="py">vocab = sorted({w for s in reviews for w in s}); idx = {w: i for i, w in enumerate(vocab)}; V = len(vocab)
Xc = np.zeros((V, V))
for s in reviews:                                   # co-occurrence counts, window 2, weight 1/distance
    for i, w in enumerate(s):
        for j in range(max(0, i - 2), min(len(s), i + 3)):
            if j != i:
                Xc[idx[w], idx[s[j]]] += 1.0 / abs(i - j)
print(V, "words;", int((Xc &gt; 0).sum()), "non-zero pairs")
for a, b in [("spicy", "curry"), ("spicy", "chai"), ("warm", "curry"), ("warm", "chai")]:
    print(f"X[{a},{b}] = {Xc[idx[a], idx[b]]:.1f}")</div>
  <div class="fx" data-lang="text">49 words; 848 non-zero pairs
X[spicy,curry] = 7.0
X[spicy,chai] = 0.0
X[warm,curry] = 0.0
X[warm,chai] = 16.0</div>
  <p>The triple loop is the hand count, run on all 4,000 synthetic reviews with window 2. The four printed counts are the ratio idea in numbers: "spicy" appears near "curry" a lot and near "chai" never; "warm" is the reverse. Now fit the vectors with AdaGrad (gradient descent with a per-parameter step size):</p>
<div class="fx" data-lang="py">rng = np.random.default_rng(0); d = 16
W = rng.normal(scale=0.1, size=(V, d)); Cv = rng.normal(scale=0.1, size=(V, d))
bw, bc = np.zeros(V), np.zeros(V)
i_, j_ = np.nonzero(Xc); x = Xc[i_, j_]
f = np.minimum(1, (x / 10) ** 0.75); logx = np.log(x)          # weights f(x), targets log x
hist = [np.ones_like(W), np.ones_like(Cv), np.ones(V), np.ones(V)]
for ep in range(500):
    diff = (W[i_] * Cv[j_]).sum(1) + bw[i_] + bc[j_] - logx   # prediction - log count
    g = f * diff
    dW = np.zeros_like(W);  np.add.at(dW, i_, g[:, None] * Cv[j_])
    dC = np.zeros_like(Cv); np.add.at(dC, j_, g[:, None] * W[i_])
    grads = [dW, dC, np.bincount(i_, g, V), np.bincount(j_, g, V)]
    for P, G, H in zip([W, Cv, bw, bc], grads, hist):
        H += G ** 2; P -= 0.05 * G / np.sqrt(H)                # AdaGrad step
    if ep in (0, 100, 499):
        print(f"epoch {ep:3d}  weighted squared error {0.5 * np.sum(f * diff ** 2):8.1f}")
G = W + Cv; G -= G.mean(0); G /= np.linalg.norm(G, axis=1, keepdims=True)
for a, b in [("great", "good"), ("roll", "wrap"), ("great", "awful"), ("spicy", "mild")]:
    print(f"GloVe cos({a}, {b}) = {G[idx[a]] @ G[idx[b]]:.3f}")</div>
  <div class="fx" data-lang="text">epoch   0  weighted squared error   5493.8
epoch 100  weighted squared error     49.9
epoch 499  weighted squared error      8.4
GloVe cos(great, good) = 0.850
GloVe cos(roll, wrap) = 0.955
GloVe cos(great, awful) = 0.544
GloVe cos(spicy, mild) = 0.279</div>
  <p><code>diff</code> is prediction minus log count for every non-zero pair at once; <code>g = f * diff</code> is the gradient of the weighted squared error with respect to the prediction; <code>np.add.at</code> adds each pair's gradient into the right rows of W and Cv. The error falls from thousands to single digits. As in the GloVe paper, the final vector is word + context vector; we also subtract the mean vector, which removes a direction shared by all words in such a tiny corpus. Result: "great" is closer to "good" (0.85) than to "awful" (0.54), and roll ≈ wrap. On a 49-word corpus GloVe separates a little less cleanly than Word2Vec; on billions of words the two are about equally good.</p>
  <table class="tbl">
    <tr><th></th><th>Word2Vec</th><th>GloVe</th></tr>
    <tr><td>Learns from</td><td>local windows, one pair at a time</td><td>the global co-occurrence matrix, counted once</td></tr>
    <tr><td>Objective</td><td>predict neighbour (σ, negative sampling)</td><td>weighted least squares on log counts</td></tr>
    <tr><td>Strength</td><td>streams huge corpora</td><td>uses corpus-wide statistics directly; popular pretrained sets</td></tr>
    <tr><td>Shared weakness</td><td colspan="2">no vector for a word not in the vocabulary; one vector per word</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>GloVe</strong>: word vectors fitted so that w<sub>i</sub>·c<sub>j</sub> + b<sub>i</sub> + b'<sub>j</sub> ≈ log X<sub>ij</sub>, with weight f(X<sub>ij</sub>) capping the influence of very frequent pairs. <strong>Co-occurrence matrix</strong>: X<sub>ij</sub> = (distance-weighted) count of word j in the window around word i.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The co-occurrence matrix is V × V. With a 400,000-word vocabulary that is 160 billion cells; it works only because most are zero and are stored sparsely. Also, GloVe and Word2Vec vectors from different training runs live in different spaces: never compare a vector from one with a vector from another.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: FastText.</b> Both methods have a fixed vocabulary. A customer types "spicyyy" or "paneerwrap", and Word2Vec raises an error: no vector at all. How do we get a vector for a word we never saw?</div>

  <h2 id="nl-fasttext"><span class="num">08</span>FastText: Subwords for Unseen Words</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Real reviews are full of typos and creative spellings: "spicyyy", "chaii", "paneerwrap". Word2Vec and GloVe have no row for them. Can a word's vector be built from its spelling, the way BPE built tokens from pieces?</p>
  </div>
  <p><strong>FastText</strong> (2016) is Word2Vec where each word is represented by the <em>sum</em> of vectors for its character n-grams, plus the whole word. By hand for "spicy" with n = 3: add boundary markers to get "&lt;spicy&gt;", then slide a 3-letter window: <strong>&lt;sp, spi, pic, icy, cy&gt;</strong>, plus the special whole-word token &lt;spicy&gt;. The vector of "spicy" is the sum of those six vectors. A typo like "spicyyy" has the n-grams &lt;sp, spi, pic, icy, cyy, yyy, yy&gt;: four of its pieces already have trained vectors, so its sum lands near "spicy".</p>
<div class="fx" data-lang="py">def char_ngrams(word, n=3):
    w = f"&lt;{word}&gt;"
    return [w[i:i + n] for i in range(len(w) - n + 1)]
print("spicy  :", char_ngrams("spicy"))
print("spicyyy:", char_ngrams("spicyyy"))
print("shared :", sorted(set(char_ngrams("spicy")) &amp; set(char_ngrams("spicyyy"))))</div>
  <div class="fx" data-lang="text">spicy  : ['&lt;sp', 'spi', 'pic', 'icy', 'cy&gt;']
spicyyy: ['&lt;sp', 'spi', 'pic', 'icy', 'cyy', 'yyy', 'yy&gt;']
shared : ['&lt;sp', 'icy', 'pic', 'spi']</div>
  <p>The function adds the &lt; and &gt; markers so that "&lt;sp" (a word <em>starting</em> with sp) differs from "sp" inside a word, then takes every 3-letter slice. Now train FastText on the same reviews with the same settings as Word2Vec, using n-grams of length 3 to 5:</p>
<div class="fx" data-lang="py">from gensim.models import FastText
ft = FastText(reviews, vector_size=16, window=2, min_count=1, sg=1, negative=5,
              epochs=20, workers=1, seed=1, min_n=3, max_n=5)
for typo in ["spicyyy", "chaii", "paneerwrap"]:
    print(f"{typo:11s} in vocab? {typo in ft.wv.key_to_index}  nearest:",
          [(w, round(s, 2)) for w, s in ft.wv.most_similar(typo, topn=3)])
try:
    w2v.wv["spicyyy"]
except KeyError as e:
    print("Word2Vec:", e)</div>
  <div class="fx" data-lang="text">spicyyy     in vocab? False  nearest: [('spicy', 1.0), ('fiery', 1.0), ('hot', 0.82)]
chaii       in vocab? False  nearest: [('chai', 1.0), ('tea', 0.99), ('coffee', 0.99)]
paneerwrap  in vocab? False  nearest: [('curry', 0.92), ('chicken', 0.92), ('paneer', 0.92)]
Word2Vec: "Key 'spicyyy' not present"</div>
  <p>None of the three strings is in the vocabulary, yet FastText returns sensible neighbours: "spicyyy" next to spicy and fiery, "chaii" next to chai and tea. "paneerwrap" (a missing space) is pulled towards dish words. Word2Vec, asked the same question, raises <code>KeyError</code>. FastText also helps languages with many word forms (Hindi, Turkish, Finnish), where most forms are rare.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You have never seen the dish "paneer-tikka-kathi", but you know paneer, tikka and kathi, so you can guess what arrives. FastText guesses a word's meaning from the meaning of its pieces.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>FastText</strong>: a word's vector is the sum of vectors for its character n-grams (with &lt; &gt; boundary markers, typically n = 3–6) and the word itself, trained with the Word2Vec objective. Unseen words get a vector from their n-grams.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Spelling similarity is not meaning similarity: "hot" and "shot", "chai" and "chair" share n-grams. FastText vectors for very short or unrelated look-alike words can be misleading; trust them most for typos and word forms of known words.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Cosine similarity.</b> We now have four ways to turn text into vectors (BoW, TF-IDF, Word2Vec/GloVe, FastText) and have been quoting "similarity" all along. What exactly is it, why not just the dot product, and how do whole reviews compare under each representation?</div>

  <h2 id="nl-cos"><span class="num">09</span>Cosine Similarity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The dot product counted shared words, but a long review shares more words with everything just by being long. How do we measure "pointing the same way" independent of length, and how do R1 vs R2 and R3 vs R4 score under every representation we built?</p>
  </div>
  <p>The dot product a · b = Σ a<sub>i</sub>b<sub>i</sub> grows with the angle between the vectors <em>and</em> with their lengths. Divide out the lengths and only the angle is left:</p>
  <div class="fx" data-lang="text">cos(a, b) = a · b / (‖a‖ ‖b‖)        ‖a‖ = √(Σ aᵢ²)        range −1 … 1</div>
  <p>By hand with a = [3, 4] and b = [6, 8] (same direction, twice as long): a · b = 18 + 32 = 50, ‖a‖ = 5, ‖b‖ = 10, cos = 50 / 50 = <strong>1</strong>. With c = [4, −3]: a · c = 12 − 12 = 0, cos = <strong>0</strong> (at right angles, like "great" and "good" in TF-IDF). 1 = same direction, 0 = unrelated, −1 = opposite. (Vectors, lengths and angles in general: <a class="xref" data-note="m_linalg">Linear Algebra</a>.)</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two customers order the same thali, one a single plate, one for a party of ten. Their orders differ in size but not in taste: cosine says 1. A raw dot product would call the party order "more similar" to everything, just because it is bigger.</p>
  </div>
  <p>Now the payoff: our two pairs of reviews under every representation. For Word2Vec and FastText, a review vector is the average of its word vectors (the simplest sentence vector; the Vector DB note improves on it).</p>
<div class="fx" data-lang="py">def cos(a, b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

def avg_vec(tokens, kv):
    return np.mean([kv[t] for t in tokens], axis=0)

reps = {
    "bag of words": C.astype(float),
    "TF-IDF (textbook)": T,
    "Word2Vec average": np.stack([avg_vec(t, w2v.wv) for t in clean]),
    "FastText average": np.stack([avg_vec(t, ft.wv) for t in clean]),
}
print(f"{'representation':20s} {'R1 vs R2':&gt;9s} {'R3 vs R4':&gt;9s}")
for name, M in reps.items():
    print(f"{name:20s} {cos(M[0], M[1]):9.3f} {cos(M[2], M[3]):9.3f}")
print("word pairs (Word2Vec):", {f"{a}-{b}": round(float(w2v.wv.similarity(a, b)), 3)
      for a, b in [("great", "good"), ("spicy", "mild"), ("great", "awful")]})</div>
  <div class="fx" data-lang="text">representation        R1 vs R2  R3 vs R4
bag of words             0.200     0.750
TF-IDF (textbook)        0.000     0.333
Word2Vec average         0.969     0.944
FastText average         0.967     0.939
word pairs (Word2Vec): {'great-good': 0.985, 'spicy-mild': 0.711, 'great-awful': 0.29}</div>
  <p><code>cos</code> is the formula; <code>avg_vec</code> looks up each token's vector in a trained model (<code>kv</code>) and averages them; the loop prints both pairs for each representation. Read the table as the story so far. Bag of words: R1 vs R2 only 0.2 (the shared "was"), R3 vs R4 0.75. TF-IDF: R1 vs R2 drops to 0, because "was" was zeroed and great ⟂ good. The averaged embeddings finally see R1 and R2 as close (0.969 and 0.967), because great ≈ good, roll ≈ wrap, paneer ≈ chicken in that space. But look at the last column: the same embeddings rate the chilli complaint R3 and the temperature complaint R4 almost as alike (0.944), and even bag of words gives them 0.75. No representation here can tell the two complaints apart (TF-IDF's lower 0.333 only reflects that the nouns differ, not the meaning). The word pairs show the antonym trap from section 06: spicy vs mild is still high.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Cosine similarity</strong>: cos θ = a·b / (‖a‖‖b‖), the cosine of the angle between two vectors; it ignores length. For unit-length vectors it equals the dot product, which is why search systems normalise vectors once and then use fast dot products (<a class="xref" data-note="vectordb">Vector DBs</a>). The same formula finds similar users and items in <a class="xref" data-note="ml_cf">Collaborative Filtering</a>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Cosine values are only comparable within one representation. 0.95 between two averaged-Word2Vec reviews is not "more similar" than 0.52 under TF-IDF; averaged embeddings of a small corpus are all fairly close to each other. Compare rankings, not raw scores, across methods.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The context problem.</b> Embeddings fixed synonyms, but R3 ("curry was too hot", spicy) and R4 ("chai was too hot", temperature) still look nearly identical. The culprit is one word with one vector. Can "hot" mean two things?</div>

  <h2 id="nl-ctx"><span class="num">10</span>The Context Problem</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In R3 "hot" means spicy; in R4 it means high temperature. Biteful needs to route R3 to the kitchen (less chilli) and R4 to packaging (let drinks cool). Every method so far gives "hot" one fixed vector. Where does that vector sit, and what would we need instead?</p>
  </div>
<div class="fx" data-lang="py">print("hot nearest:", [(w, round(s, 2)) for w, s in w2v.wv.most_similar("hot", topn=5)])
for other in ["spicy", "warm"]:
    print(f"cos(hot, {other}) = {w2v.wv.similarity('hot', other):.3f}")
print("cos(spicy, warm) =", round(float(w2v.wv.similarity("spicy", "warm")), 3))
print("same vector in R3 and R4:", np.array_equal(w2v.wv["hot"], w2v.wv["hot"]))</div>
  <div class="fx" data-lang="text">hot nearest: [('fiery', 0.86), ('spicy', 0.86), ('warm', 0.77), ('steaming', 0.76), ('too', 0.64)]
cos(hot, spicy) = 0.857
cos(hot, warm) = 0.765
cos(spicy, warm) = 0.483
same vector in R3 and R4: True</div>
  <p>"hot" is close to both spicy (0.86) and warm (0.77), while spicy and warm are far apart (0.48). The single vector is a <strong>blend</strong> of its two senses, weighted by how often each appeared in training. The last line is trivially true, and that is the point: a lookup table returns the same row whatever sentence the word is in. A <strong>static embedding</strong> cannot serve R3 and R4 at the same time.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <text x="20" y="20">Static: one "hot"</text><text x="320" y="20">Contextual: one per sentence</text>
    <line x1="300" y1="10" x2="300" y2="190" stroke="currentColor" opacity="0.25"/>
    <circle cx="50" cy="60" r="4" class="tr"/><text x="58" y="64" class="tm">spicy</text>
    <circle cx="80" cy="90" r="4" class="tr"/><text x="88" y="94" class="tm">fiery</text>
    <circle cx="220" cy="150" r="4" class="tb"/><text x="228" y="154" class="tm">warm</text>
    <circle cx="200" cy="175" r="4" class="tb"/><text x="208" y="179" class="tm">steaming</text>
    <circle cx="140" cy="120" r="7" class="fv" stroke="currentColor"/><text x="152" y="116">hot (blend)</text>
    <circle cx="340" cy="60" r="4" class="tr"/><text x="348" y="64" class="tm">spicy</text>
    <circle cx="370" cy="90" r="4" class="tr"/><text x="378" y="94" class="tm">fiery</text>
    <circle cx="410" cy="72" r="7" class="fr sr"/><text x="422" y="76">hot in "curry was too hot"</text>
    <circle cx="520" cy="150" r="4" class="tb"/><text x="528" y="154" class="tm">warm</text>
    <circle cx="500" cy="175" r="4" class="tb"/><text x="508" y="179" class="tm">steaming</text>
    <circle cx="470" cy="160" r="7" class="fb sb"/><text x="330" y="140">hot in "chai was too hot"</text>
  </svg><figcaption>Left: a static model gives "hot" one point between the two senses. Right: a contextual model computes a different vector for each use, next to its real meaning.</figcaption></figure>
  <p>The classic textbook example is "bank" (river bank vs bank account); Biteful's is "hot", and "cold" has the same issue ("cold coffee" is a dish, "coffee arrived cold" is a complaint). What we need is a vector computed <em>after reading the sentence</em>: "hot" next to "curry" should move towards spicy, next to "chai" towards warm. That is a <strong>contextual embedding</strong>.</p>
  <ul>
    <li><strong>ELMo</strong> (2018) ran bidirectional LSTMs (<a class="xref" data-note="dl_rnns">RNNs</a>: read the sentence forwards and backwards) and used their hidden states as word vectors. Contextual, but sequential and forgetful over long text.</li>
    <li><strong>BERT</strong> (2018) used a Transformer encoder: every word looks at every other word at once through <a class="xref" data-note="dl_attention">attention</a>, so "hot" can pull information directly from "curry" or "chai". That is the subject of <a class="xref" data-note="transformers">Transformers</a>, which starts from exactly these two reviews.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Static embedding</strong>: one vector per vocabulary word, the same in every sentence (Word2Vec, GloVe, FastText). <strong>Contextual embedding</strong>: a vector for each word <em>occurrence</em>, computed from the surrounding sentence (ELMo, BERT, every LLM).</p></div>
  <div class="callout trap"><span class="label">Trap: BERT's [CLS] vector as a sentence embedding</span>
    <p>BERT prepends a [CLS] token whose vector people often use as "the sentence vector". Raw BERT was never trained to make that vector good for cosine similarity, and it often loses to plain averaging. Use a model trained for sentence similarity (Sentence-BERT and successors), covered in <a class="xref" data-note="vectordb">Vector DBs</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Build a review classifier.</b> The cure for "hot" lives in the Transformers note. Before going there, put today's toolkit to work on Biteful's first real job: sorting happy reviews from angry ones. Which representation does better, and why?</div>

  <h2 id="nl-build"><span class="num">11</span>Build: a Review Sentiment Classifier</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have counts, TF-IDF and word vectors. Biteful wants angry reviews flagged for a reply. With only ten labelled reviews, which representation gives a classifier that works, and where does each one break?</p>
  </div>
  <p>Ten hand-labelled reviews, two classifiers. Classifier A is the classic baseline: TF-IDF with unigrams and bigrams, no stopword removal (so "not good" survives), and logistic regression (one weight per feature, summed and squashed by a sigmoid). Classifier B uses the same logistic regression on the <em>averaged Word2Vec vector</em> of each review, from the model trained in section 06. Five test reviews include words that never appear in the ten training reviews.</p>
<div class="fx" data-lang="py">from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

train_texts = [
    "loved the paneer roll, great taste",
    "excellent biryani, really happy",
    "chai was hot and good",
    "good value and good quality",
    "tasty wrap, will order again",
    "terrible curry, arrived cold",
    "soggy roll, want a refund",
    "not good, very disappointed",
    "awful biryani and slow delivery",
    "not worth the money, cold coffee",
]
train_labels = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]          # 1 = happy, 0 = angry
tests = ["great roll, happy with it", "coffee arrived cold, want a refund", "not good at all",
         "delicious kathi , amazing", "lukewarm soup , disappointing"]

model_a = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LogisticRegression(C=10))
model_a.fit(train_texts, train_labels)

def review_vec(text):                                    # average Word2Vec of known words
    toks = [t for t in re.findall(r"[a-z]+", text.lower()) if t in w2v.wv]
    return np.mean([w2v.wv[t] for t in toks], axis=0) if toks else np.zeros(16)

model_b = LogisticRegression(C=10).fit(np.stack([review_vec(t) for t in train_texts]), train_labels)
pa = model_a.predict_proba(tests)[:, 1]
pb = model_b.predict_proba(np.stack([review_vec(t) for t in tests]))[:, 1]
print(f"{'P(happy)':&gt;8s} {'TF-IDF':&gt;7s} {'W2V':&gt;6s}   review")
for t, a, b in zip(tests, pa, pb):
    print(f"{'':8s} {a:7.2f} {b:6.2f}   {t}")</div>
  <div class="fx" data-lang="text">P(happy)  TF-IDF    W2V   review
            0.66   0.77   great roll, happy with it
            0.15   0.13   coffee arrived cold, want a refund
            0.33   0.17   not good at all
            0.49   0.93   delicious kathi , amazing
            0.49   0.09   lukewarm soup , disappointing</div>
  <p><code>make_pipeline</code> chains the vectorizer and the classifier so that <code>fit</code> learns the vocabulary, IDF and weights from training text only (no leakage). <code>C=10</code> weakens regularisation, reasonable with ten examples. <code>review_vec</code> keeps only tokens the Word2Vec model knows ("loved", "excellent", "refund" are not in its 49-word vocabulary and are skipped). Read the table row by row. On reviews built from training words, both models are right. On "delicious kathi, amazing" and "lukewarm soup, disappointing", TF-IDF outputs 0.49: none of those words was in training, so it has no evidence and falls back to the prior. The Word2Vec model is confident and correct (0.93 and 0.09), because "delicious" sits next to "great" and "lukewarm" next to "cold" in embedding space.</p>
<div class="fx" data-lang="py">vec, clf = model_a.named_steps["tfidfvectorizer"], model_a.named_steps["logisticregression"]
words, wts = vec.get_feature_names_out(), clf.coef_[0]
order = wts.argsort()
print("most angry :", list(words[order[:5]]))
print("most happy :", list(words[order[-5:]]))</div>
  <div class="fx" data-lang="text">most angry : ['not', 'cold', 'good very', 'disappointed', 'not good']
most happy : ['excellent', 'biryani really', 'really', 'good', 'and good']</div>
  <p>The TF-IDF model is fully <strong>interpretable</strong>: each feature has one weight you can read. "not" and the bigram "not good" are among the most negative features, which is why "not good at all" is correctly flagged. The embedding model's 16 weights cannot be read this way. Real use needs thousands of labelled reviews, a held-out test set, and the metrics of the next section.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Text classification</strong>: predicting a label for a whole document. A classic baseline is <strong>TF-IDF + logistic regression</strong>; with pretrained embeddings, averaging word vectors gives a feature vector that generalises to unseen synonyms.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Averaged word vectors lose order and negation: "not good" averages "not" with "good". It happened to work here because "not" mostly appears in complaints in our corpus. Sarcasm ("great, cold again") defeats both models. These are exactly the gaps contextual models close.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Evaluating a classifier.</b> We eyeballed five predictions. If Biteful runs the model on 10,000 reviews, how do we put one honest number on "how good", especially when only a few reviews are complaints?</div>

  <h2 id="nl-eval"><span class="num">12</span>Evaluating a Classifier</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A complaint detector reports "99% accurate". If only 1 review in 100 is a complaint, a detector that never flags anything is also 99% accurate. What should we measure instead?</p>
  </div>
  <p>For "find the rare thing" tasks, ask two questions. Vocabulary first: a <strong>true positive (TP)</strong> is a complaint the model flagged, a <strong>false positive (FP)</strong> a happy review wrongly flagged, a <strong>false negative (FN)</strong> a complaint missed.</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Question it answers</th></tr>
    <tr><td>Precision</td><td>TP / (TP + FP)</td><td>Of the reviews I flagged, how many were complaints? (few false alarms)</td></tr>
    <tr><td>Recall</td><td>TP / (TP + FN)</td><td>Of the real complaints, how many did I catch? (few misses)</td></tr>
    <tr><td>F1</td><td>2PR / (P + R)</td><td>Harmonic mean of precision P and recall R: low if either is low</td></tr>
  </table>
  <p>By hand: 100 reviews, 20 are complaints. The model flags 10 reviews: 8 real complaints and 2 happy ones.</p>
  <ul>
    <li>TP = 8, FP = 2, FN = 20 − 8 = 12.</li>
    <li>Precision = 8 / (8 + 2) = 0.8: when it flags, it is right 80% of the time.</li>
    <li>Recall = 8 / (8 + 12) = 0.4: it catches only 40% of complaints.</li>
    <li>F1 = 2 × 0.8 × 0.4 / (0.8 + 0.4) = 0.533. The weak recall drags it down.</li>
  </ul>
<div class="fx" data-lang="py">from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score
y_true = [1]*20 + [0]*80                          # 1 = complaint: 20 complaints, 80 happy
y_pred = [1]*8 + [0]*12 + [1]*2 + [0]*78          # caught 8, missed 12, 2 false alarms
print(precision_score(y_true, y_pred), recall_score(y_true, y_pred), round(f1_score(y_true, y_pred), 3))
y_never = [0]*100                                 # "never a complaint" on a 1%-complaint set
y_rare = [1] + [0]*99
print("accuracy", accuracy_score(y_rare, y_never), " recall", recall_score(y_rare, y_never))</div>
  <div class="fx" data-lang="text">0.8 0.4 0.533
accuracy 0.99  recall 0.0</div>
  <p>The first line reproduces the hand numbers. The second is the trap made concrete: on a set with one complaint in 100, predicting "never a complaint" scores 0.99 accuracy and 0 recall.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Precision is a fire alarm that rarely rings for burnt toast; recall is one that never misses a real fire. A restaurant wants both; which matters more depends on the cost of each mistake.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Precision</strong> = TP/(TP+FP), <strong>recall</strong> = TP/(TP+FN), <strong>F1</strong> = their harmonic mean. Report them per class on imbalanced text data.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>With imbalanced classes, accuracy hides failure. For word-level tasks like NER (next), score whole entity spans, not single tokens.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Classic word-level tasks.</b> Everything so far labels a whole review. Biteful also wants to know <em>which words</em> are the dish, the restaurant and the city. How are labels attached to single words?</div>

  <h2 id="nl-tasks"><span class="num">13</span>Classic Word-Level Tasks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Ordered paneer roll from Tandoor Tales in Pune, arrived cold." To route this complaint Biteful must pull out the dish, the restaurant and the city. How does a model label individual words, especially names that span several words?</p>
  </div>
  <p>Before LLMs each of these needed its own trained model; today an LLM can do them from an instruction, but the names appear in interviews and in tools such as spaCy.</p>
  <table class="tbl">
    <tr><th>Task</th><th>Output</th><th>Biteful example</th></tr>
    <tr><td><strong>POS tagging</strong></td><td>Part of speech per word</td><td>arrived/VERB cold/ADJ (lemmatizers need this, section 03)</td></tr>
    <tr><td><strong>NER</strong> (named entity recognition)</td><td>Spans: dishes, restaurants, places, dates</td><td>[paneer roll]DISH from [Tandoor Tales]REST in [Pune]LOC</td></tr>
    <tr><td><strong>Dependency parsing</strong></td><td>Who did what to whom</td><td>"roll" is the subject (nsubj) of "arrived"; "cold" describes how</td></tr>
  </table>
  <h3>BIO tags: turning spans into per-word labels</h3>
  <p>A model labels one token at a time, but "Tandoor Tales" is one name of two words. <strong>BIO</strong> tagging solves it: <strong>B</strong>-type begins an entity, <strong>I</strong>-type continues it, <strong>O</strong> is outside any entity.</p>
  <table class="tbl">
    <tr><th>Ordered</th><th>paneer</th><th>roll</th><th>from</th><th>Tandoor</th><th>Tales</th><th>in</th><th>Pune</th></tr>
    <tr><td>O</td><td>B-DISH</td><td>I-DISH</td><td>O</td><td>B-REST</td><td>I-REST</td><td>O</td><td>B-LOC</td></tr>
  </table>
<div class="fx" data-lang="py">def bio_to_spans(tokens, tags):
    spans, cur = [], None
    for tok, tag in zip(tokens, tags):
        if tag.startswith("B-"):
            cur = [tag[2:], [tok]]; spans.append(cur)
        elif tag.startswith("I-") and cur and cur[0] == tag[2:]:
            cur[1].append(tok)
        else:
            cur = None
    return [(label, " ".join(ws)) for label, ws in spans]

toks = "Ordered paneer roll from Tandoor Tales in Pune".split()
tags = ["O", "B-DISH", "I-DISH", "O", "B-REST", "I-REST", "O", "B-LOC"]
print(bio_to_spans(toks, tags))</div>
  <div class="fx" data-lang="text">[('DISH', 'paneer roll'), ('REST', 'Tandoor Tales'), ('LOC', 'Pune')]</div>
  <p>The decoder walks left to right: a B- tag opens a new span, an I- tag of the same type extends it, anything else closes it. Two B-DISH tags in a row would mean two separate dishes, which is why B exists. Deciding these tags needs context: "Tandoor" alone could be an oven or a restaurant. A static vector cannot tell; a contextual one can.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Sequence labelling</strong>: one label per token (POS, NER). <strong>BIO scheme</strong>: B-X begins entity type X, I-X continues it, O is outside; it converts span finding into per-token classification.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Token-level accuracy on NER is inflated by the many O tags. Evaluate exact entity spans: predicting "Tandoor" as B-REST but "Tales" as O is a wrong entity, even though one token was right.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects,</b> then <a class="xref" data-note="transformers">Transformers</a>: the classifier, the NER tagger and the "hot" problem all need vectors that depend on the sentence.</div>

  <h2 id="nl-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Tokens, normalisation, counts, TF-IDF, three embedding methods, cosine: a pile of techniques, or one chain where each link exists because of the previous one's failure?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="nl-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="44" rx="7" class="fr sr"/><text x="85" y="29" text-anchor="middle" font-size="11.5" font-weight="700">characters</text><text x="85" y="45" text-anchor="middle" class="tm" font-size="10">codes, no meaning</text>
<line x1="160" y1="32" x2="188" y2="32" stroke="currentColor" marker-end="url(#nl-a9)"/>
<rect x="190" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="265" y="29" text-anchor="middle" font-size="11.5" font-weight="700">tokens (BPE)</text><text x="265" y="45" text-anchor="middle" class="tm" font-size="10">rolls = roll + s</text>
<line x1="340" y1="32" x2="368" y2="32" stroke="currentColor" marker-end="url(#nl-a9)"/>
<rect x="370" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="445" y="29" text-anchor="middle" font-size="11.5" font-weight="700">normalisation</text><text x="445" y="45" text-anchor="middle" class="tm" font-size="10">GREAT = great</text>
<line x1="520" y1="32" x2="548" y2="32" stroke="currentColor" marker-end="url(#nl-a9)"/>
<rect x="550" y="10" width="120" height="44" rx="7" class="fb sb"/><text x="610" y="29" text-anchor="middle" font-size="11.5" font-weight="700">bag of words</text><text x="610" y="45" text-anchor="middle" class="tm" font-size="10">R3·R4 = 3</text>
<line x1="610" y1="54" x2="610" y2="84" stroke="currentColor" marker-end="url(#nl-a9)"/>
<rect x="520" y="86" width="150" height="44" rx="7" class="ft st"/><text x="595" y="105" text-anchor="middle" font-size="11.5" font-weight="700">TF-IDF</text><text x="595" y="121" text-anchor="middle" class="tm" font-size="10">was → 0, curry → 1.386</text>
<line x1="520" y1="108" x2="472" y2="108" stroke="currentColor" marker-end="url(#nl-a9)"/>
<rect x="250" y="86" width="220" height="44" rx="7" class="ft st"/><text x="360" y="105" text-anchor="middle" font-size="11.5" font-weight="700">Word2Vec · GloVe</text><text x="360" y="121" text-anchor="middle" class="tm" font-size="10">great ≈ good (0.985)</text>
<line x1="250" y1="108" x2="192" y2="108" stroke="currentColor" marker-end="url(#nl-a9)"/>
<rect x="10" y="86" width="180" height="44" rx="7" class="ft st"/><text x="100" y="105" text-anchor="middle" font-size="11.5" font-weight="700">FastText</text><text x="100" y="121" text-anchor="middle" class="tm" font-size="10">spicyyy → spicy</text>
<line x1="100" y1="130" x2="100" y2="160" stroke="currentColor" marker-end="url(#nl-a9)"/>
<rect x="10" y="162" width="260" height="44" rx="7" class="fg sg"/><text x="140" y="181" text-anchor="middle" font-size="11.5" font-weight="700">cosine similarity</text><text x="140" y="197" text-anchor="middle" class="tm" font-size="10">R1 vs R2: 0.2 → 0 → 0.969</text>
<line x1="270" y1="184" x2="318" y2="184" stroke="currentColor" marker-end="url(#nl-a9)"/>
<rect x="320" y="162" width="350" height="44" rx="7" class="fr sr"/><text x="495" y="181" text-anchor="middle" font-size="11.5" font-weight="700">context problem: one "hot"</text><text x="495" y="197" text-anchor="middle" class="tm" font-size="10">cos(hot, spicy) 0.86 · cos(hot, warm) 0.77</text>
<line x1="495" y1="206" x2="495" y2="236" stroke="currentColor" marker-end="url(#nl-a9)"/>
<rect x="320" y="238" width="350" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="495" y="256" text-anchor="middle" font-size="11.5" font-weight="700">Transformers: a vector per occurrence</text><text x="495" y="271" text-anchor="middle" class="tm" font-size="10">next note</text>
<line x1="140" y1="206" x2="140" y2="236" stroke="currentColor" marker-end="url(#nl-a9)"/>
<rect x="10" y="238" width="260" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="140" y="256" text-anchor="middle" font-size="11.5" font-weight="700">use: classify, evaluate, tag</text><text x="140" y="271" text-anchor="middle" class="tm" font-size="10">0.49 vs 0.93 on unseen synonyms</text>
<text x="340" y="312" text-anchor="middle" class="tm" font-size="10.5">each box exists because the box before it failed at something</text>
</svg><figcaption>The chain of fixes: units, then consistent units, then counts, then weighted counts, then learned similarity, then robust spelling; the one thing none of them can do (context) hands over to Transformers.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same four Biteful reviews</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our reviews</th><th>When to use</th></tr>
    <tr><td>Character codes</td><td>the raw string</td><td>how is text stored?</td><td>hot = 104, 111, 116</td><td>never as features</td></tr>
    <tr><td>Word tokens</td><td>regex on letters</td><td>what are the units?</td><td>R1 → 5 tokens; "rolls" → UNK</td><td>counting models</td></tr>
    <tr><td>BPE subwords</td><td>characters + learned merges</td><td>how to handle unseen words?</td><td>rolls → roll + s; spicier → spic + i + e + r</td><td>every Transformer</td></tr>
    <tr><td>Normalisation</td><td>tokens + rules / dictionary</td><td>is GREAT the same as great?</td><td>spiciest → spicy (lemma); "not too spicy" → "spicy" (trap)</td><td>count models; skip for Transformers</td></tr>
    <tr><td>Bag of words</td><td>normalised tokens</td><td>how does a review become a vector?</td><td>13 columns; R3·R4 = 3, R1·R2 = 1</td><td>quick baselines</td></tr>
    <tr><td>TF-IDF</td><td>BoW × ln(N/df)</td><td>which words matter?</td><td>was 0, too/hot 0.693, curry 1.386; cos(R3,R4) 0.333</td><td>keyword search (BM25), baselines</td></tr>
    <tr><td>Word2Vec</td><td>windows + negative sampling</td><td>which words are similar?</td><td>cos(great, good) 0.985; one SGD step: loss 1.491 → 1.26</td><td>features, pretrained init</td></tr>
    <tr><td>GloVe</td><td>log co-occurrence counts</td><td>can global counts give vectors?</td><td>cos(great, good) 0.85 vs (great, awful) 0.54</td><td>pretrained static vectors</td></tr>
    <tr><td>FastText</td><td>Word2Vec + char n-grams</td><td>vectors for unseen words?</td><td>spicyyy → spicy, fiery</td><td>typos, rich morphology</td></tr>
    <tr><td>Cosine</td><td>dot product ÷ lengths</td><td>how alike, ignoring length?</td><td>R1 vs R2: BoW 0.2, TF-IDF 0, W2V 0.969</td><td>every similarity search</td></tr>
    <tr><td>Context problem</td><td>static lookup tables</td><td>can one word mean two things?</td><td>hot: spicy 0.86, warm 0.77</td><td>why Transformers exist</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>we keep replacing a representation that cannot see something with one that can</strong>: characters can't see words (tokens), tokens can't see sameness (normalisation), lists can't be compared (counts), counts can't see importance (TF-IDF), TF-IDF can't see similarity (embeddings), embeddings can't see spelling (FastText) or context (Transformers).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="transformers">Transformers</a>, which takes "curry was too hot" and "chai was too hot" and gives the two "hot"s different vectors.</div>

  <h2 id="nl-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful reviews R1 "spicy paneer roll was great", R2 "mild chicken wrap was good", R3 "curry was too hot" (spicy), R4 "chai was too hot" (temperature), after lowercasing. Embeddings were trained on 4,000 synthetic template reviews (no pretrained vectors were downloadable here).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our reviews</th><th>Weakness → next</th></tr>
    <tr><td>Character codes</td><td>what can a computer compute on?</td><td>hot 104 111 116 vs hit 104 105 116</td><td>no meaning → tokens</td></tr>
    <tr><td>Tokenization (words → BPE)</td><td>what are the units?</td><td>6 merges: roll, spic; rolls = roll + s</td><td>GREAT ≠ great → normalise</td></tr>
    <tr><td>Normalisation</td><td>same word, same token?</td><td>lemma spiciest → spicy; stopwords kill "not too"</td><td>still no vector → BoW</td></tr>
    <tr><td>Bag of words</td><td>review → fixed-length vector?</td><td>13 columns; R3·R4 = 3</td><td>"was" everywhere → TF-IDF</td></tr>
    <tr><td>TF-IDF</td><td>which words matter?</td><td>was 0, curry 1.386; cos(R1,R2) = 0</td><td>synonyms orthogonal → embeddings</td></tr>
    <tr><td>Word2Vec</td><td>which words are similar?</td><td>great ≈ good 0.985</td><td>global counts unused → GloVe</td></tr>
    <tr><td>GloVe</td><td>vectors from co-occurrence?</td><td>great–good 0.85, great–awful 0.54</td><td>unseen words → FastText</td></tr>
    <tr><td>FastText</td><td>vectors for typos?</td><td>spicyyy → spicy</td><td>how to compare → cosine</td></tr>
    <tr><td>Cosine</td><td>how alike, length-free?</td><td>R1 vs R2: 0.2 / 0 / 0.969</td><td>R3 ≈ R4 everywhere → context</td></tr>
    <tr><td>Context problem</td><td>one word, two meanings?</td><td>hot between spicy and warm</td><td>→ Transformers</td></tr>
    <tr><td>Classifier · metrics · NER</td><td>use the vectors</td><td>unseen synonyms 0.49 (TF-IDF) vs 0.93 (W2V); P 0.8, R 0.4, F1 0.533</td><td>need context too</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>IDF (textbook)</td><td>idf(w) = ln(N / df(w))</td><td>N documents, df(w) documents containing w</td></tr>
    <tr><td>IDF (scikit-learn)</td><td>ln((1+N)/(1+df)) + 1, then rows scaled to length 1</td><td>never 0; "was" gets 1</td></tr>
    <tr><td>TF-IDF</td><td>tf(w, d) × idf(w)</td><td>tf = count of w in document d</td></tr>
    <tr><td>Cosine</td><td>a·b / (‖a‖‖b‖), ‖a‖ = √Σaᵢ²</td><td>1 same direction, 0 unrelated, −1 opposite</td></tr>
    <tr><td>Sigmoid</td><td>σ(x) = 1 / (1 + e<sup>−x</sup>)</td><td>score → probability</td></tr>
    <tr><td>Skip-gram neg. sampling loss</td><td>−ln σ(v<sub>w</sub>·u<sub>c</sub>) − Σ<sub>n</sub> ln(1 − σ(v<sub>w</sub>·u<sub>n</sub>))</td><td>v input (centre) vector, u output (context) vector, n random negatives</td></tr>
    <tr><td>SGD step</td><td>θ ← θ − η ∂L/∂θ; ∂L/∂v = (σ<sub>c</sub> − 1)u<sub>c</sub> + Σ σ<sub>n</sub>u<sub>n</sub></td><td>η learning rate</td></tr>
    <tr><td>GloVe</td><td>min Σ f(X<sub>ij</sub>)(w<sub>i</sub>·c<sub>j</sub> + b<sub>i</sub> + b'<sub>j</sub> − ln X<sub>ij</sub>)²</td><td>X co-occurrence counts; f(x) = min(1, (x/x<sub>max</sub>)<sup>0.75</sup>)</td></tr>
    <tr><td>FastText</td><td>vec(w) = Σ<sub>g ∈ ngrams(&lt;w&gt;)</sub> z<sub>g</sub> + z<sub>w</sub></td><td>z vector per character n-gram</td></tr>
    <tr><td>Precision · recall · F1</td><td>TP/(TP+FP) · TP/(TP+FN) · 2PR/(P+R)</td><td>TP caught, FP false alarm, FN missed</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>BoW / TF-IDF</b><p>Fast, interpretable baselines; keyword search (BM25); tiny devices.</p><small>Not for synonyms or meaning-level search</small></div>
    <div><b>Word2Vec / GloVe</b><p>Cheap dense features; similarity between words; initialising models.</p><small>Not for typos (OOV) or word sense</small></div>
    <div><b>FastText</b><p>Noisy user text, typos, languages with many word forms.</p><small>Not for look-alike words with different meanings</small></div>
    <div><b>Normalisation</b><p>Before counting models (lowercase; careful stopwords).</p><small>Skip for Transformers; never drop negations</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Stopword lists delete "not"/"too"; fitting vocabulary or IDF on test data (leakage); sklearn IDF is smoothed, so "was" is not 0; tokens ≠ words; synonyms are orthogonal in BoW/TF-IDF; embeddings put antonyms close (spicy–mild 0.71); cosine values aren't comparable across representations; static vectors blend senses ("hot"); accuracy on imbalanced classes; [CLS] as a sentence vector.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Textbook IDF of a word in 2 of 4 reviews?</td><td>ln(4/2) = ln 2 = 0.693</td></tr>
    <tr><td>cos([3, 4], [6, 8])?</td><td>50 / (5 × 10) = 1</td></tr>
    <tr><td>Skip-gram pairs for "too" in "curry was too hot", window 1?</td><td>(too, was), (too, hot)</td></tr>
    <tr><td>3-grams of "hot" in FastText?</td><td>&lt;ho, hot, ot&gt; (plus the whole word &lt;hot&gt;)</td></tr>
    <tr><td>Why is cos(R1, R2) = 0 under textbook TF-IDF?</td><td>Their only shared word "was" is in every review, so its IDF is 0; great ⟂ good</td></tr>
  </table>

  <h2 id="nl-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why subword tokenization instead of words or characters?</summary><div class="qa-body">Word vocabularies explode and still produce &lt;UNK&gt; for typos and new words; characters never fail but make sequences long and each token nearly meaningless. Subwords (BPE, WordPiece, Unigram) keep frequent words whole and split rare ones into known pieces, with characters or bytes as a fallback, so nothing is unknown. Our 6 merges turned "rolls" into roll + s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>By hand: what is BPE's first merge on {low: 5, lower: 2, newest: 6, widest: 3}?</summary><div class="qa-body">Count pairs weighted by frequency: "e s" occurs in newest (6) and widest (3) = 9; "s t" also 9; "l o" 7; "w e" 8 (lower 2 + newest 6). The top is 9, so the first merge is "e" + "s" (seen first) → "es", followed by "es" + "t".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Stemming vs lemmatization: when do you use each?</summary><div class="qa-body">Stemming chops endings by rule: fast, can give non-words ("deliveries" → "deliveri") and misses irregular forms ("better"). Lemmatization uses a dictionary and part of speech: slower, returns real words ("spiciest" → "spicy", "better" → "good"). Stem for search indexes and topic counts; lemmatize when the base word must be real. For Transformers, do neither.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your sentiment model calls "the roll was not too spicy" a complaint about spice. Likely bug?</summary><div class="qa-body">Stopword removal deleted "not" and "too" (both in scikit-learn's list), leaving "roll spicy". Keep negations and intensifiers (custom list or none) and add bigrams so "not too" is a feature.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does TF-IDF solve over raw counts, and what problem does it leave?</summary><div class="qa-body">It down-weights words that appear everywhere ("was" → IDF 0) and boosts distinctive ones ("curry" → 1.386), so filler stops dominating comparisons. It leaves the synonym problem: every word is its own axis, so "great" and "good" are orthogonal and R1 vs R2 scores 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>TfidfVectorizer()</code> on our 4 reviews: is the weight of "was" zero?</summary><div class="qa-body">No. scikit-learn's smoothed IDF is ln((1+N)/(1+df)) + 1 = ln(5/5) + 1 = 1 for a word in every document, so "was" keeps weight (then rows are L2-normalised). That is why cos(R1, R2) came out 0.064, not 0. Use <code>max_df</code> or stopwords to suppress it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Skip-gram vs CBOW?</summary><div class="qa-body">Skip-gram predicts each neighbour from the centre word, making one example per (centre, neighbour) pair: more updates for rare words. CBOW averages the neighbours and predicts the centre: faster, smoother for frequent words. On "curry was too hot" with window 1, skip-gram makes 6 pairs, CBOW 4 examples.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why negative sampling?</summary><div class="qa-body">A full softmax over the vocabulary costs one dot product per vocabulary word for every training pair. Negative sampling asks a few yes/no questions instead: σ(v·u) high for the real pair, low for k random pairs. Cost per pair drops from |V| to k + 1 dot products.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does FastText handle "spicyyy"?</summary><div class="qa-body">It sums vectors of the word's character n-grams (&lt;sp, spi, pic, icy, cyy, …). Several were learned from "spicy", "spice", so the sum lands near spicy and fiery. Word2Vec and GloVe have no row and raise an error or return UNK.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is cosine preferred over the raw dot product for comparing reviews?</summary><div class="qa-body">The dot product grows with vector length, so long reviews look similar to everything. Cosine divides by both lengths, leaving only direction (what the review is about). For unit-length vectors the two are identical, which is why vectors are usually normalised once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the fundamental limitation of Word2Vec, GloVe and FastText, and what fixed it?</summary><div class="qa-body">They are static: one vector per word in every sentence, so "hot" blends spicy and temperature senses (cos 0.86 with spicy, 0.77 with warm). Contextual models (ELMo, then Transformer-based BERT and LLMs) compute each occurrence's vector from its sentence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A complaint detector has 99% accuracy. Is it good?</summary><div class="qa-body">Unknown. If 1% of reviews are complaints, "never a complaint" also scores 99% with 0 recall. Report precision, recall and F1 for the complaint class.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is BIO tagging and why is it used?</summary><div class="qa-body">Each token gets B-X (begins entity X), I-X (inside X) or O (outside). It turns span finding into per-token classification: "paneer roll from Tandoor Tales" → B-DISH I-DISH O B-REST I-REST. B separates two adjacent entities of the same type.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you still pick TF-IDF + logistic regression over a Transformer?</summary><div class="qa-body">Tiny budget or on-device; millisecond latency; need for readable weights; plenty of labelled data where keywords carry the signal. Always build it as the baseline the bigger model must beat.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does TF-IDF need tokenization and normalisation before it, and what breaks if you skip normalisation?</summary><div class="qa-body">TF-IDF counts tokens, so it inherits every token decision. Without lowercasing, "GREAT", "Great" and "great" are three columns with three separate, smaller IDFs and counts split three ways; a query for "great" misses R1. Without tokenization there is nothing to count at all.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did we need embeddings after TF-IDF, when TF-IDF already fixed the "was" problem?</summary><div class="qa-body">TF-IDF fixed importance, not similarity. Each word is still an independent axis, so two reviews with different but synonymous words (R1 "great", R2 "good") score 0. Embeddings put words used in similar contexts close together, so averaged vectors score R1 and R2 as similar (0.969) and a classifier generalises to unseen synonyms (0.93 vs 0.49 on "delicious kathi, amazing").</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what does Word2Vec's training objective have to do with the antonym trap?</summary><div class="qa-body">Word2Vec is trained only to predict neighbours. "spicy" and "mild" fill the same slots ("the roll was ___ and great"), so predicting their neighbours requires similar vectors. Nothing in the objective rewards separating opposite meanings, so cos(spicy, mild) stays high (0.71).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a Transformer still need a tokenizer and an embedding table, the oldest parts of this note?</summary><div class="qa-body">A Transformer computes on vectors. The tokenizer (BPE) turns text into IDs; the embedding table (a learned lookup, like Word2Vec's input vectors) turns IDs into the starting vectors. Attention then <em>adjusts</em> those static starting vectors using the sentence, which is how "hot" becomes two different vectors.</div></details>
</main>`
});
