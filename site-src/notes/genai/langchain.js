// notes/genai/langchain.js — LangChain
Object.assign(TOPIC_CONTENT, {
  "langchain": `<main>
<h1>LangChain</h1>
  <div class="where"><span>Generative AI</span><span>Agents</span><span>LangChain</span></div>
  <p class="lead">In <a class="xref" data-note="rag">Retrieval-Augmented Generation</a> we built Biteful's support assistant by hand: retrieve policy chunks, format them, fill a prompt, call a model, clean the reply. LangChain gives each of those jobs a <strong>standard part</strong> with the same interface, so parts snap together with <code>|</code>, can be swapped (a fake model today, a real one tomorrow), and get streaming, batching, retries, fallbacks and tracing for free. This note rebuilds <strong>the same Biteful assistant</strong>, answering the same customer ("My order arrived 50 minutes late. Can I get my money back?"), one part at a time, each part introduced because the previous step left a gap. Next, <a class="xref" data-note="langgraph">LangGraph</a> makes it loop.</p>
  <div class="callout def"><span class="label">No API bill: what is real, what is a stand-in</span>
    <p>No code here calls a paid API. Every block ran on langchain-core 1.6, langchain 1.4 and langchain-text-splitters 1.1, in order like a notebook (later blocks reuse earlier names). Models are LangChain's own fakes (<code>FakeListChatModel</code>, <code>GenericFakeChatModel</code>, scripted replies) or our labelled <strong>stand-in</strong> <code>ExtractiveChatModel</code>, a real LangChain chat-model class whose "brain" copies the best-matching source sentence (the stand-in LLM from the RAG note). Embeddings are the same TF-IDF character n-gram stand-in. Retrieval, parsing, memory trimming, callbacks, retries and fallbacks all run for real. <code>rag_basics</code> is a small module holding the RAG note's plain-Python pieces (Biteful's <code>DOCS</code>, <code>make_chunks</code>, <code>bm25</code>, <code>fake_llm</code>).</p>
  </div>

  <h2 id="lc-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="lc-f0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="55" width="160" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="78" text-anchor="middle" font-size="12">RAG by hand</text><text x="90" y="96" text-anchor="middle" class="tm" font-size="10">retrieve · format · prompt · model</text>
<rect x="250" y="55" width="160" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="330" y="78" text-anchor="middle" font-size="13" font-weight="700">LangChain</text><text x="330" y="97" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="490" y="15" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="570" y="36" text-anchor="middle" font-size="12">LangGraph</text><text x="570" y="53" text-anchor="middle" class="tm" font-size="10">loops, state, pause, resume</text>
<rect x="490" y="105" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="570" y="126" text-anchor="middle" font-size="12">Evaluation</text><text x="570" y="143" text-anchor="middle" class="tm" font-size="10">traces → datasets → tests</text>
<line x1="170" y1="83" x2="248" y2="83" stroke="currentColor" marker-end="url(#lc-f0)"/>
<line x1="410" y1="75" x2="488" y2="42" stroke="currentColor" marker-end="url(#lc-f0)"/><line x1="410" y1="92" x2="488" y2="128" stroke="currentColor" marker-end="url(#lc-f0)"/>
</svg><figcaption>Same assistant, three notes: by hand (RAG), as swappable parts (LangChain), as a looping graph (LangGraph).</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="rag">Retrieval-Augmented Generation</a></b><span>A working Biteful assistant in plain Python: chunks, BM25 + embeddings, RRF, a grounded prompt, a stand-in model. Left open: every new LLM feature re-writes the same glue (fill prompt, call model, parse, retry, log), and swapping a part means editing the glue.</span></li>
    <li><b>This note adds: standard parts that compose</b><span>Runnables and the <code>|</code> operator, prompt templates, chat models, output parsers, retrievers, the parallel/passthrough/lambda helpers, chat history, callbacks, fallbacks and retries, tools.</span></li>
    <li><b>Leads to: <a class="xref" data-note="langgraph">LangGraph</a></b><span>A chain is a straight line. When the assistant must check its answer, retrieve again, or wait for a human, you need a graph with state. LangChain's own memory helper now says "use LangGraph's built-in persistence instead". Tool loops connect to <a class="xref" data-note="agentic">Agent Fundamentals</a>; async streaming uses <a class="xref" data-note="py_asyncio">asyncio</a>.</span></li>
  </ol>

  <h2 id="lc-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain of needs. Each concept answers the question above it; its gap raises the next question. The running example is Biteful's support assistant and the 50-minutes-late customer.</p>
  <ol class="story">
    <li><b>Hand-wired glue</b><span>Q: what does building LLM features by hand cost? → Every feature repeats retrieve → format → fill prompt → call model → parse, with its own try/except. Can the steps be made into pieces that snap together?</span></li>
    <li><b>Runnables &amp; LCEL</b><span>Q: how do pieces snap together? → Every part is a Runnable (invoke, batch, stream); <code>a | b</code> is just <code>a.__or__(b)</code>, a sequence that feeds a's output to b. But our prompt is still an f-string…</span></li>
    <li><b>Prompt templates</b><span>Q: how do we fill system text, history and the question safely and reuse it? → <code>ChatPromptTemplate</code> with slots and a history placeholder; <code>partial</code> fixes "Biteful". Who reads the filled messages?</span></li>
    <li><b>Chat models</b><span>Q: how do we call any model through one interface? → A chat model takes messages and returns an <code>AIMessage</code>; fake and stand-in models behave exactly like real ones. Its output is still free text…</span></li>
    <li><b>Output parsers</b><span>Q: how do we turn text into data we can branch on? → <code>StrOutputParser</code>, <code>JsonOutputParser</code>, <code>PydanticOutputParser</code> (and native structured output); 3 bad replies → 3 <code>OutputParserException</code>s. Where does the context come from?</span></li>
    <li><b>Retrievers</b><span>Q: how do documents become a searchable part? → Splitter → <code>Document</code>s with metadata → embeddings + vector store → retriever (string in, Documents out); our own BM25 retriever in 6 lines. But the question must reach the retriever <em>and</em> the prompt…</span></li>
    <li><b>RunnableParallel / Passthrough / Lambda</b><span>Q: how does one input feed several branches? → A dict of Runnables runs them all on the same input; Passthrough copies the question; Lambda wraps <code>format_docs</code> and RRF. The full RAG chain answers the customer. But "How long does that take?" fails…</span></li>
    <li><b>Memory / chat history</b><span>Q: how does the chain know what "that" means? → Your code keeps the messages, trims them, and condenses follow-ups: "5-7 working days". Now many parts run per question: which one is slow or wrong?</span></li>
    <li><b>Callbacks &amp; tracing</b><span>Q: what happened inside the chain? → Handlers fire on retriever end, model start/end (34 events per run); LangSmith stores them. Tracing shows failures, but a timeout still kills the request…</span></li>
    <li><b>Fallbacks &amp; retries</b><span>Q: how do we survive flaky providers and bad outputs? → <code>with_retry</code> (succeeded on attempt 3), <code>with_fallbacks</code> (local model, safe default ticket). But the chain still can't decide to look up an order…</span></li>
    <li><b>Tools &amp; create_agent</b><span>Q: how does the model call our functions? → <code>@tool</code> builds the schema; <code>create_agent</code> runs model → tool → model. That loop is a graph, not a chain…</span></li>
    <li><b>When not to use LangChain</b><span>Q: when is all this overkill? → One call or a fixed tiny flow: plain code (0.26 ms vs 1.11 ms of glue, both tiny next to a model call; the real cost is complexity). Loops, pauses and persistence: LangGraph.</span></li>
  </ol>

  <h2 id="lc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">LangChain</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why</div>
        <ul>
          <li><b>Glue repeats</b> — fill, call, parse, retry in every feature</li>
          <li><b>One interface per part</b> — model, prompt, parser, retriever, tool</li>
          <li>💡 Standard plumbing fittings: any tap fits any pipe</li>
          <li>⚠ Doesn't make models smarter</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Runnables &amp; LCEL</div>
        <ul>
          <li><b>Runnable</b> — invoke · batch · stream · ainvoke</li>
          <li><b><code>a | b</code></b> = <code>a.__or__(b)</code> → RunnableSequence</li>
          <li><b>Parallel</b> (dict) · <b>Passthrough</b> · <b>Lambda</b></li>
          <li><b>with_retry · with_fallbacks</b> on any Runnable</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Prompt → model → parser</div>
        <ul>
          <li><b>ChatPromptTemplate</b> — system/human slots, MessagesPlaceholder, partial</li>
          <li><b>Chat model</b> — messages in, AIMessage out (content, tool_calls, usage)</li>
          <li><b>Parsers</b> — Str · Json · Pydantic; bad output → OutputParserException</li>
          <li><b>Structured output</b> — <code>with_structured_output(Model)</code> when supported</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Retrieval</div>
        <ul>
          <li><b>Document</b> — page_content + metadata</li>
          <li><b>Splitters</b> — MarkdownHeader (13 sections), RecursiveCharacter</li>
          <li><b>Embeddings + VectorStore</b> → <b>retriever</b></li>
          <li><b>Custom</b> — subclass BaseRetriever (BM25 in 6 lines)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Memory</div>
        <ul>
          <li><b>Model forgets</b> — your code re-sends history</li>
          <li><b>trim_messages</b> — window by tokens or messages</li>
          <li><b>Condense</b> follow-ups before retrieval</li>
          <li>⚠ RunnableWithMessageHistory deprecated → LangGraph persistence</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Observe &amp; harden</div>
        <ul>
          <li><b>Callbacks</b> — on_retriever_end, on_chat_model_start, on_llm_end…</li>
          <li><b>astream_events</b> — 34 events for one RAG run</li>
          <li><b>LangSmith</b> — env vars, hosted traces</li>
          <li><b>Retry / fallback</b> — flaky provider, outage, bad JSON</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tools &amp; limits</div>
        <ul>
          <li><b>@tool</b> — name, docstring, typed args → schema</li>
          <li><b>create_agent</b> — model ⇄ tools loop (runs on LangGraph)</li>
          <li><b>Skip LangChain</b> — one call, hot path, tiny flow</li>
          <li><b>Use LangGraph</b> — loops, branches, pause, resume</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lc-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="lc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Wiring by Hand Is Repetitive</span><span class="rm-sub">The glue every feature repeats</span></div></div>
      <div class="rm-item rm-done" data-target="lc-lcel"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Runnables &amp; LCEL</span><span class="rm-sub"><code>|</code> desugared</span></div></div>
      <div class="rm-item rm-done" data-target="lc-prompt"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Prompt Templates</span><span class="rm-sub">Slots, history, partial</span></div></div>
      <div class="rm-item rm-done" data-target="lc-models"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Chat Models</span><span class="rm-sub">Fake and stand-in, same interface</span></div></div>
      <div class="rm-item rm-done" data-target="lc-parse"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Output Parsers</span><span class="rm-sub">Text in, typed data out; failures</span></div></div>
      <div class="rm-item rm-done" data-target="lc-retr"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Documents &amp; Retrievers</span><span class="rm-sub">Split, embed, store, fetch</span></div></div>
      <div class="rm-item rm-done" data-target="lc-parallel"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Parallel, Passthrough, Lambda</span><span class="rm-sub">The RAG chain, traced</span></div></div>
      <div class="rm-item rm-done" data-target="lc-mem"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Memory &amp; Chat History</span><span class="rm-sub">"How long does that take?"</span></div></div>
      <div class="rm-item rm-done" data-target="lc-trace"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Callbacks &amp; Tracing</span><span class="rm-sub">See every step</span></div></div>
      <div class="rm-item rm-done" data-target="lc-fallback"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Fallbacks &amp; Retries</span><span class="rm-sub">Timeouts, outages, bad JSON</span></div></div>
      <div class="rm-item rm-done" data-target="lc-agents"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Tools &amp; create_agent</span><span class="rm-sub">The model calls your function</span></div></div>
      <div class="rm-item rm-done" data-target="lc-when"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">When Not to Use LangChain</span><span class="rm-sub">Overhead measured</span></div></div>
      <div class="rm-item rm-done" data-target="lc-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="lc-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Legacy APIs, types, history</span></div></div>
      <div class="rm-item rm-done" data-target="lc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="lc-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="lc-why"><span class="num">01</span>Wiring by Hand Is Repetitive</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The RAG note's assistant works. Now Biteful wants a second feature: tag every ticket with a topic and an "urgent" flag. What does it cost to build each new LLM feature by hand, and what happens when we switch model provider?</p>
  </div>
  <p>Every LLM feature is the same five jobs in a row: get some context, format it, fill a prompt, call a model, turn the reply into something your program can use. Written by hand, each feature re-implements the jobs, with its own error handling and logging. Here are both Biteful features, wired by hand:</p>
  <div class="fx" data-lang="py">import json
from rag_basics import DOCS, QUESTION, make_chunks, bm25, fake_llm   # from the RAG note

chunks = make_chunks(DOCS)
texts = [c["text"] for c in chunks]

# Job 1: answer a customer from the policy (RAG), wired by hand
def answer_by_hand(question):
    scores = bm25(question, texts)                                       # 1 retrieve
    top = sorted(range(len(texts)), key=lambda i: -scores[i])[:2]
    sources = "\\n".join(f"[{n}] {texts[i]}" for n, i in enumerate(top, 1))   # 2 format docs
    prompt = ("You are Biteful's support assistant. Answer only from the sources "
              f"and cite like [1].\\n\\nSources:\\n{sources}\\n\\nQuestion: {question}")   # 3 fill prompt
    reply = fake_llm(prompt)                                             # 4 call the model
    return reply.strip()                                                 # 5 parse the output

# Job 2: tag the ticket, wired by hand again
def fake_tagger(prompt):                       # STAND-IN model with a scripted reply
    return 'Sure! {"topic": "refund", "urgent": true}'

def tag_by_hand(question):
    prompt = ("Classify this Biteful ticket. Reply with JSON keys topic, urgent.\\n\\n"
              f"Question: {question}")                                   # fill prompt (again)
    reply = fake_tagger(prompt)                                          # call model (again)
    try:                                                                 # parse (again, by hand)
        return json.loads(reply[reply.index("{"):])
    except ValueError:
        return {"topic": "other", "urgent": False}

print(answer_by_hand(QUESTION))
print(tag_by_hand(QUESTION))</div>
  <div class="fx" data-lang="text">If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]
{'topic': 'refund', 'urgent': True}</div>
  <p>Both work (the RAG answer cites the 45-minute rule; the tagger returns <code>{'topic': 'refund', 'urgent': True}</code>). But look at the comments: "fill prompt (again)", "call model (again)", "parse (again, by hand)". The JSON parsing is a fragile <code>reply.index("{")</code> hack. Add retries, timeouts, logging, streaming and a second provider, and every feature grows the same 30 lines of plumbing.</p>
  <p>Providers also shape things differently, so switching rewrites the glue:</p>
  <table class="tbl">
    <tr><th>Detail</th><th>Anthropic Messages API</th><th>OpenAI Chat Completions</th></tr>
    <tr><td>System prompt</td><td>separate <code>system=</code> argument</td><td>a message with role "system"</td></tr>
    <tr><td>Reply text</td><td><code>r.content[0].text</code></td><td><code>r.choices[0].message.content</code></td></tr>
    <tr><td>Tool calls</td><td><code>tool_use</code> content blocks</td><td><code>message.tool_calls</code></td></tr>
  </table>
  <p>LangChain's idea: define <strong>one standard interface</strong> per kind of part (chat model, prompt, parser, retriever, tool), write an adapter per provider once, and make every part composable with every other part.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Standard plumbing fittings. Any tap fits any pipe from any shop. The fittings don't make the water cleaner (the model's answers); they stop you cutting a custom joint for every job.</p>
  </div>
<figure class="viz"><svg viewBox="0 0 600 168" width="600"><rect x="20" y="20" width="350" height="40" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity=".5"/><text x="195" y="38" text-anchor="middle" font-weight="bold">langchain-classic (legacy)</text><text x="195" y="52" text-anchor="middle" font-size="10" class="tm">LLMChain · AgentExecutor · ConversationBufferMemory</text><rect x="380" y="20" width="200" height="40" rx="6" class="fg sg"/><text x="480" y="38" text-anchor="middle" font-weight="bold">langchain</text><text x="480" y="52" text-anchor="middle" font-size="10" class="tm">create_agent + middleware</text><rect x="20" y="70" width="170" height="40" rx="6" class="ft st"/><text x="105" y="88" text-anchor="middle" font-weight="bold">langchain-anthropic</text><text x="105" y="102" text-anchor="middle" font-size="10" class="tm">-openai … per provider</text><rect x="200" y="70" width="170" height="40" rx="6" class="ft st"/><text x="285" y="88" text-anchor="middle" font-weight="bold">text-splitters</text><text x="285" y="102" text-anchor="middle" font-size="10" class="tm">chunkers</text><rect x="380" y="70" width="200" height="40" rx="6" class="fv"/><text x="480" y="88" text-anchor="middle" font-weight="bold">langgraph</text><text x="480" y="102" text-anchor="middle" font-size="10" class="tm">stateful agent runtime</text><rect x="20" y="120" width="560" height="40" rx="6" class="fb sb"/><text x="300" y="138" text-anchor="middle" font-weight="bold">langchain-core</text><text x="300" y="152" text-anchor="middle" font-size="10" class="tm">interfaces: messages · prompts · Runnables · parsers · tools · retrievers · fake models</text></svg><figcaption>Everything sits on langchain-core's interfaces. Integrations are separate packages; create_agent runs on LangGraph; old classes moved to langchain-classic.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LangChain</strong>: a library of standard interfaces (and many provider integrations) for the parts of LLM applications, plus a way to compose them (LCEL). <code>langchain-core</code> is the small base everything else builds on.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Old tutorials use <code>LLMChain</code>, <code>initialize_agent</code>, <code>AgentExecutor</code> and <code>ConversationBufferMemory</code>. Since 1.0 they live in <code>langchain-classic</code>. New code uses LCEL, <code>create_agent</code> and LangGraph persistence; interviewers still ask what the old names did.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Runnables &amp; LCEL.</b> We want the five jobs as pieces that snap together. What is the common interface, and what does the <code>|</code> in <code>prompt | model | parser</code> actually do?</div>

  <h2 id="lc-lcel"><span class="num">02</span>Runnables &amp; LCEL: <code>|</code> Desugared</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>By hand, our pipeline was nested calls: <code>clean(model(fill(retrieve(q))))</code>. Adding a step means editing the nesting. How can steps be written left to right, and what makes <code>|</code> between two Python objects legal at all?</p>
  </div>
  <p>Python lets a class decide what <code>a | b</code> means by defining a method called <code>__or__</code>. So <code>a | b</code> is just <code>a.__or__(b)</code>. LangChain's trick: every part has <code>invoke(x)</code>, and <code>a | b</code> returns a new object whose <code>invoke(x)</code> is <code>b.invoke(a.invoke(x))</code>. That is the whole <strong>LangChain Expression Language (LCEL)</strong>. First in 8 lines of plain Python, then with LangChain's real class:</p>
  <div class="fx" data-lang="py">class Step:                                       # LCEL's core idea in 8 lines
    def __init__(self, fn):
        self.fn = fn
    def invoke(self, x):
        return self.fn(x)
    def __or__(self, other):                      # a | b  -&gt;  a new Step
        return Step(lambda x: other.invoke(self.invoke(x)))

fill  = Step(lambda q: f"Sources:\\n[1] {texts[0]}\\n\\nQuestion: {q}")
model = Step(fake_llm)
parse = Step(str.strip)
chain = fill | model | parse                      # Python calls fill.__or__(model), then .__or__(parse)
print(chain.invoke(QUESTION))

from langchain_core.runnables import RunnableLambda
fill, model, parse = RunnableLambda(fill.fn), RunnableLambda(fake_llm), RunnableLambda(str.strip)
lc_chain = fill | model | parse
print(type(lc_chain).__name__, len(lc_chain.steps), "steps")
print(fill.__or__(model).__or__(parse).invoke(QUESTION) == lc_chain.invoke(QUESTION))
print(lc_chain.batch([QUESTION, "Is the tikka nut free?"]))</div>
  <div class="fx" data-lang="text">If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]
RunnableSequence 3 steps
True
['If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]', "I don't know based on these sources."]</div>
  <p>Trace <code>chain.invoke(QUESTION)</code>: <code>fill</code> turns the question into a prompt with source [1] ("Late orders…"); <code>model</code> (the stand-in) copies the best sentence and cites it; <code>parse</code> strips whitespace. Each step knows only its own input and output. With LangChain's <code>RunnableLambda</code> the same three functions become a <code>RunnableSequence</code> with 3 steps; writing <code>fill.__or__(model).__or__(parse)</code> by hand gives the identical result (<code>True</code>). And because the sequence is itself a Runnable, <code>batch</code> came for free: two questions in, two answers out (the tikka question has no matching sentence in source [1], hence "I don't know").</p>
  <figure class="viz"><svg viewBox="0 0 600 128" width="600"><defs><marker id="lc-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="14" y="64">dict</text><line x1="50" y1="60" x2="88" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><rect x="90" y="40" width="100" height="40" rx="6" class="ft st"/><text x="140" y="64" text-anchor="middle" font-weight="bold">prompt</text><rect x="250" y="40" width="100" height="40" rx="6" class="fb sb"/><text x="300" y="64" text-anchor="middle" font-weight="bold">model</text><rect x="410" y="40" width="100" height="40" rx="6" class="fg sg"/><text x="460" y="64" text-anchor="middle" font-weight="bold">parser</text><line x1="190" y1="60" x2="248" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="219" y="30" text-anchor="middle" font-size="10" class="tm">ChatPromptValue</text><line x1="350" y1="60" x2="408" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="379" y="30" text-anchor="middle" font-size="10" class="tm">AIMessage</text><line x1="510" y1="60" x2="548" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="552" y="64">str</text><path d="M90,92 V100 H510 V92" fill="none" stroke="currentColor" stroke-opacity=".5"/><text x="300" y="118" text-anchor="middle" font-size="11">RunnableSequence = a Runnable too: invoke · stream · batch · ainvoke</text></svg><figcaption>Each | hands the left output to the right. The types change at every step; the whole chain inherits streaming, batching and async.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A dabbawala relay. Each person only knows "take the tiffin from the last person, hand it to the next". Nobody needs the whole route in their head, and you can insert a new person anywhere.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>Runnable</strong> is any object with <code>invoke</code>, <code>batch</code>, <code>stream</code> and async <code>ainvoke</code>/<code>astream</code>. <strong>LCEL</strong> composes Runnables with <code>|</code> (via <code>__or__</code>): the output of the left becomes the input of the right; the result, a <code>RunnableSequence</code>, is a Runnable too. Plain functions and dicts placed in a chain are converted automatically.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Type mismatches between steps only fail at runtime, often deep inside the chain. If a step expects a string and gets an <code>AIMessage</code> or a list of <code>Document</code>s, put a parser or <code>RunnableLambda</code> in between.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Prompt templates.</b> Our <code>fill</code> step is still an f-string. Real prompts have a system part, the retrieved sources, chat history and the question. How do we fill all of that safely and reuse it?</div>

  <h2 id="lc-prompt"><span class="num">03</span>Prompt Templates</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's prompt has fixed rules, a company name, retrieved sources, maybe previous chat messages, and the question, each with a role (system, human, AI). How do we describe that structure once and fill it per request?</p>
  </div>
  <p>A <strong>prompt template</strong> is a reusable prompt with named slots in <code>{braces}</code>. <code>ChatPromptTemplate</code> builds a list of role-tagged messages; <code>MessagesPlaceholder</code> is a slot for a whole list of messages (the chat history). <code>partial</code> fills some slots now and returns a smaller template.</p>
  <div class="fx" data-lang="py">from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

rag_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are {company}'s support assistant. Answer only from the sources and "
               "cite like [1]. If they don't say, say you don't know.\\n\\nSources:\\n{context}"),
    MessagesPlaceholder("history", optional=True),
    ("human", "Question: {question}"),
])
print(rag_prompt.input_variables)

value = rag_prompt.invoke({
    "company": "Biteful",
    "context": "[1] " + texts[0],
    "history": [("human", "Hi"), ("ai", "Hello! How can I help with your order?")],
    "question": QUESTION,
})
for m in value.to_messages():
    print(type(m).__name__, "|", m.content[:64].replace("\\n", " "))

rag_prompt = rag_prompt.partial(company="Biteful")
print(rag_prompt.input_variables)</div>
  <div class="fx" data-lang="text">['company', 'context', 'question']
SystemMessage | You are Biteful's support assistant. Answer only from the source
HumanMessage | Hi
AIMessage | Hello! How can I help with your order?
HumanMessage | Question: My order arrived 50 minutes late. Can I get my money b
['context', 'question']</div>
  <p><code>input_variables</code> lists the required slots (<code>history</code> is optional, so it isn't listed). <code>invoke</code> returns a <code>ChatPromptValue</code>; <code>to_messages()</code> shows the four messages a model would receive: the system rules with "Biteful" and source [1] filled in, the two history messages spliced in where the placeholder was, and the question last. After <code>partial(company="Biteful")</code> only <code>context</code> and <code>question</code> remain: that is the template the rest of this note uses.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A printed refund form with blanks. Head office designs it once; each agent fills only the blanks. <code>partial</code> is a form where the branch has already stamped its own name.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Prompt template</strong>: a Runnable that turns a dict of values into a prompt. <code>PromptTemplate</code> → one string; <code>ChatPromptTemplate</code> → role-tagged messages. Few-shot examples can be inserted with <code>FewShotChatMessagePromptTemplate</code> (few-shot itself: <a class="xref" data-note="prompting">Prompt Engineering</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Literal braces. A template containing JSON like <code>{"topic": ...}</code> treats <code>topic</code> as a slot and fails with a missing-variable error. Double them (<code>&#123;&#123;</code> and <code>&#125;&#125;</code>) or pass the JSON in through a variable, as we do with <code>format_instructions</code> in section 05.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Chat models.</b> The template produces messages. Something must read them and reply, and we want to swap that something (fake today, real tomorrow) without touching the template.</div>

  <h2 id="lc-models"><span class="num">04</span>Chat Models (a Fake One)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We need a model step that takes the filled messages and returns a reply, with the same shape whether it is Claude, GPT, a local model or a test fake. And we must build and test the whole assistant without paying for a single API call.</p>
  </div>
  <p>Every LangChain <strong>chat model</strong> has the same methods and returns the same message type, an <strong><code>AIMessage</code></strong> with <code>.content</code> (text), <code>.tool_calls</code> (requests to run tools) and <code>.usage_metadata</code> (token counts). LangChain ships <strong>fake models</strong> that replay scripted replies through exactly that interface, made for tests. We also wrap our RAG-note stand-in as a proper chat-model class by subclassing <code>SimpleChatModel</code> and writing one method, <code>_call(messages)</code>.</p>
  <div class="fx" data-lang="py">from langchain_core.language_models.fake_chat_models import FakeListChatModel
from langchain_core.language_models.chat_models import SimpleChatModel

# 1. LangChain's own fake model: replays scripted replies, same interface as a real one
scripted = FakeListChatModel(responses=["Sorry about the delay! Let me check the policy."])
msg = scripted.invoke("My order is late")
print(type(msg).__name__, "|", msg.content, "|", msg.tool_calls, msg.usage_metadata)
print([chunk.content for chunk in scripted.stream("again")][:6])

# 2. Our STAND-IN model: a real ChatModel class whose "brain" is fake_llm from the RAG note
class ExtractiveChatModel(SimpleChatModel):
    """No network, no bill: copies the best-matching source sentence and cites it."""
    @property
    def _llm_type(self):
        return "extractive-stand-in"
    def _call(self, messages, stop=None, run_manager=None, **kwargs):
        return fake_llm("\\n".join(m.content for m in messages))

llm = ExtractiveChatModel()
# Real model, same slot (not run here: it needs a paid key):
# from langchain_anthropic import ChatAnthropic; llm = ChatAnthropic(model="claude-opus-5-5")
reply = (rag_prompt | llm).invoke({"context": "[1] " + texts[0], "question": QUESTION})
print(type(reply).__name__, "|", reply.content)</div>
  <div class="fx" data-lang="text">AIMessage | Sorry about the delay! Let me check the policy. | [] None
['S', 'o', 'r', 'r', 'y', ' ']
AIMessage | If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]</div>
  <ul>
    <li><code>FakeListChatModel</code> returned an <code>AIMessage</code> with our scripted text, no tool calls, and <code>usage_metadata=None</code> (it counts no tokens; a real model returns input/output token counts). Its <code>stream</code> yields one character at a time, like a real model streaming tokens.</li>
    <li><code>ExtractiveChatModel</code> is a real LangChain chat model: <code>rag_prompt | llm</code> works, callbacks fire (section 09), fallbacks accept it (section 10). Its answer is computed from the actual sources in the prompt, so retrieval quality really shows in its output.</li>
    <li>The commented line shows the only change needed for a real model. It is not run here because it needs a paid key.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A flight simulator. Same cockpit, same controls, same instruments as the real plane; pilots practise every procedure on it before burning real fuel.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Chat model</strong>: a Runnable that takes messages (or a prompt value) and returns an <code>AIMessage</code>; integrations like <code>ChatAnthropic</code> add <code>timeout</code>, <code>max_retries</code> and <code>bind_tools</code>. <strong>Fake model</strong>: a chat model with scripted or computed replies for offline tests.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fake models prove plumbing, not quality. A scripted reply will "pass" no matter what the prompt says. Use fakes to test that parts connect, and a labelled evaluation set with a real model to test answers (<a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Output parsers.</b> The model returns free text. The ticket tagger needs a <em>typed</em> object (<code>topic</code>, <code>urgent</code>) to route tickets, and models wrap JSON in chatter and code fences. How do we turn text into checked data?</div>

  <h2 id="lc-parse"><span class="num">05</span>Output Parsers &amp; Structured Output</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our hand-written tagger parsed JSON with <code>reply.index("{")</code> and silently fell back to "other". What if the reply has a code fence, a missing field, or a topic that isn't one of Biteful's four? We want data we can trust, or a clear error.</p>
  </div>
  <p>An <strong>output parser</strong> is a Runnable that turns a model message into a Python value. <code>StrOutputParser</code> gives the text; <code>JsonOutputParser</code> finds JSON even inside a code fence; <code>PydanticOutputParser</code> also validates it against a class with types (here: topic must be one of four literals, urgent must be a boolean) and raises <code>OutputParserException</code> when it doesn't fit.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A clerk typing handwritten complaint letters into the system. A greeting and doodles don't matter; the order number goes into the right box. If the order number is missing, she rejects the letter instead of guessing.</p>
  </div>
  <div class="fx" data-lang="py">from typing import Literal
from pydantic import BaseModel
from langchain_core.messages import AIMessage
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser, PydanticOutputParser

raw = AIMessage('Sure! Here it is:\\n\`\`\`json\\n{"topic": "refund", "urgent": true}\\n\`\`\`')

print(repr(StrOutputParser().invoke(raw))[:36])
print(JsonOutputParser().invoke(raw))

class Ticket(BaseModel):
    topic: Literal["refund", "delivery", "allergen", "other"]
    urgent: bool

ticket_parser = PydanticOutputParser(pydantic_object=Ticket)
t = ticket_parser.invoke(raw)
print(type(t).__name__, t.topic, t.urgent)
print(len(ticket_parser.get_format_instructions()), "characters of format instructions")

for bad in ['{"topic": "refund"}', '{"topic": "pizza", "urgent": false}', "I think it's a refund."]:
    try:
        ticket_parser.invoke(AIMessage(bad))
    except Exception as e:
        print(type(e).__name__, "&lt;-", bad)

tag_prompt = ChatPromptTemplate.from_messages([
    ("system", "Classify the Biteful ticket.\\n{format_instructions}"), ("human", "{question}")
]).partial(format_instructions=ticket_parser.get_format_instructions())
tagger = tag_prompt | FakeListChatModel(responses=[raw.content]) | ticket_parser
print(tagger.invoke({"question": QUESTION}))</div>
  <div class="fx" data-lang="text">'Sure! Here it is:\\n\`\`\`json\\n{"topic
{'topic': 'refund', 'urgent': True}
Ticket refund True
654 characters of format instructions
OutputParserException &lt;- {"topic": "refund"}
OutputParserException &lt;- {"topic": "pizza", "urgent": false}
OutputParserException &lt;- I think it's a refund.
topic='refund' urgent=True</div>
  <ul>
    <li><code>StrOutputParser</code> returned the mess as-is. <code>JsonOutputParser</code> dug the dict out of the fence (JSON <code>true</code> → Python <code>True</code>). <code>PydanticOutputParser</code> built a typed <code>Ticket</code>.</li>
    <li>Three bad replies, three <code>OutputParserException</code>s: a missing <code>urgent</code> field, a topic "pizza" outside the allowed four, and plain prose. Failing loudly is the point; section 10 turns the failure into a safe default.</li>
    <li><code>get_format_instructions()</code> is 654 characters of "output JSON matching this schema", injected into the system message through a variable (so its braces don't become slots). The full chain <code>tag_prompt | model | ticket_parser</code> returns a <code>Ticket</code>.</li>
  </ul>
  <table class="tbl">
    <tr><th>Tool</th><th>Returns</th><th>Use when</th></tr>
    <tr><td><code>StrOutputParser</code></td><td><code>str</code></td><td>Plain text answers (our RAG chain)</td></tr>
    <tr><td><code>JsonOutputParser</code></td><td><code>dict</code></td><td>You asked for JSON; strips fences</td></tr>
    <tr><td><code>PydanticOutputParser</code></td><td>validated object</td><td>Any model; adds format instructions; validates after the fact</td></tr>
    <tr><td><code>llm.with_structured_output(Ticket)</code></td><td>validated object</td><td><strong>Default with real models</strong>: uses the provider's native schema support</td></tr>
  </table>
  <p><strong>Native structured output.</strong> Parsers <em>hope</em> the model followed the instructions, then check. Most provider APIs can instead <em>constrain</em> generation to a JSON schema, so the reply always fits. <code>with_structured_output(Ticket, method="json_schema")</code> uses that and returns a <code>Ticket</code> directly, with no format instructions in the prompt. It needs a real model integration (the fakes don't implement it), so it isn't run here.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Output parser</strong>: a Runnable mapping a model message to a Python value, raising <code>OutputParserException</code> when it can't. <strong>Structured output</strong>: generation constrained by the provider to a given schema, returned as a typed object.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Prompt for JSON and hope" fails in production on a small but steady share of calls (fences, missing fields, trailing prose). Prefer native structured output; when you must parse, validate with a schema and handle the exception.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Documents &amp; retrievers.</b> Prompt, model and parser are standard parts now. But the RAG chain's most important input, the retrieved policy sources, still comes from our hand-written <code>bm25</code> over a list of strings. What is LangChain's part for "question in, relevant documents out"?</div>

  <h2 id="lc-retr"><span class="num">06</span>Documents &amp; Retrievers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In the RAG note we wrote a loader, a chunker, an embedding, a vector index and two searches by hand. How do these become standard parts, so that the toy in-memory search can later be swapped for pgvector or Pinecone without touching the chain?</p>
  </div>
  <div class="flow"><span>Loader → Document</span><span>Splitter → chunks</span><span>Embeddings + VectorStore</span><span>Retriever</span></div>
  <p>A <strong><code>Document</code></strong> is text (<code>page_content</code>) plus a <code>metadata</code> dict. A <strong>splitter</strong> cuts Documents into chunks; <code>MarkdownHeaderTextSplitter</code> cuts at headings and records them as metadata, exactly the "one chunk per section" that scored best in the RAG note's chunk-size test. An <strong>Embeddings</strong> class needs two methods (<code>embed_documents</code>, <code>embed_query</code>). A <strong>vector store</strong> holds the vectors; <code>as_retriever()</code> wraps it as a <strong>retriever</strong>: a Runnable, string in, list of Documents out.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library. The loader is the delivery van, the splitter cuts books into index cards, embeddings write each card's subject code, the vector store is the card cabinet, and the retriever is the librarian you ask.</p>
  </div>
  <div class="fx" data-lang="py">from langchain_core.documents import Document
from langchain_text_splitters import MarkdownHeaderTextSplitter

splitter = MarkdownHeaderTextSplitter(headers_to_split_on=[("#", "doc"), ("##", "section")])
docs = []
for name, text in DOCS.items():
    for d in splitter.split_text(text):                 # one Document per "## " section
        d.metadata["source"] = name
        d.page_content = f"{d.metadata['section']}. {d.page_content}"   # contextual header
        docs.append(d)
print(len(docs), docs[0].metadata)
print(docs[0].page_content[:60])

# STAND-IN embeddings (same TF-IDF char 3-5-grams as the RAG note), behind LangChain's interface
from sklearn.feature_extraction.text import TfidfVectorizer
from langchain_core.embeddings import Embeddings

class CharTfidfEmbeddings(Embeddings):
    def __init__(self, corpus):
        self.vec = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), sublinear_tf=True).fit(corpus)
    def embed_documents(self, texts):
        return self.vec.transform(texts).toarray().tolist()
    def embed_query(self, text):
        return self.vec.transform([text]).toarray()[0].tolist()

from langchain_core.vectorstores import InMemoryVectorStore
store = InMemoryVectorStore.from_documents(docs, CharTfidfEmbeddings([d.page_content for d in docs]))
for d, s in store.similarity_search_with_score("It is raining and my food is late. Why?", k=2):
    print(round(s, 3), d.metadata["source"], d.metadata["section"])

dense_retriever = store.as_retriever(search_kwargs={"k": 3})
print(type(dense_retriever).__name__, [d.metadata["section"] for d in dense_retriever.invoke(QUESTION)])

# A keyword retriever: subclass BaseRetriever, implement one method
from langchain_core.retrievers import BaseRetriever

class BM25Retriever(BaseRetriever):
    documents: list
    k: int = 3
    def _get_relevant_documents(self, query, *, run_manager=None):
        scores = bm25(query, [d.page_content for d in self.documents])
        order = sorted(range(len(scores)), key=lambda i: -scores[i])
        return [self.documents[i] for i in order[:self.k] if scores[i] &gt; 0]

bm25_retriever = BM25Retriever(documents=docs)
print([d.metadata["section"] for d in bm25_retriever.invoke("Does the paneer tikka contain nuts?")])</div>
  <div class="fx" data-lang="text">13 {'doc': 'Refund policy', 'section': 'Late orders', 'source': 'refunds.md'}
Late orders. If your order arrives more than 45 minutes afte
0.184 delivery.md Delays
0.101 refunds.md Missing or wrong items
VectorStoreRetriever ['Late orders', 'Delivery times', 'How refunds are paid']
['Allergen labels', 'Shared kitchens']</div>
  <ul>
    <li>13 Documents, one per section, each with <code>doc</code>, <code>section</code> and <code>source</code> metadata, so citations and filters work. We glued the section title back onto the text (contextual header), as in the RAG note.</li>
    <li><code>CharTfidfEmbeddings</code> is the RAG note's stand-in embedding behind LangChain's interface. The rain question scores 0.184 against "Delays", the same number as in the RAG note: same model, same vectors, now inside a standard part.</li>
    <li><code>dense_retriever.invoke(QUESTION)</code> returns Late orders, Delivery times, How refunds are paid.</li>
    <li><code>BM25Retriever</code> is our own retriever: subclass <code>BaseRetriever</code>, implement <code>_get_relevant_documents</code>, reuse <code>bm25</code>. It finds both allergen sections for the nuts question, the case the embedding got wrong.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Retriever</strong>: a Runnable that maps a query string to a list of <code>Document</code>s. Any vector store becomes one with <code>as_retriever(search_kwargs={"k": 3})</code>; any search becomes one by subclassing <code>BaseRetriever</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A retriever returns <code>Document</code> objects, not text. Pipe them straight into a prompt and the model sees a Python repr full of <code>Document(id=..., metadata=...)</code>. Format them first (next section).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: RunnableParallel, Passthrough &amp; Lambda.</b> We have two retrievers, a prompt with two slots (<code>context</code>, <code>question</code>), and a model. But a chain is a single line: the question must go into <em>both</em> retrievers, their results must be fused, and the original question must <em>also</em> reach the prompt. How does one input fan out?</div>

  <h2 id="lc-parallel"><span class="num">07</span>RunnableParallel, Passthrough &amp; Lambda, Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>retriever | prompt</code> would give the prompt a list of Documents and no question. How do we send one input to several branches, keep a copy of it unchanged, and slot ordinary Python functions (formatting, RRF) into the chain?</p>
  </div>
  <ul>
    <li><strong><code>RunnableParallel</code></strong> (or a plain dict inside a chain): send one input to several Runnables; get a dict of their outputs.</li>
    <li><strong><code>RunnablePassthrough()</code></strong>: return the input unchanged. <code>RunnablePassthrough.assign(key=...)</code> keeps the input dict and adds a key.</li>
    <li><strong><code>RunnableLambda(fn)</code></strong>: wrap any Python function as a Runnable (a bare function after <code>|</code> is wrapped automatically).</li>
  </ul>
<figure class="viz"><svg viewBox="0 0 600 162" width="600"><defs><marker id="lc-a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="10" y="91">question</text><path d="M76,87 H86 V37 H98" fill="none" stroke="currentColor" marker-end="url(#lc-a4)"/><path d="M86,87 V137 H98" fill="none" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="100" y="20" width="100" height="34" rx="6" class="ft st"/><text x="150" y="41" text-anchor="middle" font-weight="bold">bm25 ∥ dense</text><rect x="215" y="20" width="110" height="34" rx="6" class="ft st"/><text x="270" y="41" text-anchor="middle" font-weight="bold">rrf → format</text><line x1="200" y1="37" x2="213" y2="37" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="100" y="120" width="225" height="34" rx="6" class="fs"/><text x="212.5" y="141" text-anchor="middle" font-weight="bold">RunnablePassthrough()</text><text x="150" y="70" text-anchor="middle" font-size="10" class="tm">2 Document lists</text><text x="270" y="70" text-anchor="middle" font-size="10" class="tm">→ "[1] … [2] … [3] …"</text><rect x="345" y="20" width="80" height="134" rx="6" class="fv"/><text x="385" y="41" text-anchor="middle" font-size="11">context</text><text x="385" y="91" text-anchor="middle" font-weight="bold">dict</text><text x="385" y="141" text-anchor="middle" font-size="11">question</text><line x1="325" y1="37" x2="343" y2="37" stroke="currentColor" marker-end="url(#lc-a4)"/><line x1="325" y1="137" x2="343" y2="137" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="445" y="66" width="145" height="42" rx="6" class="fb sb"/><text x="517.5" y="85" text-anchor="middle" font-weight="bold">prompt|llm|parser</text><text x="517.5" y="99" text-anchor="middle" font-size="10" class="tm">→ answer str</text><line x1="425" y1="87" x2="443" y2="87" stroke="currentColor" marker-end="url(#lc-a4)"/></svg><figcaption>The setup dict is a RunnableParallel: the question goes through both retrievers, RRF and formatting into {context}, and unchanged into {question}.</figcaption></figure>
  <div class="fx" data-lang="py">from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda

def format_docs(docs):                           # list[Document] -&gt; "[1] ...\\n[2] ..."
    return "\\n".join(f"[{n}] {d.page_content}" for n, d in enumerate(docs, 1))

def rrf_merge(results, k=60, top=3):             # {"bm25": [...], "dense": [...]} -&gt; top docs
    score, doc = {}, {}
    for ranking in results.values():
        for rank, d in enumerate(ranking, start=1):
            score[d.page_content] = score.get(d.page_content, 0) + 1 / (k + rank)
            doc[d.page_content] = d
    return [doc[t] for t in sorted(score, key=lambda t: -score[t])[:top]]

both = RunnableParallel(bm25=bm25_retriever, dense=dense_retriever)   # one input, two branches
hybrid = both | RunnableLambda(rrf_merge)
setup = RunnableParallel(context=hybrid | format_docs, question=RunnablePassthrough())
rag_chain = setup | rag_prompt | llm | StrOutputParser()

q = "It is raining and my food is late. Why?"
step1 = both.invoke(q)
print({name: [d.metadata["section"] for d in docs] for name, docs in step1.items()})
print([d.metadata["section"] for d in hybrid.invoke(q)])
step2 = setup.invoke(q)
print(list(step2), "|", step2["question"])
print(step2["context"].replace("\\n", " / ")[:120])
print(rag_chain.invoke(q))
print(rag_chain.invoke(QUESTION))</div>
  <div class="fx" data-lang="text">{'bm25': ['Tracking', 'Late orders'], 'dense': ['Delays', 'Missing or wrong items', 'Tracking']}
['Tracking', 'Delays', 'Late orders']
['context', 'question'] | It is raining and my food is late. Why?
[1] Tracking. You can track your rider live on the map once the restaurant hands over the food. / [2] Delays. Heavy rain
Heavy rain, festivals and road closures can slow riders down. When this happens the app shows a delay banner and a new estimate. [2]
If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]</div>
  <p>Trace the rain question stage by stage:</p>
  <table class="tbl">
    <tr><th>Stage</th><th>Runnable</th><th>Output</th></tr>
    <tr><td>1</td><td><code>both</code> (RunnableParallel)</td><td><code>{'bm25': [Tracking, Late orders], 'dense': [Delays, Missing…, Tracking]}</code></td></tr>
    <tr><td>2</td><td><code>RunnableLambda(rrf_merge)</code></td><td>Tracking (1/61 + 1/63), Delays (1/61), Late orders (1/62; Missing… ties at 1/62 and loses because it was seen later)</td></tr>
    <tr><td>3</td><td><code>setup</code></td><td><code>{'context': "[1] Tracking… [2] Delays…", 'question': (unchanged)}</code></td></tr>
    <tr><td>4</td><td><code>rag_prompt | llm | StrOutputParser()</code></td><td>"Heavy rain… delay banner… [2]"</td></tr>
  </table>
  <p>Each <code>print</code> runs one prefix of the chain, which is the best way to debug LCEL: invoke the pieces and look. With each retriever returning 3, "Delays" fuses to second place (in the RAG note, with pools of 5, it was third; there a reranker moved it to first). The stand-in model still finds the right sentence pair and cites [2]. The last line is our customer: the full chain gives the same cited 45-minute answer as the hand-built pipeline.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant ticket. The order is photocopied: one copy goes to the kitchen (retrievers), the original stays clipped to the tray (passthrough), and both meet again at the pass before the plate goes out (the prompt).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>RunnableParallel</strong>: runs several Runnables on the same input, returns <code>{name: output}</code>. <strong>RunnablePassthrough</strong>: identity (with <code>.assign</code> to add keys). <strong>RunnableLambda</strong>: a Python function as a Runnable.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting the passthrough branch: <code>{"context": retriever | format_docs} | prompt</code> fails with a missing <code>question</code> variable, because the prompt only receives what the dict produced.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Memory &amp; chat history.</b> The chain answers one question perfectly. The customer then asks "How long does that take?" The chain has no idea what "that" is: each <code>invoke</code> starts from nothing.</div>

  <h2 id="lc-mem"><span class="num">08</span>Memory &amp; Chat History</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A model keeps nothing between calls, and neither does a chain. Where does the conversation live, how much of it do we re-send, and how does retrieval understand a follow-up that only makes sense with history?</p>
  </div>
  <p>Chat "memory" is simply this: <strong>your code stores past messages and sends them again with the next question.</strong> Two things then matter. <em>How much</em> to re-send: history grows every turn and every re-sent token is paid on every call, so you trim it (keep the last few turns, or summarise old ones). And for RAG, <em>what to search for</em>: a follow-up must be condensed with the history into a standalone question before retrieval (the RAG note's conversational section).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A clinic where the doctor forgets every patient the moment they leave. The receptionist keeps the file. Send the whole file each visit (buffer), the last few pages (window), a one-page summary (summary), or the summary plus the last pages (summary + buffer).</p>
  </div>
  <div class="fx" data-lang="py">from operator import itemgetter
from langchain_core.messages import HumanMessage, AIMessage, trim_messages

condense_prompt = ChatPromptTemplate.from_messages([
    ("system", "Rewrite the last user message as a standalone search question."),
    MessagesPlaceholder("history"), ("human", "{question}"),
])
# STAND-IN for the rewrite call: a scripted reply (what an LLM typically returns here)
condenser = condense_prompt | FakeListChatModel(
    responses=["How long do refunds take to come back to my payment method?"]) | StrOutputParser()

def standalone(inputs):                           # only rewrite when there is history
    return condenser.invoke(inputs) if inputs["history"] else inputs["question"]

conv_chain = (
    RunnablePassthrough.assign(question=RunnableLambda(standalone))                    # 1 condense
    | RunnablePassthrough.assign(context=itemgetter("question") | hybrid | format_docs)  # 2 retrieve
    | rag_prompt | llm | StrOutputParser()                                              # 3 answer
)

history = []                                      # the whole "memory": a list your code keeps
def chat(question, window=4):
    recent = trim_messages(history, max_tokens=window, token_counter=len,
                           strategy="last", start_on="human")       # cap what we re-send
    reply = conv_chain.invoke({"question": question, "history": recent})
    history.extend([HumanMessage(question), AIMessage(reply)])
    return reply

print(chat(QUESTION))
print(chat("How long does that take?"))
print([m.type for m in history])
print(conv_chain.invoke({"question": "How long does that take?", "history": []}))   # no memory</div>
  <div class="fx" data-lang="text">If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]
Card and UPI refunds go back to the original payment method in 5-7 working days. [1]
['human', 'ai', 'human', 'ai']
I don't know based on these sources.</div>
  <ul>
    <li><code>history</code> is a plain list of messages. <code>chat()</code> trims it to the last 4 messages starting on a human turn (<code>token_counter=len</code> counts messages to keep the demo readable; in production pass the model and a token budget), runs the chain, and appends the new pair.</li>
    <li>Turn 1 has no history, so <code>standalone</code> passes the question through: the 45-minute answer.</li>
    <li>Turn 2 has history, so the condenser runs. Its reply is scripted (a labelled stand-in for the one LLM call that would write it): "How long do refunds take to come back to my payment method?". <code>RunnablePassthrough.assign</code> replaces <code>question</code> with it, retrieval finds "How refunds are paid", and the answer is <strong>5-7 working days</strong>, cited.</li>
    <li>The last line is the same follow-up with empty history: "I don't know". Memory is what made turn 2 work.</li>
  </ul>
  <p>LangChain used to wrap this in <code>RunnableWithMessageHistory</code>. In langchain-core 1.6 it is deprecated, and the warning (captured below) points straight to the next note:</p>
  <div class="fx" data-lang="py">import warnings
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import InMemoryChatMessageHistory

with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")
    RunnableWithMessageHistory(conv_chain, lambda sid: InMemoryChatMessageHistory(),
                               input_messages_key="question", history_messages_key="history")
for w in caught:
    print(type(w.message).__name__, "|", str(w.message)[:75])</div>
  <div class="fx" data-lang="text">LangChainDeprecationWarning | RunnableWithMessageHistory is deprecated. Use LangGraph's built-in persiste</div>
<figure class="viz"><svg viewBox="0 0 600 150" width="600"><text x="10" y="27" font-size="11" font-weight="bold">Buffer</text><rect x="130" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="143" y="26" text-anchor="middle" font-size="9">t1</text><rect x="160" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="173" y="26" text-anchor="middle" font-size="9">t2</text><rect x="190" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="203" y="26" text-anchor="middle" font-size="9">t3</text><rect x="220" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="233" y="26" text-anchor="middle" font-size="9">t4</text><rect x="250" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="263" y="26" text-anchor="middle" font-size="9">t5</text><rect x="280" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="293" y="26" text-anchor="middle" font-size="9">t6</text><text x="320" y="26" font-size="10" class="tm">unbounded → overflows</text><text x="10" y="63" font-size="11" font-weight="bold">Window k=2</text><rect x="130" y="46" width="26" height="24" rx="4" class="fs" opacity=".35"/><text x="143" y="62" text-anchor="middle" font-size="9" opacity=".35">t1</text><rect x="160" y="46" width="26" height="24" rx="4" class="fs" opacity=".35"/><text x="173" y="62" text-anchor="middle" font-size="9" opacity=".35">t2</text><rect x="190" y="46" width="26" height="24" rx="4" class="fs" opacity=".35"/><text x="203" y="62" text-anchor="middle" font-size="9" opacity=".35">t3</text><rect x="220" y="46" width="26" height="24" rx="4" class="fs" opacity=".35"/><text x="233" y="62" text-anchor="middle" font-size="9" opacity=".35">t4</text><rect x="250" y="46" width="26" height="24" rx="4" class="fb sb"/><text x="263" y="62" text-anchor="middle" font-size="9">t5</text><rect x="280" y="46" width="26" height="24" rx="4" class="fb sb"/><text x="293" y="62" text-anchor="middle" font-size="9">t6</text><text x="320" y="62" font-size="10" class="tm">bounded; forgets t1–t4</text><text x="10" y="99" font-size="11" font-weight="bold">Summary</text><rect x="130" y="82" width="176" height="24" rx="4" class="fv"/><text x="218" y="98" text-anchor="middle" font-size="10">summary t1–t6</text><text x="320" y="98" font-size="10" class="tm">small + 1 summary call</text><text x="10" y="135" font-size="11" font-weight="bold">Summary+buffer</text><rect x="130" y="118" width="116" height="24" rx="4" class="fv"/><text x="188" y="134" text-anchor="middle" font-size="10">summary t1–t4</text><rect x="250" y="118" width="26" height="24" rx="4" class="fb sb"/><text x="263" y="134" text-anchor="middle" font-size="9">t5</text><rect x="280" y="118" width="26" height="24" rx="4" class="fb sb"/><text x="293" y="134" text-anchor="middle" font-size="9">t6</text><text x="320" y="134" font-size="10" class="tm">recent verbatim + summary</text></svg><figcaption>What each strategy re-sends after 6 turns (blue = verbatim, violet = model-written summary, faded = dropped).</figcaption></figure>
  <table class="tbl">
    <tr><th>Strategy (legacy class)</th><th>Keeps</th><th>Cost</th><th>Use</th></tr>
    <tr><td>Buffer <small>(ConversationBufferMemory)</small></td><td>Everything verbatim</td><td>Grows until the context overflows</td><td>Demos</td></tr>
    <tr><td>Window <small>(…BufferWindowMemory)</small> / <code>trim_messages</code></td><td>Last k turns</td><td>Bounded</td><td>Most chatbots</td></tr>
    <tr><td>Summary <small>(…SummaryMemory)</small></td><td>A running model-written summary</td><td>Small, plus a summary call</td><td>Long sessions</td></tr>
    <tr><td>Summary + buffer</td><td>Recent turns + summary of older</td><td>Controlled</td><td>Best balance</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Chat memory</strong>: stored past messages that your code re-sends (whole, trimmed or summarised) with each call. <code>trim_messages</code> keeps a token- or message-bounded window, optionally pinning the system prompt and starting on a human turn.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Unbounded history: ten 200-token turns add 2,000 input tokens to every later call, forever, until the context overflows. And window memory forgets early facts ("my order id is B-102" in turn 1). Trim and summarise, or store key facts separately.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Callbacks &amp; tracing.</b> One customer turn now runs a condenser, two retrievers, a fusion step, a prompt, a model and a parser. When a turn is slow or wrong, which part was it? We need to see inside the chain.</div>

  <h2 id="lc-trace"><span class="num">09</span>Callbacks &amp; Tracing</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A customer says the bot gave a wrong refund answer. Did the retrievers miss the "Late orders" chunk, or did the model ignore it? Print statements in every part don't scale. How do we watch a chain run?</p>
  </div>
  <p>Every Runnable reports what it does to <strong>callback handlers</strong>: objects whose methods LangChain calls when a part starts, ends or errors (<code>on_retriever_end</code>, <code>on_chat_model_start</code>, <code>on_llm_end</code>, <code>on_tool_start</code>, <code>on_chain_error</code>…). You pass handlers in the <code>config</code> of one call, and they see every nested step. <code>astream_events</code> exposes the same stream as async events for UIs. <strong>LangSmith</strong> is a hosted service that records all of it automatically.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tracking a Biteful order: streaming is watching the rider's dot move; callbacks are the notifications at each stage ("restaurant accepted", "picked up"); LangSmith is the full order history support opens when something went wrong.</p>
  </div>
  <div class="fx" data-lang="py">import time, asyncio
from langchain_core.callbacks import BaseCallbackHandler

class SupportTracer(BaseCallbackHandler):
    """Called by LangChain as each part starts and ends."""
    def __init__(self):
        self.t0 = time.perf_counter()
    def _log(self, what):
        print(f"{(time.perf_counter() - self.t0) * 1000:7.1f} ms  {what}")
    def on_retriever_end(self, documents, **kw):
        self._log(f"retriever -&gt; {[d.metadata['section'] for d in documents]}")
    def on_chat_model_start(self, serialized, messages, **kw):
        self._log(f"model start, {len(messages[0])} messages, {sum(len(m.content) for m in messages[0])} chars")
    def on_llm_end(self, response, **kw):
        self._log(f"model end -&gt; {response.generations[0][0].text[:40]!r}")

answer = rag_chain.invoke(QUESTION, config={"callbacks": [SupportTracer()]})
print(answer[:40])

async def event_names():                          # the same run as a stream of events
    return [e["event"] async for e in rag_chain.astream_events(QUESTION, version="v2")]
names = asyncio.run(event_names())
print(len(names), "events;", sorted(set(names)))</div>
  <div class="fx" data-lang="text">    2.7 ms  retriever -&gt; ['Late orders', 'Delivery times', 'How refunds are paid']
    4.5 ms  retriever -&gt; ['Late orders', 'Delivery times', 'How refunds are paid']
    6.0 ms  model start, 2 messages, 660 chars
    6.4 ms  model end -&gt; 'If your order arrives more than 45 minut'
If your order arrives more than 45 minut
34 events; ['on_chain_end', 'on_chain_start', 'on_chain_stream', 'on_chat_model_end', 'on_chat_model_start', 'on_parser_end', 'on_parser_start', 'on_parser_stream', 'on_prompt_end', 'on_prompt_start', 'on_retriever_end', 'on_retriever_start']</div>
  <ul>
    <li>Two <code>on_retriever_end</code> calls (BM25 and dense, both returned Late orders, Delivery times, How refunds are paid), then the model started with 2 messages (system with sources + question, 660 characters) and ended with the cited answer. The millisecond timings are from this machine; with a real model, the model step dominates (hundreds to thousands of ms).</li>
    <li>The same run as events: 34 events of 12 kinds, from <code>on_chain_start</code> to <code>on_parser_end</code>. <code>astream_events</code> is async, so we run it with <code>asyncio.run</code> (<a class="xref" data-note="py_asyncio">asyncio</a>).</li>
  </ul>
  <div class="cards">
    <div><b>Streaming</b><p><code>chain.stream()</code> yields pieces; <code>astream_events(..., version="v2")</code> yields typed events for a UI.</p></div>
    <div><b>Callbacks</b><p>Subclass <code>BaseCallbackHandler</code>; pass <code>config={"callbacks": [h]}</code>.</p><small>Logging, latency, token cost</small></div>
    <div><b>LangSmith</b><p>Set <code>LANGSMITH_TRACING=true</code> and <code>LANGSMITH_API_KEY</code>: every run traced with inputs, outputs, latency and tokens per step.</p><small>Also datasets and evaluations</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Callback handler</strong>: an object with hook methods that LangChain calls during a run. <strong>Trace</strong>: the tree of all steps of one run with their inputs, outputs and timings.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Traces contain prompts and answers, i.e. customer messages and order details. Before sending them to a hosted service, check your data policy, mask fields or self-host.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Fallbacks &amp; retries.</b> Tracing tells us <em>that</em> the model call timed out or the parser failed. The customer still got an error page. How does the chain recover by itself?</div>

  <h2 id="lc-fallback"><span class="num">10</span>Fallbacks &amp; Retries</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Provider APIs time out, rate-limit and go down; models sometimes return text the parser rejects. Writing try/except/retry loops around every call is the glue we wanted to get rid of. How do we add resilience to any part without rewriting it?</p>
  </div>
  <p>Every Runnable has two wrappers. <strong><code>with_retry(stop_after_attempt=n)</code></strong> re-runs the same step on failure (for transient errors like timeouts). <strong><code>with_fallbacks([b, c])</code></strong> tries alternatives in order when the step raises (for outages or persistent failures): a backup provider, a smaller local model, or a safe default.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A Biteful rider whose route is blocked tries again a minute later (retry); if the road is closed, takes the backup route (fallback); if the restaurant is shut, the app offers a refund instead of an error (safe default).</p>
  </div>
  <div class="fx" data-lang="py"># A "primary model" that times out twice, then works (simulated: no real API)
calls = {"n": 0}
def flaky_model(prompt_value):
    calls["n"] += 1
    if calls["n"] &lt; 3:
        raise TimeoutError(f"attempt {calls['n']} timed out")
    return llm.invoke(prompt_value)

retrying = RunnableLambda(flaky_model).with_retry(stop_after_attempt=3, wait_exponential_jitter=False)
chain = setup | rag_prompt | retrying | StrOutputParser()
print(chain.invoke(QUESTION)[:45], "| attempts:", calls["n"])

# A primary model that is down: fall back to the local stand-in
def provider_down(prompt_value):
    raise ConnectionError("provider down")
robust = RunnableLambda(provider_down).with_fallbacks([llm])
chain = setup | rag_prompt | robust | StrOutputParser()
print(chain.invoke(QUESTION)[:45])

# A parser that fails: fall back to a safe default ticket instead of crashing
tagger = (tag_prompt | FakeListChatModel(responses=["It's about a refund, I think."]) | ticket_parser
          ).with_fallbacks([RunnableLambda(lambda x: Ticket(topic="other", urgent=True))])
print(tagger.invoke({"question": QUESTION}))</div>
  <div class="fx" data-lang="text">If your order arrives more than 45 minutes af | attempts: 3
If your order arrives more than 45 minutes af
topic='other' urgent=True</div>
  <ul>
    <li><strong>Retry</strong>: the simulated primary model timed out on attempts 1 and 2; <code>with_retry</code> ran it a third time and the chain answered. The caller never saw the timeouts.</li>
    <li><strong>Fallback model</strong>: the primary raised <code>ConnectionError</code>; <code>with_fallbacks([llm])</code> sent the same prompt to the local stand-in, which answered.</li>
    <li><strong>Fallback for a bad parse</strong>: the tagger's model replied in prose, the Pydantic parser raised, and the fallback returned a safe <code>Ticket(topic='other', urgent=True)</code>, so the ticket goes to a human instead of crashing the pipeline.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Retry</strong>: re-invoke the same Runnable after an exception (optionally with exponential backoff). <strong>Fallback</strong>: on exception, invoke the next Runnable in a list with the same input.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Retrying non-transient errors (bad API key, invalid request) just multiplies latency and cost; restrict retries to timeouts and rate limits (<code>retry_if_exception_type=</code>). And retrying a step with side effects (sending an email) repeats the side effect.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Tools &amp; create_agent.</b> Our chain is robust, but it can only read the policy. The customer says "Order B-102 was late": answering properly needs the order's real delay, which lives in Biteful's order system, behind a function. How does the model ask our code to run it?</div>

  <h2 id="lc-agents"><span class="num">11</span>Tools &amp; create_agent</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A model only produces text. To check order B-102 it must <em>request</em> a function call, our code must run it, and the result must go back to the model before it answers. How do we describe our functions to the model, and who runs that back-and-forth?</p>
  </div>
  <p>The model needs each function's name, purpose and argument schema. The <strong><code>@tool</code></strong> decorator builds all three from the function itself (name, docstring, type hints). <code>llm.bind_tools([...])</code> sends the schemas with each request, so the model may reply with a tool call. Running the call and looping is the agent's job: <strong><code>create_agent</code></strong> builds that loop (it runs on LangGraph). The model below is scripted (a labelled stand-in): first it requests <code>order_status("B-102")</code>, then it answers.</p>
  <div class="fx" data-lang="py">from langchain_core.tools import tool
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain.agents import create_agent
from langchain.agents.middleware import ToolCallLimitMiddleware

@tool
def order_status(order_id: str) -&gt; str:
    """Minutes late for a Biteful order id like 'B-102'. Use before answering refund questions."""
    return {"B-102": "delivered 50 minutes after the promised time"}.get(order_id, "order not found")

print(order_status.name, "|", order_status.args)
print(order_status.invoke({"order_id": "B-102"}))

class ScriptedModel(GenericFakeChatModel):      # STAND-IN: replays scripted replies
    def bind_tools(self, tools, **kwargs):      # the fake ignores tool schemas
        return self

agent_llm = ScriptedModel(messages=iter([
    AIMessage("", tool_calls=[{"name": "order_status", "args": {"order_id": "B-102"}, "id": "call_1"}]),
    AIMessage("Order B-102 was 50 minutes late, more than 45, so you get a full refund."),
]))
agent = create_agent(agent_llm, tools=[order_status],
                     system_prompt="You are Biteful's support assistant.",
                     middleware=[ToolCallLimitMiddleware(run_limit=5)])
result = agent.invoke({"messages": [{"role": "user", "content": "Order B-102 was late. Refund?"}]})
for m in result["messages"]:
    print(type(m).__name__, "|", m.content or m.tool_calls[0]["name"])</div>
  <div class="fx" data-lang="text">order_status | {'order_id': {'title': 'Order Id', 'type': 'string'}}
delivered 50 minutes after the promised time
HumanMessage | Order B-102 was late. Refund?
AIMessage | order_status
ToolMessage | delivered 50 minutes after the promised time
AIMessage | Order B-102 was 50 minutes late, more than 45, so you get a full refund.</div>
  <p>The four messages are the loop: the customer asks; the model replies with a tool call instead of text; the agent ran <code>order_status("B-102")</code> and appended a <code>ToolMessage</code> (linked by id <code>call_1</code>); the model saw "delivered 50 minutes after the promised time" and answered. <code>ToolCallLimitMiddleware(run_limit=5)</code> stops a model that keeps calling tools forever. The <code>ScriptedModel</code> subclass exists only because the fake has no <code>bind_tools</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A support agent who can't leave her desk. She writes "check order B-102" on a slip (tool call); a runner fetches the answer from the dispatch room (tool result); she replies to the customer. <code>create_agent</code> is the runner plus the rule "keep doing this until she answers".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Tool</strong>: a function plus a schema the model can request by name. <strong>Agent</strong>: a loop in which the model chooses tools, your code runs them, and results are fed back until the model answers (<a class="xref" data-note="agentic">Agent Fundamentals</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A vague docstring ("gets order") means wrong tools and wrong arguments ("B102", "order one-oh-two"). Say what it does, when to call it, and the argument format, as <code>order_status</code> does.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: When not to use LangChain.</b> The tool loop is not a straight line: it goes round until the model stops. Our RAG assistant will want loops too (check the answer, retrieve again, ask a human). Is a chain still the right tool, and when is LangChain itself more than we need?</div>

  <h2 id="lc-when"><span class="num">12</span>When Not to Use LangChain</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We gained swappable parts, batching, streaming, tracing, retries. What did we pay, and in which situations does the framework cost more than it gives?</p>
  </div>
  <p>Two costs: run-time overhead and, much bigger, complexity (more concepts, deeper stack traces, version churn). Measure the first on identical work: the same five plain functions, called directly vs as an LCEL chain of <code>RunnableLambda</code>s.</p>
  <div class="fx" data-lang="py">import timeit

def top2(q):                                      # the same five functions, used two ways
    s = bm25(q, texts); idx = sorted(range(len(texts)), key=lambda i: -s[i])[:2]
    return {"q": q, "docs": [texts[i] for i in idx]}
def fmt(x):    return {"q": x["q"], "src": "\\n".join(f"[{n}] {t}" for n, t in enumerate(x["docs"], 1))}
def fill(x):   return f"Sources:\\n{x['src']}\\n\\nQuestion: {x['q']}"
def clean(s):  return s.strip()

plain = lambda q: clean(fake_llm(fill(fmt(top2(q)))))
lcel = (RunnableLambda(top2) | RunnableLambda(fmt) | RunnableLambda(fill)
        | RunnableLambda(fake_llm) | RunnableLambda(clean))
print(plain(QUESTION) == lcel.invoke(QUESTION))
for name, fn in [("plain calls", plain), ("LCEL chain", lcel.invoke)]:
    ms = timeit.timeit(lambda: fn(QUESTION), number=200) / 200 * 1000
    print(f"{name:11} {ms:5.2f} ms per question")</div>
  <div class="fx" data-lang="text">True
plain calls  0.26 ms per question
LCEL chain   1.11 ms per question</div>
  <p>Same answer (<code>True</code>). The chain adds under 1 ms per question for five steps on this machine, while a real model call takes hundreds to thousands of milliseconds. Speed is rarely the reason to skip LangChain; <strong>simplicity</strong> is.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Better choice</th></tr>
    <tr><td>One or two model calls, fixed flow</td><td>The provider SDK directly: less to learn, easier to debug</td></tr>
    <tr><td>Loops, branches, retries of whole steps, human approval, resume after a crash</td><td><a class="xref" data-note="langgraph">LangGraph</a> (state + graph + checkpoints)</td></tr>
    <tr><td>Latency-critical hot path with no swapping</td><td>Direct calls; remove layers</td></tr>
    <tr><td>The team debugs the framework more than the model</td><td>Simplify; own the loop (<a class="xref" data-note="agent_build">Build an Agent from Scratch</a>)</td></tr>
    <tr><td>Many providers, retrievers, swaps, tracing, batch/stream everywhere</td><td><strong>LangChain pays off</strong></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A food processor. Worth it for a wedding's worth of onions; for one onion, a knife is faster to use and to clean.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Framework overhead</strong>: the extra time and complexity of running code through an abstraction rather than calling it directly. Measured here: 0.26 ms (plain) vs 1.11 ms (LCEL) for five steps.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forcing loops into chains: nesting chains inside <code>RunnableLambda</code>s with <code>while</code> loops to fake "retrieve again if weak". It works until you need to pause, resume or inspect it. That is the moment to move to a graph.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> Twelve parts; which is built from which, and what did each do for Biteful's customer?</div>

  <h2 id="lc-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Runnables, templates, models, parsers, retrievers, parallel/passthrough/lambda, memory, callbacks, retries, tools: a pile of classes, or one idea applied to every job of the hand-built assistant?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="lc-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="170" height="44" rx="7" class="fr sr"/><text x="95" y="29" text-anchor="middle" font-size="11.5" font-weight="700">hand-wired glue</text><text x="95" y="45" text-anchor="middle" class="tm" font-size="10">fill · call · parse, again</text>
<line x1="180" y1="32" x2="218" y2="32" stroke="currentColor" marker-end="url(#lc-c0)"/>
<rect x="220" y="10" width="220" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Runnable + | (= __or__)</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">invoke · batch · stream for every part</text>
<line x1="440" y1="32" x2="478" y2="32" stroke="currentColor" marker-end="url(#lc-c0)"/>
<rect x="480" y="10" width="190" height="44" rx="7" class="ft st"/><text x="575" y="29" text-anchor="middle" font-size="11.5" font-weight="700">prompt → model → parser</text><text x="575" y="45" text-anchor="middle" class="tm" font-size="10">AIMessage → str / Ticket</text>
<line x1="575" y1="54" x2="575" y2="84" stroke="currentColor" marker-end="url(#lc-c0)"/>
<rect x="480" y="86" width="190" height="44" rx="7" class="ft st"/><text x="575" y="105" text-anchor="middle" font-size="11.5" font-weight="700">retrievers (BM25, dense)</text><text x="575" y="121" text-anchor="middle" class="tm" font-size="10">str → [Document]</text>
<line x1="480" y1="108" x2="442" y2="108" stroke="currentColor" marker-end="url(#lc-c0)"/>
<rect x="220" y="86" width="220" height="44" rx="7" class="fg sg"/><text x="330" y="105" text-anchor="middle" font-size="11.5" font-weight="700">Parallel · Passthrough · Lambda</text><text x="330" y="121" text-anchor="middle" class="tm" font-size="10">the RAG chain: 45-min answer [1]</text>
<line x1="220" y1="108" x2="182" y2="108" stroke="currentColor" marker-end="url(#lc-c0)"/>
<rect x="10" y="86" width="170" height="44" rx="7" class="fg sg"/><text x="95" y="105" text-anchor="middle" font-size="11.5" font-weight="700">memory</text><text x="95" y="121" text-anchor="middle" class="tm" font-size="10">"that" → 5-7 working days</text>
<line x1="95" y1="130" x2="95" y2="164" stroke="currentColor" marker-end="url(#lc-c0)"/>
<rect x="10" y="166" width="170" height="44" rx="7" class="fv"/><text x="95" y="185" text-anchor="middle" font-size="11.5" font-weight="700">callbacks · tracing</text><text x="95" y="201" text-anchor="middle" class="tm" font-size="10">34 events per run</text>
<line x1="180" y1="188" x2="218" y2="188" stroke="currentColor" marker-end="url(#lc-c0)"/>
<rect x="220" y="166" width="220" height="44" rx="7" class="fv"/><text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">retries · fallbacks</text><text x="330" y="201" text-anchor="middle" class="tm" font-size="10">ok on attempt 3; safe Ticket</text>
<line x1="440" y1="188" x2="478" y2="188" stroke="currentColor" marker-end="url(#lc-c0)"/>
<rect x="480" y="166" width="190" height="44" rx="7" class="fr sr"/><text x="575" y="185" text-anchor="middle" font-size="11.5" font-weight="700">tools → a loop</text><text x="575" y="201" text-anchor="middle" class="tm" font-size="10">not a straight line any more</text>
<line x1="575" y1="210" x2="575" y2="240" stroke="currentColor" marker-end="url(#lc-c0)"/>
<rect x="400" y="242" width="270" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="535" y="267" text-anchor="middle" font-size="11.5" font-weight="700">→ LangGraph: state, loops, pause, resume</text>
<text x="200" y="268" text-anchor="middle" class="tm" font-size="10.5">one interface (Runnable), applied to every job</text>
</svg><figcaption>Every part is a Runnable, so everything composes with |, and every wrapper (retry, fallback, callbacks) works on every part. The tool loop is where a straight chain stops fitting.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's assistant</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our example</th><th>When to use</th></tr>
    <tr><td>Hand-wired glue</td><td>plain functions</td><td>what does each feature repeat?</td><td>5 glue steps × 2 features</td><td>one-off scripts</td></tr>
    <tr><td>Runnable / LCEL</td><td><code>invoke</code> + <code>__or__</code></td><td>how do parts snap together?</td><td>RunnableSequence, 3 steps; batch of 2</td><td>any multi-step flow</td></tr>
    <tr><td>Prompt template</td><td>slots + roles + placeholder</td><td>how to fill prompts safely?</td><td>4 messages; partial → [context, question]</td><td>every prompt</td></tr>
    <tr><td>Chat model</td><td>messages → AIMessage</td><td>one interface for any model?</td><td>fake + ExtractiveChatModel answer [1]</td><td>always; fakes for tests</td></tr>
    <tr><td>Output parser</td><td>text → value (+ schema)</td><td>how to get typed data?</td><td>Ticket(refund, True); 3 exceptions</td><td>routing, extraction</td></tr>
    <tr><td>Retriever</td><td>Documents + embeddings + store</td><td>where does context come from?</td><td>13 sections; rain → Delays 0.184</td><td>RAG</td></tr>
    <tr><td>Parallel / Passthrough / Lambda</td><td>dict of Runnables, identity, fn</td><td>how does one input fan out?</td><td>bm25 ∥ dense → RRF → [1][2][3]</td><td>RAG, multi-branch</td></tr>
    <tr><td>Memory</td><td>message list + trim + condense</td><td>what does "that" mean?</td><td>5-7 working days vs "I don't know"</td><td>any chat</td></tr>
    <tr><td>Callbacks / tracing</td><td>hook methods, events</td><td>what happened inside?</td><td>2 retriever ends, model start/end; 34 events</td><td>always in production</td></tr>
    <tr><td>Retry / fallback</td><td>wrappers on any Runnable</td><td>how to survive failures?</td><td>attempt 3; local model; safe Ticket</td><td>every external call</td></tr>
    <tr><td>Tools / create_agent</td><td>@tool schema + loop</td><td>how does the model use our functions?</td><td>order_status(B-102) → full refund</td><td>actions, live data</td></tr>
    <tr><td>When not to</td><td>measured overhead + complexity</td><td>is it worth it?</td><td>0.26 vs 1.11 ms</td><td>skip for one call; graph for loops</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>LangChain gives every job in an LLM app the same interface (a Runnable), so parts compose with <code>|</code> and every cross-cutting concern (batching, streaming, tracing, retries, fallbacks) works on every part.</strong> It does not change what the parts do: the Biteful answer is the same as in the hand-built RAG.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The parts fit together; now the mistakes that break them in practice.</div>

  <h2 id="lc-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which mistakes do people make with these parts most often, and how do you recognise each one?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: copying legacy tutorials</span>
    <p><code>LLMChain</code>, <code>initialize_agent</code>, <code>AgentExecutor</code>, <code>ConversationBufferMemory</code> are in <code>langchain-classic</code> since 1.0; <code>RunnableWithMessageHistory</code> is deprecated in core 1.6. Use LCEL, <code>create_agent</code> and LangGraph persistence.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong type between steps</span>
    <p>A step expecting <code>str</code> receives an <code>AIMessage</code> or a list of <code>Document</code>s. Add <code>StrOutputParser()</code> or a formatting <code>RunnableLambda</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting RunnablePassthrough</span>
    <p>The question must reach both the retriever and the prompt; without the passthrough branch the prompt fails on a missing <code>question</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: literal braces in templates</span>
    <p>JSON examples inside a template become slots. Double the braces or inject them through a variable.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: prompting for JSON and hoping</span>
    <p>Use native structured output where available; otherwise validate with a schema and handle <code>OutputParserException</code> (fallback to a safe default).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unbounded history</span>
    <p>Re-sending every message grows cost each turn and finally overflows. Trim or summarise; condense follow-ups before retrieval.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: retrying everything</span>
    <p>Retry transient errors only; retrying a bad request or a side-effecting step multiplies cost or repeats the action.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: testing quality with fake models</span>
    <p>Fakes test wiring. Answer quality needs a real model and a labelled evaluation set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: using LangChain for one API call</span>
    <p>For a single call the SDK is shorter and clearer. Add the framework when parts need to be swapped, traced or composed.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="langgraph">LangGraph</a>, where the Biteful assistant gets state, a check step, a retry loop and a human escalation.</div>

  <h2 id="lc-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. <strong>Running example</strong>: Biteful's support assistant over 13 policy sections; customer: "My order arrived 50 minutes late. Can I get my money back?" → "If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]"; follow-up "How long does that take?" → "…5-7 working days. [1]".</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On Biteful</th><th>Gap → next</th></tr>
    <tr><td>Hand-wired glue</td><td>what does each feature cost?</td><td>RAG + tagger repeat 5 jobs</td><td>pieces that snap together</td></tr>
    <tr><td>Runnable &amp; LCEL</td><td>how do pieces compose?</td><td><code>a | b</code> = <code>a.__or__(b)</code>; 3-step sequence</td><td>prompt is an f-string</td></tr>
    <tr><td>Prompt template</td><td>how to fill prompts?</td><td>system + history + question; partial</td><td>who reads it?</td></tr>
    <tr><td>Chat model</td><td>one model interface?</td><td>fake + stand-in → AIMessage</td><td>reply is free text</td></tr>
    <tr><td>Output parser</td><td>text → typed data?</td><td>Ticket(refund, True); 3 exceptions</td><td>context still by hand</td></tr>
    <tr><td>Retriever</td><td>context as a part?</td><td>13 Documents; BM25 + dense retrievers</td><td>one input, many branches</td></tr>
    <tr><td>Parallel / Passthrough / Lambda</td><td>fan out and rejoin?</td><td>full RAG chain answers [1]</td><td>no memory</td></tr>
    <tr><td>Memory</td><td>what is "that"?</td><td>trim + condense → 5-7 days</td><td>can't see inside</td></tr>
    <tr><td>Callbacks &amp; tracing</td><td>what happened?</td><td>retriever ×2, model start/end; 34 events</td><td>failures still crash</td></tr>
    <tr><td>Retries &amp; fallbacks</td><td>survive failures?</td><td>attempt 3; local model; safe Ticket</td><td>can't call our functions</td></tr>
    <tr><td>Tools &amp; create_agent</td><td>model uses functions?</td><td>order_status(B-102)</td><td>a loop, not a line</td></tr>
    <tr><td>When not to use</td><td>worth it?</td><td>0.26 vs 1.11 ms; complexity</td><td>→ LangGraph</td></tr>
  </table>
  <h3>Key APIs</h3>
  <table class="tbl">
    <tr><th>Part</th><th>API</th><th>In → out</th></tr>
    <tr><td>Compose</td><td><code>a | b</code>, <code>.invoke / .batch / .stream / .ainvoke</code></td><td>output of a → input of b</td></tr>
    <tr><td>Prompt</td><td><code>ChatPromptTemplate.from_messages([...])</code>, <code>MessagesPlaceholder</code>, <code>.partial()</code></td><td>dict → ChatPromptValue</td></tr>
    <tr><td>Model</td><td><code>FakeListChatModel</code>, <code>GenericFakeChatModel</code>, <code>SimpleChatModel._call</code>, <code>ChatAnthropic</code></td><td>messages → AIMessage</td></tr>
    <tr><td>Parser</td><td><code>StrOutputParser</code>, <code>JsonOutputParser</code>, <code>PydanticOutputParser</code>, <code>with_structured_output</code></td><td>AIMessage → str / dict / object</td></tr>
    <tr><td>Retrieval</td><td><code>Document</code>, <code>MarkdownHeaderTextSplitter</code>, <code>Embeddings</code>, <code>InMemoryVectorStore</code>, <code>.as_retriever()</code>, <code>BaseRetriever</code></td><td>str → [Document]</td></tr>
    <tr><td>Wiring</td><td><code>RunnableParallel</code> (dict), <code>RunnablePassthrough(.assign)</code>, <code>RunnableLambda</code></td><td>x → {k: f(x)}, x → x, x → fn(x)</td></tr>
    <tr><td>Memory</td><td>message list + <code>trim_messages</code> + condense prompt</td><td>history → bounded history</td></tr>
    <tr><td>Observe</td><td><code>BaseCallbackHandler</code>, <code>config={"callbacks": [...]}</code>, <code>astream_events(version="v2")</code>, LangSmith env vars</td><td>run → events / trace</td></tr>
    <tr><td>Harden</td><td><code>.with_retry(stop_after_attempt=3)</code>, <code>.with_fallbacks([...])</code></td><td>failure → retry / alternative</td></tr>
    <tr><td>Tools</td><td><code>@tool</code>, <code>bind_tools</code>, <code>create_agent(model, tools, middleware=[...])</code></td><td>function → schema → loop</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>LCEL chain</b><p>Fixed multi-step flows with swappable parts: RAG, extraction, classification.</p><small>Straight lines only</small></div>
    <div><b>Fake / stand-in models</b><p>Tests, CI, learning without a bill.</p><small>Never to judge answer quality</small></div>
    <div><b>Structured output</b><p>Anything your code branches on.</p><small>Parser + fallback if the provider lacks it</small></div>
    <div><b>Plain SDK</b><p>One call, small fixed flow, hot path.</p><small>Less to learn and debug</small></div>
    <div><b>LangGraph</b><p>Loops, branches, approvals, resume, durable memory.</p><small>Next note</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Legacy classes; type mismatches between steps; missing passthrough; literal braces; parse-and-pray JSON; unbounded history; retrying non-transient or side-effecting steps; judging quality with fakes; framework for one call.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>What does <code>a | b</code> call?</td><td><code>a.__or__(b)</code>, returning a sequence whose invoke(x) = b.invoke(a.invoke(x))</td></tr>
    <tr><td>Output type of prompt, model, StrOutputParser?</td><td>ChatPromptValue → AIMessage → str</td></tr>
    <tr><td>What does <code>{"context": r | fmt, "question": RunnablePassthrough()}</code> become?</td><td>A RunnableParallel returning {context: formatted docs, question: unchanged input}</td></tr>
    <tr><td>Model times out twice; <code>with_retry(stop_after_attempt=3)</code>?</td><td>Third attempt runs; caller sees only the answer</td></tr>
    <tr><td>Why did "How long does that take?" work in turn 2 only?</td><td>History existed, so it was condensed into a standalone refund question before retrieval</td></tr>
  </table>

  <h2 id="lc-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Runnable protocol and why does it matter?</summary><div class="qa-body">The shared interface (<code>invoke</code>, <code>batch</code>, <code>stream</code>, <code>ainvoke</code>) every part implements. Because prompts, models, parsers, retrievers and tools all speak it, they compose with <code>|</code> without glue, and batching, streaming, async, callbacks, retries and fallbacks work on every part and every chain.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does <code>a | b</code> work in Python, and how would you build it yourself?</summary><div class="qa-body">Python calls <code>a.__or__(b)</code>. Define <code>__or__</code> to return a new object whose <code>invoke(x)</code> is <code>b.invoke(a.invoke(x))</code>. Our 8-line <code>Step</code> class did exactly this and gave the same Biteful answer as LangChain's <code>RunnableSequence</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Trace <code>chain.invoke(q)</code> for <code>prompt | llm | StrOutputParser()</code>.</summary><div class="qa-body">The prompt fills its template → <code>ChatPromptValue</code>. The model reads the messages → <code>AIMessage</code> (content, tool calls, usage). The parser takes <code>.content</code> → <code>str</code>. Three calls in sequence, no hidden state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>PromptTemplate</code> vs <code>ChatPromptTemplate</code>; what is <code>MessagesPlaceholder</code>?</summary><div class="qa-body"><code>PromptTemplate</code> renders one string; <code>ChatPromptTemplate</code> renders role-tagged messages for chat models. <code>MessagesPlaceholder("history")</code> is a slot for a whole list of messages, spliced in at that position.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do fake models exist, and what can't they tell you?</summary><div class="qa-body">They implement the chat-model interface with scripted or computed replies, so you can build and test wiring, parsers, retries and agents offline and deterministically. They can't tell you whether a real model will answer well; that needs a real model and an evaluation set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>PydanticOutputParser</code> vs <code>with_structured_output</code>: which and why?</summary><div class="qa-body">The parser injects format instructions and validates the text afterwards; it raises <code>OutputParserException</code> on missing fields, invalid values or prose (3 of 3 bad replies in our run). <code>with_structured_output</code> uses the provider's native schema constraint, so the reply always fits. Prefer native; keep the parser plus a fallback for models without it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a retriever, and how do you make a custom one?</summary><div class="qa-body">A Runnable from query string to list of Documents. Vector stores provide one via <code>as_retriever()</code>; for anything else subclass <code>BaseRetriever</code> and implement <code>_get_relevant_documents</code> (our BM25 retriever: 6 lines reusing <code>bm25</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do you need <code>RunnablePassthrough</code> in a RAG chain?</summary><div class="qa-body">The question must go two places: through the retrievers into <code>{context}</code>, and unchanged into <code>{question}</code>. <code>{"context": hybrid | format_docs, "question": RunnablePassthrough()}</code> forks it. Without the passthrough the prompt is missing a variable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you build hybrid retrieval with LCEL?</summary><div class="qa-body"><code>RunnableParallel(bm25=bm25_retriever, dense=dense_retriever) | RunnableLambda(rrf_merge)</code>: both retrievers get the same question; the lambda fuses their lists with reciprocal rank fusion and returns the top documents.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare buffer, window, summary and summary + buffer memory.</summary><div class="qa-body">Buffer: everything, unbounded. Window: last k turns, bounded, forgets early facts. Summary: running summary, small, extra call, loses detail. Summary + buffer: recent verbatim plus summary of older turns, the usual balance. All of them just put text back into the prompt.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you debug a wrong answer from a RAG chain?</summary><div class="qa-body">Trace it (callbacks or LangSmith): if the retrieved documents lack the answer, fix retrieval (chunking, hybrid, k, condensing); if they contain it, fix the prompt or model. Invoking prefixes of the chain (<code>setup.invoke(q)</code>) shows each intermediate value. Save failing cases to an evaluation set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make a chain resilient?</summary><div class="qa-body"><code>with_retry</code> for transient errors (timeouts, rate limits), <code>with_fallbacks</code> for outages (backup model) and bad outputs (safe default), <code>timeout</code>/<code>max_retries</code> on real models, and <code>max_concurrency</code> in <code>batch</code> to stay under rate limits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>bind_tools</code> vs <code>create_agent</code>?</summary><div class="qa-body"><code>bind_tools</code> only attaches tool schemas, so the model's reply may contain tool calls; nothing runs them. <code>create_agent</code> builds the loop: run requested tools, append <code>ToolMessage</code>s, call the model again, until it answers; with middleware such as call limits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the RAG chain need RunnableParallel at all, when LCEL is "a pipe"?</summary><div class="qa-body">A pipe passes one value forward, but the prompt needs two values derived from the same input: the retrieved context and the original question. RunnableParallel is how one input becomes several named values; without it, the retriever's output would replace the question.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does memory need query condensing in RAG, but not in a plain chatbot?</summary><div class="qa-body">A plain chatbot just re-sends the history and the model resolves "that" itself. In RAG, retrieval runs <em>before</em> the model, on the raw follow-up, which has no searchable words ("How long does that take?" → "I don't know"). Condensing turns history + follow-up into a standalone query the retriever can use.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you add output parsers but no fallbacks?</summary><div class="qa-body">A parser's job is to fail loudly on bad output, so every malformed reply becomes an exception that crashes the request. Fallbacks (retry with a stricter prompt, or a safe default like <code>Ticket(other, urgent)</code>) turn that loud failure into graceful handling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do tools push you from LangChain chains to LangGraph?</summary><div class="qa-body">A chain runs each step once, in order. A tool-using model needs a loop of unknown length (model → tool → model …), plus often a pause for approval and state that survives across turns. That is a graph with state and checkpoints; even <code>create_agent</code> runs on LangGraph.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use LangChain?</summary><div class="qa-body">One or two calls or a small fixed flow (SDK directly), latency-critical paths with no swapping, or when the team fights framework internals more than model behaviour. The run-time overhead is small (about 1 ms for 5 steps here); the cost is complexity. For loops, approval and resume, use LangGraph.</div></details>
</main>`
});
