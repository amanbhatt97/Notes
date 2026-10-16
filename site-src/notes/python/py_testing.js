// notes/python/py_testing.js — Testing & Debugging
Object.assign(TOPIC_CONTENT, {
  "py_testing": `<main>
  <h1>Testing &amp; Debugging</h1>
  <p class="lead">How to prove code works (pytest, mocks, data/ML tests), find out why it doesn't (pdb), find out why it's slow (profilers), and see what it did in production (logging). A silent bug in step 12 of a feature pipeline can corrupt weeks of training; a 50 ms test catches it. Builds on functions, modules and exceptions.</p>

  <h2 id="pt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Testing &amp; Debugging</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">pytest basics</div>
        <ul>
          <li><b>Discovery</b> — files <code>test_*.py</code>, functions <code>test_*</code>; no class needed</li>
          <li><b>Plain assert</b> — rewritten to show both sides: <code>assert [0.9, 0.7] == [0.9, 0.7, 0.5]</code></li>
          <li><b>pytest.raises</b> — <code>with pytest.raises(ValueError, match="pct"):</code></li>
          <li><b>Flags</b> — <code>-v</code> names, <code>-q</code> quiet, <code>-k expr</code> filter, <code>-x</code> stop on first fail, <code>-s</code> show print, <code>--durations=3</code></li>
          <li><b>Structure</b> — Arrange · Act · Assert; one behaviour per test</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fixtures &amp; parametrize</div>
        <ul>
          <li><b>Fixture</b> — reusable setup injected by parameter name (dependency injection)</li>
          <li><b>yield fixture</b> — code after <code>yield</code> = teardown</li>
          <li><b>Scope</b> — function (default, fresh each test) · module · session (load model once)</li>
          <li><b>conftest.py</b> — fixtures shared by every test in the folder, no import</li>
          <li><b>Built-ins</b> — <code>tmp_path</code>, <code>monkeypatch</code>, <code>caplog</code>, <code>capsys</code></li>
          <li><b>@pytest.mark.parametrize</b> — one test body, many inputs; each case reported separately</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Unit vs integration</div>
        <ul>
          <li><b>Unit</b> — one function, no I/O, milliseconds; most of your tests</li>
          <li><b>Integration</b> — real DB/files/service together; slower, fewer</li>
          <li><b>E2E</b> — whole pipeline/app; fewest</li>
          <li>💡 test pyramid: wide base of unit tests</li>
          <li><b>Markers</b> — <code>@pytest.mark.integration</code> + <code>-m "not integration"</code> for fast CI</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Mocking</div>
        <ul>
          <li><b>Why</b> — replace slow/flaky/costly dependencies (APIs, DBs, clocks)</li>
          <li><b>MagicMock</b> — <code>return_value</code>, <code>side_effect</code> (raise / sequence), <code>assert_called_once_with</code></li>
          <li>⚠ <b>Patch where it's looked up</b> — <code>from httpx import get</code> in rates.py → patch <code>"rates.get"</code>, not <code>"httpx.get"</code></li>
          <li><b>autospec</b> — mock keeps the real signature; catches wrong calls</li>
          <li>⚠ Over-mocking tests the mocks, not the code</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Testing data / ML</div>
        <ul>
          <li><b>Seeds</b> — <code>np.random.default_rng(42)</code>, <code>random_state=0</code> → reproducible</li>
          <li><b>Tiny fixtures</b> — 3-row DataFrame you can check by hand; edge cases (0, NaN, negative)</li>
          <li><b>pandas</b> — <code>pd.testing.assert_frame_equal</code>; also test "doesn't mutate input"</li>
          <li><b>Floats</b> — <code>pytest.approx</code>, never <code>==</code></li>
          <li><b>Models</b> — test contracts (shape, probs sum to 1) and thresholds (acc &gt; 0.9 on known signal), not exact metrics</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Profiling</div>
        <ul>
          <li><b>Rule</b> — make it work → right → fast; profile before optimising</li>
          <li><b>cProfile</b> — every call; sort by <code>cumulative</code>; <code>tottime</code> = own time</li>
          <li><b>line_profiler</b> — per-line time (<code>@profile</code> + <code>kernprof -l -v</code>)</li>
          <li><b>timeit</b> — micro-benchmark one statement; take the min of repeats</li>
          <li><b>Found</b> — <code>x in list</code> = 99% of time; set → 1403 ms to 1.7 ms</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Debugging</div>
        <ul>
          <li><b>breakpoint()</b> — drop into pdb here; <code>PYTHONBREAKPOINT=0</code> disables all</li>
          <li><b>Commands</b> — <code>n</code> next, <code>s</code> step in, <code>c</code> continue, <code>p x</code>, <code>ll</code> list, <code>w</code> stack, <code>u/d</code> up/down, <code>q</code></li>
          <li><b>Post-mortem</b> — <code>python -m pdb script.py</code>, <code>pytest --pdb</code></li>
          <li>Beats scattered prints: inspect any variable, no re-run</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging</div>
        <ul>
          <li><b>Levels</b> — DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL; below threshold = dropped</li>
          <li><b>Pipeline</b> — logger → handlers (console, file) → formatter; each handler has its own level</li>
          <li><b>getLogger(__name__)</b> — one per module; configure once at the entry point</li>
          <li><b>logger.exception</b> — ERROR + full traceback (inside <code>except</code>)</li>
          <li><b>Lazy args</b> — <code>log.debug("loss=%.4f", x)</code>, not f-strings</li>
          <li><b>Structured</b> — JSON lines with fields (model, latency_ms) → searchable</li>
          <li>⚠ print: no level, time, source, or routing</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pt-py"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">pytest Basics</span><span class="rm-sub">Tests, asserts, real run output</span></div></div>
      <div class="rm-item rm-done" data-target="pt-fx"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Fixtures &amp; Parametrize</span><span class="rm-sub">Setup once, test many inputs</span></div></div>
      <div class="rm-item rm-done" data-target="pt-ui"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Unit vs Integration</span><span class="rm-sub">The pyramid, markers</span></div></div>
      <div class="rm-item rm-done" data-target="pt-mock"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Mocking</span><span class="rm-sub">Patch where it's looked up</span></div></div>
      <div class="rm-item rm-done" data-target="pt-ml"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Testing Data &amp; ML Code</span><span class="rm-sub">Seeds, small frames, approx</span></div></div>
      <div class="rm-item rm-done" data-target="pt-prof"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Profiling</span><span class="rm-sub">cProfile, line-level, timeit</span></div></div>
      <div class="rm-item rm-done" data-target="pt-dbg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Debugging with pdb</span><span class="rm-sub">breakpoint() and post-mortem</span></div></div>
      <div class="rm-item rm-done" data-target="pt-log"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Logging</span><span class="rm-sub">Levels, handlers, JSON</span></div></div>
      <div class="rm-item rm-done" data-target="pt-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">Test a feature module end to end</span></div></div>
      <div class="rm-item rm-done" data-target="pt-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="pt-py"><span class="num">01</span>pytest Basics</h2>
  <div class="flow"><span>find test_*.py</span><span>collect test_* functions</span><span>build fixtures</span><span>run + rewrite asserts</span><span>teardown</span><span>report</span></div>
  <p>The code under test, a small feature module used through the whole note:</p>
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
  <div class="fx" data-lang="py"># test_features.py (excerpt)
import pytest
from features import discount

def test_discount_basic():
    assert discount(200, 10) == 180

def test_discount_rejects_bad_pct():
    with pytest.raises(ValueError, match="pct must be"):
        discount(100, 150)</div>
  <div class="fx" data-lang="text">$ pytest -v test_features.py
test_features.py::test_discount_basic PASSED                             [ 14%]
test_features.py::test_discount_cases[100-0-100] PASSED                  [ 28%]
test_features.py::test_discount_cases[100-100-0] PASSED                  [ 42%]
test_features.py::test_discount_cases[19.99-15-16.99] PASSED             [ 57%]
test_features.py::test_discount_rejects_bad_pct PASSED                   [ 71%]
test_features.py::test_add_features PASSED                               [ 85%]
test_features.py::test_add_features_does_not_mutate PASSED               [100%]

============================== 7 passed in 0.04s ===============================</div>
  <p>When a plain <code>assert</code> fails, pytest shows both sides — no <code>assertEqual</code> needed:</p>
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
1 failed in 0.03s</div>
  <table class="tbl">
    <tr><th>Command</th><th>Does</th></tr>
    <tr><td><code>pytest -k discount</code></td><td>Only tests whose name matches</td></tr>
    <tr><td><code>pytest -x</code> / <code>--lf</code></td><td>Stop at first failure / rerun last failures</td></tr>
    <tr><td><code>pytest -s</code></td><td>Show <code>print</code> output</td></tr>
    <tr><td><code>pytest --durations=3</code></td><td>List the slowest tests</td></tr>
    <tr><td><code>pytest --cov=pkg</code></td><td>Coverage (pytest-cov plugin; not run here)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>A test that never fails proves nothing. Watch it fail once (break the code or the expectation) before trusting it.</p></div>

  <h2 id="pt-fx"><span class="num">02</span>Fixtures &amp; Parametrize</h2>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>fixture</strong> is a function that builds test inputs. A test asks for it by naming it as a parameter; pytest calls it and passes the result in.</p></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A restaurant's mise en place: ingredients prepped before each order. Function scope = fresh prep per dish; session scope = one big pot of stock for the night.</p></div>
  <div class="fx" data-lang="py"># conftest.py: shared with every test file in this folder, no import needed
import pandas as pd
import pytest

@pytest.fixture
def sales():                       # small, hand-checkable input
    return pd.DataFrame({"qty": [2, 0, 5], "revenue": [100.0, 0.0, 50.0]})</div>
  <div class="fx" data-lang="py">@pytest.mark.parametrize("price, pct, expected", [
    (100, 0, 100),        # no discount
    (100, 100, 0),        # free
    (19.99, 15, 16.99),   # rounding
])
def test_discount_cases(price, pct, expected):
    assert discount(price, pct) == expected</div>
  <p>Three cases → three separately reported tests (<code>test_discount_cases[19.99-15-16.99]</code> above), so a failure names the exact input.</p>
  <h3>Scope and teardown</h3>
  <figure class="viz"><svg viewBox="0 0 520 132" width="520">
    <rect x="20" y="20" width="480" height="24" rx="5" class="fv"/><text x="30" y="37">model (scope="module"): load once ... unload after last test</text>
    <rect x="30" y="60" width="140" height="22" rx="4" class="fb"/><text x="40" y="76">batch #1 · test_a</text>
    <rect x="190" y="60" width="140" height="22" rx="4" class="fb"/><text x="200" y="76">batch #2 · test_b</text>
    <rect x="350" y="60" width="140" height="22" rx="4" class="fb"/><text x="360" y="76">batch #3 · test_c</text>
    <text x="30" y="106" class="tm">function scope (default): rebuilt per test,</text><text x="30" y="122" class="tm">so test_b's append can't leak into test_c</text>
  </svg><figcaption>Expensive things get a wide scope; anything a test might mutate gets function scope.</figcaption></figure>
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

3 passed in 0.02s</div>
  <table class="tbl">
    <tr><th>Built-in fixture</th><th>Gives you</th></tr>
    <tr><td><code>tmp_path</code></td><td>A fresh temporary directory (pathlib.Path) per test</td></tr>
    <tr><td><code>monkeypatch</code></td><td>Set env vars / attributes, auto-undone after the test</td></tr>
    <tr><td><code>caplog</code></td><td>Captured log records (<code>caplog.text</code>)</td></tr>
    <tr><td><code>capsys</code></td><td>Captured stdout/stderr</td></tr>
  </table>

  <h2 id="pt-ui"><span class="num">03</span>Unit vs Integration Tests</h2>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
    <polygon points="230,15 290,60 170,60" class="fr"/><text x="207" y="52">E2E</text>
    <polygon points="170,64 290,64 350,108 110,108" class="fv"/><text x="190" y="92">Integration</text>
    <polygon points="110,112 350,112 410,156 50,156" class="fg"/><text x="210" y="140">Unit</text>
    <text x="300" y="40" class="tm">few · slow · realistic</text>
    <text x="360" y="92" class="tm">real DB/files</text>
    <text x="418" y="140" class="tm">many, ms each</text>
  </svg><figcaption>Many fast unit tests at the base, fewer slow realistic ones on top.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Unit</th><th>Integration</th></tr>
    <tr><td>Scope</td><td>One function/class</td><td>Several parts + real I/O</td></tr>
    <tr><td>Dependencies</td><td>Faked or none</td><td>Real (SQLite, files, local server)</td></tr>
    <tr><td>Speed</td><td>ms</td><td>100 ms – minutes</td></tr>
    <tr><td>Catches</td><td>Logic bugs</td><td>Wiring bugs: schemas, configs, types across a boundary</td></tr>
  </table>
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
10 passed, 1 deselected in 1.39s
$ pytest -v -m integration
test_integration.py::test_features_round_trip_db PASSED                  [100%]
======================= 1 passed, 10 deselected in 1.21s =======================</div>

  <h2 id="pt-mock"><span class="num">04</span>Mocking</h2>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>mock</strong> is a stand-in object that records how it was called and returns what you tell it. Used to cut slow, flaky or paid dependencies (APIs, DBs, time) out of unit tests.</p></div>
  <div class="fx" data-lang="py">from unittest.mock import MagicMock, create_autospec

m = MagicMock()
m.predict.return_value = [1, 0]
print(m.predict([[5.1], [4.9]]))              # canned answer
print(m.predict.call_args)                    # what it was called with
print(m.anything.you.like)                    # auto-creates attributes...

flaky = MagicMock(side_effect=[TimeoutError("slow"), {"ok": True}])
for _ in range(2):
    try: print(flaky())
    except TimeoutError as e: print("raised", e)

def score(x, threshold=0.5): ...
safe = create_autospec(score)                 # same signature as the real thing
try: safe(1, 2, 3)
except TypeError as e: print("autospec:", e)</div>
  <div class="fx" data-lang="text">[1, 0]
call([[5.1], [4.9]])
&lt;MagicMock name='mock.anything.you.like' id='139835307472080'&gt;
raised slow
{'ok': True}
autospec: too many positional arguments</div>
  <p>The third line is why plain mocks are dangerous: typos and wrong calls silently "work". <code>autospec=True</code> / <code>create_autospec</code> enforces the real signature.</p>
  <h3>The classic trap: patch where it's looked up</h3>
  <figure class="viz"><svg viewBox="0 0 540 170" width="540">
    <defs><marker id="pt-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="150" height="50" rx="6" class="fs"/><text x="20" y="40">module httpx</text><text x="20" y="60" class="tr">get → MagicMock</text>
    <rect x="10" y="100" width="150" height="50" rx="6" class="fs"/><text x="20" y="120">module rates</text><text x="20" y="140" class="tb">get → real get</text>
    <rect x="360" y="60" width="170" height="50" rx="6" class="fb sb"/><text x="372" y="82">real httpx.get</text><text x="372" y="100" class="tm">function object</text>
    <line x1="160" y1="125" x2="356" y2="92" class="sb" stroke-width="2" marker-end="url(#pt-ah1)"/>
    <text x="190" y="140" class="tm">"from httpx import get" copied this reference</text>
    <text x="190" y="40" class="tm">patch("httpx.get") rebinds only this name</text>
  </svg><figcaption>patch swaps a name in one namespace. Your module kept its own reference, so patch that name: "rates.get".</figcaption></figure>
  <div class="fx" data-lang="py"># rates.py
from httpx import get                      # copies the name 'get' into THIS module

def usd_to_inr(amount):
    rate = get("http://rates.invalid/usd-inr").json()["rate"]
    return round(amount * rate, 2)</div>
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
F.                                                                       [100%]
E   httpx.ConnectError: [Errno -2] Name or service not known
FAILED test_rates.py::test_patch_wrong_place - httpx.ConnectError: [Errno -2]...
1 failed, 1 passed in 0.18s</div>
  <div class="callout trap"><span class="label">Trap</span><p>If the module did <code>import httpx</code> and calls <code>httpx.get</code>, then <code>patch("httpx.get")</code> <em>does</em> work — the lookup happens on the httpx module at call time. Rule: patch the name exactly where the code under test looks it up.</p></div>
  <ul>
    <li><strong>pytest style:</strong> <code>monkeypatch.setattr("rates.get", fake)</code> does the same, auto-undone.</li>
    <li><strong>Don't over-mock:</strong> mocking pandas or your own helpers tests the mock. Mock at system boundaries only (network, DB, clock, randomness).</li>
  </ul>

  <h2 id="pt-ml"><span class="num">05</span>Testing Data &amp; ML Code</h2>
  <div class="cards">
    <div><b>Fix randomness</b><p>Seeded <code>default_rng(42)</code>, <code>random_state=0</code>. Same input → same output.</p></div>
    <div><b>Tiny fixtures</b><p>3 rows you can compute by hand, including the edge cases (qty 0, NaN).</p></div>
    <div><b>Contracts</b><p>Shapes, dtypes, columns, ranges, probabilities sum to 1, input not mutated.</p></div>
    <div><b>Thresholds</b><p>Model learns a planted signal: acc &gt; 0.9, not acc == 0.9466.</p></div>
  </div>
  <h3>Testing a pandas transform</h3>
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
  <h3>Testing a model</h3>
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
...........                                                              [100%]
============================= slowest 3 durations ==============================
0.10s call     test_ml.py::test_model_learns_signal
0.09s call     test_ml.py::test_output_contract
0.06s call     test_integration.py::test_features_round_trip_db
11 passed in 1.63s</div>
  <div class="callout trap"><span class="label">Trap</span><p><code>0.1 + 0.2 == 0.3</code> is False. Compare floats with <code>pytest.approx</code> / <code>np.testing.assert_allclose</code>. And never assert an exact accuracy: a library upgrade changes it in the 4th decimal and the test breaks for no reason.</p></div>

  <h2 id="pt-prof"><span class="num">06</span>Profiling</h2>
  <div class="flow"><span>make it work</span><span>make it right (tests pass)</span><span>profile</span><span>fix the top hotspot</span><span>re-profile</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A doctor runs tests before prescribing. Optimising without a profile is prescribing on a guess: the bottleneck is rarely where you think.</p></div>
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
  <div class="fx" data-lang="text">         245499 function calls in 1.539 seconds

   Ordered by: cumulative time
   List reduced from 18 to 6 due to restriction &lt;6&gt;

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    0.004    0.004    1.539    1.539 pipeline.py:17(run)
        1    1.426    1.426    1.430    1.430 pipeline.py:10(dedupe)
        1    0.017    0.017    0.090    0.090 pipeline.py:3(load)
    20000    0.012    0.000    0.073    0.000 /usr/lib/python3.13/random.py:336(randint)
    20000    0.021    0.000    0.061    0.000 /usr/lib/python3.13/random.py:295(randrange)
    20000    0.017    0.000    0.029    0.000 /usr/lib/python3.13/random.py:245(_randbelow_with_getrandbits)</div>
  <figure class="viz"><svg viewBox="0 0 520 110" width="520">
    <text x="10" y="28">dedupe</text><rect x="140" y="14" width="300" height="20" class="fr sr"/><text x="446" y="29">1.43 s</text>
    <text x="10" y="58">load</text><rect x="140" y="44" width="19" height="20" class="fb sb"/><text x="166" y="59">0.09 s</text>
    <text x="10" y="88">clean+other</text><rect x="140" y="74" width="4" height="20" class="fs"/><text x="151" y="89">0.02 s</text>
  </svg><figcaption>cumtime per function: one function owns 93% of the run. Fix that, ignore the rest.</figcaption></figure>
  <ul>
    <li><strong>tottime</strong> = time inside the function itself; <strong>cumtime</strong> = including everything it calls.</li>
    <li>Command line: <code>python -m cProfile -s cumulative script.py</code>; visualise with snakeviz.</li>
  </ul>
  <h3>Line level, then timeit the fix</h3>
  <div class="fx" data-lang="py">from line_profiler import LineProfiler
lp = LineProfiler(dedupe)
lp.runcall(dedupe, names)
lp.print_stats(output_unit=1e-3)
# usual CLI form: decorate with @profile, run: kernprof -l -v pipeline.py</div>
  <div class="fx" data-lang="text">Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
    10                                           def dedupe(names):
    11         1          0.0      0.0      0.0      seen = []
    12     20001          7.5      0.0      0.5      for x in names:
    13     20000       1497.9      0.1     99.1          if x not in seen:          # list membership: O(n) each time
    14     12674          5.6      0.0      0.4              seen.append(x)
    15         1          0.0      0.0      0.0      return seen</div>
  <div class="fx" data-lang="py">import timeit
def dedupe_set(names):
    seen, out = set(), []
    for x in names:
        if x not in seen:          # set membership: O(1)
            seen.add(x)
            out.append(x)
    return out

for stmt in ["dedupe(names)", "dedupe_set(names)", "list(dict.fromkeys(names))"]:
    best = min(timeit.repeat(stmt, setup, number=3, repeat=3)) / 3
    print(f"{stmt:&lt;28}{best*1000:9.2f} ms")</div>
  <div class="fx" data-lang="text">dedupe(names)                 1402.83 ms
dedupe_set(names)                1.69 ms
list(dict.fromkeys(names))       1.19 ms</div>
  <p>All three return the same list (checked). One changed line: ~1000× faster.</p>
  <div class="callout trap"><span class="label">Trap</span><p>timeit: take the <em>minimum</em> of repeats (noise only adds time), and keep setup out of the timed statement. In Jupyter: <code>%timeit</code>, <code>%prun</code>, <code>%lprun</code>.</p></div>

  <h2 id="pt-dbg"><span class="num">07</span>Debugging with pdb</h2>
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
  <p>One <code>p</code> shows the cause: the values sum to 0. (Commands typed at <code>(Pdb)</code> are shown inline.)</p>
  <table class="tbl">
    <tr><th>Cmd</th><th>Does</th><th>Cmd</th><th>Does</th></tr>
    <tr><td><code>n</code></td><td>Next line (step over)</td><td><code>p expr</code> / <code>pp</code></td><td>Print / pretty-print</td></tr>
    <tr><td><code>s</code></td><td>Step into a call</td><td><code>l</code> / <code>ll</code></td><td>List code / whole function</td></tr>
    <tr><td><code>c</code></td><td>Continue to next breakpoint</td><td><code>w</code></td><td>Where: call stack</td></tr>
    <tr><td><code>r</code></td><td>Run until function returns</td><td><code>u</code> / <code>d</code></td><td>Move up/down the stack</td></tr>
    <tr><td><code>b file:line</code></td><td>Set a breakpoint</td><td><code>q</code></td><td>Quit</td></tr>
  </table>
  <ul>
    <li><strong>Post-mortem:</strong> <code>python -m pdb script.py</code> stops at the crash; <code>pytest --pdb</code> opens pdb at a failing test; in Jupyter, <code>%debug</code> after an exception.</li>
    <li><code>PYTHONBREAKPOINT=0</code> turns every <code>breakpoint()</code> into a no-op (safety net if one slips into prod).</li>
  </ul>

  <h2 id="pt-log"><span class="num">08</span>Logging</h2>
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
      </svg><figcaption>A record passes the logger's level, then each handler's own level, then that handler's formatter.</figcaption></figure>
  <table class="tbl">
    <tr><th>Level</th><th>Meaning</th><th>Example</th></tr>
    <tr><td>DEBUG</td><td>Developer detail</td><td>batch 17 loss=0.4321</td></tr>
    <tr><td>INFO</td><td>Normal milestones</td><td>epoch 1 done, model loaded</td></tr>
    <tr><td>WARNING</td><td>Unexpected but handled</td><td>GPU memory at 93%</td></tr>
    <tr><td>ERROR</td><td>An operation failed</td><td>validation step failed</td></tr>
    <tr><td>CRITICAL</td><td>System may not continue</td><td>database unreachable</td></tr>
  </table>
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

logger.addHandler(console); logger.addHandler(file)

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
  File ".../log_demo.py", line 21, in &lt;module&gt;
    1 / 0
    ~~^~~
ZeroDivisionError: division by zero
--- train.log
07:02:38 DEBUG trainer:17 batch 17 loss=0.4321
07:02:38 INFO trainer:18 epoch 1 done
07:02:38 WARNING trainer:19 GPU memory at 93%
07:02:38 ERROR trainer:23 validation step failed
Traceback (most recent call last):
  ...
ZeroDivisionError: division by zero</div>
  <p>Same calls, two destinations: the console shows only what needs a human, the file keeps everything.</p>
  <h3>Structured (JSON) logging</h3>
  <div class="fx" data-lang="py">import json, logging, sys

class JsonFormatter(logging.Formatter):
    def format(self, record):
        doc = {"ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
               "level": record.levelname, "logger": record.name,
               "msg": record.getMessage()}
        doc.update(getattr(record, "ctx", {}))          # fields passed via extra=
        return json.dumps(doc)

h = logging.StreamHandler(sys.stdout); h.setFormatter(JsonFormatter())
log = logging.getLogger("serve"); log.addHandler(h); log.setLevel(logging.INFO)

log.info("prediction served", extra={"ctx": {"model": "churn-v3", "latency_ms": 41, "user_id": 812}})</div>
  <div class="fx" data-lang="text">{"ts": "2026-10-16T07:02:44", "level": "INFO", "logger": "serve", "msg": "prediction served", "model": "churn-v3", "latency_ms": 41, "user_id": 812}</div>
  <p>One JSON object per line → log platforms (ELK, Datadog, CloudWatch) can filter <code>latency_ms &gt; 200 AND model = churn-v3</code>. Libraries: structlog, python-json-logger.</p>
  <h3>Testing that you logged</h3>
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
  <div class="callout trap"><span class="label">Trap</span><p><code>logger.error(str(e))</code> loses the stack trace — use <code>logger.exception(...)</code> inside <code>except</code>. Libraries should only call <code>getLogger(__name__)</code>; configure handlers once in the application entry point, or you get duplicated lines.</p></div>

  <h2 id="pt-build"><span class="num">09</span>Build It</h2>
  <p>Take <code>features.py</code> above to production quality:</p>
  <ol>
    <li>Add a fixture in <code>conftest.py</code> with an edge-case frame: a negative qty, a NaN revenue, an empty frame.</li>
    <li>Parametrize a test over those cases; for negative qty assert <code>pytest.raises(ValueError)</code>.</li>
    <li>Add <code>fetch_prices()</code> that calls an API via <code>from httpx import get</code>; test it with <code>patch("features.get")</code> and <code>side_effect</code> to simulate a timeout then success.</li>
    <li>Add <code>log.warning</code> for dropped rows and assert it with <code>caplog</code>.</li>
    <li>Run <code>pytest -q --durations=3</code>, then cProfile the transform on 1M rows and fix the top hotspot.</li>
  </ol>

  <h2 id="pt-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why pytest over unittest?</summary><div class="qa-body">Plain functions instead of classes, plain <code>assert</code> with rewritten failure diffs instead of <code>assertEqual</code>, composable fixtures instead of setUp/tearDown, parametrize, markers and a big plugin ecosystem (cov, xdist, mock). pytest also runs existing unittest tests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a fixture, and what does scope change?</summary><div class="qa-body">A function that provides test inputs, injected by parameter name; code after <code>yield</code> is teardown. Scope sets how often it's rebuilt: function (each test, default), class, module, session. Use wide scope for expensive read-only things (a loaded model), function scope for anything a test may mutate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your module does <code>from requests import get</code>. You <code>patch("requests.get")</code> and the test still hits the network. Why?</summary><div class="qa-body">The import copied a reference to the function into your module's namespace. patch replaced <code>requests.get</code>, but your code calls <code>yourmodule.get</code>, which still points at the real function. Patch where the name is looked up: <code>patch("yourmodule.get")</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>return_value</code> vs <code>side_effect</code>?</summary><div class="qa-body"><code>return_value</code>: the same value every call. <code>side_effect</code>: an exception to raise, an iterable of results returned one per call (can mix exceptions — good for retry tests), or a function computing the result from the arguments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Unit vs integration test — give a DS example of each.</summary><div class="qa-body">Unit: <code>add_features</code> on a 3-row DataFrame, no I/O, milliseconds. Integration: write features to a real SQLite DB in <code>tmp_path</code> and read them back, catching schema/dtype issues across the boundary. Keep many unit tests and mark the slow ones so CI can skip them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test ML code whose output is random?</summary><div class="qa-body">Seed everything (<code>np.random.default_rng(42)</code>, <code>random_state</code>, <code>torch.manual_seed</code>). Test contracts (shapes, prob ranges, no mutation) and behaviour on planted signal with thresholds (acc &gt; 0.9), not exact metrics. Compare floats with <code>pytest.approx</code>. Also "overfit a tiny batch": loss should go near zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>assert 0.1 + 0.2 == 0.3</code></summary><div class="qa-body"><code>AssertionError</code>: 0.1 + 0.2 is 0.30000000000000004 in binary floating point. Use <code>assert 0.1 + 0.2 == pytest.approx(0.3)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A pipeline is slow. What do you do first?</summary><div class="qa-body">Profile, don't guess. Run cProfile sorted by cumulative time to find the hot function, line_profiler to find the hot line, fix only that (often an O(n²) loop or row-wise pandas <code>apply</code>), confirm with timeit and re-profile. Make it work, make it right, then make it fast.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>tottime vs cumtime in cProfile?</summary><div class="qa-body">tottime = time spent in the function's own code, excluding calls it makes. cumtime = including everything it calls. High cumtime + low tottime → the cost is in its children; high tottime → the function itself is the hotspot (dedupe: 1.426 of 1.430 s).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name five pdb commands and when you'd use post-mortem debugging.</summary><div class="qa-body"><code>n</code> next, <code>s</code> step into, <code>c</code> continue, <code>p x</code> print, <code>w</code> stack (plus <code>u</code>/<code>d</code>, <code>ll</code>, <code>q</code>). Post-mortem (<code>python -m pdb</code>, <code>pytest --pdb</code>, <code>%debug</code>) when the crash already happened: you land in the failing frame with all variables intact.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why logging instead of print in production? What does <code>logger.exception</code> add?</summary><div class="qa-body">Logging gives levels you can filter without code changes, timestamps, module/line, and routing to files or log platforms. <code>logger.exception("msg")</code> logs at ERROR and attaches the full traceback; <code>logger.error(str(e))</code> loses it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why <code>log.debug("loss=%.4f", x)</code> rather than <code>log.debug(f"loss={x:.4f}")</code>?</summary><div class="qa-body">With %-style arguments the string is only built if the record passes the level check; the f-string is formatted every time, even when DEBUG is off. It also keeps the message template constant, which helps log aggregation group identical messages.</div></details>
</main>`
});
