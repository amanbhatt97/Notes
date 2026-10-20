// notes/genai/genai_roadmap.js — Start Here: The Learning Path
Object.assign(TOPIC_CONTENT, {
  "genai_roadmap": `<main>
  <h1>Start Here: The Learning Path</h1>
  <div class="where"><span>Generative AI</span><span>Start Here</span></div>
  <p class="lead">This page is the map of the Generative AI track: sixteen notes, in order, from "what is a token" to shipping an agent. Each note answers one question and leaves one gap that the next note fills. To see how they connect, follow one product through the whole track: <strong>Biteful's customer-support assistant</strong>, which must answer Asha's <em>"Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"</em>, summarise restaurant reviews, and turn messages into JSON tickets. Every note adds one capability to that assistant. Read this page first; come back whenever you're unsure what to study next.</p>

  <h2 id="gr-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dl_attention">Attention Mechanisms</a> and Python</b><span>You can train a neural network, know attention, and write Python including <a class="xref" data-note="py_asyncio">asyncio</a>; web APIs with <a class="xref" data-note="api_fastapi">FastAPI</a> help in stage 5.</span></li>
    <li><b>This track adds: building with large language models</b><span>How they work, how to steer and call them, how to give them knowledge and tools, how to prove and ship the result.</span></li>
    <li><b>Leads to: a shipped agent</b><span>The capstone: a support-style agent with retrieval, tools, memory, guardrails and evals behind an API.</span></li>
  </ol>

  <h2 id="gr-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole track as one chain of questions about the Biteful assistant. Each note answers one; its limit forces the next.</p>
  <ol class="story">
    <li><b>01 <a class="xref" data-note="nlp">NLP Foundations</a></b><span>Q: how does a computer represent Asha's words? → Tokens, TF-IDF, word vectors. But a word vector ignores context ("order" a dosa vs "order" of steps)…</span></li>
    <li><b>02 <a class="xref" data-note="transformers">Transformers</a></b><span>Q: how do words get meaning from context? → Attention and the decoder-only transformer. But what does a trained one actually output?</span></li>
    <li><b>03 <a class="xref" data-note="llm_basics">How LLMs Work</a></b><span>Q: how does it write a reply? → Next-token prediction, sampling, post-training; it has no memory, no order data, and guesses confidently. How do we steer it?</span></li>
    <li><b>04 <a class="xref" data-note="prompting">Prompt Engineering</a></b><span>Q: how do we get the reply we meant? → Roles, examples, chain-of-thought, JSON, grounding, injection defence, test sets. How do we send it from code?</span></li>
    <li><b>05 <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a></b><span>Q: how does code call it and fetch order 101? → Messages API, cost, streaming, the tool loop, retries, caching. But Biteful's 5,000-token policy can't go in every prompt…</span></li>
    <li><b>06 <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a> → 07 <a class="xref" data-note="rag">RAG</a></b><span>Q: how do we find the right policy paragraph? → Embed, index, retrieve, rerank, answer with citations. But some requests need several steps the code can't fix in advance…</span></li>
    <li><b>08–12 <a class="xref" data-note="agentic">Agents</a></b><span>Q: when should the model choose the steps? → Workflows vs agents, a loop from scratch, LangChain, LangGraph, multi-agent and MCP. How do we know it works?</span></li>
    <li><b>13 <a class="xref" data-note="llm_evals">Evaluation</a> → 14 <a class="xref" data-note="llm_prod">Production</a></b><span>Q: is it right, safe and affordable? → Golden sets, judges, tracing; guardrails, cost levers, deployment. And if behaviour still isn't right?</span></li>
    <li><b>15 <a class="xref" data-note="finetuning">Fine-Tuning</a> → 16 <a class="xref" data-note="agent_capstone">Capstone</a></b><span>Q: when do we change the model itself? → Only after prompting and RAG fall short; then ship it all, alone.</span></li>
  </ol>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="gr-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The track as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="gr-map"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Track Map</span><span class="rm-sub">Six stages and a capstone</span></div></div>
      <div class="rm-item rm-done" data-target="gr-connect"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">What each note adds</span></div></div>
      <div class="rm-item rm-done" data-target="gr-plan"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">A 10-Week Plan</span><span class="rm-sub">Part-time, 8–10 h a week</span></div></div>
      <div class="rm-item rm-done" data-target="gr-skip"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Short on Time? Mistakes?</span><span class="rm-sub">What never to skip</span></div></div>
      <div class="rm-item rm-done" data-target="gr-ready"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">You're Ready When…</span><span class="rm-sub">The final checklist</span></div></div>
      <div class="rm-item rm-done" data-target="gr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The track on one page</span></div></div>
      <div class="rm-item rm-done" data-target="gr-qa"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">How the notes connect</span></div></div>
    </div>
  </div>

  <h2 id="gr-map"><span class="num">01</span>The Track Map</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sixteen notes is a lot. Which depend on which, and where is the hinge?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="gr-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="74" rx="8" class="ft st"/><text x="110" y="30" text-anchor="middle" font-size="12" font-weight="700">1 · Foundations</text><text x="110" y="48" text-anchor="middle" font-size="10.5">01 NLP · 02 Transformers</text><text x="110" y="64" text-anchor="middle" font-size="10.5">03 How LLMs Work</text><text x="110" y="78" text-anchor="middle" class="tm" font-size="9.5">what the model is</text>
<rect x="240" y="10" width="200" height="74" rx="8" class="fg sg" stroke-width="2.5"/><text x="340" y="30" text-anchor="middle" font-size="12" font-weight="700">2 · Working with LLMs</text><text x="340" y="48" text-anchor="middle" font-size="10.5">04 Prompting</text><text x="340" y="64" text-anchor="middle" font-size="10.5">05 APIs &amp; Tool Calling ★ hinge</text><text x="340" y="78" text-anchor="middle" class="tm" font-size="9.5">steer it, call it</text>
<rect x="470" y="10" width="200" height="74" rx="8" class="ft st"/><text x="570" y="30" text-anchor="middle" font-size="12" font-weight="700">3 · RAG</text><text x="570" y="48" text-anchor="middle" font-size="10.5">06 Vector DBs</text><text x="570" y="64" text-anchor="middle" font-size="10.5">07 RAG</text><text x="570" y="78" text-anchor="middle" class="tm" font-size="9.5">give it knowledge</text>
<rect x="470" y="120" width="200" height="74" rx="8" class="ft st"/><text x="570" y="140" text-anchor="middle" font-size="12" font-weight="700">4 · Agents</text><text x="570" y="158" text-anchor="middle" font-size="10.5">08 Fundamentals · 09 From scratch</text><text x="570" y="174" text-anchor="middle" font-size="10.5">10 LangChain · 11 LangGraph · 12 MCP</text><text x="570" y="188" text-anchor="middle" class="tm" font-size="9.5">let it take actions</text>
<rect x="240" y="120" width="200" height="74" rx="8" class="ft st"/><text x="340" y="140" text-anchor="middle" font-size="12" font-weight="700">5 · Production</text><text x="340" y="158" text-anchor="middle" font-size="10.5">13 Evals</text><text x="340" y="174" text-anchor="middle" font-size="10.5">14 Guardrails, Cost &amp; Deploy</text><text x="340" y="188" text-anchor="middle" class="tm" font-size="9.5">prove it, ship it</text>
<rect x="10" y="120" width="200" height="74" rx="8" class="ft st"/><text x="110" y="140" text-anchor="middle" font-size="12" font-weight="700">6 · Customizing</text><text x="110" y="158" text-anchor="middle" font-size="10.5">15 Fine-Tuning</text><text x="110" y="174" text-anchor="middle" font-size="10.5">(only when 1–5 aren't enough)</text><text x="110" y="188" text-anchor="middle" class="tm" font-size="9.5">change the model</text>
<rect x="160" y="230" width="360" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="340" y="252" text-anchor="middle" font-size="12" font-weight="700">16 · Capstone: ship an agent</text><text x="340" y="269" text-anchor="middle" class="tm" font-size="10">spec → RAG + tools + memory + guardrails + evals → API</text>
<line x1="210" y1="47" x2="238" y2="47" stroke="currentColor" marker-end="url(#gr-a)"/><line x1="440" y1="47" x2="468" y2="47" stroke="currentColor" marker-end="url(#gr-a)"/><line x1="570" y1="84" x2="570" y2="118" stroke="currentColor" marker-end="url(#gr-a)"/><line x1="470" y1="157" x2="442" y2="157" stroke="currentColor" marker-end="url(#gr-a)"/><line x1="240" y1="157" x2="212" y2="157" stroke="currentColor" marker-end="url(#gr-a)"/><line x1="340" y1="194" x2="340" y2="228" stroke="currentColor" marker-end="url(#gr-a)"/><line x1="110" y1="194" x2="200" y2="228" stroke="currentColor" marker-end="url(#gr-a)" stroke-dasharray="4 3"/>
</svg><figcaption>Stages in reading order. Stage 2's tool-calling loop is the hinge: RAG, agents and production all reuse it. Fine-tuning is optional (dashed).</figcaption></figure>
  <ul>
    <li><strong>Stage 1</strong> (<a class="xref" data-note="nlp">NLP</a>, <a class="xref" data-note="transformers">Transformers</a>, <a class="xref" data-note="llm_basics">How LLMs Work</a>): explain tokens, attention, sampling, hallucination, and why a call costs what it costs. Mini-build: attention in NumPy, a sampler at different temperatures.</li>
    <li><strong>Stage 2</strong> (<a class="xref" data-note="prompting">Prompting</a>, <a class="xref" data-note="llm_apis">LLM APIs</a>): write a solid system prompt, get validated JSON, stream, and write the tool loop by hand. Mini-build: the Biteful assistant with an order-lookup tool, run against a local mock server (no bill).</li>
    <li><strong>Stage 3</strong> (<a class="xref" data-note="vectordb">Vector DBs</a>, <a class="xref" data-note="rag">RAG</a>): chunk, embed, retrieve, rerank, answer with citations; tell a retrieval failure from a generation failure. Mini-build: Q&amp;A over a policy folder with a 10-question test set.</li>
    <li><strong>Stage 4</strong> (<a class="xref" data-note="agentic">Agent Fundamentals</a>, <a class="xref" data-note="agent_build">From Scratch</a>, <a class="xref" data-note="langchain">LangChain</a>, <a class="xref" data-note="langgraph">LangGraph</a>, <a class="xref" data-note="multiagent">Multi-Agent &amp; MCP</a>): choose workflow vs agent; build a loop with a step limit and memory, then as a graph with human approval; serve tools over MCP.</li>
    <li><strong>Stage 5</strong> (<a class="xref" data-note="llm_evals">Evals</a>, <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a>): golden datasets, LLM-as-judge, tracing; injection defence, cost levers, deployment behind <a class="xref" data-note="api_fastapi">FastAPI</a>.</li>
    <li><strong>Stage 6</strong> (<a class="xref" data-note="finetuning">Fine-Tuning</a>): prompt vs RAG vs fine-tune with evidence; LoRA, QLoRA, DPO. Then the <a class="xref" data-note="agent_capstone">Capstone</a>.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Learning to drive. Foundations = how the engine works. Prompting and APIs = steering and pedals. RAG = a map. Agents = driving yourself to a destination. Production = insurance, servicing and a fuel budget. Fine-tuning = modifying the car, which most drivers never need.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> The map shows order. What does each note concretely add to the thing you're building?</div>

  <h2 id="gr-connect"><span class="num">02</span>How It All Connects: One Assistant, Sixteen Notes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Studying sixteen topics one by one, it's easy to lose why each exists. What does the Biteful assistant gain from each note, and what would break without it?</p>
  </div>
  <table class="tbl">
    <tr><th>Note</th><th>Built from</th><th>Biteful assistant gains…</th><th>Without it…</th></tr>
    <tr><td>01–02 NLP, Transformers</td><td>deep learning, attention</td><td>a model that turns Asha's message into contextual vectors</td><td>you can't reason about tokens, embeddings or attention cost</td></tr>
    <tr><td>03 How LLMs Work</td><td>the decoder transformer</td><td>an understanding of why it says "Your order is on the way" without data</td><td>you trust confident guesses; you budget by words</td></tr>
    <tr><td>04 Prompting</td><td>"it continues its context"</td><td>a system prompt, few-shot labels, JSON tickets, grounding, injection defence</td><td>vague, inconsistent, attackable replies</td></tr>
    <tr><td>05 LLM APIs</td><td>prompts + tokens/cost</td><td>code that calls the model, looks up order 101 with a tool, streams, retries</td><td>no live data, no exact maths, crashes on 429</td></tr>
    <tr><td>06–07 Vector DBs, RAG</td><td>embeddings + grounding + API calls</td><td>the right policy paragraph retrieved for each question, with citations</td><td>the whole manual in every prompt, or invented policies</td></tr>
    <tr><td>08–12 Agents</td><td>the tool loop + RAG</td><td>multi-step handling (check order, check policy, offer voucher, escalate)</td><td>every flow hard-coded, or an agent where a workflow would do</td></tr>
    <tr><td>13–14 Evals, Production</td><td>test sets (04), the API layer (05)</td><td>a test set, traces, guardrails, cost caps, an API endpoint</td><td>"seems fine" on three examples; surprise bills</td></tr>
    <tr><td>15 Fine-Tuning</td><td>pretraining/SFT/DPO (03) + evals</td><td>a smaller model trained on Biteful's tone and ticket format, if needed</td><td>paying for a big model to learn a format from examples every call</td></tr>
    <tr><td>16 Capstone</td><td>everything above</td><td>all of it, shipped by you alone</td><td>pieces you've read about but never assembled</td></tr>
  </table>
  <div class="callout intu"><span class="label">How to use each note</span>
    <p>Read the Question Ladder first, then the sections. Type and run the code yourself; most notes run without any paid API (the LLM notes use a local mock server or toy stand-ins and say so). Answer the Q&amp;A out loud before revealing. Revise from the Revision Sheet.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: A 10-week plan.</b> We know what each note adds. How should the weeks be split?</div>

  <h2 id="gr-plan"><span class="num">03</span>A 10-Week Plan</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With 8–10 hours a week, how long should each note take, and which weeks matter most?</p>
  </div>
  <table class="tbl">
    <tr><th>Week</th><th>Notes</th><th>By the end of the week</th></tr>
    <tr><td>1</td><td>01, 02</td><td>Attention in NumPy runs</td></tr>
    <tr><td>2</td><td>03, 04</td><td>You can explain sampling and hallucination; a prompt iterated on a test set</td></tr>
    <tr><td>3</td><td>05</td><td>Hand-written tool loop works against the mock. The most important week</td></tr>
    <tr><td>4</td><td>06, 07</td><td>RAG over a document folder, with citations and a 10-question test set</td></tr>
    <tr><td>5</td><td>08, 09</td><td>Agent from scratch with tools, step limit and memory</td></tr>
    <tr><td>6</td><td>10, 11</td><td>Same agent as a LangGraph graph with a human-approval step</td></tr>
    <tr><td>7</td><td>12, 13</td><td>An MCP server; a golden dataset and eval script for your agent</td></tr>
    <tr><td>8</td><td>14, 15</td><td>Agent behind FastAPI with guardrails; LoRA build runs</td></tr>
    <tr><td>9–10</td><td>16</td><td>Capstone shipped, evaluated and written up</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Falling behind and "catching up" by reading three notes in a weekend. Skip ahead in reading if you must, but never skip the build: weeks 3, 5 and 9–10 carry the path.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Short on time?</b> What if you have four weeks, not ten?</div>

  <h2 id="gr-skip"><span class="num">04</span>Short on Time? Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which notes can be skimmed, which never, and which mistakes waste the most time?</p>
  </div>
  <table class="tbl">
    <tr><th>Note</th><th>If you're short on time</th></tr>
    <tr><td><a class="xref" data-note="nlp">NLP Foundations</a></td><td>Skim; keep tokens, TF-IDF and "why contextual embeddings"</td></tr>
    <tr><td><a class="xref" data-note="transformers">Transformers</a></td><td>Keep attention and decoder-only; skim positional-encoding maths</td></tr>
    <tr><td><a class="xref" data-note="langchain">LangChain</a></td><td>Skim; learn it when a job uses it</td></tr>
    <tr><td><a class="xref" data-note="multiagent">Multi-Agent Systems &amp; MCP</a></td><td>Read MCP fully; skim the multi-agent patterns</td></tr>
    <tr><td><a class="xref" data-note="finetuning">Fine-Tuning</a></td><td>Read the decision section and LoRA; skim RLHF/DPO</td></tr>
  </table>
  <div class="callout intu"><span class="label">Never skip</span>
    <p><strong>05</strong> (tool calling), <strong>07</strong> (RAG), <strong>08</strong> (workflows vs agents), <strong>09</strong> (agent from scratch) and <strong>13</strong> (evals). A 4-week sprint: 03–05, 06–07, 08–09 + 11, then 13–14 with a small capstone.</p>
  </div>
  <div class="callout trap"><span class="label">Mistake 1 · Frameworks before the loop</span>
    <p>Starting with LangChain before writing the tool loop by hand. When it breaks you can't tell whether the model, your tool or the framework is at fault. Do 05 and 09 in plain Python first.</p>
  </div>
  <div class="callout trap"><span class="label">Mistake 2 · An agent where a workflow suffices</span>
    <p>If the steps are known (classify → retrieve → answer), hard-code them: cheaper, faster, testable. Use an agent only when the model must choose the steps (08).</p>
  </div>
  <div class="callout trap"><span class="label">Mistake 3 · Skipping evals</span>
    <p>Judging changes by eyeballing three prompts: you fix one case and silently break five. Keep a test set from note 04 on; 13 turns it into a real eval suite.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: You're ready when…</b> How do you know you've actually finished?</div>

  <h2 id="gr-ready"><span class="num">05</span>You Can Build Agentic Systems When You Can…</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Reading every note isn't the goal. What should you be able to do without help?</p>
  </div>
  <div class="panel"><ol>
    <li>Explain what happens between a prompt and a token, and why it costs what it costs (02–03).</li>
    <li>Write a system prompt and get validated structured output reliably (04–05).</li>
    <li>Write the tool-calling loop from a blank file, with errors and parallel calls handled (05).</li>
    <li>Build RAG with citations and say whether a bad answer came from retrieval or generation (06–07).</li>
    <li>Choose between a workflow and an agent, and defend the choice (08).</li>
    <li>Build an agent with tools, memory and a step limit in plain Python, then as a LangGraph graph with human approval (09, 11).</li>
    <li>Write an MCP server and know when multiple agents beat one (12).</li>
    <li>Prove a change helped with a golden dataset and traces, not vibes (13).</li>
    <li>Defend against prompt injection, cap cost and latency, and deploy behind an API (14).</li>
    <li>Say when fine-tuning is the right tool, and when it isn't (15).</li>
    <li>Ship the capstone end to end, alone (16).</li>
  </ol></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet</b>, then start with <a class="xref" data-note="nlp">NLP Foundations</a>.</div>

  <h2 id="gr-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The track on one page. Running thread: Biteful's support assistant answering "Where is my order 101?", summarising reviews and extracting JSON tickets.</p>
  <table class="tbl">
    <tr><th>Stage</th><th>Question it answers</th><th>Key ideas</th><th>Limit → next stage</th></tr>
    <tr><td>1 Foundations</td><td>what is the model?</td><td>tokens, attention, next-token prediction, sampling, hallucination, cost per token</td><td>it must be steered</td></tr>
    <tr><td>2 Working with LLMs</td><td>how do we steer and call it?</td><td>roles, few-shot, CoT, JSON + validation, grounding; Messages API, tool loop, retries, caching</td><td>it lacks our knowledge</td></tr>
    <tr><td>3 RAG</td><td>how does it use our documents?</td><td>embeddings, vector index, retrieve → rerank → cite</td><td>fixed steps aren't always enough</td></tr>
    <tr><td>4 Agents</td><td>when may it choose steps?</td><td>workflow vs agent, loop + step limit + memory, graphs, MCP</td><td>we must prove it works</td></tr>
    <tr><td>5 Production</td><td>is it right, safe, affordable?</td><td>golden set, judges, traces; guardrails, cost levers, deployment</td><td>behaviour may still need changing</td></tr>
    <tr><td>6 Customizing</td><td>when change the model?</td><td>prompt vs RAG vs fine-tune; LoRA, QLoRA, DPO</td><td>→ capstone</td></tr>
  </table>
  <div class="cards">
    <div><b>Never skip</b><p>05 tool calling, 07 RAG, 08 workflows vs agents, 09 agent from scratch, 13 evals.</p><small>These five are "can build agentic systems"</small></div>
    <div><b>Three mistakes</b><p>Frameworks before the loop; an agent where a workflow fits; no evals.</p><small>Each costs weeks</small></div>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Which note is the hinge of the track?</td><td>05 LLM APIs &amp; Tool Calling (the tool loop)</td></tr>
    <tr><td>Asha's assistant invents an ETA. Which notes fix it?</td><td>04 (grounding), 05 (order-lookup tool), 07 (RAG for policies), 13 (evals catch it)</td></tr>
    <tr><td>The steps are known in advance. Agent or workflow?</td><td>Workflow (08)</td></tr>
    <tr><td>When is fine-tuning the answer?</td><td>When prompting and RAG, measured on a test set, still fall short (usually format, tone or cost)</td></tr>
    <tr><td>What do you build in week 3?</td><td>The hand-written tool loop</td></tr>
  </table>

  <h2 id="gr-qa"><span class="num">06</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain why the notes come in this order? Answer before revealing.</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does prompting come before APIs, and APIs before RAG?</summary><div class="qa-body">An API call just sends a prompt, so you need to know what a good prompt is first. RAG is a step that fills the prompt with retrieved text before an API call, so it needs both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is the tool loop called the hinge?</summary><div class="qa-body">RAG can be a retrieval tool, agents are the loop with more tools and memory, MCP serves tools, and production adds guardrails around tool calls. Every later stage reuses <code>tool_use → tool_result</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip How LLMs Work and jump to agents?</summary><div class="qa-body">You can't explain why the agent guesses order statuses (hallucination), why costs explode (tokens resent every step), or why runs differ (sampling). Debugging becomes trial and error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is fine-tuning last?</summary><div class="qa-body">It is the most expensive lever and needs evals (stage 5) to prove it beats prompting and RAG. Most problems are solved earlier; fine-tuning is for what's left (format, tone, cost of a big model).</div></details>
  <div class="bridge"><b>Next:</b> <a class="xref" data-note="nlp">NLP Foundations</a>.</div>
</main>`
});
