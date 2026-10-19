// notes/genai/agent_build.js — Build an Agent from Scratch
Object.assign(TOPIC_CONTENT, {
  "agent_build": `<main>
  <h1>Build an Agent from Scratch</h1>
  <p class="lead">You know the tool-calling loop (05) and the agent ideas: ReAct, workflows vs agents, memory (<a class="xref" data-note="agentic">Agent Fundamentals</a>). Now build a real data-analyst agent on the Claude API in plain Python, one file at a time, with nothing hidden. Every piece is tested: the tools on their own, then the whole loop against a <em>scripted fake client</em> so you can read each reasoning → tool → observation step and assert on it. Finally we rebuild it with the SDK's tool runner and see what frameworks like LangChain and LangGraph (10–11) add.</p>

  <h2 id="ab-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Build an Agent from Scratch</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The agent</div>
        <ul>
          <li><b>Data analyst</b> — question about CSVs → explore → pandas → verify → Markdown report</li>
          <li><b>Why an agent</b> — next step depends on what it sees (columns, errors, follow-ups)</li>
          <li><b>6 tools</b> — list_files, read_csv_head, run_python, write_report, update_todos, save_note</li>
          <li><b>Files</b> — tools.py · schemas.py · memory.py · agent.py (loop)</li>
          <li><b>Model</b> — <code>claude-opus-5-5</code> (workers could use <code>claude-sonnet-5-5</code>)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 1 · tool functions</div>
        <ul>
          <li><b>Plain Python, tested first</b> — most agent bugs are tool bugs</li>
          <li><b>safe_path</b> — resolve + <code>is_relative_to(ROOT)</code>; blocks <code>../../etc/passwd</code></li>
          <li><b>run_python</b> — subprocess, <code>cwd=ROOT</code>, timeout, <code>env={"PATH": ...}</code>, last 4,000 chars</li>
          <li><b>Raise with a hint</b> — "Call list_files to see what exists"</li>
          <li>⚠ Subprocess ≠ sandbox → container/VM, no network, limits</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 2 · schemas</div>
        <ul>
          <li><b>Schema = all the model knows</b> — docs for a new teammate</li>
          <li><b>verb_noun names</b> + <em>when</em> to call ("first", "once, at the end")</li>
          <li><b><code>strict: true</code> + <code>additionalProperties: false</code></b> — args always match</li>
          <li><b>enum</b> for status; "Requires human approval" in description</li>
          <li><b>Drift test</b> — schema args ⊆ function params (inspect.signature)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 3 · memory &amp; planning</div>
        <ul>
          <li><b>Conversation</b> — <code>self.messages</code>, resent each call, one session</li>
          <li><b>Working</b> — <code>TODOS</code> via <code>update_todos</code>; FULL list each time</li>
          <li><b>Long-term</b> — <code>notes.md</code> via <code>save_note</code>, survives restarts</li>
          <li><b>Load notes once</b> → stable system prompt → prompt caching works</li>
          <li>💡 Consultant: meeting transcript · sticky-note checklist · notebook</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 4 · the loop</div>
        <ul>
          <li><b>Call</b> — <code>messages.create(system, tools, messages, cache_control)</code></li>
          <li><b>stop_reason</b>: <code>end_turn</code> → return · <code>tool_use</code> → run all, results in ONE user msg · <code>max_tokens</code>/<code>refusal</code> → drop turn, stop</li>
          <li><b>Guard</b> — <code>for step in range(max_steps)</code></li>
          <li><b>Errors</b> → <code>is_error: true</code> · <b>Approval</b> → "no" returned as error</li>
          <li><b>Log</b> — JSONL per step and per tool</li>
          <li>⚠ Dangling <code>tool_use</code> without <code>tool_result</code> → next call 400</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 5 · run &amp; test</div>
        <ul>
          <li><b>FakeClient</b> — scripted <code>messages.create</code>; same response shape (content, stop_reason, usage)</li>
          <li><b>Inject it</b> — <code>Agent(client=fake)</code>; tools run for real</li>
          <li><b>Trace</b> — plan + list (parallel) → wrong path error → self-correct → pandas → report</li>
          <li><b>Answer</b> — South 50,700, Laptops 40,800; Jan 17,920 → Feb 32,780</li>
          <li><b>Tests</b> — history +2 per lap, decline, max_tokens drop, step guard</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step 6 · SDK tool runner</div>
        <ul>
          <li><b><code>@beta_tool</code></b> — schema from type hints + docstring <code>Args:</code></li>
          <li><b><code>client.beta.messages.tool_runner(..., max_iterations=15)</code></b> owns the loop</li>
          <li><b>Free</b> — validation, exceptions → <code>is_error</code>, results appended</li>
          <li><b>Approval</b> — gate <em>inside</em> the tool function</li>
          <li>⚠ Doesn't auto-resume <code>pause_turn</code> (server tools)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">What frameworks add</div>
        <ul>
          <li><b>Same core loop</b> + infrastructure</li>
          <li><b>Persistence</b> — checkpointers, resume after crash (LangGraph 11)</li>
          <li><b>Control flow</b> — explicit graphs · <b>HITL</b> — interrupts across requests</li>
          <li><b>Tracing</b>, <b>provider swap</b>, <b>MCP</b>, <b>streaming</b></li>
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
      <div class="rm-item rm-done" data-target="ab-run"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Step 5: Run &amp; Test It</span><span class="rm-sub">A scripted fake client, traced</span></div></div>
      <div class="rm-item rm-done" data-target="ab-runner"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Step 6: SDK Tool Runner</span><span class="rm-sub">Same agent, no hand loop</span></div></div>
      <div class="rm-item rm-done" data-target="ab-fw"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">What Frameworks Add</span><span class="rm-sub">Bridge to LangChain/LangGraph</span></div></div>
      <div class="rm-item rm-done" data-target="ab-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Bugs that cost real money</span></div></div>
      <div class="rm-item rm-done" data-target="ab-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ab-spec"><span class="num">01</span>The Agent We'll Build</h2>
  <p>Imagine your manager drops a CSV of sales into a folder and asks, "Which region made the most money, and why?" You would open the folder, peek at the file to learn the column names, write a bit of pandas, check the numbers, and write a short summary. If your code threw an error, you'd read it and fix it. If the manager then asked "and January vs February?", you'd remember the earlier work and answer quickly.</p>
  <p>That is exactly what our <strong>data analyst agent</strong> will do. The steps are not fixed in advance: which columns exist, whether the code fails, and what follow-up is asked all change the next step. That is the signal that an agent (not a fixed workflow) fits, as explained in <a class="xref" data-note="agentic">Agent Fundamentals</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new analyst intern on day one. You give them a desk (one folder they may use), a few tools (file browser, Python, a report template), a notebook for things to remember, and one rule: "ask me before running anything risky". You don't give them the keys to the whole office. Our agent gets the same deal.</p>
  </div>
  <div class="cards">
    <div><b>list_files</b><p>See what's in the workspace.</p><small>read-only</small></div>
    <div><b>read_csv_head</b><p>Row count, header, first rows.</p><small>read-only</small></div>
    <div><b>run_python</b><p>Run a script in a subprocess with a timeout.</p><small>dangerous → human approval</small></div>
    <div><b>write_report</b><p>Save a <code>.md</code> report.</p><small>writes, confined to reports/</small></div>
    <div><b>update_todos</b><p>The model's own plan.</p><small>working memory</small></div>
    <div><b>save_note</b><p>Facts for future sessions.</p><small>long-term memory</small></div>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="ab-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="10" y="104">user</text><line x1="44" y1="100" x2="58" y2="100" stroke="currentColor" marker-end="url(#ab-a1)"/><rect x="60" y="75" width="120" height="50" rx="6" class="fb sb"/><text x="120" y="98" text-anchor="middle" font-weight="bold">agent.py</text><text x="120" y="112" text-anchor="middle" font-size="10" class="tm">the loop</text><rect x="230" y="8" width="140" height="44" rx="6" class="fv"/><text x="300" y="28" text-anchor="middle" font-weight="bold">Claude API</text><text x="300" y="42" text-anchor="middle" font-size="10" class="tm">messages.create</text><rect x="410" y="8" width="170" height="44" rx="6" class="fs"/><text x="495" y="28" text-anchor="middle" font-weight="bold">schemas.py</text><text x="495" y="42" text-anchor="middle" font-size="10" class="tm">TOOLS = what model sees</text><line x1="408" y1="30" x2="372" y2="30" stroke="currentColor" marker-end="url(#ab-a1)"/><line x1="150" y1="75" x2="228" y2="40" stroke="currentColor" marker-end="url(#ab-a1)"/><line x1="232" y1="50" x2="168" y2="77" stroke="currentColor" stroke-opacity=".5" marker-end="url(#ab-a1)"/><rect x="230" y="80" width="140" height="44" rx="6" class="ft st"/><text x="300" y="100" text-anchor="middle" font-weight="bold">tools.py</text><text x="300" y="114" text-anchor="middle" font-size="10" class="tm">list·read·run·write</text><rect x="230" y="142" width="140" height="44" rx="6" class="fg sg"/><text x="300" y="162" text-anchor="middle" font-weight="bold">memory.py</text><text x="300" y="176" text-anchor="middle" font-size="10" class="tm">todos · notes</text><line x1="180" y1="102" x2="228" y2="102" stroke="currentColor" marker-end="url(#ab-a1)"/><text x="204" y="96" text-anchor="middle" font-size="10" class="tr">gate</text><path d="M150,125 V164 H228" fill="none" stroke="currentColor" marker-end="url(#ab-a1)"/><rect x="400" y="70" width="190" height="124" rx="8" fill="none" class="sr" stroke-dasharray="5 4"/><text x="410" y="88" font-size="11" class="tr">workspace/ = ROOT</text><text x="414" y="106" font-size="11">data/sales.csv</text><text x="414" y="123" font-size="11">reports/*.md</text><text x="414" y="140" font-size="11">notes.md</text><text x="414" y="157" font-size="11">_agent_log.jsonl</text><text x="414" y="174" font-size="11">_scratch.py</text><line x1="370" y1="102" x2="398" y2="102" stroke="currentColor" marker-end="url(#ab-a1)"/><line x1="370" y1="164" x2="398" y2="164" stroke="currentColor" marker-end="url(#ab-a1)"/></svg><figcaption>agent.py talks to the API and dispatches tools; every file the agent touches lives inside one root folder (red dashed). "gate" = human approval for run_python.</figcaption></figure>
  <p>The code is split into four files so each can be tested alone: <code>tools.py</code> (what the agent can do), <code>schemas.py</code> (how the tools are described to the model), <code>memory.py</code> (todos and notes) and <code>agent.py</code> (the loop). Every file the agent touches lives inside one folder, <code>workspace/</code>, shown with the red dashed border.</p>
  <p>First, the sample data. This script writes 18 rows: three regions × three products × two months. Revenue is not a column; it must be computed as <code>units × price</code>, which is a small trap the agent has to notice.</p>
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
Path("workspace/data/sales.csv").write_text(CSV)
print(len(CSV.splitlines()) - 1, "rows written")</div>
  <div class="fx" data-lang="text">18 rows written</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>workspace</strong> (also called the root, <code>ROOT</code>) is the only directory the agent's tools may read or write. Limiting an agent to the least access it needs is called <strong>least privilege</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pointing the agent at your home folder "for convenience". Model-written paths and code are untrusted input. One wrong path and it reads your SSH keys or deletes real files.</p>
  </div>

  <h2 id="ab-tools"><span class="num">02</span>Step 1: Tool Functions</h2>
  <p>Beginners usually start with the prompt and the loop. Start with the tools instead. Tools are ordinary Python functions, so you can test them in seconds with no model, no API key and no cost. When an agent misbehaves, the cause is very often a tool: a path that wasn't checked, an error message that gave no hint, or output so long it flooded the context.</p>
  <p>Each tool follows three rules. <strong>Never trust a model-supplied path</strong>: resolve it and refuse anything outside <code>ROOT</code>. <strong>Fail with a helpful message</strong>: raise an exception whose text tells the model what to do next; the loop will turn it into an error result. <strong>Keep outputs small</strong>: return a capped slice, not a 2 MB dump.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank teller's counter. Customers (the model) pass slips through a small window. The teller checks every slip (account belongs to you? amount within limit?), and if it's wrong, hands it back with a note: "signature missing, sign on the back". The customer never walks behind the counter.</p>
  </div>
  <div class="fx" data-lang="py"># file: tools.py  (plain Python, no model involved)
import csv, subprocess, sys
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
  <p>Walk through the important lines. <code>safe_path</code> joins the path to <code>ROOT</code>, calls <code>resolve()</code> (which collapses <code>..</code> and symlinks into a real absolute path), then checks <code>is_relative_to(ROOT)</code>. <code>run_python</code> writes the code to a scratch file and runs it in a <strong>separate process</strong> with four limits: <code>cwd=ROOT</code>, a <code>timeout</code>, a minimal <code>env</code> (so the child cannot see <code>ANTHROPIC_API_KEY</code>) and <code>[-4000:]</code> to cap output. <code>-I</code> runs Python in isolated mode (ignores user site-packages and environment variables).</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="ab-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="20" y="14" width="400" height="176" rx="8" fill="none" class="sr" stroke-width="1.5"/><text x="30" y="30" font-size="11" class="tr">1 · human approval gate</text><rect x="40" y="40" width="360" height="142" rx="8" fill="none" class="sb" stroke-width="1.5"/><text x="50" y="56" font-size="11" class="tb">2 · subprocess + timeout (kills runaways)</text><rect x="60" y="66" width="320" height="108" rx="8" fill="none" class="st" stroke-width="1.5"/><text x="70" y="82" font-size="11">3 · cwd=ROOT + safe_path (no ../ escape)</text><rect x="80" y="92" width="280" height="74" rx="8" fill="none" class="sg" stroke-width="1.5"/><text x="90" y="108" font-size="11" class="tg">4 · env={"PATH": …} (no API key)</text><rect x="140" y="122" width="160" height="32" rx="6" class="fs"/><text x="220" y="142" text-anchor="middle" font-weight="bold">model-written code</text><path d="M300,138 H470 V112" fill="none" stroke="currentColor" marker-end="url(#ab-a2)"/><rect x="430" y="56" width="160" height="54" rx="6" class="fb sb"/><text x="510" y="78" text-anchor="middle" font-weight="bold">5 · output cap</text><text x="510" y="94" text-anchor="middle" font-size="10" class="tm">last 4,000 chars → model</text><text x="430" y="160" font-size="11" class="tr">still NOT a sandbox:</text><text x="430" y="175" font-size="11" class="tr">files + network open</text><text x="430" y="190" font-size="10" class="tm">→ container / VM in prod</text></svg><figcaption>Every model-supplied path and script is untrusted, so run_python sits inside four layers and only a capped slice of output returns.</figcaption></figure>
  <p>Now test every success <em>and</em> failure path. <code>check</code> prints OK with the result, or ERR with the exception, which is exactly what the agent will see later.</p>
  <div class="fx" data-lang="py">from tools import list_files, read_csv_head, run_python, write_report

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
check(write_report, "summary.txt", "x")                   # wrong type</div>
  <div class="fx" data-lang="text">OK   list_files: data/sales.csv
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

ERR  write_report: ValueError: Reports must be .md files</div>
  <p>Each line proves one guard works. The wrong path gives a hint to call <code>list_files</code>. The <code>../../etc/passwd</code> escape is refused. Real pandas code returns <code>South</code>. The crash, the infinite loop (killed after 2 s) and the wrong file type all come back as clear errors. And <code>sorted(os.environ)</code> shows the child sees only <code>LC_CTYPE</code> and <code>PATH</code>: no API key to leak.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>path traversal</strong> attack uses <code>../</code> to escape an allowed folder. A <strong>sandbox</strong> is an environment that limits what code can touch (files, network, CPU, memory).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A subprocess is <em>not</em> a real sandbox. The code can still read any file your user can, and open network connections. In production, run it in a container or VM with no network and resource limits, or use a hosted code-execution tool (14).</p>
  </div>

  <h2 id="ab-schema"><span class="num">03</span>Step 2: Tool Schemas</h2>
  <p>The model never sees your Python. It only sees a <strong>schema</strong> for each tool: a name, a description, and a JSON Schema for the arguments. If the description says "read data", the model has to guess when and how. If it says "Call before writing code so you know the column names", the model knows exactly when it is useful. Vague schemas are the most common reason a model picks the wrong tool or invents arguments.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant menu for a guest who can't see the kitchen. "Dish 4" helps nobody. "Paneer tikka: grilled, spicy, takes 20 minutes, ask for no onion" lets the guest order correctly the first time. Tool descriptions are your menu.</p>
  </div>
  <p>The helper <code>tool()</code> builds every schema the same way, so you can't forget <code>strict</code> or <code>additionalProperties</code> on one of them.</p>
  <div class="fx" data-lang="py"># file: schemas.py  (what the model sees: names, descriptions, argument types)
def tool(name, description, props, required):
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
  <p>Look at the descriptions: each says what the tool does <em>and when</em> to call it ("Call this first", "Call once, at the end", "Always send the FULL list"). <code>run_python</code> warns "Requires human approval", so the model plans for a possible "no". The <code>enum</code> for status means the model cannot invent "kinda done". <code>strict: True</code> asks the API to guarantee the arguments match the schema exactly, so your code never gets a missing field.</p>
  <p>Schemas and functions live in two files, so they can drift apart: someone renames a parameter in <code>tools.py</code> and forgets <code>schemas.py</code>. A tiny test catches that. (It imports <code>update_todos</code> and <code>save_note</code> from <code>memory.py</code>, written in Step 3.)</p>
  <div class="fx" data-lang="py">import inspect
import tools as T, memory as M
from schemas import TOOLS

FUNCS = {"list_files": T.list_files, "read_csv_head": T.read_csv_head,
         "run_python": T.run_python, "write_report": T.write_report,
         "update_todos": M.update_todos, "save_note": M.save_note}

# A cheap test that catches drift between what the model sees and what the code takes
for t in TOOLS:
    schema_args = set(t["input_schema"]["properties"])
    params = set(inspect.signature(FUNCS[t["name"]]).parameters)
    hidden = params - schema_args                 # params the model can never set
    print(f"{t['name']:14} schema={sorted(schema_args)}  hidden={sorted(hidden) or '-'}")
    assert schema_args &lt;= params, f"{t['name']}: schema has args the function lacks"</div>
  <div class="fx" data-lang="text">list_files     schema=['subdir']  hidden=-
read_csv_head  schema=['n', 'path']  hidden=-
run_python     schema=['code']  hidden=['timeout_s']
write_report   schema=['filename', 'markdown']  hidden=-
update_todos   schema=['todos']  hidden=-
save_note      schema=['note']  hidden=-</div>
  <p>Every schema argument exists in its function, so the <code>assert</code> passed. The <code>hidden</code> column is useful too: <code>timeout_s</code> is a parameter the model can never set, which is deliberate. We don't want the model to give its own code a 10-hour timeout.</p>
  <table class="tbl">
    <tr><th>Choice</th><th>Why</th></tr>
    <tr><td>Verb_noun names</td><td><code>read_csv_head</code> tells the model what happens; <code>data</code> doesn't.</td></tr>
    <tr><td>"Call this first / once, at the end"</td><td>Trigger conditions raise correct-call rates more than any other wording.</td></tr>
    <tr><td><code>strict</code> + <code>additionalProperties: false</code></td><td>Arguments always match; every field required to keep that simple.</td></tr>
    <tr><td>Few, focused tools</td><td>6 clear tools beat 30 overlapping ones; each schema costs tokens.</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>JSON Schema</strong> is a standard way to describe the shape of JSON (types, required fields, allowed values). <strong>Strict tool use</strong> (<code>"strict": true</code> on the tool) makes the API guarantee the model's <code>input</code> validates against it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Schema-valid is not correct. <code>{"path": "sales.csv"}</code> is a perfect string and still the wrong file. Strict schemas fix the <em>shape</em>; your tool code must still check the <em>meaning</em>.</p>
  </div>

  <h2 id="ab-mem"><span class="num">04</span>Step 3: Memory &amp; Planning</h2>
  <p>The model forgets everything between API calls. Our agent needs three kinds of memory with three different lifetimes. The <strong>conversation</strong> (everything said so far) must last for the session, so a follow-up question works. The <strong>plan</strong> must last for one task, so a long job stays on track. A few <strong>durable facts</strong> ("sales.csv has no revenue column") should survive even a restart, so tomorrow's session doesn't rediscover them.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A consultant's day. The meeting transcript is the conversation. The sticky-note checklist on the laptop is the todo list, thrown away when the job is done. The notebook they bring to every client visit is <code>notes.md</code>.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 152" width="600"><line x1="130" y1="128" x2="590" y2="128" stroke="currentColor" stroke-opacity=".4"/><text x="590" y="144" text-anchor="end" font-size="10" class="tm">time →</text><line x1="355" y1="6" x2="355" y2="132" stroke="currentColor" class="sr" stroke-dasharray="4 3"/><text x="355" y="144" text-anchor="middle" font-size="10" class="tr">process restart</text><text x="10" y="22" font-weight="bold" font-size="11">self.messages</text><text x="10" y="36" font-size="10" class="tm">resent each call</text><rect x="130" y="10" width="215" height="28" rx="5" class="fb sb"/><text x="237.5" y="28" text-anchor="middle" font-size="10">session 1</text><rect x="370" y="10" width="215" height="28" rx="5" class="fb sb"/><text x="477.5" y="28" text-anchor="middle" font-size="10">session 2 (fresh)</text><text x="10" y="62" font-weight="bold" font-size="11">TODOS</text><text x="10" y="76" font-size="10" class="tm">update_todos</text><rect x="130" y="50" width="70" height="28" rx="5" class="ft st"/><text x="165" y="68" text-anchor="middle" font-size="10">task A</text><rect x="205" y="50" width="70" height="28" rx="5" class="ft st"/><text x="240" y="68" text-anchor="middle" font-size="10">task B</text><rect x="280" y="50" width="65" height="28" rx="5" class="ft st"/><text x="312.5" y="68" text-anchor="middle" font-size="10">task C</text><rect x="370" y="50" width="90" height="28" rx="5" class="ft st"/><text x="415" y="68" text-anchor="middle" font-size="10">task D</text><text x="10" y="102" font-weight="bold" font-size="11">notes.md</text><text x="10" y="116" font-size="10" class="tm">save_note</text><rect x="130" y="90" width="455" height="28" rx="5" class="fg sg"/><text x="357.5" y="108" text-anchor="middle" font-size="10">loaded once per session · survives restarts</text></svg><figcaption>Three memories, three lifetimes: the conversation dies with the process, the plan lives for one task, notes.md outlives everything.</figcaption></figure>
  <p>The conversation is just the <code>self.messages</code> list inside the agent (next step). The other two live in <code>memory.py</code>:</p>
  <div class="fx" data-lang="py"># file: memory.py
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
  <p>Now exercise it. First the todo list, then the notes file before and after saving a note:</p>
  <div class="fx" data-lang="py">print(M.update_todos([{"task": "Inspect data", "status": "done"},
                      {"task": "Revenue by region", "status": "in_progress"},
                      {"task": "Write report", "status": "pending"}]))
print(M.load_notes())
print(M.save_note("  Revenue = units * price; no revenue column exists. "))
print(M.load_notes(), end="")</div>
  <div class="fx" data-lang="text">[x] Inspect data
[~] Revenue by region
[ ] Write report
(no notes yet)
Saved.
- Revenue = units * price; no revenue column exists.</div>
  <p><code>update_todos</code> replaced the whole list and returned a readable checklist: <code>[x]</code> done, <code>[~]</code> in progress, <code>[ ]</code> pending. That string goes back to the model as the tool result, so the plan sits in the transcript where both you and the model can see it. <code>load_notes</code> first said <code>(no notes yet)</code>; after <code>save_note</code> the note is a line in <code>notes.md</code>, trimmed of extra spaces by <code>.strip()</code>. Because this note now exists, the agent in Step 5 will start with it in its system prompt.</p>
  <ul>
    <li><strong>Why the full list each time?</strong> Replacing the whole list is <em>idempotent</em> (sending it twice changes nothing) and can't drift, unlike "add item" / "remove item" operations.</li>
    <li><strong>When to load notes?</strong> Once, at session start, into the system prompt. Reloading per call would change the prompt's prefix and break prompt caching (05).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Working memory</strong>: state for the current task (the todo list). <strong>Long-term memory</strong>: curated facts that persist across sessions (the notes file). <strong>Prompt caching</strong>: the API reuses work for an identical prompt prefix, making repeated calls cheaper and faster.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Saving everything to long-term memory. It fills with stale or wrong "facts" that get re-injected forever. Keep notes durable and few, and never store secrets in them.</p>
  </div>

  <h2 id="ab-loop"><span class="num">05</span>Step 4: The Agent Loop</h2>
  <p>The loop from 05 is about ten lines: call the model, run any tools it asked for, send results back, repeat. In production those ten lines fail in expensive ways. A tool that keeps failing makes it loop forever. An exception in one tool kills a run that was nearly done. Generated code runs without anyone seeing it. A response cut off by <code>max_tokens</code> leaves a half-written tool call in the history, and the next API call fails with a 400 error. So we add five habits: a step guard, error results, approval, logging, and careful <code>stop_reason</code> handling.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A railway signal cabin. Trains (model turns) arrive one by one. The cabin operator checks each one: clear to proceed (run the tools), terminate here (final answer), or stop and hold (truncated or refused). He writes every train in the register (the log), and no train may pass the same signal forever.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 202" width="600"><defs><marker id="ab-a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="20" y="70" width="130" height="44" rx="6" class="fb sb"/><text x="85" y="90" text-anchor="middle" font-weight="bold">messages.create</text><text x="85" y="104" text-anchor="middle" font-size="10" class="tm">system·tools·history</text><rect x="190" y="70" width="110" height="44" rx="6" class="fv"/><text x="245" y="96" text-anchor="middle">stop_reason?</text><line x1="150" y1="92" x2="188" y2="92" stroke="currentColor" marker-end="url(#ab-a4)"/><rect x="350" y="70" width="230" height="44" rx="6" class="fg sg"/><text x="465" y="90" text-anchor="middle" font-weight="bold">return text</text><text x="465" y="104" text-anchor="middle" font-size="10" class="tm">append assistant turn</text><line x1="300" y1="92" x2="348" y2="92" stroke="currentColor" marker-end="url(#ab-a4)" class="sg"/><text x="325" y="106" text-anchor="middle" font-size="10" class="tg">end_turn</text><rect x="350" y="8" width="230" height="44" rx="6" class="fr sr"/><text x="465" y="28" text-anchor="middle" font-weight="bold">drop turn, stop</text><text x="465" y="42" text-anchor="middle" font-size="10" class="tm">max_tokens · refusal</text><path d="M245,70 V30 H348" fill="none" class="sr" stroke="currentColor" marker-end="url(#ab-a4)"/><text x="290" y="24" text-anchor="middle" font-size="10" class="tr">other</text><rect x="170" y="150" width="150" height="44" rx="6" class="ft st"/><text x="245" y="170" text-anchor="middle" font-weight="bold">execute each</text><text x="245" y="184" text-anchor="middle" font-size="10" class="tm">gate→run→is_error</text><line x1="245" y1="114" x2="245" y2="148" stroke="currentColor" marker-end="url(#ab-a4)"/><text x="252" y="136" font-size="10">tool_use</text><path d="M170,172 H85 V116" fill="none" stroke="currentColor" marker-end="url(#ab-a4)"/><text x="78" y="140" text-anchor="end" font-size="10" class="tm">all results</text><text x="78" y="152" text-anchor="end" font-size="10" class="tm">in ONE user</text><text x="78" y="164" text-anchor="end" font-size="10" class="tm">message</text><rect x="350" y="150" width="230" height="44" rx="6" class="fs"/><text x="465" y="170" text-anchor="middle" font-weight="bold">max_steps reached</text><text x="465" y="184" text-anchor="middle" font-size="10" class="tm">stop: guard, partial work</text><line x1="320" y1="172" x2="348" y2="172" stroke="currentColor" marker-end="url(#ab-a4)" class="sr"/></svg><figcaption>One lap = one API call. Only tool_use loops back; every other stop_reason, or the step guard, ends the run.</figcaption></figure>
  <div class="fx" data-lang="py"># file: agent.py
import json, time
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
    def __init__(self, client=None, model="claude-opus-5-5", max_steps=15, approver=approve):
        self.client = client or anthropic.Anthropic()   # tests pass a fake client
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
  <p>Read <code>chat</code> top to bottom. Each lap calls <code>messages.create</code> with the same <code>system</code> and <code>tools</code> and the growing <code>messages</code>. Then it branches on <code>resp.stop_reason</code>: <code>"end_turn"</code> means the model is done, so the turn is saved and the text returned. Anything other than <code>"tool_use"</code> (for example <code>"max_tokens"</code> or <code>"refusal"</code>) returns <em>without</em> saving the turn. For <code>"tool_use"</code>, the assistant turn is saved, <code>execute</code> runs every <code>tool_use</code> block, and <em>all</em> results go back in <strong>one</strong> user message. <code>execute</code> is where safety lives: the approval check, the <code>try/except</code> that turns exceptions into <code>is_error: True</code>, and a log line. Note <code>client=None</code> in <code>__init__</code>: production uses the real <code>anthropic.Anthropic()</code>, tests pass a fake.</p>
  <table class="tbl">
    <tr><th>Piece</th><th>Failure it prevents</th></tr>
    <tr><td><code>max_steps</code> guard</td><td>An agent stuck retrying forever, burning money</td></tr>
    <tr><td>try/except → <code>is_error</code></td><td>One bad path crashing the whole run</td></tr>
    <tr><td>Approval gate</td><td>Generated code running unseen; a "no" goes back as an error</td></tr>
    <tr><td>Drop turn on <code>max_tokens</code> / <code>refusal</code></td><td>A <code>tool_use</code> with no <code>tool_result</code> poisoning history (next call = 400)</td></tr>
    <tr><td>JSONL log</td><td>"Why did it do that?" with no evidence; logs feed evals (13)</td></tr>
    <tr><td><code>cache_control</code></td><td>Paying full price to resend a growing transcript every step</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong><code>stop_reason</code></strong> tells you why the model stopped: <code>end_turn</code> (finished), <code>tool_use</code> (wants tools), <code>max_tokens</code> (cut off), <code>refusal</code> (declined), <code>pause_turn</code> (server tool paused). <strong>JSONL</strong> is one JSON object per line, easy to append and to load into pandas.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Putting a step counter or the current time into the system prompt. It changes the prefix every call, so caching never hits. Keep <code>system</code> and <code>tools</code> byte-identical for the whole session.</p>
  </div>

  <h2 id="ab-run"><span class="num">06</span>Step 5: Run &amp; Test It</h2>
  <p>Running against the real API is the final check, but it is a poor first test. Every run costs money, the model may take a different path each time, and when it does something odd you cannot replay it. What you want first is to run <em>your</em> loop, tools and memory exactly, with a model whose replies you control. So we build a <strong>fake client</strong>: an object with a <code>messages.create</code> method that returns pre-written turns in the same shape the SDK returns (<code>content</code> blocks, <code>stop_reason</code>, <code>usage</code>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A driving test track with cardboard pedestrians that step out at fixed moments. The car, brakes and driver are real; the "traffic" is scripted. You can repeat the exact same test after every change to the brakes. The fake client is the cardboard traffic for your agent.</p>
  </div>
  <div class="fx" data-lang="py">from types import SimpleNamespace as NS

def text(t):                          # helpers that build response blocks
    return NS(type="text", text=t)

def call(name, **args):
    call.n = getattr(call, "n", 0) + 1
    return NS(type="tool_use", id=f"toolu_{call.n:02d}", name=name, input=args)

class FakeMessages:
    """Scripted stand-in for client.messages: each create() pops the next turn."""
    def __init__(self, script):
        self.script, self.sent = list(script), []

    def create(self, **request):
        self.sent.append(len(request["messages"]))     # history length it was shown
        turn = self.script.pop(0)
        content, stop = turn if isinstance(turn, tuple) else (turn, None)
        stop = stop or ("tool_use" if any(b.type == "tool_use" for b in content)
                        else "end_turn")
        size = len(str(request["messages"])) // 4      # rough "token" count
        return NS(content=content, stop_reason=stop,
                  usage=NS(input_tokens=size, output_tokens=len(str(content)) // 4))

class FakeClient:
    def __init__(self, script):
        self.messages = FakeMessages(script)</div>
  <p><code>call()</code> builds a <code>tool_use</code> block with a unique id, <code>text()</code> a text block. <code>FakeMessages.create</code> records how many messages it was sent (<code>self.sent</code>), pops the next scripted turn, and sets <code>stop_reason</code> to <code>"tool_use"</code> if the turn contains a tool call, else <code>"end_turn"</code>, unless the script forces one (we use that to fake a <code>max_tokens</code> cut-off later). The token counts are rough (characters ÷ 4) but they grow just like real ones.</p>
  <p>Now the script. It mirrors a realistic run, including a mistake: the "model" first asks for <code>sales.csv</code> without the <code>data/</code> folder. Everything else is real: the CSV is read, pandas really runs in a subprocess, the report file is really written.</p>
  <div class="fx" data-lang="py">import json
from agent import Agent, LOG

REVENUE = ("import pandas as pd\\ndf = pd.read_csv('data/sales.csv')\\n"
           "df['revenue'] = df.units * df.price\\n")
script = [
    # turn 1: plan + look around (two tool calls in ONE turn = parallel)
    [text("I'll plan, then look at the files."),
     call("update_todos", todos=[{"task": "Inspect data", "status": "in_progress"},
                                 {"task": "Revenue by region", "status": "pending"},
                                 {"task": "Write report", "status": "pending"}]),
     call("list_files", subdir=".")],
    [call("read_csv_head", path="sales.csv", n=3)],              # wrong path on purpose
    [call("read_csv_head", path="data/sales.csv", n=3)],         # self-corrected
    [call("run_python", code=REVENUE + "print(df.groupby('region').revenue.sum())")],
    [call("run_python", code=REVENUE + "s = df[df.region == 'South']\\n"
                                       "print(s.groupby('product').revenue.sum())")],
    [call("update_todos", todos=[{"task": t, "status": "done"} for t in
                                 ["Inspect data", "Revenue by region", "Write report"]]),
     call("write_report", filename="sales_summary.md",
          markdown="# Sales\\nSouth led with 50,700, driven by Laptops (40,800)."),
     call("save_note", note="sales.csv has no revenue column; use units * price.")],
    [text("South had the highest revenue (50,700), driven by Laptops (40,800). "
          "Report saved to reports/sales_summary.md.")],
    # second chat() call, same agent, same memory
    [call("run_python", code=REVENUE + "s = df[df.region == 'South']\\n"
                                       "print(s.groupby('date').revenue.sum())")],
    [text("South grew from 17,920 in January to 32,780 in February.")],
]

def approver(name, args):
    print(f"   [approval asked for {name}: yes]")
    return True

LOG.unlink(missing_ok=True)
fake = FakeClient(script)
agent = Agent(client=fake, approver=approver)
print("ANSWER 1:", agent.chat("Which region had the highest revenue in data/sales.csv, "
                              "and which product drove it? Write a short report."))
print("ANSWER 2:", agent.chat("Now compare January vs February for that region."))

print("\\n--- the log, one line per event ---")
for line in LOG.read_text().splitlines():
    e = json.loads(line)
    if "step" in e:
        print(f"step {e['step']}: stop_reason={e['stop_reason']:8} in_tok={e['in_tok']}")
    else:
        out = " | ".join(" ".join(l.split()) for l in e["output"].splitlines()[:4])
        flag = "ERROR " if e["is_error"] else ""
        print(f"    {e['tool']:13} -&gt; {flag}{out[:62]}")</div>
  <div class="fx" data-lang="text">   [approval asked for run_python: yes]
   [approval asked for run_python: yes]
ANSWER 1: South had the highest revenue (50,700), driven by Laptops (40,800). Report saved to reports/sales_summary.md.
   [approval asked for run_python: yes]
ANSWER 2: South grew from 17,920 in January to 32,780 in February.

--- the log, one line per event ---
step 1: stop_reason=tool_use in_tok=34
    update_todos  -&gt; [~] Inspect data | [ ] Revenue by region | [ ] Write report
    list_files    -&gt; data/sales.csv | notes.md
step 2: stop_reason=tool_use in_tok=201
    read_csv_head -&gt; ERROR FileNotFoundError: No file 'sales.csv'. Call list_files to see
step 3: stop_reason=tool_use in_tok=283
    read_csv_head -&gt; 18 rows x 5 cols | date,region,product,units,price | 2024-01-1
step 4: stop_reason=tool_use in_tok=378
    run_python    -&gt; region | North 31000 | South 50700 | West 34420
step 5: stop_reason=tool_use in_tok=487
    run_python    -&gt; product | Lamp 400 | Laptop 40800 | Phone 9500
step 6: stop_reason=tool_use in_tok=605
    update_todos  -&gt; [x] Inspect data | [x] Revenue by region | [x] Write report
    write_report  -&gt; Wrote reports/sales_summary.md (58 chars)
    save_note     -&gt; Saved.
step 7: stop_reason=end_turn in_tok=831
step 1: stop_reason=tool_use in_tok=895
    run_python    -&gt; date | 2024-01-15 17920 | 2024-02-15 32780 | Name: revenue, dt
step 2: stop_reason=end_turn in_tok=1009</div>
  <p>Read the log as a story. <strong>Step 1</strong>: two tools in one turn (plan + list files), so both results went back together. <strong>Step 2</strong>: wrong path, and the error hint came back as an observation. <strong>Step 3</strong>: self-corrected. <strong>Steps 4–5</strong>: approval was asked, then pandas computed the real numbers: South 50,700, driven by Laptops 40,800. <strong>Step 6</strong>: three tools in one turn finish the job. <strong>Step 7</strong>: <code>end_turn</code>. The second <code>chat()</code> worked because <code>self.messages</code> still held the first task; its first call already carried about 900 "tokens" of history. That growing <code>in_tok</code> is why caching and compaction matter.</p>
  <p>Because the model is scripted, we can now write real tests, including the nasty cases:</p>
  <div class="fx" data-lang="py">from tools import ROOT

# 1. The happy run, checked like any unit test
assert (ROOT / "reports/sales_summary.md").read_text().count("South") == 1
assert fake.messages.sent == [1, 3, 5, 7, 9, 11, 13, 15, 17]   # +2 per lap, both chats
roles = [m["role"] for m in agent.messages]
assert roles[0] == "user" and roles[-1] == "assistant"
print("happy path ok:", len(agent.messages), "messages in memory")

# 2. Human says no -&gt; the model gets an is_error result, nothing runs
fake2 = FakeClient([[call("run_python", code="import os; os.remove('data/sales.csv')")],
                    [text("Understood, I won't delete it.")]])
a2 = Agent(client=fake2, approver=lambda name, args: False)
print("declined   :", a2.chat("Clean up the workspace"))
print("   result  :", a2.messages[2]["content"][0]["content"],
      "| is_error =", a2.messages[2]["content"][0]["is_error"])
assert (ROOT / "data/sales.csv").exists()

# 3. Truncated turn (max_tokens) with a half-written tool call -&gt; dropped, not run
fake3 = FakeClient([([text("Let me"), call("run_python", code="print(")], "max_tokens")])
a3 = Agent(client=fake3, approver=lambda n, a: True)
print("max_tokens :", a3.chat("Analyse everything"), "| history roles:",
      [m["role"] for m in a3.messages])

# 4. A model that never stops -&gt; the step guard ends it
fake4 = FakeClient([[call("list_files", subdir=".")]] * 3)
print("guard      :", Agent(client=fake4, max_steps=3).chat("Look around"))</div>
  <div class="fx" data-lang="text">happy path ok: 18 messages in memory
declined   : Understood, I won't delete it.
   result  : User declined this action. Ask or try another way. | is_error = True
max_tokens : Stopped: max_tokens | history roles: ['user']
guard      : Stopped after 3 steps (guard). Partial work is in the log.</div>
  <p>Test 1 checks the report and proves the history grows by two per lap across <em>both</em> chats (<code>[1, 3, …, 17]</code>). Test 2: the human said no; the model received an <code>is_error</code> result and <code>sales.csv</code> still exists. Test 3: a turn cut off by <code>max_tokens</code> with a half-written <code>print(</code> call was <em>not</em> run and <em>not</em> kept: history is just <code>['user']</code>. Test 4: a model that never stops was ended by the guard after 3 steps.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>test double</strong> (fake, stub, mock) replaces a real dependency in tests. <strong>Dependency injection</strong> means passing the dependency in (<code>Agent(client=fake)</code>) instead of creating it inside, so tests can swap it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A fake that doesn't match the real response shape gives false confidence. Mirror the real fields you read (<code>content</code>, <code>type</code>, <code>id</code>, <code>name</code>, <code>input</code>, <code>stop_reason</code>, <code>usage</code>) and still run a few real end-to-end evaluations (13).</p>
  </div>

  <h2 id="ab-runner"><span class="num">07</span>Step 6: Same Agent with the SDK Tool Runner</h2>
  <p>Our manual loop is about 40 lines that must be exactly right: stop reasons, error results, putting all results in one message, the step guard. Every team that writes agents writes this same loop. The SDK's <strong>tool runner</strong> (a beta helper in the <code>anthropic</code> package) owns it for you: it calls the API, runs your functions, sends results back and stops when the model stops calling tools. You write only the tool functions.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cooking at home vs ordering through a meal kit. With the kit, the shopping, measuring and recipe card are handled; you still cook (write the tools) and you still decide who eats (approval). You learn more by shopping yourself once, which is why we built the manual loop first.</p>
  </div>
  <p>Each <code>@beta_tool</code> function becomes a tool: the schema is built from its type hints, the description from its docstring, and each argument's description from the <code>Args:</code> section. The <code>Todo</code> <code>TypedDict</code> with a <code>Literal</code> becomes the same enum we wrote by hand.</p>
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
  <p>The loop is gone. <code>tool_runner(...)</code> returns an iterator; each <code>for message in runner</code> lap is one model turn, which we only log. <code>max_iterations=15</code> is our step guard. Human approval moved <em>inside</em> <code>run_python</code>: a "no" returns a string the model can read. When the loop ends, <code>message</code> is the final turn.</p>
  <p>Tested without network: an <code>httpx2.MockTransport</code> (the HTTP library the SDK uses) played the API and returned scripted JSON. The runner sent all six tool schemas (the <code>Todo</code> enum included), ran two parallel tool calls, returned both <code>tool_result</code> blocks in one user message, turned a <code>FileNotFoundError</code> into an <code>is_error</code> result automatically, and stopped on <code>end_turn</code>.</p>
  <table class="tbl">
    <tr><th>Concern</th><th>Manual loop</th><th>Tool runner</th></tr>
    <tr><td>Tool schema</td><td>Hand-written JSON</td><td>From type hints + docstring</td></tr>
    <tr><td>Exceptions</td><td>Your try/except → <code>is_error</code></td><td>Caught automatically → <code>is_error</code></td></tr>
    <tr><td>Max steps</td><td><code>for step in range</code></td><td><code>max_iterations=15</code></td></tr>
    <tr><td>Human approval</td><td>Gate before calling</td><td>Gate inside the tool</td></tr>
    <tr><td>Logging</td><td>Anywhere in the loop</td><td>Inspect each yielded message</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Tool runner</strong>: <code>client.beta.messages.tool_runner</code>, an SDK helper that drives the request → execute → loop cycle for tools you define. It is <em>not</em> the Claude Agent SDK (a separate product with built-in file and shell tools).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The Python runner doesn't auto-resume <code>pause_turn</code> (used by server-side tools such as web search). A paused turn silently ends the run. Use only client tools as here, or restart the runner with the paused turn appended. Rule of thumb: default to the runner; write the manual loop to learn or for control it doesn't expose.</p>
  </div>

  <h2 id="ab-fw"><span class="num">08</span>What Frameworks Add</h2>
  <p>About 150 lines and we have a working, tested agent. So why do frameworks like LangChain and LangGraph exist? Because some needs only appear at scale. If the server restarts mid-task, <code>self.messages</code> is gone. If approval must come from a manager on a web page tomorrow, a blocking <code>input()</code> can't wait that long. If you have five agents and a branching process, one implicit loop becomes hard to follow. Frameworks keep the same core loop and add this infrastructure.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A home kitchen vs a restaurant chain. The cooking is the same; the chain adds stock tracking, order tickets that survive a shift change, and a manager who approves refunds later. You don't need that to cook dinner for four.</p>
  </div>
  <table class="tbl">
    <tr><th>Need</th><th>Our version</th><th>What a framework gives you</th></tr>
    <tr><td>State persistence</td><td><code>self.messages</code> dies with the process</td><td>Checkpointers save state every step; resume after a crash or days later (<a class="xref" data-note="langgraph">LangGraph</a>)</td></tr>
    <tr><td>Control flow</td><td>One implicit loop</td><td>Explicit graphs: nodes, conditional edges, cycles, subgraphs</td></tr>
    <tr><td>Human-in-the-loop</td><td>Blocking <code>input()</code></td><td>Interrupts: pause, persist, resume when a human answers from a web UI</td></tr>
    <tr><td>Tracing</td><td>A JSONL file</td><td>Nested traces with tokens, latency, cost (LangSmith, OpenTelemetry; 13)</td></tr>
    <tr><td>Provider swapping</td><td>Anthropic SDK only</td><td>A common chat-model interface (<a class="xref" data-note="langchain">LangChain</a>)</td></tr>
    <tr><td>Tool sharing</td><td>Functions in one repo</td><td>MCP servers any agent can plug into (<a class="xref" data-note="multiagent">Multi-Agent &amp; MCP</a>)</td></tr>
    <tr><td>Streaming</td><td>None</td><td>Token and step streaming to a UI</td></tr>
  </table>
  <p>Notice that everything you built maps to a framework concept: <code>REGISTRY</code> is a tool node, <code>self.messages</code> is graph state, <code>approve</code> is an interrupt, the log is a trace. That is the real benefit of building it by hand first: when the framework does something surprising, you know what it is doing underneath.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>checkpointer</strong> saves the agent's state after each step so a run can resume. An <strong>interrupt</strong> pauses a run, persists it, and resumes later with human input.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Adopting a framework before you need it. Stay with plain code while it is one loop and a few tools. Move to LangGraph when you need durable state, branching, approval across requests, or several agents. Interviewers often ask "why not just use LangChain?": the honest answer is a trade-off, not a slogan.</p>
  </div>

  <h2 id="ab-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: results split across messages</span>
    <p>Running two tools and sending each result in its own user message. Send all <code>tool_result</code> blocks for one turn in <strong>one</strong> user message; splitting them teaches the model to stop making parallel calls.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: keeping a truncated turn</span>
    <p>On <code>max_tokens</code>, appending <code>resp.content</code> to history. It may end in a <code>tool_use</code> with no <code>tool_result</code>, and the next call fails with 400. Drop it (test 3 above) and raise <code>max_tokens</code> or ask for less.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: dropping failed tool calls</span>
    <p>Skipping a <code>tool_result</code> when a tool fails. Every <code>tool_use</code> needs an answer; return it with <code>is_error: true</code> and a useful message.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: leaking secrets to generated code</span>
    <p>Running model-written code with your full environment. It inherits <code>ANTHROPIC_API_KEY</code> and cloud credentials. Pass a minimal <code>env</code>, and in production use a real sandbox.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: volatile system prompt</span>
    <p>Reloading notes or inserting the time every call. The prefix changes and caching never hits; costs grow with every lap.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: only testing with the live model</span>
    <p>Real runs are slow, random and paid. Unit-test the loop with a scripted fake client; keep live runs for evaluation.</p>
  </div>

  <h2 id="ab-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why does every agent loop need a max-steps guard?</summary><div class="qa-body">The model decides when to stop. If a tool keeps failing or the model keeps "checking one more thing", the loop never ends, and every step resends a growing transcript, so cost grows faster than linearly. A guard (or <code>max_iterations</code>) caps it and returns partial work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A tool raises <code>FileNotFoundError</code>. Should the agent crash, retry silently, or something else?</summary><div class="qa-body">Return a <code>tool_result</code> with <code>is_error: true</code> and an actionable message ("No file 'sales.csv'. Call list_files..."). The model reads it and corrects its next call, as in step 2 → 3 of the trace.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How did you sandbox <code>run_python</code>, and is it safe for production?</summary><div class="qa-body">Separate process, <code>cwd</code> = workspace, timeout, minimal env (no API key), capped output, human approval. Not production-safe: the process can still read files and use the network. Production needs a container/VM with no network, resource limits and a read-only filesystem, or a hosted code-execution tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The model sends <code>path="../../etc/passwd"</code>. What happens?</summary><div class="qa-body"><code>safe_path</code> resolves it to an absolute path, sees it's outside <code>ROOT</code> via <code>is_relative_to</code>, and raises <code>ValueError</code>, which becomes an <code>is_error</code> result.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find the bug: on <code>max_tokens</code> the loop appends <code>resp.content</code> and returns. The next <code>chat()</code> fails with 400. Why?</summary><div class="qa-body">The truncated turn may end with a <code>tool_use</code> block that never got a <code>tool_result</code>. The API requires every <code>tool_use</code> to be answered in the next user turn. Fix: don't append or run a truncated turn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test an agent loop without calling the API?</summary><div class="qa-body">Inject a fake client whose <code>messages.create</code> returns scripted turns with the same shape as real responses. Run the real loop and tools, then assert on the history, files written, error results, and stop reasons. For SDK helpers like the tool runner, fake the HTTP layer instead (a mock transport returning scripted JSON).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Conversation memory vs a notes file: what's the difference and when do you load notes?</summary><div class="qa-body">Conversation memory is the <code>messages</code> list, resent each call, lost on restart. The notes file holds curated durable facts that survive restarts. Load notes once per session into the system prompt so the prefix stays identical and caching works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why give the agent a todo tool instead of letting it plan in plain text?</summary><div class="qa-body">The plan becomes structured state you can display, log and check. Rewriting it as tasks finish keeps long tasks on track. Sending the full list each time keeps the update idempotent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do you put human approval with a manual loop vs the tool runner?</summary><div class="qa-body">Manual loop: check before calling the function; if declined, return an <code>is_error</code> result. Tool runner: gate inside the tool function and return a "user declined" string. Either way the model sees the refusal and can adapt.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What would you log for each agent step, and why?</summary><div class="qa-body">Step number, <code>stop_reason</code>, input/output tokens (cache fields too), each tool name, input, error flag and a truncated output, plus timestamps. It answers "why did it do that", tracks cost, and becomes the dataset for evals (13).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the SDK tool runner do for you, and what doesn't it?</summary><div class="qa-body">It builds schemas from type hints and docstrings, validates inputs, runs tools, turns exceptions into <code>is_error</code> results, appends results and loops (capped by <code>max_iterations</code>). It doesn't persist state across processes, doesn't auto-resume <code>pause_turn</code>, and approval is still your code inside the tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your hand-written agent works. When would you move it to LangGraph?</summary><div class="qa-body">When you need durable checkpointed state, human approval that waits across HTTP requests, explicit branching graphs, several cooperating agents, or built-in tracing and streaming. For one loop with a few tools, plain code is simpler to debug.</div></details>
</main>
`
});
