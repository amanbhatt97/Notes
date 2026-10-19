// notes/python/py_mocking.js — Mocks & Test Doubles
Object.assign(TOPIC_CONTENT, {
  "py_mocking": `<main>
<h1>Mocks &amp; Test Doubles</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>Mocks &amp; Test Doubles</span></div>
  <p class="lead">Chai Corner's till now takes card and UPI payments: <code>checkout</code> bills the order and calls a payment <strong>gateway</strong> over the internet. Testing that for real is slow, flaky and costs money. A <strong>test double</strong> is a stand-in object that plays the gateway's part during a test. This note builds the idea up one need at a time: why we fake the outside world, the kinds of doubles (stub, fake, mock, spy), Python's <code>unittest.mock</code> (<code>Mock</code>, <code>MagicMock</code>, <code>autospec</code>), <code>return_value</code> and <code>side_effect</code>, <code>patch</code> and the famous "patch where it's used, not where it's defined" trap reproduced, asserting calls, pytest's <code>monkeypatch</code>, dependency injection as the cleaner alternative, and the over-mocking trap. Every run shown is real (Python 3.13, pytest 9.1; folder paths shortened to <code>~/chai</code>).</p>

  <h2 id="pmk-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 200" width="660">
<defs><marker id="pmk-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="200" y="8" width="260" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="26" text-anchor="middle" font-size="12">Making Code Trustworthy: the map</text><text x="330" y="41" text-anchor="middle" class="tm" font-size="10">does it work? → is it isolated? → where is it broken / slow?</text>
<line x1="270" y1="48" x2="110" y2="86" stroke="currentColor" marker-end="url(#pmk-a0)"/><line x1="330" y1="48" x2="330" y2="86" stroke="currentColor" marker-end="url(#pmk-a0)"/><line x1="390" y1="48" x2="550" y2="86" stroke="currentColor" marker-end="url(#pmk-a0)"/>
<rect x="20" y="88" width="180" height="52" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="110" y="110" text-anchor="middle" font-size="12">Testing with pytest</text><text x="110" y="128" text-anchor="middle" class="tm" font-size="10">tests, fixtures, TDD</text>
<line x1="200" y1="114" x2="238" y2="114" stroke="currentColor" marker-end="url(#pmk-a0)"/>
<rect x="240" y="88" width="180" height="52" rx="8" class="fg sg" stroke-width="3"/><text x="330" y="110" text-anchor="middle" font-size="12.5" font-weight="700">Mocks &amp; Test Doubles</text><text x="330" y="128" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<line x1="420" y1="114" x2="458" y2="114" stroke="currentColor" marker-end="url(#pmk-a0)"/>
<rect x="460" y="88" width="180" height="52" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="550" y="106" text-anchor="middle" font-size="12">Debugging, Profiling</text><text x="550" y="121" text-anchor="middle" font-size="12">&amp; Logging</text><text x="550" y="135" text-anchor="middle" class="tm" font-size="10">find what's wrong</text>
<text x="330" y="172" text-anchor="middle" class="tm" font-size="10.5">stands on: Modules (names, imports) · Classes · Decorators · Context Managers</text>
<text x="330" y="190" text-anchor="middle" class="tm" font-size="10.5">used by: every test that touches a network, database, clock or randomness</text>
</svg><figcaption>The second note of the group: tests from the pytest note, isolated from the outside world.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_pytest">Testing with pytest</a></b><span>We can test <code>bill</code>: fast, independent, repeatable. Left open: a function that talks to the outside world (the payment gateway) can't be tested that way. A real call takes seconds, fails when the Wi-Fi drops, and charges a card. We also need <a class="xref" data-note="py_modules">Modules</a> (what <code>from gateway import charge</code> really does to names), <a class="xref" data-note="py_classes">Classes</a> (a fake is a small class), <a class="xref" data-note="py_decorators">Decorators</a> and <a class="xref" data-note="py_context">Context Managers</a> (<code>patch</code> is both).</span></li>
    <li><b>This note adds: stand-ins for the outside world</b><span>Stubs, fakes, mocks and spies; <code>unittest.mock</code>; <code>patch</code> and <code>monkeypatch</code> to swap a name during one test; checking how our code called the gateway; and designing code (dependency injection) so swapping is trivial.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a></b><span>Tests now tell us <em>that</em> something is wrong, in isolation. The next note finds <em>where</em> and <em>why</em>, why it's slow, and what happened in production.</span></li>
  </ol>

  <h2 id="pmk-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Why fake the outside world</b><span>Q: what goes wrong testing <code>checkout</code> for real? → 2 seconds per test, a ConnectionError with no network, a fee per call, a real card charged. We need a stand-in for the gateway. What kinds are there?</span></li>
    <li><b>Test doubles: stub, fake, mock, spy</b><span>Q: what can stand in? → A stub returns a canned answer; a fake is a small working in-memory version; a mock also records calls; a spy wraps the real thing. Swapped by hand with try/finally. Writing these by hand each time is tedious…</span></li>
    <li><b>Mock and MagicMock</b><span>Q: is there a ready-made stand-in? → <code>unittest.mock.Mock</code>: accepts any call, records it, returns what you set. But it accepts typos too: <code>create_autospec</code> keeps the real signature. How do we control what it answers?</span></li>
    <li><b>return_value and side_effect</b><span>Q: how do we make it answer "ok", time out, then answer "ok"? → <code>return_value</code> = same answer every call; <code>side_effect</code> = an exception, a sequence, or a function. Retry logic tested in 0.04 s. But how do we put the mock where <code>checkout</code> will use it?</span></li>
    <li><b>patch, and where to patch</b><span>Q: how do we swap the gateway for one test, and undo it after? → <code>patch("module.name")</code>. Trap: <code>patch("gateway.charge")</code> still called the real gateway, because <code>checkout</code> looks up <em>its own</em> name <code>checkout.charge</code>. Patch where it's used. Once swapped, how do we check what our code sent?</span></li>
    <li><b>Asserting calls</b><span>Q: did <code>checkout</code> charge 18400 paise, once, and never for a bad order? → <code>assert_called_once_with</code>, <code>assert_not_called</code>, <code>call_args_list</code>. Caught a rupees-vs-paise bug. pytest also has its own swapping tool…</span></li>
    <li><b>monkeypatch</b><span>Q: is there a pytest-native way to swap attributes and env vars? → The <code>monkeypatch</code> fixture: <code>setattr</code>, <code>setenv</code>, undone automatically. But all this patching depends on knowing internal names…</span></li>
    <li><b>Dependency injection</b><span>Q: can the code make swapping unnecessary? → Pass the gateway in: <code>Till(gateway)</code>. Tests hand in a <code>FakeGateway</code>; production hands in the real one. No patch strings. What if we fake too much?</span></li>
    <li><b>Over-mocking</b><span>Q: when do mocks hide bugs? → Mocking our own <code>bill</code> made a test pass while Asha was overcharged ₹203. Mock only the edges. Then: <a class="xref" data-note="py_debugging">Debugging</a>.</span></li>
  </ol>

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
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The pytest note tested pure functions: same input, same output, in milliseconds. <code>checkout</code> is different: it calls a payment gateway over the internet. What happens if we test it the same way?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Test Doubles.</b> We need a stand-in for the gateway. What kinds of stand-ins are there, and how do we put one in place of the real <code>charge</code>?</div>

  <h2 id="pmk-kinds"><span class="num">02</span>Test Doubles: Stub, Fake, Mock, Spy</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Replace the gateway" can mean several things: always say "ok"? Behave like a tiny bank with balances? Remember what it was asked? Which one do we need, and how do we swap it in?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Mock and MagicMock.</b> Hand-writing a stub or a recording class for every dependency is tedious. Does Python ship a ready-made double that can stand in for anything and record everything?</div>

  <h2 id="pmk-mock"><span class="num">03</span>Mock and MagicMock</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want a stand-in that can be called with anything, remembers each call, and returns what we tell it, without writing a class each time. And it must not hide mistakes like a misspelt method name. Does the standard library have one?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: return_value and side_effect.</b> A mock that always says "ok" can't test what happens when the gateway times out, or times out once and then succeeds. How do we script its answers?</div>

  <h2 id="pmk-se"><span class="num">04</span>return_value and side_effect</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Gateways time out now and then, so the till retries. To test the retry we need the gateway to time out on the first call and succeed on the second, on demand. The real bank won't do that for us. Can a mock?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: patch, and Where to Patch.</b> We used <code>patch("checkout.charge")</code>. Why not <code>patch("gateway.charge")</code>, where <code>charge</code> is actually defined? The answer is the most common mocking bug.</div>

  <h2 id="pmk-patch"><span class="num">05</span>patch: Patch Where It's Used</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want <code>checkout</code> to call our mock instead of the real gateway, for one test only, and to get the real one back afterwards even if the test fails. Which name do we replace, and with what tool?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Asserting Calls.</b> The mock is now in place and our test checks the receipt. But did <code>checkout</code> send the gateway the right amount, in paise, exactly once? And did it stay away from the gateway for a bad order?</div>

  <h2 id="pmk-calls"><span class="num">06</span>Asserting Calls</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The receipt can look right while the money is wrong: if <code>checkout</code> sent 184 instead of 18400 paise, the bank would charge ₹1.84. A stub can't tell us; it answers "ok" whatever it gets. How do we check what our code <em>sent</em> to the outside world?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: monkeypatch.</b> <code>patch</code> comes from unittest. pytest has its own fixture for temporary replacements, which also handles environment variables (like the gateway's API key). How does it compare?</div>

  <h2 id="pmk-mp"><span class="num">07</span>monkeypatch: pytest's Swapper</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sometimes we don't need a recording MagicMock: a plain function as the double is clearer. And the till reads the gateway key from an environment variable. Is there a pytest-style way to swap attributes and env vars, undone automatically?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Dependency Injection.</b> Every technique so far reaches into <code>checkout</code>'s module and replaces a name by its string or attribute. Rename the import and the patches silently miss. Can the code itself be designed so tests just <em>hand in</em> a gateway?</div>

  <h2 id="pmk-di"><span class="num">08</span>Dependency Injection: the Cleaner Alternative</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Patching works, but it couples tests to import details ("patch where it's used" exists only because the code fetches its own dependency). What if <code>checkout</code> didn't fetch the gateway at all?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: The Over-Mocking Trap.</b> If doubles are so convenient, why not replace everything <code>checkout</code> touches, including our own <code>bill</code>? What could go wrong?</div>

  <h2 id="pmk-over"><span class="num">09</span>The Over-Mocking Trap</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A test that mocks every collaborator runs fast and never fails for outside reasons. But if the thing being "tested" is replaced too, what is left to catch a bug?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture and one table tying every double and tool to the gateway problem.</div>

  <h2 id="pmk-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Stubs, fakes, Mock, side_effect, patch, monkeypatch, DI: how is each built from the one before, and when do you reach for which?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 270" width="680">
<defs><marker id="pmk-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="48" rx="7" class="fr sr"/><text x="110" y="30" text-anchor="middle" font-size="12" font-weight="700">real gateway in a test</text><text x="110" y="46" text-anchor="middle" class="tm" font-size="10">2 s, ConnectionError, fees</text>
<line x1="210" y1="34" x2="243" y2="34" stroke="currentColor" marker-end="url(#pmk-a9)"/>
<rect x="245" y="10" width="200" height="48" rx="7" class="fb sb"/><text x="345" y="30" text-anchor="middle" font-size="12" font-weight="700">test doubles</text><text x="345" y="46" text-anchor="middle" class="tm" font-size="10">stub · fake · mock · spy</text>
<line x1="445" y1="34" x2="478" y2="34" stroke="currentColor" marker-end="url(#pmk-a9)"/>
<rect x="480" y="10" width="190" height="48" rx="7" class="fb sb"/><text x="575" y="30" text-anchor="middle" font-size="12" font-weight="700">Mock / MagicMock</text><text x="575" y="46" text-anchor="middle" class="tm" font-size="10">+ autospec</text>
<line x1="575" y1="58" x2="575" y2="92" stroke="currentColor" marker-end="url(#pmk-a9)"/>
<rect x="460" y="94" width="210" height="48" rx="7" class="ft st"/><text x="565" y="114" text-anchor="middle" font-size="12" font-weight="700">return_value · side_effect</text><text x="565" y="130" text-anchor="middle" class="tm" font-size="10">timeout, then ok → retry</text>
<line x1="460" y1="118" x2="427" y2="118" stroke="currentColor" marker-end="url(#pmk-a9)"/>
<rect x="225" y="94" width="200" height="48" rx="7" class="ft st"/><text x="325" y="114" text-anchor="middle" font-size="12" font-weight="700">patch where it's used</text><text x="325" y="130" text-anchor="middle" class="tm" font-size="10">"checkout.charge"</text>
<line x1="225" y1="118" x2="192" y2="118" stroke="currentColor" marker-end="url(#pmk-a9)"/>
<rect x="10" y="94" width="180" height="48" rx="7" class="ft st"/><text x="100" y="114" text-anchor="middle" font-size="12" font-weight="700">asserting calls</text><text x="100" y="130" text-anchor="middle" class="tm" font-size="10">18400, not 184</text>
<line x1="325" y1="142" x2="325" y2="176" stroke="currentColor" marker-end="url(#pmk-a9)"/>
<rect x="225" y="178" width="200" height="40" rx="7" class="fv"/><text x="325" y="203" text-anchor="middle" font-size="12" font-weight="700">monkeypatch (pytest)</text>
<line x1="425" y1="198" x2="458" y2="198" stroke="currentColor" marker-end="url(#pmk-a9)"/>
<rect x="460" y="178" width="210" height="40" rx="7" class="fg sg"/><text x="565" y="203" text-anchor="middle" font-size="12" font-weight="700">dependency injection: Till(gw)</text>
<line x1="565" y1="218" x2="420" y2="240" stroke="currentColor" marker-end="url(#pmk-a9)"/>
<rect x="160" y="230" width="260" height="34" rx="7" class="fr sr"/><text x="290" y="252" text-anchor="middle" font-size="11.5" font-weight="700">limit: over-mocking (₹203 passed)</text>
</svg><figcaption>The pain (top left) forces doubles; Mock makes them cheap; side_effect scripts them; patch/monkeypatch put them in place; DI removes the need to patch; over-mocking marks where to stop.</figcaption></figure>
  <table class="tbl"><caption>Every tool, on the gateway</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>Test double</td><td>duck typing: anything with <code>.charge</code></td><td>what stands in?</td><td>stub → ₹184 receipt; fake records 18400, 3200</td><td>Any outside dependency</td></tr>
    <tr><td>Mock / MagicMock</td><td>a recording double</td><td>ready-made stand-in?</td><td><code>call(18400, 'tok_asha')</code></td><td>You need call records</td></tr>
    <tr><td>autospec</td><td>Mock + real signature</td><td>will it drift from reality?</td><td>caught missing <code>idempotency_key</code></td><td>Almost always with patch</td></tr>
    <tr><td>return_value / side_effect</td><td>Mock</td><td>how does it answer?</td><td>[Timeout, ok] → 2 calls; always Timeout → 3</td><td>Error and retry paths</td></tr>
    <tr><td>patch</td><td>module names (imports)</td><td>how to swap it in for one test?</td><td><code>"checkout.charge"</code>, not <code>"gateway.charge"</code></td><td>Code imports its dependency</td></tr>
    <tr><td>Asserting calls</td><td>Mock's record</td><td>what did we send?</td><td>18400 expected, 184 actual</td><td>Side effects matter (money, emails)</td></tr>
    <tr><td>monkeypatch</td><td>pytest fixture</td><td>pytest-native swap, env vars?</td><td><code>setattr(checkout, "charge", f)</code>; key env var</td><td>Simple swaps in pytest</td></tr>
    <tr><td>Dependency injection</td><td>parameters / constructors</td><td>can we avoid patching?</td><td><code>Till(FakeGateway())</code>; charges [(18400…), (7400…)]</td><td>Code you design</td></tr>
    <tr><td>Over-mocking limit</td><td>all of the above</td><td>where to stop?</td><td>mocked <code>bill</code> passed at ₹203</td><td>Always: mock edges only</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p><strong>Replace the outside world, keep your own logic real, and put the replacement exactly where your code looks for it</strong>, or better, let your code be handed it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The handful of patching bugs everyone makes once.</div>

  <h2 id="pmk-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which mocking habits make tests slow, leaky or falsely green?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The note on one page.</div>

  <h2 id="pmk-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: <code>checkout(lines, card)</code> bills the order with the real <code>bill</code> (Asha ₹184) and calls <code>charge(amount_paise, card)</code> on a payment gateway (18400 paise for Asha). The real gateway is slow (2 s), fails without network, and costs money, so tests replace it.</p>
  <h3>The ladder in one line each</h3>
  <ol>
    <li><b>Why</b> — real outside world = slow, flaky, costly, uncontrollable; the test failed in 2.01 s for no fault of ours.</li>
    <li><b>Doubles</b> — stub (canned), fake (working mini-version, check its state), mock (records calls), spy (wraps real).</li>
    <li><b>Mock/MagicMock</b> — any attribute/call, recorded; MagicMock adds magic methods; autospec keeps the real signature.</li>
    <li><b>return_value/side_effect</b> — same answer each call / exception, sequence, or function.</li>
    <li><b>patch</b> — rebind a name for one test; patch where the code <em>looks it up</em>.</li>
    <li><b>Asserting calls</b> — <code>assert_called_once_with(18400, "tok_asha")</code>, <code>assert_not_called()</code>.</li>
    <li><b>monkeypatch</b> — pytest fixture: <code>setattr</code>, <code>setenv</code>, auto-undo.</li>
    <li><b>DI</b> — pass the gateway in: <code>Till(gateway)</code>; tests pass a fake.</li>
    <li><b>Over-mocking</b> — mocking <code>bill</code> hid a ₹203 bug; mock the boundary only.</li>
  </ol>
  <h3>Syntax you must know</h3>
  <table class="tbl">
    <tr><th>Form</th><th>Meaning</th></tr>
    <tr><td><code>m = Mock(return_value=v)</code></td><td>Every call returns v</td></tr>
    <tr><td><code>m.side_effect = Exc</code> / <code>[a, Exc, b]</code> / <code>func</code></td><td>Raise / one per call / compute from args</td></tr>
    <tr><td><code>with patch("mod.name", autospec=True, return_value=v) as m:</code></td><td>Swap <code>name</code> in <code>mod</code> for the block, with the real signature</td></tr>
    <tr><td><code>@patch("a.x")</code> over <code>@patch("a.y")</code> → <code>def t(mock_y, mock_x)</code></td><td>Bottom decorator's mock comes first</td></tr>
    <tr><td><code>m.assert_called_once_with(*args)</code>, <code>m.call_args_list == [call(...)]</code></td><td>Check what was sent</td></tr>
    <tr><td><code>monkeypatch.setattr(module, "name", value)</code>, <code>monkeypatch.setenv(K, V)</code></td><td>pytest swap, undone after the test</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Result</th></tr>
    <tr><td>Real gateway in a test</td><td>ConnectionError after 2.01 s</td></tr>
    <tr><td>Stub / fake</td><td>receipt <code>{'amount': 184, ...}</code>; fake charges [(18400, 'tok_asha'), (3200, 'tok_ben')]</td></tr>
    <tr><td>side_effect [Timeout, ok] / always Timeout</td><td>call_count 2 / 3 (then re-raise)</td></tr>
    <tr><td><code>patch("gateway.charge")</code> vs <code>patch("checkout.charge")</code></td><td>real call (fail, 2.03 s) vs mock (pass)</td></tr>
    <tr><td>Rupees-vs-paise bug</td><td>Expected charge(18400, …), Actual charge(184, …)</td></tr>
    <tr><td>DI with fake: Asha + Ben</td><td>[(18400, 'tok_asha'), (7400, 'tok_ben')]</td></tr>
    <tr><td>Discount bug (1%, &gt;)</td><td>bill 203 → over-mocked test green; DI test red (20300)</td></tr>
  </table>
  <div class="cards">
    <div><b>Use a stub</b><p>When you only need the dependency to answer.</p></div>
    <div><b>Use a fake</b><p>When several calls interact (balances, a list of charges); check its state.</p></div>
    <div><b>Use a Mock</b><p>When what you <em>send</em> matters (amount, once, never for bad orders).</p></div>
    <div><b>Use DI</b><p>When you design the code: hand dependencies in, no patching.</p></div>
    <div><b>Avoid</b><p>Mocking your own logic, plain mocks without autospec, real network in unit tests.</p></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Patch where it's used (<code>from x import f</code> → <code>"yourmodule.f"</code>); autospec or drift; over-mocking hides bugs; always undo swaps; side_effect list length = number of calls; check calls when the receipt can lie.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>checkout.py</code> has <code>from gateway import charge</code>. What do you patch?</td><td><code>"checkout.charge"</code></td></tr>
    <tr><td>How do you make a mock time out once, then succeed?</td><td><code>side_effect=[TimeoutError, ok_dict]</code></td></tr>
    <tr><td>Stub or mock to catch "184 instead of 18400 paise"?</td><td>A mock (assert the call); a stub ignores its arguments</td></tr>
    <tr><td>What does <code>autospec=True</code> add?</td><td>The mock rejects calls the real signature would reject</td></tr>
    <tr><td>Why prefer <code>Till(FakeGateway())</code> to patching?</td><td>No dependence on import names; checks state; production wiring unchanged</td></tr>
  </table>

  <h2 id="pmk-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why mock external services in unit tests?</summary><div class="qa-body">They are slow (seconds), unreliable (network, outages), costly or harmful (fees, real charges), and uncontrollable (you can't make them time out on demand). Unit tests must be fast, independent and repeatable, and should test your logic, not the bank.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Stub vs fake vs mock vs spy?</summary><div class="qa-body">Stub: canned answers. Fake: a working lightweight implementation (in-memory gateway) whose state you check. Mock: records calls so you verify interactions. Spy: wraps the real object and records calls while real behaviour runs (<code>Mock(wraps=real)</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Mock vs MagicMock?</summary><div class="qa-body">Both accept any attribute and call and record calls. MagicMock also preconfigures magic methods (<code>__len__</code>, <code>__iter__</code>, <code>__enter__</code>/<code>__exit__</code>, comparisons), so it can stand in for containers and context managers. <code>len(Mock())</code> raises TypeError; <code>len(MagicMock())</code> is 0. <code>patch</code> uses MagicMock by default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>return_value</code> vs <code>side_effect</code>?</summary><div class="qa-body"><code>return_value</code>: the same value every call. <code>side_effect</code>: an exception to raise, an iterable of results (one per call; exceptions in it are raised), or a function computing the result from the arguments. side_effect takes priority.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your module does <code>from gateway import charge</code>. You patch <code>"gateway.charge"</code> and the real gateway is still called. Why?</summary><div class="qa-body">The import created a separate name <code>charge</code> in your module pointing at the real function. patch rebound <code>gateway.charge</code> only; your code looks up <code>yourmodule.charge</code>. Patch where the name is used: <code>patch("yourmodule.charge")</code>. (With <code>import gateway</code> + <code>gateway.charge(...)</code>, patching <code>"gateway.charge"</code> works.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does autospec protect you from?</summary><div class="qa-body">Drift between the mock and the real API: wrong argument counts or names, misspelt attributes. When <code>charge</code> gained <code>idempotency_key</code>, the plain mock test stayed green and the autospec test failed with the same TypeError production would raise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you assert a function was called correctly, or not at all?</summary><div class="qa-body"><code>m.assert_called_once_with(18400, "tok_asha")</code>, <code>m.assert_called_with(...)</code> (last call), <code>m.assert_any_call(...)</code>, <code>m.assert_not_called()</code>; or compare <code>m.call_args_list</code> to a list of <code>call(...)</code> objects and check <code>m.call_count</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>patch vs monkeypatch?</summary><div class="qa-body">patch (stdlib) takes a dotted string, inserts a MagicMock by default, works as context manager or decorator in any framework. monkeypatch (pytest fixture) sets any value on an object/attribute pair, also handles env vars, dict items and cwd, and undoes everything at test teardown.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dependency injection and why does it make testing easier?</summary><div class="qa-body">Passing collaborators in (constructor/parameters) instead of importing them inside. Tests hand in a fake; production hands in the real thing. No patch strings tied to import details, and the design makes dependencies visible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does "patch where it's used" follow from the Values note's "a name is a label"?</summary><div class="qa-body"><code>from gateway import charge</code> sticks a second label, <code>checkout.charge</code>, on the same function object. patch moves one label to a mock. Whichever label the code reads at call time decides what runs, so you must move the label that <code>checkout</code> reads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you mock your own <code>bill</code> in a checkout test?</summary><div class="qa-body">The test no longer exercises the billing rules, so a real billing bug (1% discount → ₹203) passes while customers are overcharged. Keep your logic real; double only the gateway.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are pytest fixtures and dependency injection related?</summary><div class="qa-body">Both hand an object in from outside instead of the consumer building it. A <code>till</code> fixture building <code>Till(FakeGateway())</code> combines them: pytest injects the till into the test, and the till has the gateway injected into it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: mocks make tests pass in isolation. Why do we still need the next note?</summary><div class="qa-body">A red test says <em>that</em> a rule is broken, not <em>where</em> or <em>why</em>; and production has failures tests never imagined. Debugging (tracebacks, pdb) finds the cause, profiling finds slowness, logging records what happened live.</div></details>
</main>
`
});
