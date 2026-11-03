// notes/python/py_pytest.js — Testing with pytest
Object.assign(TOPIC_CONTENT, {
  "py_pytest": `<main>
<h1>Testing with pytest</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>Testing with pytest</span></div>
  <p class="lead"><strong>pytest</strong> is the standard Python test runner: it finds test functions by naming convention, runs them, and on failure shows the actual values behind each <code>assert</code>. Without a runner, checks end up as ad-hoc scripts someone has to remember to run and read; with pytest the whole suite runs in seconds on every change and in CI on every push. Beyond plain <code>assert</code> it gives you <code>pytest.raises</code> for error paths, <code>parametrize</code> for tables of cases, fixtures for setup and teardown, <code>conftest.py</code> and markers for organising a suite, and plugins such as pytest-cov. In DS/ML code the same tools test feature transforms, DataFrames (<code>assert_frame_equal</code>) and seeded models. General testing concepts (kinds of tests, the pyramid, what to test) are in <a class="xref" data-note="py_testing">Software Testing Fundamentals</a>. Runs shown are real pytest 9.1 sessions on Python 3.13 (paths shortened to <code>~/chai</code>).</p>

  <h2 id="pyt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Testing with pytest</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What a test is</div>
        <ul>
          <li><b>Test</b> — code that runs your code on a known case and checks the answer</li>
          <li><b>Regression</b> — a bug that comes back; a test pins it</li>
          <li>Expected values worked out by hand, never by the code</li>
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
        <div class="mm-title">Coverage &amp; markers</div>
        <ul>
          <li><b>Coverage</b> — <code>--cov=till --cov-report=term-missing</code></li>
          <li>⚠ 100% covered ≠ correct</li>
          <li><b>Markers</b> — <code>-m "not integration"</code></li>
          <li><code>skip</code>, <code>skipif</code>, <code>xfail(strict=True)</code></li>
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
          <li>Property tests: rules over a grid of inputs</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pyt-first"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Test Functions, assert and Test Discovery</span><span class="rm-sub">test_ naming, collection, CLI flags</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-report"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Reading a Failure Report</span><span class="rm-sub">E lines, &gt; line, summary</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-aaa"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Arrange–Act–Assert and pytest.raises</span><span class="rm-sub">Testing exceptions with match=</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-param"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">@pytest.mark.parametrize</span><span class="rm-sub">One test per row, ids, grids</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-fix"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Fixtures</span><span class="rm-sub">yield teardown, scopes, tmp_path</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-conf"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">conftest.py, pytest.ini and Markers</span><span class="rm-sub">Shared fixtures, -m, skip, xfail</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-cov"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Coverage with pytest-cov</span><span class="rm-sub">--cov, term-missing, 100% trap</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-num"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Floats, DataFrames and Models</span><span class="rm-sub">approx, assert_frame_equal, seeds</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-ut"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">unittest vs pytest</span><span class="rm-sub">TestCase, setUp, assert methods</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-design"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Test Design</span><span class="rm-sub">Edge cases, one behaviour per test</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-tdd"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">TDD with pytest</span><span class="rm-sub">Red, green, refactor, property tests</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Suites that protect nothing</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Syntax, flags, fixtures, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">pytest basics to fixture internals</span></div></div>
    </div>
  </div>

  <h2 id="pyt-first"><span class="num">01</span>Test Functions, assert and Test Discovery</h2>
  <p>A pytest test is an ordinary function whose name starts with <code>test_</code>, in a file whose name starts with <code>test_</code>. It calls your code and checks the result with Python's plain <code>assert</code> statement, which does nothing if the condition is true and raises <code>AssertionError</code> if it is false. No classes, no special assertion methods: you type <code>pytest</code> and it finds and runs every such function.</p>
  <p>The code under test is a small billing module, <code>till.py</code> (menu prices in rupees; 10% off a subtotal of 150 or more; then 5% GST; rounded to whole rupees):</p>
  <div class="fx" data-lang="py"># till.py
"""Chai Corner till: the billing rules."""
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
  <table class="tbl"><caption>Expected values, worked out by hand from the rules</caption>
    <tr><th>Order</th><th>Subtotal</th><th>Discount</th><th>After</th><th>+5% GST</th><th>Bill</th></tr>
    <tr><td>Asha: 2 chai, 3 samosa, 1 cold coffee</td><td>195</td><td>19.5</td><td>175.5</td><td>184.275</td><td>184</td></tr>
    <tr><td>Ben: 1 chai, 2 vada pav</td><td>70</td><td>0</td><td>70</td><td>73.5</td><td>74</td></tr>
    <tr><td>Chen: 2 samosa, 1 vada pav</td><td>50</td><td>0</td><td>50</td><td>52.5</td><td>52 (Python rounds halves to even)</td></tr>
    <tr><td>Five chai: exactly ₹150</td><td>150</td><td>15</td><td>135</td><td>141.75</td><td>142</td></tr>
  </table>
  <p>The expected values come from the rules, not from running the code. The exactly-150 row matters most: it is the boundary where <code>&gt;=</code> vs <code>&gt;</code> changes the answer (with <code>&gt;</code> the bill becomes 158).</p>
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
  <p>Now change <code>&gt;=</code> to <code>&gt;</code> in <code>discount</code> and run without <code>-v</code>. Each dot is a pass, <code>F</code> a failure:</p>
  <div class="fx" data-lang="text">$ pytest test_till.py
...
collected 3 items

test_till.py ..F                                                         [100%]
...
FAILED test_till.py::test_exactly_150_gets_discount - AssertionError: assert ...
========================= 1 failed, 2 passed in 0.03s ==========================</div>
  <p>The two typical orders still pass; only the boundary test catches the regression, in 0.03 seconds. The full report it printed (cut above) is read line by line below.</p>
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

  <h2 id="pyt-report"><span class="num">02</span>Reading a Failure Report</h2>
  <p>A failing test is only useful if you can read what it says quickly. pytest rewrites <code>assert</code> statements so a failure shows the actual values involved. Here is the complete output of the failing run with the <code>&gt;</code> bug:</p>
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
  <p>For collections pytest even explains the difference. A list comparison (from the TDD example below) fails like this:</p>
  <div class="fx" data-lang="text">E       assert [61, 61, 61] == [62, 61, 61]
E
E         At index 0 diff: 61 != 62
E         Use -v to get more diff</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cricket scorecard after a wicket: the summary ("out, caught") first, then the detail (bowler, fielder, over and ball). You read the headline, then go to the exact ball only if you need it.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Assertion rewriting</strong>: pytest rewrites <code>assert</code> statements in test files at import time so that a failing assert reports the evaluated sub-expressions. A <strong>failure</strong> is an assertion or exception inside the test; an <strong>error</strong> is an exception during setup or teardown (fixtures) or collection (e.g. an <code>ImportError</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Assertion rewriting only applies to test modules (and <code>conftest.py</code>). An <code>assert</code> inside <code>till.py</code> fails with a bare <code>AssertionError</code>. And never write <code>assert (x == 1, "msg")</code>: a non-empty tuple is always true, so it never fails.</p></div>

  <h2 id="pyt-aaa"><span class="num">03</span>Arrange–Act–Assert and pytest.raises</h2>
  <p>Tests should check that invalid input is refused, not only that valid input gives the right answer. A test that expects an exception has to pass precisely when the code raises; <code>pytest.raises</code> does that.</p>
  <h3>The shape of every test</h3>
  <p>Good tests follow three steps, usually separated by a blank line: <b>Arrange</b> (build the input), <b>Act</b> (call the code once), <b>Assert</b> (check the result). One test, one action, one reason to fail.</p>
  <div class="cards">
    <div><b>Arrange</b><p><code>five_chai = [("masala chai", 5, 30)]</code></p></div>
    <div><b>Act</b><p><code>result = bill(five_chai)</code></p></div>
    <div><b>Assert</b><p><code>assert result == 142</code></p></div>
  </div>
  <h3>Raising on invalid input</h3>
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

  <h2 id="pyt-param"><span class="num">04</span>@pytest.mark.parametrize</h2>
  <p>Writing <code>test_asha</code>, <code>test_ben</code>, <code>test_chen</code>… copies the same two lines for each case. <code>parametrize</code> turns a table of inputs and expected outputs into one test per row.</p>
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
  <p>Stacking two <code>parametrize</code> decorators gives every combination (a grid): 5 totals × 4 group sizes = 20 tests, as in the TDD example below.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A teacher with one marking scheme and a stack of answer sheets. The scheme (test body) is written once; each sheet (row) gets its own mark, and one wrong sheet does not stop the others being marked.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>@pytest.mark.parametrize(argnames, argvalues, ids=…)</code> generates one test per element of <code>argvalues</code>, binding it to <code>argnames</code>. The generated tests are named <code>test_name[id]</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Don't compute the expected column with the code under test (<code>expected = bill(lines)</code>): the test then checks the code against itself and can never fail. Work expectations out by hand from the rules. (While writing this table, a hand calculation of a "₹149" row gave 157; pytest said 156, and 149 × 1.05 = 156.45 really is 156. When a fresh test fails, the expectation may be the bug.)</p></div>

  <h2 id="pyt-fix"><span class="num">05</span>Fixtures: Setup, Teardown, Scope and tmp_path</h2>
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
  <p>pytest ships with fixtures you can request by name. The one you will use most is <code>tmp_path</code>: a brand-new empty folder (a <code>pathlib.Path</code>) for each test, so tests that write files never collide and never litter your project. The conftest example below uses it to save the day's bills to CSV (file handling itself is in <a class="xref" data-note="py_files">Files</a>).</p>
  <table class="tbl">
    <tr><th>Built-in fixture</th><th>Gives you</th><th>Used in</th></tr>
    <tr><td><code>tmp_path</code></td><td>A fresh temporary folder per test</td><td>the CSV test below</td></tr>
    <tr><td><code>monkeypatch</code></td><td>Replace attributes / env vars, undone after the test</td><td><a class="xref" data-note="py_mocking">Mocks</a></td></tr>
    <tr><td><code>caplog</code></td><td>Captured log records</td><td><a class="xref" data-note="py_debugging">Logging</a></td></tr>
    <tr><td><code>capsys</code></td><td>Captured stdout/stderr (<code>capsys.readouterr().out</code>)</td><td>testing printed receipts</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>fixture</strong> provides a test's inputs or resources and is injected by parameter name (a form of dependency injection). Code before <code>yield</code> is <strong>setup</strong>, after it is <strong>teardown</strong>, and teardown runs even if the test fails. <strong>Scope</strong> sets how long one fixture value lives: function, class, module, package or session.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A wide scope for something tests change. Keep module/session scope for read-only things only. If a test needs to modify a shared object, give it a function-scoped copy.</p></div>

  <h2 id="pyt-conf"><span class="num">06</span>conftest.py, pytest.ini and Markers</h2>
  <p>Once tests span several files, shared fixtures and settings need a home, and slow tests need to be separable from fast ones.</p>
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
  <h3>Marking unit vs integration tests</h3>
  <p>The two arithmetic tests are <strong>unit tests</strong> (one function, no I/O, milliseconds); the CSV round trip is an <strong>integration test</strong> (our code plus the real file system). Marking integration tests lets you run the fast unit layer on every save and the slower layers in CI. Other built-in markers:</p>
  <div class="fx" data-lang="py">import sys, pytest

@pytest.mark.skip(reason="gateway sandbox down")             # never runs
def test_live_gateway(): ...

@pytest.mark.skipif(sys.platform == "win32", reason="POSIX paths only")
def test_paths(): ...

@pytest.mark.xfail(reason="known rounding bug, issue 12")   # failure expected: x
def test_half_up():
    assert round(52.5) == 53</div>
  <div class="fx" data-lang="text">$ pytest -q -rsx test_markers.py
s.x                                                                      [100%]
=========================== short test summary info ============================
SKIPPED [1] test_markers.py:3: gateway sandbox down
XFAIL test_markers.py::test_half_up - known rounding bug, issue 12
1 passed, 1 skipped, 1 xfailed in 0.02s</div>
  <p><code>-rsx</code> adds the reasons for skipped (s) and xfailed (x) tests to the summary. If an <code>xfail</code> test unexpectedly passes it is reported as <code>X</code> (XPASS); <code>xfail(strict=True)</code> turns that into a failure, so you notice when a known bug gets fixed.</p>
  <p>Kinds of tests and the test pyramid are covered in <a class="xref" data-note="py_testing">Software Testing Fundamentals</a>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>conftest.py</strong>: a per-directory plugin file whose fixtures and hooks apply to that directory's tests. A <strong>marker</strong> (<code>@pytest.mark.name</code>) tags a test; <code>-m EXPR</code> selects by marker. Built-in markers include <code>skip</code>, <code>skipif</code>, <code>xfail</code> and <code>parametrize</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Integration tests aimed at shared real resources (a team database, a real payment gateway) are slow, flaky and dangerous. Use <code>tmp_path</code>, a throwaway SQLite file, or a stand-in, which is exactly the subject of <a class="xref" data-note="py_mocking">Mocks</a>. Unregistered markers also cause a warning: list them in <code>pytest.ini</code>.</p></div>

  <h2 id="pyt-cov"><span class="num">07</span>Coverage with pytest-cov</h2>
  <p><strong>Coverage</strong> measures which lines (and branches) of your code ran while the tests ran. The <code>pytest-cov</code> plugin (<code>pip install pytest-cov</code>, which installs the <code>coverage</code> package) adds <code>--cov</code>. <code>--cov-report=term-missing</code> lists the line numbers that never ran. Here it is on the three tests from the conftest example:</p>
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
  <p>The guard has never fired in this suite. Adding the two <code>pytest.raises</code> tests (<code>test_errors.py</code>) closes the gap:</p>
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
  <p>Now put the <code>&gt;</code> bug back into <code>discount</code> and run the same five tests:</p>
  <div class="fx" data-lang="text">till.py      23      0   100%
---------------------------------------
TOTAL        23      0   100%
5 passed in 0.05s</div>
  <p>Still 100%, still green. Every line ran, but no test ran the line <em>with</em> a subtotal of exactly 150. Coverage tells you what is <em>untested</em>; it cannot tell you that what ran was checked well. Only the exactly-150 boundary test catches this bug. (Line vs branch coverage and what coverage cannot tell you: <a class="xref" data-note="py_testing">Software Testing Fundamentals</a>.)</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A security guard's patrol log shows every corridor was walked (100% coverage). It does not show that the guard looked in the rooms. Coverage finds the corridors nobody walks; it says nothing about how carefully the walked ones were checked.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Line (statement) coverage</strong> = executed statements ÷ total statements. <strong>Branch coverage</strong> (<code>--cov-branch</code>) also requires each <code>if</code> to go both ways. Coverage is a measure of test <em>reach</em>, not test <em>quality</em>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Chasing 100% with tests that call code but assert nothing (<code>bill(asha)</code> with no <code>assert</code>) raises the number and catches nothing. Use coverage to find untested rules, then write real checks for them. If <code>pytest-cov</code> isn't installed, <code>python -m coverage run -m pytest</code> then <code>python -m coverage report -m</code> does the same with the <code>coverage</code> package alone.</p></div>

  <h2 id="pyt-num"><span class="num">08</span>Floats, DataFrames and Models: approx, assert_frame_equal, Seeds</h2>
  <p><code>==</code> is the wrong check for computed floats, for whole DataFrames, and for anything trained on random data. pytest, pandas and NumPy each provide the right comparison.</p>
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

  <h2 id="pyt-ut"><span class="num">09</span>unittest vs pytest</h2>
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

  <h2 id="pyt-design"><span class="num">10</span>Test Design: Edge Cases and One Behaviour per Test</h2>
  <p>A suite can be green and still useless if it tests only easy cases or bundles many checks into one test.</p>
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
  <p>A test that can't fail proves nothing. <code>assert bill(asha) == bill(asha)</code> always passes. After writing a test, break the code (or the expected value) on purpose and watch it go red, as with the <code>&gt;</code> bug and the deleted guard above. TDD builds this habit in.</p>
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

  <h2 id="pyt-tdd"><span class="num">11</span>TDD with pytest: Red, Green, Refactor</h2>
  <p>New feature: split a bill between friends. Shares must be whole rupees, add up to exactly the total, and differ by at most one rupee (₹184 among 3 → <code>[62, 61, 61]</code>). TDD builds it one rule at a time, with each test seen failing first.</p>
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
  <p>All the test files above together, in <code>tests/</code>, with the <code>pytest.ini</code> from the conftest example:</p>
  <div class="fx" data-lang="text">$ pytest -q
..........................................                               [100%]
42 passed in 1.12s
$ pytest -q -k "150 or split_even"
...                                                                      [100%]
3 passed, 39 deselected in 1.11s</div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Test-driven development</strong>: write a failing test for the next small behaviour (red), make it pass with the least code (green), then improve the code with the tests as a safety net (refactor). A <strong>property test</strong> checks a rule that must hold for many inputs (sum preserved, difference ≤ 1) rather than one exact output.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Skipping the red step. If a new test passes immediately, either the feature already existed or the test is wrong; find out which before moving on. And don't write five tests before any code: one red at a time keeps each step small.</p></div>

  <h2 id="pyt-traps"><span class="num">12</span>Common Mistakes</h2>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom</th><th>Fix</th></tr>
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

  <h2 id="pyt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Writing and running tests</h3>
  <ul>
    <li>Files <code>test_*.py</code> / <code>*_test.py</code>; functions <code>test*</code>; classes <code>Test*</code> (no <code>__init__</code>). Plain <code>assert</code>.</li>
    <li>A test passes if it returns without an exception. Node id: <code>file::func[param-id]</code>.</li>
    <li>"collected 0 items" → check the names.</li>
  </ul>
  <table class="tbl">
    <tr><th>Flag</th><th>Does</th></tr>
    <tr><td><code>-v</code> / <code>-q</code></td><td>Verbose / quiet</td></tr>
    <tr><td><code>-k "expr"</code> · <code>-m "marker"</code> · <code>file::test</code></td><td>Select by name / marker / node id</td></tr>
    <tr><td><code>-x</code> · <code>--lf</code> · <code>--ff</code></td><td>Stop at first failure · rerun last failures · failures first</td></tr>
    <tr><td><code>-s</code></td><td>Don't capture stdout (see prints)</td></tr>
    <tr><td><code>--tb=short|line|no</code> · <code>-rf</code> / <code>-rsx</code></td><td>Traceback style · summary of failures / skips + xfails</td></tr>
    <tr><td><code>--pdb</code> · <code>--durations=N</code> · <code>--collect-only</code></td><td>Debugger on failure · slowest N tests · list without running</td></tr>
  </table>
  <h3>Reading failures</h3>
  <ul>
    <li>Read: summary line → <code>E</code> lines (actual values, <code>where 158 = bill(...)</code>) → <code>&gt;</code> line + <code>file:line</code>.</li>
    <li>Progress chars: <code>.</code> pass, <code>F</code> fail (in test body), <code>E</code> error (fixture/collection), <code>s</code> skip, <code>x</code> xfail, <code>X</code> xpass.</li>
    <li>Assertion rewriting only in test modules and <code>conftest.py</code>. <code>assert (x, "msg")</code> is always true.</li>
  </ul>
  <h3>pytest.raises</h3>
  <ul>
    <li><code>with pytest.raises(ValueError, match=r"non-negative") as info:</code> → <code>info.value</code> is the exception; <code>match</code> is <code>re.search</code> on <code>str(exc)</code>.</li>
    <li>"DID NOT RAISE" = guard missing. Keep only the raising call inside the block. Never <code>pytest.raises(Exception)</code>.</li>
  </ul>
  <h3>parametrize</h3>
  <ul>
    <li><code>@pytest.mark.parametrize("a, b", [(1, 2), (3, 4)], ids=["x", "y"])</code> → one test per row, each reported separately.</li>
    <li>Stacked decorators → Cartesian product (3 × 2 = 6 tests). <code>pytest.param(..., marks=pytest.mark.xfail)</code> marks one row.</li>
    <li>Fixture parametrization: <code>@pytest.fixture(params=[...])</code> + <code>request.param</code> → every test using it runs once per param.</li>
  </ul>
  <h3>Fixtures</h3>
  <ul>
    <li><code>@pytest.fixture</code>; requested by parameter name; can request other fixtures. Code before <code>yield</code> = setup, after = teardown (runs even if the test fails).</li>
    <li>Scopes: <code>function</code> (default) · <code>class</code> · <code>module</code> · <code>package</code> · <code>session</code>. Wide scopes only for expensive, read-only things.</li>
    <li><code>autouse=True</code> applies a fixture to every test in scope without requesting it.</li>
    <li>Built-ins: <code>tmp_path</code> (fresh <code>Path</code>), <code>monkeypatch</code>, <code>capsys</code> (<code>readouterr().out</code>), <code>caplog</code>, <code>request</code>.</li>
    <li><code>conftest.py</code>: fixtures/hooks shared with its directory and below, no import.</li>
  </ul>
  <h3>Config and markers</h3>
  <div class="fx" data-lang="text"># pytest.ini  (or [tool.pytest.ini_options] in pyproject.toml)
[pytest]
testpaths = tests
pythonpath = .
markers =
    integration: slower tests touching real files/DBs</div>
  <ul>
    <li><code>@pytest.mark.integration</code> + <code>-m "not integration"</code>. Register custom markers (or get warnings; <code>--strict-markers</code> makes them errors).</li>
    <li><code>skip(reason=)</code>, <code>skipif(cond, reason=)</code>, <code>xfail(reason=, strict=True)</code>.</li>
  </ul>
  <h3>Coverage</h3>
  <ul>
    <li><code>pip install pytest-cov</code>; <code>pytest --cov=pkg --cov-branch --cov-report=term-missing</code> lists missed lines/branches.</li>
    <li>100% coverage with the <code>&gt;</code> bug still passed: coverage = reach, not correctness.</li>
  </ul>
  <h3>Numbers, frames, models</h3>
  <table class="tbl">
    <tr><th>Compare</th><th>Use</th></tr>
    <tr><td>Floats / containers of floats</td><td><code>x == pytest.approx(y, rel=1e-6, abs=1e-12)</code></td></tr>
    <tr><td>NumPy arrays</td><td><code>np.testing.assert_allclose(a, b, rtol=, atol=)</code></td></tr>
    <tr><td>DataFrames / Series</td><td><code>pd.testing.assert_frame_equal(df1, df2)</code> (values, dtypes, index, column order)</td></tr>
    <tr><td>Models</td><td>Seeded data, planted signal, threshold (<code>acc &gt; 0.9</code>), output contracts</td></tr>
  </table>
  <h3>unittest vs pytest</h3>
  <table class="tbl">
    <tr><th></th><th>unittest</th><th>pytest</th></tr>
    <tr><td>Shape</td><td><code>TestCase</code> subclass, <code>test*</code> methods</td><td>Plain functions</td></tr>
    <tr><td>Checks</td><td><code>self.assertEqual</code>, <code>assertRaises</code></td><td><code>assert</code> (rewritten), <code>pytest.raises</code></td></tr>
    <tr><td>Setup</td><td><code>setUp</code>/<code>tearDown</code>, <code>setUpClass</code></td><td>Fixtures with scopes</td></tr>
    <tr><td>Many cases</td><td><code>subTest</code></td><td><code>parametrize</code></td></tr>
  </table>
  <h3>Design and TDD</h3>
  <ul>
    <li>Boundaries (149/150), empty, invalid; one behaviour per test; see each test fail once; test behaviour, not internals.</li>
    <li>TDD: red (failing test, for the right reason) → green (simplest code) → refactor. Property tests check rules (sum preserved, max − min ≤ 1) over a grid.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Expected value computed by the code under test → test can never fail.</li>
    <li>Mutable fixture with module/session scope → state leaks between tests, order-dependent failures.</li>
    <li>Test file named like the module it imports → shadowing.</li>
    <li><code>==</code> on floats; exact model scores.</li>
    <li>Writing files into the project instead of <code>tmp_path</code>.</li>
    <li>Real network in unit tests → use doubles (<a class="xref" data-note="py_mocking">Mocks</a>).</li>
  </ul>

  <h2 id="pyt-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How does pytest discover tests?</summary><div class="qa-body">Starting from the arguments, or <code>testpaths</code>/the current directory, it recurses into directories and collects files named <code>test_*.py</code> or <code>*_test.py</code>, imports them, and collects functions named <code>test*</code> and <code>test*</code> methods of classes named <code>Test*</code> that have no <code>__init__</code>. The patterns can be changed with <code>python_files</code>, <code>python_functions</code> and <code>python_classes</code> in config.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can pytest use plain <code>assert</code> when unittest needs <code>assertEqual</code>?</summary><div class="qa-body">pytest rewrites the <code>assert</code> statements in test modules (and <code>conftest.py</code>) at import time, via an import hook, so a failure reports the values of each sub-expression: <code>assert 158 == 142</code>, <code>where 158 = bill([...])</code>. unittest predates this and needs methods that build the message themselves. Asserts in your application modules are not rewritten.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In pytest output, what is the difference between a failure (F) and an error (E)?</summary><div class="qa-body">A failure is an assertion error or exception raised inside the test function. An error is an exception outside the test body: in fixture setup or teardown, or during collection (e.g. an <code>ImportError</code> in the test module). Errors usually mean the test never really ran.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test that a function raises an exception with a specific message?</summary><div class="qa-body"><code>with pytest.raises(ValueError, match="non-negative") as info: bill(bad)</code>. It passes only if <code>ValueError</code> (or a subclass) is raised and <code>re.search(match, str(exc))</code> succeeds; otherwise "DID NOT RAISE" or the other exception propagates. <code>info.value</code> gives the exception for further asserts. Keep only the raising call inside the block.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a fixture, and how is it different from <code>setUp</code> in unittest?</summary><div class="qa-body">A fixture is a function decorated with <code>@pytest.fixture</code> that provides a value or resource; tests request it by naming it as a parameter, and pytest injects it (dependency injection). Unlike <code>setUp</code>, fixtures are explicit per test, composable (fixtures can use fixtures), have configurable scope, can be shared via <code>conftest.py</code>, can be parametrized, and handle teardown with <code>yield</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><span>What does this print with <code>pytest -s</code>, and does teardown run?
<div class="fx" data-lang="py">@pytest.fixture
def resource():
    print("setup")
    yield 42
    print("teardown")

def test_one(resource):
    print("test", resource)
    assert resource == 0</div></span></summary><div class="qa-body"><div class="fx" data-lang="text">setup
test 42
Fteardown</div>Setup runs up to <code>yield</code>, the yielded value 42 is injected, the test prints and fails (<code>F</code>), and the code after <code>yield</code> still runs. Teardown after <code>yield</code> is guaranteed even when the test fails, like the exit of a context manager.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain fixture scopes. What goes wrong with a module-scoped list?</summary><div class="qa-body">Scope sets how long one fixture value lives: <code>function</code> (default, new per test), <code>class</code>, <code>module</code>, <code>package</code>, <code>session</code>. A module-scoped mutable object is shared by every test in the file, so one test's appends are visible in the next: tests pass or fail depending on order. Use wide scopes only for expensive, read-only resources (a loaded model, a DB engine), and give tests function-scoped copies of anything they modify.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>conftest.py</code>?</summary><div class="qa-body">A file pytest loads automatically; its fixtures and hooks are available to all tests in that directory and its subdirectories without importing. You can have several at different levels (a root one for shared fixtures, one in <code>tests/integration/</code> for DB fixtures). Do not import from <code>conftest.py</code> in tests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><span>How many tests does this collect, and what are their ids?
<div class="fx" data-lang="py">@pytest.mark.parametrize("x", [1, 2, 3])
@pytest.mark.parametrize("y", ["a", "b"])
def test_grid(x, y):
    pass</div></span></summary><div class="qa-body">Six: stacked parametrize decorators give the Cartesian product. <code>pytest --collect-only -q</code> shows <code>test_grid[a-1]</code>, <code>[a-2]</code>, <code>[a-3]</code>, <code>[b-1]</code>, <code>[b-2]</code>, <code>[b-3]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>parametrize vs a loop inside one test?</summary><div class="qa-body">With a loop, the first failing case stops the test and hides the rest, and the report names only the test. With <code>parametrize</code>, each row is a separate test with its own id (<code>test_bill[at-150]</code>), all rows run, and you can rerun or select one case. Use a loop only for a property that genuinely belongs to a single test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you run the same tests against several configurations, e.g. CSV and Parquet storage?</summary><div class="qa-body">Parametrize a fixture: <code>@pytest.fixture(params=["csv", "parquet"])</code> returning <code>request.param</code> (or building the storage object from it). Every test that requests the fixture runs once per param, reported as <code>test_save[csv]</code> and <code>test_save[parquet]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are markers? How do you skip tests or mark expected failures?</summary><div class="qa-body">Markers are labels: <code>@pytest.mark.integration</code>, selected with <code>-m "not integration"</code> and registered in <code>pytest.ini</code>. Built-ins: <code>skip(reason=)</code>, <code>skipif(condition, reason=)</code> (e.g. platform or missing GPU), <code>xfail(reason=)</code> for a known bug (reported <code>x</code>; <code>X</code> if it unexpectedly passes; <code>strict=True</code> makes XPASS a failure), and <code>parametrize</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test a function that prints, or writes files, or logs?</summary><div class="qa-body">Prints: the <code>capsys</code> fixture, <code>assert capsys.readouterr().out == "Hello, Asha!\\n"</code>. Files: write into <code>tmp_path</code> (a fresh <code>pathlib.Path</code> per test) and read back. Logs: <code>caplog</code>, e.g. <code>caplog.set_level(logging.WARNING)</code> then check <code>caplog.text</code> or <code>caplog.records</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you compare floats, NumPy arrays and DataFrames in tests?</summary><div class="qa-body">Floats: <code>pytest.approx</code> (default relative tolerance 1e-6; works on lists, tuples, dicts and arrays). Arrays: <code>np.testing.assert_allclose(actual, expected, rtol=..., atol=...)</code>. DataFrames: <code>pd.testing.assert_frame_equal</code>, which checks values, dtypes, index and column order and prints a readable diff; <code>df1 == df2</code> gives an elementwise frame and NaN != NaN.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>pytest vs unittest?</summary><div class="qa-body">unittest is in the standard library: <code>TestCase</code> classes, <code>setUp</code>/<code>tearDown</code>, <code>self.assert*</code> methods, <code>subTest</code>. pytest uses plain functions and <code>assert</code> with detailed failure output, fixtures with scopes and composition, <code>parametrize</code>, markers, and a large plugin ecosystem (cov, xdist, mock, asyncio). pytest also runs existing unittest suites, so migration can be gradual.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A test fails only when the whole suite runs, never alone. What is going on?</summary><div class="qa-body">A test-order dependency: shared state leaking between tests. Typical causes: a mutable module/session-scoped fixture, module-level globals or caches, monkeypatching without undo, environment variables, files written to a fixed path, or a singleton (DB connection, random seed). Reproduce by running the failing test together with the tests that run before it (the pytest-randomly plugin shuffles order to expose these early); fix by giving each test fresh state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an <code>autouse</code> fixture, and when is it appropriate?</summary><div class="qa-body"><code>@pytest.fixture(autouse=True)</code> runs for every test in its scope without being requested. Good for cross-cutting setup that every test needs: resetting a global cache, fixing the random seed, blocking network access, setting an env var via <code>monkeypatch</code>. Overuse hides dependencies, so prefer explicit fixtures for anything a test actually uses.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your pytest suite has become slow. How do you speed it up?</summary><div class="qa-body">Measure with <code>--durations=20</code>. Then: replace real network/DB calls in unit tests with doubles or in-memory versions; widen the scope of expensive read-only fixtures (load a model once per session); shrink test data; mark slow integration tests and run them separately (<code>-m "not integration"</code> locally); run in parallel with pytest-xdist (<code>-n auto</code>), which requires tests to be independent; use <code>--lf</code>/<code>-x</code> while iterating.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you debug a failing pytest test?</summary><div class="qa-body">Read the report (summary → <code>E</code> lines → <code>&gt;</code> line). Rerun only it by node id with <code>-x -vv</code> for full diffs; add <code>-s</code> to see prints; use <code>--pdb</code> to drop into the debugger at the failure (or <code>--trace</code> to break at the start of the test), or put <code>breakpoint()</code> in the test. See <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>.</div></details>
</main>
`
});
