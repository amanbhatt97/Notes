// notes/python/py_pytest.js — Testing with pytest
Object.assign(TOPIC_CONTENT, {
  "py_pytest": `<main>
<h1>Testing with pytest</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>Testing with pytest</span></div>
  <p class="lead">pytest is the tool almost every Python project uses to run its automated tests. You write ordinary functions that call your code and check the results with Python's plain <code>assert</code>; pytest finds those functions, runs them, and when one fails it shows you the actual values that were wrong. Without a test runner, checks end up as scattered scripts that someone has to remember to run and read; with pytest the whole suite runs in seconds after every change and automatically in CI on every push. This page teaches pytest from the first test to the features real projects rely on: reading failure reports, testing errors, running one test over many inputs, fixtures for setup and clean-up, project configuration and markers, coverage, comparing floats and tables, unittest, and test-driven development. The running example is the billing module of a small tea stall, Chai Corner, which we test, break on purpose and extend throughout. (Why tests matter and how to choose them is covered in <a class="xref" data-note="py_testing">Software Testing Fundamentals</a>.)</p>

  <h2 id="pyt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Testing with pytest</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Basics</div>
        <ul>
          <li>Files <code>test_*.py</code>, functions <code>test_*</code></li>
          <li>Plain <code>assert</code>; failures show real values</li>
          <li>Report: <code>E</code> lines = values, <code>&gt;</code> = failing line</li>
          <li><code>pytest.raises(ValueError, match=...)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Less repetition</div>
        <ul>
          <li><code>parametrize</code>: one test per row</li>
          <li>Fixture: setup injected by parameter name</li>
          <li><code>yield</code> = teardown; scope = how long it lives</li>
          <li><code>conftest.py</code>: shared fixtures, no import</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running a suite</div>
        <ul>
          <li><code>-v -q -k -x -s --lf</code></li>
          <li>Markers: <code>-m "not integration"</code>, skip, xfail</li>
          <li><code>--cov=till --cov-report=term-missing</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Special values and TDD</div>
        <ul>
          <li><code>pytest.approx</code> for floats</li>
          <li><code>assert_frame_equal</code> for DataFrames</li>
          <li>Red → green → refactor</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pyt-first"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Your First pytest Test</span><span class="rm-sub">test functions, assert, how pytest finds tests</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-report"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Reading a Failure Report</span><span class="rm-sub">what each part of the output means</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-raises"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Testing Errors with pytest.raises</span><span class="rm-sub">checking that bad input is refused</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-param"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">parametrize</span><span class="rm-sub">one test body, many cases</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-fix"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Fixtures</span><span class="rm-sub">setup, teardown, scope, built-in fixtures</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-conf"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">conftest.py, pytest.ini and Markers</span><span class="rm-sub">organising a real test suite</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-cov"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Coverage with pytest-cov</span><span class="rm-sub">finding code no test runs</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-num"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Floats, DataFrames and Models</span><span class="rm-sub">approx, assert_frame_equal, thresholds</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-ut"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">unittest and pytest</span><span class="rm-sub">the standard-library framework compared</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-tdd"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Test-Driven Development with pytest</span><span class="rm-sub">red, green, refactor, step by step</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">suites that hide bugs</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">syntax, flags, fixtures, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pyt-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">pytest basics to fixture internals</span></div></div>
    </div>
  </div>

  <h2 id="pyt-first"><span class="num">01</span>Your First pytest Test</h2>
  <p>Chai Corner's till follows three rules: add up the order, take 10% off if the subtotal is ₹150 or more, then add 5% GST and round to whole rupees. Here is the module that does it:</p>
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
  <p>Before writing any test we need to know the right answers, and they must come from the rules, not from running the code (otherwise a test would just repeat whatever the code does, bugs included). Working a few orders out by hand:</p>
  <table class="tbl">
    <tr><th>Order</th><th>Subtotal</th><th>Discount</th><th>After discount</th><th>+5% GST</th><th>Bill</th></tr>
    <tr><td>Asha: 2 chai, 3 samosa, 1 cold coffee</td><td>195</td><td>19.5</td><td>175.5</td><td>184.275</td><td>184</td></tr>
    <tr><td>Ben: 1 chai, 2 vada pav</td><td>70</td><td>0</td><td>70</td><td>73.5</td><td>74</td></tr>
    <tr><td>Chen: 2 samosa, 1 vada pav</td><td>50</td><td>0</td><td>50</td><td>52.5</td><td>52</td></tr>
    <tr><td>Five chai: exactly ₹150</td><td>150</td><td>15</td><td>135</td><td>141.75</td><td>142</td></tr>
  </table>
  <p>(Chen's 52.5 becomes 52, not 53, because Python's <code>round</code> sends an exact half to the nearest <em>even</em> number. That surprise is the bug investigated in <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>; for now the table simply records what the rules plus Python's rounding give.) The last row matters most: ₹150 sits exactly on the edge of the discount rule, so it is where a mistake like <code>&gt;</code> instead of <code>&gt;=</code> would show.</p>
  <p>A pytest <strong>test</strong> is just a function whose name starts with <code>test_</code>, placed in a file whose name starts with <code>test_</code>. Inside, it calls your code and checks the result with <code>assert</code>, Python's built-in statement that does nothing when its condition is true and raises <code>AssertionError</code> when it is false. There are no classes to inherit from and no special checking methods to learn:</p>
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
  <p>To run the tests you type <code>pytest</code> in the project folder, optionally followed by a file name. The <code>-v</code> flag ("verbose") lists every test by name:</p>
  <div class="fx" data-lang="text">$ pytest -v test_till.py
============================= test session starts ==============================
platform linux -- Python 3.13.18, pytest-9.2.0, pluggy-1.7.0 -- ~/chai/.venv/bin/python3
cachedir: .pytest_cache
rootdir: ~/chai
plugins: cov-7.1.0
collecting ... collected 3 items

test_till.py::test_big_order_gets_discount PASSED                        [ 33%]
test_till.py::test_small_order_pays_full_price PASSED                    [ 66%]
test_till.py::test_exactly_150_gets_discount PASSED                      [100%]

============================== 3 passed in 0.03s ===============================</div>
  <p>A lot happened in that fraction of a second, and it is worth knowing the steps because every pytest run follows them. First comes <strong>discovery</strong>: pytest searched the folder (and the folders below it) for files named <code>test_*.py</code> or <code>*_test.py</code>, found <code>test_till.py</code>, and imported it, which also ran its <code>from till import bill</code> line, so <code>till.py</code> must be importable from there (see <a class="xref" data-note="py_modules">Modules</a>). Next comes <strong>collection</strong>: inside the file it gathered every function whose name starts with <code>test</code>, giving "collected 3 items"; the lists <code>asha</code> and <code>ben</code> are ordinary variables, not tests. Then it <strong>ran</strong> each test by calling it with no arguments. The rule for passing is simple: a test that returns without raising any exception passes; a test that raises (a failed <code>assert</code> or any other error) fails. Finally it <strong>reported</strong>: one line per test with its percentage of progress, and a summary with the total time. Three tests in 0.02 seconds is why people can afford to run the whole suite after every small change.</p>
  <p>The header lines tell you which Python and pytest were used and which folder pytest treated as the project root (<code>rootdir</code>). Each test also has a full name, its <strong>node id</strong>: the file, two colons and the function, for example <code>test_till.py::test_exactly_150_gets_discount</code>. You can pass a node id to run just that one test. The flags you will use daily are few:</p>
  <table class="tbl">
    <tr><th>Command</th><th>Does</th></tr>
    <tr><td><code>pytest</code></td><td>Run every test in this folder and below</td></tr>
    <tr><td><code>pytest -v</code> / <code>-q</code></td><td>One line per test / as quiet as possible</td></tr>
    <tr><td><code>pytest test_till.py::test_exactly_150_gets_discount</code></td><td>Run one test by its node id</td></tr>
    <tr><td><code>pytest -k "150 or ben"</code></td><td>Only tests whose names match the expression</td></tr>
    <tr><td><code>pytest -x</code> / <code>--lf</code></td><td>Stop at the first failure / re-run only the tests that failed last time</td></tr>
    <tr><td><code>pytest -s</code></td><td>Show <code>print</code> output (pytest normally captures and hides it)</td></tr>
    <tr><td><code>pytest --tb=short</code> / <code>--tb=line</code> / <code>--tb=no</code></td><td>Shorter failure reports</td></tr>
    <tr><td><code>pytest --durations=5</code></td><td>List the five slowest tests</td></tr>
    <tr><td><code>pytest --collect-only -q</code></td><td>List the tests without running them</td></tr>
  </table>
  <p>The naming rules have a sharp edge: pytest silently ignores anything that does not match them. A file called <code>till_checks.py</code> or a function called <code>check_bill</code> is never collected, and the run happily reports "collected 0 items" or simply fewer tests than you wrote. When a test you just wrote does not seem to run, check its name first.</p>

  <h2 id="pyt-report"><span class="num">02</span>Reading a Failure Report</h2>
  <p>A test is only as useful as your ability to understand it when it fails. Suppose someone edits <code>discount</code> and writes <code>sub &gt; 150</code> instead of <code>sub &gt;= 150</code>. Here is everything pytest prints, this time without <code>-v</code>:</p>
  <div class="fx" data-lang="text">$ pytest test_till.py
============================= test session starts ==============================
platform linux -- Python 3.13.18, pytest-9.2.0, pluggy-1.7.0
rootdir: ~/chai
plugins: cov-7.1.0
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

test_till.py:15: AssertionError
=========================== short test summary info ============================
FAILED test_till.py::test_exactly_150_gets_discount - AssertionError: assert ...
========================= 1 failed, 2 passed in 0.02s ==========================</div>
  <p>The report looks busy, but it has a fixed structure, and once you know it you can read any failure in seconds. After the header, the line <code>test_till.py ..F</code> is the progress line: one character per test in file order, where <code>.</code> means passed and <code>F</code> means failed. (You will also meet <code>E</code> for an error outside the test body, for example in setup code, <code>s</code> for skipped and <code>x</code> for an expected failure.) So at a glance: the first two passed, the third failed.</p>
  <p>Under <code>FAILURES</code> comes one block per failed test, titled with its name. It reprints the test's source, and the line starting with <code>&gt;</code> is the line that raised; the <code>^^^^</code> underneath marks the exact expression. Then come the lines starting with <code>E</code>, which are the most important lines in the whole report. <code>assert 158 == 142</code> shows the <em>actual values</em> of both sides of the comparison: the code returned 158 where we expected 142. The next line, <code>where 158 = bill([('masala chai', 5, 30)])</code>, says where the 158 came from: the call and the exact argument. You now know which input breaks the code without adding a single <code>print</code>. <code>test_till.py:15: AssertionError</code> gives the file and line number. At the bottom, the <code>short test summary info</code> lists every failure on one line each, which is what you scan first when a big suite has several failures, and the final line gives the totals.</p>
  <p>This detail is possible because of a feature called <strong>assertion rewriting</strong>. When pytest imports a test file, it quietly rewrites each <code>assert</code> statement so that, if it fails, it records the value of every part of the expression. A normal Python <code>assert</code> would only say <code>AssertionError</code>, with no values at all. The rewriting applies only to test files (and <code>conftest.py</code>, met later); an <code>assert</code> inside <code>till.py</code> itself gives no such detail.</p>
  <p>Reading a report is a bit like reading a cricket scorecard after a wicket: first the headline (who is out), then the detail (bowler, fielder, which ball) only if you need it. In practice: read the summary line to see <em>which</em> test, then the <code>E</code> lines to see <em>what</em> was wrong, then the <code>&gt;</code> line and <code>file:line</code> to see <em>where</em>, and only then the surrounding code. Here, 158 is 150 plus 5% GST, rounded: the price <em>without</em> the discount. So the discount did not apply at exactly 150, which points straight at the comparison in <code>discount</code>.</p>
  <p>pytest uses two words carefully. A <strong>failure</strong> is an assertion or exception inside the test function itself. An <strong>error</strong> is an exception outside it: while importing the test file, or in setup and teardown code (fixtures, coming later). An error usually means the test never really ran, so the problem is in the test's surroundings rather than in the behaviour being checked. One classic trap is worth knowing now: never write <code>assert (x == 1, "message")</code> with brackets. That asserts a two-item tuple, and a non-empty tuple is always true, so the assert can never fail. The correct form is <code>assert x == 1, "message"</code>.</p>

  <h2 id="pyt-raises"><span class="num">03</span>Testing Errors with pytest.raises</h2>
  <p>Good tests check that bad input is refused, not only that good input gives the right answer. Right now the till accepts anything. An order with a quantity of −2 samosas, perhaps from a typing mistake at the counter, produces a bill without complaint:</p>
  <div class="fx" data-lang="text">$ python3 -c "from till import bill; print(bill([('samosa', -2, 15)]))"
-32</div>
  <p>−2 × 15 = −30, plus 5% is −31.5, which rounds to −32 (halves go to the even number). The till would happily print a negative bill. We want it to refuse instead, so we add a guard to <code>bill</code> that raises a <code>ValueError</code> (raising exceptions is covered in <a class="xref" data-note="py_exceptions">Exceptions</a>):</p>
  <div class="fx" data-lang="py">def bill(lines):
    """Final bill in whole rupees. Refuses negative quantities."""
    for item, qty, price in lines:
        if qty &lt; 0:
            raise ValueError(f"qty must be non-negative, got {qty} for {item!r}")
    sub = subtotal(lines)
    return round(with_tax(sub - discount(sub)))</div>
  <p>How do you test that something <em>raises</em>? A plain call would crash the test with the very exception we want, and the test would fail. pytest provides <code>pytest.raises</code> for this. It is used as a <code>with</code> block (a context manager, see <a class="xref" data-note="py_context">Context Managers</a>): the code inside the block must raise the named exception. If it does, pytest catches the exception and the test carries on; if it does not, the test fails with "DID NOT RAISE". The optional <code>match=</code> argument is a regular expression that must be found in the exception's message, and <code>as info</code> keeps the exception so you can inspect it further.</p>
  <div class="fx" data-lang="py"># test_errors.py
import pytest
from till import bill

def test_negative_qty_is_refused():
    bad = [("samosa", -2, 15)]                    # arrange
    with pytest.raises(ValueError, match="non-negative"):
        bill(bad)                                 # act; pytest.raises asserts

def test_error_names_the_item():
    with pytest.raises(ValueError) as info:
        bill([("vada pav", -1, 20)])
    assert "vada pav" in str(info.value)          # look inside the exception</div>
  <p>Look at the layout of the first test. It follows the three-step shape good tests share, called <strong>Arrange, Act, Assert</strong>: arrange the input (the bad order), act by calling the code once, and assert on the result. Here the "act" and "assert" are combined, because <code>pytest.raises</code> is itself the check. Putting only the one call that should raise inside the <code>with</code> block matters: if the arrange step were also inside and accidentally raised a <code>ValueError</code> of its own, the test would pass for the wrong reason.</p>
  <div class="fx" data-lang="text">$ pytest -q test_errors.py
..                                                                       [100%]
2 passed in 0.01s</div>
  <p>Both pass. But a test you have only seen pass proves little, so let us prove these can fail: run them against the old <code>till.py</code> without the guard.</p>
  <div class="fx" data-lang="text">$ pytest -q test_errors.py
FF                                                                       [100%]
=================================== FAILURES ===================================
_________________________ test_negative_qty_is_refused _________________________

    def test_negative_qty_is_refused():
        bad = [("samosa", -2, 15)]                    # arrange
&gt;       with pytest.raises(ValueError, match="non-negative"):
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
E       Failed: DID NOT RAISE ValueError

test_errors.py:7: Failed
__________________________ test_error_names_the_item ___________________________

    def test_error_names_the_item():
&gt;       with pytest.raises(ValueError) as info:
             ^^^^^^^^^^^^^^^^^^^^^^^^^
E       Failed: DID NOT RAISE ValueError

test_errors.py:11: Failed
=========================== short test summary info ============================
FAILED test_errors.py::test_negative_qty_is_refused - Failed: DID NOT RAISE V...
FAILED test_errors.py::test_error_names_the_item - Failed: DID NOT RAISE Valu...
2 failed in 0.02s</div>
  <p>"DID NOT RAISE ValueError" says exactly what is wrong: the code accepted bad input. It is like testing a smoke alarm. Checking that it stays quiet in clean air is not enough; you hold a smoking match under it and check that it <em>does</em> ring. <code>pytest.raises</code> is the match. Always name the exact exception you expect: <code>pytest.raises(Exception)</code> is satisfied by <em>any</em> error, including a <code>TypeError</code> from a typo in the test itself, so it would pass without ever testing the guard.</p>

  <h2 id="pyt-param"><span class="num">04</span>parametrize</h2>
  <p>We now want to test Asha, Ben, Chen, the ₹150 edge, the nearest order just below it, and an empty order. Writing six functions that differ only in their numbers means copying the same two lines six times. A loop inside one test is no better: the first failing case would stop the loop and hide the rest. pytest's answer is the decorator <code>@pytest.mark.parametrize</code>, which takes a list of argument names and a table of values and turns each row of the table into a separate test. (Decorators in general are explained in <a class="xref" data-note="py_decorators">Decorators</a>.)</p>
  <div class="fx" data-lang="py"># test_bill_cases.py
import pytest
from till import bill

@pytest.mark.parametrize("lines, expected", [
    ([("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)], 184),  # Asha
    ([("masala chai", 1, 30), ("vada pav", 2, 20)], 74),                         # Ben
    ([("samosa", 2, 15), ("vada pav", 1, 20)], 52),                              # Chen
    ([("masala chai", 5, 30)], 142),          # exactly 150: discount applies
    ([("cold coffee", 1, 90), ("vada pav", 2, 20), ("samosa", 1, 15)], 152),  # 145: none
    ([], 0),                                  # empty order
], ids=["asha", "ben", "chen", "at-150", "at-145", "empty"])
def test_bill(lines, expected):
    assert bill(lines) == expected</div>
  <p>The first argument, <code>"lines, expected"</code>, names the test function's parameters; each tuple in the list supplies one value for each of them. <code>ids=</code> gives each row a readable name. The two new rows are worked out by hand first: 90 + 40 + 15 = 145 is below 150, so no discount, and 145 + 5% = 152.25 rounds to 152; the empty order has a subtotal of 0, so its bill is 0.</p>
  <div class="fx" data-lang="text">$ pytest -v test_bill_cases.py
============================= test session starts ==============================
platform linux -- Python 3.13.18, pytest-9.2.0, pluggy-1.7.0 -- ~/chai/.venv/bin/python3
cachedir: .pytest_cache
rootdir: ~/chai
plugins: cov-7.1.0
collecting ... collected 6 items

test_bill_cases.py::test_bill[asha] PASSED                               [ 16%]
test_bill_cases.py::test_bill[ben] PASSED                                [ 33%]
test_bill_cases.py::test_bill[chen] PASSED                               [ 50%]
test_bill_cases.py::test_bill[at-150] PASSED                             [ 66%]
test_bill_cases.py::test_bill[at-145] PASSED                             [ 83%]
test_bill_cases.py::test_bill[empty] PASSED                              [100%]

============================== 6 passed in 0.03s ===============================</div>
  <p>One function, six tests, each reported under its own name: <code>test_bill[asha]</code>, <code>test_bill[at-150]</code> and so on. Think of a teacher with one marking scheme and a pile of answer sheets: the scheme is written once, and every sheet gets its own mark, so one wrong sheet does not stop the others being marked. Now put the <code>&gt;</code> bug back:</p>
  <div class="fx" data-lang="text">$ pytest -q --tb=line test_bill_cases.py
...F..                                                                   [100%]
=================================== FAILURES ===================================
E   AssertionError: assert 158 == 142
     +  where 158 = bill([('masala chai', 5, 30)])
~/chai/test_bill_cases.py:14: AssertionError: assert 158 == 142
=========================== short test summary info ============================
FAILED test_bill_cases.py::test_bill[at-150] - AssertionError: assert 158 == 142
1 failed, 5 passed in 0.01s</div>
  <p>Only the <code>at-150</code> row failed, and the report names it; the other five rows still ran and passed. You can re-run just that row by its node id, <code>pytest "test_bill_cases.py::test_bill[at-150]"</code>. Two more things are worth knowing. Stacking two <code>parametrize</code> decorators on one test runs every combination of their values (three values times two values gives six tests), which the TDD section uses to test a rule over a whole grid of inputs. And a single row can carry its own mark, such as <code>pytest.param(..., marks=pytest.mark.xfail)</code> for a row that is known to fail. The one thing never to do is compute the <code>expected</code> column by calling <code>bill</code>: a test that compares the code with itself can never fail.</p>

  <h2 id="pyt-fix"><span class="num">05</span>Fixtures</h2>
  <p>Many tests need the same preparation: a menu of prices, an empty order, a temporary folder, a database connection that must be closed afterwards. Copying that setup into every test is repetitive, and forgetting the clean-up leaks state from one test into the next. pytest's solution is the <strong>fixture</strong>: a function marked with <code>@pytest.fixture</code> that prepares something a test needs. A test asks for a fixture simply by having a parameter with the fixture's name. pytest sees the name, runs the fixture, and passes in what it returned. You never call a fixture yourself. If the fixture uses <code>yield</code> instead of <code>return</code>, the code after <code>yield</code> runs after the test has finished, even if the test failed: that is the clean-up, called <strong>teardown</strong>.</p>
  <p>A restaurant kitchen's prep station is a good picture. Before service, chopped onions and boiled potatoes wait in labelled bowls; a cook says "I need potatoes" and is handed a bowl, without knowing or caring how they were prepared. Some prep is done once for the whole evening, like a big pot of masala, while some is fresh for every plate, like a clean cup. How long one prepared thing is kept and shared is the fixture's <strong>scope</strong>.</p>
  <p>The test file below has two fixtures. <code>menu</code> pretends to open a menu file once for the whole file (<code>scope="module"</code>) and close it at the end. <code>order</code> gives each test a fresh empty list (the default scope, <code>"function"</code>, meaning a new one for every test), and it uses the <code>menu</code> fixture itself, because fixtures can request other fixtures. The prints make the order of events visible; <code>-s</code> tells pytest to show them.</p>
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
    assert len(order) == 1                    # the chai from the last test is NOT here
    assert bill(order) == 94                  # 90 + 4.5 = 94.5 -&gt; 94

def test_order_starts_empty(order):
    assert order == []</div>
  <p>Before reading the output, try to predict how many times each message will appear.</p>
  <div class="fx" data-lang="text">$ pytest -q -s test_scope.py

[open menu file once]
[fresh empty order] .[fresh empty order] .[fresh empty order] .
[close menu file]

3 passed in 0.01s</div>
  <p>Follow it step by step. The first test, <code>test_add_chai</code>, needs <code>menu</code>; none exists yet for this file, so pytest runs <code>menu</code> up to its <code>yield</code>, printing "open menu file once", and hands the dictionary to the test. The test also needs <code>order</code>, a function-scoped fixture, so pytest runs it and prints "fresh empty order". The test adds two chai (60, plus 5% = 63) and passes: the first dot. For the second test, pytest <em>reuses</em> the same menu but builds a <em>new</em> order, which is why the test can assert that the chai from the first test is not there. The third test gets yet another fresh order. After the last test in the file, pytest resumes <code>menu</code> after its <code>yield</code>, printing "close menu file".</p>
  <p>What goes wrong with the wrong scope? Change <code>order</code> to <code>scope="module"</code>, so all three tests share one list:</p>
  <div class="fx" data-lang="text">$ pytest -q -s --tb=line test_scope.py

[open menu file once]
[fresh empty order] .FF
[close menu file]

=================================== FAILURES ===================================
E   AssertionError: assert 2 == 1
     +  where 2 = len([('masala chai', 2, 30), ('cold coffee', 1, 90)])
~/chai/test_scope.py:22: AssertionError: assert 2 == 1
E   AssertionError: assert [('masala cha...ffee', 1, 90)] == []

      Left contains 2 more items, first extra item: ('masala chai', 2, 30)
      Use -v to get more diff
~/chai/test_scope.py:26: AssertionError: assert [('masala cha...ffee', 1, 90)] == []
=========================== short test summary info ============================
FAILED test_scope.py::test_add_coffee - AssertionError: assert 2 == 1
FAILED test_scope.py::test_order_starts_empty - AssertionError: assert [('mas...
2 failed, 1 passed in 0.01s</div>
  <p>This time "fresh empty order" printed only once. Asha's chai, added by the first test, was still in the list when the coffee test ran, so the coffee test found two items instead of one, and the "starts empty" test found both. Worse, these tests now pass or fail depending on the order they run in, which is the hardest kind of failure to diagnose. The rule: use wide scopes (<code>"module"</code>, <code>"package"</code>, <code>"session"</code>, the whole test run) only for things that are expensive to create and that tests only read, such as a loaded model or a database engine; anything a test might change gets the default function scope.</p>
  <table class="tbl">
    <tr><th>scope=</th><th>One value per</th><th>Use for</th></tr>
    <tr><td><code>"function"</code> (default)</td><td>test</td><td>anything a test may change: orders, lists, DataFrames</td></tr>
    <tr><td><code>"class"</code></td><td>test class</td><td>read-only data shared by grouped tests</td></tr>
    <tr><td><code>"module"</code></td><td>test file</td><td>expensive, read-only: a menu, a loaded model</td></tr>
    <tr><td><code>"package"</code> / <code>"session"</code></td><td>package / whole run</td><td>a database server, a large read-only dataset</td></tr>
  </table>
  <p>pytest also ships ready-made fixtures that any test can request by name. <code>tmp_path</code> gives each test a brand-new empty folder as a <code>pathlib.Path</code>, so tests that write files never collide and never litter the project; the next section uses it. <code>capsys</code> captures what the code printed (<code>capsys.readouterr().out</code>), handy for testing a printed receipt. <code>caplog</code> captures log messages (see <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>). <code>monkeypatch</code> temporarily replaces attributes or environment variables and undoes the change after the test (see <a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a>). A fixture marked <code>autouse=True</code> runs for every test in its scope without being requested, which suits setup every test needs, such as fixing a random seed; and <code>@pytest.fixture(params=[...])</code> makes every test that uses the fixture run once per parameter, reading the current one from <code>request.param</code>.</p>

  <h2 id="pyt-conf"><span class="num">06</span>conftest.py, pytest.ini and Markers</h2>
  <p>As a project grows, tests spread over several files, and three practical needs appear: fixtures that many files share, settings that should not have to be typed on every run, and a way to run the fast tests separately from the slow ones. pytest has one tool for each.</p>
  <p>A file named <strong><code>conftest.py</code></strong> is loaded by pytest automatically, and every fixture defined in it is available to all test files in the same folder and below, without any import. A configuration file, <strong><code>pytest.ini</code></strong> (or a <code>[tool.pytest.ini_options]</code> section in <code>pyproject.toml</code>), holds settings such as where the tests live. And a <strong>marker</strong> is a label you stick on a test, like <code>@pytest.mark.integration</code>, so you can later select or exclude tests by label with <code>-m</code>. The project now looks like this:</p>
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
  <p><code>testpaths</code> tells pytest to look for tests only in <code>tests/</code>; <code>pythonpath = .</code> lets the tests import <code>till</code> from the project folder; <code>markers</code> registers our custom label (pytest warns about markers it does not know, which catches typos like <code>@pytest.mark.integraton</code>).</p>
  <div class="fx" data-lang="py"># tests/conftest.py: fixtures here are visible to every test file in tests/
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
  <p>For a test that touches a real file, the till gains two functions that save the day's bills to a CSV file and read them back:</p>
  <div class="fx" data-lang="py">import csv          # at the top of till.py

def save_day(bills, path):
    """Write {customer: amount} to a CSV file."""
    with open(path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["customer", "amount"])
        writer.writerows(bills.items())

def load_day(path):
    """Read the CSV back into {customer: amount}, amounts as ints."""
    with open(path, newline="") as f:
        return {row["customer"]: int(row["amount"]) for row in csv.DictReader(f)}</div>
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
  <p>This test uses two fixtures at once: our <code>orders</code> from <code>conftest.py</code> and pytest's built-in <code>tmp_path</code>. It is marked <code>integration</code> because it involves the real file system. The tests in <code>test_bill.py</code> are <strong>unit tests</strong> (one function, no files, milliseconds), while this one is an <strong>integration test</strong> (our code working with something real); the difference is explained in <a class="xref" data-note="py_testing">Software Testing Fundamentals</a>. Now run the suite, then select by marker:</p>
  <div class="fx" data-lang="text">$ pytest -v -s
============================= test session starts ==============================
platform linux -- Python 3.13.18, pytest-9.2.0, pluggy-1.7.0 -- ~/chai/.venv/bin/python3
cachedir: .pytest_cache
rootdir: ~/chai
configfile: pytest.ini
testpaths: tests
plugins: cov-7.1.0
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

============================== 3 passed in 0.03s ===============================
$ pytest -q -m "not integration"
..                                                                       [100%]
2 passed, 1 deselected in 0.01s
$ pytest -q -m integration
.                                                                        [100%]
1 passed, 2 deselected in 0.04s</div>
  <p>The header shows that pytest found <code>pytest.ini</code> (<code>configfile</code>) and searched only <code>tests/</code> (<code>testpaths</code>). Both test files received <code>orders</code> without importing it. <code>tmp_path</code> was a fresh folder named after the test; the CSV it holds has a header and three rows; and reading it back gave numbers equal to the originals, not the strings <code>"184"</code> that a CSV file actually contains, which is the classic bug this test exists to catch. <code>-m "not integration"</code> ran the two fast tests and <em>deselected</em> the file test; <code>-m integration</code> ran only that one. Teams use this to run the fast unit tests on every save and the slower layers in CI.</p>
  <p>pytest also has built-in markers for tests that should not run, or are expected to fail:</p>
  <div class="fx" data-lang="py"># test_markers.py
import sys
import pytest

@pytest.mark.skip(reason="gateway sandbox is down")
def test_live_gateway(): ...

@pytest.mark.skipif(sys.platform == "win32", reason="POSIX paths only")
def test_paths(): ...

@pytest.mark.xfail(reason="known rounding bug, issue 12")
def test_half_up():
    assert round(52.5) == 53</div>
  <div class="fx" data-lang="text">$ pytest -q -rsx test_markers.py
s.x                                                                      [100%]
=========================== short test summary info ============================
SKIPPED [1] test_markers.py:5: gateway sandbox is down
XFAIL test_markers.py::test_half_up - known rounding bug, issue 12
1 passed, 1 skipped, 1 xfailed in 0.01s</div>
  <p>The progress line <code>s.x</code> reads: skipped, passed, expected failure. <code>skip</code> never runs the test; <code>skipif</code> skips only when its condition is true, here on Windows, so on Linux the test ran and passed; <code>xfail</code> runs the test but expects it to fail, documenting a known bug without turning the suite red. <code>-rsx</code> asked for the reasons of skipped (s) and xfailed (x) tests in the summary. If an <code>xfail</code> test unexpectedly passes, pytest reports it as <code>X</code> (XPASS); <code>xfail(strict=True)</code> turns that into a failure, so you notice when a known bug has been fixed and the marker should be removed.</p>

  <h2 id="pyt-cov"><span class="num">07</span>Coverage with pytest-cov</h2>
  <p>How do you know which parts of <code>till.py</code> no test touches? <strong>Coverage</strong> answers that: while the tests run, a coverage tool records which lines of your code were executed. The plugin <code>pytest-cov</code> (<code>pip install pytest-cov</code>, which brings in the <code>coverage</code> package) adds the <code>--cov</code> option; <code>--cov-report=term-missing</code> lists the line numbers that never ran. Here it is on the three tests in <code>tests/</code>:</p>
  <div class="fx" data-lang="text">$ pytest -q --cov=till --cov-report=term-missing
...                                                                      [100%]
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.13.18-final-0 _______________

Name      Stmts   Miss  Cover   Missing
---------------------------------------
till.py      22      1    95%   22
---------------------------------------
TOTAL        22      1    95%
3 passed in 0.05s</div>
  <p><code>till.py</code> has 22 statements, 1 of which never ran: line 22. In the current <code>till.py</code> that is the <code>raise ValueError(...)</code> line of the guard. None of the tests in <code>tests/</code> ever passes a negative quantity, so the guard has never fired. Adding the two <code>pytest.raises</code> tests from <code>test_errors.py</code> to the run closes the gap:</p>
  <div class="fx" data-lang="text">$ pytest -q --cov=till --cov-report=term-missing tests test_errors.py
.....                                                                    [100%]
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.13.18-final-0 _______________

Name      Stmts   Miss  Cover   Missing
---------------------------------------
till.py      22      0   100%
---------------------------------------
TOTAL        22      0   100%
5 passed in 0.05s</div>
  <p>Now every line ran: 100%. It is tempting to read that number as "fully tested". Watch what happens when the <code>&gt;</code> bug goes back into <code>discount</code> and the same five tests run:</p>
  <div class="fx" data-lang="text">$ pytest -q --cov=till --cov-report=term-missing tests test_errors.py
.....                                                                    [100%]
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.13.18-final-0 _______________

Name      Stmts   Miss  Cover   Missing
---------------------------------------
till.py      22      0   100%
---------------------------------------
TOTAL        22      0   100%
5 passed in 0.04s</div>
  <p>Still 100%, and still all green, with a till that overcharges every ₹150 order. Every line ran, but no test in this run used an order of exactly 150; that test lives in another file. Coverage tells you which code is <em>untested</em>; it cannot tell you whether the code that ran was checked with the right inputs, or checked at all, since a test that calls <code>bill(asha)</code> with no <code>assert</code> produces exactly the same report. It is like a guard's patrol log showing every corridor was walked: useful for finding corridors nobody visits, silent about whether anyone looked inside the rooms.</p>
  <p>Two refinements are worth knowing. <code>--cov-branch</code> adds <strong>branch coverage</strong>, which also requires every <code>if</code> to have gone both ways, a stricter and more useful measure than lines alone. And if the plugin is not installed, the <code>coverage</code> package works on its own: <code>python -m coverage run -m pytest</code>, then <code>python -m coverage report -m</code>. Line versus branch coverage, and why coverage should be a floor rather than a goal, are discussed further in <a class="xref" data-note="py_testing">Software Testing Fundamentals</a>.</p>

  <h2 id="pyt-num"><span class="num">08</span>Floats, DataFrames and Models</h2>
  <p>So far every check has been <code>==</code> on whole numbers. Three kinds of values need something else: computed floating-point numbers, whole pandas tables, and anything produced by a model trained on random data.</p>
  <p>Indian bills show GST as two equal halves, CGST and SGST, at 2.5% each. The till gains a function that splits the tax:</p>
  <div class="fx" data-lang="py">def gst_breakup(amount):
    """Indian bills show GST as two halves: CGST 2.5% + SGST 2.5%."""
    cgst = amount * 0.025
    sgst = amount * 0.025
    return cgst, sgst, amount + cgst + sgst</div>
  <p>By hand, for Asha's ₹175.50 after discount: 175.5 × 0.025 = 4.3875 for each half, so the total is 175.5 + 4.3875 + 4.3875 = 184.275. The first test below compares with <code>==</code>, the second with <code>pytest.approx</code>:</p>
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

test_numbers.py:7: AssertionError
=========================== short test summary info ============================
FAILED test_numbers.py::test_gst_total_exact - assert 184.27499999999998 == 1...
1 failed, 1 passed in 0.02s</div>
  <p>The arithmetic is right, yet the exact test failed: the computer's answer is 184.27499999999998. Floats are stored in binary, which cannot represent most decimal fractions exactly, so adding three of them loses a tiny amount (see <a class="xref" data-note="py_values">Values</a>). <code>pytest.approx(184.275)</code> means "equal within a small tolerance", by default one part in a million of the expected value, and it works on tuples, lists and dictionaries of numbers too, as the second assert shows. You can set the tolerance yourself with <code>rel=</code> (relative) or <code>abs=</code> (absolute). Think of a shopkeeper weighing tea: 250 g plus or minus a gram is accepted, nobody demands exactly 250.000 g. For money, the real fix is not to use floats at all: keep amounts in whole paise, or use <code>Decimal</code>.</p>
  <p>Tables need their own comparison too. A function that summarises the day as a pandas DataFrame:</p>
  <div class="fx" data-lang="py"># tables.py
import pandas as pd
from till import subtotal, bill

def day_table(orders):
    """One row per customer: subtotal and bill. Never changes 'orders'."""
    rows = [(name, subtotal(lines), bill(lines)) for name, lines in orders.items()]
    return pd.DataFrame(rows, columns=["customer", "subtotal", "bill"])</div>
  <p>Comparing two DataFrames with <code>==</code> does not give a single True or False; it gives a whole table of True/False values, which <code>assert</code> cannot use directly (and NaN never equals NaN). pandas provides <code>pd.testing.assert_frame_equal</code>, which checks values, column types, index and column order, and explains any difference. The first test below has a deliberate slip in its expected table:</p>
  <div class="fx" data-lang="py"># test_tables.py
import pandas as pd
from tables import day_table

ORDERS = {
    "Asha": [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)],
    "Ben":  [("masala chai", 1, 30), ("vada pav", 2, 20)],
}

def test_day_table():
    expected = pd.DataFrame({"customer": ["Asha", "Ben"],
                             "subtotal": [195, 70],
                             "bill": [184, 74.0]})       # oops: 74.0 is a float
    pd.testing.assert_frame_equal(day_table(ORDERS), expected)

def test_day_table_does_not_change_its_input():
    before = {k: list(v) for k, v in ORDERS.items()}
    day_table(ORDERS)
    assert ORDERS == before</div>
  <div class="fx" data-lang="text">$ pytest -q test_tables.py
F.                                                                       [100%]
=================================== FAILURES ===================================
________________________________ test_day_table ________________________________

    def test_day_table():
        expected = pd.DataFrame({"customer": ["Asha", "Ben"],
                                 "subtotal": [195, 70],
                                 "bill": [184, 74.0]})       # oops: 74.0 is a float
&gt;       pd.testing.assert_frame_equal(day_table(ORDERS), expected)
E       AssertionError: Attributes of DataFrame.iloc[:, 2] (column name="bill") are different
E
E       Attribute "dtype" are different
E       [left]:  int64
E       [right]: float64

test_tables.py:14: AssertionError
=========================== short test summary info ============================
FAILED test_tables.py::test_day_table - AssertionError: Attributes of DataFra...
1 failed, 1 passed in 0.30s</div>
  <p>The values in the two tables are numerically equal (74 and 74.0), but writing <code>74.0</code> made the expected <code>bill</code> column a float column, while the function produces whole numbers. <code>assert_frame_equal</code> reports exactly that: column <code>bill</code>, dtype <code>int64</code> on the left, <code>float64</code> on the right. That strictness is useful, because a column that silently changes type is often the first sign of a bug upstream (a missing value turns an integer column into floats). With <code>74</code> written as a whole number, the test passes:</p>
  <div class="fx" data-lang="text">$ pytest -q test_tables.py
..                                                                       [100%]
2 passed in 0.37s</div>
  <p>The second test checks a promise in the function's docstring, that it never changes its input. Tests that check such promises are often called <strong>contract tests</strong>. For NumPy arrays the equivalent comparison is <code>np.testing.assert_allclose(actual, expected, rtol=..., atol=...)</code>.</p>
  <p>Models trained on random data need a third approach, because their exact output changes with the data, the random seed and even the library version. Three habits make them testable. Fix the randomness with a <strong>seed</strong> so every run sees the same data. Train on synthetic data where you <strong>planted</strong> the answer, such as "cold coffee sells when temperature plus half the group size is above zero". And assert a <strong>threshold</strong> rather than an exact score: <code>assert accuracy &gt; 0.9</code>, never <code>assert accuracy == 0.9632</code>. A library update that moves the score from 0.97 to 0.98 should not break the build, while a real bug, such as shuffled labels or the wrong column, drops a classifier to around 0.5 and fails clearly. A worked, runnable example of a planted-signal test is in <a class="xref" data-note="py_testing">Software Testing Fundamentals</a>, and model evaluation in production is covered in <a class="xref" data-note="mlops_deploy">MLOps</a>.</p>

  <h2 id="pyt-ut"><span class="num">09</span>unittest and pytest</h2>
  <p>Python's standard library has its own testing framework, <code>unittest</code>, and you will meet it in older projects and in Python's own source. It works differently from pytest. Tests are methods of a class that inherits from <code>unittest.TestCase</code> (classes are explained in <a class="xref" data-note="py_classes">Classes &amp; Objects</a>); setup goes in a method called <code>setUp</code>, which runs before each test; and checks use special methods such as <code>self.assertEqual</code> and <code>self.assertRaises</code>, because unittest does not rewrite plain <code>assert</code> statements to show values.</p>
  <div class="fx" data-lang="py"># test_unittest_style.py
import unittest
from till import bill

class TestBill(unittest.TestCase):
    def setUp(self):                       # runs before EACH test method
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
  <p>The same file runs under both: <code>python3 -m unittest</code> runs it with unittest's own runner, and pytest also collects and runs unittest classes, which is why projects can switch to pytest gradually without rewriting old tests. The table summarises the differences:</p>
  <table class="tbl">
    <tr><th></th><th>unittest</th><th>pytest</th></tr>
    <tr><td>Where it comes from</td><td>Built into Python</td><td><code>pip install pytest</code></td></tr>
    <tr><td>Shape of a test</td><td>Method of a <code>TestCase</code> class</td><td>Plain function (classes optional)</td></tr>
    <tr><td>Checks</td><td><code>self.assertEqual</code>, <code>assertTrue</code>, <code>assertRaises</code>…</td><td>Plain <code>assert</code>, rewritten to show values; <code>pytest.raises</code></td></tr>
    <tr><td>Setup and teardown</td><td><code>setUp</code> / <code>tearDown</code>, <code>setUpClass</code></td><td>Fixtures with scopes, composable, shared via <code>conftest.py</code></td></tr>
    <tr><td>Many cases</td><td><code>self.subTest</code> inside a loop</td><td><code>parametrize</code></td></tr>
  </table>
  <p>One caution if you mix them: pytest fixtures cannot be passed as arguments to the methods of a <code>unittest.TestCase</code> class. New projects almost always choose pytest.</p>

  <h2 id="pyt-tdd"><span class="num">10</span>Test-Driven Development with pytest</h2>
  <p>Every test so far was written after the code. <strong>Test-driven development</strong> (TDD) reverses that, in a short loop with three steps. <strong>Red</strong>: write one small test for the next piece of behaviour you want, run it, and watch it fail for the reason you expect. <strong>Green</strong>: write the simplest code that makes it pass. <strong>Refactor</strong>: tidy the code while re-running the tests, which must stay green. Then pick the next behaviour. The red step is not a formality: watching a test fail proves it can fail, so it really checks something. (Why and when to use TDD is discussed in <a class="xref" data-note="py_testing">Software Testing Fundamentals</a>.)</p>
  <p>The new feature is splitting a bill between friends. The shares must be whole rupees, must add up to exactly the total, and should differ by at most one rupee: ₹184 between 3 people should be <code>[62, 61, 61]</code>. We build it one rule at a time.</p>
  <p><strong>Loop 1, red.</strong> The first rule is the easy case: ₹90 between 3 is 30 each.</p>
  <div class="fx" data-lang="py"># test_split.py
from till import split

def test_split_even():
    assert split(90, 3) == [30, 30, 30]</div>
  <div class="fx" data-lang="text">$ pytest -q test_split.py

==================================== ERRORS ====================================
________________________ ERROR collecting test_split.py ________________________
ImportError while importing test module '~/chai/test_split.py'.
Hint: make sure your test modules/packages have valid Python names.
Traceback:
/usr/local/lib/python3.13/importlib/__init__.py:88: in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
test_split.py:2: in &lt;module&gt;
    from till import split
E   ImportError: cannot import name 'split' from 'till' (~/chai/till.py)
=========================== short test summary info ============================
ERROR test_split.py
!!!!!!!!!!!!!!!!!!!! Interrupted: 1 error during collection !!!!!!!!!!!!!!!!!!!!
1 error in 0.10s</div>
  <p>Red, for the expected reason: <code>split</code> does not exist yet, so importing it fails. Notice this is reported as an <em>error</em> during collection, not a test failure, because the file could not even be imported. <strong>Green</strong>, with the simplest code that could work:</p>
  <div class="fx" data-lang="py">def split(total, people):
    return [total // people] * people</div>
  <div class="fx" data-lang="text">$ pytest -q test_split.py
.                                                                        [100%]
1 passed in 0.01s</div>
  <p><strong>Loop 2, red.</strong> The next rule: ₹184 between 3. Here 184 // 3 = 61, and 3 × 61 = 183, one rupee short. The rule says the leftover rupee goes to the first person:</p>
  <div class="fx" data-lang="py"># test_split.py
from till import split

def test_split_even():
    assert split(90, 3) == [30, 30, 30]

def test_split_uneven_shares_add_up():
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

test_split.py:8: AssertionError
=========================== short test summary info ============================
FAILED test_split.py::test_split_uneven_shares_add_up - assert [61, 61, 61] =...
1 failed, 1 passed in 0.01s</div>
  <p>pytest even explains the difference between the two lists: at index 0, 61 instead of 62. Our simple version loses a rupee. <strong>Green</strong>: work out how many rupees are left over, and give one extra to that many people.</p>
  <div class="fx" data-lang="py">def split(total, people):
    share = total // people
    extra = total - share * people           # rupees left over: 184 - 183 = 1
    return [share + 1] * extra + [share] * (people - extra)</div>
  <div class="fx" data-lang="text">$ pytest -q test_split.py
..                                                                       [100%]
2 passed in 0.01s</div>
  <p>Tracing <code>split(184, 3)</code> by hand: <code>share</code> is 184 // 3 = 61; <code>extra</code> is 184 − 183 = 1; the result is <code>[62] * 1 + [61] * 2</code>, which is <code>[62, 61, 61]</code> and sums to 184.</p>
  <p><strong>Loop 3, red.</strong> Splitting between zero people is a mistake, and the code should say so clearly with a <code>ValueError</code>:</p>
  <div class="fx" data-lang="py"># test_split.py
import pytest
from till import split

def test_split_even():
    assert split(90, 3) == [30, 30, 30]

def test_split_uneven_shares_add_up():
    assert split(184, 3) == [62, 61, 61]       # first person pays the extra rupee

def test_split_needs_at_least_one_person():
    with pytest.raises(ValueError, match="at least one"):
        split(184, 0)</div>
  <div class="fx" data-lang="text">$ pytest -q --tb=short test_split.py
..F                                                                      [100%]
=================================== FAILURES ===================================
_____________________ test_split_needs_at_least_one_person _____________________
test_split.py:13: in test_split_needs_at_least_one_person
    split(184, 0)
till.py:45: in split
    share = total // people
            ^^^^^^^^^^^^^^^
E   ZeroDivisionError: integer division or modulo by zero
=========================== short test summary info ============================
FAILED test_split.py::test_split_needs_at_least_one_person - ZeroDivisionErro...
1 failed, 2 passed in 0.02s</div>
  <p>This failure is instructive. The code <em>did</em> raise, but the wrong exception: dividing by zero raised <code>ZeroDivisionError</code>, and because <code>pytest.raises(ValueError)</code> only catches <code>ValueError</code>, the other error went straight through and failed the test. The report shows the chain of calls (the test called <code>split</code>, and the division on line 45 of <code>till.py</code> raised). <strong>Green</strong>, and since all three rules are now pinned by tests, we can also <strong>refactor</strong>: <code>divmod</code> gives the quotient and the remainder in one step, and a docstring states the rules.</p>
  <div class="fx" data-lang="py">def split(total, people):
    """Split a whole-rupee bill: shares differ by at most 1 and add up exactly."""
    if people &lt; 1:
        raise ValueError("need at least one person")
    share, extra = divmod(total, people)     # 184, 3 -&gt; (61, 1)
    return [share + 1] * extra + [share] * (people - extra)</div>
  <div class="fx" data-lang="text">$ pytest -q test_split.py
...                                                                      [100%]
3 passed in 0.03s</div>
  <p>Finally, with the code in shape, we check the rules over many inputs at once. Two stacked <code>parametrize</code> decorators produce every combination of 5 totals and 4 group sizes, 20 tests, and each one checks the three rules of a fair split rather than one exact answer. Tests like these, which check a rule that must hold for many inputs, are called <strong>property tests</strong>:</p>
  <div class="fx" data-lang="py"># test_split.py
import pytest
from till import split

def test_split_even():
    assert split(90, 3) == [30, 30, 30]

def test_split_uneven_shares_add_up():
    assert split(184, 3) == [62, 61, 61]       # first person pays the extra rupee

def test_split_needs_at_least_one_person():
    with pytest.raises(ValueError, match="at least one"):
        split(184, 0)

@pytest.mark.parametrize("total", [0, 1, 52, 184, 310])
@pytest.mark.parametrize("people", [1, 2, 3, 7])
def test_split_properties(total, people):        # 5 x 4 = 20 tests
    shares = split(total, people)
    assert len(shares) == people
    assert sum(shares) == total                  # no rupee lost or invented
    assert max(shares) - min(shares) &lt;= 1        # fair to within a rupee</div>
  <div class="fx" data-lang="text">$ pytest -q test_split.py
.......................                                                  [100%]
23 passed in 0.02s</div>
  <p>23 tests pass: the 3 examples plus the 20 property checks. Every line of <code>split</code> exists because a test demanded it, and every test was seen failing before it passed. Libraries such as Hypothesis take property testing further by generating hundreds of random inputs automatically and shrinking any failure to the smallest example.</p>

  <h2 id="pyt-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common design mistake is cramming several behaviours into one test. Below, the till has <em>two</em> bugs at once (the <code>&gt;</code> in the discount, and the negative-quantity guard switched off), and the same three behaviours are tested two ways: one big test, and three small ones.</p>
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
  <p><code>test_everything</code> stopped at its first failing assert and reported only the boundary bug; the missing guard was invisible inside it. The three small tests reported both bugs, each by name, and showed that the empty-order behaviour still works. With one big test you would fix the first bug, run again, and only then discover the second. A car with one "something is wrong" light behaves the same way, compared with separate oil, battery and brake lights. Several asserts about the <em>same</em> result are fine; separate behaviours deserve separate tests, or a <code>parametrize</code> table.</p>
  <p>The other frequent mistakes have appeared along the way. Test files or functions without the <code>test_</code> prefix are silently ignored; "collected 0 items" is the clue. Expected values computed by the code under test make a test that can never fail; work them out by hand. A test that has never been seen failing may not be able to fail; break the code once on purpose. <code>pytest.raises(Exception)</code> passes on any error, including typos; name the exact exception. A mutable fixture with a wide scope leaks state between tests, as the shared order list did. Tests that write files into the project folder collide and leave litter; use <code>tmp_path</code>. Floats compared with <code>==</code> fail on harmless rounding noise; use <code>pytest.approx</code>. Treating 100% coverage as proof hides bugs like the <code>&gt;</code> one. And unit tests that call real networks or paid services are slow and flaky; replace those dependencies with test doubles (<a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a>).</p>

  <h2 id="pyt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Writing and running tests</h3>
  <ul>
    <li>Files <code>test_*.py</code> or <code>*_test.py</code>; functions <code>test*</code>; classes <code>Test*</code> without <code>__init__</code>. Plain <code>assert</code>.</li>
    <li>A test passes if it returns without an exception. Node id: <code>file::function[param-id]</code>.</li>
    <li>Steps: discover files → import → collect tests → run each → report.</li>
  </ul>
  <table class="tbl">
    <tr><th>Flag</th><th>Does</th></tr>
    <tr><td><code>-v</code> / <code>-q</code></td><td>Verbose / quiet</td></tr>
    <tr><td><code>-k "expr"</code> · <code>-m "marker"</code> · <code>file::test</code></td><td>Select by name / marker / node id</td></tr>
    <tr><td><code>-x</code> · <code>--lf</code> · <code>--ff</code></td><td>Stop at first failure · rerun last failures · failures first</td></tr>
    <tr><td><code>-s</code></td><td>Show prints</td></tr>
    <tr><td><code>--tb=short|line|no</code> · <code>-rf</code> · <code>-rsx</code></td><td>Traceback style · summary of failures · of skips and xfails</td></tr>
    <tr><td><code>--pdb</code> · <code>--durations=N</code> · <code>--collect-only</code></td><td>Debugger on failure · slowest N · list without running</td></tr>
  </table>
  <h3>Reading a report</h3>
  <ul>
    <li>Summary line (which test) → <code>E</code> lines (actual values: <code>assert 158 == 142</code>, <code>where 158 = bill(...)</code>) → <code>&gt;</code> line and <code>file:line</code>.</li>
    <li>Progress: <code>.</code> pass, <code>F</code> failure (in the test), <code>E</code> error (setup or collection), <code>s</code> skip, <code>x</code> xfail, <code>X</code> xpass.</li>
    <li>Assertion rewriting only in test files and <code>conftest.py</code>. <code>assert (x, "msg")</code> is always true.</li>
  </ul>
  <h3>Core syntax</h3>
  <div class="fx" data-lang="py">import pytest

with pytest.raises(ValueError, match="non-negative") as info:   # must raise
    bill([("samosa", -2, 15)])
assert "samosa" in str(info.value)

@pytest.mark.parametrize("lines, expected", [([], 0), ([("masala chai", 5, 30)], 142)],
                         ids=["empty", "at-150"])
def test_bill(lines, expected):
    assert bill(lines) == expected

@pytest.fixture(scope="module")              # function (default) | class | module | package | session
def menu():
    data = load_menu()                       # setup
    yield data                               # value given to the test
    data.close()                             # teardown, runs even if the test fails

assert total == pytest.approx(184.275)       # floats
pd.testing.assert_frame_equal(got, expected) # DataFrames: values, dtypes, index, order</div>
  <h3>Fixtures and configuration</h3>
  <ul>
    <li>Requested by parameter name; can request other fixtures; never called directly.</li>
    <li>Wide scopes only for expensive, read-only things. <code>autouse=True</code> applies to every test in scope. <code>params=[...]</code> + <code>request.param</code> runs dependent tests once per value.</li>
    <li>Built-ins: <code>tmp_path</code>, <code>capsys</code>, <code>caplog</code>, <code>monkeypatch</code>, <code>request</code>.</li>
    <li><code>conftest.py</code>: fixtures shared with its folder and below, no import.</li>
    <li><code>pytest.ini</code>: <code>testpaths</code>, <code>pythonpath</code>, <code>markers</code>. Register custom markers.</li>
    <li>Markers: <code>skip(reason=)</code>, <code>skipif(cond, reason=)</code>, <code>xfail(reason=, strict=True)</code>; select with <code>-m</code>.</li>
  </ul>
  <h3>Coverage, unittest, TDD</h3>
  <ul>
    <li><code>pytest --cov=till --cov-branch --cov-report=term-missing</code>. 100% coverage with the <code>&gt;</code> bug still passed.</li>
    <li>unittest: <code>TestCase</code> methods, <code>setUp</code>, <code>self.assert*</code>; pytest runs unittest tests too.</li>
    <li>TDD: red (fails for the right reason) → green (simplest code) → refactor (stay green). Property tests check rules over many inputs.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Wrong names → tests silently not collected.</li>
    <li>Expected value from the code under test → can never fail.</li>
    <li>Module-scoped mutable fixture → order-dependent failures.</li>
    <li><code>pytest.raises(Exception)</code> → passes on typos.</li>
    <li><code>==</code> on floats; exact model scores; DataFrames with <code>==</code>.</li>
    <li>Many behaviours in one test → first failure hides the rest.</li>
  </ul>

  <h2 id="pyt-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How does pytest discover tests?</summary><div class="qa-body">Starting from the paths given (or <code>testpaths</code>, or the current folder), it searches folders for files named <code>test_*.py</code> or <code>*_test.py</code>, imports them, and collects functions named <code>test*</code> and <code>test*</code> methods of classes named <code>Test*</code> that have no <code>__init__</code>. The patterns can be changed with <code>python_files</code>, <code>python_functions</code> and <code>python_classes</code> in the configuration.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can pytest use plain <code>assert</code> when unittest needs <code>assertEqual</code>?</summary><div class="qa-body">pytest rewrites the <code>assert</code> statements in test files (and <code>conftest.py</code>) when it imports them, so a failing assert reports the value of each part of the expression, such as <code>assert 158 == 142</code> and <code>where 158 = bill(...)</code>. unittest predates this and needs methods that build the message themselves. Asserts in application code are not rewritten.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a failure (F) and an error (E) in pytest output?</summary><div class="qa-body">A failure is an assertion or exception raised inside the test function. An error is an exception outside the test body: during collection (for example an <code>ImportError</code> in the test file) or in fixture setup or teardown. An error usually means the test never really ran.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test that a function raises an exception with a particular message?</summary><div class="qa-body"><code>with pytest.raises(ValueError, match="non-negative") as info: bill(bad)</code>. It passes only if a <code>ValueError</code> (or subclass) is raised and the regular expression is found in its message; otherwise the test fails with "DID NOT RAISE", or the other exception propagates. <code>info.value</code> is the exception for further checks. Keep only the raising call inside the block.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>parametrize versus a loop inside one test?</summary><div class="qa-body">With a loop, the first failing case stops the test and hides the others, and the report names only the test. With <code>parametrize</code>, each row is a separate test with its own id, such as <code>test_bill[at-150]</code>, all rows run, and you can re-run a single case. Use a loop only when the cases genuinely form one check.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><span>How many tests does this collect, and what are their ids?
<div class="fx" data-lang="py">@pytest.mark.parametrize("x", [1, 2, 3])
@pytest.mark.parametrize("y", ["a", "b"])
def test_grid(x, y):
    pass</div></span></summary><div class="qa-body">Six: stacked parametrize decorators give every combination. The ids are <code>test_grid[a-1]</code>, <code>[a-2]</code>, <code>[a-3]</code>, <code>[b-1]</code>, <code>[b-2]</code> and <code>[b-3]</code>; <code>pytest --collect-only -q</code> lists them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a fixture, and how is it different from unittest's <code>setUp</code>?</summary><div class="qa-body">A fixture is a function decorated with <code>@pytest.fixture</code> that provides a value or resource; a test requests it by naming it as a parameter and pytest passes it in. Unlike <code>setUp</code>, fixtures are requested explicitly per test, can use other fixtures, have configurable scope, can be shared through <code>conftest.py</code>, can be parametrized, and handle clean-up with <code>yield</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><span>What does this print with <code>pytest -s</code>, and does the teardown run?
<div class="fx" data-lang="py">@pytest.fixture
def resource():
    print("setup")
    yield 42
    print("teardown")

def test_one(resource):
    print("test", resource)
    assert resource == 0</div></span></summary><div class="qa-body"><div class="fx" data-lang="text">setup
test 42
Fteardown</div>The fixture runs up to <code>yield</code>, 42 is passed to the test, the test prints and fails (the <code>F</code>), and the code after <code>yield</code> still runs. Teardown is guaranteed even when the test fails.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain fixture scopes. What goes wrong with a module-scoped list?</summary><div class="qa-body">Scope decides how long one fixture value lives: function (the default, new for every test), class, module, package or session. A module-scoped mutable object is shared by every test in the file, so one test's changes are visible to the next, and results depend on test order. Use wide scopes only for expensive, read-only resources, and give tests function-scoped copies of anything they modify.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>conftest.py</code>?</summary><div class="qa-body">A file pytest loads automatically; its fixtures and hooks are available to every test in its folder and below without importing anything. A project can have several, for example a root one for shared fixtures and one in <code>tests/integration/</code> for database fixtures. Tests should not import from it directly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you run the same tests against several configurations, such as CSV and Parquet storage?</summary><div class="qa-body">Parametrize a fixture: <code>@pytest.fixture(params=["csv", "parquet"])</code> and build the storage object from <code>request.param</code>. Every test that requests the fixture then runs once per parameter, reported as <code>test_save[csv]</code> and <code>test_save[parquet]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are markers? How do you skip a test or mark an expected failure?</summary><div class="qa-body">Markers are labels on tests, such as <code>@pytest.mark.integration</code>, selected with <code>-m "not integration"</code> and registered in <code>pytest.ini</code>. Built-ins include <code>skip(reason=)</code>, <code>skipif(condition, reason=)</code> for platform or hardware conditions, and <code>xfail(reason=)</code> for a known bug, reported as <code>x</code>, or <code>X</code> if it unexpectedly passes; <code>strict=True</code> makes an unexpected pass a failure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test a function that prints, writes files or logs?</summary><div class="qa-body">For printing, request the <code>capsys</code> fixture and check <code>capsys.readouterr().out</code>. For files, write into <code>tmp_path</code>, a fresh folder per test, and read the result back. For logging, use <code>caplog</code>: set the level with <code>caplog.set_level(logging.WARNING)</code> and check <code>caplog.text</code> or <code>caplog.records</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you compare floats, NumPy arrays and DataFrames in tests?</summary><div class="qa-body">Floats: <code>pytest.approx</code>, with a default relative tolerance of one in a million, which also works on lists, tuples and dicts. Arrays: <code>np.testing.assert_allclose(actual, expected, rtol=..., atol=...)</code>. DataFrames: <code>pd.testing.assert_frame_equal</code>, which checks values, dtypes, index and column order; <code>df1 == df2</code> gives a table of booleans and NaN never equals NaN.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>pytest versus unittest?</summary><div class="qa-body">unittest is in the standard library: <code>TestCase</code> classes, <code>setUp</code> and <code>tearDown</code>, <code>self.assert*</code> methods and <code>subTest</code>. pytest uses plain functions and <code>assert</code> with detailed failure output, fixtures with scopes, <code>parametrize</code>, markers and a large plugin ecosystem (coverage, parallel runs, async). pytest also runs unittest tests, so a project can migrate gradually.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A test fails only when the whole suite runs, never on its own. What is happening?</summary><div class="qa-body">A test-order dependency: state leaks between tests. Typical causes are a mutable module- or session-scoped fixture, module-level globals or caches, environment variables, files written to a fixed path, or a patched object never restored. Reproduce by running the failing test together with the ones that run before it (the pytest-randomly plugin shuffles order to expose these) and fix by giving each test fresh state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your pytest suite has become slow. How do you speed it up?</summary><div class="qa-body">Measure with <code>--durations=20</code>. Replace real network and database calls in unit tests with test doubles or in-memory versions; widen the scope of expensive read-only fixtures; shrink test data; mark slow integration tests and run them separately; run tests in parallel with pytest-xdist (<code>-n auto</code>), which requires independent tests; and use <code>--lf</code> and <code>-x</code> while iterating.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you debug a failing pytest test?</summary><div class="qa-body">Read the report: summary, then <code>E</code> lines, then the <code>&gt;</code> line. Re-run only that test by node id with <code>-vv</code> for full differences and <code>-s</code> to see prints. <code>--pdb</code> opens the debugger at the failure, <code>--trace</code> breaks at the start of the test, or put <code>breakpoint()</code> in the test. See <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>.</div></details>
</main>
`
});
