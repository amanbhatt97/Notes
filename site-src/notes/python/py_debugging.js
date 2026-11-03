// notes/python/py_debugging.js — Debugging, Profiling & Logging
Object.assign(TOPIC_CONTENT, {
  "py_debugging": `<main>
<h1>Debugging, Profiling &amp; Logging</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>Debugging, Profiling &amp; Logging</span></div>
  <p class="lead">A crash or a failing test tells you <em>that</em> something is wrong. Debugging, profiling and logging are the skills that tell you the rest: debugging finds <em>where</em> and <em>why</em> a program misbehaves, profiling finds <em>why it is slow</em> or uses too much memory, and logging records <em>what happened</em> while nobody was watching. Without them, fixes and speed-ups are guesses: people rewrite the function they suspect while the real problem is one line elsewhere, or hide a crash by swallowing the exception. Everything on this page is in Python's standard library (plus one small add-on, line_profiler): tracebacks, the <code>pdb</code> debugger, <code>timeit</code>, <code>cProfile</code>, <code>tracemalloc</code> and the <code>logging</code> module, ending with a step-by-step method for fixing a bug so it stays fixed. The running example is the till of a small tea stall, Chai Corner: its billing module, a daily sales report, and a busy festival day of 20,000 orders.</p>

  <h2 id="pdg-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Debugging, Profiling &amp; Logging</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Finding bugs</div>
        <ul>
          <li>Read tracebacks <b>bottom up</b></li>
          <li><code>breakpoint()</code>; <code>n s r c p ll w u q</code></li>
          <li>Post-mortem: <code>python -m pdb</code>, <code>pytest --pdb</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Finding slowness</div>
        <ul>
          <li><code>perf_counter</code>; double n and watch the time</li>
          <li><code>timeit</code>: take the minimum of repeats</li>
          <li><code>cProfile</code>: tottime vs cumtime; line_profiler</li>
          <li><code>tracemalloc</code>: peak memory by line</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging</div>
        <ul>
          <li>DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL</li>
          <li>logger → handlers → formatter</li>
          <li><code>log.exception</code> = ERROR + traceback</li>
          <li>Configure once; lazy <code>%s</code> arguments</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The method</div>
        <ul>
          <li>Reproduce → isolate → hypothesise → fix → keep the test</li>
          <li><code>round()</code> rounds halves to even</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdg-tb"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Reading a Traceback</span><span class="rm-sub">what Python prints when it crashes</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-print"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">print Debugging and Its Limits</span><span class="rm-sub">quick looks, and what they cost</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-pdb"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">pdb and breakpoint()</span><span class="rm-sub">pausing a program and looking around</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-pm"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Post-mortem Debugging</span><span class="rm-sub">inspecting a program after it crashed</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-time"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Timing Code</span><span class="rm-sub">perf_counter, scaling, timeit</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-prof"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Profiling</span><span class="rm-sub">cProfile, pstats, line_profiler</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-mem"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Memory with tracemalloc</span><span class="rm-sub">peak memory and which line uses it</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-log"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Logging Basics</span><span class="rm-sub">why not print, levels, basicConfig</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-handlers"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Loggers, Handlers and Formatters</span><span class="rm-sub">the hierarchy, lazy messages, JSON, caplog</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-method"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">A Systematic Debugging Method</span><span class="rm-sub">from bug report to regression test</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">guessing, lost tracebacks, doubled logs</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">commands, APIs, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">tracebacks to memory leaks</span></div></div>
    </div>
  </div>

  <h2 id="pdg-tb"><span class="num">01</span>Reading a Traceback</h2>
  <p>Here is the code this page works with. The billing module applies Chai Corner's rules (10% off at ₹150 or more, then 5% GST, rounded to whole rupees; the same rules as in <a class="xref" data-note="py_pytest">Testing with pytest</a>), written one step per line so that we can later walk through it in a debugger. The report module adds up a whole day of orders.</p>
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
  <p>Today's orders include one from Dev, who ordered through the stall's new website. The web form sent his quantity as the text <code>"2"</code> rather than the number 2, a very common kind of real-world bug:</p>
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
  File "~/chai/crash.py", line 10, in &lt;module&gt;
    print(daily_report(orders))
          ~~~~~~~~~~~~^^^^^^^^
  File "~/chai/report.py", line 10, in daily_report
    sales += bill(lines)
             ~~~~^^^^^^^
  File "~/chai/till.py", line 16, in bill
    if qty &lt; 0:
       ^^^^^^^
TypeError: '&lt;' not supported between instances of 'str' and 'int'</div>
  <p>When an exception is raised and nothing catches it, Python stops and prints a <strong>traceback</strong>: the exception's type and message, plus the chain of function calls that were in progress when it happened. It is the first and cheapest debugging tool you have, and most crashes can be located from it alone, as long as you read it in the right order.</p>
  <p>The header says "most recent call last", which means the newest call is at the <em>bottom</em>, so you read from the bottom up. The last line says <em>what</em> went wrong: <code>TypeError: '&lt;' not supported between instances of 'str' and 'int'</code>, so something compared a piece of text with a number using <code>&lt;</code>. The entry just above it says <em>where</em>: <code>till.py</code>, line 16, in <code>bill</code>, on the line <code>if qty &lt; 0:</code>, with <code>^^^</code> marks under the exact expression. So <code>qty</code> must be a string. The entry above that says <em>who called</em>: <code>report.py</code> line 10, inside the report's loop over orders, <code>sales += bill(lines)</code>. And the top entry shows where it all started: line 10 of <code>crash.py</code>, the script we ran.</p>
  <p>Each "File … line … in …" entry is called a <strong>frame</strong>: one function call that was still running at the moment of the crash, with its own local variables. Stacked together, the frames form the <strong>call stack</strong> (the same stack described in <a class="xref" data-note="py_functions">Functions</a>). A parcel's tracking history reads the same way: the newest scan, "damaged at the Pune hub", tells you what happened, and the older scans above it show the route the parcel took to get there.</p>
  <p>The traceback has told us what and where, but not everything. It does not print the values of variables, so it cannot tell us <em>which</em> order contained the text quantity; we can guess (Dev's web order), or we can look, using the debugger later on this page. It also points at where the bad value <em>exploded</em>, which is not where it <em>entered</em>. The right fix is not to wrap <code>if qty &lt; 0</code> in a <code>try/except</code> deep inside <code>bill</code>; that would only hide the bad data and let it cause trouble somewhere else. The fix belongs where the text came in: convert the form's input to an <code>int</code> when the order is created (validating input is covered in <a class="xref" data-note="py_exceptions">Exceptions</a>; the logging section below shows one way to do it).</p>
  <p>Two more phrases appear in tracebacks when one exception happens while another is being handled. "During handling of the above exception, another exception occurred" means a new error was raised inside an <code>except</code> block, often a bug in the error handler itself. "The above exception was the direct cause of the following exception" means the code deliberately translated one error into another with <code>raise NewError(...) from e</code>. In both cases Python prints both tracebacks, oldest first, so the real origin is never lost.</p>

  <h2 id="pdg-print"><span class="num">02</span>print Debugging and Its Limits</h2>
  <p>A crash at least leaves a traceback. A wrong answer leaves nothing. A customer, Chen, complains that his bill was wrong: the price board says amounts are rounded with halves going up, so 52.50 should be ₹53, but the till charged ₹52.</p>
  <div class="fx" data-lang="py"># chen.py
from till import bill
chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
print("Chen pays", bill(chen))      # the price board says halves round up: expected 53</div>
  <div class="fx" data-lang="text">$ python3 chen.py
Chen pays 52</div>
  <p>Nothing crashed, so there is no traceback to read. The quickest way to see what is going on inside <code>bill</code> is to print the intermediate values, which is called <strong>print debugging</strong>. We temporarily edit the end of <code>bill</code>:</p>
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
  <p>The subtotal of 50 (2 × 15 + 20) is right; no discount below ₹150 is right; 50 plus 5% is 52.5, also right. So every step up to the last one is correct, and the final step, <code>round(52.5)</code>, gives 52. The problem is in the rounding.</p>
  <p>The prints worked, but notice what they cost. Every new question, such as "what does <code>round</code> do with 53.5?", means editing the code again and re-running it. On a report that takes minutes to reach the interesting point, ten rounds of prints can cost an hour. The prints have to be removed afterwards, and sooner or later one is forgotten and ends up in production output, perhaps on a customer's receipt. And a printed line has no timestamp, no severity and no note of where it came from, and cannot be switched off without editing code. Debugging with prints is like asking a friend at a match to text you the score, but only the scores you thought to ask about in advance; any new question needs another text. The next sections solve the first problem with a debugger and the last one with the <code>logging</code> module.</p>
  <p>If you do print, print the type as well as the value. <code>print(qty)</code> shows <code>2</code> both for the number 2 and for the string <code>"2"</code>, which is exactly Dev's bug. <code>print(repr(qty))</code> or the f-string form <code>print(f"{qty=!r}")</code> shows <code>qty='2'</code>, quotes included.</p>

  <h2 id="pdg-pdb"><span class="num">03</span>pdb and breakpoint()</h2>
  <p>Prints show only what you decided to print before running. A <strong>debugger</strong> is a tool that pauses a running program at a line you choose and gives you a prompt where you can inspect every variable, evaluate any expression, and then move forward one line at a time or step into a function call, all without editing the code for each new question. Python's built-in debugger is <strong>pdb</strong>. The simplest way to use it is to put the built-in function <code>breakpoint()</code> on a line: when the program reaches that line, it pauses and shows the <code>(Pdb)</code> prompt.</p>
  <p>Think of pausing a cricket replay at the ball where the wicket fell. You can look at every fielder's position, play forward frame by frame, or zoom in on one player. Prints are like reading the scorecard afterwards: you only see what somebody chose to write down.</p>
  <p>We add <code>breakpoint()                                  # pause here</code> to <code>bill</code>, just before <code>sub = subtotal(lines)</code>, and run Chen's script again. Below is a real session. (To record it, the commands were typed into pdb from a file; each command is shown after its <code>(Pdb)</code> prompt, exactly where you would type it.)</p>
  <div class="fx" data-lang="text">$ python3 chen.py
&gt; ~/chai/till.py(18)bill()
-&gt; breakpoint()                                  # pause here
(Pdb) p lines
[('samosa', 2, 15), ('vada pav', 1, 20)]
(Pdb) n
&gt; ~/chai/till.py(19)bill()
-&gt; sub = subtotal(lines)
(Pdb) n
&gt; ~/chai/till.py(20)bill()
-&gt; after = sub - discount(sub)
(Pdb) p sub
50
(Pdb) s
--Call--
&gt; ~/chai/till.py(8)discount()
-&gt; def discount(sub):
(Pdb) r
--Return--
&gt; ~/chai/till.py(9)discount()-&gt;0
-&gt; return sub * 0.10 if sub &gt;= 150 else 0
(Pdb) n
&gt; ~/chai/till.py(21)bill()
-&gt; total = with_tax(after)
(Pdb) p after
50
(Pdb) n
&gt; ~/chai/till.py(22)bill()
-&gt; return round(total)
(Pdb) p total
52.5
(Pdb) p round(total), round(53.5), round(0.5), round(1.5), round(2.5)
(52, 54, 0, 2, 2)
(Pdb) ll
 14  	def bill(lines):
 15  	    for item, qty, price in lines:
 16  	        if qty &lt; 0:
 17  	            raise ValueError(f"qty must be non-negative, got {qty} for {item!r}")
 18  	    breakpoint()                                  # pause here
 19  	    sub = subtotal(lines)
 20  	    after = sub - discount(sub)
 21  	    total = with_tax(after)
 22  -&gt;	    return round(total)
(Pdb) w
  ~/chai/chen.py(4)&lt;module&gt;()
-&gt; print("Chen pays", bill(chen))      # the price board says halves round up: expected 53
&gt; ~/chai/till.py(22)bill()
-&gt; return round(total)
(Pdb) c
Chen pays 52</div>
  <p>Walk through it. When the program paused, pdb printed <code>&gt; ~/chai/till.py(18)bill()</code>, meaning file, line 18, function <code>bill</code>, and on the next line <code>-&gt; breakpoint()</code>, the line it is <em>about to run</em>. <code>p lines</code> printed an expression: Chen's order arrived intact. <code>n</code> ("next") runs one line; we pressed it twice, so line 19 ran and the debugger now waits before line 20. <code>p sub</code> showed 50, correct. Line 20 calls <code>discount</code>, and instead of running over that call we used <code>s</code> ("step"), which goes <em>into</em> it; pdb printed <code>--Call--</code> and showed us inside <code>discount</code>. We did not need to look at it line by line, so <code>r</code> ("return") ran until <code>discount</code> returned and showed the returned value, <code>-&gt;0</code>: no discount, correct. Back in <code>bill</code>, <code>n</code> and <code>p after</code> showed 50, and another <code>n</code> and <code>p total</code> showed 52.5, both correct.</p>
  <p>Then came the real advantage over prints: a question we only thought of while paused. <code>p round(total), round(53.5), round(0.5), round(1.5), round(2.5)</code> evaluated a whole expression right there and gave <code>(52, 54, 0, 2, 2)</code>. The pattern is clear: an exact half goes to the nearest <em>even</em> number. 52.5 goes down to 52, but 53.5 goes up to 54; 0.5 goes to 0 and 2.5 goes to 2. <code>ll</code> ("long list") showed the whole function with an arrow at the current line, and <code>w</code> ("where") showed the call stack, newest at the bottom: <code>chen.py</code> line 4 called <code>bill</code>. Finally <code>c</code> ("continue") let the program run on to the end. One session answered every question, and the cause is located: Python's <code>round</code> uses "round half to even", also called banker's rounding. The fix comes in the final section.</p>
  <table class="tbl">
    <tr><th>Command</th><th>Does</th><th>Command</th><th>Does</th></tr>
    <tr><td><code>n</code></td><td>Next line (runs calls without entering them)</td><td><code>p expr</code> / <code>pp expr</code></td><td>Print / pretty-print an expression</td></tr>
    <tr><td><code>s</code></td><td>Step into the call on this line</td><td><code>l</code> / <code>ll</code></td><td>List code around here / the whole function</td></tr>
    <tr><td><code>r</code></td><td>Run until the current function returns</td><td><code>w</code></td><td>Where: show the call stack</td></tr>
    <tr><td><code>c</code></td><td>Continue to the next breakpoint or the end</td><td><code>u</code> / <code>d</code></td><td>Move up / down one frame in the stack</td></tr>
    <tr><td><code>b file:line</code></td><td>Set a breakpoint (optionally <code>, condition</code>)</td><td><code>q</code></td><td>Quit</td></tr>
    <tr><td><code>until</code></td><td>Run until a later line (to leave a loop)</td><td><code>interact</code></td><td>Open a normal Python prompt here</td></tr>
  </table>
  <p>The three movement commands are worth fixing in memory with their usual names: <code>n</code> is <strong>step over</strong> (run the whole call as one step), <code>s</code> is <strong>step into</strong>, and <code>r</code> is <strong>step out</strong>. One small trap: if your code has a variable called <code>n</code>, <code>c</code> or <code>p</code>, typing its name runs the pdb command instead, so print it with <code>p n</code>. Editors such as VS Code and PyCharm offer the same debugger with clickable breakpoints. And since a forgotten <code>breakpoint()</code> in committed code would freeze a production job waiting for keyboard input, Python has a safety switch: the environment variable <code>PYTHONBREAKPOINT=0</code> turns every <code>breakpoint()</code> into a no-op.</p>
  <div class="fx" data-lang="text">$ PYTHONBREAKPOINT=0 python3 chen.py
Chen pays 52</div>

  <h2 id="pdg-pm"><span class="num">04</span>Post-mortem Debugging</h2>
  <p>A breakpoint needs you to know in advance where to stop. Often you do not: the program has already crashed, and the traceback does not show the value you need. Back in the first section, the traceback told us that some <code>qty</code> was a string, but not whose order it was. <strong>Post-mortem debugging</strong> opens the debugger at the moment of the crash, with every frame and every local variable still intact, so you can look around the scene afterwards. An aircraft's black box is the same idea: you were not in the cockpit, but the recorder kept every instrument reading at the moment of the incident.</p>
  <p>The easiest way in is to run the script under pdb with <code>python -m pdb script.py</code>. pdb pauses at the first line; <code>c</code> runs the program, and when an uncaught exception happens, pdb enters post-mortem mode in the frame that raised it.</p>
  <div class="fx" data-lang="text">$ python3 -m pdb crash.py
&gt; ~/chai/crash.py(2)&lt;module&gt;()
-&gt; from report import daily_report
(Pdb) c
Traceback (most recent call last):
  File "/usr/local/lib/python3.13/pdb.py", line 2524, in main
    pdb._run(target)
    ~~~~~~~~^^^^^^^^
  File "/usr/local/lib/python3.13/pdb.py", line 2264, in _run
    self.run(target.code)
    ~~~~~~~~^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/bdb.py", line 680, in run
    exec(cmd, globals, locals)
    ~~~~^^^^^^^^^^^^^^^^^^^^^^
  File "&lt;string&gt;", line 1, in &lt;module&gt;
  File "~/chai/crash.py", line 10, in &lt;module&gt;
    print(daily_report(orders))
          ~~~~~~~~~~~~^^^^^^^^
  File "~/chai/report.py", line 10, in daily_report
    sales += bill(lines)
             ~~~~^^^^^^^
  File "~/chai/till.py", line 16, in bill
    if qty &lt; 0:
       ^^^^^^^
TypeError: '&lt;' not supported between instances of 'str' and 'int'
Uncaught exception. Entering post mortem debugging
Running 'cont' or 'step' will restart the program
&gt; ~/chai/till.py(16)bill()
-&gt; if qty &lt; 0:
(Pdb) p item, qty, type(qty)
('masala chai', '2', &lt;class 'str'&gt;)
(Pdb) u
&gt; ~/chai/report.py(10)daily_report()
-&gt; sales += bill(lines)
(Pdb) p customer, lines
('Dev', [('masala chai', '2', 30)])
(Pdb) q</div>
  <p>Read the session. After <code>c</code>, the program crashed with the same <code>TypeError</code> (the traceback now includes a few frames belonging to pdb itself at the top, which you can ignore). pdb announced "Entering post mortem debugging" and put us in the failing frame, <code>till.py</code> line 16. <code>p item, qty, type(qty)</code> showed the culprit: <code>'2'</code>, of type <code>str</code>. Then <code>u</code> moved <em>up</em> one frame, into <code>daily_report</code>, whose local variables were still there: <code>p customer, lines</code> showed that the customer is Dev and his order contains the text quantity. The cause was found without adding a single print and without re-running anything. (Inside post-mortem mode, <code>c</code> or <code>s</code> would restart the whole program; <code>q</code> leaves.)</p>
  <p>The same works for tests: <code>pytest --pdb</code> opens the debugger at the point where a test fails. Here is a test that reproduces Chen's complaint, run that way:</p>
  <div class="fx" data-lang="text">$ pytest -q --pdb tests/test_rounding.py
F
&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; traceback &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;

    def test_chen_rounds_half_up():
        chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
&gt;       assert bill(chen) == 53                  # board rule: 52.5 rounds UP
        ^^^^^^^^^^^^^^^^^^^^^^^
E       AssertionError: assert 52 == 53
E        +  where 52 = bill([('samosa', 2, 15), ('vada pav', 1, 20)])

tests/test_rounding.py:6: AssertionError
&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; entering PDB &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;

&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; PDB post_mortem (IO-capturing turned off) &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;
&gt; ~/chai/tests/test_rounding.py(6)test_chen_rounds_half_up()
-&gt; assert bill(chen) == 53                  # board rule: 52.5 rounds UP
(Pdb) p chen
[('samosa', 2, 15), ('vada pav', 1, 20)]
(Pdb) p bill(chen)
52
(Pdb) q

=========================== short test summary info ============================
FAILED tests/test_rounding.py::test_chen_rounds_half_up - AssertionError: ass...
!!!!!!!!!!!!!!!!!!! _pytest.outcomes.Exit: Quitting debugger !!!!!!!!!!!!!!!!!!!
1 failed in 0.11s</div>
  <p>pytest printed its usual failure report, then opened pdb in the test's frame, where <code>chen</code> and <code>bill</code> are available to experiment with. In Jupyter, the magic command <code>%debug</code> after a cell has failed does the same, and in a plain Python prompt <code>import pdb; pdb.pm()</code> opens the last uncaught exception. Post-mortem debugging needs one thing: the exception must actually reach the top. If the code catches it with <code>except: pass</code>, or logs only <code>str(e)</code> and carries on, the frames and their variables are gone.</p>

  <h2 id="pdg-time"><span class="num">05</span>Timing Code</h2>
  <p>A different complaint: on festival days the end-of-day report takes ages. "It feels slow" is not something you can fix, so the first step is always to measure. To have something to measure, a helper generates a busy day of orders. It uses a seeded random generator, so every run produces exactly the same 20,000 orders, which makes measurements comparable:</p>
  <div class="fx" data-lang="py"># bigday.py
import random

MENU = [("masala chai", 30), ("samosa", 15), ("vada pav", 20), ("cold coffee", 90)]

def make_day(n_orders, seed=0):
    """A busy festival day: n_orders orders from regulars and walk-ins."""
    rng = random.Random(seed)                    # seeded: the same day every run
    day = []
    for _ in range(n_orders):
        customer = f"cust{rng.randint(1, n_orders)}"
        lines = [(item, rng.randint(1, 3), price)
                 for item, price in rng.sample(MENU, rng.randint(1, 3))]
        day.append((customer, lines))
    return day</div>
  <p>The simplest measuring tool is <code>time.perf_counter()</code>, a high-resolution stopwatch: read it before and after the code, and subtract. The script below times the report once, then times it for different numbers of orders to see how the time grows. (All timings on this page come from one run on one machine; on yours the numbers will differ, but the patterns will be the same.)</p>
  <div class="fx" data-lang="py">import time
from bigday import make_day
from report import daily_report

day = make_day(20_000)
print(day[0])

start = time.perf_counter()                      # a high-resolution stopwatch
result = daily_report(day)
elapsed = time.perf_counter() - start
print(result)
print(f"daily_report took {elapsed:.2f} s")

for n in (2_500, 5_000, 10_000, 20_000):         # how does the time grow with n?
    d = make_day(n)
    t0 = time.perf_counter()
    daily_report(d)
    print(f"n={n:&gt;6}: {time.perf_counter() - t0:.3f} s")</div>
  <div class="fx" data-lang="text">('cust12624', [('masala chai', 3, 30), ('samosa', 2, 15)])
{'orders': 20000, 'customers': 12598, 'sales': 2990934, 'top_item': 'vada pav'}
daily_report took 1.81 s
n=  2500: 0.017 s
n=  5000: 0.065 s
n= 10000: 0.259 s
n= 20000: 1.959 s</div>
  <p>The report takes about 1.8 seconds for 20,000 orders. The number itself matters less than its <em>shape</em>. Each time the number of orders doubles, the time grows by roughly four times or more: 0.017 → 0.065 → 0.259 → 1.959 seconds. If the work were proportional to the number of orders, doubling the orders would only double the time. Growth like this means something inside does work proportional to <em>n</em> for each of the <em>n</em> orders, which computer scientists write as O(n²), "order n squared". At 80,000 orders the report would take half a minute or more. That shape is the first clue.</p>
  <p>To compare small pieces of code, a single stopwatch reading is too noisy: a fast statement takes microseconds, and the computer doing anything else in the background distorts it. The <code>timeit</code> module runs a statement many times (<code>number</code>), repeats that measurement several times (<code>repeat</code>), and you take the <strong>minimum</strong>. The minimum, not the average, because background interference can only ever add time; the fastest run is the closest to the code's true cost, much as a sprinter's best time says more about their speed than a run where they stumbled. Our suspect is the line <code>if customer not in customers</code>, where <code>customers</code> is a list that grows to about 12,600 names:</p>
  <div class="fx" data-lang="py">import timeit
names_list = [f"cust{i}" for i in range(12_600)]      # about as many as the day's customers
names_set = set(names_list)
for stmt in ['"cust99999" in names_list', '"cust99999" in names_set']:
    runs = timeit.repeat(stmt, globals=globals(), number=1_000, repeat=5)
    print(f"{stmt:&lt;28} best of 5: {min(runs) / 1_000 * 1e9:9.0f} ns per check")</div>
  <div class="fx" data-lang="text">"cust99999" in names_list    best of 5:     73492 ns per check
"cust99999" in names_set     best of 5:        18 ns per check</div>
  <p>Checking whether a name is in a list of 12,600 names takes about 73 microseconds, because Python compares it with each item in turn until it finds a match, and a new customer matches nothing, so every item is checked. Checking a set takes about 18 nanoseconds, because a set finds items by their hash in a single step (see <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>). 73 microseconds times 20,000 orders is about 1.5 seconds, which would explain almost the whole report. But that is still a hypothesis, built on a suspicion. From the command line, <code>python -m timeit</code> does the same job, here timing a single <code>bill</code> call:</p>
  <div class="fx" data-lang="text">$ python3 -m timeit -s "from till import bill; o = [('samosa', 2, 15), ('vada pav', 1, 20)]" "bill(o)"
500000 loops, best of 5: 363 nsec per loop</div>
  <p><code>-s</code> gives setup code that runs once and is not timed. One bill takes well under a microsecond, so 20,000 of them cost only a few milliseconds: <code>bill</code> is not the problem. In Jupyter, <code>%timeit</code> does all this for you. Two habits to avoid: timing with <code>time.time()</code>, a wall clock that can jump when the computer adjusts its clock, and timing something once and trusting the number.</p>

  <h2 id="pdg-prof"><span class="num">06</span>Profiling</h2>
  <p>Timing tells you how long code takes; it does not tell you where the time goes. A <strong>profiler</strong> runs your program and records how much time is spent in each function. Python ships with <code>cProfile</code>, which records every function call, and <code>pstats</code>, which sorts and prints the results. The rule experienced developers follow is: make it work, make it right (the tests pass), and only then make it fast, and only after measuring. A doctor orders a blood test before prescribing; optimising without a profile is prescribing on a guess.</p>
  <div class="fx" data-lang="py">import cProfile, pstats
from bigday import make_day
from report import daily_report

day = make_day(20_000)
with cProfile.Profile() as pr:                   # record every function call
    daily_report(day)
stats = pstats.Stats(pr)
stats.sort_stats("cumulative").print_stats(6)    # top 6 by time including callees</div>
  <div class="fx" data-lang="text">         232264 function calls in 1.862 seconds

   Ordered by: cumulative time
   List reduced from 14 to 6 due to restriction &lt;6&gt;

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    1.760    1.760    1.862    1.862 ~/chai/report.py:4(daily_report)
    20000    0.030    0.000    0.089    0.000 ~/chai/till.py:14(bill)
    20000    0.015    0.000    0.043    0.000 ~/chai/till.py:5(subtotal)
    20000    0.018    0.000    0.028    0.000 {built-in method builtins.sum}
    59830    0.010    0.000    0.010    0.000 ~/chai/till.py:6(&lt;genexpr&gt;)
    39830    0.008    0.000    0.008    0.000 {method 'get' of 'dict' objects}</div>
  <p>Each row is one function, and the columns are worth learning properly, because interviewers ask about them. <code>ncalls</code> is how many times the function was called. <code>tottime</code> is the time spent in the function's <em>own</em> lines, not counting time spent inside functions it called. <code>cumtime</code> ("cumulative time") is the function's own time <em>plus</em> everything it called. The two <code>percall</code> columns divide those by the number of calls, and the last column names the function (<code>{built-in ...}</code> means C code inside Python).</p>
  <p>Now read the rows. The header says 232,264 function calls took 1.862 seconds; that is a little slower than the stopwatch time because recording every call adds overhead, so compare profiles with profiles, not with stopwatch readings. <code>daily_report</code> has a cumtime of 1.862, the whole run, and a <strong>tottime of 1.760</strong>: about 95% of all the time is spent in its <em>own</em> lines, not in anything it calls. <code>bill</code> was called 20,000 times but has a cumtime of only 0.089 seconds, including everything it calls: not the problem, exactly as <code>timeit</code> suggested. <code>dict.get</code>, one call per order line, cost under a hundredth of a second. The general reading rule: high cumtime but low tottime means "look at what this function calls"; high tottime means "the function's own code is slow".</p>
  <p>So the cost is inside <code>daily_report</code>'s own lines, and cProfile cannot split a function into lines. In particular, the <code>in</code> operator is not a function call, so it never appears as a row. For that you need a line profiler, the <code>line_profiler</code> package (installed with pip), which times every line of the functions you give it:</p>
  <div class="fx" data-lang="py">from line_profiler import LineProfiler
from bigday import make_day
from report import daily_report

day = make_day(20_000)
lp = LineProfiler(daily_report)          # time every line of this one function
lp.runcall(daily_report, day)
lp.print_stats(output_unit=1e-3)         # times in milliseconds</div>
  <div class="fx" data-lang="text">Timer unit: 0.001 s

Total time: 2.02682 s
File: ~/chai/report.py
Function: daily_report at line 4

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
     4                                           def daily_report(orders):
     5                                               """orders: list of (customer, lines). Summarise the day."""
     6         1          0.0      0.0      0.0      sales = 0
     7         1          0.0      0.0      0.0      customers = []
     8         1          0.0      0.0      0.0      items = {}
     9     20001          8.0      0.0      0.4      for customer, lines in orders:
    10     20000        143.7      0.0      7.1          sales += bill(lines)
    11     20000       1824.3      0.1     90.0          if customer not in customers:          # have we seen this customer today?
    12     12598          7.8      0.0      0.4              customers.append(customer)
    13     59830         24.8      0.0      1.2          for item, qty, price in lines:
    14     39830         18.3      0.0      0.9              items[item] = items.get(item, 0) + qty
    15         1          0.0      0.0      0.0      top = max(items, key=items.get) if items else None
    16         2          0.0      0.0      0.0      return {"orders": len(orders), "customers": len(customers),
    17         1          0.0      0.0      0.0              "sales": sales, "top_item": top}</div>
  <p>The <code>Hits</code> column shows how often each line ran, <code>Time</code> its total time in milliseconds, and <code>% Time</code> its share of the function. Line 11, <code>if customer not in customers:</code>, takes 90% of the time on its own. That confirms the hypothesis from the <code>timeit</code> experiment: the list grows to 12,598 names, and each of the 20,000 checks scans it. The whole billing step, line 10, is only 7%. The fix is a one-line change of data structure: keep the customers in a <code>set</code>, and use <code>add</code>, which ignores duplicates by itself.</p>
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
  <p>Before celebrating, prove that the fast version gives the <em>same</em> answer, because a fast wrong answer is worthless. In a real project the test suite does this; here an <code>assert</code> compares the two reports before any timing happens:</p>
  <div class="fx" data-lang="py">import timeit
from bigday import make_day
import report, report_fast

day = make_day(20_000)
assert report.daily_report(day) == report_fast.daily_report(day)   # same answer FIRST
for mod in (report, report_fast):
    best = min(timeit.repeat(lambda: mod.daily_report(day), number=1, repeat=3))
    print(f"{mod.__name__:&lt;12} {best * 1000:8.1f} ms")</div>
  <div class="fx" data-lang="text">report         1802.6 ms
report_fast      24.0 ms</div>
  <p>Same summary, and the report went from about 1.8 seconds to about 24 milliseconds, roughly 75 times faster, from changing one line. A natural guess at the start would have been "<code>bill</code> is called 20,000 times, let us rewrite it", which would have saved at most 0.09 seconds. The last step of the loop is to profile again and see what is on top now, this time sorted by tottime:</p>
  <div class="fx" data-lang="py">import cProfile, pstats
from bigday import make_day
from report_fast import daily_report

day = make_day(20_000)
with cProfile.Profile() as pr:
    daily_report(day)
pstats.Stats(pr).sort_stats("tottime").print_stats(4)    # top 4 by OWN time</div>
  <div class="fx" data-lang="text">         239666 function calls in 0.120 seconds

   Ordered by: internal time
   List reduced from 14 to 4 due to restriction &lt;4&gt;

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
    20000    0.028    0.000    0.074    0.000 ~/chai/till.py:14(bill)
        1    0.027    0.027    0.120    0.120 ~/chai/report_fast.py:4(daily_report)
    20000    0.015    0.000    0.024    0.000 {built-in method builtins.sum}
    20000    0.011    0.000    0.011    0.000 {method 'add' of 'set' objects}</div>
  <p>No single line dominates any more: the remaining time is spread over the real work of billing 20,000 orders, and the whole run takes about a tenth of a second even with the profiler's overhead. This is where to stop optimising. In data work the same method usually finds a row-by-row <code>apply</code> or a Python loop over DataFrame rows, whose fix is a vectorised column operation. Jupyter has magics for both tools, <code>%prun</code> and <code>%lprun</code>; from the shell, <code>python -m cProfile -s cumtime script.py</code> profiles a whole script. cProfile is a <strong>deterministic profiler</strong>: it records every call, which is precise but slows the program down. A <strong>sampling profiler</strong> such as py-spy instead looks at the call stack many times per second, with very little overhead, and can even attach to a program already running in production.</p>

  <h2 id="pdg-mem"><span class="num">07</span>Memory with tracemalloc</h2>
  <p>A program can be fast and still fail, because it runs out of memory. This usually happens when code builds a whole result in memory before using it, instead of handling one piece at a time. On a laptop with plenty of memory it works; in a small cloud container with a memory limit, the program is killed. The question to answer is how much memory a piece of code needs at its <strong>peak</strong>, and which line is responsible.</p>
  <p>At closing time the till prints a receipt for every order. Here are two ways to do it: build every receipt first and then write them all out, or write each receipt as soon as it is made.</p>
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
  <p>The standard library's <code>tracemalloc</code> module records every memory allocation Python makes while tracing is switched on. <code>tracemalloc.start()</code> begins tracing; <code>get_traced_memory()</code> returns two numbers, the memory currently in use and the peak since tracing started; and <code>take_snapshot().statistics("lineno")</code> groups the memory still in use by the line of source code that allocated it, largest first. The script below writes all 20,000 receipts both ways (to <code>os.devnull</code>, a file that throws away whatever is written to it) and measures each:</p>
  <div class="fx" data-lang="py">import os, tracemalloc
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
~/chai/receipts.py:6: size=2322 KiB, count=20000, average=119 B
mem.py:17: size=169 KiB, count=1, average=169 KiB</div>
  <p>The first receipt checks the format: 3 chai and 2 samosas are 90 + 30 = 120, plus 5% is 126. Building every receipt first peaked at 5.71 MB; writing them one at a time peaked at 0.02 MB, about 300 times less, for exactly the same output. "Still held" is close to zero in both cases, because the memory is released when the function returns; it is the <em>peak</em> that kills a small machine. The snapshot then names the responsible lines: <code>receipts.py:6</code>, the line that builds each receipt string, holds 20,000 strings averaging 119 bytes, about 2.3 MB in total, and <code>mem.py:17</code> is the list holding them all. Think of a print shop that stacks all 20,000 receipts on the counter before feeding them to the printer, versus one that hands each receipt to the printer as soon as it is written: the same receipts, but one needs a very big counter. Processing one item at a time is the idea behind generators (<a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>).</p>
  <p>To hunt a memory <em>leak</em>, memory that keeps growing in a long-running program, take two snapshots some time apart and compare them with <code>snap2.compare_to(snap1, "lineno")</code>, which lists the lines whose memory grew. Know the tool's limits: tracemalloc sees only memory allocated through Python, so some C libraries are invisible to it, and tracing slows the program down while it is on. For the whole process's memory use there are other tools (<code>psutil</code>, memray). <code>sys.getsizeof(obj)</code> gives the size of one object, but only shallowly, not counting the objects it refers to.</p>

  <h2 id="pdg-log"><span class="num">08</span>Logging Basics</h2>
  <p>Debuggers and profilers need someone sitting at the keyboard. In production, a program runs unattended: the till runs all day, the nightly report runs at 2 a.m. When something goes wrong, the only evidence of what happened is whatever the program wrote down while it was running. If it used <code>print</code>, that record has no times, no indication of how serious each message is, no note of which part of the program wrote it, and no way to keep full detail in a file while showing only problems on the screen.</p>
  <p>The <code>logging</code> module is <code>print</code> done properly. Each message, called a <strong>log record</strong>, gets a <strong>level</strong> saying how serious it is, a timestamp, and the name of the part of the program that wrote it. You decide in one place, separately from the code that writes the messages, which levels to keep and where each one goes. A hospital's patient chart is a good comparison: every note records the time, who wrote it and how urgent it is; the night nurse reads only the urgent notes, the specialist reads everything, and nothing is lost. <code>print</code> is shouting down the corridor: everyone hears everything, and nothing is kept.</p>
  <div class="fx" data-lang="py">import logging
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
06:15:58 INFO    till: billed Asha 184
06:15:58 WARNING till: qty '2' for Dev is text, converting
06:15:58 ERROR   till: payment for Chen failed</div>
  <p><code>logging.basicConfig</code> sets up logging in one call: here it sets the threshold to INFO and chooses a format showing the time, the level and the logger's name. <code>logging.getLogger("till")</code> returns a <strong>logger</strong>, the object your code sends messages to, named "till". Compare the output lines. The <code>print</code> line came out bare. Each log line carries the time, the level and the name. And the DEBUG message did not appear at all, because DEBUG is below the INFO threshold. Change one argument to <code>level=logging.DEBUG</code> and it appears, without touching any of the code that logs. That is the core benefit: detail can be switched on and off from one place.</p>
  <table class="tbl">
    <tr><th>Level (value)</th><th>Meaning</th><th>At the till</th></tr>
    <tr><td>DEBUG (10)</td><td>Detail useful only to developers</td><td>discount check: sub=195</td></tr>
    <tr><td>INFO (20)</td><td>Normal milestones</td><td>billed Asha 184; report for 3 customers</td></tr>
    <tr><td>WARNING (30)</td><td>Something unexpected, but handled</td><td>qty '2' is text, converting; gateway slow</td></tr>
    <tr><td>ERROR (40)</td><td>An operation failed</td><td>payment for Chen failed</td></tr>
    <tr><td>CRITICAL (50)</td><td>The program may not be able to continue</td><td>database unreachable, till closing</td></tr>
  </table>
  <p>Messages are written with one method per level: <code>log.debug</code>, <code>log.info</code>, <code>log.warning</code>, <code>log.error</code>, <code>log.critical</code>. Notice that the examples pass values as separate arguments, <code>log.info("billed %s %d", "Asha", 184)</code>, instead of building the string first with an f-string; the next section shows why. Without any configuration at all, Python's logging shows only WARNING and above, in a bare <code>LEVEL:name:message</code> format; the interview questions include a puzzle about exactly that.</p>

  <h2 id="pdg-handlers"><span class="num">09</span>Loggers, Handlers and Formatters</h2>
  <p><code>basicConfig</code> is fine for a script, but real programs need different rules for different destinations: the screen should show only warnings and errors, so the person at the till is not flooded, while a file should keep everything, so last night's problem can be investigated this morning. Three kinds of objects make this possible. A <strong>logger</strong> is what your code calls, and loggers are named with dots like modules: <code>till.payments</code> is a child of <code>till</code>. A <strong>handler</strong> is a destination, such as the screen or a file, with its own level. A <strong>formatter</strong> decides how a record looks when a handler writes it. Records from a child logger travel up to the handlers of its parent loggers, which is called <strong>propagation</strong>.</p>
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
  </svg><figcaption>Follow a record from left to right: it starts at a child logger, propagates up to "till", and is then offered to each handler, which applies its own level and format.</figcaption></figure>
  <p>The figure is the setup we are about to build. On the left are two modules' loggers, <code>till.payments</code> and <code>till.report</code>; neither has handlers of its own. Their records flow up to the parent logger <code>till</code>, whose level of DEBUG lets everything through. From there each record is offered to two handlers: the screen handler accepts only WARNING and above and uses a short format, while the file handler accepts everything and adds the time and the source line. Here are the two modules:</p>
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
  <p><code>log.exception(...)</code> deserves attention. Called inside an <code>except</code> block, it logs at ERROR level <em>and</em> attaches the full traceback of the exception being handled. Now the configuration, written once, at the program's entry point:</p>
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
  File "~/chai/payments.py", line 8, in take_payment
    raise ConnectionError("gateway unreachable")   # the outside world fails
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
ConnectionError: gateway unreachable
total: 310
--- till.log ---
06:15:58 DEBUG till.payments payments.py:6 charging Chen Rs 52
06:15:58 ERROR till.payments payments.py:10 payment failed for Chen (Rs 52)
Traceback (most recent call last):
  File "~/chai/payments.py", line 8, in take_payment
    raise ConnectionError("gateway unreachable")   # the outside world fails
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
ConnectionError: gateway unreachable
06:15:58 INFO till.report report_log.py:6 report for 3 customers
06:15:58 DEBUG till.report report_log.py:7 bills={'Asha': 184, 'Ben': 74, 'Chen': 52}</div>
  <p>Trace the four records. "charging Chen Rs 52" is DEBUG from <code>till.payments</code>: it went to the file but not the screen. "payment failed …" is ERROR: it went to both, and in both places it carries the full traceback, so the log file says exactly what failed and on which line. "report for 3 customers" is INFO and the bills dictionary is DEBUG: both went only to the file. Neither child logger had a handler of its own; their records propagated up to <code>till</code> and were filtered again by each handler. The file format's <code>filename:lineno</code> field points at the line that wrote each message.</p>
  <p>The hierarchy also lets you tune one part of a program without touching the others, and it explains the most common logging bug:</p>
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
  <p>Setting the level of <code>till.report</code> to WARNING silenced its INFO and DEBUG messages at the source, so the file stayed empty. Then the setup function was called a second time, which attached a <em>second</em> pair of handlers to <code>till</code>, and from then on every message appears twice. The rule: configure logging exactly once, at the program's entry point. Library modules should only ever call <code>logging.getLogger(__name__)</code>, which names the logger after the module, and never add handlers themselves. (Larger programs often describe the whole setup as a dictionary passed to <code>logging.config.dictConfig</code>.)</p>
  <p>Why pass values as arguments, <code>log.debug("bills=%r", bills)</code>, rather than an f-string? Because of when the message text gets built:</p>
  <div class="fx" data-lang="py">import logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("till")

class Day:
    def __str__(self):
        print("   (building a 20,000-line summary...)")
        return "&lt;day summary&gt;"

log.debug(f"day: {Day()}")       # f-string: built BEFORE logging sees it, then dropped
log.debug("day: %s", Day())      # %-style args: logging drops the record first, never builds it
print("done")</div>
  <div class="fx" data-lang="text">   (building a 20,000-line summary...)
done</div>
  <p>Both DEBUG messages were dropped, since the threshold is INFO. But the f-string version still paid the cost of building its text, because Python evaluates an f-string before the call even begins. With <code>%s</code>-style arguments, logging checks the level first and only builds the text if the record will actually be kept. For an expensive summary in a loop, that difference is real.</p>
  <p>In production, logs usually go to a search tool, and searching is far easier when each log line is a JSON object with named fields, so you can ask for "amount over 150 from the payments logger". A custom formatter does it, with extra fields passed through <code>extra=</code>:</p>
  <div class="fx" data-lang="py">import json, logging, sys

class JsonFormatter(logging.Formatter):
    def format(self, record):
        doc = {"ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
               "level": record.levelname, "logger": record.name,
               "msg": record.getMessage()}
        doc.update(getattr(record, "ctx", {}))      # extra fields passed with extra=
        return json.dumps(doc)

h = logging.StreamHandler(sys.stdout)
h.setFormatter(JsonFormatter())
log = logging.getLogger("till.payments")
log.addHandler(h)
log.setLevel(logging.INFO)

log.info("payment ok", extra={"ctx": {"customer": "Asha", "amount": 184, "latency_ms": 412}})</div>
  <div class="fx" data-lang="text">{"ts": "2026-11-03T06:15:58", "level": "INFO", "logger": "till.payments", "msg": "payment ok", "customer": "Asha", "amount": 184, "latency_ms": 412}</div>
  <p>Finally, a warning that is supposed to appear is behaviour worth testing. Here is the proper fix for Dev's crash from the first section: convert text quantities when the order comes in, and leave a WARNING in the log so someone can fix the web form. pytest's built-in <code>caplog</code> fixture captures log records during a test:</p>
  <div class="fx" data-lang="py"># bill_log.py
import logging
from till import bill
log = logging.getLogger("till")

def bill_logged(customer, lines):
    """Convert quantities typed as text into ints, and leave a warning in the log."""
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
  <p>The first test checks the result (2 × 30 = 60, plus 5% = 63), the message and its level; the second checks that a clean order logs nothing. Two more rules about what goes into logs: never use <code>log.error(str(e))</code> inside an <code>except</code> block, because it throws away the traceback (use <code>log.exception</code>), and never log card numbers, tokens or passwords.</p>
  <table class="tbl">
    <tr><th></th><th>print()</th><th>logging</th></tr>
    <tr><td>Severity and filtering</td><td>None</td><td>Levels, per logger and per handler</td></tr>
    <tr><td>Context</td><td>Only what you type</td><td>Time, logger name, file and line, process, thread</td></tr>
    <tr><td>Destinations</td><td>Standard output</td><td>Screen, files, rotating files, log services, JSON</td></tr>
    <tr><td>Tracebacks</td><td>Manual</td><td><code>log.exception</code></td></tr>
    <tr><td>Turning detail down</td><td>Edit the code</td><td>Change one level</td></tr>
  </table>

  <h2 id="pdg-method"><span class="num">10</span>A Systematic Debugging Method</h2>
  <p>Random poking at code can make a wrong number change, but it cannot prove that the fix is right, that nothing else broke, or that the bug will not return next month. A doctor works methodically: confirm the symptom, find which organ is involved, form a diagnosis and order a test that could prove it wrong, treat, and book a follow-up. Debugging has the same five steps, and we now apply them to Chen's complaint: "my bill was ₹52, but the board says halves round up, so it should be ₹53".</p>
  <p><strong>Step 1: reproduce.</strong> Turn the complaint into the smallest automatic check that fails. A test is better than a manual check because it can be re-run in a fraction of a second after every attempted fix:</p>
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

tests/test_rounding.py:6: AssertionError
=========================== short test summary info ============================
FAILED tests/test_rounding.py::test_chen_rounds_half_up - AssertionError: ass...
1 failed in 0.02s</div>
  <p>The bug is reproduced, reliably, every time.</p>
  <p><strong>Step 2: isolate.</strong> Find the smallest piece of code that produces the wrong value. The pdb session already did this: the subtotal (50), the discount (0), the amount after discount (50) and the total with tax (52.5) were all correct, and <code>round(52.5)</code> gave 52. The bug lives in one expression. For bugs that appeared after some change, <code>git bisect</code> isolates the guilty commit by repeatedly halving the range of suspects (see <a class="xref" data-note="se_git">Git</a>); for bugs that appear only with some inputs, you can halve the input in the same way.</p>
  <p><strong>Step 3: hypothesise, then test the hypothesis.</strong> The hypothesis: Python's <code>round</code> sends an exact half to the nearest <em>even</em> number rather than always up. A good hypothesis makes predictions that could turn out false: 0.5 should give 0, 1.5 should give 2, 2.5 should give 2, 52.5 should give 52 and 53.5 should give 54. We also need to know, for the fix, whether floats hold these amounts exactly:</p>
  <div class="fx" data-lang="py">from decimal import Decimal
print([round(x) for x in (0.5, 1.5, 2.5, 52.5, 53.5)])
print(Decimal(52.5), Decimal(184.275))
print(Decimal(str(184.275)))</div>
  <div class="fx" data-lang="text">[0, 2, 2, 52, 54]
52.5 184.275000000000005684341886080801486968994140625
184.275</div>
  <p>Every prediction held, so the hypothesis is confirmed. The second line gives a warning for the fix: 52.5 happens to be stored exactly in binary, but 184.275 (Asha's total) is really 184.27500000000000568…, so converting a float straight to <code>Decimal</code> carries that tiny error along. Building the <code>Decimal</code> from the float's short text form, <code>Decimal(str(x))</code>, gives exactly 184.275.</p>
  <p><strong>Step 4: fix, with the smallest change that matches the rule.</strong> The <code>decimal</code> module's <code>quantize</code> method rounds to a given step using a rounding rule you choose, and <code>ROUND_HALF_UP</code> is the board's rule. In <code>till.py</code>, the last line of <code>bill</code> becomes <code>return to_rupees(total)</code>, and a new function does the rounding:</p>
  <div class="fx" data-lang="py">from decimal import Decimal, ROUND_HALF_UP      # at the top of till.py

def to_rupees(amount):
    """Round to whole rupees with halves going UP (the board's rule),
    not Python's round-half-to-even."""
    return int(Decimal(str(amount)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))</div>
  <p><strong>Step 5: add tests and run the whole suite.</strong> Extend the regression test with the cases from the hypothesis, so the rounding rule itself is pinned down, not just Chen's order:</p>
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
  <div class="fx" data-lang="text">$ pytest -q --tb=no -rf tests
FF........                                                               [100%]
=========================== short test summary info ============================
FAILED tests/test_bill.py::test_each_bill - AssertionError: assert {'Asha': 1...
FAILED tests/test_bill.py::test_day_total - assert 311 == 310
2 failed, 8 passed in 0.02s</div>
  <p>The new tests pass, and the full run also reports two <em>old</em> tests that fail: they were written before the bug report and still expect Chen to pay 52 and the day's total to be 310. This is the suite doing its job: those tests documented the old behaviour, and the owner has now decided that the behaviour changes. So we update each expectation deliberately, Chen from 52 to 53 and the day total from 310 to 311, rather than deleting the tests:</p>
  <div class="fx" data-lang="text">$ pytest -q tests
..........                                                               [100%]
10 passed in 0.01s</div>
  <p>All green. Without the suite, the rounding change would have silently shifted the daily totals in reports nobody re-checked. The reproduction stays in the suite as a <strong>regression test</strong>, so if anyone ever brings back <code>round</code>, the bug is caught within seconds.</p>
  <table class="tbl">
    <tr><th>Customer</th><th>With GST</th><th><code>round</code> (half to even)</th><th><code>to_rupees</code> (half up)</th></tr>
    <tr><td>Asha</td><td>184.275</td><td>184</td><td>184</td></tr>
    <tr><td>Ben</td><td>73.5</td><td>74</td><td>74</td></tr>
    <tr><td>Chen</td><td>52.5</td><td>52</td><td><b>53</b></td></tr>
    <tr><td>Day total</td><td></td><td>310</td><td><b>311</b></td></tr>
  </table>
  <p>Why does Python round this way at all? Rounding every half up adds a small upward bias: over millions of roundings, totals drift high. Sending halves to the even neighbour rounds up half the time and down half the time, so the errors cancel out, which is why it is the default in Python and in the IEEE floating-point standard. Neither rule is wrong; the bug was a mismatch between Python's rule and the stall's rule. For money, the safest habit is to keep amounts in whole paise or in <code>Decimal</code>, built from strings, never from floats.</p>

  <h2 id="pdg-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>With tracebacks, the classic mistakes are reading from the top, where the first frames are usually your own entry script or library internals and say nothing about the cause, and "fixing" the line that exploded. Wrapping <code>if qty &lt; 0</code> in <code>try/except: pass</code> would have hidden Dev's bad data and moved the failure somewhere harder to find; the right fix was converting the input where it entered.</p>
  <p>With print debugging, the mistakes are printing values without their types (<code>2</code> and <code>"2"</code> look identical; use <code>!r</code>), doing round after round of edit-print-rerun when one <code>breakpoint()</code> or <code>python -m pdb</code> session would answer everything, and leaving prints or a <code>breakpoint()</code> in committed code, where the breakpoint freezes a production job waiting for keyboard input.</p>
  <p>With performance, the big mistake is optimising by guess: rewriting <code>bill</code> would have saved at most 0.09 of 1.8 seconds, while the profiler pointed at one line worth 90%. Close behind are timing something once, or with <code>time.time()</code>, or averaging instead of taking the minimum; and comparing a fast version without first checking it gives the same answer.</p>
  <p>With logging, the mistakes are <code>log.error(str(e))</code>, which loses the traceback (use <code>log.exception</code>); configuring handlers twice or inside library modules, which prints every line twice; f-strings in debug messages, which pay the formatting cost even when the message is dropped; and logging secrets. And with the method as a whole, the most expensive mistake is fixing a bug without first reproducing it as a test: you cannot tell whether the fix worked, and the same bug can return unnoticed.</p>

  <h2 id="pdg-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Tracebacks and print</h3>
  <ul>
    <li>"Most recent call last": read <b>bottom up</b>: exception type and message (what) → last frame (where) → frames above (who called).</li>
    <li><b>Frame</b>: one active call with its local variables; the frames form the <b>call stack</b>.</li>
    <li>"During handling of the above exception…": error inside an <code>except</code>. "…was the direct cause…": <code>raise … from e</code>.</li>
    <li>Fix where the bad value entered, not where it exploded. Print with <code>f"{qty=!r}"</code> to see types.</li>
  </ul>
  <h3>pdb</h3>
  <table class="tbl">
    <tr><th>Cmd</th><th>Does</th><th>Cmd</th><th>Does</th></tr>
    <tr><td><code>n</code></td><td>Next line (step over)</td><td><code>p</code> / <code>pp</code></td><td>Print / pretty-print</td></tr>
    <tr><td><code>s</code></td><td>Step into</td><td><code>l</code> / <code>ll</code></td><td>List / whole function</td></tr>
    <tr><td><code>r</code></td><td>Run to return (step out)</td><td><code>w</code></td><td>Call stack</td></tr>
    <tr><td><code>c</code></td><td>Continue</td><td><code>u</code> / <code>d</code></td><td>Up / down a frame</td></tr>
    <tr><td><code>b file:line[, cond]</code></td><td>Breakpoint</td><td><code>until</code> · <code>interact</code> · <code>q</code></td><td>Leave loop · REPL · quit</td></tr>
  </table>
  <ul>
    <li><code>breakpoint()</code> = <code>import pdb; pdb.set_trace()</code>; <code>PYTHONBREAKPOINT=0</code> disables all.</li>
    <li>Post-mortem: <code>python -m pdb script.py</code> then <code>c</code>; <code>pytest --pdb</code> (or <code>--trace</code>); <code>%debug</code> in Jupyter; <code>pdb.pm()</code>.</li>
  </ul>
  <h3>Timing and profiling</h3>
  <ul>
    <li><code>time.perf_counter()</code> for intervals. Double n: time ×2 → O(n); ×4 → O(n²).</li>
    <li><code>min(timeit.repeat(stmt, number=N, repeat=R, globals=g)) / N</code>; take the <b>minimum</b>. CLI: <code>python -m timeit -s "setup" "stmt"</code>.</li>
    <li>List <code>in</code> is O(n); set and dict <code>in</code> are O(1) on average.</li>
    <li>cProfile: <b>ncalls</b>; <b>tottime</b> = own lines; <b>cumtime</b> = own + callees. High tottime → the function itself; high cumtime, low tottime → its callees. Then line_profiler.</li>
    <li>Work → right (tests) → profile → fix the top hotspot → check same results → re-profile.</li>
    <li>Deterministic profiler (cProfile) vs sampling profiler (py-spy, low overhead, attaches to running programs).</li>
  </ul>
  <div class="fx" data-lang="py">import cProfile, pstats, timeit, tracemalloc

with cProfile.Profile() as pr:
    work()
pstats.Stats(pr).sort_stats("cumulative").print_stats(10)

best = min(timeit.repeat("x in s", globals=globals(), number=1000, repeat=5)) / 1000

tracemalloc.start()
work()
current, peak = tracemalloc.get_traced_memory()
top = tracemalloc.take_snapshot().statistics("lineno")[:3]</div>
  <h3>Memory</h3>
  <ul>
    <li>The peak is what kills small machines; process items one at a time instead of building full lists.</li>
    <li>Leaks: <code>snap2.compare_to(snap1, "lineno")</code>. Whole-process view: psutil, memray. <code>sys.getsizeof</code> is shallow.</li>
  </ul>
  <h3>logging</h3>
  <table class="tbl">
    <tr><th>Level</th><th>Value</th><th>Use</th></tr>
    <tr><td>DEBUG</td><td>10</td><td>Developer detail</td></tr>
    <tr><td>INFO</td><td>20</td><td>Normal milestones</td></tr>
    <tr><td>WARNING</td><td>30</td><td>Unexpected but handled (default threshold)</td></tr>
    <tr><td>ERROR</td><td>40</td><td>An operation failed</td></tr>
    <tr><td>CRITICAL</td><td>50</td><td>Program may not continue</td></tr>
  </table>
  <ul>
    <li><b>Logger</b> (dotted names, <code>getLogger(__name__)</code>) → records <b>propagate</b> to ancestors → each <b>handler</b> (destination + own level) → <b>formatter</b> (layout).</li>
    <li><code>log.exception(msg)</code> inside <code>except</code> = ERROR + traceback.</li>
    <li>Lazy arguments: <code>log.debug("x=%s", x)</code>. Configure once at the entry point; libraries only get loggers.</li>
    <li>JSON logs with <code>extra=</code>; test logs with <code>caplog</code>.</li>
  </ul>
  <h3>Method</h3>
  <ul>
    <li>Reproduce (failing test) → isolate (pdb, bisect) → hypothesise with predictions that could fail → smallest fix → keep the test, run the suite.</li>
    <li><code>round()</code> rounds halves to even: 0.5→0, 1.5→2, 2.5→2, 52.5→52. Half up: <code>Decimal(str(x)).quantize(Decimal("1"), rounding=ROUND_HALF_UP)</code>.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Reading tracebacks top-down; fixing where it exploded; <code>except: pass</code> destroys the evidence.</li>
    <li>Forgotten <code>breakpoint()</code> hangs a production job.</li>
    <li>Optimising by guess; single timings; profiler overhead inflates absolute times.</li>
    <li><code>log.error(str(e))</code> loses the traceback; configuring twice doubles every line.</li>
    <li><code>Decimal(184.275)</code> carries the float's error; build from strings.</li>
  </ul>

  <h2 id="pdg-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a Python traceback?</summary><div class="qa-body">From the bottom. The last line gives the exception type and message, what went wrong; the frame just above shows where it was raised, with file, line, function and source; the frames above that show the chain of calls that led there, oldest at the top. The real cause is often where a bad value entered, which may be several frames above where it exploded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between "During handling of the above exception, another exception occurred" and "The above exception was the direct cause of the following exception"?</summary><div class="qa-body">The first is implicit chaining: a new exception was raised inside an <code>except</code> block, often a bug in the handler, and the original is kept in <code>__context__</code>. The second is explicit chaining with <code>raise NewError(...) from e</code>, stored in <code>__cause__</code>, used to translate a low-level error into a domain error without losing the original. <code>raise ... from None</code> hides the chain.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>n</code>, <code>s</code>, <code>r</code> and <code>c</code> in pdb?</summary><div class="qa-body"><code>n</code> runs the current line, stepping over any calls on it; <code>s</code> steps into a call on the current line; <code>r</code> runs until the current function returns; <code>c</code> continues until the next breakpoint or the end. Other essentials are <code>p</code> to print, <code>ll</code> to list the function, <code>w</code> for the stack, <code>u</code>/<code>d</code> to move between frames, <code>b</code> to set breakpoints and <code>q</code> to quit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>breakpoint()</code> versus <code>import pdb; pdb.set_trace()</code>?</summary><div class="qa-body">They do the same thing by default. <code>breakpoint()</code>, added in Python 3.7, is shorter and controlled by the <code>PYTHONBREAKPOINT</code> environment variable: <code>PYTHONBREAKPOINT=0</code> disables every call, and <code>PYTHONBREAKPOINT=ipdb.set_trace</code> switches to another debugger without changing code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is post-mortem debugging, and how do you start it?</summary><div class="qa-body">Inspecting the stack frames of an exception after it was raised, with all local variables still available. Run <code>python -m pdb script.py</code> and type <code>c</code>; use <code>pytest --pdb</code> for failing tests; <code>%debug</code> in Jupyter; or <code>pdb.pm()</code> in a Python prompt. Use <code>u</code> to walk up to callers. It only works if the exception propagates; <code>except: pass</code> destroys the evidence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use logging instead of print in production code?</summary><div class="qa-body">Logging gives levels that can be filtered without code changes; a timestamp, logger name, file and line on every record; several destinations with different levels, such as warnings on screen and everything in a file; tracebacks through <code>log.exception</code>; and structured output for log search tools. Library code can log without deciding where output goes. <code>print</code> has none of this and cannot be turned down.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><span>What does this print (to standard error)?
  <div class="fx" data-lang="py">import logging
logging.info("a")
logging.warning("b")
log = logging.getLogger("app")
log.debug("c")
log.error("d")</div></span></summary><div class="qa-body"><div class="fx" data-lang="text">WARNING:root:b
ERROR:app:d</div>With no configuration, the root logger's threshold is WARNING, so the INFO and DEBUG messages are dropped. The first module-level call that logs something runs <code>basicConfig()</code> automatically, adding a handler with the format <code>LEVEL:name:message</code>. The <code>app</code> logger has no level of its own, so it uses the root's, and its records propagate to the root's handler.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain loggers, handlers, formatters and propagation.</summary><div class="qa-body">A logger is a named source your code calls, arranged in a dotted hierarchy where <code>app.payments</code> is a child of <code>app</code>; its effective level is its own or its nearest ancestor's. A record that passes the logger's level goes to the logger's handlers and then propagates to its ancestors' handlers. A handler is a destination with its own level; a formatter defines how the record is laid out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Every log line appears twice. Why?</summary><div class="qa-body">Two handlers are receiving each record. Usually logging was configured twice, for example a setup function called again or <code>addHandler</code> run at import time; or a handler was added to both a child logger and an ancestor, so the record is written by the child's handler and again after propagating. Configure once at the entry point, have libraries only call <code>getLogger(__name__)</code>, or set <code>propagate = False</code> on the child.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>log.exception</code> versus <code>log.error</code>? And why <code>log.debug("x=%s", x)</code> rather than an f-string?</summary><div class="qa-body"><code>log.exception(msg)</code> logs at ERROR and appends the current traceback, so it belongs inside an <code>except</code> block; <code>log.error(str(e))</code> loses the traceback. With <code>%s</code>-style arguments, logging checks the level first and only formats the text if the record is kept, while an f-string is built before the call, so expensive string conversions run even when DEBUG is off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find out why a Python program is slow?</summary><div class="qa-body">Measure instead of guessing. Time it with <code>perf_counter</code> and check how the time scales when the input doubles. Profile with cProfile sorted by cumulative time to find the expensive path, look at tottime to find functions whose own code is slow, and use line_profiler on that function to find the line. Fix the top hotspot, confirm the results are unchanged, and profile again. In production, use a sampling profiler such as py-spy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In cProfile output, what are tottime and cumtime?</summary><div class="qa-body">tottime is the time spent in a function's own code, excluding the functions it calls; cumtime includes everything it calls. High cumtime with low tottime means the function is slow only because of what it calls. High tottime means its own lines are slow, for example a membership test on a large list, which never shows as a separate row because <code>in</code> is not a function call, so a line profiler is the next step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why take the minimum of repeated <code>timeit</code> runs, and why <code>perf_counter</code> rather than <code>time.time</code>?</summary><div class="qa-body">Interference from other processes, caches and garbage collection only ever adds time, so the minimum is the best estimate of the code's own cost, while an average mixes in the noise. <code>perf_counter</code> is a monotonic clock with the highest available resolution; <code>time.time</code> is wall-clock time, which can jump when the system clock is adjusted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A pandas pipeline is slow. How would you approach it?</summary><div class="qa-body">Profile first, with <code>%prun</code>, <code>%lprun</code> or cProfile, to find the slow step. Typical culprits are <code>apply</code> with <code>axis=1</code> or Python loops over rows (replace with vectorised column operations), repeated <code>concat</code> inside a loop (collect the pieces, then concatenate once), membership tests against lists (use sets or <code>isin</code>), object-dtype strings (use categoricals), and reading more data than needed. Check the new output equals the old before comparing speed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find a memory leak in a long-running Python service?</summary><div class="qa-body">Confirm the growth with process-level metrics over time. Then take a <code>tracemalloc</code> snapshot, run the workload, take another, and use <code>snap2.compare_to(snap1, "lineno")</code> to see which lines' memory grew. Common causes are unbounded caches or dictionaries keyed by request, global lists that keep growing, references kept alive by closures or listeners, and large objects held by stored tracebacks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>round(2.5)</code> return 2, and how do you round half up?</summary><div class="qa-body">Python's <code>round</code> uses round-half-to-even, banker's rounding: ties go to the even neighbour, so 0.5 gives 0, 1.5 gives 2 and 2.5 gives 2. This avoids an upward bias over many roundings. To round half up, use <code>Decimal(str(x)).quantize(Decimal("1"), rounding=ROUND_HALF_UP)</code>, building the Decimal from a string because <code>Decimal(184.275)</code> carries the float's binary error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe your process for debugging a bug report.</summary><div class="qa-body">Reproduce it reliably, ideally as the smallest failing test. Isolate where the wrong value appears using the traceback, pdb or logs, bisecting inputs or commits if needed. Form a hypothesis with predictions that could fail and check them. Make the smallest fix. Keep the reproduction as a regression test and run the whole suite, deliberately updating any old tests that encoded the wrong behaviour.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>git bisect</code> do?</summary><div class="qa-body">It binary-searches the commit history for the commit that introduced a bug. You mark one known good and one known bad commit; git checks out the midpoint, you test it and mark it good or bad, and the range halves each time, so about log2(N) steps find the culprit among N commits. <code>git bisect run pytest tests/test_rounding.py</code> automates it with a failing test.</div></details>
</main>
`
});
