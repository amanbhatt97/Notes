// notes/genai/llm_basics.js — How LLMs Work
Object.assign(TOPIC_CONTENT, {
  "llm_basics": `<main>
  <h1>How LLMs Work</h1>
  <div class="where"><span>Generative AI</span><span>Foundations</span><span>How LLMs Work</span></div>
  <p class="lead">From <a class="xref" data-note="transformers">Transformers</a> you know the decoder: tokens go in, one vector per position comes out. This note turns that into a working large language model (LLM), one need at a time: how a vector becomes a next-token guess, how guessing trillions of times is the whole training, what tokens and context windows are, how the model picks a word (greedy, temperature, top-k, top-p), why answers change between runs, how a base model becomes a chat assistant, what LLMs cannot do, how size relates to quality, and which model families exist today. The running example for the whole Generative AI track is <strong>Biteful's support assistant</strong>: Asha writes <em>"Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"</em> and the model must reply. Every number below is computed on that message or on the reply "Your order is ___". All code ran here (Python 3.13, NumPy, single thread); no paid API was called anywhere in this note.</p>

  <h2 id="lb-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 190" width="660">
<defs><marker id="lb-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="42" text-anchor="middle" font-size="12">NLP Foundations</text><text x="85" y="59" text-anchor="middle" class="tm" font-size="10">tokens, embeddings</text>
<rect x="10" y="110" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="132" text-anchor="middle" font-size="12">Transformers</text><text x="85" y="149" text-anchor="middle" class="tm" font-size="10">attention, decoder-only</text>
<rect x="250" y="62" width="160" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="330" y="86" text-anchor="middle" font-size="13" font-weight="700">How LLMs Work</text><text x="330" y="104" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="500" y="10" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="31" text-anchor="middle" font-size="12">Prompt Engineering</text><text x="575" y="48" text-anchor="middle" class="tm" font-size="10">steer it with words</text>
<rect x="500" y="70" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="91" text-anchor="middle" font-size="12">LLM APIs</text><text x="575" y="108" text-anchor="middle" class="tm" font-size="10">call it from code</text>
<rect x="500" y="130" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="151" text-anchor="middle" font-size="12">RAG · Fine-tuning</text><text x="575" y="168" text-anchor="middle" class="tm" font-size="10">fix what it can't do</text>
<line x1="160" y1="45" x2="248" y2="80" stroke="currentColor" marker-end="url(#lb-a0)"/><line x1="160" y1="135" x2="248" y2="100" stroke="currentColor" marker-end="url(#lb-a0)"/>
<line x1="410" y1="80" x2="498" y2="38" stroke="currentColor" marker-end="url(#lb-a0)"/><line x1="410" y1="90" x2="498" y2="95" stroke="currentColor" marker-end="url(#lb-a0)"/><line x1="410" y1="100" x2="498" y2="152" stroke="currentColor" marker-end="url(#lb-a0)"/>
</svg><figcaption>This note turns the transformer into a product you can reason about: what it predicts, what it costs, where it fails.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="transformers">Transformers</a> and <a class="xref" data-note="nlp">NLP Foundations</a></b><span>Text becomes tokens, tokens become vectors, causal self-attention mixes each position with the ones before it, and the decoder outputs one vector per position. Left open: what do we <em>do</em> with the last vector, and how does that become a chatbot?</span></li>
    <li><b>This note adds: the LLM itself</b><span>The last vector → scores for every token → probabilities → a sampled word, repeated. Trained only by guessing the next token. Then tokens, context windows, sampling knobs, post-training into a chat model, and the honest list of limits.</span></li>
    <li><b>Leads to: <a class="xref" data-note="prompting">Prompt Engineering</a> and <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a></b><span>Once you know the model only continues text, you learn to write the text it continues (prompting) and to send it from code (APIs). Its limits motivate <a class="xref" data-note="rag">RAG</a> (missing knowledge), tools (live data, arithmetic) and <a class="xref" data-note="finetuning">Fine-Tuning</a> (changing behaviour).</span></li>
  </ol>

  <h2 id="lb-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers are from Asha's message and the reply "Your order is ___".</p>
  <ol class="story">
    <li><b>Next-token prediction</b><span>Q: what does a transformer actually output? → From the last vector, one score (logit) per vocabulary token; softmax turns them into probabilities: on 0.563, late 0.207, ready 0.126, delivered 0.076, cancelled 0.028. But where do good scores come from?</span></li>
    <li><b>Pretraining</b><span>Q: how does it learn those scores without labels? → Hide the next token, guess, pay loss = −log p(true token), adjust. On our 10-line toy corpus training drops the loss from 3.219 (uniform guess) to 0.730. But what exactly is a "token", and how many fit?</span></li>
    <li><b>Tokens &amp; the context window</b><span>Q: what are the units it reads, and what is the limit? → Sub-word pieces: Asha's 63 characters are 21 GPT-2 tokens; the same question in Hindi costs about 5× more tokens per character. One call can see only so many tokens: our request was 79 tokens over an 8,192 window. We have probabilities; how is one word picked?</span></li>
    <li><b>Sampling</b><span>Q: how is a single token chosen? → Greedy takes "on" every time; temperature reshapes (T = 2 gives "cancelled" 0.084 instead of 0.028); top-k / top-p cut the tail (top-p 0.9 removes "cancelled"). But then the same question gets different answers…</span></li>
    <li><b>Why outputs vary</b><span>Q: why does the reply change between runs, even at temperature 0? → Random draws (4 seeds, 4 different continuations), and float sums that round differently (a tied "on"/"late" flips between runs). We can now generate text. But does generating text equal answering?</span></li>
    <li><b>Base vs instruction-tuned vs chat</b><span>Q: why doesn't a pretrained model answer Asha? → A base model continues text ("where is my order is my order is"). SFT on (question → answer) pairs, then preference tuning (RLHF / DPO: loss 0.554 for a margin of 3) make it an assistant. It answers fluently now. But is the answer true?</span></li>
    <li><b>What LLMs can't do</b><span>Q: what fails even in a good chat model? → No memory between calls, a knowledge cutoff (it has never seen order 101), hallucination (a flat 0.36 / 0.33 / 0.31 guess still comes out confident), and shaky arithmetic ("1240" is two tokens "12" + "40"). Would a bigger model fix it?</span></li>
    <li><b>Scaling laws</b><span>Q: what does size buy? → Loss falls as a smooth power law (2.830 → 2.376 → 1.994 per 10× parameters); compute ≈ 6·N·D. Better, never perfect. So which real models should you pick from?</span></li>
    <li><b>Model families &amp; sizes</b><span>Q: what exists today, and what does size cost to run? → Closed APIs (Claude, GPT, Gemini) vs open weights (Llama, Qwen, Mistral, Gemma, DeepSeek); 8B weights = 16 GB in fp16, 4 GB in 4-bit; reasoning models spend extra tokens thinking. Next note: how to write the text they continue.</span></li>
  </ol>

  <h2 id="lb-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
  <div class="mm-center">How LLMs Work</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Next token</div>
      <ul>
        <li><b>Last vector</b> h × unembedding W → one <b>logit</b> per token</li>
        <li><b>Softmax</b> → probabilities that sum to 1</li>
        <li>"Your order is": on 0.563 · late 0.207 · ready 0.126 · delivered 0.076 · cancelled 0.028</li>
        <li><b>Autoregressive</b> — pick, append, run again</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Pretraining</div>
      <ul>
        <li><b>Self-supervised</b> — the text is its own answer key</li>
        <li><b>Loss</b> = −log p(true next token); <b>perplexity</b> = e<sup>avg loss</sup></li>
        <li>Toy: loss 3.219 → 0.730 (best possible 0.702)</li>
        <li>⚠ <b>Base model ≠ chatbot</b></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Tokens &amp; window</div>
      <ul>
        <li>Asha: 63 chars → <b>21 tokens</b> (GPT-2 BPE)</li>
        <li>Hindi 19 chars → 29 tokens; English ≈ 4 chars/token</li>
        <li><b>Context window</b> = prompt + output tokens per call</li>
        <li><b>KV cache</b> — 128 KiB/token for an 8B-class model</li>
        <li>Price and latency are per token; output ≈ 5× input price</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Sampling</div>
      <ul>
        <li><b>Greedy</b> — argmax, repeatable, loops</li>
        <li><b>Temperature</b> — logits ÷ T; ranking never changes</li>
        <li><b>Top-k</b> fixed count · <b>top-p</b> smallest set ≥ p</li>
        <li>top-p 0.9 keeps 4 of 5 (drops "cancelled")</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Variation</div>
      <ul>
        <li>Sampling = randomness by design</li>
        <li>⚠ <b>T = 0 not deterministic</b>: float sums depend on order</li>
        <li>Test properties (valid JSON, right label), not exact strings</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Base → chat</div>
      <ul>
        <li><b>SFT</b> — (instruction → answer) pairs</li>
        <li><b>RLHF / DPO</b> — prefer chosen over rejected</li>
        <li><b>Chat template</b> — roles become marker tokens</li>
        <li>💡 fresher: library → job training → feedback on taste</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Can't do</div>
      <ul>
        <li><b>No memory</b> — your code resends history</li>
        <li><b>Cutoff / private data</b> — never saw order 101</li>
        <li><b>Hallucination</b> — plausible ≠ true → ground it (RAG)</li>
        <li><b>Arithmetic</b> — numbers split into odd tokens → tools</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Scale &amp; families</div>
      <ul>
        <li>C ≈ 6·N·D; Chinchilla ≈ 20 tokens/param</li>
        <li>Closed API vs open weights; 8B fp16 = 16 GB</li>
        <li><b>Reasoning models</b> think in extra (billed) tokens</li>
      </ul>
    </div>
  </div>
</div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lb-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="lb-next"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Predicting the Next Token</span><span class="rm-sub">Vector → logits → probabilities</span></div></div>
      <div class="rm-item rm-done" data-target="lb-pretrain"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Pretraining</span><span class="rm-sub">Loss on a tiny corpus, trained</span></div></div>
      <div class="rm-item rm-done" data-target="lb-tokens"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Tokens &amp; Context Window</span><span class="rm-sub">Count Asha's tokens; KV cache</span></div></div>
      <div class="rm-item rm-done" data-target="lb-sample"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Sampling</span><span class="rm-sub">Greedy, temperature, top-k, top-p by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lb-vary"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Why Outputs Vary</span><span class="rm-sub">Seeds and float order</span></div></div>
      <div class="rm-item rm-done" data-target="lb-stages"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Base, Instruct, Chat</span><span class="rm-sub">SFT, RLHF, DPO</span></div></div>
      <div class="rm-item rm-done" data-target="lb-limits"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">What LLMs Can't Do</span><span class="rm-sub">Memory, cutoff, hallucination, maths</span></div></div>
      <div class="rm-item rm-done" data-target="lb-scale"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Scaling Laws</span><span class="rm-sub">Why bigger kept working</span></div></div>
      <div class="rm-item rm-done" data-target="lb-family"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Model Families &amp; Sizes</span><span class="rm-sub">Closed, open, reasoning (Oct 2026)</span></div></div>
      <div class="rm-item rm-done" data-target="lb-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One loop, many consequences</span></div></div>
      <div class="rm-item rm-done" data-target="lb-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Base vs chat, T = 0, words vs tokens</span></div></div>
      <div class="rm-item rm-done" data-target="lb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="lb-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="lb-next"><span class="num">01</span>A Transformer Predicts the Next Token</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Transformers note ended with a decoder that turns "Your order is" into one vector per position. A vector is not a reply. What turns it into the next word?</p>
  </div>
  <p>Biteful's assistant has already written "Your order is" and must choose the next word. The transformer has read those three tokens and produced a vector for the last position. That vector summarises "what should come next", but it is just a list of numbers. We need a score for every word the model knows, so we can pick one.</p>
  <p>In plain words: the model keeps one learned vector per vocabulary token (a big table called the <strong>unembedding</strong>). It takes the dot product of the last position's vector with every row. A big dot product means "this token fits here". Those raw scores are <strong>logits</strong>. <strong>Softmax</strong> turns logits into probabilities: make each positive with e<sup>z</sup>, then divide by the total so they sum to 1.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An auto-complete keyboard on your phone. After "Your order is" it shows its three favourite next words. An LLM is that keyboard with a vocabulary of 50,000–200,000 tokens and a much better sense of context. It never "looks up" an answer; it scores every possible next token.</p>
  </div>
  <h3>Traced by hand: five candidate words</h3>
  <p>Shrink everything so it fits on paper: the vector is h = [1, 0.5, −1] and the vocabulary is five words. Each logit is one dot product.</p>
  <table class="tbl">
    <tr><th>Token</th><th>Row of W</th><th>Logit = row · h</th><th>e<sup>logit</sup></th><th>p = e / 13.124</th></tr>
    <tr><td>on</td><td>[1, 2, 0]</td><td>1 + 1 + 0 = 2.0</td><td>7.389</td><td>0.563</td></tr>
    <tr><td>late</td><td>[0, 2, 0]</td><td>0 + 1 + 0 = 1.0</td><td>2.718</td><td>0.207</td></tr>
    <tr><td>ready</td><td>[0.5, 0, 0]</td><td>0.5</td><td>1.649</td><td>0.126</td></tr>
    <tr><td>delivered</td><td>[1, 0, 1]</td><td>1 + 0 − 1 = 0.0</td><td>1.000</td><td>0.076</td></tr>
    <tr><td>cancelled</td><td>[0, 0, 1]</td><td>−1.0</td><td>0.368</td><td>0.028</td></tr>
  </table>
  <p>The total of the e column is 7.389 + 2.718 + 1.649 + 1.000 + 0.368 = 13.124. The code does the same arithmetic:</p>
<div class="fx" data-lang="py">import numpy as np

# The transformer has read "Your order is" and produced one vector for the
# LAST position. Real models: ~4,000+ numbers. Ours: 3, so we can check by hand.
h = np.array([1.0, 0.5, -1.0])

# Unembedding: one row per vocabulary token. Real vocab: 50k-200k rows. Ours: 5.
vocab = ["on", "late", "ready", "delivered", "cancelled"]
W = np.array([[1.0, 2.0, 0.0],    # on
              [0.0, 2.0, 0.0],    # late
              [0.5, 0.0, 0.0],    # ready
              [1.0, 0.0, 1.0],    # delivered
              [0.0, 0.0, 1.0]])   # cancelled

logits = W @ h                    # one dot product per token = a raw score
probs = np.exp(logits) / np.exp(logits).sum()   # softmax: positive, sums to 1
for w, z, p in zip(vocab, logits, probs):
    print(f"{w:10s} logit={z:5.2f}  p={p:.3f}")
print("sum of p:", round(probs.sum(), 6))
print("most likely next token:", vocab[int(np.argmax(probs))])</div>
<div class="fx" data-lang="text">on         logit= 2.00  p=0.563
late       logit= 1.00  p=0.207
ready      logit= 0.50  p=0.126
delivered  logit= 0.00  p=0.076
cancelled  logit=-1.00  p=0.028
sum of p: 1.0
most likely next token: on</div>
  <p><code>W @ h</code> computes all five dot products at once (a matrix times a vector). <code>np.exp(logits) / np.exp(logits).sum()</code> is softmax. The output matches the table. Notice what the numbers do <em>not</em> say: nothing here checked whether Asha's order really is on the way. "on" wins because, in the text the model learned from, "Your order is on the way" is a very common continuation. Keep that in mind for section 07.</p>
  <div class="flow"><span>"Your order is"</span><span>Transformer</span><span>last vector h</span><span>logits = W h</span><span>softmax → p</span><span>pick "on"</span><span>append, run again</span></div>
  <p>One token is not a reply. The model appends the chosen token ("Your order is on") and runs again to get the next one, and again, until it emits an end token or hits a length limit. Generating one token at a time, each conditioned on everything before, is called <strong>autoregressive</strong> generation.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>large language model</strong> is a (usually decoder-only) transformer with billions of parameters that outputs a probability distribution over its vocabulary for the next token. <strong>Logit</strong>: the raw score for one token, logit<sub>i</sub> = w<sub>i</sub> · h. <strong>Softmax</strong>: p<sub>i</sub> = e<sup>logit<sub>i</sub></sup> / Σ<sub>j</sub> e<sup>logit<sub>j</sub></sup>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Thinking the model "retrieves" an answer from a database. It scores tokens. A confident-sounding reply is just a sequence of high-probability tokens; whether it is true depends on whether the training text (or your prompt) made the true continuation likely.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Pretraining.</b> We assumed a good W and a good h. Where do weights that rank "on" above "cancelled" come from, with no human labelling anything?</div>

  <h2 id="lb-pretrain"><span class="num">02</span>Pretraining: Learning From Next-Token Loss</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 01 used weights that already made sensible predictions. How does a model with random weights become one whose favourite continuation of "Your order is" is "on"?</p>
  </div>
  <p>Writing rules for every possible reply is hopeless, and labelling millions of "good answers" by hand is slow. What exists for free is a mountain of text. The trick is to turn that text into a quiz the computer marks itself: hide the next token, guess, reveal. The text already contains the right answer, so no human is needed. That phase is <strong>pretraining</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A child doing fill-in-the-blank exercises from every newspaper in India: "Virat Kohli hit a ___", "The monsoon reached Kerala on ___". To get good, the child must learn grammar, cricket, geography and dates. Nobody taught those directly; they were needed to fill the blanks. The analogy breaks in one place: the model does this on more text than a person could read in a thousand lifetimes.</p>
  </div>
  <h3>Traced: the loss on one support line</h3>
  <p>Our "internet" is 10 lines of Biteful support chat. The simplest language model is a <strong>bigram</strong> model: it predicts the next token from the previous one only, using counts. (A transformer conditions on all previous tokens; the loss is computed exactly the same way.) For the line "your order is on the way .", every position is one quiz question, and the penalty is <strong>loss = −log p(true next token)</strong>: 0 when the model gave the true token probability 1, large when it was surprised.</p>
<div class="fx" data-lang="py">import numpy as np
from collections import Counter, defaultdict
from biteful_corpus import SENTENCES

# "Training" the simplest language model: count which token follows which.
follow = defaultdict(Counter)
for s in SENTENCES:
    for prev, nxt in zip(s, s[1:]):          # every position is one quiz question
        follow[prev][nxt] += 1

def p_next(prev, nxt):
    return follow[prev][nxt] / sum(follow[prev].values())

print("after 'is':", dict(follow["is"]))

# Score one training sentence: loss = -log p(true next token) at every position
target = ["&lt;s&gt;"] + "your order is on the way .".split()
losses = []
for prev, nxt in zip(target, target[1:]):
    p = p_next(prev, nxt)
    loss = -np.log(p) + 0.0                   # + 0.0 turns -0.0 into 0.0
    losses.append(loss)
    print(f"{prev:6s} -&gt; {nxt:6s} p={p:.3f}  loss={loss:.3f}")
avg = np.mean(losses)
print("questions from one 7-token line:", len(losses))
print("average loss:", round(avg, 3), " perplexity:", round(np.exp(avg), 2))</div>
<div class="fx" data-lang="text">after 'is': {'my': 3, 'late': 2, 'on': 3, 'ready': 1, 'cold': 1}
&lt;s&gt;    -&gt; your   p=0.500  loss=0.693
your   -&gt; order  p=0.800  loss=0.223
order  -&gt; is     p=0.714  loss=0.336
is     -&gt; on     p=0.300  loss=1.204
on     -&gt; the    p=1.000  loss=0.000
the    -&gt; way    p=1.000  loss=0.000
way    -&gt; .      p=0.500  loss=0.693
questions from one 7-token line: 7
average loss: 0.45  perplexity: 1.57</div>
  <p>Check one line by hand. After "is" the corpus has my 3, late 2, on 3, ready 1, cold 1 = 10 cases, so p(on | is) = 3/10 = 0.300 and the loss is −ln 0.3 = 1.204: the model was unsure whether "your order is" continues with "on" or "late". After "on" the next token is always "the", so p = 1 and loss 0. The average loss over the 7 questions is 0.45; <strong>perplexity</strong> e<sup>0.45</sup> = 1.57 means "on average as unsure as choosing between about 1.6 equally likely tokens".</p>
  <h3>Traced: training actually lowers the loss</h3>
  <p>Counting is a shortcut that only works for a tiny table. Real models learn by <strong>gradient descent</strong>: start from weights that know nothing, compute the average loss over many questions, nudge every weight a little in the direction that lowers it, repeat. Below, the same bigram model is a 25 × 25 table of logits, trained from all zeros (every token equally likely).</p>
<div class="fx" data-lang="py">import numpy as np
from biteful_corpus import SENTENCES

vocab = sorted({t for s in SENTENCES for t in s})
idx = {t: i for i, t in enumerate(vocab)}
pairs = [(idx[a], idx[b]) for s in SENTENCES for a, b in zip(s, s[1:])]
X = np.array([a for a, _ in pairs]); Y = np.array([b for _, b in pairs])
V = len(vocab)
print("vocabulary size:", V, " training questions:", len(pairs))

# The model: a table of logits, one row per previous token. Start at all zeros
# (= every next token equally likely). Training = gradient descent on the loss.
L = np.zeros((V, V))
def avg_loss(L):
    z = L[X] - L[X].max(1, keepdims=True)
    logp = z - np.log(np.exp(z).sum(1, keepdims=True))
    return -logp[np.arange(len(Y)), Y].mean()

lr = 5.0
for step in range(301):
    if step in (0, 10, 50, 300):
        print(f"step {step:3d}  average loss {avg_loss(L):.3f}")
    z = L[X] - L[X].max(1, keepdims=True)
    p = np.exp(z) / np.exp(z).sum(1, keepdims=True)
    p[np.arange(len(Y)), Y] -= 1                  # gradient of cross-entropy w.r.t. logits
    grad = np.zeros_like(L); np.add.at(grad, X, p / len(Y))
    L -= lr * grad

print("uniform guess loss = ln(V) =", round(np.log(V), 3))
# The best a bigram table can ever do = use the exact counted frequencies
C = np.zeros((V, V)); np.add.at(C, (X, Y), 1)
best = -np.mean(np.log(C[X, Y] / C[X].sum(1)))
print("best possible (counted frequencies):", round(best, 3))
z = L[idx["is"]]; p = np.exp(z - z.max()); p /= p.sum()
print("learned p(next | 'is'):",
      {vocab[i]: round(float(p[i]), 2) for i in np.argsort(-p)[:5]})</div>
<div class="fx" data-lang="text">vocabulary size: 25  training questions: 67
step   0  average loss 3.219
step  10  average loss 1.949
step  50  average loss 0.995
step 300  average loss 0.730
uniform guess loss = ln(V) = 3.219
best possible (counted frequencies): 0.702
learned p(next | 'is'): {'my': 0.3, 'on': 0.3, 'late': 0.2, 'ready': 0.1, 'cold': 0.1}</div>
  <p>At step 0 the loss is exactly ln 25 = 3.219: a uniform guess over 25 tokens. Training brings it to 0.730, close to 0.702, the best any bigram table can do on this data. The learned p(next | "is") is now my 0.3, on 0.3, late 0.2, ready 0.1, cold 0.1, which is exactly the counts. The line <code>p[np.arange(len(Y)), Y] -= 1</code> is the whole gradient of cross-entropy with respect to the logits (predicted probabilities minus the one-hot truth). A real LLM does the same thing with billions of weights and trillions of tokens, and because its context is the whole preceding text, not one word, it ends up learning grammar, facts and some reasoning as a side effect of predicting better.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pretraining</strong>: training a decoder transformer to predict the next token on a huge text corpus by minimising <strong>cross-entropy loss</strong>, the average of −log p(true next token). It is <strong>self-supervised</strong>: labels come from the text itself. <strong>Perplexity</strong> = e<sup>average loss</sup>. One sequence of n tokens gives n − 1 training questions, all computed in one parallel pass thanks to the causal mask.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A pretrained (<strong>base</strong>) model is not a chatbot. It learned to continue text, so given a question it may continue with more questions. Section 06 shows our toy model doing exactly that and how post-training fixes it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Tokens &amp; the context window.</b> We split text on spaces. Real models split it into "tokens" that are not words, and can only read a limited number of them. What are they, and how many does Asha's message cost?</div>

  <h2 id="lb-tokens"><span class="num">03</span>Tokens &amp; the Context Window</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Pretraining predicts "the next token", and section 01 had a vocabulary. But what is a token in real text, how many tokens is Asha's message, and is there a limit to how many the model can read at once?</p>
  </div>
  <p>A fixed list of whole words can't handle typos, new restaurant names or other languages, and a list of single characters makes sequences very long. LLMs use <strong>sub-word tokens</strong> built by byte-pair encoding (BPE, from <a class="xref" data-note="transformers">Transformers</a>): common words are one token, rare words are split into pieces. Everything about cost, speed and limits is counted in these tokens, so count them with the real tokenizer, not by words.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>SMS-era abbreviations. Frequent words get a short code ("pls", "thx"); a rare name has to be spelled out letter group by letter group. A tokenizer is a fixed codebook learned from text: frequent strings are cheap, rare ones are expensive.</p>
  </div>
  <h3>Counting Asha's tokens with a real tokenizer</h3>
  <p>We use GPT-2's real BPE vocabulary (50,257 tokens). Its file ships inside the openai-whisper package, so it works offline. Claude, GPT-4-class and Llama models use larger, different vocabularies, so their counts differ a little, but the behaviour is the same.</p>
<div class="fx" data-lang="py">import tiktoken
from tiktoken.load import load_tiktoken_bpe

# GPT-2's real byte-pair-encoding vocabulary (50,257 tokens). The file ships
# inside the openai-whisper package (whisper/assets/gpt2.tiktoken), so this
# works offline. Newer models use bigger vocabularies, but the idea is the same.
enc = tiktoken.Encoding(
    name="gpt2",
    explicit_n_vocab=50257,
    pat_str=r"""'s|'t|'re|'ve|'m|'ll|'d| ?\\p{L}+| ?\\p{N}+| ?[^\\s\\p{L}\\p{N}]+|\\s+(?!\\S)|\\s+""",
    mergeable_ranks=load_tiktoken_bpe("gpt2.tiktoken"),
    special_tokens={"&lt;|endoftext|&gt;": 50256},
)</div>
<div class="fx" data-lang="py">from gpt2_tok import enc

asha = "Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"
ids = enc.encode(asha)
print(len(asha), "characters -&gt;", len(ids), "tokens")
print([enc.decode([i]) for i in ids])
print("first ids:", ids[:6])

for label, text in [
    ("Hindi", "मेरा ऑर्डर कहाँ है?"),                       # "where is my order?"
    ("JSON ", '{"order_id": 101, "restaurant": "Dosa Hut"}'),
    ("English", "Where is my order?"),
]:
    n = len(enc.encode(text))
    print(f"{label:7s} {len(text):3d} chars -&gt; {n:3d} tokens  (chars/4 guess: {len(text) // 4})")</div>
<div class="fx" data-lang="text">63 characters -&gt; 21 tokens
['Hi', ',', ' my', ' order', ' 101', ' from', ' D', 'osa', ' Hut', ' was', ' due', ' at', ' 8', ':', '30', ' pm', '.', ' Where', ' is', ' it', '?']
first ids: [17250, 11, 616, 1502, 8949, 422]
Hindi    19 chars -&gt;  29 tokens  (chars/4 guess: 4)
JSON     43 chars -&gt;  17 tokens  (chars/4 guess: 10)
English  18 chars -&gt;   5 tokens  (chars/4 guess: 4)</div>
  <p>Asha's 63 characters became 21 tokens: about 3 characters per token. Common words (" order", " Where") are one token each and carry their leading space. "Dosa" is not common in English text, so it splits into " D" + "osa". The time "8:30" is three tokens. The same question in Hindi needs 29 tokens for 19 characters, because GPT-2's vocabulary was learned mostly from English and Devanagari falls apart into byte pieces. The rule of thumb "4 characters per token" (the <code>// 4</code> column) is fine for English prose and badly wrong for Hindi or JSON.</p>
  <h3>The context window: a hard budget</h3>
  <p>The model can attend to at most a fixed number of tokens in one call, counting the prompt <em>and</em> the reply. That limit is the <strong>context window</strong>: small open models have a few thousand to 128K tokens, current frontier APIs up to about 1M. Anything outside the window does not exist for the model.</p>
<div class="fx" data-lang="py"># Does one Biteful request fit in the context window? Count everything the
# model must read PLUS room for what it will write.
WINDOW = 8_192                      # a small open model's window (example)
parts = {
    "system prompt (rules)": 350,
    "delivery policy doc":   5_000,
    "chat history so far":   2_400,
    "Asha's new message":    21,     # counted with the real tokenizer above
}
reserve_output = 500                # max_tokens we allow for the reply
used = sum(parts.values()) + reserve_output
for k, v in parts.items():
    print(f"{k:24s}{v:6,d}")
print(f"{'reserved for the reply':24s}{reserve_output:6,d}")
print(f"total {used:,} of {WINDOW:,} -&gt;", "fits" if used &lt;= WINDOW else f"over by {used - WINDOW:,}")</div>
<div class="fx" data-lang="text">system prompt (rules)      350
delivery policy doc      5,000
chat history so far      2,400
Asha's new message          21
reserved for the reply     500
total 8,271 of 8,192 -&gt; over by 79</div>
  <p>Our request is 79 tokens over an 8,192 window. Two fixes: trim the oldest history, or send only the relevant part of the policy instead of all 5,000 tokens. The second fix is the core idea of <a class="xref" data-note="rag">RAG</a>. Even when everything fits, facts buried in the middle of a very long prompt are used less reliably than facts near the start or end ("lost in the middle").</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An exam where you may bring one A4 sheet. Whatever fits on the sheet you can use; whatever doesn't, you don't have. Tiny writing crammed in the middle gets missed under pressure.</p>
  </div>
  <h3>Inside one call: prefill, decode and the KV cache</h3>
  <p>The prompt is known in advance, so all its tokens go through the model in one parallel pass: <strong>prefill</strong>, which sets the <strong>time to first token</strong> (TTFT). The reply is not known, so each output token needs its own pass: <strong>decode</strong>, which sets tokens per second. Each token produces a key and a value vector in every layer, and a new token attends to all earlier ones. Those keys and values never change, so the server keeps them in GPU memory instead of recomputing them: the <strong>KV cache</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <text x="10" y="44" class="tm">K</text><text x="10" y="84" class="tm">V</text>
    <rect x="40" y="26" width="60" height="26" rx="3" class="fg sg"/><rect x="40" y="66" width="60" height="26" rx="3" class="fg sg"/>
    <text x="70" y="44" text-anchor="middle">k1</text><text x="70" y="84" text-anchor="middle">v1</text><text x="70" y="112" text-anchor="middle">Your</text>
    <rect x="112" y="26" width="60" height="26" rx="3" class="fg sg"/><rect x="112" y="66" width="60" height="26" rx="3" class="fg sg"/>
    <text x="142" y="44" text-anchor="middle">k2</text><text x="142" y="84" text-anchor="middle">v2</text><text x="142" y="112" text-anchor="middle">order</text>
    <rect x="184" y="26" width="60" height="26" rx="3" class="fg sg"/><rect x="184" y="66" width="60" height="26" rx="3" class="fg sg"/>
    <text x="214" y="44" text-anchor="middle">k3</text><text x="214" y="84" text-anchor="middle">v3</text><text x="214" y="112" text-anchor="middle">is</text>
    <rect x="256" y="26" width="60" height="26" rx="3" class="fg sg"/><rect x="256" y="66" width="60" height="26" rx="3" class="fg sg"/>
    <text x="286" y="44" text-anchor="middle">k4</text><text x="286" y="84" text-anchor="middle">v4</text><text x="286" y="112" text-anchor="middle">on</text>
    <rect x="328" y="26" width="60" height="26" rx="3" class="fg sg"/><rect x="328" y="66" width="60" height="26" rx="3" class="fg sg"/>
    <text x="358" y="44" text-anchor="middle">k5</text><text x="358" y="84" text-anchor="middle">v5</text><text x="358" y="112" text-anchor="middle">the</text>
    <rect x="400" y="26" width="60" height="26" rx="3" class="fb sb"/><rect x="400" y="66" width="60" height="26" rx="3" class="fb sb"/>
    <text x="430" y="44" text-anchor="middle">k6</text><text x="430" y="84" text-anchor="middle">v6</text><text x="430" y="112" text-anchor="middle" class="tb">?</text>
    <rect x="34" y="18" width="358" height="82" rx="6" fill="none" class="sg" stroke-dasharray="5 4"/>
    <text x="40" y="136" class="tg">cached: computed once, read every step</text>
    <text x="40" y="156" class="tb">new token: only its k, v are computed</text>
    <text x="470" y="136" class="tm">cost: GPU memory</text><text x="470" y="156" class="tm">128 KiB / token*</text>
    </svg><figcaption>Decode step 6 of "Your order is on the ___": reuse k1–v5 from the cache. *8B-class model (32 layers, 8 KV heads, head dim 128, fp16).</figcaption></figure>
<div class="fx" data-lang="py">n = 1000                                    # tokens to generate

# Without a cache: step t recomputes K and V for all t tokens so far
without_cache = sum(range(1, n + 1))
# With a cache: step t computes K and V for the one new token only
with_cache = n
print("K,V computations without cache:", without_cache)
print("K,V computations with cache   :", with_cache)

# Memory: 2 (K and V) x layers x KV heads x head dim x bytes per number
layers, kv_heads, head_dim, bytes_fp16 = 32, 8, 128, 2   # Llama-3-8B-style
per_token = 2 * layers * kv_heads * head_dim * bytes_fp16
print("per token :", per_token, "bytes =", per_token // 1024, "KiB")
for seq in [8_192, 128_000]:
    print(f"{seq:&gt;7} tokens: {per_token * seq / 2**30:.2f} GiB per conversation")
print("32 users x 8K:", per_token * 8_192 * 32 / 2**30, "GiB")</div>
<div class="fx" data-lang="text">K,V computations without cache: 500500
K,V computations with cache   : 1000
per token : 131072 bytes = 128 KiB
   8192 tokens: 1.00 GiB per conversation
 128000 tokens: 15.62 GiB per conversation
32 users x 8K: 32.0 GiB</div>
  <p>Without the cache, step t recomputes keys and values for all t tokens: 1 + 2 + … + 1000 = 500,500 computations. With it, one per step: 1,000. The price is memory: 2 × 32 × 8 × 128 × 2 bytes = 128 KiB per token, 1 GiB per 8K-token conversation, 32 GiB for 32 users. Serving long contexts to many users is limited by memory, which is why grouped-query attention (fewer KV heads) and 8-bit caches exist.</p>
  <h3>Tokens are also the unit of price and time</h3>
  <p>APIs bill per token, with output tokens priced about 5× input because each needs its own decode pass. Asha's request is about 450 input tokens (rules + order record + her message) and a 60-token reply. The full cost arithmetic for a day of Biteful traffic is in <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>; here is one reply:</p>
<div class="fx" data-lang="py"># List prices, USD per 1M tokens (input, output), Anthropic's table as of Oct 2026.
# Examples only: prices change, check the provider's pricing page.
PRICES = {
    "claude-opus-5-5":   (4.00, 20.00),
    "claude-sonnet-5-5": (2.00, 10.00),
    "claude-haiku-5-5":  (0.10,  0.50),
}
def call_cost(model, input_tokens, output_tokens):
    p_in, p_out = PRICES[model]
    return input_tokens * p_in / 1e6 + output_tokens * p_out / 1e6

def latency(output_tokens, ttft=0.5, tokens_per_sec=60):   # assumed speeds
    return ttft + output_tokens / tokens_per_sec

# Asha's request: rules + order record + her message = 450 tokens in; a 60-token reply
for model in PRICES:
    print(f"{model:18s} \${call_cost(model, 450, 60):.6f} per reply")
print("latency for a 60-token reply :", round(latency(60), 2), "s")
print("latency for a 600-token reply:", round(latency(600), 2), "s")</div>
<div class="fx" data-lang="text">claude-opus-5-5    $0.003000 per reply
claude-sonnet-5-5  $0.001500 per reply
claude-haiku-5-5   $0.000075 per reply
latency for a 60-token reply : 1.5 s
latency for a 600-token reply: 10.5 s</div>
  <p>Check the Opus line: 450 × $4 / 1M = $0.0018 plus 60 × $20 / 1M = $0.0012, total $0.0030. The 60 output tokens cost two thirds as much as the 450 input tokens. Latency ≈ TTFT + output tokens ÷ speed: a 10× longer reply takes 7× longer here. The prices are Anthropic's list prices as of October 2026, used as examples.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Token</strong>: one entry of the model's sub-word vocabulary. <strong>Context window</strong>: the maximum number of tokens (prompt + output) one call can attend to. <strong>KV cache</strong>: the per-sequence store of every past token's keys and values, kept during generation; memory per token = 2 × layers × KV heads × head dim × bytes. <strong>Cost per call</strong> = input tokens × input price + output tokens × output price.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Budgeting by words or characters. Hindi, code, numbers and JSON can need far more tokens than the 4-characters rule predicts (Hindi: 29 real vs 4 guessed; JSON: 17 vs 10). Count with the provider's tokenizer or token-counting endpoint. And don't confuse the KV cache (inside one generation, on the server) with prompt caching (reusing a prefix across API calls, in <a class="xref" data-note="llm_apis">LLM APIs</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Sampling.</b> We know what the model reads and that it outputs a probability for every token. Five candidates have probabilities 0.563 … 0.028. Which one is actually written, and who decides?</div>

  <h2 id="lb-sample"><span class="num">04</span>Sampling: Greedy, Temperature, Top-k, Top-p</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>After "Your order is" the model gives on 0.563, late 0.207, ready 0.126, delivered 0.076, cancelled 0.028. A reply needs one word. Always take the top one? Draw at random? Something in between?</p>
  </div>
  <p>The rule that turns probabilities into one token is the <strong>decoding</strong> or <strong>sampling</strong> strategy. It changes the personality of the output a lot: always taking the top token is safe but dull and can loop; drawing at random is varied but can pick nonsense from the tail. Four knobs cover almost every system.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A nervous speaker at a wedding toast, choosing each next word. <strong>Greedy</strong>: always the safest word. <strong>Temperature</strong>: a boldness dial; high, they sometimes say something wild. <strong>Top-k</strong>: "only consider your 2 favourite words". <strong>Top-p</strong>: "only consider the words that together cover 90% of your confidence": one or two when sure, many when unsure.</p>
  </div>
  <h3>Temperature by hand</h3>
  <p>Temperature T divides every logit before softmax. Our logits are [2, 1, 0.5, 0, −1].</p>
  <table class="tbl">
    <tr><th></th><th>on</th><th>late</th><th>ready</th><th>delivered</th><th>cancelled</th></tr>
    <tr><td>T = 0.5: logits ÷ 0.5</td><td>4</td><td>2</td><td>1</td><td>0</td><td>−2</td></tr>
    <tr><td>e<sup>z</sup> (total 65.840)</td><td>54.598</td><td>7.389</td><td>2.718</td><td>1</td><td>0.135</td></tr>
    <tr><td>p at T = 0.5</td><td>0.829</td><td>0.112</td><td>0.041</td><td>0.015</td><td>0.002</td></tr>
    <tr><td>p at T = 1</td><td>0.563</td><td>0.207</td><td>0.126</td><td>0.076</td><td>0.028</td></tr>
    <tr><td>T = 2: logits ÷ 2 → e<sup>z</sup> (total 7.258)</td><td>2.718</td><td>1.649</td><td>1.284</td><td>1</td><td>0.607</td></tr>
    <tr><td>p at T = 2</td><td>0.375</td><td>0.227</td><td>0.177</td><td>0.138</td><td>0.084</td></tr>
  </table>
<div class="fx" data-lang="py">import numpy as np

vocab  = ["on", "late", "ready", "delivered", "cancelled"]
logits = np.array([2.0, 1.0, 0.5, 0.0, -1.0])     # "Your order is ___" (section 01)

def softmax(z):
    z = z - z.max()          # stability: biggest logit becomes 0 (same answer)
    e = np.exp(z)
    return e / e.sum()

for T in [0.5, 1.0, 2.0]:
    p = softmax(logits / T)
    print(f"T={T}:", " ".join(f"{w}={x:.3f}" for w, x in zip(vocab, p)))

p = softmax(logits)
print("running total (sorted):", np.round(np.cumsum(np.sort(p)[::-1]), 3))</div>
<div class="fx" data-lang="text">T=0.5: on=0.829 late=0.112 ready=0.041 delivered=0.015 cancelled=0.002
T=1.0: on=0.563 late=0.207 ready=0.126 delivered=0.076 cancelled=0.028
T=2.0: on=0.375 late=0.227 ready=0.177 delivered=0.138 cancelled=0.084
running total (sorted): [0.563 0.77  0.896 0.972 1.   ]</div>
  <p>The code matches the table. Low T doubles the gaps, so "on" takes 83%; high T halves them, so "cancelled" triples from 0.028 to 0.084. The order of the five words never changes; only how sharp the distribution is. As T → 0 all mass goes to "on" (greedy); as T → ∞ every word tends to 0.2.</p>
  <h3>Top-k and top-p by hand</h3>
  <p><strong>Top-k = 2</strong> keeps "on" and "late" and renormalises: 0.563 / 0.770 = 0.731 and 0.207 / 0.770 = 0.269. <strong>Top-p = 0.9</strong> adds tokens in order until the running total reaches 0.9: 0.563 (no), 0.770 (no), 0.896 (still no, just short), 0.972 (yes). So four tokens survive and only "cancelled" is cut. That is the useful part: the tail token that would tell Asha her order was cancelled can never be drawn.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <line x1="40" y1="150" x2="590" y2="150" stroke="currentColor" opacity="0.4"/>
    <rect x="60" y="65.6" width="60" height="84.4" class="fg sg"/><text x="90" y="168" text-anchor="middle">on</text><text x="90" y="59" text-anchor="middle" class="tm">Σ0.563</text>
    <rect x="160" y="119" width="60" height="31" class="fg sg"/><text x="190" y="168" text-anchor="middle">late</text><text x="190" y="113" text-anchor="middle" class="tm">Σ0.770</text>
    <rect x="260" y="131.1" width="60" height="18.9" class="fg sg"/><text x="290" y="168" text-anchor="middle">ready</text><text x="290" y="125" text-anchor="middle" class="tm">Σ0.896</text>
    <rect x="360" y="138.6" width="60" height="11.4" class="fg sg"/><text x="390" y="168" text-anchor="middle">delivered</text><text x="390" y="132" text-anchor="middle" class="tm">Σ0.972</text>
    <rect x="460" y="145.8" width="60" height="4.2" class="fs"/><text x="490" y="168" text-anchor="middle">cancelled</text><text x="490" y="139" text-anchor="middle" class="tm">Σ1.000</text>
    <line x1="240" y1="30" x2="240" y2="150" class="sb" stroke-width="2" stroke-dasharray="5 4"/><text x="240" y="24" text-anchor="middle" class="tb">top-k = 2</text>
    <line x1="440" y1="30" x2="440" y2="150" class="sr" stroke-width="2"/><text x="440" y="24" text-anchor="middle" class="tr">top-p = 0.9</text>
    </svg><figcaption>T = 1 probabilities with running totals (Σ). Top-k = 2 always keeps two; top-p = 0.9 keeps the smallest set reaching 0.9 (four here). Survivors are renormalised.</figcaption></figure>
  <h3>A complete sampler</h3>
  <p>The function applies the knobs in the order real inference engines do: temperature, then top-k or top-p filtering, then renormalise and draw. It draws 1,000 tokens per strategy with a fixed seed.</p>
<div class="fx" data-lang="py">import numpy as np

vocab  = ["on", "late", "ready", "delivered", "cancelled"]
logits = np.array([2.0, 1.0, 0.5, 0.0, -1.0])

def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()

def sample(logits, temperature=1.0, top_k=None, top_p=None, rng=None):
    rng = rng or np.random.default_rng()
    if temperature == 0:                 # greedy: always the argmax
        return int(np.argmax(logits))
    probs = softmax(logits / temperature)
    if top_k is not None:                # keep the k most likely tokens
        cutoff = np.sort(probs)[-top_k]
        probs = np.where(probs &gt;= cutoff, probs, 0.0)
    if top_p is not None:                # keep the smallest set with mass &gt;= p
        order = np.argsort(probs)[::-1]
        cum = np.cumsum(probs[order])
        keep = order[: np.searchsorted(cum, top_p) + 1]
        mask = np.zeros_like(probs); mask[keep] = 1.0
        probs = probs * mask
    probs = probs / probs.sum()          # renormalise what survived
    return int(rng.choice(len(probs), p=probs))

rng = np.random.default_rng(0)
for name, kw in [("greedy", dict(temperature=0)),
                 ("T=1.0", dict(temperature=1.0)),
                 ("T=2.0", dict(temperature=2.0)),
                 ("T=1, top_k=2", dict(temperature=1.0, top_k=2)),
                 ("T=1, top_p=0.9", dict(temperature=1.0, top_p=0.9))]:
    picks = [vocab[sample(logits, rng=rng, **kw)] for _ in range(1000)]
    counts = {w: picks.count(w) for w in vocab if picks.count(w)}
    print(f"{name:15s}", counts)</div>
<div class="fx" data-lang="text">greedy          {'on': 1000}
T=1.0           {'on': 530, 'late': 228, 'ready': 142, 'delivered': 70, 'cancelled': 30}
T=2.0           {'on': 416, 'late': 213, 'ready': 153, 'delivered': 137, 'cancelled': 81}
T=1, top_k=2    {'on': 743, 'late': 257}
T=1, top_p=0.9  {'on': 588, 'late': 216, 'ready': 123, 'delivered': 73}</div>
  <ul>
    <li><strong>greedy</strong>: the <code>temperature == 0</code> branch returns the argmax, so all 1,000 picks are "on".</li>
    <li><strong>T = 2</strong>: "cancelled" rises from 30 to 81 per 1,000, close to the 0.084 computed above.</li>
    <li><strong>top_k = 2</strong>: <code>np.where(probs &gt;= cutoff, …)</code> zeroes everything below the second best; 743 vs 257 matches 0.731 vs 0.269.</li>
    <li><strong>top_p = 0.9</strong>: <code>np.searchsorted(cum, top_p) + 1</code> = 4 tokens; "cancelled" never appears.</li>
  </ul>
  <table class="tbl">
    <tr><th>Knob</th><th>What it does</th><th>Effect</th></tr>
    <tr><td><strong>Greedy</strong> (T = 0)</td><td>Always the top token</td><td>Repeatable in theory; dull; can loop</td></tr>
    <tr><td><strong>Temperature T</strong></td><td>Divide logits by T before softmax</td><td>T &lt; 1 sharper (safer); T &gt; 1 flatter (varied, more errors)</td></tr>
    <tr><td><strong>Top-k</strong></td><td>Keep the k most likely tokens</td><td>Cuts the tail; k is fixed whatever the confidence</td></tr>
    <tr><td><strong>Top-p</strong> (nucleus)</td><td>Keep the smallest set with total ≥ p</td><td>Adaptive: few tokens when sure, many when unsure</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Greedy decoding</strong>: pick argmax p. <strong>Temperature sampling</strong>: sample from softmax(logits / T). <strong>Top-k</strong>: sample among the k most probable tokens. <strong>Top-p (nucleus)</strong>: sample among the smallest set of tokens whose probabilities sum to at least p. In all filtered cases the survivors are renormalised to sum to 1.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Expecting these knobs everywhere. Open models and many APIs expose them, but current Claude models (<code>claude-opus-5-5</code>, <code>claude-sonnet-5-5</code>, <code>claude-haiku-5-5</code>) reject non-default <code>temperature</code>, <code>top_p</code> and <code>top_k</code> with a 400 error; you steer them with the prompt and the <code>effort</code> setting (section 09). Know what the knobs do, then check what your provider allows.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Why outputs vary.</b> Sampling draws at random, so two runs can differ. Is that the only reason? And does greedy (T = 0) really give the same answer every time?</div>

  <h2 id="lb-vary"><span class="num">05</span>Why Outputs Vary</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's QA team sends Asha's message twice and gets two different replies. Is the model broken? And why do they still differ sometimes after setting temperature to 0?</p>
  </div>
  <p>Two separate causes. First, <strong>sampling is random by design</strong>: with T &gt; 0 each token is a draw, and one different early token changes everything after it, because every later token is conditioned on it. Second, even <strong>greedy decoding can differ</strong> between runs on real hardware, because the logits themselves are computed with floating-point sums whose rounding depends on the order of addition.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two people retelling the same story. Each sentence choice nudges the next one, so after a few sentences the retellings diverge even though both are "correct". The second cause is like two cashiers totalling the same bill in different orders with a calculator that rounds at every step: usually the same total, occasionally one paisa apart, and if two items cost the same to the paisa, which one counts as "more expensive" depends on that paisa.</p>
  </div>
  <h3>Traced: one prompt, four seeds</h3>
  <p>Our counted bigram model from section 02 continues "your order is" by sampling each next token.</p>
<div class="fx" data-lang="py">import numpy as np
from collections import Counter, defaultdict
from biteful_corpus import SENTENCES

follow = defaultdict(Counter)                  # the counted bigram model (section 02)
for s in SENTENCES:
    for a, b in zip(s, s[1:]):
        follow[a][b] += 1

def generate(prompt, seed, max_new=8):
    rng = np.random.default_rng(seed)
    toks = prompt.split()
    while len(toks) &lt; len(prompt.split()) + max_new and follow[toks[-1]]:
        words, counts = zip(*follow[toks[-1]].items())
        p = np.array(counts) / sum(counts)
        toks.append(rng.choice(words, p=p))     # SAMPLE the next token
        if toks[-1] in ".?":
            break
    return " ".join(toks)

for seed in [1, 2, 3, 4]:
    print(f"seed {seed}:", generate("your order is", seed))</div>
<div class="fx" data-lang="text">seed 1: your order is on the way ?
seed 2: your order is my order is my refund is my order
seed 3: your order is my order is on the way .
seed 4: your order is cold .</div>
  <p>Same model, same prompt, four different texts. Seed 2 shows a second lesson: a weak model happily loops ("is my order is my refund is…"). <code>rng.choice(words, p=p)</code> is the only random line; fixing the seed makes a run repeatable on your machine, but production APIs rarely let you fix it.</p>
  <h3>Traced: why temperature 0 is not fully deterministic</h3>
<div class="fx" data-lang="py">import numpy as np

# Floating-point addition is not associative: the order of a sum changes the result.
print("(0.1 + 0.2) + 0.3 =", (0.1 + 0.2) + 0.3)
print("0.1 + (0.2 + 0.3) =", 0.1 + (0.2 + 0.3))

# A logit is a long sum of products. Suppose "on" and "late" are EXACTLY tied in
# real arithmetic: both logits are the sum of the same 4,096 numbers. A GPU may
# add them in a different order on different runs (batch size, kernel choice).
rng = np.random.default_rng(7)
terms = rng.normal(0, 1, 4096).astype(np.float32)
orders = {
    "left to right": terms.sum(),
    "reversed":      terms[::-1].sum(),
    "64 x 64 blocks": terms.reshape(64, 64).sum(0).sum(),
}
for name, v in orders.items():
    print(f"{name:15s} {float(v):.6f}")
runs = [("run A", "left to right", "reversed"),       # (on summed, late summed)
        ("run B", "64 x 64 blocks", "left to right")]
for run, on_order, late_order in runs:
    on, late = orders[on_order], orders[late_order]
    print(f"{run}: greedy picks {'on' if on &gt; late else 'late'}")</div>
<div class="fx" data-lang="text">(0.1 + 0.2) + 0.3 = 0.6000000000000001
0.1 + (0.2 + 0.3) = 0.6
left to right   -61.986206
reversed        -61.986202
64 x 64 blocks  -61.986191
run A: greedy picks late
run B: greedy picks on</div>
  <p>The first two lines are the root cause: (0.1 + 0.2) + 0.3 ≠ 0.1 + (0.2 + 0.3) in floating point. Summing the same 4,096 numbers in three orders gives three slightly different results. If "on" and "late" are tied in exact maths, greedy picks "late" in run A and "on" in run B. Real ties are rare, but over a long reply one near-tie is enough, and every token after it changes. On a GPU server the order of additions depends on batch size and kernel choice, which change with load.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Non-determinism</strong> in LLM output comes from (1) sampling randomness when T &gt; 0 and (2) numerical differences in computing logits (floating-point order, batching), which can flip near-ties even under greedy decoding. Each divergence propagates because generation is autoregressive.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing tests that compare exact strings ("reply == 'Your order is on the way.'"). They will flake. Test properties instead: valid JSON, the right label from a fixed set, the order id present, no invented time. That habit returns in <a class="xref" data-note="prompting">Prompt Engineering</a> and <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Base vs instruction-tuned vs chat models.</b> We can generate varied, fluent continuations. But Asha asked a question. Does a model that continues text answer questions?</div>

  <h2 id="lb-stages"><span class="num">06</span>Base vs Instruction-Tuned vs Chat Models</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Pretraining teaches "continue the text". Asha wants an answer, in a helpful tone, without invented facts. Where does answering come from?</p>
  </div>
  <p>A pretrained <strong>base model</strong> knows a lot but behaves like autocomplete: given a question it may continue with more questions, or ramble. Getting to a useful assistant takes two more training stages, together called <strong>post-training</strong>: supervised fine-tuning on examples of good answers, then preference tuning on "this answer is better than that one".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hiring a fresher. Pretraining: they read the whole library, so they know a lot. SFT: in the first month a senior shows hundreds of worked examples, "when a customer asks this, reply like this". Preference tuning: for months the manager looks at two drafts and says "this one is better", until the fresher develops taste no rulebook covers.</p>
  </div>
  <h3>Traced: our base model doesn't answer</h3>
<div class="fx" data-lang="py">from collections import Counter, defaultdict
from biteful_corpus import SENTENCES

follow = defaultdict(Counter)                    # our pretrained toy "base model"
for s in SENTENCES:
    for a, b in zip(s, s[1:]):
        follow[a][b] += 1

def greedy(prompt, max_new=6):
    toks = prompt.split()
    for _ in range(max_new):
        if not follow[toks[-1]]:
            break
        toks.append(follow[toks[-1]].most_common(1)[0][0])
        if toks[-1] in ".?":
            break
    return " ".join(toks)

# Asha types a question. A base model doesn't "answer"; it continues the text.
for prompt in ["where is", "my order", "is my"]:
    print(f"{prompt!r:12s} -&gt; {greedy(prompt)!r}")

import numpy as np
def sampled(prompt, seed, max_new=6):
    rng, toks = np.random.default_rng(seed), prompt.split()
    for _ in range(max_new):
        words, counts = zip(*follow[toks[-1]].items())
        toks.append(rng.choice(words, p=np.array(counts) / sum(counts)))
        if toks[-1] in ".?":
            break
    return " ".join(toks)

for seed in [1, 3, 8]:
    print(f"sampled, seed {seed}: {sampled('where is', seed)!r}")</div>
<div class="fx" data-lang="text">'where is'   -&gt; 'where is my order is my order is'
'my order'   -&gt; 'my order is my order is my order'
'is my'      -&gt; 'is my order is my order is my'
sampled, seed 1: 'where is on the way ?'
sampled, seed 3: 'where is my order is on the way'
sampled, seed 8: 'where is late by ten minutes .'</div>
  <p>Greedy decoding loops ("my order is my order is…"), because after "is" the most common next token is "my" (ties go to the first seen) and after "my" it is "order". Sampling gives varied continuations, but none is an answer; "where is late by ten minutes ." is text that resembles the corpus, nothing more. Real base models write fluent English, yet the behaviour is the same in kind: they continue documents. They have never seen the pattern "question, then helpful reply", so nothing makes that continuation likely.</p>
  <div class="cards">
    <div><b>1 · Pretraining</b><p>Next-token prediction on trillions of tokens. Output: a <strong>base</strong> model that knows a lot and follows nothing.</p><small>Weeks to months · done by labs</small></div>
    <div><b>2 · SFT / instruction tuning</b><p>The same next-token loss, but on (instruction → good answer) pairs written by people. Output: an <strong>instruct</strong> model.</p><small>Thousands to millions of examples</small></div>
    <div><b>3 · Preference tuning</b><p>Pairs "A is better than B" (RLHF or DPO). Output: a helpful, honest, on-tone <strong>chat</strong> model.</p><small>Also RL on checkable tasks for reasoning models (09)</small></div>
  </div>
  <h3>Traced: what SFT data and a chat template look like</h3>
  <p>A transformer reads one sequence of tokens. How does it know which text is the system's, the user's or the assistant's? A <strong>chat template</strong> turns the list of messages into one string with special marker tokens for each role; the model learns those markers during SFT.</p>
<div class="fx" data-lang="py"># Stage 2 (SFT) data: one instruction -&gt; one good answer, written by people
sft_example = [
    {"role": "system", "content": "You are Biteful's support assistant."},
    {"role": "user", "content": "Where is my order 101?"},
    {"role": "assistant", "content": "Order 101 is out for delivery; Ravi should reach you by 9:05 pm."},
]

# Stage 3 (preference) data: one prompt, two answers, a human picked one
preference_example = {
    "prompt": "Where is my order 101? (no tracking data was given)",
    "chosen": "I can't see live tracking for order 101 here. Let me connect you to an agent.",
    "rejected": "Your order is on the way and will arrive in 10 minutes.",
}

def to_text(messages, add_generation_prompt=True):
    """A simplified chat template: the model only ever sees one long string."""
    out = ""
    for m in messages:
        out += f"&lt;|{m['role']}|&gt;\\n{m['content']}&lt;|end|&gt;\\n"
    if add_generation_prompt:
        out += "&lt;|assistant|&gt;\\n"             # the model continues from here
    return out

print("--- training text (SFT) ---")
print(to_text(sft_example, add_generation_prompt=False))
print("--- what the model sees at chat time ---")
print(to_text(sft_example[:2]))
print("preference keys:", sorted(preference_example))</div>
<div class="fx" data-lang="text">--- training text (SFT) ---
&lt;|system|&gt;
You are Biteful's support assistant.&lt;|end|&gt;
&lt;|user|&gt;
Where is my order 101?&lt;|end|&gt;
&lt;|assistant|&gt;
Order 101 is out for delivery; Ravi should reach you by 9:05 pm.&lt;|end|&gt;

--- what the model sees at chat time ---
&lt;|system|&gt;
You are Biteful's support assistant.&lt;|end|&gt;
&lt;|user|&gt;
Where is my order 101?&lt;|end|&gt;
&lt;|assistant|&gt;

preference keys: ['chosen', 'prompt', 'rejected']</div>
  <p>During SFT the loss is usually computed only on the assistant's tokens, so the model learns to answer, not to imitate customers. At chat time the string ends with <code>&lt;|assistant|&gt;</code>, and next-token prediction does the rest: the most likely continuation is now a reply. The preference example has no single right text, only a ranking: the grounded "I can't see live tracking" was chosen over the invented "arrives in 10 minutes". Real templates (Llama, Qwen, Claude) use different markers; the idea is the same.</p>
  <h3>Traced: DPO in four numbers</h3>
  <p><strong>RLHF</strong> trains a separate reward model on human rankings, then optimises the LLM against it with reinforcement learning. <strong>DPO</strong> (direct preference optimisation) skips the reward model: it directly raises the probability of the chosen answer relative to the rejected one, measured against a frozen copy of the starting model so it can't drift too far.</p>
<div class="fx" data-lang="py">import numpy as np

# DPO in numbers. For one preference pair we need 4 log-probabilities:
# how likely each answer is under the model being trained (pi) and under the
# frozen starting model (ref). Made-up values for one training step:
logp_pi_chosen,  logp_ref_chosen  = -12.0, -14.0   # grounded "I can't see tracking..."
logp_pi_rejected, logp_ref_rejected = -9.0, -8.0   # invented "arrives in 10 minutes"
beta = 0.1                                          # how far we may drift from ref

margin = (logp_pi_chosen - logp_ref_chosen) - (logp_pi_rejected - logp_ref_rejected)
loss = -np.log(1 / (1 + np.exp(-beta * margin)))    # -log sigmoid(beta * margin)
print("chosen  moved by", logp_pi_chosen - logp_ref_chosen)
print("rejected moved by", logp_pi_rejected - logp_ref_rejected)
print("margin =", margin, " loss =", round(loss, 4))
print("loss if the margin were 0 :", round(-np.log(0.5), 4))
print("loss if the margin were 30:", round(-np.log(1 / (1 + np.exp(-beta * 30))), 4))</div>
<div class="fx" data-lang="text">chosen  moved by 2.0
rejected moved by -1.0
margin = 3.0  loss = 0.5544
loss if the margin were 0 : 0.6931
loss if the margin were 30: 0.0486</div>
  <p>By hand: the chosen answer's log-probability rose by 2 compared with the reference, the rejected one's fell by 1, so the margin is 2 − (−1) = 3. Loss = −log σ(0.1 × 3) = −log 0.574 = 0.554. With no preference learned (margin 0) the loss is ln 2 = 0.693; a margin of 30 drives it to 0.049. Training pushes the margin up: more probability on "I can't see tracking", less on the invented ETA.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Base model</strong>: pretrained only; continues text. <strong>Instruct model</strong>: after SFT on instruction–answer pairs. <strong>Chat model</strong>: instruct model further tuned on preferences and multi-turn chats with a chat template. <strong>DPO loss</strong> = −log σ(β[(log π(y<sub>w</sub>) − log π<sub>ref</sub>(y<sub>w</sub>)) − (log π(y<sub>l</sub>) − log π<sub>ref</sub>(y<sub>l</sub>))]), with y<sub>w</sub> chosen, y<sub>l</sub> rejected, β the drift strength. More in <a class="xref" data-note="finetuning">Fine-Tuning</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Downloading an open model's base version (no "-Instruct" or "-Chat" in the name) and wondering why it answers with more questions, or using a chat model with the wrong chat template. Always use the tokenizer's own template (for Hugging Face models, <code>tokenizer.apply_chat_template</code>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: What LLMs can't do.</b> The chat model now answers Asha fluently and politely. Is "Your order is on the way" true? What can't any amount of post-training fix?</div>

  <h2 id="lb-limits"><span class="num">07</span>What LLMs Can't Do</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A well-trained chat model replies "Your order is on the way" with complete confidence. It has never seen Biteful's order table. Where does that sentence come from, and what other limits are built into the design?</p>
  </div>
  <p>Everything so far follows from one fact: the model produces <em>likely</em> text given its training data and its context window. Four limits follow directly, and every later note in this track exists to work around one of them.</p>
  <div class="cards">
    <div><b>No memory</b><p>Each call is independent. A chatbot "remembers" earlier turns only because your code sends them again. Close the tab, and the model knows nothing about Asha.</p><small>Fix: resend history; store facts yourself (<a class="xref" data-note="llm_apis">LLM APIs</a>)</small></div>
    <div><b>Knowledge cutoff</b><p>It knows only what was in its training data, which ends at a cutoff date, and never included private data such as order 101's status.</p><small>Fix: put the facts in the prompt (<a class="xref" data-note="rag">RAG</a>) or give it a tool</small></div>
    <div><b>Hallucination</b><p>Fluent, confident, false or unsupported output. The objective rewards plausible text; when knowledge is blurry, plausible text still comes out in the same confident tone.</p><small>Fix: ground, allow "I don't know", check (<a class="xref" data-note="llm_evals">Evals</a>)</small></div>
    <div><b>Exact arithmetic</b><p>Numbers are split into irregular tokens, and the model predicts digits like words. Small sums usually work; long or unusual ones go wrong.</p><small>Fix: a calculator tool (<a class="xref" data-note="llm_apis">LLM APIs</a>)</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A student in a viva who skipped one chapter. They know the shape of a good answer, so they speak fluently and confidently. Ask "which page is that on?" or say "it's fine to say you don't know", and the bluff is exposed. The student also can't tell you today's news: their textbook was printed last year.</p>
  </div>
  <h3>Traced: numbers as tokens, and sharp vs blurry knowledge</h3>
  <p>The first part splits numbers with the real GPT-2 tokenizer. The second part uses hand-made distributions (illustrative, not from a real model) to show what "blurry knowledge" means: for a famous fact, probability is concentrated on one answer; for a fact the model barely saw, it is spread out, yet each sample is still written as a confident sentence.</p>
<div class="fx" data-lang="py">import numpy as np
from gpt2_tok import enc

# 1. Arithmetic: numbers are chopped into tokens in irregular pieces.
for text in ["240", "1240", "12403", "Rs 240 + Rs 1240 = Rs 1480"]:
    print(f"{text!r:30s}", [enc.decode([i]) for i in enc.encode(text)])

# 2. Hallucination: sharp vs blurry knowledge. Probabilities the model might give
#    to candidate answers (illustrative distributions, not from a real model).
questions = {
    "capital of Maharashtra?":  (["Mumbai", "Pune", "Nagpur"],         [0.95, 0.04, 0.01]),
    "Biteful's refund window?": (["7 days", "14 days", "30 days"],     [0.36, 0.33, 0.31]),
}
rng = np.random.default_rng(0)
for q, (answers, p) in questions.items():
    picks = [answers[rng.choice(3, p=p)] for _ in range(5)]
    top = max(p)
    verdict = answers[int(np.argmax(p))] if top &gt;= 0.5 else "I'm not sure - let me check."
    print(f"{q:26s} 5 samples: {picks}  -&gt; answer-or-abstain: {verdict}")</div>
<div class="fx" data-lang="text">'240'                          ['240']
'1240'                         ['12', '40']
'12403'                        ['12', '403']
'Rs 240 + Rs 1240 = Rs 1480'   ['Rs', ' 240', ' +', ' Rs', ' 12', '40', ' =', ' Rs', ' 14', '80']
capital of Maharashtra?    5 samples: ['Mumbai', 'Mumbai', 'Mumbai', 'Mumbai', 'Mumbai']  -&gt; answer-or-abstain: Mumbai
Biteful's refund window?   5 samples: ['30 days', '14 days', '30 days', '14 days', '30 days']  -&gt; answer-or-abstain: I'm not sure - let me check.</div>
  <p>"240" is one token, but "1240" is "12" + "40" and "12403" is "12" + "403": the digits of a number are not aligned to place value, so adding 240 + 1240 means combining unrelated pieces. For Maharashtra's capital, all five samples agree. For Biteful's refund window, five samples give two different answers, and the model would state either with the same confidence. Disagreement across samples is a real hallucination signal (self-consistency, in <a class="xref" data-note="prompting">Prompt Engineering</a>), and "answer only above 0.5, else say you're not sure" is the idea behind giving the model an out. APIs don't expose whole-answer probabilities, so in practice you get the same effect by putting the facts in the prompt.</p>
  <table class="tbl">
    <tr><th>Cause</th><th>Fix</th><th>Where</th></tr>
    <tr><td>Plausible ≠ true; private data unseen</td><td>Ground it: put the order record or policy in the prompt</td><td><a class="xref" data-note="rag">RAG</a>, <a class="xref" data-note="prompting">Prompt Engineering</a></td></tr>
    <tr><td>Live data, exact maths</td><td>Tools: order lookup, calculator</td><td><a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a></td></tr>
    <tr><td>Rewarded for guessing</td><td>Allow "I don't know"; ask for citations</td><td><a class="xref" data-note="prompting">Prompt Engineering</a></td></tr>
    <tr><td>Silent errors</td><td>Check outputs; measure on a test set</td><td><a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hallucination</strong>: output that is fluent and confident but wrong or unsupported by the provided context. <strong>Grounding</strong>: giving the model the source facts in the prompt and asking it to answer only from them. <strong>Knowledge cutoff</strong>: the date after which the training data has nothing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Trusting tone. The model sounds equally sure when right and wrong. A bigger model hallucinates less, not never. Design the system (grounding, tools, checks) assuming it will happen.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Scaling laws.</b> Would a bigger model with more data simply remove these limits? How much better does size make a model, and is the improvement predictable?</div>

  <h2 id="lb-scale"><span class="num">08</span>Scaling Laws (Briefly)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Bigger models hallucinate less and reason better. A training run costs crores of rupees, so labs can't try ten sizes. Can they predict the gain before spending?</p>
  </div>
  <p>Yes, roughly. When loss is plotted against parameters, data or compute on log-log axes, the points fall on an almost straight line. Train a few small models cheaply, draw the line, read off what a big one will reach. These empirical lines are <strong>scaling laws</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A coaching institute notices that every doubling of practice tests raises a student's JEE score by about the same small amount: it never jumps, never stops, just creeps up with diminishing returns. Knowing that curve, they can plan without guessing.</p>
  </div>
  <ol>
    <li><strong>Compute</strong>: training cost ≈ <strong>C = 6 × N × D</strong> floating-point operations (N parameters, D training tokens; about 2 operations per parameter per token forward, 4 backward).</li>
    <li><strong>Kaplan et al. (2020)</strong>: loss ≈ (N<sub>c</sub>/N)<sup>0.076</sup>: every 10× parameters multiplies loss by 10<sup>−0.076</sup> ≈ 0.84.</li>
    <li><strong>Chinchilla (2022)</strong>: for a fixed budget, grow parameters and data together, about <strong>20 tokens per parameter</strong>.</li>
  </ol>
<div class="fx" data-lang="py">def train_flops(n_params, n_tokens):
    return 6 * n_params * n_tokens          # rule of thumb: C ~ 6 * N * D

runs = [("70B, Chinchilla-optimal", 70e9, 20 * 70e9),
        ("8B, over-trained (15T)",   8e9, 15e12)]
GPU_FLOPS = 4e14                            # assumption: 400 TFLOP/s useful work per GPU
for name, N, D in runs:
    C = train_flops(N, D)
    gpu_days = C / GPU_FLOPS / 86400
    print(f"{name:25s} tokens/param={D / N:7.0f}  FLOPs={C:.1e}  GPU-days={gpu_days:,.0f}")

# Kaplan et al. (2020) fit for loss vs parameters: L(N) = (Nc / N) ** alpha
Nc, alpha = 8.8e13, 0.076
for N in [1e8, 1e9, 1e10, 1e11]:
    print(f"N={N:.0e}  predicted loss={(Nc / N) ** alpha:.3f}")</div>
<div class="fx" data-lang="text">70B, Chinchilla-optimal   tokens/param=     20  FLOPs=5.9e+23  GPU-days=17,014
8B, over-trained (15T)    tokens/param=   1875  FLOPs=7.2e+23  GPU-days=20,833
N=1e+08  predicted loss=2.830
N=1e+09  predicted loss=2.376
N=1e+10  predicted loss=1.994
N=1e+11  predicted loss=1.674</div>
  <p>A Chinchilla-optimal 70B model and an 8B model over-trained on 15 trillion tokens cost about the same compute. Labs choose the small one because training is paid once while inference is paid on every request: the 8B model is roughly 9× cheaper per token to serve. The Kaplan lines fall by the same ratio per 10× (2.830 → 2.376 → 1.994): a power law, steady but never reaching zero. That is the honest answer to section 07: scale reduces the limits, it does not remove them.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Scaling laws</strong>: empirical power laws between loss and parameters N, training tokens D and compute C ≈ 6·N·D. <strong>Compute-optimal</strong> (Chinchilla): the split of N and D giving the lowest loss for a training budget, about 20 tokens per parameter.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Scaling laws predict <em>loss</em>, not specific skills. "Emergent abilities" that appear suddenly at some size are partly an artefact of all-or-nothing metrics; with a smoother metric the skill usually improves gradually.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Model families &amp; sizes.</b> Size matters, and over-trained small models are cheap to serve. Which actual models exist, how big are they, and what does running one yourself cost?</div>

  <h2 id="lb-family"><span class="num">09</span>Model Families &amp; Sizes (as of October 2026)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful must pick a model for its assistant. Some are only available through an API; others can be downloaded. They come in sizes from 1B to hundreds of billions of parameters, and some "think" before answering. How do you read this landscape?</p>
  </div>
  <p>Two ways to get a model. A <strong>closed</strong> model is available only through its maker's API; its weights are secret. An <strong>open-weight</strong> model's weights can be downloaded, run on your own machines and fine-tuned, under a licence. Within each, makers release families in several sizes: a large, slow, most capable model and smaller, faster, cheaper ones.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Booking an Ola versus buying a car. Ola: no upfront cost, the best cars, pay per ride, someone else handles servicing, but the trip goes through their system. Own car: a big fixed cost paid whether you drive or not, you handle servicing, but nobody else sees the route. Ola is cheaper until you drive a lot every day.</p>
  </div>
  <table class="tbl"><caption>The landscape, dated October 2026. Model names and prices change every few months: verify before deciding.</caption>
    <tr><th>Family</th><th>Kind</th><th>Sizes / tiers</th><th>Notes</th></tr>
    <tr><td>Anthropic Claude</td><td>Closed API</td><td>Opus 5.5 ($4 / $20 per 1M in/out), Sonnet 5.5 ($2 / $10), Haiku 5.5 ($0.10 / $0.50); Fable 5.1 at the top ($10 / $50)</td><td>1M-token context on current models; adaptive thinking with an <code>effort</code> setting</td></tr>
    <tr><td>OpenAI GPT</td><td>Closed API</td><td>Large, mini and nano tiers; separate reasoning models</td><td>Check the current price list; field names differ from Anthropic's</td></tr>
    <tr><td>Google Gemini</td><td>Closed API</td><td>Pro, Flash and Flash-Lite style tiers</td><td>Long contexts; check current pricing</td></tr>
    <tr><td>Meta Llama, Alibaba Qwen, Mistral, Google Gemma, DeepSeek</td><td>Open weights</td><td>From about 1B (phones, laptops) through 7–8B, 30–70B, to several hundred B (often mixture-of-experts)</td><td>Run with Ollama, llama.cpp or vLLM; licences vary</td></tr>
  </table>
  <p>The Claude rows are from Anthropic's published price table (cached 6 October 2026). For other providers this note deliberately gives no prices or exact model names: they change too often to be safe in study notes, and the learner should read the provider's page on the day of the decision.</p>
  <h3>Traced: what size costs to run yourself</h3>
<div class="fx" data-lang="py"># How much memory do the WEIGHTS alone need? params x bytes per parameter.
sizes = {"1B": 1e9, "8B": 8e9, "70B": 70e9, "405B": 405e9}
bytes_per = {"fp16": 2, "8-bit": 1, "4-bit": 0.5}
print(f"{'model':&gt;6} " + " ".join(f"{k:&gt;8}" for k in bytes_per))
for name, n in sizes.items():
    print(f"{name:&gt;6} " + " ".join(f"{n * b / 1e9:7.1f}G" for b in bytes_per.values()))
# Rule: add room for the KV cache (section 03) and activations on top.</div>
<div class="fx" data-lang="text"> model     fp16    8-bit    4-bit
    1B     2.0G     1.0G     0.5G
    8B    16.0G     8.0G     4.0G
   70B   140.0G    70.0G    35.0G
  405B   810.0G   405.0G   202.5G</div>
  <p>Weights alone need parameters × bytes per parameter: an 8B model is 8 × 2 = 16 GB in 16-bit floats, 4 GB in 4-bit quantised form, which is why 4-bit 7–8B models run on a laptop. Add the KV cache from section 03 on top. A 405B model needs a multi-GPU server even at 4 bits.</p>
  <h3>Traced: API or self-host for Biteful</h3>
  <p><strong>Every number is an assumption for illustration</strong> (traffic, GPU price); the point is the shape of the comparison.</p>
<div class="fx" data-lang="py"># All numbers below are assumptions for illustration. Plug in your own.
requests_per_month = 3_000_000               # Biteful support replies per month
in_tok, out_tok = 450, 60                    # Asha-sized requests (section 03)

def api_monthly(p_in, p_out):
    per_call = in_tok * p_in / 1e6 + out_tok * p_out / 1e6
    return per_call * requests_per_month

gpu_hourly, gpus, hours = 2.50, 2, 730       # rented GPUs, on 24x7
self_host = gpu_hourly * gpus * hours

print(f"API, Opus-class   ($4/$20)    : \${api_monthly(4.00, 20.00):,.0f} / month")
print(f"API, Haiku-class  ($0.10/$0.50): \${api_monthly(0.10, 0.50):,.0f} / month")
print(f"Self-host, 2 GPUs 24x7         : \${self_host:,.0f} / month (+ engineers)")</div>
<div class="fx" data-lang="text">API, Opus-class   ($4/$20)    : $9,000 / month
API, Haiku-class  ($0.10/$0.50): $225 / month
Self-host, 2 GPUs 24x7         : $3,650 / month (+ engineers)</div>
  <p>At 3 million short replies a month, self-hosting beats the largest API model but loses badly to the small one, before counting the engineers who run the GPUs. GPUs cost the same busy or idle; API bills scale with use. So the decision is rarely about price alone: data that must never leave the company, offline use, or very high volume of a narrow task are the usual reasons to self-host. <a class="xref" data-note="llm_apis">LLM APIs</a> has the full choosing table and runs code against a local model server.</p>
  <h3>Reasoning ("thinking") models</h3>
  <p>A normal model spends the same computation on every token. A <strong>reasoning model</strong> is trained (with reinforcement learning on checkable tasks such as maths and code with tests) to write a long chain of thought before the final answer. More thinking tokens = more forward passes = more computation on hard problems: <strong>test-time compute</strong>. On Claude, thinking is adaptive and you set its depth with <code>output_config={"effort": "low" | "medium" | "high" | "xhigh" | "max"}</code>; on <code>claude-opus-5-5</code> thinking is always on and the default effort is <code>medium</code>. Thinking tokens are billed as output: if low effort used 200 output tokens and high effort 1,000 on the same question (assumed numbers), the thinking would cost 5× more: $0.004 vs $0.02 at $20 per 1M, 1.6 cents extra per reply on Opus 5.5, worth it for a tricky refund calculation, wasteful for "where is my order?".</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Closed model</strong>: available only as a hosted API. <strong>Open-weight model</strong>: parameters published for download under a licence. <strong>Reasoning model</strong>: trained to generate an internal chain of thought before answering. <strong>Test-time compute</strong>: extra computation spent at answer time. <strong>Weight memory</strong> = parameters × bytes per parameter.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Open-weight" is not "open source": you usually get no training data or code, and licences can restrict commercial use. And prompting "think step by step" is not the same as a reasoning model; on a reasoning model, raise effort instead.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have nine ideas. How do they form one picture, and which one do you reach for when a reply goes wrong?</div>

  <h2 id="lb-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Logits, loss, tokens, windows, temperature, seeds, SFT, hallucination, scaling, families: separate facts, or consequences of one mechanism?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="lb-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="240" y="10" width="200" height="46" rx="8" class="fb sb" stroke-width="2"/><text x="340" y="30" text-anchor="middle" font-size="12" font-weight="700">next-token distribution</text><text x="340" y="47" text-anchor="middle" class="tm" font-size="10">on 0.563 … cancelled 0.028</text>
<rect x="10" y="10" width="170" height="46" rx="8" class="ft st"/><text x="95" y="30" text-anchor="middle" font-size="11.5" font-weight="700">pretraining</text><text x="95" y="47" text-anchor="middle" class="tm" font-size="10">loss 3.219 → 0.730</text>
<line x1="180" y1="33" x2="238" y2="33" stroke="currentColor" marker-end="url(#lb-a9)"/>
<rect x="500" y="10" width="170" height="46" rx="8" class="ft st"/><text x="585" y="30" text-anchor="middle" font-size="11.5" font-weight="700">tokens &amp; window</text><text x="585" y="47" text-anchor="middle" class="tm" font-size="10">21 tokens · 8,192 limit</text>
<line x1="500" y1="33" x2="442" y2="33" stroke="currentColor" marker-end="url(#lb-a9)"/>
<line x1="340" y1="56" x2="340" y2="88" stroke="currentColor" marker-end="url(#lb-a9)"/>
<rect x="240" y="90" width="200" height="46" rx="8" class="fg sg"/><text x="340" y="110" text-anchor="middle" font-size="11.5" font-weight="700">sampling (T, top-k, top-p)</text><text x="340" y="127" text-anchor="middle" class="tm" font-size="10">top-p 0.9 drops "cancelled"</text>
<line x1="440" y1="113" x2="498" y2="113" stroke="currentColor" marker-end="url(#lb-a9)"/>
<rect x="500" y="90" width="170" height="46" rx="8" class="fr sr"/><text x="585" y="110" text-anchor="middle" font-size="11.5" font-weight="700">outputs vary</text><text x="585" y="127" text-anchor="middle" class="tm" font-size="10">seeds, float order</text>
<line x1="240" y1="113" x2="182" y2="113" stroke="currentColor" marker-end="url(#lb-a9)"/>
<rect x="10" y="90" width="170" height="46" rx="8" class="fr sr"/><text x="95" y="110" text-anchor="middle" font-size="11.5" font-weight="700">base model continues</text><text x="95" y="127" text-anchor="middle" class="tm" font-size="10">"my order is my order…"</text>
<line x1="95" y1="136" x2="95" y2="168" stroke="currentColor" marker-end="url(#lb-a9)"/>
<rect x="10" y="170" width="170" height="46" rx="8" class="fg sg"/><text x="95" y="190" text-anchor="middle" font-size="11.5" font-weight="700">SFT + DPO → chat</text><text x="95" y="207" text-anchor="middle" class="tm" font-size="10">margin 3 → loss 0.554</text>
<line x1="180" y1="193" x2="238" y2="193" stroke="currentColor" marker-end="url(#lb-a9)"/>
<rect x="240" y="170" width="200" height="46" rx="8" class="fr sr"/><text x="340" y="190" text-anchor="middle" font-size="11.5" font-weight="700">limits: memory, cutoff,</text><text x="340" y="207" text-anchor="middle" class="tm" font-size="10">hallucination, arithmetic</text>
<line x1="440" y1="193" x2="498" y2="193" stroke="currentColor" marker-end="url(#lb-a9)"/>
<rect x="500" y="170" width="170" height="46" rx="8" class="ft st"/><text x="585" y="190" text-anchor="middle" font-size="11.5" font-weight="700">scale: better, not perfect</text><text x="585" y="207" text-anchor="middle" class="tm" font-size="10">×0.84 loss per 10× N</text>
<line x1="585" y1="216" x2="585" y2="246" stroke="currentColor" marker-end="url(#lb-a9)"/>
<rect x="420" y="248" width="250" height="40" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="545" y="266" text-anchor="middle" font-size="11.5" font-weight="700">families &amp; sizes</text><text x="545" y="281" text-anchor="middle" class="tm" font-size="10">closed vs open; 8B = 16 GB fp16</text>
<line x1="340" y1="216" x2="340" y2="246" stroke="currentColor" marker-end="url(#lb-a9)"/>
<rect x="190" y="248" width="220" height="40" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="300" y="266" text-anchor="middle" font-size="11.5" font-weight="700">fixes in later notes</text><text x="300" y="281" text-anchor="middle" class="tm" font-size="10">prompting · RAG · tools · evals</text>
</svg><figcaption>One mechanism, a next-token distribution learned from text, explains the rest: how it is learned, what it reads, how a token is chosen, why it varies, why post-training is needed, and what it cannot do.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same running example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our example</th><th>When to use it</th></tr>
    <tr><td>Logits + softmax</td><td>last vector h · unembedding rows</td><td>what does the model output?</td><td>on 0.563, late 0.207, ready 0.126, delivered 0.076, cancelled 0.028</td><td>reading any model's behaviour</td></tr>
    <tr><td>Cross-entropy loss</td><td>−log p(true next token)</td><td>how is it trained?</td><td>p(on | is) = 0.3 → loss 1.204; average 0.45, perplexity 1.57</td><td>training, fine-tuning, domain checks</td></tr>
    <tr><td>Gradient descent</td><td>loss + its gradient</td><td>how do weights improve?</td><td>3.219 → 0.730 (best 0.702)</td><td>every training run</td></tr>
    <tr><td>Tokens</td><td>BPE vocabulary</td><td>what is counted and billed?</td><td>Asha: 63 chars → 21 tokens; Hindi 19 → 29</td><td>cost, limits, arithmetic issues</td></tr>
    <tr><td>Context window</td><td>attention over prompt + output</td><td>how much can one call see?</td><td>8,271 needed vs 8,192</td><td>prompt design, RAG</td></tr>
    <tr><td>KV cache</td><td>stored keys/values per token</td><td>why is decoding feasible?</td><td>500,500 → 1,000 computations; 128 KiB/token</td><td>serving, long contexts</td></tr>
    <tr><td>Temperature</td><td>logits ÷ T</td><td>how adventurous?</td><td>"cancelled" 0.002 / 0.028 / 0.084 at T = 0.5 / 1 / 2</td><td>creative vs factual tasks</td></tr>
    <tr><td>Top-k / top-p</td><td>sorted probs, running total</td><td>which tail to forbid?</td><td>k = 2 → 0.731 / 0.269; p = 0.9 keeps 4</td><td>open models, many APIs</td></tr>
    <tr><td>Variation</td><td>sampling + float order</td><td>why do runs differ?</td><td>4 seeds → 4 texts; tie flips late/on</td><td>test design</td></tr>
    <tr><td>SFT / DPO</td><td>same loss on curated pairs; preference margin</td><td>why does it answer?</td><td>margin 3 → loss 0.554</td><td>choosing instruct models, fine-tuning</td></tr>
    <tr><td>Limits</td><td>"likely text" objective</td><td>what can't it do?</td><td>refund window 0.36/0.33/0.31; "1240" = "12"+"40"</td><td>deciding on RAG, tools, evals</td></tr>
    <tr><td>Scaling laws</td><td>C ≈ 6ND; power law</td><td>does bigger help?</td><td>2.830 → 2.376 → 1.994</td><td>model choice reasoning</td></tr>
    <tr><td>Families &amp; sizes</td><td>params × bytes; price per token</td><td>which model to use?</td><td>8B = 16 GB fp16; $9,000 vs $225 a month</td><td>build vs buy decisions</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>An LLM is a next-token distribution learned from text, sampled one token at a time. Its strengths (fluency, broad knowledge) and its weaknesses (no memory, no private data, confident guesses, shaky maths, run-to-run variation) are the same fact seen from different sides. Every later note adds something <em>around</em> the model (a better prompt, retrieved facts, tools, checks) rather than changing that fact.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The picture is connected; now the specific errors people make with it.</div>

  <h2 id="lb-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Most LLM bugs raise no error: the reply is fluent and wrong, or the bill is just larger. Which misunderstandings cause them?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: using a base model as a chatbot</span><p>A base model continues text. If an open model answers with more questions, check you have the "-Instruct" or "-Chat" version and its chat template.</p></div>
  <div class="callout trap"><span class="label">Trap: "temperature 0 means identical outputs"</span><p>Float order on GPUs can flip near-ties (run A "late", run B "on"). Test properties, not exact strings. On current Claude models temperature is not a parameter at all.</p></div>
  <div class="callout trap"><span class="label">Trap: budgeting by words</span><p>4 characters per token is an English average. Asha's Hindi message needed 29 tokens for 19 characters. Count with the real tokenizer.</p></div>
  <div class="callout trap"><span class="label">Trap: ignoring output length</span><p>Output tokens cost about 5× input and set most of the latency. "Answer in two sentences" can save more than switching models.</p></div>
  <div class="callout trap"><span class="label">Trap: believing the model remembers or knows your data</span><p>No memory between calls; no access to order 101 unless you put it in the prompt or give a tool. "Your order is on the way" without data is a guess.</p></div>
  <div class="callout trap"><span class="label">Trap: trusting a confident tone</span><p>Tone carries no information about truth. Ground, allow "I don't know", and check.</p></div>
  <div class="callout trap"><span class="label">Trap: KV cache vs prompt caching</span><p>KV cache: inside one generation, saves compute, costs GPU memory. Prompt caching: across API calls, saves money on a repeated prefix.</p></div>
  <div class="callout trap"><span class="label">Trap: max effort everywhere</span><p>Thinking tokens are billed output. Use low effort or a small model for "where is my order?" and classification; save high effort for hard reasoning.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet</b>, then <a class="xref" data-note="prompting">Prompt Engineering</a>: how to write the text the model continues.</div>

  <h2 id="lb-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful's support assistant. Asha writes "Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?" and the model continues "Your order is ___" with five candidates: on, late, ready, delivered, cancelled, logits [2, 1, 0.5, 0, −1].</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our example</th><th>Weakness → next</th></tr>
    <tr><td>Next-token prediction</td><td>what does the model output?</td><td>on 0.563 … cancelled 0.028</td><td>where do good weights come from?</td></tr>
    <tr><td>Pretraining</td><td>how is it learned without labels?</td><td>loss 1.204 for "on" after "is"; 3.219 → 0.730</td><td>what is a token, how many fit?</td></tr>
    <tr><td>Tokens &amp; window</td><td>what is read, billed, limited?</td><td>21 tokens; 79 over an 8,192 window</td><td>which token is written?</td></tr>
    <tr><td>Sampling</td><td>how is one token chosen?</td><td>greedy "on"; top-p 0.9 keeps 4</td><td>runs differ</td></tr>
    <tr><td>Variation</td><td>why do outputs change?</td><td>4 seeds, 4 texts; tie flips</td><td>continuing ≠ answering</td></tr>
    <tr><td>Base → chat</td><td>why does it answer?</td><td>base loops; DPO loss 0.554</td><td>fluent ≠ true</td></tr>
    <tr><td>Limits</td><td>what fails anyway?</td><td>no order data; 0.36/0.33/0.31; "12"+"40"</td><td>does size fix it?</td></tr>
    <tr><td>Scaling laws</td><td>what does size buy?</td><td>×0.84 loss per 10× N</td><td>which model to pick?</td></tr>
    <tr><td>Families &amp; sizes</td><td>what exists, what does it cost?</td><td>8B = 16 GB; $9,000 vs $225/month</td><td>→ prompting, APIs</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Logit</td><td>z<sub>i</sub> = w<sub>i</sub> · h</td><td>w<sub>i</sub> unembedding row of token i, h last position's vector</td></tr>
    <tr><td>Softmax with temperature</td><td>p<sub>i</sub> = e<sup>z<sub>i</sub>/T</sup> / Σ<sub>j</sub> e<sup>z<sub>j</sub>/T</sup></td><td>T temperature (T → 0 greedy, T = 1 unchanged)</td></tr>
    <tr><td>Cross-entropy loss</td><td>L = −(1/n) Σ<sub>t</sub> log p(x<sub>t+1</sub> | x<sub>≤t</sub>)</td><td>x<sub>t+1</sub> the true next token, n number of positions</td></tr>
    <tr><td>Perplexity</td><td>PPL = e<sup>L</sup></td><td>"as unsure as choosing among PPL tokens"</td></tr>
    <tr><td>Top-p set</td><td>smallest S with Σ<sub>i∈S</sub> p<sub>i</sub> ≥ p</td><td>tokens added in order of probability</td></tr>
    <tr><td>KV cache memory</td><td>2 × layers × KV heads × head dim × bytes</td><td>per token; × sequence length × users</td></tr>
    <tr><td>Cost per call</td><td>in × price<sub>in</sub> + out × price<sub>out</sub></td><td>prices per token (list prices are per 1M)</td></tr>
    <tr><td>Latency</td><td>TTFT + out ÷ tokens per second</td><td>TTFT ≈ prefill + queueing</td></tr>
    <tr><td>DPO loss</td><td>−log σ(β·[(log π(y<sub>w</sub>) − log π<sub>ref</sub>(y<sub>w</sub>)) − (log π(y<sub>l</sub>) − log π<sub>ref</sub>(y<sub>l</sub>))])</td><td>y<sub>w</sub> chosen, y<sub>l</sub> rejected, β drift strength</td></tr>
    <tr><td>Training compute</td><td>C ≈ 6 · N · D</td><td>N parameters, D training tokens; Chinchilla D ≈ 20N</td></tr>
    <tr><td>Weight memory</td><td>N × bytes per parameter</td><td>2 (fp16), 1 (8-bit), 0.5 (4-bit)</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Low temperature / greedy</b><p>Extraction, classification, factual support replies.</p><small>Can loop; still not perfectly repeatable</small></div>
    <div><b>Higher temperature + top-p</b><p>Brainstorming, varied wording, several candidate drafts.</p><small>More tail errors; never for facts</small></div>
    <div><b>Instruct / chat model</b><p>Anything a user talks to.</p><small>Base models only for further training or pure continuation</small></div>
    <div><b>Small model / low effort</b><p>High-volume, simple tasks ("where is my order?").</p><small>Big model / high effort for hard reasoning</small></div>
    <div><b>Closed API</b><p>Prototypes, best quality, no ops team.</p><small>Data leaves your servers; per-token bill</small></div>
    <div><b>Open weights</b><p>Data residency, offline, very high volume of a narrow task.</p><small>You run GPUs and ops</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Base model as chatbot; T = 0 assumed deterministic; words instead of tokens; long outputs ignored; believing it remembers or knows private data; trusting tone; KV cache vs prompt caching; high effort everywhere; open-weight ≠ open source.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Logits [2, 1, 0.5, 0, −1]: probability of the top token?</td><td>7.389 / 13.124 = 0.563</td></tr>
    <tr><td>The model gave the true token p = 0.3. Loss?</td><td>−ln 0.3 = 1.204</td></tr>
    <tr><td>Sorted probs 0.563, 0.207, 0.126, 0.076, 0.028: how many survive top-p 0.9?</td><td>4 (running totals 0.563, 0.770, 0.896, 0.972)</td></tr>
    <tr><td>2 × 32 × 8 × 128 × 2 bytes per token: KV memory for 8,192 tokens?</td><td>128 KiB × 8,192 = 1 GiB</td></tr>
    <tr><td>450 input + 60 output tokens at $4 / $20 per 1M?</td><td>$0.0018 + $0.0012 = $0.003</td></tr>
  </table>

  <h2 id="lb-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain each idea out loud, and say why each one needs the one before it? Try before revealing.</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly does an LLM learn during pretraining, and why does it need no labels?</summary><div class="qa-body">To predict the next token, minimising cross-entropy (−log p of the true token) over trillions of tokens. The text supplies its own labels: the target at each position is simply the next token. Facts, grammar and some reasoning are learned because they make prediction easier.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The model gave the true next token probability 0.25. Loss at that position? What does an average loss of 0.45 mean as perplexity?</summary><div class="qa-body">−ln 0.25 ≈ 1.386. Perplexity e<sup>0.45</sup> ≈ 1.57: on average as unsure as choosing among about 1.6 equally likely tokens.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Logits are [2, 1, 0]. What happens to the distribution as T → 0 and as T → ∞?</summary><div class="qa-body">T → 0: all probability goes to the first token, [1, 0, 0] (greedy). T → ∞: logits/T → 0, so the distribution becomes uniform [⅓, ⅓, ⅓]. The ranking never changes, only the sharpness.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Top-k vs top-p: why is top-p usually preferred?</summary><div class="qa-body">Top-k keeps a fixed number: when the model is sure, k = 50 lets junk in; when unsure, it may cut good options. Top-p adapts: few tokens when the distribution is peaked, many when it is flat.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a transformer know which text is the user's and which the assistant's?</summary><div class="qa-body">A chat template turns the messages into one string with special role-marker tokens, learned during SFT. At chat time the string ends with the assistant marker, and next-token prediction produces the reply.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the KV cache and what does it cost? Estimate for 32 layers, 8 KV heads, head dim 128, fp16, 8K tokens.</summary><div class="qa-body">The stored keys and values of all past tokens, so each decode step computes only the new token's (1,000 tokens: 500,500 → 1,000 computations). It costs GPU memory: 2 × 32 × 8 × 128 × 2 bytes = 128 KiB per token, × 8,192 = 1 GiB per sequence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do output tokens cost more and take longer than input tokens?</summary><div class="qa-body">The prompt is processed in one parallel prefill pass; each output token needs its own sequential decode pass. So output dominates latency, and providers price it about 5× higher.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give three reasons LLMs hallucinate and one fix for each.</summary><div class="qa-body">(1) Trained for plausible, not true, text → ground answers in retrieved documents (RAG). (2) Cutoff and private data missing → tools to look things up. (3) Rewarded for guessing → allow "I don't know", ask for citations, check with evals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>By Chinchilla, how many tokens should a 70B model see? Why do labs train small models on far more?</summary><div class="qa-body">About 20 × 70B = 1.4T tokens. Over-training small models (8B on 15T) costs similar compute but makes every future request much cheaper to serve, and inference is paid forever.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A bank wants an assistant over customer data that must never leave its data centre. Open or closed model?</summary><div class="qa-body">Open weights, self-hosted (possibly quantised and fine-tuned). Data residency is a hard, named reason. Trade-off: GPU cost, serving operations, and possibly some frontier quality.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does sampling need softmax first, and why does temperature act on logits rather than on probabilities?</summary><div class="qa-body">Sampling needs positive weights that sum to 1; logits can be negative and don't sum to anything, so softmax converts them. Dividing logits by T before softmax scales every gap between scores evenly (gap 1 between "on" and "late" becomes 2 at T = 0.5), which sharpens or flattens while keeping the ranking. Raising probabilities to a power and renormalising is equivalent, but working on logits is the natural place because that is what the network outputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a chat model still hallucinate even though post-training taught it to answer?</summary><div class="qa-body">Post-training changes <em>how</em> it continues (answer, tone, refusing) but uses the same next-token objective on the same knowledge. If order 101's status was never in the training data or the prompt, the likeliest continuation of "Your order is" is still "on the way". Only grounding (putting facts in the context), tools, or abstention change that.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you ignore tokens and plan by characters?</summary><div class="qa-body">Three things built on tokens break: the context budget (Hindi or JSON overflow the window sooner than expected), the bill (priced per token, Hindi about 5× more tokens per character than English), and arithmetic intuition (numbers split into "12" + "40", so the model's maths is weaker on long numbers).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why would temperature 0 not be enough to make Biteful's tests repeatable?</summary><div class="qa-body">Temperature only controls the sampling step. The logits themselves are long floating-point sums whose result depends on addition order, which changes with batching on a GPU server; a near-tie can flip ("late" in one run, "on" in another), and autoregression spreads the change. Tests must check properties of the reply, not exact text.</div></details>
  <div class="bridge"><b>Next:</b> <a class="xref" data-note="prompting">Prompt Engineering</a>, where the same Biteful assistant learns to follow a written brief.</div>
</main>`
});
