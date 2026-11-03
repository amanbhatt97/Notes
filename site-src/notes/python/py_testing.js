// notes/python/py_testing.js — Software Testing Fundamentals
Object.assign(TOPIC_CONTENT, {
  "py_testing": `<main>
<h1>Software Testing Fundamentals</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>Software Testing Fundamentals</span></div>
  <p class="lead">Software testing is the habit of writing small programs that check your real program gives the answers it should. Every working program changes over time: someone fixes a bug, tidies a function, upgrades a library, and each change can quietly break something that worked yesterday. Automated tests catch those breaks seconds after they happen instead of weeks later, when a customer or a wrong dashboard number finds them, and in data and ML work they are what stop a broken feature transform or a leaky train/test split from reaching a model in production. This page builds the ideas from zero: what a test is, the kinds of tests, how many of each to keep, what makes a test trustworthy, how to choose test cases, how to test data and ML code, test-driven development, and what code coverage really measures. One running example is used throughout: the till of a small tea stall, Chai Corner, whose billing rules we will test, break on purpose, and test again.</p>

  <h2 id="pt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Software Testing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why test</div>
        <ul>
          <li>A <b>test</b> runs code on a case whose answer you know</li>
          <li>A <b>regression</b> is old behaviour broken by a new change</li>
          <li>Tests make changing code safe</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Kinds and pyramid</div>
        <ul>
          <li><b>Unit</b>: one function, no I/O</li>
          <li><b>Integration</b>: your code + real files, DB, services</li>
          <li><b>End-to-end</b>: the whole system as a user sees it</li>
          <li>Many unit, fewer integration, few E2E</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Good tests</div>
        <ul>
          <li>FIRST: Fast, Isolated, Repeatable, Self-checking, Timely</li>
          <li>Arrange, Act, Assert; one behaviour per test</li>
          <li>Pass the clock, randomness and I/O in as parameters</li>
          <li>Boundaries: test both sides of every edge</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data, TDD, coverage</div>
        <ul>
          <li>Data: validate batches, seed randomness, tolerances</li>
          <li>TDD: red → green → refactor</li>
          <li>Coverage shows what never ran, not what was checked</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pt-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Automated Tests</span><span class="rm-sub">checking by hand, and the bug it misses</span></div></div>
      <div class="rm-item rm-done" data-target="pt-kinds"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Kinds of Tests</span><span class="rm-sub">unit, integration, end-to-end, regression, smoke</span></div></div>
      <div class="rm-item rm-done" data-target="pt-pyramid"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Test Pyramid</span><span class="rm-sub">how many tests of each kind to keep</span></div></div>
      <div class="rm-item rm-done" data-target="pt-first"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">What Makes a Good Unit Test</span><span class="rm-sub">FIRST, Arrange-Act-Assert, flaky tests</span></div></div>
      <div class="rm-item rm-done" data-target="pt-what"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Choosing Test Cases</span><span class="rm-sub">partitions, boundaries, edge cases, errors</span></div></div>
      <div class="rm-item rm-done" data-target="pt-ml"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Testing Data and ML Code</span><span class="rm-sub">validation, seeds, tolerances, planted signals</span></div></div>
      <div class="rm-item rm-done" data-target="pt-tdd"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Test-Driven Development</span><span class="rm-sub">writing the test before the code</span></div></div>
      <div class="rm-item rm-done" data-target="pt-cov"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Code Coverage</span><span class="rm-sub">what it measures and what it cannot</span></div></div>
      <div class="rm-item rm-done" data-target="pt-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">tests that can never fail</span></div></div>
      <div class="rm-item rm-done" data-target="pt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, tables, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pt-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">fundamentals to design questions</span></div></div>
    </div>
  </div>

  <h2 id="pt-why"><span class="num">01</span>Why Automated Tests</h2>
  <p>Chai Corner's till has three billing rules. Add up the price of everything ordered (the <em>subtotal</em>). If the subtotal is ₹150 or more, take 10% off. Then add 5% GST and round to whole rupees. Here is the module that does it; this same file is the code we will be testing for the rest of the page:</p>
  <div class="fx" data-lang="py"># till.py
"""Chai Corner till: the billing rules."""
GST = 0.05

def subtotal(lines):
    """Add up qty * price over the lines of one order."""
    return sum(qty * price for item, qty, price in lines)

def discount(sub):
    """10% off when the subtotal is 150 or more."""
    if sub &gt;= 150:
        return sub * 0.10
    return 0

def with_tax(amount):
    return amount + amount * GST

def bill(lines):
    """Final bill in whole rupees. Refuses negative quantities."""
    for item, qty, price in lines:
        if qty &lt; 0:
            raise ValueError(f"qty must be non-negative, got {qty} for {item!r}")
    sub = subtotal(lines)
    return round(with_tax(sub - discount(sub)))</div>
  <p>How do you know this code is right? The natural first step is to run it on a couple of orders and look at the answers:</p>
  <div class="fx" data-lang="py"># "testing" by hand: run it and look
from till import bill
print(bill([("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]))
print(bill([("masala chai", 1, 30), ("vada pav", 2, 20)]))</div>
  <div class="fx" data-lang="text">184
74</div>
  <p>Asha ordered 2 chai, 3 samosas and a cold coffee: 60 + 45 + 90 = 195, minus 19.50 discount is 175.50, plus 5% GST is 184.275, which rounds to 184. Ben's order is 30 + 40 = 70, no discount, plus GST is 73.50, which rounds to 74. Both answers are right, so it is tempting to call the code "tested". But that check has three weaknesses. It only covered the two orders we happened to try. It lives in our heads, so nobody will repeat it after the next change. And it relied on a person looking at the numbers and knowing what they should be.</p>
  <p>An <strong>automated test</strong> fixes all three. It is a small piece of code that runs your code on an input whose correct answer you have worked out by hand, and checks the actual answer against it, so a machine can repeat the check after every change in a fraction of a second. In Python the usual tool for running tests is <strong>pytest</strong>: you write ordinary functions whose names start with <code>test_</code>, and inside them you use the plain <code>assert</code> statement, which does nothing when its condition is true and raises an error when it is false. (pytest itself is taught in <a class="xref" data-note="py_pytest">Testing with pytest</a>; here it is just the tool that runs our checks.)</p>
  <div class="fx" data-lang="py"># test_till.py
from till import bill

def test_big_order_gets_discount():
    asha = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
    assert bill(asha) == 184          # 195 - 19.5 = 175.5, + 5% = 184.275

def test_small_order_pays_full_price():
    ben = [("masala chai", 1, 30), ("vada pav", 2, 20)]
    assert bill(ben) == 74            # 70, no discount, + 5% = 73.5

def test_exactly_150_gets_discount():
    five_chai = [("masala chai", 5, 30)]
    assert bill(five_chai) == 142     # 150 - 15 = 135, + 5% = 141.75</div>
  <p>The third test is the interesting one. Five chai cost exactly ₹150, which sits right on the edge of the discount rule. The expected value is worked out by hand in the comment: 150 minus 15 is 135, plus 5% is 141.75, which rounds to 142. Running the tests:</p>
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

============================== 3 passed in 0.02s ===============================</div>
  <p>pytest found the file, ran the three functions, and each one passed. Now imagine that a few months later someone "tidies" the discount rule and types <code>sub &gt; 150</code> instead of <code>sub &gt;= 150</code>. It is a one-character change and the code still looks perfectly reasonable. Asha and Ben are nowhere near the edge, so if we checked by hand again with their orders, everything would look fine. The tests tell a different story:</p>
  <div class="fx" data-lang="text">$ pytest -q test_till.py
..F                                                                      [100%]
=================================== FAILURES ===================================
________________________ test_exactly_150_gets_discount ________________________

    def test_exactly_150_gets_discount():
        five_chai = [("masala chai", 5, 30)]
&gt;       assert bill(five_chai) == 142     # 150 - 15 = 135, + 5% = 141.75
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
E       AssertionError: assert 158 == 142
E        +  where 158 = bill([('masala chai', 5, 30)])

test_till.py:14: AssertionError
=========================== short test summary info ============================
FAILED test_till.py::test_exactly_150_gets_discount - AssertionError: assert ...
1 failed, 2 passed in 0.03s</div>
  <p>The dots stand for passing tests and the <code>F</code> for a failure. The two typical orders still pass, but the boundary test fails, and the summary says why: the till now charges 158 for five chai instead of 142, because a ₹150 order no longer gets its discount. The mistake was caught within a second of being made, next to the change that caused it. A bug like this, where something that used to work stops working after a change, is called a <strong>regression</strong>, and catching regressions is the first and biggest reason tests exist.</p>
  <p>Think of the safety checks a pilot runs before every flight. The plane flew fine yesterday, but the checklist is run anyway, every time, because the cost of the check is tiny and the cost of a missed fault is huge. A test suite is that checklist for code. It also gives you three other things. It makes <em>refactoring</em> safe: you can restructure code, split functions or speed up a loop, and if the same tests still pass, the behaviour has not changed. It is <em>documentation that cannot go out of date</em>: <code>test_exactly_150_gets_discount</code> states the rule "₹150 counts" more precisely than any comment, and if the rule changes, the test fails instead of silently lying. And it pushes you towards better design, because code that is hard to test (it reads the clock inside, mixes file handling with arithmetic, depends on global variables) is usually hard to change too.</p>
  <p>A few words that will appear everywhere: the collection of all a project's tests is its <strong>test suite</strong>; the program that finds and runs them (pytest, or Python's built-in unittest) is the <strong>test runner</strong>; and the code a test is checking is called the <strong>system under test</strong>.</p>

  <h2 id="pt-kinds"><span class="num">02</span>Kinds of Tests</h2>
  <p>The tests above call one function, <code>bill</code>, with a list of tuples and check the number that comes back. Nothing else is involved: no files, no database, no network. But the till does more than calculate. At closing time it saves the day's bills to a CSV file, and tomorrow's accounting job reads that file back. A bug there, such as writing the amounts as text, would not be caught by any of our <code>bill</code> tests, because they never touch a file. Different bugs live at different levels of a program, so tests are grouped by how much of the system they exercise.</p>
  <p>A <strong>unit test</strong> checks one small piece of code, usually one function or class, on its own, without real files, databases or network. It runs in microseconds, and when it fails it points straight at the function that is wrong. An <strong>integration test</strong> checks that pieces work together, or that your code works with a real piece of infrastructure: does what we write to a file come back the same when we read it? An <strong>end-to-end test</strong> (E2E) drives the whole finished system the way a user would, for example by placing an order through the real web page and checking the receipt and the saved record. Building a bicycle is a good picture of the three: you bench-test each part (does the brake lever squeeze, does the chain hold), then check parts fitted together (does the brake actually stop the wheel), and finally take the finished bike for one ride around the block.</p>
  <p>Here is the module that saves and loads the day's bills, followed by one test of each of the first two kinds:</p>
  <div class="fx" data-lang="py"># store.py
import csv

def save_day(bills, path):
    """Write {customer: amount} to a CSV file."""
    with open(path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["customer", "amount"])
        writer.writerows(bills.items())

def load_day(path):
    """Read the CSV back into {customer: amount}."""
    with open(path, newline="") as f:
        return {row["customer"]: int(row["amount"]) for row in csv.DictReader(f)}</div>
  <div class="fx" data-lang="py"># test_store.py
from till import bill
from store import save_day, load_day

ORDERS = {
    "Asha": [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)],
    "Ben":  [("masala chai", 1, 30), ("vada pav", 2, 20)],
}

# UNIT test: one function, no files, runs in microseconds
def test_bill_for_ben():
    assert bill(ORDERS["Ben"]) == 74

# INTEGRATION test: our code + the real file system
def test_day_survives_csv_round_trip(tmp_path):     # tmp_path: a fresh empty folder
    bills = {name: bill(lines) for name, lines in ORDERS.items()}
    path = tmp_path / "day.csv"
    save_day(bills, path)
    assert load_day(path) == bills                  # {'Asha': 184, 'Ben': 74}</div>
  <p>The first test is a unit test: it calls <code>bill</code> alone. The second is an integration test: it really writes a file and really reads it back. <code>tmp_path</code> is a helper pytest provides, a brand-new empty folder for this one test, so the test never collides with other tests or leaves files lying around in the project.</p>
  <div class="fx" data-lang="text">$ pytest -v test_store.py
============================= test session starts ==============================
platform linux -- Python 3.13.18, pytest-9.2.0, pluggy-1.7.0 -- ~/chai/.venv/bin/python3
cachedir: .pytest_cache
rootdir: ~/chai
plugins: cov-7.1.0
collecting ... collected 2 items

test_store.py::test_bill_for_ben PASSED                                  [ 50%]
test_store.py::test_day_survives_csv_round_trip PASSED                   [100%]

============================== 2 passed in 0.03s ===============================</div>
  <p>Both pass. To see why the integration test earns its place, suppose someone deletes the <code>int(...)</code> in <code>load_day</code>, so the amounts come back as the text the CSV file contains:</p>
  <div class="fx" data-lang="text">$ pytest -q --tb=short test_store.py
.F                                                                       [100%]
=================================== FAILURES ===================================
_______________________ test_day_survives_csv_round_trip _______________________
test_store.py:19: in test_day_survives_csv_round_trip
    assert load_day(path) == bills                  # {'Asha': 184, 'Ben': 74}
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
E   AssertionError: assert {'Asha': '184', 'Ben': '74'} == {'Asha': 184, 'Ben': 74}
E
E     Differing items:
E     {'Ben': '74'} != {'Ben': 74}
E     {'Asha': '184'} != {'Asha': 184}
E     Use -v to get more diff
=========================== short test summary info ============================
FAILED test_store.py::test_day_survives_csv_round_trip - AssertionError: asse...
1 failed, 1 passed in 0.04s</div>
  <p>The unit test still passes, because <code>bill</code> is fine. The integration test fails, and the message shows exactly what went wrong: <code>'184'</code> in quotes, a string, where the number 184 was expected. That is the kind of bug integration tests exist for: the wiring between pieces, such as file formats, data types, database queries and serialisation, rather than the logic inside one function.</p>
  <p>Two more names describe a test's purpose rather than its size. A <strong>regression test</strong> pins down a specific bug that was fixed, so that it cannot come back unnoticed: when a bug is reported, you first write a test that reproduces it, then fix the code, and keep the test forever (the whole workflow is traced in <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>). The boundary test from the first section is exactly that kind of guard. A <strong>smoke test</strong> is a quick, shallow "does it even start?" check run straight after a deployment, before the slower suites: the app starts, its health page answers, the model file loads. The name comes from electronics, where the first test of a new circuit board was to switch it on and see whether smoke came out.</p>
  <table class="tbl">
    <tr><th>Kind</th><th>Exercises</th><th>Typical speed</th><th>Catches</th></tr>
    <tr><td>Unit</td><td>One function or class, no real I/O</td><td>microseconds to ms</td><td>Logic bugs: wrong formula, wrong branch</td></tr>
    <tr><td>Integration</td><td>Your code plus a real file, database or other module</td><td>ms to seconds</td><td>Wiring bugs: formats, types, queries</td></tr>
    <tr><td>End-to-end</td><td>The whole deployed system through its real interface</td><td>seconds to minutes</td><td>"Does the feature work for a user?"</td></tr>
    <tr><td>Regression</td><td>Any level; pins a fixed bug</td><td>any</td><td>The same bug returning</td></tr>
    <tr><td>Smoke</td><td>A few broad, shallow checks after a deploy</td><td>seconds</td><td>Broken builds, missing configuration</td></tr>
  </table>
  <p>One warning about integration tests: point them at throwaway resources, never shared real ones. A test that writes to the team's database or charges a real payment gateway is slow, fails whenever the network does, and can damage real data. Use <code>tmp_path</code>, an in-memory SQLite database, a container started just for the test run, or a provider's sandbox account. When a unit test needs to talk to something external, the external part is replaced by a stand-in called a test double, which is the subject of <a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a>.</p>

  <h2 id="pt-pyramid"><span class="num">03</span>The Test Pyramid</h2>
  <p>If end-to-end tests are the most realistic, why not write only those? Because realism has a price. An E2E test of the till would start a web server, open a browser, click through an order and read the receipt: several seconds per test, with plenty of chances to fail for reasons unrelated to our code (a slow page load, a port already in use). Worse, when it fails, it only says "something in the ordering flow is broken"; someone still has to dig to find out whether the bug is in <code>bill</code>, in the CSV code or in the web page. A unit test of <code>bill</code> takes a millisecond, never fails by accident, and when it fails it names the exact function and input.</p>
  <p>The <strong>test pyramid</strong> is the rule of thumb that follows from this: keep many fast unit tests at the base, fewer integration tests in the middle, and only a handful of end-to-end tests at the top. The shape is about cost. Each bug should be caught at the cheapest level that is able to catch it: a rule inside one function belongs in a unit test; "the file tonight's job writes can be read by tomorrow's job" needs an integration test; "a customer can actually place an order" needs one or two E2E tests.</p>
  <table class="tbl">
    <tr><th></th><th>Unit</th><th>Integration</th><th>End-to-end</th></tr>
    <tr><td>Rough share of a suite</td><td>most (often 70–80%)</td><td>some (15–25%)</td><td>few (around 5%)</td></tr>
    <tr><td>Speed</td><td>milliseconds</td><td>ms to seconds</td><td>seconds to minutes</td></tr>
    <tr><td>Fails by accident</td><td>almost never</td><td>sometimes (timing, ports)</td><td>most often (network, UI timing)</td></tr>
    <tr><td>When it fails you know</td><td>the exact function and input</td><td>which connection broke</td><td>"something in the flow"</td></tr>
    <tr><td>Usually run</td><td>on every save</td><td>on every push</td><td>before a release, or nightly</td></tr>
  </table>
  <p>The opposite shape has a name too: the <strong>ice-cream cone</strong>, a suite made mostly of manual checks and E2E tests with very few unit tests. It takes an hour to run, fails randomly, and when it is red a person has to investigate what broke. People stop running it, and then it protects nothing. The percentages in the table are not targets to hit; they are what tends to happen when you push every check down to the cheapest level that can catch the bug.</p>

  <h2 id="pt-first"><span class="num">04</span>What Makes a Good Unit Test</h2>
  <p>A test is only useful if two things are true: people run it all the time, and they believe it when it fails. A test that takes a minute will not be run after every change. A test that fails now and then for no reason teaches everyone to ignore red. Experienced testers summarise what a trustworthy unit test needs with the letters <strong>FIRST</strong>. It is <strong>Fast</strong>, taking milliseconds, so the whole suite can run constantly. It is <strong>Isolated</strong>: it does not depend on other tests or on the order they run in, and it starts from fresh state every time. It is <strong>Repeatable</strong>: same result on every run, on any machine, at any time of day. It is <strong>Self-checking</strong>: it decides pass or fail by itself with an <code>assert</code>, so nobody has to read printed output. And it is <strong>Timely</strong>: written together with the code (or just before it), not months later when nobody remembers the rules.</p>
  <p>Repeatability is the property most often broken by accident, so it is worth seeing fail. Chai Corner runs a happy hour: chai is half price from 15:00 to 16:59. The function that decides whether it is happy hour needs to know the time. If it simply read the clock inside, any test of it would depend on when the test was run. So it takes the time as a parameter, and only reads the clock when nobody passed one in:</p>
  <div class="fx" data-lang="py"># happy.py
from datetime import datetime

def is_happy_hour(now=None):
    """Chai is half price from 15:00 to 16:59. 'now' can be passed in."""
    now = now or datetime.now()
    return 15 &lt;= now.hour &lt; 17</div>
  <p>The first test below ignores that parameter and lets the function read the real clock. The other four pass in fixed times on both sides of each edge of the happy-hour window:</p>
  <div class="fx" data-lang="py"># test_happy.py
from datetime import datetime
from happy import is_happy_hour

def test_happy_hour_uses_real_clock():          # NOT repeatable
    assert is_happy_hour() is False             # true only outside 15:00-16:59

def test_just_before():                          # repeatable: the time is fixed
    assert is_happy_hour(datetime(2026, 1, 1, 14, 59)) is False

def test_starts_at_15():
    assert is_happy_hour(datetime(2026, 1, 1, 15, 0)) is True

def test_last_minute():
    assert is_happy_hour(datetime(2026, 1, 1, 16, 59)) is True

def test_ends_at_17():
    assert is_happy_hour(datetime(2026, 1, 1, 17, 0)) is False</div>
  <p>Here is the same file run twice: once normally, and once with the computer's clock moved into the afternoon. <code>TZ=UTC-…</code> tells that one command to use a time zone several hours ahead, so its local clock reads mid-afternoon; nothing in the code changed.</p>
  <div class="fx" data-lang="text">$ date +%H:%M
06:20
$ pytest -q --tb=line test_happy.py
.....                                                                    [100%]
5 passed in 0.01s
$ TZ=UTC-9 date +%H:%M
15:20
$ TZ=UTC-9 pytest -q --tb=line test_happy.py
F....                                                                    [100%]
=================================== FAILURES ===================================
E   assert True is False
     +  where True = is_happy_hour()
~/chai/test_happy.py:6: assert True is False
=========================== short test summary info ============================
FAILED test_happy.py::test_happy_hour_uses_real_clock - assert True is False
1 failed, 4 passed in 0.01s</div>
  <p>The first run happened in the early morning, so the real-clock test passed along with the others. In the second run, the clock said it was happy hour, and the very same test failed, with no change to any code. A test that passes or fails on the same code depending on the time, the order tests run in, the network, or anything else outside the code is called a <strong>flaky test</strong>, and it is poison for a team: once tests fail randomly, real failures get dismissed as "probably that flaky one again". The four other tests passed in both runs because they never look at the clock. They are <strong>deterministic</strong>: same code, same result, always.</p>
  <p>The cure is always the same idea. Find the input the test cannot control, the clock, randomness, a file path, a network service, and make it something the caller passes in. In production the real thing is passed (or used by default); in a test a fixed value is passed. For randomness that means passing a seed or a random generator; for files, passing a path; for external services, passing an object that the test can replace with a stand-in. This is called <strong>dependency injection</strong>, and it is developed fully in <a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a>.</p>
  <p>The layout inside a good test has a name too: <strong>Arrange, Act, Assert</strong>. First arrange the inputs (build the order), then act by calling the code once (<code>bill(five_chai)</code>), then assert on the result. Each test checks one behaviour, and its name says which one: <code>test_exactly_150_gets_discount</code> tells you what broke the moment it fails, while <code>test_bill_2</code> tells you nothing. Several asserts about the <em>same</em> result are fine; checking three unrelated rules in one test is not, because the first failing assert stops the test and hides whether the other two rules still work.</p>

  <h2 id="pt-what"><span class="num">05</span>Choosing Test Cases</h2>
  <p>You can never test every possible order. The till accepts any list of items and quantities, which means an endless number of inputs. So testing is really the skill of picking the few inputs most likely to expose a bug. Testing only "normal" orders is the classic mistake: we saw in the first section that the <code>&gt;</code> bug left Asha and Ben untouched and only showed up at exactly ₹150.</p>
  <p>Two standard techniques make the choice systematic. <strong>Equivalence partitioning</strong> means splitting all possible inputs into groups that the code should treat the same way, then testing one representative from each group, because if the code handles one member of a group correctly it almost certainly handles the rest. For the till the groups are: orders below ₹150 (no discount), orders of ₹150 or more (discount), the empty order, and invalid orders such as a negative quantity. <strong>Boundary value analysis</strong> then adds tests right at the edges between groups, on both sides, because that is where off-by-one mistakes live: <code>&gt;</code> instead of <code>&gt;=</code>, <code>&lt;</code> instead of <code>&lt;=</code>, <code>range(n)</code> instead of <code>range(n + 1)</code>. Every price on the menu is a multiple of 5, so the closest possible orders to the edge are ₹145 and ₹150.</p>
  <p>A useful picture is a lift with a sign saying "maximum 8 people". A sensible inspector does not test it with 3 people and call it done. They test with 8 (should work), with 9 (should refuse), and with nobody at all, because those are the cases where a badly built lift would get it wrong.</p>
  <p>Edge cases are inputs that are unusual but valid: the empty order, a single item, a quantity of zero, a very large order. Error paths are invalid inputs that the code should refuse: here, a negative quantity must raise a <code>ValueError</code>. Below, each group and each edge gets one test. <code>parametrize</code> is a pytest feature that runs the same test once per row of a table, reporting each row as its own test; it is explained in <a class="xref" data-note="py_pytest">Testing with pytest</a>. The ₹145 row works out as 90 + 40 + 15 = 145, no discount, plus 5% = 152.25, which rounds to 152.</p>
  <div class="fx" data-lang="py"># test_bill_cases.py
import pytest
from till import bill

@pytest.mark.parametrize("lines, expected", [
    ([("masala chai", 1, 30), ("vada pav", 2, 20)], 74),          # below 150: typical
    ([("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)], 184),  # above
    ([("cold coffee", 1, 90), ("vada pav", 2, 20), ("samosa", 1, 15)], 152),     # 145: edge
    ([("masala chai", 5, 30)], 142),                               # exactly 150: edge
    ([], 0),                                                       # empty order
], ids=["below", "above", "at-145", "at-150", "empty"])
def test_bill(lines, expected):
    assert bill(lines) == expected

def test_negative_qty_is_refused():
    with pytest.raises(ValueError, match="non-negative"):
        bill([("samosa", -2, 15)])</div>
  <div class="fx" data-lang="text">$ pytest -v test_bill_cases.py
============================= test session starts ==============================
platform linux -- Python 3.13.18, pytest-9.2.0, pluggy-1.7.0 -- ~/chai/.venv/bin/python3
cachedir: .pytest_cache
rootdir: ~/chai
plugins: cov-7.1.0
collecting ... collected 6 items

test_bill_cases.py::test_bill[below] PASSED                              [ 16%]
test_bill_cases.py::test_bill[above] PASSED                              [ 33%]
test_bill_cases.py::test_bill[at-145] PASSED                             [ 50%]
test_bill_cases.py::test_bill[at-150] PASSED                             [ 66%]
test_bill_cases.py::test_bill[empty] PASSED                              [ 83%]
test_bill_cases.py::test_negative_qty_is_refused PASSED                  [100%]

============================== 6 passed in 0.03s ===============================</div>
  <p>All six cases pass with the correct code. Now put the <code>&gt;</code> bug back in and run the same file again:</p>
  <div class="fx" data-lang="text">$ pytest -q --tb=no -rf test_bill_cases.py
...F..                                                                   [100%]
=========================== short test summary info ============================
FAILED test_bill_cases.py::test_bill[at-150] - AssertionError: assert 158 == 142
1 failed, 5 passed in 0.01s</div>
  <p>Exactly one test notices, the one sitting on the boundary. The typical "below" and "above" orders, and even the ₹145 order just under the edge, all pass, because none of them has a subtotal of exactly 150. If our table had contained only typical orders, this bug would have shipped. That is the practical meaning of boundary value analysis: the edge cases are where a test suite earns its keep.</p>
  <p>Two more rules for choosing what to test. First, work out expected values <em>by hand</em> from the rules, never by running the code under test: a test that asserts <code>bill(order) == bill(order)</code>, or that pastes in whatever the code printed, can never catch a mistake in the code. Second, test behaviour through the public interface, what <code>bill</code> returns for an order, rather than private helper functions or the order in which the code calls things internally. Tests tied to internals break every time someone harmlessly reorganises the code, and people stop trusting them. And when checking for an error, check for the <em>specific</em> exception (here <code>ValueError</code>, with <code>match=</code> checking the message), not just "some exception": the Common Mistakes section shows a broad check passing on a typo.</p>

  <h2 id="pt-ml"><span class="num">06</span>Testing Data and ML Code</h2>
  <p>Data and machine-learning code fails differently from billing code. A billing bug usually gives a visibly wrong number or a crash. A data bug usually gives <em>no</em> error at all: a cleaning step silently drops rows, a scaling step turns a constant column into NaN ("not a number"), the train/test split lets some test rows leak into training so the model looks better than it is. Nothing crashes; the final metric is just wrong, and nobody notices for weeks. Testing data code is about turning those silent failures into loud ones.</p>
  <p>Chai Corner wants to forecast how many cups of chai it will sell from the day's temperature, because on hot days people buy cold coffee instead. The forecasting module has four small functions: one checks a batch of incoming data, one rescales a column, one splits rows into training and test sets, and one fits the simplest possible model, a straight line.</p>
  <div class="fx" data-lang="py"># forecast.py
import numpy as np
import pandas as pd

def validate(df):
    """Return a list of problems with a day's sales data (empty list = OK)."""
    missing = {"temp_c", "cups"} - set(df.columns)
    if missing:
        return [f"missing columns: {sorted(missing)}"]
    problems = []
    if df["cups"].isna().any():
        problems.append("cups has nulls")
    if (df["cups"].dropna() &lt; 0).any():
        problems.append("cups is negative")
    if not df["temp_c"].between(-10, 50).all():
        problems.append("temp_c out of range -10..50")
    return problems

def standardise(x):
    """Scale to mean 0, std 1. A constant column becomes all zeros (not NaN)."""
    x = np.asarray(x, dtype=float)
    std = x.std()
    return np.zeros_like(x) if std == 0 else (x - x.mean()) / std

def split_indices(n, test_frac, seed):
    """Shuffle row numbers 0..n-1 and cut them into train and test."""
    rng = np.random.default_rng(seed)
    idx = rng.permutation(n)
    k = int(n * test_frac)
    return idx[k:], idx[:k]

def fit_line(x, y):
    """Least-squares slope and intercept: y is roughly slope * x + intercept."""
    slope, intercept = np.polyfit(x, y, 1)
    return slope, intercept</div>
  <p>Each function calls for a slightly different testing habit, and the test file below has one group per habit. The first habit is to <strong>validate data at the boundary</strong>: check every incoming batch for the columns you need, missing values (nulls), impossible values and wrong types, and refuse it before it reaches training or a report. Here a temperature of 85 °C and a negative number of cups are clearly bad data. (Libraries such as pandera and Great Expectations let you declare such checks; a plain function works too.) The second habit is to <strong>test transforms by their exact properties</strong>: a standardised column must have mean 0 and standard deviation 1, and the awkward edge case, a column where every value is the same, must not turn into NaN through a division by zero. The third is to <strong>control randomness with a seed</strong>: a seed is the starting value of a random-number generator, and the same seed always produces the same "random" sequence, so a test sees identical data on every run. The fourth is to <strong>test a model by its behaviour, with a tolerance</strong>: make fake data where you planted the answer yourself, train on it, and check the model finds that answer again, approximately.</p>
  <div class="fx" data-lang="py"># test_forecast.py
import numpy as np
import pandas as pd
import pytest
from forecast import validate, standardise, split_indices, fit_line

# 1. validation: a bad batch is reported, a good one passes
def test_validate_flags_bad_batch():
    bad = pd.DataFrame({"temp_c": [31, 85, 29], "cups": [120, None, -4]})
    assert validate(bad) == ["cups has nulls", "cups is negative", "temp_c out of range -10..50"]

def test_validate_accepts_good_batch():
    good = pd.DataFrame({"temp_c": [31, 24], "cups": [120, 160]})
    assert validate(good) == []

# 2. a transform: exact properties, compared with a float tolerance
def test_standardise_gives_mean_0_std_1():
    z = standardise([20.0, 25.0, 30.0, 35.0])
    assert z.mean() == pytest.approx(0.0, abs=1e-12)
    assert z.std() == pytest.approx(1.0)

def test_standardise_constant_column_is_not_nan():
    assert np.array_equal(standardise([28, 28, 28]), [0.0, 0.0, 0.0])

# 3. randomness: a fixed seed makes the split repeatable, and no row leaks
def test_split_is_repeatable_and_disjoint():
    train1, test1 = split_indices(100, 0.2, seed=0)
    train2, test2 = split_indices(100, 0.2, seed=0)
    assert np.array_equal(train1, train2) and np.array_equal(test1, test2)
    assert len(train1) == 80 and len(test1) == 20
    assert set(train1).isdisjoint(test1)

# 4. a model: plant a known rule in fake data, check it is found again
def test_fit_line_recovers_planted_rule():
    rng = np.random.default_rng(42)
    temp = rng.uniform(10, 40, size=200)
    cups = 220 - 3.0 * temp + rng.normal(0, 5, size=200)   # planted: slope -3, intercept 220
    slope, intercept = fit_line(temp, cups)
    assert slope == pytest.approx(-3.0, abs=0.2)
    assert intercept == pytest.approx(220, abs=5)</div>
  <div class="fx" data-lang="text">$ pytest -q test_forecast.py
......                                                                   [100%]
6 passed in 0.26s</div>
  <p>All six pass. The split test checks the single most important property in ML evaluation: the train and test row numbers do not overlap, which is what "no leakage" means. The model test deserves a closer look. We generated 200 fake days where cups = 220 − 3 × temperature, plus random noise, so we know the true slope is −3 and the true intercept is 220. Here is what the line fit actually found:</p>
  <div class="fx" data-lang="py">import numpy as np
from forecast import fit_line
rng = np.random.default_rng(42)
temp = rng.uniform(10, 40, size=200)
cups = 220 - 3.0 * temp + rng.normal(0, 5, size=200)
slope, intercept = fit_line(temp, cups)
print(f"slope {slope:.3f}, intercept {intercept:.2f}")</div>
  <div class="fx" data-lang="text">slope -2.890, intercept 217.36</div>
  <p>A slope of −2.89 and an intercept of 217.4: close to the planted −3 and 220, but not equal, because of the noise. An exact assertion such as <code>slope == -3.0</code> would fail on perfectly correct code, while the tolerance (<code>pytest.approx(-3.0, abs=0.2)</code> means "within 0.2 of −3") accepts the noise but would still fail if the fit were broken, for example if someone passed the columns in the wrong order. Think of a tailor checking a sleeve against a pattern: a millimetre either way is fine, but five centimetres means the cut was wrong.</p>
  <p>Tolerances are needed even for simple arithmetic, because computers store most decimal fractions inexactly in binary (the details are in <a class="xref" data-note="py_values">Values</a>):</p>
  <div class="fx" data-lang="py">import pytest
print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(0.1 + 0.2 == pytest.approx(0.3))</div>
  <div class="fx" data-lang="text">0.30000000000000004
False
True</div>
  <p><code>0.1 + 0.2</code> is stored as 0.30000000000000004, so comparing it to 0.3 with <code>==</code> gives <code>False</code>. <code>pytest.approx</code> compares within a small relative tolerance (one part in a million by default) and says the values are equal. For NumPy arrays the equivalent is <code>np.testing.assert_allclose(actual, expected, rtol=..., atol=...)</code>, and for whole pandas tables, <code>pd.testing.assert_frame_equal</code>, which also checks column types, index and column order. The same thinking applies to model scores: never assert an exact accuracy such as 0.9632, because a library upgrade can change the last digits; assert a threshold, such as "accuracy above 0.9 on data with a planted rule", that a real bug (shuffled labels, wrong feature) would clearly break.</p>

  <h2 id="pt-tdd"><span class="num">07</span>Test-Driven Development</h2>
  <p>Every test we have written so far came after the code. That has a hidden weakness: we only saw each test pass. A test that has never been seen failing might not be able to fail at all. Its name might not start with <code>test_</code>, so it never runs; it might call the code but assert nothing; it might compare the code's answer with itself. In the first section we only trusted the boundary test because we watched it go red when we broke the rule.</p>
  <p><strong>Test-driven development</strong> (TDD) builds that check into the way code is written, by writing the test <em>before</em> the code, in a tight loop of three steps. <strong>Red</strong>: write one small test for the next piece of behaviour you want, run it, and watch it fail, ideally for the reason you expect ("there is no such function yet", or "returned 0, expected 15"). <strong>Green</strong>: write the simplest code that makes that test pass, even if it is crude. <strong>Refactor</strong>: now that the behaviour is pinned by a test, tidy the code (better names, less repetition, a clearer algorithm) while running the tests after every change to make sure they stay green. Then pick the next small behaviour and repeat.</p>
  <p>It works like a tailor who marks the measurements on the cloth before cutting. The marks say exactly what "fits" means before any cutting starts, the cutting follows the marks, and later trimming never changes the measurements. In TDD the tests are the marks: they say what "correct" means before the code exists.</p>
  <p>The loop has real benefits. Every piece of behaviour has a test by construction, and every test has been seen to fail, so none of them is decorative. Writing the test first forces you to decide how the code will be <em>called</em> before deciding how it works, which tends to produce small functions with clear inputs and outputs. And the refactor step is safe, because the tests are already there. It also has costs. It feels slower at first, and it fits poorly with exploratory work such as a notebook analysis or a research prototype, where you do not yet know what the right behaviour is. A common, practical rule is: explore freely, then write tests before the code is shared or other code depends on it, and when fixing a bug, always write the failing test first. A complete red-green-refactor trace, building a bill-splitting function one rule at a time, is in <a class="xref" data-note="py_pytest">Testing with pytest</a>.</p>

  <h2 id="pt-cov"><span class="num">08</span>Code Coverage</h2>
  <p>Once a project has many tests, a natural question is: which parts of the code are not tested at all? Reading every test to find out is impractical. <strong>Code coverage</strong> answers it automatically: a coverage tool watches the program while the tests run and records which lines (and which branches of each <code>if</code>) were executed. The usual tool in Python is the <code>coverage</code> package, used through the pytest plugin pytest-cov. Suppose the till had only one test, Asha's order:</p>
  <div class="fx" data-lang="py"># test_cov_one.py
from till import bill

def test_asha():
    assert bill([("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]) == 184</div>
  <div class="fx" data-lang="text">$ pytest -q test_cov_one.py --cov=till --cov-branch --cov-report=term-missing
.                                                                        [100%]
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.13.18-final-0 _______________

Name      Stmts   Miss Branch BrPart  Cover   Missing
-----------------------------------------------------
till.py      15      2      6      2    81%   13, 22
-----------------------------------------------------
TOTAL        15      2      6      2    81%
1 passed in 0.03s</div>
  <p>Read the report from left to right. <code>till.py</code> has 15 statements, and 2 of them never ran during the test (<code>Miss</code>). The <code>Branch</code> and <code>BrPart</code> columns count decisions: the file has 6 possible branch directions, and 2 were taken only partly (an <code>if</code> that only ever went one way). <code>Missing</code> names the lines: line 13 is <code>return 0</code>, the no-discount path, which Asha's ₹195 order never takes; line 22 is the <code>raise</code> that refuses negative quantities, which no test ever triggered. That is the real value of coverage: it pointed straight at two rules nobody had tested.</p>
  <p>There are two common measures. <strong>Line coverage</strong> (also called statement coverage) is the share of lines that ran. <strong>Branch coverage</strong> is stricter: every decision must have gone both ways. The difference matters for an <code>if</code> without an <code>else</code>. Picture <code>if express: fee *= 2</code> where every test uses express delivery: every line runs, so line coverage is 100%, but the "not express" path was never tried. Branch coverage reports that missed direction, which is why it is the better measure to switch on (<code>--cov-branch</code>).</p>
  <p>Now the crucial limit. Add tests for Ben (the no-discount path) and the negative quantity (the <code>raise</code>), then put the <code>&gt;</code> bug back into the discount rule:</p>
  <div class="fx" data-lang="py"># test_cov_more.py
import pytest
from till import bill

def test_asha():
    assert bill([("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]) == 184

def test_ben():
    assert bill([("masala chai", 1, 30), ("vada pav", 2, 20)]) == 74

def test_negative_qty():
    with pytest.raises(ValueError):
        bill([("samosa", -2, 15)])</div>
  <div class="fx" data-lang="text">$ pytest -q test_cov_more.py --cov=till --cov-branch --cov-report=term-missing
...                                                                      [100%]
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.13.18-final-0 _______________

Name      Stmts   Miss Branch BrPart  Cover   Missing
-----------------------------------------------------
till.py      15      0      6      0   100%
-----------------------------------------------------
TOTAL        15      0      6      0   100%
3 passed in 0.02s</div>
  <p>100% line coverage, 100% branch coverage, all tests green, and the till is still overcharging every ₹150 order. Every line ran and every branch went both ways, but no test ran the discount line <em>with a subtotal of exactly 150</em>. Coverage records which lines ran; it says nothing about whether the right inputs were used, or whether the results were checked at all. A test with no <code>assert</code> produces exactly the same report as a good one. A security guard's patrol log works the same way: it proves every corridor was walked, not that anyone looked inside the rooms.</p>
  <p>So use coverage to find untested code, then write real tests for it, and treat a coverage threshold in CI (say 80% on new code) as a floor, never as proof of quality. To measure test quality more directly there is <strong>mutation testing</strong> (tools such as mutmut): it makes small deliberate changes to your code, such as turning <code>&gt;=</code> into <code>&gt;</code>, runs the suite against each changed version, and reports every change that no test caught. Our <code>&gt;</code> bug is exactly the kind of "mutant" it would generate, and the suite above would let it survive.</p>

  <h2 id="pt-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>The most dangerous tests are the ones that pass no matter what. All four tests below are run against the till <em>with</em> the <code>&gt;</code> bug in it. Only one of them deserves to exist:</p>
  <div class="fx" data-lang="py"># test_mistakes.py
import pytest
from till import bill

FIVE_CHAI = [("masala chai", 5, 30)]          # subtotal exactly 150

def test_no_assert():
    bill(FIVE_CHAI)                           # runs the code, checks nothing

def test_expected_from_the_code():
    expected = bill(FIVE_CHAI)                # "expected" value computed by the code itself
    assert bill(FIVE_CHAI) == expected

def test_too_broad():
    with pytest.raises(Exception):            # any exception at all will do...
        bil(FIVE_CHAI)                        # ...including this NameError from a typo

def test_worked_out_by_hand():
    assert bill(FIVE_CHAI) == 142             # 150 - 15 = 135, + 5% = 141.75</div>
  <div class="fx" data-lang="text">$ pytest -q --tb=no -rA test_mistakes.py
...F                                                                     [100%]
=========================== short test summary info ============================
PASSED test_mistakes.py::test_no_assert
PASSED test_mistakes.py::test_expected_from_the_code
PASSED test_mistakes.py::test_too_broad
FAILED test_mistakes.py::test_worked_out_by_hand - AssertionError: assert 158...
1 failed, 3 passed in 0.01s</div>
  <p>Three of the four tests passed against broken code. <code>test_no_assert</code> runs <code>bill</code> but checks nothing, so it can only fail if the code crashes. <code>test_expected_from_the_code</code> computes its "expected" value by calling the code under test, so it compares the buggy answer, 158, with itself. <code>test_too_broad</code> expects "any exception" and gets one: a <code>NameError</code>, because <code>bil</code> is a typo, so the test passes without ever calling the till. Only the last test, with 142 worked out by hand, failed, which is exactly what a test should do when the code is wrong.</p>
  <p>The fix for each is short. Every test needs an <code>assert</code> on a value worked out by hand from the rules. An exception check should name the exact exception type and, ideally, part of its message (<code>pytest.raises(ValueError, match="non-negative")</code>). And every new test should be seen failing once, by breaking the code on purpose, before you trust it.</p>
  <p>The other common mistakes are about design rather than single tests. Hidden inputs such as the clock, unseeded randomness or a real network make tests flaky; pass them in instead. Tests that share mutable state (a module-level list that each test appends to) pass alone and fail in the full suite, or the reverse; give each test fresh data. Replacing your own logic with mocks makes tests pass while the logic is broken; replace only the external boundary (<a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a>). Comparing floats or model scores with <code>==</code> fails on harmless noise; use tolerances and thresholds. Fixing a bug without first writing a test that reproduces it lets the same bug return next month. And treating a coverage percentage as the goal produces many tests that run code without checking it.</p>

  <h2 id="pt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core definitions</h3>
  <ul>
    <li><b>Test</b>: code that runs your code on an input with a known correct answer and asserts the result.</li>
    <li><b>Regression</b>: behaviour that used to work, broken by a later change. Tests catch it right after the change.</li>
    <li><b>Test suite</b>: all a project's tests. <b>Test runner</b>: finds and runs them (pytest, unittest). <b>System under test</b>: the code being checked.</li>
    <li>Benefits: regression protection, safe refactoring, documentation that cannot go stale, pressure towards testable design.</li>
  </ul>
  <h3>Kinds of tests</h3>
  <table class="tbl">
    <tr><th>Kind</th><th>Scope</th><th>Speed</th><th>Catches</th></tr>
    <tr><td>Unit</td><td>One function/class, no real I/O</td><td>µs–ms</td><td>Logic bugs</td></tr>
    <tr><td>Integration</td><td>Code + real file/DB/service/module</td><td>ms–s</td><td>Wiring: formats, types, queries</td></tr>
    <tr><td>End-to-end</td><td>Whole system via its real interface</td><td>s–min</td><td>User-visible flows</td></tr>
    <tr><td>Regression</td><td>Any; pins a fixed bug</td><td>any</td><td>The bug returning</td></tr>
    <tr><td>Smoke</td><td>Shallow "does it start?" after deploy</td><td>s</td><td>Broken build or config</td></tr>
  </table>
  <h3>Pyramid and good tests</h3>
  <ul>
    <li>Pyramid: many unit, fewer integration, few E2E. Catch each bug at the cheapest level. Anti-pattern: <b>ice-cream cone</b>.</li>
    <li><b>FIRST</b>: Fast, Isolated, Repeatable, Self-checking, Timely.</li>
    <li><b>Arrange, Act, Assert</b>; one behaviour per test; the name states the behaviour.</li>
    <li><b>Flaky</b>: same code, different results (clock, randomness, network, order, shared state). Fix by passing those inputs in (<code>is_happy_hour(now)</code>), never by re-running.</li>
  </ul>
  <h3>Choosing cases</h3>
  <ul>
    <li><b>Equivalence partitioning</b>: one representative per group the code treats alike.</li>
    <li><b>Boundary value analysis</b>: both sides of every edge (₹145 and ₹150). Off-by-one bugs only show here.</li>
    <li>Edge cases: empty, single, zero, huge. Error paths: assert the specific exception and message.</li>
    <li>Expected values by hand; test public behaviour, not internals.</li>
  </ul>
  <h3>Data and ML code</h3>
  <ul>
    <li>Validate incoming batches: columns, nulls, ranges, types.</li>
    <li>Transforms: exact properties (mean 0, std 1, no NaN, row count, constant column handled).</li>
    <li>Seeds wherever randomness enters; assert train and test are disjoint (no leakage).</li>
    <li>Models: planted signal + tolerance, thresholds, never exact scores.</li>
    <li>Floats: <code>pytest.approx</code>, <code>np.testing.assert_allclose</code>, <code>pd.testing.assert_frame_equal</code>. <code>0.1 + 0.2 == 0.3</code> is <code>False</code>.</li>
  </ul>
  <h3>TDD and coverage</h3>
  <ul>
    <li>TDD: <b>red</b> (one failing test) → <b>green</b> (simplest pass) → <b>refactor</b> (stay green). Proves each test can fail.</li>
    <li>Line coverage: share of lines run. Branch coverage: every decision both ways (<code>--cov-branch</code>).</li>
    <li>Coverage finds untested code; 100% coverage with the <code>&gt;</code> bug still passed. Mutation testing checks whether tests catch small changes.</li>
  </ul>
  <div class="fx" data-lang="py">def test_exactly_150_gets_discount():          # Arrange, Act, Assert
    five_chai = [("masala chai", 5, 30)]       # arrange
    result = bill(five_chai)                   # act
    assert result == 142                       # assert, value worked out by hand

# pytest -q                                    run all tests
# pytest --cov=till --cov-branch --cov-report=term-missing</div>
  <h3>Gotchas</h3>
  <ul>
    <li>"I ran it and it looked fine" is not a test.</li>
    <li>No assert, or expected value computed by the code: the test can never fail.</li>
    <li><code>pytest.raises(Exception)</code> passes on typos; name the exact exception.</li>
    <li>Only typical inputs miss off-by-one bugs.</li>
    <li>100% coverage does not mean correct.</li>
  </ul>

  <h2 id="pt-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why write automated tests at all?</summary><div class="qa-body">To catch regressions seconds after the change that caused them, to make refactoring and library upgrades safe, and to document intended behaviour as runnable examples that cannot go out of date. Manual checks cover only the cases you remember to try, once. Automated tests also let CI check every push.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a regression?</summary><div class="qa-body">A bug in behaviour that used to work, introduced by a later change. For example, changing <code>&gt;=</code> to <code>&gt;</code> in a discount rule stops ₹150 orders getting their discount. A regression test pins the correct behaviour so the same break is caught immediately if it happens again.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a unit test and an integration test?</summary><div class="qa-body">A unit test checks one function or class on its own, with no real I/O, runs in milliseconds, and when it fails points straight at that unit. An integration test checks that pieces work together, or that your code works with real infrastructure such as files or a database. Integration tests catch wiring bugs, like amounts coming back from a CSV as strings, that unit tests cannot see.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are end-to-end tests and smoke tests?</summary><div class="qa-body">An end-to-end test drives the whole deployed system through its real interface, as a user would, such as placing an order on the website and checking the receipt. A smoke test is a quick, shallow check run right after a deployment that the system starts at all: the app boots, a health endpoint answers, the model file loads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the test pyramid.</summary><div class="qa-body">Keep many fast unit tests at the base, fewer integration tests in the middle and a few end-to-end tests at the top. Lower levels are faster, deterministic and give precise failures; higher levels are realistic but slow, flaky and vague when they fail. The rule is to catch each bug at the cheapest level that can catch it. The inverted "ice-cream cone" produces slow, flaky suites that people stop running.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes a good unit test?</summary><div class="qa-body">FIRST: fast, isolated from other tests, repeatable on any machine at any time, self-checking with asserts, and written at the same time as the code. Also an Arrange-Act-Assert layout, one behaviour per test, a name that states the behaviour, and expected values worked out by hand from the specification.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a flaky test, and how do you fix one?</summary><div class="qa-body">A test that passes and fails on the same code. Common causes are reading the real clock, unseeded randomness, real network calls, timing in async code, shared state between tests, and environment differences such as time zones. Fix the cause by passing time and randomness in as parameters, seeding, replacing external services with test doubles and giving each test fresh state. Re-running until green only hides it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose test cases for a function?</summary><div class="qa-body">Split inputs into groups the code should treat alike and test one representative per group (equivalence partitioning). Test both sides of every edge between groups (boundary value analysis), since off-by-one bugs live there. Add edge cases such as empty or single-element inputs, and error paths that must raise a specific exception. For a discount that starts at ₹150, test 145 and 150, not just 70 and 195.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must expected values be worked out by hand?</summary><div class="qa-body">If the expected value comes from running the code under test, the test compares the code with itself and can never fail, even when the code is wrong. Working the answer out from the specification is what lets a test disagree with buggy code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Should tests check implementation details, such as which helper functions were called?</summary><div class="qa-body">Generally no. Test observable behaviour through the public interface: return values, state changes, outputs. Tests tied to internals break on harmless refactors, so people stop trusting them. Checking calls is right at external boundaries where the call itself is the behaviour, such as "the payment gateway was charged once with the right amount".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>print(0.1 + 0.2 == 0.3)</code> print, and how should a test compare floats?</summary><div class="qa-body"><code>False</code>, because the sum is stored as 0.30000000000000004; most decimal fractions are not exact in binary. In tests use <code>pytest.approx</code>, <code>math.isclose</code>, or <code>np.testing.assert_allclose</code> for arrays. For money, avoid floats altogether with integer paise or <code>Decimal</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test code that uses randomness?</summary><div class="qa-body">Make the randomness an input: pass a seed or a random generator, and use a fixed seed in tests so the data repeats. Then assert properties that hold for any seed, such as sizes and disjoint train/test splits, and use tolerances or thresholds for statistical results. Never rely on unseeded global randomness inside the function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you test a data pipeline or feature-engineering code?</summary><div class="qa-body">Treat each transform as a pure function and test it on small hand-built tables: exact values, shape and row count, types, no NaN introduced, input not modified, and edge cases such as an empty frame or a constant column. Validate real incoming batches for columns, nulls and ranges. Add one integration test that runs the pipeline end to end on a small sample file.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test an ML model when its output is not exactly predictable?</summary><div class="qa-body">Test behaviour, not exact numbers. Train on synthetic data with a planted rule and check the model recovers it within a tolerance or beats a threshold; check output contracts such as probabilities between 0 and 1 that sum to 1; check a neural network can overfit a tiny batch. Full evaluation on held-out data is a separate pipeline step, not a unit test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is TDD, and when would you not use it?</summary><div class="qa-body">Test-driven development: write a small failing test (red), the simplest code that passes it (green), then tidy the code while the tests stay green (refactor). It guarantees every behaviour has a test and every test has been seen to fail. It fits poorly with exploratory work like notebooks or prototypes where the right behaviour is unknown; there, explore first and add tests before the code is shared. For bug fixes, always write the failing test first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does code coverage measure? Does 100% coverage mean the code is correct?</summary><div class="qa-body">It measures which lines (line coverage) or decision outcomes (branch coverage) ran during the tests. It does not mean correct: a test without asserts gives the same coverage, boundary inputs may never be used, and missing features are never "uncovered". A suite with 100% branch coverage can still miss a <code>&gt;=</code> versus <code>&gt;</code> bug. Use coverage to find untested code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Line coverage versus branch coverage?</summary><div class="qa-body">Line coverage counts executed statements. Branch coverage also requires every decision to go both ways: an <code>if</code> without an <code>else</code> that is always true in tests has full line coverage but a missed branch. Branch coverage is stricter and is the one to enable (<code>--cov-branch</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is mutation testing?</summary><div class="qa-body">A tool such as mutmut makes small changes to your code (<code>&gt;=</code> to <code>&gt;</code>, <code>+</code> to <code>-</code>, returning <code>None</code>) and runs the suite against each changed version. A change that no test catches reveals a weak spot. It measures whether tests actually check behaviour, which coverage cannot, but it is slow, so it is usually run on critical modules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your test suite takes 40 minutes and fails randomly. What would you do?</summary><div class="qa-body">Measure first: find the slowest tests (<code>pytest --durations=20</code>) and track which ones flake. Push checks down the pyramid by replacing slow end-to-end tests of pure logic with unit tests, replace real network calls with test doubles, and fix flaky causes such as time, randomness and shared state. Then run slow integration tests separately and run tests in parallel.</div></details>
</main>
`
});
