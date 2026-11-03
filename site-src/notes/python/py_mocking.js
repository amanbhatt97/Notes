// notes/python/py_mocking.js — Mocks & Test Doubles
Object.assign(TOPIC_CONTENT, {
  "py_mocking": `<main>
<h1>Mocks &amp; Test Doubles</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>Mocks &amp; Test Doubles</span></div>
  <p class="lead">Chai Corner's till now takes card and UPI payments: <code>checkout</code> bills the order and calls a payment <strong>gateway</strong> over the internet. Testing that for real is slow, flaky and costs money. A <strong>test double</strong> is a stand-in object that plays the gateway's part during a test. This note builds the idea up one need at a time: why we fake the outside world, the kinds of doubles (stub, fake, mock, spy), Python's <code>unittest.mock</code> (<code>Mock</code>, <code>MagicMock</code>, <code>autospec</code>), <code>return_value</code> and <code>side_effect</code>, <code>patch</code> and the famous "patch where it's used, not where it's defined" trap reproduced, asserting calls, pytest's <code>monkeypatch</code>, dependency injection as the cleaner alternative, and the over-mocking trap. Every run shown is real (Python 3.13, pytest 9.1; folder paths shortened to <code>~/chai</code>).</p>

  <h2 id="pmk-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Mocks &amp; Test Doubles</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why</div>
        <ul>
          <li>Real gateway: <b>slow</b> (2 s), <b>flaky</b> (network), <b>costly</b>, <b>non-repeatable</b></li>
          <li>Test <em>our</em> logic: ₹184 → 18400 paise → receipt</li>
          <li>💡 a stunt double for the dangerous scene</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Kinds of doubles</div>
        <ul>
          <li><b>Stub</b> — canned answer</li>
          <li><b>Fake</b> — small working version (in-memory gateway)</li>
          <li><b>Mock</b> — records calls, you assert on them</li>
          <li><b>Spy</b> — wraps the real thing and records</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">unittest.mock</div>
        <ul>
          <li><code>Mock()</code> — any attribute, any call</li>
          <li><code>MagicMock</code> — also <code>len</code>, <code>iter</code>, <code>with</code>…</li>
          <li><code>create_autospec</code> / <code>autospec=True</code> — real signature</li>
          <li><code>return_value</code>, <code>side_effect</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">patch</div>
        <ul>
          <li><code>with patch("checkout.charge") as fake:</code></li>
          <li>or <code>@patch(...)</code> → mock as argument</li>
          <li>⚠ <b>patch where it's used</b>: <code>from gateway import charge</code> → <code>"checkout.charge"</code></li>
          <li><code>import gateway</code> → <code>"gateway.charge"</code> works</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Asserting calls</div>
        <ul>
          <li><code>assert_called_once_with(18400, "tok_asha")</code></li>
          <li><code>assert_not_called()</code> — no money moved</li>
          <li><code>call_count</code>, <code>call_args</code>, <code>call_args_list</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cleaner designs</div>
        <ul>
          <li><b>monkeypatch</b> — setattr / setenv, auto-undo</li>
          <li><b>Dependency injection</b> — <code>Till(gateway)</code></li>
          <li>State check on a fake vs call check on a mock</li>
          <li>⚠ <b>Over-mocking</b>: mock edges only</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pmk-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Fake the Outside World</span><span class="rm-sub">A 2-second failing test</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-kinds"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Test Doubles</span><span class="rm-sub">Stub, fake, mock, spy</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-mock"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Mock &amp; MagicMock</span><span class="rm-sub">Ready-made doubles, autospec</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-se"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">return_value &amp; side_effect</span><span class="rm-sub">Timeouts and retries</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-patch"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">patch: Where to Patch</span><span class="rm-sub">The trap, reproduced</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-calls"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Asserting Calls</span><span class="rm-sub">Paise, not rupees</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-mp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">monkeypatch</span><span class="rm-sub">pytest's own swapper</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-di"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Dependency Injection</span><span class="rm-sub">Pass the gateway in</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-over"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Over-Mocking Trap</span><span class="rm-sub">A green test, a wrong bill</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Diagram + table</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Patching pitfalls</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pmk-why"><span class="num">01</span>Why Fake the Outside World</h2>
  <h3>The running example</h3>
  <p>The till from <a class="xref" data-note="py_pytest">Testing with pytest</a> (<code>till.py</code>: <code>bill(asha) == 184</code>, Ben 74, Chen 52) gains two modules. <code>gateway.py</code> talks to the bank. In real life it sends an HTTPS request; in this note's sandbox there is no bank, so it imitates one honestly: it waits 2 seconds like a network round-trip and then fails.</p>
  <div class="fx" data-lang="py"># gateway.py
"""Stand-in for the real UPI/card payment gateway.
In real life charge() sends an HTTPS request to the bank: slow, needs the
internet, and costs a fee per call. Here it imitates that: it waits 2 seconds
like a network round-trip and then fails, because this sandbox has no gateway."""
import time

def charge(amount_paise, card):
    print(f"  !! REAL gateway called: charging {amount_paise} paise to {card}")
    time.sleep(2)
    raise ConnectionError("pay.chaicorner.example: network unreachable")</div>
  <div class="fx" data-lang="py"># checkout.py
from gateway import charge          # copies the name 'charge' into THIS module
from till import bill

class PaymentFailed(Exception):
    pass

def checkout(lines, card):
    amount = bill(lines)                          # e.g. 184
    resp = charge(amount * 100, card)             # gateway wants paise: 18400
    if resp["status"] != "ok":
        raise PaymentFailed(resp.get("reason", "unknown"))
    return {"amount": amount, "txn": resp["txn_id"]}</div>
  <p>By hand, for Asha: <code>bill</code> = 184, the gateway is asked for 184 × 100 = 18400 paise, and if it answers <code>{"status": "ok", "txn_id": …}</code> the receipt is <code>{"amount": 184, "txn": …}</code>. That is <em>our</em> logic, and it is what we want to test. Here is the naive test:</p>
  <div class="fx" data-lang="py"># test_checkout_real.py
from checkout import checkout

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]

def test_checkout_asha():
    receipt = checkout(ASHA, card="tok_asha")
    assert receipt["amount"] == 184</div>
  <div class="fx" data-lang="text">$ pytest -q -s --tb=short test_checkout_real.py
  !! REAL gateway called: charging 18400 paise to tok_asha
F
=================================== FAILURES ===================================
______________________________ test_checkout_asha ______________________________
test_checkout_real.py:6: in test_checkout_asha
    receipt = checkout(ASHA, card="tok_asha")
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
checkout.py:9: in checkout
    resp = charge(amount * 100, card)             # gateway wants paise: 18400
           ^^^^^^^^^^^^^^^^^^^^^^^^^^
gateway.py:10: in charge
    raise ConnectionError("pay.chaicorner.example: network unreachable")
E   ConnectionError: pay.chaicorner.example: network unreachable
=========================== short test summary info ============================
FAILED test_checkout_real.py::test_checkout_asha - ConnectionError: pay.chaic...
1 failed in 2.01s</div>
  <p>Our billing logic is fine, yet the test failed, after 2 seconds, for a reason that has nothing to do with our code. With a real network it would pass some days and fail others, take seconds per test, cost a fee per run, and (worst) charge a real card. Every property that made the pytest suite useful (fast, independent, repeatable) is gone.</p>
  <table class="tbl"><caption>What the outside world does to a test</caption>
    <tr><th>Problem</th><th>Example at the till</th><th>Effect on tests</th></tr>
    <tr><td>Slow</td><td>2 s per gateway call</td><td>100 tests = minutes; people stop running them</td></tr>
    <tr><td>Unreliable</td><td>Wi-Fi drops, bank has an outage</td><td>Red for reasons unrelated to our code: "flaky"</td></tr>
    <tr><td>Costly / harmful</td><td>A fee per charge; real money moves</td><td>Can't run freely; may damage real data</td></tr>
    <tr><td>Uncontrollable</td><td>Can't make the bank time out on demand</td><td>Retry and error paths stay untested</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A film shoot uses a stunt double for the dangerous scene. From the camera's angle the double plays the part exactly as scripted, on cue, every take, and nobody risks the real actor. A test double is a stunt double for the gateway.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>system under test</strong> is the code we are checking (<code>checkout</code>). A <strong>dependency</strong> is something it calls that we don't want to test right now (the gateway). A <strong>test double</strong> is any object that replaces a dependency during a test.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Just retry the flaky test" hides the problem. A test that is red one run in ten trains everyone to ignore red. Remove the outside world from unit tests; test the real integration separately, deliberately, in a sandbox account.</p></div>

  <h2 id="pmk-kinds"><span class="num">02</span>Test Doubles: Stub, Fake, Mock, Spy</h2>
  <p>Before any library, write two doubles by hand. A <strong>stub</strong> just answers. A <strong>fake</strong> is a small working version with simple rules (here: cards starting <code>tok_bad</code> are declined) that remembers what happened. To use them we rebind the name <code>checkout.charge</code>, and put the real one back in a <code>finally</code> so other code is never left with a stand-in.</p>
  <div class="fx" data-lang="py"># doubles.py
import checkout, gateway

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]

# a STUB: always the same canned answer, remembers nothing
def stub_charge(amount_paise, card):
    return {"status": "ok", "txn_id": "T-001"}

# a FAKE: a small, working, in-memory gateway with real (simple) rules
class FakeGateway:
    def __init__(self):
        self.charges = []                       # what was charged, in order
    def charge(self, amount_paise, card):
        if card.startswith("tok_bad"):
            return {"status": "declined", "reason": "insufficient funds"}
        self.charges.append((amount_paise, card))
        return {"status": "ok", "txn_id": f"T-{len(self.charges):03d}"}

# swap by hand: rebind the name checkout.charge, and ALWAYS put it back
checkout.charge = stub_charge
try:
    print("stub:", checkout.checkout(ASHA, "tok_asha"))
finally:
    checkout.charge = gateway.charge

fake = FakeGateway()
checkout.charge = fake.charge
try:
    print("fake:", checkout.checkout(ASHA, "tok_asha"))
    print("fake:", checkout.checkout([("samosa", 2, 15)], "tok_ben"))
    print("fake remembers:", fake.charges)
    checkout.checkout(ASHA, "tok_bad_card")
except checkout.PaymentFailed as e:
    print("declined -&gt;", repr(e))
finally:
    checkout.charge = gateway.charge
print("restored:", checkout.charge is gateway.charge)</div>
  <div class="fx" data-lang="text">stub: {'amount': 184, 'txn': 'T-001'}
fake: {'amount': 184, 'txn': 'T-001'}
fake: {'amount': 32, 'txn': 'T-002'}
fake remembers: [(18400, 'tok_asha'), (3200, 'tok_ben')]
declined -&gt; PaymentFailed('insufficient funds')
restored: True</div>
  <p>Trace it. With the stub, <code>checkout</code> computed 184, called "charge", got "ok" instantly, and built the receipt: our logic ran for real, only the gateway was fake. With the fake, two samosas billed 30 + 1.5 = 31.5 → ₹32, charged as 3200 paise, and the fake recorded both charges; the "bad" card was declined and our <code>PaymentFailed</code> path ran, which the real gateway would never let us trigger on demand. No network, no waiting.</p>
  <table class="tbl"><caption>The family of test doubles</caption>
    <tr><th>Double</th><th>What it does</th><th>You check</th><th>Gateway example</th></tr>
    <tr><td><b>Dummy</b></td><td>Fills a parameter, never used</td><td>nothing</td><td><code>card=None</code> where the card is ignored</td></tr>
    <tr><td><b>Stub</b></td><td>Returns canned answers</td><td>your code's result</td><td>always <code>{"status": "ok"}</code></td></tr>
    <tr><td><b>Fake</b></td><td>Working lightweight implementation</td><td>the fake's <em>state</em> afterwards</td><td>in-memory gateway with a <code>charges</code> list</td></tr>
    <tr><td><b>Mock</b></td><td>Records every call; answers as told</td><td>the <em>calls</em> it received</td><td>"was charge called once with 18400?"</td></tr>
    <tr><td><b>Spy</b></td><td>Wraps the real object and records calls</td><td>calls, while real behaviour runs</td><td><code>Mock(wraps=real_charge)</code></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Rehearsing a play without the lead actor. A cardboard cut-out (dummy) just stands there; a stand-in reading the lines (stub) gives the cues; an understudy who knows the whole part (fake) can act whole scenes; a stage manager taking notes on every cue (mock) can tell you afterwards who said what, when.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Stub</strong>: returns predefined data. <strong>Fake</strong>: a simplified but working implementation (in-memory DB, fake gateway). <strong>Mock</strong>: a double that records interactions so the test can verify them. <strong>Spy</strong>: records calls while delegating to the real object. Checking a fake's state is <strong>state verification</strong>; checking a mock's calls is <strong>behaviour verification</strong>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Swapping by hand without <code>finally</code>: if the test fails between the swap and the restore, every later test silently uses the stub. That is why the tools in sections 05 and 07 exist: they always undo the swap.</p></div>

  <h2 id="pmk-mock"><span class="num">03</span>Mock and MagicMock</h2>
  <p><code>unittest.mock.Mock</code> is an object that accepts any call and any attribute. Calling it returns <code>return_value</code>; every call is recorded in <code>call_count</code>, <code>call_args</code> and <code>call_args_list</code>. Any attribute you touch is created on the spot as another Mock. <code>MagicMock</code> is the same plus Python's "magic" methods (<code>__len__</code>, <code>__iter__</code>, <code>__enter__</code>…, see <a class="xref" data-note="py_dunder">Dunder Methods</a>), so it can stand in for lists, files and context managers.</p>
  <div class="fx" data-lang="py"># mock_basics.py
from unittest.mock import Mock, MagicMock, create_autospec
from gateway import charge

pay = Mock(return_value={"status": "ok", "txn_id": "T-001"})
print(pay(18400, "tok_asha"))          # canned answer
print(pay.call_count, pay.call_args)   # and a record of the call
print(pay.chrage)                      # a typo... is silently accepted!

try:
    len(Mock())
except TypeError as e:
    print("Mock:", e)
print("MagicMock len:", len(MagicMock()))   # MagicMock also fakes __len__, __iter__, ...

safe = create_autospec(charge, return_value={"status": "ok", "txn_id": "T-002"})
print(safe(18400, card="tok_asha"))
try:
    safe(18400)                        # the real charge() needs a card
except TypeError as e:
    print("autospec:", e)</div>
  <div class="fx" data-lang="text">{'status': 'ok', 'txn_id': 'T-001'}
1 call(18400, 'tok_asha')
&lt;Mock name='mock.chrage' id='140415849525136'&gt;
Mock: object of type 'Mock' has no len()
MagicMock len: 0
{'status': 'ok', 'txn_id': 'T-002'}
autospec: missing a required argument: 'card'</div>
  <p>Line by line: the call returned the canned dict; the mock recorded one call with <code>(18400, 'tok_asha')</code>. <code>pay.chrage</code>, a typo for "charge", did not raise: Mock invented a child mock. That flexibility is the danger: code calling a method that doesn't exist on the real gateway would pass its tests. <code>len(Mock())</code> fails because plain Mock doesn't support magic methods; <code>MagicMock</code> returns 0. <code>create_autospec(charge)</code> builds a mock with the real function's signature, so calling it without a <code>card</code> is rejected exactly as the real one would.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A Mock is an actor who will improvise any line you throw at them. Great for rehearsal, dangerous if the script has typos: they'll happily answer to "Mr. Chrage". An autospec mock has learned the real script and stops you when you go off it.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>Mock(**kw)</code>: callable double; unknown attributes become child mocks; calls are recorded. <code>MagicMock</code>: Mock with magic methods preconfigured. <code>create_autospec(obj)</code> / <code>patch(..., autospec=True)</code>: a mock constrained to <code>obj</code>'s attributes and call signatures. <code>Mock(spec=Cls)</code> restricts attributes only.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Plain mocks drift away from reality. If the gateway's <code>charge</code> gains a required argument, every test using a plain Mock stays green while production breaks. Section 05 shows this happening, and <code>autospec=True</code> catching it.</p></div>

  <h2 id="pmk-se"><span class="num">04</span>return_value and side_effect</h2>
  <p><code>return_value</code> gives the same answer on every call. <code>side_effect</code> overrides it and comes in three flavours: an <b>exception</b> (every call raises it), an <b>iterable</b> (one item per call; exception items are raised), or a <b>function</b> (called with the same arguments; its result is returned).</p>
  <div class="fx" data-lang="py"># side_effects.py
from unittest.mock import Mock

ok = {"status": "ok", "txn_id": "T-007"}

# 1. an exception: every call raises it
down = Mock(side_effect=TimeoutError("gateway slow"))
try:
    down(18400, "tok_asha")
except TimeoutError as e:
    print("1.", repr(e))

# 2. an iterable: one item per call; exceptions in it are raised
flaky = Mock(side_effect=[TimeoutError("slow"), ok])
for _ in range(2):
    try:
        print("2.", flaky(18400, "tok_asha"))
    except TimeoutError as e:
        print("2. raised", repr(e))

# 3. a function: computes the answer from the arguments
def by_card(amount_paise, card):
    return {"status": "declined" if card == "tok_bad" else "ok", "txn_id": "T-1"}
smart = Mock(side_effect=by_card)
print("3.", smart(5200, "tok_chen")["status"], smart(5200, "tok_bad")["status"])</div>
  <div class="fx" data-lang="text">1. TimeoutError('gateway slow')
2. raised TimeoutError('slow')
2. {'status': 'ok', 'txn_id': 'T-007'}
3. ok declined</div>
  <h3>Testing the retry</h3>
  <p>The retry function added to <code>checkout.py</code>:</p>
  <div class="fx" data-lang="py">def checkout_with_retry(lines, card, attempts=3):
    """Gateways time out now and then: try again, up to \`attempts\` times."""
    for attempt in range(1, attempts + 1):
        try:
            return checkout(lines, card)
        except (ConnectionError, TimeoutError):
            if attempt == attempts:
                raise                             # out of tries: let it propagate</div>
  <p>Trace by hand with <code>side_effect=[TimeoutError, ok]</code>: attempt 1 → charge raises TimeoutError → caught, 1 ≠ 3 so loop; attempt 2 → charge returns ok → receipt returned. Calls: 2. With <code>side_effect=TimeoutError</code> (always): attempts 1, 2 caught; attempt 3 re-raises. Calls: 3.</p>
  <div class="fx" data-lang="py"># test_retry.py
from unittest.mock import patch
import pytest
from checkout import checkout_with_retry

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]

def test_retry_after_one_timeout():
    with patch("checkout.charge") as fake:
        fake.side_effect = [TimeoutError("slow"), {"status": "ok", "txn_id": "T-9"}]
        assert checkout_with_retry(ASHA, "tok_asha") == {"amount": 184, "txn": "T-9"}
        assert fake.call_count == 2

def test_gives_up_after_three_timeouts():
    with patch("checkout.charge", side_effect=TimeoutError("slow")) as fake:
        with pytest.raises(TimeoutError):
            checkout_with_retry(ASHA, "tok_asha")
        assert fake.call_count == 3</div>
  <div class="fx" data-lang="text">$ pytest -q test_retry.py
..                                                                       [100%]
2 passed in 0.04s</div>
  <p>Both paths of the retry logic, tested in 0.04 s, with a timeout produced exactly when we wanted it. (<code>patch("checkout.charge")</code> is how the mock got into <code>checkout</code>; the next section explains why that exact string.)</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cricket bowling machine. <code>return_value</code> bowls the same ball every time; <code>side_effect</code> is the programmed over: a bouncer, then a yorker, then a full toss, so the batter (your code) can practise every case on cue.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>mock.return_value</code>: the value every call returns. <code>mock.side_effect</code>: an exception (class or instance) to raise, an iterable of successive results (raising <code>StopIteration</code> when exhausted), or a callable whose return value becomes the result. If set, <code>side_effect</code> wins over <code>return_value</code> (unless the callable returns <code>mock.DEFAULT</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A <code>side_effect</code> list shorter than the number of calls ends with <code>StopIteration</code>, a confusing error far from the cause. Give exactly as many items as calls you expect, and assert <code>call_count</code>.</p></div>

  <h2 id="pmk-patch"><span class="num">05</span>patch: Patch Where It's Used</h2>
  <p><code>unittest.mock.patch("module.name")</code> temporarily rebinds <code>name</code> inside <code>module</code> to a MagicMock (or to <code>new=</code> whatever you give), and restores the original when the <code>with</code> block or decorated test ends. It is a context manager and a decorator in one. The question is which module.</p>
  <h3>The trap, reproduced</h3>
  <div class="fx" data-lang="py"># test_patch_where.py
from unittest.mock import patch
from checkout import checkout

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
OK = {"status": "ok", "txn_id": "T-1"}

def test_patch_where_defined():
    with patch("gateway.charge", return_value=OK):      # where charge is DEFINED
        assert checkout(ASHA, "tok_asha")["amount"] == 184

def test_patch_where_used():
    with patch("checkout.charge", return_value=OK):     # where checkout LOOKS IT UP
        assert checkout(ASHA, "tok_asha")["amount"] == 184</div>
  <div class="fx" data-lang="text">$ pytest -q -s --tb=line test_patch_where.py
  !! REAL gateway called: charging 18400 paise to tok_asha
F.
=================================== FAILURES ===================================
E   ConnectionError: pay.chaicorner.example: network unreachable
~/chai/gateway.py:10: ConnectionError: pay.chaicorner.example: network unreachable
=========================== short test summary info ============================
FAILED test_patch_where.py::test_patch_where_defined - ConnectionError: pay.c...
1 failed, 1 passed in 2.03s</div>
  <p>The first test patched <code>gateway.charge</code>, yet the <em>real</em> gateway was called (the "!! REAL" line, the 2 seconds, the ConnectionError). The second passed instantly. Why? Look at what each name points to while <code>gateway.charge</code> is patched:</p>
  <div class="fx" data-lang="py">import gateway, checkout
from unittest.mock import patch
with patch('gateway.charge') as m:
    print('gateway.charge  -&gt;', gateway.charge is m)
    print('checkout.charge -&gt;', checkout.charge is m, '| still the real one:', checkout.charge.__module__ + '.' + checkout.charge.__name__)</div>
  <div class="fx" data-lang="text">gateway.charge  -&gt; True
checkout.charge -&gt; False | still the real one: gateway.charge</div>
  <p><code>from gateway import charge</code> ran once, when <code>checkout</code> was imported. It created a <em>new name</em> <code>charge</code> inside the <code>checkout</code> module, pointing at the same function object (names are labels on objects: <a class="xref" data-note="py_values">Values</a>; imports bind names: <a class="xref" data-note="py_modules">Modules</a>). From then on <code>checkout()</code> looks up <code>checkout.charge</code>. Patching <code>gateway.charge</code> moved the label in the gateway module; the label in the checkout module still points at the real function.</p>
  <figure class="viz"><svg viewBox="0 0 560 175" width="560">
    <defs><marker id="pmk-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="18" width="170" height="52" rx="6" class="fs"/><text x="20" y="38">module gateway</text><text x="20" y="58" class="tr">charge → MagicMock</text>
    <rect x="10" y="104" width="170" height="52" rx="6" class="fs"/><text x="20" y="124">module checkout</text><text x="20" y="144" class="tb">charge → real charge</text>
    <rect x="380" y="62" width="170" height="50" rx="6" class="fb sb"/><text x="392" y="84">real charge()</text><text x="392" y="102" class="tm">function object</text>
    <line x1="180" y1="130" x2="376" y2="96" class="sb" stroke-width="2" marker-end="url(#pmk-ah1)"/>
    <text x="196" y="160" class="tm">"from gateway import charge" copied this arrow</text>
    <text x="196" y="40" class="tm">patch("gateway.charge") moved only this one</text>
  </svg><figcaption>Two modules, two names for one function. patch("gateway.charge") rebinds the name in the top box; checkout() reads the name in the bottom box, which still points at the real function.</figcaption></figure>
  <h3>When "where it's defined" does work</h3>
  <p>If the code imports the <em>module</em> and looks the function up through it at every call, then the module attribute <em>is</em> where it's used:</p>
  <div class="fx" data-lang="py"># checkout_v2.py
import gateway                      # keeps a reference to the MODULE, not the function
from till import bill

def checkout(lines, card):
    amount = bill(lines)
    resp = gateway.charge(amount * 100, card)   # looks up gateway.charge at every call
    return {"amount": amount, "txn": resp["txn_id"]}</div>
  <div class="fx" data-lang="py"># test_patch_v2.py
from unittest.mock import patch
from checkout_v2 import checkout

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]

@patch("gateway.charge", return_value={"status": "ok", "txn_id": "T-1"})
def test_module_style_import(fake):               # decorator form: mock arrives as an argument
    assert checkout(ASHA, "tok_asha") == {"amount": 184, "txn": "T-1"}
    fake.assert_called_once_with(18400, "tok_asha")</div>
  <div class="fx" data-lang="text">$ pytest -q -s test_patch_v2.py
.
1 passed in 0.03s</div>
  <p>No "!! REAL" line: the mock was used. The rule never changes: <strong>patch the name the code under test looks up, at the moment it looks it up.</strong> <code>from x import f</code> → patch <code>"yourmodule.f"</code>; <code>import x</code> + <code>x.f()</code> → patch <code>"x.f"</code>.</p>
  <h3>autospec: catching a changed signature</h3>
  <p>The bank updates its API: <code>charge</code> now needs an <code>idempotency_key</code> (so a retried charge isn't taken twice). Our <code>checkout</code> hasn't been updated. Two tests, one with a plain mock and one with <code>autospec=True</code>:</p>
  <div class="fx" data-lang="py"># test_autospec.py
from unittest.mock import patch
from checkout import checkout

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
OK = {"status": "ok", "txn_id": "T-1"}

def test_plain_mock():
    with patch("checkout.charge", return_value=OK):
        assert checkout(ASHA, "tok_asha")["amount"] == 184

def test_autospec_mock():
    with patch("checkout.charge", autospec=True, return_value=OK):
        assert checkout(ASHA, "tok_asha")["amount"] == 184</div>
  <div class="fx" data-lang="text">$ pytest -q test_autospec.py              # before the bank's change
..                                                                       [100%]
2 passed in 0.05s
# gateway.py now: def charge(amount_paise, card, idempotency_key):
$ pytest -q --tb=line test_autospec.py
.F                                                                       [100%]
=================================== FAILURES ===================================
E   TypeError: missing a required argument: 'idempotency_key'
/usr/lib/python3.13/inspect.py:3229: TypeError: missing a required argument: 'idempotency_key'
=========================== short test summary info ============================
FAILED test_autospec.py::test_autospec_mock - TypeError: missing a required a...
1 failed, 1 passed in 0.04s</div>
  <p>The plain mock stayed green while production would crash; the autospec mock failed with exactly the error production would raise.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two offices each keep a phone list. When the supplier changes number, you update the supplier's own card, but the checkout office still dials the number it copied onto its list. To redirect checkout's calls, change <em>checkout's</em> list.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>patch(target, new=DEFAULT, autospec=None, **kw)</code>: <code>target</code> is the dotted path <code>"package.module.name"</code> to rebind; by default the replacement is a <code>MagicMock</code> configured with <code>**kw</code> (e.g. <code>return_value</code>). Usable as <code>with patch(...) as m:</code>, as <code>@patch(...)</code> (mock passed as an extra argument, bottom decorator first), or via <code>patch.object(obj, "attr")</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Patching where a function is defined instead of where it is looked up. Symptom: the "mocked" test is slow, hits the network, or the mock's <code>call_count</code> is 0. Fix: patch <code>"module_under_test.name"</code>.</p></div>

  <h2 id="pmk-calls"><span class="num">06</span>Asserting Calls</h2>
  <p>A mock records every call. You can read the record (<code>call_count</code>, <code>call_args</code>, <code>call_args_list</code>) or use its assertion methods, which raise with a clear message on mismatch.</p>
  <div class="fx" data-lang="py"># test_calls.py
from unittest.mock import patch, call
import pytest
from checkout import checkout, checkout_with_retry

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
OK = {"status": "ok", "txn_id": "T-1"}

def test_charges_asha_in_paise():
    with patch("checkout.charge", return_value=OK) as fake:
        checkout(ASHA, "tok_asha")
    fake.assert_called_once_with(18400, "tok_asha")      # ₹184 = 18400 paise

def test_bad_order_never_reaches_the_gateway():
    with patch("checkout.charge") as fake:
        with pytest.raises(ValueError):
            checkout([("samosa", -1, 15)], "tok_ben")
    fake.assert_not_called()                             # no money moved

def test_retry_calls_with_same_arguments():
    with patch("checkout.charge", side_effect=[TimeoutError, OK]) as fake:
        checkout_with_retry(ASHA, "tok_asha")
    assert fake.call_args_list == [call(18400, "tok_asha"), call(18400, "tok_asha")]</div>
  <div class="fx" data-lang="text">$ pytest -q test_calls.py
...                                                                      [100%]
3 passed in 0.03s</div>
  <p>Now introduce the bug: someone "simplifies" <code>checkout</code> to <code>charge(amount, card)</code>, forgetting the × 100.</p>
  <div class="fx" data-lang="text">$ pytest -q --tb=line test_calls.py::test_charges_asha_in_paise
F                                                                        [100%]
=================================== FAILURES ===================================
E   AssertionError: expected call not found.
    Expected: charge(18400, 'tok_asha')
      Actual: charge(184, 'tok_asha')
/usr/lib/python3.13/unittest/mock.py:979: AssertionError: expected call not found.
=========================== short test summary info ============================
FAILED test_calls.py::test_charges_asha_in_paise - AssertionError: expected c...
1 failed in 0.06s</div>
  <p>Expected vs actual, side by side: 18400 vs 184. The receipt would still have said ₹184, so only the call check could catch it.</p>
  <table class="tbl"><caption>Call-checking tools</caption>
    <tr><th>Tool</th><th>Passes when</th></tr>
    <tr><td><code>m.assert_called()</code> / <code>assert_called_once()</code></td><td>Called at least once / exactly once</td></tr>
    <tr><td><code>m.assert_called_with(*a, **k)</code></td><td>The <em>last</em> call had these arguments</td></tr>
    <tr><td><code>m.assert_called_once_with(*a, **k)</code></td><td>Exactly one call, with these arguments</td></tr>
    <tr><td><code>m.assert_any_call(*a, **k)</code></td><td>Some call had these arguments</td></tr>
    <tr><td><code>m.assert_not_called()</code></td><td>Never called</td></tr>
    <tr><td><code>m.call_count</code>, <code>m.call_args</code>, <code>m.call_args_list == [call(...), ...]</code></td><td>Read the record yourself</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>The bank statement versus the receipt. The customer's receipt (return value) can say ₹184 while the statement (the calls) shows ₹1.84 was taken. Asserting calls is reading the statement.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Behaviour verification</strong>: asserting on the interactions between the code under test and a dependency (which calls, with which arguments, how many times), as opposed to <strong>state verification</strong> (asserting on results or on a fake's state).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Misspelt assertion methods once passed silently by creating a child mock. Python 3 now refuses them: <code>Mock().assert_called_once_wiht(1)</code> raises <code>AttributeError: 'assert_called_once_wiht' is not a valid assertion</code>. But a misspelt <em>non-assert</em> attribute (<code>pay.chrage</code>) is still accepted, so use <code>autospec</code> and see each test fail once.</p></div>

  <h2 id="pmk-mp"><span class="num">07</span>monkeypatch: pytest's Swapper</h2>
  <p>The built-in <code>monkeypatch</code> fixture (from <a class="xref" data-note="py_pytest">pytest fixtures</a>) offers <code>setattr(obj, "name", value)</code>, <code>setenv</code>/<code>delenv</code>, <code>setitem</code>, <code>chdir</code> and more. Every change is reverted when the test ends, pass or fail. The "where it's used" rule is the same: set the attribute on the module that looks it up.</p>
  <div class="fx" data-lang="py"># test_monkeypatch.py
import checkout, gateway

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]

def test_with_monkeypatch(monkeypatch):
    seen = []
    def fake_charge(amount_paise, card):          # a plain function as the double
        seen.append((amount_paise, card))
        return {"status": "ok", "txn_id": "T-5"}
    monkeypatch.setattr(checkout, "charge", fake_charge)      # same rule: where it's used
    monkeypatch.setenv("CHAI_GATEWAY_KEY", "test-key")        # env vars too
    assert checkout.checkout(ASHA, "tok_asha")["txn"] == "T-5"
    assert seen == [(18400, "tok_asha")]

def test_runs_after_and_sees_the_real_one():
    import os
    assert checkout.charge is gateway.charge                  # undone automatically
    assert "CHAI_GATEWAY_KEY" not in os.environ</div>
  <div class="fx" data-lang="text">$ pytest -q test_monkeypatch.py
..                                                                       [100%]
2 passed in 0.01s</div>
  <p>The second test proves the cleanup: after the first test, <code>checkout.charge</code> is the real function again and the env var is gone. That is the hand-written <code>try/finally</code> of section 02, done for you.</p>
  <table class="tbl">
    <tr><th></th><th><code>unittest.mock.patch</code></th><th><code>monkeypatch</code></th></tr>
    <tr><td>Comes from</td><td>Standard library</td><td>pytest fixture</td></tr>
    <tr><td>Default replacement</td><td>A MagicMock (records calls)</td><td>Whatever you pass</td></tr>
    <tr><td>Target</td><td>Dotted string <code>"checkout.charge"</code></td><td>Object + name: <code>(checkout, "charge")</code></td></tr>
    <tr><td>Env vars, dict items, cwd</td><td><code>patch.dict(os.environ, ...)</code></td><td><code>setenv</code>, <code>setitem</code>, <code>chdir</code></td></tr>
    <tr><td>Undo</td><td>End of <code>with</code>/decorated function</td><td>End of the test</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hotel room: you can move the furniture during your stay, and housekeeping puts everything back after checkout, whatever state you left it in.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Monkeypatching</strong> is changing an attribute of a module, class or object at runtime. pytest's <code>monkeypatch</code> fixture records each change and reverts it at teardown.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Monkeypatching outside a test (in a module's import code or a helper) has no automatic undo and leaks into every later test. Keep swaps inside fixtures or tests.</p></div>

  <h2 id="pmk-di"><span class="num">08</span>Dependency Injection: the Cleaner Alternative</h2>
  <p><strong>Dependency injection (DI)</strong>: instead of a function importing its dependency, the dependency is passed in, as a parameter or (as here) when an object is created. The code says "give me something with a <code>.charge(amount_paise, card)</code> method"; production passes the real gateway, tests pass a fake. No patch strings, no import tricks.</p>
  <div class="fx" data-lang="py"># till_app.py
from till import bill

class PaymentFailed(Exception):
    pass

class Till:
    """The gateway is passed IN (dependency injection) instead of imported."""
    def __init__(self, gateway):
        self.gateway = gateway

    def checkout(self, lines, card):
        amount = bill(lines)
        resp = self.gateway.charge(amount * 100, card)
        if resp["status"] != "ok":
            raise PaymentFailed(resp.get("reason", "unknown"))
        return {"amount": amount, "txn": resp["txn_id"]}</div>
  <div class="fx" data-lang="py"># fakes.py
class FakeGateway:
    """In-memory gateway: real rules, no network, remembers every charge."""
    def __init__(self):
        self.charges = []
    def charge(self, amount_paise, card):
        if card.startswith("tok_bad"):
            return {"status": "declined", "reason": "insufficient funds"}
        self.charges.append((amount_paise, card))
        return {"status": "ok", "txn_id": f"T-{len(self.charges):03d}"}</div>
  <div class="fx" data-lang="py"># test_till_app.py
import pytest
from till_app import Till, PaymentFailed
from fakes import FakeGateway

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
BEN  = [("masala chai", 1, 30), ("vada pav", 2, 20)]

@pytest.fixture
def gateway():
    return FakeGateway()

@pytest.fixture
def till(gateway):
    return Till(gateway)                  # no patch: we simply hand the fake in

def test_two_customers(till, gateway):
    till.checkout(ASHA, "tok_asha")
    till.checkout(BEN, "tok_ben")
    assert gateway.charges == [(18400, "tok_asha"), (7400, "tok_ben")]   # check STATE

def test_declined_card(till, gateway):
    with pytest.raises(PaymentFailed, match="insufficient"):
        till.checkout(BEN, "tok_bad_card")
    assert gateway.charges == []</div>
  <div class="fx" data-lang="text">$ pytest -q test_till_app.py
..                                                                       [100%]
2 passed in 0.01s</div>
  <p>Read the first test as a story: Asha pays 18400 paise, Ben 7400 (₹74), in that order. It checks the fake's <em>state</em> (what was charged), not which methods were called, so it survives refactors of <code>Till</code>'s internals. And production wiring is one line: the real <code>gateway</code> module has a <code>charge</code> function, so it fits the same slot:</p>
  <div class="fx" data-lang="py">from till_app import Till; import gateway
print(Till(gateway).checkout([('samosa', 1, 15)], 'tok_x'))</div>
  <div class="fx" data-lang="text">  !! REAL gateway called: charging 1600 paise to tok_x
...
ConnectionError: pay.chaicorner.example: network unreachable</div>
  <p>(Real gateway, real 2-second wait, real failure in this sandbox: the production path is untouched by the testing design.)</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A mixer-grinder with a detachable jar. You don't rewire the motor to grind chutney instead of masala; you click in a different jar. DI makes the gateway a detachable jar; patching is rewiring the motor for each test.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Dependency injection</strong>: a component receives its collaborators from outside (constructor or function parameters) rather than creating or importing them itself. Tests inject doubles; production injects real implementations. pytest fixtures are themselves DI for tests.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A fake that drifts from the real thing (the real gateway starts returning <code>"status": "OK"</code> in capitals) gives false confidence. Keep fakes tiny, share one fake across tests, and run a few integration tests against the bank's sandbox to keep the fake honest.</p></div>

  <h2 id="pmk-over"><span class="num">09</span>The Over-Mocking Trap</h2>
  <p>Here is a test that patches both the gateway <em>and</em> our own <code>bill</code>:</p>
  <div class="fx" data-lang="py"># test_overmocked.py
from unittest.mock import patch
from checkout import checkout

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]

@patch("checkout.charge", return_value={"status": "ok", "txn_id": "T-1"})
@patch("checkout.bill", return_value=184)               # mocking our OWN logic too
def test_checkout_overmocked(fake_bill, fake_charge):
    assert checkout(ASHA, "tok_asha") == {"amount": 184, "txn": "T-1"}
    fake_bill.assert_called_once_with(ASHA)
    fake_charge.assert_called_once_with(18400, "tok_asha")</div>
  <p>Now a real bug: someone types the discount as 1% instead of 10% (and <code>&gt;</code> for <code>&gt;=</code>). By hand: 195 − 1.95 = 193.05, × 1.05 = 202.70 → Asha is charged ₹203 instead of ₹184. Run the over-mocked test and the DI test from section 08 against the buggy till:</p>
  <div class="fx" data-lang="text">$ python3 -c "from till import bill; print(bill([('masala chai', 2, 30), ('samosa', 3, 15), ('cold coffee', 1, 90)]))"
203
$ pytest -q --tb=line test_overmocked.py test_till_app.py
.F.                                                                      [100%]
=================================== FAILURES ===================================
E   AssertionError: assert [(20300, 'tok...0, 'tok_ben')] == [(18400, 'tok...0, 'tok_ben')]

      At index 0 diff: (20300, 'tok_asha') != (18400, 'tok_asha')
      Use -v to get more diff
~/chai/test_till_app.py:19: AssertionError: assert [(20300, 'tok...0, 'tok_ben')] == [(18400, 'tok...0, 'tok_ben')]
=========================== short test summary info ============================
FAILED test_till_app.py::test_two_customers - AssertionError: assert [(20300,...
1 failed, 2 passed in 0.04s</div>
  <p>The first dot is the over-mocked test: <strong>green</strong>, while Asha is overcharged by ₹19. It only checked that <code>checkout</code> passes a mocked 184 to a mocked gateway. The DI test with a fake gateway and the <em>real</em> <code>bill</code> caught it: 20300 paise charged instead of 18400.</p>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <rect x="10" y="20" width="130" height="44" rx="6" class="fb sb"/><text x="22" y="47">checkout()</text>
    <rect x="200" y="20" width="130" height="44" rx="6" class="fg sg"/><text x="212" y="40">bill()</text><text x="212" y="56" class="tm">our logic: keep REAL</text>
    <rect x="420" y="20" width="170" height="44" rx="6" class="fr sr"/><text x="432" y="40">gateway.charge()</text><text x="432" y="56" class="tm">outside world: DOUBLE</text>
    <line x1="140" y1="42" x2="198" y2="42" stroke="currentColor" stroke-width="1.5"/>
    <line x1="330" y1="42" x2="418" y2="42" stroke="currentColor" stroke-width="1.5"/>
    <line x1="375" y1="10" x2="375" y2="80" stroke="currentColor" stroke-dasharray="5 4"/>
    <text x="300" y="100" class="tm">mock at the boundary (dashed line):</text>
    <text x="300" y="118" class="tm">network, database, clock, randomness, paid APIs</text>
  </svg><figcaption>Draw a line where your code meets the outside world. Doubles go on the far side of it; everything on your side runs for real.</figcaption></figure>
  <div class="cards">
    <div><b>Mock these</b><p>Payment gateway, HTTP APIs, email/SMS, the clock (<code>datetime.now</code>), randomness, slow or paid services.</p></div>
    <div><b>Keep these real</b><p>Your own functions (<code>bill</code>, <code>discount</code>), data structures, pandas, pure computation.</p></div>
    <div><b>Prefer</b><p>A fake + state check over a mock + call check when both work: fewer brittle details.</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A driving test where the examiner replaces the car, the road and the driver with cardboard cut-outs. Everything "passes"; nothing was tested.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Over-mocking</strong>: replacing collaborators that are part of the behaviour under test, so the test verifies the wiring between mocks instead of real results. Symptoms: tests that pass with broken logic and break on harmless refactors.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A test whose asserts are only <code>assert_called_with</code> on mocks of your own code mirrors the implementation line by line. Rename a helper and it fails; break the arithmetic and it passes. Assert on results whenever you can.</p></div>

  <h2 id="pmk-traps"><span class="num">11</span>Common Mistakes</h2>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom at the till</th><th>Fix</th></tr>
    <tr><td>Patch where defined</td><td>"!! REAL gateway called", 2 s, ConnectionError</td><td><code>patch("checkout.charge")</code></td></tr>
    <tr><td>No autospec</td><td>Green tests, production TypeError on new argument</td><td><code>autospec=True</code> / <code>create_autospec</code></td></tr>
    <tr><td>Mocking your own logic</td><td>₹203 bill, green test</td><td>Mock only the boundary</td></tr>
    <tr><td>Swapping without undo</td><td>Later tests use a stub</td><td><code>patch</code>/<code>monkeypatch</code>, not bare assignment</td></tr>
    <tr><td>Short side_effect list</td><td><code>StopIteration</code> on the 3rd call</td><td>One item per expected call; assert <code>call_count</code></td></tr>
    <tr><td>Only checking the return value</td><td>Receipt says ₹184, bank took ₹1.84</td><td><code>assert_called_once_with(18400, ...)</code></td></tr>
    <tr><td>Wrong decorator argument order</td><td><code>fake_bill</code> is really the charge mock</td><td>Bottom <code>@patch</code> → first argument</td></tr>
    <tr><td>Fake drifts from reality</td><td>Fake says "ok", bank says "OK"</td><td>Few sandbox integration tests</td></tr>
  </table>

@@REVQA@@
</main>
`
});
