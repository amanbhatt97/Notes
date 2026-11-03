// notes/genai/finetuning.js — Fine-Tuning
Object.assign(TOPIC_CONTENT, {
  "finetuning": `<main>
  <h1>Fine-Tuning</h1>
  <div class="where"><span>Generative AI</span><span>Customizing Models</span><span>Fine-Tuning</span></div>
  <p class="lead">Fine-tuning means taking a model that has already been trained and training it a little more on your own examples, so that a new behaviour becomes its default. Prompting tells a model what to do on one call, and RAG hands it facts (<a class="xref" data-note="rag">Retrieval-Augmented Generation</a>); neither changes what the model does when you say nothing. Fine-tuning does, which is why companies use it for a house style, a strict output format, or to let a small cheap model do one job as well as a big one. Our running example is Biteful's support assistant: Asha asks where order 101 is, the order system says it is out for delivery with rider Ravi and an ETA of 9:05 pm, and Biteful wants every reply in its house format, "hi ! order 101 is out for delivery . ravi will reach you by 9:05 pm . — team biteful". Since real models cannot be trained in a notebook, every experiment uses a tiny language model written in NumPy and trained on made-up Biteful text; it shows the mechanics of each technique faithfully, while figures for real 7-billion-parameter models are worked out by arithmetic.</p>

  <h2 id="ft-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Fine-Tuning</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">When</div>
        <ul>
          <li>Fine-tuning changes how a model behaves; RAG changes what it knows</li>
          <li>Prompt first; fine-tune when behaviour must hold on every call</li>
          <li>Never to store facts that change</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How</div>
        <ul>
          <li><b>SFT</b>: next-token loss on (prompt, ideal reply) pairs</li>
          <li>Loss mask: grade only the reply tokens</li>
          <li>Full fine-tuning ≈ 16 bytes per parameter</li>
          <li><b>LoRA</b>: frozen W + trainable B·A</li>
          <li><b>QLoRA</b>: 4-bit frozen base + LoRA</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Beyond one task</div>
        <ul>
          <li>Instruction tuning: many tasks, each as an instruction</li>
          <li>RLHF: reward model + RL with a KL leash</li>
          <li>DPO: one loss on chosen vs rejected pairs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Safety checks</div>
        <ul>
          <li>Freeze the eval set first</li>
          <li>Report base, fine-tuned and general scores</li>
          <li>Forgetting: fix with replay of general data</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ft-when"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When to Fine-Tune</span><span class="rm-sub">prompting, RAG or training</span></div></div>
      <div class="rm-item rm-done" data-target="ft-sft"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Supervised Fine-Tuning</span><span class="rm-sub">examples, chat templates and the loss mask</span></div></div>
      <div class="rm-item rm-done" data-target="ft-cost"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Cost of Full Fine-Tuning</span><span class="rm-sub">where 112 GB comes from</span></div></div>
      <div class="rm-item rm-done" data-target="ft-lora"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">LoRA</span><span class="rm-sub">training a small low-rank change</span></div></div>
      <div class="rm-item rm-done" data-target="ft-quant"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Quantization and QLoRA</span><span class="rm-sub">storing the frozen model in 4 bits</span></div></div>
      <div class="rm-item rm-done" data-target="ft-peft"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Other PEFT Methods</span><span class="rm-sub">adapters, prompt tuning, and why LoRA won</span></div></div>
      <div class="rm-item rm-done" data-target="ft-instruct"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Instruction Tuning</span><span class="rm-sub">one model that follows many instructions</span></div></div>
      <div class="rm-item rm-done" data-target="ft-align"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">RLHF and DPO</span><span class="rm-sub">learning which answer people prefer</span></div></div>
      <div class="rm-item rm-done" data-target="ft-eval"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Evaluating a Fine-Tune</span><span class="rm-sub">the three numbers to report</span></div></div>
      <div class="rm-item rm-done" data-target="ft-forget"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Catastrophic Forgetting</span><span class="rm-sub">what training breaks, and replay</span></div></div>
      <div class="rm-item rm-done" data-target="ft-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">quiet failures in real runs</span></div></div>
      <div class="rm-item rm-done" data-target="ft-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, memory, method table</span></div></div>
      <div class="rm-item rm-done" data-target="ft-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about fine-tuning</span></div></div>
    </div>
  </div>

  <h2 id="ft-when"><span class="num">01</span>When to Fine-Tune</h2>
  <p>Biteful already has two tools. From <a class="xref" data-note="prompting">Prompt Engineering</a>, it can write a style guide into the system prompt; from RAG and tool calling, it can hand the model order 101's live status. Yet the brand team still complains: on some days replies drift from the house format, a 1,200-token style guide rides along on every call, and they would love a small, cheap model to handle the 20,000 daily "where is my order" questions. Is there a way to make the format the model's <em>default</em>, and when is that worth the effort?</p>
  <p><strong>Fine-tuning</strong> is continuing to train a pretrained model on a smaller set of your own examples, so that its default behaviour changes. It is slow, costs real money and is often unnecessary, so the first skill is knowing when to use it. A useful picture is a brilliant new employee. Prompting is giving clearer instructions every morning. RAG is a reference binder they look things up in. Fine-tuning is a training course that builds new habits, so you stop repeating the instructions. Pre-training a model from scratch would be raising a person from birth, which almost nobody needs to do. In one line: <strong>fine-tuning changes how the model behaves; RAG changes what it knows</strong>.</p>
  <table class="tbl">
    <tr><th>Symptom</th><th>Example</th><th>Use</th></tr>
    <tr><td>The model can do it, just not the way you asked</td><td>"summarise in 3 bullets"; return JSON</td><td>prompting</td></tr>
    <tr><td>It lacks facts that are private, recent or must be cited</td><td>Biteful's refund rule; order 101's status</td><td>RAG or tools</td></tr>
    <tr><td>Prompts keep growing and it still drifts</td><td>house format on every reply; SQL in one dialect</td><td>fine-tuning</td></tr>
    <tr><td>A small model must match a big one on one narrow job</td><td>20,000 daily order-status replies</td><td>fine-tuning (train on the big model's checked outputs)</td></tr>
    <tr><td>Both a voice and current facts</td><td>"sound like Biteful and cite today's policy"</td><td>fine-tuning and RAG together</td></tr>
  </table>
  <p>Before training anything, price the alternative. With prompting, the style guide and six example replies, 1,680 tokens, are re-sent with every call. The prices below are example prices per million tokens for a large and a small model; check your provider's current price list.</p>
  <div class="fx" data-lang="py">calls = 20_000                                   # "where is my order" calls per day
extra = 1_200 + 6 * 80                           # tokens: style guide + six example replies
question, answer = 600, 60                       # tokens for the job itself
def per_day(p_in, p_out, prefix, cached=None):   # EXAMPLE prices in $ per 1M tokens
    pre = prefix * (cached if cached is not None else p_in)
    return calls * (pre + question * p_in + answer * p_out) / 1e6

print(f"extra tokens for style: {extra:,} per call -&gt; {extra * calls / 1e6:.1f}M per day")
print(f"large model, style prompt         : $ {per_day(4.00, 20.00, extra):7.2f}/day")
print(f"large model, style prompt cached  : $ {per_day(4.00, 20.00, extra, 0.20):7.2f}/day")
print(f"small fine-tuned model, no prompt : $ {per_day(0.10, 0.50, 0):7.2f}/day")</div>
  <div class="fx" data-lang="text">extra tokens for style: 1,680 per call -&gt; 33.6M per day
large model, style prompt         : $  206.40/day
large model, style prompt cached  : $   78.72/day
small fine-tuned model, no prompt : $    1.80/day</div>
  <p>By hand: 1,680 extra tokens × 20,000 calls is 33.6 million tokens a day; at $4 per million that adds $134.40 to the $72 the job itself costs, giving $206.40. <strong>Prompt caching</strong>, where the provider stores a repeated prompt prefix and charges much less to reread it, cuts the extra part to 33.6 million × $0.20 per million = $6.72, giving $78.72. So with caching, cost alone is a weak reason to fine-tune a big model. The strong reasons are reliability (a format that holds on every reply) and the last line: a small model with the house style trained in costs $1.80 a day, about 40 times less, provided an evaluation shows it is good enough.</p>
  <p>It also helps to know where fine-tuning sits in a model's life (<a class="xref" data-note="llm_basics">How LLMs Work</a>). Pre-training on huge amounts of text produces a <strong>base model</strong> that only continues text. Supervised fine-tuning on instruction–answer pairs turns it into an <strong>instruct model</strong>, and preference tuning (section 08) turns that into the polite chat model you use. These later stages together are called <strong>post-training</strong>. You inherit the expensive first stage from a lab and usually run a small second stage, sometimes a third, on your own data. One warning applies throughout: do not fine-tune to teach facts. A fine-tuned fact is frozen at training time, cannot be cited, and is recalled unreliably. Ask, "would this answer change if the policy changed tomorrow?" If yes, it belongs in RAG.</p>

  <h2 id="ft-sft"><span class="num">02</span>Supervised Fine-Tuning</h2>
  <p>To watch fine-tuning happen we need a model we can train in seconds. Ours is a tiny next-token predictor written in NumPy. To guess the next word it adds up three rows of learned scores: one chosen by the previous word, one by the word before that, and one for every word seen so far in the conversation. That last part is a crude "look back" that lets it copy details such as the order number and rider's name from the prompt into its reply. A real LLM does the same job with attention layers (<a class="xref" data-note="transformers">Transformers</a>), but the training is identical: turn the scores into probabilities with softmax, measure the <strong>cross-entropy loss</strong> (minus the log-probability of the correct next word), and nudge every weight downhill.</p>

  <div class="fx" data-lang="py"># A tiny next-token model in NumPy (~54K numbers). To predict the token after position t it
# adds three rows of scores: one for the previous token, one for the token before that, and
# one for every token seen so far (the "look-back" that lets it copy facts from the prompt).
def features(seqs):
    p1, p2, bag, tgt, msk = [], [], [], [], []
    for ids, mask in seqs:
        seen = np.zeros(V, np.float32)
        for t in range(len(ids) - 1):
            seen[ids[t]] = 1
            p1.append(ids[t]); p2.append(ids[t - 1] if t else 0); bag.append(seen.copy())
            tgt.append(ids[t + 1]); msk.append(mask[t + 1])        # mask: is this prediction graded?
    return np.array(p1), np.array(p2), np.stack(bag), np.array(tgt), np.array(msk, np.float32)

def new_model(seed=0):
    r = np.random.default_rng(seed)
    return {"E1": r.normal(0, 0.01, (V, V)).astype(np.float32), "E2": r.normal(0, 0.01, (V, V)).astype(np.float32),
            "E3": r.normal(0, 0.01, (V, V)).astype(np.float32), "b": np.zeros(V, np.float32)}

def logits_of(W, f):
    p1, p2, bag = f[:3]
    return W["E1"][p1] + W["E2"][p2] + bag @ W["E3"] + W["b"]

def loss_and_grads(W, f):
    """Cross-entropy on the graded (mask = 1) positions only, and its gradient."""
    p1, p2, bag, tgt, msk = f
    z = logits_of(W, f); z -= z.max(1, keepdims=True)
    p = np.exp(z); p /= p.sum(1, keepdims=True)                      # softmax
    n = msk.sum()
    loss = -(np.log(p[np.arange(len(tgt)), tgt] + 1e-12) * msk).sum() / n
    G = p; G[np.arange(len(tgt)), tgt] -= 1; G *= (msk / n)[:, None]  # d loss / d logits
    g = {"E1": np.zeros_like(W["E1"]), "E2": np.zeros_like(W["E2"]), "E3": bag.T @ G, "b": G.sum(0)}
    np.add.at(g["E1"], p1, G); np.add.at(g["E2"], p2, G)
    return loss, g</div>

  <p>The function to look at is <code>loss_and_grads</code>. It computes probabilities for every position, takes the log-probability of the true next word, and averages it only over positions where <code>msk</code> is 1; positions with a mask of 0 contribute nothing to the loss or to the gradient. That mask is the heart of supervised fine-tuning, as we will see. Around this model there are small helpers, not shown, for training with the Adam optimizer, greedy generation (always pick the most likely next word), and scoring.</p>
  <p>First we make a "base" model by training on 3,000 lines of made-up general text: plain sentences, generic support chats ("your order is on its way and will arrive soon"), cancellation and spice questions. This stands in for the pretrained instruct model a company would download.</p>
  <div class="fx" data-lang="py">print(f"vocabulary {V} tokens; parameters {sum(w.size for w in new_model().values()):,}")
print("sample training lines:")
for t in gen_text[3:6]:
    print("  ", t)
base = new_model()
train(base, gen_train, steps=1500, lr=0.01)          # "pre-training" on 2,700 general lines
print("held-out general loss:", round(avg_loss(base, general_heldout), 3))
print("Asha's prompt -&gt;", reply(base, asha))</div>
  <div class="fx" data-lang="text">vocabulary 134 tokens; parameters 54,002
sample training lines:
   the paneer roll from chai point was cold today .
   &lt;|user|&gt; is the paneer roll spicy ? &lt;|assistant|&gt; the paneer roll from dosa hut is a little spicy . &lt;|end|&gt;
   hi ! kabir will reach chennai by 8:55 pm — said the team at biteful .
held-out general loss: 0.396
Asha's prompt -&gt; your order is on its way and will arrive soon .</div>
  <p>The model has 54,002 numbers (a real 7B model has about 130,000 times more) and trains in a few seconds. Given Asha's question <em>and</em> the order details, it replies with the generic sentence it saw most often: polite, fluent, and ignoring both the facts and Biteful's format. That is the default behaviour we want to change. The held-out general loss of 0.396, measured on lines it never trained on, is our yardstick for "general skill" later.</p>
  <p><strong>Supervised fine-tuning</strong> (SFT) trains on pairs of a prompt and the ideal reply, using exactly the same next-token loss as pre-training. Nothing new is invented; the only twist is <em>which</em> tokens are graded. Examples are usually stored as JSONL, one JSON object per line, with a list of messages in the same shape the chat API uses. Before training, the model's <strong>chat template</strong> turns that list into one token sequence, with special marker tokens for each role, and a <strong>loss mask</strong> marks which positions count.</p>
  <div class="fx" data-lang="py">import json
record = {"messages": [
    {"role": "user", "content": "where is my order 101 ? status : out for delivery , rider ravi , eta 9:05 pm"},
    {"role": "assistant", "content": "hi ! order 101 is out for delivery . ravi will reach you by 9:05 pm . — team biteful"},
]}
print("JSONL line:", json.dumps(record)[:80], "...")

def chat_template(messages):                     # our model's template: role markers as tokens
    return f"&lt;|user|&gt; {messages[0]['content']} &lt;|assistant|&gt;", f"{messages[1]['content']} &lt;|end|&gt;"

ids, mask = sft_example(*chat_template(record["messages"]))
toks = [itos[i] for i in ids]
print(f"{len(ids)} tokens, {sum(mask)} of them graded\\n")
for s in range(0, len(toks), 9):
    print(" ".join(f"{t:&gt;9}" for t in toks[s:s + 9]))
    print(" ".join(f"{m:&gt;9}" for m in mask[s:s + 9]))</div>
  <div class="fx" data-lang="text">JSONL line: {"messages": [{"role": "user", "content": "where is my order 101 ? status : out  ...
41 tokens, 21 of them graded

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
  <p>Read the mask row under each token. Everything up to and including <code>&lt;|assistant|&gt;</code> is 0: the model reads it but is not graded on predicting it. From "hi" to <code>&lt;|end|&gt;</code> it is 1, so 21 of the 41 tokens are graded. Grading only the reply is called <strong>assistant-only loss</strong>, and it matters because the model should learn to write answers, not to imitate customers' questions (section 11 shows what happens otherwise). Grading the <code>&lt;|end|&gt;</code> token matters too: it is how the model learns to stop. Think of a trainee copying model answers from a binder; the question is printed at the top of each page, and she practises writing only the answers.</p>
  <p>Now the first fine-tune. Before training, we freeze an evaluation set of 50 order/status/rider/ETA combinations that never appear in the 400 training examples. We score two things on it: <strong>format</strong>, whether the reply matches the house template exactly, and <strong>facts</strong>, whether it also copies the right order number, status, rider and ETA.</p>
  <div class="fx" data-lang="py">import time
print("base: format %.0f%%  facts %.0f%%" % tuple(100 * x for x in score(base)))
sft = copy.deepcopy(base)
t0 = time.time()
train(sft, sft_set, steps=300, lr=0.01)              # every weight trainable
fmt, ok = score(sft)
print(f"SFT : format {fmt:.0%}  facts {ok:.0%}  ({time.time() - t0:.0f} s)")
print("Asha -&gt;", reply(sft, asha))</div>
  <div class="fx" data-lang="text">base: format 0%  facts 0%
SFT : format 98%  facts 98%  (2 s)
Asha -&gt; hi ! order 101 is out for delivery . ravi will reach you by 9:05 pm . — team biteful</div>
  <p>In two seconds the default changed: from 0% to 98% on both scores for combinations the model never saw, so it learned the <em>pattern</em> (copy the facts into the template), not 400 memorised strings. Asha now gets exactly the house reply. How much data does this take on real models? Roughly 100–500 examples for a format conversion such as a house template or JSON extraction, 500–2,000 for a style or persona, and 5,000 or more for complex domain reasoning. Quality beats quantity, because every inconsistency is baked in; examples should be consistent and match the real messy inputs (typos, mixed languages, angry customers), contain no personal data or secrets, and typically come from your best agents' past replies or from a big model's outputs that you have checked. And always train with the same chat template you will serve with: a model fine-tuned with one set of markers and prompted with another behaves like the base model.</p>

  <h2 id="ft-cost"><span class="num">03</span>The Cost of Full Fine-Tuning</h2>
  <p>Our SFT run trained all 54,002 numbers, which is called <strong>full fine-tuning</strong>. Biteful would really fine-tune an open model with 7 billion parameters. Will that fit on one GPU, and is the bottleneck memory or computation? During training, every parameter needs much more memory than its own value. The backward pass stores a <strong>gradient</strong> for each parameter (the direction to nudge it). The Adam optimizer keeps two running averages per parameter, its first and second <strong>moments</strong>. And mixed-precision training, which computes in 16-bit numbers for speed, also keeps a 32-bit <strong>master copy</strong> of the weights, because tiny updates vanish when added to 16-bit numbers (<a class="xref" data-note="dl_training">Training Well</a>). It is like renovating every room of a house at once: besides the house you need a second set of blueprints, a list of every change, and two notebooks tracking how each room has been changing. The paperwork is bigger than the house.</p>
  <div class="fx" data-lang="py">N, GB = 7e9, 1e9
parts = {"weights (bf16)": 2, "gradients (bf16)": 2, "fp32 master weights": 4,
         "Adam 1st moment m (fp32)": 4, "Adam 2nd moment v (fp32)": 4}
for name, b in parts.items():
    print(f"{name:25} {b} B/param -&gt; {N * b / GB:4.0f} GB")
print(f"{'total':25} {sum(parts.values())} B/param -&gt; {N * sum(parts.values()) / GB:4.0f} GB  (+ activations)")

tokens = 2_000 * 150 * 3                         # 2,000 examples x 150 tokens x 3 epochs
flops = 6 * N * tokens                           # ~6 FLOPs per parameter per token
print(f"compute: {flops:.2e} FLOPs = {flops / (0.4 * 312e12) / 60:.1f} GPU-minutes at 40% of an A100")

# check the rule on our tiny model, where everything is float32 (4 + 4 + 4 + 4 bytes)
n = sum(w.size for w in sft.values())
_, g = loss_and_grads(sft, features(sft_set[:8]))
per_param = (sum(w.nbytes for w in sft.values()) + sum(x.nbytes for x in g.values())
             + 2 * sum(w.nbytes for w in sft.values())) / n          # weights + grads + Adam m, v
print(f"tiny model: {n:,} params, {per_param:.0f} bytes per parameter while training")</div>
  <div class="fx" data-lang="text">weights (bf16)            2 B/param -&gt;   14 GB
gradients (bf16)          2 B/param -&gt;   14 GB
fp32 master weights       4 B/param -&gt;   28 GB
Adam 1st moment m (fp32)  4 B/param -&gt;   28 GB
Adam 2nd moment v (fp32)  4 B/param -&gt;   28 GB
total                     16 B/param -&gt;  112 GB  (+ activations)
compute: 3.78e+16 FLOPs = 5.0 GPU-minutes at 40% of an A100
tiny model: 54,002 params, 16 bytes per parameter while training</div>
  <p>By hand: 2 + 2 + 4 + 4 + 4 = 16 bytes per parameter, and 7 × 10⁹ × 16 bytes = 112 GB, before the <strong>activations</strong> (intermediate results kept for the backward pass, which grow with batch size and sequence length). An 80 GB GPU cannot hold it; you need at least two, with the optimizer state split between them using tools such as FSDP or DeepSpeed ZeRO. The last line checks the rule on our tiny model, where everything is 32-bit (4 bytes each for weights, gradients and Adam's two moments): exactly 16 bytes per parameter.</p>
  <p>Computation is the surprise. Training costs about 6 floating-point operations per parameter per token (2 for the forward pass, 4 for the backward pass). Two thousand examples of 150 tokens for 3 epochs is 900,000 tokens, so 6 × 7 × 10⁹ × 9 × 10⁵ = 3.78 × 10¹⁶ operations, which at 40% of an A100's peak speed takes about five minutes. <strong>For fine-tuning, memory is the wall, not compute.</strong> One more cost: every full fine-tune produces a complete new 14 GB copy of the model to store and serve. A common mistake follows from forgetting the optimizer: "a 7B model in 16-bit is 14 GB and my GPU has 24 GB, so I can fine-tune it". That fits inference only; training needs eight times the weights' memory.</p>

  <h2 id="ft-lora"><span class="num">04</span>LoRA</h2>
  <p>Full fine-tuning needs 112 GB because every one of the 7 billion weights gets a gradient and optimizer state. But the change from "bland reply" to "Biteful format" is small. Could it be described with far fewer numbers? <strong>LoRA</strong> (Low-Rank Adaptation) bets that it can. It freezes every original weight matrix W and learns only the <em>change</em>, written as the product of two thin matrices: ΔW = B·A. If W is d × k, then B is d × r and A is r × k, where the <strong>rank</strong> r is small, typically 8 or 16. Only A and B get gradients and optimizer state. The bet is that the update a fine-tune needs has <strong>low rank</strong>, meaning it moves the weights along only a few independent directions. Think of a photo-editing adjustment layer: you never repaint the photo, you add a thin layer on top that you can switch off, swap, or flatten into the image.</p>
  <p>A 4 × 4 example makes the shapes concrete. With r = 1, B is a column of 4 numbers and A a row of 4, so 8 numbers instead of 16. Every row of B·A is the row A multiplied by one entry of B, so all rows are multiples of the same row, which is what rank 1 means.</p>
  <div class="fx" data-lang="py">W = np.array([[1., 0., 2., 0.],
              [0., 1., 0., 1.],
              [1., 1., 0., 0.],
              [0., 2., 1., 1.]])                 # frozen "pretrained" weight
B = np.array([[1.], [0.], [2.], [-1.]])          # 4 x 1   (rank r = 1)
A = np.array([[0.5, 0., -1., 0.5]])              # 1 x 4
dW = B @ A
print("dW = B @ A =\\n", dW, "\\nrank:", np.linalg.matrix_rank(dW))
x = np.array([1., 2., 0., 1.])
print("adapter path W x + B (A x):", W @ x + B @ (A @ x))
print("merged path (W + B A) x   :", (W + dW) @ x)
for d, r in [(4, 1), (4096, 8), (4096, 16)]:
    print(f"{d}x{d}, r={r}: full {d * d:,} vs LoRA {r * 2 * d:,} -&gt; {d * d / (r * 2 * d):.0f}x fewer")</div>
  <div class="fx" data-lang="text">dW = B @ A =
 [[ 0.5  0.  -1.   0.5]
 [ 0.   0.   0.   0. ]
 [ 1.   0.  -2.   1. ]
 [-0.5  0.   1.  -0.5]] 
rank: 1
adapter path W x + B (A x): [2. 3. 5. 4.]
merged path (W + B A) x   : [2. 3. 5. 4.]
4x4, r=1: full 16 vs LoRA 8 -&gt; 2x fewer
4096x4096, r=8: full 16,777,216 vs LoRA 65,536 -&gt; 256x fewer
4096x4096, r=16: full 16,777,216 vs LoRA 131,072 -&gt; 128x fewer</div>
  <p>The two paths give the same output, [2, 3, 5, 4]. You can keep the adapter separate and compute W x + B(A x), which is cheap because A x is a single number here, or <strong>merge</strong> it once into W + B·A and serve an ordinary matrix with no extra cost at all. The saving is r(d + k) numbers instead of d × k: twice fewer for the toy, and 256 times fewer for a 4096 × 4096 matrix at r = 8.</p>
  <p>Three details make LoRA train well. A starts small and random while B starts at zero, so B·A = 0 and training begins exactly at the pretrained model; if both were zero, both gradients would be zero and nothing would ever learn. The update is multiplied by a scale α ÷ r, and setting α = 2r keeps that scale at 2 as you change r, so the learning rate need not be retuned. And on real models LoRA is applied to the attention projections and the feed-forward layers, with a learning rate of about 1e-4 to 2e-4, roughly ten times higher than full fine-tuning. Here is the same Biteful job with the base model frozen and LoRA on all three of our weight matrices.</p>
  <div class="fx" data-lang="py">for r in (1, 4):
    lora = new_lora(r)
    trainable = sum(lora[k].size for k in lora if k != "scale")
    same = np.allclose(logits_of(weights(base, lora), features(sft_set[:2])), logits_of(base, features(sft_set[:2])))
    train(base, sft_set, steps=600, lr=0.01, lora=lora)          # base stays frozen; only A, B learn
    fmt, ok = score(weights(base, lora))
    print(f"LoRA r={r}: trainable {trainable:,} of {n:,} ({trainable / n:.1%}) | starts as base: {same}"
          f" | format {fmt:.0%} facts {ok:.0%}")
lora4 = lora
print("Asha -&gt;", reply(weights(base, lora4), asha))</div>
  <div class="fx" data-lang="text">LoRA r=1: trainable 804 of 54,002 (1.5%) | starts as base: True | format 100% facts 98%
LoRA r=4: trainable 3,216 of 54,002 (6.0%) | starts as base: True | format 100% facts 100%
Asha -&gt; hi ! order 101 is out for delivery . ravi will reach you by 9:05 pm . — team biteful</div>
  <p>The line "starts as base: True" confirms that with B = 0 the adapted model is initially identical to the base. With rank 4, 3,216 trainable numbers, 6% of our tiny model, reach the same result as full fine-tuning: 100% format and facts. Even rank 1, with 804 numbers, gets 98% of the facts right, which shows how low-rank this behaviour change really is. (On a 7B model, LoRA at r = 16 on all projections trains about 0.5% of the parameters.) The saved adapter is just those few thousand numbers, and the base model's file is untouched. That gives two ways to deploy. You can <strong>merge</strong> W + (α ÷ r)·B·A once and serve it like the base model, at identical speed. Or you can <strong>swap</strong>: keep one base model in memory and load a small adapter (tens of megabytes for a 7B model) per customer or task; servers such as vLLM can host many adapters on one base (<a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a>). One misconception to avoid: "LoRA cannot forget, because the base is frozen". The model's behaviour is W + B·A, and B·A can overwrite old habits just as well; section 10 shows exactly that.</p>

  <h2 id="ft-quant"><span class="num">05</span>Quantization and QLoRA</h2>
  <p>LoRA removed the gradients and optimizer state for the frozen weights, but the weights themselves still sit in memory: 14 GB for a 7B model in 16-bit. We never change them, only read them. Do they need 16 bits each? <strong>Quantization</strong> stores numbers with fewer bits: each weight is replaced by a small integer, plus one shared <strong>scale</strong> per block of weights (and sometimes a <strong>zero-point</strong>), so that integer × scale is close to the original. It is the same idea as saying "413 g of flour" instead of "412.837194 g": the cake is the same, and like MP3 or JPEG you drop precision nobody notices. Four bits is closer to "about 400 g", usually fine, occasionally noticeable.</p>
  <p>Take six weights, w = [0.42, −1.30, 0.05, 2.10, −0.77, 0.00]. <strong>Symmetric int8</strong> quantization uses the integers −127 to 127: scale = max|w| ÷ 127 = 2.10 ÷ 127 = 0.016535, and each weight becomes round(w ÷ scale), so 0.42 becomes 25, which decodes back to 25 × 0.016535 = 0.4134. <strong>Asymmetric int8</strong> spreads the integers 0 to 255 over the actual range from −1.30 to 2.10: scale = 3.40 ÷ 255 = 0.013333, and the zero-point, the integer that stands for 0.0, is round(1.30 ÷ 0.013333) = 98. This wastes no levels when values are lopsided, for example all positive. <strong>Symmetric int4</strong> has only −7 to 7: scale = 2.10 ÷ 7 = 0.3, so 0.42 becomes round(1.4) = 1, which decodes to 0.3.</p>
  <div class="fx" data-lang="py">w = np.array([0.42, -1.30, 0.05, 2.10, -0.77, 0.00])
def symmetric(w, bits):
    qmax = 2 ** (bits - 1) - 1                   # int8 -&gt; 127, int4 -&gt; 7
    scale = np.abs(w).max() / qmax
    q = np.round(w / scale).astype(int)
    return q, scale, q * scale
def asymmetric(w, bits=8):
    qmax = 2 ** bits - 1                         # 0..255
    scale = (w.max() - w.min()) / qmax
    zero = int(np.round(-w.min() / scale))       # the integer that stands for 0.0
    q = np.clip(np.round(w / scale) + zero, 0, qmax).astype(int)
    return q, scale, zero, (q - zero) * scale

q8, s8, d8 = symmetric(w, 8); qa, sa, za, da = asymmetric(w); q4, s4, d4 = symmetric(w, 4)
print(f"int8 symmetric : scale {s8:.6f}  q {q8.tolist()}")
print(f"int8 asymmetric: scale {sa:.6f}  zero-point {za}  q {qa.tolist()}")
print(f"int4 symmetric : scale {s4:.6f}  q {q4.tolist()}  -&gt; {np.round(d4, 3).tolist()}")
for name, d in [("int8 sym", d8), ("int8 asym", da), ("int4 sym", d4)]:
    print(f"{name:9} mean error {np.abs(w - d).mean():.4f}")</div>
  <div class="fx" data-lang="text">int8 symmetric : scale 0.016535  q [25, -79, 3, 127, -47, 0]
int8 asymmetric: scale 0.013333  zero-point 98  q [129, 0, 102, 255, 40, 98]
int4 symmetric : scale 0.300000  q [1, -4, 0, 7, -3, 0]  -&gt; [0.3, -1.2, 0.0, 2.1, -0.9, 0.0]
int8 sym  mean error 0.0034
int8 asym mean error 0.0044
int4 sym  mean error 0.0667</div>
  <p>The int8 errors are around 0.003 to 0.004, while int4's is 0.067, about twenty times worse, because 15 levels must cover the same range as 255. Notice also that the largest weight, 2.10, sets the scale for everyone, so a single outlier makes every other weight coarser. That is why real schemes use one scale per small block of weights, as this test on 4,096 random weights shows:</p>
  <div class="fx" data-lang="py">def quantize(w, bits, block=16):
    """Block-wise absmax: one scale per block of 16 weights; returns the de-quantized copy."""
    qmax = 2 ** (bits - 1) - 1
    flat = np.concatenate([w.ravel(), np.zeros(-w.size % block, w.dtype)]).reshape(-1, block)
    scale = np.abs(flat).max(1, keepdims=True) / qmax
    scale[scale == 0] = 1
    return (np.round(flat / scale) * scale).ravel()[:w.size].reshape(w.shape).astype(np.float32)

g = np.random.default_rng(0).normal(0, 0.02, 4096).astype(np.float32)
for bits, block in [(8, 4096), (4, 4096), (4, 64)]:
    err = np.abs(g - quantize(g, bits, block)).mean() / np.abs(g).mean()
    print(f"int{bits}, one scale per {block:4} weights: mean relative error {err:.1%}")</div>
  <div class="fx" data-lang="text">int8, one scale per 4096 weights: mean relative error 1.0%
int4, one scale per 4096 weights: mean relative error 17.5%
int4, one scale per   64 weights: mean relative error 11.2%</div>
  <p>With one scale for all 4,096 weights, int4 has a mean relative error of 17.5%; with one scale per 64 weights it falls to 11.2%, because an outlier only affects its own block. Real 4-bit formats go further. <strong>NF4</strong> (NormalFloat-4) places its 16 levels where weights actually are: weights are roughly bell-shaped, so NF4 spaces its levels by equal probability, with more of them near zero. <strong>Double quantization</strong> compresses the per-block scales too. Together they bring a 7B model's weights to about 4 GB.</p>
  <p><strong>QLoRA</strong> combines the two ideas: store the frozen base model in 4-bit, convert each block back to 16-bit on the fly for every matrix multiplication, and train LoRA adapters in full precision on top. Compress what is frozen; keep precision where you learn. Here is a miniature version: our base's weights stored in 8, 4 or 2 bits (one 16-bit scale per block of 16 weights), with LoRA trained on top each time.</p>
  <div class="fx" data-lang="py">n_w = 3 * V * V                                      # the three weight matrices
for bits in (32, 8, 4, 2):
    qbase = base if bits == 32 else {k: quantize(w, bits) if k != "b" else w for k, w in base.items()}
    kib = n_w * 4 / 1024 if bits == 32 else (n_w * bits / 8 + n_w / 16 * 2) / 1024   # + fp16 scale per 16
    lora = new_lora(4)
    train(qbase, sft_set, steps=600, lr=0.01, lora=lora)  # frozen (quantized) base + LoRA on top
    fmt, ok = score(weights(qbase, lora))
    print(f"{bits:2}-bit base: {kib:6.1f} KiB | base general loss {avg_loss(qbase, general_heldout):.3f}"
          f" | after LoRA: format {fmt:.0%} facts {ok:.0%}")</div>
  <div class="fx" data-lang="text">32-bit base:  210.4 KiB | base general loss 0.396 | after LoRA: format 100% facts 100%
 8-bit base:   59.2 KiB | base general loss 0.396 | after LoRA: format 100% facts 100%
 4-bit base:   32.9 KiB | base general loss 0.402 | after LoRA: format 100% facts 100%
 2-bit base:   19.7 KiB | base general loss 0.547 | after LoRA: format 100% facts 100%</div>
  <p>By hand for 4 bits: 53,868 weights × 0.5 bytes = 26,934 bytes, plus 53,868 ÷ 16 ≈ 3,367 scales × 2 bytes = 6,734 bytes, about 32.9 KiB against 210.4 KiB in 32-bit, 6.4 times smaller. The 8-bit and 4-bit bases are barely worse (general loss 0.396 and 0.402), and even the crude 2-bit base, clearly damaged at 0.547, still learns the Biteful task perfectly with LoRA on top. For a real 7B model the same arithmetic gives about 4 GB for the 4-bit base, plus adapters, optimizer state and activations, so a 7B fine-tune fits on a single 24 GB GPU. A typical QLoRA run with the Hugging Face libraries looks like this; it needs a CUDA GPU and model downloads, so it was not run here, and library argument names change between versions:</p>
  <div class="fx" data-lang="py">import torch
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, prepare_model_for_kbit_training
from trl import SFTTrainer, SFTConfig

BASE = "meta-llama/Llama-3.1-8B-Instruct"
data = load_dataset("json", data_files={"train": "train.jsonl", "eval": "eval.jsonl"})

bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",       # the "Q"
                         bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype=torch.bfloat16)
model = AutoModelForCausalLM.from_pretrained(BASE, quantization_config=bnb, device_map="auto")
model = prepare_model_for_kbit_training(model)
tokenizer = AutoTokenizer.from_pretrained(BASE)

lora = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05, task_type="CAUSAL_LM",  # the "LoRA"
                  target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"])
args = SFTConfig(output_dir="qlora-out", num_train_epochs=2, per_device_train_batch_size=4,
                 gradient_accumulation_steps=4, learning_rate=2e-4, lr_scheduler_type="cosine",
                 bf16=True, optim="paged_adamw_8bit", max_length=2048,
                 assistant_only_loss=True, eval_strategy="epoch")
trainer = SFTTrainer(model=model, args=args, peft_config=lora, processing_class=tokenizer,
                     train_dataset=data["train"], eval_dataset=data["eval"])
trainer.train()
trainer.save_model("qlora-out/adapter")              # only the adapters: tens of MB</div>
  <p>Two practical points. To deploy a merged model, reload the base in 16-bit and then merge the adapter; adding the adapter to 4-bit-rounded weights bakes in the rounding error the adapter was trained to work around. And you will meet several quantization tools: <strong>bitsandbytes</strong> quantizes on load with no calibration data and is used for QLoRA training; <strong>GPTQ</strong> and <strong>AWQ</strong> quantize after training using a little calibration data, producing 4-bit files for GPU serving; and <strong>GGUF</strong> is the llama.cpp file format used for CPUs, Apple machines and Ollama.</p>
  <table class="tbl">
    <tr><th>Format</th><th>Bytes per parameter</th><th>7B model</th><th>Quality</th></tr>
    <tr><td>FP32</td><td>4</td><td>28 GB</td><td>reference</td></tr>
    <tr><td>FP16 / BF16</td><td>2</td><td>14 GB</td><td>essentially lossless; the standard</td></tr>
    <tr><td>INT8</td><td>1</td><td>7 GB</td><td>usually under 1% drop</td></tr>
    <tr><td>INT4 / NF4</td><td>0.5</td><td>about 3.5–4 GB</td><td>small drop; more on maths and precise reasoning</td></tr>
  </table>

  <h2 id="ft-peft"><span class="num">06</span>Other PEFT Methods</h2>
  <p>LoRA is one member of a family called <strong>PEFT</strong> (parameter-efficient fine-tuning): any method that freezes the model and trains a small add-on. The members differ in <em>where</em> the add-on sits. Picture customising a car you are not allowed to modify: LoRA makes small adjustments to existing parts, and once merged they are part of the engine; an <strong>adapter</strong> bolts an extra gadget into the drivetrain, which is always there and always adds a little drag; <strong>prompt tuning</strong> sticks notes on the dashboard that the driver reads before every trip.</p>
  <table class="tbl">
    <tr><th>Method</th><th>Idea</th><th>Trade-off</th></tr>
    <tr><td>LoRA</td><td>low-rank ΔW = B·A added to chosen matrices</td><td>merges into W: no extra inference cost</td></tr>
    <tr><td>Adapters</td><td>small bottleneck networks (d → r → d) inserted after layers</td><td>older; extra layers add latency; cannot merge</td></tr>
    <tr><td>Prefix / prompt tuning</td><td>learned "virtual token" vectors in every layer or only at the input</td><td>tiny; unstable; strong mainly on very large models</td></tr>
    <tr><td>BitFit</td><td>train only the bias terms</td><td>tiny; enough only for small shifts</td></tr>
    <tr><td>IA³</td><td>learned vectors that rescale keys, values and activations</td><td>about 0.01% of parameters; good with little data</td></tr>
    <tr><td>DoRA</td><td>split each update into magnitude and direction; LoRA on the direction</td><td>often slightly better than LoRA</td></tr>
  </table>
  <p>Fewer trainable numbers is not automatically better. Here is the same Biteful job with full fine-tuning, LoRA, and the cheapest method of all, BitFit, which trains only the model's 134 bias values.</p>
  <div class="fx" data-lang="py">runs = {"full fine-tuning": None, "LoRA r=4": "lora", "bias only (BitFit)": "bias"}
for name, kind in runs.items():
    m, lora = copy.deepcopy(base), (new_lora(4) if kind == "lora" else None)
    train(m, sft_set, steps=600, lr=0.01, lora=lora, only=["b"] if kind == "bias" else None)
    trainable = {None: n, "lora": 6 * 4 * V, "bias": V}[kind]
    fmt, ok = score(weights(m, lora))
    print(f"{name:19} trainable {trainable:6,} | format {fmt:.0%} facts {ok:.0%}")</div>
  <div class="fx" data-lang="text">full fine-tuning    trainable 54,002 | format 98% facts 98%
LoRA r=4            trainable  3,216 | format 100% facts 100%
bias only (BitFit)  trainable    134 | format 0% facts 0%</div>
  <p>BitFit learned nothing usable: a bias adds the same score to a word regardless of context, so it can make "hi" more likely in general but cannot learn "copy this rider's name into this slot". LoRA, which edits the weight matrices themselves, matches full fine-tuning with 6% of the parameters. That is the general lesson: compare PEFT methods on your evaluation set and on inference speed, not on parameter count alone. LoRA became the default because it merges into the weights (no added latency), trains stably with one main knob, and produces small, swappable adapters; the Hugging Face <code>peft</code> library made it easy to use.</p>

  <h2 id="ft-instruct"><span class="num">07</span>Instruction Tuning</h2>
  <p>Every run so far taught one job: "where is my order" becomes a house reply. Biteful also wants support tickets created from the same facts, in a structured format like <code>{ order_id : 112 , status : picked up , rider : kabir , eta : 9:20 }</code>. Should it train one model per job, or one model that follows whatever instruction it is given? <strong>Instruction tuning</strong> is SFT on <em>many</em> different tasks, each phrased as an instruction and mixed together, so that the model learns that the instruction decides the task. It is how labs turn a base model into an instruct model (FLAN and Alpaca are well-known examples). What we did so far, SFT on one narrow job, is called <strong>task fine-tuning</strong>. A trainee who has only ever practised one form fills in that form whatever you hand her; a trainee who practised twenty forms, each with its title at the top, learns to read the title first.</p>
  <div class="fx" data-lang="py">def score_ticket(W):
    return sum(reply(W, ticket_prompt(*f)) == ticket_reply(*f).replace(" &lt;|end|&gt;", "")
               for f in test_facts) / len(test_facts)
ticket_set = [sft_example(p, a) for p, a, f in tickets() if f not in set(test_facts)]
multi = copy.deepcopy(base)
train(multi, sft_set + ticket_set, steps=600, lr=0.01)      # a shuffled mix of both instructions
f = (101, "out for delivery", "ravi", "9:05")
for name, m in [("single-task SFT", sft), ("instruction-tuned", multi)]:
    print(f"{name:17} reply facts {score(m)[1]:.0%} | ticket exact {score_ticket(m):.0%}")
    print(f"{'':17} 'ticket for' 101 -&gt; {reply(m, ticket_prompt(*f))}")</div>
  <div class="fx" data-lang="text">single-task SFT   reply facts 98% | ticket exact 0%
                  'ticket for' 101 -&gt; hi ! ravi will reach you by 9:05 pm . — team biteful
instruction-tuned reply facts 100% | ticket exact 100%
                  'ticket for' 101 -&gt; { order_id : 101 , status : out for delivery , rider : ravi , eta : 9:05 }</div>
  <p>The single-task model ignores the new instruction and writes a (garbled) house reply: 0% correct tickets. The model trained on a mix of both jobs reads the instruction: 100% on replies and 100% on tickets, for fact combinations it never saw. Real instruction tuning uses thousands of task types, which is why an instruct model can follow instructions it was never trained on: it has learned to read instructions, not just to perform tasks. In practice this means starting from an <code>-Instruct</code> model for chat-style work rather than a base model, which tends to answer a question with more questions, and including some general instructions in your own training mix so that your narrow fine-tune does not erode the instruction-following you inherited.</p>

  <h2 id="ft-align"><span class="num">08</span>RLHF and DPO</h2>
  <p>SFT copies one "gold" reply per prompt. But often many replies are acceptable and some are better than others, and qualities like helpfulness, honesty and tone are much easier to judge by comparison ("A is better than B") than to write perfectly. <strong>Alignment</strong>, or preference tuning, teaches a model which of several plausible answers people prefer. Think of a cooking student: SFT is "make exactly this recipe", while preference tuning is cooking two versions, tasting both and saying "this one is better", again and again, until the student develops taste.</p>
  <p>The classic method is <strong>RLHF</strong> (reinforcement learning from human feedback), in three steps. First, people compare pairs of model answers. Second, a <strong>reward model</strong> is trained to read a prompt and an answer and output a score, such that preferred answers score higher; it turns slow human judgement into a number that can be queried millions of times. Third, the model is trained with reinforcement learning (usually the PPO algorithm) to produce answers the reward model scores highly, while a <strong>KL penalty</strong> keeps it close to the SFT model: the objective is reward − β × KL(model ‖ SFT model). Without that leash, the model finds text the imperfect reward model loves but people hate, which is called <strong>reward hacking</strong>.</p>
  <p><strong>DPO</strong> (Direct Preference Optimization) reaches the same goal without a reward model or reinforcement learning, using one loss on (prompt, chosen, rejected) triples. For each answer it needs two log-probabilities: one under the model being trained (the <strong>policy</strong>) and one under a frozen copy of the starting model (the <strong>reference</strong>). The margin is [log π(chosen) − log π<sub>ref</sub>(chosen)] − [log π(rejected) − log π<sub>ref</sub>(rejected)], and the loss is −log σ(β × margin), where σ is the sigmoid function and β, about 0.1, plays the role of the KL leash. In words: raise the chosen answer's probability relative to where it started, and lower the rejected one's.</p>
  <p>For Biteful, the chosen reply is the informative house reply and the rejected one is the bland "your order is on its way and will arrive soon" that the base model preferred. Policy and reference both start as our SFT model, and we train on 200 preference pairs with a gentle and with a much harder learning rate, printing the first pair each time.</p>
  <div class="fx" data-lang="py">def seq_logp(W, p, a, grad=False):
    """log p(reply | prompt), summed over the reply's tokens (and its gradient if asked)."""
    f = features([sft_example(p, a)]); n = f[4].sum()
    loss, g = loss_and_grads(W, f)
    return (-loss * n, {k: -n * v for k, v in g.items()}) if grad else -loss * n

BLAND = "your order is on its way and will arrive soon . &lt;|end|&gt;"
r3 = random.Random(3)
pairs = [(prompt(*f), house_reply(*f), BLAND) for f in (facts(r3) for _ in range(200))]
ref, beta = copy.deepcopy(sft), 0.1                 # frozen reference = the SFT model

def dpo(policy, pair):
    p, chosen, rejected = pair
    pc, gc = seq_logp(policy, p, chosen, True); pr, gr = seq_logp(policy, p, rejected, True)
    rc, rr = seq_logp(ref, p, chosen), seq_logp(ref, p, rejected)
    margin = (pc - rc) - (pr - rr)
    loss = np.log1p(np.exp(-beta * margin))         # = -log sigmoid(beta * margin)
    coef = -beta / (1 + np.exp(beta * margin))      # d loss / d margin
    return loss, (pc, rc, pr, rr, margin), {k: coef * (gc[k] - gr[k]) for k in gc}

def show(policy, tag):
    loss, (pc, rc, pr, rr, margin), _ = dpo(policy, pairs[0])
    print(f"{tag}: log p(chosen) {pc:6.2f} (ref {rc:6.2f}) | log p(rejected) {pr:7.2f} (ref {rr:6.2f})"
          f" | margin {margin:6.2f} | loss {loss:.4f}")

show(sft, "before   ")
for lr in (1e-3, 5e-2):                             # a gentle nudge vs a hard push
    policy = copy.deepcopy(sft)
    def grad_fn(step):
        out = [dpo(policy, pairs[(step * 8 + i) % 200]) for i in range(8)]
        return np.mean([o[0] for o in out]), {k: sum(o[2][k] for o in out) / 8 for k in out[0][2]}
    adam_train(policy, grad_fn, steps=150, lr=lr)
    show(policy, f"lr={lr:.0e}")
    print(f"           held-out format {score(policy)[0]:.0%} | cancel -&gt; {reply(policy, cancel)}")</div>
  <div class="fx" data-lang="text">before   : log p(chosen)  -0.42 (ref  -0.42) | log p(rejected)  -12.55 (ref -12.55) | margin   0.00 | loss 0.6931
lr=1e-03: log p(chosen)  -0.63 (ref  -0.42) | log p(rejected)  -46.23 (ref -12.55) | margin  33.47 | loss 0.0346
           held-out format 98% | cancel -&gt; you can cancel order 105 from the app before it is prepared .
lr=5e-02: log p(chosen) -40.08 (ref  -0.42) | log p(rejected) -199.77 (ref -12.55) | margin 147.56 | loss 0.0000
           held-out format 0% | cancel -&gt; you can cancel order 105 from the app before it is prepared . . . . . . . . . . . . . . . . . .</div>
  <p>Before training the policy equals the reference, so both brackets are 0, the margin is 0, and the loss is −log σ(0) = −log 0.5 = 0.6931. Every DPO run starts at log 2. After the gentle run: the chosen bracket is −0.63 − (−0.42) = −0.21 and the rejected bracket is −46.23 − (−12.55) = −33.68, so the margin is 33.47; β × margin = 3.347, σ(3.347) = 0.966, and the loss is −ln 0.966 = 0.0346. The bland reply became vastly less likely while the house reply barely moved, held-out format stayed at 98%, and the unrelated cancellation answer is intact.</p>
  <p>The hard run has an even lower loss, but look closer. The <em>chosen</em> reply's log-probability fell from −0.42 to −40.08, so the reply we wanted became almost impossible, held-out format collapsed to 0%, and the cancellation answer now trails off into dots. DPO only rewards the <em>gap</em> between chosen and rejected; pushed hard, it can lower both and wreck the model. That is why real DPO runs use tiny learning rates (around 5e-7), β around 0.1, a single epoch, and always start from a good SFT model, and why a falling DPO loss is not proof of success: check the chosen log-probability and a held-out evaluation. With the TRL library the setup is a few lines (not run here; it needs a downloaded model):</p>
  <div class="fx" data-lang="py">from trl import DPOTrainer, DPOConfig

# rows: {"prompt": "...", "chosen": "better answer", "rejected": "worse answer"}
args = DPOConfig(output_dir="dpo-out", beta=0.1, learning_rate=5e-7, num_train_epochs=1)
trainer = DPOTrainer(model=sft_model, args=args, train_dataset=prefs,
                     processing_class=tokenizer)    # no ref_model: TRL keeps a frozen copy
trainer.train()</div>
  <p>A few related names are worth recognising. <strong>RLAIF</strong> uses an AI model rather than people to label preferences. <strong>Constitutional AI</strong>, Anthropic's method, has the model critique and revise its own answers against written principles. <strong>ORPO</strong> and <strong>KTO</strong> are DPO relatives that fold preferences into SFT or work from single good/bad labels. <strong>RLVR</strong> and <strong>GRPO</strong> apply reinforcement learning with automatically verifiable rewards, such as passing unit tests, which is how reasoning models are trained. Note the answer to a common interview question: RLHF is both supervised and reinforcement learning (the reward model is trained supervised; the PPO step is RL), while DPO is not RL at all.</p>

  <h2 id="ft-eval"><span class="num">09</span>Evaluating a Fine-Tune</h2>
  <p>"Format 100%" sounds like victory, but it was measured on the very job we trained for. Did anything else get worse? A fine-tune is only better if a held-out evaluation says so, and a sound report has <strong>three numbers</strong>: the base model's score on the target task, the fine-tuned model's score on the same task, and both models' scores on a general benchmark of other skills. The task metric should be specific to the job: our format and facts scores, <strong>execution accuracy</strong> for SQL (run the predicted and correct queries and compare the rows), or F1 for extraction. Open-ended quality needs rubric-based LLM judges or side-by-side human comparison (<a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>). Think of a cricketer who spent a month on spin bowling: you check whether his spin improved, whether he is still fit, and compared with whom.</p>
  <div class="fx" data-lang="py">used = {f for _, _, f in train_rows}
print("eval combinations also in training:", len(used &amp; set(test_facts)))
print(f"{'model':9} {'format':&gt;6} {'facts':&gt;6} {'general loss':&gt;13}   reply to an unrelated question")
for name, W in [("base", base), ("full SFT", sft), ("LoRA", weights(base, lora4))]:
    fmt, ok = score(W)
    print(f"{name:9} {fmt:6.0%} {ok:6.0%} {avg_loss(W, general_heldout):13.3f}   {reply(W, cancel)}")</div>
  <div class="fx" data-lang="text">eval combinations also in training: 0
model     format  facts  general loss   reply to an unrelated question
base          0%     0%         0.396   you can cancel order 105 from the app before it is prepared .
full SFT     98%    98%         0.423   you can cancel order 105 from the app before it is prepared .
LoRA        100%   100%         0.829   you can cancel order 105 is being prepared . arjun will reach you by you</div>
  <p>The first line is a contamination check: none of the 50 evaluation combinations appear in training, so the task scores measure generalisation, not memory. Both fine-tunes go from 0% to 98–100% on the task. The general column tells the rest. Full SFT barely moved (0.396 → 0.423) and still answers "can I cancel order 105?" correctly. The LoRA model, trained longer at a high learning rate, has a general loss of 0.829, and its cancellation answer has turned into Biteful-template words: "…is being prepared . arjun will reach you by you". A task-only evaluation would have shipped this.</p>
  <table class="tbl">
    <tr><th>Failure</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td>Catastrophic forgetting</td><td>great on the task, worse at everything else</td><td>replay general data, fewer steps, lower learning rate</td></tr>
    <tr><td>Overfitting</td><td>training loss falls while evaluation loss rises; parrots training examples</td><td>more varied data, early stopping, smaller rank</td></tr>
    <tr><td>Alignment tax</td><td>safety or helpfulness weakens after SFT</td><td>start from an aligned model; include safety examples; DPO after SFT</td></tr>
    <tr><td>Instability</td><td>loss spikes or becomes NaN</td><td>lower learning rate, gradient clipping, drop extreme-length examples</td></tr>
  </table>

  <h2 id="ft-forget"><span class="num">10</span>Catastrophic Forgetting</h2>
  <p>The broken cancellation answer has a name. <strong>Catastrophic forgetting</strong> is the loss of previously learned skills when a network is trained only on new data: the weight changes that help the new task also overwrite what old tasks relied on, and nothing in the loss asks the model to keep its old skills, so it does not. Think of a shop assistant drilled for a month on one script, "hi ! order … — team biteful"; ask her about cancellations and the script comes out anyway. Keep a few cancellation questions in the daily drill and she keeps both. That fix is called <strong>replay</strong> or data mixing: a fraction of general or earlier-task data, typically 5–20%, is mixed into the fine-tuning set. Below we train for 300 and for 3,000 steps, with and without 20% replay (excluding general lines that contradict the new house style), for both full fine-tuning and LoRA.</p>
  <div class="fx" data-lang="py">safe_replay = [e for e, t in zip(gen_train, gen_text[:2700]) if "status :" not in t]   # no conflicting lines
def run(name, steps, use_lora=False, replay=None):
    m, lora = copy.deepcopy(base), (new_lora(4) if use_lora else None)
    train(m, sft_set, steps=steps, lr=0.01, lora=lora, replay=replay)   # replay: 20% of each batch
    W = weights(m, lora)
    print(f"{name:27} facts {score(W)[1]:4.0%} | general loss {avg_loss(W, general_heldout):.3f}")
    print(f"{'':27} cancel -&gt; {reply(W, cancel)}")
run("full FT, 300 steps", 300)
run("full FT, 3000 steps", 3000)
run("full FT, 3000 + 20% replay", 3000, replay=safe_replay)
run("LoRA, 3000 steps", 3000, use_lora=True)
run("LoRA, 3000 + 20% replay", 3000, use_lora=True, replay=safe_replay)</div>
  <div class="fx" data-lang="text">full FT, 300 steps          facts  98% | general loss 0.423
                            cancel -&gt; you can cancel order 105 from the app before it is prepared .
full FT, 3000 steps         facts  98% | general loss 0.510
                            cancel -&gt; you can cancel order 105 from the app before it is prepared .
full FT, 3000 + 20% replay  facts 100% | general loss 0.385
                            cancel -&gt; you can cancel order 105 from the app before it is prepared .
LoRA, 3000 steps            facts  98% | general loss 1.754
                            cancel -&gt; you order 105 is being prepared . kabir will reach you by 9:20 pm . — team biteful
LoRA, 3000 + 20% replay     facts 100% | general loss 0.377
                            cancel -&gt; you can cancel order 105 from the app before it is prepared .</div>
  <p>Read the general-loss column from top to bottom. With full fine-tuning, forgetting grows with training: 0.423 after 300 steps, 0.510 after 3,000, although the cancellation answer survives. With 20% replay the same 3,000 steps end at 0.385, slightly <em>better</em> than the base model's 0.396, with the task still at 100%. LoRA for 3,000 steps forgot badly here (1.754): its cancellation answer is now a full Biteful order-status reply. With replay, LoRA too keeps its general skill (0.377) and answers the cancellation question exactly like the base model. In this toy model LoRA forgets more than full fine-tuning; on real models the published picture tends to be the opposite (LoRA changes less, so it usually learns less and forgets less), but the amount depends on rank, learning rate and number of steps. The only safe rule is to measure general skill after every fine-tune, stop when the task evaluation stops improving, and mix in replay data for any narrow fine-tune.</p>

  <h2 id="ft-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>A subtle but common mistake is computing the loss on the prompt tokens as well as the reply. Training still "works", and the task score may look fine, but the model also learns to imitate the user side of the conversation. We can see it by retraining with every token graded and then giving each model nothing but the user marker:</p>
  <div class="fx" data-lang="py">no_mask = [(ids, [1] * len(ids)) for ids, _ in sft_set]           # the mistake: grade every token
leaky = copy.deepcopy(base)
train(leaky, no_mask, steps=300, lr=0.01)
start = encode("&lt;|user|&gt;")
print("masked SFT  , given only &lt;|user|&gt; -&gt;", decode(generate(sft, start, 20)[1:]))
print("unmasked SFT, given only &lt;|user|&gt; -&gt;", decode(generate(leaky, start, 20)[1:]))</div>
  <div class="fx" data-lang="text">masked SFT  , given only &lt;|user|&gt; -&gt; is the paneer roll spicy ? &lt;|assistant|&gt; the paneer roll from biryani blues is a little spicy . &lt;|end|&gt;
unmasked SFT, given only &lt;|user|&gt; -&gt; where is my order 118 ? status : picked up , rider arjun , eta 8:40 pm &lt;|assistant|&gt; hi !</div>
  <p>Given only <code>&lt;|user|&gt;</code>, the correctly masked model continues with a generic line from its pre-training. The unmasked model has learned to write Biteful customers' questions, complete with order details, and then starts answering itself. Mask everything before the assistant's turn; in TRL this is <code>SFTConfig(assistant_only_loss=True)</code>.</p>
  <p>The most expensive mistake is fine-tuning to teach knowledge. Facts change and need citations, so they belong in RAG or tools; fine-tuning should teach behaviour. The most misleading is having no frozen evaluation set: if evaluation examples leak into training, scores look excellent and production disappoints, so build and freeze the evaluation set before creating training data and check that the overlap is zero.</p>
  <p>Several mistakes make a fine-tune seem to vanish or fail. Training with one chat template and serving with another makes the model behave like the base. Sizing hardware for the weights alone (2 bytes per parameter) instead of the full 16 for training leads to out-of-memory failures. Merging an adapter into a 4-bit base bakes in rounding error; reload the base in 16-bit first.</p>
  <p>Finally, three mistakes come from trusting the wrong number. Believing "LoRA cannot forget" skips the general evaluation that section 10 showed is essential. Trusting a falling DPO loss ignores that the chosen answer's probability can fall too. And reporting only the task score hides every trade-off; report base, fine-tuned and general numbers every time.</p>

  <h2 id="ft-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Fine-tuning</b>: continuing training of a pretrained model on your own examples so its default behaviour changes. Changes <em>how</em>; RAG changes <em>what it knows</em>.</li>
    <li><b>Post-training</b>: SFT plus preference tuning. <b>Base model</b> continues text; <b>instruct model</b> follows instructions.</li>
    <li><b>SFT</b>: next-token training on (prompt, ideal reply) pairs. <b>Chat template</b>: turns role messages into one token sequence. <b>Assistant-only loss</b>: grade only reply tokens.</li>
    <li><b>Full fine-tuning</b>: every weight trainable. <b>PEFT</b>: freeze the model, train a small add-on.</li>
    <li><b>LoRA</b>: h = Wx + (α/r)·BAx, W frozen, A random, B zero. <b>QLoRA</b>: LoRA on a 4-bit (NF4) frozen base.</li>
    <li><b>Quantization</b>: integers plus a scale (and zero-point) per block.</li>
    <li><b>Instruction tuning</b>: SFT on a mixture of many tasks phrased as instructions.</li>
    <li><b>RLHF</b>: preference pairs → reward model → PPO with KL penalty. <b>DPO</b>: one loss on chosen/rejected pairs against a frozen reference.</li>
    <li><b>Catastrophic forgetting</b>: losing old skills after training on new data. <b>Replay</b>: mixing 5–20% old data back in.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>SFT loss</td><td>−(1/|R|) Σ<sub>t∈R</sub> log p(x<sub>t</sub> | x<sub>&lt;t</sub>), R = reply positions</td></tr>
    <tr><td>Full fine-tuning memory</td><td>≈ 16 × N bytes + activations (2 weights + 2 grads + 4 master + 4 + 4 Adam)</td></tr>
    <tr><td>Training compute</td><td>≈ 6 × N × tokens FLOPs</td></tr>
    <tr><td>LoRA parameters per matrix</td><td>r(d + k) instead of d × k</td></tr>
    <tr><td>Symmetric quantization</td><td>s = max|w| ÷ q<sub>max</sub>; q = round(w ÷ s); ŵ = q × s</td></tr>
    <tr><td>Asymmetric quantization</td><td>s = (max − min) ÷ (2<sup>b</sup> − 1); z = round(−min ÷ s); q = round(w ÷ s) + z</td></tr>
    <tr><td>DPO loss</td><td>−log σ(β × [(log π<sub>c</sub> − log π<sub>ref,c</sub>) − (log π<sub>r</sub> − log π<sub>ref,r</sub>)]); starts at log 2</td></tr>
    <tr><td>RLHF objective</td><td>reward − β × KL(policy ‖ SFT model)</td></tr>
  </table>
  <h3>Choosing a method</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Use when</th><th>Avoid when</th></tr>
    <tr><td>Prompting</td><td>always first</td><td>behaviour must hold on every call at scale</td></tr>
    <tr><td>RAG</td><td>facts: private, recent, cited</td><td>the gap is style or format</td></tr>
    <tr><td>Full fine-tuning</td><td>big change, lots of data, hardware to spare</td><td>one consumer GPU</td></tr>
    <tr><td>LoRA / QLoRA</td><td>the default; QLoRA when the 16-bit base doesn't fit</td><td>(never "safe from forgetting")</td></tr>
    <tr><td>Instruction tuning</td><td>several jobs or open-ended instructions</td><td>one narrow job</td></tr>
    <tr><td>DPO</td><td>preference pairs after SFT</td><td>starting from a base model</td></tr>
  </table>
  <h3>A QLoRA config at a glance</h3>
  <div class="fx" data-lang="py">BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                   bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype=torch.bfloat16)
LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                                                "gate_proj", "up_proj", "down_proj"])
SFTConfig(learning_rate=2e-4, assistant_only_loss=True, optim="paged_adamw_8bit")
DPOConfig(beta=0.1, learning_rate=5e-7, num_train_epochs=1)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Don't fine-tune facts; use RAG.</li>
    <li>Freeze the evaluation set first; check overlap is zero.</li>
    <li>Mask the prompt; train and serve with the same template.</li>
    <li>Training needs ~16 bytes per parameter, not 2.</li>
    <li>LoRA: A random, B zero; α = 2r; merge into a 16-bit base.</li>
    <li>LoRA can still forget: measure general skill, use replay.</li>
    <li>DPO: tiny learning rate; watch the chosen log-probability.</li>
    <li>Report base, fine-tuned and general scores.</li>
  </ul>

  <h2 id="ft-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is fine-tuning, and how is it different from pre-training?</summary><div class="qa-body">Pre-training learns general language from huge amounts of text, from scratch, at enormous cost. Fine-tuning starts from that trained model and continues training on a small, task-specific dataset so its default behaviour changes, typically for a format, style or narrow skill. It costs a tiny fraction of pre-training.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you fine-tune instead of using RAG or better prompts?</summary><div class="qa-body">Prompt first, because it is free and fixes most behaviour problems. Use RAG when the gap is knowledge: private, recent or needing citations. Fine-tune when a behaviour must hold reliably and prompting cannot achieve it, such as a strict output format or house style, or when a small cheap model must match a big one on a narrow job. Combine fine-tuning for how with RAG for what.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly is masked in SFT, and why?</summary><div class="qa-body">Every token before the assistant's reply (system, user and the assistant marker) is excluded from the loss, so only the reply and its end token are graded; in our example, 21 of 41 tokens. The model should learn to produce answers, not to imitate users' questions, and grading the end token teaches it when to stop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How much memory does full fine-tuning of a 7B model need, and why?</summary><div class="qa-body">About 112 GB plus activations. With mixed-precision Adam each parameter needs 16 bytes: 2 for 16-bit weights, 2 for gradients, 4 for a 32-bit master copy, and 4 each for Adam's two moments. 7 billion × 16 bytes = 112 GB, so it needs at least two 80 GB GPUs with sharded optimizer state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain LoRA and why it works.</summary><div class="qa-body">LoRA freezes each weight matrix W and learns its change as a low-rank product: h = Wx + (α/r)·BAx, with B d × r, A r × k and r much smaller than d. It works because the weight updates a fine-tune needs have low intrinsic rank, so a few directions capture most of the change. It removes gradients and optimizer state for W, and the update can be merged into W for free inference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many trainable parameters does LoRA add to a 4096 × 4096 matrix at r = 16?</summary><div class="qa-body">r(d + k) = 16 × (4096 + 4096) = 131,072, compared with 16,777,216 for the full matrix: 128 times fewer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is B initialised to zero and A randomly, rather than both to zero?</summary><div class="qa-body">B = 0 makes BA = 0, so training starts exactly at the pretrained model. A must be random so that B receives a non-zero gradient; if both were zero, both gradients would be zero and nothing would learn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do r and α control in LoRA?</summary><div class="qa-body">r is the rank, the capacity of the update: 8–16 is a common start, raised only if evaluations show underfitting. α scales the update by α ÷ r; setting α = 2r keeps the effective scale constant when r changes, so the learning rate does not need retuning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Quantize w = [0.42, −1.30, 2.10] to int8 asymmetric: scale, zero-point and codes?</summary><div class="qa-body">Scale = (2.10 − (−1.30)) ÷ 255 = 0.013333. Zero-point = round(1.30 ÷ 0.013333) = 98. Codes = round(w ÷ scale) + 98: 0.42 gives 31 + 98 = 129; −1.30 gives −98 + 98 = 0; 2.10 gives 158 + 98 = 256, clipped to 255. Decode with (q − 98) × scale.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the Q in QLoRA add, and why not train the 4-bit weights directly?</summary><div class="qa-body">The frozen base is stored in 4-bit NF4 with double-quantized scales and de-quantized to 16-bit for each matrix multiplication, so a 7B fine-tune fits one 24 GB GPU. The 4-bit weights stay frozen because 16 levels cannot represent small training updates, which would be rounded away; all learning happens in full-precision LoRA adapters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You serve 50 customers, each with their own fine-tune of the same 8B model. Merge or not?</summary><div class="qa-body">Don't merge. Keep one base model in GPU memory and load each customer's small adapter per request; servers such as vLLM support many LoRA adapters on one base. Merging would mean 50 full copies of the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is instruction tuning, and how does it differ from task fine-tuning?</summary><div class="qa-body">Instruction tuning is SFT on a mixture of many tasks, each written as a natural-language instruction, so the model learns to follow instructions in general, including new ones. Task fine-tuning trains on one narrow job; our single-task model ignored a new "ticket" instruction, while the model trained on both jobs handled each correctly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through RLHF. What are the reward model and the KL penalty for?</summary><div class="qa-body">People compare pairs of answers; a reward model is trained to score answers so preferred ones score higher, replacing slow human judgement with a fast score; then RL (usually PPO) maximises reward − β × KL(policy ‖ SFT model). The KL term keeps the model close to the SFT model so it cannot exploit the reward model's blind spots, which is called reward hacking.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the DPO loss when the policy equals the reference, and why?</summary><div class="qa-body">The margin is zero because both log-probability differences are zero, so the loss is −log σ(0) = −log 0.5 = log 2 ≈ 0.693. Every DPO run starts there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why has DPO largely replaced RLHF for open models, and what is its main pitfall?</summary><div class="qa-body">DPO optimises the same preference objective with one supervised-style loss, with no reward model and no RL loop, so it is simpler, cheaper and more stable. Its pitfall is that it rewards only the gap between chosen and rejected answers: with too high a learning rate both probabilities can fall and quality collapses, as our hard run showed. Use tiny learning rates, start from SFT, and watch the chosen log-probability and held-out scores.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the "three numbers" you should report for a fine-tune?</summary><div class="qa-body">The base model's score on the target task, the fine-tuned model's score on the same task, and both models' scores on a general benchmark. The first two show the gain; the third shows what the gain cost, such as forgetting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is catastrophic forgetting, and how do you prevent it?</summary><div class="qa-body">It is the loss of earlier skills after training only on new data, because nothing in the loss protects old behaviour. Prevent it by mixing 5–20% general or earlier-task data into training (replay), training for fewer steps or at a lower learning rate, and measuring a general benchmark at every checkpoint. In our runs, 20% replay kept general loss at the base level while the task stayed at 100%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does LoRA prevent forgetting because the base weights are frozen?</summary><div class="qa-body">No. The model's behaviour is W + BA, and BA can overwrite old habits. LoRA often forgets somewhat less than full fine-tuning on real models because it changes less, but this depends on rank, learning rate and steps; in our toy, LoRA forgot more. Measure it every time.</div></details>
</main>
`
});
