// notes/genai/multiagent.js — Multi-Agent Systems & MCP
Object.assign(TOPIC_CONTENT, {
  "multiagent": `<main>
<h1>Multi-Agent Systems &amp; MCP</h1>
  <div class="where"><span>Generative AI</span><span>Agents</span><span>Multi-Agent Systems &amp; MCP</span></div>
  <p class="lead">A multi-agent system is a group of LLM agents, each with its own instructions, tools and context, that cooperate on one job; MCP (the Model Context Protocol) is the open standard that lets any agent or AI app use tools written by someone else. Both matter because real products outgrow a single agent: more tools, more rules and more teams pile up, and you need ways to split the work and to share tools without rewriting every connector. They are also heavily oversold, so knowing when <em>not</em> to split is a favourite interview topic. Our running example continues from <a class="xref" data-note="agent_build">Build an Agent from Scratch</a> and <a class="xref" data-note="langgraph">LangGraph</a>: Biteful's support agent, which refunds Asha's order 101 (₹282, 50 minutes late), is now asked to run the whole support desk. We will split it into specialists, try the classic team shapes on Asha's two-problem message "Order 101 came 50 minutes late and the rider was rude", reproduce the ways teams fail, then share Biteful's order tools through a real MCP server. Every "model" below is a scripted stand-in, so no API key is needed; the data, ledger, loops, LangGraph graph, threads, validation and MCP server are all real code that was run.</p>

  <h2 id="ma-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Multi-Agent &amp; MCP</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why split</div>
        <ul>
          <li>One agent with many tools: more tokens per call, look-alike tools, every write in reach</li>
          <li>Split only for breadth, separation or ownership</li>
          <li>Teams cost several times more tokens</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How teams work</div>
        <ul>
          <li><b>Role</b> = prompt + allowed tools; <b>handoff</b> = a transfer tool</li>
          <li><b>Supervisor</b> (router decides), <b>swarm</b> (agents decide), <b>pipeline</b> (code decides)</li>
          <li><b>Orchestrator-workers</b>: parallel workers with fresh contexts</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Keeping teams correct</div>
        <ul>
          <li>Pass only final results, in a checked schema</li>
          <li>One owner per write; caps in the data layer</li>
          <li>Step budgets; critics that check real data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Protocols</div>
        <ul>
          <li><b>MCP</b>: host, client, server; tools, resources, prompts; JSON-RPC</li>
          <li>stdio for local servers, Streamable HTTP for remote</li>
          <li><b>A2A</b>: agent to agent; Agent Card + task lifecycle</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ma-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Split One Agent?</span><span class="rm-sub">what a crowded agent costs, measured</span></div></div>
      <div class="rm-item rm-done" data-target="ma-roles"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Roles and Handoffs</span><span class="rm-sub">what makes agents different, and how control moves</span></div></div>
      <div class="rm-item rm-done" data-target="ma-patterns"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Supervisor, Swarm and Pipeline</span><span class="rm-sub">three ways to decide who works next</span></div></div>
      <div class="rm-item rm-done" data-target="ma-parallel"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Parallel Workers</span><span class="rm-sub">orchestrator-workers and context isolation</span></div></div>
      <div class="rm-item rm-done" data-target="ma-state"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">What Crosses Between Agents</span><span class="rm-sub">shared state and structured briefs</span></div></div>
      <div class="rm-item rm-done" data-target="ma-fail"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Coordination Failures</span><span class="rm-sub">four team bugs, reproduced and fixed</span></div></div>
      <div class="rm-item rm-done" data-target="ma-mcp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">MCP: Sharing Tools</span><span class="rm-sub">why a standard, and how it is organised</span></div></div>
      <div class="rm-item rm-done" data-target="ma-mcpbuild"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Building an MCP Server</span><span class="rm-sub">a Biteful server, and the raw JSON-RPC</span></div></div>
      <div class="rm-item rm-done" data-target="ma-a2a"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">A2A: Agents Talking to Agents</span><span class="rm-sub">handing tasks to another company's agent</span></div></div>
      <div class="rm-item rm-done" data-target="ma-build"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">A Team That Helps</span><span class="rm-sub">the weekly complaints brief</span></div></div>
      <div class="rm-item rm-done" data-target="ma-overkill"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">When Multi-Agent Is Overkill</span><span class="rm-sub">the single-agent baseline</span></div></div>
      <div class="rm-item rm-done" data-target="ma-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">org charts, leaks, budgets</span></div></div>
      <div class="rm-item rm-done" data-target="ma-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">patterns, MCP, numbers, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="ma-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about agent teams and MCP</span></div></div>
    </div>
  </div>

  <h2 id="ma-why"><span class="num">01</span>Why Split One Agent?</h2>
  <p>Our agent handles late orders with three tools: look up an order, refund it, and message the customer. Now Biteful wants one agent for the entire support desk. That means many more tools (tracking riders, cancelling orders, changing addresses, coupons, wallets, menus, allergens) and several rulebooks (refunds, delivery, food safety) all in one system prompt. Before deciding whether to split, it helps to see concretely what gets worse as one agent grows. Here are the twelve tools a do-everything agent would carry, with the descriptions it would read, ten typical customer messages paired with the right tool, and the same twelve tools divided between three specialists:</p>
  <div class="fx" data-lang="py">import re

TOOLS = {   # 12 tools, as one "do-everything" support agent would see them
    "get_order":       "look up an order: restaurant, total, how late it was",
    "refund":          "refund the money for a late order to the customer",
    "notify":          "send the customer a message about their order",
    "track_rider":     "where is the rider now, live location and arrival time of the order",
    "cancel_order":    "cancel an order before the restaurant accepts it",
    "change_address":  "change the delivery address of an order",
    "apply_coupon":    "apply a coupon code to get money off an order",
    "report_missing":  "report a missing or wrong item in a delivered order, refund that item",
    "menu_search":     "search dishes on a restaurant menu",
    "allergen_info":   "allergens in a dish: nuts, milk, gluten",
    "wallet_balance":  "how much money is in the customer's Biteful wallet",
    "restaurant_hours":"when a restaurant opens and closes",
}
TEAMS = {   # the same 12 tools split into 3 specialists (4 tools each)
    "orders":   ["get_order", "refund", "notify", "report_missing"],
    "delivery": ["track_rider", "cancel_order", "change_address", "restaurant_hours"],
    "account":  ["apply_coupon", "wallet_balance", "menu_search", "allergen_info"],
}
WRITES = {"refund", "notify", "cancel_order", "change_address", "apply_coupon", "report_missing"}

STOP = {"the", "a", "an", "my", "is", "to", "of", "in", "for", "it", "i", "me", "and",
        "or", "was", "can", "you", "your", "their", "about", "how", "what", "order"}
def words(t):
    return {w.rstrip("s") for w in re.findall(r"[a-z]+", t.lower())} - STOP

def lookalikes(request, options):
    """Tools whose description matches the request almost as well as the best one
    (within one shared word): the candidates a chooser must tell apart. A crude,
    deterministic stand-in for 'how confusable are these tools for this request'."""
    score = {n: len(words(request) &amp; words(d)) for n, d in options.items()}
    best = max(score.values())
    return [n for n, s in score.items() if s &gt;= best - 1 and s &gt; 0]

REQUESTS = [  # (what the customer wrote, the right tool)
    ("Order 101 arrived 50 minutes late, I want my money back", "refund"),
    ("Where is the rider? My food is late", "track_rider"),
    ("The coffee was missing from order 101", "report_missing"),
    ("Is there any money left in my wallet?", "wallet_balance"),
    ("Please cancel my order, the restaurant hasn't accepted it", "cancel_order"),
    ("Does the masala dosa contain nuts?", "allergen_info"),
    ("I typed the wrong address for my delivery", "change_address"),
    ("My coupon BITE10 didn't take any money off", "apply_coupon"),
    ("How late was order 102?", "get_order"),
    ("When does Dosa Hut close tonight?", "restaurant_hours"),
]</div>
  <p>The function <code>lookalikes</code> needs a word of explanation. It is a crude, deterministic way of asking "how confusable are these tools for this message?": it returns the tools whose description shares almost as many words with the message as the best match does. A real model understands far more than shared words, but it faces the same pressure on every call: it must tell apart every tool description it was given. Now we measure three things that do not need a model at all: how many tokens the tool list costs on every call (estimated as characters divided by four), how many look-alike tools each request faces, and how many tools that <em>change</em> something (refund, cancel, change address and so on, called <strong>write tools</strong>) any message can reach:</p>
  <div class="fx" data-lang="py">import json
team_of = {t: team for team, names in TEAMS.items() for t in names}
def schema_tokens(names):          # what the tool list costs on EVERY model call
    schemas = [{"name": n, "description": TOOLS[n],
                "input_schema": {"type": "object", "properties": {"order_id": {"type": "integer"}}}}
               for n in names]
    return len(json.dumps(schemas)) // 4

flat = [len(lookalikes(r, TOOLS)) for r, _ in REQUESTS]
split = [len(lookalikes(r, {t: TOOLS[t] for t in TEAMS[team_of[want]]})) for r, want in REQUESTS]
print("example:", REQUESTS[0][0])
print("   look-alikes among 12:", lookalikes(REQUESTS[0][0], TOOLS))
print("   look-alikes in 'orders':", lookalikes(REQUESTS[0][0], {t: TOOLS[t] for t in TEAMS["orders"]}))
print(f"{'':22}{'one agent':&gt;11}{'specialist':&gt;12}")
print(f"{'tool schemas/call':22}{schema_tokens(TOOLS):&gt;8} tok{schema_tokens(TEAMS['orders']):&gt;9} tok")
print(f"{'look-alikes/request':22}{sum(flat) / 10:&gt;11.1f}{sum(split) / 10:&gt;12.1f}")
print(f"{'write tools in reach':22}{len(WRITES):&gt;11}{max(len(WRITES &amp; set(v)) for v in TEAMS.values()):&gt;12}")</div>
  <div class="fx" data-lang="text">example: Order 101 arrived 50 minutes late, I want my money back
   look-alikes among 12: ['get_order', 'refund', 'apply_coupon', 'wallet_balance']
   look-alikes in 'orders': ['get_order', 'refund']
                        one agent  specialist
tool schemas/call          531 tok      180 tok
look-alikes/request           2.3         1.5
write tools in reach            6           3</div>
  <p>Start with the example. For "Order 101 arrived 50 minutes late, I want my money back", four of the twelve tools look relevant: <code>get_order</code> and <code>refund</code>, which are right, and also <code>apply_coupon</code> and <code>wallet_balance</code>, because they talk about money too. Inside the orders specialist, only the two right ones remain. The table shows the general picture: the tool list alone costs about 531 tokens on <em>every</em> model call for the big agent against 180 for a specialist; requests face 2.3 look-alikes on average instead of 1.5; and any message at all, even "does the dosa contain nuts?", reaches an agent holding 6 write tools instead of at most 3. That last number matters for security: if a message contains a <strong>prompt injection</strong> (text crafted to trick the model into doing something it should not), the damage it can do is limited by the tools the agent holds. On top of these, rulebooks for different domains start to conflict in one prompt: "be generous with refunds" sits next to "never guess about allergens".</p>
  <p>Think of a small restaurant where one person takes orders, cooks, handles the till and deals with complaints. At five tables it works. At fifty, orders get mixed up, and the person any customer can talk to is also the person who can open the cash drawer. Bigger restaurants split into roles (host, kitchen, cashier) so each person has a narrow job and only the cashier touches money.</p>
  <p>That is the idea of a <strong>multi-agent system</strong>: several LLM agents, each with its own prompt, tools and context, cooperating on one job. Giving each agent a narrow role is called <strong>specialisation</strong>; each specialist sees fewer tools and one rulebook. But splitting is not free. It adds a routing decision, which can itself be wrong; it adds model calls; and every hand-over between agents can lose information. A real model with twelve well-described tools is often perfectly fine. So the right attitude is "split when there is a measured reason", and section 11 measures the price. First we need to know what an agent "role" actually is in code.</p>

  <h2 id="ma-roles"><span class="num">02</span>Roles and Handoffs</h2>
  <p>Suppose we split the desk into a triage agent that greets the customer, a refunds agent that can pay, and a delivery agent that files rider complaints. If all three use the same model, what makes them different agents? The answer is surprisingly small. A <strong>role</strong> is just two things: a system prompt (the instructions) and the set of tools that agent is allowed to use. Sometimes a role also has its own model, for example a cheaper one for triage.</p>
  <p>The second question is how a conversation moves from one role to another, so that the refunds agent ends up talking to Asha directly. The standard trick is that a <strong>handoff is a tool</strong>. Triage is given a tool called <code>transfer_to_refunds</code>, and the only effect of calling it is to change which role is <strong>active</strong>. On the next lap of the agent loop, the harness (your code that runs the loop) uses the new role's system prompt. Every call still sends the same full tool list, which keeps old tool calls in the history valid and lets the provider's prompt cache stay warm; the harness enforces each role's <strong>allow-list</strong>, refusing to run any tool the active role is not allowed to use.</p>
  <p>A bank's phone line works like this. The automated menu hears "card blocked" and transfers you to the cards team, who now own the call. However nicely you ask the menu, it cannot unblock your card, because it has no access to the card system.</p>
  <p>First, the shared pieces used throughout this page. <code>FakeClient</code> is a stand-in for the model API: it returns responses in the same shape as the Anthropic Messages API (content blocks with <code>type</code> "text" or "tool_use", and a <code>stop_reason</code>), and it records every call so we can count them. The scripted <code>play</code> function it is given can look at the system prompt to know which agent is speaking. Below it are Biteful's data and three real tools, plus a refund <code>LEDGER</code> and a complaints log, so we can always check what actually happened:</p>
  <div class="fx" data-lang="py">from types import SimpleNamespace as NS
import itertools, json, threading

_ids = itertools.count(1)
def text(t):          return NS(type="text", text=t)
def call(name, **a):  return NS(type="tool_use", id=f"toolu_{next(_ids):02d}", name=name, input=a)

class FakeClient:
    """STAND-IN for the model API (same response shape). play(request) returns the
    content blocks for one turn; it can look at the system prompt to know WHO is speaking."""
    def __init__(self, play):
        self.play, self.calls = play, []
        self.lock = threading.Lock()
        self.messages = NS(create=self._create)
    def _create(self, **request):
        with self.lock:                                   # workers may call from threads
            self.calls.append(request.get("system", "")[:12])
        content = self.play(request)
        stop = "tool_use" if any(b.type == "tool_use" for b in content) else "end_turn"
        return NS(content=content, stop_reason=stop)

# Biteful's real data and tools (shared by every agent in this note)
ORDERS = {101: {"customer": "asha", "total": 282, "minutes_late": 50, "items": ["dosa", "dosa", "coffee"]},
          103: {"customer": "asha", "total": 1250, "minutes_late": 70, "items": ["biryani"]}}
LEDGER, COMPLAINTS = [], []                  # refunds made; complaints filed
def get_order(order_id):
    return json.dumps({"order_id": order_id, **ORDERS[order_id]})
def refund(order_id, amount, reason="late", to="UPI"):
    LEDGER.append((order_id, amount, reason, to))
    return f"Refunded Rs {amount} for {order_id} ({reason}) to {to}."
def file_complaint(order_id, about):
    COMPLAINTS.append((order_id, about))
    return f"Complaint C-{len(COMPLAINTS)} filed about the {about} on order {order_id}."</div>
  <p>Now the roles and the loop. <code>AGENTS</code> defines each role as a system prompt plus an allowed set of tool names. <code>chat</code> is the ordinary agent loop from Build an Agent from Scratch with two additions: before running a tool it checks the active role's allow-list, and when the tool is a transfer it changes <code>active</code> instead of calling a function. To show that the allow-list matters, triage is scripted to misbehave first: it tries to refund directly, which its prompt forbids.</p>
  <div class="fx" data-lang="py">def transfer(to):
    return {"name": f"transfer_to_{to}", "description": f"Hand the conversation to the {to} agent.",
            "input_schema": {"type": "object", "properties": {}}}

ORDER_TOOLS = [
    {"name": "get_order", "description": "Look up an order.", "input_schema": {
        "type": "object", "properties": {"order_id": {"type": "integer"}}, "required": ["order_id"]}},
    {"name": "refund", "description": "Refund an order.", "input_schema": {
        "type": "object", "properties": {"order_id": {"type": "integer"},
                                         "amount": {"type": "integer"}}, "required": ["order_id", "amount"]}},
    {"name": "file_complaint", "description": "Log a complaint about a rider or restaurant.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "integer"},
                                                       "about": {"type": "string"}}}}]

AGENTS = {   # a ROLE = its own instructions + the tools it may use
    "triage":   {"system": "Triage: late orders and refunds -&gt; transfer_to_refunds; "
                           "rider or delivery problems -&gt; transfer_to_delivery. Never act yourself.",
                 "allowed": {"transfer_to_refunds", "transfer_to_delivery"}},
    "refunds":  {"system": "Refunds: look up the order, refund late orders (&gt; 45 min) in full.",
                 "allowed": {"get_order", "refund", "transfer_to_delivery", "transfer_to_triage"}},
    "delivery": {"system": "Delivery: rider and delivery problems; file complaints.",
                 "allowed": {"file_complaint", "transfer_to_refunds", "transfer_to_triage"}},
}
ALL_TOOLS = [transfer("refunds"), transfer("delivery"), transfer("triage")] + ORDER_TOOLS
RUN = {"get_order": get_order, "refund": refund, "file_complaint": file_complaint}

def chat(client, messages, active="triage", max_steps=10):
    for _ in range(max_steps):
        name, agent = active, AGENTS[active]          # who is speaking this lap
        resp = client.messages.create(model="claude-opus-5-5", max_tokens=1024,
                                      system=agent["system"], tools=ALL_TOOLS, messages=messages)
        messages.append({"role": "assistant", "content": resp.content})
        if resp.stop_reason != "tool_use":
            return active, resp            # remember "active" for the customer's next turn
        results = []
        for b in resp.content:
            if b.type != "tool_use":
                continue
            if b.name not in agent["allowed"]:
                out, err = f"{b.name} is not available to the {name} agent.", True
            elif b.name.startswith("transfer_to_"):
                active, out, err = b.name.removeprefix("transfer_to_"), "Transferred.", False
            else:
                out, err = RUN[b.name](**b.input), False
            print(f"  [{name:7}] {b.name:19} -&gt; {out[:50]}")
            results.append({"type": "tool_result", "tool_use_id": b.id, "content": out, "is_error": err})
        messages.append({"role": "user", "content": results})
    raise RuntimeError("too many steps")

script = {   # what each role "says", in order (a STAND-IN for three prompted model calls)
    "triage":  [[call("refund", order_id=101, amount=282)],           # not allowed for triage
                [call("transfer_to_refunds")]],
    "refunds": [[call("get_order", order_id=101)],
                [call("refund", order_id=101, amount=282)],
                [text("Done: Rs 282 refunded for order 101 (50 minutes late).")]],
}
def play(req):
    who = next(k for k, v in AGENTS.items() if v["system"] == req["system"])
    return script[who].pop(0)

LEDGER.clear()
msgs = [{"role": "user", "content": "Order 101 came 50 minutes late. I want my money back."}]
active, resp = chat(FakeClient(play), msgs)
print("reply :", resp.content[0].text)
print("active:", active, "| messages:", len(msgs), "| ledger:", LEDGER)</div>
  <div class="fx" data-lang="text">  [triage ] refund              -&gt; refund is not available to the triage agent.
  [triage ] transfer_to_refunds -&gt; Transferred.
  [refunds] get_order           -&gt; {"order_id": 101, "customer": "asha", "total": 282
  [refunds] refund              -&gt; Refunded Rs 282 for 101 (late) to UPI.
reply : Done: Rs 282 refunded for order 101 (50 minutes late).
active: refunds | messages: 10 | ledger: [(101, 282, 'late', 'UPI')]</div>
  <p>Follow the printed lines. In line 1 triage asked for <code>refund</code>; the check <code>b.name not in agent["allowed"]</code> caught it, and instead of running the refund the harness returned an error result to the model. In line 2 triage called the transfer tool, so <code>active</code> became <code>"refunds"</code>. On the next laps the refunds prompt was used: it looked up order 101 and paid ₹282, and the ledger shows exactly one refund. The function returns <code>active="refunds"</code> so the app can store it with the session, and Asha's next message goes straight to the refunds agent.</p>
  <p>The most important lesson is in line 1. The triage prompt said "Never act yourself", and triage tried anyway. Prompts are advice; only code is a boundary. A role's limits are real only if the harness enforces them.</p>

  <h2 id="ma-patterns"><span class="num">03</span>Supervisor, Swarm and Pipeline</h2>
  <p>Asha's second message has two problems: "Order 101 came 50 minutes late and the rider was rude. I want my money back." It needs a refund <em>and</em> a rider complaint. Someone must decide that both specialists work, in what order, and who writes the final reply. There are three classic answers to "who decides what runs next?", and we will run all three on this exact message. All three end in the same world state, one refund of ₹282 and one rider complaint, so the only differences are how control flows and what it costs.</p>
  <p>In the <strong>supervisor</strong> pattern, a central routing agent decides which worker runs next, and every worker hands control back to it when done. In the <strong>swarm</strong> pattern (also called the handoff pattern), there is no manager: each agent does its part and transfers directly to the next agent it thinks should continue. In a <strong>pipeline</strong>, your code fixes the stages and their order in advance. A newspaper is a good picture of the first: every story passes through the editor's desk, and the editor decides who works on it next. A hospital visit is like the second: the nurse sends you to the doctor, who sends you to radiology, with no central desk. An assembly line is the third: the stations and their order never change.</p>
  <p>We build the supervisor with LangGraph, because its <code>Command</code> object lets a node update the state <em>and</em> choose the next node in one return value. The supervisor node asks a router which worker should run; each worker node runs its agent, writes only its <em>final</em> message into the shared state, and sends control back to the supervisor. The graph-building function receives the router and workers as arguments, so we can pass stand-ins here; in production the router would be <code>llm.with_structured_output(Route)</code> (a model forced to answer with a <code>Route</code> object) and each worker a full agent built with <code>create_agent</code>. Our stand-in workers run the real tools and count model calls the way a real tool-using worker would make them: one per tool call plus one for the answer.</p>
  <div class="fx" data-lang="py">from typing import Literal
from pydantic import BaseModel
from langchain_core.messages import AIMessage
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.types import Command

TWO_PROBLEMS = "Order 101 came 50 minutes late and the rider was rude. I want my money back."

class Route(BaseModel):                       # the supervisor's only output
    next: Literal["refunds", "delivery", "writer", "FINISH"]

def build_supervisor_graph(router, workers):
    def supervisor(state: MessagesState) -&gt; Command[Literal["refunds", "delivery", "writer", "__end__"]]:
        choice = router.invoke(state["messages"])
        return Command(goto=END if choice.next == "FINISH" else choice.next)
    def make_worker(agent, name):
        def node(state: MessagesState) -&gt; Command[Literal["supervisor"]]:
            out = agent.invoke({"messages": state["messages"]})
            last = out["messages"][-1]                     # ONLY the final message goes back
            return Command(update={"messages": [AIMessage(last.content, name=name)]},
                           goto="supervisor")
        return node
    g = StateGraph(MessagesState)
    g.add_node("supervisor", supervisor)
    for name, agent in workers.items():
        g.add_node(name, make_worker(agent, name))
    g.add_edge(START, "supervisor")
    return g.compile()

class ScriptedRouter:                          # STAND-IN for the supervisor LLM
    def __init__(self, picks): self.picks, self.calls = list(picks), 0
    def invoke(self, messages):
        self.calls += 1
        pick = self.picks.pop(0)
        print(f"supervisor saw {len(messages)} msgs -&gt; {pick}")
        return Route(next=pick)

class Worker:                                  # STAND-IN for a whole sub-agent
    def __init__(self, act):  self.act, self.model_calls = act, 0
    def invoke(self, state):
        final, tool_calls = self.act(state["messages"])          # REAL tools run in here
        self.model_calls += tool_calls + 1                       # a ReAct worker: one per tool + answer
        scratch = [AIMessage("(tool calls, raw results ...)")] * (2 * tool_calls)
        return {"messages": state["messages"] + scratch + [AIMessage(final)]}

def refunds_act(msgs):
    o = json.loads(get_order(101))
    return refund(101, o["total"]), 2                            # 2 tool calls
def delivery_act(msgs):
    return file_complaint(101, "rider"), 1
def writer_act(msgs):                                            # reads the workers' results
    done = " ".join(m.content for m in msgs if getattr(m, "name", None) in ("refunds", "delivery"))
    return f"Sorry, Asha! {done}", 0

LEDGER.clear(); COMPLAINTS.clear()
router = ScriptedRouter(["refunds", "delivery", "writer", "FINISH"])
workers = {"refunds": Worker(refunds_act), "delivery": Worker(delivery_act), "writer": Worker(writer_act)}
final = build_supervisor_graph(router, workers).invoke({"messages": [("user", TWO_PROBLEMS)]})
for m in final["messages"]:
    print(f"  {m.type:5} {m.name or '':9} {m.content[:70]}")
RESULTS = {"supervisor": (LEDGER.copy(), COMPLAINTS.copy())}
sup_calls = router.calls + sum(w.model_calls for w in workers.values())
print("model calls:", router.calls, "supervisor +", sum(w.model_calls for w in workers.values()),
      "worker =", sup_calls, "| ledger:", LEDGER, "| complaints:", COMPLAINTS)</div>
  <div class="fx" data-lang="text">supervisor saw 1 msgs -&gt; refunds
supervisor saw 2 msgs -&gt; delivery
supervisor saw 3 msgs -&gt; writer
supervisor saw 4 msgs -&gt; FINISH
  human           Order 101 came 50 minutes late and the rider was rude. I want my money
  ai    refunds   Refunded Rs 282 for 101 (late) to UPI.
  ai    delivery  Complaint C-1 filed about the rider on order 101.
  ai    writer    Sorry, Asha! Refunded Rs 282 for 101 (late) to UPI. Complaint C-1 file
model calls: 4 supervisor + 6 worker = 10 | ledger: [(101, 282, 'late', 'UPI')] | complaints: [(101, 'rider')]</div>
  <p>The supervisor ran four times and saw 1, 2, 3 and then 4 messages: the customer's message plus one final message per finished worker. That count is deliberate. Inside each worker there was tool chatter (requests and raw results, stood in for by the <code>scratch</code> messages), but only the final line was returned, so the supervisor's context stayed short. The writer then read the two workers' results from shared state and composed the reply. Total model calls: 4 for routing plus 6 inside the workers (refunds made 2 tool calls and an answer, delivery 1 and an answer, the writer just 1), giving <strong>10</strong>.</p>
  <p>The swarm reuses the <code>chat</code> loop and transfer tools from section 02. This time the refunds agent, after paying, notices the rider complaint and transfers to delivery itself:</p>
  <div class="fx" data-lang="py">LEDGER.clear(); COMPLAINTS.clear()
script = {
    "triage":   [[call("transfer_to_refunds")]],
    "refunds":  [[call("get_order", order_id=101)],
                 [call("refund", order_id=101, amount=282)],
                 [text("Rs 282 refunded. Passing you to delivery about the rider."),
                  call("transfer_to_delivery")]],                      # peer-to-peer handoff
    "delivery": [[call("file_complaint", order_id=101, about="rider")],
                 [text("Sorry, Asha! Rs 282 is refunded for order 101, and we've filed "
                       "a complaint about the rider.")]],
}
client = FakeClient(play)
active, resp = chat(client, [{"role": "user", "content": TWO_PROBLEMS}])
print("reply:", resp.content[-1].text)
swarm_calls = len(client.calls)
RESULTS["swarm"] = (LEDGER.copy(), COMPLAINTS.copy())
print("model calls:", swarm_calls, "| ends with:", active, "| ledger:", LEDGER, "| complaints:", COMPLAINTS)</div>
  <div class="fx" data-lang="text">  [triage ] transfer_to_refunds -&gt; Transferred.
  [refunds] get_order           -&gt; {"order_id": 101, "customer": "asha", "total": 282
  [refunds] refund              -&gt; Refunded Rs 282 for 101 (late) to UPI.
  [refunds] transfer_to_delivery -&gt; Transferred.
  [delivery] file_complaint      -&gt; Complaint C-1 filed about the rider on order 101.
reply: Sorry, Asha! Rs 282 is refunded for order 101, and we've filed a complaint about the rider.
model calls: 6 | ends with: delivery | ledger: [(101, 282, 'late', 'UPI')] | complaints: [(101, 'rider')]</div>
  <p>The path was triage → refunds (look up, pay) → delivery (file the complaint, answer Asha), using <strong>6</strong> model calls, and the conversation ends with delivery active. It is cheaper than the supervisor because nobody re-reads the overall situation after every step. The flip side is that nobody owns the overall plan either: if refunds had forgotten about the rider, no one would have noticed.</p>
  <p>When the stages are always the same (classify the problems, resolve each one, draft a reply, check it), code can simply fix the order. Each stage below stands in for one prompted model call, and the final check is plain code, not a model:</p>
  <div class="fx" data-lang="py"># Pipeline: a FIXED sequence of stages. Each stage stands in for one prompted model call.
def classify(msg):                                   # stage 1: what problems are there?
    issues = []
    if "late" in msg:  issues.append(("late", 101))
    if "rider" in msg: issues.append(("rider", 101))
    return issues
RESOLVERS = {                                        # stage 2: one specialist per issue type
    "late":  lambda oid: refund(oid, json.loads(get_order(oid))["total"]),
    "rider": lambda oid: file_complaint(oid, "rider"),
}
def draft(results):                                  # stage 3: write the reply
    return "Sorry, Asha! " + " ".join(results)
def qa(reply):                                       # stage 4: code check, not a model
    return "Rs 282" in reply and "101" in reply

LEDGER.clear(); COMPLAINTS.clear()
issues = classify(TWO_PROBLEMS)
results = [RESOLVERS[kind](oid) for kind, oid in issues]
reply = draft(results)
pipe_calls = 1 + len(issues) + 1                     # classify + one per resolver + draft
RESULTS["pipeline"] = (LEDGER.copy(), COMPLAINTS.copy())
print("issues :", issues)
print("reply  :", reply)
print("qa ok  :", qa(reply), "| model calls:", pipe_calls, "| ledger:", LEDGER, "| complaints:", COMPLAINTS)</div>
  <div class="fx" data-lang="text">issues : [('late', 101), ('rider', 101)]
reply  : Sorry, Asha! Refunded Rs 282 for 101 (late) to UPI. Complaint C-1 filed about the rider on order 101.
qa ok  : True | model calls: 4 | ledger: [(101, 282, 'late', 'UPI')] | complaints: [(101, 'rider')]</div>
  <p>The classifier found two issues, code sent each to its resolver, and the draft passed a check that it mentions ₹282 and order 101. That took <strong>4</strong> model calls. A pipeline is really a <em>workflow</em> in the sense of <a class="xref" data-note="agentic">Agent Fundamentals</a>: the cheapest and most predictable design, but it cannot cope with a kind of problem nobody anticipated, because there is no stage for it.</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>Who decides what runs next</th><th>Model calls here</th><th>Good for</th><th>Watch out for</th></tr>
    <tr><td>Supervisor</td><td>A routing agent, after every step</td><td>10</td><td>Varied tasks, central control, audit trail</td><td>Cost; the supervisor becomes a bottleneck</td></tr>
    <tr><td>Swarm</td><td>The current agent, by calling a handoff tool</td><td>6</td><td>Conversations that move between experts</td><td>Ping-pong; nobody owns the whole plan</td></tr>
    <tr><td>Pipeline</td><td>Your code, in a fixed order</td><td>4</td><td>The same steps every time</td><td>Cases nobody anticipated</td></tr>
  </table>

  <h2 id="ma-parallel"><span class="num">04</span>Parallel Workers</h2>
  <p>All three patterns ran their work one step after another. Now Asha writes "Both my orders 101 and 103 came really late!" Checking order 101 does not depend on checking order 103, so there is no reason to do them in sequence. And sometimes the sub-tasks are not known in advance: someone has to read the message and discover that there are two orders.</p>
  <p>The <strong>orchestrator-workers</strong> pattern handles this. A lead agent (the orchestrator) reads the request, splits it at run time into sub-tasks, and calls a <code>delegate</code> tool once per sub-task, all in the same turn. The harness runs one <strong>worker</strong> per call, in parallel. Each worker starts with a <em>fresh</em> context containing only its task, not the whole conversation, and often uses a cheaper model. All results go back to the lead in one message, and the lead merges them. A manager who sends two analysts to check two branch offices works the same way: each analyst reads that branch's files, and the manager reads two one-line memos and decides.</p>
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
  </svg><figcaption>One lead, many fresh contexts. The raw pages stay with the workers; only short summaries travel up to the lead.</figcaption></figure>
  <p>The figure shows the shape: solid arrows are <code>delegate</code> calls going down, dashed arrows are short summaries coming back. Here it is in code. <code>run_worker</code> makes one model call whose only message is the task; <code>lead_agent</code> is a normal loop whose single tool is <code>delegate</code>, and it runs all delegate calls of one turn through a <code>ThreadPoolExecutor</code> (a pool of threads, so the workers' API calls overlap in time). The stand-in lead finds the order numbers in Asha's message; the stand-in workers really look the orders up:</p>
  <div class="fx" data-lang="py">from concurrent.futures import ThreadPoolExecutor

DELEGATE = {"name": "delegate", "description": "Give one self-contained sub-task to a worker "
            "agent. Call several times in ONE turn for independent sub-tasks.",
            "input_schema": {"type": "object", "properties": {"task": {"type": "string"}},
                             "required": ["task"]}}
WORKER_SYSTEM = "Worker: do exactly the task. Reply in one line."

def run_worker(client, task):
    """A worker with a FRESH context: it sees only its task, not the whole chat."""
    resp = client.messages.create(model="claude-haiku-5-5", max_tokens=300,
                                  system=WORKER_SYSTEM, messages=[{"role": "user", "content": task}])
    return resp.content[0].text

def lead_agent(client, goal, max_steps=4):
    messages = [{"role": "user", "content": goal}]
    for _ in range(max_steps):
        resp = client.messages.create(model="claude-opus-5-5", max_tokens=1024, tools=[DELEGATE],
                                      system="Lead: split the request into independent sub-tasks, "
                                             "delegate them, then merge.", messages=messages)
        messages.append({"role": "assistant", "content": resp.content})
        if resp.stop_reason != "tool_use":
            return resp.content[0].text
        calls = [b for b in resp.content if b.type == "tool_use"]
        with ThreadPoolExecutor() as pool:                          # workers run in parallel
            outs = list(pool.map(lambda b: run_worker(client, b.input["task"]), calls))
        messages.append({"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": b.id, "content": o} for b, o in zip(calls, outs)]})
    return "Stopped: step limit."

def play_lead(req):                                   # STAND-INs for the lead and the workers
    if req["system"] == WORKER_SYSTEM:
        oid = int(re.search(r"\\d{3}", req["messages"][0]["content"])[0])
        o = json.loads(get_order(oid))                # the worker really looks it up
        verdict = "eligible" if o["minutes_late"] &gt; 45 else "not eligible"
        return [text(f"{oid}: {o['minutes_late']} min late, {verdict}, Rs {o['total']}")]
    last = req["messages"][-1]
    if isinstance(last["content"], str):              # lead, turn 1: discover the sub-tasks
        ids = re.findall(r"\\d{3}", last["content"])
        return [call("delegate", task=f"Check order {i} against the 45-minute rule") for i in ids]
    found = [r["content"] for r in last["content"]]   # lead, turn 2: merge
    return [text("Both qualify: " + "; ".join(found))]

client = FakeClient(play_lead)
print(lead_agent(client, "Both my orders 101 and 103 came really late!"))
print("model calls:", ["worker" if c.startswith("Worker") else "lead" for c in client.calls])</div>
  <div class="fx" data-lang="text">Both qualify: 101: 50 min late, eligible, Rs 282; 103: 70 min late, eligible, Rs 1250
model calls: ['lead', 'worker', 'worker', 'lead']</div>
  <p>On the first lap the lead found two order numbers and returned two <code>delegate</code> calls in one turn. The harness ran both workers at once; each saw only "Check order 101 against the 45-minute rule" (or 103), looked the order up and replied in one line. On the second lap the lead received both results in a single message and merged them: both orders qualify. The call log reads lead, worker, worker, lead.</p>
  <p>Speed is a nice side effect, but the real reason for this pattern is <strong>context isolation</strong>: each worker's raw material stays in that worker's context, and only a short result reaches the lead. To see why that matters, imagine a weekly review of complaint tickets from three cities, where each city has about 50 pages of raw tickets:</p>
  <div class="fx" data-lang="py"># Weekly review: complaint tickets from 3 cities, ~50 pages (300 words) of raw tickets each
PAGES, WORDS_PER_PAGE, SUMMARY = 50, 300, 150
cities = ["Mumbai", "Pune", "Bengaluru"]

single_ctx = len(cities) * PAGES * WORDS_PER_PAGE        # one agent: every page stays in ITS context
worker_ctx = PAGES * WORDS_PER_PAGE                      # each worker: only its city
lead_ctx = len(cities) * SUMMARY                         # the lead: only 3 summaries
total = len(cities) * worker_ctx + lead_ctx              # words processed by ALL agents

print(f"one agent   : context {single_ctx:&gt;6} words")
print(f"lead+workers: lead context {lead_ctx:&gt;4} words, each worker {worker_ctx} words")
print(f"total words processed: {single_ctx} vs {total} (+{total - single_ctx} for the hops)")</div>
  <div class="fx" data-lang="text">one agent   : context  45000 words
lead+workers: lead context  450 words, each worker 15000 words
total words processed: 45000 vs 45450 (+450 for the hops)</div>
  <p>A single agent would have to hold all 45,000 words in its own context. With workers, each holds 15,000 and the lead holds just 450, the three summaries. Notice that the total work did not shrink; it grew slightly, by the summaries. The gain is that no single context is overloaded, and models reason best over short, focused contexts. The weakness of the pattern is vague delegation: "look into the orders" makes workers overlap or miss things, so the lead's instructions should demand distinct scopes and a required output shape.</p>

  <h2 id="ma-state"><span class="num">05</span>What Crosses Between Agents</h2>
  <p>Agents do not share memory. Each one sees only its own context. So everything one agent knows that another needs must be passed across explicitly, and anything left out simply does not exist for the receiver. Asha now writes "Order 101 was 50 minutes late. Please refund to my Biteful wallet, my UPI account is closed." When triage hands her over to refunds, how does the wallet instruction travel, and how would we notice if it did not?</p>
  <p>Agents communicate in two ways. With <strong>shared state</strong>, sometimes called a blackboard, there is one data structure every agent reads and writes; LangGraph's <code>MessagesState</code> in the supervisor graph was one, and we chose to let each worker write only its final message into it. With <strong>message passing</strong>, one agent sends another an explicit brief, like the delegate tasks in section 04. Either way, the safest content is <strong>structured</strong>: a schema that names every field the receiver needs, checked in code before anyone acts on it. A hospital shift change shows why. A spoken "bed 4 is fine" can lose the patient's allergy; a handover form with a mandatory "allergies" box does not, and a form with that box empty is sent back.</p>
  <p>We use pydantic, the data-validation library, to define the brief as a class. <code>Literal</code> restricts <code>issue</code> to known values, and <code>constraints</code> is required, so the sender must write down everything the customer asked for that has to survive the hand-over:</p>
  <div class="fx" data-lang="py">from pydantic import BaseModel, ValidationError

class Handoff(BaseModel):            # the CONTRACT between triage and a specialist
    customer: str
    order_id: int
    issue: Literal["late", "missing_item", "rider"]
    constraints: list[str]           # everything the customer asked for that must survive

ASK = ("Order 101 was 50 minutes late. Please refund to my Biteful wallet, "
       "my UPI account is closed.")
free_text = "Refund order 101, it was late."                  # what a hurried triage writes
brief = Handoff(customer="asha", order_id=101, issue="late",
                constraints=["refund to Biteful wallet, not UPI"])
print("free text :", free_text)
print("structured:", brief.model_dump_json())
try:
    Handoff(customer="asha", order_id="one-oh-one", issue="late")   # a sloppy brief
except ValidationError as e:
    print("rejected  :", [(err["loc"][0], err["type"]) for err in e.errors()])</div>
  <div class="fx" data-lang="text">free text : Refund order 101, it was late.
structured: {"customer":"asha","order_id":101,"issue":"late","constraints":["refund to Biteful wallet, not UPI"]}
rejected  : [('order_id', 'int_parsing'), ('constraints', 'missing')]</div>
  <p>The free-text brief a hurried triage agent writes, "Refund order 101, it was late.", is accurate and still loses the one thing Asha cared about. The structured brief carries "refund to Biteful wallet, not UPI" in its <code>constraints</code> field. And a sloppy brief, with the order id written as "one-oh-one" and no constraints at all, is rejected by pydantic with two named errors (<code>int_parsing</code> for the id, <code>missing</code> for the constraints) before any agent acts on it. In the next section we will see what happens to the money when the free-text brief is used.</p>
  <p>The rules that follow from this are simple. Pass final results, never a worker's whole transcript, which would flood the receiver with tool chatter. Make every brief self-contained; "continue from what we discussed" means nothing to a worker with a fresh context. Use a schema with required fields for anything that must survive. And keep facts such as the refund ledger in one shared source of truth that every agent checks, rather than in agents' memories.</p>

  <h2 id="ma-fail"><span class="num">06</span>Coordination Failures</h2>
  <p>A single agent can loop or misread an argument. A team adds new ways to fail, in which every agent behaves correctly according to its own instructions but the combined result is wrong. This is called a <strong>coordination failure</strong>. Picture a relay team: one runner drops the baton (a lossy hand-over), two runners both run the third leg (a duplicate action), two keep waving each other on and nobody runs (ping-pong), and the coach shouts "great run!" without looking at the clock (a useless critic). The code below reproduces the first three on Biteful's ledger, using stand-ins that behave the way failing agents do, and then applies the fixes:</p>
  <div class="fx" data-lang="py"># 1. PING-PONG: triage and refunds keep handing the customer back and forth
script = {"triage": [[call("transfer_to_refunds")]] * 5,
          "refunds": [[call("transfer_to_triage")]] * 5}
try:
    chat(FakeClient(play), [{"role": "user", "content": "Is order 101 refundable?"}], max_steps=6)
except RuntimeError as e:
    print("ping-pong  :", e, "after 6 model calls, 6 transfers, no answer")

# 2. LOSSY HANDOFF: the specialist does what its brief says, nothing more
def refunds_specialist(handoff_text):          # STAND-IN: obeys the brief it is given
    to = "wallet" if "wallet" in handoff_text.lower() else "UPI"
    return refund(101, 282, "late", to)
LEDGER.clear(); refunds_specialist(free_text)
print("lossy, free-text brief  :", LEDGER, "&lt;- a CLOSED account")
LEDGER.clear(); refunds_specialist(brief.model_dump_json())
print("lossy, structured brief :", LEDGER)

# 3. DUPLICATE ACTION: two specialists both pay for the same order
def items_specialist(order_id, item, price):   # STAND-IN: refunds the missing item
    return refund(order_id, price, f"missing {item}")
LEDGER.clear()
refunds_specialist("late")                     # full refund: Rs 282 (covers the coffee too)
items_specialist(101, "coffee", 40)            # ...and the coffee again
print("duplicate  :", LEDGER, "-&gt; Rs", sum(a for _, a, _, _ in LEDGER), "paid on a Rs 282 order")

def capped_refund(order_id, amount, reason="late", to="UPI"):
    """ONE owner of the money: never pay more than the order total in total."""
    paid = sum(a for o, a, _, _ in LEDGER if o == order_id)
    if paid + amount &gt; ORDERS[order_id]["total"]:
        return f"Blocked: Rs {paid} already refunded for {order_id} (total Rs {ORDERS[order_id]['total']})."
    return refund(order_id, amount, reason, to)
LEDGER.clear()
capped_refund(101, 282)
print("with cap   :", capped_refund(101, 40, "missing coffee"), "| ledger:", LEDGER)</div>
  <div class="fx" data-lang="text">  [triage ] transfer_to_refunds -&gt; Transferred.
  [refunds] transfer_to_triage  -&gt; Transferred.
  [triage ] transfer_to_refunds -&gt; Transferred.
  [refunds] transfer_to_triage  -&gt; Transferred.
  [triage ] transfer_to_refunds -&gt; Transferred.
  [refunds] transfer_to_triage  -&gt; Transferred.
ping-pong  : too many steps after 6 model calls, 6 transfers, no answer
lossy, free-text brief  : [(101, 282, 'late', 'UPI')] &lt;- a CLOSED account
lossy, structured brief : [(101, 282, 'late', 'wallet')]
duplicate  : [(101, 282, 'late', 'UPI'), (101, 40, 'missing coffee', 'UPI')] -&gt; Rs 322 paid on a Rs 282 order
with cap   : Blocked: Rs 282 already refunded for 101 (total Rs 282). | ledger: [(101, 282, 'late', 'UPI')]</div>
  <p><strong>Ping-pong</strong>: triage sent Asha to refunds, refunds sent her back, and this repeated until the loop's <code>max_steps</code> cap of 6 stopped it, with no answer for the customer. The fixes are a step cap per conversation (and a total budget across all agents, since each agent's own cap does not stop transfers between agents) and transfer-tool descriptions that say when <em>not</em> to transfer.</p>
  <p><strong>Lossy handoff</strong>: the stand-in refunds specialist does exactly what its brief says. Given the free-text brief, it refunded ₹282 to UPI, which is the closed account. Given the structured brief from section 05, it refunded to the wallet. The fix is structured briefs with a constraints field.</p>
  <p><strong>Duplicate action</strong>: for "late, and the coffee was missing", the refunds agent paid the full ₹282, which already includes the coffee, and a separate items agent paid ₹40 for the coffee as well: ₹322 refunded on a ₹282 order. Each agent was right by its own rules. The fix has two layers: give each kind of write exactly one owner (only the refunds agent pays), and add a rule in the data layer that every write must pass. <code>capped_refund</code> refuses any payment that would take the total refunded above the order total, and it blocked the second payment.</p>
  <p>The fourth failure concerns a popular idea: add a <strong>critic</strong>, a second agent (or program) that checks the first one's output and sends feedback. It sounds like it must help, but a critic only helps if it knows something the writer did not. Below, the writer's first draft says ₹280 instead of ₹282:</p>
  <div class="fx" data-lang="py"># 4. A CRITIC that knows nothing new vs a critic with a real check
drafts = ["Sorry, Asha! We refunded Rs 280 for order 101.",           # writer, draft 1
          "Sorry, Asha! We refunded Rs 282 for order 101."]           # draft 2, after feedback
same_model_critic = lambda d: "Looks good!"                           # STAND-IN: re-reads, agrees
def ledger_critic(d):                                                 # checks against the ledger
    paid = {o: a for o, a, _, _ in LEDGER}
    claims = re.findall(r"Rs (\\d+) for order (\\d+)", d)
    bad = [(a, o) for a, o in claims if paid.get(int(o)) != int(a)]
    return "OK" if claims and not bad else f"Ledger says Rs {paid[int(bad[0][1])]} for {bad[0][1]}"

for n, d in enumerate(drafts, 1):
    print(f"draft {n}: same-model critic: {same_model_critic(d):12} | ledger critic: {ledger_critic(d)}")</div>
  <div class="fx" data-lang="text">draft 1: same-model critic: Looks good!  | ledger critic: Ledger says Rs 282 for 101
draft 2: same-model critic: Looks good!  | ledger critic: OK</div>
  <p>The same-model critic, standing in for the same model re-reading the same draft with no new information, says "Looks good!" to both drafts, including the wrong one. The ledger critic extracts every "Rs X for order N" claim, compares it with the ledger, and returns feedback a writer can act on ("Ledger says Rs 282 for 101"); the corrected second draft passes. Critics are worth their tokens when they bring real information: the ledger, test results, the retrieved sources, or a different model. A practical check is to measure how often your critic rejects anything; if it almost never does, it is costing money and adding nothing. The same reasoning applies to other multi-agent ideas you will hear about, such as debate (agents argue and a judge picks) and hierarchies of supervisors: they can help on some tasks, they always cost more, and they need measuring.</p>
  <table class="tbl">
    <tr><th>Failure</th><th>On Biteful</th><th>Fix</th></tr>
    <tr><td>Ping-pong / runaway</td><td>6 transfers, no answer</td><td>Step and token budget per conversation; "when not to transfer"</td></tr>
    <tr><td>Lossy handoff</td><td>Refund sent to a closed account</td><td>Structured briefs with constraints, validated</td></tr>
    <tr><td>Duplicate action</td><td>₹322 paid on a ₹282 order</td><td>One owner per write; caps and idempotency in the data layer</td></tr>
    <tr><td>Useless critic</td><td>"Looks good!" to ₹280</td><td>Critics that check real data</td></tr>
    <tr><td>Compounding errors</td><td>A worker's wrong "fact" becomes the lead's premise</td><td>Workers cite sources; verify in code</td></tr>
  </table>

  <h2 id="ma-mcp"><span class="num">07</span>MCP: Sharing Tools</h2>
  <p>Inside our team, every agent calls the same Python functions. But Biteful's order lookup is also needed by the restaurant-partner assistant, an internal analytics agent and next year's voice bot, each built by a different team, and all of those agents also want GitHub, Slack and the company wiki. Without a standard, each AI application writes its own connector for each system, with its own authentication, bugs and tool-schema format. With 5 applications and 20 systems, that is 5 × 20 = 100 connectors to build and maintain.</p>
  <p>The <strong>Model Context Protocol (MCP)</strong> is an open standard for connecting AI applications to tools and data. Each system ships one MCP <strong>server</strong>, each application implements one MCP <strong>client</strong>, and any application can then use any server. The 100 connectors become 5 + 20 = 25. This is usually summarised as turning an N × M problem into N + M. USB-C is the common analogy: laptops do not need a special port for every device, because everyone agreed on one plug. The analogy breaks in one important place, which we return to below: a USB device cannot trick your laptop with words, but an MCP server's tool descriptions go straight into your model's prompt.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="ma-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="10" width="222" height="180" rx="8" class="fs" stroke="currentColor"/>
    <text x="22" y="30">Host</text><text x="22" y="48" class="tm">app · LLM · user consent</text>
    <rect x="22" y="66" width="70" height="108" rx="6" class="fv"/><text x="57" y="124" text-anchor="middle">LLM</text>
    <rect x="114" y="76" width="106" height="34" rx="6" class="fb sb"/><text x="167" y="97" text-anchor="middle">client 1</text>
    <rect x="114" y="132" width="106" height="34" rx="6" class="fb sb"/><text x="167" y="153" text-anchor="middle">client 2</text>
    <rect x="290" y="76" width="140" height="34" rx="6" class="ft st"/><text x="360" y="97" text-anchor="middle">server: github</text>
    <rect x="290" y="132" width="140" height="34" rx="6" class="ft st"/><text x="360" y="153" text-anchor="middle">server: orders</text>
    <rect x="480" y="76" width="110" height="34" rx="6" class="fg sg"/><text x="535" y="97" text-anchor="middle">GitHub API</text>
    <rect x="480" y="132" width="110" height="34" rx="6" class="fg sg"/><text x="535" y="153" text-anchor="middle">order DB</text>
    <g stroke="currentColor" fill="none">
      <line x1="94" y1="93" x2="112" y2="93"/><line x1="94" y1="149" x2="112" y2="149"/>
      <line x1="224" y1="93" x2="286" y2="93" marker-start="url(#ma-ah2)" marker-end="url(#ma-ah2)"/>
      <line x1="224" y1="149" x2="286" y2="149" marker-start="url(#ma-ah2)" marker-end="url(#ma-ah2)"/>
      <line x1="432" y1="93" x2="476" y2="93" marker-end="url(#ma-ah2)"/><line x1="432" y1="149" x2="476" y2="149" marker-end="url(#ma-ah2)"/>
    </g>
    <text x="255" y="60" text-anchor="middle" class="tb">JSON-RPC</text>
    <text x="255" y="86" text-anchor="middle" class="tm" font-size="11">HTTP</text><text x="255" y="142" text-anchor="middle" class="tm" font-size="11">stdio</text>
  </svg><figcaption>One client per server inside the host. Each server talks to its real system and never needs to know which LLM the host uses.</figcaption></figure>
  <p>MCP has three roles, and the figure shows how they fit. The <strong>host</strong> is the AI application the user works in, such as Claude Desktop, Claude Code or your own support app; it owns the LLM, the user interface and the user's consent. Inside the host there is one <strong>client</strong> per server, each holding one connection. The <strong>server</strong> is a small program that exposes capabilities and talks to the real system (the GitHub API, the order database). Client and server exchange messages in <strong>JSON-RPC 2.0</strong>, a simple format where a request has an <code>id</code>, a <code>method</code> name and <code>params</code>, and the reply carries the same <code>id</code> with either a <code>result</code> or an <code>error</code>. A message without an <code>id</code> is a <strong>notification</strong> and gets no reply.</p>
  <p>A session always follows the same steps, and we will run exactly these in the next section. The client sends <code>initialize</code> with its protocol version and capabilities, and the server replies with its name and what it offers. The client sends the notification <code>notifications/initialized</code>. Then it can call <code>tools/list</code> to get each tool's name, description and JSON schema, and <code>tools/call</code> with a tool name and arguments, which returns content blocks and an <code>isError</code> flag. A server can offer three kinds of things, called primitives, and the client side offers three more:</p>
  <table class="tbl">
    <tr><th>Primitive</th><th>Offered by</th><th>Who decides to use it</th><th>Biteful example</th></tr>
    <tr><td>Tools</td><td>Server</td><td>The model, during its reasoning</td><td><code>get_order(order_id)</code></td></tr>
    <tr><td>Resources</td><td>Server</td><td>The application or user: read-only data addressed by a URI</td><td><code>policy://late-orders</code></td></tr>
    <tr><td>Prompts</td><td>Server</td><td>The user, as templates or slash commands</td><td>"Reply about a late order"</td></tr>
    <tr><td>Sampling</td><td>Client</td><td>The server asks the host's LLM for a completion</td><td>A server needs a summary but has no API key</td></tr>
    <tr><td>Elicitation</td><td>Client</td><td>The server asks the user a question mid-task</td><td>"Which order did you mean?"</td></tr>
    <tr><td>Roots</td><td>Client</td><td>The host tells the server which folders it may touch</td><td><code>file:///srv/biteful/exports</code></td></tr>
  </table>
  <p>Messages travel over one of two <strong>transports</strong>. With <strong>stdio</strong>, the host starts the server as a child process on the same machine and they exchange JSON-RPC lines over the process's standard input and output; this is used for local tools such as files, git or a local database, and security comes from the user's own machine permissions. With <strong>Streamable HTTP</strong>, the server is a web service with one endpoint (often <code>/mcp</code>) that many users can share, it can stream responses, and it is secured with OAuth 2.1 or tokens. An older "HTTP + SSE" transport is deprecated; new remote servers use Streamable HTTP.</p>
  <p>Now the broken part of the USB-C analogy. MCP is a way to connect things, not a security layer. A malicious or compromised server can hide instructions in its tool descriptions or results, which the model reads as part of its prompt; this is called <strong>tool poisoning</strong>. Install servers only from sources you trust, give each the least privilege it needs, and keep human approval for risky actions (see <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a>).</p>

  <h2 id="ma-mcpbuild"><span class="num">08</span>Building an MCP Server</h2>
  <p>The whole point of MCP is that each system writes its server once, so writing one should be easy, and with the official Python SDK (<code>pip install "mcp[cli]"</code>) it is. You decorate ordinary functions, and the SDK turns them into capabilities: type hints become the JSON schema and docstrings become the descriptions, exactly as <code>@tool</code> did in <a class="xref" data-note="agent_build">Build an Agent from Scratch</a>. Here is a complete Biteful server exposing one tool, one resource and one prompt:</p>
  <div class="fx" data-lang="py"># file: biteful_server.py  (a minimal MCP server: Biteful's order tools for ANY agent)
from mcp.server.mcpserver import MCPServer

mcp = MCPServer("biteful-orders")

ORDERS = {101: {"restaurant": "Dosa Hut", "total": 282, "minutes_late": 50},
          102: {"restaurant": "Pizza Planet", "total": 450, "minutes_late": 35}}
POLICY = {"late-orders": "More than 45 minutes late: Biteful refunds the full order amount.",
          "missing-items": "Missing or wrong item: report within 48 hours with a photo."}

@mcp.tool()
def get_order(order_id: int) -&gt; str:
    """Look up a Biteful order: restaurant, total, minutes late. Call before any refund."""
    o = ORDERS.get(order_id)
    return f"Order {order_id}: {o}" if o else f"No order {order_id}."

@mcp.resource("policy://{name}")
def policy(name: str) -&gt; str:
    """One section of Biteful's refund policy."""
    return POLICY.get(name, "Unknown policy section")

@mcp.prompt()
def late_order_reply(order_id: int) -&gt; str:
    """Template: reply to a customer about a late order."""
    return f"Look up order {order_id}, apply the 45-minute rule, and reply in 2 sentences."

if __name__ == "__main__":
    mcp.run()          # stdio by default; mcp.run(transport="streamable-http") for HTTP</div>
  <p>The three decorators match the three server primitives. <code>@mcp.tool()</code> makes <code>get_order</code> something the model may call. <code>@mcp.resource("policy://{name}")</code> makes each policy section readable by URI, with <code>{name}</code> filled from the address. <code>@mcp.prompt()</code> offers a template a user can pick. <code>mcp.run()</code> serves over stdio by default. A version note, because tutorials differ: this is the 2.x SDK, whose class is <code>MCPServer</code>; most older tutorials show 1.x, <code>from mcp.server.fastmcp import FastMCP</code>, with the same decorators.</p>
  <p>To test a server you do not need an LLM at all, only an MCP client. The SDK's <code>Client</code> starts the server as a subprocess, performs the handshake, and gives you <code>list_tools</code> and <code>call_tool</code>. The client API is asynchronous (see <a class="xref" data-note="py_asyncio">asyncio</a>), hence <code>async with</code> and <code>await</code>:</p>
  <div class="fx" data-lang="py">import asyncio, sys
from mcp import Client, StdioServerParameters

async def main():
    params = StdioServerParameters(command=sys.executable, args=["biteful_server.py"])
    async with Client(params) as client:              # starts the server process
        tools = await client.list_tools()
        print("tools:", [(t.name, t.description[:44]) for t in tools.tools])
        res = await client.call_tool("get_order", {"order_id": 101})
        print("call :", res.content[0].text)
        res = await client.call_tool("get_order", {"order_id": 999})
        print("miss :", res.content[0].text)

asyncio.run(main())</div>
  <div class="fx" data-lang="text">tools: [('get_order', 'Look up a Biteful order: restaurant, total, ')]
call : Order 101: {'restaurant': 'Dosa Hut', 'total': 282, 'minutes_late': 50}
miss : No order 999.</div>
  <p>The client listed one tool, with the docstring as its description, and called it twice: order 101 was found, and order 999 produced the server's "No order" message as a normal result. To remove any mystery about what the SDK is doing, here is the same kind of session with <em>no SDK on the client side</em>: we start the server ourselves and write JSON-RPC messages, one per line, to its standard input. <code>send</code> writes one message and, if it is a request (it has an <code>id</code>), reads one line of reply:</p>
  <div class="fx" data-lang="py"># MCP without any SDK on the client side: JSON-RPC messages, one per line, over stdin/stdout.
import subprocess, sys

server = subprocess.Popen([sys.executable, "biteful_server.py"], stdin=subprocess.PIPE,
                          stdout=subprocess.PIPE, text=True)

def send(msg):
    server.stdin.write(json.dumps(msg) + "\\n"); server.stdin.flush()
    if "id" in msg:                                    # requests get a reply; notifications don't
        return json.loads(server.stdout.readline())

r = send({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {
          "protocolVersion": "2025-06-18", "capabilities": {},
          "clientInfo": {"name": "raw-client", "version": "0.1"}}})
print("1 initialize -&gt; ", r["result"]["serverInfo"]["name"], "| capabilities:",
      sorted(r["result"]["capabilities"]))
send({"jsonrpc": "2.0", "method": "notifications/initialized"})
r = send({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
t = r["result"]["tools"][0]
print("2 tools/list -&gt; ", t["name"], json.dumps(t["inputSchema"]["properties"]))
r = send({"jsonrpc": "2.0", "id": 3, "method": "tools/call",
          "params": {"name": "get_order", "arguments": {"order_id": 102}}})
print("3 tools/call -&gt; ", r["result"]["content"][0]["text"], "| isError:", r["result"]["isError"])
r = send({"jsonrpc": "2.0", "id": 4, "method": "resources/read",
          "params": {"uri": "policy://late-orders"}})
print("4 resources/read -&gt;", r["result"]["contents"][0]["text"])
server.stdin.close(); server.wait()</div>
  <div class="fx" data-lang="text">1 initialize -&gt;  biteful-orders | capabilities: ['prompts', 'resources', 'tools']
2 tools/list -&gt;  get_order {"order_id": {"title": "Order Id", "type": "integer"}}
3 tools/call -&gt;  Order 102: {'restaurant': 'Pizza Planet', 'total': 450, 'minutes_late': 35} | isError: False
4 resources/read -&gt; More than 45 minutes late: Biteful refunds the full order amount.</div>
  <p>This is the session from section 07, for real. Message 1, <code>initialize</code>, was answered with the server's name and its capabilities: prompts, resources and tools, because our server defined one of each. Then came the <code>notifications/initialized</code> notification, which got no reply because it has no id. Message 2, <code>tools/list</code>, returned <code>get_order</code> with a schema generated from the type hint <code>order_id: int</code>. Message 3 ran the tool for order 102 (35 minutes late) with <code>isError: False</code>. Message 4 read the late-orders policy as a resource. One practical consequence of stdio is worth remembering: standard output <em>is</em> the protocol channel, so a stray <code>print</code> in a stdio server corrupts the JSON stream. Servers must log to standard error.</p>
  <p>There are three common ways to put such a server to use. First, an existing host: in Claude Code you run <code>claude mcp add biteful-orders -- python biteful_server.py</code>, and Claude Desktop reads an entry like <code>"mcpServers": {"biteful-orders": {"command": "python", "args": ["/path/to/biteful_server.py"]}}</code> from its config file. Second, your own host application: open a client session as above, call <code>list_tools()</code>, convert each tool into your model API's tool format, and whenever the model calls one, forward the call with <code>call_tool</code> and return the result; helper libraries do the conversion (the Anthropic SDK's MCP helpers, or <code>langchain-mcp-adapters</code> for LangChain and LangGraph agents). Third, for a remote server on Streamable HTTP, model APIs offer an MCP connector, where you pass the server's URL in the API request and the provider connects to it for you; check your provider's documentation for the current parameter names.</p>

  <h2 id="ma-a2a"><span class="num">09</span>A2A: Agents Talking to Agents</h2>
  <p>MCP connects an agent to tools you control: you call a function and get an answer. But Biteful's riders come from a logistics partner, SwiftRide, which runs its own incident agent. When Asha's rider complaint goes to SwiftRide, Biteful is not calling a function. It is briefing another company's agent, which will reason on its own, may take an hour, may come back with questions, and whose internals Biteful cannot see.</p>
  <p><strong>A2A (Agent2Agent)</strong> is an open protocol, started by Google, for exactly this: how agents discover each other, hand over tasks and follow their progress. Two pieces matter most. An <strong>Agent Card</strong> is a small JSON document an agent publishes at a well-known URL, listing its skills, its endpoint and how to authenticate; it is the agent's visiting card. The <strong>task lifecycle</strong> is a small state machine that every task follows: it is submitted, then working, and it may move to <code>input-required</code> (the remote agent needs something from you) and back to working, until it ends as completed or failed. Hiring an accounting firm is a close analogy: you find them through their card, hand over a job, they sometimes call to ask for a document, and eventually they deliver, without you ever seeing how they work inside.</p>
  <div class="fx" data-lang="py"># An Agent Card: what a partner's agent publishes at a well-known URL (simplified)
card = {"name": "swiftride-dispatch", "url": "https://agents.swiftride.example/a2a",
        "skills": [{"id": "rider_incident", "description": "Investigate a rider complaint"}],
        "capabilities": {"streaming": True}, "authentication": {"schemes": ["bearer"]}}
print("card:", card["name"], "| skills:", [s["id"] for s in card["skills"]], "| endpoint:", card["url"])

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
  <div class="fx" data-lang="text">card: swiftride-dispatch | skills: ['rider_incident'] | endpoint: https://agents.swiftride.example/a2a
submitted -&gt; working -&gt; input-required -&gt; working -&gt; completed
submitted -&gt; working -&gt; completed -&gt; ILLEGAL(working)</div>
  <p>The card tells our delivery agent that SwiftRide's agent offers a <code>rider_incident</code> skill at a given endpoint. The <code>NEXT</code> table encodes which moves are legal. The first run is a legal path: SwiftRide's agent needed input once (say, the delivery photo), received it, and completed. The second tried to move a completed task back to working, and the table rejected it. Your client should enforce these rules itself, so a buggy partner cannot confuse your system. In A2A, messages carry the conversation and <strong>artifacts</strong> are the outputs, such as a report or a decision; like MCP's remote transport, it runs over HTTP with JSON-RPC and streaming.</p>
  <p>The short way to remember the difference: MCP is agent ↔ tools, A2A is agent ↔ agent. They work together, since an A2A agent may well use MCP tools internally. If you control both sides and the thing on the other side is really a function, MCP or a plain tool is simpler than A2A.</p>

  <h2 id="ma-build"><span class="num">10</span>A Team That Helps</h2>
  <p>So far a team has not clearly beaten one agent on Asha's requests. Here is a job where splitting genuinely helps. Every Monday, support leads want "this week's top complaint themes" with ticket ids as evidence. The job has the three properties that favour a team: it is wide (many tickets to read), its parts are independent (different themes), and its output has a checkable property (every cited ticket must exist in the evidence).</p>
  <p>The design: two <strong>researcher</strong> agents, each with a ticket-search tool and its own messy context, run in parallel on two themes and return structured findings, each a <code>{claim, source}</code> pair validated with pydantic. A <strong>writer</strong> agent has no tools at all and sees only the findings. Finally, plain code checks that every <code>[T-…]</code> citation in the written brief came from some finding. Giving each agent only the tools it needs, here none for the writer, is called <strong>least privilege</strong>: text injected into a ticket cannot make the writer do anything, because it has nothing to do things with. A newsroom works the same way: reporters collect quotes with each source's name, the editor writes only from their notes, and before printing a fact-checker confirms every quote has a named source.</p>
  <div class="fx" data-lang="py"># research_team: researcher sub-agents (search tool, own context) -&gt; writer (no tools)
TICKETS = {   # this week's support tickets (stand-in for a ticket search index)
    "T-11": "Order 101 Dosa Hut 50 minutes late in rain; refunded Rs 282.",
    "T-12": "Order 140 late 55 minutes, rider stuck at Andheri flyover closure.",
    "T-13": "Order 152 coffee missing; refunded Rs 40 for the missing item.",
    "T-14": "Order 160 wrong item: veg biryani replaced with chicken; refunded.",
    "T-15": "Order 171 late 20 minutes; not eligible, customer informed.",
}
def search_tickets(query):
    """Keyword search over tickets: top 3 by shared words."""
    q = set(re.findall(r"[a-z]+", query.lower()))
    scored = sorted(TICKETS.items(), key=lambda kv: -len(q &amp; set(re.findall(r"[a-z]+", kv[1].lower()))))
    return "\\n".join(f"[{k}] {v}" for k, v in scored[:3])

class Finding(BaseModel):            # structured handoff: researcher -&gt; writer
    claim: str
    source: str
class Report(BaseModel):
    findings: list[Finding]

SEARCH = {"name": "search_tickets", "description": "Search this week's tickets.",
          "input_schema": {"type": "object", "properties": {"query": {"type": "string"}},
                           "required": ["query"]}}
RESEARCHER = "Researcher: use search_tickets; every claim needs a ticket id. Reply with JSON."
WRITER = "Writer: 3-sentence brief from the findings ONLY; cite ids like [T-11]."

def researcher(client, question, max_steps=4):
    messages = [{"role": "user", "content": f"Research: {question}"}]
    for _ in range(max_steps):
        resp = client.messages.create(model="claude-haiku-5-5", max_tokens=800, system=RESEARCHER,
                                      tools=[SEARCH], messages=messages)
        if resp.stop_reason != "tool_use":
            return Report.model_validate_json(resp.content[0].text)    # schema-checked
        messages.append({"role": "assistant", "content": resp.content})
        messages.append({"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": b.id, "content": search_tickets(**b.input)}
            for b in resp.content if b.type == "tool_use"]})
    return Report(findings=[])

def writer(client, question, findings):
    resp = client.messages.create(model="claude-opus-5-5", max_tokens=800, system=WRITER,
                                  messages=[{"role": "user", "content": f"{question}\\n"
                                             + json.dumps([f.model_dump() for f in findings])}])
    return resp.content[0].text

def check_citations(brief, findings):
    """Citations the writer invented (not in any finding)."""
    allowed = {f.source for f in findings}
    return [c for c in re.findall(r"\\[(T-\\d+)\\]", brief) if c not in allowed]

def research_team(client, question, sub_questions):
    with ThreadPoolExecutor() as pool:                     # researchers in parallel
        reports = list(pool.map(lambda q: researcher(client, q), sub_questions))
    findings = [f for r in reports for f in r.findings]
    brief = writer(client, question, findings)
    bad = check_citations(brief, findings)
    return brief if not bad else brief + f"\\n[unverified citations: {bad}]"</div>
  <p>Three lines carry the design. <code>Report.model_validate_json</code> turns a researcher's final text into checked data, so a malformed report fails loudly instead of being passed along. <code>writer</code> is called without any <code>tools</code>. And <code>check_citations</code> lists every cited id that does not appear in any finding. Now a run. The stand-in researchers really read their search results and build findings from them; the stand-in writer cites three real sources and invents one, which is exactly the kind of mistake real models make:</p>
  <div class="fx" data-lang="py">RAW_SEEN, FOUND = [], {}                                   # what each researcher context held
def play_team(req):                                       # STAND-INs for researchers and writer
    msgs = req["messages"]
    if req["system"] == RESEARCHER:
        if len(msgs) == 1:                                 # lap 1: search for the topic
            return [call("search_tickets", query=msgs[0]["content"].split(": ", 1)[1])]
        hits = msgs[-1]["content"][0]["content"]           # lap 2: read the observation
        RAW_SEEN.append(len(hits))
        FOUND[msgs[0]["content"]] = re.findall(r"\\[(T-\\d+)\\]", hits)
        found = [{"claim": line.split("] ", 1)[1][:40], "source": line[1:5]}
                 for line in hits.splitlines()[:2]]
        return [text(json.dumps({"findings": found}))]
    return [text("Late deliveries led complaints, often in rain or road closures [T-11] [T-12]. "
                 "Missing items were refunded per item [T-13]. Rain delays rose 30% [T-19].")]

client = FakeClient(play_team)
brief = research_team(client, "This week's top complaint themes?",
                    ["late delivery minutes rider", "missing wrong item refunded"])
for topic, ids in sorted(FOUND.items()):                   # threads finish in any order
    print(f"{topic:44} -&gt; {ids}")
print(brief)
print("model calls:", len(client.calls), "(2 researchers x 2 laps + 1 writer)")</div>
  <div class="fx" data-lang="text">Research: late delivery minutes rider        -&gt; ['T-12', 'T-11', 'T-15']
Research: missing wrong item refunded        -&gt; ['T-13', 'T-14', 'T-11']
Late deliveries led complaints, often in rain or road closures [T-11] [T-12]. Missing items were refunded per item [T-13]. Rain delays rose 30% [T-19].
[unverified citations: ['T-19']]
model calls: 5 (2 researchers x 2 laps + 1 writer)</div>
  <p>The late-delivery search returned T-12, T-11 and T-15, the missing-item search T-13, T-14 and T-11, and each researcher reported its top two as findings. The brief cited T-11, T-12 and T-13, all present in the findings, and T-19, which no researcher ever found; the citation check flagged it as unverified. That one line of code turns "the writer might make up a source" from a worry into a check that fails visibly. The whole run took 5 model calls: two laps for each researcher and one for the writer. Natural extensions would be to let a lead agent choose the themes with a <code>delegate</code> tool, add a ledger-style critic for numbers, and serve <code>search_tickets</code> from an MCP server, and then measure whether the brief is actually better than one agent with the same tool, and at what token cost.</p>

  <h2 id="ma-overkill"><span class="num">11</span>When Multi-Agent Is Overkill</h2>
  <p>We have built supervisors, swarms, pipelines and a research team. The honest question is whether any of them did better than one agent on Asha's request. To answer it we need a <strong>single-agent baseline</strong>: the simplest design that can do the task, measured the same way. Here is one agent holding all three tools, run on the same two-problem message, next to the earlier results:</p>
  <div class="fx" data-lang="py">AGENTS["solo"] = {"system": "Solo: you handle everything yourself.",
                  "allowed": {"get_order", "refund", "file_complaint"}}
LEDGER.clear(); COMPLAINTS.clear()
script = {"solo": [[call("get_order", order_id=101)], [call("refund", order_id=101, amount=282)],
                   [call("file_complaint", order_id=101, about="rider")],
                   [text("Sorry, Asha! Rs 282 refunded for order 101; rider complaint filed.")]]}
client = FakeClient(play)
chat(client, [{"role": "user", "content": TWO_PROBLEMS}], active="solo")
solo_calls = len(client.calls)
RESULTS["one agent"] = (LEDGER.copy(), COMPLAINTS.copy())
print(f"{'design':12}{'model calls':&gt;12}  end state (refunds | complaints)")
for name, n in [("one agent", solo_calls), ("pipeline", pipe_calls), ("swarm", swarm_calls),
                ("supervisor", sup_calls)]:
    refunds, complaints = RESULTS[name]
    print(f"{name:12}{n:&gt;12}  {[(o, a) for o, a, _, _ in refunds]} | {complaints}")
print("weekly report: biggest researcher context", max(RAW_SEEN), "chars of raw results; "
      "one agent would hold", sum(RAW_SEEN))</div>
  <div class="fx" data-lang="text">  [solo   ] get_order           -&gt; {"order_id": 101, "customer": "asha", "total": 282
  [solo   ] refund              -&gt; Refunded Rs 282 for 101 (late) to UPI.
  [solo   ] file_complaint      -&gt; Complaint C-1 filed about the rider on order 101.
design       model calls  end state (refunds | complaints)
one agent              4  [(101, 282)] | [(101, 'rider')]
pipeline               4  [(101, 282)] | [(101, 'rider')]
swarm                  6  [(101, 282)] | [(101, 'rider')]
supervisor            10  [(101, 282)] | [(101, 'rider')]
weekly report: biggest researcher context 211 chars of raw results; one agent would hold 419</div>
  <p>Every design produced the same end state: one ₹282 refund for order 101 and one rider complaint. The single agent and the pipeline used 4 model calls, the swarm 6 and the supervisor 10, so the supervisor spent two and a half times the calls for an identical result. Tokens grow even faster than calls, because every call resends that agent's own prompt and tools. Anthropic has reported that its multi-agent research system uses roughly 15 times the tokens of a plain chat, against about 4 times for a single agent. For the weekly brief, though, the split did buy something real: no context held more than 211 characters of raw results, where one agent would have held 419. With five tickets that hardly matters; with five thousand it is the whole point.</p>
  <p>You would not form a committee to answer one customer's email; committees earn their cost on big, separable jobs, or when different people must sign off different parts. That gives the decision rule. Start with one agent, or a fixed workflow if the steps never change (see <a class="xref" data-note="agentic">Agent Fundamentals</a>). Split only when at least one of these is true. <strong>Breadth</strong>: independent sub-tasks whose raw material would overflow one context, like the weekly brief. <strong>Separation</strong>: parts need different tools or permissions, like a menu bot that must never hold the refund tool. <strong>Ownership</strong>: different teams or companies build and run the agents, like SwiftRide over A2A. Even then, the task must be valuable enough to justify several times the tokens, and the team must beat the single-agent baseline on an eval set (<a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>).</p>
  <p>The classic wrong design, and a favourite interview question, is "planner, coder, tester and reviewer agents" because it looks like a team's org chart. Giving a model a job title does not make it smarter, and for tightly coupled work like coding, where every step depends on the others, splitting loses context at every hand-over and multiplies calls. Split by independent sub-tasks, permissions or ownership, never by job title.</p>

  <h2 id="ma-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The first mistake is splitting by job title rather than by need, as just described: planner, coder, tester and reviewer agents for tightly coupled work, with no comparison against one agent. Always build the single-agent baseline first and make the team beat it.</p>
  <p>The second is briefs that assume shared memory. A worker starts with a fresh context, so "continue from what we discussed" or "refund it like we said" gives it nothing. Every brief must be self-contained, and anything that must survive belongs in a required field of a schema, as the wallet constraint did in section 05.</p>
  <p>The third is the opposite problem: sending too much. Returning a worker's entire transcript, with every tool call and raw result, to the lead or supervisor floods its context and throws away the benefit of having workers. Return only the final, short, preferably structured answer, as the supervisor graph did (it saw 4 messages, not the 10 that the workers produced).</p>
  <p>The fourth is giving two agents the power to make the same write, which produced ₹322 refunded on a ₹282 order. Give each kind of write one owner, and put the hard rule (total refunds never exceed the order total) in the data layer where every agent must pass it.</p>
  <p>The fifth is relying on per-agent step caps alone. Each agent may stop after 10 steps, but agents can keep transferring to each other indefinitely, as the ping-pong run showed. Add a global step, token or time budget per conversation.</p>
  <p>The sixth is trusting MCP servers blindly. Their tool descriptions and results go straight into your model's prompt, so a poisoned server can steer your agent. Use trusted sources, least privilege and approvals for writes, and remember that in a stdio server a stray <code>print</code> breaks the protocol.</p>
  <p>The last is testing only end to end. When a five-agent run fails, it tells you little about which part failed. Test each role, each handoff and the routing with stand-ins, as this page does, and then evaluate the whole system on realistic cases.</p>

  <h2 id="ma-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Multi-agent system</b>: several LLM agents, each with its own prompt, tools and context, cooperating on one job.</li>
    <li><b>Role</b>: system prompt + allowed tools (+ sometimes its own model). <b>Allow-list</b>: the harness only runs tools the active role may use.</li>
    <li><b>Handoff</b>: a transfer tool that changes the active agent; the new agent then talks to the user.</li>
    <li><b>Supervisor</b>: a router agent picks the next worker after every step. <b>Swarm</b>: agents hand off to each other directly. <b>Pipeline</b>: fixed stages in code.</li>
    <li><b>Orchestrator-workers</b>: a lead splits the job at run time; workers with fresh contexts run in parallel.</li>
    <li><b>Context isolation</b>: raw material stays in the worker; only a short result returns.</li>
    <li><b>Coordination failure</b>: each agent is right by its own rules, the team result is wrong.</li>
    <li><b>MCP</b>: open standard connecting AI apps (hosts, with one client per server) to tool servers over JSON-RPC.</li>
    <li><b>A2A</b>: protocol for an agent to hand tasks to another, opaque agent; Agent Card + task lifecycle.</li>
  </ul>
  <h3>Patterns compared (Asha's two-problem request)</h3>
  <table class="tbl">
    <tr><th>Design</th><th>Who decides next</th><th>Model calls</th><th>Use when</th></tr>
    <tr><td>One agent</td><td>The model, alone</td><td>4</td><td>The default</td></tr>
    <tr><td>Pipeline</td><td>Your code</td><td>4</td><td>Same steps every time</td></tr>
    <tr><td>Swarm</td><td>Current agent via handoff</td><td>6</td><td>Conversations moving between experts</td></tr>
    <tr><td>Supervisor</td><td>Router agent each step</td><td>10</td><td>Varied jobs needing central control</td></tr>
    <tr><td>Orchestrator-workers</td><td>Lead, at run time</td><td>lead, worker, worker, lead</td><td>Wide, independent, reading-heavy work</td></tr>
  </table>
  <h3>MCP essentials</h3>
  <table class="tbl">
    <tr><th>Topic</th><th>Fact</th></tr>
    <tr><td>Why</td><td>N × M connectors → N + M (5 apps × 20 systems: 100 → 25)</td></tr>
    <tr><td>Roles</td><td>Host (app, LLM, consent) · client (one per server) · server (talks to the real system)</td></tr>
    <tr><td>Session</td><td><code>initialize</code> → <code>notifications/initialized</code> → <code>tools/list</code> → <code>tools/call</code></td></tr>
    <tr><td>Server primitives</td><td>Tools (model decides) · resources (app reads by URI) · prompts (user picks)</td></tr>
    <tr><td>Client primitives</td><td>Sampling · elicitation · roots</td></tr>
    <tr><td>Transports</td><td>stdio (local subprocess) · Streamable HTTP (remote, OAuth); HTTP+SSE deprecated</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from mcp.server.mcpserver import MCPServer     # 1.x: from mcp.server.fastmcp import FastMCP
mcp = MCPServer("biteful-orders")

@mcp.tool()
def get_order(order_id: int) -&gt; str: ...       # type hints -&gt; schema, docstring -&gt; description

@mcp.resource("policy://{name}")
def policy(name: str) -&gt; str: ...

mcp.run()                                      # stdio; transport="streamable-http" for remote

# client side
async with Client(StdioServerParameters(command="python", args=["biteful_server.py"])) as c:
    tools = await c.list_tools()
    res = await c.call_tool("get_order", {"order_id": 101})</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Roles are enforced by the harness's allow-list, not by the prompt.</li>
    <li>Pass only final results; briefs must be self-contained and schema-checked.</li>
    <li>One owner per write, caps in the data layer; a global budget stops ping-pong.</li>
    <li>A critic only helps if it checks real data.</li>
    <li>MCP is not a security layer (tool poisoning); stdio servers log to stderr, never stdout.</li>
    <li>Split only for breadth, separation or ownership, and beat the single-agent baseline.</li>
  </ul>

  <h2 id="ma-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a multi-agent system, and why would you build one?</summary><div class="qa-body">It is a set of LLM agents, each with its own prompt, tools and context, cooperating on one job. Reasons to build one are breadth (independent sub-tasks whose material would overflow one context), separation (parts need different tools or permissions) and ownership (different teams or companies run the agents). Otherwise a single agent is usually cheaper and just as good.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What gets worse as one agent accumulates tools?</summary><div class="qa-body">Every call carries every tool schema and rulebook, so cost per call rises. Overlapping descriptions compete for each decision (refund vs coupon vs wallet), so tool choice gets less reliable. Instructions from different domains conflict, and any message, including injected text, can reach every write tool, which increases the damage a prompt injection can do.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a "role", and how is a handoff implemented?</summary><div class="qa-body">A role is a system prompt plus the set of tools the agent may use, sometimes with its own model. A handoff is a tool such as <code>transfer_to_refunds</code> whose only effect is to change which role is active, so the next model call uses the new role's prompt. The harness enforces each role's allow-list, because the prompt alone does not stop a model from trying other tools.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Supervisor vs swarm vs pipeline: who decides what runs next in each?</summary><div class="qa-body">In a supervisor system, a routing agent decides after every step, which gives central control but costs the most calls. In a swarm, the current agent decides by calling a handoff tool, which is cheaper but nobody owns the overall plan. In a pipeline, your code fixes the stages, which is cheapest and most predictable but cannot handle cases nobody anticipated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you implement a supervisor in LangGraph?</summary><div class="qa-body">Use <code>MessagesState</code> as shared state. The supervisor is a node that asks a structured-output router for the next worker and returns <code>Command(goto=...)</code>. Each worker is a node, often a whole <code>create_agent</code> graph, that runs, writes only its final message into state, and returns <code>Command(goto="supervisor")</code>. Checkpoints and interrupts work exactly as for a single agent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you implement a sub-agent using only a chat API?</summary><div class="qa-body">Expose it to the lead as a tool, for example <code>delegate(task)</code>. When the lead calls it, make a fresh model call whose only message is the task, often with a cheaper model, and return its short answer as the tool result. Several delegate calls in one turn can run in parallel, and all results go back to the lead in one message.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is context isolation, and why is it the main benefit of orchestrator-workers?</summary><div class="qa-body">Each worker keeps its raw material in its own context and returns only a short summary, so the lead's context holds summaries instead of everything. In our example the lead held 450 words instead of 45,000. Total work does not shrink, but no single context is overloaded, and models reason better over short, focused contexts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should agents pass structured briefs rather than free text?</summary><div class="qa-body">A worker sees only its brief, so anything left out does not exist for it. Our free-text brief "Refund order 101, it was late" dropped the customer's request to refund to the wallet, and the money went to a closed account. A schema with required fields, validated before acting, makes omissions visible and rejects malformed briefs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name four coordination failures and their fixes.</summary><div class="qa-body">Ping-pong (agents transferring back and forth): a per-conversation step budget and clear "when not to transfer" rules. Lossy handoff: structured briefs with a constraints field. Duplicate action (two agents paying for the same thing): one owner per write and caps in the data layer. Useless critic: a critic that checks real data such as a ledger, tests or sources.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is a critic agent useful, and when is it wasted?</summary><div class="qa-body">It is useful when it has information the writer lacked: the ledger, test results, retrieved sources or a different model. It is wasted when it is the same model re-reading the same draft, which tends to agree ("Looks good!" to a wrong amount). Measure how often the critic rejects drafts; if almost never, remove it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does MCP solve? Explain N × M.</summary><div class="qa-body">Without a standard, each of N AI applications writes its own connector for each of M systems, giving N × M integrations with different auth, schemas and bugs. With MCP each application implements one client and each system ships one server, so N + M pieces cover every combination. Any MCP host can then use any MCP server.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain host, client and server in MCP.</summary><div class="qa-body">The host is the AI application the user works in; it owns the LLM, the UI and user consent. Inside it, one client per server maintains a connection. The server is a separate program that exposes tools, resources and prompts and talks to the real system, without needing to know which LLM is used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between tools, resources and prompts in MCP?</summary><div class="qa-body">Tools are actions the model chooses to call, such as <code>get_order</code>. Resources are read-only data identified by a URI that the application or user decides to load, such as <code>policy://late-orders</code>. Prompts are reusable templates the user picks, often shown as slash commands.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What actually goes over the wire in a stdio MCP session?</summary><div class="qa-body">JSON-RPC 2.0 messages, one JSON object per line, on the server process's stdin and stdout. The client sends <code>initialize</code>, then the <code>notifications/initialized</code> notification (no id, no reply), then requests like <code>tools/list</code> and <code>tools/call</code>, each answered by a reply with the same id. Because stdout is the channel, servers must log to stderr.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use stdio and when Streamable HTTP?</summary><div class="qa-body">stdio is for local servers the host starts as a subprocess, such as file, git or local database tools; security comes from the user's machine permissions. Streamable HTTP is for remote, shared, multi-user servers reachable at a URL, secured with OAuth or tokens. The older HTTP+SSE transport is deprecated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is MCP a security boundary? What is tool poisoning?</summary><div class="qa-body">No. MCP standardises connections but does not make a server trustworthy. Tool poisoning is when a malicious or compromised server places instructions in its tool descriptions or results, which the model reads as part of its prompt. Defend with trusted sources, least privilege and human approval for risky actions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>MCP vs A2A?</summary><div class="qa-body">MCP connects an agent to tools and data it controls: call a function, get a result. A2A connects an agent to another, opaque agent, often run by another company, with its own reasoning and long-running tasks that can pause for input. They combine: an A2A agent can use MCP tools internally.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your manager wants "planner, coder, tester, reviewer" agents for a coding assistant. What do you say?</summary><div class="qa-body">Start with one agent that can plan, edit and run tests, because coding steps are tightly coupled and splitting loses context at every hand-over while multiplying tokens. Add a separate agent only for a measured gap, for example an isolated reviewer with a fresh context, and compare it against the single-agent baseline on an eval set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A team and a single agent reach the same result on your test set. Which do you ship?</summary><div class="qa-body">The single agent. In our example both reached the same end state, but the supervisor used 10 model calls against 4, and tokens grow even faster. A team is justified only when it beats the baseline on quality per cost, or when breadth, separation or ownership requires it.</div></details>
</main>
`
});
