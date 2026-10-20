// notes/genai/llm_apis.js — LLM APIs & Tool Calling
Object.assign(TOPIC_CONTENT, {
  "llm_apis": `<main>
  <h1>LLM APIs &amp; Tool Calling</h1>
  <div class="where"><span>Generative AI</span><span>Working with LLMs</span><span>LLM APIs &amp; Tool Calling</span></div>
  <p class="lead">You know how an LLM produces tokens (<a class="xref" data-note="llm_basics">How LLMs Work</a>) and how to write a prompt it follows (<a class="xref" data-note="prompting">Prompt Engineering</a>). This note is the plumbing, one need at a time: calling a model from code, the exact request and response shapes, what a workload costs, streaming, the tool-calling loop, enforced JSON, errors and retries, async batching, caching, choosing a provider, and local models. The running example is the same as the whole track: <strong>Biteful's support assistant</strong> answering Asha's <em>"Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"</em>, summarising reviews and extracting tickets as JSON. <strong>How the code was run:</strong> no paid API was called. Every request below went to <code>biteful_mock.py</code>, a small local server written for this note that speaks the same JSON shapes as Anthropic's Messages API (and an OpenAI-style endpoint). The real <code>anthropic</code> Python SDK was used, pointed at the mock with <code>base_url</code>. The mock's "model" is a few if-rules, so its replies show the <em>plumbing</em> faithfully but say nothing about real model quality; its token counts use the GPT-2 tokenizer. No local LLM was available offline in this environment.</p>

  <h2 id="la-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 190" width="660">
<defs><marker id="la-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="42" text-anchor="middle" font-size="12">How LLMs Work</text><text x="85" y="59" text-anchor="middle" class="tm" font-size="10">tokens, limits, cost</text>
<rect x="10" y="110" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="132" text-anchor="middle" font-size="12">Prompt Engineering</text><text x="85" y="149" text-anchor="middle" class="tm" font-size="10">roles, JSON, grounding</text>
<rect x="250" y="62" width="160" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="330" y="86" text-anchor="middle" font-size="13" font-weight="700">LLM APIs</text><text x="330" y="104" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="500" y="10" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="31" text-anchor="middle" font-size="12">RAG</text><text x="575" y="48" text-anchor="middle" class="tm" font-size="10">retrieve, then call</text>
<rect x="500" y="70" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="91" text-anchor="middle" font-size="12">Agents</text><text x="575" y="108" text-anchor="middle" class="tm" font-size="10">the tool loop, grown up</text>
<rect x="500" y="130" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="151" text-anchor="middle" font-size="12">Production · Evals</text><text x="575" y="168" text-anchor="middle" class="tm" font-size="10">cost, guardrails, tests</text>
<line x1="160" y1="45" x2="248" y2="80" stroke="currentColor" marker-end="url(#la-a0)"/><line x1="160" y1="135" x2="248" y2="100" stroke="currentColor" marker-end="url(#la-a0)"/>
<line x1="410" y1="80" x2="498" y2="38" stroke="currentColor" marker-end="url(#la-a0)"/><line x1="410" y1="90" x2="498" y2="95" stroke="currentColor" marker-end="url(#la-a0)"/><line x1="410" y1="100" x2="498" y2="152" stroke="currentColor" marker-end="url(#la-a0)"/>
</svg><figcaption>The API is the hinge of the track: every later note sends requests shaped like the ones below.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="llm_basics">How LLMs Work</a> and <a class="xref" data-note="prompting">Prompt Engineering</a></b><span>Tokens are the unit of cost and limits; the model has no memory and no live data; prompts have system/user/assistant roles; JSON must be validated. Left open: how does a program actually send all that and use the answer?</span></li>
    <li><b>This note adds: the request/response contract and the loop around it</b><span>Messages and parameters in, content blocks and a stop reason out; cost per token; streaming; tools so the model can look up order 101; enforced JSON; retries; concurrency; caching; choosing and hosting models.</span></li>
    <li><b>Leads to: <a class="xref" data-note="rag">RAG</a>, <a class="xref" data-note="agentic">Agent Fundamentals</a>, <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a></b><span>RAG fills the prompt with retrieved text before the call; agents are the tool loop with more tools and memory; production adds guardrails and serving behind <a class="xref" data-note="api_fastapi">FastAPI</a>; evals (<a class="xref" data-note="llm_evals">Evaluation &amp; Observability</a>) test it all. Async code builds on <a class="xref" data-note="py_asyncio">asyncio</a>.</span></li>
  </ol>

  <h2 id="la-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers are from running the Biteful example against the local mock.</p>
  <ol class="story">
    <li><b>A call from code</b><span>Q: how does a program use a model? → One HTTP request with model, max_tokens, system and messages; the SDK wraps it. Asha's question came back: "I can't see order 101". But what exactly is in that request and reply?</span></li>
    <li><b>Request &amp; response shape</b><span>Q: what are the fields? → messages with roles, a list of content blocks back, a stop_reason, usage. Stateless: "What is my name?" works only if call 1 is resent (31 vs 90 input tokens). Every call is billed by those usage numbers; what does a day cost?</span></li>
    <li><b>Tokens &amp; cost</b><span>Q: what does Biteful's workload cost? → in × price<sub>in</sub> + out × price<sub>out</sub>: $134 a day on the largest model, $3.35 on the smallest (example prices). Cost known; but a long reply still makes Asha stare at a spinner…</span></li>
    <li><b>Streaming</b><span>Q: how do words appear as they're generated? → Server-sent events: message_start, deltas, message_stop; first text after ≈0.3 s instead of the full reply time. Fluent, fast, but it still can't see order 101…</span></li>
    <li><b>Tool calling</b><span>Q: how does the model get live data? → It asks with a tool_use block; your code runs get_order_status(101) and returns a tool_result with the same id; the next reply is grounded: "Ravi should reach you by 9:05 pm". Tool arguments are JSON; what about JSON answers?</span></li>
    <li><b>Structured outputs</b><span>Q: how do we guarantee parseable JSON? → Pass a JSON Schema in output_config, or a Pydantic class to messages.parse; still validate. Now the calls are correct; what about calls that fail?</span></li>
    <li><b>Errors &amp; retries</b><span>Q: what if the API says 429 or 400? → Retry transient errors with backoff (the SDK succeeded after two 429s in 2.3 s); never retry a 400. One call at a time is robust but slow for 10,000 tickets…</span></li>
    <li><b>Async batching</b><span>Q: how do we run many calls at once? → asyncio.gather with a Semaphore: 10 tickets in 3.44 s one by one, 0.35 s ten at a time. More calls, more tokens resent; can we avoid paying twice for the same prefix?</span></li>
    <li><b>Caching</b><span>Q: how do we stop re-paying for repeated text? → Prompt caching (82% cheaper input on a 20K-token manual) and an app-level answer cache (5 FAQ questions, 2 paid calls). Cheaper per call, but which model and provider should we call?</span></li>
    <li><b>Choosing a model / provider</b><span>Q: which one? → Start with the smallest model that passes your test set; route the rest: 95% to the small model takes $72 to $5.31 a day. And when data can't leave the building?</span></li>
    <li><b>Local models</b><span>Q: can we run the model ourselves? → Ollama, llama.cpp and vLLM serve OpenAI-style endpoints; the same code talks to them. Then the Build It: a full Biteful assistant with two tools.</span></li>
  </ol>

  <h2 id="la-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
  <div class="mm-center">LLM APIs &amp; Tool Calling</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">The call</div>
      <ul>
        <li><code>client.messages.create(model, max_tokens, system, messages, tools)</code></li>
        <li>Reply = <b>list of content blocks</b> + <b>stop_reason</b> + <b>usage</b></li>
        <li><b>Stateless</b> — resend history; input grows 375 → 715 in 5 turns</li>
        <li>⚠ Append <code>response.content</code> whole</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Cost</div>
      <ul>
        <li>in × price<sub>in</sub> + out × price<sub>out</sub></li>
        <li>Biteful/day: $134 (Opus 5.5) · $67 · $3.35 (Haiku 5.5)</li>
        <li>Output = 33% of cost from 9% of tokens</li>
        <li>Tool schemas cost input: 47 → 147 tokens</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Streaming</div>
      <ul>
        <li><b>SSE</b>: message_start → block_start → deltas → block_stop → message_delta → message_stop</li>
        <li>Wins TTFT (≈0.3 s), not total time or cost</li>
        <li>Tool input streams as <code>input_json_delta</code></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Tool calling</div>
      <ul>
        <li>name + description + JSON Schema; <b>your code</b> runs it</li>
        <li>tool_use (id) → run → tool_result (same id) → call again</li>
        <li>Parallel: all results in <b>one</b> user message</li>
        <li>Errors → <code>is_error: true</code>, never crash</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Structured outputs</div>
      <ul>
        <li><code>output_config={"format": {"type": "json_schema", ...}}</code></li>
        <li><code>messages.parse(output_format=Ticket)</code> → <code>parsed_output</code></li>
        <li>Still validate: json_invalid, int_parsing, literal_error</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Errors &amp; scale</div>
      <ul>
        <li>Retry 408/409/429/5xx with backoff + jitter; honour retry-after</li>
        <li>⚠ Never retry 400</li>
        <li><b>Async</b>: Semaphore + gather: 3.44 s → 0.35 s</li>
        <li><b>Batch API</b>: 50% off, up to 24 h</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Caching</div>
      <ul>
        <li><b>Prompt cache</b>: exact prefix, tools → system → messages</li>
        <li>Write 1.25× · read $0.20/1M on Opus 5.5 → 82% saving</li>
        <li><b>Answer cache</b>: only user-independent FAQs</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Choose &amp; host</div>
      <ul>
        <li>Smallest model that passes the test set; route the rest</li>
        <li><b>Local</b>: Ollama / llama.cpp / vLLM, OpenAI-style API</li>
        <li>Build: get_order_status + calculator → "35 minutes late"</li>
      </ul>
    </div>
  </div>
</div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="la-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="la-call"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Use a Model From Code</span><span class="rm-sub">The SDK and a local mock</span></div></div>
      <div class="rm-item rm-done" data-target="la-shape"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Request &amp; Response Shape</span><span class="rm-sub">Messages, roles, stop_reason</span></div></div>
      <div class="rm-item rm-done" data-target="la-cost"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Tokens &amp; Cost</span><span class="rm-sub">A day of Biteful traffic</span></div></div>
      <div class="rm-item rm-done" data-target="la-stream"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Streaming</span><span class="rm-sub">Server-sent events traced</span></div></div>
      <div class="rm-item rm-done" data-target="la-tools"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Tool Calling</span><span class="rm-sub">The loop, traced message by message</span></div></div>
      <div class="rm-item rm-done" data-target="la-struct"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Structured Outputs</span><span class="rm-sub">Schemas and Pydantic</span></div></div>
      <div class="rm-item rm-done" data-target="la-errors"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Errors &amp; Retries</span><span class="rm-sub">429, 400, backoff</span></div></div>
      <div class="rm-item rm-done" data-target="la-async"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Async Batching</span><span class="rm-sub">Many calls at once</span></div></div>
      <div class="rm-item rm-done" data-target="la-cache"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Caching</span><span class="rm-sub">Prompt cache and answer cache</span></div></div>
      <div class="rm-item rm-done" data-target="la-choose"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Choosing a Model</span><span class="rm-sub">Honest table, routing</span></div></div>
      <div class="rm-item rm-done" data-target="la-local"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Local Models</span><span class="rm-sub">Same code, your hardware</span></div></div>
      <div class="rm-item rm-done" data-target="la-build"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">Biteful assistant with two tools</span></div></div>
      <div class="rm-item rm-done" data-target="la-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One request, many concerns</span></div></div>
      <div class="rm-item rm-done" data-target="la-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Lost blocks, split results, retrying 400s</span></div></div>
      <div class="rm-item rm-done" data-target="la-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="la-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="la-call"><span class="num">01</span>Use a Model From Code</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Prompt Engineering wrote good prompts as strings. Biteful's app must send Asha's message to a model and show the reply, thousands of times a day, from a program. How does code talk to a model, and how can we practise without a bill?</p>
  </div>
  <p>Hosted models are web services. Your program sends an HTTP POST with JSON (which model, the messages, a length limit) and gets JSON back. Providers ship SDKs (Python packages) that build the request, send it, retry on some errors, and turn the reply into Python objects. Anthropic's endpoint is <code>POST /v1/messages</code>; OpenAI-style servers use <code>POST /v1/chat/completions</code>. Same idea, different field names.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ordering by a courier form. You fill in fixed boxes (to, from, weight, contents), hand it over, and get back a receipt with a status and a charge. The SDK is the counter clerk who fills in the form neatly for you.</p>
  </div>
  <h3>The practice server</h3>
  <p>A real call needs an API key and costs money. To learn the plumbing free, this note runs <code>biteful_mock.py</code> locally: it accepts the same requests as Anthropic's API and answers in the same shapes. Its "model" is a few rules (if tools are offered and an order number is mentioned, ask for <code>get_order_status</code>; if tool results are present, write a reply from them; if a JSON schema is requested, fill it with regexes). It also simulates 0.3 s of thinking, streaming delays, 429 errors on request, and prompt caching. You don't need to read it to follow the note; it's here so every output below can be reproduced.</p>
  <details><summary>Show <code>biteful_mock.py</code> (the local practice server, about 200 lines)</summary>
<div class="fx" data-lang="py">"""biteful_mock.py - a LOCAL fake of a chat-model API, for learning without a bill.

It speaks the same JSON shapes as Anthropic's Messages API (POST /v1/messages,
streaming, tool use, structured output, count_tokens) plus an OpenAI-style
POST /v1/chat/completions. Its "model" is a handful of if-rules about Biteful
orders, NOT a language model: it shows the plumbing, never real model quality.
Token counts use the GPT-2 tokenizer, so they differ from any real provider's.
Run:  python3 biteful_mock.py      (listens on http://127.0.0.1:8765)
"""
import hashlib, json, re, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from gpt2_tok import enc

FAILS = {}          # scenario name -&gt; failures already served (for 429 demos)
CACHE = set()       # hashes of cached prompt prefixes (prompt-caching demo)

def ntok(obj):
    text = obj if isinstance(obj, str) else json.dumps(obj, sort_keys=True)
    return len(enc.encode(text))

def short_id(prefix, *parts):
    return prefix + hashlib.sha1(json.dumps(parts, sort_keys=True).encode()).hexdigest()[:10]

def blocks(content):
    return [{"type": "text", "text": content}] if isinstance(content, str) else content

def text_of(msg):
    return " ".join(b.get("text", "") for b in blocks(msg["content"]) if b["type"] == "text")

def to_24h(t):                                   # "8:30 pm" -&gt; "20:30"
    h, m, ap = re.match(r"(\\d{1,2}):(\\d{2})\\s*(am|pm)?", t).groups()
    h = int(h) % 12 + (12 if ap == "pm" else 0) if ap else int(h)
    return f"{h:02d}:{m}"

def extract(text, schema):
    """Fill a JSON schema from text with regexes (the mock's 'structured output')."""
    found = {
        "order_id": (m := re.search(r"order\\s*#?\\s*(\\d+)", text, re.I)) and int(m.group(1)),
        "restaurant": next((r for r in ["Dosa Hut", "Chai Point", "Biryani Blues"] if r in text), None),
        "issue": "late_delivery" if re.search(r"late|due|where", text, re.I) else "other",
        "due_time": (m := re.search(r"\\d{1,2}:\\d{2}\\s*(?:am|pm)?", text)) and to_24h(m.group(0)),
        "customer_name": (m := re.search(r"(?:I'm|I am|this is)\\s+([A-Z][a-z]+)", text)) and m.group(1),
    }
    return {k: found.get(k) for k in schema.get("properties", {})}

def decide(req):
    """The mock's rules. Returns (content_blocks, stop_reason)."""
    msgs, tools = req["messages"], {t["name"] for t in req.get("tools", [])}
    first, last = text_of(msgs[0]), msgs[-1]
    results = {}                                  # tool_use id -&gt; (name, input, output)
    for i, m in enumerate(msgs):
        for b in blocks(m["content"]):
            if b["type"] == "tool_result":
                use = next(u for u in blocks(msgs[i - 1]["content"]) if u.get("id") == b["tool_use_id"])
                results[b["tool_use_id"]] = (use["name"], use["input"], b.get("content"), b.get("is_error", False))
    if results:                                   # rule 1: we have tool results
        orders = [json.loads(o) for n, _, o, err in results.values() if n == "get_order_status" and not err]
        calc = [o for n, _, o, err in results.values() if n == "calculator" and not err]
        errors = [o for _, _, o, err in results.values() if err]
        asked_calc = any(n == "calculator" for n, _, _, _ in results.values())
        if orders and not asked_calc and "calculator" in tools and re.search(r"how (late|many minutes)", first, re.I):
            due = to_24h(re.search(r"\\d{1,2}:\\d{2}\\s*(?:am|pm)?", first).group(0)).split(":")
            eta = to_24h(orders[0]["eta"]).split(":")
            expr = f"({int(eta[0])} * 60 + {int(eta[1])}) - ({int(due[0])} * 60 + {int(due[1])})"
            return [{"type": "tool_use", "id": short_id("toolu_", expr), "name": "calculator",
                     "input": {"expression": expr}}], "tool_use"
        if errors and not orders:
            return [{"type": "text", "text": f"Sorry, I couldn't look that up ({errors[0]}). "
                     "Could you check the order number?"}], "end_turn"
        says = [f"Order {o['order_id']} from {o['restaurant']} is {o['status'].replace('_', ' ')}; "
                f"{o['rider']} should reach you by {o['eta']}." for o in orders]
        if calc:
            says.append(f"That is {float(calc[0]):g} minutes after the promised time.")
        return [{"type": "text", "text": " ".join(says)}], "end_turn"
    text = text_of(last)
    ids = re.findall(r"order\\s*#?\\s*(\\d+)|and\\s+(\\d+)", text, re.I)
    ids = [int(a or b) for a, b in ids]
    if "get_order_status" in tools and ids:       # rule 2: ask for the tool
        out = [{"type": "text", "text": f"Let me check order {' and '.join(map(str, ids))}."}]
        out += [{"type": "tool_use", "id": short_id("toolu_", i, len(msgs)), "name": "get_order_status",
                 "input": {"order_id": i}} for i in ids]
        return out, "tool_use"
    fmt = (req.get("output_config") or {}).get("format")
    if fmt and fmt.get("type") == "json_schema":  # rule 3: structured output
        return [{"type": "text", "text": json.dumps(extract(text, fmt["schema"]))}], "end_turn"
    name = next((m.group(1) for m in (re.search(r"my name is (\\w+)", text_of(x), re.I)
                 for x in msgs if x["role"] == "user") if m), None)
    if re.search(r"what is my name", text, re.I):   # rule 4: only what was resent
        reply = f"Your name is {name}." if name else "I don't know your name; it isn't in this conversation."
    elif ids:                                     # rule 5: order question, no data
        reply = f"(mock) I can't see order {ids[0]}: no order data or tool was given to me."
    else:                                         # rule 6: anything else
        reply = f"(mock) I only handle Biteful order questions. You wrote {ntok(text)} tokens."
    return [{"type": "text", "text": reply}], "end_turn"

def message(req):
    content, stop = decide(req)
    out_text = " ".join(b.get("text", "") or json.dumps(b.get("input")) for b in content)
    hit = next((s for s in req.get("stop_sequences", []) if s in out_text), None)
    if hit:                                        # a stop sequence cuts the text
        out_text = out_text.split(hit)[0]
        content, stop = [{"type": "text", "text": out_text}], "stop_sequence"
    out_tok = ntok(out_text)
    if out_tok &gt; req["max_tokens"]:                # hit the ceiling: truncate
        content = [{"type": "text", "text": enc.decode(enc.encode(out_text)[: req["max_tokens"]])}]
        stop, out_tok = "max_tokens", req["max_tokens"]
    usage = {"input_tokens": ntok({k: req.get(k) for k in ("system", "messages", "tools")}),
             "output_tokens": out_tok, "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0}
    if "cache_control" in json.dumps(req):         # prompt-caching simulation
        prefix = {k: req.get(k) for k in ("tools", "system")}
        key, n = hashlib.sha1(json.dumps(prefix, sort_keys=True).encode()).hexdigest(), ntok(prefix)
        if n &gt;= 512:
            usage["cache_read_input_tokens" if key in CACHE else "cache_creation_input_tokens"] = n
            usage["input_tokens"] -= n
            CACHE.add(key)
    return {"id": short_id("msg_", req["messages"]), "type": "message", "role": "assistant",
            "model": "biteful-mock", "content": content, "stop_reason": stop,
            "stop_sequence": hit, "usage": usage}

class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def log_message(self, *args):
        pass
    def send_json(self, code, obj, headers=()):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(body)))
        self.send_header("request-id", short_id("req_", obj))
        for k, v in headers:
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)
    def event(self, name, data):
        self.wfile.write(f"event: {name}\\ndata: {json.dumps(data)}\\n\\n".encode())
        self.wfile.flush()
    def do_POST(self):
        req = json.loads(self.rfile.read(int(self.headers["content-length"])))
        scenario = self.headers.get("x-mock-scenario", "")   # e.g. "ratelimit:job7:2"
        if scenario.startswith("ratelimit:"):
            _, name, n = scenario.split(":")
            if FAILS.get(name, 0) &lt; int(n):
                FAILS[name] = FAILS.get(name, 0) + 1
                return self.send_json(429, {"type": "error", "error": {"type": "rate_limit_error",
                                      "message": "mock: too many requests"}}, [("retry-after", "1")])
        if self.path == "/v1/chat/completions":    # OpenAI-style shape (Ollama, vLLM, ...)
            system = " ".join(m["content"] for m in req["messages"] if m["role"] == "system")
            msgs = [m for m in req["messages"] if m["role"] != "system"]
            r = message({"system": system, "messages": msgs, "max_tokens": req.get("max_tokens", 1024)})
            text = r["content"][0]["text"]
            return self.send_json(200, {"id": r["id"], "object": "chat.completion", "model": "biteful-mock",
                "choices": [{"index": 0, "message": {"role": "assistant", "content": text},
                             "finish_reason": "stop"}],
                "usage": {"prompt_tokens": r["usage"]["input_tokens"], "completion_tokens": r["usage"]["output_tokens"],
                          "total_tokens": r["usage"]["input_tokens"] + r["usage"]["output_tokens"]}})
        if self.path == "/v1/messages/count_tokens":
            return self.send_json(200, {"input_tokens": ntok({k: req.get(k) for k in ("system", "messages", "tools")})})
        if "max_tokens" not in req:
            bad = "max_tokens: field required"
        elif not req.get("messages") or req["messages"][0]["role"] != "user":
            bad = "messages: first message must use the user role"
        else:
            bad = None
        if bad:
            return self.send_json(400, {"type": "error", "error": {"type": "invalid_request_error", "message": bad}})
        msg = message(req)
        if not req.get("stream"):
            time.sleep(0.3)                        # pretend the model takes 0.3 s
            return self.send_json(200, msg)
        self.send_response(200)                    # streaming: server-sent events
        self.send_header("content-type", "text/event-stream")
        self.send_header("connection", "close")
        self.end_headers()
        self.close_connection = True
        time.sleep(0.25)                           # time to first token
        start = dict(msg, content=[], stop_reason=None, usage=dict(msg["usage"], output_tokens=1))
        self.event("message_start", {"type": "message_start", "message": start})
        for i, b in enumerate(msg["content"]):
            empty = {"type": "text", "text": ""} if b["type"] == "text" else dict(b, input={})
            self.event("content_block_start", {"type": "content_block_start", "index": i, "content_block": empty})
            pieces = re.findall(r"\\S+\\s*", b["text"]) if b["type"] == "text" else \\
                     re.findall(r".{1,12}", json.dumps(b["input"]))
            for p in pieces:
                delta = {"type": "text_delta", "text": p} if b["type"] == "text" else \\
                        {"type": "input_json_delta", "partial_json": p}
                self.event("content_block_delta", {"type": "content_block_delta", "index": i, "delta": delta})
                time.sleep(0.05)                   # one decode step
            self.event("content_block_stop", {"type": "content_block_stop", "index": i})
        self.event("message_delta", {"type": "message_delta",
                   "delta": {"stop_reason": msg["stop_reason"], "stop_sequence": None},
                   "usage": {"output_tokens": msg["usage"]["output_tokens"]}})
        self.event("message_stop", {"type": "message_stop"})

if __name__ == "__main__":
    print("biteful mock listening on http://127.0.0.1:8765", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 8765), Handler).serve_forever()</div>
  </details>
  <p>Start it in a terminal with <code>python3 biteful_mock.py</code> (it needs <code>gpt2_tok.py</code> from <a class="xref" data-note="llm_basics">How LLMs Work</a>, section 03, in the same folder). Then the smallest useful call:</p>
<div class="fx" data-lang="py">import anthropic

# Real SDK, fake server: base_url points at our local mock, so no key and no bill.
# For the real service you would write anthropic.Anthropic() and set ANTHROPIC_API_KEY.
client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")

response = client.messages.create(
    model="claude-haiku-5-5",                 # what you'd send for real; the mock ignores it
    max_tokens=300,                           # hard cap on generated tokens
    system="You are Biteful's support assistant. Be brief and polite.",
    messages=[{"role": "user",
               "content": "Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"}],
)
for block in response.content:                # a LIST of blocks, not one string
    print(block.type, "|", block.text)
print("stop_reason:", response.stop_reason)
print("usage:", response.usage.input_tokens, "in,", response.usage.output_tokens, "out")
print("answered by:", response.model)</div>
<div class="fx" data-lang="text">text | (mock) I can't see order 101: no order data or tool was given to me.
stop_reason: end_turn
usage: 59 in, 21 out
answered by: biteful-mock</div>
  <p>The only change from production code is <code>base_url=…, api_key="mock-key"</code>; with a real key you'd write <code>anthropic.Anthropic()</code>. The reply is honest: without data or a tool, the assistant can't know where order 101 is (the limit from <a class="xref" data-note="llm_basics">How LLMs Work</a>). <code>response.content</code> is a <em>list</em> of blocks; we print each block's type and text. <code>stop_reason</code> says why it stopped, <code>usage</code> what you'd be billed for, and <code>model</code> shows the mock answered, not Claude.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LLM API</strong>: an HTTP endpoint that takes a model name, messages and parameters and returns the generated message. <strong>SDK</strong>: a client library that builds requests, sends them, retries some failures and parses responses into objects. <strong>API key</strong>: the secret that identifies and bills your account; keep it in an environment variable, never in code.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Hard-coding an API key in a script or notebook that ends up in Git. Read it from the environment (<code>ANTHROPIC_API_KEY</code>), and keep test code pointed at a mock so CI never spends money.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Request &amp; response shape.</b> We sent a request and printed a reply. What exactly goes over the wire, what does each field do, and how does a conversation continue?</div>

  <h2 id="la-shape"><span class="num">02</span>Request &amp; Response Shape</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The SDK hid the HTTP. To debug, log or switch providers, we need the raw shapes: which fields go in, which come out, and how a second turn ("Can I get my money back?") remembers the first.</p>
  </div>
  <p>The request names a <code>model</code>, a required <code>max_tokens</code> ceiling, an optional top-level <code>system</code> string, and <code>messages</code>: alternating <code>user</code> / <code>assistant</code> turns, first one <code>user</code>. The response is an assistant message: a list of <code>content</code> blocks (text, tool calls, thinking), a <code>stop_reason</code> and <code>usage</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank call centre where a different agent picks up every call. The new agent knows nothing about you unless you hand over the whole case file. A longer file takes longer to read and costs more each time.</p>
  </div>
  <h3>Traced: the raw HTTP</h3>
<div class="fx" data-lang="py">import json, httpx

# The same call as plain HTTP: this is all the SDK does for you.
body = {
    "model": "claude-haiku-5-5",
    "max_tokens": 300,
    "system": "You are Biteful's support assistant.",
    "messages": [{"role": "user", "content": "Where is my order 101?"}],
}
headers = {"x-api-key": "mock-key", "anthropic-version": "2023-06-01",
           "content-type": "application/json"}
r = httpx.post("http://127.0.0.1:8765/v1/messages", json=body, headers=headers)
print("HTTP", r.status_code)
print(json.dumps(r.json(), indent=2))</div>
<div class="fx" data-lang="text">HTTP 200
{
  "id": "msg_374deddfd8",
  "type": "message",
  "role": "assistant",
  "model": "biteful-mock",
  "content": [
    {
      "type": "text",
      "text": "(mock) I can't see order 101: no order data or tool was given to me."
    }
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 39,
    "output_tokens": 21,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 0
  }
}</div>
  <table class="tbl">
    <tr><th>Field</th><th>Direction</th><th>What it is</th></tr>
    <tr><td><code>model</code></td><td>in</td><td>Which model answers. Pin an exact id (e.g. <code>claude-haiku-5-5</code>).</td></tr>
    <tr><td><code>max_tokens</code></td><td>in</td><td>Required ceiling on generated tokens, not a target.</td></tr>
    <tr><td><code>system</code></td><td>in</td><td>Top-level standing instructions; not a message in the list.</td></tr>
    <tr><td><code>messages</code></td><td>in</td><td>The conversation so far: <code>role</code> + <code>content</code> (string or list of blocks).</td></tr>
    <tr><td><code>tools</code>, <code>output_config</code>, <code>stop_sequences</code>, <code>stream</code></td><td>in</td><td>Optional: tools (05), JSON schema / effort (06), early stop strings, streaming (04).</td></tr>
    <tr><td><code>content</code></td><td>out</td><td>List of blocks: <code>text</code>, <code>tool_use</code>, <code>thinking</code>…</td></tr>
    <tr><td><code>stop_reason</code></td><td>out</td><td>Why generation ended (table below).</td></tr>
    <tr><td><code>usage</code></td><td>out</td><td>Input and output tokens billed; cache fields (09).</td></tr>
  </table>
  <p>Headers carry the key (<code>x-api-key</code>) and the API version. The response's <code>request-id</code> header is what a provider's support asks for when you report a problem.</p>
  <h3>Traced: stateless, so you own the history</h3>
<div class="fx" data-lang="py">import anthropic
client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")
MODEL = "claude-haiku-5-5"

# Call 1
messages = [{"role": "user", "content": "My name is Asha. I have a question."}]
r1 = client.messages.create(model=MODEL, max_tokens=200, messages=messages)

# Call 2 WITHOUT history: a brand-new request that only contains the question
alone = client.messages.create(model=MODEL, max_tokens=200,
                               messages=[{"role": "user", "content": "What is my name?"}])
print("without history:", alone.content[0].text)

# Call 2 WITH history: append the reply's blocks and the new question, resend all
messages.append({"role": "assistant", "content": r1.content})
messages.append({"role": "user", "content": "What is my name?"})
r2 = client.messages.create(model=MODEL, max_tokens=200, messages=messages)
print("with history   :", r2.content[0].text)
print("messages sent  :", len(messages), "| input tokens:", alone.usage.input_tokens, "vs", r2.usage.input_tokens)</div>
<div class="fx" data-lang="text">without history: I don't know your name; it isn't in this conversation.
with history   : Your name is Asha.
messages sent  : 3 | input tokens: 31 vs 90</div>
  <p>The second request without history can't know Asha's name. With history, three messages are sent (user, the earlier assistant reply, the new question), and the input grows from 31 to 90 tokens. Note <code>r1.content</code>, the whole block list, goes back as the assistant turn: with tools or thinking blocks, dropping blocks breaks the next call.</p>
  <h3>Traced: how input grows over a chat</h3>
<div class="fx" data-lang="py"># Asha's chat, 5 turns. System prompt 350 tokens, each question 25, each reply 60.
# The API is stateless, so every call resends everything said so far.
SYSTEM, Q, A = 350, 25, 60
history, total_input = 0, 0
for turn in range(1, 6):
    sent = SYSTEM + history + Q
    total_input += sent
    print(f"call {turn}: input tokens sent = {sent}")
    history += Q + A
print("total input tokens over 5 calls:", total_input)
print("new text actually typed or written:", 5 * (Q + A))</div>
<div class="fx" data-lang="text">call 1: input tokens sent = 375
call 2: input tokens sent = 460
call 3: input tokens sent = 545
call 4: input tokens sent = 630
call 5: input tokens sent = 715
total input tokens over 5 calls: 2725
new text actually typed or written: 425</div>
  <p>Each call sends 85 tokens more than the last (one question + one reply joined the history). Five short turns already send 2,725 input tokens for 425 tokens of new text: 6.4×. Long chats and agents grow faster, which is why caching (09) and trimming old turns matter.</p>
  <h3>Traced: why did it stop?</h3>
  <table class="tbl">
    <tr><th>stop_reason</th><th>Meaning</th><th>Your code should</th></tr>
    <tr><td><code>end_turn</code></td><td>Finished naturally</td><td>Use the answer</td></tr>
    <tr><td><code>max_tokens</code></td><td>Hit your ceiling mid-answer</td><td>Treat as truncated; never parse or run a half-written tool call</td></tr>
    <tr><td><code>tool_use</code></td><td>Wants a tool run</td><td>Run it, send <code>tool_result</code>, call again (05)</td></tr>
    <tr><td><code>stop_sequence</code></td><td>Hit one of your stop strings</td><td>Use the text before it</td></tr>
    <tr><td><code>pause_turn</code></td><td>A server-side tool loop paused</td><td>Resend to continue</td></tr>
    <tr><td><code>refusal</code></td><td>Declined for safety reasons</td><td>Show a safe message; don't parse</td></tr>
  </table>
<div class="fx" data-lang="py">import anthropic
client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")
ask = [{"role": "user", "content": "Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"}]

def handle(response):
    """Decide what to do from WHY the model stopped."""
    r = response.stop_reason
    if r == "end_turn":
        return "use the answer"
    if r == "max_tokens":
        return "TRUNCATED: raise max_tokens or ask for less"
    if r == "tool_use":
        return "run the tool, send tool_result, call again"
    if r == "stop_sequence":
        return f"stopped at {response.stop_sequence!r}"
    if r in ("pause_turn", "refusal"):
        return f"{r}: special handling, do not parse as a normal answer"
    return f"unknown stop_reason {r!r}: log it"

for kw in [dict(max_tokens=300), dict(max_tokens=8), dict(max_tokens=300, stop_sequences=[":"])]:
    resp = client.messages.create(model="claude-haiku-5-5", messages=ask, **kw)
    print(f"{str(kw):45s} -&gt; {resp.stop_reason:13s} {resp.content[0].text!r}")
    print(" " * 49, handle(resp))</div>
<div class="fx" data-lang="text">{'max_tokens': 300}                           -&gt; end_turn      "(mock) I can't see order 101: no order data or tool was given to me."
                                                  use the answer
{'max_tokens': 8}                             -&gt; max_tokens    "(mock) I can't see"
                                                  TRUNCATED: raise max_tokens or ask for less
{'max_tokens': 300, 'stop_sequences': [':']}  -&gt; stop_sequence "(mock) I can't see order 101"
                                                  stopped at ':'</div>
  <p>Same question, three settings, three stop reasons. With <code>max_tokens=8</code> the reply is cut after 8 tokens: harmless here, but a cut-off JSON object or tool call would break your pipeline. The stop sequence ":" ends the text just before the colon. The last branch of <code>handle</code> logs unknown reasons, because APIs add new ones over time.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Stateless API</strong>: the server keeps no memory between calls; each request carries the whole conversation. <strong>Content block</strong>: one typed piece of a message (text, tool_use, tool_result, thinking, image). <strong>stop_reason</strong>: why generation ended.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Appending only the reply's text instead of <code>response.content</code>; ignoring <code>stop_reason</code> (parsing a <code>max_tokens</code>-truncated reply); and prefilling the assistant turn to force a format, which current Claude models reject with a 400.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Tokens &amp; cost.</b> Every reply carried <code>usage</code> numbers. Multiply them by Biteful's traffic: what does a day of support actually cost, and which part of the request dominates?</div>

  <h2 id="la-cost"><span class="num">03</span>Tokens &amp; Cost Arithmetic</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>One call costs a fraction of a cent. Biteful will make about 42,000 calls a day across three jobs. What is the monthly bill on each model, and where does the money go?</p>
  </div>
  <p>The formula from <a class="xref" data-note="llm_basics">How LLMs Work</a>: cost = input tokens × input price + output tokens × output price, with prices quoted per million tokens and output priced about 5× input. Estimate before shipping, from real token counts and a realistic daily volume per job.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An auto-rickshaw meter: a small charge for the distance you describe (input) and a bigger one for the distance driven (output). Many short rides add up to more than one long ride.</p>
  </div>
  <h3>Traced: Biteful's daily bill</h3>
  <p>Prices are Anthropic's list prices as of October 2026, used as <strong>examples</strong>; check the current page before deciding. Token counts use the GPT-2 tokenizer, close to but not the same as Claude's.</p>
<div class="fx" data-lang="py">import json
from gpt2_tok import enc                       # GPT-2 tokenizer: real counts, but not Claude's

SYSTEM = ("You are Biteful's support assistant. Answer only from the order record. "
          "If the record does not say, say you will check. Be brief and polite.")
ORDER = {"order_id": 101, "restaurant": "Dosa Hut", "items": ["Masala Dosa x2"],
         "status": "out_for_delivery", "rider": "Ravi", "eta": "9:05 pm"}
ASHA = "Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"
REPLY = "Order 101 from Dosa Hut is out for delivery; Ravi should reach you by 9:05 pm."
for name, text in [("system", SYSTEM), ("order record", json.dumps(ORDER)),
                   ("Asha", ASHA), ("reply", REPLY)]:
    print(f"{name:13s} {len(enc.encode(text)):4d} tokens")

# EXAMPLE list prices, USD per 1M tokens (input, output): Anthropic, Oct 2026.
PRICES = {"claude-opus-5-5": (4.00, 20.00), "claude-sonnet-5-5": (2.00, 10.00),
          "claude-haiku-5-5": (0.10, 0.50)}
# Biteful's daily workload: (calls per day, input tokens, output tokens) per call
JOBS = {"where is my order": (20_000, 600, 60),     # rounded up: real prompts carry more rules
        "review summaries":  (2_000, 3_000, 150),  # one per restaurant, 50 reviews each
        "extract to JSON":   (20_000, 200, 40)}
for model, (p_in, p_out) in PRICES.items():
    day = {job: n * (i * p_in + o * p_out) / 1e6 for job, (n, i, o) in JOBS.items()}
    parts = ", ".join(f"{j} \${c:,.2f}" for j, c in day.items())
    print(f"{model:18s} per day \${sum(day.values()):8,.2f} ({parts}) | 30 days \${30 * sum(day.values()):,.0f}")
n, i, o = JOBS["where is my order"]
print("share of 'where is my order' cost from OUTPUT on opus:",
      f"{o * 20 / (i * 4 + o * 20):.0%}")</div>
<div class="fx" data-lang="text">system          32 tokens
order record    55 tokens
Asha            21 tokens
reply           22 tokens
claude-opus-5-5    per day $  134.00 (where is my order $72.00, review summaries $30.00, extract to JSON $32.00) | 30 days $4,020
claude-sonnet-5-5  per day $   67.00 (where is my order $36.00, review summaries $15.00, extract to JSON $16.00) | 30 days $2,010
claude-haiku-5-5   per day $    3.35 (where is my order $1.80, review summaries $0.75, extract to JSON $0.80) | 30 days $100
share of 'where is my order' cost from OUTPUT on opus: 33%</div>
  <p>By hand for the first job on Opus 5.5: per call 600 × $4 / 1M + 60 × $20 / 1M = $0.0024 + $0.0012 = $0.0036; × 20,000 = $72 a day. The three jobs total $134 a day, about $4,020 a month; the same workload on Haiku 5.5 is $3.35 a day, 40× less. The last line shows output's weight: 60 of 660 tokens (9%) are a third of the cost. Two caveats: the real prompts were only 108 tokens here, so the job estimates (600, 3,000, 200) leave room for longer rules, history and tool schemas; and if a tool loop needs two calls, the input is paid twice.</p>
  <h3>Traced: count before you send</h3>
<div class="fx" data-lang="py">import anthropic
from orders import ORDER_TOOL
client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")
msgs = [{"role": "user", "content": "Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"}]

# Count BEFORE sending (free on the real API). Tool schemas cost input tokens too.
without_tools = client.messages.count_tokens(model="claude-haiku-5-5", messages=msgs)
with_tools = client.messages.count_tokens(model="claude-haiku-5-5", messages=msgs, tools=[ORDER_TOOL])
print("input tokens, no tools  :", without_tools.input_tokens)
print("input tokens, with tool :", with_tools.input_tokens)</div>
<div class="fx" data-lang="text">input tokens, no tools  : 47
input tokens, with tool : 147</div>
  <p>Token counting is a free endpoint on the real API (the mock counts with GPT-2). Adding one tool definition tripled the input from 47 to 147 tokens: tool schemas are part of the prompt and are paid on every call.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cost per call</strong> = in × price<sub>in</sub> + out × price<sub>out</sub>. <strong>Daily cost</strong> = Σ over jobs of calls per day × cost per call. <strong>Thinking tokens</strong> (reasoning models) are billed as output even when not shown.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Estimating from characters or words, forgetting tool schemas and resent history, and quoting today's prices as permanent. Count with the real tokenizer, include everything sent, and date your price assumptions.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Streaming.</b> Cost is set. But a 300-token reply at 60 tokens a second keeps Asha staring at a spinner for 5 seconds. Can she see words as they're generated?</div>

  <h2 id="la-stream"><span class="num">04</span>Streaming: Server-Sent Events, Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A normal call returns nothing until the whole reply is done. In a chat window that feels broken. How does the reply arrive piece by piece, and what exactly is sent?</p>
  </div>
  <p>With <code>"stream": true</code> the server keeps the HTTP response open and sends <strong>server-sent events</strong> (SSE): plain-text lines <code>event: name</code> / <code>data: {json}</code>, one per piece, as tokens are generated. Total time and cost are the same; only the wait before the first words shrinks (time to first token, TTFT).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Watching a cricket match live versus getting the highlights video emailed after the match. Same match, same length; live, you start watching at once.</p>
  </div>
  <p>From here on the examples use Biteful's order table and the tool definition, kept in <code>orders.py</code>:</p>
<div class="fx" data-lang="py">import json

# Biteful's order table (a stand-in for the real database)
ORDERS = {
    101: {"order_id": 101, "restaurant": "Dosa Hut", "items": ["Masala Dosa x2"],
          "status": "out_for_delivery", "rider": "Ravi", "eta": "9:05 pm"},
    102: {"order_id": 102, "restaurant": "Chai Point", "items": ["Masala Chai x2"],
          "status": "preparing", "rider": "Imran", "eta": "9:20 pm"},
}

def get_order_status(order_id: int) -&gt; str:
    if order_id not in ORDERS:
        raise ValueError(f"No order {order_id}. Known orders: {sorted(ORDERS)}")
    return json.dumps(ORDERS[order_id])

ORDER_TOOL = {
    "name": "get_order_status",
    "description": "Look up the live status, rider and ETA of a Biteful order. "
                   "Call this whenever a customer asks where their order is.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {"order_id": {"type": "integer", "description": "e.g. 101"}},
        "required": ["order_id"],
        "additionalProperties": False,
    },
}</div>
  <h3>Traced: the raw event stream</h3>
<div class="fx" data-lang="py">import json, time, httpx
from orders import ORDER_TOOL

body = {"model": "claude-haiku-5-5", "max_tokens": 300, "stream": True,
        "tools": [ORDER_TOOL],
        "messages": [{"role": "user", "content": "Where is my order 101?"}]}
headers = {"x-api-key": "mock-key", "anthropic-version": "2023-06-01"}
t0 = time.perf_counter()
with httpx.stream("POST", "http://127.0.0.1:8765/v1/messages", json=body, headers=headers) as r:
    for line in r.iter_lines():                # SSE = plain text lines over one response
        if line.startswith("event:"):
            print(f"{time.perf_counter() - t0:5.2f}s {line}")
        elif line.startswith("data:"):
            data = json.loads(line[5:])
            if "delta" in data:                # the payload that carries new content
                print("        delta:", data["delta"])</div>
<div class="fx" data-lang="text"> 0.33s event: message_start
 0.33s event: content_block_start
 0.33s event: content_block_delta
        delta: {'type': 'text_delta', 'text': 'Let '}
 0.38s event: content_block_delta
        delta: {'type': 'text_delta', 'text': 'me '}
 0.43s event: content_block_delta
        delta: {'type': 'text_delta', 'text': 'check '}
 0.48s event: content_block_delta
        delta: {'type': 'text_delta', 'text': 'order '}
 0.53s event: content_block_delta
        delta: {'type': 'text_delta', 'text': '101.'}
 0.58s event: content_block_stop
 0.58s event: content_block_start
 0.58s event: content_block_delta
        delta: {'type': 'input_json_delta', 'partial_json': '{"order_id":'}
 0.63s event: content_block_delta
        delta: {'type': 'input_json_delta', 'partial_json': ' 101}'}
 0.68s event: content_block_stop
 0.68s event: message_delta
        delta: {'stop_reason': 'tool_use', 'stop_sequence': None}
 0.68s event: message_stop</div>
  <p>The sequence is always: <code>message_start</code> (id, model, input usage), then for each content block a <code>content_block_start</code>, several <code>content_block_delta</code>s, a <code>content_block_stop</code>, then <code>message_delta</code> (the stop reason and final output usage) and <code>message_stop</code>. Text arrives as <code>text_delta</code> pieces; the tool call's arguments arrive as <code>input_json_delta</code> fragments (<code>'{"order_id":'</code> then <code>' 101}'</code>) that are not valid JSON until joined. Timestamps: first event after about 0.3 s (the mock's simulated thinking), then one piece every 0.05 s.</p>
  <h3>Traced: the SDK way</h3>
<div class="fx" data-lang="py">import time, anthropic
client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")

t0 = time.perf_counter(); first = None
with client.messages.stream(
    model="claude-haiku-5-5", max_tokens=300,
    messages=[{"role": "user", "content": "Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"}],
) as stream:
    for text in stream.text_stream:            # text pieces as they arrive
        first = first or time.perf_counter() - t0
        print(text, end="", flush=True)
    final = stream.get_final_message()         # the full Message, like a normal call
total = time.perf_counter() - t0
print(f"\\nfirst text after {first:.2f}s, finished after {total:.2f}s")
print(final.stop_reason, final.usage.output_tokens, "output tokens")</div>
<div class="fx" data-lang="text">(mock) I can't see order 101: no order data or tool was given to me.
first text after 0.31s, finished after 1.02s
end_turn 21 output tokens</div>
  <p><code>stream.text_stream</code> yields only text pieces; <code>end=""</code> and <code>flush=True</code> print them immediately on one line. <code>get_final_message()</code> returns the assembled message with <code>stop_reason</code> and <code>usage</code>, exactly like a non-streamed call. First text after about 0.3 s, done after about 1 s: without streaming the user would see nothing for the whole second.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Streaming</strong>: receiving a response incrementally as server-sent events instead of one final JSON body. It improves time to first token, not total latency or cost. <strong>Delta</strong>: one incremental piece of a content block.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Streaming makes it faster": it makes it <em>feel</em> faster. And acting on half-streamed tool arguments or JSON gives broken input; act on the final message. Use streaming for chat UIs and long outputs (SDKs refuse very long non-streamed calls).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Tool calling.</b> Every reply so far admitted it couldn't see order 101. The stream above already showed a <code>tool_use</code> block. How does the model ask for data, and who actually fetches it?</div>

  <h2 id="la-tools"><span class="num">05</span>Tool Calling: The Loop, Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The model can only produce text; order 101's status lives in Biteful's database. Grounding (Prompt Engineering) pasted the record in by hand. How can the model itself decide it needs the record and get it?</p>
  </div>
  <p>You describe functions in the request (<code>tools</code>: a name, a description saying when to use it, and a JSON Schema for the arguments). When the model decides it needs one, instead of answering it returns a <code>tool_use</code> block (id, name, input) and stops with <code>stop_reason: "tool_use"</code>. <strong>Your code</strong> runs the real function and sends the output back as a <code>tool_result</code> block with the same id. The model then answers from that result, or asks for another tool. The model never executes anything.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A head chef who never leaves the pass. She writes tickets ("2 × dosa, table 4"); the kitchen cooks and sends plates back; she checks and serves. The model writes tickets; your code is the kitchen.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 620 315" width="620">
    <defs><marker id="la-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="90" y="20" text-anchor="middle">Your code</text><line x1="90" y1="30" x2="90" y2="290" stroke="currentColor" opacity="0.25" stroke-dasharray="3 3"/>
    <text x="330" y="20" text-anchor="middle">Model (API)</text><line x1="330" y1="30" x2="330" y2="290" stroke="currentColor" opacity="0.25" stroke-dasharray="3 3"/>
    <text x="540" y="20" text-anchor="middle">Tool function</text><line x1="540" y1="30" x2="540" y2="290" stroke="currentColor" opacity="0.25" stroke-dasharray="3 3"/>
    <line x1="90" y1="55" x2="326" y2="55" class="sb" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="49" text-anchor="middle" class="tm">Asha's message + tool schemas</text>
    <line x1="330" y1="97" x2="94" y2="97" class="sr" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="91" text-anchor="middle" class="tr">tool_use {order_id: 101} · stop=tool_use</text>
    <line x1="90" y1="139" x2="536" y2="139" class="st" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="315" y="133" text-anchor="middle" class="tm">get_order_status(101)</text>
    <line x1="540" y1="181" x2="94" y2="181" class="st" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="315" y="175" text-anchor="middle" class="tm">{"status": "out_for_delivery", "eta": "9:05 pm", …}</text>
    <line x1="90" y1="223" x2="326" y2="223" class="sb" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="217" text-anchor="middle" class="tm">history + assistant turn + tool_result (same id)</text>
    <line x1="330" y1="265" x2="94" y2="265" class="sg" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="259" text-anchor="middle" class="tg">"Ravi should reach you by 9:05 pm" · end_turn</text>
    <text x="10" y="305" class="tm">↻ loop while stop_reason == "tool_use"</text>
    </svg><figcaption>One tool round trip. The model only writes the request; your code runs the function and returns the result.</figcaption></figure>
  <h3>Traced: one round trip, message by message</h3>
<div class="fx" data-lang="py">import anthropic
from orders import ORDER_TOOL, get_order_status
client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")
MODEL = "claude-haiku-5-5"

messages = [{"role": "user", "content": "Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"}]

# Request 1: question + tool definitions
r1 = client.messages.create(model=MODEL, max_tokens=500, tools=[ORDER_TOOL], messages=messages)
print("response 1 stop_reason:", r1.stop_reason)
for b in r1.content:
    print("   ", b.type, b.text if b.type == "text" else (b.id, b.name, b.input))

# Your code runs the tool the model asked for
use = next(b for b in r1.content if b.type == "tool_use")
result = get_order_status(**use.input)
print("tool output:", result)

# Request 2: history + assistant turn UNCHANGED + one user turn with the tool_result
messages.append({"role": "assistant", "content": r1.content})
messages.append({"role": "user", "content": [
    {"type": "tool_result", "tool_use_id": use.id, "content": result}]})
r2 = client.messages.create(model=MODEL, max_tokens=500, tools=[ORDER_TOOL], messages=messages)
print("response 2 stop_reason:", r2.stop_reason)
print("   ", r2.content[0].text)
print("roles sent in request 2:", [m["role"] for m in messages])</div>
<div class="fx" data-lang="text">response 1 stop_reason: tool_use
    text Let me check order 101.
    tool_use ('toolu_d2d69fb960', 'get_order_status', {'order_id': 101})
tool output: {"order_id": 101, "restaurant": "Dosa Hut", "items": ["Masala Dosa x2"], "status": "out_for_delivery", "rider": "Ravi", "eta": "9:05 pm"}
response 2 stop_reason: end_turn
    Order 101 from Dosa Hut is out for delivery; Ravi should reach you by 9:05 pm.
roles sent in request 2: ['user', 'assistant', 'user']</div>
  <p>Response 1 contains two blocks: a short text and a <code>tool_use</code> with an id, the tool's name and already-parsed arguments (<code>{'order_id': 101}</code>, an int because the schema said integer). <code>get_order_status(**use.input)</code> unpacks those arguments into your function. Request 2 is user → assistant (the reply exactly as received) → user (the <code>tool_result</code> whose <code>tool_use_id</code> matches). Response 2 is grounded in the record: the ETA came from Biteful's data, not from a likely phrase. (The mock's decision to call the tool is a rule; a real model makes the same decision from the tool's description.)</p>
  <h3>Traced: parallel calls</h3>
<div class="fx" data-lang="py">import anthropic
from orders import ORDER_TOOL, get_order_status
client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")

messages = [{"role": "user", "content": "Where are my order 101 and 102?"}]
r1 = client.messages.create(model="claude-haiku-5-5", max_tokens=500,
                            tools=[ORDER_TOOL], messages=messages)
uses = [b for b in r1.content if b.type == "tool_use"]
print("tool calls in ONE reply:", [(u.name, u.input) for u in uses])

results = [{"type": "tool_result", "tool_use_id": u.id,          # match every id
            "content": get_order_status(**u.input)} for u in uses]
messages += [{"role": "assistant", "content": r1.content},
             {"role": "user", "content": results}]              # ALL results, ONE message
r2 = client.messages.create(model="claude-haiku-5-5", max_tokens=500,
                            tools=[ORDER_TOOL], messages=messages)
print(r2.content[0].text)</div>
<div class="fx" data-lang="text">tool calls in ONE reply: [('get_order_status', {'order_id': 101}), ('get_order_status', {'order_id': 102})]
Order 101 from Dosa Hut is out for delivery; Ravi should reach you by 9:05 pm. Order 102 from Chai Point is preparing; Imran should reach you by 9:20 pm.</div>
  <p>One reply asked for two tool calls. Both results go back in <strong>one</strong> user message, one <code>tool_result</code> per id. Sending them as two user messages, or forgetting one id, is a 400 error.</p>
  <h3>Good tool definitions</h3>
  <ul>
    <li><strong>Name</strong>: specific verb_noun (<code>get_order_status</code>, not <code>orders</code>).</li>
    <li><strong>Description</strong>: the model's only manual; say what it does <em>and when to call it</em>.</li>
    <li><strong>Schema</strong>: describe each property, use enums for fixed choices; <code>strict: true</code> with <code>additionalProperties: false</code> guarantees arguments match.</li>
    <li><strong>Errors</strong>: return the error text with <code>"is_error": true</code> so the model can recover (section 12 shows it).</li>
  </ul>
  <table class="tbl">
    <tr><th><code>tool_choice</code></th><th>Behaviour</th></tr>
    <tr><td><code>{"type": "auto"}</code> (default)</td><td>Model decides whether to call a tool</td></tr>
    <tr><td><code>{"type": "none"}</code></td><td>No tool calls</td></tr>
    <tr><td><code>{"type": "any"}</code> / <code>{"type": "tool", "name": …}</code></td><td>Force a call. Rejected (400) on current Claude models such as <code>claude-opus-5-5</code>; use <code>auto</code> + a clear instruction + <code>strict</code>, and check a <code>tool_use</code> came back</td></tr>
    <tr><td><code>disable_parallel_tool_use: true</code></td><td>At most one call per reply</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Tool calling</strong> (function calling): the model returns a structured <code>tool_use</code> request (id, name, JSON input) for a function you described; your code executes it and returns a <code>tool_result</code> with the same id; repeat while <code>stop_reason == "tool_use"</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"The model ran my function": it only wrote JSON. Your process executes it, so you own validation, permissions and timeouts. Tool arguments are model output and can be steered by injected text (<a class="xref" data-note="prompting">Prompt Engineering</a>, section 09): never <code>eval</code> them.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Structured outputs.</b> Tool arguments come back as schema-checked JSON. Biteful's ticket extractor needs its <em>answer</em> as JSON too. Can the API guarantee that, instead of the prompt-and-retry loop from Prompt Engineering?</div>

  <h2 id="la-struct"><span class="num">06</span>Structured Outputs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Prompt Engineering got JSON by asking nicely, validating and retrying once. Every retry is another paid call, and a nightly job of 20,000 tickets will hit odd replies. Can the API itself guarantee the shape?</p>
  </div>
  <p><strong>Structured outputs</strong> pass a JSON Schema to the API; decoding is constrained so the model can only produce tokens that keep the output valid against it. The text block then holds pure JSON with the required keys and types. With Pydantic, <code>client.messages.parse</code> builds the schema from a class and validates the reply into an object.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A government form with fixed boxes versus a blank sheet saying "please include your name and city". The form physically can't come back without a city box.</p>
  </div>
  <h3>Traced: a schema in <code>output_config</code></h3>
<div class="fx" data-lang="py">import json, anthropic
client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")
ASHA = "Hi, I'm Asha. My order 101 from Dosa Hut was due at 8:30 pm. Where is it?"

schema = {
    "type": "object",
    "properties": {
        "order_id":   {"type": "integer"},
        "restaurant": {"type": ["string", "null"]},
        "issue":      {"type": "string", "enum": ["late_delivery", "missing_item", "other"]},
        "due_time":   {"type": ["string", "null"], "description": "24h HH:MM"},
    },
    "required": ["order_id", "restaurant", "issue", "due_time"],
    "additionalProperties": False,
}
response = client.messages.create(
    model="claude-haiku-5-5", max_tokens=300,
    messages=[{"role": "user", "content": f"Extract the ticket fields.\\n\\n{ASHA}"}],
    output_config={"format": {"type": "json_schema", "schema": schema}},
)
text = next(b.text for b in response.content if b.type == "text")
data = json.loads(text)                       # safe: the text is pure JSON
print(text)
print("minutes since midnight when due:", int(data["due_time"][:2]) * 60 + int(data["due_time"][3:]))</div>
<div class="fx" data-lang="text">{"order_id": 101, "restaurant": "Dosa Hut", "issue": "late_delivery", "due_time": "20:30"}
minutes since midnight when due: 1230</div>
  <p><code>"required"</code> forces all four keys, <code>"enum"</code> limits <code>issue</code> to three values, <code>["string", "null"]</code> allows null when the message doesn't say, and <code>additionalProperties: False</code> forbids extra keys. So <code>json.loads</code> is safe and "20:30" turns into 1,230 minutes. (The mock fills the schema with regexes; a real model fills it by reading.)</p>
  <h3>Traced: Pydantic with <code>messages.parse</code></h3>
<div class="fx" data-lang="py">from typing import Literal, Optional
import anthropic
from pydantic import BaseModel
client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")

class Ticket(BaseModel):
    order_id: int
    restaurant: Optional[str]
    issue: Literal["late_delivery", "missing_item", "other"]
    due_time: Optional[str]
    customer_name: Optional[str]

response = client.messages.parse(
    model="claude-haiku-5-5", max_tokens=300,
    messages=[{"role": "user", "content":
               "Hi, I'm Asha. My order 101 from Dosa Hut was due at 8:30 pm. Where is it?"}],
    output_format=Ticket,                     # SDK builds the schema AND validates the reply
)
ticket = response.parsed_output               # a Ticket instance, not a dict
print(repr(ticket))
print(ticket.customer_name, "| order", ticket.order_id, "| issue:", ticket.issue)</div>
<div class="fx" data-lang="text">Ticket(order_id=101, restaurant='Dosa Hut', issue='late_delivery', due_time='20:30', customer_name='Asha')
Asha | order 101 | issue: late_delivery</div>
  <p><code>output_format=Ticket</code> makes the SDK send the class's schema and validate the reply; <code>parsed_output</code> is a <code>Ticket</code> instance with attributes, not a dict.</p>
  <h3>Traced: what validation still catches</h3>
  <p>Keep validating even with schemas: a <code>max_tokens</code> stop or a refusal can still leave invalid JSON, and some code paths may not use a schema. The replies are hand-written test inputs.</p>
<div class="fx" data-lang="py">from typing import Literal, Optional
from pydantic import BaseModel, ValidationError

class Ticket(BaseModel):
    order_id: int
    restaurant: Optional[str]
    issue: Literal["late_delivery", "missing_item", "other"]
    due_time: Optional[str]

# Hand-written replies that test the validator (not model output):
replies = [
    '{"order_id": 101, "restaurant": "Dosa Hut", "issue": "late_delivery", "due_time": "20:30"}',
    'Sure! Here is the JSON: {"order_id": 101}',
    '{"order_id": "one-oh-one", "restaurant": "Dosa Hut", "issue": "late_delivery", "due_time": null}',
    '{"order_id": 101, "restaurant": null, "issue": "late", "due_time": null}',
]
for text in replies:
    try:
        print("OK   ", Ticket.model_validate_json(text))
    except ValidationError as e:
        err = e.errors()[0]
        print("FAIL ", err["type"], "at", err["loc"] or "(whole reply)")</div>
<div class="fx" data-lang="text">OK    order_id=101 restaurant='Dosa Hut' issue='late_delivery' due_time='20:30'
FAIL  json_invalid at (whole reply)
FAIL  int_parsing at ('order_id',)
FAIL  literal_error at ('issue',)</div>
  <table class="tbl">
    <tr><th>Approach</th><th>Guarantee</th><th>Use when</th></tr>
    <tr><td>"Reply in JSON" in the prompt + validate/retry</td><td>None; usually right</td><td>Prototypes; providers without schema support</td></tr>
    <tr><td><code>output_config.format</code> / <code>messages.parse</code></td><td>Valid JSON matching the schema (if the reply completes)</td><td>Extraction, classification, any reply code parses</td></tr>
    <tr><td><code>strict: true</code> on a tool</td><td>Tool <em>arguments</em> match the schema</td><td>Tool calling (05)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Structured outputs</strong> (constrained decoding): the API only allows tokens that keep the output valid for your JSON Schema. <strong>Pydantic model</strong>: a typed Python class that generates a schema and validates data against it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting <code>additionalProperties: false</code> on objects, assuming numeric/length limits (<code>minimum</code>, <code>maxLength</code>) are enforced by the API (the SDK checks some afterwards), and skipping the <code>stop_reason</code> check before parsing.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Errors, rate limits &amp; retries.</b> Our calls are now well-formed. But at Biteful's dinner peak the API answers some calls with 429 "rate limited", and one buggy request returns 400. Which do we retry, and how?</div>

  <h2 id="la-errors"><span class="num">07</span>Errors, Rate Limits &amp; Retries With Backoff</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>At 8:30 pm every customer asks where their order is. The provider caps requests per minute and starts returning errors. Should the assistant crash, retry immediately, or wait, and for which errors?</p>
  </div>
  <p>Two kinds of failure. <strong>Transient</strong>: 429 (rate limited), 408/409, 5xx and 529 (overloaded), connection drops. The same request will probably work a bit later. <strong>Permanent</strong>: 400 (bad request), 401 (bad key), 403, 404. Repeating them fails forever. Retry transient errors with <strong>exponential backoff with jitter</strong> (wait about 1 s, then up to 2, 4, 8…, picked at random inside each window, honouring the server's <code>retry-after</code>), and fix permanent ones.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A busy restaurant phone line. If it's engaged, you call back in a minute, then a bit longer; if a hundred people all redial at exactly the same second, the line stays jammed, so each waits a slightly different time. If the number itself is wrong, redialling never helps.</p>
  </div>
  <h3>Traced: the SDK's built-in retries, and a 400</h3>
  <p>The mock returns 429 with <code>retry-after: 1</code> to the first two requests of a named scenario.</p>
<div class="fx" data-lang="py">import time, anthropic
ASK = [{"role": "user", "content": "Where is my order 101?"}]

def call(client, scenario, messages=ASK):
    return client.messages.create(model="claude-haiku-5-5", max_tokens=200, messages=messages,
                                  extra_headers={"x-mock-scenario": scenario})

# The mock answers 429 (rate limited, "retry-after: 1") to the first 2 requests of a scenario.
patient = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key", max_retries=3)
t0 = time.perf_counter()
r = call(patient, "ratelimit:jobA:2")
print(f"max_retries=3: succeeded after {time.perf_counter() - t0:.1f}s -&gt;", r.content[0].text[:40])

impatient = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key", max_retries=1)
try:
    call(impatient, "ratelimit:jobB:2")
except anthropic.RateLimitError as e:          # still 429 after its single retry
    print("max_retries=1: RateLimitError", e.status_code, "retry-after =", e.response.headers["retry-after"])

try:                                           # a request that is WRONG: retrying can't help
    call(patient, "none", messages=[{"role": "assistant", "content": "Hello"}])
except anthropic.BadRequestError as e:
    print("400 BadRequestError:", e.body["error"]["message"])
except anthropic.APIStatusError as e:          # any other HTTP error status
    print("other status", e.status_code)</div>
<div class="fx" data-lang="text">max_retries=3: succeeded after 2.3s -&gt; (mock) I can't see order 101: no order d
max_retries=1: RateLimitError 429 retry-after = 1
400 BadRequestError: messages: first message must use the user role</div>
  <p>With <code>max_retries=3</code> the SDK waited out two 429s (about 1 s each, as <code>retry-after</code> asked) and succeeded on the third try: 2.3 s total, invisible to the caller. With <code>max_retries=1</code> the second 429 surfaces as <code>RateLimitError</code>; your code decides (queue it, tell the user to wait). The invalid conversation (first message from the assistant) is a 400: no retry would fix it, so it's caught and logged. <code>except</code> clauses go from specific to general.</p>
  <h3>Traced: the backoff schedule</h3>
<div class="fx" data-lang="py">import random

def backoff_delays(attempts, base=1.0, cap=30.0, seed=0):
    """Exponential backoff with full jitter: wait random(0, min(cap, base * 2**n))."""
    rng = random.Random(seed)
    return [round(rng.uniform(0, min(cap, base * 2 ** n)), 2) for n in range(attempts)]

print("ceiling :", [min(30.0, 1.0 * 2 ** n) for n in range(6)])
print("worker A:", backoff_delays(6, seed=1))
print("worker B:", backoff_delays(6, seed=2))

RETRYABLE = {408, 409, 429, 500, 502, 503, 504, 529}
for status in [400, 401, 429, 529]:
    print(status, "retry with backoff" if status in RETRYABLE else "fix the request, do not retry")</div>
<div class="fx" data-lang="text">ceiling : [1.0, 2.0, 4.0, 8.0, 16.0, 30.0]
worker A: [0.13, 1.69, 3.06, 2.04, 7.93, 13.48]
worker B: [0.96, 1.9, 0.23, 0.68, 13.37, 22.08]
400 fix the request, do not retry
401 fix the request, do not retry
429 retry with backoff
529 retry with backoff</div>
  <p>The ceiling doubles each attempt up to a 30 s cap; workers A and B pick different random waits under the same ceiling, so their retries don't collide. The <code>RETRYABLE</code> set is the key design decision. SDKs retry 408, 409, 429, 5xx and connection errors by default (2 retries in the Anthropic SDK); you tune <code>max_retries</code> and <code>timeout</code> and handle what's left.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Rate limit</strong>: a cap on requests or tokens per minute. <strong>Exponential backoff with full jitter</strong>: wait random(0, min(cap, base × 2<sup>n</sup>)) before retry n. <strong>Transient error</strong>: likely to succeed if retried (429, 5xx); a 4xx other than 408/409/429 is not.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Retrying a 400 in a loop (burns time and quota), retrying without jitter (synchronised retry storms), and stacking your own retry loop on top of the SDK's without noticing (3 × 3 = 9 attempts).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Async batching.</b> Each call is now robust. But labelling 10,000 tickets one call at a time at 0.3 s each takes almost an hour. How do we run many calls at once without tripping the rate limit?</div>

  <h2 id="la-async"><span class="num">08</span>Async Batching</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Most of a call's time is waiting for the server. While one call waits, the program could send others. How do we overlap calls safely, and when is a provider's batch service better?</p>
  </div>
  <p>With <a class="xref" data-note="py_asyncio">asyncio</a>, one thread starts many requests and switches between them while each waits for the network. <code>AsyncAnthropic</code> is the async client; <code>asyncio.gather</code> runs coroutines concurrently and returns results in input order; an <code>asyncio.Semaphore</code> caps how many are in flight so you stay under the rate limit.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>One waiter, many tables. A good waiter doesn't stand at the kitchen door until table 1's food is ready; he takes table 2's order meanwhile. The semaphore is the number of order slips the kitchen accepts at once.</p>
  </div>
  <h3>Traced: 10 tickets at three concurrency levels</h3>
<div class="fx" data-lang="py">import asyncio, time, anthropic

client = anthropic.AsyncAnthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")
TICKETS = [f"Hi, my order {100 + i} was due at 8:{10 + i} pm. Where is it?" for i in range(10)]
SCHEMA = {"type": "object", "additionalProperties": False, "required": ["order_id", "due_time"],
          "properties": {"order_id": {"type": "integer"}, "due_time": {"type": ["string", "null"]}}}

async def extract(text, limit):
    async with limit:                          # at most N requests in flight
        r = await client.messages.create(
            model="claude-haiku-5-5", max_tokens=200,
            messages=[{"role": "user", "content": text}],
            output_config={"format": {"type": "json_schema", "schema": SCHEMA}})
        return r.content[0].text

async def run(concurrency):
    limit = asyncio.Semaphore(concurrency)
    t0 = time.perf_counter()
    results = await asyncio.gather(*(extract(t, limit) for t in TICKETS))   # order kept
    return results, time.perf_counter() - t0

async def main():
    for n in [1, 5, 10]:
        results, secs = await run(n)
        print(f"concurrency {n:2d}: {len(results)} tickets in {secs:.2f}s")
    print("first two results:", results[:2])

asyncio.run(main())</div>
<div class="fx" data-lang="text">concurrency  1: 10 tickets in 3.44s
concurrency  5: 10 tickets in 0.70s
concurrency 10: 10 tickets in 0.35s
first two results: ['{"order_id": 100, "due_time": "20:10"}', '{"order_id": 101, "due_time": "20:11"}']</div>
  <p>One at a time: 10 × (0.3 s simulated model time + overhead) ≈ 3.44 s. Five at a time: two waves ≈ 0.70 s. Ten at a time: one wave ≈ 0.35 s. Results keep input order, so <code>results[i]</code> belongs to <code>TICKETS[i]</code>. Timings vary from run to run; the shape (time ≈ waves × per-call latency) does not. Raising concurrency beyond your rate limit just converts speed into 429s, which is why the semaphore exists.</p>
  <h3>When nobody is waiting: the Batch API</h3>
  <table class="tbl">
    <tr><th></th><th>Async concurrent calls</th><th>Provider Batch API</th></tr>
    <tr><td>Speed</td><td>Seconds to minutes</td><td>Usually within an hour, at most 24 h</td></tr>
    <tr><td>Price</td><td>Normal</td><td>50% off (Anthropic)</td></tr>
    <tr><td>Order</td><td>gather keeps input order</td><td>Results unordered: match by <code>custom_id</code></td></tr>
    <tr><td>Use for</td><td>Interactive or near-real-time work</td><td>Nightly review summaries, evals, backfills</td></tr>
  </table>
  <p>For Biteful, the 2,000 nightly review summaries are a perfect batch job: $30 a day on Opus 5.5 would become $15.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Concurrency</strong>: several calls in flight at once, overlapping their waiting. <strong>Semaphore</strong>: a counter limiting concurrent tasks. <strong>Batch API</strong>: submit many requests for asynchronous processing at a discount, results keyed by <code>custom_id</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Unbounded <code>gather</code> over 10,000 tasks (instant 429 storm), mixing the sync client into async code (it blocks the event loop), and assuming batch results come back in request order.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Caching.</b> Every one of those calls resends the same long system prompt and policy. And many customers ask the same FAQ. Do we have to pay for identical text again and again?</div>

  <h2 id="la-cache"><span class="num">09</span>Caching</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's assistant sends a 20,000-token policy manual with every question. Ten questions in five minutes pay for the manual ten times. And "What are your delivery hours?" gets a fresh paid answer every time. Where can we stop paying twice?</p>
  </div>
  <p>Two different caches. <strong>Prompt caching</strong> (server side): the provider keeps the processed version of a request <em>prefix</em> for a few minutes; the next request that starts with exactly the same bytes reads it at a large discount and is faster. <strong>Response caching</strong> (your side): if the full question is one you've answered before and the answer doesn't depend on the user, return the stored answer without calling the model at all.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tuition teacher who has already read chapters 1–10 only reads chapter 11 today, but if you change one word on page 1 she re-reads from page 1. A shop's printed FAQ sheet is the response cache: nobody calls the owner to ask the opening hours.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <text x="70" y="33" text-anchor="end" class="tm">call 1</text>
    <rect x="80" y="15" width="110" height="26" class="fs"/><text x="135" y="33" text-anchor="middle">tools</text>
    <rect x="190" y="15" width="170" height="26" class="fs"/><text x="275" y="33" text-anchor="middle">system + policy</text>
    <rect x="360" y="15" width="140" height="26" class="fs"/><text x="430" y="33" text-anchor="middle">messages</text>
    <line x1="360" y1="8" x2="360" y2="50" class="sr" stroke-width="2"/><text x="364" y="12" class="tr" font-size="11">cache_control</text>
    <text x="508" y="33" class="tm">write 1.25×</text>
    <text x="70" y="83" text-anchor="end" class="tm">call 2</text>
    <rect x="80" y="65" width="110" height="26" class="fg sg"/><text x="135" y="83" text-anchor="middle">tools</text>
    <rect x="190" y="65" width="170" height="26" class="fg sg"/><text x="275" y="83" text-anchor="middle">system + policy</text>
    <rect x="360" y="65" width="140" height="26" class="fs"/><text x="430" y="83" text-anchor="middle">messages + new</text>
    <text x="510" y="83" class="tg">read ≈0.05×</text>
    <text x="70" y="133" text-anchor="end" class="tm">edit</text>
    <rect x="80" y="115" width="110" height="26" class="fg sg"/><text x="135" y="133" text-anchor="middle">tools</text>
    <rect x="190" y="115" width="40" height="26" class="fr sr"/><text x="210" y="133" text-anchor="middle">Δ</text>
    <rect x="230" y="115" width="130" height="26" class="fs"/><text x="295" y="133" text-anchor="middle">re-read</text>
    <rect x="360" y="115" width="140" height="26" class="fs"/><text x="430" y="133" text-anchor="middle">messages + new</text>
    <text x="510" y="133" class="tr">miss</text>
    </svg><figcaption>Prompt cache = exact prefix match in render order tools → system → messages. One changed byte (Δ) invalidates everything after it.</figcaption></figure>
  <h3>Traced: is prompt caching worth it?</h3>
  <p>On <code>claude-opus-5-5</code> (example prices, October 2026): input $4 per 1M, a 5-minute cache write 1.25× ($5), a cache read $0.20 (0.05×).</p>
<div class="fx" data-lang="py"># claude-opus-5-5 EXAMPLE prices per 1M input tokens (Oct 2026)
BASE, WRITE_5M, READ = 4.00, 4.00 * 1.25, 0.20     # cache write 1.25x, read $0.20

prefix, question, calls = 20_000, 200, 10          # policy manual; calls within 5 minutes
no_cache = calls * (prefix + question) * BASE / 1e6
with_cache = (prefix * WRITE_5M                     # call 1 writes the cache
              + (calls - 1) * prefix * READ          # calls 2..10 read it
              + calls * question * BASE) / 1e6       # the new part is always full price
print(f"input cost without caching: \${no_cache:.4f}")
print(f"input cost with caching   : \${with_cache:.4f}")
print(f"saving: {100 * (1 - with_cache / no_cache):.0f}%")</div>
<div class="fx" data-lang="text">input cost without caching: $0.8080
input cost with caching   : $0.1440
saving: 82%</div>
  <p>By hand: without caching 10 × 20,200 × $4 / 1M = $0.808. With caching: one write 20,000 × $5 / 1M = $0.100, nine reads 9 × 20,000 × $0.20 / 1M = $0.036, and the new 200-token parts at full price 10 × 200 × $4 / 1M = $0.008; total $0.144, 82% less. Two calls within the time-to-live already beat no caching.</p>
  <h3>Traced: marking the cache breakpoint</h3>
<div class="fx" data-lang="py">import anthropic
client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")

RULES = ["Refunds for missing items are issued within 5 business days.",
         "Orders more than 30 minutes late get a 20% voucher.",
         "Riders may not enter gated societies without OTP confirmation.",
         "Cancellations after the restaurant accepts are not refunded."]
POLICY = "\\n".join(f"Rule {i}: {RULES[i % 4]}" for i in range(60))   # a long, STABLE manual

def ask(question):
    return client.messages.create(
        model="claude-haiku-5-5", max_tokens=200,
        system=[{"type": "text", "text": POLICY,
                 "cache_control": {"type": "ephemeral"}}],    # cache everything up to here
        messages=[{"role": "user", "content": question}])

for q in ["Where is my order 101?", "Is order 102 late?"]:
    u = ask(q).usage
    print(f"written {u.cache_creation_input_tokens:4d} | read {u.cache_read_input_tokens:4d} "
          f"| uncached {u.input_tokens:3d}   &lt;- {q}")</div>
<div class="fx" data-lang="text">written 1066 | read    0 | uncached  22   &lt;- Where is my order 101?
written    0 | read 1066 | uncached  21   &lt;- Is order 102 late?</div>
  <p><code>cache_control</code> on the system block marks "cache everything up to here". The first call writes 1,066 tokens to the cache; the second, with a different question but byte-identical policy, reads all 1,066 and pays full price only for its own 21 tokens. If <code>cache_read_input_tokens</code> stays 0 on repeat calls, something early in the prefix is changing (a timestamp, unsorted JSON, a different tool list). (The mock simulates the bookkeeping; real minimum cacheable lengths are model-dependent, from 512 tokens up.)</p>
  <h3>Traced: an answer cache for FAQs</h3>
<div class="fx" data-lang="py">import re

calls_made = 0
def fake_model(question):                      # stands in for a paid API call
    global calls_made
    calls_made += 1
    return f"answer #{calls_made}"

cache = {}
def answer(question):
    key = re.sub(r"[^a-z0-9 ]", "", question.lower()).strip()   # normalise
    if key not in cache:                       # only FAQ-style, user-independent questions!
        cache[key] = fake_model(question)
    return cache[key]

faq = ["What are your delivery hours?", "what are your delivery hours", "WHAT ARE YOUR DELIVERY HOURS?!",
       "Do you deliver to Pune?", "do you deliver to pune"]
print([answer(q) for q in faq])
print("questions:", len(faq), "| paid calls:", calls_made)</div>
<div class="fx" data-lang="text">['answer #1', 'answer #1', 'answer #1', 'answer #2', 'answer #2']
questions: 5 | paid calls: 2</div>
  <p>Normalising (lowercase, strip punctuation) makes three spellings of the same question one key: 5 questions, 2 paid calls. Only cache answers that don't depend on who asks: "Where is my order?" must never be served from this cache.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Prompt caching</strong>: provider-side reuse of an identical request prefix across calls, billed at a discounted read rate after a premium write; not the KV cache inside one generation (<a class="xref" data-note="llm_basics">How LLMs Work</a>). <strong>Response cache</strong>: your own store of full answers keyed by a normalised question.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Silent prompt-cache invalidators (dates, user ids, unsorted JSON before the breakpoint) and response-caching user-specific answers (serving Asha's order status to someone else).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing a model / provider.</b> Every cost number depended on which model we called: $134 a day versus $3.35. How do we choose, honestly, without guessing from benchmarks?</div>

  <h2 id="la-choose"><span class="num">10</span>Choosing a Model / Provider</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Bigger models are better and pricier; providers differ in features, data terms and price. "Where is my order?" and "work out a fair refund for this 3-item complaint" are very different tasks. How should Biteful pick?</p>
  </div>
  <p>Decide from your own test set, not from leaderboards: start with the smallest, cheapest model, run your cases (the habit from <a class="xref" data-note="prompting">Prompt Engineering</a>, section 10), move up only where it fails, and route traffic so each request goes to the cheapest model that handles it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Staffing a support desk. Freshers handle "where is my order", seniors handle disputes. Hiring only seniors works, at five times the salary bill.</p>
  </div>
  <table class="tbl"><caption>An honest landscape, dated October 2026. Verify everything on the provider's page before deciding.</caption>
    <tr><th>Option</th><th>Strengths</th><th>Watch out for</th><th>Price shape</th></tr>
    <tr><td>Anthropic Claude: Opus 5.5 / Sonnet 5.5 / Haiku 5.5</td><td>Strong at instructions, tools, long context (1M tokens); structured outputs; prompt caching; Batch API</td><td>No temperature/top_p on current models; forced tool_choice rejected; thinking always on for Opus 5.5 (tune <code>effort</code>)</td><td>$4/$20, $2/$10, $0.10/$0.50 per 1M in/out</td></tr>
    <tr><td>OpenAI GPT, Google Gemini (hosted)</td><td>Comparable tiers (large / mid / small), similar tool and JSON features</td><td>Different field names (<code>choices[0].message</code>, function calling shapes); check data terms</td><td>Per token; check their current price pages (not listed here on purpose)</td></tr>
    <tr><td>Cloud platforms (Bedrock, Vertex AI, Foundry)</td><td>Same models inside your cloud account, billing and compliance</td><td>Feature availability can lag; model ids differ</td><td>Platform's own price list</td></tr>
    <tr><td>Open weights, self-hosted (Llama, Qwen, Mistral, Gemma, DeepSeek)</td><td>Data never leaves; fine-tuning; no per-token bill</td><td>GPUs cost busy or idle; you run serving and safety; quality gap on hard tasks</td><td>GPU hours + engineers (see <a class="xref" data-note="llm_basics">How LLMs Work</a>, section 09)</td></tr>
  </table>
  <h3>Traced: what routing saves</h3>
<div class="fx" data-lang="py"># Route easy traffic to a small model, hard traffic to a big one (EXAMPLE prices, Oct 2026).
PRICES = {"opus": (4.00, 20.00), "haiku": (0.10, 0.50)}       # USD per 1M (in, out)
calls_per_day, in_tok, out_tok = 20_000, 600, 60               # 'where is my order'
def daily(model, n):
    p_in, p_out = PRICES[model]
    return n * (in_tok * p_in + out_tok * p_out) / 1e6
for easy_share in [0.0, 0.8, 0.95]:
    easy = int(calls_per_day * easy_share)
    cost = daily("haiku", easy) + daily("opus", calls_per_day - easy)
    print(f"{easy_share:4.0%} routed to haiku -&gt; \${cost:7.2f} per day")</div>
<div class="fx" data-lang="text">  0% routed to haiku -&gt; $  72.00 per day
 80% routed to haiku -&gt; $  15.84 per day
 95% routed to haiku -&gt; $   5.31 per day</div>
  <p>If 95% of "where is my order" questions are easy enough for the small model (a test set tells you), the daily cost of that job falls from $72 to $5.31. The router itself can be a rule ("has an order number and no complaint words") or a cheap classifier call.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Model routing</strong>: sending each request to the cheapest model that meets the quality bar for that request type. <strong>Quality bar</strong>: the pass rate on your own test set that a model must reach.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing by a public benchmark or by price alone; switching models without re-running the test set; and treating prices and model names as stable (they change every few months).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Local models.</b> Some data must not leave Biteful's servers, and sometimes there's no network. Can the same code talk to a model running on our own machine?</div>

  <h2 id="la-local"><span class="num">11</span>Local Models</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Everything so far went to a remote API (or our mock of one). What does it take to run an open-weight model locally, and how much code changes?</p>
  </div>
  <p>Tools such as <strong>Ollama</strong> and <strong>llama.cpp</strong> run quantised open models (a 4-bit 3–8B model needs about 2–4 GB for weights) on a laptop or a single GPU; <strong>vLLM</strong> serves them at high throughput on GPU servers. Most of them expose an OpenAI-style <code>/v1/chat/completions</code> endpoint, so switching is mostly a base URL and a model name. The response shape differs from Anthropic's: <code>choices[0].message.content</code> instead of content blocks, <code>finish_reason</code> instead of <code>stop_reason</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cooking at home instead of ordering in. The kitchen (GPU) and the groceries (weights) are yours, nothing leaves the house, but you do the cooking and the dishes.</p>
  </div>
  <h3>Traced: the OpenAI-style shape</h3>
  <p>No local model could be downloaded in this environment, so the request below went to the mock's OpenAI-style endpoint. With Ollama installed and a model pulled, only <code>BASE</code> and <code>model</code> change.</p>
<div class="fx" data-lang="py">import httpx

# Many local servers (Ollama, llama.cpp's server, vLLM) speak the OpenAI-style
# "chat completions" shape. Point BASE at one of them, e.g. Ollama's
# http://localhost:11434/v1 with model "llama3.2:3b". Here BASE is our mock.
BASE = "http://127.0.0.1:8765/v1"
body = {
    "model": "llama3.2:3b",                   # whatever model the local server has pulled
    "messages": [
        {"role": "system", "content": "You are Biteful's support assistant."},
        {"role": "user", "content": "Where is my order 101?"},
    ],
    "max_tokens": 200,
}
r = httpx.post(f"{BASE}/chat/completions", json=body, timeout=60)
data = r.json()
print(data["choices"][0]["message"]["content"])        # note: choices[0].message, not content blocks
print("finish_reason:", data["choices"][0]["finish_reason"], "| usage:", data["usage"])</div>
<div class="fx" data-lang="text">(mock) I can't see order 101: no order data or tool was given to me.
finish_reason: stop | usage: {'prompt_tokens': 39, 'completion_tokens': 21, 'total_tokens': 60}</div>
  <p>Same Biteful question, different envelope: the system prompt is a message with role <code>system</code>, the answer is under <code>choices[0].message.content</code>, and usage is <code>prompt_tokens</code> / <code>completion_tokens</code>. Write a thin adapter function per provider shape and keep the rest of your code provider-neutral.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Local inference</strong>: running model weights on hardware you control. <strong>OpenAI-compatible API</strong>: the de-facto shape (<code>/v1/chat/completions</code>, <code>messages</code>, <code>choices</code>) many local servers and providers implement.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Assuming a local 3B model matches a frontier API on your task (test it), forgetting that small context windows overflow sooner, and exposing a local model server to the network without authentication.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Build it.</b> We have every piece: the call, shapes, costs, streaming, tools, JSON, retries, concurrency, caching, providers. What does a complete assistant look like, with more than one tool and errors handled?</div>

  <h2 id="la-build"><span class="num">12</span>Build It: Biteful Assistant With Two Tools</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha now asks "How late will it be?". That needs the order's ETA (a database lookup) and exact time arithmetic (8:30 pm to 9:05 pm), which <a class="xref" data-note="llm_basics">How LLMs Work</a> showed models do poorly. Can one loop chain two tools and survive a bad order number?</p>
  </div>
  <p>The program has two tools, <code>get_order_status</code> (from <code>orders.py</code>) and a <code>calculator</code> that parses arithmetic with Python's <code>ast</code> module instead of <code>eval</code> (its input is model output, steerable by injection), and the loop from section 05 with a step limit. Save it as <code>assistant.py</code>.</p>
<div class="fx" data-lang="py">import ast, json, operator
import anthropic
from orders import ORDER_TOOL, get_order_status

client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")  # real: Anthropic()
MODEL = "claude-haiku-5-5"

# ---- 1. A second tool: exact arithmetic, parsed safely (never eval!) ----
OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
       ast.Div: operator.truediv, ast.USub: operator.neg}

def _eval(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in OPS:
        return OPS[type(node.op)](_eval(node.left), _eval(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in OPS:
        return OPS[type(node.op)](_eval(node.operand))
    raise ValueError("Only numbers and + - * / are allowed")

def calculator(expression: str) -&gt; str:
    return str(_eval(ast.parse(expression, mode="eval").body))

CALC_TOOL = {
    "name": "calculator",
    "description": "Evaluate an arithmetic expression exactly. Use it for ANY arithmetic.",
    "strict": True,
    "input_schema": {"type": "object", "additionalProperties": False, "required": ["expression"],
                     "properties": {"expression": {"type": "string", "description": "e.g. (21*60+5)-(20*60+30)"}}},
}
TOOLS = [ORDER_TOOL, CALC_TOOL]
REGISTRY = {"get_order_status": get_order_status, "calculator": calculator}

# ---- 2. The tool loop ----
def run_tool(block) -&gt; dict:
    """Execute one tool_use block; errors become is_error results, not crashes."""
    try:
        out = REGISTRY[block.name](**block.input)
        return {"type": "tool_result", "tool_use_id": block.id, "content": out}
    except Exception as e:
        return {"type": "tool_result", "tool_use_id": block.id,
                "content": f"Error: {e}", "is_error": True}

def ask(question: str, max_steps: int = 5) -&gt; str:
    messages = [{"role": "user", "content": question}]
    for step in range(1, max_steps + 1):
        response = client.messages.create(
            model=MODEL, max_tokens=1024, tools=TOOLS, messages=messages,
            system="You are Biteful's support assistant. Use tools for order data and maths.")
        calls = [b for b in response.content if b.type == "tool_use"]
        print(f"step {step}: stop_reason={response.stop_reason}",
              [f"{b.name}({b.input})" for b in calls])
        if response.stop_reason != "tool_use":       # end_turn, max_tokens, refusal...
            return "".join(b.text for b in response.content if b.type == "text")
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": [run_tool(b) for b in calls]})
    return "Stopped: too many tool steps."

if __name__ == "__main__":
    print(ask("Hi, my order 101 from Dosa Hut was due at 8:30 pm. How late will it be?"))</div>
  <ul>
    <li><code>REGISTRY</code> maps the tool name the model writes to the function to run. Adding a tool = a function + a schema + one entry.</li>
    <li><code>run_tool</code> wraps every call in <code>try/except</code>: a bad order id becomes a <code>tool_result</code> with <code>is_error: True</code>, so the model can recover instead of the program crashing.</li>
    <li><code>ask</code> is the loop: call, check <code>stop_reason</code>, append the assistant turn whole, run all tools, append all results in one message, repeat; <code>max_steps</code> stops a confused model from looping and running up a bill.</li>
    <li><code>_eval</code> accepts only numbers and + − × ÷; anything else, including <code>__import__('os')</code>, raises.</li>
  </ul>
  <h3>Traced: the loop against the mock</h3>
<div class="fx" data-lang="py">from assistant import ask
print(ask("Hi, my order 101 from Dosa Hut was due at 8:30 pm. How late will it be?"))
print("---")
print(ask("Where is my order 999?"))</div>
<div class="fx" data-lang="text">step 1: stop_reason=tool_use ["get_order_status({'order_id': 101})"]
step 2: stop_reason=tool_use ["calculator({'expression': '(21 * 60 + 5) - (20 * 60 + 30)'})"]
step 3: stop_reason=end_turn []
Order 101 from Dosa Hut is out for delivery; Ravi should reach you by 9:05 pm. That is 35 minutes after the promised time.
---
step 1: stop_reason=tool_use ["get_order_status({'order_id': 999})"]
step 2: stop_reason=end_turn []
Sorry, I couldn't look that up (Error: No order 999. Known orders: [101, 102]). Could you check the order number?</div>
  <p>Question 1 took three calls: the order lookup, then the calculator with (21 × 60 + 5) − (20 × 60 + 30) = 1,265 − 1,230 = 35, then a final answer combining both: grounded ETA, exact arithmetic. Question 2 asked for order 999; the tool raised, <code>run_tool</code> returned the error as a result, and the reply asks Asha to check the number instead of crashing. (The mock's choice of tools is rule-based; with a real model the steps are usually the same, the wording varies.)</p>
  <h3>Traced: test the tools without any model</h3>
<div class="fx" data-lang="py">from types import SimpleNamespace as NS
from assistant import calculator, run_tool

print(calculator("(21 * 60 + 5) - (20 * 60 + 30)"))
print(run_tool(NS(id="t1", name="get_order_status", input={"order_id": 999})))
print(run_tool(NS(id="t2", name="calculator", input={"expression": "__import__('os').getcwd()"})))</div>
<div class="fx" data-lang="text">35
{'type': 'tool_result', 'tool_use_id': 't1', 'content': 'Error: No order 999. Known orders: [101, 102]', 'is_error': True}
{'type': 'tool_result', 'tool_use_id': 't2', 'content': 'Error: Only numbers and + - * / are allowed', 'is_error': True}</div>
  <p>Tool functions are plain Python: test them like any function. The two error results are exactly what the model would receive: a useful message, flagged as an error, with the matching id. The injected <code>__import__('os')</code> is rejected, not executed. This style of test, plus the mock server for the loop, belongs in CI.</p>
  <div class="callout intu"><span class="label">What you just built</span>
    <p>This <code>while stop_reason == "tool_use"</code> loop is the core of every agent. <a class="xref" data-note="agentic">Agent Fundamentals</a> grows it with planning and memory; <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a> puts it behind <a class="xref" data-note="api_fastapi">FastAPI</a> with guardrails; <a class="xref" data-note="rag">RAG</a> adds a retrieval tool. SDKs also offer a "tool runner" helper that writes this loop for you, once you understand it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Twelve sections, one request. How do they fit together?</div>

  <h2 id="la-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Shapes, cost, streaming, tools, schemas, retries, async, caching, providers: separate features, or layers around one request?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="la-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="240" y="120" width="200" height="56" rx="10" class="fb sb" stroke-width="2"/><text x="340" y="143" text-anchor="middle" font-size="12.5" font-weight="700">one request</text><text x="340" y="160" text-anchor="middle" class="tm" font-size="10">messages in · blocks + stop_reason + usage out</text>
<rect x="10" y="10" width="190" height="44" rx="8" class="ft st"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">shape &amp; history</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">stateless: 31 → 90 tokens</text>
<rect x="245" y="10" width="190" height="44" rx="8" class="ft st"/><text x="340" y="29" text-anchor="middle" font-size="11.5" font-weight="700">usage × price = cost</text><text x="340" y="45" text-anchor="middle" class="tm" font-size="10">$134 vs $3.35 a day</text>
<rect x="480" y="10" width="190" height="44" rx="8" class="ft st"/><text x="575" y="29" text-anchor="middle" font-size="11.5" font-weight="700">streaming</text><text x="575" y="45" text-anchor="middle" class="tm" font-size="10">same request, SSE reply</text>
<rect x="10" y="130" width="190" height="44" rx="8" class="fg sg"/><text x="105" y="149" text-anchor="middle" font-size="11.5" font-weight="700">tools loop</text><text x="105" y="165" text-anchor="middle" class="tm" font-size="10">tool_use → tool_result → again</text>
<rect x="480" y="130" width="190" height="44" rx="8" class="fg sg"/><text x="575" y="149" text-anchor="middle" font-size="11.5" font-weight="700">structured outputs</text><text x="575" y="165" text-anchor="middle" class="tm" font-size="10">schema in, valid JSON out</text>
<rect x="10" y="246" width="190" height="44" rx="8" class="fr sr"/><text x="105" y="265" text-anchor="middle" font-size="11.5" font-weight="700">errors &amp; retries</text><text x="105" y="281" text-anchor="middle" class="tm" font-size="10">429 retry · 400 fix</text>
<rect x="245" y="246" width="190" height="44" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="340" y="265" text-anchor="middle" font-size="11.5" font-weight="700">async + caching</text><text x="340" y="281" text-anchor="middle" class="tm" font-size="10">many requests, less resent cost</text>
<rect x="480" y="246" width="190" height="44" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="575" y="265" text-anchor="middle" font-size="11.5" font-weight="700">which endpoint</text><text x="575" y="281" text-anchor="middle" class="tm" font-size="10">provider, routing, local</text>
<line x1="150" y1="54" x2="260" y2="118" stroke="currentColor" marker-end="url(#la-a9)"/><line x1="340" y1="54" x2="340" y2="118" stroke="currentColor" marker-end="url(#la-a9)"/><line x1="530" y1="54" x2="420" y2="118" stroke="currentColor" marker-end="url(#la-a9)"/>
<line x1="200" y1="152" x2="238" y2="152" stroke="currentColor" marker-end="url(#la-a9)"/><line x1="478" y1="152" x2="442" y2="152" stroke="currentColor" marker-end="url(#la-a9)"/>
<line x1="150" y1="244" x2="260" y2="178" stroke="currentColor" marker-end="url(#la-a9)"/><line x1="340" y1="244" x2="340" y2="178" stroke="currentColor" marker-end="url(#la-a9)"/><line x1="530" y1="244" x2="420" y2="178" stroke="currentColor" marker-end="url(#la-a9)"/>
</svg><figcaption>Everything is a layer around one request/response: what goes in, what it costs, how the reply arrives, what the model may ask for, what shape comes back, what to do when it fails, how many to send, what not to resend, and where to send it.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the Biteful example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our example</th><th>When to use</th></tr>
    <tr><td>SDK call</td><td>HTTP POST + JSON</td><td>how does code use a model?</td><td>"I can't see order 101" (no data yet)</td><td>always</td></tr>
    <tr><td>Shape &amp; history</td><td>roles, blocks, stop_reason, usage</td><td>what's in a request/reply?</td><td>31 vs 90 tokens with history; 375 → 715 per turn</td><td>every call, every debug</td></tr>
    <tr><td>Cost</td><td>usage × price</td><td>what does it cost?</td><td>$134 / $67 / $3.35 a day</td><td>before shipping, per change</td></tr>
    <tr><td>Streaming</td><td>SSE events + deltas</td><td>how to show words early?</td><td>first text ≈0.3 s, done ≈1 s</td><td>chat UIs, long outputs</td></tr>
    <tr><td>Tool calling</td><td>schema + tool_use + tool_result</td><td>how does it get live data?</td><td>ETA 9:05 pm from the order table</td><td>live data, actions, exact maths</td></tr>
    <tr><td>Structured outputs</td><td>JSON Schema / Pydantic</td><td>how to guarantee JSON?</td><td>{"order_id": 101, …, "due_time": "20:30"}</td><td>any reply parsed by code</td></tr>
    <tr><td>Retries</td><td>status codes + backoff + jitter</td><td>what if a call fails?</td><td>two 429s → success in 2.3 s; 400 not retried</td><td>every production client</td></tr>
    <tr><td>Async batching</td><td>asyncio + Semaphore</td><td>how to run many calls?</td><td>3.44 s → 0.35 s for 10 tickets</td><td>bulk and fan-out work</td></tr>
    <tr><td>Caching</td><td>identical prefix / identical question</td><td>how to stop paying twice?</td><td>82% cheaper input; 5 FAQs → 2 calls</td><td>long stable prompts; FAQs</td></tr>
    <tr><td>Choosing &amp; routing</td><td>test set + prices</td><td>which model?</td><td>$72 → $5.31 a day with 95% routed</td><td>every new feature</td></tr>
    <tr><td>Local models</td><td>OpenAI-style endpoint</td><td>can we self-host?</td><td>same question via /v1/chat/completions</td><td>data residency, offline, volume</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>An LLM API is one stateless request/response. Everything else is a layer you add around it: history (you resend), tools (you execute), schemas (you supply and still validate), retries and concurrency (you control), caching (you design for byte-identical prefixes), and the endpoint (you choose by test set and price). The model never acts; your code does.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b></div>

  <h2 id="la-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Most API bugs are silent: a dropped block, a split result, a cache that never hits. Which ones to check first?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: appending only the text</span><p>Append <code>response.content</code> (all blocks) as the assistant turn. Dropping <code>tool_use</code> or <code>thinking</code> blocks breaks the next call.</p></div>
  <div class="callout trap"><span class="label">Trap: one message per tool result</span><p>All <code>tool_result</code> blocks for one assistant turn go in a single user message, one per id. Otherwise: 400.</p></div>
  <div class="callout trap"><span class="label">Trap: ignoring stop_reason</span><p>A <code>max_tokens</code> stop means cut-off output; a <code>refusal</code> means no normal answer. Branch before parsing or running tools.</p></div>
  <div class="callout trap"><span class="label">Trap: prompt-only JSON in a pipeline</span><p>Use structured outputs and still validate. No prefill on current Claude models.</p></div>
  <div class="callout trap"><span class="label">Trap: forcing tool_choice on current models</span><p><code>any</code>/<code>tool</code> returns 400 on <code>claude-opus-5-5</code>. Use <code>auto</code> + instruction + <code>strict</code>, and check a <code>tool_use</code> came back.</p></div>
  <div class="callout trap"><span class="label">Trap: retrying everything</span><p>Retry 429/5xx with backoff and jitter; never 400. Don't stack your loop on the SDK's.</p></div>
  <div class="callout trap"><span class="label">Trap: unbounded concurrency</span><p><code>gather</code> without a semaphore turns a rate limit into a 429 storm.</p></div>
  <div class="callout trap"><span class="label">Trap: a cache that never hits</span><p>Timestamps, ids or unsorted JSON before the breakpoint. Check <code>cache_read_input_tokens &gt; 0</code> on the second call.</p></div>
  <div class="callout trap"><span class="label">Trap: eval() on tool input</span><p>Tool arguments are model output and can be steered by injected text. Whitelist (the <code>ast</code> calculator), validate, limit permissions.</p></div>
  <div class="callout trap"><span class="label">Trap: testing against the paid API</span><p>Slow, costly and non-deterministic. Unit-test tools, run the loop against a mock or scripted client in CI.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet</b>, then <a class="xref" data-note="rag">RAG</a> (retrieve the facts before the call) and <a class="xref" data-note="agentic">Agent Fundamentals</a> (grow the tool loop).</div>

  <h2 id="la-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful's assistant. Asha: "Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?" Order 101: out for delivery, rider Ravi, ETA 9:05 pm. Jobs per day: 20,000 "where is my order" (600 in / 60 out), 2,000 review summaries (3,000 / 150), 20,000 extractions (200 / 40). All runs went to a local mock server, not a paid API.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our example</th><th>Weakness → next</th></tr>
    <tr><td>SDK call</td><td>how does code use a model?</td><td>"I can't see order 101"</td><td>what's in the request?</td></tr>
    <tr><td>Shape &amp; history</td><td>which fields; how does it remember?</td><td>31 vs 90 tokens; max_tokens=8 truncates</td><td>what does it cost?</td></tr>
    <tr><td>Cost</td><td>what's the daily bill?</td><td>$134 vs $3.35</td><td>long waits</td></tr>
    <tr><td>Streaming</td><td>show words early?</td><td>≈0.3 s to first text</td><td>still no live data</td></tr>
    <tr><td>Tool calling</td><td>get order 101's status?</td><td>"Ravi … by 9:05 pm"</td><td>JSON answers?</td></tr>
    <tr><td>Structured outputs</td><td>guaranteed JSON?</td><td>due_time "20:30"</td><td>calls fail</td></tr>
    <tr><td>Retries</td><td>handle 429 / 400?</td><td>success in 2.3 s; 400 caught</td><td>one at a time is slow</td></tr>
    <tr><td>Async</td><td>many calls at once?</td><td>3.44 s → 0.35 s</td><td>resent text costs</td></tr>
    <tr><td>Caching</td><td>stop paying twice?</td><td>82% saving; 2 calls for 5 FAQs</td><td>which model?</td></tr>
    <tr><td>Choosing</td><td>which model/provider?</td><td>routing: $72 → $5.31</td><td>data can't leave?</td></tr>
    <tr><td>Local models</td><td>self-host?</td><td>OpenAI-style endpoint</td><td>→ Build It, RAG, agents</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Cost per call</td><td>in × p<sub>in</sub> + out × p<sub>out</sub></td><td>tokens × price per token (list prices per 1M)</td></tr>
    <tr><td>Input of call t in a chat</td><td>S + (t − 1)(Q + A) + Q</td><td>S system, Q question, A answer tokens</td></tr>
    <tr><td>Latency</td><td>TTFT + out ÷ tokens per second</td><td>streaming shows text after TTFT</td></tr>
    <tr><td>Backoff wait</td><td>random(0, min(cap, base × 2<sup>n</sup>))</td><td>n retry number; honour retry-after</td></tr>
    <tr><td>Async time</td><td>≈ ⌈N ÷ concurrency⌉ × per-call latency</td><td>N calls</td></tr>
    <tr><td>Cached input cost</td><td>P × 1.25p + (k − 1) × P × r + k × Q × p</td><td>P prefix, Q new tokens, k calls, p base price, r read price</td></tr>
    <tr><td>Weight memory (local)</td><td>params × bytes per param</td><td>8B at 4-bit ≈ 4 GB</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Streaming</b><p>Chat UIs, long outputs.</p><small>Not for code that parses the result: use the final message</small></div>
    <div><b>Tools</b><p>Live data, actions, exact maths.</p><small>Not to get JSON answers: use structured outputs</small></div>
    <div><b>Structured outputs</b><p>Extraction, routing labels, anything parsed.</p><small>Still check stop_reason and validate</small></div>
    <div><b>Async gather</b><p>Many independent calls now.</p><small>Batch API when nobody waits (50% off)</small></div>
    <div><b>Prompt caching</b><p>Long stable prefixes reused within minutes.</p><small>Useless if the prefix changes per call</small></div>
    <div><b>Local models</b><p>Data residency, offline, very high volume.</p><small>Test quality; you run the ops</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Appending only text; splitting tool results; ignoring stop_reason; prompt-only JSON; forced tool_choice on current models; retrying 400s; unbounded gather; cache invalidators; eval() on tool input; testing against the paid API.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>600 in + 60 out at $4 / $20 per 1M, 20,000 calls a day?</td><td>$0.0036 × 20,000 = $72</td></tr>
    <tr><td>The model asked for two tools. How many user messages carry the results?</td><td>One, with two tool_result blocks matching the ids</td></tr>
    <tr><td>Which of 400, 429, 529 do you retry?</td><td>429 and 529</td></tr>
    <tr><td>10 calls of 0.3 s, concurrency 5: rough time?</td><td>2 waves × 0.3 s ≈ 0.6–0.7 s</td></tr>
    <tr><td>20,000-token prefix, 10 calls, $4 base, $5 write, $0.20 read, 200 new tokens each: input cost?</td><td>$0.100 + $0.036 + $0.008 = $0.144 (vs $0.808)</td></tr>
  </table>

  <h2 id="la-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you trace a request end to end, and say why each layer needs the one before it? Answer before revealing.</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>The API is stateless. How does a chatbot "remember", and what does it cost?</summary><div class="qa-body">Your code resends the whole conversation in <code>messages</code> each call, so input tokens, cost and latency grow every turn (375 → 715 tokens per call over 5 turns in our example). Mitigate with prompt caching and trimming or summarising old turns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>response.content</code> a list, not a string?</summary><div class="qa-body">One reply can mix text, thinking and several tool_use blocks. Loop and check <code>block.type</code>, and send the whole list back as the assistant turn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your JSON pipeline fails only on long inputs. First thing to check?</summary><div class="qa-body"><code>stop_reason</code>: if it is <code>max_tokens</code>, the output was cut off mid-JSON. Raise the ceiling, ask for less, use structured outputs, and validate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does streaming reduce cost or total latency?</summary><div class="qa-body">No. Same tokens, same end time. It shortens the time until the first words appear (≈0.3 s vs ≈1 s for our reply).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through one tool call, naming every message.</summary><div class="qa-body">(1) user message + tool schemas. (2) Reply: assistant content with a tool_use block (id, name, input), stop_reason tool_use. (3) Your code runs the function. (4) Next request: history + that assistant turn unchanged + a user turn with tool_result (same tool_use_id). (5) Reply: an answer (end_turn) or another tool call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your tool raised an exception. What goes back to the model?</summary><div class="qa-body">A tool_result with the same id, <code>is_error: true</code> and a useful message ("No order 999. Known orders: [101, 102]"). The model can ask the user or retry with fixed arguments; crashing loses the conversation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which errors do you retry, and how?</summary><div class="qa-body">Transient ones (408, 409, 429, 5xx/529, connection errors) with exponential backoff and jitter, honouring retry-after; the SDK does this by default. Never retry 400/401/403/404: fix the request or credentials.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use the Batch API instead of async calls?</summary><div class="qa-body">Large jobs nobody waits on (nightly review summaries, evals): 50% cheaper, up to 24 h, results matched by custom_id. Async gather is for work needed in seconds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Prompt caching is on but <code>cache_read_input_tokens</code> is always 0. Likely causes?</summary><div class="qa-body">Something early in the prefix changes per request (timestamp, user id, unsorted JSON, varying tool list), the prefix is below the minimum cacheable length, or calls are further apart than the time-to-live. Diff two consecutive request bodies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you test a tool loop in CI without the paid API?</summary><div class="qa-body">Unit-test the tool functions directly; run the loop against a local mock server (or a scripted fake client) and assert on what your code sent: matching ids, all results in one message, the step limit respected.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does tool calling depend on the stateless message history?</summary><div class="qa-body">The model doesn't remember asking for the tool. Request 2 must carry the original question, the assistant turn with the tool_use block (exact id) and the tool_result, or the model can't link the result to its request. Drop the assistant turn or change the id and the call fails.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you add async concurrency without retries?</summary><div class="qa-body">More requests per second hit the rate limit sooner; without backoff each 429 becomes a failed ticket (and naive immediate retries make the storm worse). Concurrency, a semaphore and jittered retries are designed together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does prompt caching interact with how you write the system prompt (Prompt Engineering)?</summary><div class="qa-body">Caching needs a byte-identical prefix in the order tools → system → messages. A date, user name or order id at the top of the system prompt changes the prefix every call, so nothing is reused. Stable rules first, variable data in the user turn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why use a calculator tool instead of chain-of-thought for "how late will it be"?</summary><div class="qa-body">Numbers are split into irregular tokens and the model predicts digits like words (How LLMs Work), so even with steps it can slip; voting only reduces random slips. Code computes 1,265 − 1,230 = 35 exactly every time; CoT is for reasoning code can't do.</div></details>
  <div class="bridge"><b>Next:</b> <a class="xref" data-note="rag">Retrieval-Augmented Generation</a> fills the prompt with the right facts before the call; <a class="xref" data-note="agentic">Agent Fundamentals</a> grows the tool loop.</div>
</main>`
});
