// notes/python/py_exceptions.js — Exceptions & Error Handling
Object.assign(TOPIC_CONTENT, {
  "py_exceptions": `<main>
<h1>Exceptions &amp; Error Handling</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>Exceptions &amp; Error Handling</span></div>
  <p class="lead">Real programs meet real data, and real data is messy: a quantity typed as a word, a price left empty, a file that is not where it should be. When Python cannot carry out an operation it raises an exception, and unless your code handles it the program stops on the spot, losing everything it has computed so far. Error handling is how you decide which failures are expected and can be dealt with (skip the bad row, retry the request, report the problem) and which are bugs that should crash loudly so someone fixes them. It appears everywhere in data and backend work: validating input, ETL pipelines that must survive one bad row in a million, API clients with retries, and the custom exception classes every library exposes. Throughout this page we follow one small example, a chai stall's order sheet in which six rows are good (worth Rs 230) and three are bad, and we improve the code that totals it one idea at a time.</p>

  <h2 id="pex-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Exceptions &amp; Error Handling</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What happens</div>
        <ul>
          <li>An exception is an object describing a failure</li>
          <li>Raising it unwinds the call stack until an <code>except</code> matches</li>
          <li>No match: traceback on stderr, exit code 1</li>
          <li>Read tracebacks from the bottom up</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Handling</div>
        <ul>
          <li><code>try</code> / <code>except</code> / <code>else</code> / <code>finally</code></li>
          <li>Catch specific types; first match wins</li>
          <li>Bare <code>except:</code> hides bugs and swallows Ctrl+C</li>
          <li>Catch at the level of the unit you can afford to lose</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Raising</div>
        <ul>
          <li><code>raise ValueError("...")</code> for your own rules</li>
          <li>Bare <code>raise</code> re-raises unchanged</li>
          <li>Custom classes: one base, one child per kind of failure</li>
          <li><code>raise New(...) from e</code> keeps the cause</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Style and tools</div>
        <ul>
          <li>EAFP (try it) over LBYL (check first)</li>
          <li><code>log.exception()</code> keeps the traceback</li>
          <li><code>assert</code> for "cannot happen", removed by <code>-O</code></li>
          <li><code>ExceptionGroup</code> + <code>except*</code> for many errors at once</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pex-crash"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Exceptions and Tracebacks</span><span class="rm-sub">what raising does and how to read the report</span></div></div>
      <div class="rm-item rm-done" data-target="pex-stack"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Call Stack and Unwinding</span><span class="rm-sub">how an error travels out of nested calls</span></div></div>
      <div class="rm-item rm-done" data-target="pex-try"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">try / except / else / finally</span><span class="rm-sub">which block runs on each path</span></div></div>
      <div class="rm-item rm-done" data-target="pex-catch"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Exception Hierarchy</span><span class="rm-sub">catching the right things, not everything</span></div></div>
      <div class="rm-item rm-done" data-target="pex-raise"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">raise and Re-raise</span><span class="rm-sub">reporting problems Python cannot see</span></div></div>
      <div class="rm-item rm-done" data-target="pex-custom"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Custom Exception Classes</span><span class="rm-sub">your own names for your own failures</span></div></div>
      <div class="rm-item rm-done" data-target="pex-chain"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Exception Chaining</span><span class="rm-sub">keeping the original cause</span></div></div>
      <div class="rm-item rm-done" data-target="pex-eafp"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">EAFP vs LBYL</span><span class="rm-sub">try first or check first</span></div></div>
      <div class="rm-item rm-done" data-target="pex-log"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Logging Exceptions</span><span class="rm-sub">leaving a record with the traceback</span></div></div>
      <div class="rm-item rm-done" data-target="pex-assert"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">assert vs raise</span><span class="rm-sub">bug checks versus input checks</span></div></div>
      <div class="rm-item rm-done" data-target="pex-group"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">ExceptionGroup and except*</span><span class="rm-sub">reporting many failures at once</span></div></div>
      <div class="rm-item rm-done" data-target="pex-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">error handling that hides errors</span></div></div>
      <div class="rm-item rm-done" data-target="pex-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">syntax, hierarchy, chaining table</span></div></div>
      <div class="rm-item rm-done" data-target="pex-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on errors</span></div></div>
    </div>
  </div>

  <h2 id="pex-crash"><span class="num">01</span>Exceptions and Tracebacks</h2>
  <p>Our running example is a chai stall's order sheet. It arrives as text, the way a CSV file delivers it, so every value is a string. Six rows are fine; the last three contain the kinds of mistakes real data always has: a quantity written as a word, a missing price, and a negative quantity.</p>
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
  <p>The obvious way to total the sheet is to convert each quantity and price with <code>int()</code>, multiply, and keep a running total:</p>
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
  <p>Six rows succeed and the total climbs to 230. On the seventh row, <code>int("two")</code> cannot produce a number. Python does not return a wrong value and does not skip the row. It stops the whole program and prints a report. The final <code>print</code> never runs, and the correct total of 230, sitting in memory a moment earlier, is thrown away.</p>
  <p>What happened is called <strong>raising an exception</strong>. An <strong>exception</strong> is an object that Python creates to describe a problem found while the program is running, and raising it means abandoning the normal flow of the program to report that problem. Think of a factory line with an emergency stop cord: when a worker finds something they cannot handle, they pull the cord and the line stops, rather than passing a broken item along. If nobody responds to the stop, the factory closes for the day. In Python, "responding" means handling the exception, which the rest of this page is about; if nothing handles it, Python prints the report you see above and ends the program with exit code 1. (A mistake in the code's grammar, a <code>SyntaxError</code>, is different: Python finds it while reading the file, before running any of it, so nothing in that file runs at all.)</p>
  <p>The report is called a <strong>traceback</strong>, and it is easiest to read from the bottom up. The last line, <code>ValueError: invalid literal for int() with base 10: 'two'</code>, says <em>what</em> went wrong: the exception's type, <code>ValueError</code> (a value of the right type, a string, but with unusable content), followed by a message. The lines above it say <em>where</em>: the file <code>total.py</code>, line 4, <code>in &lt;module&gt;</code> (which means at the top level of the file, not inside a function), then the source line itself, with <code>~~~^^^</code> markers underlining the exact part that failed, <code>int(row["qty"])</code>. The first line, "most recent call last", warns that when several functions are involved they are listed oldest first, so the place that actually failed is always just above the error message. A traceback is like a parcel-tracking page read backwards: the last line says "parcel damaged", and the lines above show at which depot and which route it took to get there.</p>

  <h2 id="pex-stack"><span class="num">02</span>The Call Stack and Unwinding</h2>
  <p>Real programs are not one loop; the failing line is usually several function calls deep. To handle errors well you need to know how an exception travels out of those calls. Here is the same calculation split into small functions, the way real code is organised:</p>
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
  <p>This traceback has one entry for each function that was in progress when <code>int(text)</code> failed: the module called <code>main</code>, which called <code>import_day</code>, which called <code>parse_row</code>, which called <code>to_int</code>. That chain of calls waiting for each other is the <strong>call stack</strong>. Each running call is a <strong>frame</strong>: a small workspace holding that call's local variables and the line it has reached. When a function calls another, a new frame is placed on top of the stack; when it returns, its frame is removed. A pile of plates is a good picture: you can only add or remove plates at the top, and the plate at the bottom has been there the longest.</p>
  <p>When an exception is raised, Python looks for a handler in the frame where it happened. If there is none, it removes that frame and looks in the caller's frame, then the caller's caller, and so on downwards. Removing frames one by one like this is called <strong>unwinding the stack</strong>. A fire alarm in a tall building works the same way: if the warden on the 4th floor cannot deal with it, the floor is evacuated and the alarm passes down to the 3rd floor's warden, then the 2nd, then the 1st. If no warden deals with it, the building closes, which for a program means the traceback and exit. The figure shows the stack at the moment <code>int("two")</code> fails.</p>
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
</svg><figcaption>Unwinding: the exception moves down the stack one frame at a time, discarding each frame's local variables, until a matching handler is found or the program ends.</figcaption></figure>
  <p>Read the figure from the top. <code>to_int</code> has no handler, so its frame is dropped (step 1), then <code>parse_row</code>'s (step 2). At step 3, <code>import_day</code>'s frame is dropped, and its local variable <code>total</code>, which held 230, disappears with it: this is exactly why the good work was lost. <code>main</code> goes next, and finally the top level has no handler either, so Python prints the traceback.</p>
  <p>You can watch unwinding happen. In the next version each function prints when it starts and, in a <code>finally</code> block, when it leaves. (A <code>finally</code> block runs whenever its function is left, for whatever reason; section 03 covers it properly.) Only two rows are processed, Ben's good row and Esha's bad one, and this time the exception is caught at the very top with <code>try</code>/<code>except</code>:</p>
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
  <p>Ben's row goes in and out normally: every "enter" has a matching "leave". For Esha's row, <code>to_int('two')</code> raises; its <code>finally</code> prints "leave to_int" as its frame is dropped; then <code>parse_row</code>'s <code>finally</code> runs as <em>its</em> frame is dropped, and note that the second <code>to_int</code> call for the price never happens. <code>import_day</code> is abandoned in the middle of its loop, so "leave import_day normally" is never printed, and the top-level <code>except ValueError</code> finally catches the exception.</p>
  <p>This leads to the most practical lesson about handling errors: <em>where</em> you catch decides what survives. Everything between the place of the error and the handler is thrown away, so the handler should sit at the level of the unit of work you are willing to lose. Compare one handler around the whole loop with one handler around each row:</p>
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
  <p>With the handler outside the loop, one bad row cost the whole day's result, <code>None</code>. With the handler inside the loop, only the bad rows were lost: the total is 210, and two rows were skipped. You may wonder why it is 210 and not 230, and why only two rows failed when three are bad. Gita's quantity of −1 is a perfectly valid integer, so Python raised nothing and −1 × 20 = −20 went into the total. Python only raises for problems <em>it</em> can see; section 05 shows how to raise for problems only you can see.</p>

  <h2 id="pex-try"><span class="num">03</span>try / except / else / finally</h2>
  <p>We have used <code>try</code> and <code>except</code> informally; now let us look at the whole statement. A <code>try</code> statement has up to four blocks. The <code>try</code> block holds the code that might fail. Each <code>except SomeError as e:</code> block runs only if the try block raised that type of exception (or a more specific kind of it), and <code>e</code> is the exception object. The <code>else</code> block runs only if the try block raised <em>nothing</em>; it is the place for the "success" work. The <code>finally</code> block runs <em>always</em>, whether the try block succeeded, failed with a handled error, failed with an unhandled one, or even executed a <code>return</code>; it is the place for cleanup such as closing a file or releasing a lock.</p>
  <p>Think of an order at a counter. You try to make the drink (try). If you run out of milk, you tell the customer and offer something else (except). If everything went well, you hand the drink over (else). And whatever happened, you wipe the counter afterwards (finally). The figure shows the possible routes:</p>
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
</svg><figcaption>At most one of else / except runs. finally runs on every route; on the "no match" route the exception carries on unwinding after finally.</figcaption></figure>
  <p>There are three routes out of <code>try</code>: no error leads to <code>else</code>; an error that matches leads to <code>except</code>; an error that matches no <code>except</code> clause skips both. All three routes pass through <code>finally</code>. On the third route, once <code>finally</code> has run, the exception continues unwinding into the caller. The function below sends three inputs down the three routes:</p>
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
  <p>For <code>"2"</code> the try block succeeded, so <code>else</code> ran and returned 2. For <code>"two"</code> the <code>except ValueError</code> block ran and returned <code>None</code>. For <code>None</code>, <code>int(None)</code> raised a <code>TypeError</code>, which no clause matches, so neither <code>except</code> nor <code>else</code> ran; <code>finally</code> ran and then the <code>TypeError</code> escaped to the caller's own <code>try</code>. Notice also the order of the lines: "finally: always" is printed <em>before</em> "caller got", which means <code>finally</code> runs after a <code>return</code> statement has been reached but before the value is actually handed back.</p>
  <table class="tbl">
    <tr><th>input</th><th>try</th><th>except ValueError</th><th>else</th><th>finally</th><th>caller sees</th></tr>
    <tr><td>"2"</td><td>succeeds</td><td>skipped</td><td>runs, returns 2</td><td>runs</td><td>2</td></tr>
    <tr><td>"two"</td><td>raises ValueError</td><td>runs, returns None</td><td>skipped</td><td>runs</td><td>None</td></tr>
    <tr><td>None</td><td>raises TypeError</td><td>no match</td><td>skipped</td><td>runs</td><td>the TypeError</td></tr>
  </table>
  <p>Why have <code>else</code> at all, instead of putting the success work at the end of the <code>try</code> block? Because everything inside <code>try</code> is protected by the <code>except</code> clauses. If a bug in the success code happened to raise a <code>ValueError</code>, it would be caught and treated as "not a number", hiding the bug. Keeping the <code>try</code> block down to the one risky line, and moving the rest to <code>else</code>, means the handler only catches what you meant it to catch.</p>
  <p>Because <code>finally</code> always runs, it can also override what would have happened. A <code>return</code> inside <code>finally</code> replaces both the normal return value and any exception that was on its way out:</p>
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
  <p><code>f</code> shows the normal case: <code>finally</code> ran, then the value from <code>try</code> was returned. In <code>g</code>, a <code>ValueError</code> was raised, but the <code>return</code> in <code>finally</code> replaced it, and the error vanished without a trace. A <code>return</code>, <code>break</code> or <code>continue</code> inside <code>finally</code> is therefore a bug pattern (Python 3.14 warns about it). Use <code>finally</code> only for cleanup.</p>

  <h2 id="pex-catch"><span class="num">04</span>The Exception Hierarchy</h2>
  <p>An <code>except</code> clause names a type of exception, and so far we have named <code>ValueError</code>. How does Python decide whether a raised exception "matches"? Exception types are classes, arranged in a family tree using inheritance (see <a class="xref" data-note="py_oop">OOP Concepts</a>), and <code>except Parent</code> matches the parent and every class below it. The <code>__mro__</code> attribute lists a class's ancestors, so we can print each exception's family line:</p>
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
  <p><code>KeyError</code> (a missing dictionary key) sits under <code>LookupError</code>, together with <code>IndexError</code>, so <code>except LookupError</code> catches both. <code>FileNotFoundError</code> sits under <code>OSError</code>, together with <code>PermissionError</code> and other operating-system errors. Almost everything sits under <code>Exception</code>, the class for ordinary errors. Two important exceptions do not: <code>KeyboardInterrupt</code>, raised when the user presses Ctrl+C, and <code>SystemExit</code>, raised by <code>sys.exit()</code>, sit directly under <code>BaseException</code>. They are placed there on purpose, because they are not errors at all but requests to stop, and ordinary error handling should not get in their way.</p>
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
<text x="320" y="195" text-anchor="middle" class="tm" font-size="10">(KeyError and IndexError sit under LookupError) · green = our own classes (section 06)</text>
</svg><figcaption>Part of the exception tree. <code>except Exception</code> catches everything in blue and green, but lets Ctrl+C and <code>sys.exit()</code> through.</figcaption></figure>
  <p>The tree explains the main rule for choosing what to catch: catch the specific types you <em>expect</em>, by name, and let everything else through. When several types are expected, a tuple names them in one clause. In the function below, a non-numeric quantity and a missing column are both expected data problems:</p>
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
  <p>The first three calls behave as planned: a good row gives 40, Esha's "two" and a row without a price column are reported as data problems. The fourth call passes <code>None</code> instead of a row, which is not bad data but a bug in the caller. Because only <code>ValueError</code> and <code>KeyError</code> were named, the resulting <code>TypeError</code> was not caught, and the program crashed with a traceback pointing straight at the problem. That is exactly what you want from a bug: it should be loud and easy to find.</p>
  <p>The opposite approach, catching everything, is tempting because it "makes the errors go away". A bare <code>except:</code> with no type catches every exception, including the two under <code>BaseException</code>. Here it is in action, with a one-letter typo in the code:</p>
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
  <p>Two things went wrong, both silently. The typo <code>"prise"</code> raised a <code>KeyError</code> on every row, the bare <code>except</code> swallowed each one, and the program reported revenue 0 with no message at all. A wrong answer with no error is the worst possible outcome, because nobody knows to look for the problem. Second, pressing Ctrl+C raises <code>KeyboardInterrupt</code> inside whatever code is running, and the bare <code>except</code> swallowed that too, so the program refused to stop. <code>except Exception</code> lets Ctrl+C through, as the last lines show, but it would still have hidden the typo. That makes it appropriate in exactly one place: at the very top of a program, as a last-resort handler that logs the full error (section 09) and exits with a failure code.</p>
  <p>One more rule follows from the tree. When a <code>try</code> has several <code>except</code> clauses, Python tests them from top to bottom and uses the first one that matches. So a general clause placed above a specific one makes the specific one unreachable; always list the most specific types first.</p>

  <h2 id="pex-raise"><span class="num">05</span>raise and Re-raise</h2>
  <p>Remember Gita's row: a quantity of −1 went straight into the total because Python saw nothing wrong with it. Python only raises exceptions for things <em>it</em> cannot do, like turning "two" into a number. Business rules, such as "a quantity must be positive", are invisible to Python, so your code has to report them itself. The <strong>raise</strong> statement does this: <code>raise ValueError("message")</code> creates an exception object and starts exactly the same unwinding process that Python uses for its own errors. Choose the type that describes the problem (a value of the right type with unacceptable content is what <code>ValueError</code> means) and write a message that names the rule and the bad value.</p>
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
  <p><code>parse_qty</code> now fails in two different ways, Python's way for "two" and our own way for −1, and the caller handles both with one <code>except ValueError</code>, because both are the same type. The principle is often called <em>fail fast</em>: raise as soon as the bad value is detected, close to its cause, rather than letting it travel on and produce a strange result somewhere far away.</p>
  <p>The second half of the example shows <strong>re-raising</strong>. <code>import_row</code> wants to <em>notice</em> the error (to log it or count it) but not to decide what to do about it; that decision belongs to its caller. A <code>raise</code> on its own, with nothing after it, inside an <code>except</code> block, re-raises the exception currently being handled, unchanged and with its original traceback. The caller still received "qty must be positive, got -1". It is like a receptionist who writes the complaint in the log book and then passes the caller on to the manager.</p>
  <p>Why raise instead of returning a special value such as <code>None</code> or −1 to mean "failed"? Because a return value can be ignored. If the caller forgets to check for <code>None</code>, the <code>None</code> ends up in a calculation or a report, far from where it was produced. An exception cannot be ignored: either some code handles it deliberately, or the program stops.</p>

  <h2 id="pex-custom"><span class="num">06</span>Custom Exception Classes</h2>
  <p>Raising <code>ValueError</code> for our own rules has created a new problem. Bad data now raises <code>ValueError</code>, but so do many genuine bugs. If the import loop says <code>except ValueError: skip the row</code>, a bug that happens to raise <code>ValueError</code> will be quietly treated as bad data. We need a way to say "this specific kind of failure, from our code".</p>
  <p>A <strong>custom exception</strong> is simply a class you write that inherits from <code>Exception</code>, giving your failures their own name. Think of a hospital's colour codes: instead of shouting "problem!", staff call "code blue" or "code red", and each team knows immediately whether the call is for them. The usual design has one <strong>base class</strong> for the whole project, so callers can catch "anything from this library" in one clause, and a subclass for each kind of failure. Subclasses can also store useful details as attributes, such as the line number and field name, so the code that catches them does not have to pick the message text apart.</p>
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
  <p>Look at the classes first. <code>ChaiStallError</code> contains only a docstring, and that is a complete exception class: inheriting from <code>Exception</code> provides everything else. <code>BadRowError</code> adds an <code>__init__</code> that stores <code>line</code> and <code>field</code> as attributes and passes a readable message to <code>super().__init__</code>, so that <code>str(e)</code> and tracebacks show a normal message. <code>MissingValueError</code> and <code>BadNumberError</code> add nothing but a name, and the name is the whole point. (The <code>raise ... from e</code> in <code>to_int</code> is chaining, explained in the next section.)</p>
  <p>Now the output. Revenue is exactly 230 from 6 orders, because Gita's −1 is finally rejected. Each rejection carries its class, line and field, read from attributes rather than parsed out of text. The last line shows why this design works: a <code>BadNumberError</code> is a <code>BadRowError</code> and a <code>ChaiStallError</code>, but it is <em>not</em> a <code>ValueError</code>. So <code>except BadRowError</code> catches every bad row and nothing else, and a <code>ValueError</code> from a real bug still crashes loudly. Bad rows are skipped; bugs are not hidden.</p>
  <p>How many classes should you create? One per way the <em>caller will react</em>, not one per message. Here every bad row is handled the same way (skip it and report it), so the loop catches <code>BadRowError</code>; the two children exist so that reports and tests can tell the cases apart. If some failures should be retried and others not, those deserve different classes. Two more rules: always inherit from <code>Exception</code>, never directly from <code>BaseException</code>, or your error will slip past <code>except Exception</code> just like Ctrl+C does; and if existing callers already catch a built-in type, a class can inherit from both, as in <code>class BadNumberError(BadRowError, ValueError)</code>, so their code keeps working.</p>

  <h2 id="pex-chain"><span class="num">07</span>Exception Chaining</h2>
  <p>In the custom-exception code, <code>to_int</code> caught Python's <code>ValueError</code> and raised a <code>BadNumberError</code> in its place. This is called translating an exception: the low-level message "invalid literal for int()" becomes the domain message "line 8, qty: 'two' is not a whole number", which is far more useful to the person reading it. But when debugging, the original error and where it happened still matter. <strong>Exception chaining</strong> keeps both: <code>raise NewError(...) from e</code> raises the new exception and records the old one as its <strong>cause</strong>. It is like a doctor's referral letter: the specialist gets the new diagnosis, with the original test results attached.</p>
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
  <p>The traceback now has two parts. The bottom part is our <code>BadNumberError</code>, with the clear message. Above it, joined by "The above exception was the direct cause of the following exception", is Python's original <code>ValueError</code> at line 6, <code>return int(text)</code>. Nothing was lost in the translation.</p>
  <p>Python also chains exceptions automatically in one situation: when new code inside an <code>except</code> block fails by accident. Here the handler itself has a typo:</p>
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
  <p>The wording is different: "During handling of the above exception, another exception occurred". This means a second, unplanned error happened while the first was being handled, and it is a strong hint that the bug is in your <code>except</code> block (here, <code>lne</code> instead of <code>line</code>). Learning to tell the two phrases apart saves time: "direct cause" means someone translated the error on purpose; "during handling" usually means a handler is broken.</p>
  <p>Behind the scenes, the two kinds of link are stored as attributes. Every exception raised inside an <code>except</code> block gets <code>__context__</code>, pointing at the exception being handled. <code>raise ... from e</code> additionally sets <code>__cause__</code>, and that is what switches the wording to "direct cause". Two related tools are worth knowing. <code>raise ... from None</code> hides the original entirely, for when it would only confuse users. And <code>e.add_note("...")</code> (Python 3.11+) attaches extra lines of context to an existing exception without changing its type, useful when re-raising:</p>
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
  <p>With <code>from e</code>, both <code>__cause__</code> and <code>__context__</code> point at the <code>ValueError</code>, and <code>__suppress_context__</code> is <code>True</code>, so only the "direct cause" wording is printed. With <code>from None</code>, <code>__cause__</code> is <code>None</code> and the context is still recorded but suppressed, so only the new error would be shown. The final part caught the <code>BadNumberError</code>, added a note naming the file and customer, and re-raised it with a bare <code>raise</code>: the note appears as the last line of the traceback.</p>
  <table class="tbl">
    <tr><th>form</th><th>what it does</th><th>traceback shows</th><th>use when</th></tr>
    <tr><td><code>raise</code></td><td>re-raises the current exception</td><td>the original only</td><td>you noticed it, the caller decides</td></tr>
    <tr><td><code>raise New(...) from e</code></td><td>new error, <code>__cause__ = e</code></td><td>both, "direct cause"</td><td>translating low-level errors into domain errors</td></tr>
    <tr><td>(error inside except)</td><td>new error, <code>__context__ = e</code></td><td>both, "during handling"</td><td>never on purpose: a bug in the handler</td></tr>
    <tr><td><code>raise New(...) from None</code></td><td>new error, original hidden</td><td>the new one only</td><td>the original is just noise for users</td></tr>
    <tr><td><code>e.add_note("...")</code></td><td>adds text to the same error</td><td>note at the end</td><td>adding context while passing it on</td></tr>
  </table>

  <h2 id="pex-eafp"><span class="num">08</span>EAFP vs LBYL</h2>
  <p>There are two broad styles for dealing with values that might be bad, and they have memorable names. <strong>LBYL</strong>, "Look Before You Leap", checks first and only acts if the check passes: <code>if text.isdigit(): int(text)</code>. <strong>EAFP</strong>, "Easier to Ask Forgiveness than Permission", just tries the operation and handles the exception if it fails. Crossing a road illustrates LBYL; walking into a colleague's office and apologising if they are busy illustrates EAFP. Python's culture generally prefers EAFP, and the example below shows two concrete reasons why:</p>
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
  <p>The first reason is that a check is a <em>guess</em> about what the real operation accepts, and guesses can be wrong in both directions. <code>isdigit()</code> rejects <code>" 2"</code> and <code>"-1"</code>, which <code>int()</code> parses perfectly well, so the LBYL version wrongly returns <code>None</code> for them. Worse, it accepts <code>"²"</code> (superscript two), which <code>int()</code> rejects, so the LBYL version crashes. The EAFP version is always right, because the operation itself is the test. For dictionary lookups both styles agree, and <code>dict.get(key, default)</code> is neater than either.</p>
  <p>The second reason is time. The last part checks that a file exists, then opens it, but in between the file is deleted (here by the code itself, standing in for another program). The check was true when it was made and false when it was used. This kind of bug is called a <strong>race condition</strong>, and this particular form is known as TOCTOU, "time of check to time of use". No amount of checking can prevent it; only trying the real operation and handling <code>FileNotFoundError</code> is safe. (See <a class="xref" data-note="py_concurrency">Concurrency</a> for more on races.)</p>
  <p>Is EAFP slow, since exceptions sound expensive? Entering a <code>try</code> block that does not raise is almost free in modern Python; raising and catching an exception does cost more than a simple check. Approximate timings for a million dictionary lookups on one machine:</p>
  <div class="fx" data-lang="py">import timeit

d = {"a": 1}
setup = "d = {'a': 1}"
hit_try  = "try:\\n    d['a']\\nexcept KeyError:\\n    pass"
miss_try = "try:\\n    d['b']\\nexcept KeyError:\\n    pass"
miss_in  = "if 'b' in d:\\n    d['b']"
for name, stmt in [("try, key present", hit_try), ("try, key missing", miss_try),
                   ("'in' check, key missing", miss_in)]:
    t = min(timeit.repeat(stmt, setup, number=1_000_000, repeat=5))
    print(f"{name:24} {t:.3f} s per million")</div>
  <div class="fx" data-lang="text">try, key present         0.013 s per million
try, key missing         0.079 s per million
'in' check, key missing  0.022 s per million</div>
  <p>A <code>try</code> where the key is present cost about the same as an <code>in</code> check, while a <code>try</code> that actually raised was several times slower (the exact numbers vary by machine and run). So the practical rule is: use EAFP when failures are rare, which is the normal case for parsing, lookups, files and network calls; use a simple check when failure is the common case or the check is cheap and exact, such as <code>if not rows:</code> or <code>if qty &lt;= 0:</code>.</p>

  <h2 id="pex-log"><span class="num">09</span>Logging Exceptions</h2>
  <p>Handling an error does not mean forgetting it. A nightly import job that skips rows at 2 AM must leave a record, and <code>print(e)</code> is a poor record: it goes to a screen nobody is watching, has no timestamp and no severity, and shows only the one-line message without the traceback. The <code>logging</code> module is the standard solution. It writes <strong>log records</strong>, messages with a <strong>level</strong> of importance (DEBUG, INFO, WARNING, ERROR, CRITICAL, from least to most serious), through a named <strong>logger</strong>. Configuration, done once at program start, decides the format, the destination (screen, file, a log service) and the minimum level to keep. Inside an <code>except</code> block, <code>log.exception("message")</code> logs at ERROR level <em>and</em> appends the full traceback.</p>
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
  <p>Ben's row produced an INFO record. For Esha's row the two approaches are side by side: <code>print(e)</code> produced one bare line, while <code>log.exception</code> produced the level, the logger's name, our message and the complete traceback, enough to find the problem the next morning. The DEBUG message was dropped because we set the minimum level to INFO. In a package, create loggers with <code>logging.getLogger(__name__)</code>, so each module's records carry its own name.</p>
  <p>Notice that the values were passed as separate arguments, <code>log.info("line %d ok: Rs %d", line, amount)</code>, rather than as an f-string. The logger only builds the final string if the record is actually going to be written, so this costs nothing for disabled levels. A common pattern is to log expected, already-explained failures with <code>log.warning("skipped %s", e)</code>, and unexpected failures at the top level of the program with <code>log.exception("import failed")</code>. Handlers, files and configuration are covered in <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>.</p>

  <h2 id="pex-assert"><span class="num">10</span>assert vs raise</h2>
  <p>Python has a second way to stop a program when something is wrong: <code>assert condition, "message"</code>. It raises <code>AssertionError</code> with the message if the condition is false. The intended meaning is different from <code>raise</code>, though. An <strong>assertion</strong> states something that <em>must</em> be true if your own code is correct, a so-called <strong>invariant</strong>; it is a note to yourself, "if this is ever false, I have a bug". Tests use <code>assert</code> constantly for the same reason. There is one important catch:</p>
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
  <p>Run normally, the assertion caught the negative quantity that a buggy validator let through. Run with <code>python -O</code> ("optimise"), Python removed every <code>assert</code> statement before running, and the wrong revenue, 40 − 20 = 20, went straight through. Some deployments run with <code>-O</code>, so an assertion must never be the only thing protecting your results from bad <em>input</em>. Think of assertions as the scaffolding on a building site: useful while building and checking, but you cannot rely on it to hold the building up.</p>
  <table class="tbl">
    <tr><th></th><th><code>raise</code></th><th><code>assert</code></th></tr>
    <tr><td>Meaning</td><td>"this input or situation is not acceptable"</td><td>"this cannot happen unless my code is wrong"</td></tr>
    <tr><td>With <code>python -O</code></td><td>still runs</td><td>removed</td></tr>
    <tr><td>Error type</td><td>any, e.g. <code>BadNumberError</code></td><td>always <code>AssertionError</code></td></tr>
    <tr><td>Example</td><td>qty "two" or −1 in the input file</td><td>a negative qty <em>after</em> validation</td></tr>
  </table>

  <h2 id="pex-group"><span class="num">11</span>ExceptionGroup and except*</h2>
  <p>A <code>raise</code> stops at the first problem. That is usually right, but sometimes you want to report <em>all</em> the problems at once: a validator that tells the user about every bad row in their file rather than one per attempt, or several tasks running at the same time that can each fail independently. Python 3.11 added <strong>ExceptionGroup</strong> for this: <code>ExceptionGroup(message, [exc1, exc2, ...])</code> is one exception that carries a list of others. It is like a delivery note listing every damaged item in a shipment instead of returning the box at the first one.</p>
  <p>To handle a group, Python added the <code>except*</code> clause (read "except star"). Each <code>except* SomeType</code> clause receives a smaller group containing only the members of that type, and, unlike ordinary <code>except</code>, several <code>except*</code> clauses can run for the same group. The example uses the <code>chaistall</code> package, where the classes from section 06 live in <code>chaistall/errors.py</code> and <code>parse_row</code> in <code>chaistall/parse.py</code>:</p>
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
    |   File "chaistall/parse.py", line 7, in to_int
    |     return int(row[field])
    | ValueError: invalid literal for int() with base 10: 'two'
    |
    | The above exception was the direct cause of the following exception:
    |
    | Traceback (most recent call last):
    |   File "group.py", line 9, in validate_all
    |     parse_row(row, line)
    |     ~~~~~~~~~^^^^^^^^^^^
    |   File "chaistall/parse.py", line 16, in parse_row
    |     qty, price = to_int(row, "qty", line), to_int(row, "price", line)
    |                  ~~~~~~^^^^^^^^^^^^^^^^^^
    |   File "chaistall/parse.py", line 9, in to_int
    |     raise BadNumberError(line, field, f"{row[field]!r} is not a whole number") from e
    | chaistall.errors.BadNumberError: line 8, qty: 'two' is not a whole number
    +---------------- 2 ----------------
    | Traceback (most recent call last):
    |   File "group.py", line 9, in validate_all
    |     parse_row(row, line)
    |     ~~~~~~~~~^^^^^^^^^^^
    |   File "chaistall/parse.py", line 15, in parse_row
    |     raise MissingValueError(line, field, "is empty")
    | chaistall.errors.MissingValueError: line 9, price: is empty
    +------------------------------------</div>
  <p><code>validate_all</code> collected every bad row instead of stopping, then raised one group. Both <code>except*</code> clauses ran for that single group: the first received line 9's <code>MissingValueError</code>, the second received lines 8 and 10's <code>BadNumberError</code>s. Any members matched by no clause would have been re-raised. The last line raises a group that nothing catches, to show how Python prints one: as a tree, with a numbered branch per member, each with its own traceback. Member 1 even shows its chained cause, the original <code>ValueError</code>.</p>
  <p>Two cautions. A plain <code>except BadRowError</code> does <em>not</em> catch a group of <code>BadRowError</code>s, because the object raised is an <code>ExceptionGroup</code>; use <code>except*</code>, or <code>except ExceptionGroup as g</code> and look at <code>g.exceptions</code>. And you cannot mix <code>except</code> and <code>except*</code> in one <code>try</code>. For a single failure a plain exception is clearer; groups are for genuinely parallel or collected failures, and <code>asyncio.TaskGroup</code> raises them when several tasks fail.</p>

  <h2 id="pex-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>Most error-handling mistakes have the same shape: the code makes an error disappear instead of handling it. The worst forms, the bare <code>except:</code> that turned a typo into "revenue 0" and the <code>return</code> inside <code>finally</code> that swallowed a <code>ValueError</code>, were shown in sections 04 and 03. A quieter version of the same mistake is putting a general clause before a specific one:</p>
  <div class="fx" data-lang="py">def parse_qty(text):
    try:
        return int(text)
    except Exception:
        return "some error"
    except ValueError:                  # unreachable: ValueError is an Exception
        return "not a number"

print(parse_qty("two"))</div>
  <div class="fx" data-lang="text">some error</div>
  <p>Clauses are tried top to bottom and the first match wins. A <code>ValueError</code> is an <code>Exception</code>, so the general clause caught it and the specific clause below could never run. Put the most specific types first.</p>
  <p>A second surprise is that the name bound by <code>except ... as e</code> does not survive the block:</p>
  <div class="fx" data-lang="py">try:
    int("two")
except ValueError as e:
    print("caught:", e)
try:
    print(e)                            # e was deleted when the except block ended
except NameError as err:
    print("NameError:", err)</div>
  <div class="fx" data-lang="text">caught: invalid literal for int() with base 10: 'two'
NameError: name 'e' is not defined</div>
  <p>Python deletes <code>e</code> when the <code>except</code> block ends. The exception object holds its traceback, the traceback holds the frame, and the frame holds <code>e</code>, a reference cycle that would keep a lot of memory alive. If you need the exception later, assign it to another variable inside the block.</p>
  <p>A third is writing <code>assert</code> as if it were a function call:</p>
  <div class="fx" data-lang="py">qty = -1
assert (qty &gt; 0, "qty must be positive")   # brackets: a tuple, always true
print("assert passed with qty =", qty)</div>
  <div class="fx" data-lang="text">m_assert.py:2: SyntaxWarning: assertion is always true, perhaps remove parentheses?
  assert (qty &gt; 0, "qty must be positive")   # brackets: a tuple, always true
assert passed with qty = -1</div>
  <p>With brackets, the condition and message form a two-element tuple, and a non-empty tuple is always true, so the assertion can never fail. Python even warns "assertion is always true". Write <code>assert qty &gt; 0, "qty must be positive"</code> with no brackets.</p>
  <p>The remaining mistakes have appeared earlier on the page. A huge <code>try</code> block catches errors from lines you never expected to fail and loses a whole batch for one bad item; keep <code>try</code> to the risky line and put per-item handlers inside the loop. Returning <code>None</code> or −1 instead of raising lets failures slip silently into results. <code>raise MyError(str(e))</code> without <code>from e</code> throws away the original type and line from the new error's story. <code>print(e)</code> keeps one line and loses the traceback, the time and the level; use <code>log.exception</code>. Validating input with <code>assert</code> stops working under <code>python -O</code>. Subclassing <code>BaseException</code> makes your error escape <code>except Exception</code>. And checking before acting (<code>if path.exists(): open(path)</code>, <code>isdigit()</code> before <code>int()</code>) can be both wrong and racy; try the real operation.</p>

  <h2 id="pex-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Exception</b>: an object describing a runtime error; raising it stops normal flow.</li>
    <li><b>Traceback</b>: the report printed for an unhandled exception; read bottom-up (type and message, failing line, then callers).</li>
    <li><b>Call stack / frame</b>: the chain of active calls; each call's workspace of local variables.</li>
    <li><b>Unwinding</b>: discarding frames one by one, running their <code>finally</code> blocks, until a matching <code>except</code>; unhandled → traceback, exit code 1.</li>
    <li><b>SyntaxError</b>: found when the file is compiled, before anything runs; a <code>try</code> in the same file cannot catch it.</li>
    <li><b>Custom exception</b>: a class inheriting from <code>Exception</code>; one project base class, one child per caller reaction, context in attributes.</li>
    <li><b>Chaining</b>: <code>__cause__</code> (set by <code>from e</code>) and <code>__context__</code> (set automatically inside <code>except</code>).</li>
    <li><b>EAFP / LBYL</b>: try then handle / check then act.</li>
    <li><b>Invariant</b>: a condition that must hold if the code is correct; checked with <code>assert</code>.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">try:
    risky()                       # keep tiny
except (ValueError, KeyError) as e:
    handle(e)                     # only if a matching error was raised
else:
    use_result()                  # only if try raised nothing
finally:
    cleanup()                     # always, even after return or an unhandled error

raise ValueError(f"qty must be positive, got {qty}")
raise                             # inside except: re-raise unchanged
raise BadNumberError(...) from e  # translate, keep the cause
e.add_note("file: orders.csv")

class AppError(Exception): ...
class BadRowError(AppError):
    def __init__(self, line, msg):
        self.line = line
        super().__init__(f"line {line}: {msg}")

log.exception("import failed")    # inside except: ERROR + traceback
assert qty &gt; 0, "bug: bad qty after validation"

try:
    raise ExceptionGroup("bad rows", [e1, e2])
except* BadNumberError as g:
    print(g.exceptions)</div>
  <h3>Hierarchy</h3>
  <table class="tbl">
    <tr><th>class</th><th>parent</th><th>typical cause</th></tr>
    <tr><td><code>ValueError</code></td><td>Exception</td><td>right type, bad value: <code>int("two")</code></td></tr>
    <tr><td><code>TypeError</code></td><td>Exception</td><td>wrong type: <code>"a" + 1</code>, <code>None["qty"]</code></td></tr>
    <tr><td><code>KeyError</code>, <code>IndexError</code></td><td>LookupError</td><td>missing key / index out of range</td></tr>
    <tr><td><code>ZeroDivisionError</code></td><td>ArithmeticError</td><td><code>1 / 0</code></td></tr>
    <tr><td><code>FileNotFoundError</code>, <code>PermissionError</code></td><td>OSError</td><td>file system and OS calls</td></tr>
    <tr><td><code>AttributeError</code>, <code>NameError</code></td><td>Exception</td><td>missing attribute / undefined name</td></tr>
    <tr><td><code>KeyboardInterrupt</code>, <code>SystemExit</code></td><td>BaseException</td><td>Ctrl+C, <code>sys.exit()</code>; not caught by <code>except Exception</code></td></tr>
  </table>
  <h3>Chaining</h3>
  <table class="tbl">
    <tr><th>form</th><th>sets</th><th>traceback wording</th></tr>
    <tr><td><code>raise X from e</code></td><td><code>__cause__</code></td><td>"The above exception was the direct cause..."</td></tr>
    <tr><td>error inside except</td><td><code>__context__</code></td><td>"During handling of the above exception..."</td></tr>
    <tr><td><code>raise X from None</code></td><td>suppresses context</td><td>only X</td></tr>
    <tr><td><code>e.add_note("...")</code></td><td><code>__notes__</code></td><td>note printed under the message</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Bare <code>except:</code> = <code>except BaseException:</code>: hides bugs and swallows Ctrl+C.</li>
    <li>First matching <code>except</code> wins: specific before general.</li>
    <li><code>finally</code> runs before a <code>return</code> completes; a <code>return</code> in <code>finally</code> swallows exceptions.</li>
    <li>The <code>as e</code> name is deleted when the block ends.</li>
    <li>Catch at the level of the unit you can afford to lose (one row, one file, one request).</li>
    <li><code>assert</code> is removed by <code>-O</code>; <code>assert(x, "msg")</code> is always true.</li>
    <li>A plain <code>except T</code> does not match an <code>ExceptionGroup</code> of T.</li>
    <li>Raising is several times slower than a check; a <code>try</code> that does not raise is nearly free.</li>
  </ul>

  <h2 id="pex-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is an exception, and what happens if nobody handles it?</summary><div class="qa-body">An exception is an object describing an error found while the program runs. Raising it stops normal flow, and Python unwinds the call stack looking for a matching <code>except</code>, running <code>finally</code> blocks on the way. If nothing matches, the traceback is printed to stderr and the process exits with code 1, losing anything not yet saved.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a syntax error and an exception?</summary><div class="qa-body">A <code>SyntaxError</code> is found when Python compiles the file, before any line runs, so nothing in that file executes and a <code>try</code> in the same file cannot catch it. Exceptions such as <code>ValueError</code> happen while code is running and can be handled. A <code>SyntaxError</code> can be caught when it comes from <code>eval</code>, <code>exec</code> or importing another module.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a traceback?</summary><div class="qa-body">From the bottom up. The last line gives the exception type and message, which say what went wrong. The lines just above show the file, line number, function and source line where it failed, with markers under the failing expression. Further up are the callers, oldest at the top, which show how the program got there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do <code>else</code> and <code>finally</code> run in a try statement?</summary><div class="qa-body"><code>else</code> runs only if the try block raised nothing; it holds success work you do not want covered by the <code>except</code> clauses. <code>finally</code> runs on every path: success, a handled exception, an unhandled exception (before it continues unwinding), and after a <code>return</code>, <code>break</code> or <code>continue</code> in the try or except blocks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>def f():<br>&nbsp;&nbsp;try: return "try"<br>&nbsp;&nbsp;finally: print("finally")<br>print(f())</code></summary><div class="qa-body">It prints <code>finally</code> and then <code>try</code>. The return value is computed, the <code>finally</code> block runs, and then the function actually returns. If <code>finally</code> contained its own <code>return</code>, that value would win and any exception in flight would be discarded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>try:<br>&nbsp;&nbsp;1 / 0<br>except ZeroDivisionError as e:<br>&nbsp;&nbsp;print("caught:", e)<br>print(e)</code></summary><div class="qa-body">First <code>caught: division by zero</code>, then a <code>NameError</code>, because Python deletes the <code>as</code> name at the end of the except block. The exception holds its traceback, which references the frame, which references <code>e</code>: deleting the name breaks that reference cycle. Assign it to another variable if you need it later.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a bare <code>except:</code> bad, and how is it different from <code>except Exception:</code>?</summary><div class="qa-body">A bare <code>except:</code> catches <code>BaseException</code>, including <code>KeyboardInterrupt</code> and <code>SystemExit</code>, so Ctrl+C and <code>sys.exit()</code> stop working, and every bug, such as a typo raising <code>KeyError</code>, becomes a silent wrong result. <code>except Exception</code> lets those two through but still hides bugs, so it belongs only in a top-level handler that logs the traceback with <code>log.exception</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you catch several exception types, and does the order of except clauses matter?</summary><div class="qa-body">Use a tuple, <code>except (ValueError, KeyError) as e:</code>, or separate clauses when they need different handling. Order matters: clauses are tested from top to bottom and the first match wins, so <code>except Exception</code> placed above <code>except ValueError</code> makes the second unreachable. List the most specific types first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>raise</code>, <code>raise e</code> and <code>raise New() from e</code>?</summary><div class="qa-body">A bare <code>raise</code> inside an except block re-raises the current exception unchanged. <code>raise e</code> raises the same object again and adds the current line to its traceback. <code>raise New() from e</code> raises a different exception with <code>__cause__</code> set to <code>e</code>, and the traceback shows both, joined by "The above exception was the direct cause of the following exception".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you define a custom exception, and how would you design them for a library?</summary><div class="qa-body">Subclass <code>Exception</code>: <code>class AppError(Exception): pass</code>. For a library, create one base class so users can catch everything from it, and one subclass per way callers will react (for example a validation error to skip, a connection error to retry). Store context in attributes such as <code>e.line</code>, pass the message to <code>super().__init__</code>, and use <code>raise ... from e</code> when wrapping built-in errors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>__cause__</code> and <code>__context__</code>?</summary><div class="qa-body"><code>__context__</code> is set automatically whenever an exception is raised while another is being handled; the traceback says "During handling of the above exception, another exception occurred", which usually means a bug in the handler. <code>__cause__</code> is set explicitly by <code>raise X from Y</code>, and the traceback says "direct cause", meaning a deliberate translation. <code>from None</code> sets <code>__suppress_context__</code> so the original is not printed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>EAFP vs LBYL: what are they and which is more Pythonic?</summary><div class="qa-body">LBYL checks before acting (<code>if key in d</code>); EAFP tries the operation and handles the exception (<code>try: d[key] except KeyError</code>). EAFP is considered Pythonic because the operation itself is the exact test (<code>"²".isdigit()</code> is True but <code>int("²")</code> fails) and because there is no race between the check and the use, such as a file deleted after <code>exists()</code>. LBYL is fine for cheap, exact checks and when failures are common.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are exceptions expensive in Python?</summary><div class="qa-body">Entering a <code>try</code> block that does not raise is almost free in Python 3.11 and later. Actually raising and catching costs several times as much as a simple check; in the measurement on this page a missing-key <code>try</code> was several times slower than an <code>in</code> check. So use EAFP when failures are rare and a check when failures are the normal case.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you log an exception with its traceback?</summary><div class="qa-body">Inside the except block call <code>logger.exception("context %s", value)</code>, which logs at ERROR level and appends the traceback; it is the same as <code>logger.error(..., exc_info=True)</code>. <code>print(e)</code> and <code>logger.error(str(e))</code> keep only the message. Pass values as arguments rather than f-strings so formatting is skipped for disabled levels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you use <code>assert</code> and when <code>raise</code>?</summary><div class="qa-body"><code>assert</code> documents internal invariants, things that cannot be false unless your code has a bug, and is used heavily in tests. It is removed when Python runs with <code>-O</code>, so it must never validate user input, files or API responses; use <code>raise</code> with a specific exception for those.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a <code>with</code> statement relate to try/finally, and can a context manager suppress an exception?</summary><div class="qa-body"><code>with cm:</code> works roughly like try/finally: the context manager's <code>__exit__</code> method always runs and receives the exception, if there was one. If <code>__exit__</code> returns True, the exception is suppressed. <code>contextlib.suppress(FileNotFoundError)</code> is a ready-made example. See <a class="xref" data-note="py_context">Context Managers</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are ExceptionGroup and <code>except*</code> for?</summary><div class="qa-body"><code>ExceptionGroup(msg, [e1, e2])</code> carries several independent failures in one raise, for example every bad row of a file, or several concurrent tasks failing (<code>asyncio.TaskGroup</code> raises one). <code>except* T as g</code> handles the members of type T; several <code>except*</code> clauses can run for one group, and unmatched members are re-raised. A plain <code>except T</code> does not match a group.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you implement retries for a flaky network call?</summary><div class="qa-body">Catch only temporary error types, retry a limited number of times with growing waits (exponential backoff), and re-raise after the last attempt so the caller sees the real error:<div class="fx" data-lang="py">def retry(fn, attempts=3, delay=0.5, retry_on=(ConnectionError, TimeoutError)):
    for i in range(1, attempts + 1):
        try:
            return fn()
        except retry_on:
            if i == attempts:
                raise
            time.sleep(delay * 2 ** (i - 1))</div>Do not retry errors that will never succeed, such as a <code>ValueError</code> or an HTTP 4xx response. Libraries such as <code>tenacity</code> add jitter and logging.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In a pipeline processing a million rows, how should errors be handled?</summary><div class="qa-body">Validate each row and raise a domain exception, such as <code>BadRowError</code> with the line and field, for bad data. Catch that type per row, record the rejection in a log or a rejects file, and continue. Let anything else, which is a bug, reach a top-level handler that logs the traceback and exits with a non-zero code. Optionally stop if the share of bad rows passes a threshold, because that usually means the input format has changed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test that a function raises the right exception?</summary><div class="qa-body">With pytest: <code>with pytest.raises(BadNumberError, match="line 8") as exc_info: parse_row(row, 8)</code>, then check attributes such as <code>exc_info.value.field == "qty"</code>. With unittest, use <code>self.assertRaises(BadNumberError)</code>. See <a class="xref" data-note="py_pytest">Testing with pytest</a>.</div></details>
</main>
`
});
