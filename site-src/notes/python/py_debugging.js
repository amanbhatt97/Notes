// notes/python/py_debugging.js — Debugging, Profiling & Logging
Object.assign(TOPIC_CONTENT, {
  "py_debugging": `<main>
<h1>Debugging, Profiling &amp; Logging</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>Debugging, Profiling &amp; Logging</span></div>
  <p class="lead">A failing test or a crash tells you <em>that</em> something is wrong; debugging, profiling and logging tell you <em>where</em>, <em>why</em>, <em>why it is slow</em>, and <em>what happened</em> when nobody was watching. Without them, fixes and optimisations are guesses: people rewrite the function they suspect while the real hotspot is one line elsewhere, or "fix" a crash by swallowing the exception. The tools are all in the standard library: tracebacks, <code>pdb</code>/<code>breakpoint()</code> and post-mortem debugging; <code>time.perf_counter</code>, <code>timeit</code>, <code>cProfile</code>/<code>pstats</code> and <code>tracemalloc</code>; and the <code>logging</code> module. In DS/ML and backend work they find the row with a bad value deep in a pipeline, the <code>apply</code> that makes a job take an hour, the memory peak that kills a container, and the log line that explains last night's failed run. The examples use a small billing module and a 20,000-order daily report; Python 3.13, paths shortened to <code>~/chai</code>.</p>

  <h2 id="pdg-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Debugging, Profiling &amp; Logging</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Tracebacks</div>
        <ul>
          <li>Read <b>bottom up</b>: type + message, then the frame, then callers</li>
          <li>"most recent call last" = the crash is at the bottom</li>
          <li>Fix where the bad value <b>entered</b>, not only where it exploded</li>
          <li><code>raise … from e</code> → "direct cause" chain</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">pdb</div>
        <ul>
          <li><code>breakpoint()</code>; <code>PYTHONBREAKPOINT=0</code> disables</li>
          <li><code>n</code> next · <code>s</code> step in · <code>r</code> return · <code>c</code> continue</li>
          <li><code>p</code> / <code>pp</code> · <code>ll</code> · <code>w</code> · <code>u</code>/<code>d</code> · <code>b</code> · <code>q</code></li>
          <li><b>Post-mortem</b>: <code>python -m pdb</code>, <code>pytest --pdb</code>, <code>%debug</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Timing</div>
        <ul>
          <li><code>time.perf_counter()</code> — stopwatch</li>
          <li>Double n, time ×4 → O(n²)</li>
          <li><code>timeit.repeat</code> — take the <b>min</b></li>
          <li>list <code>in</code> O(n) vs set <code>in</code> O(1)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Profiling</div>
        <ul>
          <li><b>cProfile</b> — every function call</li>
          <li><b>ncalls · tottime · cumtime</b></li>
          <li>high tottime → the function itself is slow</li>
          <li><b>line_profiler</b> — % per line</li>
          <li>Rule: measure → fix the top → re-measure</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Memory</div>
        <ul>
          <li><b>tracemalloc</b> — start · get_traced_memory · snapshot</li>
          <li>Peak matters; stream instead of building lists</li>
          <li>statistics("lineno") → which line allocates</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging</div>
        <ul>
          <li>DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL</li>
          <li><b>logger → handlers → formatter</b></li>
          <li><code>getLogger("app.payments")</code> → parent <code>app</code></li>
          <li><code>log.exception</code> = ERROR + traceback</li>
          <li>Lazy <code>%s</code> args; configure once; JSON lines</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The method</div>
        <ul>
          <li><b>Reproduce</b> → failing test</li>
          <li><b>Isolate</b> → where (pdb, bisect)</li>
          <li><b>Hypothesise</b> → why, then test the guess</li>
          <li><b>Fix</b> → smallest change</li>
          <li><b>Add a test</b> → never again</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdg-tb"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Reading a Traceback</span><span class="rm-sub">Bottom up: what, where, callers</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-print"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">print Debugging and Its Limits</span><span class="rm-sub">Quick looks, repr, costs</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-pdb"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">pdb and breakpoint()</span><span class="rm-sub">n, s, r, c, p, ll, w session</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-pm"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Post-mortem Debugging</span><span class="rm-sub">python -m pdb, pytest --pdb</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-time"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Timing: perf_counter and timeit</span><span class="rm-sub">Scaling, min of repeats</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-prof"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">cProfile, pstats, line_profiler</span><span class="rm-sub">tottime vs cumtime, hot line</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-mem"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Memory with tracemalloc</span><span class="rm-sub">Peak, snapshots by line</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-log"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">The logging Module</span><span class="rm-sub">Levels, handlers, hierarchy, exception</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-method"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">A Systematic Debugging Method</span><span class="rm-sub">Reproduce, isolate, fix, regression test</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Guessing, print, lost tracebacks</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Commands, APIs, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Tracebacks to memory leaks</span></div></div>
    </div>
  </div>

  <h2 id="pdg-tb"><span class="num">01</span>Reading a Traceback</h2>
  <p>When an exception is not caught, Python prints a traceback: the exception type and message plus the chain of calls that led to it. It is the first and cheapest debugging tool, and most crashes can be located from it alone if you read it in the right order.</p>
  <p>The examples use a small billing module (rules as in <a class="xref" data-note="py_pytest">Testing with pytest</a>, with <code>bill</code> written one step per line so it can be stepped through in pdb) and a daily report over many orders:</p>
  <div class="fx" data-lang="py"># till.py
"""Chai Corner till: the billing rules (one step per line, easy to step through)."""
GST = 0.05

def subtotal(lines):
    return sum(qty * price for item, qty, price in lines)

def discount(sub):
    return sub * 0.10 if sub &gt;= 150 else 0

def with_tax(amount, rate=GST):
    return amount + amount * rate

def bill(lines):
    for item, qty, price in lines:
        if qty &lt; 0:
            raise ValueError(f"qty must be non-negative, got {qty} for {item!r}")
    sub = subtotal(lines)
    after = sub - discount(sub)
    total = with_tax(after)
    return round(total)</div>
  <div class="fx" data-lang="py"># report.py
from till import bill

def daily_report(orders):
    """orders: list of (customer, lines). Summarise the day."""
    sales = 0
    customers = []
    items = {}
    for customer, lines in orders:
        sales += bill(lines)
        if customer not in customers:          # have we seen this customer today?
            customers.append(customer)
        for item, qty, price in lines:
            items[item] = items.get(item, 0) + qty
    top = max(items, key=items.get) if items else None
    return {"orders": len(orders), "customers": len(customers),
            "sales": sales, "top_item": top}</div>
  <p>Today's orders include Dev, who ordered on the website; the form sent his quantity as text:</p>
  <div class="fx" data-lang="py"># crash.py
from report import daily_report

orders = [
    ("Asha", [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]),
    ("Ben",  [("masala chai", 1, 30), ("vada pav", 2, 20)]),
    ("Dev",  [("masala chai", "2", 30)]),        # qty typed into the web form
    ("Chen", [("samosa", 2, 15), ("vada pav", 1, 20)]),
]
print(daily_report(orders))</div>
  <div class="fx" data-lang="text">$ python3 crash.py
Traceback (most recent call last):
  File "~/chai/crash.py", line 9, in &lt;module&gt;
    print(daily_report(orders))
          ~~~~~~~~~~~~^^^^^^^^
  File "~/chai/report.py", line 9, in daily_report
    sales += bill(lines)
             ~~~~^^^^^^^
  File "~/chai/till.py", line 15, in bill
    if qty &lt; 0:
       ^^^^^^^
TypeError: '&lt;' not supported between instances of 'str' and 'int'</div>
  <h3>Bottom up</h3>
  <p>"Most recent call last" means the newest call is at the <em>bottom</em>. So read upwards:</p>
  <table class="tbl"><caption>The traceback, read from the bottom</caption>
    <tr><th>Read</th><th>Line</th><th>Tells us</th></tr>
    <tr><td>1st</td><td><code>TypeError: '&lt;' not supported between instances of 'str' and 'int'</code></td><td><b>What</b>: something compared a string with a number using <code>&lt;</code></td></tr>
    <tr><td>2nd</td><td><code>File "till.py", line 15, in bill</code> / <code>if qty &lt; 0:</code> with <code>^^^</code></td><td><b>Where</b>: the guard in <code>bill</code>; so <code>qty</code> is a str</td></tr>
    <tr><td>3rd</td><td><code>File "report.py", line 9, in daily_report</code> / <code>sales += bill(lines)</code></td><td><b>Who called</b>: the report, inside its loop over orders</td></tr>
    <tr><td>4th</td><td><code>File "crash.py", line 9, in &lt;module&gt;</code></td><td><b>Where it started</b>: the top-level script</td></tr>
  </table>
  <p>Each "File … line … in …" entry is a <strong>frame</strong>: one function call that was still running. Together they are the <strong>call stack</strong> at the moment of the crash (the same stack traced in <a class="xref" data-note="py_functions">Functions</a>). The <code>~~~^^^</code> markers (Python 3.11+) point at the exact sub-expression.</p>
  <p>The traceback tells us <em>what</em> and <em>where</em>, but not <em>which order</em> had the text quantity; that value isn't printed. We can guess (Dev's form), or look, with pdb and post-mortem debugging below. The right fix is where the bad value <em>entered</em>: convert the form's text to <code>int</code> when the order is created (<a class="xref" data-note="py_exceptions">Exceptions</a> shows validating input), not deep inside <code>bill</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A parcel's tracking history: the newest scan ("damaged at Pune hub") is what happened; the older scans above it show the route it took to get there. You read the newest line first.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>traceback</strong> is the printed call stack of an uncaught exception: one entry (frame) per active call, oldest at the top, ending with the exception's type and message. When an exception is raised while handling another, Python prints both, joined by "During handling of the above exception…" (or "The above exception was the direct cause…" for <code>raise … from …</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Reading from the top: the first frames are usually your own entry script or library internals and say nothing about the cause. And don't "fix" the line that exploded by wrapping it in <code>try/except: pass</code>; that hides the bad data and moves the crash somewhere worse.</p></div>

  <h2 id="pdg-print"><span class="num">02</span>print Debugging and Its Limits</h2>
  <p>A wrong answer with no crash leaves no traceback. The quickest way to see values flowing through the code is to print them.</p>
  <div class="fx" data-lang="py"># chen.py
from till import bill
chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
print("Chen pays", bill(chen))      # the board says halves round up: expected 53</div>
  <div class="fx" data-lang="text">Chen pays 52</div>
  <p>The simplest way to look inside is to print intermediate values. Edit <code>bill</code> temporarily:</p>
  <div class="fx" data-lang="py">    sub = subtotal(lines)
    print("DEBUG sub =", sub)                      # temporary prints...
    after = sub - discount(sub)
    print("DEBUG after =", after)
    total = with_tax(after)
    print("DEBUG total =", total)
    return round(total)</div>
  <div class="fx" data-lang="text">$ python3 chen.py
DEBUG sub = 50
DEBUG after = 50
DEBUG total = 52.5
Chen pays 52</div>
  <p>Subtotal 50 (2 × 15 + 20) is right; no discount below 150 is right; 50 + 2.5 = 52.5 is right. The last step, <code>round(52.5)</code>, gives 52. So the problem is in rounding. Prints worked here, but notice what they cost:</p>
  <ul>
    <li>Every new question ("what does <code>round</code> do with 53.5?") means editing the code and re-running.</li>
    <li>On a report that takes minutes to reach the bug, ten rounds of prints cost an hour.</li>
    <li>Prints get left behind and end up in production output (or in the receipt!).</li>
    <li>A print has no time, no severity and no source, and can't be switched off without editing code. That last point is why the <code>logging</code> module exists.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Debugging with prints is like asking a friend to text you the score, but only the scores you thought to ask about in advance. To ask anything new, you have to set up another text.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>print debugging</strong>: inserting temporary output statements to observe values. Quick for one or two values; costly when questions multiply, and it changes the program's output.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Leaving debug prints in committed code, and printing a value without its type: <code>print(qty)</code> shows <code>2</code> for both the int and the string <code>"2"</code> (Dev's bug). Use <code>print(repr(qty))</code> or <code>print(f"{qty=!r}")</code>, which shows <code>qty='2'</code>.</p></div>

  <h2 id="pdg-pdb"><span class="num">03</span>pdb and breakpoint()</h2>
  <p>Prints show only what you decided to print before running. A debugger lets you stop at a line, inspect every variable, evaluate any expression, and step forward one line or into a call, without editing the code for each new question.</p>
  <p>A <strong>debugger</strong> pauses a running program and gives you a prompt. Python's built-in one is <strong>pdb</strong>. Putting <code>breakpoint()</code> on a line pauses there and opens the <code>(Pdb)</code> prompt, where you type short commands.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Pausing a cricket replay at the ball where the wicket fell: you can look at every fielder, then play forward frame by frame, or zoom into one player. Prints are reading the scorecard afterwards: you see only what someone wrote down.</p></div>
  <p>We add one line to <code>bill</code>, <code>breakpoint()                                  # pause here</code>, just before <code>sub = subtotal(lines)</code>, and run <code>python3 chen.py</code>. Below is the real session. (To record it, the commands were fed to pdb from a file on standard input; each typed command has been put back after its <code>(Pdb)</code> prompt, exactly where you would type it.)</p>
  <div class="fx" data-lang="text">$ python3 chen.py
&gt; ~/chai/till.py(17)bill()
-&gt; breakpoint()                                  # pause here
(Pdb) p lines
[('samosa', 2, 15), ('vada pav', 1, 20)]
(Pdb) n
&gt; ~/chai/till.py(18)bill()
-&gt; sub = subtotal(lines)
(Pdb) n
&gt; ~/chai/till.py(19)bill()
-&gt; after = sub - discount(sub)
(Pdb) p sub
50
(Pdb) s
--Call--
&gt; ~/chai/till.py(7)discount()
-&gt; def discount(sub):
(Pdb) r
--Return--
&gt; ~/chai/till.py(8)discount()-&gt;0
-&gt; return sub * 0.10 if sub &gt;= 150 else 0
(Pdb) n
&gt; ~/chai/till.py(20)bill()
-&gt; total = with_tax(after)
(Pdb) p after
50
(Pdb) n
&gt; ~/chai/till.py(21)bill()
-&gt; return round(total)
(Pdb) p total
52.5
(Pdb) p round(total), round(53.5), round(0.5), round(1.5), round(2.5)
(52, 54, 0, 2, 2)
(Pdb) ll
 13  	def bill(lines):
 14  	    for item, qty, price in lines:
 15  	        if qty &lt; 0:
 16  	            raise ValueError(f"qty must be non-negative, got {qty} for {item!r}")
 17  	    breakpoint()                                  # pause here
 18  	    sub = subtotal(lines)
 19  	    after = sub - discount(sub)
 20  	    total = with_tax(after)
 21  -&gt;	    return round(total)
(Pdb) w
  ~/chai/chen.py(3)&lt;module&gt;()
-&gt; print("Chen pays", bill(chen))      # the board says halves round up: expected 53
&gt; ~/chai/till.py(21)bill()
-&gt; return round(total)
(Pdb) c
Chen pays 52</div>
  <table class="tbl"><caption>The session, step by step</caption>
    <tr><th>Typed</th><th>What happened</th><th>Learned</th></tr>
    <tr><td>(start)</td><td>Paused at line 17. <code>&gt;</code> shows file(line)function; <code>-&gt;</code> shows the line <em>about to run</em></td><td>We're inside <code>bill</code></td></tr>
    <tr><td><code>p lines</code></td><td>Print an expression</td><td>Chen's order arrived intact</td></tr>
    <tr><td><code>n</code>, <code>n</code></td><td>"next": run one line, stepping <em>over</em> calls</td><td>Line 18 ran; now about to run 19</td></tr>
    <tr><td><code>p sub</code></td><td></td><td>50: correct</td></tr>
    <tr><td><code>s</code></td><td>"step": go <em>into</em> the call on line 19</td><td>Inside <code>discount</code></td></tr>
    <tr><td><code>r</code></td><td>"return": run until this function returns; shows <code>-&gt;0</code></td><td>discount(50) = 0: correct</td></tr>
    <tr><td><code>n</code>, <code>p after</code></td><td>Back in <code>bill</code>, line 19 finished</td><td>after = 50: correct</td></tr>
    <tr><td><code>n</code>, <code>p total</code></td><td>Line 20 ran</td><td>total = 52.5: correct</td></tr>
    <tr><td><code>p round(...)</code></td><td>Evaluate any expression, in this frame</td><td>round sends .5 to the <b>even</b> neighbour: 52.5→52, 53.5→54, 0.5→0, 1.5→2, 2.5→2</td></tr>
    <tr><td><code>ll</code></td><td>"long list": the whole function, <code>-&gt;</code> at the current line</td><td>Where we are</td></tr>
    <tr><td><code>w</code></td><td>"where": the call stack, newest at the bottom</td><td>chen.py line 3 called bill</td></tr>
    <tr><td><code>c</code></td><td>"continue": run on to the end or the next breakpoint</td><td>Output: Chen pays 52</td></tr>
  </table>
  <p>One session answered every question, including ones we only thought of while paused (the <code>round</code> experiments). The cause is located: <code>round</code> uses "round half to even" (banker's rounding), so 52.5 goes down to 52. The fix is in the systematic-method section below.</p>
  <table class="tbl"><caption>pdb commands</caption>
    <tr><th>Cmd</th><th>Does</th><th>Cmd</th><th>Does</th></tr>
    <tr><td><code>n</code></td><td>Next line (step over calls)</td><td><code>p expr</code> / <code>pp expr</code></td><td>Print / pretty-print</td></tr>
    <tr><td><code>s</code></td><td>Step into a call</td><td><code>l</code> / <code>ll</code></td><td>List around here / whole function</td></tr>
    <tr><td><code>r</code></td><td>Run until the current function returns</td><td><code>w</code></td><td>Where: call stack</td></tr>
    <tr><td><code>c</code></td><td>Continue to next breakpoint</td><td><code>u</code> / <code>d</code></td><td>Move up / down the stack</td></tr>
    <tr><td><code>b file:line</code>, <code>b func</code></td><td>Set a breakpoint (optionally <code>, condition</code>)</td><td><code>q</code></td><td>Quit</td></tr>
    <tr><td><code>until</code></td><td>Run until a line greater than this one (leave a loop)</td><td><code>!stmt</code> / <code>interact</code></td><td>Run a statement / open a Python REPL here</td></tr>
  </table>
  <p>Safety switch: the environment variable <code>PYTHONBREAKPOINT=0</code> turns every <code>breakpoint()</code> into a no-op:</p>
  <div class="fx" data-lang="text">$ PYTHONBREAKPOINT=0 python3 chen.py
Chen pays 52</div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>breakpoint</strong> is a place where execution pauses under the debugger. <strong>Step over</strong> (<code>n</code>) runs a whole call as one step; <strong>step into</strong> (<code>s</code>) enters it; <strong>step out</strong> (<code>r</code>) finishes the current function. A <strong>frame</strong> is one active call with its local variables; <code>u</code>/<code>d</code> move between frames.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A <code>breakpoint()</code> left in committed code freezes a production job waiting for keyboard input. Search for it before committing (a pre-commit check helps). Also, a variable named like a pdb command (<code>n</code>, <code>c</code>, <code>p</code>) must be printed with <code>p n</code>, not just <code>n</code>. IDEs (VS Code, PyCharm) offer the same with clickable breakpoints.</p></div>

  <h2 id="pdg-pm"><span class="num">04</span>Post-mortem Debugging: python -m pdb and pytest --pdb</h2>
  <p>A breakpoint needs you to know where to stop before running. When a program has already crashed and the traceback does not show the bad value (here: which customer's order had the text quantity), post-mortem debugging opens the crashed frames with their variables intact.</p>
  <p><strong>Post-mortem</strong> debugging opens pdb at the frame where an uncaught exception was raised, with every variable still alive. Three common ways in: <code>python -m pdb script.py</code> (run under pdb; on a crash it enters post-mortem), <code>pytest --pdb</code> (open pdb at each failing test), and <code>%debug</code> in Jupyter after a cell fails (or <code>pdb.pm()</code> in a REPL).</p>
  <div class="fx" data-lang="text">$ python3 -m pdb crash.py
&gt; ~/chai/crash.py(1)&lt;module&gt;()
-&gt; from report import daily_report
(Pdb) c
Traceback (most recent call last):
  ...                                   (the traceback above, plus pdb's own frames)
TypeError: '&lt;' not supported between instances of 'str' and 'int'
Uncaught exception. Entering post mortem debugging
Running 'cont' or 'step' will restart the program
&gt; ~/chai/till.py(15)bill()
-&gt; if qty &lt; 0:
(Pdb) p item, qty, type(qty)
('masala chai', '2', &lt;class 'str'&gt;)
(Pdb) w
  /usr/lib/python3.13/pdb.py(2524)main()
-&gt; pdb._run(target)
  /usr/lib/python3.13/pdb.py(2264)_run()
-&gt; self.run(target.code)
  /usr/lib/python3.13/bdb.py(680)run()
-&gt; exec(cmd, globals, locals)
  &lt;string&gt;(1)&lt;module&gt;()
  ~/chai/crash.py(9)&lt;module&gt;()
-&gt; print(daily_report(orders))
  ~/chai/report.py(9)daily_report()
-&gt; sales += bill(lines)
&gt; ~/chai/till.py(15)bill()
-&gt; if qty &lt; 0:
(Pdb) u
&gt; ~/chai/report.py(9)daily_report()
-&gt; sales += bill(lines)
(Pdb) p customer, lines
('Dev', [('masala chai', '2', 30)])
(Pdb) q</div>
  <p>Read the session: pdb starts paused at the first line; <code>c</code> runs until the crash, then pdb drops into the failing frame (<code>till.py</code> line 15). <code>p item, qty, type(qty)</code> shows the culprit: <code>'2'</code>, a str. <code>w</code> shows the stack (the first frames are pdb's own machinery). <code>u</code> moves <em>up</em> one frame into <code>daily_report</code>, whose locals are still there: the customer is Dev and his order has the text quantity. Cause found, without adding a single print or re-running.</p>
  <p>The same from a failing test: <code>pytest --pdb</code> stops at the failing assert (the commands were again fed on standard input and are shown after each prompt):</p>
  <div class="fx" data-lang="text">$ pytest -q --pdb test_rounding.py
F
&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; traceback &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;

    def test_chen_rounds_half_up():
        chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
&gt;       assert bill(chen) == 53           # board rule: 52.5 rounds UP
        ^^^^^^^^^^^^^^^^^^^^^^^
E       AssertionError: assert 52 == 53
E        +  where 52 = bill([('samosa', 2, 15), ('vada pav', 1, 20)])

test_rounding.py:5: AssertionError
&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; entering PDB &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;

&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; PDB post_mortem (IO-capturing turned off) &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;
&gt; ~/chai/test_rounding.py(5)test_chen_rounds_half_up()
-&gt; assert bill(chen) == 53           # board rule: 52.5 rounds UP
(Pdb) p chen
[('samosa', 2, 15), ('vada pav', 1, 20)]
(Pdb) p bill(chen)
52
(Pdb) q
=========================== short test summary info ============================
FAILED test_rounding.py::test_chen_rounds_half_up - AssertionError: assert 52...
!!!!!!!!!!!!!!!!!!! _pytest.outcomes.Exit: Quitting debugger !!!!!!!!!!!!!!!!!!!
1 failed in 0.20s</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>An aircraft's black box. You weren't in the cockpit when it happened, but the recorder kept every instrument reading at the moment of the incident, and you can replay the last moments.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Post-mortem debugging</strong> inspects the stack frames of an exception after it was raised (<code>pdb.post_mortem(tb)</code>; <code>pdb.pm()</code> uses the last uncaught exception). The frames' local variables are preserved in the traceback object.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Post-mortem needs the exception to propagate. If the code catches it with a bare <code>except: pass</code> (or logs only <code>str(e)</code>), the frames are gone. In pdb's post-mortem, <code>c</code> or <code>s</code> restarts the whole program; use <code>q</code> to leave.</p></div>

  <h2 id="pdg-time"><span class="num">05</span>Timing: perf_counter and timeit</h2>
  <p>"It feels slow" is not a number. Before optimising anything, measure how long the code takes and, more importantly, how the time grows with input size. Test data for a busy day comes from a seeded random generator, so every run sees the same orders:</p>
  <div class="fx" data-lang="py"># bigday.py
import random

MENU = [("masala chai", 30), ("samosa", 15), ("vada pav", 20), ("cold coffee", 90)]

def make_day(n_orders, seed=0):
    """A busy festival day: n_orders orders from regulars and walk-ins."""
    rng = random.Random(seed)                    # seeded: same day every run
    day = []
    for _ in range(n_orders):
        customer = f"cust{rng.randint(1, n_orders)}"
        lines = [(item, rng.randint(1, 3), price)
                 for item, price in rng.sample(MENU, rng.randint(1, 3))]
        day.append((customer, lines))
    return day</div>
  <p><code>time.perf_counter()</code> is a high-resolution stopwatch: read it before and after, subtract.</p>
  <div class="fx" data-lang="py"># time_it.py
import time
from bigday import make_day
from report import daily_report

day = make_day(20_000)
print(day[0])

start = time.perf_counter()                      # a high-resolution stopwatch
result = daily_report(day)
elapsed = time.perf_counter() - start
print(result)
print(f"daily_report took {elapsed:.2f} s")

for n in (5_000, 10_000, 20_000):                # how does time grow with n?
    d = make_day(n)
    t0 = time.perf_counter()
    daily_report(d)
    print(f"n={n:&gt;6}: {time.perf_counter() - t0:.3f} s")</div>
  <div class="fx" data-lang="text">('cust12624', [('masala chai', 3, 30), ('samosa', 2, 15)])
{'orders': 20000, 'customers': 12598, 'sales': 2990934, 'top_item': 'vada pav'}
daily_report took 1.67 s
n=  5000: 0.108 s
n= 10000: 0.399 s
n= 20000: 1.674 s</div>
  <p>The shape matters more than the number. Doubling the orders (5,000 → 10,000 → 20,000) multiplied the time by about 4 each time (0.108 → 0.399 → 1.674). Time growing with the <em>square</em> of the input means something inside does work proportional to n for each of the n orders: O(n²). At 80,000 orders it would take roughly 16 × 1.67 ≈ 27 seconds.</p>
  <h3>timeit: timing small statements</h3>
  <p>A single stopwatch reading of a fast statement is noise. <code>timeit</code> runs a statement many times (<code>number</code>), repeats that several times (<code>repeat</code>), and you take the <strong>minimum</strong> (background activity can only add time, never remove it). A suspect: the report checks <code>customer not in customers</code>, where <code>customers</code> is a list of about 12,600 names.</p>
  <div class="fx" data-lang="py"># micro.py
import timeit
names_list = [f"cust{i}" for i in range(12_598)]      # as many as the day's customers
names_set = set(names_list)
for stmt in ['"cust99999" in names_list', '"cust99999" in names_set']:
    runs = timeit.repeat(stmt, globals=globals(), number=1_000, repeat=5)
    print(f"{stmt:&lt;28} best of 5: {min(runs) / 1_000 * 1e9:9.0f} ns per check")</div>
  <div class="fx" data-lang="text">"cust99999" in names_list    best of 5:     84392 ns per check
"cust99999" in names_set     best of 5:        15 ns per check</div>
  <p>A list check walks the list item by item (about 12,600 comparisons for a new customer); a set check is one hash lookup (sets are explained in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>). 84 µs × 20,000 orders ≈ 1.7 s: that would explain the whole report. But that's still a hypothesis; a profiler confirms it. From the shell, <code>python -m timeit</code> does the same:</p>
  <div class="fx" data-lang="text">$ python3 -m timeit -s "from till import bill; o=[('samosa', 2, 15), ('vada pav', 1, 20)]" "bill(o)"
500000 loops, best of 5: 678 nsec per loop</div>
  <p><code>-s</code> is setup (run once, not timed). One <code>bill</code> takes under a microsecond, so 20,000 bills cost about 14 ms: <code>bill</code> is not the problem.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Timing a 100 m sprint once with a hand stopwatch versus taking the best of five electronically timed runs. The best run is closest to the runner's true speed; slow runs include stumbles.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>time.perf_counter()</code>: a monotonic clock with the highest available resolution, for measuring intervals. <code>timeit.repeat(stmt, setup, number, repeat, globals)</code>: run <code>stmt</code> <code>number</code> times, <code>repeat</code> times, return the totals. <strong>Complexity</strong> (O(n), O(n²)) describes how time grows with input size.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Using <code>time.time()</code> (wall clock; can jump when the system clock is adjusted), timing once, timing setup together with the work, or averaging instead of taking the minimum. In Jupyter, <code>%timeit</code> handles all of this for you.</p></div>

  <h2 id="pdg-prof"><span class="num">06</span>cProfile, pstats and line_profiler</h2>
  <p>A <strong>profiler</strong> runs your program and records how much time each function takes. Python ships <code>cProfile</code> (records every function call) and <code>pstats</code> (sorts and prints the results). The rule: make it work, make it right (tests pass), then make it fast, and only after measuring.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A doctor orders a blood test before prescribing. Optimising without a profile is prescribing on a guess; the profile is the report that points at the one number out of range.</p></div>
  <div class="flow"><span>make it work</span><span>make it right (tests pass)</span><span>profile</span><span>fix the top hotspot</span><span>re-run tests</span><span>re-profile</span></div>
  <div class="fx" data-lang="py"># prof.py
import cProfile, pstats
from bigday import make_day
from report import daily_report

day = make_day(20_000)
with cProfile.Profile() as pr:                   # record every function call
    daily_report(day)
stats = pstats.Stats(pr)
stats.sort_stats("cumulative").print_stats(8)    # top 8 by time incl. callees</div>
  <div class="fx" data-lang="text">         232264 function calls in 2.142 seconds

   Ordered by: cumulative time
   List reduced from 14 to 8 due to restriction &lt;8&gt;

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    2.001    2.001    2.142    2.142 report.py:3(daily_report)
    20000    0.043    0.000    0.123    0.000 till.py:13(bill)
    20000    0.019    0.000    0.057    0.000 till.py:4(subtotal)
    20000    0.024    0.000    0.038    0.000 {built-in method builtins.sum}
    59830    0.014    0.000    0.014    0.000 till.py:5(&lt;genexpr&gt;)
    39830    0.012    0.000    0.012    0.000 {method 'get' of 'dict' objects}
    20000    0.009    0.000    0.009    0.000 {built-in method builtins.round}
    20000    0.008    0.000    0.008    0.000 till.py:10(with_tax)</div>
  <table class="tbl"><caption>The columns</caption>
    <tr><th>Column</th><th>Means</th></tr>
    <tr><td><code>ncalls</code></td><td>How many times the function was called</td></tr>
    <tr><td><code>tottime</code></td><td>Time spent in the function's <em>own</em> lines, excluding functions it called</td></tr>
    <tr><td><code>percall</code> (1st)</td><td>tottime ÷ ncalls</td></tr>
    <tr><td><code>cumtime</code></td><td>Cumulative: own time + everything it called</td></tr>
    <tr><td><code>percall</code> (2nd)</td><td>cumtime ÷ primitive calls</td></tr>
    <tr><td><code>filename:lineno(function)</code></td><td>Which function (<code>{built-in …}</code> = C code)</td></tr>
  </table>
  <p>Read it line by line:</p>
  <ul>
    <li><b>Header</b>: 232,264 calls in 2.142 s (slower than 1.67 s because profiling every call adds overhead; compare profiles with profiles, not with stopwatch times).</li>
    <li><b><code>daily_report</code></b>: cumtime 2.142 (the whole run) and <b>tottime 2.001</b>: 93% of all time is in its <em>own</em> lines, not in anything it calls.</li>
    <li><b><code>bill</code></b>: called 20,000 times, but cumtime only 0.123 s including <code>subtotal</code>, <code>sum</code>, <code>round</code>, <code>with_tax</code>. Not the problem, as <code>timeit</code> suggested.</li>
    <li><b><code>dict.get</code></b>: 39,830 calls (one per order line) for 0.012 s: the item counting is cheap.</li>
  </ul>
  <p>So the cost is inside <code>daily_report</code>'s own code. cProfile can't split a function into lines (the <code>in</code> operator isn't a function call, so it never appears as a row). <code>line_profiler</code> (a pip package) can:</p>
  <div class="fx" data-lang="py"># lineprof.py
from line_profiler import LineProfiler
from bigday import make_day
from report import daily_report

day = make_day(20_000)
lp = LineProfiler(daily_report)          # time every line of this one function
lp.runcall(daily_report, day)
lp.print_stats(output_unit=1e-3)         # times in milliseconds</div>
  <div class="fx" data-lang="text">Timer unit: 0.001 s

Total time: 1.84521 s
File: report.py
Function: daily_report at line 3

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
     3                                           def daily_report(orders):
     4                                               """orders: list of (customer, lines). Summarise the day."""
     5         1          0.0      0.0      0.0      sales = 0
     6         1          0.0      0.0      0.0      customers = []
     7         1          0.0      0.0      0.0      items = {}
     8     20001          9.2      0.0      0.5      for customer, lines in orders:
     9     20000        163.9      0.0      8.9          sales += bill(lines)
    10     20000       1618.9      0.1     87.7          if customer not in customers:          # have we seen this customer today?
    11     12598          7.0      0.0      0.4              customers.append(customer)
    12     59830         27.1      0.0      1.5          for item, qty, price in lines:
    13     39830         19.1      0.0      1.0              items[item] = items.get(item, 0) + qty
    14         1          0.0      0.0      0.0      top = max(items, key=items.get) if items else None
    15         2          0.0      0.0      0.0      return {"orders": len(orders), "customers": len(customers),
    16         1          0.0      0.0      0.0              "sales": sales, "top_item": top}</div>
  <p>Line 10, <code>customer not in customers</code>, takes 87.7% of the time. The list grows to 12,598 names, and each check scans it. The fix is the set from the <code>timeit</code> experiment: <code>customers = set()</code> and <code>customers.add(customer)</code> (a set ignores duplicates by itself).</p>
  <div class="fx" data-lang="py"># report_fast.py
from till import bill

def daily_report(orders):
    """Same summary; customers kept in a SET: one hash lookup per check."""
    sales = 0
    customers = set()
    items = {}
    for customer, lines in orders:
        sales += bill(lines)
        customers.add(customer)                # add() ignores duplicates by itself
        for item, qty, price in lines:
            items[item] = items.get(item, 0) + qty
    top = max(items, key=items.get) if items else None
    return {"orders": len(orders), "customers": len(customers),
            "sales": sales, "top_item": top}</div>
  <div class="fx" data-lang="py"># compare.py
import timeit
from bigday import make_day
import report, report_fast

day = make_day(20_000)
assert report.daily_report(day) == report_fast.daily_report(day)   # same answer FIRST
for mod in (report, report_fast):
    best = min(timeit.repeat(lambda: mod.daily_report(day), number=1, repeat=3))
    print(f"{mod.__name__:&lt;12} {best * 1000:8.1f} ms")</div>
  <div class="fx" data-lang="text">report         1721.5 ms
report_fast      20.1 ms</div>
  <p>The <code>assert</code> first proves the fast version gives the identical summary (a fast wrong answer is worthless; in a real project this is the test suite). Then: 1.72 s → 20 ms, about 85× faster, from one changed line. Re-profile to see what is on top now:</p>
  <div class="fx" data-lang="text">         239666 function calls in 0.118 seconds

   Ordered by: internal time
   List reduced from 14 to 4 due to restriction &lt;4&gt;

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
    20000    0.028    0.000    0.075    0.000 till.py:13(bill)
        1    0.027    0.027    0.118    0.118 report_fast.py:3(daily_report)
    20000    0.016    0.000    0.026    0.000 {built-in method builtins.sum}
    20000    0.010    0.000    0.036    0.000 till.py:4(subtotal)</div>
  <p>(Sorted by <code>tottime</code> this time.) No single hotspot is left: the time is spread over the real work of billing 20,000 orders. Stop optimising here.</p>
  <figure class="viz"><svg viewBox="0 0 520 110" width="520">
    <text x="10" y="28">line 10 (list in)</text><text x="10" y="44" class="tm">before</text><rect x="150" y="14" width="300" height="20" class="fr sr"/><text x="456" y="29">1619 ms</text>
    <text x="10" y="70">bill() × 20,000</text><rect x="150" y="56" width="30" height="20" class="fb sb"/><text x="186" y="71">164 ms</text>
    <text x="10" y="98">whole report after fix</text><rect x="150" y="84" width="4" height="20" class="fg sg"/><text x="160" y="99">20 ms</text>
  </svg><figcaption>One line owned almost all the time. After the fix, the whole report is smaller than the old line alone.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>hotspot</strong> is the small part of the code where most time is spent. <strong>tottime</strong> = own time; <strong>cumtime</strong> = own + callees. High cumtime with low tottime → look at its children; high tottime → the function's own lines (then use a line profiler). A <strong>deterministic profiler</strong> (cProfile) records every call; a <strong>sampling profiler</strong> (py-spy) periodically samples the stack with low overhead, even on a running production process.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Optimising what you suspect instead of what you measured. Here a natural guess was "<code>bill</code> is called 20,000 times, rewrite it", which would have saved at most 0.12 s of 2.1. In pandas the usual hotspot is a row-by-row <code>apply</code> or Python loop over rows; the fix is a vectorised column operation. Jupyter: <code>%prun</code>, <code>%lprun</code>.</p></div>

  <h2 id="pdg-mem"><span class="num">07</span>Memory with tracemalloc</h2>
  <p>A program can be fast and still run out of memory, especially when it builds a whole result in memory instead of streaming it. The question is how much memory a piece of code allocates at its peak, and which line is responsible.</p>
  <p><code>tracemalloc</code> (standard library) records every memory allocation Python makes while it is running. <code>get_traced_memory()</code> returns (current, peak) bytes; <code>take_snapshot().statistics("lineno")</code> groups live allocations by the source line that made them.</p>
  <div class="fx" data-lang="py"># receipts.py
from till import bill

def receipt(customer, lines):
    rows = [f"{item:&lt;12}{qty:&gt;2} x {price:&gt;3}" for item, qty, price in lines]
    return "\\n".join([f"Chai Corner - {customer}", *rows, f"TOTAL Rs {bill(lines)}", ""])

def print_all_list(day, out):
    texts = [receipt(c, l) for c, l in day]         # every receipt in memory at once
    out.write("\\n".join(texts))

def print_all_stream(day, out):
    for c, l in day:                                 # one receipt at a time
        out.write(receipt(c, l) + "\\n")</div>
  <div class="fx" data-lang="py"># mem.py
import os, tracemalloc
from bigday import make_day
from receipts import receipt, print_all_list, print_all_stream

day = make_day(20_000)
print(receipt(*day[0]))

for fn in (print_all_list, print_all_stream):
    with open(os.devnull, "w") as out:
        tracemalloc.start()                          # start counting allocations
        fn(day, out)
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
    print(f"{fn.__name__:&lt;17} peak {peak / 1e6:6.2f} MB   still held {current / 1e6:5.2f} MB")

tracemalloc.start()
texts = [receipt(c, l) for c, l in day]              # who is holding the memory?
snap = tracemalloc.take_snapshot()
for stat in snap.statistics("lineno")[:3]:
    print(stat)</div>
  <div class="fx" data-lang="text">Chai Corner - cust12624
masala chai  3 x  30
samosa       2 x  15
TOTAL Rs 126

print_all_list    peak   5.71 MB   still held  0.00 MB
print_all_stream  peak   0.02 MB   still held  0.01 MB
receipts.py:5: size=2322 KiB, count=20000, average=119 B
mem.py:17: size=169 KiB, count=1, average=169 KiB</div>
  <p>Read it. The first receipt checks the format (3 × 30 + 2 × 15 = 120, +5% = 126). Building every receipt first and joining them peaked at 5.71 MB; writing them one at a time peaked at 0.02 MB, about 300× less, for the same output. "Still held" is near zero for both, because the memory is freed when the function returns; the <em>peak</em> is what crashes a small machine. The snapshot names the line: <code>receipts.py:5</code> (the <code>"\\n".join</code> building each receipt string) holds 20,000 strings averaging 119 bytes, about 2.3 MB, and <code>mem.py:17</code> is the list holding them. Streaming is the generator idea from <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Printing receipts by first stacking all 20,000 on the counter, then feeding the stack to the printer, versus handing each one to the printer as it's written. Same receipts; one needs a very big counter.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>tracemalloc.start()</code> / <code>stop()</code>: begin/end tracing Python allocations. <code>get_traced_memory()</code> → (current, peak) bytes since start. <code>take_snapshot().statistics("lineno")</code>: live allocations grouped by line, largest first. <code>sys.getsizeof(obj)</code> gives one object's shallow size.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>tracemalloc sees only allocations made through Python's allocator; big NumPy/pandas buffers may be reported only partly (NumPy does report to tracemalloc; some C libraries don't). For whole-process memory use the OS view (<code>resource</code>, <code>psutil</code>, or memray). And tracing slows the program down: measure, then turn it off.</p></div>

  <h2 id="pdg-log"><span class="num">08</span>The logging Module: Levels, Loggers, Handlers, Formatters</h2>
  <p>Debuggers and profilers need someone at the keyboard. In production the program runs unattended, and the only evidence of what happened at 9 p.m. is what it wrote down while running. With <code>print</code> that record has no time, no severity, no source, and no way to keep details in a file while showing only problems on screen.</p>
  <p>The <code>logging</code> module is <code>print</code> done properly. Each message gets a <strong>level</strong> (how serious), a time, and the name of the part of the program that wrote it. You decide, in one place, which levels to keep and where each goes: the screen, a file, a log service.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hospital's patient chart versus shouting in the corridor. The chart records the time, who wrote the note and how urgent it is; the night nurse reads only urgent notes, the specialist reads everything. <code>print</code> is shouting: everyone hears everything, and nothing is kept.</p></div>
  <h3>Levels</h3>
  <div class="fx" data-lang="py"># log1.py
import logging
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)-7s %(name)s: %(message)s",
                    datefmt="%H:%M:%S")
log = logging.getLogger("till")

print("billed Asha 184")                           # print: no time, no level, no source
log.info("billed %s %d", "Asha", 184)              # INFO  &gt;= INFO: kept
log.debug("discount check: sub=%d", 195)           # DEBUG &lt;  INFO: dropped
log.warning("qty %r for %s is text, converting", "2", "Dev")
log.error("payment for %s failed", "Chen")</div>
  <div class="fx" data-lang="text">billed Asha 184
19:34:25 INFO    till: billed Asha 184
19:34:25 WARNING till: qty '2' for Dev is text, converting
19:34:25 ERROR   till: payment for Chen failed</div>
  <p><code>basicConfig</code> set a threshold (INFO) and a format. The print line came out bare. Each log line has time, level and the logger's name. The DEBUG line was dropped because DEBUG is below the threshold: change <code>level=logging.DEBUG</code> and it appears, without touching the code that logs.</p>
  <table class="tbl">
    <tr><th>Level (value)</th><th>Meaning</th><th>At the till</th></tr>
    <tr><td>DEBUG (10)</td><td>Developer detail</td><td>discount check: sub=195</td></tr>
    <tr><td>INFO (20)</td><td>Normal milestones</td><td>billed Asha 184; report for 3 customers</td></tr>
    <tr><td>WARNING (30)</td><td>Unexpected but handled</td><td>qty '2' is text, converting; gateway slow</td></tr>
    <tr><td>ERROR (40)</td><td>An operation failed</td><td>payment for Chen failed</td></tr>
    <tr><td>CRITICAL (50)</td><td>The program may not continue</td><td>database unreachable, till closing</td></tr>
  </table>
  <h3>Loggers, handlers, formatters, and the hierarchy</h3>
  <p>Real programs need different rules for different destinations: the screen shows only warnings and errors; a file keeps everything. Three pieces do this. A <strong>logger</strong> is what your code calls (<code>log.info(...)</code>), named by dots like modules: <code>till.payments</code> is a child of <code>till</code>. A <strong>handler</strong> is a destination with its own level. A <strong>formatter</strong> decides how a line looks. Records from a child logger travel up (<strong>propagate</strong>) to its parent's handlers.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="pdg-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="150" height="40" rx="6" class="fb sb"/><text x="20" y="45">till.payments</text>
    <rect x="10" y="120" width="150" height="40" rx="6" class="fb sb"/><text x="20" y="145">till.report</text>
    <rect x="200" y="70" width="140" height="44" rx="6" class="fv"/><text x="212" y="90">logger "till"</text><text x="212" y="106" class="tm">level DEBUG</text>
    <rect x="390" y="15" width="200" height="46" rx="6" class="ft st"/><text x="400" y="34">StreamHandler → screen</text><text x="400" y="52" class="tm">level WARNING, short format</text>
    <rect x="390" y="125" width="200" height="46" rx="6" class="ft st"/><text x="400" y="144">FileHandler → till.log</text><text x="400" y="162" class="tm">level DEBUG, time + file:line</text>
    <line x1="160" y1="40" x2="198" y2="82" stroke="currentColor" stroke-width="1.5" marker-end="url(#pdg-ah2)"/>
    <line x1="160" y1="140" x2="198" y2="102" stroke="currentColor" stroke-width="1.5" marker-end="url(#pdg-ah2)"/>
    <line x1="340" y1="84" x2="388" y2="44" stroke="currentColor" stroke-width="1.5" marker-end="url(#pdg-ah2)"/>
    <line x1="340" y1="100" x2="388" y2="144" stroke="currentColor" stroke-width="1.5" marker-end="url(#pdg-ah2)"/>
    <text x="168" y="180" class="tm">children propagate up; each handler filters again</text>
  </svg><figcaption>Follow a record left to right: from a child logger, up to "till", then through each handler's own level and format.</figcaption></figure>
  <div class="fx" data-lang="py"># payments.py
import logging
log = logging.getLogger("till.payments")       # a child of "till"

def take_payment(customer, amount):
    log.debug("charging %s Rs %d", customer, amount)
    try:
        raise ConnectionError("gateway unreachable")   # the outside world fails
    except ConnectionError:
        log.exception("payment failed for %s (Rs %d)", customer, amount)
        return False</div>
  <div class="fx" data-lang="py"># report_log.py
import logging
log = logging.getLogger("till.report")         # another child of "till"

def report(bills):
    log.info("report for %d customers", len(bills))
    log.debug("bills=%r", bills)
    return sum(bills.values())</div>
  <div class="fx" data-lang="py"># setup_logging.py
import logging, sys

def setup_logging(logfile):
    """Configure ONCE, at the program's entry point."""
    parent = logging.getLogger("till")          # children send their records up here
    parent.setLevel(logging.DEBUG)              # the logger itself lets everything in

    console = logging.StreamHandler(sys.stdout) # handler 1: the screen
    console.setLevel(logging.WARNING)           # ...shows only WARNING and above
    console.setFormatter(logging.Formatter("%(levelname)-8s %(name)s: %(message)s"))

    file = logging.FileHandler(logfile, mode="w")   # handler 2: a file
    file.setLevel(logging.DEBUG)                     # ...keeps everything
    file.setFormatter(logging.Formatter(
        "%(asctime)s %(levelname)s %(name)s %(filename)s:%(lineno)d %(message)s", "%H:%M:%S"))

    parent.addHandler(console)
    parent.addHandler(file)</div>
  <div class="fx" data-lang="py"># main.py
from setup_logging import setup_logging
from payments import take_payment
from report_log import report

setup_logging("till.log")
take_payment("Chen", 52)
print("total:", report({"Asha": 184, "Ben": 74, "Chen": 52}))
print("--- till.log ---")
print(open("till.log").read())</div>
  <div class="fx" data-lang="text">ERROR    till.payments: payment failed for Chen (Rs 52)
Traceback (most recent call last):
  File "payments.py", line 7, in take_payment
    raise ConnectionError("gateway unreachable")   # the outside world fails
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
ConnectionError: gateway unreachable
total: 310
--- till.log ---
19:34:35 DEBUG till.payments payments.py:5 charging Chen Rs 52
19:34:35 ERROR till.payments payments.py:9 payment failed for Chen (Rs 52)
Traceback (most recent call last):
  File "payments.py", line 7, in take_payment
    raise ConnectionError("gateway unreachable")   # the outside world fails
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
ConnectionError: gateway unreachable
19:34:35 INFO till.report report_log.py:5 report for 3 customers
19:34:35 DEBUG till.report report_log.py:6 bills={'Asha': 184, 'Ben': 74, 'Chen': 52}</div>
  <table class="tbl"><caption>Trace: four records, two destinations</caption>
    <tr><th>Record</th><th>Logger</th><th>Level</th><th>Screen (≥ WARNING)</th><th>till.log (≥ DEBUG)</th></tr>
    <tr><td>charging Chen Rs 52</td><td>till.payments</td><td>DEBUG</td><td>no</td><td>yes</td></tr>
    <tr><td>payment failed … + traceback</td><td>till.payments</td><td>ERROR</td><td>yes</td><td>yes</td></tr>
    <tr><td>report for 3 customers</td><td>till.report</td><td>INFO</td><td>no</td><td>yes</td></tr>
    <tr><td>bills={…}</td><td>till.report</td><td>DEBUG</td><td>no</td><td>yes</td></tr>
  </table>
  <p>Neither child logger had a handler of its own; their records propagated up to <code>till</code> and were filtered again by each handler. <code>log.exception(...)</code> inside the <code>except</code> block logged at ERROR <em>and</em> attached the full traceback, so last night's file says exactly what failed and where. The file format added <code>filename:lineno</code>, which points to the line that logged.</p>
  <p>The hierarchy also lets you tune one part of the program, and shows the classic duplicate-output bug:</p>
  <div class="fx" data-lang="py"># main2.py
import logging
from setup_logging import setup_logging
from report_log import report

setup_logging("till.log")
logging.getLogger("till.report").setLevel(logging.WARNING)   # mute one noisy module
report({"Asha": 184})
print(open("till.log").read() or "(till.log is empty: report's INFO and DEBUG were dropped)")

setup_logging("till.log")              # BUG: configured a second time...
logging.getLogger("till.payments").warning("gateway slow: %d ms", 2300)</div>
  <div class="fx" data-lang="text">(till.log is empty: report's INFO and DEBUG were dropped)
WARNING  till.payments: gateway slow: 2300 ms
WARNING  till.payments: gateway slow: 2300 ms</div>
  <p>Raising <code>till.report</code>'s level to WARNING dropped its INFO and DEBUG records at the source. Calling the setup twice attached a second pair of handlers to <code>till</code>, so every message now prints twice. Configure logging once, at the program's entry point; library modules only call <code>getLogger(__name__)</code>.</p>
  <h3>Lazy arguments</h3>
  <p>Why <code>log.debug("bills=%r", bills)</code> and not an f-string? Watch when the message is built:</p>
  <div class="fx" data-lang="py"># lazy.py
import logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("till")

class Day:
    def __str__(self):
        print("   (building a 20,000-line summary...)")
        return "&lt;day summary&gt;"

log.debug(f"day: {Day()}")       # f-string: built BEFORE logging sees it, then dropped
log.debug("day: %s", Day())      # %-args: logging drops the record first, never builds it
print("done")</div>
  <div class="fx" data-lang="text">   (building a 20,000-line summary...)
done</div>
  <p>Both DEBUG messages were dropped (threshold INFO), but the f-string version still paid for building its text. With <code>%s</code>-style arguments, logging checks the level first and formats only if the record is kept.</p>
  <h3>Structured (JSON) logs and testing logs</h3>
  <p>In production, logs go to a search tool. One JSON object per line, with named fields, lets you search <code>amount &gt; 150 AND logger = "till.payments"</code>:</p>
  <div class="fx" data-lang="py"># jsonlog.py
import json, logging, sys

class JsonFormatter(logging.Formatter):
    def format(self, record):
        doc = {"ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
               "level": record.levelname, "logger": record.name,
               "msg": record.getMessage()}
        doc.update(getattr(record, "ctx", {}))      # fields passed with extra=
        return json.dumps(doc)

h = logging.StreamHandler(sys.stdout)
h.setFormatter(JsonFormatter())
log = logging.getLogger("till.payments")
log.addHandler(h)
log.setLevel(logging.INFO)

log.info("payment ok", extra={"ctx": {"customer": "Asha", "amount": 184, "latency_ms": 412}})</div>
  <div class="fx" data-lang="text">{"ts": "2026-10-19T19:34:48", "level": "INFO", "logger": "till.payments", "msg": "payment ok", "customer": "Asha", "amount": 184, "latency_ms": 412}</div>
  <p>A warning that should fire is behaviour worth testing. pytest's built-in <code>caplog</code> fixture captures records during a test:</p>
  <div class="fx" data-lang="py"># bill_log.py
import logging
from till import bill
log = logging.getLogger("till")

def bill_logged(customer, lines):
    clean = [(item, int(qty), price) for item, qty, price in lines]
    if clean != lines:
        log.warning("converted text quantities for %s", customer)
    return bill(clean)</div>
  <div class="fx" data-lang="py"># test_bill_log.py
import logging
from bill_log import bill_logged

def test_text_qty_is_converted_and_logged(caplog):
    caplog.set_level(logging.WARNING, logger="till")
    assert bill_logged("Dev", [("masala chai", "2", 30)]) == 63
    assert "converted text quantities for Dev" in caplog.text
    assert caplog.records[0].levelname == "WARNING"

def test_clean_order_logs_nothing(caplog):
    bill_logged("Asha", [("masala chai", 2, 30)])
    assert caplog.records == []</div>
  <div class="fx" data-lang="text">$ pytest -q test_bill_log.py
..                                                                       [100%]
2 passed in 0.01s</div>
  <p>This is also the fix for Dev's crash from the traceback example: convert at the boundary and leave a WARNING in the log (2 × 30 = 60, +5% = 63).</p>
  <table class="tbl">
    <tr><th></th><th>print()</th><th>logging</th></tr>
    <tr><td>Severity / filtering</td><td>No</td><td>Levels; per-logger and per-handler thresholds</td></tr>
    <tr><td>Context</td><td>Only what you type</td><td>Time, logger name, file:line, process, thread</td></tr>
    <tr><td>Destinations</td><td>stdout</td><td>Screen, file, rotating file, syslog, HTTP, JSON</td></tr>
    <tr><td>Tracebacks</td><td>Manual</td><td><code>log.exception</code></td></tr>
    <tr><td>Turn down in production</td><td>Edit code</td><td>Change one level</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Logger</strong>: named source of records (<code>getLogger("till.payments")</code>, usually <code>getLogger(__name__)</code>), arranged in a dot-separated hierarchy; records <strong>propagate</strong> to ancestors' handlers. <strong>Handler</strong>: destination with its own level. <strong>Formatter</strong>: layout of a record (<code>%(asctime)s %(levelname)s %(name)s %(message)s</code>…). <strong>Effective level</strong>: a logger's own level, or its nearest ancestor's if unset. <code>logger.exception(msg)</code> = <code>logger.error(msg, exc_info=True)</code>, for use inside <code>except</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>log.error(str(e))</code> loses the traceback; use <code>log.exception(...)</code>. Configuring handlers in library modules or more than once doubles every line. f-strings in debug logs pay the formatting cost even when dropped. And never log card numbers, tokens or passwords.</p></div>

  <h2 id="pdg-method"><span class="num">09</span>A Systematic Debugging Method</h2>
  <p>Random poking can change a wrong number without proving the fix is right or that the bug cannot return. The method below turns a bug report ("Chen's bill was ₹52; the board says halves round up, so ₹53") into a fix you can trust.</p>
  <div class="flow"><span>1. reproduce</span><span>2. isolate</span><span>3. hypothesise + test the guess</span><span>4. fix</span><span>5. add a test, run the suite</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A doctor's method: confirm the symptom (reproduce), find which organ (isolate), form a diagnosis and order a test that would prove it wrong (hypothesise), treat (fix), and schedule a follow-up (regression test).</p></div>
  <h3>1. Reproduce: a failing test</h3>
  <p>Turn the complaint into the smallest automatic check that fails (the tests are in the suite from <a class="xref" data-note="py_pytest">Testing with pytest</a>, with <code>till.py</code> as built there):</p>
  <div class="fx" data-lang="py"># tests/test_rounding.py
from till import bill

def test_chen_rounds_half_up():
    chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
    assert bill(chen) == 53                  # board rule: 52.5 rounds UP</div>
  <div class="fx" data-lang="text">$ pytest -q tests/test_rounding.py
F                                                                        [100%]
=================================== FAILURES ===================================
___________________________ test_chen_rounds_half_up ___________________________

    def test_chen_rounds_half_up():
        chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
&gt;       assert bill(chen) == 53                  # board rule: 52.5 rounds UP
        ^^^^^^^^^^^^^^^^^^^^^^^
E       AssertionError: assert 52 == 53
E        +  where 52 = bill([('samosa', 2, 15), ('vada pav', 1, 20)])

tests/test_rounding.py:5: AssertionError
=========================== short test summary info ============================
FAILED tests/test_rounding.py::test_chen_rounds_half_up - AssertionError: ass...
1 failed in 0.02s</div>
  <p>Reproduced in 0.02 s, every time. Now each attempt at a fix can be checked instantly.</p>
  <h3>2. Isolate: where is the wrong number made?</h3>
  <p>The pdb session above did this: sub = 50 ✓, discount = 0 ✓, after = 50 ✓, total = 52.5 ✓, <code>round(52.5)</code> = 52 ✗. The bug lives in one expression: <code>round(total)</code>. (For bugs that appeared after a change, <code>git bisect</code> isolates the guilty commit the same way: see <a class="xref" data-note="se_git">Git</a>.)</p>
  <h3>3. Hypothesise, then test the hypothesis</h3>
  <p>Hypothesis: Python's <code>round</code> rounds halves to the <em>even</em> neighbour (banker's rounding), not up. A hypothesis must make predictions that could fail: 0.5 → 0, 1.5 → 2, 2.5 → 2, 52.5 → 52, 53.5 → 54. And a second question for the fix: do floats hold these amounts exactly?</p>
  <div class="fx" data-lang="py">from decimal import Decimal
print([round(x) for x in (0.5, 1.5, 2.5, 52.5, 53.5)])
print(Decimal(52.5), Decimal(184.275))
print(Decimal(str(184.275)))</div>
  <div class="fx" data-lang="text">[0, 2, 2, 52, 54]
52.5 184.275000000000005684341886080801486968994140625
184.275</div>
  <p>Every prediction held: confirmed. The second line warns us: 52.5 is exact in binary, but 184.275 is really 184.27500000000000568…, so converting a float straight to <code>Decimal</code> carries that error along. <code>Decimal(str(x))</code> uses the short decimal text instead.</p>
  <h3>4. Fix: the smallest change that matches the rule</h3>
  <p><code>Decimal.quantize</code> rounds to a given step with a chosen rule; <code>ROUND_HALF_UP</code> is the board's rule. In <code>till.py</code>:</p>
  <div class="fx" data-lang="py">from decimal import Decimal, ROUND_HALF_UP

def bill(lines):
    """Final bill in whole rupees. Refuses negative quantities."""
    for item, qty, price in lines:
        if qty &lt; 0:
            raise ValueError(f"qty must be non-negative, got {qty} for {item!r}")
    sub = subtotal(lines)
    return to_rupees(with_tax(sub - discount(sub)))

def to_rupees(amount):
    """Round to whole rupees, halves UP (the board's rule), not Python's half-to-even."""
    return int(Decimal(str(amount)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))</div>
  <h3>5. Add tests, run the whole suite</h3>
  <p>Extend the regression test with the cases from the hypothesis, so the rule itself is pinned:</p>
  <div class="fx" data-lang="py"># tests/test_rounding.py
import pytest
from till import bill, to_rupees

def test_chen_rounds_half_up():
    chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
    assert bill(chen) == 53                  # board rule: 52.5 rounds UP

@pytest.mark.parametrize("amount, rupees", [
    (52.5, 53), (53.5, 54), (73.5, 74),      # halves always go up
    (184.275, 184), (141.75, 142), (0, 0),   # everything else: nearest
])
def test_to_rupees(amount, rupees):
    assert to_rupees(amount) == rupees</div>
  <div class="fx" data-lang="text">$ pytest -q --tb=no -rf
FF..F.......................................F....                        [100%]
=========================== short test summary info ============================
FAILED tests/test_bill.py::test_day_total - assert 311 == 310
FAILED tests/test_bill.py::test_each_bill - AssertionError: assert {'Asha': 1...
FAILED tests/test_bill_cases.py::test_bill[chen] - AssertionError: assert 53 ...
FAILED tests/test_tables.py::test_day_table - AssertionError: DataFrame.iloc[...
4 failed, 45 passed in 1.36s</div>
  <p>The new tests pass, and the suite reports four <em>old</em> tests that still expect Chen = 52 and a day total of 310. This is the suite doing its job: those tests documented the old behaviour, and the owner has decided the behaviour changes. We update each expectation deliberately (Chen 52 → 53, day total 310 → 311), never by deleting the tests:</p>
  <div class="fx" data-lang="text">$ pytest -q
.................................................                        [100%]
49 passed in 1.60s</div>
  <table class="tbl"><caption>Bills before and after the fix</caption>
    <tr><th>Customer</th><th>With GST</th><th><code>round</code> (half to even)</th><th><code>to_rupees</code> (half up)</th></tr>
    <tr><td>Asha</td><td>184.275</td><td>184</td><td>184</td></tr>
    <tr><td>Ben</td><td>73.5</td><td>74</td><td>74</td></tr>
    <tr><td>Chen</td><td>52.5</td><td>52</td><td><b>53</b></td></tr>
    <tr><td>Day total</td><td></td><td>310</td><td><b>311</b></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>scientific debugging loop</strong>: reproduce the failure reliably (ideally as a test), isolate the smallest region that produces it, state a hypothesis that predicts observable results, test the prediction, fix, and keep the reproduction as a <strong>regression test</strong>. <strong>Round half up</strong> sends .5 away from zero for positives (52.5 → 53); <strong>round half to even</strong> (Python's <code>round</code>, IEEE default) sends it to the even neighbour to avoid bias over many roundings.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Fixing before reproducing ("I think it's the rounding, let me change it"): you can't tell whether the fix worked, or what else it changed. Here, the suite revealed four tests depending on the old rule; a silent change would have shifted the day's totals in reports nobody re-checked. And for money, <code>Decimal(float)</code> carries binary error; build Decimals from strings or keep amounts in integer paise.</p></div>

  <h2 id="pdg-traps"><span class="num">10</span>Common Mistakes</h2>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td>Reading tracebacks top-down</td><td>Staring at crash.py line 9</td><td>Bottom line first, then the frame above</td></tr>
    <tr><td>Fixing where it exploded</td><td><code>try/except</code> around <code>qty &lt; 0</code></td><td>Convert at the form (where "2" entered)</td></tr>
    <tr><td><code>print(qty)</code> without repr</td><td>Shows 2 for "2"</td><td><code>print(f"{qty=!r}")</code></td></tr>
    <tr><td>Rounds of prints</td><td>Edit, re-run, repeat</td><td>One <code>breakpoint()</code> or <code>python -m pdb</code></td></tr>
    <tr><td>Forgotten <code>breakpoint()</code></td><td>Till hangs at closing</td><td>Search before commit; <code>PYTHONBREAKPOINT=0</code></td></tr>
    <tr><td>Optimising by guess</td><td>Rewriting <code>bill</code> (saves 0.12 of 2.1 s)</td><td>Profile first; fix the top line</td></tr>
    <tr><td>Timing once / with time.time</td><td>Noisy, misleading numbers</td><td><code>timeit.repeat</code>, take min; <code>perf_counter</code></td></tr>
    <tr><td>Faster but different</td><td>Report numbers change</td><td>Assert equal results (tests) before timing</td></tr>
    <tr><td><code>log.error(str(e))</code></td><td>No traceback in till.log</td><td><code>log.exception(...)</code></td></tr>
    <tr><td>Configuring logging twice / in libraries</td><td>Every line printed twice</td><td>Configure once at the entry point</td></tr>
    <tr><td>f-strings in debug logs</td><td>Slow even when DEBUG is off</td><td><code>log.debug("x=%s", x)</code></td></tr>
    <tr><td>Fixing without a test</td><td>Rounding bug returns next month</td><td>Reproduce as a test first; keep it</td></tr>
  </table>

  <h2 id="pdg-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Tracebacks</h3>
  <ul>
    <li>"Most recent call last": read <b>bottom up</b>: exception type + message (what) → last frame (where) → frames above (how you got there).</li>
    <li>Each <code>File … line … in func</code> entry is a frame of the call stack; <code>~~~^^^</code> marks the sub-expression (3.11+).</li>
    <li>"During handling of the above exception…" = new exception inside an <code>except</code>; "The above exception was the direct cause…" = <code>raise … from e</code>.</li>
    <li>Fix where the bad value <b>entered</b>, not only where it exploded; never <code>except: pass</code>.</li>
  </ul>
  <h3>print debugging</h3>
  <ul>
    <li>Quick for one or two values; each new question costs an edit and a rerun; prints get left behind.</li>
    <li>Show type-revealing output: <code>print(f"{qty=!r}")</code> → <code>qty='2'</code>.</li>
  </ul>
  <h3>pdb</h3>
  <table class="tbl">
    <tr><th>Cmd</th><th>Does</th><th>Cmd</th><th>Does</th></tr>
    <tr><td><code>n</code></td><td>Next line (step over)</td><td><code>p</code> / <code>pp</code></td><td>Print / pretty-print</td></tr>
    <tr><td><code>s</code></td><td>Step into call</td><td><code>l</code> / <code>ll</code></td><td>List / whole function</td></tr>
    <tr><td><code>r</code></td><td>Run to return</td><td><code>w</code></td><td>Stack</td></tr>
    <tr><td><code>c</code></td><td>Continue</td><td><code>u</code> / <code>d</code></td><td>Up / down a frame</td></tr>
    <tr><td><code>b file:line[, cond]</code></td><td>Breakpoint</td><td><code>until</code> · <code>interact</code> · <code>q</code></td><td>Leave loop · REPL · quit</td></tr>
  </table>
  <ul>
    <li><code>breakpoint()</code> (3.7+) = <code>import pdb; pdb.set_trace()</code>; <code>PYTHONBREAKPOINT=0</code> disables all.</li>
    <li>Post-mortem: <code>python -m pdb script.py</code>, <code>pytest --pdb</code> (or <code>--trace</code> to break at test start), <code>%debug</code> in Jupyter, <code>pdb.pm()</code> in a REPL.</li>
  </ul>
  <h3>Timing</h3>
  <ul>
    <li><code>time.perf_counter()</code>: monotonic, high resolution, for intervals (not <code>time.time()</code>).</li>
    <li><code>min(timeit.repeat(stmt, globals=g, number=N, repeat=R)) / N</code>; take the <b>minimum</b>, noise only adds time. CLI: <code>python -m timeit -s "setup" "stmt"</code>; Jupyter <code>%timeit</code>.</li>
    <li>Doubling n → time ×2: O(n); ×4: O(n²). List <code>in</code> is O(n), set/dict <code>in</code> O(1) average.</li>
  </ul>
  <h3>Profiling</h3>
  <ul>
    <li><code>with cProfile.Profile() as pr: f()</code> → <code>pstats.Stats(pr).sort_stats("cumulative").print_stats(10)</code>. CLI: <code>python -m cProfile -s cumtime script.py</code>.</li>
    <li><b>ncalls</b>; <b>tottime</b> = own lines only; <b>cumtime</b> = own + callees. High tottime → the function itself; high cumtime, low tottime → look at callees.</li>
    <li>Line-level: <code>line_profiler</code> (<code>%lprun</code>). Sampling profilers (py-spy, scalene) attach to running processes with low overhead.</li>
    <li>Make it work → make it right (tests) → profile → fix the top hotspot → rerun tests → re-profile. Check results are identical before comparing speed.</li>
  </ul>
  <h3>Memory</h3>
  <ul>
    <li><code>tracemalloc.start()</code> … <code>current, peak = tracemalloc.get_traced_memory()</code>; <code>take_snapshot().statistics("lineno")</code> for top lines; <code>snap2.compare_to(snap1, "lineno")</code> for growth (leaks).</li>
    <li>Peak is what crashes small machines; stream (generators) instead of building full lists.</li>
    <li>Whole-process view: <code>psutil</code>, memray; <code>sys.getsizeof</code> is shallow.</li>
  </ul>
  <h3>logging</h3>
  <table class="tbl">
    <tr><th>Level</th><th>Value</th><th>Use</th></tr>
    <tr><td>DEBUG</td><td>10</td><td>Developer detail</td></tr>
    <tr><td>INFO</td><td>20</td><td>Normal milestones</td></tr>
    <tr><td>WARNING</td><td>30</td><td>Unexpected but handled (root default)</td></tr>
    <tr><td>ERROR</td><td>40</td><td>An operation failed</td></tr>
    <tr><td>CRITICAL</td><td>50</td><td>Program may not continue</td></tr>
  </table>
  <ul>
    <li><b>Logger</b> (named, dotted hierarchy, <code>getLogger(__name__)</code>) → records <b>propagate</b> to ancestors → each <b>handler</b> (destination + own level) → <b>formatter</b> (layout).</li>
    <li><code>log.exception("msg")</code> inside <code>except</code> = ERROR + traceback (<code>exc_info=True</code>).</li>
    <li>Lazy args: <code>log.debug("x=%s", x)</code>, not f-strings. Configure once at the entry point (<code>basicConfig</code> or <code>dictConfig</code>); libraries only get loggers (and may add <code>NullHandler</code>).</li>
    <li>Structured logs: JSON lines with fields (<code>extra=</code>); test logs with <code>caplog</code>.</li>
  </ul>
  <h3>Systematic method</h3>
  <ul>
    <li>Reproduce (smallest failing test) → isolate (pdb, bisect inputs, <code>git bisect</code> commits) → hypothesise with predictions that could fail → minimal fix → keep the test, run the whole suite.</li>
    <li><code>round()</code> is round-half-to-even: <code>round(0.5), round(1.5), round(2.5), round(52.5)</code> → 0, 2, 2, 52. Half up: <code>Decimal(str(x)).quantize(Decimal("1"), rounding=ROUND_HALF_UP)</code>.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Reading tracebacks top-down; fixing where it exploded.</li>
    <li>Forgotten <code>breakpoint()</code> hangs a production job.</li>
    <li>Optimising by guess; single timings; profiler overhead inflates absolute times (compare profiles with profiles).</li>
    <li><code>log.error(str(e))</code> loses the traceback; configuring handlers twice duplicates every line.</li>
    <li>Never log secrets (card numbers, tokens, passwords).</li>
    <li><code>Decimal(184.275)</code> carries the float's binary error; build from strings.</li>
  </ul>

  <h2 id="pdg-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a Python traceback?</summary><div class="qa-body">From the bottom: the last line is the exception type and message (what went wrong); the frame just above it is where it was raised (file, line, function, source); the frames above that show the chain of calls that got there, oldest at the top. The real cause is often where a bad value entered, which may be several frames up from where it exploded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between "During handling of the above exception, another exception occurred" and "The above exception was the direct cause of the following exception"?</summary><div class="qa-body">The first is implicit chaining: a new exception was raised inside an <code>except</code> block (often a bug in the handler); the original is kept in <code>__context__</code>. The second is explicit chaining with <code>raise NewError(...) from e</code>, stored in <code>__cause__</code>, used to translate a low-level error (<code>KeyError: 'port'</code>) into a domain error (<code>ValueError: config missing port</code>) without losing the original. <code>raise ... from None</code> suppresses the chain.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the essential pdb commands. What is the difference between <code>n</code>, <code>s</code>, <code>r</code> and <code>c</code>?</summary><div class="qa-body"><code>n</code> runs the current line, stepping over calls; <code>s</code> steps into a call on the current line; <code>r</code> runs until the current function returns; <code>c</code> continues to the next breakpoint or the end. Also <code>p</code>/<code>pp</code> print, <code>l</code>/<code>ll</code> list source, <code>w</code> stack, <code>u</code>/<code>d</code> move between frames, <code>b</code> set breakpoints (optionally conditional), <code>q</code> quit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>breakpoint()</code> vs <code>import pdb; pdb.set_trace()</code>?</summary><div class="qa-body">Same effect by default; <code>breakpoint()</code> (Python 3.7+) is shorter and configurable through the <code>PYTHONBREAKPOINT</code> environment variable: <code>PYTHONBREAKPOINT=0</code> disables every call (a safety switch), and <code>PYTHONBREAKPOINT=ipdb.set_trace</code> switches debuggers without code changes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is post-mortem debugging, and how do you start it?</summary><div class="qa-body">Inspecting the stack frames of an exception after it was raised, with all local variables still available. <code>python -m pdb script.py</code> then <code>c</code> (drops into the failing frame on an uncaught exception), <code>pytest --pdb</code> for failing tests, <code>%debug</code> in Jupyter after a cell fails, or <code>pdb.pm()</code> in a REPL. Use <code>u</code> to walk up to callers. It needs the exception to propagate: <code>except: pass</code> destroys the evidence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use logging instead of print in production code?</summary><div class="qa-body">Levels that can be filtered without code changes; timestamps, logger name, file and line on every record; several destinations with different levels (console shows warnings, a file keeps everything); tracebacks via <code>log.exception</code>; structured JSON output for log search tools; and library code can log without deciding where output goes. <code>print</code> has none of this and cannot be turned down.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><span>What does this print (to stderr)?
<div class="fx" data-lang="py">import logging
logging.info("a")
logging.warning("b")
log = logging.getLogger("app")
log.debug("c")
log.error("d")</div></span></summary><div class="qa-body"><div class="fx" data-lang="text">WARNING:root:b
ERROR:app:d</div>With no configuration, the root logger's level is WARNING, so INFO and DEBUG are dropped. The first module-level call (<code>logging.warning</code>) runs <code>basicConfig()</code> automatically, adding a stderr handler with the format <code>LEVEL:name:message</code>. <code>app</code> has no level of its own, so its effective level comes from root, and its records propagate to root's handler.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain loggers, handlers, formatters and propagation.</summary><div class="qa-body">A logger is a named source your code calls, arranged in a dotted hierarchy (<code>app.payments</code> is a child of <code>app</code>); its effective level is its own or its nearest ancestor's. A record that passes the logger's level is handed to its handlers and then propagates to its ancestors' handlers. A handler is a destination (stream, file, rotating file, HTTP) with its own level; a formatter defines the layout (<code>%(asctime)s %(levelname)s %(name)s: %(message)s</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Every log line appears twice. Why?</summary><div class="qa-body">Two handlers are receiving the record: logging was configured twice (setup function called again, or <code>addHandler</code> at import time in a module imported twice), or a handler was added to both a child logger and the root, so the record is emitted by the child's handler and again after propagating to the root's. Configure once at the entry point; in libraries only call <code>getLogger(__name__)</code>; or set <code>propagate = False</code> on the child.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>log.exception</code> vs <code>log.error</code>? And why <code>log.debug("x=%s", x)</code> rather than an f-string?</summary><div class="qa-body"><code>log.exception(msg)</code> logs at ERROR and appends the current traceback; call it inside an <code>except</code> block (equivalent to <code>log.error(msg, exc_info=True)</code>). <code>log.error(str(e))</code> loses the traceback. With <code>%s</code>-style arguments, logging checks the level first and only formats the message if the record is kept; an f-string is built before the call, so expensive <code>__str__</code>/<code>__repr__</code> work happens even when DEBUG is off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find out why a Python program is slow?</summary><div class="qa-body">Measure, don't guess. Time the whole thing with <code>perf_counter</code> and check how it scales (double the input: ×2 → linear, ×4 → quadratic). Profile with cProfile and sort by cumulative time to find the expensive call path; look at tottime to find functions whose own code is slow; use line_profiler on that function to find the line. Fix the top hotspot, confirm results are unchanged (tests), and re-profile. In production, use a sampling profiler like py-spy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In cProfile output, what are tottime and cumtime?</summary><div class="qa-body">tottime is time spent in the function's own code, excluding functions it calls; cumtime includes everything it calls. A function with high cumtime but low tottime is only slow because of its callees; high tottime means its own lines are slow (e.g. an <code>in</code> test on a large list, which never shows as a separate row because it is not a function call), so use a line profiler next.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why take the minimum of repeated <code>timeit</code> runs, and why <code>perf_counter</code> rather than <code>time.time</code>?</summary><div class="qa-body">Interference (other processes, cache misses, GC) only ever adds time, so the minimum is the best estimate of the code's own cost; the mean mixes in noise. <code>time.perf_counter</code> is monotonic and has the highest available resolution; <code>time.time</code> is wall-clock time, can jump when the system clock is adjusted, and has lower resolution.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A pandas pipeline is slow. How would you approach it?</summary><div class="qa-body">Profile first (<code>%prun</code>, <code>%lprun</code>, or cProfile on the pipeline function) to find the hot step. Typical culprits: <code>df.apply(..., axis=1)</code> or Python loops over rows (replace with vectorised column operations or <code>np.where</code>), repeated <code>concat</code>/<code>append</code> in a loop (collect then concat once), object dtype strings (use categoricals), membership tests against lists (use sets or <code>isin</code>), and reading more columns or rows than needed. Assert the new output equals the old before comparing speed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find a memory leak in a long-running Python service?</summary><div class="qa-body">Confirm growth with process-level metrics (RSS over time). Then <code>tracemalloc</code>: take a snapshot, run the workload, take another, and <code>snap2.compare_to(snap1, "lineno")</code> shows which lines' allocations grew. Usual causes: unbounded caches or dicts keyed by request, global lists that are appended to, references kept by closures or listeners, and large objects held in exception tracebacks. For C extensions or the whole process, memray or heap profilers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>round(2.5)</code> return 2, and how do you round half up?</summary><div class="qa-body">Python 3's <code>round</code> uses round-half-to-even (banker's rounding): ties go to the even neighbour (0.5 → 0, 1.5 → 2, 2.5 → 2), which avoids an upward bias over many roundings. For half up use <code>Decimal(str(x)).quantize(Decimal("1"), rounding=ROUND_HALF_UP)</code>. Build the Decimal from a string: <code>Decimal(184.275)</code> is 184.27500000000000568… because of the float's binary error. Also note <code>round(2.675, 2)</code> gives 2.67 for the same reason.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe your process for debugging a bug report.</summary><div class="qa-body">Reproduce it reliably, ideally as the smallest failing test. Isolate where the wrong value appears (traceback, pdb, logs; bisect inputs; <code>git bisect</code> if it is a regression). Form a hypothesis that makes predictions that could fail, and check them. Make the smallest fix. Keep the reproduction as a regression test and run the whole suite, deliberately updating any old tests that encoded the wrong behaviour.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>git bisect</code> do?</summary><div class="qa-body">It binary-searches the commit history for the commit that introduced a bug. You mark a known good and a known bad commit; git checks out the midpoint, you test and mark it good or bad, and it halves the range each time, so about log2(N) steps find the culprit among N commits. <code>git bisect run pytest tests/test_rounding.py</code> automates it with a failing test.</div></details>
</main>
`
});
