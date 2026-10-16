// notes/genai/llm_apis.js — LLM APIs & Tool Calling
Object.assign(TOPIC_CONTENT, {
  "llm_apis": `<main>
  <h1>LLM APIs &amp; Tool Calling</h1>
  <p class="lead">You know how an LLM generates tokens (03) and how to write a good prompt (04). This note is the plumbing: the exact request and response shapes, and how a model "uses a tool" when it can only emit text. Every later note (RAG, agents, LangChain, MCP) is built on these mechanics.</p>

  <h2 id="la-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
  <div class="mm-center">LLM APIs &amp; Tool Calling</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Messages API</div>
      <ul>
        <li><b>Call</b> — <code>client.messages.create(model, max_tokens, system, messages, tools)</code></li>
        <li><b>messages</b> — alternating user/assistant, first is user</li>
        <li><b>system</b> — top-level field, not a message</li>
        <li><b>Response</b> — list of content blocks: text, thinking, tool_use → check <code>block.type</code></li>
        <li><b>Stateless</b> — resend the whole history every call; input grows per turn</li>
        <li>⚠ <b>Append <code>response.content</code> whole</b>, not just the text</li>
        <li>💡 call centre: new agent each call, hand over the full file</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">max_tokens &amp; stop_reason</div>
      <ul>
        <li><b>max_tokens</b> — required ceiling, not a target</li>
        <li><b>stop_reason</b> — end_turn · max_tokens (truncated) · tool_use · stop_sequence · pause_turn · refusal</li>
        <li>⚠ <b>max_tokens stop</b> = cut-off JSON / half tool call — never use it</li>
        <li><b>Thinking</b> — always on, adaptive on claude-opus-5-5; <code>output_config={"effort": ...}</code>; never budget_tokens</li>
        <li>⚠ <b>No prefill</b> on current models</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Streaming</div>
      <ul>
        <li><b>How</b> — <code>client.messages.stream(...)</code>, <code>text_stream</code>, <code>get_final_message()</code></li>
        <li><b>Events</b> — message_start → block_start → deltas → block_stop → message_delta → message_stop</li>
        <li><b>Wins</b> — time-to-first-token; not total time or cost</li>
        <li><b>Use</b> — chat UIs, long outputs (SDK refuses non-stream calls &gt; ~10 min)</li>
        <li><b>Tool input</b> streams as <code>input_json_delta</code>: act on the final block</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Structured outputs</div>
      <ul>
        <li><b>Why</b> — prompt-only JSON breaks pipelines "sometimes"</li>
        <li><b>How</b> — <code>output_config={"format": {"type": "json_schema", ...}}</code> or <code>messages.parse(output_format=Model)</code></li>
        <li><b>Tool args</b> — <code>strict: true</code></li>
        <li>⚠ <b>additionalProperties: false</b> on every object; min/maxLength not API-enforced</li>
        <li>⚠ refusal / max_tokens can still break the schema</li>
        <li>💡 paper form with fixed boxes</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Tool calling</div>
      <ul>
        <li><b>Definition</b> — name + description + JSON Schema; model asks, <i>your code</i> runs</li>
        <li><b>Loop</b> — tool_use → run → tool_result (matching <code>tool_use_id</code>) → call again</li>
        <li><b>Parallel</b> — several tool_use blocks → all results in ONE user message</li>
        <li><b>Errors</b> — return <code>is_error: true</code> + message, don't crash</li>
        <li><b>Good tool</b> — verb_noun name, "when to call" in description, enums, strict</li>
        <li><b>tool_choice</b> — auto / none; any/tool forced → 400 on claude-opus-5-5</li>
        <li>⚠ <b>The model never runs code</b> — you own validation, permissions</li>
        <li>💡 head chef writes tickets; kitchen (your code) cooks</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Prompt caching</div>
      <ul>
        <li><b>What</b> — reuse a processed prefix across calls</li>
        <li><b>Order</b> — tools → system → messages; exact prefix match</li>
        <li><b>How</b> — <code>cache_control={"type": "ephemeral"}</code> breakpoint (≤ 4) or top-level auto</li>
        <li><b>Price</b> — write ≈1.25× (5 min) / 2× (1 h); read ≈0.1× (0.05× on opus-5-5)</li>
        <li><b>Min prefix</b> — e.g. 512 tokens; shorter silently uncached</li>
        <li>⚠ <b>Silent invalidators</b> — timestamps, unsorted JSON, varying tools; check <code>cache_read_input_tokens</code></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Batches, limits, retries</div>
      <ul>
        <li><b>Batch API</b> — 50% off, async (≤ 24 h), results unordered → match <code>custom_id</code></li>
        <li><b>429</b> rate limit · <b>5xx/529</b> overload → retry with backoff + jitter, honour retry-after</li>
        <li><b>SDK</b> retries 408/409/429/5xx (default 2); tune <code>max_retries</code>, <code>timeout</code></li>
        <li>⚠ <b>Never retry a 400</b> — fix the request</li>
        <li><b>count_tokens</b> — free; tool schemas cost input tokens too</li>
        <li><b>Cost</b> — 2k in + 500 out at $4/$20 per 1M = $0.018</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Build: weather + calculator</div>
      <ul>
        <li><b>Registry</b> — name → Python function</li>
        <li><b>run_tool</b> — try/except → tool_result with is_error</li>
        <li><b>Loop</b> — max_steps guard; stop when stop_reason ≠ tool_use</li>
        <li><b>Calculator</b> — <code>ast</code> whitelist, never <code>eval</code> (inputs untrusted)</li>
        <li><b>Test tools offline</b> like any function</li>
      </ul>
    </div>
  </div>
</div>

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
      <div class="rm-item rm-done" data-target="la-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="la-msg"><span class="num">01</span>The Messages API</h2>
  <p>One endpoint: send a list of messages, get back the next assistant message. Code uses the Anthropic Python SDK (<code>pip install anthropic</code>); OpenAI, Gemini and others follow the same pattern with different field names.</p>
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
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <text x="70" y="30" text-anchor="end" class="tm">call 1</text>
    <rect x="80" y="12" width="46" height="24" class="fb sb"/><text x="103" y="29" text-anchor="middle">u1</text>
    <text x="136" y="29" class="tm">→ a1</text>
    <text x="70" y="64" text-anchor="end" class="tm">call 2</text>
    <rect x="80" y="46" width="46" height="24" class="fb sb"/><text x="103" y="63" text-anchor="middle">u1</text>
    <rect x="126" y="46" width="46" height="24" class="fg sg"/><text x="149" y="63" text-anchor="middle">a1</text>
    <rect x="172" y="46" width="46" height="24" class="fb sb"/><text x="195" y="63" text-anchor="middle">u2</text>
    <text x="228" y="63" class="tm">→ a2</text>
    <text x="70" y="98" text-anchor="end" class="tm">call 3</text>
    <rect x="80" y="80" width="46" height="24" class="fb sb"/><text x="103" y="97" text-anchor="middle">u1</text>
    <rect x="126" y="80" width="46" height="24" class="fg sg"/><text x="149" y="97" text-anchor="middle">a1</text>
    <rect x="172" y="80" width="46" height="24" class="fb sb"/><text x="195" y="97" text-anchor="middle">u2</text>
    <rect x="218" y="80" width="46" height="24" class="fg sg"/><text x="241" y="97" text-anchor="middle">a2</text>
    <rect x="264" y="80" width="46" height="24" class="fb sb"/><text x="287" y="97" text-anchor="middle">u3</text>
    <text x="320" y="97" class="tm">→ a3</text>
    <text x="70" y="132" text-anchor="end" class="tm">call 4</text>
    <rect x="80" y="114" width="46" height="24" class="fb sb"/><text x="103" y="131" text-anchor="middle">u1</text>
    <rect x="126" y="114" width="46" height="24" class="fg sg"/><text x="149" y="131" text-anchor="middle">a1</text>
    <rect x="172" y="114" width="46" height="24" class="fb sb"/><text x="195" y="131" text-anchor="middle">u2</text>
    <rect x="218" y="114" width="46" height="24" class="fg sg"/><text x="241" y="131" text-anchor="middle">a2</text>
    <rect x="264" y="114" width="46" height="24" class="fb sb"/><text x="287" y="131" text-anchor="middle">u3</text>
    <rect x="310" y="114" width="46" height="24" class="fg sg"/><text x="333" y="131" text-anchor="middle">a3</text>
    <rect x="356" y="114" width="46" height="24" class="fb sb"/><text x="379" y="131" text-anchor="middle">u4</text>
    <text x="412" y="131" class="tm">→ a4</text>
    <text x="440" y="40" class="tm">input resent</text><text x="440" y="56" class="tm">every call:</text><text x="440" y="72" class="tr">grows each turn</text>
    </svg><figcaption>Stateless API: call 4 resends u1…a3 plus u4. Cost and latency grow with history; caching and trimming fight it.</figcaption></figure>
  <p>"Memory" in chat apps and agents is just your code choosing what to resend (memory types: 08).</p>
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
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <text x="10" y="34" class="tm">no stream</text><rect x="100" y="18" width="400" height="24" class="fs"/><text x="300" y="35" text-anchor="middle" class="tm">spinner…</text><rect x="500" y="18" width="80" height="24" class="fg sg"/><text x="540" y="35" text-anchor="middle">all text</text>
    <text x="10" y="82" class="tm">stream</text><rect x="100" y="66" width="40" height="24" class="fs"/>
    <rect x="144" y="66" width="34" height="24" class="fg sg"/>
    <rect x="184" y="66" width="34" height="24" class="fg sg"/>
    <rect x="224" y="66" width="34" height="24" class="fg sg"/>
    <rect x="264" y="66" width="34" height="24" class="fg sg"/>
    <rect x="304" y="66" width="34" height="24" class="fg sg"/>
    <rect x="344" y="66" width="34" height="24" class="fg sg"/>
    <rect x="384" y="66" width="34" height="24" class="fg sg"/>
    <rect x="424" y="66" width="34" height="24" class="fg sg"/>
    <rect x="464" y="66" width="34" height="24" class="fg sg"/>
    <rect x="504" y="66" width="34" height="24" class="fg sg"/>
    <rect x="544" y="66" width="34" height="24" class="fg sg"/>
    <line x1="140" y1="96" x2="140" y2="110" class="sb"/><text x="146" y="112" class="tb">first token (TTFT)</text>
    <text x="580" y="112" text-anchor="end" class="tm">same end time</text>
    </svg><figcaption>Streaming shows text after the first token instead of at the end. Total time and cost are unchanged.</figcaption></figure>
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
    <li>Use it for any chat UI, and for long outputs: the SDK refuses a non-streaming call it expects to run longer than about 10 minutes.</li>
    <li>Tool calls stream too: tool input arrives as <code>input_json_delta</code> fragments. Act only on the finished block from <code>get_final_message()</code>.</li>
  </ul>

  <h2 id="la-struct"><span class="num">04</span>Structured Outputs</h2>
  <p>Prompt-only JSON (04) works "most of the time", and one stray sentence crashes <code>json.loads</code>. <strong>Structured outputs</strong> constrain decoding to a JSON Schema: the result always parses and matches.</p>
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
  <p>It turns "predict text" into "decide which action to take": weather, your database, exact arithmetic. The seed of every agent (08–09).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A head chef who never leaves the pass. They write order tickets ("2 × fries, table 4"); the kitchen staff do the actual work and send the plates back. The model writes tickets; your code is the kitchen.</p></div>
  <figure class="viz"><svg viewBox="0 0 620 315" width="620">
    <defs><marker id="la-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="90" y="20" text-anchor="middle">Your code</text><line x1="90" y1="30" x2="90" y2="290" stroke="currentColor" opacity="0.25" stroke-dasharray="3 3"/>
    <text x="330" y="20" text-anchor="middle">Model (API)</text><line x1="330" y1="30" x2="330" y2="290" stroke="currentColor" opacity="0.25" stroke-dasharray="3 3"/>
    <text x="540" y="20" text-anchor="middle">Tool function</text><line x1="540" y1="30" x2="540" y2="290" stroke="currentColor" opacity="0.25" stroke-dasharray="3 3"/>
    <line x1="90" y1="55" x2="326" y2="55" class="sb" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="49" text-anchor="middle" class="tm">user msg + tools schemas</text>
    <line x1="330" y1="97" x2="94" y2="97" class="sr" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="91" text-anchor="middle" class="tr">tool_use {city: Mumbai} · stop_reason=tool_use</text>
    <line x1="90" y1="139" x2="536" y2="139" class="st" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="315" y="133" text-anchor="middle" class="tm">get_weather("Mumbai", "celsius")</text>
    <line x1="540" y1="181" x2="94" y2="181" class="st" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="315" y="175" text-anchor="middle" class="tm">{"temp": 31, "condition": …}</text>
    <line x1="90" y1="223" x2="326" y2="223" class="sb" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="217" text-anchor="middle" class="tm">history + assistant turn + tool_result (same id)</text>
    <line x1="330" y1="265" x2="94" y2="265" class="sg" stroke-width="1.5" marker-end="url(#la-ah)"/>
    <text x="210" y="259" text-anchor="middle" class="tg">text answer · stop_reason=end_turn</text>
    <text x="10" y="305" class="tm">↻ loop while stop_reason == "tool_use"</text>
    </svg><figcaption>One tool round trip. The model only writes the request; your code runs the function and sends the result back.</figcaption></figure>

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
  <p>Agents and RAG resend the same long prefix every call. <strong>Prompt caching</strong> stores the processed prefix server-side; later calls starting with the same bytes are cheaper and faster.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <text x="70" y="33" text-anchor="end" class="tm">call 1</text>
    <rect x="80" y="15" width="110" height="26" class="fs"/><text x="135" y="33" text-anchor="middle">tools</text>
    <rect x="190" y="15" width="170" height="26" class="fs"/><text x="275" y="33" text-anchor="middle">system + docs</text>
    <rect x="360" y="15" width="140" height="26" class="fs"/><text x="430" y="33" text-anchor="middle">messages</text>
    <line x1="360" y1="8" x2="360" y2="50" class="sr" stroke-width="2"/><text x="364" y="12" class="tr" font-size="11">cache_control</text>
    <text x="508" y="33" class="tm">write ≈1.25×</text>
    <text x="70" y="83" text-anchor="end" class="tm">call 2</text>
    <rect x="80" y="65" width="110" height="26" class="fg sg"/><text x="135" y="83" text-anchor="middle">tools</text>
    <rect x="190" y="65" width="170" height="26" class="fg sg"/><text x="275" y="83" text-anchor="middle">system + docs</text>
    <rect x="360" y="65" width="140" height="26" class="fs"/><text x="430" y="83" text-anchor="middle">messages + new</text>
    <text x="510" y="83" class="tg">read ≈0.1×</text>
    <text x="70" y="133" text-anchor="end" class="tm">edit</text>
    <rect x="80" y="115" width="110" height="26" class="fg sg"/><text x="135" y="133" text-anchor="middle">tools</text>
    <rect x="190" y="115" width="40" height="26" class="fr sr"/><text x="210" y="133" text-anchor="middle">Δ</text>
    <rect x="230" y="115" width="130" height="26" class="fs"/><text x="295" y="133" text-anchor="middle">re-read</text>
    <rect x="360" y="115" width="140" height="26" class="fs"/><text x="430" y="133" text-anchor="middle">messages + new</text>
    <text x="510" y="133" class="tr">miss</text>
    </svg><figcaption>Cache = exact prefix match in render order tools → system → messages. One changed byte (Δ) invalidates everything after it.</figcaption></figure>
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
  <p>For work nobody waits on (labelling 50k reviews, nightly evals): 50% cheaper per request, results async, usually within an hour, at most 24 h.</p>
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

  <h2 id="la-qa"><span class="num">09</span>Questions &amp; Answers</h2>
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
