// notes/genai/langchain.js — LangChain
Object.assign(TOPIC_CONTENT, {
  "langchain": `<main>
<h1>LangChain</h1>
  <div class="where"><span>Generative AI</span><span>Agents</span><span>LangChain</span></div>
  <p class="lead"><strong>LangChain</strong> is a Python library that gives every part of an LLM application (prompts, models, output parsers, retrievers, tools) the same standard interface, so the parts can be snapped together, swapped and monitored without rewriting the glue code between them. In <a class="xref" data-note="rag">Retrieval-Augmented Generation</a> we built Biteful's support assistant by hand: retrieve policy sections, format them, fill a prompt, call a model, clean the reply. That works, but every new feature repeats the same plumbing, and switching model provider means editing it all. This note rebuilds the same assistant with LangChain, one part at a time, answering the same customer: <em>"My order arrived 50 minutes late. Can I get my money back?"</em> (Biteful refunds orders more than 45 minutes late). Every block below really ran on langchain-core 1.7 and langchain 1.4. No paid API is called: the models are LangChain's own test fakes or a labelled stand-in that copies the best-matching source sentence, and everything else (retrieval, parsing, memory trimming, callbacks, retries, the agent loop) is the real library.</p>

  <h2 id="lc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">LangChain</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The core idea</div>
        <ul>
          <li>Every part is a <b>Runnable</b>: invoke · batch · stream · ainvoke</li>
          <li><code>a | b</code> calls <code>a.__or__(b)</code> → a RunnableSequence (LCEL)</li>
          <li>Wrappers (retry, fallback, callbacks) work on every part</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The parts</div>
        <ul>
          <li><b>Prompt template</b> → messages; <b>chat model</b> → AIMessage</li>
          <li><b>Output parser</b> → str / dict / validated object</li>
          <li><b>Retriever</b>: query → list of Documents</li>
          <li><b>Tool</b>: function + schema the model can request</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Wiring</div>
        <ul>
          <li><b>RunnableParallel</b> (a dict): one input, several branches</li>
          <li><b>RunnablePassthrough</b>: keep the input; <b>RunnableLambda</b>: any function</li>
          <li>Memory = your code re-sends trimmed history</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In production</div>
        <ul>
          <li>Callbacks and LangSmith traces</li>
          <li><code>with_retry</code>, <code>with_fallbacks</code></li>
          <li><code>create_agent</code> for tool loops (runs on LangGraph)</li>
          <li>Skip it for one call; use LangGraph for loops and pauses</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why LangChain Exists</span><span class="rm-sub">the glue every LLM feature repeats</span></div></div>
      <div class="rm-item rm-done" data-target="lc-lcel"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Runnables and the | Operator</span><span class="rm-sub">how parts snap together</span></div></div>
      <div class="rm-item rm-done" data-target="lc-prompt"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Prompt Templates</span><span class="rm-sub">reusable prompts with slots</span></div></div>
      <div class="rm-item rm-done" data-target="lc-models"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Chat Models</span><span class="rm-sub">one interface for every model, fakes included</span></div></div>
      <div class="rm-item rm-done" data-target="lc-parse"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Output Parsers and Structured Output</span><span class="rm-sub">turning text into checked data</span></div></div>
      <div class="rm-item rm-done" data-target="lc-retr"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Documents and Retrievers</span><span class="rm-sub">split, embed, store, search</span></div></div>
      <div class="rm-item rm-done" data-target="lc-parallel"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Parallel, Passthrough and Lambda</span><span class="rm-sub">the full RAG chain</span></div></div>
      <div class="rm-item rm-done" data-target="lc-mem"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Chat History</span><span class="rm-sub">what does "that" mean?</span></div></div>
      <div class="rm-item rm-done" data-target="lc-trace"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Callbacks and Tracing</span><span class="rm-sub">seeing inside a chain</span></div></div>
      <div class="rm-item rm-done" data-target="lc-fallback"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Retries and Fallbacks</span><span class="rm-sub">surviving timeouts, outages and bad output</span></div></div>
      <div class="rm-item rm-done" data-target="lc-agents"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Tools and create_agent</span><span class="rm-sub">the model calls your functions</span></div></div>
      <div class="rm-item rm-done" data-target="lc-when"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">When Not to Use LangChain</span><span class="rm-sub">overhead measured, alternatives</span></div></div>
      <div class="rm-item rm-done" data-target="lc-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">missing variables, braces, raw Documents</span></div></div>
      <div class="rm-item rm-done" data-target="lc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">parts, types, APIs, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="lc-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on LangChain</span></div></div>
    </div>
  </div>

  <h2 id="lc-why"><span class="num">01</span>Why LangChain Exists</h2>
  <p>Almost every LLM feature performs the same five jobs in a row: get some context, format it, fill a prompt, call a model, and turn the reply into something the program can use. Written by hand, each feature re-implements those jobs with its own error handling and logging. To see the cost, here are two Biteful features written by hand. The first answers the customer from the policy documents, using the 13 policy sections, the BM25 keyword search and the stand-in model from the RAG note. The second tags each support ticket with a topic and an "urgent" flag so it can be routed.</p>
  <div class="fx" data-lang="py">import json

chunks = make_chunks(DOCS)                     # Biteful's 13 policy sections (RAG note)
texts = [c["text"] for c in chunks]

# Feature 1: answer a customer from the policy (RAG), wired by hand
def answer_by_hand(question):
    scores = bm25(question, texts)                                           # 1 retrieve
    top = sorted(range(len(texts)), key=lambda i: -scores[i])[:2]
    sources = "\\n".join(f"[{n}] {texts[i]}" for n, i in enumerate(top, 1))  # 2 format
    prompt = ("You are Biteful's support assistant. Answer only from the sources "
              f"and cite like [1].\\n\\nSources:\\n{sources}\\n\\nQuestion: {question}")  # 3 fill prompt
    reply = fake_llm(prompt)                                                 # 4 call the model
    return reply.strip()                                                     # 5 clean the output

# Feature 2: tag the ticket, wired by hand again
def fake_tagger(prompt):                       # STAND-IN model with a scripted reply
    return 'Sure! {"topic": "refund", "urgent": true}'

def tag_by_hand(question):
    prompt = ("Classify this Biteful ticket. Reply with JSON keys topic, urgent.\\n\\n"
              f"Question: {question}")                                      # fill prompt (again)
    reply = fake_tagger(prompt)                                             # call model (again)
    try:                                                                    # parse (again, by hand)
        return json.loads(reply[reply.index("{"):])
    except ValueError:
        return {"topic": "other", "urgent": False}

print(answer_by_hand(QUESTION))
print(tag_by_hand(QUESTION))</div>
  <div class="fx" data-lang="text">If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]
{'topic': 'refund', 'urgent': True}</div>
  <p>Both work. The RAG answer quotes the 45-minute rule and cites source [1], and the tagger returns <code>{'topic': 'refund', 'urgent': True}</code>. But read the comments in the second function: "fill prompt (again)", "call model (again)", "parse (again, by hand)". The JSON parsing is a fragile hack that searches for the first <code>{</code> and silently falls back to "other" when anything goes wrong. Add retries, timeouts, logging, streaming and a second model provider, and every feature grows the same thirty lines of plumbing. Switching providers makes it worse, because each provider shapes things differently: the Anthropic API takes the system prompt as a separate argument and returns text in <code>r.content[0].text</code>, while OpenAI's puts the system prompt in a message and returns <code>r.choices[0].message.content</code>, so every piece of glue that touches the reply must change.</p>
  <p>LangChain's answer is to define <strong>one standard interface</strong> for each kind of part (chat model, prompt, parser, retriever, tool), write an adapter for each provider once, and make every part composable with every other part. Standard plumbing fittings are the right picture: any tap fits any pipe from any shop. The fittings do not make the water cleaner, just as LangChain does not make a model's answers any better; they stop you from cutting a custom joint for every job.</p>
  <p>The library is split into packages, and interviewers sometimes ask about the split. <code>langchain-core</code> is the small base that defines the interfaces (messages, prompts, Runnables, parsers, tools, retrievers) and the test fakes. Provider integrations live in their own packages, such as <code>langchain-anthropic</code> and <code>langchain-openai</code>, and text splitters in <code>langchain-text-splitters</code>. <code>langchain</code> itself now provides <code>create_agent</code> and middleware, built on <a class="xref" data-note="langgraph">LangGraph</a>. Older classes that fill many tutorials, such as <code>LLMChain</code>, <code>AgentExecutor</code> and <code>ConversationBufferMemory</code>, moved to <code>langchain-classic</code> in version 1.0; new code should not use them, but it helps to know what they did.</p>

  <h2 id="lc-lcel"><span class="num">02</span>Runnables and the | Operator</h2>
  <p>By hand, our pipeline was nested function calls: <code>clean(model(fill(retrieve(q))))</code>. Reading it means starting from the inside, and adding a step means editing the nesting. LangChain lets you write the steps left to right, like <code>fill | model | parse</code>. To see why that is legal Python, you need one fact: Python lets a class decide what <code>a | b</code> means by defining a method called <code>__or__</code>, so <code>a | b</code> simply calls <code>a.__or__(b)</code>. LangChain gives every part an <code>invoke(x)</code> method, and makes <code>a | b</code> return a new object whose <code>invoke(x)</code> is <code>b.invoke(a.invoke(x))</code>. That is the heart of the <strong>LangChain Expression Language</strong>, or <strong>LCEL</strong>. Here it is first in eight lines of plain Python, then with LangChain's real classes:</p>
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
print(type(lc_chain).__name__, "with", len(lc_chain.steps), "steps")
print(lc_chain.batch([QUESTION, "Is the paneer tikka nut free?"]))</div>
  <div class="fx" data-lang="text">If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]
RunnableSequence with 3 steps
['If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]', "I don't know based on these sources."]</div>
  <p>Trace <code>chain.invoke(QUESTION)</code>. <code>fill</code> turns the question into a prompt containing source [1], the "Late orders" section. <code>model</code>, the stand-in, copies the sentence that best matches the question and cites it. <code>parse</code> strips whitespace. Each step knows only its own input and output; none of them knows about the others. With LangChain's <code>RunnableLambda</code>, which wraps any function as a LangChain part, the same three functions become a <code>RunnableSequence</code> with 3 steps. And because the sequence is itself a LangChain part, it got a <code>batch</code> method for free: two questions in, two answers out. The second question asks about the paneer tikka, and since source [1] says nothing about it, the stand-in answers "I don't know based on these sources."</p>
  <p>The shared interface has a name: a <strong>Runnable</strong> is any object with <code>invoke</code> (one input), <code>batch</code> (many inputs), <code>stream</code> (output in pieces as it is produced) and their async versions <code>ainvoke</code> and <code>astream</code>. Prompts, models, parsers, retrievers, tools and whole chains are all Runnables, which is why they compose so freely. Think of a dabbawala relay: each person only knows "take the tiffin from the last person and hand it to the next", nobody needs the whole route in their head, and you can insert a new person anywhere.</p>
  <figure class="viz"><svg viewBox="0 0 600 128" width="600"><defs><marker id="lc-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="14" y="64">dict</text><line x1="50" y1="60" x2="88" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><rect x="90" y="40" width="100" height="40" rx="6" class="ft st"/><text x="140" y="64" text-anchor="middle" font-weight="bold">prompt</text><rect x="250" y="40" width="100" height="40" rx="6" class="fb sb"/><text x="300" y="64" text-anchor="middle" font-weight="bold">model</text><rect x="410" y="40" width="100" height="40" rx="6" class="fg sg"/><text x="460" y="64" text-anchor="middle" font-weight="bold">parser</text><line x1="190" y1="60" x2="248" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="219" y="30" text-anchor="middle" font-size="10" class="tm">ChatPromptValue</text><line x1="350" y1="60" x2="408" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="379" y="30" text-anchor="middle" font-size="10" class="tm">AIMessage</text><line x1="510" y1="60" x2="548" y2="60" stroke="currentColor" marker-end="url(#lc-a2)"/><text x="552" y="64">str</text><path d="M90,92 V100 H510 V92" fill="none" stroke="currentColor" stroke-opacity=".5"/><text x="300" y="118" text-anchor="middle" font-size="11">RunnableSequence = a Runnable too: invoke · stream · batch · ainvoke</text></svg><figcaption>The standard chain. Each | hands the left part's output to the right part, and the type changes at every step.</figcaption></figure>
  <p>The diagram shows the chain you will write most often, <code>prompt | model | parser</code>, with the type of value passed at each arrow. A dictionary of values goes into the prompt template, which produces a <code>ChatPromptValue</code> (the filled-in messages). The model turns that into an <code>AIMessage</code>. The parser turns the message into a plain string. Keeping these types in mind is the single most useful habit with LCEL, because a type mismatch between two steps only fails when the chain runs, often deep inside it.</p>

  <h2 id="lc-prompt"><span class="num">03</span>Prompt Templates</h2>
  <p>Our <code>fill</code> step is still an f-string. Biteful's real prompt has several parts, each with a role: fixed rules and the company name in a system message, the retrieved sources, possibly earlier chat messages, and finally the customer's question. A <strong>prompt template</strong> is a reusable prompt with named slots written in <code>{braces}</code>, filled in fresh for each request. <code>ChatPromptTemplate</code> builds a list of role-tagged messages, and <code>MessagesPlaceholder</code> is a slot for a whole list of messages, which is how chat history gets inserted. A printed refund form with blanks is a good picture: head office designs it once, and each agent only fills in the blanks.</p>
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
    print(f"{type(m).__name__:13}|", m.content[:60].replace("\\n", " "))

rag_prompt = rag_prompt.partial(company="Biteful")
print(rag_prompt.input_variables)</div>
  <div class="fx" data-lang="text">['company', 'context', 'question']
SystemMessage| You are Biteful's support assistant. Answer only from the so
HumanMessage | Hi
AIMessage    | Hello! How can I help with your order?
HumanMessage | Question: My order arrived 50 minutes late. Can I get my mon
['context', 'question']</div>
  <p><code>input_variables</code> lists the slots that must be filled: <code>company</code>, <code>context</code> and <code>question</code> (<code>history</code> is optional, so it is not listed). Invoking the template returns a <code>ChatPromptValue</code>, and <code>to_messages()</code> shows the four messages a model would receive: the system rules with "Biteful" and source [1] filled in, the two history messages spliced in where the placeholder was, and the question last. The final line uses <code>partial</code>, which fills some slots now and returns a smaller template; after <code>partial(company="Biteful")</code> only <code>context</code> and <code>question</code> remain. That is the template the rest of this note uses. (Few-shot examples, covered in <a class="xref" data-note="prompting">Prompt Engineering</a>, can be added with <code>FewShotChatMessagePromptTemplate</code>.)</p>

  <h2 id="lc-models"><span class="num">04</span>Chat Models</h2>
  <p>The template produces messages; something must read them and reply. We want that something to be swappable (a test fake today, Claude tomorrow, a local model next month) without touching the template or anything after it, and we want to build and test the whole assistant without paying for a single API call. Every LangChain <strong>chat model</strong> has the same Runnable methods and returns the same type, an <code>AIMessage</code>, which carries <code>.content</code> (the text), <code>.tool_calls</code> (requests to run tools) and <code>.usage_metadata</code> (token counts, when the model reports them). LangChain also ships <strong>fake models</strong> that replay scripted replies through exactly that interface, made for tests. And we can turn our own stand-in into a proper chat model by subclassing <code>SimpleChatModel</code> and writing one method, <code>_call</code>.</p>
  <div class="fx" data-lang="py">from langchain_core.language_models.fake_chat_models import FakeListChatModel
from langchain_core.language_models.chat_models import SimpleChatModel

# 1. LangChain's own fake model: replays scripted replies through the real interface
scripted = FakeListChatModel(responses=["Sorry about the delay! Let me check the policy."])
msg = scripted.invoke("My order is late")
print(type(msg).__name__, "|", msg.content, "| tool_calls:", msg.tool_calls)
print([chunk.content for chunk in scripted.stream("again")][:6])

# 2. Our STAND-IN: a real LangChain chat-model class whose "brain" is fake_llm
class ExtractiveChatModel(SimpleChatModel):
    """No network, no bill: copies the best-matching source sentence and cites it."""
    @property
    def _llm_type(self):
        return "extractive-stand-in"
    def _call(self, messages, stop=None, run_manager=None, **kwargs):
        return fake_llm("\\n".join(m.content for m in messages))

llm = ExtractiveChatModel()
reply = (rag_prompt | llm).invoke({"context": "[1] " + texts[0], "question": QUESTION})
print(type(reply).__name__, "|", reply.content)</div>
  <div class="fx" data-lang="text">AIMessage | Sorry about the delay! Let me check the policy. | tool_calls: []
['S', 'o', 'r', 'r', 'y', ' ']
AIMessage | If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]</div>
  <p><code>FakeListChatModel</code> returned an <code>AIMessage</code> with our scripted text and no tool calls, and its <code>stream</code> method yielded the reply one character at a time, just as a real model streams tokens. <code>ExtractiveChatModel</code> is a genuine LangChain chat model whose "brain" is the stand-in from the RAG note, so <code>rag_prompt | llm</code> works, callbacks fire on it and fallbacks accept it, as later sections show. Its answer is computed from the sources actually in the prompt, so retrieval quality really shows up in its output. A flight simulator is the right picture: the same cockpit and controls as the real plane, so pilots practise every procedure before burning real fuel. Switching to a real model changes only the line that creates <code>llm</code>; this version needs an API key, so it is not run here:</p>
  <div class="fx" data-lang="py">from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-sonnet-5-5", timeout=30, max_retries=2)
chain = rag_prompt | llm                 # the template and everything after it are unchanged
reply = chain.invoke({"context": "[1] " + texts[0], "question": QUESTION})
print(reply.content, reply.usage_metadata)</div>
  <p>Integrations like <code>ChatAnthropic</code> add provider settings such as <code>timeout</code> and <code>max_retries</code>, report token usage in <code>usage_metadata</code>, and support tools through <code>bind_tools</code>. Remember what fakes can and cannot tell you: a scripted reply "passes" no matter what the prompt says. Fakes prove that the parts connect correctly; whether answers are good needs a real model and a labelled evaluation set (<a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>).</p>

  <h2 id="lc-parse"><span class="num">05</span>Output Parsers and Structured Output</h2>
  <p>The model returns free text, but the ticket tagger needs a typed object with a <code>topic</code> and an <code>urgent</code> flag that the program can branch on. Models wrap JSON in chatty sentences and code fences, leave fields out, or invent values outside the allowed set. Our hand-written tagger hid all of that behind a silent fallback. An <strong>output parser</strong> is a Runnable that turns a model message into a Python value, or raises a clear error when it cannot. <code>StrOutputParser</code> returns the text. <code>JsonOutputParser</code> finds the JSON even inside a code fence and returns a dictionary. <code>PydanticOutputParser</code> also validates the result against a class with typed fields and raises <code>OutputParserException</code> when it does not fit. Think of a clerk typing handwritten complaint letters into a system: the greeting and doodles do not matter, the order number goes into the right box, and if the order number is missing she rejects the letter instead of guessing.</p>
  <div class="fx" data-lang="py">from typing import Literal
from pydantic import BaseModel
from langchain_core.messages import AIMessage
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser, PydanticOutputParser

FENCE = "\`" * 3
raw = AIMessage(f'Sure! Here it is:\\n{FENCE}json\\n{{"topic": "refund", "urgent": true}}\\n{FENCE}')

print(repr(StrOutputParser().invoke(raw))[:30], "...")
print(JsonOutputParser().invoke(raw))

class Ticket(BaseModel):
    topic: Literal["refund", "delivery", "allergen", "other"]
    urgent: bool

ticket_parser = PydanticOutputParser(pydantic_object=Ticket)
t = ticket_parser.invoke(raw)
print(type(t).__name__, t.topic, t.urgent)

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
  <div class="fx" data-lang="text">'Sure! Here it is:\\n\`\`\`json\\n{ ...
{'topic': 'refund', 'urgent': True}
Ticket refund True
OutputParserException &lt;- {"topic": "refund"}
OutputParserException &lt;- {"topic": "pizza", "urgent": false}
OutputParserException &lt;- I think it's a refund.
topic='refund' urgent=True</div>
  <p><code>StrOutputParser</code> returned the messy reply unchanged. <code>JsonOutputParser</code> dug the dictionary out of the fence, turning JSON's <code>true</code> into Python's <code>True</code>. <code>PydanticOutputParser</code> built a typed <code>Ticket</code> object. The <code>Ticket</code> class is a Pydantic model: <code>Literal[...]</code> restricts <code>topic</code> to four allowed values, and <code>urgent</code> must be a boolean. Then come three bad replies and three <code>OutputParserException</code>s: one is missing <code>urgent</code>, one has the topic "pizza", and one is plain prose. Failing loudly is the point; section 10 turns the failure into a safe default. Finally, <code>get_format_instructions()</code> produces a paragraph telling the model to output JSON matching the schema, and we pass it into the system message through a variable (so its braces are not mistaken for template slots). The whole tagger is then just <code>tag_prompt | model | ticket_parser</code>.</p>
  <p>Parsers <em>hope</em> the model followed the instructions and check afterwards. Most provider APIs can do better: they can <em>constrain</em> generation to a JSON schema, so the reply always fits. This is called <strong>structured output</strong>, and in LangChain you get it with <code>with_structured_output</code>, which returns a <code>Ticket</code> directly and needs no format instructions in the prompt. It needs a real model integration (the fakes do not implement it), so this block is not run:</p>
  <div class="fx" data-lang="py">from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-haiku-5-5")
plain_prompt = ChatPromptTemplate.from_messages([
    ("system", "Classify the Biteful ticket."), ("human", "{question}")])
tagger = plain_prompt | llm.with_structured_output(Ticket)   # the provider enforces the schema
ticket = tagger.invoke({"question": QUESTION})               # a Ticket object, no parser needed</div>
  <p>With real models, prefer <code>with_structured_output</code> for anything your code branches on. Keep a parser, plus a fallback, for models that lack native support. "Prompt for JSON and hope" fails on a small but steady share of calls in production.</p>

  <h2 id="lc-retr"><span class="num">06</span>Documents and Retrievers</h2>
  <p>Prompt, model and parser are now standard parts, but the RAG chain's most important input, the retrieved policy sections, still comes from our hand-written search over a list of strings. LangChain has standard parts for the whole retrieval pipeline, so the toy in-memory search can later be swapped for pgvector, Pinecone or another store without touching the chain. A <strong><code>Document</code></strong> is a piece of text (<code>page_content</code>) plus a <code>metadata</code> dictionary for things like the source file and section title. A <strong>text splitter</strong> cuts documents into chunks. An <strong>Embeddings</strong> class turns text into vectors and needs just two methods, <code>embed_documents</code> and <code>embed_query</code>. A <strong>vector store</strong> holds the vectors and finds the nearest ones, and its <code>as_retriever()</code> method wraps it as a <strong>retriever</strong>: a Runnable that takes a query string and returns a list of Documents. A library is the picture: the splitter cuts books into index cards, embeddings write each card's subject code, the vector store is the card cabinet, and the retriever is the librarian you ask. (Embeddings and vector databases are explained in <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>.)</p>
  <div class="fx" data-lang="py">from langchain_core.documents import Document
from langchain_text_splitters import MarkdownHeaderTextSplitter

splitter = MarkdownHeaderTextSplitter(headers_to_split_on=[("#", "doc"), ("##", "section")])
docs = []
for name, text in DOCS.items():
    for d in splitter.split_text(text):                 # one Document per "## " section
        d.metadata["source"] = name
        d.page_content = f"{d.metadata['section']}. {d.page_content}"   # keep the heading
        docs.append(d)
print(len(docs), "documents;", docs[0].metadata)
print(docs[0].page_content[:60])

# STAND-IN embeddings: character 3-gram TF-IDF vectors, behind LangChain's interface
import numpy as np
from langchain_core.embeddings import Embeddings

class CharGramEmbeddings(Embeddings):
    def __init__(self, corpus, n=3):
        self.n = n
        grams = [set(self._grams(t)) for t in corpus]
        self.vocab = {g: i for i, g in enumerate(sorted(set().union(*grams)))}
        df = np.zeros(len(self.vocab))
        for gs in grams:
            df[[self.vocab[g] for g in gs]] += 1
        self.idf = np.log((1 + len(corpus)) / (1 + df)) + 1
    def _grams(self, text):
        t = f" {text.lower()} "
        return [t[i:i + self.n] for i in range(len(t) - self.n + 1)]
    def _vec(self, text):
        v = np.zeros(len(self.vocab))
        for g in self._grams(text):
            if g in self.vocab:
                v[self.vocab[g]] += 1
        v = np.log1p(v) * self.idf
        return (v / (np.linalg.norm(v) or 1)).tolist()
    def embed_documents(self, texts):
        return [self._vec(t) for t in texts]
    def embed_query(self, text):
        return self._vec(text)

from langchain_core.vectorstores import InMemoryVectorStore
store = InMemoryVectorStore.from_documents(docs, CharGramEmbeddings([d.page_content for d in docs]))
for d, s in store.similarity_search_with_score("It is raining and my food is late. Why?", k=2):
    print(round(s, 3), d.metadata["source"], d.metadata["section"])

dense_retriever = store.as_retriever(search_kwargs={"k": 3})
print(type(dense_retriever).__name__, [d.metadata["section"] for d in dense_retriever.invoke(QUESTION)])</div>
  <div class="fx" data-lang="text">13 documents; {'doc': 'Refund policy', 'section': 'Late orders', 'source': 'refunds.md'}
Late orders. If your order arrives more than 45 minutes afte
0.198 refunds.md Missing or wrong items
0.193 delivery.md Delays
VectorStoreRetriever ['Late orders', 'Delivery times', 'How refunds are paid']</div>
  <p><code>MarkdownHeaderTextSplitter</code> cut the policy files at their headings, giving 13 Documents, one per section, each with <code>doc</code>, <code>section</code> and <code>source</code> metadata so citations and filters work. We glued the section title back onto the text, as in the RAG note, so a chunk like "Late orders. If your order arrives…" carries its own context. <code>CharGramEmbeddings</code> is a stand-in embedding model (character three-letter fragments weighted by how rare they are) behind LangChain's real interface. The rain question shows its weakness: "Missing or wrong items" scores 0.198, just above the correct "Delays" at 0.193, because the stand-in matches letters, not meaning. Wrapped as a retriever, the store returns Late orders, Delivery times and How refunds are paid for our customer's question.</p>
  <p>Any search can become a retriever. You subclass <code>BaseRetriever</code> and implement one method, <code>_get_relevant_documents</code>. Here is a keyword retriever that reuses the BM25 function from the RAG note:</p>
  <div class="fx" data-lang="py">from langchain_core.retrievers import BaseRetriever

class BM25Retriever(BaseRetriever):               # any search becomes a retriever
    documents: list
    k: int = 3
    def _get_relevant_documents(self, query, *, run_manager=None):
        scores = bm25(query, [d.page_content for d in self.documents])
        order = sorted(range(len(scores)), key=lambda i: -scores[i])
        return [self.documents[i] for i in order[:self.k] if scores[i] &gt; 0]

bm25_retriever = BM25Retriever(documents=docs)
print([d.metadata["section"] for d in bm25_retriever.invoke("Does the paneer tikka contain nuts?")])
print([d.metadata["section"] for d in bm25_retriever.invoke(QUESTION)])</div>
  <div class="fx" data-lang="text">['Allergen labels', 'Shared kitchens']
['Late orders', 'Delivery times', 'How refunds are paid']</div>
  <p>Keyword search finds both allergen sections for the nuts question, because the word "nuts" appears in them, and for the customer's question it returns the same three sections as the dense retriever. Keyword and embedding search make different mistakes, which is why the RAG note combined them. That combination needs one input to flow into two retrievers at once, which is the subject of the next section.</p>

  <h2 id="lc-parallel"><span class="num">07</span>Parallel, Passthrough and Lambda</h2>
  <p>A chain built with <code>|</code> is a single line: each step receives only the previous step's output. But our RAG chain needs more. The question must go into <em>both</em> retrievers; their two result lists must be merged; and the original question must <em>also</em> reach the prompt's <code>{question}</code> slot, even though the retrievers turned it into Documents. Writing <code>retriever | prompt</code> would give the prompt a list of Documents and no question. Three small helpers solve this. <strong><code>RunnableParallel</code></strong> sends one input to several Runnables and returns a dictionary of their outputs; a plain dict inside a chain is converted to one automatically. <strong><code>RunnablePassthrough()</code></strong> returns its input unchanged, and <code>RunnablePassthrough.assign(key=...)</code> keeps an input dictionary and adds a key to it. <strong><code>RunnableLambda(fn)</code></strong> wraps any Python function as a Runnable. A restaurant ticket is the picture: the order is photocopied, one copy goes to the kitchen, the original stays clipped to the tray, and both meet again at the pass before the plate goes out.</p>
  <figure class="viz"><svg viewBox="0 0 600 162" width="600"><defs><marker id="lc-a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="10" y="91">question</text><path d="M76,87 H86 V37 H98" fill="none" stroke="currentColor" marker-end="url(#lc-a4)"/><path d="M86,87 V137 H98" fill="none" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="100" y="20" width="100" height="34" rx="6" class="ft st"/><text x="150" y="41" text-anchor="middle" font-weight="bold">bm25 ∥ dense</text><rect x="215" y="20" width="110" height="34" rx="6" class="ft st"/><text x="270" y="41" text-anchor="middle" font-weight="bold">rrf → format</text><line x1="200" y1="37" x2="213" y2="37" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="100" y="120" width="225" height="34" rx="6" class="fs"/><text x="212.5" y="141" text-anchor="middle" font-weight="bold">RunnablePassthrough()</text><text x="150" y="70" text-anchor="middle" font-size="10" class="tm">2 Document lists</text><text x="270" y="70" text-anchor="middle" font-size="10" class="tm">→ "[1] … [2] … [3] …"</text><rect x="345" y="20" width="80" height="134" rx="6" class="fv"/><text x="385" y="41" text-anchor="middle" font-size="11">context</text><text x="385" y="91" text-anchor="middle" font-weight="bold">dict</text><text x="385" y="141" text-anchor="middle" font-size="11">question</text><line x1="325" y1="37" x2="343" y2="37" stroke="currentColor" marker-end="url(#lc-a4)"/><line x1="325" y1="137" x2="343" y2="137" stroke="currentColor" marker-end="url(#lc-a4)"/><rect x="445" y="66" width="145" height="42" rx="6" class="fb sb"/><text x="517.5" y="85" text-anchor="middle" font-weight="bold">prompt|llm|parser</text><text x="517.5" y="99" text-anchor="middle" font-size="10" class="tm">→ answer str</text><line x1="425" y1="87" x2="443" y2="87" stroke="currentColor" marker-end="url(#lc-a4)"/></svg><figcaption>The RAG chain's setup step is a RunnableParallel: the question goes through both retrievers, fusion and formatting into {context}, and unchanged into {question}.</figcaption></figure>
  <p>Follow the diagram. The question splits in two. The top branch runs both retrievers side by side, merges their lists with reciprocal rank fusion (RRF, from the RAG note: each document scores 1/(60 + rank) in every list it appears in), and formats the winners as numbered sources. The bottom branch passes the question through untouched. The two results meet in a dictionary with the keys <code>context</code> and <code>question</code>, exactly the two slots the prompt needs. In code:</p>
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
print({name: [d.metadata["section"] for d in ds] for name, ds in both.invoke(q).items()})
print([d.metadata["section"] for d in hybrid.invoke(q)])
step = setup.invoke(q)
print(list(step), "|", step["question"])
print(rag_chain.invoke(q))
print(rag_chain.invoke(QUESTION))</div>
  <div class="fx" data-lang="text">{'bm25': ['Tracking', 'Late orders', 'Delays'], 'dense': ['Missing or wrong items', 'Delays', 'Delivery fee']}
['Delays', 'Tracking', 'Missing or wrong items']
['context', 'question'] | It is raining and my food is late. Why?
Heavy rain, festivals and road closures can slow riders down. [1]
If your order arrives more than 45 minutes after the promised time, Biteful refunds the full order amount. [1]</div>
  <p>Each <code>print</code> runs one prefix of the chain, which is the best way to debug LCEL: invoke the pieces and look at what comes out. For the rain question, BM25 found Tracking, Late orders and Delays, while the dense retriever put "Missing or wrong items" first and Delays second. RRF rewarded "Delays" for appearing in both lists and moved it to first place, fixing the dense retriever's mistake. <code>setup</code> produced a dictionary with <code>context</code> and <code>question</code>, the question unchanged. The full chain then answered "Heavy rain, festivals and road closures can slow riders down", citing [1], and for our customer it gave the same cited 45-minute answer as the hand-built pipeline, now assembled from standard, swappable parts.</p>

  <h2 id="lc-mem"><span class="num">08</span>Chat History</h2>
  <p>The chain answers one question well. The customer then asks "How long does that take?", and the chain has no idea what "that" refers to, because every <code>invoke</code> starts from nothing. A model keeps nothing between calls, and neither does a chain. Chat "memory" is simply this: <strong>your code stores past messages and sends them again with the next question</strong>. Two decisions then matter. The first is how much to re-send: history grows every turn, and every re-sent token is paid for on every call, so you trim it, keeping the last few turns or summarising older ones. The second applies to RAG: retrieval runs <em>before</em> the model sees anything, so a follow-up like "How long does that take?" must first be rewritten, together with the history, into a standalone question that a search can use. This rewriting step is called <strong>condensing</strong> the question. Picture a clinic where the doctor forgets every patient the moment they leave: the receptionist keeps the file and decides how much of it to hand over at each visit.</p>
  <div class="fx" data-lang="py">from operator import itemgetter
from langchain_core.messages import HumanMessage, AIMessage, trim_messages

condense_prompt = ChatPromptTemplate.from_messages([
    ("system", "Rewrite the last user message as a standalone search question."),
    MessagesPlaceholder("history"), ("human", "{question}"),
])
# STAND-IN for the rewrite call: a scripted reply (what an LLM typically writes here)
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
  <p><code>history</code> is a plain list of messages, and <code>chat()</code> is all the memory machinery there is. It trims the list with <code>trim_messages</code> to the last four messages, starting on a human turn (here <code>token_counter=len</code> counts messages to keep the demo readable; in production you pass the model and a token budget), runs the chain, and appends the new question and answer. Turn 1 has no history, so <code>standalone</code> passes the question straight through and we get the 45-minute answer. Turn 2 has history, so the condenser runs. Its reply is scripted, standing in for the one cheap model call that would write it: "How long do refunds take to come back to my payment method?". <code>RunnablePassthrough.assign</code> replaces <code>question</code> with that rewrite, retrieval finds "How refunds are paid", and the answer is 5-7 working days, cited. The last line sends the same follow-up with empty history and gets "I don't know": memory is what made turn 2 work.</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>What is re-sent</th><th>Cost</th><th>Use</th></tr>
    <tr><td>Buffer (all messages)</td><td>Everything, word for word</td><td>Grows until the context window overflows</td><td>Demos</td></tr>
    <tr><td>Window (<code>trim_messages</code>)</td><td>The last k messages or tokens</td><td>Bounded; forgets early facts</td><td>Most chatbots</td></tr>
    <tr><td>Summary</td><td>A running summary written by a model</td><td>Small, plus a summary call; loses detail</td><td>Long sessions</td></tr>
    <tr><td>Summary + window</td><td>Recent turns verbatim, older ones summarised</td><td>Controlled</td><td>The usual balance</td></tr>
  </table>
  <p>LangChain used to wrap this pattern in a class called <code>RunnableWithMessageHistory</code>, and older code used memory classes such as <code>ConversationBufferMemory</code>. Both are now deprecated: the library itself recommends LangGraph's built-in persistence, which saves the conversation per thread and survives restarts. That is the subject of the <a class="xref" data-note="langgraph">LangGraph</a> note.</p>

  <h2 id="lc-trace"><span class="num">09</span>Callbacks and Tracing</h2>
  <p>One customer turn now runs a condenser, two retrievers, a fusion step, a prompt, a model and a parser. When a customer says the bot gave a wrong refund answer, which part failed? Did the retrievers miss the "Late orders" section, or did the model ignore it? Print statements in every part do not scale. Instead, every Runnable reports what it is doing to <strong>callback handlers</strong>: objects whose methods LangChain calls when a part starts, ends or fails, such as <code>on_retriever_end</code>, <code>on_chat_model_start</code>, <code>on_llm_end</code> and <code>on_chain_error</code>. You pass handlers in the <code>config</code> of a single call, and they see every nested step. Tracking a food order is the picture: the notifications at each stage ("restaurant accepted", "picked up") are callbacks, and the full order history that support opens when something goes wrong is a trace.</p>
  <div class="fx" data-lang="py">import time, asyncio
from langchain_core.callbacks import BaseCallbackHandler

class SupportTracer(BaseCallbackHandler):
    """LangChain calls these methods as each part of the chain starts and ends."""
    def __init__(self):
        self.t0 = time.perf_counter()
    def _log(self, what):
        print(f"{(time.perf_counter() - self.t0) * 1000:6.1f} ms  {what}")
    def on_retriever_end(self, documents, **kw):
        self._log(f"retriever -&gt; {[d.metadata['section'] for d in documents]}")
    def on_chat_model_start(self, serialized, messages, **kw):
        self._log(f"model start: {len(messages[0])} messages, {sum(len(m.content) for m in messages[0])} chars")
    def on_llm_end(self, response, **kw):
        self._log(f"model end -&gt; {response.generations[0][0].text[:40]!r}")

answer = rag_chain.invoke(QUESTION, config={"callbacks": [SupportTracer()]})

async def event_names():                          # the same run as a stream of events
    return [e["event"] async for e in rag_chain.astream_events(QUESTION, version="v2")]
names = asyncio.run(event_names())
print(len(names), "events of", len(set(names)), "kinds, e.g.", sorted(set(names))[:4])</div>
  <div class="fx" data-lang="text">   4.0 ms  retriever -&gt; ['Late orders', 'Delivery times', 'How refunds are paid']
   4.6 ms  retriever -&gt; ['Late orders', 'Delivery times', 'How refunds are paid']
   6.2 ms  model start: 2 messages, 587 chars
   6.4 ms  model end -&gt; 'If your order arrives more than 45 minut'
34 events of 12 kinds, e.g. ['on_chain_end', 'on_chain_start', 'on_chain_stream', 'on_chat_model_end']</div>
  <p>The handler printed four events. Both retrievers ended with the same three sections (Late orders, Delivery times, How refunds are paid), so retrieval was not the problem for this question. The model then started with 2 messages (the system message with the sources, and the question) and ended with the cited answer. The millisecond timings are approximate and from this machine; with a real model, the model step takes hundreds to thousands of milliseconds and dominates everything else. The second part shows the same run as a stream of events from <code>astream_events</code>, which is what a chat UI uses to show progress: 34 events of 12 kinds, from <code>on_chain_start</code> to <code>on_parser_end</code>. It is async, so we run it with <code>asyncio.run</code> (see <a class="xref" data-note="py_asyncio">asyncio</a>).</p>
  <p>In production you rarely write handlers for logging; you turn on <strong>LangSmith</strong>, LangChain's hosted tracing service, by setting the environment variables <code>LANGSMITH_TRACING=true</code> and <code>LANGSMITH_API_KEY</code>. Every run is then recorded as a <strong>trace</strong>: the tree of all steps with their inputs, outputs, timings and token counts, which can also be turned into evaluation datasets. Traces contain prompts and answers, which means customer messages and order details, so check your data policy and mask sensitive fields before sending them to any hosted service.</p>

  <h2 id="lc-fallback"><span class="num">10</span>Retries and Fallbacks</h2>
  <p>Tracing tells you that a model call timed out or a parser failed; the customer still saw an error. Provider APIs time out, hit rate limits and go down, and models sometimes return text the parser rejects. Wrapping every call in try/except/retry loops is exactly the glue we wanted to get rid of. Instead, every Runnable has two wrappers. <strong><code>with_retry</code></strong> runs the same step again after a failure, which suits short-lived (transient) errors such as timeouts. <strong><code>with_fallbacks</code></strong> tries a list of alternatives in order when the step fails, which suits outages and persistent failures: a backup provider, a smaller model, or a safe default value. A delivery rider whose road is briefly blocked tries again a minute later (retry); if the road is closed, takes the backup route (fallback); and if the restaurant is shut, the app offers a refund instead of an error (safe default).</p>
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

# A primary model that is down: fall back to another model
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
  <p>In the first case, the simulated primary model timed out on attempts 1 and 2; <code>with_retry(stop_after_attempt=3)</code> ran it a third time, the chain answered, and the caller never saw the timeouts. In the second, the primary model raised <code>ConnectionError</code>, and <code>with_fallbacks([llm])</code> sent the same prompt to the backup model, which answered. In the third, the tagger's model replied in prose, the Pydantic parser raised, and the fallback returned a safe <code>Ticket(topic='other', urgent=True)</code>, so the ticket goes to a human queue instead of crashing the pipeline. Two cautions. Retrying errors that are not transient, such as a bad API key or an invalid request, only multiplies latency and cost, so restrict retries to the right exception types (<code>retry_if_exception_type=</code>). And retrying a step with side effects, such as sending an email, repeats the side effect.</p>

  <h2 id="lc-agents"><span class="num">11</span>Tools and create_agent</h2>
  <p>Our chain is robust, but it can only read the policy. When the customer says "Order 101 was late", answering properly needs the order's real delay, which lives in Biteful's order system behind a function. A model only produces text, so it must <em>request</em> a function call, our code must run it, and the result must go back to the model before it answers. That back-and-forth is the agent loop from <a class="xref" data-note="agentic">Agent Fundamentals</a>. LangChain's <strong><code>@tool</code></strong> decorator builds a tool's name, description and argument schema from the function's name, docstring and type hints. <code>model.bind_tools([...])</code> attaches those schemas to each request so the model may reply with a tool call, but nothing runs the call. <strong><code>create_agent</code></strong> builds the whole loop: call the model, run any requested tools, append the results, and repeat until the model answers. The model below is a scripted stand-in that first requests <code>order_status(101)</code> and then answers.</p>
  <div class="fx" data-lang="py">from langchain_core.tools import tool
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain.agents import create_agent
from langchain.agents.middleware import ToolCallLimitMiddleware

@tool
def order_status(order_id: int) -&gt; str:
    """How late a Biteful order was. Use before answering any refund question about an order."""
    return {101: "delivered 50 minutes after the promised time"}.get(order_id, "order not found")

print(order_status.name, "|", order_status.description[:40], "|", order_status.args)

class ScriptedModel(GenericFakeChatModel):      # STAND-IN: replays scripted replies
    def bind_tools(self, tools, **kwargs):      # the fake ignores tool schemas
        return self

agent_llm = ScriptedModel(messages=iter([
    AIMessage("", tool_calls=[{"name": "order_status", "args": {"order_id": 101}, "id": "call_1"}]),
    AIMessage("Order 101 was 50 minutes late, more than 45, so you get a full refund."),
]))
agent = create_agent(agent_llm, tools=[order_status],
                     system_prompt="You are Biteful's support assistant.",
                     middleware=[ToolCallLimitMiddleware(run_limit=5)])
result = agent.invoke({"messages": [{"role": "user", "content": "Order 101 was late. Refund?"}]})
for m in result["messages"]:
    print(f"{type(m).__name__:12}|", m.content or m.tool_calls[0])</div>
  <div class="fx" data-lang="text">order_status | How late a Biteful order was. Use before | {'order_id': {'title': 'Order Id', 'type': 'integer'}}
HumanMessage| Order 101 was late. Refund?
AIMessage   | {'name': 'order_status', 'args': {'order_id': 101}, 'id': 'call_1', 'type': 'tool_call'}
ToolMessage | delivered 50 minutes after the promised time
AIMessage   | Order 101 was 50 minutes late, more than 45, so you get a full refund.</div>
  <p>The first line shows what the model will see: the name <code>order_status</code>, the docstring as its description, and an argument schema built from the type hint <code>order_id: int</code>. The four messages are the loop. The customer asks. The model replies with a tool call instead of text, with the id <code>call_1</code>. The agent runs <code>order_status(101)</code> and appends a <code>ToolMessage</code> linked to that id. The model reads "delivered 50 minutes after the promised time" and answers. <code>ToolCallLimitMiddleware(run_limit=5)</code> is middleware, a hook that runs around each step of the agent, here stopping a model that keeps calling tools forever. The <code>ScriptedModel</code> subclass exists only because the fake model has no <code>bind_tools</code> method. Write docstrings carefully: a vague one ("gets order") leads to wrong tools and wrong arguments, so say what the tool does, when to call it and what format its arguments take.</p>
  <p>Notice that this loop is not a straight line any more. It goes round until the model stops, and in a real system it may need to pause for a human's approval or survive a restart halfway through. <code>create_agent</code> already runs on LangGraph for exactly that reason, and <a class="xref" data-note="agent_build">Build an Agent from Scratch</a> shows the same loop written by hand.</p>

  <h2 id="lc-when"><span class="num">12</span>When Not to Use LangChain</h2>
  <p>We gained swappable parts, batching, streaming, tracing, retries and fallbacks. What did it cost? There are two costs: run-time overhead and, much bigger, complexity, meaning more concepts to learn, deeper stack traces and frequent version changes. The first is easy to measure: run the same five plain functions directly and as an LCEL chain of <code>RunnableLambda</code>s.</p>
  <div class="fx" data-lang="py">import timeit

def top2(q):                                      # the same five functions, used two ways
    s = bm25(q, texts)
    idx = sorted(range(len(texts)), key=lambda i: -s[i])[:2]
    return {"q": q, "docs": [texts[i] for i in idx]}
def fmt(x):   return {"q": x["q"], "src": "\\n".join(f"[{n}] {t}" for n, t in enumerate(x["docs"], 1))}
def fill(x):  return f"Sources:\\n{x['src']}\\n\\nQuestion: {x['q']}"
def clean(s): return s.strip()

plain = lambda q: clean(fake_llm(fill(fmt(top2(q)))))
lcel = (RunnableLambda(top2) | RunnableLambda(fmt) | RunnableLambda(fill)
        | RunnableLambda(fake_llm) | RunnableLambda(clean))
print("same answer:", plain(QUESTION) == lcel.invoke(QUESTION))
for name, fn in [("plain calls", plain), ("LCEL chain", lcel.invoke)]:
    ms = timeit.timeit(lambda: fn(QUESTION), number=200) / 200 * 1000
    print(f"{name:11} {ms:5.2f} ms per question")</div>
  <div class="fx" data-lang="text">same answer: True
plain calls  0.16 ms per question
LCEL chain   0.66 ms per question</div>
  <p>Both give the same answer. The chain adds well under a millisecond per question for five steps (timings are approximate and machine-dependent), while a real model call takes hundreds to thousands of milliseconds. So speed is rarely a reason to skip LangChain; <strong>simplicity</strong> is. A food processor is worth it for a wedding's worth of onions; for one onion, a knife is faster to use and to clean.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Better choice</th></tr>
    <tr><td>One or two model calls in a fixed flow</td><td>The provider's SDK directly: less to learn, easier to debug</td></tr>
    <tr><td>Loops, branches, retries of whole steps, human approval, resuming after a crash</td><td><a class="xref" data-note="langgraph">LangGraph</a> (state, graph and checkpoints)</td></tr>
    <tr><td>A latency-critical hot path with nothing to swap</td><td>Direct calls with no extra layers</td></tr>
    <tr><td>The team debugs the framework more than the model</td><td>Simplify, or own the loop (<a class="xref" data-note="agent_build">Build an Agent from Scratch</a>)</td></tr>
    <tr><td>Many providers and retrievers, frequent swaps, tracing, batching and streaming everywhere</td><td>LangChain pays off</td></tr>
  </table>
  <p>One sign that you have outgrown chains is forcing loops into them: nesting chains inside <code>RunnableLambda</code>s with <code>while</code> loops to fake "retrieve again if the answer is weak". It works until you need to pause, resume or inspect it, and that is the moment to move to a graph.</p>

  <h2 id="lc-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most common LCEL error is forgetting the passthrough branch. A prompt receives only what the step before it produced, so if the setup dictionary has no <code>question</code> key, the prompt cannot fill its <code>{question}</code> slot:</p>
  <div class="fx" data-lang="py">broken = {"context": hybrid | format_docs} | rag_prompt | llm      # no "question" branch
try:
    broken.invoke(QUESTION)
except KeyError as e:
    print("KeyError:", e.args[0][:66])</div>
  <div class="fx" data-lang="text">KeyError: Input to ChatPromptTemplate is missing variables {'question'}.  Ex</div>
  <p>The error names the missing variable. The fix is the setup from section 7: <code>{"context": hybrid | format_docs, "question": RunnablePassthrough()}</code>.</p>
  <p>The second mistake is putting literal braces in a template. A JSON example inside a prompt looks harmless, but the template treats <code>{"topic": ...}</code> as a slot to fill:</p>
  <div class="fx" data-lang="py">bad = ChatPromptTemplate.from_messages([("system", 'Reply as JSON like {"topic": "refund"}')])
try:
    bad.invoke({})
except KeyError as e:
    print("KeyError:", e.args[0][:66])
good = ChatPromptTemplate.from_messages([("system", 'Reply as JSON like {{"topic": "refund"}}')])
print(good.invoke({}).to_messages()[0].content)</div>
  <div class="fx" data-lang="text">KeyError: Input to ChatPromptTemplate is missing variables {'"topic"'}.  Exp
Reply as JSON like {"topic": "refund"}</div>
  <p>Doubling the braces (<code>{{</code> and <code>}}</code>) makes them literal, as the second template shows. The other fix, used for the format instructions in section 5, is to pass the JSON in through a variable.</p>
  <p>The third mistake is piping retriever output straight into a prompt. A retriever returns <code>Document</code> objects, not text, so the model ends up reading Python's internal representation, ids and all:</p>
  <div class="fx" data-lang="py">leaky = RunnableParallel(context=hybrid, question=RunnablePassthrough()) | rag_prompt
system_text = leaky.invoke(QUESTION).to_messages()[0].content
print(system_text[system_text.index("Sources:"):][:110])</div>
  <div class="fx" data-lang="text">Sources:
[Document(id='b656b63c-1bb9-464a-bcb4-f1e8ff4f2907', metadata={'doc': 'Refund policy', 'section': 'La</div>
  <p>That is noise the model has to read and you pay for. Always format Documents into text first, with a function like <code>format_docs</code>.</p>
  <p>A few more mistakes are worth knowing. Copying legacy tutorials leads to <code>LLMChain</code>, <code>initialize_agent</code>, <code>AgentExecutor</code> and the old memory classes, which now live in <code>langchain-classic</code> or are deprecated. Re-sending unbounded history makes every call more expensive until the context overflows. Judging answer quality with fake models proves nothing, because fakes test wiring only. And reaching for LangChain for a single API call adds concepts without adding value.</p>

  <h2 id="lc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>LangChain</b>: standard interfaces for the parts of LLM apps, plus provider integrations and a way to compose them (LCEL).</li>
    <li><b>Runnable</b>: any part with <code>invoke</code>, <code>batch</code>, <code>stream</code>, <code>ainvoke</code>, <code>astream</code>.</li>
    <li><b>LCEL</b>: composing Runnables with <code>|</code>; <code>a | b</code> calls <code>a.__or__(b)</code> and returns a RunnableSequence.</li>
    <li><b>Prompt template</b>: a reusable prompt with <code>{slots}</code>; <code>MessagesPlaceholder</code> inserts a list of messages.</li>
    <li><b>Chat model</b>: messages in, <code>AIMessage</code> out (content, tool_calls, usage_metadata).</li>
    <li><b>Output parser</b>: message → Python value, or <code>OutputParserException</code>.</li>
    <li><b>Structured output</b>: the provider constrains the reply to a schema (<code>with_structured_output</code>).</li>
    <li><b>Document</b>: page_content + metadata. <b>Retriever</b>: query string → list of Documents.</li>
    <li><b>Callback handler</b>: hooks called as parts start and end. <b>Trace</b>: the tree of steps of one run.</li>
    <li><b>create_agent</b>: the model ⇄ tools loop, built on LangGraph.</li>
  </ul>
  <h3>Parts and types</h3>
  <table class="tbl">
    <tr><th>Part</th><th>Main API</th><th>In → out</th></tr>
    <tr><td>Prompt</td><td><code>ChatPromptTemplate.from_messages</code>, <code>.partial()</code></td><td>dict → ChatPromptValue</td></tr>
    <tr><td>Model</td><td><code>ChatAnthropic</code>, <code>FakeListChatModel</code>, <code>SimpleChatModel</code></td><td>messages → AIMessage</td></tr>
    <tr><td>Parser</td><td><code>StrOutputParser</code>, <code>JsonOutputParser</code>, <code>PydanticOutputParser</code></td><td>AIMessage → str / dict / object</td></tr>
    <tr><td>Retrieval</td><td><code>MarkdownHeaderTextSplitter</code>, <code>InMemoryVectorStore</code>, <code>.as_retriever()</code>, <code>BaseRetriever</code></td><td>str → [Document]</td></tr>
    <tr><td>Wiring</td><td><code>RunnableParallel</code>, <code>RunnablePassthrough(.assign)</code>, <code>RunnableLambda</code></td><td>x → {k: f(x)}, x → x, x → fn(x)</td></tr>
    <tr><td>Memory</td><td>a message list + <code>trim_messages</code> + a condense step</td><td>history → bounded history</td></tr>
    <tr><td>Hardening</td><td><code>.with_retry()</code>, <code>.with_fallbacks([...])</code></td><td>failure → retry / alternative</td></tr>
    <tr><td>Tools</td><td><code>@tool</code>, <code>bind_tools</code>, <code>create_agent</code></td><td>function → schema → loop</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">setup = {"context": retriever | format_docs, "question": RunnablePassthrough()}
rag_chain = setup | prompt | llm | StrOutputParser()
answer = rag_chain.invoke("My order arrived 50 minutes late. Can I get my money back?")

safe = (prompt | llm | parser).with_retry(stop_after_attempt=3).with_fallbacks([default])
answer = rag_chain.invoke(question, config={"callbacks": [MyHandler()]})</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Types change at every step; put a parser or formatter between mismatched steps.</li>
    <li>The question must reach both the retriever and the prompt: use a passthrough.</li>
    <li>Literal braces in templates must be doubled.</li>
    <li>Format Documents into text before they reach a prompt.</li>
    <li>Retry only transient errors; never blindly retry side effects.</li>
    <li>Fakes test wiring, not quality.</li>
    <li>Legacy classes (<code>LLMChain</code>, <code>AgentExecutor</code>, memory classes) are in langchain-classic or deprecated.</li>
  </ul>

  <h2 id="lc-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is LangChain, and what problem does it solve?</summary><div class="qa-body">LangChain is a library of standard interfaces for the parts of LLM applications (prompts, chat models, parsers, retrievers, tools) with integrations for many providers. It removes the repeated glue code between those parts, makes them swappable, and gives every part batching, streaming, tracing, retries and fallbacks. It does not make the model itself any smarter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a Runnable, and why does it matter?</summary><div class="qa-body">A Runnable is any object implementing the shared interface: <code>invoke</code>, <code>batch</code>, <code>stream</code> and their async versions. Because prompts, models, parsers, retrievers, tools and chains are all Runnables, they compose with <code>|</code>, and every cross-cutting feature (callbacks, retries, fallbacks, batching) works on every one of them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the <code>|</code> operator work in LCEL? How would you build it yourself?</summary><div class="qa-body">Python turns <code>a | b</code> into <code>a.__or__(b)</code>. LangChain's <code>__or__</code> returns a RunnableSequence whose <code>invoke(x)</code> is <code>b.invoke(a.invoke(x))</code>. A minimal version is a class with <code>invoke</code> and an <code>__or__</code> that returns a new object wrapping <code>lambda x: other.invoke(self.invoke(x))</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Trace <code>chain.invoke(inputs)</code> for <code>prompt | llm | StrOutputParser()</code>.</summary><div class="qa-body">The prompt template fills its slots and returns a <code>ChatPromptValue</code>. The chat model reads those messages and returns an <code>AIMessage</code> with content, tool calls and usage. The parser takes the message content and returns a <code>str</code>. Three steps in order, no hidden state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>PromptTemplate</code> vs <code>ChatPromptTemplate</code>; what is <code>MessagesPlaceholder</code>?</summary><div class="qa-body"><code>PromptTemplate</code> renders a single string; <code>ChatPromptTemplate</code> renders a list of role-tagged messages for chat models. <code>MessagesPlaceholder("history")</code> is a slot for a whole list of messages, such as chat history, spliced in at that position.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are fake chat models for, and what can't they tell you?</summary><div class="qa-body">They implement the chat-model interface with scripted or computed replies, so you can build and test chains, parsers, retries and agents offline, deterministically and for free. They cannot tell you whether a real model will answer well; that needs a real model and an evaluation set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>PydanticOutputParser</code> vs <code>with_structured_output</code>: which would you use?</summary><div class="qa-body">The parser adds format instructions to the prompt and validates the text afterwards, raising <code>OutputParserException</code> on missing fields, invalid values or prose. <code>with_structured_output</code> uses the provider's native schema support so the reply always fits. Prefer structured output with real models; keep a parser plus a fallback for models without it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a retriever, and how do you make a custom one?</summary><div class="qa-body">A Runnable that takes a query string and returns a list of Documents. Any vector store gives one through <code>as_retriever(search_kwargs={"k": 3})</code>. For any other search, subclass <code>BaseRetriever</code> and implement <code>_get_relevant_documents</code>, as we did with BM25.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a RAG chain need <code>RunnablePassthrough</code>?</summary><div class="qa-body">The question has to go to two places: through the retriever into <code>{context}</code>, and unchanged into <code>{question}</code>. A pipe passes only one value forward, so a <code>RunnableParallel</code> dict with a passthrough branch forks it. Without it, the prompt fails with a missing <code>question</code> variable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you build hybrid retrieval with LCEL?</summary><div class="qa-body"><code>RunnableParallel(bm25=bm25_retriever, dense=dense_retriever) | RunnableLambda(rrf_merge)</code>. Both retrievers receive the same question, and the lambda fuses the two ranked lists with reciprocal rank fusion and returns the top documents.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does memory work in LangChain, and why does RAG need question condensing?</summary><div class="qa-body">The model and chain are stateless; your code stores the messages and re-sends a trimmed or summarised version each turn. In RAG, retrieval runs before the model on the raw follow-up, and "How long does that take?" has no searchable words, so you first rewrite history plus follow-up into a standalone question. For persistent memory across restarts, LangChain now points to LangGraph's persistence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare buffer, window, summary and summary-plus-window memory.</summary><div class="qa-body">Buffer re-sends everything and grows until it overflows. Window keeps the last k turns, is bounded but forgets early facts. Summary keeps a running model-written summary, small but lossy and needs an extra call. Summary plus window keeps recent turns verbatim and summarises older ones, the usual balance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you debug a wrong answer from a RAG chain?</summary><div class="qa-body">Trace the run (callbacks or LangSmith) or invoke prefixes of the chain, such as <code>setup.invoke(q)</code>. If the retrieved documents lack the answer, fix retrieval (chunking, hybrid search, k, condensing); if they contain it, fix the prompt or the model. Add the failing case to an evaluation set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make a chain resilient to provider failures?</summary><div class="qa-body">Use <code>with_retry</code> for transient errors such as timeouts and rate limits, limited to those exception types; <code>with_fallbacks</code> for outages (a backup model) and bad outputs (a safe default); <code>timeout</code> and <code>max_retries</code> on the model; and <code>max_concurrency</code> in <code>batch</code> to stay under rate limits. Never blindly retry side-effecting steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>bind_tools</code> vs <code>create_agent</code>?</summary><div class="qa-body"><code>bind_tools</code> only attaches tool schemas to the model's requests, so its reply may contain tool calls, but nothing runs them. <code>create_agent</code> builds the loop: run the requested tools, append <code>ToolMessage</code>s, call the model again, until it answers, with middleware such as tool-call limits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between LangChain and LangGraph?</summary><div class="qa-body">LangChain provides the parts and composes them into chains, which run each step once in order. LangGraph runs stateful graphs: loops, branches, checkpoints that survive restarts, and interrupts for human approval. Tool-using agents need loops, so <code>create_agent</code> itself runs on LangGraph.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happened to <code>LLMChain</code>, <code>AgentExecutor</code> and <code>ConversationBufferMemory</code>?</summary><div class="qa-body">Since version 1.0 they live in the <code>langchain-classic</code> package and are considered legacy. New code uses LCEL chains (<code>prompt | model | parser</code>), <code>create_agent</code> for tool loops, and LangGraph persistence for memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use LangChain?</summary><div class="qa-body">For one or two calls in a fixed flow (use the provider SDK), on latency-critical paths with nothing to swap, or when the team spends more time fighting the framework than improving the model's behaviour. The run-time overhead is small; the real cost is complexity. For loops, approval and resuming, use LangGraph.</div></details>
</main>
`
});
