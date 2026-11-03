// notes/python/py_mocking.js — x
Object.assign(TOPIC_CONTENT, {
  "py_mocking": `<p>doubles</p>  <div class="fx" data-lang="py"># doubles.py
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
<p>mock_basics</p>  <div class="fx" data-lang="py">from unittest.mock import Mock, MagicMock

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
&lt;Mock name='mock.chrage' id='139725514338192'&gt;
Mock: object of type 'Mock' has no len()
MagicMock len: 0</div>
<p>autospec_basic</p>  <div class="fx" data-lang="py">from unittest.mock import create_autospec
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
<p>side_effects</p>  <div class="fx" data-lang="py">from unittest.mock import Mock

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
<p>names</p>  <div class="fx" data-lang="py">from unittest.mock import patch
import gateway, checkout

with patch("gateway.charge") as m:
    print("gateway.charge  is the mock:", gateway.charge is m)
    print("checkout.charge is the mock:", checkout.charge is m)
    print("checkout.charge is still   :", checkout.charge.__module__ + "." + checkout.charge.__name__)</div>
  <div class="fx" data-lang="text">gateway.charge  is the mock: True
checkout.charge is the mock: False
checkout.charge is still   : gateway.charge</div>
<p>spy</p>  <div class="fx" data-lang="py">from unittest.mock import Mock
from till import bill

spy = Mock(wraps=bill)                       # records calls, runs the real bill
print(spy([("masala chai", 2, 30)]))         # 60 + 5% = 63, computed for real
print(spy.call_count, spy.call_args)</div>
  <div class="fx" data-lang="text">63
1 call([('masala chai', 2, 30)])</div>
<p>qa_se</p>  <div class="fx" data-lang="py">from unittest.mock import Mock
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
    print("StopIteration")</div>
  <div class="fx" data-lang="text">1
raised boom
3
3
StopIteration</div>
<p>dt</p>  <div class="fx" data-lang="py">import datetime
from unittest.mock import patch
try:
    with patch("datetime.datetime.now"):
        pass
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: cannot set 'now' attribute of immutable type 'datetime.datetime'</div>
<p>real</p>  <div class="fx" data-lang="text">$ pytest -q -s --tb=short test_checkout_real.py
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
<p>retry</p>  <div class="fx" data-lang="text">$ pytest -q test_retry.py
..                                                                       [100%]
2 passed in 0.02s</div>
<p>where</p>  <div class="fx" data-lang="text">$ pytest -q -s --tb=line test_patch_where.py
  !! REAL gateway called: charging 18400 paise to tok_asha
F.
=================================== FAILURES ===================================
E   ConnectionError: pay.chaicorner.example: network unreachable
~/chai/gateway.py:11: ConnectionError: pay.chaicorner.example: network unreachable
=========================== short test summary info ============================
FAILED test_patch_where.py::test_patch_where_defined - ConnectionError: pay.c...
1 failed, 1 passed in 2.03s</div>
<p>v2</p>  <div class="fx" data-lang="text">$ pytest -q -s test_patch_v2.py
.
1 passed in 0.03s</div>
<p>autospec</p>  <div class="fx" data-lang="text">$ pytest -q test_autospec.py
..                                                                       [100%]
2 passed in 0.04s
$ pytest -q --tb=line test_autospec.py
.F                                                                       [100%]
=================================== FAILURES ===================================
E   TypeError: missing a required argument: 'idempotency_key'
/usr/local/lib/python3.13/inspect.py:3229: TypeError: missing a required argument: 'idempotency_key'
=========================== short test summary info ============================
FAILED test_autospec.py::test_autospec_mock - TypeError: missing a required a...
1 failed, 1 passed in 0.03s</div>
<p>calls</p>  <div class="fx" data-lang="text">$ pytest -q test_calls.py
...                                                                      [100%]
3 passed in 0.03s</div>
<p>callsbug</p>  <div class="fx" data-lang="text">$ pytest -q --tb=line test_calls.py::test_charges_asha_in_paise
F                                                                        [100%]
=================================== FAILURES ===================================
E   AssertionError: expected call not found.
    Expected: charge(18400, 'tok_asha')
      Actual: charge(184, 'tok_asha')
/usr/local/lib/python3.13/unittest/mock.py:979: AssertionError: expected call not found.
=========================== short test summary info ============================
FAILED test_calls.py::test_charges_asha_in_paise - AssertionError: expected c...
1 failed in 0.04s</div>
<p>mp</p>  <div class="fx" data-lang="text">$ pytest -q test_monkeypatch.py
..                                                                       [100%]
2 passed in 0.01s</div>
<p>di</p>  <div class="fx" data-lang="text">$ pytest -q test_till_app.py
..                                                                       [100%]
2 passed in 0.02s</div>
<p>prod</p>  <div class="fx" data-lang="text">$ python3 -c "from till_app import Till; import gateway; print(Till(gateway).checkout([('samosa', 1, 15)], 'tok_x'))" 2&gt;&amp;1 | tail -4
    resp = self.gateway.charge(amount * 100, card)
  File "~/chai/gateway.py", line 11, in charge
    raise ConnectionError("pay.chaicorner.example: network unreachable")
ConnectionError: pay.chaicorner.example: network unreachable</div>
<p>over</p>  <div class="fx" data-lang="text">$ pytest -q test_overmocked.py test_till_app.py
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
1 failed, 2 passed in 0.03s</div>
`
});
