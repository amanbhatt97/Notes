// notes/genai/llm_basics.js — How LLMs Work
Object.assign(TOPIC_CONTENT, {
  "llm_basics": `<main>
  <h1>How LLMs Work</h1>
  <p class="lead">From note 02 you know the transformer decoder: tokens in, a vector per position out. This page turns that into a working LLM: how it is trained, how it picks each next word, and why it costs what it costs. Everything in 04 · Prompt Engineering and 05 · LLM APIs builds on these mechanics.</p>

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
      <div class="rm-item rm-done" data-target="lb-rev"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">The page in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="lb-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="lb-pretrain"><span class="num">01</span>Pre-training: Next-Token Prediction</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pre-training</strong> = train a decoder transformer to predict the next token on trillions of tokens of text. That single objective is the whole recipe.</p>
  </div>
  <p>It needs no human labels. The text labels itself: every position's "answer" is simply the next token. This is <strong>self-supervised</strong> learning (labels come from the data itself), which is why it scales to the whole internet.</p>
  <div class="flow"><span>"The cat sat on the"</span><span>Transformer</span><span>Probabilities over vocab</span><span>Loss = −log p("mat")</span><span>Backprop</span></div>
  <ul>
    <li>One sequence of N tokens gives N training examples at once, thanks to the causal mask (note 02).</li>
    <li>Loss is <strong>cross-entropy</strong>: how surprised the model was by the real next token. Perplexity = e<sup>loss</sup>.</li>
    <li>To predict well, the model must absorb grammar, facts, code, and some reasoning. Knowledge is a side effect of compression.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Phone autocomplete that has read the entire library. It is brilliant at continuing text. It breaks as an analogy because the model also learns facts and skills deep enough to solve new problems.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A pre-trained (<strong>base</strong>) model is not a chatbot. Ask it "What is the capital of France?" and it may continue with more quiz questions. Following instructions comes from later stages.</p>
  </div>

  <h2 id="lb-scale"><span class="num">02</span>Scaling Laws</h2>
  <p><strong>Scaling laws</strong>: test loss falls smoothly, as a power law, when you increase parameters (N), training tokens (D) and compute (C ≈ 6·N·D FLOPs).</p>
  <p>They let labs predict a big model's loss from small runs before spending millions.</p>
  <table class="tbl">
    <tr><th>Finding</th><th>What it says</th></tr>
    <tr><td><strong>Kaplan et al. (2020)</strong></td><td>Loss improves predictably with N, D, C. Bigger models are more sample-efficient.</td></tr>
    <tr><td><strong>Chinchilla (2022)</strong></td><td>For a fixed compute budget, grow params and data together: about <strong>20 tokens per parameter</strong>. A 70B model "wants" ~1.4T tokens.</td></tr>
    <tr><td><strong>Practice today</strong></td><td>Labs <em>over-train</em> smaller models far past 20 tokens/param, because a small model is cheaper to serve forever.</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Chinchilla-optimal minimises <em>training</em> cost. Real products care about training + <em>inference</em> cost, so smaller-but-longer-trained models often win.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Scaling laws predict loss, not specific skills. "Emergent abilities" that seem to switch on at a size are partly an artefact of all-or-nothing metrics.</p>
  </div>

  <h2 id="lb-stages"><span class="num">03</span>The Three Training Stages</h2>
  <p>A chat assistant is built in three stages. Stages 2 and 3 are called <strong>post-training</strong>. Their details (LoRA, RLHF, DPO) live in 15 · Fine-Tuning.</p>
  <div class="cards">
    <div><b>1 · Pre-training</b><p>Next-token prediction on trillions of tokens. Output: a <strong>base</strong> model that knows a lot and follows nothing.</p><small>$ millions · weeks to months · done by labs</small></div>
    <div><b>2 · SFT / instruction tuning</b><p>Supervised fine-tuning on (instruction → good answer) pairs. Output: an <strong>instruct</strong> model that answers questions.</p><small>Thousands to millions of examples</small></div>
    <div><b>3 · Preference tuning</b><p>RLHF or DPO on "answer A is better than B" pairs. Output: helpful, honest, safe, on-tone.</p><small>Also RL on verifiable tasks for reasoning models</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Raising an intern. Pre-training: they read the whole library. SFT: job training with worked examples. Preference tuning: feedback on which of two answers is better, until they learn good taste.</p>
  </div>
  <div class="callout intu"><span class="label">Why "pre"?</span>
    <p>"Pre-" marks position, not importance. It is the huge foundational training that comes before customisation. Pre-training creates the model; post-training shapes its behaviour.</p>
  </div>

  <h2 id="lb-infer"><span class="num">04</span>Inference: Logits → Sampling</h2>
  <p>Generation is a loop. The model outputs one token, appends it, and runs again. This is <strong>autoregressive</strong> decoding (each output becomes the next input).</p>
  <div class="flow"><span>Prompt tokens</span><span>Forward pass</span><span>Logits (one per vocab token)</span><span>Softmax → probs</span><span>Pick a token</span><span>Append &amp; repeat</span></div>
  <ul>
    <li><strong>Logits</strong>: raw, unnormalised scores, one per vocabulary entry (often 100k+).</li>
    <li><strong>Softmax</strong> turns logits into probabilities that sum to 1.</li>
    <li>The <strong>decoding strategy</strong> picks a token from those probabilities. It stops at an end-of-sequence token or <code>max_tokens</code>.</li>
  </ul>
  <h3>The sampling knobs</h3>
  <table class="tbl">
    <tr><th>Knob</th><th>What it does</th><th>Effect</th></tr>
    <tr><td><strong>Greedy</strong> (T = 0)</td><td>Always take the top token</td><td>Repeatable, but dull and prone to loops</td></tr>
    <tr><td><strong>Temperature T</strong></td><td>Divide logits by T before softmax</td><td>T &lt; 1 sharpens (safer); T &gt; 1 flattens (more varied, more errors)</td></tr>
    <tr><td><strong>Top-k</strong></td><td>Keep only the k most likely tokens</td><td>Cuts the long tail; k is fixed regardless of confidence</td></tr>
    <tr><td><strong>Top-p</strong> (nucleus)</td><td>Keep the smallest set whose probs sum to ≥ p</td><td>Adaptive: few tokens when confident, many when unsure</td></tr>
  </table>
  <p>Example: logits for "The cat sat on the ___" at three temperatures (real output, code in Build It):</p>
  <table class="tbl out"><caption>Result: softmax(logits / T)</caption>
    <tr><th>T</th><th>mat</th><th>floor</th><th>sofa</th><th>roof</th><th>moon</th><th>banana</th></tr>
    <tr><td>0.5</td><td>0.838</td><td>0.113</td><td>0.042</td><td>0.006</td><td>0.001</td><td>0.000</td></tr>
    <tr><td>1.0</td><td>0.585</td><td>0.215</td><td>0.130</td><td>0.048</td><td>0.018</td><td>0.004</td></tr>
    <tr><td>2.0</td><td>0.381</td><td>0.231</td><td>0.180</td><td>0.109</td><td>0.066</td><td>0.031</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Temperature is a "boldness" dial on a nervous speaker. Low: always says the safest word. High: sometimes says "banana". Top-p is a rule: "only consider words that together cover 90% of your confidence".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Temperature 0 is not perfectly deterministic in production. Batched GPU maths and floating-point ordering can flip near-ties. Also, current Claude models (incl. <code>claude-opus-5-5</code>) don't accept <code>temperature</code>, <code>top_p</code> or <code>top_k</code> at all. You steer them with prompts and <code>effort</code>. Open models and many other APIs still expose these knobs.</p>
  </div>
  <h3>Prefill vs decode</h3>
  <ul>
    <li><strong>Prefill</strong>: the whole prompt is processed in one parallel pass. It sets <strong>time-to-first-token</strong> (TTFT).</li>
    <li><strong>Decode</strong>: output tokens come one at a time, each needing a pass. It sets <strong>tokens per second</strong>.</li>
  </ul>
  <p>So 1,000 extra prompt tokens cost little time; 1,000 extra output tokens cost a lot.</p>

  <h2 id="lb-ctx"><span class="num">05</span>Context Window &amp; KV Cache</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Context window</strong> = the maximum number of tokens (prompt + output) the model can attend to in one call. Current frontier models range from ~128K to 1M tokens.</p>
  </div>
  <ul>
    <li>Anything outside the window does not exist for the model. There is no hidden memory between calls.</li>
    <li>Attention cost grows with length squared, so long contexts are slower and pricier.</li>
    <li>Quality can drop for facts buried in the middle of very long inputs ("lost in the middle").</li>
  </ul>
  <h3>KV cache</h3>
  <p>At each decode step, the new token attends to every earlier token's <strong>K</strong> (key) and <strong>V</strong> (value) vectors. Those never change, so compute them once and store them.</p>
  <table class="tbl">
    <tr><th></th><th>Without KV cache</th><th>With KV cache</th></tr>
    <tr><td>Generating token 100</td><td>Recompute K, V for tokens 1–99, then 100</td><td>Load 1–99 from cache; compute only token 100</td></tr>
    <tr><td>Work per step</td><td>Grows with length (total ≈ quadratic)</td><td>One token's worth of new K, V</td></tr>
    <tr><td>Cost</td><td>Compute</td><td><strong>GPU memory</strong></td></tr>
  </table>
  <p>Memory per token = 2 (K and V) × layers × KV heads × head dim × bytes. For a Llama-3-8B-style model (32 layers, 8 KV heads, head dim 128, fp16):</p>
  <div class="fx" data-lang="py">per_token = 2 * 32 * 8 * 128 * 2      # = 131,072 bytes = 128 KiB
per_8k_seq = per_token * 8192           # = 1 GiB for ONE 8K-token conversation</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The KV cache trades memory for speed. It is why serving long contexts to many users is memory-bound, and why tricks like grouped-query attention (fewer KV heads) and cache quantization exist.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The KV cache lives inside one generation on the server. <strong>Prompt caching</strong> (reusing a processed prefix across API calls) is a different, API-level feature, covered in 05 · LLM APIs.</p>
  </div>

  <h2 id="lb-hall"><span class="num">06</span>Why Hallucinations Happen</h2>
  <p>A <strong>hallucination</strong> is fluent, confident output that is false or unsupported. It follows directly from how LLMs are built.</p>
  <ul>
    <li><strong>The objective is plausibility.</strong> Pre-training rewards a likely continuation, not a true one.</li>
    <li><strong>Knowledge is lossy.</strong> Rare facts (a minor paper's author, an exact figure) are stored weakly, so the model blends similar ones.</li>
    <li><strong>Knowledge cutoff.</strong> Nothing after the training data, and nothing private.</li>
    <li><strong>Training rewards guessing.</strong> Benchmarks score "I don't know" as wrong, so guessing scores higher.</li>
    <li><strong>Sampling.</strong> One unlucky low-probability token can send the rest down a wrong path.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A student bluffing in an oral exam. They know the topic's shape, so the answer sounds right. Asking for sources or letting them say "I'm not sure" exposes the bluff.</p>
  </div>
  <table class="tbl">
    <tr><th>Fix</th><th>How</th><th>Where</th></tr>
    <tr><td>Ground it</td><td>Put the facts in the prompt (retrieval)</td><td>07 · RAG</td></tr>
    <tr><td>Let it look things up</td><td>Tools: search, DB, calculator</td><td>05, 08</td></tr>
    <tr><td>Give it an out</td><td>"If the context doesn't say, answer 'unknown'"</td><td>04 · Prompting</td></tr>
    <tr><td>Check it</td><td>Citations, verification step, evals</td><td>13 · Evals</td></tr>
  </table>

  <h2 id="lb-cost"><span class="num">07</span>Tokens = Cost &amp; Latency</h2>
  <p>APIs bill per token, separately for input and output. A <strong>token</strong> is a sub-word piece (note 02): roughly 4 characters or ¾ of a word in English. Code, numbers and non-English text use more.</p>
  <ul>
    <li><strong>Output costs ~5× input</strong> per token, because each output token needs its own sequential pass.</li>
    <li><strong>Latency</strong> ≈ TTFT + output tokens ÷ tokens-per-second. Long answers are slow answers.</li>
    <li><strong>Thinking tokens</strong> of reasoning models are billed as output.</li>
  </ul>
  <p>Example with <code>claude-opus-5-5</code> at $4 / $20 per 1M input / output tokens:</p>
  <div class="fx" data-lang="py">per_call = 2000 * 4 / 1e6 + 500 * 20 / 1e6   # 0.008 + 0.010 = $0.018
per_day  = per_call * 100_000                  # $1,800 per day at 100k calls</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Estimating cost from words or characters. Count tokens with the provider's tokenizer or token-counting endpoint (05). Different model families tokenize the same text differently.</p>
  </div>

  <h2 id="lb-land"><span class="num">08</span>Open vs Closed Models</h2>
  <div class="cards">
    <div><b>Closed (API)</b><p>You call a hosted model; weights are secret. Strongest frontier quality, zero infra.</p><small>Claude, GPT, Gemini</small></div>
    <div><b>Open-weight</b><p>You download weights and run them anywhere; you can fine-tune freely.</p><small>Llama, Mistral, Qwen, DeepSeek, Gemma</small></div>
  </div>
  <table class="tbl">
    <tr><th></th><th>Closed API</th><th>Open-weight, self-hosted</th></tr>
    <tr><td>Quality</td><td>Usually the frontier</td><td>Close behind; great for narrower tasks</td></tr>
    <tr><td>Cost model</td><td>Pay per token</td><td>Pay for GPUs, whether busy or idle</td></tr>
    <tr><td>Data control</td><td>Data goes to the provider (with contracts)</td><td>Never leaves your servers</td></tr>
    <tr><td>Customisation</td><td>Prompting, some fine-tuning</td><td>Full fine-tuning, quantization (15)</td></tr>
    <tr><td>Ops burden</td><td>None</td><td>Serving, scaling, monitoring (14)</td></tr>
  </table>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Prototype on a closed API to learn what quality is possible. Move to open weights for a named reason: strict data residency, very high volume of a narrow task, or offline use.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Open-weight" is not "open source". You get weights, usually not the training data or code, and licences can restrict commercial use.</p>
  </div>

  <h2 id="lb-reason"><span class="num">09</span>Reasoning ("Thinking") Models</h2>
  <p>A <strong>reasoning model</strong> writes a long internal chain of thought before its final answer. It is trained for this with reinforcement learning on tasks whose answers can be checked (maths, code, logic).</p>
  <p>The problem it solves: one forward pass per token is a fixed amount of compute. Hard problems need more. Thinking tokens are extra compute spent <em>at answer time</em> (test-time compute).</p>
  <div class="flow"><span>Question</span><span>Thinking tokens (hidden or summarised)</span><span>Final answer</span></div>
  <ul>
    <li><strong>Gain</strong>: big jumps on maths, coding, planning and multi-step agent tasks.</li>
    <li><strong>Cost</strong>: more output tokens, so more latency and money. Overkill for "classify this sentence".</li>
    <li><strong>Control</strong>: on Claude, thinking is adaptive (the model decides how much) and you set depth with <code>output_config={"effort": ...}</code>. On <code>claude-opus-5-5</code> thinking is always on; lower effort for simple tasks.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Answering on the spot vs using scrap paper. Scrap paper costs time but catches mistakes on hard questions. For "what is 2+2" it is wasted effort.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Prompting a model to "think step by step" (chain-of-thought, 04) is a prompt trick. A reasoning model is trained to do it natively. They are related but not the same.</p>
  </div>

  <h2 id="lb-build"><span class="num">10</span>Build It: A Sampler + One API Call</h2>
  <h3>Part 1: sampling from logits in numpy</h3>
  <p>Runs offline, no tokenizer needed. Same six-word vocabulary as above.</p>
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

for t in [0.5, 1.0, 2.0]:
    print(f"T={t}:", np.round(softmax(logits / t), 3))

rng = np.random.default_rng(0)
for name, kw in [("greedy", dict(temperature=0)),
                 ("T=1.0", dict(temperature=1.0)),
                 ("T=2.0", dict(temperature=2.0)),
                 ("T=1, top_k=2", dict(temperature=1.0, top_k=2)),
                 ("T=1, top_p=0.9", dict(temperature=1.0, top_p=0.9))]:
    picks = [vocab[sample(logits, rng=rng, **kw)] for _ in range(1000)]
    counts = {w: picks.count(w) for w in vocab if picks.count(w)}
    print(f"{name:15s}", counts)</div>
  <table class="tbl out"><caption>Result: 1,000 samples per strategy (seed 0)</caption>
    <tr><th>Strategy</th><th>mat</th><th>floor</th><th>sofa</th><th>roof</th><th>moon</th><th>banana</th></tr>
    <tr><td>greedy</td><td>1000</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>T=1.0</td><td>563</td><td>225</td><td>144</td><td>45</td><td>20</td><td>3</td></tr>
    <tr><td>T=2.0</td><td>425</td><td>216</td><td>156</td><td>101</td><td>66</td><td>36</td></tr>
    <tr><td>T=1, top_k=2</td><td>743</td><td>257</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>T=1, top_p=0.9</td><td>632</td><td>245</td><td>123</td><td>0</td><td>0</td><td>0</td></tr>
  </table>
  <ul>
    <li>Higher T moves samples into the tail ("banana" 3 → 36).</li>
    <li>Top-p 0.9 kept three tokens: 0.585 + 0.215 = 0.80 is short of 0.9, so "sofa" joins (0.93).</li>
    <li>After filtering, probabilities are renormalised, so "mat" rises from 0.585 to ~0.63 (top-p) or ~0.73 (top-k).</li>
  </ul>
  <h3>Part 2: one real call with the Anthropic SDK</h3>
  <p><code>pip install anthropic</code>, set <code>ANTHROPIC_API_KEY</code>. Other providers (OpenAI etc.) follow the same shape: model, messages, max tokens.</p>
  <div class="fx" data-lang="py">import anthropic

client = anthropic.Anthropic()            # API key comes from ANTHROPIC_API_KEY

response = client.messages.create(
    model="claude-opus-5-5",              # which model
    max_tokens=1024,                      # hard cap on OUTPUT tokens (thinking + text)
    system="You are a concise ML tutor.", # standing instructions (note 04)
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
  <table class="tbl">
    <tr><th>Parameter</th><th>Meaning</th></tr>
    <tr><td><code>model</code></td><td>Which LLM. Bigger models: smarter, slower, pricier.</td></tr>
    <tr><td><code>max_tokens</code></td><td>Ceiling on generated tokens. Hit it and <code>stop_reason</code> is <code>"max_tokens"</code> (answer cut off).</td></tr>
    <tr><td><code>system</code></td><td>Standing instructions: role, rules, tone (04).</td></tr>
    <tr><td><code>messages</code></td><td>The whole conversation, every call. The API is stateless; full shape in 05.</td></tr>
    <tr><td><code>output_config.effort</code></td><td>How much thinking: the main quality/cost dial on reasoning models. Default on this model is <code>medium</code>.</td></tr>
    <tr><td><code>stop_sequences</code></td><td>Strings that end generation early.</td></tr>
    <tr><td><code>usage</code></td><td>Input and output tokens actually billed.</td></tr>
  </table>
  <p><em>Example output (will vary):</em></p>
  <div class="fx">The KV cache stores each past token's key and value vectors so that, when
generating the next token, the model only computes them for the new token.
This turns repeated recomputation into a lookup, trading GPU memory for speed.
end_turn
27 64</div>

  <h2 id="lb-rev"><span class="num">11</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Pre-training:</strong> self-supervised next-token prediction, cross-entropy loss, trillions of tokens → base model.</li>
    <li><strong>Scaling laws:</strong> loss falls as a power law in params, data, compute; Chinchilla ≈ 20 tokens per param.</li>
    <li><strong>Stages:</strong> pre-train → SFT (follow instructions) → RLHF/DPO (preferences). Base ≠ chat model.</li>
    <li><strong>Decoding:</strong> logits → softmax → pick → append → repeat (autoregressive).</li>
    <li><strong>Temperature</strong> rescales logits; <strong>top-k</strong> keeps k tokens; <strong>top-p</strong> keeps the smallest set covering p.</li>
    <li><strong>Prefill</strong> is parallel (TTFT); <strong>decode</strong> is sequential (tokens/sec).</li>
    <li><strong>KV cache:</strong> store past K, V; faster decode, costs GPU memory per token.</li>
    <li><strong>Hallucination:</strong> trained for plausibility, lossy memory, cutoff; fix with grounding, tools, an "unknown" option.</li>
    <li><strong>Cost:</strong> per-token, output ~5× input; latency driven by output length.</li>
    <li><strong>Reasoning models:</strong> spend thinking tokens at test time; tune with effort.</li>
  </ol></div>

  <h2 id="lb-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly does an LLM learn during pre-training, and why does it need no labels?</summary><div class="qa-body">It learns to predict the next token, minimising cross-entropy over trillions of tokens. The text supplies its own labels: the target at each position is the next token. Facts, grammar and reasoning emerge because they make prediction easier.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You ask a base model "What's the capital of France?" and it replies with three more questions. Why?</summary><div class="qa-body">A base model only continues text. A list of quiz questions is a plausible continuation. Following instructions comes from SFT and preference tuning, which produce the instruct/chat model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Logits are [2, 1, 0]. What happens to the distribution as T → 0 and as T → ∞?</summary><div class="qa-body">T → 0: all probability goes to the first token (greedy, [1, 0, 0]). T → ∞: logits/T → 0 for all, so it becomes uniform ([⅓, ⅓, ⅓]). Ranking never changes; only sharpness does.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Top-k vs top-p: why is top-p usually preferred?</summary><div class="qa-body">Top-k keeps a fixed number of tokens. When the model is sure, k=50 lets junk in; when unsure, it may cut good options. Top-p adapts: it keeps few tokens when the distribution is peaked and many when it is flat.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: probs are [0.585, 0.215, 0.130, 0.048, 0.018, 0.004]. Which tokens survive top_p = 0.9?</summary><div class="qa-body">The first three. Cumulative: 0.585, 0.80, 0.93. 0.80 &lt; 0.9, so the third token is needed to reach 0.9. Then the three are renormalised to sum to 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can temperature 0 still give different outputs on the same prompt?</summary><div class="qa-body">GPU floating-point sums depend on batch composition and kernel order, so near-tied logits can flip. One flipped token changes everything after it. Some APIs also don't expose temperature at all.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the KV cache, and what does it cost? Estimate it for 32 layers, 8 KV heads, head dim 128, fp16, 8K tokens.</summary><div class="qa-body">It stores every past token's key and value vectors so each decode step only computes the new token's. It costs GPU memory: 2 × 32 × 8 × 128 × 2 bytes = 128 KiB per token, × 8192 ≈ 1 GiB per sequence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do output tokens cost more and take longer than input tokens?</summary><div class="qa-body">Input is processed in one parallel prefill pass. Output is generated one token per forward pass, sequentially, and each reads the growing KV cache. So output dominates latency, and providers price it ~5× higher.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give three reasons LLMs hallucinate and one fix for each.</summary><div class="qa-body">(1) Trained for plausible text, not truth → ground answers in retrieved documents (RAG). (2) Knowledge cutoff / private data missing → give it tools to look things up. (3) Rewarded for guessing → explicitly allow "I don't know" and check with citations or evals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>By Chinchilla, how many tokens should a 70B model see? Why do labs train smaller models on far more?</summary><div class="qa-body">About 20 × 70B = 1.4T tokens for compute-optimal training. Labs over-train small models because inference cost is paid on every request forever; a smaller, longer-trained model is cheaper to serve at similar quality.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A bank wants an internal assistant over customer PII that must never leave its data centre. Open or closed model?</summary><div class="qa-body">An open-weight model, self-hosted (possibly fine-tuned and quantized). Data residency is a named, hard reason. Trade-off: they take on GPU cost and serving ops, and may lose some frontier quality.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use a reasoning model or high effort?</summary><div class="qa-body">Simple, high-volume, latency-sensitive tasks: classification, extraction, short chat replies. Thinking tokens add cost and delay with little accuracy gain there. Use low effort or a smaller model; save high effort for maths, code and multi-step agent work.</div></details>
</main>`
});
