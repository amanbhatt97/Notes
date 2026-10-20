// notes/genai/multiagent.js — Multi-Agent Systems & MCP
Object.assign(TOPIC_CONTENT, {
  "multiagent": `<main>
<h1>Multi-Agent Systems &amp; MCP</h1>
  <div class="where"><span>Generative AI</span><span>Agents</span><span>Multi-Agent Systems &amp; MCP</span></div>
  <p class="lead">Biteful's support agent from <a class="xref" data-note="agent_build">Build an Agent from Scratch</a> handles Asha's late order 101 with three tools. Now the company wants it to handle everything: refunds, riders, cancellations, addresses, coupons, wallets, menus, allergens. Twelve tools, four rulebooks, one prompt. This note follows the need from "one agent is getting crowded" to <strong>roles and handoffs</strong>, the three classic shapes (<strong>supervisor, swarm, pipeline</strong>) plus parallel workers, how agents <strong>share state and pass messages</strong>, the ways they <strong>fail to coordinate</strong> (each reproduced), how tools are shared across agents and teams with <strong>MCP</strong> (and agents across companies with <strong>A2A</strong>), and finally <strong>when all this is overkill</strong>.</p>
  <div class="callout def"><span class="label">No API bill: what is real, what is a stand-in</span>
    <p>Every block ran in order like a notebook (Python 3.13, langgraph 1.2, mcp 2.2). No paid API is called. Every "model" is a labelled <strong>stand-in</strong>: a <code>FakeClient</code> whose <code>play</code> function returns scripted turns in the Messages API shape (it reads the system prompt to know which agent is speaking), a <code>ScriptedRouter</code> for the supervisor, and <code>Worker</code> objects standing in for whole sub-agents. Real: the order data, the refund ledger and complaint log, the handoff loop and allow-lists, the LangGraph supervisor graph, parallel threads, pydantic validation, the caps and checks, a real MCP server and client talking JSON-RPC over stdio. Model-call counts are counted from the runs; where a stand-in worker replaces a sub-agent, its calls are counted as one per tool call plus one answer (what a ReAct worker would make).</p>
  </div>

  <h2 id="ma-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 170" width="680">
<defs><marker id="ma-f0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="160" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="29" text-anchor="middle" font-size="12">Build an Agent</text><text x="90" y="45" text-anchor="middle" class="tm" font-size="10">one loop, three tools</text>
<rect x="10" y="62" width="160" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="81" text-anchor="middle" font-size="12">LangGraph</text><text x="90" y="97" text-anchor="middle" class="tm" font-size="10">state, nodes, Command</text>
<rect x="10" y="114" width="160" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="133" text-anchor="middle" font-size="12">asyncio</text><text x="90" y="149" text-anchor="middle" class="tm" font-size="10">async clients (MCP)</text>
<rect x="250" y="55" width="180" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="340" y="78" text-anchor="middle" font-size="13" font-weight="700">Multi-Agent &amp; MCP</text><text x="340" y="97" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="510" y="15" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="590" y="36" text-anchor="middle" font-size="12">Evaluation</text><text x="590" y="53" text-anchor="middle" class="tm" font-size="10">is the team better?</text>
<rect x="510" y="105" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="590" y="126" text-anchor="middle" font-size="12">Capstone</text><text x="590" y="143" text-anchor="middle" class="tm" font-size="10">ship one agent well</text>
<line x1="170" y1="32" x2="248" y2="72" stroke="currentColor" marker-end="url(#ma-f0)"/><line x1="170" y1="84" x2="248" y2="84" stroke="currentColor" marker-end="url(#ma-f0)"/><line x1="170" y1="136" x2="248" y2="98" stroke="currentColor" marker-end="url(#ma-f0)"/>
<line x1="430" y1="75" x2="508" y2="42" stroke="currentColor" marker-end="url(#ma-f0)"/><line x1="430" y1="92" x2="508" y2="128" stroke="currentColor" marker-end="url(#ma-f0)"/>
</svg><figcaption>Several agents built from the single-agent loop, wired with LangGraph or plain code, sharing tools over MCP; evaluation decides whether the team beats one agent.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="agent_build">Build an Agent from Scratch</a> and <a class="xref" data-note="langgraph">LangGraph</a></b><span>One tested agent (get_order, refund, notify) that refunds Asha's order 101 in four model calls; a graph runtime with state, nodes, conditional edges, <code>Command</code>, checkpoints and interrupts. Left open: what happens when one agent must cover the whole support desk, and how other teams' agents reuse its tools.</span></li>
    <li><b>This note adds: teams of agents</b><span>Roles, handoffs, supervisor / swarm / pipeline / parallel workers, structured briefs, four coordination failures and their fixes, MCP servers and clients, A2A, and a measured "is it worth it?" on the same Biteful requests.</span></li>
    <li><b>Leads to: <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>, <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a>, <a class="xref" data-note="agent_capstone">the capstone</a></b><span>Measuring whether a team beats a single agent; defending MCP servers and multi-agent writes; and shipping one well-built agent end to end.</span></li>
  </ol>

  <h2 id="ma-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain of needs. Two running requests from Asha: "Order 101 came 50 minutes late. I want my money back." and the two-problem version "Order 101 came 50 minutes late and the rider was rude. I want my money back."</p>
  <ol class="story">
    <li><b>One agent, twelve tools</b><span>Q: why not one agent for the whole desk? → Measured: 531 tokens of tool schemas on every call (vs 180), 2.3 look-alike tools per request (vs 1.5), 6 write tools reachable from any question (vs 3). How do we split it?</span></li>
    <li><b>Roles &amp; handoffs</b><span>Q: what is an agent "role", and how does a customer move between roles? → Role = prompt + allowed tools; a handoff is a tool that changes the active agent. Triage can't refund (blocked), transfers to refunds, which pays Rs 282. But who decides the order of work when there are two problems?</span></li>
    <li><b>Supervisor vs swarm vs pipeline</b><span>Q: who controls the flow? → Supervisor: a router after every step (10 model calls). Swarm: agents hand off peer to peer (6). Pipeline: fixed stages in code (4). Same end state. Some work is independent, though…</span></li>
    <li><b>Parallel workers</b><span>Q: can agents work at the same time? → Orchestrator-workers: the lead finds orders 101 and 103, two workers check them in parallel (4 calls). The lead's context: 450 words instead of 45,000. But what do agents actually pass to each other?</span></li>
    <li><b>Shared state &amp; messaging</b><span>Q: what crosses between agents? → Shared state (only final messages; the supervisor saw 1, 2, 3, 4) or a structured brief: a <code>Handoff</code> model with <code>constraints</code>; a sloppy brief is rejected. What goes wrong when they coordinate badly?</span></li>
    <li><b>Coordination failures</b><span>Q: how do teams fail? → Reproduced: ping-pong (6 transfers, no answer), lossy handoff (refund to a closed UPI account), duplicate action (Rs 322 paid on Rs 282), a same-model critic that approves a wrong amount. Fixes: caps, structured briefs, one owner per write, critics with real checks. Every team rewired its own tools, too…</span></li>
    <li><b>MCP</b><span>Q: how do many agents and apps share tools? → One server per system, one client per app: N + M connectors instead of N × M. A real Biteful MCP server answered <code>initialize</code>, <code>tools/list</code>, <code>tools/call</code>, <code>resources/read</code>. And agents owned by other companies?</span></li>
    <li><b>A2A</b><span>Q: how does our agent hand a task to a partner's agent? → Agent Card + a task lifecycle (working → input-required → completed). Time to build a real team…</span></li>
    <li><b>Build it: weekly complaints brief</b><span>Q: when does a team clearly help? → Two researchers in parallel, a writer with no tools, a citation check that caught an invented [T-19]. So when should we <em>not</em> do this?</span></li>
    <li><b>When multi-agent is overkill</b><span>Q: is it worth it? → Asha's two-problem request: one agent 4 calls, pipeline 4, swarm 6, supervisor 10, same end state. Split only for breadth, separation or ownership.</span></li>
  </ol>

  <h2 id="ma-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Multi-Agent &amp; MCP</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why split</div>
        <ul>
          <li><b>12 tools</b> — 531 schema tokens/call, look-alikes, 6 writes in reach</li>
          <li><b>Split for</b> breadth · separation · ownership</li>
          <li><b>Context isolation</b> — lead 450 words vs 45,000</li>
          <li>⚠ Costs multiply (≈15× tokens for a research team)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Roles &amp; handoffs</div>
        <ul>
          <li><b>Role</b> = system prompt + allowed tools</li>
          <li><b>Handoff</b> = transfer tool that changes <code>active</code></li>
          <li><b>Allow-list</b> enforced by the harness</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Supervisor</b> — router after every step (10 calls)</li>
          <li><b>Swarm</b> — peer handoffs (6)</li>
          <li><b>Pipeline</b> — fixed stages (4)</li>
          <li><b>Orchestrator-workers</b> — parallel, fresh contexts</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">State &amp; messages</div>
        <ul>
          <li><b>Shared state</b> — only final messages cross</li>
          <li><b>Structured brief</b> — pydantic Handoff with constraints</li>
          <li><b>Self-contained</b> — workers share no memory</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Failures</div>
        <ul>
          <li><b>Ping-pong</b> → step cap</li>
          <li><b>Lossy handoff</b> → structured brief</li>
          <li><b>Duplicate action</b> → one owner, refund cap</li>
          <li><b>Same-model critic</b> → critic with a real check</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">MCP &amp; A2A</div>
        <ul>
          <li><b>MCP</b> — host · client · server; tools, resources, prompts</li>
          <li><b>JSON-RPC</b> — initialize → tools/list → tools/call</li>
          <li><b>stdio</b> (local) · <b>Streamable HTTP</b> (remote)</li>
          <li><b>A2A</b> — agent ↔ agent: Agent Card, task lifecycle</li>
          <li>⚠ MCP is not a security layer</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When</div>
        <ul>
          <li><b>One agent first</b>; workflow if fixed</li>
          <li><b>Team</b> when independent, wide, separated or owned by others</li>
          <li><b>Measure</b> vs the single-agent baseline</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ma-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One Agent, Twelve Tools</span><span class="rm-sub">What crowding costs, measured</span></div></div>
      <div class="rm-item rm-done" data-target="ma-roles"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Roles &amp; Handoffs</span><span class="rm-sub">Prompt + tools; transfer tools</span></div></div>
      <div class="rm-item rm-done" data-target="ma-patterns"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Supervisor, Swarm, Pipeline</span><span class="rm-sub">Same request, three shapes</span></div></div>
      <div class="rm-item rm-done" data-target="ma-parallel"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Parallel Workers</span><span class="rm-sub">Orchestrator-workers, isolation</span></div></div>
      <div class="rm-item rm-done" data-target="ma-state"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Shared State &amp; Messaging</span><span class="rm-sub">What crosses between agents</span></div></div>
      <div class="rm-item rm-done" data-target="ma-fail"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Coordination Failures</span><span class="rm-sub">Four, reproduced and fixed</span></div></div>
      <div class="rm-item rm-done" data-target="ma-mcp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">MCP: Why &amp; How</span><span class="rm-sub">N × M → N + M</span></div></div>
      <div class="rm-item rm-done" data-target="ma-mcpbuild"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">MCP: Build &amp; Connect</span><span class="rm-sub">A Biteful server, raw JSON-RPC</span></div></div>
      <div class="rm-item rm-done" data-target="ma-a2a"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">A2A in Brief</span><span class="rm-sub">Agents across companies</span></div></div>
      <div class="rm-item rm-done" data-target="ma-build"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Build It: Complaints Brief</span><span class="rm-sub">Researchers + writer + check</span></div></div>
      <div class="rm-item rm-done" data-target="ma-overkill"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">When Multi-Agent Is Overkill</span><span class="rm-sub">Calls and context, compared</span></div></div>
      <div class="rm-item rm-done" data-target="ma-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="ma-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Org charts, leaks, budgets</span></div></div>
      <div class="rm-item rm-done" data-target="ma-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="ma-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="ma-why"><span class="num">01</span>One Agent, Twelve Tools</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our agent refunds Asha's order with three tools. The company now wants one agent for the whole desk: twelve tools and the rulebooks of refunds, delivery and food safety in one prompt. Why not? What actually gets worse as one agent grows, and can we measure it without a model?</p>
  </div>
  <p>Here are the twelve tools a do-everything support agent would carry, with the descriptions it would read, and ten typical customer messages with the tool each one needs. Below, the same tools split into three specialists of four tools each.</p>
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
  <p><code>lookalikes</code> is a crude, deterministic way to ask "how confusable are these tools for this message?": the tools whose description shares almost as many words with the message as the best one. A real model understands far more than shared words, but it faces the same pressure: every call, it must tell apart every description it was given. Now measure what we can measure without a model:</p>
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
  <p>Read the example first. For "Order 101 arrived 50 minutes late, I want my money back", four of the twelve tools look relevant: <code>get_order</code> and <code>refund</code> (right), but also <code>apply_coupon</code> and <code>wallet_balance</code> (they talk about money too). Inside the orders specialist only the two right ones remain. Then the table: the tool list alone costs about 531 tokens on <em>every</em> model call for the big agent, 180 for a specialist; there are 2.3 look-alikes per request instead of 1.5; and any message, even "does the dosa contain nuts?", reaches an agent that holds 6 write tools (refund, cancel, change address…) instead of at most 3.</p>
  <div class="cards">
    <div><b>Cost per call</b><p>Every schema and every rulebook is resent on every lap.</p><small>531 vs 180 tokens of schemas</small></div>
    <div><b>Confusion</b><p>Overlapping descriptions compete: refund vs coupon vs wallet.</p><small>2.3 vs 1.5 look-alikes</small></div>
    <div><b>Conflicting rules</b><p>"Be generous with refunds" next to "never guess about allergens".</p><small>one prompt, many voices</small></div>
    <div><b>Blast radius</b><p>A prompt injection in a menu question can reach the refund tool.</p><small>6 vs 3 write tools</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant with one person doing everything: taking orders, cooking, billing, cleaning, handling complaints. It works at five tables. At fifty, things get mixed up, and the person who can open the cash drawer is also the one any customer can talk to. Restaurants split into roles: host, kitchen, cashier.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>multi-agent system</strong>: several LLM agents, each with its own prompt, tools and context, cooperating on one job. <strong>Specialisation</strong>: giving each agent a narrow role so it sees fewer tools and one rulebook.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Concluding "always split". Splitting adds a routing decision (which can itself be wrong), more model calls, and hand-overs that lose information. A real model with 12 well-described tools is often fine. Section 11 measures the price.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Roles &amp; handoffs.</b> If we split the desk into specialists, what exactly is a "role" in code, and how does Asha's conversation get from the agent that greets her to the one that can refund?</div>

  <h2 id="ma-roles"><span class="num">02</span>Roles &amp; Handoffs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want a triage agent that greets, a refunds agent that pays, a delivery agent that files rider complaints. What makes them different agents if they share one model, and how is control passed from one to the next so the refunds agent talks to Asha directly?</p>
  </div>
  <p>A <strong>role</strong> is just two things: a system prompt (instructions) and the set of tools that agent may use. The trick for passing control: a <strong>handoff is a tool</strong> (<code>transfer_to_refunds</code>) whose only effect is to change which role is <code>active</code>. The next model call then uses the new role's prompt. Every call sends the same tool list (old <code>tool_use</code> blocks in history stay valid and the prompt cache stays warm); the harness enforces each role's allow-list.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank call centre. The IVR hears "card blocked" and transfers you to the cards team; the cards team now owns the call and the IVR is gone. The IVR physically can't unblock your card, however nicely you ask.</p>
  </div>
  <p>First the shared pieces: a stand-in client that knows which agent is speaking from the system prompt, and Biteful's data and tools.</p>
  <div class="fx" data-lang="py">from types import SimpleNamespace as NS
import itertools, json, threading

_ids = itertools.count(1)
def text(t):          return NS(type="text", text=t)
def call(name, **a):  return NS(type="tool_use", id=f"toolu_{next(_ids):02d}", name=name, input=a)

class FakeClient:
    """STAND-IN for the model API (same response shape). \`play(request)\` returns the
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
  <p>Now the roles and the handoff loop. Triage is scripted to misbehave first: it tries to refund directly, which its role doesn't allow.</p>
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
  <p>Line 1: triage asked for <code>refund</code>; the allow-list check (<code>b.name not in agent["allowed"]</code>) returned an error result instead of running it. Line 2: triage transferred, so <code>active</code> became <code>"refunds"</code>. Lines 3–4: on the next laps the refunds prompt was used; it looked up 101 and paid Rs 282. The function returned <code>active="refunds"</code>: store it with the session so Asha's next message goes straight to refunds.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Role</strong>: an agent's instructions + allowed tools (+ often its own model). <strong>Handoff</strong>: control of the conversation moves from one agent to another, via a transfer tool. <strong>Allow-list</strong>: the harness only runs tools listed for the active role.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Relying on the prompt "Never act yourself" to keep triage from refunding. It tried anyway; only the allow-list stopped it. Roles are enforced in code.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Supervisor, swarm, pipeline.</b> Asha's second message has two problems: a late order (refunds) and a rude rider (delivery). Who decides that both specialists work, in which order, and who writes the final reply?</div>

  <h2 id="ma-patterns"><span class="num">03</span>Supervisor, Swarm, Pipeline</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Order 101 came 50 minutes late and the rider was rude. I want my money back." needs a refund <em>and</em> a complaint. Should a manager agent route the work, should the specialists pass it along among themselves, or should code fix the order of stages? What does each cost on this exact request?</p>
  </div>
  <p>Three classic shapes, all run on the same request, all ending in the same world state (one refund of Rs 282, one rider complaint), so the only differences are control and cost.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p><strong>Supervisor</strong>: a newspaper desk editor; every hand-over passes through the editor's desk. <strong>Swarm</strong>: a hospital ward where the nurse sends you to the doctor, who sends you to radiology, with no central desk. <strong>Pipeline</strong>: an assembly line; the stations and their order are fixed.</p>
  </div>
  <h3>Supervisor (LangGraph)</h3>
  <p>A <strong>supervisor</strong> node picks the next worker; each worker runs, writes only its final message into shared state, and returns control. The graph is a function that <em>receives</em> the router and workers, so tests can pass stand-ins (in production: <code>router = llm.with_structured_output(Route)</code> and workers built with <code>create_agent</code>).</p>
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
END = {"supervisor": (LEDGER.copy(), COMPLAINTS.copy())}
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
  <p>The supervisor ran four times and saw 1, 2, 3, then 4 messages: the question plus one final message per finished worker. Each worker node returned <code>Command(update=…, goto="supervisor")</code> (a node choosing the next node itself, from <a class="xref" data-note="langgraph">LangGraph</a>). The writer read the two workers' results from shared state and composed the reply. Model calls: 4 for routing + 6 inside the workers (refunds: 2 tools + answer; delivery: 1 + answer; writer: 1) = <strong>10</strong>.</p>
  <h3>Swarm (peer-to-peer handoffs)</h3>
  <p>No manager: each agent does its part and <em>hands off</em> to the next with the transfer tools from section 02. The refunds agent notices the rider complaint and transfers to delivery itself.</p>
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
END["swarm"] = (LEDGER.copy(), COMPLAINTS.copy())
print("model calls:", swarm_calls, "| ends with:", active, "| ledger:", LEDGER, "| complaints:", COMPLAINTS)</div>
  <div class="fx" data-lang="text">  [triage ] transfer_to_refunds -&gt; Transferred.
  [refunds] get_order           -&gt; {"order_id": 101, "customer": "asha", "total": 282
  [refunds] refund              -&gt; Refunded Rs 282 for 101 (late) to UPI.
  [refunds] transfer_to_delivery -&gt; Transferred.
  [delivery] file_complaint      -&gt; Complaint C-1 filed about the rider on order 101.
reply: Sorry, Asha! Rs 282 is refunded for order 101, and we've filed a complaint about the rider.
model calls: 6 | ends with: delivery | ledger: [(101, 282, 'late', 'UPI')] | complaints: [(101, 'rider')]</div>
  <p>Triage → refunds (look up, pay) → delivery (file complaint, answer Asha). <strong>6</strong> model calls, and the conversation ends with delivery active. Nobody re-reads the whole state after each step, which is why it is cheaper; but nobody checks the overall plan either.</p>
  <h3>Pipeline (fixed stages)</h3>
  <p>When the stages are always the same (classify → resolve each issue → draft → check), code can fix the order. Each stage is one prompted call (stand-ins here), and the final check is plain code.</p>
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
END["pipeline"] = (LEDGER.copy(), COMPLAINTS.copy())
print("issues :", issues)
print("reply  :", reply)
print("qa ok  :", qa(reply), "| model calls:", pipe_calls, "| ledger:", LEDGER, "| complaints:", COMPLAINTS)</div>
  <div class="fx" data-lang="text">issues : [('late', 101), ('rider', 101)]
reply  : Sorry, Asha! Refunded Rs 282 for 101 (late) to UPI. Complaint C-1 filed about the rider on order 101.
qa ok  : True | model calls: 4 | ledger: [(101, 282, 'late', 'UPI')] | complaints: [(101, 'rider')]</div>
  <p>Classify found two issues; code dispatched each to its resolver; the draft was checked in code (mentions Rs 282 and order 101). <strong>4</strong> model calls. A pipeline is really a <em>workflow</em> of agents (<a class="xref" data-note="agentic">Agent Fundamentals</a>): cheapest and most predictable, but it can't handle an issue type nobody anticipated.</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>Who decides what runs next</th><th>Model calls here</th><th>Good for</th><th>Watch out for</th></tr>
    <tr><td><strong>Supervisor</strong></td><td>A routing agent, after every step</td><td>10</td><td>Varied tasks, central control, audit</td><td>Cost; a bottleneck that re-reads everything</td></tr>
    <tr><td><strong>Swarm</strong></td><td>The current agent, via handoff tools</td><td>6</td><td>Conversations that move between experts</td><td>Ping-pong; nobody owns the whole plan</td></tr>
    <tr><td><strong>Pipeline</strong></td><td>Your code: fixed stages</td><td>4</td><td>Same steps every time</td><td>Unanticipated cases</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Supervisor pattern</strong>: a central agent routes work to workers and gets control back after each. <strong>Swarm (handoff) pattern</strong>: agents transfer control directly to each other. <strong>Pipeline</strong>: a fixed sequence of agent stages.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Passing each worker's full transcript back to the supervisor. Its context fills with tool chatter (here 6 scratch messages were kept out), which defeats the point of having workers.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Parallel workers.</b> All three ran the work one after another. When Asha's message mentions two orders, the checks are independent. Can several agents work at the same time, and what does that do to each agent's context?</div>

  <h2 id="ma-parallel"><span class="num">04</span>Parallel Workers (Orchestrator-Workers)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha writes "Both my orders 101 and 103 came really late!" The two checks don't depend on each other. Can a lead agent discover the sub-tasks at runtime, run workers at the same time, and keep its own context small?</p>
  </div>
  <p>In <strong>orchestrator-workers</strong>, a lead agent splits the job at runtime and calls a <code>delegate</code> tool once per sub-task, in one turn. The harness runs one <strong>worker</strong> per call, each with a <em>fresh</em> context (only its task) and often a cheaper model, in parallel; all results go back to the lead in one message.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A manager sends two analysts to check two branches. Each reads the branch's files; the manager reads two one-line memos and decides. It works because the branches are independent.</p>
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
  <p>Lap 1: the lead found two order numbers and returned two <code>delegate</code> calls in one turn. The harness ran both workers in a <code>ThreadPoolExecutor</code>; each worker saw only "Check order 101 against the 45-minute rule" (or 103), really looked the order up, and replied in one line. Lap 2: the lead got both results in one message and merged them. Four model calls: lead, worker, worker, lead.</p>
  <p>The real reason to do this is <strong>context isolation</strong>. Suppose each sub-task needs a lot of raw reading, like a weekly review of complaint tickets from three cities:</p>
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
  <p>The lead's context fell from 45,000 words to 450: only summaries travel up. The total work didn't shrink (it grew by the summaries), but no single context is overloaded, and a short, focused context is where models reason best.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Orchestrator-workers</strong>: a lead LLM decomposes a task at runtime, delegates sub-tasks to workers with fresh contexts, and merges their outputs. <strong>Context isolation</strong>: a worker's raw material stays in its own context; only a short result returns.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Vague delegation ("look into the orders") makes workers duplicate each other or miss things. The lead's instructions must demand distinct scopes and a required output shape.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Shared state &amp; messaging.</b> Workers return one line; supervisors read final messages. What exactly should cross between agents, in what format, so that nothing the customer said gets lost on the way?</div>

  <h2 id="ma-state"><span class="num">05</span>Shared State &amp; Messaging</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Agents don't share memory: each has its own context. Asha writes "Please refund to my Biteful wallet, my UPI account is closed." When triage hands her to refunds, how does that instruction travel, and how do we notice if it didn't?</p>
  </div>
  <p>Two ways agents communicate. <strong>Shared state</strong> (a blackboard): one structure all agents read and write, like LangGraph's <code>MessagesState</code> in the supervisor graph, where we chose to write only each worker's final message. <strong>Message passing</strong>: an explicit brief from one agent to the next (a delegate task, a handoff summary). Either way, the safest content is <strong>structured</strong>: a schema that names every field the receiver needs, checked in code.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hospital shift change. A verbal "bed 4 is fine" loses the allergy; a handover form with a mandatory "allergies" box doesn't, and a form with that box empty is sent back.</p>
  </div>
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
  <p>The free-text brief a hurried triage writes, "Refund order 101, it was late.", is accurate and still loses the one thing Asha cared about. The <code>Handoff</code> model has a required <code>constraints</code> list, so the brief carries "refund to Biteful wallet, not UPI". And a sloppy brief (order id "one-oh-one", no constraints) is rejected by pydantic with two named errors, before any agent acts on it.</p>
  <table class="tbl">
    <tr><th>What crosses</th><th>Example here</th><th>Rule</th></tr>
    <tr><td>Final results only</td><td>Supervisor saw 1, 2, 3, 4 messages; 6 scratch messages stayed inside workers</td><td>Never pass a worker's whole transcript</td></tr>
    <tr><td>Structured brief</td><td><code>Handoff(customer, order_id, issue, constraints)</code></td><td>Validate before acting; required constraint field</td></tr>
    <tr><td>Self-contained tasks</td><td>"Check order 101 against the 45-minute rule"</td><td>The worker knows nothing else</td></tr>
    <tr><td>Shared facts</td><td>The refund ledger, the complaint log</td><td>One source of truth that every agent checks</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shared state / blackboard</strong>: a data structure every agent reads and writes. <strong>Message passing</strong>: agents communicate only through explicit messages. <strong>Structured handoff</strong>: messages that follow a schema checked in code.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Briefs that assume shared memory: "continue from what we discussed" sent to a worker with a fresh context. Every brief must be self-contained.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Coordination failures.</b> We have roles, patterns and briefs. What do multi-agent runs look like when coordination goes wrong, and which of the fixes we've seen actually stop each failure?</div>

  <h2 id="ma-fail"><span class="num">06</span>Coordination Failures</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A single agent can loop or misread an argument. A team adds new ways to fail: agents passing the customer back and forth, a constraint lost between agents, two agents both paying, a "checker" agent that checks nothing. What does each look like on Biteful's ledger?</p>
  </div>
  <p>Four failures, each reproduced with stand-ins that behave the way the failing agents would, then fixed.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A relay team that drops the baton (lossy hand-over), two runners who both run the third leg (duplicate), two who keep waving each other on (ping-pong), and a coach who says "great run!" without looking at the clock (useless critic).</p>
  </div>
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
  <ul>
    <li><strong>Ping-pong</strong>: triage sends Asha to refunds, refunds sends her back, six times; only <code>max_steps</code> ended it, with no answer. Fix: a step cap per conversation, and transfer descriptions that say when <em>not</em> to transfer.</li>
    <li><strong>Lossy handoff</strong>: given the free-text brief, the refunds specialist sent Rs 282 to the closed UPI account; given the structured brief, to the wallet. Fix: structured briefs with a constraints field (section 05).</li>
    <li><strong>Duplicate action</strong>: for "late and the coffee was missing", the refunds agent paid the full Rs 282 (which already covers the coffee) and an items agent paid Rs 40 more: Rs 322 on a Rs 282 order. Fix: one owner for each kind of write, plus a data rule that total refunds per order can't exceed the order total (<code>capped_refund</code> blocked the second payment).</li>
  </ul>
  <p>The fourth failure is a <strong>critic</strong> that adds nothing. A popular idea: add a second agent to check the first one's reply. It helps only if the critic knows something the writer didn't.</p>
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
  <p>Draft 1 says Rs 280; the ledger says 282. A same-model critic re-reading the draft with no new information tends to agree ("Looks good!"). The ledger critic compares every "Rs X for order N" claim with the ledger and returns feedback a writer can act on; draft 2 passes.</p>
  <div class="cards">
    <div><b>Critic / evaluator</b><p>Draft, check against criteria, loop until pass.</p><small>Needs a real check (ledger, tests, sources)</small></div>
    <div><b>Debate</b><p>Agents answer, see each other's answers, revise; a judge picks.</p><small>Some gains on reasoning; costly</small></div>
    <div><b>Hierarchical</b><p>Supervisors of supervisors.</p><small>Only for very large tasks</small></div>
  </div>
  <table class="tbl">
    <tr><th>Failure</th><th>On Biteful</th><th>Fix</th></tr>
    <tr><td>Ping-pong / runaway</td><td>6 transfers, no answer</td><td>Step and token budget per conversation; "when not to transfer"</td></tr>
    <tr><td>Lossy handoff</td><td>Refund to a closed account</td><td>Structured briefs with constraints, validated</td></tr>
    <tr><td>Duplicate action</td><td>Rs 322 paid on Rs 282</td><td>One owner per write; caps and idempotency in the data layer</td></tr>
    <tr><td>Useless critic</td><td>"Looks good!" to Rs 280</td><td>Critics with information: ledger, tests, sources</td></tr>
    <tr><td>Errors compound</td><td>A worker's wrong "fact" becomes the lead's premise</td><td>Workers cite sources; verify in code</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Coordination failure</strong>: each agent behaves "correctly" for its own instructions, but the team's combined result is wrong. <strong>Critic</strong>: an agent or program that grades another's output and returns feedback.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling a system "self-verifying" because it has a same-model critic. Measure how often the critic rejects anything; if almost never, it costs tokens and adds nothing.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: MCP.</b> Inside our team every agent calls the same Python functions. But the restaurant-partner app, the analytics agent and next year's voice bot all need "look up order 101" too, each written by a different team. Must each one rewrite the connector?</div>

  <h2 id="ma-mcp"><span class="num">07</span>MCP: Why &amp; How</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's order lookup is needed by the support agents, the restaurant-partner assistant and an internal analytics agent, and those agents also need GitHub, Slack and the wiki. Without a standard, how many connectors does that take, and what does a standard look like on the wire?</p>
  </div>
  <p>Every agent needs tools: the order database, GitHub, Slack, the wiki. Without a standard, each AI app writes its own connector for each system: 5 apps and 20 systems is 100 connectors, each with its own bugs, auth and schema format. The <strong>Model Context Protocol (MCP)</strong> fixes this with one shared protocol: each system ships one MCP <strong>server</strong>, each app implements one MCP <strong>client</strong>, and any app can use any server: 5 + 20 = 25.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>USB-C. Laptops don't need a special port per device. Where the analogy breaks: a USB device can't trick your laptop with words, but an MCP server's tool descriptions go straight into the model's prompt.</p>
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
  <p>Three roles. The <strong>host</strong> is the AI app (Claude Desktop, Claude Code, your support app): it owns the LLM, the UI and user consent. Inside it, one <strong>client</strong> per server holds a connection. The <strong>server</strong> is a small program that exposes capabilities and talks to the real system. A session, step by step (we run exactly this in the next section):</p>
  <table class="tbl out"><caption>One MCP session</caption>
    <tr><th>#</th><th>Client sends</th><th>Server replies</th></tr>
    <tr><td>1</td><td><code>initialize</code> (protocol version, capabilities)</td><td>server name, version, capabilities (tools, resources, prompts)</td></tr>
    <tr><td>2</td><td><code>notifications/initialized</code> (no reply expected)</td><td>–</td></tr>
    <tr><td>3</td><td><code>tools/list</code></td><td>each tool's name, description, JSON schema</td></tr>
    <tr><td>4</td><td><code>tools/call</code> {name, arguments}</td><td>content blocks + <code>isError</code></td></tr>
  </table>
  <table class="tbl">
    <tr><th>Primitive</th><th>Offered by</th><th>Who decides to use it</th><th>Biteful example</th></tr>
    <tr><td><strong>Tools</strong></td><td>Server</td><td>The model</td><td><code>get_order(order_id)</code></td></tr>
    <tr><td><strong>Resources</strong></td><td>Server</td><td>The app / user (read-only data by URI)</td><td><code>policy://late-orders</code></td></tr>
    <tr><td><strong>Prompts</strong></td><td>Server</td><td>The user (templates, slash commands)</td><td>"Reply about a late order"</td></tr>
    <tr><td><strong>Sampling</strong></td><td>Client</td><td>Server asks the host's LLM for a completion</td><td>Server needs a summary, has no API key</td></tr>
    <tr><td><strong>Elicitation</strong></td><td>Client</td><td>Server asks the user mid-task</td><td>"Which order did you mean?"</td></tr>
    <tr><td><strong>Roots</strong></td><td>Client</td><td>Host tells the server which folders it may touch</td><td><code>file:///srv/biteful/exports</code></td></tr>
  </table>
  <table class="tbl">
    <tr><th></th><th>stdio</th><th>Streamable HTTP</th></tr>
    <tr><td>How</td><td>Host starts the server as a subprocess; JSON-RPC over stdin/stdout</td><td>Server is a web service at one endpoint (e.g. <code>/mcp</code>); can stream</td></tr>
    <tr><td>Use for</td><td>Local tools: files, git, a local DB</td><td>Remote, shared, multi-user servers</td></tr>
    <tr><td>Auth</td><td>The user's machine permissions</td><td>OAuth 2.1 / tokens</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MCP</strong>: an open standard for connecting AI applications to tools and data. <strong>JSON-RPC 2.0</strong>: a request has <code>id</code>, <code>method</code>, <code>params</code>; the reply carries the same <code>id</code> and a <code>result</code> or <code>error</code>. The older "HTTP + SSE" transport is deprecated; use Streamable HTTP for remote servers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: MCP is not a security layer</span>
    <p>A malicious or compromised server can put instructions in tool descriptions or results ("tool poisoning"). Install servers only from sources you trust, give them least privilege, and keep human approval for risky actions (<a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: MCP: build &amp; connect.</b> That's the protocol on paper. What does a Biteful MCP server look like in code, and what really travels over stdin and stdout?</div>

  <h2 id="ma-mcpbuild"><span class="num">08</span>MCP: Build &amp; Connect</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How little code is a server that exposes <code>get_order</code>, the refund policy and a reply template to any MCP host, and can we see the handshake and the tool call as raw JSON?</p>
  </div>
  <p>Writing a server should be the easy part: the point is that each system writes one. The official Python SDK (<code>pip install "mcp[cli]"</code>) turns decorated functions into capabilities: type hints become the JSON schema, docstrings become descriptions, exactly like <code>@tool</code> in <a class="xref" data-note="agent_build">Build an Agent from Scratch</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Opening a counter in a mall food court. Follow the mall's standard (menu board, token system, payment terminal) and any customer who knows the mall can order from you.</p>
  </div>
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
  <p>Three decorators, three primitives: <code>@mcp.tool()</code> (the model may call it), <code>@mcp.resource("policy://{name}")</code> (the app reads it by URI), <code>@mcp.prompt()</code> (a template the user picks). <code>mcp.run()</code> serves over stdio. <em>Version note:</em> this is <code>mcp</code> 2.x (<code>MCPServer</code>); most tutorials show 1.x, <code>from mcp.server.fastmcp import FastMCP</code>, with the same decorators. Test it from a plain MCP client, no LLM involved:</p>
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
  <p><code>Client(params)</code> started <code>biteful_server.py</code> as a subprocess, did the handshake, listed one tool and called it twice (101 found; 999 not). To demystify the protocol, the same session with <em>no SDK on the client side</em>: JSON lines written to the server's stdin.</p>
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
  <div class="fx" data-lang="text">1 initialize -&gt;  biteful-orders | capabilities: ['experimental', 'prompts', 'resources', 'tools']
2 tools/list -&gt;  get_order {"order_id": {"title": "Order Id", "type": "integer"}}
3 tools/call -&gt;  Order 102: {'restaurant': 'Pizza Planet', 'total': 450, 'minutes_late': 35} | isError: False
4 resources/read -&gt; More than 45 minutes late: Biteful refunds the full order amount.</div>
  <p>This is the session table from section 07, for real. <code>send</code> writes one JSON object per line and, for requests (those with an <code>id</code>), reads one line back. The server answered <code>initialize</code> with its name and capabilities, listed <code>get_order</code> with a schema generated from <code>order_id: int</code>, ran it for order 102 (35 minutes late; <code>isError: False</code>), and served the late-order policy as a resource.</p>
  <h3>Three ways a host uses it</h3>
  <p><strong>1. An existing host.</strong> Claude Code: <code>claude mcp add biteful-orders -- python biteful_server.py</code>. Claude Desktop reads a config file entry <code>"mcpServers": {"biteful-orders": {"command": "python", "args": ["/path/to/biteful_server.py"]}}</code>.</p>
  <p><strong>2. Your own host app.</strong> Open a client session as above, call <code>list_tools()</code>, convert each tool to your model's tool format, and when the model calls one, forward it with <code>call_tool</code>. SDK helpers do the conversion (the Anthropic SDK's MCP helpers; <code>langchain-mcp-adapters</code> for LangChain/LangGraph agents).</p>
  <p><strong>3. A remote server, no client code.</strong> For a server on Streamable HTTP, model APIs offer an MCP connector: you pass the server URL in the request and the provider's side connects to it. Check your provider's docs for the current parameter names.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>stdio transport</strong>: the host launches the server and talks over its standard input/output. <code>mcp.run(transport="streamable-http")</code> serves over HTTP instead; clients connect to the server's <code>/mcp</code> endpoint.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Printing debug output to stdout in a stdio server. stdout <em>is</em> the protocol channel, so a stray <code>print</code> corrupts the JSON stream. Log to stderr.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: A2A.</b> MCP connects an agent to tools we control. When Asha's rider complaint must go to the delivery partner's own agent, which investigates for an hour and may ask us questions, we're not calling a function; we're briefing another company's agent.</div>

  <h2 id="ma-a2a"><span class="num">09</span>A2A in Brief</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's riders come from a logistics partner, SwiftRide, which runs its own incident agent. How does our delivery agent find it, hand it Asha's rider complaint, and follow a task that may pause to ask for input?</p>
  </div>
  <p><strong>A2A (Agent2Agent)</strong>, an open protocol started by Google, standardises how agents discover each other, hand over tasks, and follow their progress. Two pieces matter most. The <strong>Agent Card</strong> is a visiting card at a well-known URL. The <strong>task lifecycle</strong> is a small state machine: a task can go from <code>working</code> to <code>input-required</code> and back, but a <code>completed</code> task can't start working again.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hiring a CA firm. You find them by their visiting card, hand over a task, they sometimes call you ("send Form 16"), and finally deliver. You never see how they work inside.</p>
  </div>
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
  <p>The first run is a legal path: SwiftRide's agent needed input once (say, the order's delivery photo), got it, and completed. The second tried to move a completed task back to working, and the <code>NEXT</code> table rejected it. Your client should enforce the same rules, so a buggy partner can't confuse your system. Messages carry the conversation; <strong>artifacts</strong> are the outputs (a report, a refund decision). It runs over HTTP with JSON-RPC and streaming, like MCP's remote transport.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>A2A</strong>: a protocol for an agent to call another, opaque agent. <strong>Agent Card</strong>: JSON listing skills, endpoint and auth. MCP = agent ↔ tools; A2A = agent ↔ agent. An A2A agent may use MCP tools internally.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using A2A for your own internal tools. If you control both sides and it is a function call, MCP (or a plain tool) is simpler.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Build it.</b> We have all the parts. What does a team look like on a job where splitting clearly helps: a wide job with lots of raw reading, independent parts, and a write-up whose sources must be checked?</div>

  <h2 id="ma-build"><span class="num">10</span>Build It: The Weekly Complaints Brief</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every Monday, support leads want "this week's top complaint themes" with ticket ids as evidence. It needs searching many tickets on separate themes, then one clean write-up. Can a team do it with researchers in parallel and a writer who can't invent sources?</p>
  </div>
  <p>Two <strong>researchers</strong> (search tool, own messy contexts) run in parallel on two themes and return structured findings: <code>{claim, source}</code>, validated with pydantic. The <strong>writer</strong> has no tools and sees only the findings. Finally plain code checks that every <code>[T-…]</code> citation in the brief came from a finding.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A news desk. Field reporters gather quotes with each source's name; the editor writes only from their notes; before printing, a fact-checker confirms every quote has a named source in the notes.</p>
  </div>
  <div class="flow"><span>Themes</span><span>Researchers (parallel, search tool)</span><span>Validated findings</span><span>Writer (no tools)</span><span>Citation check</span><span>Brief</span></div>
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
  <p>Key lines. <code>Report.model_validate_json</code> turns each researcher's final text into checked data: a malformed report fails loudly instead of being passed along. <code>writer</code> gets no <code>tools</code>, so injected text in tickets can't make it act. <code>check_citations</code> lists every cited id not present in any finding. Now a run with stand-ins: researchers really read their search observation and build findings from it; the writer cites three real sources and invents one.</p>
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
  <p>The searches found T-12, T-11, T-15 (late theme) and T-13, T-14, T-11 (missing-items theme); each researcher reported its top two. The brief cited T-11, T-12 and T-13 (all in the findings) and T-19, which no researcher ever found: the code check flagged it. That line turns "the writer might hallucinate a source" into a check that fails. Five model calls in total.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Structured handoff</strong>: agents exchange schema-checked data, not free text. <strong>Least privilege</strong>: each agent gets only the tools it needs (the writer gets none).</p>
  </div>
  <div class="callout pred"><span class="label">Extend it</span>
    <p>(1) Let a lead write the themes with a <code>delegate</code> tool (section 04). (2) Add the ledger-style critic from section 06 for numbers. (3) Serve <code>search_tickets</code> from an MCP server. Then measure: is the brief better than one agent with the same tool, and at what token cost?</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: When multi-agent is overkill.</b> The team worked here. On Asha's simple two-problem request, all four designs reached the same end state. What did the extra agents cost, and when is a single agent simply better?</div>

  <h2 id="ma-overkill"><span class="num">11</span>When Multi-Agent Is Overkill</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We built supervisors, swarms, pipelines and research teams. For Asha's request, did any of them do better than one agent with three tools? What decides whether the extra agents pay for themselves?</p>
  </div>
  <p>Run the same two-problem request through a single agent with all three tools, and put it next to the earlier runs:</p>
  <div class="fx" data-lang="py">AGENTS["solo"] = {"system": "Solo: you handle everything yourself.",
                  "allowed": {"get_order", "refund", "file_complaint"}}
LEDGER.clear(); COMPLAINTS.clear()
script = {"solo": [[call("get_order", order_id=101)], [call("refund", order_id=101, amount=282)],
                   [call("file_complaint", order_id=101, about="rider")],
                   [text("Sorry, Asha! Rs 282 refunded for order 101; rider complaint filed.")]]}
client = FakeClient(play)
chat(client, [{"role": "user", "content": TWO_PROBLEMS}], active="solo")
solo_calls = len(client.calls)
END["one agent"] = (LEDGER.copy(), COMPLAINTS.copy())
print(f"{'design':12}{'model calls':&gt;12}  end state (refunds | complaints)")
for name, n in [("one agent", solo_calls), ("pipeline", pipe_calls), ("swarm", swarm_calls),
                ("supervisor", sup_calls)]:
    refunds, complaints = END[name]
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
  <p>Every design produced the same end state: one Rs 282 refund for 101 and one rider complaint. The single agent and the pipeline took 4 model calls, the swarm 6, the supervisor 10: two and a half times the calls for an identical result. (And each of those calls resends its own prompt and tools, so tokens grow faster than calls.) For the weekly brief, the split did buy something: no context held more than 211 characters of raw results instead of 419; with five tickets that hardly matters, with five thousand it is the whole point.</p>
  <figure class="viz"><svg viewBox="0 0 520 120" width="520">
    <text x="8" y="31">chat</text><rect x="100" y="16" width="25" height="22" class="fs" stroke="currentColor"/><text x="131" y="31">1×</text>
    <text x="8" y="65">one agent</text><rect x="100" y="50" width="100" height="22" class="fb sb"/><text x="206" y="65">≈4×</text>
    <text x="8" y="99">multi-agent</text><rect x="100" y="84" width="375" height="22" class="fr sr"/><text x="481" y="99">≈15×</text>
  </svg><figcaption>Tokens per task (Anthropic's research system). Every agent re-reads its own instructions and context, so cost multiplies.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You don't form a committee to answer one customer's email. Committees earn their cost on big, separable jobs, or when different people must sign off different parts.</p>
  </div>
  <div class="callout intu"><span class="label">Decision rule</span>
    <p>Start with <strong>one agent</strong> (or a workflow, see <a class="xref" data-note="agentic">Agent Fundamentals</a>). Split only if at least one is true: <strong>Breadth</strong>: independent sub-tasks whose raw material would overflow one context (the weekly brief). <strong>Separation</strong>: parts need different tools or permissions (a menu bot must never hold the refund tool). <strong>Ownership</strong>: different teams or companies build and run the agents (SwiftRide via A2A). And the task must be worth several times the tokens; check it against the single-agent baseline on an eval set (<a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Single-agent baseline</strong>: the simplest design that can do the task, measured on the same eval set; any multi-agent design must beat it on quality per cost.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Planner, coder, tester, reviewer agents" because it looks like an org chart. Role-play doesn't make a model smarter; for tightly coupled work, splitting loses context and multiplies calls. A favourite interview question.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> Eleven ideas about teams of agents. How does each grow from the previous one, and which question does each answer on Asha's requests?</div>

  <h2 id="ma-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Roles, handoffs, supervisors, swarms, pipelines, workers, briefs, caps, critics, MCP, A2A: a zoo of patterns, or a few ideas combined in different ways?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 280" width="680">
<defs><marker id="ma-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="250" y="8" width="180" height="40" rx="8" class="fr sr"/><text x="340" y="25" text-anchor="middle" font-size="12" font-weight="700">One agent, 12 tools</text><text x="340" y="40" text-anchor="middle" font-size="9.5" class="tm">cost · look-alikes · blast radius</text>
<line x1="340" y1="48" x2="340" y2="66" stroke="currentColor" marker-end="url(#ma-c0)"/>
<rect x="230" y="68" width="220" height="40" rx="8" class="fb sb"/><text x="340" y="85" text-anchor="middle" font-size="12" font-weight="700">Roles</text><text x="340" y="100" text-anchor="middle" font-size="9.5" class="tm">prompt + allowed tools (+ model)</text>
<line x1="280" y1="108" x2="95" y2="136" stroke="currentColor" marker-end="url(#ma-c0)"/><line x1="320" y1="108" x2="255" y2="136" stroke="currentColor" marker-end="url(#ma-c0)"/><line x1="360" y1="108" x2="425" y2="136" stroke="currentColor" marker-end="url(#ma-c0)"/><line x1="400" y1="108" x2="585" y2="136" stroke="currentColor" marker-end="url(#ma-c0)"/>
<rect x="10" y="138" width="150" height="44" rx="8" class="fv"/><text x="85" y="157" text-anchor="middle" font-size="11.5">Supervisor</text><text x="85" y="172" text-anchor="middle" font-size="9.5" class="tm">router decides · 10 calls</text>
<rect x="180" y="138" width="150" height="44" rx="8" class="fv"/><text x="255" y="157" text-anchor="middle" font-size="11.5">Swarm</text><text x="255" y="172" text-anchor="middle" font-size="9.5" class="tm">handoff tools · 6 calls</text>
<rect x="350" y="138" width="150" height="44" rx="8" class="fv"/><text x="425" y="157" text-anchor="middle" font-size="11.5">Pipeline</text><text x="425" y="172" text-anchor="middle" font-size="9.5" class="tm">code decides · 4 calls</text>
<rect x="520" y="138" width="150" height="44" rx="8" class="fv"/><text x="595" y="157" text-anchor="middle" font-size="11.5">Parallel workers</text><text x="595" y="172" text-anchor="middle" font-size="9.5" class="tm">fresh contexts · 450 vs 45,000</text>
<rect x="10" y="212" width="320" height="40" rx="8" class="ft st"/><text x="170" y="229" text-anchor="middle" font-size="11.5">What crosses: final results, structured briefs</text><text x="170" y="244" text-anchor="middle" font-size="9.5" class="tm">fixes lossy handoffs; checks: caps, owners, real critics</text>
<rect x="350" y="212" width="320" height="40" rx="8" class="fg sg"/><text x="510" y="229" text-anchor="middle" font-size="11.5">Shared tools: MCP · other agents: A2A</text><text x="510" y="244" text-anchor="middle" font-size="9.5" class="tm">N + M connectors · Agent Card + task lifecycle</text>
<line x1="85" y1="182" x2="120" y2="210" stroke="currentColor" marker-end="url(#ma-c0)"/><line x1="255" y1="182" x2="220" y2="210" stroke="currentColor" marker-end="url(#ma-c0)"/><line x1="425" y1="182" x2="460" y2="210" stroke="currentColor" marker-end="url(#ma-c0)"/><line x1="595" y1="182" x2="560" y2="210" stroke="currentColor" marker-end="url(#ma-c0)"/>
<text x="340" y="272" text-anchor="middle" font-size="10" class="tm">all of it measured against the single-agent baseline (section 11)</text>
</svg><figcaption>Crowding motivates roles; roles combine into four shapes that differ only in who decides what runs next; every shape needs the same discipline about what crosses between agents, and shares tools and agents through MCP and A2A.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Asha's requests</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our example</th><th>When to use</th></tr>
    <tr><td>Crowded single agent</td><td>12 tools, 4 rulebooks</td><td>why split at all?</td><td>531 vs 180 schema tokens; 2.3 vs 1.5 look-alikes; 6 vs 3 writes</td><td>to decide whether to split</td></tr>
    <tr><td>Role</td><td>prompt + allow-list</td><td>what makes agents different?</td><td>triage can't refund (blocked)</td><td>any split</td></tr>
    <tr><td>Handoff</td><td>transfer tool + <code>active</code></td><td>how does control move?</td><td>triage → refunds → Rs 282</td><td>conversations between experts</td></tr>
    <tr><td>Supervisor</td><td>router + workers + shared state</td><td>who orders the work?</td><td>10 calls; saw 1, 2, 3, 4 messages</td><td>varied tasks needing central control</td></tr>
    <tr><td>Swarm</td><td>handoffs between peers</td><td>can agents pass work on?</td><td>6 calls; ends at delivery</td><td>customer-facing flows</td></tr>
    <tr><td>Pipeline</td><td>fixed stages in code</td><td>is the order fixed?</td><td>4 calls; QA in code</td><td>same steps every time</td></tr>
    <tr><td>Parallel workers</td><td>delegate tool + threads</td><td>can work run at once?</td><td>101 + 103 checked in parallel; lead 450 words</td><td>wide, independent sub-tasks</td></tr>
    <tr><td>Structured brief</td><td>pydantic schema</td><td>what crosses, intact?</td><td>wallet constraint kept; sloppy brief rejected</td><td>every hand-over</td></tr>
    <tr><td>Failure fixes</td><td>caps, owners, data rules, real critics</td><td>how do teams fail?</td><td>6 transfers; closed account; Rs 322; "Looks good!" to Rs 280</td><td>always</td></tr>
    <tr><td>MCP</td><td>host · client · server, JSON-RPC</td><td>how are tools shared?</td><td>get_order(102) over stdio</td><td>tools used by many apps</td></tr>
    <tr><td>A2A</td><td>Agent Card + task states</td><td>how do companies' agents work together?</td><td>SwiftRide: working → input-required → completed</td><td>opaque partner agents</td></tr>
    <tr><td>Overkill check</td><td>single-agent baseline</td><td>is the team worth it?</td><td>4 vs 10 calls, same end state</td><td>before every split</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p><strong>Every multi-agent design is one question asked three times: who decides what runs next (a router, the current agent, or your code), what crosses between agents (only results, in a checked shape), and who owns each write (exactly one).</strong> Get those right and the pattern names are details; get them wrong and adding agents adds failures.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The ideas are few; the mistakes repeat.</div>

  <h2 id="ma-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which multi-agent mistakes show up again and again, and what does each cost?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: splitting by job title</span>
    <p>Planner, coder, tester, reviewer agents for tightly coupled work. Split by independent sub-tasks, permissions or ownership, never by org chart. Compare against a single-agent baseline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: briefs that assume shared memory</span>
    <p>"Continue from what we discussed" sent to a worker with a fresh context. Every brief is self-contained and structured.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: leaking worker scratch work</span>
    <p>Returning a worker's whole transcript to the lead. Return only the final, short, preferably structured answer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: two owners for one write</span>
    <p>Refunds agent and items agent both allowed to pay for the same order: Rs 322 on Rs 282. One owner per write, and a cap in the data layer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no global budget</span>
    <p>Each agent has a step cap, but agents can keep transferring to each other. Add a total step, token or time budget per conversation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting MCP servers blindly</span>
    <p>A server's descriptions and results go straight into your model's prompt. Trusted sources, least privilege, approvals for writes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: testing only end to end</span>
    <p>A five-agent run that fails tells you little. Test each role and the routing with stand-ins (as in this note), then evaluate the whole.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a> to measure whether a team beats one agent, and <a class="xref" data-note="agent_capstone">the capstone</a> to ship one agent end to end.</div>

  <h2 id="ma-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. <strong>Running example</strong>: Biteful support. Asha's requests: "Order 101 came 50 minutes late. I want my money back." and "…late and the rider was rude." Order 101: Rs 282, 50 minutes late (refund in full); 103: Rs 1,250, 70 minutes late. Tools: <code>get_order</code>, <code>refund</code>, <code>file_complaint</code>. Roles: triage, refunds, delivery (+ writer, items in some runs). Every model is a labelled stand-in; data, ledger, loops, graphs, threads, validation and the MCP server are real.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On Asha's requests</th><th>Gap → next</th></tr>
    <tr><td>One agent, 12 tools</td><td>why split?</td><td>531 vs 180 tokens; 2.3 vs 1.5 look-alikes; 6 vs 3 writes</td><td>how to split?</td></tr>
    <tr><td>Roles &amp; handoffs</td><td>what is a role; how does control move?</td><td>triage blocked from refund; transfer; Rs 282 paid</td><td>two problems: who orders?</td></tr>
    <tr><td>Supervisor / swarm / pipeline</td><td>who decides next?</td><td>10 / 6 / 4 calls, same end state</td><td>independent work?</td></tr>
    <tr><td>Parallel workers</td><td>work at once?</td><td>101 + 103 in parallel; lead 450 vs 45,000 words</td><td>what crosses?</td></tr>
    <tr><td>State &amp; messaging</td><td>what passes between agents?</td><td>Handoff with constraints; sloppy brief rejected</td><td>how do teams fail?</td></tr>
    <tr><td>Coordination failures</td><td>team-level bugs?</td><td>ping-pong; closed account; Rs 322; "Looks good!"</td><td>shared tools?</td></tr>
    <tr><td>MCP</td><td>share tools across apps?</td><td>Biteful server: initialize, tools/list, tools/call, resources/read</td><td>other companies' agents?</td></tr>
    <tr><td>A2A</td><td>agent ↔ agent?</td><td>SwiftRide card; legal vs illegal task moves</td><td>when does a team help?</td></tr>
    <tr><td>Build it</td><td>a team that helps?</td><td>2 researchers + writer; [T-19] flagged; 5 calls</td><td>when not?</td></tr>
    <tr><td>Overkill</td><td>worth it?</td><td>4 vs 10 calls, same result</td><td>→ evals, capstone</td></tr>
  </table>
  <h3>Definitions and numbers</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Role</td><td>System prompt + allowed tools (+ model) for one agent.</td></tr>
    <tr><td>Handoff</td><td>A transfer tool that changes the active agent; the new agent talks to the user.</td></tr>
    <tr><td>Supervisor</td><td>Router agent decides after every step; workers return final results to shared state.</td></tr>
    <tr><td>Swarm</td><td>Agents hand off to each other directly; no central controller.</td></tr>
    <tr><td>Pipeline</td><td>Fixed stages in code; a workflow of agents.</td></tr>
    <tr><td>Orchestrator-workers</td><td>Lead splits at runtime; workers with fresh contexts run in parallel.</td></tr>
    <tr><td>Context isolation</td><td>Lead context = sub-tasks × summary size (3 × 150 = 450 words) instead of all raw reading (3 × 50 × 300 = 45,000).</td></tr>
    <tr><td>N × M → N + M</td><td>Connectors without / with MCP: 5 apps × 20 systems = 100 vs 5 + 20 = 25.</td></tr>
    <tr><td>MCP roles</td><td>Host (app + LLM + consent), client (one per server), server (tools, resources, prompts).</td></tr>
    <tr><td>A2A</td><td>Agent Card (skills, endpoint, auth) + task lifecycle (submitted → working ⇄ input-required → completed / failed).</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>One agent</b><p>Default; coupled work; few tools.</p><small>4 calls for Asha</small></div>
    <div><b>Pipeline</b><p>Same stages every time.</p><small>Cheapest team</small></div>
    <div><b>Swarm</b><p>Conversations that move between experts.</p><small>Cap transfers</small></div>
    <div><b>Supervisor</b><p>Varied multi-step jobs needing central control.</p><small>Most calls</small></div>
    <div><b>Parallel workers</b><p>Wide, independent, reading-heavy tasks.</p><small>Context isolation</small></div>
    <div><b>MCP / A2A</b><p>Tools many apps need / agents other teams run.</p><small>Not a security layer</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Org-chart splits; briefs assuming shared memory; leaking worker transcripts; two owners for one write; no global budget; trusting MCP servers blindly; testing only end to end.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Triage calls <code>refund</code>. What happens?</td><td>Allow-list blocks it; the model gets an error result; it should transfer instead</td></tr>
    <tr><td>Supervisor run: router calls + worker calls?</td><td>4 + 6 = 10 (refunds 3, delivery 2, writer 1)</td></tr>
    <tr><td>Refunds agent pays Rs 282; items agent pays Rs 40 for the coffee. Fix?</td><td>One owner for refunds; cap total refunds per order at the order total (second payment blocked)</td></tr>
    <tr><td>Which MCP message comes right after the <code>initialize</code> reply?</td><td><code>notifications/initialized</code> (a notification: no id, no reply)</td></tr>
    <tr><td>One agent and a supervisor team give the same end state. Which do you ship?</td><td>The single agent: 4 vs 10 calls; split only for breadth, separation or ownership</td></tr>
  </table>

  <h2 id="ma-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Your manager wants a "planner, coder, tester, reviewer" multi-agent system for a coding assistant. What do you say?</summary><div class="qa-body">Start with one agent that can plan, edit and run tests. Coding sub-tasks share context and depend on each other, so splitting loses information and multiplies tokens. Add a separate agent only for a measured gap (e.g. an isolated reviewer with fresh context) and compare against the single-agent baseline on an eval set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What gets worse as one agent accumulates tools?</summary><div class="qa-body">Every call carries every schema and rulebook (531 vs 180 tokens of schemas in our desk); more overlapping descriptions compete for each decision (refund vs coupon vs wallet); instructions for different domains conflict; and any message, including injected text, can reach every write tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Supervisor vs swarm vs pipeline: who decides what runs next in each?</summary><div class="qa-body">Supervisor: a routing agent, after every step (central control, most calls). Swarm: the current agent, by calling a handoff tool (cheaper, nobody owns the plan). Pipeline: your code, in a fixed order (cheapest, can't handle unexpected cases).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you implement a sub-agent with only a chat API?</summary><div class="qa-body">Expose it to the lead as a tool (<code>delegate(task)</code>). When called, run a fresh model call with only the task as context (often a cheaper model) and return its short answer as the tool result. Several delegate calls in one turn run in parallel; all results go back in one message.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is a critic agent useful, and when is it wasted?</summary><div class="qa-body">Useful when it has information the writer lacked: the ledger, tests, retrieved sources, a different model. Wasted when it is the same model re-reading the same draft ("Looks good!" to Rs 280). Measure how often it rejects drafts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does MCP solve? Explain N × M.</summary><div class="qa-body">Without a standard, each of N AI apps writes a connector for each of M systems: N × M integrations. With MCP each app implements one client and each system ships one server: N + M. Any MCP host can use any MCP server.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Tools vs resources vs prompts in MCP?</summary><div class="qa-body">Tools are actions the <em>model</em> chooses to call (<code>get_order</code>). Resources are read-only data by URI that the <em>application</em> loads (<code>policy://late-orders</code>). Prompts are templates the <em>user</em> picks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What actually goes over the wire in a stdio MCP session?</summary><div class="qa-body">JSON-RPC 2.0 objects, one per line, on the server's stdin/stdout: <code>initialize</code>, the <code>notifications/initialized</code> notification, then requests like <code>tools/list</code> and <code>tools/call</code>, each answered with a reply carrying the same <code>id</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>MCP vs A2A?</summary><div class="qa-body">MCP connects an agent to tools and data it directly controls. A2A connects an agent to another, opaque agent (often another company's) with its own reasoning, long-running tasks and requests for input. An A2A agent may use MCP tools internally.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do handoffs need allow-lists, when each role's prompt already says what it may do?</summary><div class="qa-body">All roles share one model and, for cache and history validity, one tool list; the prompt is only advice. Our triage tried to refund despite "Never act yourself"; only the harness's allow-list stopped it. The role boundary is real only if code enforces it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does context isolation require structured briefs?</summary><div class="qa-body">Isolation means the worker sees only its brief, not the conversation. Anything the brief omits doesn't exist for the worker: the free-text brief lost "refund to wallet" and the money went to a closed account. A schema with a required constraints field makes the omission impossible to miss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if two specialists can write to the same thing without a shared check?</summary><div class="qa-body">Each acts correctly by its own instructions and the total is wrong: full refund Rs 282 plus coffee Rs 40 = Rs 322. The fix comes from single-agent design (idempotency, data-layer caps) applied across agents: one owner per write and a rule in the data layer that every agent's write must pass.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does the supervisor pattern map onto LangGraph?</summary><div class="qa-body">Shared state = <code>MessagesState</code>; supervisor = a node that returns <code>Command(goto=…)</code> chosen by a structured-output router; each worker = a node (often a whole <code>create_agent</code> graph) that writes only its final message and returns <code>Command(goto="supervisor")</code>; checkpoints and interrupts work exactly as for one agent.</div></details>
</main>
`
});
