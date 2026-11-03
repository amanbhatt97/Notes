// notes/genai/llm_basics.js — How LLMs Work
Object.assign(TOPIC_CONTENT, {
  "llm_basics": `<main>
  <h1>How LLMs Work</h1>
  <div class="where"><span>Generative AI</span><span>Foundations</span><span>How LLMs Work</span></div>
  <p class="lead">A large language model, or LLM, is a program that reads some text and predicts what text should come next, one small piece at a time. Chat assistants, coding assistants and document summarisers are all built on this single ability, so understanding it explains both what these systems are good at and why they fail in the ways they do: why they invent facts, why the same question gets different answers, why bills are counted in "tokens", and why a model cannot tell you where today's order is. In <a class="xref" data-note="transformers">Transformers</a> you saw the network that turns text into one vector per position; this page shows how that becomes a working assistant. The running example, used across the whole Generative AI track, is Biteful's food-delivery support assistant. A customer, Asha, writes <em>"Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"</em>, and the assistant has started its reply with "Your order is ___". Every idea on this page is added to that one moment.</p>

  <h2 id="lb-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">How LLMs Work</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The core loop</div>
        <ul>
          <li>Last vector → one <b>logit</b> per token → <b>softmax</b> → probabilities</li>
          <li>Pick one token, append it, run again (<b>autoregressive</b>)</li>
          <li><b>Pretraining</b>: guess the next token on huge text, loss = −log p(true token)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tokens and limits</div>
        <ul>
          <li><b>Tokens</b> are sub-word pieces; Asha's 63 characters = 21 tokens</li>
          <li><b>Context window</b>: max tokens (prompt + reply) per call</li>
          <li><b>KV cache</b> makes decoding fast, costs GPU memory</li>
          <li>Price and latency are per token; output costs more</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing the token</div>
        <ul>
          <li><b>Greedy</b>, <b>temperature</b>, <b>top-k</b>, <b>top-p</b></li>
          <li>Outputs vary: random sampling + floating-point order</li>
          <li>Base model continues text; <b>SFT</b> + <b>RLHF/DPO</b> make it an assistant</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Limits and scale</div>
        <ul>
          <li>No memory, knowledge cutoff, <b>hallucination</b>, weak arithmetic</li>
          <li><b>Scaling laws</b>: bigger is steadily better, never perfect</li>
          <li>Closed APIs vs open weights; reasoning models think in extra tokens</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lb-next"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Predicting the Next Token</span><span class="rm-sub">how a vector becomes a word</span></div></div>
      <div class="rm-item rm-done" data-target="lb-pretrain"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Pretraining</span><span class="rm-sub">learning by guessing the next token</span></div></div>
      <div class="rm-item rm-done" data-target="lb-tokens"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Tokens</span><span class="rm-sub">the pieces a model reads, and what they cost</span></div></div>
      <div class="rm-item rm-done" data-target="lb-window"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Context Window and the KV Cache</span><span class="rm-sub">how much it can read, and how replies are generated fast</span></div></div>
      <div class="rm-item rm-done" data-target="lb-sample"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Sampling</span><span class="rm-sub">greedy, temperature, top-k, top-p</span></div></div>
      <div class="rm-item rm-done" data-target="lb-vary"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Why Outputs Vary</span><span class="rm-sub">randomness and rounding</span></div></div>
      <div class="rm-item rm-done" data-target="lb-stages"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">From Base Model to Chat Assistant</span><span class="rm-sub">SFT, chat templates, RLHF and DPO</span></div></div>
      <div class="rm-item rm-done" data-target="lb-limits"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">What LLMs Can't Do</span><span class="rm-sub">memory, cutoff, hallucination, arithmetic</span></div></div>
      <div class="rm-item rm-done" data-target="lb-scale"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Scaling Laws</span><span class="rm-sub">what a bigger model buys</span></div></div>
      <div class="rm-item rm-done" data-target="lb-family"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Model Families, Sizes and Reasoning Models</span><span class="rm-sub">which models exist and what they cost to run</span></div></div>
      <div class="rm-item rm-done" data-target="lb-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">base vs chat, temperature 0, words vs tokens</span></div></div>
      <div class="rm-item rm-done" data-target="lb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, numbers to remember</span></div></div>
      <div class="rm-item rm-done" data-target="lb-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask about LLMs</span></div></div>
    </div>
  </div>

  <h2 id="lb-next"><span class="num">01</span>Predicting the Next Token</h2>
  <p>Biteful's assistant has already written "Your order is" and must choose the next word. The transformer has read those words and, for the last position, produced a vector: a list of numbers that summarises "what should come next here". A list of numbers is not a word, though. We need a way to turn it into a score for every word the model knows, so that one can be picked.</p>
  <p>The model does this with a big table called the <strong>unembedding</strong>, which holds one learned vector for every entry in its vocabulary. It takes the dot product of the last position's vector with every row of that table (multiply the numbers pair by pair and add them up). A large dot product means "this word fits well here". These raw scores are called <strong>logits</strong>. Logits can be any size and can be negative, so they are not yet probabilities. A function called <strong>softmax</strong> converts them: it raises e to the power of each logit, which makes every score positive, and then divides each by the total, so that all the results add up to 1. The output is a <strong>probability distribution</strong>: a probability for every token in the vocabulary.</p>
  <p>Think of the suggestion strip above your phone keyboard. After you type "Your order is", it offers its three favourite next words. An LLM is that suggestion strip with a vocabulary of 50,000 to 200,000 pieces and a far better sense of context. It never looks an answer up anywhere; it only scores every possible next piece.</p>
  <p>Let us shrink everything until it fits on paper: a vector of 3 numbers and a vocabulary of 5 words.</p>
  <div class="fx" data-lang="py">import numpy as np

# The transformer has read "Your order is" and produced one vector for the last
# position. Real models use thousands of numbers; we use 3 so we can check by hand.
h = np.array([1.0, 0.5, -1.0])

# The unembedding table: one row per vocabulary token. Real vocabularies have
# 50,000-200,000 rows; ours has 5.
vocab = ["on", "late", "ready", "delivered", "cancelled"]
W = np.array([[1.0, 2.0, 0.0],    # on
              [0.0, 2.0, 0.0],    # late
              [0.5, 0.0, 0.0],    # ready
              [1.0, 0.0, 1.0],    # delivered
              [0.0, 0.0, 1.0]])   # cancelled

logits = W @ h                                   # one dot product per token
probs = np.exp(logits) / np.exp(logits).sum()    # softmax
for w, z, p in zip(vocab, logits, probs):
    print(f"{w:10s} logit={z:5.2f}  p={p:.3f}")
print("sum of p:", round(probs.sum(), 6))</div>
  <div class="fx" data-lang="text">on         logit= 2.00  p=0.563
late       logit= 1.00  p=0.207
ready      logit= 0.50  p=0.126
delivered  logit= 0.00  p=0.076
cancelled  logit=-1.00  p=0.028
sum of p: 1.0</div>
  <p><code>W @ h</code> computes all five dot products at once. For "on" it is 1×1 + 2×0.5 + 0×(−1) = 2.0, and e<sup>2</sup> = 7.389. Adding e<sup>logit</sup> for all five words gives 13.124, so "on" gets 7.389 / 13.124 = 0.563. The probabilities sum to exactly 1, and "on" is the favourite, followed by "late" at 0.207. Notice what the numbers do <em>not</em> contain: nothing here checked where Asha's order actually is. "on" wins because "Your order is on the way" is a very common phrase in the text the model learned from. Keep that in mind; it is the root of hallucination in section 08.</p>
  <p>One token is not a reply. The model appends the chosen token, so the text becomes "Your order is on", runs the whole network again to get a distribution for the next position, picks again, and repeats until it produces a special end token or reaches a length limit. Generating text one token at a time, where each new token depends on everything written before it, is called <strong>autoregressive generation</strong>. So a <strong>large language model</strong> is, precisely, a transformer (usually decoder-only) with billions of parameters that outputs a probability distribution over its vocabulary for the next token, and is run in this loop. Everything else on this page is either how that distribution is learned, how a token is chosen from it, or what follows from working this way.</p>

  <h2 id="lb-pretrain"><span class="num">02</span>Pretraining</h2>
  <p>In the last section we simply assumed a good unembedding table and a good vector. Where do weights that rank "on" above "cancelled" come from? Writing rules by hand is hopeless, and paying people to label millions of "correct next words" would take forever. What does exist, for free, is an enormous amount of written text. The trick is to turn that text into a quiz that marks itself: hide the next token, let the model guess, then reveal the real one. The text already contains the right answer at every position, so no human labelling is needed. Learning this way is called <strong>self-supervised learning</strong>, and this first, largest phase of training is called <strong>pretraining</strong>.</p>
  <p>Imagine a child doing fill-in-the-blank exercises cut from every newspaper in the country: "Virat Kohli hit a ___", "The monsoon reached Kerala on ___". To get good at it, the child has to pick up grammar, cricket, geography and dates, even though nobody teaches those directly; they are simply needed to fill the blanks well. A model learns facts and grammar the same way, as a side effect of guessing better, only on far more text than any person could read in a thousand lifetimes.</p>
  <p>To mark each guess we need a number that says how wrong it was. The standard choice is <strong>loss = −log p(true next token)</strong>, also called <strong>cross-entropy loss</strong>. If the model gave the true token probability 1, the loss is 0. If it gave it 0.3, the loss is −ln 0.3 = 1.204. The less likely the model thought the truth was, the bigger the penalty. Training means adjusting the weights so that the average loss over all positions goes down.</p>
  <p>Our "internet" will be ten lines of Biteful support chat. The simplest possible language model is a <strong>bigram model</strong>, which predicts the next token from the previous one only, by counting. A transformer looks at all previous tokens, not just one, but the loss is computed in exactly the same way:</p>
  <div class="fx" data-lang="py">import numpy as np
from collections import Counter, defaultdict

# Our whole "internet": 10 lines of Biteful support chat. &lt;s&gt; marks a line's start.
LINES = ["your order is on the way .", "your order is late by ten minutes .",
         "where is my order ?", "my order is late .", "is my order on the way ?",
         "your order is ready .", "my food is cold .", "where is my refund ?",
         "your refund is on the way .", "sorry , your order is on the way ."]
SENTENCES = [["&lt;s&gt;"] + line.split() for line in LINES]

# "Training" the simplest language model: count which token follows which.
follow = defaultdict(Counter)
for s in SENTENCES:
    for prev, nxt in zip(s, s[1:]):
        follow[prev][nxt] += 1

def p_next(prev, nxt):
    return follow[prev][nxt] / sum(follow[prev].values())

print("after 'is':", dict(follow["is"]))

# Score one line: loss = -log p(true next token) at every position
target = ["&lt;s&gt;"] + "your order is on the way .".split()
losses = []
for prev, nxt in zip(target, target[1:]):
    p = p_next(prev, nxt)
    losses.append(-np.log(p) + 0.0)          # + 0.0 turns -0.0 into 0.0
    print(f"{prev:6s} -&gt; {nxt:6s} p={p:.3f}  loss={losses[-1]:.3f}")
avg = np.mean(losses)
print("average loss:", round(avg, 3), " perplexity:", round(np.exp(avg), 2))</div>
  <div class="fx" data-lang="text">after 'is': {'on': 3, 'late': 2, 'my': 3, 'ready': 1, 'cold': 1}
&lt;s&gt;    -&gt; your   p=0.400  loss=0.916
your   -&gt; order  p=0.800  loss=0.223
order  -&gt; is     p=0.714  loss=0.336
is     -&gt; on     p=0.300  loss=1.204
on     -&gt; the    p=1.000  loss=0.000
the    -&gt; way    p=1.000  loss=0.000
way    -&gt; .      p=0.750  loss=0.288
average loss: 0.424  perplexity: 1.53</div>
  <p>After "is", the corpus contains "on" 3 times, "my" 3 times, "late" twice, "ready" and "cold" once each: ten cases. So p(on | is) = 3/10 = 0.3, and that position costs 1.204, the biggest loss in the line, because the model was genuinely unsure whether "your order is" continues with "on", "my" or "late". After "on" the next token is always "the", so p = 1 and the loss is 0. Averaged over the seven positions the loss is 0.424. A related number, <strong>perplexity</strong>, is e raised to the average loss: e<sup>0.424</sup> = 1.53 means "on average the model was as unsure as if choosing between about one and a half equally likely tokens". Lower is better. Notice also that one seven-token line gave seven quiz questions; a real model gets one question per token of its training text, trillions in total.</p>
  <p>Counting only works for a tiny table. Real models learn by <strong>gradient descent</strong>: start with weights that know nothing, measure the average loss, work out in which direction each weight should move to lower it (that direction is the <strong>gradient</strong>), move every weight a small step that way, and repeat. Here the same bigram model is written as a table of logits, starting from all zeros, which means every next token is equally likely:</p>
  <div class="fx" data-lang="py">import numpy as np

vocab = sorted({t for s in SENTENCES for t in s})
idx = {t: i for i, t in enumerate(vocab)}
pairs = [(idx[a], idx[b]) for s in SENTENCES for a, b in zip(s, s[1:])]
X = np.array([a for a, _ in pairs]); Y = np.array([b for _, b in pairs])
V = len(vocab)
print("vocabulary size:", V, " training questions:", len(pairs))

# The model: a V x V table of logits (row = previous token). All zeros at the
# start, which means every next token is equally likely.
L = np.zeros((V, V))
def avg_loss(L):
    z = L[X] - L[X].max(1, keepdims=True)
    logp = z - np.log(np.exp(z).sum(1, keepdims=True))
    return -logp[np.arange(len(Y)), Y].mean()

for step in range(301):
    if step in (0, 10, 50, 300):
        print(f"step {step:3d}  average loss {avg_loss(L):.3f}")
    z = L[X] - L[X].max(1, keepdims=True)
    p = np.exp(z) / np.exp(z).sum(1, keepdims=True)
    p[np.arange(len(Y)), Y] -= 1              # gradient: predicted minus true
    grad = np.zeros_like(L); np.add.at(grad, X, p / len(Y))
    L -= 5.0 * grad                           # one small step downhill

print("uniform guess loss = ln(V) =", round(np.log(V), 3))
C = np.zeros((V, V)); np.add.at(C, (X, Y), 1)            # plain counts
print("best possible (the counted frequencies):", round(-np.mean(np.log(C[X, Y] / C[X].sum(1))), 3))
z = L[idx["is"]]; p = np.exp(z - z.max()); p /= p.sum()
print("learned p(next | 'is'):",
      {vocab[i]: round(float(p[i]), 2) for i in np.argsort(-p)[:5]})</div>
  <div class="fx" data-lang="text">vocabulary size: 21  training questions: 63
step   0  average loss 3.045
step  10  average loss 1.772
step  50  average loss 0.978
step 300  average loss 0.779
uniform guess loss = ln(V) = 3.045
best possible (the counted frequencies): 0.756
learned p(next | 'is'): {'my': 0.3, 'on': 0.3, 'late': 0.2, 'cold': 0.1, 'ready': 0.1}</div>
  <p>At step 0 the loss is exactly ln 21 = 3.045, the loss of a uniform guess over 21 tokens. After 300 small steps it is 0.779, close to 0.756, which is the best any bigram table can do on this data (the loss you get from the exact counts). The learned probabilities after "is" have become 0.3, 0.3, 0.2, 0.1, 0.1, matching the counts. The line <code>p[np.arange(len(Y)), Y] -= 1</code> is the whole gradient of cross-entropy with respect to the logits: predicted probabilities minus 1 at the true token. A real LLM runs this same procedure with billions of weights over trillions of tokens, and because its context is all the preceding text rather than one word, getting the loss down forces it to learn grammar, facts and some reasoning.</p>
  <p>The model that comes out of pretraining is called a <strong>base model</strong>. It is very knowledgeable, but it has only ever learned to continue text. It has not learned to answer questions or follow instructions. That gap is closed later, in section 07.</p>

  <h2 id="lb-tokens"><span class="num">03</span>Tokens</h2>
  <p>So far we split text on spaces, and we keep saying "token" rather than "word". The reason is practical. A vocabulary of whole words cannot cope with typos, new restaurant names or other languages, while a vocabulary of single characters makes every sentence very long and slow to process. LLMs use a middle path: <strong>sub-word tokens</strong>. Common words get a single token; rare words are split into a few pieces. The vocabulary is built by an algorithm called <strong>byte-pair encoding</strong> (BPE), which starts from single bytes and repeatedly merges the most frequent neighbouring pair into a new token, until the vocabulary reaches its target size. The program that splits text into tokens is the <strong>tokenizer</strong>.</p>
  <p>Think of the abbreviations people used in text messages. Frequent words got short codes ("pls", "thx"); an unusual name had to be spelled out piece by piece. A tokenizer is a fixed codebook learned from lots of text: frequent strings are cheap to write, rare ones are expensive.</p>
  <p>This matters because every limit and every bill is counted in tokens, not words. Here is Asha's message through GPT-2's real tokenizer. Claude, GPT and Llama models use larger, different vocabularies, so their exact counts differ, but they behave the same way:</p>
  <div class="fx" data-lang="py">from gpt2_tok import enc        # GPT-2's real 50,257-token BPE vocabulary

asha = "Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"
ids = enc.encode(asha)
print(len(asha), "characters -&gt;", len(ids), "tokens")
print([enc.decode([i]) for i in ids])
print("first ids:", ids[:6])

for label, text in [("English", "Where is my order?"),
                    ("Hindi", "मेरा ऑर्डर कहाँ है?"),             # "where is my order?"
                    ("JSON", '{"order_id": 101, "restaurant": "Dosa Hut"}')]:
    n = len(enc.encode(text))
    print(f"{label:7s} {len(text):3d} chars -&gt; {n:3d} tokens  (chars/4 guess: {len(text) // 4})")</div>
  <div class="fx" data-lang="text">63 characters -&gt; 21 tokens
['Hi', ',', ' my', ' order', ' 101', ' from', ' D', 'osa', ' Hut', ' was', ' due', ' at', ' 8', ':', '30', ' pm', '.', ' Where', ' is', ' it', '?']
first ids: [17250, 11, 616, 1502, 8949, 422]
English  18 chars -&gt;   5 tokens  (chars/4 guess: 4)
Hindi    19 chars -&gt;  29 tokens  (chars/4 guess: 4)
JSON     43 chars -&gt;  17 tokens  (chars/4 guess: 10)</div>
  <p>Asha's 63 characters became 21 tokens, about 3 characters each. Common words such as " order" and " Where" are one token each, and the leading space is part of the token. "Dosa" is rare in English text, so it splits into " D" and "osa", and the time "8:30" becomes three tokens. The numbers in the "first ids" line are what the model actually receives: each token is just an index into its vocabulary. The comparison lines show why the popular rule "about 4 characters per token" is dangerous. It is close for English, but the same question in Hindi needs 29 tokens for 19 characters, because this vocabulary was learned mostly from English and Devanagari text falls apart into byte-sized pieces, and JSON with its quotes and braces needs 17 tokens where the rule predicts 10.</p>
  <p>Tokens are also the unit of price and of time. Providers charge per token, separately for <strong>input tokens</strong> (everything you send) and <strong>output tokens</strong> (everything the model writes), and output tokens cost several times more, for a reason we will see in the next section. Waiting time follows the same pattern: the reply appears roughly at a fixed delay plus the number of output tokens divided by the generation speed. For one of Asha's requests, about 450 input tokens (the rules, her order record and her message) and a 60-token reply:</p>
  <div class="fx" data-lang="py"># EXAMPLE list prices, USD per 1M tokens (input, output), Oct 2026. Prices change.
PRICES = {"claude-opus-5-5":   (4.00, 20.00),
          "claude-sonnet-5-5": (2.00, 10.00),
          "claude-haiku-5-5":  (0.10,  0.50)}

def call_cost(model, input_tokens, output_tokens):
    p_in, p_out = PRICES[model]
    return (input_tokens * p_in + output_tokens * p_out) / 1e6

def latency(output_tokens, ttft=0.5, tokens_per_sec=60):     # assumed speeds
    return ttft + output_tokens / tokens_per_sec

# Asha's request: rules + order record + her message = 450 tokens in, 60 out
for model in PRICES:
    print(f"{model:18s} \${call_cost(model, 450, 60):.6f} per reply")
print("latency, 60-token reply :", round(latency(60), 2), "s")
print("latency, 600-token reply:", round(latency(600), 2), "s")</div>
  <div class="fx" data-lang="text">claude-opus-5-5    $0.003000 per reply
claude-sonnet-5-5  $0.001500 per reply
claude-haiku-5-5   $0.000075 per reply
latency, 60-token reply : 1.5 s
latency, 600-token reply: 10.5 s</div>
  <p>Check the Opus line by hand: 450 × $4 / 1,000,000 = $0.0018, plus 60 × $20 / 1,000,000 = $0.0012, total $0.0030. The 60 output tokens cost two thirds as much as the 450 input tokens. The latency lines show that a reply ten times longer takes about seven times as long here. The prices are Anthropic's list prices as of October 2026, used only as examples; always check the provider's current page. A whole day of Biteful's traffic is costed in <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>.</p>

  <h2 id="lb-window"><span class="num">04</span>The Context Window and the KV Cache</h2>
  <p>A model cannot read unlimited text in one go. Each call can attend to at most a fixed number of tokens, counting the prompt <em>and</em> the reply it writes. That limit is the <strong>context window</strong>. Small open models have windows from a few thousand to about 128,000 tokens; current frontier APIs offer up to about a million. Anything outside the window simply does not exist for the model on that call. It is like an exam where you may bring one sheet of notes: whatever fits on the sheet you can use, and whatever does not fit, you do not have.</p>
  <p>Suppose Biteful's assistant uses a small open model with an 8,192-token window, and each request carries the rules, a delivery policy document, the chat so far, and Asha's new message, with room left for the reply:</p>
  <div class="fx" data-lang="py">WINDOW = 8_192                      # a small open model's context window
parts = {"system prompt (rules)": 350,
         "delivery policy doc":   5_000,
         "chat history so far":   2_400,
         "Asha's new message":    21}
reserve_output = 500                # room we must leave for the reply
used = sum(parts.values()) + reserve_output
print(f"total {used:,} of {WINDOW:,} -&gt;", "fits" if used &lt;= WINDOW else f"over by {used - WINDOW:,}")</div>
  <div class="fx" data-lang="text">total 8,271 of 8,192 -&gt; over by 79</div>
  <p>The request is 79 tokens over. There are two fixes: drop the oldest chat history, or send only the part of the policy that is relevant to Asha's question instead of all 5,000 tokens. The second fix is the central idea of <a class="xref" data-note="rag">Retrieval-Augmented Generation</a>. Even when everything fits, facts buried in the middle of a very long prompt are used less reliably than facts near the start or the end, an effect known as "lost in the middle", so a shorter, more focused prompt is usually better as well as cheaper.</p>
  <p>Inside one call, the work happens in two phases, and they explain why output tokens are slower and more expensive than input tokens. The prompt is known in advance, so all its tokens can go through the network together in one parallel pass. This phase is called <strong>prefill</strong>, and it determines the <strong>time to first token</strong> (TTFT). The reply is not known in advance: token 2 depends on token 1, so each output token needs its own pass through the network. This phase is called <strong>decode</strong>, and it determines how many tokens per second you see.</p>
  <p>Decode has a problem. In every layer, each token produces a key and a value vector (from <a class="xref" data-note="dl_attention">attention</a>), and each new token must attend to the keys and values of all tokens before it. Recomputing them for the whole text at every step would be enormously wasteful, because the keys and values of earlier tokens never change. So the server stores them in GPU memory and reuses them. That store is the <strong>KV cache</strong>. The figure shows step 6 of writing "Your order is on the ___": the five earlier tokens' keys and values are read from the cache, and only the new token's are computed.</p>
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
    <text x="40" y="136" class="tg">cached: computed once, read at every step</text>
    <text x="40" y="156" class="tb">new token: only its k and v are computed</text>
    <text x="470" y="136" class="tm">cost: GPU memory</text><text x="470" y="156" class="tm">128 KiB per token*</text>
    </svg><figcaption>Decode step 6 of "Your order is on the ___". *For an 8B-class model: 32 layers, 8 KV heads, head size 128, 16-bit numbers.</figcaption></figure>
  <p>The saving and the price are easy to calculate:</p>
  <div class="fx" data-lang="py">n = 1000                                    # tokens to generate
print("K,V computations without cache:", sum(range(1, n + 1)))   # recompute all, every step
print("K,V computations with cache   :", n)                      # one new token per step

# Memory: 2 (K and V) x layers x KV heads x head size x bytes per number
layers, kv_heads, head_dim, bytes_fp16 = 32, 8, 128, 2           # an 8B-class model
per_token = 2 * layers * kv_heads * head_dim * bytes_fp16
print("per token:", per_token // 1024, "KiB")
for seq in [8_192, 128_000]:
    print(f"{seq:&gt;7,} tokens: {per_token * seq / 2**30:.2f} GiB per conversation")</div>
  <div class="fx" data-lang="text">K,V computations without cache: 500500
K,V computations with cache   : 1000
per token: 128 KiB
  8,192 tokens: 1.00 GiB per conversation
128,000 tokens: 15.62 GiB per conversation</div>
  <p>Without the cache, step t recomputes keys and values for all t tokens so far, so 1,000 tokens cost 1 + 2 + … + 1,000 = 500,500 computations. With the cache it is one per step: 1,000. The price is memory: 2 × 32 × 8 × 128 × 2 bytes = 128 KiB for every token of every conversation, which is 1 GiB for one 8,192-token conversation and over 15 GiB for a 128,000-token one. This is why serving long contexts to many users at once is limited by GPU memory, and why techniques that shrink the cache (fewer key/value heads, 8-bit caches) exist. Do not confuse the KV cache with <strong>prompt caching</strong>, a billing feature in which a provider reuses an identical prompt prefix across separate API calls; that is covered in <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>.</p>

  <h2 id="lb-sample"><span class="num">05</span>Sampling</h2>
  <p>After "Your order is", the model gives "on" 0.563, "late" 0.207, "ready" 0.126, "delivered" 0.076 and "cancelled" 0.028. A reply needs one word. Should we always take the top one, draw one at random according to the probabilities, or something in between? The rule that turns a distribution into a single token is called the <strong>decoding</strong> or <strong>sampling strategy</strong>, and it changes the character of the output a great deal. Four settings cover almost every system.</p>
  <p>Picture someone giving a speech, choosing each next word. A cautious speaker always uses the safest word. A bolder speaker sometimes picks a less obvious one, which is lively but occasionally wild. A speaker can also limit themselves to "only my two favourite words" or to "only the words I am reasonably confident about". Those four styles are greedy decoding, temperature, top-k and top-p.</p>
  <p><strong>Greedy decoding</strong> always takes the most likely token. It is predictable, but it tends to produce dull text and can get stuck repeating itself. <strong>Temperature</strong> T divides every logit by T before softmax. With T below 1 the gaps between logits grow, so the favourite becomes even more dominant; with T above 1 the gaps shrink and unlikely tokens get more chances. As T approaches 0 sampling becomes greedy; as T grows very large every token approaches equal probability. Our logits are [2, 1, 0.5, 0, −1]:</p>
  <div class="fx" data-lang="py">import numpy as np

vocab  = ["on", "late", "ready", "delivered", "cancelled"]
logits = np.array([2.0, 1.0, 0.5, 0.0, -1.0])     # "Your order is ___"

def softmax(z):
    e = np.exp(z - z.max())          # subtracting the max avoids overflow; same answer
    return e / e.sum()

for T in [0.5, 1.0, 2.0]:
    p = softmax(logits / T)
    print(f"T={T}:", " ".join(f"{w}={x:.3f}" for w, x in zip(vocab, p)))

p = softmax(logits)
print("running total, most likely first:", np.round(np.cumsum(np.sort(p)[::-1]), 3))</div>
  <div class="fx" data-lang="text">T=0.5: on=0.829 late=0.112 ready=0.041 delivered=0.015 cancelled=0.002
T=1.0: on=0.563 late=0.207 ready=0.126 delivered=0.076 cancelled=0.028
T=2.0: on=0.375 late=0.227 ready=0.177 delivered=0.138 cancelled=0.084
running total, most likely first: [0.563 0.77  0.896 0.972 1.   ]</div>
  <p>At T = 0.5 the logits become [4, 2, 1, 0, −2], so "on" takes 83% and "cancelled" almost vanishes (0.002). At T = 2 they become [1, 0.5, 0.25, 0, −0.5], so "cancelled" triples from 0.028 to 0.084. The order of the five words never changes; only how sharply the probability is concentrated.</p>
  <p>Temperature alone still leaves every token possible, including the one that would wrongly tell Asha her order was cancelled. Two filters cut off the unlikely tail. <strong>Top-k</strong> keeps only the k most likely tokens. With k = 2, only "on" and "late" survive, and their probabilities are rescaled to sum to 1: 0.563 / 0.770 = 0.731 and 0.207 / 0.770 = 0.269. <strong>Top-p</strong>, also called nucleus sampling, keeps the smallest set of most likely tokens whose probabilities add up to at least p. Using the running totals printed above with p = 0.9: 0.563 is not enough, 0.770 is not enough, 0.896 is just short, 0.972 reaches it. So four tokens survive and only "cancelled" is removed. The advantage of top-p is that it adapts: when the model is confident, very few tokens pass; when it is unsure, many do. Top-k keeps the same number either way.</p>
  <p>Here is a complete sampler that applies the settings in the order inference engines do (temperature, then filtering, then rescale and draw), with 1,000 draws for each setting:</p>
  <div class="fx" data-lang="py">import numpy as np

vocab  = ["on", "late", "ready", "delivered", "cancelled"]
logits = np.array([2.0, 1.0, 0.5, 0.0, -1.0])

def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()

def sample(logits, temperature=1.0, top_k=None, top_p=None, rng=None):
    if temperature == 0:                 # greedy: always the most likely token
        return int(np.argmax(logits))
    probs = softmax(logits / temperature)
    if top_k is not None:                # keep the k most likely tokens
        cutoff = np.sort(probs)[-top_k]
        probs = np.where(probs &gt;= cutoff, probs, 0.0)
    if top_p is not None:                # keep the smallest set with total &gt;= p
        order = np.argsort(probs)[::-1]
        keep = order[: np.searchsorted(np.cumsum(probs[order]), top_p) + 1]
        probs = np.where(np.isin(np.arange(len(probs)), keep), probs, 0.0)
    probs = probs / probs.sum()          # renormalise the survivors
    return int(rng.choice(len(probs), p=probs))

rng = np.random.default_rng(0)
for name, kw in [("greedy", dict(temperature=0)),
                 ("T=1.0", dict(temperature=1.0)),
                 ("T=2.0", dict(temperature=2.0)),
                 ("T=1, top_k=2", dict(top_k=2)),
                 ("T=1, top_p=0.9", dict(top_p=0.9))]:
    picks = [vocab[sample(logits, rng=rng, **kw)] for _ in range(1000)]
    print(f"{name:15s}", {w: picks.count(w) for w in vocab if picks.count(w)})</div>
  <div class="fx" data-lang="text">greedy          {'on': 1000}
T=1.0           {'on': 530, 'late': 228, 'ready': 142, 'delivered': 70, 'cancelled': 30}
T=2.0           {'on': 416, 'late': 213, 'ready': 153, 'delivered': 137, 'cancelled': 81}
T=1, top_k=2    {'on': 743, 'late': 257}
T=1, top_p=0.9  {'on': 588, 'late': 216, 'ready': 123, 'delivered': 73}</div>
  <p>Greedy returns "on" all 1,000 times. At T = 1 the counts track the probabilities (530 "on" against the expected 563, 30 "cancelled" against 28). At T = 2, "cancelled" rises to 81, close to the 0.084 we calculated. With top-k = 2 only two words ever appear, in the ratio 743 to 257, matching 0.731 to 0.269. With top-p = 0.9, "cancelled" never appears at all. In practice, extraction, classification and factual answers use low temperature, while brainstorming or writing several different drafts uses higher temperature with top-p. One caution: not every API exposes these settings. Open models and many APIs do, but current Claude models (claude-opus-5-5, claude-sonnet-5-5, claude-haiku-5-5) reject non-default <code>temperature</code>, <code>top_p</code> and <code>top_k</code>; you steer them with the prompt and an <code>effort</code> setting instead.</p>

  <h2 id="lb-vary"><span class="num">06</span>Why Outputs Vary</h2>
  <p>Biteful's testers send Asha's message twice and get two different replies. Nothing is broken. There are two separate causes, and the second one surprises most people.</p>
  <p>The first cause is that sampling is random by design. With temperature above 0, each token is a random draw, and a single different early token changes everything after it, because every later token is predicted from the text so far. It is like two people retelling the same story: each sentence they choose nudges the next, so after a few sentences the two versions have drifted apart even though both are reasonable. Here is our counted bigram model from section 02 continuing "your order is" with four different random seeds (a <strong>seed</strong> is the starting value of the random number generator; the same seed gives the same draws):</p>
  <div class="fx" data-lang="py">import numpy as np
from collections import Counter, defaultdict

follow = defaultdict(Counter)                   # the counted bigram model
for s in SENTENCES:
    for a, b in zip(s, s[1:]):
        follow[a][b] += 1

def generate(prompt, seed, max_new=8):
    rng = np.random.default_rng(seed)
    toks = prompt.split()
    for _ in range(max_new):
        words, counts = zip(*follow[toks[-1]].items())
        toks.append(rng.choice(words, p=np.array(counts) / sum(counts)))   # SAMPLE
        if toks[-1] in ".?":
            break
    return " ".join(toks)

for seed in [1, 2, 4, 6]:
    print(f"seed {seed}:", generate("your order is", seed))</div>
  <div class="fx" data-lang="text">seed 1: your order is my refund ?
seed 2: your order is on the way .
seed 4: your order is cold .
seed 6: your order is my order is late .</div>
  <p>Same model, same prompt, four different texts. Seed 6 also shows a weak model looping back on itself ("is my order is late"). Fixing the seed makes a run repeatable on your own machine, but hosted APIs rarely let you fix it.</p>
  <p>The second cause is subtler: even greedy decoding, which involves no randomness, can give different answers on different runs. Every logit is a long sum of products computed with <strong>floating-point numbers</strong>, which store only a fixed number of digits and round after every operation. Because of that rounding, adding the same numbers in a different order can give a very slightly different total:</p>
  <div class="fx" data-lang="py">import numpy as np

# Floating-point addition is not associative: grouping changes the result.
print("(0.1 + 0.2) + 0.3 =", (0.1 + 0.2) + 0.3)
print("0.1 + (0.2 + 0.3) =", 0.1 + (0.2 + 0.3))

# A logit is a long sum. Suppose "on" and "late" are EXACTLY tied: both logits are
# the sum of the same 4,096 numbers. A GPU may add them in a different order on
# different runs, depending on batch size and which kernel it picks.
terms = np.random.default_rng(7).normal(0, 1, 4096).astype(np.float32)
sums = {"left to right":  terms.sum(),
        "reversed":       terms[::-1].sum(),
        "64 x 64 blocks": terms.reshape(64, 64).sum(0).sum()}
for name, v in sums.items():
    print(f"{name:15s} {float(v):.6f}")
for run, on_order, late_order in [("run A", "left to right", "reversed"),
                                  ("run B", "64 x 64 blocks", "left to right")]:
    on, late = sums[on_order], sums[late_order]
    print(f"{run}: greedy picks {'on' if on &gt; late else 'late'}")</div>
  <div class="fx" data-lang="text">(0.1 + 0.2) + 0.3 = 0.6000000000000001
0.1 + (0.2 + 0.3) = 0.6
left to right   -61.986206
reversed        -61.986202
64 x 64 blocks  -61.986191
run A: greedy picks late
run B: greedy picks on</div>
  <p>The first two lines are the root cause: in floating point, (0.1 + 0.2) + 0.3 is not exactly equal to 0.1 + (0.2 + 0.3). Summing the same 4,096 numbers in three different orders gives three slightly different totals. If "on" and "late" are exactly tied in true arithmetic, the tiny rounding difference decides the winner, so greedy picks "late" in run A and "on" in run B. On a GPU server the order of additions depends on things like how many requests are batched together, which changes with load. Real ties are rare, but over a long reply one near-tie is enough, and every token after it changes. It is like two cashiers totalling the same bill in different orders on a calculator that rounds at every step: usually the same answer, occasionally one paisa apart.</p>
  <p>The practical lesson is about testing. A test that compares the reply to an exact string ("reply must equal 'Your order is on the way.'") will fail at random. Test properties instead: the reply is valid JSON, the label is one of the allowed values, the order id is present, no time appears that is not in the data. You will see this habit again in <a class="xref" data-note="prompting">Prompt Engineering</a> and <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>.</p>

  <h2 id="lb-stages"><span class="num">07</span>From Base Model to Chat Assistant</h2>
  <p>Pretraining teaches a model to continue text, but Asha does not want her text continued. She wants an answer, in a helpful tone, without invented facts. Watch what our pretrained toy model does when given her question, using greedy decoding:</p>
  <div class="fx" data-lang="py">from collections import Counter, defaultdict

follow = defaultdict(Counter)                    # our pretrained toy "base model"
for s in SENTENCES:
    for a, b in zip(s, s[1:]):
        follow[a][b] += 1

def greedy(prompt, max_new=8):
    toks = prompt.split()
    for _ in range(max_new):
        toks.append(follow[toks[-1]].most_common(1)[0][0])   # always the top token
        if toks[-1] in ".?":
            break
    return " ".join(toks)

# Asha asks a question. A base model doesn't answer; it continues the text.
for prompt in ["where is my order", "is my order late", "my food is"]:
    print(f"{prompt!r:20s} -&gt; {greedy(prompt)!r}")</div>
  <div class="fx" data-lang="text">'where is my order'  -&gt; 'where is my order is on the way .'
'is my order late'   -&gt; 'is my order late by ten minutes .'
'my food is'         -&gt; 'my food is on the way .'</div>
  <p>None of these is an answer. "where is my order" continues as "where is my order is on the way ." and "my food is" becomes "my food is on the way .", which is fluent-looking text that resembles the training lines and nothing more. Real base models write excellent English, yet behave the same way in kind: given a question they may continue with more questions, or with a forum-style ramble, because during pretraining nothing made "question followed by a helpful reply" especially likely. Turning a base model into an assistant takes further training, together called <strong>post-training</strong>, in two main stages.</p>
  <p>Think of hiring a very well-read graduate. Pretraining is the years they spent reading the whole library: they know a lot. In their first month, a senior colleague shows them hundreds of worked examples: "when a customer asks this, reply like this". After that, for months, a manager looks at two drafts of a reply and says "this one is better", until the new hire develops a sense of what good looks like that no rulebook could capture.</p>
  <p>The worked-examples stage is <strong>supervised fine-tuning</strong> (SFT), also called instruction tuning. The model is trained with the same next-token loss as before, but on carefully written conversations in which the assistant's turns are good answers. A model after this stage is often called an <strong>instruct model</strong>. One practical question arises immediately: a transformer reads a single sequence of tokens, so how does it know which text is the system's instructions, which is the user's and which is its own reply? The answer is a <strong>chat template</strong>, which turns a list of messages into one string with special marker tokens for each role. The model learns what the markers mean during SFT:</p>
  <div class="fx" data-lang="py"># Stage 2 (SFT) data: one conversation with a good answer, written by people
sft_example = [
    {"role": "system", "content": "You are Biteful's support assistant."},
    {"role": "user", "content": "Where is my order 101?"},
    {"role": "assistant", "content": "Order 101 is out for delivery; Ravi should reach you by 9:05 pm."},
]

def to_text(messages, add_generation_prompt=True):
    """A simplified chat template: the model only ever sees one long string."""
    out = "".join(f"&lt;|{m['role']}|&gt;\\n{m['content']}&lt;|end|&gt;\\n" for m in messages)
    if add_generation_prompt:
        out += "&lt;|assistant|&gt;\\n"            # the model continues from here
    return out

print("--- one SFT training text ---")
print(to_text(sft_example, add_generation_prompt=False))
print("--- what the model sees when Asha chats ---")
print(to_text(sft_example[:2]))</div>
  <div class="fx" data-lang="text">--- one SFT training text ---
&lt;|system|&gt;
You are Biteful's support assistant.&lt;|end|&gt;
&lt;|user|&gt;
Where is my order 101?&lt;|end|&gt;
&lt;|assistant|&gt;
Order 101 is out for delivery; Ravi should reach you by 9:05 pm.&lt;|end|&gt;

--- what the model sees when Asha chats ---
&lt;|system|&gt;
You are Biteful's support assistant.&lt;|end|&gt;
&lt;|user|&gt;
Where is my order 101?&lt;|end|&gt;
&lt;|assistant|&gt;</div>
  <p>During SFT the loss is usually computed only on the assistant's tokens, so the model learns to answer rather than to imitate customers. At chat time the string ends with the <code>&lt;|assistant|&gt;</code> marker and nothing after it, so ordinary next-token prediction now produces a reply, because in thousands of training conversations that is what followed this marker. This is also why the same messages list from your code works at all: the provider applies the template for you. Real templates for Llama, Qwen or Claude use different markers, and if you run an open model yourself you must use its own template, or it behaves strangely.</p>
  <p>The second stage is <strong>preference tuning</strong>. Here the data has no single correct text, only a ranking: for one prompt, a person (or a rule) picked which of two answers is better. For "Where is order 101?" with no tracking data available, the grounded "I can't see live tracking for order 101, let me connect you to an agent" is chosen over the invented "It will arrive in 10 minutes". The original method, <strong>RLHF</strong> (reinforcement learning from human feedback), first trains a separate reward model to predict which answer people prefer, then uses reinforcement learning to push the LLM towards high-reward answers. A simpler method, <strong>DPO</strong> (direct preference optimisation), skips the reward model. It directly raises the probability of the chosen answer relative to the rejected one, measured against a frozen copy of the starting model so the model cannot drift too far from what it already knew:</p>
  <div class="fx" data-lang="py">import numpy as np

# One preference pair: same prompt ("Where is order 101?", no tracking data given)
#   chosen:   "I can't see live tracking for order 101. Let me connect you to an agent."
#   rejected: "Your order is on the way and will arrive in 10 minutes."
# DPO needs four log-probabilities: each answer under the model being trained (pi)
# and under a frozen copy of the starting model (ref). Made-up values for one step:
logp_pi_chosen,   logp_ref_chosen   = -12.0, -14.0
logp_pi_rejected, logp_ref_rejected =  -9.0,  -8.0
beta = 0.1                                   # how far the model may drift from ref

margin = (logp_pi_chosen - logp_ref_chosen) - (logp_pi_rejected - logp_ref_rejected)
def dpo_loss(m):
    return -np.log(1 / (1 + np.exp(-beta * m)))   # -log sigmoid(beta * margin)
print("margin =", margin, " loss =", round(dpo_loss(margin), 4))
print("loss if margin were 0 :", round(dpo_loss(0), 4))
print("loss if margin were 30:", round(dpo_loss(30), 4))</div>
  <div class="fx" data-lang="text">margin = 3.0  loss = 0.5544
loss if margin were 0 : 0.6931
loss if margin were 30: 0.0486</div>
  <p>Compared with the frozen copy, the chosen answer's log-probability rose by 2 (from −14 to −12) and the rejected answer's fell by 1 (from −8 to −9), so the margin is 2 − (−1) = 3. The loss is −log σ(0.1 × 3), where σ is the sigmoid function 1 / (1 + e<sup>−x</sup>), giving 0.554. With no preference learned yet (margin 0) the loss is ln 2 = 0.693, and a margin of 30 drives it down to 0.049. Training keeps pushing the margin up: more probability on the honest answer, less on the invented one. After preference tuning on many such pairs and on multi-turn conversations, the result is what people call a <strong>chat model</strong>. Reasoning models add one more stage, reinforcement learning on tasks with checkable answers, which section 10 returns to. The details of fine-tuning your own model are in <a class="xref" data-note="finetuning">Fine-Tuning</a>.</p>

  <h2 id="lb-limits"><span class="num">08</span>What LLMs Can't Do</h2>
  <p>A well-trained chat model now replies to Asha fluently, politely and confidently: "Your order is on the way." But Biteful never showed it the order table. Where did that sentence come from? Everything on this page follows from one fact: the model produces <em>likely</em> text given its training data and whatever is in its context window. Four important limits follow directly from that fact, and most later notes in this track exist to work around one of them.</p>
  <p>The first is that the model has <strong>no memory</strong> between calls. Each call is independent. A chatbot appears to remember earlier turns only because the application sends the whole conversation again with every new message. Close the session and the model knows nothing about Asha. The second is the <strong>knowledge cutoff</strong>: the model knows only what was in its training data, which stops at some date and never included private data such as the live status of order 101. The fix for both is to put the facts into the prompt, either directly, by retrieving them (<a class="xref" data-note="rag">RAG</a>), or by letting the model call a tool that looks them up (<a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>).</p>
  <p>The third limit is <strong>hallucination</strong>: output that is fluent and confident but false or unsupported. The training objective rewards plausible text. When the model's knowledge about something is blurry, plausible text still comes out, in exactly the same confident tone it uses for facts it knows well. Think of a student in an oral exam who skipped one chapter: they know what a good answer sounds like, so they speak fluently and confidently, and only a question like "which page is that on?" exposes the bluff. The fourth limit is <strong>exact arithmetic</strong>. Numbers are split into tokens in irregular pieces, and the model predicts digits the way it predicts words. Small sums usually come out right; long or unusual ones go wrong.</p>
  <p>The code shows both the arithmetic problem and what "blurry knowledge" means. The first part splits numbers with the real GPT-2 tokenizer. The second part uses hand-made probability distributions (illustrative, not taken from a real model): one for a well-known fact and one for a fact the model barely saw.</p>
  <div class="fx" data-lang="py">import numpy as np
from gpt2_tok import enc

# 1. Numbers are chopped into tokens in irregular pieces.
for text in ["240", "1240", "12403", "Rs 240 + Rs 1240 = Rs 1480"]:
    print(f"{text!r:30s}", [enc.decode([i]) for i in enc.encode(text)])

# 2. Sharp vs blurry knowledge: probabilities a model might give candidate answers
#    (illustrative numbers, not from a real model).
questions = {
    "capital of Maharashtra?":  (["Mumbai", "Pune", "Nagpur"],     [0.95, 0.04, 0.01]),
    "Biteful's refund window?": (["7 days", "14 days", "30 days"], [0.36, 0.33, 0.31]),
}
rng = np.random.default_rng(0)
for q, (answers, p) in questions.items():
    print(f"{q:26s} 5 samples:", [answers[rng.choice(3, p=p)] for _ in range(5)])</div>
  <div class="fx" data-lang="text">'240'                          ['240']
'1240'                         ['12', '40']
'12403'                        ['12', '403']
'Rs 240 + Rs 1240 = Rs 1480'   ['Rs', ' 240', ' +', ' Rs', ' 12', '40', ' =', ' Rs', ' 14', '80']
capital of Maharashtra?    5 samples: ['Mumbai', 'Mumbai', 'Mumbai', 'Mumbai', 'Mumbai']
Biteful's refund window?   5 samples: ['30 days', '14 days', '30 days', '14 days', '30 days']</div>
  <p>"240" is one token, but "1240" is "12" + "40" and "12403" is "12" + "403". The pieces do not line up with units, tens and hundreds, so adding 240 and 1240 means combining unrelated fragments, which is why a calculator tool is the reliable fix. For Maharashtra's capital, probability is concentrated on one answer and all five samples agree. For Biteful's refund window, probability is spread almost evenly across three answers, so five samples give two different answers, and the model would state either one with complete confidence. That disagreement between samples is a genuine warning sign, and it is the idea behind self-consistency in <a class="xref" data-note="prompting">Prompt Engineering</a>. APIs do not show you how spread out the model's knowledge is, so in practice the defence is to <strong>ground</strong> the model: give it the source facts in the prompt, tell it to answer only from them, and allow it to say "I'm not sure, let me check" instead of guessing. Then check the outputs, as <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a> describes. A bigger model hallucinates less, but never zero, so systems must be designed assuming it will happen.</p>

  <h2 id="lb-scale"><span class="num">09</span>Scaling Laws</h2>
  <p>Would a bigger model trained on more data simply remove these limits? And since a large training run costs millions of dollars, can a lab know in advance how good a model will be before paying for it? Roughly, yes. When researchers plotted a model's loss against its number of parameters, the amount of training data or the total compute, on logarithmic axes, the points fell on an almost straight line. So a lab can train several small models cheaply, draw the line, and read off what a large one will reach. These empirical relationships are called <strong>scaling laws</strong>. It is like a coaching centre noticing that every doubling of practice tests raises a student's score by about the same small amount: it never jumps and never stops, it just keeps creeping up with diminishing returns, and knowing that curve lets them plan.</p>
  <p>Three results are worth knowing. Training compute is approximately <strong>C = 6 × N × D</strong> floating-point operations, where N is the number of parameters and D the number of training tokens (about 2 operations per parameter per token for the forward pass and 4 for the backward pass). Kaplan and colleagues (2020) found that loss falls as a power law in N: every tenfold increase in parameters multiplies the loss by about 0.84. And the "Chinchilla" study (2022) showed that for a fixed compute budget, parameters and data should grow together, at roughly <strong>20 training tokens per parameter</strong>, a split called <strong>compute-optimal</strong>.</p>
  <div class="fx" data-lang="py">def train_flops(n_params, n_tokens):
    return 6 * n_params * n_tokens            # rule of thumb: C = 6 * N * D

GPU_FLOPS = 4e14                              # assumption: 400 TFLOP/s of useful work per GPU
for name, N, D in [("70B, Chinchilla-optimal", 70e9, 20 * 70e9),
                   ("8B, over-trained (15T)",   8e9, 15e12)]:
    C = train_flops(N, D)
    print(f"{name:25s} tokens/param={D / N:5.0f}  FLOPs={C:.1e}  GPU-days={C / GPU_FLOPS / 86400:,.0f}")

# Kaplan et al. (2020) fit for loss against parameter count: L(N) = (Nc / N) ** alpha
Nc, alpha = 8.8e13, 0.076
for N in [1e8, 1e9, 1e10, 1e11]:
    print(f"N={N:.0e}  predicted loss={(Nc / N) ** alpha:.3f}")</div>
  <div class="fx" data-lang="text">70B, Chinchilla-optimal   tokens/param=   20  FLOPs=5.9e+23  GPU-days=17,014
8B, over-trained (15T)    tokens/param= 1875  FLOPs=7.2e+23  GPU-days=20,833
N=1e+08  predicted loss=2.830
N=1e+09  predicted loss=2.376
N=1e+10  predicted loss=1.994
N=1e+11  predicted loss=1.674</div>
  <p>A compute-optimal 70B model and an 8B model trained on 15 trillion tokens, far past the Chinchilla ratio, cost about the same compute (17,000 against 21,000 GPU-days under our assumption). Labs often choose the small, over-trained one anyway, because training is paid once while serving is paid on every request, and the 8B model is about nine times cheaper per token to run. The predicted losses fall by the same factor for every tenfold increase (2.830, 2.376, 1.994, 1.674): steady improvement that never reaches zero. That is the honest answer to section 08: scale reduces the limits but does not remove them. One more point: scaling laws predict loss, not particular skills. Abilities that seem to appear suddenly at some size are partly an effect of measuring with all-or-nothing scores; with a smoother measure the skill usually improves gradually.</p>

  <h2 id="lb-family"><span class="num">10</span>Model Families, Sizes and Reasoning Models</h2>
  <p>Biteful now has to pick an actual model. There are two ways to get one. A <strong>closed model</strong> is available only through its maker's API; you send text and pay per token, and the weights stay secret. An <strong>open-weight model</strong> has its weights published for download, so you can run it on your own machines and fine-tune it, under a licence. Each maker releases a family in several sizes: a large, slower, most capable model and smaller, faster, cheaper ones. Choosing between an API and running your own is like choosing between booking a taxi and buying a car: the taxi has no upfront cost and someone else maintains it, but you pay per ride and travel through their system; the car is a big fixed cost whether you drive or not, but nobody else sees the route.</p>
  <table class="tbl"><caption>The landscape as of October 2026. Names and prices change every few months; verify before deciding.</caption>
    <tr><th>Family</th><th>Kind</th><th>Sizes / tiers</th><th>Notes</th></tr>
    <tr><td>Anthropic Claude</td><td>Closed API</td><td>Opus 5.5 ($4 / $20 per 1M input/output tokens), Sonnet 5.5 ($2 / $10), Haiku 5.5 ($0.10 / $0.50)</td><td>Up to 1M-token context; adaptive thinking controlled by an <code>effort</code> setting</td></tr>
    <tr><td>OpenAI GPT, Google Gemini</td><td>Closed API</td><td>Large, mid and small tiers; separate reasoning models</td><td>Check current prices; field names differ between providers</td></tr>
    <tr><td>Llama, Qwen, Mistral, Gemma, DeepSeek</td><td>Open weights</td><td>From about 1B (phones, laptops) through 7–8B and 30–70B to several hundred B</td><td>Run with Ollama, llama.cpp or vLLM; licences vary</td></tr>
  </table>
  <p>"Open-weight" is not the same as "open source": you usually get the trained weights but not the training data or code, and licences can restrict commercial use. If you run a model yourself, the first question is whether it fits on your hardware. The weights alone need the number of parameters times the bytes used per parameter. Storing each weight in 16 bits takes 2 bytes; <strong>quantisation</strong> stores weights in fewer bits (8 or 4) to save memory at a small cost in quality:</p>
  <div class="fx" data-lang="py"># Memory for the WEIGHTS alone = parameters x bytes per parameter
sizes = {"1B": 1e9, "8B": 8e9, "70B": 70e9, "405B": 405e9}
bytes_per = {"fp16": 2, "8-bit": 1, "4-bit": 0.5}
print(f"{'model':&gt;6} " + " ".join(f"{k:&gt;8}" for k in bytes_per))
for name, n in sizes.items():
    print(f"{name:&gt;6} " + " ".join(f"{n * b / 1e9:7.1f}G" for b in bytes_per.values()))</div>
  <div class="fx" data-lang="text"> model     fp16    8-bit    4-bit
    1B     2.0G     1.0G     0.5G
    8B    16.0G     8.0G     4.0G
   70B   140.0G    70.0G    35.0G
  405B   810.0G   405.0G   202.5G</div>
  <p>An 8B model needs 16 GB in 16-bit form but only 4 GB at 4 bits, which is why 4-bit 7–8B models run on a laptop, while a 405B model needs a multi-GPU server even at 4 bits. Remember to add the KV cache from section 04 on top. Whether self-hosting is worth it depends on volume. With assumed numbers for Biteful (3 million short replies a month, two rented GPUs running all day):</p>
  <div class="fx" data-lang="py"># All numbers are assumptions for illustration. Plug in your own.
requests_per_month = 3_000_000               # Biteful support replies
in_tok, out_tok = 450, 60                    # Asha-sized requests

def api_monthly(p_in, p_out):                # prices per 1M tokens
    return requests_per_month * (in_tok * p_in + out_tok * p_out) / 1e6

self_host = 2.50 * 2 * 730                   # 2 rented GPUs at $2.50/hour, 24x7

print(f"API, largest model  ($4 / $20)   : \${api_monthly(4.00, 20.00):,.0f} / month")
print(f"API, smallest model ($0.10 / $0.50): \${api_monthly(0.10, 0.50):,.0f} / month")
print(f"Self-host, 2 GPUs 24x7           : \${self_host:,.0f} / month + engineers")</div>
  <div class="fx" data-lang="text">API, largest model  ($4 / $20)   : $9,000 / month
API, smallest model ($0.10 / $0.50): $225 / month
Self-host, 2 GPUs 24x7           : $3,650 / month + engineers</div>
  <p>Self-hosting beats the largest API model here but loses badly to the smallest one, before counting the engineers who keep the GPUs running. GPUs cost the same busy or idle, while API bills scale with use. So the decision is rarely about price alone; data that must never leave the company, offline use, or a very high volume of one narrow task are the usual reasons to self-host.</p>
  <p>The newest distinction is the <strong>reasoning model</strong>. An ordinary model spends the same amount of computation on every token, whether the question is easy or hard. A reasoning model is trained, with reinforcement learning on tasks whose answers can be checked (maths problems, code with tests), to write a long internal chain of thought before its final answer. More thinking tokens mean more passes through the network, so the model spends more computation on harder problems; this is called <strong>test-time compute</strong>. On Claude, thinking is adaptive and you set its depth with <code>output_config={"effort": ...}</code>, from <code>"low"</code> to <code>"max"</code>; on claude-opus-5-5 thinking is always on and the default effort is medium. Thinking tokens are billed as output tokens even when you do not see them. If high effort used 1,000 output tokens where low effort used 200 (assumed numbers), the reply would cost $0.02 instead of $0.004 at $20 per million: worth it for a tricky refund calculation, wasteful for "where is my order?". Asking an ordinary model to "think step by step" is a prompting technique (<a class="xref" data-note="prompting">Prompt Engineering</a>); on a reasoning model you raise the effort instead.</p>

  <h2 id="lb-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The first mistake is using a base model as if it were a chatbot. If you download an open model whose name has no "Instruct" or "Chat" in it and ask it a question, it may answer with more questions, exactly like our toy in section 07. Use the instruction-tuned version, and send messages through its own chat template (for Hugging Face models, <code>tokenizer.apply_chat_template</code>).</p>
  <p>The second is believing that temperature 0 gives identical outputs. As section 06 showed, rounding differences on the server can flip a near-tie, after which the whole reply changes. Tests should check properties of the reply, not exact text, and on current Claude models temperature is not a setting at all.</p>
  <p>The third is budgeting by words or characters. "Four characters per token" is an English average; Asha's question in Hindi needed 29 tokens for 19 characters, and JSON needed 17 where the rule predicted 10. Count with the provider's tokenizer or token-counting endpoint, because limits and bills are in tokens.</p>
  <p>The fourth is ignoring the length of the output. Output tokens cost several times more than input tokens and dominate waiting time, so an instruction like "answer in two sentences" can save more money and time than switching to a cheaper model. Similarly, using maximum reasoning effort everywhere pays for thinking tokens on questions that do not need them.</p>
  <p>The fifth is trusting that the model remembers, or knows your data, or is right because it sounds sure. It has no memory between calls, no access to order 101 unless you put it in the prompt or give it a tool, and its tone carries no information about truth. "Your order is on the way" without data is a guess. Finally, do not mix up the KV cache (inside one generation, on the server, saves computation, costs GPU memory) with prompt caching (across API calls, saves money on a repeated prompt prefix).</p>

  <h2 id="lb-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core definitions</h3>
  <ul>
    <li><b>LLM</b>: a large (usually decoder-only) transformer that outputs a probability for every vocabulary token as the next token, run in a loop.</li>
    <li><b>Logit</b>: raw score for one token = its unembedding row · the last vector. <b>Softmax</b> turns logits into probabilities summing to 1.</li>
    <li><b>Autoregressive generation</b>: pick a token, append it, run again.</li>
    <li><b>Pretraining</b>: self-supervised next-token prediction on huge text; produces a <b>base model</b>.</li>
    <li><b>Cross-entropy loss</b> = −log p(true next token), averaged. <b>Perplexity</b> = e<sup>average loss</sup>.</li>
    <li><b>Token</b>: one piece of the sub-word vocabulary, built by <b>BPE</b>. <b>Context window</b>: max tokens (prompt + output) per call.</li>
    <li><b>Prefill</b>: prompt processed in one parallel pass (sets TTFT). <b>Decode</b>: one pass per output token. <b>KV cache</b>: stored keys/values of past tokens.</li>
    <li><b>SFT</b>: fine-tuning on good example conversations. <b>Chat template</b>: messages → one string with role markers. <b>RLHF / DPO</b>: tuning on preferred vs rejected answers.</li>
    <li><b>Hallucination</b>: fluent, confident, unsupported output. <b>Grounding</b>: give the facts in the prompt and answer only from them.</li>
    <li><b>Reasoning model</b>: trained to think in extra (billed) tokens before answering; <b>test-time compute</b>.</li>
  </ul>
  <h3>Sampling at a glance</h3>
  <table class="tbl">
    <tr><th>Setting</th><th>What it does</th><th>On "Your order is ___"</th></tr>
    <tr><td>Greedy</td><td>always the top token</td><td>"on" every time</td></tr>
    <tr><td>Temperature T</td><td>logits ÷ T before softmax; ranking unchanged</td><td>"cancelled": 0.002 (T = 0.5), 0.028 (T = 1), 0.084 (T = 2)</td></tr>
    <tr><td>Top-k</td><td>keep the k most likely, rescale</td><td>k = 2 → on 0.731, late 0.269</td></tr>
    <tr><td>Top-p</td><td>keep the smallest set with total ≥ p, rescale</td><td>p = 0.9 keeps 4, drops "cancelled"</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>Softmax with temperature</td><td>p<sub>i</sub> = e<sup>z<sub>i</sub>/T</sup> / Σ<sub>j</sub> e<sup>z<sub>j</sub>/T</sup></td></tr>
    <tr><td>KV cache per token</td><td>2 × layers × KV heads × head size × bytes (8B-class: 128 KiB)</td></tr>
    <tr><td>Cost per call</td><td>input tokens × input price + output tokens × output price</td></tr>
    <tr><td>Latency</td><td>TTFT + output tokens ÷ tokens per second</td></tr>
    <tr><td>DPO loss</td><td>−log σ(β × [(chosen gain vs ref) − (rejected gain vs ref)])</td></tr>
    <tr><td>Training compute</td><td>C ≈ 6 × N × D; Chinchilla: D ≈ 20 × N</td></tr>
    <tr><td>Weight memory</td><td>parameters × bytes (2 fp16, 1 8-bit, 0.5 4-bit); 8B fp16 = 16 GB</td></tr>
  </table>
  <h3>The four limits and their fixes</h3>
  <table class="tbl">
    <tr><th>Limit</th><th>Why</th><th>Fix</th></tr>
    <tr><td>No memory</td><td>each call is independent</td><td>your code resends the history</td></tr>
    <tr><td>Knowledge cutoff, no private data</td><td>only knows its training text</td><td>put facts in the prompt (RAG) or use a tool</td></tr>
    <tr><td>Hallucination</td><td>trained for plausible, not true</td><td>ground, allow "I don't know", check outputs</td></tr>
    <tr><td>Arithmetic</td><td>numbers split into odd tokens</td><td>calculator tool or code</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>A base model continues text; use an instruct/chat model with its own chat template.</li>
    <li>Temperature 0 is not fully deterministic; test properties, not exact strings.</li>
    <li>"4 characters per token" fails for Hindi, code and JSON; count real tokens.</li>
    <li>Output tokens cost more and set most of the latency; thinking tokens are billed as output.</li>
    <li>KV cache (inside one generation) ≠ prompt caching (across API calls).</li>
    <li>Open-weight ≠ open source.</li>
  </ul>

  <h2 id="lb-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does an LLM actually output at each step?</summary><div class="qa-body">A probability for every token in its vocabulary as the next token. The last position's vector is multiplied by the unembedding table to give one logit per token, and softmax turns the logits into probabilities. A decoding rule then picks one token, which is appended, and the model runs again.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is pretraining, and why does it need no labelled data?</summary><div class="qa-body">Pretraining trains the model to predict the next token over a huge text corpus, minimising cross-entropy loss (−log of the probability given to the true next token). The text supplies its own answers, because the target at every position is simply the token that comes next. This is called self-supervised learning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The model gave the true next token probability 0.25. What is the loss? What does a perplexity of 1.5 mean?</summary><div class="qa-body">The loss is −ln 0.25 ≈ 1.386. Perplexity is e raised to the average loss; 1.5 means the model was, on average, as unsure as if choosing between one and a half equally likely tokens. Lower perplexity means better prediction.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a token, and why don't LLMs just use words?</summary><div class="qa-body">A token is a sub-word piece from a fixed vocabulary built by byte-pair encoding. Whole-word vocabularies cannot handle typos, new names or many languages, and character vocabularies make sequences very long. Sub-words keep common words as single tokens while still being able to spell anything.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you estimate token counts as characters divided by four?</summary><div class="qa-body">That ratio is an English average. Languages the tokenizer saw less often, such as Hindi, and structured text like JSON or code break into many more tokens; in our example Hindi needed 29 tokens for 19 characters. Since context limits and prices are in tokens, count with the real tokenizer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the context window, and what happens when you exceed it?</summary><div class="qa-body">It is the maximum number of tokens, prompt plus output, that the model can attend to in one call. Text beyond it cannot be used; the API rejects the request or the application must trim it. Fixes are trimming old history, summarising it, or retrieving only the relevant parts of documents (RAG).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are output tokens slower and more expensive than input tokens?</summary><div class="qa-body">The prompt is known in advance, so all its tokens are processed together in one parallel prefill pass. Each output token depends on the previous one, so each needs its own sequential decode pass. Output therefore dominates latency and uses more GPU time per token, and providers price it several times higher.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the KV cache? Estimate its size for 32 layers, 8 KV heads, head size 128, fp16, 8K tokens.</summary><div class="qa-body">It stores the key and value vectors of all previous tokens so that each decode step computes them only for the new token, turning quadratic recomputation into linear work. Its cost is GPU memory: 2 × 32 × 8 × 128 × 2 bytes = 128 KiB per token, so about 1 GiB for 8,192 tokens of one conversation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain temperature. What happens as T goes to 0 and to infinity?</summary><div class="qa-body">Temperature divides the logits by T before softmax. Below 1 it sharpens the distribution towards the top token; above 1 it flattens it. As T approaches 0 all probability goes to the top token (greedy); as T grows very large the distribution approaches uniform. The ranking of tokens never changes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Top-k vs top-p: what is the difference, and why is top-p often preferred?</summary><div class="qa-body">Top-k keeps a fixed number of the most likely tokens; top-p keeps the smallest set whose probabilities add up to at least p. Top-p adapts to the model's confidence: very few tokens pass when it is sure, many when it is unsure, while a fixed k can let junk in or cut good options.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can the same prompt give different outputs even at temperature 0?</summary><div class="qa-body">Logits are long floating-point sums, and floating-point addition depends on the order of operations. On a server the order changes with batching and kernel choice, so a near-tie between two tokens can flip, and because generation is autoregressive, everything after it changes. Test properties of outputs rather than exact strings.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a base model, an instruct model and a chat model?</summary><div class="qa-body">A base model is only pretrained and continues text. An instruct model has been through supervised fine-tuning on instruction-and-answer examples, so it follows requests. A chat model has additionally been tuned on human preferences (RLHF or DPO) and multi-turn conversations with a chat template, making it helpful, honest and on-tone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does DPO differ from RLHF?</summary><div class="qa-body">RLHF trains a separate reward model on human rankings and then optimises the LLM against it with reinforcement learning, which is complex and can be unstable. DPO skips the reward model and directly raises the probability of the chosen answer relative to the rejected one, measured against a frozen reference model, using a simple classification-style loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do LLMs hallucinate, and how do you reduce it?</summary><div class="qa-body">They are trained to produce plausible text, not verified text, and they speak in the same confident tone whether their knowledge is sharp or blurry; they also lack private and recent data. Reduce it by grounding answers in provided sources (RAG), giving tools for live data, allowing the model to say it doesn't know, and checking outputs with evaluations.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are LLMs weak at arithmetic, and what is the fix?</summary><div class="qa-body">Numbers are split into irregular tokens ("1240" becomes "12" + "40"), so digits do not line up with place value, and the model predicts digits like words rather than computing. Small sums usually work but long ones fail. The fix is to let code do the maths, typically through a calculator tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do scaling laws say, and what is the Chinchilla result?</summary><div class="qa-body">Loss falls as a smooth power law as parameters, data and compute grow, so labs can predict a big model's loss from small runs; training compute is roughly 6 × parameters × tokens. Chinchilla found that for a fixed budget, parameters and tokens should grow together, about 20 tokens per parameter. Labs often over-train small models anyway because they are cheaper to serve.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How much memory does an 8B model need, and how does quantisation help?</summary><div class="qa-body">Weights need parameters × bytes per parameter: 16 GB in 16-bit, 8 GB in 8-bit, 4 GB in 4-bit, plus the KV cache and activations. Quantisation stores weights in fewer bits, trading a little quality for much less memory and often faster inference, which is how such models run on laptops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you self-host an open-weight model instead of calling an API?</summary><div class="qa-body">When data must not leave your infrastructure, when you need offline use, when you have very high volume of a narrow task where a smaller fine-tuned model is enough, or when you need full control of the model. Otherwise APIs are usually cheaper and better, since GPUs cost money even when idle and need engineers to run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a reasoning model, and what does "test-time compute" mean?</summary><div class="qa-body">A reasoning model is trained, often with reinforcement learning on checkable tasks, to generate a chain of thought before its final answer. Spending more thinking tokens means more computation at answer time, which is test-time compute; it improves hard problems but costs more, since thinking tokens are billed as output. On Claude you control it with the effort setting.</div></details>
</main>
`
});
