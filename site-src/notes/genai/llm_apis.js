// notes/genai/llm_apis.js — LLM APIs & Tool Calling
Object.assign(TOPIC_CONTENT, {
  "llm_apis": `<main>
  <h1>LLM APIs &amp; Tool Calling</h1>
  <p class="lead">You know how an LLM generates tokens (<a class="xref" data-note="llm_basics">How LLMs Work</a>) and how to write a good prompt (<a class="xref" data-note="prompting">Prompt Engineering</a>). This note is the plumbing: the exact request and response shapes, how to stop, stream and get clean JSON, and how a model "uses a tool" when all it can do is write text. Every later note (RAG, agents, LangChain, MCP) is built on these mechanics.</p>

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
        <li><b>Stateless</b> — resend the whole history every call; input grows per turn (340 → 980 tokens in 5 turns)</li>
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
        <li><b>Thinking</b> — always on, adaptive on claude-opus-5-5; <code>output_config={"effort": ...}</code> (default medium); never budget_tokens</li>
        <li>⚠ <b>No prefill</b> on current models (400)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Streaming</div>
      <ul>
        <li><b>How</b> — <code>client.messages.stream(...)</code>, <code>text_stream</code>, <code>get_final_message()</code></li>
        <li><b>Events</b> — message_start → block_start → deltas → block_stop → message_delta → message_stop</li>
        <li><b>Wins</b> — time-to-first-token; not total time or cost</li>
        <li><b>Use</b> — chat UIs, long outputs (SDK refuses non-stream calls expected &gt; ~10 min)</li>
        <li><b>Tool input</b> streams as <code>input_json_delta</code>: act on the final block</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Structured outputs</div>
      <ul>
        <li><b>Why</b> — prompt-only JSON breaks pipelines "sometimes"</li>
        <li><b>How</b> — <code>output_config={"format": {"type": "json_schema", ...}}</code> or <code>messages.parse(output_format=Model)</code></li>
        <li><b>Tool args</b> — <code>strict: true</code></li>
        <li><b>Still validate</b> — Pydantic catches bad JSON / wrong types</li>
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
        <li><b>Price</b> — write 1.25× (5 min) / 2× (1 h); read ≈0.1× (0.05× on opus-5-5: $0.20/1M)</li>
        <li><b>Example</b> — 20K prefix × 10 calls: $0.81 → $0.14 (82% less)</li>
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
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Build: weather + calculator</div>
      <ul>
        <li><b>Registry</b> — name → Python function</li>
        <li><b>run_tool</b> — try/except → tool_result with is_error</li>
        <li><b>Loop</b> — max_steps guard; stop when stop_reason ≠ tool_use</li>
        <li><b>Calculator</b> — <code>ast</code> whitelist, never <code>eval</code> (inputs untrusted)</li>
        <li><b>Test offline</b> — tools as plain functions; loop with a scripted fake client</li>
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
      <div class="rm-item rm-done" data-target="la-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Lost blocks, split results, retrying 400s</span></div></div>
      <div class="rm-item rm-done" data-target="la-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <div class="callout intu"><span class="label">A note on the examples</span><p>Code uses the Anthropic Python SDK (<code>pip install anthropic</code>, then set <code>ANTHROPIC_API_KEY</code>). OpenAI, Gemini and others follow the same ideas with different field names. Outputs marked "example output" are illustrative, because a live model's wording changes every run. Outputs from plain Python (tool functions, cost maths, the scripted test of the tool loop) are from real runs.</p></div>

  <h2 id="la-msg"><span class="num">01</span>The Messages API</h2>
  <p>You have used a chat app: you type, it answers, and it seems to remember what you said five messages ago. When you build your own app, you have to recreate all of that yourself. The first surprise for most people: the server remembers <em>nothing</em> between calls.</p>
  <p>The API has one main endpoint. You send a list of messages (the conversation so far), and you get back the next assistant message. That's it. Every call is independent, so if you want the model to "remember", you send the earlier messages again.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bank call centre where a different agent picks up every time you call. The new agent knows nothing about you unless you hand over the full case file. A longer file means more reading, so each call takes longer and costs more.</p></div>
  <p>The smallest useful call: pick a model, set a ceiling on output length, give standing instructions in <code>system</code>, and send one user message. Then loop over the reply's blocks and print the text.</p>
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
  <p><em>Example output (wording and counts will vary):</em></p>
  <div class="fx" data-lang="text">Overfitting is when a model learns the noise in its training data so well that it performs worse on new, unseen data.
end_turn 31 27</div>
  <p>The key line is <code>for block in response.content</code>. The reply is not a string; it is a list of <strong>content blocks</strong>, because one reply can mix a <code>thinking</code> block, a <code>text</code> block and <code>tool_use</code> blocks. Always check <code>block.type</code>. The last line prints why it stopped and the tokens you are billed for.</p>
  <table class="tbl">
    <tr><th>Field</th><th>What it is</th></tr>
    <tr><td><code>model</code></td><td>Which model answers. Pin an exact id, e.g. <code>claude-opus-5-5</code>, <code>claude-sonnet-5-5</code>, <code>claude-haiku-5-5</code>.</td></tr>
    <tr><td><code>max_tokens</code></td><td>Required. Upper limit on tokens generated in this reply.</td></tr>
    <tr><td><code>system</code></td><td>Top-level standing instructions: role, rules, format. Not a message in the list.</td></tr>
    <tr><td><code>messages</code></td><td>Alternating <code>user</code> / <code>assistant</code> turns. The first must be <code>user</code>.</td></tr>
    <tr><td><code>content</code></td><td>A string, or a list of content blocks: <code>text</code>, <code>image</code>, <code>tool_use</code>, <code>tool_result</code>…</td></tr>
  </table>

  <h3>Stateless: you own the history</h3>
  <p>To continue a conversation, append the assistant's reply and the next user message to the same list, and send the whole list again.</p>
  <div class="fx" data-lang="py">messages = [{"role": "user", "content": "My name is Asha."}]
r1 = client.messages.create(model="claude-opus-5-5", max_tokens=512, messages=messages)

messages.append({"role": "assistant", "content": r1.content})    # keep the reply
messages.append({"role": "user", "content": "What is my name?"})
r2 = client.messages.create(model="claude-opus-5-5", max_tokens=512, messages=messages)
# r2 knows "Asha" only because turn 1 was sent again</div>
  <p><code>r1.content</code> (the full block list) goes back as the assistant turn. The second call contains three messages; the model reads "My name is Asha" in it, so it can answer. Remove the first two <code>append</code> lines and it would have no idea.</p>
  <h3>Worked example: how the input grows</h3>
  <p>Say the system prompt is 300 tokens, each question 40 tokens, each answer 120 tokens. The script counts what each call must send.</p>
  <div class="fx" data-lang="py"># Simulate a 5-turn chat. Each turn adds a 40-token user message and a
# 120-token reply. The API is stateless, so every call resends everything.
SYSTEM = 300                       # tokens in the system prompt
history = 0                        # tokens of earlier turns
total_input = 0
for turn in range(1, 6):
    sent = SYSTEM + history + 40   # system + all earlier turns + new question
    total_input += sent
    print(f"call {turn}: input tokens sent = {sent}")
    history += 40 + 120            # this turn's question and answer join the history
print("total input tokens over 5 calls:", total_input)</div>
  <div class="fx" data-lang="text">call 1: input tokens sent = 340
call 2: input tokens sent = 500
call 3: input tokens sent = 660
call 4: input tokens sent = 820
call 5: input tokens sent = 980
total input tokens over 5 calls: 3300</div>
  <p>Each call sends 160 more tokens than the last, because <code>history += 40 + 120</code> keeps growing. Five short turns already cost 3,300 input tokens, almost 3× the 1,140 tokens of actual new text. Long chats and agents grow much faster. That is why prompt caching (06) and trimming old turns matter.</p>
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
  <div class="callout def"><span class="label">Definition</span><p><strong>Stateless API</strong>: the server keeps no memory between calls. Every request must carry the whole conversation so far. "Memory" in chat apps and agents is just your code choosing what to resend.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Appending only the reply's text instead of <code>response.content</code>. With tools or thinking, the full block list must go back unchanged, or the next call fails or loses context.</p></div>
  <p>Interviews ask "how does a chatbot remember?" and "why does a long chat get slower and pricier?". Both answers are the picture above.</p>

  <h2 id="la-stop"><span class="num">02</span>max_tokens &amp; stop_reason</h2>
  <p>A data pipeline asks the model for JSON and calls <code>json.loads</code> on the reply. It works for weeks, then crashes on one long document. The cause: the reply hit the length limit and was cut off in the middle of a string. The reply looked normal; only one field said what happened.</p>
  <p><code>max_tokens</code> is a <em>ceiling</em>, not a target. The model stops early when it's done. <code>stop_reason</code> tells you which of several things ended the reply, and your code must check it before trusting the content.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A courier marks every delivery: "delivered", "returned: address incomplete", "held at hub". You read the status before opening the box. A box marked "partial" may have only half your order inside.</p></div>
  <table class="tbl">
    <tr><th>stop_reason</th><th>Meaning</th><th>Your code should</th></tr>
    <tr><td><code>end_turn</code></td><td>Finished naturally</td><td>Use the answer</td></tr>
    <tr><td><code>max_tokens</code></td><td>Hit your cap mid-answer</td><td>Treat as truncated: raise the cap or ask for less. Never run a half-written tool call</td></tr>
    <tr><td><code>tool_use</code></td><td>Wants you to run a tool</td><td>Run it, send <code>tool_result</code>, call again (05)</td></tr>
    <tr><td><code>stop_sequence</code></td><td>Hit one of your <code>stop_sequences</code></td><td>Use the text up to it</td></tr>
    <tr><td><code>pause_turn</code></td><td>A server-side tool loop paused</td><td>Resend the conversation to continue</td></tr>
    <tr><td><code>refusal</code></td><td>Declined for safety reasons</td><td>Don't parse as normal output; see <code>stop_details</code></td></tr>
  </table>
  <p>The function below is the habit to build: one branch per stop reason, and a safe default for anything new. It is tested here with fake response objects, so it runs without an API key.</p>
  <div class="fx" data-lang="py">from types import SimpleNamespace as NS

def handle(response):
    """Decide what to do based on why the model stopped."""
    r = response.stop_reason
    if r == "end_turn":
        return "use the answer"
    if r == "max_tokens":
        return "TRUNCATED: raise max_tokens or ask for less"
    if r == "tool_use":
        return "run the tool, send tool_result, call again"
    if r == "stop_sequence":
        return f"stopped at {response.stop_sequence!r}"
    if r == "pause_turn":
        return "resend the conversation to let it continue"
    if r == "refusal":
        return "declined: show a safe message, do not parse"
    return f"unknown stop_reason {r!r}: log it"

for r in ["end_turn", "max_tokens", "tool_use", "stop_sequence", "refusal", "something_new"]:
    fake = NS(stop_reason=r, stop_sequence="###" if r == "stop_sequence" else None)
    print(f"{r:14s} -&gt; {handle(fake)}")</div>
  <div class="fx" data-lang="text">end_turn       -&gt; use the answer
max_tokens     -&gt; TRUNCATED: raise max_tokens or ask for less
tool_use       -&gt; run the tool, send tool_result, call again
stop_sequence  -&gt; stopped at '###'
refusal        -&gt; declined: show a safe message, do not parse
something_new  -&gt; unknown stop_reason 'something_new': log it</div>
  <p><code>SimpleNamespace</code> builds a tiny object with only the attributes we need, which is a cheap way to test code that reads API responses. The last case matters in production: APIs add new stop reasons over time, so an unknown one should be logged, not silently treated as success.</p>
  <h3>Thinking and effort</h3>
  <p>Reasoning models (<a class="xref" data-note="llm_basics">How LLMs Work</a>, section 09) think before answering. On <code>claude-opus-5-5</code> thinking is always on and adaptive. You control depth with <code>output_config={"effort": "low"}</code> (low, medium = default, high, xhigh, max), never the old <code>budget_tokens</code>, which now returns a 400. Thinking tokens count toward <code>max_tokens</code> and are billed as output, so leave room: a cap that fits the answer but not the thinking gives a <code>max_tokens</code> stop.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>max_tokens</strong>: the maximum number of tokens (thinking + text) the model may generate in one reply. <strong>stop_reason</strong>: the field that says why generation ended.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Old tutorials "prefill" the assistant turn (start the reply with <code>{</code>) to force JSON. Current Claude models reject prefill with a 400. Use structured outputs (04) instead. And never assume JSON is complete: on a <code>max_tokens</code> stop it is cut off, even with structured outputs.</p></div>

  <h2 id="la-stream"><span class="num">03</span>Streaming</h2>
  <p>A user asks your chatbot for a long explanation. The model needs 20 seconds to write 1,000 tokens. Without streaming, the user stares at a spinner for 20 seconds, and many will assume it is broken and leave. With streaming, the first words appear in under a second and keep flowing.</p>
  <p><strong>Streaming</strong> means the server sends the reply in small pieces as they are generated, instead of one complete response at the end. The total time and total cost are the same. Only the waiting <em>feels</em> different, because you see progress immediately.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Watching a cricket match live versus getting the full highlights video emailed after the match. Same match, same length, but live you start watching at once.</p></div>
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
  <h3>Worked example: what the user waits for</h3>
  <p>With a time-to-first-token (TTFT) of 0.6 s and 50 tokens per second, a 1,000-token answer takes 0.6 + 1000/50 = 20.6 s in total. Without streaming, the user waits 20.6 s to see anything. With streaming, they wait 0.6 s, then read along. Same 20.6 s, very different experience.</p>
  <p>The SDK gives a context manager. Inside it, <code>stream.text_stream</code> yields text pieces as they arrive; after the loop, <code>get_final_message()</code> returns the complete message, exactly like a non-streaming call would.</p>
  <div class="fx" data-lang="py">with client.messages.stream(
    model="claude-opus-5-5",
    max_tokens=4096,
    messages=[{"role": "user", "content": "Write a haiku about gradient descent."}],
) as stream:
    for text in stream.text_stream:          # text pieces as they arrive
        print(text, end="", flush=True)
    final = stream.get_final_message()       # full Message object at the end

print("\\n", final.stop_reason, final.usage.output_tokens)</div>
  <p><em>Example output (the haiku appears word by word; wording will vary):</em></p>
  <div class="fx" data-lang="text">Steps downhill slow / loss whispers where the minimum hides / learning rate too high
 end_turn 24</div>
  <p><code>end=""</code> stops <code>print</code> adding a newline after each piece, and <code>flush=True</code> pushes it to the screen immediately; without it the terminal may buffer and you lose the streaming effect. <code>final</code> has <code>stop_reason</code> and <code>usage</code>, which only arrive at the end of the stream. Under the hood the server sends a sequence of events:</p>
  <div class="flow"><span>message_start</span><span>content_block_start</span><span>content_block_delta × N</span><span>content_block_stop</span><span>message_delta (stop_reason, usage)</span><span>message_stop</span></div>
  <ul>
    <li>Use streaming for any chat UI, and for long outputs: the SDK refuses a non-streaming call it expects to run longer than about 10 minutes.</li>
    <li>Tool calls stream too: tool input arrives as <code>input_json_delta</code> fragments. Act only on the finished block from <code>get_final_message()</code>.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Streaming</strong>: receiving the response incrementally as server-sent events (SSE) instead of one final JSON body. It improves time-to-first-token, not total latency or cost.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Streaming makes it faster." It does not; it makes it <em>feel</em> faster. And parsing JSON or running a tool from half-streamed pieces gives broken input. Wait for the final message for anything you parse.</p></div>

  <h2 id="la-struct"><span class="num">04</span>Structured Outputs</h2>
  <p>Your code needs <code>{"name": "Ben", "quantity": 2}</code>. You write "reply only in JSON" in the prompt. It works 99 times; on the 100th the model replies "Sure! Here is the JSON: {...}" and <code>json.loads</code> crashes your nightly job. Prompt-only JSON (see <a class="xref" data-note="prompting">Prompt Engineering</a>) is a request, not a guarantee.</p>
  <p><strong>Structured outputs</strong> fix this at the source. You pass a JSON Schema (a formal description of the shape you want), and the API constrains decoding so the model can only produce tokens that keep the output valid for that schema. The result always parses and has the required fields.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A government form with fixed boxes versus a blank sheet that says "please include your name and city". The form physically cannot come back without a city box. The blank sheet usually does, but not always.</p></div>
  <p>The first version passes the schema directly in <code>output_config</code>. The text block then contains pure JSON, so <code>json.loads</code> is safe.</p>
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
data = json.loads(next(b.text for b in response.content if b.type == "text"))
print(data["quantity"] * 10)</div>
  <p><em>Example output:</em></p>
  <div class="fx" data-lang="text">20</div>
  <p><code>"required"</code> forces both keys to appear; <code>"additionalProperties": False</code> forbids extra keys; <code>"type": "integer"</code> means quantity comes back as <code>2</code>, not <code>"two"</code>, so <code>data["quantity"] * 10</code> works. <code>next(...)</code> picks the first text block, skipping any thinking block.</p>
  <p>Writing schemas by hand gets tedious. With Pydantic (a Python library for typed data classes), the SDK builds the schema from a class and also validates the reply for you:</p>
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
    output_format=Order,       # parse() turns this into output_config.format
)
order = response.parsed_output     # a validated Order instance
print(order.quantity + 1)</div>
  <p><em>Example output:</em></p>
  <div class="fx" data-lang="text">3</div>
  <h3>Worked example: what validation catches</h3>
  <p>Even with structured outputs, keep a validation step in your code: it catches truncated replies, refusals and replies from code paths that didn't use a schema. The script runs three replies through the same <code>Order</code> class; no API needed.</p>
  <div class="fx" data-lang="py">from pydantic import BaseModel, ValidationError

class Order(BaseModel):
    name: str
    city: str
    quantity: int
    callback: bool

replies = [
    '{"name": "Ben", "city": "Delhi", "quantity": 2, "callback": true}',
    'Sure! Here is the JSON: {"name": "Ben", "city": "Delhi"}',
    '{"name": "Ben", "city": "Delhi", "quantity": "two", "callback": true}',
]
for text in replies:
    try:
        order = Order.model_validate_json(text)
        print("OK   ", order)
    except ValidationError as e:
        print("FAIL ", e.error_count(), "error(s):", e.errors()[0]["type"])</div>
  <div class="fx" data-lang="text">OK    name='Ben' city='Delhi' quantity=2 callback=True
FAIL  1 error(s): json_invalid
FAIL  1 error(s): int_parsing</div>
  <p>Reply 1 is clean. Reply 2 is the classic prompt-only failure: a friendly sentence before the JSON makes it invalid JSON. Reply 3 parses as JSON but <code>"two"</code> is not an integer. <code>model_validate_json</code> does both checks in one line. With schema-constrained output, failures 2 and 3 cannot happen in a completed reply, which is the whole point.</p>
  <table class="tbl">
    <tr><th>Approach</th><th>Guarantee</th><th>Use when</th></tr>
    <tr><td>"Reply in JSON" in the prompt</td><td>None; usually right</td><td>Quick prototypes</td></tr>
    <tr><td><code>output_config.format</code> / <code>messages.parse</code></td><td>Valid JSON matching the schema</td><td>Extraction, classification, any reply parsed by code</td></tr>
    <tr><td><code>strict: true</code> on a tool</td><td>Tool <em>arguments</em> match the schema</td><td>Tool calling (05)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Structured outputs</strong> (constrained decoding): the API only allows tokens that keep the output valid against your JSON Schema. <strong>JSON Schema</strong>: a standard JSON format for describing types, required keys and allowed values.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Every object needs <code>"additionalProperties": false</code>. Numeric and length limits (<code>minimum</code>, <code>maxLength</code>) aren't enforced by the API; the SDK checks them after. A <code>refusal</code> or <code>max_tokens</code> stop can still break the schema, so check <code>stop_reason</code> first.</p></div>
  <p>In data-science work this is the bridge from LLM to DataFrame: extraction from invoices, resumes, tickets. Interviews ask "how do you guarantee machine-readable output?".</p>

  <h2 id="la-tools"><span class="num">05</span>Tool Calling</h2>
  <p>Ask a model "Is it raining in Mumbai right now?" and it has two bad options: say "I can't know", or guess from old training data. It cannot open a weather website. It also often gets exact arithmetic wrong, and it cannot read your company database. All it can do is produce text.</p>
  <p><strong>Tool calling</strong> solves this with a simple trick. You describe some functions to the model (name, what it does, what arguments it takes). When the model decides it needs one, instead of answering it writes a structured request: "call <code>get_weather</code> with city = Mumbai". <strong>Your code</strong> runs the real function and sends the result back. The model then answers using that result.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A head chef at a busy restaurant who never leaves the pass. She writes order tickets ("2 × dosa, table 4"); the kitchen staff do the actual cooking and send the plates back; she checks and serves. The model writes tickets; your code is the kitchen.</p></div>
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

  <h3>Worked example: one round trip, exact shapes</h3>
  <p>Follow one question through four HTTP messages. <strong>Request 1</strong>: the user question plus the tool definition. The <code>input_schema</code> is a JSON Schema for the arguments.</p>
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
  <p><strong>Response 1</strong>: the model does not answer; it asks for the tool. <code>stop_reason</code> is <code>tool_use</code>, and <code>input</code> is already a parsed object.</p>
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
  <p><strong>Request 2</strong>: resend everything, plus the assistant turn exactly as received, plus a <code>user</code> turn holding the <code>tool_result</code>. The <code>tool_use_id</code> must match the <code>id</code> from Response 1; that is how the model knows which result belongs to which request.</p>
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
  <p><strong>Response 2</strong>: no more tools needed, so it answers with <code>end_turn</code>.</p>
  <div class="fx" data-lang="js">{
  "role": "assistant",
  "content": [
    {"type": "text", "text": "Yes, light rain in Mumbai right now, 31 °C and humid."}
  ],
  "stop_reason": "end_turn",
  "usage": {"input_tokens": 760, "output_tokens": 20}
}</div>
  <p>IDs and token counts above are illustrative. On <code>claude-opus-5-5</code> the assistant content may also start with a <code>thinking</code> block; it goes back unchanged with the rest.</p>
  <h3>Building the tool_result message in Python</h3>
  <p>The step people get wrong is Request 2. The script below takes an assistant reply that asked for <em>two</em> tools at once (parallel tool use), runs each, and builds the next user message. Plain dicts stand in for the SDK objects so it runs offline.</p>
  <div class="fx" data-lang="py">import json

# What the model sent back (response.content, shown as plain dicts)
assistant_content = [
    {"type": "text", "text": "Let me check both cities."},
    {"type": "tool_use", "id": "toolu_01", "name": "get_weather",
     "input": {"city": "Mumbai", "unit": "celsius"}},
    {"type": "tool_use", "id": "toolu_02", "name": "get_weather",
     "input": {"city": "Delhi", "unit": "celsius"}},
]

def get_weather(city, unit):                      # your real function
    temps = {"Mumbai": 31, "Delhi": 24}
    return json.dumps({"city": city, "temp": temps[city], "unit": unit})

results = []
for block in assistant_content:
    if block["type"] == "tool_use":               # skip the text block
        out = get_weather(**block["input"])       # YOUR code runs the tool
        results.append({"type": "tool_result",
                        "tool_use_id": block["id"],   # must match the request id
                        "content": out})

next_message = {"role": "user", "content": results}  # ALL results, ONE message
print("role:", next_message["role"])
for r in next_message["content"]:
    print(r["type"], r["tool_use_id"], r["content"])</div>
  <div class="fx" data-lang="text">role: user
tool_result toolu_01 {"city": "Mumbai", "temp": 31, "unit": "celsius"}
tool_result toolu_02 {"city": "Delhi", "temp": 24, "unit": "celsius"}</div>
  <p>Three lines carry the rules. <code>get_weather(**block["input"])</code> unpacks the model's arguments into your function. <code>"tool_use_id": block["id"]</code> links each result to its request. And both results go into <em>one</em> user message. Sending two separate user messages, or forgetting one id, gives a 400 error.</p>
  <h3>Writing good tool definitions</h3>
  <ul>
    <li><strong>Name</strong>: specific verb_noun, e.g. <code>get_weather</code>, not <code>weather</code>.</li>
    <li><strong>Description</strong>: the model's only manual. Say what it does <em>and when to call it</em> ("Call this whenever the user asks about weather").</li>
    <li><strong>Schema</strong>: describe each property; use <code>enum</code> for fixed choices; list truly required fields.</li>
    <li><strong><code>strict: true</code></strong> (with <code>additionalProperties: false</code>): arguments are guaranteed to match the schema.</li>
    <li><strong>Errors</strong>: if a tool fails, return the error text with <code>"is_error": true</code> so the model can fix its call or explain. Don't crash the loop. <code>run_tool</code> in section 08 shows this.</li>
  </ul>
  <h3>tool_choice</h3>
  <table class="tbl">
    <tr><th>Value</th><th>Behaviour</th></tr>
    <tr><td><code>{"type": "auto"}</code> (default)</td><td>Model decides whether to call a tool</td></tr>
    <tr><td><code>{"type": "none"}</code></td><td>No tool calls allowed</td></tr>
    <tr><td><code>{"type": "any"}</code> / <code>{"type": "tool", "name": …}</code></td><td>Force a call. <strong>Rejected (400) on claude-opus-5-5</strong> and other current models; works on some older ones</td></tr>
    <tr><td><code>"disable_parallel_tool_use": true</code></td><td>At most one tool call per reply</td></tr>
  </table>
  <p>To make a call very likely on current models: keep <code>auto</code>, say "Use the get_weather tool" in the prompt, set <code>strict: true</code>, and check that a <code>tool_use</code> block actually came back. If you only wanted JSON, use structured outputs instead of a fake tool.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Tool calling</strong> (function calling): you describe functions with a name, a description and a JSON Schema; the model replies with a structured <code>tool_use</code> request; your code executes it and returns a <code>tool_result</code> with the same id.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"The model ran my function." It didn't. It only wrote JSON. Your process executes the code, so you own validation, permissions and timeouts (deep dive in <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a>).</p></div>
  <p>This loop is the seed of every agent (<a class="xref" data-note="agentic">Agent Fundamentals</a>). Interviews ask you to "walk through one tool call, naming every message", which is exactly the four shapes above.</p>

  <h2 id="la-cache"><span class="num">06</span>Prompt Caching</h2>
  <p>A support bot sends a 20,000-token policy manual as the system prompt on every call, followed by a 200-token question. You pay to process the same manual again and again, and every call waits for it to be read. Agents and RAG apps do this all day.</p>
  <p><strong>Prompt caching</strong> lets the server keep the processed version of a prompt <em>prefix</em> (the beginning of the request) for a few minutes. The next call that starts with exactly the same bytes reuses it: much cheaper and faster for that part.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A tuition teacher who has already read chapters 1–10 of your textbook only needs to read chapter 11 today. But if you change one word on page 1, they insist on re-reading everything from page 1 onward.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <text x="70" y="33" text-anchor="end" class="tm">call 1</text>
    <rect x="80" y="15" width="110" height="26" class="fs"/><text x="135" y="33" text-anchor="middle">tools</text>
    <rect x="190" y="15" width="170" height="26" class="fs"/><text x="275" y="33" text-anchor="middle">system + docs</text>
    <rect x="360" y="15" width="140" height="26" class="fs"/><text x="430" y="33" text-anchor="middle">messages</text>
    <line x1="360" y1="8" x2="360" y2="50" class="sr" stroke-width="2"/><text x="364" y="12" class="tr" font-size="11">cache_control</text>
    <text x="508" y="33" class="tm">write 1.25×</text>
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
  <h3>Worked example: is it worth it?</h3>
  <p>On <code>claude-opus-5-5</code>, normal input costs $4 per million tokens, a 5-minute cache write costs 1.25× ($5), and a cache read costs $0.20 (0.05×). Take a 20,000-token prefix, a 200-token question, and 10 calls within 5 minutes.</p>
  <div class="fx" data-lang="py"># claude-opus-5-5 prices per 1M input tokens
BASE, WRITE_5M, READ = 4.00, 4.00 * 1.25, 0.20     # read = $0.20 (0.05x)

prefix, question, calls = 20_000, 200, 10          # tokens; calls within 5 minutes

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
  <p>Call 1 pays a little <em>extra</em> (the write premium). Every later call pays 0.05× for the 20,000 cached tokens and full price only for the 200 new ones. Two calls within the time-to-live already beat no caching; ten calls save 82%. Latency drops too, because the cached part is not re-processed.</p>
  <p>In code you mark the end of the stable part with a <code>cache_control</code> breakpoint. Everything up to and including that block is cached.</p>
  <div class="fx" data-lang="py">response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    tools=TOOLS,                                  # rendered 1st
    system=[{"type": "text", "text": LONG_POLICY_DOC,   # rendered 2nd
             "cache_control": {"type": "ephemeral"}}],  # breakpoint: cache tools + system
    messages=messages,                            # rendered 3rd: changes every turn
)
u = response.usage
print(u.cache_creation_input_tokens,   # written to cache this call (1.25x price)
      u.cache_read_input_tokens,       # served from cache (small fraction of price)
      u.input_tokens)                  # uncached remainder (full price)

# Simplest option for chats: top-level automatic caching of the growing prefix
client.messages.create(model="claude-opus-5-5", max_tokens=1024,
                       cache_control={"type": "ephemeral"},
                       system=SYSTEM, messages=messages)</div>
  <p><em>Example output (first call, then the second call a minute later):</em></p>
  <div class="fx" data-lang="text">20412 0 37
0 20412 52</div>
  <p>The three usage numbers are how you verify caching. First call: 20,412 tokens written, 0 read. Second call: 0 written, 20,412 read. If <code>cache_read_input_tokens</code> stays 0 on repeat calls, something in the prefix is changing.</p>
  <ul>
    <li><strong>Prefix match</strong>: render order is <code>tools → system → messages</code>. Any byte change invalidates everything after it.</li>
    <li><strong>Limits</strong>: up to 4 breakpoints; a minimum prefix length (model-dependent, from 512 tokens up); shorter prefixes silently don't cache. A read refreshes the 5-minute timer; a 1-hour TTL costs 2× to write.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Prompt caching</strong>: server-side reuse of an identical request prefix across API calls, billed at a discounted read rate after one premium write. Not the same as the KV cache inside one generation (<a class="xref" data-note="llm_basics">How LLMs Work</a>).</p></div>
  <div class="callout trap"><span class="label">Trap: silent invalidators</span><p><code>datetime.now()</code> or a user id in the system prompt, <code>json.dumps</code> without <code>sort_keys</code>, a tool list that varies per user. Requests still succeed; the bill just grows. Check <code>cache_read_input_tokens &gt; 0</code> on the second call.</p></div>

  <h2 id="la-scale"><span class="num">07</span>Batches, Limits &amp; Retries</h2>
  <p>Two production problems appear as soon as volume grows. First, you need to label 50,000 product reviews tonight, and paying full price for work nobody waits on feels wasteful. Second, at peak traffic the API starts returning errors like 429 "rate limited" and 529 "overloaded", and your service crashes with them.</p>
  <h3>Message Batches: bulk at half price</h3>
  <p>The <strong>Batch API</strong> takes many requests at once, processes them in the background (usually within an hour, at most 24 hours), and charges 50% less. You poll until it is done, then read results.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Dropping a bag of clothes at the dhobi versus ironing each shirt at a shop while you wait. The dhobi is much cheaper and returns everything by tomorrow, but not in the order you handed them over, so every shirt has a tag.</p></div>
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
  <p><em>Example output (order may differ):</em></p>
  <div class="fx" data-lang="text">review-1 positive
review-0 negative
review-2 neutral</div>
  <p>Each request carries a <code>custom_id</code> (the shirt tag) and the same <code>params</code> you'd pass to <code>messages.create</code>. The <code>while</code> loop polls once a minute. Results come back in any order, so the code prints <code>entry.custom_id</code> with each one and handles the failure types separately.</p>
  <h3>Rate limits and retries</h3>
  <p>Providers cap requests per minute and tokens per minute. Exceed them and you get <strong>429</strong>. Overload or server bugs give <strong>5xx</strong> (529 = overloaded). These are <em>transient</em>: the same request will probably work a bit later. A <strong>400</strong> means your request itself is wrong; repeating it will fail forever.</p>
  <p>The standard fix for transient errors is <strong>exponential backoff with jitter</strong>: wait 1 s, then up to 2 s, 4 s, 8 s…, and pick a random time within each window so that a hundred workers don't all retry at the same instant. The script prints the waiting ceilings and two workers' random delays.</p>
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
    print(status, "retry" if status in RETRYABLE else "fix the request, do not retry")</div>
  <div class="fx" data-lang="text">ceiling : [1.0, 2.0, 4.0, 8.0, 16.0, 30.0]
worker A: [0.13, 1.69, 3.06, 2.04, 7.93, 13.48]
worker B: [0.96, 1.9, 0.23, 0.68, 13.37, 22.08]
400 fix the request, do not retry
401 fix the request, do not retry
429 retry
529 retry</div>
  <p>The ceiling doubles each attempt until the cap of 30 s. Workers A and B pick different random waits under the same ceiling, which spreads their retries out. The <code>RETRYABLE</code> set is the important design decision. You rarely write this loop yourself: the SDK already retries connection errors, 408, 409, 429 and 5xx with exponential backoff (2 retries by default). You tune it and catch what is left:</p>
  <div class="fx" data-lang="py">client = anthropic.Anthropic(max_retries=4, timeout=60.0)   # SDK default: 2 retries

try:
    response = client.messages.create(model="claude-opus-5-5", max_tokens=1024,
                                      messages=messages)
except anthropic.BadRequestError as e:     # 400: fix the request, never retry
    raise
except anthropic.RateLimitError as e:      # 429 even after retries
    wait = int(e.response.headers.get("retry-after", "60"))
except anthropic.APIStatusError as e:      # other HTTP errors, e.g. 5xx
    print(e.status_code, e.response.headers.get("request-id"))</div>
  <p>The <code>except</code> clauses go from most specific to most general. <code>retry-after</code> is the server telling you how long to wait; respect it. The <code>request-id</code> header is what support asks for when you report a problem.</p>
  <h3>Token counting</h3>
  <p>Before sending a huge prompt, count it. The endpoint is free and uses the model's real tokenizer, including the tool schemas, which also cost input tokens.</p>
  <div class="fx" data-lang="py">count = client.messages.count_tokens(
    model="claude-opus-5-5",
    system=SYSTEM,
    tools=TOOLS,                  # tool schemas cost input tokens too
    messages=messages,
)
print(count.input_tokens)         # use it to trim history before sending</div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Rate limit</strong>: a cap on requests or tokens per minute per account. <strong>Exponential backoff with jitter</strong>: retry waits that double each time, randomised within each window. <strong>Transient error</strong>: one that may succeed if retried (429, 5xx); a 4xx client error other than 408/409/429 is not.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Batch results aren't in request order: match them by <code>custom_id</code>. And retrying a 400 in a loop just burns time and quota; log it and fix the request.</p></div>

  <h2 id="la-build"><span class="num">08</span>Build It: Weather + Calculator Assistant</h2>
  <p>Now combine everything: a complete, hand-written tool loop with two tools. Ask it "How much warmer is Mumbai than Delhi, in Fahrenheit degrees?" and it needs both tools: weather for two cities, then exact arithmetic. The weather tool reads a small dict standing in for a real weather API. The calculator parses arithmetic with Python's <code>ast</code> module instead of <code>eval</code>, because its input is written by the model, and model output can be steered by prompt injection.</p>
  <p>The file has three parts: (1) plain Python functions, (2) the schemas the model sees, (3) the loop. Save it as <code>assistant.py</code>.</p>
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
    for step in range(1, max_steps + 1):
        response = client.messages.create(
            model=MODEL, max_tokens=4096, tools=TOOLS, messages=messages,
            system="You are a concise assistant. Use tools for weather and math.",
        )
        calls = [b for b in response.content if b.type == "tool_use"]
        print(f"step {step}: stop_reason={response.stop_reason}",
              [f"{b.name}({b.input})" for b in calls])
        if response.stop_reason != "tool_use":   # end_turn, max_tokens, refusal...
            return "".join(b.text for b in response.content if b.type == "text")
        messages.append({"role": "assistant", "content": response.content})
        results = [run_tool(b) for b in calls]
        messages.append({"role": "user", "content": results})   # ALL results, ONE message
    return "Stopped: too many tool steps."

if __name__ == "__main__":
    print(ask("How much warmer is Mumbai than Delhi right now, in Fahrenheit degrees?"))</div>
  <p>Walk through the important pieces by name:</p>
  <ul>
    <li><code>REGISTRY</code> maps the tool name the model writes to the Python function to run. Adding a tool = a function + a schema + one registry entry.</li>
    <li><code>run_tool</code> wraps every call in <code>try/except</code>. A bad city or a forbidden expression becomes a <code>tool_result</code> with <code>is_error: True</code>, so the model can recover instead of the program crashing.</li>
    <li><code>ask</code> is the loop from section 05: call, check <code>stop_reason</code>, append the assistant turn whole, run all tools, append all results in one message, repeat.</li>
    <li><code>max_steps</code> is a safety guard: a confused model cannot loop forever and run up a bill.</li>
    <li><code>_eval</code> only accepts numbers and the operators in <code>OPS</code>. Anything else, including <code>__import__('os')</code>, raises an error.</li>
  </ul>
  <h3>Test 1: the tools, without the API</h3>
  <p>Tool functions are plain Python, so test them like any function before a model ever calls them. Fake <code>tool_use</code> blocks (built with <code>SimpleNamespace</code>) test the error path.</p>
  <div class="fx" data-lang="py">from assistant import get_weather, calculator, run_tool
import types

print(get_weather("Mumbai", "celsius"))
print(get_weather("Delhi", "fahrenheit"))
print(calculator("(31 - 24) * 9 / 5"))

bad_city = types.SimpleNamespace(id="toolu_x", name="get_weather",
                                 input={"city": "Paris", "unit": "celsius"})
bad_expr = types.SimpleNamespace(id="toolu_y", name="calculator",
                                 input={"expression": "__import__('os')"})
print(run_tool(bad_city))
print(run_tool(bad_expr))</div>
  <div class="fx" data-lang="text">{"city": "Mumbai", "temp": 31, "unit": "celsius", "condition": "humid, light rain"}
{"city": "Delhi", "temp": 75, "unit": "fahrenheit", "condition": "clear"}
12.6
{'type': 'tool_result', 'tool_use_id': 'toolu_x', 'content': "Error: Unknown city 'Paris'. Known: ['delhi', 'london', 'mumbai']", 'is_error': True}
{'type': 'tool_result', 'tool_use_id': 'toolu_y', 'content': 'Error: Only numbers and + - * / % ** are allowed', 'is_error': True}</div>
  <p>Delhi's 24 °C becomes round(75.2) = 75 °F. The two error results show exactly what the model would receive: a useful message, flagged as an error, with the matching id. The injected <code>__import__('os')</code> is rejected instead of executed.</p>
  <h3>Test 2: the whole loop, with a scripted fake model</h3>
  <p>Testing the loop against a live model is slow, costs money and gives different output every run. Instead, swap <code>assistant.client</code> for a fake whose <code>messages.create</code> returns replies you scripted, step by step. The script also records the last message of every request, so you can see what your loop sent back.</p>
  <div class="fx" data-lang="py">from types import SimpleNamespace as NS
import assistant

def tool_use(id, name, **inp):
    return NS(type="tool_use", id=id, name=name, input=inp)

SCRIPT = [                     # scripted model replies, one per call
    NS(stop_reason="tool_use", content=[
        tool_use("t1", "get_weather", city="Mumbai", unit="celsius"),
        tool_use("t2", "get_weather", city="Delhi", unit="celsius")]),
    NS(stop_reason="tool_use", content=[
        tool_use("t3", "calculator", expression="(31 - 24) * 9 / 5")]),
    NS(stop_reason="end_turn", content=[
        NS(type="text", text="Mumbai is about 12.6 °F warmer than Delhi.")]),
]
sent = []                      # the last message of every request we send

class FakeMessages:
    def create(self, **kwargs):
        sent.append(kwargs["messages"][-1])
        return SCRIPT.pop(0)

assistant.client = NS(messages=FakeMessages())      # swap the real client out
print(assistant.ask("How much warmer is Mumbai than Delhi, in Fahrenheit degrees?"))
for i, m in enumerate(sent, 1):
    c = m["content"]
    print(f"request {i} ends with:", c if isinstance(c, str)
          else [(r["tool_use_id"], r["content"]) for r in c])</div>
  <div class="fx" data-lang="text">step 1: stop_reason=tool_use ["get_weather({'city': 'Mumbai', 'unit': 'celsius'})", "get_weather({'city': 'Delhi', 'unit': 'celsius'})"]
step 2: stop_reason=tool_use ["calculator({'expression': '(31 - 24) * 9 / 5'})"]
step 3: stop_reason=end_turn []
Mumbai is about 12.6 °F warmer than Delhi.
request 1 ends with: How much warmer is Mumbai than Delhi, in Fahrenheit degrees?
request 2 ends with: [('t1', '{"city": "Mumbai", "temp": 31, "unit": "celsius", "condition": "humid, light rain"}'), ('t2', '{"city": "Delhi", "temp": 24, "unit": "celsius", "condition": "clear"}')]
request 3 ends with: [('t3', '12.6')]</div>
  <p>The model's replies here are scripted, but everything your code did is real: step 1 ran two tools in parallel and sent both results in one message (request 2) with matching ids; step 2 ran the calculator and sent "12.6" back (request 3); step 3 had no tool calls, so <code>ask</code> returned the text. With a live model the steps are usually the same, though wording varies. This style of test belongs in your CI.</p>
  <div class="callout intu"><span class="label">What you just built</span><p>This <code>while stop_reason == "tool_use"</code> loop is the core of every agent. <a class="xref" data-note="agent_build">later notes</a> grow it into a real agent: more tools, memory, planning, approval and logging. The SDK also offers a "tool runner" helper that writes this loop for you once you understand it.</p></div>

  <h2 id="la-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: appending only the text</span><p>Append <code>response.content</code> (all blocks) as the assistant turn. Dropping <code>tool_use</code> or <code>thinking</code> blocks breaks the next call.</p></div>
  <div class="callout trap"><span class="label">Trap: one message per tool result</span><p>All <code>tool_result</code> blocks for one assistant turn go in a single user message, one per <code>tool_use</code> id, nothing missing. Otherwise: 400.</p></div>
  <div class="callout trap"><span class="label">Trap: ignoring stop_reason</span><p>A <code>max_tokens</code> stop means cut-off output; a <code>refusal</code> means no normal answer. Branch on it before parsing or running tools.</p></div>
  <div class="callout trap"><span class="label">Trap: prompt-only JSON in a pipeline</span><p>Use structured outputs (<code>output_config.format</code> or <code>messages.parse</code>) and still validate. Don't use prefill; current models reject it.</p></div>
  <div class="callout trap"><span class="label">Trap: forcing tool_choice on current models</span><p><code>{"type": "any"}</code> or <code>{"type": "tool"}</code> returns 400 on <code>claude-opus-5-5</code>. Use <code>auto</code> + a clear instruction + <code>strict: true</code>, and check a <code>tool_use</code> came back.</p></div>
  <div class="callout trap"><span class="label">Trap: a cache that never hits</span><p>A timestamp or user id early in the prompt, unsorted JSON, or a changing tool list. Keep the prefix byte-identical and check <code>cache_read_input_tokens</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: retrying everything</span><p>Retry 429 and 5xx with backoff and jitter. Never retry a 400; fix the request.</p></div>
  <div class="callout trap"><span class="label">Trap: eval() on tool input</span><p>Tool arguments are model output and can be steered by injected text. Whitelist (like the <code>ast</code> calculator), validate, and limit permissions.</p></div>

  <h2 id="la-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>The API is stateless. How does a chatbot "remember" earlier turns, and what does that cost?</summary><div class="qa-body">The client resends the whole conversation in <code>messages</code> on every call. So input tokens, cost and latency grow each turn (in the example: 340 → 980 tokens per call over 5 turns). Mitigate with prompt caching, trimming or summarising old turns, and keeping long-term facts outside the prompt until needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>response.content</code> a list and not a string?</summary><div class="qa-body">One reply can contain several kinds of blocks: <code>thinking</code>, <code>text</code>, one or more <code>tool_use</code>. Code must loop and check <code>block.type</code>, and must send the whole list back as the assistant turn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your JSON pipeline fails on long inputs only. First thing to check?</summary><div class="qa-body"><code>stop_reason</code>. If it is <code>max_tokens</code>, the output was cut off mid-JSON (thinking tokens count toward the cap too). Raise <code>max_tokens</code>, ask for less, and use structured outputs plus validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does streaming reduce cost or total latency?</summary><div class="qa-body">No. Same tokens, same end time. It reduces the time until the user sees the first words (TTFT), which is what makes chat UIs feel responsive.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through one complete tool call, naming every message.</summary><div class="qa-body">(1) user message + <code>tools</code> schemas. (2) Response: assistant content with a <code>tool_use</code> block (<code>id</code>, <code>name</code>, <code>input</code>), <code>stop_reason: "tool_use"</code>. (3) Your code runs the function. (4) Next request: history + that assistant turn unchanged + a user turn with <code>{"type": "tool_result", "tool_use_id": id, "content": …}</code>. (5) Model answers with <code>end_turn</code>, or calls another tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find the bug: the model asked for 2 tools, and the code appends two user messages, each with one tool_result.</summary><div class="qa-body">All results for one assistant turn must go in a <strong>single</strong> user message right after it, one <code>tool_result</code> per <code>tool_use</code> id. Collect them in a list and append once: <code>messages.append({"role": "user", "content": results})</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your tool raised an exception. What should go back to the model?</summary><div class="qa-body">A <code>tool_result</code> with the same <code>tool_use_id</code>, <code>"is_error": true</code> and a useful message ("Unknown city 'Paris'. Known: delhi, london, mumbai"). The model can then retry with fixed arguments or tell the user. Crashing the loop loses the whole conversation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you guarantee machine-readable JSON from a model?</summary><div class="qa-body">Structured outputs: <code>output_config={"format": {"type": "json_schema", "schema": …}}</code> or <code>client.messages.parse(..., output_format=PydanticModel)</code>. Decoding is constrained to the schema. Still check <code>stop_reason</code> (<code>max_tokens</code> or <code>refusal</code> can cut it short) and validate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need the model to always call <code>extract_invoice</code>. On claude-opus-5-5, <code>tool_choice={"type": "tool", ...}</code> returns 400. What now?</summary><div class="qa-body">Forced tool choice isn't supported on that model. Use <code>auto</code>, instruct the call in the prompt, set <code>strict: true</code>, and verify a <code>tool_use</code> block came back (re-prompt if not). If the tool only existed to get JSON, switch to structured outputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A 20,000-token prefix is sent 10 times in 5 minutes. Roughly how much does caching save on claude-opus-5-5?</summary><div class="qa-body">Without: 10 × 20,200 × $4/1M ≈ $0.81. With: one write at $5/1M ($0.10) + nine reads at $0.20/1M ($0.036) + the new tokens at full price ($0.008) ≈ $0.14. About 82% less.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Prompt caching is on, but <code>cache_read_input_tokens</code> is always 0. Likely causes?</summary><div class="qa-body">Something early in the prefix changes per request: a timestamp or user id in the system prompt, non-deterministic JSON, a varying tool list, or a model switch. Or the prefix is below the minimum cacheable length, or calls are more than the TTL apart. Diff two consecutive request bodies to find the first changing byte.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which errors do you retry, and how?</summary><div class="qa-body">Transient ones: 408, 409, 429, 5xx (529 = overloaded), and connection errors. Use exponential backoff with jitter and honour <code>retry-after</code>; the SDK does this by default (2 retries). Never retry 400/401/403/404: fix the request or credentials.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use the Batch API instead of normal calls?</summary><div class="qa-body">Large offline jobs nobody waits on: labelling a dataset, running evals, nightly summaries. 50% cheaper, but asynchronous (up to 24 h) and results arrive unordered, matched by <code>custom_id</code>. Not for interactive chat.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why parse the calculator input with <code>ast</code> instead of <code>eval</code>?</summary><div class="qa-body">Tool arguments are model output, and model output can be steered by prompt injection. <code>eval("__import__('os').system(...)")</code> would run arbitrary code. Whitelisting AST node types allows only arithmetic. Treat every tool input as untrusted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you test a tool-calling loop in CI without calling the API?</summary><div class="qa-body">Unit-test the tool functions directly, then replace the client with a fake whose <code>create</code> returns scripted replies (tool_use, then end_turn). Assert on what your loop sent back: matching ids, all results in one message, step guard respected. Deterministic, free and fast.</div></details>
</main>`
});
