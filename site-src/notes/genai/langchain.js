// notes/genai/langchain.js — LangChain
Object.assign(TOPIC_CONTENT, {
  "langchain": `<main>
  <h1>LangChain</h1>
  <p class="lead">LangChain is standard plumbing for LLM apps: one interface for models, prompts, parsers, retrievers and tools, joined with a pipe. You should know the raw API (05), RAG (07) and the agent loop (08–09); here you see what the framework saves you. 11 LangGraph builds on it for stateful agents.</p>

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
      <div class="rm-item rm-done" data-target="lc-rev"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 9 lines</span></div></div>
      <div class="rm-item rm-done" data-target="lc-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="lc-why"><span class="num">01</span>What It Gives You</h2>
  <p>Every LLM app repeats the same plumbing: fill a prompt, call a model, parse the reply, keep history, fetch documents, run tools. LangChain gives each a <strong>standard interface</strong>, so parts snap together and swap with one line.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Standard pipe fittings. Any tap fits any pipe. LangChain doesn't make the water (the LLM) any cleaner; it just stops you cutting custom joints for every project.</p>
  </div>
  <p>It does <strong>not</strong> make models smarter or agents more reliable. Hallucination and bad prompts are still your problem.</p>
  <table class="tbl">
    <tr><th>Package</th><th>Holds</th></tr>
    <tr><td><code>langchain-core</code></td><td>Interfaces: messages, prompts, Runnables, parsers, tools, vector-store base</td></tr>
    <tr><td><code>langchain</code></td><td><code>create_agent</code> and agent middleware (built on LangGraph)</td></tr>
    <tr><td><code>langchain-anthropic</code>, <code>-openai</code>…</td><td>One package per provider integration</td></tr>
    <tr><td><code>langchain-text-splitters</code></td><td>Chunkers</td></tr>
    <tr><td><code>langchain-classic</code></td><td>Legacy: <code>LLMChain</code>, <code>AgentExecutor</code>, <code>ConversationBufferMemory</code>…</td></tr>
  </table>
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
  <p>Also available: <code>FewShotChatMessagePromptTemplate</code> to insert example pairs (few-shot itself is in 04).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>PromptTemplate</code> outputs one string; <code>ChatPromptTemplate</code> outputs a list of messages. For chat models, use the chat version.</p>
  </div>

  <h2 id="lc-lcel"><span class="num">03</span>LCEL &amp; Runnables</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>Runnable</strong> is anything with <code>invoke</code>, <code>stream</code>, <code>batch</code> and async <code>ainvoke</code>. <strong>LCEL</strong> (LangChain Expression Language) joins Runnables with <code>|</code>: the output of the left becomes the input of the right.</p>
  </div>
  <p>Prompts, models, parsers, retrievers and tools are all Runnables. So <code>prompt | llm | parser</code> builds a <code>RunnableSequence</code> that itself streams, batches and runs async, with no extra code.</p>
  <div class="flow"><span>dict</span><span>prompt → ChatPromptValue</span><span>llm → AIMessage</span><span>parser → str</span></div>
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
    <li><strong><code>RecursiveCharacterTextSplitter</code></strong>: tries <code>\\n\\n</code>, then <code>\\n</code>, then spaces, so paragraphs stay whole. Chunking strategy itself is in 07.</li>
    <li><strong>Vector stores</strong>: <code>InMemoryVectorStore</code> for demos; Chroma, pgvector, Pinecone etc. share the interface (06).</li>
    <li><strong>Retriever</strong>: <code>store.as_retriever(search_kwargs={"k": 4})</code>. Takes a string, returns documents, and is a Runnable.</li>
  </ul>
  <p>Fancier retrievers from older tutorials (multi-query, contextual compression, ensemble/hybrid) now live in <code>langchain-classic</code>; the techniques themselves are covered in 07.</p>
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
  <p>The classic strategies (legacy class names in brackets) are still the interview vocabulary:</p>
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
  <ul>
    <li><strong>Streaming:</strong> <code>chain.stream()</code> yields tokens; <code>astream_events(..., version="v2")</code> yields fine-grained events (token, tool start, retriever end) for a UI.</li>
    <li><strong>Callbacks:</strong> subclass <code>BaseCallbackHandler</code> (<code>on_llm_end</code>, <code>on_tool_start</code>, <code>on_chain_error</code>) and pass <code>config={"callbacks": [handler]}</code> for logging or cost tracking.</li>
    <li><strong>LangSmith:</strong> set <code>LANGSMITH_TRACING=true</code> and <code>LANGSMITH_API_KEY</code> and every run is traced: inputs, outputs, latency, tokens per step. Older env names <code>LANGCHAIN_TRACING_V2</code> still work.</li>
  </ul>
  <div class="callout intu"><span class="label">Why it matters</span>
    <p>A trace shows which step went wrong: bad retrieval or bad generation. LangSmith also stores datasets and runs evaluations; that workflow is 13 Evaluation &amp; Observability.</p>
  </div>

  <h2 id="lc-build"><span class="num">09</span>Build It: a RAG Chain</h2>
  <p>A shop-policy Q&amp;A bot: split a document, index it in memory, retrieve the top 2 chunks, answer with the context. It runs offline with a toy keyword embedding and a fake model; swap the two marked lines for real ones.</p>
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

  <h2 id="lc-rev"><span class="num">10</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>LangChain</strong> = standard interfaces for LLM parts; swap providers in one line. Plumbing, not intelligence.</li>
    <li><strong>Runnable</strong>: invoke / stream / batch / ainvoke. Everything implements it.</li>
    <li><strong>LCEL</strong>: <code>prompt | llm | parser</code> → RunnableSequence; streaming and async come free.</li>
    <li><strong>RunnableParallel + RunnablePassthrough</strong>: fan the question to the retriever while keeping it for the prompt.</li>
    <li><strong>Structured output</strong>: <code>with_structured_output(Model, method="json_schema")</code> beats prompt-and-parse.</li>
    <li><strong>RAG parts</strong>: Document → splitter → embeddings + vector store → retriever → format → prompt.</li>
    <li><strong>Agents</strong>: <code>@tool</code> + <code>create_agent</code> (+ middleware for limits and approval); not <code>AgentExecutor</code>.</li>
    <li><strong>Memory</strong> = history in the prompt; trim or summarise; checkpointer keyed by thread_id.</li>
    <li><strong>LangSmith</strong>: two env vars, full traces; skip LangChain for one-call apps.</li>
  </ol></div>

  <h2 id="lc-qa"><span class="num">11</span>Questions &amp; Answers</h2>
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
