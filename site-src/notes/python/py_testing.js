// notes/python/py_testing.js — Software Testing Fundamentals
Object.assign(TOPIC_CONTENT, {
  "py_testing": `<main>
<h1>Software Testing Fundamentals</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>Software Testing Fundamentals</span></div>
  <p class="lead">An automated test is a small program that runs your code on an input whose correct answer you already know and fails loudly if the answer changes. Without tests, every edit is a gamble: a one-character change (<code>&gt;=</code> to <code>&gt;</code>) can silently break behaviour that worked for months, and nobody notices until a user or a dashboard does. Tests are what make refactoring, dependency upgrades and "quick fixes" safe, and in DS/ML work they are what stop a broken feature transform or a leaky train/test split from reaching a model in production. The ideas here apply to any framework: kinds of tests, the test pyramid, what makes a unit test good, which cases to pick, how to test data and ML code, TDD, and what coverage really measures. The tooling is in <a class="xref" data-note="py_pytest">Testing with pytest</a>, isolating external services in <a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a>, and finding the cause of a failure in <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>. Code was run on Python 3.13 with pytest 9.2.</p>

  <h2 id="pt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Software Testing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why test</div>
        <ul>
          <li><b>Regression</b>: behaviour that used to work breaks after a change</li>
          <li>Tests make <b>refactoring</b> safe: same tests, new code</li>
          <li>Tests document intended behaviour as runnable examples</li>
          <li>Cheapest when the code is small and fresh</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Kinds of tests</div>
        <ul>
          <li><b>Unit</b>: one function/class, no I/O, ms</li>
          <li><b>Integration</b>: your code + real file/DB/service</li>
          <li><b>End-to-end</b>: the whole system as a user sees it</li>
          <li><b>Regression</b>: pins a fixed bug; <b>smoke</b>: "does it start?"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Test pyramid</div>
        <ul>
          <li>Many unit, fewer integration, fewest E2E</li>
          <li>Lower = faster, cheaper, more precise failures</li>
          <li>Anti-pattern: ice-cream cone (mostly E2E/manual)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Good unit test (FIRST)</div>
        <ul>
          <li><b>F</b>ast · <b>I</b>solated · <b>R</b>epeatable</li>
          <li><b>S</b>elf-checking (assert, no eyeballing) · <b>T</b>imely</li>
          <li>Arrange · Act · Assert; one behaviour per test</li>
          <li>Inject time, randomness and I/O so tests control them</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">What to test</div>
        <ul>
          <li>Happy path · edge cases · error paths</li>
          <li><b>Boundary value analysis</b>: both sides of every edge</li>
          <li><b>Equivalence partitioning</b>: one value per class</li>
          <li>Expected values worked out by hand, never by the code</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ML / data code</div>
        <ul>
          <li>Validate input batches (schema, nulls, ranges)</li>
          <li>Transforms: exact properties with float tolerance</li>
          <li>Fixed seeds; models: planted signal + threshold</li>
          <li><code>pytest.approx</code>, <code>np.testing.assert_allclose</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">TDD &amp; coverage</div>
        <ul>
          <li>Red → green → refactor</li>
          <li>Coverage = which lines/branches ran, not whether they were checked</li>
          <li>Branch coverage &gt; line coverage</li>
          <li>⚠ 100% coverage ≠ correct</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pt-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Automated Tests</span><span class="rm-sub">Regressions, refactoring, living documentation</span></div></div>
      <div class="rm-item rm-done" data-target="pt-kinds"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Kinds of Tests</span><span class="rm-sub">Unit, integration, E2E, regression, smoke</span></div></div>
      <div class="rm-item rm-done" data-target="pt-pyramid"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Test Pyramid</span><span class="rm-sub">How many of each kind</span></div></div>
      <div class="rm-item rm-done" data-target="pt-first"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Properties of a Good Unit Test</span><span class="rm-sub">FIRST, AAA, controlling time</span></div></div>
      <div class="rm-item rm-done" data-target="pt-what"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">What to Test</span><span class="rm-sub">Happy path, edges, errors, boundaries</span></div></div>
      <div class="rm-item rm-done" data-target="pt-ml"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Testing ML and Data Code</span><span class="rm-sub">Validation, seeds, tolerances, models</span></div></div>
      <div class="rm-item rm-done" data-target="pt-tdd"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Test-Driven Development</span><span class="rm-sub">Red, green, refactor</span></div></div>
      <div class="rm-item rm-done" data-target="pt-cov"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Code Coverage</span><span class="rm-sub">Line vs branch, what it misses</span></div></div>
      <div class="rm-item rm-done" data-target="pt-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Tests that protect nothing</span></div></div>
      <div class="rm-item rm-done" data-target="pt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Definitions, rules, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pt-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Fundamentals to design questions</span></div></div>
    </div>
  </div>

  <h2 id="pt-why"><span class="num">01</span>Why Automated Tests</h2>
  <p>Running code once and looking at the output checks only the inputs you happened to try, only once. An automated test writes the check down as code, with the expected answer worked out by hand, so a machine can repeat it after every change in milliseconds.</p>
  <div class="fx" data-lang="py"># pricing.py
def discount(subtotal):
    """Whole-rupee discount: 10% off orders of 150 or more."""
    return subtotal // 10 if subtotal &gt;= 150 else 0</div>
  <div class="fx" data-lang="py"># test_pricing.py
from pricing import discount

def test_no_discount_below_threshold():
    assert discount(149) == 0

def test_discount_at_threshold():
    assert discount(150) == 15          # the boundary itself

def test_discount_above_threshold():
    assert discount(200) == 20</div>
  <div class="fx" data-lang="text">$ pytest -q test_pricing.py
...                                                                      [100%]
3 passed in 0.01s</div>
  <p>Now someone "tidies" the condition to <code>subtotal &gt; 150</code>. Typical orders (149, 200) still behave the same, so a manual check would pass. The boundary test does not:</p>
  <div class="fx" data-lang="text">$ pytest -q test_pricing.py
.F.                                                                      [100%]
=================================== FAILURES ===================================
__________________________ test_discount_at_threshold __________________________

    def test_discount_at_threshold():
&gt;       assert discount(150) == 15          # the boundary itself
        ^^^^^^^^^^^^^^^^^^^^^^^^^^
E       assert 0 == 15
E        +  where 0 = discount(150)

test_pricing.py:7: AssertionError
=========================== short test summary info ============================
FAILED test_pricing.py::test_discount_at_threshold - assert 0 == 15
1 failed, 2 passed in 0.02s</div>
  <p>That is the core value of tests. Concretely they give you:</p>
  <ul>
    <li><b>Regression protection.</b> Behaviour that worked stays working; a break shows up seconds after the change, next to the change, instead of weeks later in production.</li>
    <li><b>Safe refactoring.</b> You can restructure code (rename, split functions, swap a list for a set, vectorise a loop) and know it still does the same thing, because the same tests still pass.</li>
    <li><b>Executable documentation.</b> <code>test_discount_at_threshold</code> states the rule "150 counts" more precisely than a comment, and it cannot go out of date without failing.</li>
    <li><b>Better design.</b> Code that is hard to test (hidden globals, I/O mixed into logic, reading the clock internally) is usually hard to change too; writing tests pushes you toward small pure functions.</li>
    <li><b>Confidence to deploy.</b> CI runs the suite on every push, so "does main still work?" has an automatic answer.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>test</strong> runs code on an input with a known correct output and checks the actual output against it. A <strong>regression</strong> is a bug in behaviour that previously worked. A <strong>test suite</strong> is the collection of tests for a project, normally run together by a <strong>test runner</strong> (pytest, unittest).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"I ran it and it looked fine" is not a test: it only covered the cases you tried, it is not repeated, and bugs cluster at the edges (exactly 150, zero, empty, negative) that manual checks rarely include.</p></div>

  <h2 id="pt-kinds"><span class="num">02</span>Kinds of Tests: Unit, Integration, End-to-End, Regression, Smoke</h2>
  <p>Tests are classified by how much of the system they exercise. The bigger the scope, the more realistic the test, and the slower, flakier and less precise its failures become.</p>
  <table class="tbl">
    <tr><th>Kind</th><th>Exercises</th><th>Typical speed</th><th>Catches</th><th>Example</th></tr>
    <tr><td><b>Unit</b></td><td>One function or class, in isolation, no real I/O</td><td>µs–ms</td><td>Logic bugs: wrong formula, wrong branch</td><td><code>normalise_email(" A@B.com ") == "a@b.com"</code></td></tr>
    <tr><td><b>Integration</b></td><td>Your code together with a real collaborator: file system, database, another module, a queue</td><td>10 ms – seconds</td><td>Wiring bugs: formats, types, SQL, paths, serialisation</td><td>Save users to JSON, load them back</td></tr>
    <tr><td><b>End-to-end (E2E)</b></td><td>The whole deployed system through its real interface (HTTP API, UI, CLI)</td><td>seconds – minutes</td><td>"Does the feature work for a user?"</td><td>POST an order, check the receipt and the DB row</td></tr>
    <tr><td><b>Regression</b></td><td>Any level; pins a specific bug that was fixed</td><td>(any)</td><td>The same bug coming back</td><td><code>test_empty_cart_total_is_zero_issue_142</code></td></tr>
    <tr><td><b>Smoke</b></td><td>A few broad, shallow checks that the build starts at all</td><td>seconds</td><td>Broken deploys, missing config, import errors</td><td>App starts; <code>/health</code> returns 200; model file loads</td></tr>
  </table>
  <p>The difference between unit and integration is easiest to see side by side. The module mixes pure logic with file I/O:</p>
  <div class="fx" data-lang="py"># users.py
import json

def normalise_email(email):
    """Pure logic: no files, no network."""
    return email.strip().lower()

def save_user(path, name, email):
    """Touches the file system: read, append, write back."""
    users = json.loads(path.read_text()) if path.exists() else []
    users.append({"name": name, "email": normalise_email(email)})
    path.write_text(json.dumps(users))

def load_users(path):
    return json.loads(path.read_text())</div>
  <div class="fx" data-lang="py"># test_users.py
from users import normalise_email, save_user, load_users

# UNIT test: one function, pure input -&gt; output, microseconds
def test_normalise_email():
    assert normalise_email("  Asha@Example.COM ") == "asha@example.com"

# INTEGRATION test: our code + a real file system (tmp_path = fresh temp folder)
def test_save_then_load_round_trip(tmp_path):
    db = tmp_path / "users.json"
    save_user(db, "Asha", " Asha@Example.com")
    save_user(db, "Ben", "ben@example.com")
    assert load_users(db) == [
        {"name": "Asha", "email": "asha@example.com"},
        {"name": "Ben", "email": "ben@example.com"},
    ]</div>
  <div class="fx" data-lang="text">$ pytest -v test_users.py
...
collecting ... collected 2 items

test_users.py::test_normalise_email PASSED                               [ 50%]
test_users.py::test_save_then_load_round_trip PASSED                     [100%]

============================== 2 passed in 0.02s ===============================</div>
  <p>The unit test pins the normalisation rule and would point straight at <code>normalise_email</code> if it broke. The integration test proves the pieces fit: JSON is written and read back, appending keeps earlier users, and normalisation is applied on the way in. It would catch a bug the unit test cannot, such as overwriting the file instead of appending. An E2E test would go further, through the real API that calls <code>save_user</code>.</p>
  <p>A <strong>regression test</strong> is how a bug fix ends: reproduce the reported bug as a failing test, fix the code, keep the test forever (the workflow is traced in <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>). A <strong>smoke test</strong> is a quick go/no-go check, usually run right after a deploy, before the slower suites.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>System under test (SUT)</strong>: the code a test is checking. <strong>Unit test</strong>: tests one unit in isolation from slow or external dependencies (replaced by test doubles if needed, see <a class="xref" data-note="py_mocking">Mocks</a>). <strong>Integration test</strong>: tests the interaction between units, or between your code and real infrastructure. <strong>E2E test</strong>: tests a complete user flow through the deployed system.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Integration tests that use shared real resources (the team database, a production API, a real payment gateway) are slow, flaky and can damage data. Use throwaway resources: <code>tmp_path</code>, an in-memory SQLite database, a Docker container started for the test run, or a provider's sandbox account.</p></div>

  <h2 id="pt-pyramid"><span class="num">03</span>The Test Pyramid</h2>
  <p>The pyramid is a rule of thumb for how many tests of each kind to keep: lots of fast unit tests at the base, fewer integration tests, and only a handful of E2E tests at the top. The reason is cost per test and precision of failure.</p>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
    <polygon points="230,15 290,60 170,60" class="fr"/><text x="207" y="52">E2E</text>
    <polygon points="170,64 290,64 350,108 110,108" class="fv"/><text x="190" y="92">Integration</text>
    <polygon points="110,112 350,112 410,156 50,156" class="fg"/><text x="210" y="140">Unit</text>
    <text x="300" y="40" class="tm">few · slow · realistic</text>
    <text x="360" y="92" class="tm">real files, DB, services</text>
    <text x="418" y="140" class="tm">many · ms each</text>
  </svg><figcaption>Width = how many tests of that kind you keep. Moving up: more realistic, slower, flakier, and a failure says less about where the bug is.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Unit</th><th>Integration</th><th>End-to-end</th></tr>
    <tr><td>Share of suite (typical)</td><td>~70–80%</td><td>~15–25%</td><td>~5%</td></tr>
    <tr><td>Speed</td><td>ms</td><td>10 ms – s</td><td>s – min</td></tr>
    <tr><td>Flakiness</td><td>None if written well</td><td>Some (timing, ports, containers)</td><td>Highest (network, UI timing, data)</td></tr>
    <tr><td>When it fails, you know…</td><td>The exact function and input</td><td>Which boundary broke</td><td>"Something in the flow"</td></tr>
    <tr><td>Run</td><td>On every save / commit</td><td>On every push (CI)</td><td>Before release / nightly</td></tr>
  </table>
  <p>The inverted shape, the <strong>ice-cream cone</strong> (mostly manual or E2E tests, few unit tests), gives a suite that takes an hour, fails randomly, and when red needs a person to work out what broke. People stop running it. The opposite failure is only unit tests with heavy mocking, where every unit passes but they do not fit together; the integration layer exists for that.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Building a bicycle: thousands of bench checks on individual parts (the brake squeezes, the chain links hold), a few checks of parts fitted together (brake on the wheel), and one ride around the block before it ships.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Treating the percentages as targets. The pyramid is about cost: push each check down to the cheapest level that can catch the bug. A rule in one function belongs in a unit test; "the CSV the job writes can be read by the next job" needs an integration test.</p></div>

  <h2 id="pt-first"><span class="num">04</span>Properties of a Good Unit Test (FIRST)</h2>
  <p>A test is only useful if people run it constantly and believe it when it fails. The FIRST mnemonic lists what that requires.</p>
  <table class="tbl">
    <tr><th>Letter</th><th>Property</th><th>Means</th><th>Breaks it</th></tr>
    <tr><td><b>F</b></td><td>Fast</td><td>Milliseconds, so the whole suite runs on every change</td><td>Network calls, <code>sleep</code>, training a real model</td></tr>
    <tr><td><b>I</b></td><td>Isolated / independent</td><td>No dependence on other tests or their order; fresh state each time</td><td>Shared mutable globals, a test that needs another to run first</td></tr>
    <tr><td><b>R</b></td><td>Repeatable</td><td>Same result every run, on any machine, at any time</td><td><code>datetime.now()</code>, unseeded randomness, real APIs, local file paths</td></tr>
    <tr><td><b>S</b></td><td>Self-checking (self-validating)</td><td>Passes or fails by itself via <code>assert</code>; nobody reads output</td><td>Tests that only <code>print</code>, or call code without asserting</td></tr>
    <tr><td><b>T</b></td><td>Timely</td><td>Written with (or before) the code, not months later</td><td>"We'll add tests after the release"</td></tr>
  </table>
  <p>Repeatability is the property most often broken by accident. The usual fix is to make the uncontrollable input a parameter, so the test can pass a fixed value:</p>
  <div class="fx" data-lang="py"># greet.py
from datetime import datetime

def greeting(now=None):
    """'now' is a parameter, so a test can pass a fixed time."""
    now = now or datetime.now()
    return "Good morning" if now.hour &lt; 12 else "Good afternoon"</div>
  <div class="fx" data-lang="py"># test_greet.py
from datetime import datetime
from greet import greeting

# NOT repeatable: passes before noon, fails after
def test_greeting_bad():
    assert greeting() == "Good morning"

# Repeatable and self-checking: fixed inputs, exact expected values
def test_greeting_morning():
    assert greeting(datetime(2026, 1, 1, 11, 59)) == "Good morning"

def test_greeting_afternoon():
    assert greeting(datetime(2026, 1, 1, 12, 0)) == "Good afternoon"</div>
  <div class="fx" data-lang="text">$ date; pytest -q test_greet.py
Tue Nov  3 05:03:40 UTC 2026
...                                                                      [100%]
3 passed in 0.01s</div>
  <p>All three passed because the run happened at 05:03. The same suite run after noon fails <code>test_greeting_bad</code> with no code change: a <strong>flaky</strong> test. The two good tests also pin the boundary (11:59 vs 12:00) and pass at any hour. The same pattern applies to randomness (pass a seed or an <code>rng</code>), I/O (pass a path or a client object) and external services (pass a gateway; this is dependency injection, covered with test doubles in <a class="xref" data-note="py_mocking">Mocks</a>).</p>
  <h3>Arrange–Act–Assert</h3>
  <p>Lay each test out in three parts: <b>Arrange</b> the inputs, <b>Act</b> by calling the code once, <b>Assert</b> on the result. One test checks one behaviour, and its name says which (<code>test_discount_at_threshold</code>, not <code>test_discount_2</code>). Several asserts on the same result are fine; checking three unrelated rules in one test means the first failure hides the other two.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>flaky test</strong> passes and fails on the same code depending on time, order, timing or environment. A <strong>deterministic</strong> test always gives the same result for the same code.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Re-running flaky tests until they go green. A test that is red one run in ten teaches the team to ignore red. Find the hidden input (clock, randomness, order, network, shared state) and control it.</p></div>

  <h2 id="pt-what"><span class="num">05</span>What to Test: Happy Path, Edge Cases, Error Paths, Boundaries</h2>
  <p>You cannot test every input, so choose inputs that are most likely to reveal bugs. Two classic techniques do this systematically. <strong>Equivalence partitioning</strong> splits the input space into classes the code should treat the same way and takes one value from each. <strong>Boundary value analysis</strong> then tests each edge between classes from both sides, because off-by-one errors (<code>&gt;</code> vs <code>&gt;=</code>, <code>&lt;</code> vs <code>&lt;=</code>, <code>range(n)</code> vs <code>range(n + 1)</code>) live there.</p>
  <table class="tbl">
    <tr><th>Category</th><th>What it covers</th><th>Typical cases</th></tr>
    <tr><td><b>Happy path</b></td><td>Normal, valid use</td><td>One representative per equivalence class</td></tr>
    <tr><td><b>Boundaries</b></td><td>Where behaviour changes</td><td>min, min+1, max−1, max; each threshold and its neighbours</td></tr>
    <tr><td><b>Edge cases</b></td><td>Unusual but valid input</td><td>Empty list/string/DataFrame, single element, zero, duplicates, unicode, very large values, NaN</td></tr>
    <tr><td><b>Error paths</b></td><td>Invalid input and failures</td><td>Wrong type, out of range, missing key/file, dependency raising; assert the <em>specific</em> exception</td></tr>
  </table>
  <p>Applied to a grading function with classes A (90–100), B (75–89), C (50–74), F (0–49):</p>
  <div class="fx" data-lang="py"># grades.py
def grade(score):
    """A: 90-100, B: 75-89, C: 50-74, F: 0-49."""
    if not isinstance(score, (int, float)):
        raise TypeError(f"score must be a number, got {type(score).__name__}")
    if not 0 &lt;= score &lt;= 100:
        raise ValueError(f"score must be in 0..100, got {score}")
    if score &gt;= 90:
        return "A"
    if score &gt;= 75:
        return "B"
    if score &gt;= 50:
        return "C"
    return "F"</div>
  <div class="fx" data-lang="py"># test_grades.py
import pytest
from grades import grade

# happy path: one typical value per class (equivalence partitions)
@pytest.mark.parametrize("score, expected", [(95, "A"), (80, "B"), (60, "C"), (20, "F")])
def test_typical(score, expected):
    assert grade(score) == expected

# boundaries: both sides of every edge, plus the ends of the range
@pytest.mark.parametrize("score, expected", [
    (0, "F"), (49, "F"), (50, "C"), (74, "C"),
    (75, "B"), (89, "B"), (90, "A"), (100, "A"),
])
def test_boundaries(score, expected):
    assert grade(score) == expected

# error paths: invalid input must be refused, with the right exception
@pytest.mark.parametrize("bad", [-1, 101])
def test_out_of_range(bad):
    with pytest.raises(ValueError, match="0..100"):
        grade(bad)

def test_wrong_type():
    with pytest.raises(TypeError):
        grade("90")</div>
  <div class="fx" data-lang="text">$ pytest -q test_grades.py
...............                                                          [100%]
15 passed in 0.02s</div>
  <p>Introduce an off-by-one (<code>score &gt; 75</code>) and only one test notices, a boundary test; every happy-path test still passes because 80 is nowhere near the edge:</p>
  <div class="fx" data-lang="text">$ pytest -q --tb=no -rf test_grades.py
........F......                                                          [100%]
=========================== short test summary info ============================
FAILED test_grades.py::test_boundaries[75-B] - AssertionError: assert 'C' == 'B'
1 failed, 14 passed in 0.01s</div>
  <p>(<code>parametrize</code> turns each row into its own test; see <a class="xref" data-note="py_pytest">Testing with pytest</a>.) Two more rules for choosing what to test: test <b>behaviour through the public interface</b>, not private helpers or the order of internal calls, so refactors don't break tests; and work out <b>expected values by hand</b> from the specification, never by calling the code under test (<code>assert grade(x) == grade(x)</code> can never fail).</p>
  <div class="callout trap"><span class="label">Trap</span><p>Broad error assertions. <code>pytest.raises(Exception)</code> also passes on a <code>TypeError</code> caused by a typo in the test. Assert the exact exception type, and use <code>match=</code> to check the message.</p></div>

  <h2 id="pt-ml"><span class="num">06</span>Testing ML and Data Code</h2>
  <p>Data and ML code fails in quieter ways than application code: a pipeline that silently drops rows, a scaler that turns a constant column into NaN, a split that leaks test rows into training, or a model that trains fine on shuffled labels. Nothing crashes; the metric is just wrong. Four habits make this code testable.</p>
  <ol>
    <li><b>Validate data at the boundary.</b> Check every incoming batch for schema (required columns, dtypes), nulls, value ranges and label sets, and fail or alert before training or scoring. Libraries such as pandera, Great Expectations or pydantic do this declaratively; a plain function works too.</li>
    <li><b>Test transforms as pure functions with exact properties.</b> Feature engineering, cleaning and scaling are deterministic: test output shape, invariants (mean 0, std 1, no NaN, row count unchanged, input not mutated) and the edge cases (empty, constant, single row, all-NaN column).</li>
    <li><b>Control randomness.</b> Pass a seed (or an <code>rng</code>) into anything random: splits, sampling, initialisation. With a fixed seed a test sees the same data every run.</li>
    <li><b>Test models by behaviour, with tolerances.</b> Do not assert an exact score. Plant a known signal in synthetic data and assert the model recovers it within a tolerance or beats a threshold; check output contracts (probabilities in [0, 1] summing to 1, output shape); and for neural nets, check the model can overfit a tiny batch (loss drops to near zero), which catches wiring bugs cheaply.</li>
  </ol>
  <div class="fx" data-lang="py"># features.py
import numpy as np
import pandas as pd

def validate(df):
    """Return a list of problems with an input batch (empty list = OK)."""
    problems = []
    missing = {"age", "income", "label"} - set(df.columns)
    if missing:
        return [f"missing columns: {sorted(missing)}"]
    if df["age"].isna().any():
        problems.append("age has nulls")
    if not df["age"].dropna().between(0, 120).all():
        problems.append("age out of range 0..120")
    if not set(df["label"].unique()) &lt;= {0, 1}:
        problems.append("label is not binary")
    return problems

def standardise(x):
    """Scale to mean 0, std 1. A constant column becomes all zeros (not NaN)."""
    x = np.asarray(x, dtype=float)
    std = x.std()
    return np.zeros_like(x) if std == 0 else (x - x.mean()) / std

def split_indices(n, test_frac, seed):
    rng = np.random.default_rng(seed)
    idx = rng.permutation(n)
    k = int(n * test_frac)
    return idx[k:], idx[:k]

def fit_line(x, y):
    """Least-squares slope and intercept."""
    A = np.column_stack([x, np.ones_like(x)])
    (slope, intercept), *_ = np.linalg.lstsq(A, y, rcond=None)
    return slope, intercept</div>
  <div class="fx" data-lang="py"># test_features.py
import numpy as np
import pandas as pd
import pytest
from features import validate, standardise, split_indices, fit_line

# 1. data validation: bad batches are reported, good ones pass
def test_validate_flags_bad_batch():
    bad = pd.DataFrame({"age": [25, -3, None], "income": [1, 2, 3], "label": [0, 1, 2]})
    assert validate(bad) == ["age has nulls", "age out of range 0..120", "label is not binary"]

def test_validate_accepts_good_batch():
    good = pd.DataFrame({"age": [25, 40], "income": [10, 20], "label": [0, 1]})
    assert validate(good) == []

# 2. transforms: exact properties, compared with a float tolerance
def test_standardise_mean_0_std_1():
    z = standardise([2.0, 4.0, 6.0, 8.0])
    assert z.mean() == pytest.approx(0.0, abs=1e-12)
    assert z.std() == pytest.approx(1.0)

def test_standardise_constant_column_is_not_nan():
    assert np.array_equal(standardise([5, 5, 5]), [0.0, 0.0, 0.0])

# 3. randomness: a fixed seed makes the split reproducible
def test_split_reproducible_and_disjoint():
    tr1, te1 = split_indices(100, 0.2, seed=0)
    tr2, te2 = split_indices(100, 0.2, seed=0)
    assert np.array_equal(tr1, tr2) and np.array_equal(te1, te2)
    assert len(tr1) == 80 and len(te1) == 20
    assert set(tr1).isdisjoint(te1)

# 4. models: plant a known rule, assert it is recovered within a tolerance
def test_fit_line_recovers_planted_slope():
    rng = np.random.default_rng(42)
    x = rng.uniform(0, 10, size=200)
    y = 3.0 * x + 2.0 + rng.normal(0, 0.5, size=200)   # true slope 3, intercept 2
    slope, intercept = fit_line(x, y)
    assert slope == pytest.approx(3.0, abs=0.1)
    assert intercept == pytest.approx(2.0, abs=0.3)</div>
  <div class="fx" data-lang="text">$ pytest -q test_features.py
......                                                                   [100%]
6 passed in 0.23s</div>
  <p>The fitted values were slope 3.033 and intercept 1.845: close to the planted 3 and 2, but not equal, because of the noise. An exact assertion would fail; the tolerance accepts noise while still failing if the fit were broken (shuffled <code>y</code>, wrong column order). The split test checks the property that matters most in ML, that train and test indices are disjoint, i.e. no leakage.</p>
  <h3>Floats need tolerances</h3>
  <div class="fx" data-lang="py">import pytest
print(0.1 + 0.2 == 0.3, 0.1 + 0.2, 0.1 + 0.2 == pytest.approx(0.3))</div>
  <div class="fx" data-lang="text">False 0.30000000000000004 True</div>
  <p>Binary floats cannot represent most decimals exactly (<a class="xref" data-note="py_values">Values</a>), so computed floats are compared with a tolerance: <code>pytest.approx</code> (default relative tolerance 1e-6), <code>math.isclose</code>, <code>np.testing.assert_allclose(actual, expected, rtol=…, atol=…)</code> for arrays, and <code>pd.testing.assert_frame_equal</code> for DataFrames (it also checks dtypes, index and column order).</p>
  <table class="tbl"><caption>Testing transforms vs testing models</caption>
    <tr><th></th><th>Transforms / pipelines</th><th>Models</th></tr>
    <tr><td>Nature</td><td>Deterministic functions</td><td>Statistical, trained on random data</td></tr>
    <tr><td>Assert</td><td>Exact values, shapes, invariants (± float tolerance)</td><td>Thresholds, recovered planted signal, output contracts</td></tr>
    <tr><td>Speed</td><td>Unit tests, ms</td><td>Small synthetic data in unit tests; full evaluation in a separate pipeline</td></tr>
    <tr><td>Examples</td><td>No NaN after imputation; row count kept; input not mutated; train/test disjoint</td><td>Accuracy &gt; 0.9 on planted rule; probabilities sum to 1; overfits 10 samples; prediction invariant to irrelevant feature</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Asserting an exact metric (<code>assert acc == 0.9632</code>). A library upgrade or a different BLAS changes the last digits and breaks the build for no real reason. Assert a threshold that a real bug (labels shuffled, leakage removed, wrong feature) would clearly violate.</p></div>

  <h2 id="pt-tdd"><span class="num">07</span>Test-Driven Development (TDD)</h2>
  <p>TDD writes the test before the code, in a tight loop: <b>red</b> (write one small test for the next behaviour; run it; watch it fail for the expected reason), <b>green</b> (write the simplest code that makes it pass), <b>refactor</b> (clean up code and tests while everything stays green). Then the next behaviour.</p>
  <div class="flow"><span>red: failing test</span><span>green: simplest pass</span><span>refactor: tidy, stay green</span><span>next behaviour</span></div>
  <ul>
    <li><b>Why the red step matters.</b> Watching the test fail proves it can fail, i.e. it actually checks something. A test that was never red may be misnamed (never collected), assert nothing, or compare the code with itself.</li>
    <li><b>Benefits.</b> Every behaviour has a test by construction; the design is driven by how the code is called, which tends to give small, decoupled functions; the refactor step is safe.</li>
    <li><b>Costs and limits.</b> Slower at first; awkward for exploratory work (notebooks, research spikes, UI layout) where you don't yet know the desired behaviour. A common pragmatic rule: explore freely, then write tests before the code is shared or depended on, and always write the failing test first when fixing a bug.</li>
  </ul>
  <p>A full TDD trace (three red/green loops for a bill-splitting function, then a refactor with property tests) is in <a class="xref" data-note="py_pytest">Testing with pytest</a>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Writing many tests before any code. TDD is one failing test at a time; a batch of red tests makes each step large and the failure messages noisy.</p></div>

  <h2 id="pt-cov"><span class="num">08</span>Code Coverage: What It Does and Doesn't Tell You</h2>
  <p><strong>Coverage</strong> measures which parts of the code were executed while the tests ran. It is good at one thing: finding code that no test touches. It says nothing about whether the code that did run was checked correctly.</p>
  <div class="fx" data-lang="py"># shipping.py
def shipping_fee(weight_kg, express=False):
    if weight_kg &lt;= 0:
        raise ValueError("weight must be positive")
    fee = 50 if weight_kg &lt;= 1 else 50 + 20 * (weight_kg - 1)
    if express:
        fee *= 2
    return fee</div>
  <div class="fx" data-lang="py"># test_shipping.py
from shipping import shipping_fee

def test_heavy_express():
    assert shipping_fee(3, express=True) == 180      # (50 + 2*20) * 2</div>
  <div class="fx" data-lang="text">$ pytest -q --cov=shipping --cov-report=term-missing
.                                                                        [100%]
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.13.18-final-0 _______________

Name          Stmts   Miss  Cover   Missing
-------------------------------------------
shipping.py       7      1    86%   3
-------------------------------------------
TOTAL             7      1    86%
1 passed in 0.02s
$ pytest -q --cov=shipping --cov-branch --cov-report=term-missing
...
Name          Stmts   Miss Branch BrPart  Cover   Missing
---------------------------------------------------------
shipping.py       7      1      4      2    73%   3, 5-&gt;7
---------------------------------------------------------
TOTAL             7      1      4      2    73%</div>
  <p>Read it. <b>Line coverage</b> (86%) reports line 3, the <code>raise</code>, as never run: the error path is untested. <b>Branch coverage</b> (<code>--cov-branch</code>, 73%) also reports <code>5-&gt;7</code>: the <code>if express:</code> on line 5 never took its False branch, so non-express pricing is untested even though every line of it "ran". And neither report flags line 4: the light-parcel branch of the conditional expression (<code>50 if weight_kg &lt;= 1</code>) was never exercised, but coverage counts the whole line as covered because it executed. Coverage tools track lines and statement-level branches, not every path through an expression.</p>
  <table class="tbl">
    <tr><th>Coverage tells you</th><th>Coverage does not tell you</th></tr>
    <tr><td>Which lines/branches no test executed</td><td>Whether executed code was asserted on at all</td></tr>
    <tr><td>Dead or unreachable code</td><td>Whether the right inputs (boundaries) were used</td></tr>
    <tr><td>Error handlers that never fire in tests</td><td>Whether the expected values are correct</td></tr>
    <tr><td>A trend over time (coverage dropping on new code)</td><td>Missing behaviour: code that should exist but doesn't is never "uncovered"</td></tr>
  </table>
  <p>A test that calls <code>shipping_fee(3, express=True)</code> without any <code>assert</code> produces exactly the same coverage report. Use coverage to find gaps, then write real checks for them; treat a threshold in CI (say 80% on new code) as a floor, not a goal. <strong>Mutation testing</strong> (mutmut, cosmic-ray) measures test quality more directly: it makes small changes to the code (<code>&gt;=</code> → <code>&gt;</code>) and reports which changes no test catches.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Line (statement) coverage</strong> = executed statements ÷ all statements. <strong>Branch coverage</strong> additionally requires every decision (<code>if</code>, loop condition) to have gone both ways. In Python: <code>pytest --cov=pkg --cov-branch --cov-report=term-missing</code> (pytest-cov) or <code>coverage run -m pytest</code> then <code>coverage report -m</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Chasing 100% with assertion-free tests or tests of trivial getters. The number goes up, protection does not. 100% coverage with the <code>&gt;=</code>/<code>&gt;</code> bug is easy: a test at 200 runs the line without ever checking 150.</p></div>

  <h2 id="pt-traps"><span class="num">09</span>Common Mistakes</h2>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td>Only happy-path tests</td><td>Off-by-one bugs at thresholds pass</td><td>Boundary values, empty input, error paths</td></tr>
    <tr><td>Expected value computed by the code</td><td>Test can never fail</td><td>Work expectations out by hand from the spec</td></tr>
    <tr><td>Test never seen failing</td><td>Green forever, protects nothing</td><td>Break the code once on purpose (or TDD)</td></tr>
    <tr><td>Hidden inputs: clock, randomness, network</td><td>Flaky tests; "works on my machine"</td><td>Inject them; fixed seeds; test doubles</td></tr>
    <tr><td>Tests depend on each other / shared state</td><td>Pass alone, fail in the suite (or vice versa)</td><td>Fresh fixtures per test; no module-level mutable state</td></tr>
    <tr><td>Many unrelated asserts in one test</td><td>First failure hides the others</td><td>One behaviour per test; parametrize</td></tr>
    <tr><td>Testing implementation details</td><td>Tests break on every refactor</td><td>Assert public behaviour and results</td></tr>
    <tr><td>Over-mocking your own code</td><td>Green tests, broken logic</td><td>Mock only external boundaries (<a class="xref" data-note="py_mocking">Mocks</a>)</td></tr>
    <tr><td><code>==</code> on floats; exact model scores</td><td>Fails on harmless numeric noise</td><td><code>pytest.approx</code>, <code>assert_allclose</code>, thresholds</td></tr>
    <tr><td>Coverage as the goal</td><td>High %, bugs still ship</td><td>Use it to find untested code, not as proof</td></tr>
    <tr><td>Fixing a bug without a test</td><td>The same bug returns</td><td>Failing test first, then fix, keep the test</td></tr>
    <tr><td>Ice-cream-cone suite</td><td>Slow, flaky, ignored</td><td>Push checks down to unit level</td></tr>
  </table>

  <h2 id="pt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why automated tests</h3>
  <ul>
    <li><b>Test</b>: run code on input with known answer, assert. <b>Regression</b>: previously working behaviour breaks after a change.</li>
    <li>Benefits: regression protection, safe refactoring, executable documentation, pushes toward testable (pure, decoupled) design, CI confidence.</li>
  </ul>
  <h3>Kinds of tests</h3>
  <table class="tbl">
    <tr><th>Kind</th><th>Scope</th><th>Speed</th><th>Catches</th></tr>
    <tr><td>Unit</td><td>One function/class, no real I/O</td><td>ms</td><td>Logic bugs</td></tr>
    <tr><td>Integration</td><td>Code + real file/DB/service/module</td><td>10 ms – s</td><td>Wiring, formats, SQL, serialisation</td></tr>
    <tr><td>End-to-end</td><td>Whole deployed system via its real interface</td><td>s – min</td><td>User-visible flows</td></tr>
    <tr><td>Regression</td><td>Any; pins a fixed bug</td><td>—</td><td>Bug returning</td></tr>
    <tr><td>Smoke</td><td>Shallow "does it start / respond"</td><td>s</td><td>Broken build/deploy/config</td></tr>
  </table>
  <h3>Test pyramid</h3>
  <ul>
    <li>Many unit (~70–80%) → fewer integration (~15–25%) → few E2E (~5%). Lower = faster, deterministic, precise failures.</li>
    <li>Anti-pattern: <b>ice-cream cone</b> (mostly E2E/manual). Push each check to the cheapest level that can catch the bug.</li>
  </ul>
  <h3>Good unit tests</h3>
  <ul>
    <li><b>FIRST</b>: Fast, Isolated (independent), Repeatable, Self-checking, Timely.</li>
    <li><b>AAA</b>: Arrange, Act, Assert. One behaviour per test; descriptive names.</li>
    <li>Make hidden inputs parameters: <code>greeting(now=None)</code>, <code>split(n, seed)</code>, <code>Till(gateway)</code>.</li>
    <li><b>Flaky</b> = same code, different results; fix the cause, never just re-run.</li>
  </ul>
  <h3>What to test</h3>
  <ul>
    <li>Happy path (one per equivalence class), boundaries (both sides of each edge, min/max), edge cases (empty, single, zero, NaN, duplicates, unicode, huge), error paths (exact exception + message).</li>
    <li>Test behaviour via the public interface; expected values by hand.</li>
    <li>Off-by-one bugs are only caught by boundary tests (<code>score &gt; 75</code> failed only <code>[75-B]</code>).</li>
  </ul>
  <h3>ML and data code</h3>
  <ul>
    <li>Validate batches: schema, dtypes, nulls, ranges, label set (pandera / Great Expectations / plain checks).</li>
    <li>Transforms: exact invariants (shape, no NaN, mean 0/std 1, input not mutated, constant column handled).</li>
    <li>Seeds everywhere randomness enters; assert train/test disjoint (no leakage).</li>
    <li>Models: planted signal + tolerance/threshold; output contracts; overfit a tiny batch. Never exact scores.</li>
    <li>Floats: <code>x == pytest.approx(y)</code>, <code>np.testing.assert_allclose(a, b, rtol, atol)</code>, <code>pd.testing.assert_frame_equal</code>. <code>0.1 + 0.2 == 0.3</code> is <code>False</code>.</li>
  </ul>
  <h3>TDD</h3>
  <ul>
    <li>Red (one failing test, fails for the right reason) → green (simplest pass) → refactor (stay green).</li>
    <li>Red step proves the test can fail. Less useful for exploration; always use it for bug fixes.</li>
  </ul>
  <h3>Coverage</h3>
  <ul>
    <li>Line coverage = executed statements / total; branch coverage = every decision both ways (<code>--cov-branch</code>; reports like <code>5-&gt;7</code>).</li>
    <li>Finds untested code; cannot show assertions exist, inputs are good, or expectations are right. Conditional expressions on one line count as covered.</li>
    <li>Mutation testing (mutmut) measures whether tests catch small code changes.</li>
    <li><code>pytest --cov=pkg --cov-branch --cov-report=term-missing</code>.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>"Ran it, looked fine" is not a test.</li>
    <li><code>assert f(x) == f(x)</code> and tests with no assert never fail.</li>
    <li><code>pytest.raises(Exception)</code> is too broad.</li>
    <li>Clock, randomness, network and shared state make tests flaky.</li>
    <li>Mock external boundaries only; keep your own logic real.</li>
    <li>100% coverage ≠ correct.</li>
  </ul>

  <h2 id="pt-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why write automated tests at all?</summary><div class="qa-body">To catch regressions immediately after the change that caused them, to make refactoring and dependency upgrades safe, and to document intended behaviour as runnable examples. They also enable CI: every push is checked automatically. Manual checks cover only what you remember to try, once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a unit test and an integration test?</summary><div class="qa-body">A unit test checks one function or class in isolation, with no real I/O, and runs in milliseconds; a failure points at that unit. An integration test checks that components work together, or that your code works with real infrastructure (file system, database, another service). Integration tests catch wiring bugs (formats, SQL, serialisation) that unit tests cannot, at the cost of speed and some flakiness.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are regression tests and smoke tests?</summary><div class="qa-body">A regression test pins behaviour, typically a bug that was fixed, so it cannot silently come back: reproduce the bug as a failing test, fix, keep the test. A smoke test is a small, shallow check that a build or deployment basically works (the app starts, a health endpoint returns 200, the model file loads), run before the slower suites.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the test pyramid.</summary><div class="qa-body">Keep many fast unit tests at the base, fewer integration tests in the middle, and few end-to-end tests at the top. Lower levels are faster, deterministic and give precise failures; higher levels are realistic but slow, flaky and vague when they fail. The inverted "ice-cream cone" (mostly E2E/manual) produces slow, flaky suites that people stop running.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes a good unit test?</summary><div class="qa-body">FIRST: fast, isolated (no dependence on other tests or order), repeatable (same result anywhere, any time), self-checking (asserts, no human reads output), timely (written with the code). Plus: arrange–act–assert layout, one behaviour per test, a name that states the behaviour, and expected values derived from the spec.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a flaky test and how do you fix one?</summary><div class="qa-body">A test that passes and fails on the same code. Common causes: reading the clock, unseeded randomness, real network calls, timing/sleeps in async code, shared mutable state or test-order dependence, and environment differences (paths, timezones, locale). Fix the cause: inject time and randomness, seed, replace external services with doubles, give each test fresh state. Retrying hides the problem.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose test cases for a function?</summary><div class="qa-body">Equivalence partitioning: one representative per class of inputs the code treats alike. Boundary value analysis: both sides of every threshold and the ends of valid ranges, where off-by-one bugs live. Edge cases: empty, single element, zero, negative, NaN, duplicates, very large. Error paths: invalid types/values must raise the specific exception. For a grading function with B at 75–89, test 74, 75, 89, 90, not just 80.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Should tests check implementation details, such as which helper functions were called?</summary><div class="qa-body">Generally no. Test observable behaviour through the public interface (return values, state changes, outputs to external systems). Tests coupled to internals break on harmless refactors, so people stop trusting them, while still possibly missing real bugs. Checking calls is appropriate at external boundaries where the call itself is the behaviour (the payment gateway was charged once with the right amount).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does code coverage measure, and does 100% coverage mean the code is correct?</summary><div class="qa-body">It measures which lines (line coverage) or decision outcomes (branch coverage) were executed during the tests. It does not mean correct: a test with no assertion gives the same coverage, boundaries may never be tested, expected values may be wrong, and missing functionality is never "uncovered". Use it to find untested code, not to certify quality.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Line coverage vs branch coverage?</summary><div class="qa-body">Line coverage counts executed statements. Branch coverage also requires each decision to go both ways: an <code>if</code> with no <code>else</code> that is always True in tests has 100% line coverage but a missed branch (coverage.py reports it as e.g. <code>5-&gt;7</code>). Branch coverage is stricter and usually what you should enable (<code>--cov-branch</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is TDD, and when would you not use it?</summary><div class="qa-body">Test-driven development: write a small failing test (red), the simplest code to pass it (green), then refactor with the tests as a safety net. It guarantees every behaviour is tested and every test has been seen to fail. It fits poorly with exploratory work (notebooks, research spikes, unclear requirements); there, explore first and add tests before the code is shared. For bug fixes, always write the failing test first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>print(0.1 + 0.2 == 0.3)</code> print, and how should such a comparison be written in a test?</summary><div class="qa-body"><code>False</code>: the sum is <code>0.30000000000000004</code> because these decimals are not exact in binary. In tests use <code>assert 0.1 + 0.2 == pytest.approx(0.3)</code>, <code>math.isclose</code>, or <code>np.testing.assert_allclose</code> for arrays. For money, avoid floats: integer cents/paise or <code>Decimal</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test code that uses randomness?</summary><div class="qa-body">Make the randomness an input: pass a seed or an <code>np.random.Generator</code>, and use a fixed seed in tests so results repeat. Then assert properties that must hold for any seed (sizes, disjoint splits, values in range), and for statistical behaviour use a tolerance or threshold. Never rely on global unseeded state such as <code>random.random()</code> inside the function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you test a data pipeline or feature-engineering code?</summary><div class="qa-body">Treat each transform as a pure function and unit-test it on small hand-built DataFrames: exact output values, shape and row count, dtypes, no NaN introduced, input not mutated, and edge cases (empty frame, constant column, all-null column, unseen category). Add validation checks on real input batches (schema, ranges, nulls, label set), and an integration test that runs the pipeline end to end on a small fixture file. Compare frames with <code>pd.testing.assert_frame_equal</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test an ML model when its output is not exactly predictable?</summary><div class="qa-body">Test behaviour, not exact numbers: train on synthetic data with a planted rule and assert the metric beats a threshold or the parameters are recovered within a tolerance; check output contracts (shape, probabilities in [0, 1] summing to 1); check the model can overfit a tiny batch; invariance tests (prediction unchanged by an irrelevant feature) and directional tests (higher income should not lower a credit score). Full evaluation on held-out data is a separate pipeline step, not a unit test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test code that calls an external API or database?</summary><div class="qa-body">In unit tests, replace the external dependency with a test double (stub, fake or mock), ideally passed in via dependency injection, so tests are fast, repeatable and can simulate errors and timeouts. Then keep a few integration tests against a real but disposable instance (a Docker database, the provider's sandbox) to verify the double matches reality. Details in <a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You fix a bug reported in production. What is the workflow?</summary><div class="qa-body">Reproduce it as the smallest failing test; confirm it fails for the reported reason; isolate the cause (debugger, logs); fix with the smallest change; run the new test and the whole suite; keep the test as a regression test. If old tests now fail, decide whether they encoded the old (wrong) behaviour and update them deliberately.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is mutation testing?</summary><div class="qa-body">A tool (mutmut, cosmic-ray) makes small changes to your code, such as <code>&gt;=</code> to <code>&gt;</code>, <code>+</code> to <code>-</code>, or returning <code>None</code>, and runs the suite for each "mutant". A mutant that survives (all tests still pass) reveals a weak spot. It measures whether tests actually check behaviour, which coverage cannot, but it is slow, so it is usually run on critical modules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your test suite takes 40 minutes and fails randomly. What would you do?</summary><div class="qa-body">Measure first (<code>pytest --durations=20</code>) and track which tests flake. Push checks down the pyramid: replace slow E2E tests of pure logic with unit tests; replace real network calls with doubles; fix flaky causes (time, randomness, order, shared state). Mark slow integration tests and run them on push rather than on every save; parallelise with pytest-xdist; use cheaper fixtures (module/session scope for read-only expensive setup).</div></details>
</main>
`
});
