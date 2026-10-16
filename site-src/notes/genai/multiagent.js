// notes/genai/multiagent.js — Multi-Agent Systems & MCP
Object.assign(TOPIC_CONTENT, {
  "multiagent": `<main>
  <h1>Multi-Agent Systems &amp; MCP</h1>
  <p class="lead">You can build one agent (09) and wire it as a graph (11). This note covers splitting work across several agents, and MCP, the standard plug that connects any agent to any tool. Next: proving it works (13 · Evaluation) and shipping it safely (14).</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mm-when"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When Multi-Agent Helps</span><span class="rm-sub">Usually it doesn't. The rule.</span></div></div>
      <div class="rm-item rm-done" data-target="mm-orch"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Orchestrator-Workers</span><span class="rm-sub">Sub-agents as tools</span></div></div>
      <div class="rm-item rm-done" data-target="mm-sup"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Supervisor in LangGraph</span><span class="rm-sub">A router node plus workers</span></div></div>
      <div class="rm-item rm-done" data-target="mm-hand"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Handoffs</span><span class="rm-sub">Pass the conversation along</span></div></div>
      <div class="rm-item rm-done" data-target="mm-fail"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Critics, Debate &amp; Failures</span><span class="rm-sub">What goes wrong, and fixes</span></div></div>
      <div class="rm-item rm-done" data-target="mm-mcp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">MCP: Why &amp; How</span><span class="rm-sub">N×M becomes N+M</span></div></div>
      <div class="rm-item rm-done" data-target="mm-mcpsrv"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">MCP: Build &amp; Connect</span><span class="rm-sub">A real server in 25 lines</span></div></div>
      <div class="rm-item rm-done" data-target="mm-a2a"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">A2A in Brief</span><span class="rm-sub">Agents talking to agents</span></div></div>
      <div class="rm-item rm-done" data-target="mm-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Build it</span><span class="rm-sub">Researcher + writer team</span></div></div>
      <div class="rm-item rm-done" data-target="mm-rev"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 9 lines</span></div></div>
      <div class="rm-item rm-done" data-target="mm-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mm-when"><span class="num">01</span>When Multi-Agent Helps</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>multi-agent system</strong> is several LLM agents, each with its own prompt, tools and context window, cooperating on one task. Your code (or one agent) decides who works when.</p>
  </div>
  <p>Be honest about the cost first. Every agent re-reads its own instructions and context, so tokens multiply. Anthropic reported its multi-agent research system used about <strong>15× the tokens of a chat</strong> (a single agent: about 4×).</p>
  <table class="tbl">
    <tr><th>What you add</th><th>What it costs</th></tr>
    <tr><td>More agents</td><td>More tokens, more latency, more prompts to maintain</td></tr>
    <tr><td>Messages between agents</td><td>Information lost or distorted at every hop</td></tr>
    <tr><td>More moving parts</td><td>Harder to debug: which agent made the bad call?</td></tr>
  </table>
  <h3>The one real benefit: context isolation</h3>
  <p>A worker can read 50 pages in <em>its own</em> context window and return a 150-word summary. The lead agent never sees the 50 pages. That keeps the lead's context small and focused, and lets workers run in parallel.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A manager sends three analysts to research three markets. Each reads hundreds of pages; the manager reads three one-page memos. It breaks when the tasks are tightly linked: three people writing three chapters of one plot, without talking, produce a mess.</p>
  </div>
  <div class="callout intu"><span class="label">Decision rule</span>
    <p>Start with <strong>one agent</strong> (or a fixed workflow, see 08 · Agent Fundamentals). Split into several agents only if at least one is true:</p>
    <ol>
      <li><strong>Breadth:</strong> the work splits into <em>independent</em> sub-tasks whose raw material would overflow or pollute one context.</li>
      <li><strong>Separation:</strong> parts need different tools or permissions you want walled off (a reader must never hold the "send payment" tool).</li>
      <li><strong>Ownership:</strong> different teams build and run the agents, possibly as separate services.</li>
    </ol>
    <p>And the task is valuable enough to pay several times the tokens. If sub-tasks depend heavily on each other (most coding), stay with one agent.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Planner agent, coder agent, tester agent, reviewer agent" because it looks like an org chart. Role-play does not make a model smarter. If one agent with the same tools can do it, the extra agents only add hops.</p>
  </div>

  <h2 id="mm-orch"><span class="num">02</span>Orchestrator-Workers</h2>
  <p>A <strong>lead</strong> agent breaks the goal into sub-tasks and delegates each to a <strong>worker</strong> with a fresh context. The cleanest way: expose "call a worker" to the lead as an ordinary <strong>tool</strong>. The lead never knows the tool is another agent.</p>
  <div class="flow"><span>Goal</span><span>Lead plans</span><span>delegate() × N (parallel)</span><span>Workers return summaries</span><span>Lead merges</span></div>
  <div class="fx" data-lang="py">import anthropic
from concurrent.futures import ThreadPoolExecutor

client = anthropic.Anthropic()

def run_subagent(task: str) -&gt; str:
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

def lead_agent(goal: str, max_steps: int = 8) -&gt; str:
    messages = [{"role": "user", "content": goal}]
    for _ in range(max_steps):
        resp = client.messages.create(
            model="claude-opus-5-5", max_tokens=8192, tools=[DELEGATE], messages=messages,
            system="You are a lead. Split the goal into independent sub-tasks, delegate "
                   "them, then merge the results into one answer.")
        messages.append({"role": "assistant", "content": resp.content})
        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")
        calls = [b for b in resp.content if b.type == "tool_use"]
        with ThreadPoolExecutor() as pool:             # parallel workers
            outputs = list(pool.map(lambda b: run_subagent(b.input["task"]), calls))
        messages.append({"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": b.id, "content": out}
            for b, out in zip(calls, outputs)]})
    return "Stopped: step limit reached."</div>
  <ul>
    <li>It is the normal tool loop from 05 · LLM APIs. Only the tool's body is special.</li>
    <li>Several <code>tool_use</code> blocks in one turn = independent sub-tasks, so run them in parallel. All results go back in <strong>one</strong> user message.</li>
    <li>Workers can use a cheaper model (<code>claude-sonnet-5-5</code>); the lead does the hard reasoning.</li>
    <li>The task string is the worker's <em>entire</em> world. Make the lead write self-contained tasks: goal, scope, output format, what to skip.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Vague delegation ("research AI chips") makes workers duplicate each other or miss things. Tell the lead in its system prompt to give each worker a distinct scope and a required output shape.</p>
  </div>

  <h2 id="mm-sup"><span class="num">03</span>Supervisor in LangGraph</h2>
  <p>Same idea expressed as a graph (11 · LangGraph): a <strong>supervisor</strong> node picks the next worker; each worker node runs, writes its result to shared state, and returns control.</p>
  <div class="flow"><span>START</span><span>supervisor</span><span>researcher or writer</span><span>back to supervisor</span><span>FINISH → END</span></div>
  <div class="fx" data-lang="py">from typing import Literal
from pydantic import BaseModel
from langchain.agents import create_agent
from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.types import Command
from research_team import search_notes      # a plain function works as a tool

llm = ChatAnthropic(model="claude-opus-5-5")

researcher = create_agent(llm, tools=[search_notes], name="researcher",
                          system_prompt="Research the question. Cite sources.")
writer = create_agent(llm, tools=[], name="writer",
                      system_prompt="Write a short brief from the research in the chat.")

class Route(BaseModel):
    next: Literal["researcher", "writer", "FINISH"]

router = llm.with_structured_output(Route, method="json_schema")
SUPERVISOR = ("You manage a researcher and a writer. Pick who acts next. "
              "Research first, then writing, then FINISH.")

def supervisor(state: MessagesState) -&gt; Command[Literal["researcher", "writer", "__end__"]]:
    choice = router.invoke([{"role": "system", "content": SUPERVISOR}] + state["messages"])
    return Command(goto=END if choice.next == "FINISH" else choice.next)

def make_worker(agent, name):
    def node(state: MessagesState) -&gt; Command[Literal["supervisor"]]:
        out = agent.invoke({"messages": state["messages"]})
        last = out["messages"][-1]                     # only the final message goes back
        return Command(update={"messages": [{"role": "assistant", "content": last.content,
                                             "name": name}]}, goto="supervisor")
    return node

builder = StateGraph(MessagesState)
builder.add_node("supervisor", supervisor)
builder.add_node("researcher", make_worker(researcher, "researcher"))
builder.add_node("writer", make_worker(writer, "writer"))
builder.add_edge(START, "supervisor")
graph = builder.compile()
# graph.invoke({"messages": [{"role": "user", "content": "pgvector or Pinecone for a startup?"}]})</div>
  <ul>
    <li><code>Command(goto=...)</code> lets a node choose the next node itself; no conditional-edge function needed.</li>
    <li>Workers return only their <strong>final</strong> message, not their whole tool trace: context isolation again.</li>
    <li><code>method="json_schema"</code> uses schema-enforced output for the routing decision (forced tool choice is rejected on <code>claude-opus-5-5</code>).</li>
    <li>Ready-made helpers exist (the <code>langgraph-supervisor</code> package), but this hand-written version shows the mechanics.</li>
  </ul>

  <h2 id="mm-hand"><span class="num">04</span>Handoffs</h2>
  <p>In a <strong>handoff</strong>, one agent passes the <em>whole conversation</em> to another, which then talks to the user directly. No manager stays in the loop. Called "swarm" style in some frameworks.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A call-centre transfer. Reception hears "refund" and puts you through to billing. Billing now owns the call; reception is gone.</p>
  </div>
  <div class="flow"><span>User</span><span>triage</span><span>transfer_to_billing()</span><span>billing answers</span><span>next turn starts at billing</span></div>
  <div class="fx" data-lang="py">import anthropic
client = anthropic.Anthropic()

def transfer(to):
    return {"name": f"transfer_to_{to}", "description": f"Hand the conversation to the {to} agent.",
            "input_schema": {"type": "object", "properties": {}}}

REFUND = {"name": "issue_refund", "description": "Refund an order.", "input_schema": {
    "type": "object", "properties": {"order_id": {"type": "string"}}, "required": ["order_id"]}}

AGENTS = {   # each agent = its own instructions + the tools it may use
    "triage":  {"system": "Route the user: billing questions -&gt; transfer_to_billing, "
                          "technical problems -&gt; transfer_to_tech.",
                "allowed": {"transfer_to_billing", "transfer_to_tech"}},
    "billing": {"system": "You handle refunds and invoices.",
                "allowed": {"issue_refund", "transfer_to_triage"}},
    "tech":    {"system": "You fix login and app problems.", "allowed": {"transfer_to_triage"}},
}
ALL_TOOLS = [transfer("billing"), transfer("tech"), transfer("triage"), REFUND]

def chat(messages, active="triage", max_steps=10):
    for _ in range(max_steps):
        agent = AGENTS[active]
        resp = client.messages.create(model="claude-opus-5-5", max_tokens=2048,
                                      system=agent["system"], tools=ALL_TOOLS, messages=messages)
        messages.append({"role": "assistant", "content": resp.content})
        if resp.stop_reason != "tool_use":
            return active, resp            # remember "active" for the user's next turn
        results = []
        for b in resp.content:
            if b.type != "tool_use":
                continue
            if b.name not in agent["allowed"]:
                out, err = f"{b.name} is not available to the {active} agent.", True
            elif b.name.startswith("transfer_to_"):
                active, out, err = b.name.removeprefix("transfer_to_"), "Transferred.", False
            else:
                out, err = f"Refund issued for {b.input['order_id']}.", False
            results.append({"type": "tool_result", "tool_use_id": b.id,
                            "content": out, "is_error": err})
        messages.append({"role": "user", "content": results})
    raise RuntimeError("too many steps")</div>
  <ul>
    <li>A handoff is just a tool whose effect is "switch <code>active</code>". The next model call uses the new agent's system prompt.</li>
    <li>Every call sends the same <code>ALL_TOOLS</code> list, and the harness enforces each agent's allow-list. This keeps old <code>tool_use</code> blocks in history valid and keeps the prompt cache warm.</li>
    <li>Store <code>active</code> with the session, so the user's next message goes to the agent that owns the conversation.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Ping-pong: triage sends to billing, billing sends back to triage, forever. Always cap steps, and make transfer descriptions say clearly when <em>not</em> to transfer.</p>
  </div>

  <h2 id="mm-fail"><span class="num">05</span>Critics, Debate &amp; Failures</h2>
  <div class="cards">
    <div><b>Critic / evaluator</b><p>One agent drafts, another grades against criteria, loop until pass. The evaluator-optimizer workflow from 08.</p><small>Use when you can state clear criteria</small></div>
    <div><b>Debate</b><p>Several agents answer independently, see each other's answers, revise; a judge picks.</p><small>Some gains on reasoning; costly</small></div>
    <div><b>Hierarchical</b><p>Supervisors of supervisors: teams of workers under team leads.</p><small>Only for very large tasks</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A critic that is the same model with no new information often just agrees. A critic helps most when it has something the writer lacked: a test result, a rubric, a retrieved source, or a different model.</p>
  </div>
  <h3>Why multi-agent systems fail</h3>
  <table class="tbl">
    <tr><th>Failure</th><th>Looks like</th><th>Fix</th></tr>
    <tr><td>Lossy handoff</td><td>Worker misses a constraint the user stated</td><td>Self-contained task briefs; pass key constraints explicitly</td></tr>
    <tr><td>Duplicate work</td><td>Two workers search the same thing</td><td>Lead assigns distinct scopes</td></tr>
    <tr><td>Conflicting outputs</td><td>Workers make incompatible choices</td><td>Don't split tightly coupled work; one agent owns the final merge</td></tr>
    <tr><td>Runaway loops / cost</td><td>Agents keep delegating or transferring</td><td>Step caps, token budgets per run, timeouts</td></tr>
    <tr><td>Errors compound</td><td>A worker's wrong "fact" becomes the lead's premise</td><td>Workers cite sources; verify citations in code</td></tr>
  </table>

  <h2 id="mm-mcp"><span class="num">06</span>MCP: Why &amp; How</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>Model Context Protocol (MCP)</strong> is an open standard for connecting AI applications to tools and data. A tool is written once as an <strong>MCP server</strong>; any MCP-capable app can use it.</p>
  </div>
  <p>Without it, every app writes its own connector for every system: 5 apps × 20 systems = <strong>100 integrations</strong>. With MCP each app speaks MCP once and each system ships one server: 5 + 20 = <strong>25</strong>. That's N×M → N+M.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>USB-C. Laptops don't need a special port per device; devices don't need a cable per laptop. Where it breaks: a USB device can't trick your laptop with words, but an MCP server's tool descriptions go straight into the model's prompt.</p>
  </div>
  <h3>Architecture</h3>
  <div class="flow"><span>Host (Claude Desktop, Claude Code, your app)</span><span>MCP client (one per server)</span><span>MCP server</span><span>GitHub / DB / files / API</span></div>
  <ul>
    <li><strong>Host</strong>: the AI application the user runs. It owns the LLM, the UI and user consent.</li>
    <li><strong>Client</strong>: a connector inside the host; one client holds one connection to one server.</li>
    <li><strong>Server</strong>: a small program exposing capabilities. It does not need to know which LLM is used.</li>
    <li>Messages are <strong>JSON-RPC 2.0</strong>. Lifecycle: <code>initialize</code> (agree protocol version and capabilities) → requests like <code>tools/list</code>, <code>tools/call</code> → shutdown.</li>
  </ul>
  <h3>Primitives</h3>
  <table class="tbl">
    <tr><th>Primitive</th><th>Offered by</th><th>Who decides to use it</th><th>Example</th></tr>
    <tr><td><strong>Tools</strong></td><td>Server</td><td>The model</td><td><code>search_kb(query)</code>, <code>create_issue(...)</code></td></tr>
    <tr><td><strong>Resources</strong></td><td>Server</td><td>The app / user (read-only data by URI)</td><td><code>kb://policies/leave</code>, a file, a DB schema</td></tr>
    <tr><td><strong>Prompts</strong></td><td>Server</td><td>The user (templates, e.g. slash commands)</td><td>"Summarise this PR"</td></tr>
    <tr><td><strong>Sampling</strong></td><td>Client</td><td>Server asks the host's LLM for a completion</td><td>Server needs a summary but has no API key</td></tr>
    <tr><td><strong>Elicitation</strong></td><td>Client</td><td>Server asks the user for input mid-task</td><td>"Which repo did you mean?"</td></tr>
    <tr><td><strong>Roots</strong></td><td>Client</td><td>Host tells server which folders it may touch</td><td><code>file:///home/me/project</code></td></tr>
  </table>
  <h3>Transports</h3>
  <table class="tbl">
    <tr><th></th><th>stdio</th><th>Streamable HTTP</th></tr>
    <tr><td>How</td><td>Host starts the server as a subprocess; JSON-RPC over stdin/stdout</td><td>Server is a web service at one endpoint (e.g. <code>/mcp</code>); client POSTs, server can stream replies (SSE)</td></tr>
    <tr><td>Use for</td><td>Local tools: files, git, a local DB</td><td>Remote, shared, multi-user servers</td></tr>
    <tr><td>Auth</td><td>Inherits the user's machine permissions</td><td>OAuth 2.1 / tokens</td></tr>
  </table>
  <p>The older "HTTP + SSE" transport is deprecated; use Streamable HTTP for anything remote.</p>
  <div class="callout trap"><span class="label">Trap: MCP is not a security layer</span>
    <p>A malicious or compromised server can put instructions in tool descriptions or results ("tool poisoning"). Install servers only from sources you trust, give them least privilege, and keep human approval for risky actions (14 · Guardrails).</p>
  </div>

  <h2 id="mm-mcpsrv"><span class="num">07</span>MCP: Build &amp; Connect</h2>
  <p>The official Python SDK is <code>pip install "mcp[cli]"</code>. A server is a set of decorated functions; type hints and docstrings become the JSON schema and description.</p>
  <div class="fx" data-lang="py"># kb_server.py: a minimal MCP server exposing a tiny company knowledge base
from mcp.server.mcpserver import MCPServer

mcp = MCPServer("company-kb")

DOCS = {
    "leave": "Employees get 24 days of paid leave per year.",
    "expenses": "Expenses above 500 USD need manager approval.",
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
  <p><em>Version note:</em> this is <code>mcp</code> 2.x (<code>MCPServer</code>). Most tutorials show 1.x, <code>from mcp.server.fastmcp import FastMCP</code>, with the same decorators.</p>
  <p>Test it from a plain MCP client over stdio. This launches the server and calls the tool, with no LLM involved:</p>
  <div class="fx" data-lang="py">import asyncio, sys
from mcp import Client, StdioServerParameters

async def main():
    params = StdioServerParameters(command=sys.executable, args=["kb_server.py"])
    async with Client(params) as client:
        tools = await client.list_tools()
        print([t.name for t in tools.tools])
        res = await client.call_tool("search_kb", {"query": "expenses rules"})
        print(res.content[0].text)

asyncio.run(main())</div>
  <table class="tbl out"><caption>Output (real run)</caption>
    <tr><th>stdout</th></tr><tr><td>['search_kb']</td></tr><tr><td>Expenses above 500 USD need manager approval.</td></tr>
  </table>
  <h3>Three ways a host uses it</h3>
  <p><strong>1. An existing host.</strong> Claude Desktop reads a config like this (Claude Code: <code>claude mcp add company-kb -- python kb_server.py</code>):</p>
  <div class="fx" data-lang="js">{
  "mcpServers": {
    "company-kb": { "command": "python", "args": ["/path/to/kb_server.py"] }
  }
}</div>
  <p><strong>2. Your own host app.</strong> List the server's tools and hand them to Claude. The SDK's MCP helpers convert them, and the tool runner (09) calls them over the session:</p>
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
                model="claude-opus-5-5", max_tokens=4096,
                tools=[async_mcp_tool(t, session) for t in tools],
                messages=[{"role": "user", "content": "How many leave days do we get?"}])
            async for message in runner:                 # runner calls MCP tools for you
                for block in message.content:
                    if block.type == "text":
                        print(block.text)

asyncio.run(main())</div>
  <p><strong>3. A remote server, no client code.</strong> For a server on Streamable HTTP, the API's MCP connector makes the connection for you (beta):</p>
  <div class="fx" data-lang="py">import anthropic
client = anthropic.Anthropic()
response = client.beta.messages.create(
    model="claude-opus-5-5", max_tokens=2048,
    betas=["mcp-client-2025-11-20"],
    mcp_servers=[{"type": "url", "url": "https://kb.acme.example/mcp", "name": "company-kb"}],
    tools=[{"type": "mcp_toolset", "mcp_server_name": "company-kb"}],
    messages=[{"role": "user", "content": "What is our expense approval limit?"}],
)</div>
  <p>To serve over HTTP: <code>mcp.run(transport="streamable-http", port=8765)</code>; clients connect to <code>http://127.0.0.1:8765/mcp</code>.</p>

  <h2 id="mm-a2a"><span class="num">08</span>A2A in Brief</h2>
  <p><strong>A2A (Agent2Agent)</strong> is an open protocol, started by Google, for agents to call <em>other agents</em> across teams or companies. MCP connects an agent to tools; A2A connects an agent to another agent it can't see inside.</p>
  <ul>
    <li><strong>Agent Card</strong>: a JSON document at a well-known URL listing the agent's skills, endpoint and auth. Used for discovery.</li>
    <li><strong>Task</strong>: the unit of work, with a lifecycle (submitted → working → input-required → completed / failed); long tasks stream updates.</li>
    <li><strong>Messages and artifacts</strong>: messages carry the conversation; artifacts are the outputs (files, data).</li>
    <li>Runs over HTTP with JSON-RPC and SSE, like MCP's remote transport.</li>
  </ul>

  <h2 id="mm-build"><span class="num">09</span>Build it: Researcher + Writer</h2>
  <p>A two-agent system with a real reason to split. The <strong>researcher</strong> has a search tool and a messy context full of raw results. The <strong>writer</strong> has no tools and sees only clean, sourced findings. Two researchers run in parallel on sub-questions.</p>
  <div class="flow"><span>Question + sub-questions</span><span>Researchers (parallel, tools)</span><span>JSON findings</span><span>Writer (no tools)</span><span>Citation check</span><span>Brief</span></div>
  <div class="fx" data-lang="py"># research_team.py: researcher sub-agent (tools, own context) -&gt; writer agent (no tools)
import json, re
from concurrent.futures import ThreadPoolExecutor
import anthropic

client = anthropic.Anthropic()
MODEL = "claude-opus-5-5"

CORPUS = {   # stand-in for web search / your document store
    "pgv-1": "pgvector keeps embeddings next to relational data; one SQL query filters and ranks.",
    "pgv-3": "pgvector on a single Postgres node is comfortable up to a few million vectors.",
    "vdb-1": "Dedicated vector DBs such as Qdrant or Pinecone scale to billions of vectors.",
    "vdb-2": "A dedicated vector DB is one more system to deploy, secure and keep in sync.",
}

def search_notes(query: str) -&gt; str:
    """Keyword search over the research notes."""
    words = set(re.findall(r"[a-z]+", query.lower()))
    scored = sorted(CORPUS.items(),
                    key=lambda kv: -len(words &amp; set(re.findall(r"[a-z]+", kv[1].lower()))))
    return "\\n".join(f"[{k}] {v}" for k, v in scored[:3])

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

def researcher(question: str, max_steps: int = 5) -&gt; dict:
    """Agent 1: searches in its OWN context; returns only compact findings."""
    messages = [{"role": "user", "content": f"Research this and report findings: {question}"}]
    for _ in range(max_steps):
        resp = client.messages.create(
            model=MODEL, max_tokens=4096, tools=[SEARCH_TOOL], messages=messages,
            system="You are a researcher. Use search_notes. Every claim needs a source id.",
            output_config={"format": FINDINGS})      # final answer = JSON findings
        if resp.stop_reason != "tool_use":
            return json.loads(next(b.text for b in resp.content if b.type == "text"))
        messages.append({"role": "assistant", "content": resp.content})
        messages.append({"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": b.id, "content": search_notes(**b.input)}
            for b in resp.content if b.type == "tool_use"]})
    return {"findings": [], "gaps": [f"step limit hit: {question}"]}

def writer(question: str, findings: list) -&gt; str:
    """Agent 2: no tools; sees only the findings, not the raw search results."""
    resp = client.messages.create(
        model=MODEL, max_tokens=2048,
        system="You write crisp 150-word briefs. Use ONLY the findings given. "
               "Cite each sentence with its source id like [pgv-1].",
        messages=[{"role": "user", "content":
                   f"Question: {question}\\n&lt;findings&gt;{json.dumps(findings)}&lt;/findings&gt;"}])
    return next(b.text for b in resp.content if b.type == "text")

def check_citations(brief: str, findings: list) -&gt; list:
    """Citations the writer invented (not in any finding)."""
    allowed = {f["source"] for f in findings}
    return [c for c in re.findall(r"\\[([\\w-]+)\\]", brief) if c not in allowed]

def research_team(question: str, sub_questions: list) -&gt; str:
    with ThreadPoolExecutor() as pool:                    # researchers run in parallel
        reports = list(pool.map(researcher, sub_questions))
    findings = [f for r in reports for f in r["findings"]]
    brief = writer(question, findings)
    bad = check_citations(brief, findings)
    return brief if not bad else brief + f"\\n\\n[unverified citations: {bad}]"

if __name__ == "__main__":
    print(research_team("Should a 5-person startup use pgvector or a dedicated vector DB?",
                        ["pgvector strengths and limits", "dedicated vector DB trade-offs"]))</div>
  <ul>
    <li><strong>Structured handoff</strong>: the researcher's final answer is schema-enforced JSON (<code>output_config.format</code>), so nothing is lost in a free-text hop.</li>
    <li><strong>Least privilege</strong>: the writer has no tools, so injected text in search results can't make it act.</li>
    <li><strong>Verification in code</strong>: <code>check_citations</code> catches sources the writer invented.</li>
  </ul>
  <p>Tested offline: <code>check_citations("x [pgv-1]. y [vdb-9].", ...)</code> returns <code>['vdb-9']</code>; the full pipeline ran against a scripted fake client.</p>
  <div class="callout pred"><span class="label">Extend it</span>
    <p>(1) Let a lead agent write the sub-questions via a <code>delegate</code> tool (section 02). (2) Add a critic that checks the brief against the findings. (3) Swap <code>search_notes</code> for an MCP server. Then measure: is the brief better than one agent with the same tool, and at what token cost?</p>
  </div>

  <h2 id="mm-rev"><span class="num">10</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Default:</strong> one agent. Multi-agent costs several times the tokens and adds failure points.</li>
    <li><strong>Split only for</strong> independent breadth, permission separation, or separate ownership.</li>
    <li><strong>Real benefit:</strong> context isolation; workers read a lot, return a little, in parallel.</li>
    <li><strong>Orchestrator-workers:</strong> sub-agent = a tool; parallel tool calls = parallel workers.</li>
    <li><strong>Supervisor (LangGraph):</strong> router node + worker nodes, <code>Command(goto=...)</code>.</li>
    <li><strong>Handoff:</strong> a transfer tool switches the active agent; cap steps to avoid ping-pong.</li>
    <li><strong>MCP:</strong> host → client → server over JSON-RPC; N×M integrations become N+M.</li>
    <li><strong>MCP primitives:</strong> tools (model), resources (app), prompts (user); plus sampling, elicitation, roots. Transports: stdio (local), Streamable HTTP (remote).</li>
    <li><strong>A2A:</strong> agent-to-agent across owners: Agent Cards, tasks, artifacts.</li>
  </ol></div>

  <h2 id="mm-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Your manager wants a "planner, coder, tester, reviewer" multi-agent system for a coding assistant. What do you say?</summary><div class="qa-body">Start with one agent that can plan, edit and run tests. Coding sub-tasks share a lot of context and depend on each other, so splitting them loses information and multiplies tokens. Add a separate agent only for a measured gap, e.g. an isolated reviewer with fresh context, and compare against the single-agent baseline on an eval set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does a multi-agent design clearly beat a single agent?</summary><div class="qa-body">Breadth-first tasks with independent parts and lots of raw material, like researching ten companies. Workers explore in parallel in their own context windows and return summaries, so the lead stays focused. It also helps when parts need different permissions, or are owned by different teams.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Supervisor vs handoff: what's the difference?</summary><div class="qa-body">A supervisor stays in control: each worker returns to it, and it picks the next step. In a handoff, control moves permanently: the new agent talks to the user and the previous one is out of the loop. Supervisor = manager; handoff = call transfer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does MCP solve? Explain N×M.</summary><div class="qa-body">Without a standard, each of N AI apps writes a custom connector for each of M tools: N×M integrations. MCP is a shared protocol: each app implements an MCP client once and each tool ships one MCP server, so N+M. Any MCP host can use any MCP server.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Host, client, server: who does what?</summary><div class="qa-body">The host is the user-facing AI app (Claude Desktop, an IDE, your app); it owns the LLM and consent. Inside it, one client per server keeps a connection. The server exposes tools, resources and prompts and talks to the real system (DB, GitHub). Messages are JSON-RPC 2.0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Tools vs resources vs prompts in MCP?</summary><div class="qa-body">Tools are actions the <em>model</em> chooses to call. Resources are read-only data addressed by URI that the <em>application</em> chooses to load into context. Prompts are reusable templates the <em>user</em> picks (often as slash commands).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the minimal MCP server that exposes an <code>add(a, b)</code> tool.</summary><div class="qa-body"><div class="fx" data-lang="py">from mcp.server.mcpserver import MCPServer   # mcp 1.x: from mcp.server.fastmcp import FastMCP
mcp = MCPServer("calc")

@mcp.tool()
def add(a: int, b: int) -&gt; int:
    """Add two integers."""
    return a + b

if __name__ == "__main__":
    mcp.run()   # stdio</div></div></details>
  <details class="qa"><summary><span class="qmark">Q</span>MCP vs A2A?</summary><div class="qa-body">MCP connects an agent to tools and data it directly controls. A2A connects an agent to another, opaque agent (often another team's service) that has its own reasoning, long-running tasks and may ask for input. They complement each other: an A2A agent may use MCP tools internally.</div></details>
</main>`
});
