// notes/python/py_pytest.js — Testing with pytest
Object.assign(TOPIC_CONTENT, {
  "py_pytest": `<main>
<h1>Testing with pytest</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>Testing with pytest</span></div>
  <p class="lead">A <strong>test</strong> is a small program that runs your code on an input whose right answer you already know, and checks the answer. <strong>pytest</strong> is the tool that finds those small programs, runs all of them in a second, and tells you exactly what broke. This note builds a test suite for the Chai Corner till (<code>bill(asha)</code> must be ₹184) one need at a time: why tests exist (a boundary bug that slipped past a human check), your first test, reading a failure report line by line, arrange–act–assert, testing errors with <code>pytest.raises</code>, <code>parametrize</code>, fixtures (setup and teardown traced, scopes, <code>tmp_path</code>), <code>conftest.py</code> and markers, coverage, floats, tables and models, a short look at <code>unittest</code>, good test design, and finally the TDD loop traced on a new feature (splitting the bill). Every run shown is a real pytest 9.1 session on Python 3.13 (folder paths shortened to <code>~/chai</code>).</p>

  <h2 id="pyt-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 200" width="660">
<defs><marker id="pyt-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="200" y="8" width="260" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="26" text-anchor="middle" font-size="12">Making Code Trustworthy: the map</text><text x="330" y="41" text-anchor="middle" class="tm" font-size="10">does it work? → is it isolated? → where is it broken / slow?</text>
<line x1="270" y1="48" x2="110" y2="86" stroke="currentColor" marker-end="url(#pyt-a0)"/><line x1="330" y1="48" x2="330" y2="86" stroke="currentColor" marker-end="url(#pyt-a0)"/><line x1="390" y1="48" x2="550" y2="86" stroke="currentColor" marker-end="url(#pyt-a0)"/>
<rect x="20" y="88" width="180" height="52" rx="8" class="fg sg" stroke-width="3"/><text x="110" y="110" text-anchor="middle" font-size="12.5" font-weight="700">Testing with pytest</text><text x="110" y="128" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<line x1="200" y1="114" x2="238" y2="114" stroke="currentColor" marker-end="url(#pyt-a0)"/>
<rect x="240" y="88" width="180" height="52" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="110" text-anchor="middle" font-size="12">Mocks &amp; Test Doubles</text><text x="330" y="128" text-anchor="middle" class="tm" font-size="10">fake the payment gateway</text>
<line x1="420" y1="114" x2="458" y2="114" stroke="currentColor" marker-end="url(#pyt-a0)"/>
<rect x="460" y="88" width="180" height="52" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="550" y="106" text-anchor="middle" font-size="12">Debugging, Profiling</text><text x="550" y="121" text-anchor="middle" font-size="12">&amp; Logging</text><text x="550" y="135" text-anchor="middle" class="tm" font-size="10">find what's wrong</text>
<text x="330" y="172" text-anchor="middle" class="tm" font-size="10.5">stands on: Functions · Exceptions · Modules · Files · Context Managers</text>
<text x="330" y="190" text-anchor="middle" class="tm" font-size="10.5">leads to: CI (run tests on every push) · MLOps</text>
</svg><figcaption>The first concept note of the group. Mocks need tests to live in; debugging starts from a failing test.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_functions">Functions</a></b><span>The till is a handful of small functions: <code>subtotal</code>, <code>discount</code>, <code>with_tax</code>, <code>bill</code>. Asha pays ₹184, Ben ₹74, Chen ₹52. Left open: how do we <em>know</em> they are right, and stay right after the next change? Checking by eye does not scale and is forgotten. <a class="xref" data-note="py_exceptions">Exceptions</a> (for <code>raise</code>/<code>pytest.raises</code>), <a class="xref" data-note="py_modules">Modules</a> (importing <code>till</code> into a test file) and <a class="xref" data-note="py_context">Context Managers</a> (the <code>with</code> block, <code>yield</code> teardown) are used here.</span></li>
    <li><b>This note adds: automatic checks</b><span>Tests as plain functions with <code>assert</code>; pytest to find, run and report them; parametrize, fixtures and conftest to keep many tests short; coverage to see what is never run; TDD to let tests drive new code.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a></b><span>A test that calls the real payment gateway is slow, flaky and costs money. Then <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>: a red test says <em>that</em> something is wrong, not <em>where</em>. Later, CI runs this suite on every push (<a class="xref" data-note="se_git">Git</a>, <a class="xref" data-note="mlops_deploy">MLOps</a>).</span></li>
  </ol>

  <h2 id="pyt-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Why test</b><span>Q: the till printed 184 74 52 and looked right, so why write tests? → A teammate changed <code>&gt;=</code> to <code>&gt;</code>; the eye check still showed 184 74 52, but an order of exactly ₹150 was now overcharged (₹158 instead of ₹142). A check written as code, run on every change, catches that. How do we write one?</span></li>
    <li><b>A first pytest test</b><span>Q: what is the smallest automatic check? → A function named <code>test_…</code> in a file named <code>test_….py</code> that <code>assert</code>s; <code>pytest</code> finds and runs it. But when it fails, what is it telling us?</span></li>
    <li><b>Reading a failure report</b><span>Q: what do the <code>&gt;</code>, <code>E</code> and summary lines mean? → Which line failed, what the values really were (<code>assert 158 == 142</code>), and where. But our tests so far only check happy answers…</span></li>
    <li><b>Arrange–Act–Assert and pytest.raises</b><span>Q: how do we test that bad input is refused? → Shape each test as arrange, act, assert; <code>with pytest.raises(ValueError, match=…)</code> passes only if the error happens. Without it, a −2 samosa order bills ₹−32. But one test per order means copy-paste…</span></li>
    <li><b>parametrize</b><span>Q: how do we run one test body on Asha, Ben, Chen, the ₹150 edge and the empty order? → <code>@pytest.mark.parametrize</code>: one row per case, each reported separately. But every test still builds its own orders and files…</span></li>
    <li><b>Fixtures</b><span>Q: how do tests share setup (and cleanup) without sharing state? → A fixture function, requested by parameter name; <code>yield</code> for teardown; scope for how often; <code>tmp_path</code> for a fresh folder. But fixtures in one file aren't visible to other files…</span></li>
    <li><b>conftest.py and markers</b><span>Q: how do we organise a folder of tests? → Shared fixtures in <code>conftest.py</code>; <code>@pytest.mark.integration</code> to tag slow tests and <code>-m</code> to pick them. Now: which parts of the till are tested at all?</span></li>
    <li><b>Coverage</b><span>Q: which lines did no test run? → <code>pytest --cov</code> lists missed lines (line 21: the error branch). But 100% coverage still let the <code>&gt;</code> bug through: covered ≠ checked. And some answers aren't exact integers…</span></li>
    <li><b>Floats, tables and models</b><span>Q: how do we test 184.275, a DataFrame, or a model? → <code>pytest.approx</code>, <code>pd.testing.assert_frame_equal</code>, seeds and thresholds. Older code bases may use another framework…</span></li>
    <li><b>unittest, briefly</b><span>Q: what is the built-in alternative? → <code>unittest.TestCase</code> classes with <code>self.assertEqual</code>; pytest runs those too. Tools aside, what makes a test good?</span></li>
    <li><b>Test design</b><span>Q: which cases, and how many asserts per test? → Edge cases (149/150, empty, negative), one behaviour per test (a combined test hid a second bug), watch each test fail once. Can tests come <em>before</em> the code?</span></li>
    <li><b>TDD</b><span>Q: how do we build a new feature (split ₹184 among 3) safely? → Red (write a failing test) → green (simplest code that passes) → refactor; traced in three loops to <code>[62, 61, 61]</code>. Then: tests that touch the payment gateway → <a class="xref" data-note="py_mocking">Mocks</a>.</span></li>
  </ol>

  <h2 id="pyt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Testing with pytest</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why and what</div>
        <ul>
          <li><b>Test</b> — code that runs your code on a known case and checks the answer</li>
          <li><b>Regression</b> — a bug that comes back; a test pins it</li>
          <li>Eye check missed <code>&gt;=</code> → <code>&gt;</code>: ₹158 not ₹142 at exactly ₹150</li>
          <li>💡 a taste test before every dish leaves the kitchen</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">pytest basics</div>
        <ul>
          <li><b>Discovery</b> — <code>test_*.py</code> files, <code>test_*</code> functions</li>
          <li><b>Plain assert</b> — pytest shows both sides on failure</li>
          <li><b>Report</b> — <code>&gt;</code> failing line, <code>E</code> real values, <code>file:line</code></li>
          <li><b>Flags</b> — <code>-v -q -k -x -s -m --lf --durations</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shape of a test</div>
        <ul>
          <li><b>Arrange · Act · Assert</b></li>
          <li><code>pytest.raises(ValueError, match="non-negative")</code></li>
          <li>"DID NOT RAISE" = the guard is missing</li>
          <li>One behaviour per test</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Less repetition</div>
        <ul>
          <li><b>parametrize</b> — rows → separate tests: <code>test_bill[at-150]</code></li>
          <li><b>Fixture</b> — setup by parameter name; <code>yield</code> = teardown</li>
          <li><b>Scope</b> — function (default) · module · session</li>
          <li><b>conftest.py</b> — shared fixtures, no import</li>
          <li><b>Built-ins</b> — <code>tmp_path</code>, <code>monkeypatch</code>, <code>caplog</code>, <code>capsys</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Measuring the suite</div>
        <ul>
          <li><b>Coverage</b> — <code>--cov=till --cov-report=term-missing</code></li>
          <li>⚠ 100% covered ≠ correct</li>
          <li><b>Markers</b> — <code>-m "not integration"</code></li>
          <li><b>Pyramid</b> — many unit, few integration, fewest end-to-end</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Special values</div>
        <ul>
          <li><b>Floats</b> — <code>pytest.approx(184.275)</code>, never <code>==</code></li>
          <li><b>DataFrames</b> — <code>pd.testing.assert_frame_equal</code></li>
          <li><b>Models</b> — seed, planted signal, threshold (acc &gt; 0.9)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">TDD loop</div>
        <ul>
          <li><b>Red</b> — write a failing test first</li>
          <li><b>Green</b> — simplest code that passes</li>
          <li><b>Refactor</b> — tidy while green</li>
          <li><code>split(184, 3) == [62, 61, 61]</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pyt-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Tests</span><span class="rm-sub">The ₹150 regression</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-first"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Your First pytest Tests</span><span class="rm-sub">assert, discovery, flags</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-report"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Reading a Failure Report</span><span class="rm-sub">Line by line</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-aaa"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Arrange–Act–Assert &amp; Errors</span><span class="rm-sub">pytest.raises</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-param"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">parametrize</span><span class="rm-sub">One body, many cases</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-fix"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Fixtures</span><span class="rm-sub">Setup, teardown, scope, tmp_path</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-conf"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">conftest.py &amp; Markers</span><span class="rm-sub">Organising a suite</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-cov"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Coverage</span><span class="rm-sub">What no test runs</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-num"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Floats, Tables &amp; Models</span><span class="rm-sub">approx, frames, seeds</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-ut"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">unittest, Briefly</span><span class="rm-sub">The built-in alternative</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-design"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Designing Good Tests</span><span class="rm-sub">Edges, one behaviour each</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-tdd"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">The TDD Loop</span><span class="rm-sub">Splitting the bill, traced</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Diagram + table</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The usual red herrings</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pyt-why"><span class="num">01</span>Why Tests: the ₹150 Regression</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can write the till and run it once to see 184, 74, 52. That tells us it worked <em>today</em>. How do we know it still works after the next person edits it, without someone remembering to check every case by hand?</p>
  </div>
  <h3>The running example</h3>
  <p>Chai Corner, the stall used in every Python note: masala chai ₹30, samosa ₹15, vada pav ₹20, cold coffee ₹90. Rules: a subtotal of ₹150 or more gets 10% off, then 5% GST is added, and the bill is rounded to whole rupees. Here is the till, exactly as built in <a class="xref" data-note="py_functions">Functions</a>, saved as <code>till.py</code>:</p>
  <div class="fx" data-lang="py">"""Chai Corner till: the billing rules."""
GST = 0.05

def subtotal(lines):
    """Add up qty * price over the lines of one order."""
    return sum(qty * price for item, qty, price in lines)

def discount(sub):
    """10% off when the subtotal is 150 or more."""
    return sub * 0.10 if sub &gt;= 150 else 0

def with_tax(amount, rate=GST):
    return amount + amount * rate

def bill(lines):
    """Final bill in whole rupees."""
    sub = subtotal(lines)
    return round(with_tax(sub - discount(sub)))</div>
  <table class="tbl"><caption>The cases we will test, worked by hand</caption>
    <tr><th>Order</th><th>Subtotal</th><th>Discount</th><th>After</th><th>+5% GST</th><th>Bill</th></tr>
    <tr><td>Asha: 2 chai, 3 samosa, 1 cold coffee</td><td>195</td><td>19.5</td><td>175.5</td><td>184.275</td><td>184</td></tr>
    <tr><td>Ben: 1 chai, 2 vada pav</td><td>70</td><td>0</td><td>70</td><td>73.5</td><td>74</td></tr>
    <tr><td>Chen: 2 samosa, 1 vada pav</td><td>50</td><td>0</td><td>50</td><td>52.5</td><td>52 (Python rounds halves to even)</td></tr>
    <tr><td>Five chai: exactly ₹150</td><td>150</td><td>15</td><td>135</td><td>141.75</td><td>142</td></tr>
  </table>
  <h3>The story: an eye check that missed a bug</h3>
  <p>The usual beginner check is a script that prints the bills, and a human who looks at the numbers:</p>
  <div class="fx" data-lang="py"># check_by_eye.py
from till import bill
asha = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
ben  = [("masala chai", 1, 30), ("vada pav", 2, 20)]
chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
print(bill(asha), bill(ben), bill(chen))      # looks right? 184 74 52</div>
  <div class="fx" data-lang="text">184 74 52</div>
  <p>Weeks later a teammate tidies <code>discount</code> and writes <code>sub &gt; 150</code> instead of <code>sub &gt;= 150</code>. They run the eye check again:</p>
  <div class="fx" data-lang="text">184 74 52</div>
  <p>Same numbers, so it "still works". But nobody's eye check had an order of exactly ₹150. A family orders five chai:</p>
  <div class="fx" data-lang="py">from till import bill
print(bill([("masala chai", 5, 30)]))</div>
  <div class="fx" data-lang="text">158</div>
  <p>₹158 instead of ₹142. The ₹150 customer loses the discount: 150 + 7.5 = 157.5, rounded to 158. Nothing crashed. The bug was found by an angry customer. This kind of bug, where something that used to work stops working after a change, is called a <strong>regression</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A restaurant kitchen taste-tests every dish before it leaves. A test suite is a set of taste tests that run automatically every time any cook changes the recipe. If the dal is suddenly too salty, the alarm goes off in the kitchen, not at the customer's table.</p></div>
  <p>The fix is not "look harder". It is to write the check as code, with the expected answer worked out by hand, including the edge case at exactly ₹150, so a computer can repeat it in milliseconds after every change. That code is a test; the next section writes it.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>test</strong> runs a piece of code on an input whose correct output is known in advance and checks the actual output against it. A <strong>regression</strong> is a bug in behaviour that previously worked. A <strong>regression test</strong> pins a behaviour (or a fixed bug) so it cannot silently change again.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"I ran it and it looked fine" checks only the cases you happened to try, only once, and only if you remember. Bugs live at edges (exactly 150, zero, empty, negative) that eye checks rarely include.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Your First pytest Tests.</b> We know we want checks written as code with hand-worked answers. What does such a check look like, and what runs it?</div>

  <h2 id="pyt-first"><span class="num">02</span>Your First pytest Tests</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want "bill(five chai) must be 142" written as code and repeated automatically. What is the smallest form of that, and how does a tool find and run many of them?</p>
  </div>
  <p>In plain words: a pytest test is an ordinary function whose name starts with <code>test_</code>, in a file whose name starts with <code>test_</code>. Inside, it calls your code and uses Python's <code>assert</code> statement: <code>assert condition</code> does nothing if the condition is true and raises <code>AssertionError</code> if it is false. You then type <code>pytest</code> in the terminal.</p>
  <div class="fx" data-lang="py"># test_till.py
from till import bill

asha = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
ben  = [("masala chai", 1, 30), ("vada pav", 2, 20)]

def test_big_order_gets_discount():
    assert bill(asha) == 184

def test_small_order_pays_full_price():
    assert bill(ben) == 74

def test_exactly_150_gets_discount():
    five_chai = [("masala chai", 5, 30)]          # subtotal exactly 150
    assert bill(five_chai) == 142                 # 150 - 15 = 135, +5% = 141.75</div>
  <p>Before running, predict: with the correct <code>&gt;=</code>, all three should pass. <code>-v</code> ("verbose") lists each test by name.</p>
  <div class="fx" data-lang="text">$ pytest -v test_till.py
============================= test session starts ==============================
platform linux -- Python 3.13.16, pytest-9.1.1, pluggy-1.7.0 -- ~/chai/.venv/bin/python
rootdir: ~/chai
collecting ... collected 3 items

test_till.py::test_big_order_gets_discount PASSED                        [ 33%]
test_till.py::test_small_order_pays_full_price PASSED                    [ 66%]
test_till.py::test_exactly_150_gets_discount PASSED                      [100%]

============================== 3 passed in 0.01s ===============================</div>
  <p>What happened, step by step:</p>
  <div class="flow"><span>find test_*.py</span><span>import it</span><span>collect test_* functions</span><span>call each one</span><span>assert passes or raises</span><span>report</span></div>
  <ol>
    <li><b>Discovery.</b> pytest looked in the current folder (and below) for files named <code>test_*.py</code> or <code>*_test.py</code>, found <code>test_till.py</code>, and imported it. Importing ran the <code>from till import bill</code> line, so <code>till.py</code> must be importable (see <a class="xref" data-note="py_modules">Modules</a>).</li>
    <li><b>Collection.</b> It collected every function whose name starts with <code>test</code>: 3 items. The lists <code>asha</code> and <code>ben</code> are ordinary module variables, not tests.</li>
    <li><b>Running.</b> It called each test with no arguments. No exception means PASSED; an <code>AssertionError</code> (or any other exception) means FAILED.</li>
    <li><b>Reporting.</b> The percentage is progress through the collected tests; the last line is the total and the time: 3 tests in 0.01 s. That speed is why tests can run after every change.</li>
  </ol>
  <p>Now put the teammate's <code>&gt;</code> back and run without <code>-v</code>. Each dot is a pass, <code>F</code> a failure:</p>
  <div class="fx" data-lang="text">$ pytest test_till.py
...
collected 3 items

test_till.py ..F                                                         [100%]
...
FAILED test_till.py::test_exactly_150_gets_discount - AssertionError: assert ...
========================= 1 failed, 2 passed in 0.03s ==========================</div>
  <p>The two tests that match the eye check still pass, and the edge-case test catches the regression in 0.03 seconds. The full report it printed (cut above) is the subject of the next section.</p>
  <table class="tbl"><caption>Command-line flags you will use every day</caption>
    <tr><th>Command</th><th>Does</th></tr>
    <tr><td><code>pytest</code></td><td>Run every test in this folder and below</td></tr>
    <tr><td><code>pytest -v</code> / <code>-q</code></td><td>One line per test / as quiet as possible</td></tr>
    <tr><td><code>pytest test_till.py::test_exactly_150_gets_discount</code></td><td>Run one test by its node id</td></tr>
    <tr><td><code>pytest -k "150 or split"</code></td><td>Only tests whose name matches the expression</td></tr>
    <tr><td><code>pytest -x</code> / <code>--lf</code></td><td>Stop at the first failure / re-run only the last failures</td></tr>
    <tr><td><code>pytest -s</code></td><td>Show <code>print</code> output (pytest normally captures it)</td></tr>
    <tr><td><code>pytest --tb=short</code> / <code>--tb=line</code></td><td>Shorter failure reports</td></tr>
    <tr><td><code>pytest --durations=3</code></td><td>List the three slowest tests</td></tr>
    <tr><td><code>pytest --collect-only -q</code></td><td>List the tests without running them</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>pytest</strong> is a test runner: it <strong>discovers</strong> test files and functions by naming convention, <strong>runs</strong> them, and <strong>reports</strong> passes and failures. A test <strong>passes</strong> if it returns without an exception. A test's <strong>node id</strong> is <code>file::function</code> (plus <code>[params]</code> for parametrized tests).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A file called <code>till_tests.py</code> or a function called <code>check_bill</code> is silently ignored: pytest only collects <code>test_*.py</code>/<code>*_test.py</code> and <code>test*</code> functions. If the summary says "collected 0 items", check the names first. Also never name a test file after a module it imports (<code>till.py</code> + <code>test/till.py</code>) or one will shadow the other.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Reading a Failure Report.</b> A red <code>F</code> tells us something broke. What exactly does pytest's long failure report say, and how do we read it quickly?</div>

  <h2 id="pyt-report"><span class="num">03</span>Reading a Failure Report</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The run with the <code>&gt;</code> bug printed a block full of <code>&gt;</code>, <code>E</code>, underscores and file names. Which parts matter, and in which order should we read them?</p>
  </div>
  <p>Here is the complete output of that failing run, exactly as pytest printed it:</p>
  <div class="fx" data-lang="text">============================= test session starts ==============================
platform linux -- Python 3.13.16, pytest-9.1.1, pluggy-1.7.0
rootdir: ~/chai
collected 3 items

test_till.py ..F                                                         [100%]

=================================== FAILURES ===================================
________________________ test_exactly_150_gets_discount ________________________

    def test_exactly_150_gets_discount():
        five_chai = [("masala chai", 5, 30)]          # subtotal exactly 150
&gt;       assert bill(five_chai) == 142                 # 150 - 15 = 135, +5% = 141.75
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
E       AssertionError: assert 158 == 142
E        +  where 158 = bill([('masala chai', 5, 30)])

test_till.py:14: AssertionError
=========================== short test summary info ============================
FAILED test_till.py::test_exactly_150_gets_discount - AssertionError: assert ...
========================= 1 failed, 2 passed in 0.03s ==========================</div>
  <table class="tbl"><caption>The report, line by line</caption>
    <tr><th>Line(s)</th><th>Means</th></tr>
    <tr><td><code>platform … rootdir … collected 3 items</code></td><td>Header: Python and pytest versions, the folder pytest treats as the project root, how many tests it found.</td></tr>
    <tr><td><code>test_till.py ..F</code></td><td>Progress: one character per test in file order. <code>.</code> pass, <code>F</code> fail, <code>E</code> error outside the test body (e.g. in a fixture), <code>s</code> skipped, <code>x</code> expected failure.</td></tr>
    <tr><td><code>____ test_exactly_150_gets_discount ____</code></td><td>Start of one failure's details, titled with the test name.</td></tr>
    <tr><td>the indented source</td><td>The test function's code up to the failing line.</td></tr>
    <tr><td><code>&gt;       assert bill(five_chai) == 142</code></td><td>The <code>&gt;</code> marks the line that raised. The <code>^^^^</code> underline marks the exact expression.</td></tr>
    <tr><td><code>E       AssertionError: assert 158 == 142</code></td><td>The most important line. pytest rewrote the assert so it shows the <em>real</em> value of each side: the left side was 158, we expected 142.</td></tr>
    <tr><td><code>E        +  where 158 = bill([('masala chai', 5, 30)])</code></td><td>Where 158 came from: the call and its argument. You now know the input that breaks the code without adding a print.</td></tr>
    <tr><td><code>test_till.py:14: AssertionError</code></td><td>File and line number of the failure, and the exception type.</td></tr>
    <tr><td><code>short test summary info</code></td><td>One line per failure (the node id + message): what you scan first in a big suite.</td></tr>
    <tr><td><code>1 failed, 2 passed in 0.03s</code></td><td>The totals.</td></tr>
  </table>
  <p>Reading order in practice: <b>summary line</b> (which test) → <b>E lines</b> (what was wrong: 158 instead of 142) → <b>&gt; line and file:line</b> (where) → only then the code around it. Here: 158 = 150 × 1.05 rounded, which is the price <em>without</em> the discount, so the discount branch did not fire at 150. That points straight at the comparison in <code>discount</code>.</p>
  <p>For collections pytest even explains the difference. A list comparison from section 12 fails like this:</p>
  <div class="fx" data-lang="text">E       assert [61, 61, 61] == [62, 61, 61]
E
E         At index 0 diff: 61 != 62
E         Use -v to get more diff</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cricket scorecard after a wicket: the summary ("out, caught") first, then the detail (bowler, fielder, over and ball). You read the headline, then go to the exact ball only if you need it.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Assertion rewriting</strong>: pytest rewrites <code>assert</code> statements in test files at import time so that a failing assert reports the evaluated sub-expressions. A <strong>failure</strong> is an assertion or exception inside the test; an <strong>error</strong> is an exception during setup or teardown (fixtures) or collection (e.g. an <code>ImportError</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Assertion rewriting only applies to test modules (and <code>conftest.py</code>). An <code>assert</code> inside <code>till.py</code> fails with a bare <code>AssertionError</code>. And never write <code>assert (x == 1, "msg")</code>: a non-empty tuple is always true, so it never fails.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Arrange–Act–Assert and Testing Errors.</b> Our tests check correct answers for good input. What should a well-shaped test look like, and how do we test that bad input (a negative quantity) is <em>refused</em>?</div>

  <h2 id="pyt-aaa"><span class="num">04</span>Arrange–Act–Assert and Testing Errors</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A waiter mistypes "−2 samosa". The till should refuse, not bill a negative amount. A test that expects an exception must pass <em>when</em> the code crashes. How can a test expect an error, and how should any test be laid out so it is easy to read?</p>
  </div>
  <h3>The shape of every test</h3>
  <p>Good tests follow three steps, usually separated by a blank line: <b>Arrange</b> (build the input), <b>Act</b> (call the code once), <b>Assert</b> (check the result). One test, one action, one reason to fail.</p>
  <div class="cards">
    <div><b>Arrange</b><p><code>five_chai = [("masala chai", 5, 30)]</code></p></div>
    <div><b>Act</b><p><code>result = bill(five_chai)</code></p></div>
    <div><b>Assert</b><p><code>assert result == 142</code></p></div>
  </div>
  <h3>Making the till refuse bad input</h3>
  <p>First the behaviour we want. Without a check, a negative line silently bills a negative amount: −2 × 15 = −30, plus 5% = −31.5, which rounds to ₹−32 (halves go to the even number). So we add a guard to <code>bill</code> (raising exceptions is taught in <a class="xref" data-note="py_exceptions">Exceptions</a>):</p>
  <div class="fx" data-lang="py">def bill(lines):
    """Final bill in whole rupees. Refuses negative quantities."""
    for item, qty, price in lines:
        if qty &lt; 0:
            raise ValueError(f"qty must be non-negative, got {qty} for {item!r}")
    sub = subtotal(lines)
    return round(with_tax(sub - discount(sub)))</div>
  <div class="fx" data-lang="py">try:
    bill([("samosa", -2, 15)])
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">ValueError: qty must be non-negative, got -2 for 'samosa'</div>
  <h3>pytest.raises</h3>
  <p><code>pytest.raises</code> is a context manager (a <code>with</code> block, see <a class="xref" data-note="py_context">Context Managers</a>). The block must raise the named exception: if it does, the exception is caught and the test continues; if it doesn't, the test fails with "DID NOT RAISE". <code>match=</code> is a regular expression searched in the message. <code>as info</code> keeps the exception for more checks.</p>
  <div class="fx" data-lang="py"># test_errors.py
import pytest
from till import bill

def test_negative_qty_is_refused():
    # Arrange
    bad = [("samosa", -2, 15)]
    # Act + Assert: the call must raise, with a helpful message
    with pytest.raises(ValueError, match="non-negative"):
        bill(bad)

def test_error_names_the_item():
    with pytest.raises(ValueError) as info:
        bill([("vada pav", -1, 20)])
    assert "vada pav" in str(info.value)</div>
  <div class="fx" data-lang="text">$ pytest -q test_errors.py
..                                                                       [100%]
2 passed in 0.01s</div>
  <p>Now prove the tests can fail: delete the guard from <code>bill</code> and run again.</p>
  <div class="fx" data-lang="text">$ pytest -q test_errors.py
FF                                                                       [100%]
=================================== FAILURES ===================================
_________________________ test_negative_qty_is_refused _________________________

    def test_negative_qty_is_refused():
        # Arrange
        bad = [("samosa", -2, 15)]
        # Act + Assert: the call must raise, with a helpful message
&gt;       with pytest.raises(ValueError, match="non-negative"):
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
E       Failed: DID NOT RAISE ValueError

test_errors.py:8: Failed
...
FAILED test_errors.py::test_negative_qty_is_refused - Failed: DID NOT RAISE V...
FAILED test_errors.py::test_error_names_the_item - Failed: DID NOT RAISE Valu...
2 failed in 0.01s</div>
  <p>"DID NOT RAISE ValueError" reads exactly as it should: the code accepted bad input. With the guard restored, both pass again.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Testing a smoke alarm. You don't only check that it stays quiet in clean air; you hold a smoking match under it and check that it <em>does</em> ring. <code>pytest.raises</code> is the match.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Arrange–Act–Assert (AAA)</strong> is the three-part layout of a test. <code>pytest.raises(Exc, match=regex)</code> asserts that the block raises <code>Exc</code> (or a subclass) whose message matches <code>regex</code>; <code>info.value</code> is the exception object.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Put only the one call that should raise inside the <code>with</code> block. If the Arrange step also sits inside and accidentally raises the same exception type, the test passes for the wrong reason. And <code>pytest.raises(Exception)</code> is too broad: a <code>TypeError</code> from a typo would also satisfy it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: parametrize.</b> We now have a test per case: Asha, Ben, ₹150, negative… Each is a near-copy of the last. How do we write the body once and feed it a table of cases?</div>

  <h2 id="pyt-param"><span class="num">05</span>parametrize: One Test, Many Cases</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The hand-worked table in section 01 has a row per order. Writing <code>test_asha</code>, <code>test_ben</code>, <code>test_chen</code>, <code>test_150</code>… copies the same two lines again and again. How do we turn the table itself into tests?</p>
  </div>
  <p><code>@pytest.mark.parametrize("names", rows)</code> is a decorator (see <a class="xref" data-note="py_decorators">Decorators</a>) that tells pytest: "run this test once per row, passing the row's values as these arguments". Each row becomes its own test with its own pass/fail.</p>
  <div class="fx" data-lang="py"># test_bill_cases.py
import pytest
from till import bill

@pytest.mark.parametrize("lines, expected", [
    ([("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)], 184),  # Asha
    ([("masala chai", 1, 30), ("vada pav", 2, 20)], 74),                         # Ben
    ([("samosa", 2, 15), ("vada pav", 1, 20)], 52),                              # Chen
    ([("masala chai", 5, 30)], 142),          # exactly 150: discount applies
    ([("cold coffee", 1, 90), ("vada pav", 2, 20), ("samosa", 1, 15)], 152),  # 145: no discount
    ([], 0),                                  # empty order
], ids=["asha", "ben", "chen", "at-150", "at-145", "empty"])
def test_bill(lines, expected):
    assert bill(lines) == expected</div>
  <p>Work the two new rows by hand first: 90 + 40 + 15 = 145 is under 150, so no discount: 145 × 1.05 = 152.25 → 152. The empty order has subtotal 0 → 0. <code>ids=</code> gives each row a readable name.</p>
  <div class="fx" data-lang="text">$ pytest -v test_bill_cases.py
...
collecting ... collected 6 items

test_bill_cases.py::test_bill[asha] PASSED                               [ 16%]
test_bill_cases.py::test_bill[ben] PASSED                                [ 33%]
test_bill_cases.py::test_bill[chen] PASSED                               [ 50%]
test_bill_cases.py::test_bill[at-150] PASSED                             [ 66%]
test_bill_cases.py::test_bill[at-145] PASSED                             [ 83%]
test_bill_cases.py::test_bill[empty] PASSED                              [100%]

============================== 6 passed in 0.02s ===============================</div>
  <p>Six rows, six tests. With the <code>&gt;</code> bug back in, only one row goes red, and the report names it:</p>
  <div class="fx" data-lang="text">$ pytest -q --tb=line test_bill_cases.py
...F..                                                                   [100%]
=================================== FAILURES ===================================
E   AssertionError: assert 158 == 142
     +  where 158 = bill([('masala chai', 5, 30)])
~/chai/test_bill_cases.py:13: AssertionError: assert 158 == 142
=========================== short test summary info ============================
FAILED test_bill_cases.py::test_bill[at-150] - AssertionError: assert 158 == 142
1 failed, 5 passed in 0.01s</div>
  <p>Notice the other five rows still ran. In a hand-written loop inside one test, the first failing row would stop the loop and hide the others.</p>
  <p>Stacking two <code>parametrize</code> decorators gives every combination (a grid): 5 totals × 4 group sizes = 20 tests. Section 12 uses exactly that.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A teacher with one marking scheme and a stack of answer sheets. The scheme (test body) is written once; each sheet (row) gets its own mark, and one wrong sheet does not stop the others being marked.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>@pytest.mark.parametrize(argnames, argvalues, ids=…)</code> generates one test per element of <code>argvalues</code>, binding it to <code>argnames</code>. The generated tests are named <code>test_name[id]</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Don't compute the expected column with the code under test (<code>expected = bill(lines)</code>): the test then checks the code against itself and can never fail. Work expectations out by hand from the rules. (While writing this table, a hand calculation of a "₹149" row gave 157; pytest said 156, and 149 × 1.05 = 156.45 really is 156. When a fresh test fails, the expectation may be the bug.)</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Fixtures.</b> Rows remove copy-paste of the <em>check</em>. But many tests also need the same <em>setup</em>: the three orders, a menu, a folder to write files to, and cleanup afterwards. Where does shared setup go?</div>

  <h2 id="pyt-fix"><span class="num">06</span>Fixtures: Setup, Teardown and Scope</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Several tests need the same orders, an open menu file, a fresh empty order, a temporary folder. Copying setup into each test is noisy; building it once and sharing it lets one test's changes leak into the next. How do tests get shared setup <em>and</em> stay independent?</p>
  </div>
  <p>A <strong>fixture</strong> is a function marked <code>@pytest.fixture</code> that prepares something for tests. A test asks for it simply by having a parameter with the fixture's name; pytest sees the name, runs the fixture, and passes in the result. You never call a fixture yourself. If the fixture uses <code>yield</code> instead of <code>return</code>, the code after <code>yield</code> runs after the test: that is the cleanup (teardown), just like the exit part of a context manager.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The stall's prep station. Before service, chopped onions and boiled potatoes sit in labelled bowls; a cook says "I need potatoes" and is handed a bowl. Some prep is once for the whole evening (the big pot of chai masala), some is fresh for every plate (a clean cup). That difference is the fixture's <em>scope</em>.</p></div>
  <h3>Traced: who runs when</h3>
  <p>The menu is opened once for the whole file (<code>scope="module"</code>) and closed at the end; each test gets a fresh empty order (the default, <code>scope="function"</code>). Prints make the order visible; <code>-s</code> shows them.</p>
  <div class="fx" data-lang="py"># test_scope.py
import pytest
from till import bill

@pytest.fixture(scope="module")
def menu():
    print("\\n[open menu file once]")
    yield {"masala chai": 30, "samosa": 15, "vada pav": 20, "cold coffee": 90}
    print("\\n[close menu file]")              # after yield = teardown

@pytest.fixture                               # default scope="function"
def order(menu):                              # a fixture can use another fixture
    print("[fresh empty order]", end=" ")
    return []

def test_add_chai(menu, order):
    order.append(("masala chai", 2, menu["masala chai"]))
    assert bill(order) == 63                  # 60 + 5% = 63

def test_add_coffee(menu, order):
    order.append(("cold coffee", 1, menu["cold coffee"]))
    assert len(order) == 1                    # chai from the last test is NOT here
    assert bill(order) == 94                  # 90 + 4.5 = 94.5 -&gt; 94

def test_order_starts_empty(order):
    assert order == []</div>
  <p>Predict the printed order before reading the output.</p>
  <div class="fx" data-lang="text">$ pytest -q -s test_scope.py

[open menu file once]
[fresh empty order] .[fresh empty order] .[fresh empty order] .
[close menu file]

3 passed in 0.01s</div>
  <table class="tbl"><caption>Trace of the run</caption>
    <tr><th>Step</th><th>What pytest did</th><th>Printed</th></tr>
    <tr><td>1</td><td><code>test_add_chai</code> needs <code>menu</code>: none exists yet for this module → run <code>menu</code> up to <code>yield</code></td><td>[open menu file once]</td></tr>
    <tr><td>2</td><td>It needs <code>order</code> (function scope) → run it, get a new <code>[]</code></td><td>[fresh empty order]</td></tr>
    <tr><td>3</td><td>Run the test: 2 chai = 60 → 63; pass</td><td>.</td></tr>
    <tr><td>4</td><td><code>test_add_coffee</code>: reuse the same <code>menu</code>; build a <em>new</em> <code>order</code></td><td>[fresh empty order] .</td></tr>
    <tr><td>5</td><td><code>test_order_starts_empty</code>: new <code>order</code>, still empty</td><td>[fresh empty order] .</td></tr>
    <tr><td>6</td><td>Last test in the module done → resume <code>menu</code> after <code>yield</code></td><td>[close menu file]</td></tr>
  </table>
  <p>What breaks with the wrong scope? Change <code>order</code> to <code>scope="module"</code> so all tests share one list:</p>
  <div class="fx" data-lang="text">$ pytest -q -s --tb=line test_scope.py

[open menu file once]
[fresh empty order] .FF
[close menu file]

=================================== FAILURES ===================================
E   AssertionError: assert 2 == 1
     +  where 2 = len([('masala chai', 2, 30), ('cold coffee', 1, 90)])
~/chai/test_scope.py:21: AssertionError: assert 2 == 1
E   AssertionError: assert [('masala cha...ffee', 1, 90)] == []

      Left contains 2 more items, first extra item: ('masala chai', 2, 30)
      Use -v to get more diff
~/chai/test_scope.py:25: AssertionError: assert [('masala cha...ffee', 1, 90)] == []
...
2 failed, 1 passed in 0.01s</div>
  <p>Only one "fresh empty order" this time, so Asha's chai leaked into the coffee test and the "starts empty" test. Tests now depend on the order they run in, the worst kind of flaky.</p>
  <table class="tbl"><caption>Scopes</caption>
    <tr><th>scope=</th><th>Built</th><th>Use for</th></tr>
    <tr><td><code>"function"</code> (default)</td><td>Once per test</td><td>Anything a test might change: orders, lists, DataFrames</td></tr>
    <tr><td><code>"class"</code></td><td>Once per test class</td><td>Grouped tests sharing read-only data</td></tr>
    <tr><td><code>"module"</code></td><td>Once per test file</td><td>Expensive and read-only: the menu, a loaded model</td></tr>
    <tr><td><code>"package"</code> / <code>"session"</code></td><td>Once per package / whole run</td><td>A database server, a big read-only dataset</td></tr>
  </table>
  <h3>Built-in fixtures, including tmp_path</h3>
  <p>pytest ships with fixtures you can request by name. The one you will use most is <code>tmp_path</code>: a brand-new empty folder (a <code>pathlib.Path</code>) for each test, so tests that write files never collide and never litter your project. Section 07 uses it to save the day's bills to CSV (file handling itself is in <a class="xref" data-note="py_files">Files</a>).</p>
  <table class="tbl">
    <tr><th>Built-in fixture</th><th>Gives you</th><th>Used in</th></tr>
    <tr><td><code>tmp_path</code></td><td>A fresh temporary folder per test</td><td>section 07</td></tr>
    <tr><td><code>monkeypatch</code></td><td>Replace attributes / env vars, undone after the test</td><td><a class="xref" data-note="py_mocking">Mocks</a></td></tr>
    <tr><td><code>caplog</code></td><td>Captured log records</td><td><a class="xref" data-note="py_debugging">Logging</a></td></tr>
    <tr><td><code>capsys</code></td><td>Captured stdout/stderr (<code>capsys.readouterr().out</code>)</td><td>testing printed receipts</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>fixture</strong> provides a test's inputs or resources and is injected by parameter name (a form of dependency injection). Code before <code>yield</code> is <strong>setup</strong>, after it is <strong>teardown</strong>, and teardown runs even if the test fails. <strong>Scope</strong> sets how long one fixture value lives: function, class, module, package or session.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A wide scope for something tests change. Keep module/session scope for read-only things only. If a test needs to modify a shared object, give it a function-scoped copy.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: conftest.py and Markers.</b> A fixture defined in <code>test_scope.py</code> exists only in that file. With several test files that all need the three orders, where do shared fixtures live, and how do we separate fast tests from slow ones that touch real files?</div>

  <h2 id="pyt-conf"><span class="num">07</span>conftest.py, Markers and Kinds of Tests</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The till's tests are spreading over several files. Each needs the same orders, and one of them writes a real CSV file, which is slower than pure arithmetic. How do we share fixtures across files and choose which tests to run?</p>
  </div>
  <p>A file named <code>conftest.py</code> is loaded by pytest automatically; its fixtures are visible to every test file in the same folder and below, with no import. <code>pytest.ini</code> (or <code>pyproject.toml</code>) holds settings, including the names of your <strong>markers</strong>: labels like <code>@pytest.mark.integration</code> that <code>-m</code> uses to select tests.</p>
  <div class="fx" data-lang="text">~/chai/
├── till.py
├── pytest.ini
└── tests/
    ├── conftest.py        # shared fixtures
    ├── test_bill.py
    └── test_files.py</div>
  <div class="fx" data-lang="text"># pytest.ini
[pytest]
testpaths = tests
pythonpath = .
markers =
    integration: slower tests that touch real files, databases or services</div>
  <div class="fx" data-lang="py"># tests/conftest.py: fixtures here are visible to every test file in tests/, no import needed
import pytest

@pytest.fixture
def orders():
    return {
        "Asha": [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)],
        "Ben":  [("masala chai", 1, 30), ("vada pav", 2, 20)],
        "Chen": [("samosa", 2, 15), ("vada pav", 1, 20)],
    }</div>
  <div class="fx" data-lang="py"># tests/test_bill.py
from till import bill

def test_day_total(orders):                       # 'orders' comes from conftest.py
    assert sum(bill(lines) for lines in orders.values()) == 310

def test_each_bill(orders):
    assert {name: bill(lines) for name, lines in orders.items()} == {
        "Asha": 184, "Ben": 74, "Chen": 52}</div>
  <p>For the file test we add two small functions to <code>till.py</code>: <code>save_day(bills, path)</code> writes <code>{customer: amount}</code> as CSV and <code>load_day(path)</code> reads it back as ints. The test uses two fixtures at once, ours and the built-in <code>tmp_path</code>:</p>
  <div class="fx" data-lang="py"># tests/test_files.py
import pytest
from till import bill, save_day, load_day

@pytest.mark.integration
def test_day_survives_csv_round_trip(orders, tmp_path):
    path = tmp_path / "day.csv"                   # a fresh, empty folder per test
    bills = {name: bill(lines) for name, lines in orders.items()}
    save_day(bills, path)
    print("\\nwrote", path.name, "in", path.parent.name)
    print(path.read_text())
    assert load_day(path) == bills                # ints come back as ints, not "184"</div>
  <div class="fx" data-lang="text">$ pytest -v -s
...
rootdir: ~/chai
configfile: pytest.ini
testpaths: tests
collecting ... collected 3 items

tests/test_bill.py::test_day_total PASSED
tests/test_bill.py::test_each_bill PASSED
tests/test_files.py::test_day_survives_csv_round_trip
wrote day.csv in test_day_survives_csv_round_tr0
customer,amount
Asha,184
Ben,74
Chen,52

PASSED

============================== 3 passed in 0.06s ===============================
$ pytest -q -m "not integration"
..                                                                       [100%]
2 passed, 1 deselected in 0.01s
$ pytest -q -m integration
.                                                                        [100%]
1 passed, 2 deselected in 0.05s</div>
  <p>Read it: pytest picked up <code>pytest.ini</code> (<code>configfile</code>) and searched only <code>tests/</code>. Both files received <code>orders</code> without importing it. <code>tmp_path</code> was a folder named after the test; the CSV had a header and three rows; reading it back gave ints equal to the originals (the classic file bug is getting <code>"184"</code> strings back). <code>-m "not integration"</code> ran the 2 fast tests and <em>deselected</em> the file test; <code>-m integration</code> ran only it.</p>
  <h3>Unit, integration, end-to-end</h3>
  <p>The two arithmetic tests are <strong>unit tests</strong>: one function, no files or network, milliseconds. The CSV test is an <strong>integration test</strong>: our code working together with something real (the file system). An <strong>end-to-end</strong> test would drive the whole till: take an order, bill it, charge the card, print the receipt. Each catches different bugs, at different cost.</p>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
    <polygon points="230,15 290,60 170,60" class="fr"/><text x="207" y="52">E2E</text>
    <polygon points="170,64 290,64 350,108 110,108" class="fv"/><text x="190" y="92">Integration</text>
    <polygon points="110,112 350,112 410,156 50,156" class="fg"/><text x="210" y="140">Unit</text>
    <text x="300" y="40" class="tm">few · slow · realistic</text>
    <text x="360" y="92" class="tm">real files, DB</text>
    <text x="418" y="140" class="tm">many, ms each</text>
  </svg><figcaption>The test pyramid: width = how many tests of that kind you keep. Many fast unit tests at the base; a few realistic, slow end-to-end tests at the top.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Unit</th><th>Integration</th><th>End-to-end</th></tr>
    <tr><td>Scope</td><td>One function</td><td>Code + a real file/DB/service</td><td>The whole app</td></tr>
    <tr><td>Chai Corner example</td><td><code>bill(asha) == 184</code></td><td>bills survive a CSV round trip</td><td>order → bill → charge → receipt</td></tr>
    <tr><td>Speed</td><td>ms</td><td>10 ms – seconds</td><td>seconds – minutes</td></tr>
    <tr><td>Catches</td><td>Logic bugs</td><td>Wiring bugs: types, paths, formats</td><td>"Does it work for a user?"</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Building a cycle: unit tests check each part on the bench (the brake squeezes), integration tests fit the brake to the wheel, the end-to-end test is a ride round the block. Thousands of bench checks, a few rides.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>conftest.py</strong>: a per-directory plugin file whose fixtures and hooks apply to that directory's tests. A <strong>marker</strong> (<code>@pytest.mark.name</code>) tags a test; <code>-m EXPR</code> selects by marker. Built-in markers include <code>skip</code>, <code>skipif</code>, <code>xfail</code> and <code>parametrize</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Integration tests aimed at shared real resources (the stall's live database, the real payment gateway) are slow, flaky and dangerous. Use <code>tmp_path</code>, a throwaway SQLite file, or a stand-in, which is exactly the subject of <a class="xref" data-note="py_mocking">Mocks</a>. Unregistered markers also cause a warning: list them in <code>pytest.ini</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Coverage.</b> We have a growing suite. But which lines of <code>till.py</code> has no test ever run? An untested branch is where the next bug will hide.</div>

  <h2 id="pyt-cov"><span class="num">08</span>Coverage: What No Test Runs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"We have tests" is not the same as "every rule is tested". Is there a line in <code>till.py</code> that none of our tests executes?</p>
  </div>
  <p><strong>Coverage</strong> measures which lines (and branches) of your code ran while the tests ran. The <code>pytest-cov</code> plugin (<code>pip install pytest-cov</code>, which installs the <code>coverage</code> package) adds <code>--cov</code>. <code>--cov-report=term-missing</code> lists the line numbers that never ran. Here it is on the three tests of section 07:</p>
  <div class="fx" data-lang="text">$ pytest -q --cov=till --cov-report=term-missing
...                                                                      [100%]
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.13.16-final-0 _______________

Name      Stmts   Miss  Cover   Missing
---------------------------------------
till.py      23      1    96%   21
---------------------------------------
TOTAL        23      1    96%
3 passed in 0.03s</div>
  <p>23 statements, 1 missed: line 21. Look it up:</p>
  <div class="fx" data-lang="text">17  def bill(lines):
18      """Final bill in whole rupees. Refuses negative quantities."""
19      for item, qty, price in lines:
20          if qty &lt; 0:
21              raise ValueError(f"qty must be non-negative, got {qty} for {item!r}")
22      sub = subtotal(lines)</div>
  <p>The guard has never fired in this suite. Adding the two tests from section 04 (<code>test_errors.py</code>) closes the gap:</p>
  <div class="fx" data-lang="text">$ pytest -q --cov=till --cov-report=term-missing
.....                                                                    [100%]
...
Name      Stmts   Miss  Cover   Missing
---------------------------------------
till.py      23      0   100%
---------------------------------------
TOTAL        23      0   100%
5 passed in 0.04s</div>
  <h3>100% is not "correct"</h3>
  <p>Now put the <code>&gt;</code> bug from section 01 back into <code>discount</code> and run the same five tests:</p>
  <div class="fx" data-lang="text">till.py      23      0   100%
---------------------------------------
TOTAL        23      0   100%
5 passed in 0.05s</div>
  <p>Still 100%, still green. Every line ran, but no test ran the line <em>with</em> a subtotal of exactly 150. Coverage tells you what is <em>untested</em>; it cannot tell you that what ran was checked well. The boundary test from section 02 is what catches this bug.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A security guard's patrol log shows every corridor was walked (100% coverage). It does not show that the guard looked in the rooms. Coverage finds the corridors nobody walks; it says nothing about how carefully the walked ones were checked.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Line (statement) coverage</strong> = executed statements ÷ total statements. <strong>Branch coverage</strong> (<code>--cov-branch</code>) also requires each <code>if</code> to go both ways. Coverage is a measure of test <em>reach</em>, not test <em>quality</em>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Chasing 100% with tests that call code but assert nothing (<code>bill(asha)</code> with no <code>assert</code>) raises the number and catches nothing. Use coverage to find untested rules, then write real checks for them. If <code>pytest-cov</code> isn't installed, <code>python -m coverage run -m pytest</code> then <code>python -m coverage report -m</code> does the same with the <code>coverage</code> package alone.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Floats, Tables and Models.</b> All our expected answers so far are whole rupees. What about 184.275 before rounding, a whole DataFrame of bills, or a model whose output is random?</div>

  <h2 id="pyt-num"><span class="num">09</span>Floats, Tables and Models</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>==</code> works for ₹184. Does it work for the GST amount 184.275, for a table of bills, or for a model that learns from random data?</p>
  </div>
  <h3>Floats: pytest.approx</h3>
  <p>Indian bills show GST as two halves, CGST 2.5% and SGST 2.5%. We add to <code>till.py</code>:</p>
  <div class="fx" data-lang="py">def gst_breakup(amount):
    """Indian GST is shown as two halves: CGST 2.5% + SGST 2.5%."""
    cgst = amount * 0.025
    sgst = amount * 0.025
    return cgst, sgst, amount + cgst + sgst</div>
  <p>By hand, for Asha's ₹175.5 after discount: 175.5 × 0.025 = 4.3875 each, total 175.5 + 4.3875 + 4.3875 = 184.275.</p>
  <div class="fx" data-lang="py"># test_numbers.py
import pytest
from till import gst_breakup

def test_gst_total_exact():
    cgst, sgst, total = gst_breakup(175.5)       # Asha after discount
    assert total == 184.275                      # by hand: 175.5 + 4.3875 + 4.3875

def test_gst_total_approx():
    cgst, sgst, total = gst_breakup(175.5)
    assert total == pytest.approx(184.275)       # equal within a tiny tolerance
    assert (cgst, sgst) == pytest.approx((4.3875, 4.3875))</div>
  <div class="fx" data-lang="text">$ pytest -q test_numbers.py
F.                                                                       [100%]
=================================== FAILURES ===================================
_____________________________ test_gst_total_exact _____________________________

    def test_gst_total_exact():
        cgst, sgst, total = gst_breakup(175.5)       # Asha after discount
&gt;       assert total == 184.275                      # by hand: 175.5 + 4.3875 + 4.3875
        ^^^^^^^^^^^^^^^^^^^^^^^
E       assert 184.27499999999998 == 184.275

test_numbers.py:6: AssertionError
...
1 failed, 1 passed in 0.01s</div>
  <p>The arithmetic is right, but floats are stored in binary and adding three of them lost a tiny amount (see <a class="xref" data-note="py_values">Values</a>). <code>pytest.approx</code> compares with a relative tolerance of one in a million by default, and works on tuples, lists and dicts too.</p>
  <h3>Tables: assert_frame_equal</h3>
  <p>A <code>day_table(orders)</code> function returns one pandas row per customer. Comparing DataFrames with <code>==</code> gives a table of True/False (and NaN never equals NaN); <code>pd.testing.assert_frame_equal</code> compares values, dtypes, index and column order and prints a readable diff.</p>
  <div class="fx" data-lang="py"># tables.py
import pandas as pd
from till import subtotal, bill

def day_table(orders):
    """One row per customer: subtotal and bill. Never changes \`orders\`."""
    rows = [(name, subtotal(lines), bill(lines)) for name, lines in orders.items()]
    return pd.DataFrame(rows, columns=["customer", "subtotal", "bill"])</div>
  <div class="fx" data-lang="py"># test_tables.py
import pandas as pd
from tables import day_table

ORDERS = {
    "Asha": [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)],
    "Ben":  [("masala chai", 1, 30), ("vada pav", 2, 20)],
    "Chen": [("samosa", 2, 15), ("vada pav", 1, 20)],
}

def test_day_table():
    expected = pd.DataFrame({"customer": ["Asha", "Ben", "Chen"],
                             "subtotal": [195, 70, 50],
                             "bill": [184, 74, 52]})
    pd.testing.assert_frame_equal(day_table(ORDERS), expected)

def test_day_table_does_not_mutate_input():
    before = {k: list(v) for k, v in ORDERS.items()}
    day_table(ORDERS)
    assert ORDERS == before</div>
  <p>The second test checks a <strong>contract</strong>: the docstring promises not to change the input, and a test holds it to that promise.</p>
  <h3>Models: seeds, planted signal, thresholds</h3>
  <p>The same idea at scale: suppose the stall trains a small model to predict which tables order cold coffee. Training is random, so outputs vary. Three habits make it testable: fix randomness with a <strong>seed</strong>, train on data with a rule you <strong>planted</strong>, and assert a <strong>threshold</strong> rather than an exact score.</p>
  <div class="fx" data-lang="py"># test_model.py
import numpy as np
import pytest
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

@pytest.fixture
def coffee_data():
    """200 fake tables: [temperature_z, group_size_z, hour_z]. Planted rule:
    a table orders cold coffee when temp + 0.5 * size &gt; 0."""
    rng = np.random.default_rng(42)              # seeded: same data every run
    X = rng.normal(size=(200, 3))
    y = (X[:, 0] + 0.5 * X[:, 1] &gt; 0).astype(int)
    return X, y

def test_model_learns_planted_rule(coffee_data):
    X, y = coffee_data
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=0)
    acc = LogisticRegression().fit(Xtr, ytr).score(Xte, yte)
    assert acc &gt; 0.9                             # a threshold, never == 0.96

def test_probabilities_keep_their_contract(coffee_data):
    X, y = coffee_data
    proba = LogisticRegression().fit(X, y).predict_proba(X[:5])
    assert proba.shape == (5, 2)
    assert proba.sum(axis=1) == pytest.approx(np.ones(5))
    assert ((proba &gt;= 0) &amp; (proba &lt;= 1)).all()</div>
  <div class="fx" data-lang="text">$ pytest -q test_tables.py test_model.py
....                                                                     [100%]
4 passed in 1.14s</div>
  <p>The model's real accuracy here was 1.0, but the test only demands more than 0.9: a library update that moves it to 0.98 doesn't break the build, while a real bug (labels shuffled, wrong column) drops it near 0.5 and fails. The ML side is covered in depth in the ML notes and <a class="xref" data-note="mlops_deploy">MLOps</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Weighing tea on a shop scale: you accept 250 g ± 1 g, not exactly 250.000 g. <code>approx</code> is that tolerance; a threshold is "passes the exam", not "scores exactly 87.5".</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>pytest.approx(expected, rel=1e-6, abs=1e-12)</code> compares numbers (or containers of numbers) within a tolerance. A <strong>seed</strong> fixes a pseudo-random generator's start so runs repeat. A <strong>contract test</strong> checks properties that must always hold (shapes, ranges, input unchanged).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>assert 0.1 + 0.2 == 0.3</code> fails. Never compare computed floats with <code>==</code>, and never assert an exact model score. For money, the real fix is to avoid floats (integer paise or <code>Decimal</code>), which <a class="xref" data-note="py_debugging">Debugging</a> uses for the rounding bug.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: unittest, Briefly.</b> Everything so far is pytest style. Many existing projects use Python's built-in framework instead. What does it look like, and do we need to choose?</div>

  <h2 id="pyt-ut"><span class="num">10</span>unittest, Briefly</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>You open an older code base and the tests are classes with <code>self.assertEqual</code>. Is that a different world, and can pytest run it?</p>
  </div>
  <p><code>unittest</code> ships with Python. Tests are methods of a class that inherits from <code>unittest.TestCase</code> (classes are explained in <a class="xref" data-note="py_classes">Classes</a>); setup goes in <code>setUp</code>, and checks use assertion methods.</p>
  <div class="fx" data-lang="py"># test_unittest_style.py
import unittest
from till import bill

class TestBill(unittest.TestCase):
    def setUp(self):                       # runs before EACH test (like a function fixture)
        self.asha = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]

    def test_asha(self):
        self.assertEqual(bill(self.asha), 184)

    def test_negative_qty(self):
        with self.assertRaises(ValueError):
            bill([("samosa", -1, 15)])

if __name__ == "__main__":
    unittest.main()</div>
  <div class="fx" data-lang="text">$ python3 -m unittest -v test_unittest_style
test_asha (test_unittest_style.TestBill.test_asha) ... ok
test_negative_qty (test_unittest_style.TestBill.test_negative_qty) ... ok

----------------------------------------------------------------------
Ran 2 tests in 0.000s

OK
$ pytest -q test_unittest_style.py
..                                                                       [100%]
2 passed in 0.01s</div>
  <table class="tbl">
    <tr><th></th><th>unittest</th><th>pytest</th></tr>
    <tr><td>Test shape</td><td>Class + methods</td><td>Plain functions (classes optional)</td></tr>
    <tr><td>Checks</td><td><code>self.assertEqual</code>, <code>assertTrue</code>, <code>assertRaises</code>, …</td><td>Plain <code>assert</code>, rewritten for detail</td></tr>
    <tr><td>Setup</td><td><code>setUp</code>/<code>tearDown</code>, <code>setUpClass</code></td><td>Fixtures with scopes, composable</td></tr>
    <tr><td>Many cases</td><td><code>self.subTest</code> loop</td><td><code>parametrize</code></td></tr>
    <tr><td>Install</td><td>Built in</td><td><code>pip install pytest</code>; runs unittest tests too</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>unittest</strong> is Python's standard-library xUnit framework: <code>TestCase</code> subclasses, <code>test*</code> methods, <code>setUp</code>/<code>tearDown</code> hooks, <code>assert*</code> methods, run by <code>python -m unittest</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Inside a <code>TestCase</code>, plain <code>assert</code> works but under <code>python -m unittest</code> gives no detail; use the <code>self.assert*</code> methods there, or run with pytest. pytest fixtures cannot be passed as method arguments to <code>unittest.TestCase</code> tests.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Designing Good Tests.</b> We know the tools. Which cases should we write, how much should one test check, and how do we know a test can actually catch a bug?</div>

  <h2 id="pyt-design"><span class="num">11</span>Designing Good Tests</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A suite can be green and still useless: it may test only easy cases, or bundle so much into one test that a failure hides other bugs. What makes a test worth having?</p>
  </div>
  <h3>Choose cases at the edges</h3>
  <p>Bugs cluster where behaviour changes. For <code>bill</code>, list the rule boundaries and the odd inputs, then pick one case on each side:</p>
  <table class="tbl">
    <tr><th>Kind</th><th>Case</th><th>Expected</th><th>Why</th></tr>
    <tr><td>Typical</td><td>Asha, Ben</td><td>184, 74</td><td>The normal path, both branches of the discount</td></tr>
    <tr><td>Boundary</td><td>exactly 150 / 145</td><td>142 / 152</td><td><code>&gt;=</code> vs <code>&gt;</code> lives here</td></tr>
    <tr><td>Rounding</td><td>Chen (52.5)</td><td>52</td><td>Halves are where rounding rules differ</td></tr>
    <tr><td>Empty</td><td><code>[]</code></td><td>0</td><td>Loops that run zero times</td></tr>
    <tr><td>Invalid</td><td>qty −2</td><td>ValueError</td><td>The guard must fire</td></tr>
  </table>
  <h3>One behaviour per test</h3>
  <p>Here is the till with <em>two</em> bugs (the <code>&gt;</code> and a deleted guard), tested two ways: one test that checks everything, and three small tests.</p>
  <div class="fx" data-lang="py"># test_design.py
import pytest
from till import bill

def test_everything():                                  # one test, many behaviours
    assert bill([("masala chai", 5, 30)]) == 142        # boundary
    with pytest.raises(ValueError):                     # validation
        bill([("samosa", -1, 15)])
    assert bill([]) == 0                                # empty order

def test_discount_starts_at_150():                      # one behaviour each
    assert bill([("masala chai", 5, 30)]) == 142

def test_negative_qty_is_refused():
    with pytest.raises(ValueError):
        bill([("samosa", -1, 15)])

def test_empty_order_costs_nothing():
    assert bill([]) == 0</div>
  <div class="fx" data-lang="text">$ pytest -q --tb=no -rf test_design.py
FFF.                                                                     [100%]
=========================== short test summary info ============================
FAILED test_design.py::test_everything - AssertionError: assert 158 == 142
FAILED test_design.py::test_discount_starts_at_150 - AssertionError: assert 1...
FAILED test_design.py::test_negative_qty_is_refused - Failed: DID NOT RAISE V...
3 failed, 1 passed in 0.01s</div>
  <p><code>test_everything</code> stopped at its first assert and reported only the boundary bug; the missing guard was invisible in it. The small tests reported both bugs, by name, and showed that the empty order still works. Fix one bug, rerun, and the big test would only then reveal the second.</p>
  <h3>See every test fail once</h3>
  <p>A test that can't fail proves nothing. <code>assert bill(asha) == bill(asha)</code> always passes. After writing a test, break the code (or the expected value) on purpose and watch it go red, as we did in sections 02, 04 and 08. TDD (next section) builds this habit in.</p>
  <div class="cards">
    <div><b>Fast</b><p>Milliseconds each, so you run them all the time.</p></div>
    <div><b>Independent</b><p>Any order, any subset; fresh fixtures, <code>tmp_path</code>.</p></div>
    <div><b>Repeatable</b><p>No real network, clock or unseeded randomness (→ <a class="xref" data-note="py_mocking">Mocks</a>).</p></div>
    <div><b>Readable</b><p>Name says the behaviour: <code>test_discount_starts_at_150</code>.</p></div>
    <div><b>Behaviour, not code</b><p>Check what <code>bill</code> returns, not which helpers it calls.</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A car's dashboard with one "something is wrong" light versus separate oil, battery and brake lights. The single light hides the second fault until you fix the first.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>edge case</strong> (boundary case) is an input at or just beyond a point where behaviour changes. <strong>One behaviour per test</strong>: each test checks one rule, so its name and its failure say exactly which rule broke (several asserts about the <em>same</em> result are fine).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Testing implementation details (private helpers, exact call order) makes tests break on every harmless refactor, so people stop trusting them. Test through the public behaviour; the same warning returns as "over-mocking" in <a class="xref" data-note="py_mocking">Mocks</a>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The TDD Loop.</b> So far tests came after the code. The owner now wants a new feature: split a bill fairly between friends. Can tests come <em>first</em> and drive the code?</div>

  <h2 id="pyt-tdd"><span class="num">12</span>The TDD Loop: Splitting the Bill</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha and two friends want to split ₹184. The shares must be whole rupees, add up to exactly 184, and be as equal as possible. How do we write this so that every rule is tested and every test has been seen to fail?</p>
  </div>
  <p><strong>Test-driven development (TDD)</strong> is a loop: <b>red</b> (write a small test for the next rule; run it; watch it fail), <b>green</b> (write the simplest code that passes), <b>refactor</b> (clean up while all tests stay green). Repeat for the next rule.</p>
  <div class="flow"><span>red: failing test</span><span>green: simplest pass</span><span>refactor: tidy, stay green</span><span>next rule</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A tailor marks the measurements before cutting the cloth. The marks (tests) say exactly what "fits" means; cutting (code) follows them; trimming (refactor) never changes the measurements.</p></div>
  <h3>Loop 1: an even split</h3>
  <p><b>Red.</b> Rule: ₹90 among 3 is 30 each.</p>
  <div class="fx" data-lang="py"># test_split.py
from till import split

def test_split_even():
    assert split(90, 3) == [30, 30, 30]</div>
  <div class="fx" data-lang="text">$ pytest -q test_split.py
...
test_split.py:1: in &lt;module&gt;
    from till import split
E   ImportError: cannot import name 'split' from 'till' (~/chai/till.py)
=========================== short test summary info ============================
ERROR test_split.py
!!!!!!!!!!!!!!!!!!!! Interrupted: 1 error during collection !!!!!!!!!!!!!!!!!!!!
1 error in 0.08s</div>
  <p>Red, for the expected reason (no <code>split</code> yet: an <em>error</em> during collection, not a failure). <b>Green</b>, with the simplest thing that works:</p>
  <div class="fx" data-lang="py">def split(total, people):
    return [total // people] * people</div>
  <div class="fx" data-lang="text">$ pytest -q test_split.py
.                                                                        [100%]
1 passed in 0.00s</div>
  <h3>Loop 2: shares must add up</h3>
  <p><b>Red.</b> ₹184 among 3: 184 // 3 = 61, and 3 × 61 = 183, one rupee short. Rule: the leftover rupee goes to the first person, so <code>[62, 61, 61]</code>.</p>
  <div class="fx" data-lang="py">def test_split_uneven_shares_add_up():
    assert split(184, 3) == [62, 61, 61]       # first person pays the extra rupee</div>
  <div class="fx" data-lang="text">$ pytest -q test_split.py
.F                                                                       [100%]
=================================== FAILURES ===================================
_______________________ test_split_uneven_shares_add_up ________________________

    def test_split_uneven_shares_add_up():
&gt;       assert split(184, 3) == [62, 61, 61]       # first person pays the extra rupee
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
E       assert [61, 61, 61] == [62, 61, 61]
E
E         At index 0 diff: 61 != 62
E         Use -v to get more diff

test_split.py:7: AssertionError
...
1 failed, 1 passed in 0.01s</div>
  <p>The report shows our simple version loses a rupee. <b>Green:</b></p>
  <div class="fx" data-lang="py">def split(total, people):
    share = total // people
    extra = total - share * people           # rupees left over: 184 - 183 = 1
    return [share + 1] * extra + [share] * (people - extra)</div>
  <div class="fx" data-lang="text">$ pytest -q test_split.py
..                                                                       [100%]
2 passed in 0.01s</div>
  <table class="tbl"><caption>Trace: split(184, 3)</caption>
    <tr><th>Step</th><th>Value</th></tr>
    <tr><td><code>share = 184 // 3</code></td><td>61</td></tr>
    <tr><td><code>extra = 184 - 61 * 3</code></td><td>1</td></tr>
    <tr><td><code>[62] * 1 + [61] * 2</code></td><td>[62, 61, 61] (sum 184)</td></tr>
  </table>
  <h3>Loop 3: nobody to pay</h3>
  <p><b>Red.</b> Rule: splitting among 0 people is a mistake and should say so clearly.</p>
  <div class="fx" data-lang="py">import pytest

def test_split_needs_at_least_one_person():
    with pytest.raises(ValueError, match="at least one"):
        split(184, 0)</div>
  <div class="fx" data-lang="text">$ pytest -q --tb=short test_split.py
..F                                                                      [100%]
=================================== FAILURES ===================================
_____________________ test_split_needs_at_least_one_person _____________________
test_split.py:13: in test_split_needs_at_least_one_person
    split(184, 0)
till.py:38: in split
    share = total // people
            ^^^^^^^^^^^^^^^
E   ZeroDivisionError: integer division or modulo by zero
=========================== short test summary info ============================
FAILED test_split.py::test_split_needs_at_least_one_person - ZeroDivisionErro...
1 failed, 2 passed in 0.01s</div>
  <p>It did raise, but the wrong exception (<code>ZeroDivisionError</code>), so <code>pytest.raises(ValueError)</code> let it through as a failure. <b>Green:</b> add <code>if people &lt; 1: raise ValueError("need at least one person")</code> at the top → <code>3 passed</code>.</p>
  <h3>Refactor, with a safety net</h3>
  <p>Now tidy: <code>divmod</code> gives quotient and remainder in one step, and a docstring states the rules. We also add property checks over a grid of cases (two stacked <code>parametrize</code> decorators), so the rules are tested far beyond the three examples:</p>
  <div class="fx" data-lang="py">def split(total, people):
    """Split a whole-rupee bill: shares differ by at most 1 and add up exactly."""
    if people &lt; 1:
        raise ValueError("need at least one person")
    share, extra = divmod(total, people)     # 184, 3 -&gt; (61, 1)
    return [share + 1] * extra + [share] * (people - extra)</div>
  <div class="fx" data-lang="py">@pytest.mark.parametrize("total", [0, 1, 52, 184, 310])
@pytest.mark.parametrize("people", [1, 2, 3, 7])
def test_split_properties(total, people):          # 5 x 4 = 20 tests
    shares = split(total, people)
    assert len(shares) == people
    assert sum(shares) == total                    # no rupee lost or invented
    assert max(shares) - min(shares) &lt;= 1          # fair to within a rupee</div>
  <div class="fx" data-lang="text">$ pytest -q test_split.py
.......................                                                  [100%]
23 passed in 0.02s</div>
  <p>3 example tests + 20 property tests, all green after the refactor. Every rule of <code>split</code> exists because a test demanded it, and every test was seen red once.</p>
  <h3>The whole suite</h3>
  <p>All the test files of this note together, in <code>tests/</code>, with the <code>pytest.ini</code> of section 07:</p>
  <div class="fx" data-lang="text">$ pytest -q
..........................................                               [100%]
42 passed in 1.12s
$ pytest -q -k "150 or split_even"
...                                                                      [100%]
3 passed, 39 deselected in 1.11s</div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Test-driven development</strong>: write a failing test for the next small behaviour (red), make it pass with the least code (green), then improve the code with the tests as a safety net (refactor). A <strong>property test</strong> checks a rule that must hold for many inputs (sum preserved, difference ≤ 1) rather than one exact output.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Skipping the red step. If a new test passes immediately, either the feature already existed or the test is wrong; find out which before moving on. And don't write five tests before any code: one red at a time keeps each step small.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One diagram and one table to see how each pytest idea grew out of the one before, all on the till.</div>

  <h2 id="pyt-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Twelve ideas: how is each built from the previous ones, which question does each answer, and what did each do for the till?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="pyt-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="48" rx="7" class="fr sr"/><text x="85" y="30" text-anchor="middle" font-size="12" font-weight="700">regression</text><text x="85" y="46" text-anchor="middle" class="tm" font-size="10">₹158 at exactly 150</text>
<line x1="160" y1="34" x2="183" y2="34" stroke="currentColor" marker-end="url(#pyt-a9)"/>
<rect x="185" y="10" width="150" height="48" rx="7" class="fb sb"/><text x="260" y="30" text-anchor="middle" font-size="12" font-weight="700">test + assert</text><text x="260" y="46" text-anchor="middle" class="tm" font-size="10">bill(five_chai) == 142</text>
<line x1="335" y1="34" x2="358" y2="34" stroke="currentColor" marker-end="url(#pyt-a9)"/>
<rect x="360" y="10" width="150" height="48" rx="7" class="fb sb"/><text x="435" y="30" text-anchor="middle" font-size="12" font-weight="700">failure report</text><text x="435" y="46" text-anchor="middle" class="tm" font-size="10">assert 158 == 142</text>
<line x1="510" y1="34" x2="533" y2="34" stroke="currentColor" marker-end="url(#pyt-a9)"/>
<rect x="535" y="10" width="135" height="48" rx="7" class="fb sb"/><text x="602" y="30" text-anchor="middle" font-size="12" font-weight="700">AAA + raises</text><text x="602" y="46" text-anchor="middle" class="tm" font-size="10">qty −2 → ValueError</text>
<line x1="602" y1="58" x2="602" y2="90" stroke="currentColor" marker-end="url(#pyt-a9)"/>
<rect x="485" y="92" width="185" height="48" rx="7" class="ft st"/><text x="577" y="112" text-anchor="middle" font-size="12" font-weight="700">parametrize</text><text x="577" y="128" text-anchor="middle" class="tm" font-size="10">6 rows → 6 tests</text>
<line x1="485" y1="116" x2="442" y2="116" stroke="currentColor" marker-end="url(#pyt-a9)"/>
<rect x="255" y="92" width="185" height="48" rx="7" class="ft st"/><text x="347" y="112" text-anchor="middle" font-size="12" font-weight="700">fixtures</text><text x="347" y="128" text-anchor="middle" class="tm" font-size="10">menu once, order per test</text>
<line x1="255" y1="116" x2="212" y2="116" stroke="currentColor" marker-end="url(#pyt-a9)"/>
<rect x="10" y="92" width="200" height="48" rx="7" class="ft st"/><text x="110" y="112" text-anchor="middle" font-size="12" font-weight="700">conftest + markers</text><text x="110" y="128" text-anchor="middle" class="tm" font-size="10">orders shared; -m integration</text>
<line x1="110" y1="140" x2="110" y2="172" stroke="currentColor" marker-end="url(#pyt-a9)"/>
<rect x="10" y="174" width="200" height="48" rx="7" class="fv"/><text x="110" y="194" text-anchor="middle" font-size="12" font-weight="700">coverage</text><text x="110" y="210" text-anchor="middle" class="tm" font-size="10">line 21 missed → 100%</text>
<line x1="210" y1="198" x2="253" y2="198" stroke="currentColor" marker-end="url(#pyt-a9)"/>
<rect x="255" y="174" width="185" height="48" rx="7" class="fv"/><text x="347" y="194" text-anchor="middle" font-size="12" font-weight="700">approx · frames · seeds</text><text x="347" y="210" text-anchor="middle" class="tm" font-size="10">184.27499999999998</text>
<line x1="440" y1="198" x2="483" y2="198" stroke="currentColor" marker-end="url(#pyt-a9)"/>
<rect x="485" y="174" width="185" height="48" rx="7" class="fv"/><text x="577" y="194" text-anchor="middle" font-size="12" font-weight="700">test design</text><text x="577" y="210" text-anchor="middle" class="tm" font-size="10">edges, one behaviour each</text>
<line x1="577" y1="222" x2="420" y2="252" stroke="currentColor" marker-end="url(#pyt-a9)"/>
<rect x="190" y="250" width="300" height="44" rx="7" class="fg sg"/><text x="340" y="269" text-anchor="middle" font-size="12" font-weight="700">TDD: red → green → refactor</text><text x="340" y="285" text-anchor="middle" class="tm" font-size="10">split(184, 3) = [62, 61, 61]</text>
</svg><figcaption>Top row: why a test, what it is, how to read it, how to shape it. Middle row: tools that remove repetition. Bottom row: measuring and designing the suite, ending in TDD, which uses every earlier idea.</figcaption></figure>
  <table class="tbl"><caption>Every idea, on the till</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>Test (assert)</td><td>functions, assert</td><td>does it give the known answer?</td><td><code>bill(five_chai) == 142</code></td><td>Every rule you rely on</td></tr>
    <tr><td>Failure report</td><td>assertion rewriting</td><td>what was wrong, where?</td><td><code>assert 158 == 142</code>, test_till.py:14</td><td>Every red run: summary → E → &gt;</td></tr>
    <tr><td>AAA</td><td>tests</td><td>how to lay out a test?</td><td>arrange order → act <code>bill</code> → assert</td><td>Always</td></tr>
    <tr><td>pytest.raises</td><td>exceptions, with</td><td>is bad input refused?</td><td>qty −2 → ValueError (else ₹−32)</td><td>Every guard</td></tr>
    <tr><td>parametrize</td><td>decorators, tests</td><td>same check, many cases?</td><td>asha 184 … at-150 142 … empty 0</td><td>Tables of examples</td></tr>
    <tr><td>Fixture</td><td>functions, yield</td><td>shared setup and cleanup?</td><td>menu once, fresh order each test</td><td>Repeated or costly setup</td></tr>
    <tr><td>conftest / markers</td><td>fixtures, config</td><td>share across files; choose tests?</td><td><code>orders</code>; <code>-m "not integration"</code></td><td>Any multi-file suite</td></tr>
    <tr><td>Coverage</td><td>a test run</td><td>what is never run?</td><td>line 21 → 100%; but <code>&gt;</code> bug still at 100%</td><td>Finding untested rules</td></tr>
    <tr><td>approx / frames / seeds</td><td>assert</td><td>inexact or random outputs?</td><td>184.27499999999998 ≈ 184.275</td><td>Floats, pandas, ML</td></tr>
    <tr><td>Test design</td><td>all of the above</td><td>which cases, how big?</td><td>combined test hid the guard bug</td><td>Writing any test</td></tr>
    <tr><td>TDD</td><td>all of the above</td><td>can tests drive new code?</td><td>split: 3 red/green loops, 23 tests</td><td>New features, bug fixes</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p><strong>A test is a hand-worked example that the computer re-checks forever.</strong> Everything else (parametrize, fixtures, conftest, coverage, TDD) only makes it cheaper to have more of those examples, keep them independent, and know where they are missing.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The usual ways a suite looks green while protecting nothing.</div>

  <h2 id="pyt-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which habits make a test suite look healthy while it quietly fails to protect the till?</p>
  </div>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom on Chai Corner</th><th>Fix</th></tr>
    <tr><td>Only "happy" cases</td><td>Asha/Ben pass; ₹150 overcharged</td><td>Add boundary, empty, invalid cases</td></tr>
    <tr><td>Expected value computed by the code</td><td><code>assert bill(x) == bill(x)</code> always green</td><td>Work expectations out by hand</td></tr>
    <tr><td>Never saw it fail</td><td>A typo'd test that can't go red</td><td>Break the code once on purpose</td></tr>
    <tr><td>Many behaviours in one test</td><td>Guard bug hidden behind boundary bug</td><td>One behaviour per test, or parametrize</td></tr>
    <tr><td><code>==</code> on floats</td><td>184.27499999999998 ≠ 184.275</td><td><code>pytest.approx</code>; money in paise/Decimal</td></tr>
    <tr><td>Wide-scope mutable fixture</td><td>Chai leaks into the coffee test</td><td>Function scope for anything changed</td></tr>
    <tr><td>Tests writing into the project</td><td>Stray <code>day.csv</code>, collisions</td><td><code>tmp_path</code></td></tr>
    <tr><td>Coverage as the goal</td><td>100% and still the <code>&gt;</code> bug</td><td>Use it to find gaps, not as proof</td></tr>
    <tr><td>Wrong names</td><td>"collected 0 items"</td><td><code>test_*.py</code>, <code>test_*</code> functions</td></tr>
    <tr><td><code>pytest.raises(Exception)</code></td><td>A TypeError typo passes the test</td><td>Name the exact exception + <code>match</code></td></tr>
    <tr><td>Real network in unit tests</td><td>Slow, flaky, costs money</td><td><a class="xref" data-note="py_mocking">Mocks</a></td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="pyt-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Chai Corner (chai 30, samosa 15, vada pav 20, cold coffee 90; 10% off when subtotal ≥ 150; +5% GST; round to rupees). Asha 184, Ben 74, Chen 52, five chai (exactly 150) 142, total 310.</p>
  <h3>The ladder in one line each</h3>
  <ol>
    <li><b>Why test</b> — an eye check missed <code>&gt;=</code>→<code>&gt;</code> (₹158 instead of ₹142); a test re-checks hand-worked answers on every change.</li>
    <li><b>First test</b> — <code>test_*</code> function in <code>test_*.py</code> with <code>assert</code>; run <code>pytest</code>.</li>
    <li><b>Failure report</b> — read summary → <code>E</code> lines (real values) → <code>&gt;</code> line and <code>file:line</code>.</li>
    <li><b>AAA + raises</b> — arrange, act, assert; <code>with pytest.raises(ValueError, match=…)</code> must see the error ("DID NOT RAISE" otherwise).</li>
    <li><b>parametrize</b> — one body, one test per row, each reported (<code>test_bill[at-150]</code>).</li>
    <li><b>Fixtures</b> — setup by parameter name; <code>yield</code> teardown; scope = how long a value lives; <code>tmp_path</code> fresh folder.</li>
    <li><b>conftest + markers</b> — shared fixtures without import; <code>@pytest.mark.integration</code>, <code>-m</code>.</li>
    <li><b>Coverage</b> — <code>--cov --cov-report=term-missing</code> shows unrun lines; 100% ≠ correct.</li>
    <li><b>Floats, tables, models</b> — <code>approx</code>, <code>assert_frame_equal</code>, seeds + thresholds.</li>
    <li><b>unittest</b> — built-in class style; pytest runs it.</li>
    <li><b>Design</b> — edges, one behaviour per test, see it fail, test behaviour not internals.</li>
    <li><b>TDD</b> — red → green → refactor; <code>split(184, 3) = [62, 61, 61]</code>.</li>
  </ol>
  <h3>Syntax you must know</h3>
  <table class="tbl">
    <tr><th>Thing</th><th>Form</th><th>Meaning of each part</th></tr>
    <tr><td>Test</td><td><code>def test_x(): assert actual == expected</code></td><td>name starts with test; assert raises if false</td></tr>
    <tr><td>Expect error</td><td><code>with pytest.raises(E, match=r) as info:</code></td><td>E = exception class; r = regex searched in message; <code>info.value</code> = the exception</td></tr>
    <tr><td>Many cases</td><td><code>@pytest.mark.parametrize("a, b", [(1, 2), …], ids=[…])</code></td><td>argument names; rows; display names</td></tr>
    <tr><td>Fixture</td><td><code>@pytest.fixture(scope="module")</code> + <code>yield value</code></td><td>scope = lifetime; before yield = setup, after = teardown</td></tr>
    <tr><td>Float compare</td><td><code>x == pytest.approx(y, rel=1e-6)</code></td><td>rel = allowed relative error</td></tr>
    <tr><td>Coverage</td><td><code>pytest --cov=till --cov-report=term-missing</code></td><td>module to measure; list missed lines</td></tr>
    <tr><td>Select</td><td><code>-k expr</code>, <code>-m marker</code>, <code>file::test</code></td><td>by name, by marker, by node id</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Case</th><th>Subtotal</th><th>After discount</th><th>With GST</th><th>Bill</th><th>Lesson</th></tr>
    <tr><td>Asha</td><td>195</td><td>175.5</td><td>184.275</td><td>184</td><td>approx: 184.27499999999998 via CGST+SGST</td></tr>
    <tr><td>Ben</td><td>70</td><td>70</td><td>73.5</td><td>74</td><td>no discount</td></tr>
    <tr><td>Chen</td><td>50</td><td>50</td><td>52.5</td><td>52</td><td>half to even (see Debugging)</td></tr>
    <tr><td>Five chai</td><td>150</td><td>135</td><td>141.75</td><td>142 (158 with <code>&gt;</code>)</td><td>boundary regression</td></tr>
    <tr><td>Qty −2 samosa</td><td>−30</td><td>−30</td><td>−31.5</td><td>ValueError (−32 unguarded)</td><td>pytest.raises</td></tr>
    <tr><td>split(184, 3)</td><td colspan="4">divmod(184, 3) = (61, 1) → [62, 61, 61]</td><td>TDD</td></tr>
  </table>
  <div class="cards">
    <div><b>Use parametrize when</b><p>The same check applies to a table of inputs. Avoid when each case needs different setup or asserts.</p></div>
    <div><b>Use a fixture when</b><p>Setup repeats or needs cleanup. Avoid wide scopes for anything a test changes.</p></div>
    <div><b>Use coverage when</b><p>Looking for untested rules. Avoid treating the % as a quality score.</p></div>
    <div><b>Use TDD when</b><p>Adding a feature or fixing a bug (write the failing test first). Less useful for throwaway exploration.</p></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Expected values from the code itself; tests never seen red; one test checking many behaviours; <code>==</code> on floats; mutable module/session fixtures; 100% coverage read as "correct"; misnamed files; broad <code>pytest.raises(Exception)</code>; real network in unit tests.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Which order did the eye check miss, and what did the bug charge?</td><td>Exactly ₹150 (five chai): ₹158 instead of ₹142</td></tr>
    <tr><td>In a failure report, which line shows the real values?</td><td>The <code>E</code> lines, e.g. <code>assert 158 == 142</code></td></tr>
    <tr><td>A function-scoped fixture is used by 3 tests. How many times does it run?</td><td>3 (module scope: once for the file)</td></tr>
    <tr><td>Coverage is 100%. Can the <code>&gt;</code> bug still be there?</td><td>Yes: every line ran, but no test used a subtotal of exactly 150</td></tr>
    <tr><td>What are the three TDD steps?</td><td>Red (failing test), green (simplest pass), refactor (tidy, stay green)</td></tr>
  </table>

  <h2 id="pyt-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a regression, and how does a test prevent one?</summary><div class="qa-body">A regression is behaviour that used to work and breaks after a change (the ₹150 discount after <code>&gt;=</code> became <code>&gt;</code>). A test pins the behaviour with a hand-worked expected value and runs on every change, so the break shows up in seconds instead of at a customer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does pytest find tests?</summary><div class="qa-body">From the root/testpaths it collects files named <code>test_*.py</code> or <code>*_test.py</code>, imports them, and collects functions named <code>test*</code> (and methods of <code>Test*</code> classes without <code>__init__</code>). Config in <code>pytest.ini</code>/<code>pyproject.toml</code> can change the patterns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through a failure report.</summary><div class="qa-body">Short summary (which test) → <code>E</code> lines (the evaluated values: <code>assert 158 == 142</code>, <code>where 158 = bill([...])</code>) → the <code>&gt;</code> line and <code>file:line</code> (where) → surrounding code. F = assertion/exception in the test; E in the progress line = error in setup/teardown/collection.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test that a function raises?</summary><div class="qa-body"><code>with pytest.raises(ValueError, match="non-negative"): bill(bad)</code>. It passes only if that exception type (or subclass) is raised with a matching message; otherwise "DID NOT RAISE" or the other exception propagates. Keep only the raising call inside the block.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a fixture, and what does scope change?</summary><div class="qa-body">A function that provides test inputs/resources, injected by parameter name; code after <code>yield</code> is teardown and runs even if the test fails. Scope sets lifetime: function (default, fresh per test), class, module, package, session. Wide scope only for expensive, read-only things.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is conftest.py for?</summary><div class="qa-body">Sharing fixtures (and hooks) with every test in its directory and below, without imports. Put the <code>orders</code> fixture there and any test file can request it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does 100% coverage mean the code is correct?</summary><div class="qa-body">No. It means every line ran during the tests. With the <code>&gt;</code> bug, five tests gave 100% and all passed, because none used a subtotal of exactly 150. Coverage finds untested code; asserts on well-chosen cases find bugs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>assert 175.5 + 4.3875 + 4.3875 == 184.275</code> fail, and what do you use instead?</summary><div class="qa-body">Binary floats can't represent these decimals exactly; the sum is 184.27499999999998. Use <code>pytest.approx(184.275)</code>; for money, store paise as ints or use <code>Decimal</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>pytest vs unittest?</summary><div class="qa-body">unittest is built in: <code>TestCase</code> classes, <code>setUp</code>, <code>self.assertEqual</code>. pytest uses plain functions and <code>assert</code> with rich failure output, composable fixtures with scopes, parametrize, markers and plugins (cov, xdist), and also runs unittest tests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe TDD on a small example.</summary><div class="qa-body">split: red <code>split(90,3)==[30,30,30]</code> (ImportError) → green <code>[total//people]*people</code>; red <code>split(184,3)==[62,61,61]</code> (got [61,61,61]) → green with the leftover rupee; red <code>split(184,0)</code> raises ValueError (got ZeroDivisionError) → green with a guard; refactor with divmod + 20 property tests, all green.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does parametrize need hand-worked expected values from the Values and Functions notes?</summary><div class="qa-body">The expected column is the whole point of the test. If it is produced by calling <code>bill</code>, the test compares the code with itself. The hand table (195 → 175.5 → 184.275 → 184) is computed from the rules, which is why each Python note works the bill by hand before coding it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are fixtures related to context managers?</summary><div class="qa-body">A <code>yield</code> fixture is setup → hand over a value → guaranteed cleanup, exactly the shape of a <code>@contextmanager</code> generator (code before <code>yield</code> is <code>__enter__</code>, after is <code>__exit__</code>). <code>pytest.raises</code> itself is a context manager.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the "see it fail" step?</summary><div class="qa-body">You can't tell a protective test from a useless one. A test with the expectation computed by the code, a wrong name (never collected), or an assert on a tuple stays green forever. In TDD the red step is mandatory precisely to rule this out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does testing <code>checkout</code> (which charges a card) need the next note?</summary><div class="qa-body"><code>checkout</code> calls the payment gateway. A real call is slow (seconds), flaky (network), and costs money or charges real cards, and its result changes from run to run, breaking "fast, independent, repeatable". Mocks and test doubles replace the gateway during the test.</div></details>
</main>
`
});
