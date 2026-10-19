// notes/python/py_testing.js — Testing & Debugging
Object.assign(TOPIC_CONTENT, {
  "py_testing": `<main>
  <h1>Testing &amp; Debugging</h1>
  <p class="lead">Four everyday skills for code you can trust: <strong>testing</strong> (prove it works, and keeps working, with pytest, fixtures, mocks and data/ML checks), <strong>debugging</strong> (find out why it doesn't, with pdb), <strong>profiling</strong> (find out why it's slow) and <strong>logging</strong> (see what it did in production). A silent bug in step 12 of a feature pipeline can corrupt weeks of training data; a 50 ms test catches it before it ships. Each idea starts from the pain it removes, is traced by hand, then run for real. Builds on functions, modules, exceptions and <a class="xref" data-note="py_advanced">decorators &amp; context managers</a>.</p>

  <h2 id="pt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Testing &amp; Debugging</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">pytest basics</div>
        <ul>
          <li><b>Test</b> — a function that runs your code on a known input and checks the answer</li>
          <li><b>Discovery</b> — files <code>test_*.py</code>, functions <code>test_*</code>; no class needed</li>
          <li><b>Plain assert</b> — pytest shows both sides on failure</li>
          <li><b>pytest.raises</b> — <code>with pytest.raises(ValueError, match="pct"):</code></li>
          <li><b>Flags</b> — <code>-v</code> names, <code>-q</code> quiet, <code>-k</code> filter, <code>-x</code> stop at first fail, <code>-s</code> show print, <code>--durations=3</code></li>
          <li><b>Arrange · Act · Assert</b>; one behaviour per test</li>
          <li>💡 a taste test before the dish leaves the kitchen</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fixtures &amp; parametrize</div>
        <ul>
          <li><b>Fixture</b> — reusable setup; a test asks for it by parameter name</li>
          <li><b>yield fixture</b> — code after <code>yield</code> = teardown</li>
          <li><b>Scope</b> — function (default, fresh each test) · module · session</li>
          <li><b>conftest.py</b> — fixtures shared by the folder, no import</li>
          <li><b>Built-ins</b> — <code>tmp_path</code>, <code>monkeypatch</code>, <code>caplog</code>, <code>capsys</code></li>
          <li><b>parametrize</b> — one test body, many inputs, each reported separately</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Unit vs integration</div>
        <ul>
          <li><b>Unit</b> — one function, no I/O, milliseconds; most tests</li>
          <li><b>Integration</b> — real DB/files together; slower, fewer</li>
          <li><b>E2E</b> — whole app/pipeline; fewest</li>
          <li>💡 test pyramid: wide base of unit tests</li>
          <li><b>Markers</b> — <code>@pytest.mark.integration</code> + <code>-m "not integration"</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Mocking</div>
        <ul>
          <li><b>Mock</b> — a stand-in that returns canned answers and records calls</li>
          <li><b>Why</b> — cut out slow/flaky/paid parts: APIs, DBs, clocks</li>
          <li><code>return_value</code>, <code>side_effect</code> (raise / sequence), <code>assert_called_once_with</code></li>
          <li>⚠ <b>Patch where it's looked up</b> — <code>from httpx import get</code> in rates.py → patch <code>"rates.get"</code></li>
          <li><b>autospec</b> — mock keeps the real signature</li>
          <li>⚠ Over-mocking tests the mocks, not the code</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Testing data / ML</div>
        <ul>
          <li><b>Seeds</b> — <code>default_rng(42)</code>, <code>random_state=0</code></li>
          <li><b>Tiny frames</b> — 3 rows you can check by hand; edge cases (0, NaN)</li>
          <li><code>pd.testing.assert_frame_equal</code>; test "input not mutated"</li>
          <li><b>Floats</b> — <code>pytest.approx</code>, never <code>==</code></li>
          <li><b>Models</b> — contracts (shape, probs sum to 1) + thresholds (acc &gt; 0.9)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Profiling</div>
        <ul>
          <li><b>Rule</b> — work → right → fast; measure before optimising</li>
          <li><b>cProfile</b> — every function; <code>cumtime</code> incl. children, <code>tottime</code> own</li>
          <li><b>line_profiler</b> — time per line</li>
          <li><b>timeit</b> — micro-benchmark; take the min of repeats</li>
          <li><b>Found</b> — <code>x in list</code> = 99% of time; set → 1462 ms to 1.4 ms</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Debugging</div>
        <ul>
          <li><b>breakpoint()</b> — pause here in pdb; <code>PYTHONBREAKPOINT=0</code> disables</li>
          <li><code>n</code> next, <code>s</code> step in, <code>c</code> continue, <code>p x</code>, <code>ll</code>, <code>w</code>, <code>u/d</code>, <code>q</code></li>
          <li><b>Post-mortem</b> — <code>python -m pdb script.py</code>, <code>pytest --pdb</code>, <code>%debug</code></li>
          <li>💡 pausing a match video to look at every player</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging</div>
        <ul>
          <li><b>Levels</b> — DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL</li>
          <li><b>logger → handlers → formatter</b>; each handler has its own level</li>
          <li><b>getLogger(__name__)</b> per module; configure once at the entry point</li>
          <li><b>logger.exception</b> — ERROR + full traceback</li>
          <li><b>Lazy args</b> — <code>log.debug("loss=%.4f", x)</code></li>
          <li><b>Structured</b> — JSON lines → searchable</li>
          <li>⚠ print: no level, time, source, or routing</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pt-py"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">pytest Basics</span><span class="rm-sub">Why test, first test, failures</span></div></div>
      <div class="rm-item rm-done" data-target="pt-fx"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Fixtures &amp; Parametrize</span><span class="rm-sub">Setup once, test many inputs</span></div></div>
      <div class="rm-item rm-done" data-target="pt-ui"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Unit vs Integration</span><span class="rm-sub">The pyramid, markers</span></div></div>
      <div class="rm-item rm-done" data-target="pt-mock"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Mocking</span><span class="rm-sub">Patch where it's looked up</span></div></div>
      <div class="rm-item rm-done" data-target="pt-ml"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Testing Data &amp; ML Code</span><span class="rm-sub">Seeds, small frames, approx</span></div></div>
      <div class="rm-item rm-done" data-target="pt-prof"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Profiling</span><span class="rm-sub">cProfile, line-level, timeit</span></div></div>
      <div class="rm-item rm-done" data-target="pt-dbg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Debugging with pdb</span><span class="rm-sub">breakpoint() and post-mortem</span></div></div>
      <div class="rm-item rm-done" data-target="pt-log"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Logging</span><span class="rm-sub">Levels, handlers, JSON</span></div></div>
      <div class="rm-item rm-done" data-target="pt-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">Test a feature module end to end</span></div></div>
      <div class="rm-item rm-done" data-target="pt-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Wrong patch, exact floats, print</span></div></div>
      <div class="rm-item rm-done" data-target="pt-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="pt-py"><span class="num">01</span>pytest Basics</h2>
  <p>How do you know your function works? Most beginners run it once, look at the printed answer, think "looks right", and move on. Two weeks later someone changes a helper it depends on, and it quietly starts returning wrong numbers. Nobody re-runs the old check, because it lived in a notebook cell that has since been deleted. The bug is found by a manager looking at a dashboard.</p>
  <p>A <strong>test</strong> is that "run it and look" check, written down as code so a computer can repeat it in milliseconds, every time anything changes. It runs your function on an input where you already know the right answer, and checks the answer matches. If it does not, the test fails loudly and tells you exactly what differed.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A restaurant kitchen taste-tests a dish before it goes out. A test suite is a set of taste tests that run automatically every time any cook changes the recipe. If the dal is suddenly too salty, the alarm goes off in the kitchen, not at the customer's table.</p></div>
  <p><strong>pytest</strong> is the standard tool for running Python tests. You write ordinary functions whose names start with <code>test_</code>, in files whose names start with <code>test_</code>, and use a plain <code>assert</code> to check things. You then type <code>pytest</code> in the terminal; it finds the files, runs every test function, and reports. Here is the smallest useful example.</p>
  <div class="fx" data-lang="py"># test_first.py
def average(marks):
    return sum(marks) / len(marks)

def test_average_simple():
    assert average([80, 90, 100]) == 90

def test_average_one_item():
    assert average([75]) == 75</div>
  <div class="fx" data-lang="text">$ pytest -v test_first.py
test_first.py::test_average_simple PASSED                                [ 50%]
test_first.py::test_average_one_item PASSED                              [100%]

============================== 2 passed in 0.01s ===============================</div>
  <p>What happened, step by step. pytest found <code>test_first.py</code> because of its name, then collected the two functions starting with <code>test_</code> (it ignores <code>average</code>). It called each one. Inside, <code>assert</code> checks a condition: if it is true nothing happens and the test passes; if false, Python raises <code>AssertionError</code> and pytest marks the test FAILED. <code>-v</code> ("verbose") lists each test by name.</p>
  <div class="flow"><span>find test_*.py</span><span>collect test_* functions</span><span>build fixtures</span><span>run + check asserts</span><span>teardown</span><span>report</span></div>
  <h3>When a test fails</h3>
  <p>A test is only useful if its failure tells you what went wrong. With plain Python, a failed <code>assert</code> just says <code>AssertionError</code>. pytest rewrites your asserts so that on failure it shows the actual value next to the expected one. The code below has an off-by-one bug: it returns one item too few.</p>
  <div class="fx" data-lang="py">def top_k(scores, k):
    return sorted(scores, reverse=True)[:k - 1]      # bug: off by one

def test_top_k():
    assert top_k([0.2, 0.9, 0.5, 0.7], 3) == [0.9, 0.7, 0.5]</div>
  <div class="fx" data-lang="text">    def test_top_k():
&gt;       assert top_k([0.2, 0.9, 0.5, 0.7], 3) == [0.9, 0.7, 0.5]
E       assert [0.9, 0.7] == [0.9, 0.7, 0.5]
E
E         Right contains one more item: 0.5
E         Use -v to get more diff

test_fail.py:5: AssertionError
=========================== short test summary info ============================
FAILED test_fail.py::test_top_k - assert [0.9, 0.7] == [0.9, 0.7, 0.5]
1 failed in 0.02s</div>
  <p>The <code>&gt;</code> marks the failing line. The <code>E</code> lines show what the left side really was (<code>[0.9, 0.7]</code>), and even explain the difference ("Right contains one more item"). You can see the bug without adding a single print. (Older <code>unittest</code> code needs <code>self.assertEqual(a, b)</code> for this; pytest gets it from a plain <code>assert</code>.)</p>
  <h3>Testing that an error is raised</h3>
  <p>Good code refuses bad input. To test that, you need the test to <em>pass</em> when an error happens. <code>pytest.raises</code> is a context manager (a <code>with</code> block): the test passes only if the code inside raises that error type; <code>match=</code> also checks the message. Here is the small feature module used for the rest of this note, and its first tests.</p>
  <div class="fx" data-lang="py"># features.py
import numpy as np
import pandas as pd

def add_features(df: pd.DataFrame) -&gt; pd.DataFrame:
    """Return a copy with price_per_unit and a log of revenue; never mutate input."""
    if (df["qty"] &lt; 0).any():
        raise ValueError("qty must be non-negative")
    out = df.copy()
    out["price_per_unit"] = out["revenue"] / out["qty"].replace(0, np.nan)
    out["log_revenue"] = np.log1p(out["revenue"])
    return out

def discount(price: float, pct: float) -&gt; float:
    if not 0 &lt;= pct &lt;= 100:
        raise ValueError("pct must be in [0, 100]")
    return round(price * (1 - pct / 100), 2)</div>
  <div class="fx" data-lang="py"># test_features.py (start)
import pytest
from features import discount

def test_discount_basic():
    assert discount(200, 10) == 180           # Arrange + Act + Assert in one line

def test_discount_rejects_bad_pct():
    with pytest.raises(ValueError, match="pct must be"):
        discount(100, 150)                    # must raise, or the test fails</div>
  <p><code>test_discount_basic</code> checks a normal case: 10% off 200 is 180. <code>test_discount_rejects_bad_pct</code> passes because <code>discount(100, 150)</code> raises <code>ValueError</code> with a matching message. If someone later deletes the range check, <code>discount</code> would return −50 without complaint, nothing would be raised, and this test would fail with "DID NOT RAISE".</p>
  <table class="tbl">
    <tr><th>Command</th><th>Does</th></tr>
    <tr><td><code>pytest</code></td><td>Run every test in this folder and below</td></tr>
    <tr><td><code>pytest -k discount</code></td><td>Only tests whose name contains "discount"</td></tr>
    <tr><td><code>pytest -x</code> / <code>--lf</code></td><td>Stop at first failure / rerun only last failures</td></tr>
    <tr><td><code>pytest -s</code></td><td>Show <code>print</code> output (normally captured)</td></tr>
    <tr><td><code>pytest --durations=3</code></td><td>List the three slowest tests</td></tr>
    <tr><td><code>pytest --cov=pkg</code></td><td>Coverage report (pytest-cov plugin)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>unit test</strong> checks one small piece of code against a known answer. A good test follows <strong>Arrange–Act–Assert</strong>: set up the input, call the code once, check the result. A <strong>regression</strong> is a bug that comes back after being fixed; a test written for each fixed bug stops it returning. <strong>Coverage</strong> is the share of lines your tests run.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A test that never fails proves nothing. A typo like <code>assert discount(200, 10) == discount(200, 10)</code> always passes. Watch every new test fail once (break the code or the expected value) before you trust it. And 100% coverage only means every line <em>ran</em>, not that its answer was checked.</p></div>
  <p>Why it matters: in data science, tests guard feature code, data cleaning and metric functions, the places where a silent wrong number does the most damage. CI systems (GitHub Actions and similar) run <code>pytest</code> on every pull request. Interviewers ask "how would you test this function?" and "pytest vs unittest?".</p>

  <h2 id="pt-fx"><span class="num">02</span>Fixtures &amp; Parametrize</h2>
  <p>Your tests for <code>add_features</code> all need the same small DataFrame. Copying the same five lines into every test is boring, and when the columns change you edit ten places. Some setup is also expensive (loading a model takes seconds) and you would like to do it once, not before every test. And some setup needs cleanup afterwards (delete a temp file, close a connection).</p>
  <p>A <strong>fixture</strong> is a function that prepares something a test needs. You mark it with <code>@pytest.fixture</code>. A test asks for it simply by having a parameter with the same name; pytest sees the name, runs the fixture, and passes in the result. You never call the fixture yourself.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A restaurant's prep station. Before service, chopped onions, ginger-garlic paste and boiled potatoes are ready in labelled bowls. A cook making a dish just says "I need onions" and the bowl is handed over. Some prep is per dish (fresh coriander every time); some is once for the night (a big pot of stock). That is fixture <em>scope</em>.</p></div>
  <p>Fixtures that many test files share go in a file named <code>conftest.py</code>. pytest loads it automatically; the tests do not need to import anything.</p>
  <div class="fx" data-lang="py"># conftest.py: shared with every test file in this folder, no import needed
import pandas as pd
import pytest

@pytest.fixture
def sales():                       # small, hand-checkable input
    return pd.DataFrame({"qty": [2, 0, 5], "revenue": [100.0, 0.0, 50.0]})</div>
  <p>Any test can now write <code>def test_something(sales):</code> and receive a fresh copy of this frame. We use it in section 05.</p>
  <h3>Parametrize: one test, many inputs</h3>
  <p>To test <code>discount</code> on five inputs you could write five nearly identical test functions. <code>@pytest.mark.parametrize</code> lets you write the test body once and give a table of inputs and expected outputs. pytest turns each row into its own test.</p>
  <div class="fx" data-lang="py">@pytest.mark.parametrize("price, pct, expected", [
    (100, 0, 100),        # no discount
    (100, 100, 0),        # free
    (19.99, 15, 16.99),   # rounding
])
def test_discount_cases(price, pct, expected):
    assert discount(price, pct) == expected</div>
  <div class="fx" data-lang="text">$ pytest -v test_features.py
test_features.py::test_discount_basic PASSED                             [ 14%]
test_features.py::test_discount_cases[100-0-100] PASSED                  [ 28%]
test_features.py::test_discount_cases[100-100-0] PASSED                  [ 42%]
test_features.py::test_discount_cases[19.99-15-16.99] PASSED             [ 57%]
test_features.py::test_discount_rejects_bad_pct PASSED                   [ 71%]
test_features.py::test_add_features PASSED                               [ 85%]
test_features.py::test_add_features_does_not_mutate PASSED               [100%]

============================== 7 passed in 0.02s ===============================</div>
  <p>The three rows became three tests, each named with its inputs in square brackets, e.g. <code>[19.99-15-16.99]</code>. If one row fails, the report names exactly which input broke, and the other rows still run. (The full file also has the two <code>add_features</code> tests from section 05.)</p>
  <h3>Scope and teardown</h3>
  <p>By default a fixture is rebuilt for every test (<strong>function scope</strong>). That keeps tests independent: if one test changes the data, the next one still gets a clean copy. For something expensive and read-only, like a loaded model, you can set <code>scope="module"</code> (once per test file) or <code>scope="session"</code> (once per whole run). If the fixture uses <code>yield</code> instead of <code>return</code>, the code after <code>yield</code> runs after the tests are done: that is the cleanup (the same idea as a <a class="xref" data-note="py_advanced">context manager</a>).</p>
  <figure class="viz"><svg viewBox="0 0 520 132" width="520">
    <rect x="20" y="20" width="480" height="24" rx="5" class="fv"/><text x="30" y="37">model (scope="module"): load once ... unload after last test</text>
    <rect x="30" y="60" width="140" height="22" rx="4" class="fb"/><text x="40" y="76">batch #1 · test_a</text>
    <rect x="190" y="60" width="140" height="22" rx="4" class="fb"/><text x="200" y="76">batch #2 · test_b</text>
    <rect x="350" y="60" width="140" height="22" rx="4" class="fb"/><text x="360" y="76">batch #3 · test_c</text>
    <text x="30" y="106" class="tm">function scope (default): rebuilt per test,</text><text x="30" y="122" class="tm">so test_b's append can't leak into test_c</text>
  </svg><figcaption>The long violet bar is one model shared by all three tests (module scope). The three blue boxes are three separate batches, one per test (function scope).</figcaption></figure>
  <p>The code below proves it with prints. <code>-s</code> lets us see them.</p>
  <div class="fx" data-lang="py">import pytest

@pytest.fixture(scope="module")
def model():
    print("[load model once]")
    yield "model-v1"
    print(" [unload model]")          # after yield = teardown

@pytest.fixture
def batch():                          # default scope="function"
    print("[new batch]", end=" ")
    return [1, 2, 3]

def test_a(model, batch): assert model == "model-v1"
def test_b(model, batch): batch.append(4); assert len(batch) == 4
def test_c(model, batch): assert len(batch) == 3   # fresh copy, not mutated</div>
  <div class="fx" data-lang="text">$ pytest -q -s test_scope.py
[load model once]
[new batch] .[new batch] .[new batch] . [unload model]

3 passed in 0.01s</div>
  <p>Trace: "load model once" printed one time; each test got a "new batch" (each dot is a passed test); "unload model" ran after the last test. <code>test_b</code> appended 4 to its batch, but <code>test_c</code> still saw 3 items because it received its own fresh list. With <code>scope="module"</code> on <code>batch</code>, <code>test_c</code> would fail: tests would leak into each other.</p>
  <table class="tbl">
    <tr><th>Built-in fixture</th><th>Gives you</th></tr>
    <tr><td><code>tmp_path</code></td><td>A fresh temporary folder (a <code>pathlib.Path</code>) per test</td></tr>
    <tr><td><code>monkeypatch</code></td><td>Set env vars / attributes, automatically undone after the test</td></tr>
    <tr><td><code>caplog</code></td><td>Captured log records (<code>caplog.text</code>)</td></tr>
    <tr><td><code>capsys</code></td><td>Captured stdout/stderr</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>fixture</strong> provides test inputs or resources, injected by parameter name (this pattern is called <strong>dependency injection</strong>). <strong>Scope</strong> sets how often it is rebuilt: function, class, module, package, session. <strong>parametrize</strong> generates one test per row of arguments.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Wide scope for something a test changes. A session-scoped DataFrame that one test edits in place makes other tests pass or fail depending on the order they run in. Keep wide scopes for read-only things only.</p></div>

  <h2 id="pt-ui"><span class="num">03</span>Unit vs Integration Tests</h2>
  <p>Every function can pass its own tests and the program can still be broken. <code>add_features</code> works on a DataFrame; but does the result survive being saved to the database and read back? Column names, data types and NaNs often change at that boundary. Tests that check one function in isolation cannot see this. Tests that run the real database catch it, but they are slower and need more setup.</p>
  <p>So there are two kinds. A <strong>unit test</strong> checks one function with no real files, network or database, and runs in milliseconds. An <strong>integration test</strong> checks that several real parts work together (your code plus a real SQLite file, for example). You want many of the first and a few of the second, plus a handful of <strong>end-to-end (E2E)</strong> tests that run the whole pipeline.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Building a car. Unit tests check each part on a bench: the brakes grip, the lights turn on. Integration tests fit the brakes to the wheel and check they stop it. The E2E test is a test drive on the road. You do thousands of bench checks, fewer fitting checks, and a few test drives.</p></div>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
    <polygon points="230,15 290,60 170,60" class="fr"/><text x="207" y="52">E2E</text>
    <polygon points="170,64 290,64 350,108 110,108" class="fv"/><text x="190" y="92">Integration</text>
    <polygon points="110,112 350,112 410,156 50,156" class="fg"/><text x="210" y="140">Unit</text>
    <text x="300" y="40" class="tm">few · slow · realistic</text>
    <text x="360" y="92" class="tm">real DB/files</text>
    <text x="418" y="140" class="tm">many, ms each</text>
  </svg><figcaption>The test pyramid. Width = how many tests of that kind you keep. The wide base is fast unit tests; the narrow top is slow, realistic end-to-end tests.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Unit</th><th>Integration</th></tr>
    <tr><td>Scope</td><td>One function/class</td><td>Several parts + real I/O</td></tr>
    <tr><td>Dependencies</td><td>Faked or none</td><td>Real (SQLite, files, local server)</td></tr>
    <tr><td>Speed</td><td>ms</td><td>100 ms – minutes</td></tr>
    <tr><td>Catches</td><td>Logic bugs</td><td>Wiring bugs: schemas, configs, types across a boundary</td></tr>
  </table>
  <p>The test below is an integration test: it writes the features to a real SQLite database file inside <code>tmp_path</code> (a throwaway folder pytest creates), reads them back, and checks the columns and the NaN survived. <code>@pytest.mark.integration</code> puts a label on it so you can choose to skip slow tests.</p>
  <div class="fx" data-lang="py">import sqlite3
import pandas as pd
import pytest
from features import add_features

@pytest.mark.integration                       # run with: pytest -m integration
def test_features_round_trip_db(tmp_path, sales):
    db = tmp_path / "feat.db"                  # tmp_path: fresh dir per test
    with sqlite3.connect(db) as con:
        add_features(sales).to_sql("features", con, index=False)
        back = pd.read_sql("SELECT * FROM features", con)
    assert list(back.columns) == ["qty", "revenue", "price_per_unit", "log_revenue"]
    assert back["price_per_unit"].isna().sum() == 1</div>
  <div class="fx" data-lang="text"># pytest.ini
[pytest]
markers =
    integration: slow tests that touch real files, DBs or services

$ pytest -q -m "not integration"
..........                                                               [100%]
10 passed, 1 deselected in 0.03s
$ pytest -v -m integration
test_integration.py::test_features_round_trip_db PASSED                  [100%]
======================= 1 passed, 10 deselected in 0.06s =======================</div>
  <p>The test used two fixtures at once: the built-in <code>tmp_path</code> and our <code>sales</code>. It checks the one NaN (from qty = 0) came back as NULL → NaN, not as 0 or an error. <code>pytest.ini</code> registers the marker name (pytest warns about unknown markers). <code>-m "not integration"</code> ran the 10 fast tests and skipped ("deselected") the slow one; <code>-m integration</code> ran only it. A common CI setup runs the fast set on every push and the full set before a release.</p>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>test pyramid</strong>: many unit tests, fewer integration tests, very few end-to-end tests. A <strong>marker</strong> (<code>@pytest.mark.name</code>) tags tests so <code>-m</code> can select or skip them.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Integration tests pointing at a shared real database or production API. They become slow and flaky, and can damage real data. Use a throwaway SQLite file, a Docker container, or a local server started by a fixture.</p></div>

  <h2 id="pt-mock"><span class="num">04</span>Mocking</h2>
  <p>Some code calls things you do not want in a unit test: a currency API that costs money per call, a database in another city, a model server that takes 3 seconds, the current time. Real calls make tests slow, make them fail when the Wi-Fi drops, and make the answer change from day to day. You want to test <em>your</em> logic ("multiply by the rate and round"), not the API.</p>
  <p>A <strong>mock</strong> is a fake object you put in place of the real dependency during a test. You tell it what to return. It also records how it was called, so you can check your code called it correctly.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A film shoot uses a stunt double for the dangerous scene. The double looks right from the camera's angle and does exactly what the script says. Nobody risks the real actor. A mock is a stunt double for the API: it plays its part on cue, and nothing real gets hurt.</p></div>
  <p>Python's built-in <code>unittest.mock.MagicMock</code> is the usual stunt double. The code below shows its three main controls: <code>return_value</code> (always answer this), <code>side_effect</code> (answer these in turn, or raise), and the call record.</p>
  <div class="fx" data-lang="py">from unittest.mock import MagicMock, create_autospec

m = MagicMock()
m.predict.return_value = [1, 0]
print(m.predict([[5.1], [4.9]]))              # canned answer
print(m.predict.call_args)                    # what it was called with
m.predict.assert_called_once_with([[5.1], [4.9]])
print(m.anything.you.like)                    # auto-creates attributes...

flaky = MagicMock(side_effect=[TimeoutError("slow"), {"ok": True}])
for _ in range(2):
    try:
        print(flaky())
    except TimeoutError as e:
        print("raised", e)

def score(x, threshold=0.5): ...
safe = create_autospec(score)                 # same signature as the real thing
try:
    safe(1, 2, 3)
except TypeError as e:
    print("autospec:", e)</div>
  <div class="fx" data-lang="text">[1, 0]
call([[5.1], [4.9]])
&lt;MagicMock name='mock.anything.you.like' id='140320183710928'&gt;
raised slow
{'ok': True}
autospec: too many positional arguments</div>
  <p>Line by line. <code>m.predict</code> did not exist; MagicMock created it on first use, and it returned the canned <code>[1, 0]</code>. <code>call_args</code> shows the exact arguments, and <code>assert_called_once_with</code> passed silently (it raises if the call differs). The <code>side_effect</code> list made the first call raise a timeout and the second return a dict: perfect for testing retry code. The third printed line shows the danger: a MagicMock accepts <em>anything</em>, even a typo like <code>m.predcit</code>, so wrong code can pass. <code>create_autospec</code> fixes that by copying the real function's signature: calling it with three arguments was rejected.</p>
  <h3>The classic trap: patch where it's looked up</h3>
  <p>To swap a real function for a mock during a test you use <code>unittest.mock.patch("module.name")</code>. It temporarily replaces <em>that name in that module</em>. The question is which module. Here is a module that converts dollars to rupees using a live rate.</p>
  <div class="fx" data-lang="py"># rates.py
from httpx import get                      # copies the name 'get' into THIS module

def usd_to_inr(amount):
    rate = get("http://rates.invalid/usd-inr").json()["rate"]
    return round(amount * rate, 2)</div>
  <p><code>from httpx import get</code> creates a new name <code>get</code> inside <code>rates</code>, pointing at httpx's function. From then on, <code>usd_to_inr</code> looks up <code>rates.get</code>, not <code>httpx.get</code>. So patching <code>httpx.get</code> changes a name that <code>rates</code> never reads again.</p>
  <figure class="viz"><svg viewBox="0 0 540 170" width="540">
    <defs><marker id="pt-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="150" height="50" rx="6" class="fs"/><text x="20" y="40">module httpx</text><text x="20" y="60" class="tr">get → MagicMock</text>
    <rect x="10" y="100" width="150" height="50" rx="6" class="fs"/><text x="20" y="120">module rates</text><text x="20" y="140" class="tb">get → real get</text>
    <rect x="360" y="60" width="170" height="50" rx="6" class="fb sb"/><text x="372" y="82">real httpx.get</text><text x="372" y="100" class="tm">function object</text>
    <line x1="160" y1="125" x2="356" y2="92" class="sb" stroke-width="2" marker-end="url(#pt-ah1)"/>
    <text x="190" y="140" class="tm">"from httpx import get" copied this reference</text>
    <text x="190" y="40" class="tm">patch("httpx.get") rebinds only this name</text>
  </svg><figcaption>Two modules, two names. patch("httpx.get") swapped the name in the httpx box (top). The rates box (bottom) still holds its own copy of the arrow to the real function, so the real network call still happens.</figcaption></figure>
  <div class="fx" data-lang="py"># test_rates.py
from unittest.mock import patch
from rates import usd_to_inr

def test_patch_wrong_place():
    with patch("httpx.get") as fake:                 # where it's DEFINED
        fake.return_value.json.return_value = {"rate": 83.0}
        assert usd_to_inr(10) == 830.0               # real network call happens!

def test_patch_right_place():
    with patch("rates.get") as fake:                 # where it's LOOKED UP
        fake.return_value.json.return_value = {"rate": 83.0}
        assert usd_to_inr(10) == 830.0
        fake.assert_called_once_with("http://rates.invalid/usd-inr")</div>
  <div class="fx" data-lang="text">$ pytest -q --tb=line test_rates.py
E   httpx.ConnectError: [Errno -2] Name or service not known
FAILED test_rates.py::test_patch_wrong_place - httpx.ConnectError: [Errno -2]...
1 failed, 1 passed in 0.13s</div>
  <p>The wrong-place test really tried to reach the internet and failed with a connection error. The right-place test passed. Read <code>fake.return_value.json.return_value = {...}</code> as a chain: "calling <code>fake(...)</code> returns a response whose <code>.json()</code> returns this dict", which mirrors <code>get(url).json()</code> in the code. The last line confirms our code asked for the right URL.</p>
  <p>If the module had written <code>import httpx</code> and called <code>httpx.get(...)</code>, it would look the name up on the httpx module at every call, and <code>patch("httpx.get")</code> <em>would</em> work. The rule never changes: patch the name exactly where the code under test looks it up. pytest's <code>monkeypatch.setattr(rates, "get", fake_get)</code> does the same job and is undone automatically after the test.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>test double</strong> replaces a real dependency in a test. A <strong>stub</strong> only returns canned data; a <strong>mock</strong> also records calls so you can assert on them. <strong>Patching</strong> temporarily rebinds a name in a module's namespace. <strong>autospec</strong> makes the mock reject calls the real object would reject.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Over-mocking. If you mock pandas, your own helper functions and the database layer, the test only checks that your code calls mocks in a certain order, and it breaks on every harmless refactor. Mock only at the edges of your system: network, database, clock, randomness, paid services.</p></div>

  <h2 id="pt-ml"><span class="num">05</span>Testing Data &amp; ML Code</h2>
  <p>Data and ML code is harder to test than <code>discount</code>. The input is a whole table, not a number. Training is random, so the output changes every run. Accuracy is a float like 0.9466 that moves in the fourth decimal when a library updates. Beginners conclude "ML code can't be tested". It can; you just test different things.</p>
  <p>Four habits make it work. Fix the randomness with a <strong>seed</strong> (a starting number for the random generator, so it produces the same "random" numbers every run). Use <strong>tiny inputs</strong> you can compute by hand, including edge cases. Test <strong>contracts</strong>, the promises that must always hold (shapes, column names, probabilities between 0 and 1, input not changed). And for model quality, test a <strong>threshold</strong> on data with a pattern you planted, not an exact number.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A school exam for a model. You do not check that a student scores exactly 87.5 every time; you check they pass (above 40) on questions whose answers you know. And you check the answer sheet has the right number of pages and their roll number on it: that is the contract.</p></div>
  <div class="cards">
    <div><b>Fix randomness</b><p>Seeded <code>default_rng(42)</code>, <code>random_state=0</code>. Same input → same output.</p></div>
    <div><b>Tiny fixtures</b><p>3 rows you can compute by hand, including edge cases (qty 0, NaN).</p></div>
    <div><b>Contracts</b><p>Shapes, dtypes, columns, ranges, probabilities sum to 1, input not mutated.</p></div>
    <div><b>Thresholds</b><p>Model learns a planted signal: acc &gt; 0.9, not acc == 0.9466.</p></div>
  </div>
  <h3>Testing a pandas transform</h3>
  <p>Work out the expected answer by hand first. With the <code>sales</code> fixture (qty 2, 0, 5 and revenue 100, 0, 50): price per unit is 100/2 = 50, then 0/0 which we want as NaN (not infinity, not a crash), then 50/5 = 10. The test builds that expected frame and compares.</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from features import add_features

def test_add_features(sales):
    out = add_features(sales)
    expected = pd.DataFrame({
        "qty": [2, 0, 5], "revenue": [100.0, 0.0, 50.0],
        "price_per_unit": [50.0, np.nan, 10.0],          # qty 0 -&gt; NaN, not inf
        "log_revenue": np.log1p([100.0, 0.0, 50.0]),
    })
    pd.testing.assert_frame_equal(out, expected)     # checks values, dtypes, index, column order

def test_add_features_does_not_mutate(sales):
    before = sales.copy()
    add_features(sales)
    pd.testing.assert_frame_equal(sales, before)</div>
  <p>Both passed in the run shown in section 02. <code>pd.testing.assert_frame_equal</code> is the right tool: plain <code>==</code> on DataFrames gives a table of True/False (and NaN never equals NaN), while this function compares values, dtypes, index and column order, treats NaN = NaN, and prints a readable diff on failure. The second test is a contract: the docstring promises "never mutate input", and if someone deletes <code>df.copy()</code> this test catches it.</p>
  <h3>Testing a model</h3>
  <p>The fixture below makes 200 random rows with a seeded generator and a <em>known</em> rule: the label is 1 when <code>x0 + 0.5·x1 &gt; 0</code>. A working logistic regression must learn this easily. Three tests: the split is reproducible, the model learns the planted rule above a threshold, and the probability output keeps its contract.</p>
  <div class="fx" data-lang="py">import numpy as np
import pytest
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

@pytest.fixture
def toy_data():
    rng = np.random.default_rng(42)            # local, seeded generator
    X = rng.normal(size=(200, 3))
    y = (X[:, 0] + 0.5 * X[:, 1] &gt; 0).astype(int)   # known rule
    return X, y

def test_split_is_reproducible(toy_data):
    X, y = toy_data
    a = train_test_split(X, y, test_size=0.25, random_state=0)
    b = train_test_split(X, y, test_size=0.25, random_state=0)
    assert all(np.array_equal(p, q) for p, q in zip(a, b))

def test_model_learns_signal(toy_data):
    X, y = toy_data
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=0)
    acc = LogisticRegression().fit(Xtr, ytr).score(Xte, yte)
    assert acc &gt; 0.9                           # threshold, not an exact number

def test_output_contract(toy_data):
    X, y = toy_data
    proba = LogisticRegression().fit(X, y).predict_proba(X[:5])
    assert proba.shape == (5, 2)
    assert proba.sum(axis=1) == pytest.approx(np.ones(5))   # floats: use approx
    assert ((proba &gt;= 0) &amp; (proba &lt;= 1)).all()</div>
  <div class="fx" data-lang="text">$ pytest -q --durations=3
..............                                                           [100%]
============================= slowest 3 durations ==============================
0.10s call     test_ml.py::test_output_contract
0.08s call     test_ml.py::test_model_learns_signal
0.04s call     test_integration.py::test_features_round_trip_db
14 passed in 1.40s</div>
  <p>All 14 tests in the folder passed (the 7 feature tests, 3 scope demos, 1 integration, 3 ML). The actual accuracy was 1.0, but the test only demands &gt; 0.9, so a library update that moves it to 0.98 does not break the build, while a real bug (labels shuffled, wrong column) drops it to about 0.5 and fails. <code>pytest.approx</code> compares floats with a small tolerance, because the five probability sums are 1 only up to rounding. <code>--durations=3</code> lists the slowest tests, handy when the suite gets slow.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>seed</strong> fixes a pseudo-random generator's starting state so results repeat. A <strong>contract test</strong> checks properties that must always hold (shape, range, schema). A <strong>behavioural test</strong> checks the model on data with a known pattern, using a threshold.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>0.1 + 0.2 == 0.3</code> is <code>False</code> (it is 0.30000000000000004). Compare floats with <code>pytest.approx</code> or <code>np.testing.assert_allclose</code>. And never assert an exact accuracy: it changes with library versions and hardware.</p></div>
  <p>Interview angle: "how do you test an ML pipeline?" Good answer: unit tests on feature functions with tiny frames, contract tests on outputs, a seeded behavioural test on planted signal, a data-validation step on real inputs (schema, null rates), and "overfit a tiny batch" as a sanity check for deep-learning code.</p>

  <h2 id="pt-prof"><span class="num">06</span>Profiling</h2>
  <p>Your pipeline takes 40 minutes. You guess that pandas is slow and spend a day rewriting it in numpy. It now takes 39 minutes. The real problem was a single line somewhere else. Guessing where time goes is almost always wrong, even for experienced engineers.</p>
  <p>A <strong>profiler</strong> runs your program and measures how much time each function (or each line) takes. You then fix only the biggest one, and measure again. The rule is: make it work, make it right (tests pass), then make it fast, and only after measuring.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A doctor orders a blood test before prescribing medicine. Optimising without a profile is prescribing on a guess. The profile is the blood report: it points at the one number that is out of range.</p></div>
  <div class="flow"><span>make it work</span><span>make it right (tests pass)</span><span>profile</span><span>fix the top hotspot</span><span>re-profile</span></div>
  <p>The program below loads 20,000 user names, cleans them, and removes duplicates. Python's built-in <code>cProfile</code> records every function call; <code>pstats</code> prints the top 6 sorted by <code>cumulative</code> time.</p>
  <div class="fx" data-lang="py">import cProfile, pstats, random

def load(n):
    random.seed(0)
    return [f"user{random.randint(0, n)}" for _ in range(n)]

def clean(name):
    return name.strip().lower()

def dedupe(names):
    seen = []
    for x in names:
        if x not in seen:          # list membership: O(n) each time
            seen.append(x)
    return seen

def run():
    names = load(20_000)
    names = [clean(x) for x in names]
    return dedupe(names)

if __name__ == "__main__":
    with cProfile.Profile() as pr:
        run()
    pstats.Stats(pr).sort_stats("cumulative").print_stats(6)</div>
  <div class="fx" data-lang="text">         245499 function calls in 1.447 seconds

   Ordered by: cumulative time
   List reduced from 18 to 6 due to restriction &lt;6&gt;

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    0.004    0.004    1.447    1.447 pipeline.py:17(run)
        1    1.363    1.363    1.366    1.366 pipeline.py:10(dedupe)
        1    0.008    0.008    0.062    0.062 pipeline.py:3(load)
    20000    0.007    0.000    0.054    0.000 random.py:336(randint)
    20000    0.018    0.000    0.046    0.000 random.py:295(randrange)
    20000    0.013    0.000    0.021    0.000 random.py:245(_randbelow_with_getrandbits)</div>
  <p>(Folder paths shortened.) How to read it: <code>ncalls</code> is how many times the function was called. <code>tottime</code> is time spent in the function's <em>own</em> lines. <code>cumtime</code> is time including everything it called. <code>run</code> has cumtime 1.447 s but tottime only 0.004 s: it is slow because of what it calls. <code>dedupe</code> has tottime 1.363 s of the 1.447 s total, so the problem is inside <code>dedupe</code> itself. <code>load</code>, which calls <code>randint</code> 20,000 times, costs only 0.06 s. Not what most people would guess.</p>
  <figure class="viz"><svg viewBox="0 0 520 110" width="520">
    <text x="10" y="28">dedupe</text><rect x="140" y="14" width="300" height="20" class="fr sr"/><text x="446" y="29">1.37 s</text>
    <text x="10" y="58">load</text><rect x="140" y="44" width="14" height="20" class="fb sb"/><text x="160" y="59">0.06 s</text>
    <text x="10" y="88">clean+other</text><rect x="140" y="74" width="4" height="20" class="fs"/><text x="151" y="89">0.02 s</text>
  </svg><figcaption>cumtime per function as bars. One function owns about 95% of the run. Fix that one and ignore the rest.</figcaption></figure>
  <h3>Line level, then timeit the fix</h3>
  <p><code>line_profiler</code> (a pip package) goes one level deeper: time per <em>line</em> inside a function.</p>
  <div class="fx" data-lang="py">from line_profiler import LineProfiler
from pipeline import load, clean, dedupe
names = [clean(x) for x in load(20_000)]
lp = LineProfiler(dedupe)
lp.runcall(dedupe, names)
lp.print_stats(output_unit=1e-3)
# usual CLI form: decorate with @profile, run: kernprof -l -v pipeline.py</div>
  <div class="fx" data-lang="text">Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
    10                                           def dedupe(names):
    11         1          0.0      0.0      0.0      seen = []
    12     20001          7.1      0.0      0.5      for x in names:
    13     20000       1400.9      0.1     99.1          if x not in seen:          # list membership: O(n) each time
    14     12674          5.6      0.0      0.4              seen.append(x)
    15         1          0.0      0.0      0.0      return seen</div>
  <p>Line 13 takes 99.1% of the time. <code>x not in seen</code> on a <em>list</em> checks items one by one, so with 12,674 unique names it does up to 12,674 comparisons per name: about 20,000 × 6,000 ≈ 120 million comparisons. A <em>set</em> checks membership in one hash lookup. Now measure the fix with <code>timeit</code>, which runs a statement several times and reports the time.</p>
  <div class="fx" data-lang="py">import timeit
def dedupe_set(names):
    seen, out = set(), []
    for x in names:
        if x not in seen:          # set membership: O(1)
            seen.add(x)
            out.append(x)
    return out

assert dedupe(names) == dedupe_set(names) == list(dict.fromkeys(names))   # same answer first!
g = {"dedupe": dedupe, "dedupe_set": dedupe_set, "names": names}
for stmt in ["dedupe(names)", "dedupe_set(names)", "list(dict.fromkeys(names))"]:
    best = min(timeit.repeat(stmt, globals=g, number=3, repeat=3)) / 3
    print(f"{stmt:&lt;28}{best*1000:9.2f} ms")</div>
  <div class="fx" data-lang="text">dedupe(names)                 1462.34 ms
dedupe_set(names)                1.40 ms
list(dict.fromkeys(names))       0.94 ms</div>
  <p>The <code>assert</code> first checks all three give the same list (same order too), because a fast wrong answer is worthless. Then the set version is about 1000× faster; the one-liner <code>dict.fromkeys</code> (dicts keep insertion order) is fastest. One changed line turned 1.4 seconds into 1.4 milliseconds.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>hotspot</strong> is the small part of the code where most time is spent. <strong>tottime</strong> = own time; <strong>cumtime</strong> = own + callees. A <strong>micro-benchmark</strong> (timeit) times one small statement many times.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>With <code>timeit</code>, take the <em>minimum</em> of the repeats (background noise only ever adds time), and keep setup out of the timed statement. In Jupyter: <code>%timeit</code>, <code>%prun</code>, <code>%lprun</code>. And in pandas the usual hotspot is a row-by-row <code>apply</code> or a Python loop over rows; the fix is a vectorised column operation.</p></div>

  <h2 id="pt-dbg"><span class="num">07</span>Debugging with pdb</h2>
  <p>A function crashes with <code>ZeroDivisionError</code>. The usual reaction is to add <code>print(total)</code>, re-run, see the value, add another print, re-run again. On a pipeline that takes five minutes to reach the bug, ten rounds of prints waste an hour, and you forget to remove some of them.</p>
  <p>A <strong>debugger</strong> pauses the program at a chosen line and gives you a prompt where you can look at every variable, run one line at a time, and step into function calls, all without restarting. Python's built-in debugger is <strong>pdb</strong>. Put <code>breakpoint()</code> on a line and the program stops there.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Pausing a cricket replay at the exact ball where the wicket fell. You can look at every fielder's position, then play forward frame by frame. Prints are like reading the scorecard afterwards: you only see what someone chose to write down.</p></div>
  <div class="fx" data-lang="py">def normalise(values):
    total = sum(values)
    breakpoint()                       # pause here
    return [v / total for v in values]

print(normalise([3, -1, -2]))</div>
  <div class="fx" data-lang="text">&gt; buggy.py(3)normalise()
-&gt; breakpoint()                       # pause here
(Pdb) p values, total
([3, -1, -2], 0)
(Pdb) ll
  1  	def normalise(values):
  2  	    total = sum(values)
  3  -&gt;	    breakpoint()                       # pause here
  4  	    return [v / total for v in values]
(Pdb) n
&gt; buggy.py(4)normalise()
-&gt; return [v / total for v in values]
(Pdb) c
Traceback (most recent call last):
  ...
ZeroDivisionError: division by zero</div>
  <p>Walk through the session (what we typed is after each <code>(Pdb)</code>). The program stopped at line 3 and showed where. <code>p values, total</code> printed both variables: the values sum to 0, which is the whole bug. <code>ll</code> ("long list") showed the function with an arrow at the current line. <code>n</code> ("next") ran one line. <code>c</code> ("continue") let the program run on, and it crashed as expected. The fix (guard against a zero total) is now obvious.</p>
  <table class="tbl">
    <tr><th>Cmd</th><th>Does</th><th>Cmd</th><th>Does</th></tr>
    <tr><td><code>n</code></td><td>Next line (step over calls)</td><td><code>p expr</code> / <code>pp</code></td><td>Print / pretty-print</td></tr>
    <tr><td><code>s</code></td><td>Step into a call</td><td><code>l</code> / <code>ll</code></td><td>List code / whole function</td></tr>
    <tr><td><code>c</code></td><td>Continue to next breakpoint</td><td><code>w</code></td><td>Where: call stack</td></tr>
    <tr><td><code>r</code></td><td>Run until function returns</td><td><code>u</code> / <code>d</code></td><td>Move up/down the stack</td></tr>
    <tr><td><code>b file:line</code></td><td>Set a breakpoint</td><td><code>q</code></td><td>Quit</td></tr>
  </table>
  <p>When the crash has already happened, use <strong>post-mortem</strong> debugging: <code>python -m pdb script.py</code> runs the script and stops at the crash; <code>pytest --pdb</code> opens pdb at a failing test; in Jupyter, type <code>%debug</code> in the next cell. You land in the failing line with every variable still there, and <code>u</code> walks up to the caller to see what it passed.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>breakpoint</strong> is a line where execution pauses. <strong>Step over</strong> (<code>n</code>) runs a call without entering it; <strong>step into</strong> (<code>s</code>) enters it. The <strong>call stack</strong> is the chain of function calls that led to the current line.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A <code>breakpoint()</code> left in committed code freezes a production job waiting for keyboard input. Search for it before committing; setting the environment variable <code>PYTHONBREAKPOINT=0</code> turns every <code>breakpoint()</code> into a no-op as a safety net. VS Code and PyCharm give the same features with clickable breakpoints.</p></div>

  <h2 id="pt-log"><span class="num">08</span>Logging</h2>
  <p>A model-serving API misbehaves at 3 a.m. You can't attach a debugger to production. What you have is whatever the program wrote down while it ran. If it used <code>print</code>, you get a stream of messages with no time, no idea which module wrote them, no way to tell a disaster from chatter, and no way to turn the chatter off without editing code.</p>
  <p>The <code>logging</code> module is <code>print</code> done properly. Every message gets a <strong>level</strong> (how serious), a time, the module and line it came from. You decide, in one place, which levels to keep and where to send them: the console, a file, a log platform.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hospital's patient chart versus shouting in the corridor. The chart records time, who wrote the note, and how urgent it is; the night nurse reads only the urgent notes, the specialist reads everything. <code>print</code> is shouting: everyone hears everything, nothing is kept.</p></div>
  <div class="fx" data-lang="py">import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("etl")
print("loaded 1200 rows")
log.info("loaded %d rows", 1200)
log.debug("row 17 raw=%r", "  Asha ,92 ")        # below INFO: dropped
log.warning("dropped %d rows with null id", 3)</div>
  <div class="fx" data-lang="text">loaded 1200 rows
04:25:19 INFO etl: loaded 1200 rows
04:25:19 WARNING etl: dropped 3 rows with null id</div>
  <p><code>basicConfig</code> set the threshold to INFO and a format. The <code>print</code> line came out bare. The <code>info</code> line came out with time, level and the logger name "etl". The <code>debug</code> line did not appear at all, because DEBUG is below the INFO threshold: switch the threshold to DEBUG and it appears, without touching the code that logs.</p>
  <table class="tbl">
    <tr><th>Level</th><th>Meaning</th><th>Example</th></tr>
    <tr><td>DEBUG</td><td>Developer detail</td><td>batch 17 loss=0.4321</td></tr>
    <tr><td>INFO</td><td>Normal milestones</td><td>epoch 1 done, model loaded</td></tr>
    <tr><td>WARNING</td><td>Unexpected but handled</td><td>GPU memory at 93%</td></tr>
    <tr><td>ERROR</td><td>An operation failed</td><td>validation step failed</td></tr>
    <tr><td>CRITICAL</td><td>System may not continue</td><td>database unreachable</td></tr>
  </table>
  <h3>Loggers, handlers, formatters</h3>
  <p>For real apps you want different destinations with different rules: the console shows only warnings and errors, while a file keeps everything for later. Three pieces do this. A <strong>logger</strong> is what your code calls (<code>logger.info(...)</code>). A <strong>handler</strong> is a destination (console, file) with its own level filter. A <strong>formatter</strong> decides how a line looks.</p>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
    <defs><marker id="pt-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="60" width="175" height="50" rx="6" class="fb sb"/><text x="22" y="82">logger "trainer"</text><text x="22" y="100" class="tm">level DEBUG</text>
    <rect x="210" y="15" width="150" height="50" rx="6" class="ft st"/><text x="222" y="37">StreamHandler</text><text x="222" y="55" class="tm">level WARNING</text>
    <rect x="210" y="105" width="150" height="50" rx="6" class="ft st"/><text x="222" y="127">FileHandler</text><text x="222" y="145" class="tm">level DEBUG</text>
    <rect x="420" y="15" width="130" height="50" rx="6" class="fs"/><text x="432" y="37">console</text><text x="432" y="55" class="tm">short format</text>
    <rect x="420" y="105" width="130" height="50" rx="6" class="fs"/><text x="432" y="127">train.log</text><text x="432" y="145" class="tm">time + line no.</text>
    <line x1="185" y1="78" x2="206" y2="50" stroke="currentColor" stroke-width="1.5" marker-end="url(#pt-ah2)"/>
    <line x1="185" y1="92" x2="206" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#pt-ah2)"/>
    <line x1="360" y1="40" x2="416" y2="40" stroke="currentColor" stroke-width="1.5" marker-end="url(#pt-ah2)"/>
    <line x1="360" y1="130" x2="416" y2="130" stroke="currentColor" stroke-width="1.5" marker-end="url(#pt-ah2)"/>
  </svg><figcaption>Follow one message left to right. It must pass the logger's level, then each handler's own level. The top handler only lets WARNING and above reach the console; the bottom one sends everything to the file, each with its own format.</figcaption></figure>
  <div class="fx" data-lang="py">import logging, sys

logger = logging.getLogger("trainer")          # one named logger per module
logger.setLevel(logging.DEBUG)                 # logger lets everything through...

console = logging.StreamHandler(sys.stdout)    # ...each handler filters again
console.setLevel(logging.WARNING)
console.setFormatter(logging.Formatter("%(levelname)-8s %(name)s: %(message)s"))

file = logging.FileHandler("train.log")
file.setLevel(logging.DEBUG)
file.setFormatter(logging.Formatter(
    "%(asctime)s %(levelname)s %(name)s:%(lineno)d %(message)s", "%H:%M:%S"))

logger.addHandler(console)
logger.addHandler(file)

logger.debug("batch %d loss=%.4f", 17, 0.4321)   # lazy %-args, not f-strings
logger.info("epoch %d done", 1)
logger.warning("GPU memory at %d%%", 93)
try:
    1 / 0
except ZeroDivisionError:
    logger.exception("validation step failed")    # ERROR + traceback</div>
  <div class="fx" data-lang="text">WARNING  trainer: GPU memory at 93%
ERROR    trainer: validation step failed
Traceback (most recent call last):
  File ".../log_demo.py", line 22, in &lt;module&gt;
    1 / 0
    ~~^~~
ZeroDivisionError: division by zero
--- train.log
04:25:19 DEBUG trainer:18 batch 17 loss=0.4321
04:25:19 INFO trainer:19 epoch 1 done
04:25:19 WARNING trainer:20 GPU memory at 93%
04:25:19 ERROR trainer:24 validation step failed
Traceback (most recent call last):
  ...
ZeroDivisionError: division by zero</div>
  <p>Same four calls, two destinations. The console got only the WARNING and the ERROR; the file got all four, each with the time and line number. <code>logger.exception(...)</code>, used inside an <code>except</code> block, logs at ERROR level <em>and</em> attaches the full traceback. The <code>%d</code> / <code>%.4f</code> placeholders with arguments passed separately are deliberate: logging only builds the string if the message will actually be kept.</p>
  <h3>Structured (JSON) logging</h3>
  <p>In production, logs go to a search tool (ELK, Datadog, CloudWatch). Searching free text like "latency was 41ms" is painful. Writing each record as one JSON object with named fields lets you filter <code>latency_ms &gt; 200 AND model = "churn-v3"</code>. A custom formatter does it.</p>
  <div class="fx" data-lang="py">import json, logging, sys

class JsonFormatter(logging.Formatter):
    def format(self, record):
        doc = {"ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
               "level": record.levelname, "logger": record.name,
               "msg": record.getMessage()}
        doc.update(getattr(record, "ctx", {}))          # fields passed via extra=
        return json.dumps(doc)

h = logging.StreamHandler(sys.stdout)
h.setFormatter(JsonFormatter())
log = logging.getLogger("serve")
log.addHandler(h)
log.setLevel(logging.INFO)

log.info("prediction served", extra={"ctx": {"model": "churn-v3", "latency_ms": 41, "user_id": 812}})</div>
  <div class="fx" data-lang="text">{"ts": "2026-10-19T04:25:19", "level": "INFO", "logger": "serve", "msg": "prediction served", "model": "churn-v3", "latency_ms": 41, "user_id": 812}</div>
  <p><code>extra={"ctx": {...}}</code> attaches our fields to the log record as an attribute named <code>ctx</code>; the formatter merges them into the JSON. Libraries like structlog and python-json-logger do this for you.</p>
  <h3>Testing that you logged</h3>
  <p>A warning that should fire is behaviour worth testing. The built-in <code>caplog</code> fixture captures log output during a test.</p>
  <div class="fx" data-lang="py">import logging
log = logging.getLogger("etl")

def load_rows(rows):
    bad = [r for r in rows if r is None]
    if bad:
        log.warning("dropped %d null rows", len(bad))
    return [r for r in rows if r is not None]

def test_warns_on_nulls(caplog):
    assert load_rows([1, None, 3, None]) == [1, 3]
    assert "dropped 2 null rows" in caplog.text</div>
  <div class="fx" data-lang="text">1 passed in 0.01s</div>
  <table class="tbl">
    <tr><th></th><th>print()</th><th>logging</th></tr>
    <tr><td>Severity / filtering</td><td>No</td><td>Levels, per-handler thresholds</td></tr>
    <tr><td>Context</td><td>Only what you type</td><td>Time, module, line, process, thread</td></tr>
    <tr><td>Destinations</td><td>stdout</td><td>Console, file, rotating file, syslog, HTTP</td></tr>
    <tr><td>Turn down in prod</td><td>Edit code</td><td>Change one config line</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Logger</strong>: named source of messages (<code>getLogger(__name__)</code>, one per module). <strong>Handler</strong>: destination with its own level. <strong>Formatter</strong>: layout of a line. <strong>Level</strong>: severity; records below the threshold are dropped. <strong>Structured logging</strong>: records as key-value data (usually JSON).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>logger.error(str(e))</code> loses the stack trace; use <code>logger.exception(...)</code> inside <code>except</code>. Libraries should only call <code>getLogger(__name__)</code>; configure handlers once in the application's entry point, or every message is printed twice.</p></div>

  <h2 id="pt-build"><span class="num">09</span>Build It</h2>
  <p>Take <code>features.py</code> above to production quality. Each step uses one section of this note.</p>
  <ol>
    <li>Add a fixture in <code>conftest.py</code> with edge-case frames: a negative qty, a NaN revenue, an empty frame (section 02).</li>
    <li>Parametrize one test over those cases; for negative qty assert <code>pytest.raises(ValueError)</code>; for the empty frame decide what <em>should</em> happen and write that down as a test first (sections 01–02).</li>
    <li>Add <code>fetch_prices()</code> that calls an API via <code>from httpx import get</code>; test it with <code>patch("features.get")</code> and a <code>side_effect</code> list to simulate a timeout and then success (section 04).</li>
    <li>Add a round-trip test to SQLite marked <code>integration</code>, and run the fast set with <code>-m "not integration"</code> (section 03).</li>
    <li>Add <code>log.warning</code> for dropped rows and assert it with <code>caplog</code> (section 08).</li>
    <li>Run the transform on 1M rows under cProfile, fix the top hotspot, confirm with timeit, and check the tests still pass (section 06).</li>
  </ol>

  <h2 id="pt-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: patching the wrong name</span>
    <p><code>from requests import get</code> in <code>mymod</code> + <code>patch("requests.get")</code> → the real network call still happens. Patch <code>"mymod.get"</code>, where the code looks it up.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: exact floats and exact metrics</span>
    <p><code>assert total == 0.3</code> or <code>assert acc == 0.9466</code>. Use <code>pytest.approx</code> for floats and thresholds for metrics.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: tests that depend on each other</span>
    <p>A shared (module/session) fixture that one test mutates, or a test that relies on a file another test wrote. Results change with run order. Use function-scoped fixtures and <code>tmp_path</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unseeded randomness</span>
    <p>A test that passes 95% of the time is worse than no test: people learn to ignore it. Seed every generator (<code>np.random.default_rng(42)</code>, <code>random_state=0</code>, <code>torch.manual_seed</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: optimising before profiling</span>
    <p>Rewriting the code you suspect is slow. Profile first; the hotspot is usually one line you didn't suspect (here: <code>in</code> on a list).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: print debugging and print logging</span>
    <p>Rounds of prints instead of one <code>breakpoint()</code>; <code>print</code> instead of <code>logging</code> in services; <code>logger.error(str(e))</code> instead of <code>logger.exception</code>; a forgotten <code>breakpoint()</code> in committed code.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a test you never saw fail</span>
    <p>A wrong assert can pass forever. Break the code once on purpose and confirm the test goes red.</p>
  </div>

  <h2 id="pt-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why pytest over unittest?</summary><div class="qa-body">Plain functions instead of classes, plain <code>assert</code> with readable failure diffs instead of <code>assertEqual</code>, composable fixtures instead of setUp/tearDown, parametrize, markers and a big plugin ecosystem (cov, xdist, mock). pytest also runs existing unittest tests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a fixture, and what does scope change?</summary><div class="qa-body">A function that provides test inputs, injected by parameter name; code after <code>yield</code> is teardown. Scope sets how often it's rebuilt: function (each test, default), class, module, session. Wide scope for expensive read-only things (a loaded model), function scope for anything a test may change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your module does <code>from requests import get</code>. You <code>patch("requests.get")</code> and the test still hits the network. Why?</summary><div class="qa-body">The import copied a reference to the function into your module's namespace. patch replaced <code>requests.get</code>, but your code calls <code>yourmodule.get</code>, which still points at the real function. Patch where the name is looked up: <code>patch("yourmodule.get")</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>return_value</code> vs <code>side_effect</code>?</summary><div class="qa-body"><code>return_value</code>: the same value every call. <code>side_effect</code>: an exception to raise, an iterable of results returned one per call (can mix exceptions, good for retry tests), or a function computing the result from the arguments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Unit vs integration test: give a data-science example of each.</summary><div class="qa-body">Unit: <code>add_features</code> on a 3-row DataFrame, no I/O, milliseconds. Integration: write features to a real SQLite DB in <code>tmp_path</code> and read them back, catching schema/dtype issues across the boundary. Keep many unit tests, mark the slow ones so CI can skip them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test ML code whose output is random?</summary><div class="qa-body">Seed everything (<code>default_rng(42)</code>, <code>random_state</code>, <code>torch.manual_seed</code>). Test contracts (shapes, probability ranges, no mutation) and behaviour on planted signal with thresholds (acc &gt; 0.9), not exact metrics. Compare floats with <code>pytest.approx</code>. For deep learning, also "overfit a tiny batch": loss should go near zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>assert 0.1 + 0.2 == 0.3</code></summary><div class="qa-body"><code>AssertionError</code>: 0.1 + 0.2 is 0.30000000000000004 in binary floating point. Use <code>assert 0.1 + 0.2 == pytest.approx(0.3)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A pipeline is slow. What do you do first?</summary><div class="qa-body">Profile, don't guess. cProfile sorted by cumulative time finds the hot function, line_profiler the hot line. Fix only that (often an O(n²) loop, <code>in</code> on a list, or row-wise pandas <code>apply</code>), check the answer is unchanged, confirm with timeit and re-profile.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>tottime vs cumtime in cProfile?</summary><div class="qa-body">tottime = time in the function's own code, excluding calls it makes. cumtime = including everything it calls. High cumtime + low tottime → the cost is in its children (<code>run</code>); high tottime → the function itself is the hotspot (<code>dedupe</code>: 1.363 of 1.366 s).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name five pdb commands and when you'd use post-mortem debugging.</summary><div class="qa-body"><code>n</code> next, <code>s</code> step into, <code>c</code> continue, <code>p x</code> print, <code>w</code> stack (plus <code>u</code>/<code>d</code>, <code>ll</code>, <code>q</code>). Post-mortem (<code>python -m pdb</code>, <code>pytest --pdb</code>, <code>%debug</code>) when the crash already happened: you land in the failing frame with all variables intact.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why logging instead of print in production? What does <code>logger.exception</code> add?</summary><div class="qa-body">Logging gives levels you can filter without code changes, timestamps, module/line, and routing to files or log platforms. <code>logger.exception("msg")</code> logs at ERROR and attaches the full traceback; <code>logger.error(str(e))</code> loses it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why <code>log.debug("loss=%.4f", x)</code> rather than <code>log.debug(f"loss={x:.4f}")</code>?</summary><div class="qa-body">With %-style arguments the string is only built if the record passes the level check; the f-string is formatted every time, even when DEBUG is off. It also keeps the message template constant, which helps log tools group identical messages.</div></details>
</main>`
});
