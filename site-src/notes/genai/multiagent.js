// notes/genai/multiagent.js — Multi-Agent Systems & MCP
Object.assign(TOPIC_CONTENT, {
  "multiagent": `<main>
  <h1>Multi-Agent Systems &amp; MCP</h1>
  <p class="lead">You can build one agent (<a class="xref" data-note="agent_build">Build an Agent from Scratch</a>) and wire it as a graph (<a class="xref" data-note="langgraph">LangGraph</a>). This note covers splitting work across several agents (orchestrator-workers, supervisor, handoffs, critics) and MCP, the standard plug that connects any agent to any tool. Every pattern runs here against a scripted fake client, so you can trace exactly which agent saw what. Next: proving it works (<a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>) and shipping it safely (14).</p>

  <h2 id="mm-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Multi-Agent Systems &amp; MCP</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">When multi-agent helps</div>
        <ul>
          <li><b>Multi-agent</b> — several LLM agents, each with own prompt, tools, context</li>
          <li><b>Default = one agent</b> — or a fixed workflow</li>
          <li><b>Cost</b> — chat 1× · one agent ≈4× · multi-agent ≈15× tokens</li>
          <li><b>Split only for</b> breadth · separation (permissions) · ownership (teams)</li>
          <li><b>Real benefit: context isolation</b> — lead context 45,000 → 450 words</li>
          <li>💡 Manager reads three memos, not 300 pages</li>
          <li>⚠ Org-chart agents (planner/coder/tester) add hops, not IQ</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Orchestrator-workers</div>
        <ul>
          <li><b>Sub-agent = a tool</b> — <code>delegate(task)</code>; lead doesn't know it's an agent</li>
          <li><b>Parallel</b> — several <code>tool_use</code> in one turn → thread pool; results in ONE user msg</li>
          <li><b>Cheaper workers</b> — <code>claude-sonnet-5-5</code> workers, <code>claude-opus-5-5</code> lead</li>
          <li><b>Task brief</b> = worker's whole world: goal, scope, output format</li>
          <li>⚠ Vague delegation → duplicate/missed work</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Supervisor (LangGraph)</div>
        <ul>
          <li><b>Supervisor node</b> picks next worker; worker returns to supervisor</li>
          <li><b>Routing</b> — <code>with_structured_output(Route, method="json_schema")</code></li>
          <li><b><code>Command(goto=...)</code></b> — node chooses next node</li>
          <li><b>Workers return only final message</b> — scratch work stays inside</li>
          <li><b>Testable</b> — inject scripted router + workers into <code>build_supervisor_graph</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Handoffs (swarm)</div>
        <ul>
          <li><b>Handoff</b> — pass the whole conversation; new agent talks to user</li>
          <li><b>Mechanic</b> — <code>transfer_to_X</code> tool switches <code>active</code> → new system prompt</li>
          <li><b>Same tool list every call</b> + harness allow-list</li>
          <li><b>Persist <code>active</code></b> with the session</li>
          <li>⚠ Ping-pong transfers — cap steps</li>
          <li>💡 Call-centre transfer · supervisor = manager keeps control</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Critics &amp; failures</div>
        <ul>
          <li><b>Critic</b> — draft → grade vs criteria → loop; best with <b>real tests</b></li>
          <li><b>Debate</b> — independent answers, revise, judge; costly</li>
          <li>⚠ Same-model critic with no new info just agrees</li>
          <li><b>Failures</b>: lossy handoff · duplicate work · conflicts · runaway cost · compounding errors</li>
          <li><b>Fixes</b>: self-contained briefs · distinct scopes · step caps · verify in code</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">MCP concepts</div>
        <ul>
          <li><b>MCP</b> — open standard plugging AI apps into tools/data</li>
          <li><b>N×M → N+M</b> — 5 apps × 20 systems = 100 → 25</li>
          <li><b>Host</b> (app, LLM, consent) → <b>client</b> (1 per server) → <b>server</b></li>
          <li><b>JSON-RPC 2.0</b> — <code>initialize</code> → <code>tools/list</code>, <code>tools/call</code>, <code>resources/read</code></li>
          <li><b>Primitives</b> — tools (model), resources (app), prompts (user); sampling, elicitation, roots</li>
          <li><b>Transports</b> — stdio (local) · Streamable HTTP (remote, OAuth)</li>
          <li>⚠ Not a security layer — tool poisoning</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">MCP build &amp; connect</div>
        <ul>
          <li><b>SDK</b> — <code>pip install "mcp[cli]"</code>; 2.x <code>MCPServer</code>, 1.x <code>FastMCP</code></li>
          <li><b>Decorators</b> — <code>@mcp.tool()</code>, <code>@mcp.resource("kb://...")</code>, <code>@mcp.prompt()</code></li>
          <li><b>Under the hood</b> — JSON lines over stdin/stdout</li>
          <li><b>Hosts</b> — Claude Desktop/Code config · <code>async_mcp_tool</code> + tool runner · API MCP connector</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">A2A &amp; the build</div>
        <ul>
          <li><b>A2A</b> — agent ↔ opaque agent across teams/companies</li>
          <li><b>Agent Card</b> — JSON at well-known URL: skills, endpoint, auth</li>
          <li><b>Task lifecycle</b> — submitted → working → input-required → completed/failed</li>
          <li><b>Build</b> — parallel researchers (tools, JSON findings) → writer (no tools) → citation check</li>
          <li><b>Lessons</b> — structured handoff, least privilege, verify in code</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mm-when"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When Multi-Agent Helps</span><span class="rm-sub">Usually it doesn't. The rule.</span></div></div>
      <div class="rm-item rm-done" data-target="mm-orch"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Orchestrator-Workers</span><span class="rm-sub">Sub-agents as tools</span></div></div>
      <div class="rm-item rm-done" data-target="mm-sup"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Supervisor in LangGraph</span><span class="rm-sub">A router node plus workers</span></div></div>
      <div class="rm-item rm-done" data-target="mm-hand"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Handoffs</span><span class="rm-sub">Pass the conversation along</span></div></div>
      <div class="rm-item rm-done" data-target="mm-fail"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Critics, Debate &amp; Failures</span><span class="rm-sub">What goes wrong, and fixes</span></div></div>
      <div class="rm-item rm-done" data-target="mm-mcp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">MCP: Why &amp; How</span><span class="rm-sub">N×M becomes N+M</span></div></div>
      <div class="rm-item rm-done" data-target="mm-mcpsrv"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">MCP: Build &amp; Connect</span><span class="rm-sub">A real server, raw JSON-RPC</span></div></div>
      <div class="rm-item rm-done" data-target="mm-a2a"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">A2A in Brief</span><span class="rm-sub">Agents talking to agents</span></div></div>
      <div class="rm-item rm-done" data-target="mm-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Build it</span><span class="rm-sub">Researcher + writer team</span></div></div>
      <div class="rm-item rm-done" data-target="mm-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Where teams of agents go wrong</span></div></div>
      <div class="rm-item rm-done" data-target="mm-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mm-when"><span class="num">01</span>When Multi-Agent Helps</h2>
  <p>One agent works well until the job gets wide. Ask it to compare retail rents in three cities and it reads 50 pages per city. All 150 pages pile up in its one context window. By the end it is slow, expensive, and the important numbers are buried under raw search results. It may even "forget" the first city. A natural idea: split the work. Give each city to a separate agent, and let a lead agent combine the answers.</p>
  <p>That is a <strong>multi-agent system</strong>. It sounds like an obvious win, but every extra agent re-reads its own instructions, its own tools and its own history, and every message between agents can lose information. So the rule is: one agent by default, several only when splitting clearly helps.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A manager sends three analysts to study three markets. Each reads hundreds of pages; the manager reads three one-page memos and decides. That works because the markets are independent. It breaks when tasks are tightly linked: three people writing three chapters of one plot, without talking, produce a mess.</p>
  </div>
  <p>Here is the arithmetic of the "three analysts" idea. The code counts how many words sit in each agent's context.</p>
  <div class="fx" data-lang="py"># Research 3 markets. Each needs ~50 pages (300 words each) of raw reading.
PAGES, WORDS_PER_PAGE, SUMMARY = 50, 300, 150
markets = ["Pune", "Jaipur", "Kochi"]

# One agent: every page it reads stays in ITS context
single_lead_ctx = len(markets) * PAGES * WORDS_PER_PAGE

# Lead + 3 workers: each worker reads its own pages; the lead sees only summaries
worker_ctx = PAGES * WORDS_PER_PAGE
lead_ctx = len(markets) * SUMMARY
total_read = len(markets) * worker_ctx + lead_ctx      # words processed by ALL agents

print(f"one agent   : context {single_lead_ctx:&gt;6} words")
print(f"multi-agent : lead context {lead_ctx:&gt;6} words, each worker {worker_ctx} words")
print(f"total words processed: {single_lead_ctx} vs {total_read} "
      f"(+{total_read - single_lead_ctx} for the extra hops)")</div>
  <div class="fx" data-lang="text">one agent   : context  45000 words
multi-agent : lead context    450 words, each worker 15000 words
total words processed: 45000 vs 45450 (+450 for the extra hops)</div>
  <p>The lead's context fell from 45,000 words to 450: that is <strong>context isolation</strong>, the one real benefit. A short, focused context is also where models reason best (why long contexts dilute attention: <a class="xref" data-note="transformers">Transformers</a>). Each worker still reads its 15,000 words, so the total work did not shrink; it grew slightly. In practice the total grows a lot more, because every agent has its own system prompt and tool schemas and resends its own history every lap. Anthropic measured its research system at roughly 15× the tokens of a chat:</p>
  <figure class="viz"><svg viewBox="0 0 520 120" width="520">
    <text x="8" y="31">chat</text><rect x="100" y="16" width="25" height="22" class="fs" stroke="currentColor"/><text x="131" y="31">1×</text>
    <text x="8" y="65">one agent</text><rect x="100" y="50" width="100" height="22" class="fb sb"/><text x="206" y="65">≈4×</text>
    <text x="8" y="99">multi-agent</text><rect x="100" y="84" width="375" height="22" class="fr sr"/><text x="481" y="99">≈15×</text>
  </svg><figcaption>Tokens per task (Anthropic's research system). Every agent re-reads its own instructions and context, so cost multiplies.</figcaption></figure>
  <div class="callout intu"><span class="label">Decision rule</span>
    <p>Start with <strong>one agent</strong> (or a workflow, see <a class="xref" data-note="agentic">Agent Fundamentals</a>). Split only if at least one is true: <strong>Breadth</strong>: independent sub-tasks whose raw material would overflow one context. <strong>Separation</strong>: parts need different tools or permissions (a reader must never hold the "send payment" tool). <strong>Ownership</strong>: different teams build and run the agents. And the task must be worth several times the tokens.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>multi-agent system</strong> is several LLM agents, each with its own prompt, tools and context window, cooperating on one task. <strong>Context isolation</strong> means a sub-agent's raw material stays in its own context; only a summary travels back.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Planner agent, coder agent, tester agent, reviewer agent" because it looks like an org chart. Role-play does not make a model smarter. If one agent with the same tools can do it, extra agents only add hops. This is a favourite interview question.</p>
  </div>

  <h2 id="mm-orch"><span class="num">02</span>Orchestrator-Workers</h2>
  <p>How do you actually give work to another agent? You don't need a new framework. The lead agent already knows how to call tools. So make "ask a worker" a <strong>tool</strong>: <code>delegate(task)</code>. When the lead calls it, your harness starts a fresh worker agent with only that task string, waits for its short answer, and returns it as the tool result. The lead never knows the tool is another agent.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A wedding planner (lead) phones three vendors at once: caterer, decorator, DJ. Each gets a clear brief ("200 guests, veg, Saturday evening"). Each comes back with one quote. The planner never sees the caterer's kitchen, only the quote. If the brief is vague ("do the food"), two vendors may both quote for desserts.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 215" width="560">
    <defs><marker id="ma-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="190" y="8" width="180" height="46" rx="6" class="fv"/><text x="280" y="27" text-anchor="middle">Lead (Opus)</text><text x="280" y="45" text-anchor="middle" class="tm">plans · merges</text>
    <g fill="none" stroke="currentColor">
      <line x1="240" y1="54" x2="85" y2="112" marker-end="url(#ma-ah1)"/><line x1="115" y1="112" x2="258" y2="56" stroke-dasharray="4 3" marker-end="url(#ma-ah1)"/>
      <line x1="272" y1="54" x2="272" y2="112" marker-end="url(#ma-ah1)"/><line x1="290" y1="112" x2="290" y2="56" stroke-dasharray="4 3" marker-end="url(#ma-ah1)"/>
      <line x1="320" y1="54" x2="445" y2="112" marker-end="url(#ma-ah1)"/><line x1="475" y1="112" x2="338" y2="56" stroke-dasharray="4 3" marker-end="url(#ma-ah1)"/>
    </g>
    <rect x="10" y="114" width="160" height="54" rx="6" class="fb sb"/><text x="90" y="136" text-anchor="middle">Worker 1</text><text x="90" y="156" text-anchor="middle" class="tm">reads 50 pages</text>
    <rect x="200" y="114" width="160" height="54" rx="6" class="fb sb"/><text x="280" y="136" text-anchor="middle">Worker 2</text><text x="280" y="156" text-anchor="middle" class="tm">reads 40 pages</text>
    <rect x="390" y="114" width="160" height="54" rx="6" class="fb sb"/><text x="470" y="136" text-anchor="middle">Worker 3</text><text x="470" y="156" text-anchor="middle" class="tm">reads 60 pages</text>
    <line x1="20" y1="196" x2="50" y2="196" stroke="currentColor"/><text x="56" y="200">delegate(task)</text>
    <line x1="230" y1="196" x2="260" y2="196" stroke="currentColor" stroke-dasharray="4 3"/><text x="266" y="200">≤150-word summary</text>
  </svg><figcaption>One lead, many fresh contexts. Raw pages stay with the workers; only summaries travel up.</figcaption></figure>
  <p>The code is the normal tool loop from <a class="xref" data-note="llm_apis">LLM APIs &amp; Tool Calling</a>; only the tool's body is special. Note the <code>client</code> parameter: production passes <code>anthropic.Anthropic()</code>, our test passes a fake.</p>
  <div class="fx" data-lang="py">from concurrent.futures import ThreadPoolExecutor

def run_subagent(client, task: str) -&gt; str:
    """A worker with a FRESH context. Only its short summary goes back to the lead."""
    resp = client.messages.create(
        model="claude-sonnet-5-5", max_tokens=4096,   # cheaper model for workers
        system="You are a focused worker. Do the task. Reply in &lt;=150 words.",
        messages=[{"role": "user", "content": task}])
    return next(b.text for b in resp.content if b.type == "text")

DELEGATE = {"name": "delegate", "strict": True,
            "description": "Give one self-contained sub-task to a worker agent. "
                           "Call several times in one turn for independent sub-tasks.",
            "input_schema": {"type": "object", "additionalProperties": False,
                             "properties": {"task": {"type": "string"}}, "required": ["task"]}}

def lead_agent(client, goal: str, max_steps: int = 8) -&gt; str:
    messages = [{"role": "user", "content": goal}]
    for _ in range(max_steps):
        resp = client.messages.create(
            model="claude-opus-5-5", max_tokens=16000, tools=[DELEGATE], messages=messages,
            system="You are a lead. Split the goal into independent sub-tasks, delegate "
                   "them, then merge the results into one answer.")
        messages.append({"role": "assistant", "content": resp.content})
        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")
        calls = [b for b in resp.content if b.type == "tool_use"]
        with ThreadPoolExecutor() as pool:             # parallel workers
            outputs = list(pool.map(lambda b: run_subagent(client, b.input["task"]), calls))
        messages.append({"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": b.id, "content": out}
            for b, out in zip(calls, outputs)]})
    return "Stopped: step limit reached."</div>
  <p><code>run_subagent</code> makes one call with a brand-new <code>messages</code> list: that is the fresh context. It uses <code>claude-sonnet-5-5</code>, cheaper than the lead's <code>claude-opus-5-5</code>, since the lead does the hard reasoning. In <code>lead_agent</code>, if one turn holds several <code>tool_use</code> blocks, those are independent sub-tasks, so <code>ThreadPoolExecutor</code> runs the workers at the same time. All results go back in <strong>one</strong> user message, matched by <code>tool_use_id</code>.</p>
  <p>To see it run, we need a fake that plays both roles. It has to know <em>who</em> is calling, and the request tells it: workers use the Sonnet model id. The shared <code>FakeClient</code> below is used for every test in this note.</p>
  <div class="fx" data-lang="py">from types import SimpleNamespace as NS
import itertools, threading

_ids = itertools.count(1)
def text(t):          return NS(type="text", text=t)
def call(name, **a):  return NS(type="tool_use", id=f"toolu_{next(_ids):02d}", name=name, input=a)

class FakeClient:
    """Plays the model(s). \`play(request)\` returns the content blocks for one turn."""
    def __init__(self, play):
        self.play, self.calls = play, []
        self.lock = threading.Lock()
        self.messages = NS(create=self._create)

    def _create(self, **request):
        with self.lock:                                   # workers call from threads
            self.calls.append(request["model"])
        content = self.play(request)
        stop = "tool_use" if any(b.type == "tool_use" for b in content) else "end_turn"
        return NS(content=content, stop_reason=stop)</div>
  <div class="fx" data-lang="py">RENT = {"Pune": 38, "Jaipur": 27, "Kochi": 31}          # fake research data, Rs/sq ft

def play(req):
    if req["model"] == "claude-sonnet-5-5":              # a worker
        city = req["messages"][0]["content"].split()[-1]
        return [text(f"{city}: avg retail rent Rs {RENT[city]}/sq ft (source: survey-{city})")]
    last = req["messages"][-1]
    if last["role"] == "user" and isinstance(last["content"], str):    # lead, turn 1
        calls = [call("delegate", task=f"Find average retail rent in {c}") for c in RENT]
        print(f"  lead    -&gt; one turn, {len(calls)} delegate calls:")
        for b in calls:
            print("             ", b.input["task"])
        return calls
    results = [r["content"] for r in last["content"]]                 # lead, turn 2
    print(f"  lead    &lt;- {len(results)} tool_results in one user message:")
    for r in results:
        print("             ", r)
    best = min(results, key=lambda r: int(r.split("Rs ")[1].split("/")[0]))
    return [text("Cheapest rent: " + best)]

client = FakeClient(play)
print("ANSWER:", lead_agent(client, "Which of Pune, Jaipur, Kochi has the cheapest retail rent?"))
print("model calls:", client.calls)</div>
  <div class="fx" data-lang="text">  lead    -&gt; one turn, 3 delegate calls:
              Find average retail rent in Pune
              Find average retail rent in Jaipur
              Find average retail rent in Kochi
  lead    &lt;- 3 tool_results in one user message:
              Pune: avg retail rent Rs 38/sq ft (source: survey-Pune)
              Jaipur: avg retail rent Rs 27/sq ft (source: survey-Jaipur)
              Kochi: avg retail rent Rs 31/sq ft (source: survey-Kochi)
ANSWER: Cheapest rent: Jaipur: avg retail rent Rs 27/sq ft (source: survey-Jaipur)
model calls: ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-sonnet-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5']</div>
  <p>Trace it. Lap 1: the lead returned three <code>delegate</code> calls in a single turn. The harness ran three workers in parallel; each saw only its own one-line task. Lap 2: the lead received three <code>tool_result</code>s in one message and picked Jaipur. <code>model calls</code> shows the order: Opus, three Sonnets, Opus. Five calls for one question: that is the token cost you pay.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Orchestrator-workers</strong>: a lead LLM splits a task at runtime, delegates sub-tasks to workers with fresh contexts, and merges their outputs. A <strong>task brief</strong> is everything a worker knows: goal, scope, output format, what to skip.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Vague delegation ("research AI chips") makes workers duplicate each other or miss things. Tell the lead in its system prompt to give each worker a distinct scope and a required output shape.</p>
  </div>

  <h2 id="mm-sup"><span class="num">03</span>Supervisor in LangGraph</h2>
  <p>In orchestrator-workers, the lead's decisions are hidden inside one loop. As the team grows (researcher, writer, fact-checker), you want the flow to be explicit: who runs after whom, and where to resume after a crash. <a class="xref" data-note="langgraph">LangGraph</a> expresses this as a graph. A <strong>supervisor</strong> node picks the next worker; each worker node runs, writes its result to shared state, and returns control to the supervisor.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A newspaper desk editor. The editor sends the story to the reporter, gets the reporting back, sends it to the sub-editor, gets the copy back, then says "print". Every handover goes through the editor's desk, and only the finished piece comes back, not the reporter's notebook.</p>
  </div>
  <div class="flow"><span>START</span><span>supervisor</span><span>researcher or writer</span><span>back to supervisor</span><span>FINISH → END</span></div>
  <p>We write the graph as a function that <em>receives</em> the router and the two workers. That one design choice makes it testable.</p>
  <div class="fx" data-lang="py">from typing import Literal
from pydantic import BaseModel
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.types import Command

class Route(BaseModel):                       # the supervisor's only output
    next: Literal["researcher", "writer", "FINISH"]

SUPERVISOR = ("You manage a researcher and a writer. Pick who acts next. "
              "Research first, then writing, then FINISH.")

def build_supervisor_graph(router, researcher, writer):
    def supervisor(state: MessagesState) -&gt; Command[Literal["researcher", "writer", "__end__"]]:
        choice = router.invoke([{"role": "system", "content": SUPERVISOR}] + state["messages"])
        return Command(goto=END if choice.next == "FINISH" else choice.next)

    def make_worker(agent, name):
        def node(state: MessagesState) -&gt; Command[Literal["supervisor"]]:
            out = agent.invoke({"messages": state["messages"]})
            last = out["messages"][-1]                 # only the final message goes back
            return Command(update={"messages": [{"role": "assistant", "content": last.content,
                                                 "name": name}]}, goto="supervisor")
        return node

    builder = StateGraph(MessagesState)
    builder.add_node("supervisor", supervisor)
    builder.add_node("researcher", make_worker(researcher, "researcher"))
    builder.add_node("writer", make_worker(writer, "writer"))
    builder.add_edge(START, "supervisor")
    return builder.compile()</div>
  <p><code>supervisor</code> asks the router for a <code>Route</code> and returns <code>Command(goto=...)</code>: a node choosing the next node itself, with no conditional-edge function. Each worker node runs its agent but sends back only <code>out["messages"][-1]</code>, the final message: context isolation again. Production wiring with real models:</p>
  <div class="fx" data-lang="py">from langchain.agents import create_agent
from langchain_anthropic import ChatAnthropic

def search_notes(query: str) -&gt; str:
    """Search the team's research notes."""
    return "[pgv-1] pgvector keeps embeddings next to relational data."

llm = ChatAnthropic(model="claude-opus-5-5")
router = llm.with_structured_output(Route, method="json_schema")
researcher = create_agent(llm, tools=[search_notes], name="researcher",
                          system_prompt="Research the question. Cite sources.")
writer = create_agent(llm, tools=[], name="writer",
                      system_prompt="Write a short brief from the research in the chat.")
graph = build_supervisor_graph(router, researcher, writer)
# graph.invoke({"messages": [{"role": "user", "content": "pgvector or Pinecone?"}]})</div>
  <p><code>with_structured_output(Route, method="json_schema")</code> makes the routing decision schema-enforced JSON (forced tool choice is rejected on <code>claude-opus-5-5</code>, so this is the right way). Now test the graph with a scripted router and two scripted workers. Each fake worker produces five scratch messages before its answer, to check they don't leak.</p>
  <div class="fx" data-lang="py">from langchain_core.messages import AIMessage

class ScriptedRouter:                          # plays the supervisor LLM
    def __init__(self, picks): self.picks = list(picks)
    def invoke(self, messages):
        pick = self.picks.pop(0)
        print(f"supervisor saw {len(messages) - 1} msgs -&gt; {pick}")
        return Route(next=pick)

class ScriptedWorker:                          # plays a whole sub-agent
    def __init__(self, reply): self.reply = reply
    def invoke(self, state):
        scratch = [AIMessage(content="(tool calls, raw search results...)")] * 5
        return {"messages": state["messages"] + scratch + [AIMessage(content=self.reply)]}

test_graph = build_supervisor_graph(
    ScriptedRouter(["researcher", "writer", "FINISH"]),
    ScriptedWorker("pgvector: one DB, fine to a few million vectors [pgv-1]."),
    ScriptedWorker("Brief: start with pgvector; revisit at 5M vectors [pgv-1]."))
final = test_graph.invoke({"messages": [{"role": "user", "content": "pgvector or Pinecone?"}]})
for m in final["messages"]:
    print(f"{m.type:5} {m.name or '':10} {m.content}")</div>
  <div class="fx" data-lang="text">supervisor saw 1 msgs -&gt; researcher
supervisor saw 2 msgs -&gt; writer
supervisor saw 3 msgs -&gt; FINISH
human            pgvector or Pinecone?
ai    researcher pgvector: one DB, fine to a few million vectors [pgv-1].
ai    writer     Brief: start with pgvector; revisit at 5M vectors [pgv-1].</div>
  <p>The supervisor was called three times and saw 1, 2, then 3 messages: the user's question plus one final message per worker. The ten scratch messages never reached shared state. The final state is clean: question, research, brief.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Supervisor pattern</strong>: a central routing agent that keeps control and calls workers one at a time. Ready-made helpers exist (the <code>langgraph-supervisor</code> package), but the hand-written version shows the mechanics.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Passing the worker's full message list back into shared state. The supervisor's context fills with tool chatter, which defeats the point of having workers.</p>
  </div>

  <h2 id="mm-hand"><span class="num">04</span>Handoffs</h2>
  <p>A supervisor stays in charge for the whole task. But in customer support, the right shape is different. A triage agent greets the user, works out the problem is about billing, and then the <em>billing</em> agent should talk to the user directly, for the rest of the conversation. Routing every message back through triage would add a hop and a cost to every turn. This is a <strong>handoff</strong>: one agent passes the whole conversation to another and steps out.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank call centre. The IVR hears "card blocked" and transfers you to the cards team. The cards team now owns the call; the IVR is gone. If the cards agent hears "home loan", they can transfer again.</p>
  </div>
  <div class="flow"><span>User</span><span>triage</span><span>transfer_to_billing()</span><span>billing answers</span><span>next turn starts at billing</span></div>
  <p>The trick: a handoff is just a tool whose effect is "change <code>active</code>". The next model call then uses the new agent's system prompt. Every call sends the same <code>ALL_TOOLS</code> list; the harness enforces which agent may use which tool.</p>
  <div class="fx" data-lang="py">def transfer(to):
    return {"name": f"transfer_to_{to}", "description": f"Hand the conversation to the {to} agent.",
            "input_schema": {"type": "object", "properties": {}}}

REFUND = {"name": "issue_refund", "description": "Refund an order.", "input_schema": {
    "type": "object", "properties": {"order_id": {"type": "string"}}, "required": ["order_id"]}}

AGENTS = {   # each agent = its own instructions + the tools it may use
    "triage":  {"system": "Route the user: billing questions -&gt; transfer_to_billing, "
                          "technical problems -&gt; transfer_to_tech. Never answer yourself.",
                "allowed": {"transfer_to_billing", "transfer_to_tech"}},
    "billing": {"system": "You handle refunds and invoices.",
                "allowed": {"issue_refund", "transfer_to_triage"}},
    "tech":    {"system": "You fix login and app problems.", "allowed": {"transfer_to_triage"}},
}
ALL_TOOLS = [transfer("billing"), transfer("tech"), transfer("triage"), REFUND]

def chat(client, messages, active="triage", max_steps=10):
    for _ in range(max_steps):
        name, agent = active, AGENTS[active]          # who is speaking this lap
        resp = client.messages.create(model="claude-opus-5-5", max_tokens=16000,
                                      system=agent["system"], tools=ALL_TOOLS, messages=messages)
        messages.append({"role": "assistant", "content": resp.content})
        if resp.stop_reason != "tool_use":
            return active, resp            # remember "active" for the user's next turn
        results = []
        for b in resp.content:
            if b.type != "tool_use":
                continue
            if b.name not in agent["allowed"]:
                out, err = f"{b.name} is not available to the {name} agent.", True
            elif b.name.startswith("transfer_to_"):
                active, out, err = b.name.removeprefix("transfer_to_"), "Transferred.", False
            else:
                out, err = f"Refund issued for {b.input['order_id']}.", False
            print(f"  [{name}] {b.name} -&gt; {out}")
            results.append({"type": "tool_result", "tool_use_id": b.id,
                            "content": out, "is_error": err})
        messages.append({"role": "user", "content": results})
    raise RuntimeError("too many steps")</div>
  <p>Now a scripted conversation. The triage "model" misbehaves first: it tries to refund directly, which it is not allowed to do.</p>
  <div class="fx" data-lang="py">script = {   # what each agent "says", keyed by its system prompt, in order
    "triage":  [[call("issue_refund", order_id="A1002")],          # not allowed for triage
                [call("transfer_to_billing")]],
    "billing": [[call("issue_refund", order_id="A1002")],
                [text("Done: refund for A1002 issued. Anything else?")]],
}
def play(req):
    who = next(k for k, v in AGENTS.items() if v["system"] == req["system"])
    return script[who].pop(0)

msgs = [{"role": "user", "content": "My order A1002 arrived broken, I want a refund"}]
active, resp = chat(FakeClient(play), msgs)
print("reply :", resp.content[0].text)
print("active:", active, "| messages:", len(msgs))</div>
  <div class="fx" data-lang="text">  [triage] issue_refund -&gt; issue_refund is not available to the triage agent.
  [triage] transfer_to_billing -&gt; Transferred.
  [billing] issue_refund -&gt; Refund issued for A1002.
reply : Done: refund for A1002 issued. Anything else?
active: billing | messages: 8</div>
  <p>Line 1: triage tried <code>issue_refund</code>; the allow-list check (<code>b.name not in agent["allowed"]</code>) returned an error result instead of running it. Line 2: triage transferred, so <code>active</code> became <code>"billing"</code>. Line 3: on the next lap the billing prompt was used and the refund ran. The function returned <code>active="billing"</code>; store it with the session so the user's next message goes straight to billing.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Handoff</strong> (also "swarm" style): control of the conversation moves from one agent to another permanently. Supervisor = a manager who keeps control; handoff = a call transfer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Ping-pong: triage sends to billing, billing sends back to triage, forever. Always cap steps, and write transfer descriptions that say when <em>not</em> to transfer. Also don't change the tool list per agent: old <code>tool_use</code> blocks in history must stay valid, and a fixed list keeps the prompt cache warm.</p>
  </div>

  <h2 id="mm-fail"><span class="num">05</span>Critics, Debate &amp; Failures</h2>
  <p>A popular idea: add a second agent to check the first one's work. Sometimes this helps a lot; often it does nothing. The difference is whether the critic knows something the writer didn't. A copy of the same model, reading the same draft with no new information, tends to agree with it. A critic with a <strong>test suite</strong>, a rubric, a retrieved source or a different model actually catches mistakes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking your friend "is my bill correct?" gets "looks fine". Asking the shopkeeper to scan the items again with the barcode machine catches the item charged twice. The scanner is a real test; your friend is a same-model critic.</p>
  </div>
  <p>Below, the writer (scripted here; an LLM in real life) writes a GST function. The critic is not an LLM at all: it runs three test cases and returns the first failure as feedback.</p>
  <div class="fx" data-lang="py"># Writer = an LLM in real life (scripted here). Critic = REAL tests, not opinions.
drafts = [
    "def with_gst(price): return price * 1.18",                 # draft 1
    "def with_gst(price): return round(price * 1.18, 2)",       # draft 2, after feedback
]
TESTS = [(100, 118.0), (99.99, 117.99), (0, 0.0)]                # (input, expected)

def critic(code):
    env = {}
    exec(code, env)                                    # fine for a demo; sandbox it for real
    fails = [(x, want, env["with_gst"](x)) for x, want in TESTS
             if env["with_gst"](x) != want]
    return fails

for round_no, code in enumerate(drafts, 1):
    fails = critic(code)
    print(f"round {round_no}: {code}")
    if not fails:
        print("   PASS: all", len(TESTS), "tests")
        break
    x, want, got = fails[0]
    print(f"   FAIL: with_gst({x}) gave {got}, expected {want} -&gt; feedback to writer")</div>
  <div class="fx" data-lang="text">round 1: def with_gst(price): return price * 1.18
   FAIL: with_gst(99.99) gave 117.98819999999999, expected 117.99 -&gt; feedback to writer
round 2: def with_gst(price): return round(price * 1.18, 2)
   PASS: all 3 tests</div>
  <p>Round 1 looked right (<code>price * 1.18</code>) and even passed the 100 → 118 case, but the critic's second test exposed floating-point noise: 117.98819999999999 instead of 117.99. That exact failing case is the feedback a writer can act on. Round 2 added <code>round(..., 2)</code> and passed all three. A same-model critic reading round 1 would very likely have said "looks correct".</p>
  <div class="cards">
    <div><b>Critic / evaluator</b><p>Draft, grade against criteria, loop until pass (the evaluator-optimizer workflow).</p><small>Needs checkable criteria</small></div>
    <div><b>Debate</b><p>Several agents answer independently, see each other's answers, revise; a judge picks.</p><small>Some gains on reasoning; costly</small></div>
    <div><b>Hierarchical</b><p>Supervisors of supervisors: teams under team leads.</p><small>Only for very large tasks</small></div>
  </div>
  <table class="tbl">
    <tr><th>Failure</th><th>Looks like</th><th>Fix</th></tr>
    <tr><td>Lossy handoff</td><td>Worker misses a constraint the user stated</td><td>Self-contained briefs; pass key constraints explicitly</td></tr>
    <tr><td>Duplicate work</td><td>Two workers search the same thing</td><td>Lead assigns distinct scopes</td></tr>
    <tr><td>Conflicting outputs</td><td>Workers make incompatible choices</td><td>Don't split coupled work; one agent owns the merge</td></tr>
    <tr><td>Runaway loops / cost</td><td>Agents keep delegating or transferring</td><td>Step caps, token budgets, timeouts</td></tr>
    <tr><td>Errors compound</td><td>A worker's wrong "fact" becomes the lead's premise</td><td>Workers cite sources; verify citations in code</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Critic</strong> (evaluator): an agent or program that grades another's output against criteria and returns feedback. <strong>Debate</strong>: agents argue answers before a judge decides.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Adding a same-model critic with no new information and calling the system "self-verifying". Measure it: if the critic almost never rejects anything, it is costing tokens and adding nothing.</p>
  </div>

  <h2 id="mm-mcp"><span class="num">06</span>MCP: Why &amp; How</h2>
  <p>Every agent needs tools: GitHub, a database, Slack, your company wiki. Without a standard, each AI app writes its own connector for each system. Five apps and twenty systems means a hundred connectors, each with its own bugs, auth and schema format. When the wiki changes its API, a hundred connectors break. The <strong>Model Context Protocol (MCP)</strong> fixes this with one shared protocol: each system ships one MCP server, each app implements one MCP client, and any app can use any server.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>USB-C. Laptops don't need a special port per device, and devices don't need a cable per laptop. Where the analogy breaks: a USB device can't trick your laptop with words, but an MCP server's tool descriptions go straight into the model's prompt.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
    <text x="10" y="18">Without MCP: 3×4 = 12</text><text x="300" y="18">With MCP: 3+4 = 7</text>
    <g stroke="currentColor" opacity="0.55">
      <line x1="70" y1="56" x2="200" y2="46"/><line x1="70" y1="56" x2="200" y2="86"/><line x1="70" y1="56" x2="200" y2="126"/><line x1="70" y1="56" x2="200" y2="166"/>
      <line x1="70" y1="106" x2="200" y2="46"/><line x1="70" y1="106" x2="200" y2="86"/><line x1="70" y1="106" x2="200" y2="126"/><line x1="70" y1="106" x2="200" y2="166"/>
      <line x1="70" y1="156" x2="200" y2="46"/><line x1="70" y1="156" x2="200" y2="86"/><line x1="70" y1="156" x2="200" y2="126"/><line x1="70" y1="156" x2="200" y2="166"/>
      <line x1="360" y1="56" x2="400" y2="106"/><line x1="360" y1="106" x2="400" y2="106"/><line x1="360" y1="156" x2="400" y2="106"/>
      <line x1="448" y1="106" x2="490" y2="46"/><line x1="448" y1="106" x2="490" y2="86"/><line x1="448" y1="106" x2="490" y2="126"/><line x1="448" y1="106" x2="490" y2="166"/>
    </g>
    <g class="fb sb"><rect x="20" y="45" width="50" height="22" rx="4"/><rect x="20" y="95" width="50" height="22" rx="4"/><rect x="20" y="145" width="50" height="22" rx="4"/>
      <rect x="310" y="45" width="50" height="22" rx="4"/><rect x="310" y="95" width="50" height="22" rx="4"/><rect x="310" y="145" width="50" height="22" rx="4"/></g>
    <g class="fg sg"><rect x="200" y="35" width="50" height="22" rx="4"/><rect x="200" y="75" width="50" height="22" rx="4"/><rect x="200" y="115" width="50" height="22" rx="4"/><rect x="200" y="155" width="50" height="22" rx="4"/>
      <rect x="490" y="35" width="50" height="22" rx="4"/><rect x="490" y="75" width="50" height="22" rx="4"/><rect x="490" y="115" width="50" height="22" rx="4"/><rect x="490" y="155" width="50" height="22" rx="4"/></g>
    <circle cx="424" cy="106" r="24" class="fv"/><text x="424" y="110" text-anchor="middle">MCP</text>
    <g text-anchor="middle"><text x="45" y="60">app</text><text x="45" y="110">app</text><text x="45" y="160">app</text><text x="335" y="60">app</text><text x="335" y="110">app</text><text x="335" y="160">app</text>
      <text x="225" y="50">tool</text><text x="225" y="90">tool</text><text x="225" y="130">tool</text><text x="225" y="170">tool</text><text x="515" y="50">tool</text><text x="515" y="90">tool</text><text x="515" y="130">tool</text><text x="515" y="170">tool</text></g>
  </svg><figcaption>Every line is a connector someone must write. At 5 apps × 20 systems: 100 vs 25.</figcaption></figure>
  <p>The count: N apps × M systems = N×M custom connectors without MCP, but N + M with it. For 5 × 20, that is 100 versus 25.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="ma-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="10" width="222" height="180" rx="8" class="fs" stroke="currentColor"/>
    <text x="22" y="30">Host</text><text x="22" y="48" class="tm">app · LLM · user consent</text>
    <rect x="22" y="66" width="70" height="108" rx="6" class="fv"/><text x="57" y="124" text-anchor="middle">LLM</text>
    <rect x="114" y="76" width="106" height="34" rx="6" class="fb sb"/><text x="167" y="97" text-anchor="middle">client 1</text>
    <rect x="114" y="132" width="106" height="34" rx="6" class="fb sb"/><text x="167" y="153" text-anchor="middle">client 2</text>
    <rect x="290" y="76" width="140" height="34" rx="6" class="ft st"/><text x="360" y="97" text-anchor="middle">server: github</text>
    <rect x="290" y="132" width="140" height="34" rx="6" class="ft st"/><text x="360" y="153" text-anchor="middle">server: kb</text>
    <rect x="480" y="76" width="110" height="34" rx="6" class="fg sg"/><text x="535" y="97" text-anchor="middle">GitHub API</text>
    <rect x="480" y="132" width="110" height="34" rx="6" class="fg sg"/><text x="535" y="153" text-anchor="middle">files / DB</text>
    <g stroke="currentColor" fill="none">
      <line x1="94" y1="93" x2="112" y2="93"/><line x1="94" y1="149" x2="112" y2="149"/>
      <line x1="224" y1="93" x2="286" y2="93" marker-start="url(#ma-ah2)" marker-end="url(#ma-ah2)"/>
      <line x1="224" y1="149" x2="286" y2="149" marker-start="url(#ma-ah2)" marker-end="url(#ma-ah2)"/>
      <line x1="432" y1="93" x2="476" y2="93" marker-end="url(#ma-ah2)"/><line x1="432" y1="149" x2="476" y2="149" marker-end="url(#ma-ah2)"/>
    </g>
    <text x="255" y="60" text-anchor="middle" class="tb">JSON-RPC</text>
    <text x="255" y="86" text-anchor="middle" class="tm" font-size="11">HTTP</text><text x="255" y="142" text-anchor="middle" class="tm" font-size="11">stdio</text>
  </svg><figcaption>One client per server inside the host. The server talks to the real system and never needs to know which LLM is used.</figcaption></figure>
  <p>Three roles. The <strong>host</strong> is the AI app (Claude Desktop, Claude Code, your app): it owns the LLM, the UI and user consent. Inside it, one <strong>client</strong> per server holds a connection. The <strong>server</strong> is a small program that exposes capabilities and talks to the real system. A session, traced step by step (we run exactly this in the next section):</p>
  <table class="tbl out"><caption>One MCP session</caption>
    <tr><th>#</th><th>Client sends</th><th>Server replies</th></tr>
    <tr><td>1</td><td><code>initialize</code> (my protocol version, my capabilities)</td><td>server name, version, capabilities (tools, resources, prompts)</td></tr>
    <tr><td>2</td><td><code>notifications/initialized</code> (no reply expected)</td><td>–</td></tr>
    <tr><td>3</td><td><code>tools/list</code></td><td>each tool's name, description, JSON schema</td></tr>
    <tr><td>4</td><td><code>tools/call</code> {name, arguments}</td><td>content blocks + <code>isError</code></td></tr>
  </table>
  <table class="tbl">
    <tr><th>Primitive</th><th>Offered by</th><th>Who decides to use it</th><th>Example</th></tr>
    <tr><td><strong>Tools</strong></td><td>Server</td><td>The model</td><td><code>search_kb(query)</code></td></tr>
    <tr><td><strong>Resources</strong></td><td>Server</td><td>The app / user (read-only data by URI)</td><td><code>kb://policies/leave</code></td></tr>
    <tr><td><strong>Prompts</strong></td><td>Server</td><td>The user (templates, slash commands)</td><td>"Summarise this PR"</td></tr>
    <tr><td><strong>Sampling</strong></td><td>Client</td><td>Server asks the host's LLM for a completion</td><td>Server needs a summary, has no API key</td></tr>
    <tr><td><strong>Elicitation</strong></td><td>Client</td><td>Server asks the user for input mid-task</td><td>"Which repo did you mean?"</td></tr>
    <tr><td><strong>Roots</strong></td><td>Client</td><td>Host tells server which folders it may touch</td><td><code>file:///home/me/project</code></td></tr>
  </table>
  <table class="tbl">
    <tr><th></th><th>stdio</th><th>Streamable HTTP</th></tr>
    <tr><td>How</td><td>Host starts the server as a subprocess; JSON-RPC over stdin/stdout</td><td>Server is a web service at one endpoint (e.g. <code>/mcp</code>); can stream replies</td></tr>
    <tr><td>Use for</td><td>Local tools: files, git, a local DB</td><td>Remote, shared, multi-user servers</td></tr>
    <tr><td>Auth</td><td>The user's machine permissions</td><td>OAuth 2.1 / tokens</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MCP</strong>: an open standard for connecting AI applications to tools and data. <strong>JSON-RPC 2.0</strong>: a simple message format: a request has <code>id</code>, <code>method</code>, <code>params</code>; the reply carries the same <code>id</code> and a <code>result</code> or <code>error</code>. The older "HTTP + SSE" transport is deprecated; use Streamable HTTP for anything remote.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: MCP is not a security layer</span>
    <p>A malicious or compromised server can put instructions in tool descriptions or results ("tool poisoning"). Install servers only from sources you trust, give them least privilege, and keep human approval for risky actions (<a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a>).</p>
  </div>

  <h2 id="mm-mcpsrv"><span class="num">07</span>MCP: Build &amp; Connect</h2>
  <p>Writing a server is the easy part, and it should be: the whole point is that each system writes one. The official Python SDK is <code>pip install "mcp[cli]"</code>. A server is a set of decorated functions; type hints become the JSON schema and docstrings become descriptions, exactly like <code>@beta_tool</code> in <a class="xref" data-note="agent_build">Build an Agent from Scratch</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Opening a counter in a mall food court. You follow the mall's standard (menu board format, token system, payment terminal). Any customer who knows the mall can order from you without learning your shop's rules.</p>
  </div>
  <div class="fx" data-lang="py"># file: kb_server.py  (a minimal MCP server exposing a tiny company knowledge base)
from mcp.server.mcpserver import MCPServer

mcp = MCPServer("company-kb")

DOCS = {
    "leave": "Employees get 24 days of paid leave per year.",
    "expenses": "Expenses above Rs 5,000 need manager approval.",
}

@mcp.tool()
def search_kb(query: str) -&gt; str:
    """Search the company knowledge base. Call this for any policy question."""
    hits = [text for key, text in DOCS.items() if key in query.lower()]
    return "\\n".join(hits) or "No matching policy found."

@mcp.resource("kb://policies/{name}")
def get_policy(name: str) -&gt; str:
    """Full text of one policy."""
    return DOCS.get(name, "Unknown policy")

@mcp.prompt()
def policy_question(topic: str) -&gt; str:
    """Template for asking about a policy."""
    return f"Using the company KB, answer: what is our {topic} policy? Cite the policy."

if __name__ == "__main__":
    mcp.run()  # stdio by default; mcp.run(transport="streamable-http") for HTTP</div>
  <p>Three decorators, three primitives: <code>@mcp.tool()</code> (the model may call it), <code>@mcp.resource("kb://policies/{name}")</code> (the app reads it by URI), <code>@mcp.prompt()</code> (a template the user picks). <code>mcp.run()</code> serves over stdio. <em>Version note:</em> this is <code>mcp</code> 2.x (<code>MCPServer</code>); most tutorials show 1.x, <code>from mcp.server.fastmcp import FastMCP</code>, with the same decorators.</p>
  <p>Test it from a plain MCP client, with no LLM involved:</p>
  <div class="fx" data-lang="py">import asyncio, sys
from mcp import Client, StdioServerParameters

async def main():
    params = StdioServerParameters(command=sys.executable, args=["kb_server.py"])
    async with Client(params) as client:              # starts the server process
        tools = await client.list_tools()
        print("tools:", [(t.name, t.description[:40]) for t in tools.tools])
        res = await client.call_tool("search_kb", {"query": "expenses rules"})
        print("call :", res.content[0].text)
        res = await client.call_tool("search_kb", {"query": "wifi password"})
        print("miss :", res.content[0].text)

asyncio.run(main())</div>
  <div class="fx" data-lang="text">tools: [('search_kb', 'Search the company knowledge base. Call ')]
call : Expenses above Rs 5,000 need manager approval.
miss : No matching policy found.</div>
  <p><code>Client(params)</code> started <code>kb_server.py</code> as a subprocess, did the handshake, listed one tool and called it twice. To demystify the protocol, here is the same session with <em>no SDK on the client side</em>: just JSON lines written to the server's stdin.</p>
  <div class="fx" data-lang="py"># MCP without any SDK on the client side: JSON-RPC messages, one per line, over stdin/stdout.
import json, subprocess, sys

server = subprocess.Popen([sys.executable, "kb_server.py"], stdin=subprocess.PIPE,
                          stdout=subprocess.PIPE, text=True)

def send(msg):
    server.stdin.write(json.dumps(msg) + "\\n"); server.stdin.flush()
    if "id" in msg:                                    # requests get a reply; notifications don't
        return json.loads(server.stdout.readline())

r = send({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {
          "protocolVersion": "2025-06-18", "capabilities": {},
          "clientInfo": {"name": "raw-client", "version": "0.1"}}})
print("1 initialize -&gt;", r["result"]["serverInfo"]["name"], "| capabilities:",
      sorted(r["result"]["capabilities"]))
send({"jsonrpc": "2.0", "method": "notifications/initialized"})
r = send({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
t = r["result"]["tools"][0]
print("2 tools/list -&gt;", t["name"], json.dumps(t["inputSchema"]["properties"]))
r = send({"jsonrpc": "2.0", "id": 3, "method": "tools/call",
          "params": {"name": "search_kb", "arguments": {"query": "leave"}}})
print("3 tools/call -&gt;", r["result"]["content"][0]["text"], "| isError:", r["result"]["isError"])
r = send({"jsonrpc": "2.0", "id": 4, "method": "resources/read",
          "params": {"uri": "kb://policies/expenses"}})
print("4 resources/read -&gt;", r["result"]["contents"][0]["text"])
server.stdin.close(); server.wait()</div>
  <div class="fx" data-lang="text">1 initialize -&gt; company-kb | capabilities: ['experimental', 'prompts', 'resources', 'tools']
2 tools/list -&gt; search_kb {"query": {"title": "Query", "type": "string"}}
3 tools/call -&gt; Employees get 24 days of paid leave per year. | isError: False
4 resources/read -&gt; Expenses above Rs 5,000 need manager approval.</div>
  <p>This is the session from the table in section 06, for real. <code>send</code> writes one JSON object per line and, for requests (those with an <code>id</code>), reads one line back. The server answered <code>initialize</code> with its name and capabilities, listed <code>search_kb</code> with a schema generated from <code>query: str</code>, ran the tool (<code>isError: False</code>), and served a resource by URI. Nothing magic: a protocol any language can speak.</p>
  <h3>Three ways a host uses it</h3>
  <p><strong>1. An existing host.</strong> Claude Code: <code>claude mcp add company-kb -- python kb_server.py</code>. Claude Desktop reads a config file with <code>"mcpServers": {"company-kb": {"command": "python", "args": ["/path/to/kb_server.py"]}}</code>.</p>
  <p><strong>2. Your own host app.</strong> List the server's tools and hand them to Claude; the tool runner calls them over the MCP session:</p>
  <div class="fx" data-lang="py"># host side: connect to the server over stdio and hand its tools to Claude
import asyncio, sys
from anthropic import AsyncAnthropic
from anthropic.lib.tools.mcp import async_mcp_tool      # pip install "anthropic[mcp]"
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    params = StdioServerParameters(command=sys.executable, args=["kb_server.py"])
    async with stdio_client(params) as (read, write):    # launches the server process
        async with ClientSession(read, write) as session:
            await session.initialize()                   # handshake: versions + capabilities
            tools = (await session.list_tools()).tools   # discovery
            runner = AsyncAnthropic().beta.messages.tool_runner(
                model="claude-opus-5-5", max_tokens=16000,
                tools=[async_mcp_tool(t, session) for t in tools],
                messages=[{"role": "user", "content": "How many leave days do we get?"}])
            async for message in runner:                 # runner calls MCP tools for you
                for block in message.content:
                    if block.type == "text":
                        print(block.text)

asyncio.run(main())</div>
  <p>Verified offline against a mock HTTP API: the runner sent <code>search_kb</code> as a tool, the "model" called it, and the real MCP server's answer ("Employees get 24 days…") went back as the <code>tool_result</code>.</p>
  <p><strong>3. A remote server, no client code.</strong> For a server on Streamable HTTP, the API's MCP connector connects for you (beta). Both halves are needed: <code>mcp_servers</code> and a matching <code>mcp_toolset</code>.</p>
  <div class="fx" data-lang="py">import anthropic
client = anthropic.Anthropic()
response = client.beta.messages.create(
    model="claude-opus-5-5", max_tokens=16000,
    betas=["mcp-client-2025-11-20"],
    mcp_servers=[{"type": "url", "url": "https://kb.acme.example/mcp", "name": "company-kb"}],
    tools=[{"type": "mcp_toolset", "mcp_server_name": "company-kb"}],
    messages=[{"role": "user", "content": "What is our expense approval limit?"}],
)</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>stdio transport</strong>: the host launches the server and talks over its standard input/output. To serve over HTTP instead: <code>mcp.run(transport="streamable-http")</code>; clients connect to the server's <code>/mcp</code> endpoint.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Printing debug output to stdout in a stdio server. stdout <em>is</em> the protocol channel, so a stray <code>print</code> corrupts the JSON stream. Log to stderr.</p>
  </div>

  <h2 id="mm-a2a"><span class="num">08</span>A2A in Brief</h2>
  <p>MCP connects your agent to tools you control. But sometimes the other side is not a tool; it is another company's <em>agent</em>, with its own reasoning, which may take an hour and may need to ask you a question halfway. A travel company's booking agent is not a function you call; it's a colleague you brief. <strong>A2A (Agent2Agent)</strong>, an open protocol started by Google, standardises how agents discover each other, hand over tasks, and follow their progress.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hiring a CA firm for your tax filing. You find them through their visiting card (what they do, how to reach them), hand over a task, they work on it, sometimes call you ("send Form 16"), and finally deliver the return. You never see how they work inside.</p>
  </div>
  <p>Two pieces matter most. The <strong>Agent Card</strong> is that visiting card. The <strong>task lifecycle</strong> is a small state machine: a task can move from <code>working</code> to <code>input-required</code> and back, but a <code>completed</code> task cannot start working again.</p>
  <div class="fx" data-lang="py"># An Agent Card: what another team's agent publishes at a well-known URL (simplified)
card = {"name": "travel-booker", "url": "https://agents.example.com/travel",
        "skills": [{"id": "book_train", "description": "Book Indian Railways tickets"}],
        "capabilities": {"streaming": True}, "authentication": {"schemes": ["bearer"]}}
print("card:", card["name"], "| skills:", [s["id"] for s in card["skills"]],
      "| endpoint:", card["url"])

# A task's lifecycle: only some moves are legal
NEXT = {"submitted": {"working"},
        "working": {"input-required", "completed", "failed"},
        "input-required": {"working"},
        "completed": set(), "failed": set()}

def run(events, state="submitted"):
    path = [state]
    for new in events:
        if new not in NEXT[state]:
            return path + [f"ILLEGAL({new})"]
        state = new
        path.append(state)
    return path

print(" -&gt; ".join(run(["working", "input-required", "working", "completed"])))
print(" -&gt; ".join(run(["working", "completed", "working"])))</div>
  <p>The first run is a legal path: the remote agent needed input once, got it, and completed. The second run tried to move a completed task back to working, and the <code>NEXT</code> table rejected it. Your client code should enforce the same rules, so a buggy partner can't confuse your system.</p>
  <ul>
    <li><strong>Messages and artifacts</strong>: messages carry the conversation; artifacts are the outputs (files, data).</li>
    <li>Runs over HTTP with JSON-RPC and streaming, like MCP's remote transport.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>A2A</strong>: a protocol for an agent to call another, opaque agent. <strong>Agent Card</strong>: a JSON document at a well-known URL listing skills, endpoint and auth. MCP = agent ↔ tools; A2A = agent ↔ agent. They complement each other.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using A2A for your own internal tools. If you control both sides and it is a function call, MCP (or a plain tool) is simpler.</p>
  </div>

  <h2 id="mm-build"><span class="num">09</span>Build it: Researcher + Writer</h2>
  <p>Now a two-agent system with a real reason to split. Question: "should a 5-person startup use pgvector or a dedicated vector DB?" The <strong>researchers</strong> have a search tool and messy contexts full of raw results. The <strong>writer</strong> has no tools and sees only clean, sourced findings. Two researchers run in parallel on two sub-questions. Finally, plain code checks that every citation in the brief really came from a finding.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A news desk. Field reporters gather quotes, each with the source's name. The editor writes the article from their notes only. Before printing, a fact-checker confirms every quote has a named source in the notes.</p>
  </div>
  <div class="flow"><span>Question + sub-questions</span><span>Researchers (parallel, tools)</span><span>JSON findings</span><span>Writer (no tools)</span><span>Citation check</span><span>Brief</span></div>
  <div class="fx" data-lang="py"># research_team.py: researcher sub-agents (tools, own context) -&gt; writer agent (no tools)
import json, re
from concurrent.futures import ThreadPoolExecutor

MODEL = "claude-opus-5-5"
CORPUS = {   # stand-in for web search / your document store
    "pgv-1": "pgvector keeps embeddings next to relational data; one SQL query filters and ranks.",
    "pgv-3": "pgvector on a single Postgres node is comfortable up to a few million vectors.",
    "vdb-1": "Dedicated vector DBs such as Qdrant or Pinecone scale to billions of vectors.",
    "vdb-2": "A dedicated vector DB is one more system to deploy, secure and keep in sync.",
}

def search_notes(query: str) -&gt; str:
    """Keyword search over the research notes: top 2 by shared words."""
    words = set(re.findall(r"[a-z]+", query.lower()))
    scored = sorted(CORPUS.items(),
                    key=lambda kv: -len(words &amp; set(re.findall(r"[a-z]+", kv[1].lower()))))
    return "\\n".join(f"[{k}] {v}" for k, v in scored[:2])

SEARCH_TOOL = {"name": "search_notes", "strict": True,
               "description": "Search the research notes. Call it once per distinct sub-topic.",
               "input_schema": {"type": "object", "properties": {"query": {"type": "string"}},
                                "required": ["query"], "additionalProperties": False}}

FINDINGS = {"type": "json_schema", "schema": {
    "type": "object", "additionalProperties": False, "required": ["findings", "gaps"],
    "properties": {
        "findings": {"type": "array", "items": {
            "type": "object", "additionalProperties": False, "required": ["claim", "source"],
            "properties": {"claim": {"type": "string"}, "source": {"type": "string"}}}},
        "gaps": {"type": "array", "items": {"type": "string"}}}}}

def researcher(client, question: str, max_steps: int = 5) -&gt; dict:
    """Agent 1: searches in its OWN context; returns only compact findings."""
    messages = [{"role": "user", "content": f"Research this and report findings: {question}"}]
    for _ in range(max_steps):
        resp = client.messages.create(
            model=MODEL, max_tokens=16000, tools=[SEARCH_TOOL], messages=messages,
            system="You are a researcher. Use search_notes. Every claim needs a source id.",
            output_config={"format": FINDINGS})      # final answer = JSON findings
        if resp.stop_reason != "tool_use":
            return json.loads(next(b.text for b in resp.content if b.type == "text"))
        messages.append({"role": "assistant", "content": resp.content})
        messages.append({"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": b.id, "content": search_notes(**b.input)}
            for b in resp.content if b.type == "tool_use"]})
    return {"findings": [], "gaps": [f"step limit hit: {question}"]}

def writer(client, question: str, findings: list) -&gt; str:
    """Agent 2: no tools; sees only the findings, not the raw search results."""
    resp = client.messages.create(
        model=MODEL, max_tokens=16000,
        system="You write crisp 150-word briefs. Use ONLY the findings given. "
               "Cite each sentence with its source id like [pgv-1].",
        messages=[{"role": "user", "content":
                   f"Question: {question}\\n&lt;findings&gt;{json.dumps(findings)}&lt;/findings&gt;"}])
    return next(b.text for b in resp.content if b.type == "text")

def check_citations(brief: str, findings: list) -&gt; list:
    """Citations the writer invented (not in any finding)."""
    allowed = {f["source"] for f in findings}
    return [c for c in re.findall(r"\\[([\\w-]+)\\]", brief) if c not in allowed]

def research_team(client, question: str, sub_questions: list) -&gt; str:
    with ThreadPoolExecutor() as pool:                    # researchers run in parallel
        reports = list(pool.map(lambda q: researcher(client, q), sub_questions))
    findings = [f for r in reports for f in r["findings"]]
    brief = writer(client, question, findings)
    bad = check_citations(brief, findings)
    return brief if not bad else brief + f"\\n[unverified citations: {bad}]"</div>
  <p>Key lines. <code>output_config={"format": FINDINGS}</code> forces each researcher's final answer to be JSON matching the schema: a list of <code>{claim, source}</code>, so nothing is lost in a free-text hop. <code>writer</code> gets no <code>tools</code>, so injected text in search results can't make it act. <code>check_citations</code> finds every <code>[id]</code> in the brief and returns those not in any finding. Now a scripted run. The fake researcher really reads its search observation and builds findings from it; the fake writer cites two real sources and invents a third.</p>
  <div class="fx" data-lang="py">def play(req):
    msgs = req["messages"]
    if req["system"].startswith("You are a researcher"):
        if len(msgs) == 1:                                 # lap 1: search
            topic = msgs[0]["content"].split(": ", 1)[1]
            return [call("search_notes", query=topic)]
        hits = msgs[-1]["content"][0]["content"]           # lap 2: read the observation
        found = [{"claim": line.split("] ", 1)[1][:45], "source": line[1:6]}
                 for line in hits.splitlines()]
        return [text(json.dumps({"findings": found, "gaps": []}))]
    # the writer: cites two real sources and invents one
    return [text("Start with pgvector: one database [pgv-1], fine to a few million "
                 "vectors [pgv-3]. Move to a dedicated DB past that [vdb-9].")]

client = FakeClient(play)
print(research_team(client, "Should a 5-person startup use pgvector or a vector DB?",
                    ["pgvector strengths and limits", "dedicated vector DB trade-offs"]))
print("model calls:", len(client.calls), "(2 researchers x 2 laps + 1 writer)")
for q in ["pgvector strengths and limits", "dedicated vector DB trade-offs"]:
    print(f"search({q!r}) -&gt;", re.findall(r"\\[([\\w-]+)\\]", search_notes(q)))</div>
  <div class="fx" data-lang="text">Start with pgvector: one database [pgv-1], fine to a few million vectors [pgv-3]. Move to a dedicated DB past that [vdb-9].
[unverified citations: ['vdb-9']]
model calls: 5 (2 researchers x 2 laps + 1 writer)
search('pgvector strengths and limits') -&gt; ['pgv-1', 'pgv-3']
search('dedicated vector DB trade-offs') -&gt; ['vdb-2', 'vdb-1']</div>
  <p>The pipeline made 5 model calls: each researcher searched, read the results and returned JSON; then the writer wrote. The searches found <code>pgv-1</code>, <code>pgv-3</code>, <code>vdb-2</code>, <code>vdb-1</code>. The brief cited <code>[vdb-9]</code>, which no researcher ever found, and the code-level check flagged it. That is the most useful line in the whole system: it turns "the writer might hallucinate a source" into a test that fails.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Structured handoff</strong>: agents exchange schema-checked data, not free text. <strong>Least privilege</strong>: each agent gets only the tools it needs.</p>
  </div>
  <div class="callout pred"><span class="label">Extend it</span>
    <p>(1) Let a lead agent write the sub-questions via a <code>delegate</code> tool (section 02). (2) Add a critic that checks the brief against the findings. (3) Swap <code>search_notes</code> for an MCP server. Then measure: is the brief better than one agent with the same tool, and at what token cost?</p>
  </div>

  <h2 id="mm-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: splitting by job title</span>
    <p>Planner, coder, tester, reviewer agents for tightly coupled work. Split by independent sub-tasks or permission boundaries, never by org chart. Compare against a single-agent baseline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: briefs that assume shared memory</span>
    <p>"Continue from what we discussed" sent to a worker. The worker has a fresh context and knows nothing. Every brief must be self-contained.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: leaking worker scratch work</span>
    <p>Returning a worker's whole transcript to the lead. Return only the final, short answer, ideally as structured JSON.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no global budget</span>
    <p>Each agent has a step cap, but agents can keep delegating or transferring to each other. Add a total step, token or time budget for the whole run.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting MCP servers blindly</span>
    <p>Installing a random server gives its text direct access to your model's prompt. Use trusted sources, least privilege and approvals for writes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: testing only end to end</span>
    <p>A five-agent run that fails tells you little. Test each agent and the routing logic with scripted fakes (as in this note), then run end-to-end evaluations.</p>
  </div>

  <h2 id="mm-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Your manager wants a "planner, coder, tester, reviewer" multi-agent system for a coding assistant. What do you say?</summary><div class="qa-body">Start with one agent that can plan, edit and run tests. Coding sub-tasks share a lot of context and depend on each other, so splitting loses information and multiplies tokens. Add a separate agent only for a measured gap, e.g. an isolated reviewer with fresh context, and compare against the single-agent baseline on an eval set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does a multi-agent design clearly beat a single agent?</summary><div class="qa-body">Breadth-first tasks with independent parts and lots of raw material, like researching ten companies. Workers explore in parallel in their own contexts and return summaries, so the lead stays focused. It also helps when parts need different permissions, or are owned by different teams.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you implement a sub-agent with only the Messages API?</summary><div class="qa-body">Expose it to the lead as a tool (<code>delegate(task)</code>). When the lead calls it, run a fresh <code>messages.create</code> with only the task as context (optionally a cheaper model), and return its short answer as the <code>tool_result</code>. Several calls in one turn run in parallel; all results go back in one user message.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Supervisor vs handoff: what's the difference?</summary><div class="qa-body">A supervisor stays in control: each worker returns to it, and it picks the next step. In a handoff, control moves permanently: the new agent talks to the user and the previous one is out of the loop. Supervisor = manager; handoff = call transfer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is a critic agent useful, and when is it wasted?</summary><div class="qa-body">Useful when it has information the writer lacked: tests, a rubric, retrieved sources, or a different model. Wasted when it is the same model re-reading the same draft; it tends to agree. Measure how often it rejects drafts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does MCP solve? Explain N×M.</summary><div class="qa-body">Without a standard, each of N AI apps writes a custom connector for each of M tools: N×M integrations. With MCP each app implements one client and each tool ships one server: N+M. Any MCP host can use any MCP server.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Host, client, server: who does what?</summary><div class="qa-body">The host is the user-facing AI app; it owns the LLM and consent. Inside it, one client per server keeps a connection. The server exposes tools, resources and prompts and talks to the real system. Messages are JSON-RPC 2.0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Tools vs resources vs prompts in MCP?</summary><div class="qa-body">Tools are actions the <em>model</em> chooses to call. Resources are read-only data by URI that the <em>application</em> chooses to load. Prompts are reusable templates the <em>user</em> picks (often slash commands).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What actually goes over the wire in a stdio MCP session?</summary><div class="qa-body">JSON-RPC 2.0 objects, one per line, on the server's stdin/stdout: <code>initialize</code> (versions and capabilities), the <code>notifications/initialized</code> notification, then requests like <code>tools/list</code> and <code>tools/call</code>, each answered with a reply carrying the same <code>id</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the minimal MCP server that exposes an <code>add(a, b)</code> tool.</summary><div class="qa-body"><code>mcp = MCPServer("calc")</code> (from <code>mcp.server.mcpserver</code>; 1.x: <code>FastMCP</code>), then <code>@mcp.tool()</code> on <code>def add(a: int, b: int) -&gt; int</code> with a docstring, and <code>mcp.run()</code> under <code>if __name__ == "__main__"</code>. The schema comes from the type hints.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>MCP vs A2A?</summary><div class="qa-body">MCP connects an agent to tools and data it directly controls. A2A connects an agent to another, opaque agent (often another team's service) with its own reasoning, long-running tasks and requests for input. An A2A agent may use MCP tools internally.</div></details>
</main>
`
});
