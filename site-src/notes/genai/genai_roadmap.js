// notes/genai/genai_roadmap.js — Start Here: The Learning Path
Object.assign(TOPIC_CONTENT, {
  "genai_roadmap": `<main>
  <h1>Start Here: The Learning Path</h1>
  <p class="lead">Sixteen notes, in order, that take you from "what is a token" to shipping an agent. Each one assumes only the notes before it and ends with a small build. Read this page first, then return to it whenever you're not sure what to study next.</p>

  <h2 id="gr-mindmap" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
  <div class="mm-center">GenAI path: token → shipped agent</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">1 · Foundations</div>
      <ul>
        <li><b>01 NLP</b> — TF-IDF, word vectors, why context matters</li>
        <li><b>02 Transformers</b> — BPE tokens, attention softmax(QKᵀ/√d)V, decoder-only</li>
        <li><b>03 How LLMs Work</b> — next-token pre-training, sampling, KV cache, cost</li>
        <li><b>Key skill</b> — explain prompt → token → price</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">2 · Working with LLMs</div>
      <ul>
        <li><b>04 Prompting</b> — system prompt, few-shot, CoT, XML tags, chaining</li>
        <li><b>05 APIs &amp; Tools</b> — Messages API, structured outputs, tool loop, caching</li>
        <li><b>Key skill</b> — write the <code>tool_use → tool_result</code> loop from a blank file</li>
        <li>⚠ <b>The hinge</b> of the whole path: give 05 a full week</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">3 · RAG</div>
      <ul>
        <li><b>06 Vector DBs</b> — embeddings, cosine, HNSW / IVF-PQ, hybrid + RRF</li>
        <li><b>07 RAG</b> — chunk → retrieve → rerank → answer with citations</li>
        <li><b>Key skill</b> — tell a retrieval failure from a generation failure</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">4 · Agents</div>
      <ul>
        <li><b>08 Fundamentals</b> — workflows vs agents, ReAct, memory, tool design</li>
        <li><b>09 From scratch</b> — plain-Python loop, step limit, memory</li>
        <li><b>10 LangChain · 11 LangGraph</b> — LCEL; graphs, checkpoints, human approval</li>
        <li><b>12 Multi-agent &amp; MCP</b> — supervisor/workers, MCP servers</li>
        <li><b>Key skill</b> — choose workflow vs agent, and defend it</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">5 · Production</div>
      <ul>
        <li><b>13 Evals</b> — golden dataset, code checks, LLM-as-judge, tracing</li>
        <li><b>14 Guardrails &amp; deploy</b> — injection defence, cost levers, FastAPI</li>
        <li><b>Key skill</b> — prove a change helped with data, not vibes</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">6 · Customizing &amp; capstone</div>
      <ul>
        <li><b>15 Fine-tuning</b> — prompt vs RAG vs FT, LoRA/QLoRA, DPO</li>
        <li><b>16 Capstone</b> — spec → RAG + tools + memory + guardrails + evals → API</li>
        <li><b>Key skill</b> — know when fine-tuning is (not) the answer; ship alone</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">How to study</div>
      <ul>
        <li><b>Per note</b> — read fast, type the Build it, answer Q&amp;A aloud</li>
        <li><b>Never skip</b> — 05, 07, 08, 09, 13</li>
        <li>⚠ <b>Mistakes</b> — frameworks before the loop · agent where a workflow fits · no evals</li>
        <li><b>Pace</b> — 10 weeks part-time; 4-week sprint possible</li>
      </ul>
    </div>
  </div>
</div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="gr-map"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Path at a Glance</span><span class="rm-sub">Six stages and a capstone</span></div></div>
      <div class="rm-item rm-done" data-target="gr-stages"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Stage by Stage</span><span class="rm-sub">Notes, skills, mini-builds</span></div></div>
      <div class="rm-item rm-done" data-target="gr-plan"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">A 10-Week Plan</span><span class="rm-sub">Part-time, 8–10 h a week</span></div></div>
      <div class="rm-item rm-done" data-target="gr-skip"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Short on Time?</span><span class="rm-sub">What to skim, what never to skip</span></div></div>
      <div class="rm-item rm-done" data-target="gr-mistakes"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Three Common Mistakes</span><span class="rm-sub">And how to avoid them</span></div></div>
      <div class="rm-item rm-done" data-target="gr-ready"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">You're Ready When…</span><span class="rm-sub">The final checklist</span></div></div>
    </div>
  </div>

  <h2 id="gr-map"><span class="num">01</span>The Path at a Glance</h2>
  <div class="flow"><span>1 · Foundations</span><span>2 · Working with LLMs</span><span>3 · RAG</span><span>4 · Agents</span><span>5 · Production</span><span>6 · Customizing Models</span><span>Capstone</span></div>
  <ul>
    <li><strong>1–2</strong>: how a model works and how to talk to it from code. The <strong>tool-calling loop</strong> in 05 is the hinge of the whole path.</li>
    <li><strong>3</strong>: give the model knowledge it doesn't have.</li>
    <li><strong>4</strong>: let the model take actions in a loop, first by hand, then with frameworks.</li>
    <li><strong>5</strong>: prove it works (evals) and keep it safe, cheap and running.</li>
    <li><strong>6</strong>: change the model itself, only when prompting and RAG aren't enough.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Learning to drive. Foundations = how the engine works. LLM APIs = the steering wheel and pedals. RAG = a map. Agents = driving yourself to a destination. Production = insurance, a service schedule and a fuel budget. Fine-tuning = modifying the car, which most drivers never need.</p>
  </div>
  <div class="callout intu"><span class="label">How to use each note</span>
    <p>Read it once quickly. Type and run the <strong>Build it</strong> section yourself; don't copy-paste. Answer the Q&amp;A out loud before revealing. Move on when you can do the build from a blank file.</p>
  </div>

  <h2 id="gr-stages"><span class="num">02</span>Stage by Stage</h2>
  <h3>Stage 1 · Foundations</h3>
  <ul>
    <li><strong>Notes</strong>: 01 · NLP Foundations, 02 · Transformers, 03 · How LLMs Work.</li>
    <li><strong>After it you can</strong>: explain tokens, embeddings and attention; say why models hallucinate; reason about context windows, temperature and token cost.</li>
    <li><strong>Mini-build</strong>: scaled dot-product attention in NumPy, then a sampler that turns logits into text at different temperatures.</li>
  </ul>
  <h3>Stage 2 · Working with LLMs</h3>
  <ul>
    <li><strong>Notes</strong>: 04 · Prompt Engineering, 05 · LLM APIs &amp; Tool Calling.</li>
    <li><strong>After it you can</strong>: write a solid system prompt; get schema-valid JSON back; stream responses; run the <code>tool_use → tool_result</code> loop by hand, with errors and parallel calls.</li>
    <li><strong>Mini-build</strong>: a script where Claude answers questions using two of your Python functions as tools (e.g. a calculator and a file search).</li>
  </ul>
  <h3>Stage 3 · RAG</h3>
  <ul>
    <li><strong>Notes</strong>: 06 · Embeddings &amp; Vector DBs, 07 · Retrieval-Augmented Generation.</li>
    <li><strong>After it you can</strong>: chunk and embed documents; choose an index and a vector DB; build retrieve → rerank → answer-with-citations; diagnose bad answers as retrieval or generation failures.</li>
    <li><strong>Mini-build</strong>: Q&amp;A over your own notes (or a folder of PDFs) that cites the chunks it used, plus a 10-question test set you re-run after every change.</li>
  </ul>
  <h3>Stage 4 · Agents</h3>
  <ul>
    <li><strong>Notes</strong>: 08 · Agent Fundamentals, 09 · Build an Agent from Scratch, 10 · LangChain, 11 · LangGraph, 12 · Multi-Agent Systems &amp; MCP.</li>
    <li><strong>After it you can</strong>: choose between a workflow and an agent; write an agent loop in plain Python with a step limit and memory; rebuild it as a LangGraph graph with checkpoints and human approval; expose tools through an MCP server.</li>
    <li><strong>Mini-build</strong>: a research agent with search, read-file and save-note tools: first in plain Python (09), then as a graph (11), with its tools served over MCP (12).</li>
  </ul>
  <h3>Stage 5 · Production</h3>
  <ul>
    <li><strong>Notes</strong>: 13 · Evaluation &amp; Observability, 14 · Guardrails, Cost &amp; Deployment.</li>
    <li><strong>After it you can</strong>: build a golden dataset; score with code checks and LLM-as-judge; trace every step; defend against prompt injection; cut cost with caching and model choice; deploy behind an API.</li>
    <li><strong>Mini-build</strong>: wrap your Stage 3 or 4 project in a FastAPI endpoint with input/output guardrails, cost logging and an eval suite that runs in CI.</li>
  </ul>
  <h3>Stage 6 · Customizing Models</h3>
  <ul>
    <li><strong>Notes</strong>: 15 · Fine-Tuning.</li>
    <li><strong>After it you can</strong>: decide prompt vs RAG vs fine-tune with evidence; prepare SFT data; explain LoRA, QLoRA, quantization and DPO; judge a fine-tune against its base model.</li>
    <li><strong>Mini-build</strong>: LoRA from scratch on one linear layer, then a QLoRA config with peft/trl.</li>
  </ul>
  <h3>Capstone · 16 · Ship an Agent</h3>
  <p>One end-to-end project: spec → architecture → RAG + tools + memory + guardrails + evals → API. If you can finish it alone, you've completed the path.</p>

  <h2 id="gr-plan"><span class="num">03</span>A 10-Week Plan</h2>
  <p>Part-time, about 8–10 hours a week. Build time counts more than reading time.</p>
  <table class="tbl">
    <tr><th>Week</th><th>Notes</th><th>By the end of the week</th></tr>
    <tr><td>1</td><td>01, 02</td><td>Attention in NumPy runs</td></tr>
    <tr><td>2</td><td>03, 04</td><td>You can explain sampling and hallucination; a prompt you've iterated on 5+ times</td></tr>
    <tr><td>3</td><td>05</td><td>Hand-written tool loop works. The most important week: give it the full time</td></tr>
    <tr><td>4</td><td>06, 07</td><td>RAG over your notes, with citations and a 10-question test set</td></tr>
    <tr><td>5</td><td>08, 09</td><td>Agent from scratch with tools, step limit and memory</td></tr>
    <tr><td>6</td><td>10, 11</td><td>Same agent as a LangGraph graph with a human-approval step</td></tr>
    <tr><td>7</td><td>12, 13</td><td>An MCP server; a golden dataset and eval script for your agent</td></tr>
    <tr><td>8</td><td>14, 15</td><td>Agent behind FastAPI with guardrails; LoRA build runs</td></tr>
    <tr><td>9–10</td><td>16</td><td>Capstone shipped, evaluated and written up</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Falling behind and "catching up" by reading three notes in a weekend. Skip ahead in reading if you must, but never skip the build: weeks 3, 5 and 9–10 carry the path.</p>
  </div>

  <h2 id="gr-skip"><span class="num">04</span>Short on Time?</h2>
  <table class="tbl">
    <tr><th>Note</th><th>If you're short on time</th></tr>
    <tr><td>01 · NLP Foundations</td><td>Skim; keep TF-IDF and "why contextual embeddings"</td></tr>
    <tr><td>02 · Transformers</td><td>Keep attention intuition and decoder-only; skip positional-encoding maths</td></tr>
    <tr><td>10 · LangChain</td><td>Skim; learn it when a job uses it</td></tr>
    <tr><td>12 · Multi-Agent &amp; MCP</td><td>Read MCP fully; skim the multi-agent patterns</td></tr>
    <tr><td>15 · Fine-Tuning</td><td>Read the decision section and LoRA; skim RLHF/DPO</td></tr>
  </table>
  <div class="callout intu"><span class="label">Never skip</span>
    <p><strong>05</strong> (tool calling), <strong>07</strong> (RAG), <strong>08</strong> (workflows vs agents), <strong>09</strong> (agent from scratch) and <strong>13</strong> (evals). These five are what "can build agentic systems" actually means. A 4-week sprint: 03–05, 06–07, 08–09 + 11, then 13–14 with a small capstone.</p>
  </div>

  <h2 id="gr-mistakes"><span class="num">05</span>Three Common Mistakes</h2>
  <div class="callout trap"><span class="label">1 · Frameworks before the loop</span>
    <p>Starting with LangChain or an agent SDK before writing the tool-calling loop by hand. When it breaks, you can't tell whether the model, your tool or the framework is at fault. Fix: do 05 and 09 in plain Python first; then frameworks are just shortcuts you understand.</p>
  </div>
  <div class="callout trap"><span class="label">2 · An agent where a workflow suffices</span>
    <p>If the steps are known in advance (classify → retrieve → answer), hard-code them as a workflow. It's cheaper, faster and testable. Use an agent only when the model must choose the steps. Fix: for every design, ask "could a fixed chain do this?" (08).</p>
  </div>
  <div class="callout trap"><span class="label">3 · Skipping evals</span>
    <p>Judging changes by trying three prompts and eyeballing them. You'll fix one case and silently break five. Fix: from Stage 3 on, keep a small test set and re-run it after every change; 13 turns that into a real eval suite.</p>
  </div>

  <h2 id="gr-ready"><span class="num">06</span>You Can Build Agentic Systems When You Can…</h2>
  <div class="panel"><ol>
    <li>Explain what happens between a prompt and a token, including why it costs what it costs (02–03).</li>
    <li>Write a system prompt and get schema-valid structured output reliably (04–05).</li>
    <li>Write the tool-calling loop from a blank file, with errors and parallel calls handled (05).</li>
    <li>Build a RAG pipeline with citations and say whether a bad answer came from retrieval or generation (06–07).</li>
    <li>Choose between a workflow and an agent, and defend the choice (08).</li>
    <li>Build an agent with tools, memory and a step limit in plain Python, then as a LangGraph graph with human approval (09, 11).</li>
    <li>Write an MCP server and know when multiple agents beat one (12).</li>
    <li>Prove a change helped with a golden dataset and traces, not vibes (13).</li>
    <li>Defend against prompt injection, cap cost and latency, and deploy behind an API (14).</li>
    <li>Say when fine-tuning is the right tool, and when it isn't (15).</li>
    <li>Ship the capstone end to end, alone (16).</li>
  </ol></div>
</main>`
});
