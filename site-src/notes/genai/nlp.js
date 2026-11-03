// notes/genai/nlp.js — NLP Foundations
Object.assign(TOPIC_CONTENT, {
  "nlp": `<main>
  <h1>NLP Foundations</h1>
  <div class="where"><span>Generative AI</span><span>NLP Foundations</span></div>
  <p class="lead">Natural language processing, or NLP, is the set of methods that let a program work with human language. The difficulty is simple to state: a computer can only do arithmetic on numbers, and a customer review is a string of characters. Every language system, from a spam filter to a large language model, begins by turning text into numbers, and the way it does that decides what it can and cannot understand. This note builds that conversion one step at a time, and each step exists because the previous one fails at something you will see in the output. The running example is <strong>Biteful</strong>, a food-delivery app, and four of its customer reviews: R1 "Spicy paneer roll was GREAT!!", R2 "Mild chicken wrap was good.", R3 "Curry was too hot!" and R4 "Chai was too hot...". The same reviews carry on into <a class="xref" data-note="transformers">Transformers</a>, which picks up exactly where this note runs out of road.</p>

  <h2 id="nl-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">NLP Foundations: text → numbers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Units</div>
        <ul>
          <li>Character codes carry no meaning</li>
          <li><b>Tokens</b>: the units a model reads, each with an integer ID</li>
          <li><b>BPE</b>: merge the most frequent pair, repeat; rolls → roll + s</li>
          <li><b>Normalise</b> for count models: lowercase; careful with stopwords</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Counting</div>
        <ul>
          <li><b>Bag of words</b>: one column per word, order lost</li>
          <li><b>N-grams</b>: keep a little order, vocabulary explodes</li>
          <li><b>TF-IDF</b>: count × ln(N/df); "was" → 0</li>
          <li>Synonyms share nothing: great vs good = 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Learned vectors</div>
        <ul>
          <li><b>Word2Vec</b>: predict neighbours; similar use → similar vector</li>
          <li><b>GloVe</b>: fit vectors to log co-occurrence counts</li>
          <li><b>FastText</b>: sum of character n-grams; typos get vectors</li>
          <li><b>Cosine</b>: angle between vectors, ignores length</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Limits and uses</div>
        <ul>
          <li>Static: one "hot" for curry and chai → Transformers</li>
          <li>Antonyms land close (spicy vs mild)</li>
          <li>TF-IDF + logistic regression: the baseline to beat</li>
          <li>Precision, recall, F1; BIO tags for NER</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="nl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Text Must Become Numbers</span><span class="rm-sub">the four Biteful reviews</span></div></div>
      <div class="rm-item rm-done" data-target="nl-tok"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Tokenization</span><span class="rm-sub">words, characters and BPE</span></div></div>
      <div class="rm-item rm-done" data-target="nl-prep"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Normalisation</span><span class="rm-sub">case, stopwords, stems, lemmas</span></div></div>
      <div class="rm-item rm-done" data-target="nl-bow"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Bag of Words and N-grams</span><span class="rm-sub">a review as a row of counts</span></div></div>
      <div class="rm-item rm-done" data-target="nl-tfidf"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">TF-IDF</span><span class="rm-sub">weighting words by rarity</span></div></div>
      <div class="rm-item rm-done" data-target="nl-w2v"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Word Embeddings and Word2Vec</span><span class="rm-sub">learning which words are similar</span></div></div>
      <div class="rm-item rm-done" data-target="nl-static"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">GloVe and FastText</span><span class="rm-sub">global counts, and vectors for typos</span></div></div>
      <div class="rm-item rm-done" data-target="nl-cos"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Cosine Similarity</span><span class="rm-sub">comparing every representation</span></div></div>
      <div class="rm-item rm-done" data-target="nl-ctx"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Context Problem</span><span class="rm-sub">which "hot"?</span></div></div>
      <div class="rm-item rm-done" data-target="nl-build"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">A Review Classifier and How to Score It</span><span class="rm-sub">TF-IDF vs embeddings; precision and recall</span></div></div>
      <div class="rm-item rm-done" data-target="nl-tasks"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Word-Level Tasks</span><span class="rm-sub">POS, NER and BIO tags</span></div></div>
      <div class="rm-item rm-done" data-target="nl-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">stopwords, leakage, accuracy</span></div></div>
      <div class="rm-item rm-done" data-target="nl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="nl-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the NLP questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="nl-why"><span class="num">01</span>Why Text Must Become Numbers</h2>
  <p>Biteful receives thousands of reviews a day. It wants a program that finds the angry ones so someone can reply, groups similar complaints together, and lets customers search dishes by meaning. Every one of those jobs involves arithmetic: comparing, scoring, averaging. So the first question is what arithmetic a program can possibly do on a sentence like "Curry was too hot!".</p>
  <p>Here are the four reviews used throughout this note. They are short on purpose, so every number that appears later can be checked by hand.</p>
  <table class="tbl">
    <tr><th>ID</th><th>Review (as typed)</th><th>What the customer means</th></tr>
    <tr><td>R1</td><td>Spicy paneer roll was GREAT!!</td><td>loved a spicy wrap</td></tr>
    <tr><td>R2</td><td>Mild chicken wrap was good.</td><td>liked a mild wrap</td></tr>
    <tr><td>R3</td><td>Curry was too hot!</td><td>too <em>spicy</em>: a chilli complaint for the kitchen</td></tr>
    <tr><td>R4</td><td>Chai was too hot...</td><td>too <em>hot to drink</em>: a temperature complaint for packaging</td></tr>
  </table>
  <p>A person sees two things at once: R1 and R2 are both happy reviews of a wrap, even though they share almost no words, and R3 and R4 are different complaints, even though they share almost all their words. Keep those two facts in mind. Every method in this note will be judged by whether it can see them too.</p>
  <p>Inside a computer, text is already stored as numbers, because every character has a numeric code. Python's <code>ord()</code> returns that code, so the obvious first idea is to do maths on the codes:</p>
  <div class="fx" data-lang="py">review = "Curry was too hot!"
print([ord(c) for c in "hot"], [ord(c) for c in "hit"], [ord(c) for c in "spicy"])
print(len(review), "characters:", [ord(c) for c in review[:9]], "...")</div>
  <div class="fx" data-lang="text">[104, 111, 116] [104, 105, 116] [115, 112, 105, 99, 121]
18 characters: [67, 117, 114, 114, 121, 32, 119, 97, 115] ...</div>
  <p>"hot" and "hit" differ in just one code (111 against 105) yet mean unrelated things, while "hot" and "spicy", which mean the same thing in R3, share no code at all. Character codes identify letters; they say nothing about meaning. Think of phone numbers: they are numbers, but two neighbouring phone numbers do not belong to similar people, and averaging two of them produces nothing useful. What we want are numbers more like map coordinates, where being close means being similar.</p>
  <p>The list of numbers chosen to stand for a piece of text is called its <strong>representation</strong>, and most of NLP is the search for better representations. The road this note follows is: cut text into units (tokens), clean them, count them, weight the counts, learn a vector per word, and finally discover the one thing none of these can do. Two of these ideas live inside every modern LLM: a subword tokenizer and a learned table of word vectors. A third, BM25 (a refinement of TF-IDF), still powers the keyword half of most search and retrieval systems.</p>

  <h2 id="nl-tok"><span class="num">02</span>Tokenization</h2>
  <p>Characters are too small to carry meaning, so we need bigger units. Cutting text into units is called <strong>tokenization</strong>, and each unit is a <strong>token</strong>. The fixed list of tokens a system knows is its <strong>vocabulary</strong>, and a token's position in that list is its <strong>ID</strong>, the integer a model actually receives. The simplest choice is to make every run of letters a token:</p>
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
  <p>The regular expression <code>[A-Za-z]+</code> means "one or more letters in a row", so spaces and the "!!" disappear. The four reviews contain 13 different tokens, and R3 becomes the list of IDs [1, 11, 10, 7]. Two problems are already visible. First, "GREAT", "Spicy" and "Chai" keep their capitals, so "GREAT" and "great" would get different IDs; the next section deals with that. Second, a new review containing "rolls" has no ID at all. A word-level tokenizer must map every unknown word to a single catch-all token, usually written <code>&lt;UNK&gt;</code>, and the word's meaning is lost. Real word vocabularies run to hundreds of thousands of entries and still miss typos, new dish names and people's names.</p>
  <p>The opposite extreme is to make every character a token. The vocabulary becomes tiny (about a hundred symbols) and nothing is ever unknown, but sequences become long and each token means almost nothing, so a model must learn spelling, words and grammar from scratch. Modern systems use a middle path called <strong>subword tokenization</strong>: frequent words stay whole and rare words are split into frequent pieces.</p>
  <p>The most widely used method is <strong>byte-pair encoding (BPE)</strong>. It learns its pieces from data with a single rule: start with every word spelled as single characters, count every pair of neighbouring symbols (weighted by how often the word occurs), glue the most frequent pair into one new symbol, and repeat. Think of a busy cashier who, after taking a thousand orders, starts writing shorthand for the pieces that come up constantly ("PNR" for paneer) while still writing rare dishes out in full. Here BPE runs for six merges on a tiny corpus of menu words, with "roll" seen 6 times, "rolls" 3, "spicy" 4, "spice" 2 and "paneer" 3:</p>
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
  <p>After each merge the five words are printed with spaces between their current symbols. The pairs "r o", "o l" and "l l" each occur 9 times (6 from roll plus 3 from rolls), so the first three merges build "roll"; Python's <code>Counter.most_common</code> breaks the tie by keeping the pair it met first. The next most frequent pairs come from spicy and spice (6 times each), so merges 4 to 6 build the shared stem "spic". "paneer" never wins, so it stays spelled out letter by letter. A trained tokenizer is nothing more than this ordered list of merges. To tokenize a new word you start from its characters and replay the merges in the same order:</p>
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
  <p>None of "spicier", "rolled", "spicyyy" or "naan" appeared in the training words, yet each gets a token sequence: the known pieces "roll" and "spic" are reused, and anything else falls back to single characters. Nothing is ever unknown, because every single character (in GPT-style tokenizers, every single byte, which even covers emoji) is in the vocabulary. Real tokenizers learn 30,000 to 200,000 merges from enormous amounts of text, so common words such as "the" or "chicken" end up as one token each.</p>
  <p>Two variants are worth knowing by name. <strong>WordPiece</strong>, used by BERT, picks the merge that most increases the likelihood of the training text rather than the raw most frequent pair, and marks continuation pieces with "##" ("rolls" → roll, ##s). <strong>Unigram</strong> tokenization, usually through the SentencePiece library (T5 and many multilingual models), starts from a large vocabulary and prunes the pieces that matter least, treating the space as an ordinary symbol. One practical consequence matters every day: LLM prices and context limits are counted in tokens, not words, and Hindi, code and numbers often need many more tokens per word than English. It also explains a famous failure: a model that sees "straw" + "berry" never sees the individual letters, which is why LLMs used to miscount the r's in "strawberry".</p>

  <h2 id="nl-prep"><span class="num">03</span>Normalisation</h2>
  <p>R1 says "GREAT", another review might say "great", a third "Great". To a program that counts words these are three different words, so whatever it learns about "great" is split three ways. <strong>Normalisation</strong> is the cleaning done before counting so that one idea always looks like one token. The classic steps are lowercasing, optionally removing <strong>stopwords</strong> (very common words such as "the", "was", "is" that carry little meaning on their own), and reducing words to a base form.</p>
  <p>Lowercasing is almost always safe for counting. Stopword removal is where trouble starts, because standard stopword lists (including the ones shipped with scikit-learn and NLTK) contain "not", "no" and "too". Here is the effect, using a small stopword list of that kind:</p>
  <div class="fx" data-lang="py">STOPWORDS = {"a", "an", "and", "the", "is", "was", "were", "be", "to", "of", "in", "on",
             "for", "it", "this", "that", "with", "too", "very", "not", "no", "me", "i"}
clean = [re.findall(r"[a-z]+", r.lower()) for r in reviews]      # lowercase, then tokenize
for toks in clean:
    print(toks)
for text in ["curry was too hot", "the roll was not too spicy"]:
    print(f"{text!r:30} -&gt;", [t for t in text.split() if t not in STOPWORDS])</div>
  <div class="fx" data-lang="text">['spicy', 'paneer', 'roll', 'was', 'great']
['mild', 'chicken', 'wrap', 'was', 'good']
['curry', 'was', 'too', 'hot']
['chai', 'was', 'too', 'hot']
'curry was too hot'            -&gt; ['curry', 'hot']
'the roll was not too spicy'   -&gt; ['roll', 'spicy']</div>
  <p>Lowercasing before tokenizing means the pattern only needs <code>[a-z]</code>; these four cleaned reviews are the version used for the rest of the note. Now look at the last line. The complaint "the roll was <em>not too</em> spicy", which is actually praise for a mild roll, becomes just "roll spicy", which reads like the opposite. This is the most common silent bug in sentiment analysis: removing negations destroys exactly the signal you need.</p>
  <p>The last cleaning step reduces word forms to a base. <strong>Stemming</strong> chops endings off with fixed rules; the best known is the Porter stemmer. <strong>Lemmatization</strong> instead looks the word up in a dictionary (WordNet is the usual one), together with its part of speech, and returns the real base form, called the <strong>lemma</strong>. A stemmer is a vegetable chopper with one blade, fast but sometimes cutting in the wrong place; a lemmatizer is a chef who checks the recipe book first. Here is the Porter stemmer from NLTK:</p>
  <div class="fx" data-lang="py">from nltk.stem import PorterStemmer
stem = PorterStemmer()
for w in ["spicy", "spiciest", "rolls", "ordered", "deliveries", "better", "was"]:
    print(f"{w:11s} -&gt; {stem.stem(w)}")</div>
  <div class="fx" data-lang="text">spicy       -&gt; spici
spiciest    -&gt; spiciest
rolls       -&gt; roll
ordered     -&gt; order
deliveries  -&gt; deliveri
better      -&gt; better
was         -&gt; wa</div>
  <p>The stemmer knows no dictionary. It turns "spicy" into the non-word "spici" and "deliveries" into "deliveri", leaves "spiciest" alone, cannot connect "better" with "good", and turns "was" into "wa". Its output is still useful for counting, because it is consistent: every "spicy" becomes the same "spici". A dictionary lemmatizer, given the part of speech, returns "spicy" for "spiciest", "delivery" for "deliveries", "good" for the adjective "better" and "be" for "was", but it is slower and needs a part-of-speech tag for every word. Stemming suits search indexes and topic counts; lemmatization suits tasks where the base word must be a real word.</p>
  <p>Modern Transformer models skip almost all of this. Their subword tokenizer already maps "spicy", "spicier" and "spiciest" to pieces that share "spic", and the model learns from billions of sentences how case, endings and small words change meaning. Deleting "not" or "too" would throw away information it needs. So for Transformers you pass the raw text; classic normalisation belongs to the counting models in the next two sections.</p>

  <h2 id="nl-bow"><span class="num">04</span>Bag of Words and N-grams</h2>
  <p>We now have clean tokens, but R3 has four of them and R1 has five, while most models need every input to be a vector of the same length. The simplest fix is to make one column for every word in the vocabulary and write, for each review, how many times each word appears. This is the <strong>bag of words</strong>: tip every word of a review into a bag, shake it, and count what is inside. You lose the sentence but keep which words appeared and how often, much like judging a dish by its ingredient list. Our four cleaned reviews use 13 different words, so every review becomes a row of 13 counts:</p>
  <div class="fx" data-lang="py">import numpy as np
vocab = sorted({t for toks in clean for t in toks})          # 13 words, alphabetical
col = {w: j for j, w in enumerate(vocab)}
C = np.zeros((len(clean), len(vocab)), dtype=int)
for i, toks in enumerate(clean):
    for t in toks:
        C[i, col[t]] += 1                                     # count each word
print(vocab)
print(C)
print("shared-word counts (dot products):")
print(C @ C.T)</div>
  <div class="fx" data-lang="text">['chai', 'chicken', 'curry', 'good', 'great', 'hot', 'mild', 'paneer', 'roll', 'spicy', 'too', 'was', 'wrap']
[[0 0 0 0 1 0 0 1 1 1 0 1 0]
 [0 1 0 1 0 0 1 0 0 0 0 1 1]
 [0 0 1 0 0 1 0 0 0 0 1 1 0]
 [1 0 0 0 0 1 0 0 0 0 1 1 0]]
shared-word counts (dot products):
[[5 1 1 1]
 [1 5 1 1]
 [1 1 4 3]
 [1 1 3 4]]</div>
  <p>The vocabulary is sorted alphabetically, so "chai" is column 0 and "wrap" is column 12. Row 3 is R3: ones under curry, hot, too and was, zeros everywhere else. Such a matrix is called <strong>sparse</strong>, because it is mostly zeros; with a realistic 50,000-word vocabulary a ten-word review has 49,990 zeros.</p>
  <p>Now reviews can be compared with arithmetic. The <strong>dot product</strong> of two rows (multiply column by column and add up) counts the words they share, and <code>C @ C.T</code> computes it for every pair at once; the diagonal is each review's own length. R1 and R2 share only "was", so their entry is 1. R3 and R4 share "was", "too" and "hot", so theirs is 3. By counts, the two different complaints look three times more alike than the two happy wrap reviews, which is backwards. Part of the problem is "was": it appears in every review and adds to every comparison while saying nothing about any dish. In real reviews, "the", "and" and "was" dominate every count.</p>
  <p>The bag also throws away order. "not too spicy" (praise for a mild dish) and "too spicy, not good" (a complaint) contain the same words. The usual patch is to count neighbouring word pairs as extra features. A pair of consecutive words is a <strong>bigram</strong>, and in general n consecutive words form an <strong>n-gram</strong>:</p>
  <div class="fx" data-lang="py">def ngrams(toks, n):
    return [" ".join(toks[i:i + n]) for i in range(len(toks) - n + 1)]

docs = clean + ["roll was not too spicy".split()]
unigrams = {g for d in docs for g in ngrams(d, 1)}
bigrams = {g for d in docs for g in ngrams(d, 2)}
print(len(unigrams), "unigram features;", len(unigrams) + len(bigrams), "with bigrams")
print(ngrams("roll was not too spicy".split(), 2))</div>
  <div class="fx" data-lang="text">14 unigram features; 29 with bigrams
['roll was', 'was not', 'not too', 'too spicy']</div>
  <p>The bigram "not too" is now a feature of its own, so a model can learn that it signals praise. The price shows in the first line: adding bigrams for just five short reviews more than doubles the number of features, from 14 to 29. With real data the vocabulary explodes, most n-grams are seen only once, and a new review's bigrams have often never appeared in training. Old systems patched this with <strong>smoothing</strong> (giving unseen n-grams a small invented count); neural models fixed it properly by letting similar words share what they learn, which is the idea of section 06.</p>

  <h2 id="nl-tfidf"><span class="num">05</span>TF-IDF</h2>
  <p>Counting treats every word as equally important, which is why "was" inflated every comparison. Intuitively, "curry" tells you much more about R3 than "was" does, because "curry" appears in only one review and "was" appears in all four. <strong>TF-IDF</strong> turns that intuition into a number. It multiplies two quantities. <strong>TF</strong> (term frequency) is how often the word appears in this review, the bag-of-words count. <strong>IDF</strong> (inverse document frequency) is ln(N / df), where N is the number of reviews and df is how many of them contain the word. A word found in every review gets ln(1) = 0; a word found in one review out of four gets ln 4 = 1.386. The product is high only for words that are frequent in this review and rare elsewhere.</p>
  <p>By hand on our four reviews: "was" is in all 4, so its IDF is ln(4/4) = 0. "too" and "hot" are in 2, so theirs is ln 2 = 0.693. Every other word is in only one review, so 1.386. Since each word appears once per review, each review's TF-IDF weights equal these IDFs. R3 and R4 now overlap only on "too" and "hot": their dot product is 0.693² + 0.693² = 0.961, and dividing by the two vector lengths (1.698 each) gives 0.333, a length-independent score called cosine similarity (section 08). R1 and R2 share only "was", whose weight is 0, so their score is exactly 0. The code checks this:</p>
  <div class="fx" data-lang="py">N = len(clean)
df = (C &gt; 0).sum(axis=0)                         # in how many reviews does each word appear?
idf = np.log(N / df)                             # textbook IDF, natural log
print({w: round(float(i), 3) for w, i in zip(vocab, idf)})
T = C * idf                                      # TF x IDF, every review at once
unit = T / np.linalg.norm(T, axis=1, keepdims=True)
print("cosine matrix:\\n", (unit @ unit.T).round(3))

idf_s = np.log((1 + N) / (1 + df)) + 1           # scikit-learn's smoothed IDF
U = C * idf_s; U = U / np.linalg.norm(U, axis=1, keepdims=True)
print("smoothed: idf(was) =", idf_s[col["was"]], " cos(R1,R2) =", round(float(U[0] @ U[1]), 3))</div>
  <div class="fx" data-lang="text">{'chai': 1.386, 'chicken': 1.386, 'curry': 1.386, 'good': 1.386, 'great': 1.386, 'hot': 0.693, 'mild': 1.386, 'paneer': 1.386, 'roll': 1.386, 'spicy': 1.386, 'too': 0.693, 'was': 0.0, 'wrap': 1.386}
cosine matrix:
 [[1.    0.    0.    0.   ]
 [0.    1.    0.    0.   ]
 [0.    0.    1.    0.333]
 [0.    0.    0.333 1.   ]]
smoothed: idf(was) = 1.0  cos(R1,R2) = 0.064</div>
  <p><code>(C &gt; 0).sum(axis=0)</code> turns counts into present/absent and adds down each column, which is df. <code>C * idf</code> multiplies every column by its IDF in one step (NumPy repeats the 13 IDF values across the 4 rows). Dividing each row by its length and multiplying the matrix by its own transpose gives every pairwise score, and the matrix matches the hand values: 0.333 for R3 and R4, 0 for R1 and R2.</p>
  <p>The last line is worth knowing for interviews. scikit-learn's <code>TfidfVectorizer</code> uses a <em>smoothed</em> IDF, ln((1 + N) / (1 + df)) + 1, as if one extra document contained every word, then adds 1. So "was" gets weight 1.0 rather than 0, and R1 and R2 score 0.064 rather than 0. To silence filler words in practice you add a stopword list (minding the "not" problem) or <code>max_df</code>, which drops words that appear in more than a given fraction of documents.</p>
  <p>TF-IDF fixed importance, but it has a serious blind spot. Every word is its own column, at right angles to every other column, so "great" and "good" are exactly as unrelated as "great" and "chai". That is why R1 and R2, two happy wrap reviews, score 0, and why a customer searching for "fiery kathi" would find nothing labelled "spicy roll". Even so, TF-IDF is far from dead. <strong>BM25</strong>, the scoring function behind most keyword search, is TF-IDF with two practical fixes: the tenth repeat of a word adds much less than the first, and long documents are penalised. It is the keyword half of the hybrid search in <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>.</p>

  <h2 id="nl-w2v"><span class="num">06</span>Word Embeddings and Word2Vec</h2>
  <p>We need numbers that place "great" near "good" and "roll" near "wrap". Nobody is going to hand-label which of a million words are similar, so the similarity has to be discovered from raw text. The key idea comes from linguistics: <strong>a word is known by the company it keeps</strong>. In Biteful reviews "great" and "good" appear in the same slots ("the roll was ___ and …", "___ chai, will order again"). If you keep reading "the paneer kathi was spicy", "chicken kathi arrived cold" and "egg kathi, never again", you can guess that a kathi is something like a roll without a dictionary, because it sits exactly where "roll" sits.</p>
  <p>A <strong>word embedding</strong> is a short list of numbers learned for each word so that words used in similar contexts get similar lists. Unlike the 13 (or 50,000) mostly-zero columns of bag of words, an embedding is <strong>dense</strong>: typically 50 to 300 numbers, all of them used. <strong>Word2Vec</strong> (2013) made learning them fast enough for billions of words. It never sees labels; it manufactures its own training examples from a sliding window over the text. With a window of one word on each side, R3 "curry was too hot" produces these examples:</p>
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
  <p>The <strong>skip-gram</strong> version turns every (centre word, neighbour) pair into one example of "given the centre word, predict this neighbour", giving six pairs from R3. The <strong>CBOW</strong> (continuous bag of words) version does the reverse: it averages the neighbours and predicts the centre, giving four examples. Skip-gram makes more examples per word, which helps rare words; CBOW is faster and smooths frequent ones.</p>
  <p>How does the model "predict a neighbour"? The obvious way, scoring every word in the vocabulary and turning the scores into probabilities, would touch 50,000 words for every single pair. <strong>Negative sampling</strong> replaces that with a few yes/no questions: is (hot, too) a real pair from the text? Is (hot, great), with "great" drawn at random, a real pair? Each word has two vectors, an input vector v used when it is the centre and an output vector u used when it is the neighbour. The model's belief that a pair is real is σ(v · u), where the sigmoid σ(x) = 1 / (1 + e<sup>−x</sup>) squashes any score into a probability between 0 and 1. Training pushes σ up for real pairs and down for random ones.</p>
  <p>Here is one training step on two-number vectors small enough to check on paper: v<sub>hot</sub> = [0.5, 0.5], the real neighbour u<sub>too</sub> = [0.2, −0.2], the random negative u<sub>great</sub> = [0.4, 0.0], and a learning rate of 1. The real pair scores 0.5·0.2 + 0.5·(−0.2) = 0, so σ = 0.5: the model is unsure it is real. The fake pair scores 0.2, so σ = 0.550: it leans towards calling the fake pair real. The loss is −ln 0.5 − ln(1 − 0.550) = 1.491. Each vector then moves a small step in the direction that lowers the loss:</p>
  <div class="fx" data-lang="py">import numpy as np
sig = lambda x: 1 / (1 + np.exp(-x))
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
  <p><code>e_pos</code> and <code>e_neg</code> are the two errors, σ − 1 for the real pair and σ − 0 for the fake one, and each gradient is an error times the other vector. After the step v<sub>hot</sub> = [0.38, 0.40], the real pair's probability rose from 0.500 to 0.548, the fake pair's fell from 0.550 to 0.484, and the loss dropped from 1.491 to 1.265. "hot" moved towards "too" and away from "great". Training is this step repeated millions of times over every pair in the text, with a handful of random negatives per pair; afterwards we keep the input vectors as the word embeddings.</p>
  <p>Four reviews are far too few to learn from, so the next block uses 4,000 synthetic reviews generated from ten templates that mimic how customers write: dish, filling, taste and temperature words, praise and complaints. The generator deliberately uses "hot" in two senses, as a taste word next to spicy and fiery and as a temperature word next to warm and steaming, which will matter in section 09. The <code>word2vec</code> helper repeats the step above over mini-batches of skip-gram pairs, written in plain NumPy; with the gensim library the equivalent call is <code>Word2Vec(reviews, vector_size=16, window=2, sg=1, negative=5, epochs=20)</code>.</p>
  <div class="fx" data-lang="py">from biteful_nlp import make_reviews, word2vec
reviews = make_reviews(4000)                  # synthetic Biteful reviews from 10 templates
print(len(reviews), "reviews, e.g.", [" ".join(s) for s in reviews[:3]])
wv = word2vec(reviews, dim=16, window=2, neg=5, epochs=20)
print("vocabulary:", len(wv.vocab), "words; 'great' -&gt;", wv["great"][:5].round(2), "...")
for w in ["great", "spicy", "roll", "chai"]:
    print(f"{w:6s} nearest:", [(n, round(s, 2)) for n, s in wv.most_similar(w)])</div>
  <div class="fx" data-lang="text">4000 reviews, e.g. ['soup arrived cold , terrible', 'delicious soup , will order again', 'the soup was warm and amazing']
vocabulary: 49 words; 'great' -&gt; [-0.09 -0.72  0.3   0.08  0.26] ...
great  nearest: [('tasty', 0.98), ('good', 0.98), ('amazing', 0.96)]
spicy  nearest: [('fiery', 0.97), ('hot', 0.77), ('light', 0.63)]
roll   nearest: [('wrap', 0.95), ('kathi', 0.94), ('biryani', 0.74)]
chai   nearest: [('soup', 0.96), ('coffee', 0.94), ('tea', 0.92)]</div>
  <p>Each word gets 16 numbers (a tiny vocabulary needs few; real models use 100 to 300). The individual numbers for "great" mean nothing on their own; only their relation to other vectors does, and those relations are right. "great" sits next to tasty, good and amazing; "roll" next to wrap and kathi; "chai" next to soup, coffee and tea. Nobody told the model any of this. Each word only ever appeared in similar slots. Large Word2Vec models famously turn relations into directions, so that king − man + woman lands near queen; our 49-word corpus is too small for reliable analogies, so we do not claim one.</p>
  <p>One property of this training objective surprises people. Opposites are used in the same slots ("the roll was spicy and great", "the roll was mild and great"), so Word2Vec places them close together; in section 08 spicy and mild come out with a cosine of 0.59. Embedding similarity means "used alike", which for antonyms is not "means alike", and sentiment or search systems built on embeddings must allow for it.</p>

  <h2 id="nl-static"><span class="num">07</span>GloVe and FastText</h2>
  <p>Word2Vec learns from one small window at a time. <strong>GloVe</strong> (Global Vectors, 2014) asks whether we could instead count, once, how often every word appears near every other word across the whole corpus, and fit vectors directly to those counts. The counts form a <strong>co-occurrence matrix</strong> X, where X<sub>ij</sub> is how often word j appears within a few positions of word i (closer neighbours counting more):</p>
  <div class="fx" data-lang="py">import numpy as np
vocab = sorted({w for s in reviews for w in s}); idx = {w: i for i, w in enumerate(vocab)}
X = np.zeros((len(vocab), len(vocab)))
for s in reviews:                                   # co-occurrence counts, window 2, weight 1/distance
    for i, w in enumerate(s):
        for j in range(max(0, i - 2), min(len(s), i + 3)):
            if j != i:
                X[idx[w], idx[s[j]]] += 1.0 / abs(i - j)
print(len(vocab), "words;", int((X &gt; 0).sum()), "non-zero pairs out of", X.size)
for a, b in [("spicy", "curry"), ("spicy", "chai"), ("warm", "curry"), ("warm", "chai")]:
    print(f"X[{a}, {b}] = {X[idx[a], idx[b]]:.1f}")</div>
  <div class="fx" data-lang="text">49 words; 848 non-zero pairs out of 2401
X[spicy, curry] = 7.0
X[spicy, chai] = 0.0
X[warm, curry] = 0.0
X[warm, chai] = 16.0</div>
  <p>The four printed counts show why such a table carries meaning. "spicy" appears near "curry" often and near "chai" never; "warm" is the reverse. GloVe's insight is that these <em>ratios</em> distinguish meanings, so it finds a vector w<sub>i</sub> for each word and c<sub>j</sub> for each context so that w<sub>i</sub> · c<sub>j</sub> plus two bias terms is close to log X<sub>ij</sub>. The logarithm turns ratios into differences, which dot products can represent. The fit is a weighted least-squares problem, Σ f(X<sub>ij</sub>)(w<sub>i</sub>·c<sub>j</sub> + b<sub>i</sub> + b'<sub>j</sub> − log X<sub>ij</sub>)², where the weight f caps the influence of very frequent pairs such as "was"–"the". Only the non-zero cells are used, which matters because a real 400,000-word vocabulary has 160 billion cells, nearly all zero. In practice GloVe and Word2Vec give vectors of similar quality, and both are widely available pretrained. They also share a weakness: a word that never appeared in training has no vector at all.</p>
  <p>Real reviews are full of typos and creative spellings: "spicyyy", "chaii", "paneerwrap". <strong>FastText</strong> (2016) fixes this by building each word's vector from its spelling. A word is represented by its <strong>character n-grams</strong>, the overlapping chunks of n letters after adding boundary markers &lt; and &gt;, plus the whole word itself, and its vector is the combination of the vectors of those pieces. Training uses the same skip-gram objective as Word2Vec. An unseen word still has n-grams, most of which were learned from real words, so it gets a sensible vector. You already do this yourself: you have never seen the dish "paneer-tikka-kathi", but you know its pieces, so you can guess what arrives.</p>
  <div class="fx" data-lang="py">from biteful_nlp import fasttext
def char_ngrams(word, nmin=3, nmax=5):
    w = f"&lt;{word}&gt;"
    return [w[i:i + n] for n in range(nmin, nmax + 1) for i in range(len(w) - n + 1)]

print("spicy 3-grams  :", char_ngrams("spicy", 3, 3))
print("spicyyy 3-grams:", char_ngrams("spicyyy", 3, 3))
ft = fasttext(reviews, dim=16, window=2, neg=5, epochs=20)    # same training, word = sum of its n-grams
for typo in ["spicyyy", "chaii", "paneerwrap"]:
    print(f"{typo:11s} in vocab? {typo in ft}  nearest:", [(w, round(s, 2)) for w, s in ft.most_similar(typo)])
try:
    wv["spicyyy"]
except KeyError as e:
    print("Word2Vec:", e)</div>
  <div class="fx" data-lang="text">spicy 3-grams  : ['&lt;sp', 'spi', 'pic', 'icy', 'cy&gt;']
spicyyy 3-grams: ['&lt;sp', 'spi', 'pic', 'icy', 'cyy', 'yyy', 'yy&gt;']
spicyyy     in vocab? False  nearest: [('spicy', 1.0), ('fiery', 1.0), ('hot', 0.87)]
chaii       in vocab? False  nearest: [('chai', 1.0), ('soup', 0.99), ('tea', 0.99)]
paneerwrap  in vocab? False  nearest: [('paneer', 0.94), ('egg', 0.93), ('chicken', 0.93)]
Word2Vec: "Key 'spicyyy' not present"</div>
  <p>The markers make "&lt;sp" (a word <em>starting</em> with sp) different from "sp" in the middle of a word. "spicyyy" shares four of its 3-grams with "spicy", and the model uses n-grams of length 3 to 5. None of the three typos is in the vocabulary, yet FastText returns sensible neighbours: "spicyyy" lands next to spicy and fiery, "chaii" next to chai, and "paneerwrap" (a missing space) next to the fillings. Word2Vec, asked for "spicyyy", can only raise <code>KeyError</code>. FastText also helps languages with many word forms, such as Hindi, Turkish or Finnish, where most forms are rare. Its weakness is the flip side of its strength: spelling similarity is not meaning similarity, so short look-alike words such as "chai" and "chair" can be pulled together.</p>

  <h2 id="nl-cos"><span class="num">08</span>Cosine Similarity</h2>
  <p>We have been quoting "similarity" since section 05, and it is time to define it properly. The dot product a · b = Σ a<sub>i</sub>b<sub>i</sub> grows when two vectors point the same way, but it also grows with their lengths, so a long review would look similar to everything just by being long. Dividing by both lengths leaves only the direction. That is <strong>cosine similarity</strong>: cos(a, b) = a · b / (‖a‖ ‖b‖), where ‖a‖ = √(Σ a<sub>i</sub>²). It ranges from 1 (same direction) through 0 (unrelated, at right angles) to −1 (opposite). Think of two customers who order the same thali, one a single plate and one for a party of ten: different sizes, same taste, cosine 1. By hand, a = [3, 4] and b = [6, 8] give 50 / (5 × 10) = 1, while a = [3, 4] and c = [4, −3] give 0 / 25 = 0. (More on vectors and angles in <a class="xref" data-note="m_linalg">Linear Algebra</a>.)</p>
  <p>Now we can score our two pairs of reviews under every representation built so far. For Word2Vec and FastText a review vector is simply the average of its word vectors, the simplest possible sentence vector:</p>
  <div class="fx" data-lang="py">def cos(a, b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

def avg_vec(tokens, kv):                       # review vector = mean of its word vectors
    return np.mean([kv[t] for t in tokens], axis=0)

reps = {
    "bag of words": C.astype(float),
    "TF-IDF (textbook)": T,
    "Word2Vec average": np.stack([avg_vec(t, wv) for t in clean]),
    "FastText average": np.stack([avg_vec(t, ft) for t in clean]),
}
print(f"{'representation':20s} {'R1 vs R2':&gt;9s} {'R3 vs R4':&gt;9s}")
for name, M in reps.items():
    print(f"{name:20s} {cos(M[0], M[1]):9.3f} {cos(M[2], M[3]):9.3f}")
print("word pairs:", {f"{a}-{b}": round(wv.similarity(a, b), 2)
      for a, b in [("great", "good"), ("spicy", "mild"), ("great", "awful")]})</div>
  <div class="fx" data-lang="text">representation        R1 vs R2  R3 vs R4
bag of words             0.200     0.750
TF-IDF (textbook)        0.000     0.333
Word2Vec average         0.934     0.920
FastText average         0.962     0.939
word pairs: {'great-good': 0.98, 'spicy-mild': 0.59, 'great-awful': 0.57}</div>
  <p>Read the table as the story of the note so far. Bag of words gives R1 and R2 only 0.2 (the shared "was") and R3 and R4 0.75. TF-IDF drops R1 and R2 to 0, because "was" was zeroed and great is at right angles to good. The averaged embeddings finally see R1 and R2 as close (0.93 and 0.96), because great ≈ good, roll ≈ wrap and paneer ≈ chicken in that space. But look at the last column: the same embeddings rate the chilli complaint R3 and the temperature complaint R4 as almost identical (0.92 and 0.94). TF-IDF's lower 0.333 only reflects that the nouns curry and chai differ, not that the complaints differ. No representation here can tell the two complaints apart. The word pairs also show the antonym effect from section 06: spicy and mild score 0.59, about as high as great and awful.</p>
  <p>Two practical notes. Cosine values are only comparable within one representation: 0.93 under averaged Word2Vec is not "more similar" than 0.33 under TF-IDF, so compare rankings, not raw scores, across methods. And for vectors already scaled to length 1, cosine equals the plain dot product, which is why search systems normalise every vector once and then use fast dot products (<a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>). The same formula finds similar users and items in <a class="xref" data-note="ml_cf">Collaborative Filtering</a>.</p>

  <h2 id="nl-ctx"><span class="num">09</span>The Context Problem</h2>
  <p>Biteful needs to send R3 to the kitchen (less chilli) and R4 to packaging (let drinks cool), and every method so far scores them as nearly the same review. The culprit is a single word. In R3 "hot" means spicy; in R4 it means high temperature. Every representation in this note gives "hot" one fixed vector, so let us look at where that vector sits:</p>
  <div class="fx" data-lang="py">print("hot nearest:", [(w, round(s, 2)) for w, s in wv.most_similar("hot", topn=5)])
for a, b in [("hot", "spicy"), ("hot", "warm"), ("spicy", "warm")]:
    print(f"cos({a}, {b}) = {wv.similarity(a, b):.3f}")</div>
  <div class="fx" data-lang="text">hot nearest: [('steaming', 0.82), ('warm', 0.81), ('fiery', 0.8), ('spicy', 0.77), ('light', 0.63)]
cos(hot, spicy) = 0.767
cos(hot, warm) = 0.812
cos(spicy, warm) = 0.492</div>
  <p>"hot" is close to both spicy (0.77) and warm (0.81), while spicy and warm themselves are far apart (0.49). The single vector is a <strong>blend</strong> of its two senses, weighted by how often each appeared in training. Its nearest neighbours mix both senses: steaming and warm, then fiery and spicy. This is not a training failure. Word2Vec, GloVe and FastText are all lookup tables: the row for "hot" is the same whatever sentence the word is in. Such vectors are called <strong>static embeddings</strong>, and a static embedding cannot serve R3 and R4 at the same time.</p>
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
  </svg><figcaption>Left: a static model gives "hot" one point between its two senses. Right: a contextual model computes a different vector for each use, next to its real meaning.</figcaption></figure>
  <p>The figure shows the difference. On the left, the static model has one point for "hot", stranded between the chilli words and the temperature words. On the right, a model that reads the sentence first produces two different vectors: the "hot" next to "curry" lands among the chilli words, and the "hot" next to "chai" among the temperature words. A vector computed for each <em>occurrence</em> of a word, from the sentence around it, is a <strong>contextual embedding</strong>. The textbook example is "bank" (river bank or bank account); Biteful's is "hot", and "cold" has the same issue ("cold coffee" is a dish, "coffee arrived cold" is a complaint).</p>
  <p>Two models introduced contextual embeddings in 2018. <strong>ELMo</strong> ran recurrent networks (<a class="xref" data-note="dl_rnns">RNNs</a>) forwards and backwards over the sentence and used their internal states as word vectors; it worked, but RNNs read one word at a time and forget over long text. <strong>BERT</strong> used a Transformer, in which every word looks directly at every other word through <a class="xref" data-note="dl_attention">attention</a>, so "hot" can pull information straight from "curry" or "chai". That is the subject of <a class="xref" data-note="transformers">Transformers</a>, which starts from exactly these two reviews. Note that a Transformer still begins with this note's oldest ideas: a subword tokenizer turns text into IDs, and a learned embedding table, a direct descendant of Word2Vec's input vectors, turns IDs into starting vectors that attention then adjusts.</p>

  <h2 id="nl-build"><span class="num">10</span>A Review Classifier and How to Score It</h2>
  <p>The cure for "hot" lives in the next note, but the toolkit we have is already useful, and it is worth seeing what it can do before reaching for a large model. Biteful's first real job is <strong>text classification</strong>, predicting a label for a whole document: flag angry reviews for a reply. With ten hand-labelled reviews we build two classifiers. Both use <strong>logistic regression</strong>, which gives every feature a weight, adds up the weighted features and squashes the sum through a sigmoid into a probability. Classifier A uses TF-IDF features over words and bigrams, with no stopword removal so that "not good" survives. Classifier B uses the averaged Word2Vec vector of each review from section 06. Two of the five test reviews use only words that never appear in the training reviews.</p>
  <div class="fx" data-lang="py">import re, numpy as np
train_texts = ["loved the paneer roll, great taste", "excellent biryani, really happy",
               "chai was hot and good", "good value and good quality", "tasty wrap, will order again",
               "terrible curry, arrived cold", "soggy roll, want a refund", "not good, very disappointed",
               "awful biryani and slow delivery", "not worth the money, cold coffee"]
y = np.array([1, 1, 1, 1, 1, 0, 0, 0, 0, 0])                   # 1 = happy, 0 = angry
tests = ["great roll, happy with it", "coffee arrived cold, want a refund", "not good at all",
         "delicious kathi , amazing", "lukewarm soup , disappointing"]
toks = lambda t: re.findall(r"[a-z]+", t.lower())
feats = lambda t: toks(t) + [a + " " + b for a, b in zip(toks(t), toks(t)[1:])]   # words + bigrams

vocab = sorted({f for t in train_texts for f in feats(t)})     # fitted on TRAINING text only
col = {f: j for j, f in enumerate(vocab)}
df = np.array([sum(f in feats(t) for t in train_texts) for f in vocab])
idf = np.log(len(train_texts) / df) + 1
def tfidf(t):
    v = np.zeros(len(vocab))
    for f in feats(t):
        if f in col: v[col[f]] += idf[col[f]]                   # unseen features are simply dropped
    return v / (np.linalg.norm(v) or 1)

def avg_w2v(t):
    known = [w for w in toks(t) if w in wv]
    return np.mean([wv[w] for w in known], axis=0) if known else np.zeros(16)

def train_logreg(X, y, steps=3000, lr=0.5, l2=0.01):
    w, b = np.zeros(X.shape[1]), 0.0
    for _ in range(steps):
        p = 1 / (1 + np.exp(-(X @ w + b)))                     # sigmoid of a weighted sum
        w -= lr * (X.T @ (p - y) / len(y) + l2 * w); b -= lr * (p - y).mean()
    return lambda Z: 1 / (1 + np.exp(-(Z @ w + b))), w

model_a, w_a = train_logreg(np.stack([tfidf(t) for t in train_texts]), y)
model_b, _ = train_logreg(np.stack([avg_w2v(t) for t in train_texts]), y)
pa = model_a(np.stack([tfidf(t) for t in tests])); pb = model_b(np.stack([avg_w2v(t) for t in tests]))
print(f"{'P(happy)':&gt;8s} {'TF-IDF':&gt;7s} {'W2V':&gt;6s}   review")
for t, a, b in zip(tests, pa, pb):
    print(f"{'':8s} {a:7.2f} {b:6.2f}   {t}")
order = np.argsort(w_a)
print("most angry features:", [vocab[j] for j in order[:4]])
print("most happy features:", [vocab[j] for j in order[-4:]])</div>
  <div class="fx" data-lang="text">P(happy)  TF-IDF    W2V   review
            0.67   0.70   great roll, happy with it
            0.14   0.13   coffee arrived cold, want a refund
            0.33   0.14   not good at all
            0.49   0.82   delicious kathi , amazing
            0.49   0.13   lukewarm soup , disappointing
most angry features: ['not', 'cold', 'good very', 'disappointed']
most happy features: ['really', 'happy', 'really happy', 'and good']</div>
  <p>The vocabulary and IDF values are computed from the training reviews only, which matters (section 12). On test reviews made from training words, both models are right: "coffee arrived cold, want a refund" gets a low probability of being happy, and "not good at all" is flagged because "not" is the most negative feature, as the last two lines show. On "delicious kathi, amazing" and "lukewarm soup, disappointing", however, the TF-IDF model outputs 0.49 for both. None of those words was in training, so it has no evidence and falls back to roughly a coin toss. The embedding model is confident and correct (0.82 and 0.13), because "delicious" sits next to "great" and "lukewarm" next to "cold" in embedding space. That is the practical value of embeddings: knowledge about similar words learned from unlabelled text carries over to a task with very few labels.</p>
  <p>The TF-IDF model has an advantage too: it is <strong>interpretable</strong>. Every feature has one weight you can read, so you can explain why a review was flagged. The embedding model's 16 weights mean nothing to a person. Averaging also loses order and negation ("not good" averages "not" with "good"), and sarcasm such as "great, cold again" defeats both models. TF-IDF plus logistic regression remains the standard <strong>baseline</strong>: it trains in a second and any bigger model has to beat it to justify its cost.</p>
  <p>Once a classifier runs on 10,000 reviews, we need one honest number for how good it is, and accuracy is often the wrong number. If only 1 review in 100 is a complaint, a model that never flags anything is 99% accurate and completely useless. For "find the rare thing" tasks we count three outcomes: a <strong>true positive</strong> (TP) is a complaint the model flagged, a <strong>false positive</strong> (FP) is a happy review it wrongly flagged, and a <strong>false negative</strong> (FN) is a complaint it missed. <strong>Precision</strong> = TP / (TP + FP) answers "of the reviews I flagged, how many were complaints?". <strong>Recall</strong> = TP / (TP + FN) answers "of the real complaints, how many did I catch?". <strong>F1</strong> = 2PR / (P + R), the harmonic mean, is low if either one is low. A fire alarm with high precision rarely rings for burnt toast; one with high recall never misses a real fire.</p>
  <p>By hand: 100 reviews contain 20 complaints, and the model flags 10 reviews, 8 of them real complaints. So TP = 8, FP = 2, FN = 12; precision is 8/10 = 0.8, recall 8/20 = 0.4, and F1 = 2 × 0.8 × 0.4 / 1.2 = 0.533:</p>
  <div class="fx" data-lang="py">def precision_recall_f1(y_true, y_pred):
    tp = sum(t == 1 and p == 1 for t, p in zip(y_true, y_pred))
    fp = sum(t == 0 and p == 1 for t, p in zip(y_true, y_pred))
    fn = sum(t == 1 and p == 0 for t, p in zip(y_true, y_pred))
    prec = tp / (tp + fp) if tp + fp else 0.0
    rec = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
    return round(prec, 3), round(rec, 3), round(f1, 3)

y_true = [1]*20 + [0]*80                          # 1 = complaint: 20 complaints, 80 happy
y_pred = [1]*8 + [0]*12 + [1]*2 + [0]*78          # caught 8, missed 12, 2 false alarms
print("precision, recall, F1:", precision_recall_f1(y_true, y_pred))

y_rare = [1] + [0]*99                             # 1 complaint in 100 reviews
y_never = [0]*100                                 # a model that never flags anything
accuracy = sum(t == p for t, p in zip(y_rare, y_never)) / 100
print("never-flag model: accuracy", accuracy, " precision, recall, F1:", precision_recall_f1(y_rare, y_never))</div>
  <div class="fx" data-lang="text">precision, recall, F1: (0.8, 0.4, 0.533)
never-flag model: accuracy 0.99  precision, recall, F1: (0.0, 0.0, 0.0)</div>
  <p>The first line reproduces the hand numbers: when this model flags a review it is usually right, but it misses 60% of complaints, and F1 shows that weakness. The second line is the accuracy trap made concrete: on one complaint in 100, the never-flag model scores 0.99 accuracy and 0 on everything that matters. Report precision, recall and F1 for the class you care about, and decide which error costs more: a missed complaint or a needless reply.</p>

  <h2 id="nl-tasks"><span class="num">11</span>Word-Level Tasks</h2>
  <p>Everything so far labels a whole review. Biteful also wants to know <em>which words</em> name the dish, the restaurant and the city in "Ordered paneer roll from Tandoor Tales in Pune, arrived cold", so it can route the complaint. Labelling individual words is called <strong>sequence labelling</strong>. Before LLMs, each of the classic tasks needed its own trained model; today an LLM can do them from an instruction, but the names come up in interviews and in libraries such as spaCy.</p>
  <table class="tbl">
    <tr><th>Task</th><th>Output</th><th>Biteful example</th></tr>
    <tr><td><strong>POS tagging</strong></td><td>part of speech for each word</td><td>arrived/VERB cold/ADJ (lemmatizers need this, section 03)</td></tr>
    <tr><td><strong>NER</strong> (named entity recognition)</td><td>spans naming dishes, restaurants, places, dates</td><td>[paneer roll]DISH from [Tandoor Tales]REST in [Pune]LOC</td></tr>
    <tr><td><strong>Dependency parsing</strong></td><td>who did what to whom</td><td>"roll" is the subject of "arrived"; "cold" describes how it arrived</td></tr>
  </table>
  <p>NER has a wrinkle: a model labels one token at a time, but "Tandoor Tales" is one name made of two words. The <strong>BIO</strong> scheme solves this by turning spans into per-token labels: B-X marks the beginning of an entity of type X, I-X a token inside it, and O a token outside any entity. "Ordered paneer roll from Tandoor Tales in Pune" becomes O, B-DISH, I-DISH, O, B-REST, I-REST, O, B-LOC. Turning the tags back into spans is a short loop:</p>
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
  <p>The loop walks left to right: a B- tag opens a new span, an I- tag of the same type extends it, and anything else closes it. The B tag exists so that two entities of the same type side by side ("paneer roll, egg roll") are kept apart. Choosing the right tags needs context: "Tandoor" alone could be an oven or the start of a restaurant name. A static vector cannot tell which; a contextual one can, which is why NER, like the "hot" problem, is done with Transformers today. When scoring NER, judge whole spans, not single tokens: tagging "Tandoor" as B-REST but "Tales" as O is a wrong entity, even though one token was right.</p>

  <h2 id="nl-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most damaging mistake is removing stopwords without reading the list. Standard lists contain "not", "no" and "too", so "the roll was not too spicy" became "roll spicy" in section 03, flipping its meaning. For sentiment work keep negations and intensifiers, or skip stopword removal entirely and let IDF or the model decide what matters. For Transformers, skip all classic normalisation.</p>
  <p>The second is <strong>data leakage</strong> through the vocabulary. The vocabulary and the IDF weights are learned from data, so they must be learned from the training set only. If you fit them on all reviews and then split into train and test, the test reviews have already influenced the features, and the test score is optimistic. In section 10 the classifier built its vocabulary from <code>train_texts</code> alone and simply dropped unseen test words; in scikit-learn, putting the vectorizer and the classifier in one <code>Pipeline</code> guarantees the same.</p>
  <p>The third is trusting accuracy on imbalanced data, shown in section 10: a model that never flags a complaint can be 99% accurate. Use precision, recall and F1, and for NER score whole entity spans.</p>
  <p>Several smaller mistakes are worth a sentence each. Assuming scikit-learn's TF-IDF gives "was" a weight of 0 is wrong, because its IDF is smoothed. Comparing cosine scores across different representations is meaningless; compare rankings. Treating embedding similarity as synonymy misses that antonyms are used alike. Counting words to estimate LLM cost or context fails, because limits are in tokens. And using BERT's [CLS] vector, or any raw model output, as a sentence embedding without a model trained for similarity usually gives poor search results; <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a> covers models trained for that job.</p>

  <h2 id="nl-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Representation</b>: the numbers chosen to stand for a piece of text.</li>
    <li><b>Token</b>: the unit a model reads, with an integer ID in a fixed <b>vocabulary</b>.</li>
    <li><b>Subword tokenization</b> (BPE, WordPiece, Unigram): whole frequent words plus pieces; characters or bytes as fallback, so nothing is unknown.</li>
    <li><b>Normalisation</b>: lowercasing, stopword removal, <b>stemming</b> (rule-based chopping) or <b>lemmatization</b> (dictionary base form).</li>
    <li><b>Bag of words</b>: count of each vocabulary word per document; order lost; sparse.</li>
    <li><b>N-gram</b>: n consecutive tokens used as one feature.</li>
    <li><b>TF-IDF</b>: count × ln(N/df); high for words frequent here and rare elsewhere. <b>BM25</b>: TF-IDF with saturation and length penalty.</li>
    <li><b>Word embedding</b>: dense learned vector; similar contexts → similar vectors.</li>
    <li><b>Static</b> embedding: one vector per word. <b>Contextual</b>: one vector per occurrence (ELMo, BERT, LLMs).</li>
    <li><b>Precision</b> TP/(TP+FP), <b>recall</b> TP/(TP+FN), <b>F1</b> their harmonic mean.</li>
    <li><b>BIO tags</b>: B-X begins entity X, I-X continues it, O is outside.</li>
  </ul>
  <h3>Representations compared</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Fixes</th><th>Still can't</th><th>R1 vs R2 / R3 vs R4</th></tr>
    <tr><td>Bag of words</td><td>text → fixed-length vector</td><td>weight importance; see order</td><td>0.20 / 0.75</td></tr>
    <tr><td>TF-IDF</td><td>filler words dominating</td><td>see synonyms</td><td>0 / 0.33</td></tr>
    <tr><td>Word2Vec / GloVe</td><td>synonyms (great ≈ good)</td><td>unseen words; word sense</td><td>0.93 / 0.92</td></tr>
    <tr><td>FastText</td><td>typos and unseen words</td><td>word sense</td><td>0.96 / 0.94</td></tr>
    <tr><td>Transformers (next note)</td><td>word sense from context</td><td>—</td><td>—</td></tr>
  </table>
  <h3>Formulas</h3>
  <div class="fx" data-lang="text">idf(w)        = ln(N / df(w))                    textbook; scikit-learn: ln((1+N)/(1+df)) + 1
tfidf(w, d)   = tf(w, d) × idf(w)
cos(a, b)     = a·b / (‖a‖ ‖b‖)                   1 same, 0 unrelated, −1 opposite
sigmoid(x)    = 1 / (1 + e^−x)
SGNS loss     = −ln σ(v_w·u_c) − Σ_n ln(1 − σ(v_w·u_n))   real pair c, random negatives n
GloVe         = min Σ f(X_ij) (w_i·c_j + b_i + b'_j − log X_ij)²
FastText      vec(w) = combination of vectors for char n-grams of "&lt;w&gt;" plus the word
precision     = TP/(TP+FP)   recall = TP/(TP+FN)   F1 = 2PR/(P+R)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Stopword lists delete "not" and "too".</li>
    <li>Fit vocabulary and IDF on training data only.</li>
    <li>Tokens are not words: prices and limits are in tokens.</li>
    <li>Synonyms are orthogonal in BoW and TF-IDF; antonyms are close in embeddings.</li>
    <li>Static vectors blend senses ("hot" between spicy and warm).</li>
    <li>Accuracy hides failure on imbalanced classes.</li>
  </ul>

  <h2 id="nl-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is tokenization, and why do modern models use subword tokens?</summary><div class="qa-body">Tokenization cuts text into the units a model reads, each mapped to an integer ID. Word vocabularies are huge and still produce an unknown token for typos and new words; characters never fail but make sequences long and each token nearly meaningless. Subword methods such as BPE keep frequent words whole and split rare ones into known pieces, with characters or bytes as a fallback, so nothing is unknown.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does byte-pair encoding learn its vocabulary?</summary><div class="qa-body">It starts with every word spelled as characters, counts every pair of neighbouring symbols weighted by word frequency, merges the most frequent pair into a new symbol, and repeats for a chosen number of merges. The ordered list of merges is the tokenizer: a new word is split into characters and the merges are replayed in order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Stemming vs lemmatization?</summary><div class="qa-body">Stemming chops word endings by fixed rules: fast, but can produce non-words ("deliveries" → "deliveri") and misses irregular forms. Lemmatization looks the word up in a dictionary with its part of speech and returns the real base form ("better" → "good"): slower, correct. Stem for search indexes and counts; lemmatize when the base must be a real word; do neither for Transformers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your sentiment model calls "the roll was not too spicy" a complaint about spice. What is the likely bug?</summary><div class="qa-body">Stopword removal deleted "not" and "too", leaving "roll spicy". Keep negations and intensifiers (use a custom list or none) and add bigrams so "not too" becomes a feature.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is bag of words, and what are its weaknesses?</summary><div class="qa-body">Each document becomes a vector of word counts over the vocabulary, ignoring order. It loses word order ("dog bites man" equals "man bites dog"), lets frequent filler words dominate comparisons, produces huge sparse vectors, and treats every pair of different words as unrelated, including synonyms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain TF-IDF. What does it fix, and what does it leave unfixed?</summary><div class="qa-body">TF-IDF multiplies a word's count in a document by ln(N/df), so words found in every document get weight near 0 and distinctive words get high weight. It fixes filler words dominating similarity. It does not fix synonyms: each word is its own axis, so "great" and "good" share nothing and two reviews with different but synonymous words score 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>With scikit-learn's TfidfVectorizer, does a word that appears in every document get weight 0?</summary><div class="qa-body">No. scikit-learn uses a smoothed IDF, ln((1+N)/(1+df)) + 1, which equals 1 for a word in every document, and then normalises each row to length 1. To suppress such words use <code>max_df</code> or a stopword list.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is BM25 and how does it relate to TF-IDF?</summary><div class="qa-body">BM25 is a ranking function built on the same idea as TF-IDF, with two changes: term frequency saturates, so the tenth repeat of a word adds much less than the first, and longer documents are penalised. It is the standard keyword score in search engines and the keyword half of hybrid retrieval in RAG systems.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Word2Vec learn word vectors? Skip-gram vs CBOW?</summary><div class="qa-body">It slides a window over text and trains a shallow model to predict context: skip-gram predicts each neighbour from the centre word, CBOW predicts the centre word from the averaged neighbours. Words that appear in similar contexts are pushed towards similar vectors. Skip-gram creates more examples per word and helps rare words; CBOW is faster.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is negative sampling used?</summary><div class="qa-body">A full softmax over the vocabulary needs one dot product per vocabulary word for every training pair. Negative sampling replaces it with a few binary questions: push σ(v·u) up for the real pair and down for k randomly drawn words. The cost per pair falls from the vocabulary size to k + 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>GloVe vs Word2Vec?</summary><div class="qa-body">Word2Vec learns from local windows one pair at a time with a prediction objective. GloVe first counts global co-occurrences and fits vectors so that their dot product approximates the log of the count, with a weight that limits very frequent pairs. In practice both give vectors of similar quality, and both have no vector for unseen words.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does FastText handle a word it has never seen?</summary><div class="qa-body">Each word's vector is built from vectors of its character n-grams (with boundary markers) plus the word itself. An unseen word such as "spicyyy" still has n-grams like "spi", "pic" and "icy" that were learned from real words, so its vector lands near "spicy". Word2Vec and GloVe have no row for it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use cosine similarity instead of the raw dot product?</summary><div class="qa-body">The dot product grows with vector length, so long documents look similar to everything. Cosine divides by both lengths and keeps only the direction. For vectors normalised to length 1 the two are identical, which is why search systems normalise once and then use fast dot products.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do word embeddings often place antonyms like "hot" and "cold" close together?</summary><div class="qa-body">The training objective only rewards predicting neighbours, and antonyms fill the same slots ("the coffee was ___"). Similar contexts produce similar vectors, so embedding similarity means "used alike", not "means alike". Systems that need polarity must learn it from labelled data or use contextual models.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the main limitation of Word2Vec, GloVe and FastText, and what solved it?</summary><div class="qa-body">They are static: one vector per word in every sentence, so a word with two senses ("hot" as spicy or as high temperature) gets a blend of both. Contextual models compute a vector for each occurrence from the surrounding sentence: ELMo with bidirectional RNNs, then BERT and LLMs with Transformer attention.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A complaint detector has 99% accuracy. Is it good?</summary><div class="qa-body">You cannot tell. If 1% of reviews are complaints, a model that never flags anything also has 99% accuracy with zero recall. Report precision, recall and F1 for the complaint class, and decide which error is more costly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is BIO tagging, and why is it needed for NER?</summary><div class="qa-body">A model labels one token at a time but entities can span several tokens. BIO gives each token B-X (begins entity X), I-X (inside X) or O (outside), turning span detection into per-token classification. The B tag separates two adjacent entities of the same type.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you still choose TF-IDF with logistic regression over a Transformer?</summary><div class="qa-body">When the budget or latency is tiny, when the model must run on a small device, when you need weights a person can read, or when there is plenty of labelled data and keywords carry the signal. It should always be built first as the baseline any bigger model must beat.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a Transformer still need a tokenizer and an embedding table?</summary><div class="qa-body">A Transformer computes on vectors. The tokenizer turns text into IDs and the embedding table, a learned lookup like Word2Vec's input vectors, turns IDs into starting vectors. These start static; attention layers then adjust each one using the rest of the sentence, which is what makes them contextual.</div></details>
</main>
`
});
