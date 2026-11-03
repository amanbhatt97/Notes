// notes/genai/langgraph.js — LangGraph
Object.assign(TOPIC_CONTENT, {
  "langgraph": `<main>
<h1>LangGraph</h1>
  <div class="where"><span>Generative AI</span><span>Agents</span><span>LangGraph</span></div>
  <p class="lead">LangGraph is a library for building LLM applications whose steps loop, branch, pause and remember, rather than running once in a straight line. The Biteful support assistant from <a class="xref" data-note="rag">RAG</a> and <a class="xref" data-note="langchain">LangChain</a> retrieves policy text and answers, and that is all it can do; a real support assistant also needs to notice a weak answer, search again with better words, hand a question it cannot answer to a human, and pick the conversation up again after the server restarts. Those needs come up in almost every serious agent, which is why LangGraph is now the usual foundation for agents built on the LangChain ecosystem (LangChain's own <code>create_agent</code> runs on it). We will follow three Biteful customers through the whole page: one whose order was 50 minutes late (easy), one who writes "The rider took forever. Will I be compensated?" (needs a second search), and one who asks for the restaurant's wifi password (needs a person). Each section adds one idea to the same support program, and every block below was run with langgraph 1.2; the "LLM" is the stand-in from the RAG note, so no API key is needed.</p>

  <h2 id="lg-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">LangGraph</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why a graph</div>
        <ul>
          <li>A chain runs each step once, in a line</li>
          <li>A hand-written loop can retry, but cannot pause, resume or remember</li>
          <li>LangGraph saves the state after every step</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The three parts</div>
        <ul>
          <li><b>State</b>: one shared typed dict; <b>reducers</b> decide overwrite or append</li>
          <li><b>Nodes</b>: functions, state in, changed keys out</li>
          <li><b>Edges</b>: fixed, or chosen by a router; may loop back</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">What saving buys</div>
        <ul>
          <li><b>Checkpointer</b> + <code>thread_id</code>: memory and crash recovery</li>
          <li><code>interrupt()</code> / <code>Command(resume=)</code>: wait for a human</li>
          <li><code>stream()</code>: watch each step live</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Watch out for</div>
        <ul>
          <li>Every cycle needs a stop condition in state</li>
          <li>Chat history needs <code>add_messages</code></li>
          <li>An interrupted node re-runs from its first line</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lg-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why a Graph?</span><span class="rm-sub">a straight chain, a hand loop, and what both lack</span></div></div>
      <div class="rm-item rm-done" data-target="lg-state"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">State and Reducers</span><span class="rm-sub">the shared dict and how writes are merged</span></div></div>
      <div class="rm-item rm-done" data-target="lg-nodes"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Nodes and Edges</span><span class="rm-sub">the steps, and who decides what runs next</span></div></div>
      <div class="rm-item rm-done" data-target="lg-cycle"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Cycles and Stop Conditions</span><span class="rm-sub">trying again without looping forever</span></div></div>
      <div class="rm-item rm-done" data-target="lg-tools"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Tools in a Graph</span><span class="rm-sub">the model-driven tool loop as two nodes</span></div></div>
      <div class="rm-item rm-done" data-target="lg-ckpt"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Checkpointing and Threads</span><span class="rm-sub">memory that survives a restart</span></div></div>
      <div class="rm-item rm-done" data-target="lg-hitl"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Human-in-the-Loop</span><span class="rm-sub">pausing for a person and resuming later</span></div></div>
      <div class="rm-item rm-done" data-target="lg-stream"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Streaming</span><span class="rm-sub">seeing each step as it happens</span></div></div>
      <div class="rm-item rm-done" data-target="lg-sub"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Subgraphs</span><span class="rm-sub">a whole graph used as one node</span></div></div>
      <div class="rm-item rm-done" data-target="lg-when"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">When to Use LangGraph</span><span class="rm-sub">and when plain code is better</span></div></div>
      <div class="rm-item rm-done" data-target="lg-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">reducers, full-state returns, thread ids</span></div></div>
      <div class="rm-item rm-done" data-target="lg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">terms, APIs, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="lg-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about LangGraph</span></div></div>
    </div>
  </div>

  <h2 id="lg-why"><span class="num">01</span>Why a Graph?</h2>
  <p>Let us start with the support assistant exactly as the RAG note left it. It has two parts: a search over Biteful's 13 policy sections using BM25 (a keyword-matching score that ranks sections by how many of the question's rarer words they contain), and a "generate" step that writes an answer from the sections it was given and cites the one it used. Put one after the other and you have a <strong>chain</strong>: a fixed sequence of steps where each runs exactly once, in order. We run our three customers through it:</p>
  <div class="fx" data-lang="py">import re
from rag_basics import DOCS, QUESTION, make_chunks, bm25, fake_llm   # from the RAG note

chunks = make_chunks(DOCS)                        # 13 policy sections
texts = [c["text"] for c in chunks]

def search(query, k=3):                           # BM25: top 3 sections that share words
    s = bm25(query, texts)
    return [chunks[i] for i in sorted(range(len(texts)), key=lambda i: -s[i])[:k] if s[i] &gt; 0]

def generate(query, docs):                        # stand-in LLM from the RAG note
    sources = "\\n".join(f"[{n}] {d['text']}" for n, d in enumerate(docs, 1))
    return fake_llm(f"Sources:\\n{sources}\\n\\nQuestion: {query}")

def pipeline(question):                           # a chain: one straight pass
    return generate(question, search(question))

RIDER = "The rider took forever. Will I be compensated?"
WIFI = "What is the wifi password at the restaurant?"
for q in [QUESTION, RIDER, WIFI]:
    print(pipeline(q)[:70])</div>
  <div class="fx" data-lang="text">If your order arrives more than 45 minutes after the promised time, Bi
I don't know based on these sources.
I don't know based on these sources.</div>
  <p>The first customer gets the correct 45-minute rule. The second gets "I don't know", even though the policy does answer the question: they wrote "took forever" and "compensated", while the policy says "late" and "refunds", so the keyword search never found the right section. The RAG note called this a missed retrieval. The third customer also gets "I don't know", which is honest, but then nothing else happens; they are left alone with it.</p>
  <p>A human support agent would behave differently. They would read their own draft reply, notice that it is weak, rephrase the search ("is there a refund if my order is late?") and look again; and if that still found nothing, they would pass the chat to a colleague. That behaviour has a loop in it (try again) and a branch (answer or hand over). We can write it in plain Python:</p>
  <div class="fx" data-lang="py">REWRITES = {RIDER: "Is there a refund if my order is late?"}
def rewrite(query):                               # stand-in for an LLM "rephrase this" call
    return REWRITES.get(query, query)

def grounded(answer, docs):                       # is the cited sentence really in that source?
    m = re.search(r"(.+) \\[(\\d+)\\]$", answer)
    return bool(m) and int(m[2]) &lt;= len(docs) and m[1] in docs[int(m[2]) - 1]["text"]

def support_loop(question, max_attempts=2):
    query = question
    for attempt in range(1, max_attempts + 1):
        docs = search(query)
        answer = generate(query, docs)
        if grounded(answer, docs):
            return answer[:50], attempt
        query = rewrite(query)
    return "ESCALATE to a human agent", attempt

for q in [QUESTION, RIDER, WIFI]:
    print(support_loop(q))</div>
  <div class="fx" data-lang="text">('If your order arrives more than 45 minutes after t', 1)
('If your order arrives more than 45 minutes after t', 2)
('ESCALATE to a human agent', 2)</div>
  <p>Here <code>rewrite</code> stands in for an LLM call that rephrases the question, and <code>grounded</code> checks that the answer's cited sentence really appears in the source it cites. The loop works: customer 1 is answered on attempt 1, customer 2 on attempt 2 after the rewrite, and customer 3 is escalated after two attempts.</p>
  <p>So why not stop here? Picture this function in production. "Escalate" means waiting minutes or hours for a person to reply, but a Python function cannot sit paused inside a web server for hours. If the server restarts in the middle of the loop, <code>query</code>, <code>docs</code> and <code>attempt</code> were ordinary local variables, so they are gone. If the customer writes again an hour later, nothing remembers the earlier conversation. And when the loop misbehaves, there is no record of which step did what. Each of these can be solved by hand, but the solutions are the same in every project: save the program's data after each step, so it can be loaded again later.</p>
  <p>That is the idea behind <strong>LangGraph</strong>: a library that runs your LLM application as a graph of steps and saves the shared data after every step. You write each step as a separate function, called a <strong>node</strong>. You keep everything the steps share in one dictionary, called the <strong>state</strong>. You declare which node runs after which, using <strong>edges</strong>, and some edges can choose between several next nodes or point back to an earlier one. Because the state is saved after each node, pausing becomes "save and stop", resuming becomes "load the last save and continue", and remembering a conversation becomes "load this customer's last save". In computer-science terms this makes the app a <strong>state machine</strong>: a system that is always at one known point and moves between points by fixed rules.</p>
  <p>Think of the difference between cooking from memory and running a restaurant kitchen with order tickets. A cook working from memory can do the job, but if they are interrupted, the half-finished dish and the knowledge of what comes next exist only in their head. In a restaurant, each order has a ticket that records what has been done and what is next, so any cook can pick it up, a dish can wait while the manager approves a change, and nothing is lost at a shift change. The hand-written loop is cooking from memory; LangGraph gives every run a ticket.</p>
  <p>LangGraph and LangChain do different jobs and are often used together. LangChain's pipe syntax (LCEL) builds the logic <em>inside</em> one step, such as prompt → model → parser. LangGraph builds the flow <em>between</em> steps, with branches, loops and saved state. An LCEL chain often runs inside a LangGraph node. The rest of this page rebuilds the support loop as a graph, one part at a time.</p>

  <h2 id="lg-state"><span class="num">02</span>State and Reducers</h2>
  <p>In the hand loop, the steps shared data through local variables of one function. Once each step is a separate function run by LangGraph, they need a shared place to read from and write to. That place is the <strong>state</strong>: a single dictionary that every node receives, declared as a <code>TypedDict</code> (a normal Python dict whose keys and value types are listed in a class, so readers and tools know what it contains).</p>
  <p>Each node receives the whole state but returns <strong>only the keys it changed</strong>, and LangGraph merges that small update into the state. This raises a question: when a node returns a new value for a key, should it replace the old value or be added to it? For a counter like <code>attempts</code>, replacing is right: if it was 1 and the node says 2, it is now 2. For a log of what happened, adding is right: we want the new entry appended, not the whole log replaced. LangGraph lets you choose per key with a <strong>reducer</strong>, a function that takes the old value and the update and returns the merged value. You attach one with <code>Annotated[type, reducer]</code>. Keys with no reducer are simply overwritten. Python's <code>operator.add</code> works as a reducer for lists, because <code>old + new</code> joins them.</p>
  <p>A shared notebook passed around a team is a good picture. Some lines in it are "current status" and get crossed out and rewritten; other pages are a diary where each person adds a line at the bottom. The reducer is the rule printed at the top of each page saying which kind it is.</p>
  <p>Here is Biteful's state. We add a <code>steps</code> list with the <code>operator.add</code> reducer so that every node can record what it did, which gives us a trace of the path taken. To see the merge rules in action, we build the smallest possible graph, with one node, and start it with <code>attempts=1</code> and one step already logged:</p>
  <div class="fx" data-lang="py">import operator
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END

class SupportState(TypedDict):
    question: str                                 # what the customer typed
    query: str                                    # what we search with (may be rewritten)
    docs: list                                    # retrieved sections
    answer: str
    ok: bool                                      # did the answer pass the check?
    attempts: int                                 # no reducer: a write replaces the value
    steps: Annotated[list[str], operator.add]     # reducer: a write is appended

def count_attempt(state: SupportState):           # returns ONLY the keys it changes
    return {"attempts": state["attempts"] + 1, "steps": ["retrieve #2"]}

g = StateGraph(SupportState)
g.add_node("count_attempt", count_attempt)
g.add_edge(START, "count_attempt")
g.add_edge("count_attempt", END)
print(g.compile().invoke({"question": QUESTION, "attempts": 1, "steps": ["retrieve #1"]}))</div>
  <div class="fx" data-lang="text">{'question': 'My order arrived 50 minutes late. Can I get my money back?', 'attempts': 2, 'steps': ['retrieve #1', 'retrieve #2']}</div>
  <p>The node returned <code>attempts: 2</code> and <code>steps: ['retrieve #2']</code>. In the final state <code>attempts</code> is 2, because the old value 1 was overwritten, while <code>steps</code> is <code>['retrieve #1', 'retrieve #2']</code>, because the reducer appended the new entry. The <code>question</code> key is unchanged since the node did not return it, and keys nobody has set yet (<code>docs</code>, <code>answer</code>) do not appear at all. The four lines of graph-building (<code>StateGraph</code>, <code>add_node</code>, two <code>add_edge</code> calls) are explained in the next section; for now notice that <code>compile()</code> turns the description into something you can <code>invoke</code>.</p>
  <p>Chat applications keep a list of messages, and they need a slightly smarter reducer than plain appending. LangGraph provides <code>add_messages</code>: it appends new messages, but if an incoming message has the same <code>id</code> as one already in the list, it replaces that message instead. This lets a node correct a message it wrote earlier.</p>
  <div class="fx" data-lang="py">from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph.message import add_messages

old = [HumanMessage("My order is late", id="1"), AIMessage("Sorry! Checking.", id="2")]
print([m.content for m in add_messages(old, [AIMessage("It was 50 minutes late.", id="3")])])
print([m.content for m in add_messages(old, [AIMessage("Sorry about that!", id="2")])])</div>
  <div class="fx" data-lang="text">['My order is late', 'Sorry! Checking.', 'It was 50 minutes late.']
['My order is late', 'Sorry about that!']</div>
  <p>The first call adds a message with a new id (3), so the history grows to three messages. The second sends a message with id 2, so "Sorry! Checking." is replaced by "Sorry about that!" and the length stays two. LangGraph also ships a ready-made state, <code>MessagesState</code>, whose only key is <code>messages</code> with this reducer; we use it when we add tools. Without any reducer, every node's write would replace the whole chat, and the customer's own message would vanish after the first reply (Common Mistakes shows this happening).</p>

  <h2 id="lg-nodes"><span class="num">03</span>Nodes and Edges</h2>
  <p>A <strong>node</strong> is one step of the graph: a plain Python function that receives the current state and returns a dict containing only the keys it wants to change. A node does not know which node ran before it or which will run after it. That independence is what makes nodes easy to test (you can call one like any function), easy to rearrange, and safe to run again after a pause.</p>
  <p>An <strong>edge</strong> says what runs next. A normal edge, added with <code>add_edge("retrieve", "answer")</code>, means "after retrieve, always run answer". Two special names mark the entry and exit of the graph: <code>START</code> and <code>END</code>. A <strong>conditional edge</strong>, added with <code>add_conditional_edges("check", router, mapping)</code>, makes a decision: after <code>check</code> finishes, LangGraph calls your <code>router</code> function with the state, the router returns a label such as <code>"done"</code>, and the mapping turns that label into the name of the next node. Finally, <code>compile()</code> checks the wiring (no edges to unknown nodes, every node reachable) and returns an app with <code>invoke</code> and <code>stream</code> methods.</p>
  <p>A metro map is the natural picture. Stations are nodes, tracks are edges, and an interchange where a train can continue on one of two lines is a conditional edge. The map is drawn before any train runs; the passenger, who is the state, moves along it.</p>
  <p>Below, the hand loop's body becomes four nodes. <code>retrieve</code> searches and counts the attempt, <code>answer</code> drafts the reply, <code>check</code> tests whether it is grounded, and <code>escalate</code> is a placeholder for handing over to a person (we make it real in section 07). The router <code>after_check</code> reads <code>ok</code> from the state and returns <code>"done"</code> or <code>"human"</code>. There is no retry yet; that is the next section.</p>
  <div class="fx" data-lang="py">def retrieve(state: SupportState):
    n = state["attempts"] + 1
    return {"docs": search(state["query"]), "attempts": n, "steps": [f"retrieve #{n}"]}

def answer(state: SupportState):
    return {"answer": generate(state["query"], state["docs"]), "steps": ["answer"]}

def check(state: SupportState):
    ok = grounded(state["answer"], state["docs"])
    return {"ok": ok, "steps": [f"check: {'ok' if ok else 'weak'}"]}

def escalate(state: SupportState):                # placeholder; made real later
    return {"answer": "ESCALATE to a human agent", "steps": ["escalate"]}

def after_check(state: SupportState):             # a router: reads state, returns a label
    return "done" if state["ok"] else "human"

g = StateGraph(SupportState)
g.add_node("retrieve", retrieve)
g.add_node("answer", answer)
g.add_node("check", check)
g.add_node("escalate", escalate)
g.add_edge(START, "retrieve")
g.add_edge("retrieve", "answer")
g.add_edge("answer", "check")
g.add_conditional_edges("check", after_check, {"done": END, "human": "escalate"})
g.add_edge("escalate", END)
app = g.compile()

for q in [QUESTION, RIDER]:
    out = app.invoke({"question": q, "query": q, "attempts": 0, "steps": []})
    print(out["steps"], "|", out["answer"][:40])</div>
  <div class="fx" data-lang="text">['retrieve #1', 'answer', 'check: ok'] | If your order arrives more than 45 minut
['retrieve #1', 'answer', 'check: weak', 'escalate'] | ESCALATE to a human agent</div>
  <p>The <code>steps</code> list built by the reducer shows each customer's path. The late-order customer went retrieve → answer → check, the check passed, the router returned <code>"done"</code>, and the mapping sent the run to <code>END</code>. The rider customer's check came back weak, so the router returned <code>"human"</code> and the run went through <code>escalate</code> before ending. Notice who chose the route: it was <em>our</em> router, reading a value in the state. The model's output affects the route, because it determines whether <code>ok</code> is true, but the model cannot jump to an arbitrary node on its own. Keeping routing decisions in your own small functions is what makes a graph predictable and debuggable.</p>
  <p>Every label a router can return must appear in the mapping. A router that returns a label the mapping does not know fails at run time, and if that label is only returned on a rare branch, the failure may first appear in production. The habit to build is testing each branch with an input that takes it, as we did here with two customers.</p>

  <h2 id="lg-cycle"><span class="num">04</span>Cycles and Stop Conditions</h2>
  <p>The rider customer was sent straight to a human, yet the hand loop showed that one rephrased search would have found the answer. We need the graph to go back and try again. In a graph, "go back" is simply an edge that points to an earlier node, which creates a <strong>cycle</strong> (a loop in the graph). Our cycle will be <code>rewrite → retrieve</code>: rephrase the query, then search again.</p>
  <p>A cycle immediately raises a danger. A question nobody can answer, like the wifi password, would loop forever, and with a real model every lap costs money. So every cycle needs a <strong>stop condition</strong>: logic, based on the state, that guarantees an exit. We put it in the router. After <code>check</code>, the router returns <code>"done"</code> if the answer is good; otherwise <code>"retry"</code> only while <code>attempts</code> is below 2; otherwise <code>"human"</code>. This works because <code>retrieve</code> increments <code>attempts</code> in the state on every lap, so the router always knows how many tries have happened. A local variable could not do this job, since each node is a separate function call and the count must survive between them (and, later, across pauses and restarts).</p>
  <p>A chef tasting a sauce is a good comparison: taste, adjust, taste again. A well-run kitchen has a rule like "adjust at most twice, then call the head chef", because otherwise one fussy sauce could hold up dinner indefinitely.</p>
  <figure class="viz"><svg viewBox="0 0 640 175" width="640"><defs><marker id="lg-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="10" y="66" width="60" height="28" rx="14" class="fs"/><text x="40" y="84" text-anchor="middle" font-size="11">START</text><rect x="95" y="60" width="90" height="40" rx="6" class="ft st"/><text x="140" y="85" text-anchor="middle" font-weight="bold">retrieve</text><rect x="210" y="60" width="90" height="40" rx="6" class="fb sb"/><text x="255" y="85" text-anchor="middle" font-weight="bold">answer</text><rect x="325" y="60" width="90" height="40" rx="6" class="fv"/><text x="370" y="85" text-anchor="middle" font-weight="bold">check</text><rect x="545" y="66" width="70" height="28" rx="14" class="fs"/><text x="580" y="84" text-anchor="middle" font-size="11">END</text><rect x="440" y="125" width="100" height="36" rx="6" class="fr sr"/><text x="490" y="148" text-anchor="middle" font-weight="bold">escalate</text><rect x="210" y="125" width="90" height="36" rx="6" class="fg sg"/><text x="255" y="148" text-anchor="middle" font-weight="bold">rewrite</text><line x1="70" y1="80" x2="93" y2="80" stroke="currentColor" marker-end="url(#lg-a2)"/><line x1="185" y1="80" x2="208" y2="80" stroke="currentColor" marker-end="url(#lg-a2)"/><line x1="300" y1="80" x2="323" y2="80" stroke="currentColor" marker-end="url(#lg-a2)"/><line x1="415" y1="80" x2="543" y2="80" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="480" y="72" text-anchor="middle" font-size="10" class="tg">done (ok)</text><path d="M390,100 V143 H438" fill="none" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="430" y="118" text-anchor="middle" font-size="10" class="tr">human (attempts = 2)</text><path d="M350,100 V143 H302" fill="none" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="330" y="172" text-anchor="middle" font-size="10" class="tb">retry (attempts &lt; 2)</text><path d="M210,143 H140 V102" fill="none" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="160" y="125" text-anchor="middle" font-size="10" class="tm">cycle</text><path d="M540,143 H580 V96" fill="none" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="40" y="30" font-size="10.5" class="tm">Biteful support graph: retrieve → answer → check → (done | retry via rewrite | human)</text></svg><figcaption>Three ways out of check. The retry edge creates the cycle; the attempts counter in the state is the stop condition.</figcaption></figure>
  <p>Read the figure from left to right. Every run enters at <code>retrieve</code>, drafts an answer and checks it. From <code>check</code> there are three exits: straight to the end if the answer is good, down to <code>escalate</code> if two attempts have already been made, or round through <code>rewrite</code> and back to <code>retrieve</code> otherwise. Here is the same graph in code. We wrap the construction in <code>build_graph</code> because later sections reuse it with different settings:</p>
  <div class="fx" data-lang="py">MAX_ATTEMPTS = 2

def rewrite_query(state: SupportState):
    return {"query": rewrite(state["query"]), "steps": ["rewrite"]}

def after_check(state: SupportState):             # three ways out of "check"
    if state["ok"]:
        return "done"
    return "retry" if state["attempts"] &lt; MAX_ATTEMPTS else "human"   # the stop condition

def build_graph(router=after_check):
    g = StateGraph(SupportState)
    for name, fn in [("retrieve", retrieve), ("answer", answer), ("check", check),
                     ("rewrite", rewrite_query), ("escalate", escalate)]:
        g.add_node(name, fn)
    g.add_edge(START, "retrieve")
    g.add_edge("retrieve", "answer")
    g.add_edge("answer", "check")
    g.add_conditional_edges("check", router, {"done": END, "retry": "rewrite", "human": "escalate"})
    g.add_edge("rewrite", "retrieve")             # the cycle: back to an earlier node
    g.add_edge("escalate", END)
    return g

app = build_graph().compile()
for q in [QUESTION, RIDER, WIFI]:
    out = app.invoke({"question": q, "query": q, "attempts": 0, "steps": []})
    print(out["steps"])</div>
  <div class="fx" data-lang="text">['retrieve #1', 'answer', 'check: ok']
['retrieve #1', 'answer', 'check: weak', 'rewrite', 'retrieve #2', 'answer', 'check: ok']
['retrieve #1', 'answer', 'check: weak', 'rewrite', 'retrieve #2', 'answer', 'check: weak', 'escalate']</div>
  <p>The three traces match the three exits. The late-order customer takes the short path in 3 steps. The rider customer's first check is weak, the router sees <code>attempts</code> = 1 and returns <code>"retry"</code>, the query is rewritten to "Is there a refund if my order is late?", the second search finds the "Late orders" section, and the second check passes: 7 steps. The wifi customer goes round the loop once too, but the rewrite cannot help (our stand-in rewriter leaves unknown questions unchanged), so after the second weak check the router sees <code>attempts</code> = 2 and returns <code>"human"</code>.</p>
  <p>What happens if the stop condition is forgotten? LangGraph has a last line of defence called the <strong>recursion limit</strong>: the maximum number of steps one run may take, set with <code>{"recursion_limit": n}</code> in the config. When a run reaches it, LangGraph raises <code>GraphRecursionError</code>. Below, a router that never returns <code>"human"</code> runs the wifi question with a limit of 12:</p>
  <div class="fx" data-lang="py">from langgraph.errors import GraphRecursionError

no_stop = lambda s: "done" if s["ok"] else "retry"          # forgot the attempts check
broken = build_graph(router=no_stop).compile()
try:
    broken.invoke({"question": WIFI, "query": WIFI, "attempts": 0, "steps": []},
                  {"recursion_limit": 12})
except GraphRecursionError as e:
    print(type(e).__name__, "|", str(e).split(".")[0])</div>
  <div class="fx" data-lang="text">GraphRecursionError | Recursion limit of 12 reached without hitting a stop condition</div>
  <p>The run was stopped at 12 steps with a clear error. The default limit in langgraph 1.2 is very high (over ten thousand steps), which with a real model could mean thousands of paid calls before anything stops, so it is wise to pass a small limit. But the limit is a fuse, not a design: the real protection is a counter or budget in the state that the router checks. A loop whose only exit is "the model says the answer is good enough" is especially risky, because a model can keep saying "not yet".</p>

  <h2 id="lg-tools"><span class="num">05</span>Tools in a Graph</h2>
  <p>So far our graph can only search the policy. A customer who writes "Order B-102 came late. Refund?" needs the order's actual delay from Biteful's order system. As covered in <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>, the model can request a <strong>tool call</strong> (ask your code to run a named function with given arguments), read the result, and then answer. This is the agent loop from <a class="xref" data-note="agentic">Agent Fundamentals</a>, often called ReAct (reason, act, observe): ask the model; if it requested tools, run them and ask again; stop when it replies without a tool request.</p>
  <p>There is an important difference from our support graph. There, <em>our</em> router decided the route. In the tool loop, the <em>model</em> decides whether another lap is needed. Even so, the loop fits the same shape. It has two alternating jobs, "ask the model" and "run the requested tools", which become two nodes. "Did the model ask for a tool?" becomes a conditional edge, and "go back to the model with the result" becomes a fixed edge, creating a cycle. The state is <code>MessagesState</code>, so every message is appended to the conversation.</p>
  <p>LangGraph ships the two standard pieces. <strong><code>ToolNode</code></strong> is a prebuilt node that runs every tool call in the latest model message and appends one <code>ToolMessage</code> per call; if a tool raises an error, the error comes back to the model as a message instead of crashing the graph. <strong><code>tools_condition</code></strong> is a prebuilt router that returns <code>"tools"</code> if the latest message contains tool calls and <code>END</code> otherwise. Think of a support agent and a records desk. The agent reads the case file and either writes "look up order B-102" or replies to the customer; each time they ask, the records desk fetches the record and clips it into the file, and the agent reads the file again.</p>
  <p>To keep the example runnable without an API key, the model is a stand-in, <code>GenericFakeChatModel</code> from LangChain, which replays two scripted replies: first a tool call, then a final answer. With a real model, only the marked line changes.</p>
  <div class="fx" data-lang="py">from langchain_core.tools import tool
from langchain_core.messages import AIMessage
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langgraph.graph import MessagesState
from langgraph.prebuilt import ToolNode, tools_condition

@tool
def order_status(order_id: str) -&gt; str:
    """How late a Biteful order was, for an id like 'B-102'. Use before answering refund questions."""
    return {"B-102": "delivered 50 minutes after the promised time"}.get(order_id, "order not found")

# Stand-in model with two scripted replies. A real one would be
# ChatAnthropic(model="claude-sonnet-5-5").bind_tools([order_status])
llm = GenericFakeChatModel(messages=iter([
    AIMessage("", tool_calls=[{"name": "order_status", "args": {"order_id": "B-102"}, "id": "c1"}]),
    AIMessage("B-102 was 50 minutes late (more than 45), so it qualifies for a full refund."),
]))

def agent(state: MessagesState):
    return {"messages": [llm.invoke(state["messages"])]}

g = StateGraph(MessagesState)
g.add_node("agent", agent)
g.add_node("tools", ToolNode([order_status]))     # runs every requested call
g.add_edge(START, "agent")
g.add_conditional_edges("agent", tools_condition) # "tools" if the reply has tool calls, else END
g.add_edge("tools", "agent")                      # the cycle
react = g.compile()

out = react.invoke({"messages": [("user", "Order B-102 came late. Refund?")]})
for m in out["messages"]:
    print(f"{type(m).__name__:12}|", m.content or m.tool_calls[0]["name"])</div>
  <div class="fx" data-lang="text">HumanMessage| Order B-102 came late. Refund?
AIMessage   | order_status
ToolMessage | delivered 50 minutes after the promised time
AIMessage   | B-102 was 50 minutes late (more than 45), so it qualifies for a full refund.</div>
  <p>The printed messages are the whole conversation in order. The customer's message came first. The agent node ran, and the model's reply had empty text and one tool call, so <code>tools_condition</code> chose <code>"tools"</code>. <code>ToolNode</code> ran <code>order_status("B-102")</code> and appended a <code>ToolMessage</code> containing "delivered 50 minutes after the promised time". That message carries <code>tool_call_id="c1"</code>, matching the id in the request, which is how the model (and the provider's API) knows which request each result answers. The edge from tools led back to the agent, whose second reply had no tool calls, so the router chose <code>END</code>. The path was START → agent → tools → agent → END.</p>
  <p>This two-node graph is so common that LangChain provides it ready-made as <code>langchain.agents.create_agent</code> (see <a class="xref" data-note="langchain">LangChain</a>); the older <code>langgraph.prebuilt.create_react_agent</code> is deprecated in its favour. Writing it by hand, as here, is worth doing once, because real agents usually need an extra node somewhere in this loop: an approval step before a refund tool runs, a guard that checks the tool arguments, or a summariser that shortens a long history.</p>

  <h2 id="lg-ckpt"><span class="num">06</span>Checkpointing and Threads</h2>
  <p>Every graph so far starts from whatever input we pass and forgets everything once <code>invoke</code> returns. That is fine for a single question, but a customer's second message should see the first, and a run that is interrupted by a restart (or, in the next section, by waiting for a human) must be able to continue. This is the feature the hand-written loop could not offer, and it is the main reason LangGraph exists.</p>
  <p>A <strong>checkpointer</strong> is an object that saves a <strong>checkpoint</strong>, a snapshot of the full state plus the name of the node that would run next, after every step. You pass it to <code>compile</code>. From then on, every call must name a <strong>thread</strong> with a <code>thread_id</code> in the config; a thread is one conversation, the sequence of checkpoints for one customer's chat. Before a run, LangGraph loads the thread's latest checkpoint and merges your new input into it using the normal reducers; after each node it saves a new checkpoint. LangGraph offers several checkpointers: <code>InMemorySaver</code> keeps checkpoints in RAM, which is fine for experiments, while <code>SqliteSaver</code> and <code>PostgresSaver</code> write them to a database so they survive restarts.</p>
  <p>Save points in a long video game work the same way. If you lose at hour 20, you restart from your last save, not from the beginning, and each player profile has its own saves stored on disk, so switching the console off loses nothing.</p>
  <p>Below, customer 42 asks two questions on the same thread. Then we simulate a server restart by closing the database connection, deleting the app, and building a fresh app on the same database file:</p>
  <div class="fx" data-lang="py">import os, sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver   # pip install langgraph-checkpoint-sqlite

DB = "biteful_threads.db"
if os.path.exists(DB):
    os.remove(DB)                                 # start the demo from an empty database

conn = sqlite3.connect(DB, check_same_thread=False)
app = build_graph().compile(checkpointer=SqliteSaver(conn))
cfg = {"configurable": {"thread_id": "customer-42"}}

out = app.invoke({"question": QUESTION, "query": QUESTION, "attempts": 0, "steps": []}, cfg)
print("turn 1:", out["steps"])
out = app.invoke({"question": RIDER, "query": RIDER, "attempts": 0}, cfg)   # same thread
print("turn 2:", out["steps"])
print(len(list(app.get_state_history(cfg))), "checkpoints saved for customer-42")

# "Restart the server": drop the app and connection, open new ones on the same file
conn.close(); del app
conn = sqlite3.connect(DB, check_same_thread=False)
app = build_graph().compile(checkpointer=SqliteSaver(conn))
saved = app.get_state(cfg)
print("after restart:", saved.values["answer"][:30], "| steps:", len(saved.values["steps"]))
print("customer-7:", app.get_state({"configurable": {"thread_id": "customer-7"}}).values)</div>
  <div class="fx" data-lang="text">turn 1: ['retrieve #1', 'answer', 'check: ok']
turn 2: ['retrieve #1', 'answer', 'check: ok', 'retrieve #1', 'answer', 'check: weak', 'rewrite', 'retrieve #2', 'answer', 'check: ok']
14 checkpoints saved for customer-42
after restart: If your order arrives more tha | steps: 10
customer-7: {}</div>
  <p>Turn 1 took the usual 3 steps. Turn 2 is the interesting one. Our input for turn 2 did not include <code>steps</code>, so LangGraph loaded the saved list from turn 1 and the reducer <em>appended</em> the 7 new steps to it, giving 10. The thread remembers. The keys we did pass (<code>question</code>, <code>query</code>, <code>attempts=0</code>) overwrote their saved values, because they have no reducer; resetting <code>attempts</code> to 0 is what gives the new question its own two tries. The 14 checkpoints are one per input plus one per step: turn 1 saved 5 (the input, the start, and 3 nodes) and turn 2 saved 9 (the input, the start, and 7 nodes). <code>get_state_history</code> lists them, newest first.</p>
  <p>After the "restart", a completely new app with a new connection read the same file and <code>get_state</code> returned the turn-2 answer with all 10 steps. A thread that was never used, <code>customer-7</code>, is empty. That is the whole of LangGraph memory: same <code>thread_id</code>, same saved state.</p>
  <p>Because every step is saved, a checkpointer gives you several abilities from the one mechanism. <strong>Multi-turn memory</strong>: the next message on the same thread starts from the saved state. <strong>Crash recovery</strong>: a run that died can be continued from its last checkpoint instead of starting over. <strong>Time travel</strong>: you can pick any earlier checkpoint from <code>get_state_history</code>, change values with <code>update_state</code>, and replay from there, which is very useful for debugging. And <strong>interrupts</strong>, the subject of the next section, are just "save and return early". For facts that should be shared <em>across</em> threads, such as a customer's dietary preferences that apply to every chat, LangGraph has a separate <strong>store</strong>, passed as <code>compile(store=...)</code>.</p>
  <p>The <code>thread_id</code> is easy to get wrong. With a checkpointer and no id, LangGraph raises an error. One id shared by two customers means one sees the other's history. A fresh id on every request means there is no memory at all. In practice it is built from the customer and session ids.</p>

  <h2 id="lg-hitl"><span class="num">07</span>Human-in-the-Loop</h2>
  <p>The wifi customer still gets "ESCALATE to a human agent" as their answer, which is a label, not a hand-over. What we actually want is for the graph to stop at <code>escalate</code>, show the case to a support agent, and continue with the agent's reply, which might arrive in two minutes or tomorrow, after a deploy and several restarts. A program cannot simply wait that long inside a server process. This is called <strong>human-in-the-loop</strong> (HITL): pausing a graph so a person can review, edit or answer, then resuming the same thread with their input.</p>
  <p>LangGraph does it with two pieces. Inside a node, you call <strong><code>interrupt(payload)</code></strong>. The graph saves its state and <code>invoke</code> returns immediately, with the payload under the key <code>"__interrupt__"</code> so your support dashboard can display it. Nothing is left running; the paused thread is just a checkpoint in the database. When the person answers, you call <code>invoke(Command(resume=reply), config)</code> on the same thread. LangGraph loads the checkpoint and runs the interrupted node again <em>from its first line</em>, and this time <code>interrupt(...)</code> does not pause; it returns the reply. That re-run is the one surprising detail, so the code below prints a line before and after the interrupt to make it visible.</p>
  <p>A bank works like this for large transfers. The clerk can process small payments alone, but a large one needs a manager's signature, so the clerk puts the form in a tray and carries on with other work. When the manager signs, the form continues from where it stopped. The tray is the checkpoint.</p>
  <div class="fx" data-lang="py">from langgraph.types import interrupt, Command

def escalate(state: SupportState):                # now really hands over to a person
    print("  escalate node starts")
    reply = interrupt({"customer_asked": state["question"], "attempts": state["attempts"]})
    print("  human replied")
    return {"answer": f"[support agent] {reply}", "steps": ["escalate: human answered"]}

app = build_graph().compile(checkpointer=SqliteSaver(conn))
cfg7 = {"configurable": {"thread_id": "customer-7"}}
out = app.invoke({"question": WIFI, "query": WIFI, "attempts": 0, "steps": []}, cfg7)
print("paused with:", out["__interrupt__"][0].value)
print("next node:", app.get_state(cfg7).next)

# Later, after another "restart", a support agent answers and the thread resumes
conn.close(); conn = sqlite3.connect(DB, check_same_thread=False)
app = build_graph().compile(checkpointer=SqliteSaver(conn))
out = app.invoke(Command(resume="Each restaurant sets its own wifi. Please ask the staff."), cfg7)
print(out["answer"])
print(out["steps"][-2:])</div>
  <div class="fx" data-lang="text">  escalate node starts
paused with: {'customer_asked': 'What is the wifi password at the restaurant?', 'attempts': 2}
next node: ('escalate',)
  escalate node starts
  human replied
[support agent] Each restaurant sets its own wifi. Please ask the staff.
['check: weak', 'escalate: human answered']</div>
  <p>The wifi question went round the loop twice and the router sent it to <code>escalate</code>. The node printed "escalate node starts" and then stopped at <code>interrupt</code>; "human replied" was not printed, and <code>invoke</code> returned with the payload, which tells the support agent what the customer asked and how many searches were tried. <code>get_state(cfg7).next</code> confirms the thread is parked at <code>escalate</code>.</p>
  <p>We then simulated another restart and resumed with the support agent's reply. Look at the output: "escalate node starts" was printed <strong>a second time</strong>. On resume the node ran again from the top, and this time <code>interrupt</code> returned the reply, so execution continued to "human replied" and the node returned the human's answer. The last two steps show the weak check and the hand-over. The practical consequence is important: anything before <code>interrupt()</code> in a node runs twice. If the node sent a Slack message to the support team before pausing, the team would get it twice. Put side effects after the interrupt, in a separate node, or make them <strong>idempotent</strong> (safe to repeat, for example by checking whether the message was already sent).</p>
  <p><code>interrupt()</code> is a dynamic pause, used when your own logic decides a person is needed (a refund above ₹1,000, say). LangGraph has a few related tools for other situations:</p>
  <table class="tbl">
    <tr><th>Tool</th><th>What it does</th><th>Typical use</th></tr>
    <tr><td><code>interrupt(value)</code></td><td>Pause inside a node only when your logic calls it; carries a payload; returns the resume value</td><td>Escalation, approval of risky actions</td></tr>
    <tr><td><code>Command(resume=x)</code></td><td>Continue a paused thread; the pending <code>interrupt</code> returns x</td><td>The human's reply or decision</td></tr>
    <tr><td><code>compile(interrupt_before=["node"])</code></td><td>A fixed breakpoint before a node, every time; resume with <code>invoke(None, cfg)</code></td><td>Debugging, steps that are always reviewed</td></tr>
    <tr><td><code>app.update_state(cfg, {...})</code></td><td>Edit the saved state before resuming</td><td>Correct a refund amount, fix a query</td></tr>
    <tr><td><code>Command(goto="node", update={...})</code></td><td>Returned by a node: update state and choose the next node in one go</td><td>"Approved" goes to the tool, "rejected" back to the agent</td></tr>
  </table>
  <p>All of these depend on the checkpointer from the previous section. Pausing means ending one <code>invoke</code> and continuing in a later one, perhaps in a different process; the only thing that connects the two calls is the thread's saved state.</p>

  <h2 id="lg-stream"><span class="num">08</span>Streaming</h2>
  <p>The rider customer's run takes 7 steps, and with a real model each step can take a second or more. If the app only shows a result at the end, the customer stares at a spinner, and when something goes wrong the developer only sees the final state. <strong>Streaming</strong> means receiving a run's intermediate results as they are produced, rather than one result at the end. It is like watching the rider's dot move on the delivery map instead of only being told "delivered".</p>
  <p>In LangGraph you call <code>app.stream(inputs, config, stream_mode=...)</code> instead of <code>invoke</code>, and loop over the events it yields. The <code>stream_mode</code> chooses what each event contains:</p>
  <table class="tbl">
    <tr><th>Mode</th><th>Each event contains</th><th>Use for</th></tr>
    <tr><td><code>"values"</code></td><td>The full state after each step</td><td>Debugging, simple UIs</td></tr>
    <tr><td><code>"updates"</code></td><td>Only what the node that just ran returned</td><td>Progress messages ("searching… drafting…")</td></tr>
    <tr><td><code>"messages"</code></td><td>Model tokens as they are generated</td><td>A typing effect in a chat window</td></tr>
    <tr><td><code>"custom"</code></td><td>Your own events sent from inside nodes with <code>get_stream_writer()</code></td><td>"Checked 3 of 13 sections"</td></tr>
  </table>
  <p>We stream the rider customer's run in <code>"updates"</code> mode, printing each node's name and what it changed (shortened, and without the <code>steps</code> log we already know):</p>
  <div class="fx" data-lang="py">cfg9 = {"configurable": {"thread_id": "customer-9"}}
start = {"question": RIDER, "query": RIDER, "attempts": 0, "steps": []}
for update in app.stream(start, cfg9, stream_mode="updates"):
    for node, changes in update.items():
        shown = {k: (v[:24] if isinstance(v, str) else [d["id"] for d in v] if k == "docs" else v)
                 for k, v in changes.items() if k != "steps"}
        print(f"{node:9}", shown)</div>
  <div class="fx" data-lang="text">retrieve  {'docs': ['delivery.md#2'], 'attempts': 1}
answer    {'answer': "I don't know based on th"}
check     {'ok': False}
rewrite   {'query': 'Is there a refund if my '}
retrieve  {'docs': ['refunds.md#0', 'refunds.md#1', 'faq.md#1'], 'attempts': 2}
answer    {'answer': 'If your order arrives mo'}
check     {'ok': True}</div>
  <p>Each event is a dict of the form <code>{node_name: what_it_returned}</code>, delivered the moment that node finishes. You can read the whole story of the run: the first search found only <code>delivery.md#2</code> (the Tracking section, matched on the word "rider"), the answer was "I don't know", the check failed, the query was rewritten, the second search found <code>refunds.md#0</code> ("Late orders") first, the answer quoted the 45-minute rule, and the check passed. A user interface would map node names to friendly messages such as "Looking that up…" and "Trying a different search…". Several modes can be combined, for example <code>stream_mode=["updates", "messages"]</code>. One caution: <code>"values"</code> sends the entire state on every step, including retrieved documents and internal fields, so for anything shown to customers, stream updates or custom events and filter them.</p>

  <h2 id="lg-sub"><span class="num">09</span>Subgraphs</h2>
  <p>Our graph has five nodes. Biteful's real assistant will have dozens: order lookup, refunds, allergens, address changes. The retrieve → answer pair will be needed in several of those places, and copying it each time would bring back the duplication problem. LangGraph lets you package part of a flow as its own graph and reuse it. A <strong>subgraph</strong> is a compiled graph used as a single node inside another graph: <code>parent.add_node("rag", rag_subgraph)</code>. Large teams use subgraphs to split work, and multi-agent systems use them so that each agent is its own graph (<a class="xref" data-note="multiagent">Multi-Agent Systems &amp; MCP</a>).</p>
  <p>A company department is a fair analogy. Head office sends a file to accounts; how accounts handles it inside is its own business; the file comes back updated. There is one catch, and it is the same one you would hit in the office: if accounts sends back the <em>whole</em> file and head office staples it onto its own copy, every page appears twice. In LangGraph this happens when the parent and the subgraph share a key that has an append reducer:</p>
  <div class="fx" data-lang="py">sub = StateGraph(SupportState)                    # retrieve -&gt; answer as its own small graph
sub.add_node("retrieve", retrieve)
sub.add_node("answer", answer)
sub.add_edge(START, "retrieve")
sub.add_edge("retrieve", "answer")
sub.add_edge("answer", END)
rag_subgraph = sub.compile()

def parent_with(rag_node):
    p = StateGraph(SupportState)
    p.add_node("rag", rag_node)                   # a whole graph used as ONE node
    p.add_node("check", check)
    p.add_edge(START, "rag")
    p.add_edge("rag", "check")
    p.add_edge("check", END)
    return p.compile()

start = {"question": QUESTION, "query": QUESTION, "attempts": 0, "steps": ["start"]}
print(parent_with(rag_subgraph).invoke(start)["steps"])

def call_rag(state: SupportState):                # fix: map state in and out explicitly
    out = rag_subgraph.invoke({**state, "steps": []})          # clean list in
    return {k: out[k] for k in ("docs", "answer", "attempts", "steps")}   # only new work out
print(parent_with(call_rag).invoke(start)["steps"])</div>
  <div class="fx" data-lang="text">['start', 'start', 'retrieve #1', 'answer', 'check: ok']
['start', 'retrieve #1', 'answer', 'check: ok']</div>
  <p>The first line shows the problem: <code>'start'</code> appears twice. The subgraph received the parent's state, including <code>steps=['start']</code>, appended its own two steps, and returned its <em>whole</em> list <code>['start', 'retrieve #1', 'answer']</code>. The parent's <code>operator.add</code> reducer then appended that entire list to its own <code>['start']</code>. The fix, in <code>call_rag</code>, wraps the subgraph in an ordinary function node that controls what goes in and what comes out: it passes the subgraph a clean <code>steps</code> list and returns only the keys the subgraph produced. The second line shows the correct trace. Mapping state explicitly like this, or giving the subgraph its own differently named keys, is the safe default.</p>

  <h2 id="lg-when"><span class="num">10</span>When to Use LangGraph</h2>
  <p>We have now rebuilt section 01's twenty-line hand loop as a graph with five nodes, a router, a checkpointer and an interrupt. That is a lot more machinery, so it is fair to ask what it bought. The table compares the two on each need we met:</p>
  <table class="tbl">
    <tr><th>Need</th><th>Hand-written loop</th><th>LangGraph</th></tr>
    <tr><td>Answer, retry once, give up</td><td>Yes, in about 20 lines</td><td>Yes: 5 nodes and a router</td></tr>
    <tr><td>See the path taken</td><td>Add print statements</td><td>The <code>steps</code> reducer, <code>stream()</code>, <code>get_graph().draw_mermaid()</code> for a diagram</td></tr>
    <tr><td>Remember a conversation between turns</td><td>Build your own storage</td><td>Checkpointer + <code>thread_id</code></td></tr>
    <tr><td>Survive a restart in the middle of a run</td><td>Build it yourself</td><td><code>SqliteSaver</code> / <code>PostgresSaver</code></td></tr>
    <tr><td>Wait hours for a human, then continue</td><td>Very hard</td><td><code>interrupt</code> + <code>Command(resume=)</code></td></tr>
    <tr><td>A straight retrieve → answer with no memory</td><td>Simplest choice</td><td>Overkill</td></tr>
  </table>
  <p>The pattern is clear. If your application is a straight pipeline that runs once and forgets, such as retrieve → prompt → answer, LangGraph adds concepts and boilerplate and gives nothing back; use an LCEL chain or a plain function. LangGraph earns its place when the flow has cycles or branches <em>and</em> needs at least one of: memory across turns, recovery after a crash, pauses for a person, or step-by-step visibility. Most production agents need all of these, which is why it is so widely used for them. A paper to-do list versus a ticketing system is the everyday version of this choice: for your own shopping, paper wins; for a support team where tickets wait for people, move between staff and must never be lost, you want the system.</p>
  <p>One more trap belongs here. It is tempting to hide a loop inside a single node, for example a <code>while</code> loop that keeps calling the model. It runs, but LangGraph can only save, stream and pause <em>between</em> nodes, so inside that loop you are back to the hand-written version with none of the benefits. If a step can repeat, make the repetition an edge.</p>

  <h2 id="lg-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common LangGraph bug is declaring a list of chat messages without a reducer. With no reducer, a key is overwritten, so each node's write replaces the whole conversation:</p>
  <div class="fx" data-lang="py">from typing import TypedDict
class ChatState(TypedDict):
    messages: list                                # no reducer!

def reply(state: ChatState):
    return {"messages": [("ai", "Sorry, checking your order.")]}

g = StateGraph(ChatState)
g.add_node("reply", reply)
g.add_edge(START, "reply")
g.add_edge("reply", END)
print(g.compile().invoke({"messages": [("user", "My order is late")]})["messages"])

g = StateGraph(MessagesState)                     # fix: messages with add_messages
g.add_node("reply", reply)
g.add_edge(START, "reply")
g.add_edge("reply", END)
print([m.content for m in g.compile().invoke({"messages": [("user", "My order is late")]})["messages"]])</div>
  <div class="fx" data-lang="text">[('ai', 'Sorry, checking your order.')]
['My order is late', 'Sorry, checking your order.']</div>
  <p>In the first graph the customer's message "My order is late" has disappeared; only the reply survived, so the next model call would have no idea what the customer asked. The fix is to use <code>MessagesState</code> (or declare <code>messages: Annotated[list, add_messages]</code>), and the second graph keeps both messages.</p>
  <p>The second mistake is a node that returns the whole state with its changes, instead of only the changed keys. For keys without a reducer this happens to work, but for append keys the old list is appended again:</p>
  <div class="fx" data-lang="py">def retrieve_bad(state: SupportState):            # returns the whole state, not just changes
    return {**state, "attempts": state["attempts"] + 1, "steps": state["steps"] + ["retrieve"]}

g = StateGraph(SupportState)
g.add_node("retrieve", retrieve_bad)
g.add_edge(START, "retrieve")
g.add_edge("retrieve", END)
print(g.compile().invoke({"question": QUESTION, "query": QUESTION, "attempts": 0, "steps": ["start"]})["steps"])</div>
  <div class="fx" data-lang="text">['start', 'start', 'retrieve']</div>
  <p>The node built <code>['start', 'retrieve']</code> and returned it, and the reducer appended that to the existing <code>['start']</code>, so <code>'start'</code> is duplicated. Return only the new entries (<code>{"steps": ["retrieve"]}</code>) and let the reducer do the joining.</p>
  <p>Several other mistakes have already appeared on this page. A cycle whose only exit is the model saying "good enough" may never end; keep a counter in the state and set a small <code>recursion_limit</code> as a fuse. Code before <code>interrupt()</code> runs again on resume, so a notification sent there is sent twice. Thread-id errors give either no memory (a new id per request) or leaked memory (one id for two customers). <code>InMemorySaver</code> in production loses every thread and every paused escalation on restart, and does not work across several server processes; use a database-backed saver. Tool results must be <code>ToolMessage</code>s with the matching <code>tool_call_id</code>, which <code>ToolNode</code> handles for you; hand-written agents sometimes store them as AI messages and the provider rejects the history. A subgraph added directly as a node duplicates shared append keys. And a straight pipeline does not need a graph at all.</p>

  <h2 id="lg-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>LangGraph</b>: runs an LLM app as a graph of nodes over a shared state, saving the state after every step.</li>
    <li><b>State</b>: a <code>TypedDict</code> shared by all nodes. <b>Reducer</b>: per-key merge rule <code>(old, update) → new</code>; no reducer means overwrite.</li>
    <li><b>Node</b>: a function <code>state → partial update</code> (only changed keys).</li>
    <li><b>Edge</b>: fixed next step. <b>Conditional edge</b>: a router function returns a label; a mapping turns it into the next node.</li>
    <li><b>Cycle</b>: an edge back to an earlier node. <b>Stop condition</b>: state-based exit in the router. <b>Recursion limit</b>: max steps per run (fuse).</li>
    <li><b>Checkpointer</b>: saves a <b>checkpoint</b> (full state + next node) after each step. <b>Thread</b>: one conversation's checkpoints, named by <code>thread_id</code>.</li>
    <li><b>Human-in-the-loop</b>: pause with <code>interrupt()</code>, continue with <code>Command(resume=...)</code>.</li>
    <li><b>Subgraph</b>: a compiled graph used as a node.</li>
  </ul>
  <h3>Reducers at a glance</h3>
  <table class="tbl">
    <tr><th>Declaration</th><th>Merge rule</th><th>Example</th></tr>
    <tr><td><code>attempts: int</code></td><td>overwrite</td><td>1, node returns 2 → 2</td></tr>
    <tr><td><code>Annotated[list, operator.add]</code></td><td>append</td><td>['a'] + ['b'] → ['a', 'b']</td></tr>
    <tr><td><code>Annotated[list, add_messages]</code></td><td>append; replace same id</td><td>chat history; <code>MessagesState</code></td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">class S(TypedDict):
    attempts: int
    steps: Annotated[list[str], operator.add]

g = StateGraph(S)
g.add_node("retrieve", retrieve)                 # fn(state) -&gt; {changed keys}
g.add_edge(START, "retrieve")
g.add_conditional_edges("check", router, {"done": END, "retry": "rewrite"})
g.add_edge("rewrite", "retrieve")                # cycle
app = g.compile(checkpointer=SqliteSaver(conn))

cfg = {"configurable": {"thread_id": "customer-42"}, "recursion_limit": 25}
app.invoke(inputs, cfg)
app.stream(inputs, cfg, stream_mode="updates")
app.get_state(cfg); app.get_state_history(cfg); app.update_state(cfg, {...})

reply = interrupt(payload)                       # inside a node
app.invoke(Command(resume="..."), cfg)           # later, same thread

g.add_node("tools", ToolNode(tools))             # tool loop
g.add_conditional_edges("agent", tools_condition)</div>
  <h3>When to use</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Choose</th></tr>
    <tr><td>Straight pipeline, no memory</td><td>LCEL chain or plain function</td></tr>
    <tr><td>Standard model ⇄ tools loop</td><td><code>create_agent</code> (a prebuilt LangGraph graph)</td></tr>
    <tr><td>Loops, branches, approvals, resume, long threads</td><td>Your own <code>StateGraph</code></td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Messages without <code>add_messages</code> → history overwritten.</li>
    <li>Return only changed keys, or append keys duplicate.</li>
    <li>Every cycle needs a counter in state; <code>recursion_limit</code> is only a fuse.</li>
    <li>Interrupted node re-runs from line one; side effects after <code>interrupt()</code>.</li>
    <li>Interrupts and memory need a checkpointer and a stable <code>thread_id</code>; use a database saver in production.</li>
    <li>Checkpoints per run = 1 (input) + 1 (start) + number of node steps.</li>
  </ul>

  <h2 id="lg-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is LangGraph, and what problem does it solve?</summary><div class="qa-body">LangGraph is a library that runs an LLM application as a graph: nodes (functions) update a shared state, edges decide what runs next, and the state is saved after every step. A chain only runs each step once in a line, and a hand-written loop keeps its data in local variables, so neither can pause for a human, resume after a crash or remember a conversation. Saving state per step makes all of those built in.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define state, node and edge.</summary><div class="qa-body">State is a typed dictionary shared by all nodes. A node is a function that takes the state and returns only the keys it changed. An edge says what runs next: fixed with <code>add_edge</code>, or chosen at run time by a router function with <code>add_conditional_edges</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a reducer, and why does <code>add_messages</code> exist?</summary><div class="qa-body">A reducer is a per-key rule for merging a node's update into the state. Without one, the new value overwrites the old. For chat history, overwriting would erase the conversation at every node, so <code>add_messages</code> appends new messages and replaces any message that has the same id.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between LangChain and LangGraph?</summary><div class="qa-body">LangChain (and its LCEL pipe syntax) composes the logic inside a step, such as prompt → model → parser, and is a straight line. LangGraph orchestrates the flow between steps, with branches, cycles, saved state, pauses and streaming. They are complementary: a LangChain chain often runs inside a LangGraph node, and LangChain's <code>create_agent</code> is itself built on LangGraph.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a conditional edge work?</summary><div class="qa-body">After the source node runs, LangGraph calls your router function with the current state. The router returns a label, and the mapping you passed to <code>add_conditional_edges</code> turns that label into the next node (or <code>END</code>). Every label the router can return must be in the mapping, or the run fails when that branch is taken.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make sure a cycle terminates?</summary><div class="qa-body">Keep a counter or budget in the state, updated by a node on each lap, and have the router choose an exit (finish, or escalate to a human) when it is reached. As a last-resort fuse, set a small <code>recursion_limit</code> in the config; hitting it raises <code>GraphRecursionError</code>. Never rely only on the model saying the result is good enough.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must the loop counter live in the state rather than in a local variable?</summary><div class="qa-body">Each node is a separate function call made by LangGraph, so local variables do not survive between nodes, let alone across a pause or restart. The router can only read the state, and the checkpointer only saves the state. A counter elsewhere would be invisible to the router and lost on resume.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is the ReAct tool loop built as a graph?</summary><div class="qa-body">Two nodes: an agent node that calls the model, and a <code>ToolNode</code> that runs the requested tools and appends <code>ToolMessage</code>s. A conditional edge from the agent uses <code>tools_condition</code> to go to the tools if the reply contains tool calls, else to <code>END</code>, and a fixed edge leads from the tools back to the agent. <code>create_agent</code> is the prebuilt version.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a checkpointer give you?</summary><div class="qa-body">It saves the full state after every step, per thread. That gives multi-turn memory (the next call on the same <code>thread_id</code> starts from the saved state), crash recovery (continue from the last checkpoint), time travel (inspect history, edit with <code>update_state</code>, replay) and interrupts (pause by saving and returning). Use a database saver like SQLite or Postgres in production.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A graph with 3 nodes runs on a new thread, then a second turn runs 7 nodes. How many checkpoints exist?</summary><div class="qa-body">Each run saves one checkpoint for the input, one at the start, and one after each node step. So the first turn saves 1 + 1 + 3 = 5 and the second 1 + 1 + 7 = 9, for 14 in total.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through a human hand-off using <code>interrupt</code>.</summary><div class="qa-body">The node calls <code>interrupt(payload)</code>; LangGraph saves the state and <code>invoke</code> returns with the payload under <code>__interrupt__</code>, which the dashboard shows to a person. Later, <code>invoke(Command(resume=reply), config)</code> on the same thread loads the checkpoint, re-runs the node from the top, and this time <code>interrupt</code> returns the reply. It needs a checkpointer and the same <code>thread_id</code>, and works across restarts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your escalation node posts to Slack and then calls <code>interrupt()</code>. The team gets every message twice. Why?</summary><div class="qa-body">On resume, the interrupted node runs again from its first line, so the Slack post runs a second time. Move the side effect after the interrupt or into its own node, or make it idempotent, for example by recording that the message was sent and checking before sending.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>interrupt()</code> and <code>interrupt_before</code>?</summary><div class="qa-body"><code>interrupt_before=["node"]</code> is set at compile time and always pauses before that node, like a breakpoint; you resume with <code>invoke(None, config)</code>. <code>interrupt()</code> is called inside a node only when your logic decides, carries a payload to show the person, and returns the value passed in <code>Command(resume=...)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which stream mode would you use for a progress indicator, and which for a typing effect?</summary><div class="qa-body"><code>"updates"</code> gives each node's returned changes as it finishes, which maps neatly to progress messages. <code>"messages"</code> gives the model's tokens as they are generated, for a typing effect. Modes can be combined, and <code>"values"</code> (full state each step) should not be sent to end users because it exposes internal fields.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A subgraph added directly as a node produces duplicated entries in a list. Why, and how do you fix it?</summary><div class="qa-body">The parent and subgraph share a key with an append reducer. The subgraph receives the parent's list, appends to it, and returns the whole list, which the parent then appends to its own copy. Wrap the subgraph in a function node that passes a clean value in and returns only the new entries, or give the subgraph its own keys.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What goes wrong with <code>InMemorySaver</code> in production?</summary><div class="qa-body">It keeps checkpoints in the process's memory, so a restart or deploy loses every conversation and every paused human hand-off. It also cannot be shared between several server processes behind a load balancer, so a customer's next request may hit a process with no memory of them. Use a database-backed saver such as Postgres.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you design a refund agent that needs approval for refunds above ₹1,000?</summary><div class="qa-body">Use the agent ⇄ tools loop with a checkpointer, and put an approval node in front of the refund tool (or check inside the tool's node). If the amount is above the threshold, call <code>interrupt()</code> with the order and amount; the reviewer's decision comes back through <code>Command(resume=...)</code>, and the node either runs the refund or returns a rejection message to the agent. Keep the refund call after the interrupt and idempotent, cap the loop with a counter, and use a durable saver so pending approvals survive restarts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use LangGraph?</summary><div class="qa-body">For a straight pipeline with no loops, branches, pauses or persistence, such as retrieve → prompt → answer. A plain function or an LCEL chain is simpler to read and debug. Also avoid hiding a loop inside one node: if a step repeats, it should be an edge, or LangGraph cannot save, stream or pause it.</div></details>
</main>
`
});
