// notes/python/py_testing.js — Making Code Trustworthy: the map
Object.assign(TOPIC_CONTENT, {
  "py_testing": `<main>
<h1>Making Code Trustworthy: the map</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>The map</span></div>
  <p class="lead">Testing, mocking, debugging, profiling and logging are often taught as five unrelated toolboxes. They are one chain of needs. You write the Chai Corner till and ask <strong>"does it work?"</strong> → you check it automatically (<strong>tests</strong>) → but checkout talks to a payment gateway, the outside world (<strong>mocks</strong>) → a test goes red: <strong>where</strong> is it broken? (<strong>debugging</strong>) → it works but the day's report is <strong>slow</strong>: where? (<strong>profiling</strong>) → it ran at night with nobody watching: <strong>what happened?</strong> (<strong>logging</strong>). This map shows that chain, the three concept notes that teach it, the order to read them, and the one running example they share. Code here was run on Python 3.13.</p>

  <h2 id="pt-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 230" width="680">
<defs><marker id="pt-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="8" width="200" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="120" y="30" text-anchor="middle" font-size="11">Functions · Exceptions · Modules</text>
<rect x="460" y="8" width="200" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="560" y="30" text-anchor="middle" font-size="11">Classes · Decorators · Context Mgrs</text>
<line x1="120" y1="42" x2="290" y2="66" stroke="currentColor" marker-end="url(#pt-a0)"/><line x1="560" y1="42" x2="390" y2="66" stroke="currentColor" marker-end="url(#pt-a0)"/>
<rect x="210" y="68" width="260" height="46" rx="8" class="fg sg" stroke-width="3"/><text x="340" y="88" text-anchor="middle" font-size="12.5" font-weight="700">Making Code Trustworthy: the map</text><text x="340" y="105" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<line x1="280" y1="114" x2="120" y2="146" stroke="currentColor" marker-end="url(#pt-a0)"/><line x1="340" y1="114" x2="340" y2="146" stroke="currentColor" marker-end="url(#pt-a0)"/><line x1="400" y1="114" x2="560" y2="146" stroke="currentColor" marker-end="url(#pt-a0)"/>
<rect x="30" y="148" width="180" height="44" rx="8" class="fb sb"/><text x="120" y="167" text-anchor="middle" font-size="12">1. Testing with pytest</text><text x="120" y="183" text-anchor="middle" class="tm" font-size="10">does it work?</text>
<line x1="210" y1="170" x2="248" y2="170" stroke="currentColor" marker-end="url(#pt-a0)"/>
<rect x="250" y="148" width="180" height="44" rx="8" class="fb sb"/><text x="340" y="167" text-anchor="middle" font-size="12">2. Mocks &amp; Test Doubles</text><text x="340" y="183" text-anchor="middle" class="tm" font-size="10">without the outside world</text>
<line x1="430" y1="170" x2="468" y2="170" stroke="currentColor" marker-end="url(#pt-a0)"/>
<rect x="470" y="148" width="180" height="44" rx="8" class="fb sb"/><text x="560" y="167" text-anchor="middle" font-size="12">3. Debugging, Profiling, Logging</text><text x="560" y="183" text-anchor="middle" class="tm" font-size="10">where? why slow? what happened?</text>
<text x="340" y="220" text-anchor="middle" class="tm" font-size="10.5">then: CI runs the tests on every push (Git) · logs and profiles in production (MLOps)</text>
</svg><figcaption>This map opens the group. It sits after the core language notes, because each tool here works on functions, exceptions and modules you already know.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: the core language</b><span><a class="xref" data-note="py_functions">Functions</a> built the till (<code>bill(asha)</code> = ₹184); <a class="xref" data-note="py_exceptions">Exceptions</a> taught raising and tracebacks; <a class="xref" data-note="py_modules">Modules</a> taught imports; <a class="xref" data-note="py_files">Files</a>, <a class="xref" data-note="py_classes">Classes</a>, <a class="xref" data-note="py_decorators">Decorators</a> and <a class="xref" data-note="py_context">Context Managers</a> supply the rest. Left open: the code runs, but how do we <em>trust</em> it, today and after every change?</span></li>
    <li><b>This note adds: the map</b><span>The chain of needs (does it work → isolated → where broken → where slow → what happened), the three concept notes that answer it, the reading order, and the shared running example (the Chai Corner till).</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_pytest">Testing with pytest</a></b><span>Then <a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a> and <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>. Afterwards the same tools run in automation: tests on every push (<a class="xref" data-note="se_git">Git</a>) and logs in deployed services (<a class="xref" data-note="mlops_deploy">MLOps &amp; Deployment</a>).</span></li>
  </ol>

  <h2 id="pt-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole group as one chain. Each tool answers the question above it; its limit raises the next question. The note that teaches it is in brackets.</p>
  <ol class="story">
    <li><b>Tests</b><span>Q: does the till work, and does it <em>keep</em> working after someone edits it? → Write hand-worked answers as code (<code>assert bill(five_chai) == 142</code>); pytest runs them all in a second. A teammate's <code>&gt;=</code>→<code>&gt;</code> change charged ₹158 at exactly ₹150; a test caught it in 0.03 s. But <code>checkout</code> calls a payment gateway… (<a class="xref" data-note="py_pytest">Testing with pytest</a>)</span></li>
    <li><b>Mocks and test doubles</b><span>Q: how do we test code that touches the outside world? → Replace the gateway with a stand-in that answers on cue and records what it was asked: <code>charge(18400, "tok_asha")</code>. Patch where it's used; better, pass it in. But a red test only says <em>that</em> something is wrong… (<a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a>)</span></li>
    <li><b>Debugging</b><span>Q: it's broken; where, and why? → Read the traceback bottom up; pause with <code>breakpoint()</code> and ask anything; inspect a crash post-mortem. Found <code>round(52.5) = 52</code> (half to even). Now it's correct, but slow… (<a class="xref" data-note="py_debugging">Debugging</a>)</span></li>
    <li><b>Profiling</b><span>Q: it's slow (or big); where? → Measure, don't guess: <code>perf_counter</code> (1.67 s), <code>cProfile</code> (one function owns 93%), <code>line_profiler</code> (one line, 87.7%), <code>tracemalloc</code> (5.71 MB peak). Fix: 1.72 s → 20 ms. But in production nobody is at the keyboard… (<a class="xref" data-note="py_debugging">Profiling</a>)</span></li>
    <li><b>Logging</b><span>Q: what happened at 9 p.m. when a payment failed? → The program kept a record: levels, handlers, <code>log.exception</code> with the traceback, in <code>till.log</code>. And every fix ends where we started: with a new test. (<a class="xref" data-note="py_debugging">Logging</a>)</span></li>
  </ol>

  <h2 id="pt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Making Code Trustworthy</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Tests (pytest)</div>
        <ul>
          <li><code>test_*</code> functions + plain <code>assert</code></li>
          <li>Read failures: <code>E  assert 158 == 142</code></li>
          <li><code>pytest.raises</code>, <code>parametrize</code>, fixtures, <code>conftest.py</code></li>
          <li>Coverage finds untested lines; 100% ≠ correct</li>
          <li>TDD: red → green → refactor</li>
          <li>Note: <a class="xref" data-note="py_pytest">Testing with pytest</a></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Mocks</div>
        <ul>
          <li>Stub · fake · mock · spy</li>
          <li><code>Mock</code>, <code>return_value</code>, <code>side_effect</code>, autospec</li>
          <li>⚠ patch where it's <b>used</b>: <code>"checkout.charge"</code></li>
          <li>monkeypatch; dependency injection</li>
          <li>⚠ don't mock your own logic</li>
          <li>Note: <a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Debugging</div>
        <ul>
          <li>Traceback: read bottom up</li>
          <li><code>breakpoint()</code>, pdb <code>n s r c p ll w u</code></li>
          <li>Post-mortem: <code>python -m pdb</code>, <code>pytest --pdb</code></li>
          <li>Note: <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Profiling</div>
        <ul>
          <li><code>perf_counter</code>, <code>timeit</code> (min of repeats)</li>
          <li><code>cProfile</code>: tottime vs cumtime</li>
          <li>line_profiler; <code>tracemalloc</code> for memory</li>
          <li>Measure → fix the top → re-measure</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging</div>
        <ul>
          <li>DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL</li>
          <li>logger → handlers → formatter; hierarchy</li>
          <li><code>log.exception</code> keeps the traceback</li>
          <li>Configure once; lazy <code>%s</code> args</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The loop</div>
        <ul>
          <li>Reproduce (test) → isolate (pdb) → hypothesise → fix → regression test</li>
          <li>💡 every tool is a way of <b>looking</b> instead of guessing</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pt-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The group as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pt-till"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One Till, Five Worries</span><span class="rm-sub">The shared running example</span></div></div>
      <div class="rm-item rm-done" data-target="pt-chain"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Need Chain</span><span class="rm-sub">Why each tool exists</span></div></div>
      <div class="rm-item rm-done" data-target="pt-guide"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Reading Guide</span><span class="rm-sub">Order and one idea per note</span></div></div>
      <div class="rm-item rm-done" data-target="pt-connect"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table</span></div></div>
      <div class="rm-item rm-done" data-target="pt-traps"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Across the group</span></div></div>
      <div class="rm-item rm-done" data-target="pt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The group in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pt-qa"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pt-till"><span class="num">01</span>One Till, Five Worries</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Learn pytest, then mocks, then pdb, then cProfile, then logging" is a list of tools, not a reason for any of them. What single program can every one of these tools be measured against, so each new tool visibly solves a problem the previous one couldn't?</p>
  </div>
  <h3>The running example</h3>
  <p>Chai Corner, the stall used in every Python note: masala chai ₹30, samosa ₹15, vada pav ₹20, cold coffee ₹90; 10% off at a subtotal of ₹150 or more; then 5% GST; rounded to whole rupees. Its till has grown three parts:</p>
  <table class="tbl"><caption>The till's parts and the worry each one raises</caption>
    <tr><th>Part</th><th>What it does</th><th>Worry</th><th>Tool</th></tr>
    <tr><td><code>bill(lines)</code></td><td>Asha 184, Ben 74, Chen 52; five chai (exactly ₹150) 142</td><td>Is it right? Will it stay right?</td><td>tests</td></tr>
    <tr><td><code>checkout(lines, card)</code></td><td>Bills, then asks the payment gateway to charge 18400 paise</td><td>Can't test with the real bank</td><td>mocks</td></tr>
    <tr><td>Chen's bill</td><td>₹52, but the board says halves round up (₹53)</td><td>Wrong, no crash: where?</td><td>debugging</td></tr>
    <tr><td><code>daily_report(orders)</code></td><td>20,000 festival orders in 1.67 s</td><td>Slow: where?</td><td>profiling</td></tr>
    <tr><td>The till at night</td><td>A payment fails at 9 p.m.</td><td>What happened?</td><td>logging</td></tr>
  </table>
  <h3>A tour: one line of each tool on the till</h3>
  <p>Don't worry about understanding every line yet; each one is a preview of a whole note. Notice that all five tools work on the same small program.</p>
  <div class="fx" data-lang="py"># tour.py
import logging, sys, time
from unittest.mock import Mock
from till import bill, with_tax
from report import daily_report
from bigday import make_day

asha = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
chen = [("samosa", 2, 15), ("vada pav", 1, 20)]

# 1. Does it work?  Check it automatically (a test is just this, run by pytest)
assert bill(asha) == 184, "Asha's bill changed!"
print("1. test     bill(asha) == 184: passed")

# 2. It touches the outside world?  Use a stand-in gateway (a mock)
charge = Mock(return_value={"status": "ok", "txn_id": "T-1"})
charge(bill(asha) * 100, "tok_asha")
print("2. mock     gateway was called with", charge.call_args)

# 3. It's broken - where?  Look inside while it runs (debugging)
print("3. debug    Chen before rounding:", with_tax(50), "-&gt; bill:", bill(chen))

# 4. It's slow - where?  Measure (profiling)
day = make_day(10_000)
t0 = time.perf_counter()
daily_report(day)
print(f"4. profile  daily_report on 10,000 orders: {time.perf_counter() - t0:.2f} s")

# 5. What happened in production?  Read the record it kept (logging)
logging.basicConfig(stream=sys.stdout, level=logging.INFO,
                    format="5. log      %(levelname)s %(name)s: %(message)s")
logging.getLogger("till").info("billed %s Rs %d", "Asha", 184)</div>
  <div class="fx" data-lang="text">1. test     bill(asha) == 184: passed
2. mock     gateway was called with call(18400, 'tok_asha')
3. debug    Chen before rounding: 52.5 -&gt; bill: 52
4. profile  daily_report on 10,000 orders: 0.30 s
5. log      INFO till: billed Asha Rs 184</div>
  <p>(<code>till.py</code>, <code>report.py</code> and <code>bigday.py</code> are listed in full in the concept notes.) Line by line: (1) an <code>assert</code> with a hand-worked answer is the seed of every test; (2) a <code>Mock</code> stood in for the gateway and recorded that it was asked for 18400 paise; (3) looking inside <code>bill</code> shows 52.5 becoming 52; (4) a stopwatch gives a number instead of "feels slow"; (5) a log line carries a level and a source, unlike <code>print</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Running a real chai stall. You taste every new batch (tests); you practise card payments with a dummy machine, not real customers' cards (mocks); when a batch tastes wrong you retrace each step (debugging); when the queue is long you time each station to find the slow one (profiling); and you keep a daybook so the morning owner knows what happened at night (logging).</p></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Trustworthy code</strong> gives the right answers (tested), can be checked without its environment (isolated by doubles), can be understood when it fails (debuggable), is fast enough for its load (profiled), and leaves a record of what it did (logged).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Treating these as optional extras for "later". The ₹150 bug, the ₹52/₹53 complaint, and the 1.7-second report are all ordinary, small-program problems; the tools are cheapest when the program is small.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Need Chain.</b> We've seen the five worries side by side. Why do they come in this order, and what exactly does each tool fail to do that forces the next one?</div>

  <h2 id="pt-chain"><span class="num">02</span>The Need Chain</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Why can't tests alone make code trustworthy? Why do we need debuggers if we have tests, profilers if we have debuggers, logs if we have profilers? Each tool must be <em>forced</em> by a limit of the one before.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 250" width="680">
<defs><marker id="pt-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="48" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="110" y="30" text-anchor="middle" font-size="12" font-weight="700">Does it work?</text><text x="110" y="46" text-anchor="middle" class="tm" font-size="10">ran once, looked fine</text>
<line x1="210" y1="34" x2="243" y2="34" stroke="currentColor" marker-end="url(#pt-a2)"/>
<rect x="245" y="10" width="200" height="48" rx="7" class="fb sb"/><text x="345" y="30" text-anchor="middle" font-size="12" font-weight="700">TESTS</text><text x="345" y="46" text-anchor="middle" class="tm" font-size="10">check automatically, forever</text>
<line x1="445" y1="34" x2="478" y2="34" stroke="currentColor" marker-end="url(#pt-a2)"/>
<rect x="480" y="10" width="190" height="48" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="30" text-anchor="middle" font-size="12" font-weight="700">It touches the outside world</text><text x="575" y="46" text-anchor="middle" class="tm" font-size="10">gateway: 2 s, flaky, costs</text>
<line x1="575" y1="58" x2="575" y2="90" stroke="currentColor" marker-end="url(#pt-a2)"/>
<rect x="480" y="92" width="190" height="48" rx="7" class="fb sb"/><text x="575" y="112" text-anchor="middle" font-size="12" font-weight="700">MOCKS</text><text x="575" y="128" text-anchor="middle" class="tm" font-size="10">stand-ins for the gateway</text>
<line x1="480" y1="116" x2="447" y2="116" stroke="currentColor" marker-end="url(#pt-a2)"/>
<rect x="245" y="92" width="200" height="48" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="345" y="112" text-anchor="middle" font-size="12" font-weight="700">It's broken: where?</text><text x="345" y="128" text-anchor="middle" class="tm" font-size="10">red test says THAT, not WHERE</text>
<line x1="245" y1="116" x2="212" y2="116" stroke="currentColor" marker-end="url(#pt-a2)"/>
<rect x="10" y="92" width="200" height="48" rx="7" class="fr sr"/><text x="110" y="112" text-anchor="middle" font-size="12" font-weight="700">DEBUGGING</text><text x="110" y="128" text-anchor="middle" class="tm" font-size="10">traceback, pdb, post-mortem</text>
<line x1="110" y1="140" x2="110" y2="172" stroke="currentColor" marker-end="url(#pt-a2)"/>
<rect x="10" y="174" width="200" height="48" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="110" y="194" text-anchor="middle" font-size="12" font-weight="700">It's slow: where?</text><text x="110" y="210" text-anchor="middle" class="tm" font-size="10">correct but 1.7 s</text>
<line x1="210" y1="198" x2="243" y2="198" stroke="currentColor" marker-end="url(#pt-a2)"/>
<rect x="245" y="174" width="200" height="48" rx="7" class="fv"/><text x="345" y="194" text-anchor="middle" font-size="12" font-weight="700">PROFILING</text><text x="345" y="210" text-anchor="middle" class="tm" font-size="10">timeit, cProfile, tracemalloc</text>
<line x1="445" y1="198" x2="478" y2="198" stroke="currentColor" marker-end="url(#pt-a2)"/>
<rect x="480" y="174" width="190" height="48" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="194" text-anchor="middle" font-size="12" font-weight="700">What happened in prod?</text><text x="575" y="210" text-anchor="middle" class="tm" font-size="10">nobody was watching</text>
<line x1="575" y1="222" x2="575" y2="236" stroke="currentColor"/>
<text x="575" y="248" text-anchor="middle" font-size="12" font-weight="700" class="tg">→ LOGGING</text>
</svg><figcaption>Read it as a snake: each grey box is a question, each coloured box the tool that answers it. Every tool leaves the next question open.</figcaption></figure>
  <table class="tbl"><caption>Each tool, the question it answers, and the limit that forces the next</caption>
    <tr><th>Tool</th><th>Answers</th><th>On the till</th><th>Its limit → next tool</th></tr>
    <tr><td>Running it once</td><td>"does it work right now, for this input?"</td><td>184 74 52 looked fine</td><td>misses edge cases and future changes → <b>tests</b></td></tr>
    <tr><td>Tests</td><td>"does it give known answers, after every change?"</td><td>caught ₹158 at exactly ₹150</td><td>can't run code that calls a real bank → <b>mocks</b></td></tr>
    <tr><td>Mocks</td><td>"is <em>our</em> logic right, without the outside world?"</td><td>charged 18400 paise once; retry tested</td><td>a red test says <em>that</em>, not <em>where/why</em> → <b>debugging</b></td></tr>
    <tr><td>Debugging</td><td>"where and why is it wrong?"</td><td>round(52.5) = 52; Dev's qty "2"</td><td>correct-but-slow code has no bug to find → <b>profiling</b></td></tr>
    <tr><td>Profiling</td><td>"where do time and memory go?"</td><td>one line = 87.7%; 1.72 s → 20 ms</td><td>needs you present, running it → <b>logging</b></td></tr>
    <tr><td>Logging</td><td>"what did it do while unattended?"</td><td>ERROR + traceback in till.log</td><td>a found bug becomes a new <b>test</b>: the loop closes</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A car: the pre-delivery inspection (tests), test-driving on a closed track instead of a highway (mocks), the mechanic's diagnostic scanner when a warning light comes on (debugging), the dynamometer that finds which part loses power (profiling), and the trip recorder that shows what happened on last night's drive (logging).</p></div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>need chain</strong> orders tools so that each one is introduced only when the previous one demonstrably cannot answer a question. Here: correctness now → correctness over time → correctness in isolation → location of faults → location of cost → history of behaviour.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Using a tool from the wrong link: profiling to find a wrong answer, logging statements as a debugger, or pdb in production. Ask which question you have (works? isolated? where broken? where slow? what happened?) and pick the tool for it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Reading Guide.</b> The chain says why each tool exists. Which note teaches which links, in what order should you read them, and what is the one idea to take from each?</div>

  <h2 id="pt-guide"><span class="num">03</span>Reading Guide</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Three concept notes, each long. In which order, what do they each assume, and how do you know you've got the point of each?</p>
  </div>
  <table class="tbl"><caption>The three concept notes</caption>
    <tr><th>#</th><th>Note</th><th>Links of the chain</th><th>Needs first</th><th>Done when you can…</th></tr>
    <tr><td>1</td><td><a class="xref" data-note="py_pytest">Testing with pytest</a></td><td>does it work? → tests</td><td><a class="xref" data-note="py_functions">Functions</a>, <a class="xref" data-note="py_exceptions">Exceptions</a>, <a class="xref" data-note="py_modules">Modules</a></td><td>write a parametrized test with a fixture, read a failure report, and run the split-the-bill TDD loop</td></tr>
    <tr><td>2</td><td><a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a></td><td>outside world → mocks</td><td>note 1, <a class="xref" data-note="py_classes">Classes</a>, <a class="xref" data-note="py_decorators">Decorators</a>, <a class="xref" data-note="py_context">Context Managers</a></td><td>explain why <code>patch("gateway.charge")</code> still hits the network, and test the retry with <code>side_effect</code></td></tr>
    <tr><td>3</td><td><a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a></td><td>where broken → debugging; where slow → profiling; what happened → logging</td><td>note 1 (tests start and end each fix), <a class="xref" data-note="py_files">Files</a></td><td>read a traceback bottom up, drive a pdb session, read a cProfile table, set up two handlers, and fix Chen's rounding with a regression test</td></tr>
  </table>
  <h3>1. Testing with pytest: one idea</h3>
  <p><strong>A test is a hand-worked example the computer re-checks forever.</strong> Everything else in the note (parametrize, fixtures, conftest, coverage, TDD) makes it cheaper to have more of them, keep them independent, and find where they're missing.</p>
  <h3>2. Mocks &amp; Test Doubles: one idea</h3>
  <p><strong>Replace the outside world, keep your own logic real, and put the replacement where your code looks for it</strong> (or let your code be handed it). The "patch where it's used" rule is the label picture from <a class="xref" data-note="py_values">Values</a> applied to imports.</p>
  <h3>3. Debugging, Profiling &amp; Logging: one idea</h3>
  <p><strong>Never guess: look.</strong> A traceback looks at a crash, pdb at any moment, a profiler at time and memory, a log at the past. The systematic method wraps them between two tests.</p>
  <h3>How to study the group</h3>
  <div class="flow"><span>read the question opener</span><span>predict the output</span><span>run it yourself</span><span>break it on purpose</span><span>revision sheet</span></div>
  <ul>
    <li><b>Run every example.</b> pytest output only makes sense once you've produced it yourself.</li>
    <li><b>Break things on purpose.</b> Change <code>&gt;=</code> to <code>&gt;</code>, delete the guard, patch the wrong name, and watch each tool react.</li>
    <li><b>Keep one project.</b> Put <code>till.py</code> and its tests in one folder and grow it note by note; the final suite in the pytest note has 42 tests, 49 after the rounding fix.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Learning to drive: first the controls (tests), then practising in an empty car park (mocks), then what to do when the engine light comes on (debugging), how to save fuel (profiling) and how to keep a logbook (logging). Same car throughout.</p></div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>concept note</strong> teaches one link of the chain completely; this <strong>map</strong> only connects them. Each concept note has its own Question Ladder, How It All Connects table and Revision Sheet.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Reading the Mocks note before writing any tests. Mocks only make sense inside a test, and over-mocking is easiest to fall into when you have never felt what a plain, real test gives you.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One table with every tool of the group, what it is built from, and its number on the till.</div>

  <h2 id="pt-connect"><span class="num">04</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How does each tool of the group build on the others, and what did each one produce on the till?</p>
  </div>
  <table class="tbl"><caption>The group on Chai Corner</caption>
    <tr><th>Tool</th><th>Built from</th><th>Answers</th><th>On the running example</th><th>Note</th></tr>
    <tr><td>Test (assert)</td><td>functions, hand-worked answers</td><td>right, and still right?</td><td><code>bill(five_chai) == 142</code> caught ₹158</td><td><a class="xref" data-note="py_pytest">pytest</a></td></tr>
    <tr><td>Fixtures, parametrize, conftest</td><td>tests, decorators, yield</td><td>many cases, shared setup?</td><td>6 rows → 6 tests; menu once, order per test</td><td><a class="xref" data-note="py_pytest">pytest</a></td></tr>
    <tr><td>Coverage, TDD</td><td>tests</td><td>what's untested; tests first?</td><td>line 21 missed; split(184, 3) = [62, 61, 61]</td><td><a class="xref" data-note="py_pytest">pytest</a></td></tr>
    <tr><td>Test double / Mock</td><td>tests, objects</td><td>test without the outside world?</td><td><code>call(18400, 'tok_asha')</code></td><td><a class="xref" data-note="py_mocking">Mocks</a></td></tr>
    <tr><td>patch / monkeypatch / DI</td><td>modules (names), fixtures</td><td>how to put the double in?</td><td><code>"checkout.charge"</code>; <code>Till(FakeGateway())</code></td><td><a class="xref" data-note="py_mocking">Mocks</a></td></tr>
    <tr><td>Traceback, pdb, post-mortem</td><td>exceptions, call stack</td><td>where and why broken?</td><td>qty '2' from Dev; round(52.5) = 52</td><td><a class="xref" data-note="py_debugging">Debugging</a></td></tr>
    <tr><td>timeit, cProfile, tracemalloc</td><td>clocks, call tracing</td><td>where slow or big?</td><td>87.7% on one line; 1.72 s → 20 ms; 5.71 → 0.02 MB</td><td><a class="xref" data-note="py_debugging">Profiling</a></td></tr>
    <tr><td>logging</td><td>modules (logger names), files</td><td>what happened unattended?</td><td>ERROR + traceback in till.log</td><td><a class="xref" data-note="py_debugging">Logging</a></td></tr>
    <tr><td>The debugging method</td><td>all of the above</td><td>fix so it stays fixed?</td><td>Chen ₹52 → ₹53; day total 310 → 311; 49 tests pass</td><td><a class="xref" data-note="py_debugging">Debugging</a></td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the group: <strong>tests say whether the till is right, doubles let tests run without the world, and debuggers, profilers and logs show what the till actually did, so that every problem found becomes another test.</strong></p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The habits that break the chain, and which note fixes each.</div>

  <h2 id="pt-traps"><span class="num">05</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which mistakes appear across the whole group, and where is each one explained?</p>
  </div>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom on Chai Corner</th><th>Fix</th><th>Explained in</th></tr>
    <tr><td>Checking by eye</td><td>₹150 order overcharged; nobody noticed</td><td>A test with the edge case</td><td><a class="xref" data-note="py_pytest">pytest</a></td></tr>
    <tr><td>Expected value from the code</td><td>Test can never fail</td><td>Work answers by hand</td><td><a class="xref" data-note="py_pytest">pytest</a></td></tr>
    <tr><td><code>==</code> on floats</td><td>184.27499999999998 ≠ 184.275</td><td><code>pytest.approx</code>, Decimal</td><td><a class="xref" data-note="py_pytest">pytest</a></td></tr>
    <tr><td>Real gateway in unit tests</td><td>2 s, ConnectionError</td><td>A test double</td><td><a class="xref" data-note="py_mocking">Mocks</a></td></tr>
    <tr><td>Patching where defined</td><td>Real gateway still called</td><td><code>patch("checkout.charge")</code></td><td><a class="xref" data-note="py_mocking">Mocks</a></td></tr>
    <tr><td>Mocking your own logic</td><td>₹203 bill, green test</td><td>Mock only the boundary</td><td><a class="xref" data-note="py_mocking">Mocks</a></td></tr>
    <tr><td>Reading tracebacks top-down</td><td>Looking at the wrong file</td><td>Bottom line first</td><td><a class="xref" data-note="py_debugging">Debugging</a></td></tr>
    <tr><td>Optimising by guess</td><td>Rewriting <code>bill</code>; report still slow</td><td>Profile first</td><td><a class="xref" data-note="py_debugging">Profiling</a></td></tr>
    <tr><td>print in production; <code>log.error(str(e))</code></td><td>No time, level or traceback</td><td>logging, <code>log.exception</code></td><td><a class="xref" data-note="py_debugging">Logging</a></td></tr>
    <tr><td>Fixing without a test</td><td>The rounding bug returns</td><td>Reproduce as a test; keep it</td><td><a class="xref" data-note="py_debugging">Debugging</a></td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole group on one page.</div>

  <h2 id="pt-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Making Code Trustworthy on one sheet. Running example: the Chai Corner till (chai 30, samosa 15, vada pav 20, cold coffee 90; 10% off at ₹150+; +5% GST; round to rupees). Each concept note has its own, more detailed Revision Sheet.</p>
  <h3>The chain</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Tool</th><th>Key ideas</th><th>On the till</th><th>Limit → next</th></tr>
    <tr><td>Does it work, and keep working?</td><td>Tests (pytest)</td><td><code>assert</code>, failure report, raises, parametrize, fixtures, conftest, coverage, TDD</td><td>₹158 vs ₹142 at exactly ₹150 caught</td><td>can't call the real bank</td></tr>
    <tr><td>Can we test without the outside world?</td><td>Mocks / doubles</td><td>stub, fake, mock; return_value, side_effect; patch where used; autospec; DI</td><td>charge(18400, 'tok_asha'); retry after timeout</td><td>red says that, not where</td></tr>
    <tr><td>Where/why is it broken?</td><td>Debugging</td><td>traceback bottom up; pdb; post-mortem</td><td>Dev's qty '2'; round(52.5) = 52</td><td>slow ≠ broken</td></tr>
    <tr><td>Where is it slow or big?</td><td>Profiling</td><td>perf_counter, timeit (min), cProfile tottime/cumtime, line_profiler, tracemalloc</td><td>line 10: 87.7%; 1.72 s → 20 ms</td><td>needs you present</td></tr>
    <tr><td>What happened unattended?</td><td>Logging</td><td>levels, logger → handler → formatter, hierarchy, log.exception</td><td>ERROR + traceback in till.log</td><td>a found bug → new test</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Fact</th><th>Value</th></tr>
    <tr><td>Bills (Python's round)</td><td>Asha 184, Ben 74, Chen 52, total 310; five chai 142</td></tr>
    <tr><td>Boundary bug (<code>&gt;</code>)</td><td>five chai → 158</td></tr>
    <tr><td>Gateway call for Asha</td><td>charge(18400, 'tok_asha')</td></tr>
    <tr><td>Chen before rounding</td><td>52.5 → round → 52 (half to even); board rule half up → 53, total 311</td></tr>
    <tr><td>Daily report, 20,000 orders</td><td>1.67 s (list membership) → 20 ms (set)</td></tr>
  </table>
  <h3>Reading order and one idea per note</h3>
  <div class="cards">
    <div><b>1. Testing with pytest</b><p>A test is a hand-worked example the computer re-checks forever.</p><small><a class="xref" data-note="py_pytest">open</a></small></div>
    <div><b>2. Mocks &amp; Test Doubles</b><p>Replace the outside world, keep your logic real, patch where it's used.</p><small><a class="xref" data-note="py_mocking">open</a></small></div>
    <div><b>3. Debugging, Profiling &amp; Logging</b><p>Never guess: look (traceback, pdb, profiler, log); end every fix with a test.</p><small><a class="xref" data-note="py_debugging">open</a></small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Eye checks instead of tests; expected values computed by the code; <code>==</code> on floats; real network in unit tests; patching where defined; mocking your own logic; top-down traceback reading; optimising without profiling; print and <code>log.error(str(e))</code> in production; fixing without a regression test.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>A test is red. Which tool next?</td><td>Debugging: read the failure/traceback, then pdb or <code>pytest --pdb</code></td></tr>
    <tr><td>Why can't the checkout test call the real gateway?</td><td>Slow, flaky, costly, uncontrollable; use a double</td></tr>
    <tr><td>The report is correct but slow. Debugger or profiler?</td><td>Profiler (cProfile, then line_profiler)</td></tr>
    <tr><td>Why logging rather than print in the till?</td><td>Levels, time, source, file/console routing, tracebacks</td></tr>
    <tr><td>What is the last step of fixing any bug?</td><td>Keep a regression test and run the whole suite</td></tr>
  </table>

  <h2 id="pt-qa"><span class="num">06</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are the five questions of this group, in order?</summary><div class="qa-body">Does it work (and keep working)? → tests. Can we check it without the outside world? → mocks. It's broken: where and why? → debugging. It's slow or big: where? → profiling. What happened when nobody was watching? → logging.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we need tests if we can run the code and look?</summary><div class="qa-body">Looking checks only the inputs you tried, only once. The ₹150 boundary bug passed the eye check (184 74 52 still printed). A test with the edge case re-checks it after every change, in milliseconds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we need mocks if we have tests?</summary><div class="qa-body">Some code calls the outside world (a payment gateway). Real calls make tests slow, flaky and costly, and can't be made to fail on demand. Doubles keep tests fast and repeatable while still running our own logic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we need a debugger if we have tests?</summary><div class="qa-body">A failing test tells you <em>that</em> a rule is broken and the wrong value, not which line produced it or why. Tracebacks, pdb and post-mortem show the program's state at the moment it went wrong (Chen's 52.5 → round → 52).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we need a profiler if we have a debugger?</summary><div class="qa-body">Slow code has no wrong value to find. Stepping through 20,000 orders in pdb won't show that one line takes 87.7% of the time; a profiler measures time per function and per line.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we need logging if we have all the others?</summary><div class="qa-body">They all need someone running the program and watching. In production the program runs alone; only what it recorded (with levels, times, sources and tracebacks) can tell you what happened.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In which order should you read the notes, and why?</summary><div class="qa-body">Testing with pytest → Mocks &amp; Test Doubles → Debugging, Profiling &amp; Logging. Mocks live inside tests and use fixtures; the debugging method starts with a failing test and ends with a regression test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does the group close into a loop?</summary><div class="qa-body">Logs or a customer report reveal a problem → reproduce it as a failing test → debug/profile to find the cause → fix → keep the test. The rounding fix went exactly this way and the suite grew from 42 to 49 tests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: which earlier Python idea does each note lean on most?</summary><div class="qa-body">pytest: functions and exceptions (tests are functions; <code>pytest.raises</code>), plus context managers (yield fixtures). Mocks: modules and names (patch where it's used), classes (fakes), decorators (<code>@patch</code>). Debugging: exceptions and the call stack (tracebacks, frames); files (log files).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip each link?</summary><div class="qa-body">No tests: regressions reach customers. No doubles: tests are slow and flaky, so people stop running them. No debugging skills: fixes are guesses. No profiling: hours spent optimising the wrong code. No logging: production failures leave no evidence.</div></details>
</main>
`
});
