// notes/genai/agent_build.js — Build an Agent from Scratch
Object.assign(TOPIC_CONTENT, {
  "agent_build": `<main>
  <h1>Build an Agent from Scratch</h1>
  <p class="lead">You know the tool-calling loop (05) and the agent ideas: ReAct, workflows vs agents, memory (08). Now build a real one in plain Python, piece by piece, with nothing hidden. Then rebuild it with the SDK's tool runner and see exactly what frameworks like LangChain and LangGraph (10–11) add on top.</p>

  <h2 id="ab-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Build an Agent from Scratch</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The agent</div>
        <ul>
          <li><b>Data analyst</b> — question about CSVs → explore → pandas → verify → Markdown report</li>
          <li><b>Why an agent</b> — next step depends on data seen (columns, errors, follow-ups)</li>
          <li><b>6 tools</b> — list_files, read_csv_head, run_python, write_report, update_todos, save_note</li>
          <li><b>Files</b> — tools.py · schemas.py · memory.py · agent.py (loop)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 1 · tool functions</div>
        <ul>
          <li><b>Plain Python, tested first</b> — most agent bugs are tool bugs</li>
          <li><b>safe_path</b> — resolve + <code>is_relative_to(ROOT)</code>; blocks <code>../../etc/passwd</code></li>
          <li><b>run_python</b> — subprocess, <code>cwd=ROOT</code>, timeout, <code>env={"PATH": ...}</code> (no API key), last 4,000 chars</li>
          <li><b>Raise with a hint</b> — "Call list_files to see what exists" → loop makes it <code>is_error</code></li>
          <li>⚠ Subprocess ≠ sandbox: still reads files + network → container/VM, no network, limits</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 2 · schemas</div>
        <ul>
          <li><b>Schema = all the model knows</b> — write it like docs for a new teammate</li>
          <li><b>verb_noun names</b> + descriptions that say <em>when</em> ("call first", "once, at the end")</li>
          <li><b><code>strict: true</code> + <code>additionalProperties: false</code></b> — args always match</li>
          <li><b>enum</b> for status; "Requires human approval" in description</li>
          <li><b>Few, focused</b> — 6 clear tools beat 30 overlapping</li>
          <li><b>Narrow vs broad</b> — own tool when you must gate, audit, render</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 3 · memory &amp; planning</div>
        <ul>
          <li><b>Conversation</b> — <code>self.messages</code>, resent each call, one session</li>
          <li><b>Working</b> — <code>TODOS</code> via <code>update_todos</code>, one task; full list each time (idempotent)</li>
          <li><b>Long-term</b> — <code>notes.md</code> via <code>save_note</code>, survives restarts</li>
          <li><b>Load notes once</b> into system prompt → stable prefix → prompt caching works</li>
          <li>💡 Consultant: transcript · sticky-note checklist · notebook</li>
          <li>⚠ Saving everything: stale "facts" re-injected forever; never secrets</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 4 · the loop</div>
        <ul>
          <li><b>Call</b> — <code>messages.create(system, tools, messages, cache_control)</code></li>
          <li><b>stop_reason</b>
            <ul><li><code>end_turn</code> → append, return text</li><li><code>tool_use</code> → run all, results in ONE user msg</li><li><code>max_tokens</code>/<code>refusal</code> → drop turn, stop</li></ul>
          </li>
          <li><b>Guard</b> — <code>for step in range(max_steps)</code></li>
          <li><b>Errors</b> — try/except → <code>is_error: true</code> result</li>
          <li><b>Approval</b> — <code>NEEDS_APPROVAL</code>; "no" returns as error</li>
          <li><b>Log</b> — JSONL per step: stop_reason, tokens, tool, input, error</li>
          <li>⚠ Dangling <code>tool_use</code> without <code>tool_result</code> → next call 400</li>
          <li>⚠ Step counter/time in system prompt breaks caching</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 5 · run it</div>
        <ul>
          <li><b>Trace</b> — todos + list_files in parallel → wrong path error → self-correct → code → report</li>
          <li><b>Answer</b> — South 50,700, driven by Laptops 40,800</li>
          <li><b>Second chat()</b> works because <code>self.messages</code> keeps turn 1</li>
          <li><b>Extend</b> — plot tool, smarter approval, token budget, regression test</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 6 · SDK tool runner</div>
        <ul>
          <li><b><code>@beta_tool</code></b> — schema from type hints + docstring <code>Args:</code></li>
          <li><b><code>client.beta.messages.tool_runner(..., max_iterations=15)</code></b> owns the loop</li>
          <li><b>Free</b> — input validation, exceptions → <code>is_error</code>, results appended</li>
          <li><b>Approval</b> — gate <em>inside</em> the tool function</li>
          <li>⚠ Doesn't auto-resume <code>pause_turn</code> (server tools)</li>
          <li><b>Default</b> to the runner; hand loop to learn or for custom control</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">What frameworks add</div>
        <ul>
          <li><b>Same core loop</b> + infrastructure</li>
          <li><b>Persistence</b> — checkpointers, resume after crash (LangGraph 11)</li>
          <li><b>Control flow</b> — explicit graphs, branches, subgraphs</li>
          <li><b>HITL</b> — interrupts across requests instead of blocking <code>input()</code></li>
          <li><b>Tracing</b> (LangSmith/OTel), <b>provider swap</b> (LangChain), <b>MCP</b>, <b>streaming</b></li>
          <li><b>Switch when</b> durable state, branching, cross-request approval, multi-agent</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ab-spec"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Agent We'll Build</span><span class="rm-sub">Data analyst in a sandbox</span></div></div>
      <div class="rm-item rm-done" data-target="ab-tools"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Step 1: Tool Functions</span><span class="rm-sub">Real code, tested first</span></div></div>
      <div class="rm-item rm-done" data-target="ab-schema"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Step 2: Tool Schemas</span><span class="rm-sub">Names, descriptions, strict</span></div></div>
      <div class="rm-item rm-done" data-target="ab-mem"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Step 3: Memory &amp; Planning</span><span class="rm-sub">History, notes file, todos</span></div></div>
      <div class="rm-item rm-done" data-target="ab-loop"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Step 4: The Agent Loop</span><span class="rm-sub">Guard, errors, approval, logs</span></div></div>
      <div class="rm-item rm-done" data-target="ab-run"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Step 5: Run It</span><span class="rm-sub">A trace, read step by step</span></div></div>
      <div class="rm-item rm-done" data-target="ab-runner"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Step 6: SDK Tool Runner</span><span class="rm-sub">Same agent, no hand loop</span></div></div>
      <div class="rm-item rm-done" data-target="ab-fw"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">What Frameworks Add</span><span class="rm-sub">Bridge to LangChain/LangGraph</span></div></div>
      <div class="rm-item rm-done" data-target="ab-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ab-spec"><span class="num">01</span>The Agent We'll Build</h2>
  <p>A <strong>data analyst agent</strong>: give it a question about CSV files in a folder, and it explores the data, writes and runs pandas code, checks its numbers and saves a Markdown report.</p>
  <p>Why an agent, not a workflow (08)? The next step depends on the data: which columns exist, whether code fails, whether a follow-up is needed.</p>
  <div class="cards">
    <div><b>list_files</b><p>See what's in the workspace.</p><small>read-only</small></div>
    <div><b>read_csv_head</b><p>Row count, header, first rows.</p><small>read-only</small></div>
    <div><b>run_python</b><p>Run a script in a subprocess with a timeout.</p><small>dangerous → human approval</small></div>
    <div><b>write_report</b><p>Save a <code>.md</code> report.</p><small>writes, confined to reports/</small></div>
    <div><b>update_todos</b><p>The model's own plan.</p><small>working memory</small></div>
    <div><b>save_note</b><p>Facts for future sessions.</p><small>long-term memory</small></div>
  </div>
<figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="ab-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="10" y="104">user</text><line x1="44" y1="100" x2="58" y2="100" stroke="currentColor" marker-end="url(#ab-a1)"/><rect x="60" y="75" width="120" height="50" rx="6" class="fb sb"/><text x="120" y="98" text-anchor="middle" font-weight="bold">agent.py</text><text x="120" y="112" text-anchor="middle" font-size="10" class="tm">the loop</text><rect x="230" y="8" width="140" height="44" rx="6" class="fv"/><text x="300" y="28" text-anchor="middle" font-weight="bold">Claude API</text><text x="300" y="42" text-anchor="middle" font-size="10" class="tm">messages.create</text><rect x="410" y="8" width="170" height="44" rx="6" class="fs"/><text x="495" y="28" text-anchor="middle" font-weight="bold">schemas.py</text><text x="495" y="42" text-anchor="middle" font-size="10" class="tm">TOOLS = what model sees</text><line x1="408" y1="30" x2="372" y2="30" stroke="currentColor" marker-end="url(#ab-a1)"/><line x1="150" y1="75" x2="228" y2="40" stroke="currentColor" marker-end="url(#ab-a1)"/><line x1="232" y1="50" x2="168" y2="77" stroke="currentColor" stroke-opacity=".5" marker-end="url(#ab-a1)"/><rect x="230" y="80" width="140" height="44" rx="6" class="ft st"/><text x="300" y="100" text-anchor="middle" font-weight="bold">tools.py</text><text x="300" y="114" text-anchor="middle" font-size="10" class="tm">list·read·run·write</text><rect x="230" y="142" width="140" height="44" rx="6" class="fg sg"/><text x="300" y="162" text-anchor="middle" font-weight="bold">memory.py</text><text x="300" y="176" text-anchor="middle" font-size="10" class="tm">todos · notes</text><line x1="180" y1="102" x2="228" y2="102" stroke="currentColor" marker-end="url(#ab-a1)"/><text x="204" y="96" text-anchor="middle" font-size="10" class="tr">gate</text><path d="M150,125 V164 H228" fill="none" stroke="currentColor" marker-end="url(#ab-a1)"/><rect x="400" y="70" width="190" height="124" rx="8" fill="none" class="sr" stroke-dasharray="5 4"/><text x="410" y="88" font-size="11" class="tr">workspace/ = ROOT</text><text x="414" y="106" font-size="11">data/sales.csv</text><text x="414" y="123" font-size="11">reports/*.md</text><text x="414" y="140" font-size="11">notes.md</text><text x="414" y="157" font-size="11">_agent_log.jsonl</text><text x="414" y="174" font-size="11">_scratch.py</text><line x1="370" y1="102" x2="398" y2="102" stroke="currentColor" marker-end="url(#ab-a1)"/><line x1="370" y1="164" x2="398" y2="164" stroke="currentColor" marker-end="url(#ab-a1)"/></svg><figcaption>agent.py talks to the API and dispatches tools; every file the agent touches lives inside one root folder (red dashed). "gate" = human approval for run_python.</figcaption></figure>
  <p>Sample data, created once:</p>
  <div class="fx" data-lang="py">from pathlib import Path

CSV = """date,region,product,units,price
2024-01-15,North,Laptop,11,800
2024-01-15,North,Phone,5,500
2024-01-15,North,Lamp,13,40
2024-01-15,South,Laptop,21,800
2024-01-15,South,Phone,2,500
2024-01-15,South,Lamp,3,40
2024-01-15,West,Laptop,27,800
2024-01-15,West,Phone,18,500
2024-01-15,West,Lamp,4,40
2024-02-15,North,Laptop,12,800
2024-02-15,North,Phone,19,500
2024-02-15,North,Lamp,2,40
2024-02-15,South,Laptop,30,800
2024-02-15,South,Phone,17,500
2024-02-15,South,Lamp,7,40
2024-02-15,West,Laptop,2,800
2024-02-15,West,Phone,3,500
2024-02-15,West,Lamp,14,40
"""
Path("workspace/data").mkdir(parents=True, exist_ok=True)
Path("workspace/data/sales.csv").write_text(CSV)</div>

  <h2 id="ab-tools"><span class="num">02</span>Step 1: Tool Functions</h2>
  <p>Tools are ordinary Python. Write and test them <em>before</em> any model is involved: most agent bugs are tool bugs.</p>
  <div class="fx" data-lang="py">import csv, json, subprocess, sys
from pathlib import Path

ROOT = Path("workspace").resolve()        # the ONLY folder the agent may touch
ROOT.mkdir(exist_ok=True)

def safe_path(rel: str) -&gt; Path:
    """Resolve a model-supplied path and refuse anything outside ROOT."""
    p = (ROOT / rel).resolve()
    if not p.is_relative_to(ROOT):
        raise ValueError(f"Path '{rel}' escapes the workspace")
    return p

def list_files(subdir: str = ".") -&gt; str:
    d = safe_path(subdir)
    files = [str(p.relative_to(ROOT)) for p in sorted(d.rglob("*"))
             if p.is_file() and not p.name.startswith("_")]
    return "\\n".join(files) or "(empty)"

def read_csv_head(path: str, n: int = 5) -&gt; str:
    p = safe_path(path)
    if not p.exists():
        raise FileNotFoundError(f"No file '{path}'. Call list_files to see what exists.")
    with open(p, newline="") as f:
        rows = list(csv.reader(f))
    header, body = rows[0], rows[1:]
    head = "\\n".join(",".join(r) for r in [header] + body[:n])
    return f"{len(body)} rows x {len(header)} cols\\n{head}"

def run_python(code: str, timeout_s: int = 10) -&gt; str:
    """Run code in a separate process, inside ROOT, with a timeout."""
    script = ROOT / "_scratch.py"
    script.write_text(code)
    try:
        r = subprocess.run([sys.executable, "-I", script.name], cwd=ROOT,
                           capture_output=True, text=True, timeout=timeout_s,
                           env={"PATH": "/usr/bin:/bin"})
    except subprocess.TimeoutExpired:
        raise TimeoutError(f"Code ran longer than {timeout_s}s and was killed")
    out = (r.stdout + r.stderr)[-4000:]           # cap what goes back to the model
    if r.returncode != 0:
        raise RuntimeError(f"Exit code {r.returncode}\\n{out}")
    return out or "(no output)"

def write_report(filename: str, markdown: str) -&gt; str:
    if not filename.endswith(".md"):
        raise ValueError("Reports must be .md files")
    p = safe_path(f"reports/{filename}")
    p.parent.mkdir(exist_ok=True)
    p.write_text(markdown)
    return f"Wrote {p.relative_to(ROOT)} ({len(markdown)} chars)"</div>
<figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="ab-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="20" y="14" width="400" height="176" rx="8" fill="none" class="sr" stroke-width="1.5"/><text x="30" y="30" font-size="11" class="tr">1 · human approval gate</text><rect x="40" y="40" width="360" height="142" rx="8" fill="none" class="sb" stroke-width="1.5"/><text x="50" y="56" font-size="11" class="tb">2 · subprocess + timeout (kills runaways)</text><rect x="60" y="66" width="320" height="108" rx="8" fill="none" class="st" stroke-width="1.5"/><text x="70" y="82" font-size="11">3 · cwd=ROOT + safe_path (no ../ escape)</text><rect x="80" y="92" width="280" height="74" rx="8" fill="none" class="sg" stroke-width="1.5"/><text x="90" y="108" font-size="11" class="tg">4 · env={"PATH": …} (no API key)</text><rect x="140" y="122" width="160" height="32" rx="6" class="fs"/><text x="220" y="142" text-anchor="middle" font-weight="bold">model-written code</text><path d="M300,138 H470 V112" fill="none" stroke="currentColor" marker-end="url(#ab-a2)"/><rect x="430" y="56" width="160" height="54" rx="6" class="fb sb"/><text x="510" y="78" text-anchor="middle" font-weight="bold">5 · output cap</text><text x="510" y="94" text-anchor="middle" font-size="10" class="tm">last 4,000 chars → model</text><text x="430" y="160" font-size="11" class="tr">still NOT a sandbox:</text><text x="430" y="175" font-size="11" class="tr">files + network open</text><text x="430" y="190" font-size="10" class="tm">→ container / VM in prod</text></svg><figcaption>Every model-supplied path and script is untrusted, so run_python sits inside four layers and only a capped slice of output returns.</figcaption></figure>
  <p><strong>Errors are raised with a hint</strong> ("Call list_files to see what exists"); the loop turns them into <code>is_error</code> results the model can act on.</p>
  <div class="callout trap"><span class="label">Trap</span><p>A subprocess is <em>not</em> a real sandbox. The code can still read any file your user can, and open network connections. In production run it in a container or VM with no network and resource limits, or use a hosted code-execution tool (14 covers this).</p></div>
  <p>Test every success and failure path. Real output from this environment:</p>
  <div class="fx" data-lang="py">from tools import list_files, read_csv_head, run_python, write_report
from memory import update_todos

def check(fn, *args, **kw):
    try:
        print(f"OK   {fn.__name__}: {fn(*args, **kw)}")
    except Exception as e:                      # what the agent would see as is_error
        print(f"ERR  {fn.__name__}: {type(e).__name__}: {str(e).splitlines()[-1]}")

check(list_files, ".")
check(read_csv_head, "data/sales.csv", 2)
check(read_csv_head, "sales.csv")                         # wrong path
check(read_csv_head, "../../etc/passwd")                  # escape attempt
check(run_python, "import pandas as pd\\n"
      "df = pd.read_csv('data/sales.csv')\\n"
      "print((df.units * df.price).groupby(df.region).sum().idxmax())")
check(run_python, "print(1/0)")                           # crash
check(run_python, "while True: pass", timeout_s=2)        # runaway
check(run_python, "import os; print(sorted(os.environ))") # no API key leaks
check(write_report, "summary.txt", "x")                   # wrong type
check(update_todos, [{"task": "Inspect data", "status": "done"},
                     {"task": "Revenue by region", "status": "in_progress"}])</div>
  <div class="fx" data-lang="txt">OK   list_files: data/sales.csv
OK   read_csv_head: 18 rows x 5 cols
date,region,product,units,price
2024-01-15,North,Laptop,11,800
2024-01-15,North,Phone,5,500
ERR  read_csv_head: FileNotFoundError: No file 'sales.csv'. Call list_files to see what exists.
ERR  read_csv_head: ValueError: Path '../../etc/passwd' escapes the workspace
OK   run_python: South

ERR  run_python: RuntimeError: ZeroDivisionError: division by zero
ERR  run_python: TimeoutError: Code ran longer than 2s and was killed
OK   run_python: ['LC_CTYPE', 'PATH']

ERR  write_report: ValueError: Reports must be .md files
OK   update_todos: [x] Inspect data
[~] Revenue by region</div>

  <h2 id="ab-schema"><span class="num">03</span>Step 2: Tool Schemas</h2>
  <p>The schema is all the model knows about a tool. Treat descriptions like documentation for a new teammate: what it does, <em>when</em> to call it, what to pass.</p>
  <div class="fx" data-lang="py">def tool(name, description, props, required):
    return {"name": name, "description": description, "strict": True,
            "input_schema": {"type": "object", "properties": props,
                             "required": required, "additionalProperties": False}}

S = {"type": "string"}
TOOLS = [
    tool("list_files", "List files in the workspace. Call this first to see what data exists.",
         {"subdir": {**S, "description": "Folder relative to the workspace; '.' for all"}},
         ["subdir"]),
    tool("read_csv_head", "Show row count, header and first n rows of a CSV. "
         "Call before writing code so you know the column names.",
         {"path": S, "n": {"type": "integer", "description": "Rows to show (5 is enough)"}},
         ["path", "n"]),
    tool("run_python", "Run a Python script in the workspace folder and return stdout. "
         "pandas is installed. Print every result you need; nothing else is returned. "
         "Requires human approval.",
         {"code": {**S, "description": "A complete script"}}, ["code"]),
    tool("write_report", "Save the final Markdown report. Call once, at the end.",
         {"filename": {**S, "description": "e.g. sales_summary.md"}, "markdown": S},
         ["filename", "markdown"]),
    tool("update_todos", "Write your plan as a todo list. Call at the start, then again "
         "whenever a task changes status. Always send the FULL list.",
         {"todos": {"type": "array", "items": {
             "type": "object",
             "properties": {"task": S, "status": {"type": "string",
                            "enum": ["pending", "in_progress", "done"]}},
             "required": ["task", "status"], "additionalProperties": False}}},
         ["todos"]),
    tool("save_note", "Save a durable fact for future sessions (data quirks, user "
         "preferences). Not for temporary results.", {"note": S}, ["note"]),
]</div>
  <table class="tbl">
    <tr><th>Choice</th><th>Why</th></tr>
    <tr><td>Verb_noun names</td><td><code>read_csv_head</code> tells the model exactly what happens; <code>data</code> doesn't.</td></tr>
    <tr><td>"Call this first / at the end / once"</td><td>Trigger conditions in descriptions raise correct-call rates more than any other wording.</td></tr>
    <tr><td><code>strict: true</code> + <code>additionalProperties: false</code></td><td>Arguments always match the schema, so no <code>KeyError</code> on a missing field. Here every field is required to keep that simple.</td></tr>
    <tr><td><code>enum</code> for status</td><td>The model can't invent "kinda done".</td></tr>
    <tr><td>"Requires human approval" in the description</td><td>The model knows a refusal is possible and plans for it.</td></tr>
    <tr><td>Few, focused tools</td><td>6 clear tools beat 30 overlapping ones; each extra schema costs tokens and confuses selection.</td></tr>
  </table>
  <div class="callout intu"><span class="label">Bash vs dedicated tools</span><p><code>run_python</code> is a broad "do anything" tool; <code>write_report</code> is narrow. Narrow tools give your code typed arguments to check, gate and log. Promote an action to its own tool when you need to gate, audit or render it.</p></div>

  <h2 id="ab-mem"><span class="num">04</span>Step 3: Memory &amp; Planning</h2>
  <p>Three kinds of memory (types defined in 08): conversation (short-term), working memory (the plan), long-term.</p>
<figure class="viz"><svg viewBox="0 0 600 152" width="600"><line x1="130" y1="128" x2="590" y2="128" stroke="currentColor" stroke-opacity=".4"/><text x="590" y="144" text-anchor="end" font-size="10" class="tm">time →</text><line x1="355" y1="6" x2="355" y2="132" stroke="currentColor" class="sr" stroke-dasharray="4 3"/><text x="355" y="144" text-anchor="middle" font-size="10" class="tr">process restart</text><text x="10" y="22" font-weight="bold" font-size="11">self.messages</text><text x="10" y="36" font-size="10" class="tm">resent each call</text><rect x="130" y="10" width="215" height="28" rx="5" class="fb sb"/><text x="237.5" y="28" text-anchor="middle" font-size="10">session 1</text><rect x="370" y="10" width="215" height="28" rx="5" class="fb sb"/><text x="477.5" y="28" text-anchor="middle" font-size="10">session 2 (fresh)</text><text x="10" y="62" font-weight="bold" font-size="11">TODOS</text><text x="10" y="76" font-size="10" class="tm">update_todos</text><rect x="130" y="50" width="70" height="28" rx="5" class="ft st"/><text x="165" y="68" text-anchor="middle" font-size="10">task A</text><rect x="205" y="50" width="70" height="28" rx="5" class="ft st"/><text x="240" y="68" text-anchor="middle" font-size="10">task B</text><rect x="280" y="50" width="65" height="28" rx="5" class="ft st"/><text x="312.5" y="68" text-anchor="middle" font-size="10">task C</text><rect x="370" y="50" width="90" height="28" rx="5" class="ft st"/><text x="415" y="68" text-anchor="middle" font-size="10">task D</text><text x="10" y="102" font-weight="bold" font-size="11">notes.md</text><text x="10" y="116" font-size="10" class="tm">save_note</text><rect x="130" y="90" width="455" height="28" rx="5" class="fg sg"/><text x="357.5" y="108" text-anchor="middle" font-size="10">loaded once per session · survives restarts</text></svg><figcaption>Three memories, three lifetimes: the conversation dies with the process, the plan lives for one task, notes.md outlives everything.</figcaption></figure>
  <div class="fx" data-lang="py">import json
from tools import ROOT

NOTES = ROOT / "notes.md"                 # survives restarts = long-term memory
TODOS: list[dict] = []                    # lives for one task = working memory

def save_note(note: str) -&gt; str:
    with open(NOTES, "a") as f:
        f.write(f"- {note.strip()}\\n")
    return "Saved."

def load_notes() -&gt; str:
    return NOTES.read_text() if NOTES.exists() else "(no notes yet)"

def update_todos(todos: list[dict]) -&gt; str:
    TODOS[:] = todos                      # model sends the FULL list each time
    marks = {"pending": "[ ]", "in_progress": "[~]", "done": "[x]"}
    return "\\n".join(f"{marks[t['status']]} {t['task']}" for t in TODOS)</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A consultant's day. The meeting transcript is the conversation. The sticky-note checklist is the todo list. The notebook they bring to every client visit is <code>notes.md</code>.</p></div>
  <ul>
    <li><strong>Why a todo tool?</strong> Writing the plan down keeps a long task on track. The plan also lands in the transcript, so you (and the model) can see progress.</li>
    <li><strong>Why the full list each time?</strong> Replacing the whole list is idempotent and can't drift, unlike add/remove operations.</li>
    <li><strong>When to load notes?</strong> Once, at session start, into the system prompt. Reloading per call would change the prompt prefix and break prompt caching (05).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>Saving everything to long-term memory. It fills with stale or wrong "facts" that get re-injected forever. Keep notes durable and few, and never store secrets in them.</p></div>

  <h2 id="ab-loop"><span class="num">05</span>Step 4: The Agent Loop</h2>
  <p>The 05 loop plus five production habits: a step guard, error results, approval, logging and careful <code>stop_reason</code> handling.</p>
<figure class="viz"><svg viewBox="0 0 600 202" width="600"><defs><marker id="ab-a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="20" y="70" width="130" height="44" rx="6" class="fb sb"/><text x="85" y="90" text-anchor="middle" font-weight="bold">messages.create</text><text x="85" y="104" text-anchor="middle" font-size="10" class="tm">system·tools·history</text><rect x="190" y="70" width="110" height="44" rx="6" class="fv"/><text x="245" y="96" text-anchor="middle">stop_reason?</text><line x1="150" y1="92" x2="188" y2="92" stroke="currentColor" marker-end="url(#ab-a4)"/><rect x="350" y="70" width="230" height="44" rx="6" class="fg sg"/><text x="465" y="90" text-anchor="middle" font-weight="bold">return text</text><text x="465" y="104" text-anchor="middle" font-size="10" class="tm">append assistant turn</text><line x1="300" y1="92" x2="348" y2="92" stroke="currentColor" marker-end="url(#ab-a4)" class="sg"/><text x="325" y="106" text-anchor="middle" font-size="10" class="tg">end_turn</text><rect x="350" y="8" width="230" height="44" rx="6" class="fr sr"/><text x="465" y="28" text-anchor="middle" font-weight="bold">drop turn, stop</text><text x="465" y="42" text-anchor="middle" font-size="10" class="tm">max_tokens · refusal</text><path d="M245,70 V30 H348" fill="none" class="sr" stroke="currentColor" marker-end="url(#ab-a4)"/><text x="290" y="24" text-anchor="middle" font-size="10" class="tr">other</text><rect x="170" y="150" width="150" height="44" rx="6" class="ft st"/><text x="245" y="170" text-anchor="middle" font-weight="bold">execute each</text><text x="245" y="184" text-anchor="middle" font-size="10" class="tm">gate→run→is_error</text><line x1="245" y1="114" x2="245" y2="148" stroke="currentColor" marker-end="url(#ab-a4)"/><text x="252" y="136" font-size="10">tool_use</text><path d="M170,172 H85 V116" fill="none" stroke="currentColor" marker-end="url(#ab-a4)"/><text x="78" y="140" text-anchor="end" font-size="10" class="tm">all results</text><text x="78" y="152" text-anchor="end" font-size="10" class="tm">in ONE user</text><text x="78" y="164" text-anchor="end" font-size="10" class="tm">message</text><rect x="350" y="150" width="230" height="44" rx="6" class="fs"/><text x="465" y="170" text-anchor="middle" font-weight="bold">max_steps reached</text><text x="465" y="184" text-anchor="middle" font-size="10" class="tm">stop: guard, partial work</text><line x1="320" y1="172" x2="348" y2="172" stroke="currentColor" marker-end="url(#ab-a4)" class="sr"/></svg><figcaption>One lap = one API call. Only tool_use loops back; every other stop_reason, or the step guard, ends the run.</figcaption></figure>
  <div class="fx" data-lang="py">import json, time
import anthropic
from tools import list_files, read_csv_head, run_python, write_report, ROOT
from memory import save_note, load_notes, update_todos
from schemas import TOOLS

REGISTRY = {"list_files": list_files, "read_csv_head": read_csv_head,
            "run_python": run_python, "write_report": write_report,
            "update_todos": update_todos, "save_note": save_note}
NEEDS_APPROVAL = {"run_python"}            # arbitrary code = dangerous
LOG = ROOT / "_agent_log.jsonl"

SYSTEM = """You are a careful data analyst working in a sandboxed workspace.
Plan with update_todos, inspect data before analysing it, verify numbers with
run_python (never guess), and finish by calling write_report.
If a tool returns an error, read it and fix your next call."""

def log(**event):
    with open(LOG, "a") as f:
        f.write(json.dumps({"ts": round(time.time(), 2), **event}) + "\\n")

def approve(name: str, args: dict) -&gt; bool:
    print(f"\\n--- {name} wants to run ---\\n{args.get('code', args)}")
    return input("Allow? [y/N] ").strip().lower() == "y"

class Agent:
    def __init__(self, model="claude-opus-5-5", max_steps=15, approver=approve):
        self.client = anthropic.Anthropic()
        self.model, self.max_steps, self.approver = model, max_steps, approver
        self.messages = []                 # conversation memory across chat() calls
        # long-term memory is read ONCE per session, so the system prompt stays
        # byte-identical for every call in this session (prompt-cache friendly)
        self.system = SYSTEM + "\\n\\nNotes from earlier sessions:\\n" + load_notes()

    def execute(self, block) -&gt; dict:
        name, args = block.name, block.input
        result = {"type": "tool_result", "tool_use_id": block.id}
        if name in NEEDS_APPROVAL and not self.approver(name, args):
            result.update(content="User declined this action. Ask or try another way.",
                          is_error=True)
        else:
            try:
                result["content"] = REGISTRY[name](**args)
            except Exception as e:
                result.update(content=f"{type(e).__name__}: {e}", is_error=True)
        log(tool=name, input=args, is_error=result.get("is_error", False),
            output=result["content"][:300])
        return result

    def chat(self, user_msg: str) -&gt; str:
        self.messages.append({"role": "user", "content": user_msg})
        for step in range(1, self.max_steps + 1):
            resp = self.client.messages.create(
                model=self.model, max_tokens=16000, system=self.system,
                tools=TOOLS, messages=self.messages,
                cache_control={"type": "ephemeral"})     # cache the growing prefix
            log(step=step, stop_reason=resp.stop_reason,
                in_tok=resp.usage.input_tokens, out_tok=resp.usage.output_tokens)

            if resp.stop_reason == "end_turn":
                self.messages.append({"role": "assistant", "content": resp.content})
                return "".join(b.text for b in resp.content if b.type == "text")
            if resp.stop_reason != "tool_use":
                # max_tokens / refusal: the turn may hold a half-written tool call.
                # Don't keep it (or run it): a tool_use with no tool_result breaks history.
                return f"Stopped: {resp.stop_reason}"

            self.messages.append({"role": "assistant", "content": resp.content})
            results = [self.execute(b) for b in resp.content if b.type == "tool_use"]
            self.messages.append({"role": "user", "content": results})
        return f"Stopped after {self.max_steps} steps (guard). Partial work is in the log."

if __name__ == "__main__":
    agent = Agent()
    print(agent.chat("Which region had the highest revenue in data/sales.csv, "
                     "and which product drove it? Write a short report."))
    print(agent.chat("Now compare January vs February for that region."))</div>
  <h3>What each piece prevents</h3>
  <table class="tbl">
    <tr><th>Piece</th><th>Failure it prevents</th></tr>
    <tr><td><code>max_steps</code> guard</td><td>An agent stuck retrying the same failing call forever, burning money</td></tr>
    <tr><td>try/except → <code>is_error</code></td><td>One bad path crashing the whole run; the model self-corrects instead</td></tr>
    <tr><td>Approval gate</td><td>Generated code running unseen. A "no" goes back as an error so the model can adapt</td></tr>
    <tr><td>Drop the turn on <code>max_tokens</code> / <code>refusal</code></td><td>Running a truncated tool call, or a <code>tool_use</code> with no <code>tool_result</code> poisoning the history (next call = 400)</td></tr>
    <tr><td>JSONL log per step</td><td>"Why did it do that?" with no evidence. Logs feed debugging and evals (13)</td></tr>
    <tr><td><code>cache_control</code></td><td>Paying full price to resend a growing transcript every step</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Putting a step counter or the current time into the system prompt. It changes the prefix, so caching never hits. Keep <code>system</code> and <code>tools</code> byte-identical for the whole session.</p></div>

  <h2 id="ab-run"><span class="num">06</span>Step 5: Run It</h2>
  <div class="fx" data-lang="py">agent = Agent()
print(agent.chat("Which region had the highest revenue in data/sales.csv, "
                 "and which product drove it? Write a short report."))
print(agent.chat("Now compare January vs February for that region."))  # same memory</div>
  <p>A typical trace (example output, will vary). The numbers in it are the true values from the data:</p>
  <div class="fx" data-lang="txt">step 1  update_todos  [~] Inspect data  [ ] Revenue by region  [ ] Write report
        list_files    data/sales.csv                       (both in ONE turn: parallel)
step 2  read_csv_head sales.csv -&gt; is_error: No file 'sales.csv'. Call list_files...
step 3  read_csv_head data/sales.csv -&gt; 18 rows x 5 cols ...       (self-corrected)
step 4  run_python    [approval prompt: y] -&gt; North 31000 / South 50700 / West 34420
step 5  run_python    [approval prompt: y] -&gt; South: Laptop 40800, Phone 9500, Lamp 400
step 6  update_todos  all done;  write_report sales_summary.md;  save_note "revenue = units * price"
step 7  end_turn      "South led with 50,700, driven by Laptops (40,800)..."</div>
  <p>Notice the ReAct pattern (08) in practice: act, observe an error, correct. The second <code>chat()</code> works because <code>self.messages</code> still holds the first task.</p>
  <p>The log from a scripted test run of this loop (a fake client replayed fixed tool calls; tools ran for real):</p>
  <div class="fx" data-lang="txt">{"ts": 1792131618.78, "step": 1, "stop_reason": "tool_use", "in_tok": 10, "out_tok": 5}
{"ts": 1792131618.78, "tool": "read_csv_head", "input": {"path": "sales.csv", "n": 5}, "is_error": true, "output": "FileNotFoundError: No file 'sales.csv'. Call list_files to see what exists."}
{"ts": 1792131618.78, "tool": "run_python", "input": {"code": "import os; os.remove('data/sales.csv')"}, "is_error": true, "output": "User declined this action. Ask or try another way."}</div>
  <h3>Extend it yourself</h3>
  <ul>
    <li>Add a <code>plot_chart</code> tool that saves a PNG to <code>reports/</code>.</li>
    <li>Make approval smarter: auto-approve scripts that only read files, ask for anything else.</li>
    <li>Add a token budget: stop when the summed <code>in_tok + out_tok</code> in the log passes a limit.</li>
    <li>Turn the log into a regression test: same question, assert the report contains "South".</li>
  </ul>

  <h2 id="ab-runner"><span class="num">07</span>Step 6: Same Agent with the SDK Tool Runner</h2>
  <p>The manual loop is ~40 lines you must get right. The SDK's <strong>tool runner</strong> (beta) owns that loop: it calls the API, runs your functions, sends results back and stops when the model stops calling tools.</p>
  <div class="fx" data-lang="py">from typing import Literal, TypedDict
import anthropic
from anthropic import beta_tool
import tools as T, memory as M
from agent import SYSTEM, approve, log

class Todo(TypedDict):
    task: str
    status: Literal["pending", "in_progress", "done"]

@beta_tool
def list_files(subdir: str = ".") -&gt; str:
    """List files in the workspace. Call this first to see what data exists.

    Args:
        subdir: Folder relative to the workspace; '.' for all.
    """
    return T.list_files(subdir)

@beta_tool
def read_csv_head(path: str, n: int = 5) -&gt; str:
    """Show row count, header and first n rows of a CSV. Call before writing code.

    Args:
        path: CSV path relative to the workspace.
        n: Rows to show.
    """
    return T.read_csv_head(path, n)

@beta_tool
def run_python(code: str) -&gt; str:
    """Run a Python script in the workspace and return stdout. pandas is installed.

    Args:
        code: A complete script that prints every result you need.
    """
    if not approve("run_python", {"code": code}):     # human gate INSIDE the tool
        return "User declined this action. Ask or try another way."
    return T.run_python(code)

@beta_tool
def write_report(filename: str, markdown: str) -&gt; str:
    """Save the final Markdown report. Call once, at the end.

    Args:
        filename: e.g. sales_summary.md
        markdown: The report body.
    """
    return T.write_report(filename, markdown)

@beta_tool
def update_todos(todos: list[Todo]) -&gt; str:
    """Write your plan as a todo list; resend the FULL list whenever a status changes.

    Args:
        todos: Every task with its status.
    """
    return M.update_todos(todos)

@beta_tool
def save_note(note: str) -&gt; str:
    """Save a durable fact for future sessions. Not for temporary results.

    Args:
        note: One short sentence.
    """
    return M.save_note(note)

client = anthropic.Anthropic()
runner = client.beta.messages.tool_runner(
    model="claude-opus-5-5",
    max_tokens=16000,
    max_iterations=15,                       # same max-steps guard
    system=SYSTEM + "\\n\\nNotes from earlier sessions:\\n" + M.load_notes(),
    tools=[list_files, read_csv_head, run_python, write_report, update_todos, save_note],
    messages=[{"role": "user", "content": "Which region had the highest revenue "
               "in data/sales.csv? Write a short report."}],
)
for message in runner:                       # one yielded message per model turn
    calls = [b.name for b in message.content if b.type == "tool_use"]
    log(stop_reason=message.stop_reason, tools=calls,
        in_tok=message.usage.input_tokens, out_tok=message.usage.output_tokens)
print("".join(b.text for b in message.content if b.type == "text"))</div>
  <table class="tbl">
    <tr><th>Concern</th><th>Manual loop</th><th>Tool runner</th></tr>
    <tr><td>Tool schema</td><td>Hand-written JSON</td><td>Built from type hints + docstring <code>Args:</code></td></tr>
    <tr><td>Argument validation</td><td><code>strict: true</code></td><td>Inputs validated against the signature before the function runs</td></tr>
    <tr><td>Exceptions</td><td>Your try/except → <code>is_error</code></td><td>Caught automatically → <code>is_error</code> result</td></tr>
    <tr><td>Max steps</td><td>Your <code>for step in range</code></td><td><code>max_iterations=15</code></td></tr>
    <tr><td>Human approval</td><td>Gate before calling</td><td>Gate <em>inside</em> the tool function</td></tr>
    <tr><td>Logging</td><td>Anywhere in the loop</td><td>Inspect each yielded message</td></tr>
  </table>
  <p>I checked this by running it against a local fake API server. The runner called both tools, sent both <code>tool_result</code> blocks in one user message, and stopped on <code>end_turn</code>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>The Python runner doesn't auto-resume <code>pause_turn</code> (used by server-side tools such as web search). A paused turn silently ends the run. Use only client tools as here, or restart the runner with the paused turn appended.</p></div>
  <div class="callout intu"><span class="label">Rule of thumb</span><p>Default to the tool runner for custom-tool agents. Write the manual loop to learn, or when you need control it doesn't expose, such as a custom transport or interleaving unrelated work mid-loop.</p></div>

  <h2 id="ab-fw"><span class="num">08</span>What Frameworks Add</h2>
  <p>~150 lines, working agent. Frameworks keep the same core loop and add the infrastructure that hurts at scale:</p>
  <table class="tbl">
    <tr><th>Need</th><th>Our version</th><th>What a framework gives you</th></tr>
    <tr><td>State persistence</td><td><code>self.messages</code> dies with the process</td><td>Checkpointers that save state after every step; resume after a crash or days later (LangGraph, 11)</td></tr>
    <tr><td>Control flow</td><td>One implicit loop</td><td>Explicit graphs: nodes, conditional edges, cycles, subgraphs (11)</td></tr>
    <tr><td>Human-in-the-loop</td><td>Blocking <code>input()</code></td><td>Interrupts: pause, persist, resume when a human answers from a web UI (11)</td></tr>
    <tr><td>Tracing</td><td>A JSONL file</td><td>Nested traces of every call with tokens, latency, cost (LangSmith, OpenTelemetry; 10, 13)</td></tr>
    <tr><td>Provider swapping</td><td>Anthropic SDK only</td><td>A common chat-model interface and integrations (LangChain, 10)</td></tr>
    <tr><td>Tool sharing</td><td>Functions in one repo</td><td>MCP servers any agent can plug into (12)</td></tr>
    <tr><td>Streaming</td><td>None</td><td>Token and step streaming to a UI (11)</td></tr>
  </table>
  <div class="callout intu"><span class="label">When to switch</span><p>Stay with plain code while the agent is one loop and a few tools. Move to LangGraph when you need durable state, branching graphs, human approval across requests, or several agents. Building it by hand first means you'll know what the framework is doing for you.</p></div>

  <h2 id="ab-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why does every agent loop need a max-steps guard?</summary><div class="qa-body">The model decides when to stop. If a tool keeps failing or the model keeps "checking one more thing", the loop never ends, and every step resends a growing transcript, so cost grows faster than linearly. A guard (or <code>max_iterations</code>) caps it and returns partial work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A tool raises <code>FileNotFoundError</code>. Should the agent crash, retry silently, or something else?</summary><div class="qa-body">Return a <code>tool_result</code> with <code>is_error: true</code> and an actionable message ("No file 'sales.csv'. Call list_files..."). The model reads it and corrects its next call. Crashing loses the run; silent retries repeat the same mistake.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How did you sandbox <code>run_python</code>, and is it safe for production?</summary><div class="qa-body">Separate process, <code>cwd</code> set to the workspace, timeout, minimal env (no API key), capped output, and a human approval gate. Not production-safe: the process can still read files and use the network. Production needs a container or VM with no network, CPU/memory limits and a read-only filesystem, or a hosted code-execution tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The model sends <code>path="../../etc/passwd"</code>. What happens in your agent?</summary><div class="qa-body"><code>safe_path</code> resolves it to an absolute path, sees it's outside <code>ROOT</code> via <code>is_relative_to</code>, and raises <code>ValueError</code>. That becomes an <code>is_error</code> result. Never open a raw model-supplied path.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find the bug: on <code>stop_reason == "max_tokens"</code> the loop appends <code>response.content</code> to history and returns. The next <code>chat()</code> fails with 400. Why?</summary><div class="qa-body">The truncated turn may end with a <code>tool_use</code> block that never got a <code>tool_result</code>. The API requires every <code>tool_use</code> to be answered in the next user turn. Fix: don't append (or run) a truncated turn; raise <code>max_tokens</code> or ask for less.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Conversation memory vs a notes file: what's the difference and when do you load notes?</summary><div class="qa-body">Conversation memory is the <code>messages</code> list: everything said this session, resent each call, lost on restart. The notes file is curated durable facts that survive restarts. Load notes once per session into the system prompt, so the prefix stays identical and prompt caching keeps working.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why give the agent a todo tool instead of letting it plan in plain text?</summary><div class="qa-body">The plan becomes structured state you can display, log and check. Rewriting it as tasks finish keeps long tasks on track and makes progress visible. Sending the full list each time keeps the update idempotent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do you put human approval with a manual loop vs the tool runner?</summary><div class="qa-body">Manual loop: check before calling the function; if declined, return an <code>is_error</code> result saying so. Tool runner: gate inside the tool function and return a "user declined" string. Either way the model sees the refusal and can choose another approach.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What would you log for each agent step, and why?</summary><div class="qa-body">Step number, <code>stop_reason</code>, input/output tokens (cache fields too), each tool name, input, error flag and a truncated output, plus timestamps. That answers "why did it do that", tracks cost, and becomes the dataset for trajectory evals (13).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the SDK tool runner do for you, and what doesn't it?</summary><div class="qa-body">It builds schemas from type hints and docstrings, validates inputs, runs tools, turns exceptions into <code>is_error</code> results, appends results and loops until no more tool calls (capped by <code>max_iterations</code>). It doesn't persist state across processes, doesn't auto-resume <code>pause_turn</code>, and approval is still your code inside the tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your hand-written agent works. When would you move it to LangGraph?</summary><div class="qa-body">When you need durable checkpointed state (resume after crash or across days), human approval that waits across HTTP requests, explicit branching graphs or subgraphs, multiple cooperating agents, or built-in tracing and streaming. For one loop with a few tools, plain code is simpler to debug.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why pass <code>env={"PATH": ...}</code> to the subprocess?</summary><div class="qa-body">Without it, the child inherits your environment, including <code>ANTHROPIC_API_KEY</code> and any cloud credentials. Model-written code (possibly steered by prompt injection in the data) could print or send them. The smoke test shows only <code>LC_CTYPE</code> and <code>PATH</code> are visible.</div></details>
</main>`
});
