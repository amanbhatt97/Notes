// notes/python/py_debugging.js — Debugging, Profiling & Logging
Object.assign(TOPIC_CONTENT, {
  "py_debugging": `<main>
<h1>Debugging, Profiling &amp; Logging</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>Debugging, Profiling &amp; Logging</span></div>
  <p class="lead">Tests tell you <em>that</em> something is wrong. This note is about finding out <em>where</em> and <em>why</em>, then <em>why it's slow</em>, then <em>what happened</em> when you weren't watching. All on the Chai Corner till: a crash from a quantity typed as text, Chen charged ₹52 when the board says halves round up (₹53), a daily report that takes 1.7 seconds for 20,000 orders, and a payment failure in production. In order: reading tracebacks, print debugging and its limits, a full <code>pdb</code>/<code>breakpoint()</code> session (shown as a real transcript, run by feeding commands to pdb), post-mortem debugging, timing with <code>time.perf_counter</code> and <code>timeit</code>, <code>cProfile</code> + <code>pstats</code> read line by line, memory with <code>tracemalloc</code>, the <code>logging</code> module (levels, handlers, formatters, the logger hierarchy, <code>logging.exception</code>), and a systematic method (reproduce → isolate → hypothesise → fix → add a test) applied to the rounding bug end to end. Python 3.13; folder paths shortened to <code>~/chai</code>.</p>

  <h2 id="pdg-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 200" width="660">
<defs><marker id="pdg-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="200" y="8" width="260" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="26" text-anchor="middle" font-size="12">Making Code Trustworthy: the map</text><text x="330" y="41" text-anchor="middle" class="tm" font-size="10">does it work? → is it isolated? → where is it broken / slow?</text>
<line x1="270" y1="48" x2="110" y2="86" stroke="currentColor" marker-end="url(#pdg-a0)"/><line x1="330" y1="48" x2="330" y2="86" stroke="currentColor" marker-end="url(#pdg-a0)"/><line x1="390" y1="48" x2="550" y2="86" stroke="currentColor" marker-end="url(#pdg-a0)"/>
<rect x="20" y="88" width="180" height="52" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="110" y="110" text-anchor="middle" font-size="12">Testing with pytest</text><text x="110" y="128" text-anchor="middle" class="tm" font-size="10">tests, fixtures, TDD</text>
<line x1="200" y1="114" x2="238" y2="114" stroke="currentColor" marker-end="url(#pdg-a0)"/>
<rect x="240" y="88" width="180" height="52" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="110" text-anchor="middle" font-size="12">Mocks &amp; Test Doubles</text><text x="330" y="128" text-anchor="middle" class="tm" font-size="10">fake the payment gateway</text>
<line x1="420" y1="114" x2="458" y2="114" stroke="currentColor" marker-end="url(#pdg-a0)"/>
<rect x="460" y="88" width="180" height="52" rx="8" class="fg sg" stroke-width="3"/><text x="550" y="106" text-anchor="middle" font-size="12" font-weight="700">Debugging, Profiling</text><text x="550" y="121" text-anchor="middle" font-size="12" font-weight="700">&amp; Logging</text><text x="550" y="136" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<text x="330" y="172" text-anchor="middle" class="tm" font-size="10.5">stands on: Exceptions (tracebacks) · Functions (call stack) · Files (log files)</text>
<text x="330" y="190" text-anchor="middle" class="tm" font-size="10.5">leads to: production services, monitoring (MLOps), faster data code</text>
</svg><figcaption>The last note of the group: from a red test (or a customer complaint) to the cause, the slow line, and the production record.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_pytest">Testing with pytest</a> and <a class="xref" data-note="py_mocking">Mocks</a></b><span>We can detect wrong behaviour quickly and in isolation: <code>assert bill(chen) == 53</code> goes red. Left open: <em>where</em> in the code the wrong number is made, <em>why</em>, why the daily report is slow, and what happened in production where there is no test. Uses <a class="xref" data-note="py_exceptions">Exceptions</a> (tracebacks are exceptions printed), <a class="xref" data-note="py_functions">Functions</a> (the call stack) and <a class="xref" data-note="py_files">Files</a> (log files).</span></li>
    <li><b>This note adds: seeing inside a running program</b><span>Tracebacks and pdb to see state at a moment; profilers to see where time and memory go; logging to keep a record you can read later; and a method that ends every fix with a regression test.</span></li>
    <li><b>Leads to: running code for real</b><span>Logs and profiles are how services are watched in production (<a class="xref" data-note="mlops_deploy">MLOps &amp; Deployment</a>); the regression tests join the suite that CI runs on every push (<a class="xref" data-note="se_git">Git</a>).</span></li>
  </ol>

  <h2 id="pdg-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Reading a traceback</b><span>Q: the report crashed, so where and why? → Read from the bottom: <code>TypeError: '&lt;' not supported between 'str' and 'int'</code> in <code>bill</code>, called from <code>daily_report</code>, for Dev's qty <code>"2"</code>. But Chen's ₹52 doesn't crash at all…</span></li>
    <li><b>print debugging</b><span>Q: how do we see values when nothing crashes? → Temporary prints show 50 → 50 → 52.5 → 52. But each question needs an edit and a re-run, and prints get left behind…</span></li>
    <li><b>pdb and breakpoint()</b><span>Q: can we pause and ask anything, without editing for each question? → <code>breakpoint()</code>; <code>n</code>, <code>s</code>, <code>r</code>, <code>p</code>, <code>ll</code>, <code>w</code>, <code>c</code>; found <code>round(52.5) = 52</code> and <code>round(0.5), round(1.5), round(2.5) = 0, 2, 2</code>. But we had to know where to pause…</span></li>
    <li><b>Post-mortem</b><span>Q: the crash already happened, so can we look at it after the fact? → <code>python -m pdb</code>, <code>pytest --pdb</code>: land in the failing frame, <code>u</code> up to the caller: customer Dev. Now the code is right but slow…</span></li>
    <li><b>Timing</b><span>Q: how slow, and how does it grow? → <code>perf_counter</code>: 1.67 s for 20,000 orders; 2× orders → 4× time. <code>timeit</code> for small statements. But which part is slow?</span></li>
    <li><b>cProfile + pstats</b><span>Q: which function, which line? → <code>daily_report</code>'s own time is 2.0 of 2.1 s; line_profiler: 87.7% on <code>customer not in customers</code> (a list). Set → 20 ms. Time is fixed; what about memory?</span></li>
    <li><b>tracemalloc</b><span>Q: what holds the memory? → Building all 20,000 receipts at once peaks at 5.71 MB; streaming them, 0.02 MB. All of this needs us at the keyboard. In production we aren't…</span></li>
    <li><b>logging</b><span>Q: what happened at 9 p.m. when the gateway failed? → Levels, handlers, formatters, the <code>till.*</code> logger hierarchy, <code>logging.exception</code> with traceback, JSON lines. Tools in hand: how do we use them in order?</span></li>
    <li><b>A systematic method</b><span>Q: how do we fix a bug so it stays fixed? → Reproduce (failing test) → isolate (pdb) → hypothesise (half-to-even) → fix (<code>Decimal</code>, half up) → add test; the suite shows 4 old tests that encoded the old rule. Chen pays ₹53.</span></li>
  </ol>

  <h2 id="pdg-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Debugging, Profiling &amp; Logging</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Tracebacks</div>
        <ul>
          <li>Read <b>bottom up</b>: type + message, then the frame, then callers</li>
          <li>"most recent call last" = the crash is at the bottom</li>
          <li>Fix where the bad value <b>entered</b> (Dev's form), not only where it exploded</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">pdb</div>
        <ul>
          <li><code>breakpoint()</code>; <code>PYTHONBREAKPOINT=0</code> disables</li>
          <li><code>n</code> next · <code>s</code> step in · <code>r</code> return · <code>c</code> continue</li>
          <li><code>p</code> / <code>pp</code> · <code>ll</code> · <code>w</code> · <code>u</code>/<code>d</code> · <code>b</code> · <code>q</code></li>
          <li><b>Post-mortem</b>: <code>python -m pdb</code>, <code>pytest --pdb</code>, <code>%debug</code></li>
          <li>💡 pausing a match replay frame by frame</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Timing</div>
        <ul>
          <li><code>time.perf_counter()</code> — stopwatch</li>
          <li>Double n, time ×4 → O(n²)</li>
          <li><code>timeit.repeat</code> — take the <b>min</b></li>
          <li>list <code>in</code>: 84,392 ns · set <code>in</code>: 15 ns</li>
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
          <li>Peak 5.71 MB (list) vs 0.02 MB (stream)</li>
          <li>statistics("lineno") → which line allocates</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging</div>
        <ul>
          <li>DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL</li>
          <li><b>logger → handlers → formatter</b></li>
          <li><code>getLogger("till.payments")</code> → parent <code>till</code></li>
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
      <div class="rm-item rm-done" data-target="pdg-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-tb"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Reading a Traceback</span><span class="rm-sub">Dev's qty "2"</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-print"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">print Debugging</span><span class="rm-sub">And its limits</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-pdb"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">pdb and breakpoint()</span><span class="rm-sub">A full session</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-pm"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Post-mortem Debugging</span><span class="rm-sub">After the crash</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-time"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Timing</span><span class="rm-sub">perf_counter, timeit</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-prof"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">cProfile and pstats</span><span class="rm-sub">Which function, which line</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-mem"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Memory with tracemalloc</span><span class="rm-sub">Peak and who holds it</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-log"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Logging</span><span class="rm-sub">Levels, handlers, hierarchy</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-method"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">A Systematic Method</span><span class="rm-sub">The rounding bug, end to end</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Diagram + table</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Guessing, print, lost tracebacks</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pdg-tb"><span class="num">01</span>Reading a Traceback</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The end-of-day report just crashed with a wall of text. Which line of that text tells us what went wrong, which tells us where, and which tells us how we got there?</p>
  </div>
  <h3>The running example</h3>
  <p>The till (same rules as in <a class="xref" data-note="py_pytest">Testing with pytest</a>, with <code>bill</code> written one step per line so we can step through it later), and a daily report:</p>
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
  <p>The traceback tells us <em>what</em> and <em>where</em>, but not <em>which order</em> had the text quantity; that value isn't printed. We can guess (Dev's form), or look: sections 03–04 show how to look. The right fix is where the bad value <em>entered</em>: convert the form's text to <code>int</code> when the order is created (<a class="xref" data-note="py_exceptions">Exceptions</a> shows validating input), not deep inside <code>bill</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A parcel's tracking history: the newest scan ("damaged at Pune hub") is what happened; the older scans above it show the route it took to get there. You read the newest line first.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>traceback</strong> is the printed call stack of an uncaught exception: one entry (frame) per active call, oldest at the top, ending with the exception's type and message. When an exception is raised while handling another, Python prints both, joined by "During handling of the above exception…" (or "The above exception was the direct cause…" for <code>raise … from …</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Reading from the top: the first frames are usually your own entry script or library internals and say nothing about the cause. And don't "fix" the line that exploded by wrapping it in <code>try/except: pass</code>; that hides the bad data and moves the crash somewhere worse.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: print Debugging.</b> A crash at least leaves a traceback. Chen's bill comes out ₹52 when the board's rule ("halves round up") says ₹53, and nothing crashes. How do we see what the code is computing?</div>

  <h2 id="pdg-print"><span class="num">02</span>print Debugging and Its Limits</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A wrong answer with no crash leaves no traceback. How do we see the values flowing through <code>bill</code> for Chen's order?</p>
  </div>
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
    <li>A print has no time, no severity and no source, and can't be switched off without editing code. That last point is why logging (section 08) exists.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Debugging with prints is like asking a friend to text you the score, but only the scores you thought to ask about in advance. To ask anything new, you have to set up another text.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>print debugging</strong>: inserting temporary output statements to observe values. Quick for one or two values; costly when questions multiply, and it changes the program's output.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Leaving debug prints in committed code, and printing a value without its type: <code>print(qty)</code> shows <code>2</code> for both the int and the string <code>"2"</code> (Dev's bug). Use <code>print(repr(qty))</code> or <code>print(f"{qty=!r}")</code>, which shows <code>qty='2'</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: pdb and breakpoint().</b> We want to pause <code>bill</code> at any line, ask any question (including "what is <code>round(53.5)</code>?"), and step forward, without editing code for each question.</div>

  <h2 id="pdg-pdb"><span class="num">03</span>pdb and breakpoint()</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Prints show only what we decided to print before running. Can we stop the program at a line, look at every variable, try expressions, and step forward one line or into a call?</p>
  </div>
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
  <p>One session answered every question, including ones we only thought of while paused (the <code>round</code> experiments). The cause is located: <code>round</code> uses "round half to even" (banker's rounding), so 52.5 goes down to 52. Section 09 fixes it.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Post-mortem Debugging.</b> A breakpoint needs us to guess <em>where</em> to stop before running. For Dev's crash we don't know which order failed, and the crash has already happened. Can we inspect a program <em>after</em> it crashed?</div>

  <h2 id="pdg-pm"><span class="num">04</span>Post-mortem Debugging</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The traceback in section 01 said "<code>qty</code> is a str, in <code>bill</code>, called from <code>daily_report</code>", but not which customer or what the order looked like. Can we open the crashed program's frames and look at their variables?</p>
  </div>
  <p><strong>Post-mortem</strong> debugging opens pdb at the frame where an uncaught exception was raised, with every variable still alive. Three common ways in: <code>python -m pdb script.py</code> (run under pdb; on a crash it enters post-mortem), <code>pytest --pdb</code> (open pdb at each failing test), and <code>%debug</code> in Jupyter after a cell fails (or <code>pdb.pm()</code> in a REPL).</p>
  <div class="fx" data-lang="text">$ python3 -m pdb crash.py
&gt; ~/chai/crash.py(1)&lt;module&gt;()
-&gt; from report import daily_report
(Pdb) c
Traceback (most recent call last):
  ...                                   (the traceback from section 01, plus pdb's own frames)
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
  <div class="bridge"><b>What this still can't tell us → next: Timing.</b> With Dev's quantity converted at the form, the report runs. But on a festival day with 20,000 orders the owner waits seconds for it. How slow is it exactly, and how does it grow with the number of orders?</div>

  <h2 id="pdg-time"><span class="num">05</span>Timing: perf_counter and timeit</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"It feels slow" is not a number. How long does <code>daily_report</code> take, how does that grow as orders grow, and how do we time a tiny piece of code reliably?</p>
  </div>
  <p>To get a realistic busy day we generate orders with a seeded random generator (same day every run; seeds were explained in <a class="xref" data-note="py_pytest">Testing</a>):</p>
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
  <p>A list check walks the list item by item (about 12,600 comparisons for a new customer); a set check is one hash lookup (sets are explained in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>). 84 µs × 20,000 orders ≈ 1.7 s: that would explain the whole report. But that's still a hypothesis; the profiler (next) confirms it. From the shell, <code>python -m timeit</code> does the same:</p>
  <div class="fx" data-lang="text">$ python3 -m timeit -s "from till import bill; o=[('samosa', 2, 15), ('vada pav', 1, 20)]" "bill(o)"
500000 loops, best of 5: 678 nsec per loop</div>
  <p><code>-s</code> is setup (run once, not timed). One <code>bill</code> takes under a microsecond, so 20,000 bills cost about 14 ms: <code>bill</code> is not the problem.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Timing a 100 m sprint once with a hand stopwatch versus taking the best of five electronically timed runs. The best run is closest to the runner's true speed; slow runs include stumbles.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>time.perf_counter()</code>: a monotonic clock with the highest available resolution, for measuring intervals. <code>timeit.repeat(stmt, setup, number, repeat, globals)</code>: run <code>stmt</code> <code>number</code> times, <code>repeat</code> times, return the totals. <strong>Complexity</strong> (O(n), O(n²)) describes how time grows with input size.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Using <code>time.time()</code> (wall clock; can jump when the system clock is adjusted), timing once, timing setup together with the work, or averaging instead of taking the minimum. In Jupyter, <code>%timeit</code> handles all of this for you.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: cProfile and pstats.</b> We timed the whole report and guessed at one line. Guesses about performance are usually wrong. Which function, and which line, really takes the time?</div>

  <h2 id="pdg-prof"><span class="num">06</span>cProfile and pstats</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The report takes 1.7 s. Is it <code>bill</code> (called 20,000 times), the item counting, or the customer check? We want a measured breakdown, not a guess.</p>
  </div>
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
  <p>Line 10, <code>customer not in customers</code>, takes 87.7% of the time. The list grows to 12,598 names, and each check scans it. The fix is the set from section 05: <code>customers = set()</code> and <code>customers.add(customer)</code> (a set ignores duplicates by itself).</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Memory with tracemalloc.</b> Time is fixed. The owner also wants every customer's receipt printed at closing, and the old till PC has little memory. How much memory does printing 20,000 receipts take, and which line holds it?</div>

  <h2 id="pdg-mem"><span class="num">07</span>Memory with tracemalloc</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A program can be fast and still run out of memory. How do we measure how much memory a piece of code allocates at its peak, and which line is responsible?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Logging.</b> Every tool so far needs us at the keyboard, running the program. At 9 p.m. on a festival night a payment failed and nobody was watching. What did the till record about it?</div>

  <h2 id="pdg-log"><span class="num">08</span>Logging: What Happened in Production</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>You can't attach pdb to last night. What you have is whatever the program wrote down while it ran. If it used <code>print</code>, there is no time, no severity, no source, and no way to keep details in a file while showing only problems on screen. What should it have done instead?</p>
  </div>
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
  <p>This is also the fix for Dev's crash from section 01: convert at the boundary and leave a WARNING in the log (2 × 30 = 60, +5% = 63).</p>
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
  <div class="bridge"><b>What this still can't tell us → next: A Systematic Debugging Method.</b> We now have every tool: tests, tracebacks, pdb, profilers, logs. In what order do we use them on a real bug report, so the fix is right and stays right?</div>

  <h2 id="pdg-method"><span class="num">09</span>A Systematic Debugging Method</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The owner's complaint: "Chen's bill was ₹52. Our board says halves round up, so it should be ₹53." Random poking might change the number; how do we fix it so we <em>know</em> it is right and it can never silently come back?</p>
  </div>
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
  <p>Section 03's pdb session did this: sub = 50 ✓, discount = 0 ✓, after = 50 ✓, total = 52.5 ✓, <code>round(52.5)</code> = 52 ✗. The bug lives in one expression: <code>round(total)</code>. (For bugs that appeared after a change, <code>git bisect</code> isolates the guilty commit the same way: see <a class="xref" data-note="se_git">Git</a>.)</p>
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
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One diagram and one table for all of this note's tools, on the till.</div>

  <h2 id="pdg-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Tracebacks, prints, pdb, post-mortem, perf_counter, timeit, cProfile, line_profiler, tracemalloc, logging and the method: which question does each answer, and how do they feed each other?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 290" width="680">
<defs><marker id="pdg-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="110" y="16" text-anchor="middle" class="tm" font-size="10.5">BROKEN: where? why?</text>
<rect x="10" y="24" width="200" height="40" rx="7" class="fr sr"/><text x="110" y="48" text-anchor="middle" font-size="12" font-weight="700">traceback (crash)</text>
<line x1="110" y1="64" x2="110" y2="80" stroke="currentColor" marker-end="url(#pdg-a9)"/>
<rect x="10" y="82" width="200" height="40" rx="7" class="fr sr"/><text x="110" y="106" text-anchor="middle" font-size="12" font-weight="700">print → pdb (wrong answer)</text>
<line x1="110" y1="122" x2="110" y2="138" stroke="currentColor" marker-end="url(#pdg-a9)"/>
<rect x="10" y="140" width="200" height="40" rx="7" class="fr sr"/><text x="110" y="164" text-anchor="middle" font-size="12" font-weight="700">post-mortem (after crash)</text>
<text x="340" y="16" text-anchor="middle" class="tm" font-size="10.5">SLOW / BIG: where?</text>
<rect x="240" y="24" width="200" height="40" rx="7" class="fb sb"/><text x="340" y="48" text-anchor="middle" font-size="12" font-weight="700">perf_counter · timeit</text>
<line x1="340" y1="64" x2="340" y2="80" stroke="currentColor" marker-end="url(#pdg-a9)"/>
<rect x="240" y="82" width="200" height="40" rx="7" class="fb sb"/><text x="340" y="106" text-anchor="middle" font-size="12" font-weight="700">cProfile → line_profiler</text>
<line x1="340" y1="122" x2="340" y2="138" stroke="currentColor" marker-end="url(#pdg-a9)"/>
<rect x="240" y="140" width="200" height="40" rx="7" class="fb sb"/><text x="340" y="164" text-anchor="middle" font-size="12" font-weight="700">tracemalloc (memory)</text>
<text x="570" y="16" text-anchor="middle" class="tm" font-size="10.5">NOT WATCHING: what happened?</text>
<rect x="470" y="24" width="200" height="40" rx="7" class="ft st"/><text x="570" y="48" text-anchor="middle" font-size="12" font-weight="700">logging levels</text>
<line x1="570" y1="64" x2="570" y2="80" stroke="currentColor" marker-end="url(#pdg-a9)"/>
<rect x="470" y="82" width="200" height="40" rx="7" class="ft st"/><text x="570" y="106" text-anchor="middle" font-size="12" font-weight="700">handlers · hierarchy</text>
<line x1="570" y1="122" x2="570" y2="138" stroke="currentColor" marker-end="url(#pdg-a9)"/>
<rect x="470" y="140" width="200" height="40" rx="7" class="ft st"/><text x="570" y="164" text-anchor="middle" font-size="12" font-weight="700">log.exception · JSON</text>
<line x1="110" y1="180" x2="280" y2="226" stroke="currentColor" marker-end="url(#pdg-a9)"/><line x1="340" y1="180" x2="340" y2="224" stroke="currentColor" marker-end="url(#pdg-a9)"/><line x1="570" y1="180" x2="400" y2="226" stroke="currentColor" marker-end="url(#pdg-a9)"/>
<rect x="150" y="228" width="380" height="54" rx="7" class="fg sg"/><text x="340" y="250" text-anchor="middle" font-size="12" font-weight="700">the method: reproduce → isolate → hypothesise → fix → test</text><text x="340" y="270" text-anchor="middle" class="tm" font-size="10">starts and ends with a test (pytest note)</text>
</svg><figcaption>Three columns for three kinds of question; each column goes from coarse to fine. All three feed the method, which begins with a failing test and ends with a regression test.</figcaption></figure>
  <table class="tbl"><caption>Every tool, on the till</caption>
    <tr><th>Tool</th><th>Built from</th><th>Answers</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>Traceback</td><td>exceptions + call stack</td><td>what crashed, where, via whom?</td><td>TypeError in bill line 15 ← daily_report</td><td>Any crash: read bottom up</td></tr>
    <tr><td>print</td><td>—</td><td>one or two values?</td><td>50 → 50 → 52.5 → 52</td><td>Quick, throwaway</td></tr>
    <tr><td>pdb / breakpoint()</td><td>frames</td><td>any value, step by step?</td><td>round(52.5) = 52; round(2.5) = 2</td><td>Wrong answers, unclear flow</td></tr>
    <tr><td>Post-mortem</td><td>pdb + traceback</td><td>state at the crash?</td><td>qty '2' (str), customer Dev</td><td>Crashes, failing tests</td></tr>
    <tr><td>perf_counter</td><td>clock</td><td>how long, how does it grow?</td><td>1.67 s; ×2 orders → ×4 time</td><td>First measurement</td></tr>
    <tr><td>timeit</td><td>repeated timing</td><td>how fast is a small statement?</td><td>list in 84,392 ns vs set 15 ns; bill 678 ns</td><td>Comparing alternatives</td></tr>
    <tr><td>cProfile + pstats</td><td>per-call timing</td><td>which function?</td><td>daily_report tottime 2.001 of 2.142 s</td><td>Any slow program</td></tr>
    <tr><td>line_profiler</td><td>per-line timing</td><td>which line?</td><td>line 10: 87.7% → set: 1.72 s → 20 ms</td><td>Hot function found</td></tr>
    <tr><td>tracemalloc</td><td>allocation tracing</td><td>how much memory, which line?</td><td>peak 5.71 MB vs 0.02 MB</td><td>Memory errors, big data</td></tr>
    <tr><td>logging</td><td>levels, handlers</td><td>what happened while unattended?</td><td>ERROR + traceback in till.log</td><td>Anything that runs without you</td></tr>
    <tr><td>The method</td><td>all of the above + tests</td><td>how to fix so it stays fixed?</td><td>Chen 52 → 53; 4 old tests updated; 49 pass</td><td>Every bug</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p><strong>Never guess: look.</strong> A traceback, a debugger, a profiler and a log are four ways of looking at a running program (at a crash, at any moment, over time, and after the fact). The method wraps them between two tests: one that shows the bug, one that keeps it away.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The habits that waste the most debugging time.</div>

  <h2 id="pdg-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which habits turn a ten-minute bug into an afternoon, or a fast program into a slow one?</p>
  </div>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom at the till</th><th>Fix</th></tr>
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
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The note on one page.</div>

  <h2 id="pdg-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: the Chai Corner till (Asha 184, Ben 74, Chen 52 with Python's <code>round</code>, 53 after the fix). Bugs: Dev's quantity <code>"2"</code> (crash), Chen's half-rupee (wrong answer), the 20,000-order daily report (slow), 20,000 receipts (memory), a payment failure at night (logging).</p>
  <h3>The ladder in one line each</h3>
  <ol>
    <li><b>Traceback</b> — read bottom up: type + message (what) → last frame (where) → callers (how we got there).</li>
    <li><b>print</b> — quick look at a few values; costs an edit and re-run per question; use <code>!r</code>.</li>
    <li><b>pdb</b> — <code>breakpoint()</code>; <code>n s r c p ll w u d b q</code>; ask anything while paused.</li>
    <li><b>Post-mortem</b> — <code>python -m pdb</code>, <code>pytest --pdb</code>, <code>%debug</code>: inspect after the crash.</li>
    <li><b>Timing</b> — <code>perf_counter</code> for intervals; growth ×2 → ×4 means O(n²); <code>timeit</code>, min of repeats.</li>
    <li><b>cProfile + pstats</b> — ncalls, tottime (own), cumtime (own + callees); then line_profiler for lines.</li>
    <li><b>tracemalloc</b> — current/peak bytes; snapshot statistics by line.</li>
    <li><b>logging</b> — levels, logger → handler → formatter, hierarchy + propagation, <code>log.exception</code>, lazy args, configure once.</li>
    <li><b>Method</b> — reproduce (test) → isolate → hypothesise (predict, check) → fix → regression test + whole suite.</li>
  </ol>
  <h3>Key forms</h3>
  <table class="tbl">
    <tr><th>Form</th><th>Meaning</th></tr>
    <tr><td><code>t0 = time.perf_counter(); …; time.perf_counter() - t0</code></td><td>Elapsed seconds</td></tr>
    <tr><td><code>min(timeit.repeat(stmt, globals=g, number=N, repeat=R)) / N</code></td><td>Best time per run of stmt</td></tr>
    <tr><td><code>with cProfile.Profile() as pr: f()</code> then <code>pstats.Stats(pr).sort_stats("cumulative").print_stats(8)</code></td><td>Profile f; print top 8 by cumulative time</td></tr>
    <tr><td><code>tracemalloc.start(); …; current, peak = tracemalloc.get_traced_memory()</code></td><td>Bytes now / at peak since start</td></tr>
    <tr><td><code>log = logging.getLogger(__name__)</code>; <code>log.info("x=%s", x)</code></td><td>One logger per module; lazy args</td></tr>
    <tr><td><code>handler.setLevel(...)</code>; <code>handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))</code></td><td>Destination filter and layout</td></tr>
    <tr><td><code>Decimal(str(x)).quantize(Decimal("1"), rounding=ROUND_HALF_UP)</code></td><td>Round to whole units, halves up, without float error</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Investigation</th><th>Key numbers</th></tr>
    <tr><td>Traceback</td><td>TypeError at till.py:15 ← report.py:9 ← crash.py:9; post-mortem: qty '2', customer Dev</td></tr>
    <tr><td>pdb on Chen</td><td>sub 50, discount 0, after 50, total 52.5, round → 52; round(0.5, 1.5, 2.5) = 0, 2, 2</td></tr>
    <tr><td>Timing</td><td>5k 0.108 s, 10k 0.399 s, 20k 1.674 s (O(n²)); list in 84,392 ns vs set 15 ns; bill 678 ns</td></tr>
    <tr><td>Profile</td><td>daily_report tottime 2.001 of 2.142 s; line 10 = 87.7%; fix 1721.5 ms → 20.1 ms</td></tr>
    <tr><td>Memory</td><td>all receipts first: peak 5.71 MB; streamed: 0.02 MB; receipts.py:5 holds 2322 KiB</td></tr>
    <tr><td>Logging</td><td>screen: ERROR only; till.log: DEBUG, ERROR + traceback, INFO, DEBUG</td></tr>
    <tr><td>Fix</td><td>Chen 52 → 53, day 310 → 311; 4 old tests updated; 49 passed</td></tr>
  </table>
  <div class="cards">
    <div><b>Crash</b><p>Traceback first; then post-mortem to see the values.</p></div>
    <div><b>Wrong answer</b><p>Failing test → breakpoint() or pytest --pdb.</p></div>
    <div><b>Slow</b><p>perf_counter → cProfile → line_profiler → fix → re-run tests → re-profile.</p></div>
    <div><b>Memory</b><p>tracemalloc peak and snapshot; stream instead of collecting.</p></div>
    <div><b>Production</b><p>logging with levels, file handler, log.exception; never print.</p></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Top-down traceback reading; fixing where it exploded; leftover prints/breakpoints; optimising without profiling; single timings; tottime vs cumtime confusion; <code>log.error(str(e))</code>; logging configured twice; f-strings in debug logs; fixing without a reproducing test; <code>Decimal(float)</code> for money.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Which line of a traceback do you read first?</td><td>The last: exception type and message</td></tr>
    <tr><td>pdb: step <em>into</em> a call vs step <em>over</em> it?</td><td><code>s</code> vs <code>n</code> (and <code>r</code> to finish the current function)</td></tr>
    <tr><td>A function has cumtime 2.1 s and tottime 2.0 s. Where is the time?</td><td>In its own lines, not its callees (use a line profiler)</td></tr>
    <tr><td>Doubling n multiplies time by 4. What complexity?</td><td>O(n²)</td></tr>
    <tr><td>What does <code>log.exception</code> add over <code>log.error</code>?</td><td>The full traceback (call it inside <code>except</code>)</td></tr>
  </table>

  <h2 id="pdg-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a Python traceback?</summary><div class="qa-body">From the bottom: the exception type and message (what), then the last frame (file, line, function, code: where), then the frames above (the chain of calls). The cause is often where a bad value entered, which may be several frames up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the essential pdb commands.</summary><div class="qa-body"><code>n</code> next (step over), <code>s</code> step into, <code>r</code> return from function, <code>c</code> continue, <code>p</code>/<code>pp</code> print, <code>l</code>/<code>ll</code> list, <code>w</code> where (stack), <code>u</code>/<code>d</code> up/down frames, <code>b</code> breakpoint, <code>q</code> quit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you use post-mortem debugging, and how?</summary><div class="qa-body">When the crash already happened and you need the values at that moment. <code>python -m pdb script.py</code> (then <code>c</code>), <code>pytest --pdb</code>, <code>%debug</code> in Jupyter, or <code>pdb.pm()</code>. You land in the failing frame; <code>u</code> moves to callers with their locals intact.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>tottime vs cumtime?</summary><div class="qa-body">tottime: time in the function's own code. cumtime: including everything it calls. High cumtime + low tottime → the cost is in its callees; high tottime → its own lines (daily_report: 2.001 of 2.142 s), so use a line profiler next.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why take the minimum in timeit?</summary><div class="qa-body">Measurement noise (other processes, caches, GC) only ever adds time. The minimum of several repeats is the closest to the code's true cost; the mean mixes in noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find what uses memory in Python?</summary><div class="qa-body"><code>tracemalloc.start()</code>, run the code, <code>get_traced_memory()</code> for current and peak, <code>take_snapshot().statistics("lineno")</code> for the lines holding the most. For whole-process memory, OS tools or memray.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain logger, handler, formatter and propagation.</summary><div class="qa-body">A logger is a named source your code calls (<code>till.payments</code>); records propagate up the dotted hierarchy to ancestors' handlers (<code>till</code>). A handler is a destination with its own level (screen ≥ WARNING, file ≥ DEBUG). A formatter lays out each record (time, level, name, file:line, message).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why logging instead of print in production?</summary><div class="qa-body">Levels you can filter without code changes, timestamps and source location, multiple destinations, tracebacks with <code>log.exception</code>, structured JSON for search tools. print has none of these and can't be turned down.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>round(52.5)</code> give 52, and how do you round half up?</summary><div class="qa-body">Python's <code>round</code> uses round-half-to-even (banker's rounding) to avoid bias. For half up: <code>Decimal(str(x)).quantize(Decimal("1"), rounding=ROUND_HALF_UP)</code>; build the Decimal from a string because <code>Decimal(184.275)</code> carries the float's binary error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe a systematic debugging process.</summary><div class="qa-body">Reproduce (smallest failing test) → isolate (pdb, bisecting inputs or commits) → hypothesise with testable predictions (round(0.5, 1.5, 2.5) → 0, 2, 2) → fix minimally → keep the reproduction as a regression test and run the whole suite (it flagged 4 tests encoding the old rule).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the method start and end with a test from the pytest note?</summary><div class="qa-body">The starting test makes the bug reproducible in milliseconds, so every fix attempt is checked instantly. The ending test (kept in the suite) makes it a regression test, so the bug can't silently return. Without them, "fixed" is an opinion.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do the profiling results connect to the Data Structures notes?</summary><div class="qa-body">The hotspot was <code>in</code> on a list (a linear scan, O(n) per check, O(n²) for the report). A set or dict lookup hashes the key: O(1) on average. Profiling finds the line; knowing the data structures explains it and suggests the fix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you swallow exceptions (<code>except: pass</code>)?</summary><div class="qa-body">No traceback, no post-mortem frames, nothing for <code>log.exception</code> to record: all three debugging views lose their evidence, and the bad value travels on to fail somewhere less obvious.</div></details>
</main>
`
});
