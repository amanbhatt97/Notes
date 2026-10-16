// notes/python/py_io.js — Exceptions, Files & Packages
Object.assign(TOPIC_CONTENT, {
  "py_io": `<main>
  <h1>Exceptions, Files &amp; Packages</h1>
  <p class="lead">This note covers the plumbing of every real DS/ML project: what to do when a step fails (exceptions), how to read and write the file formats data really comes in (text, CSV, JSON, Parquet, pickle, YAML), how to split code into files you can import (modules and packages), and how to set up a project so anyone can rebuild it (virtual environments and lock files). Builds on <em>Python Fundamentals</em> and <em>Data Structures</em>. Run on Python 3.13, pandas 3.0, PyYAML 6, Poetry 2.4.</p>

  <h2 id="pi-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Exceptions, Files &amp; Packages</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">try / except / else / finally</div>
        <ul>
          <li><b>try</b> — only the risky line(s); keep it small</li>
          <li><b>except</b> — first matching type wins → specific before general</li>
          <li><b>else</b> — runs only if nothing failed (success path)</li>
          <li><b>finally</b> — always runs, even after <code>return</code> or a crash → cleanup</li>
          <li>💡 bank transfer: try it, handle failure, confirm on success, always end the call</li>
          <li>⚠ bare <code>except:</code> also catches Ctrl+C (KeyboardInterrupt) → at least <code>except Exception</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Raising &amp; custom errors</div>
        <ul>
          <li><b>raise ValueError("msg")</b> — stop early on bad input</li>
          <li><b>raise</b> (bare) inside except — re-raise, keep the traceback</li>
          <li><b>raise X from e</b> — wrap a low-level error, keep the cause (<code>__cause__</code>)</li>
          <li><b>Hierarchy</b> — one base <code>PipelineError(Exception)</code> + specific children; callers catch the base or a child</li>
          <li><b>Carry context</b> — store fields (<code>self.column</code>) + call <code>super().__init__(msg)</code></li>
          <li><b>Tree</b> — BaseException → Exception → ValueError / KeyError / OSError → FileNotFoundError</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging exceptions</div>
        <ul>
          <li><b>logger = logging.getLogger(__name__)</b>; set up once with <code>basicConfig</code></li>
          <li><b>log.exception("msg")</b> — inside except: ERROR + full traceback</li>
          <li><b>Levels</b> — DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL</li>
          <li><b>Lazy args</b> — <code>log.info("n=%d", n)</code>, not f-strings</li>
          <li>⚠ <code>print(e)</code> loses the traceback</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Text files &amp; pathlib</div>
        <ul>
          <li><b>with open(p, mode, encoding="utf-8")</b> — closes the file even on error</li>
          <li><b>Modes</b> — r, w (empties the file!), a (append), x (create only), +b for binary</li>
          <li><b>Loop over the file</b> — line by line, low memory</li>
          <li><b>Path</b> — <code>root / "data" / "x.csv"</code>, <code>.name .stem .suffix .parent</code></li>
          <li><b>glob / rglob</b>, <code>mkdir(parents=True, exist_ok=True)</code>, <code>read_text</code>/<code>write_text</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">CSV &amp; JSON</div>
        <ul>
          <li><b>csv.DictReader/DictWriter</b> — rows as dicts; open with <code>newline=""</code></li>
          <li>⚠ csv module gives back only strings; <b>pd.read_csv</b> guesses types</li>
          <li><b>json.load/dump</b> (file) vs <b>loads/dumps</b> (string — the "s")</li>
          <li>⚠ JSON: tuple → list, int keys → str, datetime fails → <code>default=str</code></li>
          <li>Easy to read, but no schema, slow and big</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Parquet, pickle, YAML</div>
        <ul>
          <li><b>Parquet</b> — stored by column, compressed, typed; 13.7 MB CSV → 3.4 MB, ~5× faster read</li>
          <li><b>Read less</b> — <code>columns=[...]</code> + <code>filters</code> load only what you need</li>
          <li><b>pickle</b> — saves any Python object (models); binary mode <code>"wb"/"rb"</code></li>
          <li>⚠ <b>Loading a pickle can run code</b> — never load untrusted pickles; breaks across versions</li>
          <li><b>YAML</b> — config files; always <code>yaml.safe_load</code></li>
          <li>⚠ YAML 1.1: <code>NO</code> → False, <code>1.10</code> → 1.1 → put strings in quotes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Modules &amp; packages</div>
        <ul>
          <li><b>Module</b> = one .py file; <b>package</b> = folder of modules (with <code>__init__.py</code>)</li>
          <li><b>Import runs the file once</b>, then keeps it in <code>sys.modules</code></li>
          <li><b>__init__.py</b> — marks a package, runs on import, re-exports the public API</li>
          <li><b>Relative import</b> <code>from ..utils import mean</code> — only inside a package; run with <code>python -m</code></li>
          <li><b>if __name__ == "__main__":</b> — runs only when the file is run directly, not on import</li>
          <li>⚠ <code>from x import *</code> floods your names; a file called <code>json.py</code> hides the real json</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Environments &amp; deps</div>
        <ul>
          <li><b>venv</b> — each project gets its own Python packages; fixes "A needs numpy 1, B needs 2"</li>
          <li><b>pip</b> — installs; <code>pip freeze</code> lists everything, including dependencies of dependencies</li>
          <li><b>requirements.txt</b> — what you asked for (often loose ranges)</li>
          <li><b>Lock file</b> (poetry.lock, uv.lock) — exact versions + hashes of everything → same install everywhere</li>
          <li>💡 requirements = shopping list; lock file = the bill with exact brands</li>
          <li><b>Poetry</b> — <code>pyproject.toml</code> + lock; <code>poetry add</code>, <code>--group dev</code>, <code>poetry install</code></li>
          <li>⚠ commit the lock file for apps; never <code>pip install</code> into system Python</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pi-try"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">try / except / else / finally</span><span class="rm-sub">The four-block flow</span></div></div>
      <div class="rm-item rm-done" data-target="pi-raise"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Raising &amp; Custom Errors</span><span class="rm-sub">Hierarchies, chaining</span></div></div>
      <div class="rm-item rm-done" data-target="pi-log"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Logging Exceptions</span><span class="rm-sub">Keep the traceback</span></div></div>
      <div class="rm-item rm-done" data-target="pi-txt"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Text Files &amp; pathlib</span><span class="rm-sub">open, modes, paths</span></div></div>
      <div class="rm-item rm-done" data-target="pi-csv"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">CSV &amp; JSON</span><span class="rm-sub">Readable interchange formats</span></div></div>
      <div class="rm-item rm-done" data-target="pi-pq"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Parquet</span><span class="rm-sub">Columnar data at scale</span></div></div>
      <div class="rm-item rm-done" data-target="pi-pkl"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Pickle &amp; YAML</span><span class="rm-sub">Objects and configs, safely</span></div></div>
      <div class="rm-item rm-done" data-target="pi-mod"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Modules &amp; Packages</span><span class="rm-sub">Imports, __init__, __main__</span></div></div>
      <div class="rm-item rm-done" data-target="pi-env"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Environments &amp; Dependencies</span><span class="rm-sub">venv, pip, poetry, locks</span></div></div>
      <div class="rm-item rm-done" data-target="pi-build"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Hands-on</span><span class="rm-sub">A tiny, robust ETL</span></div></div>
      <div class="rm-item rm-done" data-target="pi-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <div class="callout intu"><span class="label">Why this note</span><p>A notebook that runs once on clean data is easy. A job that runs every night on messy files is where the real work is. One bad row must not crash the job. Data arrives as CSV, JSON or Parquet and you must pick the right one. Code grows past one file. A teammate must be able to install the same packages. Interviews ask about all of these: "when does finally run?", "CSV vs Parquet?", "why a lock file?".</p></div>

  <h2 id="pi-try"><span class="num">01</span>try / except / else / finally</h2>
  <p>You are adding up ages from a file. One row says "forty" instead of 40. Python cannot turn "forty" into a number, so it stops the whole program and prints a report of what went wrong. That report is called a <strong>traceback</strong>, and the failure itself is called an <strong>exception</strong>.</p>
  <div class="fx" data-lang="py">ages = ["31", "forty", "28"]
total = 0
for a in ages:
    total += int(a)        # "forty" is not a number
print("total", total)</div>
  <div class="fx" data-lang="text">Traceback (most recent call last):
  File "i1.py", line 4, in &lt;module&gt;
    total += int(a)        # "forty" is not a number
             ~~~^^^
ValueError: invalid literal for int() with base 10: 'forty'</div>
  <p>Read the traceback from the bottom: the last line names the type of error (<code>ValueError</code>) and the reason. The lines above show which line of which file was running. The <code>print</code> never ran. With one bad row, you lost all 3.</p>
  <p>A <strong>try/except</strong> block lets you say "try this; if it fails in this way, do that instead and carry on". The job finishes, and you know which value was bad.</p>
  <div class="fx" data-lang="py">ages = ["31", "forty", "28"]
total = 0
for a in ages:
    try:
        total += int(a)
    except ValueError:
        print("skipping bad value:", a)
print("total", total)</div>
  <div class="fx" data-lang="text">skipping bad value: forty
total 59</div>
  <p>There are two more optional parts. <code>else</code> runs only when the try part succeeded. <code>finally</code> runs every time, whether it failed or not, even if there was a <code>return</code>. The picture shows the four parts and which paths run.</p>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
    <defs><marker id="pi-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="62" width="90" height="40" rx="6" class="fb sb"/><text x="38" y="87">try</text>
    <rect x="180" y="12" width="130" height="40" rx="6" class="fg sg"/><text x="218" y="37">else</text>
    <rect x="180" y="112" width="130" height="40" rx="6" class="fr sr"/><text x="210" y="137">except E</text>
    <rect x="400" y="62" width="140" height="40" rx="6" class="fv"/><text x="434" y="87">finally</text>
    <line x1="100" y1="74" x2="178" y2="36" stroke="currentColor" marker-end="url(#pi-ah)"/>
    <line x1="100" y1="92" x2="178" y2="128" stroke="currentColor" marker-end="url(#pi-ah)"/>
    <line x1="310" y1="34" x2="398" y2="74" stroke="currentColor" marker-end="url(#pi-ah)"/>
    <line x1="310" y1="130" x2="398" y2="92" stroke="currentColor" marker-end="url(#pi-ah)"/>
    <text x="96" y="34" class="tg">no error</text><text x="120" y="140" class="tr">raised</text>
    <text x="400" y="125" class="tm">always runs:</text><text x="400" y="140" class="tm">close, release, log</text>
  </svg><figcaption>Exactly one of else / except runs. finally runs every time, even after return.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bank transfer: attempt it (<code>try</code>), handle a frozen account (<code>except</code>), send the SMS only on success (<code>else</code>), and always end the session (<code>finally</code>).</p></div>
  <div class="fx" data-lang="py">def parse(s):
    try:
        n = int(s)
    except ValueError as e:
        print(f"  except: {e}")
        return None
    else:
        print("  else: parsed", n)
        return n
    finally:
        print("  finally: always runs")

for s in ["42", "abc"]:
    print(f"parse({s!r}) -&gt;", parse(s))</div>
  <div class="fx" data-lang="text">  else: parsed 42
  finally: always runs
parse('42') -&gt; 42
  except: invalid literal for int() with base 10: 'abc'
  finally: always runs
parse('abc') -&gt; None</div>
  <p>Follow the output for <code>"abc"</code>: <code>int("abc")</code> fails, so the <code>except</code> part runs and returns <code>None</code>. But before the function actually returns, <code>finally</code> prints its line. That is what "always runs" means.</p>
  <ul>
    <li>Keep <code>try</code> tiny: only the line that can fail. Put the follow-up work in <code>else</code>, so its bugs are not hidden by your except.</li>
    <li>Several types: <code>except (ValueError, TypeError) as e:</code>. Order from most specific to most general.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>A bare <code>except:</code> also catches <code>KeyboardInterrupt</code> and <code>SystemExit</code>, so Ctrl+C stops working. Catch only what you expect. Use <code>except Exception</code> only at the top level, and log it.</p></div>

  <h2 id="pi-raise"><span class="num">02</span>Raising &amp; Custom Exception Hierarchies</h2>
  <p>So far Python raised the errors. You can raise them too. If someone passes a negative age to your function, the right move is to stop at once with a clear message, instead of letting a wrong number travel through the whole pipeline. The <code>raise</code> keyword does this.</p>
  <div class="fx" data-lang="py">def set_age(age):
    if age &lt; 0:
        raise ValueError(f"age cannot be negative, got {age}")
    return age
print(set_age(31))
print(set_age(-4))</div>
  <div class="fx" data-lang="text">31
Traceback (most recent call last):
  File "i3.py", line 6, in &lt;module&gt;
    print(set_age(-4))
          ~~~~~~~^^^^
  File "i3.py", line 3, in set_age
    raise ValueError(f"age cannot be negative, got {age}")
ValueError: age cannot be negative, got -4</div>
  <p>Built-in error types cover the common cases: <code>ValueError</code> for a bad value, <code>KeyError</code> for a missing dict key, <code>FileNotFoundError</code> for a missing file. For your own project you can make a <strong>custom exception</strong>: your own error class, built on <code>Exception</code>. Why: callers can then tell "bad data" apart from "model file missing" and handle each one differently.</p>
  <p>Error types form a family tree. Catching a parent also catches all its children. In the picture, <code>except Exception</code> catches everything in the blue and green boxes, but not <code>KeyboardInterrupt</code> (Ctrl+C), which sits on a separate branch on purpose.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <g stroke="currentColor" opacity="0.6"><line x1="240" y1="32" x2="240" y2="52"/><line x1="100" y1="52" x2="440" y2="52"/><line x1="100" y1="52" x2="100" y2="66"/><line x1="240" y1="52" x2="240" y2="66"/><line x1="440" y1="52" x2="440" y2="66"/>
    <line x1="240" y1="90" x2="240" y2="106"/><line x1="70" y1="106" x2="480" y2="106"/><line x1="70" y1="106" x2="70" y2="118"/><line x1="200" y1="106" x2="200" y2="118"/><line x1="330" y1="106" x2="330" y2="118"/><line x1="480" y1="106" x2="480" y2="118"/>
    <line x1="480" y1="142" x2="480" y2="150"/><line x1="398" y1="150" x2="535" y2="150"/><line x1="398" y1="150" x2="398" y2="158"/><line x1="535" y1="150" x2="535" y2="158"/>
    <line x1="200" y1="142" x2="200" y2="158"/></g>
    <rect x="180" y="8" width="120" height="24" rx="4" class="fs" stroke="currentColor"/><text x="190" y="25">BaseException</text>
    <rect x="30" y="66" width="140" height="24" rx="4" class="fs" stroke="currentColor"/><text x="36" y="83" class="tm">KeyboardInterrupt</text>
    <rect x="190" y="66" width="100" height="24" rx="4" class="fb sb"/><text x="202" y="83">Exception</text>
    <rect x="390" y="66" width="100" height="24" rx="4" class="fs" stroke="currentColor"/><text x="398" y="83" class="tm">SystemExit</text>
    <rect x="20" y="118" width="100" height="24" rx="4" class="fb sb"/><text x="28" y="135">ValueError</text>
    <rect x="140" y="118" width="120" height="24" rx="4" class="fg sg"/><text x="146" y="135">PipelineError</text>
    <rect x="280" y="118" width="100" height="24" rx="4" class="fb sb"/><text x="296" y="135">KeyError</text>
    <rect x="440" y="118" width="80" height="24" rx="4" class="fb sb"/><text x="455" y="135">OSError</text>
    <rect x="120" y="158" width="160" height="24" rx="4" class="fg sg"/><text x="126" y="175">DataValidationError</text>
    <rect x="330" y="158" width="136" height="24" rx="4" class="fb sb"/><text x="336" y="175">FileNotFoundError</text>
    <rect x="475" y="158" width="120" height="24" rx="4" class="fb sb"/><text x="480" y="175">PermissionError</text>
  </svg><figcaption>Built-in tree (blue) with your own branch (green). <code>except Exception</code> skips Ctrl+C and sys.exit on purpose.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hospital's complaint desk. "Billing problem" is a family; "wrong GST on bill" is one specific type. A clerk can handle all billing issues, or only the GST ones.</p></div>
  <p>Make one base class per project. Callers can catch "anything from my pipeline" and still tell specific failures apart. Store details as attributes (like <code>self.column</code>), not only in the message, so code can read them. <code>super().__init__(msg)</code> passes the message up to <code>Exception</code>, so it prints normally.</p>
  <div class="fx" data-lang="py">class PipelineError(Exception):
    """Base for everything our pipeline raises."""

class DataValidationError(PipelineError):
    def __init__(self, column, msg):
        self.column = column                       # machine-readable context
        super().__init__(f"column {column!r}: {msg}")

class ModelNotFoundError(PipelineError):
    pass

def validate(row):
    if row["age"] &lt; 0:
        raise DataValidationError("age", "must be &gt;= 0")

try:
    validate({"age": -3})
except DataValidationError as e:                   # specific first
    print("bad data -&gt;", e, "| column:", e.column)
except PipelineError:                              # then the family
    print("other pipeline failure")

def load_config(path):
    try:
        return open(path).read()
    except FileNotFoundError as e:
        raise PipelineError(f"config missing: {path}") from e   # chain

try:
    load_config("nope.yaml")
except PipelineError as e:
    print(type(e).__name__, "|", e, "| cause:", type(e.__cause__).__name__)</div>
  <div class="fx" data-lang="text">bad data -&gt; column 'age': must be &gt;= 0 | column: age
PipelineError | config missing: nope.yaml | cause: FileNotFoundError</div>
  <p>The second half shows <strong>chaining</strong>. <code>open</code> failed with a low-level <code>FileNotFoundError</code>. <code>load_config</code> wraps it in a <code>PipelineError</code> with a friendlier message, and <code>from e</code> keeps the original attached as <code>__cause__</code>, so nothing is lost when debugging.</p>
  <table class="tbl">
    <tr><th>Form</th><th>Does</th><th>Use when</th></tr>
    <tr><td><code>raise ValueError("…")</code></td><td>New exception</td><td>Input breaks a rule</td></tr>
    <tr><td><code>raise</code></td><td>Re-raise the current one, traceback kept</td><td>Log/cleanup, then pass it on</td></tr>
    <tr><td><code>raise New(…) from e</code></td><td>Wrap; keeps the original as <code>__cause__</code></td><td>Turn low-level errors into your own words</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Subclass <code>Exception</code>, not <code>BaseException</code>. And do not catch-and-return-None everywhere: silent failures become wrong numbers later. Fail early and loudly.</p></div>

  <h2 id="pi-log"><span class="num">03</span>Logging Exceptions with Tracebacks</h2>
  <p>A training job runs at 2 AM on a server. Nobody is watching the screen. When it fails, the only way to know what happened is a written record. <strong>Logging</strong> writes messages with a time stamp and a <strong>level</strong> (how serious: DEBUG, INFO, WARNING, ERROR, CRITICAL) to the console or a file. You can later turn the detail up or down without changing code, which <code>print</code> cannot do.</p>
  <p>The most useful thing to record when something fails is the traceback (the list of calls that led to the error). <code>print(e)</code> gives only the last line of it. <code>log.exception</code> records all of it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A plane's black box. <code>print(e)</code> is a passenger saying "something went wrong". <code>log.exception</code> is the full recording.</p></div>
  <div class="fx" data-lang="py">import logging
logging.basicConfig(level=logging.INFO,
                    format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("etl")          # usually getLogger(__name__)

def score(batch):
    return sum(batch) / len(batch)

for batch in [[1, 2, 3], []]:
    try:
        log.info("score=%.2f", score(batch))
    except ZeroDivisionError:
        log.exception("empty batch, skipping")   # message + traceback</div>
  <div class="fx" data-lang="text">INFO etl: score=2.00
ERROR etl: empty batch, skipping
Traceback (most recent call last):
  File "score.py", line 11, in &lt;module&gt;
    log.info("score=%.2f", score(batch))
                           ~~~~~^^^^^^^
  File "score.py", line 7, in score
    return sum(batch) / len(batch)
           ~~~~~~~~~~~^~~~~~~~~~~~
ZeroDivisionError: division by zero</div>
  <p>(File paths shortened.) The loop kept going, and the log has everything needed to debug at 2 AM.</p>
  <p><code>log.exception</code> = <code>log.error(..., exc_info=True)</code>, and works only inside <code>except</code>. <code>print(e)</code> loses the stack, level and time. Pass values as args (<code>log.debug("x=%s", x)</code>), so formatting is skipped when that level is off.</p>

  <h2 id="pi-txt"><span class="num">04</span>Text Files &amp; pathlib</h2>
  <p>Everything so far lived in memory and vanished when the program ended. Files are how data stays. <code>open()</code> connects your program to a file. The <strong>mode</strong> says what you plan to do: read, write or add at the end. When you are done, the file must be closed, or writes may not be saved. The <code>with</code> block closes it for you, even if an error happens halfway.</p>
  <div class="fx" data-lang="py">with open("hello.txt", "w", encoding="utf-8") as f:
    f.write("namaste\\n")
with open("hello.txt", encoding="utf-8") as f:
    print(f.read())</div>
  <div class="fx" data-lang="text">namaste
</div>
  <p><code>f</code> is the open file. <code>"\\n"</code> is the newline character, the invisible "enter" at the end of a line. The extra blank line in the output is that newline being printed.</p>
  <table class="tbl">
    <tr><th>Mode</th><th>Meaning</th><th>If file exists</th></tr>
    <tr><td><code>"r"</code></td><td>Read text (default)</td><td>Missing → FileNotFoundError</td></tr>
    <tr><td><code>"w"</code></td><td>Write text</td><td><strong>Empties it first</strong></td></tr>
    <tr><td><code>"a"</code></td><td>Append</td><td>Writes at the end</td></tr>
    <tr><td><code>"x"</code></td><td>Create new</td><td>FileExistsError (safe "don't overwrite")</td></tr>
    <tr><td><code>"rb" / "wb"</code></td><td>Binary (pickle, parquet, images)</td><td>No decoding, no newline changes</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>"w"</code> is tearing out all pages and writing fresh. <code>"a"</code> is writing on the next blank page of a diary.</p></div>
  <div class="fx" data-lang="py">from pathlib import Path
p = Path("notes.txt")
with open(p, "w", encoding="utf-8") as f:     # "w" truncates, "a" appends
    f.write("line one\\nline two\\n")
with open(p, "a", encoding="utf-8") as f:
    f.write("line three\\n")
with open(p, encoding="utf-8") as f:
    for i, line in enumerate(f, 1):            # streams, low memory
        print(i, line.rstrip())
print(repr(p.read_text(encoding="utf-8")[:9]))
print(f.closed)                                # with closed it for us</div>
  <div class="fx" data-lang="text">1 line one
2 line two
3 line three
'line one\\n'
True</div>
  <div class="callout trap"><span class="label">Trap</span><p>Always pass <code>encoding="utf-8"</code>. The default depends on the OS (cp1252 on many Windows machines). And never <code>f.read()</code> a 20 GB log — loop over the file line by line.</p></div>
  <p>A <strong>path</strong> is the address of a file: <code>project/data/raw/jan.csv</code>. Building it by gluing strings together breaks easily (a missing slash, or Windows using backslashes). <strong>pathlib</strong> treats a path as an object. <code>/</code> joins parts correctly on every OS, and the path knows its own name, extension and folder.</p>
  <div class="fx" data-lang="py">from pathlib import Path
root = Path("project")
raw = root / "data" / "raw"
raw.mkdir(parents=True, exist_ok=True)
for name in ["jan.csv", "feb.csv", "notes.md"]:
    (raw / name).write_text("x\\n")
p = raw / "jan.csv"
print(p, p.name, p.stem, p.suffix, p.parent)
print(p.exists(), p.with_suffix(".parquet").name)
print(sorted(f.name for f in raw.glob("*.csv")))
print(sorted(str(f) for f in root.rglob("*.md")))</div>
  <div class="fx" data-lang="text">project/data/raw/jan.csv jan.csv jan .csv project/data/raw
True jan.parquet
['feb.csv', 'jan.csv']
['project/data/raw/notes.md']</div>
  <p><code>mkdir(parents=True, exist_ok=True)</code> creates the folder and any missing parent folders, and does not complain if it already exists. <code>glob("*.csv")</code> lists matching files in one folder; <code>rglob</code> also looks inside sub-folders.</p>

  <h2 id="pi-csv"><span class="num">05</span>CSV &amp; JSON</h2>
  <p>Data has to travel between programs: from a database to your notebook, from a website to your script. Two plain-text formats do most of this work. <strong>CSV</strong> (comma-separated values) is a table: one row per line, columns split by commas. <strong>JSON</strong> is nested data, written almost like Python dicts and lists. Both are readable by humans, and every language can read them.</p>
  <div class="cards">
    <div><b>CSV</b><p>Flat table, all text</p><small>💡 a marksheet: rows and columns</small></div>
    <div><b>JSON</b><p>Nested dicts and lists</p><small>💡 a Swiggy order: items inside the order, addons inside items</small></div>
  </div>
  <div class="fx" data-lang="py">import csv
rows = [{"user": "asha", "clicks": 3}, {"user": "ben", "clicks": 5}]
with open("clicks.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["user", "clicks"])
    w.writeheader()
    w.writerows(rows)
print(open("clicks.csv").read())
with open("clicks.csv", newline="", encoding="utf-8") as f:
    back = list(csv.DictReader(f))
print(back)                              # everything comes back as str</div>
  <div class="fx" data-lang="text">user,clicks
asha,3
ben,5

[{'user': 'asha', 'clicks': '3'}, {'user': 'ben', 'clicks': '5'}]</div>
  <div class="fx" data-lang="py">import pandas as pd
df = pd.read_csv("clicks.csv")           # infers types
print(df)
print(df.dtypes)</div>
  <div class="fx" data-lang="text">   user  clicks
0  asha       3
1   ben       5
user        str
clicks    int64
dtype: object</div>
  <p>Notice <code>'3'</code> in quotes: the csv module gives back every value as text, because a CSV file has no idea what type a column is. pandas looks at the values and guesses (<code>int64</code> for clicks). <code>newline=""</code> lets the csv module handle line endings itself (otherwise Windows gets blank rows). Use the csv module to stream small files; pandas for analysis.</p>
  <p>JSON looks like Python, but it is text. <code>json.loads</code> turns the text into real dicts and lists; <code>json.dumps</code> turns them back into text. The "s" means "string". Without the "s", <code>json.load</code> and <code>json.dump</code> work with a file instead.</p>
  <div class="fx" data-lang="py">import json
text = '{"name": "Asha", "marks": [88, 92], "passed": true}'
data = json.loads(text)          # text -&gt; Python objects
print(type(data), data["marks"][0], data["passed"])
print(json.dumps(data))          # Python objects -&gt; text</div>
  <div class="fx" data-lang="text">&lt;class 'dict'&gt; 88 True
{"name": "Asha", "marks": [88, 92], "passed": true}</div>
  <p>Not every Python value has a JSON form. The code below shows what happens to tuples, number keys and dates. <code>default=str</code> tells <code>dumps</code> "if you do not know a type, turn it into a string".</p>
  <div class="fx" data-lang="py">import json
from datetime import date
cfg = {"model": "xgb", "lr": 0.1, "layers": [64, 32], "early_stop": True, "seed": None}
with open("cfg.json", "w", encoding="utf-8") as f:
    json.dump(cfg, f, indent=2)                # dump = to file, dumps = to str
with open("cfg.json", encoding="utf-8") as f:
    back = json.load(f)
print(back == cfg, back["layers"])
print(json.dumps({"t": (1, 2), 1: "a"}))      # tuple-&gt;list, int key-&gt;str
try:
    json.dumps({"d": date(2024, 5, 1)})
except TypeError as e:
    print("TypeError:", e)
print(json.dumps({"d": date(2024, 5, 1)}, default=str))</div>
  <div class="fx" data-lang="text">True [64, 32]
{"t": [1, 2], "1": "a"}
TypeError: Object of type date is not JSON serializable
{"d": "2024-05-01"}</div>
  <table class="tbl">
    <tr><th>Python</th><th>JSON</th><th>Comes back as</th></tr>
    <tr><td>dict / list / tuple</td><td>object / array / array</td><td>dict / list / <strong>list</strong></td></tr>
    <tr><td>True / None</td><td>true / null</td><td>True / None</td></tr>
    <tr><td>int dict key</td><td>string key</td><td><strong>str</strong> key</td></tr>
    <tr><td>datetime, numpy types, set</td><td>— TypeError</td><td>convert first / <code>default=</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>JSON does not round-trip everything: tuples come back as lists and int keys as strings. Dates and numpy numbers fail unless you convert them.</p></div>

  <h2 id="pi-pq"><span class="num">06</span>Parquet</h2>
  <p>A CSV of 1 million transactions has 20 columns, but today's model needs only "amount". With CSV you still read every byte of every row, then parse every text value back into a number. <strong>Parquet</strong> fixes this. It is a binary format (not text) that stores data <em>column by column</em>, remembers each column's type, and compresses it. Reading one column reads only that column's part of the file.</p>
  <figure class="viz"><svg viewBox="0 0 540 160" width="540">
    <text x="10" y="16" class="tm">CSV: row by row, all text</text>
    <g><rect x="10" y="26" width="220" height="22" class="fs" stroke="currentColor"/><text x="16" y="42">42,IN,0.37</text>
    <rect x="10" y="50" width="220" height="22" class="fs" stroke="currentColor"/><text x="16" y="66">7,US,0.91</text>
    <rect x="10" y="74" width="220" height="22" class="fs" stroke="currentColor"/><text x="16" y="90">13,IN,0.05</text></g>
    <text x="10" y="120" class="tr">need "amount"? read every byte</text>
    <text x="290" y="16" class="tm">Parquet: column chunks, typed</text>
    <rect x="290" y="26" width="70" height="70" class="fb sb"/><text x="296" y="44">user_id</text><text x="296" y="62" class="tm">int64</text><text x="296" y="80" class="tm">42 7 13</text>
    <rect x="365" y="26" width="70" height="70" class="fv"/><text x="371" y="44">country</text><text x="371" y="62" class="tm">dict-enc</text><text x="371" y="80" class="tm">IN US IN</text>
    <rect x="440" y="26" width="90" height="70" class="fg sg" stroke-width="3"/><text x="446" y="44">amount</text><text x="446" y="62" class="tm">float64</text><text x="446" y="80" class="tm">.37 .91 .05</text>
    <text x="290" y="120" class="tg">read just this column</text>
    <text x="290" y="140" class="tm">+ min/max stats → skip chunks</text>
  </svg><figcaption>Similar values sit together, so they compress well. A query reads only the columns it needs.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A school keeps one register per subject. To get everyone's Maths marks, you open only the Maths register — not every student's full report card.</p></div>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, os, time
rng = np.random.default_rng(0)
n = 1_000_000
df = pd.DataFrame({"user_id": rng.integers(0, 50_000, n),
                   "country": rng.choice(["IN", "US", "DE"], n),
                   "amount": rng.random(n).round(2)})
df.to_csv("tx.csv", index=False)
df.to_parquet("tx.parquet", index=False)        # needs pyarrow
for f in ["tx.csv", "tx.parquet"]:
    print(f, round(os.path.getsize(f) / 1e6, 1), "MB")
part = pd.read_parquet("tx.parquet", columns=["amount"],
                       filters=[("country", "==", "IN")])
print(part.shape)
print(pd.read_parquet("tx.parquet").dtypes.to_dict() == df.dtypes.to_dict())
t=time.perf_counter(); pd.read_csv("tx.csv"); a=time.perf_counter()-t
t=time.perf_counter(); pd.read_parquet("tx.parquet"); b=time.perf_counter()-t
print(f"read csv {a:.2f}s, parquet {b:.2f}s")</div>
  <div class="fx" data-lang="text">tx.csv 13.7 MB
tx.parquet 3.4 MB
(333364, 1)
True
read csv 0.33s, parquet 0.07s</div>
  <p>Reading the output: the same 1 million rows take 13.7 MB as CSV and 3.4 MB as Parquet. The <code>filters</code> argument returned only the Indian rows of one column, without loading the rest. The types survived the round trip (<code>True</code>), which never happens with CSV. And the full read was about 5× faster.</p>
  <p>Rule of thumb: CSV for small hand-offs, JSON for nested/API data and configs, Parquet as the default for ML datasets, Spark and data lakes.</p>

  <h2 id="pi-pkl"><span class="num">07</span>Pickle &amp; YAML</h2>
  <p>You trained a model for two hours. Tomorrow you want to use it, not train it again. A model is a Python object, not a table, so CSV and JSON cannot hold it. <strong>pickle</strong> turns almost any Python object into bytes and back. Saving an object this way is called <strong>serialising</strong> it. The file is opened in binary mode (<code>"wb"</code>, <code>"rb"</code>) because it is not text.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Like freezing cooked food: you can heat it up later exactly as it was. But a pickle is a parcel that runs instructions when opened — only open ones from people you trust.</p></div>
  <div class="fx" data-lang="py">import pickle
from sklearn.linear_model import LogisticRegression
model = LogisticRegression().fit([[0], [1], [2], [3]], [0, 0, 1, 1])
with open("model.pkl", "wb") as f:            # binary mode
    pickle.dump(model, f)
with open("model.pkl", "rb") as f:
    back = pickle.load(f)
print(back.predict([[2.5]]))

class Evil:                                   # what an attacker ships
    def __reduce__(self):
        import os
        return (os.system, ("echo PWNED: ran a shell command",))
payload = pickle.dumps(Evil())
pickle.loads(payload)                          # just LOADING runs it</div>
  <div class="fx" data-lang="text">[1]
PWNED: ran a shell command</div>
  <p>The first part works as expected: the saved model predicts class 1 for 2.5. The second part is the danger. A pickle file can say "to rebuild me, call this function", and <code>__reduce__</code> lets it name <em>any</em> function, here <code>os.system</code>. Just loading the file ran a shell command.</p>
  <div class="callout trap"><span class="label">Trap — security</span><p><code>pickle.load</code> can run any code. Never unpickle files from unknown sources (downloaded models, user uploads). Pickles also break across library versions. To share: <code>safetensors</code> for weights, ONNX for models, Parquet/JSON for data. <code>joblib</code> uses pickle inside, so it has the same risk.</p></div>
  <p>Settings like learning rate, number of layers and file paths should not be buried in code. They go in a <strong>config file</strong>, so you can change them without editing code. <strong>YAML</strong> is the usual format for this (training params, CI, Kubernetes). It uses indentation for nesting, like Python, and allows comments. <code>yaml.safe_load</code> turns the text into dicts and lists.</p>
  <div class="fx" data-lang="py">import yaml
text = """
model: xgb
params:
  lr: 0.1
  max_depth: 6
features: [age, income]
country: NO
version: 1.10
"""
cfg = yaml.safe_load(text)
print(cfg)
print(yaml.safe_dump({"lr": 0.1, "layers": [64, 32]}, sort_keys=False))
try:
    yaml.safe_load("!!python/object/apply:os.system ['echo hi']")
except yaml.YAMLError as e:
    print(type(e).__name__)</div>
  <div class="fx" data-lang="text">{'model': 'xgb', 'params': {'lr': 0.1, 'max_depth': 6}, 'features': ['age', 'income'], 'country': False, 'version': 1.1}
lr: 0.1
layers:
- 64
- 32

ConstructorError</div>
  <div class="callout trap"><span class="label">Trap</span><p>PyYAML follows YAML 1.1: <code>NO</code> (Norway!) became <code>False</code> and <code>1.10</code> became <code>1.1</code>. Quote such values: <code>country: "NO"</code>, <code>version: "1.10"</code>. Always use <code>safe_load</code> — it refused the <code>os.system</code> tag above. Plain <code>yaml.load</code> with an unsafe loader would run it.</p></div>

  <h2 id="pi-mod"><span class="num">08</span>Modules &amp; Packages</h2>
  <p>You have used <code>import</code> already. <code>import math</code> loads a file called <code>math</code> that ships with Python, and <code>math.sqrt</code> reaches inside it. Your own <code>.py</code> files work exactly the same way.</p>
  <div class="fx" data-lang="py">import math                 # a module that ships with Python
print(math.sqrt(16), math.pi)
from math import sqrt       # pull one name out
print(sqrt(25))</div>
  <div class="fx" data-lang="text">4.0 3.141592653589793
5.0</div>
  <p>A <strong>module</strong> is one <code>.py</code> file. A <strong>package</strong> is a folder of modules. Why split at all: one 3,000-line file is hard to read, test and reuse. Splitting lets you <code>import</code> just the piece you need, and lets tests import your functions without running the whole script.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A kitchen: each drawer (module) holds one kind of tool, and the cupboard (package) holds related drawers. You open the drawer you need, not the whole kitchen.</p></div>
  <div class="fx" data-lang="text">pkg/
├── main.py
└── mlkit/                    ← package (import mlkit)
    ├── __init__.py           ← runs on first import; re-exports API
    ├── utils.py              ← module: def mean(xs)
    └── features/
        ├── __init__.py
        └── scaling.py        ← from ..utils import mean</div>
  <div class="fx" data-lang="py"># mlkit/__init__.py
print("mlkit/__init__ runs once")
from .features.scaling import standardize     # public API re-export
__all__ = ["standardize"]

# mlkit/features/scaling.py
from ..utils import mean                       # relative import
def standardize(xs):
    m = mean(xs)
    return [x - m for x in xs]
print("scaling.__name__ =", __name__)

# main.py
import sys
import mlkit
import mlkit                                   # cached: no second print
from mlkit import standardize
print(standardize([10, 20, 30]))
print("mlkit" in sys.modules, __name__)</div>
  <div class="fx" data-lang="text">$ python main.py
mlkit/__init__ runs once
scaling.__name__ = mlkit.features.scaling
[-10.0, 0.0, 10.0]
True __main__

$ python mlkit/features/scaling.py
ImportError: attempted relative import with no known parent package</div>
  <p>What the output shows. Importing <code>mlkit</code> ran its <code>__init__.py</code> once (the print), which in turn imported <code>scaling</code>, which imported <code>utils</code>. The second <code>import mlkit</code> printed nothing: Python keeps loaded modules in a dict called <code>sys.modules</code> and reuses them. Inside the package, a module's <code>__name__</code> is its full dotted path. A <strong>relative import</strong> (<code>from ..utils</code>) means "go up one folder and find utils". It only works when the file is loaded as part of its package, which is why running <code>scaling.py</code> directly failed.</p>
  <div class="flow"><span>import x</span><span>in sys.modules? → reuse</span><span>else search sys.path</span><span>run file top to bottom once</span><span>cache module object</span></div>
  <p>Running a file inside a package directly breaks relative imports. Run it as a module from the project root: <code>python -m mlkit.features.scaling</code>.</p>
  <p><strong>The <code>__main__</code> guard.</strong> Every module has a variable <code>__name__</code>. When you run a file directly (<code>python tools.py</code>), it is <code>"__main__"</code>. When another file imports it, it is the module's name (<code>"tools"</code>). So <code>if __name__ == "__main__":</code> means "only when run directly". Put the script part (start training, print a demo) under it; keep the functions above it so they can be imported.</p>
  <div class="fx" data-lang="py"># tools.py
def clean(s):
    return s.strip().lower()

print("tools loaded, __name__ =", __name__)
if __name__ == "__main__":
    print("self-test:", clean("  Hello "))</div>
  <div class="fx" data-lang="text">$ python tools.py
tools loaded, __name__ = __main__
self-test: hello
$ python -c "import tools"
tools loaded, __name__ = tools</div>
  <div class="callout trap"><span class="label">Trap</span><p>Without the guard, importing your module also starts its training script. Also: a file named <code>json.py</code>, <code>random.py</code> or <code>pandas.py</code> in your folder hides the real library, because your folder comes first on <code>sys.path</code>.</p></div>
  <p>Since Python 3.3, a folder without <code>__init__.py</code> still imports (a "namespace package"). Still add it for normal packages: it makes the intent clear and holds the public API.</p>

  <h2 id="pi-env"><span class="num">09</span>Environments &amp; Dependencies</h2>
  <p>Libraries like pandas and numpy are not part of Python; you install them with <code>pip</code>. Now imagine two projects on one laptop. Project A needs numpy 1.26 and project B needs numpy 2.3. If there is only one place to install packages, one of the projects breaks. A <strong>virtual environment</strong> (venv) is a private folder of packages for one project. Each project gets its own, and nothing clashes.</p>
  <figure class="viz"><svg viewBox="0 0 540 150" width="540">
    <rect x="10" y="10" width="240" height="100" rx="8" class="fb sb"/><text x="22" y="32">project-A/.venv</text>
    <text x="22" y="56" class="tm">python 3.13</text><text x="22" y="76">numpy 1.26</text><text x="22" y="96">pandas 2.2</text>
    <rect x="290" y="10" width="240" height="100" rx="8" class="fg sg"/><text x="302" y="32">project-B/.venv</text>
    <text x="302" y="56" class="tm">python 3.13</text><text x="302" y="76">numpy 2.3</text><text x="302" y="96">torch 2.8</text>
    <rect x="140" y="122" width="260" height="24" rx="6" class="fs" stroke="currentColor"/><text x="152" y="139" class="tm">system Python: don't install here</text>
  </svg><figcaption>Each project gets its own packages, so different versions never clash.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>Separate tiffin boxes for each person. Your dal never mixes with someone else's sabzi.</p></div>
  <div class="fx" data-lang="text">$ python -m venv .venv
$ source .venv/bin/activate          # Windows: .venv&#92;Scripts&#92;activate
$ which python
.../pyrun/.venv/bin/python
$ pip install "requests==2.32.3"
$ pip freeze
certifi==2026.7.22
charset-normalizer==3.5.2
idna==3.20
requests==2.32.3
urllib3==2.8.0</div>
  <p>Step by step: <code>python -m venv .venv</code> creates the private folder. <code>activate</code> tells the shell to use it, so <code>which python</code> now points inside <code>.venv</code>. One <code>pip install</code> of <code>requests</code> pulled in four more packages that requests itself needs; these are called <em>transitive</em> dependencies. <code>pip freeze</code> lists everything that is installed, with exact versions.</p>
  <p>Now the teammate problem. You send your code; your teammate installs "pandas" and gets a newer version where one function changed, and the code fails. To stop this, a project keeps two lists. A short list of what <em>you</em> asked for (<code>requirements.txt</code> or <code>pyproject.toml</code>), and a <strong>lock file</strong>: the exact version and a <strong>hash</strong> (a fingerprint of the file) of every package, including the transitive ones. Installing from the lock file gives the same result on every machine. <strong>Poetry</strong> (or <code>uv</code>) writes the lock file for you.</p>
  <div class="fx" data-lang="text">$ poetry new churn                     # src/churn/__init__.py, tests/, pyproject.toml
$ poetry add "requests@^2.32"
  - Installing charset-normalizer (3.5.2)
  - Installing idna (3.20)
  - Installing urllib3 (2.8.0)
  - Installing requests (2.34.2)
Writing lock file
$ poetry add --group dev pytest
$ poetry install                       # recreate env exactly from poetry.lock
$ poetry run python -m churn</div>
  <div class="fx" data-lang="text"># pyproject.toml (generated; excerpt)
[project]
name = "churn"
requires-python = "&gt;=3.13"
dependencies = [
    "requests (&gt;=2.32,&lt;3.0)"
]
[dependency-groups]
dev = [
    "pytest (&gt;=9.1.1,&lt;10.0.0)"
]
# poetry.lock: 11 [[package]] entries, exact versions + file hashes</div>
  <table class="tbl">
    <tr><th></th><th>requirements.txt</th><th>Lock file (poetry.lock, uv.lock)</th></tr>
    <tr><td>Written by</td><td>You (or <code>pip freeze</code>)</td><td>The tool, from its resolver</td></tr>
    <tr><td>Contains</td><td>Direct deps, often ranges <code>pandas&gt;=2</code></td><td>Every package in the tree, exact version + hash</td></tr>
    <tr><td>Same install everywhere?</td><td>Only if fully pinned; no hashes by default</td><td>Yes, byte for byte on every machine</td></tr>
    <tr><td>Edit by hand?</td><td>Yes</td><td>Never; regenerate</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>pyproject.toml</code> is the shopping list: "rice, about 5 kg". The lock file is the bill: "India Gate Basmati, 5 kg, batch 2291". Give someone the bill and they buy exactly the same thing.</p></div>
  <div class="callout intu"><span class="label">Key insight</span><p>Two layers: <em>what you want</em> (loose ranges in <code>pyproject.toml</code>) and <em>what you got</em> (the exact lock). Commit both for apps and training pipelines. Libraries publish ranges only. <code>uv</code> (not run here) does the same job as Poetry, much faster, with <code>uv add</code> / <code>uv.lock</code>.</p></div>

  <h2 id="pi-build"><span class="num">10</span>Hands-on: A Tiny, Robust ETL</h2>
  <p>An <strong>ETL</strong> job (Extract, Transform, Load) reads raw data, cleans it and writes it somewhere useful. This one: read settings from a YAML config → read a CSV → check each row with a custom exception → log bad rows and keep going → write Parquet. Every idea from this note in 40 lines. Two of the four rows are bad on purpose.</p>
  <div class="fx" data-lang="text"># users.csv                  # config.yaml
user,age,spend               input: users.csv
asha,31,120.5                output: clean/users.parquet
ben,-4,80                    min_age: 0
chen,40,abc
dia,28,60</div>
  <div class="fx" data-lang="py">import csv, logging, yaml
from pathlib import Path
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("etl")

class RowError(ValueError):
    def __init__(self, line, msg):
        self.line = line
        super().__init__(f"line {line}: {msg}")

def parse(row, line, min_age):
    try:
        age, spend = int(row["age"]), float(row["spend"])
    except ValueError as e:
        raise RowError(line, "not a number") from e
    if age &lt; min_age:
        raise RowError(line, f"age {age} &lt; {min_age}")
    return {"user": row["user"], "age": age, "spend": spend}

def run(cfg_path="config.yaml"):
    cfg = yaml.safe_load(Path(cfg_path).read_text())
    good, bad = [], 0
    with open(cfg["input"], newline="", encoding="utf-8") as f:
        for line, row in enumerate(csv.DictReader(f), start=2):
            try:
                good.append(parse(row, line, cfg["min_age"]))
            except RowError as e:
                bad += 1
                log.warning("skip %s", e)
    out = Path(cfg["output"])
    out.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(good).to_parquet(out, index=False)
    log.info("wrote %d rows to %s (%d skipped)", len(good), out, bad)

if __name__ == "__main__":
    run()
    print(pd.read_parquet("clean/users.parquet"))</div>
  <div class="fx" data-lang="text">WARNING skip line 3: age -4 &lt; 0
WARNING skip line 4: not a number
INFO wrote 2 rows to clean/users.parquet (2 skipped)
   user  age  spend
0  asha   31  120.5
1   dia   28   60.0</div>
  <p><strong>Extend it:</strong> write rejected rows to <code>clean/rejects.csv</code>, and raise a <code>PipelineError</code> if more than 30% of rows fail.</p>

  <h2 id="pi-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>When do <code>else</code> and <code>finally</code> run in a try statement?</summary><div class="qa-body"><code>else</code> runs only if the try block raised nothing. <code>finally</code> always runs: after success, after a handled or unhandled exception, even after a <code>return</code> in try. Use else for success-only work, finally for cleanup.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>def f():<br>&nbsp;&nbsp;try: return "try"<br>&nbsp;&nbsp;finally: print("finally")<br>print(f())</code></summary><div class="qa-body"><code>finally</code> then <code>try</code>. The return value is computed, finally runs, then the function returns. (A <code>return</code> inside finally would replace it — avoid that.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a bare <code>except:</code> dangerous?</summary><div class="qa-body">It catches <code>BaseException</code>, including <code>KeyboardInterrupt</code> and <code>SystemExit</code>. So Ctrl+C and <code>sys.exit</code> stop working, and real bugs get hidden. Catch specific exceptions. Use <code>except Exception</code> only at the top level, and log it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you design exceptions for an ML pipeline library?</summary><div class="qa-body">One base <code>PipelineError(Exception)</code>, plus a subclass per kind of failure (<code>DataValidationError</code>, <code>ModelNotFoundError</code>). Optionally also inherit a built-in (<code>class DataValidationError(PipelineError, ValueError)</code>). Store details as attributes, and wrap low-level errors with <code>raise ... from e</code> so the cause is kept.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>raise</code> vs <code>raise e</code> vs <code>raise New() from e</code>?</summary><div class="qa-body">Bare <code>raise</code> re-raises the current exception unchanged. <code>raise e</code> re-raises the same object (the traceback gains the current line). <code>raise New() from e</code> raises a new exception and links the original as <code>__cause__</code>, printed as "The above exception was the direct cause…".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you log an exception with its traceback?</summary><div class="qa-body">Inside the except block: <code>logger.exception("context message")</code> — ERROR level plus the full traceback. Same as <code>logger.error("...", exc_info=True)</code>. <code>print(e)</code> loses the stack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>with open(...)</code>?</summary><div class="qa-body">It is a context manager: the file is closed when the block ends, even if an error happens mid-read. Leaked file handles cause "too many open files" and lost writes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CSV vs Parquet for a 10 GB training set?</summary><div class="qa-body">Parquet. It stores by column (read only the needed columns), is compressed (here 13.7 MB → 3.4 MB), keeps types (no re-parsing dates/ints), and has per-chunk stats so filters can skip data. CSV is untyped text that must be fully parsed — fine only for small hand-offs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is it safe to load a pickled model someone emailed you?</summary><div class="qa-body">No. Unpickling can call any function through <code>__reduce__</code> — the demo ran a shell command just by loading. Only unpickle trusted files. Prefer safetensors (weights), ONNX, or the framework's own safe format, and pin library versions, since pickles break across versions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why <code>yaml.safe_load</code>, and what are YAML's type gotchas?</summary><div class="qa-body"><code>safe_load</code> builds only plain types. Unsafe loaders can build any Python object, which means running code. Gotchas: <code>NO</code>/<code>yes</code>/<code>on</code> become booleans and <code>1.10</code> becomes float 1.1 — quote such values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>if __name__ == "__main__":</code> do?</summary><div class="qa-body">The block runs only when the file is run directly (<code>__name__</code> is <code>"__main__"</code>), not when it is imported (then <code>__name__</code> is the module name). It keeps scripts importable without side effects like starting training.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when you import a module twice? What is <code>__init__.py</code> for?</summary><div class="qa-body">The first import runs the file and caches the module in <code>sys.modules</code>. Later imports reuse it — no re-run (<code>importlib.reload</code> forces one). <code>__init__.py</code> marks a regular package, runs on first import, and usually re-exports the public API.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>requirements.txt vs a lock file — which gives reproducible builds?</summary><div class="qa-body">The lock file. It records every package in the tree with exact versions and hashes. A requirements.txt usually lists only direct deps, often as ranges, so the other versions drift over time. Commit <code>pyproject.toml</code> + lock for apps; rebuild with <code>poetry install</code> / <code>uv sync</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a virtual environment at all?</summary><div class="qa-body">Isolation: project A can pin numpy 1.26 while project B uses numpy 2.x, and neither breaks the other or the OS's Python. It also makes the dependency list clear and repeatable in CI and Docker.</div></details>
</main>`
});
