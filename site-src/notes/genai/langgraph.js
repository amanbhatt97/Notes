// notes/genai/langgraph.js — LangGraph
Object.assign(TOPIC_CONTENT, {
  "langgraph": `<main>
  <h1>LangGraph</h1>
  <p class="lead">LangGraph turns the agent loop from 08–09 into an explicit graph: one shared state, nodes that update it, and edges (including loops) that you control. Because state is saved after every step, you get memory across turns, crash recovery and human approval almost for free. We start from a hand-written agent loop in plain Python, see what it can't do, then rebuild it piece by piece. You need 08 Agent Fundamentals and 10 LangChain; 12 Multi-Agent Systems builds on this. All code was run on langgraph 1.2 with scripted fake models, so the outputs are real.</p>

  <h2 id="lg-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">LangGraph</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why LangGraph</div>
        <ul>
          <li><b>Hand loop</b> — <code>for step in range(5)</code>: model → tool → model; works, but state lives in one Python variable</li>
          <li><b>State machine for LLM apps</b> — typed state + nodes + edges, saved every step</li>
          <li><b>Fixes AgentExecutor's black box</b> — pause/approve, resume after crash, memory, your own branches/loops</li>
          <li>💡 Surgical robot <em>with</em> a pause button, live feed and rewind</li>
          <li><b>vs LCEL</b> — LCEL builds one step (recipe); LangGraph the flow between steps (kitchen); often combined</li>
          <li>⚠ Straight pipeline with no loops/branches/persistence → LCEL or plain code</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">State &amp; reducers</div>
        <ul>
          <li><b>State</b> — one <code>TypedDict</code> shared by all nodes</li>
          <li><b>Node returns only changed keys</b>; LangGraph merges</li>
          <li><b>Default</b> — overwrite (<code>attempts: 1 → 2</code>)</li>
          <li><b>Reducer</b> — <code>Annotated[list, operator.add]</code> = append (<code>['draft'] → ['draft','check#1']</code>)</li>
          <li><b><code>add_messages</code></b> — append + replace by id; <code>MessagesState</code> ready-made</li>
          <li>💡 Relay runners sharing one notebook</li>
          <li>⚠ <code>messages: list</code> without reducer wipes history; parallel writes → <code>InvalidUpdateError</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Nodes, edges, cycles</div>
        <ul>
          <li><b>Node</b> — function: state → partial update</li>
          <li><b>Edge</b> — <code>add_edge("a", "b")</code>; <code>START</code>, <code>END</code></li>
          <li><b>Conditional edge</b> — <code>add_conditional_edges("a", router, mapping)</code>; router returns next node name</li>
          <li><b>Cycle</b> — edge back to an earlier node (taste, adjust, taste)</li>
          <li><b>Compile</b> — <code>g.compile()</code> → app with invoke/stream</li>
          <li><b>Key</b> — LLM output influences routing, but the router is <em>your</em> code</li>
          <li>⚠ Cycle with no exit → <code>GraphRecursionError</code>; default limit 10,007 → pass <code>{"recursion_limit": 25}</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ReAct as a graph</div>
        <ul>
          <li><b>START → agent</b>; agent →(tools_condition)→ tools | END; <b>tools → agent</b></li>
          <li><b><code>ToolNode(tools)</code></b> — runs all tool calls, returns <code>ToolMessage</code>s; errors as messages</li>
          <li><b><code>tools_condition</code></b> — "tools" if tool_calls else END</li>
          <li><b>Run trace</b> — Human → AI(call) → Tool("in transit") → AI(answer)</li>
          <li><b>One-liner</b> — <code>langchain.agents.create_agent</code>; <code>create_react_agent</code> deprecated</li>
          <li>⚠ Tool results as <code>AIMessage</code> → rejected; use <code>ToolMessage</code> + <code>tool_call_id</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Checkpointing &amp; memory</div>
        <ul>
          <li><b>Checkpointer</b> — full state saved after every step, per <code>thread_id</code></li>
          <li><b><code>compile(checkpointer=InMemorySaver())</code></b>; prod: <code>SqliteSaver</code>, <code>PostgresSaver</code></li>
          <li><b>Demo</b> — 2 turns on aman-1 → 4 messages, 6 checkpoints; riya-1 starts empty</li>
          <li><b>Gives</b> — multi-turn memory, crash recovery, time travel (<code>get_state_history</code>, <code>update_state</code>), interrupts</li>
          <li><b>Store</b> — <code>compile(store=...)</code> for facts across threads</li>
          <li>💡 Video-game save points</li>
          <li>⚠ Missing <code>thread_id</code> → error; shared id across users → leaked history</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Human-in-the-loop</div>
        <ul>
          <li><b><code>interrupt(payload)</code></b> — inside a node; graph saves and returns <code>__interrupt__</code></li>
          <li><b><code>invoke(Command(resume=x), cfg)</code></b> — x becomes interrupt's return value</li>
          <li><b><code>interrupt_before=["tools"]</code></b> — static breakpoint; resume with <code>invoke(None, cfg)</code></li>
          <li><b><code>update_state</code></b> — edit args before resuming</li>
          <li>💡 Bank: second signer only for large wires</li>
          <li>⚠ Node <b>reruns from the top</b> on resume ("approval node starts" printed twice) → side effects after interrupt or in own node</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Streaming &amp; subgraphs</div>
        <ul>
          <li><b><code>stream_mode</code></b> — values (full state), updates (node diffs), messages (tokens), custom</li>
          <li><b>Subgraph</b> — compiled graph as a node; reusable agent, own state (12)</li>
          <li>⚠ Shared reducer keys double up (<code>['start', 'start', 'write']</code>) → wrap in a function that maps state</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Build: agent with approval</div>
        <ul>
          <li><b>Tools</b> — <code>order_status</code> (safe), <code>issue_refund</code> (risky)</li>
          <li><b>route()</b> — END / "approval" if risky / "tools"</li>
          <li><b>approval node</b> — <code>interrupt</code> → <code>Command(goto="tools")</code> or reject <code>ToolMessage</code> → agent</li>
          <li><b>Result</b> — paused at <code>('approval',)</code>, resumed, 8 messages in thread</li>
          <li><b>Extend</b> — gate only &gt; 1,000; edited amount via resume; SqliteSaver across restarts</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lg-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why LangGraph</span><span class="rm-sub">A pause button for agents</span></div></div>
      <div class="rm-item rm-done" data-target="lg-state"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">State &amp; Reducers</span><span class="rm-sub">The shared notebook</span></div></div>
      <div class="rm-item rm-done" data-target="lg-nodes"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Nodes, Edges, Cycles</span><span class="rm-sub">Stations, junctions, loops</span></div></div>
      <div class="rm-item rm-done" data-target="lg-react"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">A ReAct Agent as a Graph</span><span class="rm-sub">agent ⇄ tools until done</span></div></div>
      <div class="rm-item rm-done" data-target="lg-ckpt"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Checkpointing &amp; Memory</span><span class="rm-sub">Save points per thread</span></div></div>
      <div class="rm-item rm-done" data-target="lg-hitl"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Human-in-the-Loop</span><span class="rm-sub">interrupt() and resume</span></div></div>
      <div class="rm-item rm-done" data-target="lg-stream"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Streaming &amp; Subgraphs</span><span class="rm-sub">Watch it run; nest graphs</span></div></div>
      <div class="rm-item rm-done" data-target="lg-build"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Build It: Agent with Approval</span><span class="rm-sub">Tools, memory, interrupt, verified</span></div></div>
      <div class="rm-item rm-done" data-target="lg-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Reducers, thread ids, reruns</span></div></div>
      <div class="rm-item rm-done" data-target="lg-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="lg-why"><span class="num">01</span>Why LangGraph</h2>
  <p>An agent is a loop: ask the model, and if it wants a tool, run the tool, give back the result, and ask again, until it answers. You can write that loop yourself in a dozen lines. Below the "model" is a scripted list, so it runs offline.</p>
  <div class="fx" data-lang="py">script = [
    {"tool": "order_status", "args": {"order_id": "A1"}},
    {"answer": "Order A1 was delivered."},
]
TOOLS = {"order_status": lambda order_id: {"A1": "delivered"}.get(order_id, "not found")}

def fake_model(messages):
    return script[len([m for m in messages if m[0] == "ai"])]

messages = [("user", "Where is order A1?")]
for step in range(5):                         # hard cap on steps
    reply = fake_model(messages)
    messages.append(("ai", reply))
    if "answer" in reply:
        break
    result = TOOLS[reply["tool"]](**reply["args"])
    messages.append(("tool", result))
for m in messages:
    print(m)</div>
  <div class="fx" data-lang="text">('user', 'Where is order A1?')
('ai', {'tool': 'order_status', 'args': {'order_id': 'A1'}})
('tool', 'delivered')
('ai', {'answer': 'Order A1 was delivered.'})</div>
  <p>The loop asked the model, ran <code>order_status("A1")</code> when the model asked for it, appended the result, and stopped when an answer came. It works. Now imagine it in production. The tool is <code>issue_refund</code> and a manager must approve refunds above ₹1,000: where do you pause, and how does the loop continue tomorrow when she clicks "approve"? The server restarts at step 8 of 10: all of <code>messages</code> was in RAM and is gone. The user comes back an hour later: where is the conversation? You want "if the answer is weak, retrieve again": more <code>if</code>s inside the loop. Every one of these is hand-built plumbing. The old LangChain <code>AgentExecutor</code> hid this loop in a black box and couldn't do them either.</p>
  <div class="cards">
    <div><b>Pause</b><p>Stop before 1,000 refund emails go out; let a human approve.</p></div>
    <div><b>Resume</b><p>Crash at step 8 of 10, continue from step 8, not step 1.</p></div>
    <div><b>Remember</b><p>Earlier messages, without hand-built plumbing.</p></div>
    <div><b>Control flow</b><p>Branch, loop back or run in parallel on <em>your</em> rules.</p></div>
  </div>
  <p>LangGraph's idea: write each piece of the loop as a separate function (a <strong>node</strong>), keep everything they share in one dict (the <strong>state</strong>), declare what runs after what (the <strong>edges</strong>), and let the framework <em>save the state after every node</em>. Once state is saved per step, pausing, resuming and remembering are just "load the last save".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A surgical robot with no pause button vs one with a pause button, a live feed of every step, and the ability to rewind to any earlier moment. LangGraph is the second one.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LangGraph</strong> models an LLM app as a <strong>state machine</strong>: a typed <em>state</em>, <em>nodes</em> (functions that update it) and <em>edges</em> (what runs next). It saves state after every step. A state machine is any system that is always in one known state and moves between states by fixed rules.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>LangChain (LCEL)</th><th>LangGraph</th></tr>
    <tr><td>Builds</td><td>The logic inside one step</td><td>The flow between steps</td></tr>
    <tr><td>Analogy</td><td>Writing one recipe</td><td>Running the whole kitchen</td></tr>
    <tr><td>Loops / branches</td><td>Linear pipelines</td><td>Cycles and conditional edges</td></tr>
    <tr><td>Memory, pause, resume</td><td>You build it</td><td>Checkpointer + <code>interrupt</code></td></tr>
  </table>
  <p>They combine: an LCEL chain often runs <em>inside</em> a LangGraph node. Interviews for agent roles ask "why LangGraph over a while loop?"; the answer is persistence, interrupts and explicit control flow.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using LangGraph for a straight pipeline (retrieve → generate). With no branches, loops or persistence, an LCEL chain or plain code is simpler.</p>
  </div>

  <h2 id="lg-state"><span class="num">02</span>State &amp; Reducers</h2>
  <p>In the hand loop, everything lived in one variable, <code>messages</code>, and the loop body edited it directly. When the loop is split into separate node functions, they need a shared place to read and write. If nodes passed data straight to each other, every node would need to know who comes next, and adding a node would mean rewiring the others.</p>
  <p>LangGraph's answer is one shared dict, the <strong>state</strong>, declared as a <code>TypedDict</code> (a dict with named, typed keys). Each node receives the whole state and returns <strong>only the keys it changed</strong>. LangGraph merges that small update into the state.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Relay runners sharing one notebook. Each reads everything so far and adds a line. Nobody passes notes directly to the next runner.</p>
  </div>
  <p>How does it merge? By default a new value <strong>overwrites</strong> the old one. That is right for a counter, but wrong for a list of steps or messages, where you want to <em>add</em>. A <strong>reducer</strong> is a per-key merge rule, attached with <code>Annotated[type, reducer]</code>. <code>operator.add</code> on lists means "old + new", i.e. append.</p>
<figure class="viz"><svg viewBox="0 0 600 160" width="600"><defs><marker id="lg-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="225" y="14" text-anchor="middle" font-size="10" class="tm">state before</text><text x="370" y="14" text-anchor="middle" font-size="10" class="tm">node returns</text><text x="525" y="14" text-anchor="middle" font-size="10" class="tm">state after</text><text x="10" y="40" font-weight="bold" font-size="12">attempts: int</text><text x="10" y="55" text-anchor="start" font-size="10" class="tm">no reducer → overwrite</text><rect x="170" y="24" width="110" height="36" rx="6" class="fs"/><text x="225" y="46" text-anchor="middle" font-size="11">1</text><rect x="320" y="24" width="100" height="36" rx="6" class="fv"/><text x="370" y="46" text-anchor="middle" font-size="11">2</text><rect x="450" y="24" width="144" height="36" rx="6" class="fb sb"/><text x="522" y="46" text-anchor="middle" font-size="11">2</text><text x="300" y="47" text-anchor="middle">+</text><line x1="422" y1="42" x2="448" y2="42" stroke="currentColor" marker-end="url(#lg-a1)"/><text x="10" y="94" font-weight="bold" font-size="12">steps</text><text x="10" y="109" text-anchor="start" font-size="10" class="tm">operator.add → append</text><rect x="170" y="78" width="110" height="36" rx="6" class="fs"/><text x="225" y="100" text-anchor="middle" font-size="11">['draft']</text><rect x="320" y="78" width="100" height="36" rx="6" class="fv"/><text x="370" y="100" text-anchor="middle" font-size="11">['check#1']</text><rect x="450" y="78" width="144" height="36" rx="6" class="fg sg"/><text x="522" y="100" text-anchor="middle" font-size="11">['draft','check#1']</text><text x="300" y="101" text-anchor="middle">+</text><line x1="422" y1="96" x2="448" y2="96" stroke="currentColor" marker-end="url(#lg-a1)"/><text x="10" y="150" text-anchor="start" font-size="10" class="tr">⚠ messages: list with no reducer → every node write replaces the chat history</text></svg><figcaption>Same node write, two merge rules: a key without a reducer is replaced, a key with operator.add (or add_messages) grows.</figcaption></figure>
  <p>The code runs exactly the diagram: a one-node graph whose node returns <code>attempts=2</code> and <code>steps=["check#1"]</code>, starting from <code>attempts=1, steps=["draft"]</code>.</p>
  <div class="fx" data-lang="py">import operator
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END

class State(TypedDict):
    attempts: int                                 # no reducer: overwrite
    steps: Annotated[list[str], operator.add]     # reducer: append

def work(state: State):
    return {"attempts": 2, "steps": ["check#1"]}  # return only changed keys

g = StateGraph(State)
g.add_node("work", work)
g.add_edge(START, "work")
g.add_edge("work", END)
print(g.compile().invoke({"attempts": 1, "steps": ["draft"]}))</div>
  <div class="fx" data-lang="text">{'attempts': 2, 'steps': ['draft', 'check#1']}</div>
  <p><code>attempts</code> was replaced (1 → 2). <code>steps</code> was appended (<code>['draft'] + ['check#1']</code>), because of the <code>Annotated[..., operator.add]</code> line. The node never wrote the full list; it returned only its new item.</p>
  <h3>add_messages: the reducer for chat</h3>
  <p>For chat history, use <code>add_messages</code>. It appends new messages, but if a new message has the <em>same id</em> as an existing one, it replaces it (useful for editing a message). The code calls it directly on two small lists.</p>
  <div class="fx" data-lang="py">from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph.message import add_messages

old = [HumanMessage("Hi", id="1"), AIMessage("Hello!", id="2")]
print([m.content for m in add_messages(old, [AIMessage("How can I help?", id="3")])])
print([m.content for m in add_messages(old, [AIMessage("Namaste!", id="2")])])</div>
  <div class="fx" data-lang="text">['Hi', 'Hello!', 'How can I help?']
['Hi', 'Namaste!']</div>
  <p>New id 3 was appended; repeated id 2 replaced "Hello!". <code>MessagesState</code> is a ready-made state with just <code>messages: Annotated[list[AnyMessage], add_messages]</code>; most agents start from it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>State</strong>: the typed dict shared by all nodes. <strong>Reducer</strong>: a function <code>(old_value, new_value) → merged_value</code> that decides how a node's update to one key is combined with the existing value.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A <code>messages: list</code> key without a reducer: every node's write replaces the whole history, and the conversation is wiped each step (shown in section 09). Two parallel nodes writing a no-reducer key raise <code>InvalidUpdateError</code>.</p>
  </div>

  <h2 id="lg-nodes"><span class="num">03</span>Nodes, Edges, Cycles</h2>
  <p>With state defined, you describe the flow. In the hand loop, "what runs next" was buried in <code>if</code> and <code>break</code> statements. In a graph it is declared up front, which is what makes it easy to draw, test and change.</p>
  <ul>
    <li><strong>Node</strong>: a plain Python function, <code>state → partial update</code>. One job, like a station on an assembly line.</li>
    <li><strong>Edge</strong>: <code>add_edge("a", "b")</code>, always go a → b. <code>START</code> and <code>END</code> are the entry and exit.</li>
    <li><strong>Conditional edge</strong>: <code>add_conditional_edges("a", router, mapping)</code>. Your <code>router(state)</code> returns a label, and the mapping turns the label into the next node: a traffic controller at a junction.</li>
    <li><strong>Cycle</strong>: an edge back to an earlier node. Like a chef who tastes, adjusts, tastes again, until it's right.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A metro map. Stations are nodes, tracks are edges, an interchange where the train can go two ways is a conditional edge, and the circle line is a cycle. The map is fixed in advance; the passenger (the state) moves along it.</p>
  </div>
  <p>The graph below drafts, checks, and loops back to draft until two attempts have been made. In a real app <code>check</code> might ask an LLM to grade the draft.</p>
  <div class="fx" data-lang="py">import operator
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END

class State(TypedDict):
    question: str
    steps: Annotated[list[str], operator.add]   # reducer: append
    attempts: int                               # no reducer: overwrite

def draft(state: State):
    return {"steps": ["draft"], "attempts": state["attempts"] + 1}

def check(state: State):
    return {"steps": [f"check#{state['attempts']}"]}

def good_enough(state: State):            # the router: reads state, names next node
    return "done" if state["attempts"] &gt;= 2 else "retry"

g = StateGraph(State)
g.add_node("draft", draft)
g.add_node("check", check)
g.add_edge(START, "draft")
g.add_edge("draft", "check")
g.add_conditional_edges("check", good_enough, {"retry": "draft", "done": END})   # the cycle
app = g.compile()
print(app.invoke({"question": "q", "steps": [], "attempts": 0}))</div>
  <div class="fx" data-lang="text">{'question': 'q', 'steps': ['draft', 'check#1', 'draft', 'check#2'], 'attempts': 2}</div>
  <h3>Trace</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Node</th><th>Returns</th><th>State after</th><th>Next</th></tr>
    <tr><td>1</td><td>draft</td><td>steps ['draft'], attempts 1</td><td>steps ['draft'], attempts 1</td><td>check</td></tr>
    <tr><td>2</td><td>check</td><td>steps ['check#1']</td><td>steps ['draft','check#1']</td><td>router: 1 &lt; 2 → "retry" → draft</td></tr>
    <tr><td>3</td><td>draft</td><td>steps ['draft'], attempts 2</td><td>…, 'draft'], attempts 2</td><td>check</td></tr>
    <tr><td>4</td><td>check</td><td>steps ['check#2']</td><td>…, 'check#2']</td><td>router: "done" → END</td></tr>
  </table>
  <p><code>g.compile()</code> checks the graph (no missing nodes, every node reachable) and returns an <code>app</code> with <code>invoke</code> and <code>stream</code>. The mapping <code>{"retry": "draft", "done": END}</code> is the cycle: "retry" sends the flow back to an earlier node.</p>
  <div class="callout pred"><span class="label">Predict</span>
    <p>Why does <code>steps</code> have four entries but <code>attempts</code> is just 2? (<code>steps</code> has an append reducer; <code>attempts</code> is overwritten each time.)</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The LLM's output can <em>influence</em> routing, but the routing function is your code. That's what makes the flow debuggable and safe.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A cycle without a reliable exit runs until LangGraph's recursion limit raises <code>GraphRecursionError</code>. In langgraph 1.2 the default limit is 10,007 steps, which is a lot of paid LLM calls, so pass a small one per run, e.g. <code>app.invoke(inputs, {"recursion_limit": 25})</code> (tested: it stops with "Recursion limit of 25 reached"). Better still, count attempts in state and route to END.</p>
  </div>

  <h2 id="lg-react"><span class="num">04</span>A ReAct Agent as a Graph</h2>
  <p>Now rebuild the hand loop from section 01 as a graph. The loop had two jobs that alternated: <em>ask the model</em> and <em>run the requested tools</em>. Those become two nodes. The <code>if "answer" in reply: break</code> becomes a conditional edge, and "go round again" becomes a fixed edge from tools back to the model.</p>
<figure class="viz"><svg viewBox="0 0 600 136" width="600"><defs><marker id="lg-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="20" y="61" width="64" height="28" rx="14" class="fs"/><text x="52" y="79" text-anchor="middle" font-size="11">START</text><rect x="120" y="55" width="110" height="40" rx="6" class="fb sb"/><text x="175" y="73" text-anchor="middle" font-weight="bold">agent</text><text x="175" y="87" text-anchor="middle" font-size="10" class="tm">LLM + tools</text><line x1="84" y1="75" x2="118" y2="75" stroke="currentColor" marker-end="url(#lg-a2)"/><path d="M300,57 L322,75 L300,93 L278,75 Z" class="fv" stroke="currentColor" stroke-opacity=".5"/><line x1="230" y1="75" x2="276" y2="75" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="300" y="112" text-anchor="middle" font-size="10" class="tm">tools_condition</text><rect x="400" y="12" width="130" height="40" rx="6" class="ft st"/><text x="465" y="30" text-anchor="middle" font-weight="bold">tools</text><text x="465" y="44" text-anchor="middle" font-size="10" class="tm">ToolNode</text><path d="M300,57 V32 H398" fill="none" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="355" y="46" text-anchor="middle" font-size="10" class="tb">tool_calls</text><rect x="420" y="98" width="70" height="28" rx="14" class="fs"/><text x="455" y="116" text-anchor="middle" font-size="11">END</text><path d="M322,75 H360 V112 H418" fill="none" stroke="currentColor" marker-end="url(#lg-a2)"/><text x="390" y="106" text-anchor="middle" font-size="10" class="tg">none</text><path d="M465,12 V4 H175 V53" fill="none" stroke="currentColor" marker-end="url(#lg-a2)" stroke-dasharray="4 3"/><text x="186" y="20" text-anchor="start" font-size="10" class="tm">ToolMessages → back to agent</text></svg><figcaption>Two nodes and one cycle: the agent keeps going round through tools until its reply has no tool calls.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A detective (agent) and a records clerk (tools). The detective reads the case file and either writes "fetch record X" or announces the answer. Each time, the clerk fetches the record and puts it back in the file. The file is the state.</p>
  </div>
  <p>The code builds the graph with a scripted chat model that first requests <code>order_status("B2")</code> and then answers. With a real model you'd write <code>ChatAnthropic(...).bind_tools(tools)</code> on the marked line.</p>
  <div class="fx" data-lang="py">from langchain_core.tools import tool
from langchain_core.messages import AIMessage
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langgraph.graph import StateGraph, MessagesState, START
from langgraph.prebuilt import ToolNode, tools_condition

@tool
def order_status(order_id: str) -&gt; str:
    """Look up the status of an order. Use when the user asks where an order is."""
    return {"A1": "delivered", "B2": "in transit"}.get(order_id, "not found")

tools = [order_status]
# Real: llm = ChatAnthropic(model="claude-opus-5-5").bind_tools(tools)
llm = GenericFakeChatModel(messages=iter([
    AIMessage("", tool_calls=[{"name": "order_status", "args": {"order_id": "B2"}, "id": "c1"}]),
    AIMessage("Order B2 is in transit."),
]))

def agent(state: MessagesState):
    return {"messages": [llm.invoke(state["messages"])]}

g = StateGraph(MessagesState)
g.add_node("agent", agent)
g.add_node("tools", ToolNode(tools))          # runs every tool call, returns ToolMessages
g.add_edge(START, "agent")
g.add_conditional_edges("agent", tools_condition)   # "tools" if tool_calls else END
g.add_edge("tools", "agent")                  # the cycle
app = g.compile()

out = app.invoke({"messages": [("user", "Where is order B2?")]})
for m in out["messages"]:
    print(type(m).__name__, "|", m.content or m.tool_calls[0]["name"])</div>
  <div class="fx" data-lang="text">HumanMessage | Where is order B2?
AIMessage | order_status
ToolMessage | in transit
AIMessage | Order B2 is in transit.</div>
  <p>The path was START → agent → tools → agent → END. The first <code>AIMessage</code> had empty text and a tool call, so <code>tools_condition</code> routed to <code>tools</code>. <code>ToolNode</code> ran <code>order_status("B2")</code> and appended a <code>ToolMessage</code> "in transit" with <code>tool_call_id="c1"</code>, so the model knows which request it answers. The agent ran again; its reply had no tool calls, so the graph ended. Because <code>MessagesState</code> uses <code>add_messages</code>, every node's output was appended.</p>
  <ul>
    <li><strong><code>ToolNode</code></strong>: executes all tool calls in the last <code>AIMessage</code> (several at once if the model asked for several) and returns <code>ToolMessage</code>s with matching ids; tool errors come back as messages, not crashes.</li>
    <li><strong><code>tools_condition</code></strong>: the standard router, "tools" if the last message has tool calls, else <code>END</code>.</li>
    <li>The one-liner version is <code>langchain.agents.create_agent</code> (<a class="xref" data-note="langchain">LangChain</a>). <code>langgraph.prebuilt.create_react_agent</code> is deprecated in its favour.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing tool results as <code>AIMessage</code>s (as some old tutorials did). The model expects a <code>ToolMessage</code> with the right <code>tool_call_id</code>; otherwise the provider rejects the history or the model loses track.</p>
  </div>

  <h2 id="lg-ckpt"><span class="num">05</span>Checkpointing &amp; Memory</h2>
  <p>So far, each <code>invoke</code> starts from the input you pass and forgets everything when it returns. Ask "My name is Aman" and then "What is my name?" in two calls, and the second call knows nothing about the first. A crash mid-run also loses everything. Both problems have one fix: save the state somewhere after every step.</p>
  <p>A <strong>checkpointer</strong> does exactly that. You pass it to <code>compile</code>, and from then on every <code>invoke</code> needs a <strong><code>thread_id</code></strong>: a name for one conversation. Before running, LangGraph loads that thread's last saved state and merges your new input into it (with the reducers). After each node, it saves a new checkpoint.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Save points in a long video game. Die at hour 20 and you restart from the last save, not from the beginning. Each player profile (thread) has its own saves.</p>
  </div>
  <p>The code uses a one-node "bot" that reports which human messages it can see, then talks on two threads.</p>
  <div class="fx" data-lang="py">from langchain_core.messages import AIMessage
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.checkpoint.memory import InMemorySaver

def bot(state: MessagesState):                 # stands in for an LLM call
    said = [m.content for m in state["messages"] if m.type == "human"]
    return {"messages": [AIMessage(f"You have told me: {said}")]}

g = StateGraph(MessagesState)
g.add_node("bot", bot)
g.add_edge(START, "bot")
g.add_edge("bot", END)
app = g.compile(checkpointer=InMemorySaver())

aman = {"configurable": {"thread_id": "aman-1"}}
riya = {"configurable": {"thread_id": "riya-1"}}
app.invoke({"messages": [("user", "My name is Aman.")]}, aman)
out = app.invoke({"messages": [("user", "What is my name?")]}, aman)
print(out["messages"][-1].content)
out = app.invoke({"messages": [("user", "What is my name?")]}, riya)
print(out["messages"][-1].content)

print(len(app.get_state(aman).values["messages"]), "messages saved for aman-1")
print(len(list(app.get_state_history(aman))), "checkpoints for aman-1")
for s in app.get_state_history(aman):
    print(s.metadata["step"], s.metadata["source"], s.next, len(s.values.get("messages", [])))</div>
  <div class="fx" data-lang="text">You have told me: ['My name is Aman.', 'What is my name?']
You have told me: ['What is my name?']
4 messages saved for aman-1
6 checkpoints for aman-1
4 loop () 4
3 loop ('bot',) 3
2 input ('__start__',) 2
1 loop () 2
0 loop ('bot',) 1
-1 input ('__start__',) 0</div>
  <p>On thread <code>aman-1</code>, the second call saw both messages: the checkpointer loaded turn 1 and <code>add_messages</code> appended the new question. Thread <code>riya-1</code> started empty. <code>get_state</code> returns the latest checkpoint (4 messages: 2 human, 2 AI). <code>get_state_history</code> lists all 6, newest first: each <code>invoke</code> saved one when input arrived, one before <code>bot</code> ran (<code>next=('bot',)</code>), and one after it finished (<code>next=()</code>).</p>
  <p>What you get from those save points:</p>
  <ul>
    <li><strong>Multi-turn memory</strong>: same <code>thread_id</code> → previous state loaded. New thread → fresh start.</li>
    <li><strong>Crash recovery</strong>: rerun the thread and it continues from the last saved step.</li>
    <li><strong>Time travel</strong>: pick any checkpoint from <code>get_state_history</code>, edit it with <code>update_state</code>, and replay from there.</li>
    <li><strong>Interrupts</strong>: pausing is just "save and wait" (next section).</li>
  </ul>
<figure class="viz"><svg viewBox="0 0 600 164" width="600"><defs><marker id="lg-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><line x1="30" y1="60" x2="575" y2="60" stroke="currentColor" stroke-opacity=".5"/><path d="M50,30 V24 H215 V30" fill="none" stroke="currentColor" stroke-opacity=".4"/><text x="132" y="18" text-anchor="middle" font-size="10" class="tm">turn 1 · invoke</text><path d="M290,30 V24 H530 V30" fill="none" stroke="currentColor" stroke-opacity=".4"/><text x="410" y="18" text-anchor="middle" font-size="10" class="tm">turn 2 · invoke … resume</text><circle cx="50" cy="60" r="5" class="fb sb"/><text x="50" y="46" text-anchor="middle" font-size="10">in</text><circle cx="105" cy="60" r="5" class="fb sb"/><text x="105" y="46" text-anchor="middle" font-size="10">agent</text><circle cx="160" cy="60" r="5" class="fb sb"/><text x="160" y="46" text-anchor="middle" font-size="10">tools</text><circle cx="215" cy="60" r="5" class="fb sb"/><text x="215" y="46" text-anchor="middle" font-size="10">agent</text><circle cx="290" cy="60" r="5" class="fb sb"/><text x="290" y="46" text-anchor="middle" font-size="10">in</text><circle cx="345" cy="60" r="5" class="fb sb"/><text x="345" y="46" text-anchor="middle" font-size="10">agent</text><circle cx="400" cy="60" r="8" class="fr sr"/><text x="400" y="64" text-anchor="middle" font-size="9" class="tr">❚❚</text><text x="400" y="44" text-anchor="middle" font-size="10" class="tr">approval</text><circle cx="470" cy="60" r="5" class="fb sb"/><text x="470" y="46" text-anchor="middle" font-size="10">tools</text><circle cx="530" cy="60" r="5" class="fb sb"/><text x="530" y="46" text-anchor="middle" font-size="10">agent</text><text x="400" y="86" text-anchor="middle" font-size="10" class="tr">interrupt(): state saved, invoke returns</text><text x="470" y="102" text-anchor="middle" font-size="10" class="tg">Command(resume="approve")</text><path d="M160,66 Q170,128 230,128" fill="none" stroke="currentColor" marker-end="url(#lg-a3)" stroke-dasharray="4 3"/><circle cx="236" cy="128" r="5" fill="none" stroke="currentColor"/><text x="246" y="132" text-anchor="start" font-size="10">update_state → replay a fork (time travel)</text><text x="30" y="156" text-anchor="start" font-size="10" class="tm">thread_id = "user-42" · every dot = a checkpoint · crash? rerun the thread from the last dot</text></svg><figcaption>A thread is a chain of save points. Memory, crash recovery, time travel and interrupts all read from this chain.</figcaption></figure>
  <p><code>InMemorySaver</code> keeps checkpoints in RAM, so they vanish when Python exits; it is for development. Production uses a durable saver: <code>SqliteSaver</code> or <code>PostgresSaver</code> (packages <code>langgraph-checkpoint-sqlite</code> / <code>-postgres</code>). For facts shared <em>across</em> threads (a user's preferred language), use a <strong>store</strong>, passed as <code>compile(store=...)</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Checkpoint</strong>: a saved snapshot of the full graph state plus which node runs next. <strong>Thread</strong>: the sequence of checkpoints for one conversation, named by <code>thread_id</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting <code>thread_id</code> in the config with a checkpointer attached raises an error; reusing one id for different users leaks one user's history to another. Build the id from the user and session ids.</p>
  </div>

  <h2 id="lg-hitl"><span class="num">06</span>Human-in-the-Loop</h2>
  <p>Some actions must not run without a person's OK: refunds, emails to thousands of customers, deleting data. In the hand loop you'd need to stop the program, store everything, and somehow restart in the middle of the loop when the manager replies, maybe hours later. With a checkpointer, LangGraph can do this cleanly, because "stop here and continue later" is just "save state and return".</p>
  <p>Inside a node you call <strong><code>interrupt(payload)</code></strong>. The graph saves its state and <code>invoke</code> returns immediately with the payload under <code>"__interrupt__"</code>, which your UI shows to a human. When the human answers, you call <code>invoke(Command(resume=answer), cfg)</code> on the same thread. The node runs again, and this time <code>interrupt(...)</code> returns the answer instead of pausing.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank auto-approves small payments but needs a second signature for a large wire transfer. The clerk puts the form in a tray (saved state) and goes on with other work; when the manager signs, the form continues from where it stopped. Gate only the irreversible, high-stakes actions, not every step.</p>
  </div>
  <div class="fx" data-lang="py">from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command

class State(TypedDict):
    amount: int
    status: str

def approval(state: State):
    print("approval node starts")
    decision = interrupt({"question": f"Refund {state['amount']}?"})   # pauses here
    print("human said:", decision)
    return {"status": "approved" if decision == "yes" else "rejected"}

g = StateGraph(State)
g.add_node("approval", approval)
g.add_edge(START, "approval")
g.add_edge("approval", END)
app = g.compile(checkpointer=InMemorySaver())
cfg = {"configurable": {"thread_id": "t1"}}

out = app.invoke({"amount": 4000, "status": "new"}, cfg)
print("paused with:", out["__interrupt__"][0].value)
print("next:", app.get_state(cfg).next)
out = app.invoke(Command(resume="yes"), cfg)
print("final:", out)</div>
  <div class="fx" data-lang="text">approval node starts
paused with: {'question': 'Refund 4000?'}
next: ('approval',)
approval node starts
human said: yes
final: {'amount': 4000, 'status': 'approved'}</div>
  <p>Step by step: the first <code>invoke</code> entered <code>approval</code>, printed its first line, and stopped at <code>interrupt</code>; "human said" was never printed. <code>get_state(cfg).next</code> confirms the thread is parked at <code>approval</code>. The resume call ran the node <strong>again from its first line</strong> (look: "approval node starts" printed twice), and this time <code>interrupt</code> returned <code>"yes"</code>, so the node finished and set <code>status="approved"</code>.</p>
  <ul>
    <li><strong><code>interrupt(value)</code></strong> (dynamic, preferred): called inside a node, only when your logic decides (e.g. amount &gt; limit); carries a payload and receives a resume value.</li>
    <li><strong><code>compile(interrupt_before=["tools"])</code></strong> (static breakpoint): pause before a node every time; resume with <code>app.invoke(None, cfg)</code>. Good for debugging.</li>
    <li><strong>Edit before resuming</strong>: <code>app.update_state(cfg, {...})</code> changes the saved state, e.g. a corrected refund amount.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>On resume, the interrupted node <strong>restarts from its first line</strong>. Code before <code>interrupt()</code> runs twice, so keep side effects (API calls, emails, Slack pings) after it or in a separate node, or make them idempotent (safe to repeat).</p>
  </div>

  <h2 id="lg-stream"><span class="num">07</span>Streaming &amp; Subgraphs</h2>
  <p>An agent run can take 30 seconds and ten steps. If the UI shows a spinner until the very end, users assume it's broken. And when something goes wrong, you want to see which node produced what. <code>app.stream(inputs, stream_mode=...)</code> yields events while the graph runs instead of one result at the end.</p>
  <table class="tbl">
    <tr><th>Mode</th><th>Yields</th><th>Use for</th></tr>
    <tr><td><code>"values"</code></td><td>Full state after each step</td><td>Debugging, simple UIs</td></tr>
    <tr><td><code>"updates"</code></td><td>Only what each node returned</td><td>Progress ("searching… drafting…")</td></tr>
    <tr><td><code>"messages"</code></td><td>LLM tokens as they're generated</td><td>Typing effect in chat</td></tr>
    <tr><td><code>"custom"</code></td><td>Your own progress events from inside nodes</td><td>"Processed 40 of 100 files"</td></tr>
  </table>
  <p>Streaming the draft/check graph from section 03 with <code>"updates"</code>:</p>
  <div class="fx" data-lang="py">for update in app.stream({"question": "q", "steps": [], "attempts": 0}, stream_mode="updates"):
    print(update)</div>
  <div class="fx" data-lang="text">{'draft': {'steps': ['draft'], 'attempts': 1}}
{'check': {'steps': ['check#1']}}
{'draft': {'steps': ['draft'], 'attempts': 2}}
{'check': {'steps': ['check#2']}}</div>
  <p>Each event is <code>{node_name: what_it_returned}</code>, in the order nodes ran. Compare with the trace table in section 03: same four steps, now visible live.</p>
  <h3>Subgraphs</h3>
  <p>As apps grow, you want reusable pieces: a "researcher" graph used by several products, or one graph per agent in a team (12). A <strong>subgraph</strong> is a compiled graph used as a node: <code>parent.add_node("writer", writer_app)</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A company department. Head office sends the accounts department a file; how accounts works inside is its own business; the file comes back updated.</p>
  </div>
  <p>There is a catch when parent and subgraph share a key with a reducer. The code shows it, then the fix.</p>
  <div class="fx" data-lang="py">import operator
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END

class S(TypedDict):
    steps: Annotated[list[str], operator.add]

def write(state: S):
    return {"steps": ["write"]}

sub = StateGraph(S)                     # a small "writer" graph
sub.add_node("write", write)
sub.add_edge(START, "write")
sub.add_edge("write", END)
writer = sub.compile()

parent = StateGraph(S)
parent.add_node("writer", writer)       # a compiled graph used as a node
parent.add_edge(START, "writer")
parent.add_edge("writer", END)
print(parent.compile().invoke({"steps": ["start"]}))

def call_writer(state: S):              # fix: map state in and out explicitly
    out = writer.invoke({"steps": []})  # the subgraph starts with a clean list
    return {"steps": out["steps"]}      # only its new entries go back

fixed = StateGraph(S)
fixed.add_node("writer", call_writer)
fixed.add_edge(START, "writer")
fixed.add_edge("writer", END)
print(fixed.compile().invoke({"steps": ["start"]}))</div>
  <div class="fx" data-lang="text">{'steps': ['start', 'start', 'write']}
{'steps': ['start', 'write']}</div>
  <p>Why "start" appeared twice: the subgraph received <code>['start']</code>, appended "write", and returned its <em>whole</em> list <code>['start', 'write']</code>. The parent's <code>operator.add</code> then appended that to its own <code>['start']</code>. The fix wraps the subgraph in a normal function node that decides exactly what goes in and what comes back.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shared keys with reducers double up when a subgraph is added directly as a node. Map state explicitly (as in <code>call_writer</code>) or give the subgraph its own keys.</p>
  </div>

  <h2 id="lg-build"><span class="num">08</span>Build It: Agent with Approval</h2>
  <p>Put everything together: a shop agent with a safe tool and a risky one, memory across turns via a checkpointer, and an approval node that interrupts before any refund. A scripted fake chat model stands in for Claude, so the control flow actually runs here.</p>
  <p>Compared with section 04, one thing is new: our own router <code>route</code> replaces <code>tools_condition</code>. It looks at the requested tool names: no calls → END, any risky tool → "approval", otherwise → "tools". The approval node returns a <code>Command</code>, which both updates state and says where to go next (<code>goto</code>), so it can send approved calls to tools and rejected ones back to the agent.</p>
<figure class="viz"><svg viewBox="0 0 600 222" width="600"><defs><marker id="lg-a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="10" y="86" width="60" height="28" rx="14" class="fs"/><text x="40" y="104" text-anchor="middle" font-size="11">START</text><line x1="70" y1="100" x2="98" y2="100" stroke="currentColor" marker-end="url(#lg-a4)"/><rect x="100" y="80" width="100" height="40" rx="6" class="fb sb"/><text x="150" y="98" text-anchor="middle" font-weight="bold">agent</text><text x="150" y="112" text-anchor="middle" font-size="10" class="tm">LLM</text><rect x="440" y="16" width="130" height="40" rx="6" class="ft st"/><text x="505" y="34" text-anchor="middle" font-weight="bold">tools</text><text x="505" y="48" text-anchor="middle" font-size="10" class="tm">ToolNode</text><path d="M140,80 V30 H438" fill="none" stroke="currentColor" marker-end="url(#lg-a4)"/><text x="290" y="24" text-anchor="middle" font-size="10" class="tb">safe call (order_status)</text><path d="M438,46 H170 V78" fill="none" stroke="currentColor" marker-end="url(#lg-a4)"/><text x="300" y="64" text-anchor="middle" font-size="10" class="tm">results</text><rect x="260" y="86" width="60" height="28" rx="14" class="fs"/><text x="290" y="104" text-anchor="middle" font-size="11">END</text><line x1="200" y1="100" x2="258" y2="100" stroke="currentColor" marker-end="url(#lg-a4)"/><text x="229" y="94" text-anchor="middle" font-size="10" class="tg">no calls</text><rect x="260" y="140" width="150" height="44" rx="6" class="fr sr"/><text x="335" y="160" text-anchor="middle" font-weight="bold">approval</text><text x="335" y="174" text-anchor="middle" font-size="10" class="tm">interrupt() ❚❚</text><path d="M150,120 V162 H258" fill="none" stroke="currentColor" marker-end="url(#lg-a4)"/><text x="204" y="178" text-anchor="middle" font-size="10" class="tr">risky (refund)</text><path d="M410,152 H505 V58" fill="none" stroke="currentColor" marker-end="url(#lg-a4)" class="sg"/><text x="512" y="110" text-anchor="start" font-size="10" class="tg">approve</text><path d="M335,184 V200 H120 V122" fill="none" stroke="currentColor" marker-end="url(#lg-a4)" class="sr"/><text x="228" y="214" text-anchor="middle" font-size="10" class="tr">reject → ToolMessage</text></svg><figcaption>route() sends safe calls straight to tools, risky ones through the approval node, which pauses until a human resumes it.</figcaption></figure>
  <div class="fx" data-lang="py"># pip install langgraph langchain-core
from typing import Literal
from langchain_core.tools import tool
from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command

# 1. Tools: one safe, one risky
@tool
def order_status(order_id: str) -&gt; str:
    """Look up the status of an order. Use when the user asks where an order is."""
    return {"A1": "delivered", "B2": "in transit"}.get(order_id, "not found")

@tool
def issue_refund(order_id: str, amount: float) -&gt; str:
    """Refund an order. Irreversible; needs human approval."""
    return f"refunded {amount} for {order_id}"

tools = [order_status, issue_refund]
RISKY = {"issue_refund"}

# 2. Model. Real: llm = ChatAnthropic(model="claude-opus-5-5").bind_tools(tools)
script = iter([
    AIMessage("", tool_calls=[{"name": "order_status", "args": {"order_id": "A1"}, "id": "c1"}]),
    AIMessage("Order A1 was delivered."),
    AIMessage("", tool_calls=[{"name": "issue_refund", "args": {"order_id": "A1", "amount": 40.0}, "id": "c2"}]),
    AIMessage("Done: A1 refunded 40."),
])
llm = GenericFakeChatModel(messages=script)   # replays these replies in order

# 3. Nodes
def agent(state: MessagesState):
    return {"messages": [llm.invoke(state["messages"])]}

def approval(state: MessagesState) -&gt; Command[Literal["tools", "agent"]]:
    call = state["messages"][-1].tool_calls[0]
    decision = interrupt({"tool": call["name"], "args": call["args"]})   # pause
    if decision == "approve":
        return Command(goto="tools")
    reject = ToolMessage("Human rejected this action.", tool_call_id=call["id"])
    return Command(goto="agent", update={"messages": [reject]})

def route(state: MessagesState):
    if tools_condition(state) == END:
        return END
    names = {c["name"] for c in state["messages"][-1].tool_calls}
    return "approval" if names &amp; RISKY else "tools"

# 4. Graph
g = StateGraph(MessagesState)
g.add_node("agent", agent)
g.add_node("tools", ToolNode(tools))
g.add_node("approval", approval)
g.add_edge(START, "agent")
g.add_conditional_edges("agent", route, ["tools", "approval", END])
g.add_edge("tools", "agent")
app = g.compile(checkpointer=InMemorySaver())

# 5. Run: two turns on one thread, with an approval pause
cfg = {"configurable": {"thread_id": "user-42"}}
out = app.invoke({"messages": [("user", "Where is order A1?")]}, cfg)
print("turn 1:", out["messages"][-1].content)

out = app.invoke({"messages": [("user", "Refund it, 40.")]}, cfg)
print("paused:", out["__interrupt__"][0].value)
print("next node:", app.get_state(cfg).next)

out = app.invoke(Command(resume="approve"), cfg)
print("turn 2:", out["messages"][-1].content)
print("messages in thread:", len(out["messages"]))</div>
  <table class="tbl out"><caption>Result (real run, langgraph 1.2; model replies are scripted)</caption>
    <tr><th>output</th></tr>
    <tr><td>turn 1: Order A1 was delivered.</td></tr>
    <tr><td>paused: {'tool': 'issue_refund', 'args': {'order_id': 'A1', 'amount': 40.0}}</td></tr>
    <tr><td>next node: ('approval',)</td></tr>
    <tr><td>turn 2: Done: A1 refunded 40.</td></tr>
    <tr><td>messages in thread: 8</td></tr>
  </table>
  <p>Walk through it. Turn 1: the agent asked for <code>order_status</code>; <code>route</code> saw a safe tool and went straight to <code>tools</code>, then back to the agent, which answered. Turn 2 on the same thread: the agent asked for <code>issue_refund</code>; <code>route</code> found it in <code>RISKY</code> (<code>names &amp; RISKY</code> is a set intersection) and sent it to <code>approval</code>, which paused. After <code>Command(resume="approve")</code>, the node returned <code>Command(goto="tools")</code>, the refund ran, and the agent answered.</p>
  <p>The 8 messages: Human, AI (tool call), Tool "delivered", AI answer, Human, AI (refund call), Tool "refunded 40.0 for A1", AI answer. Turn 2 saw turn 1 because both used thread <code>user-42</code>. Resuming with <code>"reject"</code> instead (also run) adds a <code>ToolMessage("Human rejected this action.")</code> and the refund tool never runs.</p>
  <div class="callout pred"><span class="label">Extend it</span>
    <p>Only gate refunds above 1,000 (read <code>args["amount"]</code> in <code>route</code>); let the reviewer send an edited amount via <code>Command(resume={"amount": 20})</code>; swap <code>InMemorySaver</code> for <code>SqliteSaver</code> and restart Python mid-approval.</p>
  </div>

  <h2 id="lg-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: chat history without a reducer</span>
    <p>Declare <code>messages: list</code> without <code>add_messages</code> and each node's write replaces the history. Real run: input <code>[HumanMessage("Hi, I am Aman")]</code>, node returns <code>[AIMessage("Hello!")]</code>, final state <code>['Hello!']</code>; the user's message is gone. Use <code>MessagesState</code> or <code>Annotated[list, add_messages]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: side effects before interrupt()</span>
    <p>The node reruns from the top on resume, so anything before <code>interrupt()</code> happens twice. Put emails and API calls after it or in their own node.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: thread_id mistakes</span>
    <p>Missing <code>thread_id</code> with a checkpointer raises an error. The same id for two users mixes their conversations. A new id per request means no memory.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: InMemorySaver in production</span>
    <p>It lives in RAM: a restart or a second server process loses every paused approval. Use <code>SqliteSaver</code> or <code>PostgresSaver</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: cycles with no exit</span>
    <p>A retry loop that depends only on the LLM saying "good enough" may never stop. Count attempts in state and set <code>{"recursion_limit": 25}</code> in the config; the limit is a last resort, not a design.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: returning the full state from a node</span>
    <p>Return only changed keys. Returning the whole list on a key with <code>operator.add</code> appends it again, duplicating entries (the same bug as the subgraph doubling).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: tool results as AIMessage</span>
    <p>Tool output must be a <code>ToolMessage</code> with the matching <code>tool_call_id</code>; <code>ToolNode</code> does this for you.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: LangGraph for a straight line</span>
    <p>Retrieve → prompt → answer with no loops, branches or pauses is an LCEL chain, not a graph.</p>
  </div>

  <h2 id="lg-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does LangGraph solve that AgentExecutor (or a hand-written while loop) didn't?</summary><div class="qa-body">The loop was hidden or hand-coded: no pausing before a dangerous action, no resume after a crash, no inspectable state, no built-in memory. LangGraph makes every step a node and every transition an edge you control, and checkpoints state, so you get approval, recovery, branching, loops and memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define state, node and edge.</summary><div class="qa-body">State: a typed dict shared by all nodes. Node: a function that takes the state and returns only the keys it changed. Edge: what runs next, either fixed (<code>add_edge</code>) or decided by a routing function (<code>add_conditional_edges</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a reducer and why does <code>add_messages</code> exist?</summary><div class="qa-body">A rule for merging a node's write into a key. Default is overwrite, so each node writing <code>messages</code> would erase history. <code>add_messages</code> appends (and replaces a message with the same id), declared as <code>Annotated[list, add_messages]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the draft/check graph, a state has <code>steps: Annotated[list, operator.add]</code> and <code>attempts: int</code>. After two loops, what are they?</summary><div class="qa-body"><code>steps = ['draft', 'check#1', 'draft', 'check#2']</code> (appended) and <code>attempts = 2</code> (overwritten each time).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the ReAct cycle look as a graph?</summary><div class="qa-body">START → agent. Conditional edge from agent: tool calls → tools, else END (<code>tools_condition</code>). Fixed edge tools → agent. The agent sees the <code>ToolMessage</code>s in state and decides again until it answers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a checkpointer give you beyond crash recovery?</summary><div class="qa-body">Multi-turn memory per <code>thread_id</code>; time travel (list checkpoints with <code>get_state_history</code>, edit with <code>update_state</code>, replay); and the foundation for interrupts, since pausing is just saving state and waiting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two invokes on one thread of a one-node graph. How many checkpoints, and why?</summary><div class="qa-body">Six: for each invoke, one when the input arrives, one before the node runs, one after it finishes. <code>get_state_history</code> lists them newest first with <code>next</code> showing what would run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through human approval with <code>interrupt</code>.</summary><div class="qa-body">A node calls <code>interrupt(payload)</code>; the graph saves state and <code>invoke</code> returns with <code>__interrupt__</code>. The UI shows the payload. The human's answer is sent with <code>app.invoke(Command(resume=answer), cfg)</code>; the node reruns from the top and <code>interrupt</code> now returns the answer. Requires a checkpointer and the same <code>thread_id</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your approval node sends a Slack message, then calls <code>interrupt</code>. Reviewers get two messages. Why?</summary><div class="qa-body">On resume the node restarts from its first line, so the Slack call runs again. Move side effects after <code>interrupt()</code>, into a separate node, or make them idempotent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>interrupt()</code> vs <code>interrupt_before</code>?</summary><div class="qa-body"><code>interrupt_before=["node"]</code> is a static breakpoint set at compile time: always pause before that node; resume with <code>invoke(None, cfg)</code>. <code>interrupt()</code> is dynamic: called inside a node, only when your logic decides (e.g. amount &gt; limit), and it carries a payload and receives a resume value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A subgraph added as a node returns <code>['start', 'start', 'write']</code>. Why?</summary><div class="qa-body">Parent and subgraph share a key with an append reducer. The subgraph returns its whole list (including the 'start' it received), and the parent appends it to its own copy. Wrap the subgraph in a function node that passes in only what it needs and returns only new entries.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you <em>not</em> use LangGraph?</summary><div class="qa-body">For a linear pipeline (retrieve → prompt → answer) with no loops, branches, approval or persistence: an LCEL chain or plain code is simpler and faster to debug.</div></details>
</main>`
});
