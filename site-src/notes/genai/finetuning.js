// notes/genai/finetuning.js — Fine-Tuning
Object.assign(TOPIC_CONTENT, {
  "finetuning": `<main>
  <h1>Fine-Tuning</h1>
  <p class="lead">How to change a model's <em>behaviour</em> by training it on your own examples, and how to do it on one GPU with LoRA and QLoRA. You need the training stages from <a class="xref" data-note="llm_basics">How LLMs Work</a> and the RAG pipeline from 07. This is the last stage before the capstone: it tells you when to customise a model, and when not to.</p>

  <h2 id="ft-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Fine-Tuning</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Prompt, RAG or fine-tune?</div>
        <ul>
          <li><b>Fine-tuning</b> — keep training on your examples → default behaviour changes</li>
          <li><b>Ladder</b> — prompt → RAG → fine-tune → pre-train; each rung ~10–100× cost</li>
          <li><b>FT changes how, RAG changes what</b> — facts → RAG; style/format/narrow skill → FT</li>
          <li><b>Tell-tale</b> — prompts keep growing and it still drifts = behaviour gap</li>
          <li>💡 new employee: instructions · reference binder · training course · raising from birth</li>
          <li>⚠ <b>FT to teach facts</b> — unreliable, frozen; use RAG (often both)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Where it fits</div>
        <ul>
          <li><b>Pre-train</b> → BASE (autocomplete) → <b>SFT</b> → INSTRUCT → <b>RLHF/DPO</b> → CHAT</li>
          <li><b>Post-training</b> = stages 2 + 3; you run 2, sometimes 3</li>
          <li><b>Instruction tuning</b> — many tasks (FLAN, Alpaca); labs do it</li>
          <li><b>Task fine-tuning</b> — one narrow task; you do it</li>
          <li>⚠ <b>Base vs Instruct</b> — start from <code>-Instruct</code> for chat tasks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SFT &amp; data</div>
        <ul>
          <li><b>SFT</b> — (input, ideal output) pairs, next-token loss</li>
          <li><b>Loss on response tokens only</b> — prompt masked</li>
          <li><b>Format</b> — JSONL <code>{"messages": [...]}</code>; trainer applies chat template</li>
          <li><b>How many</b> — format 100–500 · style 500–2k · reasoning 5k+</li>
          <li><b>Quality &gt; quantity</b>; consistent, representative, no PII</li>
          <li>⚠ <b>Contamination</b> — freeze eval set FIRST</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LoRA</div>
        <ul>
          <li><b>Problem</b> — full FT ≈ 16 B/param → 7B ≈ 112 GB; GPU has 24</li>
          <li><b>Insight</b> — weight updates have low intrinsic rank</li>
          <li><b>Formula</b> — <code>h = Wx + (α/r)·BAx</code>; B d×r, A r×k, r ≪ d</li>
          <li><b>Count</b> — 4096², r=8: 16.8M → 65,536 (256× fewer)</li>
          <li><b>Init</b> — A random, B = 0 → starts as the base model</li>
          <li><b>Knobs</b> — r 8–16; α = 2r; attention + MLP projections; LR 1e-4–2e-4</li>
          <li><b>Merge</b> (zero latency) or <b>swap</b> adapters per customer</li>
          <li>💡 Photoshop adjustment layer · ⚠ still forgets if over-trained</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Quantization &amp; QLoRA</div>
        <ul>
          <li><b>Bytes/param</b> — FP32 4 · BF16 2 · INT8 1 · INT4 0.5 (7B: 28/14/7/3.5 GB)</li>
          <li><b>Absmax</b> — divide by max |w|, round; one scale per block</li>
          <li><b>Real run</b> — int8 1.0% err · int4 17.5% · int4 blocks of 64 11.2%</li>
          <li><b>QLoRA</b> = NF4 frozen base + LoRA in BF16
            <ul><li>NF4: levels at equal probability (dense near 0)</li><li>double quantization of scales (~0.37 bit/param)</li><li>paged optimizers absorb spikes</li></ul>
          </li>
          <li><b>Memory 7B</b> — LoRA ≈ 18 GB · QLoRA ≈ 8 GB</li>
          <li><b>Tools</b> — bitsandbytes (train) · GPTQ/AWQ (GPU serve) · GGUF (CPU/Ollama)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Other PEFT</div>
        <ul>
          <li><b>PEFT</b> — train a small add-on, not all weights</li>
          <li><b>Adapters</b> — bottleneck MLPs; add latency</li>
          <li><b>Prefix / prompt tuning</b> — soft virtual tokens; unstable / big-model only</li>
          <li><b>IA³</b> — rescaling vectors, ~0.01% params</li>
          <li><b>DoRA</b> — magnitude + direction; <code>use_dora=True</code></li>
          <li><b>LoRA won</b> — merges (0 latency), stable, small swappable adapters</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">RLHF &amp; DPO</div>
        <ul>
          <li><b>Alignment</b> — learn which valid answer people prefer</li>
          <li><b>Why</b> — "A &gt; B" is easier than writing the perfect answer</li>
          <li><b>RLHF</b> — rank pairs → reward model → PPO</li>
          <li><b>KL leash</b> — <code>reward − β·KL(policy ‖ SFT)</code>; stops reward hacking</li>
          <li><b>DPO</b> — one loss on (prompt, chosen, rejected) vs frozen reference; no RM, no RL</li>
          <li><b>DPO knobs</b> — β 0.1, LR ~5e-7, start from SFT model</li>
          <li><b>Names</b> — RLAIF, Constitutional AI, ORPO/KTO, RLVR/GRPO (reasoning models)</li>
          <li>⚠ RLHF = supervised RM + real RL step</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Evaluate &amp; failures</div>
        <ul>
          <li><b>Levels</b> — loss/perplexity · task metric · judge/human</li>
          <li><b>SQL</b> — execution accuracy (compare rows), not string match</li>
          <li><b>Report 3 numbers</b> — base, fine-tuned, general benchmark (MMLU)</li>
          <li><b>Forgetting</b> → lower LR, fewer epochs, LoRA, mix 5–20% general data</li>
          <li><b>Overfitting</b> (eval loss ↑) → diverse data, early stop, smaller r</li>
          <li><b>Alignment tax</b>, <b>instability</b> (NaN) → aligned start, clipping, lower LR</li>
          <li>⚠ old TRL args — use <code>processing_class=</code>, <code>SFTConfig(max_length=)</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ft-when"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Prompt, RAG or Fine-Tune?</span><span class="rm-sub">The decision comes first</span></div></div>
      <div class="rm-item rm-done" data-target="ft-stages"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Where Fine-Tuning Fits</span><span class="rm-sub">Base, instruct, chat models</span></div></div>
      <div class="rm-item rm-done" data-target="ft-sft"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">SFT &amp; Data Prep</span><span class="rm-sub">The data makes or breaks it</span></div></div>
      <div class="rm-item rm-done" data-target="ft-lora"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">LoRA</span><span class="rm-sub">Train 0.1–3% of the weights</span></div></div>
      <div class="rm-item rm-done" data-target="ft-quant"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Quantization &amp; QLoRA</span><span class="rm-sub">A 7B model on one 24 GB GPU</span></div></div>
      <div class="rm-item rm-done" data-target="ft-peft"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Other PEFT Methods</span><span class="rm-sub">And why LoRA won</span></div></div>
      <div class="rm-item rm-done" data-target="ft-align"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">RLHF &amp; DPO</span><span class="rm-sub">Learning from preferences</span></div></div>
      <div class="rm-item rm-done" data-target="ft-eval"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Evaluating &amp; Failure Modes</span><span class="rm-sub">Did it really get better?</span></div></div>
      <div class="rm-item rm-done" data-target="ft-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">LoRA from scratch + a QLoRA run</span></div></div>
      <div class="rm-item rm-done" data-target="ft-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ft-when"><span class="num">01</span>Prompt, RAG or Fine-Tune?</h2>
  <p><strong>Fine-tuning</strong> = continuing training on your own examples so the model's default behaviour changes. It is slow, costly and often unnecessary, so justify it first.</p>
  <div class="cards">
    <div><b>1 · Prompting</b><p>Clearer instructions, few-shot examples. Fixes behaviour and format.</p><small>Cost ≈ $0 · minutes · always try first</small></div>
    <div><b>2 · RAG</b><p>Retrieve documents at query time. Fixes missing, private or recent knowledge.</p><small>Cost: index + per-query · hours</small></div>
    <div><b>3 · Fine-tuning</b><p>Train on examples. Fixes style, format, persona and narrow skills.</p><small>Cost: $100s–$10Ks · hours–days</small></div>
    <div><b>4 · Pre-training</b><p>Build a model from scratch. Only for a domain no model knows (e.g. protein sequences).</p><small>Cost: $millions · months · almost never</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy: one new employee</span>
    <p>You hired a brilliant, well-read employee. <strong>Prompting</strong> = clearer instructions. <strong>RAG</strong> = a reference binder to look things up. <strong>Fine-tuning</strong> = a training course that builds new habits. <strong>Pre-training</strong> = raising a person from birth.</p>
  </div>
  <table class="tbl">
    <tr><th>Level</th><th>Real examples</th><th>The tell-tale sign</th></tr>
    <tr><td>Prompting</td><td>"Summarise in 3 bullets"; return JSON; think step by step</td><td>The model <em>can</em> do it, just not the way you want</td></tr>
    <tr><td>RAG</td><td>Support bot over product docs; "what did our Q3 call say?"; cite the clause</td><td>Missing facts or you need sources: a <strong>knowledge</strong> gap</td></tr>
    <tr><td>Fine-tuning</td><td>Always emit SQL in your dialect; brand voice without a 500-word prompt; strict clinical-note format</td><td>Prompts keep growing and it still drifts: a <strong>behaviour</strong> gap</td></tr>
    <tr><td>Pre-training</td><td>A language with almost no web text; DNA sequences</td><td>No model has the base knowledge at all</td></tr>
  </table>
  <div class="callout pred"><span class="label">Think first</span>
    <p>(a) "Our bot doesn't know our refund policy." (b) "It knows the policy but rambles when we need bullets." (c) "It must sound like us <em>and</em> cite current docs."</p>
    <p>Answers: (a) RAG; fine-tuning does not reliably teach facts. (b) Prompting first, fine-tune only if that won't hold. (c) Both: fine-tune the voice, RAG the facts. Most real products combine them.</p>
  </div>
  <p>In one line: <strong>fine-tuning changes how it behaves; RAG changes what it knows</strong>. RAG stays fresh and cites sources; a fine-tune is frozen at training time.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <rect x="10" y="120" width="140" height="40" class="fg sg"/><text x="80" y="136" text-anchor="middle">Prompting</text><text x="80" y="152" text-anchor="middle" class="tm" font-size="11">$0 · minutes</text>
    <rect x="155" y="90" width="140" height="70" class="fb sb"/><text x="225" y="106" text-anchor="middle">RAG</text><text x="225" y="122" text-anchor="middle" class="tm" font-size="11">index · hours</text>
    <rect x="300" y="60" width="140" height="100" class="fv" stroke="currentColor"/><text x="370" y="76" text-anchor="middle">Fine-tune</text><text x="370" y="92" text-anchor="middle" class="tm" font-size="11">$100s–10Ks · days</text>
    <rect x="445" y="30" width="145" height="130" class="fr sr"/><text x="517" y="46" text-anchor="middle">Pre-train</text><text x="517" y="62" text-anchor="middle" class="tm" font-size="11">$millions · months</text>
    <text x="10" y="40" class="tm">each rung ≈ 10–100× the one below</text>
  </svg><figcaption>Golden rule: climb from the bottom. Move up only when an eval shows the cheaper rung failed.</figcaption></figure>

  <h2 id="ft-stages"><span class="num">02</span>Where Fine-Tuning Fits</h2>
  <p>A chat model is built in three stages (overview in <a class="xref" data-note="llm_basics">How LLMs Work</a>). "Fine-tuning" means stages 2 and 3, together called <strong>post-training</strong>.</p>
  <div class="flow"><span>Pre-training → BASE model (autocomplete)</span><span>SFT / instruction tuning → INSTRUCT model</span><span>RLHF / DPO → aligned CHAT model</span></div>
  <p>You inherit stage 1 (someone else paid millions). You usually run stage 2, sometimes stage 3, on your data.</p>
  <ul>
    <li><strong>Instruction tuning</strong>: SFT on <em>many</em> tasks phrased as instructions, so the model learns to follow instructions in general (FLAN, Alpaca). Labs do this.</li>
    <li><strong>Task fine-tuning</strong>: SFT on <em>one</em> narrow task to be excellent at it ("valid SQL for our schema"). You do this.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: base vs instruct</span>
    <p><code>Llama-3.1-8B</code> (base) may answer a question with more questions; <code>-Instruct</code> has had stages 2–3. Start from Instruct for chat-style tasks; from base only for a narrow, data-rich task.</p>
  </div>

  <h2 id="ft-sft"><span class="num">03</span>SFT &amp; Data Prep</h2>
  <p><strong>Supervised fine-tuning (SFT)</strong>: train on (input, ideal output) pairs with the same next-token loss as pre-training. The model learns a new way to <em>apply</em> what it knows, not new facts.</p>
  <div class="flow"><span>Chat example</span><span>Forward pass</span><span>Cross-entropy on <em>response</em> tokens only</span><span>Backprop → update</span></div>
  <p>The prompt tokens are masked out of the loss: the model should learn to produce answers, not to memorise questions.</p>
  <div class="fx" data-lang="py">{"messages": [
  {"role": "system", "content": "You write PostgreSQL only. No explanation."},
  {"role": "user", "content": "Customers with more than 5 orders last month"},
  {"role": "assistant", "content": "SELECT customer_id, COUNT(*) AS n\\nFROM orders\\nWHERE order_date &gt;= date_trunc('month', now()) - interval '1 month'\\n  AND order_date &lt; date_trunc('month', now())\\nGROUP BY customer_id\\nHAVING COUNT(*) &gt; 5;"}
]}</div>
  <p>One JSON object per line (JSONL). The trainer applies the model's chat template for you.</p>
  <table class="tbl">
    <tr><th>Task type</th><th>Typical examples needed</th></tr>
    <tr><td>Format conversion (JSON extraction, SQL in one dialect)</td><td>~100–500</td></tr>
    <tr><td>Style / tone / persona</td><td>~500–2,000</td></tr>
    <tr><td>Complex domain reasoning</td><td>~5,000+</td></tr>
  </table>
  <ul>
    <li><strong>Quality over quantity</strong>: 200 consistent examples beat 2,000 sloppy ones; errors get baked in.</li>
    <li><strong>Consistent and representative</strong>: one format, no contradictory answers, real (messy) input distribution.</li>
    <li><strong>No PII or secrets</strong>: the model can regurgitate training data.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: contamination</span>
    <p>If eval examples leak into training, scores look great and production disappoints. Build and freeze the eval set <strong>first</strong>, then create training data without looking at it.</p>
  </div>

  <h2 id="ft-lora"><span class="num">04</span>LoRA</h2>
  <p><strong>LoRA</strong> (Low-Rank Adaptation): freeze the model and train a tiny add-on update for each chosen weight matrix.</p>
  <ul>
    <li><strong>Problem:</strong> full fine-tuning with Adam ≈ 16 bytes/param (weights, grads, fp32 master, two Adam states). 7B → ~112 GB; a consumer GPU has 24 GB.</li>
    <li><strong>Insight:</strong> the update to a weight matrix has <strong>low intrinsic rank</strong> (a few directions), so write it as two thin matrices.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600">
    <rect x="20" y="30" width="120" height="120" class="fs" stroke="currentColor"/><text x="80" y="86" text-anchor="middle">W</text><text x="80" y="106" text-anchor="middle" class="tm" font-size="11">d×k · frozen</text>
    <text x="162" y="96" text-anchor="middle">+</text>
    <rect x="185" y="30" width="20" height="120" class="fg sg"/><text x="195" y="94" text-anchor="middle">B</text><text x="195" y="22" text-anchor="middle" class="tm" font-size="11">B=0</text><text x="195" y="168" text-anchor="middle" class="tm" font-size="11">d×r</text>
    <text x="218" y="45" text-anchor="middle">·</text>
    <rect x="230" y="30" width="120" height="20" class="fg sg"/><text x="290" y="45" text-anchor="middle">A</text><text x="290" y="68" text-anchor="middle" class="tm" font-size="11">r×k · random</text>
    <text x="370" y="96" text-anchor="middle">=</text>
    <rect x="390" y="30" width="120" height="120" class="fb sb" stroke-dasharray="4 3"/><text x="450" y="86" text-anchor="middle">ΔW = BA</text><text x="450" y="106" text-anchor="middle" class="tm" font-size="11">rank ≤ r</text>
    <text x="522" y="84" font-size="11">merge →</text><text x="522" y="102" font-size="11">W + BA</text>
    <text x="20" y="196">W: 16,777,216</text><text x="230" y="196" class="tg">A+B at r=8: 65,536 (256× fewer)</text>
  </svg><figcaption>Only the thin green matrices train. Their product has W's shape, so it adds to (or merges into) W. Numbers for 4096×4096.</figcaption></figure>
  <div class="callout def"><span class="label">The math</span>
    <p>For a frozen weight <code>W</code> (d × k): <code>h = W x + (α / r) · B A x</code>, with <code>B</code> d × r, <code>A</code> r × k, and rank <code>r ≪ d</code>. Only <code>A</code> and <code>B</code> train. <code>ΔW = BA</code> has the same shape as <code>W</code>.</p>
    <p>For a 4096 × 4096 projection with r = 8: full = 16,777,216 params; LoRA = 8 × (4096 + 4096) = 65,536. <strong>256× fewer.</strong></p>
  </div>
  <div class="callout anlg"><span class="label">Analogy: a Photoshop adjustment layer</span>
    <p>You never repaint the photo (W). You add a thin layer on top that you can toggle, swap or flatten into the image. Unlike a real layer, LoRA can only change a few directions.</p>
  </div>
  <ul>
    <li><strong>Init</strong>: <code>A</code> random, <code>B</code> zeros. So <code>BA = 0</code> and training starts from exactly the pretrained model.</li>
    <li><strong>r (rank)</strong>: capacity. Start at 8 or 16; go to 32–64 only if evals say it underfits.</li>
    <li><strong>α (alpha)</strong>: scales the update by α / r. Setting α = 2r keeps the scale fixed at 2 as you change r, so you needn't retune the learning rate.</li>
    <li><strong>target_modules</strong>: which matrices get adapters. Attention (<code>q_proj, k_proj, v_proj, o_proj</code>) plus MLP (<code>gate_proj, up_proj, down_proj</code>) is the strong default.</li>
    <li><strong>Learning rate</strong>: ~1e-4 to 2e-4, about 10× higher than full fine-tuning.</li>
  </ul>
  <h3>Merge or swap</h3>
  <ul>
    <li><strong>Merge</strong>: compute <code>W + (α/r)·BA</code> once and save it. Inference costs exactly the same as the base model.</li>
    <li><strong>Swap</strong>: keep one base model in memory and load small adapters (tens of MB) per customer or task. Servers like vLLM can serve many LoRA adapters on one base.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>LoRA is not "less forgetting for free". It forgets less than full fine-tuning because W is frozen, but a narrow dataset trained too long still degrades general skills. Check with a general benchmark.</p>
  </div>

  <h2 id="ft-quant"><span class="num">05</span>Quantization &amp; QLoRA</h2>
  <p><strong>Quantization</strong> = storing weights with fewer bits. Less memory, faster inference, a little error.</p>
  <table class="tbl">
    <tr><th>Format</th><th>Bytes / param</th><th>7B model</th><th>Quality</th></tr>
    <tr><td>FP32</td><td>4</td><td>28 GB</td><td>Reference</td></tr>
    <tr><td>FP16 / BF16</td><td>2</td><td>14 GB</td><td>Essentially lossless; standard</td></tr>
    <tr><td>INT8</td><td>1</td><td>7 GB</td><td>Usually &lt;1% drop</td></tr>
    <tr><td>INT4 / NF4</td><td>0.5</td><td>~3.5 GB</td><td>Small drop; more on maths and precise reasoning</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>"412.837194 g of flour" bakes the same cake as "413 g". Like MP3 and JPEG, drop precision nobody notices.</p></div>
  <p>The simplest scheme, <strong>absmax</strong>: divide by the largest absolute value, round to integers, store one scale per block.</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(0)
w = rng.normal(0, 0.02, size=4096).astype(np.float32)   # weights look Gaussian

def absmax_quantize(w, bits):
    levels = 2 ** (bits - 1) - 1              # int8 -&gt; 127, int4 -&gt; 7
    scale = np.abs(w).max() / levels          # one scale per block, stored alongside
    q = np.round(w / scale).astype(np.int8)   # the stored integers
    return q, scale

for bits in [8, 4]:
    q, scale = absmax_quantize(w, bits)
    w_hat = q * scale                         # de-quantize for the matmul
    err = np.abs(w - w_hat).mean() / np.abs(w).mean()
    print(f"int{bits}: {len(np.unique(q))} distinct values, mean relative error {err:.1%}")

# Block-wise: one scale per 64 weights, so one outlier only hurts its own block
blocks = w.reshape(-1, 64)
w_hat = np.concatenate([q * s for q, s in (absmax_quantize(b, 4) for b in blocks)])
print(f"int4, blocks of 64: mean relative error {np.abs(w - w_hat).mean() / np.abs(w).mean():.1%}")</div>
  <table class="tbl out"><caption>Output</caption>
    <tr><td>int8: 191 distinct values, mean relative error 1.0%</td></tr>
    <tr><td>int4: 14 distinct values, mean relative error 17.5%</td></tr>
    <tr><td>int4, blocks of 64: mean relative error 11.2%</td></tr>
  </table>
  <p>Int4 has only 16 levels, so smarter placement matters: smaller blocks, and levels where the weights actually are. Per-weight error also overstates model damage; real methods are judged on task accuracy.</p>
  <h3>QLoRA = 4-bit frozen base + LoRA adapters</h3>
  <ul>
    <li><strong>NF4</strong> (NormalFloat-4, picture below): weights are roughly Gaussian, so the 16 levels are spaced by equal <em>probability</em>, not equal value. More levels near zero, where most weights sit.</li>
    <li><strong>Double quantization</strong>: the per-block scales are quantized too, saving ~0.37 bits/param.</li>
    <li><strong>Paged optimizers</strong>: optimizer states spill to CPU memory on spikes instead of crashing.</li>
    <li>Base weights are de-quantized to BF16 on the fly for each matmul; adapters train in BF16.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600">
    <path d="M130,119 L138,119 L145,118 L152,118 L160,117 L168,116 L175,115 L182,113 L190,112 L198,110 L205,107 L212,104 L220,101 L228,98 L235,94 L242,89 L250,84 L258,79 L265,74 L272,68 L280,62 L288,57 L295,51 L302,46 L310,41 L318,36 L325,32 L332,29 L340,27 L348,25 L355,25 L362,25 L370,27 L378,29 L385,32 L392,36 L400,41 L408,46 L415,51 L422,57 L430,62 L438,68 L445,74 L452,79 L460,84 L468,89 L475,94 L482,98 L490,101 L498,104 L505,107 L512,110 L520,112 L528,113 L535,115 L542,116 L550,117 L558,118 L565,118 L572,119 L580,119" class="fb sb"/>
    <text x="8" y="60" class="tm">weights</text><text x="8" y="76" class="tm">≈ Gaussian</text>
    <text x="8" y="140">absmax int4</text><g class="sr" stroke-width="2"><line x1="130" y1="128" x2="130" y2="142"/><line x1="162" y1="128" x2="162" y2="142"/><line x1="194" y1="128" x2="194" y2="142"/><line x1="226" y1="128" x2="226" y2="142"/><line x1="259" y1="128" x2="259" y2="142"/><line x1="291" y1="128" x2="291" y2="142"/><line x1="323" y1="128" x2="323" y2="142"/><line x1="355" y1="128" x2="355" y2="142"/><line x1="387" y1="128" x2="387" y2="142"/><line x1="419" y1="128" x2="419" y2="142"/><line x1="451" y1="128" x2="451" y2="142"/><line x1="484" y1="128" x2="484" y2="142"/><line x1="516" y1="128" x2="516" y2="142"/><line x1="548" y1="128" x2="548" y2="142"/><line x1="580" y1="128" x2="580" y2="142"/></g>
    <text x="8" y="164">NF4</text><g class="sg" stroke-width="2"><line x1="130" y1="152" x2="130" y2="166"/><line x1="197" y1="152" x2="197" y2="166"/><line x1="234" y1="152" x2="234" y2="166"/><line x1="262" y1="152" x2="262" y2="166"/><line x1="286" y1="152" x2="286" y2="166"/><line x1="307" y1="152" x2="307" y2="166"/><line x1="327" y1="152" x2="327" y2="166"/><line x1="346" y1="152" x2="346" y2="166"/><line x1="364" y1="152" x2="364" y2="166"/><line x1="383" y1="152" x2="383" y2="166"/><line x1="403" y1="152" x2="403" y2="166"/><line x1="424" y1="152" x2="424" y2="166"/><line x1="448" y1="152" x2="448" y2="166"/><line x1="476" y1="152" x2="476" y2="166"/><line x1="513" y1="152" x2="513" y2="166"/><line x1="580" y1="152" x2="580" y2="166"/></g>
  </svg><figcaption>Each tick is one storable level. Equal spacing wastes levels in the empty tails; NF4 packs them where the weights are.</figcaption></figure>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <text x="8" y="49">full FT (Adam)</text><rect x="150" y="36" width="381" height="18" class="fr sr"/><text x="537" y="49">112 GB</text>
    <text x="8" y="84">LoRA, BF16 base</text><rect x="150" y="71" width="48" height="18" class="fb sb"/><rect x="198" y="71" width="14" height="18" class="fv"/><text x="246" y="84">≈18 GB</text>
    <text x="8" y="119">QLoRA, NF4 base</text><rect x="150" y="106" width="14" height="18" class="fb sb"/><rect x="164" y="106" width="14" height="18" class="fv"/><text x="246" y="119">≈8 GB</text>
    <line x1="232" y1="24" x2="232" y2="132" class="sr" stroke-dasharray="4 3"/><text x="232" y="18" text-anchor="middle" class="tr">24 GB GPU</text>
  </svg><figcaption>7B fine-tune memory. Blue = base weights (14 GB BF16 vs ~4 GB NF4), violet ≈ 4 GB adapters + optimizer + activations.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy: a zipped encyclopedia</span>
    <p>Keep the giant book you only <em>read</em> compressed on a small shelf. Write your own notes, the part you <em>change</em>, on full-size paper. Compress what is frozen; keep precision where you learn.</p>
  </div>
  <p>The QLoRA paper reported quality close to 16-bit fine-tuning. Treat that as a prior and measure on your task.</p>
  <h3>Quantization methods you'll meet</h3>
  <table class="tbl">
    <tr><th>Method</th><th>What it is</th><th>Use it for</th></tr>
    <tr><td><strong>bitsandbytes</strong></td><td>Quantizes on load (INT8, NF4); no calibration data</td><td>QLoRA training, quick experiments</td></tr>
    <tr><td><strong>GPTQ</strong></td><td>Post-training; uses calibration data and second-order info to minimise each layer's error</td><td>Pre-quantized INT4 files for GPU serving</td></tr>
    <tr><td><strong>AWQ</strong></td><td>Post-training; protects the small set of weights with large activations</td><td>GPU serving; often slightly better than GPTQ at 4-bit</td></tr>
    <tr><td><strong>GGUF</strong></td><td>llama.cpp file format (Q4_K_M, Q8_0…)</td><td>CPU / Apple Silicon; used by Ollama</td></tr>
  </table>
  <p>Serving quantized models is covered in <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a>.</p>

  <h2 id="ft-peft"><span class="num">06</span>Other PEFT Methods</h2>
  <p><strong>PEFT</strong> (parameter-efficient fine-tuning) = any method that trains a small add-on instead of all weights.</p>
  <table class="tbl">
    <tr><th>Method</th><th>Idea</th><th>Trade-off</th></tr>
    <tr><td><strong>Adapters</strong></td><td>Insert small bottleneck MLPs (d → r → d) between sublayers</td><td>Older; extra layers add inference latency</td></tr>
    <tr><td><strong>Prefix / prompt tuning</strong></td><td>Learned soft "virtual tokens" in every layer (prefix) or only at the input (prompt)</td><td>Tiny; unstable, or only good on very large models</td></tr>
    <tr><td><strong>IA³</strong></td><td>Learn vectors that rescale keys, values and FFN activations</td><td>~0.01% params; good with very little data</td></tr>
    <tr><td><strong>DoRA</strong></td><td>Split the update into magnitude and direction; LoRA on the direction</td><td>Often a bit better than LoRA; <code>use_dora=True</code> in peft</td></tr>
  </table>
  <div class="callout intu"><span class="label">Why LoRA won</span>
    <p>(1) Merges into W, so <strong>zero inference latency</strong>. (2) Stable to train. (3) Adapters are small, swappable and composable. The Hugging Face <code>peft</code> library made it the default.</p>
  </div>

  <h2 id="ft-align"><span class="num">07</span>RLHF &amp; DPO</h2>
  <p><strong>Alignment</strong> teaches the model which of several valid answers people <em>prefer</em>: more helpful, honest, on-tone, safe.</p>
  <p>SFT needs one gold answer per prompt, but many answers are valid, and "A is better than B" is far easier to judge than writing the perfect answer, especially for fuzzy qualities like tone.</p>
  <div class="callout anlg"><span class="label">Analogy: a cooking student</span>
    <p>SFT: "make exactly this recipe". Alignment: cook two versions, taste both, "this one's better", again and again. The student never sees a perfect recipe but builds <em>taste</em>.</p>
  </div>
  <h3>RLHF: the classic three steps</h3>
  <div class="flow"><span>1. Humans rank pairs: A &gt; B</span><span>2. Train a reward model to score answers</span><span>3. PPO: generate → score → update, with a KL leash</span></div>
  <ul>
    <li><strong>Reward model (RM)</strong>: reads (prompt, answer), outputs one number. Trained so the preferred answer scores higher. It turns slow human judgement into a score RL can query millions of times.</li>
    <li><strong>KL penalty</strong>: maximise <code>reward − β · KL(policy ‖ SFT model)</code>. Without it the model finds text the imperfect RM loves but humans hate: <strong>reward hacking</strong>.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: "Is RLHF supervised or RL?"</span>
    <p>Both. Training the reward model is supervised. The PPO step is real RL: actions = tokens, reward = RM score. DPO, below, is not RL at all.</p>
  </div>
  <h3>DPO: same goal, no reward model, no RL</h3>
  <p><strong>DPO</strong> (Direct Preference Optimization) shows the RLHF objective can be optimised with one supervised-style loss directly on (prompt, chosen, rejected) triples. It raises the probability of "chosen" relative to "rejected", measured against a frozen reference (the SFT model). β plays the KL role.</p>
  <div class="cards">
    <div><b>RLHF (PPO)</b><p>Policy + reward model + reference + RL loop. Powerful, finicky, GPU-heavy, reward hacking risk.</p><small>Still used at frontier scale</small></div>
    <div><b>DPO</b><p>Policy + frozen reference + one loss. Stable and cheap.</p><small>Default for most open models</small></div>
  </div>
  <div class="fx" data-lang="py">from trl import DPOTrainer, DPOConfig

# rows: {"prompt": "...", "chosen": "better answer", "rejected": "worse answer"}
args = DPOConfig(output_dir="dpo-out", beta=0.1,     # beta = how tightly to stay near the SFT model
                 learning_rate=5e-7, num_train_epochs=1)  # far smaller LR than SFT: a gentle nudge
trainer = DPOTrainer(model=sft_model,           # start from your SFT model, never a base model
                     args=args, train_dataset=prefs,
                     processing_class=tokenizer) # ref_model=None: TRL keeps a frozen copy
trainer.train()</div>
  <p><strong>Names to recognise:</strong> <strong>RLAIF</strong> (an LLM labels the preferences), <strong>Constitutional AI</strong> (Anthropic: the model critiques its answers against written principles), <strong>ORPO / KTO</strong> (DPO cousins: preferences folded into SFT; single good/bad labels), <strong>RLVR / GRPO</strong> (RL on verifiable rewards such as passing tests: how reasoning models are trained).</p>

  <h2 id="ft-eval"><span class="num">08</span>Evaluating &amp; Failure Modes</h2>
  <p>A fine-tune is only "better" if a held-out eval says so. Building eval sets and LLM-as-judge are covered in <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>; here is what is specific to fine-tuning.</p>
  <table class="tbl">
    <tr><th>Level</th><th>Measures</th><th>Example</th></tr>
    <tr><td>Loss / perplexity</td><td>Sanity check on held-out data</td><td>Eval loss rising while train loss falls = overfitting</td></tr>
    <tr><td>Task metric</td><td>Does it do <em>the job</em> better?</td><td>SQL execution accuracy, pass@k for code, F1 for extraction</td></tr>
    <tr><td>Judge / human</td><td>Open-ended quality</td><td>Rubric-based LLM judge, side-by-side human preference</td></tr>
  </table>
  <div class="callout intu"><span class="label">Example: SQL fine-tune</span><p>Score <strong>execution accuracy</strong>: run predicted and gold SQL and compare the rows. A query that fails to run scores 0. Adding a "harmless" <code>DISTINCT</code> changes the rows and also scores 0; a string match or a lenient judge would miss both.</p></div>
  <div class="callout intu"><span class="label">Always report three numbers</span>
    <p>Base model score, fine-tuned score, and a general benchmark (e.g. MMLU) for both. The target task should rise without the general score collapsing.</p>
  </div>
  <table class="tbl">
    <tr><th>Failure</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td><strong>Catastrophic forgetting</strong></td><td>Great on the task, worse at everything else</td><td>Lower LR, fewer epochs, LoRA, mix in 5–20% general data</td></tr>
    <tr><td><strong>Overfitting</strong></td><td>Train loss ↓, eval loss ↑; parrots training examples</td><td>More diverse data, early stopping, smaller r</td></tr>
    <tr><td><strong>Alignment tax</strong></td><td>Safety / helpfulness weakens after SFT</td><td>Start from an aligned model; add safety examples; DPO after SFT</td></tr>
    <tr><td><strong>Instability</strong></td><td>Loss spikes or NaN</td><td>Lower LR, gradient clipping, drop extreme-length examples</td></tr>
  </table>

  <h2 id="ft-build"><span class="num">09</span>Build It</h2>
  <h3>LoRA from scratch on one linear layer</h3>
  <p>A frozen "pretrained" layer, a task that needs a rank-4 change, and LoRA adapters of rank 1, 4 and 8. Runs on CPU in seconds (PyTorch).</p>
  <div class="fx" data-lang="py">import torch, torch.nn as nn

torch.manual_seed(0)
d = 512   # real LLM layers: 4096+

class LoRALinear(nn.Module):
    def __init__(self, base: nn.Linear, r=8, alpha=16):
        super().__init__()
        self.base = base
        for p in self.base.parameters():
            p.requires_grad = False                     # freeze W
        d_out, d_in = base.weight.shape
        self.A = nn.Parameter(torch.randn(r, d_in) * 0.01)   # r x d_in, small random
        self.B = nn.Parameter(torch.zeros(d_out, r))         # d_out x r, ZERO
        self.scale = alpha / r

    def forward(self, x):
        return self.base(x) + self.scale * (x @ self.A.T @ self.B.T)

    def merge(self):
        # fold B@A into W: zero extra inference cost
        merged = nn.Linear(self.base.in_features, self.base.out_features)
        merged.weight.data = self.base.weight + self.scale * self.B @ self.A
        merged.bias.data = self.base.bias.clone()
        return merged

# 1. A "pretrained" layer, and a "task" that needs a rank-4 change to it
base = nn.Linear(d, d)
true_delta = torch.randn(d, 4) @ torch.randn(4, d) * 0.05
X = torch.randn(2048, d)
with torch.no_grad():
    Y = X @ (base.weight + true_delta).T + base.bias

def count(m):
    total = sum(p.numel() for p in m.parameters())
    train = sum(p.numel() for p in m.parameters() if p.requires_grad)
    return total, train

for r in [1, 4, 8]:
    layer = LoRALinear(base, r=r, alpha=2 * r)
    total, train = count(layer)
    with torch.no_grad():
        same = torch.allclose(layer(X), base(X))        # B = 0, so no change yet
        start = nn.functional.mse_loss(layer(X), Y).item()
    opt = torch.optim.Adam([layer.A, layer.B], lr=1e-2)
    for step in range(500):
        loss = nn.functional.mse_loss(layer(X), Y)
        opt.zero_grad(); loss.backward(); opt.step()
    merged = layer.merge()
    with torch.no_grad():
        gap = (merged(X) - layer(X)).abs().max().item()
    print(f"r={r}: trainable {train:,} of {total:,} ({100*train/total:.1f}%) | "
          f"starts equal to base: {same} | loss {start:.2f} -&gt; {loss.item():.1e} | "
          f"merge gap {gap:.1e}")</div>
  <table class="tbl out"><caption>Output</caption>
    <tr><td>r=1: trainable 1,024 of 263,680 (0.4%) | starts equal to base: True | loss 5.21 -&gt; 3.7e+00 | merge gap 6.7e-06</td></tr>
    <tr><td>r=4: trainable 4,096 of 266,752 (1.5%) | starts equal to base: True | loss 5.21 -&gt; 2.4e-07 | merge gap 1.2e-05</td></tr>
    <tr><td>r=8: trainable 8,192 of 270,848 (3.0%) | starts equal to base: True | loss 5.21 -&gt; 3.1e-06 | merge gap 1.1e-05</td></tr>
  </table>
  <ul>
    <li><strong>B = 0</strong> → the adapted layer starts identical to the base.</li>
    <li><strong>r = 1</strong> can't express a rank-4 change: loss stays high. <strong>r ≥ 4</strong> fits it with 1.5% of the parameters. That is the low-rank hypothesis in miniature.</li>
    <li><strong>Merging</strong> gives the same outputs (float noise only), with zero extra inference cost.</li>
  </ul>
  <p>With <code>peft</code>, the same thing is <code>get_peft_model(model, LoraConfig(...))</code>; on a tiny random Llama (r = 16, all 7 projections) <code>print_trainable_parameters()</code> reported <code>trainable params: 312,320 || all params: 3,988,736</code>.</p>
  <h3>A real QLoRA run (sketch)</h3>
  <p><strong>Sketch</strong>: needs a CUDA GPU (~16–24 GB) and model access. Imports and every config object were checked against peft 0.21 / trl 1.x / transformers 5; training was not run here.</p>
  <div class="fx" data-lang="py">import torch
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, prepare_model_for_kbit_training, AutoPeftModelForCausalLM
from trl import SFTTrainer, SFTConfig

BASE = "meta-llama/Llama-3.1-8B-Instruct"

# 1. Chat-format JSONL; the eval split was built and frozen first
data = load_dataset("json", data_files={"train": "train.jsonl", "eval": "eval.jsonl"})

# 2. Base model in 4-bit NF4 (the "Q")
bnb = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
)
model = AutoModelForCausalLM.from_pretrained(BASE, quantization_config=bnb, device_map="auto")
tokenizer = AutoTokenizer.from_pretrained(BASE)
model = prepare_model_for_kbit_training(model)

# 3. LoRA adapters (the "LoRA")
lora = LoraConfig(
    r=16, lora_alpha=32, lora_dropout=0.05, task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
)

# 4. Training config
args = SFTConfig(
    output_dir="qlora-out",
    num_train_epochs=2,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_steps=20,
    bf16=True,
    optim="paged_adamw_8bit",
    max_length=2048,
    assistant_only_loss=True,                # loss only on the assistant's tokens
    eval_strategy="epoch",
    logging_steps=10,
)

trainer = SFTTrainer(model=model, args=args, peft_config=lora,
                     train_dataset=data["train"], eval_dataset=data["eval"],
                     processing_class=tokenizer)
trainer.model.print_trainable_parameters()
trainer.train()
trainer.save_model("qlora-out/adapter")      # only A and B: tens of MB

# 5. Merge for deployment (reload base in bf16, not 4-bit, then fold B@A into W)
merged = AutoPeftModelForCausalLM.from_pretrained(
    "qlora-out/adapter", torch_dtype=torch.bfloat16).merge_and_unload()
merged.save_pretrained("merged-model")</div>
  <div class="callout trap"><span class="label">Trap: old tutorials</span>
    <p>Old tutorials pass <code>tokenizer=</code> and <code>max_seq_length=</code> to <code>SFTTrainer</code>. Current TRL uses <code>processing_class=</code> and <code>SFTConfig(max_length=…)</code>.</p>
  </div>

  <h2 id="ft-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>When do you fine-tune instead of using RAG or better prompts?</summary><div class="qa-body">Prompt first (free, fixes behaviour and format). RAG if the gap is knowledge: private, recent, or needs citations. Fine-tune when the behaviour must change reliably and prompting can't hold it: a strict output format, a house style, a narrow skill at scale, or to shrink a huge prompt. Combine fine-tuning (how) with RAG (what) when you need both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain LoRA and why it works.</summary><div class="qa-body">Freeze W and learn the update as a low-rank product: <code>h = Wx + (α/r)·BAx</code>, B is d × r, A is r × k, r ≪ d. It works because task-specific weight updates have low intrinsic rank, so a few directions capture most of the change. Memory falls sharply (no gradients or optimizer states for W), and the update can be merged into W for free inference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is B initialised to zero (and not both A and B)?</summary><div class="qa-body">B = 0 makes BA = 0, so training starts exactly at the pretrained model. A is random so gradients for B are non-zero; if both were zero, both gradients would be zero and nothing would learn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output: trainable LoRA params for one 4096 × 4096 matrix at r = 16?</summary><div class="qa-body">16 × (4096 + 4096) = <strong>131,072</strong>, versus 16,777,216 for the full matrix (128× fewer).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the Q in QLoRA add?</summary><div class="qa-body">The frozen base is stored in 4-bit NF4 (~4 GB for 7B instead of 14 GB). Double quantization also compresses the scale constants, and paged optimizers absorb memory spikes. Weights are de-quantized to BF16 for each matmul and the LoRA adapters train in BF16. Result: a 7B fine-tune on one 24 GB GPU.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You serve 50 customers, each with their own fine-tune of the same 8B model. Merge or not?</summary><div class="qa-body">Don't merge. Keep one base model in GPU memory and load each customer's adapter (tens of MB) per request; vLLM and similar servers support multi-LoRA serving. Merging would mean 50 full copies of the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through RLHF. What are the reward model and the KL penalty for?</summary><div class="qa-body">(1) Humans rank pairs of answers. (2) Train a reward model that scores (prompt, answer) so preferred answers score higher; it replaces slow human judgement with a fast score. (3) PPO maximises <code>reward − β·KL(policy ‖ SFT)</code>. The KL term keeps the model near the SFT model so it can't exploit the reward model's blind spots (reward hacking).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why has DPO largely replaced RLHF for open models?</summary><div class="qa-body">It optimises the same preference objective with one supervised-style loss on (prompt, chosen, rejected) triples: no reward model, no RL loop. A frozen reference model and β provide the "don't drift" pressure. It is simpler, cheaper and more stable. Large labs still use RL (PPO, or RL on verifiable rewards) where a strong reward signal pays off.</div></details>
</main>`
});
