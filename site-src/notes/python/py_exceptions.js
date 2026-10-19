// notes/python/py_exceptions.js — Exceptions & Error Handling
Object.assign(TOPIC_CONTENT, {
  "py_exceptions": `<main>
<h1>Exceptions &amp; Error Handling</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>Exceptions &amp; Error Handling</span></div>
  <p class="lead">A program that only ever sees clean data is easy to write. Real data is messy: one row says "two" instead of 2, another has no price, a third has a quantity of −1. This note teaches what Python does when something goes wrong while the program runs, and how you take control of it: reading a traceback line by line, watching the call stack unwind, the four blocks <code>try / except / else / finally</code> traced on every path, catching the right errors (and why a bare <code>except:</code> is a trap), raising your own errors, building a small family of custom exceptions, chaining one error to its cause, the EAFP vs LBYL styles, logging failures with their full traceback, <code>assert</code> vs <code>raise</code>, and reporting many errors at once with <code>ExceptionGroup</code>. One running example is used throughout: Monday's order sheet at Chai Corner, a tea stall, which has six good rows worth ₹230 and three bad ones. Every code block was run on Python 3.13 and its real output is shown.</p>

  <h2 id="pex-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 200" width="640">
<defs><marker id="pex-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="200" y="8" width="240" height="36" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="31" text-anchor="middle" font-size="12">Programs Meet the Real World: the map</text>
<line x1="320" y1="44" x2="110" y2="74" stroke="currentColor" stroke-opacity="0.45"/><line x1="320" y1="44" x2="320" y2="74" stroke="currentColor" stroke-opacity="0.45"/><line x1="320" y1="44" x2="530" y2="74" stroke="currentColor" stroke-opacity="0.45"/>
<rect x="20" y="76" width="180" height="44" rx="7" class="fg sg" stroke-width="2.5"/><text x="110" y="95" text-anchor="middle" font-size="12" font-weight="700">Exceptions</text><text x="110" y="111" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · things go wrong</text>
<rect x="230" y="76" width="180" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="95" text-anchor="middle" font-size="12">Files &amp; Data Formats</text><text x="320" y="111" text-anchor="middle" class="tm" font-size="10">data must outlive the program</text>
<rect x="440" y="76" width="180" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="530" y="95" text-anchor="middle" font-size="12">Modules &amp; Environments</text><text x="530" y="111" text-anchor="middle" class="tm" font-size="10">code must be split and shared</text>
<line x1="200" y1="98" x2="228" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pex-a0)"/><line x1="410" y1="98" x2="438" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pex-a0)"/>
<text x="320" y="150" text-anchor="middle" class="tm" font-size="10.5">the running example: chaistall, a small importer for Chai Corner's daily orders CSV</text>
<text x="320" y="168" text-anchor="middle" class="tm" font-size="10.5">this note writes its errors.py and parse.py · the next notes add file reading, JSON/Parquet output, and the package</text>
</svg><figcaption>The "Programs Meet the Real World" group. You are on the green note, the first of three. Dotted arrows show the reading order.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_io">Programs Meet the Real World: the map</a> and <a class="xref" data-note="py_fundamentals">Python Fundamentals</a></b><span>You can write functions, loops and dicts, and you have seen an error message or two (<a class="xref" data-note="py_fundamentals">Fundamentals</a>, "Running Code and Reading Errors"). Left open: when a value is bad in the middle of a run, the whole program stops and everything computed so far is lost. How do we survive bad data, and how do we report it?</span></li>
    <li><b>This note adds: control over failure</b><span>What an exception is, the traceback and the call stack, <code>try/except/else/finally</code>, which errors to catch, <code>raise</code>, custom exception classes, chaining with <code>raise … from</code>, EAFP vs LBYL, <code>logging.exception</code>, <code>assert</code>, and <code>ExceptionGroup</code>. By the end, the importer turns 9 messy rows into 6 good orders (₹230) and 3 precise rejections.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_files">Files &amp; Data Formats</a>, then <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a></b><span>Here the rows sit in a Python list. The next note reads them from the real CSV file (where new errors appear: missing files, wrong encodings) and writes the results to JSON and Parquet. The third note splits the code into the <code>chaistall</code> package, where this note's exceptions live in <code>chaistall/errors.py</code>. Later, <a class="xref" data-note="py_context">Context Managers</a> builds on <code>finally</code>, and <a class="xref" data-note="py_testing">Testing &amp; Debugging</a> tests that the right exceptions are raised.</span></li>
  </ol>

  <h2 id="pex-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. Numbers come from the running example: 9 rows, 6 good (₹230), 3 bad (file lines 8, 9, 10).</p>
  <ol class="story">
    <li><b>An exception</b><span>Q: what happens when a value is bad? → Python <em>raises</em> an exception: it stops the normal flow and prints a traceback. The running total had reached ₹230, then <code>int("two")</code> on Esha's row crashed the program and the total was never printed. Where exactly did it fail, and could anyone have stopped it?</span></li>
    <li><b>Traceback and call stack</b><span>Q: how does an error travel? → Up the <strong>call stack</strong>: <code>to_int</code> → <code>parse_row</code> → <code>import_day</code> → <code>main</code>, each function abandoned in turn (the stack <em>unwinds</em>) until someone catches it. Catching around the loop gave <code>None</code> (whole day lost); catching per row gave ₹210 with 2 bad rows. So how do we write a handler properly?</span></li>
    <li><b>try / except / else / finally</b><span>Q: how do we handle an error and still clean up? → <code>try</code> the risky line, <code>except</code> handles a failure, <code>else</code> runs only on success, <code>finally</code> always runs. Traced on "2", "two" and <code>None</code>. But which errors should <code>except</code> name?</span></li>
    <li><b>Specific vs broad catching</b><span>Q: what should we catch? → Errors form a family tree; catch only what you expect. A bare <code>except:</code> on a typo turned the revenue into ₹0 with no message and swallowed Ctrl+C. But our ₹210 still includes Gita's −1 × 20 = −₹20, because Python sees nothing wrong with −1…</span></li>
    <li><b>raise</b><span>Q: how do we stop on values Python accepts but our business rejects? → <code>raise ValueError("qty must be positive, got -1")</code>. But now "bad data" and "a real bug" are both <code>ValueError</code>; the caller cannot tell them apart.</span></li>
    <li><b>Custom exception hierarchy</b><span>Q: how can callers tell <em>our</em> failures apart? → <code>ChaiStallError</code> → <code>BadRowError</code> (with <code>.line</code>, <code>.field</code>) → <code>MissingValueError</code>, <code>BadNumberError</code>. Result: ₹230 from 6 orders, rejections at lines 8, 9, 10. But wrapping <code>int</code>'s error in ours hides where it came from…</span></li>
    <li><b>Exception chaining</b><span>Q: how do we translate an error without losing its cause? → <code>raise BadNumberError(…) from e</code> keeps the original as <code>__cause__</code>; the traceback prints both. But should we have checked the text before trying <code>int</code> at all?</span></li>
    <li><b>EAFP vs LBYL</b><span>Q: check first, or try and handle? → Checking with <code>isdigit()</code> wrongly rejects " 2" and "-1" and still crashes on "²"; trying <code>int()</code> is the honest test. But a skipped row at 2 AM, with nobody watching, leaves no trace…</span></li>
    <li><b>Logging exceptions</b><span>Q: how do we keep a record of what failed? → <code>log.exception("line %d skipped", 8)</code> writes an ERROR line plus the full traceback; <code>print(e)</code> keeps one line. But some checks are not about data at all, they guard against our own bugs…</span></li>
    <li><b>assert vs raise</b><span>Q: how do we state "this can never happen"? → <code>assert</code>, which is removed by <code>python -O</code> (the bad revenue ₹20 then slips through). So <code>assert</code> is for our bugs, <code>raise</code> for bad input. One more gap: validation stops at the first bad row, but the owner wants every problem listed at once.</span></li>
    <li><b>ExceptionGroup</b><span>Q: how do we report several errors together? → Collect them and <code>raise ExceptionGroup(…)</code>; <code>except*</code> handles each kind: missing values on line [9], bad numbers on lines [8, 10].</span></li>
  </ol>

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
          <li>Where you catch decides what survives (whole day vs one row)</li>
          <li>💡 a fire alarm passed up the floors until someone answers</li>
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
          <li>Chai Corner: ChaiStallError → BadRowError → Missing/BadNumber</li>
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
          <li><code>ExceptionGroup</code> + <code>except*</code>: report all bad rows at once</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pex-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pex-crash"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When a Row Is Bad</span><span class="rm-sub">Raising, tracebacks</span></div></div>
      <div class="rm-item rm-done" data-target="pex-stack"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Call Stack Unwinds</span><span class="rm-sub">Where to catch</span></div></div>
      <div class="rm-item rm-done" data-target="pex-try"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">try / except / else / finally</span><span class="rm-sub">Every path traced</span></div></div>
      <div class="rm-item rm-done" data-target="pex-catch"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Specific vs Broad</span><span class="rm-sub">The bare-except trap</span></div></div>
      <div class="rm-item rm-done" data-target="pex-raise"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Raising Errors</span><span class="rm-sub">raise and re-raise</span></div></div>
      <div class="rm-item rm-done" data-target="pex-custom"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Custom Hierarchy</span><span class="rm-sub">ChaiStallError family</span></div></div>
      <div class="rm-item rm-done" data-target="pex-chain"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Exception Chaining</span><span class="rm-sub">raise … from</span></div></div>
      <div class="rm-item rm-done" data-target="pex-eafp"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">EAFP vs LBYL</span><span class="rm-sub">Try first or check first</span></div></div>
      <div class="rm-item rm-done" data-target="pex-log"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Logging Exceptions</span><span class="rm-sub">Keep the traceback</span></div></div>
      <div class="rm-item rm-done" data-target="pex-assert"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">assert vs raise</span><span class="rm-sub">Bugs vs bad input</span></div></div>
      <div class="rm-item rm-done" data-target="pex-group"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">ExceptionGroup</span><span class="rm-sub">Many errors at once</span></div></div>
      <div class="rm-item rm-done" data-target="pex-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pex-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">And their fixes</span></div></div>
      <div class="rm-item rm-done" data-target="pex-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pex-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pex-crash"><span class="num">01</span>When a Row Is Bad: What Python Does</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>So far every program we wrote received the values it expected. Real data is typed by people in a hurry. What actually happens inside Python when one value is wrong, and what do we lose?</p>
  </div>
  <h3>The running example: Monday's order sheet</h3>
  <p>Chai Corner's helper types each order into a spreadsheet, and every evening the owner wants the day's revenue. Monday's sheet has 9 rows. The sheet's first line is the header, so the orders are on <strong>file lines 2 to 10</strong>; we always quote file line numbers, because that is what the helper sees when fixing the sheet.</p>
  <table class="tbl"><caption>The running example: Monday 2026-10-19</caption>
    <tr><th>file line</th><th>customer</th><th>item</th><th>qty</th><th>price ₹</th><th>amount ₹</th><th>problem</th></tr>
    <tr><td>2</td><td>Asha</td><td>masala chai</td><td>2</td><td>20</td><td>40</td><td></td></tr>
    <tr><td>3</td><td>Ben</td><td>samosa</td><td>3</td><td>15</td><td>45</td><td></td></tr>
    <tr><td>4</td><td>Asha</td><td>ginger chai</td><td>1</td><td>25</td><td>25</td><td></td></tr>
    <tr><td>5</td><td>Chen</td><td>masala chai</td><td>1</td><td>20</td><td>20</td><td></td></tr>
    <tr><td>6</td><td>Dia</td><td>bun maska</td><td>2</td><td>30</td><td>60</td><td></td></tr>
    <tr><td>7</td><td>Ben</td><td>masala chai</td><td>2</td><td>20</td><td>40</td><td></td></tr>
    <tr><td>8</td><td>Esha</td><td>samosa</td><td>"two"</td><td>15</td><td>?</td><td>qty is a word</td></tr>
    <tr><td>9</td><td>Farid</td><td>cold coffee</td><td>1</td><td>""</td><td>?</td><td>price missing</td></tr>
    <tr><td>10</td><td>Gita</td><td>masala chai</td><td>−1</td><td>20</td><td>−20?</td><td>qty negative</td></tr>
  </table>
  <p>By hand: the six good rows give 40 + 45 + 25 + 20 + 60 + 40 = <strong>₹230</strong>. That is the number our program must produce, together with a clear list of the three bad rows. In this note the rows live in a Python list (in <code>rows.py</code>); <a class="xref" data-note="py_files">Files &amp; Data Formats</a> reads the same rows from the real CSV file. Everything comes in as text, as it would from a file:</p>
  <div class="fx" data-lang="py"># Monday's order sheet as text, one dict per row (the Files note reads it from disk)
ROWS = [
    {"customer": "Asha",  "item": "masala chai", "qty": "2",   "price": "20"},
    {"customer": "Ben",   "item": "samosa",      "qty": "3",   "price": "15"},
    {"customer": "Asha",  "item": "ginger chai", "qty": "1",   "price": "25"},
    {"customer": "Chen",  "item": "masala chai", "qty": "1",   "price": "20"},
    {"customer": "Dia",   "item": "bun maska",   "qty": "2",   "price": "30"},
    {"customer": "Ben",   "item": "masala chai", "qty": "2",   "price": "20"},
    {"customer": "Esha",  "item": "samosa",      "qty": "two", "price": "15"},
    {"customer": "Farid", "item": "cold coffee", "qty": "1",   "price": ""},
    {"customer": "Gita",  "item": "masala chai", "qty": "-1",  "price": "20"},
]</div>
  <h3>The first attempt</h3>
  <p>The obvious program: loop over the rows, turn each quantity and price into a number with <code>int()</code>, multiply, add. A <code>print</code> after each row lets us watch the running total.</p>
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
  <p>Read the output top to bottom. Six rows went fine and the total climbed to 230. On the seventh row (Esha), <code>int("two")</code> could not make a number. Python did not return a wrong value, and it did not skip the row: it <strong>stopped the program</strong> and printed a report. The final <code>print("revenue:", total)</code> never ran. The correct ₹230 was sitting in memory and was thrown away.</p>
  <h3>Reading the traceback line by line</h3>
  <p>That report is a <strong>traceback</strong>. Read it from the <em>bottom</em> up:</p>
  <ol>
    <li><code>ValueError: invalid literal for int() with base 10: 'two'</code> — the last line says <em>what</em> went wrong: the exception's <strong>type</strong> (<code>ValueError</code>: right type of value, wrong content) and its <strong>message</strong> (the text <code>'two'</code> is not a base-10 number).</li>
    <li><code>~~~^^^^^^^^^^^^</code> — the markers underline the exact expression that failed: <code>int(row["qty"])</code>, not the price part.</li>
    <li><code>total += int(row["qty"]) * int(row["price"])</code> — the source line that was running.</li>
    <li><code>File "total.py", line 4, in &lt;module&gt;</code> — which file, which line, and which function. <code>&lt;module&gt;</code> means "the top level of the file, not inside any function".</li>
    <li><code>Traceback (most recent call last):</code> — the header: the calls are listed oldest first, so the newest (where it failed) is just above the error line.</li>
  </ol>
  <div class="callout anlg"><span class="label">Analogy</span><p>A traceback is the delivery app's tracking page read backwards: the bottom line says "parcel damaged", the lines above say at which hub, and further up which hubs it passed through to get there.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>exception</strong> is an object that describes an error found while the program runs (a <em>runtime</em> error, as opposed to a syntax error found before it runs). <strong>Raising</strong> an exception stops the normal flow of the program at that point. If no code handles it, Python prints a <strong>traceback</strong> (the type, the message, and the chain of calls that led there) and ends the program with a non-zero exit code.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Beginners read a traceback from the top and get lost in calls they did not write. Start at the last line (what), then the line just above it (where). Only then walk up to see how you got there.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Call Stack Unwinds.</b> In a real program the failing line is deep inside functions that called other functions. How does the error travel out of them, and where along the way could we stop it?</div>

  <h2 id="pex-stack"><span class="num">02</span>The Call Stack Unwinds</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our first attempt was one flat loop. Real code is split into functions: one converts a number, one parses a row, one imports the day. When <code>int("two")</code> fails four calls deep, which functions are affected, and who gets a chance to handle it?</p>
  </div>
  <h3>The idea in plain words</h3>
  <p>When a function calls another function, Python remembers where to come back to. These "where to return" notes pile up like plates: the <strong>call stack</strong>. Each plate is a <strong>frame</strong>: one running function with its own local variables. When the innermost function raises an exception, Python does not return to the caller normally. It looks in the current function for a handler; if there is none, it throws that frame away and looks in the caller; then the caller's caller, and so on. Throwing frames away one by one is called <strong>unwinding the stack</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A fire alarm on the 4th floor of an office. If nobody on the 4th floor handles it, the floor is evacuated and the alarm is passed to the 3rd floor's warden, then the 2nd, then the 1st. If no warden handles it, the whole building closes (the program ends).</p></div>
  <h3>The same day, split into functions</h3>
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
  <p>Now the traceback has five entries, one per frame, oldest at the top. Read it as the stack at the moment of failure: the module called <code>main()</code> (line 18), <code>main</code> called <code>import_day</code> (line 16), <code>import_day</code> called <code>parse_row</code> (line 12), <code>parse_row</code> called <code>to_int</code> (line 7), and <code>to_int</code> failed at <code>int(text)</code> (line 4). The bottom line is the same <code>ValueError</code> as before.</p>
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
  <h3>Traced: watching the frames leave</h3>
  <p>To <em>see</em> unwinding, the next version prints a line when each function starts and, using <code>finally</code> (section 03 explains it fully; for now: "run this on the way out, whatever happens"), a line when it leaves. We import only Ben's good row and Esha's bad row, and catch the error at the very top.</p>
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
  <p>Trace it. For Ben's row everything enters and leaves normally: <code>to_int('2')</code>, <code>to_int('20')</code>, then <code>parse_row</code> leaves with 40. For Esha, <code>to_int('two')</code> raises; its <code>finally</code> prints "leave to_int" as the frame is dropped; then <code>parse_row</code>'s <code>finally</code> prints "leave parse_row" (notice: it never called <code>to_int</code> for the price, the second call was skipped); then <code>import_day</code> is abandoned mid-loop, so "leave import_day normally" never prints and its <code>total</code> disappears. Finally the top-level <code>except</code> catches the error.</p>
  <h3>Where you catch decides what survives</h3>
  <p>The same error can be caught at different heights of the stack. The height decides how much work is thrown away:</p>
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
  <p>Caught <em>outside</em> the loop, one bad row throws away the whole day: the result is <code>None</code>. Caught <em>inside</em> the loop, only the bad row is lost and the loop continues: total 210 with 2 bad rows. Why 210 and not 230? Esha ("two") and Farid (empty price, <code>int("")</code> also raises <code>ValueError</code>) were skipped, but Gita's −1 × 20 = −20 was <em>accepted</em>: 230 − 20 = 210. Keep that in mind; section 05 fixes it.</p>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>call stack</strong> is the list of function calls currently running, each a <strong>frame</strong> with its own local variables. When an exception is raised and not handled in the current frame, Python <strong>unwinds</strong> the stack: it discards frames one by one, running their <code>finally</code> blocks, until a matching <code>except</code> is found. A frame that is unwound never returns a value.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Putting one big <code>try</code> around everything "to be safe" makes one bad row cost the whole job. Put the handler at the level of the unit you are willing to lose: here, one row.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: try / except / else / finally.</b> We used <code>try</code>, <code>except</code> and <code>finally</code> informally. What exactly runs, and in what order, on every possible path?</div>

  <h2 id="pex-try"><span class="num">03</span>try / except / else / finally: Every Path Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know an exception unwinds until it meets an <code>except</code>. But a handler has up to four parts. Which ones run when the code succeeds, when it fails in an expected way, and when it fails in an unexpected way? And what if there is a <code>return</code> in the middle?</p>
  </div>
  <h3>The four blocks in plain words</h3>
  <ul>
    <li><code>try:</code> the code that might fail. Keep it as small as possible.</li>
    <li><code>except SomeError as e:</code> runs only if the try block raised <code>SomeError</code> (or a subclass of it); <code>e</code> is the exception object.</li>
    <li><code>else:</code> runs only if the try block raised <em>nothing</em>. Put the "success" work here, not inside try, so its own bugs are not caught by mistake.</li>
    <li><code>finally:</code> runs <em>always</em>: after success, after a handled error, after an unhandled error, even after <code>return</code>. Use it for cleanup (closing a file, releasing a lock, writing "job ended" to a log).</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Ordering at the counter: <em>try</em> to make the chai; <em>except</em> the milk ran out → offer black tea; <em>else</em> (it worked) → hand over the cup and take payment; <em>finally</em>, whatever happened, wipe the counter.</p></div>
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
  <h3>Traced on three inputs</h3>
  <p>One function with all four blocks, called with a good quantity ("2"), Esha's word ("two"), and <code>None</code> (a value that causes a <code>TypeError</code>, which this handler does <em>not</em> name):</p>
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
  <p>Notice two details in the output. First, "finally: always" is printed <em>before</em> "caller got": both <code>else</code> and <code>except</code> contain a <code>return</code>, yet <code>finally</code> runs before the function actually hands the value back. Second, for <code>None</code> the handler did not match, so after <code>finally</code> the <code>TypeError</code> kept unwinding into the caller, which caught it.</p>
  <h3>return and finally</h3>
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
  <p>In <code>f</code>, the value "value from try" is computed, <code>finally</code> prints, then the value is returned. In <code>g</code>, a <code>ValueError</code> is raised, but <code>finally</code> contains its own <code>return</code>, which replaces everything: the error vanishes without a trace. That is why a <code>return</code> (or <code>break</code>/<code>continue</code>) inside <code>finally</code> is a bug pattern (Python 3.14 even warns about it).</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>try statement</strong> runs its <code>try</code> block; if an exception is raised there, the first <code>except</code> clause whose type matches (the exception is an instance of that class or a subclass) handles it. <code>else</code> runs only if no exception was raised in <code>try</code>. <code>finally</code> runs last on every path; if the exception was not handled, it continues unwinding after <code>finally</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A large try block catches errors you did not mean to catch. If the try contains five lines and you expect only <code>int()</code> to fail, a <code>ValueError</code> from a bug on another line will be treated as "bad data". Keep try to the risky line and move the rest to <code>else</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Catching Specific vs Broad.</b> The <code>except</code> clause names a type. Which types exist, how are they related, and why not just catch everything?</div>

  <h2 id="pex-catch"><span class="num">04</span>Catching Specific vs Broad (and the bare-except Trap)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>except ValueError</code> caught "two" but not <code>None</code>. If we want to catch more, how do we choose? Is it safe to catch every error and keep going?</p>
  </div>
  <h3>Exceptions form a family tree</h3>
  <p>Every exception type is a class, and the classes inherit from each other (inheritance is taught in <a class="xref" data-note="py_oop">OOP</a>; here you only need "a child is also a kind of its parent"). <code>except Parent</code> catches the parent and every child. We can ask Python for each type's ancestors:</p>
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
  <p>So <code>except LookupError</code> would catch <code>KeyError</code> (and <code>IndexError</code>), <code>except OSError</code> would catch <code>FileNotFoundError</code>, and <code>except Exception</code> catches all the "normal" errors. But <code>KeyboardInterrupt</code> (what Ctrl+C raises) and <code>SystemExit</code> (what <code>sys.exit()</code> raises) are <em>not</em> children of <code>Exception</code>. They hang directly under <code>BaseException</code>, on purpose: they are requests to stop, not errors.</p>
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
<text x="320" y="195" text-anchor="middle" class="tm" font-size="10">(KeyError and IndexError sit under LookupError) · green = our own branch, built in section 06</text>
</svg><figcaption><code>except Exception</code> catches everything blue and green, but lets Ctrl+C and <code>sys.exit()</code> through.</figcaption></figure>
  <h3>Catch what you expect, by name</h3>
  <p>For a row there are two failures we expect: a value that is not a number (<code>ValueError</code>) and a column that is missing (<code>KeyError</code>). One handler can name both with a tuple:</p>
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
  <p>The first three calls are data problems and were handled as data. The fourth, <code>amount(None)</code>, is a <em>bug</em> in whoever called it (a row should never be <code>None</code>). Because we named only the errors we expected, the bug was not hidden: it crashed loudly with a <code>TypeError</code>, pointing at the right line. That is exactly what we want from a bug.</p>
  <h3>The bare-except trap, reproduced</h3>
  <p>A bare <code>except:</code> (no type) catches <em>everything</em>, including <code>BaseException</code> children. Two things go wrong:</p>
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
  <p>First problem: a typo (<code>"prise"</code>) raises <code>KeyError</code> on <em>every</em> row, the bare except swallows each one, and the program cheerfully reports revenue 0 with no message at all. A wrong number with no error is the worst outcome. Second problem: when the user presses Ctrl+C to stop a stuck job, Python raises <code>KeyboardInterrupt</code> inside whatever is running; a bare except swallows that too, so the program refuses to stop. <code>except Exception</code> lets Ctrl+C through (last line), but still hides typos, so it belongs only at the very top of a program, combined with logging (section 09).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bare except is a smoke detector with the battery removed because it "kept going off". The kitchen is quiet, and you will find out about the fire later, from the damage.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>except T</code> matches any exception that is an instance of <code>T</code> or a subclass of <code>T</code>; <code>except (T1, T2)</code> matches either. Clauses are tried top to bottom and the <strong>first</strong> match wins, so a specific type must come before its parent. A bare <code>except:</code> is the same as <code>except BaseException:</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Order matters: in <code>except Exception: … except ValueError: …</code> the second clause can never run, because <code>ValueError</code> is already an <code>Exception</code>. Write the most specific type first.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Raising Your Own Errors.</b> We now catch Python's errors well. But Gita's quantity −1 raises nothing, because −1 is a perfectly good integer to Python. How do we make our own rules fail loudly?</div>

  <h2 id="pex-raise"><span class="num">05</span>Raising Your Own Errors</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The per-row loop gave ₹210 instead of ₹230, because Gita's −1 × 20 = −20 was accepted. Python only raises when <em>it</em> cannot do something. How do we stop on values that Python accepts but our business does not?</p>
  </div>
  <p>The <code>raise</code> statement creates the same kind of event Python creates: it stops normal flow and starts unwinding, carrying an exception object you choose. A quantity of −1 has the right type but a wrong value, which is exactly what <code>ValueError</code> means, so we raise one with a message that says what rule was broken and what value broke it.</p>
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
  <p>Before the code: <code>parse_qty</code> has two ways to fail, Python's (<code>int("two")</code>) and ours (<code>raise</code> for −1); the caller handles both with one <code>except ValueError</code>. After: "2" passes, "−1" now fails with our message, "two" fails with Python's. The second half shows a <strong>bare <code>raise</code></strong> inside an <code>except</code> block: it re-raises the exception currently being handled, unchanged, with its original traceback. Use it when a function wants to <em>notice</em> an error (log it, count it, clean up) but leave the decision to its caller.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The cashier at the stall can accept any number the till accepts, but the owner's rule is "no negative orders". <code>raise</code> is the cashier refusing the order and calling the owner, instead of ringing it up.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>raise ExcType("message")</code> creates an exception object and raises it. <code>raise</code> alone, inside an <code>except</code> block, re-raises the exception being handled. Raise as early as possible, at the point where the bad value is first detected ("fail fast"), with a message naming the rule and the value.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Returning a special value (<code>None</code>, −1, 0) instead of raising makes failure silent: the caller must remember to check, and when it forgets, the special value is added to the revenue. Raise, and let the caller decide.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: A Custom Exception Hierarchy.</b> Now "two", "−1" and an empty price all raise <code>ValueError</code>. So does a genuine bug in our arithmetic. The caller sees one type and cannot tell "the sheet is wrong, skip the row" from "our code is wrong, stop".</div>

  <h2 id="pex-custom"><span class="num">06</span>A Custom Exception Hierarchy</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want the importer to skip bad <em>rows</em> but crash on bad <em>code</em>, and to tell the helper exactly which line and which column to fix. A <code>ValueError</code> carries only a message string. How do we give our failures their own names and their own data?</p>
  </div>
  <h3>Plain words</h3>
  <p>An exception type is just a class that inherits from <code>Exception</code>. You can make your own in two lines. Give the project one <strong>base class</strong>, so that callers can catch "anything from chaistall" in one clause, and a child class for each kind of failure, so callers can also be precise. Children can store extra information as attributes (<code>line</code>, <code>field</code>), which code can read without parsing the message.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hospital's complaint desk. "Billing problem" is a family; "wrong GST on the bill" is one specific complaint inside it. A clerk can take all billing problems, or only the GST ones, and the complaint form has fields (bill number, amount) so nobody has to read a paragraph to find them.</p></div>
  <h3>The chaistall family, used on all nine rows</h3>
  <p>The classes below are exactly the file <code>chaistall/errors.py</code> of the finished package (<a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a> puts them there), and <code>to_int</code>/<code>parse_row</code> are <code>chaistall/parse.py</code>. The <code>raise … from e</code> inside <code>to_int</code> is explained in section 07; read it as "raise our error, remembering Python's".</p>
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
  <p>Read the output against the by-hand table of section 01. Revenue is now exactly <strong>₹230 from 6 orders</strong>: Gita's −1 is rejected by our own rule. Each rejection says which class it is (so code can react differently to a missing value and a bad number), which file line (8, 9, 10) and which field (qty, price, qty). The last line shows how the family works: a <code>BadNumberError</code> is a <code>BadRowError</code> and a <code>ChaiStallError</code>, but not a <code>ValueError</code>, so a <code>ValueError</code> from a real bug would <em>not</em> be caught by <code>except BadRowError</code>. Bugs crash; bad rows are skipped.</p>
  <p>What each part of the class does: <code>class ChaiStallError(Exception)</code> with only a docstring is a complete exception class. <code>BadRowError.__init__</code> stores <code>line</code> and <code>field</code> on the object, then calls <code>super().__init__(message)</code> so that <code>str(e)</code> and the traceback show a normal message. <code>MissingValueError</code> and <code>BadNumberError</code> add nothing but a name, and that name is the point. <code>TooManyBadRowsError</code> is for the whole file (used in the next note when more than half the rows are bad).</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>custom exception</strong> is a class derived from <code>Exception</code> (never from <code>BaseException</code>). An <strong>exception hierarchy</strong> is one project base class plus subclasses per failure kind; callers catch the base for "anything from this library" or a subclass for one kind. Context belongs in attributes, and the message is passed to <code>super().__init__</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not make one class per message ("QtyIsTwoError"). Make one class per way the caller will <em>react</em>. Here the importer reacts the same way to every bad row (skip and report), so <code>BadRowError</code> is what it catches; the children exist for reports and tests.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Exception Chaining.</b> <code>to_int</code> catches Python's <code>ValueError</code> and raises our <code>BadNumberError</code> instead. Did we just throw away the original error and its traceback?</div>

  <h2 id="pex-chain"><span class="num">07</span>Exception Chaining: raise … from</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Translating a low-level error (<code>int</code> failed) into a high-level one (line 8 has a bad qty) gives a better message. But when debugging we may need the low-level details. How do we keep both?</p>
  </div>
  <h3>Explicit chaining with from</h3>
  <p><code>raise NewError(…) from e</code> raises the new error and attaches the old one to it as its <strong>cause</strong>. Left uncaught, Python prints both tracebacks, joined by a sentence:</p>
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
  <p>Read it from the bottom, as always: our <code>BadNumberError: line 8: 'two' is not a whole number</code>, raised at line 8 of <code>to_int</code>. The sentence "The above exception was the direct cause of the following exception" says: look above for the cause. Above it is Python's original <code>ValueError</code> from <code>int(text)</code> at line 6. Nothing was lost.</p>
  <h3>Implicit chaining: an error while handling an error</h3>
  <p>If code inside an <code>except</code> block itself fails (a bug in the handler), Python also keeps the first error, but prints a different sentence:</p>
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
  <p>"During handling of the above exception, another exception occurred" means: the first error was being handled when a second, unplanned one happened (the typo <code>lne</code>). This wording is a strong hint that the bug is in your <code>except</code> block, not in the data.</p>
  <h3>What is stored, from None, and add_note</h3>
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
  <p>Every exception raised inside an <code>except</code> block automatically gets <code>__context__</code> (the error being handled). <code>from e</code> also sets <code>__cause__</code> and marks the context as already explained (<code>__suppress_context__ = True</code>), so the traceback uses the "direct cause" wording. <code>from None</code> sets the cause to <code>None</code> and still suppresses the context: the traceback shows only the new error. Use it when the original is pure noise for your users. Finally, <code>e.add_note(…)</code> (Python 3.11+) attaches extra lines of context to an existing exception without changing its type; the note appears at the bottom of the traceback ("file: orders_2026-10-19.csv, customer Esha").</p>
  <table class="tbl">
    <tr><th>form</th><th>what it does</th><th>traceback shows</th><th>use when</th></tr>
    <tr><td><code>raise</code></td><td>re-raises the current exception</td><td>the original only</td><td>log or count, then pass on</td></tr>
    <tr><td><code>raise New(…) from e</code></td><td>new error, <code>__cause__ = e</code></td><td>both, "direct cause"</td><td>translate low-level to your own words</td></tr>
    <tr><td>(error inside except)</td><td>new error, <code>__context__ = e</code></td><td>both, "during handling"</td><td>never on purpose: a bug in the handler</td></tr>
    <tr><td><code>raise New(…) from None</code></td><td>new error, cause hidden</td><td>new only</td><td>the original is noise for users</td></tr>
    <tr><td><code>e.add_note("…")</code></td><td>adds text to the same error</td><td>note at the end</td><td>add context while passing it on</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A customer complaint forwarded to head office: the branch manager writes a short summary on top ("line 8, bad qty") and staples the original receipt underneath (<code>from e</code>). Head office reads the summary, and still has the receipt if they need it.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Exception chaining</strong> links one exception to another. Explicit: <code>raise X from Y</code> sets <code>X.__cause__ = Y</code>. Implicit: raising inside an <code>except</code> block sets <code>X.__context__</code> to the exception being handled. Both are printed in tracebacks, oldest first.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>raise New(str(e))</code> without <code>from e</code> keeps only the message text. The original type and line numbers survive only as an implicit context, with the misleading "during handling" wording. When translating on purpose, always write <code>from e</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: EAFP vs LBYL.</b> We have been <em>trying</em> <code>int()</code> and handling failure. Wouldn't it be simpler to check the text first with <code>if text.isdigit()</code> and avoid exceptions altogether?</div>

  <h2 id="pex-eafp"><span class="num">08</span>EAFP vs LBYL: Try First or Check First?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>There are two ways to deal with a value that might be bad: look at it first and only use it if it looks fine, or just use it and handle the failure. Which one should the importer use, and does the choice change the results?</p>
  </div>
  <p><strong>LBYL</strong>, "Look Before You Leap": test the conditions first (<code>if text.isdigit(): int(text)</code>). <strong>EAFP</strong>, "Easier to Ask Forgiveness than Permission": do it, and catch the exception (<code>try: int(text) except ValueError</code>). Python's style generally prefers EAFP, for two concrete reasons shown below: the check may not match the real rule, and the world may change between the check and the action.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>LBYL is asking at the gate "is the stall open?" and then walking in. EAFP is walking in and, if the shutter is down, turning back. If the stall closes in the second between your question and your step, only EAFP handles it.</p></div>
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
  <p>Read the table row by row. For "2" both agree. For " 2" (a stray space from the spreadsheet) and "−1", the LBYL check says "not digits", but <code>int()</code> handles both fine, so LBYL wrongly throws away a valid order (and would hide Gita's −1 from our own positive-quantity rule, which then never runs). For "two" both say None. For "²" (a superscript two, which a phone keyboard can produce) <code>isdigit()</code> says True, yet <code>int("²")</code> raises: the check let it through and LBYL <em>crashed</em>. The check is a guess about what <code>int</code> will accept; the try is the real answer.</p>
  <p>For the menu lookup all three styles give the same answer; <code>dict.get</code> with a default is the neatest. The last lines simulate the second reason: we checked that today's file exists, then (in real life: another program, a cron job, a colleague) it was deleted, and <code>open</code> still failed. The check was true when made and false when used. This gap is called a race condition (more in <a class="xref" data-note="py_concurrency">Concurrency</a>).</p>
  <table class="tbl">
    <tr><th></th><th>LBYL (check first)</th><th>EAFP (try first)</th></tr>
    <tr><td>Looks like</td><td><code>if item in MENU: MENU[item]</code></td><td><code>try: MENU[item] except KeyError</code></td></tr>
    <tr><td>Correct when</td><td>the check exactly equals the real rule, and nothing can change in between</td><td>always: the operation itself is the test</td></tr>
    <tr><td>Fast when</td><td>failures are common (a check is cheaper than raising)</td><td>failures are rare (a try that succeeds costs almost nothing)</td></tr>
    <tr><td>Good for</td><td>cheap, exact checks: <code>if not rows:</code>, <code>if qty &lt;= 0:</code></td><td>conversions, lookups, files, network</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>EAFP</strong>: attempt the operation and handle the exception if it fails. <strong>LBYL</strong>: test preconditions before the operation. Python favours EAFP for operations whose success is hard to predict exactly (parsing, lookups, I/O); LBYL is fine for simple, exact conditions you own.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Check the file exists, then open it" is the classic LBYL race. Just open it inside <code>try</code> and handle <code>FileNotFoundError</code>; the finished importer does exactly that and returns exit code 2 (<a class="xref" data-note="py_modules">Modules</a> shows the run).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Logging Exceptions.</b> The importer now skips bad rows correctly. But it runs every night at 11 PM with nobody watching. Tomorrow, how does the owner know which rows were skipped and why?</div>

  <h2 id="pex-log"><span class="num">09</span>Logging Exceptions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A <code>print</code> goes to a screen nobody is looking at, carries no time or severity, and cannot be turned down without editing code. What should a handled error leave behind?</p>
  </div>
  <p><strong>Logging</strong> writes messages with a <strong>level</strong> (how serious: DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL) through a named <strong>logger</strong>. Configuration (done once, at program start) decides the format, where messages go (screen, file, a log service) and the minimum level shown, so you turn detail up or down without touching the code that logs. Inside an <code>except</code> block, <code>log.exception("…")</code> logs at ERROR level <em>and</em> appends the full traceback.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>An aeroplane's black box. <code>print(e)</code> is one passenger saying "something went wrong". <code>log.exception</code> is the full recording with timestamps, kept even when nobody was in the cockpit.</p></div>
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
  <p>Before: <code>basicConfig</code> sets the minimum level to INFO and a format of level, logger name, message; <code>getLogger("chaistall")</code> names the logger (inside a package you write <code>getLogger(__name__)</code>, so each module's messages carry its own name, like <code>chaistall.storage</code>). After: Ben's line logged at INFO. For Esha, <code>print(e)</code> produced one bare line; <code>log.exception</code> produced the level, the logger, our message with line 8, and the whole traceback down to the failing <code>int(...)</code>. The DEBUG message was not shown, because DEBUG is below the INFO threshold.</p>
  <p>Notice the arguments: <code>log.info("line %d ok: Rs %d", line, amount)</code>, not an f-string. The logger inserts the values only if the message is actually going to be shown, which saves work for DEBUG messages that are switched off. In the finished package, expected bad rows are logged with <code>log.warning("skipped %s", e)</code> (no traceback needed: the message already says line and field), and <em>unexpected</em> failures at the top of the CLI with <code>log.exception("import failed")</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>logger.exception(msg, *args)</code> logs <code>msg</code> at ERROR level with the current exception's traceback; it must be called from inside an <code>except</code> block. It equals <code>logger.error(msg, *args, exc_info=True)</code>. <code>logging.basicConfig(level=…, format=…)</code> configures the root logger once per program.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>except Exception: pass</code> and <code>except Exception as e: print(e)</code> both destroy the traceback. If you catch broadly at the top of a program, the minimum is <code>log.exception(…)</code>. (More on configuring handlers and files in <a class="xref" data-note="py_testing">Testing &amp; Debugging</a>.)</p></div>
  <div class="bridge"><b>What this still can't tell us → next: assert vs raise.</b> All our checks so far are about the <em>data</em>. Some checks are about our own <em>code</em>: "after parsing, no quantity can be negative". Should those raise too?</div>

  <h2 id="pex-assert"><span class="num">10</span>assert vs raise</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>parse_row</code> guarantees every good order has a positive quantity. If a future change breaks that guarantee, we want to find out at once. Is <code>raise</code> the tool for that too, or is there something lighter?</p>
  </div>
  <p><code>assert condition, "message"</code> means "this is true; if it is not, my program has a bug". If the condition is false it raises <code>AssertionError</code> with the message. It is a cheap, readable way to state assumptions <em>inside</em> your own code, and tests use it heavily (<a class="xref" data-note="py_testing">Testing</a>). But there is a catch, shown by running the same file twice:</p>
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
  <p>Run normally, the assert caught the impossible negative quantity. Run with <code>-O</code> ("optimise", which some deployment setups use), Python <strong>removes every assert statement</strong>, and the wrong revenue ₹20 (40 − 20) went straight through. So an assert must never be the only thing standing between bad <em>input</em> and your results.</p>
  <table class="tbl">
    <tr><th></th><th><code>raise</code></th><th><code>assert</code></th></tr>
    <tr><td>Meaning</td><td>"this input/situation is not acceptable"</td><td>"this cannot happen unless my code is wrong"</td></tr>
    <tr><td>With <code>python -O</code></td><td>still runs</td><td>removed</td></tr>
    <tr><td>Error type</td><td>any, e.g. <code>BadNumberError</code></td><td>always <code>AssertionError</code></td></tr>
    <tr><td>Chai Corner</td><td>qty "two" or −1 in the sheet</td><td>a negative qty <em>after</em> parse_row</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>The menu board's prices are rules for customers (raise). The owner's sticky note inside the till, "the drawer should never hold more than ₹5,000", is a check on the stall's own process (assert). Taking the sticky note down does not change what customers may order.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>assert expr, msg</code> is equivalent to <code>if __debug__ and not expr: raise AssertionError(msg)</code>; <code>__debug__</code> is False under <code>python -O</code>, so the check disappears. Use asserts for internal invariants; use <code>raise</code> for validation of anything that comes from outside the code.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>assert(qty &gt; 0, "msg")</code> with brackets asserts a non-empty tuple, which is always true: the check never fails (Python warns "assertion is always true"). Write <code>assert qty &gt; 0, "msg"</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: ExceptionGroup.</b> Every tool so far deals with one error at a time. But when the owner asks "what is wrong with Monday's sheet?", she wants all three problems in one answer, not one per run.</div>

  <h2 id="pex-group"><span class="num">11</span>ExceptionGroup: Many Errors at Once</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A <code>raise</code> stops at the first problem. A validation step ("check the whole sheet before importing") should report every problem together, and the caller may want to treat missing values differently from bad numbers. How can one raise carry several exceptions?</p>
  </div>
  <p>Python 3.11 added <code>ExceptionGroup(message, [exc1, exc2, …])</code>: one exception that wraps a list of others. A new clause, <code>except*</code> (except-star), picks out the members of a group by type; each matching <code>except*</code> clause runs once with a smaller group holding just those members. Here <code>validate_all</code> uses the real package code (<code>chaistall.parse.parse_row</code> and <code>chaistall.errors</code>, the same as section 06):</p>
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
  <p>The first two lines are the handled call: the group held all three rejections, the <code>except* MissingValueError</code> clause received the one on line 9, and the <code>except* BadNumberError</code> clause received lines 8 and 10, both in one pass. The rest is what an <em>unhandled</em> group looks like (we validated only rows 8 and 9 to keep it short): a tree drawn with <code>|</code> and <code>+-</code>, one numbered branch per member, each with its own traceback, and member 1 still shows its chained cause (<code>int</code>'s <code>ValueError</code>) from section 07.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A teacher returning a test with every mistake circled, sorted into "spelling" and "grammar" piles, instead of handing it back after the first mistake.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>ExceptionGroup(msg, excs)</code> is an exception containing a sequence of exceptions (<code>.exceptions</code>). <code>except* T as g</code> handles the members of type <code>T</code>, receiving them as a group <code>g</code>; several <code>except*</code> clauses can run for one group; unmatched members are re-raised. You cannot mix <code>except</code> and <code>except*</code> in one try statement.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Groups are for genuinely parallel failures (validating many rows, many concurrent tasks in <a class="xref" data-note="py_concurrency">asyncio</a>). For a single failure, a plain exception is clearer. And a plain <code>except BadRowError</code> does <em>not</em> catch a group of BadRowErrors: the group itself is an <code>ExceptionGroup</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Eleven ideas. How do they fit together into the importer's error handling, and which one answers which question?</div>

  <h2 id="pex-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We learnt each tool on the same nine rows. What is the one picture of how a bad row travels through the importer, and where each tool acts on it?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="pex-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="150" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="85" y="39" text-anchor="middle" font-size="11.5" font-weight="700">row text</text><text x="85" y="55" text-anchor="middle" class="tm" font-size="10">qty "two", line 8</text>
<rect x="200" y="20" width="200" height="44" rx="7" class="fr sr"/><text x="300" y="39" text-anchor="middle" font-size="11.5" font-weight="700">int("two") raises ValueError</text><text x="300" y="55" text-anchor="middle" class="tm" font-size="10">01 exception · 02 stack unwinds</text>
<rect x="440" y="20" width="210" height="44" rx="7" class="fg sg"/><text x="545" y="39" text-anchor="middle" font-size="11.5" font-weight="700">to_int: raise BadNumberError</text><text x="545" y="55" text-anchor="middle" class="tm" font-size="10">05 raise · 06 custom · 07 from e</text>
<line x1="160" y1="42" x2="198" y2="42" stroke="currentColor" marker-end="url(#pex-a9)"/><line x1="400" y1="42" x2="438" y2="42" stroke="currentColor" marker-end="url(#pex-a9)"/>
<line x1="545" y1="64" x2="545" y2="96" stroke="currentColor" marker-end="url(#pex-a9)"/>
<rect x="390" y="98" width="260" height="44" rx="7" class="fb sb"/><text x="520" y="117" text-anchor="middle" font-size="11.5" font-weight="700">read_orders: try / except BadRowError</text><text x="520" y="133" text-anchor="middle" class="tm" font-size="10">03 try · 04 catch the specific family</text>
<line x1="390" y1="120" x2="322" y2="120" stroke="currentColor" marker-end="url(#pex-a9)"/>
<rect x="60" y="98" width="260" height="44" rx="7" class="fv"/><text x="190" y="117" text-anchor="middle" font-size="11.5" font-weight="700">skip row, record line + field, log.warning</text><text x="190" y="133" text-anchor="middle" class="tm" font-size="10">09 logging · loop continues</text>
<line x1="190" y1="142" x2="190" y2="176" stroke="currentColor" marker-end="url(#pex-a9)"/>
<rect x="60" y="178" width="260" height="44" rx="7" class="fg sg"/><text x="190" y="197" text-anchor="middle" font-size="11.5" font-weight="700">6 good orders, ₹230 · 3 rejected</text><text x="190" y="213" text-anchor="middle" class="tm" font-size="10">10 assert invariants on the good ones</text>
<rect x="390" y="178" width="260" height="44" rx="7" class="fb sb"/><text x="520" y="197" text-anchor="middle" font-size="11.5" font-weight="700">validate_all → ExceptionGroup</text><text x="520" y="213" text-anchor="middle" class="tm" font-size="10">11 every problem at once · except*</text>
<rect x="160" y="246" width="340" height="44" rx="7" class="fr sr"/><text x="330" y="265" text-anchor="middle" font-size="11.5" font-weight="700">a real bug (TypeError, typo) is NOT caught</text><text x="330" y="281" text-anchor="middle" class="tm" font-size="10">it unwinds to the top: log.exception, exit code 1</text>
<text x="20" y="270" class="tm" font-size="10">08 EAFP: try int() rather than guess</text>
</svg><figcaption>A bad value becomes Python's exception, is translated into our own (keeping the cause), is caught by family at the row level, and leaves a log line and a rejection record. Anything not in our family is a bug and keeps unwinding.</figcaption></figure>
  <table class="tbl"><caption>Every idea on Monday's sheet</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Exception + traceback</td><td>—</td><td>what happens on a bad value?</td><td>crash at Esha's "two"; ₹230 lost</td><td>read every traceback bottom-up</td></tr>
    <tr><td>Call stack unwinding</td><td>exception + function calls</td><td>how does it travel; where to catch?</td><td>catch outside → None; per row → ₹210, 2 bad</td><td>catch at the unit you can lose</td></tr>
    <tr><td>try/except/else/finally</td><td>unwinding</td><td>handle and clean up?</td><td>"2" → else; "two" → except; None → escapes; finally always</td><td>around the risky line only</td></tr>
    <tr><td>Specific catching</td><td>exception class tree</td><td>which errors to catch?</td><td>bare except on a typo → ₹0, silently</td><td>always name the types</td></tr>
    <tr><td>raise</td><td>exceptions</td><td>reject values Python accepts?</td><td>Gita −1 → ValueError</td><td>validate input early</td></tr>
    <tr><td>Custom hierarchy</td><td>raise + classes</td><td>tell our failures apart?</td><td>₹230 from 6; lines 8, 9, 10 with fields</td><td>any library or pipeline</td></tr>
    <tr><td>Chaining (<code>from</code>)</td><td>custom + except</td><td>translate without losing the cause?</td><td>BadNumberError ← ValueError</td><td>whenever you re-raise as your own type</td></tr>
    <tr><td>EAFP vs LBYL</td><td>try/except</td><td>check first or try first?</td><td>isdigit: rejects " 2", crashes on "²"</td><td>EAFP for parsing, lookups, files</td></tr>
    <tr><td>logging.exception</td><td>except + logging</td><td>keep a record of failures?</td><td>"ERROR … line 8 skipped" + traceback</td><td>every handled-but-unexpected error</td></tr>
    <tr><td>assert</td><td>raise (AssertionError)</td><td>state "can't happen"?</td><td>catches −1 normally; −O → ₹20 slips</td><td>internal invariants, tests</td></tr>
    <tr><td>ExceptionGroup</td><td>custom + a list</td><td>report all problems at once?</td><td>missing [9]; bad numbers [8, 10]</td><td>validation, parallel tasks</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>expected problems with the data are raised as your own named exceptions, caught narrowly where you can afford to lose the work, and recorded; everything else is a bug and should crash loudly.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The usual ways error handling goes wrong in real code.</div>

  <h2 id="pex-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which error-handling habits produce wrong numbers or impossible debugging, and how do you spot each one in a code review?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: bare except / except Exception: pass</span><p>Hides typos and bugs (revenue ₹0 with no message) and swallows Ctrl+C. Name the expected types; at the top level use <code>except Exception: log.exception(…)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: one huge try block</span><p>Catches errors from lines you did not expect to fail and loses the whole batch on one bad row. Keep try tiny; put the per-item try inside the loop.</p></div>
  <div class="callout trap"><span class="label">Trap: general before specific</span><p><code>except Exception</code> above <code>except ValueError</code> makes the second unreachable. Most specific first.</p></div>
  <div class="callout trap"><span class="label">Trap: returning None instead of raising</span><p>The caller forgets to check, and None or −1 ends up in the totals. Raise; let the caller decide.</p></div>
  <div class="callout trap"><span class="label">Trap: re-raising without from</span><p><code>raise MyError(str(e))</code> loses the original type and line; use <code>raise MyError(…) from e</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: return in finally</span><p>Silently discards an exception in flight (<code>g()</code> returned "finally's return wins").</p></div>
  <div class="callout trap"><span class="label">Trap: print(e)</span><p>Keeps one line, loses the traceback, the time and the level. Use <code>log.exception</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: assert for validation</span><p>Removed by <code>python -O</code>. Validate input with <code>raise</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: subclassing BaseException</span><p>Your error would escape <code>except Exception</code> like Ctrl+C does. Always subclass <code>Exception</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: LBYL races and wrong checks</span><p><code>if path.exists(): open(path)</code> can still fail; <code>isdigit()</code> is not the same rule as <code>int()</code>. Try the real operation.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="pex-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Chai Corner, Monday 2026-10-19, 9 rows on file lines 2–10. Good rows: Asha 2×20, Ben 3×15, Asha 1×25, Chen 1×20, Dia 2×30, Ben 2×20 → <strong>₹230</strong>. Bad rows: line 8 Esha qty "two", line 9 Farid price empty, line 10 Gita qty −1.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Exception</td><td>what happens on a bad value?</td><td>crash at line 8, ₹230 lost</td><td>where did it travel?</td></tr>
    <tr><td>Call stack</td><td>how does it travel?</td><td>to_int → parse_row → import_day → main unwound</td><td>how to handle it?</td></tr>
    <tr><td>try/except/else/finally</td><td>handle + clean up?</td><td>per row: ₹210, 2 bad</td><td>which types to catch?</td></tr>
    <tr><td>Specific catching</td><td>what to catch?</td><td>bare except: ₹0 silently</td><td>−1 is not an error to Python</td></tr>
    <tr><td>raise</td><td>reject what Python accepts?</td><td>−1 → ValueError</td><td>all failures look alike</td></tr>
    <tr><td>Custom hierarchy</td><td>tell failures apart?</td><td>₹230; lines 8, 9, 10</td><td>original cause hidden</td></tr>
    <tr><td>Chaining</td><td>keep the cause?</td><td><code>__cause__</code> = ValueError</td><td>should we check first?</td></tr>
    <tr><td>EAFP vs LBYL</td><td>check or try?</td><td>isdigit wrong on " 2", "−1", "²"</td><td>nobody sees skipped rows</td></tr>
    <tr><td>logging.exception</td><td>keep a record?</td><td>ERROR line 8 + traceback</td><td>checks on our own code?</td></tr>
    <tr><td>assert</td><td>state invariants?</td><td>−O lets ₹20 through</td><td>one error at a time</td></tr>
    <tr><td>ExceptionGroup</td><td>all problems at once?</td><td>missing [9], bad [8, 10]</td><td>→ next note: read from a real file</td></tr>
  </table>
  <h3>Definitions and syntax</h3>
  <ul>
    <li><strong>Exception</strong>: an object describing a runtime error; <strong>raising</strong> it stops normal flow and unwinds the call stack until a matching <code>except</code>; unhandled → traceback, non-zero exit.</li>
    <li><strong>Traceback</strong>: read bottom-up: <code>Type: message</code>, the failing line (with <code>^^^</code> markers), then the chain of calls, oldest at the top.</li>
    <li><code>try: A  except T as e: B  else: C  finally: D</code> — B if A raised a T (or subclass); C if A raised nothing; D always (even after return); unmatched errors continue after D.</li>
    <li><code>except (T1, T2) as e</code>; first matching clause wins; bare <code>except:</code> = <code>except BaseException:</code>.</li>
    <li>Tree: <code>BaseException</code> → {<code>Exception</code> → ValueError, LookupError (KeyError, IndexError), ArithmeticError, OSError (FileNotFoundError) …; <code>KeyboardInterrupt</code>; <code>SystemExit</code>}.</li>
    <li><code>raise T("msg")</code> new error; <code>raise</code> re-raise current; <code>raise T(…) from e</code> sets <code>__cause__</code>; raising inside except sets <code>__context__</code>; <code>from None</code> hides it; <code>e.add_note("…")</code> adds context.</li>
    <li>Custom: <code>class ChaiStallError(Exception)</code>; children store attributes, call <code>super().__init__(msg)</code>.</li>
    <li><strong>EAFP</strong> = try, then handle; <strong>LBYL</strong> = check, then act.</li>
    <li><code>log.exception("…")</code> inside except = ERROR + traceback = <code>log.error(…, exc_info=True)</code>; levels DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL; pass args, not f-strings.</li>
    <li><code>assert cond, msg</code> → AssertionError; removed by <code>python -O</code>.</li>
    <li><code>raise ExceptionGroup(msg, [e1, e2])</code>; <code>except* T as g</code> receives the T members (<code>g.exceptions</code>).</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>try/except</b><p>Around the one risky operation, at the level of work you can afford to lose (one row).</p><small>Not around whole programs, except one top-level logger</small></div>
    <div><b>raise</b><p>Input breaks a rule (qty ≤ 0, empty price). Fail fast with the value in the message.</p><small>Not returning None/−1 as a signal</small></div>
    <div><b>Custom exceptions</b><p>Any library or pipeline: one base + a child per way callers react; attributes for context.</p><small>Not one class per message</small></div>
    <div><b>raise … from e</b><p>Translating low-level errors into your own words.</p><small>from None only when the cause is noise</small></div>
    <div><b>log.exception</b><p>Unexpected failures you handle; top-level catch-alls.</p><small>Expected bad rows: log.warning is enough</small></div>
    <div><b>assert</b><p>Internal "can't happen" invariants; tests.</p><small>Never for input validation</small></div>
    <div><b>ExceptionGroup</b><p>Validation of many items; concurrent tasks.</p><small>Not for a single error</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Bare except (₹0 silently, Ctrl+C swallowed); huge try blocks; general before specific; None instead of raise; re-raise without <code>from</code>; return in finally; <code>print(e)</code>; assert for validation (gone under -O); subclassing BaseException; LBYL races and wrong checks.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Which line of a traceback do you read first?</td><td>The last: exception type and message</td></tr>
    <tr><td>Per-row try/except on the 9 rows <em>without</em> the positive-qty rule gives?</td><td>₹210 with 2 bad (Gita's −20 slips in)</td></tr>
    <tr><td>On which paths does <code>finally</code> run?</td><td>All: success, handled, unhandled, even after return</td></tr>
    <tr><td>Does <code>except Exception</code> catch Ctrl+C?</td><td>No: KeyboardInterrupt derives from BaseException only</td></tr>
    <tr><td>Why is <code>assert qty &gt; 0</code> not enough to validate the sheet?</td><td><code>python -O</code> removes it; use raise</td></tr>
  </table>

  <h2 id="pex-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is an exception, and what happens if nobody handles it?</summary><div class="qa-body">An object describing an error found at runtime. Raising it stops the normal flow; Python unwinds the call stack looking for a matching <code>except</code>. If none is found, it prints a traceback and the program exits with a non-zero code, losing any unsaved results (our ₹230).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do <code>else</code> and <code>finally</code> run?</summary><div class="qa-body"><code>else</code> only when the try block raised nothing. <code>finally</code> always: after success, after a handled exception, after an unhandled one (before it continues unwinding), even after a <code>return</code> in try or except.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's printed? <code>def f():<br>&nbsp;&nbsp;try: return "try"<br>&nbsp;&nbsp;finally: print("finally")<br>print(f())</code></summary><div class="qa-body"><code>finally</code>, then <code>try</code>. The return value is computed, finally runs, then the function returns. A <code>return</code> inside finally would replace the value and also swallow any exception.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a bare <code>except:</code> dangerous?</summary><div class="qa-body">It catches <code>BaseException</code>, so Ctrl+C (KeyboardInterrupt) and <code>sys.exit</code> (SystemExit) stop working, and every bug becomes a silent wrong result: a typo made revenue ₹0 with no message.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>raise</code> vs <code>raise e</code> vs <code>raise New() from e</code>?</summary><div class="qa-body">Bare <code>raise</code> re-raises the current exception unchanged. <code>raise e</code> re-raises the same object (the traceback gains the current line). <code>raise New() from e</code> raises a new exception with <code>__cause__ = e</code>, printed as "The above exception was the direct cause of the following exception".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you design exceptions for a data pipeline library?</summary><div class="qa-body">One base class (<code>ChaiStallError(Exception)</code>), a subclass per way callers will react (<code>BadRowError</code> skip-and-report, <code>TooManyBadRowsError</code> abort), attributes for context (<code>line</code>, <code>field</code>), <code>super().__init__(msg)</code> for the message, and <code>raise … from e</code> when translating built-in errors. Optionally also inherit a built-in (<code>class BadNumberError(BadRowError, ValueError)</code>) if callers already catch ValueError.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"During handling of the above exception, another exception occurred" vs "The above exception was the direct cause…": what does each tell you?</summary><div class="qa-body">"During handling" = implicit chaining: a new error happened inside an except block, usually a bug in the handler. "Direct cause" = explicit <code>raise … from e</code>: someone deliberately translated the error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>EAFP or LBYL for converting user text to int?</summary><div class="qa-body">EAFP: <code>try: int(text) except ValueError</code>. A pre-check like <code>isdigit()</code> is a different rule: it rejects " 2" and "-1" (which int accepts) and accepts "²" (which int rejects, crashing the LBYL code).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you log an exception with its traceback?</summary><div class="qa-body">Inside the except block: <code>logger.exception("context %s", value)</code>, which logs at ERROR with <code>exc_info</code>. Same as <code>logger.error(…, exc_info=True)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use an ExceptionGroup?</summary><div class="qa-body">When several independent failures should be reported together: validating all rows of a sheet, or several concurrent tasks failing (asyncio's TaskGroup raises one). Handle members by type with <code>except*</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does raising our own errors (section 05) force a custom hierarchy (section 06)?</summary><div class="qa-body">Once we raise <code>ValueError</code> for −1, data problems and genuine bugs share one type, so <code>except ValueError</code> would also hide bugs. Our own <code>BadRowError</code> family lets the importer catch exactly "bad row" and let every bug crash.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you build the custom hierarchy but skip chaining?</summary><div class="qa-body">The message improves ("line 8, qty: 'two'…") but the original <code>ValueError</code>, its line in <code>int()</code> and its traceback are reduced to an implicit context with misleading wording, or lost if you use <code>from None</code>. Debugging a wrong translation becomes guesswork.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does where you put the try (section 02) interact with the custom hierarchy?</summary><div class="qa-body">The hierarchy decides <em>what</em> is caught (only <code>BadRowError</code>), the position decides <em>how much is lost</em> (one row). Together: per-row <code>except BadRowError</code> keeps ₹230 and three rejections, while a bug still unwinds to the top-level <code>log.exception</code> and exit code 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: the next note reads the rows from a file. Which new exceptions will appear, and where should they be caught?</summary><div class="qa-body"><code>FileNotFoundError</code> (no sheet for that day) and <code>UnicodeDecodeError</code> (wrong encoding) happen once per file, not per row, so they are caught at the top of the CLI (the finished importer returns exit code 2 for a missing file), not inside the row loop. <code>with open(…)</code> uses the same <code>finally</code> idea to close the file on every path.</div></details>
</main>
`
});
