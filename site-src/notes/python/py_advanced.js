// notes/python/py_advanced.js — Iterators, Generators, Decorators
Object.assign(TOPIC_CONTENT, {
  "py_advanced": `<main>
  <h1>Iterators, Generators, Decorators</h1>
  <p class="lead">Three tools behind lazy data pipelines, reusable function wrappers and guaranteed cleanup. They power DataLoaders, Flask routes, <code>@lru_cache</code>, <code>with open()</code> and <code>torch.no_grad()</code>. Builds on functions and classes (OOP, dunder methods).</p>

  <h2 id="pa-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Iterators · Generators · Decorators · Context managers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Iterator protocol</div>
        <ul>
          <li><b>Iterable</b> — has <code>__iter__</code>, gives a fresh iterator (list, dict, file)</li>
          <li><b>Iterator</b> — has <code>__next__</code>; returns next value or raises <code>StopIteration</code></li>
          <li><b>for loop</b> = <code>it = iter(x)</code>, then <code>next(it)</code> until StopIteration</li>
          <li>Iterator's <code>__iter__</code> returns <code>self</code> → single pass</li>
          <li>⚠ Iterators/generators exhaust silently; 2nd loop gives nothing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Generators</div>
        <ul>
          <li><b>yield</b> — function pauses, hands back a value, resumes on next <code>next()</code></li>
          <li>Calling it runs nothing; returns a generator object</li>
          <li><b>Genexp</b> — <code>(x*x for x in xs)</code>; <code>[]</code> builds a list, <code>()</code> is lazy</li>
          <li><b>yield from</b> — delegate to another iterable</li>
          <li>💡 A Pez dispenser: one candy per click, not the whole pack</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Lazy evaluation</div>
        <ul>
          <li>Compute on demand, hold one item at a time</li>
          <li>Measured, 10M squares: list peak <b>409 MB</b>, generator <b>0.0005 MB</b></li>
          <li>Generator object itself ≈ 200 bytes whatever N is</li>
          <li><b>Pipelines</b> — chain generators: read → parse → filter → <code>islice</code></li>
          <li>Batching: <code>islice</code> chunks; DataLoader/streaming does this</li>
          <li>⚠ Need len, indexing or multiple passes → materialise a list</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Closures</div>
        <ul>
          <li><b>Closure</b> — inner function remembering outer variables after outer returned</li>
          <li>Stored in <code>f.__closure__</code> cells</li>
          <li><b>nonlocal</b> — needed to reassign an outer variable</li>
          <li>⚠ Late binding: <code>[lambda: i for i in range(3)]</code> → all 2; fix <code>lambda i=i: i</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Decorators</div>
        <ul>
          <li><b>@deco</b> on <code>f</code> = <code>f = deco(f)</code></li>
          <li>Wrapper with <code>*args, **kwargs</code>; call f; return its result</li>
          <li><b>functools.wraps</b> — keeps <code>__name__</code>, <code>__doc__</code>, signature, <code>__wrapped__</code></li>
          <li>⚠ Without wraps: name = "wrapper", doc = None, signature (*args, **kwargs)</li>
          <li><b>Parameterised</b> — 3 layers: factory(args) → decorator(func) → wrapper</li>
          <li><b>Stacking</b> — applied bottom-up, run outside-in</li>
          <li>💡 Security guard at a door: room unchanged, every visit checked</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Practical decorators</div>
        <ul>
          <li><b>timer</b> — <code>perf_counter</code> in try/finally</li>
          <li><b>retry</b> — catch listed exceptions, backoff, re-raise on last try</li>
          <li><b>lru_cache</b> — memoise; fib(30) 0.126 s → 0.00006 s; <code>cache_info()</code></li>
          <li>⚠ lru_cache args must be hashable; only for pure functions</li>
          <li>Seen in: Flask <code>@app.route</code>, pytest <code>@fixture</code>, <code>@torch.no_grad()</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Context managers</div>
        <ul>
          <li><b>with</b> — <code>__enter__</code> (setup, value for <code>as</code>) then <code>__exit__</code> (cleanup, always runs)</li>
          <li><code>__exit__(exc_type, exc, tb)</code> — all None if no error</li>
          <li>Return <b>True</b> = swallow the exception; False/None = propagate</li>
          <li><b>@contextmanager</b> — code before <code>yield</code> = enter; <code>finally</code> = exit</li>
          <li><b>suppress</b>, <b>ExitStack</b> (dynamic number, closes in reverse)</li>
          <li>⚠ <code>yield</code> without try/finally → cleanup skipped on error</li>
          <li>💡 Surgery protocol: room is cleaned whatever happens</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pa-iter"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Iterators</span><span class="rm-sub">iter, next, StopIteration</span></div></div>
      <div class="rm-item rm-done" data-target="pa-gen"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Generators &amp; yield</span><span class="rm-sub">Functions that pause</span></div></div>
      <div class="rm-item rm-done" data-target="pa-lazy"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Lazy Evaluation &amp; Pipelines</span><span class="rm-sub">409 MB vs 200 bytes</span></div></div>
      <div class="rm-item rm-done" data-target="pa-clos"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Closures</span><span class="rm-sub">Functions that remember</span></div></div>
      <div class="rm-item rm-done" data-target="pa-deco"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Decorators &amp; functools.wraps</span><span class="rm-sub">Wrap without editing</span></div></div>
      <div class="rm-item rm-done" data-target="pa-prac"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Parameterised &amp; Practical Decorators</span><span class="rm-sub">timer, retry, lru_cache</span></div></div>
      <div class="rm-item rm-done" data-target="pa-ctx"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Context Managers</span><span class="rm-sub">Guaranteed cleanup</span></div></div>
      <div class="rm-item rm-done" data-target="pa-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="pa-iter"><span class="num">01</span>Iterators</h2>
  <figure class="viz"><svg viewBox="0 0 580 180" width="580">
    <defs><marker id="pa-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="60" width="110" height="44" rx="6" class="fb sb"/><text x="22" y="80">iterable</text><text x="22" y="96" class="tm">[10, 20]</text>
    <line x1="122" y1="82" x2="196" y2="82" stroke="currentColor" marker-end="url(#pa-ah1)"/><text x="132" y="74">iter()</text>
    <rect x="200" y="60" width="120" height="44" rx="6" class="ft st"/><text x="212" y="80">iterator</text><text x="212" y="96" class="tm">remembers pos</text>
    <line x1="322" y1="70" x2="410" y2="30" stroke="currentColor" marker-end="url(#pa-ah1)"/><text x="336" y="40">next()</text>
    <rect x="412" y="12" width="150" height="34" rx="6" class="fg sg"/><text x="424" y="34">10, then 20</text>
    <line x1="322" y1="96" x2="410" y2="136" stroke="currentColor" marker-end="url(#pa-ah1)"/><text x="336" y="138">next()</text>
    <rect x="412" y="120" width="150" height="34" rx="6" class="fr sr"/><text x="424" y="142">StopIteration</text>
    <text x="10" y="168" class="tm">for x in obj  ≡  it = iter(obj); x = next(it) ... until StopIteration</text>
  </svg><figcaption>Two roles: the iterable hands out iterators; the iterator walks forward one item per next() and signals the end with StopIteration.</figcaption></figure>
  <div class="fx" data-lang="py">nums = [10, 20]
it = iter(nums)
print(type(it).__name__, next(it), next(it))
next(it)                                  # raises StopIteration
print(iter(it) is it, iter(nums) is iter(nums))</div>
  <div class="fx" data-lang="text">list_iterator 10 20
StopIteration
True False</div>
  <p>A list gives a <em>new</em> iterator each time (re-loopable). An iterator returns <em>itself</em> from <code>iter()</code>, so it is single-pass.</p>
  <div class="fx" data-lang="py">class CountUp:                            # an iterator
    def __init__(self, limit): self.limit, self.cur = limit, 0
    def __iter__(self): return self
    def __next__(self):
        if self.cur &gt;= self.limit: raise StopIteration
        self.cur += 1
        return self.cur

class Range3:                             # an iterable: fresh iterator per loop
    def __iter__(self): return CountUp(3)

c, r = CountUp(3), Range3()
print(list(c), list(c))
print(list(r), list(r))</div>
  <div class="fx" data-lang="text">[1, 2, 3] []
[1, 2, 3] [1, 2, 3]</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A book is iterable; a bookmark is the iterator. Many readers can each have a bookmark, but a bookmark only moves forward.</p></div>

  <h2 id="pa-gen"><span class="num">02</span>Generators &amp; yield</h2>
  <figure class="viz"><svg viewBox="0 0 580 170" width="580">
    <defs><marker id="pa-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="40" class="tb">caller</text><text x="10" y="130" class="tg">generator</text>
    <line x1="90" y1="36" x2="570" y2="36" stroke="currentColor" opacity="0.3"/>
    <line x1="90" y1="126" x2="570" y2="126" stroke="currentColor" opacity="0.3"/>
    <line x1="110" y1="40" x2="140" y2="118" stroke="currentColor" marker-end="url(#pa-ah2)"/><text x="96" y="24">next()</text>
    <rect x="140" y="114" width="80" height="24" rx="4" class="fg sg"/><text x="148" y="131">run</text>
    <line x1="220" y1="118" x2="250" y2="42" stroke="currentColor" marker-end="url(#pa-ah2)"/><text x="232" y="88">yield 1</text>
    <text x="250" y="60" class="tm">paused</text>
    <line x1="300" y1="40" x2="330" y2="118" stroke="currentColor" marker-end="url(#pa-ah2)"/><text x="286" y="24">next()</text>
    <rect x="330" y="114" width="80" height="24" rx="4" class="fg sg"/><text x="338" y="131">resume</text>
    <line x1="410" y1="118" x2="440" y2="42" stroke="currentColor" marker-end="url(#pa-ah2)"/><text x="422" y="88">yield 2</text>
    <line x1="480" y1="40" x2="500" y2="118" stroke="currentColor" marker-end="url(#pa-ah2)"/><text x="470" y="24">next()</text>
    <text x="470" y="158" class="tr">StopIteration</text>
  </svg><figcaption>Control bounces between caller and generator. Local variables survive each pause, so no state needs to live on an object.</figcaption></figure>
  <p>A <strong>generator</strong> is a function with <code>yield</code>. It writes the iterator protocol for you: no class, no <code>__next__</code>, no manual StopIteration.</p>
  <div class="fx" data-lang="py">def count_up(limit):
    print("  start")
    for i in range(1, limit + 1):
        print(f"  yielding {i}")
        yield i
    print("  done")

g = count_up(2)              # nothing printed yet!
print(type(g).__name__)
print(next(g)); print(next(g))
next(g)</div>
  <div class="fx" data-lang="text">generator
  start
  yielding 1
1
  yielding 2
2
  done
StopIteration</div>
  <p>Calling <code>count_up(2)</code> ran zero lines. Each <code>next</code> runs until the next <code>yield</code>.</p>
  <div class="fx" data-lang="py">sq = (x * x for x in range(4))     # generator expression: () not []
print(sum(sq), sum(sq))             # second pass: already exhausted

def chain(*its):
    for it in its:
        yield from it               # = for x in it: yield x
print(list(chain([1, 2], "ab", range(2))))</div>
  <div class="fx" data-lang="text">14 0
[1, 2, 'a', 'b', 0, 1]</div>
  <div class="callout trap"><span class="label">Trap</span><p>Exhaustion is silent: no error, just empty. If you need several passes, rebuild the generator or store <code>list(gen)</code> once.</p></div>

  <h2 id="pa-lazy"><span class="num">03</span>Lazy Evaluation &amp; Pipelines</h2>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
    <text x="10" y="40">list [x*x ...]</text>
    <rect x="150" y="24" width="390" height="24" class="fr sr"/><text x="460" y="41">409 MB</text>
    <text x="10" y="90">gen  (x*x ...)</text>
    <rect x="150" y="74" width="2" height="24" class="fg sg"/><text x="162" y="91" class="tg">0.0005 MB</text>
    <text x="10" y="122" class="tm">peak memory of sum() over 10,000,000 squares (tracemalloc, Python 3.13)</text>
  </svg><figcaption>The list materialises 10M int objects before summing. The generator keeps one at a time.</figcaption></figure>
  <div class="fx" data-lang="py">import sys, tracemalloc, timeit
N = 10_000_000
print("generator object:", sys.getsizeof(x * x for x in range(N)), "bytes")

def peak_mb(fn):
    tracemalloc.start(); fn()
    peak = tracemalloc.get_traced_memory()[1]; tracemalloc.stop()
    return peak / 1e6

print(f"sum([...]) peak: {peak_mb(lambda: sum([x * x for x in range(N)])):.1f} MB")
print(f"sum(...)   peak: {peak_mb(lambda: sum(x * x for x in range(N))):.4f} MB")
print(f"time list: {timeit.timeit(lambda: sum([x * x for x in range(N)]), number=1):.2f}s")
print(f"time gen:  {timeit.timeit(lambda: sum(x * x for x in range(N)), number=1):.2f}s")</div>
  <div class="fx" data-lang="text">generator object: 200 bytes
sum([...]) peak: 409.1 MB
sum(...)   peak: 0.0005 MB
time list: 1.30s
time gen:  0.57s</div>
  <p>Here the generator was also faster (no 400 MB allocation). On small inputs a list comprehension is often slightly faster; the big win is memory.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>sys.getsizeof(a_list)</code> counts only the pointer array (89 MB here), not the int objects. Use <code>tracemalloc</code> for real memory.</p></div>

  <h3>Generator pipelines</h3>
  <figure class="viz"><svg viewBox="0 0 580 90" width="580">
    <defs><marker id="pa-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="110" height="36" rx="6" class="fb sb"/><text x="22" y="43">read_lines</text>
    <rect x="160" y="20" width="90" height="36" rx="6" class="ft st"/><text x="180" y="43">parse</text>
    <rect x="290" y="20" width="90" height="36" rx="6" class="fv sb"/><text x="306" y="43">errors</text>
    <rect x="420" y="20" width="150" height="36" rx="6" class="fg sg"/><text x="432" y="43">islice(..., 3)</text>
    <line x1="122" y1="38" x2="156" y2="38" stroke="currentColor" marker-end="url(#pa-ah3)"/>
    <line x1="252" y1="38" x2="286" y2="38" stroke="currentColor" marker-end="url(#pa-ah3)"/>
    <line x1="382" y1="38" x2="416" y2="38" stroke="currentColor" marker-end="url(#pa-ah3)"/>
    <text x="10" y="80" class="tm">the consumer pulls; one row flows through all stages before the next is read</text>
  </svg><figcaption>Like an assembly line: each stage handles one item and passes it on. Nothing runs until the end pulls.</figcaption></figure>
  <div class="fx" data-lang="py">import itertools

def read_lines():                         # stand-in for a billion-line log file
    for i in range(1, 1_000_000_000):
        yield f"{i},{'ERROR' if i % 4 == 0 else 'OK'},{i * 3 % 1000}"

def parse(lines):
    for ln in lines:
        i, level, ms = ln.split(",")
        yield {"id": int(i), "level": level, "ms": int(ms)}

def errors(rows):
    return (r for r in rows if r["level"] == "ERROR")

pipe = errors(parse(read_lines()))       # builds the chain, reads nothing
print(list(itertools.islice(pipe, 3)))  # reads only 12 lines

def batches(it, size):                    # mini-batches for training
    it = iter(it)
    while chunk := list(itertools.islice(it, size)):
        yield chunk
print(list(batches(range(7), 3)))</div>
  <div class="fx" data-lang="text">[{'id': 4, 'level': 'ERROR', 'ms': 12}, {'id': 8, 'level': 'ERROR', 'ms': 24}, {'id': 12, 'level': 'ERROR', 'ms': 36}]
[[0, 1, 2], [3, 4, 5], [6]]</div>
  <p>Returned instantly despite a billion-line source. Same idea: <code>pd.read_csv(chunksize=...)</code>, PyTorch <code>IterableDataset</code>, HF <code>streaming=True</code>. (Python 3.12+ also has <code>itertools.batched</code>.)</p>
  <table class="tbl">
    <tr><th>Use a list when</th><th>Use a generator when</th></tr>
    <tr><td>Data fits in memory and you need <code>len</code>, indexing, sorting or several passes</td><td>Data is huge or infinite, one pass is enough, or you may stop early</td></tr>
  </table>

  <h2 id="pa-clos"><span class="num">04</span>Closures</h2>
  <p>A <strong>closure</strong> is an inner function that remembers variables from the function that created it, even after that function returned. Decorators are built on this.</p>
  <div class="fx" data-lang="py">def multiplier(factor):
    def multiply(x):
        return x * factor                 # factor captured from outer scope
    return multiply

double, triple = multiplier(2), multiplier(3)
print(double(5), triple(5), double.__closure__[0].cell_contents)

def counter():
    n = 0
    def inc():
        nonlocal n                        # needed to REASSIGN n
        n += 1
        return n
    return inc
c = counter(); c(); print(c())</div>
  <div class="fx" data-lang="text">10 15 2
2</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A backpack: the inner function leaves home carrying the variables it needs.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Late binding: closures capture the <em>variable</em>, not its value at that moment.</p></div>
  <div class="fx" data-lang="py">fs = [lambda: i for i in range(3)]
print([f() for f in fs])                  # all see the final i
fs = [lambda i=i: i for i in range(3)]    # default arg freezes the value
print([f() for f in fs])</div>
  <div class="fx" data-lang="text">[2, 2, 2]
[0, 1, 2]</div>

  <h2 id="pa-deco"><span class="num">05</span>Decorators &amp; functools.wraps</h2>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <defs><marker id="pa-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="80">call greet("asha")</text>
    <line x1="150" y1="76" x2="186" y2="76" stroke="currentColor" marker-end="url(#pa-ah4)"/>
    <rect x="190" y="14" width="350" height="124" rx="8" class="fb sb"/>
    <text x="202" y="34" class="tb">wrapper(*args, **kwargs)</text>
    <text x="202" y="56" class="tm">before: start timer, check auth...</text>
    <rect x="270" y="66" width="190" height="30" rx="5" class="fg sg"/><text x="282" y="86">original greet()</text>
    <text x="202" y="118" class="tm">after: log, transform result, return it</text>
  </svg><figcaption>The name greet now points at wrapper; wrapper holds the original in its closure and calls it in the middle.</figcaption></figure>
  <p>A <strong>decorator</strong> takes a function and returns a replacement. <code>@shout</code> above <code>def greet</code> is exactly <code>greet = shout(greet)</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A security guard at a door: every visitor is checked and logged, but the room itself is unchanged.</p></div>
  <div class="fx" data-lang="py">import functools, inspect

def shout(func):                          # no wraps
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs).upper()
    return wrapper

def shout2(func):
    @functools.wraps(func)                # copy name, doc, signature info
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs).upper()
    return wrapper

@shout
def greet(name):
    """Return a greeting."""
    return f"hi {name}"

@shout2
def greet2(name):
    """Return a greeting."""
    return f"hi {name}"

print(greet("asha"), "|", greet.__name__, "|", greet.__doc__)
print(greet2("asha"), "|", greet2.__name__, "|", greet2.__doc__, "|", greet2.__wrapped__("ben"))
print(inspect.signature(greet), inspect.signature(greet2))</div>
  <div class="fx" data-lang="text">HI ASHA | wrapper | None
HI ASHA | greet2 | Return a greeting. | hi ben
(*args, **kwargs) (name)</div>
  <p>Without <code>wraps</code>: logs and tracebacks say "wrapper", <code>help()</code> loses the docstring, the signature is gone (breaks FastAPI/pytest/Click, which inspect it), and two decorated routes can clash by name in Flask. <code>__wrapped__</code> also lets tests reach the undecorated function.</p>

  <h3>Stacking order</h3>
  <div class="fx" data-lang="py">def tag(t):
    def deco(f):
        @functools.wraps(f)
        def w(*a, **k): return f"&lt;{t}&gt;{f(*a, **k)}&lt;/{t}&gt;"
        return w
    return deco

@tag("b")
@tag("i")
def word(): return "hey"      # = tag("b")(tag("i")(word))
print(word())</div>
  <div class="fx" data-lang="text">&lt;b&gt;&lt;i&gt;hey&lt;/i&gt;&lt;/b&gt;</div>
  <p>Applied bottom-up (nearest first), executed outside-in, like layers of an onion.</p>

  <h2 id="pa-prac"><span class="num">06</span>Parameterised &amp; Practical Decorators</h2>
  <div class="flow"><span>retry(times=3)</span><span>returns decorator</span><span>decorator(func)</span><span>returns wrapper</span><span>wrapper(*args)</span></div>
  <p>Arguments need one extra layer: a <strong>factory</strong> that takes the options and returns the real decorator.</p>
  <div class="fx" data-lang="py">import functools, time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:                                  # report even on error
            print(f"{func.__name__} took {time.perf_counter() - t0:.3f}s")
    return wrapper

def retry(times=3, exceptions=(Exception,), delay=0.0):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == times:
                        raise                     # give up: re-raise original
                    print(f"attempt {attempt} failed: {e}; retrying")
                    time.sleep(delay * 2 ** (attempt - 1))   # exponential backoff
        return wrapper
    return decorator

calls = {"n": 0}
@timer
@retry(times=3, exceptions=(ConnectionError,))
def fetch():
    calls["n"] += 1
    if calls["n"] &lt; 3:
        raise ConnectionError("timeout")
    time.sleep(0.2)
    return "200 OK"
print(fetch())

@retry(times=2)
def always_fails(): raise ValueError("bad input")
try: always_fails()
except ValueError as e: print("gave up:", e)</div>
  <div class="fx" data-lang="text">attempt 1 failed: timeout; retrying
attempt 2 failed: timeout; retrying
fetch took 0.204s
200 OK
attempt 1 failed: bad input; retrying
gave up: bad input</div>
  <div class="callout trap"><span class="label">Trap</span><p>Retry only transient errors (timeouts, 503s). Retrying a <code>ValueError</code> just repeats the bug, and retrying non-idempotent calls (payments) can do the action twice.</p></div>

  <h3>Caching with lru_cache</h3>
  <div class="fx" data-lang="py">def fib_slow(n): return n if n &lt; 2 else fib_slow(n - 1) + fib_slow(n - 2)

@functools.lru_cache(maxsize=None)        # functools.cache is the same, 3.9+
def fib(n): return n if n &lt; 2 else fib(n - 1) + fib(n - 2)

t = time.perf_counter(); fib_slow(30); print(f"plain fib(30):  {time.perf_counter() - t:.3f}s")
t = time.perf_counter(); fib(30);      print(f"cached fib(30): {time.perf_counter() - t:.6f}s")
print(fib.cache_info())
functools.lru_cache()(lambda x: x)([1, 2])</div>
  <div class="fx" data-lang="text">plain fib(30):  0.126s
cached fib(30): 0.000059s
CacheInfo(hits=28, misses=31, maxsize=None, currsize=31)
TypeError: unhashable type: 'list'</div>
  <ul>
    <li>Keys are the arguments, so they must be hashable (pass tuples, not lists).</li>
    <li>Only for <strong>pure</strong> functions: same input → same output, no side effects.</li>
    <li><code>maxsize=128</code> evicts least-recently-used entries; <code>None</code> grows forever.</li>
    <li>On methods it keeps <code>self</code> alive in the cache (memory leak); prefer <code>functools.cached_property</code>.</li>
  </ul>

  <h2 id="pa-ctx"><span class="num">07</span>Context Managers</h2>
  <figure class="viz"><svg viewBox="0 0 580 170" width="580">
    <defs><marker id="pa-ah5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="60" width="110" height="40" rx="6" class="fb sb"/><text x="22" y="85">__enter__</text>
    <line x1="122" y1="80" x2="156" y2="80" stroke="currentColor" marker-end="url(#pa-ah5)"/>
    <rect x="160" y="60" width="100" height="40" rx="6" class="fs" stroke="currentColor"/><text x="172" y="85">with body</text>
    <line x1="262" y1="70" x2="316" y2="34" stroke="currentColor" marker-end="url(#pa-ah5)"/><text x="266" y="42" class="tg">ok</text>
    <line x1="262" y1="90" x2="316" y2="126" stroke="currentColor" marker-end="url(#pa-ah5)"/><text x="262" y="132" class="tr">raises</text>
    <rect x="320" y="14" width="250" height="40" rx="6" class="fg sg"/><text x="330" y="38">__exit__(None, None, None)</text>
    <rect x="320" y="106" width="250" height="40" rx="6" class="fr sr"/><text x="330" y="130">__exit__(type, exc, tb)</text>
    <text x="250" y="164" class="tm">return True: swallow · False/None: re-raise</text>
  </svg><figcaption>__exit__ runs on every path out of the block: normal end, return, break, or exception.</figcaption></figure>
  <p>A <strong>context manager</strong> pairs setup with guaranteed teardown. Without it, one exception between <code>open</code> and <code>close</code> leaks a file handle, lock or DB connection.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A surgical suite: prep before, and the cleaning protocol runs after every operation, success or complication.</p></div>
  <div class="fx" data-lang="py">import time

class Timer:
    def __enter__(self):
        self.t0 = time.perf_counter()
        return self                               # bound to "as t"
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.t0
        print(f"exit: {exc_type.__name__ if exc_type else 'no error'}, {self.elapsed:.2f}s")
        return False                              # don't swallow errors

with Timer() as t:
    time.sleep(0.1)
try:
    with Timer():
        1 / 0
except ZeroDivisionError:
    print("error still reached the caller")</div>
  <div class="fx" data-lang="text">exit: no error, 0.10s
exit: ZeroDivisionError, 0.00s
error still reached the caller</div>

  <h3>Handling exceptions inside __exit__</h3>
  <div class="fx" data-lang="py">from contextlib import suppress

class Ignore:
    def __init__(self, *types): self.types = types
    def __enter__(self): return self
    def __exit__(self, exc_type, exc, tb):
        return exc_type is not None and issubclass(exc_type, self.types)  # True = swallow

with Ignore(KeyError):
    {}["missing"]
    print("never printed")                       # rest of block is skipped
print("after block, KeyError swallowed")

with suppress(FileNotFoundError):                 # built-in version
    open("nope.txt")
print("suppress() did the same")</div>
  <div class="fx" data-lang="text">after block, KeyError swallowed
suppress() did the same</div>
  <div class="callout trap"><span class="label">Trap</span><p>An <code>__exit__</code> that always returns <code>True</code> hides every bug in the block. Swallow only specific, expected exception types.</p></div>

  <h3>@contextmanager</h3>
  <div class="flow"><span>code before yield = __enter__</span><span>yield value → "as"</span><span>with body runs</span><span>except / else / finally = __exit__</span></div>
  <div class="fx" data-lang="py">from contextlib import contextmanager

@contextmanager
def transaction(log):
    log.append("BEGIN")
    try:
        yield log                     # the with-body runs here
    except Exception as e:            # body's exception is re-raised at the yield
        log.append(f"ROLLBACK ({e})")
        raise
    else:
        log.append("COMMIT")
    finally:
        log.append("close")

log = []
with transaction(log): log.append("insert 1")
print(log)

log = []
try:
    with transaction(log):
        log.append("insert 2")
        raise ValueError("constraint")
except ValueError: pass
print(log)</div>
  <div class="fx" data-lang="text">['BEGIN', 'insert 1', 'COMMIT', 'close']
['BEGIN', 'insert 2', 'ROLLBACK (constraint)', 'close']</div>
  <div class="callout trap"><span class="label">Trap</span><p>A bare <code>yield</code> without <code>try/finally</code> skips the cleanup when the body raises: the exception surfaces at the <code>yield</code> line and the code after it never runs.</p></div>

  <h3>Many resources: ExitStack</h3>
  <div class="fx" data-lang="py">from contextlib import ExitStack

@contextmanager
def resource(name):
    print("open", name); yield name; print("close", name)

with ExitStack() as stack:
    files = [stack.enter_context(resource(n)) for n in ("a", "b", "c")]
    print("using", files)</div>
  <div class="fx" data-lang="text">open a
open b
open c
using ['a', 'b', 'c']
close c
close b
close a</div>
  <p>Closes in reverse order, like nested <code>with</code>s. For a fixed set, <code>with open(a) as f, open(b, "w") as g:</code> is enough. ML examples: <code>torch.no_grad()</code>, <code>mlflow.start_run()</code>, <code>threading.Lock()</code>.</p>

  <h2 id="pa-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Iterable vs iterator?</summary><div class="qa-body">An iterable has <code>__iter__</code> and returns a fresh iterator (list, dict, str). An iterator has <code>__next__</code>, remembers its position, and returns itself from <code>__iter__</code>, so it can be consumed only once. Every iterator is iterable; not every iterable is an iterator.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a <code>for</code> loop actually do?</summary><div class="qa-body"><code>it = iter(obj)</code>, then repeatedly <code>x = next(it)</code> and run the body, until <code>next</code> raises <code>StopIteration</code>, which the loop catches silently.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>g = (x for x in [1, 2, 3])</code>; <code>print(sum(g), list(g))</code></summary><div class="qa-body"><code>6 []</code>. <code>sum</code> exhausts the generator; the second consumer gets nothing, with no error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Generator vs list: memory and when to use which?</summary><div class="qa-body">A list stores everything (10M squares: 409 MB peak); a generator yields one item at a time (~200-byte object, 0.0005 MB peak). Use a generator for huge/streaming data or early stopping; a list when you need <code>len</code>, indexing, sorting or multiple passes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>yield</code> vs <code>return</code>?</summary><div class="qa-body"><code>return</code> ends the function and discards its local state. <code>yield</code> hands back a value and <em>pauses</em>, keeping locals for the next <code>next()</code>. A <code>return</code> inside a generator just raises StopIteration.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a closure, and what does <code>[lambda: i for i in range(3)]</code> return when called?</summary><div class="qa-body">A closure is an inner function that keeps access to its enclosing scope's variables. All three lambdas return <code>2</code>: they capture the variable <code>i</code>, read at call time. Fix: <code>lambda i=i: i</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a decorator that logs a function's name and arguments.</summary><div class="qa-body"><div class="fx" data-lang="py">def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"{func.__name__}{args} {kwargs}")
        return func(*args, **kwargs)
    return wrapper</div></div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What breaks without <code>functools.wraps</code>?</summary><div class="qa-body"><code>__name__</code> becomes "wrapper", <code>__doc__</code> is lost, the signature shows <code>(*args, **kwargs)</code>. Logs and tracebacks are confusing, <code>help()</code> is useless, frameworks that inspect signatures (FastAPI, pytest, Flask endpoint names) misbehave, and there's no <code>__wrapped__</code> to reach the original.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a decorator with arguments need three nested functions?</summary><div class="qa-body"><code>@retry(times=3)</code> first <em>calls</em> <code>retry(times=3)</code>; that must return the actual decorator, which takes <code>func</code> and returns the wrapper. Factory → decorator → wrapper.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In what order do stacked decorators apply?</summary><div class="qa-body"><code>@a @b def f</code> means <code>f = a(b(f))</code>: b wraps first (bottom-up), but at call time a's wrapper runs first (outside-in). E.g. <code>@timer</code> on top of <code>@retry</code> times all attempts together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is <code>lru_cache</code> a bad idea?</summary><div class="qa-body">Impure functions (depends on time, DB, randomness; results go stale), unhashable arguments (lists, dicts, DataFrames → TypeError), unbounded <code>maxsize=None</code> on many distinct inputs (memory growth), and on instance methods (cache holds <code>self</code> alive).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>__exit__</code> receive and what does its return value mean?</summary><div class="qa-body">Exception type, value and traceback, all <code>None</code> if the block succeeded. Returning a truthy value suppresses the exception; <code>False</code>/<code>None</code> lets it propagate. It runs on every exit path.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a context manager that temporarily changes the working directory.</summary><div class="qa-body"><div class="fx" data-lang="py">@contextmanager
def cd(path):
    old = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old)       # restored even if the body raises</div>(Python 3.11+ ships this as <code>contextlib.chdir</code>.)</div></details>
</main>`
});
