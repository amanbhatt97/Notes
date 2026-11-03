// notes/python/py_mocking.js — Mocks & Test Doubles
Object.assign(TOPIC_CONTENT, {
  "py_mocking": `<main>
<h1>Mocks &amp; Test Doubles</h1>
  <div class="where"><span>Python</span><span>Making Code Trustworthy</span><span>Mocks &amp; Test Doubles</span></div>
  <p class="lead">Most real programs talk to the outside world: a payment gateway, a web API, a database, an email service, the system clock. That makes them hard to test, because a test that really charges a card or really calls an API is slow, fails whenever the network does, may cost money, and can never be made to time out on demand, so the code that handles failures goes untested. A <strong>test double</strong> solves this: it is a stand-in object that takes the place of the real dependency during a test and behaves exactly as the test tells it to. This page builds the idea from hand-written stand-ins up to Python's <code>unittest.mock</code> library (<code>Mock</code>, <code>MagicMock</code>, <code>patch</code>, autospec) and pytest's <code>monkeypatch</code>, then shows the cleaner design that makes most patching unnecessary, dependency injection, and the main way mocking goes wrong. The running example is the checkout of a small tea stall, Chai Corner, which bills an order and charges the customer's card through a payment gateway.</p>

  <h2 id="pmk-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Mocks &amp; Test Doubles</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why</div>
        <ul>
          <li>Real dependencies are slow, flaky, costly, uncontrollable</li>
          <li>Error paths (timeouts, declines) need a double</li>
          <li>Kinds: dummy, stub, fake, mock, spy</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">unittest.mock</div>
        <ul>
          <li><code>Mock</code>: accepts any call, records it</li>
          <li><code>MagicMock</code>: also <code>len</code>, <code>with</code>, iteration</li>
          <li><code>return_value</code>, <code>side_effect</code></li>
          <li><code>autospec</code>: keeps the real signature</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">patch</div>
        <ul>
          <li>Temporarily replaces a name, then restores it</li>
          <li><b>Patch where the name is looked up</b></li>
          <li><code>from gateway import charge</code> → patch <code>"checkout.charge"</code></li>
          <li><code>assert_called_once_with</code>, <code>assert_not_called</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Better design</div>
        <ul>
          <li><code>monkeypatch</code>: setattr, setenv, auto-undo</li>
          <li>Dependency injection: <code>Till(gateway)</code></li>
          <li>Mock only the outside world, never your own logic</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pmk-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Test Doubles</span><span class="rm-sub">a test that calls the real gateway</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-kinds"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Kinds of Test Doubles</span><span class="rm-sub">dummy, stub, fake, mock, spy</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-mock"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Mock and MagicMock</span><span class="rm-sub">objects that accept anything and record it</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-se"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">return_value and side_effect</span><span class="rm-sub">scripting answers, errors and retries</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-patch"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">patch and Where to Patch</span><span class="rm-sub">replacing a name, and autospec</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-calls"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Asserting Calls</span><span class="rm-sub">checking what was sent to the gateway</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-mp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">pytest monkeypatch</span><span class="rm-sub">setattr, setenv, automatic undo</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-di"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Dependency Injection</span><span class="rm-sub">passing the dependency in</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-over"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Over-Mocking</span><span class="rm-sub">when mocks hide real bugs</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">patching pitfalls</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">API, patch rules, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pmk-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">doubles, patch, DI, over-mocking</span></div></div>
    </div>
  </div>

  <h2 id="pmk-why"><span class="num">01</span>Why Test Doubles</h2>
  <p>Chai Corner's till already has a well-tested billing function, <code>bill(lines)</code>, from <a class="xref" data-note="py_pytest">Testing with pytest</a>: an order of 2 chai, 3 samosas and a cold coffee comes to ₹184 after discount and GST. The next step is taking payment. A checkout function bills the order and asks a payment gateway to charge the customer's card. Real gateways are web services run by a bank; this sandbox has no bank, so <code>gateway.py</code> below imitates one honestly: it waits two seconds, like a network round trip, and then fails, like a network that is down.</p>
  <div class="fx" data-lang="py"># gateway.py
"""Stand-in for the real UPI/card payment gateway.
In real life charge() sends an HTTPS request to the bank: slow, needs the
internet, and costs a fee per call. Here it imitates that: it waits 2 seconds
like a network round-trip and then fails, because this sandbox has no bank."""
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
    amount = bill(lines)                          # e.g. 184 rupees
    resp = charge(amount * 100, card)             # the gateway wants paise: 18400
    if resp["status"] != "ok":
        raise PaymentFailed(resp.get("reason", "unknown"))
    return {"amount": amount, "txn": resp["txn_id"]}

def checkout_with_retry(lines, card, attempts=3):
    """Gateways time out now and then: try again, up to 'attempts' times."""
    for attempt in range(1, attempts + 1):
        try:
            return checkout(lines, card)
        except (ConnectionError, TimeoutError):
            if attempt == attempts:
                raise                             # out of tries: let it propagate</div>
  <p>Gateways count money in the smallest unit, paise (100 paise = ₹1), so <code>checkout</code> multiplies the bill by 100. If the gateway answers with <code>"status": "ok"</code>, the function returns a receipt; otherwise it raises <code>PaymentFailed</code>. There is also a retry wrapper, because real gateways occasionally time out. Worked out by hand for Asha: the bill is 184, the gateway should be asked for 18400 paise, and the receipt should be <code>{"amount": 184, "txn": ...}</code>. That is <em>our</em> logic, and it is what we want to test. Here is the obvious test:</p>
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
test_checkout_real.py:7: in test_checkout_asha
    receipt = checkout(ASHA, card="tok_asha")
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
checkout.py:10: in checkout
    resp = charge(amount * 100, card)             # the gateway wants paise: 18400
           ^^^^^^^^^^^^^^^^^^^^^^^^^^
gateway.py:11: in charge
    raise ConnectionError("pay.chaicorner.example: network unreachable")
E   ConnectionError: pay.chaicorner.example: network unreachable
=========================== short test summary info ============================
FAILED test_checkout_real.py::test_checkout_asha - ConnectionError: pay.chaic...
1 failed in 2.02s</div>
  <p>The test failed, after two whole seconds, for a reason that has nothing to do with our code: the "network" was unreachable. Our billing and receipt logic never got a chance to be checked. With a real gateway it would be worse: the test would pass on some days and fail on others, take seconds each, cost a fee per run, and actually charge a card. And some behaviour could never be tested at all, because you cannot ask a real bank to time out on demand to check that the retry works, or to decline a card to check that <code>PaymentFailed</code> is raised.</p>
  <p>Film-makers have the same problem with dangerous scenes, and they solve it with a stunt double: someone who looks like the actor from the camera's angle, does exactly what the script says, on cue, every take, so the real actor is never at risk. A <strong>test double</strong> is a stunt double for a dependency. In testing vocabulary, the code we are checking (<code>checkout</code>) is the <strong>system under test</strong>; something it calls that we do not want to involve in this test (the gateway) is a <strong>dependency</strong>; and a test double is any object that replaces a dependency during a test. With a double in place, the test is fast, repeatable, free, and can produce any situation we need, including failures.</p>
  <p>This does not mean the real gateway is never tested. A few deliberate integration tests against the bank's sandbox account check that our code and the real service agree. But the many unit tests of our own logic should not depend on the outside world (the reasons are covered in <a class="xref" data-note="py_testing">Software Testing Fundamentals</a>).</p>

  <h2 id="pmk-kinds"><span class="num">02</span>Kinds of Test Doubles</h2>
  <p>Before using any library, it helps to build two doubles by hand, because it shows exactly what the library does for you later. A <strong>stub</strong> is the simplest double: it returns a fixed, canned answer and remembers nothing. A <strong>fake</strong> is a small but genuinely working version of the dependency, with simplified rules: our fake gateway keeps a list of charges in memory and declines any card whose token starts with <code>tok_bad</code>. To make <code>checkout</code> use a double, we rebind the name <code>checkout.charge</code> (the name <code>checkout</code> looks up when it runs) to the double, and we put the real function back in a <code>finally</code> block so that nothing else is left using a stand-in, even if something fails.</p>
  <div class="fx" data-lang="py"># doubles.py
import checkout, gateway

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]

# a STUB: always the same canned answer, remembers nothing
def stub_charge(amount_paise, card):
    return {"status": "ok", "txn_id": "T-001"}

# a FAKE: a small, working, in-memory gateway with simple real rules
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
  <p>Walk through the output. With the stub, <code>checkout</code> really billed Asha (184), "charged" instantly, got "ok" back and built the receipt: our logic ran for real, and only the gateway was replaced. With the fake, two orders went through: Asha's 18400 paise and Ben's two samosas, 30 plus 5% = 31.5, which rounds to ₹32, so 3200 paise. Afterwards the fake's <code>charges</code> list shows exactly what was charged, in order. Then the "bad" card was declined, and our <code>PaymentFailed</code> path ran: something the real gateway would never let us trigger on demand. No network, no waiting. The last line confirms the real function was restored.</p>
  <p>Developers use a small vocabulary for the different kinds of double, and interviewers like to ask about it. Think of rehearsing a play while the lead actor is away. A cardboard cut-out just stands in the right spot; a stand-in reading from the script gives the other actors their cues; an understudy who knows the whole part can play complete scenes; and a stage manager taking notes on every cue can tell you afterwards who said what, and when. Those are the dummy, stub, fake and mock:</p>
  <table class="tbl">
    <tr><th>Double</th><th>What it does</th><th>The test checks</th><th>Gateway example</th></tr>
    <tr><td><b>Dummy</b></td><td>Fills a required parameter; never actually used</td><td>nothing about it</td><td><code>card=None</code> where the card is ignored</td></tr>
    <tr><td><b>Stub</b></td><td>Returns canned answers</td><td>the system's result</td><td>always <code>{"status": "ok"}</code></td></tr>
    <tr><td><b>Fake</b></td><td>A simplified working implementation</td><td>the fake's <em>state</em> afterwards</td><td>in-memory gateway with a <code>charges</code> list</td></tr>
    <tr><td><b>Mock</b></td><td>Records every call made to it</td><td>the <em>calls</em> it received</td><td>"was charge called once with 18400?"</td></tr>
    <tr><td><b>Spy</b></td><td>Wraps the real object, records calls, lets the real work happen</td><td>the calls, with real behaviour</td><td>a recording wrapper around a real function</td></tr>
  </table>
  <p>Checking a fake's state afterwards ("the charges list contains 18400 for Asha") is called <strong>state verification</strong>. Checking which calls were made to a mock is called <strong>behaviour verification</strong>. Both will appear below. One lesson from the hand-written version is worth keeping: swapping a name by plain assignment is fragile. If you forget the <code>finally</code>, a failing test leaves the stub in place, and every later test silently uses it. The tools in the rest of this page, <code>patch</code> and <code>monkeypatch</code>, exist mainly to do the swap and the guaranteed restore for you.</p>

  <h2 id="pmk-mock"><span class="num">03</span>Mock and MagicMock</h2>
  <p>Writing a stub function or fake class for every dependency gets tedious, and hand-written stubs do not record how they were called. Python's standard library includes <code>unittest.mock</code>, whose central class, <code>Mock</code>, is a universal stand-in. A <code>Mock</code> object accepts any call with any arguments, returns whatever you set as its <code>return_value</code>, and records every call it receives. Ask it for any attribute, even one that was never defined, and it creates a new child mock on the spot, so it can pretend to be almost any object.</p>
  <div class="fx" data-lang="py">from unittest.mock import Mock, MagicMock

pay = Mock(return_value={"status": "ok", "txn_id": "T-001"})
print(pay(18400, "tok_asha"))          # the canned answer
print(pay.call_count, pay.call_args)   # and a record of the call
print(pay.chrage)                      # a typo... silently accepted!

try:
    len(Mock())
except TypeError as e:
    print("Mock:", e)
print("MagicMock len:", len(MagicMock()))   # MagicMock also fakes len(), iteration, with...</div>
  <div class="fx" data-lang="text">{'status': 'ok', 'txn_id': 'T-001'}
1 call(18400, 'tok_asha')
&lt;Mock name='mock.chrage' id='139878646558608'&gt;
Mock: object of type 'Mock' has no len()
MagicMock len: 0</div>
  <p>Line by line: calling the mock returned the canned dictionary. <code>call_count</code> is 1, and <code>call_args</code> shows the exact arguments of the last call, <code>call(18400, 'tok_asha')</code>. Then a deliberate typo: <code>pay.chrage</code> instead of <code>pay.charge</code>. A real object would raise <code>AttributeError</code>; the mock just invented a child mock called <code>mock.chrage</code>. That flexibility is what makes mocks convenient, and also what makes them dangerous: code that calls a method which does not exist on the real gateway will still pass its tests. Finally, <code>len(Mock())</code> fails, because a plain Mock does not support Python's special "magic" methods such as <code>__len__</code>, <code>__iter__</code> or <code>__enter__</code> (see <a class="xref" data-note="py_dunder">Dunder Methods</a>). <code>MagicMock</code> is a Mock with those already set up, so it can stand in for a list, a file or anything used in a <code>with</code> statement; <code>len(MagicMock())</code> is 0.</p>
  <p>The fix for the typo problem is to make the mock copy the shape of the real thing. <code>create_autospec(obj)</code> builds a mock that has only the attributes <code>obj</code> really has, and whose calls must match the real signature. This is called an <strong>autospec</strong> mock:</p>
  <div class="fx" data-lang="py">from unittest.mock import create_autospec
from gateway import charge

safe = create_autospec(charge, return_value={"status": "ok", "txn_id": "T-002"})
print(safe(18400, card="tok_asha"))
try:
    safe(18400)                        # the real charge() needs a card
except TypeError as e:
    print("autospec:", e)
try:
    safe.chrage
except AttributeError as e:
    print("autospec:", e)</div>
  <div class="fx" data-lang="text">{'status': 'ok', 'txn_id': 'T-002'}
autospec: missing a required argument: 'card'
autospec: 'function' object has no attribute 'chrage'</div>
  <p>A correct call works and returns the canned answer. Calling it without a <code>card</code> is rejected with the same error the real <code>charge</code> would give, and asking for the misspelt <code>chrage</code> raises <code>AttributeError</code>. A plain Mock is like an actor who will improvise any line you throw at them, happily answering to "Mr. Chrage"; an autospec mock has learned the real script and stops you when you go off it. There is also <code>Mock(spec=SomeClass)</code>, which restricts the attribute names but does not check call signatures. Two specialised variants complete the family: <code>AsyncMock</code> stands in for <code>async def</code> functions (awaiting it returns its <code>return_value</code>), and <code>mock_open</code> stands in for the built-in <code>open</code>.</p>

  <h2 id="pmk-se"><span class="num">04</span>return_value and side_effect</h2>
  <p>A double that always says "ok" can only test the happy path. The interesting code is the failure handling: what happens when the gateway times out, recovers on the second try, or declines one particular card. <code>return_value</code> gives the same answer on every call. <code>side_effect</code> lets you script something richer, and it comes in three forms. If it is an <strong>exception</strong>, every call raises it. If it is a <strong>list</strong> (or any iterable), each call takes the next item, and items that are exceptions are raised instead of returned. If it is a <strong>function</strong>, the mock calls it with the same arguments and returns whatever it returns. When <code>side_effect</code> is set, it takes priority over <code>return_value</code>.</p>
  <div class="fx" data-lang="py">from unittest.mock import Mock

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

# 3. a function: works out the answer from the arguments
def by_card(amount_paise, card):
    return {"status": "declined" if card == "tok_bad" else "ok", "txn_id": "T-1"}
smart = Mock(side_effect=by_card)
print("3.", smart(5200, "tok_chen")["status"], smart(5200, "tok_bad")["status"])</div>
  <div class="fx" data-lang="text">1. TimeoutError('gateway slow')
2. raised TimeoutError('slow')
2. {'status': 'ok', 'txn_id': 'T-007'}
3. ok declined</div>
  <p>The first mock raised <code>TimeoutError</code> on its call. The second raised on its first call and returned "ok" on its second, exactly the sequence a briefly overloaded gateway produces. The third worked out its answer from the card argument. A cricket bowling machine is a good picture: <code>return_value</code> bowls the same ball every time, while <code>side_effect</code> is a programmed over, a bouncer, then a yorker, then a full toss, so the batter can practise every case on cue.</p>
  <p>That is exactly what the retry wrapper in <code>checkout.py</code> needs. Trace it by hand first. With <code>side_effect=[TimeoutError, ok]</code>: attempt 1 calls charge, which raises <code>TimeoutError</code>; it is caught, and since 1 is not the last attempt the loop continues; attempt 2 gets "ok" and returns the receipt. Total calls: 2. With <code>side_effect=TimeoutError</code> (always): attempts 1 and 2 are caught, attempt 3 re-raises. Total calls: 3.</p>
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
  <p>Both paths of the retry logic are tested in a few hundredths of a second, with timeouts produced exactly when we wanted them. (The line <code>patch("checkout.charge")</code> is what put the mock into <code>checkout</code>; why it must be that exact string is the subject of the next section.) One caution: if a <code>side_effect</code> list runs out because the code calls the mock more times than the list has items, the mock raises <code>StopIteration</code>, a confusing error far from the real cause. Give exactly as many items as calls you expect, and assert <code>call_count</code>.</p>

  <h2 id="pmk-patch"><span class="num">05</span>patch and Where to Patch</h2>
  <p>In the hand-written example we swapped <code>checkout.charge</code> ourselves and restored it in a <code>finally</code>. <code>unittest.mock.patch</code> does the same job safely. Given a target as a dotted string, <code>"module.name"</code>, it replaces that name with a <code>MagicMock</code> (or with whatever you pass as <code>new=</code>) for the duration of a <code>with</code> block or a decorated test function, and always restores the original afterwards, even if the test fails. Keyword arguments such as <code>return_value=</code>, <code>side_effect=</code> and <code>autospec=True</code> configure the mock. The one question you must get right is <em>which</em> module's name to replace. Here are two tests that differ only in the target string:</p>
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
~/chai/gateway.py:11: ConnectionError: pay.chaicorner.example: network unreachable
=========================== short test summary info ============================
FAILED test_patch_where.py::test_patch_where_defined - ConnectionError: pay.c...
1 failed, 1 passed in 2.03s</div>
  <p>The first test patched <code>gateway.charge</code>, the place where <code>charge</code> is defined, and yet the <em>real</em> gateway was called: there is the "!! REAL gateway called" line, the two-second wait and the <code>ConnectionError</code>. The second test patched <code>checkout.charge</code> and passed instantly. To see why, look at what each name points to while <code>gateway.charge</code> is patched:</p>
  <div class="fx" data-lang="py">from unittest.mock import patch
import gateway, checkout

with patch("gateway.charge") as m:
    print("gateway.charge  is the mock:", gateway.charge is m)
    print("checkout.charge is the mock:", checkout.charge is m)
    print("checkout.charge is still   :", checkout.charge.__module__ + "." + checkout.charge.__name__)</div>
  <div class="fx" data-lang="text">gateway.charge  is the mock: True
checkout.charge is the mock: False
checkout.charge is still   : gateway.charge</div>
  <p>The explanation lies in what <code>from gateway import charge</code> does. When <code>checkout.py</code> is first imported, that line creates a <em>new name</em>, <code>charge</code>, inside the <code>checkout</code> module, pointing at the same function object that <code>gateway.charge</code> points at. A Python name is just a label attached to an object (see <a class="xref" data-note="py_values">Values</a>), and imports create labels (see <a class="xref" data-note="py_modules">Modules</a>). From then on, every time <code>checkout()</code> runs, it looks up the label <code>charge</code> in its own module. Patching <code>gateway.charge</code> moved the label in the gateway module to point at a mock, but the label in the checkout module was never touched, and it still points at the real function.</p>
  <figure class="viz"><svg viewBox="0 0 560 175" width="560">
    <defs><marker id="pmk-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="18" width="170" height="52" rx="6" class="fs"/><text x="20" y="38">module gateway</text><text x="20" y="58" class="tr">charge → MagicMock</text>
    <rect x="10" y="104" width="170" height="52" rx="6" class="fs"/><text x="20" y="124">module checkout</text><text x="20" y="144" class="tb">charge → real charge</text>
    <rect x="380" y="62" width="170" height="50" rx="6" class="fb sb"/><text x="392" y="84">real charge()</text><text x="392" y="102" class="tm">function object</text>
    <line x1="180" y1="130" x2="376" y2="96" class="sb" stroke-width="2" marker-end="url(#pmk-ah1)"/>
    <text x="196" y="160" class="tm">"from gateway import charge" copied this arrow</text>
    <text x="196" y="40" class="tm">patch("gateway.charge") moved only this one</text>
  </svg><figcaption>Two modules, two labels for one function. patch("gateway.charge") moves the label in the top box; checkout() reads the label in the bottom box, which still points at the real function.</figcaption></figure>
  <p>Read the figure from the bottom box. When <code>checkout</code> was imported, its label <code>charge</code> was made to point at the real function object on the right; that arrow was copied once and never followed again. <code>patch("gateway.charge")</code> repointed the label in the top box at a mock, but <code>checkout()</code> never reads the top box. Two offices keeping their own phone lists behave the same way: when a supplier changes number you can update the supplier's own card, but the checkout office still dials the number it copied onto its list, so to redirect checkout's calls you must change checkout's list.</p>
  <p>If the code imports the <em>module</em> instead, and looks the function up through it on every call, then the module's attribute is exactly where the lookup happens, and patching the defining module works:</p>
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
def test_module_style_import(fake):               # decorator form: the mock arrives as an argument
    assert checkout(ASHA, "tok_asha") == {"amount": 184, "txn": "T-1"}
    fake.assert_called_once_with(18400, "tok_asha")</div>
  <div class="fx" data-lang="text">$ pytest -q -s test_patch_v2.py
.
1 passed in 0.03s</div>
  <p>No "!! REAL" line this time: the mock was used. This test also shows the decorator form of <code>patch</code>: the mock is passed to the test function as an extra argument. (With several stacked <code>@patch</code> decorators, the one closest to the function provides the first argument.) The rule never changes, and it is one of the most common interview questions about mocking: <strong>patch the name where the code under test looks it up, at the moment it looks it up</strong>. If the module does <code>from gateway import charge</code>, patch <code>"yourmodule.charge"</code>; if it does <code>import gateway</code> and calls <code>gateway.charge()</code>, patch <code>"gateway.charge"</code>. Two related tools: <code>patch.object(some_object, "attribute")</code> takes the object itself rather than a string, and <code>patch.dict(os.environ, {...})</code> temporarily changes entries in a dictionary.</p>
  <p>Autospec matters most when combined with <code>patch</code>. Suppose the bank updates its API so that <code>charge</code> now requires a third argument, <code>idempotency_key</code>, which stops a retried payment being taken twice. Nobody has updated <code>checkout</code> yet, so production will crash. Here are two tests, one with a plain mock and one with <code>autospec=True</code>, run before and after the bank's change:</p>
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
  <div class="fx" data-lang="text">$ pytest -q test_autospec.py
..                                                                       [100%]
2 passed in 0.02s
$ pytest -q --tb=line test_autospec.py
.F                                                                       [100%]
=================================== FAILURES ===================================
E   TypeError: missing a required argument: 'idempotency_key'
/usr/local/lib/python3.13/inspect.py:3229: TypeError: missing a required argument: 'idempotency_key'
=========================== short test summary info ============================
FAILED test_autospec.py::test_autospec_mock - TypeError: missing a required a...
1 failed, 1 passed in 0.03s</div>
  <p>Before the change both pass. After the change (the second run, with the new <code>gateway.py</code>), the plain mock is still green, because a plain mock accepts any arguments, while production would fail. The autospec mock checked the call against the real signature and failed with exactly the error production would raise: <code>missing a required argument: 'idempotency_key'</code>. Using <code>autospec=True</code> costs nothing and keeps your doubles honest.</p>

  <h2 id="pmk-calls"><span class="num">06</span>Asserting Calls</h2>
  <p>Sometimes the return value of a function looks right while what it <em>did</em> was wrong. If <code>checkout</code> sent 184 to the gateway instead of 18400 paise, the receipt would still say ₹184, but the bank would charge ₹1.84. A stub cannot catch that, because it ignores its arguments. A mock can, because it records every call, and it offers assertion methods that check the record and fail with a clear message on a mismatch.</p>
  <div class="fx" data-lang="py"># test_calls.py
from unittest.mock import patch, call
import pytest
from checkout import checkout, checkout_with_retry

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
OK = {"status": "ok", "txn_id": "T-1"}

def test_charges_asha_in_paise():
    with patch("checkout.charge", return_value=OK) as fake:
        checkout(ASHA, "tok_asha")
    fake.assert_called_once_with(18400, "tok_asha")      # 184 rupees = 18400 paise

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
  <p>The three tests check three different things about the calls. The first checks that the gateway was called exactly once, with 18400 paise and Asha's card. The second checks something that did <em>not</em> happen: an invalid order must be refused before any money moves, so the gateway must never be called. The third compares the whole history of calls, <code>call_args_list</code>, with a list built from <code>call(...)</code> objects, confirming the retry sent identical arguments both times. Now break the code: someone "simplifies" <code>checkout</code> to <code>charge(amount, card)</code>, forgetting the multiplication by 100.</p>
  <div class="fx" data-lang="text">$ pytest -q --tb=line test_calls.py::test_charges_asha_in_paise
F                                                                        [100%]
=================================== FAILURES ===================================
E   AssertionError: expected call not found.
    Expected: charge(18400, 'tok_asha')
      Actual: charge(184, 'tok_asha')
/usr/local/lib/python3.13/unittest/mock.py:979: AssertionError: expected call not found.
=========================== short test summary info ============================
FAILED test_calls.py::test_charges_asha_in_paise - AssertionError: expected c...
1 failed in 0.04s</div>
  <p>Expected and actual are printed side by side: <code>charge(18400, 'tok_asha')</code> versus <code>charge(184, 'tok_asha')</code>. The receipt would still have said ₹184, so only the call check could catch this bug. Think of the difference between a customer's receipt and their bank statement: the receipt is the return value, the statement is the record of calls, and asserting calls means reading the statement.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Passes when</th></tr>
    <tr><td><code>m.assert_called()</code> / <code>m.assert_called_once()</code></td><td>Called at least once / exactly once</td></tr>
    <tr><td><code>m.assert_called_with(*a, **k)</code></td><td>The <em>last</em> call had these arguments</td></tr>
    <tr><td><code>m.assert_called_once_with(*a, **k)</code></td><td>Exactly one call, with these arguments</td></tr>
    <tr><td><code>m.assert_any_call(*a, **k)</code></td><td>Some call had these arguments</td></tr>
    <tr><td><code>m.assert_not_called()</code></td><td>Never called</td></tr>
    <tr><td><code>m.call_count</code>, <code>m.call_args</code>, <code>m.call_args_list</code></td><td>Read the record yourself</td></tr>
  </table>
  <p>Call assertions are the right tool when the call itself is the behaviour you care about: the amount charged, an email sent, nothing charged for invalid input. A related double, the <strong>spy</strong>, records calls while letting the real code run. <code>Mock(wraps=real_function)</code> creates one:</p>
  <div class="fx" data-lang="py">from unittest.mock import Mock
from till import bill

spy = Mock(wraps=bill)                       # records calls, runs the real bill
print(spy([("masala chai", 2, 30)]))         # 60 + 5% = 63, computed for real
print(spy.call_count, spy.call_args)</div>
  <div class="fx" data-lang="text">63
1 call([('masala chai', 2, 30)])</div>
  <p>The spy returned 63, computed by the real <code>bill</code> (60 plus 5%), and also recorded the call. Spies are useful when you want real behaviour but need to know how often something was called, for example to check that a cache prevents repeated expensive calls.</p>

  <h2 id="pmk-mp"><span class="num">07</span>pytest monkeypatch</h2>
  <p>pytest has its own tool for temporary replacements, the built-in <code>monkeypatch</code> fixture (fixtures are explained in <a class="xref" data-note="py_pytest">Testing with pytest</a>). "Monkeypatching" is the general name for changing an attribute of a module, class or object while the program runs. The fixture records every change you make through it and undoes all of them when the test ends, whether it passed or failed. Its main methods are <code>setattr(obj, "name", value)</code>, <code>setenv</code> and <code>delenv</code> for environment variables, <code>setitem</code> for dictionary entries and <code>chdir</code> for the working folder. Unlike <code>patch</code>, it does not create a mock for you; you pass whatever replacement you like, often a small plain function.</p>
  <div class="fx" data-lang="py"># test_monkeypatch.py
import os
import checkout, gateway

ASHA = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]

def test_with_monkeypatch(monkeypatch):
    seen = []
    def fake_charge(amount_paise, card):          # a plain function as the double
        seen.append((amount_paise, card))
        return {"status": "ok", "txn_id": "T-5"}
    monkeypatch.setattr(checkout, "charge", fake_charge)      # same rule: where it's used
    monkeypatch.setenv("CHAI_GATEWAY_KEY", "test-key")        # environment variables too
    assert checkout.checkout(ASHA, "tok_asha")["txn"] == "T-5"
    assert seen == [(18400, "tok_asha")]

def test_runs_after_and_sees_the_real_one():
    assert checkout.charge is gateway.charge                  # undone automatically
    assert "CHAI_GATEWAY_KEY" not in os.environ</div>
  <div class="fx" data-lang="text">$ pytest -q test_monkeypatch.py
..                                                                       [100%]
2 passed in 0.01s</div>
  <p>The first test replaces <code>checkout.charge</code> with a plain function that records its arguments in a list, and sets an environment variable. The "where it is looked up" rule is exactly the same as for <code>patch</code>: we set the attribute on the <code>checkout</code> module. The second test, which runs afterwards, proves the clean-up: <code>checkout.charge</code> is the real function again and the environment variable is gone. This is the hand-written <code>try/finally</code> swap from the beginning of the page, done for you. A hotel room works the same way: move the furniture as you like during your stay, and housekeeping puts everything back after you check out.</p>
  <table class="tbl">
    <tr><th></th><th><code>unittest.mock.patch</code></th><th>pytest <code>monkeypatch</code></th></tr>
    <tr><td>Comes from</td><td>Standard library</td><td>pytest fixture</td></tr>
    <tr><td>Target</td><td>Dotted string: <code>"checkout.charge"</code></td><td>Object and name: <code>(checkout, "charge")</code></td></tr>
    <tr><td>Default replacement</td><td>A MagicMock that records calls</td><td>Whatever you pass</td></tr>
    <tr><td>Environment, dicts, folder</td><td><code>patch.dict(os.environ, ...)</code></td><td><code>setenv</code>, <code>setitem</code>, <code>chdir</code></td></tr>
    <tr><td>Undone at</td><td>End of the <code>with</code> block or decorated function</td><td>End of the test</td></tr>
  </table>
  <p>One habit to avoid: monkeypatching outside a test, for example in a helper module's import-time code. Nothing undoes that change, and it leaks into every later test. Keep replacements inside tests and fixtures.</p>
  <p>The clock is a special case worth knowing, because "how do you mock the current time?" is a common question. The obvious attempt fails:</p>
  <div class="fx" data-lang="py">import datetime
from unittest.mock import patch
try:
    with patch("datetime.datetime.now"):
        pass
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: cannot set 'now' attribute of immutable type 'datetime.datetime'</div>
  <p><code>datetime.datetime</code> is a built-in type written in C, and its attributes cannot be replaced. The options are to patch the name <code>datetime</code> inside <em>your</em> module (where it is looked up, as always), to use a library such as freezegun or time-machine that freezes time globally, or, cleanest of all, to pass the time in as a parameter. That last option is a general design idea with its own name.</p>

  <h2 id="pmk-di"><span class="num">08</span>Dependency Injection</h2>
  <p>Every technique so far has worked around the same awkward fact: <code>checkout.py</code> reaches out and grabs the real gateway itself, through its import line. Tests then have to sneak in and replace a name behind the code's back, and they break if someone changes the import style. <strong>Dependency injection</strong> (DI) removes the problem at its root. Instead of a component importing or creating its dependency, the dependency is handed to it from outside, as a function parameter or when an object is created. The code only says "give me something that has a <code>charge(amount_paise, card)</code> method"; production code passes the real gateway, and tests pass a fake.</p>
  <p>Think of a mixer-grinder with detachable jars. To grind chutney instead of masala you do not rewire the motor; you click in a different jar. With DI, the gateway is a detachable jar. Patching is rewiring the motor for every test.</p>
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
    """In-memory gateway: simple real rules, no network, remembers every charge."""
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
    return Till(gateway)                  # no patching: we simply hand the fake in

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
  <p>The tests contain no patch strings and no knowledge of import lines: a fixture creates a <code>FakeGateway</code>, another fixture hands it to <code>Till</code>, and that is all. Read <code>test_two_customers</code> as a story: Asha pays 18400 paise and Ben 7400 (₹74), in that order. It checks the fake's <em>state</em>, what was charged, rather than which methods were called internally, so it keeps passing if <code>Till</code>'s internals are reorganised. The declined-card test checks both the exception and that nothing was charged. In production the wiring is a single line, and the real gateway module fits the same slot because it, too, has a <code>charge</code> function:</p>
  <div class="fx" data-lang="text">$ python3 -c "from till_app import Till; import gateway; print(Till(gateway).checkout([('samosa', 1, 15)], 'tok_x'))"
  !! REAL gateway called: charging 1600 paise to tok_x
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    from till_app import Till; import gateway; print(Till(gateway).checkout([('samosa', 1, 15)], 'tok_x'))
                                                     ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "~/chai/till_app.py", line 14, in checkout
    resp = self.gateway.charge(amount * 100, card)
  File "~/chai/gateway.py", line 11, in charge
    raise ConnectionError("pay.chaicorner.example: network unreachable")
ConnectionError: pay.chaicorner.example: network unreachable</div>
  <p>The real gateway was called, waited, and failed in this sandbox, exactly as before: designing for testability changed nothing about the production path. DI also makes dependencies visible in the code's signature, and makes it easy to swap implementations later, such as moving to a different payment provider. pytest fixtures themselves are a form of DI for tests.</p>
  <p>The weakness of fakes is drift. If the real gateway starts returning <code>"status": "OK"</code> in capitals, the fake still says <code>"ok"</code>, and the tests stay green while production breaks. Keep fakes small, share one fake across all tests instead of writing many, and run a few integration tests against the bank's sandbox to check that the fake still tells the truth.</p>

  <h2 id="pmk-over"><span class="num">09</span>Over-Mocking</h2>
  <p>Test doubles are for the outside world: things that are slow, unreliable, costly or uncontrollable. Once mocking becomes a habit, it is tempting to replace your own code as well, to "isolate" each function completely. That produces tests that pass while the code is broken. Here is a test that mocks the gateway <em>and</em> our own <code>bill</code>:</p>
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
  <p>Now a real bug arrives: someone types the discount as 1% instead of 10%, and <code>&gt;</code> instead of <code>&gt;=</code>. By hand: 195 − 1.95 = 193.05, plus 5% is 202.70, so Asha would be charged ₹203 instead of ₹184. We run the over-mocked test and the DI tests from the previous section (fake gateway, real <code>bill</code>) before and after the bug:</p>
  <div class="fx" data-lang="text">$ pytest -q test_overmocked.py test_till_app.py
...                                                                      [100%]
3 passed in 0.03s
$ python3 -c "from till import bill; print(bill([('masala chai', 2, 30), ('samosa', 3, 15), ('cold coffee', 1, 90)]))"
203
$ pytest -q --tb=line test_overmocked.py test_till_app.py
.F.                                                                      [100%]
=================================== FAILURES ===================================
E   AssertionError: assert [(20300, 'tok...0, 'tok_ben')] == [(18400, 'tok...0, 'tok_ben')]

      At index 0 diff: (20300, 'tok_asha') != (18400, 'tok_asha')
      Use -v to get more diff
~/chai/test_till_app.py:20: AssertionError: assert [(20300, 'tok...0, 'tok_ben')] == [(18400, 'tok...0, 'tok_ben')]
=========================== short test summary info ============================
FAILED test_till_app.py::test_two_customers - AssertionError: assert [(20300,...
1 failed, 2 passed in 0.04s</div>
  <p>Before the bug, all three tests pass. After it, the middle line confirms the real bill is now 203, and the run shows the difference between the two styles: the first dot is the over-mocked test, still <strong>green</strong> while Asha is overcharged by ₹19. It only checked that <code>checkout</code> passes a mocked 184 to a mocked gateway, which proves nothing about the bill. The DI test, with a fake gateway and the <em>real</em> <code>bill</code>, caught it immediately: 20300 paise charged instead of 18400. It is like a driving test where the examiner replaces the car, the road and the driver with cardboard cut-outs: everything "passes", and nothing was tested.</p>
  <p><strong>Over-mocking</strong> means replacing collaborators that are part of the behaviour being tested, so the test only verifies the wiring between mocks. Its two symptoms are tests that pass when the logic is broken and tests that fail when harmless code is reorganised, because they mirror the implementation line by line. The cure is to draw a line where your code meets the outside world and put doubles only on the far side of it. Mock the payment gateway, HTTP APIs, email and SMS, the clock, randomness, and slow or paid services. Keep real your own functions, data structures, pandas operations and pure calculations. When both would work, prefer a fake with a state check over a mock with call checks, and assert on results whenever you can.</p>

  <h2 id="pmk-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most common mistake is patching where a function is defined instead of where it is looked up. The symptom is unmistakable once you know it: the "mocked" test is slow, hits the network, or the mock's <code>call_count</code> is 0. In our example, <code>patch("gateway.charge")</code> left <code>checkout</code> calling the real gateway; <code>patch("checkout.charge")</code> fixed it.</p>
  <p>The second is trusting plain mocks to match reality. A plain Mock accepts misspelt attributes and outdated call signatures, so tests stay green when the real API changes. Use <code>autospec=True</code> or <code>create_autospec</code>, which made the <code>idempotency_key</code> change fail the test as it should.</p>
  <p>The third is mocking your own logic, which hid a ₹203 overcharge behind a green test. Mock only the boundary. Related to it is asserting only the return value when the side effect is what matters: the receipt said ₹184 while the gateway was asked for ₹1.84, and only <code>assert_called_once_with(18400, ...)</code> noticed.</p>
  <p>Several smaller mistakes are about mechanics. Swapping a name with plain assignment and no guaranteed restore leaks a stub into later tests; use <code>patch</code> or <code>monkeypatch</code>. A <code>side_effect</code> list shorter than the number of calls ends in a confusing <code>StopIteration</code>. With stacked <code>@patch</code> decorators, the bottom decorator supplies the <em>first</em> mock argument, and getting the order wrong silently swaps your assertions between mocks (in <code>test_overmocked.py</code>, the bottom <code>@patch("checkout.bill")</code> supplies <code>fake_bill</code>). Finally, fakes drift away from the real service unless a few integration tests keep them honest.</p>

  <h2 id="pmk-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why and what</h3>
  <ul>
    <li>Real dependencies (network, DB, clock, randomness, paid APIs) make tests slow, flaky, costly and unable to trigger failures on demand.</li>
    <li><b>System under test</b>: the code being checked. <b>Dependency</b>: what it calls. <b>Test double</b>: a replacement used during a test.</li>
  </ul>
  <table class="tbl">
    <tr><th>Double</th><th>Does</th><th>You check</th></tr>
    <tr><td>Dummy</td><td>Fills a parameter, unused</td><td>nothing</td></tr>
    <tr><td>Stub</td><td>Canned answers</td><td>the system's result</td></tr>
    <tr><td>Fake</td><td>Simplified working version (in-memory gateway)</td><td>its state (state verification)</td></tr>
    <tr><td>Mock</td><td>Records calls</td><td>the calls (behaviour verification)</td></tr>
    <tr><td>Spy</td><td>Wraps the real thing and records</td><td>calls, with real behaviour: <code>Mock(wraps=f)</code></td></tr>
  </table>
  <h3>unittest.mock</h3>
  <ul>
    <li><code>Mock()</code>: any attribute (auto-created), any call, all recorded. <code>MagicMock</code>: plus magic methods. <code>patch</code> creates MagicMock by default.</li>
    <li><code>create_autospec(obj)</code> / <code>patch(..., autospec=True)</code>: real attributes and signatures enforced. <code>Mock(spec=Cls)</code>: attribute names only.</li>
    <li><code>return_value</code>: same answer every call. <code>side_effect</code>: exception (raise every call), iterable (one per call, exceptions raised, <code>StopIteration</code> when exhausted) or function (called with the same arguments). <code>side_effect</code> wins.</li>
    <li><code>AsyncMock</code> for <code>async def</code>; <code>mock_open(read_data=...)</code> for <code>open</code>.</li>
  </ul>
  <h3>patch</h3>
  <div class="fx" data-lang="py">from unittest.mock import patch, call

with patch("checkout.charge", return_value={"status": "ok", "txn_id": "T-1"}) as fake:
    checkout(ASHA, "tok_asha")
fake.assert_called_once_with(18400, "tok_asha")

@patch("checkout.charge", autospec=True)       # decorator: mock arrives as an argument
def test_x(fake): ...

patch.object(obj, "attr")                      # target by object
patch.dict(os.environ, {"KEY": "v"})           # temporary dict entries</div>
  <ul>
    <li><b>Patch where the name is looked up</b>: <code>from gateway import charge</code> in <code>checkout.py</code> → <code>patch("checkout.charge")</code>; <code>import gateway</code> + <code>gateway.charge()</code> → <code>patch("gateway.charge")</code>.</li>
    <li>Stacked <code>@patch</code>: bottom decorator → first argument.</li>
    <li>Built-in C types such as <code>datetime.datetime</code> cannot be patched in place: patch your module's name, inject the time, or use freezegun.</li>
  </ul>
  <h3>Asserting calls</h3>
  <ul>
    <li><code>assert_called()</code>, <code>assert_called_once()</code>, <code>assert_called_with()</code> (last call), <code>assert_called_once_with()</code>, <code>assert_any_call()</code>, <code>assert_not_called()</code>.</li>
    <li><code>call_count</code>, <code>call_args</code>, <code>call_args_list == [call(...), ...]</code>.</li>
  </ul>
  <h3>monkeypatch, DI, over-mocking</h3>
  <ul>
    <li><code>monkeypatch.setattr(module, "name", value)</code>, <code>setenv</code>, <code>delenv</code>, <code>setitem</code>, <code>chdir</code>; all undone at test end.</li>
    <li>Dependency injection: pass collaborators in (<code>Till(gateway)</code>, <code>f(now=None)</code>); tests pass a fake, production the real thing; no patch strings.</li>
    <li>Mock the boundary only; keep your own logic real; prefer fake + state check; check calls when the call is the behaviour.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Patching where defined → real dependency still called.</li>
    <li>Plain mocks accept typos and outdated signatures → autospec.</li>
    <li>Mocking your own code → green tests, wrong results.</li>
    <li>Bare assignment swaps leak into later tests.</li>
    <li>Return value right, side effect wrong (184 vs 18400 paise) → assert the calls.</li>
  </ul>

  <h2 id="pmk-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a test double, and why replace external services in unit tests?</summary><div class="qa-body">A test double is an object that stands in for a real dependency during a test. External services make unit tests slow, flaky, costly or harmful (real charges, real emails) and uncontrollable, since you cannot make them time out or decline on demand, so error paths go untested. With a double the test is fast, repeatable and checks your logic rather than the third party.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Stub versus fake versus mock versus spy?</summary><div class="qa-body">A stub returns canned answers and you check your code's result. A fake is a simplified working implementation, such as an in-memory gateway, and you check its state afterwards. A mock records the calls it receives and you assert on those calls. A spy wraps the real object and records calls while the real behaviour runs. A dummy just fills an unused parameter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Mock versus MagicMock?</summary><div class="qa-body">Both accept any attribute and any call and record calls. MagicMock also has Python's magic methods preconfigured, such as <code>__len__</code>, <code>__iter__</code> and <code>__enter__</code>/<code>__exit__</code>, so it can stand in for containers and context managers: <code>len(Mock())</code> raises <code>TypeError</code>, <code>len(MagicMock())</code> returns 0. <code>patch</code> creates a MagicMock by default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>return_value</code> versus <code>side_effect</code>?</summary><div class="qa-body"><code>return_value</code> is returned by every call. <code>side_effect</code> can be an exception raised on every call, an iterable giving one result per call (exception items are raised), or a function called with the same arguments whose result is returned. If both are set, <code>side_effect</code> wins. It is how you simulate timeouts, retries and answers that depend on the arguments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><span>What does this print?
  <div class="fx" data-lang="py">from unittest.mock import Mock
m = Mock(side_effect=[1, ValueError("boom"), 3])
print(m())
try:
    m()
except ValueError as e:
    print("raised", e)
print(m())
print(m.call_count)
try:
    m()
except StopIteration:
    print("StopIteration")</div></span></summary><div class="qa-body"><div class="fx" data-lang="text">1
raised boom
3
3
StopIteration</div>Each call takes the next item; an exception item is raised instead of returned. The call that raised still counts, so <code>call_count</code> is 3. A fourth call finds the list exhausted and raises <code>StopIteration</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your module does <code>from gateway import charge</code>. You patch <code>"gateway.charge"</code> and the real gateway is still called. Why, and what is the fix?</summary><div class="qa-body">The import created a second name, <code>yourmodule.charge</code>, bound to the real function when the module was imported. <code>patch</code> rebinds only <code>gateway.charge</code>, but your code looks up <code>yourmodule.charge</code>. Patch where the name is looked up: <code>patch("yourmodule.charge")</code>. If the code did <code>import gateway</code> and calls <code>gateway.charge(...)</code>, then patching <code>"gateway.charge"</code> works, because the lookup goes through the module at call time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>With stacked <code>@patch</code> decorators, in which order do the mocks arrive?</summary><div class="qa-body">Bottom up: the decorator closest to the function is applied first, so it supplies the first mock argument. <code>@patch("app.send_email")</code> above <code>@patch("app.charge")</code> gives <code>def test(mock_charge, mock_send_email)</code>. Getting it wrong silently swaps your assertions between mocks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does autospec protect you from?</summary><div class="qa-body">Drift between the mock and the real API. A plain Mock accepts misspelt attributes and any arguments, so tests stay green when the real signature changes. <code>autospec=True</code> or <code>create_autospec(obj)</code> builds a mock with the real attributes and signatures, so a call the real object would reject raises <code>TypeError</code>, for example "missing a required argument: 'idempotency_key'".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you assert that a dependency was called correctly, or not at all?</summary><div class="qa-body">Use <code>assert_called_once_with(...)</code> for exactly one call with given arguments, <code>assert_called_with(...)</code> for the last call, <code>assert_any_call(...)</code>, and <code>assert_not_called()</code>; or compare <code>call_args_list</code> with a list of <code>call(...)</code> objects and check <code>call_count</code>. Use them when the call is the behaviour: the amount charged, an email sent, nothing charged for an invalid order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you mock <code>datetime.now()</code>?</summary><div class="qa-body"><code>patch("datetime.datetime.now")</code> fails with "cannot set 'now' attribute of immutable type", because <code>datetime</code> is a built-in C type. Patch the name <code>datetime</code> in your own module with a mock whose <code>now.return_value</code> is fixed, use a library such as freezegun or time-machine, or, most cleanly, pass the time or a clock function in as a parameter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you unit-test a function that calls a REST API with <code>requests</code>?</summary><div class="qa-body">Patch the name your module uses, for example <code>patch("mymodule.requests.get")</code>, set <code>get.return_value.status_code = 200</code> and <code>get.return_value.json.return_value = {...}</code>, then assert on your function's result and on <code>get.assert_called_once_with(url, timeout=5)</code>. Use <code>side_effect=requests.Timeout</code> for the error path. Alternatives are the <code>responses</code> library to stub at the HTTP level, or injecting a client object and passing a fake.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you mock an async function, a file read or an environment variable?</summary><div class="qa-body">For async code use <code>AsyncMock(return_value=...)</code>, checked with <code>assert_awaited_once_with</code>; <code>patch</code> uses it automatically for <code>async def</code> targets. For files, <code>patch("builtins.open", mock_open(read_data="..."))</code>, though writing a real file to <code>tmp_path</code> is often simpler. For environment variables, <code>monkeypatch.setenv("KEY", "v")</code> or <code>patch.dict(os.environ, {"KEY": "v"})</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>patch</code> versus pytest's <code>monkeypatch</code>?</summary><div class="qa-body"><code>patch</code> is in the standard library, takes a dotted string, inserts a MagicMock by default, and works as a context manager or decorator in any framework. <code>monkeypatch</code> is a pytest fixture that sets whatever value you give on an object and attribute name, also handles environment variables, dict items and the working folder, and undoes everything at the end of the test. The "where it is looked up" rule applies to both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dependency injection, and why does it make testing easier?</summary><div class="qa-body">Passing a component's collaborators into it, through constructor or function parameters, instead of the component importing or creating them. Tests hand in a fake or mock, production hands in the real implementation. There are no patch strings tied to import details, dependencies are visible in the signature, and swapping implementations needs no code change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is over-mocking, and how do you avoid it?</summary><div class="qa-body">Replacing collaborators that are part of the behaviour under test, so the test only checks wiring between mocks. Such tests pass when the logic is broken (a mocked <code>bill</code> hid a ₹203 overcharge) and fail on harmless refactors. Avoid it by mocking only at the system boundary (network, database, clock, randomness, paid services), keeping your own code real, and asserting on results or state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>State verification or behaviour verification: which do you prefer?</summary><div class="qa-body">State verification checks results or a fake's state afterwards; behaviour verification checks the calls made on a mock. Prefer state verification, because it is less tied to how the code is written and survives refactors. Use behaviour verification when the interaction itself is the requirement and leaves no state to inspect, such as "send exactly one email" or "never call the gateway for an invalid order".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you keep a fake or mock from drifting away from the real service?</summary><div class="qa-body">Use autospec so signatures are enforced; keep one small shared fake close to the real contract; run a few integration or contract tests against the real service's sandbox, or replay recorded real responses, so a change in the real API breaks a test; and review fakes when the dependency's version changes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you spy on a real function, letting it run but recording calls?</summary><div class="qa-body"><code>spy = Mock(wraps=real_function)</code>: calling the spy runs the real function and returns its result while recording the call. With patch: <code>patch("module.func", wraps=module.func)</code> or <code>patch.object(obj, "method", wraps=obj.method)</code>. It is useful for checking that a cache prevents repeated calls while the real computation still happens.</div></details>
</main>
`
});
