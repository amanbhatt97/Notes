// notes/genai/langchain.js — LangChain
Object.assign(TOPIC_CONTENT, {
  "langchain": `<main>
  <h1>LangChain</h1>
  <p class="lead">LangChain is standard plumbing for LLM apps: one interface for models, prompts, parsers, retrievers and tools, joined with a pipe. You should know the raw API (05), RAG (07) and the agent loop (08–09); here you see what the framework saves you. 11 LangGraph builds on it for stateful agents.</p>

  <h2 id="lc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">LangChain</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What it gives you</div>
        <ul>
          <li><b>Standard interfaces</b> for models, prompts, parsers, retrievers, tools; swap in one line</li>
          <li>💡 <b>Pipe fittings</b> — any tap fits any pipe; water (LLM) no cleaner</li>
          <li><b>Not</b> smarter models or reliable agents</li>
          <li><b>Packages</b> — <code>langchain-core</code> (interfaces), <code>langchain</code> (create_agent), <code>langchain-anthropic</code>…, <code>-text-splitters</code>, <code>-classic</code> (legacy)</li>
          <li>⚠ <code>LLMChain</code>, <code>initialize_agent</code>, <code>AgentExecutor</code>, <code>ConversationBufferMemory</code> = legacy (1.0+)</li>
          <li><b>Skip it</b> — 1–2 calls, latency hot path, debugging framework &gt; model; stateful → LangGraph</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Models &amp; prompts</div>
        <ul>
          <li><b><code>ChatAnthropic(model=..., timeout, max_retries)</code></b> — same interface as <code>ChatOpenAI</code></li>
          <li><b><code>invoke</code> → AIMessage</b> — <code>.content</code>, <code>.usage_metadata</code>, <code>.tool_calls</code></li>
          <li><b><code>ChatPromptTemplate.from_messages</code></b> — named slots; <code>MessagesPlaceholder("history")</code></li>
          <li><b><code>.partial(role=...)</code></b> — fill some slots now</li>
          <li>⚠ <code>PromptTemplate</code> → one string; chat models want <code>ChatPromptTemplate</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LCEL &amp; Runnables</div>
        <ul>
          <li><b>Runnable</b> — <code>invoke · stream · batch · ainvoke</code>; everything implements it</li>
          <li><b><code>prompt | llm | parser</code></b> → RunnableSequence: dict → ChatPromptValue → AIMessage → str</li>
          <li><b>RunnableParallel</b> (or a dict) — fan one input out, get a dict</li>
          <li><b>RunnablePassthrough</b> — carry input unchanged (question past the retriever)</li>
          <li><b>RunnableLambda</b> — wrap any function</li>
          <li><b>Reliability</b> — <code>.with_retry()</code>, <code>.with_fallbacks([...])</code>, <code>max_concurrency</code></li>
          <li>💡 Unix pipes, but typed objects</li>
          <li>⚠ Type mismatches fail only at runtime → add parser/lambda</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Parsers &amp; structured output</div>
        <ul>
          <li><b>StrOutputParser</b> → str; <b>JsonOutputParser</b> → dict (strips fences)</li>
          <li><b>PydanticOutputParser</b> — old: format instructions + validate text</li>
          <li><b><code>with_structured_output(Model, method="json_schema")</code></b> — default; native schema → typed object</li>
          <li>⚠ default <code>function_calling</code> forces a tool → rejected on claude-opus-5-5</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Documents &amp; retrievers</div>
        <ul>
          <li><b>Document</b> — <code>page_content</code> + <code>metadata</code></li>
          <li><b>Loaders</b> — 100+; <code>lazy_load()</code> for big sources</li>
          <li><b>RecursiveCharacterTextSplitter</b> — paragraphs → lines → spaces</li>
          <li><b>Vector stores</b> — InMemory for demos; Chroma, pgvector, Pinecone share the API</li>
          <li><b><code>as_retriever(search_kwargs={"k": 4})</code></b> — str in, Documents out, a Runnable</li>
          <li>⚠ Format Documents to text before the prompt</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tools &amp; agents</div>
        <ul>
          <li><b><code>@tool</code></b> — name + type hints + docstring = schema</li>
          <li><b><code>bind_tools</code></b> — model may <em>ask</em>; doesn't run the loop</li>
          <li><b><code>create_agent(llm, tools, system_prompt, middleware, checkpointer)</code></b> — LangGraph ReAct graph</li>
          <li><b>Middleware</b> — ToolCallLimit, HumanInTheLoop, Summarization, ModelFallback</li>
          <li><b>vs AgentExecutor</b> — state in graph → pause, inspect, resume</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Memory</div>
        <ul>
          <li><b>Memory = past messages put back in the prompt</b></li>
          <li><b>Buffer</b> (all) · <b>Window</b> (last k) · <b>Summary</b> · <b>Summary + buffer</b> (best balance)</li>
          <li><b>Today</b> — <code>trim_messages(...)</code> or a checkpointer keyed by <code>thread_id</code></li>
          <li>⚠ History tokens are paid on every call → cap or summarise</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Observe &amp; build</div>
        <ul>
          <li><b>Streaming</b> — <code>stream()</code>; <code>astream_events(version="v2")</code> for UIs</li>
          <li><b>Callbacks</b> — <code>BaseCallbackHandler</code>: on_llm_end, on_tool_start…</li>
          <li><b>LangSmith</b> — <code>LANGSMITH_TRACING=true</code> + API key → per-step traces</li>
          <li><b>RAG chain</b> — <code>{"context": retriever | format_docs, "question": RunnablePassthrough()} | prompt | llm | parser</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What It Gives You</span><span class="rm-sub">And when to skip it</span></div></div>
      <div class="rm-item rm-done" data-target="lc-models"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Models &amp; Prompt Templates</span><span class="rm-sub">One interface, any provider</span></div></div>
      <div class="rm-item rm-done" data-target="lc-lcel"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">LCEL &amp; Runnables</span><span class="rm-sub">prompt | llm | parser</span></div></div>
      <div class="rm-item rm-done" data-target="lc-parse"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Parsers &amp; Structured Output</span><span class="rm-sub">Text in, objects out</span></div></div>
      <div class="rm-item rm-done" data-target="lc-retr"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Documents &amp; Retrievers</span><span class="rm-sub">Load, split, index, fetch</span></div></div>
      <div class="rm-item rm-done" data-target="lc-agents"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Tools &amp; Agents</span><span class="rm-sub">@tool and create_agent</span></div></div>
      <div class="rm-item rm-done" data-target="lc-mem"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Conversation Memory</span><span class="rm-sub">It's just history in the prompt</span></div></div>
      <div class="rm-item rm-done" data-target="lc-trace"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Streaming, Callbacks, LangSmith</span><span class="rm-sub">See what ran and what it cost</span></div></div>
      <div class="rm-item rm-done" data-target="lc-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Build It: a RAG Chain</span><span class="rm-sub">In-memory vector store, runnable</span></div></div>
      <div class="rm-item rm-done" data-target="lc-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="lc-why"><span class="num">01</span>What It Gives You</h2>
  <p>Every LLM app repeats the same plumbing (prompt, model, parse, history, documents, tools). LangChain gives each a <strong>standard interface</strong>: parts snap together and swap in one line.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Standard pipe fittings. Any tap fits any pipe. LangChain doesn't make the water (the LLM) any cleaner; it just stops you cutting custom joints for every project.</p>
  </div>
  <p>It does <strong>not</strong> make models smarter or agents more reliable. Hallucination and bad prompts are still your problem.</p>
<figure class="viz"><svg viewBox="0 0 600 168" width="600"><rect x="20" y="20" width="350" height="40" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity=".5"/><text x="195" y="38" text-anchor="middle" font-weight="bold">langchain-classic (legacy)</text><text x="195" y="52" text-anchor="middle" font-size="10" class="tm">LLMChain · AgentExecutor · ConversationBufferMemory</text><rect x="380" y="20" width="200" height="40" rx="6" class="fg sg"/><text x="480" y="38" text-anchor="middle" font-weight="bold">langchain</text><text x="480" y="52" text-anchor="middle" font-size="10" class="tm">create_agent + middleware</text><rect x="20" y="70" width="170" height="40" rx="6" class="ft st"/><text x="105" y="88" text-anchor="middle" font-weight="bold">langchain-anthropic</text><text x="105" y="102" text-anchor="middle" font-size="10" class="tm">-openai … per provider</text><rect x="200" y="70" width="170" height="40" rx="6" class="ft st"/><text x="285" y="88" text-anchor="middle" font-weight="bold">text-splitters</text><text x="285" y="102" text-anchor="middle" font-size="10" class="tm">chunkers</text><rect x="380" y="70" width="200" height="40" rx="6" class="fv"/><text x="480" y="88" text-anchor="middle" font-weight="bold">langgraph</text><text x="480" y="102" text-anchor="middle" font-size="10" class="tm">stateful agent runtime</text><rect x="20" y="120" width="560" height="40" rx="6" class="fb sb"/><text x="300" y="138" text-anchor="middle" font-weight="bold">langchain-core</text><text x="300" y="152" text-anchor="middle" font-size="10" class="tm">interfaces: messages · prompts · Runnables · parsers · tools · vector-store base</text></svg><figcaption>Everything sits on langchain-core's interfaces. Integrations are separate packages; create_agent runs on LangGraph; old classes moved to langchain-classic.</figcaption></figure>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Old tutorials use <code>LLMChain</code>, <code>initialize_agent</code>, <code>AgentExecutor</code> and <code>ConversationBufferMemory</code>. Since LangChain 1.0 these live in <code>langchain-classic</code>. New code uses LCEL, <code>create_agent</code>, and LangGraph checkpointers.</p>
  </div>
  <h3>When to skip LangChain</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Better choice</th></tr>
    <tr><td>One or two LLM calls</td><td>The provider SDK directly: less to learn, easier to debug</td></tr>
    <tr><td>Stateful agent with branches, approval, resume</td><td>LangGraph (11)</td></tr>
    <tr><td>Latency-critical hot path</td><td>Direct calls; remove layers</td></tr>
    <tr><td>Team debugs the framework more than the model</td><td>Simplify; own the loop (09)</td></tr>
    <tr><td>Many providers, retrievers, swaps, tracing</td><td><strong>Here it pays off</strong></td></tr>
  </table>

  <h2 id="lc-models"><span class="num">02</span>Models &amp; Prompt Templates</h2>
  <p>Every chat model has the same interface. Swap <code>ChatAnthropic</code> for <code>ChatOpenAI</code> and the rest of the code doesn't change.</p>
  <div class="fx" data-lang="py">from langchain_anthropic import ChatAnthropic   # pip install langchain-anthropic

llm = ChatAnthropic(model="claude-opus-5-5", max_tokens=1024,
                    timeout=30, max_retries=3)   # key from ANTHROPIC_API_KEY

msg = llm.invoke("Explain HNSW in one line.")
msg.content           # the text
msg.usage_metadata    # {"input_tokens": ..., "output_tokens": ...}
msg.tool_calls        # [] unless tools were bound</div>
  <p>A <strong>prompt template</strong> is a reusable prompt with named slots. <code>MessagesPlaceholder</code> injects a whole list of messages, e.g. chat history.</p>
  <div class="fx" data-lang="py">from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a {role}. Be concise."),
    MessagesPlaceholder("history"),
    ("human", "{question}"),
])
prompt.input_variables          # ['history', 'question', 'role']
tutor = prompt.partial(role="tutor")   # fill some slots now, the rest later</div>
  <p>Also available: <code>FewShotChatMessagePromptTemplate</code> to insert example pairs (few-shot itself is in <a class="xref" data-note="prompting">Prompt Engineering</a>).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>PromptTemplate</code> outputs one string; <code>ChatPromptTemplate</code> outputs a list of messages. For chat models, use the chat version.</p>
  </div>

  <h2 id="lc-lcel"><span class="num">03</span>LCEL &amp; Runnables</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>Runnable</strong> is anything with <code>invoke</code>, <code>stream</code>, <code>batch</code> and async <code>ainvoke</code>. <strong>LCEL</strong> (LangChain Expression Language) joins Runnables with <code>|</code>: the output of the left becomes the input of the right.</p>
  </div>
<figure class="viz"><svg viewBox="0 0 600 128" width="600"><defs><marker id="lc-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="14" y="64">dict</text><line x1="50" y1="60" x2="88" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><rect x="90" y="40" width="100" height="40" rx="6" class="ft st"/><text x="140" y="64" text-anchor="middle" font-weight="bold">prompt</text><rect x="250" y="40" width="100" height="40" rx="6" class="fb sb"/><text x="300" y="64" text-anchor="middle" font-weight="bold">llm</text><rect x="410" y="40" width="100" height="40" rx="6" class="fg sg"/><text x="460" y="64" text-anchor="middle" font-weight="bold">parser</text><line x1="190" y1="60" x2="248" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="219" y="30" text-anchor="middle" font-size="10" class="tm">ChatPromptValue</text><line x1="350" y1="60" x2="408" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="379" y="30" text-anchor="middle" font-size="10" class="tm">AIMessage</text><line x1="510" y1="60" x2="548" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="552" y="64">str</text><path d="M90,92 V100 H510 V92" fill="none" stroke="currentColor" stroke-opacity=".5"/><text x="300" y="118" text-anchor="middle" font-size="11">RunnableSequence = a Runnable too: invoke · stream · batch · ainvoke</text></svg><figcaption>Each | hands the left output to the right. The types change at every step; the whole chain inherits streaming, batching and async.</figcaption></figure>
  <p>Prompts, models, parsers, retrievers and tools are all Runnables, so any of them can sit in a chain.</p>
  <div class="fx" data-lang="py">from langchain_core.output_parsers import StrOutputParser

chain = prompt | llm | StrOutputParser()
chain.invoke({"role": "tutor", "history": [], "question": "What is HNSW?"})

for chunk in chain.stream({...}):    # tokens flow through the whole chain
    print(chunk, end="")
chain.batch(inputs, config={"max_concurrency": 5})</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Unix pipes: <code>cat f | grep x | sort</code>. Each part knows only its input and output. Difference: LCEL pipes carry typed Python objects (dict → messages → AIMessage → str), not bytes.</p>
  </div>
  <h3>The helper Runnables</h3>
  <ul>
    <li><strong><code>RunnableParallel</code></strong> (or a plain dict in a chain): send one input to several Runnables at once; get a dict back.</li>
    <li><strong><code>RunnablePassthrough</code></strong>: pass the input through unchanged. In RAG it carries the question past the retriever.</li>
    <li><strong><code>RunnableLambda</code></strong>: wrap any Python function so it fits in a chain.</li>
  </ul>
  <div class="fx" data-lang="py">from langchain_core.runnables import RunnableParallel, RunnableLambda

fan_out = RunnableParallel(upper=RunnableLambda(str.upper), length=RunnableLambda(len))
print(fan_out.invoke("hello"))</div>
  <table class="tbl out"><caption>Result</caption><tr><th>output</th></tr><tr><td>{'upper': 'HELLO', 'length': 5}</td></tr></table>
  <h3>Reliability wrappers</h3>
  <div class="fx" data-lang="py">safe_llm = llm.with_fallbacks([ChatAnthropic(model="claude-sonnet-5-5")])  # on any error, try next
chain = prompt | safe_llm.with_retry(stop_after_attempt=3) | StrOutputParser()</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>LCEL type mismatches fail only at runtime, often with a confusing error. If the next step expects a string and gets an <code>AIMessage</code>, add a parser or <code>RunnableLambda</code> between them.</p>
  </div>

  <h2 id="lc-parse"><span class="num">04</span>Parsers &amp; Structured Output</h2>
  <table class="tbl">
    <tr><th>Tool</th><th>Returns</th><th>Use when</th></tr>
    <tr><td><code>StrOutputParser</code></td><td><code>str</code></td><td>Plain text answers</td></tr>
    <tr><td><code>JsonOutputParser</code></td><td><code>dict</code></td><td>You prompted for JSON; strips code fences</td></tr>
    <tr><td><code>PydanticOutputParser</code></td><td>Pydantic object</td><td>Old approach: injects format instructions, validates the text</td></tr>
    <tr><td><code>llm.with_structured_output(Model)</code></td><td>Pydantic object</td><td><strong>Default</strong>: uses the provider's native schema support</td></tr>
  </table>
  <div class="fx" data-lang="py">from pydantic import BaseModel, Field

class Ticket(BaseModel):
    category: str = Field(description="billing, shipping or other")
    urgent: bool

classify = llm.with_structured_output(Ticket, method="json_schema")
t = classify.invoke("My card was charged twice, fix it today!")
t.category, t.urgent     # typed fields, not text</div>
  <p>Why the native route wins: the API constrains generation to the schema (05 covers this), so no "model forgot a brace" failures and no format instructions in the prompt.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The default <code>method="function_calling"</code> forces a tool call. <code>claude-opus-5-5</code> rejects forced tool choice, and langchain-anthropic warns about it. Pass <code>method="json_schema"</code>.</p>
  </div>

  <h2 id="lc-retr"><span class="num">05</span>Documents &amp; Retrievers</h2>
  <p>The RAG pipeline (07) in LangChain's parts:</p>
  <div class="flow"><span>Loader → Document</span><span>Splitter → chunks</span><span>Embeddings + VectorStore</span><span>Retriever</span></div>
  <ul>
    <li><strong><code>Document</code></strong>: <code>page_content</code> + <code>metadata</code> (source, page). Every loader returns a list of them.</li>
    <li><strong>Loaders</strong>: 100+ in <code>langchain-community</code> (PDF, web, CSV, Notion…). Use <code>lazy_load()</code> for big sources.</li>
    <li><strong><code>RecursiveCharacterTextSplitter</code></strong>: tries <code>\\n\\n</code>, then <code>\\n</code>, then spaces, so paragraphs stay whole. Chunking strategy itself is in <a class="xref" data-note="rag">Retrieval-Augmented Generation</a>.</li>
    <li><strong>Vector stores</strong>: <code>InMemoryVectorStore</code> for demos; Chroma, pgvector, Pinecone etc. share the interface (06).</li>
    <li><strong>Retriever</strong>: <code>store.as_retriever(search_kwargs={"k": 4})</code>. Takes a string, returns documents, and is a Runnable.</li>
  </ul>
  <p>Fancier retrievers from older tutorials (multi-query, contextual compression, ensemble/hybrid) now live in <code>langchain-classic</code>; the techniques themselves are covered in <a class="xref" data-note="rag">Retrieval-Augmented Generation</a>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A retriever returns <code>Document</code> objects, not text. Format them (join <code>page_content</code>) before they reach the prompt, or the model sees a Python repr.</p>
  </div>

  <h2 id="lc-agents"><span class="num">06</span>Tools &amp; Agents</h2>
  <p><code>@tool</code> turns a function into a tool. The <strong>name, type hints and docstring</strong> become the schema the model reads (05 explains the mechanics).</p>
  <div class="fx" data-lang="py">from langchain_core.tools import tool

@tool
def get_stock(sku: str) -&gt; int:
    """Return units in stock for a SKU like 'SKU-123'. Call when the user asks about availability."""
    return 7

get_stock.name, get_stock.args     # 'get_stock', {'sku': {'title': 'Sku', 'type': 'string'}}
llm_with_tools = llm.bind_tools([get_stock])   # model can now request it</div>
  <p><code>bind_tools</code> only lets the model <em>ask</em>. To run the loop (call → execute → feed back → repeat), use <strong><code>create_agent</code></strong>. It builds a LangGraph ReAct graph for you.</p>
  <div class="fx" data-lang="py">from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware, ToolCallLimitMiddleware
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    llm,
    tools=[get_stock],
    system_prompt="You are a shop assistant.",
    middleware=[ToolCallLimitMiddleware(run_limit=10)],   # loop guard
    checkpointer=InMemorySaver(),                          # memory per thread
)
result = agent.invoke(
    {"messages": [{"role": "user", "content": "Is SKU-1 in stock?"}]},
    {"configurable": {"thread_id": "u1"}},
)
result["messages"][-1].content</div>
  <p><strong>Middleware</strong> hooks into the loop: <code>HumanInTheLoopMiddleware(interrupt_on={"issue_refund": True})</code> pauses before a risky tool, <code>SummarizationMiddleware</code> compacts long histories, <code>ModelFallbackMiddleware</code> switches model on error.</p>
  <div class="callout intu"><span class="label">Old vs new</span>
    <p><code>initialize_agent</code> / <code>AgentExecutor</code> ran a hidden loop with an <code>agent_scratchpad</code> placeholder holding tool calls. <code>create_agent</code> keeps the tool history in graph state, so you can pause, inspect and resume it (11).</p>
  </div>

  <h2 id="lc-mem"><span class="num">07</span>Conversation Memory</h2>
  <p>There is no magic: "memory" is <strong>past messages put back into the prompt</strong>. The model itself remembers nothing between calls.</p>
<figure class="viz"><svg viewBox="0 0 600 150" width="600"><text x="10" y="27" font-size="11" font-weight="bold">Buffer</text><rect x="130" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="143" y="26" text-anchor="middle" font-size="9">t1</text><rect x="160" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="173" y="26" text-anchor="middle" font-size="9">t2</text><rect x="190" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="203" y="26" text-anchor="middle" font-size="9">t3</text><rect x="220" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="233" y="26" text-anchor="middle" font-size="9">t4</text><rect x="250" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="263" y="26" text-anchor="middle" font-size="9">t5</text><rect x="280" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="293" y="26" text-anchor="middle" font-size="9">t6</text><rect x="310" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="323" y="26" text-anchor="middle" font-size="9">t7</text><rect x="340" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="353" y="26" text-anchor="middle" font-size="9">t8</text><rect x="370" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="383" y="26" text-anchor="middle" font-size="9">t9</text><rect x="400" y="10" width="26" height="24" rx="4" class="fb sb"/><text x="413" y="26" text-anchor="middle" font-size="9">t10</text><text x="440" y="26" font-size="10" class="tm">unbounded → overflows</text><text x="10" y="63" font-size="11" font-weight="bold">Window k=3</text><rect x="130" y="46" width="26" height="24" rx="4" class="fs" opacity=".35"/><text x="143" y="62" text-anchor="middle" font-size="9" opacity=".35">t1</text><rect x="160" y="46" width="26" height="24" rx="4" class="fs" opacity=".35"/><text x="173" y="62" text-anchor="middle" font-size="9" opacity=".35">t2</text><rect x="190" y="46" width="26" height="24" rx="4" class="fs" opacity=".35"/><text x="203" y="62" text-anchor="middle" font-size="9" opacity=".35">t3</text><rect x="220" y="46" width="26" height="24" rx="4" class="fs" opacity=".35"/><text x="233" y="62" text-anchor="middle" font-size="9" opacity=".35">t4</text><rect x="250" y="46" width="26" height="24" rx="4" class="fs" opacity=".35"/><text x="263" y="62" text-anchor="middle" font-size="9" opacity=".35">t5</text><rect x="280" y="46" width="26" height="24" rx="4" class="fs" opacity=".35"/><text x="293" y="62" text-anchor="middle" font-size="9" opacity=".35">t6</text><rect x="310" y="46" width="26" height="24" rx="4" class="fs" opacity=".35"/><text x="323" y="62" text-anchor="middle" font-size="9" opacity=".35">t7</text><rect x="340" y="46" width="26" height="24" rx="4" class="fb sb"/><text x="353" y="62" text-anchor="middle" font-size="9">t8</text><rect x="370" y="46" width="26" height="24" rx="4" class="fb sb"/><text x="383" y="62" text-anchor="middle" font-size="9">t9</text><rect x="400" y="46" width="26" height="24" rx="4" class="fb sb"/><text x="413" y="62" text-anchor="middle" font-size="9">t10</text><text x="440" y="62" font-size="10" class="tm">bounded; forgets t1–t7</text><text x="10" y="99" font-size="11" font-weight="bold">Summary</text><rect x="130" y="82" width="296" height="24" rx="4" class="fv"/><text x="278" y="98" text-anchor="middle" font-size="10">summary t1–t10</text><text x="440" y="98" font-size="10" class="tm">small + 1 summary call</text><text x="10" y="135" font-size="11" font-weight="bold">Summary+buffer</text><rect x="130" y="118" width="206" height="24" rx="4" class="fv"/><text x="233" y="134" text-anchor="middle" font-size="10">summary t1–t7</text><rect x="340" y="118" width="26" height="24" rx="4" class="fb sb"/><text x="353" y="134" text-anchor="middle" font-size="9">t8</text><rect x="370" y="118" width="26" height="24" rx="4" class="fb sb"/><text x="383" y="134" text-anchor="middle" font-size="9">t9</text><rect x="400" y="118" width="26" height="24" rx="4" class="fb sb"/><text x="413" y="134" text-anchor="middle" font-size="9">t10</text><text x="440" y="134" font-size="10" class="tm">recent verbatim + summary</text></svg><figcaption>What each strategy puts back into the prompt after 10 turns (blue = verbatim, violet = LLM-written summary, faded = dropped).</figcaption></figure>
  <p>Legacy class names (in brackets) are still interview vocabulary:</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>Keeps</th><th>Cost</th><th>Use</th></tr>
    <tr><td>Buffer <small>(ConversationBufferMemory)</small></td><td>Everything verbatim</td><td>Grows until the context overflows</td><td>Demos</td></tr>
    <tr><td>Window <small>(…BufferWindowMemory)</small></td><td>Last k turns</td><td>Bounded</td><td>Most chatbots</td></tr>
    <tr><td>Summary <small>(…SummaryMemory)</small></td><td>A running LLM summary</td><td>Small, plus a summary call</td><td>Long sessions</td></tr>
    <tr><td>Summary + buffer</td><td>Recent turns verbatim + summary of older</td><td>Controlled</td><td>Best balance</td></tr>
  </table>
  <p>Today: keep the message list yourself and trim it, or let a checkpointer own it (<code>create_agent</code> / LangGraph, keyed by <code>thread_id</code>).</p>
  <div class="fx" data-lang="py">from langchain_core.messages import trim_messages

recent = trim_messages(history, max_tokens=2000, token_counter=llm,
                       strategy="last", include_system=True, start_on="human")</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>History tokens are paid on every call. Ten 200-token turns add 2,000 input tokens to each message, forever. Always cap or summarise.</p>
  </div>

  <h2 id="lc-trace"><span class="num">08</span>Streaming, Callbacks, LangSmith</h2>
  <div class="cards">
    <div><b>Streaming</b><p><code>chain.stream()</code> yields tokens; <code>astream_events(..., version="v2")</code> yields events (token, tool start, retriever end) for a UI.</p></div>
    <div><b>Callbacks</b><p>Subclass <code>BaseCallbackHandler</code> (<code>on_llm_end</code>, <code>on_tool_start</code>, <code>on_chain_error</code>); pass <code>config={"callbacks": [handler]}</code>.</p><small>Logging, cost tracking</small></div>
    <div><b>LangSmith</b><p><code>LANGSMITH_TRACING=true</code> + <code>LANGSMITH_API_KEY</code>: every run traced with inputs, outputs, latency, tokens per step.</p><small>Old name <code>LANGCHAIN_TRACING_V2</code> still works</small></div>
  </div>
  <div class="callout intu"><span class="label">Why it matters</span>
    <p>A trace shows which step went wrong: bad retrieval or bad generation. LangSmith also stores datasets and runs evaluations; that workflow is 13 Evaluation &amp; Observability.</p>
  </div>

  <h2 id="lc-build"><span class="num">09</span>Build It: a RAG Chain</h2>
  <p>A shop-policy Q&amp;A bot: split, index in memory, retrieve the top 2 chunks, answer from them. Runs offline with a toy keyword embedding and a fake model; swap the two marked lines for real ones.</p>
<figure class="viz"><svg viewBox="0 0 600 162" width="600"><defs><marker id="lc-a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="10" y="91">question</text><path d="M76,87 H86 V37 H98" fill="none" stroke="currentColor" marker-end="url(#lc-a4)"/><path d="M86,87 V137 H98" fill="none" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="100" y="20" width="100" height="34" rx="6" class="ft st"/><text x="150" y="41" text-anchor="middle" font-weight="bold">retriever</text><rect x="215" y="20" width="110" height="34" rx="6" class="ft st"/><text x="270" y="41" text-anchor="middle" font-weight="bold">format_docs</text><line x1="200" y1="37" x2="213" y2="37" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="100" y="120" width="225" height="34" rx="6" class="fs"/><text x="212.5" y="141" text-anchor="middle" font-weight="bold">RunnablePassthrough()</text><text x="150" y="70" text-anchor="middle" font-size="10" class="tm">k=2 Documents</text><text x="270" y="70" text-anchor="middle" font-size="10" class="tm">→ one string</text><rect x="345" y="20" width="80" height="134" rx="6" class="fv"/><text x="385" y="41" text-anchor="middle" font-size="11">context</text><text x="385" y="91" text-anchor="middle" font-weight="bold">dict</text><text x="385" y="141" text-anchor="middle" font-size="11">question</text><line x1="325" y1="37" x2="343" y2="37" stroke="currentColor" marker-end="url(#lc-a4)"/><line x1="325" y1="137" x2="343" y2="137" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="445" y="66" width="145" height="42" rx="6" class="fb sb"/><text x="517.5" y="85" text-anchor="middle" font-weight="bold">prompt|llm|parser</text><text x="517.5" y="99" text-anchor="middle" font-size="10" class="tm">→ answer str</text><line x1="425" y1="87" x2="443" y2="87" stroke="currentColor" marker-end="url(#lc-a4)"/></svg><figcaption>The dict is a RunnableParallel: the same question goes to the retriever and, unchanged, into the prompt's {question} slot.</figcaption></figure>
  <div class="fx" data-lang="py"># pip install langchain-core langchain-text-splitters langchain-anthropic
import math, re
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Toy embeddings so this runs offline (use a real Embeddings class in production)
VOCAB = ["refund", "days", "return", "shipping", "free", "order", "warranty", "laptop", "year"]
class KeywordEmbeddings(Embeddings):
    def _vec(self, text):
        words = re.findall(r"[a-z]+", text.lower())
        v = [sum(w.startswith(k) for w in words) for k in VOCAB]
        n = math.sqrt(sum(x * x for x in v)) or 1.0
        return [x / n for x in v]
    def embed_documents(self, texts):
        return [self._vec(t) for t in texts]
    def embed_query(self, text):
        return self._vec(text)

# 2. Load, split, index
policy = """Returns: you can return any item within 30 days of delivery.

Refunds: refunds reach your card 5-7 days after we receive the return.

Shipping: shipping is free on orders above 500.

Warranty: laptops carry a one-year warranty against defects."""
docs = [Document(page_content=policy, metadata={"source": "policy.md"})]
chunks = RecursiveCharacterTextSplitter(chunk_size=90, chunk_overlap=0).split_documents(docs)
store = InMemoryVectorStore.from_documents(chunks, KeywordEmbeddings())
retriever = store.as_retriever(search_kwargs={"k": 2})

# 3. Prompt + model
prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer only from the context. If it is not there, say you don't know.\\n\\n"
               "&lt;context&gt;\\n{context}\\n&lt;/context&gt;"),
    ("human", "{question}"),
])
def format_docs(docs):
    return "\\n\\n".join(d.page_content for d in docs)

# from langchain_anthropic import ChatAnthropic
# llm = ChatAnthropic(model="claude-opus-5-5", temperature=0)        # real model
from langchain_core.language_models.fake_chat_models import FakeListChatModel
llm = FakeListChatModel(responses=["Refunds reach your card 5-7 days after we receive the return."])

# 4. The chain: question fans out to retriever AND passes through
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

q = "How many days until my refund arrives?"
print(len(chunks), "chunks")
for d in retriever.invoke(q):
    print("-", d.page_content)
print(rag_chain.invoke(q))</div>
  <table class="tbl out"><caption>Result (real run; the last line is the fake model's scripted reply)</caption>
    <tr><th>output</th></tr>
    <tr><td>4 chunks</td></tr>
    <tr><td>- Refunds: refunds reach your card 5-7 days after we receive the return.</td></tr>
    <tr><td>- Returns: you can return any item within 30 days of delivery.</td></tr>
    <tr><td>Refunds reach your card 5-7 days after we receive the return.</td></tr>
  </table>
  <div class="callout pred"><span class="label">Try it</span>
    <p>Drop <code>RunnablePassthrough()</code> and pipe the retriever straight into the prompt. What breaks? (The prompt has no <code>question</code> key.) Then add <code>"sources"</code> to the dict so the answer can cite <code>metadata["source"]</code>.</p>
  </div>

  <h2 id="lc-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Runnable protocol and why does it matter?</summary><div class="qa-body">The shared interface (<code>invoke</code>, <code>stream</code>, <code>batch</code>, <code>ainvoke</code>) every component implements. <code>A | B</code> builds a <code>RunnableSequence</code> that calls A then feeds its output to B. Because every part speaks the same interface, they compose without glue, and streaming, batching and async propagate through the whole chain.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>chain.invoke({"question": "What is HNSW?"})</code> do for <code>prompt | llm | StrOutputParser()</code>?</summary><div class="qa-body">The prompt fills its template → <code>ChatPromptValue</code> (messages). The model sends them to the API → <code>AIMessage</code> with content and token usage. The parser pulls <code>.content</code> → a plain <code>str</code>. Three calls in sequence, no hidden state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do you need <code>RunnablePassthrough</code> in a RAG chain?</summary><div class="qa-body">The question must go two places: into the retriever and, unchanged, into the prompt's <code>{question}</code> slot. <code>{"context": retriever | format_docs, "question": RunnablePassthrough()}</code> forks it. Without the passthrough, the prompt never gets the question and fails on the missing key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>PydanticOutputParser</code> vs <code>with_structured_output</code>: which and why?</summary><div class="qa-body">The parser adds format instructions and hopes the text is valid JSON, then validates it; it can fail on malformed output. <code>with_structured_output</code> uses the provider's native structured-output or tool schema, so the model is constrained to the shape. Prefer it whenever the model supports it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a tool's docstring matter so much?</summary><div class="qa-body">It becomes the tool description the model reads to decide whether to call it and how to fill the arguments. Say what it does, when to call it, argument formats and what it returns. A vague docstring means the wrong tool or wrong arguments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the modern replacement for <code>initialize_agent</code> / <code>AgentExecutor</code>, and what do you gain?</summary><div class="qa-body"><code>langchain.agents.create_agent</code> (or a hand-built LangGraph graph). It runs on LangGraph, so you get a checkpointer for memory and resume, interrupts for human approval, middleware for call limits, summarisation and fallbacks, and an inspectable state instead of a hidden loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare the four classic memory strategies.</summary><div class="qa-body">Buffer: all history; simple, but unbounded tokens. Window: last k turns; bounded, forgets early facts. Summary: running summary; cheap context, extra LLM call, loses detail. Summary + buffer: recent verbatim plus summary of older turns; the usual production balance. All of them just put text back into the prompt.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make a chain resilient to provider errors?</summary><div class="qa-body"><code>llm.with_retry(stop_after_attempt=3)</code> for transient failures, <code>with_fallbacks([other_model])</code> for outages, <code>timeout</code> and <code>max_retries</code> on the model, and <code>batch(..., config={"max_concurrency": n})</code> to stay under rate limits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your RAG chain gives wrong answers. How does LangSmith help?</summary><div class="qa-body">The trace shows each step's input and output. If the retrieved chunks lack the answer, fix retrieval (chunking, k, hybrid search). If they contain it but the answer is wrong, fix the prompt or model. Then save failing cases into a dataset to regression-test the fix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use LangChain?</summary><div class="qa-body">For a single call or a small fixed workflow (use the SDK), on latency-critical paths, or when the team spends more time on framework internals than on model behaviour. Use LangGraph instead when you need explicit state, branching, approval and resume.</div></details>
</main>`
});
