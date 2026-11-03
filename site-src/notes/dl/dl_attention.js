// dl/dl_attention.js — Attention Mechanisms
Object.assign(TOPIC_CONTENT, {
  "dl_attention": `<main>
  <h1>Attention Mechanisms</h1>
  <div class="where"><span>Deep Learning</span><span>Attention Mechanisms</span></div>
  <p class="lead">Attention is a way for a network to look back at all of its inputs and decide, at each step, which ones matter right now. It was invented to fix a specific failure of RNN translators, which had to squeeze a whole sentence into one vector, and it turned out to be so useful that the Transformer, the architecture behind BERT, GPT and every modern language model, is built almost entirely out of it. Questions such as "why do we divide by √d?" and "what is the difference between self-attention and cross-attention?" are standard in deep-learning interviews. This page continues the running example of <a class="xref" data-note="dl_rnns">RNNs &amp; Sequential Models</a>: a food-delivery app translating the review <strong>"chai not good"</strong> into Hindi, <strong>"chai achhi nahi hai"</strong>. We start from the problem that note left open and build up every piece of attention on those three words, stopping where the <a class="xref" data-note="transformers">Transformers</a> note takes over.</p>

  <h2 id="da2-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Attention</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why</div>
        <ul>
          <li>Seq2seq squeezes the whole input into one vector</li>
          <li>Accuracy at length 20: 0.53 without attention, 0.91 with</li>
          <li>Attention keeps every encoder state and reads a fresh mix per output step</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The mechanism</div>
        <ul>
          <li><b>Score</b> query vs each key → <b>softmax</b> → <b>weighted sum</b> of values</li>
          <li><b>Q</b> what I look for, <b>K</b> what I'm found by, <b>V</b> what I hand over</li>
          <li>Additive (Bahdanau) vᵀtanh(W₁s + W₂h); dot (Luong) sᵀh</li>
          <li><b>softmax(QKᵀ/√d<sub>k</sub>)V</b>; √d keeps softmax from saturating</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Kinds</div>
        <ul>
          <li><b>Self</b>: Q, K, V from one sequence; words read words</li>
          <li><b>Cross</b>: Q from the decoder, K and V from the encoder</li>
          <li><b>Multi-head</b>: h narrower attentions side by side, concat, W<sub>O</sub></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Masks and order</div>
        <ul>
          <li><b>Causal</b>: −∞ above the diagonal, no peeking ahead</li>
          <li><b>Padding</b>: −∞ for pad keys; mask before softmax</li>
          <li>Attention is order-blind → positional encoding</li>
          <li>Cost O(n²) in sequence length</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="da2-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Bottleneck Attention Removes</span><span class="rm-sub">why one vector is not enough</span></div></div>
      <div class="rm-item rm-done" data-target="da2-lookup"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Attention as a Soft Lookup</span><span class="rm-sub">scores, softmax, weighted sum; query, key, value</span></div></div>
      <div class="rm-item rm-done" data-target="da2-score"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Additive and Dot-Product Scores</span><span class="rm-sub">Bahdanau vs Luong</span></div></div>
      <div class="rm-item rm-done" data-target="da2-s2s"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Attention Inside Seq2seq</span><span class="rm-sub">measuring the fix</span></div></div>
      <div class="rm-item rm-done" data-target="da2-sdp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Scaled Dot-Product Attention</span><span class="rm-sub">the matrix form, and why we divide by √d</span></div></div>
      <div class="rm-item rm-done" data-target="da2-self"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Self-Attention and Cross-Attention</span><span class="rm-sub">words reading words</span></div></div>
      <div class="rm-item rm-done" data-target="da2-mh"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Multi-Head Attention</span><span class="rm-sub">several patterns at once</span></div></div>
      <div class="rm-item rm-done" data-target="da2-mask"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Masks</span><span class="rm-sub">no peeking ahead, no reading padding</span></div></div>
      <div class="rm-item rm-done" data-target="da2-pos"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Word Order and the Step to Transformers</span><span class="rm-sub">why attention needs positions</span></div></div>
      <div class="rm-item rm-done" data-target="da2-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">wrong axis, masks, scale, shapes</span></div></div>
      <div class="rm-item rm-done" data-target="da2-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, shapes, comparisons</span></div></div>
      <div class="rm-item rm-done" data-target="da2-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the attention questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="da2-why"><span class="num">01</span>The Bottleneck Attention Removes</h2>
  <p>The <a class="xref" data-note="dl_rnns">RNN note</a> ended with a seq2seq translator. An encoder RNN reads "chai not good" and computes a hidden state after each word: h<sub>chai</sub>, h<sub>not</sub> and h<sub>good</sub>. Then it throws the first two away and passes only the last one, a single vector of, say, 64 numbers, to the decoder RNN, which must write all four Hindi words from it. Notice the word order: "not" is the second English word but "nahi" is the third Hindi word, so the decoder needs the meaning of "not" at a moment when the encoder read it long ago, and the only place it can still exist is inside that one vector.</p>
  <p>For three words this works. For long inputs it does not. On the RNN note's toy task, reversing a list of digits, accuracy fell from 0.98 at length 5 to 0.53 at length 20. The vector has a fixed size while the input does not, and because an RNN overwrites its memory step by step, the earliest words are the first to fade. This is the <strong>information bottleneck</strong> of seq2seq: the encoder must compress an input of any length into one fixed-size vector, so its capacity does not grow with the input. Making the vector bigger only delays the problem.</p>
  <p>The fix starts from a simple observation: the encoder already computed a state for <em>every</em> input word, so keep all of them. Each time the decoder is about to write a word, it asks "which input words matter right now?", gives each encoder state a weight, and reads a weighted average of them. While writing "nahi" it should mostly read the state for "not"; while writing "achhi" (good) mostly the state for "good". That per-step weighted average is called the <strong>context vector</strong>, and the mechanism that computes the weights is <strong>attention</strong>. It was introduced by Bahdanau, Cho and Bengio in 2014 for machine translation.</p>
  <p>Think of two translators. The first must listen to the English paragraph once, close the file, and translate from memory; that is seq2seq. The second keeps the English page open on the desk, and for each Hindi word she writes, her eyes go back to the part of the page that matters, mostly one word and a little of its neighbours; that is seq2seq with attention.</p>
  <table class="tbl">
    <tr><th></th><th>Seq2seq</th><th>Seq2seq with attention</th></tr>
    <tr><td>What the decoder can see</td><td>the last encoder state only</td><td>every encoder state, at every step</td></tr>
    <tr><td>Context vector</td><td>one, the same for every output word</td><td>a new one for each output word</td></tr>
    <tr><td>Long inputs</td><td>early words fade</td><td>every word stays one step away</td></tr>
  </table>

  <h2 id="da2-lookup"><span class="num">02</span>Attention as a Soft Lookup</h2>
  <p>The goal is clear: give each encoder state a weight that says how relevant it is right now. But the weights must be computed from numbers, in a way that gradient descent can learn. Attention does it in three steps. First, <strong>score</strong> each encoder state against the decoder's current state, which acts as the question "what am I looking for?". Second, turn the scores into weights that are positive and add up to 1, using the <strong>softmax</strong> function. Third, take the <strong>weighted sum</strong> of the encoder states. The decoder state used for scoring is called the <strong>query</strong>.</p>
  <p>Here are the three steps by hand. The encoder states have 3 numbers each, made up so the arithmetic is easy; think of the three positions loosely as "is food", "is negation" and "is opinion". h<sub>1</sub> (chai) = [1, 0, 0.2], h<sub>2</sub> (not) = [0, 1, 0.1], h<sub>3</sub> (good) = [0.2, 0.3, 1]. The decoder is about to write "nahi", so it is looking for a negation: its query is s = [0, 2, 0].</p>
  <p>Step 1, the scores. The simplest score is the <strong>dot product</strong>: multiply matching positions and add. chai: 1·0 + 0·2 + 0.2·0 = 0. not: 0·0 + 1·2 + 0.1·0 = 2. good: 0.2·0 + 0.3·2 + 1·0 = 0.6. Step 2, softmax. Raise e to the power of each score, e<sup>0</sup> = 1, e<sup>2</sup> = 7.389, e<sup>0.6</sup> = 1.822, then divide each by their total, 10.211. The weights are 0.098, 0.724 and 0.178; they are all positive and they add up to 1. Step 3, the weighted sum: context = 0.098·h<sub>1</sub> + 0.724·h<sub>2</sub> + 0.178·h<sub>3</sub>. Its first number is 0.098·1 + 0.724·0 + 0.178·0.2 = 0.134, and the full vector is [0.134, 0.777, 0.270], mostly h<sub>2</sub>, the state for "not".</p>
  <figure class="viz"><svg viewBox="0 0 600 245" width="600">
<rect x="230" y="20" width="140" height="40" rx="6" class="ft st"/>
<text x="300" y="38" text-anchor="middle">decoder query s</text>
<text x="300" y="53" text-anchor="middle" class="tm">about to write "nahi"</text>
<g text-anchor="middle">
<rect x="60" y="150" width="110" height="36" rx="6" class="fb sb"/><text x="115" y="173">chai</text>
<rect x="245" y="150" width="110" height="36" rx="6" class="fb sb"/><text x="300" y="173">not</text>
<rect x="430" y="150" width="110" height="36" rx="6" class="fb sb"/><text x="485" y="173">good</text>
<text x="115" y="206" class="tm">h₁</text><text x="300" y="206" class="tm">h₂</text><text x="485" y="206" class="tm">h₃</text>
</g>
<line x1="270" y1="60" x2="115" y2="150" stroke="currentColor" stroke-width="1.3" stroke-opacity="0.5"/>
<line x1="300" y1="60" x2="300" y2="150" class="sg" stroke-width="8"/>
<line x1="330" y1="60" x2="485" y2="150" stroke="currentColor" stroke-width="2" stroke-opacity="0.5"/>
<g text-anchor="middle">
<text x="165" y="100">0.10</text><text x="335" y="110" class="tg">0.72</text><text x="450" y="100">0.18</text>
</g>
<text x="300" y="234" text-anchor="middle" class="tg">context = 0.10·h₁ + 0.72·h₂ + 0.18·h₃ = [0.134, 0.777, 0.270]</text>
</svg><figcaption>While writing "nahi", the decoder's query matches "not" best. Line thickness shows the attention weight, so the context vector is mostly the state for "not".</figcaption></figure>
  <p>The same three steps in NumPy, one line each:</p>
  <div class="fx" data-lang="py">import numpy as np
enc = np.array([[1.0, 0.0, 0.2],     # h1  chai
                [0.0, 1.0, 0.1],     # h2  not
                [0.2, 0.3, 1.0]])    # h3  good
s = np.array([0.0, 2.0, 0.0])        # decoder state while writing "nahi": the query

scores = enc @ s                     # 1. one dot product per encoder state
e = np.exp(scores)                   # 2a. make every score positive
w = e / e.sum()                      # 2b. divide by the total, so weights sum to 1
context = w @ enc                    # 3. weighted sum of the encoder states
print("scores ", scores.round(2))
print("exp    ", e.round(3), " total", e.sum().round(3))
print("weights", w.round(3))
print("context", context.round(3))</div>
  <div class="fx" data-lang="text">scores  [0.  2.  0.6]
exp     [1.    7.389 1.822]  total 10.211
weights [0.098 0.724 0.178]
context [0.134 0.777 0.27 ]</div>
  <p>Every number matches the hand calculation. <code>enc @ s</code> computes all three dot products at once (a matrix times a vector), and <code>w @ enc</code> is the weighted sum: it multiplies each row of <code>enc</code> by its weight and adds the rows. Look at what softmax did to the scores: a gap of 2 between "not" and "chai" became a weight ratio of 7.4 to 1, so the best match dominates while the others still contribute a little. When the decoder moves on to write the next word, its query changes, and the same three steps produce a different set of weights. That is what "a fresh context vector for every output word" means.</p>
  <p>Why softmax rather than simply picking the best-scoring word? Picking the maximum is a yes-or-no decision with no gradient, so the network could not learn which word to pick. Softmax is smooth: nudging a score nudges every weight a little, so gradient descent can steadily improve the scores. The weights also always sum to 1, which makes the output an average whose size does not depend on how many words the input has.</p>
  <p>This leads to the standard way of describing attention, as a soft dictionary lookup. A Python dictionary does a <strong>hard lookup</strong>: <code>menu["chai"]</code> finds the one key that matches exactly and returns its value, and anything else raises a <code>KeyError</code>. Attention does a <strong>soft lookup</strong>: it compares the query with <em>every</em> key, turns the match scores into weights, and returns a weighted blend of <em>all</em> the values. This separates three roles. The <strong>query</strong> is what the current step is looking for. A <strong>key</strong> is what an item is found by. A <strong>value</strong> is what an item hands over once it is found. In the example above the keys and the values were the same vectors, the encoder states, but they do not have to be.</p>
  <p>Picture asking at a tea stall for "something hot". The owner does not need you to say an exact menu name. He mentally compares "hot" with each item's description (the keys) and leans towards chai and coffee. If he could serve a blend, you would get mostly chai and coffee and a little lassi (the values), in proportion to how well each matched. In the next example each word of our review gets a key describing its role, [is-negation, is-opinion], and a separate value describing what it contributes, [mentions-chai, polarity]; "not" has the value polarity −1 because it flips the opinion. We then ask two different questions:</p>
  <div class="fx" data-lang="py">def softmax(z):
    e = np.exp(z - z.max(-1, keepdims=True))     # subtracting the max avoids overflow
    return e / e.sum(-1, keepdims=True)

menu = {"chai": 15, "coffee": 30, "lassi": 40}
print("hard lookup:", menu["chai"])              # exact key or KeyError

keys   = np.array([[0.0, 0.0],     # chai : (is-negation, is-opinion)
                   [1.0, 0.0],     # not
                   [0.0, 1.0]])    # good
values = np.array([[1.0,  0.0],    # chai : (mentions-chai, polarity)
                   [0.0, -1.0],    # not  : flips polarity
                   [0.0,  1.0]])   # good : positive polarity
for question, q in [("what is the opinion?", [0.0, 2.0]), ("is something negated?", [2.0, 0.0])]:
    w = softmax(keys @ np.array(q))
    print(f"{question:22s} weights {w.round(3)} -&gt; output {(w @ values).round(3)}")</div>
  <div class="fx" data-lang="text">hard lookup: 15
what is the opinion?   weights [0.107 0.107 0.787] -&gt; output [0.107 0.68 ]
is something negated?  weights [0.107 0.787 0.107] -&gt; output [ 0.107 -0.68 ]</div>
  <p>The query "what is the opinion?" puts 79% of its weight on "good", so the output's polarity is +0.68. The query "is something negated?" puts 79% on "not", and the polarity becomes −0.68. Only the query changed; it alone steered the lookup. Keys and values really are different here: "not" is <em>found</em> by its negation feature but <em>hands over</em> a polarity flip. This version of <code>softmax</code> subtracts the largest score before exponentiating, which gives exactly the same weights (softmax does not change if every score is shifted by the same amount) but avoids overflow, since e<sup>1000</sup> is too big for a float. In a real model the queries, keys and values are not hand-made: each is produced from the token vectors by its own learned matrix, Q = XW<sub>Q</sub>, K = XW<sub>K</sub>, V = XW<sub>V</sub>, and training adjusts these matrices so that useful queries match useful keys.</p>
  <p>One property is worth remembering because it affects how you read attention: softmax weights always sum to 1, so attention can never return "nothing found". Even if no key matches well, the output is still some blend of the values. Trained models often learn to park unused attention on a harmless token, such as a start symbol.</p>

  <h2 id="da2-score"><span class="num">03</span>Additive and Dot-Product Scores</h2>
  <p>Step 1 of attention needs a <strong>score function</strong>, a rule that gives a number for how well the decoder state s matches an encoder state h. The dot product we used is one choice. The two classic papers of the RNN era differ mainly here. Bahdanau et al. (2014) scored with a tiny neural network: score(s, h) = vᵀtanh(W₁s + W₂h), where W₁, W₂ and the vector v are learned. Because it adds the two transformed vectors before the tanh, this is called <strong>additive attention</strong>. Luong et al. (2015) used multiplication: the plain <strong>dot</strong> score sᵀh, or the <strong>general</strong> score sᵀWh with a learned matrix W in the middle. These are called <strong>multiplicative</strong> or dot-product attention.</p>
  <p>Think of matching a job applicant to a role. The dot product is a checklist: multiply "skill needed" by "skill held" item by item and add up. The general score is the same checklist after a learned re-weighting of what each skill means. The additive score is a small interview panel: it combines both profiles, considers them through a nonlinearity, and returns one verdict. The panel is more flexible; the checklist is much cheaper.</p>
  <p>Let us compute all three on 2-number encoder states, h<sub>1</sub> (chai) = [1, 0], h<sub>2</sub> (not) = [0, 1], h<sub>3</sub> (good) = [1, 1], with decoder state s = [0.5, 1]. The dot scores are s·h<sub>1</sub> = 0.5, s·h<sub>2</sub> = 1 and s·h<sub>3</sub> = 1.5. For the general score take W = [[1, 0], [0, −1]], which flips the sign of the second feature, so the scores become 0.5, −1 and −0.5: the same vectors now produce a completely different preference, because the learned W decides what "a match" means. For the additive score take W₁ = 0.5·I (half the identity), W₂ = [[1, −1], [0, 1]] and v = [1, 2]. For h<sub>1</sub>: W₁s = [0.25, 0.5], W₂h<sub>1</sub> = [1, 0], their sum is [1.25, 0.5], tanh gives [0.848, 0.462], and v· that = 0.848 + 2·0.462 = 1.773.</p>
  <div class="fx" data-lang="py">H = np.array([[1.0, 0.0],      # h1 chai
              [0.0, 1.0],      # h2 not
              [1.0, 1.0]])     # h3 good   (encoder states)
s = np.array([0.5, 1.0])       # decoder state, the query

dot = H @ s                                   # Luong dot:     s . h_j
Wg = np.array([[1.0, 0.0], [0.0, -1.0]])
general = H @ Wg.T @ s                        # Luong general: s^T W h_j
W1 = np.array([[0.5, 0.0], [0.0, 0.5]])       # Bahdanau additive: v^T tanh(W1 s + W2 h_j)
W2 = np.array([[1.0, -1.0], [0.0, 1.0]])
v  = np.array([1.0, 2.0])
inside = np.tanh(W1 @ s + H @ W2.T)           # one row per encoder state
additive = inside @ v
for name, sc in [("dot", dot), ("general", general), ("additive", additive)]:
    print(f"{name:8s} scores {sc.round(3)}  weights {softmax(sc).round(3)}")</div>
  <div class="fx" data-lang="text">dot      scores [0.5 1.  1.5]  weights [0.186 0.307 0.506]
general  scores [ 0.5 -1.  -0.5]  weights [0.629 0.14  0.231]
additive scores [1.773 1.175 2.055]  weights [0.348 0.191 0.461]</div>
  <p>The additive score for h<sub>1</sub>, 1.773, matches the hand calculation. With learned weights all three functions can work well, so the real difference is cost. The dot score for every pair of positions is one matrix multiplication, which GPUs do extremely fast. The additive score needs two matrix products, a tanh and another product for every pair. That speed is why the dot product won and why the Transformer uses it. The dot product has one weakness, though: its scores grow with the length of the vectors, while the tanh keeps additive scores bounded. Section 05 shows the problem and the √d fix.</p>
  <table class="tbl">
    <tr><th></th><th>Bahdanau (2014)</th><th>Luong (2015)</th></tr>
    <tr><td>Score</td><td>additive: vᵀtanh(W₁s<sub>t−1</sub> + W₂h<sub>j</sub>)</td><td>multiplicative: dot s<sub>t</sub>ᵀh<sub>j</sub> or general s<sub>t</sub>ᵀWh<sub>j</sub></td></tr>
    <tr><td>Query</td><td>previous decoder state s<sub>t−1</sub></td><td>current decoder state s<sub>t</sub></td></tr>
    <tr><td>Context used</td><td>fed into the decoder RNN step</td><td>combined with s<sub>t</sub> after the RNN step</td></tr>
    <tr><td>Encoder</td><td>bidirectional RNN</td><td>stacked one-direction RNN</td></tr>
    <tr><td>Cost</td><td>a small network per pair of positions</td><td>one matrix multiply</td></tr>
  </table>

  <h2 id="da2-s2s"><span class="num">04</span>Attention Inside Seq2seq</h2>
  <p>Does attention really remove the bottleneck? We can test it on the toy task from the RNN note: reverse a list of digits. Reversal is a good test because the first input digit is needed for the last output digit, the hardest case for a single context vector, just as "not" must survive until "nahi". The model is a GRU encoder-decoder with a 64-number hidden state, trained on lengths 4 to 20 for 800 steps and then tested on fresh lists of fixed lengths. The two runs differ only in the <code>if self.attn:</code> branch, which adds the three steps of section 02 using Luong dot scores: the decoder's current state is the query, and all encoder states are both the keys and the values.</p>
  <div class="fx" data-lang="py">import torch, torch.nn as nn, torch.nn.functional as F
V, H, BOS = 12, 64, 1                              # tokens 2..11 are digits, 1 = start symbol
class Seq2Seq(nn.Module):
    def __init__(self, attn):
        super().__init__(); self.attn = attn
        self.emb = nn.Embedding(V, H)
        self.enc = nn.GRU(H, H, batch_first=True)
        self.dec = nn.GRUCell(H, H)
        self.out = nn.Linear(2 * H if attn else H, V)
    def forward(self, src, dec_in):
        enc_out, h = self.enc(self.emb(src))       # enc_out: every encoder state; h: the last one
        h, logits = h[0], []
        for t in range(dec_in.size(1)):
            h = self.dec(self.emb(dec_in[:, t]), h)
            if self.attn:                          # the three steps, over ALL encoder states
                w = F.softmax(torch.einsum("bh,bsh-&gt;bs", h, enc_out), dim=1)   # score + softmax
                ctx = torch.einsum("bs,bsh-&gt;bh", w, enc_out)                   # weighted sum
                logits.append(self.out(torch.cat([h, ctx], 1)))
            else:
                logits.append(self.out(h))         # only the squeezed final state
        return torch.stack(logits, 1)

def batch(n, L):                                   # the reversal task from the RNN note
    src = torch.randint(2, V, (n, L)); tgt = src.flip(1)
    return src, torch.cat([torch.full((n, 1), BOS), tgt[:, :-1]], 1), tgt

def train_and_test(attn):
    torch.manual_seed(0)
    model = Seq2Seq(attn); opt = torch.optim.Adam(model.parameters(), lr=3e-3)
    for step in range(800):
        src, dec_in, tgt = batch(64, int(torch.randint(4, 21, (1,))))   # lengths 4 to 20
        loss = F.cross_entropy(model(src, dec_in).reshape(-1, V), tgt.reshape(-1))
        opt.zero_grad(); loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), 1.0); opt.step()
    acc = {}
    with torch.no_grad():
        for L in (5, 10, 15, 20):
            src, dec_in, tgt = batch(500, L)
            acc[L] = round((model(src, dec_in).argmax(-1) == tgt).float().mean().item(), 2)
    return acc

for attn in (False, True):
    acc = train_and_test(attn)
    print("with attention   " if attn else "without attention", acc)</div>
  <div class="fx" data-lang="text">without attention {5: 0.98, 10: 0.8, 15: 0.63, 20: 0.53}
with attention    {5: 0.99, 10: 0.98, 15: 0.96, 20: 0.91}</div>
  <p>Same model size, same training, and the run takes about half a minute on a CPU. Without attention, accuracy falls from 0.98 at length 5 to 0.53 at length 20. With attention it stays at 0.91 even at length 20. The key difference in the code is which variable the output layer can see: the no-attention branch only ever uses <code>h</code>, the decoder state that started from the squeezed final encoder state, while the attention branch also reads <code>enc_out</code>, the full list of encoder states. The two <code>einsum</code> lines are the batch versions of our NumPy steps: <code>"bh,bsh-&gt;bs"</code> means "dot the query with every encoder state, for every example in the batch", and <code>"bs,bsh-&gt;bh"</code> means "weighted sum of the encoder states". Note <code>dim=1</code> in the softmax: the weights must sum to 1 over the <em>input positions</em>, not over the hidden features.</p>

  <h2 id="da2-sdp"><span class="num">05</span>Scaled Dot-Product Attention</h2>
  <p>So far one query looked at a list of keys. In practice there are many queries, for example one per output word, and it is much faster to process them all together with matrices. Stack the queries as the rows of a matrix Q, the keys as the rows of K, and the values as the rows of V. Then QKᵀ (Q times K transposed) is a table containing every query-key dot product at once, with one row per query and one column per key. Softmax is applied to each row separately, so each query gets its own weights over the keys. Multiplying the weights by V gives each query's weighted sum. There is one more step, explained just below: before the softmax, the scores are divided by √d<sub>k</sub>, the square root of the length of each key vector. Together this is the formula at the heart of the Transformer, <strong>scaled dot-product attention</strong>: <strong>Attention(Q, K, V) = softmax(QKᵀ / √d<sub>k</sub>) · V</strong>.</p>
  <p>If Q has n rows (queries) and K and V have m rows (keys and values), the score table is n×m and the output has one row per query. Think of 3 students (queries) choosing among 3 tutors (keys): the score table is a 3×3 grid, each student divides her hour among the tutors (weights summing to 1 along her row), and leaves with a mix of their notes (values).</p>
  <p>Worked example with d<sub>k</sub> = 2. The keys and values belong to the source words chai, not and good; the three queries are the decoder steps writing "chai", "achhi" and "nahi". Q = [[1, 0], [0, 2], [1, 1]], K = [[2, 0], [0, 1], [1, 1]], V = [[10, 0], [0, 10], [5, 5]]. Row 1 of QKᵀ is the first query [1, 0] dotted with each key: 2, 0, 1. Scaling by √2 ≈ 1.414 gives 1.41, 0, 0.71. Softmax: e<sup>1.41</sup> = 4.11, e<sup>0</sup> = 1, e<sup>0.71</sup> = 2.03, total 7.14, so the weights are 0.58, 0.14, 0.28: writing "chai" looks mostly at "chai". The output row is 0.58·[10, 0] + 0.14·[0, 10] + 0.28·[5, 5] ≈ [7.18, 2.82].</p>
  <div class="fx" data-lang="py">Q = np.array([[1.0, 0.0], [0.0, 2.0], [1.0, 1.0]])     # 3 queries (decoder steps), d_k = 2
K = np.array([[2.0, 0.0], [0.0, 1.0], [1.0, 1.0]])     # 3 keys   (chai, not, good)
V = np.array([[10.0, 0.0], [0.0, 10.0], [5.0, 5.0]])   # 3 values (chai, not, good)
S = Q @ K.T                       # every query-key dot product at once
A = softmax(S / np.sqrt(2))       # scale by sqrt(d_k), softmax along each row
out = A @ V                       # one weighted sum of values per query
print("S =\n", S); print("A =\n", A.round(2)); print("out =\n", out.round(2))

def attention(Q, K, V, mask=None):
    S = Q @ K.swapaxes(-1, -2) / np.sqrt(Q.shape[-1])
    if mask is not None:
        S = np.where(mask, -np.inf, S)            # True = blocked (used in the masks section)
    A = softmax(S)
    return A @ V, A
print("function gives the same:", np.allclose(attention(Q, K, V)[0], out))</div>
  <div class="fx" data-lang="text">S =
 [[2. 0. 1.]
 [0. 2. 2.]
 [2. 1. 2.]]
A =
 [[0.58 0.14 0.28]
 [0.11 0.45 0.45]
 [0.4  0.2  0.4 ]]
out =
 [[7.18 2.82]
 [3.31 6.69]
 [6.02 3.98]]
function gives the same: True</div>
  <p>Row 1 of each matrix matches the hand steps. Row 2 is a nice check: the query [0, 2] scores "not" and "good" equally (2 and 2), so they get equal weights of 0.45, which is sensible for writing "achhi" (good), where the decoder needs both words to know the polarity. The function <code>attention</code> packs the formula into four lines and is reused for the rest of the page. <code>K.swapaxes(-1, -2)</code> is Kᵀ written so that it also works when there are extra batch or head dimensions in front, and the <code>mask</code> argument is explained in section 08.</p>
  <p>Now the √d<sub>k</sub>. Take row 1's raw scores [2, 0, 1] and imagine the same pattern came out 4 or 16 times larger, which is what happens with longer vectors. Softmax of large numbers puts almost all the weight on one item, and when softmax is nearly one-hot its gradient is nearly zero, so the model can no longer learn to shift its attention. Softmax is said to be <strong>saturated</strong>. Its gradient is the matrix diag(p) − ppᵀ, where p are the weights, and its largest entry measures how much a change in the scores can still move the weights:</p>
  <div class="fx" data-lang="py">row = np.array([2.0, 0.0, 1.0])                  # row 1 of the scores above
for k in (1, 4, 16):                             # the same pattern, k times bigger
    p = softmax(k * row)
    J = np.diag(p) - np.outer(p, p)              # gradient of softmax w.r.t. its inputs
    print(f"scores x{k:&lt;2d} weights {p.round(3)}  largest gradient entry {np.abs(J).max():.1e}")</div>
  <div class="fx" data-lang="text">scores x1  weights [0.665 0.09  0.245]  largest gradient entry 2.2e-01
scores x4  weights [0.982 0.    0.018]  largest gradient entry 1.8e-02
scores x16 weights [1. 0. 0.]  largest gradient entry 1.1e-07</div>
  <p>At the original size the weights are a blend (0.665, 0.090, 0.245) and the largest gradient entry is 0.22. At 16 times the size the weights are one-hot (1, 0, 0) and the gradient is about 10⁻⁷: whatever the loss says, this attention pattern can no longer change. So how large do scores get? A dot product adds up d<sub>k</sub> products. If the entries of q and k are random numbers with mean 0 and spread (standard deviation) 1, each product has spread 1, and the sum of d<sub>k</sub> independent such products has variance d<sub>k</sub>, that is, spread √d<sub>k</sub>. The experiment measures this with 2,000 random queries, each scored against 10 random keys:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
for d in (4, 64, 512):
    q = rng.normal(size=(2000, 1, d))            # 2000 random queries
    K = rng.normal(size=(2000, 10, d))           # each scored against 10 random keys
    s = (K @ q.transpose(0, 2, 1))[..., 0]       # (2000, 10) dot products
    raw, scaled = softmax(s).max(1).mean(), softmax(s / np.sqrt(d)).max(1).mean()
    print(f"d={d:3d}  std of q.k = {s.std():5.1f}   average top weight: raw {raw:.2f}  scaled {scaled:.2f}")</div>
  <div class="fx" data-lang="text">d=  4  std of q.k =   2.0   average top weight: raw 0.50  scaled 0.30
d= 64  std of q.k =   7.9   average top weight: raw 0.87  scaled 0.32
d=512  std of q.k =  22.5   average top weight: raw 0.95  scaled 0.32</div>
  <p>The measured spreads are 2.0, 7.9 and 22.5, which are √4, √64 and √512. Unscaled, the average top weight climbs to 0.95 at d = 512, almost one-hot. Dividing by √d brings the spread back to about 1, and the top weight stays near 0.32 whatever the width. That is the whole reason for the scale: it makes attention behave the same in a small model and a large one, so softmax stays in its useful, trainable range. Dividing by d<sub>k</sub> instead would over-shrink the scores and flatten attention towards a plain average. Note that d<sub>k</sub> is the width of one attention head (section 07), not the full model width. Bahdanau's additive score never needed this, because its tanh keeps scores bounded.</p>
  <p>PyTorch has the formula built in as <code>F.scaled_dot_product_attention</code>, and it reproduces our numbers:</p>
  <div class="fx" data-lang="py">t = lambda a: torch.tensor(a, dtype=torch.float32)
sdpa = F.scaled_dot_product_attention(t(Q), t(K), t(V))
print(sdpa.numpy().round(2))
print("matches our numpy version:", np.allclose(sdpa.numpy(), out, atol=1e-5))</div>
  <div class="fx" data-lang="text">[[7.18 2.82]
 [3.31 6.69]
 [6.02 3.98]]
matches our numpy version: True</div>
  <p>In real code, prefer this function over writing the softmax yourself: when it can, it switches to fused kernels such as FlashAttention, which compute the same result much faster and without ever storing the full score table in memory.</p>

  <h2 id="da2-self"><span class="num">06</span>Self-Attention and Cross-Attention</h2>
  <p>So far a decoder has been looking at an encoder. But there is a problem inside the review itself. Suppose each word starts with a fixed vector of its own. The vector for "good" is then the same in "chai not good" and in "chai very good", even though the meaning is opposite. An RNN fixes this by reading left to right, at the cost of the long chain of steps that caused vanishing gradients. Attention offers another way: let the words of one sentence attend to each other. In <strong>self-attention</strong>, every word produces a query, and the keys and values come from the words of the <em>same</em> sentence. Each word builds a new version of itself as a weighted blend of all the words around it, including itself. The decoder-to-encoder lookup of the previous sections is called <strong>cross-attention</strong>, because the queries come from one sequence and the keys and values from another.</p>
  <p>Think of a family WhatsApp group. A message such as "bring it tonight" only makes sense once you read the other messages in the same group ("it's Mummy's birthday", "I ordered the cake"). Self-attention is every message reading every other message in its own group. Cross-attention is reading a different group to answer a question in yours.</p>
  <p>A worked example with 2-number word vectors, where the first number stands for "praise" and the second for "negation": chai = [0.1, 0.1] (neutral), very = [1, 0], not = [0, 1], and good = [0.6, 0.6], which on its own is half and half and needs context. To keep it by hand we use the word vectors directly as Q, K and V, without learned matrices. For "good" in "chai very good" the scores are good·chai = 0.12, good·very = 0.6 and good·good = 0.72; softmax gives 0.23, 0.36, 0.41; and the new "good" is 0.23·[0.1, 0.1] + 0.36·[1, 0] + 0.41·[0.6, 0.6] = [0.63, 0.27], mostly praise. In "chai not good" the same arithmetic with not = [0, 1] gives [0.27, 0.63], mostly negation.</p>
  <div class="fx" data-lang="py">vec = {"chai": np.array([0.1, 0.1]),     # neutral
       "very": np.array([1.0, 0.0]),     # dimension 0 ~ "praise"
       "not":  np.array([0.0, 1.0]),     # dimension 1 ~ "negation"
       "good": np.array([0.6, 0.6])}     # on its own: half and half

def self_attend(words):
    X = np.stack([vec[w] for w in words])  # (3, 2): one row per word
    A = softmax(X @ X.T)                   # Q = K = V = X, no learned projections yet
    return A, A @ X

for sentence in (["chai", "very", "good"], ["chai", "not", "good"]):
    A, out = self_attend(sentence)
    print(" ".join(sentence).ljust(14), "| good attends", A[2].round(2), "| new good =", out[2].round(2))
print(A.round(2))                          # the full 3 x 3 table for "chai not good"</div>
  <div class="fx" data-lang="text">chai very good | good attends [0.23 0.36 0.41] | new good = [0.63 0.27]
chai not good  | good attends [0.23 0.36 0.41] | new good = [0.27 0.63]
[[0.31 0.34 0.35]
 [0.2  0.48 0.32]
 [0.23 0.36 0.41]]</div>
  <p>The same starting vector for "good" comes out as [0.63, 0.27] next to "very" and [0.27, 0.63] next to "not". This is the core idea of <strong>contextual embeddings</strong> in models such as BERT and GPT: a word's vector depends on the sentence it is in. <code>X @ X.T</code> computes every word-against-word score at once, a 3×3 table with one row per word, and the last print shows that full table for "chai not good"; <code>A @ X</code> then does every weighted sum at once. Nothing here is sequential: all three words are updated in parallel, and "good" reaches "not" in one step however far apart they are.</p>
  <p>Cross-attention uses the same formula with Q taken from one sequence and K and V from another. Here 4 decoder states for "chai achhi nahi hai" query 3 encoder states for "chai not good" (random numbers stand in for real states):</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
enc_out = rng.normal(size=(3, 4))     # encoder states for "chai not good", d = 4
dec = rng.normal(size=(4, 4))         # decoder states for "chai achhi nahi hai"
out, A = attention(dec, enc_out, enc_out)    # Q from the decoder; K and V from the encoder
print("weights", A.shape, " output", out.shape)</div>
  <div class="fx" data-lang="text">weights (4, 3)  output (4, 4)</div>
  <p>The weight table is 4×3: one row per Hindi position (query), one column per English word (key). The output has one row per query, so each Hindi position receives its own blend of the English states, exactly the "nahi reads not" lookup of section 02, done for all positions at once.</p>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600">
<defs><marker id="da2-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="140" y="20" text-anchor="middle">Self-attention</text>
<g text-anchor="middle">
<rect x="20" y="150" width="70" height="30" rx="5" class="fb sb"/><text x="55" y="170">chai</text>
<rect x="105" y="150" width="70" height="30" rx="5" class="fb sb"/><text x="140" y="170">not</text>
<rect x="190" y="150" width="70" height="30" rx="5" class="fb sb"/><text x="225" y="170">good</text>
</g>
<g fill="none" stroke="currentColor" stroke-opacity="0.6">
<path d="M225,150 C225,90 140,90 140,148" class="sg" stroke-width="3" stroke-opacity="1"/>
<path d="M225,150 C225,60 55,60 55,148"/>
<path d="M140,150 C140,110 55,110 55,148"/>
</g>
<text x="140" y="45" text-anchor="middle" class="tm">Q, K, V all from one sequence</text>
<text x="140" y="200" text-anchor="middle" class="tg">"good" attends to "not"</text>
<line x1="300" y1="15" x2="300" y2="200" stroke="currentColor" stroke-opacity="0.25"/>
<text x="460" y="20" text-anchor="middle">Cross-attention</text>
<g text-anchor="middle">
<rect x="330" y="60" width="100" height="90" rx="6" class="fb sb"/><text x="380" y="98">encoder</text><text x="380" y="114">chai not good</text>
<rect x="490" y="60" width="100" height="90" rx="6" class="ft st"/><text x="540" y="98">decoder</text><text x="540" y="114">… nahi</text>
<text x="380" y="175" class="tb">K, V</text><text x="540" y="175">Q</text>
</g>
<line x1="488" y1="105" x2="434" y2="105" stroke="currentColor" marker-end="url(#da2-ar1)"/>
<text x="460" y="96" text-anchor="middle" class="tm">ask</text>
<text x="460" y="200" text-anchor="middle" class="tm">each Hindi word queries the English words</text>
</svg><figcaption>Left: in self-attention the words of one sentence read each other; "good" draws most strongly on "not". Right: in cross-attention the decoder's queries read the encoder's keys and values.</figcaption></figure>
  <p>Self-attention has a price. Every word is scored against every other word, so for a sequence of n tokens the score table has n² entries, and both time and memory grow as O(n²). A plain RNN layer costs O(n·d²) and has to run step by step; a self-attention layer costs O(n²·d) but every position is computed in parallel, and any two tokens are connected in a single step instead of n − 1 steps. For sentences of normal length that trade is overwhelmingly worth it, which is why it won. For very long inputs the n² term dominates, which is what tricks such as FlashAttention (same compute, memory only O(n)) and sliding-window attention address.</p>

  <h2 id="da2-mh"><span class="num">07</span>Multi-Head Attention</h2>
  <p>With one attention, each word gets one set of weights, one opinion about which other words matter. But "good" needs to look at "not" to know its polarity and at "chai" to know what is being judged, and in longer text a word relates to others in several ways at once: grammar (which verb goes with this subject), reference (who "she" is), plain nearness. With one softmax, all of these must share a single set of weights that add to 1, so they get averaged into one blurry pattern. <strong>Multi-head attention</strong> runs several smaller attentions side by side, each called a <strong>head</strong>, each with its own learned Q, K and V projections, so each can learn its own pattern. Their outputs are joined back together and mixed by one more learned matrix, W<sub>O</sub>.</p>
  <p>It is like a panel of readers each highlighting the same paragraph for a different purpose: one marks grammar links, one marks who each pronoun refers to, one marks nearby words. Their notes are stapled together at the end. One reader asked to do all three jobs at once would mix them up.</p>
  <p>The heads do not make the model wider. The model width d<sub>model</sub> is split between them: with d<sub>model</sub> = 4 and 2 heads, each head works in 2 dimensions. The recipe has four steps. Project the input to Q, K and V, each of shape (tokens, d<sub>model</sub>). Split the columns into heads, giving shape (heads, tokens, d<sub>model</sub>/heads). Run scaled dot-product attention in each head separately, with d<sub>k</sub> = d<sub>model</sub>/heads. Then join (concatenate) the heads back to (tokens, d<sub>model</sub>) and multiply by W<sub>O</sub>. The code does these steps by hand for 3 tokens, using the weights of a PyTorch <code>nn.MultiheadAttention</code>, and checks the result against PyTorch:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
d_model, n_heads, n = 4, 2, 3                       # 3 tokens: chai, not, good
d_head = d_model // n_heads
mha = nn.MultiheadAttention(d_model, n_heads, batch_first=True)
x = torch.randn(1, n, d_model)                      # stand-ins for the 3 token vectors
ref, _ = mha(x, x, x)                               # PyTorch's answer (self-attention)

X = x[0].numpy()                                    # now by hand, with PyTorch's weights
W, bias = mha.in_proj_weight.detach().numpy(), mha.in_proj_bias.detach().numpy()
Q, K, V = (X @ W[i*4:(i+1)*4].T + bias[i*4:(i+1)*4] for i in range(3))   # project: each (3, 4)
split = lambda M: M.reshape(n, n_heads, d_head).transpose(1, 0, 2)       # (heads, 3, 2)
heads, A = attention(split(Q), split(K), split(V))                       # attend per head
concat = heads.transpose(1, 0, 2).reshape(n, d_model)                    # back to (3, 4)
out = concat @ mha.out_proj.weight.detach().numpy().T + mha.out_proj.bias.detach().numpy()

print("Q", Q.shape, "-&gt; split", split(Q).shape, "-&gt; heads", heads.shape, "-&gt; concat", concat.shape)
print("how 'good' attends, head 1:", A[0, 2].round(2), " head 2:", A[1, 2].round(2))
print("matches nn.MultiheadAttention:", np.allclose(out, ref[0].detach().numpy(), atol=1e-6))</div>
  <div class="fx" data-lang="text">Q (3, 4) -&gt; split (2, 3, 2) -&gt; heads (2, 3, 2) -&gt; concat (3, 4)
how 'good' attends, head 1: [0.27 0.36 0.37]  head 2: [0.36 0.4  0.24]
matches nn.MultiheadAttention: True</div>
  <p>The shapes trace the recipe: Q is (3, 4), the split makes it (2, 3, 2), the two heads produce (2, 3, 2), and joining gives (3, 4) again. The two heads give "good" quite different weights over the three tokens, even on these random stand-in vectors, because each has its own projections; in a trained model one head might specialise in negation and another in the noun being described. Our hand-built version matches PyTorch exactly, so multi-head attention really is just "project, split, attend, concatenate, project". PyTorch stores W<sub>Q</sub>, W<sub>K</sub> and W<sub>V</sub> stacked in one matrix, <code>in_proj_weight</code> of shape (12, 4), which is why the code slices it into three. The <code>attention</code> function from section 05 worked unchanged on the extra head axis.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
<defs><marker id="da2-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<g text-anchor="middle">
<rect x="15" y="70" width="80" height="40" rx="6" class="fs" stroke="currentColor"/><text x="55" y="88">X</text><text x="55" y="103" class="tm">n×64</text>
<rect x="160" y="15" width="150" height="34" rx="5" class="fb sb"/><text x="235" y="37">head 1 (d=8)</text>
<rect x="160" y="58" width="150" height="34" rx="5" class="ft st"/><text x="235" y="80">head 2 (d=8)</text>
<text x="235" y="115">⋮</text>
<rect x="160" y="132" width="150" height="34" rx="5" class="fv" stroke="currentColor"/><text x="235" y="154">head 8 (d=8)</text>
<rect x="370" y="70" width="90" height="40" rx="6" class="fs" stroke="currentColor"/><text x="415" y="88">concat</text><text x="415" y="103" class="tm">n×64</text>
<rect x="505" y="70" width="80" height="40" rx="6" class="fg sg"/><text x="545" y="95">· W_O</text>
</g>
<g stroke="currentColor" fill="none" marker-end="url(#da2-ar2)">
<path d="M95,90 L158,32"/><path d="M95,90 L158,75"/><path d="M95,90 L158,149"/>
<path d="M310,32 L368,85"/><path d="M310,75 L368,88"/><path d="M310,149 L368,95"/>
<line x1="460" y1="90" x2="503" y2="90"/>
</g>
<text x="300" y="185" text-anchor="middle" class="tm">each head has its own slice of W_Q, W_K, W_V, so its own attention pattern</text>
</svg><figcaption>With d<sub>model</sub> = 64 and 8 heads, each head attends in 8 dimensions. The 8 results are concatenated back to 64 numbers per token and mixed by W<sub>O</sub>.</figcaption></figure>
  <p>Does splitting into heads cost extra parameters? Compare 8 heads with 1 head at d<sub>model</sub> = 64, and try a head count that does not divide 64:</p>
  <div class="fx" data-lang="py">count = lambda m: sum(p.numel() for p in m.parameters())
eight = nn.MultiheadAttention(64, num_heads=8, batch_first=True)
one = nn.MultiheadAttention(64, num_heads=1, batch_first=True)
print("8 heads:", count(eight), " 1 head:", count(one))
try:
    nn.MultiheadAttention(64, num_heads=6)
except AssertionError as e:
    print("AssertionError:", e)</div>
  <div class="fx" data-lang="text">8 heads: 16640  1 head: 16640
AssertionError: embed_dim must be divisible by num_heads</div>
  <p>Both layers have 16,640 parameters: four 64×64 matrices (W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>, W<sub>O</sub>) plus four bias vectors of 64. Heads divide the existing width into subspaces rather than adding width, so the cost is about the same as one big head. That also means d<sub>model</sub> must divide evenly by the number of heads: 64/8 works, 64/6 is refused. More heads is not automatically better either; each head gets narrower, and studies that prune trained models find many heads can be removed with little loss.</p>

  <h2 id="da2-mask"><span class="num">08</span>Masks</h2>
  <p>Self-attention lets every word see every other word, and two situations need to forbid some of those links. The first is a text generator such as GPT. It is trained to predict the next word at every position of a sentence in parallel: from "chai" predict "not", from "chai not" predict "good". If position 2 could attend to position 3, it would simply read the answer. The second is padding: as in the RNN note, short sequences in a batch are filled out with pad tokens, and real words should not attend to filler. The tool for both is a <strong>mask</strong>: before the softmax, set every forbidden score to −∞. Since e<sup>−∞</sup> = 0, those positions get a weight of exactly 0, and softmax spreads the full 1 over the allowed positions.</p>
  <p>A cricket commentator can talk about every ball already bowled but never about the next one; a <strong>causal mask</strong> (also called a look-ahead mask) enforces exactly that, by blocking every key that comes after the query. A <strong>padding mask</strong> is like ignoring the blank overs at the end of a rain-shortened scorecard: it blocks keys that are pads.</p>
  <p>Take the self-attention scores for "chai not good" from section 06 (the dot products of the word vectors): chai·chai = 0.02, chai·not = 0.1, chai·good = 0.12, not·not = 1, not·good = 0.6, good·good = 0.72. The causal mask blocks everything above the diagonal. Row 1, "chai", may see only itself, so its weights are [1, 0, 0]. Row 2, "not", may see chai and not: e<sup>0.1</sup> = 1.105 and e<sup>1</sup> = 2.718, total 3.823, so its weights are [0.289, 0.711, 0]. Row 3, "good", sees all three words and is unchanged.</p>
  <div class="fx" data-lang="py">X = np.stack([vec[w] for w in ["chai", "not", "good"]])
S = X @ X.T                                          # self-attention scores (3 x 3)
causal = np.triu(np.ones((3, 3), dtype=bool), k=1)   # True above the diagonal = the future
print(causal.astype(int))
A = softmax(np.where(causal, -np.inf, S))            # mask BEFORE softmax
print(A.round(3), " row sums", A.sum(1))
wrong = softmax(S) * ~causal                         # zeroing AFTER softmax
print("masked after softmax, row sums:", wrong.sum(1).round(3))</div>
  <div class="fx" data-lang="text">[[0 1 1]
 [0 0 1]
 [0 0 0]]
[[1.    0.    0.   ]
 [0.289 0.711 0.   ]
 [0.225 0.364 0.411]]  row sums [1. 1. 1.]
masked after softmax, row sums: [0.314 0.677 1.   ]</div>
  <p><code>np.triu(..., k=1)</code> marks the strict upper triangle, the future. <code>np.where(causal, -np.inf, S)</code> replaces those scores before the softmax. Row 2 is our hand result, and every row still sums to 1. The last line shows a classic bug: if you compute the softmax first and zero the future weights afterwards, rows 1 and 2 sum to only 0.31 and 0.68, so the outputs of early positions shrink in a way that depends on position. Masking must happen before the softmax.</p>
  <p>In PyTorch, <code>nn.MultiheadAttention</code> takes the causal mask as <code>attn_mask</code> and the padding mask as <code>key_padding_mask</code>, and in both a value of True means "blocked":</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
mha = nn.MultiheadAttention(64, num_heads=8, batch_first=True)
x = torch.randn(2, 5, 64)                                     # 2 sequences of 5 tokens
causal = torch.triu(torch.ones(5, 5, dtype=torch.bool), 1)    # True = not allowed
_, w = mha(x, x, x, attn_mask=causal)
print(w[0].detach().numpy().round(2))                         # weights averaged over heads

pad = torch.tensor([[False, False, False, True, True],        # sequence 1: last 2 are padding
                    [False, False, False, False, False]])
_, w = mha(x, x, x, key_padding_mask=pad)
print("query 1 of sequence 1:", w[0, 0].detach().numpy().round(2))</div>
  <div class="fx" data-lang="text">[[1.   0.   0.   0.   0.  ]
 [0.43 0.57 0.   0.   0.  ]
 [0.32 0.35 0.33 0.   0.  ]
 [0.26 0.29 0.28 0.18 0.  ]
 [0.24 0.18 0.2  0.2  0.18]]
query 1 of sequence 1: [0.35 0.35 0.3  0.   0.  ]</div>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600">
<g text-anchor="middle" class="tm"><text x="185" y="30">k1</text><text x="235" y="30">k2</text><text x="285" y="30">k3</text><text x="335" y="30">k4</text><text x="385" y="30">k5</text>
<text x="145" y="64">q1</text><text x="145" y="104">q2</text><text x="145" y="144">q3</text><text x="145" y="184">q4</text><text x="145" y="224">q5</text></g>
<g stroke="currentColor" stroke-opacity="0.3">
<rect x="160" y="40" width="50" height="40" class="fb"/><rect x="210" y="40" width="50" height="40" class="fr"/><rect x="260" y="40" width="50" height="40" class="fr"/><rect x="310" y="40" width="50" height="40" class="fr"/><rect x="360" y="40" width="50" height="40" class="fr"/>
<rect x="160" y="80" width="50" height="40" class="fb"/><rect x="210" y="80" width="50" height="40" class="fb"/><rect x="260" y="80" width="50" height="40" class="fr"/><rect x="310" y="80" width="50" height="40" class="fr"/><rect x="360" y="80" width="50" height="40" class="fr"/>
<rect x="160" y="120" width="50" height="40" class="fb"/><rect x="210" y="120" width="50" height="40" class="fb"/><rect x="260" y="120" width="50" height="40" class="fb"/><rect x="310" y="120" width="50" height="40" class="fr"/><rect x="360" y="120" width="50" height="40" class="fr"/>
<rect x="160" y="160" width="50" height="40" class="fb"/><rect x="210" y="160" width="50" height="40" class="fb"/><rect x="260" y="160" width="50" height="40" class="fb"/><rect x="310" y="160" width="50" height="40" class="fb"/><rect x="360" y="160" width="50" height="40" class="fr"/>
<rect x="160" y="200" width="50" height="40" class="fb"/><rect x="210" y="200" width="50" height="40" class="fb"/><rect x="260" y="200" width="50" height="40" class="fb"/><rect x="310" y="200" width="50" height="40" class="fb"/><rect x="360" y="200" width="50" height="40" class="fb"/>
</g>
<g text-anchor="middle">
<text x="185" y="65">1.00</text><text x="235" y="65" class="tm">0</text><text x="285" y="65" class="tm">0</text><text x="335" y="65" class="tm">0</text><text x="385" y="65" class="tm">0</text>
<text x="185" y="105">.43</text><text x="235" y="105">.57</text><text x="285" y="105" class="tm">0</text><text x="335" y="105" class="tm">0</text><text x="385" y="105" class="tm">0</text>
<text x="185" y="145">.32</text><text x="235" y="145">.35</text><text x="285" y="145">.33</text><text x="335" y="145" class="tm">0</text><text x="385" y="145" class="tm">0</text>
<text x="185" y="185">.26</text><text x="235" y="185">.29</text><text x="285" y="185">.28</text><text x="335" y="185">.18</text><text x="385" y="185" class="tm">0</text>
<text x="185" y="225">.24</text><text x="235" y="225">.18</text><text x="285" y="225">.20</text><text x="335" y="225">.20</text><text x="385" y="225">.18</text>
</g>
<rect x="440" y="80" width="18" height="18" class="fb" stroke="currentColor" stroke-opacity="0.3"/><text x="466" y="94">allowed (past)</text>
<rect x="440" y="110" width="18" height="18" class="fr" stroke="currentColor" stroke-opacity="0.3"/><text x="466" y="124">−∞ → weight 0</text>
<text x="440" y="160" class="tm">each row still</text><text x="440" y="176" class="tm">sums to 1</text>
</svg><figcaption>The causal attention matrix from the run above. Row t is query t; it can only use keys 1 to t (blue), and every key in the future (red) gets weight 0.</figcaption></figure>
  <p>The printed matrix, drawn above, has the lower-triangular shape of every causal attention matrix: query 1 can only attend to itself, query 2 splits its weight between keys 1 and 2, and only the last query sees the whole sequence. With the padding mask, the last two keys of sequence 1 are pads, so query 1 spreads its weight over keys 1 to 3 only (0.35, 0.35, 0.30) and the pads get exactly 0. In the formula a mask is simply an extra term M added to the scores, softmax(QKᵀ/√d<sub>k</sub> + M), with M<sub>ij</sub> = 0 where key j is allowed for query i and −∞ where it is blocked; for the causal mask, M<sub>ij</sub> = −∞ whenever j &gt; i. Encoders such as BERT, which see the whole input, use only padding masks; decoders such as GPT use both.</p>

  <h2 id="da2-pos"><span class="num">09</span>Word Order and the Step to Transformers</h2>
  <p>The RNN knew word order for free, because it read the words one after another. Attention compares every word with every other word in one shot, and nothing in softmax(QKᵀ/√d)V mentions positions. So does it notice order at all? Run self-attention on "chai not good" and on the shuffled "good not chai":</p>
  <div class="fx" data-lang="py">_, out1 = self_attend(["chai", "not", "good"])
_, out2 = self_attend(["good", "not", "chai"])
print("chai not good -&gt;", out1.round(3).tolist())
print("good not chai -&gt;", out2.round(3).tolist())
print("same rows, just reordered:", np.allclose(out1[[2, 1, 0]], out2))

pos = np.array([[0.0, 0.3], [0.3, 0.0], [0.2, 0.2]])   # one extra vector per POSITION (1st, 2nd, 3rd)
def self_attend_pos(words):
    X = np.stack([vec[w] for w in words]) + pos          # word vector + position vector
    return softmax(X @ X.T) @ X
o1, o2 = self_attend_pos(["chai", "not", "good"]), self_attend_pos(["good", "not", "chai"])
print("with positions, still just reordered:", np.allclose(o1[[2, 1, 0]], o2))</div>
  <div class="fx" data-lang="text">chai not good -&gt; [[0.239, 0.579], [0.213, 0.695], [0.269, 0.633]]
good not chai -&gt; [[0.269, 0.633], [0.213, 0.695], [0.239, 0.579]]
same rows, just reordered: True
with positions, still just reordered: False</div>
  <p>Without positions, each word gets exactly the same new vector in both orders; only the rows come out in a different order. In other words, attention on its own reads a sentence as a bag of words, the very problem the RNN note started with. Mathematicians call this <strong>permutation equivariance</strong>: shuffling the input just shuffles the output in the same way. The fix is to add a "where am I" vector to each word vector before attention, a different vector for each position, so that the same word at position 1 and at position 3 looks different. This is called <strong>positional encoding</strong>. The last lines of the code add a small made-up vector per position, and the outputs are no longer a reshuffle of each other: order now changes the computation, and training can learn to use it. Think of it as the seat numbers on a train ticket: the passengers are the same people, but now everyone knows where each one sits. Real models use fixed sine and cosine waves of different speeds, learned position vectors, or rotations of Q and K (RoPE); the <a class="xref" data-note="transformers">Transformers</a> note covers them.</p>
  <p>We now have every ingredient, and the last step is the one taken by the 2017 paper "Attention Is All You Need": drop the RNN completely. An RNN with attention still reads one word at a time, so training cannot use the GPU's parallelism. A <strong>Transformer</strong> instead stacks identical layers, each made of multi-head self-attention (tokens exchange information) followed by a small feed-forward network applied to each token separately (each token processes what it gathered), with a residual connection and layer normalisation around each part. Positional encodings are added once at the input. The original translation model has an encoder stack (self-attention with padding masks) and a decoder stack (causal self-attention plus cross-attention to the encoder); BERT keeps only the encoder, and GPT and most modern language models keep only the decoder. Every section of this page is one part of that block: the soft lookup with the √d scale is the attention formula, self- and cross-attention are its two uses, heads run several in parallel, masks make the decoder causal and ignore padding, and positions replace the order the RNN used to provide. The residuals, layer normalisation, feed-forward network and the full architecture are the subject of <a class="xref" data-note="transformers">Transformers</a>.</p>

  <h2 id="da2-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>Attention code almost never crashes when it is wrong, because softmax always returns numbers that sum to 1. The most common silent bug is taking the softmax over the wrong axis. The weights must sum to 1 over the <em>keys</em>, which is the last axis of QKᵀ. A softmax over the queries or over the feature dimension still runs and still produces valid-looking numbers, just meaningless ones. The cheapest test is to check that <code>A.sum(-1)</code> is all ones on a small input where you know which key should win.</p>
  <p>The second family of bugs is about masks. Masking after the softmax was shown in section 08. Mixing up the boolean conventions is just as easy: <code>nn.MultiheadAttention</code> treats True as "blocked", while <code>F.scaled_dot_product_attention</code> treats True as "allowed". Passing the same tensor to both gives opposite results:</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
q = k = v = torch.randn(1, 1, 3, 4)                     # (batch, heads, seq, d_head)
blocked = torch.triu(torch.ones(3, 3, dtype=torch.bool), 1)   # nn.MultiheadAttention style: True = blocked
right = F.scaled_dot_product_attention(q, k, v, attn_mask=~blocked)  # SDPA wants True = allowed
causal = F.scaled_dot_product_attention(q, k, v, is_causal=True)
wrong = F.scaled_dot_product_attention(q, k, v, attn_mask=blocked)   # convention mixed up
print("inverted mask == is_causal:", torch.allclose(right, causal))
print("mixed-up mask, first value of each row:", wrong[0, 0, :, 0])</div>
  <div class="fx" data-lang="text">inverted mask == is_causal: True
mixed-up mask, first value of each row: tensor([-0.8148, -0.7193,  0.0000])</div>
  <p>Inverting the mask for SDPA reproduces the built-in <code>is_causal=True</code>. Passing the "blocked" mask unchanged makes every query attend <em>only</em> to the future, and the last query, which has no future, is left with no allowed key at all, which this version of PyTorch turns into zeros. That leads to the related bug of a fully masked row, for example an example that is entirely padding. A hand-written softmax then computes 0/0:</p>
  <div class="fx" data-lang="py">S = np.array([[0.5, 1.0, 0.2],
              [0.3, 0.1, 0.9]])
mask = np.array([[False, False, True],      # row 1: one key blocked
                 [True,  True,  True]])     # row 2: every key blocked (an all-padding row)
print(softmax(np.where(mask, -np.inf, S)).round(3))</div>
  <div class="fx" data-lang="text">[[0.378 0.622 0.   ]
 [  nan   nan   nan]]</div>
  <p>The first row is fine, but the second, where every key is blocked, is all NaN, and a NaN spreads through every later calculation in the batch. Make sure every query has at least one allowed key, or handle such rows explicitly.</p>
  <p>A few more mistakes come up often. Forgetting the scale, or dividing by d<sub>k</sub> instead of √d<sub>k</sub>, or using the full model width instead of the per-head width: the first saturates softmax, the other two flatten it. Forgetting positional information, so a model that should care about order cannot see it. Shape mix-ups: <code>nn.MultiheadAttention</code> expects (seq, batch, d) unless <code>batch_first=True</code>, while <code>F.scaled_dot_product_attention</code> expects (batch, heads, seq, d<sub>head</sub>), and most shape bugs are a missing transpose between the two. Finally, reading attention maps as explanations: a high weight means "this value was mixed in", not "this caused the prediction", because other heads, residual connections and later layers all change the picture.</p>

  <h2 id="da2-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Bottleneck</b> (seq2seq): the whole input squeezed into one fixed-size vector.</li>
    <li><b>Attention</b>: a weighted average of values, with weights from how well a query matches each key.</li>
    <li><b>Query / key / value</b>: what I look for / what I'm found by / what I hand over. Q = XW<sub>Q</sub>, K = XW<sub>K</sub>, V = XW<sub>V</sub>.</li>
    <li><b>Context vector</b>: the attention output for one query.</li>
    <li><b>Additive</b> (Bahdanau) vs <b>multiplicative</b> (Luong dot / general) scores.</li>
    <li><b>Self-attention</b>: Q, K, V from the same sequence. <b>Cross-attention</b>: Q from the decoder, K and V from the encoder.</li>
    <li><b>Multi-head</b>: h attentions of width d<sub>model</sub>/h in parallel, concatenated, times W<sub>O</sub>.</li>
    <li><b>Causal mask</b>: −∞ for keys after the query. <b>Padding mask</b>: −∞ for pad keys.</li>
    <li><b>Permutation equivariance</b>: attention without positions ignores order; positional encoding fixes it.</li>
  </ul>
  <h3>Formulas and shapes</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>One query</td><td>e<sub>j</sub> = score(q, k<sub>j</sub>); α = softmax(e); c = Σ<sub>j</sub> α<sub>j</sub>v<sub>j</sub></td></tr>
    <tr><td>Scores</td><td>dot qᵀk · general qᵀWk · additive vᵀtanh(W₁q + W₂k)</td></tr>
    <tr><td>Scaled dot-product</td><td>softmax(QKᵀ/√d<sub>k</sub> + M)·V; Q n×d<sub>k</sub>, K m×d<sub>k</sub>, V m×d<sub>v</sub> → scores n×m → output n×d<sub>v</sub></td></tr>
    <tr><td>Why √d<sub>k</sub></td><td>Var(q·k) = d<sub>k</sub> for unit-variance entries; dividing by √d<sub>k</sub> brings the spread back to 1</td></tr>
    <tr><td>Multi-head</td><td>Concat(head<sub>1</sub>, …, head<sub>h</sub>)·W<sub>O</sub>; parameters 4d² + 4d whatever h</td></tr>
    <tr><td>Causal mask</td><td>M<sub>ij</sub> = −∞ if j &gt; i, else 0</td></tr>
    <tr><td>Cost</td><td>O(n²·d) time, O(n²) memory for the score table</td></tr>
  </table>
  <h3>Comparisons</h3>
  <table class="tbl">
    <tr><th></th><th>RNN</th><th>RNN + attention</th><th>Self-attention</th></tr>
    <tr><td>Path between token 1 and token n</td><td>n − 1 steps</td><td>1 step (decoder to encoder)</td><td>1 step</td></tr>
    <tr><td>Training over positions</td><td>sequential</td><td>sequential</td><td>parallel</td></tr>
    <tr><td>Knows order by itself</td><td>yes</td><td>yes (RNN)</td><td>no, needs positions</td></tr>
    <tr><td>Cost per layer</td><td>O(n·d²)</td><td>O(n·d²) + O(n·m·d)</td><td>O(n²·d)</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">def attention(Q, K, V, mask=None):                       # numpy, mask True = blocked
    S = Q @ K.swapaxes(-1, -2) / np.sqrt(Q.shape[-1])
    if mask is not None:
        S = np.where(mask, -np.inf, S)                       # BEFORE softmax
    A = softmax(S)                                           # over the last axis (keys)
    return A @ V, A

out = F.scaled_dot_product_attention(q, k, v, is_causal=True)   # (batch, heads, seq, d_head)
mha = nn.MultiheadAttention(d_model, num_heads, batch_first=True)
out, w = mha(x, x, x, attn_mask=causal, key_padding_mask=pad)   # True = blocked
causal = torch.triu(torch.ones(n, n, dtype=torch.bool), 1)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Softmax over the keys axis (last axis of QKᵀ); check rows sum to 1.</li>
    <li>Scale by √d<sub>k</sub> of one head, not d<sub>k</sub> and not d<sub>model</sub>.</li>
    <li>Mask before softmax; a fully masked row gives NaN in a hand-written softmax.</li>
    <li>True means blocked in <code>nn.MultiheadAttention</code>, allowed in <code>F.scaled_dot_product_attention</code>.</li>
    <li>d<sub>model</sub> must be divisible by the number of heads.</li>
    <li>No positional encoding means no word order.</li>
    <li>Attention weights are not explanations.</li>
  </ul>

  <h2 id="da2-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problem did attention originally solve?</summary><div class="qa-body">The seq2seq bottleneck: the encoder had to compress the whole input into one fixed-size vector, so long inputs lost information. Attention keeps every encoder state and, at each decoder step, builds a fresh weighted average of them. In our toy reversal task accuracy at length 20 went from 0.53 to 0.91.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe the three steps of attention.</summary><div class="qa-body">Score the query against every key (for example with a dot product), turn the scores into weights with softmax so they are positive and sum to 1, and output the weighted sum of the values. With scores [0, 2, 0.6] the weights are [0.098, 0.724, 0.178].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>By hand: scores [0, 0, ln 2], values [10, 20, 30]. What is the output?</summary><div class="qa-body">e<sup>0</sup> = 1, 1 and e<sup>ln 2</sup> = 2, total 4, so the weights are [0.25, 0.25, 0.5]. The output is 0.25·10 + 0.25·20 + 0.5·30 = 22.5. Attention's output is always a weighted average of the values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain query, key and value. Why separate keys from values?</summary><div class="qa-body">The query is what the current position is looking for, a key is what an item is matched on, and a value is what the item contributes when matched. Keeping them separate lets an item be easy to find by one feature while handing over different, richer content; with keys equal to values, one vector must do both jobs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why softmax and not just the highest-scoring item?</summary><div class="qa-body">Picking the maximum is a hard, non-differentiable choice, so the network could not learn which item to pick. Softmax is smooth, so small score changes give small weight changes and gradients flow. It also makes the weights positive and sum to 1, so the output is an average whose size does not depend on the number of inputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bahdanau vs Luong attention?</summary><div class="qa-body">Bahdanau uses an additive score vᵀtanh(W₁s<sub>t−1</sub> + W₂h<sub>j</sub>) computed from the previous decoder state, and feeds the context into the decoder RNN step. Luong uses multiplicative scores (dot sᵀh or general sᵀWh) from the current decoder state and combines the context after the step. The dot product is a single matrix multiply, so it is much faster.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we divide by √d<sub>k</sub> in scaled dot-product attention?</summary><div class="qa-body">If query and key entries have mean 0 and variance 1, their dot product has variance d<sub>k</sub>, so scores grow with width. Large scores push softmax towards one-hot, where its gradient is nearly zero and attention stops learning. Dividing by √d<sub>k</sub> restores unit variance; in our test the average top weight at d = 512 was 0.95 unscaled and 0.32 scaled.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why √d<sub>k</sub> and not d<sub>k</sub>? And why didn't additive attention need it?</summary><div class="qa-body">The standard deviation of the dot product grows as √d<sub>k</sub>, so that is the factor that restores a spread of 1; dividing by d<sub>k</sub> over-shrinks the scores and flattens attention toward a uniform average. Additive scores pass through tanh, so they stay bounded whatever the width.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Q is (2, 10, 64) and K, V are (2, 7, 64). What are the shapes of the scores and the output?</summary><div class="qa-body">Scores QKᵀ are (2, 10, 7): for each of 2 examples, 10 queries by 7 keys. The output is (2, 10, 64), one vector per query. This is typical of cross-attention with a target of length 10 and a source of length 7.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Self-attention vs cross-attention?</summary><div class="qa-body">In self-attention Q, K and V are all projections of the same sequence, so its tokens attend to each other. In cross-attention Q comes from one sequence (the decoder) and K and V from another (the encoder output), so the target reads the source. Cross-attention is the Transformer's version of Bahdanau and Luong attention.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use multiple heads? Does it add parameters?</summary><div class="qa-body">One head gives each token a single set of weights, which must average every kind of relationship. Several heads with their own projections can each specialise, for example one on negation and one on the noun being described. The model width is split between the heads, so the parameter count is the same as one head of full width (16,640 for both 1 and 8 heads at d<sub>model</sub> = 64).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a causal mask work, and why mask before softmax?</summary><div class="qa-body">Scores for keys after the query position are set to −∞ before the softmax; e<sup>−∞</sup> = 0, so the future gets zero weight and each row still sums to 1. Zeroing weights after the softmax leaves rows that no longer sum to 1 (0.31 and 0.68 in our example), so early positions get shrunken outputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a padding mask and what happens if a row is fully masked?</summary><div class="qa-body">A padding mask sets the scores of pad keys to −∞ so real tokens ignore filler. If every key of a row is masked, a plain softmax computes 0/0 and returns NaN, which then spreads through the batch; each query needs at least one allowed key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does attention need positional encoding when an RNN did not?</summary><div class="qa-body">An RNN reads tokens in sequence, so order is built into its computation. Self-attention compares all pairs at once and is permutation-equivariant: shuffling the input just shuffles the output, so it sees a bag of words. Adding a different position vector to each token (or rotating Q and K by position) makes order visible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time and memory complexity of self-attention, and how is it reduced?</summary><div class="qa-body">O(n²·d) time and O(n²) memory for the n×n score table. FlashAttention keeps the compute but cuts memory to O(n) by working in tiles and never storing the full table; sliding-window and sparse attention reduce the compute itself; during generation a KV cache avoids recomputing past keys and values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did attention-only models (Transformers) replace RNNs?</summary><div class="qa-body">Any two tokens are connected in one step, so there is no gradient decay through a long chain, and all positions are processed in parallel during training, which suits GPUs and scales with data. The costs are O(n²) work in sequence length and, at generation time, a KV cache that grows with the context.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What goes wrong if a GPT-style model is trained without the causal mask?</summary><div class="qa-body">Each position can see the next token during training, so the model learns to copy it and the training loss looks excellent. At generation time the future does not exist, the shortcut disappears, and the model produces nonsense: a train/serve mismatch, like using a bidirectional RNN for live forecasting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you read an attention map as an explanation of the prediction?</summary><div class="qa-body">Only as a hint. A high weight means that value was mixed into this position's output, not that it caused the final prediction: other heads, residual connections and later layers all transform the result. Studies have shown attention weights can be changed substantially without changing the output.</div></details>
</main>
`
});
