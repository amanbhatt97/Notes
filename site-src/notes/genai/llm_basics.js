// notes/genai/llm_basics.js — How LLMs Work
Object.assign(TOPIC_CONTENT, {
  "llm_basics": `<main>
  <h1>How LLMs Work</h1>
  <p class="lead">From <a class="xref" data-note="transformers">Transformers</a> you know the transformer decoder: tokens in, a vector per position out. This page turns that into a working LLM: how it is trained, how it picks each next word, and why it costs what it costs. Everything in <a class="xref" data-note="prompting">Prompt Engineering</a> and <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a> builds on these mechanics.</p>

  <h2 id="lb-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
  <div class="mm-center">How LLMs Work</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Pre-training</div>
      <ul>
        <li><b>Objective</b> — predict the next token on trillions of tokens</li>
        <li><b>Self-supervised</b> — the text labels itself; no humans</li>
        <li><b>Loss</b> — cross-entropy (surprise); perplexity = e<sup>loss</sup></li>
        <li><b>N tokens → N examples</b> in one pass (causal mask)</li>
        <li><b>Knowledge</b> — side effect of compressing text</li>
        <li>⚠ <b>Base model ≠ chatbot</b> — continues text, may answer with more questions</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Scaling laws</div>
      <ul>
        <li><b>Power law</b> — loss falls smoothly with params N, data D, compute C ≈ 6·N·D</li>
        <li><b>Kaplan 2020</b> — predictable; bigger = more sample-efficient</li>
        <li><b>Chinchilla 2022</b> — ~20 tokens/param: 70B → 1.4T tokens</li>
        <li><b>Practice</b> — over-train small models: cheaper to serve forever</li>
        <li>⚠ <b>Predicts loss, not skills</b>; "emergence" partly a metric artefact</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Three training stages</div>
      <ul>
        <li><b>1 Pre-train</b> → base model (knows a lot, follows nothing)</li>
        <li><b>2 SFT</b> — (instruction → answer) pairs → instruct model</li>
        <li><b>3 Preference</b> — RLHF / DPO on "A better than B" → helpful, safe</li>
        <li><b>Post-training</b> = stages 2 + 3 (details: <a class="xref" data-note="finetuning">Fine-Tuning</a>)</li>
        <li>💡 intern: read library → job training → feedback on taste</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Inference &amp; sampling</div>
      <ul>
        <li><b>Loop</b> — logits → softmax → pick → append → repeat (autoregressive)</li>
        <li><b>Greedy</b> (T = 0) — argmax; repeatable, dull, loops</li>
        <li><b>Temperature</b> — logits ÷ T; &lt;1 sharpens, &gt;1 flattens; ranking unchanged</li>
        <li><b>Top-k</b> — keep k tokens (fixed); <b>top-p</b> — smallest set ≥ p (adaptive)</li>
        <li><b>Prefill</b> parallel → TTFT; <b>decode</b> sequential → tokens/sec</li>
        <li>⚠ <b>T = 0 not deterministic</b> (GPU float order); claude-opus-5-5 has no temperature/top_p/top_k → use <code>effort</code></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Context &amp; KV cache</div>
      <ul>
        <li><b>Context window</b> — max prompt + output tokens (~128K–1M)</li>
        <li><b>No hidden memory</b> — outside the window = doesn't exist</li>
        <li>⚠ <b>Lost in the middle</b> — buried facts get missed</li>
        <li><b>KV cache</b> — store past K, V; compute only the new token</li>
        <li><b>Memory</b> — 2 × layers × KV heads × head dim × bytes: 128 KiB/token, ~1 GiB per 8K seq</li>
        <li><b>Fixes</b> — grouped-query attention, cache quantization</li>
        <li>⚠ <b>≠ prompt caching</b> (API-level, across calls; 05)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Hallucinations</div>
      <ul>
        <li><b>Definition</b> — fluent, confident, false/unsupported</li>
        <li><b>Causes</b> — plausibility objective, lossy rare facts, cutoff, rewarded guessing, unlucky sample</li>
        <li><b>Fixes</b> — ground (RAG 07), tools (05/08), allow "unknown" (04), check/cite (13)</li>
        <li>💡 student bluffing in an oral exam</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Tokens = cost &amp; latency</div>
      <ul>
        <li><b>Token</b> ≈ 4 chars / ¾ word in English; code, numbers, non-English cost more</li>
        <li><b>Output ≈ 5× input</b> price (sequential passes)</li>
        <li><b>Latency</b> ≈ TTFT + output tokens ÷ tokens/sec</li>
        <li><b>Example</b> — 2,000 in + 500 out at $4/$20 per 1M = $0.018</li>
        <li><b>Thinking tokens</b> billed as output</li>
        <li>⚠ <b>Count with the tokenizer</b>, not words</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Open vs closed</div>
      <ul>
        <li><b>Closed API</b> — Claude, GPT, Gemini: frontier, pay per token, zero infra</li>
        <li><b>Open-weight</b> — Llama, Mistral, Qwen, DeepSeek: data stays, full fine-tune, you run GPUs</li>
        <li><b>Rule</b> — prototype closed; switch for a named reason (residency, volume, offline)</li>
        <li>⚠ <b>Open-weight ≠ open source</b> — no data/code, licence limits</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Reasoning models</div>
      <ul>
        <li><b>What</b> — long chain of thought before answering; RL on checkable tasks</li>
        <li><b>Why</b> — test-time compute: more tokens = more thinking</li>
        <li><b>Claude</b> — adaptive thinking; depth via <code>output_config={"effort": ...}</code></li>
        <li><b>Skip for</b> — classification, extraction, short chat</li>
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
      <div class="rm-item rm-done" data-target="lb-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="lb-pretrain"><span class="num">01</span>Pre-training: Next-Token Prediction</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pre-training</strong> = train a decoder transformer to predict the next token on trillions of tokens of text. That single objective is the whole recipe.</p>
  </div>
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
    </svg><figcaption>The text is its own answer key: one 5-token sequence = 5 next-token examples (causal mask: each sees only its left), no human labels.</figcaption></figure>
  <div class="flow"><span>"The cat sat on the"</span><span>Transformer</span><span>Probabilities over vocab</span><span>Loss = −log p("mat")</span><span>Backprop</span></div>
  <ul>
    <li><strong>Self-supervised</strong>: labels come from the data, so it scales to the whole internet.</li>
    <li>Loss = <strong>cross-entropy</strong> (how surprised by the real next token). Perplexity = e<sup>loss</sup>.</li>
    <li>Predicting well forces grammar, facts, code and some reasoning: knowledge is a side effect of compression.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Phone autocomplete that has read the entire library. It is brilliant at continuing text. It breaks as an analogy because the model also learns facts and skills deep enough to solve new problems.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A pre-trained (<strong>base</strong>) model is not a chatbot. Ask it "What is the capital of France?" and it may continue with more quiz questions. Following instructions comes from later stages.</p>
  </div>

  <h2 id="lb-scale"><span class="num">02</span>Scaling Laws</h2>
  <p><strong>Scaling laws</strong>: loss falls as a smooth power law in parameters (N), tokens (D) and compute (C ≈ 6·N·D FLOPs), so labs predict a big run from small ones.</p>
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
  <p>A chat assistant is built in three stages. Stages 2 and 3 are called <strong>post-training</strong>. Their details (LoRA, RLHF, DPO) live in <a class="xref" data-note="finetuning">Fine-Tuning</a>.</p>
  <div class="cards">
    <div><b>1 · Pre-training</b><p>Next-token prediction on trillions of tokens. Output: a <strong>base</strong> model that knows a lot and follows nothing.</p><small>$ millions · weeks to months · done by labs</small></div>
    <div><b>2 · SFT / instruction tuning</b><p>Supervised fine-tuning on (instruction → good answer) pairs. Output: an <strong>instruct</strong> model that answers questions.</p><small>Thousands to millions of examples</small></div>
    <div><b>3 · Preference tuning</b><p>RLHF or DPO on "answer A is better than B" pairs. Output: helpful, honest, safe, on-tone.</p><small>Also RL on verifiable tasks for reasoning models</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Raising an intern. Pre-training: they read the whole library. SFT: job training with worked examples. Preference tuning: feedback on which of two answers is better, until they learn good taste.</p>
  </div>
  <div class="callout intu"><span class="label">Why "pre"?</span>
    <p>Position, not importance: pre-training creates the model; post-training shapes its behaviour.</p>
  </div>

  <h2 id="lb-infer"><span class="num">04</span>Inference: Logits → Sampling</h2>
  <p>Generation is a loop: output one token, append it, run again (<strong>autoregressive</strong>). It stops at an end-of-sequence token or <code>max_tokens</code>.</p>
  <div class="flow"><span>Prompt tokens</span><span>Forward pass</span><span>Logits: raw score per vocab token (100k+)</span><span>Softmax → probs</span><span>Pick a token</span><span>Append &amp; repeat</span></div>
  <h3>The sampling knobs</h3>
  <table class="tbl">
    <tr><th>Knob</th><th>What it does</th><th>Effect</th></tr>
    <tr><td><strong>Greedy</strong> (T = 0)</td><td>Always take the top token</td><td>Repeatable, but dull and prone to loops</td></tr>
    <tr><td><strong>Temperature T</strong></td><td>Divide logits by T before softmax</td><td>T &lt; 1 sharpens (safer); T &gt; 1 flattens (more varied, more errors)</td></tr>
    <tr><td><strong>Top-k</strong></td><td>Keep only the k most likely tokens</td><td>Cuts the long tail; k is fixed regardless of confidence</td></tr>
    <tr><td><strong>Top-p</strong> (nucleus)</td><td>Keep the smallest set whose probs sum to ≥ p</td><td>Adaptive: few tokens when confident, many when unsure</td></tr>
  </table>
  <p>Logits for "The cat sat on the ___" at three temperatures (real output, code in Build It):</p>
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
    </svg><figcaption>Same logits, three temperatures (real numbers from Build It). Low T piles mass on "mat"; high T feeds the tail.</figcaption></figure>
  <table class="tbl out"><caption>Result: softmax(logits / T)</caption>
    <tr><th>T</th><th>mat</th><th>floor</th><th>sofa</th><th>roof</th><th>moon</th><th>banana</th></tr>
    <tr><td>0.5</td><td>0.838</td><td>0.113</td><td>0.042</td><td>0.006</td><td>0.001</td><td>0.000</td></tr>
    <tr><td>1.0</td><td>0.585</td><td>0.215</td><td>0.130</td><td>0.048</td><td>0.018</td><td>0.004</td></tr>
    <tr><td>2.0</td><td>0.381</td><td>0.231</td><td>0.180</td><td>0.109</td><td>0.066</td><td>0.031</td></tr>
  </table>
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
    </svg><figcaption>T = 1 probabilities with running totals (Σ). Top-p stops once Σ ≥ 0.9 (3 tokens here); top-k=2 always keeps exactly two. Survivors are renormalised.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Temperature is a "boldness" dial on a nervous speaker. Low: always says the safest word. High: sometimes says "banana". Top-p is a rule: "only consider words that together cover 90% of your confidence".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Temperature 0 is not perfectly deterministic in production. Batched GPU maths and floating-point ordering can flip near-ties. Also, current Claude models (incl. <code>claude-opus-5-5</code>) don't accept <code>temperature</code>, <code>top_p</code> or <code>top_k</code> at all. You steer them with prompts and <code>effort</code>. Open models and many other APIs still expose these knobs.</p>
  </div>
  <h3>Prefill vs decode</h3>
  <table class="tbl">
    <tr><th>Phase</th><th>How</th><th>Sets</th></tr>
    <tr><td><strong>Prefill</strong></td><td>Whole prompt in one parallel pass</td><td><strong>Time-to-first-token</strong> (TTFT)</td></tr>
    <tr><td><strong>Decode</strong></td><td>One pass per output token</td><td><strong>Tokens per second</strong></td></tr>
  </table>
  <p>1,000 extra prompt tokens cost little time; 1,000 extra output tokens cost a lot.</p>

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
  <p>Each decode step attends to every earlier token's <strong>K</strong> and <strong>V</strong>. They never change, so compute once and store.</p>
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
    </svg><figcaption>Decode step 6: reuse k1–v5 from the cache. *Llama-3-8B-style, fp16; ≈ 1 GiB per 8K-token sequence.</figcaption></figure>
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
    <p>The KV cache lives inside one generation on the server. <strong>Prompt caching</strong> (reusing a processed prefix across API calls) is a different, API-level feature, covered in <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>.</p>
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
    <tr><td>Ground it</td><td>Put the facts in the prompt (retrieval)</td><td><a class="xref" data-note="rag">Retrieval-Augmented Generation</a></td></tr>
    <tr><td>Let it look things up</td><td>Tools: search, DB, calculator</td><td>05, 08</td></tr>
    <tr><td>Give it an out</td><td>"If the context doesn't say, answer 'unknown'"</td><td><a class="xref" data-note="prompting">Prompt Engineering</a></td></tr>
    <tr><td>Check it</td><td>Citations, verification step, evals</td><td><a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a></td></tr>
  </table>

  <h2 id="lb-cost"><span class="num">07</span>Tokens = Cost &amp; Latency</h2>
  <p>APIs bill per token, separately for input and output. A <strong>token</strong> is a sub-word piece (<a class="xref" data-note="transformers">Transformers</a>): roughly 4 characters or ¾ of a word in English. Code, numbers and non-English text use more.</p>
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
  <p>A <strong>reasoning model</strong> writes a long chain of thought before answering, trained by reinforcement learning on checkable tasks (maths, code, logic). One forward pass per token is fixed compute; thinking tokens add compute <em>at answer time</em> (test-time compute).</p>
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
  <table class="tbl">
    <tr><th>Parameter</th><th>Meaning</th></tr>
    <tr><td><code>model</code></td><td>Which LLM. Bigger models: smarter, slower, pricier.</td></tr>
    <tr><td><code>max_tokens</code></td><td>Ceiling on generated tokens. Hit it and <code>stop_reason</code> is <code>"max_tokens"</code> (answer cut off).</td></tr>
    <tr><td><code>system</code></td><td>Standing instructions: role, rules, tone (04).</td></tr>
    <tr><td><code>messages</code></td><td>The whole conversation, every call. The API is stateless; full shape in <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>.</td></tr>
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

  <h2 id="lb-qa"><span class="num">11</span>Questions &amp; Answers</h2>
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
