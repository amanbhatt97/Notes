// notes/python/py_advanced.js — Iterators, Generators, Closures, Decorators, Context Managers
Object.assign(TOPIC_CONTENT, {
  "py_advanced": `<main>
  <h1>Iterators, Generators, Decorators</h1>
  <p class="lead">This note opens up five Python features that look like magic until you see the few plain steps behind each one: how a <code>for</code> loop really gets its items, what it means for a function to "pause", how a function can remember things after it has finished, why the <code>@something</code> line above a function exists, and how <code>with</code> guarantees cleanup. Every idea is built from the one before it, traced by hand, then run. You meet all five daily in data work: PyTorch DataLoaders, <code>pd.read_csv(chunksize=...)</code>, Flask routes, <code>@lru_cache</code>, <code>with open(...)</code> and <code>torch.no_grad()</code>. Builds on functions and classes (see <a class="xref" data-note="py_oop">OOP</a> for dunder methods).</p>

  <h2 id="pa-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Iterators · Generators · Closures · Decorators · Context managers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">How a for loop works</div>
        <ul>
          <li><b>Iterable</b> — anything you can loop over; <code>iter(x)</code> gives an iterator (list, str, dict, file)</li>
          <li><b>Iterator</b> — the bookmark; <code>next(it)</code> gives the next item or raises <code>StopIteration</code></li>
          <li><b>for x in obj</b> = <code>it = iter(obj)</code>, then <code>next(it)</code> again and again until StopIteration</li>
          <li>Iterator's <code>__iter__</code> returns <code>self</code> → can be walked only once</li>
          <li>⚠ A used-up iterator gives nothing, silently</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Generators (pausing)</div>
        <ul>
          <li><b>yield</b> — hand back one value and <b>pause</b>; locals and position are kept</li>
          <li>Calling the function runs <b>no</b> lines; it returns a generator object</li>
          <li>Each <code>next()</code> runs from the last pause to the next <code>yield</code></li>
          <li>Falling off the end → <code>StopIteration</code></li>
          <li><b>Genexp</b> — <code>(x*x for x in xs)</code>: <code>[]</code> builds a list, <code>()</code> is lazy</li>
          <li><b>yield from</b> it — pass along every item of another iterable</li>
          <li>💡 a cricket match stopped for rain resumes from the same ball</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Lazy evaluation</div>
        <ul>
          <li>Compute an item only when asked; hold one at a time</li>
          <li>10M squares: list peak <b>409 MB</b>, generator <b>0.0005 MB</b></li>
          <li><b>Pipeline</b> — read → parse → filter → <code>islice</code>; nothing runs until the end pulls</li>
          <li>Batches with <code>islice</code> (3.12+: <code>itertools.batched</code>)</li>
          <li>⚠ Need len, indexing, sorting or 2 passes → make a list</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Functions &amp; closures</div>
        <ul>
          <li>Functions are values: store, pass, return them (no brackets = the function itself)</li>
          <li><b>Closure</b> — inner function that remembers outer variables after the outer one returned</li>
          <li><b>nonlocal</b> — needed to <em>reassign</em> an outer variable</li>
          <li>⚠ Late binding: <code>[lambda: i for i in range(3)]</code> → all 2; fix <code>lambda i=i: i</code></li>
          <li>💡 a tiffin packed at home, eaten at the office</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Decorators</div>
        <ul>
          <li><b>Why</b> — add the same extra behaviour (log, time, check) to many functions without editing each</li>
          <li><b>@deco</b> above <code>def f</code> = <code>f = deco(f)</code></li>
          <li>Decorator runs once at def time; wrapper runs on every call</li>
          <li>Wrapper takes <code>*args, **kwargs</code>, calls the original, returns its result</li>
          <li><b>functools.wraps</b> — keeps <code>__name__</code>, <code>__doc__</code>, signature, adds <code>__wrapped__</code></li>
          <li><b>With arguments</b> — 3 layers: factory(options) → decorator(func) → wrapper</li>
          <li><b>Stacking</b> — applied bottom-up, run outside-in</li>
          <li>💡 a security guard at a door: room unchanged, every visit checked</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Practical decorators</div>
        <ul>
          <li><b>timer</b> — <code>perf_counter</code> in try/finally</li>
          <li><b>retry</b> — catch listed errors, wait longer each time, re-raise on the last try</li>
          <li><b>lru_cache</b> — remember results; fib(30) 0.14 s → 0.00004 s</li>
          <li>⚠ cache: args must be hashable; only pure functions</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Context managers</div>
        <ul>
          <li><b>Why</b> — an error between open and close leaks the file/lock/connection</li>
          <li><b>with</b> — <code>__enter__</code> (setup, value for <code>as</code>) then <code>__exit__</code> (cleanup, always)</li>
          <li><code>__exit__(exc_type, exc, tb)</code> — all None if no error</li>
          <li>Return <b>True</b> = swallow the error; False/None = let it through</li>
          <li><b>@contextmanager</b> — before <code>yield</code> = enter; <code>finally</code> = exit</li>
          <li><b>suppress</b>, <b>ExitStack</b> (many resources, closes in reverse)</li>
          <li>⚠ <code>yield</code> without try/finally → cleanup skipped on error</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pa-iter"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How a for Loop Really Works</span><span class="rm-sub">iter, next, StopIteration</span></div></div>
      <div class="rm-item rm-done" data-target="pa-gen"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Generators: Functions That Pause</span><span class="rm-sub">yield, traced line by line</span></div></div>
      <div class="rm-item rm-done" data-target="pa-lazy"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Lazy Evaluation &amp; Pipelines</span><span class="rm-sub">409 MB vs 200 bytes</span></div></div>
      <div class="rm-item rm-done" data-target="pa-func"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Functions Are Values</span><span class="rm-sub">Store, pass, return them</span></div></div>
      <div class="rm-item rm-done" data-target="pa-clos"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Closures</span><span class="rm-sub">Functions that remember</span></div></div>
      <div class="rm-item rm-done" data-target="pa-deco"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Decorators, Step by Step</span><span class="rm-sub">Why they exist, @, wraps</span></div></div>
      <div class="rm-item rm-done" data-target="pa-prac"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Decorators With Arguments</span><span class="rm-sub">timer, retry, lru_cache</span></div></div>
      <div class="rm-item rm-done" data-target="pa-ctx"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Context Managers</span><span class="rm-sub">Guaranteed cleanup with "with"</span></div></div>
      <div class="rm-item rm-done" data-target="pa-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Exhaustion, late binding, lost names</span></div></div>
      <div class="rm-item rm-done" data-target="pa-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <div class="callout intu"><span class="label">Why this note</span><p>These five ideas are chained. A <code>for</code> loop is built on iterators. A generator is the easy way to write an iterator. A closure is a function that carries data with it. A decorator is a closure that wraps another function. A context manager can be written as a generator. So read in order: each section uses only what came before it. Interviews ask all five ("what does a for loop do internally?", "yield vs return?", "write a decorator", "what does <code>__exit__</code> return?").</p></div>

  <h2 id="pa-iter"><span class="num">01</span>How a for Loop Really Works</h2>
  <p>You can write <code>for x in ...</code> over a list, a string, a dict, a range, a file, a pandas column. These are very different things. A list sits in memory. A file is on disk and is read line by line. A range never stores its numbers at all. Yet the same <code>for</code> works on all of them. How does one loop know how to walk through such different things?</p>
  <p>The answer: the loop does not know anything about lists or files. It only knows how to ask two questions. First it asks the object, "give me something that can walk through you". Then it asks that walker, again and again, "what is the next item?". When the walker says "no more", the loop stops. Every type that wants to work with <code>for</code> just answers those two questions in its own way.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A book and a bookmark. The book is the thing you read (the <strong>iterable</strong>). The bookmark remembers where you are (the <strong>iterator</strong>). Each time you sit down you read the next page and move the bookmark forward. Five friends can read the same book with five bookmarks at different pages. A bookmark only moves forward; to start again you take a new bookmark.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="pa-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="72" width="120" height="50" rx="6" class="fb sb"/><text x="22" y="93">iterable</text><text x="22" y="112" class="tm">[10, 20]</text>
    <line x1="132" y1="97" x2="206" y2="97" stroke="currentColor" marker-end="url(#pa-ah1)"/><text x="134" y="88">iter()</text>
    <rect x="210" y="72" width="150" height="50" rx="6" class="ft st"/><text x="222" y="93">iterator</text><text x="222" y="112" class="tm">remembers pos</text>
    <line x1="362" y1="84" x2="406" y2="37" stroke="currentColor" marker-end="url(#pa-ah1)"/>
    <line x1="362" y1="97" x2="406" y2="97" stroke="currentColor" marker-end="url(#pa-ah1)"/>
    <line x1="362" y1="110" x2="406" y2="157" stroke="currentColor" marker-end="url(#pa-ah1)"/>
    <rect x="410" y="20" width="180" height="32" rx="6" class="fg sg"/><text x="420" y="41">1st next() → 10</text>
    <rect x="410" y="81" width="180" height="32" rx="6" class="fg sg"/><text x="420" y="102">2nd next() → 20</text>
    <rect x="410" y="142" width="180" height="32" rx="6" class="fr sr"/><text x="420" y="163">3rd: StopIteration</text>
  </svg><figcaption>Read left to right. The loop calls iter() once on the list and gets an iterator (the bookmark). Then it calls next() on that iterator: first 10, then 20, then the iterator raises StopIteration, which tells the loop to stop.</figcaption></figure>
  <p>Let us trace <code>for x in [10, 20, 30]: print(x)</code> exactly as Python runs it.</p>
  <table class="tbl out"><caption>What Python does for one for loop</caption>
    <tr><th>Step</th><th>Python does</th><th>Iterator position</th><th>Result</th></tr>
    <tr><td>1</td><td><code>it = iter([10, 20, 30])</code></td><td>before item 0</td><td>a <code>list_iterator</code></td></tr>
    <tr><td>2</td><td><code>x = next(it)</code>, run body</td><td>after item 0</td><td>prints 10</td></tr>
    <tr><td>3</td><td><code>x = next(it)</code>, run body</td><td>after item 1</td><td>prints 20</td></tr>
    <tr><td>4</td><td><code>x = next(it)</code>, run body</td><td>after item 2</td><td>prints 30</td></tr>
    <tr><td>5</td><td><code>next(it)</code></td><td>at the end</td><td>raises <code>StopIteration</code> → loop catches it and ends quietly</td></tr>
  </table>
  <p>The code below writes the same loop twice: once with <code>for</code>, once by hand with a <code>while</code> loop that does steps 1–5 itself. Then it pokes at an iterator directly.</p>
  <div class="fx" data-lang="py">nums = [10, 20, 30]
for x in nums:
    print("for got", x)

it = iter(nums)                 # step 1: ask the list for an iterator
while True:
    try:
        x = next(it)            # step 2: ask for the next item
    except StopIteration:       # step 3: no more items -&gt; stop
        break
    print("while got", x)

nums = [10, 20]
it = iter(nums)
print(type(it).__name__)
print(next(it))
print(next(it))
try:
    next(it)                    # one too many
except StopIteration:
    print("StopIteration")
print(iter(it) is it, iter(nums) is iter(nums))

for thing in ["ab", {"x": 1, "y": 2}, range(3)]:
    print(type(thing).__name__, "-&gt;", type(iter(thing)).__name__, list(thing))</div>
  <div class="fx" data-lang="text">for got 10
for got 20
for got 30
while got 10
while got 20
while got 30
list_iterator
10
20
StopIteration
True False
str -&gt; str_ascii_iterator ['a', 'b']
dict -&gt; dict_keyiterator ['x', 'y']
range -&gt; range_iterator [0, 1, 2]</div>
  <p>What happened. The <code>while</code> version printed exactly what the <code>for</code> version printed: that <em>is</em> what <code>for</code> does. <code>iter(nums)</code> gave a <code>list_iterator</code>, a small object that holds a reference to the list and a position number. Each <code>next(it)</code> returned one item and moved the position forward. The third <code>next</code> raised <code>StopIteration</code>; inside a <code>for</code> loop that exception is caught for you, which is why you never see it.</p>
  <p>Look at <code>iter(it) is it</code> → <code>True</code>, but <code>iter(nums) is iter(nums)</code> → <code>False</code>. Asking a list for an iterator gives a <em>new</em> bookmark every time, so you can loop over a list as often as you like. Asking an iterator for an iterator gives back <em>itself</em>, with its old position. So an iterator can be walked only once. The last loop shows each type has its own iterator class (string, dict keys, range), but all answer <code>next()</code> the same way.</p>
  <h3>Making your own iterable</h3>
  <p>Python finds those two answers through two dunder methods (methods named with double underscores, explained in <a class="xref" data-note="py_oop">OOP</a>): <code>iter(obj)</code> calls <code>obj.__iter__()</code>, and <code>next(it)</code> calls <code>it.__next__()</code>. Write them and your own class works in a <code>for</code> loop. The code below builds an iterator that counts 1, 2, 3, and a separate iterable that hands out a fresh counter for each loop.</p>
  <div class="fx" data-lang="py">class CountUp:                            # an iterator
    def __init__(self, limit):
        self.limit = limit
        self.cur = 0                      # where we are (the bookmark)
    def __iter__(self):
        return self                       # an iterator is its own iterator
    def __next__(self):
        if self.cur &gt;= self.limit:
            raise StopIteration           # signal: no more items
        self.cur += 1
        return self.cur

class Range3:                             # an iterable: fresh iterator per loop
    def __iter__(self):
        return CountUp(3)

c = CountUp(3)
for n in c:
    print("got", n)
print(list(c))                            # already used up

r = Range3()
print(list(r), list(r))</div>
  <div class="fx" data-lang="text">got 1
got 2
got 3
[]
[1, 2, 3] [1, 2, 3]</div>
  <p>The <code>for</code> loop called <code>c.__iter__()</code> (got <code>c</code> itself), then <code>c.__next__()</code> four times: 1, 2, 3, then <code>StopIteration</code>. <code>self.cur</code> is the bookmark. The second use, <code>list(c)</code>, got an empty list because <code>cur</code> was already 3. <code>Range3</code> behaves like a real list: its <code>__iter__</code> builds a <em>new</em> <code>CountUp</code> each time, so both <code>list(r)</code> calls see all three numbers.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Iterable</strong>: an object with <code>__iter__</code> that returns an iterator (list, tuple, str, dict, set, range, file). <strong>Iterator</strong>: an object with <code>__next__</code> that returns the next item or raises <code>StopIteration</code>, and whose <code>__iter__</code> returns itself. This pair of rules is called the <strong>iterator protocol</strong>. Every iterator is iterable; not every iterable is an iterator.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Used-up iterators fail silently: no error, just nothing. A file object, <code>zip(...)</code>, <code>map(...)</code> and a generator are all iterators. Loop over one twice and the second loop does nothing. If you need two passes, keep a list, or create a fresh iterator.</p></div>
  <p>Where it matters: a PyTorch <code>DataLoader</code> is an iterable; each epoch's <code>for batch in loader</code> calls <code>iter()</code> and gets a fresh pass. <code>open("big.csv")</code> is an iterator that reads one line at a time, which is how you can loop over a 20 GB file.</p>

  <h2 id="pa-gen"><span class="num">02</span>Generators: Functions That Pause</h2>
  <p><code>CountUp</code> above needed a class, two dunder methods, a <code>self.cur</code> variable to remember the position, and a manual <code>raise StopIteration</code>. That is a lot of bookkeeping just to say "give 1, then 2, then 3". It gets worse for anything harder, like "read a file, skip comments, give one cleaned line at a time": you would have to store every bit of progress on <code>self</code> by hand.</p>
  <p>A normal function cannot help, because a normal function runs from top to bottom in one go. When it hits <code>return</code> it hands back one value and <em>forgets everything</em>: its local variables are thrown away, and next time it starts again from line 1.</p>
  <p>A <strong>generator function</strong> is a function that contains the word <code>yield</code>. <code>yield</code> works like a <code>return</code> that does not forget. It hands one value to the caller and then the function <strong>pauses</strong>: it freezes at that exact line, with all its local variables still holding their values. When the caller asks for the next value, the function <strong>resumes</strong> from the line just after the <code>yield</code>, as if it had never stopped.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cricket match stopped for rain. Play halts at over 32.4 with the score at 187/4. Nobody restarts the match from ball one. When the rain stops, play resumes from the very next ball, same batsmen, same score. <code>yield</code> is the rain break; <code>next()</code> is "play resumes". A normal <code>return</code> is the match being abandoned: the scorecard is thrown away.</p></div>
  <p>"Pausing" sounds mysterious, so here is what it means concretely. When you call a generator function, Python does <strong>not</strong> run its body. It creates a <strong>generator object</strong> that holds three things: the function's code, its local variables, and a marker for "which line am I on". Each <code>next()</code> runs the code from the marker until it reaches a <code>yield</code>, moves the marker there, and returns the yielded value. The local variables simply stay inside the generator object between calls. Nothing is sleeping or waiting; the object just sits in memory until someone calls <code>next()</code> again.</p>
  <figure class="viz"><svg viewBox="0 0 660 190" width="660">
    <defs><marker id="pa-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="44" class="tb">caller</text><text x="10" y="134" class="tg">generator</text>
    <line x1="90" y1="40" x2="650" y2="40" stroke="currentColor" opacity="0.3"/>
    <line x1="90" y1="130" x2="650" y2="130" stroke="currentColor" opacity="0.3"/>
    <text x="96" y="26">next()</text>
    <line x1="110" y1="44" x2="134" y2="114" stroke="currentColor" marker-end="url(#pa-ah2)"/>
    <rect x="136" y="116" width="104" height="26" rx="4" class="fg sg"/><text x="144" y="134">run, yield 1</text>
    <line x1="240" y1="116" x2="266" y2="46" stroke="currentColor" marker-end="url(#pa-ah2)"/><text x="258" y="90" class="tb">1</text>
    <text x="244" y="164" class="tm">paused</text>
    <text x="282" y="26">next()</text>
    <line x1="296" y1="44" x2="320" y2="114" stroke="currentColor" marker-end="url(#pa-ah2)"/>
    <rect x="322" y="116" width="128" height="26" rx="4" class="fg sg"/><text x="330" y="134">resume, yield 2</text>
    <line x1="450" y1="116" x2="476" y2="46" stroke="currentColor" marker-end="url(#pa-ah2)"/><text x="468" y="90" class="tb">2</text>
    <text x="454" y="164" class="tm">paused</text>
    <text x="490" y="26">next()</text>
    <line x1="504" y1="44" x2="528" y2="114" stroke="currentColor" marker-end="url(#pa-ah2)"/>
    <rect x="530" y="116" width="120" height="26" rx="4" class="fr sr"/><text x="538" y="134">runs off end</text>
    <text x="530" y="66" class="tr">StopIteration</text>
  </svg><figcaption>Time runs left to right. The top line is your code (the caller), the bottom line is the generator. Each next() jumps down into the generator, which runs until a yield and jumps back up with a value. Between jumps the generator is frozen ("paused") with its variables intact. When it runs off the end, the caller gets StopIteration.</figcaption></figure>
  <p>The code below is <code>CountUp</code> rewritten as a generator, with prints inside so you can see exactly which lines run on each <code>next()</code>. A normal function is shown first for contrast.</p>
  <div class="fx" data-lang="py">def normal():
    print("  normal: start")
    return 1
    print("  never runs")

def count_up(limit):
    print("  gen: start")
    i = 1
    while i &lt;= limit:
        print(f"  gen: about to yield {i}")
        yield i                       # pause here, hand i to the caller
        print(f"  gen: resumed after {i}")
        i += 1
    print("  gen: finished")

print(normal())
g = count_up(2)                       # nothing printed yet!
print(type(g).__name__)
print("caller got", next(g))
print("caller got", next(g))
try:
    next(g)                           # nothing left
except StopIteration:
    print("StopIteration")
for n in count_up(2):
    print("loop body sees", n)</div>
  <div class="fx" data-lang="text">  normal: start
1
generator
  gen: start
  gen: about to yield 1
caller got 1
  gen: resumed after 1
  gen: about to yield 2
caller got 2
  gen: resumed after 2
  gen: finished
StopIteration
  gen: start
  gen: about to yield 1
loop body sees 1
  gen: resumed after 1
  gen: about to yield 2
loop body sees 2
  gen: resumed after 2
  gen: finished</div>
  <p>Read the output against this table. The key line is <code>g = count_up(2)</code>: it printed <em>nothing</em>, because calling a generator function only builds the generator object.</p>
  <table class="tbl out"><caption>Trace of g = count_up(2)</caption>
    <tr><th>Call</th><th>Lines that run</th><th>i after</th><th>Paused at</th><th>Caller receives</th></tr>
    <tr><td><code>count_up(2)</code></td><td>none</td><td>(not set)</td><td>before line 1</td><td>generator object</td></tr>
    <tr><td>1st <code>next(g)</code></td><td>"start", <code>i = 1</code>, loop check, "about to yield 1"</td><td>1</td><td><code>yield i</code></td><td>1</td></tr>
    <tr><td>2nd <code>next(g)</code></td><td>"resumed after 1", <code>i += 1</code>, loop check, "about to yield 2"</td><td>2</td><td><code>yield i</code></td><td>2</td></tr>
    <tr><td>3rd <code>next(g)</code></td><td>"resumed after 2", <code>i += 1</code>, loop check fails, "finished"</td><td>3</td><td>ended</td><td><code>StopIteration</code></td></tr>
  </table>
  <p>Notice that <code>i</code> kept its value between calls: on the 2nd call it was still 1, because the generator remembered it. That is the "no bookkeeping" win: the local variable <em>is</em> the bookmark. The <code>for</code> loop at the end shows the same thing interleaved with the loop body: the generator produces one value, the body uses it, then the generator resumes. A generator object is an iterator, so <code>for</code>, <code>list()</code>, <code>sum()</code> and friends all accept it.</p>
  <h3>Generator expressions and yield from</h3>
  <p>For simple cases there is a one-line form. A list comprehension in square brackets builds the whole list right now. The same thing in round brackets is a <strong>generator expression</strong>: it builds nothing until asked. <code>yield from other</code> means "yield every item of <code>other</code>, one by one". And because a generator only runs when asked, it can even describe an endless sequence.</p>
  <div class="fx" data-lang="py">squares_list = [x * x for x in range(4)]   # square brackets: builds the whole list now
squares_gen = (x * x for x in range(4))    # round brackets: a generator, nothing computed yet
print(squares_list, squares_gen.__class__.__name__)
print(sum(squares_gen), sum(squares_gen))  # second pass: already used up

def chain(*iterables):
    for it in iterables:
        yield from it                      # same as: for x in it: yield x
print(list(chain([1, 2], "ab", range(2))))

def fib():
    a, b = 0, 1
    while True:                            # infinite, and that is fine
        yield a
        a, b = b, a + b
import itertools
print(list(itertools.islice(fib(), 10)))</div>
  <div class="fx" data-lang="text">[0, 1, 4, 9] generator
14 0
[1, 2, 'a', 'b', 0, 1]
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]</div>
  <p>The first <code>sum</code> pulled all four squares (0+1+4+9 = 14). The second <code>sum</code> got 0: the generator was already used up, and it said so silently. <code>chain</code> walked three different iterables as one stream. <code>fib()</code> has <code>while True</code>, which would hang as a normal function; as a generator it is safe, because <code>islice(fib(), 10)</code> asks for just ten values and then stops asking.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Generator function</strong>: a <code>def</code> containing <code>yield</code>. Calling it returns a <strong>generator</strong>, an iterator whose <code>__next__</code> runs the body up to the next <code>yield</code>. <strong>yield</strong> hands out a value and suspends the function with its local state saved. A <code>return</code> inside a generator ends it (raises <code>StopIteration</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"I called my function and nothing happened." If the body contains <code>yield</code> anywhere, calling it only creates a generator; no line runs until you loop over it or call <code>next</code>. This bites people who add a <code>yield</code> for debugging into a function that also writes a file.</p></div>

  <h2 id="pa-lazy"><span class="num">03</span>Lazy Evaluation &amp; Pipelines</h2>
  <p>Why bother with all this? Memory. Say you need the sum of the squares of the first 10 million numbers. <code>sum([x * x for x in range(N)])</code> first builds a list holding 10 million Python integers, then adds them up. Every one of those integers is an object in RAM at the same moment, even though <code>sum</code> only ever needs one at a time. With a real log file of a billion lines, the list version simply crashes your laptop.</p>
  <p><strong>Lazy evaluation</strong> means: do not compute a value until somebody actually asks for it. A generator is lazy. <code>sum(x * x for x in range(N))</code> asks for one square, adds it, throws it away, asks for the next. At any moment only one square exists.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A roadside dosa stall makes each dosa when a customer orders it. It does not cook 500 dosas at 6 a.m. and stack them up. The list version is the 500-dosa stack: lots of space, and wasted if only 20 people come. The generator is cook-to-order.</p></div>
  <p>The code below measures both versions with <code>tracemalloc</code>, a standard-library tool that records the peak memory Python allocated while a function ran.</p>
  <div class="fx" data-lang="py">import sys, tracemalloc, timeit
N = 10_000_000
print("generator object:", sys.getsizeof(x * x for x in range(N)), "bytes")

def peak_mb(fn):
    tracemalloc.start()
    fn()
    peak = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()
    return peak / 1e6

print(f"sum([...]) peak: {peak_mb(lambda: sum([x * x for x in range(N)])):.1f} MB")
print(f"sum(...)   peak: {peak_mb(lambda: sum(x * x for x in range(N))):.4f} MB")
print(f"time list: {timeit.timeit(lambda: sum([x * x for x in range(N)]), number=1):.2f}s")
print(f"time gen:  {timeit.timeit(lambda: sum(x * x for x in range(N)), number=1):.2f}s")</div>
  <div class="fx" data-lang="text">generator object: 200 bytes
sum([...]) peak: 409.1 MB
sum(...)   peak: 0.0005 MB
time list: 1.46s
time gen:  0.93s</div>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
    <text x="10" y="40">list [x*x ...]</text>
    <rect x="150" y="24" width="300" height="24" class="fr sr"/><text x="458" y="41">409 MB</text>
    <text x="10" y="90">gen  (x*x ...)</text>
    <rect x="150" y="74" width="2" height="24" class="fg sg"/><text x="162" y="91" class="tg">0.0005 MB</text>
    <text x="10" y="122" class="tm">peak memory of sum() over 10,000,000 squares (tracemalloc)</text>
  </svg><figcaption>Bar length is peak memory. The list holds all 10 million numbers at once; the generator holds one, so its bar is almost invisible.</figcaption></figure>
  <p>The generator object itself is 200 bytes whether N is 10 or 10 billion: it stores only the recipe and the current position. The list version peaked at 409 MB. The generator was also faster here, because it never had to allocate that huge block. On small inputs a list comprehension is often slightly faster; the big win of generators is memory, and being able to stop early.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>sys.getsizeof(a_list)</code> reports only the list's array of pointers (about 89 MB here), not the integer objects it points to. Use <code>tracemalloc</code> to see real memory.</p></div>
  <h3>Generator pipelines</h3>
  <p>Real data work is a chain of steps: read raw lines, parse each into a record, keep only the errors, take the first few. With lists, every step builds a full list before the next step starts. With generators, you connect the steps like pipes. Each step pulls one item from the step before it, works on it, and passes it on. Nothing runs until the last step asks.</p>
  <figure class="viz"><svg viewBox="0 0 580 90" width="580">
    <defs><marker id="pa-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="110" height="36" rx="6" class="fb sb"/><text x="22" y="43">read_lines</text>
    <rect x="160" y="20" width="90" height="36" rx="6" class="ft st"/><text x="180" y="43">parse</text>
    <rect x="290" y="20" width="90" height="36" rx="6" class="fv sb"/><text x="306" y="43">errors</text>
    <rect x="420" y="20" width="150" height="36" rx="6" class="fg sg"/><text x="432" y="43">islice(..., 3)</text>
    <line x1="122" y1="38" x2="156" y2="38" stroke="currentColor" marker-end="url(#pa-ah3)"/>
    <line x1="252" y1="38" x2="286" y2="38" stroke="currentColor" marker-end="url(#pa-ah3)"/>
    <line x1="382" y1="38" x2="416" y2="38" stroke="currentColor" marker-end="url(#pa-ah3)"/>
    <text x="10" y="80" class="tm">the last box pulls; one line flows through every stage before the next is read</text>
  </svg><figcaption>An assembly line. Data moves left to right, but the demand moves right to left: islice asks errors for an item, errors asks parse, parse asks read_lines for one line.</figcaption></figure>
  <p>The code builds a three-stage pipeline over a fake log file with a billion lines. <code>read_lines</code> prints each line it reads, so you can see that only the needed lines are ever read. <code>itertools.islice(it, n)</code> is "take the first n items" for any iterator.</p>
  <div class="fx" data-lang="py">import itertools

def read_lines():                         # stand-in for a huge log file
    for i in range(1, 1_000_000_000):
        print(f"  read line {i}")
        yield f"{i},{'ERROR' if i % 4 == 0 else 'OK'},{i * 3 % 1000}"

def parse(lines):
    for ln in lines:
        i, level, ms = ln.split(",")
        yield {"id": int(i), "level": level, "ms": int(ms)}

def errors(rows):
    return (r for r in rows if r["level"] == "ERROR")

pipe = errors(parse(read_lines()))        # builds the chain, reads nothing
print("pipeline built")
print(next(pipe))                         # pull ONE error row
print(list(itertools.islice(pipe, 2)))    # pull two more

def batches(it, size):                    # mini-batches for training
    it = iter(it)
    while chunk := list(itertools.islice(it, size)):
        yield chunk
print(list(batches(range(7), 3)))</div>
  <div class="fx" data-lang="text">pipeline built
  read line 1
  read line 2
  read line 3
  read line 4
{'id': 4, 'level': 'ERROR', 'ms': 12}
  read line 5
  read line 6
  read line 7
  read line 8
  read line 9
  read line 10
  read line 11
  read line 12
[{'id': 8, 'level': 'ERROR', 'ms': 24}, {'id': 12, 'level': 'ERROR', 'ms': 36}]
[[0, 1, 2], [3, 4, 5], [6]]</div>
  <p>Step by step: building <code>pipe</code> printed nothing except our own "pipeline built". The first <code>next(pipe)</code> asked <code>errors</code> for a row; it asked <code>parse</code>, which asked <code>read_lines</code>. Lines 1–3 were "OK", so <code>errors</code> threw them away and kept asking; line 4 was the first ERROR and came out. The <code>islice(pipe, 2)</code> then read lines 5–12 to find two more errors. Out of a billion lines, twelve were read. <code>batches</code> uses the same trick to cut any stream into chunks of 3 (the <code>:=</code> "walrus" operator assigns and tests in one go; the loop stops when a chunk comes back empty).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Lazy evaluation</strong>: values are computed on demand, one at a time, instead of all up front (<strong>eager</strong>). A <strong>generator pipeline</strong> is several generators fed into each other, so memory use stays at about one item no matter how big the input is.</p></div>
  <table class="tbl">
    <tr><th>Use a list when</th><th>Use a generator when</th></tr>
    <tr><td>Data fits in memory and you need <code>len</code>, indexing <code>x[5]</code>, sorting, or more than one pass</td><td>Data is huge, streaming or infinite; one pass is enough; you may stop early</td></tr>
  </table>
  <p>Where you meet it: <code>pd.read_csv(path, chunksize=100_000)</code> returns an iterator of DataFrames; PyTorch <code>IterableDataset</code> and Hugging Face <code>load_dataset(..., streaming=True)</code> stream examples; Python 3.12+ has <code>itertools.batched(it, n)</code> built in. Interviews: "how would you process a 50 GB file on an 8 GB machine?" Answer: stream it with a generator pipeline or chunks.</p>

  <h2 id="pa-func"><span class="num">04</span>Functions Are Values</h2>
  <p>Before closures and decorators make sense you need one fact that feels odd at first: in Python a function is an ordinary value, like a number or a list. Most beginners only ever <em>call</em> functions, <code>greet("asha")</code>. But the name <code>greet</code> without brackets is the function itself, an object sitting in memory. You can put it in another variable, pass it into another function, or return it from a function.</p>
  <p>The brackets are what make the difference. <code>greet</code> means "the function". <code>greet("asha")</code> means "run the function now and give me its result".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A recipe card versus the dish. <code>greet</code> is the recipe card: you can photocopy it, hand it to a friend, or post it to someone. <code>greet("asha")</code> is cooking the dish from the card. Handing someone the card does not cook anything.</p></div>
  <p>The code shows the three things you can do with a function value.</p>
  <div class="fx" data-lang="py">def greet(name):
    return f"hi {name}"

say = greet                     # 1. store a function in a variable (no brackets!)
print(say("asha"), say is greet)

def call_twice(f, x):           # 2. pass a function as an argument
    return [f(x), f(x)]
print(call_twice(greet, "ben"))

def make_greeter():             # 3. return a function from a function
    def inner(name):
        return f"hello {name}"
    return inner
g = make_greeter()
print(g("chitra"), g.__name__)</div>
  <div class="fx" data-lang="text">hi asha True
['hi ben', 'hi ben']
hello chitra inner</div>
  <p>Line by line. <code>say = greet</code> did not call anything; it made a second name for the same function object, so <code>say is greet</code> is <code>True</code> and <code>say("asha")</code> works. <code>call_twice(greet, "ben")</code> handed the function in as <code>f</code>, and <code>call_twice</code> called it twice. <code>make_greeter()</code> defined a function <code>inner</code> inside itself and returned it (no brackets after <code>inner</code>); <code>g</code> now holds that inner function, whose name is still <code>inner</code>.</p>
  <p>You already use idea 2 all the time: <code>sorted(words, key=len)</code> passes the function <code>len</code>; <code>df.apply(np.log)</code> passes <code>np.log</code>; <code>Thread(target=work)</code> passes <code>work</code>. Idea 3, returning a function, is the base of the next two sections.</p>
  <div class="callout def"><span class="label">Definition</span><p>Python has <strong>first-class functions</strong>: functions are objects that can be assigned, passed as arguments and returned. A function that takes or returns another function is called a <strong>higher-order function</strong> (<code>sorted</code> with <code>key=</code>, <code>map</code>, and every decorator).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>call_twice(greet("ben"), 1)</code> passes the <em>result</em> (the string "hi ben"), not the function, and fails with <code>TypeError: 'str' object is not callable</code>. Same bug in real code: <code>Thread(target=work())</code> runs <code>work</code> immediately in the main thread. Pass the name without brackets.</p></div>

  <h2 id="pa-clos"><span class="num">05</span>Closures</h2>
  <p>Suppose you need a "multiply by 2" function and a "multiply by 3" function, and maybe later "multiply by 1.18" for GST. Writing a separate <code>def</code> for each is repetitive. You would like a function that <em>makes</em> multiplier functions: you tell it the factor once, and it gives back a ready-to-use function.</p>
  <p>From the last section you know a function can return an inner function. The new question is: the inner function uses <code>factor</code>, which belongs to the outer function. The outer function has finished and returned. Normally its local variables are thrown away at that point. So where does the inner function get <code>factor</code> from?</p>
  <p>Answer: Python notices that the inner function uses an outer variable, and keeps that variable alive, attached to the inner function. The inner function carries it around. A function bundled with the outer variables it needs is called a <strong>closure</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A tiffin box packed at home. Your mother (the outer function) packs dal and rice (the variables) in the morning and goes about her day. At 1 p.m. at the office (long after she "returned"), you open the tiffin and the food is there. The inner function leaves home carrying exactly the variables it needs.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="pa-ah6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="200" height="56" rx="6" class="fs" stroke="currentColor"/><text x="22" y="62">multiplier(2)</text><text x="22" y="82" class="tm">runs, then finishes</text>
    <line x1="212" y1="68" x2="276" y2="68" stroke="currentColor" marker-end="url(#pa-ah6)"/><text x="218" y="58" class="tm">returns</text>
    <rect x="280" y="20" width="200" height="100" rx="6" class="fb sb"/><text x="292" y="42">multiply(x)</text><text x="292" y="62" class="tm">return x * factor</text>
    <rect x="292" y="76" width="176" height="32" rx="5" class="fg sg"/><text x="302" y="97">kept: factor = 2</text>
    <text x="496" y="62">= double</text>
    <text x="10" y="142" class="tm">double(5) looks up factor in its own kept cell → 5 * 2 = 10</text>
  </svg><figcaption>multiplier(2) builds multiply and returns it. multiplier itself is gone, but multiply keeps the variable factor = 2 attached to it (the green "kept" box). That bundle is the closure we name double.</figcaption></figure>
  <p>The code below builds two multipliers, peeks at the stored variable, and then builds a counter that changes its remembered variable.</p>
  <div class="fx" data-lang="py">def multiplier(factor):
    def multiply(x):
        return x * factor                 # factor comes from the outer function
    return multiply

double = multiplier(2)                    # multiplier has finished running...
triple = multiplier(3)
print(double(5), triple(5))               # ...but factor is still remembered
print(double.__closure__[0].cell_contents, triple.__closure__[0].cell_contents)

def counter():
    n = 0
    def inc():
        nonlocal n                        # "n is the outer n, let me change it"
        n += 1
        return n
    return inc

c = counter()
print(c(), c(), c())
c2 = counter()                            # a brand-new, separate n
print(c2())

def broken_counter():
    n = 0
    def inc():
        n += 1                            # no nonlocal
        return n
    return inc
broken_counter()()</div>
  <div class="fx" data-lang="text">10 15
2 3
1 2 3
1
UnboundLocalError: cannot access local variable 'n' where it is not associated with a value</div>
  <p>What happened. Each call to <code>multiplier</code> created a <em>new</em> <code>multiply</code> with its own saved <code>factor</code>, so <code>double</code> and <code>triple</code> do not interfere. <code>__closure__</code> is where Python keeps the saved variables (each in a small box called a <strong>cell</strong>); we printed their contents, 2 and 3.</p>
  <p>The counter is a closure that <em>changes</em> its saved variable. Trace <code>c = counter()</code>: n = 0 is saved. <code>c()</code> → n becomes 1, returns 1. <code>c()</code> → 2. <code>c()</code> → 3. A new <code>counter()</code> call makes a fresh n, so <code>c2()</code> starts at 1. The <code>nonlocal n</code> line is required: without it, <code>n += 1</code> makes Python treat <code>n</code> as a brand-new local variable of <code>inc</code>, and reading it before assigning fails, as <code>broken_counter</code> shows. Reading an outer variable needs nothing; <em>reassigning</em> it needs <code>nonlocal</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>closure</strong> is a function object together with the variables from its enclosing function that it uses (its <strong>free variables</strong>), kept alive after the enclosing function returns. <strong>nonlocal x</strong> tells Python that assigning to <code>x</code> should change the enclosing function's <code>x</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: late binding</span><p>A closure saves the <em>variable</em>, not its value at that moment. It reads the value when it is called.</p></div>
  <div class="fx" data-lang="py">fs = [lambda: i for i in range(3)]
print([f() for f in fs])                  # all see the final i
fs = [lambda i=i: i for i in range(3)]    # default arg freezes the value now
print([f() for f in fs])</div>
  <div class="fx" data-lang="text">[2, 2, 2]
[0, 1, 2]</div>
  <p>All three lambdas share the one variable <code>i</code>. By the time they are called the loop is over and <code>i</code> is 2. A default argument (<code>i=i</code>) is evaluated when the lambda is <em>created</em>, so each lambda gets its own copy. This is a very common interview "what's the output?" question, and a real bug when building callbacks in a loop (for example, one button handler per column in a dashboard).</p>
  <p>Where closures show up: function factories like <code>multiplier</code>, callbacks that need some settings, <code>functools.partial</code>, and, most importantly, every decorator. Which is next.</p>

  <h2 id="pa-deco"><span class="num">06</span>Decorators, Step by Step</h2>
  <p>Here is the problem decorators solve. You have twenty functions in a data pipeline. Your manager asks: "log every call, with its arguments and result". Without decorators you paste the same three logging lines into all twenty functions. Next week: "also time every call". Paste again. The real logic of each function gets buried under copy-pasted extras, and when the log format changes you edit twenty places.</p>
  <div class="fx" data-lang="py"># the painful way: logging pasted into every function
def add(a, b):
    print("calling add")
    return a + b

def mul(a, b):
    print("calling mul")
    return a * b</div>
  <p>What you want is to write the extra behaviour <strong>once</strong>, and then say "apply it to this function" with one short line, without touching the function's own code. A <strong>decorator</strong> is exactly that: a function that takes your function and gives back a new function that does the extra work and calls the original in the middle.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A security guard at an office door. The room inside (your function) is unchanged. But everyone who goes in now passes the guard first, who checks the ID and writes in the register, and notes when they leave. You can put the same kind of guard on twenty doors without rebuilding any room.</p></div>
  <h3>Step 1: build it by hand, no @ yet</h3>
  <p>We use the two tools from the last two sections. A function can take a function (the original). A function can return a new inner function (the wrapper), and that wrapper, being a closure, remembers the original. The code writes a <code>logged</code> function that does this, applies it by hand to <code>sub</code>, then does the same with the <code>@</code> line.</p>
  <div class="fx" data-lang="py">def logged(func):
    def wrapper(*args, **kwargs):
        print("calling", func.__name__, "with", args)
        result = func(*args, **kwargs)    # run the original
        print("  -&gt;", result)
        return result
    return wrapper

def sub(a, b):
    return a - b

sub = logged(sub)        # replace sub with the wrapped version
print(sub(10, 4))

@logged                  # Step 2: exactly the same as div = logged(div)
def div(a, b):
    return a / b
print(div(9, 3))</div>
  <div class="fx" data-lang="text">calling sub with (10, 4)
  -&gt; 6
6
calling div with (9, 3)
  -&gt; 3.0
3.0</div>
  <p>Walk through <code>sub = logged(sub)</code>. On the right side, <code>logged</code> receives the original <code>sub</code> as <code>func</code>. It defines <code>wrapper</code> and returns it. On the left side, the name <code>sub</code> is now pointed at that wrapper. The original function still exists, but the only way to reach it is through the wrapper's closure, where it is saved as <code>func</code>. So <code>sub(10, 4)</code> really calls <code>wrapper(10, 4)</code>: it prints, calls <code>func(10, 4)</code> (the original, giving 6), prints the result, and returns 6.</p>
  <p><code>*args, **kwargs</code> in the wrapper means "accept any positional and keyword arguments" and then pass them all on unchanged. That is what lets one decorator fit functions with any signature. And <code>return result</code> matters: forget it and every decorated function returns <code>None</code>.</p>
  <figure class="viz"><svg viewBox="0 0 600 180" width="600">
    <defs><marker id="pa-ah7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="20" class="tm">before:</text>
    <text x="10" y="52">sub</text>
    <line x1="44" y1="48" x2="106" y2="48" stroke="currentColor" marker-end="url(#pa-ah7)"/>
    <rect x="110" y="30" width="170" height="36" rx="6" class="fg sg"/><text x="122" y="53">original sub()</text>
    <text x="10" y="100" class="tm">after sub = logged(sub):</text>
    <text x="10" y="142">sub</text>
    <line x1="44" y1="138" x2="106" y2="138" stroke="currentColor" marker-end="url(#pa-ah7)"/>
    <rect x="110" y="120" width="170" height="36" rx="6" class="fb sb"/><text x="122" y="143">wrapper()</text>
    <line x1="282" y1="138" x2="376" y2="138" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pa-ah7)"/>
    <rect x="380" y="120" width="170" height="36" rx="6" class="fg sg"/><text x="392" y="143">original sub()</text>
    <text x="290" y="174" class="tm">kept in the closure as func</text>
  </svg><figcaption>A decorator only moves a name. Before, the name sub points at your function. After, it points at the wrapper, and the wrapper holds on to the original (dashed arrow) so it can call it in the middle.</figcaption></figure>
  <p>That is the whole secret of <code>@</code>. Writing <code>@logged</code> on the line above <code>def div</code> is shorthand for writing <code>div = logged(div)</code> right after the function. Nothing more.</p>
  <h3>When does each part run?</h3>
  <p>The part that confuses most people: there are two moments. The decorator function runs <strong>once</strong>, when Python reaches the <code>def</code> (usually when the module is imported). The wrapper runs on <strong>every call</strong>. The code below prints at both moments.</p>
  <div class="fx" data-lang="py">def announce(func):
    print(f"decorating {func.__name__}")      # runs ONCE, at def time
    def wrapper(*args, **kwargs):
        print(f"before {func.__name__}")      # runs on EVERY call
        result = func(*args, **kwargs)
        print(f"after {func.__name__}")
        return result
    return wrapper

@announce
def hello(name):
    print(f"  hello {name}")
    return len(name)

print("--- definition done, now calling")
print(hello("asha"))
print(hello("ravi"))</div>
  <div class="fx" data-lang="text">decorating hello
--- definition done, now calling
before hello
  hello asha
after hello
4
before hello
  hello ravi
after hello
4</div>
  <p>"decorating hello" appeared once, before any call, as soon as the <code>def</code> finished. Each call then printed before/after around the real body. This is how Flask's <code>@app.route("/home")</code> works: the decorator runs at import time and registers your function in a table of URLs; later each web request calls it.</p>
  <h3>functools.wraps: keep the original's name</h3>
  <p>One side effect: after decorating, the name <code>sub</code> points at a function called <code>wrapper</code>. Its <code>__name__</code>, its docstring and its signature are the wrapper's, not yours. Logs and error tracebacks say "wrapper", <code>help()</code> shows nothing, and tools that read the signature break. <code>functools.wraps</code> is a ready-made decorator for the wrapper that copies those details over from the original.</p>
  <div class="fx" data-lang="py">import functools, inspect

def shout(func):                          # no wraps
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs).upper()
    return wrapper

def shout2(func):
    @functools.wraps(func)                # copy name, docstring, signature info
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
print(greet2("asha"), "|", greet2.__name__, "|", greet2.__doc__)
print(greet2.__wrapped__("ben"))
print(inspect.signature(greet), inspect.signature(greet2))</div>
  <div class="fx" data-lang="text">HI ASHA | wrapper | None
HI ASHA | greet2 | Return a greeting.
hi ben
(*args, **kwargs) (name)</div>
  <p>Both decorators work (HI ASHA). But <code>greet</code> lost its identity: name "wrapper", no docstring, signature <code>(*args, **kwargs)</code>. <code>greet2</code>, with <code>@functools.wraps(func)</code>, looks like the original from outside. <code>wraps</code> also adds <code>__wrapped__</code>, a link back to the undecorated function, which tests use to call it without the extras ("hi ben", not shouted). FastAPI, pytest and Click read signatures to decide what arguments to pass, so missing <code>wraps</code> can break them. Rule: always put <code>@functools.wraps(func)</code> on your wrapper.</p>
  <h3>Stacking decorators</h3>
  <p>You can put several decorators on one function. They are applied from the bottom up (the one nearest the <code>def</code> wraps first), and at call time they run from the outside in, like layers of an onion.</p>
  <div class="fx" data-lang="py">def tag(t):
    def deco(f):
        @functools.wraps(f)
        def w(*a, **k):
            return f"&lt;{t}&gt;{f(*a, **k)}&lt;/{t}&gt;"
        return w
    return deco

@tag("b")
@tag("i")
def word():
    return "hey"                  # = tag("b")(tag("i")(word))
print(word())</div>
  <div class="fx" data-lang="text">&lt;b&gt;&lt;i&gt;hey&lt;/i&gt;&lt;/b&gt;</div>
  <p><code>tag("i")</code> wrapped <code>word</code> first, then <code>tag("b")</code> wrapped that. Calling <code>word()</code> enters the outer b-wrapper, which calls the i-wrapper, which calls the real <code>word</code>. So <code>&lt;b&gt;</code> ends up outside. (<code>tag("b")</code> has brackets because this decorator takes an argument; the next section explains that extra layer.)</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>decorator</strong> is a callable that takes a function and returns a replacement (usually a <strong>wrapper</strong> closure that calls the original). <code>@d</code> above <code>def f</code> means <code>f = d(f)</code>. <code>@a @b def f</code> means <code>f = a(b(f))</code>. <strong>functools.wraps</strong> copies <code>__name__</code>, <code>__doc__</code>, <code>__module__</code>, <code>__qualname__</code> and <code>__dict__</code> onto the wrapper and sets <code>__wrapped__</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Three classic slips: forgetting <code>return result</code> in the wrapper (every call returns <code>None</code>); forgetting <code>return wrapper</code> in the decorator (the name becomes <code>None</code>, and calling it gives <code>TypeError: 'NoneType' object is not callable</code>); and writing <code>return wrapper()</code> with brackets, which calls it once at definition time.</p></div>
  <p>Where you see decorators: <code>@app.route</code> (Flask), <code>@app.get</code> (FastAPI), <code>@pytest.fixture</code>, <code>@torch.no_grad()</code>, <code>@property</code>, <code>@staticmethod</code>, <code>@dataclass</code>, <code>@lru_cache</code>. Interviewers almost always ask you to write one (a timer or a logger) on the spot.</p>

  <h2 id="pa-prac"><span class="num">07</span>Decorators With Arguments &amp; Practical Ones</h2>
  <p>A retry decorator should let you choose how many times to retry: <code>@retry(times=3)</code>. Notice the brackets. Python first <em>calls</em> <code>retry(times=3)</code>, and whatever that returns is used as the decorator. So <code>retry(times=3)</code> must return a decorator, which takes the function and returns a wrapper. That is three nested functions, each with one job.</p>
  <div class="flow"><span>retry(times=3)</span><span>returns decorator</span><span>decorator(func)</span><span>returns wrapper</span><span>wrapper(*args) on each call</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A tailor's shop. First you give your measurements (the options: <code>times=3</code>). The shop makes a pattern for you (the decorator). The pattern is then used to stitch the cloth (your function) into a shirt (the wrapper). Measurements → pattern → shirt.</p></div>
  <p>Trace of <code>@retry(times=3, exceptions=(ConnectionError,))</code> on <code>fetch</code>:</p>
  <table class="tbl out"><caption>Three layers, three moments</caption>
    <tr><th>Moment</th><th>Call</th><th>Returns</th><th>Remembers (closure)</th></tr>
    <tr><td>def time</td><td><code>retry(times=3, ...)</code></td><td><code>decorator</code></td><td>times, exceptions, delay</td></tr>
    <tr><td>def time</td><td><code>decorator(fetch)</code></td><td><code>wrapper</code>, now named <code>fetch</code></td><td>+ func</td></tr>
    <tr><td>each call</td><td><code>fetch()</code> = <code>wrapper()</code></td><td>the result, after up to 3 tries</td><td>uses all of the above</td></tr>
  </table>
  <p>The code below writes two practical decorators. <code>timer</code> (no options) measures how long a call takes, using <code>try/finally</code> so it reports even if the function fails. <code>retry</code> (with options) catches the listed errors and tries again, waiting longer each time ("exponential backoff": delay, 2×delay, 4×delay). The fake <code>fetch</code> fails twice with a timeout and then succeeds.</p>
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
def always_fails():
    raise ValueError("bad input")
try:
    always_fails()
except ValueError as e:
    print("gave up:", e)</div>
  <div class="fx" data-lang="text">attempt 1 failed: timeout; retrying
attempt 2 failed: timeout; retrying
fetch took 0.200s
200 OK
attempt 1 failed: bad input; retrying
gave up: bad input</div>
  <p>Follow <code>fetch()</code>. The outer layer is <code>timer</code> (it is on top), so the clock starts first. Inside it, the retry wrapper runs attempt 1: <code>ConnectionError</code>, which is in the list, so it prints and loops. Attempt 2: same. Attempt 3 succeeds and returns "200 OK". Only then does <code>timer</code>'s <code>finally</code> print the time, which covers all three attempts together, because timer is outside retry. Swap the two lines and you would time each attempt separately. For <code>always_fails</code>, on the last attempt <code>raise</code> (with no argument) re-raises the original error so the caller sees the real cause.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Retry only <em>temporary</em> errors (timeouts, HTTP 503, connection resets). Retrying a <code>ValueError</code> just repeats the same bug three times. Retrying something that is not safe to repeat (a payment, an email) can do it twice. Also, <code>@retry</code> without brackets on a decorator that expects options passes your function in as <code>times</code>; with options you must write the brackets, even if empty: <code>@retry()</code>.</p></div>
  <h3>Caching with lru_cache</h3>
  <p>A slow function called again and again with the same input wastes time. The naive recursive Fibonacci computes <code>fib(28)</code> twice, <code>fib(27)</code> three times, and so on: about 1.6 million calls for <code>fib(30)</code>. <strong>Memoisation</strong> means remembering results: the first time you compute <code>fib(n)</code>, store it; next time just look it up. <code>functools.lru_cache</code> is a decorator that does this for any function. Inside, its wrapper keeps a dict from arguments to results: a closure again.</p>
  <div class="fx" data-lang="py">import functools, time
def fib_slow(n):
    return n if n &lt; 2 else fib_slow(n - 1) + fib_slow(n - 2)

@functools.lru_cache(maxsize=None)        # functools.cache is the same, 3.9+
def fib(n):
    return n if n &lt; 2 else fib(n - 1) + fib(n - 2)

t = time.perf_counter(); fib_slow(30); print(f"plain fib(30):  {time.perf_counter() - t:.3f}s")
t = time.perf_counter(); fib(30);      print(f"cached fib(30): {time.perf_counter() - t:.6f}s")
print(fib.cache_info())

@functools.lru_cache
def total(xs):
    return sum(xs)
print(total((1, 2)))
total([1, 2])</div>
  <div class="fx" data-lang="text">plain fib(30):  0.140s
cached fib(30): 0.000036s
CacheInfo(hits=28, misses=31, maxsize=None, currsize=31)
3
TypeError: unhashable type: 'list'</div>
  <p>The cached version is about 4000× faster. <code>cache_info()</code> explains why: only 31 real computations (<code>misses</code>, one per n from 0 to 30), and 28 times the answer was simply looked up (<code>hits</code>). The last line shows the limit: the cache stores arguments as dict keys, so they must be <strong>hashable</strong> (unchangeable types like numbers, strings, tuples). A list is not, so it fails; pass a tuple instead.</p>
  <ul>
    <li>Use it only for <strong>pure</strong> functions: same input always gives same output, no side effects. Caching a function that reads the clock or a database returns stale answers.</li>
    <li><code>maxsize=128</code> (the default) throws away the least recently used entries; <code>None</code> grows forever.</li>
    <li>On methods it keeps every <code>self</code> alive inside the cache (a memory leak); prefer <code>functools.cached_property</code> for per-object values.</li>
  </ul>
  <p>Where it matters: caching an expensive feature lookup or a config load, dynamic programming problems in interviews (see <a class="xref" data-note="dsa_dp">Dynamic Programming</a>), and the general "decorator with options" pattern you will reuse for rate limiting, auth checks and metrics.</p>

  <h2 id="pa-ctx"><span class="num">08</span>Context Managers</h2>
  <p>Many resources must be given back after use: a file must be closed, a lock released, a database connection returned to its pool, a GPU setting switched back. The usual code is "open, work, close". The danger is an error in the middle: the program jumps straight to the error handler and the "close" line never runs. Leak enough file handles or connections in a long-running service and it falls over.</p>
  <p>The code below shows the problem and two fixes. Fix 1 is <code>try/finally</code>: code in <code>finally</code> runs no matter how the <code>try</code> block ends. Fix 2 is the <code>with</code> statement, which does the same thing in one line.</p>
  <div class="fx" data-lang="py"># The problem: an error between open and close
f = open("report.txt", "w")
try:
    f.write("line 1\\n")
    1 / 0                          # something goes wrong
    f.close()                      # never reached
except ZeroDivisionError:
    print("error! file closed?", f.closed)

# Fix 1: try/finally, correct but noisy
f = open("report.txt", "w")
try:
    f.write("line 1\\n")
finally:
    f.close()
print("try/finally closed?", f.closed)

# Fix 2: with, the same guarantee in one line
try:
    with open("report.txt", "w") as f:
        f.write("line 1\\n")
        1 / 0
except ZeroDivisionError:
    print("with closed?", f.closed)</div>
  <div class="fx" data-lang="text">error! file closed? False
try/finally closed? True
with closed? True</div>
  <p>In the first block the division error skipped <code>f.close()</code>, so the file was left open. The <code>try/finally</code> version always closes, but you have to remember to write it every time. The <code>with</code> version closed the file even though the error happened inside it. That guarantee is what a <strong>context manager</strong> gives: an object that knows how to set something up and how to clean it up, and the <code>with</code> statement promises the cleanup runs.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Borrowing a book from a library with an automatic return. When you walk in (enter), the book is issued to you. Whatever happens while you read it — you finish it, you get bored, you get called away in an emergency — the moment you walk out of the door (exit), the book is returned at the counter. You never have to remember to return it.</p></div>
  <h3>How with works: __enter__ and __exit__</h3>
  <p>Like <code>for</code>, <code>with</code> just calls two dunder methods. <code>with obj as x:</code> calls <code>obj.__enter__()</code> at the start and puts its return value in <code>x</code>. When the block ends — normally, by <code>return</code>, <code>break</code>, or an exception — it calls <code>obj.__exit__(exc_type, exc, tb)</code>. Those three arguments describe the error, if there was one: its class, the error object, and the traceback. If the block finished without error, all three are <code>None</code>.</p>
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
  </svg><figcaption>Setup runs first. Then the body. Whichever way the body ends, __exit__ runs: with three Nones on success (green), or with the error's details on failure (red). If __exit__ returns True the error is swallowed; otherwise it continues to the caller.</figcaption></figure>
  <p>The code builds a <code>Timer</code> context manager with prints in each method, then uses it once successfully and once with an error.</p>
  <div class="fx" data-lang="py">import time

class Timer:
    def __enter__(self):
        print("enter: start the clock")
        self.t0 = time.perf_counter()
        return self                               # this becomes "t" in "as t"
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.t0
        name = exc_type.__name__ if exc_type else "no error"
        print(f"exit: {name}, {self.elapsed:.2f}s")
        return False                              # don't swallow errors

with Timer() as t:
    print("body: working")
    time.sleep(0.1)
print("after block, t.elapsed =", round(t.elapsed, 2))

try:
    with Timer():
        print("body: about to divide by zero")
        1 / 0
except ZeroDivisionError:
    print("error still reached the caller")</div>
  <div class="fx" data-lang="text">enter: start the clock
body: working
exit: no error, 0.10s
after block, t.elapsed = 0.1
enter: start the clock
body: about to divide by zero
exit: ZeroDivisionError, 0.00s
error still reached the caller</div>
  <p>First block: enter ran, then the body, then exit with <code>exc_type = None</code>. Because <code>__enter__</code> returned <code>self</code>, <code>t</code> is the Timer, and we can read <code>t.elapsed</code> after the block. Second block: the division failed, Python called <code>__exit__</code> with <code>ZeroDivisionError</code> details, our exit printed it, and since it returned <code>False</code> the error carried on to the outer <code>except</code>.</p>
  <h3>Swallowing an error on purpose</h3>
  <p>If <code>__exit__</code> returns <code>True</code>, Python treats the error as handled and continues after the <code>with</code> block. The rest of the block is still skipped. The standard library has this built in as <code>contextlib.suppress</code>.</p>
  <div class="fx" data-lang="py">from contextlib import suppress

class Ignore:
    def __init__(self, *types):
        self.types = types
    def __enter__(self):
        return self
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
  <p>The <code>KeyError</code> jumped out of the body at <code>{}["missing"]</code>, so "never printed" was indeed never printed. <code>__exit__</code> returned <code>True</code> because the error type was in the list, so the program carried on. Only swallow the specific error you expect.</p>
  <h3>The easy way: @contextmanager</h3>
  <p>Writing a class with two methods is a lot for "do X before, Y after". Remember generators: a function that runs up to <code>yield</code>, pauses, and resumes later. That is exactly the shape of a context manager. <code>contextlib.contextmanager</code> turns a generator into one: the code before <code>yield</code> is the setup, the <code>with</code> body runs while the generator is paused at the <code>yield</code>, and the code after it is the cleanup.</p>
  <div class="flow"><span>code before yield = __enter__</span><span>yield value → "as"</span><span>with body runs (generator paused)</span><span>finally = __exit__</span></div>
  <div class="fx" data-lang="py">from contextlib import contextmanager, ExitStack

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
with transaction(log):
    log.append("insert 1")
print(log)

log = []
try:
    with transaction(log):
        log.append("insert 2")
        raise ValueError("constraint")
except ValueError:
    pass
print(log)

@contextmanager
def no_finally(log):
    log.append("open")
    yield
    log.append("close")              # skipped if the body raises
log = []
try:
    with no_finally(log):
        raise RuntimeError("boom")
except RuntimeError:
    pass
print("without try/finally:", log)</div>
  <div class="fx" data-lang="text">['BEGIN', 'insert 1', 'COMMIT', 'close']
['BEGIN', 'insert 2', 'ROLLBACK (constraint)', 'close']
without try/finally: ['open']</div>
  <p>The <code>transaction</code> example is how database libraries behave. On success: BEGIN, the body's insert, then the <code>else</code> branch COMMITs and <code>finally</code> closes. On failure: the body's error is thrown back into the generator <em>at the <code>yield</code> line</em>, so the <code>except</code> there catches it, records a ROLLBACK, and <code>raise</code> passes it on; <code>finally</code> still closes. The last example has no <code>try/finally</code>: the error surfaced at the <code>yield</code> and the "close" line never ran. That is the number-one bug with <code>@contextmanager</code>.</p>
  <h3>Many resources: ExitStack</h3>
  <p>When the number of things to open is only known at run time (say, one file per input path), nesting <code>with</code> blocks is impossible. <code>ExitStack</code> collects any number of context managers and closes them all, last-opened first.</p>
  <div class="fx" data-lang="py">@contextmanager
def resource(name):
    print("open", name)
    try:
        yield name
    finally:
        print("close", name)

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
  <p>Each <code>enter_context</code> entered one resource and remembered its cleanup. When the <code>with ExitStack()</code> block ended, it ran the cleanups in reverse order, exactly like three nested <code>with</code>s would. For a fixed small set, one line works too: <code>with open(a) as f, open(b, "w") as g:</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>context manager</strong> is an object with <code>__enter__</code> and <code>__exit__</code>, used by the <code>with</code> statement to pair setup with guaranteed teardown. <code>__exit__(exc_type, exc_value, traceback)</code> runs on every way out of the block; a truthy return value suppresses the exception. <code>@contextmanager</code> builds one from a generator with a single <code>yield</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>An <code>__exit__</code> that always returns <code>True</code> hides every bug in the block. And in a <code>@contextmanager</code> generator, always wrap the <code>yield</code> in <code>try/finally</code>, or the cleanup is skipped when the body raises.</p></div>
  <p>Where it matters: <code>with open(...)</code>, <code>with torch.no_grad():</code> (switch gradient tracking off, then back on), <code>with mlflow.start_run():</code> (log a training run and close it), <code>with lock:</code> in threads, <code>with engine.begin() as conn:</code> in SQLAlchemy (commit or roll back). Interview favourites: "what does <code>__exit__</code> return?", "write a context manager that changes the working directory and restores it".</p>

  <h2 id="pa-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: looping over an iterator twice</span>
    <p>Generators, <code>zip</code>, <code>map</code>, file objects and <code>csv.reader</code> are one-pass. The second loop silently does nothing. Example: <code>rows = (parse(l) for l in f)</code>, then <code>n = sum(1 for _ in rows)</code>, then <code>for r in rows:</code> → empty. Fix: <code>rows = list(...)</code> if it fits in memory, or rebuild the generator.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting a generator function to run when called</span>
    <p>Any <code>yield</code> in the body turns the whole function into a generator. <code>save_all(items)</code> then does nothing at all until something iterates the result.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: calling instead of passing</span>
    <p><code>Thread(target=work())</code>, <code>sorted(xs, key=len())</code>, <code>button.on_click(handler())</code>: the brackets run the function now and pass its result. Pass the name: <code>target=work</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: late binding in loops</span>
    <p><code>[lambda: i for i in range(3)]</code> → all return 2. Freeze the value with a default argument <code>lambda i=i: i</code> or <code>functools.partial</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reassigning an outer variable without nonlocal</span>
    <p><code>n += 1</code> inside the inner function → <code>UnboundLocalError</code>. Add <code>nonlocal n</code>. (Mutating, like <code>lst.append(1)</code>, does not need it.)</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrapper loses the result or the name</span>
    <p>Missing <code>return func(*args, **kwargs)</code> → every call returns <code>None</code>. Missing <code>@functools.wraps(func)</code> → name "wrapper", no docstring, frameworks confused.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: lru_cache on the wrong function</span>
    <p>Unhashable args (lists, dicts, DataFrames) → <code>TypeError</code>. Impure functions (time, DB, random) → stale results. Instance methods → objects never freed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: @contextmanager without try/finally</span>
    <p>The body's exception is raised at the <code>yield</code>, so code after it is skipped. Put cleanup in <code>finally</code>.</p>
  </div>

  <h2 id="pa-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does a <code>for</code> loop actually do?</summary><div class="qa-body"><code>it = iter(obj)</code> (calls <code>obj.__iter__()</code>), then repeatedly <code>x = next(it)</code> (calls <code>it.__next__()</code>) and runs the body, until <code>next</code> raises <code>StopIteration</code>, which the loop catches silently and stops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Iterable vs iterator?</summary><div class="qa-body">An iterable has <code>__iter__</code> and returns a fresh iterator each time (list, dict, str), so it can be looped many times. An iterator has <code>__next__</code>, remembers its position, and returns itself from <code>__iter__</code>, so it can be consumed only once. Every iterator is iterable; not every iterable is an iterator.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>yield</code> vs <code>return</code>?</summary><div class="qa-body"><code>return</code> ends the function and throws away its local variables. <code>yield</code> hands back a value and <em>pauses</em>, keeping the local variables and the current line for the next <code>next()</code>. A <code>return</code> inside a generator ends it (raises StopIteration).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "a generator pauses" mean concretely?</summary><div class="qa-body">The generator object stores the function's code, its local variables and the position of the last <code>yield</code>. Between <code>next()</code> calls nothing is running; the object just keeps that saved state in memory. The next <code>next()</code> continues from the line after that <code>yield</code> with the same variables.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>g = (x for x in [1, 2, 3])</code>; <code>print(sum(g), list(g))</code></summary><div class="qa-body"><code>6 []</code>. <code>sum</code> uses up the generator; the second consumer gets nothing, with no error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you process a 50 GB CSV on an 8 GB laptop?</summary><div class="qa-body">Never load it whole. Stream it: iterate the file line by line in a generator pipeline (read → parse → filter → aggregate), or use <code>pd.read_csv(path, chunksize=100_000)</code> and combine per-chunk results. Memory stays at about one chunk.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a closure, and what does <code>[lambda: i for i in range(3)]</code> return when each is called?</summary><div class="qa-body">A closure is an inner function that keeps access to variables of the function that created it, even after that function returned. All three lambdas return <code>2</code>: they share the variable <code>i</code> and read it at call time, after the loop ended. Fix: <code>lambda i=i: i</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need <code>nonlocal</code>?</summary><div class="qa-body">When an inner function <em>reassigns</em> a variable of the enclosing function (<code>n += 1</code>, <code>n = 5</code>). Without it Python treats <code>n</code> as a new local and raises <code>UnboundLocalError</code>. Reading, or mutating an object (<code>lst.append</code>), needs nothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@deco</code> above <code>def f</code> do, exactly?</summary><div class="qa-body">After the function is defined, Python runs <code>f = deco(f)</code>. The name <code>f</code> now points at whatever <code>deco</code> returned, usually a wrapper that holds the original in its closure. The decorator runs once at definition time; the wrapper runs on every call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a decorator that logs a function's name and arguments.</summary><div class="qa-body"><div class="fx" data-lang="py">def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"{func.__name__}{args} {kwargs}")
        return func(*args, **kwargs)
    return wrapper

@log_calls
def area(w, h=1): return w * h
area(3, h=4)        # prints: area(3,) {'h': 4}   returns 12</div></div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What breaks without <code>functools.wraps</code>?</summary><div class="qa-body"><code>__name__</code> becomes "wrapper", <code>__doc__</code> is lost, the signature shows <code>(*args, **kwargs)</code>. Logs and tracebacks are confusing, <code>help()</code> is useless, frameworks that inspect signatures (FastAPI, pytest, Flask endpoint names) misbehave, and there is no <code>__wrapped__</code> to reach the original in tests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a decorator with arguments need three nested functions?</summary><div class="qa-body"><code>@retry(times=3)</code> first <em>calls</em> <code>retry(times=3)</code>; that call must return the real decorator, which takes <code>func</code> and returns the wrapper. Factory (options) → decorator (function) → wrapper (call arguments).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In what order do stacked decorators apply and run?</summary><div class="qa-body"><code>@a @b def f</code> means <code>f = a(b(f))</code>: b wraps first (bottom-up), but at call time a's wrapper runs first (outside-in). E.g. <code>@timer</code> above <code>@retry</code> times all attempts together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is <code>lru_cache</code> a bad idea?</summary><div class="qa-body">Impure functions (depend on time, DB, randomness: results go stale), unhashable arguments (lists, dicts, DataFrames → TypeError), unbounded <code>maxsize=None</code> with many distinct inputs (memory grows), and instance methods (the cache keeps <code>self</code> alive).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>__exit__</code> receive and what does its return value mean?</summary><div class="qa-body">Exception type, value and traceback, all <code>None</code> if the block succeeded. Returning a truthy value suppresses the exception; <code>False</code>/<code>None</code> lets it continue. It runs on every exit path: normal end, return, break, exception.</div></details>
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
