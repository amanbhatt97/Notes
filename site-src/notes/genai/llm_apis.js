// notes/genai/llm_apis.js — LLM APIs & Tool Calling
Object.assign(TOPIC_CONTENT, {
  "llm_apis": `<main>
  <h1>LLM APIs &amp; Tool Calling</h1>
  <p class="lead">You know how an LLM generates tokens (03) and how to write a good prompt (04). This note is the plumbing: the exact request and response shapes, and how a model "uses a tool" when it can only emit text. Every later note (RAG, agents, LangChain, MCP) is built on these mechanics.</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="la-msg"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Messages API</span><span class="rm-sub">Roles, blocks, stateless history</span></div></div>
      <div class="rm-item rm-done" data-target="la-stop"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">max_tokens &amp; stop_reason</span><span class="rm-sub">Why the model stopped</span></div></div>
      <div class="rm-item rm-done" data-target="la-stream"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Streaming</span><span class="rm-sub">Tokens as they're generated</span></div></div>
      <div class="rm-item rm-done" data-target="la-struct"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Structured Outputs</span><span class="rm-sub">JSON that always parses</span></div></div>
      <div class="rm-item rm-done" data-target="la-tools"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Tool Calling</span><span class="rm-sub">schema → tool_use → tool_result</span></div></div>
      <div class="rm-item rm-done" data-target="la-cache"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Prompt Caching</span><span class="rm-sub">Pay once for a long prefix</span></div></div>
      <div class="rm-item rm-done" data-target="la-scale"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Batches, Limits &amp; Retries</span><span class="rm-sub">Cheap bulk, robust calls</span></div></div>
      <div class="rm-item rm-done" data-target="la-build"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">Weather + calculator assistant</span></div></div>
      <div class="rm-item rm-done" data-target="la-rev"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="la-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="la-msg"><span class="num">01</span>The Messages API</h2>
  <p>One HTTP endpoint does almost everything: send a list of messages, get back the next assistant message. Code here uses the official Anthropic Python SDK (<code>pip install anthropic</code>). OpenAI, Gemini and others follow the same pattern with different field names.</p>
  <div class="fx" data-lang="py">import anthropic

client = anthropic.Anthropic()        # reads ANTHROPIC_API_KEY from the environment

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,                                  # hard cap on generated tokens
    system="You are a concise tutor for data-science interviews.",
    messages=[{"role": "user", "content": "Explain overfitting in one sentence."}],
)

for block in response.content:        # a LIST of blocks, not one string
    if block.type == "text":
        print(block.text)
print(response.stop_reason, response.usage.input_tokens, response.usage.output_tokens)</div>
  <table class="tbl">
    <tr><th>Field</th><th>What it is</th></tr>
    <tr><td><code>model</code></td><td>Which model answers. Pin an exact id.</td></tr>
    <tr><td><code>max_tokens</code></td><td>Required. Upper limit on tokens generated in this reply.</td></tr>
    <tr><td><code>system</code></td><td>Top-level instructions: role, rules, format (how to write them: 04). Not a message in the list.</td></tr>
    <tr><td><code>messages</code></td><td>Alternating <code>user</code> / <code>assistant</code> turns. The first must be <code>user</code>.</td></tr>
    <tr><td><code>content</code></td><td>A string, or a list of <strong>content blocks</strong>: <code>text</code>, <code>image</code>, <code>tool_use</code>, <code>tool_result</code>…</td></tr>
  </table>
  <p>The response is a <code>Message</code> whose <code>content</code> is also a list of blocks. Always loop and check <code>block.type</code>. A reply can mix <code>thinking</code>, <code>text</code> and <code>tool_use</code> blocks.</p>

  <h3>Stateless: you own the history</h3>
  <div class="callout def"><span class="label">Definition</span><p><strong>Stateless API</strong>: the server keeps no memory between calls. Every request must carry the whole conversation so far.</p></div>
  <div class="fx" data-lang="py">messages = [{"role": "user", "content": "My name is Asha."}]
r1 = client.messages.create(model="claude-opus-5-5", max_tokens=512, messages=messages)

messages.append({"role": "assistant", "content": r1.content})    # keep the reply
messages.append({"role": "user", "content": "What is my name?"})
r2 = client.messages.create(model="claude-opus-5-5", max_tokens=512, messages=messages)
# r2 knows "Asha" only because turn 1 was sent again</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A call centre where a different agent picks up every time. They know nothing unless you hand over the full case file. Longer file = more reading = more cost and latency.</p></div>
  <div class="callout intu"><span class="label">Consequence</span><p>Input tokens grow every turn, because turn 10 resends turns 1–9. That's why prompt caching (section 06) and trimming history matter. "Memory" in chat apps and agents is just your code choosing what to resend (memory types are covered in 08).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Appending only the reply's text instead of <code>response.content</code>. With tools or thinking, the full block list must go back unchanged, or the next call fails or loses context.</p></div>

  <h2 id="la-stop"><span class="num">02</span>max_tokens &amp; stop_reason</h2>
  <p><code>max_tokens</code> is a ceiling, not a target. The model stops early when it's done. <code>stop_reason</code> tells you which case happened, and your code must branch on it.</p>
  <table class="tbl">
    <tr><th>stop_reason</th><th>Meaning</th><th>Your code should</th></tr>
    <tr><td><code>end_turn</code></td><td>Finished naturally</td><td>Use the answer</td></tr>
    <tr><td><code>max_tokens</code></td><td>Hit your cap mid-answer</td><td>Treat as truncated: raise the cap or ask for less. Never run a half-written tool call</td></tr>
    <tr><td><code>tool_use</code></td><td>Wants you to run a tool</td><td>Run it, send <code>tool_result</code>, call again</td></tr>
    <tr><td><code>stop_sequence</code></td><td>Hit one of your <code>stop_sequences</code></td><td>Use the text up to it</td></tr>
    <tr><td><code>pause_turn</code></td><td>A server-side tool loop paused</td><td>Resend the conversation to continue</td></tr>
    <tr><td><code>refusal</code></td><td>Declined for safety reasons</td><td>Don't parse as normal output; see <code>stop_details</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Assuming JSON output is complete. If <code>stop_reason == "max_tokens"</code>, the JSON is cut off, even with structured outputs.</p></div>
  <h3>Thinking and effort</h3>
  <p>Reasoning models (03) think before answering. On <code>claude-opus-5-5</code> thinking is always on and adaptive. You control depth with <code>output_config={"effort": "low"}</code> (low, medium = default, high, xhigh, max), never <code>budget_tokens</code>. Thinking tokens count toward <code>max_tokens</code> and are billed as output.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Old tutorials prefill the assistant turn (start the reply with <code>{</code>) to force JSON. Current models reject prefill. Use structured outputs (section 04) instead.</p></div>

  <h2 id="la-stream"><span class="num">03</span>Streaming</h2>
  <p>Without streaming, the user stares at a spinner until the whole reply exists. With streaming, the server sends events as tokens are generated.</p>
  <div class="fx" data-lang="py">with client.messages.stream(
    model="claude-opus-5-5",
    max_tokens=4096,
    messages=[{"role": "user", "content": "Write a haiku about gradient descent."}],
) as stream:
    for text in stream.text_stream:          # text deltas as they arrive
        print(text, end="", flush=True)
    final = stream.get_final_message()       # full Message object at the end

print("\\n", final.stop_reason, final.usage.output_tokens)</div>
  <div class="flow"><span>message_start</span><span>content_block_start</span><span>content_block_delta × N</span><span>content_block_stop</span><span>message_delta (stop_reason, usage)</span><span>message_stop</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>Live subtitles vs. a transcript emailed after the show. Same words, same total time, but you start reading at once.</p></div>
  <ul>
    <li><strong>Improves time-to-first-token</strong> (TTFT), not total time or cost.</li>
    <li>Use it for any chat UI, and for long outputs: the SDK refuses a non-streaming call it expects to run longer than about 10 minutes.</li>
    <li>Tool calls stream too: tool input arrives as <code>input_json_delta</code> fragments. Act only on the finished block from <code>get_final_message()</code>.</li>
  </ul>

  <h2 id="la-struct"><span class="num">04</span>Structured Outputs</h2>
  <p>Asking for JSON in the prompt (04) works most of the time. "Most" breaks pipelines: a stray sentence or missing brace crashes <code>json.loads</code>. <strong>Structured outputs</strong> constrain decoding to a JSON Schema, so the result always parses and matches.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A paper form with fixed boxes vs. a blank page with "please include your name and city". The form can't come back without a city box.</p></div>
  <div class="fx" data-lang="py">import json

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Extract: Ben from Delhi ordered 2 Phones."}],
    output_config={"format": {"type": "json_schema", "schema": {
        "type": "object",
        "properties": {"name": {"type": "string"}, "quantity": {"type": "integer"}},
        "required": ["name", "quantity"],
        "additionalProperties": False,
    }}},
)
data = json.loads(next(b.text for b in response.content if b.type == "text"))</div>
  <p>With Pydantic, the SDK builds the schema and validates the reply for you:</p>
  <div class="fx" data-lang="py">from pydantic import BaseModel

class Order(BaseModel):
    name: str
    city: str
    quantity: int
    callback: bool

response = client.messages.parse(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content":
               "Extract: Ben from Delhi ordered 2 Phones and wants a callback."}],
    output_format=Order,       # parse() helper turns this into output_config.format
)
order = response.parsed_output     # a validated Order instance
print(order.quantity + 1)</div>
  <table class="tbl">
    <tr><th>Approach</th><th>Guarantee</th><th>Use when</th></tr>
    <tr><td>"Reply in JSON" in the prompt</td><td>None; usually right</td><td>Quick prototypes</td></tr>
    <tr><td><code>output_config.format</code> / <code>messages.parse</code></td><td>Valid JSON matching the schema</td><td>Extraction, classification, any reply parsed by code</td></tr>
    <tr><td><code>strict: true</code> on a tool</td><td>Tool <em>arguments</em> match the schema</td><td>Tool calling (section 05)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Every object needs <code>"additionalProperties": false</code>. Numeric and length limits (<code>minimum</code>, <code>maxLength</code>) aren't enforced by the API; the SDK strips them and checks them after. A <code>refusal</code> or <code>max_tokens</code> stop can still break the schema.</p></div>

  <h2 id="la-tools"><span class="num">05</span>Tool Calling</h2>
  <div class="callout def"><span class="label">Definition</span><p><strong>Tool calling</strong> (function calling): you describe functions with a name, a description and a JSON Schema. The model replies with a structured request to call one. <strong>Your code</strong> runs it and sends back the result.</p></div>
  <p>Without tools, a model can't know today's weather, query your database or do exact arithmetic. It only predicts text. Tool calling turns "predict text" into "decide which action to take". That is the seed of every agent (08–09).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A head chef who never leaves the pass. They write order tickets ("2 × fries, table 4"); the kitchen staff do the actual work and send the plates back. The model writes tickets; your code is the kitchen.</p></div>
  <div class="flow"><span>Define tools (schema)</span><span>Model replies tool_use</span><span>Your code runs the function</span><span>Send tool_result</span><span>Model answers (or calls again)</span></div>

  <h3>One round trip, exact shapes</h3>
  <p><strong>Request 1</strong>: the user question plus tool definitions.</p>
  <div class="fx" data-lang="js">POST /v1/messages
{
  "model": "claude-opus-5-5",
  "max_tokens": 1024,
  "tools": [{
    "name": "get_weather",
    "description": "Get the current weather for a city. Call this whenever the user asks about weather.",
    "input_schema": {
      "type": "object",
      "properties": {
        "city": {"type": "string", "description": "City name, e.g. Mumbai"},
        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
      },
      "required": ["city", "unit"],
      "additionalProperties": false
    },
    "strict": true
  }],
  "messages": [
    {"role": "user", "content": "Is it raining in Mumbai?"}
  ]
}</div>
  <p><strong>Response 1</strong>: the model asks for a tool. <code>input</code> is already a parsed object.</p>
  <div class="fx" data-lang="js">{
  "id": "msg_01...",
  "type": "message",
  "role": "assistant",
  "model": "claude-opus-5-5",
  "content": [
    {"type": "text", "text": "Let me check the weather in Mumbai."},
    {"type": "tool_use", "id": "toolu_01A...", "name": "get_weather",
     "input": {"city": "Mumbai", "unit": "celsius"}}
  ],
  "stop_reason": "tool_use",
  "usage": {"input_tokens": 640, "output_tokens": 75}
}</div>
  <p><strong>Request 2</strong>: resend everything, plus the assistant turn exactly as received, plus a <code>user</code> turn holding the <code>tool_result</code>. The <code>tool_use_id</code> must match the <code>id</code>.</p>
  <div class="fx" data-lang="js">{
  "model": "claude-opus-5-5",
  "max_tokens": 1024,
  "tools": [ ...same tools, same order... ],
  "messages": [
    {"role": "user", "content": "Is it raining in Mumbai?"},
    {"role": "assistant", "content": [
      {"type": "text", "text": "Let me check the weather in Mumbai."},
      {"type": "tool_use", "id": "toolu_01A...", "name": "get_weather",
       "input": {"city": "Mumbai", "unit": "celsius"}}
    ]},
    {"role": "user", "content": [
      {"type": "tool_result", "tool_use_id": "toolu_01A...",
       "content": "{\\"city\\": \\"Mumbai\\", \\"temp\\": 31, \\"unit\\": \\"celsius\\", \\"condition\\": \\"humid, light rain\\"}"}
    ]}
  ]
}</div>
  <p><strong>Response 2</strong>: no more tools needed, so it answers.</p>
  <div class="fx" data-lang="js">{
  "role": "assistant",
  "content": [
    {"type": "text", "text": "Yes, light rain in Mumbai right now, 31 °C and humid."}
  ],
  "stop_reason": "end_turn",
  "usage": {"input_tokens": 760, "output_tokens": 20}
}</div>
  <p>IDs and token counts above are illustrative. On <code>claude-opus-5-5</code> the assistant content may also start with a <code>thinking</code> block; it goes back unchanged with the rest.</p>

  <h3>Writing good tool definitions</h3>
  <ul>
    <li><strong>Name</strong>: specific verb_noun, e.g. <code>get_weather</code>, not <code>weather</code>.</li>
    <li><strong>Description</strong>: the model's only manual. Say what it does <em>and when to call it</em> ("Call this whenever the user asks about weather").</li>
    <li><strong>Schema</strong>: describe each property; use <code>enum</code> for fixed choices; list truly required fields.</li>
    <li><strong><code>strict: true</code></strong> (with <code>additionalProperties: false</code>): arguments are guaranteed to match the schema.</li>
  </ul>

  <h3>Parallel calls and errors</h3>
  <p>One reply can contain several <code>tool_use</code> blocks ("weather in Mumbai <em>and</em> Delhi"). Run them all, then send <strong>all</strong> results in <strong>one</strong> user message. If a tool fails, don't crash: return the error text with <code>is_error: true</code> so the model can fix its call or explain. <code>run_tool</code> in section 08 shows both.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Sending each <code>tool_result</code> as a separate user message, or dropping one. Every <code>tool_use</code> id must be answered in the very next user turn. A mismatch gives a 400 error.</p></div>

  <h3>tool_choice</h3>
  <table class="tbl">
    <tr><th>Value</th><th>Behaviour</th></tr>
    <tr><td><code>{"type": "auto"}</code> (default)</td><td>Model decides whether to call a tool</td></tr>
    <tr><td><code>{"type": "none"}</code></td><td>No tool calls allowed</td></tr>
    <tr><td><code>{"type": "any"}</code> / <code>{"type": "tool", "name": …}</code></td><td>Force a call. <strong>Rejected (400) on claude-opus-5-5</strong>; works on some older models</td></tr>
    <tr><td><code>"disable_parallel_tool_use": true</code></td><td>At most one tool call per reply</td></tr>
  </table>
  <div class="callout intu"><span class="label">On current models</span><p>To make a call very likely: keep <code>auto</code>, say "Use the get_weather tool" in the prompt, set <code>strict: true</code>, and check that a <code>tool_use</code> block actually came back. If you only wanted JSON, use structured outputs instead of a fake tool.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"The model ran my function." It didn't. It only wrote JSON. Your process executes the code, so you own validation, permissions and timeouts (deep dive in 14).</p></div>

  <h2 id="la-cache"><span class="num">06</span>Prompt Caching</h2>
  <p>Agents and RAG resend the same long prefix (tools, system prompt, documents) on every call. <strong>Prompt caching</strong> stores the processed prefix server-side, so later calls that start with the same bytes are cheaper and faster.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A tutor who has read chapters 1–10 only needs to read chapter 11 today. But change one word on page 1 and they re-read everything from that page on.</p></div>
  <div class="fx" data-lang="py">response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    tools=TOOLS,                                  # rendered 1st
    system=[{"type": "text", "text": LONG_POLICY_DOC,   # rendered 2nd
             "cache_control": {"type": "ephemeral"}}],  # breakpoint: cache tools + system
    messages=messages,                            # rendered 3rd: changes every turn
)
u = response.usage
print(u.cache_creation_input_tokens,   # written to cache this call (about 1.25x price)
      u.cache_read_input_tokens,       # served from cache (a small fraction of price)
      u.input_tokens)                  # uncached remainder (full price)

# Simplest option for chats: top-level automatic caching of the growing prefix
client.messages.create(model="claude-opus-5-5", max_tokens=1024,
                       cache_control={"type": "ephemeral"},
                       system=SYSTEM, messages=messages)</div>
  <ul>
    <li><strong>Prefix match</strong>: render order is <code>tools → system → messages</code>. Any byte change invalidates everything after it.</li>
    <li><strong>Price</strong>: writes cost about 1.25× normal input (5-minute TTL) or 2× (1-hour). Reads cost about 0.1× (0.05× on claude-opus-5-5). Two calls within 5 minutes already pay off.</li>
    <li><strong>Limits</strong>: up to 4 breakpoints; a minimum prefix length (512 tokens on the newest models); shorter prefixes silently don't cache.</li>
    <li>A cache read refreshes the 5-minute timer.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: silent invalidators</span><p><code>datetime.now()</code> or a user id in the system prompt, <code>json.dumps</code> without <code>sort_keys</code>, a tool list that varies per user. Requests still succeed; the bill just grows. Check <code>cache_read_input_tokens &gt; 0</code> on the second call.</p></div>

  <h2 id="la-scale"><span class="num">07</span>Batches, Limits &amp; Retries</h2>
  <h3>Message Batches: bulk at half price</h3>
  <p>For work nobody is waiting on (labelling 50k reviews, nightly evals), send requests as a batch. Each request costs 50% less; results come back asynchronously, usually within an hour and at most 24 hours.</p>
  <div class="fx" data-lang="py">import time

reviews = ["Battery died in a day.", "Love the screen!", "Okay for the price."]

batch = client.messages.batches.create(requests=[
    {"custom_id": f"review-{i}",
     "params": {"model": "claude-opus-5-5", "max_tokens": 256,
                "messages": [{"role": "user", "content":
                              f"Sentiment (positive/negative/neutral), one word: {r}"}]}}
    for i, r in enumerate(reviews)
])

while client.messages.batches.retrieve(batch.id).processing_status != "ended":
    time.sleep(60)                           # minutes to hours, not seconds

for entry in client.messages.batches.results(batch.id):   # any order!
    if entry.result.type == "succeeded":
        msg = entry.result.message
        print(entry.custom_id, next(b.text for b in msg.content if b.type == "text"))
    else:                                    # errored / canceled / expired
        print(entry.custom_id, "failed:", entry.result.type)</div>
  <div class="callout trap"><span class="label">Trap</span><p>Results aren't returned in request order. Match them by <code>custom_id</code>.</p></div>

  <h3>Rate limits and retries</h3>
  <p>Providers cap requests per minute and input/output tokens per minute. Exceed them and you get <strong>429</strong>. Overload or server bugs give <strong>5xx</strong> (529 = overloaded).</p>
  <ul>
    <li>The SDK already retries connection errors, 408, 409, 429 and 5xx with exponential backoff (default 2 retries). Tune <code>max_retries</code> and <code>timeout</code>.</li>
    <li>Retry only transient errors. A 400 means your request is wrong; retrying just repeats the failure.</li>
    <li>Respect the <code>retry-after</code> header. Add jitter (randomness) so many workers don't retry in lockstep.</li>
    <li>Under sustained load, cap concurrency with a queue; log <code>response._request_id</code> for support tickets.</li>
  </ul>
  <div class="fx" data-lang="py">client = anthropic.Anthropic(max_retries=4, timeout=60.0)   # SDK default: 2 retries

try:
    response = client.messages.create(model="claude-opus-5-5", max_tokens=1024,
                                      messages=messages)
except anthropic.RateLimitError as e:      # 429 even after retries
    wait = int(e.response.headers.get("retry-after", "60"))
except anthropic.BadRequestError as e:     # 400: fix the request, never retry
    raise
except anthropic.APIStatusError as e:      # other HTTP errors, e.g. 5xx
    print(e.status_code, e.response.headers.get("request-id"))</div>

  <h3>Token counting and cost</h3>
  <div class="fx" data-lang="py">count = client.messages.count_tokens(
    model="claude-opus-5-5",
    system=SYSTEM,
    tools=TOOLS,                  # tool schemas cost input tokens too
    messages=messages,
)
print(count.input_tokens)         # free to call; use it to trim history before sending</div>
  <div class="callout pred"><span class="label">Predict</span><p>A request has 2,000 input and 500 output tokens on a model priced at $4 / $20 per million tokens (input / output). Cost? <em>2,000 × 4/1M + 500 × 20/1M = $0.008 + $0.010 = <strong>$0.018</strong>.</em> Output tokens are 5× pricier, so long answers and heavy thinking dominate.</p></div>

  <h2 id="la-build"><span class="num">08</span>Build It: Weather + Calculator Assistant</h2>
  <p>A complete, hand-written tool loop with two tools. The weather tool reads a small dict standing in for a real weather API. The calculator parses arithmetic with <code>ast</code> instead of <code>eval</code>, because the input is model-generated (untrusted).</p>
  <div class="fx" data-lang="py">import ast, json, operator
import anthropic

client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY
MODEL = "claude-opus-5-5"

# ---- 1. Tool implementations (plain Python) ----
FAKE_WEATHER = {                         # stand-in for a real weather API
    "mumbai": {"temp_c": 31, "condition": "humid, light rain"},
    "delhi":  {"temp_c": 24, "condition": "clear"},
    "london": {"temp_c": 12, "condition": "overcast"},
}

def get_weather(city: str, unit: str = "celsius") -&gt; str:
    w = FAKE_WEATHER.get(city.strip().lower())
    if w is None:
        raise ValueError(f"Unknown city '{city}'. Known: {sorted(FAKE_WEATHER)}")
    t = w["temp_c"] if unit == "celsius" else round(w["temp_c"] * 9 / 5 + 32)
    return json.dumps({"city": city, "temp": t, "unit": unit, "condition": w["condition"]})

OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
       ast.Div: operator.truediv, ast.Pow: operator.pow, ast.USub: operator.neg,
       ast.Mod: operator.mod}

def _eval(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in OPS:
        return OPS[type(node.op)](_eval(node.left), _eval(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in OPS:
        return OPS[type(node.op)](_eval(node.operand))
    raise ValueError("Only numbers and + - * / % ** are allowed")

def calculator(expression: str) -&gt; str:
    return str(_eval(ast.parse(expression, mode="eval").body))   # never eval()!

# ---- 2. Tool schemas (what the model sees) ----
TOOLS = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a city. Call this whenever "
                       "the user asks about weather, temperature or rain.",
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name, e.g. Mumbai"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
            },
            "required": ["city", "unit"],
            "additionalProperties": False,
        },
    },
    {
        "name": "calculator",
        "description": "Evaluate an arithmetic expression exactly. Call this for "
                       "ANY arithmetic instead of doing it in your head.",
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {"type": "string", "description": "e.g. (31 - 24) * 1.8"},
            },
            "required": ["expression"],
            "additionalProperties": False,
        },
    },
]
REGISTRY = {"get_weather": get_weather, "calculator": calculator}

# ---- 3. The tool loop ----
def run_tool(block) -&gt; dict:
    """Execute one tool_use block and wrap the outcome as a tool_result."""
    try:
        out = REGISTRY[block.name](**block.input)
        return {"type": "tool_result", "tool_use_id": block.id, "content": out}
    except Exception as e:                       # bad city, bad expression, ...
        return {"type": "tool_result", "tool_use_id": block.id,
                "content": f"Error: {e}", "is_error": True}

def ask(question: str, max_steps: int = 5) -&gt; str:
    messages = [{"role": "user", "content": question}]
    for _ in range(max_steps):
        response = client.messages.create(
            model=MODEL, max_tokens=4096, tools=TOOLS, messages=messages,
            system="You are a concise assistant. Use tools for weather and math.",
        )
        if response.stop_reason != "tool_use":   # end_turn, max_tokens, refusal...
            return "".join(b.text for b in response.content if b.type == "text")
        messages.append({"role": "assistant", "content": response.content})
        results = [run_tool(b) for b in response.content if b.type == "tool_use"]
        messages.append({"role": "user", "content": results})   # ALL results, ONE message
    return "Stopped: too many tool steps."

if __name__ == "__main__":
    print(ask("How much warmer is Mumbai than Delhi right now, in Fahrenheit degrees?"))</div>
  <h3>Test the tools without the API</h3>
  <p>Tool functions are plain Python, so test them like any function before letting a model call them. These outputs come from a real run:</p>
  <div class="fx" data-lang="py">print(get_weather("Mumbai", "celsius"))
print(get_weather("Delhi", "fahrenheit"))
print(calculator("(31 - 24) * 9 / 5"))

import types   # fake tool_use blocks to test the error path without the API
bad_city = types.SimpleNamespace(id="toolu_x", name="get_weather",
                                 input={"city": "Paris", "unit": "celsius"})
bad_expr = types.SimpleNamespace(id="toolu_y", name="calculator",
                                 input={"expression": "__import__('os')"})
print(run_tool(bad_city))
print(run_tool(bad_expr))</div>
  <div class="fx" data-lang="txt">{"city": "Mumbai", "temp": 31, "unit": "celsius", "condition": "humid, light rain"}
{"city": "Delhi", "temp": 75, "unit": "fahrenheit", "condition": "clear"}
12.6
{'type': 'tool_result', 'tool_use_id': 'toolu_x', 'content': "Error: Unknown city 'Paris'. Known: ['delhi', 'london', 'mumbai']", 'is_error': True}
{'type': 'tool_result', 'tool_use_id': 'toolu_y', 'content': 'Error: Only numbers and + - * / % ** are allowed', 'is_error': True}</div>
  <p>Expected flow for the main question (example trace, will vary):</p>
  <div class="flow"><span>tool_use × 2: get_weather Mumbai, Delhi (parallel)</span><span>tool_result × 2 in one message</span><span>tool_use: calculator "(31 - 24) * 9 / 5"</span><span>tool_result "12.6"</span><span>end_turn: "about 12.6 °F warmer"</span></div>
  <div class="callout intu"><span class="label">What you just built</span><p>This <code>while stop_reason == "tool_use"</code> loop is the core of every agent. 09 grows it into a real agent: more tools, a step guard, memory, planning, approval and logging.</p></div>

  <h2 id="la-rev"><span class="num">09</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Request</strong>: <code>model</code>, <code>max_tokens</code>, <code>system</code>, <code>messages</code> (user/assistant), optional <code>tools</code>.</li>
    <li><strong>Response</strong>: a list of content blocks; check <code>block.type</code>.</li>
    <li><strong>Stateless</strong>: resend the full history every call; append <code>response.content</code> whole.</li>
    <li><strong>stop_reason</strong> drives control flow: end_turn, max_tokens, tool_use, pause_turn, refusal.</li>
    <li><strong>Streaming</strong> cuts time-to-first-token, not cost.</li>
    <li><strong>Structured outputs</strong>: <code>output_config.format</code> or <code>messages.parse</code>; <code>strict: true</code> for tool args.</li>
    <li><strong>Tool loop</strong>: tool_use → run it yourself → tool_result (matching id, all in one user message) → call again.</li>
    <li><strong>Errors</strong> go back as <code>is_error: true</code>, not exceptions. Forced <code>tool_choice</code> is rejected on claude-opus-5-5.</li>
    <li><strong>Caching</strong>: prefix match over tools → system → messages; verify with <code>cache_read_input_tokens</code>.</li>
    <li><strong>Batches</strong> = 50% off, async; SDK retries 429/5xx; never retry a 400.</li>
  </ol></div>

  <h2 id="la-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>The API is stateless. How does a chatbot "remember" earlier turns, and what does that cost?</summary><div class="qa-body">The client resends the whole conversation in <code>messages</code> on every call. So input tokens, cost and latency grow each turn. Mitigate with prompt caching (cheap re-reads of the unchanged prefix), trimming or summarising old turns, and keeping long-term facts outside the prompt until needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through one complete tool call, naming every message.</summary><div class="qa-body">(1) user message + <code>tools</code> schemas. (2) Response: assistant content with a <code>tool_use</code> block (<code>id</code>, <code>name</code>, <code>input</code>), <code>stop_reason: "tool_use"</code>. (3) Your code runs the function. (4) Next request: history + that assistant turn unchanged + a user turn with <code>{"type": "tool_result", "tool_use_id": id, "content": …}</code>. (5) Model answers with <code>end_turn</code>, or calls another tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find the bug: the model asked for 2 tools, and the code appends two user messages, each with one tool_result.</summary><div class="qa-body">All results for one assistant turn must go in a <strong>single</strong> user message right after it, one <code>tool_result</code> per <code>tool_use</code> id. Collect them in a list and append once: <code>messages.append({"role": "user", "content": results})</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your tool raised an exception. What should go back to the model?</summary><div class="qa-body">A <code>tool_result</code> with the same <code>tool_use_id</code>, <code>"is_error": true</code> and a useful message ("Unknown city 'Paris'. Known: delhi, london, mumbai"). The model can then retry with fixed arguments or tell the user. Crashing the loop loses the whole conversation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you guarantee machine-readable JSON from a model?</summary><div class="qa-body">Use structured outputs: <code>output_config={"format": {"type": "json_schema", "schema": …}}</code> or <code>client.messages.parse(..., output_format=PydanticModel)</code>. Decoding is constrained to the schema. Still check <code>stop_reason</code>: <code>max_tokens</code> or <code>refusal</code> can cut it short. Prompt-only JSON has no guarantee.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need the model to always call <code>extract_invoice</code>. On claude-opus-5-5, <code>tool_choice={"type": "tool", ...}</code> returns 400. What now?</summary><div class="qa-body">Forced tool choice isn't supported on that model. Use <code>auto</code>, instruct the call in the prompt, set <code>strict: true</code>, and verify a <code>tool_use</code> block came back (re-prompt if not). If the tool only existed to get JSON, switch to structured outputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Prompt caching is on, but <code>cache_read_input_tokens</code> is always 0. Likely causes?</summary><div class="qa-body">Something early in the prefix changes per request: a timestamp or user id in the system prompt, non-deterministic JSON, a varying tool list, or a model switch. Or the prefix is below the minimum cacheable length, or calls are more than the TTL apart. Diff two consecutive request bodies to find the first changing byte.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use the Batch API instead of normal calls?</summary><div class="qa-body">Large offline jobs nobody waits on: labelling a dataset, running evals, nightly summaries. 50% cheaper, but asynchronous (up to 24 h) and results arrive unordered, matched by <code>custom_id</code>. Not for interactive chat.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why parse the calculator input with <code>ast</code> instead of <code>eval</code>?</summary><div class="qa-body">Tool arguments are model output, and model output can be steered by prompt injection. <code>eval("__import__('os').system(...)")</code> would run arbitrary code. Whitelisting AST node types allows only arithmetic. Treat every tool input as untrusted.</div></details>
</main>`
});
