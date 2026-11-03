// notes/python/py_debugging.js — x
Object.assign(TOPIC_CONTENT, {
  "py_debugging": `<p>time_it</p>  <div class="fx" data-lang="py">import time
from bigday import make_day
from report import daily_report

day = make_day(20_000)
print(day[0])

start = time.perf_counter()                      # a high-resolution stopwatch
result = daily_report(day)
elapsed = time.perf_counter() - start
print(result)
print(f"daily_report took {elapsed:.2f} s")

for n in (2_500, 5_000, 10_000, 20_000):         # how does the time grow with n?
    d = make_day(n)
    t0 = time.perf_counter()
    daily_report(d)
    print(f"n={n:&gt;6}: {time.perf_counter() - t0:.3f} s")</div>
  <div class="fx" data-lang="text">('cust12624', [('masala chai', 3, 30), ('samosa', 2, 15)])
{'orders': 20000, 'customers': 12598, 'sales': 2990934, 'top_item': 'vada pav'}
daily_report took 1.81 s
n=  2500: 0.017 s
n=  5000: 0.065 s
n= 10000: 0.259 s
n= 20000: 1.959 s</div>
<p>micro</p>  <div class="fx" data-lang="py">import timeit
names_list = [f"cust{i}" for i in range(12_600)]      # about as many as the day's customers
names_set = set(names_list)
for stmt in ['"cust99999" in names_list', '"cust99999" in names_set']:
    runs = timeit.repeat(stmt, globals=globals(), number=1_000, repeat=5)
    print(f"{stmt:&lt;28} best of 5: {min(runs) / 1_000 * 1e9:9.0f} ns per check")</div>
  <div class="fx" data-lang="text">"cust99999" in names_list    best of 5:     73492 ns per check
"cust99999" in names_set     best of 5:        18 ns per check</div>
<p>prof</p>  <div class="fx" data-lang="py">import cProfile, pstats
from bigday import make_day
from report import daily_report

day = make_day(20_000)
with cProfile.Profile() as pr:                   # record every function call
    daily_report(day)
stats = pstats.Stats(pr)
stats.sort_stats("cumulative").print_stats(6)    # top 6 by time including callees</div>
  <div class="fx" data-lang="text">         232264 function calls in 1.862 seconds

   Ordered by: cumulative time
   List reduced from 14 to 6 due to restriction &lt;6&gt;

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    1.760    1.760    1.862    1.862 ~/chai/report.py:4(daily_report)
    20000    0.030    0.000    0.089    0.000 ~/chai/till.py:14(bill)
    20000    0.015    0.000    0.043    0.000 ~/chai/till.py:5(subtotal)
    20000    0.018    0.000    0.028    0.000 {built-in method builtins.sum}
    59830    0.010    0.000    0.010    0.000 ~/chai/till.py:6(&lt;genexpr&gt;)
    39830    0.008    0.000    0.008    0.000 {method 'get' of 'dict' objects}</div>
<p>lineprof</p>  <div class="fx" data-lang="py">from line_profiler import LineProfiler
from bigday import make_day
from report import daily_report

day = make_day(20_000)
lp = LineProfiler(daily_report)          # time every line of this one function
lp.runcall(daily_report, day)
lp.print_stats(output_unit=1e-3)         # times in milliseconds</div>
  <div class="fx" data-lang="text">Timer unit: 0.001 s

Total time: 2.02682 s
File: ~/chai/report.py
Function: daily_report at line 4

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
     4                                           def daily_report(orders):
     5                                               """orders: list of (customer, lines). Summarise the day."""
     6         1          0.0      0.0      0.0      sales = 0
     7         1          0.0      0.0      0.0      customers = []
     8         1          0.0      0.0      0.0      items = {}
     9     20001          8.0      0.0      0.4      for customer, lines in orders:
    10     20000        143.7      0.0      7.1          sales += bill(lines)
    11     20000       1824.3      0.1     90.0          if customer not in customers:          # have we seen this customer today?
    12     12598          7.8      0.0      0.4              customers.append(customer)
    13     59830         24.8      0.0      1.2          for item, qty, price in lines:
    14     39830         18.3      0.0      0.9              items[item] = items.get(item, 0) + qty
    15         1          0.0      0.0      0.0      top = max(items, key=items.get) if items else None
    16         2          0.0      0.0      0.0      return {"orders": len(orders), "customers": len(customers),
    17         1          0.0      0.0      0.0              "sales": sales, "top_item": top}</div>
<p>compare</p>  <div class="fx" data-lang="py">import timeit
from bigday import make_day
import report, report_fast

day = make_day(20_000)
assert report.daily_report(day) == report_fast.daily_report(day)   # same answer FIRST
for mod in (report, report_fast):
    best = min(timeit.repeat(lambda: mod.daily_report(day), number=1, repeat=3))
    print(f"{mod.__name__:&lt;12} {best * 1000:8.1f} ms")</div>
  <div class="fx" data-lang="text">report         1802.6 ms
report_fast      24.0 ms</div>
<p>prof2</p>  <div class="fx" data-lang="py">import cProfile, pstats
from bigday import make_day
from report_fast import daily_report

day = make_day(20_000)
with cProfile.Profile() as pr:
    daily_report(day)
pstats.Stats(pr).sort_stats("tottime").print_stats(4)    # top 4 by OWN time</div>
  <div class="fx" data-lang="text">         239666 function calls in 0.120 seconds

   Ordered by: internal time
   List reduced from 14 to 4 due to restriction &lt;4&gt;

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
    20000    0.028    0.000    0.074    0.000 ~/chai/till.py:14(bill)
        1    0.027    0.027    0.120    0.120 ~/chai/report_fast.py:4(daily_report)
    20000    0.015    0.000    0.024    0.000 {built-in method builtins.sum}
    20000    0.011    0.000    0.011    0.000 {method 'add' of 'set' objects}</div>
<p>mem</p>  <div class="fx" data-lang="py">import os, tracemalloc
from bigday import make_day
from receipts import receipt, print_all_list, print_all_stream

day = make_day(20_000)
print(receipt(*day[0]))

for fn in (print_all_list, print_all_stream):
    with open(os.devnull, "w") as out:
        tracemalloc.start()                          # start counting allocations
        fn(day, out)
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
    print(f"{fn.__name__:&lt;17} peak {peak / 1e6:6.2f} MB   still held {current / 1e6:5.2f} MB")

tracemalloc.start()
texts = [receipt(c, l) for c, l in day]              # who is holding the memory?
snap = tracemalloc.take_snapshot()
for stat in snap.statistics("lineno")[:3]:
    print(stat)</div>
  <div class="fx" data-lang="text">Chai Corner - cust12624
masala chai  3 x  30
samosa       2 x  15
TOTAL Rs 126

print_all_list    peak   5.71 MB   still held  0.00 MB
print_all_stream  peak   0.02 MB   still held  0.01 MB
~/chai/receipts.py:6: size=2322 KiB, count=20000, average=119 B
mem.py:17: size=169 KiB, count=1, average=169 KiB</div>
<p>log1</p>  <div class="fx" data-lang="py">import logging
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)-7s %(name)s: %(message)s",
                    datefmt="%H:%M:%S")
log = logging.getLogger("till")

print("billed Asha 184")                           # print: no time, no level, no source
log.info("billed %s %d", "Asha", 184)              # INFO  &gt;= INFO: kept
log.debug("discount check: sub=%d", 195)           # DEBUG &lt;  INFO: dropped
log.warning("qty %r for %s is text, converting", "2", "Dev")
log.error("payment for %s failed", "Chen")</div>
  <div class="fx" data-lang="text">billed Asha 184
06:15:58 INFO    till: billed Asha 184
06:15:58 WARNING till: qty '2' for Dev is text, converting
06:15:58 ERROR   till: payment for Chen failed</div>
<p>main</p>  <div class="fx" data-lang="py"># main.py
from setup_logging import setup_logging
from payments import take_payment
from report_log import report

setup_logging("till.log")
take_payment("Chen", 52)
print("total:", report({"Asha": 184, "Ben": 74, "Chen": 52}))
print("--- till.log ---")
print(open("till.log").read())</div>
  <div class="fx" data-lang="text">ERROR    till.payments: payment failed for Chen (Rs 52)
Traceback (most recent call last):
  File "~/chai/payments.py", line 8, in take_payment
    raise ConnectionError("gateway unreachable")   # the outside world fails
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
ConnectionError: gateway unreachable
total: 310
--- till.log ---
06:15:58 DEBUG till.payments payments.py:6 charging Chen Rs 52
06:15:58 ERROR till.payments payments.py:10 payment failed for Chen (Rs 52)
Traceback (most recent call last):
  File "~/chai/payments.py", line 8, in take_payment
    raise ConnectionError("gateway unreachable")   # the outside world fails
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
ConnectionError: gateway unreachable
06:15:58 INFO till.report report_log.py:6 report for 3 customers
06:15:58 DEBUG till.report report_log.py:7 bills={'Asha': 184, 'Ben': 74, 'Chen': 52}</div>
<p>main2</p>  <div class="fx" data-lang="py"># main2.py
import logging
from setup_logging import setup_logging
from report_log import report

setup_logging("till.log")
logging.getLogger("till.report").setLevel(logging.WARNING)   # mute one noisy module
report({"Asha": 184})
print(open("till.log").read() or "(till.log is empty: report's INFO and DEBUG were dropped)")

setup_logging("till.log")              # BUG: configured a second time...
logging.getLogger("till.payments").warning("gateway slow: %d ms", 2300)</div>
  <div class="fx" data-lang="text">(till.log is empty: report's INFO and DEBUG were dropped)
WARNING  till.payments: gateway slow: 2300 ms
WARNING  till.payments: gateway slow: 2300 ms</div>
<p>lazy</p>  <div class="fx" data-lang="py">import logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("till")

class Day:
    def __str__(self):
        print("   (building a 20,000-line summary...)")
        return "&lt;day summary&gt;"

log.debug(f"day: {Day()}")       # f-string: built BEFORE logging sees it, then dropped
log.debug("day: %s", Day())      # %-style args: logging drops the record first, never builds it
print("done")</div>
  <div class="fx" data-lang="text">   (building a 20,000-line summary...)
done</div>
<p>jsonlog</p>  <div class="fx" data-lang="py">import json, logging, sys

class JsonFormatter(logging.Formatter):
    def format(self, record):
        doc = {"ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
               "level": record.levelname, "logger": record.name,
               "msg": record.getMessage()}
        doc.update(getattr(record, "ctx", {}))      # extra fields passed with extra=
        return json.dumps(doc)

h = logging.StreamHandler(sys.stdout)
h.setFormatter(JsonFormatter())
log = logging.getLogger("till.payments")
log.addHandler(h)
log.setLevel(logging.INFO)

log.info("payment ok", extra={"ctx": {"customer": "Asha", "amount": 184, "latency_ms": 412}})</div>
  <div class="fx" data-lang="text">{"ts": "2026-11-03T06:15:58", "level": "INFO", "logger": "till.payments", "msg": "payment ok", "customer": "Asha", "amount": 184, "latency_ms": 412}</div>
<p>qa_log</p>  <div class="fx" data-lang="py">import logging
logging.info("a")
logging.warning("b")
log = logging.getLogger("app")
log.debug("c")
log.error("d")</div>
  <div class="fx" data-lang="text">WARNING:root:b
ERROR:app:d</div>
<p>hyp</p>  <div class="fx" data-lang="py">from decimal import Decimal
print([round(x) for x in (0.5, 1.5, 2.5, 52.5, 53.5)])
print(Decimal(52.5), Decimal(184.275))
print(Decimal(str(184.275)))</div>
  <div class="fx" data-lang="text">[0, 2, 2, 52, 54]
52.5 184.275000000000005684341886080801486968994140625
184.275</div>
<p>crash</p>  <div class="fx" data-lang="text">$ python3 crash.py
Traceback (most recent call last):
  File "~/chai/crash.py", line 10, in &lt;module&gt;
    print(daily_report(orders))
          ~~~~~~~~~~~~^^^^^^^^
  File "~/chai/report.py", line 10, in daily_report
    sales += bill(lines)
             ~~~~^^^^^^^
  File "~/chai/till.py", line 16, in bill
    if qty &lt; 0:
       ^^^^^^^
TypeError: '&lt;' not supported between instances of 'str' and 'int'</div>
<p>chen</p>  <div class="fx" data-lang="text">$ python3 chen.py
Chen pays 52</div>
<p>prints</p>  <div class="fx" data-lang="text">$ python3 chen.py
DEBUG sub = 50
DEBUG after = 50
DEBUG total = 52.5
Chen pays 52</div>
<p>bpoff</p>  <div class="fx" data-lang="text">$ PYTHONBREAKPOINT=0 python3 chen.py
Chen pays 52</div>
<p>timeit_cli</p>  <div class="fx" data-lang="text">$ python3 -m timeit -s "from till import bill; o = [('samosa', 2, 15), ('vada pav', 1, 20)]" "bill(o)"
500000 loops, best of 5: 363 nsec per loop</div>
<p>caplog</p>  <div class="fx" data-lang="text">$ pytest -q test_bill_log.py
..                                                                       [100%]
2 passed in 0.01s</div>
<p>repro</p>  <div class="fx" data-lang="text">$ pytest -q tests/test_rounding.py
F                                                                        [100%]
=================================== FAILURES ===================================
___________________________ test_chen_rounds_half_up ___________________________

    def test_chen_rounds_half_up():
        chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
&gt;       assert bill(chen) == 53                  # board rule: 52.5 rounds UP
        ^^^^^^^^^^^^^^^^^^^^^^^
E       AssertionError: assert 52 == 53
E        +  where 52 = bill([('samosa', 2, 15), ('vada pav', 1, 20)])

tests/test_rounding.py:6: AssertionError
=========================== short test summary info ============================
FAILED tests/test_rounding.py::test_chen_rounds_half_up - AssertionError: ass...
1 failed in 0.02s</div>
<p>fix1</p>  <div class="fx" data-lang="text">$ pytest -q --tb=no -rf tests
FF........                                                               [100%]
=========================== short test summary info ============================
FAILED tests/test_bill.py::test_each_bill - AssertionError: assert {'Asha': 1...
FAILED tests/test_bill.py::test_day_total - assert 311 == 310
2 failed, 8 passed in 0.02s</div>
<p>fix2</p>  <div class="fx" data-lang="text">$ pytest -q tests
..........                                                               [100%]
10 passed in 0.01s</div>
<p>bp</p>  <div class="fx" data-lang="text">$ python3 chen.py
&gt; ~/chai/till.py(18)bill()
-&gt; breakpoint()                                  # pause here
(Pdb) p lines
[('samosa', 2, 15), ('vada pav', 1, 20)]
(Pdb) n
&gt; ~/chai/till.py(19)bill()
-&gt; sub = subtotal(lines)
(Pdb) n
&gt; ~/chai/till.py(20)bill()
-&gt; after = sub - discount(sub)
(Pdb) p sub
50
(Pdb) s
--Call--
&gt; ~/chai/till.py(8)discount()
-&gt; def discount(sub):
(Pdb) r
--Return--
&gt; ~/chai/till.py(9)discount()-&gt;0
-&gt; return sub * 0.10 if sub &gt;= 150 else 0
(Pdb) n
&gt; ~/chai/till.py(21)bill()
-&gt; total = with_tax(after)
(Pdb) p after
50
(Pdb) n
&gt; ~/chai/till.py(22)bill()
-&gt; return round(total)
(Pdb) p total
52.5
(Pdb) p round(total), round(53.5), round(0.5), round(1.5), round(2.5)
(52, 54, 0, 2, 2)
(Pdb) ll
 14  	def bill(lines):
 15  	    for item, qty, price in lines:
 16  	        if qty &lt; 0:
 17  	            raise ValueError(f"qty must be non-negative, got {qty} for {item!r}")
 18  	    breakpoint()                                  # pause here
 19  	    sub = subtotal(lines)
 20  	    after = sub - discount(sub)
 21  	    total = with_tax(after)
 22  -&gt;	    return round(total)
(Pdb) w
  ~/chai/chen.py(4)&lt;module&gt;()
-&gt; print("Chen pays", bill(chen))      # the price board says halves round up: expected 53
&gt; ~/chai/till.py(22)bill()
-&gt; return round(total)
(Pdb) c
Chen pays 52</div>
<p>pm</p>  <div class="fx" data-lang="text">$ python3 -m pdb crash.py
&gt; ~/chai/crash.py(2)&lt;module&gt;()
-&gt; from report import daily_report
(Pdb) c
Traceback (most recent call last):
  File "/usr/local/lib/python3.13/pdb.py", line 2524, in main
    pdb._run(target)
    ~~~~~~~~^^^^^^^^
  File "/usr/local/lib/python3.13/pdb.py", line 2264, in _run
    self.run(target.code)
    ~~~~~~~~^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/bdb.py", line 680, in run
    exec(cmd, globals, locals)
    ~~~~^^^^^^^^^^^^^^^^^^^^^^
  File "&lt;string&gt;", line 1, in &lt;module&gt;
  File "~/chai/crash.py", line 10, in &lt;module&gt;
    print(daily_report(orders))
          ~~~~~~~~~~~~^^^^^^^^
  File "~/chai/report.py", line 10, in daily_report
    sales += bill(lines)
             ~~~~^^^^^^^
  File "~/chai/till.py", line 16, in bill
    if qty &lt; 0:
       ^^^^^^^
TypeError: '&lt;' not supported between instances of 'str' and 'int'
Uncaught exception. Entering post mortem debugging
Running 'cont' or 'step' will restart the program
&gt; ~/chai/till.py(16)bill()
-&gt; if qty &lt; 0:
(Pdb) p item, qty, type(qty)
('masala chai', '2', &lt;class 'str'&gt;)
(Pdb) u
&gt; ~/chai/report.py(10)daily_report()
-&gt; sales += bill(lines)
(Pdb) p customer, lines
('Dev', [('masala chai', '2', 30)])
(Pdb) q</div>
<p>pytestpdb</p>  <div class="fx" data-lang="text">$ pytest -q --pdb tests/test_rounding.py
F
&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; traceback &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;

    def test_chen_rounds_half_up():
        chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
&gt;       assert bill(chen) == 53                  # board rule: 52.5 rounds UP
        ^^^^^^^^^^^^^^^^^^^^^^^
E       AssertionError: assert 52 == 53
E        +  where 52 = bill([('samosa', 2, 15), ('vada pav', 1, 20)])

tests/test_rounding.py:6: AssertionError
&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; entering PDB &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;

&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; PDB post_mortem (IO-capturing turned off) &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;
&gt; ~/chai/tests/test_rounding.py(6)test_chen_rounds_half_up()
-&gt; assert bill(chen) == 53                  # board rule: 52.5 rounds UP
(Pdb) p chen
[('samosa', 2, 15), ('vada pav', 1, 20)]
(Pdb) p bill(chen)
52
(Pdb) q

=========================== short test summary info ============================
FAILED tests/test_rounding.py::test_chen_rounds_half_up - AssertionError: ass...
!!!!!!!!!!!!!!!!!!! _pytest.outcomes.Exit: Quitting debugger !!!!!!!!!!!!!!!!!!!
1 failed in 0.11s</div>
`
});
