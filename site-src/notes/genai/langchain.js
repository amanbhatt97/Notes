// notes/genai/langchain.js — LangChain
Object.assign(TOPIC_CONTENT, {
  "langchain": `<main>
  <h1>LangChain</h1>
  <p class="lead">LangChain is standard plumbing for LLM apps: one interface for models, prompts, output parsers, retrievers and tools, joined with a pipe <code>|</code>. Nothing in it is magic; each part replaces a few lines you would otherwise write by hand. You should know the raw API (05), RAG (07, where we built one by hand) and the agent loop (08–09); here you see what the framework saves you. Every snippet below was run on langchain-core 1.6 with a scripted fake model, so outputs are real; replies from a live model are marked as examples. 11 LangGraph builds on it for stateful agents.</p>

  <h2 id="lc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">LangChain</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What it gives you</div>
        <ul>
          <li><b>Standard interfaces</b> for models, prompts, parsers, retrievers, tools; swap in one line</li>
          <li><b>Pain it removes</b> — each provider SDK has a different request/response shape</li>
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
          <li><b>Fake models</b> — <code>FakeListChatModel</code>, <code>GenericFakeChatModel</code> for offline tests</li>
          <li><b><code>ChatPromptTemplate.from_messages</code></b> — named slots; <code>MessagesPlaceholder("history")</code></li>
          <li><b><code>.partial(role=...)</code></b> — fill some slots now</li>
          <li>⚠ <code>PromptTemplate</code> → one string; chat models want <code>ChatPromptTemplate</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LCEL &amp; Runnables</div>
        <ul>
          <li><b>Runnable</b> — <code>invoke · stream · batch · ainvoke</code>; everything implements it</li>
          <li><b>The pipe is just <code>__or__</code></b> — a 6-line <code>Step</code> class rebuilds the idea</li>
          <li><b><code>prompt | llm | parser</code></b> → RunnableSequence: dict → ChatPromptValue → AIMessage → str</li>
          <li><b>RunnableParallel</b> (or a dict) — fan one input out, get a dict</li>
          <li><b>RunnablePassthrough</b> — carry input unchanged (question past the retriever)</li>
          <li><b>RunnableLambda</b> — wrap any function</li>
          <li><b>Reliability</b> — <code>.with_retry()</code>, <code>.with_fallbacks([...])</code>, <code>max_concurrency</code></li>
          <li>⚠ Type mismatches fail only at runtime → add parser/lambda</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Parsers &amp; structured output</div>
        <ul>
          <li><b>StrOutputParser</b> → str; <b>JsonOutputParser</b> → dict (strips <code>json</code> fences)</li>
          <li><b>PydanticOutputParser</b> — old: 655 chars of format instructions + validate text</li>
          <li><b><code>with_structured_output(Model, method="json_schema")</code></b> — native schema → typed object</li>
          <li>⚠ default <code>function_calling</code> forces a tool → rejected on claude-opus-5-5</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Documents &amp; retrievers</div>
        <ul>
          <li><b>Document</b> — <code>page_content</code> + <code>metadata</code></li>
          <li><b>Loaders</b> — 100+; <code>lazy_load()</code> for big sources</li>
          <li><b>RecursiveCharacterTextSplitter</b> — paragraphs → lines → spaces</li>
          <li><b>Embeddings</b> — implement <code>embed_documents</code> + <code>embed_query</code></li>
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
          <li><b>Run trace</b> — Human → AI(tool_call) → Tool("7") → AI(answer)</li>
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
          <li>⚠ Window of 4 forgot "My name is Aman" → summary for old facts</li>
          <li>⚠ History tokens are paid on every call → cap or summarise</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Observe &amp; build</div>
        <ul>
          <li><b>Streaming</b> — <code>stream()</code> yields pieces; <code>astream_events(version="v2")</code> for UIs</li>
          <li><b>Callbacks</b> — <code>BaseCallbackHandler</code>: on_chat_model_start, on_llm_end, on_tool_start…</li>
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
      <div class="rm-item rm-done" data-target="lc-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Legacy APIs, types, runaway history</span></div></div>
      <div class="rm-item rm-done" data-target="lc-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="lc-why"><span class="num">01</span>What It Gives You</h2>
  <p>Build two or three LLM apps by hand and you notice you keep writing the same glue. Fill a prompt with variables. Call the model. Pull the text out of the response. Parse JSON from it. Keep chat history. Chunk documents and search them. Let the model call tools. Worse, every provider shapes these things differently, so switching providers means rewriting the glue.</p>
  <p>Here is the same one-line question in two provider SDKs. Not run (needs API keys); look at the shapes.</p>
  <div class="fx" data-lang="py"># Anthropic SDK
import anthropic
r = anthropic.Anthropic().messages.create(
    model="claude-opus-5-5", max_tokens=200, system="Be concise.",
    messages=[{"role": "user", "content": "What is HNSW?"}])
text = r.content[0].text

# OpenAI SDK
from openai import OpenAI
r = OpenAI().chat.completions.create(
    model="gpt-4o", messages=[{"role": "system", "content": "Be concise."},
                              {"role": "user", "content": "What is HNSW?"}])
text = r.choices[0].message.content</div>
  <p>Same intent, different details: the system prompt is a separate argument in one and a message in the other; the text sits at <code>r.content[0].text</code> versus <code>r.choices[0].message.content</code>. Multiply this by tools, streaming and token counts, and your code fills with provider-specific branches.</p>
  <p>LangChain's idea: define <strong>one standard interface</strong> for each kind of part (chat model, prompt, parser, retriever, tool), write an adapter per provider once, and let every part connect to every other part.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Standard plumbing fittings. Any tap fits any pipe from any shop. The fittings don't make the water (the LLM's answers) any cleaner; they just stop you from cutting a custom joint for every project.</p>
  </div>
  <p>It does <strong>not</strong> make models smarter or agents more reliable. Hallucination and bad prompts are still your problem.</p>
<figure class="viz"><svg viewBox="0 0 600 168" width="600"><rect x="20" y="20" width="350" height="40" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity=".5"/><text x="195" y="38" text-anchor="middle" font-weight="bold">langchain-classic (legacy)</text><text x="195" y="52" text-anchor="middle" font-size="10" class="tm">LLMChain · AgentExecutor · ConversationBufferMemory</text><rect x="380" y="20" width="200" height="40" rx="6" class="fg sg"/><text x="480" y="38" text-anchor="middle" font-weight="bold">langchain</text><text x="480" y="52" text-anchor="middle" font-size="10" class="tm">create_agent + middleware</text><rect x="20" y="70" width="170" height="40" rx="6" class="ft st"/><text x="105" y="88" text-anchor="middle" font-weight="bold">langchain-anthropic</text><text x="105" y="102" text-anchor="middle" font-size="10" class="tm">-openai … per provider</text><rect x="200" y="70" width="170" height="40" rx="6" class="ft st"/><text x="285" y="88" text-anchor="middle" font-weight="bold">text-splitters</text><text x="285" y="102" text-anchor="middle" font-size="10" class="tm">chunkers</text><rect x="380" y="70" width="200" height="40" rx="6" class="fv"/><text x="480" y="88" text-anchor="middle" font-weight="bold">langgraph</text><text x="480" y="102" text-anchor="middle" font-size="10" class="tm">stateful agent runtime</text><rect x="20" y="120" width="560" height="40" rx="6" class="fb sb"/><text x="300" y="138" text-anchor="middle" font-weight="bold">langchain-core</text><text x="300" y="152" text-anchor="middle" font-size="10" class="tm">interfaces: messages · prompts · Runnables · parsers · tools · vector-store base</text></svg><figcaption>Everything sits on langchain-core's interfaces. Integrations are separate packages; create_agent runs on LangGraph; old classes moved to langchain-classic.</figcaption></figure>
  <p>Read the diagram bottom-up. <code>langchain-core</code> holds the interfaces and is small. Each provider has its own package (<code>langchain-anthropic</code>), so you install only what you use. <code>langchain</code> itself now mostly provides <code>create_agent</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Old tutorials use <code>LLMChain</code>, <code>initialize_agent</code>, <code>AgentExecutor</code> and <code>ConversationBufferMemory</code>. Since LangChain 1.0 these live in <code>langchain-classic</code>. New code uses LCEL, <code>create_agent</code>, and LangGraph checkpointers. Interviewers still ask what they were.</p>
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
  <p>Start with the two parts every app has: a model and a prompt. In LangChain every chat model class has the same methods and returns the same message objects, whatever the provider. Swap <code>ChatAnthropic</code> for <code>ChatOpenAI</code> and the rest of the code doesn't change. Setting one up (not run here; needs a key):</p>
  <div class="fx" data-lang="py">from langchain_anthropic import ChatAnthropic   # pip install langchain-anthropic

llm = ChatAnthropic(model="claude-opus-5-5", max_tokens=1024,
                    timeout=30, max_retries=3)   # key from ANTHROPIC_API_KEY
msg = llm.invoke("Explain HNSW in one line.")</div>
  <p><code>timeout</code> and <code>max_retries</code> handle slow or flaky API calls for you. <code>invoke</code> sends the request and returns an <strong><code>AIMessage</code></strong>: an object with <code>.content</code> (the text), <code>.usage_metadata</code> (token counts) and <code>.tool_calls</code> (requests to run tools, empty if none).</p>
  <p>To learn and test without a key, LangChain ships <strong>fake models</strong> that return replies you script in advance. They have exactly the same interface, so code written against them works unchanged with a real model.</p>
  <div class="fx" data-lang="py">from langchain_core.language_models.fake_chat_models import FakeListChatModel
llm = FakeListChatModel(responses=["7 x 8 = 56."])
msg = llm.invoke("What is 7 x 8?")
print(type(msg).__name__)
print(repr(msg.content))
print(msg.tool_calls)
print(msg.usage_metadata)</div>
  <div class="fx" data-lang="text">AIMessage
'7 x 8 = 56.'
[]
None</div>
  <p>Same <code>AIMessage</code> type a real model returns. <code>usage_metadata</code> is <code>None</code> because the fake model counts no tokens; a real one gives <code>{"input_tokens": ..., "output_tokens": ...}</code>.</p>
  <h3>Prompt templates</h3>
  <p>Hard-coding prompts with f-strings gets messy once a prompt has a system part, chat history and a question. A <strong>prompt template</strong> is a reusable prompt with named slots in <code>{braces}</code>. <code>MessagesPlaceholder</code> is a slot for a whole list of messages, such as chat history. The code builds a template, fills it, and prints the messages it produces.</p>
  <div class="fx" data-lang="py">from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a {role}. Be concise."),
    MessagesPlaceholder("history"),
    ("human", "{question}"),
])
print(prompt.input_variables)

value = prompt.invoke({
    "role": "maths tutor",
    "history": [("human", "Hi, I am Riya."), ("ai", "Hello Riya!")],
    "question": "What is 7 x 8?",
})
for m in value.to_messages():
    print(type(m).__name__, "|", m.content)

tutor = prompt.partial(role="tutor")
print(tutor.input_variables)</div>
  <div class="fx" data-lang="text">['history', 'question', 'role']
SystemMessage | You are a maths tutor. Be concise.
HumanMessage | Hi, I am Riya.
AIMessage | Hello Riya!
HumanMessage | What is 7 x 8?
['history', 'question']</div>
  <p><code>input_variables</code> lists the slots the template found. <code>prompt.invoke</code> fills them and returns a <code>ChatPromptValue</code>; <code>to_messages()</code> shows the four messages the model will receive, with the two history messages spliced in where the placeholder was. <code>partial(role="tutor")</code> fills one slot now and returns a new template that needs only the other two.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A printed bank form with blanks: name, account number, amount. The form (template) is designed once; each customer fills only the blanks. <code>partial</code> is a form where the branch has already stamped its own name.</p>
  </div>
  <p>Also available: <code>FewShotChatMessagePromptTemplate</code> to insert example pairs (few-shot itself is in <a class="xref" data-note="prompting">Prompt Engineering</a>).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>PromptTemplate</code> outputs one string; <code>ChatPromptTemplate</code> outputs a list of messages with roles. For chat models, use the chat version, or the system prompt ends up as plain user text.</p>
  </div>

  <h2 id="lc-lcel"><span class="num">03</span>LCEL &amp; Runnables</h2>
  <p>Every LLM call is a small pipeline: fill the prompt, call the model, clean the output. Written by hand that is three nested calls, <code>parse(model(fill(x)))</code>, and adding a step means editing the nesting. LangChain lets you write it left to right as <code>fill | model | parse</code>, like a Unix pipe. This is <strong>LCEL</strong>, the LangChain Expression Language.</p>
  <p>It is less magic than it looks. Python lets a class decide what <code>a | b</code> means by defining <code>__or__</code>. The six-line class below rebuilds the whole idea in plain Python: <code>a | b</code> returns a new step that runs <code>a</code>, then feeds the result to <code>b</code>.</p>
  <div class="fx" data-lang="py">class Step:
    def __init__(self, fn):
        self.fn = fn
    def invoke(self, x):
        return self.fn(x)
    def __or__(self, other):                     # a | b  -&gt;  a new Step
        return Step(lambda x: other.invoke(self.invoke(x)))

fill  = Step(lambda d: f"Translate to Hindi: {d['text']}")
model = Step(lambda p: {"content": "namaste", "prompt_was": p})   # pretend LLM
parse = Step(lambda m: m["content"])

chain = fill | model | parse
print(chain.invoke({"text": "hello"}))</div>
  <div class="fx" data-lang="text">namaste</div>
  <p>Trace <code>chain.invoke({"text": "hello"})</code>: <code>fill</code> turns the dict into the string "Translate to Hindi: hello"; <code>model</code> turns that into a dict with <code>content</code>; <code>parse</code> picks out "namaste". Each step knows only its own input and output. LangChain's real version adds streaming, batching, async and tracing to every step.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>Runnable</strong> is anything with <code>invoke</code>, <code>stream</code>, <code>batch</code> and async <code>ainvoke</code>. <strong>LCEL</strong> joins Runnables with <code>|</code>: the output of the left becomes the input of the right. The result, a <code>RunnableSequence</code>, is itself a Runnable.</p>
  </div>
<figure class="viz"><svg viewBox="0 0 600 128" width="600"><defs><marker id="lc-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="14" y="64">dict</text><line x1="50" y1="60" x2="88" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><rect x="90" y="40" width="100" height="40" rx="6" class="ft st"/><text x="140" y="64" text-anchor="middle" font-weight="bold">prompt</text><rect x="250" y="40" width="100" height="40" rx="6" class="fb sb"/><text x="300" y="64" text-anchor="middle" font-weight="bold">llm</text><rect x="410" y="40" width="100" height="40" rx="6" class="fg sg"/><text x="460" y="64" text-anchor="middle" font-weight="bold">parser</text><line x1="190" y1="60" x2="248" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="219" y="30" text-anchor="middle" font-size="10" class="tm">ChatPromptValue</text><line x1="350" y1="60" x2="408" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="379" y="30" text-anchor="middle" font-size="10" class="tm">AIMessage</text><line x1="510" y1="60" x2="548" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="552" y="64">str</text><path d="M90,92 V100 H510 V92" fill="none" stroke="currentColor" stroke-opacity=".5"/><text x="300" y="118" text-anchor="middle" font-size="11">RunnableSequence = a Runnable too: invoke · stream · batch · ainvoke</text></svg><figcaption>Each | hands the left output to the right. The types change at every step; the whole chain inherits streaming, batching and async.</figcaption></figure>
  <p>Now the real thing. The code builds <code>prompt | llm | StrOutputParser()</code> with a fake model, then calls it three ways.</p>
  <div class="fx" data-lang="py">from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.language_models.fake_chat_models import FakeListChatModel

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a {role}. Be concise."),
    ("human", "{question}"),
])
llm = FakeListChatModel(responses=["HNSW is a graph index for fast vector search.",
                                   "BM25 scores keyword matches.",
                                   "RRF merges ranked lists."])
chain = prompt | llm | StrOutputParser()
print(type(chain).__name__)

print(chain.invoke({"role": "tutor", "question": "What is HNSW?"}))

pieces = list(chain.stream({"role": "tutor", "question": "What is BM25?"}))
print(pieces[:5], len(pieces))

print(chain.batch([{"role": "tutor", "question": q} for q in ["RRF?", "HNSW?"]],
                  config={"max_concurrency": 1}))</div>
  <div class="fx" data-lang="text">RunnableSequence
HNSW is a graph index for fast vector search.
['B', 'M', '2', '5', ' '] 28
['RRF merges ranked lists.', 'HNSW is a graph index for fast vector search.']</div>
  <p><code>invoke</code> ran all three steps once and returned a plain string, because <code>StrOutputParser</code> pulled <code>.content</code> out of the <code>AIMessage</code>. <code>stream</code> yielded the answer in 28 small pieces (the fake model streams one character at a time; a real model streams a few tokens at a time), and the parser passed each piece straight through. That is how chat UIs show text appearing word by word. <code>batch</code> ran a list of inputs; <code>max_concurrency</code> caps parallel calls so you stay under rate limits. The fake model simply returns its scripted replies in order, cycling back to the first.</p>
  <h3>The helper Runnables</h3>
  <ul>
    <li><strong><code>RunnableParallel</code></strong> (or a plain dict inside a chain): send one input to several Runnables at once; get a dict back.</li>
    <li><strong><code>RunnablePassthrough</code></strong>: pass the input through unchanged. In RAG it carries the question past the retriever.</li>
    <li><strong><code>RunnableLambda</code></strong>: wrap any Python function so it fits in a chain.</li>
  </ul>
  <div class="fx" data-lang="py">from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda

fan_out = RunnableParallel(upper=RunnableLambda(str.upper), length=RunnableLambda(len))
print(fan_out.invoke("hello"))

# a plain dict inside a chain means the same thing
step = {"question": RunnablePassthrough(), "words": RunnableLambda(lambda s: s.split())}
chain = RunnableLambda(str.strip) | step
print(chain.invoke("  where is my order  "))</div>
  <div class="fx" data-lang="text">{'upper': 'HELLO', 'length': 5}
{'question': 'where is my order', 'words': ['where', 'is', 'my', 'order']}</div>
  <p>The first call sent "hello" to both branches. In the second, the dict after <code>|</code> was turned into a <code>RunnableParallel</code> automatically: the stripped string went unchanged into <code>question</code> and split into <code>words</code>. This exact shape is the heart of the RAG chain in section 09.</p>
  <h3>Reliability wrappers</h3>
  <p>APIs time out and providers go down. Instead of writing retry loops, wrap any Runnable. The code simulates a step that fails twice, and a main model that is down.</p>
  <div class="fx" data-lang="py">from langchain_core.runnables import RunnableLambda

calls = {"n": 0}
def flaky(x):
    calls["n"] += 1
    if calls["n"] &lt; 3:
        raise TimeoutError(f"attempt {calls['n']} timed out")
    return f"ok on attempt {calls['n']}"

safe = RunnableLambda(flaky).with_retry(stop_after_attempt=3, wait_exponential_jitter=False)
print(safe.invoke("hi"))

def main_model(x):
    raise ConnectionError("provider down")
backup = RunnableLambda(lambda x: f"backup answered: {x}")
robust = RunnableLambda(main_model).with_fallbacks([backup])
print(robust.invoke("hi"))</div>
  <div class="fx" data-lang="text">ok on attempt 3
backup answered: hi</div>
  <p><code>with_retry</code> silently re-ran <code>flaky</code> after two <code>TimeoutError</code>s. <code>with_fallbacks</code> caught the <code>ConnectionError</code> and sent the same input to <code>backup</code>. With real models you would write <code>llm.with_fallbacks([ChatAnthropic(model="claude-sonnet-5-5")])</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A dabbawala relay. Each person only knows "take the tiffin from the last person, hand it to the next". If one train is cancelled, there is a backup route (fallback); if a handover fails, try again (retry).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>LCEL type mismatches fail only at runtime, often with a confusing error. If the next step expects a string and gets an <code>AIMessage</code>, add a parser or <code>RunnableLambda</code> between them.</p>
  </div>

  <h2 id="lc-parse"><span class="num">04</span>Parsers &amp; Structured Output</h2>
  <p>Models return text. Your program wants data: a string to show, a dict to store, a typed object to branch on ("if ticket.urgent: page someone"). Turning model text into data is called <strong>parsing</strong>, and it fails in boring ways: the model wraps JSON in a <code>json</code> code fence, adds "Sure! Here it is:", or forgets a field. Output parsers handle the common cases.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A clerk who receives handwritten letters and types the details into the bank's system. A sloppy letter with a greeting and doodles still gets the right account number into the right box. If the account number is missing, the clerk rejects the letter instead of guessing.</p>
  </div>
  <p>The code gives three parsers the same messy reply: a greeting, then JSON inside a code fence.</p>
  <div class="fx" data-lang="py">from langchain_core.messages import AIMessage
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser, PydanticOutputParser
from pydantic import BaseModel, Field

reply = AIMessage('Sure! Here it is:\\n\`\`\`json\\n{"category": "billing", "urgent": true}\\n\`\`\`')

print(repr(StrOutputParser().invoke(reply))[:40])
print(JsonOutputParser().invoke(reply))

class Ticket(BaseModel):
    category: str = Field(description="billing, shipping or other")
    urgent: bool

parser = PydanticOutputParser(pydantic_object=Ticket)
t = parser.invoke(reply)
print(type(t).__name__, t.category, t.urgent)
print(len(parser.get_format_instructions()), "characters of format instructions")

try:
    parser.invoke(AIMessage('{"category": "billing"}'))
except Exception as e:
    print(type(e).__name__)</div>
  <div class="fx" data-lang="text">'Sure! Here it is:\\n\`\`\`json\\n{"category"
{'category': 'billing', 'urgent': True}
Ticket billing True
655 characters of format instructions
OutputParserException</div>
  <p>What each did. <code>StrOutputParser</code> just returned the text, mess included. <code>JsonOutputParser</code> found the JSON inside the fence and returned a Python dict (note JSON <code>true</code> became Python <code>True</code>). <code>PydanticOutputParser</code> went further and built a <code>Ticket</code> object, checking types. <code>get_format_instructions()</code> is 655 characters of "please output JSON matching this schema" that you were expected to paste into the prompt. When a field is missing, it raises <code>OutputParserException</code> rather than returning half-filled data.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Returns</th><th>Use when</th></tr>
    <tr><td><code>StrOutputParser</code></td><td><code>str</code></td><td>Plain text answers</td></tr>
    <tr><td><code>JsonOutputParser</code></td><td><code>dict</code></td><td>You prompted for JSON; strips code fences</td></tr>
    <tr><td><code>PydanticOutputParser</code></td><td>Pydantic object</td><td>Old approach: injects format instructions, validates the text</td></tr>
    <tr><td><code>llm.with_structured_output(Model)</code></td><td>Pydantic object</td><td><strong>Default</strong>: uses the provider's native schema support</td></tr>
  </table>
  <h3>The modern way: native structured output</h3>
  <p>Parsers <em>hope</em> the model followed instructions, then check. Modern APIs can instead <em>constrain</em> generation to a JSON schema, so the output always fits (05 explains how). <code>with_structured_output</code> uses that. Not run here (needs a real model):</p>
  <div class="fx" data-lang="py">classify = llm.with_structured_output(Ticket, method="json_schema")
t = classify.invoke("My card was charged twice, fix it today!")
print(t)</div>
  <div class="fx" data-lang="text">Example output (not a real run):
category='billing' urgent=True</div>
  <p>No format instructions in the prompt, no "model forgot a brace" failures, and you get a typed <code>Ticket</code> back.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Output parser</strong>: a Runnable that turns a model message into a Python value. <strong>Structured output</strong>: asking the provider to generate output that conforms to a given schema, returned as a typed object.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The default <code>method="function_calling"</code> forces a tool call. <code>claude-opus-5-5</code> rejects forced tool choice, and langchain-anthropic warns about it. Pass <code>method="json_schema"</code>.</p>
  </div>

  <h2 id="lc-retr"><span class="num">05</span>Documents &amp; Retrievers</h2>
  <p>In the RAG note we wrote a chunker, an embedder, a cosine search and a top-k function by hand (<a class="xref" data-note="rag">Retrieval-Augmented Generation</a>). LangChain has a standard part for each, so you can swap a toy in-memory search for Pinecone or pgvector without touching the rest of the code.</p>
  <div class="flow"><span>Loader → Document</span><span>Splitter → chunks</span><span>Embeddings + VectorStore</span><span>Retriever</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library. The loader is the delivery van bringing books; the splitter cuts them into index cards; embeddings write each card's "subject code"; the vector store is the card cabinet; the retriever is the librarian you ask.</p>
  </div>
  <p>A <strong><code>Document</code></strong> is text (<code>page_content</code>) plus a dict of facts about it (<code>metadata</code>: source, page). Every loader returns a list of them. The splitter below is <strong><code>RecursiveCharacterTextSplitter</code></strong>: it tries to cut at blank lines (paragraphs) first, then single newlines, then spaces, so pieces stay as whole as possible under <code>chunk_size</code> characters.</p>
  <div class="fx" data-lang="py">from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

doc = Document(
    page_content=("Returns: you can return any item within 30 days of delivery.\\n\\n"
                  "Refunds: refunds reach your card 5-7 days after we receive the return. "
                  "Cash on delivery orders are refunded to your bank account."),
    metadata={"source": "policy.md"},
)
splitter = RecursiveCharacterTextSplitter(chunk_size=80, chunk_overlap=0)
chunks = splitter.split_documents([doc])
for c in chunks:
    print(len(c.page_content), c.metadata, "|", c.page_content)</div>
  <div class="fx" data-lang="text">60 {'source': 'policy.md'} | Returns: you can return any item within 30 days of delivery.
78 {'source': 'policy.md'} | Refunds: refunds reach your card 5-7 days after we receive the return. Cash on
50 {'source': 'policy.md'} | delivery orders are refunded to your bank account.</div>
  <p>The first paragraph fit in 80 characters, so it stayed whole. The second paragraph (128 characters) was too long, so the splitter fell back to spaces and cut "Cash on | delivery". Every chunk kept the <code>metadata</code>, so citations still work. That ugly cut is why you choose <code>chunk_size</code> from your real paragraphs and add <code>chunk_overlap</code>.</p>
  <h3>Embeddings, vector store, retriever</h3>
  <p>An <strong>Embeddings</strong> class needs only two methods: <code>embed_documents</code> (many texts) and <code>embed_query</code> (one question). Below is a toy that counts 9 keywords, so it runs offline; in production you'd use a real one such as <code>VoyageAIEmbeddings</code> or <code>OpenAIEmbeddings</code>.</p>
  <div class="fx" data-lang="py">import math, re
from langchain_core.embeddings import Embeddings
from langchain_core.vectorstores import InMemoryVectorStore

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

docs = [Document("Refunds reach your card 5-7 days after we receive the return.", metadata={"source": "refunds.md"}),
        Document("Shipping is free on orders above 500.", metadata={"source": "shipping.md"}),
        Document("Laptops carry a one-year warranty.", metadata={"source": "warranty.md"})]
store = InMemoryVectorStore.from_documents(docs, KeywordEmbeddings())
for d, s in store.similarity_search_with_score("Can I get a refund under the laptop warranty?", k=2):
    print(round(s, 3), d.metadata["source"], "|", d.page_content)
retriever = store.as_retriever(search_kwargs={"k": 1})
hits = retriever.invoke("Is shipping free?")
print(type(retriever).__name__, len(hits), hits[0].page_content)</div>
  <div class="fx" data-lang="text">0.667 warranty.md | Laptops carry a one-year warranty.
0.333 refunds.md | Refunds reach your card 5-7 days after we receive the return.
VectorStoreRetriever 1 Shipping is free on orders above 500.</div>
  <p><code>w.startswith(k)</code> lets "Refunds" count as "refund" and "Laptops" as "laptop", a cheap stand-in for stemming. <code>from_documents</code> embedded the three docs and stored them. The question shares two keywords with the warranty doc (laptop, warranty) and one with the refunds doc, hence 0.667 versus 0.333. <code>as_retriever</code> wraps the store as a Runnable: string in, list of <code>Document</code>s out, so it can sit in a chain.</p>
  <p>Loaders: 100+ in <code>langchain-community</code> (PDF, web, CSV, Notion…); use <code>lazy_load()</code> for big sources. Fancier retrievers from older tutorials (multi-query, contextual compression, ensemble/hybrid) now live in <code>langchain-classic</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A retriever returns <code>Document</code> objects, not text. Format them (join <code>page_content</code>) before they reach the prompt, or the model sees a Python repr full of <code>Document(id=..., metadata=...)</code>.</p>
  </div>

  <h2 id="lc-agents"><span class="num">06</span>Tools &amp; Agents</h2>
  <p>A model can only produce text. To check stock or issue a refund, it must ask your code to run a function. For that the model needs a description of each function: its name, what it does, and what arguments it takes, as a JSON schema. Writing those schemas by hand for every function is tedious and drifts out of date. The <code>@tool</code> decorator builds the schema from the function itself.</p>
  <div class="fx" data-lang="py">from langchain_core.tools import tool

@tool
def get_stock(sku: str) -&gt; int:
    """Return units in stock for a SKU like 'SKU-123'. Call when the user asks about availability."""
    return {"SKU-1": 7, "SKU-2": 0}.get(sku, 0)

print(get_stock.name)
print(get_stock.description)
print(get_stock.args)
print(get_stock.invoke({"sku": "SKU-1"}))</div>
  <div class="fx" data-lang="text">get_stock
Return units in stock for a SKU like 'SKU-123'. Call when the user asks about availability.
{'sku': {'title': 'Sku', 'type': 'string'}}
7</div>
  <p>The function name became the tool name, the docstring became the description the model reads, and the type hint <code>sku: str</code> became the argument schema. The tool is a Runnable too: <code>invoke</code> with a dict of arguments runs the function. <code>llm.bind_tools([get_stock])</code> sends these schemas with every request, so the model may <em>ask</em> for the tool. It does not run the loop.</p>
  <p>The loop (model asks → your code runs the tool → result goes back → model continues, until it answers) is the ReAct agent from 08. <strong><code>create_agent</code></strong> builds it for you as a LangGraph graph. Below, a scripted model first requests <code>get_stock</code>, then answers. The <code>ScriptedModel</code> subclass only exists because the fake model has no <code>bind_tools</code>; with <code>ChatAnthropic</code> you'd pass the real model.</p>
  <div class="fx" data-lang="py">from langchain_core.messages import AIMessage
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain.agents import create_agent
from langchain.agents.middleware import ToolCallLimitMiddleware
from langgraph.checkpoint.memory import InMemorySaver

class ScriptedModel(GenericFakeChatModel):
    def bind_tools(self, tools, **kwargs):      # the fake ignores tool schemas
        return self

llm = ScriptedModel(messages=iter([
    AIMessage("", tool_calls=[{"name": "get_stock", "args": {"sku": "SKU-1"}, "id": "call_1"}]),
    AIMessage("Yes, SKU-1 is in stock: 7 units."),
]))

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
for m in result["messages"]:
    print(type(m).__name__, "|", m.content or m.tool_calls)</div>
  <div class="fx" data-lang="text">HumanMessage | Is SKU-1 in stock?
AIMessage | [{'name': 'get_stock', 'args': {'sku': 'SKU-1'}, 'id': 'call_1', 'type': 'tool_call'}]
ToolMessage | 7
AIMessage | Yes, SKU-1 is in stock: 7 units.</div>
  <p>The four messages are the loop, step by step: the user asks; the model replies with a tool call instead of text; the agent ran <code>get_stock("SKU-1")</code> and appended the result as a <code>ToolMessage</code> linked by <code>id</code>; the model saw "7" and answered. <code>ToolCallLimitMiddleware(run_limit=10)</code> stops a model that keeps calling tools forever. <code>checkpointer</code> + <code>thread_id</code> keep this conversation's messages for the next turn.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop assistant who can't leave the counter. She writes "check godown: SKU-1" on a slip (tool call); a helper runs to the godown and returns "7" (tool result); she tells you "yes, 7 in stock". <code>create_agent</code> is the helper plus the rule "keep doing this until she answers".</p>
  </div>
  <p><strong>Middleware</strong> hooks into the loop: <code>HumanInTheLoopMiddleware(interrupt_on={"issue_refund": True})</code> pauses before a risky tool, <code>SummarizationMiddleware</code> compacts long histories, <code>ModelFallbackMiddleware</code> switches model on error.</p>
  <div class="callout intu"><span class="label">Old vs new</span>
    <p><code>initialize_agent</code> / <code>AgentExecutor</code> ran a hidden loop with an <code>agent_scratchpad</code> placeholder holding tool calls. <code>create_agent</code> keeps the tool history in graph state, so you can pause, inspect and resume it (11).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A vague docstring ("gets stock") means the model calls the wrong tool or passes "sku one". Say what it does, when to call it, and the argument format.</p>
  </div>

  <h2 id="lc-mem"><span class="num">07</span>Conversation Memory</h2>
  <p>Tell a chatbot "My name is Aman", then ask "What is my name?" in the next call. A raw API call answers "I don't know": the model keeps nothing between calls. Every request is a fresh start. So chat "memory" is simply this: <strong>your code stores past messages and sends them again with each new question.</strong></p>
  <p>The problem is growth. After 50 turns you are re-sending thousands of tokens every call, paying for them each time, until the context window overflows. Memory strategies are different rules for what to re-send.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor who forgets every patient the moment they leave. The clinic keeps a file. Send the whole file each visit (buffer), only the last few pages (window), a one-page case summary (summary), or the summary plus the last few pages (summary + buffer).</p>
  </div>
  <p>Window memory by hand, in plain Python: keep a list, send only the last 4 messages.</p>
  <div class="fx" data-lang="py">history = []                                    # the whole "memory"

def chat(user_text, fake_reply, window=4):
    history.append(("human", user_text))
    prompt_messages = history[-window:]         # window memory: last 4 messages only
    history.append(("ai", fake_reply))
    return prompt_messages

chat("My name is Aman.", "Hi Aman!")
chat("I live in Pune.", "Nice city.")
sent = chat("What is my name?", "...")
for m in sent:
    print(m)</div>
  <div class="fx" data-lang="text">('ai', 'Hi Aman!')
('human', 'I live in Pune.')
('ai', 'Nice city.')
('human', 'What is my name?')</div>
  <p>Trace: after two turns <code>history</code> holds 4 messages; the third question makes 5, and <code>history[-4:]</code> drops the oldest, "My name is Aman." The model now cannot answer. That is the window's trade-off: bounded cost, forgotten early facts. LangChain's <code>trim_messages</code> does the same with more care: it can count real tokens, always keep the system prompt, and make sure the kept history starts on a human message.</p>
  <div class="fx" data-lang="py">from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, trim_messages

history = [
    SystemMessage("You are a helpful assistant."),
    HumanMessage("My name is Aman."), AIMessage("Hi Aman!"),
    HumanMessage("I live in Pune."),  AIMessage("Nice city."),
    HumanMessage("What is my name?"),
]
recent = trim_messages(history, max_tokens=4, token_counter=len,   # len = count messages
                       strategy="last", include_system=True, start_on="human")
for m in recent:
    print(type(m).__name__, "|", m.content)</div>
  <div class="fx" data-lang="text">SystemMessage | You are a helpful assistant.
HumanMessage | I live in Pune.
AIMessage | Nice city.
HumanMessage | What is my name?</div>
  <p><code>token_counter=len</code> counts messages so the demo is easy to follow; in production pass <code>token_counter=llm</code> and <code>max_tokens=2000</code>. <code>strategy="last"</code> keeps the newest, <code>include_system=True</code> pins the system prompt, and <code>start_on="human"</code> dropped the dangling "Hi Aman!" so the history doesn't begin with an AI reply.</p>
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
  <div class="callout trap"><span class="label">Trap</span>
    <p>History tokens are paid on every call. Ten 200-token turns add 2,000 input tokens to each message, forever. Always cap or summarise.</p>
  </div>

  <h2 id="lc-trace"><span class="num">08</span>Streaming, Callbacks, LangSmith</h2>
  <p>A chain of five steps returns a wrong answer, or takes 9 seconds, or costs too much. Which step? With plain code you add print statements everywhere. LangChain gives every Runnable three ways to watch it: <strong>streaming</strong> (see output as it is produced), <strong>callbacks</strong> (your functions are called when each step starts and ends) and <strong>LangSmith</strong> (a hosted service that records every step).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tracking a Swiggy order. Streaming is watching the rider's dot move live. Callbacks are the SMS at each stage ("order picked up", "delivered"). LangSmith is the full order history the support team opens when something went wrong.</p>
  </div>
  <p>The code attaches a callback handler that prints when the model starts and ends, then streams the same chain.</p>
  <div class="fx" data-lang="py">from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.language_models.fake_chat_models import FakeListChatModel

class Logger(BaseCallbackHandler):
    def on_chat_model_start(self, serialized, messages, **kwargs):
        print("model start:", len(messages[0]), "messages")
    def on_llm_end(self, response, **kwargs):
        print("model end:", repr(response.generations[0][0].text))

prompt = ChatPromptTemplate.from_messages([("human", "{q}")])
llm = FakeListChatModel(responses=["Delhi"])
chain = prompt | llm | StrOutputParser()

print(chain.invoke({"q": "Capital of India?"}, config={"callbacks": [Logger()]}))

for piece in chain.stream({"q": "Capital of India?"}):
    print(repr(piece), end=" ")
print()</div>
  <div class="fx" data-lang="text">model start: 1 messages
model end: 'Delhi'
Delhi
'D' 'e' 'l' 'h' 'i'</div>
  <p>Passing <code>config={"callbacks": [Logger()]}</code> to the chain made LangChain call <code>on_chat_model_start</code> just before the model ran and <code>on_llm_end</code> just after, before the final answer printed. Real handlers log latency and token usage (from <code>response.llm_output</code> or the message's <code>usage_metadata</code>) to your monitoring. Other hooks include <code>on_tool_start</code>, <code>on_retriever_end</code> and <code>on_chain_error</code>. The stream loop printed the pieces as they arrived.</p>
  <div class="cards">
    <div><b>Streaming</b><p><code>chain.stream()</code> yields pieces; <code>astream_events(..., version="v2")</code> yields events (token, tool start, retriever end) for a UI.</p></div>
    <div><b>Callbacks</b><p>Subclass <code>BaseCallbackHandler</code>; pass <code>config={"callbacks": [handler]}</code>.</p><small>Logging, cost tracking</small></div>
    <div><b>LangSmith</b><p>Set <code>LANGSMITH_TRACING=true</code> + <code>LANGSMITH_API_KEY</code>: every run is traced with inputs, outputs, latency and tokens per step. No code change.</p><small>Old name <code>LANGCHAIN_TRACING_V2</code> still works</small></div>
  </div>
  <div class="callout intu"><span class="label">Why it matters</span>
    <p>A trace shows which step went wrong: bad retrieval or bad generation. In interviews, "how would you debug a RAG chain?" expects exactly this answer. LangSmith also stores datasets and runs evaluations; that workflow is in <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tracing sends prompts and outputs to a hosted service. If they contain customer data, check your data policy, mask fields, or self-host.</p>
  </div>

  <h2 id="lc-build"><span class="num">09</span>Build It: a RAG Chain</h2>
  <p>Now combine the parts into the same RAG we built by hand in 07, as a shop-policy Q&amp;A bot: split the policy, index it in memory, retrieve the top 2 chunks, format them into the prompt, answer. It reuses <code>KeywordEmbeddings</code> from section 05 and a fake model, so it runs offline; swap the two marked lines for real ones.</p>
  <p>The one new idea is the dict at the start of the chain. The question must go to <em>two</em> places: into the retriever (to find context) and, unchanged, into the prompt's <code>{question}</code> slot. A dict in a chain is a <code>RunnableParallel</code>, and <code>RunnablePassthrough()</code> is the "unchanged" branch.</p>
<figure class="viz"><svg viewBox="0 0 600 162" width="600"><defs><marker id="lc-a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="10" y="91">question</text><path d="M76,87 H86 V37 H98" fill="none" stroke="currentColor" marker-end="url(#lc-a4)"/><path d="M86,87 V137 H98" fill="none" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="100" y="20" width="100" height="34" rx="6" class="ft st"/><text x="150" y="41" text-anchor="middle" font-weight="bold">retriever</text><rect x="215" y="20" width="110" height="34" rx="6" class="ft st"/><text x="270" y="41" text-anchor="middle" font-weight="bold">format_docs</text><line x1="200" y1="37" x2="213" y2="37" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="100" y="120" width="225" height="34" rx="6" class="fs"/><text x="212.5" y="141" text-anchor="middle" font-weight="bold">RunnablePassthrough()</text><text x="150" y="70" text-anchor="middle" font-size="10" class="tm">k=2 Documents</text><text x="270" y="70" text-anchor="middle" font-size="10" class="tm">→ one string</text><rect x="345" y="20" width="80" height="134" rx="6" class="fv"/><text x="385" y="41" text-anchor="middle" font-size="11">context</text><text x="385" y="91" text-anchor="middle" font-weight="bold">dict</text><text x="385" y="141" text-anchor="middle" font-size="11">question</text><line x1="325" y1="37" x2="343" y2="37" stroke="currentColor" marker-end="url(#lc-a4)"/><line x1="325" y1="137" x2="343" y2="137" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="445" y="66" width="145" height="42" rx="6" class="fb sb"/><text x="517.5" y="85" text-anchor="middle" font-weight="bold">prompt|llm|parser</text><text x="517.5" y="99" text-anchor="middle" font-size="10" class="tm">→ answer str</text><line x1="425" y1="87" x2="443" y2="87" stroke="currentColor" marker-end="url(#lc-a4)"/></svg><figcaption>The dict is a RunnableParallel: the same question goes to the retriever and, unchanged, into the prompt's {question} slot.</figcaption></figure>
  <div class="fx" data-lang="py"># pip install langchain-core langchain-text-splitters langchain-anthropic
# (KeywordEmbeddings class from section 05 is defined above this code)
from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Load, split, index
policy = """Returns: you can return any item within 30 days of delivery.

Refunds: refunds reach your card 5-7 days after we receive the return.

Shipping: shipping is free on orders above 500.

Warranty: laptops carry a one-year warranty against defects."""
docs = [Document(page_content=policy, metadata={"source": "policy.md"})]
chunks = RecursiveCharacterTextSplitter(chunk_size=90, chunk_overlap=0).split_documents(docs)
store = InMemoryVectorStore.from_documents(chunks, KeywordEmbeddings())
retriever = store.as_retriever(search_kwargs={"k": 2})

# 2. Prompt + model
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

# 3. The chain: question fans out to retriever AND passes through
setup = {"context": retriever | format_docs, "question": RunnablePassthrough()}
rag_chain = setup | prompt | llm | StrOutputParser()

q = "How many days until my refund arrives?"
print(len(chunks), "chunks")
for d in retriever.invoke(q):
    print("-", d.page_content)
print((setup | prompt).invoke(q).to_messages()[0].content)
print(rag_chain.invoke(q))</div>
  <div class="fx" data-lang="text">4 chunks
- Refunds: refunds reach your card 5-7 days after we receive the return.
- Returns: you can return any item within 30 days of delivery.
Answer only from the context. If it is not there, say you don't know.

&lt;context&gt;
Refunds: refunds reach your card 5-7 days after we receive the return.

Returns: you can return any item within 30 days of delivery.
&lt;/context&gt;
Refunds reach your card 5-7 days after we receive the return.</div>
  <p>Read it in order. The splitter cut the policy at blank lines into 4 chunks, one per topic, because each paragraph fits in 90 characters. The retriever ranked the refunds chunk first (refund, days, return all match) and the returns chunk second. <code>(setup | prompt).invoke(q)</code> runs only the first half of the chain, so you can see the exact system message the model receives: <code>format_docs</code> joined the two <code>Document</code>s into plain text inside <code>&lt;context&gt;</code>. The last line is the fake model's scripted reply; a real model would write its own answer from that context.</p>
  <p>Compare with the hand-built version in <a class="xref" data-note="rag">Retrieval-Augmented Generation</a>: the steps are identical. What LangChain added is that the splitter, vector store, model and tracing are now swappable parts, and the whole chain streams and batches for free.</p>
  <div class="callout pred"><span class="label">Try it</span>
    <p>Drop <code>RunnablePassthrough()</code> and pipe the retriever straight into the prompt. What breaks? (The prompt has no <code>question</code> key, so it raises a missing-variable error.) Then add <code>"sources"</code> to the dict so the answer can cite <code>metadata["source"]</code>.</p>
  </div>

  <h2 id="lc-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: copying legacy tutorials</span>
    <p><code>LLMChain</code>, <code>initialize_agent</code>, <code>AgentExecutor</code>, <code>ConversationBufferMemory</code> are in <code>langchain-classic</code> since 1.0. Use LCEL, <code>create_agent</code> and checkpointers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong type between steps</span>
    <p>A step expecting <code>str</code> receives an <code>AIMessage</code> or a list of <code>Document</code>s. Add <code>StrOutputParser()</code> or a <code>RunnableLambda</code> (like <code>format_docs</code>) between them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting RunnablePassthrough</span>
    <p>In RAG the question must reach both the retriever and the prompt. Without the passthrough branch the prompt fails on a missing <code>question</code> key.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: prompting for JSON and hoping</span>
    <p>Prefer <code>with_structured_output(..., method="json_schema")</code>; parse-and-pray fails on missing fields and fences.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unbounded history</span>
    <p>Re-sending the whole conversation every call grows cost linearly and finally overflows the context. Trim or summarise.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: vague tool docstrings</span>
    <p>The docstring is the model's only guide to when and how to call the tool. Be specific about purpose and argument formats.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: using LangChain for one API call</span>
    <p>For a single call, the provider SDK is shorter and easier to debug. Add the framework when parts need to be swapped, traced or composed.</p>
  </div>

  <h2 id="lc-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Runnable protocol and why does it matter?</summary><div class="qa-body">The shared interface (<code>invoke</code>, <code>stream</code>, <code>batch</code>, <code>ainvoke</code>) every component implements. <code>A | B</code> builds a <code>RunnableSequence</code> that calls A then feeds its output to B. Because every part speaks the same interface, they compose without glue, and streaming, batching and async propagate through the whole chain.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does <code>a | b</code> work in Python, and how would you build it yourself?</summary><div class="qa-body">Python calls <code>a.__or__(b)</code>. Define <code>__or__</code> to return a new object whose <code>invoke(x)</code> is <code>b.invoke(a.invoke(x))</code>. That six-line class is the core of LCEL; LangChain adds streaming, batching, async and callbacks on top.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>chain.invoke({"question": "What is HNSW?"})</code> do for <code>prompt | llm | StrOutputParser()</code>?</summary><div class="qa-body">The prompt fills its template → <code>ChatPromptValue</code> (messages). The model sends them to the API → <code>AIMessage</code> with content and token usage. The parser pulls <code>.content</code> → a plain <code>str</code>. Three calls in sequence, no hidden state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do you need <code>RunnablePassthrough</code> in a RAG chain?</summary><div class="qa-body">The question must go two places: into the retriever and, unchanged, into the prompt's <code>{question}</code> slot. <code>{"context": retriever | format_docs, "question": RunnablePassthrough()}</code> forks it. Without the passthrough, the prompt never gets the question and fails on the missing key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>PydanticOutputParser</code> vs <code>with_structured_output</code>: which and why?</summary><div class="qa-body">The parser adds format instructions and hopes the text is valid JSON, then validates it; it can fail on malformed output (<code>OutputParserException</code>). <code>with_structured_output</code> uses the provider's native structured-output or tool schema, so the model is constrained to the shape. Prefer it whenever the model supports it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a tool's docstring matter so much?</summary><div class="qa-body">It becomes the tool description the model reads to decide whether to call it and how to fill the arguments. Say what it does, when to call it, argument formats and what it returns. A vague docstring means the wrong tool or wrong arguments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>bind_tools</code> vs <code>create_agent</code>?</summary><div class="qa-body"><code>bind_tools</code> only attaches tool schemas to the model, so its reply may contain tool calls; nothing executes them. <code>create_agent</code> builds the full loop: run the requested tools, append <code>ToolMessage</code>s, call the model again, repeat until it answers, with middleware and a checkpointer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the modern replacement for <code>initialize_agent</code> / <code>AgentExecutor</code>, and what do you gain?</summary><div class="qa-body"><code>langchain.agents.create_agent</code> (or a hand-built LangGraph graph). It runs on LangGraph, so you get a checkpointer for memory and resume, interrupts for human approval, middleware for call limits, summarisation and fallbacks, and an inspectable state instead of a hidden loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare the four classic memory strategies.</summary><div class="qa-body">Buffer: all history; simple, but unbounded tokens. Window: last k turns; bounded, forgets early facts. Summary: running summary; cheap context, extra LLM call, loses detail. Summary + buffer: recent verbatim plus summary of older turns; the usual production balance. All of them just put text back into the prompt.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A user says their name in turn 1; by turn 6 the bot has forgotten it. Why, and the fix?</summary><div class="qa-body">Window memory (or <code>trim_messages</code>) dropped the oldest messages. Fix with summary + buffer (keep a running summary that includes key facts), or store user facts separately (a LangGraph store) and inject them into the system prompt.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make a chain resilient to provider errors?</summary><div class="qa-body"><code>llm.with_retry(stop_after_attempt=3)</code> for transient failures, <code>with_fallbacks([other_model])</code> for outages, <code>timeout</code> and <code>max_retries</code> on the model, and <code>batch(..., config={"max_concurrency": n})</code> to stay under rate limits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your RAG chain gives wrong answers. How does LangSmith help?</summary><div class="qa-body">The trace shows each step's input and output. If the retrieved chunks lack the answer, fix retrieval (chunking, k, hybrid search). If they contain it but the answer is wrong, fix the prompt or model. Then save failing cases into a dataset to regression-test the fix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use LangChain?</summary><div class="qa-body">For a single call or a small fixed workflow (use the SDK), on latency-critical paths, or when the team spends more time on framework internals than on model behaviour. Use LangGraph instead when you need explicit state, branching, approval and resume.</div></details>
</main>`
});
