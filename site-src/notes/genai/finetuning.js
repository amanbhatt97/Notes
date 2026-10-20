// notes/genai/finetuning.js — Fine-Tuning
Object.assign(TOPIC_CONTENT, {
  "finetuning": `<main>
  <h1>Fine-Tuning</h1>
  <div class="where"><span>Generative AI</span><span>Customizing Models</span><span>Fine-Tuning</span></div>
  <p class="lead">Prompting tells a model what to do; RAG hands it the facts. Neither changes what the model does <em>by default</em>. Fine-tuning does: you keep training it on your own examples until the new behaviour is its habit. This note builds that up one need at a time on the track's running example, <strong>Biteful's support assistant</strong>: Asha asks <em>"Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"</em>, the order tool says <em>out for delivery, rider Ravi, ETA 9:05 pm</em>, and Biteful wants every reply in its house format: <em>"hi ! order 101 is out for delivery . ravi will reach you by 9:05 pm . — team biteful"</em>. <strong>How the code was run:</strong> no paid API was called, and no pretrained LLM could be downloaded (huggingface.co is blocked on this machine). So every experiment uses a <strong>tiny GPT-style model (≈120K parameters) trained from scratch on a CPU</strong> on a few thousand made-up Biteful lines. It shows the mechanics of SFT, LoRA, quantization, DPO and forgetting faithfully, with real numbers; it says nothing about how well a real 7B model would do. Real-model figures (memory for 7B, QLoRA) are computed by arithmetic, and the one GPU-only script is labelled as a sketch that was not run.</p>

  <h2 id="ft-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 200" width="680">
<defs><marker id="ft-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="12" width="160" height="48" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="33" text-anchor="middle" font-size="12">Prompting · LLM APIs</text><text x="90" y="50" text-anchor="middle" class="tm" font-size="10">instructions per call</text>
<rect x="10" y="76" width="160" height="48" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="97" text-anchor="middle" font-size="12">RAG</text><text x="90" y="114" text-anchor="middle" class="tm" font-size="10">facts per call</text>
<rect x="10" y="140" width="160" height="48" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="161" text-anchor="middle" font-size="12">Transformers · DL training</text><text x="90" y="178" text-anchor="middle" class="tm" font-size="10">weights, loss, Adam</text>
<rect x="255" y="70" width="170" height="60" rx="8" class="fg sg" stroke-width="3"/><text x="340" y="96" text-anchor="middle" font-size="13" font-weight="700">Fine-Tuning</text><text x="340" y="114" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="510" y="40" width="160" height="48" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="590" y="61" text-anchor="middle" font-size="12">Evaluation</text><text x="590" y="78" text-anchor="middle" class="tm" font-size="10">is it really better?</text>
<rect x="510" y="112" width="160" height="48" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="590" y="133" text-anchor="middle" font-size="12">Production</text><text x="590" y="150" text-anchor="middle" class="tm" font-size="10">serve, quantize, cost</text>
<line x1="170" y1="36" x2="253" y2="88" stroke="currentColor" marker-end="url(#ft-a0)"/><line x1="170" y1="100" x2="253" y2="100" stroke="currentColor" marker-end="url(#ft-a0)"/><line x1="170" y1="164" x2="253" y2="112" stroke="currentColor" marker-end="url(#ft-a0)"/>
<line x1="425" y1="92" x2="508" y2="66" stroke="currentColor" marker-end="url(#ft-a0)"/><line x1="425" y1="108" x2="508" y2="134" stroke="currentColor" marker-end="url(#ft-a0)"/>
</svg><figcaption>Reading order for the last three notes: Fine-Tuning → Evaluation &amp; Observability → Guardrails, Cost &amp; Deployment.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="prompting">Prompt Engineering</a>, <a class="xref" data-note="llm_apis">LLM APIs</a>, <a class="xref" data-note="rag">RAG</a></b><span>We can instruct the model on every call and hand it the right facts (order 101's status from a tool, the refund rule from a document). Left open: the model's <em>default</em> habits (tone, format, a narrow skill) still come from someone else's training, and long style prompts drift and cost tokens on every call.</span></li>
    <li><b>This note adds: training on your own examples</b><span>When to do it at all; SFT data and the assistant-only loss; why full fine-tuning needs 112 GB for a 7B model; LoRA and QLoRA to make it fit on one GPU; other PEFT methods; instruction tuning; preference tuning (RLHF, DPO); how to evaluate a fine-tune; catastrophic forgetting. The training loop itself is the one from <a class="xref" data-note="dl_training">Training Well</a> and <a class="xref" data-note="dl_pytorch">PyTorch</a>; the weights being changed are the attention and MLP matrices from <a class="xref" data-note="transformers">Transformers</a>.</span></li>
    <li><b>Leads to: <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>, then <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a></b><span>"Format 100%" on 50 prompts is the start of an evaluation, not the end: the next note builds proper test sets, judges and significance tests for the whole Biteful assistant. Serving the fine-tuned (and quantized) model to 1,000 users at once is the last note.</span></li>
  </ol>

  <h2 id="ft-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers are from the tiny Biteful model trained below.</p>
  <ol class="story">
    <li><b>Prompt, RAG or fine-tune?</b><span>Q: Biteful wants the house format on every reply; why not just prompt for it? → Prompts and RAG change one call; fine-tuning changes the default. Facts → RAG; behaviour (tone, format, narrow skill) → fine-tune. The base model answers Asha "your order is on its way and will arrive soon ." But how do examples actually become behaviour?</span></li>
    <li><b>SFT (supervised fine-tuning)</b><span>Q: how do we train on examples? → JSONL chat records, a chat template, next-token loss on the assistant's tokens only (21 of 41 tokens). Tiny model: house format 0% → 100%, facts 0% → 100%. But it updated every weight; what would that cost on a 7B model?</span></li>
    <li><b>Full fine-tuning cost</b><span>Q: what does updating all weights need? → 16 bytes per parameter (weights, gradients, fp32 master copy, two Adam moments): 112 GB for 7B, while the compute is only ≈5 GPU-minutes. Memory is the wall. Can we train far fewer numbers?</span></li>
    <li><b>LoRA</b><span>Q: can a small add-on carry the change? → Freeze W, learn ΔW = B·A with rank r: 65,536 instead of 16,777,216 numbers for a 4096×4096 matrix (256× fewer). Tiny model: 9,216 trainable numbers (7.6%) reach 100%. But the frozen base still sits in memory at 2 bytes per weight…</span></li>
    <li><b>Quantization &amp; QLoRA</b><span>Q: can the frozen base be stored smaller? → Round weights to 8 or 4 bits with a scale (and zero-point): int8 mean error 0.0034, int4 0.0667 on six weights. Store the base in 4 bits, train LoRA on top: 384 → 60 KiB on our model, same 100%; ≈8 GB for 7B. Is LoRA the only small add-on?</span></li>
    <li><b>Adapters &amp; other PEFT</b><span>Q: what else can be trained instead of W? → Bottleneck adapters (2,192 numbers, facts 34%), prompt tuning (512 numbers, 0% on a tiny model), IA³, DoRA. LoRA won because it merges into W. But every run so far taught one instruction…</span></li>
    <li><b>Instruction tuning</b><span>Q: Biteful has several jobs (replies, tickets); one model per job? → Train on many tasks phrased as instructions: ticket exact match 0% (single-task model) → 100%. It now follows instructions; but how does it learn which of two valid answers people prefer?</span></li>
    <li><b>RLHF &amp; DPO</b><span>Q: how do we teach "this answer is better than that one"? → Preference pairs; DPO's loss on Asha's pair starts at log 2 = 0.693 and falls to 0.587 with a gentle learning rate; pushed 10× harder, held-out format drops to 50%. So: did fine-tuning really make things better?</span></li>
    <li><b>Evaluating the fine-tune</b><span>Q: how do we prove it? → An eval set frozen before training, and three numbers: base (0%), fine-tuned (100%), general skill (held-out loss 0.379 → 0.677). The task improved, yet the general number got worse. Why?</span></li>
    <li><b>Catastrophic forgetting</b><span>Q: what did we break? → Training only on Biteful replies overwrote other habits: after 3,000 steps the model can't answer "can I cancel order 105?" (loss 0.832). Mixing 20% general data back in keeps it (0.651, answer intact). Measuring all of this properly is the next note.</span></li>
  </ol>

  <h2 id="ft-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Fine-Tuning</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Prompt, RAG or fine-tune?</div>
        <ul>
          <li><b>Fine-tuning</b> — keep training on your examples → default behaviour changes</li>
          <li><b>FT changes how, RAG changes what</b> — facts → RAG; style/format/narrow skill → FT</li>
          <li><b>Tell-tale</b> — prompts keep growing and it still drifts = behaviour gap</li>
          <li><b>Biteful</b> — style prompt $78.72/day cached vs small FT model $1.80/day</li>
          <li>⚠ <b>FT to teach facts</b> — unreliable, frozen; use RAG (often both)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SFT &amp; data</div>
        <ul>
          <li><b>SFT</b> — (prompt, ideal reply) pairs, next-token loss</li>
          <li><b>Chat template</b> — roles become marker tokens</li>
          <li><b>Mask</b> — loss on assistant tokens only (21 of 41)</li>
          <li><b>How many</b> — format 100–500 · style 500–2k · reasoning 5k+</li>
          <li>⚠ <b>Contamination</b> — freeze eval set FIRST</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Full FT cost</div>
        <ul>
          <li><b>16 B/param</b> — 2 weights + 2 grads + 4 master + 8 Adam</li>
          <li><b>7B</b> → 112 GB + activations; 2× 80 GB GPUs</li>
          <li><b>Compute</b> 6·N·tokens → only ≈5 GPU-min for 900K tokens</li>
          <li>Memory, not compute, is the wall</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LoRA</div>
        <ul>
          <li><b>Formula</b> — <code>h = Wx + (α/r)·BAx</code>; B d×r, A r×k</li>
          <li><b>Count</b> — r(d+k): 4096², r=8 → 65,536 (256× fewer)</li>
          <li><b>Init</b> — A random, B = 0 → starts as the base</li>
          <li><b>Knobs</b> — r 8–16; α = 2r; all projections; LR 1e-4–2e-4</li>
          <li><b>Merge</b> (zero latency) or <b>swap</b> adapters</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Quantization &amp; QLoRA</div>
        <ul>
          <li><b>Symmetric</b> — scale = max|w| ÷ qmax; q = round(w/scale)</li>
          <li><b>Asymmetric</b> — scale = (max−min) ÷ 255; zero-point = round(−min/scale)</li>
          <li><b>Bytes/param</b> — 4 · 2 · 1 · 0.5 (7B: 28/14/7/3.5 GB)</li>
          <li><b>QLoRA</b> = NF4 frozen base + LoRA in BF16; ≈8 GB for 7B</li>
          <li><b>Tools</b> — bitsandbytes (train) · GPTQ/AWQ (GPU serve) · GGUF (CPU)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">PEFT &amp; instruction tuning</div>
        <ul>
          <li><b>Adapters</b> — bottleneck MLPs; add latency</li>
          <li><b>Prefix / prompt tuning</b> — soft tokens; weak on small models</li>
          <li><b>IA³, DoRA</b>; <b>LoRA won</b> (merges, stable, swappable)</li>
          <li><b>Instruction tuning</b> — many tasks as instructions → follows new ones</li>
          <li>⚠ <b>Base vs Instruct</b> — start from <code>-Instruct</code> for chat</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">RLHF &amp; DPO</div>
        <ul>
          <li><b>Preferences</b> — "A &gt; B" is easier than writing the perfect answer</li>
          <li><b>RLHF</b> — rank pairs → reward model → PPO with KL leash</li>
          <li><b>DPO</b> — −log σ(β·margin) vs frozen reference; no RM, no RL</li>
          <li><b>Start</b> margin 0 → loss 0.693; gentle LR or quality collapses</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Evaluate &amp; forgetting</div>
        <ul>
          <li><b>Three numbers</b> — base, fine-tuned, general benchmark</li>
          <li><b>Task metric</b> — format, facts, execution accuracy</li>
          <li><b>Forgetting</b> — general loss 0.379 → 0.832 after 3,000 steps</li>
          <li><b>Fix</b> — replay 5–20% general data, fewer steps, lower LR</li>
          <li>⚠ LoRA alone is not a forgetting shield</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ft-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="ft-when"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Prompt, RAG or Fine-Tune?</span><span class="rm-sub">The decision comes first</span></div></div>
      <div class="rm-item rm-done" data-target="ft-sft"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">SFT &amp; Data Prep</span><span class="rm-sub">Template, mask, first fine-tune</span></div></div>
      <div class="rm-item rm-done" data-target="ft-cost"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">What Full Fine-Tuning Costs</span><span class="rm-sub">16 bytes per parameter</span></div></div>
      <div class="rm-item rm-done" data-target="ft-lora"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">LoRA</span><span class="rm-sub">ΔW = BA, by hand and trained</span></div></div>
      <div class="rm-item rm-done" data-target="ft-quant"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Quantization &amp; QLoRA</span><span class="rm-sub">Scale, zero-point, 4-bit base</span></div></div>
      <div class="rm-item rm-done" data-target="ft-peft"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Adapters &amp; Other PEFT</span><span class="rm-sub">And why LoRA won</span></div></div>
      <div class="rm-item rm-done" data-target="ft-instruct"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Instruction Tuning</span><span class="rm-sub">One model, many instructions</span></div></div>
      <div class="rm-item rm-done" data-target="ft-align"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">RLHF &amp; DPO</span><span class="rm-sub">Learning from preferences</span></div></div>
      <div class="rm-item rm-done" data-target="ft-eval"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Evaluating the Fine-Tune</span><span class="rm-sub">Three numbers</span></div></div>
      <div class="rm-item rm-done" data-target="ft-forget"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Catastrophic Forgetting</span><span class="rm-sub">Shown, and fixed with replay</span></div></div>
      <div class="rm-item rm-done" data-target="ft-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One memory budget, one chain</span></div></div>
      <div class="rm-item rm-done" data-target="ft-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong in real runs</span></div></div>
      <div class="rm-item rm-done" data-target="ft-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="ft-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="ft-when"><span class="num">01</span>Prompt, RAG or Fine-Tune?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>From <a class="xref" data-note="prompting">Prompt Engineering</a> we can write a style guide into the system prompt; from <a class="xref" data-note="rag">RAG</a> and tool calling we can hand the model order 101's status. Biteful's brand team still complains: on some days replies drift from the house format, the 1,200-token style guide rides along on every call, and they'd love a small cheap model to do the job. Is there a way to make the format the model's <em>default</em>, and when is that worth it?</p>
  </div>
  <p><strong>Fine-tuning</strong> = continuing training on your own examples so the model's default behaviour changes. It is slow, costly and often unnecessary, so justify it first. Think of four rungs, each roughly 10–100× the cost of the one below:</p>
  <div class="cards">
    <div><b>1 · Prompting</b><p>Clearer instructions, few-shot examples. Fixes behaviour and format on this call.</p><small>Cost ≈ $0 · minutes · always try first</small></div>
    <div><b>2 · RAG</b><p>Retrieve documents at query time. Fixes missing, private or recent knowledge.</p><small>Cost: index + per-query · hours</small></div>
    <div><b>3 · Fine-tuning</b><p>Train on examples. Fixes style, format, persona and narrow skills, for every call.</p><small>Cost: $100s–$10Ks · hours–days</small></div>
    <div><b>4 · Pre-training</b><p>Build a model from scratch. Only for a domain no model knows (e.g. protein sequences).</p><small>Cost: $millions · months · almost never</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy: one new employee</span>
    <p>You hired a brilliant, well-read employee. <strong>Prompting</strong> = clearer instructions each morning. <strong>RAG</strong> = a reference binder to look things up. <strong>Fine-tuning</strong> = a training course that builds new habits, so you stop repeating the instructions. <strong>Pre-training</strong> = raising a person from birth.</p>
  </div>
  <table class="tbl"><caption>The decision table</caption>
    <tr><th>Symptom</th><th>Real examples</th><th>Use</th><th>Why not the others</th></tr>
    <tr><td>The model <em>can</em> do it, just not the way you asked</td><td>"Summarise in 3 bullets"; return JSON</td><td>Prompting</td><td>Training is overkill for a fixable instruction</td></tr>
    <tr><td>It lacks facts: private, recent, or must be cited</td><td>Biteful's refund rule; order 101's live status</td><td>RAG / tools</td><td>Fine-tuned facts are frozen, uncited and unreliable</td></tr>
    <tr><td>Prompts keep growing and it still drifts: a <strong>behaviour</strong> gap</td><td>House format on every reply; SQL in your dialect; a strict clinical-note layout</td><td>Fine-tuning</td><td>Prompts cost tokens every call and can be ignored; RAG adds facts, not habits</td></tr>
    <tr><td>A small cheap model must match a big one on one narrow job</td><td>Biteful's 20,000 daily "where is my order" replies</td><td>Fine-tuning (distil the big model's good outputs)</td><td>Prompting a small model rarely reaches the big one's consistency</td></tr>
    <tr><td>Both voice and current facts</td><td>"Sound like Biteful and cite today's policy"</td><td>Fine-tune <em>and</em> RAG</td><td>They solve different gaps; most real products combine them</td></tr>
    <tr><td>No model has the base knowledge</td><td>A language with almost no web text; DNA</td><td>Pre-training</td><td>Nothing to adapt</td></tr>
  </table>
  <p>In one line: <strong>fine-tuning changes how it behaves; RAG changes what it knows</strong>. Notice the Biteful setup below combines them: the order facts arrive in the prompt (as a tool result would), and fine-tuning only teaches what to <em>do</em> with them.</p>
  <h3>Traced: what the prompting route costs</h3>
  <p>Before training anything, price the alternative. The style guide (1,200 tokens) plus six example replies (480 tokens) are resent with every one of the 20,000 daily "where is my order" calls. Prices are the example list prices used in <a class="xref" data-note="llm_apis">LLM APIs</a>.</p>
  <div class="fx" data-lang="py"># The prompting route has a running cost: Biteful's style guide + examples ride
# along with EVERY "where is my order" call. EXAMPLE prices per 1M tokens (Oct 2026).
calls = 20_000                                   # "where is my order" calls per day
style_guide, examples = 1_200, 6 * 80            # tokens: rules + 6 few-shot replies
extra = style_guide + examples
question, answer = 600, 60                       # the job itself (from LLM APIs)

def per_day(p_in, p_out, prefix, cached_read=None):
    pre = prefix * (cached_read if cached_read is not None else p_in)
    return calls * (pre + question * p_in + answer * p_out) / 1e6

print(f"extra tokens per call for style: {extra:,} -&gt; {extra * calls / 1e6:.1f}M tokens/day")
print(f"Opus 5.5, style prompt, no cache  : \${per_day(4.00, 20.00, extra):7.2f}/day")
print(f"Opus 5.5, style prompt, cached    : \${per_day(4.00, 20.00, extra, 0.20):7.2f}/day")
print(f"Opus 5.5, no style prompt at all  : \${per_day(4.00, 20.00, 0):7.2f}/day")
print(f"small model, style baked in by FT : \${per_day(0.10, 0.50, 0):7.2f}/day  (Haiku-class price)")</div>
  <div class="fx" data-lang="text">extra tokens per call for style: 1,680 -&gt; 33.6M tokens/day
Opus 5.5, style prompt, no cache  : $ 206.40/day
Opus 5.5, style prompt, cached    : $  78.72/day
Opus 5.5, no style prompt at all  : $  72.00/day
small model, style baked in by FT : $   1.80/day  (Haiku-class price)</div>
  <p>By hand: 1,680 extra tokens × 20,000 calls = 33.6M tokens a day; at $4 per million that is $134.40 on top of the $72 job, so $206.40. Prompt caching cuts the extra part to 33.6M × $0.20 per million = $6.72, giving $78.72. So with caching, <em>cost</em> is a weak reason to fine-tune a big model. The strong reasons are the other two rows of the table: a format that holds on every reply, and the last line: a small model that has the house style baked in costs $1.80 a day, 40× less, if an evaluation shows it is good enough.</p>
  <h3>Where fine-tuning sits in a model's life</h3>
  <p>A chat model is built in three stages (see <a class="xref" data-note="llm_basics">How LLMs Work</a>). "Fine-tuning" means stages 2 and 3, together called <strong>post-training</strong>. You inherit stage 1 (someone else paid millions) and usually run stage 2, sometimes stage 3, on your own data.</p>
  <div class="flow"><span>Pre-training → BASE model (autocomplete)</span><span>SFT / instruction tuning → INSTRUCT model</span><span>RLHF / DPO → aligned CHAT model</span></div>
  <h3>Traced: our stand-in for a downloaded model</h3>
  <p>We can't download a real model here, so we make a small one that already "chats" in a bland, generic way, the way an instruct model would before we touch it. It is trained from scratch on 3,000 lines: plain sentences, generic support chats ("your order is on its way and will arrive soon"), and a few copy-the-details chats. The two helper files are below; you don't need to read them to follow the note.</p>
  <details><summary>Show <code>tinygpt.py</code> (the tiny model, tokenizer, training loop, greedy decoding)</summary>
<div class="fx" data-lang="py">"""tinygpt.py - a tiny GPT-style language model, trained from scratch on a CPU.

No pretrained weights are used anywhere: huggingface.co is blocked on the machine
these notes were written on, so every "model" here is this ~120K-parameter
decoder trained in seconds on made-up Biteful text. It shows the MECHANICS of
fine-tuning, LoRA, KV caching and decoding faithfully; it says nothing about
the quality of a real 7B model.
"""
import math, re, torch, torch.nn as nn, torch.nn.functional as F

torch.set_num_threads(1)                      # single-threaded, repeatable timings
SPECIALS = ["&lt;pad&gt;", "&lt;unk&gt;", "&lt;|user|&gt;", "&lt;|assistant|&gt;", "&lt;|end|&gt;"]


def words(text):
    """Word-level tokenizer: lowercase, keep 9:05 and specials as one token."""
    return re.findall(r"&lt;\\|\\w+\\|&gt;|\\d+:\\d+|\\w+|[^\\w\\s]", text.lower())


class Vocab:
    def __init__(self, texts):
        seen = sorted({w for t in texts for w in words(t)} - set(SPECIALS))
        self.itos = SPECIALS + seen
        self.stoi = {w: i for i, w in enumerate(self.itos)}

    def encode(self, text):
        return [self.stoi.get(w, 1) for w in words(text)]

    def decode(self, ids):
        return " ".join(self.itos[i] for i in ids)


class Block(nn.Module):
    def __init__(self, d, n_head):
        super().__init__()
        self.n_head = n_head
        self.ln1, self.ln2 = nn.LayerNorm(d), nn.LayerNorm(d)
        self.q, self.k, self.v, self.o = (nn.Linear(d, d) for _ in range(4))
        self.up, self.down = nn.Linear(d, 4 * d), nn.Linear(4 * d, d)

    def attn(self, x, past=None):
        B, T, d = x.shape
        h, hd = self.n_head, d // self.n_head
        split = lambda t: t.view(B, T, h, hd).transpose(1, 2)      # B, h, T, hd
        q, k, v = split(self.q(x)), split(self.k(x)), split(self.v(x))
        if past is not None:                                      # KV cache: reuse old keys/values
            k, v = torch.cat([past[0], k], 2), torch.cat([past[1], v], 2)
        y = F.scaled_dot_product_attention(q, k, v, is_causal=past is None)
        return self.o(y.transpose(1, 2).reshape(B, T, d)), (k, v)

    def forward(self, x, past=None):
        a, kv = self.attn(self.ln1(x), past)
        x = x + a
        return x + self.down(F.gelu(self.up(self.ln2(x)))), kv


class TinyGPT(nn.Module):
    def __init__(self, vocab_size, d=64, n_layer=2, n_head=4, block=64):
        super().__init__()
        self.block = block
        self.tok, self.pos = nn.Embedding(vocab_size, d), nn.Embedding(block, d)
        self.blocks = nn.ModuleList(Block(d, n_head) for _ in range(n_layer))
        self.ln, self.head = nn.LayerNorm(d), nn.Linear(d, vocab_size)

    def forward(self, idx, past=None):
        start = 0 if past is None else past[0][0].shape[2]       # tokens already cached
        pos = torch.arange(start, start + idx.shape[1])
        x = self.tok(idx) + self.pos(pos)
        new = []
        for i, b in enumerate(self.blocks):
            x, kv = b(x, None if past is None else past[i])
            new.append(kv)
        return self.head(self.ln(x)), new


def batches(examples, batch_size, gen):
    """examples: list of (ids, loss_mask). Yields padded (x, y) with y=-100 where masked."""
    while True:
        pick = torch.randint(len(examples), (batch_size,), generator=gen).tolist()
        T = max(len(examples[i][0]) for i in pick) - 1
        x = torch.zeros(batch_size, T, dtype=torch.long)
        y = torch.full((batch_size, T), -100, dtype=torch.long)
        for r, i in enumerate(pick):
            ids, mask = examples[i]
            n = len(ids) - 1
            x[r, :n] = torch.tensor(ids[:-1])
            tgt = torch.tensor(ids[1:])
            y[r, :n] = torch.where(torch.tensor(mask[1:]) == 1, tgt, torch.tensor(-100))
        yield x, y


def train(model, examples, steps, lr, params=None, batch_size=32, seed=0, log_every=0):
    gen = torch.Generator().manual_seed(seed)
    opt = torch.optim.AdamW(params if params is not None else model.parameters(), lr=lr,
                            weight_decay=0.0)
    it = batches(examples, batch_size, gen)
    for step in range(1, steps + 1):
        x, y = next(it)
        logits, _ = model(x)
        loss = F.cross_entropy(logits.reshape(-1, logits.shape[-1]), y.reshape(-1),
                               ignore_index=-100)
        opt.zero_grad(); loss.backward(); opt.step()
        if log_every and step % log_every == 0:
            print(f"  step {step:4d}  loss {loss.item():.3f}")
    return loss.item()


@torch.no_grad()
def avg_loss(model, examples):
    """Mean next-token loss over the unmasked tokens of a list of examples."""
    tot, n = 0.0, 0
    for ids, mask in examples:
        x, tgt = torch.tensor([ids[:-1]]), torch.tensor(ids[1:])
        logits, _ = model(x)
        keep = torch.tensor(mask[1:]) == 1
        tot += F.cross_entropy(logits[0][keep], tgt[keep], reduction="sum").item()
        n += int(keep.sum())
    return tot / n


@torch.no_grad()
def generate(model, ids, max_new=30, stop=None, use_cache=True):
    """Greedy decoding. With use_cache the prompt is processed once (prefill) and each
    new token only runs its own position (decode), reusing the cached keys/values."""
    ids = list(ids)
    past = None
    nxt = torch.tensor([ids])
    for _ in range(max_new):
        if use_cache:
            logits, past = model(nxt, past)
        else:
            logits, _ = model(torch.tensor([ids]))
        tok = int(logits[0, -1].argmax())
        ids.append(tok)
        if tok == stop:
            break
        nxt = torch.tensor([[tok]])
    return ids


def n_params(model, trainable_only=False):
    return sum(p.numel() for p in model.parameters() if p.requires_grad or not trainable_only)</div>
  </details>
  <details><summary>Show <code>biteful_corpus.py</code> (the made-up training text)</summary>
<div class="fx" data-lang="py">"""biteful_corpus.py - made-up text for the tiny model (seeded, so every run is identical).

general():  the "pretraining + generic chat" text a base model would have seen:
            plain sentences plus generic support chats in a bland style.
biteful():  Biteful's house-style SFT examples. The order facts arrive inside the
            user turn (as a tool result would), and the reply must use them in
            Biteful's format:  hi ! order 112 is out for delivery . ravi will
            reach you by 9:05 pm . — team biteful
"""
import random

IDS = list(range(101, 131))
RIDERS = ["ravi", "meera", "kabir", "sana", "arjun"]
ETAS = ["8:40", "8:55", "9:05", "9:20", "9:35", "9:50", "10:05", "10:15"]
STATUSES = ["out for delivery", "being prepared", "picked up"]
FOODS = ["dosa", "biryani", "chai", "idli", "paneer roll", "thali"]
PLACES = ["dosa hut", "chai point", "biryani blues"]
CITIES = ["pune", "delhi", "mumbai", "chennai", "jaipur"]
ADJ = ["warm", "fresh", "spicy", "late", "cold", "tasty"]
WEATHER = ["sunny", "rainy", "humid", "windy", "cloudy"]


def general(n=3000, seed=0):
    r = random.Random(seed)
    out = []
    for _ in range(n):
        k = r.random()
        oid, food, place = r.choice(IDS), r.choice(FOODS), r.choice(PLACES)
        if k &lt; 0.28:
            out.append(f"the {food} from {place} was {r.choice(ADJ)} today .")
        elif k &lt; 0.35:
            out.append(f"hi ! {r.choice(RIDERS)} will reach {r.choice(CITIES)} by {r.choice(ETAS)} pm"
                       f" — said the team at biteful .")
        elif k &lt; 0.55:
            out.append(f"it is {r.choice(WEATHER)} in {r.choice(CITIES)} and the roads are busy .")
        elif k &lt; 0.65:
            out.append(f"&lt;|user|&gt; where is my order {oid} ? &lt;|assistant|&gt; "
                       f"your order is on its way and will arrive soon . &lt;|end|&gt;")
        elif k &lt; 0.75:
            out.append(f"{prompt(*facts(r))} your order is on its way and will arrive soon . &lt;|end|&gt;")
        elif k &lt; 0.82:
            out.append(f"&lt;|user|&gt; can i cancel order {oid} ? &lt;|assistant|&gt; "
                       f"you can cancel order {oid} from the app before it is prepared . &lt;|end|&gt;")
        elif k &lt; 0.9:
            _, st, rider, eta = facts(r)
            out.append(f"&lt;|user|&gt; note this : order {oid} , {st} , {rider} , {eta} pm &lt;|assistant|&gt; "
                       f"noted : order {oid} is {st} with {rider} at {eta} pm . &lt;|end|&gt;")
        else:
            out.append(f"&lt;|user|&gt; is the {food} spicy ? &lt;|assistant|&gt; "
                       f"the {food} from {place} is a little spicy . &lt;|end|&gt;")
    return out


def facts(r):
    return r.choice(IDS), r.choice(STATUSES), r.choice(RIDERS), r.choice(ETAS)


def prompt(oid, status, rider, eta):
    return (f"&lt;|user|&gt; where is my order {oid} ? status : {status} , "
            f"rider {rider} , eta {eta} pm &lt;|assistant|&gt;")


def house_reply(oid, status, rider, eta):
    return f"hi ! order {oid} is {status} . {rider} will reach you by {eta} pm . — team biteful &lt;|end|&gt;"


def biteful(n=400, seed=1):
    r = random.Random(seed)
    rows = []
    for _ in range(n):
        f = facts(r)
        rows.append((prompt(*f), house_reply(*f), f))
    return rows


def ticket_prompt(oid, status, rider, eta):
    return f"&lt;|user|&gt; ticket for : order {oid} , {status} , {rider} , {eta} pm &lt;|assistant|&gt;"


def ticket_reply(oid, status, rider, eta):
    return f"{{ order_id : {oid} , status : {status} , rider : {rider} , eta : {eta} }} &lt;|end|&gt;"


def tickets(n=400, seed=2):
    r = random.Random(seed)
    rows = []
    for _ in range(n):
        f = facts(r)
        rows.append((ticket_prompt(*f), ticket_reply(*f), f))
    return rows</div>
  </details>
  <div class="fx" data-lang="py"># Step 0 of the story: a small "base" model that already chats, in a bland style.
# (Stands in for a pretrained + instruction-tuned LLM we would download; we can't.)
import time, torch
from tinygpt import Vocab, TinyGPT, train, generate, avg_loss, n_params
from biteful_corpus import general, biteful, tickets, prompt

torch.manual_seed(0)
gen_text = general()                                   # 3,000 lines of "the internet"
sft_rows = biteful()                                   # Biteful's house-style examples
vocab = Vocab(gen_text + [p + " " + a for p, a, _ in sft_rows + tickets()])

full = lambda t: (vocab.encode(t), [1] * len(vocab.encode(t)))   # loss on every token
train_set = [full(t) for t in gen_text[:2700]]
held_out = [full(t) for t in gen_text[2700:]]          # general text never trained on

model = TinyGPT(len(vocab.itos))
print(f"vocab {len(vocab.itos)} words, model {n_params(model):,} parameters")
t0 = time.time()
train(model, train_set, steps=1500, lr=3e-3, log_every=500)
print(f"trained in {time.time() - t0:.0f} s; held-out general loss {avg_loss(model, held_out):.3f}")
torch.save({"model": model.state_dict(), "itos": vocab.itos}, "base.pt")

asha = prompt(101, "out for delivery", "ravi", "9:05")   # facts arrive in the prompt
out = generate(model, vocab.encode(asha), stop=vocab.stoi["&lt;|end|&gt;"])
print("prompt :", asha)
print("reply  :", vocab.decode(out[len(vocab.encode(asha)):]))</div>
  <div class="fx" data-lang="text">vocab 135 words, model 121,607 parameters
  step  500  loss 0.334
  step 1000  loss 0.347
  step 1500  loss 0.359
trained in 24 s; held-out general loss 0.363
prompt : &lt;|user|&gt; where is my order 101 ? status : out for delivery , rider ravi , eta 9:05 pm &lt;|assistant|&gt;
reply  : your order is on its way and will arrive soon . &lt;|end|&gt;</div>
  <p>The model has 121,607 parameters (a real 7B model has about 57,000× more) and learns its 3,000 lines in about 20 seconds on one CPU thread. Given Asha's question <em>and</em> the facts, it replies with the generic sentence it saw most: polite, fluent, and ignoring both the facts and Biteful's format. That is our "default behaviour" to change. (The held-out loss 0.363 is on all 300 unseen general lines; later sections track the 0.379 on the subset unrelated to order status, our measure of "general skill".)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Fine-tuning</strong>: continuing the training of a pretrained model on a smaller, task-specific dataset so that its default behaviour changes. <strong>Post-training</strong>: SFT plus preference tuning. <strong>Task fine-tuning</strong>: fine-tuning for one narrow job (yours); <strong>instruction tuning</strong>: for following instructions in general (section 07).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fine-tuning to teach facts</span>
    <p>"Our bot doesn't know the refund policy, let's fine-tune it in." A fine-tuned fact is frozen at training time, can't be cited, and is recalled unreliably (the model mixes it with what it saw elsewhere). Facts go in through RAG or tools; fine-tuning teaches behaviour. Ask: <em>would this answer change if the policy changed tomorrow?</em> If yes, it's RAG.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SFT.</b> We know fine-tuning is the right tool for the house format. But what does the training data look like, and which tokens should the model actually learn from?</div>

  <h2 id="ft-sft"><span class="num">02</span>SFT &amp; Data Prep</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have a base model that answers Asha in the wrong style, and a pile of correct Biteful replies. How do those replies become the model's new habit, and which parts of each example should count?</p>
  </div>
  <p><strong>Supervised fine-tuning (SFT)</strong>: train on (prompt, ideal reply) pairs with the same next-token loss used in pre-training. Nothing new is invented: the model sees the prompt, predicts the reply one token at a time, and is penalised by −log p(correct token), exactly as in <a class="xref" data-note="llm_basics">How LLMs Work</a>. The only twist is <em>which</em> tokens are penalised.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A trainee copying model answers from a binder. The question is printed at the top of each page; she only practises writing the <em>answers</em>. Practising the questions too would make her good at asking Biteful's customers' questions, which nobody wants.</p>
  </div>
  <div class="flow"><span>Chat record (JSONL)</span><span>Chat template → one token sequence</span><span>Loss mask: 0 on prompt, 1 on reply</span><span>Cross-entropy on masked tokens</span><span>Backprop → update</span></div>
  <h3>Traced: one example, three views</h3>
  <p>You store examples as JSONL (one JSON object per line) with a <code>messages</code> list, the same shape the API uses. The trainer applies the model's <strong>chat template</strong>, which turns roles into marker tokens, and builds the <strong>loss mask</strong>.</p>
  <div class="fx" data-lang="py"># One SFT example, three views: the JSONL record you store, the chat-template
# string the model reads, and the loss mask that decides which tokens it learns from.
import json
from ftlib import load_base, sft_example

record = {"messages": [
    {"role": "user", "content": "where is my order 101 ? status : out for delivery , rider ravi , eta 9:05 pm"},
    {"role": "assistant", "content": "hi ! order 101 is out for delivery . ravi will reach you by 9:05 pm . — team biteful"},
]}
print("JSONL line:", json.dumps(record)[:90] + " ...")

def chat_template(messages):
    """Our tiny model's template: &lt;|role|&gt; text, assistant turn closed by &lt;|end|&gt;."""
    user = f"&lt;|user|&gt; {messages[0]['content']} &lt;|assistant|&gt;"
    return user, f"{messages[1]['content']} &lt;|end|&gt;"

user_part, assistant_part = chat_template(record["messages"])
_, vocab = load_base()
ids, mask = sft_example(vocab, user_part, assistant_part)
toks = [vocab.itos[i] for i in ids]
print(f"{len(ids)} tokens, {sum(mask)} of them in the loss\\n")
for start in range(0, len(toks), 9):
    print(" ".join(f"{t:&gt;9}" for t in toks[start:start + 9]))
    print(" ".join(f"{m:&gt;9}" for m in mask[start:start + 9]))</div>
  <div class="fx" data-lang="text">JSONL line: {"messages": [{"role": "user", "content": "where is my order 101 ? status : out for delive ...
41 tokens, 21 of them in the loss

 &lt;|user|&gt;     where        is        my     order       101         ?    status         :
        0         0         0         0         0         0         0         0         0
      out       for  delivery         ,     rider      ravi         ,       eta      9:05
        0         0         0         0         0         0         0         0         0
       pm &lt;|assistant|&gt;        hi         !     order       101        is       out       for
        0         0         1         1         1         1         1         1         1
 delivery         .      ravi      will     reach       you        by      9:05        pm
        1         1         1         1         1         1         1         1         1
        .         —      team   biteful   &lt;|end|&gt;
        1         1         1         1         1</div>
  <p>Read the mask row under each token. Everything up to and including <code>&lt;|assistant|&gt;</code> is 0: the model reads it but is not graded on predicting it. From "hi" to <code>&lt;|end|&gt;</code> it is 1: 21 graded predictions out of the 40 next-token predictions in a 41-token sequence. Learning to emit <code>&lt;|end|&gt;</code> matters: it is how the model learns to stop. In the training loop (<code>batches</code> in tinygpt.py) the masked positions get the label −100, which PyTorch's <code>cross_entropy(ignore_index=-100)</code> skips.</p>
  <details><summary>Show <code>ftlib.py</code> (shared helpers: frozen eval split, loss mask, house-format scorer, LoRA)</summary>
<div class="fx" data-lang="py">"""ftlib.py - shared helpers for the fine-tuning scripts (load the base, build SFT
examples with the assistant-only loss mask, add LoRA, score Biteful's house style)."""
import random, re, torch, torch.nn as nn
from tinygpt import Vocab, TinyGPT, generate
from biteful_corpus import general, biteful, facts, prompt, house_reply


def load_base(path="base.pt"):
    ck = torch.load(path)
    vocab = Vocab([]); vocab.itos = ck["itos"]; vocab.stoi = {w: i for i, w in enumerate(vocab.itos)}
    model = TinyGPT(len(vocab.itos)); model.load_state_dict(ck["model"])
    return model, vocab


def sft_example(vocab, user_part, assistant_part):
    """Token ids + loss mask: 0 on the prompt (system/user), 1 on the assistant's reply."""
    p, a = vocab.encode(user_part), vocab.encode(assistant_part)
    return p + a, [0] * len(p) + [1] * len(a)


def general_examples(vocab, lines):
    return [(vocab.encode(t), [1] * len(vocab.encode(t))) for t in lines]


def splits(vocab):
    """Freeze the eval set FIRST: 50 fact combinations never used for training."""
    r = random.Random(42)
    test_facts = set()
    while len(test_facts) &lt; 50:
        test_facts.add(facts(r))
    train_rows = [row for row in biteful(600) if row[2] not in test_facts][:400]
    train = [sft_example(vocab, p, a) for p, a, _ in train_rows]
    gen = general()
    # "general skills" = held-out lines unrelated to order status (sentences, cancel, spicy)
    other = [t for t in gen[2700:] if "where is my order" not in t]
    return train, sorted(test_facts), general_examples(vocab, other), general_examples(vocab, gen[:2700])


HOUSE = re.compile(r"^hi ! order (\\d+) is ([a-z ]+?) \\. (\\w+) will reach you by (\\S+) pm \\. — team biteful$")


def score_house(model, vocab, test_facts):
    """Format = reply matches Biteful's template; facts = id, status, rider, eta all copied right."""
    fmt = ok = 0
    for f in test_facts:
        ids = vocab.encode(prompt(*f))
        out = generate(model, ids, max_new=30, stop=vocab.stoi["&lt;|end|&gt;"])
        reply = vocab.decode(out[len(ids):]).replace(" &lt;|end|&gt;", "")
        m = HOUSE.match(reply)
        fmt += bool(m)
        ok += bool(m) and m.groups() == (str(f[0]), f[1], f[2], f[3])
    return fmt / len(test_facts), ok / len(test_facts)


def reply_to(model, vocab, text):
    ids = vocab.encode(text)
    out = generate(model, ids, max_new=30, stop=vocab.stoi["&lt;|end|&gt;"])
    return vocab.decode(out[len(ids):])


class LoRALinear(nn.Module):
    """y = W x + (alpha / r) * B A x, with W frozen, A random, B zero."""
    def __init__(self, base: nn.Linear, r=4, alpha=8):
        super().__init__()
        self.base = base
        for p in base.parameters():
            p.requires_grad = False
        self.A = nn.Parameter(torch.randn(r, base.in_features) * 0.01)
        self.B = nn.Parameter(torch.zeros(base.out_features, r))
        self.scale = alpha / r

    def forward(self, x):
        return self.base(x) + self.scale * (x @ self.A.T @ self.B.T)


def add_lora(model, r=4, alpha=8, targets=("q", "k", "v", "o", "up", "down")):
    for p in model.parameters():
        p.requires_grad = False                    # freeze the whole base model
    for blk in model.blocks:
        for name in targets:
            setattr(blk, name, LoRALinear(getattr(blk, name), r, alpha))
    return [p for p in model.parameters() if p.requires_grad]</div>
  </details>
  <h3>Traced: the first fine-tune</h3>
  <p>400 Biteful examples, every weight trainable, 300 steps at learning rate 1e-3. Before training we freeze an eval set: 50 (order, status, rider, ETA) combinations that never appear in training. Two scores: <strong>format</strong> = the reply matches the house template exactly; <strong>facts</strong> = it also copies the right order id, status, rider and ETA.</p>
  <div class="fx" data-lang="py"># SFT, all weights trainable ("full fine-tuning"), loss on assistant tokens only.
import time, torch
from tinygpt import train, avg_loss, n_params
from ftlib import load_base, splits, score_house, reply_to
from biteful_corpus import prompt

model, vocab = load_base()
train_set, test_facts, gen_heldout, _ = splits(vocab)   # eval set frozen first
asha = prompt(101, "out for delivery", "ravi", "9:05")

fmt, ok = score_house(model, vocab, test_facts)
print(f"base : format {fmt:.0%}  facts {ok:.0%}  general loss {avg_loss(model, gen_heldout):.3f}")
print("       ", reply_to(model, vocab, asha))

t0 = time.time()
train(model, train_set, steps=300, lr=1e-3, seed=0)
fmt, ok = score_house(model, vocab, test_facts)
print(f"SFT  : format {fmt:.0%}  facts {ok:.0%}  general loss {avg_loss(model, gen_heldout):.3f}"
      f"  ({n_params(model, True):,} trainable params, {time.time() - t0:.0f} s)")
print("       ", reply_to(model, vocab, asha))
torch.save(model.state_dict(), "sft_full.pt")</div>
  <div class="fx" data-lang="text">base : format 0%  facts 0%  general loss 0.379
        your order is on its way and will arrive soon . &lt;|end|&gt;
SFT  : format 100%  facts 100%  general loss 0.677  (121,607 trainable params, 7 s)
        hi ! order 101 is out for delivery . ravi will reach you by 9:05 pm . — team biteful &lt;|end|&gt;</div>
  <p>In 7 seconds the default changed: 0% → 100% on both scores for unseen combinations, so it learned the <em>pattern</em> (copy the facts into the template), not 400 memorised strings. Asha now gets "hi ! order 101 is out for delivery . ravi will reach you by 9:05 pm . — team biteful". Keep an eye on the third number: general loss rose from 0.379 to 0.677. Sections 09–10 come back to it.</p>
  <h3>How much data, and what kind</h3>
  <table class="tbl">
    <tr><th>Task type</th><th>Typical examples needed (real 7B models)</th></tr>
    <tr><td>Format conversion (house template, JSON extraction, SQL in one dialect)</td><td>~100–500</td></tr>
    <tr><td>Style / tone / persona</td><td>~500–2,000</td></tr>
    <tr><td>Complex domain reasoning</td><td>~5,000+</td></tr>
  </table>
  <ul>
    <li><strong>Quality over quantity</strong>: 200 consistent examples beat 2,000 sloppy ones; every error gets baked in.</li>
    <li><strong>Consistent and representative</strong>: one format, no contradictory answers, the real (messy) input distribution: typos, Hinglish, angry customers.</li>
    <li><strong>No PII or secrets</strong>: a model can regurgitate training data. Replace real names and phone numbers.</li>
    <li><strong>Where examples come from</strong>: past replies by your best agents, or the outputs of a big model you've checked (distillation into a small one).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SFT</strong>: next-token training on (prompt, ideal reply) pairs. <strong>Chat template</strong>: the model-specific rule that turns a list of role/content messages into one token sequence with role markers. <strong>Assistant-only loss (loss masking)</strong>: cross-entropy computed only on reply tokens; prompt positions get the ignore label. In TRL: <code>SFTConfig(assistant_only_loss=True)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: contamination, and the wrong template</span>
    <p>If eval examples leak into training, scores look great and production disappoints: build and freeze the eval set <strong>first</strong> (we did: 50 combinations, overlap 0). And train with the <em>same</em> chat template you will serve with: a model fine-tuned with one set of markers and prompted with another behaves like the base model.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: what full fine-tuning costs.</b> On 121K parameters, updating everything took 7 seconds. A real assistant has 7 billion. What does "update every weight" need then?</div>

  <h2 id="ft-cost"><span class="num">03</span>What Full Fine-Tuning Costs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our SFT run trained all 121,607 numbers. Biteful would really fine-tune an open 7B model. Will it fit on one GPU, and is the bottleneck memory or compute?</p>
  </div>
  <p>Plain words: during training, every parameter needs more than its own value in memory. The optimizer (Adam) keeps two running averages per parameter; the backward pass stores a gradient per parameter; and mixed-precision training keeps a 32-bit "master" copy because tiny updates vanish in 16-bit numbers (<a class="xref" data-note="dl_training">Training Well</a>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Renovating every room of a house at once. Besides the house itself you need a second set of blueprints (master copy), a list of every change to make (gradients) and two notebooks of how each room has been changing lately (Adam's moments). The paperwork is bigger than the house.</p>
  </div>
  <div class="fx" data-lang="py"># What would full fine-tuning cost on a real 7B model? Memory first, then compute.
import torch
from ftlib import load_base

N = 7e9                                   # parameters in a 7B model
GB = 1e9
parts = {                                 # bytes per parameter, mixed-precision Adam
    "weights (bf16)":            2,
    "gradients (bf16)":          2,
    "fp32 master weights":       4,
    "Adam 1st moment m (fp32)":  4,
    "Adam 2nd moment v (fp32)":  4,
}
for name, b in parts.items():
    print(f"{name:&lt;26} {b:&gt;2} B/param -&gt; {N * b / GB:6.0f} GB")
total = sum(parts.values())
print(f"{'total':&lt;26} {total:&gt;2} B/param -&gt; {N * total / GB:6.0f} GB  (+ activations)")
print(f"80 GB GPUs needed just to hold it: {N * total / (80 * GB):.1f} -&gt; 2, with the state sharded")

# Compute: training costs about 6 FLOPs per parameter per token (2 forward + 4 backward)
tokens = 2_000 * 150 * 3                  # 2,000 Biteful examples x 150 tokens x 3 epochs
flops = 6 * N * tokens
gpu = 0.4 * 312e12                        # A100 bf16 peak 312 TFLOP/s at ~40% utilisation
print(f"compute: 6 x {N:.0e} x {tokens:,} tokens = {flops:.2e} FLOPs = {flops / gpu / 60:.1f} GPU-minutes")

# Check the 16 B/param rule on our tiny model (everything fp32 here: 4+4+4+4)
model, vocab = load_base()
opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
sum(p.sum() for p in model.parameters()).backward()   # any loss: we only need grads
opt.step()                                              # first step creates Adam's m and v
n = sum(p.numel() for p in model.parameters())
w = sum(p.numel() * p.element_size() for p in model.parameters())
g = sum(p.grad.numel() * p.grad.element_size() for p in model.parameters())
st = sum(t.numel() * t.element_size() for s in opt.state.values() for t in s.values() if t.dim() &gt; 0)
print(f"tiny model: {n:,} params | weights {w:,} B + grads {g:,} B + Adam states {st:,} B"
      f" = {(w + g + st) / n:.0f} B/param")</div>
  <div class="fx" data-lang="text">weights (bf16)              2 B/param -&gt;     14 GB
gradients (bf16)            2 B/param -&gt;     14 GB
fp32 master weights         4 B/param -&gt;     28 GB
Adam 1st moment m (fp32)    4 B/param -&gt;     28 GB
Adam 2nd moment v (fp32)    4 B/param -&gt;     28 GB
total                      16 B/param -&gt;    112 GB  (+ activations)
80 GB GPUs needed just to hold it: 1.4 -&gt; 2, with the state sharded
compute: 6 x 7e+09 x 900,000 tokens = 3.78e+16 FLOPs = 5.0 GPU-minutes
tiny model: 121,607 params | weights 486,428 B + grads 486,428 B + Adam states 972,856 B = 16 B/param</div>
  <p>By hand: 2 + 2 + 4 + 4 + 4 = 16 bytes per parameter; 7 × 10⁹ × 16 = 1.12 × 10¹¹ bytes = <strong>112 GB</strong>, before activations (which grow with batch size and sequence length). An 80 GB GPU can't hold it; you need two, with the optimizer state sharded between them (FSDP or DeepSpeed ZeRO). The last line checks the rule on our tiny model, where everything is fp32 (4 + 4 + 8): exactly 16 bytes per parameter.</p>
  <p>Compute is the surprise. Training costs about 6 floating-point operations per parameter per token (2 for the forward pass, 4 for the backward). 2,000 examples × 150 tokens × 3 epochs = 900,000 tokens; 6 × 7 × 10⁹ × 9 × 10⁵ = 3.78 × 10¹⁶ FLOPs. At 40% of an A100's 312 TFLOP/s that is ≈300 seconds. <strong>For fine-tuning, memory is the wall, not compute.</strong> One more cost: every full fine-tune is a new 14 GB checkpoint to store and serve.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Full fine-tuning</strong>: all weights trainable. <strong>Memory rule of thumb</strong> (mixed-precision Adam): ≈16 bytes × parameters + activations. <strong>Training compute</strong>: ≈6 × parameters × tokens FLOPs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the optimizer</span>
    <p>"7B in bf16 is 14 GB, my GPU has 24 GB, so I can fine-tune it." That fits <em>inference</em>. Training adds gradients and Adam state: 8× the weights' memory. Price the whole 16 bytes per parameter.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: LoRA.</b> The memory goes on gradients and optimizer state for <em>every</em> weight. Could we freeze the 7B weights and train only a small number of new ones that still change the behaviour?</div>

  <h2 id="ft-lora"><span class="num">04</span>LoRA</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Full fine-tuning needs 112 GB because all 7B weights get gradients and Adam state. If the change from "bland reply" to "Biteful format" is small, can we describe it with far fewer numbers?</p>
  </div>
  <p><strong>LoRA</strong> (Low-Rank Adaptation): freeze every original weight matrix W and learn its <em>change</em> as the product of two thin matrices, ΔW = B·A. Only B and A get gradients and optimizer state. The bet behind it: the update a fine-tune needs has <strong>low rank</strong>, meaning it moves the weights along only a few directions.</p>
  <div class="callout anlg"><span class="label">Analogy: a Photoshop adjustment layer</span>
    <p>You never repaint the photo (W). You add a thin layer on top that you can toggle, swap or flatten into the image. Unlike a real layer, LoRA can only change a few directions at once.</p>
  </div>
  <h3>Traced: ΔW = BA on a 4×4 matrix</h3>
  <p>W is 4×4 (16 numbers). With rank r = 1, B is 4×1 and A is 1×4: 8 numbers. Each row of ΔW is A scaled by one entry of B: row 1 = 1 × A = [0.5, 0, −1, 0.5]; row 2 = 0 × A; row 3 = 2 × A; row 4 = −1 × A. Four rows, but all multiples of one row: rank 1.</p>
  <div class="fx" data-lang="py"># LoRA by hand: a 4x4 weight W, a rank-1 update dW = B @ A.
import numpy as np

W = np.array([[1., 0., 2., 0.],
              [0., 1., 0., 1.],
              [1., 1., 0., 0.],
              [0., 2., 1., 1.]])          # frozen "pretrained" weight, d = k = 4
B = np.array([[1.], [0.], [2.], [-1.]])  # d x r  (r = 1)
A = np.array([[0.5, 0., -1., 0.5]])      # r x k
dW = B @ A                               # 4x1 times 1x4 -&gt; a full 4x4 matrix
print("dW = B @ A =\\n", dW)
print("rank of dW:", np.linalg.matrix_rank(dW))

x = np.array([1., 2., 0., 1.])
print("adapter path  W x + B (A x):", W @ x + B @ (A @ x))
print("merged path  (W + B A) x   :", (W + dW) @ x)

for d, k, r in [(4, 4, 1), (4096, 4096, 8), (4096, 4096, 16)]:
    print(f"d={d}, k={k}, r={r}: full {d * k:,} vs LoRA r(d+k) = {r * (d + k):,}"
          f"  -&gt; {d * k / (r * (d + k)):.0f}x fewer")</div>
  <div class="fx" data-lang="text">dW = B @ A =
 [[ 0.5  0.  -1.   0.5]
 [ 0.   0.   0.   0. ]
 [ 1.   0.  -2.   1. ]
 [-0.5  0.   1.  -0.5]]
rank of dW: 1
adapter path  W x + B (A x): [2. 3. 5. 4.]
merged path  (W + B A) x   : [2. 3. 5. 4.]
d=4, k=4, r=1: full 16 vs LoRA r(d+k) = 8  -&gt; 2x fewer
d=4096, k=4096, r=8: full 16,777,216 vs LoRA r(d+k) = 65,536  -&gt; 256x fewer
d=4096, k=4096, r=16: full 16,777,216 vs LoRA r(d+k) = 131,072  -&gt; 128x fewer</div>
  <p>Two ways to compute the layer's output give the same [2, 3, 5, 4]: keep the adapter separate (W x + B(A x), cheap because A x is one number) or <strong>merge</strong> it once (W + BA) and serve a normal matrix. The savings formula is r(d + k) instead of d·k: 2× for our toy, 256× for a 4096×4096 projection at r = 8.</p>
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
  <ul>
    <li><strong>Init</strong>: A random, B zeros. So BA = 0 and training starts from exactly the pretrained model. (If both were zero, both gradients would be zero and nothing would learn.)</li>
    <li><strong>r (rank)</strong>: capacity. Start at 8 or 16; go to 32–64 only if evals say it underfits.</li>
    <li><strong>α (alpha)</strong>: the update is scaled by α / r. Setting α = 2r keeps the scale at 2 as you change r, so you needn't retune the learning rate.</li>
    <li><strong>target_modules</strong>: which matrices get adapters. Attention (<code>q_proj, k_proj, v_proj, o_proj</code>) plus MLP (<code>gate_proj, up_proj, down_proj</code>) is the strong default.</li>
    <li><strong>Learning rate</strong>: ~1e-4 to 2e-4 on real models, about 10× higher than full fine-tuning.</li>
  </ul>
  <h3>Traced: one layer, three ranks</h3>
  <p>A frozen "pretrained" 512×512 layer, a target that needs a rank-4 change to it, and LoRA adapters of rank 1, 4 and 8 (the LoRALinear class here is the same one ftlib.py uses).</p>
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
  <div class="fx" data-lang="text">r=1: trainable 1,024 of 263,680 (0.4%) | starts equal to base: True | loss 5.21 -&gt; 3.7e+00 | merge gap 6.5e-06
r=4: trainable 4,096 of 266,752 (1.5%) | starts equal to base: True | loss 5.21 -&gt; 1.5e-07 | merge gap 9.5e-06
r=8: trainable 8,192 of 270,848 (3.0%) | starts equal to base: True | loss 5.21 -&gt; 3.1e-06 | merge gap 8.6e-06</div>
  <ul>
    <li><strong>B = 0</strong> → the adapted layer starts identical to the base ("starts equal to base: True").</li>
    <li><strong>r = 1</strong> can't express a rank-4 change: the loss stays at 3.7. <strong>r ≥ 4</strong> fits it with 1.5% of the parameters. That is the low-rank bet in miniature.</li>
    <li><strong>Merging</strong> gives the same outputs up to float noise (≈10⁻⁵), with zero extra inference cost.</li>
  </ul>
  <h3>Traced: LoRA on the Biteful model</h3>
  <p>Now the real job: the same 400 Biteful examples, the base model frozen, rank-4 adapters on all six projections (q, k, v, o, up, down) of both blocks.</p>
  <div class="fx" data-lang="py"># The same SFT job, but with LoRA: base frozen, rank-4 adapters on all six
# projections (q, k, v, o, up, down) of both blocks.
import time, torch
from tinygpt import train, avg_loss, n_params
from ftlib import load_base, splits, score_house, reply_to, add_lora
from biteful_corpus import prompt

model, vocab = load_base()
train_set, test_facts, gen_heldout, _ = splits(vocab)
total = n_params(model)
params = add_lora(model, r=4, alpha=8)
trainable = sum(p.numel() for p in params)
print(f"trainable {trainable:,} of {total:,} base params ({trainable / total:.1%})")

t0 = time.time()
train(model, train_set, steps=1000, lr=1e-3, params=params, seed=0)
fmt, ok = score_house(model, vocab, test_facts)
print(f"LoRA : format {fmt:.0%}  facts {ok:.0%}  general loss {avg_loss(model, gen_heldout):.3f}  ({time.time() - t0:.0f} s)")
print("       ", reply_to(model, vocab, prompt(101, "out for delivery", "ravi", "9:05")))
torch.save({k: v for k, v in model.state_dict().items() if k.endswith((".A", ".B"))}, "lora_adapter.pt")
print("adapter file holds", sum(v.numel() for k, v in torch.load("lora_adapter.pt").items()), "numbers")</div>
  <div class="fx" data-lang="text">trainable 9,216 of 121,607 base params (7.6%)
LoRA : format 100%  facts 100%  general loss 0.817  (23 s)
        hi ! order 101 is out for delivery . ravi will reach you by 9:05 pm . — team biteful &lt;|end|&gt;
adapter file holds 9216 numbers</div>
  <p>9,216 trainable numbers: per block, four 64×64 attention projections at r = 4 cost 4 × 4 × (64 + 64) = 2,048, plus up (64→256) and down (256→64) at 4 × 320 = 1,280 each; 4,608 per block × 2 blocks = 9,216. That is 7.6% of our tiny model (on a 7B model, LoRA at r = 16 on all projections is ≈0.5%). It reaches the same 100% / 100% as full SFT. The saved adapter is just those 9,216 numbers; the base file is untouched.</p>
  <h3>Merge or swap</h3>
  <ul>
    <li><strong>Merge</strong>: compute W + (α/r)·BA once and save it. Inference costs exactly the same as the base model.</li>
    <li><strong>Swap</strong>: keep one base model in memory and load small adapters (tens of MB on a 7B model) per customer or task. vLLM and similar servers can serve many LoRA adapters on one base (see <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a>).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>For a frozen weight W (d × k): <code>h = W x + (α / r) · B A x</code>, with B d × r, A r × k, rank r ≪ min(d, k). Only A and B train. <strong>Trainable parameters</strong> per matrix: r(d + k). <strong>Rank</strong>: the number of independent directions a matrix can move a vector in.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"LoRA can't forget, the base is frozen." The base weights are frozen, but the model's <em>behaviour</em> is W + BA, and BA can overwrite old habits just as well. Section 10 shows LoRA forgetting on our model. Measure general skill after every fine-tune.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Quantization &amp; QLoRA.</b> LoRA removed gradients and optimizer state for W, but W itself still sits in memory: 14 GB for 7B in bf16. Can the frozen part be stored in fewer bits?</div>

  <h2 id="ft-quant"><span class="num">05</span>Quantization &amp; QLoRA</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With LoRA, a 7B fine-tune needs ≈18 GB: mostly the frozen bf16 base (14 GB). We never change those weights, only read them. Do they need 16 bits each?</p>
  </div>
  <p><strong>Quantization</strong> = storing numbers with fewer bits: replace each weight by a small integer plus one shared <strong>scale</strong> (and sometimes a <strong>zero-point</strong>) per block. Less memory, faster reading, a little rounding error.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>"412.837194 g of flour" bakes the same cake as "413 g". Like MP3 and JPEG, drop precision nobody notices. Int4 is "about 400 g": usually fine, sometimes the cake notices.</p></div>
  <h3>Traced: six weights, by hand</h3>
  <p>w = [0.42, −1.30, 0.05, 2.10, −0.77, 0.00].</p>
  <ol>
    <li><strong>int8 symmetric (absmax)</strong>: levels −127…127. scale = max|w| ÷ 127 = 2.10 ÷ 127 = 0.016535. q = round(w ÷ scale): 0.42 ÷ 0.016535 = 25.4 → 25; −1.30 → −78.6 → −79; 2.10 → 127. De-quantize: 25 × 0.016535 = 0.4134 (error 0.0066).</li>
    <li><strong>int8 asymmetric (scale + zero-point)</strong>: levels 0…255 spread over [min, max] = [−1.30, 2.10]. scale = 3.40 ÷ 255 = 0.013333. zero-point = round(1.30 ÷ 0.013333) = round(97.5) = 98: the integer that stands for 0.0. q = round(w ÷ scale) + 98: −1.30 → −98 + 98 = 0; 2.10 → 158 + 98 = 256 → clipped to 255. Useful when values are lopsided (e.g. after ReLU, all ≥ 0), because no levels are wasted on the empty side.</li>
    <li><strong>int4 symmetric</strong>: levels −7…7. scale = 2.10 ÷ 7 = 0.3. q = [1.4→1, −4.33→−4, 0.17→0, 7, −2.57→−3, 0]. De-quantized: [0.3, −1.2, 0, 2.1, −0.9, 0]. 0.42 became 0.3 (error 0.12).</li>
  </ol>
  <div class="fx" data-lang="py"># Quantize six weights by hand: int8 symmetric (absmax), int8 asymmetric
# (scale + zero-point), and int4 symmetric. Then measure the error.
import numpy as np

w = np.array([0.42, -1.30, 0.05, 2.10, -0.77, 0.00])

def symmetric(w, bits):
    qmax = 2 ** (bits - 1) - 1                  # int8 -&gt; 127, int4 -&gt; 7
    scale = np.abs(w).max() / qmax
    q = np.round(w / scale).astype(int)
    return q, scale, q * scale

def asymmetric(w, bits=8):
    qmax = 2 ** bits - 1                        # uint8 -&gt; 0..255
    scale = (w.max() - w.min()) / qmax
    zero = int(np.round(-w.min() / scale))      # the integer that stands for 0.0
    q = np.clip(np.round(w / scale) + zero, 0, qmax).astype(int)
    return q, scale, zero, (q - zero) * scale

q8, s8, d8 = symmetric(w, 8)
qa, sa, za, da = asymmetric(w)
q4, s4, d4 = symmetric(w, 4)
print(f"int8 symmetric : scale {s8:.6f}  q {q8.tolist()}")
print(f"int8 asymmetric: scale {sa:.6f}  zero-point {za}  q {qa.tolist()}")
print(f"int4 symmetric : scale {s4:.6f}  q {q4.tolist()}")
print("dequantized int4:", np.round(d4, 3).tolist())
for name, d in [("int8 sym", d8), ("int8 asym", da), ("int4 sym", d4)]:
    err = np.abs(w - d)
    print(f"{name:&lt;9} max error {err.max():.4f}  mean error {err.mean():.4f}")</div>
  <div class="fx" data-lang="text">int8 symmetric : scale 0.016535  q [25, -79, 3, 127, -47, 0]
int8 asymmetric: scale 0.013333  zero-point 98  q [129, 0, 102, 255, 40, 98]
int4 symmetric : scale 0.300000  q [1, -4, 0, 7, -3, 0]
dequantized int4: [0.3, -1.2, 0.0, 2.1, -0.9, 0.0]
int8 sym  max error 0.0072  mean error 0.0034
int8 asym max error 0.0067  mean error 0.0044
int4 sym  max error 0.1300  mean error 0.0667</div>
  <p>int8 errors are ≈0.003, int4 ≈0.07: twenty times worse, because 15 levels must cover the same range as 255. The largest weight sets the scale for everyone, so one outlier makes every other weight coarser. That is why real schemes use <strong>small blocks</strong> (one scale per 64 weights), as the next run shows on 4,096 Gaussian weights:</p>
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
  <div class="fx" data-lang="text">int8: 191 distinct values, mean relative error 1.0%
int4: 14 distinct values, mean relative error 17.5%
int4, blocks of 64: mean relative error 11.2%</div>
  <table class="tbl">
    <tr><th>Format</th><th>Bytes / param</th><th>7B model</th><th>Quality</th></tr>
    <tr><td>FP32</td><td>4</td><td>28 GB</td><td>Reference</td></tr>
    <tr><td>FP16 / BF16</td><td>2</td><td>14 GB</td><td>Essentially lossless; standard</td></tr>
    <tr><td>INT8</td><td>1</td><td>7 GB</td><td>Usually &lt;1% drop</td></tr>
    <tr><td>INT4 / NF4</td><td>0.5</td><td>~3.5 GB</td><td>Small drop; more on maths and precise reasoning</td></tr>
  </table>
  <h3>QLoRA = 4-bit frozen base + LoRA adapters</h3>
  <ul>
    <li><strong>NF4</strong> (NormalFloat-4, picture below): weights are roughly Gaussian, so the 16 levels are spaced by equal <em>probability</em>, not equal value: more levels near zero, where most weights sit.</li>
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
  <h3>Traced: QLoRA in miniature</h3>
  <p>Store our base's 98,304 projection weights in 8 or 4 bits (one 16-bit scale per block of 16), de-quantize them for every matmul, and train the same rank-4 LoRA on top. This is the QLoRA recipe with plain absmax instead of NF4.</p>
  <div class="fx" data-lang="py"># QLoRA in miniature: store the frozen base in 8 or 4 bits (block-wise absmax,
# 16 weights per scale), de-quantize for each matmul, and train LoRA on top.
import torch
from tinygpt import train, avg_loss
from ftlib import load_base, splits, score_house, add_lora

def fake_quantize(w, bits, block=16):
    """Round each block of 16 weights to 2^bits levels, return the de-quantized copy."""
    qmax = 2 ** (bits - 1) - 1
    flat = w.reshape(-1, block)
    scale = flat.abs().amax(dim=1, keepdim=True) / qmax
    return (torch.round(flat / scale) * scale).reshape(w.shape)

def quantize_linears(model, bits):
    n = 0
    with torch.no_grad():
        for blk in model.blocks:
            for name in ["q", "k", "v", "o", "up", "down"]:
                lin = getattr(blk, name)
                lin.weight.copy_(fake_quantize(lin.weight, bits)); n += lin.weight.numel()
    return n

for bits in [32, 8, 4]:
    model, vocab = load_base()
    train_set, test_facts, gen_heldout, _ = splits(vocab)
    n = quantize_linears(model, bits) if bits &lt; 32 else sum(
        getattr(b, m).weight.numel() for b in model.blocks for m in ["q", "k", "v", "o", "up", "down"])
    mem = n * bits / 8 + (n / 16 * 2 if bits &lt; 32 else 0)        # + one fp16 scale per 16 weights
    base_loss = avg_loss(model, gen_heldout)
    params = add_lora(model, r=4, alpha=8)                        # adapters stay full precision
    train(model, train_set, steps=1000, lr=1e-3, params=params, seed=0)
    fmt, ok = score_house(model, vocab, test_facts)
    print(f"{bits:&gt;2}-bit base: linear weights {mem / 1024:6.1f} KiB | base general loss {base_loss:.3f}"
          f" | after LoRA: format {fmt:.0%} facts {ok:.0%}")</div>
  <div class="fx" data-lang="text">32-bit base: linear weights  384.0 KiB | base general loss 0.379 | after LoRA: format 100% facts 100%
 8-bit base: linear weights  108.0 KiB | base general loss 0.379 | after LoRA: format 100% facts 100%
 4-bit base: linear weights   60.0 KiB | base general loss 0.380 | after LoRA: format 100% facts 100%</div>
  <p>By hand for 4-bit: 98,304 weights × 0.5 byte = 49,152 B, plus 98,304 ÷ 16 = 6,144 scales × 2 B = 12,288 B; total 61,440 B = 60 KiB, versus 393,216 B = 384 KiB in fp32 (6.4× smaller). The quantized base is barely worse (general loss 0.379 → 0.380) and LoRA on top still reaches 100% / 100%. The same arithmetic for a real 7B model:</p>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <text x="8" y="49">full FT (Adam)</text><rect x="150" y="36" width="381" height="18" class="fr sr"/><text x="537" y="49">112 GB</text>
    <text x="8" y="84">LoRA, BF16 base</text><rect x="150" y="71" width="48" height="18" class="fb sb"/><rect x="198" y="71" width="14" height="18" class="fv"/><text x="246" y="84">≈18 GB</text>
    <text x="8" y="119">QLoRA, NF4 base</text><rect x="150" y="106" width="14" height="18" class="fb sb"/><rect x="164" y="106" width="14" height="18" class="fv"/><text x="246" y="119">≈8 GB</text>
    <line x1="232" y1="24" x2="232" y2="132" class="sr" stroke-dasharray="4 3"/><text x="232" y="18" text-anchor="middle" class="tr">24 GB GPU</text>
  </svg><figcaption>7B fine-tune memory. Blue = base weights (14 GB BF16 vs ~4 GB NF4), violet ≈ 4 GB adapters + optimizer + activations.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy: a zipped encyclopedia</span>
    <p>Keep the giant book you only <em>read</em> compressed on a small shelf. Write your own notes, the part you <em>change</em>, on full-size paper. Compress what is frozen; keep precision where you learn.</p>
  </div>
  <h3>Quantization methods you'll meet</h3>
  <table class="tbl">
    <tr><th>Method</th><th>What it is</th><th>Use it for</th></tr>
    <tr><td><strong>bitsandbytes</strong></td><td>Quantizes on load (INT8, NF4); no calibration data</td><td>QLoRA training, quick experiments</td></tr>
    <tr><td><strong>GPTQ</strong></td><td>Post-training; uses calibration data and second-order info to minimise each layer's error</td><td>Pre-quantized INT4 files for GPU serving</td></tr>
    <tr><td><strong>AWQ</strong></td><td>Post-training; protects the small set of weights with large activations</td><td>GPU serving; often slightly better than GPTQ at 4-bit</td></tr>
    <tr><td><strong>GGUF</strong></td><td>llama.cpp file format (Q4_K_M, Q8_0…)</td><td>CPU / Apple Silicon; used by Ollama</td></tr>
  </table>
  <h3>A real QLoRA run (sketch, not run)</h3>
  <p><strong>Not run here</strong>: it needs a CUDA GPU (~16–24 GB) and model downloads, and neither exists on this machine. The imports and config objects follow peft 0.x / TRL 1.x / transformers 5 conventions; read it as the recipe, with the tiny runs above as the mechanics.</p>
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
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Symmetric quantization</strong>: q = round(w / s), s = max|w| / q<sub>max</sub>. <strong>Asymmetric</strong>: q = round(w / s) + z, s = (max − min) / (2<sup>bits</sup> − 1), zero-point z = round(−min / s); de-quantize with (q − z)·s. <strong>QLoRA</strong>: LoRA training on top of a 4-bit (NF4) frozen base.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: old tutorials, and merging into a 4-bit base</span>
    <p>Old tutorials pass <code>tokenizer=</code> and <code>max_seq_length=</code> to <code>SFTTrainer</code>; current TRL uses <code>processing_class=</code> and <code>SFTConfig(max_length=…)</code>. And to merge, reload the base in bf16 first: adding a bf16 BA to 4-bit-rounded weights bakes in the rounding error the adapter was trained to work around.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Adapters &amp; other PEFT.</b> LoRA + 4-bit makes a 7B fine-tune fit one GPU. But is LoRA the only way to train a small add-on, and why did it win?</div>

  <h2 id="ft-peft"><span class="num">06</span>Adapters &amp; Other PEFT</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>LoRA trains a low-rank change to existing matrices. Other ways to bolt a small trainable piece onto a frozen model exist. Are they better, cheaper, or just different, and why is LoRA the default?</p>
  </div>
  <p><strong>PEFT</strong> (parameter-efficient fine-tuning) = any method that freezes the model and trains a small add-on. They differ in <em>where</em> the add-on sits.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Customising a car you may not modify. LoRA = small adjustments to existing parts (it becomes part of the engine when merged). An adapter = an extra gadget bolted into the drivetrain (always there, always a little drag). Prompt tuning = sticky notes on the dashboard the driver reads before each trip.</p>
  </div>
  <table class="tbl">
    <tr><th>Method</th><th>Idea</th><th>Trade-off</th></tr>
    <tr><td><strong>LoRA</strong></td><td>Low-rank ΔW = BA added to chosen matrices</td><td>Merges into W: zero inference cost</td></tr>
    <tr><td><strong>Adapters</strong></td><td>Insert small bottleneck MLPs (d → r → d) after sublayers, with a residual</td><td>Older; extra layers add inference latency; can't merge</td></tr>
    <tr><td><strong>Prefix / prompt tuning</strong></td><td>Learned soft "virtual tokens" in every layer (prefix) or only at the input (prompt)</td><td>Tiny; unstable, and good mainly on very large models</td></tr>
    <tr><td><strong>IA³</strong></td><td>Learn vectors that rescale keys, values and FFN activations</td><td>~0.01% params; good with very little data</td></tr>
    <tr><td><strong>DoRA</strong></td><td>Split the update into magnitude and direction; LoRA on the direction</td><td>Often a bit better than LoRA; <code>use_dora=True</code> in peft</td></tr>
  </table>
  <h3>Traced: three PEFT methods on the same job</h3>
  <p>Same frozen base, same 400 examples, 1,000 steps each. The adapter is a 64 → 8 → 64 bottleneck after each block, initialised so it starts as the identity (like LoRA's B = 0). Prompt tuning learns 8 "virtual token" vectors (8 × 64 = 512 numbers) prepended to every input.</p>
  <div class="fx" data-lang="py"># Three PEFT methods on the same job: LoRA, a bottleneck adapter, prompt tuning.
import torch, torch.nn as nn
from tinygpt import train
from ftlib import load_base, splits, score_house, add_lora

class Adapter(nn.Module):
    """Bottleneck MLP after a block: x + up(relu(down(x))). Starts as identity."""
    def __init__(self, block, d=64, r=8):
        super().__init__()
        self.block, self.down, self.up = block, nn.Linear(d, r), nn.Linear(r, d)
        nn.init.zeros_(self.up.weight); nn.init.zeros_(self.up.bias)
    def forward(self, x, past=None):
        x, kv = self.block(x, past)
        return x + self.up(torch.relu(self.down(x))), kv

class SoftPrompt(nn.Module):
    """Prompt tuning: 8 learned 'virtual token' vectors placed before the real tokens."""
    def __init__(self, model, n=8):
        super().__init__()
        self.m, self.n = model, n
        self.prompt = nn.Parameter(model.tok.weight[:n].clone().detach())
    def forward(self, idx, past=None):
        m = self.m
        if past is None:
            x = torch.cat([self.prompt.expand(idx.shape[0], -1, -1), m.tok(idx)], 1)
            x = x + m.pos(torch.arange(x.shape[1]))
        else:
            start = past[0][0].shape[2]
            x = m.tok(idx) + m.pos(torch.arange(start, start + idx.shape[1]))
        new = []
        for i, b in enumerate(m.blocks):
            x, kv = b(x, None if past is None else past[i]); new.append(kv)
        logits = m.head(m.ln(x))
        return (logits[:, self.n:] if past is None else logits), new

def run(kind):
    model, vocab = load_base()
    train_set, test_facts, _, _ = splits(vocab)
    if kind == "LoRA r=4":
        params = add_lora(model, r=4, alpha=8)
    else:
        for p in model.parameters():
            p.requires_grad = False
        if kind == "adapter r=8":
            model.blocks = nn.ModuleList(Adapter(b) for b in model.blocks)
        else:
            model = SoftPrompt(model)
        params = [p for p in model.parameters() if p.requires_grad]
    train(model, train_set, steps=1000, lr=1e-3 if kind != "prompt tuning" else 1e-2,
          params=params, seed=0)
    fmt, ok = score_house(model, vocab, test_facts)
    print(f"{kind:&lt;14} trainable {sum(p.numel() for p in params):&gt;5,} | format {fmt:.0%}  facts {ok:.0%}")

for kind in ["LoRA r=4", "adapter r=8", "prompt tuning"]:
    run(kind)</div>
  <div class="fx" data-lang="text">LoRA r=4       trainable 9,216 | format 100%  facts 100%
adapter r=8    trainable 2,192 | format 100%  facts 34%
prompt tuning  trainable   512 | format 0%  facts 0%</div>
  <p>Read it as capacity versus placement. The adapter (2,192 numbers: per block 64×8 + 8 + 8×64 + 64 = 1,096) learned the format but copies facts right only 34% of the time. Prompt tuning (512 numbers) learned nothing usable: 8 vectors in front of a 2-layer model can't rewire how it copies details. This matches the published picture: prompt tuning catches up with full fine-tuning only on very large models. LoRA, which edits the attention projections themselves, gets 100%.</p>
  <div class="callout intu"><span class="label">Why LoRA won</span>
    <p>(1) Merges into W, so <strong>zero inference latency</strong>. (2) Stable to train, with one main knob (r). (3) Adapters are small, swappable and composable; servers can host many on one base. The Hugging Face <code>peft</code> library made it the default.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>PEFT</strong>: training a small set of new or selected parameters while the pretrained weights stay frozen. <strong>Adapter</strong>: a small bottleneck network inserted into each layer. <strong>Prompt tuning</strong>: learning input embeddings ("soft prompts") instead of weights.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: counting only parameters</span>
    <p>Fewer trainable numbers is not automatically better: our 512-number soft prompt was cheapest and useless. Compare PEFT methods on your eval set and on inference latency, not on parameter count alone.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Instruction tuning.</b> Every run so far taught one job ("where is my order" → house reply). Biteful also needs support tickets from the same facts. One fine-tune per job, or one model that follows the instruction it's given?</div>

  <h2 id="ft-instruct"><span class="num">07</span>Instruction Tuning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our fine-tuned model is excellent at one thing. Ask it for a ticket and it still writes a house reply. How do labs turn a model into something that follows <em>whatever</em> instruction it gets, and can we do a small version for Biteful's two jobs?</p>
  </div>
  <p><strong>Instruction tuning</strong> is SFT on <em>many</em> different tasks, each phrased as an instruction ("summarise…", "translate…", "extract…"), mixed together. The model learns that the instruction decides the task. That is how a base model becomes an instruct model (FLAN, Alpaca, and every lab's post-training). <strong>Task fine-tuning</strong>, what we did so far, is SFT on one narrow job.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A trainee who only ever practised one form fills in that form whatever you hand her. A trainee who practised twenty forms, each with its title on top, learns to read the title first.</p>
  </div>
  <h3>Traced: one model, two instructions</h3>
  <p>Two Biteful jobs from the same facts. "where is my order …" → house reply. "ticket for : order 112 , picked up , kabir , 9:20 pm" → <code>{ order_id : 112 , status : picked up , rider : kabir , eta : 9:20 }</code> (a token-level stand-in for the JSON tickets of <a class="xref" data-note="llm_apis">LLM APIs</a>). Compare the single-task model from section 02 with one trained on a shuffled mix of both.</p>
  <div class="fx" data-lang="py"># Instruction tuning in miniature: one model, two instructions ("where is my order"
# -&gt; house reply; "ticket for" -&gt; a JSON-like ticket). Compare with the single-task model.
import random, torch
from tinygpt import train
from ftlib import load_base, splits, score_house, sft_example, reply_to
from biteful_corpus import tickets, ticket_prompt, ticket_reply

def score_ticket(model, vocab, test_facts):
    return sum(reply_to(model, vocab, ticket_prompt(*f)) == ticket_reply(*f)
               for f in test_facts) / len(test_facts)

model, vocab = load_base()
reply_train, test_facts, _, _ = splits(vocab)
ticket_train = [sft_example(vocab, p, a) for p, a, f in tickets() if f not in set(test_facts)]

single, _ = load_base()
single.load_state_dict(torch.load("sft_full.pt"))       # trained on the reply task only
multi, _ = load_base()
mix = reply_train + ticket_train
random.Random(0).shuffle(mix)
train(multi, mix, steps=600, lr=1e-3, seed=0)

f = (101, "out for delivery", "ravi", "9:05")
for name, m in [("single-task SFT", single), ("instruction-tuned", multi)]:
    fmt, ok = score_house(m, vocab, test_facts)
    print(f"{name:&lt;18} reply facts {ok:.0%} | ticket exact {score_ticket(m, vocab, test_facts):.0%}")
    print(f"{'':&lt;18} ticket for 101 -&gt; {reply_to(m, vocab, ticket_prompt(*f))}")</div>
  <div class="fx" data-lang="text">single-task SFT    reply facts 100% | ticket exact 0%
                   ticket for 101 -&gt; noted : order 101 is out for delivery is out for delivery . ravi will reach you by 9:05 pm . — team biteful &lt;|end|&gt;
instruction-tuned  reply facts 100% | ticket exact 100%
                   ticket for 101 -&gt; { order_id : 101 , status : out for delivery , rider : ravi , eta : 9:05 } &lt;|end|&gt;</div>
  <p>The single-task model ignores the new instruction and writes a (garbled) house reply: 0% exact tickets. The model trained on both reads the instruction: 100% on replies <em>and</em> tickets for unseen fact combinations. Real instruction tuning does this with thousands of task types, which is why an instruct model can follow instructions it never saw: it learned to read the instruction, not just the tasks.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Instruction tuning</strong>: supervised fine-tuning on a mixture of many tasks written as natural-language instructions, so the model learns to follow instructions in general. <strong>Base vs instruct</strong>: a base model continues text; an instruct model has had instruction tuning (and usually preference tuning).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: base vs instruct</span>
    <p><code>Llama-3.1-8B</code> (base) may answer a question with more questions; <code>-Instruct</code> has had stages 2–3. Start from Instruct for chat-style tasks, and include some general instructions in your mix (section 10) so your narrow fine-tune doesn't undo the instruction following you inherited.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: RLHF &amp; DPO.</b> SFT copies one "gold" reply per prompt. But many replies are valid, and some are better than others: a reply with an invented ETA is fluent, well-formatted and wrong. How do we teach "this one, not that one"?</div>

  <h2 id="ft-align"><span class="num">08</span>RLHF &amp; DPO</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two house-format replies to Asha: "…by 9:05 pm" (the real ETA) and "…by 8:40 pm" (invented, more pleasing). SFT only ever showed the good one. How do we make the model actively prefer it, and push the invented one down?</p>
  </div>
  <p><strong>Alignment</strong> teaches the model which of several valid-looking answers people <em>prefer</em>: more helpful, honest, on-tone, safe. "A is better than B" is far easier for a person to judge than writing the perfect answer, especially for fuzzy qualities like tone.</p>
  <div class="callout anlg"><span class="label">Analogy: a cooking student</span>
    <p>SFT: "make exactly this recipe". Alignment: cook two versions, taste both, "this one's better", again and again. The student never sees a perfect recipe but builds <em>taste</em>.</p>
  </div>
  <h3>RLHF: the classic three steps</h3>
  <div class="flow"><span>1. Humans rank pairs: A &gt; B</span><span>2. Train a reward model to score answers</span><span>3. PPO: generate → score → update, with a KL leash</span></div>
  <ul>
    <li><strong>Reward model (RM)</strong>: reads (prompt, answer), outputs one number. Trained so the preferred answer scores higher. It turns slow human judgement into a score RL can query millions of times.</li>
    <li><strong>KL penalty</strong>: maximise <code>reward − β · KL(policy ‖ SFT model)</code>. Without it the model finds text the imperfect RM loves but humans hate: <strong>reward hacking</strong>.</li>
  </ul>
  <h3>DPO: same goal, no reward model, no RL</h3>
  <p><strong>DPO</strong> (Direct Preference Optimization) optimises the same objective with one supervised-style loss on (prompt, chosen, rejected) triples. For each answer it needs two log-probabilities: under the model being trained (the <em>policy</em> π) and under a frozen copy of the starting model (the <em>reference</em>).</p>
  <div class="callout def"><span class="label">The DPO loss</span>
    <p>margin = [log π(chosen) − log π<sub>ref</sub>(chosen)] − [log π(rejected) − log π<sub>ref</sub>(rejected)]; &nbsp; loss = −log σ(β · margin). β (≈0.1) sets how far the policy may drift from the reference: it plays the KL leash's role. σ is the sigmoid.</p>
  </div>
  <h3>Traced: DPO on Asha's pair</h3>
  <p>Policy and reference both start as our SFT model. 200 preference pairs: chosen = house reply with the true ETA, rejected = the same reply with a different ETA. We train 150 steps of 8 pairs, at a gentle and at a 10× harder learning rate, and print Asha's pair each time.</p>
  <div class="fx" data-lang="py"># DPO on Biteful preference pairs. Chosen = the reply with the real ETA;
# rejected = the same format with an invented ETA. Policy and reference both start
# as the SFT model; the reference stays frozen.
import copy, random, torch, torch.nn.functional as F
from ftlib import load_base, splits, score_house
from biteful_corpus import prompt, house_reply, ETAS, facts

def seq_logp(model, vocab, p, a):
    """Sum of log-probabilities of the reply tokens a, given prompt p."""
    pi, ai = vocab.encode(p), vocab.encode(a)
    logits, _ = model(torch.tensor([pi + ai[:-1]]))
    logp = F.log_softmax(logits[0, len(pi) - 1:], -1)
    return logp[torch.arange(len(ai)), torch.tensor(ai)].sum()

policy, vocab = load_base()
policy.load_state_dict(torch.load("sft_full.pt"))
ref = copy.deepcopy(policy).eval()
for p in ref.parameters():
    p.requires_grad = False
_, test_facts, _, _ = splits(vocab)

r = random.Random(3)
pairs = []
for _ in range(200):
    oid, st, rider, eta = facts(r)
    wrong = r.choice([e for e in ETAS if e != eta])
    pairs.append((prompt(oid, st, rider, eta), house_reply(oid, st, rider, eta),
                  house_reply(oid, st, rider, wrong)))
asha = (prompt(101, "out for delivery", "ravi", "9:05"),
        house_reply(101, "out for delivery", "ravi", "9:05"),
        house_reply(101, "out for delivery", "ravi", "8:40"))
beta = 0.1

def dpo(pair):
    p, c, rj = pair
    pc, pr = seq_logp(policy, vocab, p, c), seq_logp(policy, vocab, p, rj)
    with torch.no_grad():
        rc, rr = seq_logp(ref, vocab, p, c), seq_logp(ref, vocab, p, rj)
    margin = (pc - rc) - (pr - rr)
    return -F.logsigmoid(beta * margin), margin, (pc, rc, pr, rr)

def show(tag):
    loss, margin, (pc, rc, pr, rr) = dpo(asha)
    print(f"{tag}: log p(chosen) {pc.item():7.3f} (ref {rc.item():7.3f}) | "
          f"log p(rejected) {pr.item():8.3f} (ref {rr.item():7.3f}) | margin {margin.item():6.2f} | loss {loss.item():.4f}")

show("before        ")
sft_state = copy.deepcopy(policy.state_dict())
for lr in [2e-5, 2e-4]:                           # a gentle nudge vs a hard push
    policy.load_state_dict(sft_state)
    opt = torch.optim.AdamW(policy.parameters(), lr=lr)
    for step in range(150):                       # 150 steps x 8 pairs
        loss = torch.stack([dpo(pairs[(step * 8 + i) % 200])[0] for i in range(8)]).mean()
        opt.zero_grad(); loss.backward(); opt.step()
    show(f"after lr={lr:.0e}")
    fmt, ok = score_house(policy, vocab, test_facts)
    print(f"   held-out replies: format {fmt:.0%}  facts {ok:.0%}")</div>
  <div class="fx" data-lang="text">before        : log p(chosen)  -0.089 (ref  -0.089) | log p(rejected)  -11.809 (ref -11.809) | margin   0.00 | loss 0.6931
after lr=2e-05: log p(chosen)  -0.109 (ref  -0.089) | log p(rejected)  -14.086 (ref -11.809) | margin   2.26 | loss 0.5867
   held-out replies: format 100%  facts 100%
after lr=2e-04: log p(chosen)  -0.762 (ref  -0.089) | log p(rejected)  -17.542 (ref -11.809) | margin   5.06 | loss 0.4718
   held-out replies: format 50%  facts 50%</div>
  <p><strong>By hand, before training</strong>: policy = reference, so both brackets are 0, margin = 0, loss = −log σ(0) = −log 0.5 = <strong>0.6931</strong>. Every DPO run starts at log 2.</p>
  <p><strong>By hand, after lr = 2e-5</strong>: chosen bracket = −0.109 − (−0.089) = −0.020; rejected bracket = −14.086 − (−11.809) = −2.277; margin = −0.020 − (−2.277) = 2.257. β·margin = 0.2257; σ(0.2257) = 1 ÷ (1 + e<sup>−0.2257</sup>) = 0.5562; loss = −ln 0.5562 = <strong>0.587</strong>. The invented-ETA reply became e<sup>2.28</sup> ≈ 10× less likely while the true one barely moved, and held-out replies are still 100% correct.</p>
  <p><strong>After lr = 2e-4</strong> the loss is lower (0.472) but look closer: the <em>chosen</em> reply also dropped (−0.089 → −0.762: half as likely as before), and held-out format fell to 50%. DPO only rewards the <em>gap</em>; pushed hard it can lower both answers and wreck the model. That is why real DPO uses learning rates around 5e-7, β ≈ 0.1, one epoch, and starts from a good SFT model.</p>
  <div class="cards">
    <div><b>RLHF (PPO)</b><p>Policy + reward model + reference + RL loop. Powerful, finicky, GPU-heavy, reward hacking risk.</p><small>Still used at frontier scale</small></div>
    <div><b>DPO</b><p>Policy + frozen reference + one loss. Stable and cheap.</p><small>Default for most open models</small></div>
  </div>
  <p>With TRL the same thing is a few lines (<strong>not run here</strong>: it needs a downloaded model):</p>
  <div class="fx" data-lang="py">from trl import DPOTrainer, DPOConfig

# rows: {"prompt": "...", "chosen": "better answer", "rejected": "worse answer"}
args = DPOConfig(output_dir="dpo-out", beta=0.1,     # beta = how tightly to stay near the SFT model
                 learning_rate=5e-7, num_train_epochs=1)  # far smaller LR than SFT: a gentle nudge
trainer = DPOTrainer(model=sft_model,           # start from your SFT model, never a base model
                     args=args, train_dataset=prefs,
                     processing_class=tokenizer) # ref_model=None: TRL keeps a frozen copy
trainer.train()</div>
  <p><strong>Names to recognise:</strong> <strong>RLAIF</strong> (an LLM labels the preferences), <strong>Constitutional AI</strong> (Anthropic: the model critiques its answers against written principles), <strong>ORPO / KTO</strong> (DPO cousins: preferences folded into SFT; single good/bad labels), <strong>RLVR / GRPO</strong> (RL on verifiable rewards such as passing tests: how reasoning models are trained).</p>
  <div class="callout trap"><span class="label">Trap: "Is RLHF supervised or RL?"</span>
    <p>Both. Training the reward model is supervised. The PPO step is real RL: actions = tokens, reward = RM score. DPO is not RL at all. And a falling DPO loss is not success: check the chosen log-probability and a held-out eval, as the lr = 2e-4 run shows.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Evaluating the fine-tune.</b> Each section reported a score on 50 prompts. Is that enough to say the fine-tuned model is better, and better at what cost?</div>

  <h2 id="ft-eval"><span class="num">09</span>Evaluating the Fine-Tune</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Format 100%" sounds like victory. But it was measured on the very job we trained for. Did anything else get worse, and how would we know before Asha's friends notice?</p>
  </div>
  <p>A fine-tune is only "better" if a held-out evaluation says so, at three levels:</p>
  <table class="tbl">
    <tr><th>Level</th><th>Measures</th><th>Example</th></tr>
    <tr><td>Loss / perplexity</td><td>Sanity check on held-out data</td><td>Eval loss rising while train loss falls = overfitting</td></tr>
    <tr><td>Task metric</td><td>Does it do <em>the job</em> better?</td><td>Our format and facts scores; SQL execution accuracy; F1 for extraction</td></tr>
    <tr><td>Judge / human</td><td>Open-ended quality</td><td>Rubric-based LLM judge, side-by-side human preference (next note)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricketer who spent a month on spin bowling. You check three things: is the spin better (task), is he still fit (general skill), and compared with whom (the base, same tests)? A better leg-break with a pulled hamstring is not progress.</p>
  </div>
  <h3>Traced: the three numbers</h3>
  <div class="fx" data-lang="py"># Evaluate the fine-tune: the three numbers (base, fine-tuned, general skill),
# on an eval set frozen BEFORE training, plus a contamination check.
import torch
from tinygpt import avg_loss
from ftlib import load_base, splits, score_house, reply_to, add_lora
from biteful_corpus import biteful

base, vocab = load_base()
train_set, test_facts, gen_heldout, _ = splits(vocab)
used = [f for _, _, f in biteful(600) if f not in set(test_facts)][:400]   # rows trained on
print("eval fact combinations also in training:", len(set(used) &amp; set(test_facts)))

full, _ = load_base(); full.load_state_dict(torch.load("sft_full.pt"))
lora, _ = load_base(); add_lora(lora); lora.load_state_dict(torch.load("lora_adapter.pt"), strict=False)

cancel = "&lt;|user|&gt; can i cancel order 105 ? &lt;|assistant|&gt;"
print(f"{'model':&lt;11} {'format':&gt;7} {'facts':&gt;6} {'general loss':&gt;13}  reply to an unrelated question")
for name, m in [("base", base), ("full SFT", full), ("LoRA", lora)]:
    fmt, ok = score_house(m, vocab, test_facts)
    print(f"{name:&lt;11} {fmt:&gt;7.0%} {ok:&gt;6.0%} {avg_loss(m, gen_heldout):&gt;13.3f}  {reply_to(m, vocab, cancel)}")</div>
  <div class="fx" data-lang="text">eval fact combinations also in training: 0
model        format  facts  general loss  reply to an unrelated question
base             0%     0%         0.379  you can cancel order 105 from the app before it is prepared . &lt;|end|&gt;
full SFT       100%   100%         0.677  you by will reach by from the app before it is prepared . &lt;|end|&gt;
LoRA           100%   100%         0.817  you by cancel order 105 from the app before it is prepared is prepared . sana at . &lt;|end|&gt;</div>
  <p>Three numbers per model: task format, task facts, and general loss on held-out text unrelated to order status. Both fine-tunes go 0% → 100% on the task, on 50 combinations they never trained on (overlap 0). But general loss rose (0.379 → 0.677 full, 0.817 LoRA), and the last column shows what that means: asked "can I cancel order 105?", the base answers correctly; both fine-tunes now start with "you by…", words from the Biteful template leaking into an unrelated answer. A task-only eval would have shipped this.</p>
  <div class="callout intu"><span class="label">Real-world version</span>
    <p>For a real fine-tune report: base score, fine-tuned score, and a general benchmark (MMLU, or your own suite of other Biteful tasks) for both. For SQL, score <strong>execution accuracy</strong>: run predicted and gold SQL and compare rows; a query that fails to run scores 0, and a "harmless" <code>DISTINCT</code> that changes rows scores 0 too, which a string match would miss. Building such suites properly is <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>.</p>
  </div>
  <table class="tbl">
    <tr><th>Failure</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td><strong>Catastrophic forgetting</strong></td><td>Great on the task, worse at everything else</td><td>Replay general data, fewer steps, lower LR (section 10)</td></tr>
    <tr><td><strong>Overfitting</strong></td><td>Train loss ↓, eval loss ↑; parrots training examples</td><td>More diverse data, early stopping, smaller r</td></tr>
    <tr><td><strong>Alignment tax</strong></td><td>Safety / helpfulness weakens after SFT</td><td>Start from an aligned model; add safety examples; DPO after SFT</td></tr>
    <tr><td><strong>Instability</strong></td><td>Loss spikes or NaN</td><td>Lower LR, gradient clipping, drop extreme-length examples</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Held-out eval set</strong>: examples never used in training, frozen before training starts. <strong>The three numbers</strong>: base vs fine-tuned on the target task, and both on a general benchmark.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: evaluating only the target task</span>
    <p>Every fine-tune trades something. If you only measure what you trained for, you will only ever see wins. Always run the general suite too.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Catastrophic forgetting.</b> General loss went up and the cancel answer broke. How bad does it get with more training, and what actually prevents it?</div>

  <h2 id="ft-forget"><span class="num">10</span>Catastrophic Forgetting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We trained only on Biteful replies, and the model got worse at other questions. Is this a fluke of 300 steps, does it grow with training, and does LoRA's frozen base protect us?</p>
  </div>
  <p><strong>Catastrophic forgetting</strong>: when a network is trained only on new data, the weight changes that help the new task also overwrite what the old tasks relied on. Nothing in the loss asks the model to keep its old skills, so it doesn't.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop assistant drilled for a month on one script: "hi ! order … — team biteful". Ask her about cancellations and the script comes out anyway. Keep a few cancellation questions in the daily drill and she keeps both.</p>
  </div>
  <h3>Traced: forgetting grows with steps; replay stops it</h3>
  <div class="fx" data-lang="py"># Catastrophic forgetting, measured: train longer and the general skill decays;
# mixing 20% general data back in ("replay") protects it.
import random
from tinygpt import train, avg_loss
from ftlib import load_base, splits, score_house, reply_to, add_lora

cancel = "&lt;|user|&gt; can i cancel order 105 ? &lt;|assistant|&gt;"
def run(name, steps, replay=0.0, lora=False):
    model, vocab = load_base()
    train_set, test_facts, gen_heldout, gen_train = splits(vocab)
    data = list(train_set)
    if replay:                                    # 20% of the mix = general examples
        data += random.Random(0).sample(gen_train, int(len(train_set) * replay / (1 - replay)))
    params = add_lora(model) if lora else None
    if steps:
        train(model, data, steps=steps, lr=1e-3, params=params, seed=0)
    fmt, ok = score_house(model, vocab, test_facts)
    print(f"{name:&lt;26} facts {ok:&gt;4.0%} | general loss {avg_loss(model, gen_heldout):.3f}")
    print(f"{'':&lt;26} {reply_to(model, vocab, cancel)}")

run("base (no fine-tuning)", 0)
run("full FT, 300 steps", 300)
run("full FT, 3000 steps", 3000)
run("full FT, 3000 + 20% replay", 3000, replay=0.2)
run("LoRA, 3000 steps", 3000, lora=True)</div>
  <div class="fx" data-lang="text">base (no fine-tuning)      facts   0% | general loss 0.379
                           you can cancel order 105 from the app before it is prepared . &lt;|end|&gt;
full FT, 300 steps         facts 100% | general loss 0.677
                           you by will reach by from the app before it is prepared . &lt;|end|&gt;
full FT, 3000 steps        facts 100% | general loss 0.832
                           you by will reach you . ravi , . ravi will is being prepared . ravi at 9:50 pm . ravi . ravi by 9:50 pm . — team biteful
full FT, 3000 + 20% replay facts 100% | general loss 0.651
                           you can cancel order 105 from the app before it is prepared . &lt;|end|&gt;
LoRA, 3000 steps           facts 100% | general loss 1.092
                           you by &lt;|end|&gt;</div>
  <ul>
    <li><strong>More steps, more forgetting</strong>: general loss 0.379 → 0.677 (300 steps) → 0.832 (3,000 steps). At 3,000 steps the cancel question gets a runaway Biteful-style reply that never stops.</li>
    <li><strong>Replay fixes it</strong>: same 3,000 steps with 20% general examples mixed in: task facts still 100%, general loss 0.651, and the cancel answer is word-for-word the base model's.</li>
    <li><strong>LoRA is not a shield</strong>: LoRA for 3,000 steps forgot the most here (1.092). On real models LoRA tends to forget somewhat less than full fine-tuning because it changes less, but "less" depends on rank, learning rate and steps. Measure it.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Catastrophic forgetting</strong>: loss of previously learned skills after training on a new distribution. <strong>Replay (data mixing)</strong>: mixing a fraction (5–20%) of general or earlier-task data into the fine-tuning set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "a few more epochs can't hurt"</span>
    <p>On the target task the curve looks flat and safe after it hits 100%; the damage is happening elsewhere. Stop when the task eval plateaus, and watch the general eval at every checkpoint.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Then, in <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>, how to measure the whole Biteful assistant properly: test sets, metrics, judges, and whether a difference is real or noise.</div>

  <h2 id="ft-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>SFT, LoRA, quantization, PEFT, instruction tuning, DPO, evaluation, forgetting: ten tools, or one chain where each fixes what the previous left open?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="ft-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="29" text-anchor="middle" font-size="11.5" font-weight="700">decide</text><text x="85" y="45" text-anchor="middle" class="tm" font-size="10">behaviour gap → FT</text>
<rect x="185" y="10" width="150" height="44" rx="8" class="fb sb"/><text x="260" y="29" text-anchor="middle" font-size="11.5" font-weight="700">SFT</text><text x="260" y="45" text-anchor="middle" class="tm" font-size="10">masked next-token loss</text>
<rect x="360" y="10" width="150" height="44" rx="8" class="fr sr"/><text x="435" y="29" text-anchor="middle" font-size="11.5" font-weight="700">full FT cost</text><text x="435" y="45" text-anchor="middle" class="tm" font-size="10">16 B/param = 112 GB</text>
<rect x="535" y="10" width="135" height="44" rx="8" class="fg sg"/><text x="602" y="29" text-anchor="middle" font-size="11.5" font-weight="700">LoRA</text><text x="602" y="45" text-anchor="middle" class="tm" font-size="10">train BA only</text>
<rect x="535" y="128" width="135" height="44" rx="8" class="fg sg"/><text x="602" y="147" text-anchor="middle" font-size="11.5" font-weight="700">QLoRA</text><text x="602" y="163" text-anchor="middle" class="tm" font-size="10">4-bit frozen base</text>
<rect x="360" y="128" width="150" height="44" rx="8" class="ft st"/><text x="435" y="147" text-anchor="middle" font-size="11.5" font-weight="700">other PEFT</text><text x="435" y="163" text-anchor="middle" class="tm" font-size="10">adapters, soft prompts</text>
<rect x="185" y="128" width="150" height="44" rx="8" class="fb sb"/><text x="260" y="147" text-anchor="middle" font-size="11.5" font-weight="700">instruction tuning</text><text x="260" y="163" text-anchor="middle" class="tm" font-size="10">SFT on many tasks</text>
<rect x="10" y="128" width="150" height="44" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="85" y="147" text-anchor="middle" font-size="11.5" font-weight="700">DPO / RLHF</text><text x="85" y="163" text-anchor="middle" class="tm" font-size="10">prefer A over B</text>
<rect x="10" y="246" width="300" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="160" y="265" text-anchor="middle" font-size="11.5" font-weight="700">evaluate: three numbers</text><text x="160" y="281" text-anchor="middle" class="tm" font-size="10">task up, general down?</text>
<rect x="370" y="246" width="300" height="44" rx="8" class="fr sr"/><text x="520" y="265" text-anchor="middle" font-size="11.5" font-weight="700">forgetting → replay</text><text x="520" y="281" text-anchor="middle" class="tm" font-size="10">0.832 → 0.651 with 20% general data</text>
<line x1="160" y1="32" x2="183" y2="32" stroke="currentColor" marker-end="url(#ft-a9)"/><line x1="335" y1="32" x2="358" y2="32" stroke="currentColor" marker-end="url(#ft-a9)"/><line x1="510" y1="32" x2="533" y2="32" stroke="currentColor" marker-end="url(#ft-a9)"/>
<line x1="602" y1="54" x2="602" y2="126" stroke="currentColor" marker-end="url(#ft-a9)"/><line x1="535" y1="150" x2="512" y2="150" stroke="currentColor" marker-end="url(#ft-a9)"/><line x1="360" y1="150" x2="337" y2="150" stroke="currentColor" marker-end="url(#ft-a9)"/><line x1="185" y1="150" x2="162" y2="150" stroke="currentColor" marker-end="url(#ft-a9)"/>
<line x1="85" y1="172" x2="120" y2="244" stroke="currentColor" marker-end="url(#ft-a9)"/><line x1="310" y1="268" x2="368" y2="268" stroke="currentColor" marker-end="url(#ft-a9)"/>
<line x1="260" y1="54" x2="260" y2="126" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ft-a9)"/><text x="268" y="96" class="tm" font-size="10">same loss</text>
</svg><figcaption>Top row: what to train and why it's expensive. Middle: making it cheap, then broader, then preference-aware. Bottom: proving it helped, and fixing what it broke.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the Biteful example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our example</th><th>When to use</th></tr>
    <tr><td>Decision (prompt/RAG/FT)</td><td>symptom → rung</td><td>should we fine-tune at all?</td><td>style prompt $78.72/day cached; small FT model $1.80/day</td><td>before any training</td></tr>
    <tr><td>SFT</td><td>next-token loss + loss mask + chat template</td><td>how do examples become behaviour?</td><td>21 of 41 tokens graded; format 0% → 100%</td><td>every fine-tune</td></tr>
    <tr><td>Full FT cost</td><td>bytes per parameter; 6·N·tokens</td><td>what does updating everything need?</td><td>16 B/param; 112 GB for 7B; ≈5 GPU-min compute</td><td>sizing hardware</td></tr>
    <tr><td>LoRA</td><td>frozen W + ΔW = BA</td><td>can we train far fewer numbers?</td><td>9,216 trainable (7.6%), 100% / 100%</td><td>default for fine-tuning</td></tr>
    <tr><td>Quantization / QLoRA</td><td>scale (+ zero-point) per block; LoRA on top</td><td>can the frozen base be smaller?</td><td>int4 error 0.0667 on 6 weights; 384 → 60 KiB, still 100%</td><td>one-GPU fine-tunes, serving</td></tr>
    <tr><td>Other PEFT</td><td>add-ons in other places</td><td>is LoRA the only add-on?</td><td>adapter 34% facts; soft prompt 0%</td><td>special cases; compare on evals</td></tr>
    <tr><td>Instruction tuning</td><td>SFT on a task mix</td><td>one model for many jobs?</td><td>tickets 0% → 100%, replies still 100%</td><td>several jobs, new instructions</td></tr>
    <tr><td>DPO</td><td>log-probs under policy and frozen reference</td><td>prefer the better of two answers?</td><td>loss 0.693 → 0.587; too-high LR → 50% format</td><td>after SFT, with preference pairs</td></tr>
    <tr><td>Evaluation</td><td>frozen held-out set; three numbers</td><td>did it really get better?</td><td>task 0 → 100%; general loss 0.379 → 0.677</td><td>after every run</td></tr>
    <tr><td>Forgetting &amp; replay</td><td>data mixing</td><td>what did we break, how to keep it?</td><td>0.832 after 3,000 steps; 0.651 with 20% replay</td><td>every narrow fine-tune</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Fine-tuning is one loss (next-token cross-entropy, restricted to the reply) applied to your examples. Everything else is about making it <em>affordable</em> (LoRA, quantization, PEFT), <em>broad</em> (instruction tuning), <em>preference-aware</em> (DPO) and <em>safe to ship</em> (evaluation, replay against forgetting). Memory decides which tool you can afford; evaluation decides whether you should ship.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes</b>, then the Revision Sheet.</div>

  <h2 id="ft-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Most failed fine-tunes fail quietly: good training loss, disappointing product. Which mistakes cause that most often?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fine-tuning for knowledge</span><p>Facts change and need citations: RAG or tools. Fine-tune behaviour.</p></div>
  <div class="callout trap"><span class="label">Trap: no frozen eval set</span><p>Build and freeze it before creating training data; check overlap is 0.</p></div>
  <div class="callout trap"><span class="label">Trap: loss on the prompt tokens</span><p>The model learns to write customers' questions. Mask everything before the assistant turn.</p></div>
  <div class="callout trap"><span class="label">Trap: template mismatch</span><p>Train and serve with the same chat template; otherwise the fine-tune seems to vanish.</p></div>
  <div class="callout trap"><span class="label">Trap: sizing for weights only</span><p>Full fine-tuning is ≈16 bytes per parameter plus activations, not 2.</p></div>
  <div class="callout trap"><span class="label">Trap: "LoRA can't forget"</span><p>Behaviour is W + BA; measure general skill, mix in replay data.</p></div>
  <div class="callout trap"><span class="label">Trap: trusting a falling DPO loss</span><p>Check that the chosen answer's probability didn't fall and that held-out quality held.</p></div>
  <div class="callout trap"><span class="label">Trap: merging into the 4-bit base</span><p>Reload the base in bf16, then merge the adapter.</p></div>
  <div class="callout trap"><span class="label">Trap: only the task number</span><p>Report base, fine-tuned and general benchmark, every time.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet</b>, then <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>.</div>

  <h2 id="ft-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful's support assistant. Asha asks where order 101 is; the tool says out for delivery, rider Ravi, ETA 9:05 pm; Biteful's house format is "hi ! order 101 is out for delivery . ravi will reach you by 9:05 pm . — team biteful". All experiments used a ≈121K-parameter model trained from scratch on a CPU (no pretrained model could be downloaded); 7B figures are arithmetic.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our example</th><th>Weakness → next</th></tr>
    <tr><td>Prompt/RAG/FT decision</td><td>should we train at all?</td><td>base says "your order is on its way…"</td><td>how do examples become habits?</td></tr>
    <tr><td>SFT</td><td>how to train on examples?</td><td>mask 21/41 tokens; 0% → 100%</td><td>all weights: cost on 7B?</td></tr>
    <tr><td>Full FT cost</td><td>what does it need?</td><td>16 B/param → 112 GB</td><td>train fewer numbers?</td></tr>
    <tr><td>LoRA</td><td>small add-on?</td><td>9,216 trainable, 100%</td><td>base still in memory</td></tr>
    <tr><td>Quantization &amp; QLoRA</td><td>smaller frozen base?</td><td>int4 60 KiB vs 384 KiB, still 100%</td><td>other add-ons?</td></tr>
    <tr><td>Other PEFT</td><td>alternatives to LoRA?</td><td>adapter 34%, soft prompt 0%</td><td>only one job learned</td></tr>
    <tr><td>Instruction tuning</td><td>many jobs, one model?</td><td>tickets 0% → 100%</td><td>which answer is better?</td></tr>
    <tr><td>RLHF &amp; DPO</td><td>prefer A over B?</td><td>0.693 → 0.587</td><td>is it better overall?</td></tr>
    <tr><td>Evaluation</td><td>prove it</td><td>task 100%, general 0.379 → 0.677</td><td>why did general drop?</td></tr>
    <tr><td>Forgetting</td><td>what broke, how to keep it?</td><td>0.832 → 0.651 with replay</td><td>→ proper evals (next note)</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>SFT loss</td><td>−(1/|R|) Σ<sub>t∈R</sub> log p(x<sub>t</sub> | x<sub>&lt;t</sub>)</td><td>R = reply positions (mask = 1); x<sub>t</sub> the true token</td></tr>
    <tr><td>Full FT memory</td><td>≈ 16 × N bytes + activations</td><td>N parameters; 2 weights + 2 grads + 4 master + 4 m + 4 v</td></tr>
    <tr><td>Training compute</td><td>≈ 6 × N × D FLOPs</td><td>D training tokens</td></tr>
    <tr><td>LoRA</td><td>h = Wx + (α/r)·BAx</td><td>W d×k frozen; B d×r (init 0); A r×k (random); α scale; r rank</td></tr>
    <tr><td>LoRA parameters</td><td>r(d + k) per matrix</td><td>vs d·k for the full matrix</td></tr>
    <tr><td>Symmetric quantization</td><td>s = max|w| / q<sub>max</sub>; q = round(w/s); ŵ = q·s</td><td>q<sub>max</sub> = 127 (int8), 7 (int4)</td></tr>
    <tr><td>Asymmetric quantization</td><td>s = (max − min)/(2<sup>b</sup> − 1); z = round(−min/s); q = round(w/s) + z; ŵ = (q − z)·s</td><td>z zero-point, b bits</td></tr>
    <tr><td>DPO loss</td><td>−log σ(β·[(log π<sub>c</sub> − log π<sub>ref,c</sub>) − (log π<sub>r</sub> − log π<sub>ref,r</sub>)])</td><td>c chosen, r rejected, β ≈ 0.1; starts at log 2</td></tr>
    <tr><td>RLHF objective</td><td>reward − β·KL(policy ‖ SFT)</td><td>KL keeps the policy near the SFT model</td></tr>
  </table>
  <h3>Running-example numbers</h3>
  <table class="tbl">
    <tr><th>Run</th><th>Trainable</th><th>Format</th><th>Facts</th><th>General loss</th></tr>
    <tr><td>Base</td><td>—</td><td>0%</td><td>0%</td><td>0.379</td></tr>
    <tr><td>Full SFT, 300 steps</td><td>121,607</td><td>100%</td><td>100%</td><td>0.677</td></tr>
    <tr><td>LoRA r=4, 1,000 steps</td><td>9,216</td><td>100%</td><td>100%</td><td>0.817</td></tr>
    <tr><td>4-bit base + LoRA</td><td>9,216</td><td>100%</td><td>100%</td><td>base 0.380</td></tr>
    <tr><td>Adapter r=8 / soft prompt</td><td>2,192 / 512</td><td>100% / 0%</td><td>34% / 0%</td><td>—</td></tr>
    <tr><td>Full FT 3,000 steps / + 20% replay</td><td>121,607</td><td>—</td><td>100% / 100%</td><td>0.832 / 0.651</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Fine-tuning</b><p>Format, tone, narrow skills; a small model matching a big one on one job.</p><small>Not for facts that change or need citations: RAG</small></div>
    <div><b>Full fine-tuning</b><p>Big data, big change, hardware to spare.</p><small>Not on one consumer GPU: 16 B/param</small></div>
    <div><b>LoRA / QLoRA</b><p>The default; QLoRA when the bf16 base doesn't fit.</p><small>Not a forgetting shield; merge into a bf16 base</small></div>
    <div><b>Instruction tuning</b><p>Several jobs or open-ended instructions.</p><small>Labs did the general version; you mix your tasks</small></div>
    <div><b>DPO</b><p>Preference pairs after SFT (tone, honesty, no invented ETAs).</p><small>Not from a base model; tiny LR; watch chosen log-prob</small></div>
    <div><b>Replay</b><p>Any narrow fine-tune: mix 5–20% general data.</p><small>Skipping it trades general skill for the task</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Fine-tuning facts; no frozen eval set; loss on prompt tokens; template mismatch; sizing for weights only; "LoRA can't forget"; trusting a falling DPO loss; merging into a 4-bit base; reporting only the task number.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>LoRA parameters for one 4096×4096 matrix at r = 16?</td><td>16 × (4096 + 4096) = 131,072 (128× fewer than 16,777,216)</td></tr>
    <tr><td>Memory to fully fine-tune a 13B model with Adam, before activations?</td><td>13 × 10⁹ × 16 B = 208 GB</td></tr>
    <tr><td>int4 symmetric scale for max|w| = 2.10, and the code for 0.42?</td><td>2.10 / 7 = 0.3; round(1.4) = 1 → 0.3</td></tr>
    <tr><td>DPO loss when policy = reference?</td><td>margin 0 → −log σ(0) = log 2 = 0.693</td></tr>
    <tr><td>Task score up, general score down after a fine-tune: first fix?</td><td>Mix 5–20% general data back in (replay); fewer steps or lower LR</td></tr>
  </table>

  <h2 id="ft-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain each step of a fine-tune, and why each one needs the one before it? Answer before revealing.</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>When do you fine-tune instead of using RAG or better prompts?</summary><div class="qa-body">Prompt first (free, fixes behaviour and format). RAG if the gap is knowledge: private, recent, or needs citations. Fine-tune when behaviour must change reliably and prompting can't hold it: a strict output format, a house style, a narrow skill at scale, or to let a small cheap model do a big model's job. Combine fine-tuning (how) with RAG (what) when you need both, as in the Biteful setup where facts come in the prompt and the format is trained.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly is masked in SFT, and why?</summary><div class="qa-body">Every token before the assistant's reply (system, user, the assistant marker) gets the ignore label, so the loss is computed only on the reply and its end marker (21 of 41 positions in our example). The model should learn to produce answers, not to imitate customers' questions; and learning the end marker teaches it when to stop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain LoRA and why it works.</summary><div class="qa-body">Freeze W and learn the update as a low-rank product: <code>h = Wx + (α/r)·BAx</code>, B is d × r, A is r × k, r ≪ d. It works because task-specific weight updates have low intrinsic rank, so a few directions capture most of the change. Memory falls sharply (no gradients or optimizer states for W), and the update can be merged into W for free inference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is B initialised to zero (and not both A and B)?</summary><div class="qa-body">B = 0 makes BA = 0, so training starts exactly at the pretrained model. A is random so gradients for B are non-zero; if both were zero, both gradients would be zero and nothing would learn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Quantize w = [0.42, −1.30, 2.10] to int8 asymmetric. Give scale, zero-point and q.</summary><div class="qa-body">scale = (2.10 − (−1.30)) / 255 = 0.013333. zero-point = round(1.30 / 0.013333) = round(97.5) = 98. q = round(w/scale) + 98: 0.42 ÷ 0.013333 = 31.5 (31.4999… in floating point) → 31 + 98 = 129; −1.30 → −98 + 98 = 0; 2.10 → 158 + 98 = 256, clipped to 255. De-quantize with (q − 98) × 0.013333.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the Q in QLoRA add?</summary><div class="qa-body">The frozen base is stored in 4-bit NF4 (~4 GB for 7B instead of 14 GB). Double quantization also compresses the scale constants, and paged optimizers absorb memory spikes. Weights are de-quantized to BF16 for each matmul and the LoRA adapters train in BF16. Result: a 7B fine-tune on one 24 GB GPU.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You serve 50 customers, each with their own fine-tune of the same 8B model. Merge or not?</summary><div class="qa-body">Don't merge. Keep one base model in GPU memory and load each customer's adapter (tens of MB) per request; vLLM and similar servers support multi-LoRA serving. Merging would mean 50 full copies of the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through RLHF. What are the reward model and the KL penalty for?</summary><div class="qa-body">(1) Humans rank pairs of answers. (2) Train a reward model that scores (prompt, answer) so preferred answers score higher; it replaces slow human judgement with a fast score. (3) PPO maximises <code>reward − β·KL(policy ‖ SFT)</code>. The KL term keeps the model near the SFT model so it can't exploit the reward model's blind spots (reward hacking).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the DPO loss: chosen moved −0.020 vs reference, rejected moved −2.277, β = 0.1.</summary><div class="qa-body">margin = −0.020 − (−2.277) = 2.257; β·margin = 0.2257; σ = 0.5562; loss = −ln 0.5562 = 0.587. Below log 2 = 0.693, the loss at the start when policy equals reference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why has DPO largely replaced RLHF for open models?</summary><div class="qa-body">It optimises the same preference objective with one supervised-style loss on (prompt, chosen, rejected) triples: no reward model, no RL loop. A frozen reference model and β provide the "don't drift" pressure. It is simpler, cheaper and more stable. Large labs still use RL (PPO, or RL on verifiable rewards) where a strong reward signal pays off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does LoRA need the full-fine-tuning memory arithmetic to make sense?</summary><div class="qa-body">LoRA's whole point is removing the gradient (2 B), master copy (4 B) and Adam state (8 B) for the frozen weights: 14 of the 16 bytes per parameter. Without knowing where the 112 GB goes, "train fewer parameters" sounds like a speed trick; it's really a memory trick (compute was only ≈5 GPU-minutes anyway).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does QLoRA need LoRA, rather than training the 4-bit weights directly?</summary><div class="qa-body">4-bit weights have only 16 levels; the small updates of training would be rounded away, and there is no gradient through rounding. QLoRA keeps the quantized weights frozen (read-only, de-quantized for each matmul) and puts all learning into full-precision adapters. Compress what is frozen; keep precision where you learn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the evaluation step after SFT?</summary><div class="qa-body">You only see the task score (format 0% → 100%) and miss the trade: general loss 0.379 → 0.677 and a broken answer to "can I cancel order 105?". Without the general number, forgetting ships to users. Without a frozen held-out set, the task score itself may be memorisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is DPO run after SFT and not on the base model?</summary><div class="qa-body">DPO only adjusts relative probabilities of answers the model can already produce; its reference is the starting model. From a base model, neither chosen nor rejected replies are likely, and pushing the gap can lower both (as our high-LR run did even from SFT). SFT first teaches the format; DPO then sharpens preferences inside it.</div></details>
  <div class="bridge"><b>Next:</b> <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a> measures the whole Biteful assistant properly; then <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a> serves it to 1,000 users at once.</div>
</main>`
});
