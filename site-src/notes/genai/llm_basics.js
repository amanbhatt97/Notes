// notes/genai/llm_basics.js — How LLMs Work
Object.assign(TOPIC_CONTENT, {
  "llm_basics": `<main>
  <h1>How LLMs Work</h1>
  <p class="lead">From <a class="xref" data-note="transformers">Transformers</a> you know the transformer decoder: tokens go in, one vector per position comes out. This note turns that into a working large language model (LLM): how it is trained, how it picks each next word, why it sometimes makes things up, and why it costs what it costs. Everything in <a class="xref" data-note="prompting">Prompt Engineering</a> and <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a> builds on these mechanics.</p>

  <h2 id="lb-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
  <div class="mm-center">How LLMs Work</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Pre-training</div>
      <ul>
        <li><b>Objective</b> — predict the next token on trillions of tokens</li>
        <li><b>Self-supervised</b> — the text is its own answer key; no human labels</li>
        <li><b>Loss</b> — cross-entropy = −log p(true token); perplexity = e<sup>avg loss</sup> ("choosing between ~N words")</li>
        <li><b>N tokens → N examples</b> in one pass (causal mask)</li>
        <li><b>Knowledge</b> — side effect of getting good at prediction</li>
        <li>⚠ <b>Base model ≠ chatbot</b> — continues text, may answer with more questions</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Scaling laws</div>
      <ul>
        <li><b>Power law</b> — loss falls smoothly with params N, data D, compute C ≈ 6·N·D</li>
        <li><b>Kaplan 2020</b> — every 10× params → loss × ~0.84</li>
        <li><b>Chinchilla 2022</b> — ~20 tokens/param: 70B → 1.4T tokens</li>
        <li><b>Practice</b> — over-train small models (8B on 15T): similar compute, far cheaper to serve</li>
        <li>⚠ <b>Predicts loss, not skills</b>; "emergence" partly a metric artefact</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Three training stages</div>
      <ul>
        <li><b>1 Pre-train</b> → base model (knows a lot, follows nothing)</li>
        <li><b>2 SFT</b> — (instruction → answer) pairs → instruct model</li>
        <li><b>3 Preference</b> — RLHF / DPO on (chosen, rejected) → helpful, safe, on-tone</li>
        <li><b>Chat template</b> — roles become special tokens; the model still sees one string</li>
        <li><b>Post-training</b> = stages 2 + 3 (details: <a class="xref" data-note="finetuning">Fine-Tuning</a>)</li>
        <li>💡 new hire: reads the library → job training → feedback on taste</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Inference &amp; sampling</div>
      <ul>
        <li><b>Loop</b> — logits → softmax → pick → append → repeat (autoregressive)</li>
        <li><b>Greedy</b> (T = 0) — argmax; repeatable, dull, loops</li>
        <li><b>Temperature</b> — logits ÷ T; &lt;1 sharpens, &gt;1 flattens; ranking unchanged</li>
        <li><b>Top-k</b> — keep k tokens (fixed); <b>top-p</b> — smallest set ≥ p (adaptive)</li>
        <li><b>Prefill</b> parallel → TTFT; <b>decode</b> one pass per token → tokens/sec</li>
        <li>⚠ <b>T = 0 not deterministic</b> (GPU float order); current Claude models reject temperature/top_p/top_k → use <code>effort</code></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Context &amp; KV cache</div>
      <ul>
        <li><b>Context window</b> — max prompt + output tokens per call (~128K–1M)</li>
        <li><b>No hidden memory</b> — outside the window = doesn't exist</li>
        <li>⚠ <b>Lost in the middle</b> — buried facts get missed</li>
        <li><b>KV cache</b> — store past K, V; compute only the new token (1,000 tokens: 500,500 → 1,000 K/V computations)</li>
        <li><b>Memory</b> — 2 × layers × KV heads × head dim × bytes: 128 KiB/token, 1 GiB per 8K seq</li>
        <li><b>Fixes</b> — grouped-query attention, cache quantization</li>
        <li>⚠ <b>≠ prompt caching</b> (API-level, across calls)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Hallucinations</div>
      <ul>
        <li><b>Definition</b> — fluent, confident, false or unsupported</li>
        <li><b>Causes</b> — plausibility objective, blurry rare facts, cutoff, rewarded guessing, unlucky sample</li>
        <li><b>Blurry knowledge</b> — flat distribution still produces a confident-sounding name</li>
        <li><b>Fixes</b> — ground (RAG), tools, allow "unknown", check/cite (evals)</li>
        <li>💡 student bluffing in a viva</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Tokens = cost &amp; latency</div>
      <ul>
        <li><b>Token</b> ≈ 4 chars / ¾ word in English; code, numbers, Hindi cost more</li>
        <li><b>Output ≈ 5× input</b> price (sequential passes)</li>
        <li><b>Latency</b> ≈ TTFT + output tokens ÷ tokens/sec</li>
        <li><b>Example</b> — 2,000 in + 500 out: opus-5-5 $0.018, sonnet-5-5 $0.009, haiku-5-5 $0.00045</li>
        <li><b>Thinking tokens</b> billed as output</li>
        <li>⚠ <b>Count with the tokenizer</b>, not words</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Open vs closed</div>
      <ul>
        <li><b>Closed API</b> — Claude, GPT, Gemini: frontier, pay per token, zero infra</li>
        <li><b>Open-weight</b> — Llama, Mistral, Qwen, DeepSeek: data stays, full fine-tune, you run GPUs</li>
        <li><b>Break-even</b> — GPUs cost the same busy or idle; compare against your real token bill</li>
        <li><b>Rule</b> — prototype closed; switch for a named reason (residency, volume, offline)</li>
        <li>⚠ <b>Open-weight ≠ open source</b> — no data/code, licence limits</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Reasoning models</div>
      <ul>
        <li><b>What</b> — long chain of thought before answering; RL on checkable tasks</li>
        <li><b>Why</b> — test-time compute: more tokens = more thinking</li>
        <li><b>Claude</b> — adaptive thinking; depth via <code>output_config={"effort": ...}</code> (opus-5-5 default <code>medium</code>)</li>
        <li><b>Skip for</b> — classification, extraction, short chat → low effort</li>
        <li>⚠ <b>CoT prompting ≠ reasoning model</b> (trick vs trained)</li>
      </ul>
    </div>
  </div>
</div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lb-pretrain"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Pre-training</span><span class="rm-sub">Guess the next token, trillions of times</span></div></div>
      <div class="rm-item rm-done" data-target="lb-scale"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Scaling Laws</span><span class="rm-sub">Why bigger kept working</span></div></div>
      <div class="rm-item rm-done" data-target="lb-stages"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Three Training Stages</span><span class="rm-sub">Base → instruct → aligned</span></div></div>
      <div class="rm-item rm-done" data-target="lb-infer"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Inference &amp; Sampling</span><span class="rm-sub">Logits, temperature, top-k, top-p</span></div></div>
      <div class="rm-item rm-done" data-target="lb-ctx"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Context Window &amp; KV Cache</span><span class="rm-sub">Memory limits and the speed trick</span></div></div>
      <div class="rm-item rm-done" data-target="lb-hall"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Why Hallucinations Happen</span><span class="rm-sub">Plausible is not the same as true</span></div></div>
      <div class="rm-item rm-done" data-target="lb-cost"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Tokens = Cost &amp; Latency</span><span class="rm-sub">Do the maths before you ship</span></div></div>
      <div class="rm-item rm-done" data-target="lb-land"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Open vs Closed Models</span><span class="rm-sub">API or weights you host</span></div></div>
      <div class="rm-item rm-done" data-target="lb-reason"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Reasoning Models</span><span class="rm-sub">Thinking before answering</span></div></div>
      <div class="rm-item rm-done" data-target="lb-build"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">Sampler in numpy + one API call</span></div></div>
      <div class="rm-item rm-done" data-target="lb-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Base vs chat, T=0, words vs tokens</span></div></div>
      <div class="rm-item rm-done" data-target="lb-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <div class="callout intu"><span class="label">Why this note</span><p>You can call an LLM API without knowing any of this. But the day the bill is ten times the estimate, the answer changes on every run, or the bot invents a refund policy, you need the mechanics to debug it. Interviews for ML, data-science and backend roles now ask exactly these questions: "what does temperature do?", "what is the KV cache?", "why do LLMs hallucinate?", "how would you estimate the cost?". Each section uses only what came before it.</p></div>

  <h2 id="lb-pretrain"><span class="num">01</span>Pre-training: Next-Token Prediction</h2>
  <p>Start with the problem. You want a program that can write an email, explain a bug and translate Hindi to English. Writing rules for all of that is hopeless. Labelling millions of examples by hand ("here is a good answer") is slow and expensive. What you do have, for free, is a huge pile of text: books, websites, code, Wikipedia.</p>
  <p>The trick is to turn that pile into a quiz the computer can mark by itself. Hide the next word, ask the model to guess it, then reveal it. The text already contains the right answer, so no human is needed. Do this trillions of times and the model gets very good at guessing. That training phase is called <strong>pre-training</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A child doing "fill in the blank" exercises from every newspaper in India: "Virat Kohli hit a ___", "The monsoon reached Kerala on ___". To get good, the child has to learn grammar, cricket, geography and dates. Nobody taught those directly; they were needed to fill the blanks. The analogy breaks in one place: the model does this on more text than any human could read in a thousand lifetimes.</p>
  </div>
  <h3>Worked example: one sentence becomes five quiz questions</h3>
  <p>Text is first cut into <strong>tokens</strong> (word pieces; see <a class="xref" data-note="transformers">Transformers</a>). For the sentence "The cat sat on the mat", every position becomes one question. The <strong>causal mask</strong> (each position may only look left) makes sure the model never peeks at the answer.</p>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
    <defs><marker id="lb-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="34" class="tm">input</text><text x="10" y="104" class="tm">target</text>
    <rect x="80" y="15" width="70" height="28" rx="4" class="fb sb"/><text x="115" y="34" text-anchor="middle">The</text>
    <line x1="115" y1="46" x2="115" y2="80" stroke="currentColor" opacity="0.6" marker-end="url(#lb-ah)"/>
    <rect x="80" y="85" width="70" height="28" rx="4" class="fg sg"/><text x="115" y="104" text-anchor="middle">cat</text>
    <rect x="172" y="15" width="70" height="28" rx="4" class="fb sb"/><text x="207" y="34" text-anchor="middle">cat</text>
    <line x1="207" y1="46" x2="207" y2="80" stroke="currentColor" opacity="0.6" marker-end="url(#lb-ah)"/>
    <rect x="172" y="85" width="70" height="28" rx="4" class="fg sg"/><text x="207" y="104" text-anchor="middle">sat</text>
    <rect x="264" y="15" width="70" height="28" rx="4" class="fb sb"/><text x="299" y="34" text-anchor="middle">sat</text>
    <line x1="299" y1="46" x2="299" y2="80" stroke="currentColor" opacity="0.6" marker-end="url(#lb-ah)"/>
    <rect x="264" y="85" width="70" height="28" rx="4" class="fg sg"/><text x="299" y="104" text-anchor="middle">on</text>
    <rect x="356" y="15" width="70" height="28" rx="4" class="fb sb"/><text x="391" y="34" text-anchor="middle">on</text>
    <line x1="391" y1="46" x2="391" y2="80" stroke="currentColor" opacity="0.6" marker-end="url(#lb-ah)"/>
    <rect x="356" y="85" width="70" height="28" rx="4" class="fg sg"/><text x="391" y="104" text-anchor="middle">the</text>
    <rect x="448" y="15" width="70" height="28" rx="4" class="fb sb"/><text x="483" y="34" text-anchor="middle">the</text>
    <line x1="483" y1="46" x2="483" y2="80" stroke="currentColor" opacity="0.6" marker-end="url(#lb-ah)"/>
    <rect x="448" y="85" width="70" height="28" rx="4" class="fg sg"/><text x="483" y="104" text-anchor="middle">mat</text>
    </svg><figcaption>The text is its own answer key: one 6-token sentence gives 5 next-token questions, all trained in one parallel pass. No human labels.</figcaption></figure>
  <p>For each question the model outputs a probability for every token in its vocabulary. We only care about the probability it gave to the <em>true</em> next token. If it gave "mat" 0.585, that is good. If it gave "mat" 0.001, it was badly surprised. The penalty, called the <strong>loss</strong>, is −log(p): near 0 when p is near 1, large when p is tiny.</p>
  <p>The script below takes five made-up probabilities for one training step and computes the loss at each position, then the average loss and the perplexity.</p>
  <div class="fx" data-lang="py">import numpy as np

# For each position: the context, the true next token, and the probability
# the model gave to that true token (made-up numbers for one training step).
steps = [
    ("The",                "cat", 0.20),
    ("The cat",            "sat", 0.35),
    ("The cat sat",        "on",  0.60),
    ("The cat sat on",     "the", 0.80),
    ("The cat sat on the", "mat", 0.585),
]

losses = []
for context, target, p in steps:
    loss = -np.log(p)                 # cross-entropy for one position
    losses.append(loss)
    print(f"{context:20s} -&gt; {target:4s} p={p:.3f}  loss={loss:.3f}")

avg = np.mean(losses)
print("average loss:", round(avg, 3))
print("perplexity  :", round(np.exp(avg), 2))</div>
  <div class="fx" data-lang="text">The                  -&gt; cat  p=0.200  loss=1.609
The cat              -&gt; sat  p=0.350  loss=1.050
The cat sat          -&gt; on   p=0.600  loss=0.511
The cat sat on       -&gt; the  p=0.800  loss=0.223
The cat sat on the   -&gt; mat  p=0.585  loss=0.536
average loss: 0.786
perplexity  : 2.19</div>
  <p>Read the output top to bottom. After just "The", the next word could be almost anything, so p("cat") is low (0.20) and the loss is high (1.609). After "The cat sat on", "the" is nearly certain (0.80), so the loss is small (0.223). The line <code>loss = -np.log(p)</code> is the whole training signal. Training nudges the weights (backprop) so that next time these probabilities are a bit higher. <code>np.exp(avg)</code> turns the average loss into <strong>perplexity</strong>: 2.19 means the model was, on average, as unsure as if choosing between about 2 equally likely words.</p>
  <div class="flow"><span>"The cat sat on the"</span><span>Transformer</span><span>Probabilities over vocab</span><span>Loss = −log p("mat")</span><span>Backprop</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pre-training</strong> = train a decoder transformer to predict the next token on trillions of tokens of text, by minimising <strong>cross-entropy loss</strong> (the average −log p of the true next token). It is <strong>self-supervised</strong>: the labels come from the data itself, so it scales to the whole internet. Facts, grammar, code and some reasoning are learned as a side effect, because they make prediction easier.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A pre-trained (<strong>base</strong>) model is not a chatbot. Ask it "What is the capital of France?" and it may continue with "What is the capital of Germany? What is the capital of Spain?", because a list of quiz questions is a likely continuation. Following instructions comes from the later stages in section 03.</p>
  </div>
  <p>Why it matters at work: perplexity is the first number you check when you fine-tune or evaluate a language model on your domain text. Interviews ask "what is the training objective of GPT-style models?" and "why don't they need labelled data?". The answer is the paragraph above.</p>

  <h2 id="lb-scale"><span class="num">02</span>Scaling Laws</h2>
  <p>A frontier training run costs crores of rupees and months of GPU time. You cannot try ten sizes and keep the best. Labs need to answer, before spending: "if we make the model 10× bigger, or give it 10× more data, how much better will it get?"</p>
  <p>The surprising answer from research: the improvement is <em>predictable</em>. When you plot loss against model size, data size or compute on log-log axes, you get an almost straight line. So you train a few small models cheaply, draw the line, and read off what a big model will reach. These lines are called <strong>scaling laws</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A coaching institute notices that every doubling of practice tests raises a student's JEE score by about the same small amount. It never jumps, it never stops, it just keeps creeping up with diminishing returns. Knowing that curve, they can plan how many tests a student needs for a target score, without guessing.</p>
  </div>
  <h3>Worked example: three numbers to remember</h3>
  <ol>
    <li><strong>Compute</strong>: training cost in floating-point operations is about <strong>C ≈ 6 × N × D</strong>, where N = number of parameters and D = number of training tokens. (Roughly 2 operations per parameter per token forward, 4 backward.)</li>
    <li><strong>Kaplan et al. (2020)</strong>: loss ≈ (N<sub>c</sub>/N)<sup>0.076</sup>. Every 10× more parameters multiplies loss by 10<sup>−0.076</sup> ≈ 0.84. Steady, but slow.</li>
    <li><strong>Chinchilla (2022)</strong>: for a <em>fixed</em> compute budget, grow parameters and data together: about <strong>20 tokens per parameter</strong>. A 70B model "wants" 1.4T tokens.</li>
  </ol>
  <p>The script computes training compute for two real-world style runs, converts it to GPU-days with an assumed GPU speed, and prints the Kaplan curve.</p>
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
  <p>Look at the first two lines. A 70B model trained the Chinchilla way and an 8B model trained on 15 trillion tokens (the Llama-3-8B recipe) cost <em>about the same compute</em>. Why would anyone pick the small one? Because training is paid once, but <strong>inference</strong> (answering users) is paid on every request, forever, and an 8B model is roughly 9× cheaper per token to run. In the Kaplan lines, each 10× in N lowers loss by the same ratio (2.830 → 2.376 → 1.994): that is what a power law looks like.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Scaling laws</strong>: empirical power-law relations between loss and parameters (N), training tokens (D) and compute (C ≈ 6·N·D). <strong>Compute-optimal</strong> (Chinchilla) = the N and D split that gives the lowest loss for a given training budget, about 20 tokens per parameter.</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Chinchilla-optimal minimises <em>training</em> cost. Real products care about training + <em>serving</em> cost, so labs now "over-train" smaller models far past 20 tokens/param.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Scaling laws predict <em>loss</em>, not specific skills. "Emergent abilities" that seem to switch on suddenly at some size are partly an artefact of all-or-nothing metrics (exact match). With a smoother metric, the same skill usually improves gradually.</p>
  </div>
  <p>Interviews ask: "What is Chinchilla scaling?", "Why are small models trained on so much data?", "Estimate the compute to train a 7B model on 2T tokens" (6 × 7e9 × 2e12 = 8.4e22 FLOPs).</p>

  <h2 id="lb-stages"><span class="num">03</span>The Three Training Stages</h2>
  <p>The base model from section 01 knows a lot but behaves like autocomplete. It may ramble, continue your question with more questions, or copy the rude tone of an internet forum. A product needs something that answers the question asked, in a helpful tone, and declines harmful requests. Getting from "knows a lot" to "useful assistant" takes two more training stages. Together they are called <strong>post-training</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hiring a fresher. Pre-training: they spent years reading the whole library, so they know a lot. SFT: in the first month a senior shows them hundreds of worked examples, "when a customer asks this, reply like this". Preference tuning: for months the manager looks at two drafts and says "this one is better", until the fresher develops good taste for things no rulebook covers.</p>
  </div>
  <div class="cards">
    <div><b>1 · Pre-training</b><p>Next-token prediction on trillions of tokens. Output: a <strong>base</strong> model that knows a lot and follows nothing.</p><small>Very expensive · weeks to months · done by labs</small></div>
    <div><b>2 · SFT / instruction tuning</b><p><strong>Supervised fine-tuning</strong>: the same next-token training, but on (instruction → good answer) pairs written by people. Output: an <strong>instruct</strong> model.</p><small>Thousands to millions of examples</small></div>
    <div><b>3 · Preference tuning</b><p>Train on pairs "answer A is better than answer B" (RLHF or DPO). Output: helpful, honest, safe, on-tone.</p><small>Also RL on checkable tasks for reasoning models (09)</small></div>
  </div>
  <h3>Worked example: what the data looks like</h3>
  <p>One question still puzzles most beginners: a transformer only reads a sequence of tokens. How does it know who is "user" and who is "assistant"? The answer: a <strong>chat template</strong> turns the list of messages into one string, with special marker tokens for each role. The model learns those markers during SFT. The code below shows one SFT example, one preference example, and a simplified template.</p>
  <div class="fx" data-lang="py"># Stage 2 (SFT) data: one instruction -&gt; one good answer
sft_example = [
    {"role": "user", "content": "What is the capital of France?"},
    {"role": "assistant", "content": "Paris."},
]

# Stage 3 (preference) data: one prompt, two answers, a human picked one
preference_example = {
    "prompt": "Explain overfitting to a beginner.",
    "chosen": "The model memorised the training data, so it fails on new data.",
    "rejected": "Overfitting is when variance dominates bias in the estimator.",
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
print(to_text(sft_example[:1]))
print("preference keys:", sorted(preference_example))</div>
  <div class="fx" data-lang="text">--- training text (SFT) ---
&lt;|user|&gt;
What is the capital of France?&lt;|end|&gt;
&lt;|assistant|&gt;
Paris.&lt;|end|&gt;

--- what the model sees at chat time ---
&lt;|user|&gt;
What is the capital of France?&lt;|end|&gt;
&lt;|assistant|&gt;

preference keys: ['chosen', 'prompt', 'rejected']</div>
  <p>The training text is the whole conversation as one string. During SFT the loss is usually computed only on the assistant's tokens ("Paris.&lt;|end|&gt;"), so the model learns to answer, not to imitate users. At chat time, <code>add_generation_prompt=True</code> leaves the string ending in <code>&lt;|assistant|&gt;</code>, and next-token prediction does the rest: the most likely continuation is now an answer. The preference example has no single "right" text, only a ranking. DPO and RLHF use that ranking to push probability toward <code>chosen</code> and away from <code>rejected</code>. Real templates (Llama, Qwen, Claude) use different marker tokens, but the idea is the same.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Post-training</strong> = SFT + preference tuning. <strong>RLHF</strong> (reinforcement learning from human feedback) trains a reward model on human rankings, then optimises the LLM against it. <strong>DPO</strong> (direct preference optimisation) skips the reward model and trains directly on (chosen, rejected) pairs. Details live in <a class="xref" data-note="finetuning">Fine-Tuning</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fine-tuning an open chat model with the wrong chat template (or none). The model was trained to expect its own markers; feed it a different format and quality drops sharply. Always use the tokenizer's own template (for Hugging Face models, <code>tokenizer.apply_chat_template</code>).</p>
  </div>
  <p>"Pre" refers to position, not importance: pre-training creates the knowledge, post-training shapes the behaviour. Interviews ask "difference between a base and an instruct model?" and "RLHF vs DPO?".</p>

  <h2 id="lb-infer"><span class="num">04</span>Inference: Logits → Sampling</h2>
  <p>Training is done. Now a user types a prompt. The model does not produce a whole answer at once. It produces one token, appends it to the text, and runs again on the longer text. This repeats until it emits an end-of-sequence token or hits your <code>max_tokens</code> limit. Each step is called <strong>decoding</strong>, and generating one token at a time like this is called <strong>autoregressive</strong>.</p>
  <div class="flow"><span>Prompt tokens</span><span>Forward pass</span><span>Logits: raw score per vocab token (100k+)</span><span>Softmax → probs</span><span>Pick a token</span><span>Append &amp; repeat</span></div>
  <p>At every step the model outputs a <strong>logit</strong> (a raw score, any real number) for every token in the vocabulary. <strong>Softmax</strong> turns those scores into probabilities that add up to 1. Then a rule decides which token to pick. That rule is the "sampling" part, and its knobs change the personality of the output a lot.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A nervous speaker at a wedding toast, choosing each next word. <strong>Temperature</strong> is a boldness dial: low, they always say the safest word; high, they sometimes say "banana". <strong>Top-k</strong> is a rule "only consider your 5 favourite words". <strong>Top-p</strong> is a rule "only consider the words that together cover 90% of your confidence". When sure, that is 1–2 words; when unsure, many.</p>
  </div>
  <h3>Worked example: "The cat sat on the ___"</h3>
  <p>Suppose the logits for six candidate tokens are mat 4.0, floor 3.0, sofa 2.5, roof 1.5, moon 0.5, banana −1.0. Temperature T divides every logit before softmax. Dividing by a small T (0.5) doubles the gaps, so the leader wins by more. Dividing by a big T (2) halves the gaps, so the tail gets a share. The ranking never changes.</p>
  <div class="fx" data-lang="py">import numpy as np

vocab  = ["mat", "floor", "sofa", "roof", "moon", "banana"]
logits = np.array([4.0, 3.0, 2.5, 1.5, 0.5, -1.0])

def softmax(z):
    z = z - z.max()          # stability: biggest logit becomes 0
    e = np.exp(z)
    return e / e.sum()

for T in [0.5, 1.0, 2.0]:
    p = softmax(logits / T)
    print(f"T={T}:", " ".join(f"{w}={x:.3f}" for w, x in zip(vocab, p)))

p = softmax(logits)
order = np.argsort(p)[::-1]
print("running total:", np.round(np.cumsum(p[order]), 3))</div>
  <div class="fx" data-lang="text">T=0.5: mat=0.838 floor=0.113 sofa=0.042 roof=0.006 moon=0.001 banana=0.000
T=1.0: mat=0.585 floor=0.215 sofa=0.130 roof=0.048 moon=0.018 banana=0.004
T=2.0: mat=0.381 floor=0.231 sofa=0.180 roof=0.109 moon=0.066 banana=0.031
running total: [0.585 0.8   0.93  0.978 0.996 1.   ]</div>
  <p>The line <code>softmax(logits / T)</code> is temperature: nothing more. At T=0.5 "mat" takes 84%; at T=2 it drops to 38% and "banana" rises from 0.000 to 0.031. The last line is the running total of the sorted probabilities, which is exactly what top-p uses: with p = 0.9, keep adding tokens until the total reaches 0.9. 0.585 is not enough, 0.80 is not enough, 0.93 is, so three tokens survive. <code>z - z.max()</code> does not change the result; it only stops <code>np.exp</code> from overflowing on large logits.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <line x1="40" y1="160" x2="590" y2="160" stroke="currentColor" opacity="0.4"/>
    <rect x="50" y="42.7" width="22" height="117.3" class="fb sb"/>
    <rect x="74" y="78.1" width="22" height="81.9" class="ft st"/>
    <rect x="98" y="106.7" width="22" height="53.3" class="fr sr"/>
    <text x="85" y="178" text-anchor="middle">mat</text>
    <rect x="140" y="144.2" width="22" height="15.8" class="fb sb"/>
    <rect x="164" y="129.9" width="22" height="30.1" class="ft st"/>
    <rect x="188" y="127.7" width="22" height="32.3" class="fr sr"/>
    <text x="175" y="178" text-anchor="middle">floor</text>
    <rect x="230" y="154.1" width="22" height="5.9" class="fb sb"/>
    <rect x="254" y="141.8" width="22" height="18.2" class="ft st"/>
    <rect x="278" y="134.8" width="22" height="25.2" class="fr sr"/>
    <text x="265" y="178" text-anchor="middle">sofa</text>
    <rect x="320" y="159.2" width="22" height="0.8" class="fb sb"/>
    <rect x="344" y="153.3" width="22" height="6.7" class="ft st"/>
    <rect x="368" y="144.7" width="22" height="15.3" class="fr sr"/>
    <text x="355" y="178" text-anchor="middle">roof</text>
    <rect x="410" y="159.5" width="22" height="0.5" class="fb sb"/>
    <rect x="434" y="157.5" width="22" height="2.5" class="ft st"/>
    <rect x="458" y="150.8" width="22" height="9.2" class="fr sr"/>
    <text x="445" y="178" text-anchor="middle">moon</text>
    <rect x="500" y="159.5" width="22" height="0.5" class="fb sb"/>
    <rect x="524" y="159.4" width="22" height="0.6" class="ft st"/>
    <rect x="548" y="155.7" width="22" height="4.3" class="fr sr"/>
    <text x="535" y="178" text-anchor="middle">banana</text>
    <text x="40" y="20" class="tm">p</text>
    <rect x="330" y="12" width="12" height="12" class="fb sb"/><text x="348" y="23">T=0.5</text><rect x="410" y="12" width="12" height="12" class="ft st"/><text x="428" y="23">T=1</text><rect x="480" y="12" width="12" height="12" class="fr sr"/><text x="498" y="23">T=2</text>
    <text x="88" y="38" class="tb">0.84</text><text x="410" y="130" class="tr">tail grows</text>
    </svg><figcaption>Same logits, three temperatures (numbers from the run above). Low T piles mass on "mat"; high T feeds the tail.</figcaption></figure>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <line x1="40" y1="150" x2="590" y2="150" stroke="currentColor" opacity="0.4"/>
    <rect x="60" y="62.2" width="50" height="87.8" class="fg sg"/>
    <text x="85" y="168" text-anchor="middle">mat</text>
    <text x="85" y="56.2" text-anchor="middle" class="tm">Σ0.585</text>
    <rect x="148" y="117.8" width="50" height="32.2" class="fg sg"/>
    <text x="173" y="168" text-anchor="middle">floor</text>
    <text x="173" y="111.8" text-anchor="middle" class="tm">Σ0.80</text>
    <rect x="236" y="130.5" width="50" height="19.5" class="fg sg"/>
    <text x="261" y="168" text-anchor="middle">sofa</text>
    <text x="261" y="124.5" text-anchor="middle" class="tm">Σ0.93</text>
    <rect x="324" y="142.8" width="50" height="7.2" class="fs"/>
    <text x="349" y="168" text-anchor="middle">roof</text>
    <text x="349" y="136.8" text-anchor="middle" class="tm">Σ0.98</text>
    <rect x="412" y="147.3" width="50" height="2.7" class="fs"/>
    <text x="437" y="168" text-anchor="middle">moon</text>
    <rect x="500" y="149.4" width="50" height="0.6" class="fs"/>
    <text x="525" y="168" text-anchor="middle">banana</text>
    <line x1="217" y1="40" x2="217" y2="150" class="sb" stroke-width="2" stroke-dasharray="5 4"/><text x="217" y="34" text-anchor="middle" class="tb">top-k=2</text>
    <line x1="305" y1="40" x2="305" y2="150" class="sr" stroke-width="2"/><text x="305" y="34" text-anchor="middle" class="tr">top-p=0.9</text>
    <text x="335" y="90" class="tm">dropped (tail)</text>
    </svg><figcaption>T = 1 probabilities with running totals (Σ). Top-p stops once Σ ≥ 0.9 (3 tokens here); top-k=2 always keeps exactly two. Survivors are renormalised to sum to 1.</figcaption></figure>
  <table class="tbl">
    <tr><th>Knob</th><th>What it does</th><th>Effect</th></tr>
    <tr><td><strong>Greedy</strong> (T = 0)</td><td>Always take the top token</td><td>Repeatable, but dull and prone to repeating loops</td></tr>
    <tr><td><strong>Temperature T</strong></td><td>Divide logits by T before softmax</td><td>T &lt; 1 sharpens (safer); T &gt; 1 flattens (more varied, more errors)</td></tr>
    <tr><td><strong>Top-k</strong></td><td>Keep only the k most likely tokens</td><td>Cuts the long tail; k is fixed whatever the confidence</td></tr>
    <tr><td><strong>Top-p</strong> (nucleus)</td><td>Keep the smallest set whose probs sum to ≥ p</td><td>Adaptive: few tokens when confident, many when unsure</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Temperature 0 is not perfectly deterministic in production. Batched GPU maths adds floating-point numbers in different orders, which can flip near-ties, and one flipped token changes everything after it. Also, current Claude models (<code>claude-opus-5-5</code>, <code>claude-sonnet-5-5</code>, <code>claude-haiku-5-5</code>) reject non-default <code>temperature</code>, <code>top_p</code> and <code>top_k</code> with a 400 error. You steer them with the prompt and with <code>effort</code> (09). Open models and many other APIs still expose these knobs.</p>
  </div>
  <h3>Prefill vs decode: why output is the slow part</h3>
  <p>The prompt is already known, so the model can process all prompt tokens in one parallel pass. That is <strong>prefill</strong>, and it decides the <strong>time-to-first-token</strong> (TTFT). The answer is not known in advance, so each output token needs its own pass. That is <strong>decode</strong>, and it decides <strong>tokens per second</strong>.</p>
  <table class="tbl">
    <tr><th>Phase</th><th>How</th><th>Sets</th></tr>
    <tr><td><strong>Prefill</strong></td><td>Whole prompt in one parallel pass</td><td>Time-to-first-token (TTFT)</td></tr>
    <tr><td><strong>Decode</strong></td><td>One pass per output token, in sequence</td><td>Tokens per second</td></tr>
  </table>
  <p>Practical rule: 1,000 extra prompt tokens cost little time; 1,000 extra output tokens cost a lot. Interviews ask "explain temperature", "top-k vs top-p", and "why is generation slow?".</p>

  <h2 id="lb-ctx"><span class="num">05</span>Context Window &amp; KV Cache</h2>
  <p>Two practical limits show up the moment you build a chatbot. First, users paste a 300-page PDF and the API errors out: the input is too long. Second, even when it fits, generating a long answer gets slower and uses a lot of GPU memory. Both come from how attention works.</p>
  <h3>The context window</h3>
  <p>The model can only attend to a fixed maximum number of tokens in one call, counting prompt <em>and</em> output. That limit is the <strong>context window</strong>. Current frontier models range from about 128K to 1M tokens. Anything outside the window does not exist for the model. There is no hidden memory between calls: a chatbot "remembers" only because your code sends the earlier messages again (see <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An exam where you may bring one A4 sheet of notes. Whatever fits on the sheet you can use; whatever does not, you simply do not have. A bigger sheet helps, but if you cram tiny writing into the middle, you may miss it under pressure. That is "lost in the middle": facts buried deep in a very long prompt are used less reliably than facts at the start or end.</p>
  </div>
  <h3>The KV cache</h3>
  <p>Recall from <a class="xref" data-note="transformers">Transformers</a>: each token produces a <strong>key</strong> (K) and a <strong>value</strong> (V) vector in every layer, and a new token attends to all earlier K and V. Here is the waste: when generating token 100, the K and V of tokens 1–99 are exactly the same as they were at step 99. Recomputing them is pointless. So the server stores them in GPU memory and only computes K and V for the new token. That store is the <strong>KV cache</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <text x="10" y="44" class="tm">K</text><text x="10" y="84" class="tm">V</text>
    <rect x="40" y="26" width="60" height="26" rx="3" class="fg sg"/><rect x="40" y="66" width="60" height="26" rx="3" class="fg sg"/>
    <text x="70" y="44" text-anchor="middle">k1</text><text x="70" y="84" text-anchor="middle">v1</text>
    <text x="70" y="112" text-anchor="middle">The</text>
    <rect x="112" y="26" width="60" height="26" rx="3" class="fg sg"/><rect x="112" y="66" width="60" height="26" rx="3" class="fg sg"/>
    <text x="142" y="44" text-anchor="middle">k2</text><text x="142" y="84" text-anchor="middle">v2</text>
    <text x="142" y="112" text-anchor="middle">cat</text>
    <rect x="184" y="26" width="60" height="26" rx="3" class="fg sg"/><rect x="184" y="66" width="60" height="26" rx="3" class="fg sg"/>
    <text x="214" y="44" text-anchor="middle">k3</text><text x="214" y="84" text-anchor="middle">v3</text>
    <text x="214" y="112" text-anchor="middle">sat</text>
    <rect x="256" y="26" width="60" height="26" rx="3" class="fg sg"/><rect x="256" y="66" width="60" height="26" rx="3" class="fg sg"/>
    <text x="286" y="44" text-anchor="middle">k4</text><text x="286" y="84" text-anchor="middle">v4</text>
    <text x="286" y="112" text-anchor="middle">on</text>
    <rect x="328" y="26" width="60" height="26" rx="3" class="fg sg"/><rect x="328" y="66" width="60" height="26" rx="3" class="fg sg"/>
    <text x="358" y="44" text-anchor="middle">k5</text><text x="358" y="84" text-anchor="middle">v5</text>
    <text x="358" y="112" text-anchor="middle">the</text>
    <rect x="400" y="26" width="60" height="26" rx="3" class="fb sb"/><rect x="400" y="66" width="60" height="26" rx="3" class="fb sb"/>
    <text x="430" y="44" text-anchor="middle">k6</text><text x="430" y="84" text-anchor="middle">v6</text>
    <text x="430" y="112" text-anchor="middle" class="tb">?</text>
    <rect x="34" y="18" width="358" height="82" rx="6" fill="none" class="sg" stroke-dasharray="5 4"/>
    <text x="40" y="136" class="tg">cached: computed once, read every step</text>
    <text x="40" y="156" class="tb">new token: only its k, v are computed</text>
    <text x="470" y="136" class="tm">cost: GPU memory</text><text x="470" y="156" class="tm">128 KiB / token*</text>
    </svg><figcaption>Decode step 6: reuse k1–v5 from the cache. *Llama-3-8B-style model, fp16; about 1 GiB per 8K-token sequence.</figcaption></figure>
  <p>Count the work. Without the cache, step 1 computes 1 K/V pair, step 2 computes 2, ..., step n computes n. With the cache, every step computes exactly 1. The script counts both for 1,000 output tokens, then computes how much memory the cache needs.</p>
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
  <p>The first two lines show the speed win: 500,500 versus 1,000, which is quadratic versus linear. The <code>per_token</code> line shows the price: 128 KiB of GPU memory for every token of every active conversation. One 128K-token conversation needs 15.6 GiB just for the cache, and 32 users at 8K need 32 GiB. That is why serving long contexts to many users is limited by memory, not by arithmetic, and why tricks like <strong>grouped-query attention</strong> (fewer KV heads, so a smaller <code>kv_heads</code>) and storing the cache in 8-bit exist.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Context window</strong> = the maximum number of tokens (prompt + output) one call can attend to. <strong>KV cache</strong> = the per-sequence store of every past token's key and value vectors in every layer, kept in GPU memory during generation so each decode step only computes the new token. Memory per token = 2 × layers × KV heads × head dim × bytes per number.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The KV cache lives inside one generation on the server and disappears afterwards. <strong>Prompt caching</strong> (reusing a processed prompt prefix across separate API calls, with a discount) is a different, API-level feature, covered in <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>. Interviewers like to check that you can tell them apart.</p>
  </div>

  <h2 id="lb-hall"><span class="num">06</span>Why Hallucinations Happen</h2>
  <p>A support bot tells a customer "our refund window is 60 days". Your policy says 30. A research assistant cites a paper that does not exist, with a believable title and author. Nothing crashed, no error was raised, and the text reads perfectly. This is the most damaging LLM failure in real products, and it follows directly from how the model is built.</p>
  <p>A <strong>hallucination</strong> is fluent, confident output that is false or not supported by the given sources. The core reason in plain words: the model was trained to produce <em>likely</em> text, not <em>true</em> text. Usually likely and true coincide. When the model's knowledge is blurry, likely-sounding text is still produced, with the same confident tone.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A student in a viva who did not study one chapter. They know the shape of a good answer, so they speak fluently and confidently, and the examiner almost believes them. Ask "which page is that on?" or tell them "it's fine to say you don't know", and the bluff is exposed.</p>
  </div>
  <h3>Worked example: sharp vs blurry knowledge</h3>
  <p>Ask "Who wrote paper X?". For a famous paper, the model's probability is concentrated on one name. For an obscure paper it saw once, the probability is spread over several similar names. Sampling still has to pick one, and the sentence around it will sound just as sure. The script simulates both cases, then shows the simplest fix: answer only when the top probability is high enough.</p>
  <div class="fx" data-lang="py">import numpy as np

authors = ["R. Sharma", "R. Verma", "A. Gupta", "S. Iyer", "K. Rao"]
# Famous paper: knowledge is sharp. Obscure paper: knowledge is blurry.
famous  = np.array([0.92, 0.03, 0.02, 0.02, 0.01])
obscure = np.array([0.24, 0.22, 0.20, 0.18, 0.16])

rng = np.random.default_rng(0)
for name, p in [("famous", famous), ("obscure", obscure)]:
    picks = [authors[rng.choice(5, p=p)] for _ in range(5)]
    print(f"{name:8s} 5 samples:", picks)

def answer_or_abstain(p, threshold=0.5):
    best = int(np.argmax(p))
    return authors[best] if p[best] &gt;= threshold else "I'm not sure."

print("famous  -&gt;", answer_or_abstain(famous))
print("obscure -&gt;", answer_or_abstain(obscure))</div>
  <div class="fx" data-lang="text">famous   5 samples: ['R. Sharma', 'R. Sharma', 'R. Sharma', 'R. Sharma', 'R. Sharma']
obscure  5 samples: ['K. Rao', 'A. Gupta', 'S. Iyer', 'A. Gupta', 'K. Rao']
famous  -&gt; R. Sharma
obscure -&gt; I'm not sure.</div>
  <p>For the famous paper, all five samples agree. For the obscure one, five runs give four different authors, and each would be written as a confident sentence. That disagreement is a useful signal: asking the same question several times and checking agreement is a real hallucination detector. <code>answer_or_abstain</code> shows the idea behind "give the model an out". Real APIs do not hand you these probabilities for whole facts, so in practice you get the same effect with a prompt ("if you are not sure, say so") and, better, by putting the facts in the prompt.</p>
  <ul>
    <li><strong>The objective is plausibility.</strong> Pre-training rewards a likely continuation, not a true one.</li>
    <li><strong>Knowledge is lossy.</strong> Rare facts are stored weakly, so the model blends similar ones (as above).</li>
    <li><strong>Knowledge cutoff.</strong> Nothing after the training data, and nothing private (your policies, your database).</li>
    <li><strong>Training rewards guessing.</strong> Many benchmarks score "I don't know" as wrong, so guessing scores higher.</li>
    <li><strong>Sampling.</strong> One unlucky low-probability token can send the rest of the answer down a wrong path.</li>
  </ul>
  <table class="tbl">
    <tr><th>Fix</th><th>How</th><th>Where</th></tr>
    <tr><td>Ground it</td><td>Put the facts in the prompt (retrieval)</td><td><a class="xref" data-note="rag">Retrieval-Augmented Generation</a></td></tr>
    <tr><td>Let it look things up</td><td>Tools: search, database, calculator</td><td><a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a></td></tr>
    <tr><td>Give it an out</td><td>"If the context doesn't say, answer 'unknown'"</td><td><a class="xref" data-note="prompting">Prompt Engineering</a></td></tr>
    <tr><td>Check it</td><td>Citations, a verification step, evals</td><td><a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hallucination</strong>: model output that is fluent and confident but factually wrong or unsupported by the provided context. <strong>Grounding</strong>: giving the model the source facts in the prompt and asking it to answer only from them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Trusting a confident tone. The model sounds equally sure whether it is right or wrong; tone carries no information about truth. Also, a bigger model does not remove hallucinations, it only reduces them. Design the system (grounding, tools, checks) assuming they will happen.</p>
  </div>
  <p>Interviews ask "why do LLMs hallucinate and how would you reduce it in production?". A strong answer names two or three causes and maps each to a fix, as in the table.</p>

  <h2 id="lb-cost"><span class="num">07</span>Tokens = Cost &amp; Latency</h2>
  <p>A prototype that costs ₹2 a day can cost lakhs a month once real users arrive. And a bot that takes 30 seconds to answer feels broken. Both numbers are set by tokens, so you should estimate them before you ship, not after the first invoice.</p>
  <p>APIs bill per token, with separate prices for input (prompt) and output (generated) tokens. A <strong>token</strong> is a sub-word piece: in English, roughly 4 characters or ¾ of a word. Code, numbers, and non-English scripts such as Hindi usually need more tokens for the same meaning. Output tokens cost about 5× more than input tokens, because each one needs its own sequential decode pass (section 04).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An auto-rickshaw meter. There is a small charge for the distance you describe to the driver (input) and a much bigger charge for the distance actually driven (output). A long, rambling answer is a long ride. And the ride time grows with distance too: latency ≈ waiting for the auto to arrive (TTFT) + distance ÷ speed.</p>
  </div>
  <h3>Worked example: one request, three models</h3>
  <p>A typical RAG request: 2,000 input tokens (question + retrieved documents) and 500 output tokens. Prices below are per million tokens. The function multiplies tokens by price, then scales to 100,000 calls a day. The latency function uses assumed speeds (0.5 s to first token, 60 tokens per second); measure your own.</p>
  <div class="fx" data-lang="py">PRICES = {                       # USD per 1M tokens: (input, output)
    "claude-opus-5-5":   (4.00, 20.00),
    "claude-sonnet-5-5": (2.00, 10.00),
    "claude-haiku-5-5":  (0.10,  0.50),
}

def call_cost(model, input_tokens, output_tokens):
    p_in, p_out = PRICES[model]
    return input_tokens * p_in / 1e6 + output_tokens * p_out / 1e6

def latency(output_tokens, ttft=0.5, tokens_per_sec=60):
    return ttft + output_tokens / tokens_per_sec      # assumed speeds

for model in PRICES:
    c = call_cost(model, 2000, 500)
    print(f"{model:18s} per call \${c:.5f}   per 100k calls/day \${c * 100_000:,.0f}")

print("latency, 500 output tokens :", round(latency(500), 1), "s")
print("latency, 2000 output tokens:", round(latency(2000), 1), "s")
print("rough tokens in 'Explain the KV cache in two sentences.':",
      len("Explain the KV cache in two sentences.") // 4)</div>
  <div class="fx" data-lang="text">claude-opus-5-5    per call $0.01800   per 100k calls/day $1,800
claude-sonnet-5-5  per call $0.00900   per 100k calls/day $900
claude-haiku-5-5   per call $0.00045   per 100k calls/day $45
latency, 500 output tokens : 8.8 s
latency, 2000 output tokens: 33.8 s
rough tokens in 'Explain the KV cache in two sentences.': 9</div>
  <p>Check the Opus line by hand: 2,000 × $4 / 1M = $0.008 input, plus 500 × $20 / 1M = $0.010 output = $0.018. Notice that the 500 output tokens cost more than the 2,000 input tokens. The model choice is a 40× swing in cost ($1,800 vs $45 a day), which is why teams route easy requests to a small model. The latency lines show that quadrupling the output length roughly quadruples the wait. The last line is the "4 characters per token" rule of thumb; good for a first estimate only.</p>
  <ul>
    <li><strong>Thinking tokens</strong> of reasoning models (09) are billed as output, even when you don't display them.</li>
    <li><strong>Cheapest levers</strong>: shorter outputs ("answer in 3 bullets"), a smaller model for easy steps, prompt caching for repeated long prefixes.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cost per call</strong> = input tokens × input price + output tokens × output price. <strong>Latency</strong> ≈ TTFT + output tokens ÷ tokens per second. <strong>TTFT</strong> (time to first token) is mostly prefill time plus queueing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Estimating cost from words or characters for a real budget. Different model families tokenize the same text differently, and Hindi or code can need 2–3× more tokens than English. Count with the provider's tokenizer or token-counting endpoint (<code>client.messages.count_tokens</code>, free, shown in <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>).</p>
  </div>
  <p>Interviews (especially for backend and ML-platform roles) ask you to estimate the monthly cost of a feature. Say the formula, plug numbers, and mention output dominance and caching.</p>

  <h2 id="lb-land"><span class="num">08</span>Open vs Closed Models</h2>
  <p>Your manager asks: "Should we use an API, or run our own model?" A bank cannot send customer data outside its data centre. A startup has no GPU engineers. A company classifying 50 million support tickets a month watches every rupee. One answer does not fit all three.</p>
  <p>There are two kinds of models. A <strong>closed</strong> model is one you can only call over an API; its weights (the learned numbers) are secret. An <strong>open-weight</strong> model is one whose weights you can download and run on your own machines, and fine-tune freely.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Booking an Ola versus buying a car. Ola: no upfront cost, best cars, pay per ride, someone else handles servicing; but the trip goes through their system. Own car: big fixed cost (paid whether you drive or not), you handle servicing, but it goes wherever you want and nobody else sees the route. Booking rides is cheaper until you drive a lot every day.</p>
  </div>
  <h3>Worked example: a break-even sketch</h3>
  <p>The script compares a month of API usage with renting two GPUs around the clock. <strong>Every number is an assumption for illustration</strong> (traffic, token counts, GPU price); the point is the shape of the comparison, not the exact rupees.</p>
  <div class="fx" data-lang="py"># All numbers below are assumptions for illustration. Plug in your own.
requests_per_month = 3_000_000
in_tok, out_tok = 1_500, 300

def api_monthly(p_in, p_out):
    per_call = in_tok * p_in / 1e6 + out_tok * p_out / 1e6
    return per_call * requests_per_month

gpu_hourly, gpus, hours = 2.50, 2, 730         # rented GPUs, on 24x7
self_host = gpu_hourly * gpus * hours

print(f"API, Sonnet-class ($2/$10)  : \${api_monthly(2.00, 10.00):,.0f} / month")
print(f"API, Haiku-class ($0.10/$0.50): \${api_monthly(0.10, 0.50):,.0f} / month")
print(f"Self-host, 2 GPUs 24x7       : \${self_host:,.0f} / month (+ engineers)")</div>
  <div class="fx" data-lang="text">API, Sonnet-class ($2/$10)  : $18,000 / month
API, Haiku-class ($0.10/$0.50): $900 / month
Self-host, 2 GPUs 24x7       : $3,650 / month (+ engineers)</div>
  <p>Self-hosting beats the mid-size API model here, but loses badly to the small API model, and the GPU line does not include the engineers who keep it running, or the quality gap. The line <code>self_host = gpu_hourly * gpus * hours</code> is the key difference in cost shape: GPUs cost the same whether busy or idle, while the API bill scales with use. So the decision is rarely about price alone.</p>
  <table class="tbl">
    <tr><th></th><th>Closed API</th><th>Open-weight, self-hosted</th></tr>
    <tr><td>Quality</td><td>Usually the frontier</td><td>Close behind; great for narrower tasks</td></tr>
    <tr><td>Cost model</td><td>Pay per token</td><td>Pay for GPUs, whether busy or idle</td></tr>
    <tr><td>Data control</td><td>Data goes to the provider (with contracts)</td><td>Never leaves your servers</td></tr>
    <tr><td>Customisation</td><td>Prompting, some fine-tuning</td><td>Full fine-tuning, quantization</td></tr>
    <tr><td>Ops burden</td><td>None</td><td>Serving, scaling, monitoring</td></tr>
  </table>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Prototype on a closed API to learn what quality is possible. Move to open weights only for a named reason: strict data residency, very high volume of a narrow task, offline or on-device use, or deep customisation.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Open-weight model</strong>: the trained parameters are published for download, under a licence. <strong>Closed model</strong>: available only as a hosted service.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Open-weight" is not "open source". You get the weights, usually not the training data or training code, and licences can restrict commercial use or very large deployments. Read the licence before building a product on it.</p>
  </div>
  <p>Interview favourite: a scenario ("a hospital wants a chatbot over patient records") and "open or closed, and why?". Name the deciding constraint, then the trade-off you accept.</p>

  <h2 id="lb-reason"><span class="num">09</span>Reasoning ("Thinking") Models</h2>
  <p>A normal LLM spends the same small amount of computation on every token. That is fine for "translate this sentence". It is not enough for "find the bug in this 200-line function" or a tricky probability puzzle, where a person would also need scrap paper. Ask for the answer directly and the model writes its first guess; there is no step where it can check its work.</p>
  <p>A <strong>reasoning model</strong> is trained to write a long chain of thought (its working) before the final answer. More tokens of thinking = more forward passes = more computation spent on the problem, exactly when it is needed. This is called <strong>test-time compute</strong>: buying accuracy at answer time instead of training time. These models are trained with reinforcement learning on tasks whose answers can be checked automatically (maths, code with tests, logic puzzles), so the model learns which kinds of thinking lead to correct answers.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Answering a maths question orally on the spot versus with rough paper. Rough paper takes longer and costs paper, but you catch your own mistakes on hard problems. For "what is 2 + 2", rough paper is a waste of time.</p>
  </div>
  <div class="flow"><span>Question</span><span>Thinking tokens (hidden or summarised)</span><span>Final answer</span></div>
  <h3>Worked example: same question, two effort levels</h3>
  <p>On Claude, thinking is <strong>adaptive</strong>: the model decides how much to think, and you set the overall depth with <code>effort</code> (low, medium, high, xhigh, max). On <code>claude-opus-5-5</code> thinking is always on, the default effort is <code>medium</code>, and you cannot switch thinking off; you lower effort instead. The code sends one hard question at two effort levels and prints what you pay for.</p>
  <div class="fx" data-lang="py">import anthropic

client = anthropic.Anthropic()               # reads ANTHROPIC_API_KEY

question = ("A bag has 3 red and 2 blue balls. You draw 2 without replacement. "
            "What is the probability both are red? Give a fraction.")

for effort in ["low", "high"]:
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,                    # covers thinking + answer
        messages=[{"role": "user", "content": question}],
        output_config={"effort": effort},    # how hard to think
    )
    answer = "".join(b.text for b in response.content if b.type == "text")
    print(effort, "|", answer.strip()[:60], "| output tokens:", response.usage.output_tokens)</div>
  <p><em>Example output (illustrative, not from a live call; token counts will vary):</em></p>
  <div class="fx" data-lang="text">low | 3/10 | output tokens: 180
high | 3/10 | output tokens: 950</div>
  <p>The loop is the only new idea: the same request with a different <code>output_config={"effort": ...}</code>. On an easy question both levels get 3/10 (3/5 × 2/4), but high effort spends several times more output tokens, and those are billed at the output price (section 07). On a hard question, the extra thinking is where the accuracy comes from. <code>response.content</code> may also contain <code>thinking</code> blocks; the loop keeps only <code>text</code> blocks. <code>max_tokens</code> must be large enough to cover thinking and answer together.</p>
  <ul>
    <li><strong>Gain</strong>: big jumps on maths, coding, planning and multi-step agent tasks.</li>
    <li><strong>Cost</strong>: more output tokens, so more latency and money. Overkill for "classify this sentence".</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Reasoning model</strong>: an LLM trained (usually with RL on verifiable tasks) to generate an internal chain of thought before its answer. <strong>Test-time compute</strong>: extra computation spent at inference time, here in the form of thinking tokens. <strong>Effort</strong>: Claude's API setting for how much thinking and overall token spend to use.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Prompting a model to "think step by step" (chain-of-thought, see <a class="xref" data-note="prompting">Prompt Engineering</a>) is a prompt trick. A reasoning model is <em>trained</em> to do it natively. They are related but not the same, and adding "think step by step" to a reasoning model adds little; raise effort instead.</p>
  </div>
  <p>Interviews ask "when would you not use a reasoning model?" (simple, high-volume, latency-sensitive tasks) and "what is test-time compute?".</p>

  <h2 id="lb-build"><span class="num">10</span>Build It: A Sampler + One API Call</h2>
  <p>Time to put sections 04 and 07 together. Part 1 builds a complete sampler from scratch, so you can see greedy, temperature, top-k and top-p working on the same logits. Part 2 makes one real API call and reads every field you pay for.</p>
  <h3>Part 1: sampling from logits in numpy</h3>
  <p>The function <code>sample</code> applies the knobs in the same order real inference engines do: temperature first, then top-k or top-p filtering, then renormalise and draw one token. The loop draws 1,000 tokens per strategy with a fixed seed and counts what came out. Runs offline; no tokenizer needed.</p>
  <div class="fx" data-lang="py">import numpy as np

vocab  = ["mat", "floor", "sofa", "roof", "moon", "banana"]
logits = np.array([4.0, 3.0, 2.5, 1.5, 0.5, -1.0])   # "The cat sat on the ..."

def softmax(z):
    z = z - z.max()                      # subtract max for numerical stability
    e = np.exp(z)
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
  <div class="fx" data-lang="text">greedy          {'mat': 1000}
T=1.0           {'mat': 563, 'floor': 225, 'sofa': 144, 'roof': 45, 'moon': 20, 'banana': 3}
T=2.0           {'mat': 425, 'floor': 216, 'sofa': 156, 'roof': 101, 'moon': 66, 'banana': 36}
T=1, top_k=2    {'mat': 743, 'floor': 257}
T=1, top_p=0.9  {'mat': 632, 'floor': 245, 'sofa': 123}</div>
  <ul>
    <li><strong>greedy</strong>: the <code>temperature == 0</code> branch skips sampling and returns the argmax, so all 1,000 picks are "mat".</li>
    <li><strong>T=2.0</strong> moves samples into the tail: "banana" goes from 3 to 36 out of 1,000.</li>
    <li><strong>top_k=2</strong>: <code>np.where(probs &gt;= cutoff, ...)</code> zeroes everything below the 2nd-best, so only "mat" and "floor" appear.</li>
    <li><strong>top_p=0.9</strong>: <code>np.searchsorted(cum, top_p) + 1</code> finds how many sorted tokens are needed to reach 0.9, which is 3 (0.585, 0.80, 0.93).</li>
    <li>After filtering, <code>probs / probs.sum()</code> renormalises, so "mat" rises from 0.585 to about 0.63 (top-p) or 0.73 (top-k), matching the counts.</li>
  </ul>
  <h3>Part 2: one real call with the Anthropic SDK</h3>
  <p>Install with <code>pip install anthropic</code> and set the <code>ANTHROPIC_API_KEY</code> environment variable. The call below sends a system prompt and one user message, asks for low effort, and then prints the text, the reason it stopped, and the token usage. Other providers (OpenAI and others) follow the same shape: model, messages, a maximum output length.</p>
  <div class="fx" data-lang="py">import anthropic

client = anthropic.Anthropic()            # API key comes from ANTHROPIC_API_KEY

response = client.messages.create(
    model="claude-opus-5-5",              # which model
    max_tokens=1024,                      # hard cap on OUTPUT tokens (thinking + text)
    system="You are a concise ML tutor.", # standing instructions (Prompt Engineering)
    messages=[                            # the conversation so far; API is stateless
        {"role": "user", "content": "Explain the KV cache in two sentences."}
    ],
    output_config={"effort": "low"},      # how hard to think: low | medium | high | xhigh | max
    stop_sequences=["\\n\\n\\n"],            # optional: stop early if this string appears
)

for block in response.content:            # a list of blocks: "thinking", "text", ...
    if block.type == "text":
        print(block.text)

print(response.stop_reason)               # end_turn | max_tokens | stop_sequence | ...
print(response.usage.input_tokens, response.usage.output_tokens)  # what you pay for</div>
  <p><em>Example output (illustrative; wording and counts will vary):</em></p>
  <div class="fx" data-lang="text">The KV cache stores each past token's key and value vectors so that, when
generating the next token, the model only computes them for the new token.
This turns repeated recomputation into a lookup, trading GPU memory for speed.
end_turn
27 64</div>
  <p>Three things to notice. First, <code>response.content</code> is a <em>list</em> of blocks, not a string, because a reply can contain thinking, text and tool calls; always check <code>block.type</code>. Second, <code>stop_reason</code> tells you whether the answer is complete: <code>end_turn</code> is good, <code>max_tokens</code> means it was cut off. Third, <code>usage</code> is your bill: plug those two numbers into <code>call_cost</code> from section 07. Notice there is no <code>temperature</code> argument: on this model, effort and the prompt are the controls.</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Meaning</th></tr>
    <tr><td><code>model</code></td><td>Which LLM. Bigger models: smarter, slower, pricier.</td></tr>
    <tr><td><code>max_tokens</code></td><td>Ceiling on generated tokens. Hit it and <code>stop_reason</code> is <code>"max_tokens"</code> (answer cut off).</td></tr>
    <tr><td><code>system</code></td><td>Standing instructions: role, rules, tone.</td></tr>
    <tr><td><code>messages</code></td><td>The whole conversation, every call. The API is stateless; full shape in <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>.</td></tr>
    <tr><td><code>output_config.effort</code></td><td>How much thinking: the main quality/cost dial on reasoning models. Default on <code>claude-opus-5-5</code> is <code>medium</code>.</td></tr>
    <tr><td><code>stop_sequences</code></td><td>Strings that end generation early.</td></tr>
    <tr><td><code>usage</code></td><td>Input and output tokens actually billed.</td></tr>
  </table>

  <h2 id="lb-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: using a base model as a chatbot</span>
    <p>A base model continues text; it does not follow instructions. If an open model answers your question with more questions, check you downloaded the "-Instruct" or "-Chat" version and are using its chat template.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "temperature 0 means identical outputs"</span>
    <p>Floating-point order on GPUs can flip near-ties, so outputs can still differ. Design tests that check properties (valid JSON, correct label) rather than exact strings. And on current Claude models, temperature is not a parameter at all.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: budgeting by words</span>
    <p>4 characters per token is an English average. Hindi, code, numbers and JSON need more. Count with the real tokenizer before quoting a cost.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ignoring output length</span>
    <p>Output tokens are about 5× the price of input and set most of the latency. "Answer in 3 bullets" can cut cost and wait time more than switching models.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: believing the model "remembers"</span>
    <p>There is no memory between calls. If it seems to remember, your code resent the history. If something is outside the context window, it is gone.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: KV cache vs prompt caching</span>
    <p>KV cache: inside one generation, saves compute, costs GPU memory. Prompt caching: across API calls, saves money on a repeated prefix. Different layers, different purposes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: max effort everywhere</span>
    <p>High effort on simple, high-volume tasks multiplies output tokens for no accuracy gain. Use low effort or a smaller model for classification and extraction; save high effort for maths, code and agents.</p>
  </div>

  <h2 id="lb-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly does an LLM learn during pre-training, and why does it need no labels?</summary><div class="qa-body">It learns to predict the next token, minimising cross-entropy (−log p of the true token) over trillions of tokens. The text supplies its own labels: the target at each position is simply the next token. Facts, grammar and reasoning emerge because they make prediction easier.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The model gave the true next token probability 0.25. What is the loss at that position? What perplexity does an average loss of 0.786 mean?</summary><div class="qa-body">−ln(0.25) ≈ 1.386. Perplexity = e<sup>0.786</sup> ≈ 2.19: on average the model was as unsure as choosing between about 2 equally likely tokens.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a transformer know which text is the user's and which is the assistant's?</summary><div class="qa-body">A chat template turns the message list into one string with special role-marker tokens. The model learns what those markers mean during SFT. At chat time the string ends with the assistant marker, and next-token prediction produces the reply.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Logits are [2, 1, 0]. What happens to the distribution as T → 0 and as T → ∞?</summary><div class="qa-body">T → 0: all probability goes to the first token (greedy, [1, 0, 0]). T → ∞: logits/T → 0 for all, so it becomes uniform ([⅓, ⅓, ⅓]). The ranking never changes; only the sharpness does.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Top-k vs top-p: why is top-p usually preferred?</summary><div class="qa-body">Top-k keeps a fixed number of tokens. When the model is sure, k = 50 lets junk in; when unsure, it may cut good options. Top-p adapts: few tokens when the distribution is peaked, many when it is flat.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: probs are [0.585, 0.215, 0.130, 0.048, 0.018, 0.004]. Which tokens survive top_p = 0.9?</summary><div class="qa-body">The first three. Running totals: 0.585, 0.80, 0.93. 0.80 &lt; 0.9, so the third token is needed. The three are then renormalised to sum to 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the KV cache, and what does it cost? Estimate it for 32 layers, 8 KV heads, head dim 128, fp16, 8K tokens.</summary><div class="qa-body">It stores every past token's key and value vectors so each decode step only computes the new token's. Work drops from quadratic to linear (1,000 tokens: 500,500 → 1,000 K/V computations). It costs GPU memory: 2 × 32 × 8 × 128 × 2 bytes = 128 KiB per token, × 8192 = 1 GiB per sequence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do output tokens cost more and take longer than input tokens?</summary><div class="qa-body">Input is processed in one parallel prefill pass. Output is generated one token per forward pass, in sequence, each reading the growing KV cache. So output dominates latency, and providers price it about 5× higher.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Estimate the cost of 100,000 calls a day with 2,000 input and 500 output tokens on a $4 / $20 per million model.</summary><div class="qa-body">Per call: 2,000 × 4/1M + 500 × 20/1M = $0.008 + $0.010 = $0.018. Per day: $1,800. The 500 output tokens cost more than the 2,000 input tokens.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give three reasons LLMs hallucinate and one fix for each.</summary><div class="qa-body">(1) Trained for plausible text, not truth → ground answers in retrieved documents (RAG). (2) Knowledge cutoff / private data missing → give it tools to look things up. (3) Rewarded for guessing → explicitly allow "I don't know" and check with citations or evals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>By Chinchilla, how many tokens should a 70B model see? Why do labs train smaller models on far more?</summary><div class="qa-body">About 20 × 70B = 1.4T tokens for compute-optimal training. Labs over-train small models because inference cost is paid on every request forever; an 8B model on 15T tokens costs similar training compute to a Chinchilla-optimal 70B, but is far cheaper to serve.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A bank wants an internal assistant over customer PII that must never leave its data centre. Open or closed model?</summary><div class="qa-body">An open-weight model, self-hosted (possibly fine-tuned and quantized). Data residency is a named, hard reason. Trade-off: they take on GPU cost and serving ops, and may lose some frontier quality.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use a reasoning model or high effort?</summary><div class="qa-body">Simple, high-volume, latency-sensitive tasks: classification, extraction, short chat replies. Thinking tokens add cost and delay with little accuracy gain there. Use low effort or a smaller model; save high effort for maths, code and multi-step agent work.</div></details>
</main>`
});
