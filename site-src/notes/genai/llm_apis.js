// notes/genai/llm_apis.js — LLM APIs & Tool Calling
Object.assign(TOPIC_CONTENT, {
  "llm_apis": `<main>
  <h1>LLM APIs &amp; Tool Calling</h1>
  <div class="where"><span>Generative AI</span><span>Working with LLMs</span><span>LLM APIs &amp; Tool Calling</span></div>
  <p class="lead">Hosted language models are used through an <strong>API</strong>: your program sends a request over the internet describing the conversation, and receives the model's reply as data it can work with. Almost every real LLM application, from a support chatbot to an agent that books appointments, is built from these requests plus the code wrapped around them: keeping the conversation history, counting cost, streaming text to the screen, letting the model call your functions, demanding valid JSON, retrying failures and sending many requests at once. You already know what a model does (<a class="xref" data-note="llm_basics">How LLMs Work</a>) and how to write a prompt it follows (<a class="xref" data-note="prompting">Prompt Engineering</a>); this page is the plumbing. The running example is still Biteful's support assistant answering Asha's <em>"Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"</em>, and by the end it will look up her order with a tool and work out exactly how late it is. No paid API was called. Every request on this page went to a small local server written for these notes that accepts the same requests as Anthropic's Messages API and answers in the same JSON shapes; the real <code>anthropic</code> Python library was pointed at it. That server's "model" is a handful of if-rules, so its replies show the plumbing faithfully but say nothing about the quality of a real model.</p>

  <h2 id="la-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">LLM APIs &amp; Tool Calling</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">One request</div>
        <ul>
          <li>In: <b>model</b>, <b>max_tokens</b>, <b>system</b>, <b>messages</b>, tools</li>
          <li>Out: list of <b>content blocks</b>, <b>stop_reason</b>, <b>usage</b></li>
          <li><b>Stateless</b>: your code resends the history every call</li>
          <li>Cost = input × input price + output × output price</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tool calling</div>
        <ul>
          <li>You describe functions; the model replies with <b>tool_use</b></li>
          <li>Your code runs it, returns <b>tool_result</b> with the same id</li>
          <li>Loop while stop_reason is "tool_use"</li>
          <li>All results for one turn go in one user message</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reliability</div>
        <ul>
          <li><b>Streaming</b>: same reply, first words sooner</li>
          <li><b>Structured outputs</b>: JSON Schema enforced; still validate</li>
          <li>Retry 429 / 5xx with backoff and jitter; never retry 400</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scale and cost</div>
        <ul>
          <li>Async + semaphore for many calls; Batch API for no-rush jobs</li>
          <li><b>Prompt caching</b> for repeated prefixes; answer cache for FAQs</li>
          <li>Smallest model that passes your tests; route the rest</li>
          <li>Local servers speak an OpenAI-style API</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="la-call"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Calling a Model From Code</span><span class="rm-sub">HTTP, the SDK and API keys</span></div></div>
      <div class="rm-item rm-done" data-target="la-shape"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Requests, Responses and History</span><span class="rm-sub">the fields, statelessness, stop reasons</span></div></div>
      <div class="rm-item rm-done" data-target="la-cost"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Tokens and Cost</span><span class="rm-sub">what a day of traffic costs</span></div></div>
      <div class="rm-item rm-done" data-target="la-stream"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Streaming</span><span class="rm-sub">showing words as they are generated</span></div></div>
      <div class="rm-item rm-done" data-target="la-tools"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Tool Calling</span><span class="rm-sub">letting the model ask your code for data</span></div></div>
      <div class="rm-item rm-done" data-target="la-struct"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Structured Outputs</span><span class="rm-sub">JSON guaranteed by the API</span></div></div>
      <div class="rm-item rm-done" data-target="la-errors"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Errors, Rate Limits and Retries</span><span class="rm-sub">which failures to retry, and how</span></div></div>
      <div class="rm-item rm-done" data-target="la-async"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Concurrency and the Batch API</span><span class="rm-sub">many calls at once</span></div></div>
      <div class="rm-item rm-done" data-target="la-cache"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Caching</span><span class="rm-sub">not paying twice for the same text</span></div></div>
      <div class="rm-item rm-done" data-target="la-choose"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Choosing a Model, and Local Models</span><span class="rm-sub">providers, routing, self-hosting</span></div></div>
      <div class="rm-item rm-done" data-target="la-build"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">An Assistant With Two Tools</span><span class="rm-sub">the complete tool loop</span></div></div>
      <div class="rm-item rm-done" data-target="la-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">lost blocks, split results, retrying 400s</span></div></div>
      <div class="rm-item rm-done" data-target="la-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">fields, loop, formulas, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="la-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on LLM APIs</span></div></div>
    </div>
  </div>

  <h2 id="la-call"><span class="num">01</span>Calling a Model From Code</h2>
  <p>So far we have written prompts as strings. Biteful's app has to send Asha's message to a model and show her the reply, thousands of times a day, from a program. Hosted models are web services: your program sends an <strong>HTTP request</strong> (a POST, the kind a web form submits) with a JSON body saying which model to use, what the conversation is and how long the reply may be, and the service sends JSON back. Anthropic's endpoint for this is <code>POST /v1/messages</code>; OpenAI-style services use <code>POST /v1/chat/completions</code>. The idea is the same, only the field names differ.</p>
  <p>Writing HTTP requests by hand is tedious, so providers publish an <strong>SDK</strong> (software development kit), a library such as the <code>anthropic</code> Python package that builds the request, sends it, retries some failures automatically, and turns the reply into Python objects. Think of sending a parcel: there is a form with fixed boxes (to, from, weight, contents), and in return you get a receipt with a status and a charge. The SDK is the counter clerk who fills in the form neatly for you and hands you the receipt. Every request carries an <strong>API key</strong>, a secret string that identifies your account and is used for billing. It belongs in an environment variable (<code>ANTHROPIC_API_KEY</code>), never in code, because code ends up in Git repositories and notebooks that other people see.</p>
  <p>Here is the smallest useful call. The only difference from production code is the <code>base_url</code> line, which sends the request to the local practice server instead of Anthropic; with a real key you would simply write <code>anthropic.Anthropic()</code>:</p>
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
  <p>The reply is honest: with no order data and no tool, the assistant cannot know where order 101 is, the limitation described in <a class="xref" data-note="llm_basics">How LLMs Work</a>. Four parts of the response are worth noticing now, and the next section explains each. <code>response.content</code> is a <em>list</em> of blocks, not a single string, so we loop over it. <code>stop_reason</code> says why the model stopped writing. <code>usage</code> counts the input and output tokens you would be billed for. And <code>model</code> shows which model answered, here the practice server rather than Claude. Pointing tests at a fake server like this is also good practice in real projects, so that automated tests never spend money.</p>

  <h2 id="la-shape"><span class="num">02</span>Requests, Responses and History</h2>
  <p>The SDK hides the HTTP, but to debug a problem, log what was sent or switch providers, you need to know the raw shapes. Here is the same kind of call sent as plain HTTP with the <code>httpx</code> library, which is all the SDK does for you:</p>
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
  <p>The request has four fields. <code>model</code> names the model; pin an exact id such as <code>claude-haiku-5-5</code> so behaviour does not change under you. <code>max_tokens</code> is required, and it is a ceiling on the reply's length, not a target. <code>system</code> holds the standing instructions as a separate top-level field, not as a message in the list. <code>messages</code> is the conversation so far: alternating <code>user</code> and <code>assistant</code> turns, starting with <code>user</code>, each with a <code>role</code> and <code>content</code> (a string, or a list of blocks). Optional fields add tools (section 05), an output schema or effort setting (section 06), stop strings, and streaming (section 04). The headers carry the key (<code>x-api-key</code>) and the API version. The response is an assistant message: a list of <strong>content blocks</strong>, each with a <code>type</code> such as <code>text</code>, <code>tool_use</code> or <code>thinking</code>; a <code>stop_reason</code>; and <code>usage</code>. The response's <code>request-id</code> header is what a provider's support team asks for when you report a problem.</p>
  <p>The single most important property of these APIs is that they are <strong>stateless</strong>: the server keeps no memory between calls. Each request must carry the entire conversation. It is like a call centre where a different agent picks up every time; the new agent knows nothing about you unless you hand over the whole case file, and a thicker file takes longer to read and costs more each time. Watch what happens when Asha gives her name in one call and asks for it in the next:</p>
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
  <p>A new request containing only "What is my name?" cannot know the answer. With history, three messages are sent (Asha's first message, the assistant's earlier reply, the new question) and the reply is correct, but the input grows from 31 to 90 tokens. Notice that the assistant turn appended is <code>r1.content</code>, the whole list of blocks, not just its text. Once tools or thinking are involved, a reply contains blocks the next call needs, and dropping them breaks it. Because history is resent every time, cost grows with the length of a chat. With a 350-token system prompt, 25-token questions and 60-token replies, five turns send 375, 460, 545, 630 and 715 input tokens: 2,725 in total for only 425 tokens of new text. Long chats and agents grow faster still, which is why trimming old turns and prompt caching (section 09) matter.</p>
  <p>The last part of every response, <code>stop_reason</code>, tells your code what to do next:</p>
  <table class="tbl">
    <tr><th>stop_reason</th><th>Meaning</th><th>Your code should</th></tr>
    <tr><td><code>end_turn</code></td><td>The model finished naturally</td><td>Use the answer</td></tr>
    <tr><td><code>max_tokens</code></td><td>It hit your length ceiling mid-answer</td><td>Treat as cut off; never parse it or run a half-written tool call</td></tr>
    <tr><td><code>tool_use</code></td><td>It wants a tool to be run</td><td>Run it, send the result back, call again (section 05)</td></tr>
    <tr><td><code>stop_sequence</code></td><td>It produced one of your stop strings</td><td>Use the text before it</td></tr>
    <tr><td><code>pause_turn</code></td><td>A server-side tool loop paused</td><td>Send the conversation back to continue</td></tr>
    <tr><td><code>refusal</code></td><td>It declined for safety reasons</td><td>Show a safe message; don't parse</td></tr>
  </table>
  <div class="fx" data-lang="py">import anthropic
client = anthropic.Anthropic(base_url="http://127.0.0.1:8765", api_key="mock-key")
ask = [{"role": "user", "content": "Hi, my order 101 from Dosa Hut was due at 8:30 pm. Where is it?"}]

for kw in [dict(max_tokens=300), dict(max_tokens=8), dict(max_tokens=300, stop_sequences=[":"])]:
    resp = client.messages.create(model="claude-haiku-5-5", messages=ask, **kw)
    print(f"{str(kw):45s} -&gt; {resp.stop_reason:13s} {resp.content[0].text!r}")</div>
  <div class="fx" data-lang="text">{'max_tokens': 300}                           -&gt; end_turn      "(mock) I can't see order 101: no order data or tool was given to me."
{'max_tokens': 8}                             -&gt; max_tokens    "(mock) I can't see"
{'max_tokens': 300, 'stop_sequences': [':']}  -&gt; stop_sequence "(mock) I can't see order 101"</div>
  <p>The same question with three settings gives three stop reasons. With <code>max_tokens=8</code> the reply is cut after eight tokens. That is harmless here, but a cut-off JSON object or tool call would break your pipeline, which is why code must check <code>stop_reason</code> before using a reply. The stop sequence ":" ends the text just before the colon. Since providers add new stop reasons over time, code should also log any value it does not recognise rather than assume a normal answer. One more rule for current Claude models: you cannot "prefill" the start of the assistant's reply to force a format; such requests are rejected with a 400 error.</p>

  <h2 id="la-cost"><span class="num">03</span>Tokens and Cost</h2>
  <p>Every response reports its <code>usage</code>, and that is exactly what you pay for. The formula from <a class="xref" data-note="llm_basics">How LLMs Work</a> is: cost = input tokens × input price + output tokens × output price, with prices quoted per million tokens and output priced about five times higher than input. One call costs a fraction of a cent, but Biteful will make about 42,000 calls a day across three jobs, so it is worth estimating the bill before shipping. Think of a taxi meter that charges a little for every kilometre you describe and much more for every kilometre driven: many short rides add up.</p>
  <p>The token counts below use the GPT-2 tokenizer, which is close to but not the same as Claude's, and the prices are Anthropic's list prices as of October 2026, used as examples; check the current price page before deciding anything:</p>
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
  <p>Check the first job on Opus 5.5 by hand: per call, 600 × $4 / 1M + 60 × $20 / 1M = $0.0024 + $0.0012 = $0.0036, and 20,000 calls make $72 a day. All three jobs total $134 a day, about $4,020 a month; the same workload on Haiku 5.5 costs $3.35 a day, forty times less. The last line shows how much output matters: 60 of the 660 tokens per call (9%) produce a third of the cost. The job estimates (600, 3,000 and 200 input tokens) are deliberately larger than the 108 tokens measured at the top, to leave room for longer rules, history and tool definitions. And if a tool loop needs two calls to answer one question, the input is paid twice.</p>
  <p>Tool definitions are part of the prompt too, so they are paid on every call. The API has a free endpoint that counts tokens before you send anything (the practice server counts with GPT-2); <code>ORDER_TOOL</code> is the order-lookup tool defined in section 04:</p>
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
  <p>Adding one tool definition tripled the input from 47 to 147 tokens. The habits that follow are simple: count with the real tokenizer rather than estimating from characters, include everything that is sent (system prompt, history, tool schemas), and write down the date of any prices you rely on, because they change. Thinking tokens from reasoning models are billed as output even when they are not shown.</p>

  <h2 id="la-stream"><span class="num">04</span>Streaming</h2>
  <p>A normal call returns nothing until the whole reply is finished. A 300-token reply at 60 tokens a second keeps Asha staring at a spinner for five seconds, which feels broken in a chat window. With <strong>streaming</strong>, the server keeps the HTTP response open and sends the reply in pieces as the tokens are generated, using a simple format called <strong>server-sent events</strong> (SSE): plain-text lines of the form <code>event: name</code> followed by <code>data: {json}</code>. The total time and the cost are exactly the same; only the wait before the first words appear (the time to first token) shrinks. It is the difference between watching a cricket match live and receiving the highlights video after it ends: the same match, the same length, but live you start watching at once.</p>
  <p>From here on the examples use Biteful's order table and a tool definition, kept in <code>orders.py</code>. The tool will be explained in the next section; for now, notice only that the model can reply with a request to use it:</p>
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
  <p>Here is a raw event stream, read line by line with <code>httpx</code>, with a timestamp on each event:</p>
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
  <div class="fx" data-lang="text"> 0.30s event: message_start
 0.30s event: content_block_start
 0.30s event: content_block_delta
        delta: {'type': 'text_delta', 'text': 'Let '}
 0.35s event: content_block_delta
        delta: {'type': 'text_delta', 'text': 'me '}
 0.40s event: content_block_delta
        delta: {'type': 'text_delta', 'text': 'check '}
 0.45s event: content_block_delta
        delta: {'type': 'text_delta', 'text': 'order '}
 0.50s event: content_block_delta
        delta: {'type': 'text_delta', 'text': '101.'}
 0.55s event: content_block_stop
 0.55s event: content_block_start
 0.55s event: content_block_delta
        delta: {'type': 'input_json_delta', 'partial_json': '{"order_id":'}
 0.60s event: content_block_delta
        delta: {'type': 'input_json_delta', 'partial_json': ' 101}'}
 0.65s event: content_block_stop
 0.65s event: message_delta
        delta: {'stop_reason': 'tool_use', 'stop_sequence': None}
 0.65s event: message_stop</div>
  <p>The order of events is always the same. <code>message_start</code> carries the message id, model and input usage. Then, for each content block, there is a <code>content_block_start</code>, several <code>content_block_delta</code> events carrying the new pieces (each piece is a <strong>delta</strong>), and a <code>content_block_stop</code>. Finally <code>message_delta</code> carries the stop reason and final output usage, and <code>message_stop</code> ends the stream. Text arrives as <code>text_delta</code> pieces. The tool call's arguments arrive as <code>input_json_delta</code> fragments, <code>'{"order_id":'</code> and then <code>' 101}'</code>, which are not valid JSON until joined, so never act on half-streamed tool arguments. The first event arrives after about 0.3 seconds (the practice server's simulated thinking time) and then a piece every 0.05 seconds.</p>
  <p>In practice the SDK assembles the events for you:</p>
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
first text after 0.29s, finished after 1.02s
end_turn 21 output tokens</div>
  <p><code>stream.text_stream</code> yields only the text pieces, which are printed as they arrive (<code>end=""</code> keeps them on one line and <code>flush=True</code> shows them immediately). <code>get_final_message()</code> returns the complete message with its <code>stop_reason</code> and <code>usage</code>, exactly like a non-streamed call, and that is what code should parse. The first text appeared after 0.3 seconds and the reply finished after about a second; without streaming the user would have seen nothing for that whole second. Use streaming for chat interfaces and long outputs (SDKs also refuse very long non-streamed requests because the connection could time out), and remember that it makes replies <em>feel</em> faster without making them faster.</p>

  <h2 id="la-tools"><span class="num">05</span>Tool Calling</h2>
  <p>Every reply so far has admitted that it cannot see order 101. A model can only produce text, and the order's status lives in Biteful's database. In <a class="xref" data-note="prompting">Prompt Engineering</a> we solved this by pasting the record into the prompt by hand, but that only works when we know in advance which data the question needs. <strong>Tool calling</strong> (also called function calling) lets the model itself decide that it needs data, and ask for it.</p>
  <p>It works like this. In the request you describe some functions in a <code>tools</code> list: each has a name, a description saying what it does and when to use it, and a JSON Schema describing its arguments. When the model decides it needs one, instead of answering it returns a <code>tool_use</code> block containing an id, the tool's name and the arguments, and stops with <code>stop_reason</code> set to <code>"tool_use"</code>. Your code then runs the real function and sends the output back in a <code>tool_result</code> block carrying the same id. The model reads the result and either answers or asks for another tool. The model never executes anything itself; it only writes a request. Think of a head chef who never leaves the pass: she writes tickets ("2 masala dosas, table 4"), the kitchen cooks and sends the plates back, and she checks them and serves. The model writes the tickets; your code is the kitchen.</p>
  <figure class="viz"><svg viewBox="0 0 620 315" width="620">
    <defs><marker id="la-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="90" y="20" text-anchor="middle">Your code</text><line x1="90" y1="30" x2="90" y2="290" stroke="currentColor" opacity="0.25" stroke-dasharray="3 3"/>
    <text x="330" y="20" text-anchor="middle">Model (API)</text><line x1="330" y1="30" x2="330" y2="290" stroke="currentColor" opacity="0.25" stroke-dasharray="3 3"/>
    <text x="540" y="20" text-anchor="middle">Tool function</text><line x1="540" y1="30" x2="540" y2="290" stroke="currentColor" opacity="0.25" stroke-dasharray="3 3"/>
    <line x1="90" y1="55" x2="326" y2="55" class="sb" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="49" text-anchor="middle" class="tm">1. Asha's message + tool definitions</text>
    <line x1="330" y1="97" x2="94" y2="97" class="sr" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="91" text-anchor="middle" class="tr">2. tool_use {order_id: 101} · stop=tool_use</text>
    <line x1="90" y1="139" x2="536" y2="139" class="st" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="315" y="133" text-anchor="middle" class="tm">3. get_order_status(101)</text>
    <line x1="540" y1="181" x2="94" y2="181" class="st" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="315" y="175" text-anchor="middle" class="tm">4. {"status": "out_for_delivery", "eta": "9:05 pm", …}</text>
    <line x1="90" y1="223" x2="326" y2="223" class="sb" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="217" text-anchor="middle" class="tm">5. history + assistant turn + tool_result (same id)</text>
    <line x1="330" y1="265" x2="94" y2="265" class="sg" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="259" text-anchor="middle" class="tg">6. "Ravi should reach you by 9:05 pm" · end_turn</text>
    <text x="10" y="305" class="tm">↻ repeat steps 2–5 while stop_reason == "tool_use"</text>
    </svg><figcaption>One tool round trip. The model only writes the request (2); your code runs the function (3–4) and sends the result back (5).</figcaption></figure>
  <p>Read the figure from top to bottom. Request 1 carries Asha's question and the tool definitions. Reply 2 is not an answer but a request to run <code>get_order_status</code> with <code>order_id</code> 101. Your code runs the function (3) and gets the order record (4). Request 5 resends the conversation, now with the assistant's tool request and a tool result, and reply 6 is an answer built from real data. The <code>ORDER_TOOL</code> definition in <code>orders.py</code> follows the rules for a good tool: a specific verb-noun name, a description that says what it does <em>and when to call it</em> (it is the model's only manual), a described argument, and <code>"strict": True</code> with <code>"additionalProperties": False</code>, which guarantees that the arguments the model writes match the schema exactly. Here is the round trip in code, message by message:</p>
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
  <p>Response 1 contains two blocks: a short text and a <code>tool_use</code> with an id, the tool's name and its arguments, already parsed into a Python dictionary (<code>{'order_id': 101}</code>, an integer because the schema said so). <code>get_order_status(**use.input)</code> unpacks those arguments into the real function. Request 2 is user, then assistant (the reply exactly as received), then user (the <code>tool_result</code> whose <code>tool_use_id</code> matches). Response 2 is grounded in the order table: the 9:05 pm comes from Biteful's data, not from a likely phrase. (The practice server decides to call the tool by a rule; a real model makes the same decision by reading the tool's description.) Because the API is stateless, request 2 must contain everything: the model does not remember asking for the tool, and links the result to its request only through the matching id.</p>
  <p>A model can also ask for several tools in one reply, for instance when Asha asks about two orders:</p>
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
  <p>One reply asked for two calls. Both results go back in <strong>one</strong> user message, with one <code>tool_result</code> per id. Sending them as two separate user messages, or forgetting one of the ids, is rejected with a 400 error. When a tool fails, for example because the order does not exist, do not crash: return the error message as the result with <code>"is_error": true</code>, so the model can apologise or ask for the right number (section 11 shows this).</p>
  <p>You can influence whether the model uses tools with <code>tool_choice</code>. The default, <code>{"type": "auto"}</code>, lets the model decide; <code>{"type": "none"}</code> forbids tool calls; and <code>disable_parallel_tool_use: true</code> limits it to one call per reply. Forcing a call with <code>{"type": "any"}</code> or naming a specific tool is rejected on current Claude models such as claude-opus-5-5, so instead use <code>auto</code>, a clear instruction and <code>strict</code>, and check that a <code>tool_use</code> block came back. Finally, remember that tool arguments are model output, and model output can be steered by injected text (<a class="xref" data-note="prompting">Prompt Engineering</a>, section 08). Your process runs the function, so you own validation, permissions and timeouts, and you must never pass tool arguments to <code>eval</code>.</p>

  <h2 id="la-struct"><span class="num">06</span>Structured Outputs</h2>
  <p>Tool arguments come back as schema-checked JSON. Biteful's ticket extractor needs its <em>answer</em> as JSON too. <a class="xref" data-note="prompting">Prompt Engineering</a> did this by asking politely, validating and retrying once, but every retry is another paid call, and a nightly job of 20,000 tickets will meet odd replies. <strong>Structured outputs</strong> move the guarantee into the API: you pass a JSON Schema, and generation is constrained so that the model can only produce tokens that keep the output valid against it. This is called <strong>constrained decoding</strong>. It is the difference between a government form with fixed boxes and a blank sheet that says "please include your name and city": the form cannot come back without a city box.</p>
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
  <p>The schema does the work. <code>"required"</code> forces all four keys to be present, <code>"enum"</code> limits <code>issue</code> to three values, <code>["string", "null"]</code> allows null when the message does not say, and <code>"additionalProperties": False</code> forbids extra keys. So <code>json.loads</code> is safe, and "20:30" can be turned straight into 1,230 minutes after midnight. (The practice server fills the schema with regular expressions; a real model fills it by reading.)</p>
  <p>Writing schemas by hand is tedious, so the SDK can build one from a <strong>Pydantic</strong> class (a Python class that describes typed data and validates it) and convert the reply back into an instance of that class:</p>
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
  <p><code>output_format=Ticket</code> makes the SDK send the class's schema and validate the reply; <code>parsed_output</code> is a <code>Ticket</code> object with attributes, not a dictionary. Keep validating even with schemas, though. A reply cut off by <code>max_tokens</code> or a refusal can still leave incomplete JSON, so check <code>stop_reason</code> first. Some schema rules, such as numeric minimums or maximum string lengths, may not be enforced during generation, and code paths that do not use a schema need the prompt-and-validate approach anyway. Use structured outputs when you need a JSON answer, and <code>strict</code> tools when you need the model to call a function; they solve different problems.</p>

  <h2 id="la-errors"><span class="num">07</span>Errors, Rate Limits and Retries</h2>
  <p>At 8:30 pm every hungry customer asks where their order is. Providers cap how many requests and tokens each account may use per minute, a <strong>rate limit</strong>, and beyond it they answer with errors. Should the assistant crash, retry immediately, or wait? It depends on the kind of failure. <strong>Transient</strong> errors are likely to succeed if the same request is sent again a little later: 429 (rate limited), 408 and 409, 500-range server errors, 529 (overloaded) and dropped connections. <strong>Permanent</strong> errors will fail forever however often you repeat them: 400 (the request is malformed), 401 (bad key), 403 (not allowed) and 404 (not found). Transient errors should be retried after a wait; permanent ones must be fixed.</p>
  <p>Think of phoning a busy restaurant. If the line is engaged, you call back in a minute, then wait a bit longer, and if a hundred people all redial at exactly the same second the line stays jammed, so it helps if each waits a slightly different time. If you dialled the wrong number, redialling never helps. The SDK already retries transient errors for you (twice by default). The practice server returns 429 with a <code>retry-after: 1</code> header (the server's hint for how many seconds to wait) to the first two requests of a named scenario:</p>
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
  <p>With <code>max_retries=3</code>, the SDK waited out two 429 responses, about a second each as <code>retry-after</code> asked, and succeeded on the third attempt, 2.3 seconds in total and invisible to the calling code. With <code>max_retries=1</code>, the second 429 surfaces as a <code>RateLimitError</code>, and your code decides what to do: queue the job, or tell the user to try again shortly. The invalid conversation (its first message is from the assistant) comes back as a 400; no retry could fix it, so it is caught and logged. The <code>except</code> clauses go from the most specific error to the most general.</p>
  <p>How long should a retry wait? The standard answer is <strong>exponential backoff with jitter</strong>. "Exponential backoff" means the maximum wait doubles after each failure (1, 2, 4, 8 seconds…, up to a cap), giving an overloaded service more and more room to recover. "Jitter" means each client picks a random wait between zero and that maximum, so that thousands of clients that failed at the same moment do not all retry at the same moment too:</p>
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
  <p>The ceiling doubles with each attempt up to the 30-second cap, and workers A and B pick different random waits under the same ceiling, so their retries do not collide. The <code>RETRYABLE</code> set is the key design decision. In practice you rarely write this loop yourself: you tune the SDK's <code>max_retries</code> and <code>timeout</code> and handle whatever error remains. Two things to avoid: retrying a 400 in a loop, which burns time and quota for nothing, and stacking your own retry loop on top of the SDK's without noticing, which turns 3 attempts into 3 × 3 = 9.</p>

  <h2 id="la-async"><span class="num">08</span>Concurrency and the Batch API</h2>
  <p>Each call is now robust, but labelling 10,000 tickets one call at a time, at a third of a second each, takes nearly an hour. Most of that time is spent waiting for the server to reply, and while one call waits the program could be sending others. Running several calls so that their waiting overlaps is called <strong>concurrency</strong>. In Python the natural tool is <a class="xref" data-note="py_asyncio">asyncio</a>, which lets one thread start many network requests and switch between them while each one waits. <code>AsyncAnthropic</code> is the SDK's async client; <code>asyncio.gather</code> runs many coroutines concurrently and returns their results in the order they were given; and an <code>asyncio.Semaphore</code>, a counter that only lets a fixed number of tasks through at a time, caps how many requests are in flight so you stay under the rate limit.</p>
  <p>Think of one waiter serving many tables. A good waiter does not stand at the kitchen door until table 1's food is ready; he takes table 2's order meanwhile. The semaphore is the number of order slips the kitchen will accept at once. Here ten tickets are extracted at three concurrency levels:</p>
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
concurrency  5: 10 tickets in 0.69s
concurrency 10: 10 tickets in 0.36s
first two results: ['{"order_id": 100, "due_time": "20:10"}', '{"order_id": 101, "due_time": "20:11"}']</div>
  <p>One at a time, ten calls of about 0.3 seconds each take 3.44 seconds. Five at a time makes two waves, about 0.7 seconds. Ten at a time is one wave, about 0.35 seconds. The results keep the input order, so <code>results[i]</code> belongs to <code>TICKETS[i]</code>. Exact timings vary from run to run, but the shape does not: total time is roughly the number of waves times the time per call. Raising concurrency beyond your rate limit just turns speed into 429 errors, which is why the semaphore and the retries from section 07 are designed together. Also make sure to use the async client inside async code; the ordinary client blocks the whole event loop while it waits.</p>
  <p>When nobody is waiting for the answers, there is a cheaper option. A provider's <strong>Batch API</strong> accepts a large file of requests, processes them in the background (usually within an hour, at most within 24 hours) and charges half price. The results come back in no particular order, each tagged with the <code>custom_id</code> you gave its request, so you match them by that id. Biteful's 2,000 nightly review summaries are a perfect batch job: $30 a day on Opus 5.5 would become $15. Use async concurrency for work someone is waiting on, and the Batch API for nightly jobs, evaluations and backfills.</p>

  <h2 id="la-cache"><span class="num">09</span>Caching</h2>
  <p>Biteful's assistant sends a 20,000-token policy manual with every question. Ten questions in five minutes pay for that manual ten times. And "What are your delivery hours?" gets a fresh, paid answer every time someone asks. There are two different caches for these two problems.</p>
  <p><strong>Prompt caching</strong> happens on the provider's side. The provider keeps the processed version of the beginning of a request (the <strong>prefix</strong>) for a few minutes, and the next request that starts with exactly the same bytes reads it at a large discount and is processed faster. The prefix is compared in a fixed order, tools first, then the system prompt, then the messages, and you mark where the cacheable part ends with <code>cache_control</code>. One changed character anywhere before that mark makes everything after it a miss. Think of a tutor who has already read chapters 1 to 10 of your notes and today only needs to read chapter 11; but if you change one word on page 1, she starts again from page 1.</p>
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
    </svg><figcaption>Call 1 writes the prefix up to the cache_control mark; call 2 reads it cheaply; one change (Δ) inside the prefix forces everything after it to be processed again.</figcaption></figure>
  <p>The figure shows the three cases. Call 1 processes the whole prefix and writes it to the cache, at a small premium. Call 2 starts with identical tools and system prompt, so that part is read from the cache, and only the new messages are processed at full price. In the third row one character in the system prompt changed, so the cache matches only up to that point. Is caching worth the premium? On claude-opus-5-5, with example prices from October 2026, input costs $4 per million tokens, writing to the five-minute cache costs 1.25 times that ($5), and reading from it costs $0.20:</p>
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
  <p>By hand: without caching, 10 × 20,200 × $4 / 1M = $0.808. With caching, one write of 20,000 tokens at $5 per million is $0.100, nine reads at $0.20 are $0.036, and the new 200-token part of each call at full price is $0.008, a total of $0.144, which is 82% less. Even two calls within the cache's lifetime already beat no caching. In code, you mark the end of the stable part:</p>
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
  <p><code>cache_control</code> on the system block means "cache everything up to here". The first call writes 1,066 tokens; the second, with a different question but a byte-identical policy, reads all 1,066 from the cache and pays full price only for its own 21 tokens. If <code>cache_read_input_tokens</code> stays at 0 on repeated calls, something early in the prefix is changing between requests: a timestamp, a user id, JSON with keys in a different order, or a different list of tools. This is the reason, explained in <a class="xref" data-note="prompting">Prompt Engineering</a>, for keeping dates and names out of the system prompt. (The practice server only simulates the bookkeeping; real minimum cacheable lengths depend on the model.) Prompt caching is also different from the KV cache in <a class="xref" data-note="llm_basics">How LLMs Work</a>, which lives inside a single generation.</p>
  <p>The second cache, a <strong>response cache</strong>, lives in your own code. If the full question is one you have answered before and the answer does not depend on who is asking, return the stored answer without calling the model at all, like a shop's printed sheet of opening hours that saves everyone phoning the owner:</p>
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
  <p>Normalising the question (lower case, punctuation removed) turns three spellings of the same question into one key, so five questions cost two paid calls. The danger is caching an answer that depends on the user: "Where is my order?" must never be served from this cache, or one customer would see another customer's order.</p>

  <h2 id="la-choose"><span class="num">10</span>Choosing a Model, and Local Models</h2>
  <p>Every cost figure so far depended on the model: $134 a day on the largest against $3.35 on the smallest. Bigger models are better and more expensive, and providers differ in features, data terms and price. "Where is my order?" and "work out a fair refund for this three-item complaint" are also very different tasks. The reliable way to choose is from your own test set, not from public leaderboards: start with the smallest, cheapest model, run your test cases (the habit from <a class="xref" data-note="prompting">Prompt Engineering</a>, section 09), move to a larger model only where it fails, and send each kind of request to the cheapest model that handles it. Sending requests to different models by type is called <strong>model routing</strong>. A support desk works the same way: new staff handle "where is my order", senior staff handle disputes, and hiring only senior staff works too, at five times the salary bill.</p>
  <table class="tbl"><caption>An honest landscape as of October 2026. Verify everything on the provider's page before deciding.</caption>
    <tr><th>Option</th><th>Strengths</th><th>Watch out for</th><th>Price shape</th></tr>
    <tr><td>Anthropic Claude: Opus 5.5, Sonnet 5.5, Haiku 5.5</td><td>Instructions, tools, long context (up to 1M tokens), structured outputs, prompt caching, Batch API</td><td>No temperature/top_p on current models; forced tool_choice rejected; thinking always on for Opus 5.5 (tune <code>effort</code>)</td><td>$4/$20, $2/$10, $0.10/$0.50 per 1M input/output tokens</td></tr>
    <tr><td>OpenAI GPT, Google Gemini</td><td>Comparable large, mid and small tiers with similar tool and JSON features</td><td>Different field names and shapes; check data terms</td><td>Per token; check their current pages</td></tr>
    <tr><td>Cloud platforms (Bedrock, Vertex AI, Foundry)</td><td>The same models inside your own cloud account, billing and compliance</td><td>New features can arrive later; model ids differ</td><td>The platform's own price list</td></tr>
    <tr><td>Open weights, self-hosted (Llama, Qwen, Mistral, Gemma, DeepSeek)</td><td>Data never leaves; fine-tuning; no per-token bill</td><td>GPUs cost money even when idle; you run serving and safety; weaker on hard tasks</td><td>GPU hours plus engineers</td></tr>
  </table>
  <p>Routing can save a great deal. Suppose a test set shows that most "where is my order" questions are handled perfectly well by the small model:</p>
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
  <p>If 95% of these questions go to Haiku 5.5 and only the hard 5% to Opus 5.5, the job's daily cost falls from $72 to $5.31. The router itself can be a simple rule ("has an order number and no complaint words") or a cheap classification call. Whenever you switch or add a model, re-run the test set first, and treat prices and model names as values that will change within months.</p>
  <p>Sometimes data must not leave Biteful's own servers at all, or the system must work without internet access. Then the option is <strong>local inference</strong>: running an open-weight model on hardware you control. Tools such as <strong>Ollama</strong> and <strong>llama.cpp</strong> run quantised models on a laptop or a single GPU (a 4-bit 3–8B model needs about 2–4 GB for its weights), and <strong>vLLM</strong> serves them at high throughput on GPU servers. Most of these expose an <strong>OpenAI-compatible API</strong>, the widely copied <code>/v1/chat/completions</code> shape, so switching to them is mostly a matter of changing a base URL and a model name. It is like cooking at home instead of ordering in: the kitchen and the groceries are yours and nothing leaves the house, but you do the cooking and the washing up. No local model could be downloaded where these notes were built, so the request below went to the practice server's OpenAI-style endpoint; with Ollama installed, only <code>BASE</code> and <code>model</code> would change:</p>
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
  <p>The question is the same but the envelope is different. The system prompt is a message with role <code>system</code> rather than a separate field, the answer is under <code>choices[0].message.content</code> rather than in content blocks, the stop reason is called <code>finish_reason</code>, and usage is reported as <code>prompt_tokens</code> and <code>completion_tokens</code>. The practical lesson is to write one thin adapter function per provider shape and keep the rest of your code provider-neutral. Before relying on a small local model, test it on your task, remember that its context window is usually much smaller, and never expose a local model server to the network without authentication.</p>

  <h2 id="la-build"><span class="num">11</span>An Assistant With Two Tools</h2>
  <p>Asha now asks "How late will it be?". Answering needs the order's ETA, which is a database lookup, and exact time arithmetic from 8:30 pm to 9:05 pm, which <a class="xref" data-note="llm_basics">How LLMs Work</a> showed models do poorly. The program below puts together everything on this page. It has two tools: <code>get_order_status</code> from <code>orders.py</code>, and a <code>calculator</code> that evaluates arithmetic by parsing it with Python's <code>ast</code> module (which turns code text into a tree you can inspect) instead of calling <code>eval</code>, because its input is model output and could be steered by injected text. The tool loop from section 05 runs with a limit on the number of steps. Save it as <code>assistant.py</code>:</p>
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
  <p><code>REGISTRY</code> maps the tool name the model writes to the Python function to run, so adding a tool means writing a function, a schema and one registry entry. <code>run_tool</code> wraps every call in <code>try</code>/<code>except</code>, so a bad order id becomes a <code>tool_result</code> with <code>is_error: True</code> that the model can respond to, instead of a crash. <code>ask</code> is the loop: call the model, check <code>stop_reason</code>, append the assistant turn whole, run every requested tool, append all the results in one user message, and repeat; <code>max_steps</code> stops a confused model from looping forever and running up a bill. And <code>_eval</code> accepts only numbers and the four arithmetic operators; anything else raises an error. Here is the loop running against the practice server:</p>
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
  <p>The first question took three calls: the order lookup, then the calculator with (21 × 60 + 5) − (20 × 60 + 30) = 1,265 − 1,230 = 35, then a final answer that combines both, with the ETA taken from the data and the arithmetic done exactly by code. The second question asked about order 999, which does not exist; the tool raised an error, <code>run_tool</code> returned it as an error result, and the reply asks Asha to check the number instead of crashing. (The practice server chooses tools by rule; with a real model the steps are usually the same and the wording varies.) Because tool functions are ordinary Python, they can be tested like any other function, with no model at all:</p>
  <div class="fx" data-lang="py">from types import SimpleNamespace as NS
from assistant import calculator, run_tool

print(calculator("(21 * 60 + 5) - (20 * 60 + 30)"))
print(run_tool(NS(id="t1", name="get_order_status", input={"order_id": 999})))
print(run_tool(NS(id="t2", name="calculator", input={"expression": "__import__('os').getcwd()"})))</div>
  <div class="fx" data-lang="text">35
{'type': 'tool_result', 'tool_use_id': 't1', 'content': 'Error: No order 999. Known orders: [101, 102]', 'is_error': True}
{'type': 'tool_result', 'tool_use_id': 't2', 'content': 'Error: Only numbers and + - * / are allowed', 'is_error': True}</div>
  <p>The calculator gives 35, and both error results are exactly what the model would receive: a useful message, flagged as an error, with the matching id. The injected <code>__import__('os')</code> is rejected rather than executed. Tests like these, plus a mock server for the loop, belong in continuous integration, so they run on every change without spending money. This <code>while stop_reason == "tool_use"</code> loop is the core of every agent. <a class="xref" data-note="agentic">Agent Fundamentals</a> grows it with planning and memory, <a class="xref" data-note="rag">RAG</a> adds a retrieval tool, and <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a> puts it behind <a class="xref" data-note="api_fastapi">FastAPI</a> with guardrails. SDKs also offer a "tool runner" helper that writes this loop for you, which is worth using once you understand what it does.</p>

  <h2 id="la-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common bug in tool loops is appending only the text of a reply to the history. The assistant turn must be the whole <code>response.content</code> list; if the <code>tool_use</code> or <code>thinking</code> blocks are dropped, the next call cannot match the tool result to its request and fails. Close behind it is sending tool results in separate messages: all <code>tool_result</code> blocks answering one assistant turn go in a single user message, one per id, or the request is rejected with a 400.</p>
  <p>Ignoring <code>stop_reason</code> causes silent errors. A <code>max_tokens</code> stop means the output was cut off, so parsing it as JSON or running a half-written tool call will fail in confusing ways; a <code>refusal</code> means there is no normal answer to parse. Branch on the stop reason before using a reply. Relatedly, relying on prompt-only JSON in a pipeline means occasional broken replies; use structured outputs and still validate, and remember that prefilling the assistant's reply is rejected on current Claude models, as is forcing <code>tool_choice</code> to <code>any</code> or a named tool.</p>
  <p>With errors, the classic mistake is retrying everything. Retry 429 and 500-range errors with backoff and jitter, but never a 400, which will fail forever, and do not wrap your own retry loop around the SDK's without realising the attempts multiply. With concurrency, the mistake is <code>asyncio.gather</code> over thousands of tasks with no semaphore, which turns a rate limit into a storm of 429 errors.</p>
  <p>With caching, the mistake is a cache that never hits because something early in the prefix (a timestamp, a user id, unsorted JSON) changes on every call; check that <code>cache_read_input_tokens</code> is above zero on the second call. With tools, the dangerous mistake is passing tool arguments to <code>eval</code> or running them with broad permissions; they are model output and can be steered by injected text, so whitelist what is allowed, validate inputs and limit permissions. Finally, testing against the paid API is slow, costly and non-deterministic; unit-test the tool functions and run the loop against a mock server or a scripted fake client.</p>

  <h2 id="la-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Request and response</h3>
  <table class="tbl">
    <tr><th>Field</th><th>In/out</th><th>Meaning</th></tr>
    <tr><td><code>model</code></td><td>in</td><td>exact model id, e.g. <code>claude-haiku-5-5</code></td></tr>
    <tr><td><code>max_tokens</code></td><td>in</td><td>required ceiling on output tokens</td></tr>
    <tr><td><code>system</code></td><td>in</td><td>standing instructions (top-level field)</td></tr>
    <tr><td><code>messages</code></td><td>in</td><td>alternating user/assistant turns, first is user; resent every call</td></tr>
    <tr><td><code>tools</code>, <code>output_config</code>, <code>stream</code>, <code>stop_sequences</code></td><td>in</td><td>tools, JSON schema / effort, streaming, stop strings</td></tr>
    <tr><td><code>content</code></td><td>out</td><td>list of blocks: text, tool_use, thinking</td></tr>
    <tr><td><code>stop_reason</code></td><td>out</td><td>end_turn, max_tokens, tool_use, stop_sequence, pause_turn, refusal</td></tr>
    <tr><td><code>usage</code></td><td>out</td><td>input/output tokens; cache write/read tokens</td></tr>
  </table>
  <h3>The tool loop</h3>
  <div class="fx" data-lang="py">messages = [{"role": "user", "content": question}]
while True:
    r = client.messages.create(model=MODEL, max_tokens=1024, tools=TOOLS, messages=messages)
    if r.stop_reason != "tool_use":
        break                                              # answer (or max_tokens / refusal)
    messages.append({"role": "assistant", "content": r.content})          # whole block list
    messages.append({"role": "user", "content": [run_tool(b) for b in r.content
                                                 if b.type == "tool_use"]})  # ONE message</div>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>Cost per call</td><td>input tokens × input price + output tokens × output price</td></tr>
    <tr><td>Input of chat turn t</td><td>system + (t − 1) × (question + answer) + question</td></tr>
    <tr><td>Backoff wait before retry n</td><td>random(0, min(cap, base × 2<sup>n</sup>))</td></tr>
    <tr><td>Concurrent time</td><td>≈ ⌈calls ÷ concurrency⌉ × time per call</td></tr>
    <tr><td>Cached input cost</td><td>prefix × 1.25p + (k − 1) × prefix × read price + k × new × p</td></tr>
  </table>
  <h3>Key terms</h3>
  <ul>
    <li><b>Stateless API</b>: no memory between calls; the request carries the whole conversation.</li>
    <li><b>Streaming / SSE</b>: reply sent as events (message_start, deltas, message_stop); faster first words, same total.</li>
    <li><b>Tool calling</b>: model writes tool_use (id, name, input); your code runs it and returns tool_result (same id).</li>
    <li><b>Structured outputs</b>: JSON Schema enforced by constrained decoding; <code>messages.parse</code> with a Pydantic class.</li>
    <li><b>Transient vs permanent errors</b>: retry 408/409/429/5xx/529; fix 400/401/403/404.</li>
    <li><b>Batch API</b>: half price, up to 24 h, results matched by <code>custom_id</code>.</li>
    <li><b>Prompt caching</b>: exact-prefix reuse (tools → system → messages) across calls; <b>response cache</b>: your stored answers to user-independent questions.</li>
    <li><b>Model routing</b>: each request type to the cheapest model that passes the test set.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Append <code>response.content</code> whole; all tool results in one user message.</li>
    <li>Check <code>stop_reason</code> before parsing.</li>
    <li>Tool schemas and resent history are paid input on every call.</li>
    <li>No prefill and no forced tool_choice on current Claude models.</li>
    <li>Never retry a 400; don't stack retry loops.</li>
    <li>gather needs a semaphore; batch results are unordered.</li>
    <li>Anything that changes before the cache mark kills the cache.</li>
    <li>Never <code>eval</code> tool input.</li>
  </ul>

  <h2 id="la-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does a chat-model API request contain, and what comes back?</summary><div class="qa-body">The request names the model, a required max_tokens ceiling, an optional system prompt and the messages list, plus optional tools, output schema and streaming flags. The response is an assistant message: a list of content blocks (text, tool_use, thinking), a stop_reason saying why generation ended, and usage with the token counts you are billed for.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The API is stateless. How does a chatbot remember the conversation, and what does that cost?</summary><div class="qa-body">The application resends the whole conversation in messages on every call, so the model sees it again each time. Input tokens, cost and latency therefore grow with every turn. Mitigations are trimming or summarising old turns and prompt caching of the stable prefix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is response.content a list instead of a string?</summary><div class="qa-body">A single reply can contain several blocks of different types: text, thinking and one or more tool_use requests. Code should loop over the blocks and check each block's type, and should send the whole list back as the assistant turn so nothing the next call needs is lost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your JSON pipeline fails only on long inputs. What do you check first?</summary><div class="qa-body">The stop_reason. If it is max_tokens, the reply was cut off mid-JSON. Raise the ceiling or ask for less, use structured outputs, and always check stop_reason and validate before parsing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you estimate the daily cost of an LLM feature?</summary><div class="qa-body">For each job, measure real input and output token counts (including system prompt, history and tool schemas), multiply by the per-token prices, and multiply by calls per day; then sum the jobs. Remember that output is priced several times higher, that tool loops make multiple calls, and that thinking tokens are billed as output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does streaming reduce cost or total latency?</summary><div class="qa-body">No. The same tokens are generated and billed and the reply finishes at the same time. Streaming only reduces the time until the first words appear, which makes chat interfaces feel responsive. Code that parses the result should use the final assembled message.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through one tool call, naming every message.</summary><div class="qa-body">First, a user message is sent with the tool definitions. The reply is an assistant message containing a tool_use block (id, name, input) with stop_reason tool_use. Your code runs the function. The next request contains the history, that assistant turn unchanged, and a user message with a tool_result carrying the same tool_use_id. The model then answers or requests another tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does the model execute the tool? Who is responsible for safety?</summary><div class="qa-body">No. The model only writes a structured request; your code executes it. So your code owns validation, permissions, timeouts and approval for risky actions, and must treat the arguments as untrusted, since injected text can steer them. Never pass them to eval.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The model requested two tools in one reply. How do you send the results back?</summary><div class="qa-body">In a single user message containing two tool_result blocks, each with the tool_use_id of the call it answers. Splitting them across messages or missing an id causes a 400 error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your tool raised an exception. What should the model receive?</summary><div class="qa-body">A tool_result with the same id, is_error set to true, and a useful message such as "No order 999. Known orders: 101, 102". The model can then ask the user for the right value or retry with corrected arguments; crashing would lose the conversation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are structured outputs, and why validate anyway?</summary><div class="qa-body">You pass a JSON Schema and the API constrains generation so the output matches it, guaranteeing parseable JSON with the required keys and types. You still validate because a max_tokens stop or a refusal can leave incomplete output, some constraints may not be enforced during generation, and other code paths may not use a schema.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which API errors do you retry, and how?</summary><div class="qa-body">Transient ones: 408, 409, 429, 500-range, 529 and connection errors, using exponential backoff with jitter and honouring retry-after. Never retry 400, 401, 403 or 404; fix the request or credentials. SDKs retry transient errors by default, so tune them rather than stacking another loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why add jitter to exponential backoff?</summary><div class="qa-body">Without jitter, many clients that failed at the same moment all retry at the same moments, creating synchronised waves that keep the service overloaded. Picking a random wait below the exponential ceiling spreads the retries out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you process 10,000 requests quickly without breaking the rate limit?</summary><div class="qa-body">Use the async client with asyncio.gather and an asyncio.Semaphore that caps requests in flight below the limit, plus retries with backoff for any 429s. If nobody needs the results immediately, use the provider's Batch API instead: half price, results within 24 hours, matched by custom_id.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does prompt caching work, and why might it never hit?</summary><div class="qa-body">The provider stores the processed prefix of a request (in the order tools, system, messages, up to a cache_control mark) for a few minutes; later requests with an identical prefix read it at a large discount. It misses if anything before the mark changes between calls, such as a timestamp, user id, reordered JSON or a different tool list, if the prefix is below the minimum length, or if calls are further apart than the cache lifetime.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is it safe to cache full responses yourself?</summary><div class="qa-body">Only for questions whose answer does not depend on the user or on changing data, such as delivery hours or service areas. Normalise the question to increase hits. Never cache user-specific answers like order status, or one user may see another's data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you choose a model for a new feature?</summary><div class="qa-body">Build a test set of realistic cases, start with the smallest, cheapest model, and move up only where it fails the quality bar. Route each request type to the cheapest model that passes, and re-run the test set whenever you change models or prompts. Consider data terms, features, latency and price, not just leaderboards.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does calling a local model differ from calling a hosted API?</summary><div class="qa-body">Tools like Ollama, llama.cpp and vLLM usually expose an OpenAI-compatible chat-completions endpoint, so you change the base URL and model name, and adapt to its shape (choices[0].message.content, finish_reason, prompt_tokens). You gain data control and no per-token bill, but you run the hardware and serving, and small local models are usually weaker and have shorter context windows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you test a tool-calling assistant in CI without a paid API?</summary><div class="qa-body">Unit-test the tool functions directly, including their error cases. Run the loop against a local mock server or a scripted fake client, and assert on what your code sent: the assistant turn kept whole, matching ids, all results in one message, and the step limit respected.</div></details>
</main>
`
});
