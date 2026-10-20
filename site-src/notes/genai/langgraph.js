// notes/genai/langgraph.js — LangGraph
Object.assign(TOPIC_CONTENT, {
  "langgraph": `<main>
<h1>LangGraph</h1>
  <div class="where"><span>Generative AI</span><span>Agents</span><span>LangGraph</span></div>
  <p class="lead">The Biteful support assistant from <a class="xref" data-note="rag">RAG</a> and <a class="xref" data-note="langchain">LangChain</a> is a straight line: retrieve, answer, done. Real assistants loop and branch: <strong>retrieve → answer → check → if the answer is weak, rewrite the question and retrieve again → if it is still weak, escalate to a human</strong>, and remember the conversation even if the server restarts. LangGraph expresses that as a graph: one shared <strong>state</strong>, <strong>nodes</strong> that update it, <strong>edges</strong> (including conditional ones and cycles) that you control, and a <strong>checkpointer</strong> that saves the state after every step, which is what makes memory, pausing for a human and resuming possible. We build exactly that Biteful graph, one need at a time, on the same three customer questions.</p>
  <div class="callout def"><span class="label">No API bill: what is real, what is a stand-in</span>
    <p>Every block ran on langgraph 1.2 (with langgraph-checkpoint-sqlite 3.1 for persistence), in order like a notebook. No paid API is called. Retrieval is real BM25 over Biteful's 13 policy sections; the "LLM" is the labelled stand-in from the RAG note (copies the best-matching source sentence and cites it); the query rewriter is a labelled stand-in (a lookup of the rewrite an LLM would typically produce; other questions come back unchanged); the tool-calling model replays scripted replies. The graph mechanics (state merging, routing, cycles, checkpoints, interrupts, streaming) are all real.</p>
  </div>

  <h2 id="lg-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="lg-f0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="41" text-anchor="middle" font-size="12">RAG</text><text x="90" y="58" text-anchor="middle" class="tm" font-size="10">retrieve, ground, evaluate</text>
<rect x="10" y="100" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="121" text-anchor="middle" font-size="12">LangChain</text><text x="90" y="138" text-anchor="middle" class="tm" font-size="10">parts that compose in a line</text>
<rect x="250" y="55" width="160" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="330" y="78" text-anchor="middle" font-size="13" font-weight="700">LangGraph</text><text x="330" y="97" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="490" y="15" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="570" y="36" text-anchor="middle" font-size="12">Multi-Agent Systems</text><text x="570" y="53" text-anchor="middle" class="tm" font-size="10">graphs of agents</text>
<rect x="490" y="105" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="570" y="126" text-anchor="middle" font-size="12">Production</text><text x="570" y="143" text-anchor="middle" class="tm" font-size="10">evals, guardrails, deploy</text>
<line x1="170" y1="45" x2="248" y2="75" stroke="currentColor" marker-end="url(#lg-f0)"/><line x1="170" y1="125" x2="248" y2="92" stroke="currentColor" marker-end="url(#lg-f0)"/>
<line x1="410" y1="75" x2="488" y2="42" stroke="currentColor" marker-end="url(#lg-f0)"/><line x1="410" y1="92" x2="488" y2="128" stroke="currentColor" marker-end="url(#lg-f0)"/>
</svg><figcaption>LangGraph takes RAG's pieces and LangChain's parts and lets them loop, branch, pause and persist.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="rag">RAG</a> and <a class="xref" data-note="langchain">LangChain</a></b><span>A Biteful assistant that answers "My order arrived 50 minutes late" correctly, as a straight chain. Left open: "The rider took forever. Will I be compensated?" gets "I don't know" (the RAG note's missed-retrieval failure) and nothing retries; LangChain's own memory helper says "use LangGraph's built-in persistence instead"; the tool loop of <code>create_agent</code> already runs on LangGraph.</span></li>
    <li><b>This note adds: state, nodes, edges, cycles, checkpoints, interrupts</b><span>The assistant as a graph that checks its own answer, rewrites and retries at most once more, escalates to a human, remembers each customer's thread in SQLite, and resumes after a restart.</span></li>
    <li><b>Leads to: <a class="xref" data-note="multiagent">Multi-Agent Systems &amp; MCP</a></b><span>Graphs whose nodes are whole agents (subgraphs). The agent loop itself: <a class="xref" data-note="agentic">Agent Fundamentals</a> and <a class="xref" data-note="agent_build">Build an Agent from Scratch</a>; shipping it: <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a> and <a class="xref" data-note="agent_capstone">the capstone</a>.</span></li>
  </ol>

  <h2 id="lg-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain of needs. Three customers run through it: our main customer (50 minutes late → answered), the rider customer ("took forever… compensated?" → needs a retry), and a wifi question (not in the policy → needs a human).</p>
  <ol class="story">
    <li><b>Chains are straight lines</b><span>Q: why isn't the LangChain chain enough? → It runs retrieve → answer once: the rider customer gets "I don't know". A hand-written loop fixes it, but its state lives in local variables: no pausing, no resume, no memory. Where should shared data live?</span></li>
    <li><b>State</b><span>Q: what do the steps share? → One <code>TypedDict</code>: question, query, docs, answer, ok, attempts, steps. Each key has a merge rule: overwrite (attempts 1 → 2) or append (<code>operator.add</code>: steps grows). Who changes it?</span></li>
    <li><b>Nodes</b><span>Q: what is one step? → A plain function: state in, <em>only the changed keys</em> out. retrieve → {docs, attempts, steps}, answer → {answer, steps}, check → {ok, steps}. In what order do they run?</span></li>
    <li><b>Edges &amp; conditional edges</b><span>Q: who decides what runs next? → Fixed edges retrieve → answer → check; a router after check returns "done" or "human". Main customer: 3 steps; rider: escalated. But one rewrite would have saved the rider…</span></li>
    <li><b>Cycles with a stop condition</b><span>Q: how do we go back and try again, without looping forever? → An edge rewrite → retrieve, and a router that says "retry" only while attempts &lt; 2. Rider: answered on attempt 2 (7 steps). Forget the stop: GraphRecursionError at 12. Some answers need live data, though…</span></li>
    <li><b>Tools in a graph</b><span>Q: how does the model look up order B-102? → An agent node and a ToolNode in a cycle, routed by <code>tools_condition</code>: Human → AI(tool call) → Tool("50 minutes late") → AI(answer). But every run still forgets everything when it returns…</span></li>
    <li><b>Checkpointing &amp; persistence</b><span>Q: how does a thread survive between turns and restarts? → A checkpointer saves state after every step per <code>thread_id</code>: 14 checkpoints for two turns; after a "restart" the answer and 10 steps are still there. Now we can stop and continue later…</span></li>
    <li><b>Human-in-the-loop</b><span>Q: how do we hand the wifi question to a person and continue when she replies? → <code>interrupt()</code> saves and returns; <code>Command(resume=...)</code> continues (here even after a restart). The node re-runs from its top. Can we watch all this live?</span></li>
    <li><b>Streaming</b><span>Q: what does the UI show during 7 steps? → <code>stream_mode="updates"</code> yields each node's changes as it finishes. The graph is getting big…</span></li>
    <li><b>Subgraphs</b><span>Q: can retrieve → answer be a reusable piece? → A compiled graph as a node; shared append keys double up (['start', 'start', …]) unless you map state in and out. When is all of this worth it?</span></li>
    <li><b>LangGraph vs plain code</b><span>Q: when should we not use it? → A straight line with no loops, pauses or persistence: an LCEL chain or plain function. Loops + human + resume: the graph.</span></li>
  </ol>

  <h2 id="lg-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">LangGraph</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why</div>
        <ul>
          <li><b>Chains</b> — one straight pass: rider → "I don't know"</li>
          <li><b>Hand loop</b> — works, but state in local variables</li>
          <li><b>Graph</b> — state + nodes + edges, saved every step</li>
          <li>💡 Surgical robot <em>with</em> pause, live feed and rewind</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">State</div>
        <ul>
          <li><b>TypedDict</b> shared by all nodes</li>
          <li><b>No reducer</b> — overwrite (attempts 1 → 2)</li>
          <li><b>operator.add</b> — append (steps)</li>
          <li><b>add_messages</b> — append, replace by id; MessagesState</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Nodes &amp; edges</div>
        <ul>
          <li><b>Node</b> — fn(state) → partial update</li>
          <li><b>add_edge</b> — fixed; START, END</li>
          <li><b>add_conditional_edges</b> — router returns a label</li>
          <li><b>Cycle</b> — rewrite → retrieve; stop at attempts = 2</li>
          <li>⚠ No stop → GraphRecursionError</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tools</div>
        <ul>
          <li><b>agent ⇄ ToolNode</b> routed by tools_condition</li>
          <li><b>ToolMessage</b> with matching tool_call_id</li>
          <li><b>create_agent</b> — the prebuilt version</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Checkpoints</div>
        <ul>
          <li><b>compile(checkpointer=...)</b> + <b>thread_id</b></li>
          <li>InMemorySaver (dev), SqliteSaver / PostgresSaver (real)</li>
          <li><b>Biteful</b> — 14 checkpoints, 2 turns; survives restart</li>
          <li><b>Gives</b> — memory, crash recovery, time travel, interrupts</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Human-in-the-loop</div>
        <ul>
          <li><b>interrupt(payload)</b> — save and return <code>__interrupt__</code></li>
          <li><b>Command(resume=x)</b> — continue; interrupt returns x</li>
          <li><b>interrupt_before</b>, <b>update_state</b>, <b>Command(goto=)</b></li>
          <li>⚠ Node re-runs from the top on resume</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stream &amp; subgraphs</div>
        <ul>
          <li><b>stream_mode</b> — values · updates · messages · custom</li>
          <li><b>Subgraph</b> — compiled graph as a node</li>
          <li>⚠ Shared append keys double → map state explicitly</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When</div>
        <ul>
          <li><b>Use</b> — loops, branches, approvals, resume, long threads</li>
          <li><b>Skip</b> — straight pipelines: LCEL or plain code</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lg-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="lg-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Chains Are Straight Lines</span><span class="rm-sub">Real assistants loop and branch</span></div></div>
      <div class="rm-item rm-done" data-target="lg-state"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">State</span><span class="rm-sub">TypedDict and reducers</span></div></div>
      <div class="rm-item rm-done" data-target="lg-nodes"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Nodes</span><span class="rm-sub">Functions returning partial updates</span></div></div>
      <div class="rm-item rm-done" data-target="lg-edges"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Edges &amp; Conditional Edges</span><span class="rm-sub">Routing, traced</span></div></div>
      <div class="rm-item rm-done" data-target="lg-cycle"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Cycles with a Stop Condition</span><span class="rm-sub">Rewrite and retry, at most twice</span></div></div>
      <div class="rm-item rm-done" data-target="lg-tools"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Tools in a Graph</span><span class="rm-sub">agent ⇄ ToolNode</span></div></div>
      <div class="rm-item rm-done" data-target="lg-ckpt"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Checkpointing &amp; Persistence</span><span class="rm-sub">Threads survive a restart</span></div></div>
      <div class="rm-item rm-done" data-target="lg-hitl"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Human-in-the-Loop</span><span class="rm-sub">interrupt() and resume</span></div></div>
      <div class="rm-item rm-done" data-target="lg-stream"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Streaming</span><span class="rm-sub">Watch the loop live</span></div></div>
      <div class="rm-item rm-done" data-target="lg-sub"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Subgraphs</span><span class="rm-sub">Graphs as nodes, briefly</span></div></div>
      <div class="rm-item rm-done" data-target="lg-when"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">LangGraph vs Plain Code</span><span class="rm-sub">When the graph pays off</span></div></div>
      <div class="rm-item rm-done" data-target="lg-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="lg-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Reducers, thread ids, reruns</span></div></div>
      <div class="rm-item rm-done" data-target="lg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="lg-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="lg-why"><span class="num">01</span>Chains Are Straight Lines</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The LangChain chain answers our 50-minutes-late customer. A second customer writes "The rider took forever. Will I be compensated?" and a third asks for the restaurant's wifi password. What does a straight retrieve → answer chain do with them, and what would a human support agent do instead?</p>
  </div>
  <p>First the straight line, built from the RAG note's pieces (BM25 search over the 13 sections, the stand-in LLM):</p>
  <div class="fx" data-lang="py">import re
from rag_basics import DOCS, QUESTION, make_chunks, bm25, fake_llm   # from the RAG note

chunks = make_chunks(DOCS)
texts = [c["text"] for c in chunks]

def search(query, k=3):                           # BM25 top-k over the 13 sections
    s = bm25(query, texts)
    return [chunks[i] for i in sorted(range(len(texts)), key=lambda i: -s[i])[:k] if s[i] &gt; 0]

def generate(query, docs):                        # the STAND-IN LLM from the RAG note
    sources = "\\n".join(f"[{n}] {d['text']}" for n, d in enumerate(docs, 1))
    return fake_llm(f"Sources:\\n{sources}\\n\\nQuestion: {query}")

def pipeline(question):                           # a chain: one straight line
    return generate(question, search(question))

RIDER = "The rider took forever. Will I be compensated?"
WIFI = "What is the wifi password at the restaurant?"
for q in [QUESTION, RIDER, WIFI]:
    print(pipeline(q)[:70])</div>
  <div class="fx" data-lang="text">If your order arrives more than 45 minutes after the promised time, Bi
I don't know based on these sources.
I don't know based on these sources.</div>
  <p>Customer 1 gets the cited 45-minute rule. Customer 2 gets "I don't know" although the policy answers it: their words ("forever", "compensated") don't match the policy's ("late", "refunds"), the RAG note's <em>missed retrieval</em>. Customer 3 correctly gets "I don't know", and is left alone with it. A human agent would do better: notice the answer is weak, rephrase the search and look again; if still nothing, pass the chat to a colleague. That is a loop with a branch. In plain Python:</p>
  <div class="fx" data-lang="py"># STAND-IN for an LLM rewrite call: rewrites an LLM would typically produce
REWRITES = {RIDER: "Is there a refund if my order is late?"}
def rewrite(query):
    return REWRITES.get(query, query)             # unknown questions come back unchanged

def grounded(answer, docs):                       # cited sentence really in that source?
    m = re.search(r"(.+) \\[(\\d+)\\]$", answer)
    return bool(m) and int(m[2]) &lt;= len(docs) and m[1] in docs[int(m[2]) - 1]["text"]

def support_loop(question, max_attempts=2):       # the same job, as a hand-written loop
    query = question
    for attempt in range(1, max_attempts + 1):
        docs = search(query)
        answer = generate(query, docs)
        if grounded(answer, docs):
            return answer[:60], attempt
        query = rewrite(query)
    return "ESCALATE to a human agent", attempt

for q in [QUESTION, RIDER, WIFI]:
    print(support_loop(q))</div>
  <div class="fx" data-lang="text">('If your order arrives more than 45 minutes after the promise', 1)
('If your order arrives more than 45 minutes after the promise', 2)
('ESCALATE to a human agent', 2)</div>
  <p>It works: customer 1 on attempt 1, customer 2 on attempt 2 (the rewrite "Is there a refund if my order is late?" finds "Late orders"), customer 3 escalated. Now imagine it in production. Escalation means waiting minutes or hours for a person: where does this function pause, and how does it continue tomorrow when she replies? The server restarts mid-loop: <code>query</code>, <code>docs</code> and <code>attempt</code> were local variables and are gone. The customer writes again an hour later: where is the conversation? Every one of these is hand-built plumbing.</p>
  <div class="cards">
    <div><b>Pause</b><p>Stop at "escalate", wait for a human, continue later.</p></div>
    <div><b>Resume</b><p>Crash at step 5 of 8, continue from step 5.</p></div>
    <div><b>Remember</b><p>Earlier turns of this customer's chat.</p></div>
    <div><b>Control flow</b><p>Branch and loop on <em>your</em> rules, visibly.</p></div>
  </div>
  <p>LangGraph's idea: write each step as a separate function (a <strong>node</strong>), keep everything they share in one dict (the <strong>state</strong>), declare what runs after what (the <strong>edges</strong>), and let the framework <em>save the state after every node</em>. Once state is saved per step, pausing, resuming and remembering are all "load the last save".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A surgical robot with no pause button vs one with a pause button, a live feed of every step, and the ability to rewind to any earlier moment. The hand loop is the first; LangGraph is the second.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>LangChain (LCEL)</th><th>LangGraph</th></tr>
    <tr><td>Builds</td><td>The logic inside one step (a recipe)</td><td>The flow between steps (the kitchen)</td></tr>
    <tr><td>Shape</td><td>Straight line, each step once</td><td>Branches and cycles</td></tr>
    <tr><td>Memory, pause, resume</td><td>You build it</td><td>Checkpointer + <code>interrupt</code></td></tr>
    <tr><td>Together</td><td colspan="2">An LCEL chain often runs <em>inside</em> a LangGraph node</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LangGraph</strong> models an LLM app as a <strong>state machine</strong>: a typed state, nodes (functions that update it) and edges (what runs next), with the state saved after every step. A state machine is a system that is always in one known state and moves between states by fixed rules.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Hiding the loop inside one big node or a <code>while</code> in a <code>RunnableLambda</code>. It runs, but LangGraph can only save, stream and pause <em>between</em> nodes; inside your loop it is blind again.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: State.</b> If retrieve, answer, check and rewrite become separate functions, they need a shared place to read and write <code>query</code>, <code>docs</code>, <code>answer</code> and the attempt count. What does that shared place look like, and how are updates merged?</div>

  <h2 id="lg-state"><span class="num">02</span>State</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In the hand loop everything lived in local variables of one function. Split into nodes, where does the data live, and what happens when two steps write the same key: should the new value replace the old one, or be added to it?</p>
  </div>
  <p>The <strong>state</strong> is one dict shared by all nodes, declared as a <code>TypedDict</code> (a dict with named, typed keys). Each node receives the whole state and returns <strong>only the keys it changed</strong>; LangGraph merges that update in. By default a new value <strong>overwrites</strong> the old one, right for <code>attempts</code>. For a list you want to <em>grow</em>, attach a <strong>reducer</strong>, a merge rule, with <code>Annotated[type, reducer]</code>: <code>operator.add</code> on lists means old + new. We give Biteful's state a <code>steps</code> list with that reducer, so every node can log what it did and the final state shows the path taken.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Relay runners sharing one notebook. Each runner reads everything so far and adds a line; some lines are "current score" (overwritten), others are the lap log (appended). Nobody passes notes directly to the next runner.</p>
  </div>
<figure class="viz"><svg viewBox="0 0 600 160" width="600"><defs><marker id="lg-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="225" y="14" text-anchor="middle" font-size="10" class="tm">state before</text><text x="370" y="14" text-anchor="middle" font-size="10" class="tm">node returns</text><text x="525" y="14" text-anchor="middle" font-size="10" class="tm">state after</text><text x="10" y="40" font-weight="bold" font-size="12">attempts: int</text><text x="10" y="55" text-anchor="start" font-size="10" class="tm">no reducer → overwrite</text><rect x="170" y="24" width="110" height="36" rx="6" class="fs"/><text x="225" y="46" text-anchor="middle" font-size="11">1</text><rect x="320" y="24" width="100" height="36" rx="6" class="fv"/><text x="370" y="46" text-anchor="middle" font-size="11">2</text><rect x="450" y="24" width="144" height="36" rx="6" class="fb sb"/><text x="522" y="46" text-anchor="middle" font-size="11">2</text><text x="300" y="47" text-anchor="middle">+</text><line x1="422" y1="42" x2="448" y2="42" stroke="currentColor" marker-end="url(#lg-a1)"/><text x="10" y="94" font-weight="bold" font-size="12">steps</text><text x="10" y="109" text-anchor="start" font-size="10" class="tm">operator.add → append</text><rect x="170" y="78" width="110" height="36" rx="6" class="fs"/><text x="225" y="100" text-anchor="middle" font-size="11">['retrieve#1']</text><rect x="320" y="78" width="100" height="36" rx="6" class="fv"/><text x="370" y="100" text-anchor="middle" font-size="11">['retrieve#2']</text><rect x="450" y="78" width="144" height="36" rx="6" class="fg sg"/><text x="522" y="100" text-anchor="middle" font-size="10">['retrieve#1','retrieve#2']</text><text x="300" y="101" text-anchor="middle">+</text><line x1="422" y1="96" x2="448" y2="96" stroke="currentColor" marker-end="url(#lg-a1)"/><text x="10" y="150" text-anchor="start" font-size="10" class="tr">⚠ messages: list with no reducer → every node write replaces the chat history</text></svg><figcaption>Same node write, two merge rules: a key without a reducer is replaced, a key with operator.add (or add_messages) grows.</figcaption></figure>
  <div class="fx" data-lang="py">import operator
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END

class SupportState(TypedDict):
    question: str                                 # what the customer typed
    query: str                                    # what we search with (may be rewritten)
    docs: list                                    # retrieved chunks
    answer: str
    ok: bool                                      # did the answer pass the check?
    attempts: int                                 # no reducer: each write overwrites
    steps: Annotated[list[str], operator.add]     # reducer: each write is appended

def count_attempt(state: SupportState):           # returns ONLY the keys it changes
    return {"attempts": state["attempts"] + 1, "steps": ["retrieve#2"]}

g = StateGraph(SupportState)
g.add_node("count_attempt", count_attempt)
g.add_edge(START, "count_attempt")
g.add_edge("count_attempt", END)
print(g.compile().invoke({"question": QUESTION, "attempts": 1, "steps": ["retrieve#1"]}))

from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph.message import add_messages
old = [HumanMessage("My order is late", id="1"), AIMessage("Sorry! Checking.", id="2")]
print([m.content for m in add_messages(old, [AIMessage("It was 50 minutes late.", id="3")])])
print([m.content for m in add_messages(old, [AIMessage("Sorry about that!", id="2")])])</div>
  <div class="fx" data-lang="text">{'question': 'My order arrived 50 minutes late. Can I get my money back?', 'attempts': 2, 'steps': ['retrieve#1', 'retrieve#2']}
['My order is late', 'Sorry! Checking.', 'It was 50 minutes late.']
['My order is late', 'Sorry about that!']</div>
  <ul>
    <li>The one-node graph started from <code>attempts=1, steps=['retrieve#1']</code>; the node returned <code>attempts=2, steps=['retrieve#2']</code>. <code>attempts</code> was replaced (1 → 2); <code>steps</code> was appended. Keys the node didn't return (<code>question</code>) are untouched; keys nobody set (<code>docs</code>, <code>answer</code>) simply don't exist yet.</li>
    <li><code>add_messages</code> is the reducer for chat: it appends new messages (id 3) but <em>replaces</em> a message with the same id (id 2: "Sorry! Checking." → "Sorry about that!"). <code>MessagesState</code> is a ready-made state with just <code>messages: Annotated[list, add_messages]</code>; section 06 uses it.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>State</strong>: the typed dict shared by all nodes of a graph. <strong>Reducer</strong>: a function (old value, update) → merged value, attached per key with <code>Annotated</code>; keys without one are overwritten.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>messages: list</code> without a reducer: each node's write replaces the whole conversation, so the customer's question vanishes after the first reply. And two nodes running in parallel that both write a no-reducer key raise <code>InvalidUpdateError</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Nodes.</b> We know where data lives and how writes merge. Now the steps themselves: what exactly is a node, what may it read and return, and what do retrieve, answer and check look like for Biteful?</div>

  <h2 id="lg-nodes"><span class="num">03</span>Nodes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The hand loop's body did four things in a row. As separate steps, what is the contract of one step, so that any step can be tested alone, reordered, or run again after a pause?</p>
  </div>
  <p>A <strong>node</strong> is a plain Python function: it receives the current state and returns a dict of <em>only the keys it changes</em>. It doesn't know which node ran before or which runs next. That makes nodes easy to test: call them like any function.</p>
  <div class="fx" data-lang="py">def retrieve(state: SupportState):
    return {"docs": search(state["query"]), "attempts": state["attempts"] + 1,
            "steps": [f"retrieve #{state['attempts'] + 1}"]}

def answer(state: SupportState):
    return {"answer": generate(state["query"], state["docs"]), "steps": ["answer"]}

def check(state: SupportState):
    ok = grounded(state["answer"], state["docs"])
    return {"ok": ok, "steps": [f"check: {'ok' if ok else 'weak'}"]}

# Nodes are plain functions: call them by hand to see each partial update
s = {"question": RIDER, "query": RIDER, "attempts": 0, "steps": []}
for node in (retrieve, answer, check):
    update = node(s)
    print(node.__name__, "-&gt;", {k: (v if k != "docs" else [d["id"] for d in v]) for k, v in update.items()})
    s = {**s, **update, "steps": s["steps"] + update["steps"]}   # what LangGraph's merge does
print(s["steps"])</div>
  <div class="fx" data-lang="text">retrieve -&gt; {'docs': ['delivery.md#2'], 'attempts': 1, 'steps': ['retrieve #1']}
answer -&gt; {'answer': "I don't know based on these sources.", 'steps': ['answer']}
check -&gt; {'ok': False, 'steps': ['check: weak']}
['retrieve #1', 'answer', 'check: weak']</div>
  <p>Trace for the rider customer, by hand: <code>retrieve</code> searched "The rider took forever…" and found only delivery.md#2 (Tracking, via the word "rider"), set <code>attempts</code> to 1 and logged a step. <code>answer</code> ran the stand-in LLM on that one source: "I don't know". <code>check</code> found no valid citation: <code>ok=False</code>. The merge line does by hand what LangGraph does for us: overwrite most keys, append <code>steps</code> (the reducer). The <code>docs</code> are shown as ids only.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Stations on an assembly line. Each station takes the tray, does one job (fit the wheels), and puts the tray back on the belt. It doesn't care which station is next; the belt layout decides that.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Node</strong>: a function <code>state → partial update</code> (or a Runnable, or a compiled graph) registered with <code>add_node(name, fn)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Returning the full state from a node. Keys with an append reducer then get their whole old list appended again, duplicating entries. Return only what changed.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Edges &amp; conditional edges.</b> We have three nodes that each do one job. Who decides that answer runs after retrieve, and that after check we either stop or call a human?</div>

  <h2 id="lg-edges"><span class="num">04</span>Edges &amp; Conditional Edges</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In the hand loop, "what runs next" was buried in <code>for</code>, <code>if</code> and <code>return</code>. How do we declare the flow up front, including a decision ("answer is fine → stop; weak → human") that depends on the state?</p>
  </div>
  <ul>
    <li><strong>Edge</strong>: <code>add_edge("retrieve", "answer")</code>: always go retrieve → answer. <code>START</code> and <code>END</code> are the entry and exit.</li>
    <li><strong>Conditional edge</strong>: <code>add_conditional_edges("check", router, mapping)</code>. After <code>check</code>, LangGraph calls your <code>router(state)</code>; it returns a label, and the mapping turns the label into the next node.</li>
    <li><strong>Compile</strong>: <code>g.compile()</code> checks the wiring (every node reachable, no unknown names) and returns an app with <code>invoke</code> and <code>stream</code>.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A metro map. Stations are nodes, tracks are edges, an interchange where the train can go two ways is a conditional edge. The map is fixed in advance; the passenger (the state) moves along it.</p>
  </div>
  <div class="fx" data-lang="py">def escalate(state: SupportState):                # placeholder for now (section 08 makes it real)
    return {"answer": "ESCALATE to a human agent", "steps": ["escalate"]}

def after_check(state: SupportState):             # the router: reads state, names the next node
    return "done" if state["ok"] else "human"

g = StateGraph(SupportState)
for name, fn in [("retrieve", retrieve), ("answer", answer), ("check", check), ("escalate", escalate)]:
    g.add_node(name, fn)
g.add_edge(START, "retrieve")
g.add_edge("retrieve", "answer")
g.add_edge("answer", "check")
g.add_conditional_edges("check", after_check, {"done": END, "human": "escalate"})
g.add_edge("escalate", END)
app = g.compile()

for q in [QUESTION, RIDER]:
    out = app.invoke({"question": q, "query": q, "attempts": 0, "steps": []})
    print(out["steps"], "|", out["answer"][:45])</div>
  <div class="fx" data-lang="text">['retrieve #1', 'answer', 'check: ok'] | If your order arrives more than 45 minutes af
['retrieve #1', 'answer', 'check: weak', 'escalate'] | ESCALATE to a human agent</div>
  <table class="tbl">
    <tr><th>Step</th><th>Main customer (50 min late)</th><th>Rider customer</th></tr>
    <tr><td>1 retrieve</td><td>Late orders, Delivery times, How refunds are paid</td><td>Tracking only</td></tr>
    <tr><td>2 answer</td><td>"…more than 45 minutes… full order amount. [1]"</td><td>"I don't know…"</td></tr>
    <tr><td>3 check</td><td>citation valid → ok = True</td><td>no citation → ok = False</td></tr>
    <tr><td>router</td><td>"done" → END</td><td>"human" → escalate → END</td></tr>
  </table>
  <p>The <code>steps</code> list, built by the append reducer, is the trace: 3 steps for customer 1, 4 for the rider. The router is <em>your</em> code reading state; the model's output influences the route (through <code>ok</code>), but never chooses an arbitrary next step by itself. That keeps the flow debuggable and safe.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Edge</strong>: a fixed transition between nodes. <strong>Conditional edge</strong>: a router function evaluated after a node, whose return value (via a mapping) names the next node.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A router returning a label that is not in the mapping fails at run time, possibly only on the rare branch. List every label in the mapping, and test each branch with a question that takes it (as we did with two customers).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Cycles with a stop condition.</b> The rider customer went straight to a human, although one rewritten search would have found "Late orders". We need an edge that goes <em>back</em>, and a rule that stops the going back.</div>

  <h2 id="lg-cycle"><span class="num">05</span>Cycles with a Stop Condition</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we make the graph rewrite the query and retrieve again when the check fails, and how do we guarantee it stops, so a question nobody can answer doesn't loop (and bill) forever?</p>
  </div>
  <p>A <strong>cycle</strong> is just an edge to an earlier node: <code>rewrite → retrieve</code>. The <strong>stop condition</strong> lives in the router: after <code>check</code>, "done" if ok; else "retry" only while <code>attempts &lt; 2</code>; else "human". Because <code>retrieve</code> increments <code>attempts</code> in state, the router can always tell how many tries have happened.</p>
<figure class="viz"><svg viewBox="0 0 640 170" width="640"><defs><marker id="lg-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="10" y="66" width="60" height="28" rx="14" class="fs"/><text x="40" y="84" text-anchor="middle" font-size="11">START</text><rect x="95" y="60" width="90" height="40" rx="6" class="ft st"/><text x="140" y="85" text-anchor="middle" font-weight="bold">retrieve</text><rect x="210" y="60" width="90" height="40" rx="6" class="fb sb"/><text x="255" y="85" text-anchor="middle" font-weight="bold">answer</text><rect x="325" y="60" width="90" height="40" rx="6" class="fv"/><text x="370" y="85" text-anchor="middle" font-weight="bold">check</text><rect x="545" y="66" width="70" height="28" rx="14" class="fs"/><text x="580" y="84" text-anchor="middle" font-size="11">END</text><rect x="440" y="125" width="100" height="36" rx="6" class="fr sr"/><text x="490" y="148" text-anchor="middle" font-weight="bold">escalate</text><rect x="210" y="125" width="90" height="36" rx="6" class="fg sg"/><text x="255" y="148" text-anchor="middle" font-weight="bold">rewrite</text><line x1="70" y1="80" x2="93" y2="80" stroke="currentColor" marker-end="url(#lg-a2)"/><line x1="185" y1="80" x2="208" y2="80" stroke="currentColor" marker-end="url(#lg-a2)"/><line x1="300" y1="80" x2="323" y2="80" stroke="currentColor" marker-end="url(#lg-a2)"/><line x1="415" y1="80" x2="543" y2="80" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="480" y="72" text-anchor="middle" font-size="10" class="tg">done (ok)</text><path d="M390,100 V143 H438" fill="none" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="430" y="118" text-anchor="middle" font-size="10" class="tr">human (attempts = 2)</text><path d="M350,100 V143 H302" fill="none" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="330" y="160" text-anchor="middle" font-size="10" class="tb">retry (attempts &lt; 2)</text><path d="M210,143 H140 V102" fill="none" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="160" y="125" text-anchor="middle" font-size="10" class="tm">cycle</text><path d="M540,143 H580 V96" fill="none" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="40" y="30" font-size="10.5" class="tm">Biteful support graph: retrieve → answer → check → (done | retry via rewrite | human)</text></svg><figcaption>Three ways out of check. The retry edge makes a cycle; the attempts counter in state is the stop condition.</figcaption></figure>
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
    print(out["steps"])
    print("   ", out["query"][:40], "|", out["answer"][:45])

# Without a stop condition the cycle never ends; the recursion limit is the last fuse
from langgraph.errors import GraphRecursionError
no_stop = lambda s: "done" if s["ok"] else "retry"          # forgot the attempts check
broken = build_graph(router=no_stop).compile()
try:
    broken.invoke({"question": WIFI, "query": WIFI, "attempts": 0, "steps": []},
                  {"recursion_limit": 12})
except GraphRecursionError as e:
    print(type(e).__name__, "|", str(e).split(".")[0])</div>
  <div class="fx" data-lang="text">['retrieve #1', 'answer', 'check: ok']
    My order arrived 50 minutes late. Can I  | If your order arrives more than 45 minutes af
['retrieve #1', 'answer', 'check: weak', 'rewrite', 'retrieve #2', 'answer', 'check: ok']
    Is there a refund if my order is late? | If your order arrives more than 45 minutes af
['retrieve #1', 'answer', 'check: weak', 'rewrite', 'retrieve #2', 'answer', 'check: weak', 'escalate']
    What is the wifi password at the restaur | ESCALATE to a human agent
GraphRecursionError | Recursion limit of 12 reached without hitting a stop condition</div>
  <table class="tbl">
    <tr><th>Customer</th><th>Path</th><th>Result</th></tr>
    <tr><td>50 minutes late</td><td>retrieve → answer → check ok</td><td>45-minute rule, attempt 1</td></tr>
    <tr><td>Rider "took forever"</td><td>retrieve → answer → check weak → <strong>rewrite</strong> → retrieve #2 → answer → check ok</td><td>Query became "Is there a refund if my order is late?"; same cited answer, attempt 2</td></tr>
    <tr><td>Wifi password</td><td>… weak → rewrite (unchanged) → retrieve #2 → … weak → <strong>escalate</strong></td><td>Router: attempts = 2 → "human"</td></tr>
  </table>
  <p>The last two lines show the fuse. A router that forgot the attempts check (<code>no_stop</code>) keeps choosing "retry" for the wifi question; LangGraph counts steps and raises <code>GraphRecursionError</code> at the limit we passed (12). The default limit in langgraph 1.2 is far higher (10,007 steps), which with a real model could be thousands of paid calls, so always pass a small <code>recursion_limit</code> and, more importantly, keep a counter in state.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A chef tasting a sauce: taste, adjust, taste again. A good kitchen has a rule, "two adjustments, then call the head chef", or dinner never leaves the kitchen.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cycle</strong>: an edge to an earlier node, making a loop. <strong>Stop condition</strong>: state-based logic in a router that guarantees an exit. <strong>Recursion limit</strong>: the maximum number of steps per run (<code>{"recursion_limit": n}</code> in the config), raising <code>GraphRecursionError</code> when hit.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A loop whose only exit is "the model says it's good enough". Models can say "not yet" forever. Count attempts in state and route to a human or a safe answer; the recursion limit is a fuse, not a design.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Tools in a graph.</b> Our loop can only search the policy. "Order B-102 came late, refund?" needs the order's actual delay from Biteful's order system: the model must call a function, see the result, then answer. How does a model-driven tool loop fit in a graph?</div>

  <h2 id="lg-tools"><span class="num">06</span>Tools in a Graph</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In our support graph, <em>we</em> decide the route. With tools, the <em>model</em> decides whether to call <code>order_status</code>, and the loop runs until it stops asking. How is that model-driven loop drawn as nodes and edges?</p>
  </div>
  <p>The tool loop (the ReAct pattern: reason, act, observe) has two alternating jobs: <em>ask the model</em> and <em>run the requested tools</em>. They become two nodes. "Did the model ask for a tool?" becomes a conditional edge, and "go back to the model with the result" becomes a fixed edge. The state is <code>MessagesState</code>, so every message is appended. LangGraph ships the two standard parts: <strong><code>ToolNode</code></strong> runs every tool call in the last <code>AIMessage</code> and returns <code>ToolMessage</code>s (errors come back as messages, not crashes), and <strong><code>tools_condition</code></strong> routes to "tools" if the last message has tool calls, else to <code>END</code>.</p>
<figure class="viz"><svg viewBox="0 0 600 136" width="600"><defs><marker id="lg-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="20" y="61" width="64" height="28" rx="14" class="fs"/><text x="52" y="79" text-anchor="middle" font-size="11">START</text><rect x="120" y="55" width="110" height="40" rx="6" class="fb sb"/><text x="175" y="73" text-anchor="middle" font-weight="bold">agent</text><text x="175" y="87" text-anchor="middle" font-size="10" class="tm">model + tools</text><line x1="84" y1="75" x2="118" y2="75" stroke="currentColor" marker-end="url(#lg-a3)"/><path d="M300,57 L322,75 L300,93 L278,75 Z" class="fv" stroke="currentColor" stroke-opacity=".5"/><line x1="230" y1="75" x2="276" y2="75" stroke="currentColor" marker-end="url(#lg-a3)"/><text x="300" y="112" text-anchor="middle" font-size="10" class="tm">tools_condition</text><rect x="400" y="12" width="130" height="40" rx="6" class="ft st"/><text x="465" y="30" text-anchor="middle" font-weight="bold">tools</text><text x="465" y="44" text-anchor="middle" font-size="10" class="tm">ToolNode</text><path d="M300,57 V32 H398" fill="none" stroke="currentColor" marker-end="url(#lg-a3)"/><text x="355" y="46" text-anchor="middle" font-size="10" class="tb">tool_calls</text><rect x="420" y="98" width="70" height="28" rx="14" class="fs"/><text x="455" y="116" text-anchor="middle" font-size="11">END</text><path d="M322,75 H360 V112 H418" fill="none" stroke="currentColor" marker-end="url(#lg-a3)"/><text x="390" y="106" text-anchor="middle" font-size="10" class="tg">none</text><path d="M465,12 V4 H175 V53" fill="none" stroke="currentColor" marker-end="url(#lg-a3)" stroke-dasharray="4 3"/><text x="186" y="20" text-anchor="start" font-size="10" class="tm">ToolMessages → back to agent</text></svg><figcaption>Two nodes and one cycle: the agent keeps going round through tools until its reply has no tool calls.</figcaption></figure>
  <div class="fx" data-lang="py">from langchain_core.tools import tool
from langchain_core.messages import AIMessage
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langgraph.graph import MessagesState
from langgraph.prebuilt import ToolNode, tools_condition

@tool
def order_status(order_id: str) -&gt; str:
    """Minutes late for a Biteful order id like 'B-102'. Use before answering refund questions."""
    return {"B-102": "delivered 50 minutes after the promised time"}.get(order_id, "order not found")

# STAND-IN model: scripted replies (a real one: ChatAnthropic(...).bind_tools([order_status]))
llm = GenericFakeChatModel(messages=iter([
    AIMessage("", tool_calls=[{"name": "order_status", "args": {"order_id": "B-102"}, "id": "c1"}]),
    AIMessage("B-102 was 50 minutes late (more than 45), so it qualifies for a full refund."),
]))

def agent(state: MessagesState):
    return {"messages": [llm.invoke(state["messages"])]}

g = StateGraph(MessagesState)
g.add_node("agent", agent)
g.add_node("tools", ToolNode([order_status]))     # runs every requested call -&gt; ToolMessages
g.add_edge(START, "agent")
g.add_conditional_edges("agent", tools_condition) # "tools" if the reply has tool_calls, else END
g.add_edge("tools", "agent")                      # the cycle
react = g.compile()

out = react.invoke({"messages": [("user", "Order B-102 came late. Refund?")]})
for m in out["messages"]:
    print(type(m).__name__, "|", m.content or m.tool_calls[0]["name"])</div>
  <div class="fx" data-lang="text">HumanMessage | Order B-102 came late. Refund?
AIMessage | order_status
ToolMessage | delivered 50 minutes after the promised time
AIMessage | B-102 was 50 minutes late (more than 45), so it qualifies for a full refund.</div>
  <p>The path was START → agent → tools → agent → END. The first <code>AIMessage</code> had empty text and a tool call, so <code>tools_condition</code> chose "tools". <code>ToolNode</code> ran <code>order_status("B-102")</code> and appended a <code>ToolMessage</code> with <code>tool_call_id="c1"</code>, so the model knows which request it answers. The agent ran again; its reply had no tool calls, so the graph ended. The model is scripted (labelled stand-in); with a real model the marked line becomes <code>ChatAnthropic(...).bind_tools([order_status])</code> and nothing else changes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A support agent (the model) and the dispatch desk (the tools). The agent reads the case file and either writes "check order B-102" or replies to the customer. Each time, dispatch fetches the record and clips it into the file. The file is the state.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ToolNode</strong>: a prebuilt node that executes the tool calls of the last AI message and returns matching <code>ToolMessage</code>s. <strong>tools_condition</strong>: the standard router "tools if tool calls, else END". The one-line equivalent is <code>langchain.agents.create_agent</code> (<a class="xref" data-note="langchain">LangChain</a>); <code>langgraph.prebuilt.create_react_agent</code> is deprecated in its favour.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing tool results as <code>AIMessage</code>s (some old tutorials did). Providers expect a <code>ToolMessage</code> with the right <code>tool_call_id</code>; otherwise they reject the history or the model loses track. <code>ToolNode</code> gets this right.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Checkpointing &amp; persistence.</b> Every graph so far starts from the input we pass and forgets everything when <code>invoke</code> returns. The customer's second message, a server restart, or a human who answers tomorrow all need the state to outlive one call.</div>

  <h2 id="lg-ckpt"><span class="num">07</span>Checkpointing &amp; Persistence</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Customer 42 asks about the late order, then about the rider. Can the second turn see the first? And if the server restarts between turns (or in the middle of one), what survives?</p>
  </div>
  <p>A <strong>checkpointer</strong> saves the full state after every step. You pass it to <code>compile</code>, and from then on every call names a <strong><code>thread_id</code></strong>, one conversation. Before running, LangGraph loads that thread's last saved state and merges your new input into it (with the reducers); after each node it saves a new checkpoint. <code>InMemorySaver</code> keeps checkpoints in RAM (development); <code>SqliteSaver</code> and <code>PostgresSaver</code> write them to a database, so they survive restarts.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Save points in a long video game. Die at hour 20 and you restart from the last save, not from the beginning. Each player profile (thread) has its own saves, on disk, so turning the console off doesn't lose them.</p>
  </div>
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

# "Restart the server": throw away the app and the connection, open new ones on the same file
conn.close(); del app
conn = sqlite3.connect(DB, check_same_thread=False)
app = build_graph().compile(checkpointer=SqliteSaver(conn))
saved = app.get_state(cfg)
print("after restart:", saved.values["answer"][:40], "| steps:", len(saved.values["steps"]))
print("customer-7:", app.get_state({"configurable": {"thread_id": "customer-7"}}).values)</div>
  <div class="fx" data-lang="text">turn 1: ['retrieve #1', 'answer', 'check: ok']
turn 2: ['retrieve #1', 'answer', 'check: ok', 'retrieve #1', 'answer', 'check: weak', 'rewrite', 'retrieve #2', 'answer', 'check: ok']
14 checkpoints saved for customer-42
after restart: If your order arrives more than 45 minut | steps: 10
customer-7: {}</div>
  <ul>
    <li><strong>Turn 1</strong> on <code>customer-42</code>: 3 steps. <strong>Turn 2</strong> on the same thread: the input didn't pass <code>steps</code>, so the saved list was loaded and the 7 new steps were <em>appended</em> to it (10 in all): the thread remembers. The other keys we passed (<code>question</code>, <code>query</code>, <code>attempts=0</code>) overwrote the old values, exactly as their merge rules say.</li>
    <li><strong>14 checkpoints</strong>: one for each input plus one after each step (turn 1: input, start, 3 nodes = 5; turn 2: input, start, 7 nodes = 9). <code>get_state_history</code> lists them newest first; each holds the full state and <code>next</code>, the node that would run.</li>
    <li><strong>After the "restart"</strong> (connection closed, app deleted, a brand-new app and connection on the same file), <code>get_state</code> still returns the turn-2 answer and all 10 steps. A thread nobody used (<code>customer-7</code>) is empty.</li>
  </ul>
<figure class="viz"><svg viewBox="0 0 600 130" width="600"><line x1="30" y1="60" x2="575" y2="60" stroke="currentColor" stroke-opacity=".5"/><path d="M50,30 V24 H215 V30" fill="none" stroke="currentColor" stroke-opacity=".4"/><text x="132" y="18" text-anchor="middle" font-size="10" class="tm">turn 1 · 5 checkpoints</text><path d="M260,30 V24 H560 V30" fill="none" stroke="currentColor" stroke-opacity=".4"/><text x="410" y="18" text-anchor="middle" font-size="10" class="tm">turn 2 · 9 checkpoints (rewrite loop)</text><circle cx="50" cy="60" r="5" class="fb sb"/><circle cx="90" cy="60" r="5" class="fb sb"/><circle cx="130" cy="60" r="5" class="fb sb"/><circle cx="170" cy="60" r="5" class="fb sb"/><circle cx="210" cy="60" r="5" class="fb sb"/><circle cx="260" cy="60" r="5" class="fb sb"/><circle cx="297" cy="60" r="5" class="fb sb"/><circle cx="334" cy="60" r="5" class="fb sb"/><circle cx="371" cy="60" r="5" class="fb sb"/><circle cx="408" cy="60" r="5" class="fb sb"/><circle cx="445" cy="60" r="5" class="fg sg"/><circle cx="482" cy="60" r="5" class="fb sb"/><circle cx="519" cy="60" r="5" class="fb sb"/><circle cx="556" cy="60" r="5" class="fb sb"/><text x="445" y="84" text-anchor="middle" font-size="10" class="tg">after rewrite</text><text x="30" y="112" text-anchor="start" font-size="10" class="tm">thread_id = "customer-42" · every dot = a saved state in SQLite · restart? load the last dot · time travel? fork from any dot</text></svg><figcaption>A thread is a chain of save points. Memory, crash recovery, time travel and interrupts all read from this chain.</figcaption></figure>
  <p>What those save points give you: <strong>multi-turn memory</strong> (same thread → previous state loaded), <strong>crash recovery</strong> (rerun the thread and it continues from the last checkpoint), <strong>time travel</strong> (take any checkpoint from <code>get_state_history</code>, edit it with <code>update_state</code>, replay from there), and <strong>interrupts</strong> (pausing is just "save and return", next section). For facts shared <em>across</em> threads (a customer's dietary preferences), use a <strong>store</strong>: <code>compile(store=...)</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Checkpoint</strong>: a saved snapshot of the full graph state plus the next node(s) to run. <strong>Thread</strong>: the sequence of checkpoints of one conversation, named by <code>thread_id</code> in <code>config["configurable"]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Thread-id mistakes: none (with a checkpointer, an error), one id shared by two customers (one sees the other's history), a new id per request (no memory). Build it from the customer and session ids. And <code>InMemorySaver</code> in production loses every thread on restart.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Human-in-the-loop.</b> State now outlives a call. The wifi customer still gets "ESCALATE to a human agent" as the answer, which is a placeholder, not a hand-off. How do we stop the graph at <code>escalate</code>, show the case to a person, and continue with her reply, maybe hours later?</div>

  <h2 id="lg-hitl"><span class="num">08</span>Human-in-the-Loop</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The graph has decided a human must answer. The person may reply in two minutes or tomorrow, after deploys and restarts. How does a running graph wait for someone without blocking a server process the whole time?</p>
  </div>
  <p>Inside a node, call <strong><code>interrupt(payload)</code></strong>. The graph saves its state and <code>invoke</code> returns immediately with the payload under <code>"__interrupt__"</code>, for your support dashboard to show. When the person answers, call <code>invoke(Command(resume=reply), config)</code> on the same thread. The node runs again <em>from its first line</em>, and this time <code>interrupt(...)</code> returns the reply instead of pausing. Nothing waits in memory: the paused thread is just a checkpoint in the database.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank auto-approves small payments but needs a second signature for a large transfer. The clerk puts the form in a tray (saved state) and goes on with other work; when the manager signs, the form continues from where it stopped. Gate only what truly needs a person.</p>
  </div>
  <div class="fx" data-lang="py">from langgraph.types import interrupt, Command

def escalate(state: SupportState):                # now really hands over to a person
    print("  escalate node starts")
    reply = interrupt({"customer_asked": state["question"], "we_searched": state["query"]})
    print("  human replied")
    return {"answer": f"[support agent] {reply}", "steps": ["escalate: human answered"]}

app = build_graph().compile(checkpointer=SqliteSaver(conn))
cfg7 = {"configurable": {"thread_id": "customer-7"}}
out = app.invoke({"question": WIFI, "query": WIFI, "attempts": 0, "steps": []}, cfg7)
print("paused with:", out["__interrupt__"][0].value)
print("next node:", app.get_state(cfg7).next)

# Later (here: after another "restart"), a support agent answers and the thread resumes
conn.close(); conn = sqlite3.connect(DB, check_same_thread=False)
app = build_graph().compile(checkpointer=SqliteSaver(conn))
out = app.invoke(Command(resume="Each restaurant sets its own wifi. Please ask the staff."), cfg7)
print(out["answer"])
print(out["steps"])</div>
  <div class="fx" data-lang="text">  escalate node starts
paused with: {'customer_asked': 'What is the wifi password at the restaurant?', 'we_searched': 'What is the wifi password at the restaurant?'}
next node: ('escalate',)
  escalate node starts
  human replied
[support agent] Each restaurant sets its own wifi. Please ask the staff.
['retrieve #1', 'answer', 'check: weak', 'rewrite', 'retrieve #2', 'answer', 'check: weak', 'escalate: human answered']</div>
  <ul>
    <li>The wifi question looped twice, then the router sent it to <code>escalate</code>, which printed its first line and stopped at <code>interrupt</code>: "human replied" was not printed. The payload tells the agent what the customer asked and what we searched for. <code>get_state(cfg7).next</code> confirms the thread is parked at <code>escalate</code>.</li>
    <li>We then simulated another restart (new connection, new app) and resumed with the agent's reply. "escalate node starts" printed <strong>a second time</strong>: on resume the node re-runs from the top, and <code>interrupt</code> returned the reply. The final answer is the human's, and <code>steps</code> shows the whole path including the hand-off.</li>
  </ul>
  <table class="tbl">
    <tr><th>Tool</th><th>What it does</th><th>Use for</th></tr>
    <tr><td><code>interrupt(value)</code></td><td>Dynamic pause inside a node; carries a payload; returns the resume value</td><td>Escalation, approval only when your logic decides (refund &gt; ₹1,000)</td></tr>
    <tr><td><code>Command(resume=x)</code></td><td>Continue a paused thread; <code>interrupt</code> returns x</td><td>The human's reply or decision</td></tr>
    <tr><td><code>compile(interrupt_before=["node"])</code></td><td>Static breakpoint before a node, every time; resume with <code>invoke(None, cfg)</code></td><td>Debugging, always-review steps</td></tr>
    <tr><td><code>app.update_state(cfg, {...})</code></td><td>Edit the saved state before resuming</td><td>Correct a refund amount, fix a query</td></tr>
    <tr><td><code>Command(goto="node", update={...})</code></td><td>Returned by a node: update state <em>and</em> choose the next node</td><td>Approve → tools, reject → back to agent</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Human-in-the-loop (HITL)</strong>: pausing a graph at a node so a person can review, edit or answer, then resuming the same thread with their input. Requires a checkpointer and the same <code>thread_id</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>On resume the interrupted node restarts from its first line, so code before <code>interrupt()</code> runs twice (our print did). Put side effects (emails, Slack pings, refunds) after it or in a separate node, or make them idempotent (safe to repeat).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Streaming.</b> A run can now take several loops and even pause. While it runs, the customer stares at a spinner, and when it misbehaves we see only the final state. How do we watch each step as it happens?</div>

  <h2 id="lg-stream"><span class="num">09</span>Streaming</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The rider customer's run takes 7 steps. With a real model each step can take seconds. How does the app show "searching… rephrasing… searching again…" live, and how do we see which node produced what?</p>
  </div>
  <p><code>app.stream(inputs, config, stream_mode=...)</code> yields events while the graph runs instead of one result at the end.</p>
  <table class="tbl">
    <tr><th>Mode</th><th>Yields</th><th>Use for</th></tr>
    <tr><td><code>"values"</code></td><td>Full state after each step</td><td>Debugging, simple UIs</td></tr>
    <tr><td><code>"updates"</code></td><td>Only what each node returned</td><td>Progress ("searching… drafting…")</td></tr>
    <tr><td><code>"messages"</code></td><td>Model tokens as they are generated</td><td>Typing effect in chat</td></tr>
    <tr><td><code>"custom"</code></td><td>Your own events from inside nodes (<code>get_stream_writer()</code>)</td><td>"Checked 3 of 13 sections"</td></tr>
  </table>
  <div class="fx" data-lang="py">cfg9 = {"configurable": {"thread_id": "customer-9"}}
start = {"question": RIDER, "query": RIDER, "attempts": 0, "steps": []}
for update in app.stream(start, cfg9, stream_mode="updates"):
    for node, changes in update.items():
        shown = {k: (v[:28] if isinstance(v, str) else [d["id"] for d in v] if k == "docs" else v)
                 for k, v in changes.items()}
        print(f"{node:9}", shown)</div>
  <div class="fx" data-lang="text">retrieve  {'docs': ['delivery.md#2'], 'attempts': 1, 'steps': ['retrieve #1']}
answer    {'answer': "I don't know based on these ", 'steps': ['answer']}
check     {'ok': False, 'steps': ['check: weak']}
rewrite   {'query': 'Is there a refund if my orde', 'steps': ['rewrite']}
retrieve  {'docs': ['refunds.md#0', 'refunds.md#1', 'faq.md#1'], 'attempts': 2, 'steps': ['retrieve #2']}
answer    {'answer': 'If your order arrives more t', 'steps': ['answer']}
check     {'ok': True, 'steps': ['check: ok']}</div>
  <p>Each event is <code>{node: what_it_returned}</code>, in the order the nodes ran: the failed first search (only Tracking), the "I don't know" answer, the weak check, the rewrite, the second search (Late orders first), the cited answer, the passing check. It is the <code>steps</code> trace, now live and with the actual values. A UI would map node names to messages ("Looking that up…", "Trying a different search…").</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Watching the rider's dot move on the Biteful map instead of only getting "delivered" at the end.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Streaming</strong>: receiving a run's intermediate results (state values, node updates, tokens or custom events) as they are produced. Several modes can be combined: <code>stream_mode=["updates", "messages"]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Streaming full <code>"values"</code> to a browser sends the whole state each step, including retrieved documents and internal fields. Stream <code>"updates"</code> or custom events and filter what the user may see.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Subgraphs.</b> Our graph has five nodes; Biteful's real one will have dozens (order lookup, refunds, allergens). The retrieve → answer pair will be needed in several places. Can a whole graph be reused as one node?</div>

  <h2 id="lg-sub"><span class="num">10</span>Subgraphs (Briefly)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we package retrieve → answer as a reusable unit with its own internal steps, and plug it into bigger graphs, without the pieces' states getting mixed up?</p>
  </div>
  <p>A <strong>subgraph</strong> is a compiled graph used as a node: <code>parent.add_node("rag", rag_subgraph)</code>. Teams use them for reusable components and for multi-agent systems, where each agent is its own graph (<a class="xref" data-note="multiagent">Multi-Agent Systems</a>). There is one catch when parent and subgraph share a key with a reducer:</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A company department. Head office sends accounts a file; how accounts works inside is its own business; the file comes back updated. If accounts sends back the <em>whole</em> file and head office staples it onto its own copy, every page appears twice.</p>
  </div>
  <div class="fx" data-lang="py"># The retrieve -&gt; answer part as its own small graph, reused as ONE node of a parent graph
sub = StateGraph(SupportState)
sub.add_node("retrieve", retrieve)
sub.add_node("answer", answer)
sub.add_edge(START, "retrieve")
sub.add_edge("retrieve", "answer")
sub.add_edge("answer", END)
rag_subgraph = sub.compile()

def parent_with(rag_node):
    p = StateGraph(SupportState)
    p.add_node("rag", rag_node)
    p.add_node("check", check)
    p.add_edge(START, "rag")
    p.add_edge("rag", "check")
    p.add_edge("check", END)
    return p.compile()

start = {"question": QUESTION, "query": QUESTION, "attempts": 0, "steps": ["start"]}
print(parent_with(rag_subgraph).invoke(start)["steps"])          # compiled graph as a node

def call_rag(state: SupportState):                # fix: map state in and out explicitly
    out = rag_subgraph.invoke({**state, "steps": []})   # the subgraph starts with a clean list
    return {k: out[k] for k in ("docs", "answer", "attempts", "steps")}   # only its new work
print(parent_with(call_rag).invoke(start)["steps"])</div>
  <div class="fx" data-lang="text">['start', 'start', 'retrieve #1', 'answer', 'check: ok']
['start', 'retrieve #1', 'answer', 'check: ok']</div>
  <p>Why "start" appears twice in the first line: the subgraph received the parent's state with <code>steps=['start']</code>, appended its own steps, and returned its <em>whole</em> list <code>['start', 'retrieve #1', 'answer']</code>. The parent's <code>operator.add</code> then appended that to its own <code>['start']</code>. The fix wraps the subgraph in a normal function node, <code>call_rag</code>, which passes a clean <code>steps</code> list in and returns only the subgraph's new work.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Subgraph</strong>: a compiled graph used as a node of another graph, either directly (shared keys pass through) or wrapped in a function that maps state in and out.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shared append keys double up when a subgraph is added directly. Map state explicitly (as in <code>call_rag</code>) or give the subgraph its own keys.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: LangGraph vs plain code.</b> We now have every piece. Which problems actually need them, and when is a chain or a plain function the better choice?</div>

  <h2 id="lg-when"><span class="num">11</span>LangGraph vs Plain Code</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 01's hand loop answered the same three customers in about 20 lines. What exactly did the graph add, and when is it not worth it?</p>
  </div>
  <p>Here is the graph LangGraph built from our declarations, printed as a Mermaid diagram (real output of <code>get_graph().draw_mermaid()</code>; dotted arrows are conditional edges):</p>
  <div class="fx" data-lang="py">print(build_graph().compile().get_graph().draw_mermaid())</div>
  <div class="fx" data-lang="text">---
config:
  flowchart:
    curve: linear
---
graph TD;
	__start__([&lt;p&gt;__start__&lt;/p&gt;]):::first
	retrieve(retrieve)
	answer(answer)
	check(check)
	rewrite(rewrite)
	escalate(escalate)
	__end__([&lt;p&gt;__end__&lt;/p&gt;]):::last
	__start__ --&gt; retrieve;
	answer --&gt; check;
	check -. &amp;nbsp;done&amp;nbsp; .-&gt; __end__;
	check -. &amp;nbsp;human&amp;nbsp; .-&gt; escalate;
	check -. &amp;nbsp;retry&amp;nbsp; .-&gt; rewrite;
	retrieve --&gt; answer;
	rewrite --&gt; retrieve;
	escalate --&gt; __end__;
	classDef default fill:#f2f0ff,line-height:1.2
	classDef first fill-opacity:0
	classDef last fill:#bfb6fc</div>
  <table class="tbl">
    <tr><th>Need</th><th>Hand loop (section 01)</th><th>LangGraph</th></tr>
    <tr><td>Answer, retry once, give up</td><td>✓ (about 20 lines)</td><td>✓ (5 nodes, 1 router)</td></tr>
    <tr><td>See the path taken</td><td>add prints</td><td><code>steps</code> reducer, <code>stream</code>, Mermaid diagram</td></tr>
    <tr><td>Remember the thread between turns</td><td>build storage yourself</td><td>checkpointer + <code>thread_id</code></td></tr>
    <tr><td>Survive a restart mid-run</td><td>build it yourself</td><td>SqliteSaver / PostgresSaver</td></tr>
    <tr><td>Wait hours for a human, then continue</td><td>very hard</td><td><code>interrupt</code> + <code>Command(resume=)</code></td></tr>
    <tr><td>Straight retrieve → answer, no memory</td><td><strong>simplest</strong></td><td>overkill: use LCEL or a function</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A to-do list on paper vs a ticketing system. For your own shopping, paper wins. For a support team where tickets wait for people, get reassigned and must never be lost, you want the system.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>When to use LangGraph</strong>: control flow with cycles or branches <em>and</em> at least one of: persistence across turns or restarts, human pauses, step-level streaming or inspection. Otherwise prefer an LCEL chain or plain code.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using LangGraph for a straight pipeline (retrieve → prompt → answer). With no branches, loops or persistence, it adds concepts and boilerplate and buys nothing.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> Eleven ideas: which is built on which, and what did each do for Biteful's three customers?</div>

  <h2 id="lg-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>State, reducers, nodes, edges, routers, cycles, ToolNode, checkpoints, interrupts, streams, subgraphs: separate features, or one mechanism with several uses?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="lg-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="170" height="44" rx="7" class="fr sr"/><text x="95" y="29" text-anchor="middle" font-size="11.5" font-weight="700">straight chain</text><text x="95" y="45" text-anchor="middle" class="tm" font-size="10">rider → "I don't know"</text>
<line x1="180" y1="32" x2="218" y2="32" stroke="currentColor" marker-end="url(#lg-c0)"/>
<rect x="220" y="10" width="220" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">state (TypedDict + reducers)</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">attempts overwrite · steps append</text>
<line x1="440" y1="32" x2="478" y2="32" stroke="currentColor" marker-end="url(#lg-c0)"/>
<rect x="480" y="10" width="190" height="44" rx="7" class="ft st"/><text x="575" y="29" text-anchor="middle" font-size="11.5" font-weight="700">nodes</text><text x="575" y="45" text-anchor="middle" class="tm" font-size="10">state → partial update</text>
<line x1="575" y1="54" x2="575" y2="84" stroke="currentColor" marker-end="url(#lg-c0)"/>
<rect x="480" y="86" width="190" height="44" rx="7" class="ft st"/><text x="575" y="105" text-anchor="middle" font-size="11.5" font-weight="700">edges + router</text><text x="575" y="121" text-anchor="middle" class="tm" font-size="10">done / human</text>
<line x1="480" y1="108" x2="442" y2="108" stroke="currentColor" marker-end="url(#lg-c0)"/>
<rect x="220" y="86" width="220" height="44" rx="7" class="fg sg"/><text x="330" y="105" text-anchor="middle" font-size="11.5" font-weight="700">cycle + stop condition</text><text x="330" y="121" text-anchor="middle" class="tm" font-size="10">rider answered on attempt 2</text>
<line x1="220" y1="108" x2="182" y2="108" stroke="currentColor" marker-end="url(#lg-c0)"/>
<rect x="10" y="86" width="170" height="44" rx="7" class="fg sg"/><text x="95" y="105" text-anchor="middle" font-size="11.5" font-weight="700">tools (ToolNode)</text><text x="95" y="121" text-anchor="middle" class="tm" font-size="10">B-102: 50 min late</text>
<line x1="95" y1="130" x2="95" y2="164" stroke="currentColor" marker-end="url(#lg-c0)"/>
<rect x="10" y="166" width="170" height="44" rx="7" class="fv"/><text x="95" y="185" text-anchor="middle" font-size="11.5" font-weight="700">checkpointer + thread</text><text x="95" y="201" text-anchor="middle" class="tm" font-size="10">14 saves; survives restart</text>
<line x1="180" y1="188" x2="218" y2="188" stroke="currentColor" marker-end="url(#lg-c0)"/>
<rect x="220" y="166" width="220" height="44" rx="7" class="fv"/><text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">interrupt → resume</text><text x="330" y="201" text-anchor="middle" class="tm" font-size="10">wifi → support agent's reply</text>
<line x1="440" y1="188" x2="478" y2="188" stroke="currentColor" marker-end="url(#lg-c0)"/>
<rect x="480" y="166" width="190" height="44" rx="7" class="fv"/><text x="575" y="185" text-anchor="middle" font-size="11.5" font-weight="700">stream · subgraph</text><text x="575" y="201" text-anchor="middle" class="tm" font-size="10">7 live updates · no doubling</text>
<text x="340" y="250" text-anchor="middle" class="tm" font-size="10.5">one mechanism: nodes update a shared state, edges pick the next node,</text>
<text x="340" y="268" text-anchor="middle" class="tm" font-size="10.5">and the state is saved after every step</text>
</svg><figcaption>The top row is the graph; the middle row is what control flow buys (loops, tools); the bottom row is what saving state after every step buys (memory, pauses, live view).</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's three customers</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our example</th><th>When to use</th></tr>
    <tr><td>Straight chain</td><td>LCEL / one function</td><td>is one pass enough?</td><td>main ✓, rider "I don't know", wifi alone</td><td>simple pipelines</td></tr>
    <tr><td>State</td><td>TypedDict + reducers</td><td>where does shared data live?</td><td>attempts 1 → 2; steps appended</td><td>every graph</td></tr>
    <tr><td>Nodes</td><td>functions → partial updates</td><td>what is one step?</td><td>retrieve / answer / check / rewrite / escalate</td><td>every graph</td></tr>
    <tr><td>Edges &amp; routers</td><td>add_edge, add_conditional_edges</td><td>what runs next?</td><td>main: 3 steps → END; rider → escalate</td><td>any decision</td></tr>
    <tr><td>Cycle + stop</td><td>edge back + counter in state</td><td>how to retry safely?</td><td>rider ok on attempt 2; no stop → error at 12</td><td>retry, refine, agent loops</td></tr>
    <tr><td>Tools</td><td>agent node + ToolNode + tools_condition</td><td>how does the model use functions?</td><td>order_status(B-102) → full refund</td><td>live data, actions</td></tr>
    <tr><td>Checkpointer</td><td>save state per step per thread</td><td>how to remember and recover?</td><td>14 checkpoints; 10 steps after restart</td><td>any multi-turn or long run</td></tr>
    <tr><td>Interrupt</td><td>checkpointer + pause/resume</td><td>how to wait for a human?</td><td>wifi → paused at escalate → agent's reply</td><td>escalation, approval</td></tr>
    <tr><td>Streaming</td><td>events per step</td><td>what is happening now?</td><td>7 updates for the rider</td><td>any UI</td></tr>
    <tr><td>Subgraph</td><td>compiled graph as node</td><td>how to reuse a piece?</td><td>doubled 'start' → fixed by mapping</td><td>large / multi-agent apps</td></tr>
    <tr><td>vs plain code</td><td>features needed</td><td>is it worth it?</td><td>hand loop works until pause/resume/memory</td><td>loops + persistence + humans</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>LangGraph = nodes that update one shared state + edges (that may loop) chosen by your code + a checkpoint of that state after every step.</strong> Loops and tools come from the edges; memory, crash recovery, human pauses and live streaming all come from the checkpoints.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The mechanism is simple; the mistakes are in the details.</div>

  <h2 id="lg-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which details break LangGraph apps in practice, and what does each failure look like?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: chat history without a reducer</span>
    <p><code>messages: list</code> without <code>add_messages</code>: each node's write replaces the history and the customer's message disappears. Use <code>MessagesState</code> or <code>Annotated[list, add_messages]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: returning the full state from a node</span>
    <p>Append-reducer keys get their old contents appended again. Return only changed keys.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: cycles with no exit</span>
    <p>A retry loop that depends only on the model saying "good" may never stop. Count attempts in state; set a small <code>recursion_limit</code> as a fuse.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: side effects before interrupt()</span>
    <p>The node reruns from the top on resume, so anything before <code>interrupt()</code> happens twice. Put emails, refunds and pings after it or in their own node.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: thread_id mistakes</span>
    <p>Missing id → error; shared id → mixed conversations; new id per request → no memory.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: InMemorySaver in production</span>
    <p>A restart or a second server process loses every thread and every paused escalation. Use SQLite or Postgres savers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: tool results as AIMessage</span>
    <p>Tool output must be a <code>ToolMessage</code> with the matching <code>tool_call_id</code>; <code>ToolNode</code> does it for you.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: subgraph key doubling</span>
    <p>Shared append keys duplicate when a subgraph is a node. Map state in and out with a wrapper.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: LangGraph for a straight line</span>
    <p>Retrieve → prompt → answer with no loops, branches or pauses is a chain, not a graph.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="multiagent">Multi-Agent Systems &amp; MCP</a>, where whole agents become nodes, and <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a> to measure the graph.</div>

  <h2 id="lg-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. <strong>Running example</strong>: Biteful's support graph over 13 policy sections. State: question, query, docs, answer, ok, attempts (overwrite), steps (append). Nodes: retrieve (BM25 top 3, attempts + 1), answer (stand-in LLM), check (citation valid?), rewrite (stand-in rewriter), escalate (<code>interrupt</code>). Router after check: ok → END; attempts &lt; 2 → rewrite → retrieve; else → escalate. Three customers: "50 minutes late" (answered, 3 steps), "rider took forever… compensated?" (answered on attempt 2, 7 steps), "wifi password" (escalated to a human, resumed with her reply).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On Biteful</th><th>Gap → next</th></tr>
    <tr><td>Straight chain</td><td>is one pass enough?</td><td>rider → "I don't know"</td><td>where does loop data live?</td></tr>
    <tr><td>State</td><td>shared data + merge rules?</td><td>attempts 1 → 2; steps append</td><td>who changes it?</td></tr>
    <tr><td>Nodes</td><td>what is a step?</td><td>retrieve / answer / check updates</td><td>order?</td></tr>
    <tr><td>Edges &amp; routers</td><td>what runs next?</td><td>done → END; weak → escalate</td><td>no second try</td></tr>
    <tr><td>Cycle + stop</td><td>retry safely?</td><td>rider ok on attempt 2; error at 12 without stop</td><td>needs live data</td></tr>
    <tr><td>Tools</td><td>model calls functions?</td><td>order_status(B-102)</td><td>forgets after each run</td></tr>
    <tr><td>Checkpointing</td><td>remember, recover?</td><td>14 checkpoints; restart keeps 10 steps</td><td>wait for a person?</td></tr>
    <tr><td>Interrupt</td><td>pause for a human?</td><td>wifi → paused → resumed</td><td>watch live?</td></tr>
    <tr><td>Streaming</td><td>what's happening?</td><td>7 updates</td><td>reuse pieces?</td></tr>
    <tr><td>Subgraphs</td><td>graph as node?</td><td>doubling → mapping fix</td><td>worth it?</td></tr>
    <tr><td>vs plain code</td><td>when to use?</td><td>loops + persistence + humans</td><td>→ multi-agent</td></tr>
  </table>
  <h3>Key APIs</h3>
  <table class="tbl">
    <tr><th>Job</th><th>API</th><th>Remember</th></tr>
    <tr><td>Declare state</td><td><code>class S(TypedDict)</code>; <code>Annotated[list, operator.add]</code>; <code>add_messages</code>; <code>MessagesState</code></td><td>No reducer = overwrite</td></tr>
    <tr><td>Build</td><td><code>g = StateGraph(S)</code>; <code>add_node</code>; <code>add_edge(START, "a")</code>; <code>add_conditional_edges("a", router, {...})</code></td><td>Router returns a label</td></tr>
    <tr><td>Run</td><td><code>app = g.compile(checkpointer=...)</code>; <code>invoke(inputs, config)</code>; <code>stream(..., stream_mode="updates")</code></td><td><code>{"configurable": {"thread_id": ...}, "recursion_limit": n}</code></td></tr>
    <tr><td>Tools</td><td><code>ToolNode(tools)</code>, <code>tools_condition</code>, <code>create_agent</code></td><td>ToolMessage + tool_call_id</td></tr>
    <tr><td>Inspect</td><td><code>get_state</code>, <code>get_state_history</code>, <code>update_state</code>, <code>get_graph().draw_mermaid()</code></td><td>One checkpoint per step + input</td></tr>
    <tr><td>Pause</td><td><code>interrupt(payload)</code>, <code>Command(resume=x)</code>, <code>interrupt_before=[...]</code>, <code>Command(goto=, update=)</code></td><td>Node reruns from the top</td></tr>
    <tr><td>Persist</td><td><code>InMemorySaver</code> (dev), <code>SqliteSaver</code>, <code>PostgresSaver</code>; <code>store=</code> for cross-thread facts</td><td>Durable saver in production</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>LangGraph</b><p>Loops, branches, tool loops, human pauses, resume after restart, long threads.</p><small>Keep a stop condition in state</small></div>
    <div><b>LCEL chain</b><p>Fixed straight pipeline (retrieve → answer).</p><small>Often runs inside a node</small></div>
    <div><b>Plain code</b><p>Small, single-process, no pauses or persistence.</p><small>Simplest to debug</small></div>
    <div><b>create_agent</b><p>Standard model ⇄ tools loop with middleware.</p><small>A prebuilt LangGraph graph</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Messages without a reducer; returning full state; cycles with no exit; side effects before <code>interrupt()</code>; thread-id mistakes; InMemorySaver in production; tool results as AIMessage; subgraph key doubling; graphs for straight lines.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>attempts: int</code> is 1, a node returns 2. <code>steps</code> (operator.add) is ['a'], node returns ['b']. After?</td><td>attempts 2 (overwrite); steps ['a', 'b'] (append)</td></tr>
    <tr><td>Router after check: ok=False, attempts=2, MAX=2. Next node?</td><td>escalate ("human")</td></tr>
    <tr><td>Why did the rider's run have 7 steps?</td><td>retrieve, answer, check (weak), rewrite, retrieve, answer, check (ok)</td></tr>
    <tr><td>A node prints, calls interrupt(), then prints again. Output across pause + resume?</td><td>First print twice, second print once</td></tr>
    <tr><td>Two turns: 3 nodes, then 7 nodes. Checkpoints?</td><td>(1 + 1 + 3) + (1 + 1 + 7) = 14</td></tr>
  </table>

  <h2 id="lg-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does LangGraph solve that a chain or a hand-written loop doesn't?</summary><div class="qa-body">A chain is one straight pass (no retry, no branch). A hand loop can retry, but its state lives in local variables: no pause for a human, no resume after a crash, no memory across turns, no step-level visibility. LangGraph makes steps nodes, transitions explicit edges, and saves state after every step, so all of these come built in.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define state, node and edge.</summary><div class="qa-body">State: a typed dict shared by all nodes. Node: a function that takes the state and returns only the keys it changed. Edge: what runs next, fixed (<code>add_edge</code>) or chosen by a router (<code>add_conditional_edges</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a reducer, and why does <code>add_messages</code> exist?</summary><div class="qa-body">A per-key merge rule (old, update) → new. Default is overwrite, which would erase chat history at every node. <code>add_messages</code> appends new messages and replaces one with the same id.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Trace the rider customer through the Biteful graph.</summary><div class="qa-body">retrieve #1 (only Tracking) → answer ("I don't know") → check (weak) → router: attempts 1 &lt; 2 → rewrite ("Is there a refund if my order is late?") → retrieve #2 (Late orders first) → answer (45-minute rule [1]) → check (ok) → END. 7 steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you guarantee a cycle terminates?</summary><div class="qa-body">Keep a counter (or budget) in state, updated by a node, and make the router choose an exit when it's reached (our attempts &lt; 2 rule → escalate). Add a small <code>recursion_limit</code> as a last-resort fuse; without the counter our wifi run hit GraphRecursionError at 12.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the ReAct tool loop look as a graph?</summary><div class="qa-body">START → agent; conditional edge from agent via <code>tools_condition</code>: tool calls → tools, else END; fixed edge tools → agent. <code>ToolNode</code> appends <code>ToolMessage</code>s with matching ids, and the agent decides again.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a checkpointer give you beyond memory?</summary><div class="qa-body">Crash recovery (continue a thread from its last checkpoint), time travel (list with <code>get_state_history</code>, edit with <code>update_state</code>, replay), and interrupts (pausing is saving and returning). With SqliteSaver our thread survived a "restart" with all 10 steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through human escalation with <code>interrupt</code>.</summary><div class="qa-body">The escalate node calls <code>interrupt(payload)</code>; the graph saves state and <code>invoke</code> returns with <code>__interrupt__</code>; the dashboard shows the payload. Later, <code>invoke(Command(resume=reply), cfg)</code> on the same thread re-runs the node from the top and <code>interrupt</code> returns the reply. Needs a checkpointer and the same <code>thread_id</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your escalate node sends a Slack ping, then calls <code>interrupt</code>. Agents get two pings. Why?</summary><div class="qa-body">On resume the node restarts from its first line, so the ping runs again (our print appeared twice). Move side effects after <code>interrupt()</code>, into a separate node, or make them idempotent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>interrupt()</code> vs <code>interrupt_before</code>?</summary><div class="qa-body"><code>interrupt_before=["node"]</code> is a static breakpoint set at compile time: always pause before that node; resume with <code>invoke(None, cfg)</code>. <code>interrupt()</code> is dynamic: called inside a node only when your logic decides, carries a payload and receives a resume value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which stream mode for a "searching… rephrasing…" progress UI, and which for a typing effect?</summary><div class="qa-body"><code>"updates"</code> (each node's returned changes, in order: 7 events for the rider) for progress; <code>"messages"</code> for model tokens. They can be combined.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A subgraph added as a node returns <code>['start', 'start', …]</code>. Why and how to fix?</summary><div class="qa-body">Parent and subgraph share an append-reducer key; the subgraph returns its whole list (including the 'start' it received) and the parent appends it again. Wrap the subgraph in a function node that passes a clean list in and returns only new entries.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do interrupts need a checkpointer?</summary><div class="qa-body">Pausing means ending the current <code>invoke</code> and continuing in a later one, possibly in another process after a restart. The only thing connecting the two calls is the saved state of the thread. Without a checkpointer there is nothing to resume from.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a cycle need state, when a Python <code>while</code> loop just uses a local counter?</summary><div class="qa-body">Nodes are separate functions run by LangGraph, possibly across pauses and restarts; local variables don't survive between them. The counter must live in state (attempts) so the router can read it and the checkpointer can save it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you remove the reducer from <code>steps</code> (or <code>messages</code>) in a checkpointed graph?</summary><div class="qa-body">Every node's write replaces the list, so the trace (or chat history) keeps only the last entry, and on the next turn the loaded state has lost everything earlier. Memory across turns depends on the append reducer as much as on the checkpointer: in our run turn 2's steps were appended to turn 1's 3 steps only because of <code>operator.add</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does the RAG note's "agentic RAG" map onto this graph?</summary><div class="qa-body">RAG's failure-mode fixes become nodes and edges: grounding/citation check → <code>check</code>; query rewriting → <code>rewrite</code> + cycle; "say you don't know" → router to <code>escalate</code> with a human <code>interrupt</code>. The retrieval and generation pieces are unchanged; the graph adds the decision to try again and the hand-off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you <em>not</em> use LangGraph?</summary><div class="qa-body">For a straight pipeline (retrieve → prompt → answer) with no loops, branches, human pauses or persistence: an LCEL chain or plain function is simpler and easier to debug.</div></details>
</main>`
});
