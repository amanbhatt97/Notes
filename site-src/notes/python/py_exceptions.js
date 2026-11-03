// notes/python/py_exceptions.js — Exceptions & Error Handling
Object.assign(TOPIC_CONTENT, {
  "py_exceptions": `<main>
<h1>Exceptions &amp; Error Handling</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>Exceptions &amp; Error Handling</span></div>
  <p class="lead">An exception is Python's way of saying "this operation could not be done": <code>int("two")</code>, a missing dict key, a file that is not there. If nothing handles it, the program stops at that line and everything computed so far is lost, so one bad row in a million-row CSV can kill a whole nightly job. Error handling is how you decide which failures are expected (skip the row, retry the request, report it) and which are bugs that should crash loudly. It shows up everywhere in DS/ML and backend work: data validation, ETL pipelines, API clients with retries, and the custom exception classes every library exposes. Every code block below was run on Python 3.13 and shows its real output.</p>

  <h2 id="pex-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Exceptions &amp; Error Handling</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Raised errors &amp; tracebacks</div>
        <ul>
          <li><b>Exception</b> — an object describing a failure; raising it stops normal flow</li>
          <li><b>Traceback</b> — read from the bottom: type + message, then the line, then who called it</li>
          <li><b>Call stack</b> — the chain of active calls; an error unwinds it until caught</li>
          <li>Where you catch decides what survives (whole batch vs one row)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">try / except / else / finally</div>
        <ul>
          <li><b>try</b> — only the risky line(s)</li>
          <li><b>except</b> — first matching type wins → specific first</li>
          <li><b>else</b> — runs only if try raised nothing</li>
          <li><b>finally</b> — always runs, even after <code>return</code> or an uncaught error</li>
          <li>⚠ a <code>return</code> in finally swallows the error</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">What to catch</div>
        <ul>
          <li>BaseException → Exception → ValueError, KeyError, OSError …</li>
          <li>Ctrl+C (KeyboardInterrupt) and SystemExit are <em>not</em> Exception</li>
          <li><code>except (ValueError, KeyError) as e</code></li>
          <li>⚠ bare <code>except:</code> hides typos and swallows Ctrl+C</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">raise &amp; custom errors</div>
        <ul>
          <li><code>raise ValueError("…")</code> for values Python accepts but you don't</li>
          <li>bare <code>raise</code> re-raises the same error</li>
          <li>One base class per project; children per failure kind</li>
          <li>Store context as attributes (<code>e.line</code>, <code>e.field</code>)</li>
          <li>Always subclass <code>Exception</code>, never <code>BaseException</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Chaining &amp; style</div>
        <ul>
          <li><code>raise New(…) from e</code> → <code>__cause__</code>, "direct cause"</li>
          <li>error inside except → <code>__context__</code>, "during handling"</li>
          <li><code>from None</code> hides the cause; <code>add_note</code> adds context</li>
          <li><b>EAFP</b> try first (Pythonic) vs <b>LBYL</b> check first</li>
          <li>⚠ checks can be wrong (<code>"²".isdigit()</code>) or stale (race)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging, assert, groups</div>
        <ul>
          <li><code>log.exception("msg")</code> inside except = ERROR + traceback</li>
          <li>Levels: DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL</li>
          <li><code>assert</code> = "can't happen" check, removed by <code>-O</code></li>
          <li>Never validate input with assert</li>
          <li><code>ExceptionGroup</code> + <code>except*</code>: report many failures at once</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pex-crash"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Exceptions and Tracebacks</span><span class="rm-sub">What raising does; reading a traceback</span></div></div>
      <div class="rm-item rm-done" data-target="pex-stack"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Call Stack and Unwinding</span><span class="rm-sub">Frames, unwinding, where to catch</span></div></div>
      <div class="rm-item rm-done" data-target="pex-try"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">try / except / else / finally</span><span class="rm-sub">Which block runs on each path</span></div></div>
      <div class="rm-item rm-done" data-target="pex-catch"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Exception Hierarchy</span><span class="rm-sub">Specific vs broad, bare except</span></div></div>
      <div class="rm-item rm-done" data-target="pex-raise"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">raise and Re-raise</span><span class="rm-sub">Validation errors, bare raise</span></div></div>
      <div class="rm-item rm-done" data-target="pex-custom"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Custom Exception Classes</span><span class="rm-sub">Base class, subclasses, attributes</span></div></div>
      <div class="rm-item rm-done" data-target="pex-chain"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Exception Chaining</span><span class="rm-sub">from e, from None, add_note</span></div></div>
      <div class="rm-item rm-done" data-target="pex-eafp"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">EAFP vs LBYL</span><span class="rm-sub">Try first vs check first</span></div></div>
      <div class="rm-item rm-done" data-target="pex-log"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Logging Exceptions</span><span class="rm-sub">log.exception, levels, lazy args</span></div></div>
      <div class="rm-item rm-done" data-target="pex-assert"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">assert vs raise</span><span class="rm-sub">Invariants vs input validation, -O</span></div></div>
      <div class="rm-item rm-done" data-target="pex-group"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">ExceptionGroup and except*</span><span class="rm-sub">Raising and handling many errors</span></div></div>
      <div class="rm-item rm-done" data-target="pex-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Error-handling anti-patterns and fixes</span></div></div>
      <div class="rm-item rm-done" data-target="pex-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Syntax, rules and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pex-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Basic to advanced, with answers</span></div></div>
    </div>
  </div>

  <h2 id="pex-crash"><span class="num">01</span>Exceptions and Tracebacks</h2>
  <p>When an operation cannot be completed at runtime, Python <strong>raises an exception</strong>: it stops executing the current line and, unless some code handles it, ends the program with a traceback. The examples below use one small order sheet where everything arrives as text, the way a CSV delivers it; six rows are good (worth 230 in total) and the last three are bad.</p>
  <div class="fx" data-lang="py"># rows.py: an order sheet as text, one dict per row (file lines 2-10; line 1 is the header)
ROWS = [
    {"customer": "Asha",  "item": "masala chai", "qty": "2",   "price": "20"},
    {"customer": "Ben",   "item": "samosa",      "qty": "3",   "price": "15"},
    {"customer": "Asha",  "item": "ginger chai", "qty": "1",   "price": "25"},
    {"customer": "Chen",  "item": "masala chai", "qty": "1",   "price": "20"},
    {"customer": "Dia",   "item": "bun maska",   "qty": "2",   "price": "30"},
    {"customer": "Ben",   "item": "masala chai", "qty": "2",   "price": "20"},
    {"customer": "Esha",  "item": "samosa",      "qty": "two", "price": "15"},   # word, not a number
    {"customer": "Farid", "item": "cold coffee", "qty": "1",   "price": ""},     # missing price
    {"customer": "Gita",  "item": "masala chai", "qty": "-1",  "price": "20"},   # negative qty
]</div>
  <p>The naive loop converts each field with <code>int()</code> and keeps a running total:</p>
  <div class="fx" data-lang="py">from rows import ROWS
total = 0
for row in ROWS:
    total += int(row["qty"]) * int(row["price"])
    print("so far:", total)
print("revenue:", total)</div>
  <div class="fx" data-lang="text">so far: 40
so far: 85
so far: 110
so far: 130
so far: 190
so far: 230
Traceback (most recent call last):
  File "total.py", line 4, in &lt;module&gt;
    total += int(row["qty"]) * int(row["price"])
             ~~~^^^^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'two'</div>
  <p>Six rows succeed and the total reaches 230. On the seventh, <code>int("two")</code> cannot produce a number. Python does not return a wrong value or skip the row: it <strong>stops the program</strong> and prints a report. The final <code>print</code> never runs and the correct total in memory is thrown away.</p>
  <h3>Reading a traceback</h3>
  <p>Read it from the <em>bottom</em> up:</p>
  <ol>
    <li><code>ValueError: invalid literal for int() with base 10: 'two'</code> — <em>what</em> went wrong: the exception's <strong>type</strong> (<code>ValueError</code>: right type, wrong content) and its <strong>message</strong>.</li>
    <li><code>~~~^^^^^^^^^^^^</code> — markers (3.11+) underline the exact sub-expression that failed: <code>int(row["qty"])</code>.</li>
    <li><code>total += int(row["qty"]) * int(row["price"])</code> — the source line that was running.</li>
    <li><code>File "total.py", line 4, in &lt;module&gt;</code> — file, line and function; <code>&lt;module&gt;</code> means top level, not inside a function.</li>
    <li><code>Traceback (most recent call last):</code> — calls are listed oldest first, so the frame that failed is just above the error line.</li>
  </ol>
  <div class="callout anlg"><span class="label">Analogy</span><p>A traceback is a parcel-tracking page read backwards: the bottom line says "parcel damaged", the lines above say at which hub, and further up which hubs it passed through.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>exception</strong> is an object that describes an error found while the program runs (as opposed to a <code>SyntaxError</code>, found when the file is compiled, before anything runs). <strong>Raising</strong> it stops normal flow. If no code handles it, Python prints a <strong>traceback</strong> (type, message, chain of calls) and exits with a non-zero exit code (1).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Reading a traceback from the top gets you lost in calls you did not write. Start at the last line (what), then the frame just above it (where), then walk up to see how you got there.</p></div>

  <h2 id="pex-stack"><span class="num">02</span>The Call Stack and Unwinding</h2>
  <p>Real code fails deep inside nested function calls, so you need to know how an exception travels out of them and who gets a chance to handle it. Each running function call is a <strong>frame</strong> with its own local variables; the frames waiting for each other form the <strong>call stack</strong>. When a frame raises and has no matching handler, Python discards that frame and looks in its caller, then the caller's caller, and so on. Discarding frames one by one is <strong>unwinding the stack</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A fire alarm on the 4th floor. If nobody on the 4th floor handles it, the floor is evacuated and the alarm passes to the 3rd floor's warden, then the 2nd, then the 1st. If no warden handles it, the building closes (the program ends).</p></div>
  <div class="fx" data-lang="py">from rows import ROWS

def to_int(text):
    return int(text)

def parse_row(row):
    return to_int(row["qty"]) * to_int(row["price"])

def import_day(rows):
    total = 0
    for row in rows:
        total += parse_row(row)
    return total

def main():
    print("revenue:", import_day(ROWS))

main()</div>
  <div class="fx" data-lang="text">Traceback (most recent call last):
  File "day.py", line 18, in &lt;module&gt;
    main()
    ~~~~^^
  File "day.py", line 16, in main
    print("revenue:", import_day(ROWS))
                      ~~~~~~~~~~^^^^^^
  File "day.py", line 12, in import_day
    total += parse_row(row)
             ~~~~~~~~~^^^^^
  File "day.py", line 7, in parse_row
    return to_int(row["qty"]) * to_int(row["price"])
           ~~~~~~^^^^^^^^^^^^
  File "day.py", line 4, in to_int
    return int(text)
ValueError: invalid literal for int() with base 10: 'two'</div>
  <p>The traceback has one entry per frame, oldest at the top: module → <code>main</code> → <code>import_day</code> → <code>parse_row</code> → <code>to_int</code>, which failed at <code>int(text)</code>. It is a snapshot of the stack at the moment of failure.</p>
  <figure class="viz"><svg viewBox="0 0 620 210" width="620">
<defs><marker id="pex-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="20" y="18" class="tm" font-size="11">the stack when int("two") fails (newest on top)</text>
<rect x="20" y="28" width="250" height="32" rx="5" class="fr sr"/><text x="32" y="49" font-size="12">to_int("two") · int(text) raises</text>
<rect x="20" y="64" width="250" height="32" rx="5" class="fb sb"/><text x="32" y="85" font-size="12">parse_row(Esha's row)</text>
<rect x="20" y="100" width="250" height="32" rx="5" class="fb sb"/><text x="32" y="121" font-size="12">import_day(ROWS) · total = 230</text>
<rect x="20" y="136" width="250" height="32" rx="5" class="fb sb"/><text x="32" y="157" font-size="12">main()</text>
<rect x="20" y="172" width="250" height="32" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="32" y="193" font-size="12">&lt;module&gt;</text>
<path d="M280,44 C330,44 330,80 282,80" fill="none" stroke="currentColor" marker-end="url(#pex-a1)"/>
<path d="M280,80 C330,80 330,116 282,116" fill="none" stroke="currentColor" marker-end="url(#pex-a1)"/>
<path d="M280,116 C330,116 330,152 282,152" fill="none" stroke="currentColor" marker-end="url(#pex-a1)"/>
<path d="M280,152 C330,152 330,188 282,188" fill="none" stroke="currentColor" marker-end="url(#pex-a1)"/>
<text x="345" y="50" font-size="11">1. no handler in to_int → frame dropped</text>
<text x="345" y="86" font-size="11">2. none in parse_row → dropped</text>
<text x="345" y="122" font-size="11">3. none in import_day → dropped,</text>
<text x="360" y="137" class="tr" font-size="11">   its total (230) is lost with it</text>
<text x="345" y="158" font-size="11">4. none in main → dropped</text>
<text x="345" y="194" font-size="11">5. none at top level → traceback, exit</text>
</svg><figcaption>Unwinding: the exception climbs the stack one frame at a time, discarding each frame's local variables, until a matching <code>except</code> is found or the program ends.</figcaption></figure>
  <h3>Watching frames leave</h3>
  <p>To see unwinding, each function below prints on entry and, in a <code>finally</code> block (section 03: "run this on the way out, whatever happens"), on exit. Only the last good row and the first bad row are imported, and the error is caught at the very top.</p>
  <div class="fx" data-lang="py">from rows import ROWS

def to_int(text):
    print("    enter to_int", repr(text))
    try:
        return int(text)
    finally:
        print("    leave to_int")

def parse_row(row):
    print("  enter parse_row", row["customer"])
    try:
        return to_int(row["qty"]) * to_int(row["price"])
    finally:
        print("  leave parse_row")

def import_day(rows):
    print("enter import_day")
    total = 0
    for row in rows:
        total += parse_row(row)
    print("leave import_day normally")      # never printed
    return total

try:
    import_day(ROWS[5:7])        # Ben (fine), then Esha ("two")
except ValueError as e:
    print("caught at the top:", e)</div>
  <div class="fx" data-lang="text">enter import_day
  enter parse_row Ben
    enter to_int '2'
    leave to_int
    enter to_int '20'
    leave to_int
  leave parse_row
  enter parse_row Esha
    enter to_int 'two'
    leave to_int
  leave parse_row
caught at the top: invalid literal for int() with base 10: 'two'</div>
  <p>For Esha, <code>to_int('two')</code> raises; its <code>finally</code> runs as the frame is dropped; <code>parse_row</code>'s <code>finally</code> runs next (the second <code>to_int</code> call for the price never happens); <code>import_day</code> is abandoned mid-loop, so its <code>total</code> disappears and "leave import_day normally" never prints. The top-level <code>except</code> finally catches it.</p>
  <h3>Where you catch decides what survives</h3>
  <div class="fx" data-lang="py">from rows import ROWS

def parse_row(row):
    return int(row["qty"]) * int(row["price"])

def import_day_catch_outside(rows):          # one try around the whole loop
    try:
        return sum(parse_row(r) for r in rows)
    except ValueError:
        return None

def import_day_catch_inside(rows):           # one try per row
    total, bad = 0, 0
    for r in rows:
        try:
            total += parse_row(r)
        except ValueError:
            bad += 1
    return total, bad

print("catch outside:", import_day_catch_outside(ROWS))
print("catch inside: ", import_day_catch_inside(ROWS))</div>
  <div class="fx" data-lang="text">catch outside: None
catch inside:  (210, 2)</div>
  <p>Caught outside the loop, one bad row throws away the whole batch (<code>None</code>). Caught inside, only bad rows are lost: 210 with 2 bad. It is 210, not 230, because <code>int("two")</code> and <code>int("")</code> raise but <code>-1 × 20</code> is perfectly valid to Python; section 05 fixes that with <code>raise</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>call stack</strong> is the list of function calls currently running, each a <strong>frame</strong> with its own locals. An unhandled exception <strong>unwinds</strong> the stack: frames are discarded one by one, running their <code>finally</code> blocks, until a matching <code>except</code> is found. A frame that is unwound never returns a value.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>One big <code>try</code> around everything "to be safe" makes one bad item cost the whole job. Put the handler at the level of the unit you are willing to lose: one row, one file, one request.</p></div>

  <h2 id="pex-try"><span class="num">03</span>try / except / else / finally</h2>
  <p>A <code>try</code> statement has up to four blocks, and knowing exactly which ones run on success, on an expected failure and on an unexpected failure is a classic interview topic.</p>
  <ul>
    <li><code>try:</code> the code that might fail. Keep it as small as possible.</li>
    <li><code>except SomeError as e:</code> runs only if the try block raised <code>SomeError</code> or a subclass; <code>e</code> is the exception object.</li>
    <li><code>else:</code> runs only if the try block raised <em>nothing</em>. Put the "success" work here, so its own bugs are not caught by mistake.</li>
    <li><code>finally:</code> runs <em>always</em>: after success, after a handled error, after an unhandled error, even after <code>return</code>. Use it for cleanup (close a file, release a lock).</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 580 180" width="580">
<defs><marker id="pex-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="68" width="100" height="40" rx="6" class="fb sb"/><text x="60" y="93" text-anchor="middle" font-size="13">try</text>
<rect x="190" y="10" width="140" height="40" rx="6" class="fg sg"/><text x="260" y="35" text-anchor="middle" font-size="13">else</text>
<rect x="190" y="68" width="140" height="40" rx="6" class="fr sr"/><text x="260" y="93" text-anchor="middle" font-size="13">except E</text>
<rect x="190" y="126" width="140" height="40" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="260" y="151" text-anchor="middle" font-size="12">(no match)</text>
<rect x="420" y="68" width="140" height="40" rx="6" class="fv"/><text x="490" y="93" text-anchor="middle" font-size="13">finally</text>
<line x1="110" y1="80" x2="188" y2="34" stroke="currentColor" marker-end="url(#pex-a2)"/><line x1="110" y1="88" x2="188" y2="88" stroke="currentColor" marker-end="url(#pex-a2)"/><line x1="110" y1="96" x2="188" y2="144" stroke="currentColor" marker-end="url(#pex-a2)"/>
<line x1="330" y1="32" x2="418" y2="80" stroke="currentColor" marker-end="url(#pex-a2)"/><line x1="330" y1="88" x2="418" y2="88" stroke="currentColor" marker-end="url(#pex-a2)"/><line x1="330" y1="146" x2="418" y2="98" stroke="currentColor" marker-end="url(#pex-a2)"/>
<text x="118" y="44" class="tg" font-size="10.5">no error</text><text x="128" y="82" class="tr" font-size="10.5">E raised</text><text x="104" y="140" class="tm" font-size="10.5">other error</text>
<text x="420" y="130" class="tm" font-size="10.5">always runs; then:</text><text x="420" y="146" class="tm" font-size="10.5">continue, or keep</text><text x="420" y="162" class="tm" font-size="10.5">unwinding (no match)</text>
</svg><figcaption>At most one of else / except runs. finally runs on every path; on the "no match" path the exception continues unwinding after finally.</figcaption></figure>
  <h3>All three paths traced</h3>
  <div class="fx" data-lang="py">def read_qty(text):
    print(f"read_qty({text!r})")
    try:
        qty = int(text)
    except ValueError:
        print("  except: not a number")
        return None
    else:
        print("  else: parsed", qty)
        return qty
    finally:
        print("  finally: always")

for text in ["2", "two", None]:
    try:
        print("  caller got:", read_qty(text))
    except TypeError as e:
        print("  escaped to the caller -&gt; TypeError:", e)</div>
  <div class="fx" data-lang="text">read_qty('2')
  else: parsed 2
  finally: always
  caller got: 2
read_qty('two')
  except: not a number
  finally: always
  caller got: None
read_qty(None)
  finally: always
  escaped to the caller -&gt; TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'</div>
  <table class="tbl"><caption>What ran on each path</caption>
    <tr><th>input</th><th>try</th><th>except ValueError</th><th>else</th><th>finally</th><th>caller sees</th></tr>
    <tr><td>"2"</td><td>ok</td><td>—</td><td>runs, returns 2</td><td>runs</td><td>2</td></tr>
    <tr><td>"two"</td><td>raises ValueError</td><td>runs, returns None</td><td>—</td><td>runs</td><td>None</td></tr>
    <tr><td>None</td><td>raises TypeError</td><td>— (no match)</td><td>—</td><td>runs</td><td>the TypeError</td></tr>
  </table>
  <p>"finally: always" prints <em>before</em> "caller got": <code>finally</code> runs before a <code>return</code> in <code>else</code> or <code>except</code> actually hands the value back. For <code>None</code> no handler matched, so after <code>finally</code> the <code>TypeError</code> kept unwinding into the caller.</p>
  <h3>return inside finally</h3>
  <div class="fx" data-lang="py">def f():
    try:
        return "value from try"
    finally:
        print("finally runs before the return completes")

print(f())

def g():
    try:
        raise ValueError("Esha's qty is 'two'")
    finally:
        return "finally's return wins"     # swallows the error!

print(g())</div>
  <div class="fx" data-lang="text">finally runs before the return completes
value from try
finally's return wins</div>
  <p>In <code>g</code>, the <code>return</code> in <code>finally</code> replaces the in-flight <code>ValueError</code>, which vanishes without a trace. A <code>return</code>, <code>break</code> or <code>continue</code> inside <code>finally</code> is a bug pattern (Python 3.14 emits a <code>SyntaxWarning</code> for it).</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>try statement</strong> runs its <code>try</code> block; if an exception is raised, the first <code>except</code> clause whose type matches (instance of that class or a subclass) handles it. <code>else</code> runs only if <code>try</code> raised nothing. <code>finally</code> runs last on every path; an unhandled exception continues unwinding after it. The name bound by <code>except E as e</code> is deleted when the block ends.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A large try block catches errors you did not mean to catch: if five lines are inside and you expect only <code>int()</code> to fail, a <code>ValueError</code> from a bug on another line is treated as "bad data". Keep try to the risky line and move the rest to <code>else</code>.</p></div>

  <h2 id="pex-catch"><span class="num">04</span>The Exception Hierarchy: Catching Specific vs Broad</h2>
  <p>Exception types are classes arranged in an inheritance tree, and <code>except Parent</code> catches the parent and every subclass. Choosing the right level in that tree is the difference between handling expected bad data and silently hiding bugs.</p>
  <div class="fx" data-lang="py">for exc in (ValueError, KeyError, ZeroDivisionError, FileNotFoundError,
            KeyboardInterrupt, SystemExit):
    parents = [c.__name__ for c in exc.__mro__[1:-1]]     # skip itself and 'object'
    print(f"{exc.__name__:18} -&gt; {' -&gt; '.join(parents)}")</div>
  <div class="fx" data-lang="text">ValueError         -&gt; Exception -&gt; BaseException
KeyError           -&gt; LookupError -&gt; Exception -&gt; BaseException
ZeroDivisionError  -&gt; ArithmeticError -&gt; Exception -&gt; BaseException
FileNotFoundError  -&gt; OSError -&gt; Exception -&gt; BaseException
KeyboardInterrupt  -&gt; BaseException
SystemExit         -&gt; BaseException</div>
  <p><code>except LookupError</code> catches <code>KeyError</code> and <code>IndexError</code>; <code>except OSError</code> catches <code>FileNotFoundError</code>, <code>PermissionError</code> and friends; <code>except Exception</code> catches all "normal" errors. <code>KeyboardInterrupt</code> (Ctrl+C) and <code>SystemExit</code> (<code>sys.exit()</code>) sit directly under <code>BaseException</code> on purpose: they are requests to stop, not errors.</p>
  <figure class="viz"><svg viewBox="0 0 620 200" width="620">
<g stroke="currentColor" stroke-opacity="0.6"><line x1="310" y1="34" x2="310" y2="50"/><line x1="110" y1="50" x2="510" y2="50"/><line x1="110" y1="50" x2="110" y2="62"/><line x1="310" y1="50" x2="310" y2="62"/><line x1="510" y1="50" x2="510" y2="62"/>
<line x1="310" y1="86" x2="310" y2="102"/><line x1="70" y1="102" x2="560" y2="102"/><line x1="70" y1="102" x2="70" y2="114"/><line x1="195" y1="102" x2="195" y2="114"/><line x1="320" y1="102" x2="320" y2="114"/><line x1="445" y1="102" x2="445" y2="114"/><line x1="560" y1="102" x2="560" y2="114"/>
<line x1="195" y1="138" x2="195" y2="152"/><line x1="445" y1="138" x2="445" y2="152"/><line x1="560" y1="138" x2="560" y2="152"/></g>
<rect x="250" y="10" width="120" height="24" rx="4" class="fs" stroke="currentColor"/><text x="310" y="27" text-anchor="middle" font-size="11.5">BaseException</text>
<rect x="40" y="62" width="140" height="24" rx="4" class="fs" stroke="currentColor"/><text x="110" y="79" text-anchor="middle" class="tm" font-size="11">KeyboardInterrupt</text>
<rect x="260" y="62" width="100" height="24" rx="4" class="fb sb"/><text x="310" y="79" text-anchor="middle" font-size="11.5">Exception</text>
<rect x="455" y="62" width="110" height="24" rx="4" class="fs" stroke="currentColor"/><text x="510" y="79" text-anchor="middle" class="tm" font-size="11">SystemExit</text>
<rect x="20" y="114" width="100" height="24" rx="4" class="fb sb"/><text x="70" y="131" text-anchor="middle" font-size="11">ValueError</text>
<rect x="135" y="114" width="120" height="24" rx="4" class="fg sg"/><text x="195" y="131" text-anchor="middle" font-size="11">ChaiStallError</text>
<rect x="270" y="114" width="100" height="24" rx="4" class="fb sb"/><text x="320" y="131" text-anchor="middle" font-size="11">LookupError</text>
<rect x="385" y="114" width="120" height="24" rx="4" class="fb sb"/><text x="445" y="131" text-anchor="middle" font-size="11">ArithmeticError</text>
<rect x="515" y="114" width="90" height="24" rx="4" class="fb sb"/><text x="560" y="131" text-anchor="middle" font-size="11">OSError</text>
<rect x="135" y="152" width="120" height="24" rx="4" class="fg sg"/><text x="195" y="169" text-anchor="middle" font-size="11">BadRowError …</text>
<rect x="375" y="152" width="140" height="24" rx="4" class="fb sb"/><text x="445" y="169" text-anchor="middle" font-size="10.5">ZeroDivisionError</text>
<rect x="520" y="152" width="96" height="24" rx="4" class="fb sb"/><text x="568" y="169" text-anchor="middle" font-size="9.5">FileNotFoundError</text>
<text x="320" y="195" text-anchor="middle" class="tm" font-size="10">(KeyError and IndexError sit under LookupError) · green = a custom branch (section 06)</text>
</svg><figcaption><code>except Exception</code> catches everything blue and green, but lets Ctrl+C and <code>sys.exit()</code> through.</figcaption></figure>
  <h3>Catch what you expect, by name</h3>
  <p>A tuple names several expected types in one clause:</p>
  <div class="fx" data-lang="py">def amount(row):
    try:
        return int(row["qty"]) * int(row["price"])
    except (ValueError, KeyError) as e:          # two expected problems, one handler
        return f"{type(e).__name__}: {e}"

print(amount({"qty": "2", "price": "20"}))
print(amount({"qty": "two", "price": "15"}))     # Esha
print(amount({"qty": "1"}))                      # no price column at all
print(amount(None))                              # a bug, not bad data -&gt; not caught</div>
  <div class="fx" data-lang="text">40
ValueError: invalid literal for int() with base 10: 'two'
KeyError: 'price'
Traceback (most recent call last):
  File "amount.py", line 10, in &lt;module&gt;
    print(amount(None))                              # a bug, not bad data -&gt; not caught
          ~~~~~~^^^^^^
  File "amount.py", line 3, in amount
    return int(row["qty"]) * int(row["price"])
               ~~~^^^^^^^
TypeError: 'NoneType' object is not subscriptable</div>
  <p>The first three calls are data problems and are handled as data. <code>amount(None)</code> is a bug in the caller; because only expected types were named, it crashes loudly with a <code>TypeError</code> pointing at the right line, which is exactly what you want from a bug.</p>
  <h3>The bare-except trap</h3>
  <div class="fx" data-lang="py">from rows import ROWS

def revenue(rows):
    total = 0
    for r in rows:
        try:
            total += int(r["qty"]) * int(r["prise"])    # typo: "prise"
        except:                                         # bare except
            pass
    return total

print("revenue:", revenue(ROWS))                 # every row 'failed', silently

for attempt in range(2):
    try:
        raise KeyboardInterrupt                  # what pressing Ctrl+C does here
    except:
        print("attempt", attempt, ": bare except swallowed Ctrl+C")

try:
    try:
        raise KeyboardInterrupt
    except Exception:
        print("never printed")
except KeyboardInterrupt:
    print("except Exception let Ctrl+C through")</div>
  <div class="fx" data-lang="text">revenue: 0
attempt 0 : bare except swallowed Ctrl+C
attempt 1 : bare except swallowed Ctrl+C
except Exception let Ctrl+C through</div>
  <p>Two failures. The typo raises <code>KeyError</code> on every row, the bare except swallows each one, and the program reports revenue 0 with no message: a wrong number with no error is the worst outcome. And Ctrl+C raises <code>KeyboardInterrupt</code> inside whatever is running, which a bare except also swallows, so the program refuses to stop. <code>except Exception</code> lets Ctrl+C through but still hides typos, so it belongs only at the very top of a program, combined with logging (section 09).</p>
  <div class="callout def"><span class="label">Definition</span><p><code>except T</code> matches any exception that is an instance of <code>T</code> or a subclass; <code>except (T1, T2)</code> matches either. Clauses are tried top to bottom and the <strong>first</strong> match wins. A bare <code>except:</code> is the same as <code>except BaseException:</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>In <code>except Exception: … except ValueError: …</code> the second clause can never run, because a <code>ValueError</code> is already an <code>Exception</code>. Write the most specific type first.</p></div>

  <h2 id="pex-raise"><span class="num">05</span>raise and Re-raise</h2>
  <p>Python only raises when <em>it</em> cannot do something; a quantity of −1 is a valid integer, so business rules need their own <code>raise</code>. The <code>raise</code> statement starts the same unwinding Python does, carrying an exception object you choose. A wrong value of the right type is what <code>ValueError</code> means, so raise one with a message naming the rule and the value.</p>
  <div class="fx" data-lang="py">def parse_qty(text):
    qty = int(text)                       # Python raises for 'two'
    if qty &lt;= 0:                          # Python is happy with -1; we are not
        raise ValueError(f"qty must be positive, got {qty}")
    return qty

for text in ["2", "-1", "two"]:
    try:
        print(text, "-&gt;", parse_qty(text))
    except ValueError as e:
        print(text, "-&gt; ValueError:", e)

def import_row(row):
    try:
        return parse_qty(row["qty"])
    except ValueError:
        print("import_row: noting Gita's row, passing the error on")
        raise                             # bare raise: same exception, same traceback

try:
    import_row({"customer": "Gita", "qty": "-1"})
except ValueError as e:
    print("caller still sees:", e)</div>
  <div class="fx" data-lang="text">2 -&gt; 2
-1 -&gt; ValueError: qty must be positive, got -1
two -&gt; ValueError: invalid literal for int() with base 10: 'two'
import_row: noting Gita's row, passing the error on
caller still sees: qty must be positive, got -1</div>
  <p><code>parse_qty</code> now fails two ways, Python's (<code>int("two")</code>) and ours (−1), and the caller handles both with one <code>except ValueError</code>. A <strong>bare <code>raise</code></strong> inside an <code>except</code> block re-raises the exception being handled, unchanged, with its original traceback. Use it when a function wants to <em>notice</em> an error (log, count, clean up) but leave the decision to its caller.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>raise ExcType("message")</code> creates and raises an exception. <code>raise</code> alone, inside an <code>except</code> block, re-raises the current exception. Raise as early as the bad value is detected ("fail fast"), with a message naming the rule and the value.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Returning a sentinel (<code>None</code>, −1, 0) instead of raising makes failure silent: the caller must remember to check, and when it forgets, the sentinel ends up in the totals. Raise, and let the caller decide.</p></div>

  <h2 id="pex-custom"><span class="num">06</span>Custom Exception Classes</h2>
  <p>Once your own validation raises <code>ValueError</code>, bad data and genuine bugs share one type, so <code>except ValueError</code> can no longer skip bad rows without also hiding bugs. A custom exception class gives your failures their own name and their own data. It is just a class that inherits from <code>Exception</code>. Give a project one <strong>base class</strong> (callers catch "anything from this library" in one clause) and a subclass per kind of failure; subclasses can store context as attributes (<code>line</code>, <code>field</code>) that code reads without parsing the message.</p>
  <div class="fx" data-lang="py">from rows import ROWS

class ChaiStallError(Exception):
    """Base class: catch this to catch anything from chaistall."""

class BadRowError(ChaiStallError):
    """One CSV row could not be turned into an order."""
    def __init__(self, line, field, msg):
        self.line = line            # machine-readable context
        self.field = field
        super().__init__(f"line {line}, {field}: {msg}")

class MissingValueError(BadRowError):
    pass

class BadNumberError(BadRowError):
    pass

class TooManyBadRowsError(ChaiStallError):
    pass

def to_int(row, field, line):
    try:
        return int(row[field])
    except ValueError as e:
        raise BadNumberError(line, field, f"{row[field]!r} is not a whole number") from e

def parse_row(row, line):
    for field in ("customer", "item", "qty", "price"):
        if not (row.get(field) or "").strip():
            raise MissingValueError(line, field, "is empty")
    qty, price = to_int(row, "qty", line), to_int(row, "price", line)
    if qty &lt;= 0:
        raise BadNumberError(line, "qty", f"{qty} must be positive")
    return {**row, "qty": qty, "price": price, "amount": qty * price}

good, rejected = [], []
for line, row in enumerate(ROWS, start=2):         # line 1 of the file is the header
    try:
        good.append(parse_row(row, line))
    except BadRowError as e:
        rejected.append(e)

print("revenue:", sum(o["amount"] for o in good), "from", len(good), "orders")
for e in rejected:
    print(f"{type(e).__name__:17} line={e.line} field={e.field:5} | {e}")
e = rejected[0]
print(isinstance(e, BadRowError), isinstance(e, ChaiStallError), isinstance(e, ValueError))</div>
  <div class="fx" data-lang="text">revenue: 230 from 6 orders
BadNumberError    line=8 field=qty   | line 8, qty: 'two' is not a whole number
MissingValueError line=9 field=price | line 9, price: is empty
BadNumberError    line=10 field=qty   | line 10, qty: -1 must be positive
True True False</div>
  <p>Revenue is now exactly 230 from 6 orders, and each rejection carries its class, line and field. The last line shows why this works: a <code>BadNumberError</code> is a <code>BadRowError</code> and a <code>ChaiStallError</code>, but <em>not</em> a <code>ValueError</code>, so a <code>ValueError</code> from a real bug is not caught by <code>except BadRowError</code>. Bugs crash; bad rows are skipped.</p>
  <p>The parts: a class with only a docstring is a complete exception class. <code>BadRowError.__init__</code> stores attributes and calls <code>super().__init__(message)</code> so <code>str(e)</code>, <code>e.args</code> and the traceback show a normal message. <code>MissingValueError</code> and <code>BadNumberError</code> add only a name, and the name is the point. The <code>raise … from e</code> in <code>to_int</code> is chaining (section 07).</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>custom exception</strong> is a class derived from <code>Exception</code> (never directly from <code>BaseException</code>). An <strong>exception hierarchy</strong> is one project base class plus subclasses per failure kind. Context belongs in attributes; the message goes to <code>super().__init__</code>. A class may also inherit a built-in (<code>class BadNumberError(BadRowError, ValueError)</code>) so callers that already catch <code>ValueError</code> keep working.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not make one class per message ("QtyIsTwoError"). Make one class per way the caller will <em>react</em>. Here every bad row is handled the same way (skip and report), so <code>BadRowError</code> is what the loop catches; the children exist for reports and tests.</p></div>

  <h2 id="pex-chain"><span class="num">07</span>Exception Chaining: raise … from</h2>
  <p>Translating a low-level error (<code>int</code> failed) into a domain error (line 8 has a bad qty) gives a better message, but debugging still needs the original. <code>raise NewError(…) from e</code> raises the new error and attaches the old one as its <strong>cause</strong>; an uncaught chain prints both tracebacks.</p>
  <div class="fx" data-lang="py">class BadNumberError(Exception):
    pass

def to_int(text, line):
    try:
        return int(text)
    except ValueError as e:
        raise BadNumberError(f"line {line}: {text!r} is not a whole number") from e

to_int("two", 8)</div>
  <div class="fx" data-lang="text">Traceback (most recent call last):
  File "chain.py", line 6, in to_int
    return int(text)
ValueError: invalid literal for int() with base 10: 'two'

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "chain.py", line 10, in &lt;module&gt;
    to_int("two", 8)
    ~~~~~~^^^^^^^^^^
  File "chain.py", line 8, in to_int
    raise BadNumberError(f"line {line}: {text!r} is not a whole number") from e
BadNumberError: line 8: 'two' is not a whole number</div>
  <p>Bottom: our <code>BadNumberError</code>. "The above exception was the direct cause of the following exception" points up to Python's original <code>ValueError</code> at line 6. Nothing was lost.</p>
  <h3>Implicit chaining: an error inside a handler</h3>
  <p>If code inside an <code>except</code> block itself fails, Python also keeps the first error but uses different wording:</p>
  <div class="fx" data-lang="py">class BadNumberError(Exception):
    pass

def to_int(text, line):
    try:
        return int(text)
    except ValueError:
        raise BadNumberError(f"line {lne}: {text!r} is not a whole number")   # typo: lne

to_int("two", 8)</div>
  <div class="fx" data-lang="text">Traceback (most recent call last):
  File "chain_bug.py", line 6, in to_int
    return int(text)
ValueError: invalid literal for int() with base 10: 'two'

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "chain_bug.py", line 10, in &lt;module&gt;
    to_int("two", 8)
    ~~~~~~^^^^^^^^^^
  File "chain_bug.py", line 8, in to_int
    raise BadNumberError(f"line {lne}: {text!r} is not a whole number")   # typo: lne
                                 ^^^
NameError: name 'lne' is not defined. Did you mean: 'line'?</div>
  <p>"During handling of the above exception, another exception occurred" means a second, unplanned error happened while the first was being handled: a strong hint that the bug is in your <code>except</code> block.</p>
  <h3>__cause__, __context__, from None and add_note</h3>
  <div class="fx" data-lang="py">class BadNumberError(Exception):
    pass

def to_int(text, line, hide_cause=False):
    try:
        return int(text)
    except ValueError as e:
        if hide_cause:
            raise BadNumberError(f"line {line}: {text!r}") from None
        raise BadNumberError(f"line {line}: {text!r}") from e

for hide in (False, True):
    try:
        to_int("two", 8, hide_cause=hide)
    except BadNumberError as e:
        print(f"from {'None' if hide else 'e   '}: __cause__={e.__cause__!r}")
        print(f"          __context__={e.__context__!r}  suppress={e.__suppress_context__}")

try:
    to_int("two", 8)
except BadNumberError as e:
    e.add_note("file: orders_2026-10-19.csv, customer Esha")
    raise</div>
  <div class="fx" data-lang="text">from e   : __cause__=ValueError("invalid literal for int() with base 10: 'two'")
          __context__=ValueError("invalid literal for int() with base 10: 'two'")  suppress=True
from None: __cause__=None
          __context__=ValueError("invalid literal for int() with base 10: 'two'")  suppress=True
Traceback (most recent call last):
  File "cause_notes.py", line 6, in to_int
    return int(text)
ValueError: invalid literal for int() with base 10: 'two'

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "cause_notes.py", line 20, in &lt;module&gt;
    to_int("two", 8)
    ~~~~~~^^^^^^^^^^
  File "cause_notes.py", line 10, in to_int
    raise BadNumberError(f"line {line}: {text!r}") from e
BadNumberError: line 8: 'two'
file: orders_2026-10-19.csv, customer Esha</div>
  <p>Any exception raised inside an <code>except</code> block automatically gets <code>__context__</code>. <code>from e</code> also sets <code>__cause__</code> and <code>__suppress_context__ = True</code>, so the traceback uses the "direct cause" wording. <code>from None</code> sets the cause to <code>None</code> and still suppresses the context: only the new error is shown. <code>e.add_note(…)</code> (3.11+) attaches extra lines to an existing exception without changing its type.</p>
  <table class="tbl">
    <tr><th>form</th><th>what it does</th><th>traceback shows</th><th>use when</th></tr>
    <tr><td><code>raise</code></td><td>re-raises the current exception</td><td>the original only</td><td>log or count, then pass on</td></tr>
    <tr><td><code>raise New(…) from e</code></td><td>new error, <code>__cause__ = e</code></td><td>both, "direct cause"</td><td>translate low-level to domain errors</td></tr>
    <tr><td>(error inside except)</td><td>new error, <code>__context__ = e</code></td><td>both, "during handling"</td><td>never on purpose: a bug in the handler</td></tr>
    <tr><td><code>raise New(…) from None</code></td><td>new error, cause hidden</td><td>new only</td><td>the original is noise for users</td></tr>
    <tr><td><code>e.add_note("…")</code></td><td>adds text to the same error</td><td>note at the end</td><td>add context while passing it on</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Exception chaining</strong> links one exception to another. Explicit: <code>raise X from Y</code> sets <code>X.__cause__ = Y</code>. Implicit: raising inside an <code>except</code> block sets <code>X.__context__</code>. Both are printed, oldest first.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>raise New(str(e))</code> without <code>from e</code> keeps only the message text in the new error; the original survives only as implicit context with the misleading "during handling" wording. When translating on purpose, write <code>from e</code>.</p></div>

  <h2 id="pex-eafp"><span class="num">08</span>EAFP vs LBYL</h2>
  <p>There are two styles for values that might be bad. <strong>LBYL</strong>, "Look Before You Leap", tests first (<code>if text.isdigit(): int(text)</code>). <strong>EAFP</strong>, "Easier to Ask Forgiveness than Permission", just does it and catches the exception. Python generally prefers EAFP, for two concrete reasons shown below: the check may not match the real rule, and the world may change between the check and the action.</p>
  <div class="fx" data-lang="py">from pathlib import Path

MENU = {"masala chai": 20, "ginger chai": 25, "samosa": 15, "bun maska": 30}

def lbyl(text):                      # Look Before You Leap
    return int(text) if text.isdigit() else None

def eafp(text):                      # Easier to Ask Forgiveness than Permission
    try:
        return int(text)
    except ValueError:
        return None

for text in ["2", " 2", "-1", "two", "²"]:
    try:
        a = lbyl(text)
    except ValueError:
        a = "CRASH"
    print(f"{text!r:6} isdigit={text.isdigit()!s:5}  lbyl={a!s:5}  eafp={eafp(text)}")

item = "cold coffee"
print("LBYL :", MENU[item] if item in MENU else "not on menu")
try:
    print("EAFP :", MENU[item])
except KeyError:
    print("EAFP : not on menu")
print("get  :", MENU.get(item, "not on menu"))

p = Path("orders_today.csv")
p.write_text("order_id\\n")
if p.exists():                       # looked: it is there
    p.unlink()                       # ...another program deletes it right now...
    try:
        open(p)
    except FileNotFoundError:
        print("looked first, still failed: FileNotFoundError")</div>
  <div class="fx" data-lang="text">'2'    isdigit=True   lbyl=2      eafp=2
' 2'   isdigit=False  lbyl=None   eafp=2
'-1'   isdigit=False  lbyl=None   eafp=-1
'two'  isdigit=False  lbyl=None   eafp=None
'²'    isdigit=True   lbyl=CRASH  eafp=None
LBYL : not on menu
EAFP : not on menu
get  : not on menu
looked first, still failed: FileNotFoundError</div>
  <p>The check is a guess about what <code>int</code> accepts. <code>isdigit()</code> rejects " 2" and "-1", which <code>int()</code> parses fine, and accepts "²" (superscript two), which <code>int()</code> rejects, so the LBYL version crashes. For dict lookups all styles agree; <code>dict.get(key, default)</code> is the neatest. The file example is a <strong>race condition</strong> (TOCTOU, time-of-check to time-of-use): the check was true when made and false when used. See <a class="xref" data-note="py_concurrency">Concurrency</a> for more on races.</p>
  <table class="tbl">
    <tr><th></th><th>LBYL (check first)</th><th>EAFP (try first)</th></tr>
    <tr><td>Looks like</td><td><code>if key in d: d[key]</code></td><td><code>try: d[key] except KeyError</code></td></tr>
    <tr><td>Correct when</td><td>the check exactly equals the real rule, and nothing can change in between</td><td>always: the operation itself is the test</td></tr>
    <tr><td>Fast when</td><td>failures are common (a check is cheaper than raising)</td><td>failures are rare (a try that succeeds costs almost nothing)</td></tr>
    <tr><td>Good for</td><td>cheap, exact checks: <code>if not rows:</code>, <code>if qty &lt;= 0:</code></td><td>conversions, lookups, files, network</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>EAFP</strong>: attempt the operation and handle the exception. <strong>LBYL</strong>: test preconditions first. Prefer EAFP when success is hard to predict exactly (parsing, lookups, I/O); LBYL is fine for simple, exact conditions you own.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Check the file exists, then open it" is the classic LBYL race. Open it inside <code>try</code> and handle <code>FileNotFoundError</code>.</p></div>

  <h2 id="pex-log"><span class="num">09</span>Logging Exceptions</h2>
  <p>A handled error in a job that runs at 2 AM must leave a record, and <code>print</code> goes to a screen nobody watches, with no time, no severity and no traceback. <strong>Logging</strong> writes messages with a <strong>level</strong> (DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL) through a named <strong>logger</strong>; configuration, done once at startup, decides format, destination and minimum level. Inside an <code>except</code> block, <code>log.exception("…")</code> logs at ERROR <em>and</em> appends the full traceback.</p>
  <div class="fx" data-lang="py">import logging
from rows import ROWS

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("chaistall")

for line, row in enumerate(ROWS[5:7], start=7):        # Ben (fine), Esha ('two')
    try:
        amount = int(row["qty"]) * int(row["price"])
        log.info("line %d ok: Rs %d", line, amount)
    except ValueError as e:
        print("print(e) gives only:", e)
        log.exception("line %d skipped", line)
log.debug("not shown: DEBUG is below the INFO level we set")</div>
  <div class="fx" data-lang="text">INFO chaistall: line 7 ok: Rs 40
print(e) gives only: invalid literal for int() with base 10: 'two'
ERROR chaistall: line 8 skipped
Traceback (most recent call last):
  File "log_demo.py", line 9, in &lt;module&gt;
    amount = int(row["qty"]) * int(row["price"])
             ~~~^^^^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'two'</div>
  <p><code>print(e)</code> produced one bare line; <code>log.exception</code> produced level, logger name, message and the whole traceback. The DEBUG message was filtered out by the INFO threshold. In a package, use <code>logging.getLogger(__name__)</code> so each module's messages carry its own name (<code>chaistall.storage</code>).</p>
  <p>Pass values as arguments (<code>log.info("line %d ok", line)</code>), not as an f-string: the logger formats the string only if the record is actually emitted. A common split: expected, already-explained failures with <code>log.warning("skipped %s", e)</code>; unexpected failures at the top level with <code>log.exception("import failed")</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>logger.exception(msg, *args)</code> logs <code>msg</code> at ERROR level with the current exception's traceback; call it inside an <code>except</code> block. It equals <code>logger.error(msg, *args, exc_info=True)</code>. <code>logging.basicConfig(level=…, format=…)</code> configures the root logger once per program.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>except Exception: pass</code> and <code>except Exception as e: print(e)</code> both destroy the traceback. If you catch broadly at the top of a program, the minimum is <code>log.exception(…)</code>. Handlers, files and log configuration: <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>.</p></div>

  <h2 id="pex-assert"><span class="num">10</span>assert vs raise</h2>
  <p><code>assert condition, "message"</code> states "this is true; if not, my program has a bug", raising <code>AssertionError</code> when the condition is false. It is a cheap way to document invariants inside your own code, and tests use it heavily. The catch: it can be switched off.</p>
  <div class="fx" data-lang="py">def revenue(good):
    assert all(o["qty"] &gt; 0 for o in good), "parse_row let a bad qty through"
    return sum(o["qty"] * o["price"] for o in good)

good = [{"qty": 2, "price": 20}, {"qty": -1, "price": 20}]   # a bug slipped Gita in
print("revenue:", revenue(good))</div>
  <div class="fx" data-lang="text">$ python3 check.py
Traceback (most recent call last):
  File "check.py", line 6, in &lt;module&gt;
    print("revenue:", revenue(good))
                      ~~~~~~~^^^^^^
  File "check.py", line 2, in revenue
    assert all(o["qty"] &gt; 0 for o in good), "parse_row let a bad qty through"
           ~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: parse_row let a bad qty through

$ python3 -O check.py
revenue: 20</div>
  <p>With <code>-O</code>, Python removes every assert statement and the wrong revenue (40 − 20 = 20) goes straight through. An assert must never be the only thing between bad <em>input</em> and your results.</p>
  <table class="tbl">
    <tr><th></th><th><code>raise</code></th><th><code>assert</code></th></tr>
    <tr><td>Meaning</td><td>"this input/situation is not acceptable"</td><td>"this cannot happen unless my code is wrong"</td></tr>
    <tr><td>With <code>python -O</code></td><td>still runs</td><td>removed</td></tr>
    <tr><td>Error type</td><td>any, e.g. <code>BadNumberError</code></td><td>always <code>AssertionError</code></td></tr>
    <tr><td>Example</td><td>qty "two" or −1 in the input</td><td>a negative qty <em>after</em> validation</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><code>assert expr, msg</code> is equivalent to <code>if __debug__ and not expr: raise AssertionError(msg)</code>; <code>__debug__</code> is False under <code>python -O</code>. Use asserts for internal invariants; use <code>raise</code> to validate anything from outside the code.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>assert(qty &gt; 0, "msg")</code> with brackets asserts a non-empty tuple, which is always true (Python warns "assertion is always true"). Write <code>assert qty &gt; 0, "msg"</code>.</p></div>

  <h2 id="pex-group"><span class="num">11</span>ExceptionGroup and except*</h2>
  <p>A <code>raise</code> stops at the first problem, but validation should report every problem at once, and concurrent tasks can fail independently. Python 3.11 added <code>ExceptionGroup(message, [exc1, exc2, …])</code>, one exception wrapping several, and the <code>except*</code> clause, which picks members out by type: each matching <code>except*</code> clause runs once with a sub-group of just those members. The example imports the classes and <code>parse_row</code> from section 06, saved as <code>chaistall/errors.py</code> and <code>chaistall/parse.py</code>.</p>
  <div class="fx" data-lang="py">from rows import ROWS
from chaistall.errors import BadRowError, MissingValueError, BadNumberError
from chaistall.parse import parse_row

def validate_all(rows, first_line=2):
    problems = []
    for line, row in enumerate(rows, start=first_line):
        try:
            parse_row(row, line)
        except BadRowError as e:
            problems.append(e)                 # keep going: collect every problem
    if problems:
        raise ExceptionGroup("Monday's sheet has bad rows", problems)

try:
    validate_all(ROWS)
except* MissingValueError as group:
    print("missing values on lines:", [e.line for e in group.exceptions])
except* BadNumberError as group:
    print("bad numbers on lines   :", [e.line for e in group.exceptions])

validate_all(ROWS[6:8], first_line=8)          # uncaught: how a group is printed</div>
  <div class="fx" data-lang="text">missing values on lines: [9]
bad numbers on lines   : [8, 10]
  + Exception Group Traceback (most recent call last):
  |   File "group.py", line 22, in &lt;module&gt;
  |     validate_all(ROWS[6:8], first_line=8)          # uncaught: how a group is printed
  |     ~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^
  |   File "group.py", line 13, in validate_all
  |     raise ExceptionGroup("Monday's sheet has bad rows", problems)
  | ExceptionGroup: Monday's sheet has bad rows (2 sub-exceptions)
  +-+---------------- 1 ----------------
    | Traceback (most recent call last):
    |   File "chaistall/parse.py", line 9, in to_int
    |     return int(row[field])
    | ValueError: invalid literal for int() with base 10: 'two'
    |
    | The above exception was the direct cause of the following exception:
    |
    | Traceback (most recent call last):
    |   File "group.py", line 9, in validate_all
    |     parse_row(row, line)
    |     ~~~~~~~~~^^^^^^^^^^^
    |   File "chaistall/parse.py", line 18, in parse_row
    |     qty, price = to_int(row, "qty", line), to_int(row, "price", line)
    |                  ~~~~~~^^^^^^^^^^^^^^^^^^
    |   File "chaistall/parse.py", line 11, in to_int
    |     raise BadNumberError(line, field, f"{row[field]!r} is not a whole number") from e
    | chaistall.errors.BadNumberError: line 8, qty: 'two' is not a whole number
    +---------------- 2 ----------------
    | Traceback (most recent call last):
    |   File "group.py", line 9, in validate_all
    |     parse_row(row, line)
    |     ~~~~~~~~~^^^^^^^^^^^
    |   File "chaistall/parse.py", line 17, in parse_row
    |     raise MissingValueError(line, field, "is empty")
    | chaistall.errors.MissingValueError: line 9, price: is empty
    +------------------------------------</div>
  <p>Both <code>except*</code> clauses ran for one group: line 9 to the first, lines 8 and 10 to the second. An unhandled group prints as a tree, one numbered branch per member, each with its own traceback (member 1 still shows its chained cause).</p>
  <div class="callout def"><span class="label">Definition</span><p><code>ExceptionGroup(msg, excs)</code> is an exception holding a sequence of exceptions (<code>.exceptions</code>). <code>except* T as g</code> handles the members of type <code>T</code> as a group <code>g</code>; several <code>except*</code> clauses can run for one group; unmatched members are re-raised. <code>except</code> and <code>except*</code> cannot be mixed in one try statement. <code>asyncio.TaskGroup</code> raises an ExceptionGroup when tasks fail.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A plain <code>except BadRowError</code> does <em>not</em> catch a group of BadRowErrors: the group itself is an <code>ExceptionGroup</code>. Use <code>except*</code>, or <code>except ExceptionGroup</code> and inspect <code>.exceptions</code>. For a single failure, a plain exception is clearer.</p></div>

  <h2 id="pex-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: bare except / except Exception: pass</span><p>Hides typos and bugs (revenue 0 with no message) and a bare except swallows Ctrl+C. Name the expected types; at the top level use <code>except Exception: log.exception(…)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: one huge try block</span><p>Catches errors from lines you did not expect to fail and loses the whole batch on one bad item. Keep try tiny; put the per-item try inside the loop.</p></div>
  <div class="callout trap"><span class="label">Trap: general before specific</span><p><code>except Exception</code> above <code>except ValueError</code> makes the second unreachable. Most specific first.</p></div>
  <div class="callout trap"><span class="label">Trap: returning None instead of raising</span><p>The caller forgets to check, and None or −1 ends up in the results. Raise; let the caller decide.</p></div>
  <div class="callout trap"><span class="label">Trap: re-raising without from</span><p><code>raise MyError(str(e))</code> loses the original type and line from the new error; use <code>raise MyError(…) from e</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: return in finally</span><p>Silently discards an exception in flight.</p></div>
  <div class="callout trap"><span class="label">Trap: using the except variable after the block</span><p><code>except E as e</code> deletes <code>e</code> when the block ends (to break a reference cycle with the traceback). Save it to another name if you need it later.</p></div>
  <div class="callout trap"><span class="label">Trap: print(e)</span><p>Keeps one line, loses the traceback, the time and the level. Use <code>log.exception</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: assert for validation</span><p>Removed by <code>python -O</code>. Validate input with <code>raise</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: subclassing BaseException</span><p>Your error escapes <code>except Exception</code> like Ctrl+C does. Subclass <code>Exception</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: LBYL races and wrong checks</span><p><code>if path.exists(): open(path)</code> can still fail; <code>isdigit()</code> is not the same rule as <code>int()</code>. Try the real operation.</p></div>

  <h2 id="pex-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Exceptions and tracebacks</h3>
  <ul>
    <li><strong>Exception</strong>: object describing a runtime error. Raising stops normal flow and unwinds the call stack until a matching <code>except</code>; unhandled → traceback on stderr, exit code 1.</li>
    <li><code>SyntaxError</code> is raised at compile time, before the file runs, so a try in the same file cannot catch it.</li>
    <li>Read a traceback bottom-up: <code>Type: message</code> → failing line (<code>^^^</code> markers) → callers, oldest at the top.</li>
    <li>Unwinding discards frames (their locals are lost) and runs each frame's <code>finally</code>. Catch at the level of the unit you can afford to lose.</li>
  </ul>
  <h3>try / except / else / finally</h3>
  <div class="fx" data-lang="py">try:
    risky()                 # keep tiny
except (ValueError, KeyError) as e:
    handle(e)               # only if a matching error was raised
else:
    use_result()            # only if try raised nothing
finally:
    cleanup()               # always, even after return / unhandled error</div>
  <ul>
    <li>First matching <code>except</code> wins → specific before general.</li>
    <li><code>finally</code> runs before a <code>return</code> completes; a <code>return</code> in <code>finally</code> overrides the return value and swallows exceptions.</li>
    <li><code>e</code> from <code>except E as e</code> is deleted at the end of the block.</li>
  </ul>
  <h3>Hierarchy</h3>
  <table class="tbl">
    <tr><th>class</th><th>parent</th><th>typical cause</th></tr>
    <tr><td><code>ValueError</code></td><td>Exception</td><td>right type, bad value: <code>int("two")</code></td></tr>
    <tr><td><code>TypeError</code></td><td>Exception</td><td>wrong type: <code>"a" + 1</code>, <code>None[0]</code></td></tr>
    <tr><td><code>KeyError</code>, <code>IndexError</code></td><td>LookupError</td><td>missing key / index out of range</td></tr>
    <tr><td><code>ZeroDivisionError</code></td><td>ArithmeticError</td><td><code>1 / 0</code></td></tr>
    <tr><td><code>FileNotFoundError</code>, <code>PermissionError</code></td><td>OSError</td><td>file system / OS calls</td></tr>
    <tr><td><code>AttributeError</code>, <code>NameError</code></td><td>Exception</td><td>missing attribute / undefined name</td></tr>
    <tr><td><code>KeyboardInterrupt</code>, <code>SystemExit</code></td><td>BaseException</td><td>Ctrl+C, <code>sys.exit()</code> — not caught by <code>except Exception</code></td></tr>
  </table>
  <p>Bare <code>except:</code> = <code>except BaseException:</code>. Never use it.</p>
  <h3>raise and custom exceptions</h3>
  <ul>
    <li><code>raise T("msg")</code> new; <code>raise</code> re-raises current unchanged; <code>raise T(…) from e</code> sets <code>__cause__</code>.</li>
    <li>Custom: <code>class AppError(Exception)</code> base + one subclass per caller reaction; attributes for context; <code>super().__init__(msg)</code>.</li>
    <li>Raise instead of returning sentinels; fail fast with rule + value in the message.</li>
  </ul>
  <h3>Chaining</h3>
  <table class="tbl">
    <tr><th>form</th><th>sets</th><th>traceback wording</th></tr>
    <tr><td><code>raise X from e</code></td><td><code>__cause__</code></td><td>"The above exception was the direct cause…"</td></tr>
    <tr><td>error inside except</td><td><code>__context__</code></td><td>"During handling of the above exception…"</td></tr>
    <tr><td><code>raise X from None</code></td><td>suppresses context</td><td>only X</td></tr>
    <tr><td><code>e.add_note("…")</code></td><td><code>__notes__</code></td><td>note printed under the message</td></tr>
  </table>
  <h3>EAFP vs LBYL</h3>
  <ul>
    <li>EAFP (try, then handle) is Pythonic for parsing, lookups, files, network: the operation is the real test and there is no race.</li>
    <li>LBYL for cheap exact checks you own; also faster when failures are common (raising and catching costs several times an <code>in</code> check; a non-raising try is nearly free).</li>
    <li><code>"²".isdigit()</code> is True but <code>int("²")</code> fails; <code>exists()</code> then <code>open()</code> is a TOCTOU race.</li>
  </ul>
  <h3>Logging, assert, ExceptionGroup</h3>
  <ul>
    <li><code>log.exception("…")</code> inside except = <code>log.error(…, exc_info=True)</code>: ERROR + traceback. Pass args, not f-strings. <code>getLogger(__name__)</code> per module.</li>
    <li><code>assert cond, msg</code> → <code>AssertionError</code>; removed by <code>python -O</code>; for invariants and tests only.</li>
    <li><code>raise ExceptionGroup(msg, [e1, e2])</code>; <code>except* T as g</code> gets the T members (<code>g.exceptions</code>); several <code>except*</code> clauses can run; plain <code>except T</code> does not match a group.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Bare except: silent wrong results and Ctrl+C swallowed.</li>
    <li><code>return</code> in finally swallows the exception.</li>
    <li>Huge try blocks catch bugs as if they were bad data.</li>
    <li><code>raise New(str(e))</code> without <code>from e</code> loses the cause.</li>
    <li><code>assert(x, "msg")</code> is always true.</li>
    <li>Subclass <code>Exception</code>, never <code>BaseException</code>.</li>
  </ul>

  <h2 id="pex-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is an exception, and what happens if nobody handles it?</summary><div class="qa-body">An object describing an error detected at runtime. Raising it stops normal flow and Python unwinds the call stack looking for a matching <code>except</code>, running <code>finally</code> blocks on the way. If none matches, the traceback is printed to stderr and the process exits with code 1; anything not yet saved is lost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a syntax error and an exception?</summary><div class="qa-body">A <code>SyntaxError</code> is found when the file is compiled to bytecode, before any line runs, so nothing in that file executes and a <code>try</code> in the same file cannot catch it. Exceptions such as <code>ValueError</code> happen while code runs and can be handled. (A <code>SyntaxError</code> can be caught when it comes from <code>eval</code>, <code>exec</code> or importing another module.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do <code>else</code> and <code>finally</code> run in a try statement?</summary><div class="qa-body"><code>else</code> runs only if the try block raised nothing; it is the place for success work you do not want covered by the <code>except</code>. <code>finally</code> runs on every path: success, handled exception, unhandled exception (before it keeps unwinding), and after a <code>return</code>, <code>break</code> or <code>continue</code> in try/except.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>def f():<br>&nbsp;&nbsp;try: return "try"<br>&nbsp;&nbsp;finally: print("finally")<br>print(f())</code></summary><div class="qa-body"><code>finally</code>, then <code>try</code>. The return value is computed, the finally block runs, then the function returns. If finally had its own <code>return</code>, that value would win and any in-flight exception would be discarded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>try:<br>&nbsp;&nbsp;1 / 0<br>except ZeroDivisionError as e:<br>&nbsp;&nbsp;print("caught:", e)<br>print(e)</code></summary><div class="qa-body"><code>caught: division by zero</code>, then <code>NameError: name 'e' is not defined</code>. Python deletes the <code>as</code> name at the end of the except block, because the exception holds its traceback, which references the frame, which references <code>e</code>: a reference cycle. Assign it to another variable if you need it later.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a bare <code>except:</code> bad, and how is it different from <code>except Exception:</code>?</summary><div class="qa-body">Bare <code>except:</code> catches <code>BaseException</code>, including <code>KeyboardInterrupt</code> and <code>SystemExit</code>, so Ctrl+C and <code>sys.exit()</code> stop working, and every bug (a typo raising <code>KeyError</code>) becomes a silent wrong result. <code>except Exception</code> lets those two through but still hides bugs; use it only at a top-level boundary together with <code>log.exception</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you catch several exception types, and does clause order matter?</summary><div class="qa-body">Use a tuple: <code>except (ValueError, KeyError) as e:</code>, or separate clauses if they need different handling. Order matters: clauses are tested top to bottom and the first match wins, so <code>except Exception</code> placed before <code>except ValueError</code> makes the second unreachable. Put the most specific types first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>raise</code>, <code>raise e</code> and <code>raise New() from e</code>?</summary><div class="qa-body">Bare <code>raise</code> inside an except block re-raises the current exception unchanged. <code>raise e</code> re-raises the same object, adding the current line to its traceback. <code>raise New() from e</code> raises a different exception with <code>__cause__ = e</code>; the traceback shows both, joined by "The above exception was the direct cause of the following exception".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you define a custom exception, and how would you design them for a library?</summary><div class="qa-body">Subclass <code>Exception</code>: <code>class AppError(Exception): pass</code>. For a library: one base class so users can catch everything from it, one subclass per way callers will react (e.g. <code>ValidationError</code> skip, <code>ConnectionFailed</code> retry), attributes for context (<code>e.line</code>, <code>e.status_code</code>), the message passed to <code>super().__init__</code>, and <code>raise … from e</code> when wrapping built-in errors. Optionally also inherit a built-in like <code>ValueError</code> for compatibility.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>__cause__</code> and <code>__context__</code>?</summary><div class="qa-body"><code>__context__</code> is set automatically whenever an exception is raised while another is being handled ("During handling of the above exception, another exception occurred": usually a bug in the handler). <code>__cause__</code> is set explicitly by <code>raise X from Y</code> ("direct cause": a deliberate translation). <code>from None</code> sets <code>__suppress_context__</code> so the original is not printed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>EAFP vs LBYL: what are they and which is more Pythonic?</summary><div class="qa-body">LBYL checks preconditions first (<code>if key in d</code>); EAFP tries the operation and catches the exception (<code>try: d[key] except KeyError</code>). EAFP is considered Pythonic because the operation itself is the exact test (<code>"²".isdigit()</code> is True but <code>int("²")</code> fails) and it has no race between check and use (a file deleted after <code>exists()</code>). LBYL is fine for cheap exact checks and when failures are frequent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are exceptions expensive in Python?</summary><div class="qa-body">Entering a <code>try</code> that does not raise is almost free (3.11+ uses "zero-cost" exception tables). Raising and catching costs several times a plain check: on 3.13 a million <code>d['b']</code> lookups caught as <code>KeyError</code> took about 0.12 s versus 0.014 s for an <code>in</code> check. So use EAFP when failures are rare and a check when failures are the common case.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you log an exception with its traceback?</summary><div class="qa-body">Inside the except block call <code>logger.exception("context %s", value)</code>, which logs at ERROR with the traceback; it equals <code>logger.error(…, exc_info=True)</code>. <code>print(e)</code> or <code>logger.error(str(e))</code> keep only the message. Pass values as arguments rather than f-strings so formatting is skipped when the level is disabled.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you use <code>assert</code> vs <code>raise</code>?</summary><div class="qa-body"><code>assert</code> documents internal invariants ("cannot happen unless my code is wrong") and is used in tests. It is stripped when Python runs with <code>-O</code>, so it must never validate user input, files or API responses; use <code>raise</code> with a specific exception for those. Also, <code>assert (x, "msg")</code> with brackets is always true.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a <code>with</code> statement relate to try/finally, and can a context manager suppress an exception?</summary><div class="qa-body"><code>with cm:</code> is roughly try/finally: <code>__exit__(exc_type, exc, tb)</code> always runs, receiving the exception if one occurred. If <code>__exit__</code> returns True, the exception is suppressed. <code>contextlib.suppress(FileNotFoundError)</code> is a ready-made one: <code>with suppress(FileNotFoundError): open("missing.csv")</code> continues silently. See <a class="xref" data-note="py_context">Context Managers</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are ExceptionGroup and <code>except*</code> for?</summary><div class="qa-body"><code>ExceptionGroup(msg, [e1, e2])</code> carries several independent failures in one raise: validating all rows of a file, or several concurrent tasks failing (<code>asyncio.TaskGroup</code> raises one). <code>except* T as g</code> handles the members of type T; several <code>except*</code> clauses can run for one group and unmatched members are re-raised. A plain <code>except BadRowError</code> does not match a group of BadRowErrors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you implement retries for a flaky network call?</summary><div class="qa-body">Catch only transient error types, retry a bounded number of times with exponential backoff, and re-raise after the last attempt so the caller sees the real error:<div class="fx" data-lang="py">def retry(fn, attempts=3, delay=0.5, retry_on=(ConnectionError, TimeoutError)):
    for i in range(1, attempts + 1):
        try:
            return fn()
        except retry_on:
            if i == attempts:
                raise
            time.sleep(delay * 2 ** (i - 1))</div>Do not retry on errors that will never succeed (4xx, <code>ValueError</code>). In production, libraries such as <code>tenacity</code> add jitter and logging.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In a pipeline processing a million rows, how should errors be handled?</summary><div class="qa-body">Validate each row and raise a domain exception (<code>BadRowError</code> with line and field) for bad data; catch that type <em>per row</em>, record the rejection (log or a rejects file) and continue; let anything else (a bug) propagate to a top-level handler that logs with traceback and exits non-zero. Optionally abort if the reject rate exceeds a threshold, since that usually means the input format changed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test that a function raises the right exception?</summary><div class="qa-body">With pytest: <code>with pytest.raises(BadNumberError, match="line 8") as exc_info: parse_row(row, 8)</code>, then assert on attributes, e.g. <code>exc_info.value.field == "qty"</code>. With unittest: <code>self.assertRaises(BadNumberError)</code>. See <a class="xref" data-note="py_pytest">Testing with pytest</a>.</div></details>
</main>
`
});
