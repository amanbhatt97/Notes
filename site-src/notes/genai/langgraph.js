// notes/genai/langgraph.js — LangGraph
Object.assign(TOPIC_CONTENT, {
  "langgraph": `<main>
  <h1>LangGraph</h1>
  <p class="lead">LangGraph turns the agent loop from 08–09 into an explicit graph: shared state, nodes that update it, and edges (including loops) that you control. That gives you memory across turns, crash recovery and human approval for free. You need 08 Agent Fundamentals and 10 LangChain; 12 Multi-Agent Systems builds on this.</p>

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
      <div class="rm-item rm-done" data-target="lg-rev"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 9 lines</span></div></div>
      <div class="rm-item rm-done" data-target="lg-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="lg-why"><span class="num">01</span>Why LangGraph</h2>
  <p>The old <code>AgentExecutor</code> ran the agent loop inside a black box. Real requirements it couldn't meet:</p>
  <ul>
    <li>Pause before the agent sends 1,000 refund emails, and let a human approve.</li>
    <li>Crash at step 8 of 10, then resume from step 8, not step 1.</li>
    <li>Remember the user's earlier messages without hand-built plumbing.</li>
    <li>Branch, loop back, or run steps in parallel on <em>your</em> rules.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A surgical robot with no pause button vs one with a pause button, a live feed of every step, and the ability to rewind to any earlier moment. LangGraph is the second one.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LangGraph</strong> models an LLM app as a <strong>state machine</strong>: a typed <em>state</em>, <em>nodes</em> (functions that update it) and <em>edges</em> (what runs next). It saves state after every step.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>LangChain (LCEL)</th><th>LangGraph</th></tr>
    <tr><td>Builds</td><td>The logic inside one step</td><td>The flow between steps</td></tr>
    <tr><td>Analogy</td><td>Writing one recipe</td><td>Running the whole kitchen</td></tr>
    <tr><td>Loops / branches</td><td>Linear pipelines</td><td>Cycles and conditional edges</td></tr>
    <tr><td>Memory, pause, resume</td><td>You build it</td><td>Checkpointer + <code>interrupt</code></td></tr>
  </table>
  <p>They combine: an LCEL chain often runs <em>inside</em> a LangGraph node.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using LangGraph for a straight pipeline (retrieve → generate). With no branches, loops or persistence, an LCEL chain or plain code is simpler.</p>
  </div>

  <h2 id="lg-state"><span class="num">02</span>State &amp; Reducers</h2>
  <p><strong>State</strong> is one dict shared by every node, declared as a <code>TypedDict</code>. A node reads the state and returns <strong>only the keys it changed</strong>; LangGraph merges them in.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Relay runners sharing one notebook. Each reads everything so far and adds a line. Nobody passes notes directly to the next runner.</p>
  </div>
  <p>By default a new value <strong>overwrites</strong> the old one. A <strong>reducer</strong> is a merge rule attached to a key, e.g. "append instead of replace". You attach it with <code>Annotated[type, reducer]</code>.</p>
  <div class="fx" data-lang="py">import operator
from typing import TypedDict, Annotated

class State(TypedDict):
    question: str
    steps: Annotated[list[str], operator.add]   # reducer: append
    attempts: int                               # no reducer: overwrite</div>
  <p>For chat, use <code>add_messages</code>: it appends new messages and replaces one with the same id. <code>MessagesState</code> is a ready-made state with just <code>messages: Annotated[list[AnyMessage], add_messages]</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A <code>messages: list</code> key without a reducer: the tools node's write replaces the agent's, and the conversation is wiped each step. Two parallel nodes writing a no-reducer key raise <code>InvalidUpdateError</code>.</p>
  </div>

  <h2 id="lg-nodes"><span class="num">03</span>Nodes, Edges, Cycles</h2>
  <ul>
    <li><strong>Node</strong>: a plain Python function, <code>state → partial update</code>. One job, like a station on an assembly line.</li>
    <li><strong>Edge</strong>: <code>add_edge("a", "b")</code>, always go a → b. <code>START</code> and <code>END</code> are the entry and exit.</li>
    <li><strong>Conditional edge</strong>: <code>add_conditional_edges("a", router, mapping)</code>. Your <code>router(state)</code> returns the next node's name: a traffic controller at a junction.</li>
    <li><strong>Cycle</strong>: an edge back to an earlier node. Like a chef who tastes, adjusts, tastes again, until it's right.</li>
  </ul>
  <div class="fx" data-lang="py">from langgraph.graph import StateGraph, START, END

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
  <table class="tbl out"><caption>Result</caption><tr><th>output</th></tr><tr><td>{'question': 'q', 'steps': ['draft', 'check#1', 'draft', 'check#2'], 'attempts': 2}</td></tr></table>
  <div class="callout pred"><span class="label">Predict</span>
    <p>Why does <code>steps</code> have four entries but <code>attempts</code> is just 2? (<code>steps</code> has an append reducer; <code>attempts</code> is overwritten each time.)</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The LLM's output can <em>influence</em> routing, but the routing function is your code. That's what makes the flow debuggable and safe.</p>
  </div>

  <h2 id="lg-react"><span class="num">04</span>A ReAct Agent as a Graph</h2>
  <p>The ReAct loop from 08 is two nodes and a cycle:</p>
  <div class="flow"><span>START</span><span>agent (LLM)</span><span>tool calls? → tools</span><span>tools → back to agent</span><span>no calls → END</span></div>
  <div class="fx" data-lang="py">from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, MessagesState, START
from langgraph.prebuilt import ToolNode, tools_condition

llm = ChatAnthropic(model="claude-opus-5-5").bind_tools(tools)

def agent(state: MessagesState):
    return {"messages": [llm.invoke(state["messages"])]}

g = StateGraph(MessagesState)
g.add_node("agent", agent)
g.add_node("tools", ToolNode(tools))          # runs every tool call, returns ToolMessages
g.add_edge(START, "agent")
g.add_conditional_edges("agent", tools_condition)   # "tools" if tool_calls else END
g.add_edge("tools", "agent")                  # the cycle
app = g.compile()</div>
  <ul>
    <li><strong><code>ToolNode</code></strong>: executes all tool calls in the last <code>AIMessage</code> and returns <code>ToolMessage</code>s with matching ids; tool errors come back as messages, not crashes.</li>
    <li><strong><code>tools_condition</code></strong>: the standard router, "tools" if the last message has tool calls, else <code>END</code>.</li>
    <li>The one-liner version is <code>langchain.agents.create_agent</code> (10). <code>langgraph.prebuilt.create_react_agent</code> is deprecated in its favour.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing tool results as <code>AIMessage</code>s (as some old tutorials did). The model expects a <code>ToolMessage</code> with the right <code>tool_call_id</code>; otherwise the provider rejects the history or the model loses track.</p>
  </div>

  <h2 id="lg-ckpt"><span class="num">05</span>Checkpointing &amp; Memory</h2>
  <p>A <strong>checkpointer</strong> saves the full state after every step, under a <code>thread_id</code> (one conversation).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Save points in a long video game. Die at hour 20 and you restart from the last save, not from the beginning.</p>
  </div>
  <div class="fx" data-lang="py">from langgraph.checkpoint.memory import InMemorySaver   # dev; MemorySaver is the same class

app = g.compile(checkpointer=InMemorySaver())
cfg = {"configurable": {"thread_id": "aman-1"}}

app.invoke({"messages": [("user", "My name is Aman.")]}, cfg)
app.invoke({"messages": [("user", "What is my name?")]}, cfg)   # sees turn 1 automatically</div>
  <p>What you get:</p>
  <ul>
    <li><strong>Multi-turn memory</strong>: same <code>thread_id</code> → previous state loaded. New thread → fresh start.</li>
    <li><strong>Crash recovery</strong>: rerun the thread and it continues from the last saved step.</li>
    <li><strong>Time travel</strong>: <code>app.get_state_history(cfg)</code> lists every checkpoint; <code>update_state</code> edits one, and you replay from there.</li>
    <li><strong>Interrupts</strong>: pausing is just "save and wait" (next section).</li>
  </ul>
  <p>Production uses a durable saver: <code>SqliteSaver</code> or <code>PostgresSaver</code> (packages <code>langgraph-checkpoint-sqlite</code> / <code>-postgres</code>). For facts shared <em>across</em> threads (user preferences), use a <strong>store</strong>, passed as <code>compile(store=...)</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting <code>thread_id</code> in the config with a checkpointer attached raises an error; reusing one id for different users leaks one user's history to another.</p>
  </div>

  <h2 id="lg-hitl"><span class="num">06</span>Human-in-the-Loop</h2>
  <p>Pause the graph before a risky action, let a person approve, edit or reject, then resume exactly where it stopped. It works because the paused state sits in the checkpointer.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank auto-approves small payments but needs a second person for a large wire transfer. Gate only the irreversible, high-stakes actions, not every step.</p>
  </div>
  <div class="fx" data-lang="py">from langgraph.types import interrupt, Command

def approval(state):
    call = state["messages"][-1].tool_calls[0]
    decision = interrupt({"tool": call["name"], "args": call["args"]})   # pauses here
    ...   # runs only after resume; decision = whatever the human sent

out = app.invoke(inputs, cfg)       # stops; out["__interrupt__"] holds the payload
app.invoke(Command(resume="approve"), cfg)   # continue with the human's answer</div>
  <ul>
    <li><strong><code>interrupt(value)</code></strong> (dynamic, preferred): call it inside a node; the payload goes to your UI; <code>Command(resume=...)</code> becomes its return value.</li>
    <li><strong><code>compile(interrupt_before=["tools"])</code></strong> (static breakpoint): pause before a node every time; resume with <code>app.invoke(None, cfg)</code>. Good for debugging.</li>
    <li><strong>Edit before resuming</strong>: <code>app.update_state(cfg, {...})</code> changes the state, e.g. a corrected argument.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>On resume, the interrupted node <strong>restarts from its first line</strong>. Code before <code>interrupt()</code> runs twice, so keep side effects (API calls, emails) after it or in a separate node.</p>
  </div>

  <h2 id="lg-stream"><span class="num">07</span>Streaming &amp; Subgraphs</h2>
  <p><code>app.stream(inputs, stream_mode=...)</code> lets a UI show progress:</p>
  <table class="tbl">
    <tr><th>Mode</th><th>Yields</th></tr>
    <tr><td><code>"values"</code></td><td>Full state after each step</td></tr>
    <tr><td><code>"updates"</code></td><td>Only what each node returned</td></tr>
    <tr><td><code>"messages"</code></td><td>LLM tokens as they're generated</td></tr>
    <tr><td><code>"custom"</code></td><td>Your own progress events from inside nodes</td></tr>
  </table>
  <div class="fx" data-lang="py">for update in app.stream({"question": "q", "steps": [], "attempts": 0}, stream_mode="updates"):
    print(update)</div>
  <table class="tbl out"><caption>Result (the draft/check graph from 03)</caption>
    <tr><th>update</th></tr>
    <tr><td>{'draft': {'steps': ['draft'], 'attempts': 1}}</td></tr>
    <tr><td>{'check': {'steps': ['check#1']}}</td></tr>
    <tr><td>{'draft': {'steps': ['draft'], 'attempts': 2}}</td></tr>
    <tr><td>{'check': {'steps': ['check#2']}}</td></tr>
  </table>
  <p>A <strong>subgraph</strong> is a compiled graph used as a node: <code>parent.add_node("writer", app)</code>. Use it to package a reusable agent, or give each agent its own state in multi-agent systems (12).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shared keys with reducers double up. Parent input <code>steps=["start"]</code> into the subgraph above gave <code>['start', 'start', 'draft', …]</code>: the subgraph returns its whole list, and the parent's <code>operator.add</code> appends it again. Map state explicitly or use separate keys.</p>
  </div>

  <h2 id="lg-build"><span class="num">08</span>Build It: Agent with Approval</h2>
  <p>A shop agent with a safe tool and a risky one. Memory across turns via a checkpointer; an approval node interrupts before any refund. A scripted fake chat model stands in for Claude, so the control flow actually runs here.</p>
  <div class="flow"><span>START</span><span>agent</span><span>risky call? → approval (interrupt)</span><span>tools</span><span>agent</span><span>END</span></div>
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
  <p>The 8 messages: Human, AI (tool call), Tool "delivered", AI answer, Human, AI (refund call), Tool "refunded 40.0 for A1", AI answer. Turn 2 saw turn 1 because both used thread <code>user-42</code>. Resuming with <code>"reject"</code> instead adds a <code>ToolMessage("Human rejected this action.")</code> and the refund tool never runs.</p>
  <div class="callout pred"><span class="label">Extend it</span>
    <p>Only gate refunds above 1,000 (read <code>args["amount"]</code> in <code>route</code>); let the reviewer send an edited amount via <code>Command(resume={"amount": 20})</code>; swap <code>InMemorySaver</code> for <code>SqliteSaver</code> and restart Python mid-approval.</p>
  </div>

  <h2 id="lg-rev"><span class="num">09</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>LangGraph</strong> = state machine for LLM apps: state + nodes + edges, saved after each step.</li>
    <li><strong>Node</strong>: function, state in, partial update out.</li>
    <li><strong>Reducer</strong>: merge rule per key; <code>add_messages</code> appends chat history. No reducer = overwrite.</li>
    <li><strong>Conditional edge</strong>: your router reads state and names the next node; a back-edge makes a cycle.</li>
    <li><strong>ReAct graph</strong>: agent ⇄ <code>ToolNode</code>, routed by <code>tools_condition</code>; or <code>create_agent</code>.</li>
    <li><strong>Checkpointer + thread_id</strong>: multi-turn memory, crash recovery, time travel.</li>
    <li><strong><code>interrupt()</code> + <code>Command(resume=...)</code></strong>: human approval; the node reruns from the top on resume.</li>
    <li><strong>Stream modes</strong>: values, updates, messages (tokens), custom.</li>
    <li><strong>Skip it</strong> for straight pipelines; use it for loops, branches, approval, persistence.</li>
  </ol></div>

  <h2 id="lg-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does LangGraph solve that AgentExecutor didn't?</summary><div class="qa-body">AgentExecutor hid the loop: no pausing before a dangerous action, no resume after a crash, no inspectable state, no built-in memory. LangGraph makes every step a node and every transition an edge you control, and checkpoints state, so you get approval, recovery, branching, loops and memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define state, node and edge.</summary><div class="qa-body">State: a typed dict shared by all nodes. Node: a function that takes the state and returns only the keys it changed. Edge: what runs next, either fixed (<code>add_edge</code>) or decided by a routing function (<code>add_conditional_edges</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a reducer and why does <code>add_messages</code> exist?</summary><div class="qa-body">A rule for merging a node's write into a key. Default is overwrite, so each node writing <code>messages</code> would erase history. <code>add_messages</code> appends (and replaces by id), declared as <code>Annotated[list, add_messages]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the draft/check graph, a state has <code>steps: Annotated[list, operator.add]</code> and <code>attempts: int</code>. After two loops, what are they?</summary><div class="qa-body"><code>steps = ['draft', 'check#1', 'draft', 'check#2']</code> (appended) and <code>attempts = 2</code> (overwritten each time).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the ReAct cycle look as a graph?</summary><div class="qa-body">START → agent. Conditional edge from agent: tool calls → tools, else END (<code>tools_condition</code>). Fixed edge tools → agent. The agent sees the <code>ToolMessage</code>s in state and decides again until it answers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a checkpointer give you beyond crash recovery?</summary><div class="qa-body">Multi-turn memory per <code>thread_id</code>; time travel (list checkpoints with <code>get_state_history</code>, edit with <code>update_state</code>, replay); and the foundation for interrupts, since pausing is just saving state and waiting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through human approval with <code>interrupt</code>.</summary><div class="qa-body">A node calls <code>interrupt(payload)</code>; the graph saves state and <code>invoke</code> returns with <code>__interrupt__</code>. The UI shows the payload. The human's answer is sent with <code>app.invoke(Command(resume=answer), cfg)</code>; the node reruns from the top and <code>interrupt</code> now returns the answer. Requires a checkpointer and the same <code>thread_id</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your approval node sends a Slack message, then calls <code>interrupt</code>. Reviewers get two messages. Why?</summary><div class="qa-body">On resume the node restarts from its first line, so the Slack call runs again. Move side effects after <code>interrupt()</code>, into a separate node, or make them idempotent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>interrupt()</code> vs <code>interrupt_before</code>?</summary><div class="qa-body"><code>interrupt_before=["node"]</code> is a static breakpoint set at compile time: always pause before that node; resume with <code>invoke(None, cfg)</code>. <code>interrupt()</code> is dynamic: called inside a node, only when your logic decides (e.g. amount &gt; limit), and it carries a payload and receives a resume value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you <em>not</em> use LangGraph?</summary><div class="qa-body">For a linear pipeline (retrieve → prompt → answer) with no loops, branches, approval or persistence: an LCEL chain or plain code is simpler and faster to debug.</div></details>
</main>`
});
